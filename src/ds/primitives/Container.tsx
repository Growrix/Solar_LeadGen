import * as React from "react";

export type ContainerWidth = "default" | "narrow" | "wide" | "full";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: ContainerWidth;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Container({ width = "default", className, ...props }: ContainerProps) {
  return (
    <div
      className={cx(
        "ui-container",
        width === "narrow" && "ui-container--narrow",
        width === "wide" && "ui-container--wide",
        width === "full" && "ui-container--full",
        className
      )}
      {...props}
    />
  );
}
