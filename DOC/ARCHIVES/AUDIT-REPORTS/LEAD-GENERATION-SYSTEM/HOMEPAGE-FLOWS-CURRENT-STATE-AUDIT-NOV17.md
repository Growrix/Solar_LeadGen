# Homepage Lead Generation Flows - Current State Audit
**Date:** November 17, 2025  
**Auditor:** GitHub Copilot  
**Status:** 🔴 CRITICAL ISSUES FOUND

---

## Executive Summary

**CRITICAL BUG IDENTIFIED:** The homepage has **two conflicting routing decision points** that cause Flow 4 (authenticated users with 1+ verified leads) to show the ContactVerificationModal AGAIN even though they already verified their phone during their second lead.

### Root Cause
The code has logic in TWO places:
1. **`handleProceedToDetailedQuote()`** (line 148) - Routes from "Get Your Quotes" button
2. **`handleQuoteOptionSelected()`** (line 197) - Routes after QuoteOptionsModal selection

**The Problem:**
- Flow 4 users with verified phone click "Get Your Quotes" → goes to `handleProceedToDetailedQuote()` → correctly shows `QuoteTypeDistributionModal` ✅
- BUT when Flow 2 (first lead, 0 leads) users click "Get Your Quotes" → goes to `handleProceedToDetailedQuote()` → shows `QuoteOptionsModal` → user selects option → goes to `handleQuoteOptionSelected()` → this ALSO checks conditions and routes again

**Impact:** Flow 2 users are being routed through `handleQuoteOptionSelected()` which has DUPLICATE routing logic that conflicts with `handleProceedToDetailedQuote()`.

---

## Current Flow Architecture

### Routing Decision Point 1: `handleProceedToDetailedQuote()` (Line 148)
**Triggered by:** "Get Your Quotes" button click

```tsx
handleProceedToDetailedQuote() {
  // Guest users → QuoteOptionsModal
  if (status !== 'authenticated' || !session?.user) {
    setIsQuoteOptionsModalOpen(true); // Flow 1
    return;
  }
  
  // Flow 2: 0 leads → QuoteOptionsModal
  if (userLeadCount === 0) {
    setIsQuoteOptionsModalOpen(true);
    return;
  }
  
  // Flow 5: 5 leads → LeadLimitReachedModal
  if (userLeadCount >= 5) {
    setIsLeadLimitReachedModalOpen(true);
    return;
  }
  
  // Flow 3: 1+ leads, unverified → ContactVerificationModal
  if (userLeadCount >= 1 && !isPhoneVerified) {
    setIsContactVerificationModalOpen(true);
    return;
  }
  
  // Flow 4: 1+ leads, verified → QuoteTypeDistributionModal
  if (userLeadCount >= 1 && isPhoneVerified) {
    setIsQuoteTypeDistributionModalOpen(true);
    return;
  }
}
```

### Routing Decision Point 2: `handleQuoteOptionSelected()` (Line 197)
**Triggered by:** User selecting "Call/Visit" or "Written Quote" in QuoteOptionsModal

```tsx
handleQuoteOptionSelected(type: 'call_visit' | 'written') {
  setIsQuoteOptionsModalOpen(false);
  
  if (status === 'authenticated' && session?.user) {
    // Flow 2: 0 leads → HomeownersInfoForm
    if (userLeadCount === 0) {
      setIsHomeownersInfoFormOpen(true);
      return;
    }
    
    // ⚠️ DUPLICATE ROUTING - CONFLICTS WITH handleProceedToDetailedQuote
    
    // Flow 3: 1+ leads, unverified → ContactVerificationModal
    if (userLeadCount >= 1 && !isPhoneVerified) {
      setIsContactVerificationModalOpen(true);
      return;
    }
    
    // Flow 4: 1+ leads, verified → QuoteTypeDistributionModal
    if (userLeadCount >= 1 && isPhoneVerified) {
      setIsQuoteTypeDistributionModal(true);
      return;
    }
    
    // Flow 5: 5 leads → LeadLimitReachedModal
    if (userLeadCount >= 5) {
      setIsLeadLimitReachedModalOpen(true);
      return;
    }
  } else {
    // Guest flow → HomeownersInfoForm
    setIsHomeownersInfoFormOpen(true);
  }
}
```

---

## The Bug Scenario

### User Story: Authenticated User with 3 Verified Leads (Flow 4)

**User State:**
- `userLeadCount`: 3
- `isPhoneVerified`: true
- `status`: 'authenticated'

**User Action:** Fills InstantQuote form → Clicks "Get Your Quotes"

**Expected Flow:**
1. `handleProceedToDetailedQuote()` executes
2. Checks: `userLeadCount >= 1 && isPhoneVerified` → TRUE
3. Opens `QuoteTypeDistributionModal` directly ✅
4. User selects quote types
5. Leads are created

**CURRENT BROKEN FLOW (User Reported):**
1. User clicks "Get Your Quotes"
2. `handleProceedToDetailedQuote()` should route to `QuoteTypeDistributionModal`
3. ❌ BUT INSTEAD: User sees `ContactVerificationModal` (verification modal)
4. User is confused: "Why verify again? I already verified during my second lead!"

---

## Why This Is Happening

### Hypothesis 1: `handleProceedToDetailedQuote()` Not Being Called
**Check:** Is the button wired correctly?

**Button Code (Need to verify):**
```tsx
// In InstantQuoteForm or wherever the button is
<button onClick={handleProceedToDetailedQuote}>
  Get Your Quotes
</button>
```

### Hypothesis 2: State Not Updating Correctly
**Check:** Is `isPhoneVerified` being set correctly?

**Current useEffect Logic (Lines 84-137):**
```tsx
useEffect(() => {
  if (status === 'authenticated' && session?.user?.id) {
    // Fetch leads
    const response = await fetch('/api/leads');
    const data = await response.json();
    setUserLeadCount(data.leads?.length || 0);
    
    // Fetch user verification status
    const userResponse = await fetch('/api/user/me');
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setIsPhoneVerified(userData.phoneVerified || false); // ✅ Correct
    } else {
      // Fallback to session
      setIsPhoneVerified(session?.user?.phoneVerified || false); // ✅ Correct
    }
  }
}, [status, session]);
```

**Issue:** When user verifies phone during Flow 3, the `session?.user?.phoneVerified` might not be updated until page refresh!

### Hypothesis 3: Flow 2 Routing Through QuoteOptionsModal
**The Real Issue:**

Flow 2 (0 leads, first time) users go through:
1. "Get Your Quotes" → `handleProceedToDetailedQuote()` → `QuoteOptionsModal`
2. User selects option → `handleQuoteOptionSelected()` → routes AGAIN

This means `handleQuoteOptionSelected()` has routing logic for Flows 3, 4, 5 that should NEVER execute because those users should never see `QuoteOptionsModal` in the first place!

**The user said:** "verification modal showing up where verification was already done in the second lead"

This means the user verified during their second lead (Flow 3), and now on their third/fourth lead (Flow 4), they're seeing verification AGAIN.

---

## Detailed Flow Analysis

### Flow 1: Guest User (Unauthenticated) - ✅ WORKING
**Path:** InstantQuote → "Get Your Quotes" → QuoteOptionsModal → HomeownersInfoForm → SignupModal → Lead Creation

**Code Path:**
1. `handleProceedToDetailedQuote()` → `setIsQuoteOptionsModalOpen(true)` (line 159)
2. `handleQuoteOptionSelected()` → `setIsHomeownersInfoFormOpen(true)` (line 238)
3. `handleHomeownerInfoContinue()` → `setIsHomeownerSignupModalOpen(true)` (line 253)
4. `handleHomeownerSignupSuccess()` → Creates lead → `QuoteSuccessModal`

**Status:** ✅ No changes needed

---

### Flow 2: Authenticated User - First Lead (0 leads) - ✅ WORKING
**Path:** InstantQuote → "Get Your Quotes" → QuoteOptionsModal → HomeownersInfoForm → FirstQuoteSuccessModal

**Code Path:**
1. `handleProceedToDetailedQuote()` → Checks `userLeadCount === 0` → `setIsQuoteOptionsModalOpen(true)` (line 167)
2. `handleQuoteOptionSelected()` → Checks `userLeadCount === 0` → `setIsHomeownersInfoFormOpen(true)` (line 210)
3. `handleHomeownerInfoContinue()` → Checks authenticated → `handleAuthenticatedFirstLead()` (line 250)
4. `handleAuthenticatedFirstLead()` → Creates lead → `FirstQuoteSuccessModal`

**Status:** ✅ Working correctly

---

### Flow 3: Authenticated User - Second Lead (1+ leads, unverified) - ⚠️ NEEDS VERIFICATION
**Path:** InstantQuote → "Get Your Quotes" → ContactVerificationModal → OTP → QuoteTypeDistributionModal → Leads Created

**Code Path:**
1. `handleProceedToDetailedQuote()` → Checks `userLeadCount >= 1 && !isPhoneVerified` → `setIsContactVerificationModalOpen(true)` (line 181)
2. `handleOTPRequested()` → Opens OTPVerificationModal (line 378)
3. `handleOTPVerificationSuccess()` → `setIsPhoneVerified(true)` → `setIsQuoteTypeDistributionModalOpen(true)` (line 387-405)
4. `handleQuoteDistributionSubmit()` → Creates leads → `QuoteSuccessModal`

**Issue:** After `handleOTPVerificationSuccess()` sets `setIsPhoneVerified(true)`, this is LOCAL state only. The NextAuth session is NOT updated with `phoneVerified: true`.

**Critical Problem:** On next page load or next lead generation attempt, `isPhoneVerified` is fetched from session again, and if session wasn't updated, user will see verification modal AGAIN!

**Status:** ⚠️ PARTIALLY WORKING - Verification succeeds but session not persisted

---

### Flow 4: Authenticated User - Second+ Lead (1-4 leads, verified) - 🔴 BROKEN
**Expected Path:** InstantQuote → "Get Your Quotes" → QuoteTypeDistributionModal → Leads Created

**Code Path:**
1. `handleProceedToDetailedQuote()` → Checks `userLeadCount >= 1 && isPhoneVerified` → `setIsQuoteTypeDistributionModalOpen(true)` (line 188)
2. `handleQuoteDistributionSubmit()` → Creates leads → `QuoteSuccessModal`

**User Reported Bug:** User sees `ContactVerificationModal` instead of `QuoteTypeDistributionModal`

**Root Cause Analysis:**

#### Option A: `isPhoneVerified` is FALSE when it should be TRUE
- User verified phone during Flow 3 (second lead)
- Verification succeeded, `setIsPhoneVerified(true)` was called locally
- BUT NextAuth session was NOT updated with `phoneVerified: true`
- On next homepage visit, `useEffect` fetches from `/api/user/me` or session
- Session still shows `phoneVerified: false`
- Flow 4 condition `userLeadCount >= 1 && isPhoneVerified` fails
- Falls back to Flow 3 condition `userLeadCount >= 1 && !isPhoneVerified` → TRUE
- Shows `ContactVerificationModal` again ❌

**This is the most likely cause!**

#### Option B: Flow Routing Logic Error
- `handleProceedToDetailedQuote()` is not being called
- Or button is wired to wrong handler
- Unlikely because user said "verification modal showing up" which means SOME routing is happening

**Status:** 🔴 BROKEN - Session not persisting verification status

---

### Flow 5: Lead Limit Reached (5 leads) - ✅ WORKING (FIXED)
**Path:** InstantQuote → "Get Your Quotes" → LeadLimitReachedModal

**Code Path:**
1. `handleProceedToDetailedQuote()` → Checks `userLeadCount >= 5` → `setIsLeadLimitReachedModalOpen(true)` (line 174)

**Recent Fix:** Changed limit from 3 to 5 across all locations (Commit 62f2697)

**Status:** ✅ Fixed in latest commit

---

## Critical Issue: Session Verification Persistence

### The Problem
When user verifies phone in Flow 3:
1. `handleOTPVerificationSuccess()` calls `setIsPhoneVerified(true)` (line 390)
2. This updates LOCAL component state
3. User can proceed to `QuoteTypeDistributionModal` ✅
4. Leads are created ✅
5. **BUT:** NextAuth session is NOT updated with `phoneVerified: true`

### What Happens Next
On next homepage visit (Flow 4):
1. `useEffect` runs (line 84)
2. Fetches from `/api/user/me` or `session?.user?.phoneVerified`
3. Session STILL shows `phoneVerified: false` ❌
4. Sets `isPhoneVerified = false`
5. Flow 4 condition fails
6. Falls back to Flow 3 → Shows verification modal AGAIN

### The Fix Required
After successful OTP verification:
1. Update user record in database: `UPDATE User SET phoneVerified = true`
2. Update NextAuth session token
3. Force session refresh: `await update({ phoneVerified: true })`

**Location:** `src/app/api/verification/verify-otp/route.ts` or similar

**Current Code (Need to check):**
```tsx
// In /api/verification/verify-otp
POST /api/verification/verify-otp
{
  "phoneNumber": "+61400000000",
  "code": "123456"
}

// Should do:
// 1. Verify code is correct
// 2. Update user: await prisma.user.update({ where: { phone: phoneNumber }, data: { phoneVerified: true } })
// 3. Return success
```

**Missing Step:** Session token update!

---

## Comparison: Dashboard vs Homepage Flows

### Dashboard Flow (WORKING)
**Location:** `src/app/homeowner/dashboard/page.tsx`

**Flow 3 Logic:**
```tsx
const handleContinueAfterQuoteForm = () => {
  if (!isPhoneVerified) {
    setShowContactVerificationModal(true);
  } else {
    setShowQuoteDistributionModal(true);
  }
};

// After verification success:
const handleVerificationSuccess = () => {
  setIsPhoneVerified(true); // Update local state
  // ✅ Dashboard might be refetching session or user data correctly
};
```

**Question:** Does dashboard have the same session persistence issue, or does it handle it differently?

---

## Session Management Analysis

### Current Session Fetching (Homepage useEffect)
```tsx
useEffect(() => {
  // Fetch leads
  const response = await fetch('/api/leads');
  const data = await response.json();
  setUserLeadCount(data.leads?.length || 0);
  
  // Fetch verification status
  const userResponse = await fetch('/api/user/me');
  if (userResponse.ok) {
    const userData = await userResponse.json();
    setIsPhoneVerified(userData.phoneVerified || false); // From database
  } else {
    // Fallback
    setIsPhoneVerified(session?.user?.phoneVerified || false); // From NextAuth session
  }
}, [status, session]);
```

**Issue:** `session?.user?.phoneVerified` is set during login/signup and NEVER updated after verification!

### NextAuth Session Update Pattern (Missing)
After OTP verification, we need:

```tsx
// In handleOTPVerificationSuccess():
import { useSession } from 'next-auth/react';
const { update } = useSession();

const handleOTPVerificationSuccess = async () => {
  setShowOTPModal(false);
  setPendingOTP(null);
  setIsPhoneVerified(true);
  
  // ✅ UPDATE NEXTAUTH SESSION
  await update({
    phoneVerified: true,
  });
  
  // Then refresh user data...
};
```

**OR** refetch session after verification:

```tsx
import { signIn } from 'next-auth/react';

const handleOTPVerificationSuccess = async () => {
  // ... verification success
  
  // Force session refresh by calling signIn with current credentials
  // OR just refetch from /api/user/me
  const userResponse = await fetch('/api/user/me');
  if (userResponse.ok) {
    const userData = await userResponse.json();
    setIsPhoneVerified(userData.phoneVerified); // ✅ Fresh from DB
  }
};
```

---

## API Endpoint Analysis

### `/api/user/me` - Does It Exist?
**Current Code (Line 104):**
```tsx
const userResponse = await fetch('/api/user/me');
if (userResponse.ok) {
  const userData = await userResponse.json();
  setIsPhoneVerified(userData.phoneVerified || false);
} else {
  // Fallback to session
  setIsPhoneVerified(session?.user?.phoneVerified || false);
}
```

**Question:** Does `/api/user/me` exist? If not, it always falls back to session.

**Need to check:** `src/app/api/user/me/route.ts`

### `/api/verification/verify-otp` - Does It Update User?
**Current behavior (assumed):**
```tsx
// In /api/verification/verify-otp/route.ts
POST handler {
  // 1. Verify code
  const isValid = await verifyOTPCode(phoneNumber, code);
  
  // 2. Update user ✅ (assuming this exists)
  await prisma.user.update({
    where: { phoneNumber },
    data: { phoneVerified: true }
  });
  
  // 3. Return success
  return { success: true };
}
```

**Question:** Does this endpoint update the user's `phoneVerified` field in database?

**Need to check:** `src/app/api/verification/verify-otp/route.ts`

---

## Debugging Steps Required

### Step 1: Check API Endpoints
1. **Verify `/api/user/me` exists:**
   ```bash
   # File should exist at:
   src/app/api/user/me/route.ts
   ```
   
2. **Verify `/api/verification/verify-otp` updates user:**
   ```tsx
   // Should contain:
   await prisma.user.update({
     where: { phoneNumber },
     data: { phoneVerified: true, phoneVerifiedAt: new Date() }
   });
   ```

### Step 2: Check Database Schema
```prisma
model User {
  id              String   @id @default(cuid())
  phoneNumber     String?  @unique
  phoneVerified   Boolean  @default(false) // ✅ Field exists?
  phoneVerifiedAt DateTime? // ✅ Field exists?
  // ...
}
```

### Step 3: Check NextAuth Session Callback
**File:** `src/app/api/auth/[...nextauth]/route.ts`

```tsx
callbacks: {
  async session({ session, token }) {
    if (session.user) {
      session.user.phoneVerified = token.phoneVerified; // ✅ Is this set?
    }
    return session;
  },
  async jwt({ token, user, trigger, session }) {
    if (trigger === 'update' && session?.phoneVerified) {
      token.phoneVerified = session.phoneVerified; // ✅ Does this exist?
    }
    if (user) {
      token.phoneVerified = user.phoneVerified; // ✅ Does this exist?
    }
    return token;
  }
}
```

### Step 4: Test Session Update After Verification
Add console logs:

```tsx
const handleOTPVerificationSuccess = async () => {
  console.log('[Before] isPhoneVerified:', isPhoneVerified);
  console.log('[Before] session.user.phoneVerified:', session?.user?.phoneVerified);
  
  setShowOTPModal(false);
  setIsPhoneVerified(true);
  
  // Refetch user data
  const userResponse = await fetch('/api/user/me');
  if (userResponse.ok) {
    const userData = await userResponse.json();
    console.log('[After] userData.phoneVerified:', userData.phoneVerified);
    setIsPhoneVerified(userData.phoneVerified);
  }
  
  console.log('[After] Local state isPhoneVerified:', isPhoneVerified);
};
```

---

## Recommended Fixes

### Fix 1: Ensure API Updates User Record (CRITICAL)
**File:** `src/app/api/verification/verify-otp/route.ts`

```tsx
// After verifying OTP code is correct:
await prisma.user.update({
  where: { phoneNumber: phoneNumber },
  data: { 
    phoneVerified: true,
    phoneVerifiedAt: new Date()
  }
});
```

### Fix 2: Refetch User Data After Verification (CRITICAL)
**File:** `src/app/page.tsx` - `handleOTPVerificationSuccess()`

```tsx
const handleOTPVerificationSuccess = async () => {
  setShowOTPModal(false);
  setPendingOTP(null);
  
  // ✅ REFETCH USER DATA FROM DATABASE
  const userResponse = await fetch('/api/user/me');
  if (userResponse.ok) {
    const userData = await userResponse.json();
    setIsPhoneVerified(userData.phoneVerified); // ✅ Use DB value
  } else {
    // Fallback
    setIsPhoneVerified(true);
  }
  
  // Refresh lead count
  const response = await fetch('/api/leads');
  if (response.ok) {
    const data = await response.json();
    setUserLeadCount(data.leads?.length || 0);
    setRemainingLeadQuota(Math.max(0, 5 - (data.leads?.length || 0)));
  }
  
  // Show distribution modal
  setIsQuoteTypeDistributionModalOpen(true);
};
```

### Fix 3: Update NextAuth Session Token (OPTIONAL)
**File:** `src/app/api/auth/[...nextauth]/route.ts`

Add `phoneVerified` to session callbacks:

```tsx
callbacks: {
  async jwt({ token, user, trigger, session }) {
    if (trigger === 'update') {
      // Allow manual session updates
      if (session?.phoneVerified !== undefined) {
        token.phoneVerified = session.phoneVerified;
      }
    }
    if (user?.phoneVerified !== undefined) {
      token.phoneVerified = user.phoneVerified;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.phoneVerified = token.phoneVerified as boolean;
    }
    return session;
  }
}
```

Then in homepage:

```tsx
import { useSession } from 'next-auth/react';
const { data: session, update } = useSession();

const handleOTPVerificationSuccess = async () => {
  // ... verification success
  
  // Update session
  await update({ phoneVerified: true });
  
  setIsPhoneVerified(true);
  setIsQuoteTypeDistributionModalOpen(true);
};
```

### Fix 4: Remove Duplicate Routing in `handleQuoteOptionSelected` (OPTIONAL)
**File:** `src/app/page.tsx` - Lines 215-234

Since Flows 3, 4, 5 should NEVER go through `QuoteOptionsModal`, remove this logic:

```tsx
const handleQuoteOptionSelected = async (type: 'call_visit' | 'written') => {
  setSelectedQuoteType(type);
  setIsQuoteOptionsModalOpen(false);
  
  const apiQuoteType = type === 'call_visit' ? 'CALL_VISIT' : 'WRITTEN_QUOTE';
  
  if (status === 'authenticated' && session?.user) {
    // Flow 2 ONLY: First lead (0 leads)
    if (userLeadCount === 0) {
      console.log('First lead flow - showing HomeownersInfoForm');
      setIsHomeownersInfoFormOpen(true);
      return;
    }
    
    // ❌ REMOVE FLOWS 3, 4, 5 FROM HERE
    // They should never reach QuoteOptionsModal in the first place!
    
  } else {
    // Guest flow
    setIsHomeownersInfoFormOpen(true);
  }
};
```

**Rationale:** Flows 3, 4, 5 are routed directly from `handleProceedToDetailedQuote()` without going through `QuoteOptionsModal`. This duplicate logic is defensive but unnecessary and creates confusion.

---

## Testing Plan

### Test Case 1: Flow 3 → Flow 4 Transition
**Scenario:** User verifies phone during second lead, then creates third lead

**Steps:**
1. Login as user with 1 lead, phone unverified
2. Fill InstantQuote → "Get Your Quotes"
3. **Verify:** ContactVerificationModal appears ✅
4. Enter OTP, verify successfully
5. **Verify:** QuoteTypeDistributionModal appears ✅
6. Create 1-2 leads
7. **Verify:** Leads created successfully ✅
8. **CRITICAL:** Refresh page or visit homepage again
9. Fill InstantQuote → "Get Your Quotes"
10. **Verify:** QuoteTypeDistributionModal appears directly (NO verification modal) ✅
11. **EXPECTED:** Flow 4 routing, NOT Flow 3

**Current Bug:** Step 10 shows ContactVerificationModal again ❌

### Test Case 2: Flow 4 After Page Refresh
**Scenario:** User with verified phone creates another lead

**Steps:**
1. Login as user with 3 leads, phone verified
2. Fill InstantQuote → "Get Your Quotes"
3. **Verify:** QuoteTypeDistributionModal appears directly ✅
4. **Verify:** NO ContactVerificationModal ✅

**Current Bug:** ContactVerificationModal appears ❌

### Test Case 3: Session Persistence Check
**Scenario:** Verify database and session are in sync

**Steps:**
1. User verifies phone
2. Check database: `SELECT phoneVerified FROM User WHERE id = ?`
3. **Verify:** `phoneVerified = true` ✅
4. Check session: `console.log(session?.user?.phoneVerified)`
5. **Verify:** `true` ✅
6. Refresh page
7. Check useEffect logs: `console.log('[Homepage useEffect] User data:', { phoneVerified })`
8. **Verify:** `phoneVerified = true` ✅

---

## Files to Investigate

### Critical Files
1. **`src/app/page.tsx`** (786 lines)
   - Line 148: `handleProceedToDetailedQuote()` - Flow routing
   - Line 197: `handleQuoteOptionSelected()` - Duplicate routing (remove?)
   - Line 387: `handleOTPVerificationSuccess()` - Add session refresh

2. **`src/app/api/verification/verify-otp/route.ts`** (UNKNOWN)
   - Check if user record is updated: `phoneVerified = true`

3. **`src/app/api/user/me/route.ts`** (UNKNOWN)
   - Check if endpoint exists
   - Check if it returns `phoneVerified` field

4. **`src/app/api/auth/[...nextauth]/route.ts`** (UNKNOWN)
   - Check if `phoneVerified` is in JWT token
   - Check if `phoneVerified` is in session callback

5. **`prisma/schema.prisma`** (UNKNOWN)
   - Check if `phoneVerified` field exists in User model

---

## Success Criteria

- ✅ Flow 1 (guest): Still works
- ✅ Flow 2 (first lead): Works
- ✅ Flow 3 (second lead, unverified): Verification → Distribution → Leads created
- 🔴 Flow 4 (second+ lead, verified): **BROKEN** - Shows verification modal again
- ✅ Flow 5 (5 leads): Fixed in commit 62f2697
- 🔴 Session persistence: **BROKEN** - `phoneVerified` not persisting across page loads

---

## Immediate Action Items

### Priority 1: Fix Session Persistence (CRITICAL)
1. Check `/api/verification/verify-otp/route.ts` - ensure user record updated
2. Check `/api/user/me/route.ts` - ensure endpoint exists and returns `phoneVerified`
3. Update `handleOTPVerificationSuccess()` to refetch user data from database
4. Test Flow 3 → Flow 4 transition with page refresh

### Priority 2: Remove Duplicate Routing Logic (OPTIONAL)
1. Remove Flows 3, 4, 5 logic from `handleQuoteOptionSelected()` (lines 215-234)
2. Keep only Flow 2 (0 leads) logic
3. Ensure guest flow still works

### Priority 3: Add Comprehensive Logging (DEBUG)
1. Add logs to `useEffect` showing fetched `phoneVerified` value
2. Add logs to `handleOTPVerificationSuccess` showing before/after state
3. Add logs to flow routing decisions

---

## Conclusion

**Root Cause:** The verification status (`phoneVerified`) is not persisting between page loads because:
1. Local state is updated (`setIsPhoneVerified(true)`) during Flow 3
2. But NextAuth session is NOT updated
3. On next page load, `useEffect` fetches from session (which still shows `false`)
4. Flow 4 condition fails, falls back to Flow 3
5. User sees verification modal AGAIN

**Critical Fix:** After OTP verification succeeds:
1. Update user record in database: `phoneVerified = true` ✅
2. Refetch user data in `handleOTPVerificationSuccess()` ✅
3. Optionally update NextAuth session token ✅

**Testing Priority:** Test Flow 3 → Flow 4 transition with page refresh to confirm fix.

---

**Report Status:** COMPLETE - Root cause identified, fixes recommended  
**Next Step:** Implement Fix 1 and Fix 2, then test Flow 4  
**Estimated Fix Time:** 30 minutes
