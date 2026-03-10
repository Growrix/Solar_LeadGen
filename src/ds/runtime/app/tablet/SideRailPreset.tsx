import * as React from "react";

import { SideRail, type SideRailProps } from "./SideRail";

/** Tablet runtime preset: stable wrapper around SideRail. */
export function TabletSideRailPreset(props: SideRailProps) {
  return <SideRail data-platform="tablet" {...props} />;
}
