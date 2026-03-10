"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ProgressRingSize = "sm" | "md" | "lg";

export type ProgressRingProps = {
  value: number;
  max?: number;
  label?: string;
  size?: ProgressRingSize;
  className?: string;
  children?: React.ReactNode;
};

export function ProgressRing({ value, max = 100, label = "Progress", size = "md", className, children }: ProgressRingProps) {
  const safeMax = Math.max(1, max);
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--ui-progress", `${pct}%`);
  }, [pct]);

  return (
    <div
      ref={rootRef}
      className={cx("ui-ring", `ui-ring--${size}`, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={value}
    >
      <div className="ui-ring__center">{children ?? <span className="text-body-small">{Math.round(pct)}%</span>}</div>
    </div>
  );
}
