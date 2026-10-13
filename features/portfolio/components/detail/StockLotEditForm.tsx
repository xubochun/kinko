import Icon from '../../../../components/Icon';

type Props = {
  editShares: string;
  editPrice: string;
  editDate: string;
  setEditShares: (val: string) => void;
  setEditPrice: (val: string) => void;
  setEditDate: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[14px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all tabular-nums';
const labelCls = 'text-[12px] font-bold text-slate-500 ml-1';

export default function StockLotEditForm({
  editShares,
  editPrice,
  editDate,
  setEditShares,
  setEditPrice,
  setEditDate,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-900 p-4 my-2 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="edit-2" className="h-3.5 w-3.5 text-slate-900" />
        <span className="text-[13px] font-black text-slate-900">
          編輯成交紀錄
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>股數</span>
          <input
            type="number"
            inputMode="decimal"
            value={editShares}
            onChange={(e) => setEditShares(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>買入價格</span>
          <input
            type="number"
            inputMode="decimal"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 mt-3">
        <span className={labelCls}>成交日期</span>
        <input
          type="date"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
          className={`${inputCls} h-[44px]`}
        />
      </label>
      <div className="flex justify-end gap-2 mt-5">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
        >
          取消
        </button>
        <button
          onClick={onSave}
          className="px-5 py-2 text-[13px] font-bold bg-slate-900 text-white rounded-lg shadow-sm"
        >
          儲存
        </button>
      </div>
    </div>
  );
}
