import * as React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: CardProps) {
  return <div className={cx("ui-card", className)} {...props} />;
}
