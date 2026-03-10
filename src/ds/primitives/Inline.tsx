import * as React from "react";

export type InlineJustify = "start" | "between" | "center";

export type InlineProps = React.HTMLAttributes<HTMLDivElement> & {
  justify?: InlineJustify;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Inline layout primitive (horizontal row) that maps to DS utilities.
 * Token-driven spacing; no hardcoded margins/gaps.
 */
export function Inline({ justify = "start", className, ...props }: InlineProps) {
  return (
    <div
      className={cx(
        "ui-row",
        justify === "between" && "ui-row--between",
        justify === "center" && "ui-row--center",
        className
      )}
      {...props}
    />
  );
}
