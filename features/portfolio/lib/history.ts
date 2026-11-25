import type { HistoryEntry } from '../../../types/portfolio';

/** 台灣日期 YYYY-MM-DD（台灣沒有日光節約時間，固定 UTC+8） */
export const taiwanDate = (d: Date) =>
  new Date(d.getTime() + 8 * 3_600_000).toISOString().slice(0, 10);

export function recordTodayNetWorth(
  history: HistoryEntry[],
  totalValue: number,
) {
  const now = Date.now();
  const todayStr = taiwanDate(new Date(now));
  const yesterdayStr = taiwanDate(new Date(now - 86_400_000));
  const hasYesterday = history.some((h) => h.date === yesterdayStr);
  const onlyToday =
    history.length === 0 ||
    (history.length === 1 && history[0].date === todayStr);

  let nextHistory = [...history];
  if (!hasYesterday && onlyToday) {
    nextHistory.push({ date: yesterdayStr, value: 0 });
  }

  const idx = nextHistory.findIndex((h) => h.date === todayStr);
  if (idx >= 0) {
    nextHistory[idx].value = totalValue;
  } else {
    nextHistory.push({ date: todayStr, value: totalValue });
  }

  nextHistory.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return nextHistory;
}
