import * as React from "react";

export type TruncatedTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Optional title attribute for the full text on hover/long-press. */
  title?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** Single-line truncation (ellipsis) using DS utilities. */
export function TruncatedText({ className, ...props }: TruncatedTextProps) {
  return <span className={cx("ui-truncate", className)} {...props} />;
}
