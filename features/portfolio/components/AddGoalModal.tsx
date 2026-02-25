import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  mode: "new" | "edit";
  initialTicker?: string;
  initialShares?: number;
  onClose: () => void;
  onSave: (ticker: string, shares: number) => void;
  onRemove?: () => void;
};

export default function AddGoalModal({
  open,
  mode,
  initialTicker,
  initialShares,
  onClose,
  onSave,
  onRemove
}: Props) {
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");

  useEffect(() => {
    if (!open) return;
    setTicker(initialTicker ?? "");
    setShares(initialShares ? String(initialShares) : "");
  }, [open, initialTicker, initialShares]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = ticker.trim();
    const s = Number(shares.replace(/[^\d]/g, ""));
    if (!t || !s || Number.isNaN(s)) return;
    onSave(t, s);
    onClose();
  };

  const isEdit = mode === "edit";

  return (
    <div id="goalModalOverlay" className={`fixed inset-0 z-50 flex items-end md:items-center justify-center ${open ? "modal-enter-active" : "modal-enter"}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>

      <div id="goalModalSheet" className={`relative w-full bg-white rounded-t-3xl md:rounded-3xl p-6 pb-10 md:pb-6 sm:max-w-sm md:max-w-md mx-auto shadow-2xl ${open ? "sheet-enter-active" : "sheet-enter"}`}>
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

        <button onClick={onClose} className="hidden md:block absolute top-4 right-4 h-9 w-9 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
          <i data-lucide="x" className="h-5 w-5"></i>
        </button>

        <h3 className="text-[18px] font-semibold text-gray-900 mb-4 text-center md:text-left">
          {isEdit ? "調整存股目標" : "新增存股目標"}
        </h3>

        <form id="addGoalForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">股票代號</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="例如：2330"
              disabled={isEdit}
              className={`w-full rounded-xl border border-gray-200 p-3 text-[14px] outline-none transition-all ${isEdit ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-gray-50/50 text-gray-900 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"}`}
            />
            {isEdit && (
              <div className="mt-1 text-[11px] text-gray-500">股票代號固定，如需更換請刪除後再新增</div>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">目標股數</label>
            <input
              type="text"
              inputMode="numeric"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="例如：300"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            />
          </div>

          <button type="submit" className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] active:scale-[0.98]">
            儲存目標
          </button>

          {isEdit && onRemove && (
            <button
              type="button"
              onClick={() => {
                onRemove();
                onClose();
              }}
              className="w-full inline-flex items-center justify-center rounded-xl bg-slate-100 px-5 py-3 text-[14px] font-semibold text-gray-700 transition hover:bg-slate-200"
            >
              刪除目標
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
