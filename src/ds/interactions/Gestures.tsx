"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SwipeDirection = "left" | "right" | "up" | "down";

export type GestureDetectorProps = {
  children: React.ReactNode;
  className?: string;

  swipeThresholdPx?: number;
  swipeMaxOffAxisPx?: number;

  onSwipe?: (dir: SwipeDirection) => void;
  onDragStart?: () => void;
  onDragMove?: (info: { dx: number; dy: number }) => void;
  onDragEnd?: (info: { dx: number; dy: number }) => void;
};

export function GestureDetector({
  children,
  className,
  swipeThresholdPx = 48,
  swipeMaxOffAxisPx = 56,
  onSwipe,
  onDragStart,
  onDragMove,
  onDragEnd,
}: GestureDetectorProps) {
  const start = React.useRef<{ x: number; y: number } | null>(null);
  const active = React.useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    active.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
    onDragStart?.();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current || !start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    onDragMove?.({ dx, dy });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current || !start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    onDragEnd?.({ dx, dy });

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (onSwipe) {
      if (absX >= swipeThresholdPx && absY <= swipeMaxOffAxisPx) {
        onSwipe(dx > 0 ? "right" : "left");
      } else if (absY >= swipeThresholdPx && absX <= swipeMaxOffAxisPx) {
        onSwipe(dy > 0 ? "down" : "up");
      }
    }

    active.current = false;
    start.current = null;
  };

  const onPointerCancel = () => {
    active.current = false;
    start.current = null;
  };

  return (
    <div
      className={cx("ui-gesture", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {children}
    </div>
  );
}

export type SwipeContainerProps = Omit<GestureDetectorProps, "onDragStart" | "onDragMove" | "onDragEnd">;

export function SwipeContainer(props: SwipeContainerProps) {
  return <GestureDetector {...props} />;
}

export type DragContainerProps = Omit<GestureDetectorProps, "onSwipe">;

export function DragContainer(props: DragContainerProps) {
  return <GestureDetector {...props} />;
}
