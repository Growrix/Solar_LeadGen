export type CssVar = `var(--${string})`;

export const space = {
  0: "var(--ds-space-0)",
  1: "var(--ds-space-1)",
  2: "var(--ds-space-2)",
  3: "var(--ds-space-3)",
  4: "var(--ds-space-4)",
  6: "var(--ds-space-6)",
  7: "var(--ds-space-7)",
  8: "var(--ds-space-8)",
  9: "var(--ds-space-9)",
  cardPadding: "var(--ds-space-card-padding)",
  modalPadding: "var(--ds-space-modal-padding)",
  formGap: "var(--ds-space-form-gap)",
} as const satisfies Record<string, CssVar>;

export const radius = {
  default: "var(--ds-radius-default)",
  card: "var(--ds-radius-card)",
  modal: "var(--ds-radius-modal)",
  full: "var(--ds-radius-full)",
  // Compatibility aliases
  sm: "var(--ds-radius-sm)",
  1: "var(--ds-radius-1)",
  2: "var(--ds-radius-2)",
  3: "var(--ds-radius-3)",
} as const satisfies Record<string, CssVar>;

export const z = {
  sticky: "var(--ds-z-sticky)",
  modal: "var(--ds-z-modal)",
  dropdown: "var(--ds-z-dropdown)",
  drawer: "var(--ds-z-drawer)",
  tooltip: "var(--ds-z-tooltip)",
  toast: "var(--ds-z-toast)",
} as const satisfies Record<string, CssVar>;

export const motion = {
  easeStandard: "var(--ds-ease-standard)",
  durationFast: "var(--ds-duration-fast)",
  durationNormal: "var(--ds-duration-normal)",
  durationSlow: "var(--ds-duration-slow)",
} as const satisfies Record<string, CssVar>;
