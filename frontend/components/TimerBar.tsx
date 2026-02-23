'use client';

import { useEffect, useRef } from 'react';

interface Props {
  startAt: number;
  endAt: number;
  onEnd?: () => void;
}

/**
 * Deterministic progress bar driven by requestAnimationFrame.
 * Updates the DOM directly for maximum smoothness.
 */
export function TimerBar({ startAt, endAt, onEnd }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (!startAt || !endAt || endAt <= startAt) return;

    let rafId: number;
    let fired = false;

    const tick = () => {
      const now = Date.now();
      const total = endAt - startAt;
      const elapsed = now - startAt;
      const progress = Math.min(Math.max(elapsed / total, 0), 1);
      const remaining = 1 - progress;

      if (barRef.current) {
        barRef.current.style.width = `${remaining * 100}%`;
        if (remaining < 0.15) {
          barRef.current.style.backgroundColor = '#ef4444';
        } else if (remaining < 0.35) {
          barRef.current.style.backgroundColor = '#f59e0b';
        } else {
          barRef.current.style.backgroundColor = '#7c3aed';
        }
      }

      if (containerRef.current) {
        containerRef.current.setAttribute('aria-valuenow', String(Math.round(remaining * 100)));
      }

      if (progress >= 1) {
        if (!fired) {
          fired = true;
          onEndRef.current?.();
        }
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [startAt, endAt]);

  return (
    <div
      ref={containerRef}
      role="progressbar"
      aria-label="Time remaining"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={100}
      className="fixed left-0 right-0 z-50"
      style={{ top: 'var(--sat, 0px)' }}
    >
      <div className="h-1.5 w-full bg-white/10">
        <div
          ref={barRef}
          className="h-full transition-colors duration-300"
          style={{
            width: '100%',
            backgroundColor: '#7c3aed',
            willChange: 'width',
          }}
        />
      </div>
    </div>
  );
}
