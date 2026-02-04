/**
 * DS Tokens (Blueprint boundary)
 *
 * This folder is the canonical import surface for design tokens in app code.
 * Today it re-exports the existing token implementation from `src/design-tokens`.
 *
 * Over time, we can move implementation behind this boundary without changing consumers.
 */

export {
  typography,
  spacing,
  shadows,
  animations,
  borders,
  layout,
  type TypographyTokens,
  type SpacingTokens,
  type ShadowTokens,
  type AnimationTokens,
  type BorderTokens,
  type LayoutTokens,
} from '../../design-tokens';
