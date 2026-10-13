import type { Asset } from '../../../types/portfolio';
import { lotCost } from './stockStats';

/** 一筆現金股利（除息）紀錄 */
export type DividendRecord = {
  id: string;
  /** 除息日 YYYY-MM-DD */
  date: string;
  /** 每股配發現金股利 */
  perShare: number;
  /** 除息日當時參與配息的股數 */
  shares: number;
  /** 實際領取金額（預設 = 每股股利 × 股數，可手動修正為扣除二代健保等後的金額） */
  amount: number;
};

export type Holding = {
  shares: number;
  /** 總投入成本（含手續費） */
  cost: number;
  /** 累計已領現金股利 */
  dividends: number;
};

export type AverageSummary = {
  shares: number;
  cost: number;
  dividends: number;
  /** 原始均價 = 總成本 / 股數 */
  avgCost: number;
  /** 除息後成本 = 總成本 - 已領股利 */
  adjustedCost: number;
  /** 除息後均價 = (總成本 - 已領股利) / 股數 */
  adjustedAvg: number;
};

export type PlannedBuy = { shares: number; price: number };

export function summarizeHolding(h: Holding): AverageSummary {
  const adjustedCost = h.cost - h.dividends;
  return {
    shares: h.shares,
    cost: h.cost,
    dividends: h.dividends,
    avgCost: h.shares > 0 ? h.cost / h.shares : 0,
    adjustedCost,
    adjustedAvg: h.shares > 0 ? adjustedCost / h.shares : 0,
  };
}

/** 由成交紀錄與股利紀錄計算目前持有狀況 */
export function holdingFromLots(
  lots: Asset[],
  dividends: DividendRecord[],
): Holding {
  return {
    shares: lots.reduce((s, l) => s + Number(l.shares || 0), 0),
    cost: lots.reduce((s, l) => s + lotCost(l), 0),
    dividends: dividends.reduce((s, d) => s + Number(d.amount || 0), 0),
  };
}

/** 除息日前（不含當天）買進的股數，才有資格參與該次配息 */
export function sharesEligibleOn(lots: Asset[], exDate: string): number {
  if (!exDate) return 0;
  return lots
    .filter((l) => (l.date || '') < exDate)
    .reduce((s, l) => s + Number(l.shares || 0), 0);
}

/** 試算加碼後的均價（原始與除息後兩種口徑） */
export function simulateBuys(
  base: Holding,
  buys: PlannedBuy[],
): AverageSummary & { addedShares: number; addedCost: number } {
  const valid = buys.filter((b) => b.shares > 0 && b.price >= 0);
  const addedShares = valid.reduce((s, b) => s + b.shares, 0);
  const addedCost = valid.reduce((s, b) => s + b.shares * b.price, 0);
  return {
    ...summarizeHolding({
      shares: base.shares + addedShares,
      cost: base.cost + addedCost,
      dividends: base.dividends,
    }),
    addedShares,
    addedCost,
  };
}

/**
 * 反推：想把均價壓到 targetAvg，以 price 買進需要多少股。
 * 若無法達成（買價不低於目標均價且目前均價高於目標）回傳 null。
 */
export function sharesNeededForTarget(
  shares: number,
  cost: number,
  price: number,
  targetAvg: number,
): number | null {
  if (shares > 0 && cost / shares <= targetAvg) return 0;
  if (price >= targetAvg) return null;
  // (cost + x*price) / (shares + x) = target  =>  x = (cost - target*shares) / (target - price)
  const x = (cost - targetAvg * shares) / (targetAvg - price);
  return Math.ceil(x);
}
