import Icon from '../../../../components/Icon';
import { currency } from '../../../../lib/format';
import { formatShares } from '../../../../lib/number';

export type GoalCardData = {
  ticker: string;
  name: string;
  /** 今年度已買進股數 */
  shares: number;
  /** 歷年累計持有股數 */
  totalShares: number;
  goal: number;
  progress: number;
  remaining: number;
  isCompleted: boolean;
  price: number;
};

type Props = {
  card: GoalCardData;
  year: number;
  onEdit: (ticker: string) => void;
  onBuy: (e: React.MouseEvent, ticker: string) => void;
};

const Stat = ({
  label,
  value,
  unit = '股',
  highlight = false,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) => (
  <div className="min-w-0">
    <div className="text-[11px] font-medium text-slate-500">{label}</div>
    <div
      className={`mt-0.5 text-[15px] font-black tabular-nums truncate ${highlight ? 'text-emerald-600' : 'text-slate-900'}`}
    >
      {value}
      {unit && (
        <span className="ml-0.5 text-[11px] font-bold text-slate-400">
          {unit}
        </span>
      )}
    </div>
  </div>
);

export default function GoalCard({ card, year, onEdit, onBuy }: Props) {
  const hasGoal = card.goal > 0;
  const progressText = `${card.progress >= 100 ? 100 : Math.floor(card.progress * 10) / 10}%`;
  const remainingCost = card.remaining * card.price;

  return (
    <div
      onClick={() => onEdit(card.ticker)}
      className={`cursor-pointer rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 transition-all group ${hasGoal ? 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md' : 'border-amber-100 bg-amber-50/30 hover:border-amber-200'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-baseline gap-2">
          <span className="text-[15px] font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {card.name}
          </span>
          <span className="text-[12px] font-bold text-slate-400 shrink-0">
            {card.ticker}
          </span>
        </div>
        <button
          onClick={(e) => onBuy(e, card.ticker)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[12px] font-bold hover:bg-blue-100 transition-all active:scale-95"
        >
          <Icon name="plus" className="h-3 w-3" />
          買進
        </button>
      </div>

      {hasGoal ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${card.isCompleted ? 'bg-emerald-500' : 'bg-slate-900'}`}
                style={{ width: `${Math.min(100, card.progress)}%` }}
              />
            </div>
            <span
              className={`shrink-0 text-[13px] font-black tabular-nums ${card.isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}
            >
              {progressText}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label={`${year} 已存`} value={formatShares(card.shares)} />
            <Stat label="年度目標" value={formatShares(card.goal)} />
            {card.isCompleted ? (
              <Stat label="狀態" value="已達成 🎉" unit="" highlight />
            ) : (
              <Stat label="還差" value={formatShares(card.remaining)} />
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[12px] font-medium text-slate-500 tabular-nums">
            <span className="truncate">
              累計持有 {formatShares(card.totalShares)} 股
            </span>
            {!card.isCompleted && card.price > 0 && (
              <span className="shrink-0">
                依現價約需{' '}
                <span className="font-black text-slate-900">
                  {currency(remainingCost)}
                </span>
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="mt-3 text-[12px] font-medium text-amber-700">
          尚未設定目標 · {year} 已買 {formatShares(card.shares)} 股 · 累計{' '}
          {formatShares(card.totalShares)} 股，點此設定目標
        </div>
      )}
    </div>
  );
}
