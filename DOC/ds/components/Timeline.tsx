import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type TimelineItem = {
  id: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  body?: React.ReactNode;
};

export type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cx("ui-timeline", className)}>
      {items.map((it) => (
        <div key={it.id} className="ui-timeline__item">
          <div className="ui-timeline__rail" aria-hidden="true">
            <span className="ui-timeline__dot" />
          </div>
          <div className="ui-timeline__content">
            <div className="ui-row ui-row--between">
              <div className="text-body-small">{it.title}</div>
              {it.meta ? <div className="text-caption ui-text-muted">{it.meta}</div> : null}
            </div>
            {it.body ? <div className="text-caption ui-text-muted">{it.body}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
