# Data Model: Lead Expiry Countdown Timer

**Feature**: 003-countdown-timer-for  
**Date**: October 22, 2025  
**Status**: Data Model Complete

## Overview

This feature leverages the existing Lead model's `expiresAt` field to implement countdown timers. No new database models are required. This document defines the countdown-related data structures, validation rules, and state transitions.

---

## Existing Models (No Changes Required)

### Lead Model (Existing - Already in schema.prisma)

```prisma
model Lead {
  id                    String            @id @default(cuid())
  homeownerId           String
  installerId           String?
  status                LeadStatus        @default(DRAFT)
  visibility            LeadVisibility    @default(HIDDEN)
  
  // ... other existing fields ...
  
  expiresAt             DateTime?         // ✅ LEVERAGE THIS FIELD FOR COUNTDOWN
  approvedAt            DateTime?
  purchasedAt           DateTime?
  
  // ... relations ...
  
  @@index([expiresAt])
  @@map("leads")
}
```

**Countdown Timer Usage**:
- `expiresAt`: When null, lead has no countdown timer (indefinite)
- `expiresAt`: When set, lead has active countdown timer
- Countdown calculation: `expiresAt - currentTime`
- Auto-expire when: `currentTime >= expiresAt`

**Validation Rules**:
- `expiresAt` must be future date when set (not in the past)
- `expiresAt` must be within 1-90 days from approval date
- `expiresAt` is UTC timestamp (handles timezone correctly)
- `expiresAt` can be null (optional countdown)

**State Transitions**:
```
Lead Status Transitions with Countdown:

PENDING_APPROVAL → APPROVED (with expiresAt set)
  ↓
  Time passes...
  ↓
APPROVED (countdown active) → EXPIRED (when currentTime >= expiresAt)
  ↓
  Admin reactivates
  ↓
EXPIRED → APPROVED (with new expiresAt set)

Special Cases:
APPROVED → PURCHASED (CALL_VISIT/WRITTEN_QUOTE)
  ↓
  expiresAt set to null (countdown disabled)
  
APPROVED (BIDDING) → PURCHASED
  ↓
  expiresAt remains (countdown stays active)
```

---

## TypeScript Types (New)

### CountdownTimer Type

```typescript
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
  displayText: string; // "7 days left", "1 day left", "< 1 day left"
  
  /** Color class for visual feedback */
  colorClass: 'green' | 'yellow' | 'red';
  
  /** Progress percentage (0-100) */
  progressPercent: number;
}
```

**Usage Example**:
```typescript
const countdown = calculateCountdown(lead.expiresAt);
// {
//   leadId: 'lead123',
//   expiresAt: 2025-10-29T12:00:00.000Z,
//   isExpired: false,
//   daysRemaining: 7,
//   hoursRemaining: 4,
//   millisecondsRemaining: 604800000,
//   displayText: '7 days left',
//   colorClass: 'green',
//   progressPercent: 100
// }
```

---

### CountdownManagementAction Type

```typescript
/**
 * Admin countdown timer management actions
 */
export type CountdownAction = 
  | 'add'        // Add countdown to lead without timer
  | 'reset'      // Reset countdown to new duration
  | 'remove'     // Remove countdown (set expiresAt to null)
  | 'reactivate' // Reactivate expired lead with countdown;

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
```

---

### Lead Approval with Countdown

```typescript
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
```

---

### Lead Reactivation

```typescript
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
    approvedAt: Date;
  };
  
  /** Countdown timer state */
  countdown: CountdownTimer;
  
  /** Error message if failed */
  error?: string;
}
```

---

## Validation Rules

### Countdown Duration Validation

```typescript
/**
 * Validate countdown duration
 * 
 * @param days - Countdown duration in days
 * @returns Validation result
 */
export function validateCountdownDuration(days: number): {
  isValid: boolean;
  error?: string;
} {
  if (days < 1) {
    return { isValid: false, error: 'Countdown duration must be at least 1 day' };
  }
  
  if (days > 90) {
    return { isValid: false, error: 'Countdown duration cannot exceed 90 days' };
  }
  
  if (!Number.isInteger(days)) {
    return { isValid: false, error: 'Countdown duration must be a whole number' };
  }
  
  return { isValid: true };
}
```

### ExpiresAt Validation

```typescript
/**
 * Validate expiresAt timestamp
 * 
 * @param expiresAt - Expiry timestamp
 * @returns Validation result
 */
export function validateExpiresAt(expiresAt: Date | null): {
  isValid: boolean;
  error?: string;
} {
  // Null is valid (no countdown)
  if (expiresAt === null) {
    return { isValid: true };
  }
  
  // Must be future date
  if (expiresAt <= new Date()) {
    return { isValid: false, error: 'Expiry date must be in the future' };
  }
  
  // Must be within 90 days
  const maxExpiryDate = new Date();
  maxExpiryDate.setDate(maxExpiryDate.getDate() + 90);
  
  if (expiresAt > maxExpiryDate) {
    return { isValid: false, error: 'Expiry date cannot be more than 90 days in the future' };
  }
  
  return { isValid: true };
}
```

---

## Settings (New Entry Required)

### Countdown Default Setting

**Add to prisma/seed-settings.ts**:

```typescript
{
  key: 'LEAD_COUNTDOWN_DEFAULT_DAYS',
  value: '7',
  type: 'number',
  category: 'leads',
  description: 'Default countdown timer duration (in days) when admin approves a lead',
  isPublic: false
}
```

**Usage**:
```typescript
import { getSettingAsNumber } from '@/lib/services/settings-service';

const defaultDays = await getSettingAsNumber('LEAD_COUNTDOWN_DEFAULT_DAYS'); // Returns: 7
```

---

## Audit Log Actions (New)

### New Audit Actions for Countdown Timer

**Add to src/lib/services/audit-logger.ts**:

```typescript
export const AUDIT_ACTIONS = {
  // ... existing actions ...
  
  // NEW: Countdown timer actions
  COUNTDOWN_TIMER_ADDED: 'countdown_timer_added',
  COUNTDOWN_TIMER_RESET: 'countdown_timer_reset',
  COUNTDOWN_TIMER_REMOVED: 'countdown_timer_removed',
  LEAD_REACTIVATED: 'lead_reactivated',
} as const;
```

**Audit Log Metadata Structure**:

```typescript
// countdown_timer_added
{
  action: 'countdown_timer_added',
  entityType: 'lead',
  entityId: 'lead123',
  leadId: 'lead123',
  userId: 'admin123',
  metadata: {
    countdownDays: 7,
    expiresAt: '2025-10-29T12:00:00.000Z',
    approvalContext: true // Added during approval
  }
}

// countdown_timer_reset
{
  action: 'countdown_timer_reset',
  entityType: 'lead',
  entityId: 'lead123',
  leadId: 'lead123',
  userId: 'admin123',
  metadata: {
    oldExpiresAt: '2025-10-29T12:00:00.000Z',
    newExpiresAt: '2025-11-05T12:00:00.000Z',
    countdownDays: 14,
    reason: 'Homeowner requested extension'
  }
}

// countdown_timer_removed
{
  action: 'countdown_timer_removed',
  entityType: 'lead',
  entityId: 'lead123',
  leadId: 'lead123',
  userId: 'admin123',
  metadata: {
    oldExpiresAt: '2025-10-29T12:00:00.000Z',
    reason: 'Lead purchased by installer'
  }
}

// lead_reactivated
{
  action: 'lead_reactivated',
  entityType: 'lead',
  entityId: 'lead123',
  leadId: 'lead123',
  userId: 'admin123',
  metadata: {
    oldStatus: 'EXPIRED',
    newStatus: 'APPROVED',
    countdownDays: 7,
    expiresAt: '2025-10-29T12:00:00.000Z',
    reason: 'Installer requested more time'
  }
}
```

---

## Notification Types (Existing - No Changes)

### Lead Expiry Notification (Already Exists)

The existing notification system already supports lead expiry notifications:

```typescript
// Notification type already in NotificationType enum
type: 'LEAD_APPROVED' // Used for reactivation notifications

// Create notification when lead expires (already implemented in lead-state.ts)
await createNotification({
  userId: lead.homeownerId,
  type: 'SYSTEM', // Or create new LEAD_EXPIRED type
  title: 'Lead Expired',
  message: `Your lead for ${lead.location} has expired after ${countdownDays} days`,
  actionUrl: `/homeowner/leads/${leadId}`,
  metadata: { leadId, expiredAfterDays: countdownDays }
});
```

---

## Countdown Calculation Logic

### Server-Side Utility Functions

```typescript
/**
 * Calculate countdown timer state from expiresAt timestamp
 * 
 * @param expiresAt - Lead expiry timestamp (UTC)
 * @returns Countdown timer state
 */
export function calculateCountdown(expiresAt: Date | null): CountdownTimer | null {
  // No countdown if expiresAt is null
  if (!expiresAt) return null;
  
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  
  // Calculate time components
  const isExpired = diffMs <= 0;
  const millisecondsRemaining = Math.max(0, diffMs);
  const daysRemaining = Math.floor(millisecondsRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((millisecondsRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // Determine display text
  let displayText: string;
  if (isExpired) {
    displayText = 'Expired';
  } else if (daysRemaining === 0) {
    displayText = '< 1 day left';
  } else if (daysRemaining === 1) {
    displayText = '1 day left';
  } else {
    displayText = `${daysRemaining} days left`;
  }
  
  // Determine color class (green 6+, yellow 3-5, red 1-2)
  let colorClass: 'green' | 'yellow' | 'red';
  if (isExpired || daysRemaining <= 2) {
    colorClass = 'red';
  } else if (daysRemaining >= 3 && daysRemaining <= 5) {
    colorClass = 'yellow';
  } else {
    colorClass = 'green';
  }
  
  // Calculate progress percentage (assuming initial duration from approval)
  // This requires knowing original countdown duration (store in metadata or settings)
  const progressPercent = isExpired ? 0 : Math.min(100, (daysRemaining / 7) * 100);
  
  return {
    expiresAt,
    isExpired,
    daysRemaining,
    hoursRemaining,
    millisecondsRemaining,
    displayText,
    colorClass,
    progressPercent
  };
}

/**
 * Calculate expiresAt timestamp from countdown days
 * 
 * @param countdownDays - Countdown duration in days
 * @returns Future timestamp (UTC)
 */
export function calculateExpiresAt(countdownDays: number): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + countdownDays);
  return expiresAt;
}
```

---

## Quote Type Behavior

### Countdown Timer Behavior by Quote Type

| Quote Type | Purchase Behavior | Countdown After Purchase |
|------------|-------------------|-------------------------|
| **CALL_VISIT** | Timer disabled on purchase | `expiresAt` set to `null` |
| **WRITTEN_QUOTE** | Timer disabled on purchase | `expiresAt` set to `null` |
| **BIDDING** | Timer remains active | `expiresAt` unchanged |

**Implementation Logic**:

```typescript
// In lead purchase function (lead-service.ts)
export async function purchaseLead(leadId: string, installerId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  
  const updateData: any = {
    status: 'PURCHASED',
    installerId,
    purchasedAt: new Date()
  };
  
  // Disable countdown for CALL_VISIT and WRITTEN_QUOTE
  if (lead.quoteType === 'CALL_VISIT' || lead.quoteType === 'WRITTEN_QUOTE') {
    updateData.expiresAt = null;
  }
  // BIDDING leads keep expiresAt (countdown remains)
  
  await prisma.lead.update({ where: { id: leadId }, data: updateData });
}
```

---

## Data Flow Summary

### Lead Approval Flow with Countdown

```
1. Admin clicks "Approve" on lead
   ↓
2. Modal shows countdown options:
   - [ ] Enable countdown timer (checked by default)
   - Duration: [7] days (1-90 range)
   ↓
3. Admin submits approval
   ↓
4. API validates countdown duration (1-90 days)
   ↓
5. Calculate expiresAt = now + countdownDays * 24 hours
   ↓
6. Update lead: status = APPROVED, expiresAt = calculated, approvedAt = now
   ↓
7. Create audit log: COUNTDOWN_TIMER_ADDED
   ↓
8. Return success + countdown state
   ↓
9. UI displays countdown timer on lead card (all dashboards)
```

### Countdown Expiry Flow

```
1. Cron job runs hourly
   ↓
2. Query leads: status = APPROVED, expiresAt < now
   ↓
3. For each expired lead:
   - Transition status: APPROVED → EXPIRED
   - Set visibility: PUBLIC → HIDDEN
   - Create audit log: LEAD_STATUS_CHANGED
   - Send notification to homeowner
   ↓
4. Log: "Expired {count} leads with countdown timers"
```

### Lead Reactivation Flow

```
1. Admin views expired lead details
   ↓
2. Clicks "Reactivate" button
   ↓
3. Modal prompts: Countdown duration: [7] days
   ↓
4. Admin submits reactivation
   ↓
5. API validates countdown duration
   ↓
6. Calculate new expiresAt = now + countdownDays * 24 hours
   ↓
7. Update lead: status = APPROVED, expiresAt = calculated, visibility = PUBLIC
   ↓
8. Create audit log: LEAD_REACTIVATED
   ↓
9. Send notification to homeowner: "Lead reactivated with {days} countdown"
   ↓
10. Return success + countdown state
```

---

## Summary

**No Database Changes Required**: Feature leverages existing `expiresAt` field in Lead model.

**New TypeScript Types**:
- `CountdownTimer` - Countdown state and display info
- `CountdownManagementRequest/Response` - Admin management payloads
- `LeadApprovalRequest` (extended) - Add countdown options
- `LeadReactivationRequest/Response` - Reactivation payloads

**New Settings**:
- `LEAD_COUNTDOWN_DEFAULT_DAYS` = 7

**New Audit Actions**:
- `countdown_timer_added`
- `countdown_timer_reset`
- `countdown_timer_removed`
- `lead_reactivated`

**Validation Rules**:
- Countdown duration: 1-90 days
- ExpiresAt: Must be future date, within 90 days
- Admin-only actions: Role verification required

**Ready for Phase 1b**: API contract design (OpenAPI specification).
