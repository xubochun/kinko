'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { HistoryEntry, RangeKey } from '../types/portfolio';
import { currency, formatDate } from '../lib/format';

export default function MainChart({
  history = [],
  range,
  onSelectPoint,
  goalValue,
  opacity = 1,
}: {
  history?: HistoryEntry[];
  range: RangeKey;
  onSelectPoint?: (payload: { date: string; value: number } | null) => void;
  goalValue?: number | null;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const goalValueRef = useRef(goalValue);
  const onSelectPointRef = useRef(onSelectPoint);

  goalValueRef.current = goalValue;
  onSelectPointRef.current = onSelectPoint;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const latestDateStr = sortedHistory[sortedHistory.length - 1]?.date;
    const latestDate = latestDateStr ? new Date(latestDateStr) : null;
    const rangeDays: Record<RangeKey, number | null> = {
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
      ALL: null,
    };

    const cutoff =
      latestDate && rangeDays[range] !== null
        ? new Date(
            latestDate.getTime() - rangeDays[range]! * 24 * 60 * 60 * 1000,
          )
        : null;

    const filteredHistory = cutoff
      ? sortedHistory.filter((h) => new Date(h.date) >= cutoff)
      : sortedHistory;

    if (filteredHistory.length === 0) {
      canvas.style.display = 'none';
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    canvas.style.display = 'block';

    const labels = filteredHistory.map((h) => h.date);
    const values = filteredHistory.map((h) => h.value);
    const maxValue = values.length ? Math.max(...values) : 0;
    const minValue = values.length ? Math.min(...values) : 0;
    const goal =
      goalValueRef.current && !Number.isNaN(goalValueRef.current)
        ? goalValueRef.current
        : null;
    const yMax = goal ? Math.max(maxValue, goal) : maxValue;
    const yMinRaw = goal ? Math.min(minValue, goal) : minValue;
    const rangePadding = Math.max(1, (yMax - yMinRaw) * 0.04);
    const yMin = Math.max(0, yMinRaw - rangePadding);

    const isSinglePoint = values.length === 1;
    const pointSizeByRange: Record<RangeKey, number> = {
      '1W': 4,
      '1M': 3,
      '3M': 2.5,
      '1Y': 2,
      ALL: 1.5,
    };
    const pointSize = pointSizeByRange[range];

    if (chartRef.current) {
      const chart = chartRef.current;

      // Prevent tooltip error on data length change
      if (chart.tooltip && chart.tooltip.getActiveElements().length > 0) {
        chart.tooltip.setActiveElements([], { x: 0, y: 0 });
      }

      chart.data.labels = labels;
      if (chart.data.datasets && chart.data.datasets.length > 0) {
        const dataset = chart.data.datasets[0] as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        dataset.data = values.map((v) => Math.round(v));
        dataset.pointRadius = isSinglePoint ? 6 : pointSize;
        dataset.pointHoverRadius = isSinglePoint
          ? 8
          : Math.max(4, pointSize + 2);
      }
      if (chart.options.scales && chart.options.scales.y) {
        chart.options.scales.y.suggestedMin = yMin;
        chart.options.scales.y.suggestedMax = yMax + rangePadding;
      }
      chart.update('none');
      return;
    }

    const gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.parentElement?.clientHeight || 240,
    );
    gradient.addColorStop(0, 'rgba(46,125,100, 0.25)');
    gradient.addColorStop(1, 'rgba(46,125,100, 0.0)');

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();

    const formatCompact = (value: number) => {
      if (value >= 100000000) {
        const v = (value / 100000000).toFixed(1);
        return v.endsWith('.0') ? `${v.slice(0, -2)}億` : `${v}億`;
      }
      if (value >= 10000) {
        const v = (value / 10000).toFixed(1);
        return v.endsWith('.0') ? `${v.slice(0, -2)}萬` : `${v}萬`;
      }
      return Math.round(value).toString();
    };

    const goalLinePlugin = {
      id: 'goalLine',
      afterDraw(chart: Chart) {
        const currentGoal = goalValueRef.current;
        if (
          currentGoal === null ||
          currentGoal === undefined ||
          Number.isNaN(currentGoal)
        )
          return;
        const { ctx, chartArea, scales } = chart;
        const y = scales.y.getPixelForValue(currentGoal);
        if (y < chartArea.top || y > chartArea.bottom) return;

        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();
        ctx.restore();
      },
    };

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '總資產',
            data: values.map((v) => Math.round(v)),
            borderWidth: 2,
            borderColor: accent,
            pointRadius: isSinglePoint ? 6 : pointSize,
            pointHoverRadius: isSinglePoint ? 8 : Math.max(4, pointSize + 2),
            pointHitRadius: 15,
            pointBackgroundColor: accent,
            tension: 0.34,
            fill: true,
            backgroundColor: gradient,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
        interaction: { mode: 'index', intersect: false },
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
              title: (items) => formatDate(String(items[0].label)),
              label: (item) => `淨值 ${currency(Number(item.raw))}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            offset: false,
            ticks: { display: false },
            border: { display: false },
          },
          y: {
            grid: { color: 'rgba(17,24,39,.04)', drawTicks: false },
            suggestedMin: yMin,
            suggestedMax: yMax + rangePadding,
            ticks: {
              color: 'rgba(17,24,39,.45)',
              font: { size: 11, weight: 500 },
              callback: (v) => formatCompact(Number(v)),
              maxTicksLimit: 4,
            },
            border: { display: false },
          },
        },
        onClick: (evt) => {
          if (!chartRef.current || !evt.native) return;
          const points = chartRef.current.getElementsAtEventForMode(
            evt.native,
            'nearest',
            { intersect: false },
            true,
          );
          if (!points.length) return;
          const idx = points[0].index;
          const rawLabel = chartRef.current.data.labels?.[idx];
          const val = chartRef.current.data.datasets[0].data[idx] as number;
          if (!rawLabel) return;
          const selectHandler = onSelectPointRef.current;
          if (selectHandler) {
            selectHandler({ date: String(rawLabel), value: Number(val) });
          }
        },
      },
      plugins: [goalLinePlugin],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [history, range]);

  return (
    <canvas
      ref={canvasRef}
      id="mainChart"
      aria-label="資產走勢圖"
      role="img"
      style={{ opacity, transition: 'opacity 0.2s ease' }}
    ></canvas>
  );
}
