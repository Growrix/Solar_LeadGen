import * as React from "react";

export type SplitSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  reverse?: boolean;
  left: React.ReactNode;
  right: React.ReactNode;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function SplitSection({ reverse = false, left, right, className, ...props }: SplitSectionProps) {
  return (
    <div className={cx("ui-split", reverse && "ui-split--reverse", className)} {...props}>
      {reverse ? (
        <>
          <div>{right}</div>
          <div>{left}</div>
        </>
      ) : (
        <>
          <div>{left}</div>
          <div>{right}</div>
        </>
      )}
    </div>
  );
}
