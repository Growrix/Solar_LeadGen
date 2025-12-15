# Quickstart Guide: Lead Expiry Countdown Timer

**Feature**: 003-countdown-timer-for  
**For**: Developers implementing the countdown timer feature  
**Date**: October 22, 2025

## Overview

This guide provides step-by-step instructions for implementing the lead expiry countdown timer feature. Follow these instructions in order for a smooth implementation.

---

## Prerequisites

Before starting implementation, ensure you have:

- ✅ Read `spec.md` (feature specification)
- ✅ Read `research.md` (technical decisions)
- ✅ Read `data-model.md` (data structures)
- ✅ Read `contracts/countdown-api.openapi.yaml` (API contracts)
- ✅ Development environment set up (Node.js 20.8+, PostgreSQL, npm installed)
- ✅ Project running locally (`npm run dev` works)
- ✅ Admin account created (`npm run seed:admin`)
- ✅ Existing Lead model has `expiresAt DateTime?` field (verify in `prisma/schema.prisma`)

---

## Implementation Checklist

### Phase 0: Pre-Implementation Audit (30-60 minutes)

**Purpose**: Understand existing codebase before making changes

- [ ] **Audit existing admin approval flow**
  - Read `src/app/api/leads/[id]/approve/route.ts` (lines 1-179)
  - Note: Currently sets `expiresAt` to 30 days from approval (line 89-91)
  - Understand: Body parameters, validation logic, lead update process
  
- [ ] **Audit existing expiry cron job**
  - Read `src/lib/services/lead-state.ts` lines 278-308 (`checkAllExpiredLeads()`)
  - Note: Already queries `expiresAt` field and expires leads
  - Understand: Query logic, status transition, audit logging

- [ ] **Audit existing lead purchase flow**
  - Read `src/lib/services/lead-service.ts` `purchaseLead()` function
  - Note: Where to add countdown disable logic for CALL_VISIT/WRITTEN_QUOTE
  - Understand: Purchase validation, lead update, payment processing

- [ ] **Audit existing admin lead UI**
  - Read `src/app/admin/leads/[id]/page.tsx` (lead details modal)
  - Note: Approval button (line 176-204), existing modal structure
  - Understand: Component state, API calls, success/error handling

- [ ] **Document findings**
  - Create `DOC/Records/COUNTDOWN-TIMER-AUDIT-2025-10-22.md`
  - List all files to modify with line numbers
  - Identify existing patterns to follow (API validation, audit logging, etc.)

---

### Phase 1: Backend Implementation (4-6 hours)

#### Step 1.1: Add Countdown Settings (15 minutes)

**File**: `prisma/seed-settings.ts`

- [ ] Add `LEAD_COUNTDOWN_DEFAULT_DAYS` setting:
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

- [ ] Run seed script: `npx tsx prisma/seed-settings.ts`
- [ ] Verify setting in database: `npx prisma studio` → Settings table

**Validation**: Setting appears in database with key `LEAD_COUNTDOWN_DEFAULT_DAYS`, value `7`

---

#### Step 1.2: Create Countdown TypeScript Types (30 minutes)

**File**: `src/types/countdown.ts` (NEW)

- [ ] Copy types from `data-model.md` (CountdownTimer, CountdownManagementRequest, etc.)
- [ ] Export all types
- [ ] Run TypeScript check: `npx tsc --noEmit` (must pass with 0 errors)

**Validation**: TypeScript compiles without errors, types available for import

---

#### Step 1.3: Create Countdown Service (1 hour)

**File**: `src/lib/services/countdown-service.ts` (NEW)

- [ ] Implement `calculateCountdown(expiresAt: Date | null): CountdownTimer | null`
  - Handle null expiresAt (return null)
  - Calculate days/hours remaining
  - Determine display text ("7 days left", "< 1 day left")
  - Determine color class (green/yellow/red thresholds)
  - Calculate progress percentage
  
- [ ] Implement `calculateExpiresAt(countdownDays: number): Date`
  - Add days to current date
  - Return UTC timestamp

- [ ] Implement `validateCountdownDuration(days: number): { isValid: boolean, error?: string }`
  - Check 1-90 days range
  - Check integer value
  - Return validation result

- [ ] Add JSDoc comments explaining logic

**Validation**:
```typescript
// Test in Node REPL or tsx
import { calculateCountdown } from '@/lib/services/countdown-service';

const future = new Date();
future.setDate(future.getDate() + 7);

const countdown = calculateCountdown(future);
console.log(countdown);
// Expected: { daysRemaining: 7, colorClass: 'green', displayText: '7 days left', ... }
```

---

#### Step 1.4: Update Audit Logger (15 minutes)

**File**: `src/lib/services/audit-logger.ts`

- [ ] Add new audit actions to `AUDIT_ACTIONS` constant:
  ```typescript
  COUNTDOWN_TIMER_ADDED: 'countdown_timer_added',
  COUNTDOWN_TIMER_RESET: 'countdown_timer_reset',
  COUNTDOWN_TIMER_REMOVED: 'countdown_timer_removed',
  LEAD_REACTIVATED: 'lead_reactivated',
  ```

- [ ] Export new actions

**Validation**: TypeScript compiles, new actions available for import

---

#### Step 1.5: Modify Admin Approval API (1 hour)

**File**: `src/app/api/leads/[id]/approve/route.ts`

- [ ] Update request body interface to accept:
  - `enableCountdown?: boolean` (default: true)
  - `countdownDays?: number` (default: from settings)

- [ ] Add countdown validation logic:
  ```typescript
  const { enableCountdown = true, countdownDays } = body;
  
  // Get default from settings
  const defaultDays = await getSettingAsNumber('LEAD_COUNTDOWN_DEFAULT_DAYS');
  const finalCountdownDays = countdownDays || defaultDays;
  
  // Validate countdown duration
  if (enableCountdown) {
    const validation = validateCountdownDuration(finalCountdownDays);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
  }
  ```

- [ ] Update `expiresAt` calculation (replace existing lines 89-91):
  ```typescript
  const expiresAt = enableCountdown 
    ? calculateExpiresAt(finalCountdownDays)
    : null;
  ```

- [ ] Update audit log metadata to include countdown info
- [ ] Return countdown state in response:
  ```typescript
  return NextResponse.json({
    success: true,
    lead: updatedLead,
    countdown: calculateCountdown(updatedLead.expiresAt)
  });
  ```

**Validation**:
```bash
# Test with curl or Thunder Client
curl -X POST http://localhost:3000/api/leads/{leadId}/approve \
  -H "Cookie: next-auth.session-token={token}" \
  -H "Content-Type: application/json" \
  -d '{"enableCountdown": true, "countdownDays": 10}'

# Expected: 200 OK, lead.expiresAt = 10 days from now
```

---

#### Step 1.6: Create Countdown Management API (1 hour)

**File**: `src/app/api/leads/[id]/countdown/route.ts` (NEW)

- [ ] Implement PATCH handler (reset countdown):
  - Check admin role
  - Validate countdown duration
  - Calculate new expiresAt
  - Update lead in database
  - Create audit log (COUNTDOWN_TIMER_RESET)
  - Return success + countdown state

- [ ] Implement DELETE handler (remove countdown):
  - Check admin role
  - Set expiresAt to null
  - Update lead in database
  - Create audit log (COUNTDOWN_TIMER_REMOVED)
  - Return success

**Validation**:
```bash
# Reset countdown
curl -X PATCH http://localhost:3000/api/leads/{leadId}/countdown \
  -H "Cookie: next-auth.session-token={adminToken}" \
  -H "Content-Type: application/json" \
  -d '{"countdownDays": 14}'

# Expected: 200 OK, expiresAt updated to 14 days from now

# Remove countdown
curl -X DELETE http://localhost:3000/api/leads/{leadId}/countdown \
  -H "Cookie: next-auth.session-token={adminToken}"

# Expected: 200 OK, expiresAt = null
```

---

#### Step 1.7: Create Lead Reactivation API (1 hour)

**File**: `src/app/api/leads/[id]/reactivate/route.ts` (NEW)

- [ ] Implement POST handler:
  - Check admin role
  - Verify lead status is EXPIRED
  - Validate countdown duration (default: 7 days)
  - Calculate new expiresAt
  - Update lead: status = APPROVED, visibility = PUBLIC, expiresAt = calculated
  - Create audit log (LEAD_REACTIVATED)
  - Send notification to homeowner
  - Return success + lead + countdown state

**Validation**:
```bash
# First, manually expire a lead (set expiresAt to past date in database)
# Then test reactivation:

curl -X POST http://localhost:3000/api/leads/{expiredLeadId}/reactivate \
  -H "Cookie: next-auth.session-token={adminToken}" \
  -H "Content-Type: application/json" \
  -d '{"countdownDays": 7}'

# Expected: 200 OK, lead.status = "APPROVED", lead.expiresAt = 7 days from now
```

---

#### Step 1.8: Update Lead Purchase Flow (30 minutes)

**File**: `src/lib/services/lead-service.ts`

- [ ] Find `purchaseLead()` function
- [ ] After lead purchase update, add countdown disable logic:
  ```typescript
  // Disable countdown for CALL_VISIT and WRITTEN_QUOTE leads
  if (lead.quoteType === 'CALL_VISIT' || lead.quoteType === 'WRITTEN_QUOTE') {
    await prisma.lead.update({
      where: { id: leadId },
      data: { expiresAt: null }
    });
    
    // Audit log
    await createAuditLog({
      action: AUDIT_ACTIONS.COUNTDOWN_TIMER_REMOVED,
      entityType: 'lead',
      entityId: leadId,
      leadId,
      userId: installerId,
      metadata: { reason: 'Lead purchased (auto-disable)', quoteType: lead.quoteType }
    });
  }
  // BIDDING leads: expiresAt remains unchanged (countdown stays active)
  ```

**Validation**: Purchase a CALL_VISIT lead with countdown → verify expiresAt becomes null in database

---

#### Step 1.9: Verify Cron Job (No Changes Needed) (15 minutes)

**File**: `src/lib/services/lead-state.ts` (lines 278-308)

- [ ] Review `checkAllExpiredLeads()` function
- [ ] Confirm it already:
  - Queries leads with `expiresAt < now`
  - Excludes leads with `expiresAt = null`
  - Transitions status to EXPIRED
  - Creates audit logs
  - Sends notifications

- [ ] **No modifications needed** (existing logic already handles countdown expiry)

**Validation**:
```bash
# Manually test cron job
curl http://localhost:3000/api/cron/expire-leads \
  -H "Authorization: Bearer ${CRON_SECRET}"

# Expected: JSON response with expiredCount
```

---

### Phase 2: Frontend Implementation (4-6 hours)

#### Step 2.1: Create Countdown Timer Component (1.5 hours)

**File**: `src/components/CountdownTimer.tsx` (NEW)

- [ ] Create Client Component (`'use client'` directive)
- [ ] Props: `{ expiresAt: string | null, leadId: string, showProgressBar?: boolean }`
- [ ] State: `const [countdown, setCountdown] = useState<CountdownTimer | null>(null)`
- [ ] Calculate initial countdown on mount
- [ ] Set up interval to recalculate every 10 seconds (`useEffect`)
- [ ] Render:
  - Progress bar (color-coded: green/yellow/red)
  - Display text ("X days left")
  - Hidden if `expiresAt` is null
- [ ] Use Tailwind CSS for styling
- [ ] Support dark mode

**Example**:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { calculateCountdown } from '@/lib/services/countdown-service';
import type { CountdownTimer } from '@/types/countdown';

interface CountdownTimerProps {
  expiresAt: string | null;
  leadId: string;
  showProgressBar?: boolean;
}

export function CountdownTimer({ expiresAt, leadId, showProgressBar = true }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownTimer | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const result = calculateCountdown(new Date(expiresAt));
      setCountdown(result);
    };

    updateCountdown(); // Initial calculation
    const interval = setInterval(updateCountdown, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!countdown || !expiresAt) return null;

  const colorClasses = {
    green: 'bg-green-500 text-green-100 dark:bg-green-600',
    yellow: 'bg-yellow-500 text-yellow-100 dark:bg-yellow-600',
    red: 'bg-red-500 text-red-100 dark:bg-red-600'
  };

  return (
    <div className="countdown-timer">
      {showProgressBar && (
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${colorClasses[countdown.colorClass]}`}
            style={{ width: `${countdown.progressPercent}%` }}
          />
        </div>
      )}
      <div className={`mt-1 text-sm font-medium ${colorClasses[countdown.colorClass]} px-2 py-1 rounded`}>
        {countdown.isExpired ? '🔴 Expired' : `⏰ ${countdown.displayText}`}
      </div>
    </div>
  );
}
```

**Validation**: Import and render component in test page, verify countdown updates every 10 seconds

---

#### Step 2.2: Create Admin Countdown Controls Component (1.5 hours)

**File**: `src/components/admin/LeadCountdownControls.tsx` (NEW)

- [ ] Create Client Component
- [ ] Props: `{ lead: LeadWithCountdown, onUpdate: () => void }`
- [ ] Show current countdown state
- [ ] Buttons:
  - "Reset Timer" → Opens modal to enter new duration
  - "Remove Timer" → Confirms and removes countdown
  - "Reactivate" → (Only for expired leads) Opens modal to set countdown
- [ ] API calls to countdown management endpoints
- [ ] Success/error toast messages
- [ ] Loading states

**Validation**: Render component in admin lead details page, test all buttons

---

#### Step 2.3: Update Admin Approval Modal (1 hour)

**File**: `src/app/admin/leads/[id]/page.tsx`

- [ ] Find approval modal section (around line 139)
- [ ] Add countdown timer controls to approval UI:
  - Checkbox: "Enable countdown timer" (checked by default)
  - Number input: Duration in days (default: 7, range: 1-90)
- [ ] Update API call to include countdown parameters:
  ```typescript
  const response = await fetch(`/api/leads/${lead.id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price: leadPrice,
      assignTo: 'ALL',
      enableCountdown: enableCountdown,
      countdownDays: countdownDays
    })
  });
  ```
- [ ] Display countdown state in success message
- [ ] Add `LeadCountdownControls` component to lead details view

**Validation**: Approve lead with countdown enabled → verify timer appears on lead card

---

#### Step 2.4: Update Admin Leads List (30 minutes)

**File**: `src/app/admin/leads/page.tsx`

- [ ] Import `CountdownTimer` component
- [ ] Add countdown timer display to each lead card:
  ```tsx
  {lead.expiresAt && (
    <CountdownTimer expiresAt={lead.expiresAt} leadId={lead.id} />
  )}
  ```
- [ ] Ensure countdown appears in lead status section

**Validation**: Navigate to admin leads list → verify countdown timers display for approved leads

---

#### Step 2.5: Update Homeowner Dashboard (30 minutes)

**File**: `src/app/homeowner/dashboard/page.tsx` or lead card component

- [ ] Import `CountdownTimer` component
- [ ] Add countdown timer to homeowner lead cards:
  ```tsx
  {lead.expiresAt && (
    <div className="mt-2">
      <CountdownTimer expiresAt={lead.expiresAt} leadId={lead.id} />
    </div>
  )}
  ```

**Validation**: Login as homeowner → verify countdown timer displays on approved leads

---

#### Step 2.6: Update Installer Dashboard (Optional - 30 minutes)

**File**: Installer lead view components

- [ ] Add countdown timer display to installer lead marketplace
- [ ] Show countdown on purchased BIDDING leads
- [ ] Hide countdown on purchased CALL_VISIT/WRITTEN_QUOTE leads

**Validation**: Login as installer → verify countdown displays correctly based on quote type

---

### Phase 3: Testing & Validation (2-3 hours)

#### Manual QA Checklist

- [ ] **Admin Approval Flow**
  - [ ] Approve lead with countdown enabled (default 7 days) → Timer appears
  - [ ] Approve lead with custom duration (10 days) → Timer shows 10 days
  - [ ] Approve lead without countdown (checkbox unchecked) → No timer
  - [ ] Verify countdown appears on admin, homeowner dashboards

- [ ] **Countdown Display**
  - [ ] Lead with 7 days remaining → Green color, "7 days left"
  - [ ] Lead with 4 days remaining → Yellow color, "4 days left"
  - [ ] Lead with 1 day remaining → Red color, "1 day left"
  - [ ] Countdown updates every 10 seconds (wait and observe)

- [ ] **Auto-Expiry**
  - [ ] Create lead with 1-day countdown (or set expiresAt to tomorrow in DB)
  - [ ] Wait 24+ hours (or manually set expiresAt to past date)
  - [ ] Run cron: `curl -H "Authorization: Bearer ${CRON_SECRET}" http://localhost:3000/api/cron/expire-leads`
  - [ ] Verify lead status → EXPIRED
  - [ ] Verify lead removed from installer marketplace
  - [ ] Verify homeowner receives expiry notification

- [ ] **Purchase Behavior**
  - [ ] Purchase CALL_VISIT lead with 5-day countdown → Timer disappears
  - [ ] Verify expiresAt = null in database
  - [ ] Purchase WRITTEN_QUOTE lead with countdown → Timer disappears
  - [ ] Purchase BIDDING lead with countdown → Timer remains visible

- [ ] **Admin Management**
  - [ ] Reset countdown to 14 days on active lead → Timer updates
  - [ ] Remove countdown from active lead → Timer disappears
  - [ ] Reactivate expired lead with 7-day countdown → Lead becomes APPROVED, timer shows 7 days
  - [ ] Verify audit logs created for all actions

- [ ] **Error Handling**
  - [ ] Try to set countdown to 0 days → Error message
  - [ ] Try to set countdown to 91 days → Error message
  - [ ] Try to reactivate non-expired lead → Error message
  - [ ] Try countdown management as non-admin → 403 Forbidden

---

### Phase 4: Documentation & Commit (1 hour)

- [ ] Create implementation record: `DOC/Records/COUNTDOWN-TIMER-IMPLEMENTATION-2025-10-22.md`
  - Document all changes made
  - List files modified/created
  - Include testing results
  - Note any deviations from spec

- [ ] Update `.env.example` if needed (CRON_SECRET)

- [ ] Run final validation:
  - [ ] `npx prisma validate` (schema valid)
  - [ ] `npx tsc --noEmit` (TypeScript compiles)
  - [ ] `npm run build` (build passes)
  - [ ] `npm run lint` (no critical errors)

- [ ] Get user approval for commit

- [ ] Git commit with detailed message:
  ```
  feat(phase-4.14): Add lead expiry countdown timer feature
  
  FEATURE SUMMARY:
  - Admin can enable/disable countdown timer when approving leads (default: 7 days)
  - Countdown timers display on all dashboards (admin, homeowner, installer)
  - Color-coded visual feedback: green (6+), yellow (3-5), red (1-2 days)
  - Auto-expiry via hourly cron job (status → EXPIRED)
  - Quote-type-specific behavior: CALL_VISIT/WRITTEN_QUOTE disable on purchase, BIDDING keeps timer
  - Admin controls: reset, remove, reactivate expired leads
  
  IMPLEMENTATION:
  - Modified: /api/leads/[id]/approve (add countdown options)
  - New: /api/leads/[id]/countdown (PATCH/DELETE for reset/remove)
  - New: /api/leads/[id]/reactivate (POST for expired lead reactivation)
  - New: CountdownTimer component (client component with auto-refresh)
  - New: LeadCountdownControls component (admin management UI)
  - Modified: lead-service.ts (disable countdown on purchase)
  - New: countdown-service.ts (calculation utilities)
  - Updated: Admin/Homeowner dashboards (countdown display)
  
  TESTING:
  - ✅ Admin approval with countdown (default + custom duration)
  - ✅ Countdown display and color coding (green/yellow/red)
  - ✅ Auto-expiry via cron job
  - ✅ Purchase behavior (disable for CALL_VISIT/WRITTEN_QUOTE, keep for BIDDING)
  - ✅ Admin management (reset, remove, reactivate)
  - ✅ Audit logging for all countdown actions
  
  FILES MODIFIED:
  - prisma/seed-settings.ts (add LEAD_COUNTDOWN_DEFAULT_DAYS)
  - src/app/api/leads/[id]/approve/route.ts (countdown options)
  - src/app/api/leads/[id]/countdown/route.ts (NEW)
  - src/app/api/leads/[id]/reactivate/route.ts (NEW)
  - src/app/admin/leads/page.tsx (countdown display)
  - src/app/admin/leads/[id]/page.tsx (approval modal + controls)
  - src/app/homeowner/dashboard/page.tsx (countdown display)
  - src/components/CountdownTimer.tsx (NEW)
  - src/components/admin/LeadCountdownControls.tsx (NEW)
  - src/lib/services/countdown-service.ts (NEW)
  - src/lib/services/lead-service.ts (purchase countdown disable)
  - src/lib/services/audit-logger.ts (new audit actions)
  - src/types/countdown.ts (NEW)
  
  SPEC: specs/003-countdown-timer-for/spec.md
  ```

---

## Common Issues & Troubleshooting

### Issue: Countdown not updating in UI

**Solution**: 
- Check `useEffect` cleanup function (clear interval on unmount)
- Verify `expiresAt` is passed as ISO string (not Date object)
- Check browser console for JavaScript errors

### Issue: Cron job not expiring leads

**Solution**:
- Verify `CRON_SECRET` environment variable is set
- Check cron job is running (Vercel Cron tab)
- Manually test: `curl -H "Authorization: Bearer ${CRON_SECRET}" http://localhost:3000/api/cron/expire-leads`
- Check server logs for errors

### Issue: Countdown disappears after lead purchase but shouldn't (BIDDING lead)

**Solution**:
- Check `lead.quoteType` in purchase logic
- Ensure conditional only sets `expiresAt = null` for CALL_VISIT and WRITTEN_QUOTE
- Verify BIDDING leads skip the countdown disable logic

### Issue: TypeScript errors about countdown types

**Solution**:
- Ensure `src/types/countdown.ts` is properly exported
- Run `npx prisma generate` to update Prisma types
- Check import paths (use `@/` alias)

---

## Performance Optimization Tips

1. **Countdown Calculation Caching**
   - Calculate countdown once on server (during lead fetch)
   - Pass pre-calculated countdown to client
   - Client only recalculates every 10 seconds (not every render)

2. **Component Memoization**
   - Wrap `CountdownTimer` in `React.memo()` to prevent unnecessary re-renders
   - Use `useMemo` for expensive countdown calculations

3. **Database Query Optimization**
   - Existing `@@index([expiresAt])` on Lead model ensures fast cron queries
   - Cron job only queries leads with `expiresAt < now` (no full table scan)

---

## Next Steps

After completing this implementation:

1. **Monitor Production**
   - Watch cron job logs for expiry count
   - Monitor API response times for approval endpoint
   - Check error rates for countdown management APIs

2. **Future Enhancements** (Out of Scope for Current Spec)
   - Email reminders 24 hours before expiry
   - SMS notifications for lead expiry
   - Hours/minutes countdown for final day
   - Bulk countdown management (multiple leads at once)

3. **User Feedback**
   - Survey installers: Does countdown timer motivate faster action?
   - Survey homeowners: Is countdown timer clear and informative?
   - Iterate based on feedback

---

## Support & Questions

If you encounter issues during implementation:

1. Review spec.md, research.md, and data-model.md for clarification
2. Check API contracts in `contracts/countdown-api.openapi.yaml`
3. Refer to existing codebase patterns (lead-state.ts, audit-logger.ts)
4. Test in isolation (create test API routes, test components independently)

**Ready to implement!** Follow the checklist above step-by-step for a successful countdown timer feature rollout.
