import * as React from "react";

import { Card } from "./Card";
import { Icon } from "./Icon";
import { Button } from "../../primitives/Button";
import { FileText } from "../../icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type FilePreviewProps = {
  name: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function FilePreview({ name, meta, actions, className }: FilePreviewProps) {
  return (
    <Card className={cx("ui-file", className)}>
      <div className="ui-file__row">
        <div className="ui-file__icon" aria-hidden>
          <Icon icon={FileText} />
        </div>
        <div className="ui-file__main">
          <div className="ui-file__name text-label">{name}</div>
          {meta ? <div className="ui-file__meta text-body-small ui-text-muted">{meta}</div> : null}
        </div>
        <div className="ui-file__actions">{actions ?? <Button size="sm" variant="secondary">View</Button>}</div>
      </div>
    </Card>
  );
}
