import * as React from "react";

import { CenteredShell, type CenteredShellProps } from "../../layouts/CenteredShell";
import { DashboardShell, type DashboardShellProps } from "../../layouts/DashboardShell";
import { DocsShell, type DocsShellProps } from "../../layouts/DocsShell";
import { PublicShell, type PublicShellProps } from "../../layouts/PublicShell";

export type PageTemplateProps =
  | {
      shell: "public";
      shellProps?: Omit<PublicShellProps, "children">;
      children: React.ReactNode;
    }
  | {
      shell: "dashboard";
      shellProps?: Omit<DashboardShellProps, "children">;
      children: React.ReactNode;
    }
  | {
      shell: "docs";
      shellProps: Omit<DocsShellProps, "children">;
      children: React.ReactNode;
    }
  | {
      shell: "centered";
      shellProps?: Omit<CenteredShellProps, "children">;
      children: React.ReactNode;
    };

export function PageTemplate(props: PageTemplateProps) {
  const { children } = props;

  switch (props.shell) {
    case "public":
      return <PublicShell {...props.shellProps}>{children}</PublicShell>;
    case "dashboard":
      return <DashboardShell {...props.shellProps}>{children}</DashboardShell>;
    case "docs":
      return <DocsShell {...props.shellProps}>{children}</DocsShell>;
    case "centered":
      return <CenteredShell {...props.shellProps}>{children}</CenteredShell>;
    default:
      return children as never;
  }
}
