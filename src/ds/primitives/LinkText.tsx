import * as React from "react";

export type LinkTextProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** Token-driven link text (use for inline links). */
export function LinkText({ className, ...props }: LinkTextProps) {
  return <a className={cx("ui-link", className)} {...props} />;
}
