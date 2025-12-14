# Phase 13S.2 Gap Analysis & Fix Plan

**Date**: December 14, 2025  
**Auditor**: AI Assistant  
**Scope**: Admin bidding usage display + Quote Distribution Modal bidding limit  

---

## Executive Summary

After implementing Phase 13S.2 (admin bidding limit control), testing revealed **2 critical gaps**:

1. ❌ **Admin bidding usage column showing blank/not updating**
2. ❌ **Quote Distribution Modal not respecting dynamic bidding limits**

**Root Causes Identified:**
- `/api/admin/homeowners` endpoint NOT returning `biddingLeadsSubmitted` and `biddingLeadsLimit` fields
- `QuoteTypeDistributionModal` only checks boolean `userAlreadyHasBiddingLead` instead of dynamic limit
- Marketplace page not fetching or passing bidding limit to modal

---

## Issue 1: Admin Bidding Usage Column Empty

### Current Behavior
- Admin panel shows "Bidding Usage" column with edit button
- Values display as "undefined/undefined" or blank
- Editing doesn't update visually

### Root Cause
**File**: `src/app/api/admin/homeowners/route.ts`  
**Line**: 109-140 (SQL query SELECT clause)

The SQL query that fetches homeowner data does NOT include:
- `biddingLeadsSubmitted`
- `biddingLeadsLimit`

```sql
-- Current query (missing fields)
SELECT
  u."id",
  u."name",
  u."email",
  u."leadSubmissionCount",
  u."leadSubmissionLimit",
  -- ❌ biddingLeadsSubmitted NOT SELECTED
  -- ❌ biddingLeadsLimit NOT SELECTED
  ...
FROM "users" u
```

### Impact
- Frontend interface TypeScript expects these fields (line 26-27 in AdminHomeownersList.tsx)
- API returns undefined → UI shows blank
- Edit operation works (saves to DB) but list refresh still shows undefined

### Fix Required
Add 2 fields to SQL SELECT:
```sql
u."biddingLeadsSubmitted",
u."biddingLeadsLimit",
```

**File**: `src/app/api/admin/homeowners/route.ts`  
**Lines**: After line 121 (after `leadSubmissionLimit`)

---

## Issue 2: Quote Distribution Modal Ignoring Dynamic Bidding Limits

### Current Behavior
- Modal always restricts bidding to 1 (hardcoded)
- Modal checks `userAlreadyHasBiddingLead` boolean
- Even if admin increases bidding limit to 5, user can only select 0 or 1

### Root Cause Analysis

**Step 1**: Modal Component Logic
**File**: `src/components/homeowner/QuoteTypeDistributionModal.tsx`  
**Line**: 83-88

```typescript
const handleBiddingChange = (count: number) => {
  if (count === 1 && userAlreadyHasBiddingLead) {
    alert('You have already used your one-time bidding request...');
    return;
  }
  setBiddingCount(Math.max(0, Math.min(count, 1))); // ❌ Hardcoded max 1
};
```

**Problem**:
- Max bidding count hardcoded to 1
- No dynamic limit checking

**Step 2**: Modal Props Interface
**File**: `src/components/homeowner/QuoteTypeDistributionModal.tsx`  
**Line**: 21-27

```typescript
interface QuoteTypeDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (distributions: QuoteDistribution[]) => void;
  remainingQuota: number;
  quoteData?: any;
  userAlreadyHasBiddingLead?: boolean; // ❌ Boolean only, no limit info
}
```

**Problem**:
- Interface doesn't accept bidding limit or bidding count
- Only knows if user has ANY bidding lead (boolean)

**Step 3**: Marketplace Page Data Fetching
**File**: `src/app/page.tsx`  
**Line**: 88-138 (fetchUserLeadData useEffect)

```typescript
const dashboardData = await dashboardResponse.json();
// ✅ Has: quoteLimit, remainingLeadAllowance, totalSubmitted
// ✅ Has: biddingLeadsSubmitted (used to set hasBiddingLead boolean)
// ❌ Does NOT store: biddingLeadsLimit
```

**Problem**:
- Dashboard API returns `biddingLeadsSubmitted` but page only checks > 0 (boolean)
- Page doesn't fetch or store `biddingLeadsLimit` value
- Modal receives boolean instead of dynamic limit

**Step 4**: Dashboard API Response
**File**: `src/app/api/homeowner/dashboard/route.ts`  
Need to verify if it returns `biddingLeadsLimit`

---

## Comprehensive Fix Plan

### Fix 1: Admin Panel API (Return Bidding Fields)

**File**: `src/app/api/admin/homeowners/route.ts`  
**Lines**: 109-140 (SQL SELECT clause)

**Change**: Add bidding fields to SELECT and TypeScript interface

```typescript
// Add to SQL query after line 121:
u."biddingLeadsSubmitted",
u."biddingLeadsLimit",

// Update TypeScript interface (line 109):
const itemsRaw = await prisma.$queryRaw<Array<{
  // ...existing fields...
  leadSubmissionLimit: number;
  biddingLeadsSubmitted: number; // NEW
  biddingLeadsLimit: number;     // NEW
  signupIp: string | null;
  // ...rest...
}>>(
```

**Result**: Admin list will display correct bidding usage values

---

### Fix 2: Dashboard API (Verify Returns Bidding Limit)

**File**: `src/app/api/homeowner/dashboard/route.ts`

**Action**: Verify response includes `biddingLeadsLimit` field  
**Expected**: Should already return it (Prisma model has the field)

---

### Fix 3: Marketplace Page (Fetch & Store Bidding Limit)

**File**: `src/app/page.tsx`  
**Line**: 71 (state declarations)

**Change 1**: Add state for bidding limit
```typescript
const [userQuoteLimit, setUserQuoteLimit] = useState<number>(5);
const [userBiddingLimit, setUserBiddingLimit] = useState<number>(1);     // NEW
const [userBiddingCount, setUserBiddingCount] = useState<number>(0);      // NEW
const [hasBiddingLead, setHasBiddingLead] = useState<boolean>(false);
```

**Line**: 88-138 (fetchUserLeadData useEffect)

**Change 2**: Extract bidding limit from dashboard
```typescript
const dashboardData = await dashboardResponse.json();
// ...existing code...
const biddingLimitFromDB = dashboardData.biddingLeadsLimit || 1;         // NEW
const biddingCountFromDB = dashboardData.biddingLeadsSubmitted || 0;     // NEW

setUserBiddingLimit(biddingLimitFromDB);   // NEW
setUserBiddingCount(biddingCountFromDB);   // NEW
setHasBiddingLead(biddingCountFromDB > 0);
```

**Line**: 793-810 (Modal invocation)

**Change 3**: Pass bidding limit to modal
```typescript
<QuoteTypeDistributionModal
  isOpen={isQuoteTypeDistributionModalOpen}
  onClose={() => setIsQuoteTypeDistributionModalOpen(false)}
  onSubmit={handleQuoteDistributionSubmit}
  remainingQuota={remainingLeadQuota}
  userAlreadyHasBiddingLead={hasBiddingLead}
  biddingLeadsSubmitted={userBiddingCount}   // NEW
  biddingLeadsLimit={userBiddingLimit}       // NEW
/>
```

---

### Fix 4: Quote Distribution Modal (Dynamic Bidding Limit)

**File**: `src/components/homeowner/QuoteTypeDistributionModal.tsx`  
**Line**: 21-27 (props interface)

**Change 1**: Update interface
```typescript
interface QuoteTypeDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (distributions: QuoteDistribution[]) => void;
  remainingQuota: number;
  quoteData?: any;
  userAlreadyHasBiddingLead?: boolean; // Deprecated, kept for backward compatibility
  biddingLeadsSubmitted?: number;      // NEW: Current bidding count
  biddingLeadsLimit?: number;          // NEW: Max bidding allowed
}
```

**Line**: 41-52 (component destructuring)

**Change 2**: Destructure new props
```typescript
export default function QuoteTypeDistributionModal({
  isOpen,
  onClose,
  onSubmit,
  remainingQuota,
  quoteData,
  userAlreadyHasBiddingLead = false, // Deprecated
  biddingLeadsSubmitted = 0,         // NEW
  biddingLeadsLimit = 1,             // NEW
}: QuoteTypeDistributionModalProps) {
```

**Line**: 83-88 (handleBiddingChange)

**Change 3**: Use dynamic limit
```typescript
const handleBiddingChange = (count: number) => {
  const remainingBiddingQuota = Math.max(0, biddingLeadsLimit - biddingLeadsSubmitted);
  
  if (count > 0 && remainingBiddingQuota === 0) {
    alert(`You have already used all ${biddingLeadsLimit} bidding request(s). Contact admin to increase your limit.`);
    return;
  }
  
  setBiddingCount(Math.max(0, Math.min(count, remainingBiddingQuota)));
};
```

**Line**: 230-250 (Bidding section UI)

**Change 4**: Update UI text to show dynamic limit
```typescript
<p className="text-body-small text-muted-foreground">
  Bidding Requests: {biddingLeadsSubmitted}/{biddingLeadsLimit} used
</p>

{remainingBiddingQuota > 0 ? (
  <p className="text-caption text-info">
    You have {remainingBiddingQuota} bidding request(s) remaining
  </p>
) : (
  <p className="text-caption text-warning">
    All bidding requests used. Contact admin to increase limit.
  </p>
)}
```

---

## Testing Checklist

### Test Case 1: Admin Bidding Usage Display
- [ ] Login as admin
- [ ] Navigate to Homeowners list
- [ ] Verify "Bidding Usage" column shows "0/1" (or actual values)
- [ ] Click Edit on bidding usage
- [ ] Change value to 3
- [ ] Click Save ✓
- [ ] Verify column updates to "0/3" immediately

### Test Case 2: Admin Increases Bidding Limit
- [ ] Admin increases homeowner's bidding limit from 1 → 5
- [ ] Verify audit log created
- [ ] Verify homeowner receives notification
- [ ] Verify database shows `biddingLeadsLimit = 5`

### Test Case 3: Homeowner Quote Distribution Modal
- [ ] Login as homeowner (with 5 bidding limit)
- [ ] Go to marketplace → "Get Your Quotes"
- [ ] Open Quote Distribution Modal
- [ ] Verify bidding section shows "0/5 used"
- [ ] Verify can select up to 5 bidding requests
- [ ] Try selecting 6 → should prevent or warn
- [ ] Submit 2 bidding requests
- [ ] Verify modal now shows "2/5 used"

### Test Case 4: Bidding Limit Enforcement
- [ ] Homeowner with 2/2 bidding used
- [ ] Try to select 1 more bidding → should show alert
- [ ] Alert message: "You have already used all 2 bidding request(s)..."
- [ ] Verify cannot increase bidding count

### Test Case 5: Database Migration Verification
- [ ] Verify all existing users have `biddingLeadsLimit = 1` (default)
- [ ] Verify new users get `biddingLeadsLimit = 1`
- [ ] Verify admin can update to any value >= 0

---

## Implementation Order

1. ✅ **Fix 1**: Admin API (add bidding fields to SQL query) - 10 mins
2. ✅ **Fix 2**: Verify dashboard API returns bidding limit - 5 mins
3. ✅ **Fix 3**: Marketplace page state management - 15 mins
4. ✅ **Fix 4**: Modal dynamic limit logic - 20 mins
5. ✅ **Validation**: TypeScript compilation (0 errors) - 5 mins
6. ✅ **Testing**: Manual UAT (Test Cases 1-5) - 30 mins

**Total Estimated Time**: 85 minutes (1.5 hours)

---

## Success Criteria

- ✅ Admin panel "Bidding Usage" column displays correct values
- ✅ Admin can edit bidding limit and see immediate visual update
- ✅ Quote Distribution Modal respects dynamic bidding limits
- ✅ Modal displays "X/Y used" for bidding requests
- ✅ Modal prevents exceeding bidding limit with helpful message
- ✅ TypeScript compilation: 0 errors
- ✅ All 5 test cases pass

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing bidding logic | High | Keep backward compatibility with boolean prop |
| SQL query performance | Low | Only adding 2 fields to existing query |
| Modal UI confusion | Medium | Clear messaging about limits |
| Migration data integrity | Low | Default value (1) matches current behavior |

---

## Files to Modify

1. `src/app/api/admin/homeowners/route.ts` (SQL query + TypeScript interface)
2. `src/app/api/homeowner/dashboard/route.ts` (verify only, no changes likely)
3. `src/app/page.tsx` (state + data fetching + modal props)
4. `src/components/homeowner/QuoteTypeDistributionModal.tsx` (props + logic + UI)

**Total**: 4 files, ~80 lines of changes

---

**Next Steps**: Proceed with Fix 1 (Admin API) immediately.
