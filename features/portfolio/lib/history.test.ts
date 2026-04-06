// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recordTodayNetWorth } from './history';
import type { HistoryEntry } from '../../../types/portfolio';

describe('history.ts logic tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should add today's entry to empty history", () => {
    const date = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(date);
    const todayStr = '2024-01-15';
    const result = recordTodayNetWorth([], 100);

    expect(result.some((h) => h.date === todayStr)).toBe(true);
    const entry = result.find((h) => h.date === todayStr);
    expect(entry?.value).toBe(100);
  });

  it("should update existing today's entry", () => {
    const date = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(date);
    const todayStr = '2024-01-15';
    const initialHistory: HistoryEntry[] = [{ date: todayStr, value: 50 }];
    const result = recordTodayNetWorth(initialHistory, 200);

    const entry = result.find((h) => h.date === todayStr);
    expect(entry?.value).toBe(200);
  });
});
