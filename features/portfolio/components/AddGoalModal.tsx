import { useEffect, useState } from 'react';
import Icon from '../../../components/Icon';

type Props = {
  open: boolean;
  mode: 'new' | 'edit';
  initialTicker?: string;
  initialShares?: number;
  onClose: () => void;
  onSave: (ticker: string, shares: number) => void;
  onRemove?: () => void;
};

export default function AddGoalModal({
  open,
  mode,
  initialTicker,
  initialShares,
  onClose,
  onSave,
  onRemove,
}: Props) {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');

  useEffect(() => {
    if (!open) return;
    setTicker(initialTicker ?? '');
    setShares(initialShares ? String(initialShares) : '');
  }, [open, initialTicker, initialShares]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = ticker.trim();
    const s = Number(shares.replace(/[^\d]/g, ''));
    if (!t || !s || Number.isNaN(s)) return;
    onSave(t, s);
    onClose();
  };

  const isEdit = mode === 'edit';

  if (!open) return null;

  return (
    <div
      id="goalModalOverlay"
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div
        id="goalModalSheet"
        className="relative w-full bg-white rounded-t-[32px] md:rounded-[32px] p-8 pb-10 md:pb-8 sm:max-w-md mx-auto shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300"
      >
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 md:hidden"></div>

        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[20px] font-black text-slate-900 tracking-tight">
            {isEdit ? '調整存股目標' : '新增存股目標'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <form
          id="addGoalForm"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              股票代號
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="例如：2330"
              disabled={isEdit}
              className={`w-full rounded-2xl border border-slate-200 p-4 text-[15px] font-bold outline-none transition-all ${isEdit ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-50/50 text-slate-900 focus:border-slate-900 focus:bg-white'}`}
            />
            {isEdit && (
              <div className="ml-1 mt-1 text-[11px] font-bold text-slate-400">
                股票代號固定，如需更換請刪除後再新增
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              目標股數
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="例如：300"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-[15px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all tabular-nums"
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-[15px] font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              儲存目標設定
            </button>

            {isEdit && onRemove && (
              <button
                type="button"
                onClick={() => {
                  onRemove();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-rose-50 px-5 py-4 text-[14px] font-bold text-rose-600 transition-all hover:bg-rose-100 active:scale-[0.98]"
              >
                刪除此目標
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
