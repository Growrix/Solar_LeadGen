/**
 * Shadow (Elevation) Tokens
 * 
 * Elevation system for depth perception.
 * Theme-aware: lighter shadows in dark mode.
 * 
 * 5 levels:
 * 1. Button (hover) - Subtle elevation
 * 2. Card - Standard content elevation
 * 3. Dropdown - Above content
 * 4. Modal - Highest elevation
 * 5. Focus - Accessibility ring
 * 
 * Usage: Import in Tailwind config and components.
 * Use semantic names (shadow-card, shadow-modal) for consistent depth.
 * 
 * @see https://tailwindcss.com/docs/box-shadow
 */

import type { ThemeShadow } from '../types';

export const shadows = {
  none: 'none',
  
  // Level 1: Button hover elevation
  button: {
    light: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    dark: '0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  } as ThemeShadow,
  
  // Level 2: Card elevation
  card: {
    light: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    dark: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.5)',
    DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  } as ThemeShadow,
  
  // Level 3: Dropdown elevation
  dropdown: {
    light: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    dark: '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
    DEFAULT: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  } as ThemeShadow,
  
  // Level 4: Modal elevation (highest)
  modal: {
    light: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.12)',
    dark: '0 10px 25px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.4)',
    DEFAULT: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.12)',
  } as ThemeShadow,
  
  // Focus ring (accessibility)
  focus: {
    light: '0 0 0 3px rgba(13, 148, 136, 0.3)', // Teal-600 with 30% opacity
    dark: '0 0 0 3px rgba(20, 184, 166, 0.3)',  // Teal-500 with 30% opacity
    DEFAULT: '0 0 0 3px rgba(13, 148, 136, 0.3)',
  } as ThemeShadow,
} as const;

export type ShadowTokens = typeof shadows;
