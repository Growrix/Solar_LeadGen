/**
 * Default SolarMatch Theme
 * 
 * This file is separate from index.ts to avoid circular dependencies.
 * Client themes can import and extend this theme without circular imports.
 */

import { primitives } from '../primitives/colors'
import type { Theme } from './types'

/**
 * Default SolarMatch Theme
 * 
 * Uses teal-600 as primary (solar energy association), amber-500 as secondary
 * This is the baseline theme - all client themes inherit from this
 */
export const defaultTheme: Theme = {
  id: 'default',
  name: 'SolarMatch Default',
  client: 'SolarMatch',
  colors: {
    // Brand Colors (Teal primary, Amber secondary)
    primary: {
      light: primitives.teal[600],      // #0d9488
      dark: primitives.teal[400],       // #2dd4bf
      DEFAULT: primitives.teal[600],    // #0d9488
    },
    secondary: {
      light: primitives.amber[500],     // #f59e0b
      dark: primitives.amber[400],      // #fbbf24
      DEFAULT: primitives.amber[500],   // #f59e0b
    },
    
    // Status Colors (keep consistent across all themes)
    success: {
      light: primitives.green[600],     // #16a34a
      dark: primitives.green[400],      // #4ade80
      DEFAULT: primitives.green[600],   // #16a34a
    },
    warning: {
      light: primitives.yellow[500],    // #eab308
      dark: primitives.yellow[400],     // #facc15
      DEFAULT: primitives.yellow[500],  // #eab308
    },
    error: {
      light: primitives.red[600],       // #dc2626
      dark: primitives.red[400],        // #f87171
      DEFAULT: primitives.red[600],     // #dc2626
    },
    // INFO COLOR REMOVED - White accent only theme, no info status color needed
    
    // Background Colors (theme-aware)
    background: {
      light: primitives.white,          // #ffffff
      dark: primitives.gray[900],       // #111827
      DEFAULT: primitives.white,        // #ffffff
    },
    foreground: {
      light: primitives.gray[900],      // #111827
      dark: primitives.white,           // #ffffff
      DEFAULT: primitives.gray[900],    // #111827
    },
    
    // Surface Colors
    surface: {
      light: primitives.gray[50],       // #f9fafb
      dark: primitives.gray[800],       // #1f2937
      DEFAULT: primitives.gray[50],     // #f9fafb
    },
    'surface-secondary': {
      light: primitives.gray[100],      // #f3f4f6
      dark: primitives.gray[700],       // #374151
      DEFAULT: primitives.gray[100],    // #f3f4f6
    },
    
    // Border Colors
    border: {
      light: primitives.gray[200],      // #e5e7eb
      dark: primitives.gray[700],       // #374151
      DEFAULT: primitives.gray[200],    // #e5e7eb
    },
  },
}

/**
 * Helper: Merge Theme Colors
 * 
 * Merges custom theme colors with defaults, preserving unspecified colors
 */
export function mergeThemeColors(
  baseTheme: Theme,
  overrideColors: Partial<Theme['colors']>
): Theme['colors'] {
  return {
    ...baseTheme.colors,
    ...overrideColors,
  }
}
