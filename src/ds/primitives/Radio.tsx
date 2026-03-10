import * as React from "react";

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Radio({ className, label, description, id, disabled, ...props }: RadioProps) {
  const fallbackId = React.useId();
  const inputId = id ?? fallbackId;

  return (
    <label className={cx("ui-radio", disabled && "ui-radio--disabled", className)}>
      <input id={inputId} type="radio" className="ui-radio__control ui-focus-ring" disabled={disabled} {...props} />
      <span className="ui-radio__dot" aria-hidden="true" />
      <span className="ui-radio__text">
        {label ? <span className="ui-radio__label text-body-small">{label}</span> : null}
        {description ? <span className="ui-radio__desc text-caption">{description}</span> : null}
      </span>
    </label>
  );
}
