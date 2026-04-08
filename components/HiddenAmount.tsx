import React from 'react';
import Icon from './Icon';

interface HiddenAmountProps {
  sizeClass?: string;
  justifyClass?: string;
  heightClass?: string;
  lineHeightClass?: string;
  minWidthClass?: string;
}

export default function HiddenAmount({
  sizeClass = 'h-4 w-4',
  justifyClass = 'justify-start',
  heightClass = 'h-[1.2em]',
  lineHeightClass = 'leading-none',
  minWidthClass = 'min-w-[100px]',
}: HiddenAmountProps) {
  return (
    <div
      className={`flex items-center gap-1.5 ${justifyClass} ${heightClass} ${lineHeightClass} ${minWidthClass}`}
    >
      {[0, 1, 2].map((i) => (
        <Icon
          key={i}
          name="eye-closed"
          className={`${sizeClass} text-slate-300 opacity-40`}
        />
      ))}
    </div>
  );
}
