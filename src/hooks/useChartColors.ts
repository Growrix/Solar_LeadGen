'use client';

import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';

/**
 * Convert RGB string to hex format
 * @param rgb RGB string (e.g.,"255 255 255")
 * @returns Hex color string (#RRGGBB)
 */
function rgbToHex(rgb: string): string {
  const [r, g, b] = rgb.split(' ').map(Number);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Convert hex color to rgba format
 * @param hex Hex color string (#RRGGBB)
 * @param alpha Opacity (0-1)
 * @returns RGBA color string
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get CSS variable value from root element
 * @param varName CSS variable name (e.g.,"--color-primary")
 * @returns RGB string or fallback value
 */
function getCSSVariable(varName: string, fallback: string = '255 255 255'): string {
  if (typeof window === 'undefined') return fallback;
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(varName).trim() || fallback;
}

/**
 * useChartColors Hook
 * 
 * Provides theme-aware color palettes specifically designed for data visualization (Recharts integration).
 * Returns hex color values that automatically adapt based on the current theme (dark/light/purple).
 * 
 * @returns {Object} Current theme's chart color palette with primary/secondary/tertiary/status colors
 * 
 * @example
 * ```tsx
 * import { BarChart, Bar, ResponsiveContainer } from 'recharts';
 * 
 * const MyChart = ({ data }) => {
 *   const chartColors = useChartColors();
 *   
 *   return (
 *     <ResponsiveContainer width="100%" height={300}>
 *       <BarChart data={data}>
 *         <Bar dataKey="revenue" fill={chartColors.primary} />
 *         <Bar dataKey="expenses" fill={chartColors.secondary} />
 *         <Bar dataKey="profit" fill={chartColors.success} />
 *       </BarChart>
 *     </ResponsiveContainer>
 *   );
 * };
 * ```
 * 
 * @remarks
 * - Uses multi-theme system (dark/light/purple) for theme detection
 * - Returns appropriate variant automatically based on current theme
 * - All colors are hex strings (#RRGGBB format) compatible with Recharts
 * - Color palette designed for high contrast and accessibility
 * - Primary/Secondary/Tertiary for data series differentiation
 * - Success/Warning/Error for status visualization
 */
export function useChartColors() {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'purple';
  
  // State to hold computed colors (re-computed on theme change)
  const [colors, setColors] = useState(() => {
    if (typeof window === 'undefined') {
      // SSR fallback
      return {
        primary: '#FFFFFF',
        secondary: '#14B8A6',
        tertiary: '#9CA3AF',
        success: '#22C55E',
        warning: '#EAB308',
        error: '#EF4444',
        grid: '#2C2C2C',
        axis: '#6B7280',
        text: '#F5F5F5',
      };
    }
    
    // Read from CSS variables (theme-adaptive)
    const primaryRgb = getCSSVariable('--color-primary', '255 255 255');
    const foregroundRgb = getCSSVariable('--color-foreground', '245 245 245');
    const borderRgb = getCSSVariable('--color-border', '44 44 44');
    
    return {
      primary: rgbToHex(primaryRgb),
      secondary: '#14B8A6', // Teal - consistent across themes
      tertiary: '#9CA3AF',  // Gray - consistent across themes
      success: isDark ? '#4ADE80' : '#16A34A',   // Green
      warning: isDark ? '#FACC15' : '#CA8A04',   // Yellow
      error: isDark ? '#F87171' : '#DC2626',     // Red
      grid: rgbToHex(borderRgb),
      axis: isDark ? '#6B7280' : '#9CA3AF',
      text: rgbToHex(foregroundRgb),
    };
  });

  // Update colors when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const primaryRgb = getCSSVariable('--color-primary', '255 255 255');
    const foregroundRgb = getCSSVariable('--color-foreground', '245 245 245');
    const borderRgb = getCSSVariable('--color-border', '44 44 44');
    
    setColors({
      primary: rgbToHex(primaryRgb),
      secondary: '#14B8A6', // Teal
      tertiary: '#9CA3AF',  // Gray
      success: isDark ? '#4ADE80' : '#16A34A',
      warning: isDark ? '#FACC15' : '#CA8A04',
      error: isDark ? '#F87171' : '#DC2626',
      grid: rgbToHex(borderRgb),
      axis: isDark ? '#6B7280' : '#9CA3AF',
      text: rgbToHex(foregroundRgb),
    });
  }, [theme, isDark]);

  return {
    // Data series colors (for multi-series charts)
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,

    // Status colors (for conditional formatting, thresholds)
    success: colors.success,
    warning: colors.warning,
    error: colors.error,

    // Gradient endpoints (for area charts, background fills)
    gradient: {
      start: colors.primary,
      end: hexToRgba(colors.primary, isDark ? 0.1 : 0.05),
    },

    // Grid/axis colors (for chart infrastructure)
    grid: colors.grid,
    axis: colors.axis,
    text: colors.text,

    // Utility
    isDark,
    theme: theme || 'light',

    /**
     * Get color array for multi-series charts (cycles through primary/secondary/tertiary)
     * @param length Number of colors needed (repeats if > 3)
     * @returns Array of hex color strings
     * 
     * @example
     * ```tsx
     * const chartColors = useChartColors();
     * const colorArray = chartColors.getColorArray(5);
     * // Returns: [primary, secondary, tertiary, primary, secondary]
     * ```
     */
    getColorArray: (length: number): string[] => {
      const baseColors = [colors.primary, colors.secondary, colors.tertiary];
      return Array.from({ length }, (_, i) => baseColors[i % baseColors.length]);
    },

    /**
     * Get status color based on value threshold
     * @param value Numeric value to evaluate
     * @param thresholds Object with warning/error thresholds
     * @returns Hex color string (success/warning/error)
     * 
     * @example
     * ```tsx
     * const chartColors = useChartColors();
     * const color = chartColors.getStatusColor(75, { warning: 50, error: 80 });
     * // Returns: warning color (value >= 50 && < 80)
     * ```
     */
    getStatusColor: (value: number, thresholds?: { warning?: number; error?: number }): string => {
      if (thresholds?.error !== undefined && value >= thresholds.error) {
        return colors.error;
      }
      if (thresholds?.warning !== undefined && value >= thresholds.warning) {
        return colors.warning;
      }
      return colors.success;
    },
  };
}
