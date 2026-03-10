import * as React from "react";

export type GridCols = 1 | 2 | 3;

export type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  cols?: GridCols;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Grid({ cols = 1, className, ...props }: GridProps) {
  return (
    <div
      className={cx(
        "ui-grid",
        cols === 2 && "ui-grid--2",
        cols === 3 && "ui-grid--3",
        className
      )}
      {...props}
    />
  );
}
