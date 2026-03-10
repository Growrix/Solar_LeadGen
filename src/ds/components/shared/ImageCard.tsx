import * as React from "react";

import { Card } from "./Card";
import { ResponsiveImage } from "./ResponsiveImage";
import { Stack } from "../../primitives/Stack";
import { Text } from "../../primitives/Text";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ImageCardProps = {
  imageSrc: string;
  imageAlt: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  aspect?: React.ComponentProps<typeof ResponsiveImage>["aspect"];
  className?: string;
};

export function ImageCard({
  imageSrc,
  imageAlt,
  title,
  description,
  href,
  aspect = "video",
  className,
}: ImageCardProps) {
  const Title = href ? (
    <a className="ui-navlink ui-focus-ring ui-image-card__title" href={href}>
      <span className="text-heading-4">{title}</span>
    </a>
  ) : (
    <div className="ui-image-card__title">
      <span className="text-heading-4">{title}</span>
    </div>
  );

  return (
    <Card className={cx("ui-image-card", className)}>
      <div className="ui-image-card__media">
        <ResponsiveImage src={imageSrc} alt={imageAlt} aspect={aspect} />
      </div>
      <div className="ui-image-card__body">
        <Stack gap="compact">
          {Title}
          {description ? <Text tone="muted">{description}</Text> : null}
        </Stack>
      </div>
    </Card>
  );
}

