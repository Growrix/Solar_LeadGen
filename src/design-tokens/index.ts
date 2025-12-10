/**
 * Design Tokens Barrel Export
 * 
 * Single import point for all design tokens.
 * Import this file in Tailwind config and components.
 * 
 * @example
 * ```typescript
 * import { colors, typography, spacing, shadows, animations, borders } from '@/design-tokens';
 * 
 * // Use in components
 * const buttonClass = `bg-${colors.primary} text-${typography.button.fontSize}`;
 * 
 * // Use in Tailwind config
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors,
 *       ...typography,
 *       spacing,
 *       boxShadow: shadows,
 *     },
 *   },
 * };
 * ```
 */

// Semantic tokens (primary exports)
export { colors, type SemanticColors } from './semantic/colors';
export { typography, type TypographyTokens } from './semantic/typography';
export { spacing, type SpacingTokens } from './semantic/spacing';
export { shadows, type ShadowTokens } from './semantic/shadows';
export { animations, type AnimationTokens } from './semantic/animations';
export { borders, type BorderTokens } from './semantic/borders';

// Primitive tokens (for internal use only - prefer semantic tokens)
export { primitives, type PrimitiveColorPalette } from './primitives/colors';
export { 
  fontSizes, 
  fontWeights, 
  lineHeights, 
  letterSpacing,
  type FontSizes,
  type FontWeights,
  type LineHeights,
  type LetterSpacing,
} from './primitives/fontSizes';
export { spacingScale, type SpacingScale } from './primitives/spacingScale';

// TypeScript types
export type {
  ThemeColor,
  ChartColor,
  ColorPalette,
  ResponsiveFontSize,
  TextStyle,
  ResponsiveSpacing,
  ThemeShadow,
  AnimationDuration,
  BorderRadius,
  BorderWidth,
} from './types';
