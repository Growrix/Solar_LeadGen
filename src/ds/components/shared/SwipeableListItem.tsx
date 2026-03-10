"use client";

import * as React from "react";

import { ListItem, type ListItemProps } from "./List";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type Point = { x: number; y: number };

export type SwipeableListItemProps = ListItemProps & {
  actions?: React.ReactNode;
  maxSwipe?: number;
};

export function SwipeableListItem({ className, actions, maxSwipe, ...props }: SwipeableListItemProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [x, setX] = React.useState(0);
  const startRef = React.useRef<Point | null>(null);
  const draggingRef = React.useRef(false);

  const clamp = React.useCallback((nextX: number, max: number) => {
    return Math.min(0, Math.max(-max, nextX));
  }, []);

  const getMax = React.useCallback(() => {
    if (typeof maxSwipe === "number") return maxSwipe;
    const el = rootRef.current?.querySelector<HTMLElement>("[data-swipe-actions]");
    return el?.offsetWidth ?? 0;
  }, [maxSwipe]);

  return (
    <div
      ref={rootRef}
      className={cx("ui-swipe", className)}
      style={{ ["--ui-swipe-x" as any]: `${x}px` }}
      onPointerDown={(e) => {
        if (!actions) return;
        startRef.current = { x: e.clientX, y: e.clientY };
        draggingRef.current = true;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!actions) return;
        if (!draggingRef.current || !startRef.current) return;

        const dx = e.clientX - startRef.current.x;
        const dy = e.clientY - startRef.current.y;

        if (Math.abs(dy) > Math.abs(dx)) return;

        const max = getMax();
        if (max <= 0) return;
        setX(clamp(dx, max));
      }}
      onPointerUp={(e) => {
        if (!actions) return;
        draggingRef.current = false;
        startRef.current = null;
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);

        const max = getMax();
        const shouldOpen = Math.abs(x) > max * 0.35;
        setX(shouldOpen ? -max : 0);
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
        startRef.current = null;
        setX(0);
      }}
    >
      {actions ? (
        <div className="ui-swipe__actions" data-swipe-actions>
          {actions}
        </div>
      ) : null}

      <div className="ui-swipe__content">
        <ListItem {...props} />
      </div>
    </div>
  );
}
