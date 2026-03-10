import * as React from "react";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export type LineChartProps = {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
};

export function LineChart({ data, width = 240, height = 120, label = "Line chart" }: LineChartProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const dx = data.length > 1 ? width / (data.length - 1) : width;
  const d = data
    .map((v, i) => {
      const x = i * dx;
      const y = height - clamp01((v - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg className="ui-chart" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path className="ui-chart__line" d={d} fill="none" />
    </svg>
  );
}

export type BarChartProps = {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
};

export function BarChart({ data, width = 240, height = 120, label = "Bar chart" }: BarChartProps) {
  const max = Math.max(...data, 1);
  const gap = 6;
  const barW = Math.max(6, (width - gap * (data.length - 1)) / Math.max(1, data.length));
  return (
    <svg className="ui-chart" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      {data.map((v, i) => {
        const h = clamp01(v / max) * height;
        const x = i * (barW + gap);
        const y = height - h;
        return <rect key={i} className="ui-chart__bar" x={x} y={y} width={barW} height={h} rx={4} />;
      })}
    </svg>
  );
}

export type PieSlice = { id: string; value: number; label?: string };

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export type PieChartProps = {
  slices: PieSlice[];
  size?: number;
  label?: string;
};

export function PieChart({ slices, size = 120, label = "Pie chart" }: PieChartProps) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2;
  const start0 = -Math.PI / 2;
  const sweeps = slices.map((s) => (s.value / total) * Math.PI * 2);
  return (
    <svg className="ui-chart" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      {slices.map((s, idx) => {
        const start = start0 + sweeps.slice(0, idx).reduce((a, v) => a + v, 0);
        const end = start + sweeps[idx];
        return <path key={s.id} className="ui-chart__slice" data-i={idx} d={arcPath(r, r, r, start, end)} />;
      })}
    </svg>
  );
}

export type DonutChartProps = {
  slices: PieSlice[];
  size?: number;
  thickness?: number;
  label?: string;
};

export function DonutChart({ slices, size = 120, thickness = 14, label = "Donut chart" }: DonutChartProps) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2;
  const rr = r - thickness / 2;
  const start0 = -Math.PI / 2;
  const sweeps = slices.map((s) => (s.value / total) * Math.PI * 2);
  const strokeW = thickness;

  const circlePath = (start: number, end: number) => {
    const x1 = r + rr * Math.cos(start);
    const y1 = r + rr * Math.sin(start);
    const x2 = r + rr * Math.cos(end);
    const y2 = r + rr * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${rr} ${rr} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg className="ui-chart" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      {slices.map((s, idx) => {
        const start = start0 + sweeps.slice(0, idx).reduce((a, v) => a + v, 0);
        const end = start + sweeps[idx];
        return <path key={s.id} className="ui-chart__donut" data-i={idx} d={circlePath(start, end)} fill="none" strokeWidth={strokeW} strokeLinecap="round" />;
      })}
    </svg>
  );
}
