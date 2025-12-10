/**
 * Primitive Font Size Scale
 * 
 * Base font sizes following an 8-point grid system.
 * Mobile-first: smaller sizes on mobile, larger on desktop.
 * 
 * Usage: Import in semantic typography files.
 * Components should use semantic typography tokens, not primitives.
 */

export const fontSizes = {
  xs: '12px',
  sm: '14px',     // Mobile body text (base size)
  base: '16px',   // Desktop body text (base size)
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
  '7xl': '72px',
  '8xl': '96px',
  '9xl': '128px',
} as const;

/**
 * Font Weight Scale
 */
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

/**
 * Line Height Scale
 */
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

/**
 * Letter Spacing Scale
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

export type FontSizes = typeof fontSizes;
export type FontWeights = typeof fontWeights;
export type LineHeights = typeof lineHeights;
export type LetterSpacing = typeof letterSpacing;
