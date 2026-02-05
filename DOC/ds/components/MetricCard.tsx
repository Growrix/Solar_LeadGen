import * as React from "react";

import { Card } from "./Card";
import { Text } from "../primitives/Text";

export type MetricCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  delta?: React.ReactNode;
};

export function MetricCard({ label, value, hint, delta }: MetricCardProps) {
  return (
    <Card>
      <div className="ui-metric">
        <div className="ui-row ui-row--between">
          <Text tone="muted">{label}</Text>
          {delta ? <div className="ui-metric__delta text-caption">{delta}</div> : null}
        </div>
        <div className="ui-metric__value text-heading-2">{value}</div>
        {hint ? <Text tone="muted">{hint}</Text> : null}
      </div>
    </Card>
  );
}
