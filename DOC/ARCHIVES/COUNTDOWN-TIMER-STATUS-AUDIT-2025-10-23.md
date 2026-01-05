# Countdown Timer Status Restriction Audit
**Date**: October 23, 2025  
**Issue**: Countdown timer displaying on all lead statuses instead of APPROVED only  
**Branch**: 003-countdown-timer-for

## Problem Statement
From user feedback and screenshot analysis:
- Countdown timer is currently showing on leads with statuses: PENDING_APPROVAL, CANCELLED, APPROVED, etc.
- **Expected behavior**: Countdown timer should ONLY display on leads with status `APPROVED`

## Current Implementation Analysis

### Files Using LiveCountdownBar:
1. **Homeowner Dashboard** (`src/app/homeowner/dashboard/page.tsx`)
   - Line ~567: `{lead.expiresAt && (<LiveCountdownBar ... />)}`
   - Current condition: Shows if `expiresAt` exists (ANY status)
   - **INCORRECT**: Should only show if status is APPROVED

2. **Admin Leads Table** (`src/app/admin/leads/page.tsx`)
   - Line ~365: `{lead.expiresAt && (<LiveCountdownBar ... />)}`
   - Current condition: Shows if `expiresAt` exists (ANY status)
   - **INCORRECT**: Should only show if status is APPROVED

3. **Installer Feed** (`src/components/InstallerLeadFeed.tsx`)
   - Line ~341: Using LiveCountdownBar with mock data
   - Mock data shows various statuses
   - **INCORRECT**: Should only show if status is APPROVED

## LeadStatus Enum (from Prisma schema)
```typescript
enum LeadStatus {
  DRAFT
  PENDING_PHONE
  PENDING_APPROVAL
  APPROVED          // ← ONLY this status should show countdown
  PURCHASED
  QUOTED
  ACCEPTED
  REJECTED
  EXPIRED
  CANCELLED
  FLAGGED
}
```

## Specification Requirements
From `specs/003-countdown-timer-for/spec.md`:
- US-001: "Given admin approves a lead, countdown timer appears on lead card"
- FR-008: "System MUST change lead status from APPROVED to EXPIRED when countdown expires"
- Quickstart: "Verify countdown timers display for approved leads" (line 473)
- Quickstart: "Verify countdown timer displays on approved leads" (line 491)

**Conclusion**: Countdown timer lifecycle is:
1. Lead gets APPROVED by admin → countdown starts (if enabled)
2. Countdown runs while status = APPROVED
3. When time expires → status changes to EXPIRED
4. Countdown should NOT show on: PENDING_APPROVAL, CANCELLED, REJECTED, DRAFT, etc.

## Root Cause
The conditional rendering only checks:
```tsx
{lead.expiresAt && (<LiveCountdownBar ... />)}
```

This checks if `expiresAt` field exists, but doesn't verify the lead status is APPROVED.

## Required Fix
Update all three files to add status check:
```tsx
{lead.expiresAt && lead.status === 'APPROVED' && (<LiveCountdownBar ... />)}
```

Or using the enum:
```tsx
{lead.expiresAt && lead.status === LeadStatusEnum.APPROVED && (<LiveCountdownBar ... />)}
```

## Impact Analysis
- **Homeowner Dashboard**: Will hide countdown from pending/cancelled/rejected leads
- **Admin Table**: Will hide countdown from non-approved leads  
- **Installer Feed**: Mock data needs status filtering

This is the CORRECT behavior per specification.

## Action Plan
1. Commit current state (if needed)
2. Update homeowner dashboard conditional
3. Update admin leads table conditional
4. Update installer feed conditional
5. Test with different lead statuses
6. Commit fix with clear message

## Screenshots Evidence
From user-provided screenshots:
- Left screenshot (homeowner dashboard): Shows countdown on various statuses
- Right screenshot (admin leads table): Shows countdown on PENDING_APPROVAL (incorrect)

Both confirm countdown is incorrectly displaying on non-APPROVED leads.
