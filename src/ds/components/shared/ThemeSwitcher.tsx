"use client";

import * as React from "react";

import { THEMES, type ThemeName } from "../../themes/registry";
import { applyTheme, readStoredTheme, storeTheme } from "../../themes/theme";

export type ThemeSwitcherProps = {
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [theme, setTheme] = React.useState<ThemeName>("light");

  React.useEffect(() => {
    const stored = readStoredTheme();
    const next = stored ?? "light";
    setTheme(next);
    applyTheme(next);
  }, []);

  if (THEMES.length <= 1) return null;

  const set = (next: ThemeName) => {
    setTheme(next);
    storeTheme(next);
    applyTheme(next);
  };

  const activeIndex = THEMES.findIndex((t) => t.name === theme);

  return (
    <div className={cx("theme-pill", className)} role="radiogroup" aria-label="Theme">
      <span
        className="theme-pill__indicator"
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {THEMES.map((t) => {
        const active = t.name === theme;
        return (
          <button
            key={t.name}
            role="radio"
            aria-checked={active}
            className={cx("theme-pill__option", active && "theme-pill__option--active")}
            onClick={() => set(t.name)}
            type="button"
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
