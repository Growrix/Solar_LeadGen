import * as React from "react";

export type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
};

function pathFrom(data: number[], width: number, height: number) {
  if (data.length < 2) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const dx = width / (data.length - 1);
  return data
    .map((v, i) => {
      const x = i * dx;
      const y = height - ((v - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function Sparkline({ data, width = 120, height = 32, label = "Trend" }: SparklineProps) {
  const d = pathFrom(data, width, height);
  return (
    <svg className="ui-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path className="ui-spark__line" d={d} fill="none" />
    </svg>
  );
}
