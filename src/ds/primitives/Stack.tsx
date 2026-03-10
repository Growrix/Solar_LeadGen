import * as React from "react";

export type StackGap = "default" | "compact" | "tight";

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  gap?: StackGap;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Stack({ gap = "default", className, ...props }: StackProps) {
  return (
    <div
      className={cx(
        "ui-stack",
        gap === "compact" && "ui-stack--compact",
        gap === "tight" && "ui-stack--tight",
        className
      )}
      {...props}
    />
  );
}
