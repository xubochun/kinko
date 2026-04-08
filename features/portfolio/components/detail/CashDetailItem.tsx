import { Asset } from '../../../../types/portfolio';
import { currency } from '../../../../lib/format';
import Icon from '../../../../components/Icon';
import ActionMenu from './ActionMenu';

interface CashDetailItemProps {
  asset: Asset;
  isEditing: boolean;
  showActionMenu: boolean;
  editName: string;
  editAmount: string;
  setEditName: (val: string) => void;
  setEditAmount: (val: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
  onShowMenu: (id: number) => void;
  onHideMenu: () => void;
  startPress: (id: number) => void;
  endPress: () => void;
}

export default function CashDetailItem({
  asset,
  isEditing,
  showActionMenu,
  editName,
  editAmount,
  setEditName,
  setEditAmount,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
  onHideMenu,
  startPress,
  endPress,
}: CashDetailItemProps) {
  // Use a stable root element to prevent "removeChild" errors during reconciliation
  return (
    <div className="relative w-full transition-all duration-300">
      {isEditing ? (
        <div className="bg-white rounded-[24px] border-2 border-slate-900 p-5 shadow-lg animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Icon name="edit-3" className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-slate-900 tracking-tight">
                編輯現金帳戶
              </h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Update account info
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                帳戶名稱
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
                placeholder="例如：國泰世華 薪轉戶"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                目前餘額
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all tabular-nums"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onCancelEdit}
              className="flex-1 px-4 py-3 text-[13px] font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
            >
              取消
            </button>
            <button
              onClick={onSave}
              className="flex-[2] px-4 py-3 text-[13px] font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm transition-all active:scale-95"
            >
              儲存變更
            </button>
          </div>
        </div>
      ) : (
        <div
          className="group relative bg-white rounded-[24px] border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-md active:scale-[0.98] select-none cursor-pointer overflow-hidden"
          onTouchStart={() => startPress(asset.id)}
          onTouchEnd={endPress}
          onMouseDown={() => startPress(asset.id)}
          onMouseUp={endPress}
          onMouseLeave={endPress}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                <Icon name="banknote" className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-black text-slate-900 truncate tracking-tight">
                  {asset.name || '未命名帳戶'}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Cash Account
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-[17px] font-black text-slate-900 tabular-nums tracking-tight">
                {currency(Number(asset.amount || 0))}
              </div>
              <div className="text-[10px] font-black text-slate-300 uppercase mt-0.5">
                Updated just now
              </div>
            </div>
          </div>

          {showActionMenu && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-200">
              <ActionMenu
                onEdit={(e) => {
                  e.stopPropagation();
                  onEdit(asset);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDelete(asset.id);
                }}
                onClose={(e) => {
                  e.stopPropagation();
                  onHideMenu();
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
