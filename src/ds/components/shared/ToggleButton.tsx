"use client";

import * as React from "react";

import { Button, type ButtonProps } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ToggleButtonProps = ButtonProps & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};

export function ToggleButton({
  className,
  pressed,
  defaultPressed,
  onPressedChange,
  variant = "secondary",
  onClick,
  ...props
}: ToggleButtonProps) {
  const isControlled = typeof pressed === "boolean";
  const [uncontrolledPressed, setUncontrolledPressed] = React.useState(Boolean(defaultPressed));

  const isPressed = isControlled ? Boolean(pressed) : uncontrolledPressed;

  return (
    <Button
      {...props}
      variant={variant}
      className={cx("ui-button--toggle", className)}
      aria-pressed={isPressed}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        const next = !isPressed;
        if (!isControlled) setUncontrolledPressed(next);
        onPressedChange?.(next);
      }}
    />
  );
}
