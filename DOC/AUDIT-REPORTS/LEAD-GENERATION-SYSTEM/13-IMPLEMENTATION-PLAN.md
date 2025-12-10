# Implementation Plan: Fix 3rd-5th Lead Generation Flows

**Date:** November 18, 2025  
**Issue:** Verification modal showing for users with 2+ verified leads  
**Goal:** Ensure verification only required ONCE (during 2nd lead), then allow 3rd-5th leads without re-verification  

---

## Overview

This plan addresses the critical bug where users with verified phone numbers are being asked to verify again when generating their 3rd, 4th, or 5th lead. The root cause is that NextAuth session state is not being updated after OTP verification, causing stale `phoneVerified: false` data to persist across page loads.

---

## Phase 1: Critical Session Update Fix ⚡

**Priority:** CRITICAL  
**Estimated Time:** 15 minutes  
**Files:** `src/app/page.tsx`

### Step 1.1: Import Session Update Function

**Location:** Line 5 (import statements)

**Current:**
```tsx
import { useSession } from 'next-auth/react';
```

**Updated:**
```tsx
import { useSession } from 'next-auth/react';
```

**Action:** Modify `useSession` destructuring to include `update` function

**Location:** Line 54

**Current:**
```tsx
const { data: session, status } = useSession();
```

**Updated:**
```tsx
const { data: session, status, update: updateSession } = useSession();
```

---

### Step 1.2: Update Session After OTP Verification

**Location:** `handleOTPVerificationSuccess()` function (Line 387)

**Current Code:**
```tsx
const handleOTPVerificationSuccess = async () => {
  setShowOTPModal(false);
  setPendingOTP(null);
  setIsPhoneVerified(true);
  
  // Refresh user lead data after verification
  if (status === 'authenticated' && session?.user?.id) {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        const leadCount = data.leads?.length || 0;
        console.log('[Homepage] Refreshed lead data after verification:', { leadCount });
        setUserLeadCount(leadCount);
        setRemainingLeadQuota(Math.max(0, 3 - leadCount));
      }
    } catch (error) {
      console.error('[Homepage] Error refreshing lead data after verification:', error);
    }
  }
  
  // Show quote distribution modal after successful verification
  setIsQuoteTypeDistributionModalOpen(true);
};
```

**Updated Code:**
```tsx
const handleOTPVerificationSuccess = async () => {
  setShowOTPModal(false);
  setPendingOTP(null);
  setIsPhoneVerified(true);
  
  // ✅ CRITICAL FIX: Update NextAuth session with verified status
  try {
    await updateSession({
      user: {
        ...session?.user,
        phoneVerified: true,
      },
    });
    console.log('[OTP Success] ✅ Session updated with phoneVerified: true');
  } catch (error) {
    console.error('[OTP Success] ❌ Failed to update session:', error);
  }
  
  // Refresh user lead data after verification
  if (status === 'authenticated' && session?.user?.id) {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        const leadCount = data.leads?.length || 0;
        console.log('[Homepage] Refreshed lead data after verification:', { leadCount });
        setUserLeadCount(leadCount);
        setRemainingLeadQuota(Math.max(0, 5 - leadCount)); // ✅ Fixed: Use 5 instead of 3
      }
    } catch (error) {
      console.error('[Homepage] Error refreshing lead data after verification:', error);
    }
  }
  
  // Show quote distribution modal after successful verification
  setIsQuoteTypeDistributionModalOpen(true);
};
```

**Testing:**
1. Create test account
2. Generate 1st lead
3. Generate 2nd lead → Verify phone via OTP
4. Close browser completely
5. Reopen and login
6. Generate 3rd lead
7. ✅ Verify: Should go directly to QuoteTypeDistributionModal (NO verification modal)

---

## Phase 2: Fix Hardcoded Lead Limits

**Priority:** HIGH  
**Estimated Time:** 10 minutes  
**Files:** `src/app/page.tsx`

### Step 2.1: Define Constant

**Location:** Top of file, after imports (Line 50)

**Add:**
```tsx
// Lead submission limits (matches backend MAX_LEAD_SUBMISSIONS_TOTAL setting)
const MAX_LEADS = 5; // Users can submit up to 5 leads total
```

---

### Step 2.2: Update Quota Calculation in useEffect

**Location:** Line 115

**Current:**
```tsx
const maxLeads = 3;
const remaining = Math.max(0, maxLeads - leadCount);
```

**Updated:**
```tsx
const remaining = Math.max(0, MAX_LEADS - leadCount);
```

---

### Step 2.3: Update Quota Calculation in Else Block

**Location:** Line 126

**Current:**
```tsx
const maxLeads = 3;
const remaining = Math.max(0, maxLeads - leadCount);
```

**Updated:**
```tsx
const remaining = Math.max(0, MAX_LEADS - leadCount);
```

---

### Step 2.4: Fix Lead Limit Check (handleProceedToDetailedQuote)

**Location:** Line 172-176

**Current:**
```tsx
// Flow 5: Lead limit reached (NO remaining quota) - block further requests
if (remainingLeadQuota <= 0) {
  console.log('[Flow 5] Lead limit reached (0 remaining quota, ' + userLeadCount + ' leads used) → LeadLimitReachedModal');
  setIsLeadLimitReachedModalOpen(true);
  return;
}
```

**Updated:**
```tsx
// Flow 5: Lead limit reached (5 leads) - block further requests
if (userLeadCount >= MAX_LEADS) {
  console.log('[Flow 5] Lead limit reached (' + userLeadCount + '/' + MAX_LEADS + ' leads used) → LeadLimitReachedModal');
  setIsLeadLimitReachedModalOpen(true);
  return;
}
```

---

### Step 2.5: Fix Lead Limit Check (handleQuoteOptionSelected)

**Location:** Line 227-231

**Current:**
```tsx
// Flow 5: Lead limit reached (3 or more leads) - Block further requests
if (userLeadCount >= 3) {
  console.log('Lead limit reached - showing LeadLimitReachedModal');
  setIsLeadLimitReachedModalOpen(true);
  return;
}
```

**Updated:**
```tsx
// Flow 5: Lead limit reached (5 leads) - Block further requests
if (userLeadCount >= MAX_LEADS) {
  console.log('[Flow 5] Lead limit reached (' + userLeadCount + '/' + MAX_LEADS + ' leads) → LeadLimitReachedModal');
  setIsLeadLimitReachedModalOpen(true);
  return;
}
```

---

### Step 2.6: Update handleAuthenticatedFirstLead Quota

**Location:** Line 574

**Current:**
```tsx
setRemainingLeadQuota(2); // 3 max - 1 used = 2 remaining
```

**Updated:**
```tsx
setRemainingLeadQuota(MAX_LEADS - 1); // 5 max - 1 used = 4 remaining
```

---

### Step 2.7: Update handleQuoteDistributionSubmit Quota Calculation

**Location:** Line 523

**Current:**
```tsx
setRemainingLeadQuota(Math.max(0, 3 - (leadData.leads?.length || 0)));
```

**Updated:**
```tsx
setRemainingLeadQuota(Math.max(0, MAX_LEADS - (leadData.leads?.length || 0)));
```

---

## Phase 3: Optimize useEffect Dependencies

**Priority:** MEDIUM  
**Estimated Time:** 5 minutes  
**Files:** `src/app/page.tsx`

### Step 3.1: Update useEffect Dependency

**Location:** Line 137

**Current:**
```tsx
useEffect(() => {
  fetchUserLeadData();
}, [status, session]);
```

**Updated:**
```tsx
useEffect(() => {
  fetchUserLeadData();
}, [status, session?.user?.id]);
```

**Reason:** Prevents unnecessary re-fetches when session token refreshes but user ID hasn't changed.

---

## Phase 4: Enhanced Logging for Debugging

**Priority:** LOW  
**Estimated Time:** 5 minutes  
**Files:** `src/app/page.tsx`

### Step 4.1: Add Session Comparison Logging

**Location:** `handleProceedToDetailedQuote()`, Line 150

**Current:**
```tsx
console.log('[handleProceedToDetailedQuote] Flow routing decision:', {
  status,
  userLeadCount,
  isPhoneVerified,
  remainingLeadQuota,
  sessionUser: session?.user?.email,
});
```

**Updated:**
```tsx
console.log('[handleProceedToDetailedQuote] Flow routing decision:', {
  status,
  userLeadCount,
  isPhoneVerified, // Local state from /api/user/me or session
  sessionPhoneVerified: session?.user?.phoneVerified, // Direct from session
  remainingLeadQuota,
  maxLeads: MAX_LEADS,
  sessionUser: session?.user?.email,
});
```

**Purpose:** Helps identify session vs local state mismatches during debugging.

---

## Phase 5: Testing & Verification

**Priority:** CRITICAL  
**Estimated Time:** 30 minutes

### Test Matrix

| Test Case | Lead Count | Phone Verified | Expected Modal | Pass/Fail |
|-----------|-----------|---------------|----------------|-----------|
| TC-1 | 0 | N/A | QuoteOptionsModal → HomeownersInfoForm | ⏳ |
| TC-2 | 1 | No | ContactVerificationModal → OTP | ⏳ |
| TC-3 | 1 | Yes (just verified) | QuoteTypeDistributionModal | ⏳ |
| TC-4 | 2 | Yes | QuoteTypeDistributionModal | ⏳ |
| TC-5 | 3 | Yes | QuoteTypeDistributionModal | ⏳ |
| TC-6 | 4 | Yes | QuoteTypeDistributionModal | ⏳ |
| TC-7 | 5 | Yes | LeadLimitReachedModal | ⏳ |
| TC-8 | 2 (after refresh) | Yes | QuoteTypeDistributionModal (NO re-verification!) | ⏳ |

### Test Procedure for TC-8 (Critical Session Persistence Test)

**Step-by-Step:**
1. Create fresh test account: `test+nov18@example.com`
2. Generate 1st lead → Success
3. Generate 2nd lead → Verify phone via OTP → Success
4. **Close browser completely** (or use incognito mode)
5. Reopen browser and login as test user
6. Navigate to homepage
7. Fill InstantQuote form
8. Click "Get Your Quotes"
9. ✅ **EXPECTED:** QuoteTypeDistributionModal appears
10. ❌ **BUG IF:** ContactVerificationModal appears (verification shouldn't be required again!)

---

## Phase 6: Add to tasks.md

**Priority:** MEDIUM  
**Estimated Time:** 10 minutes  
**Files:** `specs/006-component-by-component/tasks.md`

### Add New Phase

**Location:** After existing phases

**Content:**
```markdown
---

## Phase 23: Fix Lead Generation Verification Logic (3rd-5th Leads)

**Status:** ⏳ IN PROGRESS  
**Goal:** Fix verification modal incorrectly showing for users with 2+ verified leads  
**Audit Report:** `DOC/AUDIT-REPORTS/LEAD-GENERATION-SYSTEM/12-LEAD-COUNT-VERIFICATION-LOGIC-AUDIT.md`  
**Implementation Plan:** `DOC/AUDIT-REPORTS/LEAD-GENERATION-SYSTEM/13-IMPLEMENTATION-PLAN.md`

### Tasks

#### T330: Update Session After OTP Verification ⚡ CRITICAL
- **File:** `src/app/page.tsx`
- **Action:** Import `update` from `useSession` and call after OTP success
- **Success:** Session persists `phoneVerified: true` across browser sessions
- **Test:** Close browser after verification, reopen, generate 3rd lead → no re-verification

#### T331: Fix Hardcoded Lead Limits
- **File:** `src/app/page.tsx`
- **Action:** Replace hardcoded `3` with `MAX_LEADS = 5` constant
- **Success:** Lead limit modal shows after 5th lead (not 3rd)
- **Test:** Generate 5 leads, verify modal appears on 6th attempt

#### T332: Optimize useEffect Dependencies
- **File:** `src/app/page.tsx`
- **Action:** Change dependency from `session` to `session?.user?.id`
- **Success:** Fewer unnecessary re-renders
- **Test:** Monitor console logs for reduced fetch calls

#### T333: Enhanced Debugging Logs
- **File:** `src/app/page.tsx`
- **Action:** Add session vs local state comparison in logs
- **Success:** Easier troubleshooting of state mismatches
- **Test:** Check console logs show both `isPhoneVerified` and `sessionPhoneVerified`

#### T334: Comprehensive Flow Testing
- **File:** N/A (Manual testing)
- **Action:** Execute full test matrix (8 test cases)
- **Success:** All 8 test cases pass, especially TC-8 (session persistence)
- **Test:** Follow test matrix in implementation plan

---

### Phase 23 Completion Criteria

✅ **Phase Complete When:**
1. Users with 2+ verified leads can generate additional leads without seeing ContactVerificationModal
2. Verification modal only shows ONCE during 2nd lead generation
3. Lead limit modal correctly shows after 5th lead (not 3rd)
4. Session state matches database state after verification
5. No verification modal re-appears after page refresh/browser close
6. All 8 test cases pass

---
```

---

## Implementation Order

**Execute in this sequence:**

1. ✅ **T330** - Session update fix (CRITICAL - fixes core bug)
2. ✅ **T331** - Lead limit constant (HIGH - prevents confusion at 3rd lead)
3. ✅ **T332** - useEffect optimization (MEDIUM - performance improvement)
4. ✅ **T333** - Enhanced logging (LOW - debugging aid)
5. ✅ **T334** - Testing (CRITICAL - validates fixes work)

---

## Rollback Plan

If issues arise after deployment:

### Rollback Step 1: Revert Session Update
**If:** Session update causes auth errors

**Action:**
```tsx
// Comment out updateSession call
// await updateSession({...});
```

### Rollback Step 2: Revert Lead Limit Changes
**If:** Lead limit changes cause unexpected behavior

**Action:**
```tsx
// Temporarily revert to hardcoded 3
const maxLeads = 3;
```

### Rollback Step 3: Full Revert
**If:** Critical issues persist

**Action:** Revert entire `src/app/page.tsx` file to previous commit

```bash
git checkout HEAD~1 -- src/app/page.tsx
```

---

## Success Metrics

**Fix Successful When:**
- ✅ Zero reports of "verification modal showing again" after 2nd lead
- ✅ 3rd-5th lead generation completes without verification prompt
- ✅ Lead limit modal appears after 5th lead (not 3rd)
- ✅ Session state persists across browser close/reopen
- ✅ Console logs show consistent `phoneVerified` values

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 (Session Fix) | 15 min | None |
| Phase 2 (Constants) | 10 min | None |
| Phase 3 (useEffect) | 5 min | None |
| Phase 4 (Logging) | 5 min | None |
| Phase 5 (Testing) | 30 min | Phases 1-4 complete |
| Phase 6 (tasks.md) | 10 min | None |
| **Total** | **75 min** | |

---

**END OF IMPLEMENTATION PLAN**
