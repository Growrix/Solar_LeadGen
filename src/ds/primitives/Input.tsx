import * as React from "react";


export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cx("ui-input ui-focus-ring", className)} {...props} />;
  }
);
Input.displayName = "Input";
