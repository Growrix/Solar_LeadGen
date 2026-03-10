import * as React from "react";

import { Button, type ButtonProps } from "../../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type FloatingActionProps = Omit<ButtonProps, "variant" | "className"> & {
  className?: string;
};

export function FloatingAction({ className, ...props }: FloatingActionProps) {
  return <Button variant="fab" className={cx("ui-fab", className)} {...props} />;
}
