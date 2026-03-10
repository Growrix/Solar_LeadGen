"use client";

import * as React from "react";

import { ListItem, type ListItemProps } from "./List";
import { Button } from "../../primitives/Button";
import { Icon } from "./Icon";
import { ChevronDown } from "../../icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ExpandableListItemProps = Omit<ListItemProps, "children" | "trailing"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ExpandableListItem({
  leading,
  title,
  description,
  children,
  className,
  defaultOpen,
  open,
  onOpenChange,
}: ExpandableListItemProps) {
  const isControlled = typeof open === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(Boolean(defaultOpen));
  const isOpen = isControlled ? Boolean(open) : uncontrolledOpen;

  return (
    <div className={cx("ui-expandable-item", className)}>
      <ListItem
        leading={leading}
        trailing={
          <Button
            variant="icon"
            aria-label={isOpen ? "Collapse" : "Expand"}
            className={cx("ui-expandable-item__toggle", isOpen && "ui-expandable-item__toggle--open")}
            onClick={() => {
              const next = !isOpen;
              if (!isControlled) setUncontrolledOpen(next);
              onOpenChange?.(next);
            }}
          >
            <Icon icon={ChevronDown} aria-hidden />
          </Button>
        }
      >
        <div className="ui-expandable-item__title">{title}</div>
        {description ? <div className="ui-expandable-item__desc">{description}</div> : null}
      </ListItem>

      {isOpen ? <div className="ui-expandable-item__content">{children}</div> : null}
    </div>
  );
}
