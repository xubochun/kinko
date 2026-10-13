import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Asset } from '../../../../types/portfolio';
import { currency } from '../../../../lib/format';
import { formatInputNumber, parseNumberInput } from '../../../../lib/number';
import CashUpdateRow from './CashUpdateRow';

type Props = {
  open: boolean;
  cashAssets: Asset[];
  /** 從首頁點選單一帳戶時，自動聚焦到該帳戶的輸入框 */
  focusId?: number | null;
  onClose: () => void;
  onSave: (updates: { id: number; amount: number }[]) => void;
};

export default function CashUpdateModal({
  open,
  cashAssets,
  focusId,
  onClose,
  onSave,
}: Props) {
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // 開啟時用目前餘額初始化輸入值
  useEffect(() => {
    if (!open) return;
    const next: Record<number, string> = {};
    cashAssets.forEach((a) => {
      next[a.id] = formatInputNumber(Number(a.amount || 0));
    });
    setDrafts(next);
    document.body.classList.add('no-scroll');
    const t = window.setTimeout(() => {
      const target = focusId ?? cashAssets[0]?.id;
      const el = target != null ? inputRefs.current[target] : null;
      if (el) {
        el.focus();
        el.select();
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 80);
    return () => {
      window.clearTimeout(t);
      document.body.classList.remove('no-scroll');
    };
    // 只在開啟時初始化（不依賴 cashAssets），避免輸入中被覆蓋
  }, [open, focusId]);

  const changes = useMemo(() => {
    return cashAssets
      .map((a) => {
        const parsed = parseNumberInput(drafts[a.id] ?? '');
        const prev = Number(a.amount || 0);
        return { id: a.id, prev, next: parsed };
      })
      .filter(
        (c): c is { id: number; prev: number; next: number } =>
          c.next !== null &&
          Math.round(c.next * 100) !== Math.round(c.prev * 100),
      );
  }, [cashAssets, drafts]);

  const totalDiff = changes.reduce((s, c) => s + (c.next - c.prev), 0);

  const handleSave = () => {
    onSave(changes.map((c) => ({ id: c.id, amount: c.next })));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="relative w-full md:max-w-lg max-h-[90vh] flex flex-col bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl"
      >
        <header className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-[17px] font-black text-slate-900">
              更新現金餘額
            </h2>
            <p className="text-[12px] font-medium text-slate-500 mt-0.5">
              直接輸入各帳戶目前的餘額，只會儲存有變動的帳戶
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="h-9 w-9 grid place-items-center rounded-full bg-slate-100 text-slate-600 active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
          {cashAssets.map((asset, idx) => (
            <CashUpdateRow
              key={asset.id}
              asset={asset}
              value={drafts[asset.id] ?? ''}
              isLast={idx === cashAssets.length - 1}
              inputRef={(el) => {
                inputRefs.current[asset.id] = el;
              }}
              onChange={(v) => setDrafts((d) => ({ ...d, [asset.id]: v }))}
              onEnter={() => {
                const nextAsset = cashAssets[idx + 1];
                const el = nextAsset ? inputRefs.current[nextAsset.id] : null;
                if (el) {
                  el.focus();
                  el.select();
                } else {
                  handleSave();
                }
              }}
            />
          ))}
        </div>

        <footer className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-slate-100">
          <div className="flex items-center justify-between text-[13px] mb-3">
            <span className="font-bold text-slate-500">
              {changes.length > 0
                ? `${changes.length} 個帳戶有變動`
                : '尚無變動'}
            </span>
            {changes.length > 0 && (
              <span
                className={`font-black tabular-nums ${totalDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
              >
                合計 {totalDiff >= 0 ? '+' : '-'}
                {currency(Math.abs(totalDiff))}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={changes.length === 0}
            className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-[15px] font-black active:scale-[0.98] transition disabled:bg-slate-200 disabled:text-slate-400"
          >
            儲存更新
          </button>
        </footer>
      </form>
    </div>
  );
}
