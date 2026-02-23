'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomId } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LandingPage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreate = () => {
    const id = generateRoomId();
    router.push(`/room/${id}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinId.trim().toUpperCase();
    if (!trimmed) {
      setJoinError('Enter a room code');
      return;
    }
    if (trimmed.length < 4) {
      setJoinError('Room code is too short');
      return;
    }
    router.push(`/room/${trimmed}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div
          className="mb-6 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl select-none"
          style={{
            background: 'rgba(109,40,217,0.18)',
            border: '1px solid rgba(139,92,246,0.35)',
            boxShadow: '0 0 40px rgba(109,40,217,0.25)',
          }}
          aria-hidden="true"
        >
          📸
        </div>

        <h1 className="text-5xl font-black tracking-tight text-white mb-2 text-center">
          Photo Quiz
        </h1>
        <p className="text-white/40 text-base mb-10 text-center max-w-xs leading-relaxed">
          Test your eye for detail. Compete with friends in real-time.
        </p>

        <Button onClick={handleCreate} size="lg" className="w-full mb-5">
          Create a Room
        </Button>

        <div className="flex items-center gap-3 w-full mb-5" aria-hidden="true">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-sm">or join existing</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleJoin} className="flex gap-2 w-full" noValidate>
          <Input
            placeholder="Room code"
            value={joinId}
            onChange={(e) => {
              setJoinId(e.target.value.toUpperCase());
              setJoinError('');
            }}
            error={joinError}
            maxLength={8}
            className="flex-1 font-mono text-center uppercase tracking-widest"
            aria-label="Room code"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
          <Button type="submit" variant="secondary" size="md" className="shrink-0">
            Join
          </Button>
        </form>
      </div>

      <p className="absolute bottom-6 text-white/20 text-xs">Up to 10 players per room</p>
    </main>
  );
}
