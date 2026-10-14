'use client';

import { useState } from 'react';
import BottomNav from '../features/portfolio/components/BottomNav';
import DetailSheet from '../features/portfolio/components/DetailSheet';
import AddAssetModal from '../features/portfolio/components/AddAssetModal';
import { usePortfolioData } from '../features/portfolio/hooks/usePortfolioData';
import { useLucideIcons } from '../features/portfolio/hooks/useLucideIcons';
import PortfolioLoading from '../features/portfolio/components/PortfolioLoading';
import DashboardLayout from '../features/portfolio/components/DashboardLayout';
import CashUpdateModal from '../features/portfolio/components/cash/CashUpdateModal';

export default function Page() {
  useLucideIcons();

  const [privacy, setPrivacy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialAssetType, setInitialAssetType] = useState<
    'cash' | 'stock' | undefined
  >(undefined);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<
    'cash' | 'stock' | 'stock-allocation' | null
  >(null);
  const [initialTicker, setInitialTicker] = useState<string | undefined>(
    undefined,
  );
  const [cashUpdateOpen, setCashUpdateOpen] = useState(false);
  const [cashUpdateFocusId, setCashUpdateFocusId] = useState<number | null>(
    null,
  );

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
    addAsset,
    updateAsset,
    removeAsset,
    toggleClearData,
    isRefreshing,
    refreshData,
  } = usePortfolioData({ privacy });

  const togglePrivacy = () => setPrivacy((prev) => !prev);

  const toggleAddModal = (type?: 'cash' | 'stock') => {
    setInitialAssetType(type);
    setModalOpen((prev) => !prev);
  };

  const openDetail = (
    type: 'cash' | 'stock' | 'stock-allocation',
    ticker?: string,
  ) => {
    if (!assets.length && type !== 'stock-allocation') return;
    setDetailType(type);
    setInitialTicker(ticker);
    setDetailOpen(true);
  };

  const openCashUpdate = (id?: number) => {
    setCashUpdateFocusId(id ?? null);
    setCashUpdateOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailType(null);
    setInitialTicker(undefined);
  };

  if (!isReady) {
    return <PortfolioLoading onAdd={() => toggleAddModal()} />;
  }

  const hasAssets = isReady && assets.length > 0;

  return (
    <>
      <DashboardLayout
        assets={assets}
        stockPrices={stockPrices}
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
        isRefreshing={isRefreshing}
        onRefresh={refreshData}
        onQuickUpdateCash={openCashUpdate}
      />

      <BottomNav onAddAsset={() => toggleAddModal()} />

      <DetailSheet
        open={detailOpen}
        type={detailType}
        initialTicker={initialTicker}
        assets={assets}
        cashTotal={cashTotal}
        cashCount={cashCount}
        stockPrices={stockPrices}
        onClose={closeDetail}
        onUpdateAsset={updateAsset}
        onRemoveAsset={removeAsset}
      />

      <CashUpdateModal
        open={cashUpdateOpen}
        cashAssets={assets.filter((a) => a.type === 'cash')}
        focusId={cashUpdateFocusId}
        onClose={() => setCashUpdateOpen(false)}
        onSave={(updates) =>
          updates.forEach((u) => updateAsset(u.id, { amount: u.amount }))
        }
      />

      <AddAssetModal
        open={modalOpen}
        initialType={initialAssetType}
        investmentAccounts={assets.filter(
          (a) => a.type === 'cash' && a.isInvestmentAccount,
        )}
        onClose={() => setModalOpen(false)}
        onAddAsset={addAsset}
      />
    </>
  );
}
