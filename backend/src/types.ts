// ─── Shared types for Socket.IO events and payloads ───

export interface Option {
  id: string;
  label: string;
}

export interface QuestionData {
  id: number;
  imageUrl: string;
  prompt: string;
  options: Option[];
}

export type RoomStatus = "lobby" | "playing" | "finished";

export interface Participant {
  id: string; // socket.id
  nickname: string;
}

// ─── Client → Server events ───

export interface ClientToServerEvents {
  "room:join": (data: { roomId: string; nickname: string }) => void;
  "room:leave": (data: { roomId: string }) => void;
  "quiz:start": (data: { roomId: string }) => void;
  "answer:submit": (data: {
    roomId: string;
    questionIndex: number;
    optionId: string;
    clientSentAt: number;
  }) => void;
}

// ─── Server → Client events ───

export interface ScoreDelta {
  playerId: string;
  delta: number;
  total: number;
}

export interface LeaderboardEntry {
  playerId: string;
  nickname: string;
  total: number;
}

export interface ServerToClientEvents {
  "room:state": (data: {
    roomId: string;
    participants: Participant[];
    status: RoomStatus;
  }) => void;
  "quiz:started": (data: {
    roomId: string;
    startAt: number;
    totalQuestions: number;
    questionDurationMs: number;
    intermissionMs: number;
  }) => void;
  "quiz:question": (data: {
    roomId: string;
    questionIndex: number;
    totalQuestions: number;
    question: QuestionData;
    questionStartAt: number;
    questionEndAt: number;
  }) => void;
  "quiz:reveal": (data: {
    roomId: string;
    questionIndex: number;
    totalQuestions: number;
    correctOptionId: string;
    scoresDelta: ScoreDelta[];
  }) => void;
  "quiz:finished": (data: {
    roomId: string;
    leaderboard: LeaderboardEntry[];
  }) => void;
  error: (data: { message: string }) => void;
}

// ─── In-memory room state ───

export interface PlayerAnswer {
  optionId: string;
  serverReceivedAt: number;
}

export interface PlayerState {
  id: string;
  nickname: string;
  totalScore: number;
  answers: Map<number, PlayerAnswer>; // questionIndex → answer
}

export interface RoomState {
  roomId: string;
  status: RoomStatus;
  players: Map<string, PlayerState>; // socketId → state
  currentQuestionIndex: number;
  questionStartAt: number;
  questionEndAt: number;
  questionRevealed: boolean; // idempotent guard: true once reveal has fired for current question
  questionTimer: ReturnType<typeof setTimeout> | null;
  createdAt: number;
}
