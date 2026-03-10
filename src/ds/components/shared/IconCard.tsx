import * as React from "react";

import type { LucideIcon } from "lucide-react";

import { Card } from "./Card";
import { Icon } from "./Icon";
import { Stack } from "../../primitives/Stack";
import { Text } from "../../primitives/Text";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type IconCardProps = {
  icon: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  className?: string;
};

export function IconCard({ icon, title, description, href, className }: IconCardProps) {
  const body = (
    <Stack gap="compact">
      <div className="ui-icon-card__row">
        <div className="ui-icon-card__icon" aria-hidden>
          <Icon icon={icon} />
        </div>
        <div className="ui-icon-card__content">
          <div className="text-heading-4">{title}</div>
          {description ? <Text tone="muted">{description}</Text> : null}
        </div>
      </div>
    </Stack>
  );

  return (
    <Card className={cx("ui-icon-card", className)}>
      {href ? (
        <a className="ui-icon-card__link ui-focus-ring" href={href}>
          {body}
        </a>
      ) : (
        body
      )}
    </Card>
  );
}

