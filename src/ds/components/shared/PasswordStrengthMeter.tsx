"use client";

import * as React from "react";

import { ProgressBar } from "./Progress";
import { Text } from "../../primitives/Text";

export type PasswordStrengthMeterProps = {
  password: string;
  label?: string;
  className?: string;
};

function scorePassword(pw: string) {
  const len = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  let score = Math.min(40, len * 5);
  if (hasLower) score += 10;
  if (hasUpper) score += 15;
  if (hasNumber) score += 15;
  if (hasSymbol) score += 20;

  score = Math.max(0, Math.min(100, score));

  let hint: "weak" | "ok" | "good" | "strong" = "weak";
  if (score >= 80) hint = "strong";
  else if (score >= 60) hint = "good";
  else if (score >= 40) hint = "ok";

  return { score, hint };
}

export function PasswordStrengthMeter({ password, label = "Password strength", className }: PasswordStrengthMeterProps) {
  const { score, hint } = React.useMemo(() => scorePassword(password), [password]);

  return (
    <div className={className} aria-label={label}>
      <ProgressBar value={score} label={label} />
      <Text tone="muted">Strength: {hint}</Text>
    </div>
  );
}
