import * as React from "react";

export type TextTone = "default" | "muted";

export type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  tone?: TextTone;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Text({ tone = "default", className, ...props }: TextProps) {
  return <p className={cx("text-body", tone === "muted" && "ui-text-muted", className)} {...props} />;
}
