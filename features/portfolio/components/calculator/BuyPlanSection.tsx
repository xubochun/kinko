import { Plus, X } from 'lucide-react';
import { currency } from '../../../../lib/format';
import { parseNumberInput } from '../../../../lib/number';
import { Card, inputCls, labelCls } from './ui';

export type BuyDraft = { id: number; shares: string; price: string };

type Props = {
  rows: BuyDraft[];
  currentPrice: number;
  onChange: (rows: BuyDraft[]) => void;
};

const QUICK_SHARES = [100, 500, 1000];

export default function BuyPlanSection({
  rows,
  currentPrice,
  onChange,
}: Props) {
  const update = (id: number, patch: Partial<BuyDraft>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <Card
      title="預計買進"
      hint="可加入多筆，例如分批在不同價位買進"
      action={
        <button
          onClick={() =>
            onChange([...rows, { id: Date.now(), shares: '', price: '' }])
          }
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[12px] font-bold active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          加一筆
        </button>
      }
    >
      <div className="space-y-3">
        {rows.map((row, idx) => {
          const shares = parseNumberInput(row.shares) ?? 0;
          const price = parseNumberInput(row.price) ?? 0;
          return (
            <div
              key={row.id}
              className="rounded-2xl bg-slate-50 border border-slate-100 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-black text-slate-700">
                  第 {idx + 1} 筆
                </span>
                <div className="flex items-center gap-1">
                  {QUICK_SHARES.map((q) => (
                    <button
                      key={q}
                      onClick={() => update(row.id, { shares: String(q) })}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-600"
                    >
                      {q === 1000 ? '1 張' : `${q} 股`}
                    </button>
                  ))}
                  {rows.length > 1 && (
                    <button
                      onClick={() =>
                        onChange(rows.filter((r) => r.id !== row.id))
                      }
                      aria-label="移除"
                      className="ml-1 p-1 rounded-md text-slate-400 hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="min-w-0">
                  <span className={labelCls}>股數</span>
                  <input
                    inputMode="decimal"
                    placeholder="0"
                    value={row.shares}
                    onChange={(e) => update(row.id, { shares: e.target.value })}
                    className={inputCls}
                  />
                </label>
                <label className="min-w-0">
                  <span className={labelCls}>買進價格</span>
                  <input
                    inputMode="decimal"
                    placeholder={
                      currentPrice > 0 ? `現價 ${currentPrice}` : '0'
                    }
                    value={row.price}
                    onChange={(e) => update(row.id, { price: e.target.value })}
                    className={inputCls}
                  />
                </label>
              </div>
              {shares > 0 && price > 0 && (
                <div className="mt-2 text-right text-[12px] font-bold text-slate-500 tabular-nums">
                  花費 {currency(shares * price)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {currentPrice > 0 && (
        <button
          onClick={() =>
            onChange(
              rows.map((r) =>
                r.price ? r : { ...r, price: String(currentPrice) },
              ),
            )
          }
          className="mt-3 text-[12px] font-bold text-blue-600"
        >
          未填價格的列帶入現價 {currentPrice}
        </button>
      )}
    </Card>
  );
}
