import { useEffect, useMemo, useState } from 'react';
import type { Asset } from '../../../types/portfolio';
import {
  currency,
  formatPnlAmount,
  formatPnlPct,
  pnlClass,
} from '../../../lib/format';
import { groupStocks, summarizeStocks } from '../lib/portfolio';
import Icon from '../../../components/Icon';
import CashDetailItem from './detail/CashDetailItem';
import StockDetailGroup from './detail/StockDetailGroup';

type Props = {
  open: boolean;
  type: 'cash' | 'stock' | null;
  assets: Asset[];
  cashTotal: number;
  cashCount: number;
  stockPrices: Record<string, number>;
  onClose: () => void;
  onUpdateAsset: (id: number, payload: Partial<Asset>) => void;
  onRemoveAsset: (id: number) => void;
};

export default function DetailSheet({
  open,
  type,
  assets,
  cashTotal,
  cashCount,
  stockPrices,
  onClose,
  onUpdateAsset,
  onRemoveAsset,
}: Props) {
  const [openTicker, setOpenTicker] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editShares, setEditShares] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [showActionMenuId, setShowActionMenuId] = useState<
    number | string | null
  >(null);

  useEffect(() => {
    if (open) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setOpenTicker(null);
      setShowActionMenuId(null);
      setEditingId(null);
      setEditingTicker(null);
    }
    if (open && type === 'stock') setOpenTicker(null);
  }, [open, type]);

  const stockAssets = useMemo(
    () => assets.filter((a) => a.type === 'stock'),
    [assets],
  );

  const groupedStocks = useMemo(() => groupStocks(stockAssets), [stockAssets]);
  const stockSummary = useMemo(
    () => summarizeStocks(groupedStocks, stockPrices),
    [groupedStocks, stockPrices],
  );

  const onTickerToggle = (ticker: string) => {
    if (showActionMenuId) return;
    setOpenTicker((prev) => (prev === ticker ? null : ticker));
  };

  const handleEdit = (assetOrTicker: Asset | string) => {
    setShowActionMenuId(null);
    setTimeout(() => {
      if (typeof assetOrTicker === 'string') {
        setEditingTicker(assetOrTicker);
        const firstLot = assets.find((a) => a.ticker === assetOrTicker);
        setEditName(firstLot?.name || assetOrTicker);
        return;
      }

      setEditingId(assetOrTicker.id);
      if (assetOrTicker.type === 'cash') {
        setEditName(assetOrTicker.name || '');
        setEditAmount(String(assetOrTicker.amount || ''));
      } else {
        setEditDate(assetOrTicker.date || '');
        setEditShares(String(assetOrTicker.shares || ''));
        setEditPrice(String(assetOrTicker.price || ''));
      }
    }, 20);
  };

  const handleSave = () => {
    if (editingTicker) {
      const targetLots = assets.filter((a) => a.ticker === editingTicker);
      targetLots.forEach((lot) => {
        onUpdateAsset(lot.id, { name: editName });
      });
      setEditingTicker(null);
      return;
    }

    if (editingId) {
      const asset = assets.find((a) => a.id === editingId);
      if (asset?.type === 'cash') {
        onUpdateAsset(editingId, {
          name: editName,
          amount: Number(editAmount),
        });
      } else {
        onUpdateAsset(editingId, {
          date: editDate,
          shares: Number(editShares),
          price: Number(editPrice),
          costAmount: Number(editShares) * Number(editPrice),
        });
      }
      setEditingId(null);
    }
  };

  const handleDelete = (idOrTicker: number | string) => {
    if (typeof idOrTicker === 'string') {
      if (confirm(`確定要刪除 ${idOrTicker} 的所有持股紀錄嗎？`)) {
        const targetIds = assets
          .filter((a) => a.type === 'stock' && a.ticker === idOrTicker)
          .map((a) => a.id);
        targetIds.forEach((id) => onRemoveAsset(id));
        setShowActionMenuId(null);
      }
      return;
    }

    if (confirm('確定要刪除這筆紀錄嗎？')) {
      onRemoveAsset(idOrTicker);
      setShowActionMenuId(null);
    }
  };

  const startPress = (id: number | string) => {
    const timer = setTimeout(() => {
      setShowActionMenuId(id);
      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }, 500);
    setLongPressTimer(timer);
  };

  const endPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div
      id="detailOverlay"
      className={`fixed inset-0 z-50 flex items-end md:items-center justify-center ${open ? 'modal-enter-active' : 'modal-enter'}`}
    >
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <div
        id="detailSheet"
        className={`detail-sheet detail-sheet--fullscreen relative w-full bg-white mx-auto shadow-2xl ${open ? 'sheet-enter-active' : 'sheet-enter'} ${type === 'stock' ? 'detail-sheet--stock' : ''}`}
      >
        <div className="detail-header detail-header--minimal">
          <button
            onClick={onClose}
            className="detail-close detail-close--single"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="detail-content overflow-y-auto flex-1">
          <div
            id="detailSummary"
            className={`detail-summary mb-4 ${type === 'stock' ? 'detail-summary--stock' : ''}`}
          >
            {type === 'cash' && (
              <>
                <div className="text-[12px] text-gray-500">總現金</div>
                <div className="text-[18px] font-semibold text-gray-900 tabular-nums">
                  {currency(cashTotal)}
                </div>
                <div className="text-[12px] text-gray-500 mt-1">
                  {cashCount} 個帳戶
                </div>
              </>
            )}
            {type === 'stock' && (
              <>
                <div className="summary-top">
                  <div className="summary-label">總市值</div>
                  <div className="summary-value summary-value--right summary-value--accent tabular-nums">
                    {currency(stockSummary.totalValue)}
                  </div>
                </div>
                <div className="summary-rows">
                  <div className="summary-row">
                    <div className="summary-label">總成本</div>
                    <div className="summary-value-sm summary-value--right summary-value--muted tabular-nums">
                      {currency(stockSummary.totalCost)}
                    </div>
                  </div>
                  <div className="summary-row">
                    <div className="summary-label">總損益</div>
                    <div
                      className={`summary-value-sm summary-value--right ${pnlClass(stockSummary.totalPnl)} tabular-nums`}
                    >
                      <span>{formatPnlAmount(stockSummary.totalPnl)}</span>
                      <span className="summary-sub">
                        {formatPnlPct(stockSummary.totalPnlPct)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div
            id="detailBody"
            className={`detail-body ${type === 'stock' ? 'detail-body--stock' : ''}`}
          >
            {type === 'cash' &&
              (assets.filter((a) => a.type === 'cash').length === 0 ? (
                <div className="detail-row text-[13px] text-gray-500">
                  尚未新增現金帳戶
                </div>
              ) : (
                assets
                  .filter((a) => a.type === 'cash')
                  .map((asset) => (
                    <CashDetailItem
                      key={asset.id}
                      asset={asset}
                      isEditing={editingId === asset.id}
                      showActionMenu={showActionMenuId === asset.id}
                      editName={editName}
                      editAmount={editAmount}
                      setEditName={setEditName}
                      setEditAmount={setEditAmount}
                      onSave={handleSave}
                      onCancelEdit={() => setEditingId(null)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onShowMenu={(id) => setShowActionMenuId(id)}
                      onHideMenu={() => setShowActionMenuId(null)}
                      startPress={startPress}
                      endPress={endPress}
                    />
                  ))
              ))}

            {type === 'stock' &&
              (stockAssets.length === 0 ? (
                <div className="detail-row text-[13px] text-gray-500">
                  尚未新增股票資產
                </div>
              ) : (
                Object.keys(groupedStocks).map((ticker) => (
                  <StockDetailGroup
                    key={ticker}
                    ticker={ticker}
                    lots={groupedStocks[ticker]}
                    price={Number(stockPrices[ticker] || 0)}
                    isOpen={openTicker === ticker}
                    editingTicker={editingTicker}
                    editName={editName}
                    showActionMenuId={showActionMenuId}
                    editingId={editingId}
                    editShares={editShares}
                    editPrice={editPrice}
                    editDate={editDate}
                    onTickerToggle={onTickerToggle}
                    setEditName={setEditName}
                    setEditShares={setEditShares}
                    setEditPrice={setEditPrice}
                    setEditDate={setEditDate}
                    onSave={handleSave}
                    onCancelTickerEdit={() => setEditingTicker(null)}
                    onCancelLotEdit={() => setEditingId(null)}
                    onEditTicker={handleEdit}
                    onEditLot={handleEdit}
                    onDeleteTicker={handleDelete}
                    onDeleteLot={handleDelete}
                    onHideMenu={() => setShowActionMenuId(null)}
                    startPress={startPress}
                    endPress={endPress}
                  />
                ))
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
