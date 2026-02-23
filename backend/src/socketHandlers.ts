import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./types";
import {
  getRoom,
  createRoom,
  addPlayer,
  removePlayer,
  getParticipants,
  allPlayersAnswered,
} from "./roomManager";
import { loadQuestions, startQuiz, tryEndQuestionEarly } from "./quizEngine";
import { isLateAnswer } from "./scoring";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

// Track which room each socket is in for disconnect cleanup
const socketRoomMap = new Map<string, string>();

export function registerHandlers(io: IOServer, prisma: PrismaClient): void {
  io.on("connection", (socket: IOSocket) => {
    socket.on("room:join", ({ roomId, nickname }) => {
      // Create room if it doesn't exist; use provided roomId or generate one
      const actualRoomId = roomId || nanoid(8);
      let room = getRoom(actualRoomId);
      if (!room) {
        room = createRoom(actualRoomId);
      }

      // If player is already in another room, leave it first
      const prevRoomId = socketRoomMap.get(socket.id);
      if (prevRoomId && prevRoomId !== actualRoomId) {
        const prevRoom = getRoom(prevRoomId);
        if (prevRoom) {
          removePlayer(prevRoom, socket.id);
          socket.leave(prevRoomId);
          io.to(prevRoomId).emit("room:state", {
            roomId: prevRoomId,
            participants: getParticipants(prevRoom),
            status: prevRoom.status,
          });
        }
      }

      const result = addPlayer(room, socket.id, nickname);
      if (!result.ok) {
        socket.emit("error", { message: result.reason });
        return;
      }

      socketRoomMap.set(socket.id, actualRoomId);
      socket.join(actualRoomId);

      // Broadcast updated room state to all players in room
      io.to(actualRoomId).emit("room:state", {
        roomId: actualRoomId,
        participants: getParticipants(room),
        status: room.status,
      });
    });

    socket.on("room:leave", ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room) return;

      removePlayer(room, socket.id);
      socketRoomMap.delete(socket.id);
      socket.leave(roomId);

      // Room may have been deleted if empty
      const updatedRoom = getRoom(roomId);
      if (updatedRoom) {
        io.to(roomId).emit("room:state", {
          roomId,
          participants: getParticipants(updatedRoom),
          status: updatedRoom.status,
        });

        // If a player left during play, remaining players may now all have answered
        checkAndAdvanceEarly(io, updatedRoom, prisma);
      }
    });

    socket.on("quiz:start", async ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found." });
        return;
      }

      if (room.status !== "lobby") {
        socket.emit("error", { message: "Quiz already started or finished." });
        return;
      }

      if (room.players.size < 1) {
        socket.emit("error", { message: "Need at least 1 player to start." });
        return;
      }

      const questions = await loadQuestions(prisma);
      if (questions.length === 0) {
        socket.emit("error", { message: "No questions loaded. Run seed first." });
        return;
      }

      startQuiz(io, room, questions, prisma);
    });

    socket.on("answer:submit", ({ roomId, questionIndex, optionId }) => {
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found." });
        return;
      }

      if (room.status !== "playing") {
        socket.emit("error", { message: "Quiz is not in progress." });
        return;
      }

      if (questionIndex !== room.currentQuestionIndex) {
        socket.emit("error", { message: "Wrong question index." });
        return;
      }

      const player = room.players.get(socket.id);
      if (!player) {
        socket.emit("error", { message: "You are not in this room." });
        return;
      }

      // One answer per player per question
      if (player.answers.has(questionIndex)) {
        socket.emit("error", { message: "Already answered this question." });
        return;
      }

      const serverReceivedAt = Date.now();

      // Reject late answers
      if (isLateAnswer(serverReceivedAt, room.questionEndAt)) {
        socket.emit("error", { message: "Answer submitted too late." });
        return;
      }

      player.answers.set(questionIndex, {
        optionId,
        serverReceivedAt,
      });

      // Check if all players have now answered → advance early
      checkAndAdvanceEarly(io, room, prisma);
    });

    socket.on("disconnect", () => {
      const roomId = socketRoomMap.get(socket.id);
      if (!roomId) return;

      const room = getRoom(roomId);
      if (room) {
        const wasPlaying = room.status === "playing";
        removePlayer(room, socket.id);

        const updatedRoom = getRoom(roomId);
        if (updatedRoom) {
          io.to(roomId).emit("room:state", {
            roomId,
            participants: getParticipants(updatedRoom),
            status: updatedRoom.status,
          });

          // Disconnected player is removed — remaining may all have answered
          if (wasPlaying) {
            checkAndAdvanceEarly(io, updatedRoom, prisma);
          }
        }
      }
      socketRoomMap.delete(socket.id);
    });
  });
}

/** If all active players have answered, end the question early. */
async function checkAndAdvanceEarly(
  io: IOServer,
  room: ReturnType<typeof getRoom> & {},
  prisma: PrismaClient
): Promise<void> {
  if (room.status !== "playing") return;
  if (!allPlayersAnswered(room)) return;

  const questions = await loadQuestions(prisma);
  tryEndQuestionEarly(io, room, questions, prisma);
}
