/**
 * Theme Type Definitions
 * 
 * Separated to avoid circular dependencies
 */

/**
 * Theme Interface
 * 
 * Defines structure for white-label themes
 */
export interface Theme {
  /** Unique theme identifier */
  id: string
  
  /** Human-readable theme name */
  name: string
  
  /** Client/brand name */
  client: string
  
  /** Theme color overrides (only override what changes per client) */
  colors: {
    primary?: { light: string; dark: string; DEFAULT: string }
    secondary?: { light: string; dark: string; DEFAULT: string }
    success?: { light: string; dark: string; DEFAULT: string }
    warning?: { light: string; dark: string; DEFAULT: string }
    error?: { light: string; dark: string; DEFAULT: string }
    info?: { light: string; dark: string; DEFAULT: string }
    background?: { light: string; dark: string; DEFAULT: string }
    foreground?: { light: string; dark: string; DEFAULT: string }
    surface?: { light: string; dark: string; DEFAULT: string }
    'surface-secondary'?: { light: string; dark: string; DEFAULT: string }
    border?: { light: string; dark: string; DEFAULT: string }
  }
  
  /** Optional logo path for this brand */
  logo?: {
    light: string // Logo for light theme
    dark: string  // Logo for dark theme
  }
  
  /** Optional favicon path */
  favicon?: string
  
  /** Optional custom CSS variables */
  cssVariables?: Record<string, string>
}
