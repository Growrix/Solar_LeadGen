import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SharedElementTransitionProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

export function SharedElementTransition({ id, children, className }: SharedElementTransitionProps) {
  return (
    <div className={cx("ui-shared", className)} data-shared-id={id}>
      {children}
    </div>
  );
}
