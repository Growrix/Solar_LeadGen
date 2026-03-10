export const motion = {
  easeStandard: "var(--ds-ease-standard)",
  durationFast: "var(--ds-duration-fast)",
  durationNormal: "var(--ds-duration-normal)",
  durationSlow: "var(--ds-duration-slow)",
} as const;

export type MotionTokenKey = keyof typeof motion;
