"use client";

import * as React from "react";

import { Button } from "../../primitives/Button";

export type HapticFeedbackTriggerProps = {
  label?: string;
  patternMs?: number | number[];
  className?: string;
};

export function HapticFeedbackTrigger({ label = "Haptic tap", patternMs = 20, className }: HapticFeedbackTriggerProps) {
  const trigger = () => {
    if (typeof navigator === "undefined") return;
    if (typeof navigator.vibrate !== "function") return;
    navigator.vibrate(patternMs);
  };

  return (
    <Button size="sm" variant="secondary" className={className} onClick={trigger}>
      {label}
    </Button>
  );
}
