/**
 * Admin Border Radius System v2.0
 * 
 * Consistent rounding for UI elements.
 * Uses a clear scale with semantic aliases.
 */

export const adminRadius = {
  none: '0',
  sm: '4px',
  DEFAULT: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
  
  component: {
    button: '6px',
    input: '6px',
    card: '12px',
    modal: '16px',
    badge: '9999px',
    avatar: '9999px',
    dropdown: '8px',
  },
} as const;

export type AdminRadius = typeof adminRadius;
