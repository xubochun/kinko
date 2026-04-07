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
  onShowMenu: _onShowMenu,
  onHideMenu,
  startPress,
  endPress,
}: CashDetailItemProps) {
  if (isEditing) {
    return (
      <div className="detail-row flex-col items-stretch gap-3 !h-auto relative p-1">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium text-slate-500">
            帳戶名稱
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            placeholder="帳戶名稱"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium text-slate-500">金額</label>
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            placeholder="金額"
          />
        </div>
        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
          <button
            onClick={onCancelEdit}
            className="px-4 py-2 text-[12px] font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-[12px] font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            儲存變更
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="detail-row flex-col items-stretch gap-3 !h-auto relative active:scale-[0.98] transition-transform select-none"
      onTouchStart={() => startPress(asset.id)}
      onTouchEnd={endPress}
      onMouseDown={() => startPress(asset.id)}
      onMouseUp={endPress}
      onMouseLeave={endPress}
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Icon name="banknote" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-gray-900 truncate">
              {asset.name || '未命名帳戶'}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              現金資產
            </div>
          </div>
        </div>
        <div className="text-right text-[15px] font-bold text-gray-900 tabular-nums">
          {currency(Number(asset.amount || 0))}
        </div>

        {showActionMenu && (
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
        )}
      </div>
    </div>
  );
}
