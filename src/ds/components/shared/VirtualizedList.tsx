"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type VirtualizedListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string;
  overscan?: number;
  className?: string;
  ariaLabel?: string;
};

function readCssPx(el: HTMLElement, varName: string): number {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function VirtualizedList<T>({ items, renderItem, getItemKey, overscan = 4, className, ariaLabel }: VirtualizedListProps<T>) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportH, setViewportH] = React.useState(0);
  const [rowH, setRowH] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const update = () => {
      setViewportH(el.clientHeight);
      if (rowH == null) {
        const touch = readCssPx(el, "--ds-size-touch-target");
        const pad = readCssPx(el, "--ds-space-3");
        const next = Math.max(1, touch + pad * 2);
        setRowH(next);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rowH]);

  const effectiveRowH = rowH ?? 1;
  const totalH = items.length * effectiveRowH;

  const startIndex = Math.max(0, Math.floor(scrollTop / effectiveRowH) - overscan);
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + viewportH) / effectiveRowH) + overscan);

  const visible = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={rootRef}
      className={cx("ui-virtual-list", className)}
      role="list"
      aria-label={ariaLabel}
      onScroll={(e) => setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
    >
      <div className="ui-virtual-list__inner" style={{ height: totalH }}>
        {visible.map((item, offset) => {
          const index = startIndex + offset;
          const key = getItemKey?.(item, index) ?? String(index);

          return (
            <div
              key={key}
              role="listitem"
              className="ui-virtual-list__item ui-list__item"
              style={{ transform: `translateY(${index * effectiveRowH}px)` }}
            >
              <div className="ui-list__content">{renderItem(item, index)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
