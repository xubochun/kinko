'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePortfolioData } from '../../features/portfolio/hooks/usePortfolioData';
import { useDividends } from '../../features/portfolio/hooks/useDividends';
import { groupStocks } from '../../features/portfolio/lib/portfolio';
import {
  holdingFromLots,
  simulateBuys,
  summarizeHolding,
  type Holding,
} from '../../features/portfolio/lib/averageCost';
import { parseNumberInput } from '../../lib/number';
import BottomNav from '../../features/portfolio/components/BottomNav';
import Sidebar from '../../features/portfolio/components/Sidebar';
import PortfolioHeader from '../../features/portfolio/components/PortfolioHeader';
import Icon from '../../components/Icon';
import HoldingSummary from '../../features/portfolio/components/calculator/HoldingSummary';
import DividendSection from '../../features/portfolio/components/calculator/DividendSection';
import BuyPlanSection, {
  type BuyDraft,
} from '../../features/portfolio/components/calculator/BuyPlanSection';
import SimulationResult from '../../features/portfolio/components/calculator/SimulationResult';
import ManualHoldingInputs, {
  type ManualDraft,
} from '../../features/portfolio/components/calculator/ManualHoldingInputs';

const MANUAL = '__manual__';

export default function CalculatorPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { assets, isReady, stockPrices } = usePortfolioData({
    privacy: false,
  });
  const { getDividends, addDividend, removeDividend } = useDividends();

  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [manual, setManual] = useState<ManualDraft>({
    shares: '',
    avg: '',
    dividends: '',
    price: '',
  });
  const [buys, setBuys] = useState<BuyDraft[]>([
    { id: 1, shares: '', price: '' },
  ]);

  const stockAssets = useMemo(
    () => assets.filter((a) => a.type === 'stock'),
    [assets],
  );
  const grouped = useMemo(() => groupStocks(stockAssets), [stockAssets]);
  const tickers = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  useEffect(() => {
    if (!isReady || selectedTicker) return;
    setSelectedTicker(tickers[0] ?? MANUAL);
  }, [isReady, tickers, selectedTicker]);

  const isManual = selectedTicker === MANUAL;
  const lots = useMemo(
    () => (isManual ? [] : grouped[selectedTicker] || []),
    [isManual, grouped, selectedTicker],
  );
  const dividendRecords = isManual ? [] : getDividends(selectedTicker);

  const holding: Holding = useMemo(() => {
    if (isManual) {
      const shares = parseNumberInput(manual.shares) ?? 0;
      const avg = parseNumberInput(manual.avg) ?? 0;
      return {
        shares,
        cost: shares * avg,
        dividends: parseNumberInput(manual.dividends) ?? 0,
      };
    }
    return holdingFromLots(lots, dividendRecords);
  }, [isManual, manual, lots, dividendRecords]);

  const currentPrice = isManual
    ? (parseNumberInput(manual.price) ?? 0)
    : Number(stockPrices[selectedTicker] || 0);

  const before = useMemo(() => summarizeHolding(holding), [holding]);
  const after = useMemo(
    () =>
      simulateBuys(
        holding,
        buys.map((b) => ({
          shares: parseNumberInput(b.shares) ?? 0,
          price: parseNumberInput(b.price) ?? 0,
        })),
      ),
    [holding, buys],
  );

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
                含除息調整的均價與加碼試算
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
                  含除息調整的均價與加碼試算
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-5xl space-y-4">
            <div className="relative max-w-md">
              <select
                value={selectedTicker}
                onChange={(e) => {
                  setSelectedTicker(e.target.value);
                  setBuys([{ id: Date.now(), shares: '', price: '' }]);
                }}
                className="w-full appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] font-black text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10"
              >
                {tickers.map((t) => (
                  <option key={t} value={t}>
                    {grouped[t]?.[0]?.name || t}（{t}）
                  </option>
                ))}
                <option value={MANUAL}>✏️ 手動輸入（未記錄的股票）</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="chevron-down" className="h-4 w-4" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div className="space-y-4">
                {isManual && (
                  <ManualHoldingInputs value={manual} onChange={setManual} />
                )}
                <HoldingSummary summary={before} currentPrice={currentPrice} />
                {!isManual && selectedTicker && (
                  <DividendSection
                    lots={lots}
                    records={dividendRecords}
                    onAdd={(r) => addDividend(selectedTicker, r)}
                    onRemove={(id) => removeDividend(selectedTicker, id)}
                  />
                )}
              </div>
              <div className="space-y-4 md:sticky md:top-6">
                <BuyPlanSection
                  rows={buys}
                  currentPrice={currentPrice}
                  onChange={setBuys}
                />
                <SimulationResult
                  before={before}
                  after={after}
                  currentPrice={currentPrice}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
