"use client";

import * as React from "react";

import { Button } from "../primitives/Button";
import { Checkbox } from "../primitives/Checkbox";
import { Stack } from "../primitives/Stack";
import { Text } from "../primitives/Text";
import { Popover } from "./Popover";

export type MultiSelectOption = {
  id: string;
  label: string;
  value: string;
};

export type MultiSelectProps = {
  label: string;
  options: MultiSelectOption[];
  values: string[];
  onValuesChange: (values: string[]) => void;
};

export function MultiSelect({ label, options, values, onValuesChange }: MultiSelectProps) {
  const toggle = (v: string) => {
    onValuesChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  };

  return (
    <Popover
      trigger={
        <Button variant="secondary" size="sm">
          {label} ({values.length})
        </Button>
      }
    >
      <Stack gap="compact">
        <div className="text-heading-4">{label}</div>
        <Text tone="muted">Select one or more.</Text>
        <div className="ui-stack ui-stack--tight">
          {options.map((o) => (
            <Checkbox key={o.id} label={o.label} checked={values.includes(o.value)} onChange={() => toggle(o.value)} />
          ))}
        </div>
      </Stack>
    </Popover>
  );
}
