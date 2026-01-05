# Lead Generation Flows: Verification Logic Audit (3rd-5th Leads)
**Date:** November 18, 2025  
**Auditor:** GitHub Copilot  
**Status:** 🔴 CRITICAL BUG IDENTIFIED

---

## Executive Summary

**ISSUE:** Users with 2 or more leads who have already verified their phone number are being shown the `ContactVerificationModal` again when trying to generate their 3rd, 4th, or 5th lead. This is incorrect behavior — phone verification should only be required ONCE during the 2nd lead generation.

**ROOT CAUSE:** The `handleProceedToDetailedQuote()` function in `src/app/page.tsx` (line 148) checks for verification using the condition `userLeadCount >= 1 && !isPhoneVerified`. However, for users with 2+ leads, this condition evaluates to:
- `userLeadCount = 2` → `userLeadCount >= 1` = TRUE ✅
- `isPhoneVerified = true` (already verified) → `!isPhoneVerified` = FALSE ❌
- **Result:** Should route to `QuoteTypeDistributionModal` (Flow 4)

**BUT** the user reports seeing `ContactVerificationModal` instead, indicating that `isPhoneVerified` is incorrectly FALSE when it should be TRUE.

---

## Current System Configuration

### Lead Submission Limits (from `prisma/seed-settings.ts`)

| Setting | Value | Description |
|---------|-------|-------------|
| `MAX_LEAD_SUBMISSIONS_BEFORE_VERIFICATION` | 1 | User can submit 1 lead without verification |
| `MAX_LEAD_SUBMISSIONS_TOTAL` | 5 | Maximum 5 leads total (even after verification) |

### Expected Flow Behavior

| Lead Count | Phone Verified | Expected Flow | Expected Modal |
|-----------|---------------|---------------|----------------|
| 0 | N/A | First lead (Flow 2) | QuoteOptionsModal → HomeownersInfoForm → FirstQuoteSuccessModal |
| 1 | No | Second lead (Flow 3) | ContactVerificationModal → OTP → QuoteTypeDistributionModal |
| 1 | Yes | Second lead (Flow 4) | QuoteTypeDistributionModal directly |
| 2 | Yes | Third lead (Flow 4) | QuoteTypeDistributionModal directly |
| 3 | Yes | Fourth lead (Flow 4) | QuoteTypeDistributionModal directly |
| 4 | Yes | Fifth lead (Flow 4) | QuoteTypeDistributionModal directly |
| 5 | Yes | Limit reached (Flow 5) | LeadLimitReachedModal |

---

## Code Analysis

### Flow Routing Logic: `handleProceedToDetailedQuote()` (Lines 148-193)

```tsx
const handleProceedToDetailedQuote = () => {
  console.log('[handleProceedToDetailedQuote] Flow routing decision:', {
    status,
    userLeadCount,
    isPhoneVerified,
    remainingLeadQuota,
    sessionUser: session?.user?.email,
  });

  // Guest users (not authenticated) - show QuoteOptionsModal
  if (status !== 'authenticated' || !session?.user) {
    console.log('[Flow 1] Guest user → QuoteOptionsModal');
    setIsQuoteOptionsModalOpen(true);
    return;
  }

  // Authenticated users - route based on lead count
  // Flow 2: First lead (0 leads) - show QuoteOptionsModal to select quote type
  if (userLeadCount === 0) {
    console.log('[Flow 2] First lead (0 leads) → QuoteOptionsModal');
    setIsQuoteOptionsModalOpen(true);
    return;
  }

  // Flow 5: Lead limit reached (NO remaining quota) - block further requests
  if (remainingLeadQuota <= 0) {
    console.log('[Flow 5] Lead limit reached (0 remaining quota, ' + userLeadCount + ' leads used) → LeadLimitReachedModal');
    setIsLeadLimitReachedModalOpen(true);
    return;
  }

  // Flow 3: Second+ lead, unverified phone - show verification modal
  if (userLeadCount >= 1 && !isPhoneVerified) {
    console.log('[Flow 3] Second+ lead, unverified phone (' + remainingLeadQuota + ' remaining) → ContactVerificationModal');
    setIsContactVerificationModalOpen(true);
    return;
  }

  // Flow 4: Second+ lead, verified phone - show distribution modal
  if (userLeadCount >= 1 && isPhoneVerified) {
    console.log('[Flow 4] Second+ lead, verified phone (' + remainingLeadQuota + ' remaining) → QuoteTypeDistributionModal');
    setIsQuoteTypeDistributionModalOpen(true);
    return;
  }

  // Fallback (should never reach here)
  console.warn('[Flow Error] No matching flow condition. State:', { userLeadCount, isPhoneVerified });
};
```

**Analysis:**
- ✅ Logic is CORRECT
- ✅ Flow 3 condition: `userLeadCount >= 1 && !isPhoneVerified` → ContactVerificationModal
- ✅ Flow 4 condition: `userLeadCount >= 1 && isPhoneVerified` → QuoteTypeDistributionModal
- ❌ **ISSUE:** For users with 2+ verified leads, `isPhoneVerified` should be TRUE, but it's evaluating as FALSE

---

## Root Cause Investigation

### Hypothesis 1: State Not Persisting After OTP Verification

**Where `isPhoneVerified` is Set:**

#### Initial Load (useEffect, Lines 84-137)
```tsx
useEffect(() => {
  const fetchUserLeadData = async () => {
    if (status === 'authenticated' && session?.user?.id) {
      // Fetch leads
      const response = await fetch('/api/leads');
      const data = await response.json();
      setUserLeadCount(data.leads?.length || 0);
      
      // Fetch user verification status
      const userResponse = await fetch('/api/user/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setIsPhoneVerified(userData.phoneVerified || false); // ✅ Loads from DB
        setUserPhoneNumber(userData.phoneNumber || session?.user?.phone || '');
      } else {
        // Fallback to session
        setIsPhoneVerified(session?.user?.phoneVerified || false); // ⚠️ Fallback to session
        setUserPhoneNumber(session?.user?.phone || '');
      }
    }
  };

  fetchUserLeadData();
}, [status, session]);
```

#### After OTP Verification (handleOTPVerificationSuccess, Lines 387-410)
```tsx
const handleOTPVerificationSuccess = async () => {
  setShowOTPModal(false);
  setPendingOTP(null);
  setIsPhoneVerified(true); // ✅ Sets state to TRUE locally
  
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

**PROBLEM IDENTIFIED:**
1. ✅ User verifies phone during 2nd lead → `setIsPhoneVerified(true)` is called locally
2. ✅ User generates 2nd lead successfully
3. ❌ **User closes browser or refreshes page**
4. ❌ On next visit, `useEffect` runs again and fetches from `/api/user/me` or `session`
5. ❌ If NextAuth session wasn't updated with `phoneVerified: true`, state resets to FALSE
6. ❌ User tries to generate 3rd lead → `isPhoneVerified = false` → Shows ContactVerificationModal again!

---

## Database vs Session State Mismatch

### What Happens During OTP Verification

**Step 1:** User verifies OTP via `/api/verification/verify-otp`

**Backend Code (verify-otp/route.ts, Lines 60-115):**
```typescript
// Update user's phoneVerified status
await prisma.user.update({
  where: { id: verification.userId },
  data: {
    phoneVerified: true, // ✅ DATABASE UPDATED
    phone: verification.phoneNumber,
    phoneVerifiedAt: new Date(),
  },
});

// Update all leads for this user to verified
const updatedLeads = await prisma.lead.updateMany({
  where: { homeownerId: verification.userId },
  data: { phoneVerified: true },
});

return NextResponse.json({
  success: true,
  verified: true,
  message: `Your phone number has been successfully verified.`,
  phoneVerified: true, // ✅ RESPONSE RETURNS TRUE
  leadsUpdated: updatedLeads.count,
});
```

✅ **Database is updated correctly with `phoneVerified: true`**

### Issue: NextAuth Session Not Updated

**Problem:** NextAuth session (`session.user.phoneVerified`) is **NOT** automatically updated when the database changes. The session is cached and only refreshed on:
1. Page reload
2. Manual `update()` call from `useSession`
3. Session refresh interval (default: 24 hours)

**Current Code Missing:** After OTP verification success, there's NO call to `update()` from `next-auth/react` to refresh the session.

---

## Impact Analysis

### User Journey: 3rd Lead Generation (BROKEN)

**User State:**
- Lead count: 2
- Phone verified: TRUE (in database)
- Session cached: `phoneVerified: false` (stale session)

**User Action:** Generates 3rd lead

**Expected Flow:**
1. InstantQuote → "Get Your Quotes"
2. `handleProceedToDetailedQuote()` checks `userLeadCount >= 1 && isPhoneVerified`
3. Routes to `QuoteTypeDistributionModal` ✅

**Actual Broken Flow:**
1. InstantQuote → "Get Your Quotes"
2. `handleProceedToDetailedQuote()` checks `userLeadCount >= 1 && !isPhoneVerified`
3. `isPhoneVerified` fetched from stale session → FALSE ❌
4. Routes to `ContactVerificationModal` ❌ (WRONG!)
5. User confused: "I already verified!"

---

## Gaps Identified

### Gap 1: Session Not Updated After OTP Verification
**Location:** `src/app/page.tsx`, `handleOTPVerificationSuccess()` (Line 387)

**Current:**
```tsx
const handleOTPVerificationSuccess = async () => {
  setShowOTPModal(false);
  setPendingOTP(null);
  setIsPhoneVerified(true); // ✅ Local state updated
  
  // ... refresh lead count ...
  
  setIsQuoteTypeDistributionModalOpen(true);
};
```

**Missing:** No call to `update()` from `useSession` to refresh NextAuth session with new `phoneVerified: true` value.

**Fix Required:**
```tsx
const { data: session, update: updateSession } = useSession(); // ✅ Import update function

const handleOTPVerificationSuccess = async () => {
  setShowOTPModal(false);
  setPendingOTP(null);
  setIsPhoneVerified(true);
  
  // ✅ UPDATE SESSION with new phoneVerified status
  await updateSession({
    ...session,
    user: {
      ...session?.user,
      phoneVerified: true,
    },
  });
  
  // Refresh lead data...
  setIsQuoteTypeDistributionModalOpen(true);
};
```

---

### Gap 2: useEffect Dependency on Session
**Location:** `src/app/page.tsx`, `useEffect` (Line 84)

**Current:**
```tsx
useEffect(() => {
  fetchUserLeadData();
}, [status, session]); // ⚠️ Runs on EVERY session change
```

**Issue:** If session updates frequently (e.g., token refresh), this will re-fetch data unnecessarily.

**Recommendation:** Add dependency on `session?.user?.id` instead of entire `session` object.

```tsx
useEffect(() => {
  fetchUserLeadData();
}, [status, session?.user?.id]); // ✅ Only runs when user ID changes
```

---

### Gap 3: No Max Lead Count Check in Frontend
**Location:** `src/app/page.tsx`, line 112-116

**Current:**
```tsx
const maxLeads = 3; // ❌ HARDCODED!
const remaining = Math.max(0, maxLeads - leadCount);
setRemainingLeadQuota(remaining);
```

**Issue:** Hardcoded to 3, but backend uses 5 (from `MAX_LEAD_SUBMISSIONS_TOTAL` setting).

**Fix Required:**
```tsx
// ✅ Fetch from backend settings or use consistent constant
const MAX_LEADS = 5; // Match backend setting
const remaining = Math.max(0, MAX_LEADS - leadCount);
setRemainingLeadQuota(remaining);
```

---

### Gap 4: Lead Limit Check Incorrect
**Location:** `src/app/page.tsx`, line 172-176

**Current:**
```tsx
// Flow 5: Lead limit reached (NO remaining quota) - block further requests
if (remainingLeadQuota <= 0) {
  console.log('[Flow 5] Lead limit reached...');
  setIsLeadLimitReachedModalOpen(true);
  return;
}
```

**Issue:** Should check `userLeadCount >= 5`, not `remainingLeadQuota <= 0` (which depends on incorrect hardcoded max of 3).

**Fix Required:**
```tsx
// Flow 5: Lead limit reached (5 leads total)
if (userLeadCount >= 5) {
  console.log('[Flow 5] Lead limit reached (5/5 leads)');
  setIsLeadLimitReachedModalOpen(true);
  return;
}
```

---

## Recommended Fixes

### Fix 1: Update Session After OTP Verification ⚡ CRITICAL

**File:** `src/app/page.tsx`

**Change:**
```tsx
// Import update function
const { data: session, status, update: updateSession } = useSession();

// In handleOTPVerificationSuccess
const handleOTPVerificationSuccess = async () => {
  setShowOTPModal(false);
  setPendingOTP(null);
  setIsPhoneVerified(true);
  
  // ✅ UPDATE SESSION with verified status
  try {
    await updateSession({
      user: {
        ...session?.user,
        phoneVerified: true,
      },
    });
    console.log('[OTP Success] Session updated with phoneVerified: true');
  } catch (error) {
    console.error('[OTP Success] Failed to update session:', error);
  }
  
  // Refresh lead count...
  setIsQuoteTypeDistributionModalOpen(true);
};
```

---

### Fix 2: Use Consistent MAX_LEADS Constant

**File:** `src/app/page.tsx`

**Add constant at top:**
```tsx
const MAX_LEADS = 5; // Match backend MAX_LEAD_SUBMISSIONS_TOTAL setting
```

**Update calculations:**
```tsx
// Line 115
const remaining = Math.max(0, MAX_LEADS - leadCount);

// Line 172
if (userLeadCount >= MAX_LEADS) {
  setIsLeadLimitReachedModalOpen(true);
  return;
}

// Line 227
if (userLeadCount >= MAX_LEADS) {
  setIsLeadLimitReachedModalOpen(true);
  return;
}
```

---

### Fix 3: Optimize useEffect Dependencies

**File:** `src/app/page.tsx`

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

---

### Fix 4: Add Verification Status Logging

**File:** `src/app/page.tsx`

**In `handleProceedToDetailedQuote`:**
```tsx
console.log('[handleProceedToDetailedQuote] Flow routing decision:', {
  status,
  userLeadCount,
  isPhoneVerified, // ✅ Already logged
  remainingLeadQuota,
  sessionUser: session?.user?.email,
  // ✅ ADD: Session verification status for debugging
  sessionPhoneVerified: session?.user?.phoneVerified,
  dbPhoneVerified: isPhoneVerified, // Local state from /api/user/me
});
```

---

## Implementation Plan

### Phase 1: Critical Session Update Fix

1. ✅ Import `update` from `useSession`
2. ✅ Call `updateSession()` after OTP verification
3. ✅ Test: Verify phone, close browser, reopen, generate 3rd lead
4. ✅ Verify: No ContactVerificationModal shows for 3rd lead

### Phase 2: Constant Cleanup

1. ✅ Define `MAX_LEADS = 5` constant
2. ✅ Replace hardcoded `3` with `MAX_LEADS`
3. ✅ Update limit checks to use `userLeadCount >= MAX_LEADS`
4. ✅ Test: Generate 5 leads, verify LeadLimitReachedModal appears on 6th attempt

### Phase 3: Logging & Debugging

1. ✅ Add session vs local state comparison logs
2. ✅ Monitor console for mismatches
3. ✅ Verify flow routing decisions are correct

### Phase 4: Testing Matrix

| Lead Count | Phone Verified | Expected Modal | Test Result |
|-----------|---------------|----------------|-------------|
| 0 | N/A | QuoteOptionsModal → HomeownersInfoForm | ⏳ TO TEST |
| 1 | No | ContactVerificationModal | ⏳ TO TEST |
| 1 | Yes | QuoteTypeDistributionModal | ⏳ TO TEST |
| 2 | Yes | QuoteTypeDistributionModal | ⏳ TO TEST |
| 3 | Yes | QuoteTypeDistributionModal | ⏳ TO TEST |
| 4 | Yes | QuoteTypeDistributionModal | ⏳ TO TEST |
| 5 | Yes | LeadLimitReachedModal | ⏳ TO TEST |

---

## Files to Modify

1. ✅ `src/app/page.tsx` - Main routing logic
2. ⚠️ (Optional) Create constant file: `src/lib/constants/lead-limits.ts`

---

## Success Criteria

✅ **Fix Complete When:**
1. Users with 2+ verified leads can generate additional leads without seeing ContactVerificationModal
2. Verification modal only shows ONCE during 2nd lead generation
3. Lead limit modal correctly shows after 5th lead
4. Session state matches database state after verification
5. No verification modal re-appears after page refresh

---

## Next Steps

1. ✅ Implement Fix 1 (Session update) - **CRITICAL**
2. ✅ Implement Fix 2 (Constant cleanup)
3. ✅ Run test matrix
4. ✅ Create phase in tasks.md
5. ✅ Deploy and verify in production

---

**END OF AUDIT REPORT**
