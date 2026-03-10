import * as React from "react";

export type LabelProps = React.HTMLAttributes<HTMLSpanElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** Token-driven label text (for compact headings, metadata, etc.). */
export function Label({ className, ...props }: LabelProps) {
  return <span className={cx("text-label", className)} {...props} />;
}
