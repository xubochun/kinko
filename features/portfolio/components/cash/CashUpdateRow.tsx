import type { Asset } from '../../../../types/portfolio';
import { currency } from '../../../../lib/format';
import {
  formatInputNumber,
  formatRelativeDays,
  parseNumberInput,
} from '../../../../lib/number';

type Props = {
  asset: Asset;
  value: string;
  isLast: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (value: string) => void;
  onEnter: () => void;
};

export default function CashUpdateRow({
  asset,
  value,
  isLast,
  inputRef,
  onChange,
  onEnter,
}: Props) {
  const prev = Number(asset.amount || 0);
  const parsed = parseNumberInput(value);
  const diff = parsed === null ? 0 : parsed - prev;
  const changed = parsed !== null && Math.round(diff * 100) !== 0;

  return (
    <label
      className={`block rounded-2xl border p-3.5 transition-colors ${
        changed ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[14px] font-black text-slate-900 truncate">
          {asset.name || '未命名帳戶'}
        </span>
        <span className="shrink-0 text-[11px] font-bold text-slate-400">
          {formatRelativeDays(asset.updatedAt || asset.id)}更新
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-bold text-slate-400">NT$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          enterKeyHint={isLast ? 'done' : 'next'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => {
            if (parsed !== null) onChange(formatInputNumber(parsed));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onEnter();
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-[20px] font-black text-slate-900 tabular-nums outline-none"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[12px] tabular-nums">
        <span className="font-medium text-slate-400">原 {currency(prev)}</span>
        {changed && (
          <span
            className={`font-black ${diff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {diff > 0 ? '+' : '-'}
            {currency(Math.abs(diff))}
          </span>
        )}
      </div>
    </label>
  );
}
