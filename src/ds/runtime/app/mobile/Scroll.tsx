import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ScrollProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Adds extra bottom padding on small screens when a fixed bottom nav is present.
   * Uses DS utilities; no hardcoded sizes.
   */
  padBottomNav?: boolean;
};

/**
 * Mobile runtime surface: scroll container with app-like overscroll behavior.
 */
export function Scroll({ padBottomNav, className, ...props }: ScrollProps) {
  return <div className={cx("ui-mobile-scroll", padBottomNav && "ui-shell-content--pad-bottom-nav", className)} {...props} />;
}
