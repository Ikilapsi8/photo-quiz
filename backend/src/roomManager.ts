import { RoomState, PlayerState } from "./types";

const MAX_PLAYERS = 10;
const NICKNAME_MAX_LENGTH = 20;

const rooms = new Map<string, RoomState>();

export function getRoom(roomId: string): RoomState | undefined {
  return rooms.get(roomId);
}

export function getAllRooms(): Map<string, RoomState> {
  return rooms;
}

export function createRoom(roomId: string): RoomState {
  const room: RoomState = {
    roomId,
    status: "lobby",
    players: new Map(),
    currentQuestionIndex: -1,
    questionStartAt: 0,
    questionEndAt: 0,
    questionRevealed: false,
    questionTimer: null,
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return room;
}

export function deleteRoom(roomId: string): void {
  const room = rooms.get(roomId);
  if (room?.questionTimer) {
    clearTimeout(room.questionTimer);
  }
  rooms.delete(roomId);
}

function sanitizeNickname(nickname: string): string {
  return nickname.replace(/[^\w\s-]/g, "").trim().slice(0, NICKNAME_MAX_LENGTH) || "Player";
}

function makeUniqueNickname(room: RoomState, nickname: string): string {
  const existing = new Set(
    Array.from(room.players.values()).map((p) => p.nickname)
  );
  if (!existing.has(nickname)) return nickname;

  let suffix = 2;
  while (existing.has(`${nickname}#${suffix}`)) suffix++;
  return `${nickname}#${suffix}`;
}

export function addPlayer(
  room: RoomState,
  socketId: string,
  rawNickname: string
): { ok: true; player: PlayerState } | { ok: false; reason: string } {
  if (room.players.size >= MAX_PLAYERS) {
    return { ok: false, reason: "Room is full (max 10 players)." };
  }

  if (room.status === "playing") {
    return { ok: false, reason: "Quiz is already in progress." };
  }

  const sanitized = sanitizeNickname(rawNickname);
  const nickname = makeUniqueNickname(room, sanitized);

  const player: PlayerState = {
    id: socketId,
    nickname,
    totalScore: 0,
    answers: new Map(),
  };

  room.players.set(socketId, player);
  return { ok: true, player };
}

export function removePlayer(room: RoomState, socketId: string): void {
  room.players.delete(socketId);

  // Clean up empty rooms
  if (room.players.size === 0) {
    deleteRoom(room.roomId);
  }
}

export function getParticipants(room: RoomState) {
  return Array.from(room.players.values()).map((p) => ({
    id: p.id,
    nickname: p.nickname,
  }));
}

/** Returns true if every active player in the room has answered the current question. */
export function allPlayersAnswered(room: RoomState): boolean {
  if (room.status !== "playing" || room.players.size === 0) return false;
  const idx = room.currentQuestionIndex;
  for (const player of room.players.values()) {
    if (!player.answers.has(idx)) return false;
  }
  return true;
}
