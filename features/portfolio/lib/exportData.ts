import type { Asset, HistoryEntry } from '../../../types/portfolio';
import type { DividendRecord } from './averageCost';
import { taiwanDate } from './history';
import { hasExtraDecimals, lotCost, sortLotsByDate } from './stockStats';

/**
 * 匯出格式 kinko.export v1，見〈Kinko 資料匯出接口（草案 v1）〉，kinko-ios 依此匯入。
 * 只新增欄位不用升版；改名、刪除欄位或改型別要升 schemaVersion，並先通知 kinko-ios。
 */
export type ExportInput = {
  assets: Asset[];
  history: HistoryEntry[];
  goals: Record<string, number>;
  dividends: Record<string, DividendRecord[]>;
  netWorthGoal: number | null;
  /** 用原始代號查快取的最新股價 */
  quote: (ticker: string) => { price: number; updatedAt: number } | undefined;
  now: Date;
};

const iso = (ms?: number) => (ms ? new Date(ms).toISOString() : null);

/** 去掉 .TW / .TWO 後綴，同一檔股票只出現一次 */
const normTicker = (t: string) =>
  t
    .trim()
    .toUpperCase()
    .replace(/\.(TW|TWO)$/, '');

export const exportFileName = (now: Date) =>
  `kinko-export-${taiwanDate(now)}.json`;

export function buildExport({
  assets,
  history,
  goals,
  dividends,
  netWorthGoal,
  quote,
  now,
}: ExportInput) {
  const lotsByTicker = new Map<string, Asset[]>();
  for (const a of assets) {
    if (a.type !== 'stock' || !a.ticker) continue;
    const t = normTicker(a.ticker);
    lotsByTicker.set(t, [...(lotsByTicker.get(t) ?? []), a]);
  }
  const sharesOf = (t: string) =>
    (lotsByTicker.get(t) ?? []).reduce((s, l) => s + Number(l.shares || 0), 0);

  const stocks = Array.from(lotsByTicker, ([ticker, lots]) => {
    const shares = sharesOf(ticker);
    const totalCost = lots.reduce((s, l) => s + lotCost(l), 0);
    const last = lots.map((l) => quote(l.ticker ?? '')).find(Boolean);
    return {
      ticker,
      name: lots[0].name || ticker,
      shares,
      totalCost,
      avgCost: shares > 0 ? totalCost / shares : 0,
      lastPrice: last?.price ?? null,
      lastPriceAt: iso(last?.updatedAt),
      lots: sortLotsByDate(lots, 'asc').map((l) => ({
        id: String(l.id),
        date: l.date || '',
        shares: Number(l.shares || 0),
        price: Number(l.price || 0),
        cost: lotCost(l),
        priceMaybeRescaled: hasExtraDecimals(Number(l.price || 0)),
        fundingAccountId: l.fundingSourceId ? String(l.fundingSourceId) : null,
        updatedAt: iso(l.updatedAt),
      })),
    };
  });

  const goalByTicker = new Map(
    Object.entries(goals).map(([t, g]) => [normTicker(t), Number(g)]),
  );
  const sortedHistory = [...history].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return {
    schema: 'kinko.export',
    schemaVersion: 1,
    exportedAt: now.toISOString(),
    currency: 'TWD',
    accounts: assets
      .filter((a) => a.type === 'cash')
      .map((a) => ({
        id: String(a.id),
        name: a.name || '',
        balance: Number(a.amount || 0),
        isInvestmentAccount: !!a.isInvestmentAccount,
        updatedAt: iso(a.updatedAt),
      })),
    stocks,
    savings: {
      goals: Array.from(goalByTicker, ([ticker, goalShares]) => ({
        ticker,
        goalShares,
        currentShares: sharesOf(ticker),
      })),
      dividends: Object.entries(dividends)
        .flatMap(([t, records]) =>
          records.map((d) => ({
            id: d.id,
            ticker: normTicker(t),
            exDate: d.date,
            perShare: d.perShare,
            shares: d.shares,
            amount: d.amount,
          })),
        )
        .sort((a, b) => b.exDate.localeCompare(a.exDate)),
    },
    netWorth: {
      goal: netWorthGoal,
      // 第一次使用時自動補上的前一天 0 不匯出
      history: (sortedHistory[0]?.value === 0
        ? sortedHistory.slice(1)
        : sortedHistory
      ).map(({ date, value }) => ({ date, value })),
    },
  };
}

/** 加到主畫面的網頁不一定能直接下載，改用分享選單「儲存到檔案」；其他情況直接下載 */
export async function saveExportFile(json: string, filename: string) {
  const file = new File([json], filename, { type: 'application/json' });
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return; // 用戶取消分享
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
