import * as React from "react";

import { Section, type SectionProps } from "../../components/shared/Section";
import { SectionHeader, type SectionHeaderProps } from "../../components/shared/SectionHeader";
import { Stack } from "../../primitives/Stack";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SectionPatternProps = Omit<SectionProps, "children"> & {
  header?: SectionHeaderProps;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionPattern({ header, actions, className, children, ...sectionProps }: SectionPatternProps) {
  const showHeader = Boolean(header?.title || header?.kicker || header?.lede || actions);

  return (
    <Section className={cx(className)} {...sectionProps}>
      <Stack gap="compact">
        {showHeader ? (
          <div className={cx("ui-row", Boolean(actions) && "ui-row--between")}>
            {header ? <SectionHeader {...header} /> : null}
            {actions ? <div className="ui-row">{actions}</div> : null}
          </div>
        ) : null}
        {children}
      </Stack>
    </Section>
  );
}
