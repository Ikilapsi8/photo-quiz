'use client';

import { use } from 'react';
import { RoomProvider, useRoom } from '@/context/RoomContext';
import { NicknameStep } from '@/components/NicknameStep';
import { Lobby } from '@/components/Lobby';
import { QuizView } from '@/components/QuizView';
import { Leaderboard } from '@/components/Leaderboard';

function RoomContent() {
  const { state } = useRoom();

  return (
    <>
      {/* Error toast */}
      {state.error && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed z-[100] left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-red-500/95 backdrop-blur-md text-white text-sm font-semibold shadow-2xl animate-fade-in"
          style={{ top: 'calc(1.25rem + var(--sat))' }}
        >
          {state.error}
        </div>
      )}

      {/* Reconnecting banner */}
      {!state.connected && !state.connecting && state.phase !== 'nickname' && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[90] py-1.5 bg-amber-500/95 text-black text-xs font-semibold text-center"
        >
          Connection lost — reconnecting…
        </div>
      )}

      {state.phase === 'nickname' && <NicknameStep />}
      {state.phase === 'lobby' && <Lobby />}
      {state.phase === 'quiz' && <QuizView />}
      {state.phase === 'finished' && <Leaderboard />}
    </>
  );
}

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);

  return (
    <RoomProvider roomId={roomId}>
      <RoomContent />
    </RoomProvider>
  );
}
