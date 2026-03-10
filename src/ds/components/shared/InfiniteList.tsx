"use client";

import * as React from "react";

import { Spinner } from "../../primitives/Spinner";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type InfiniteListProps = {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  className?: string;
  rootMargin?: string;
};

export function InfiniteList({ children, hasMore, isLoading, onLoadMore, className, rootMargin = "200px" }: InfiniteListProps) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (!hasMore) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isLoading) return;
        onLoadMore();
      },
      { root: null, rootMargin }
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, isLoading, onLoadMore, rootMargin]);

  return (
    <div className={cx("ui-infinite", className)}>
      {children}
      {hasMore ? (
        <div className="ui-infinite__sentinel" ref={sentinelRef} aria-hidden>
          {isLoading ? <Spinner size="sm" /> : null}
        </div>
      ) : null}
    </div>
  );
}
