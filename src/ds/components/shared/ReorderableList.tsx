"use client";

import * as React from "react";

import { List } from "./List";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ReorderableListProps<T> = {
  items: T[];
  getItemId: (item: T) => string;
  renderItem: (item: T, info: { index: number; dragHandleProps: React.HTMLAttributes<HTMLElement> }) => React.ReactNode;
  onReorder?: (items: T[]) => void;
  className?: string;
  ariaLabel?: string;
};

export function ReorderableList<T>({ items, getItemId, renderItem, onReorder, className, ariaLabel }: ReorderableListProps<T>) {
  const [order, setOrder] = React.useState(() => items.map(getItemId));
  const draggingIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setOrder(items.map(getItemId));
  }, [items, getItemId]);

  const byId = React.useMemo(() => {
    const map = new Map<string, T>();
    for (const item of items) map.set(getItemId(item), item);
    return map;
  }, [items, getItemId]);

  const orderedItems = React.useMemo(() => {
    const next: T[] = [];
    for (const id of order) {
      const item = byId.get(id);
      if (item) next.push(item);
    }
    return next;
  }, [byId, order]);

  const move = React.useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      const fromIndex = order.indexOf(fromId);
      const toIndex = order.indexOf(toId);
      if (fromIndex < 0 || toIndex < 0) return;

      const next = [...order];
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromId);
      setOrder(next);

      const nextItems = next.map((id) => byId.get(id)).filter(Boolean) as T[];
      onReorder?.(nextItems);
    },
    [byId, onReorder, order]
  );

  return (
    <List className={cx("ui-reorder", className)} ariaLabel={ariaLabel}>
      {orderedItems.map((item, index) => {
        const id = getItemId(item);
        const dragHandleProps: React.HTMLAttributes<HTMLElement> = {
          draggable: true,
          onDragStart: (e) => {
            draggingIdRef.current = id;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", id);
          },
          onDragEnd: () => {
            draggingIdRef.current = null;
          },
          onKeyDown: (e) => {
            if (e.key === "ArrowUp" && index > 0) {
              e.preventDefault();
              move(id, order[index - 1] as string);
            }
            if (e.key === "ArrowDown" && index < order.length - 1) {
              e.preventDefault();
              move(id, order[index + 1] as string);
            }
          },
        };

        return (
          <div
            key={id}
            className="ui-reorder__row"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = draggingIdRef.current ?? e.dataTransfer.getData("text/plain");
              if (!from) return;
              move(from, id);
            }}
          >
            {renderItem(item, { index, dragHandleProps })}
          </div>
        );
      })}
    </List>
  );
}
