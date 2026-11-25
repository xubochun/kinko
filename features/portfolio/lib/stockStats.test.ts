// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Asset } from '../../../types/portfolio';
import {
  computeLotStats,
  computeTickerStats,
  rescaleLotsToAverage,
} from './stockStats';

const lot = (shares: number, price: number, costAmount?: number): Asset =>
  ({
    id: 1,
    type: 'stock',
    ticker: '2330',
    shares,
    price,
    costAmount,
  }) as Asset;

describe('stockStats', () => {
  it('成本 = 股數 * 買價，不受 costAmount 影響', () => {
    expect(computeLotStats(lot(10, 100, 999), 120).cost).toBe(1000);
  });

  it('損益 = (現價 - 買價) * 股數', () => {
    const s = computeLotStats(lot(10, 100, 999), 120);
    expect(s.pnl).toBe(200);
    expect(s.pnlPct).toBe(20);
  });

  it('個股總覽用含調整的成本，沒調整過的用買進金額', () => {
    const s = computeTickerStats([lot(10, 100), lot(20, 130, 2900)], 120);
    expect(s.cost).toBe(3900);
    expect(s.avgCost).toBe(130);
    expect(s.pnl).toBe(-300);
  });

  it('調整整檔均價只改 costAmount，買進紀錄不變', () => {
    const lots = [
      { ...lot(10, 100), id: 1 },
      { ...lot(10, 200), id: 2 },
    ];
    const r = rescaleLotsToAverage(lots, 75);
    expect(r.get(1)).toEqual({ costAmount: 500 });
    expect(r.get(2)).toEqual({ costAmount: 1000 });
    const updated = lots.map((l) => ({ ...l, ...r.get(l.id) }));
    expect(computeTickerStats(updated, 0).avgCost).toBe(75);
    expect(computeLotStats(updated[1], 0).cost).toBe(2000);
  });

  it('買進金額為 0 時依股數分攤', () => {
    const r = rescaleLotsToAverage([{ ...lot(10, 0), id: 3 }], 5);
    expect(r.get(3)).toEqual({ costAmount: 50 });
  });
});
