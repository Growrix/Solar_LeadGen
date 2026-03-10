import * as React from "react";

export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <span className={cx("ui-spinner", size === "sm" && "ui-spinner--sm", size === "md" && "ui-spinner--md", size === "lg" && "ui-spinner--lg", className)} role="status" aria-label={label}>
      <svg className="ui-spinner__svg" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="ui-spinner__track" cx="12" cy="12" r="9" />
        <path className="ui-spinner__head" d="M12 3a9 9 0 0 1 9 9" />
      </svg>
    </span>
  );
}
