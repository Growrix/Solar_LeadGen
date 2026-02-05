import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AppBarProps = {
  leading?: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function AppBar({ leading, title, actions, className }: AppBarProps) {
  return (
    <header className={cx("ui-appbar", className)}>
      <div className="ui-appbar__inner">
        <div className="ui-appbar__leading">{leading}</div>
        <div className="ui-appbar__title">{title}</div>
        <div className="ui-appbar__actions">{actions}</div>
      </div>
    </header>
  );
}
