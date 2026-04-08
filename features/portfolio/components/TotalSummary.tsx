import React from 'react';
import HiddenAmount from '../../../components/HiddenAmount';
import { currency } from '../../../lib/format';

type Props = {
  privacy: boolean;
  animatedTotal: number;
  updatedAt: string;
};

export default function TotalSummary({
  privacy,
  animatedTotal,
  updatedAt: _updatedAt,
}: Props) {
  return (
    <section className="text-center md:text-left">
      <div
        id="totalValue"
        className="tabular-nums flex items-center justify-center md:justify-start text-[clamp(24px,8vw,36px)] sm:text-5xl md:text-[clamp(28px,3.2vw,40px)] lg:text-[44px] font-semibold leading-tight md:leading-[1.1] tracking-[-0.02em] text-gray-900 whitespace-nowrap overflow-hidden transition-all duration-300 h-[40px] sm:h-[56px] lg:h-[56px]"
      >
        {' '}
        {privacy ? (
          <HiddenAmount
            sizeClass="h-4 w-4"
            justifyClass="justify-center md:justify-start"
            heightClass="h-[1.3em]"
            lineHeightClass="leading-[1.2]"
            minWidthClass="min-w-[140px]"
          />
        ) : (
          currency(animatedTotal)
        )}
      </div>
    </section>
  );
}
