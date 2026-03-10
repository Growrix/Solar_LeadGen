import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ScreenProps = React.HTMLAttributes<HTMLDivElement> & {
  density?: "default" | "compact";
};

export function Screen({ density = "default", className, ...props }: ScreenProps) {
  return (
    <div
      data-platform="mobile"
      data-density={density === "compact" ? "compact" : undefined}
      className={cx("ui-screen", className)}
      {...props}
    />
  );
}
