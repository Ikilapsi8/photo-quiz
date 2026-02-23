'use client';

import { useState } from 'react';
import { useRoom } from '@/context/RoomContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function NicknameStep() {
  const { state, joinRoom } = useRoom();
  const [value, setValue] = useState(state.nickname ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a nickname');
      return;
    }
    if (trimmed.length > 20) {
      setError('Max 20 characters');
      return;
    }
    joinRoom(trimmed);
  };

  const isConnecting = state.connecting;
  const isDisconnected = !state.connected && !state.connecting;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center text-3xl mb-5 select-none"
            style={{
              background: 'rgba(109,40,217,0.18)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
            aria-hidden="true"
          >
            📸
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Photo Quiz</h1>
          <p className="text-white/40 text-sm">
            Room{' '}
            <span className="font-mono text-white/60 font-medium">{state.roomId}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="nickname"
            label="Your nickname"
            placeholder="e.g. QuizMaster99"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            error={error}
            autoFocus
            autoComplete="nickname"
            autoCapitalize="words"
            maxLength={20}
            aria-required="true"
          />
          <Button type="submit" size="lg" disabled={isConnecting || !value.trim()}>
            {isConnecting ? 'Connecting…' : 'Join Room'}
          </Button>
        </form>

        {isDisconnected && (
          <p role="status" className="mt-4 text-center text-red-400 text-xs">
            Could not connect — retrying…
          </p>
        )}
      </div>
    </main>
  );
}
