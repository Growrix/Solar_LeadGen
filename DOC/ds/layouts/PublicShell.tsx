import * as React from "react";

import { Container } from "../primitives/Container";

export type PublicShellProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function PublicShell({ header, footer, children }: PublicShellProps) {
  return (
    <div className="ui-page">
      {header ? <div className="ui-band ui-band--surface ui-sticky-top">{header}</div> : null}
      <main className="ui-page-main">{children}</main>
      {footer ? <div className="ui-band">{footer}</div> : null}
    </div>
  );
}

export function PublicHeaderBar({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <div className="ui-header-pad">{children}</div>
    </Container>
  );
}
