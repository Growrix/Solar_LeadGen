import * as React from "react";

import { DashboardShell, type DashboardShellProps } from "../../../layouts/DashboardShell";

import { Screen } from "./Screen";

export type MobileAppShellProps = Omit<DashboardShellProps, "containerWidth"> & {
  /** Defaults to full-width for app-like mobile surfaces. */
  containerWidth?: DashboardShellProps["containerWidth"];
  /** Defaults to compact for app-like density. */
  density?: React.ComponentProps<typeof Screen>["density"];
};

export function MobileAppShell({
  density = "compact",
  containerWidth = "full",
  topbar,
  bottomNav,
  leftSidebar,
  rightSidebar,
  children,
}: MobileAppShellProps) {
  return (
    <Screen density={density}>
      <DashboardShell
        containerWidth={containerWidth}
        topbar={topbar}
        bottomNav={bottomNav}
        leftSidebar={leftSidebar}
        rightSidebar={rightSidebar}
      >
        {children}
      </DashboardShell>
    </Screen>
  );
}
