import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type GlowProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

export function Glow({ size = "md", className, ...props }: GlowProps) {
  return <div className={cx("ui-glow", `ui-glow--${size}`, className)} aria-hidden="true" {...props} />;
}
