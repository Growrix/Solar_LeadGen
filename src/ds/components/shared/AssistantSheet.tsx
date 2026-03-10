"use client";

import * as React from "react";

import { BottomSheet } from "./BottomSheet";
import { Button } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AssistantSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AssistantSheet({ open, onClose, title = "Assistant", children, footer, className }: AssistantSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} className={cx("ui-ai-sheet", className)}>
      <div className="ui-ai-sheet__body">{children}</div>
      <div className="ui-ai-sheet__footer">
        {footer ?? (
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}
