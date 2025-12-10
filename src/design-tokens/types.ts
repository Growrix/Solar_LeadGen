/**
 * Design Token TypeScript Type Definitions
 * 
 * Provides type safety and IntelliSense for all design tokens.
 * Import these types in components that use design tokens.
 */

/**
 * Theme-aware color value
 * 
 * Supports light/dark theme variants + Tailwind DEFAULT.
 * 
 * @example
 * ```typescript
 * const primary: ThemeColor = {
 *   light: '#0d9488',
 *   dark: '#2dd4bf',
 *   DEFAULT: '#0d9488',
 * };
 * ```
 */
export interface ThemeColor {
  light: string;
  dark: string;
  DEFAULT: string;
}

/**
 * Chart color set (for Recharts)
 * 
 * Only needs light/dark (no DEFAULT for programmatic usage).
 * 
 * @example
 * ```typescript
 * const chartPrimary: ChartColor = {
 *   light: '#0d9488',
 *   dark: '#2dd4bf',
 * };
 * ```
 */
export interface ChartColor {
  light: string;
  dark: string;
}

/**
 * Color palette structure
 * 
 * Supports flat color strings or nested shade objects.
 * 
 * @example
 * ```typescript
 * const palette: ColorPalette = {
 *   white: '#ffffff',
 *   gray: { 50: '#f9fafb', 100: '#f3f4f6', ... },
 * };
 * ```
 */
export interface ColorPalette {
  [key: string]: string | { [shade: number]: string };
}

/**
 * Responsive font size value
 * 
 * Supports mobile-first responsive breakpoints.
 * 
 * @example
 * ```typescript
 * const headingSize: ResponsiveFontSize = {
 *   DEFAULT: '24px',  // Mobile
 *   md: '30px',       // Tablet
 *   lg: '36px',       // Desktop
 * };
 * ```
 */
export interface ResponsiveFontSize {
  DEFAULT: string;
  md?: string;
  lg?: string;
  xl?: string;
}

/**
 * Text style definition
 * 
 * Complete typography specification for a text element.
 * 
 * @example
 * ```typescript
 * const heading1: TextStyle = {
 *   fontSize: { DEFAULT: '24px', md: '30px', lg: '36px' },
 *   fontWeight: '700',
 *   lineHeight: '1.25',
 *   letterSpacing: '-0.025em',
 * };
 * ```
 */
export interface TextStyle {
  fontSize: string | ResponsiveFontSize;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

/**
 * Responsive spacing value
 * 
 * Supports mobile-first responsive breakpoints for spacing.
 * 
 * @example
 * ```typescript
 * const cardPadding: ResponsiveSpacing = {
 *   DEFAULT: '12px',  // Mobile
 *   md: '16px',       // Tablet
 *   lg: '24px',       // Desktop
 * };
 * ```
 */
export interface ResponsiveSpacing {
  DEFAULT: string;
  md?: string;
  lg?: string;
  xl?: string;
}

/**
 * Shadow token value
 * 
 * CSS box-shadow value with theme support.
 * 
 * @example
 * ```typescript
 * const cardShadow: ThemeShadow = {
 *   light: '0 1px 3px rgba(0, 0, 0, 0.12)',
 *   dark: '0 1px 3px rgba(0, 0, 0, 0.5)',
 *   DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.12)',
 * };
 * ```
 */
export interface ThemeShadow {
  light: string;
  dark: string;
  DEFAULT: string;
}

/**
 * Animation token value
 * 
 * CSS animation/transition timing values.
 * 
 * @example
 * ```typescript
 * const duration: AnimationDuration = {
 *   fast: '150ms',
 *   normal: '300ms',
 *   slow: '500ms',
 * };
 * ```
 */
export interface AnimationDuration {
  [key: string]: string;
}

/**
 * Border token value
 * 
 * Border radius and width values.
 * 
 * @example
 * ```typescript
 * const radius: BorderRadius = {
 *   sm: '4px',
 *   md: '6px',
 *   lg: '8px',
 * };
 * ```
 */
export interface BorderRadius {
  [key: string]: string;
}

export interface BorderWidth {
  [key: string]: string;
}
