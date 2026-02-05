"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export type DrawerSide = "bottom" | "left" | "right";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  side?: DrawerSide;
  closeOnOverlayClick?: boolean;
  children: React.ReactNode;
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function getFocusable(container: HTMLElement) {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  side = "bottom",
  closeOnOverlayClick = true,
  children,
  className,
}: DrawerProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const lastActiveRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;

    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = getFocusable(panel);
      (focusable[0] ?? panel).focus();
    }, 0);

    return () => window.clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = getFocusable(panel);
      if (focusable.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) return;
    lastActiveRef.current?.focus?.();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="ui-drawer" data-side={side}>
      <div
        className="ui-overlay"
        onMouseDown={() => {
          if (closeOnOverlayClick) onClose();
        }}
      />
      <div
        ref={panelRef}
        className={cx("ui-drawer__panel", className)}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
      >
        {(title || description) && (
          <header className="ui-modal__header">
            {title ? <div className="text-heading-4">{title}</div> : null}
            {description ? <div className="text-body-small ui-text-muted">{description}</div> : null}
          </header>
        )}
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
