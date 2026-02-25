"use client";

import { useState } from "react";
import PortfolioHeader from "../features/portfolio/components/PortfolioHeader";
import NetWorthChartSection from "../features/portfolio/components/charts/NetWorthChartSection";
import BottomNav from "../features/portfolio/components/BottomNav";
import DetailSheet from "../features/portfolio/components/DetailSheet";
import AddAssetModal from "../features/portfolio/components/AddAssetModal";
import TopBar from "../features/portfolio/components/TopBar";
import { usePortfolioData } from "../features/portfolio/hooks/usePortfolioData";
import { useLucideIcons } from "../features/portfolio/hooks/useLucideIcons";
import TotalSummary from "../features/portfolio/components/TotalSummary";
import EmptyStateWelcome from "../features/portfolio/components/EmptyStateWelcome";
import AssetStructureSection from "../features/portfolio/components/AssetStructureSection";
import EmptyStateHero from "../features/portfolio/components/EmptyStateHero";
import Icon from "../components/Icon";

export default function Page() {
  useLucideIcons();

  const [privacy, setPrivacy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<"cash" | "stock" | null>(null);

  const {
    assets,
    history,
    stockPrices,
    cashTotal,
    stockTotal,
    animatedTotal,
    cashCount,
    stockCount,
    cashPct,
    stockPct,
    updatedAt,
    chartResetKey,
    isReady,
    initialLoadState,
    addAsset,
    updateAsset,
    removeAsset,
    toggleClearData,
  } = usePortfolioData({ privacy });

  const togglePrivacy = () => {
    setPrivacy((prev) => !prev);
  };

  const toggleAddModal = () => {
    setModalOpen((prev) => !prev);
  };

  const openDetail = (type: "cash" | "stock") => {
    if (!assets.length) return;
    setDetailType(type);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailType(null);
  };

  if (!isReady) {
    return (
      <main className="min-h-screen relative z-10 bg-slate-50/50">
        <TopBar onAdd={toggleAddModal} />
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:pt-14 md:pb-14">
          <div className="soft-card p-6">
            <div className="flex flex-col gap-4">
              <div className="skeleton skeleton-text w-40"></div>
              <div className="skeleton skeleton-title w-64"></div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="skeleton skeleton-text w-full"></div>
                <div className="skeleton skeleton-text w-full"></div>
                <div className="skeleton skeleton-text w-full"></div>
              </div>
              <div className="skeleton skeleton-title w-full h-32"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  const hasAssets = isReady && assets.length > 0;
  const showEmptyHero = (isReady && !hasAssets) || (!isReady && initialLoadState === "empty");
  const showDashboard = (isReady && hasAssets) || (!isReady && initialLoadState === "hasData");

  return (
    <main className="min-h-screen relative z-10 bg-slate-50/50">
      <TopBar onAdd={toggleAddModal} privacy={privacy} onTogglePrivacy={togglePrivacy} />
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:pt-20 md:pb-14">
        {showEmptyHero ? (
          <div className="pt-6 sm:pt-10 md:pt-12">
            <EmptyStateHero onAddAsset={toggleAddModal} />
          </div>
        ) : showDashboard ? (
          <>
            <div className="md:hidden">
              <PortfolioHeader
                hasAssets={hasAssets}
                privacy={privacy}
                onAddAsset={toggleAddModal}
                onTogglePrivacy={togglePrivacy}
                onToggleClearData={toggleClearData}
              />

              <div className="grid grid-cols-1 gap-8">
                <div className="flex flex-col gap-8">
                  <TotalSummary privacy={privacy} animatedTotal={animatedTotal} updatedAt={updatedAt} />
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
                    onOpenDetail={openDetail}
                    onAddAsset={toggleAddModal}
                  />
                  <EmptyStateWelcome hasAssets={hasAssets} isReady={isReady} onAddAsset={toggleAddModal} />
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-7 min-w-0">
                  <div className="soft-card p-6 relative">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <i data-lucide="layout-dashboard" className="h-4 w-4"></i>
                        </span>
                        <span className="text-[12px] font-semibold text-gray-500">資產概覽</span>
                      </div>
                      <div className="flex items-center gap-2"></div>
                    </div>
                    <TotalSummary privacy={privacy} animatedTotal={animatedTotal} updatedAt={updatedAt} />
                    <div className="absolute right-6 bottom-6 hidden md:flex items-center gap-1.5 text-[11px] text-slate-500">
                      <i data-lucide="clock" className="h-3.5 w-3.5"></i>
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
                          <i data-lucide="layout-dashboard" className="h-4 w-4"></i>
                        </span>
                        <span className="text-[12px] font-semibold text-gray-500">資產配置</span>
                      </div>
                      <button
                        onClick={toggleAddModal}
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
                      onOpenDetail={openDetail}
                      onAddAsset={toggleAddModal}
                    />
                    <div className="mt-6">
                      <EmptyStateWelcome hasAssets={hasAssets} isReady={isReady} onAddAsset={toggleAddModal} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <BottomNav />

      <DetailSheet
        open={detailOpen}
        type={detailType}
        assets={assets}
        cashTotal={cashTotal}
        cashCount={cashCount}
        stockPrices={stockPrices}
        onClose={closeDetail}
        onUpdateAsset={updateAsset}
        onRemoveAsset={removeAsset}
      />

      <AddAssetModal
        open={modalOpen}
        onClose={toggleAddModal}
        onAddAsset={addAsset}
      />


    </main>
  );
}
