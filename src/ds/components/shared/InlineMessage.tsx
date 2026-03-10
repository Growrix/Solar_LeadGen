import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type InlineMessageTone = "neutral" | "info" | "success" | "warning" | "danger";

export type InlineMessageProps = {
  tone?: InlineMessageTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function InlineMessage({ tone = "neutral", title, children, className }: InlineMessageProps) {
  return (
    <div className={cx("ui-inline", `ui-inline--${tone}`, className)} role={tone === "danger" ? "alert" : "status"}>
      {title ? <div className="text-label ui-inline__title">{title}</div> : null}
      {children ? <div className="text-body-small ui-inline__body">{children}</div> : null}
    </div>
  );
}
