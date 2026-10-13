import { useMemo, useState } from 'react';
import { Asset } from '../../../../types/portfolio';
import Icon from '../../../../components/Icon';
import { formatPrice } from '../../../../lib/number';
import { computeTickerStats, sortLotsByDate } from '../../lib/stockStats';
import StockLotItem, { LOT_COLS } from './StockLotItem';
import StockSummaryCard from './StockSummaryCard';
import StockTickerEditForm from './StockTickerEditForm';

interface StockDetailGroupProps {
  ticker: string;
  lots: Asset[];
  price: number;
  editingTicker: string | null;
  editName: string;
  showActionMenuId: number | string | null;
  editingId: number | null;
  editShares: string;
  editPrice: string;
  editDate: string;
  editAverageCost: string;
  setEditName: (val: string) => void;
  setEditShares: (val: string) => void;
  setEditPrice: (val: string) => void;
  setEditDate: (val: string) => void;
  setEditAverageCost: (val: string) => void;
  onSave: () => void;
  onCancelTickerEdit: () => void;
  onCancelLotEdit: () => void;
  onEditTicker: (ticker: string) => void;
  onEditLot: (lot: Asset) => void;
  onDeleteTicker: (ticker: string) => void;
  onDeleteLot: (id: number) => void;
  onShowMenu: (id: number | string) => void;
  onHideMenu: () => void;
}

/** 單一標的的完整明細：損益摘要在上，成交紀錄以表格呈現 */
export default function StockDetailGroup(props: StockDetailGroupProps) {
  const { ticker, lots, price, editingTicker } = props;
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const stats = useMemo(() => computeTickerStats(lots, price), [lots, price]);
  const sortedLots = useMemo(() => sortLotsByDate(lots, order), [lots, order]);

  return (
    <div className="flex flex-col gap-4 pb-8">
      {editingTicker === ticker ? (
        <StockTickerEditForm
          ticker={ticker}
          editName={props.editName}
          editAverageCost={props.editAverageCost}
          setEditName={props.setEditName}
          setEditAverageCost={props.setEditAverageCost}
          onSave={props.onSave}
          onCancel={props.onCancelTickerEdit}
        />
      ) : (
        <StockSummaryCard
          stats={stats}
          onEdit={() => props.onEditTicker(ticker)}
          onDelete={() => props.onDeleteTicker(ticker)}
        />
      )}

      <section className="bg-white rounded-[24px] border border-slate-200 px-3.5 pt-4 pb-2 shadow-sm">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2">
            <Icon name="history" className="h-4 w-4 text-slate-900" />
            <h3 className="text-[14px] font-black text-slate-900">
              成交紀錄
              <span className="ml-1 text-[12px] font-bold text-slate-400">
                {lots.length} 筆
              </span>
            </h3>
          </div>
          <button
            onClick={() => setOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600"
          >
            {order === 'desc' ? '新 → 舊' : '舊 → 新'}
          </button>
        </div>
        <p className="px-1 mb-2 text-[11px] font-medium text-slate-400">
          以現價 {price > 0 ? formatPrice(price) : '—'}{' '}
          計算每筆損益，點選紀錄可編輯或刪除
        </p>

        <div
          className={`${LOT_COLS} px-1 py-2 border-y border-slate-100 text-[11px] font-bold text-slate-400`}
        >
          <span>買進日期</span>
          <span className="text-right">股數</span>
          <span className="text-right">買價</span>
          <span className="text-right">損益</span>
        </div>

        <div>
          {sortedLots.map((lot) => (
            <StockLotItem
              key={lot.id}
              lot={lot}
              price={price}
              isEditing={props.editingId === lot.id}
              showActionMenu={props.showActionMenuId === lot.id}
              editShares={props.editShares}
              editPrice={props.editPrice}
              editDate={props.editDate}
              setEditShares={props.setEditShares}
              setEditPrice={props.setEditPrice}
              setEditDate={props.setEditDate}
              onSave={props.onSave}
              onCancelEdit={props.onCancelLotEdit}
              onEdit={props.onEditLot}
              onDelete={props.onDeleteLot}
              onHideMenu={props.onHideMenu}
              onShowMenu={props.onShowMenu}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
