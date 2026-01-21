/**
 * Admin Elevation System v2.0
 * 
 * Clean shadow-based elevation for depth perception.
 * Replaces neumorphic shadows with modern, subtle shadows.
 * 
 * Levels:
 * - 0: Flat (no shadow)
 * - 1: Subtle (hover states, secondary cards)
 * - 2: Standard (cards, panels)
 * - 3: Raised (dropdowns, popovers)
 * - 4: Overlay (modals, dialogs)
 */

export const adminElevation = {
  0: 'none',
  1: 'var(--admin-shadow-1)',
  2: 'var(--admin-shadow-2)',
  3: 'var(--admin-shadow-3)',
  4: 'var(--admin-shadow-4)',
  
  focus: 'var(--admin-shadow-focus)',
  inset: 'var(--admin-shadow-inset)',
} as const;

export const adminShadowValues = {
  dark: {
    1: '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    2: '0 2px 4px -1px rgba(0, 0, 0, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    3: '0 4px 8px -2px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.4)',
    4: '0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 16px 32px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    focus: '0 0 0 2px var(--admin-bg-base), 0 0 0 4px var(--admin-ring)',
    inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  },
  light: {
    1: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    2: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    3: '0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
    4: '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 16px 32px -8px rgba(0, 0, 0, 0.15)',
    focus: '0 0 0 2px var(--admin-bg-base), 0 0 0 4px var(--admin-ring)',
    inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },
} as const;

export type AdminElevation = typeof adminElevation;
