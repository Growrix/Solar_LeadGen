"use client";

import * as React from "react";

import { Button, type ButtonProps } from "../../primitives/Button";

export type LongPressButtonProps = ButtonProps & {
  onLongPress?: () => void;
  longPressDelayMs?: number;
};

export function LongPressButton({ onLongPress, longPressDelayMs = 550, onClick, ...props }: LongPressButtonProps) {
  const timerRef = React.useRef<number | null>(null);
  const firedRef = React.useRef(false);

  const clear = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = () => {
    if (!onLongPress) return;
    firedRef.current = false;
    clear();
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, longPressDelayMs);
  };

  return (
    <Button
      {...props}
      onPointerDown={(e) => {
        props.onPointerDown?.(e);
        start();
      }}
      onPointerUp={(e) => {
        props.onPointerUp?.(e);
        clear();
      }}
      onPointerCancel={(e) => {
        props.onPointerCancel?.(e);
        clear();
      }}
      onPointerLeave={(e) => {
        props.onPointerLeave?.(e);
        clear();
      }}
      onClick={(e) => {
        if (firedRef.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      }}
    />
  );
}
