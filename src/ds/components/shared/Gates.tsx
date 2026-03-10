"use client";

import * as React from "react";

export type GateProps = {
  when: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function Gate({ when, children, fallback = null }: GateProps) {
  return <>{when ? children : fallback}</>;
}

export type FeatureFlagProps = {
  enabled: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function FeatureFlag({ enabled, children, fallback = null }: FeatureFlagProps) {
  return <Gate when={enabled} fallback={fallback}>{children}</Gate>;
}

export type PermissionGateProps = {
  allowed: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGate({ allowed, children, fallback = null }: PermissionGateProps) {
  return <Gate when={allowed} fallback={fallback}>{children}</Gate>;
}

export type RoleGateProps = {
  allowed: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGate({ allowed, children, fallback = null }: RoleGateProps) {
  return <Gate when={allowed} fallback={fallback}>{children}</Gate>;
}

export type ConnectivityGateProps = {
  online?: boolean;
  children: React.ReactNode;
  offlineFallback?: React.ReactNode;
};

export function ConnectivityGate({ online, children, offlineFallback = null }: ConnectivityGateProps) {
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

  return <Gate when={isOnline} fallback={offlineFallback}>{children}</Gate>;
}
