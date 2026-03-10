import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type WebDeviceFrameProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  title: string;
  src: string;
  /** Optional label for screen readers; defaults to `title`. */
  ariaLabel?: string;
};

export function WebDeviceFrame({ title, src, ariaLabel, className, ...props }: WebDeviceFrameProps) {
  return (
    <div className={cx("ui-device-frame", className)} aria-label={ariaLabel ?? title} {...props}>
      <iframe title={title} src={src} className="ui-device-frame__viewport" />
    </div>
  );
}
