// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { Asset } from '../../../types/portfolio';
import {
  holdingFromLots,
  sharesEligibleOn,
  sharesNeededForTarget,
  simulateBuys,
  summarizeHolding,
} from './averageCost';

const lots: Asset[] = [
  {
    id: 1,
    type: 'stock',
    ticker: '2330',
    date: '2025-01-10',
    shares: 100,
    price: 1000,
    costAmount: 100000,
  },
  {
    id: 2,
    type: 'stock',
    ticker: '2330',
    date: '2025-06-20',
    shares: 100,
    price: 900,
    costAmount: 90000,
  },
];

describe('averageCost', () => {
  it('計算原始均價與除息後均價', () => {
    const h = holdingFromLots(lots, [
      { id: 'a', date: '2025-06-12', perShare: 5, shares: 100, amount: 500 },
      { id: 'b', date: '2025-09-11', perShare: 5, shares: 200, amount: 1000 },
    ]);
    expect(h).toEqual({ shares: 200, cost: 190000, dividends: 1500 });
    const s = summarizeHolding(h);
    expect(s.avgCost).toBe(950);
    expect(s.adjustedAvg).toBe(942.5);
  });

  it('只計算除息日前買進的股數', () => {
    expect(sharesEligibleOn(lots, '2025-06-20')).toBe(100);
    expect(sharesEligibleOn(lots, '2025-06-21')).toBe(200);
    expect(sharesEligibleOn(lots, '2024-12-31')).toBe(0);
  });

  it('試算多筆加碼後的均價', () => {
    const r = simulateBuys({ shares: 200, cost: 190000, dividends: 1500 }, [
      { shares: 100, price: 800 },
      { shares: 0, price: 700 },
    ]);
    expect(r.addedShares).toBe(100);
    expect(r.addedCost).toBe(80000);
    expect(r.avgCost).toBe(900);
    expect(r.adjustedAvg).toBe(895);
  });

  it('反推達到目標均價所需股數', () => {
    expect(sharesNeededForTarget(200, 190000, 800, 900)).toBe(100);
    expect(sharesNeededForTarget(200, 190000, 950, 900)).toBeNull();
    expect(sharesNeededForTarget(200, 190000, 800, 1000)).toBe(0);
  });
});
