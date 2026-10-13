import type { Asset } from '../../../types/portfolio';

export const lotCost = (lot: Asset) =>
  Number(lot.costAmount || Number(lot.shares || 0) * Number(lot.price || 0));

export type LotStats = {
  cost: number;
  value: number;
  pnl: number;
  pnlPct: number;
};

export function computeLotStats(lot: Asset, currentPrice: number): LotStats {
  const cost = lotCost(lot);
  const value = Number(lot.shares || 0) * currentPrice;
  const pnl = value - cost;
  return { cost, value, pnl, pnlPct: cost > 0 ? (pnl / cost) * 100 : 0 };
}

export type TickerStats = LotStats & {
  shares: number;
  avgCost: number;
  currentPrice: number;
  /** 現價與平均成本的價差 */
  priceDiff: number;
};

export function computeTickerStats(
  lots: Asset[],
  currentPrice: number,
): TickerStats {
  const shares = lots.reduce((s, l) => s + Number(l.shares || 0), 0);
  const cost = lots.reduce((s, l) => s + lotCost(l), 0);
  const value = shares * currentPrice;
  const pnl = value - cost;
  const avgCost = shares > 0 ? cost / shares : 0;
  return {
    shares,
    cost,
    value,
    pnl,
    pnlPct: cost > 0 ? (pnl / cost) * 100 : 0,
    avgCost,
    currentPrice,
    priceDiff: currentPrice - avgCost,
  };
}

/** 依成交日期排序（預設新到舊） */
export function sortLotsByDate(lots: Asset[], order: 'desc' | 'asc' = 'desc') {
  return [...lots].sort((a, b) => {
    const cmp = String(a.date || '').localeCompare(String(b.date || ''));
    return order === 'desc' ? -cmp : cmp;
  });
}
