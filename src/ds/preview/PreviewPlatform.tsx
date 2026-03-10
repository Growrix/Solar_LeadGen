"use client";

import * as React from "react";

export type PreviewPlatform = "auto" | "desktop" | "mobile";

type PreviewPlatformContextValue = {
  platform: PreviewPlatform;
};

const PreviewPlatformContext = React.createContext<PreviewPlatformContextValue>({ platform: "auto" });

export type PreviewPlatformProviderProps = {
  platform: PreviewPlatform;
  children: React.ReactNode;
};

export function PreviewPlatformProvider({ platform, children }: PreviewPlatformProviderProps) {
  return <PreviewPlatformContext.Provider value={{ platform }}>{children}</PreviewPlatformContext.Provider>;
}

export function usePreviewPlatform() {
  return React.useContext(PreviewPlatformContext);
}
