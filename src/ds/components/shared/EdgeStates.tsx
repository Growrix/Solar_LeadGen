import * as React from "react";

import { EmptyState, type EmptyStateProps } from "./EmptyState";
import { Icon } from "./Icon";
import { AlertTriangle, ArrowUpCircle, Clock, Lock, ShieldAlert, Wrench, WifiOff } from "../../icons";

export function NoInternetState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={WifiOff} aria-hidden />} />;
}

export function PermissionDeniedState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={Lock} aria-hidden />} />;
}

export function MaintenanceState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={Wrench} aria-hidden />} />;
}

export function UpdateRequiredState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={ArrowUpCircle} aria-hidden />} />;
}

export function SessionTimeoutState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={Clock} aria-hidden />} />;
}

export function RateLimitState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={ShieldAlert} aria-hidden />} />;
}

export function NoResultsState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={AlertTriangle} aria-hidden />} />;
}
