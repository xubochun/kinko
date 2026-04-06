import { Asset } from '../../../../types/portfolio';
import {
  currency,
  formatDate,
  formatPnlAmount,
  formatPnlPct,
  pnlClass,
} from '../../../../lib/format';
import ActionMenu from './ActionMenu';

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
  onHideMenu: () => void;
  startPress: (id: number) => void;
  endPress: () => void;
}

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
  onHideMenu,
  startPress,
  endPress,
}: StockLotItemProps) {
  const lotCost = Number(
    lot.costAmount || (lot.shares || 0) * (lot.price || 0),
  );
  const lotValue = Number(lot.shares || 0) * price;
  const lotPnl = lotValue - lotCost;
  const lotPnlPct = lotCost > 0 ? (lotPnl / lotCost) * 100 : 0;
  const lotCostHtml = currency(lotCost);
  const lotValueHtml = currency(lotValue);
  const lotPnlHtml = formatPnlAmount(lotPnl);
  const lotPctHtml = formatPnlPct(lotPnlPct);
  const lotDate = lot.date ? formatDate(lot.date) : '—';

  if (isEditing) {
    return (
      <div className="detail-lot-row flex-col items-stretch gap-3 !h-auto">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-500">
              股數
            </label>
            <input
              type="number"
              value={editShares}
              onChange={(e) => setEditShares(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2 text-[12px] outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-500">
              買入價
            </label>
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2 text-[12px] outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-500">日期</label>
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-2 text-[12px] outline-none focus:border-[#2563EB] h-[38px]"
          />
        </div>
        <div className="flex justify-end gap-2 border-t pt-2">
          <button
            onClick={onCancelEdit}
            className="px-3 py-1 text-[11px] font-medium text-gray-500"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1 text-[11px] font-medium bg-[#2563EB] text-white rounded-md"
          >
            儲存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="detail-lot-row relative active:scale-[0.98] transition-transform select-none"
      onTouchStart={() => startPress(lot.id)}
      onTouchEnd={endPress}
      onMouseDown={() => startPress(lot.id)}
      onMouseUp={endPress}
      onMouseLeave={endPress}
    >
      <div className="detail-lot-main">
        <div className="detail-lot-date">{lotDate}</div>
        <div className="detail-lot-grid">
          <div className="detail-lot-col">
            <span className="detail-lot-label">股數</span>
            <span className="detail-lot-value-sm">
              {Number(lot.shares || 0)}
            </span>
          </div>
          <div className="detail-lot-col">
            <span className="detail-lot-label">買入價</span>
            <span className="detail-lot-value-sm">
              $
              {Number.isInteger(Number(lot.price || 0))
                ? Number(lot.price || 0)
                : Number(lot.price || 0).toFixed(2)}
            </span>
          </div>
          <div className="detail-lot-col">
            <span className="detail-lot-label">成本</span>
            <span className="detail-lot-value-sm">
              {lotCostHtml.replace('NT$ ', '')}
            </span>
          </div>
        </div>
      </div>
      <div className="detail-lot-right">
        <div className="detail-lot-value tabular-nums">{lotValueHtml}</div>
        <div className={`detail-lot-pnl ${pnlClass(lotPnl)} tabular-nums`}>
          {lotPnlHtml} <span>{lotPctHtml}</span>
        </div>
      </div>

      {showActionMenu && (
        <ActionMenu
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
          itemClassName="h-10 w-10"
        />
      )}
    </div>
  );
}
