# Quote Limit & Bidding Lead Enhancement Audit

**Date**: December 14, 2025  
**Audit Type**: Homeowner Quote System Enhancement  
**Priority**: High  
**Status**: Audit Complete, Implementation Pending

---

## Executive Summary

This audit identifies critical issues and enhancement opportunities in the quote limit system affecting homeowner lead generation across dashboard and marketplace pages.

### Critical Issues Identified

1. **Stale Quote Limit Data on Marketplace Page** ❌ CRITICAL
   - After admin increases quote limit, marketplace page (`src/app/page.tsx`) does not fetch updated limit
   - Dashboard page works correctly (real-time data from `/api/homeowner/dashboard`)
   - Marketplace uses local state from initial session load (not refreshed)
   
2. **Hardcoded Bidding Lead Quota** ❌ CRITICAL
   - Currently: Bidding lead quota is hardcoded to 1 per homeowner (non-configurable)
   - Admin panel cannot adjust bidding quota (only regular quote limit adjustable)
   - Database field exists (`User.biddingLeadsSubmitted`) but no admin interface

### Impact Assessment

| Issue | Pages Affected | User Impact | Business Impact |
|-------|---------------|-------------|-----------------|
| Stale limit data | Marketplace (homepage) | Homeowners blocked from generating leads despite increased quota | Lost conversions, user frustration |
| Hardcoded bidding quota | Admin panel, all pages | Admins cannot grant additional bidding opportunities | Reduced flexibility, manual workarounds |

---

## Technical Deep Dive

### Issue #1: Marketplace Page Stale Data

**Root Cause Analysis:**

The marketplace page (`src/app/page.tsx`) fetches quote limit data **once** on mount via `/api/leads`:

```typescript
// src/app/page.tsx - Line 99
useEffect(() => {
  const fetchUserLeadData = async () => {
    if (status === 'authenticated' && session?.user?.id) {
      // Fetches leads to count, but doesn't fetch updated quoteLimit from database
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        const leadCount = data.leads?.length || 0;
        setUserLeadCount(leadCount);
        
        // ❌ PROBLEM: Uses hardcoded MAX_LEADS constant (5), not database value
        const remaining = Math.max(0, MAX_LEADS - leadCount);
        setRemainingLeadQuota(remaining);
      }
    }
  };
  fetchUserLeadData();
}, [status, session?.user?.id]);
```

**Flow Comparison:**

| Flow Step | Dashboard Page ✅ | Marketplace Page ❌ |
|-----------|------------------|---------------------|
| Data Source | `/api/homeowner/dashboard` | Hardcoded constant `MAX_LEADS = 5` |
| Fetches User.leadSubmissionLimit? | YES (via `getHomeownerLeadSummary`) | NO |
| Reflects admin changes? | YES (real-time) | NO (stale) |
| Refresh mechanism | On dashboard mount + after lead creation | Only on page mount, not after admin update |

**Evidence from Code:**

```typescript
// ✅ DASHBOARD PAGE - CORRECT APPROACH
// src/app/homeowner/dashboard/page.tsx - Line 903
const fetchDashboardSummary = useCallback(async () => {
  const response = await fetch('/api/homeowner/dashboard');
  const data = await response.json();
  setDashboardSummary(data);
  // data.quoteLimit comes from User.leadSubmissionLimit in database
}, []);

// ❌ MARKETPLACE PAGE - INCORRECT APPROACH
// src/app/page.tsx - Line 56
const MAX_LEADS = 5; // Hardcoded constant, doesn't reflect database
```

**Database vs. Code State:**

| State | Database (`User` table) | Dashboard Page State | Marketplace Page State |
|-------|------------------------|---------------------|------------------------|
| Field | `leadSubmissionLimit` (mutable, admin-controlled) | `dashboardSummary.quoteLimit` (fetched from DB) | `MAX_LEADS = 5` (hardcoded constant) |
| Default Value | 5 | 5 (from DB) | 5 (hardcoded) |
| After admin increase to 20 | 20 ✅ | 20 ✅ (fetched on mount) | 5 ❌ (never refetched) |

---

### Issue #2: Hardcoded Bidding Lead Quota

**Current Implementation:**

```typescript
// src/lib/services/lead-service.ts - Line 176
// Check BIDDING quota limit (max 1 per user)
if (input.quoteType === 'BIDDING') {
  if (homeownerWithBidding.biddingLeadsSubmitted >= 1) {
    throw new Error('BIDDING quota exceeded. You can only create 1 bidding quote per account.');
  }
}
```

**Database Schema:**

```prisma
// prisma/schema.prisma - Lines 97-98
model User {
  // ...
  leadSubmissionLimit   Int  @default(5)      // ✅ Admin-adjustable
  biddingLeadsSubmitted Int  @default(0)      // ❌ NOT admin-adjustable
  // Missing: biddingLeadsLimit field
}
```

**Admin Panel Gap:**

Currently, admin can update:
- ✅ Regular quote limit via `/api/admin/homeowners/[id]/lead-limit` (PATCH)
- ❌ Bidding quote limit (no API endpoint exists)

**Required Changes:**

1. Add `biddingLeadsLimit` field to `User` model (default: 1)
2. Create API endpoint `/api/admin/homeowners/[id]/bidding-limit` (PATCH)
3. Update admin panel UI to display/edit bidding limit
4. Update `createLead` service to check `biddingLeadsLimit` instead of hardcoded 1

---

## Constitutional Compliance Analysis

### Article II — Actors, Roles & Authority

**Law 2.2 - Roles Grant Power, Not UI**

| Current State | Compliance | Recommendation |
|--------------|-----------|----------------|
| Admin can adjust quote limit ✅ | COMPLIANT | Maintain authorization checks |
| Admin CANNOT adjust bidding limit ❌ | VIOLATION | Add missing permission |

**Violation**: Bidding quota control is missing from admin's authority despite being a business-critical parameter.

### Article IV — Data & Entity Governance

**Law 4.1 - Every Entity Has a Reason**

| Entity/Field | Purpose | Owner | Lifecycle |
|--------------|---------|-------|-----------|
| `User.leadSubmissionLimit` | Controls regular quote quota | Admin | Mutable, admin-controlled ✅ |
| `User.biddingLeadsSubmitted` | Tracks bidding quota usage | System | Incremental, system-controlled ✅ |
| `User.biddingLeadsLimit` | Controls bidding quota limit | Admin | **MISSING** ❌ |

**Violation**: Missing `biddingLeadsLimit` field prevents proper governance of bidding quotas.

### Article III — Domain Separation

**Law 3.2 - UI Is a Consumer, Not an Authority**

| Component | Current Behavior | Compliance |
|-----------|-----------------|-----------|
| Dashboard page | Fetches limit from backend `/api/homeowner/dashboard` | COMPLIANT ✅ |
| Marketplace page | Uses hardcoded `MAX_LEADS = 5` constant | VIOLATION ❌ |

**Violation**: Marketplace page defines truth via UI constant instead of consuming backend state.

---

## Affected Files & Components

### Backend (API Routes & Services)

| File | Current Functionality | Required Changes |
|------|----------------------|------------------|
| `src/app/api/homeowner/dashboard/route.ts` | Returns quote limit from DB | ✅ No changes (working correctly) |
| `src/app/api/leads/route.ts` | Creates leads, checks limits | ⚠️ Update to use `biddingLeadsLimit` field |
| `src/lib/services/lead-service.ts` | Lead creation business logic | ⚠️ Replace hardcoded 1 with `biddingLeadsLimit` |
| `src/app/api/admin/homeowners/[id]/lead-limit/route.ts` | Updates regular quote limit | ✅ No changes (reference implementation) |
| `src/app/api/admin/homeowners/[id]/bidding-limit/route.ts` | **NEW FILE** - Updates bidding limit | 🆕 Create new API endpoint |
| `src/lib/services/homeowner-admin-service.ts` | Admin homeowner management | 🆕 Add `updateHomeownerBiddingLimit` function |

### Frontend (Pages & Components)

| File | Current Functionality | Required Changes |
|------|----------------------|------------------|
| `src/app/page.tsx` (Marketplace) | Uses hardcoded `MAX_LEADS = 5` | ⚠️ Fetch from `/api/homeowner/dashboard` |
| `src/app/homeowner/dashboard/page.tsx` | Fetches live data from API | ✅ No changes (reference implementation) |
| `src/components/homeowner/LeadLimitReachedModal.tsx` | Displays limit reached message | ⚠️ Ensure props receive DB values, not constants |
| `src/components/homeowner/QuoteTypeDistributionModal.tsx` | Checks `userAlreadyHasBiddingLead` prop | ⚠️ Update to check against `biddingLeadsLimit` |
| Admin panel (homeowner detail page) | Displays/edits regular quote limit | 🆕 Add bidding limit input field |

### Database Schema

| Model | Field | Current State | Required Changes |
|-------|-------|--------------|------------------|
| `User` | `leadSubmissionLimit` | ✅ Exists, admin-adjustable | No changes |
| `User` | `biddingLeadsSubmitted` | ✅ Exists, tracks usage | No changes |
| `User` | `biddingLeadsLimit` | ❌ MISSING | 🆕 Add new field (default: 1) |

---

## Recommended Solution Architecture

### Phase 1: Fix Marketplace Stale Data

**Objective**: Marketplace page should fetch real-time quote limit from database, not use hardcoded constant.

**Changes Required:**

1. **Update `src/app/page.tsx`** (Marketplace):
   - Replace hardcoded `MAX_LEADS = 5` with API call to `/api/homeowner/dashboard`
   - Fetch `quoteLimit` from backend on mount
   - Add refresh mechanism after admin increases limit (via session update or polling)

2. **Update `useEffect` in marketplace**:
```typescript
// BEFORE (❌ Wrong)
const remaining = Math.max(0, MAX_LEADS - leadCount);
setRemainingLeadQuota(remaining);

// AFTER (✅ Correct)
const dashboardResponse = await fetch('/api/homeowner/dashboard');
const dashboardData = await dashboardResponse.json();
const remaining = Math.max(0, dashboardData.quoteLimit - leadCount);
setRemainingLeadQuota(remaining);
setUserQuoteLimit(dashboardData.quoteLimit); // New state variable
```

3. **Add session refresh trigger**:
   - When admin updates limit, trigger `updateSession()` to refresh NextAuth session
   - Marketplace page listens to session changes and refetches dashboard data

**Files to Modify:**
- `src/app/page.tsx` (marketplace homepage)
- `src/app/api/admin/homeowners/[id]/lead-limit/route.ts` (trigger session update)

**Testing Requirements:**
- Admin increases homeowner quote limit from 5 → 20
- Homeowner refreshes marketplace page → should see 20 quota, not 5
- Homeowner tries to generate lead → should succeed with updated limit

---

### Phase 2: Add Bidding Lead Quota Admin Control

**Objective**: Admins can adjust homeowner bidding lead quota (default 1, adjustable to any number).

**Changes Required:**

1. **Database Schema Update** (`prisma/schema.prisma`):
```prisma
model User {
  // Existing fields
  leadSubmissionLimit   Int  @default(5)
  biddingLeadsSubmitted Int  @default(0)
  
  // NEW FIELD
  biddingLeadsLimit     Int  @default(1)  // Admin-adjustable bidding quota
}
```

2. **Migration**:
```bash
npx prisma migrate dev --name add_bidding_leads_limit
```

3. **New API Endpoint** (`src/app/api/admin/homeowners/[id]/bidding-limit/route.ts`):
```typescript
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  const { biddingLimit, notify = true, reason } = await request.json();
  
  // Validate biddingLimit >= 0
  if (!Number.isFinite(biddingLimit) || biddingLimit < 0) {
    return NextResponse.json({ error: 'biddingLimit must be a non-negative number' }, { status: 400 });
  }
  
  const updatedHomeowner = await updateHomeownerBiddingLimit({
    adminId: session.user.id,
    homeownerId: params.id,
    biddingLimit,
    notify,
    reason,
  });
  
  return NextResponse.json({ message: 'Bidding limit updated', homeowner: updatedHomeowner }, { status: 200 });
}
```

4. **Service Function** (`src/lib/services/homeowner-admin-service.ts`):
```typescript
export async function updateHomeownerBiddingLimit(input: {
  adminId: string;
  homeownerId: string;
  biddingLimit: number;
  notify?: boolean;
  reason?: string;
}) {
  const { adminId, homeownerId, biddingLimit, notify = true, reason } = input;
  
  const homeowner = await prisma.user.findUnique({
    where: { id: homeownerId },
    select: { id: true, name: true, email: true, biddingLeadsLimit: true, biddingLeadsSubmitted: true },
  });
  
  if (!homeowner) throw new Error('Homeowner not found');
  
  const updatedHomeowner = await prisma.user.update({
    where: { id: homeownerId },
    data: { biddingLeadsLimit: Math.floor(biddingLimit) },
    select: { id: true, name: true, email: true, biddingLeadsLimit: true, biddingLeadsSubmitted: true },
  });
  
  await createAuditLog({
    action: AUDIT_ACTIONS.ADMIN_HOMEOWNER_BIDDING_LIMIT_UPDATED,
    entityType: 'user',
    entityId: homeownerId,
    userId: adminId,
    metadata: { previousLimit: homeowner.biddingLeadsLimit, newLimit: updatedHomeowner.biddingLeadsLimit, reason },
  });
  
  if (notify) {
    await createBulkNotifications([{
      recipientUserId: homeownerId,
      role: UserRole.HOMEOWNER,
      actionType: NotificationType.SYSTEM,
      messageKey: 'homeowner.system.bidding_limit_updated',
      routeKey: 'homeowner.dashboard',
      metadata: {
        previousLimit: homeowner.biddingLeadsLimit,
        newLimit: updatedHomeowner.biddingLeadsLimit,
        remainingBiddingAllowance: Math.max(updatedHomeowner.biddingLeadsLimit - updatedHomeowner.biddingLeadsSubmitted, 0),
      },
    }]);
  }
  
  return updatedHomeowner;
}
```

5. **Update Lead Creation Logic** (`src/lib/services/lead-service.ts`):
```typescript
// BEFORE (❌ Hardcoded)
if (input.quoteType === 'BIDDING') {
  if (homeownerWithBidding.biddingLeadsSubmitted >= 1) {
    throw new Error('BIDDING quota exceeded. You can only create 1 bidding quote per account.');
  }
}

// AFTER (✅ Database-driven)
if (input.quoteType === 'BIDDING') {
  const biddingLimit = homeowner.biddingLeadsLimit ?? 1; // Default to 1 if not set
  if (homeownerWithBidding.biddingLeadsSubmitted >= biddingLimit) {
    throw new Error(`BIDDING quota exceeded. You can only create ${biddingLimit} bidding quote(s) per account.`);
  }
}
```

6. **Admin Panel UI Enhancement**:
   - Add "Bidding Lead Quota" input field next to "Regular Quote Limit"
   - Display current usage: `{biddingLeadsSubmitted} / {biddingLeadsLimit}`
   - Add update button with reason textarea (audit trail)

**Files to Create/Modify:**
- 🆕 `prisma/migrations/YYYYMMDDHHMMSS_add_bidding_leads_limit/migration.sql`
- 🆕 `src/app/api/admin/homeowners/[id]/bidding-limit/route.ts`
- ⚠️ `src/lib/services/homeowner-admin-service.ts` (add function)
- ⚠️ `src/lib/services/lead-service.ts` (update limit check)
- ⚠️ `src/lib/services/audit-logger.ts` (add `ADMIN_HOMEOWNER_BIDDING_LIMIT_UPDATED` action)
- ⚠️ Admin panel homeowner detail page (add UI input)

**Testing Requirements:**
- Admin sets homeowner bidding limit from 1 → 3
- Homeowner can now create 3 bidding leads (not just 1)
- Audit log records change with admin ID, reason, timestamps
- Homeowner receives notification (if notify=true)

---

## Testing Strategy

### E2E Testing with Playwright

#### Test Suite 1: Marketplace Quote Limit Refresh

**Test: Admin increases limit, homeowner sees update on marketplace**

```typescript
// tests/e2e/quote-limit-marketplace.spec.ts

test('homeowner sees updated quote limit after admin increase on marketplace page', async ({ page, context }) => {
  // Step 1: Login as homeowner
  await page.goto('/homeowner/login');
  await page.fill('input[name="email"]', 'homeowner@test.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Step 2: Navigate to marketplace, check initial limit
  await page.goto('/');
  const initialLimit = await page.locator('[data-testid="remaining-quota"]').textContent();
  expect(initialLimit).toContain('5 of 5'); // Default limit
  
  // Step 3: Open admin panel in new tab, increase limit
  const adminPage = await context.newPage();
  await adminPage.goto('/admin/homeowners');
  // ... find homeowner, increase limit to 20
  await adminPage.fill('input[name="quoteLimit"]', '20');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForResponse('/api/admin/homeowners/*/lead-limit');
  
  // Step 4: Refresh marketplace page, verify updated limit
  await page.reload();
  const updatedLimit = await page.locator('[data-testid="remaining-quota"]').textContent();
  expect(updatedLimit).toContain('20 of 20'); // ✅ Should reflect new limit
});
```

#### Test Suite 2: Bidding Lead Quota Admin Control

**Test: Admin adjusts bidding limit, homeowner can create additional bidding leads**

```typescript
// tests/e2e/bidding-limit-admin.spec.ts

test('admin can increase homeowner bidding limit and homeowner creates multiple bidding leads', async ({ page, context }) => {
  // Step 1: Admin increases bidding limit to 3
  await page.goto('/admin/homeowners');
  await page.click('[data-homeowner-id="homeowner-123"]');
  await page.fill('input[name="biddingLimit"]', '3');
  await page.fill('textarea[name="reason"]', 'VIP customer - approved for 3 bidding quotes');
  await page.click('button[data-action="update-bidding-limit"]');
  await page.waitForResponse('/api/admin/homeowners/*/bidding-limit');
  
  // Step 2: Login as homeowner
  const homeownerPage = await context.newPage();
  await homeownerPage.goto('/homeowner/login');
  await homeownerPage.fill('input[name="email"]', 'homeowner@test.com');
  await homeownerPage.fill('input[name="password"]', 'password');
  await homeownerPage.click('button[type="submit"]');
  
  // Step 3: Create first bidding lead
  await homeownerPage.goto('/homeowner/dashboard');
  await homeownerPage.click('[data-action="request-more-quotes"]');
  await homeownerPage.click('[data-quote-type="bidding"]');
  await homeownerPage.fill('input[name="location"]', 'Sydney');
  await homeownerPage.click('button[type="submit"]');
  await homeownerPage.waitForResponse('/api/leads');
  
  // Step 4: Verify bidding quota indicator shows 1/3
  const quota1 = await homeownerPage.locator('[data-testid="bidding-quota"]').textContent();
  expect(quota1).toContain('1 / 3');
  
  // Step 5: Create second bidding lead (should succeed, not blocked)
  await homeownerPage.click('[data-action="request-more-quotes"]');
  await homeownerPage.click('[data-quote-type="bidding"]');
  await homeownerPage.fill('input[name="location"]', 'Melbourne');
  await homeownerPage.click('button[type="submit"]');
  await homeownerPage.waitForResponse('/api/leads');
  
  // Step 6: Verify bidding quota indicator shows 2/3
  const quota2 = await homeownerPage.locator('[data-testid="bidding-quota"]').textContent();
  expect(quota2).toContain('2 / 3');
  
  // Step 7: Create third bidding lead
  await homeownerPage.click('[data-action="request-more-quotes"]');
  await homeownerPage.click('[data-quote-type="bidding"]');
  await homeownerPage.fill('input[name="location"]', 'Brisbane');
  await homeownerPage.click('button[type="submit"]');
  await homeownerPage.waitForResponse('/api/leads');
  
  // Step 8: Verify bidding quota indicator shows 3/3 (limit reached)
  const quota3 = await homeownerPage.locator('[data-testid="bidding-quota"]').textContent();
  expect(quota3).toContain('3 / 3');
  
  // Step 9: Attempt fourth bidding lead (should be blocked)
  await homeownerPage.click('[data-action="request-more-quotes"]');
  await homeownerPage.click('[data-quote-type="bidding"]');
  await homeownerPage.fill('input[name="location"]', 'Perth');
  await homeownerPage.click('button[type="submit"]');
  
  // Expect error message
  const errorMessage = await homeownerPage.locator('[data-testid="error-message"]').textContent();
  expect(errorMessage).toContain('BIDDING quota exceeded');
});
```

---

## Implementation Plan

### Phase 1: Fix Marketplace Stale Data (High Priority)

| Task ID | Description | Files | Estimated Time |
|---------|-------------|-------|---------------|
| T1.1 | Update `src/app/page.tsx` to fetch quote limit from API | `src/app/page.tsx` | 1 hour |
| T1.2 | Replace `MAX_LEADS` constant with state variable | `src/app/page.tsx` | 30 mins |
| T1.3 | Add session refresh trigger in admin limit update endpoint | `src/app/api/admin/homeowners/[id]/lead-limit/route.ts` | 30 mins |
| T1.4 | Test marketplace limit refresh after admin update | Playwright tests | 1 hour |
| T1.5 | Validate TypeScript compilation (`npx tsc --noEmit`) | All files | 15 mins |

**Total Time**: ~3 hours

### Phase 2: Add Bidding Lead Quota Admin Control (Medium Priority)

| Task ID | Description | Files | Estimated Time |
|---------|-------------|-------|---------------|
| T2.1 | Add `biddingLeadsLimit` field to Prisma schema | `prisma/schema.prisma` | 15 mins |
| T2.2 | Run Prisma migration | `npx prisma migrate dev` | 15 mins |
| T2.3 | Create `updateHomeownerBiddingLimit` service function | `src/lib/services/homeowner-admin-service.ts` | 1 hour |
| T2.4 | Create `/api/admin/homeowners/[id]/bidding-limit` endpoint | `src/app/api/admin/homeowners/[id]/bidding-limit/route.ts` | 1 hour |
| T2.5 | Update lead creation service to use `biddingLeadsLimit` | `src/lib/services/lead-service.ts` | 30 mins |
| T2.6 | Add audit log action `ADMIN_HOMEOWNER_BIDDING_LIMIT_UPDATED` | `src/lib/services/audit-logger.ts` | 15 mins |
| T2.7 | Add bidding limit input to admin panel UI | Admin panel homeowner detail page | 1.5 hours |
| T2.8 | Test bidding limit update flow end-to-end | Playwright tests | 2 hours |
| T2.9 | Validate TypeScript compilation | All files | 15 mins |

**Total Time**: ~7 hours

### Phase 3: Testing & Validation (High Priority)

| Task ID | Description | Files | Estimated Time |
|---------|-------------|-------|---------------|
| T3.1 | Write Playwright test for marketplace limit refresh | `tests/e2e/quote-limit-marketplace.spec.ts` | 1.5 hours |
| T3.2 | Write Playwright test for bidding limit admin control | `tests/e2e/bidding-limit-admin.spec.ts` | 2 hours |
| T3.3 | Run all Playwright tests | `npx playwright test` | 30 mins |
| T3.4 | Manual UAT testing (admin + homeowner flows) | N/A | 1 hour |
| T3.5 | Fix any issues discovered in testing | Various | 2 hours (buffer) |

**Total Time**: ~7 hours

**Grand Total**: ~17 hours (2 working days)

---

## Risk Assessment

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Database migration fails in production | Low | High | Test migration in staging, backup database before deploy |
| Existing bidding leads break after limit change | Low | Medium | Default `biddingLeadsLimit` to 1 (backward compatible) |
| Session refresh doesn't propagate to marketplace | Medium | High | Add polling fallback, test session update mechanism |
| Admin accidentally sets bidding limit to 0 | Low | Medium | Validate `biddingLimit >= 0` in API, show warning in UI |

---

## Success Criteria

### Phase 1 Success Criteria

- [ ] Admin increases homeowner quote limit from 5 → 20 via admin panel
- [ ] Homeowner refreshes marketplace page
- [ ] Marketplace displays "20 of 20" quota (not "5 of 5")
- [ ] Homeowner can generate new lead without "Quote Limit Reached" modal
- [ ] TypeScript compilation: 0 errors
- [ ] Playwright test passes: `quote-limit-marketplace.spec.ts`

### Phase 2 Success Criteria

- [ ] Admin panel displays "Bidding Lead Quota" input field
- [ ] Admin increases bidding limit from 1 → 3 for test homeowner
- [ ] Homeowner creates 3 bidding leads successfully (not blocked at 1)
- [ ] Homeowner blocked from creating 4th bidding lead
- [ ] Audit log records change with admin ID, reason, timestamps
- [ ] Homeowner receives notification (if notify=true)
- [ ] TypeScript compilation: 0 errors
- [ ] Playwright test passes: `bidding-limit-admin.spec.ts`

---

## Appendix: Code Snippets

### A. Current vs. Proposed Marketplace Data Fetch

**Current Implementation (Incorrect):**

```typescript
// src/app/page.tsx - Line 56
const MAX_LEADS = 5; // ❌ Hardcoded constant

// Line 127
const remaining = Math.max(0, MAX_LEADS - leadCount);
setRemainingLeadQuota(remaining);
```

**Proposed Implementation (Correct):**

```typescript
// src/app/page.tsx - Add new state variable
const [userQuoteLimit, setUserQuoteLimit] = useState<number>(5);

// Line 99 - Update useEffect
useEffect(() => {
  const fetchUserLeadData = async () => {
    if (status === 'authenticated' && session?.user?.id) {
      // Fetch homeowner dashboard summary for real-time quote limit
      const dashboardResponse = await fetch('/api/homeowner/dashboard');
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setUserQuoteLimit(dashboardData.quoteLimit); // ✅ From database
        
        const leadCount = dashboardData.totalSubmitted;
        setUserLeadCount(leadCount);
        
        const remaining = Math.max(0, dashboardData.quoteLimit - leadCount);
        setRemainingLeadQuota(remaining);
      }
    }
  };
  fetchUserLeadData();
}, [status, session?.user?.id]);
```

### B. Proposed Prisma Schema Addition

```prisma
// prisma/schema.prisma
model User {
  id                    String               @id @default(cuid())
  email                 String               @unique
  role                  UserRole
  
  // Existing quote management fields
  leadSubmissionCount   Int                  @default(0)
  leadSubmissionLimit   Int                  @default(5)      // ✅ Admin-adjustable (already implemented)
  
  // Existing bidding fields
  biddingLeadsSubmitted Int                  @default(0)      // ✅ Tracks usage (already implemented)
  
  // 🆕 NEW FIELD - Bidding quota limit (admin-adjustable)
  biddingLeadsLimit     Int                  @default(1)      // 🆕 Add this field
  
  // ... other fields
}
```

### C. Proposed Admin Panel UI Mockup

```tsx
// Admin Homeowner Detail Page - Quote Limits Section

<div className="quote-limits-section">
  <h3>Quote Submission Limits</h3>
  
  {/* Regular Quote Limit */}
  <div className="limit-control">
    <label>Regular Quote Limit</label>
    <input 
      type="number" 
      name="quoteLimit" 
      value={homeowner.leadSubmissionLimit}
      onChange={(e) => setQuoteLimit(Number(e.target.value))}
    />
    <p className="usage">Usage: {homeowner.leadSubmissionCount} / {homeowner.leadSubmissionLimit}</p>
  </div>
  
  {/* 🆕 NEW: Bidding Lead Limit */}
  <div className="limit-control">
    <label>Bidding Lead Quota</label>
    <input 
      type="number" 
      name="biddingLimit" 
      value={homeowner.biddingLeadsLimit}
      onChange={(e) => setBiddingLimit(Number(e.target.value))}
    />
    <p className="usage">Usage: {homeowner.biddingLeadsSubmitted} / {homeowner.biddingLeadsLimit}</p>
  </div>
  
  {/* Reason for change (audit trail) */}
  <div className="reason-control">
    <label>Reason for Change</label>
    <textarea 
      name="reason" 
      placeholder="e.g., VIP customer, special approval..."
      value={reason}
      onChange={(e) => setReason(e.target.value)}
    />
  </div>
  
  <button onClick={handleUpdateLimits}>Update Limits</button>
</div>
```

---

## Conclusion

This audit reveals two critical architectural issues:

1. **UI-Backend State Mismatch**: Marketplace page violates Constitutional Article III (UI as Consumer) by using hardcoded constants instead of fetching database state.

2. **Incomplete Admin Authority**: Missing bidding quota control violates Constitutional Article II (Roles Grant Power) by preventing admins from managing business-critical parameters.

Both issues are **HIGH PRIORITY** and should be addressed before production deployment to ensure:
- Homeowners receive updated quotas immediately across all pages
- Admins have full control over quote/bidding limits
- System adheres to constitutional principles (zero-trust, data sovereignty, domain separation)

**Estimated Implementation Time**: 17 hours (2 working days)

**Risk Level**: Medium (requires database migration and session management)

**Recommendation**: Implement Phase 1 immediately (high impact, low risk), then Phase 2 as next sprint priority.

---

**Audit Completed By**: GitHub Copilot (AI Assistant)  
**Review Required By**: Senior Staff Software Architect  
**Next Steps**: Create implementation phase in `specs/008-description-enhance-existing/tasks.md`
