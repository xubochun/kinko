import { describe, expect, it } from 'vitest';
import type { Asset } from '../../../types/portfolio';
import { computeLotStats, computeTickerStats } from './stockStats';

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

  it('個股總覽為各筆加總', () => {
    const s = computeTickerStats([lot(10, 100), lot(20, 130, 1)], 120);
    expect(s.cost).toBe(3600);
    expect(s.pnl).toBe(0);
  });
});
