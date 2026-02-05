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
    light: 'var(--shadow-outset-sm)',
    dark: 'var(--shadow-outset-sm)',
    DEFAULT: 'var(--shadow-outset-sm)',
  } as ThemeShadow,
  
  // Level 2: Card elevation
  card: {
    light: 'var(--shadow-outset-md)',
    dark: 'var(--shadow-outset-md)',
    DEFAULT: 'var(--shadow-outset-md)',
  } as ThemeShadow,
  
  // Level 3: Dropdown elevation
  dropdown: {
    light: 'var(--shadow-outset-lg)',
    dark: 'var(--shadow-outset-lg)',
    DEFAULT: 'var(--shadow-outset-lg)',
  } as ThemeShadow,
  
  // Level 4: Modal elevation (highest)
  modal: {
    light: 'var(--shadow-outset-xl)',
    dark: 'var(--shadow-outset-xl)',
    DEFAULT: 'var(--shadow-outset-xl)',
  } as ThemeShadow,
  
  // Focus ring (accessibility)
  focus: {
    light: '0 0 0 3px rgb(var(--color-accent) / 0.35)',
    dark: '0 0 0 3px rgb(var(--color-accent) / 0.35)',
    DEFAULT: '0 0 0 3px rgb(var(--color-accent) / 0.35)',
  } as ThemeShadow,
} as const;

export type ShadowTokens = typeof shadows;
