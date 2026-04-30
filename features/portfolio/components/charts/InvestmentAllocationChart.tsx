'use client';

import { useEffect, useMemo, useRef } from 'react';
import Chart, { TooltipItem } from 'chart.js/auto';

type Slice = {
  label: string;
  value: number;
};

const COLORS = [
  '#1D4ED8',
  '#0EA5E9',
  '#14B8A6',
  '#10B981',
  '#F59E0B',
  '#F97316',
  '#EF4444',
  '#A855F7',
  '#6366F1',
  '#64748B',
];

export default function InvestmentAllocationChart({
  slices,
  centerLabel = '總市值',
  centerValueFormatter,
}: {
  slices: Slice[];
  centerLabel?: string;
  centerValueFormatter?: (value: number) => string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const centerLabelRef = useRef(centerLabel);
  const centerValueFormatterRef = useRef(centerValueFormatter);

  centerLabelRef.current = centerLabel;
  centerValueFormatterRef.current = centerValueFormatter;

  const normalized = useMemo(() => {
    const total = slices.reduce((acc, s) => acc + s.value, 0);
    if (!total) return [];
    const sorted = slices
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value);
    const maxItems = 6;
    const top = sorted.slice(0, maxItems);
    const rest = sorted.slice(maxItems);
    const restValue = rest.reduce((acc, s) => acc + s.value, 0);
    const merged =
      restValue > 0 ? [...top, { label: '其他', value: restValue }] : top;
    return merged.map((s, idx) => ({
      ...s,
      pct: Math.round((s.value / total) * 100),
      color: COLORS[idx % COLORS.length],
    }));
  }, [slices]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!normalized.length) {
      canvas.style.display = 'none';
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    canvas.style.display = 'block';

    const totalValue = normalized.reduce((acc, s) => acc + s.value, 0);

    if (chartRef.current) {
      const chart = chartRef.current as Chart & { _totalValue?: number };

      // Prevent tooltip error on data length change
      if (chart.tooltip && chart.tooltip.getActiveElements().length > 0) {
        chart.tooltip.setActiveElements([], { x: 0, y: 0 });
      }

      chart.data.labels = normalized.map((s) => s.label);
      if (chart.data.datasets && chart.data.datasets.length > 0) {
        chart.data.datasets[0].data = normalized.map((s) =>
          Math.round(s.value),
        );
        chart.data.datasets[0].backgroundColor = normalized.map((s) => s.color);
      }
      // Attach totalValue to chart instance so the plugin can read it dynamically
      chart._totalValue = totalValue;
      chart.update('none');
      return;
    }

    const centerText = {
      id: 'centerText',
      afterDraw(chart: Chart & { _totalValue?: number }) {
        const { ctx, chartArea } = chart;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.fillStyle = '#0F172A';
        ctx.font =
          "600 18px system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text'";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const currentTotal = chart._totalValue || totalValue;
        const formatter = centerValueFormatterRef.current;

        const displayValue = formatter
          ? formatter(currentTotal)
          : currentTotal > 1000000
            ? (currentTotal / 10000).toFixed(1) + '萬'
            : currentTotal.toLocaleString();

        ctx.fillText(displayValue, centerX, centerY - 6);
        ctx.fillStyle = '#64748B';
        ctx.font =
          "500 11px system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text'";
        ctx.fillText(centerLabelRef.current, centerX, centerY + 12);
        ctx.restore();
      },
    };

    const newChart = new Chart<'doughnut'>(ctx, {
      type: 'doughnut',
      data: {
        labels: normalized.map((s) => s.label),
        datasets: [
          {
            data: normalized.map((s) => Math.round(s.value)),
            backgroundColor: normalized.map((s) => s.color),
            borderWidth: 2,
            borderColor: '#FFFFFF',
            borderRadius: 6,
            spacing: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,.96)',
            titleColor: 'rgba(17,24,39,.92)',
            bodyColor: 'rgba(17,24,39,.82)',
            borderColor: 'rgba(17,24,39,.10)',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (item: TooltipItem<'doughnut'>) => {
                const val = Number(item.raw || 0);
                const chartInstance = item.chart as Chart & {
                  _totalValue?: number;
                };
                const currentTotal = chartInstance._totalValue || totalValue;
                const pct = currentTotal
                  ? Math.round((val / currentTotal) * 100)
                  : 0;
                return `${item.label}: ${val.toLocaleString()} (${pct}%)`;
              },
            },
          },
        },
      },
      plugins: [centerText],
    });

    (newChart as Chart & { _totalValue?: number })._totalValue = totalValue;
    chartRef.current = newChart;

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [normalized]);

  return normalized.length === 0 ? (
    <div className="h-[220px] rounded-2xl border border-slate-200 bg-white/60">
      <div className="h-full w-full grid place-items-center text-[12px] text-slate-400">
        尚無可顯示資料
      </div>
    </div>
  ) : (
    <div className="h-[240px] w-full">
      <canvas ref={canvasRef} aria-label="持股分布" role="img" />
    </div>
  );
}
