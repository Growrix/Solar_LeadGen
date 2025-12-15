# Phase 1: Data Model - Design Token Schemas

**Feature**: Centralized Design Token System  
**Date**: January 28, 2025  
**Status**: Complete

---

## Overview

This document defines the TypeScript data models (schemas, types, interfaces) for all design tokens in the centralized design token system. These types ensure type safety when using tokens in components and enable IntelliSense support in IDEs.

---

## Core Token Types

### 1. Color Tokens

**Purpose**: Define color palette (primitives) and semantic color mappings for theming.

**Primitive Color Schema** (`src/design-tokens/primitives/colors.ts`):
```typescript
/**
 * Primitive Color Palette
 * 
 * Raw color values based on Tailwind's default palette.
 * These values rarely change (foundation of design system).
 * 
 * Usage: Import primitives only in semantic color files.
 * Components should NEVER import primitives directly.
 */
export const primitives = {
  // Grayscale
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Brand colors (Teal - primary)
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488', // Primary brand color
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  // Accent colors (Amber - secondary)
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24', // Secondary brand color
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Status colors
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

export type PrimitiveColorPalette = typeof primitives;
```

**Semantic Color Schema** (`src/design-tokens/semantic/colors.ts`):
```typescript
import { primitives } from '../primitives/colors';

/**
 * Semantic Color Tokens
 * 
 * Meaningful color names mapped to primitive values.
 * These change for rebranding (e.g., primary: blue-600 instead of teal-600).
 * 
 * Theme Support:
 * - light: Color value for light theme
 * - dark: Color value for dark theme
 * 
 * Usage: Import in components, hooks, and Tailwind config.
 */
export const colors = {
  // Brand colors
  primary: {
    light: primitives.teal[600],
    dark: primitives.teal[400],
    DEFAULT: primitives.teal[600], // Tailwind default (light)
  },
  'primary-hover': {
    light: primitives.teal[700],
    dark: primitives.teal[500],
    DEFAULT: primitives.teal[700],
  },
  'primary-dark': {
    light: primitives.teal[700],
    dark: primitives.teal[300],
    DEFAULT: primitives.teal[700],
  },
  
  secondary: {
    light: primitives.amber[400],
    dark: primitives.amber[300],
    DEFAULT: primitives.amber[400],
  },
  'secondary-hover': {
    light: primitives.amber[500],
    dark: primitives.amber[400],
    DEFAULT: primitives.amber[500],
  },
  
  // Status colors
  success: {
    light: primitives.green[600],
    dark: primitives.green[400],
    DEFAULT: primitives.green[600],
  },
  warning: {
    light: primitives.yellow[500],
    dark: primitives.yellow[400],
    DEFAULT: primitives.yellow[500],
  },
  error: {
    light: primitives.red[600],
    dark: primitives.red[400],
    DEFAULT: primitives.red[600],
  },
  info: {
    light: primitives.blue[600],
    dark: primitives.blue[400],
    DEFAULT: primitives.blue[600],
  },
  
  // Background colors
  background: {
    light: primitives.white,
    dark: primitives.gray[900],
    DEFAULT: primitives.white,
  },
  'background-alt': {
    light: primitives.gray[50],
    dark: primitives.gray[800],
    DEFAULT: primitives.gray[50],
  },
  surface: {
    light: primitives.white,
    dark: primitives.gray[800],
    DEFAULT: primitives.white,
  },
  
  // Text colors
  foreground: {
    light: primitives.gray[900],
    dark: primitives.gray[50],
    DEFAULT: primitives.gray[900],
  },
  muted: {
    light: primitives.gray[600],
    dark: primitives.gray[400],
    DEFAULT: primitives.gray[600],
  },
  subtle: {
    light: primitives.gray[500],
    dark: primitives.gray[500],
    DEFAULT: primitives.gray[500],
  },
  
  // Border colors
  border: {
    light: primitives.gray[300],
    dark: primitives.gray[700],
    DEFAULT: primitives.gray[300],
  },
  'border-focus': {
    light: primitives.teal[500],
    dark: primitives.teal[400],
    DEFAULT: primitives.teal[500],
  },
  
  // Chart colors (for Recharts integration)
  chart: {
    primary: {
      light: primitives.teal[600],
      dark: primitives.teal[400],
    },
    secondary: {
      light: primitives.amber[400],
      dark: primitives.amber[300],
    },
    tertiary: {
      light: primitives.blue[600],
      dark: primitives.blue[400],
    },
    success: {
      light: primitives.green[600],
      dark: primitives.green[400],
    },
    warning: {
      light: primitives.yellow[500],
      dark: primitives.yellow[400],
    },
    error: {
      light: primitives.red[600],
      dark: primitives.red[400],
    },
  },
} as const;

export type SemanticColors = typeof colors;
```

**TypeScript Types** (`src/design-tokens/types.ts`):
```typescript
/**
 * Theme-aware color value
 * 
 * Supports light/dark theme variants + Tailwind DEFAULT.
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
 */
export interface ChartColor {
  light: string;
  dark: string;
}

/**
 * Color palette structure
 */
export interface ColorPalette {
  [key: string]: string | { [shade: number]: string };
}
```

---

### 2. Typography Tokens

**Purpose**: Define font families, sizes, weights, line heights, and letter spacing.

**Primitive Typography Schema** (`src/design-tokens/primitives/fontSizes.ts`):
```typescript
/**
 * Primitive Font Size Scale
 * 
 * Base font sizes following an 8-point grid system.
 * Mobile-first: smaller sizes on mobile, larger on desktop.
 */
export const fontSizes = {
  xs: '12px',
  sm: '14px',     // Mobile body text (base size)
  base: '16px',   // Desktop body text (base size)
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
} as const;

/**
 * Font Weight Scale
 */
export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Line Height Scale
 */
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

/**
 * Letter Spacing Scale
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

export type FontSizes = typeof fontSizes;
export type FontWeights = typeof fontWeights;
export type LineHeights = typeof lineHeights;
export type LetterSpacing = typeof letterSpacing;
```

**Semantic Typography Schema** (`src/design-tokens/semantic/typography.ts`):
```typescript
import { fontSizes, fontWeights, lineHeights } from '../primitives/fontSizes';

/**
 * Semantic Typography Tokens
 * 
 * Meaningful names for text styles (headings, body, captions).
 * Responsive by default (mobile → desktop).
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  
  // Semantic text styles (mobile-first)
  heading: {
    1: {
      fontSize: { DEFAULT: '24px', md: '30px', lg: '36px' }, // Mobile → Tablet → Desktop
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
    },
    2: {
      fontSize: { DEFAULT: '20px', md: '24px', lg: '30px' },
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
    },
    3: {
      fontSize: { DEFAULT: '18px', md: '20px', lg: '24px' },
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
    },
    4: {
      fontSize: { DEFAULT: '16px', md: '18px', lg: '20px' },
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
    },
  },
  
  body: {
    fontSize: { DEFAULT: '14px', lg: '16px' }, // 14px mobile, 16px desktop
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  
  'body-large': {
    fontSize: { DEFAULT: '16px', lg: '18px' },
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
  },
  
  'body-small': {
    fontSize: '14px',
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  
  caption: {
    fontSize: '12px',
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  
  label: {
    fontSize: '14px',
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
  },
  
  button: {
    fontSize: { DEFAULT: '14px', lg: '16px' },
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.wide,
  },
} as const;

export type TypographyTokens = typeof typography;
```

**TypeScript Types** (`src/design-tokens/types.ts` - add to existing file):
```typescript
/**
 * Responsive font size value
 */
export interface ResponsiveFontSize {
  DEFAULT: string;
  md?: string;
  lg?: string;
}

/**
 * Text style definition
 */
export interface TextStyle {
  fontSize: string | ResponsiveFontSize;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}
```

---

### 3. Spacing Tokens

**Purpose**: Define spacing scale for padding, margin, gap (mobile-first, responsive).

**Primitive Spacing Schema** (`src/design-tokens/primitives/spacingScale.ts`):
```typescript
/**
 * Primitive Spacing Scale
 * 
 * 8-point grid system: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
 * Base unit: 4px (0.25rem)
 */
export const spacingScale = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export type SpacingScale = typeof spacingScale;
```

**Semantic Spacing Schema** (`src/design-tokens/semantic/spacing.ts`):
```typescript
/**
 * Semantic Spacing Tokens
 * 
 * Meaningful names for common spacing patterns.
 * Responsive: mobile (50-75% of desktop) → desktop (100%).
 */
export const spacing = {
  // Mobile-specific spacing (explicit)
  'mobile-xs': '4px',
  'mobile-sm': '8px',
  'mobile-md': '12px',
  'mobile-lg': '16px',
  'mobile-xl': '20px',
  
  // Desktop-specific spacing (explicit)
  'desktop-xs': '8px',
  'desktop-sm': '12px',
  'desktop-md': '16px',
  'desktop-lg': '24px',
  'desktop-xl': '32px',
  'desktop-2xl': '48px',
  
  // Semantic responsive spacing (auto-responsive via plugin)
  'card-padding': {
    DEFAULT: '12px',    // Mobile
    md: '16px',         // Tablet
    lg: '24px',         // Desktop
  },
  'modal-padding': {
    DEFAULT: '16px',
    md: '20px',
    lg: '24px',
  },
  'form-gap': {
    DEFAULT: '12px',
    md: '16px',
    lg: '20px',
  },
  'section-margin': {
    DEFAULT: '24px',
    md: '32px',
    lg: '48px',
  },
  'heading-margin': {
    DEFAULT: '12px',
    md: '16px',
    lg: '20px',
  },
  'button-padding-x': {
    DEFAULT: '16px',
    lg: '20px',
  },
  'button-padding-y': {
    DEFAULT: '8px',
    lg: '10px',
  },
} as const;

export type SpacingTokens = typeof spacing;
```

**TypeScript Types** (`src/design-tokens/types.ts` - add):
```typescript
/**
 * Responsive spacing value
 */
export interface ResponsiveSpacing {
  DEFAULT: string;
  md?: string;
  lg?: string;
}
```

---

### 4. Shadow Tokens

**Purpose**: Define elevation system (card shadows, modal shadows, dropdown shadows).

**Shadow Schema** (`src/design-tokens/semantic/shadows.ts`):
```typescript
/**
 * Shadow (Elevation) Tokens
 * 
 * Elevation system for depth perception.
 * Theme-aware: lighter shadows in dark mode.
 */
export const shadows = {
  none: 'none',
  
  // Card elevation
  card: {
    light: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    dark: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.5)',
    DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  },
  
  // Modal elevation
  modal: {
    light: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.12)',
    dark: '0 10px 25px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.4)',
    DEFAULT: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.12)',
  },
  
  // Dropdown elevation
  dropdown: {
    light: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    dark: '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
    DEFAULT: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  
  // Button hover elevation
  button: {
    light: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    dark: '0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  },
  
  // Focus ring
  focus: {
    light: '0 0 0 3px rgba(13, 148, 136, 0.3)', // Teal-600 with 30% opacity
    dark: '0 0 0 3px rgba(20, 184, 166, 0.3)',  // Teal-500 with 30% opacity
    DEFAULT: '0 0 0 3px rgba(13, 148, 136, 0.3)',
  },
} as const;

export type ShadowTokens = typeof shadows;
```

---

### 5. Animation Tokens

**Purpose**: Define transition durations, easing functions, animation names.

**Animation Schema** (`src/design-tokens/semantic/animations.ts`):
```typescript
/**
 * Animation & Transition Tokens
 * 
 * Consistent animation timings and easing functions.
 */
export const animations = {
  // Transition durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Predefined transitions
  transition: {
    colors: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1), background-color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Keyframe animations (for Tailwind)
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideInUp: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideOutDown: {
      from: { transform: 'translateY(0)', opacity: '1' },
      to: { transform: 'translateY(10px)', opacity: '0' },
    },
  },
} as const;

export type AnimationTokens = typeof animations;
```

---

### 6. Border Radius Tokens

**Purpose**: Define consistent border radius values for cards, buttons, inputs.

**Border Radius Schema** (`src/design-tokens/semantic/borders.ts`):
```typescript
/**
 * Border Radius Tokens
 * 
 * Consistent rounding for UI elements.
 */
export const borders = {
  radius: {
    none: '0px',
    sm: '4px',
    DEFAULT: '8px',      // Default for most elements
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',      // Perfect circles
    
    // Semantic names
    card: '12px',
    button: '8px',
    input: '8px',
    modal: '16px',
    badge: '9999px',
  },
  
  width: {
    none: '0px',
    DEFAULT: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
} as const;

export type BorderTokens = typeof borders;
```

---

## Barrel Export (`src/design-tokens/index.ts`)

```typescript
/**
 * Design Token System
 * 
 * Single source of truth for all design values.
 * Import from this file in components and Tailwind config.
 * 
 * Usage:
 *   import { colors, typography, spacing } from '@/design-tokens';
 */

// Semantic tokens (USE THESE in components)
export { colors } from './semantic/colors';
export { typography } from './semantic/typography';
export { spacing } from './semantic/spacing';
export { shadows } from './semantic/shadows';
export { animations } from './semantic/animations';
export { borders } from './semantic/borders';

// Primitive tokens (USE ONLY in semantic token files)
export { primitives } from './primitives/colors';
export { fontSizes, fontWeights, lineHeights, letterSpacing } from './primitives/fontSizes';
export { spacingScale } from './primitives/spacingScale';

// TypeScript types
export type {
  ThemeColor,
  ChartColor,
  ColorPalette,
  ResponsiveFontSize,
  TextStyle,
  ResponsiveSpacing,
} from './types';

export type { SemanticColors } from './semantic/colors';
export type { TypographyTokens } from './semantic/typography';
export type { SpacingTokens } from './semantic/spacing';
export type { ShadowTokens } from './semantic/shadows';
export type { AnimationTokens } from './semantic/animations';
export type { BorderTokens } from './semantic/borders';
```

---

## Usage Examples

### Example 1: Component Using Color Tokens

```typescript
import { colors } from '@/design-tokens';

const Button = ({ variant = 'primary' }: { variant: 'primary' | 'secondary' }) => {
  const bgColor = variant === 'primary' ? 'bg-primary' : 'bg-secondary';
  const hoverColor = variant === 'primary' ? 'hover:bg-primary-hover' : 'hover:bg-secondary-hover';
  
  return (
    <button className={`${bgColor} ${hoverColor} text-white px-button-padding-x py-button-padding-y rounded-button`}>
      Click Me
    </button>
  );
};
```

### Example 2: Chart Using Color Hook

```typescript
import { useChartColors } from '@/hooks/useChartColors';
import { BarChart, Bar } from 'recharts';

const DashboardChart = ({ data }: { data: any[] }) => {
  const chartColors = useChartColors();
  
  return (
    <BarChart data={data}>
      <Bar dataKey="value" fill={chartColors.primary} />
      <Bar dataKey="target" fill={chartColors.secondary} />
    </BarChart>
  );
};
```

### Example 3: Responsive Spacing

```typescript
const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-card-padding space-y-form-gap rounded-card shadow-card">
      {children}
    </div>
  );
};
```

---

## Validation Rules

### Type Safety Requirements

1. **All token objects use `as const`**: Enables literal type inference
2. **All token exports have named types**: `SemanticColors`, `TypographyTokens`, etc.
3. **Responsive values use `ResponsiveFontSize` or `ResponsiveSpacing`**: Ensures correct structure
4. **Theme colors use `ThemeColor` interface**: Enforces light/dark/DEFAULT structure

### Naming Conventions

1. **Primitives**: Tailwind-like names (`teal-600`, `text-2xl`, `space-4`)
2. **Semantics**: Meaningful names (`primary`, `heading-1`, `card-padding`)
3. **Responsive**: Explicit breakpoints (`mobile-md`, `desktop-lg`) or semantic (`card-padding`)
4. **No abbreviations**: `button-padding-x` (not `btn-px`)

### File Organization

1. **Primitives** in `primitives/` (foundation, rarely changed)
2. **Semantics** in `semantic/` (business context, changed for rebrand)
3. **Types** in `types.ts` (shared interfaces)
4. **Barrel export** in `index.ts` (single import point)

---

## Next Steps (Phase 1 Continued)

1. **Create actual token files** based on these schemas (4 hours)
2. **Create utility hooks** (`useThemeColors`, `useChartColors`) (2 hours)
3. **Configure Tailwind** to import tokens (1 hour)
4. **Setup Storybook** and create token showcase stories (2 hours)
5. **Build sample page** using all tokens (3 hours)

**Total**: 12 hours (Phase 1 complete)

**Deliverables**:
- ✅ `data-model.md` (this file)
- ⏳ Token files (next step)
- ⏳ Utility hooks (next step)
- ⏳ Tailwind config (next step)
- ⏳ Storybook setup (next step)

**Approval Gate**: All token files created and validated in Storybook before Phase 3 migration.
