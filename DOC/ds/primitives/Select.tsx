import * as React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className={cx("ui-select", className)}>
      <select className="ui-select__control ui-focus-ring" {...props}>
        {children}
      </select>
      <span className="ui-select__chevron" aria-hidden="true" />
    </div>
  );
}
