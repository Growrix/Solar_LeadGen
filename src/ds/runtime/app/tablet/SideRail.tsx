import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SideRailProps = React.HTMLAttributes<HTMLElement> & {
  labelledBy?: string;
};

export function SideRail({ labelledBy, className, ...props }: SideRailProps) {
  return (
    <nav
      data-platform="tablet"
      className={cx("ui-siderail", className)}
      aria-label={labelledBy ? undefined : "Side navigation"}
      aria-labelledby={labelledBy}
      {...props}
    />
  );
}
