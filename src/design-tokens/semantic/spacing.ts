/**
 * Semantic Spacing Tokens
 * 
 * Meaningful names for common spacing patterns.
 * Responsive: mobile (50-75% of desktop) → desktop (100%).
 * 
 * Usage: Import in Tailwind config and components.
 * Use semantic names (card-padding, form-gap) instead of raw spacing values.
 * 
 * @see src/design-tokens/primitives/spacingScale.ts for raw values
 */

import { spacingScale } from '../primitives/spacingScale';
import type { ResponsiveSpacing } from '../types';

export const spacing = {
  // Mobile-specific spacing (explicit)
  'mobile-xs': spacingScale[1],    // 4px
  'mobile-sm': spacingScale[2],    // 8px
  'mobile-md': spacingScale[3],    // 12px
  'mobile-lg': spacingScale[4],    // 16px
  'mobile-xl': spacingScale[5],    // 20px
  
  // Desktop-specific spacing (explicit)
  'desktop-xs': spacingScale[2],   // 8px
  'desktop-sm': spacingScale[3],   // 12px
  'desktop-md': spacingScale[4],   // 16px
  'desktop-lg': spacingScale[6],   // 24px
  'desktop-xl': spacingScale[8],   // 32px
  'desktop-2xl': spacingScale[12], // 48px
  
  // Semantic responsive spacing (auto-responsive via Tailwind plugin)
  'card-padding': {
    DEFAULT: spacingScale[3],      // 12px mobile
    md: spacingScale[4],           // 16px tablet
    lg: spacingScale[6],           // 24px desktop
  } as ResponsiveSpacing,
  
  'modal-padding': {
    DEFAULT: spacingScale[4],      // 16px mobile
    md: spacingScale[5],           // 20px tablet
    lg: spacingScale[6],           // 24px desktop
  } as ResponsiveSpacing,
  
  'form-gap': {
    DEFAULT: spacingScale[3],      // 12px mobile
    md: spacingScale[4],           // 16px tablet
    lg: spacingScale[5],           // 20px desktop
  } as ResponsiveSpacing,
  
  'section-margin': {
    DEFAULT: spacingScale[6],      // 24px mobile
    md: spacingScale[8],           // 32px tablet
    lg: spacingScale[12],          // 48px desktop
  } as ResponsiveSpacing,
  
  'heading-margin': {
    DEFAULT: spacingScale[3],      // 12px mobile
    md: spacingScale[4],           // 16px tablet
    lg: spacingScale[5],           // 20px desktop
  } as ResponsiveSpacing,
  
  'button-padding-x': {
    DEFAULT: spacingScale[4],      // 16px mobile
    lg: spacingScale[5],           // 20px desktop
  } as ResponsiveSpacing,
  
  'button-padding-y': {
    DEFAULT: spacingScale[2],      // 8px mobile
    lg: spacingScale[3],           // 10px desktop (approx)
  } as ResponsiveSpacing,
  
  'input-padding': {
    DEFAULT: spacingScale[3],      // 12px mobile
    lg: spacingScale[4],           // 16px desktop
  } as ResponsiveSpacing,
  
  'nav-padding': {
    DEFAULT: spacingScale[4],      // 16px mobile
    lg: spacingScale[6],           // 24px desktop
  } as ResponsiveSpacing,
} as const;

export type SpacingTokens = typeof spacing;
