"use client";

import * as React from "react";

import { Button } from "../primitives/Button";
import { Text } from "../primitives/Text";

export type CookieConsentBannerProps = {
  storageKey?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

export function CookieConsentBanner({ storageKey = "ds-cookie-consent", title = "Cookies", description = "We use cookies to improve your experience." }: CookieConsentBannerProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(storageKey);
      setVisible(v !== "accepted");
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  const accept = () => {
    try {
      window.localStorage.setItem(storageKey, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div className="ui-cookie" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="ui-cookie__inner">
        <div className="ui-cookie__copy">
          <div className="text-body-small">{title}</div>
          <Text tone="muted">{description}</Text>
        </div>
        <div className="ui-cookie__actions">
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
