# Research: Lead Expiry Countdown Timer

**Feature**: 003-countdown-timer-for  
**Date**: October 22, 2025  
**Status**: Research Complete

## Overview

This document consolidates technical research and design decisions for implementing the countdown timer feature. All unknowns from the Technical Context have been resolved through analysis of the existing codebase.

---

## Research Questions & Resolutions

### 1. Countdown Timer Calculation Approach

**Question**: How should countdown calculations be performed to ensure consistency and avoid timezone issues?

**Decision**: Server-side calculation with UTC timestamps

**Rationale**:
- Lead `expiresAt` field stores UTC DateTime (Prisma default)
- Server performs all countdown calculations to avoid client timezone discrepancies
- Client receives pre-calculated remaining days/hours as JSON
- Countdown display refreshes via polling (10-second intervals) or Pusher events

**Implementation**:
```typescript
// Server-side utility function
export function calculateCountdown(expiresAt: Date | null): {
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  displayText: string;
  colorClass: 'green' | 'yellow' | 'red';
} {
  if (!expiresAt) return { isExpired: false, daysRemaining: -1, ... };
  
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Color logic: green (6+), yellow (3-5), red (1-2)
  const colorClass = daysRemaining >= 6 ? 'green' : daysRemaining >= 3 ? 'yellow' : 'red';
  
  return { isExpired: diffMs <= 0, daysRemaining, colorClass, ... };
}
```

**Alternatives Considered**:
- Client-side calculation: Rejected due to timezone inconsistencies
- Real-time WebSocket updates: Rejected as overkill (polling sufficient for daily granularity)

---

### 2. Countdown Timer UI Component Architecture

**Question**: Should countdown timer be a Server Component or Client Component?

**Decision**: Hybrid approach - Server Component for data fetching, Client Component for display

**Rationale**:
- Server Component fetches lead with `expiresAt` field (async data)
- Client Component renders countdown timer with auto-refresh (uses `useState`, `useEffect`)
- Separates data fetching from interactive UI

**Implementation**:
```tsx
// Server Component (src/app/admin/leads/page.tsx)
export default async function AdminLeadsPage() {
  const leads = await getLeads({ role: 'ADMIN' });
  
  return leads.map(lead => (
    <LeadCard lead={lead} key={lead.id}>
      {lead.expiresAt && <CountdownTimer expiresAt={lead.expiresAt} />}
    </LeadCard>
  ));
}

// Client Component (src/components/CountdownTimer.tsx)
'use client';
export function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [countdown, setCountdown] = useState(calculateCountdown(new Date(expiresAt)));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(new Date(expiresAt)));
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [expiresAt]);
  
  return <div className={`countdown-bar ${countdown.colorClass}`}>...</div>;
}
```

**Alternatives Considered**:
- Pure Server Component: Rejected (cannot use `setInterval` for auto-refresh)
- Pure Client Component: Rejected (loses server-side rendering benefits)

---

### 3. Admin Approval Flow Integration

**Question**: How to integrate countdown timer controls into existing approval modal without breaking flow?

**Decision**: Add optional countdown section to existing approval modal with checkbox toggle

**Rationale**:
- Existing `/api/leads/[id]/approve` endpoint already sets `expiresAt` to 30 days
- Modify endpoint to accept optional `countdownDays` parameter (1-90 range)
- Add UI checkbox: "Enable countdown timer" (default: checked, 7 days)
- Add duration input: Number field (1-90 days)
- If checkbox unchecked, set `expiresAt` to null (no expiry)

**Implementation**:
```typescript
// API Route: src/app/api/leads/[id]/approve/route.ts
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { enableCountdown = true, countdownDays = 7 } = body;
  
  // Validate countdown duration
  if (enableCountdown && (countdownDays < 1 || countdownDays > 90)) {
    return NextResponse.json({ error: 'Invalid countdown duration' }, { status: 400 });
  }
  
  // Calculate expiresAt
  const expiresAt = enableCountdown 
    ? new Date(Date.now() + countdownDays * 24 * 60 * 60 * 1000) 
    : null;
  
  // Update lead
  await prisma.lead.update({
    where: { id: params.id },
    data: { status: 'APPROVED', expiresAt, approvedAt: new Date() }
  });
  
  // Audit log
  await createAuditLog({
    action: enableCountdown ? 'countdown_timer_added' : 'lead_approved_no_timer',
    metadata: { countdownDays, expiresAt }
  });
}
```

**Alternatives Considered**:
- Separate countdown timer setup page: Rejected (adds extra step, reduces UX)
- Always enable countdown: Rejected (spec requires optional countdown)

---

### 4. Quote Type-Specific Countdown Behavior

**Question**: How to automatically disable countdown timer when CALL_VISIT or WRITTEN_QUOTE leads are purchased?

**Decision**: Hook into existing lead purchase flow, check quote type, set `expiresAt` to null

**Rationale**:
- Lead purchase logic exists in lead-service.ts `purchaseLead()` function
- Add conditional check: if `lead.quoteType === 'CALL_VISIT' || lead.quoteType === 'WRITTEN_QUOTE'`
- Set `expiresAt` to null (disables countdown)
- BIDDING leads skip this logic (countdown remains active)

**Implementation**:
```typescript
// Service: src/lib/services/lead-service.ts (modify existing purchaseLead function)
export async function purchaseLead(leadId: string, installerId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  
  const updateData: any = {
    status: 'PURCHASED',
    installerId,
    purchasedAt: new Date()
  };
  
  // Disable countdown for CALL_VISIT and WRITTEN_QUOTE leads
  if (lead.quoteType === 'CALL_VISIT' || lead.quoteType === 'WRITTEN_QUOTE') {
    updateData.expiresAt = null; // Remove expiry
  }
  // BIDDING leads keep countdown timer active
  
  await prisma.lead.update({ where: { id: leadId }, data: updateData });
  
  // Audit log
  await createAuditLog({
    action: 'lead_purchased',
    metadata: { 
      quoteType: lead.quoteType, 
      countdownDisabled: updateData.expiresAt === null 
    }
  });
}
```

**Alternatives Considered**:
- Separate API endpoint for countdown disable: Rejected (adds complexity, not needed)
- Manual admin action to disable countdown: Rejected (should be automatic per spec)

---

### 5. Cron Job for Auto-Expiry

**Question**: How frequently should the expiry cron job run, and how to handle failures?

**Decision**: Run hourly via Vercel Cron or scheduled task, with retry logic

**Rationale**:
- Existing `checkAllExpiredLeads()` function in lead-state.ts already handles expiry
- Modify function to check `expiresAt` field (currently checks 30-day default)
- Run hourly (acceptable latency for daily-granularity countdown)
- Log expired leads count for monitoring
- On-demand expiry check when lead is accessed (fallback if cron fails)

**Implementation**:
```typescript
// Service: src/lib/services/lead-state.ts (modify existing function)
export async function checkAllExpiredLeads(): Promise<number> {
  const expiredLeads = await prisma.lead.findMany({
    where: {
      status: { in: ['APPROVED', 'PURCHASED'] },
      expiresAt: { lt: new Date() }, // Expired countdown
      NOT: { expiresAt: null } // Exclude leads without countdown
    },
    select: { id: true }
  });

  let expiredCount = 0;
  for (const lead of expiredLeads) {
    try {
      await transitionLeadStatus(lead.id, 'EXPIRED', 'system', 'Countdown timer expired');
      expiredCount++;
    } catch (error) {
      console.error(`Failed to expire lead ${lead.id}:`, error);
    }
  }

  console.log(`[Cron] Expired ${expiredCount} leads with countdown timers`);
  return expiredCount;
}

// Cron endpoint: src/app/api/cron/expire-leads/route.ts
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const expiredCount = await checkAllExpiredLeads();
  return NextResponse.json({ success: true, expiredCount });
}
```

**Cron Schedule** (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/cron/expire-leads",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Alternatives Considered**:
- Run every 15 minutes: Rejected (unnecessary for daily countdown, increases costs)
- Run daily at midnight: Rejected (1-day latency too high, leads expire 24 hours late)

---

### 6. Color-Coded Countdown Thresholds

**Question**: Should color thresholds be configurable or fixed?

**Decision**: Fixed thresholds (green 6+, yellow 3-5, red 1-2 days)

**Rationale**:
- Spec explicitly defines fixed thresholds
- Simplifies implementation (no settings table entry needed)
- Prevents admin confusion (consistent color meaning across all leads)
- Industry standard: green = safe, yellow = caution, red = urgent

**Implementation**:
```typescript
export function getCountdownColor(daysRemaining: number): 'green' | 'yellow' | 'red' {
  if (daysRemaining >= 6) return 'green';
  if (daysRemaining >= 3) return 'yellow';
  return 'red';
}

// Tailwind classes
const colorClasses = {
  green: 'bg-green-500 text-green-100 dark:bg-green-600',
  yellow: 'bg-yellow-500 text-yellow-100 dark:bg-yellow-600',
  red: 'bg-red-500 text-red-100 dark:bg-red-600'
};
```

**Alternatives Considered**:
- Configurable thresholds via Settings: Rejected (adds complexity, not in spec)
- More granular color scale (5 colors): Rejected (too complex for daily countdown)

---

### 7. Lead Reactivation Workflow

**Question**: How should admins reactivate expired leads with new countdown timers?

**Decision**: Add "Reactivate" button to expired leads in admin dashboard with countdown duration input

**Rationale**:
- Expired leads have status `EXPIRED` and visibility `HIDDEN`
- Admin clicks "Reactivate" button on lead details page
- Modal prompts for countdown duration (default: 7 days)
- API endpoint transitions status from `EXPIRED` to `APPROVED`
- Sets new `expiresAt` timestamp
- Restores visibility to `PUBLIC` (or previous visibility)

**Implementation**:
```typescript
// API Route: src/app/api/leads/[id]/reactivate/route.ts
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // Check admin role
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const body = await request.json();
  const { countdownDays = 7 } = body;
  
  // Validate countdown duration
  if (countdownDays < 1 || countdownDays > 90) {
    return NextResponse.json({ error: 'Invalid countdown duration' }, { status: 400 });
  }
  
  // Calculate new expiresAt
  const expiresAt = new Date(Date.now() + countdownDays * 24 * 60 * 60 * 1000);
  
  // Update lead
  await prisma.lead.update({
    where: { id: params.id },
    data: {
      status: 'APPROVED',
      visibility: 'PUBLIC',
      expiresAt,
      approvedAt: new Date() // Reset approval timestamp
    }
  });
  
  // Audit log
  await createAuditLog({
    action: 'lead_reactivated',
    metadata: { countdownDays, expiresAt }
  });
  
  // Notify homeowner
  await createNotification({
    type: 'LEAD_APPROVED',
    message: `Your lead has been reactivated with ${countdownDays} days countdown`
  });
  
  return NextResponse.json({ success: true });
}
```

**Alternatives Considered**:
- Reactivation without countdown: Rejected (defeats purpose of countdown feature)
- Automatic reactivation: Rejected (admin should explicitly decide)

---

### 8. Countdown Timer Reset/Remove Controls

**Question**: How should admins reset or remove countdown timers from active leads?

**Decision**: Add "Countdown Timer" management section to admin lead details modal

**Rationale**:
- Admin views lead details modal (existing UI at `/admin/leads/[id]`)
- Add "Countdown Timer" section with current countdown display
- Two actions: "Reset Timer" (prompt for new duration) and "Remove Timer" (set expiresAt to null)
- Both actions create audit logs

**Implementation**:
```typescript
// API Route: src/app/api/leads/[id]/countdown/route.ts

// PATCH - Reset countdown timer
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Admin check
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const body = await request.json();
  const { countdownDays } = body;
  
  // Validate
  if (countdownDays < 1 || countdownDays > 90) {
    return NextResponse.json({ error: 'Invalid countdown duration' }, { status: 400 });
  }
  
  // Calculate new expiresAt
  const expiresAt = new Date(Date.now() + countdownDays * 24 * 60 * 60 * 1000);
  
  // Update lead
  await prisma.lead.update({
    where: { id: params.id },
    data: { expiresAt }
  });
  
  // Audit log
  await createAuditLog({
    action: 'countdown_timer_reset',
    metadata: { countdownDays, expiresAt }
  });
  
  return NextResponse.json({ success: true, expiresAt });
}

// DELETE - Remove countdown timer
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Admin check
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Remove countdown
  await prisma.lead.update({
    where: { id: params.id },
    data: { expiresAt: null }
  });
  
  // Audit log
  await createAuditLog({
    action: 'countdown_timer_removed',
    metadata: { leadId: params.id }
  });
  
  return NextResponse.json({ success: true });
}
```

**Alternatives Considered**:
- Separate reset/remove endpoints: Rejected (PATCH/DELETE on same route cleaner)
- No remove option: Rejected (spec requires ability to disable countdown)

---

## Technology Stack Decisions

### No New Dependencies Required

**Decision**: Use only existing project dependencies

**Rationale**:
- Countdown calculations: Pure JavaScript Date API
- UI components: Tailwind CSS (already installed)
- API routes: Next.js App Router (existing)
- Database: Prisma with existing Lead model
- Real-time updates: Optional Pusher integration (already configured)

**Dependencies Confirmed**:
- ✅ Next.js 14.2.33 (App Router)
- ✅ React 18.2.0 (Client Components)
- ✅ TypeScript ~5.3.3 (Type safety)
- ✅ Prisma 6.17.1 (Database ORM)
- ✅ Tailwind CSS 3.4.18 (Styling)
- ✅ NextAuth 4.24.11 (Admin role checks)

---

## Performance Optimization Strategies

### 1. Countdown Calculation Caching
- Calculate countdown once per lead fetch (server-side)
- Cache calculation result in lead object (avoids repeated Date math)
- Client re-calculates only every 10 seconds (not on every render)

### 2. Database Query Optimization
- Existing `expiresAt` field indexed: `@@index([expiresAt])`
- Cron job queries only leads with `expiresAt` less than current time
- No full table scans

### 3. UI Rendering Optimization
- Countdown timer component memoized with `React.memo()`
- Progress bar uses CSS transforms (GPU-accelerated)
- No layout shift (fixed height container)

---

## Security Considerations

### 1. Input Validation
- Countdown duration: 1-90 days range (validated server-side)
- Negative durations rejected
- Non-integer values rejected

### 2. Authorization
- Only ADMIN role can manage countdown timers
- Role check on every countdown management API call
- Session verification via NextAuth

### 3. Audit Logging
- All countdown actions logged: timer_added, timer_reset, timer_removed, lead_reactivated
- Logs include: admin ID, lead ID, countdown duration, timestamp
- Immutable audit trail (AuditLog table)

---

## Testing Strategy

### Manual QA Scenarios
1. **Admin Approval with Countdown**
   - Approve lead with default 7-day countdown
   - Approve lead with custom 10-day countdown
   - Approve lead without countdown (checkbox unchecked)
   - Verify countdown appears on all dashboards

2. **Countdown Display**
   - Verify green color (7 days remaining)
   - Verify yellow color (4 days remaining)
   - Verify red color (1 day remaining)
   - Verify countdown updates every 10 seconds

3. **Auto-Expiry**
   - Create lead with 1-day countdown (or manually set expiresAt to past date)
   - Run cron job: `curl -H "Authorization: Bearer ${CRON_SECRET}" http://localhost:3000/api/cron/expire-leads`
   - Verify lead status changes to EXPIRED
   - Verify lead removed from installer marketplace

4. **Purchase Behavior**
   - Purchase CALL_VISIT lead with countdown
   - Verify countdown disappears
   - Purchase BIDDING lead with countdown
   - Verify countdown remains

5. **Admin Management**
   - Reset countdown to 14 days on active lead
   - Remove countdown from active lead
   - Reactivate expired lead with 7-day countdown
   - Verify audit logs created

---

## Research Summary

All technical unknowns resolved. Feature implementation can proceed with:
- ✅ Existing database schema (no migrations needed)
- ✅ Established API patterns (extend existing endpoints)
- ✅ Proven UI component architecture (Server + Client Components)
- ✅ No new dependencies required
- ✅ Constitutional compliance confirmed

**Ready for Phase 1**: Data model and API contract design.
