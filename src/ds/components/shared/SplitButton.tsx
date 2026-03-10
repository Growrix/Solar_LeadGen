"use client";

import * as React from "react";

import { Button, type ButtonProps } from "../../primitives/Button";
import { DropdownMenu } from "./DropdownMenu";
import { DropdownMenuButton } from "./DropdownMenu";
import { Stack } from "../../primitives/Stack";
import { Icon } from "./Icon";
import { ChevronDown } from "../../icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SplitButtonItem = {
  id: string;
  label: React.ReactNode;
  onSelect?: () => void;
};

export type SplitButtonProps = {
  primaryLabel: React.ReactNode;
  onPrimaryClick?: React.MouseEventHandler<HTMLButtonElement>;
  items: SplitButtonItem[];
  size?: ButtonProps["size"];
  variant?: Exclude<ButtonProps["variant"], "icon" | "fab">;
  className?: string;
  disabled?: boolean;
};

export function SplitButton({ primaryLabel, onPrimaryClick, items, size = "md", variant = "primary", className, disabled }: SplitButtonProps) {
  return (
    <div className={cx("ui-split", className)}>
      <Button size={size} variant={variant} className="ui-split__main" disabled={disabled} onClick={onPrimaryClick}>
        {primaryLabel}
      </Button>
      <DropdownMenu
        trigger={
          <Button size={size} variant="icon" className="ui-split__menu" aria-label="More actions" disabled={disabled}>
            <Icon icon={ChevronDown} aria-hidden />
          </Button>
        }
      >
        <Stack gap="compact">
          {items.map((it) => (
            <DropdownMenuButton key={it.id} onClick={() => it.onSelect?.()}>
              {it.label}
            </DropdownMenuButton>
          ))}
        </Stack>
      </DropdownMenu>
    </div>
  );
}
