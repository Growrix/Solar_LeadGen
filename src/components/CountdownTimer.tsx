'use client';

/**
 * CountdownTimer Component
 * 
 * Displays a visual countdown timer for leads with expiry dates.
 * Features:
 * - Auto-updates every 10 seconds
 * - Color-coded progress bar (green/yellow/red)
 * - Responsive design with dark mode support
 * - Accessible with ARIA labels
 */

import { useEffect, useState } from 'react';
import { calculateCountdown, getAccessibleText } from '@/lib/utils/countdown-client';
import type { CountdownTimer as CountdownTimerType } from '@/types/countdown';

interface CountdownTimerProps {
  /** UTC timestamp when lead expires (ISO string) */
  expiresAt: string | null;
  
  /** Lead identifier */
  leadId: string;
  
  /** Optional: Lead status (for conditional display logic) */
  leadStatus?: string;
  
  /** Optional: Quote type (for conditional display logic) */
  quoteType?: string;
  
  /** Optional: Compact mode for smaller displays */
  compact?: boolean;
}

/**
 * CountdownTimer Component
 * 
 * Renders a visual countdown timer with color-coded progress bar.
 * Auto-refreshes every 10 seconds to keep display accurate.
 */
export function CountdownTimer({
  expiresAt,
  leadId,
  leadStatus,
  quoteType,
  compact = false,
}: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownTimerType | null>(null);

  // Calculate countdown on mount and set up refresh interval
  useEffect(() => {
    if (!expiresAt) {
      setCountdown(null);
      return;
    }

    // Initial calculation
    const updateCountdown = () => {
      const newCountdown = calculateCountdown(expiresAt, leadId);
      setCountdown(newCountdown);
    };

    updateCountdown();

    // Refresh every 10 seconds
    const interval = setInterval(updateCountdown, 10000);

    return () => clearInterval(interval);
  }, [expiresAt, leadId]);

  // Hide countdown if no expiresAt set
  if (!expiresAt || !countdown) {
    return null;
  }

  // Hide countdown for purchased CALL_VISIT/WRITTEN_QUOTE leads
  // (BIDDING leads keep countdown visible)
  if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
    return null;
  }

  // Color mapping for Tailwind classes
  const colorClasses = {
    green: {
      bg: 'bg-success',
      text: 'text-success',
      border: 'border-success',
    },
    yellow: {
      bg: 'bg-warning',
      text: 'text-warning',
      border: 'border-warning',
    },
    red: {
      bg: 'bg-destructive',
      text: 'text-error',
      border: 'border-error',
    },
  };

  const colors = colorClasses[countdown.colorClass];
  const accessibleText = getAccessibleText(countdown);

  if (compact) {
    // Compact mode: Just text with color indicator
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-body-small ${colors.text}`}
        role="status"
        aria-label={accessibleText}
      >
        <span className={`h-2 w-2 rounded-full ${colors.bg}`} aria-hidden="true" />
        <span className="">{countdown.displayText}</span>
      </div>
    );
  }

  // Full mode: Progress bar with text
  return (
    <div
      className={`rounded-lg border ${colors.border} bg-surface p-3`}
      role="status"
      aria-label={accessibleText}
    >
      {/* Text display */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-label ${colors.text}`}>
          {countdown.displayText}
        </span>
        {countdown.isExpired && (
          <span className="text-caption text-muted-foreground">
            Lead expired
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-subtle rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colors.bg} transition-colors duration-300 ease-in-out`}
          style={{ width: `${countdown.progressPercent}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Additional info for non-expired countdowns */}
      {!countdown.isExpired && countdown.daysRemaining <= 2 && (
        <p className="text-caption text-muted-foreground mt-2">
          {countdown.hoursRemaining > 0 && (
            <>Approximately {countdown.hoursRemaining} hours remaining</>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * Compact CountdownTimer variant
 * Convenience wrapper for compact mode
 */
export function CountdownTimerCompact(props: Omit<CountdownTimerProps, 'compact'>) {
  return <CountdownTimer {...props} compact={true} />;
}