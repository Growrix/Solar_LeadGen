"use client";

import * as React from "react";

import { Card } from "./Card";
import { Button } from "../../primitives/Button";
import { Text } from "../../primitives/Text";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type PermissionPromptProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onAllow?: () => void;
  onDeny?: () => void;
  className?: string;
};

export function PermissionPrompt({
  title,
  description,
  primaryLabel = "Allow",
  secondaryLabel = "Not now",
  onAllow,
  onDeny,
  className,
}: PermissionPromptProps) {
  return (
    <Card className={cx("ui-permission", className)}>
      <div className="ui-permission__body">
        <div className="text-heading-4">{title}</div>
        {description ? <Text tone="muted">{description}</Text> : null}
      </div>
      <div className="ui-permission__actions">
        <Button size="sm" variant="secondary" onClick={onDeny}>
          {secondaryLabel}
        </Button>
        <Button size="sm" onClick={onAllow}>
          {primaryLabel}
        </Button>
      </div>
    </Card>
  );
}
