"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SegmentedControlItem = {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  value: string;
  onValueChange: (id: string) => void;
  items: SegmentedControlItem[];
  ariaLabel?: string;
  size?: "sm" | "md";
  className?: string;
};

export function SegmentedControl({ value, onValueChange, items, ariaLabel = "Segmented control", size = "md", className }: SegmentedControlProps) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    e.preventDefault();
    const enabled = items.filter((i) => !i.disabled);
    const idx = Math.max(
      0,
      enabled.findIndex((i) => i.id === value)
    );
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = enabled[(idx + dir + enabled.length) % enabled.length];
    if (next) onValueChange(next.id);
  };

  return (
    <div className={cx("ui-segment", size === "sm" && "ui-segment--sm", className)} role="radiogroup" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {items.map((it) => {
        const selected = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={it.disabled}
            className={cx("ui-segment__item ui-focus-ring", selected && "ui-segment__item--selected")}
            onClick={() => onValueChange(it.id)}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
