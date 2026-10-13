import {
  currency,
  formatPnlAmount,
  formatPnlPct,
  pnlClass,
} from '../../../../lib/format';
import { formatPrice, formatShares } from '../../../../lib/number';
import type { TickerStats } from '../../lib/stockStats';

type Props = {
  stats: TickerStats;
  onEdit: () => void;
  onDelete: () => void;
};

const Metric = ({
  label,
  value,
  sub,
  valueClass = 'text-slate-900',
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) => (
  <div className="min-w-0">
    <div className="text-[12px] font-medium text-slate-500">{label}</div>
    <div
      className={`mt-1 text-[16px] font-black tabular-nums truncate ${valueClass}`}
    >
      {value}
    </div>
    {sub && (
      <div className="text-[11px] font-medium text-slate-400 tabular-nums truncate">
        {sub}
      </div>
    )}
  </div>
);

export default function StockSummaryCard({ stats, onEdit, onDelete }: Props) {
  const hasPrice = stats.currentPrice > 0;
  const diffSign = stats.priceDiff > 0 ? '+' : stats.priceDiff < 0 ? '-' : '';

  return (
    <section className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm">
      <div className="text-[12px] font-medium text-slate-500">未實現損益</div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <span
          className={`text-[26px] font-black tabular-nums leading-tight ${pnlClass(stats.pnl)}`}
        >
          {hasPrice ? formatPnlAmount(stats.pnl) : '—'}
        </span>
        {hasPrice && (
          <span
            className={`text-[14px] font-black tabular-nums ${pnlClass(stats.pnl)}`}
          >
            {formatPnlPct(stats.pnlPct)}
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-slate-100">
        <Metric
          label="目前市值"
          value={hasPrice ? currency(stats.value) : '—'}
        />
        <Metric label="總投入成本" value={currency(stats.cost)} />
        <Metric
          label="現價"
          value={hasPrice ? formatPrice(stats.currentPrice) : '讀取中'}
          sub={
            hasPrice
              ? `較均價 ${diffSign}${formatPrice(Math.abs(stats.priceDiff))}`
              : undefined
          }
        />
        <Metric
          label="平均成本"
          value={formatPrice(stats.avgCost)}
          sub={`持有 ${formatShares(stats.shares)} 股`}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          onClick={onEdit}
          className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-[13px] font-bold text-slate-700 transition-colors"
        >
          編輯名稱／均價
        </button>
        <button
          onClick={onDelete}
          className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-[13px] font-bold text-rose-600 transition-colors"
        >
          刪除此標的
        </button>
      </div>
    </section>
  );
}
