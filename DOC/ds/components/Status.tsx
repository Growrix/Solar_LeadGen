"use client";

import * as React from "react";

import { Button } from "../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type StatusTone = "active" | "pending" | "disabled";

export function StatusIndicator({ tone = "active", label, className }: { tone?: StatusTone; label: React.ReactNode; className?: string }) {
  return (
    <span className={cx("ui-status", `ui-status--${tone}`, className)}>
      <span className="ui-status__dot" aria-hidden="true" />
      <span className="text-body-small">{label}</span>
    </span>
  );
}

export function StatusButton({ tone, label, onClick }: { tone: StatusTone; label: string; onClick?: () => void }) {
  return (
    <Button size="sm" variant="secondary" className={cx("ui-statusbtn", `ui-statusbtn--${tone}`)} onClick={onClick}>
      <span className="ui-statusbtn__dot" aria-hidden="true" />
      {label}
    </Button>
  );
}
