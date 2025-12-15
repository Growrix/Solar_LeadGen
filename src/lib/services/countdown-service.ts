/**
 * Countdown Timer Service
 * 
 * Provides server-side countdown timer calculations for lead expiry.
 * All calculations use UTC timestamps to avoid timezone inconsistencies.
 * 
 * Teaching Notes:
 * - Countdown calculations happen on server to ensure consistency
 * - Color thresholds: green (6+ days), yellow (3-5 days), red (1-2 days)
 * - Progress percentage calculated from original duration (default 7 days)
 */

import type { CountdownTimer, CountdownValidationResult } from '@/types/countdown';

/**
 * Calculate countdown timer state from expiry timestamp
 * 
 * @param expiresAt - UTC timestamp when lead expires (null = no countdown)
 * @returns CountdownTimer object or null if no expiry set
 * 
 * Teaching: This runs on server for each lead fetch. Client displays result.
 */
export function calculateCountdown(expiresAt: Date | null): CountdownTimer | null {
  // No countdown if expiresAt is null
  if (!expiresAt) {
    return null;
  }

  const now = new Date();
  const expiryTime = new Date(expiresAt);
  
  // Calculate time difference in milliseconds
  const millisecondsRemaining = expiryTime.getTime() - now.getTime();
  
  // Check if expired
  const isExpired = millisecondsRemaining <= 0;
  
  // Calculate days and hours remaining
  const daysRemaining = Math.floor(millisecondsRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((millisecondsRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // Get display text
  const displayText = getDisplayText(daysRemaining, hoursRemaining);
  
  // Get color class based on days remaining
  const colorClass = getColorClass(daysRemaining);
  
  // Calculate progress percentage (assume 7 days as default duration)
  // Teaching: Progress bar shows how much time is left vs original duration
  const defaultDuration = 7; // days
  const progressPercent = isExpired 
    ? 0 
    : Math.max(0, Math.min(100, (daysRemaining / defaultDuration) * 100));

  return {
    leadId: '', // Will be set by caller
    expiresAt: expiryTime,
    isExpired,
    daysRemaining: Math.max(0, daysRemaining),
    hoursRemaining: Math.max(0, hoursRemaining),
    millisecondsRemaining: Math.max(0, millisecondsRemaining),
    displayText,
    colorClass,
    progressPercent: Math.round(progressPercent),
  };
}

/**
 * Calculate future expiry timestamp from countdown days
 * 
 * @param countdownDays - Number of days until expiry (1-90)
 * @returns Future UTC timestamp
 * 
 * Teaching: Adds days to current time. Result is stored in Lead.expiresAt field.
 */
export function calculateExpiresAt(countdownDays: number): Date {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + countdownDays * 24 * 60 * 60 * 1000);
  return expiresAt;
}

/**
 * Validate countdown duration is within allowed range
 * 
 * @param days - Duration in days to validate
 * @returns Validation result with error message if invalid
 * 
 * Teaching: Business rule - countdown must be 1-90 days (spec requirement FR-017)
 */
export function validateCountdownDuration(days: number): CountdownValidationResult {
  // Check if number is valid
  if (typeof days !== 'number' || isNaN(days)) {
    return {
      isValid: false,
      error: 'Countdown duration must be a valid number',
    };
  }

  // Check if integer
  if (!Number.isInteger(days)) {
    return {
      isValid: false,
      error: 'Countdown duration must be a whole number',
    };
  }

  // Check minimum (1 day)
  if (days < 1) {
    return {
      isValid: false,
      error: 'Countdown duration must be at least 1 day',
    };
  }

  // Check maximum (90 days)
  if (days > 90) {
    return {
      isValid: false,
      error: 'Countdown duration cannot exceed 90 days',
    };
  }

  return { isValid: true };
}

/**
 * Get color class for countdown display based on days remaining
 * 
 * @param daysRemaining - Days until expiry
 * @returns Color class ('green' | 'yellow' | 'red')
 * 
 * Teaching: Visual urgency indicator
 * - Green (6+ days): Plenty of time, low urgency
 * - Yellow (3-5 days): Moderate urgency, installers should act soon
 * - Red (1-2 days): High urgency, expiring soon
 */
export function getColorClass(daysRemaining: number): 'green' | 'yellow' | 'red' {
  if (daysRemaining >= 6) {
    return 'green';
  } else if (daysRemaining >= 3) {
    return 'yellow';
  } else {
    return 'red';
  }
}

/**
 * Get human-readable display text for countdown
 * 
 * @param daysRemaining - Days until expiry
 * @param hoursRemaining - Hours remaining in current day
 * @returns Display text (e.g.,"7 days left","1 day left","< 1 day left")
 * 
 * Teaching: User-facing text, not technical timestamps
 */
export function getDisplayText(daysRemaining: number, hoursRemaining: number): string {
  if (daysRemaining > 1) {
    return `${daysRemaining} days left`;
  } else if (daysRemaining === 1) {
    return '1 day left';
  } else if (hoursRemaining > 0) {
    return '< 1 day left';
  } else {
    return 'Expired';
  }
}
