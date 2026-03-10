import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type BackgroundFXProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function BackgroundFX({ children, className, ...props }: BackgroundFXProps) {
  return (
    <div className={cx("ui-bgfx", className)} {...props}>
      {children}
    </div>
  );
}
