'use client';

import { useState } from 'react';
import { useRoom } from '@/context/RoomContext';
import { Button } from './ui/Button';
import { getRoomUrl, copyToClipboard } from '@/lib/utils';

export function Lobby() {
  const { state, startQuiz } = useRoom();
  const { participants, roomId, myId, connected } = state;
  const [copied, setCopied] = useState(false);

  const shareUrl = getRoomUrl(roomId);

  const handleCopy = async () => {
    await copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };

  const canStart = participants.length >= 1 && connected;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/25 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            <span className="text-green-400 text-xs font-medium">Lobby</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Waiting for players</h1>
          <p className="text-white/40 text-sm">
            Room code:{' '}
            <span className="font-mono text-white/70 font-semibold tracking-widest">{roomId}</span>
          </p>
        </div>

        {/* Share link */}
        <div className="mb-5 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
            Invite link
          </p>
          <div className="flex items-center gap-2">
            <p className="flex-1 text-sm text-white/60 font-mono truncate min-w-0">{shareUrl}</p>
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/5 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label={copied ? 'Copied!' : 'Copy invite link'}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="mb-6">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
            Players ({participants.length} / 10)
          </p>

          <div
            className="flex flex-col gap-2 max-h-64 overflow-y-auto"
            role="list"
            aria-label="Players in lobby"
          >
            {participants.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-6">
                No one here yet — share the link!
              </p>
            ) : (
              participants.map((p) => (
                <div
                  key={p.id}
                  role="listitem"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 animate-fade-in"
                >
                  {/* Avatar */}
                  <span
                    className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
                    aria-hidden="true"
                  >
                    {p.nickname.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 font-medium text-white text-sm truncate">
                    {p.nickname}
                  </span>
                  {p.id === myId && (
                    <span className="text-xs text-violet-400 font-semibold shrink-0">You</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Start */}
        <Button onClick={startQuiz} disabled={!canStart} size="lg" className="w-full">
          Start Quiz
        </Button>
        <p className="text-center text-white/25 text-xs mt-3">
          Anyone in the room can start the quiz
        </p>
      </div>
    </main>
  );
}
