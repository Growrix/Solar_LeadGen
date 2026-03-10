import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type WidgetShellProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
};

export function WidgetShell({ title, subtitle, actions, footer, className, children, ...props }: WidgetShellProps) {
  return (
    <div className={cx("ui-widget", className)} {...props}>
      {title || subtitle || actions ? (
        <div className="ui-widget__head">
          <div className="ui-widget__titles">
            {title ? <div className="ui-widget__title text-label">{title}</div> : null}
            {subtitle ? <div className="ui-widget__subtitle text-body-small">{subtitle}</div> : null}
          </div>
          {actions ? <div className="ui-widget__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="ui-widget__body">{children}</div>
      {footer ? <div className="ui-widget__footer">{footer}</div> : null}
    </div>
  );
}
