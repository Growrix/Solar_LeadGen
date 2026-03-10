import * as React from "react";

export type DividerProps = React.HTMLAttributes<HTMLHRElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={cx("ui-divider", className)} {...props} />;
}
