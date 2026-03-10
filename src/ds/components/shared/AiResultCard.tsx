import * as React from "react";

import { Card, CardContent, CardHeader } from "./Card";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AiResultCardProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function AiResultCard({ title = "AI Result", subtitle, children, actions, className }: AiResultCardProps) {
  return (
    <Card className={cx("ui-ai-result", className)}>
      {(title || subtitle || actions) && (
        <CardHeader className="ui-ai-result__header">
          <div className="ui-ai-result__head">
            {title ? <div className="text-heading-4">{title}</div> : null}
            {subtitle ? <div className="text-body-small ui-text-muted">{subtitle}</div> : null}
          </div>
          {actions ? <div className="ui-ai-result__actions">{actions}</div> : null}
        </CardHeader>
      )}
      <CardContent className="ui-ai-result__content">{children}</CardContent>
    </Card>
  );
}
