import * as React from "react";

export type SpacerSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SpacerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: SpacerSize;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Spacer({ size = 6, className, ...props }: SpacerProps) {
  return <div className={cx("ui-spacer", `ui-spacer--${size}`, className)} aria-hidden="true" {...props} />;
}
