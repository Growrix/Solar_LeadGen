"use client";

import * as React from "react";
import { createPortal } from "react-dom";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type MenuContextValue = {
  close: () => void;
};

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenuContext() {
  return React.useContext(MenuContext);
}

export type DropdownMenuProps = {
  trigger: React.ReactElement<{
    onClick?: (e: React.MouseEvent) => void;
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
  }>;
  children: React.ReactNode;
  className?: string;
};

export function DropdownMenu({ trigger, children, className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [anchor, setAnchor] = React.useState<HTMLSpanElement | null>(null);
  const menuId = React.useId();

  const onTriggerRef = React.useCallback((node: HTMLSpanElement | null) => {
    setAnchor(node);
  }, []);

  const compute = React.useCallback(() => {
    const el = anchor;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      const root = document.getElementById(menuId);
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
  }, [open, menuId, anchor]);

  return (
    <div className={cx("ui-menu", className)}>
      <span className="ui-menu__anchor" ref={onTriggerRef}>
        {React.cloneElement(trigger, {
          onClick: (e: React.MouseEvent) => {
            (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
            if (!e.defaultPrevented) setOpen((v) => !v);
          },
          "aria-expanded": open,
          "aria-controls": menuId,
        })}
      </span>

      {open && pos
        ? createPortal(
            <MenuContext.Provider value={{ close: () => setOpen(false) }}>
              <div
                id={menuId}
                className="ui-menu__panel"
                role="menu"
                style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
              >
                {children}
              </div>
            </MenuContext.Provider>,
            document.body
          )
        : null}
    </div>
  );
}

export type DropdownMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function DropdownMenuButton({ className, ...props }: DropdownMenuButtonProps) {
  const ctx = useMenuContext();
  return (
    <button
      className={cx("ui-menu__item ui-focus-ring", className)}
      role="menuitem"
      type="button"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) ctx?.close();
      }}
    />
  );
}

export type DropdownMenuLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function DropdownMenuLink({ className, ...props }: DropdownMenuLinkProps) {
  const ctx = useMenuContext();
  return (
    <a
      className={cx("ui-menu__item ui-focus-ring", className)}
      role="menuitem"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) ctx?.close();
      }}
    />
  );
}
