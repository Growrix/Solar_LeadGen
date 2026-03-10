"use client";

import * as React from "react";

import { a11y } from "../foundation";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AnimatedViewProps = {
  open: boolean;
  children: React.ReactNode;
  motion?: "fade" | "slide-up";
  className?: string;
};

export function AnimatedView({ open, children, motion = "fade", className }: AnimatedViewProps) {
  const reducedMotion = a11y.usePrefersReducedMotion();

  return (
    <div
      className={cx("ui-animated", motion === "fade" && "ui-animated--fade", motion === "slide-up" && "ui-animated--slide-up", className)}
      data-open={open ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      aria-hidden={open ? undefined : true}
    >
      {children}
    </div>
  );
}
