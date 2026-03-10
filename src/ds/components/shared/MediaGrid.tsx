import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type MediaGridProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

export function MediaGrid({ size = "md", className, ...props }: MediaGridProps) {
  return <div className={cx("ui-media-grid", `ui-media-grid--${size}`, className)} {...props} />;
}
