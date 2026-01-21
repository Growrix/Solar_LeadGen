/**
 * Admin Typography System v2.0
 * 
 * Clear hierarchy for admin dashboard content.
 * Uses Inter font family for optimal readability.
 */

export const adminTypography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, Monaco, monospace',
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
  
  textStyles: {
    h1: 'text-2xl font-bold tracking-tight',
    h2: 'text-xl font-semibold tracking-tight',
    h3: 'text-lg font-semibold',
    h4: 'text-base font-semibold',
    body: 'text-sm font-normal',
    bodyLarge: 'text-base font-normal',
    caption: 'text-xs font-normal text-admin-fg-muted',
    label: 'text-sm font-medium',
    code: 'text-sm font-mono',
  },
} as const;

export type AdminTypography = typeof adminTypography;
