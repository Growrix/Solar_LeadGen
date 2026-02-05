import * as React from "react";

import { Input } from "../primitives/Input";

export type DatePickerProps = Omit<React.ComponentProps<typeof Input>, "type">;
export function DatePicker(props: DatePickerProps) {
  return <Input type="date" {...props} />;
}

export type TimePickerProps = Omit<React.ComponentProps<typeof Input>, "type">;
export function TimePicker(props: TimePickerProps) {
  return <Input type="time" {...props} />;
}

export type DateRangePickerProps = {
  startProps?: DatePickerProps;
  endProps?: DatePickerProps;
  className?: string;
};

export function DateRangePicker({ startProps, endProps, className }: DateRangePickerProps) {
  return (
    <div className={className ?? "ui-row"}>
      <DatePicker {...startProps} />
      <DatePicker {...endProps} />
    </div>
  );
}
