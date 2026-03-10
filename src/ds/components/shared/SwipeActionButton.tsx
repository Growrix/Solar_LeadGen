import * as React from "react";

import { Button, type ButtonProps } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SwipeActionButtonProps = Omit<ButtonProps, "size"> & {
  size?: ButtonProps["size"];
};

export function SwipeActionButton({ className, variant = "secondary", size = "sm", ...props }: SwipeActionButtonProps) {
  return <Button {...props} size={size} variant={variant} className={cx("ui-swipe__action", className)} />;
}
