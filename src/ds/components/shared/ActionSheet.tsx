import * as React from "react";

import { BottomSheet } from "./BottomSheet";
import { Button } from "../../primitives/Button";
import { Divider } from "../../primitives/Divider";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ActionSheetAction = {
  id: string;
  label: React.ReactNode;
  tone?: "default" | "danger";
  onSelect?: () => void;
};

export type ActionSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions: ActionSheetAction[];
  cancelLabel?: React.ReactNode;
  className?: string;
};

export function ActionSheet({ open, onClose, title, description, actions, cancelLabel = "Cancel", className }: ActionSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} description={description} className={cx("ui-actionsheet", className)}>
      <div className="ui-actionsheet__actions">
        {actions.map((a) => (
          <Button
            key={a.id}
            variant={a.tone === "danger" ? "danger" : "secondary"}
            className="ui-actionsheet__action"
            onClick={() => {
              a.onSelect?.();
              onClose();
            }}
          >
            {a.label}
          </Button>
        ))}
      </div>
      <Divider />
      <Button variant="ghost" onClick={onClose}>
        {cancelLabel}
      </Button>
    </BottomSheet>
  );
}
