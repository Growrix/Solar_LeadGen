"use client";

import * as React from "react";

import { Button } from "../primitives/Button";
import { applyTheme, readStoredTheme, storeTheme, type ThemeName } from "../themes/theme";

export type ThemeSwitcherProps = {
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [theme, setTheme] = React.useState<ThemeName>("dark");

  React.useEffect(() => {
    const stored = readStoredTheme();
    const next = stored ?? "dark";
    setTheme(next);
    applyTheme(next);
  }, []);

  const set = (next: ThemeName) => {
    setTheme(next);
    storeTheme(next);
    applyTheme(next);
  };

  return (
    <div className={cx("ui-row", className)} role="group" aria-label="Theme selector">
      <Button size="sm" variant={theme === "dark" ? "primary" : "secondary"} onClick={() => set("dark")}>
        Dark
      </Button>
      <Button size="sm" variant={theme === "light" ? "primary" : "secondary"} disabled aria-disabled="true">
        Light
      </Button>
      <Button size="sm" variant={theme === "purple" ? "primary" : "secondary"} disabled aria-disabled="true">
        Purple
      </Button>
    </div>
  );
}
