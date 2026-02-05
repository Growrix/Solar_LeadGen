import * as React from "react";

import { Card } from "./Card";
import { Divider } from "../primitives/Divider";
import { Stack } from "../primitives/Stack";

export type FilterPanelProps = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function FilterPanel({ title = "Filters", actions, children, className }: FilterPanelProps) {
  return (
    <Card className={className}>
      <Stack gap="compact">
        <div className="ui-row ui-row--between">
          <div className="text-heading-4">{title}</div>
          {actions}
        </div>
        <Divider />
        {children}
      </Stack>
    </Card>
  );
}
