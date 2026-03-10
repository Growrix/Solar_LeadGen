"use client";

import * as React from "react";

import { ToggleButton } from "./ToggleButton";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type FilterChipOption = {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type FilterChipsProps = {
  values: string[];
  onValuesChange: (values: string[]) => void;
  options: FilterChipOption[];
  ariaLabel?: string;
  className?: string;
};

export function FilterChips({ values, onValuesChange, options, ariaLabel = "Filters", className }: FilterChipsProps) {
  const set = new Set(values);

  return (
    <div className={cx("ui-chips", className)} role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const pressed = set.has(o.id);
        return (
          <ToggleButton
            key={o.id}
            pressed={pressed}
            size="sm"
            variant="secondary"
            disabled={o.disabled}
            onClick={() => {
              const next = new Set(values);
              if (next.has(o.id)) next.delete(o.id);
              else next.add(o.id);
              onValuesChange(Array.from(next));
            }}
          >
            {o.label}
          </ToggleButton>
        );
      })}
    </div>
  );
}
