import * as React from "react";

export type ListWidgetItem = {
  id: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  trailing?: React.ReactNode;
};

export type ListWidgetProps = {
  items: ListWidgetItem[];
  empty?: React.ReactNode;
};

export function ListWidget({ items, empty }: ListWidgetProps) {
  if (items.length === 0) return <>{empty ?? null}</>;
  return (
    <div className="ui-widget-list" role="list">
      {items.map((it) => (
        <div key={it.id} className="ui-widget-list__row" role="listitem">
          <div className="ui-widget-list__main">
            <div className="ui-widget-list__primary">{it.primary}</div>
            {it.secondary ? <div className="ui-widget-list__secondary">{it.secondary}</div> : null}
          </div>
          {it.trailing ? <div className="ui-widget-list__trail">{it.trailing}</div> : null}
        </div>
      ))}
    </div>
  );
}
