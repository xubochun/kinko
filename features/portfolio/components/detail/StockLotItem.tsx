import { Asset } from '../../../../types/portfolio';
import { formatPnlPct, pnlClass } from '../../../../lib/format';
import { formatPrice, formatShares } from '../../../../lib/number';
import { computeLotStats } from '../../lib/stockStats';
import ActionMenu from './ActionMenu';
import StockLotEditForm from './StockLotEditForm';

interface StockLotItemProps {
  lot: Asset;
  price: number;
  isEditing: boolean;
  showActionMenu: boolean;
  editShares: string;
  editPrice: string;
  editDate: string;
  setEditShares: (val: string) => void;
  setEditPrice: (val: string) => void;
  setEditDate: (val: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
  onShowMenu: (id: number) => void;
  onHideMenu: () => void;
}

const fmtInt = (n: number) =>
  Math.round(n).toLocaleString('zh-TW', { maximumFractionDigits: 0 });

/** 成交紀錄的欄寬，表頭與每一列共用以確保對齊 */
export const LOT_COLS =
  'grid grid-cols-[5.6rem_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.3fr)] gap-x-2 items-center';

export default function StockLotItem({
  lot,
  price,
  isEditing,
  showActionMenu,
  editShares,
  editPrice,
  editDate,
  setEditShares,
  setEditPrice,
  setEditDate,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
  onShowMenu,
  onHideMenu,
}: StockLotItemProps) {
  if (isEditing) {
    return (
      <StockLotEditForm
        editShares={editShares}
        editPrice={editPrice}
        editDate={editDate}
        setEditShares={setEditShares}
        setEditPrice={setEditPrice}
        setEditDate={setEditDate}
        onSave={onSave}
        onCancel={onCancelEdit}
      />
    );
  }

  const stats = computeLotStats(lot, price);
  const displayDate = (lot.date || '').replace(/-/g, '/') || '—';
  const sign = stats.pnl > 0 ? '+' : stats.pnl < 0 ? '-' : '';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onShowMenu(lot.id)}
        className={`${LOT_COLS} w-full py-3 px-1 text-left border-b border-slate-100 last:border-0 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors`}
      >
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-slate-900 tabular-nums whitespace-nowrap">
            {displayDate}
          </div>
          <div className="text-[11px] font-medium text-slate-400 tabular-nums truncate">
            成本 {fmtInt(stats.cost)}
          </div>
        </div>
        <div className="text-right text-[13px] font-bold text-slate-900 tabular-nums truncate">
          {formatShares(Number(lot.shares || 0))}
        </div>
        <div className="text-right text-[13px] font-bold text-slate-900 tabular-nums truncate">
          {formatPrice(Number(lot.price || 0))}
        </div>
        <div className={`text-right min-w-0 ${pnlClass(stats.pnl)}`}>
          <div className="text-[13px] font-black tabular-nums truncate">
            {sign}
            {fmtInt(Math.abs(stats.pnl))}
          </div>
          <div className="text-[11px] font-bold tabular-nums truncate">
            {formatPnlPct(stats.pnlPct)}
          </div>
        </div>
      </button>

      {showActionMenu && (
        <ActionMenu
          className="rounded-lg"
          itemClassName="h-9 w-9"
          onEdit={(e) => {
            e.stopPropagation();
            onEdit(lot);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete(lot.id);
          }}
          onClose={(e) => {
            e.stopPropagation();
            onHideMenu();
          }}
        />
      )}
    </div>
  );
}
