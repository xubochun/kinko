export const inputCls =
  'block w-full min-w-0 max-w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-[15px] font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all';

export const labelCls =
  'block whitespace-nowrap text-[12px] font-bold text-slate-500 mb-1.5';

export const Card = ({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="bg-white rounded-[24px] p-5 md:p-6 border border-slate-200 shadow-sm">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-[15px] font-black text-slate-900">{title}</h2>
        {hint && (
          <p className="text-[12px] font-medium text-slate-500 mt-0.5">
            {hint}
          </p>
        )}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const Value = ({
  label,
  value,
  sub,
  emphasis = false,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasis?: boolean;
}) => (
  <div
    className={`rounded-xl p-3.5 min-w-0 ${emphasis ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}
  >
    <div
      className={`text-[12px] font-bold ${emphasis ? 'text-emerald-700' : 'text-slate-500'}`}
    >
      {label}
    </div>
    <div
      className={`mt-1 text-[18px] font-black tabular-nums truncate ${emphasis ? 'text-emerald-700' : 'text-slate-900'}`}
    >
      {value}
    </div>
    {sub && (
      <div className="text-[11px] font-medium text-slate-500 tabular-nums break-all">
        {sub}
      </div>
    )}
  </div>
);
