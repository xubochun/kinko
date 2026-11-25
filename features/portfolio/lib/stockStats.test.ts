// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Asset } from '../../../types/portfolio';
import {
  computeLotStats,
  computeTickerStats,
  findRescaledSiblings,
  hasExtraDecimals,
  inferOriginalPrices,
  rescaleLotsToAverage,
  tickSize,
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

describe('還原被舊版等比例改過的買價', () => {
  // 舊版把均價 900.38 改成 1000：每筆買價 × 新均價 / 舊均價
  const shares = [120, 80, 60];
  const real = [815, 920, 1045];
  const oldAvg = real.reduce((s, p, i) => s + p * shares[i], 0) / 260;
  const dates = ['2023-08-15', '2024-05-22', '2025-12-05'];
  const lots = real.map((p, i) => ({
    ...lot(shares[i], (p * 1000) / oldAvg),
    id: i + 1,
    date: dates[i],
  }));
  const later = { ...lot(10, 1500), id: 9 }; // 改均價之後才新增，買價正常

  it('辨識多餘小數，忽略浮點誤差', () => {
    expect(hasExtraDecimals(lots[0].price!)).toBe(true);
    expect(hasExtraDecimals(560.32)).toBe(false);
    expect(hasExtraDecimals(985.0000000000001)).toBe(false);
  });

  it('依一筆真實買價換算同倍數改過的其他筆，略過正常買價', () => {
    expect(findRescaledSiblings([...lots, later], lots[0], 815)).toEqual([
      { lot: lots[1], price: 920 },
      { lot: lots[2], price: 1045 },
    ]);
  });

  it('真實買價輸入錯誤時不換算其他筆', () => {
    expect(findRescaledSiblings(lots, lots[0], 816)).toEqual([]);
    expect(findRescaledSiblings(lots, lots[0], 0)).toEqual([]);
  });

  const days = (min: number[], max: number[]) =>
    dates.map((date, i) => ({ date, min: min[i], max: max[i] }));
  const realDays = days([800, 910, 1030], [830, 930, 1060]);

  it('用成交日股價區間與升降單位推算原價，略過正常買價', () => {
    expect(inferOriginalPrices([...lots, later], realDays)).toEqual([
      { lot: lots[0], price: 815 },
      { lot: lots[1], price: 920 },
      { lot: lots[2], price: 1045 },
    ]);
  });

  it('有多種可能、只有一筆被改過或沒有股價資料時不推算', () => {
    const wide = days([100, 100, 100], [2000, 2000, 2000]);
    expect(inferOriginalPrices(lots, wide)).toEqual([]);
    expect(inferOriginalPrices([lots[0], later], realDays)).toEqual([]);
    expect(inferOriginalPrices(lots, [])).toEqual([]);
  });

  it('台股與 ETF 升降單位', () => {
    expect(tickSize(905, '2454')).toBe(1);
    expect(tickSize(1045, '2454')).toBe(5);
    expect(tickSize(167.3, '0050')).toBe(0.05);
  });
});
