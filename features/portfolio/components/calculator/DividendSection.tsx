import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Asset } from '../../../../types/portfolio';
import { currency } from '../../../../lib/format';
import {
  formatPrice,
  formatShares,
  parseNumberInput,
} from '../../../../lib/number';
import { sharesEligibleOn, type DividendRecord } from '../../lib/averageCost';
import { Card, inputCls, labelCls } from './ui';

type Props = {
  lots: Asset[];
  records: DividendRecord[];
  onAdd: (record: Omit<DividendRecord, 'id'>) => void;
  onRemove: (id: string) => void;
};

export default function DividendSection({
  lots,
  records,
  onAdd,
  onRemove,
}: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [perShare, setPerShare] = useState('');
  const [sharesStr, setSharesStr] = useState('');
  const [amountStr, setAmountStr] = useState('');

  const autoShares = sharesEligibleOn(lots, date);
  const shares = parseNumberInput(sharesStr) ?? autoShares;
  const per = parseNumberInput(perShare) ?? 0;
  const autoAmount = Math.round(per * shares);
  const amount = parseNumberInput(amountStr) ?? autoAmount;
  const canSave = !!date && per > 0 && shares > 0 && amount > 0;

  const reset = () => {
    setDate('');
    setPerShare('');
    setSharesStr('');
    setAmountStr('');
    setOpen(false);
  };

  return (
    <Card
      title="除息紀錄"
      hint="每次除息領到的現金股利會降低你的持有成本"
      action={
        !open && (
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] font-bold active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            新增
          </button>
        )
      }
    >
      {open && (
        <div className="mb-4 rounded-2xl border-2 border-slate-900 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 min-w-0">
              <span className={labelCls}>除息日</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputCls} h-[50px]`}
              />
            </label>
            <label className="min-w-0">
              <span className={labelCls}>每股股利</span>
              <input
                inputMode="decimal"
                placeholder="5"
                value={perShare}
                onChange={(e) => setPerShare(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="min-w-0">
              <span className={labelCls}>參與股數</span>
              <input
                inputMode="decimal"
                placeholder={date ? formatShares(autoShares) : '自動帶入'}
                value={sharesStr}
                onChange={(e) => setSharesStr(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="col-span-2 min-w-0">
              <span className={labelCls}>實領金額（元）</span>
              <input
                inputMode="decimal"
                placeholder={
                  autoAmount ? autoAmount.toLocaleString() : '自動計算'
                }
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className={inputCls}
              />
            </label>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-500">
            參與股數預設為除息日前已買進的股數；實領金額可改成扣除匯費、二代健保後的實際入帳數字。
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={reset}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-100"
            >
              取消
            </button>
            <button
              disabled={!canSave}
              onClick={() => {
                onAdd({ date, perShare: per, shares, amount });
                reset();
              }}
              className="flex-[2] py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold disabled:bg-slate-200 disabled:text-slate-400"
            >
              儲存 {canSave ? currency(amount) : ''}
            </button>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        !open && (
          <p className="py-3 text-center text-[13px] font-medium text-slate-400">
            尚無除息紀錄，新增後會自動計算除息後均價
          </p>
        )
      ) : (
        <ul className="divide-y divide-slate-100">
          {records.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-slate-900 tabular-nums">
                  {r.date.replace(/-/g, '/')}
                </div>
                <div className="text-[12px] font-medium text-slate-500 tabular-nums">
                  每股 {formatPrice(r.perShare)} 元 × {formatShares(r.shares)}{' '}
                  股
                </div>
              </div>
              <div className="text-[14px] font-black text-emerald-600 tabular-nums">
                +{currency(r.amount)}
              </div>
              <button
                onClick={() => {
                  if (confirm('確定刪除這筆除息紀錄？')) onRemove(r.id);
                }}
                aria-label="刪除"
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
