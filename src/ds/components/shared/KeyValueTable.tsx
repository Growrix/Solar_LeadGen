import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type KeyValueItem = {
  id: string;
  key: React.ReactNode;
  value: React.ReactNode;
};

export type KeyValueTableProps = {
  items: KeyValueItem[];
  className?: string;
};

export function KeyValueTable({ items, className }: KeyValueTableProps) {
  return (
    <dl className={cx("ui-kv", className)}>
      {items.map((it) => (
        <div key={it.id} className="ui-kv__row">
          <dt className="ui-kv__key text-body-small ui-text-muted">{it.key}</dt>
          <dd className="ui-kv__value text-body-small">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
