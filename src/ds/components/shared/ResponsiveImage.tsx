import * as React from "react";

export type ResponsiveImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  aspect?: "square" | "video" | "auto";
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function ResponsiveImage({ className, aspect = "auto", ...props }: ResponsiveImageProps) {
  return (
    <span className={cx("ui-img", aspect !== "auto" && `ui-img--${aspect}`, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ui-img__el" loading={props.loading ?? "lazy"} alt={props.alt ?? ""} {...props} />
    </span>
  );
}
