'use client';

import { useEffect } from 'react';

interface Props {
  delta: number;
  onDone?: () => void;
}

/**
 * Floats a points delta (+150, -0, etc.) over the screen and fades out.
 * Calls onDone after the animation completes so parent can clear the value.
 */
export function PointsFeedback({ delta, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 1_700);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (delta === 0) return null;

  const isPositive = delta > 0;

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className={[
          'text-6xl font-black tabular-nums select-none animate-float-up',
          isPositive ? 'text-green-400' : 'text-red-400',
        ].join(' ')}
        style={{
          textShadow: isPositive
            ? '0 0 40px rgba(74,222,128,0.6), 0 4px 16px rgba(0,0,0,0.6)'
            : '0 0 40px rgba(248,113,113,0.5), 0 4px 16px rgba(0,0,0,0.6)',
        }}
      >
        {isPositive ? '+' : ''}
        {delta}
      </span>
    </div>
  );
}
