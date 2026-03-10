"use client";

import * as React from "react";
import { createPortal } from "react-dom";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement<{
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    "aria-describedby"?: string;
  }>;
  className?: string;
};

export function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const id = React.useId();
  const [anchor, setAnchor] = React.useState<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  const onAnchorRef = React.useCallback((node: HTMLSpanElement | null) => {
    setAnchor(node);
  }, []);

  const compute = React.useCallback(() => {
    const el = anchor;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 + window.scrollX });
  }, [anchor]);

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
    if (!pos) return;
    const el = tooltipRef.current;
    if (!el) return;
    el.style.setProperty("--ui-tooltip-top", `${pos.top}px`);
    el.style.setProperty("--ui-tooltip-left", `${pos.left}px`);
  }, [open, pos]);

  const child = React.cloneElement(children, {
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      setOpen(true);
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      setOpen(false);
    },
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      setOpen(true);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      setOpen(false);
    },
    "aria-describedby": open ? id : undefined,
  });

  return (
    <>
      <span className="ui-tooltip__anchor" ref={onAnchorRef}>
        {child}
      </span>
      {open && pos
        ? createPortal(
            <div id={id} ref={tooltipRef} role="tooltip" className={cx("ui-tooltip", className)}>
              <div className="ui-tooltip__bubble text-body-small">{content}</div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
