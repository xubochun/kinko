import type { Asset } from '../../../types/portfolio';

/** 這筆的買進金額：股數 × 買價（單筆成本、損益用） */
export const buyCost = (lot: Asset) =>
  Number(lot.shares || 0) * Number(lot.price || 0);

/** 含整檔均價調整的成本（均價、總成本用）；沒調整過就等於買進金額 */
export const lotCost = (lot: Asset) => Number(lot.costAmount ?? buyCost(lot));

export type LotStats = {
  cost: number;
  value: number;
  pnl: number;
  pnlPct: number;
};

export function computeLotStats(lot: Asset, currentPrice: number): LotStats {
  const cost = buyCost(lot);
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

/**
 * 調整整檔均價：新的總成本依各筆買進金額比例分攤到 costAmount，買價等成交紀錄不變。
 * 買進金額合計為 0 時改依股數分攤。
 */
export function rescaleLotsToAverage(
  lots: Asset[],
  newAvg: number,
): Map<number, { costAmount: number }> {
  const shares = lots.reduce((s, l) => s + Number(l.shares || 0), 0);
  const cost = lots.reduce((s, l) => s + buyCost(l), 0);
  const result = new Map<number, { costAmount: number }>();
  for (const l of lots) {
    const costAmount =
      cost > 0
        ? (buyCost(l) * newAvg * shares) / cost
        : newAvg * Number(l.shares || 0);
    result.set(l.id, { costAmount });
  }
  return result;
}
