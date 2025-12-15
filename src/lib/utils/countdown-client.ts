/**
 * Client-Side Countdown Timer Utilities
 * 
 * Pure client-side countdown calculations for real-time countdown display.
 * These functions mirror server-side logic in countdown-service.ts but work
 * in browser environment without database dependencies.
 */

import type { CountdownTimer } from '@/types/countdown';

/**
 * Calculate countdown timer state from expiresAt timestamp
 * Client-side version of server-side calculateCountdown function
 * 
 * @param expiresAt - UTC timestamp when lead expires (ISO string or Date)
 * @param leadId - Lead identifier
 * @returns CountdownTimer state or null if no expiry set
 */
export function calculateCountdown(
  expiresAt: string | Date | null,
  leadId: string
): CountdownTimer | null {
  if (!expiresAt) {
    return null;
  }

  const expiryDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const millisecondsRemaining = expiryDate.getTime() - now.getTime();
  
  const isExpired = millisecondsRemaining <= 0;
  
  // Calculate days and hours
  const totalHoursRemaining = Math.floor(millisecondsRemaining / (1000 * 60 * 60));
  const daysRemaining = Math.floor(totalHoursRemaining / 24);
  const hoursRemaining = totalHoursRemaining % 24;
  
  // Generate display text
  const displayText = getDisplayText(daysRemaining, hoursRemaining, isExpired);
  
  // Get color class based on time remaining
  const colorClass = getColorClass(daysRemaining, isExpired);
  
  // Calculate progress percentage (assumes 7 days default countdown)
  const defaultCountdownDays = 7;
  const progressPercent = isExpired 
    ? 0 
    : Math.max(0, Math.min(100, (daysRemaining / defaultCountdownDays) * 100));

  return {
    leadId,
    expiresAt: expiryDate,
    isExpired,
    daysRemaining: Math.max(0, daysRemaining),
    hoursRemaining: Math.max(0, hoursRemaining),
    millisecondsRemaining: Math.max(0, millisecondsRemaining),
    displayText,
    colorClass,
    progressPercent,
  };
}

/**
 * Get color class based on days remaining
 * 
 * Color coding logic:
 * - Green: 6+ days remaining (safe zone)
 * - Yellow: 3-5 days remaining (warning zone)
 * - Red: 0-2 days remaining (urgent zone)
 * 
 * @param daysRemaining - Number of days until expiry
 * @param isExpired - Whether lead has already expired
 * @returns Color class for styling
 */
function getColorClass(
  daysRemaining: number,
  isExpired: boolean
): 'green' | 'yellow' | 'red' {
  if (isExpired) {
    return 'red';
  }
  
  if (daysRemaining >= 6) {
    return 'green';
  } else if (daysRemaining >= 3) {
    return 'yellow';
  } else {
    return 'red';
  }
}

/**
 * Get human-readable display text
 * 
 * Display formats:
 * -"7 days left" (plural for 2+ days)
 * -"1 day left" (singular)
 * -"< 1 day left" (less than 24 hours)
 * -"Expired" (countdown reached zero)
 * 
 * @param daysRemaining - Number of days until expiry
 * @param hoursRemaining - Number of hours in current day
 * @param isExpired - Whether lead has already expired
 * @returns Display text
 */
function getDisplayText(
  daysRemaining: number,
  hoursRemaining: number,
  isExpired: boolean
): string {
  if (isExpired) {
    return 'Expired';
  }
  
  if (daysRemaining === 0) {
    return '< 1 day left';
  } else if (daysRemaining === 1) {
    return '1 day left';
  } else {
    return `${daysRemaining} days left`;
  }
}

/**
 * Format countdown for accessibility (screen readers)
 * 
 * @param countdown - Countdown timer state
 * @returns Accessible text description
 */
export function getAccessibleText(countdown: CountdownTimer): string {
  if (countdown.isExpired) {
    return 'This lead has expired';
  }
  
  const urgency = countdown.colorClass === 'red' 
    ? 'Urgent: ' 
    : countdown.colorClass === 'yellow' 
      ? 'Warning: ' 
      : '';
  
  return `${urgency}${countdown.displayText}`;
}

/**
 * PHASE 4.5: Enhanced Live Countdown Functions
 * ==================================================
 */

/**
 * Live countdown state with detailed time breakdown
 */
export interface LiveCountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  progressPercent: number;
  colorClass: 'green' | 'yellow' | 'red' | 'expired';
  isExpired: boolean;
  displayText: string;
}

/**
 * Calculate live countdown with full time breakdown (days, hours, minutes, seconds)
 * Updates every second for real-time display
 * 
 * @param expiresAt - UTC timestamp when lead expires (ISO string or Date)
 * @param initialCountdownDays - Original countdown duration in days (default 7)
 * @returns Live countdown state with detailed time units
 */
export function calculateLiveCountdown(
  expiresAt: string | Date | null,
  initialCountdownDays: number = 7
): LiveCountdownState | null {
  if (!expiresAt) {
    return null;
  }

  const expiryDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const millisecondsRemaining = expiryDate.getTime() - now.getTime();
  
  const isExpired = millisecondsRemaining <= 0;
  
  if (isExpired) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      progressPercent: 0,
      colorClass: 'expired',
      isExpired: true,
      displayText: 'EXPIRED',
    };
  }
  
  // Convert milliseconds to total seconds
  const totalSeconds = Math.floor(millisecondsRemaining / 1000);
  
  // Break down into days, hours, minutes, seconds
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  
  // Calculate progress percentage based on initial countdown duration
  const initialTotalSeconds = initialCountdownDays * 24 * 60 * 60;
  const progressPercent = Math.max(0, Math.min(100, (totalSeconds / initialTotalSeconds) * 100));
  
  // Get color class based on days remaining
  const colorClass = getColorClass(days, false);
  
  // Format display text:"Xd Yh Zm Ws remaining"
  const displayText = formatLiveCountdown(days, hours, minutes, seconds);
  
  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    progressPercent,
    colorClass,
    isExpired: false,
    displayText,
  };
}

/**
 * Format live countdown display text
 * Format:"Xd Yh Zm Ws remaining"
 * 
 * Formatting rules:
 * - >= 1 day:"Xd Yh Zm Ws remaining"
 * - < 1 day, >= 1 hour:"Xh Ym Zs remaining"
 * - < 1 hour:"Xm Ys remaining"
 * - < 1 minute:"Xs remaining"
 * 
 * @param days - Days remaining
 * @param hours - Hours remaining in current day
 * @param minutes - Minutes remaining in current hour
 * @param seconds - Seconds remaining in current minute
 * @returns Formatted display text
 */
export function formatLiveCountdown(
  days: number,
  hours: number,
  minutes: number,
  seconds: number
): string {
  if (days >= 1) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
  } else if (hours >= 1) {
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  } else if (minutes >= 1) {
    return `${minutes}m ${seconds}s remaining`;
  } else {
    return `${seconds}s remaining`;
  }
}

/**
 * Get accessible text for live countdown
 * 
 * @param state - Live countdown state
 * @returns Accessible description for screen readers
 */
export function getLiveAccessibleText(state: LiveCountdownState): string {
  if (state.isExpired) {
    return 'This lead has expired and is no longer available';
  }
  
  const urgency = state.colorClass === 'red' 
    ? 'Urgent: ' 
    : state.colorClass === 'yellow' 
      ? 'Warning: ' 
      : '';
  
  const parts: string[] = [];
  if (state.days > 0) parts.push(`${state.days} ${state.days === 1 ? 'day' : 'days'}`);
  if (state.hours > 0) parts.push(`${state.hours} ${state.hours === 1 ? 'hour' : 'hours'}`);
  if (state.minutes > 0) parts.push(`${state.minutes} ${state.minutes === 1 ? 'minute' : 'minutes'}`);
  if (state.seconds > 0) parts.push(`${state.seconds} ${state.seconds === 1 ? 'second' : 'seconds'}`);
  
  return `${urgency}${parts.join(', ')} remaining until lead expires`;
}
