/**
 * Primitive Spacing Scale
 * 
 * 8-point grid system: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
 * Base unit: 4px (0.25rem)
 * 
 * Usage: Import in semantic spacing files.
 * Components should use semantic spacing tokens, not primitives.
 * 
 * @see https://tailwindcss.com/docs/customizing-spacing
 */

export const spacingScale = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

export type SpacingScale = typeof spacingScale;
