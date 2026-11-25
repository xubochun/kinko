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

/** 買價超過兩位小數（排除浮點誤差）：多半是舊版調整均價時被等比例改過的 */
// shortcut: 假設真實買價最多兩位小數（台股），若支援更多小數的市場要改用其他方式辨識
export const hasExtraDecimals = (price: number) => {
  const cents = price * 100;
  return Math.abs(cents - Math.round(cents)) > 1e-6;
};

/**
 * 舊版調整均價會把同一檔每筆買價乘上同一個倍數。anchor 改回真實買價 realPrice 後，
 * 找出被同一倍數改過的其他筆（目前有多餘小數、除回去後落在兩位小數內）與還原後的買價。
 */
export function findRescaledSiblings(
  lots: Asset[],
  anchor: Asset,
  realPrice: number,
): { lot: Asset; price: number }[] {
  const factor = Number(anchor.price || 0) / realPrice;
  if (!(factor > 0 && Number.isFinite(factor))) return [];
  return lots.flatMap((lot) => {
    const current = Number(lot.price || 0);
    const restored = current / factor;
    return lot.id !== anchor.id &&
      hasExtraDecimals(current) &&
      !hasExtraDecimals(restored)
      ? [{ lot, price: Math.round(restored * 100) / 100 }]
      : [];
  });
}

export type DayRange = { date: string; min: number; max: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** 台股升降單位（代號 00 開頭視為 ETF） */
export function tickSize(price: number, ticker: string) {
  if (ticker.startsWith('00')) return price < 50 ? 0.01 : 0.05;
  if (price < 10) return 0.01;
  if (price < 50) return 0.05;
  if (price < 100) return 0.1;
  if (price < 500) return 0.5;
  if (price < 1000) return 1;
  return 5;
}

/** 成交日前後 5 天內的最低、最高價，容許日期記差幾天 */
function priceRange(date: string | undefined, days: DayRange[]) {
  if (!date) return null;
  const t = Date.parse(date);
  const near = days.filter(
    (d) => Math.abs(Date.parse(d.date) - t) <= 5 * 86_400_000,
  );
  if (near.length === 0) return null;
  return {
    lo: Math.min(...near.map((d) => d.min)),
    hi: Math.max(...near.map((d) => d.max)),
  };
}

/**
 * 用成交日當時的股價推算被舊版等比例改過的原始買價：拿一筆被改過的紀錄，
 * 逐一試算它當時股價區間內的每個合法價位。只有一個倍數能讓它和至少另一筆
 * 同時落在升降單位上、也都在各自的股價區間內時才採用；推算不出或有多種可能就不回傳。
 */
export function inferOriginalPrices(
  lots: Asset[],
  days: DayRange[],
): { lot: Asset; price: number }[] {
  const ticker = lots[0]?.ticker ?? '';
  const ranges = new Map(lots.map((l) => [l.id, priceRange(l.date, days)]));
  const fits = (lot: Asset, factor: number) => {
    const r = Number(lot.price || 0) / factor;
    const range = ranges.get(lot.id);
    const n = r / tickSize(r, ticker);
    return (
      !!range &&
      Math.abs(n - Math.round(n)) < 1e-6 &&
      r >= range.lo - 1e-6 &&
      r <= range.hi + 1e-6
    );
  };

  const result: { lot: Asset; price: number }[] = [];
  let pending = lots.filter((l) => hasExtraDecimals(Number(l.price || 0)));
  for (const anchor of [...pending]) {
    const range = ranges.get(anchor.id);
    if (!range || !pending.includes(anchor)) continue;
    const solutions: { factor: number; matched: Asset[] }[] = [];
    const first = tickSize(range.lo, ticker);
    for (
      let t = round2(Math.ceil(range.lo / first - 1e-9) * first);
      t <= range.hi + 1e-6;
      t = round2(t + tickSize(t, ticker))
    ) {
      const factor = Number(anchor.price) / t;
      const matched = pending.filter((l) => fits(l, factor));
      if (matched.length >= 2) solutions.push({ factor, matched });
    }
    if (solutions.length !== 1) continue;
    const { factor, matched } = solutions[0];
    for (const lot of matched) {
      result.push({ lot, price: round2(Number(lot.price) / factor) });
    }
    pending = pending.filter((l) => !matched.includes(l));
  }
  return result;
}
