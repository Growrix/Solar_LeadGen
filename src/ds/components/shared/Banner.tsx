import * as React from "react";

import type { AlertTone } from "./Alert";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type BannerProps = {
  tone?: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function Banner({ tone = "info", title, children, actions, className }: BannerProps) {
  return (
    <div className={cx("ui-banner", `ui-banner--${tone}`, className)} role={tone === "danger" ? "alert" : "status"}>
      <div className="ui-banner__body">
        {title ? <div className="ui-banner__title text-body-small">{title}</div> : null}
        {children ? <div className="ui-banner__content text-caption">{children}</div> : null}
      </div>
      {actions ? <div className="ui-banner__actions">{actions}</div> : null}
    </div>
  );
}
