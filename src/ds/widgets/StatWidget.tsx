import * as React from "react";

export type StatWidgetProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
};

export function StatWidget({ label, value, meta, icon }: StatWidgetProps) {
  return (
    <div className="ui-stat">
      {icon ? <div className="ui-stat__icon" aria-hidden>
        {icon}
      </div> : null}
      <div className="ui-stat__main">
        <div className="text-body-small ui-stat__label">{label}</div>
        <div className="text-heading-3 ui-stat__value">{value}</div>
        {meta ? (
          <div className="text-caption ui-stat__meta">{meta}</div>
        ) : null}
      </div>
    </div>
  );
}
