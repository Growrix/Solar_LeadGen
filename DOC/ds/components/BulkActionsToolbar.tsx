import * as React from "react";

import { Button } from "../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type BulkAction = {
  id: string;
  label: string;
  onClick: () => void;
  tone?: "primary" | "secondary" | "ghost" | "text";
};

export type BulkActionsToolbarProps = {
  selectedCount: number;
  actions: BulkAction[];
  onClear?: () => void;
  className?: string;
};

export function BulkActionsToolbar({ selectedCount, actions, onClear, className }: BulkActionsToolbarProps) {
  return (
    <div className={cx("ui-bulk", className)} role="region" aria-label="Bulk actions">
      <div className="ui-bulk__left">
        <span className="text-body-small">{selectedCount} selected</span>
        {onClear ? (
          <Button size="sm" variant="text" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
      <div className="ui-bulk__right">
        {actions.map((a) => (
          <Button key={a.id} size="sm" variant={a.tone ?? "secondary"} onClick={a.onClick}>
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
