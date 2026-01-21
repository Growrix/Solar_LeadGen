/**
 * Admin Color System v2.0
 * 
 * Semantic color tokens for the admin dashboard.
 * All colors use CSS custom properties for theme flexibility.
 * 
 * Structure:
 * - Base colors (background, surface, foreground)
 * - Interactive colors (primary, secondary, accent)
 * - Status colors (success, warning, error, info)
 * - Utility colors (border, ring, muted)
 */

export const adminColors = {
  background: {
    base: 'var(--admin-bg-base)',
    elevated: 'var(--admin-bg-elevated)',
    overlay: 'var(--admin-bg-overlay)',
    hover: 'var(--admin-bg-hover)',
    active: 'var(--admin-bg-active)',
  },
  
  foreground: {
    primary: 'var(--admin-fg-primary)',
    secondary: 'var(--admin-fg-secondary)',
    muted: 'var(--admin-fg-muted)',
    inverse: 'var(--admin-fg-inverse)',
  },
  
  primary: {
    DEFAULT: 'var(--admin-primary)',
    hover: 'var(--admin-primary-hover)',
    active: 'var(--admin-primary-active)',
    foreground: 'var(--admin-primary-fg)',
    muted: 'var(--admin-primary-muted)',
  },
  
  secondary: {
    DEFAULT: 'var(--admin-secondary)',
    hover: 'var(--admin-secondary-hover)',
    foreground: 'var(--admin-secondary-fg)',
  },
  
  accent: {
    DEFAULT: 'var(--admin-accent)',
    hover: 'var(--admin-accent-hover)',
    foreground: 'var(--admin-accent-fg)',
    muted: 'var(--admin-accent-muted)',
  },
  
  destructive: {
    DEFAULT: 'var(--admin-destructive)',
    hover: 'var(--admin-destructive-hover)',
    foreground: 'var(--admin-destructive-fg)',
    muted: 'var(--admin-destructive-muted)',
  },
  
  success: {
    DEFAULT: 'var(--admin-success)',
    hover: 'var(--admin-success-hover)',
    foreground: 'var(--admin-success-fg)',
    muted: 'var(--admin-success-muted)',
  },
  
  warning: {
    DEFAULT: 'var(--admin-warning)',
    hover: 'var(--admin-warning-hover)',
    foreground: 'var(--admin-warning-fg)',
    muted: 'var(--admin-warning-muted)',
  },
  
  info: {
    DEFAULT: 'var(--admin-info)',
    hover: 'var(--admin-info-hover)',
    foreground: 'var(--admin-info-fg)',
    muted: 'var(--admin-info-muted)',
  },
  
  border: {
    DEFAULT: 'var(--admin-border)',
    strong: 'var(--admin-border-strong)',
    muted: 'var(--admin-border-muted)',
  },
  
  ring: {
    DEFAULT: 'var(--admin-ring)',
    destructive: 'var(--admin-ring-destructive)',
  },
} as const;

export type AdminColors = typeof adminColors;
