import * as React from "react";

import type { LucideIcon } from "lucide-react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export type IconProps = {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  "aria-hidden"?: true;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function sizePx(size: IconSize) {
  if (size === "xs") return 14;
  if (size === "sm") return 16;
  if (size === "md") return 20;
  if (size === "lg") return 24;
  return 32;
}

export function Icon({ icon: Lucide, size = "md", className, ...props }: IconProps) {
  const px = sizePx(size);
  return <Lucide width={px} height={px} className={cx("ui-icon", className)} {...props} />;
}
