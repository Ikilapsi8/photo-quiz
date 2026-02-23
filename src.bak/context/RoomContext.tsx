'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { getSocket } from '@/lib/socket';
import { NICKNAME_STORAGE_KEY } from '@/lib/utils';
import type {
  LeaderboardEntry,
  Participant,
  QuizQuestionPayload,
  QuizRevealPayload,
  RoomStatus,
} from '@/types';

// ─── State shape ─────────────────────────────────────────────────────────────

export type RoomPhase = 'nickname' | 'lobby' | 'quiz' | 'finished';

export interface RoomState {
  phase: RoomPhase;
  roomId: string;
  /** socket.id assigned by server */
  myId: string | null;
  nickname: string;
  participants: Participant[];
  status: RoomStatus;
  // Quiz
  currentQuestion: QuizQuestionPayload | null;
  questionIndex: number;
  selectedOptionId: string | null;
  isAnswerLocked: boolean;
  revealData: QuizRevealPayload | null;
  leaderboard: LeaderboardEntry[];
  questionDurationMs: number;
  intermissionMs: number;
  // Scoring
  myScore: number;
  /** Points earned on latest question — null when not showing */
  myDelta: number | null;
  // Connection
  error: string | null;
  connected: boolean;
  connecting: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED'; myId: string }
  | { type: 'DISCONNECTED' }
  | { type: 'SET_NICKNAME'; nickname: string }
  | { type: 'LOAD_SAVED_NICKNAME'; nickname: string }
  | { type: 'ROOM_STATE'; participants: Participant[]; status: RoomStatus }
  | { type: 'QUIZ_STARTED'; questionDurationMs: number; intermissionMs: number }
  | { type: 'QUIZ_QUESTION'; payload: QuizQuestionPayload }
  | { type: 'QUIZ_REVEAL'; payload: QuizRevealPayload; myId: string | null }
  | { type: 'QUIZ_FINISHED'; leaderboard: LeaderboardEntry[] }
  | { type: 'SUBMIT_ANSWER'; optionId: string }
  | { type: 'LOCK_ANSWER' }
  | { type: 'CLEAR_DELTA' }
  | { type: 'SET_ERROR'; message: string | null };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function makeInitialState(roomId: string): RoomState {
  return {
    phase: 'nickname',
    roomId,
    myId: null,
    nickname: '',
    participants: [],
    status: 'lobby',
    currentQuestion: null,
    questionIndex: -1,
    selectedOptionId: null,
    isAnswerLocked: false,
    revealData: null,
    leaderboard: [],
    questionDurationMs: 20_000,
    intermissionMs: 5_000,
    myScore: 0,
    myDelta: null,
    error: null,
    connected: false,
    connecting: false,
  };
}

function reducer(state: RoomState, action: Action): RoomState {
  switch (action.type) {
    case 'CONNECTING':
      return { ...state, connecting: true, connected: false };

    case 'CONNECTED':
      return { ...state, connecting: false, connected: true, myId: action.myId };

    case 'DISCONNECTED':
      return { ...state, connected: false, connecting: false };

    case 'LOAD_SAVED_NICKNAME':
      return { ...state, nickname: action.nickname, phase: 'lobby' };

    case 'SET_NICKNAME':
      return { ...state, nickname: action.nickname, phase: 'lobby' };

    case 'ROOM_STATE': {
      const { participants, status } = action;
      let phase = state.phase;
      // Don't overwrite nickname phase
      if (phase !== 'nickname') {
        if (status === 'lobby') phase = 'lobby';
        else if (status === 'running') phase = 'quiz';
        else if (status === 'finished') phase = 'finished';
      }
      return { ...state, participants, status, phase };
    }

    case 'QUIZ_STARTED':
      return {
        ...state,
        phase: 'quiz',
        questionDurationMs: action.questionDurationMs,
        intermissionMs: action.intermissionMs,
      };

    case 'QUIZ_QUESTION':
      return {
        ...state,
        phase: 'quiz',
        currentQuestion: action.payload,
        questionIndex: action.payload.questionIndex,
        selectedOptionId: null,
        isAnswerLocked: false,
        revealData: null,
        myDelta: null,
      };

    case 'QUIZ_REVEAL': {
      const myEntry = action.myId
        ? action.payload.scoresDelta.find((d) => d.playerId === action.myId)
        : null;
      return {
        ...state,
        revealData: action.payload,
        isAnswerLocked: true,
        myScore: myEntry?.total ?? state.myScore,
        myDelta: myEntry?.delta ?? null,
      };
    }

    case 'QUIZ_FINISHED':
      return { ...state, phase: 'finished', leaderboard: action.leaderboard };

    case 'SUBMIT_ANSWER':
      return { ...state, selectedOptionId: action.optionId, isAnswerLocked: true };

    case 'LOCK_ANSWER':
      return { ...state, isAnswerLocked: true };

    case 'CLEAR_DELTA':
      return { ...state, myDelta: null };

    case 'SET_ERROR':
      return { ...state, error: action.message };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface RoomContextValue {
  state: RoomState;
  joinRoom: (nickname: string) => void;
  startQuiz: () => void;
  submitAnswer: (optionId: string) => void;
  lockAnswer: () => void;
  clearDelta: () => void;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within RoomProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface RoomProviderProps {
  roomId: string;
  children: React.ReactNode;
}

export function RoomProvider({ roomId, children }: RoomProviderProps) {
  const [state, dispatch] = useReducer(reducer, roomId, makeInitialState);

  // Keep a ref to always have fresh state in async callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load saved nickname from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_STORAGE_KEY);
    if (saved?.trim()) {
      dispatch({ type: 'LOAD_SAVED_NICKNAME', nickname: saved.trim() });
    }
  }, []);

  // Socket lifecycle
  useEffect(() => {
    const socket = getSocket();
    dispatch({ type: 'CONNECTING' });
    socket.connect();

    socket.on('connect', () => {
      const myId = socket.id ?? '';
      dispatch({ type: 'CONNECTED', myId });
      // Re-join if we already have a nickname (reconnect scenario)
      const { nickname } = stateRef.current;
      if (nickname) {
        socket.emit('room:join', { roomId, nickname });
      }
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'DISCONNECTED' });
    });

    socket.on('room:state', ({ participants, status }) => {
      dispatch({ type: 'ROOM_STATE', participants, status });
    });

    socket.on('quiz:started', ({ questionDurationMs, intermissionMs }) => {
      dispatch({ type: 'QUIZ_STARTED', questionDurationMs, intermissionMs });
    });

    socket.on('quiz:question', (payload) => {
      dispatch({ type: 'QUIZ_QUESTION', payload });
    });

    socket.on('quiz:reveal', (payload) => {
      dispatch({ type: 'QUIZ_REVEAL', payload, myId: stateRef.current.myId });
    });

    socket.on('quiz:finished', ({ leaderboard }) => {
      dispatch({ type: 'QUIZ_FINISHED', leaderboard });
    });

    socket.on('error', ({ message }) => {
      dispatch({ type: 'SET_ERROR', message });
      setTimeout(() => dispatch({ type: 'SET_ERROR', message: null }), 4_000);
    });

    return () => {
      const { nickname } = stateRef.current;
      if (nickname) {
        socket.emit('room:leave', { roomId });
      }
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room:state');
      socket.off('quiz:started');
      socket.off('quiz:question');
      socket.off('quiz:reveal');
      socket.off('quiz:finished');
      socket.off('error');
      socket.disconnect();
    };
  }, [roomId]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const joinRoom = useCallback(
    (nickname: string) => {
      const trimmed = nickname.trim();
      localStorage.setItem(NICKNAME_STORAGE_KEY, trimmed);
      dispatch({ type: 'SET_NICKNAME', nickname: trimmed });
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('room:join', { roomId, nickname: trimmed });
      }
    },
    [roomId],
  );

  const startQuiz = useCallback(() => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('quiz:start', { roomId });
    }
  }, [roomId]);

  const submitAnswer = useCallback(
    (optionId: string) => {
      const { questionIndex, isAnswerLocked, selectedOptionId } = stateRef.current;
      if (isAnswerLocked || selectedOptionId) return;
      dispatch({ type: 'SUBMIT_ANSWER', optionId });
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('answer:submit', {
          roomId,
          questionIndex,
          optionId,
          clientSentAt: Date.now(),
        });
      }
    },
    [roomId],
  );

  const lockAnswer = useCallback(() => {
    dispatch({ type: 'LOCK_ANSWER' });
  }, []);

  const clearDelta = useCallback(() => {
    dispatch({ type: 'CLEAR_DELTA' });
  }, []);

  return (
    <RoomContext.Provider
      value={{ state, joinRoom, startQuiz, submitAnswer, lockAnswer, clearDelta }}
    >
      {children}
    </RoomContext.Provider>
  );
}
