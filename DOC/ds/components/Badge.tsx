import * as React from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cx("ui-badge", `ui-badge--${tone}`, className)} {...props} />;
}
