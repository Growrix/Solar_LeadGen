import * as React from "react";

export type AsyncBoundaryStatus = "idle" | "loading" | "error" | "empty" | "ready";

export type AsyncBoundaryProps = {
  status: AsyncBoundaryStatus;
  children: React.ReactNode;
  loading?: React.ReactNode;
  empty?: React.ReactNode;
  error?: React.ReactNode;
};

export function AsyncBoundary({ status, children, loading, empty, error }: AsyncBoundaryProps) {
  if (status === "loading") return <>{loading ?? null}</>;
  if (status === "error") return <>{error ?? null}</>;
  if (status === "empty") return <>{empty ?? null}</>;
  if (status === "ready") return <>{children}</>;
  return null;
}
