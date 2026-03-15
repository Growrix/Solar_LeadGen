"use client";

import * as React from "react";

import { THEMES, type ThemeName } from "../../themes/registry";
import { applyTheme, readStoredTheme, storeTheme } from "../../themes/theme";

export type ThemeSwitcherProps = {
  className?: string;
};

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-toggle__glyph">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-toggle__glyph">
    <path d="M12 3a6 6 0 0 0 9 9A9 9 0 1 1 12 3z" />
  </svg>
);

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

  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={cx("theme-toggle", className)}
      onClick={() => set(nextTheme)}
    >
      <span className="theme-toggle__rail" aria-hidden="true">
        <span className="theme-toggle__slot theme-toggle__slot--light">
          <SunIcon />
        </span>
        <span className="theme-toggle__slot theme-toggle__slot--dark">
          <MoonIcon />
        </span>
        <span
          className="theme-toggle__thumb"
          style={{
            transform: `translateX(${isDark ? "100%" : "0%"})`,
          }}
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
    </button>
  );
}
