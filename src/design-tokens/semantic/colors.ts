/**
 * Semantic Color Tokens
 * 
 * Meaningful color names mapped to primitive values.
 * These change for rebranding (e.g., primary: blue-600 instead of teal-600).
 * 
 * Theme Support:
 * - light: Color value for light theme
 * - dark: Color value for dark theme
 * - DEFAULT: Tailwind default (same as light for backward compatibility)
 * 
 * Usage: Import in components, hooks, and Tailwind config.
 * 
 * @see src/design-tokens/primitives/colors.ts for raw color values
 */

import { primitives } from '../primitives/colors';
import type { ThemeColor, ChartColor } from '../types';

export const colors = {
  // Brand colors (SCALABLE APPROACH)
  // CURRENT: Orange accent for dark-only theme
  // FUTURE: When system theme enabled, switch to white accent
  // STRATEGY: Keep orange in 'primary' token, easy to swap later
  primary: {
    light: primitives.custom.accent,         // #FF6B00 (ORANGE - for future light theme)
    dark: primitives.custom.accent,          // #FF6B00 (ORANGE - current dark theme accent)
    DEFAULT: primitives.custom.accent,       // #FF6B00 (fallback)
  } as ThemeColor,
  'primary-hover': {
    light: primitives.custom.accentHover,    // #FF8533 (ORANGE hover - for future light theme)
    dark: primitives.custom.accentHover,     // #FF8533 (ORANGE hover - current dark theme)
    DEFAULT: primitives.custom.accentHover,
  } as ThemeColor,
  'primary-dark': {
    light: '#E55F00',                        // Darker orange (for future light theme)
    dark: '#E55F00',                         // Darker orange (current dark theme)
    DEFAULT: '#E55F00',
  } as ThemeColor,
  'primary-foreground': {
    light: '#FFFFFF',                        // White text on orange (for future light theme)
    dark: '#FFFFFF',                         // White text on orange (current dark theme)
    DEFAULT: '#FFFFFF',
  } as ThemeColor,
  
  // Secondary colors (Teal - for branding/logos only)
  secondary: {
    light: primitives.teal[600],             // #0d9488 (Keep teal for brand identity)
    dark: primitives.teal[400],              // #2dd4bf
    DEFAULT: primitives.teal[600],
  } as ThemeColor,
  'secondary-hover': {
    light: primitives.teal[700],
    dark: primitives.teal[500],
    DEFAULT: primitives.teal[700],
  } as ThemeColor,
  
  // Status colors
  success: {
    light: primitives.green[600],
    dark: primitives.green[400],
    DEFAULT: primitives.green[600],
  } as ThemeColor,
  warning: {
    light: primitives.yellow[500],
    dark: primitives.yellow[400],
    DEFAULT: primitives.yellow[500],
  } as ThemeColor,
  error: {
    light: primitives.red[600],
    dark: primitives.red[400],
    DEFAULT: primitives.red[600],
  } as ThemeColor,
  // INFO COLOR REMOVED - White accent only theme, no status info color needed
  
  // Background colors (CUSTOM USER THEME)
  background: {
    light: primitives.custom.lightBg,        // #f9fafb
    dark: primitives.custom.darkBg,          // #101010
    DEFAULT: primitives.custom.lightBg,
  } as ThemeColor,
  'background-alt': {
    light: primitives.custom.lightBgSecondary, // #ffffff
    dark: primitives.custom.darkBgSecondary,   // #1A1A1A
    DEFAULT: primitives.custom.lightBgSecondary,
  } as ThemeColor,
  surface: {
    light: primitives.custom.lightBgSecondary, // #ffffff
    dark: primitives.custom.darkBgSecondary,   // #1A1A1A
    DEFAULT: primitives.custom.lightBgSecondary,
  } as ThemeColor,
  'surface-hover': {
    light: primitives.gray[50],                // #f9fafb (subtle hover)
    dark: '#252525',                           // Slightly lighter than #1A1A1A for hover
    DEFAULT: primitives.gray[50],
  } as ThemeColor,
  overlay: {
    light: 'rgba(0, 0, 0, 0.8)',              // black/80 (modal backdrop)
    dark: 'rgba(0, 0, 0, 0.8)',               // Same for dark mode
    DEFAULT: 'rgba(0, 0, 0, 0.8)',
  } as ThemeColor,
  
  // Text colors (CUSTOM USER THEME)
  foreground: {
    light: primitives.custom.lightText,      // #111827
    dark: primitives.custom.darkText,        // #F5F5F5
    DEFAULT: primitives.custom.lightText,
  } as ThemeColor,
  label: {
    light: primitives.custom.lightTextSubtle, // #6b7280 (for form labels)
    dark: primitives.custom.darkTextSubtle,   // #A0A0A0
    DEFAULT: primitives.custom.lightTextSubtle,
  } as ThemeColor,
  muted: {
    light: primitives.custom.lightText,      // #111827 (same as primary per user spec)
    dark: primitives.custom.darkText,        // #F5F5F5 (same as primary per user spec)
    DEFAULT: primitives.custom.lightText,
  } as ThemeColor,
  subtle: {
    light: primitives.custom.lightTextSubtle, // #6b7280
    dark: primitives.custom.darkTextSubtle,   // #A0A0A0
    DEFAULT: primitives.custom.lightTextSubtle,
  } as ThemeColor,
  
  // Border colors (CUSTOM USER THEME)
  border: {
    light: primitives.custom.lightBorder,    // #e5e7eb
    dark: primitives.custom.darkBorder,      // #2C2C2C
    DEFAULT: primitives.custom.lightBorder,
  } as ThemeColor,
  'border-focus': {
    light: primitives.teal[500],
    dark: primitives.teal[400],
    DEFAULT: primitives.teal[500],
  } as ThemeColor,
  
  // Accent colors (CUSTOM USER THEME) - SCALABLE STRATEGY
  // CURRENT: Orange for dark-only theme (10% of UI - CTAs, active states, links)
  // FUTURE PLAN: Switch to white accent when system theme enabled
  accent: {
    light: primitives.custom.accent,         // #FF6B00 (vibrant orange - for future light theme)
    dark: primitives.custom.accent,          // #FF6B00 (vibrant orange - current dark theme)
    DEFAULT: primitives.custom.accent,
  } as ThemeColor,
  'accent-hover': {
    light: primitives.custom.accentHover,    // #FF8533 (lighter orange on hover - for future light theme)
    dark: primitives.custom.accentHover,     // #FF8533 (lighter orange on hover - current dark theme)
    DEFAULT: primitives.custom.accentHover,
  } as ThemeColor,
  
  // Chart colors (for Recharts integration) - SCALABLE STRATEGY
  chart: {
    primary: {
      light: primitives.custom.accent,       // #FF6B00 (Orange - for future light theme charts)
      dark: primitives.custom.accent,        // #FF6B00 (Orange - current dark theme charts)
    } as ChartColor,
    secondary: {
      light: primitives.teal[600],           // #0d9488 (Teal as secondary)
      dark: primitives.teal[400],
    } as ChartColor,
    tertiary: {
      light: primitives.gray[500],           // Neutral gray instead of blue
      dark: primitives.gray[400],
    } as ChartColor,
    success: {
      light: primitives.green[600],
      dark: primitives.green[400],
    } as ChartColor,
    warning: {
      light: primitives.yellow[500],
      dark: primitives.yellow[400],
    } as ChartColor,
    error: {
      light: primitives.red[600],
      dark: primitives.red[400],
    } as ChartColor,
  },
} as const;

export type SemanticColors = typeof colors;
