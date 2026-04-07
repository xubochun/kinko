import { HistoryEntry } from '../../../types/portfolio';
import PortfolioHeader from './PortfolioHeader';
import TotalSummary from './TotalSummary';
import NetWorthChartSection from './charts/NetWorthChartSection';
import AssetStructureSection from './AssetStructureSection';
import EmptyStateWelcome from './EmptyStateWelcome';
import Icon from '../../../components/Icon';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
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
  onAddAsset: () => void;
  onTogglePrivacy: () => void;
  onToggleClearData: () => void;
  onOpenDetail: (type: 'cash' | 'stock') => void;
}

export default function DashboardLayout({
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
  onToggleClearData,
  onOpenDetail,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <div className="w-full px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-12 md:pb-12">
          {/* Mobile Header */}
          <div className="md:hidden">
            <PortfolioHeader
              hasAssets={hasAssets}
              privacy={privacy}
              onAddAsset={onAddAsset}
              onTogglePrivacy={onTogglePrivacy}
              onToggleClearData={onToggleClearData}
            />

            <div className="flex flex-col gap-6">
              <TotalSummary
                privacy={privacy}
                animatedTotal={animatedTotal}
                updatedAt={updatedAt}
              />
              <NetWorthChartSection
                hasAssets={hasAssets}
                isReady={isReady}
                history={history}
                privacy={privacy}
                resetKey={chartResetKey}
              />
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
                onOpenDetail={onOpenDetail}
                onAddAsset={onAddAsset}
              />
              <EmptyStateWelcome
                hasAssets={hasAssets}
                isReady={isReady}
                onAddAsset={onAddAsset}
              />
            </div>
          </div>

          {/* Desktop Dashboard */}
          <div className="hidden md:block">
            <header className="mb-10 flex items-center justify-between">
              <div>
                <h1 className="text-[24px] font-black text-slate-900 tracking-tight">
                  資產概覽
                </h1>
                <p className="text-[13px] font-medium text-slate-400 mt-1">
                  更新於 {updatedAt}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onTogglePrivacy}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                    privacy
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon
                    name={privacy ? 'eye' : 'eye-off'}
                    className="h-4 w-4"
                  />
                  {privacy ? '顯示金額' : '隱藏金額'}
                </button>
                <button
                  onClick={onAddAsset}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  新增資產
                </button>
              </div>
            </header>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 space-y-6">
                {/* Total Summary Row */}
                <section className="bg-white rounded-3xl p-8 border border-slate-200">
                  <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    當前資產總額
                  </div>
                  <TotalSummary
                    privacy={privacy}
                    animatedTotal={animatedTotal}
                    updatedAt={updatedAt}
                  />
                </section>

                <div className="grid grid-cols-12 gap-6">
                  {/* Left Column: Chart */}
                  <div className="col-span-7">
                    <section className="bg-white rounded-3xl p-6 border border-slate-200 h-full">
                      <NetWorthChartSection
                        hasAssets={hasAssets}
                        isReady={isReady}
                        history={history}
                        privacy={privacy}
                        resetKey={chartResetKey}
                      />
                    </section>
                  </div>

                  {/* Right Column: Asset Structure */}
                  <div className="col-span-5">
                    <section className="bg-white rounded-3xl p-8 border border-slate-200 h-full">
                      <div className="text-[14px] font-bold text-slate-900 mb-8">
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
                        onOpenDetail={onOpenDetail}
                        onAddAsset={onAddAsset}
                      />
                      <div className="mt-8">
                        <EmptyStateWelcome
                          hasAssets={hasAssets}
                          isReady={isReady}
                          onAddAsset={onAddAsset}
                        />
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
