import * as React from "react";

import { Card } from "../shared/Card";
import { Spacer } from "../../primitives/Spacer";
import { Text } from "../../primitives/Text";

export type MobileQuickStatTileProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * App-like stat tile for mobile surfaces.
 * Uses DS typography classes + Card (token-driven).
 */
export function MobileQuickStatTile({ label, value, description, className }: MobileQuickStatTileProps) {
  return (
    <Card className={cx("ui-mobile-stat", className)}>
      <div className="text-label">{label}</div>
      <Spacer size={2} />
      <div className="text-heading-3">{value}</div>
      {description ? <Text tone="muted">{description}</Text> : null}
    </Card>
  );
}
