// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Asset } from '../../../types/portfolio';
import { buildExport, exportFileName } from './exportData';

const now = new Date('2026-11-25T17:30:00Z'); // 台灣時間 11/26 01:30
const lot = (
  id: number,
  ticker: string,
  date: string,
  shares: number,
  price: number,
  extra: Partial<Asset> = {},
): Asset => ({
  id,
  type: 'stock',
  ticker,
  name: '聯發科',
  date,
  shares,
  price,
  costAmount: shares * price,
  ...extra,
});

const data = buildExport({
  assets: [
    {
      id: 1,
      type: 'cash',
      name: '薪轉帳戶',
      amount: 250000,
      isInvestmentAccount: true,
      updatedAt: Date.parse('2026-11-20T02:15:00Z'),
    },
    lot(3, '2454.TW', '2025-06-10', 80, 1300),
    // 用新版調整過均價：costAmount 不等於股數 × 買價
    lot(2, '2454', '2024-05-22', 120, 1160, {
      fundingSourceId: 1,
      costAmount: 140000,
    }),
    lot(4, '0050', '2024-01-02', 10, 135.1234567, { name: '元大台灣50' }),
  ],
  history: [
    { date: '2026-11-24', value: 518900 },
    { date: '2026-11-23', value: 0 }, // 第一次使用時補上的 0
    { date: '2026-11-25', value: 522000 },
  ],
  goals: { '2454.TW': 1000 },
  dividends: {
    '2454': [
      {
        id: 'a',
        date: '2024-07-10',
        perShare: 22,
        shares: 120,
        amount: 2640,
      },
      {
        id: 'b',
        date: '2025-07-10',
        perShare: 25,
        shares: 200,
        amount: 5000,
      },
    ],
  },
  netWorthGoal: 5000000,
  quote: (t) =>
    t === '2454'
      ? { price: 1360, updatedAt: Date.parse(now.toISOString()) }
      : undefined,
  now,
});

describe('buildExport', () => {
  it('ticker 去掉 .TW 並合併同一檔，成交紀錄由舊到新', () => {
    expect(data.stocks.map((s) => s.ticker)).toEqual(['2454', '0050']);
    expect(data.stocks[0].lots.map((l) => l.id)).toEqual(['2', '3']);
    expect(data.stocks[0].lastPrice).toBe(1360);
    expect(data.stocks[1].lastPrice).toBeNull();
  });

  it('price 是成交買價，cost 與均價含調整，並標記多餘小數的買價', () => {
    const [mtk, etf] = data.stocks;
    expect(mtk.lots[0]).toMatchObject({
      price: 1160,
      cost: 140000,
      priceMaybeRescaled: false,
      fundingAccountId: '1',
    });
    expect(mtk.totalCost).toBe(244000);
    expect(mtk.avgCost).toBe(1220);
    expect(etf.lots[0].priceMaybeRescaled).toBe(true);
  });

  it('帳戶、存股目標與股利', () => {
    expect(data.accounts).toEqual([
      {
        id: '1',
        name: '薪轉帳戶',
        balance: 250000,
        isInvestmentAccount: true,
        updatedAt: '2026-11-20T02:15:00.000Z',
      },
    ]);
    expect(data.savings.goals).toEqual([
      { ticker: '2454', goalShares: 1000, currentShares: 200 },
    ]);
    expect(data.savings.dividends.map((d) => d.exDate)).toEqual([
      '2025-07-10',
      '2024-07-10',
    ]);
  });

  it('淨值歷史由舊到新，拿掉開頭補上的 0', () => {
    expect(data.netWorth).toEqual({
      goal: 5000000,
      history: [
        { date: '2026-11-24', value: 518900 },
        { date: '2026-11-25', value: 522000 },
      ],
    });
  });

  it('檔名用台灣日期', () => {
    expect(exportFileName(now)).toBe('kinko-export-2026-11-26.json');
  });
});
