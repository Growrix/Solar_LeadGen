"use client";

import * as React from "react";

import { Textarea, type TextareaProps } from "../../primitives/Textarea";
import { Button } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AiPromptInputProps = Omit<TextareaProps, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  submitLabel?: string;
  disabled?: boolean;
  className?: string;
  textareaClassName?: string;
};

export function AiPromptInput({
  value,
  onValueChange,
  onSubmit,
  submitLabel = "Send",
  disabled,
  className,
  textareaClassName,
  ...props
}: AiPromptInputProps) {
  return (
    <div className={cx("ui-ai-prompt", className)}>
      <Textarea
        {...props}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        className={cx("ui-ai-prompt__input", textareaClassName)}
      />
      <div className="ui-ai-prompt__actions">
        <Button size="sm" disabled={disabled} onClick={() => onSubmit?.(value)}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
