"use client";

import * as React from "react";

import { Button } from "../../primitives/Button";
import { DropdownMenu, DropdownMenuButton } from "./DropdownMenu";
import { Icon } from "./Icon";
import { Check, Sun, Zap } from "../../icons";
import { THEMES, type ThemeName } from "../../themes/registry";
import { applyTheme, readStoredTheme, storeTheme } from "../../themes/theme";

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

  const themeCount = THEMES.length;
  const canToggle = themeCount === 2;
  const canChoose = themeCount > 2;

  const nextToggleTheme = React.useMemo<ThemeName | null>(() => {
    if (!canToggle) return null;
    const other = THEMES.find((t) => t.name !== theme);
    return (other?.name ?? null) as ThemeName | null;
  }, [canToggle, theme]);

  const triggerIcon = theme === "purple" ? Zap : Sun;
  const ariaLabel = canToggle
    ? `Toggle theme${nextToggleTheme ? ` (switch to ${nextToggleTheme})` : ""}`
    : "Change theme";

  const trigger = (
    <Button
      size="sm"
      variant="secondary"
      className={className}
      aria-label={ariaLabel}
      onClick={
        canToggle
          ? () => {
              if (nextToggleTheme) set(nextToggleTheme);
            }
          : undefined
      }
      disabled={themeCount <= 1}
    >
      <Icon icon={triggerIcon} size="sm" aria-hidden />
    </Button>
  );

  if (!canChoose) return trigger;

  return (
    <div className={cx("ui-row", className)}>
      <DropdownMenu trigger={trigger}>
        {THEMES.map((t) => {
          const active = t.name === theme;
          return (
            <DropdownMenuButton key={t.name} onClick={() => set(t.name)} aria-current={active ? "true" : undefined}>
              <span className="ui-flex-1 ui-min-w-0">{t.label}</span>
              {active ? <Icon icon={Check} size="sm" aria-hidden /> : null}
            </DropdownMenuButton>
          );
        })}
      </DropdownMenu>
    </div>
  );
}

