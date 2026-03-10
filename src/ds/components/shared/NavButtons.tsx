"use client";

import * as React from "react";

import { Button, type ButtonProps } from "../../primitives/Button";
import { Icon } from "./Icon";
import { ChevronLeft, X } from "../../icons";

export type BackButtonProps = Omit<ButtonProps, "variant" | "children"> & {
  label?: string;
  iconOnly?: boolean;
};

export type CloseButtonProps = Omit<ButtonProps, "variant" | "children"> & {
  label?: string;
  iconOnly?: boolean;
};

function defaultBackAction() {
  if (typeof window === "undefined") return;
  window.history.back();
}

/**
 * Back button for navigation headers/app bars.
 * Uses DS Button + curated icons; no hardcoded styling.
 */
export function BackButton({ label = "Back", iconOnly = true, onClick, ...props }: BackButtonProps) {
  return (
    <Button
      variant="icon"
      aria-label={iconOnly ? label : undefined}
      onClick={onClick ?? defaultBackAction}
      {...props}
    >
      <Icon icon={ChevronLeft} aria-hidden />
      {iconOnly ? null : <span className="ui-sr-only">{label}</span>}
    </Button>
  );
}

/**
 * Close button for headers/sheets/dialogs.
 * If no handler is provided, defaults to browser back.
 */
export function CloseButton({ label = "Close", iconOnly = true, onClick, ...props }: CloseButtonProps) {
  return (
    <Button
      variant="icon"
      aria-label={iconOnly ? label : undefined}
      onClick={onClick ?? defaultBackAction}
      {...props}
    >
      <Icon icon={X} aria-hidden />
      {iconOnly ? null : <span className="ui-sr-only">{label}</span>}
    </Button>
  );
}
