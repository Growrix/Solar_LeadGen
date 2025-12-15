/**
 * Primitive Color Palette
 * 
 * Raw color values based on Tailwind's default palette.
 * These values rarely change (foundation of design system).
 * 
 * Usage: Import primitives only in semantic color files.
 * Components should NEVER import primitives directly.
 * 
 * @see https://tailwindcss.com/docs/customizing-colors
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
  
  // Custom theme colors (user-specified)
  custom: {
    // Dark theme specific
    darkBg: '#101010',          // Primary background (dark)
    darkBgSecondary: '#1A1A1A', // Secondary background (dark)
    darkBorder: '#2C2C2C',      // Border (dark)
    darkText: '#F5F5F5',        // Primary/Secondary text (dark)
    darkTextSubtle: '#A0A0A0',  // Subtle text (dark)
    darkAccent: '#A0A0A0',      // Muted gray accent for dark theme (NO ORANGE)
    darkAccentHover: '#B0B0B0', // Muted gray hover for dark theme
    
    // Light theme specific  
    lightBg: '#f9fafb',         // Primary background (light)
    lightBgSecondary: '#ffffff', // Secondary background (light)
    lightBorder: '#e5e7eb',     // Border (light)
    lightText: '#111827',       // Primary/Secondary text (light)
    lightTextSubtle: '#6b7280', // Subtle text (light)
    
    // Accent colors (light theme only - orange)
    accent: '#FF6B00',          // Accent color (light theme)
    accentHover: '#FF8533',     // Accent hover state (light theme)
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
    950: '#042f2e',
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
    950: '#451a03',
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
    950: '#052e16',
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
    950: '#422006',
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
    950: '#450a0a',
  },
  // BLUE PALETTE REMOVED - Dark-only neumorphic theme, no blue colors needed
} as const;

export type PrimitiveColorPalette = typeof primitives;
