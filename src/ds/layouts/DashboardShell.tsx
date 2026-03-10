import * as React from "react";

import { Container } from "../primitives/Container";

import type { ContainerWidth } from "../primitives/Container";

export type DashboardShellProps = {
  topbar?: React.ReactNode;
  /** @deprecated Use leftSidebar. Kept for backward compatibility. */
  sidebar?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  bottomNav?: React.ReactNode;
  containerWidth?: ContainerWidth;
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
  children: React.ReactNode;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function DashboardShell({
  topbar,
  sidebar,
  leftSidebar,
  rightSidebar,
  bottomNav,
  containerWidth = "wide",
  leftCollapsed,
  rightCollapsed,
  children,
}: DashboardShellProps) {
  const left = leftSidebar ?? sidebar;
  const hasLeft = Boolean(left);
  const hasRight = Boolean(rightSidebar);
  const hasLegacySidebar = Boolean(sidebar) && !leftSidebar && !hasRight;

  return (
    <div className="ui-page ui-page--dashboard">
      {topbar ? <div className="ui-band ui-band--surface ui-sticky-top">{topbar}</div> : null}
      <main className="ui-page-main" id="main">
        <Container width={containerWidth}>
          <div
            className={cx(
              "ui-shell-grid",
              hasLeft && !hasRight && "ui-shell-grid--left",
              hasRight && !hasLeft && "ui-shell-grid--right",
              hasLeft && hasRight && "ui-shell-grid--both",
              leftCollapsed && "ui-shell-grid--left-collapsed",
              rightCollapsed && "ui-shell-grid--right-collapsed",
              // Back-compat for the previous single sidebar style.
              hasLegacySidebar && "ui-shell-grid--sidebar"
            )}
          >
            {hasLeft ? <aside className="ui-shell-aside ui-shell-aside--left">{left}</aside> : null}

            <div className={cx("ui-shell-content", bottomNav ? "ui-shell-content--pad-bottom-nav" : null)}>{children}</div>

            {hasRight ? <aside className="ui-shell-aside ui-shell-aside--right">{rightSidebar}</aside> : null}
          </div>
        </Container>
      </main>

      {bottomNav ? <div className="ui-only-mobile">{bottomNav}</div> : null}
    </div>
  );
}
