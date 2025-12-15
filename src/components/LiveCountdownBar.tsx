'use client';

/**
 * LiveCountdownBar Component - Phase 4.5
 * 
 * Enhanced countdown timer with live updates every second.
 * Displays"Xd Yh Zm Ws remaining" format with full-width progress bar.
 * 
 * Features:
 * - Live updates every 1 second (not 10 seconds)
 * - Full time breakdown: days, hours, minutes, seconds
 * - Full-width progress bar at top of lead card
 * - Color-coded: green (6+ days), yellow (3-5 days), red (1-2 days)
 * - Performance optimized: pauses when tab inactive
 * - Accessible: ARIA labels, screen reader support
 * - Dark mode support
 */

import { useEffect, useState, useRef } from 'react';
import { calculateLiveCountdown, getLiveAccessibleText, type LiveCountdownState } from '@/lib/utils/countdown-client';

interface LiveCountdownBarProps {
  /** UTC timestamp when lead expires (ISO string) */
  expiresAt: string | null;
  
  /** Lead identifier */
  leadId: string;
  
  /** Display position */
  position?: 'top' | 'inline';
  
  /** Initial countdown duration in days (for progress calculation) */
  initialDays?: number;
  
  /** Optional: Lead status (for conditional display logic) */
  leadStatus?: string;
  
  /** Optional: Quote type (for conditional display logic) */
  quoteType?: string;
}

/**
 * LiveCountdownBar Component
 * 
 * Renders a live countdown timer that updates every second.
 * Shows"Xd Yh Zm Ws remaining" format with progress bar.
 */
export function LiveCountdownBar({
  expiresAt,
  leadId,
  position = 'top',
  initialDays = 7,
  leadStatus,
  quoteType,
}: LiveCountdownBarProps) {
  const [countdown, setCountdown] = useState<LiveCountdownState | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set up live countdown with 1-second interval
  useEffect(() => {
    if (!expiresAt) {
      setCountdown(null);
      return;
    }

    // Update countdown state
    const updateCountdown = () => {
      const newCountdown = calculateLiveCountdown(expiresAt, initialDays);
      setCountdown(newCountdown);
    };

    // Initial calculation
    updateCountdown();

    // Update every 1 second for live countdown
    intervalRef.current = setInterval(updateCountdown, 1000);

    // Pause/resume based on page visibility (battery optimization)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause updates when tab inactive
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Resume updates when tab active
        updateCountdown(); // Immediate update
        intervalRef.current = setInterval(updateCountdown, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [expiresAt, initialDays]);

  // Hide countdown if no expiresAt set
  if (!expiresAt || !countdown) {
    return null;
  }

  // Hide countdown for purchased CALL_VISIT/WRITTEN_QUOTE leads
  // (BIDDING leads keep countdown visible)
  if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
    return null;
  }

  // Color classes for Tailwind - Using centralized theme system
  const colorClasses = {
    green: {
      bg: 'bg-success',
      text: 'text-foreground',
      trackBg: 'bg-success/10',
    },
    yellow: {
      bg: 'bg-warning',
      text: 'text-foreground',
      trackBg: 'bg-warning/10',
    },
    red: {
      bg: 'bg-error',
      text: 'text-foreground',
      trackBg: 'bg-error/10',
    },
    expired: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      trackBg: 'bg-muted/50',
    },
  };

  const colors = colorClasses[countdown.colorClass];
  const accessibleText = getLiveAccessibleText(countdown);

  // Top position: Full-width bar at top of lead card
  if (position === 'top') {
    return (
      <div
        className="w-full rounded-t-lg overflow-hidden"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={accessibleText}
      >
        {/* Progress bar background with text overlay */}
        <div className={`relative h-10 ${colors.trackBg}`}>
          {/* Progress bar foreground */}
          <div
            className={`absolute inset-0 ${colors.bg} transition-colors duration-1000 ease-linear`}
            style={{ width: `${countdown.progressPercent}%` }}
            aria-hidden="true"
          />
          
          {/* Text overlay (always visible) */}
          <div className={`relative z-10 h-full flex items-center justify-center px-4 ${colors.text}`}>
            <span className="text-label tracking-wide">
              {countdown.displayText}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Inline position: Compact countdown for table cells
  return (
    <div
      className="inline-flex items-center gap-2"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={accessibleText}
    >
      {/* Color indicator dot */}
      <span
        className={`h-2.5 w-2.5 rounded-full ${colors.bg}`}
        aria-hidden="true"
      />
      
      {/* Countdown text */}
      <span className={`text-body-small ${colors.text}`}>
        {countdown.displayText}
      </span>
      
      {/* Mini progress bar */}
      <div className={`w-16 h-1.5 rounded-full overflow-hidden ${colors.trackBg}`}>
        <div
          className={`h-full ${colors.bg} transition-colors duration-1000 ease-linear`}
          style={{ width: `${countdown.progressPercent}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/**
 * Compact variant for table cells and inline display
 * Alias for LiveCountdownBar with position="inline"
 */
export function LiveCountdownBarCompact(props: Omit<LiveCountdownBarProps, 'position'>) {
  return <LiveCountdownBar {...props} position="inline" />;
}