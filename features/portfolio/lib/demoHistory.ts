import type { HistoryEntry } from "../../../types/portfolio";

export function buildDemoHistory(days = 120): HistoryEntry[] {
  const today = new Date();
  const base = 3200000;
  const growthPerDay = 3500;
  const history: HistoryEntry[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const idx = days - i;
    const wave = Math.sin(idx / 7) * 15000;
    const value = Math.max(0, Math.round(base + idx * growthPerDay + wave));
    history.push({ date: d.toISOString().split("T")[0], value });
  }

  return history;
}
