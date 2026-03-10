import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SkeletonProps = {
  className?: string;
  lines?: number;
};

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className={cx("ui-skeleton", className)} aria-hidden="true">
      {Array.from({ length: Math.max(1, lines) }).map((_, idx) => (
        <div key={idx} className="ui-skeleton__line" />
      ))}
    </div>
  );
}
