/**
 * White-Label Theme System
 * 
 * This module provides infrastructure for creating client-specific brand themes.
 */

// Export types
export type { Theme } from './types'

// Export default theme and helpers
export { defaultTheme, mergeThemeColors } from './default-theme'

// Import client themes
import { defaultTheme } from './default-theme'
import type { Theme } from './types'

// Registry of available themes
export const themes: Record<string, Theme> = {
  default: defaultTheme,
  // Blue theme removed - white accent only theme
}

// Get theme by ID
export function getTheme(themeId: string): Theme {
  return themes[themeId] || themes.default
}

// Get list of available theme IDs
export function getThemeIds(): string[] {
  return Object.keys(themes)
}
