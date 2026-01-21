/**
 * Admin Spacing System v2.0
 * 
 * Consistent 4px-based spacing scale.
 * Semantic names for common UI patterns.
 */

export const adminSpacing = {
  0: '0',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
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
  
  component: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  
  layout: {
    page: '24px',
    section: '32px',
    gutter: '16px',
    sidebar: '256px',
  },
} as const;

export type AdminSpacing = typeof adminSpacing;
