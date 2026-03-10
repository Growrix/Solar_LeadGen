import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type RichTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function RichText({ children, className }: RichTextProps) {
  return <div className={cx("ui-richtext", className)}>{children}</div>;
}
