"use client";

import { useMemo, useState } from "react";
import { usePortfolioData } from "../../features/portfolio/hooks/usePortfolioData";
import { useStockGoals } from "../../features/portfolio/hooks/useStockGoals";
import { groupStocks } from "../../features/portfolio/lib/portfolio";
import BottomNav from "../../features/portfolio/components/BottomNav";
import TopBar from "../../features/portfolio/components/TopBar";
import AddGoalModal from "../../features/portfolio/components/AddGoalModal";
import Icon from "../../components/Icon";
import { useLucideIcons } from "../../features/portfolio/hooks/useLucideIcons";
import InvestmentAllocationChart from "../../features/portfolio/components/charts/InvestmentAllocationChart";

export default function InvestmentPage() {
  useLucideIcons();
  const { assets, isReady } = usePortfolioData({ privacy: false });
  const { goals, setGoal, removeGoal } = useStockGoals();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalModalMode, setGoalModalMode] = useState<"new" | "edit">("new");
  const [goalModalTicker, setGoalModalTicker] = useState("");
  const [goalModalShares, setGoalModalShares] = useState<number | undefined>(undefined);
  const [activeYear] = useState<number>(2026);
  const [sortMode, setSortMode] = useState<"progress-desc" | "progress-asc">("progress-desc");
  const [allocationMode, setAllocationMode] = useState<"year" | "total">("year");

  const stockAssets = useMemo(() => assets.filter((a) => a.type === "stock"), [assets]);
  const grouped = useMemo(() => groupStocks(stockAssets), [stockAssets]);
  const goalTickers = useMemo(() => Object.keys(goals), [goals]);
  const allTickers = useMemo(() => {
    const set = new Set<string>();
    Object.keys(grouped).forEach((t) => set.add(t));
    Object.keys(goals).forEach((t) => set.add(t));
    return Array.from(set);
  }, [grouped, goals]);

  const sharesByTicker = useMemo(() => {
    const map = new Map<string, number>();
    allTickers.forEach((ticker) => {
      const lots = grouped[ticker] || [];
      let total = 0;
      lots.forEach((l) => {
        const y = Number(String(l.date || "").slice(0, 4));
        if (y !== activeYear) return;
        total += Number(l.shares || 0);
      });
      map.set(ticker, total);
    });
    return map;
  }, [allTickers, grouped, activeYear]);

  const totalSharesByTicker = useMemo(() => {
    const map = new Map<string, number>();
    allTickers.forEach((ticker) => {
      const lots = grouped[ticker] || [];
      let total = 0;
      lots.forEach((l) => {
        total += Number(l.shares || 0);
      });
      map.set(ticker, total);
    });
    return map;
  }, [allTickers, grouped]);

  const completionPct = useMemo(() => {
    if (goalTickers.length === 0) return 0;
    const sum = goalTickers.reduce((acc, t) => {
      const shares = sharesByTicker.get(t) || 0;
      const goal = goals[t] || 0;
      if (!goal) return acc;
      return acc + Math.min(1, shares / goal);
    }, 0);
    return Math.round((sum / goalTickers.length) * 100);
  }, [goalTickers, goals, sharesByTicker]);

  const openNewGoal = () => {
    setGoalModalMode("new");
    setGoalModalTicker("");
    setGoalModalShares(undefined);
    setGoalModalOpen(true);
  };

  const openEditGoal = (ticker: string) => {
    setGoalModalMode("edit");
    setGoalModalTicker(ticker);
    setGoalModalShares(goals[ticker] || 0);
    setGoalModalOpen(true);
  };

  const cards = useMemo(() => {
    return allTickers
      .map((ticker) => {
        const lots = grouped[ticker] || [];
        const name = lots[0]?.name || ticker;
        const shares = sharesByTicker.get(ticker) || 0;
        const goal = goals[ticker] || 0;
        const progress = goal ? Math.min(100, (shares / goal) * 100) : 0;
        const remaining = goal ? Math.max(0, goal - shares) : 0;
        const isCompleted = goal > 0 && shares >= goal;
        return { ticker, name, shares, goal, progress, remaining, isCompleted };
      })
      .sort((a, b) => {
        if (a.goal === 0 && b.goal === 0) return a.ticker.localeCompare(b.ticker);
        if (a.goal === 0) return 1;
        if (b.goal === 0) return -1;
        if (sortMode === "progress-asc") return a.progress - b.progress;
        if (sortMode === "progress-desc") return b.progress - a.progress;
        return b.remaining - a.remaining;
      });
  }, [allTickers, grouped, goals, sharesByTicker, sortMode]);


  const summary = useMemo(() => {
    const totalGoal = goalTickers.reduce((acc, t) => acc + Number(goals[t] || 0), 0);
    let totalHeld = 0;
    let completed = 0;
    goalTickers.forEach((t) => {
      const shares = sharesByTicker.get(t) || 0;
      totalHeld += shares;
      if (goals[t] > 0 && shares >= goals[t]) completed += 1;
    });
    const remaining = Math.max(0, totalGoal - totalHeld);
    return { totalGoal, totalHeld, remaining, completed };
  }, [goalTickers, goals, sharesByTicker]);

  const showLoading = !isReady;
  const showEmpty = isReady && allTickers.length === 0;
  const allocationYear = useMemo(
    () =>
      cards.map((c) => ({
        label: c.name,
        value: c.shares
      })),
    [cards]
  );

  const allocationTotal = useMemo(
    () =>
      cards.map((c) => ({
        label: c.name,
        value: totalSharesByTicker.get(c.ticker) || 0
      })),
    [cards, totalSharesByTicker]
  );

  if (!isReady) {
    return (
      <main className="min-h-screen relative z-10 bg-slate-50/50">
        <TopBar onAdd={openNewGoal} />
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-6 sm:pt-7 md:pt-14 md:pb-12">
          <div className="soft-card p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="skeleton skeleton-text w-full h-16"></div>
              <div className="skeleton skeleton-text w-full h-16"></div>
              <div className="skeleton skeleton-text w-full h-16"></div>
            </div>
            <div className="mt-4 skeleton skeleton-title w-full h-2"></div>
          </div>
          <div className="soft-card p-6 mt-6">
            <div className="flex flex-col gap-3">
              <div className="skeleton skeleton-title w-full h-20"></div>
              <div className="skeleton skeleton-title w-full h-20"></div>
              <div className="skeleton skeleton-title w-full h-20"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative z-10 bg-slate-50/50">
      <TopBar onAdd={openNewGoal} />
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-6 sm:pt-7 md:pt-20 md:pb-12">
        <section className="mb-4">
          <div className="flex items-center justify-center">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-semibold text-slate-900 transition hover:bg-slate-50"
              aria-label="選擇年度"
              type="button"
            >
              <i data-lucide="calendar" className="h-3.5 w-3.5 text-slate-500"></i>
              <span className="tabular-nums">{activeYear}</span>
              <i data-lucide="chevron-down" className="h-3.5 w-3.5 text-slate-400"></i>
            </button>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5 flex flex-col gap-5 md:gap-6">
            <section className="soft-card p-4 sm:p-5">
              <div className="grid gap-3 grid-cols-3 sm:gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5">
                  <div className="text-[11px] text-slate-500">完成率</div>
                  <div className="mt-1 text-[20px] font-semibold text-slate-900 tabular-nums">
                    {showLoading ? "—" : goalTickers.length === 0 ? "—" : `${completionPct}%`}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5">
                  <div className="text-[11px] text-slate-500">已投入股數</div>
                  <div className="mt-1 text-[20px] font-semibold text-slate-900 tabular-nums">
                    {showLoading ? "—" : summary.totalHeld}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5">
                  <div className="text-[11px] text-slate-500">剩餘股數</div>
                  <div className="mt-1 text-[20px] font-semibold text-slate-900 tabular-nums">
                    {showLoading ? "—" : summary.remaining}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {showLoading
                      ? "載入中"
                      : goalTickers.length === 0
                        ? "尚未設定目標"
                        : `已達成 ${summary.completed}/${goalTickers.length} 檔`}
                  </span>
                  <span className="tabular-nums">{showLoading ? "—" : goalTickers.length === 0 ? "—" : `${completionPct}%`}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#2563EB]" style={{ width: `${completionPct}%` }}></div>
                </div>
              </div>
            </section>

            <section className="soft-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <i data-lucide="pie-chart" className="h-4 w-4"></i>
                  </span>
                  <span className="text-[12px] font-semibold text-gray-500">持股分布</span>
                </div>
                <div className="seg" role="tablist">
                  <button
                    aria-pressed={allocationMode === "year"}
                    onClick={() => setAllocationMode("year")}
                  >
                    當年度
                  </button>
                  <button
                    aria-pressed={allocationMode === "total"}
                    onClick={() => setAllocationMode("total")}
                  >
                    總持股
                  </button>
                </div>
              </div>
              <InvestmentAllocationChart
                slices={allocationMode === "year" ? allocationYear : allocationTotal}
              />
            </section>
          </div>

          <section className="md:col-span-7 soft-card p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <i data-lucide="target" className="h-4 w-4"></i>
                </span>
                <span className="text-[15px] font-semibold text-gray-900">
                  {allTickers.length === 0 ? "尚未有持股或目標" : `目標清單 ${allTickers.length}`}
                </span>
              </div>
              <button
                onClick={() => setSortMode(sortMode === "progress-desc" ? "progress-asc" : "progress-desc")}
                className="rounded-full px-3 py-1 text-[11px] font-semibold transition bg-slate-900 text-white"
                aria-label={`完成率排序：${sortMode === "progress-desc" ? "由高到低" : "由低到高"}`}
              >
                完成率 {sortMode === "progress-desc" ? "↑" : "↓"}
              </button>
            </div>

            {showLoading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                <div className="h-20 rounded-[18px] border border-slate-200 bg-slate-50"></div>
                <div className="h-20 rounded-[18px] border border-slate-200 bg-slate-50"></div>
                <div className="h-20 rounded-[18px] border border-slate-200 bg-slate-50"></div>
              </div>
            ) : showEmpty ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-[13px] text-gray-500 flex items-center justify-center gap-3">
                <button
                  onClick={openNewGoal}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800"
                  aria-label="新增目標"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  新增目標
                </button>
                <button
                  onClick={openNewGoal}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800"
                  aria-label="新增持股"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  新增持股
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {cards.map((card) => (
                  <div
                    key={card.ticker}
                    className={`rounded-[18px] border bg-white px-4 py-4 sm:px-5 sm:py-5 transition-shadow duration-200 hover:shadow-[0_10px_26px_-20px_rgba(15,23,42,0.35)] ${card.goal ? "border-slate-200" : "border-amber-200/80 bg-amber-50/30"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 min-w-0 flex-wrap">
                          <span className="truncate">{card.name}</span>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {card.ticker}
                          </span>
                          {card.goal ? null : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              <i data-lucide="alert-circle" className="h-3 w-3"></i>
                              尚未設定目標
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openEditGoal(card.ticker)}
                        className={`h-7 w-7 grid place-items-center rounded-full border transition ${card.goal ? "border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300" : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                        aria-label="更多操作"
                        title={card.goal ? "更多操作" : "設定目標"}
                      >
                        <i data-lucide="more-horizontal" className="h-3.5 w-3.5"></i>
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="h-2 w-full rounded-full bg-white/80 overflow-hidden ring-1 ring-inset ring-black/5">
                        <div
                          className={`h-full ${card.goal ? "bg-[#2563EB]" : "bg-slate-200"}`}
                          style={{ width: `${card.goal ? card.progress : 8}%` }}
                        ></div>
                      </div>
                      {card.goal ? (
                        card.isCompleted ? (
                          <span className="shrink-0 text-[11px] font-semibold text-emerald-600">已達標</span>
                        ) : (
                          <span className="shrink-0 text-[11px] text-gray-500">
                            <span className="font-semibold text-slate-600 tabular-nums">{card.remaining}</span> 股
                          </span>
                        )
                      ) : null}
                    </div>

                  </div>
                ))}
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={openNewGoal}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800"
                    aria-label="新增目標"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    新增目標
                  </button>
                  <button
                    onClick={openNewGoal}
                    className="text-[12px] text-slate-500 hover:text-slate-900 transition"
                    aria-label="新增持股"
                  >
                    新增持股
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <BottomNav />

      <AddGoalModal
        open={goalModalOpen}
        mode={goalModalMode}
        initialTicker={goalModalTicker}
        initialShares={goalModalShares}
        onClose={() => setGoalModalOpen(false)}
        onSave={(ticker, shares) => setGoal(ticker, shares)}
        onRemove={goalModalMode === "edit" ? () => removeGoal(goalModalTicker) : undefined}
      />

    </main>
  );
}
