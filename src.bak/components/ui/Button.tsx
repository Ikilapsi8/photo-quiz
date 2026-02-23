import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 select-none',
        // Focus
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        // Disabled
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        // Variants
        variant === 'primary' && [
          'bg-violet-600 text-white',
          'hover:bg-violet-500 active:bg-violet-700',
          'shadow-lg shadow-violet-900/30',
        ],
        variant === 'secondary' && [
          'bg-white/10 text-white border border-white/20',
          'hover:bg-white/15 hover:border-white/30 active:bg-white/5',
        ],
        variant === 'ghost' && [
          'text-white/60 hover:text-white',
          'hover:bg-white/8 active:bg-white/5',
        ],
        // Sizes
        size === 'sm' && 'px-3.5 py-2 text-sm gap-1.5',
        size === 'md' && 'px-5 py-2.5 text-base gap-2',
        size === 'lg' && 'px-7 py-3.5 text-base font-bold gap-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
