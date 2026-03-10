"use client";

import * as React from "react";

import { Button } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const safePageCount = Math.max(1, Math.floor(pageCount));
  const safePage = clamp(Math.floor(page), 1, safePageCount);

  const pages = React.useMemo(() => {
    const out: number[] = [];
    const start = clamp(safePage - 2, 1, safePageCount);
    const end = clamp(safePage + 2, 1, safePageCount);
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }, [safePage, safePageCount]);

  return (
    <nav className={cx("ui-pagination", className)} aria-label="Pagination">
      <div className="ui-row">
        <Button size="sm" variant="secondary" onClick={() => onPageChange(clamp(safePage - 1, 1, safePageCount))} disabled={safePage <= 1}>
          Prev
        </Button>

        <div className="ui-pagination__pages" role="list">
          {pages.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === safePage ? "primary" : "secondary"}
              onClick={() => onPageChange(p)}
              aria-current={p === safePage ? "page" : undefined}
            >
              {p}
            </Button>
          ))}
        </div>

        <Button size="sm" variant="secondary" onClick={() => onPageChange(clamp(safePage + 1, 1, safePageCount))} disabled={safePage >= safePageCount}>
          Next
        </Button>
      </div>
    </nav>
  );
}

