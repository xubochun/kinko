'use client';

import { useState } from 'react';
import BottomNav from '../features/portfolio/components/BottomNav';
import DetailSheet from '../features/portfolio/components/DetailSheet';
import AddAssetModal from '../features/portfolio/components/AddAssetModal';
import { usePortfolioData } from '../features/portfolio/hooks/usePortfolioData';
import { useLucideIcons } from '../features/portfolio/hooks/useLucideIcons';
import EmptyStateHero from '../features/portfolio/components/EmptyStateHero';
import PortfolioLoading from '../features/portfolio/components/PortfolioLoading';
import DashboardLayout from '../features/portfolio/components/DashboardLayout';

export default function Page() {
  useLucideIcons();

  const [privacy, setPrivacy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<'cash' | 'stock' | null>(null);

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

  const togglePrivacy = () => setPrivacy((prev) => !prev);
  const toggleAddModal = () => setModalOpen((prev) => !prev);

  const openDetail = (type: 'cash' | 'stock') => {
    if (!assets.length) return;
    setDetailType(type);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailType(null);
  };

  if (!isReady) {
    return <PortfolioLoading onAdd={toggleAddModal} />;
  }

  const hasAssets = isReady && assets.length > 0;
  const showEmptyHero =
    (isReady && !hasAssets) || (!isReady && initialLoadState === 'empty');
  const showDashboard =
    (isReady && hasAssets) || (!isReady && initialLoadState === 'hasData');

  return (
    <main className="min-h-screen relative z-10">
      <div className="w-full">
        {showEmptyHero ? (
          <div className="px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:pt-20 md:pb-14">
            <div className="pt-6 sm:pt-10 md:pt-12">
              <EmptyStateHero onAddAsset={toggleAddModal} />
            </div>
          </div>
        ) : showDashboard ? (
          <DashboardLayout
            hasAssets={hasAssets}
            isReady={isReady}
            privacy={privacy}
            animatedTotal={animatedTotal}
            updatedAt={updatedAt}
            history={history}
            chartResetKey={chartResetKey}
            cashPct={cashPct}
            stockPct={stockPct}
            cashCount={cashCount}
            stockCount={stockCount}
            cashTotal={cashTotal}
            stockTotal={stockTotal}
            onAddAsset={toggleAddModal}
            onTogglePrivacy={togglePrivacy}
            onToggleClearData={toggleClearData}
            onOpenDetail={openDetail}
          />
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
