import { useMemo, useState, useEffect } from 'react';
import { HistoryEntry, Asset } from '../../../types/portfolio';
import { groupStocks } from '../lib/portfolio';
import { lotCost } from '../lib/stockStats';
import PortfolioHeader from './PortfolioHeader';
import TotalSummary from './TotalSummary';
import NetWorthChartSection from './charts/NetWorthChartSection';
import AssetStructureSection from './AssetStructureSection';
import Icon from '../../../components/Icon';
import Sidebar from './Sidebar';
import { CashBreakdown, StockBreakdown } from './layout/AssetBreakdown';

interface DashboardLayoutProps {
  assets: Asset[];
  stockPrices: Record<string, number>;
  hasAssets: boolean;
  isReady: boolean;
  privacy: boolean;
  animatedTotal: number;
  updatedAt: string;
  history: HistoryEntry[];
  chartResetKey: number;
  cashPct: string;
  stockPct: string;
  cashCount: number;
  stockCount: number;
  cashTotal: number;
  stockTotal: number;
  onAddAsset: (type?: 'cash' | 'stock') => void;
  onTogglePrivacy: () => void;
  onToggleClearData: () => void;
  onOpenDetail: (
    type: 'cash' | 'stock' | 'stock-allocation',
    ticker?: string,
  ) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onQuickUpdateCash: (id?: number) => void;
}

const PrivacyButton = ({
  privacy,
  onTogglePrivacy,
}: {
  privacy: boolean;
  onTogglePrivacy: () => void;
}) => (
  <button
    onClick={onTogglePrivacy}
    className={`flex items-center justify-center h-7 w-7 rounded-xl transition-all active:scale-90 shadow-sm border ${
      privacy
        ? 'bg-slate-900 text-white border-slate-900'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
    }`}
    aria-label={privacy ? '顯示金額' : '隱藏金額'}
  >
    <Icon name={privacy ? 'eye' : 'eye-off'} className="h-4 w-4" />
  </button>
);

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm text-left overflow-hidden ${className}`}
  >
    {children}
  </section>
);

export default function DashboardLayout({
  assets,
  stockPrices,
  hasAssets,
  isReady,
  privacy,
  animatedTotal,
  updatedAt,
  history,
  chartResetKey,
  cashPct,
  stockPct,
  cashCount,
  stockCount,
  cashTotal,
  stockTotal,
  onAddAsset,
  onTogglePrivacy,
  onToggleClearData: _onToggleClearData,
  onOpenDetail,
  isRefreshing = false,
  onRefresh,
  onQuickUpdateCash,
}: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Shared Detailed Data Logic
  const cashAssets = useMemo(
    () => assets.filter((a) => a.type === 'cash'),
    [assets],
  );
  const stockAssets = useMemo(
    () => assets.filter((a) => a.type === 'stock'),
    [assets],
  );
  const grouped = useMemo(() => groupStocks(stockAssets), [stockAssets]);

  const stockDetails = useMemo(() => {
    return Object.keys(grouped).map((ticker) => {
      const lots = grouped[ticker];
      const totalShares = lots.reduce((s, l) => s + (l.shares || 0), 0);
      const totalCost = lots.reduce((s, l) => s + lotCost(l), 0);
      const currentPrice = stockPrices[ticker] || 0;
      const currentValue = totalShares * currentPrice;
      const pnl = currentValue - totalCost;
      const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
      return {
        ticker,
        name: lots[0]?.name || ticker,
        totalShares,
        currentValue,
        pnl,
        pnlPct,
        avgCost: totalShares > 0 ? totalCost / totalShares : 0,
        currentPrice,
      };
    });
  }, [grouped, stockPrices]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <div className="flex-1 md:ml-64" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] overflow-x-hidden">
      <Sidebar onAddAsset={() => onAddAsset()} />

      <main className="flex-1 md:ml-64 relative z-10 min-w-0">
        <div className="px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-12 md:pb-12 text-left">
          {/* Mobile View */}
          <div className="md:hidden">
            <PortfolioHeader
              hasAssets={hasAssets}
              privacy={privacy}
              onTogglePrivacy={onTogglePrivacy}
              onAddAsset={() => onAddAsset()}
            />

            <div className="flex flex-col gap-6">
              {!hasAssets ? (
                <div className="py-12 px-4 text-center">
                  <h2 className="text-[24px] font-black text-slate-900 tracking-tight mb-3">
                    開始建立您的投資組合
                  </h2>
                  <p className="text-[15px] font-medium text-slate-400 leading-relaxed mb-10 max-w-[280px] mx-auto">
                    Kinko 為您追蹤資產變化。點擊下方按鈕新增您的第一個資產.
                  </p>
                  <button
                    onClick={() => onAddAsset()}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-[15px] shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                  >
                    立即新增資產
                  </button>
                </div>
              ) : (
                <>
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500 shadow-sm">
                          <Icon name="wallet" className="h-4 w-4" />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          資產總淨值
                        </div>
                        <div className="ml-1">
                          <PrivacyButton
                            privacy={privacy}
                            onTogglePrivacy={onTogglePrivacy}
                          />
                        </div>
                      </div>
                      <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="flex items-center justify-center h-7 w-7 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm transition-all active:scale-90 disabled:opacity-60 disabled:pointer-events-none"
                        aria-label="更新數據"
                        title="更新數據"
                      >
                        <Icon
                          name="refresh-cw"
                          className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>
                    <TotalSummary
                      privacy={privacy}
                      animatedTotal={animatedTotal}
                      updatedAt={updatedAt}
                    />
                  </Card>

                  <Card>
                    <NetWorthChartSection
                      hasAssets={hasAssets}
                      isReady={isReady}
                      history={history}
                      privacy={privacy}
                      resetKey={chartResetKey}
                    />
                  </Card>

                  <Card>
                    <div className="flex items-center gap-3 mb-6 text-[14px] font-black text-slate-900 tracking-tight">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500 shadow-sm">
                        <Icon name="pie-chart" className="h-4 w-4" />
                      </div>
                      資產配置比例
                    </div>
                    <AssetStructureSection
                      hasAssets={hasAssets}
                      isReady={isReady}
                      cashPct={cashPct}
                      stockPct={stockPct}
                      cashCount={cashCount}
                      stockCount={stockCount}
                      cashTotal={cashTotal}
                      stockTotal={stockTotal}
                      privacy={privacy}
                      stockDetails={stockDetails}
                      onOpenDetail={onOpenDetail}
                      onAddAsset={() => onAddAsset()}
                    />
                  </Card>

                  {/* 手機版：兩個區塊直接上下排列，不用切換分頁 */}
                  <StockBreakdown
                    privacy={privacy}
                    stockDetails={stockDetails}
                    onAddAsset={onAddAsset}
                    onOpenDetail={onOpenDetail}
                  />
                  <CashBreakdown
                    privacy={privacy}
                    cashAssets={cashAssets}
                    cashCount={cashCount}
                    onAddAsset={onAddAsset}
                    onOpenDetail={onOpenDetail}
                    onQuickUpdate={onQuickUpdateCash}
                  />
                </>
              )}
            </div>
          </div>

          {/* Desktop Dashboard */}
          <div className="hidden md:block">
            <header className="mb-10">
              <h1 className="text-[26px] font-black text-slate-900 tracking-tight">
                資產概覽
              </h1>
              <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {hasAssets ? `更新於: ${updatedAt}` : '開始追蹤您的個人資產'}
              </p>
            </header>

            {!hasAssets ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-[32px] border border-slate-200 shadow-sm border-dashed">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight mb-4">
                  歡迎來到 Kinko
                </h2>
                <p className="text-[16px] font-medium text-slate-400 leading-relaxed mb-12 max-w-[420px] text-center">
                  您目前尚未新增任何資產紀錄。透過
                  Kinko，您可以集中管理所有銀行帳戶、股票投資，並獲取即時的損益分析。
                </p>
                <button
                  onClick={() => onAddAsset()}
                  className="flex items-center gap-3 px-10 py-4 rounded-[20px] bg-slate-900 text-white font-black text-[16px] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <Icon name="plus" className="h-5 w-5" />
                  立即新增第一個資產
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500 shadow-sm">
                        <Icon name="wallet" className="h-4 w-4" />
                      </div>
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        資產總淨值
                      </div>
                      <div className="ml-1">
                        <PrivacyButton
                          privacy={privacy}
                          onTogglePrivacy={onTogglePrivacy}
                        />
                      </div>
                    </div>
                    <button
                      onClick={onRefresh}
                      disabled={isRefreshing}
                      className="flex items-center justify-center h-7 w-7 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm transition-all active:scale-90 disabled:opacity-60 disabled:pointer-events-none"
                      aria-label="更新數據"
                      title="更新數據"
                    >
                      <Icon
                        name="refresh-cw"
                        className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </div>
                  <TotalSummary
                    privacy={privacy}
                    animatedTotal={animatedTotal}
                    updatedAt={updatedAt}
                  />
                </Card>

                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-7">
                    <Card className="h-full">
                      <NetWorthChartSection
                        hasAssets={hasAssets}
                        isReady={isReady}
                        history={history}
                        privacy={privacy}
                        resetKey={chartResetKey}
                      />
                    </Card>
                  </div>

                  <div className="col-span-5">
                    <Card className="h-full">
                      <div className="flex items-center gap-3 mb-8 text-[14px] font-black text-slate-900 tracking-tight">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500 shadow-sm">
                          <Icon name="pie-chart" className="h-4 w-4" />
                        </div>
                        資產配置比例
                      </div>
                      <AssetStructureSection
                        hasAssets={hasAssets}
                        isReady={isReady}
                        cashPct={cashPct}
                        stockPct={stockPct}
                        cashCount={cashCount}
                        stockCount={stockCount}
                        cashTotal={cashTotal}
                        stockTotal={stockTotal}
                        privacy={privacy}
                        stockDetails={stockDetails}
                        onOpenDetail={onOpenDetail}
                        onAddAsset={() => onAddAsset()}
                      />
                    </Card>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-4">
                    <CashBreakdown
                      privacy={privacy}
                      cashAssets={cashAssets}
                      cashCount={cashCount}
                      onAddAsset={onAddAsset}
                      onOpenDetail={onOpenDetail}
                      onQuickUpdate={onQuickUpdateCash}
                    />
                  </div>
                  <div className="col-span-8">
                    <StockBreakdown
                      privacy={privacy}
                      stockDetails={stockDetails}
                      onAddAsset={onAddAsset}
                      onOpenDetail={onOpenDetail}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
