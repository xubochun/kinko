'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePortfolioData } from '../../features/portfolio/hooks/usePortfolioData';
import { useStockGoals } from '../../features/portfolio/hooks/useStockGoals';
import { groupStocks } from '../../features/portfolio/lib/portfolio';
import BottomNav from '../../features/portfolio/components/BottomNav';
import Sidebar from '../../features/portfolio/components/Sidebar';
import AddGoalModal from '../../features/portfolio/components/AddGoalModal';
import AddAssetModal from '../../features/portfolio/components/AddAssetModal';
import Icon from '../../components/Icon';
import { useLucideIcons } from '../../features/portfolio/hooks/useLucideIcons';
import InvestmentAllocationChart from '../../features/portfolio/components/charts/InvestmentAllocationChart';
import PortfolioHeader from '../../features/portfolio/components/PortfolioHeader';

export default function InvestmentPage() {
  useLucideIcons();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { assets, isReady, addAsset } = usePortfolioData({
    privacy: false,
  });
  const { goals, setGoal, removeGoal } = useStockGoals();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalModalMode, setGoalModalMode] = useState<'new' | 'edit'>('new');
  const [goalModalTicker, setGoalModalTicker] = useState('');
  const [goalModalShares, setGoalModalShares] = useState<number | undefined>(
    undefined,
  );

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetModalTicker, setAssetModalTicker] = useState('');

  const [activeYear] = useState<number>(2026);
  const [sortMode, setSortMode] = useState<'progress-desc' | 'progress-asc'>(
    'progress-desc',
  );
  const [allocationMode, setAllocationMode] = useState<'year' | 'total'>(
    'year',
  );

  const stockAssets = useMemo(
    () => assets.filter((a) => a.type === 'stock'),
    [assets],
  );
  const grouped = useMemo(() => groupStocks(stockAssets), [stockAssets]);
  const allTickers = useMemo(() => {
    const set = new Set<string>();
    Object.keys(grouped).forEach((t) => set.add(t));
    Object.keys(goals).forEach((t) => set.add(t));
    return Array.from(set);
  }, [grouped, goals]);

  const goalTickers = useMemo(() => Object.keys(goals), [goals]);

  const sharesByTicker = useMemo(() => {
    const map = new Map<string, number>();
    allTickers.forEach((ticker) => {
      const lots = grouped[ticker] || [];
      let total = 0;
      lots.forEach((l) => {
        const y = Number(String(l.date || '').slice(0, 4));
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
    setGoalModalMode('new');
    setGoalModalTicker('');
    setGoalModalShares(undefined);
    setGoalModalOpen(true);
  };

  const openEditGoal = (ticker: string) => {
    setGoalModalMode('edit');
    setGoalModalTicker(ticker);
    setGoalModalShares(goals[ticker] || 0);
    setGoalModalOpen(true);
  };

  const openAddRecord = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    setAssetModalTicker(ticker);
    setAssetModalOpen(true);
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
        if (a.goal === 0 && b.goal === 0)
          return a.ticker.localeCompare(b.ticker);
        if (a.goal === 0) return 1;
        if (b.goal === 0) return -1;
        if (sortMode === 'progress-asc') return a.progress - b.progress;
        if (sortMode === 'progress-desc') return b.progress - a.progress;
        return b.remaining - a.remaining;
      });
  }, [allTickers, grouped, goals, sharesByTicker, sortMode]);

  const summary = useMemo(() => {
    const totalGoal = goalTickers.reduce(
      (acc, t) => acc + Number(goals[t] || 0),
      0,
    );
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

  const allocationYear = useMemo(
    () =>
      cards.map((c) => ({
        label: c.name,
        value: c.shares,
      })),
    [cards],
  );

  const allocationTotal = useMemo(
    () =>
      cards.map((c) => ({
        label: c.name,
        value: totalSharesByTicker.get(c.ticker) || 0,
      })),
    [cards, totalSharesByTicker],
  );

  if (!isReady || !mounted) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <Sidebar onAddAsset={openNewGoal} />
        <main className="flex-1 md:ml-64 relative z-10 min-w-0">
          <div className="w-full px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-12 md:pb-12 text-left overflow-hidden">
            <div className="animate-pulse">
              <div className="h-10 w-48 bg-slate-200 rounded-lg mb-10 hidden md:block"></div>
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-5 flex flex-col gap-6">
                  <div className="h-40 w-full bg-white border border-slate-200 rounded-[24px] md:rounded-[32px]"></div>
                  <div className="h-64 w-full bg-white border border-slate-200 rounded-[24px] md:rounded-[32px]"></div>
                </div>
                <div className="md:col-span-7 h-96 w-full bg-white border border-slate-200 rounded-[24px] md:rounded-[32px]"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] overflow-x-hidden">
      <Sidebar onAddAsset={openNewGoal} />

      <main className="flex-1 md:ml-64 relative z-10 min-w-0">
        <div className="w-full px-4 pb-24 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-12 md:pb-12 text-left overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden overflow-hidden">
            <PortfolioHeader
              hasAssets={allTickers.length > 0}
              privacy={false}
              onTogglePrivacy={() => {}}
            />
          </div>

          {/* Desktop Header */}
          <header className="mb-6 md:mb-10 hidden md:flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[26px] font-black text-slate-900 tracking-tight">
                  存股規劃
                </h1>
              </div>
              <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {activeYear} 年度目標達成進度
              </p>
            </div>
          </header>

          <div className="md:hidden mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
                  存股規劃
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeYear} 年度目標達成進度
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-12 overflow-hidden">
            <div className="md:col-span-5 flex flex-col gap-6 overflow-hidden">
              <section className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm text-left overflow-hidden">
                <div className="grid gap-2 sm:gap-6 grid-cols-3 min-w-0">
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">
                      完成率
                    </div>
                    <div
                      className={`mt-2 text-[18px] sm:text-[24px] font-black tabular-nums leading-none truncate ${completionPct >= 100 && goalTickers.length > 0 ? 'text-emerald-500' : 'text-slate-900'}`}
                    >
                      {goalTickers.length === 0 ? '—' : `${completionPct}%`}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">
                      已持有
                    </div>
                    <div className="mt-2 text-[18px] sm:text-[24px] font-black text-slate-900 tabular-nums leading-none truncate flex items-baseline gap-1">
                      {summary.totalHeld.toLocaleString()}{' '}
                      <span className="text-[10px] sm:text-[12px] text-slate-400 font-bold">
                        股
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">
                      剩餘
                    </div>
                    <div className="mt-2 text-[18px] sm:text-[24px] font-black text-slate-900 tabular-nums leading-none truncate flex items-baseline gap-1">
                      {summary.remaining.toLocaleString()}{' '}
                      <span className="text-[10px] sm:text-[12px] text-slate-400 font-bold">
                        股
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <div className="flex items-center justify-between text-[12px] font-bold text-slate-500 mb-3">
                    <span>達成進度</span>
                    <span
                      className={`tabular-nums ${completionPct >= 100 && goalTickers.length > 0 ? 'text-emerald-500' : ''}`}
                    >
                      {completionPct}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${completionPct >= 100 && goalTickers.length > 0 ? 'bg-emerald-500' : 'bg-slate-900'}`}
                      style={{ width: `${completionPct}%` }}
                    ></div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm text-left">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[14px] font-black text-slate-900 tracking-tight">
                    持股分布
                  </div>
                  <div
                    className="flex bg-slate-100 p-1 rounded-xl"
                    role="tablist"
                  >
                    <button
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${allocationMode === 'year' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      onClick={() => setAllocationMode('year')}
                    >
                      當年度
                    </button>
                    <button
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${allocationMode === 'total' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      onClick={() => setAllocationMode('total')}
                    >
                      總持股
                    </button>
                  </div>
                </div>
                <div className="h-[240px]">
                  <InvestmentAllocationChart
                    slices={
                      allocationMode === 'year'
                        ? allocationYear
                        : allocationTotal
                    }
                    centerLabel="總股數"
                    centerValueFormatter={(val) => val.toLocaleString()}
                  />
                </div>
              </section>
            </div>

            <section className="md:col-span-7 bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm text-left flex flex-col overflow-hidden">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-[14px] font-black text-slate-900 tracking-tight truncate">
                    持股目標 {allTickers.length > 0 && `(${allTickers.length})`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={openNewGoal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                  >
                    <Icon name="plus" className="h-3 w-3" />
                    新增
                  </button>
                  {allTickers.length > 0 && (
                    <button
                      onClick={() =>
                        setSortMode(
                          sortMode === 'progress-desc'
                            ? 'progress-asc'
                            : 'progress-desc',
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold transition bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      排序 {sortMode === 'progress-desc' ? '↓' : '↑'}
                    </button>
                  )}
                </div>
              </div>

              {allTickers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 border border-dashed border-slate-200">
                    <Icon name="target" className="h-8 w-8" />
                  </div>
                  <p className="text-[14px] font-medium text-slate-400 mb-6">
                    設定您的第一個存股目標
                  </p>
                  <button
                    onClick={openNewGoal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    新增存股目標
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {cards.map((card) => (
                    <div
                      key={card.ticker}
                      onClick={() => openEditGoal(card.ticker)}
                      className={`cursor-pointer rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 transition-all group ${card.goal ? 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5' : 'border-amber-100 bg-amber-50/30 hover:border-amber-200 hover:bg-amber-50/50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                            <span className="truncate group-hover:text-blue-600 transition-colors">
                              {card.name}
                            </span>
                            <span className="text-[11px] font-black text-slate-300 shrink-0">
                              {card.ticker}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => openAddRecord(e, card.ticker)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[12px] font-bold hover:bg-blue-100 transition-all active:scale-95"
                          >
                            <Icon name="plus" className="h-3 w-3" />
                            買進
                          </button>
                          <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                            <Icon name="more-horizontal" className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4 sm:gap-6">
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${card.goal ? (card.progress >= 100 ? 'bg-emerald-500' : 'bg-slate-900') : 'bg-slate-200'}`}
                            style={{
                              width: `${card.goal ? card.progress : 5}%`,
                            }}
                          ></div>
                        </div>
                        {card.goal && (
                          <div
                            className={`shrink-0 text-[12px] font-bold tabular-nums w-10 text-right ${card.progress >= 100 ? 'text-emerald-500' : 'text-slate-600'}`}
                          >
                            {card.progress}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <BottomNav onAddAsset={openNewGoal} />

      <AddGoalModal
        open={goalModalOpen}
        mode={goalModalMode}
        initialTicker={goalModalTicker}
        initialShares={goalModalShares}
        onClose={() => setGoalModalOpen(false)}
        onSave={(ticker, shares) => setGoal(ticker, shares)}
        onRemove={
          goalModalMode === 'edit'
            ? () => removeGoal(goalModalTicker)
            : undefined
        }
      />

      <AddAssetModal
        open={assetModalOpen}
        initialType="stock"
        initialTicker={assetModalTicker}
        investmentAccounts={assets.filter(
          (a) => a.type === 'cash' && a.isInvestmentAccount,
        )}
        onClose={() => setAssetModalOpen(false)}
        onAddAsset={addAsset}
      />
    </div>
  );
}
