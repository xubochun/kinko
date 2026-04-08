import { useEffect, useState } from 'react';
import type { NewAssetPayload } from '../hooks/usePortfolioData';
import Icon from '../../../components/Icon';

type Props = {
  open: boolean;
  initialType?: 'cash' | 'stock';
  onClose: () => void;
  onAddAsset: (payload: NewAssetPayload) => void;
};

export default function AddAssetModal({
  open,
  initialType,
  onClose,
  onAddAsset,
}: Props) {
  const [assetType, setAssetType] = useState<'cash' | 'stock'>('cash');
  const [cashName, setCashName] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [stockTicker, setStockTicker] = useState('');
  const [stockDate, setStockDate] = useState('');
  const [stockShares, setStockShares] = useState('');
  const [stockPrice, setStockPrice] = useState('');

  useEffect(() => {
    if (open && initialType) {
      setAssetType(initialType);
    }
  }, [open, initialType]);

  useEffect(() => {
    if (assetType === 'stock' && !stockDate) {
      setStockDate(new Date().toISOString().split('T')[0]);
    }
  }, [assetType, stockDate]);

  const resetForm = () => {
    setCashName('');
    setAssetAmount('');
    setStockTicker('');
    setStockDate('');
    setStockShares('');
    setStockPrice('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (assetType === 'cash') {
      onAddAsset({
        type: 'cash',
        name: cashName,
        amount: Number(assetAmount || 0),
      });
    } else {
      onAddAsset({
        type: 'stock',
        ticker: stockTicker,
        date: stockDate,
        shares: Number(stockShares || 0),
        price: Number(stockPrice || 0),
      });
    }

    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      id="addModalOverlay"
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div
        id="addModalSheet"
        className="relative w-full bg-white rounded-t-[32px] md:rounded-[32px] p-8 pb-10 md:pb-8 sm:max-w-md mx-auto shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300"
      >
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 md:hidden"></div>

        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[20px] font-black text-slate-900 tracking-tight">
            新增資產紀錄
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <form
          id="addAssetForm"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              資產類型
            </label>
            <div className="flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setAssetType('cash')}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-all ${assetType === 'cash' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                現金與帳戶
              </button>
              <button
                type="button"
                onClick={() => setAssetType('stock')}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-all ${assetType === 'stock' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                股票與 ETF
              </button>
            </div>
          </div>

          <div
            id="cashFields"
            className={`${assetType === 'cash' ? 'flex' : 'hidden'} flex-col gap-5 animate-in fade-in duration-300`}
          >
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                帳戶名稱
              </label>
              <input
                type="text"
                id="cashName"
                placeholder="例如：台新 Richart"
                value={cashName}
                onChange={(e) => setCashName(e.target.value)}
                required={assetType === 'cash'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                目前金額 (NT$)
              </label>
              <input
                type="number"
                id="assetAmount"
                min="0"
                placeholder="例如：50000"
                value={assetAmount}
                onChange={(e) => setAssetAmount(e.target.value)}
                required={assetType === 'cash'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all tabular-nums"
              />
            </div>
          </div>

          <div
            id="stockFields"
            className={`${assetType === 'stock' ? 'flex' : 'hidden'} flex-col gap-5 animate-in fade-in duration-300`}
          >
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                股票代號
              </label>
              <input
                type="text"
                id="stockTicker"
                placeholder="例如：2330"
                value={stockTicker}
                onChange={(e) => setStockTicker(e.target.value)}
                required={assetType === 'stock'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                買入日期
              </label>
              <input
                type="date"
                id="stockDate"
                value={stockDate}
                onChange={(e) => setStockDate(e.target.value)}
                required={assetType === 'stock'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  成交股數
                </label>
                <input
                  type="number"
                  id="stockShares"
                  min="1"
                  step="any"
                  placeholder="1000"
                  value={stockShares}
                  onChange={(e) => setStockShares(e.target.value)}
                  required={assetType === 'stock'}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all tabular-nums"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  成交單價
                </label>
                <input
                  type="number"
                  id="stockPrice"
                  min="0"
                  step="any"
                  placeholder="850"
                  value={stockPrice}
                  onChange={(e) => setStockPrice(e.target.value)}
                  required={assetType === 'stock'}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all tabular-nums"
                />
              </div>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4 flex items-start gap-3">
              <Icon name="info" className="h-4 w-4 text-blue-500 mt-0.5" />
              <p className="text-[12px] font-medium text-blue-700 leading-relaxed">
                系統將根據代號自動獲取標的名稱與現價。
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-[15px] font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            <Icon name="check" className="h-5 w-5" />
            確認儲存資產
          </button>
        </form>
      </div>
    </div>
  );
}
