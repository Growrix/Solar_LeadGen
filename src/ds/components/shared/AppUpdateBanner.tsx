import * as React from "react";

import { Banner } from "./Banner";
import { Button } from "../../primitives/Button";

export type AppUpdateBannerProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
};

export function AppUpdateBanner({
  title = "Update available",
  description = "A newer version is available.",
  actionLabel = "Update",
  onAction,
  onDismiss,
}: AppUpdateBannerProps) {
  return (
    <Banner
      tone="info"
      title={title}
      actions={
        <div className="ui-row">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
          <Button size="sm" variant="secondary" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      }
    >
      {description}
    </Banner>
  );
}
