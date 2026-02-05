import * as React from "react";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Checkbox({ className, label, id, disabled, ...props }: CheckboxProps) {
  const fallbackId = React.useId();
  const inputId = id ?? fallbackId;

  return (
    <label className={cx("ui-check", disabled && "ui-check--disabled", className)}>
      <input id={inputId} type="checkbox" className="ui-check__control ui-focus-ring" disabled={disabled} {...props} />
      <span className="ui-check__box" aria-hidden="true" />
      {label ? <span className="ui-check__label text-body-small">{label}</span> : null}
    </label>
  );
}
