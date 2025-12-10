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
      fontSize: { DEFAULT: '24px', md: '30px', lg: '36px' } as ResponsiveFontSize, // Mobile → Tablet → Desktop
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    } as TextStyle,
    2: {
      fontSize: { DEFAULT: '20px', md: '24px', lg: '30px' } as ResponsiveFontSize,
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    } as TextStyle,
    3: {
      fontSize: { DEFAULT: '18px', md: '20px', lg: '24px' } as ResponsiveFontSize,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
    } as TextStyle,
    4: {
      fontSize: { DEFAULT: '16px', md: '18px', lg: '20px' } as ResponsiveFontSize,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
    } as TextStyle,
  },
  
  body: {
    fontSize: { DEFAULT: '14px', lg: '16px' } as ResponsiveFontSize, // 14px mobile, 16px desktop
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  } as TextStyle,
  
  'body-large': {
    fontSize: { DEFAULT: '16px', lg: '18px' } as ResponsiveFontSize,
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
