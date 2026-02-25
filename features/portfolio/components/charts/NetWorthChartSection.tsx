import type { HistoryEntry, RangeKey } from "../../../../types/portfolio";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";

type MainChartProps = {
  history?: HistoryEntry[];
  range: RangeKey;
  onSelectPoint?: (payload: { date: string; value: number } | null) => void;
  goalValue?: number | null;
  opacity?: number;
};

const MainChart = ({
  history,
  range,
  goalValue
}: {
  history: HistoryEntry[];
  range: RangeKey;
  goalValue?: number | null;
}) => {
  const [Chart, setChart] = useState<ComponentType<MainChartProps> | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const mod = await import("../../../../components/MainChart");
      if (active) setChart(() => mod.default);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  if (!Chart) {
    return (
      <div className="h-[240px] rounded-2xl border border-slate-200 bg-white/60">
        <div className="h-full w-full skeleton"></div>
      </div>
    );
  }

  return <Chart history={history} range={range} goalValue={goalValue} />;
};

export default function NetWorthChartSection({
  hasAssets,
  isReady,
  history,
  privacy,
  resetKey
}: {
  hasAssets: boolean;
  isReady: boolean;
  history: HistoryEntry[];
  privacy: boolean;
  resetKey: number;
}) {
  const [range, setRange] = useState<RangeKey>("1M");
  const [goalValue, setGoalValue] = useState<number | null>(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [goalError, setGoalError] = useState("");
  const [chartOpen, setChartOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("my_portfolio_networth_goal");
    if (!stored) return;
    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) setGoalValue(parsed);
    if (!Number.isNaN(parsed)) setGoalInput(String(parsed));
  }, []);

  const openGoalModal = () => {
    setGoalError("");
    setGoalInput(goalValue ? String(goalValue) : "");
    setGoalOpen(true);
  };

  const closeGoalModal = () => {
    setGoalOpen(false);
    setGoalError("");
  };

  const submitGoal = () => {
    const trimmed = goalInput.trim();
    if (!trimmed) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("my_portfolio_networth_goal");
      }
      setGoalValue(null);
      closeGoalModal();
      return;
    }
    const parsed = Number(trimmed.replace(/,/g, ""));
    if (Number.isNaN(parsed)) {
      setGoalError("請輸入有效數字");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("my_portfolio_networth_goal", String(parsed));
    }
    setGoalValue(parsed);
    closeGoalModal();
  };

  return (
    <section className="soft-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <i data-lucide="line-chart" className="h-4 w-4"></i>
          </span>
          <span className="text-[12px] font-semibold text-gray-500">資產走勢</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <button
            onClick={openGoalModal}
            className="rounded-full px-3 py-1 text-[11px] font-semibold transition bg-slate-900 text-white"
            aria-label="設定目標"
          >
            設定目標
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 outline-none hover:bg-slate-50"
            aria-label="選擇時間區間"
          >
            <option value="1W">1W</option>
            <option value="1M">1M</option>
            <option value="3M">3M</option>
            <option value="1Y">1Y</option>
            <option value="ALL">ALL</option>
          </select>
          <button
            onClick={() => setChartOpen(true)}
            className="hidden md:inline-flex h-[28px] w-[28px] items-center justify-center rounded-full text-slate-600 transition bg-white/70 ring-1 ring-black/[.06] hover:bg-white"
            aria-label="放大圖表"
          >
            <i data-lucide="maximize-2" className="h-3.5 w-3.5"></i>
          </button>
        </div>
      </div>
      <div className="chart-wrap">
        {isReady && hasAssets ? (
          <MainChart
            key={`${resetKey}-${range}-${goalValue ?? "none"}`}
            history={Array.isArray(history) ? history : []}
            range={range}
            goalValue={goalValue}
          />
        ) : (
          <div className="h-[240px] rounded-2xl border border-slate-200 bg-white/60">
            <div className="h-full w-full skeleton"></div>
          </div>
        )}
      </div>

      {goalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40" onClick={closeGoalModal}></div>
          <div className="relative w-[92%] max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="text-[14px] font-semibold text-gray-900">設定淨值目標</div>
            <div className="mt-1 text-[11px] text-gray-500">輸入數字即可，留空表示清除</div>
            <input
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="例如：4500000"
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-slate-400"
            />
            {goalError ? <div className="mt-2 text-[11px] text-rose-600">{goalError}</div> : null}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={closeGoalModal}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
              <button
                onClick={submitGoal}
                className="rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {chartOpen ? (
        <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setChartOpen(false)}></div>
          <div className="relative w-[90%] max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <i data-lucide="line-chart" className="h-4 w-4"></i>
                </span>
                <span className="text-[13px] font-semibold text-gray-700">資產走勢</span>
              </div>
              <button
                onClick={() => setChartOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="關閉"
              >
                <i data-lucide="x" className="h-4 w-4"></i>
              </button>
            </div>
            <div className="h-[520px]">
              <MainChart
                key={`modal-${resetKey}-${range}-${goalValue ?? "none"}`}
                history={Array.isArray(history) ? history : []}
                range={range}
                goalValue={goalValue}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
