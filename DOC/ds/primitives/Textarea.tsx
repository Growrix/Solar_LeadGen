import * as React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cx("ui-textarea ui-focus-ring", className)} {...props} />;
}
