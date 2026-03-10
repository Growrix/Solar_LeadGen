import * as React from "react";

import { EmptyState, type EmptyStateProps } from "./EmptyState";
import { Icon } from "./Icon";
import { AlertTriangle, CheckCircle } from "../../icons";

export function ErrorState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={AlertTriangle} aria-hidden />} />;
}

export function SuccessState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState {...props} icon={<Icon icon={CheckCircle} aria-hidden />} />;
}
