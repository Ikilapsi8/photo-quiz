import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import {
  RoomState,
  QuestionData,
  Option,
  ScoreDelta,
  LeaderboardEntry,
  ServerToClientEvents,
  ClientToServerEvents,
} from "./types";
import { computeScoreDelta } from "./scoring";
import { getParticipants } from "./roomManager";

const QUESTION_DURATION_MS = 10_000;
const INTERMISSION_MS = 2_000;
const TOTAL_QUESTIONS = 12;

let cachedQuestions: QuestionData[] | null = null;

export async function loadQuestions(prisma: PrismaClient): Promise<QuestionData[]> {
  if (cachedQuestions) return cachedQuestions;

  const rows = await prisma.question.findMany({ orderBy: { index: "asc" } });
  cachedQuestions = rows.map((r) => ({
    id: r.id,
    imageUrl: r.imageUrl,
    prompt: r.prompt,
    options: JSON.parse(r.optionsJson) as Option[],
  }));
  return cachedQuestions;
}

export async function getCorrectOptionId(
  prisma: PrismaClient,
  questionIndex: number
): Promise<string | null> {
  const q = await prisma.question.findUnique({ where: { index: questionIndex } });
  return q?.correctOptionId ?? null;
}

export function startQuiz(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  room: RoomState,
  questions: QuestionData[],
  prisma: PrismaClient
): void {
  room.status = "playing";
  room.currentQuestionIndex = 0;

  const startAt = Date.now();

  io.to(room.roomId).emit("quiz:started", {
    roomId: room.roomId,
    startAt,
    totalQuestions: TOTAL_QUESTIONS,
    questionDurationMs: QUESTION_DURATION_MS,
    intermissionMs: INTERMISSION_MS,
  });

  sendQuestion(io, room, questions, prisma);
}

function sendQuestion(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  room: RoomState,
  questions: QuestionData[],
  prisma: PrismaClient
): void {
  const idx = room.currentQuestionIndex;
  if (idx >= TOTAL_QUESTIONS || idx >= questions.length) {
    finishQuiz(io, room);
    return;
  }

  const question = questions[idx];
  const now = Date.now();
  room.questionStartAt = now;
  room.questionEndAt = now + QUESTION_DURATION_MS;
  room.questionRevealed = false; // reset guard for new question

  io.to(room.roomId).emit("quiz:question", {
    roomId: room.roomId,
    questionIndex: idx,
    totalQuestions: TOTAL_QUESTIONS,
    question,
    questionStartAt: room.questionStartAt,
    questionEndAt: room.questionEndAt,
  });

  // Schedule reveal after question duration (fallback timer)
  room.questionTimer = setTimeout(() => {
    revealAndAdvance(io, room, questions, prisma);
  }, QUESTION_DURATION_MS);
}

/**
 * Called when all players have answered early.
 * Cancels the fallback timer and triggers reveal immediately.
 */
export function tryEndQuestionEarly(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  room: RoomState,
  questions: QuestionData[],
  prisma: PrismaClient
): void {
  // Idempotent: if already revealed, do nothing
  if (room.questionRevealed) return;

  // Cancel the fallback timer
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  revealAndAdvance(io, room, questions, prisma);
}

async function revealAndAdvance(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  room: RoomState,
  questions: QuestionData[],
  prisma: PrismaClient
): Promise<void> {
  // Idempotent guard: prevent double-reveal from both timer and early-end
  if (room.questionRevealed) return;
  room.questionRevealed = true;

  const idx = room.currentQuestionIndex;
  const correctOptionId = await getCorrectOptionId(prisma, idx);
  if (!correctOptionId) return;

  // Compute scores for all players
  const scoresDelta: ScoreDelta[] = [];

  for (const player of room.players.values()) {
    const answer = player.answers.get(idx);
    let delta = 0;

    if (answer) {
      const isCorrect = answer.optionId === correctOptionId;
      const responseTimeMs = answer.serverReceivedAt - room.questionStartAt;
      delta = computeScoreDelta(isCorrect, responseTimeMs, QUESTION_DURATION_MS);
    }

    player.totalScore += delta;
    scoresDelta.push({
      playerId: player.id,
      delta,
      total: player.totalScore,
    });
  }

  io.to(room.roomId).emit("quiz:reveal", {
    roomId: room.roomId,
    questionIndex: idx,
    totalQuestions: TOTAL_QUESTIONS,
    correctOptionId,
    scoresDelta,
  });

  room.currentQuestionIndex++;

  if (room.currentQuestionIndex >= TOTAL_QUESTIONS || room.currentQuestionIndex >= questions.length) {
    // Wait for intermission then finish
    room.questionTimer = setTimeout(() => {
      finishQuiz(io, room);
    }, INTERMISSION_MS);
  } else {
    // Wait for intermission then send next question
    room.questionTimer = setTimeout(() => {
      sendQuestion(io, room, questions, prisma);
    }, INTERMISSION_MS);
  }
}

function finishQuiz(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  room: RoomState
): void {
  room.status = "finished";
  room.questionTimer = null;

  const leaderboard: LeaderboardEntry[] = Array.from(room.players.values())
    .map((p) => ({
      playerId: p.id,
      nickname: p.nickname,
      total: p.totalScore,
    }))
    .sort((a, b) => b.total - a.total);

  io.to(room.roomId).emit("quiz:finished", {
    roomId: room.roomId,
    leaderboard,
  });

  // Reset room to lobby after a short delay so players can see results
  setTimeout(() => {
    room.status = "lobby";
    room.currentQuestionIndex = -1;
    for (const player of room.players.values()) {
      player.totalScore = 0;
      player.answers.clear();
    }
    io.to(room.roomId).emit("room:state", {
      roomId: room.roomId,
      participants: getParticipants(room),
      status: room.status,
    });
  }, 5000);
}

export { QUESTION_DURATION_MS, INTERMISSION_MS, TOTAL_QUESTIONS };
