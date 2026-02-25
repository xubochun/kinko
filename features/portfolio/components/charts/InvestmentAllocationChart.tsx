"use client";

import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

type Slice = {
  label: string;
  value: number;
};

const COLORS = [
  "#1D4ED8",
  "#0EA5E9",
  "#14B8A6",
  "#10B981",
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#A855F7",
  "#6366F1",
  "#64748B"
];

export default function InvestmentAllocationChart({ slices }: { slices: Slice[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const normalized = useMemo(() => {
    const total = slices.reduce((acc, s) => acc + s.value, 0);
    if (!total) return [];
    const sorted = slices.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
    const maxItems = 6;
    const top = sorted.slice(0, maxItems);
    const rest = sorted.slice(maxItems);
    const restValue = rest.reduce((acc, s) => acc + s.value, 0);
    const merged = restValue > 0 ? [...top, { label: "其他", value: restValue }] : top;
    return merged.map((s, idx) => ({
      ...s,
      pct: Math.round((s.value / total) * 100),
      color: COLORS[idx % COLORS.length]
    }));
  }, [slices]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

    if (!normalized.length) {
      canvas.style.display = "none";
      return;
    }

    canvas.style.display = "block";

    const totalValue = normalized.reduce((acc, s) => acc + s.value, 0);
    const centerText = {
      id: "centerText",
      afterDraw(chart: Chart) {
        const { ctx, chartArea } = chart;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.fillStyle = "#0F172A";
        ctx.font = "600 18px system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(totalValue.toLocaleString(), centerX, centerY - 6);
        ctx.fillStyle = "#64748B";
        ctx.font = "500 11px system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text'";
        ctx.fillText("股", centerX, centerY + 12);
        ctx.restore();
      }
    };

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: normalized.map((s) => s.label),
        datasets: [
          {
            data: normalized.map((s) => Math.round(s.value)),
            backgroundColor: normalized.map((s) => s.color),
            borderWidth: 2,
            borderColor: "#FFFFFF",
            borderRadius: 6,
            spacing: 2,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(255,255,255,.96)",
            titleColor: "rgba(17,24,39,.92)",
            bodyColor: "rgba(17,24,39,.82)",
            borderColor: "rgba(17,24,39,.10)",
            borderWidth: 1,
            cornerRadius: 12,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (item) => {
                const val = Number(item.raw || 0);
                const pct = totalValue ? Math.round((val / totalValue) * 100) : 0;
                return `${item.label} ${val.toLocaleString()} 股 (${pct}%)`;
              }
            }
          }
        }
      },
      plugins: [centerText]
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = null;
    };
  }, [normalized]);

  return normalized.length === 0 ? (
    <div className="h-[220px] rounded-2xl border border-slate-200 bg-white/60">
      <div className="h-full w-full grid place-items-center text-[12px] text-slate-400">
        尚無可顯示資料
      </div>
    </div>
  ) : (
    <div className="grid gap-4">
      <div className="h-[220px]">
        <canvas ref={canvasRef} aria-label="持股分布" role="img" />
      </div>
      <div className="grid gap-2">
        {normalized.map((s) => (
          <div key={s.label} className="flex items-center gap-3 text-[12px] text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-slate-800">{s.label}</span>
            </div>
            <span className="shrink-0 tabular-nums text-[11px] text-slate-500 w-10 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
