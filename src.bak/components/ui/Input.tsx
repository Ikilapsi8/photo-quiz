import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-white/60">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-3 rounded-xl',
          'bg-white/8 border border-white/15',
          'text-white placeholder-white/25',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white/10',
          error && 'border-red-500/70 focus:ring-red-500',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={id ? `${id}-error` : undefined} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
