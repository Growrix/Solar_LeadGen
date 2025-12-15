# Lead Feed vs Purchased Leads Separation Audit

**Date**: November 26, 2025  
**Issue**: Purchased leads showing in both Lead Feed and Purchased Leads page  
**Goal**: Clean separation - Lead Feed shows ONLY available leads, Purchased Leads page shows ONLY purchased leads

---

## Current State Analysis

### Lead Feed (`/installer/leads`)
- **API**: `/api/installer/leads/assigned`
- **Current Behavior**: Returns ALL assigned leads (purchased + unpurchased)
- **Problem**: Shows purchased leads that should only appear on Purchased Leads page
- **Filter Logic**: Filters by `status: { not: 'CANCELLED' }` and `expiresAt` only

### Purchased Leads Page (`/installer/purchased-leads`)
- **API**: `/api/installer/leads/purchased`
- **Current Behavior**: Returns leads where `installerId === session.user.id AND purchasedAt !== null`
- **Status**: Working correctly - shows only purchased leads

---

## Root Cause

**File**: `src/app/api/installer/leads/assigned/route.ts` (Line 59-67)

```typescript
const assignments = await prisma.leadAssignment.findMany({
  where: {
    installerId: session.user.id,
    lead: {
      // Exclude CANCELLED leads
      status: { not: 'CANCELLED' },
      // ❌ MISSING: Filter out purchased leads
      ...(includeExpired ? {} : {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      })
    }
  },
  // ...
});
```

**Missing Logic**: No filter to exclude leads where `lead.installerId === session.user.id AND lead.purchasedAt !== null`

---

## Required Changes

### File: `src/app/api/installer/leads/assigned/route.ts`

**Location**: Lines 59-78 (where clause in `prisma.leadAssignment.findMany`)

**Add Filter**:
```typescript
const assignments = await prisma.leadAssignment.findMany({
  where: {
    installerId: session.user.id,
    lead: {
      status: { not: 'CANCELLED' },
      // ✅ NEW: Exclude leads purchased by this installer
      NOT: {
        AND: [
          { installerId: session.user.id },
          { purchasedAt: { not: null } }
        ]
      },
      ...(includeExpired ? {} : {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      })
    }
  },
  // ... rest stays same
});
```

---

## Expected Behavior After Fix

### Lead Feed (`/installer/leads`)
**Shows**:
- ✅ Assigned leads NOT yet purchased by this installer
- ✅ Leads purchased by OTHER installers (with "Purchased by Another" badge)
- ✅ Expired/Active leads (based on countdown)

**Hides**:
- ❌ Leads purchased by THIS installer
- ❌ Cancelled leads

### Purchased Leads Page (`/installer/purchased-leads`)
**Shows**:
- ✅ ONLY leads purchased by THIS installer (where `lead.installerId === session.user.id AND purchasedAt !== null`)
- ✅ Full contact details unlocked
- ✅ Organized by tabs: Call/Visit, Written Quotes, Bidding

---

## Testing Checklist

### Pre-Implementation Test
1. ✅ Log in as installer
2. ✅ Check Lead Feed - note count of leads
3. ✅ Purchase a lead
4. ✅ Check Lead Feed - purchased lead still visible (BUG)
5. ✅ Check Purchased Leads - purchased lead visible (CORRECT)
6. ✅ Result: Lead appears in BOTH places (WRONG)

### Post-Implementation Test
1. ✅ Log in as installer
2. ✅ Check Lead Feed - note count (e.g., 3 leads)
3. ✅ Purchase a lead
4. ✅ Check Lead Feed - count should be 2 (purchased lead removed)
5. ✅ Check Purchased Leads - purchased lead visible
6. ✅ Result: Lead appears in ONLY Purchased Leads page (CORRECT)

### Edge Cases to Test
- ✅ Lead purchased by ANOTHER installer → Still visible in MY feed with "Purchased by Another" badge
- ✅ Lead purchased by ME → Moved to Purchased Leads page, removed from feed
- ✅ Cancelled lead → Not visible anywhere
- ✅ Expired unpurchased lead → Visible in feed with expired status

---

## Implementation Plan

### Phase 1: Fix API Filter
**File**: `src/app/api/installer/leads/assigned/route.ts`
**Action**: Add `NOT` clause to exclude purchased leads by current installer
**Test**: API returns correct leads after purchase

### Phase 2: Verify Frontend
**File**: `src/app/installer/(dashboard)/leads/page.tsx`
**Action**: Verify lead refresh after purchase updates the list correctly
**Test**: Lead disappears from feed after purchase

### Phase 3: Manual Testing
**Action**: Full user flow testing (assign → view feed → purchase → verify separation)
**Test**: All test cases pass

---

## Risk Assessment

**Risk Level**: 🟢 LOW
- **Reason**: Single API filter change, no frontend logic changes needed
- **Affected Areas**: Only `/api/installer/leads/assigned` route
- **Rollback**: Simple revert if issues occur

**Breaking Changes**: None
- Purchased Leads page API unchanged
- Frontend components unchanged
- Only filtering logic updated

---

## Success Criteria

✅ Lead Feed shows ONLY available (unpurchased by me) leads  
✅ Purchased Leads page shows ONLY my purchased leads  
✅ No lead appears in both places simultaneously  
✅ "Purchased by Another" badge works for leads bought by others  
✅ All existing functionality preserved (countdown, filters, modals)

---

**Status**: Ready for Implementation  
**Estimated Time**: 10 minutes  
**Confidence**: High (single focused change)
