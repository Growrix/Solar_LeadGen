"use client";

import * as React from "react";

import { Input, type InputProps } from "../../primitives/Input";
import { Button } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SmartAutofillProps = Omit<InputProps, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  suggestion?: string;
  onApplySuggestion?: (suggestion: string) => void;
  applyLabel?: string;
  className?: string;
  inputClassName?: string;
};

export function SmartAutofill({
  value,
  onValueChange,
  suggestion,
  onApplySuggestion,
  applyLabel = "Apply",
  className,
  inputClassName,
  ...props
}: SmartAutofillProps) {
  return (
    <div className={cx("ui-ai-autofill", className)}>
      <Input {...props} value={value} onChange={(e) => onValueChange(e.target.value)} className={cx("ui-flex-1", inputClassName)} />
      {suggestion ? (
        <Button size="sm" variant="secondary" onClick={() => onApplySuggestion?.(suggestion)}>
          {applyLabel}
        </Button>
      ) : null}
    </div>
  );
}
