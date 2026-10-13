import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { currency } from '../../../../lib/format';
import {
  formatPrice,
  formatShares,
  parseNumberInput,
} from '../../../../lib/number';
import {
  sharesNeededForTarget,
  type AverageSummary,
} from '../../lib/averageCost';

type Props = {
  before: AverageSummary;
  after: AverageSummary & { addedShares: number; addedCost: number };
  currentPrice: number;
};

const Row = ({
  label,
  from,
  to,
  highlight = false,
}: {
  label: string;
  from: string;
  to: string;
  highlight?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <span className="text-[13px] font-bold text-slate-300">{label}</span>
    <span className="flex items-center gap-2 tabular-nums">
      <span className="text-[13px] font-bold text-slate-400">{from}</span>
      <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
      <span
        className={`text-[18px] font-black ${highlight ? 'text-emerald-400' : 'text-white'}`}
      >
        {to}
      </span>
    </span>
  </div>
);

export default function SimulationResult({
  before,
  after,
  currentPrice,
}: Props) {
  const [targetStr, setTargetStr] = useState('');
  const target = parseNumberInput(targetStr);
  const buyAt = currentPrice;
  const needed =
    target && buyAt > 0
      ? sharesNeededForTarget(before.shares, before.cost, buyAt, target)
      : undefined;

  return (
    <section className="bg-slate-900 rounded-[24px] p-5 md:p-6 text-white shadow-xl shadow-slate-900/10">
      <div className="text-[13px] font-black text-slate-300 mb-1">
        買進後試算
      </div>
      {after.addedShares === 0 ? (
        <p className="py-4 text-[13px] font-medium text-slate-400">
          輸入預計買進的股數與價格，這裡會顯示買進後的均價
        </p>
      ) : (
        <div className="divide-y divide-white/10">
          <Row
            label="持有股數"
            from={formatShares(before.shares)}
            to={formatShares(after.shares)}
          />
          <Row
            label="原始均價"
            from={formatPrice(before.avgCost)}
            to={formatPrice(after.avgCost)}
          />
          <Row
            label="除息後均價"
            from={formatPrice(before.adjustedAvg)}
            to={formatPrice(after.adjustedAvg)}
            highlight
          />
          <div className="flex items-center justify-between py-2.5 text-[13px] tabular-nums">
            <span className="font-bold text-slate-300">預計花費</span>
            <span className="font-black">{currency(after.addedCost)}</span>
          </div>
        </div>
      )}

      {currentPrice > 0 && before.shares > 0 && (
        <div className="mt-3 rounded-2xl bg-white/5 p-3.5">
          <label className="block text-[12px] font-bold text-slate-300 mb-1.5">
            想把原始均價壓到多少？（以現價 {formatPrice(currentPrice)} 買進）
          </label>
          <input
            inputMode="decimal"
            placeholder="目標均價"
            value={targetStr}
            onChange={(e) => setTargetStr(e.target.value)}
            className="w-full rounded-xl bg-white/10 px-3.5 py-2.5 text-[15px] font-bold text-white placeholder:text-slate-500 tabular-nums outline-none focus:ring-2 focus:ring-white/40"
          />
          {needed !== undefined && (
            <p className="mt-2 text-[13px] font-bold tabular-nums text-slate-200">
              {needed === null
                ? '以現價買進無法把均價壓到這個數字'
                : needed === 0
                  ? '目前均價已經低於目標'
                  : `需再買 ${formatShares(needed)} 股，約 ${currency(needed * buyAt)}`}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
