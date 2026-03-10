import * as React from "react";

export type VisuallyHiddenProps = React.HTMLAttributes<HTMLSpanElement>;

export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return <span className={className ? `ui-visually-hidden ${className}` : "ui-visually-hidden"} {...props} />;
}
