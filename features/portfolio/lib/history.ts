import type { HistoryEntry } from "../../../types/portfolio";

export function recordTodayNetWorth(history: HistoryEntry[], totalValue: number) {
  const todayStr = new Date().toISOString().split("T")[0];
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterdayStr = y.toISOString().split("T")[0];
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
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return nextHistory;
}
