'use client';

import { useState, useEffect } from 'react';

/**
 * Breakpoint definitions matching Tailwind CSS defaults
 */
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook to detect current breakpoint and return appropriate spacing values
 * 
 * @example
 * ```tsx
 * const { breakpoint, getSpacing } = useResponsiveSpacing();
 * 
 * // Get mobile/desktop variant
 * const padding = getSpacing({ mobile: '12px', desktop: '24px' });
 * 
 * // Or use breakpoint directly
 * if (breakpoint === 'mobile') {
 *   // Mobile-specific logic
 * }
 * ```
 */
export function useResponsiveSpacing() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < breakpoints.tablet) {
        setBreakpoint('mobile');
      } else if (width < breakpoints.desktop) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Listen for window resize
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  /**
   * Get spacing value based on current breakpoint
   * 
   * @param spacing - Object with mobile/tablet/desktop spacing values
   * @returns Current breakpoint's spacing value
   */
  const getSpacing = (spacing: {
    mobile: string | number;
    tablet?: string | number;
    desktop: string | number;
  }): string | number => {
    if (breakpoint === 'mobile') {
      return spacing.mobile;
    }
    if (breakpoint === 'tablet') {
      return spacing.tablet ?? spacing.desktop;
    }
    return spacing.desktop;
  };

  /**
   * Check if current viewport is mobile
   */
  const isMobile = breakpoint === 'mobile';

  /**
   * Check if current viewport is tablet
   */
  const isTablet = breakpoint === 'tablet';

  /**
   * Check if current viewport is desktop
   */
  const isDesktop = breakpoint === 'desktop';

  return {
    breakpoint,
    getSpacing,
    isMobile,
    isTablet,
    isDesktop,
  };
}
