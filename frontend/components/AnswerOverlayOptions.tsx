'use client';

import { cn } from '@/lib/utils';
import type { QuestionOption } from '@/types';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

type OptionState = 'default' | 'selected' | 'correct' | 'wrong-selected' | 'wrong';

function getOptionState(
  optionId: string,
  selectedOptionId: string | null,
  correctOptionId: string | null | undefined,
  isLocked: boolean,
): OptionState {
  if (!isLocked || !correctOptionId) {
    return selectedOptionId === optionId ? 'selected' : 'default';
  }
  if (optionId === correctOptionId) return 'correct';
  if (optionId === selectedOptionId) return 'wrong-selected';
  return 'wrong';
}

interface Props {
  prompt: string;
  options: QuestionOption[];
  selectedOptionId: string | null;
  correctOptionId?: string | null;
  isLocked: boolean;
  onSelect: (optionId: string) => void;
}

export function AnswerOverlayOptions({
  prompt,
  options,
  selectedOptionId,
  correctOptionId,
  isLocked,
  onSelect,
}: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
      style={{ paddingBottom: 'calc(1rem + var(--sab, 0px))' }}
    >
      {/* Prompt — floating label above buttons */}
      <p
        id="question-prompt"
        className="pointer-events-none px-5 pb-3 text-center text-base sm:text-lg font-semibold text-white max-w-2xl mx-auto leading-snug"
        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6)' }}
      >
        {prompt}
      </p>

      {/* 2×2 grid of glass buttons */}
      <div
        role="group"
        aria-labelledby="question-prompt"
        className="pointer-events-auto grid grid-cols-2 gap-2.5 px-4 max-w-2xl mx-auto"
      >
        {options.map((opt, idx) => {
          const optState = getOptionState(opt.id, selectedOptionId, correctOptionId, isLocked);
          const label = OPTION_LABELS[idx] ?? String(idx + 1);

          return (
            <button
              key={opt.id}
              onClick={() => !isLocked && onSelect(opt.id)}
              disabled={isLocked}
              aria-pressed={selectedOptionId === opt.id}
              aria-label={`Option ${label}: ${opt.label}`}
              className={cn(
                'relative flex items-center gap-2.5 px-3.5 py-3.5 rounded-2xl text-left',
                'border backdrop-blur-xl transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
                'disabled:cursor-default',
                // ─ State styles ─
                optState === 'default' && [
                  'bg-black/35 border-white/20',
                  'hover:bg-black/45 hover:border-white/35',
                  'active:bg-black/55',
                ],
                optState === 'selected' && [
                  'bg-violet-600/40 border-violet-400/70',
                  'shadow-lg shadow-violet-900/30',
                ],
                optState === 'correct' && [
                  'bg-green-500/35 border-green-400/80',
                  'shadow-md shadow-green-900/30',
                ],
                optState === 'wrong-selected' && [
                  'bg-red-500/35 border-red-400/80',
                ],
                optState === 'wrong' && [
                  'bg-black/20 border-white/8 opacity-40',
                ],
              )}
            >
              {/* Letter badge */}
              <span
                className={cn(
                  'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-200',
                  optState === 'default' && 'bg-white/20 text-white',
                  optState === 'selected' && 'bg-violet-500 text-white',
                  optState === 'correct' && 'bg-green-500 text-white',
                  optState === 'wrong-selected' && 'bg-red-500 text-white',
                  optState === 'wrong' && 'bg-white/10 text-white/40',
                )}
                aria-hidden="true"
              >
                {label}
              </span>

              {/* Option text */}
              <span
                className={cn(
                  'flex-1 font-semibold text-sm leading-tight',
                  optState === 'wrong' ? 'text-white/40' : 'text-white',
                )}
                style={
                  optState !== 'wrong'
                    ? { textShadow: '0 1px 4px rgba(0,0,0,0.5)' }
                    : undefined
                }
              >
                {opt.label}
              </span>

              {/* Result indicator */}
              {optState === 'correct' && (
                <span className="ml-auto text-green-400 font-bold text-base" aria-hidden="true">
                  ✓
                </span>
              )}
              {optState === 'wrong-selected' && (
                <span className="ml-auto text-red-400 font-bold text-base" aria-hidden="true">
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Waiting hint */}
      {isLocked && !correctOptionId && (
        <p
          role="status"
          aria-live="polite"
          className="pointer-events-none text-center text-white/40 text-xs mt-3"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          Waiting for results…
        </p>
      )}
    </div>
  );
}
