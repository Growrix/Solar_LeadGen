/**
 * Countdown Timer Types
 * 
 * Type definitions for the lead expiry countdown timer feature.
 * Countdown calculations happen server-side to ensure consistency across timezones.
 */

/**
 * Countdown timer state and display information
 * Calculated server-side to ensure consistency
 */
export interface CountdownTimer {
  /** Lead ID this countdown belongs to */
  leadId: string;
  
  /** Original expiry timestamp (UTC) */
  expiresAt: Date | null;
  
  /** Whether lead has expired */
  isExpired: boolean;
  
  /** Days remaining (rounded down) */
  daysRemaining: number;
  
  /** Hours remaining in current day */
  hoursRemaining: number;
  
  /** Total milliseconds remaining */
  millisecondsRemaining: number;
  
  /** Human-readable display text */
  displayText: string; //"7 days left","1 day left","< 1 day left"
  
  /** Color class for visual feedback */
  colorClass: 'green' | 'yellow' | 'red';
  
  /** Progress percentage (0-100) */
  progressPercent: number;
}

/**
 * Admin countdown timer management actions
 */
export type CountdownAction = 
  | 'add'        // Add countdown to lead without timer
  | 'reset'      // Reset countdown to new duration
  | 'remove'     // Remove countdown (set expiresAt to null)
  | 'reactivate'; // Reactivate expired lead with countdown

/**
 * Countdown management request payload
 */
export interface CountdownManagementRequest {
  /** Action to perform */
  action: CountdownAction;
  
  /** Countdown duration in days (1-90) */
  countdownDays?: number; // Required for 'add', 'reset', 'reactivate'
  
  /** Admin performing the action (from session) */
  adminId: string;
  
  /** Optional reason for action (for audit log) */
  reason?: string;
}

/**
 * Countdown management response
 */
export interface CountdownManagementResponse {
  /** Success status */
  success: boolean;
  
  /** Updated expiresAt timestamp */
  expiresAt: Date | null;
  
  /** Countdown state after action */
  countdown: CountdownTimer | null;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Lead approval request payload (extends existing)
 */
export interface LeadApprovalRequest {
  /** Existing approval fields */
  price?: number;
  assignTo?: 'ALL' | string[];
  isHot?: boolean;
  
  /** NEW: Countdown timer fields */
  enableCountdown?: boolean;      // Default: true
  countdownDays?: number;          // Default: 7 (1-90 range)
}

/**
 * Lead approval response (extends existing)
 */
export interface LeadApprovalResponse {
  /** Success status */
  success: boolean;
  
  /** Updated lead */
  lead: {
    id: string;
    status: 'APPROVED';
    approvedAt: Date;
    expiresAt: Date | null;  // Set if countdown enabled
    // ... other lead fields
  };
  
  /** Countdown timer state (if enabled) */
  countdown?: CountdownTimer;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Lead reactivation request payload
 */
export interface LeadReactivationRequest {
  /** Countdown duration for reactivated lead (1-90 days) */
  countdownDays?: number; // Default: 7
  
  /** Optional reason for reactivation */
  reason?: string;
}

/**
 * Lead reactivation response
 */
export interface LeadReactivationResponse {
  /** Success status */
  success: boolean;
  
  /** Reactivated lead */
  lead: {
    id: string;
    status: 'APPROVED';
    visibility: 'PUBLIC';
    expiresAt: Date;
    // ... other lead fields
  };
  
  /** Countdown timer state */
  countdown: CountdownTimer;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Countdown duration validation result
 */
export interface CountdownValidationResult {
  /** Whether the duration is valid */
  isValid: boolean;
  
  /** Error message if invalid */
  error?: string;
}
