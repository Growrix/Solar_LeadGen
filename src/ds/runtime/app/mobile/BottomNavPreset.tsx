import * as React from "react";

import { BottomNav, type BottomNavProps } from "../../../components/shared/BottomNav";

/**
 * Mobile runtime preset: uses the shared DS BottomNav with a stable platform hint.
 * This keeps navigation intent consistent while runtime owns the wrapper.
 */
export function MobileBottomNavPreset(props: BottomNavProps) {
  return <BottomNav data-platform="mobile" {...props} />;
}
