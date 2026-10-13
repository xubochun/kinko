import { currency, formatPnlPct, pnlClass } from '../../../../lib/format';
import { formatPrice, formatShares } from '../../../../lib/number';
import type { AverageSummary } from '../../lib/averageCost';
import { Card, Value } from './ui';

type Props = {
  summary: AverageSummary;
  currentPrice: number;
};

export default function HoldingSummary({ summary, currentPrice }: Props) {
  const value = summary.shares * currentPrice;
  const pnlAdjusted = value - summary.adjustedCost;
  const pnlPctAdjusted =
    summary.adjustedCost > 0 ? (pnlAdjusted / summary.adjustedCost) * 100 : 0;
  const recovered = summary.adjustedAvg <= 0 && summary.shares > 0;

  return (
    <Card title="目前持有" hint="除息後均價 = (總成本 − 已領現金股利) ÷ 股數">
      <div className="grid grid-cols-2 gap-3">
        <Value
          label="持有股數"
          value={`${formatShares(summary.shares)} 股`}
          sub={`總成本 ${currency(summary.cost)}`}
        />
        <Value
          label="已領現金股利"
          value={currency(summary.dividends)}
          sub={
            summary.cost > 0
              ? `占成本 ${((summary.dividends / summary.cost) * 100).toFixed(2)}%`
              : undefined
          }
        />
        <Value label="原始均價" value={formatPrice(summary.avgCost)} />
        <Value
          label="除息後均價"
          value={recovered ? '已回本' : formatPrice(summary.adjustedAvg)}
          sub={
            summary.dividends > 0 && !recovered
              ? `每股降低 ${formatPrice(summary.avgCost - summary.adjustedAvg)}`
              : undefined
          }
          emphasis
        />
      </div>

      {currentPrice > 0 && summary.shares > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3 text-[13px] tabular-nums">
          <span className="font-bold text-slate-500">
            含息損益（現價 {formatPrice(currentPrice)}）
          </span>
          <span className={`font-black ${pnlClass(pnlAdjusted)}`}>
            {pnlAdjusted >= 0 ? '+' : '-'}
            {currency(Math.abs(pnlAdjusted))}（{formatPnlPct(pnlPctAdjusted)}）
          </span>
        </div>
      )}
    </Card>
  );
}
