import * as React from "react";

import { Card } from "./Card";
import { Text } from "../../primitives/Text";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type PushNotificationPreviewProps = {
  title: React.ReactNode;
  body: React.ReactNode;
  appName?: React.ReactNode;
  time?: React.ReactNode;
  className?: string;
};

export function PushNotificationPreview({ title, body, appName = "Blueprint", time = "now", className }: PushNotificationPreviewProps) {
  return (
    <Card className={cx("ui-push", className)}>
      <div className="ui-push__top">
        <Text tone="muted">{appName}</Text>
        <Text tone="muted">{time}</Text>
      </div>
      <div className="ui-push__title text-body-small">{title}</div>
      <div className="ui-push__body text-body-small ui-text-muted">{body}</div>
    </Card>
  );
}
