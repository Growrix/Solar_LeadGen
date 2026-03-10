import * as React from "react";

export type AlertTone = "neutral" | "success" | "warning" | "danger" | "info";

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title?: React.ReactNode;
  icon?: React.ReactNode;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Alert({ tone = "neutral", title, icon, className, children, ...props }: AlertProps) {
  return (
    <div className={cx("ui-alert", `ui-alert--${tone}`, className)} role="alert" {...props}>
      {icon ? <div className="ui-alert__icon">{icon}</div> : null}
      <div className="ui-alert__content">
        {title ? <div className="text-label ui-alert__title">{title}</div> : null}
        {children ? <div className="text-body-small ui-alert__body">{children}</div> : null}
      </div>
    </div>
  );
}
