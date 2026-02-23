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
  questionIndex: number;
  totalQuestions?: number;
}

export function BottomSheetOptions({
  prompt,
  options,
  selectedOptionId,
  correctOptionId,
  isLocked,
  onSelect,
  questionIndex,
  totalQuestions = 12,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Glassmorphism sheet */}
      <div
        className="px-4 pt-4 pb-6 backdrop-blur-2xl border-t border-white/10"
        style={{
          background: 'rgba(4,4,12,0.72)',
          paddingBottom: 'calc(1.5rem + var(--sab, 0px))',
        }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Question meta + prompt */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-1.5">
              Question {questionIndex + 1} / {totalQuestions}
            </p>
            <p
              id="question-prompt"
              className="text-base sm:text-lg font-semibold text-white leading-snug"
            >
              {prompt}
            </p>
          </div>

          {/* Options — 2×2 grid */}
          <div
            role="group"
            aria-labelledby="question-prompt"
            className="grid grid-cols-2 gap-2.5"
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
                    'relative flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-left',
                    'border transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
                    'disabled:cursor-default',
                    // State styles
                    optState === 'default' && [
                      'bg-white/8 border-white/15',
                      'hover:bg-white/12 hover:border-white/25',
                      'active:bg-white/5',
                    ],
                    optState === 'selected' && [
                      'bg-violet-600/35 border-violet-400/70',
                      'shadow-lg shadow-violet-900/20',
                    ],
                    optState === 'correct' && [
                      'bg-green-500/25 border-green-400/80',
                      'shadow-md shadow-green-900/20',
                    ],
                    optState === 'wrong-selected' && [
                      'bg-red-500/25 border-red-400/80',
                    ],
                    optState === 'wrong' && [
                      'bg-white/4 border-white/8 opacity-45',
                    ],
                  )}
                >
                  {/* Letter badge */}
                  <span
                    className={cn(
                      'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-200',
                      optState === 'default' && 'bg-white/15 text-white/80',
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
                      'flex-1 font-medium text-sm leading-tight',
                      optState === 'wrong' ? 'text-white/45' : 'text-white',
                    )}
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

          {/* Waiting for reveal hint */}
          {isLocked && !correctOptionId && (
            <p
              role="status"
              aria-live="polite"
              className="text-center text-white/30 text-xs mt-3"
            >
              Waiting for results…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
