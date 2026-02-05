import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type BreadcrumbItem = {
  id: string;
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  label?: string;
};

export function Breadcrumbs({ items, className, label = "Breadcrumb" }: BreadcrumbsProps) {
  return (
    <nav className={cx("ui-breadcrumbs", className)} aria-label={label}>
      <ol className="ui-breadcrumbs__list">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={it.id} className="ui-breadcrumbs__item">
              {it.href && !isLast ? (
                <a className="ui-breadcrumbs__link ui-focus-ring" href={it.href}>
                  {it.label}
                </a>
              ) : (
                <span className="ui-breadcrumbs__current" aria-current={isLast ? "page" : undefined}>
                  {it.label}
                </span>
              )}
              {!isLast ? <span className="ui-breadcrumbs__sep" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
