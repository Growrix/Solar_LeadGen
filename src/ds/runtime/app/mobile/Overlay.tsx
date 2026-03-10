"use client";

import * as React from "react";
import { createPortal } from "react-dom";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type OverlayProps = {
  open: boolean;
  onClose?: () => void;
  children?: never;
  className?: string;
  labelledBy?: string;
};

export function Overlay({ open, onClose, className, labelledBy }: OverlayProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={cx("ui-overlay", className)}
      role="presentation"
      aria-label={labelledBy ? undefined : "Overlay"}
      aria-labelledby={labelledBy}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    />,
    document.body
  );
}
