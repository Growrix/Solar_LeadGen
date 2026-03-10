import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type MasonryLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

export function MasonryLayout({ size = "md", className, ...props }: MasonryLayoutProps) {
  return <div className={cx("ui-masonry", `ui-masonry--${size}`, className)} {...props} />;
}
