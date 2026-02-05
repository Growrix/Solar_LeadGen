import * as React from "react";
import { render } from "@testing-library/react";

import { CenteredShell, DashboardShell, DocsShell, PublicHeaderBar, PublicShell } from "@/ds";

describe("DS layouts (snapshots)", () => {
  test("PublicShell", () => {
    const { container } = render(
      <PublicShell header={<PublicHeaderBar>Header</PublicHeaderBar>} footer={<div>Footer</div>}>
        <div>Body</div>
      </PublicShell>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test("CenteredShell", () => {
    const { container } = render(
      <CenteredShell title="Sign in">
        <div>Form</div>
      </CenteredShell>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test("DashboardShell (with sidebar)", () => {
    const { container } = render(
      <DashboardShell topbar={<div>Top</div>} sidebar={<nav>Nav</nav>}>
        <div>Content</div>
      </DashboardShell>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test("DocsShell", () => {
    const { container } = render(
      <DocsShell
        title="Docs"
        nav={[
          { label: "Intro", href: "#intro" },
          { label: "Components", href: "#components" },
        ]}
      >
        <div id="intro">Intro</div>
      </DocsShell>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
