/**
 * Semantic Typography Tokens
 * 
 * Meaningful names for text styles (headings, body, captions).
 * Responsive by default (mobile → desktop).
 * 
 * Usage: Import in Tailwind config and components.
 * Use semantic names (heading-1, body, label) instead of raw font sizes.
 * 
 * @see src/design-tokens/primitives/fontSizes.ts for raw values
 */

import { fontSizes, fontWeights, lineHeights, letterSpacing } from '../primitives/fontSizes';
import type { TextStyle, ResponsiveFontSize } from '../types';

export const typography = {
  // Font families
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont,"Segoe UI", Roboto,"Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code","Courier New", Consolas, Monaco, monospace',
  },
  
  // Semantic text styles (mobile-first)
  heading: {
    1: {
      // SolarConnect: text-4xl md:text-5xl lg:text-6xl
      fontSize: { DEFAULT: '36px', md: '48px', lg: '60px' } as ResponsiveFontSize,
      fontWeight: fontWeights.extrabold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    } as TextStyle,
    2: {
      // SolarConnect: text-3xl md:text-4xl
      fontSize: { DEFAULT: '30px', md: '36px', lg: '48px' } as ResponsiveFontSize,
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    } as TextStyle,
    3: {
      // SolarConnect: text-2xl
      fontSize: { DEFAULT: '24px', md: '24px', lg: '30px' } as ResponsiveFontSize,
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.snug,
    } as TextStyle,
    4: {
      // SolarConnect: text-xl
      fontSize: { DEFAULT: '20px', md: '20px', lg: '24px' } as ResponsiveFontSize,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
    } as TextStyle,
  },
  
  body: {
    // SolarConnect: text-base
    fontSize: { DEFAULT: '16px', lg: '16px' } as ResponsiveFontSize,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  } as TextStyle,
  
  'body-large': {
    // SolarConnect: text-lg / text-xl
    fontSize: { DEFAULT: '18px', lg: '20px' } as ResponsiveFontSize,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
  } as TextStyle,
  
  'body-small': {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  } as TextStyle,
  
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  micro: {
    fontSize: '10px',
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,
  
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
  } as TextStyle,
  
  button: {
    fontSize: { DEFAULT: '14px', lg: '16px' } as ResponsiveFontSize,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,
} as const;

export type TypographyTokens = typeof typography;
