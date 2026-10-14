import { useEffect, useMemo, useRef, useState } from 'react';
import type { Asset } from '../../../types/portfolio';
import {
  currency,
  formatPnlAmount,
  formatPnlPct,
  pnlClass,
} from '../../../lib/format';
import { groupStocks, summarizeStocks } from '../lib/portfolio';
import { lotCost, rescaleLotsToAverage } from '../lib/stockStats';
import Icon from '../../../components/Icon';
import CashDetailItem from './detail/CashDetailItem';
import StockDetailGroup from './detail/StockDetailGroup';
import StockTickerRow from './detail/StockTickerRow';
import { formatPrice } from '../../../lib/number';
import InvestmentAllocationChart from './charts/InvestmentAllocationChart';

type Props = {
  open: boolean;
  type: 'cash' | 'stock' | 'stock-allocation' | null;
  initialTicker?: string;
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
  initialTicker,
  assets,
  cashTotal,
  cashCount,
  stockPrices,
  onClose,
  onUpdateAsset,
  onRemoveAsset,
}: Props) {
  const [openTicker, setOpenTicker] = useState<string | null>(null);
  const [openCashId, setOpenCashId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editIsInvestmentAccount, setEditIsInvestmentAccount] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editShares, setEditShares] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editAverageCost, setEditAverageCost] = useState('');
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
      setOpenCashId(null);
      setShowActionMenuId(null);
      setEditingId(null);
      setEditingTicker(null);
    } else {
      if (type === 'stock') {
        setOpenTicker(initialTicker || null);
      }
    }
  }, [open, type, initialTicker]);

  const stockAssets = useMemo(
    () => assets.filter((a) => a.type === 'stock'),
    [assets],
  );

  const groupedStocks = useMemo(() => groupStocks(stockAssets), [stockAssets]);
  const stockSummary = useMemo(
    () => summarizeStocks(groupedStocks, stockPrices),
    [groupedStocks, stockPrices],
  );

  const stockChartData = useMemo(() => {
    return Object.keys(groupedStocks)
      .map((ticker) => {
        const lots = groupedStocks[ticker];
        const totalShares = lots.reduce((s, l) => s + (l.shares || 0), 0);
        const currentValue = totalShares * (stockPrices[ticker] || 0);
        return {
          label: lots[0]?.name || ticker,
          value: currentValue,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [groupedStocks, stockPrices]);

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [openTicker]);

  const focusLots = openTicker ? groupedStocks[openTicker] : undefined;
  const isStockFocus = type === 'stock' && !!focusLots;

  const onCashToggle = (id: number) => {
    if (showActionMenuId) return;
    setOpenCashId((prev) => (prev === id ? null : id));
  };

  const handleEdit = (assetOrTicker: Asset | string) => {
    setShowActionMenuId(null);
    setTimeout(() => {
      if (typeof assetOrTicker === 'string') {
        setEditingTicker(assetOrTicker);
        const lots = assets.filter((a) => a.ticker === assetOrTicker);
        setEditName(lots[0]?.name || assetOrTicker);

        const totalShares = lots.reduce((s, l) => s + Number(l.shares || 0), 0);
        const totalCost = lots.reduce((s, l) => s + lotCost(l), 0);
        const avgCost = totalShares > 0 ? totalCost / totalShares : 0;
        setEditAverageCost(avgCost > 0 ? String(avgCost) : '');
        return;
      }

      setEditingId(assetOrTicker.id);
      if (assetOrTicker.type === 'cash') {
        setEditName(assetOrTicker.name || '');
        setEditAmount(String(assetOrTicker.amount || ''));
        setEditIsInvestmentAccount(assetOrTicker.isInvestmentAccount || false);
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
      const newAvgCost = Number(editAverageCost);
      const rescaled =
        editAverageCost !== '' && !isNaN(newAvgCost) && newAvgCost >= 0
          ? rescaleLotsToAverage(targetLots, newAvgCost)
          : null;
      targetLots.forEach((lot) => {
        onUpdateAsset(lot.id, { name: editName, ...rescaled?.get(lot.id) });
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
          isInvestmentAccount: editIsInvestmentAccount,
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
        setOpenTicker(null);
      }
      return;
    }

    if (confirm('確定要刪除這筆紀錄嗎？')) {
      onRemoveAsset(idOrTicker);
      setShowActionMenuId(null);
    }
  };

  return (
    <div
      id="detailOverlay"
      className={`fixed inset-0 z-[60] flex items-end md:items-center justify-center ${open ? 'modal-enter-active' : 'modal-enter'}`}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div
        id="detailSheet"
        className={`detail-sheet relative w-full h-[92vh] md:h-[85vh] md:max-w-2xl bg-[#FAFAFA] rounded-t-[32px] md:rounded-[32px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${open ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full md:translate-y-4 opacity-0 md:scale-95'}`}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white border-b border-slate-200/60">
          <div className="flex items-center gap-3 min-w-0">
            {isStockFocus ? (
              <button
                onClick={() => {
                  setOpenTicker(null);
                  setShowActionMenuId(null);
                  setEditingId(null);
                  setEditingTicker(null);
                }}
                aria-label="返回全部持股"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700 active:scale-90"
              >
                <Icon name="chevron-left" className="h-5 w-5" />
              </button>
            ) : (
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${type === 'cash' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'} shadow-sm`}
              >
                <Icon
                  name={type === 'cash' ? 'banknote' : 'pie-chart'}
                  className="h-5 w-5"
                />
              </div>
            )}
            {isStockFocus && openTicker && focusLots ? (
              <div className="min-w-0">
                <h2 className="text-[17px] font-black text-slate-900 tracking-tight truncate">
                  {focusLots[0]?.name || openTicker}
                </h2>
                <p className="text-[12px] font-bold text-slate-500 mt-0.5 tabular-nums">
                  {openTicker} · 現價{' '}
                  {stockPrices[openTicker]
                    ? formatPrice(Number(stockPrices[openTicker]))
                    : '—'}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-[17px] font-black text-slate-900 tracking-tight">
                  {type === 'cash'
                    ? '現金資產明細'
                    : type === 'stock-allocation'
                      ? '股票配置分析'
                      : '投資持股明細'}
                </h2>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">
                  {type === 'cash'
                    ? `${cashCount} 個帳戶`
                    : `${Object.keys(groupedStocks).length} 個標的`}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-90"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </header>

        <div
          ref={contentRef}
          className="detail-content overflow-y-auto flex-1 px-4 sm:px-5 py-5"
        >
          {type === 'stock-allocation' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[13px] font-black text-slate-800">
                    市值權重分佈
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-50 text-[10px] font-black text-blue-700 border border-blue-100">
                    目前權重
                  </div>
                </div>
                <div className="h-[240px]">
                  <InvestmentAllocationChart slices={stockChartData} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="px-1 text-[11px] font-black text-slate-700 uppercase tracking-widest mb-3">
                  標的佔比清單
                </div>
                {stockChartData.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{
                          backgroundColor: [
                            '#1D4ED8',
                            '#0EA5E9',
                            '#14B8A6',
                            '#F59E0B',
                            '#6366F1',
                            '#8B5CF6',
                            '#EC4899',
                            '#10B981',
                          ][i % 8],
                        }}
                      ></div>
                      <span className="text-[14px] font-black text-slate-800">
                        {s.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-black text-slate-900 tabular-nums">
                        {((s.value / stockSummary.totalValue) * 100).toFixed(1)}
                        %
                      </div>
                      <div className="text-[10px] font-bold text-slate-700 tabular-nums">
                        {currency(s.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isStockFocus && openTicker && focusLots ? (
            <StockDetailGroup
              ticker={openTicker}
              lots={focusLots}
              price={Number(stockPrices[openTicker] || 0)}
              editingTicker={editingTicker}
              editName={editName}
              showActionMenuId={showActionMenuId}
              editingId={editingId}
              editShares={editShares}
              editPrice={editPrice}
              editDate={editDate}
              editAverageCost={editAverageCost}
              setEditName={setEditName}
              setEditShares={setEditShares}
              setEditPrice={setEditPrice}
              setEditDate={setEditDate}
              setEditAverageCost={setEditAverageCost}
              onSave={handleSave}
              onCancelTickerEdit={() => setEditingTicker(null)}
              onCancelLotEdit={() => setEditingId(null)}
              onEditTicker={handleEdit}
              onEditLot={handleEdit}
              onDeleteTicker={handleDelete}
              onDeleteLot={handleDelete}
              onShowMenu={(id) => setShowActionMenuId(id)}
              onHideMenu={() => setShowActionMenuId(null)}
            />
          ) : (
            <>
              {/* Key Metrics Dashboard - Light Style */}
              <div id="detailSummary" className="grid grid-cols-1 gap-3 mb-8">
                {type === 'cash' ? (
                  <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                        總計金額
                      </span>
                      <div className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-700 uppercase">
                        現金總額
                      </div>
                    </div>
                    <div className="text-[32px] font-black text-slate-900 tabular-nums leading-none tracking-tight break-all">
                      {currency(cashTotal)}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[14px] font-black text-slate-700 uppercase tracking-widest">
                          投資總市值
                        </span>
                        <div
                          className={`text-[13px] font-black tabular-nums flex items-center gap-1.5 ${pnlClass(stockSummary.totalPnl)}`}
                        >
                          <span>{stockSummary.totalPnl >= 0 ? '▲' : '▼'}</span>
                          <span>{formatPnlPct(stockSummary.totalPnlPct)}</span>
                        </div>
                      </div>
                      <div className="text-[28px] font-black text-slate-900 tabular-nums leading-none tracking-tight whitespace-nowrap">
                        {currency(stockSummary.totalValue)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm overflow-hidden flex flex-col justify-between min-h-[90px]">
                        <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                          累積投資成本
                        </span>
                        <div className="text-[20px] font-black text-slate-800 tabular-nums leading-tight tracking-tight whitespace-nowrap">
                          {currency(stockSummary.totalCost)}
                        </div>
                      </div>
                      <div
                        className={`bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm overflow-hidden flex flex-col justify-between min-h-[90px] ${
                          stockSummary.totalPnl >= 0
                            ? 'bg-emerald-50/20'
                            : 'bg-rose-50/20'
                        }`}
                      >
                        <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest mb-2">
                          累積投資損益
                        </span>
                        <div
                          className={`text-[20px] font-black tabular-nums leading-tight tracking-tight whitespace-nowrap ${pnlClass(stockSummary.totalPnl)}`}
                        >
                          {formatPnlAmount(stockSummary.totalPnl)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* List Section */}
              <div className="mb-4 flex items-center gap-2 px-1">
                <Icon name="list" className="h-4 w-4 text-slate-900" />
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
                  資產細項
                </h3>
                {type === 'stock' && (
                  <span className="text-[12px] font-medium text-slate-400">
                    點選標的查看每筆成交損益
                  </span>
                )}
              </div>

              <div id="detailBody" className="flex flex-col gap-3 pb-8">
                {type === 'cash' &&
                  (assets.filter((a) => a.type === 'cash').length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-[13px] font-medium text-slate-700">
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
                          editIsInvestmentAccount={editIsInvestmentAccount}
                          setEditName={setEditName}
                          setEditAmount={setEditAmount}
                          setEditIsInvestmentAccount={
                            setEditIsInvestmentAccount
                          }
                          onSave={handleSave}
                          onCancelEdit={() => setEditingId(null)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onShowMenu={(id) => setShowActionMenuId(id)}
                          onHideMenu={() => setShowActionMenuId(null)}
                          isOpen={openCashId === asset.id}
                          onToggle={() => onCashToggle(asset.id)}
                          fundedStocks={stockAssets.filter(
                            (s) => s.fundingSourceId === asset.id,
                          )}
                        />
                      ))
                  ))}

                {type === 'stock' &&
                  (stockAssets.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-[13px] font-medium text-slate-700">
                      尚未新增股票資產
                    </div>
                  ) : (
                    Object.keys(groupedStocks).map((ticker) => (
                      <StockTickerRow
                        key={ticker}
                        ticker={ticker}
                        lots={groupedStocks[ticker]}
                        price={Number(stockPrices[ticker] || 0)}
                        onSelect={(t) => setOpenTicker(t)}
                      />
                    ))
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
