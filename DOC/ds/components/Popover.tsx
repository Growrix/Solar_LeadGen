"use client";

import * as React from "react";
import { createPortal } from "react-dom";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type PopoverProps = {
  trigger: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; "aria-expanded"?: boolean; "aria-controls"?: string }>;
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
};

export function Popover({ trigger, children, className, align = "start" }: PopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const [anchor, setAnchor] = React.useState<HTMLSpanElement | null>(null);
  const id = React.useId();

  const compute = React.useCallback(() => {
    const el = anchor;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = align === "end" ? r.right + window.scrollX : r.left + window.scrollX;
    setPos({ top: r.bottom + window.scrollY, left });
  }, [anchor, align]);

  React.useEffect(() => {
    if (!open) return;
    compute();
    const onScroll = () => compute();
    const onResize = () => compute();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, compute]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      const root = document.getElementById(id);
      if (root && t && root.contains(t)) return;
      if (anchor && t && anchor.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [open, id, anchor]);

  return (
    <div className={cx("ui-popover", className)}>
      <span className="ui-popover__anchor" ref={(n) => setAnchor(n)}>
        {React.cloneElement(trigger, {
          onClick: (e: React.MouseEvent) => {
            (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
            if (!e.defaultPrevented) setOpen((v) => !v);
          },
          "aria-expanded": open,
          "aria-controls": id,
        })}
      </span>

      {open && pos
        ? createPortal(
            <div id={id} className={cx("ui-popover__panel", align === "end" && "ui-popover__panel--end")} role="dialog" aria-modal="false" style={{ top: pos.top, left: pos.left }}>
              {children}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
