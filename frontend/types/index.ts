// ─── Domain ───────────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  nickname: string;
}

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  imageUrl: string;
  prompt: string;
  options: QuestionOption[];
}

export type RoomStatus = 'lobby' | 'running' | 'finished';

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

// ─── Client → Server payloads ────────────────────────────────────────────────

export interface JoinRoomPayload {
  roomId: string;
  nickname: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface StartQuizPayload {
  roomId: string;
}

export interface SubmitAnswerPayload {
  roomId: string;
  questionIndex: number;
  optionId: string;
  /** Date.now() at submission time */
  clientSentAt: number;
}

// ─── Server → Client payloads ────────────────────────────────────────────────

export interface RoomStatePayload {
  roomId: string;
  participants: Participant[];
  status: RoomStatus;
}

export interface QuizStartedPayload {
  roomId: string;
  startAt: number;
  questionDurationMs: number;
  intermissionMs: number;
}

export interface QuizQuestionPayload {
  roomId: string;
  questionIndex: number;
  question: Question;
  /** Server UTC ms — when this question's timer started */
  questionStartAt: number;
  /** Server UTC ms — when this question's timer ends */
  questionEndAt: number;
}

export interface QuizRevealPayload {
  roomId: string;
  questionIndex: number;
  correctOptionId: string;
  scoresDelta: ScoreDelta[];
  answeredStats?: {
    total: number;
    correct: number;
  };
}

export interface QuizFinishedPayload {
  roomId: string;
  leaderboard: LeaderboardEntry[];
}

export interface ErrorPayload {
  message: string;
}

// ─── Typed socket event maps ──────────────────────────────────────────────────

export interface ServerToClientEvents {
  'room:state': (payload: RoomStatePayload) => void;
  'quiz:started': (payload: QuizStartedPayload) => void;
  'quiz:question': (payload: QuizQuestionPayload) => void;
  'quiz:reveal': (payload: QuizRevealPayload) => void;
  'quiz:finished': (payload: QuizFinishedPayload) => void;
  error: (payload: ErrorPayload) => void;
}

export interface ClientToServerEvents {
  'room:join': (payload: JoinRoomPayload) => void;
  'room:leave': (payload: LeaveRoomPayload) => void;
  'quiz:start': (payload: StartQuizPayload) => void;
  'answer:submit': (payload: SubmitAnswerPayload) => void;
}
