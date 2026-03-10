"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type HoverableProps = React.HTMLAttributes<HTMLDivElement> & {
  hovered?: boolean;
};

export function Hoverable({ className, hovered, onMouseEnter, onMouseLeave, onBlur, ...props }: HoverableProps) {
  const [uncontrolledHovered, setUncontrolledHovered] = React.useState(false);
  const isControlled = typeof hovered === "boolean";
  const isHovered = isControlled ? hovered : uncontrolledHovered;

  const set = (next: boolean) => {
    if (!isControlled) setUncontrolledHovered(next);
  };

  return (
    <div
      className={cx("ui-hoverable", className)}
      data-hovered={isHovered ? "true" : undefined}
      onMouseEnter={(e) => {
        set(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        set(false);
        onMouseLeave?.(e);
      }}
      onBlur={(e) => {
        set(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
