import { Asset } from '../../../../types/portfolio';
import Icon from '../../../../components/Icon';
import { currency, formatPnlPct, pnlClass } from '../../../../lib/format';
import { formatPrice, formatShares } from '../../../../lib/number';
import { computeTickerStats } from '../../lib/stockStats';

type Props = {
  ticker: string;
  lots: Asset[];
  price: number;
  onSelect: (ticker: string) => void;
};

/** 投資持股明細清單中的單一標的列，點擊進入該標的明細 */
export default function StockTickerRow({
  ticker,
  lots,
  price,
  onSelect,
}: Props) {
  const stats = computeTickerStats(lots, price);
  const name = lots[0]?.name || ticker;
  const sign = stats.pnl > 0 ? '+' : stats.pnl < 0 ? '-' : '';

  return (
    <button
      type="button"
      onClick={() => onSelect(ticker)}
      className="w-full flex items-center gap-3 bg-white rounded-[20px] border border-slate-200 p-4 text-left hover:border-slate-300 active:scale-[0.99] transition"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-black text-slate-900 truncate">
            {name}
          </span>
          <span className="text-[12px] font-bold text-slate-400 shrink-0">
            {ticker}
          </span>
        </div>
        <div className="mt-1 text-[12px] font-medium text-slate-500 tabular-nums truncate">
          {formatShares(stats.shares)} 股 · 均價 {formatPrice(stats.avgCost)} ·
          現價 {price > 0 ? formatPrice(price) : '—'}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[15px] font-black text-slate-900 tabular-nums">
          {currency(stats.value)}
        </div>
        <div
          className={`mt-1 text-[12px] font-bold tabular-nums ${pnlClass(stats.pnl)}`}
        >
          {sign}
          {Math.round(Math.abs(stats.pnl)).toLocaleString('zh-TW')}（
          {formatPnlPct(stats.pnlPct)}）
        </div>
      </div>
      <Icon name="chevron-right" className="h-4 w-4 text-slate-300 shrink-0" />
    </button>
  );
}
