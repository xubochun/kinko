import { HistoryEntry } from '../../../types/portfolio';
import PortfolioHeader from './PortfolioHeader';
import TotalSummary from './TotalSummary';
import NetWorthChartSection from './charts/NetWorthChartSection';
import AssetStructureSection from './AssetStructureSection';
import EmptyStateWelcome from './EmptyStateWelcome';
import Icon from '../../../components/Icon';

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
    <>
      <div className="md:hidden">
        <PortfolioHeader
          hasAssets={hasAssets}
          privacy={privacy}
          onAddAsset={onAddAsset}
          onTogglePrivacy={onTogglePrivacy}
          onToggleClearData={onToggleClearData}
        />

        <div className="flex flex-col gap-8">
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

      <div className="hidden md:block">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-7 min-w-0">
            <div className="soft-card p-6 relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Icon name="layout-dashboard" className="h-4 w-4" />
                  </span>
                  <span className="text-[12px] font-semibold text-gray-500">
                    資產概覽
                  </span>
                </div>
              </div>
              <TotalSummary
                privacy={privacy}
                animatedTotal={animatedTotal}
                updatedAt={updatedAt}
              />
              <div className="absolute right-6 bottom-6 hidden md:flex items-center gap-1.5 text-[11px] text-slate-500">
                <Icon name="clock" className="h-3.5 w-3.5" />
                <span className="tabular-nums">更新於 {updatedAt}</span>
              </div>
            </div>
            <div className="mt-6">
              <NetWorthChartSection
                hasAssets={hasAssets}
                isReady={isReady}
                history={history}
                privacy={privacy}
                resetKey={chartResetKey}
              />
            </div>
          </div>
          <div className="col-span-5">
            <div className="soft-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Icon name="layout-dashboard" className="h-4 w-4" />
                  </span>
                  <span className="text-[12px] font-semibold text-gray-500">
                    資產配置
                  </span>
                </div>
                <button
                  onClick={onAddAsset}
                  aria-label="新增資產"
                  title="新增資產"
                  className="hidden md:inline-flex items-center justify-center h-[36px] w-[36px] rounded-full bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
                >
                  <Icon name="plus" className="h-4 w-4" />
                </button>
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
              <div className="mt-6">
                <EmptyStateWelcome
                  hasAssets={hasAssets}
                  isReady={isReady}
                  onAddAsset={onAddAsset}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
