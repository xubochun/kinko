import Icon from '../../../../components/Icon';

type Props = {
  ticker: string;
  editName: string;
  editAverageCost: string;
  setEditName: (val: string) => void;
  setEditAverageCost: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

const inputCls =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all';

export default function StockTickerEditForm({
  ticker,
  editName,
  editAverageCost,
  setEditName,
  setEditAverageCost,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="bg-white rounded-[24px] border-2 border-slate-900 p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
          <Icon name="edit-3" className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-[15px] font-black text-slate-900">編輯標的</h4>
          <p className="text-[12px] font-bold text-slate-500">{ticker}</p>
        </div>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-bold text-slate-500 ml-1">名稱</span>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className={inputCls}
          placeholder="例如：台積電"
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1.5 mt-3">
        <span className="text-[12px] font-bold text-slate-500 ml-1">
          平均成本（會依股數重算每筆紀錄的成本）
        </span>
        <input
          type="number"
          inputMode="decimal"
          value={editAverageCost}
          onChange={(e) => setEditAverageCost(e.target.value)}
          className={`${inputCls} tabular-nums`}
          placeholder="輸入新的平均成本"
        />
      </label>
      <div className="flex gap-2 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          取消
        </button>
        <button
          onClick={onSave}
          className="flex-[2] px-4 py-3 text-[13px] font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm transition-all"
        >
          儲存
        </button>
      </div>
    </div>
  );
}
