import * as React from "react";

import { Stack } from "../../primitives/Stack";

export type SectionHeaderProps = {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
};

export function SectionHeader({ kicker, title, lede, align = "left" }: SectionHeaderProps) {
  return (
    <header className={align === "center" ? "ui-text-center" : undefined}>
      <Stack gap="tight">
        {kicker ? <div className="ui-kicker">{kicker}</div> : null}
        <h2 className="text-heading-2">{title}</h2>
        {lede ? <div className={align === "center" ? "text-body-large ui-center" : "text-body-large"}>{lede}</div> : null}
      </Stack>
    </header>
  );
}

