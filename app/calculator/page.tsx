'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePortfolioData } from '../../features/portfolio/hooks/usePortfolioData';
import { groupStocks } from '../../features/portfolio/lib/portfolio';
import BottomNav from '../../features/portfolio/components/BottomNav';
import Sidebar from '../../features/portfolio/components/Sidebar';
import PortfolioHeader from '../../features/portfolio/components/PortfolioHeader';
import Icon from '../../components/Icon';

export default function CalculatorPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { assets, isReady } = usePortfolioData({
    privacy: false,
  });

  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [buySharesStr, setBuySharesStr] = useState<string>('');
  const [buyPriceStr, setBuyPriceStr] = useState<string>('');

  const stockAssets = useMemo(
    () => assets.filter((a) => a.type === 'stock'),
    [assets],
  );

  const grouped = useMemo(() => groupStocks(stockAssets), [stockAssets]);

  const tickers = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  // Set default selected ticker if available
  useEffect(() => {
    if (tickers.length > 0 && !selectedTicker) {
      setSelectedTicker(tickers[0]);
    }
  }, [tickers, selectedTicker]);

  const currentStats = useMemo(() => {
    if (!selectedTicker || !grouped[selectedTicker]) {
      return { shares: 0, totalCost: 0, avgPrice: 0, name: '' };
    }
    const lots = grouped[selectedTicker];
    const name = lots[0]?.name || selectedTicker;
    const shares = lots.reduce((acc, lot) => acc + (lot.shares || 0), 0);
    const totalCost = lots.reduce(
      (acc, lot) =>
        acc + (lot.costAmount || (lot.shares || 0) * (lot.price || 0)),
      0,
    );
    const avgPrice = shares > 0 ? totalCost / shares : 0;

    return { shares, totalCost, avgPrice, name };
  }, [grouped, selectedTicker]);

  const buyShares = Number(buySharesStr) || 0;
  const buyPrice = Number(buyPriceStr) || 0;

  const results = useMemo(() => {
    const additionalCost = buyShares * buyPrice;
    const newShares = currentStats.shares + buyShares;
    const newTotalCost = currentStats.totalCost + additionalCost;
    const newAvgPrice = newShares > 0 ? newTotalCost / newShares : 0;

    return {
      additionalCost,
      newShares,
      newTotalCost,
      newAvgPrice,
    };
  }, [currentStats, buyShares, buyPrice]);

  if (!isReady || !mounted) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <Sidebar />
        <main className="flex-1 md:ml-64 relative z-10 min-w-0">
          <div className="w-full px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-12 md:pb-12">
            <div className="animate-pulse">
              <div className="h-10 w-48 bg-slate-200 rounded-lg mb-10 hidden md:block"></div>
              <div className="h-[400px] w-full max-w-2xl bg-white border border-slate-200 rounded-[24px] md:rounded-[32px]"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 md:ml-64 relative z-10 min-w-0">
        <div className="w-full px-4 pb-24 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-12 md:pb-12 text-left overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden overflow-hidden">
            <PortfolioHeader
              hasAssets={tickers.length > 0}
              privacy={false}
              onTogglePrivacy={() => {}}
            />
          </div>

          {/* Desktop Header */}
          <header className="mb-6 md:mb-10 hidden md:flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[26px] font-black text-slate-900 tracking-tight">
                  均價計算機
                </h1>
              </div>
              <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                計算加碼或攤平後的持股均價
              </p>
            </div>
          </header>

          <div className="md:hidden mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
                  均價計算機
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  計算加碼或攤平後的持股均價
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            <section className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm text-left flex flex-col overflow-hidden">
              {tickers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 border border-dashed border-slate-200">
                    <Icon name="calculator" className="h-8 w-8" />
                  </div>
                  <p className="text-[14px] font-medium text-slate-400 mb-2">
                    您目前尚未持有任何股票
                  </p>
                  <p className="text-[12px] text-slate-400">
                    請先在首頁新增股票資產後，再來使用均價計算機。
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Stock Selection */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-900 mb-2">
                      選擇股票
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTicker}
                        onChange={(e) => setSelectedTicker(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all pr-10"
                      >
                        {tickers.map((t) => (
                          <option key={t} value={t}>
                            {grouped[t]?.[0]?.name || t} ({t})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Icon name="chevron-down" className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        目前持有股數
                      </div>
                      <div className="text-[18px] font-black text-slate-900 flex items-baseline gap-1">
                        {currentStats.shares.toLocaleString()}{' '}
                        <span className="text-[12px] text-slate-500 font-bold">
                          股
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        目前均價
                      </div>
                      <div className="text-[18px] font-black text-slate-900 flex items-baseline gap-1">
                        {currentStats.avgPrice.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-900 mb-2">
                        預計買入股數
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={buySharesStr}
                          onChange={(e) => setBuySharesStr(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[13px] font-bold">
                          股
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-900 mb-2">
                        預計買入價位
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={buyPriceStr}
                          onChange={(e) => setBuyPriceStr(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10">
                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      購買後試算結果
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
                      <div>
                        <div className="text-[11px] font-medium text-slate-400 mb-1">
                          購買後總股數
                        </div>
                        <div className="text-[20px] font-black text-white flex items-baseline gap-1">
                          {results.newShares.toLocaleString()}{' '}
                          <span className="text-[12px] font-bold text-slate-400">
                            股
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-slate-400 mb-1">
                          預計花費
                        </div>
                        <div className="text-[20px] font-black text-white">
                          {results.additionalCost.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-[11px] font-medium text-emerald-400 mb-1">
                          購買後均價
                        </div>
                        <div className="text-[24px] font-black text-emerald-400">
                          {results.newAvgPrice.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
