'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Returns a progress value [0, 1] driven by requestAnimationFrame,
 * based on server-provided start/end timestamps.
 */
export function useTimer(startAt: number, endAt: number, onEnd?: () => void): number {
  const [progress, setProgress] = useState<number>(() => {
    if (!startAt || !endAt || endAt <= startAt) return 0;
    return Math.min(Math.max((Date.now() - startAt) / (endAt - startAt), 0), 1);
  });

  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (!startAt || !endAt || endAt <= startAt) return;

    let rafId: number;
    let fired = false;

    const tick = () => {
      const now = Date.now();
      const p = Math.min(Math.max((now - startAt) / (endAt - startAt), 0), 1);
      setProgress(p);

      if (p >= 1) {
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

  return progress;
}
