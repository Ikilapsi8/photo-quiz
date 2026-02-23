'use client';

import { useRoom } from '@/context/RoomContext';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

/** Ordinal suffix for rank label */
function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

const TOP_COLORS = [
  // 1st — gold
  {
    badge: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30',
    row: 'bg-yellow-400/5 border-yellow-400/20',
  },
  // 2nd — silver
  {
    badge: 'bg-gray-300/10 text-gray-300 border-gray-400/25',
    row: 'bg-white/5 border-white/12',
  },
  // 3rd — bronze
  {
    badge: 'bg-amber-600/15 text-amber-400 border-amber-500/30',
    row: 'bg-amber-600/5 border-amber-600/20',
  },
] as const;

interface RowProps {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
}

function LeaderboardRow({ entry, rank, isMe }: RowProps) {
  const colors = TOP_COLORS[rank - 1];
  const isTop3 = rank <= 3;

  return (
    <li
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all animate-fade-in',
        isMe && 'ring-1 ring-violet-500/50',
        isTop3 && colors ? colors.row : 'bg-white/4 border-white/10',
      )}
    >
      {/* Rank badge */}
      <span
        className={cn(
          'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border',
          isTop3 && colors ? colors.badge : 'bg-white/8 text-white/40 border-white/10',
        )}
        aria-label={`Rank ${rank}`}
      >
        {ordinal(rank)}
      </span>

      {/* Avatar */}
      <span
        className="w-8 h-8 rounded-full bg-violet-700/60 flex items-center justify-center text-sm font-bold text-white shrink-0 select-none"
        aria-hidden="true"
      >
        {entry.nickname.charAt(0).toUpperCase()}
      </span>

      {/* Nickname */}
      <span className="flex-1 font-semibold text-white text-sm truncate">
        {entry.nickname}
        {isMe && (
          <span className="ml-2 text-xs font-normal text-violet-400" aria-label="(you)">
            You
          </span>
        )}
      </span>

      {/* Score */}
      <span className="font-bold text-white tabular-nums text-sm shrink-0">
        {entry.total.toLocaleString()}
      </span>
    </li>
  );
}

export function Leaderboard() {
  const { state } = useRoom();
  const { leaderboard, myId } = state;

  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center text-3xl mb-4 select-none"
            style={{
              background: 'rgba(234,179,8,0.15)',
              border: '1px solid rgba(234,179,8,0.3)',
            }}
            aria-hidden="true"
          >
            🏆
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Final Results</h1>
          <p className="text-white/40 text-sm">Quiz complete!</p>
        </div>

        {/* Leaderboard list */}
        <ol className="flex flex-col gap-2 mb-8" aria-label="Final leaderboard">
          {leaderboard.length === 0 ? (
            <li className="text-center text-white/30 py-10 text-sm">No scores to show.</li>
          ) : (
            leaderboard.map((entry, i) => (
              <LeaderboardRow
                key={entry.playerId}
                entry={entry}
                rank={i + 1}
                isMe={entry.playerId === myId}
              />
            ))
          )}
        </ol>

        <Button onClick={handlePlayAgain} size="lg" className="w-full">
          Play Again
        </Button>
      </div>
    </main>
  );
}
