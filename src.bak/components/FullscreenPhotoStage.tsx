'use client';

import { useState } from 'react';

interface Props {
  imageUrl: string;
  alt?: string;
}

export function FullscreenPhotoStage({ imageUrl, alt = 'Quiz question photo' }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="fixed inset-0 bg-black" aria-hidden="true">
      {/* Skeleton loader */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 animate-pulse" />
      )}

      {/* Photo — native img for zero-config remote URLs */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        onLoad={() => setLoaded(true)}
        draggable={false}
        className={[
          'absolute inset-0 w-full h-full object-cover',
          'transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      {/* Bottom vignette so bottom-sheet blends naturally */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.1) 60%, transparent 100%)',
        }}
      />

      {/* Subtle top vignette for timer readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 18%)',
        }}
      />
    </div>
  );
}
