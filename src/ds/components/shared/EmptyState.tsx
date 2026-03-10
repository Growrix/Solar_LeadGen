import * as React from "react";

import { Card } from "./Card";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type EmptyStateProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, actions, className }: EmptyStateProps) {
  return (
    <Card>
      <div className={cx("ui-empty", className)}>
        {icon ? <div className="ui-empty__icon">{icon}</div> : null}
        <div className="ui-empty__title text-heading-4">{title}</div>
        {description ? <div className="ui-empty__desc text-body-small ui-text-muted">{description}</div> : null}
        {actions ? <div className="ui-empty__actions">{actions}</div> : null}
      </div>
    </Card>
  );
}
