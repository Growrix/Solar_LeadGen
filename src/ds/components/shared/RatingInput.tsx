"use client";

import * as React from "react";

import { Icon } from "./Icon";
import { Star } from "../../icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type RatingInputProps = {
  value: number;
  onValueChange: (value: number) => void;
  max?: number;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function RatingInput({ value, onValueChange, max = 5, ariaLabel = "Rating", disabled, className }: RatingInputProps) {
  const safeMax = Math.max(1, Math.min(10, Math.floor(max)));
  const safeValue = Math.max(0, Math.min(safeMax, Math.floor(value)));

  return (
    <div className={cx("ui-rating", disabled && "ui-rating--disabled", className)} role="radiogroup" aria-label={ariaLabel}>
      {Array.from({ length: safeMax }, (_, i) => {
        const n = i + 1;
        const selected = n <= safeValue;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            className={cx("ui-rating__btn ui-focus-ring", selected && "ui-rating__btn--on")}
            onClick={() => onValueChange(n)}
          >
            <span className="ui-rating__star" aria-hidden>
              <Icon icon={Star} />
            </span>
            <span className="ui-visually-hidden">{n}</span>
          </button>
        );
      })}
    </div>
  );
}
