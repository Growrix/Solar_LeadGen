import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Input({ className, ...props }: InputProps) {
  return <input className={cx("ui-input ui-focus-ring", className)} {...props} />;
}
