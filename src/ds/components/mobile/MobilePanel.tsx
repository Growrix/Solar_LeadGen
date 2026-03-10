import * as React from "react";

import { Card } from "../shared/Card";
import { Stack } from "../../primitives/Stack";
import { Text } from "../../primitives/Text";

export type MobilePanelProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Mobile-oriented panel (app-like): token-driven Card + structured header.
 * No hardcoded values; all sizing comes from DS tokens and existing classes.
 */
export function MobilePanel({ title, description, actions, children, className }: MobilePanelProps) {
  return (
    <Card className={cx("ui-mobile-panel", className)}>
      <Stack gap="compact">
        {title || description || actions ? (
          <div className="ui-mobile-panel__header">
            <div className="ui-mobile-panel__title-row">
              {title ? <div className="text-heading-4">{title}</div> : null}
              {actions ? <div className="ui-mobile-panel__actions ui-row">{actions}</div> : null}
            </div>
            {description ? <Text tone="muted">{description}</Text> : null}
          </div>
        ) : null}
        <div className="ui-mobile-panel__body">
          <Stack gap="compact">{children}</Stack>
        </div>
      </Stack>
    </Card>
  );
}
