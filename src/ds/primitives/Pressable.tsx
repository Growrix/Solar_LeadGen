"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type PressableProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
};

export const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(function Pressable(
  { className, pressed, onPointerDown, onPointerUp, onPointerCancel, onPointerLeave, onBlur, ...props },
  ref
) {
  const [uncontrolledPressed, setUncontrolledPressed] = React.useState(false);
  const isControlled = typeof pressed === "boolean";
  const isPressed = isControlled ? pressed : uncontrolledPressed;

  const set = (next: boolean) => {
    if (!isControlled) setUncontrolledPressed(next);
  };

  return (
    <button
      ref={ref}
      type={props.type ?? "button"}
      className={cx("ui-pressable ui-focus-ring", className)}
      data-pressed={isPressed ? "true" : undefined}
      onPointerDown={(e) => {
        set(true);
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        set(false);
        onPointerUp?.(e);
      }}
      onPointerCancel={(e) => {
        set(false);
        onPointerCancel?.(e);
      }}
      onPointerLeave={(e) => {
        set(false);
        onPointerLeave?.(e);
      }}
      onBlur={(e) => {
        set(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
});
