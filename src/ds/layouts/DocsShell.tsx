import * as React from "react";

import { Container } from "../primitives/Container";

export type DocsNavItem = {
  label: string;
  href: string;
};

export type DocsShellProps = {
  title?: React.ReactNode;
  nav: DocsNavItem[];
  children: React.ReactNode;
};

export function DocsShell({ title = "Docs", nav, children }: DocsShellProps) {
  return (
    <div className="ui-page">
      <div className="ui-band ui-band--surface ui-sticky-top">
        <Container width="wide">
          <div className="ui-header-pad ui-row ui-row--between">
            <strong>{title}</strong>
            <a className="ui-navlink ui-focus-ring" href="#main">
              Jump to content
            </a>
          </div>
        </Container>
      </div>

      <main className="ui-page-main" id="main">
        <Container width="wide">
          <div className="ui-docs-shell">
            <aside className="ui-docs-nav" aria-label="Docs navigation">
              <nav>
                <ul className="ui-docs-navlist">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <a className="ui-navlink ui-focus-ring" href={item.href}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="ui-docs-content">{children}</div>
          </div>
        </Container>
      </main>
    </div>
  );
}
