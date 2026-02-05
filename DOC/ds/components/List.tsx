import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ListProps = {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function List({ children, className, ariaLabel }: ListProps) {
  return (
    <ul className={cx("ui-list", className)} aria-label={ariaLabel}>
      {children}
    </ul>
  );
}

export type ListItemProps = {
  children: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
};

export function ListItem({ children, leading, trailing, className }: ListItemProps) {
  return (
    <li className={cx("ui-list__item", className)}>
      {leading ? <div className="ui-list__leading">{leading}</div> : null}
      <div className="ui-list__content">{children}</div>
      {trailing ? <div className="ui-list__trailing">{trailing}</div> : null}
    </li>
  );
}
