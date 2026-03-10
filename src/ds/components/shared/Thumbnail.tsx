import * as React from "react";

import { ResponsiveImage } from "./ResponsiveImage";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ThumbnailProps = {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  aspect?: "square" | "video";
  className?: string;
};

export function Thumbnail({ src, alt, size = "md", aspect = "square", className }: ThumbnailProps) {
  return (
    <div className={cx("ui-thumb", `ui-thumb--${size}`, className)}>
      <ResponsiveImage src={src} alt={alt} aspect={aspect} />
    </div>
  );
}
