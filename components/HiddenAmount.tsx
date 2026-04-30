import React from 'react';
import { EyeOff } from 'lucide-react';

interface HiddenAmountProps {
  className?: string;
  iconClassName?: string;
  count?: number;
}

/**
 * A component that displays a masked amount using icons.
 * The icons automatically scale with the parent's font size using 'em' units.
 */
export default function HiddenAmount({
  className = '',
  iconClassName = '',
  count = 3,
}: HiddenAmountProps) {
  return (
    <span
      className={`inline-flex items-center gap-[0.2em] leading-none ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <EyeOff
          key={i}
          className={`h-[0.8em] w-[0.8em] text-current opacity-30 ${iconClassName}`}
          strokeWidth={2.5}
        />
      ))}
    </span>
  );
}

/**
 * A simpler dot-based mask for tighter spaces.
 */
export function HiddenDot({
  count = 3,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-[0.1em] leading-none ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-[0.4em] w-[0.4em] rounded-full bg-current opacity-30"
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
        />
      ))}
    </span>
  );
}
