"use client";

import * as React from "react";
import { createPortal } from "react-dom";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ContextMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
};

export type ContextMenuProps = {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
};

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = () => setOpen(false);
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const el = menuRef.current;
    if (!el) return;
    el.style.setProperty("--ui-cm-left", `${pos.x}px`);
    el.style.setProperty("--ui-cm-top", `${pos.y}px`);
  }, [open, pos]);

  return (
    <div
      className={cx("ui-cmhost", className)}
      onContextMenu={(e) => {
        e.preventDefault();
        setPos({ x: e.clientX, y: e.clientY });
        setOpen(true);
      }}
    >
      {children}
      {open
        ? createPortal(
            <div ref={menuRef} className="ui-cm" role="menu" aria-label="Context menu">
              {items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  className="ui-cm__item ui-focus-ring"
                  role="menuitem"
                  onClick={() => {
                    it.onSelect();
                    setOpen(false);
                  }}
                >
                  {it.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
