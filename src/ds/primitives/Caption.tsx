import * as React from "react";

export type CaptionProps = React.HTMLAttributes<HTMLSpanElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** Token-driven caption text. */
export function Caption({ className, ...props }: CaptionProps) {
  return <span className={cx("text-caption", className)} {...props} />;
}
