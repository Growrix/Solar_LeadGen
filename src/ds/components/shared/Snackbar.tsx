"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { Button } from "../../primitives/Button";
import { Icon } from "./Icon";
import { X } from "../../icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SnackbarProps = {
  open: boolean;
  onClose?: () => void;
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  className?: string;
};

export function Snackbar({ open, onClose, message, actionLabel, onAction, tone = "neutral", className }: SnackbarProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!open) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="ui-snackbar-region" aria-live="polite" aria-relevant="additions removals">
      <div className={cx("ui-snackbar", `ui-snackbar--${tone}`, className)} role="status">
        <div className="ui-snackbar__msg text-body-small">{message}</div>
        {actionLabel ? (
          <Button size="sm" variant="text" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {onClose ? (
          <Button size="sm" variant="icon" aria-label="Dismiss" onClick={onClose}>
            <Icon icon={X} aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
