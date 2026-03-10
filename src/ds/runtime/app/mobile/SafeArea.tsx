import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SafeAreaEdges = "top" | "bottom" | "left" | "right";

export type SafeAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Which safe-area edges to apply padding for. Defaults to all edges. */
  edges?: SafeAreaEdges[];
};

/**
 * Mobile runtime utility: applies safe-area padding using DS-owned CSS.
 * No inline styles; edges are controlled via data attributes.
 */
export function SafeArea({ edges = ["top", "bottom", "left", "right"], className, ...props }: SafeAreaProps) {
  const set = new Set(edges);

  return (
    <div
      className={cx("ui-safe-area", className)}
      data-safe-top={set.has("top") ? "" : undefined}
      data-safe-bottom={set.has("bottom") ? "" : undefined}
      data-safe-left={set.has("left") ? "" : undefined}
      data-safe-right={set.has("right") ? "" : undefined}
      {...props}
    />
  );
}
