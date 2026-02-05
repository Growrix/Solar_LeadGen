"use client";

import * as React from "react";

import { Badge } from "./Badge";
import { Button } from "../primitives/Button";
import { Input } from "../primitives/Input";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type TagInputProps = {
  value: string[];
  onValueChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

export function TagInput({ value, onValueChange, placeholder = "Add a tag…", label = "Tag input", className }: TagInputProps) {
  const [text, setText] = React.useState("");

  const add = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onValueChange([...value, t]);
  };

  const remove = (tag: string) => {
    onValueChange(value.filter((t) => t !== tag));
  };

  return (
    <div className={cx("ui-tags", className)} aria-label={label}>
      <div className="ui-tags__row">
        {value.map((t) => (
          <span key={t} className="ui-tags__tag">
            <Badge tone="neutral">{t}</Badge>
            <Button size="sm" variant="text" className="ui-tags__x" onClick={() => remove(t)} aria-label={`Remove ${t}`}>
              ×
            </Button>
          </span>
        ))}
      </div>
      <Input
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(text);
            setText("");
          }
          if (e.key === "Backspace" && !text && value.length > 0) {
            remove(value[value.length - 1]!);
          }
        }}
      />
    </div>
  );
}
