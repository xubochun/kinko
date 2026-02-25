import { useCallback, useEffect, useState } from "react";
import { STOCK_GOALS_SHARES_KEY } from "../../../lib/storage";

type StockGoals = Record<string, number>;

export function useStockGoals() {
  const [goals, setGoals] = useState<StockGoals>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STOCK_GOALS_SHARES_KEY);
    if (raw) {
      try {
        setGoals(JSON.parse(raw));
      } catch {
        setGoals({});
      }
    }
    setIsReady(true);
  }, []);

  const saveGoals = useCallback((next: StockGoals) => {
    setGoals(next);
    localStorage.setItem(STOCK_GOALS_SHARES_KEY, JSON.stringify(next));
  }, []);

  const setGoal = useCallback(
    (ticker: string, value: number) => {
      const next = { ...goals, [ticker]: value };
      saveGoals(next);
    },
    [goals, saveGoals]
  );

  const removeGoal = useCallback(
    (ticker: string) => {
      const next = { ...goals };
      delete next[ticker];
      saveGoals(next);
    },
    [goals, saveGoals]
  );

  return { goals, isReady, setGoal, removeGoal };
}
