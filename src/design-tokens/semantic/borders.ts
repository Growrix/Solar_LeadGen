/**
 * Border Radius Tokens
 * 
 * Consistent rounding for UI elements.
 * Follows an 4px incremental scale for visual harmony.
 * 
 * Usage: Import in Tailwind config and components.
 * Use semantic names (radius.card, radius.button) for consistency.
 * 
 * @see https://tailwindcss.com/docs/border-radius
 */

import type { BorderRadius, BorderWidth } from '../types';

export const borders = {
  radius: {
    none: '0px',
    sm: '4px',
    DEFAULT: '8px',      // Default for most elements
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',      // Perfect circles
    
    // Semantic names (use these in components)
    card: '12px',
    button: '8px',
    input: '8px',
    modal: '16px',
    badge: '9999px',     // Pill shape
    avatar: '9999px',    // Circular avatar
  } as BorderRadius,
  
  width: {
    none: '0px',
    DEFAULT: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
    
    // Semantic names
    thin: '1px',
    normal: '2px',
    thick: '4px',
  } as BorderWidth,
} as const;

export type BorderTokens = typeof borders;
