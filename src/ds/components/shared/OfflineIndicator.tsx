"use client";

import * as React from "react";

import { InlineMessage } from "./InlineMessage";

export type OfflineIndicatorProps = {
  online?: boolean;
  message?: React.ReactNode;
  className?: string;
};

export function OfflineIndicator({ online, message = "You are offline. Some features may be unavailable.", className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = React.useState<boolean>(() => (typeof online === "boolean" ? online : true));

  React.useEffect(() => {
    if (typeof online === "boolean") {
      setIsOnline(online);
      return;
    }

    const update = () => setIsOnline(navigator.onLine);
    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [online]);

  if (isOnline) return null;
  return (
    <InlineMessage tone="warning" title="Offline" className={className}>
      {message}
    </InlineMessage>
  );
}
