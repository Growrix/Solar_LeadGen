import * as React from "react";

import { MetricCard, type MetricCardProps } from "../components/shared/MetricCard";
import { WidgetShell, type WidgetShellProps } from "./WidgetShell";

export type MetricWidgetProps = {
  metric: MetricCardProps;
  shell?: Omit<WidgetShellProps, "children">;
};

/**
 * Adapter: migrates an existing widget-like component (MetricCard)
 * into the widgets contract without breaking existing consumers.
 */
export function MetricWidget({ metric, shell }: MetricWidgetProps) {
  return (
    <WidgetShell {...shell}>
      <MetricCard {...metric} />
    </WidgetShell>
  );
}
