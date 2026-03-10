import * as React from "react";

export type RangeSliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function RangeSlider({ className, label, disabled, ...props }: RangeSliderProps) {
  return (
    <label className={cx("ui-range", disabled && "ui-range--disabled", className)}>
      {label ? <span className="ui-range__label text-body-small">{label}</span> : null}
      <input className="ui-range__control" type="range" disabled={disabled} {...props} />
    </label>
  );
}
