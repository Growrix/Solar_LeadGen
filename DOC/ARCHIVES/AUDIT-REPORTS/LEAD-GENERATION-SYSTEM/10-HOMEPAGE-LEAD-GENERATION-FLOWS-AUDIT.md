# Homepage Lead Generation Flows - Audit Report

**Date:** November 17, 2025  
**Focus:** Homepage InstantQuote Form Lead Generation Flows  
**Status:** INCOMPLETE - Missing critical flows for authenticated users

---

## Executive Summary

The homepage InstantQuote form currently has **incomplete and broken flows** for authenticated users (signed up but no leads, or existing leads). Only the guest (unauthenticated) flow works partially.

**Critical Findings:**
- ✅ Guest flow (signup + first lead) mostly works
- ❌ Authenticated user first lead flow: BROKEN (stops at QuoteOptionsModal)
- ❌ Second lead flow with verification: NOT IMPLEMENTED
- ❌ Second+ lead flow without verification: NOT IMPLEMENTED
- ❌ Lead limit reached flow: NOT IMPLEMENTED

---

## Current Flow Analysis

### Flow 1: Guest User (Not Signed Up) - ✅ MOSTLY WORKING
**Current:** InstantQuote → Results → QuoteOptionsModal → HomeownersInfoForm → SignupModal → Lead Creation → SuccessModal

**Code Location:** `src/app/page.tsx` lines 65-232

**Status:** ✅ Working (no changes needed)

---

### Flow 2: Authenticated User - First Lead (0 leads) - ❌ BROKEN
**Current Behavior:**
- InstantQuote calculator → showing results → quote option modal → **STOPS HERE**
- No continuation to detailed information modal
- No lead generation happens

**Expected Flow:**
- InstantQuote calculator → showing results → quote option modal → **HomeownersInfoForm** → **FirstQuoteSuccessModal** → lead should be generated

**Root Cause:**
In `src/app/page.tsx`, line 68-118, when user is authenticated and selects quote option, the flow immediately tries to create the lead via API. For first-time users (0 leads), this bypasses the data collection step (HomeownersInfoForm).

**Code Issue:**
```tsx
// Line 68: handleQuoteOptionSelected
if (status === 'authenticated' && session?.user) {
  // Immediately submits to API - NO data collection for first lead!
  const response = await fetch('/api/leads', {
    method: 'POST',
    // ... missing name, phone, address for first-time users
  });
}
```

**Missing Data:**
- Name
- Phone number
- Address
- Contact details

**Impact:** HIGH - First-time authenticated users cannot generate leads from homepage

---

### Flow 3: Authenticated User - Second Lead (1+ leads, unverified phone) - ❌ NOT IMPLEMENTED
**Expected Flow:**
- InstantQuote calculator → showing results → "Get detailed quotes" button → **ContactVerificationModal** → after verified → **QuoteTypeDistributionModal** → generate leads

**Current State:** NOT IMPLEMENTED

**Missing Components in Homepage:**
1. ❌ ContactVerificationModal integration
2. ❌ QuoteTypeDistributionModal integration
3. ❌ Logic to detect "second lead" scenario
4. ❌ Logic to check phone verification status
5. ❌ Handler to trigger verification flow

**Code Gap:**
- No state variables for ContactVerificationModal
- No state variables for QuoteTypeDistributionModal
- No verification status check
- No lead count check

---

### Flow 4: Authenticated User - Second+ Lead (1+ leads, verified phone) - ❌ NOT IMPLEMENTED
**Expected Flow:**
- InstantQuote calculator → showing results → "Get detailed quotes" button → **QuoteTypeDistributionModal** → generate leads (skip verification)

**Current State:** NOT IMPLEMENTED

**Missing:**
- Same as Flow 3, but skips ContactVerificationModal
- Needs to detect verified phone status
- Needs to route directly to QuoteTypeDistributionModal

---

### Flow 5: Lead Limit Reached - ❌ NOT IMPLEMENTED
**Expected Flow:**
- InstantQuote calculator → showing results → "Get detailed quotes" button → **LeadLimitReachedModal** (new modal to create)

**Current State:** NOT IMPLEMENTED

**Missing:**
1. ❌ LeadLimitReachedModal component (does not exist)
2. ❌ Lead limit check logic
3. ❌ Lead count fetching from API
4. ❌ Display of remaining/used lead quotas

---

## Technical Gaps

### Missing State Variables in `src/app/page.tsx`
```tsx
// Currently has:
const [isQuoteOptionsModalOpen, setIsQuoteOptionsModalOpen] = useState(false);
const [isHomeownersInfoFormOpen, setIsHomeownersInfoFormOpen] = useState(false);
const [isHomeownerSignupModalOpen, setIsHomeownerSignupModalOpen] = useState(false);
const [isQuoteSuccessModalOpen, setIsQuoteSuccessModalOpen] = useState(false);

// MISSING:
const [isContactVerificationModalOpen, setIsContactVerificationModalOpen] = useState(false);
const [isQuoteTypeDistributionModalOpen, setIsQuoteTypeDistributionModalOpen] = useState(false);
const [isLeadLimitReachedModalOpen, setIsLeadLimitReachedModalOpen] = useState(false);
const [userLeadCount, setUserLeadCount] = useState(0);
const [isPhoneVerified, setIsPhoneVerified] = useState(false);
const [remainingLeadQuota, setRemainingLeadQuota] = useState(0);
```

### Missing Imports in `src/app/page.tsx`
```tsx
// Currently imported:
import ContactVerificationModal from '../components/homeowner/ContactVerificationModal'; // ❌ NOT IMPORTED
import QuoteTypeDistributionModal from '../components/homeowner/QuoteTypeDistributionModal'; // ❌ NOT IMPORTED
// LeadLimitReachedModal does not exist yet
```

### Missing API Calls
1. **Get User Lead Count:**
   ```tsx
   // Need: GET /api/user/lead-count or similar
   // Returns: { leadCount: number, remainingQuota: number, isPhoneVerified: boolean }
   ```

2. **Get User Verification Status:**
   ```tsx
   // Need: GET /api/user/verification-status
   // Returns: { phoneVerified: boolean, emailVerified: boolean }
   ```

---

## Existing Working Components (Available for Reuse)

### ✅ Components that Exist and Work
1. **ContactVerificationModal** - `src/components/homeowner/ContactVerificationModal.tsx`
   - Already used in dashboard
   - Handles OTP verification
   - Can be reused in homepage

2. **QuoteTypeDistributionModal** - `src/components/homeowner/QuoteTypeDistributionModal.tsx`
   - Already used in dashboard
   - Handles residential/commercial quote selection
   - Can be reused in homepage

3. **FirstQuoteSuccessModal** - `src/components/homeowner/FirstQuoteSuccessModal.tsx`
   - Already exists
   - Shows success message for first lead
   - Has "Verify Contact" button

4. **HomeownersInfoForm** - `src/components/HomeownersInfoForm.tsx`
   - Already used in guest flow
   - Collects name, phone, address
   - Can be reused for authenticated first-time users

### ❌ Components that Need to be Created
1. **LeadLimitReachedModal** - NEW
   - Show when user reaches lead generation limit
   - Display message: "You've reached your quote request limit"
   - CTA: "Upgrade Plan" or "Contact Support"

---

## Dashboard Flows (Working Reference)

### Dashboard Flow - Second+ Lead Generation (WORKING)
**Location:** `src/app/homeowner/dashboard/page.tsx`

**Flow:**
1. User clicks "Request More Quotes" CTA
2. Opens SimplifiedQuoteFormModal
3. Checks phone verification status
4. If unverified → ContactVerificationModal → OTP → QuoteTypeDistributionModal
5. If verified → QuoteTypeDistributionModal directly
6. Generates leads based on user selection

**Key Logic to Port:**
```tsx
// Dashboard handles verification check correctly
const handleContinueAfterQuoteForm = () => {
  if (!isPhoneVerified) {
    setShowContactVerificationModal(true);
  } else {
    setShowQuoteDistributionModal(true);
  }
};
```

---

## Data Flow Analysis

### Data Needed for Lead Creation

#### First Lead (Flow 2)
```json
{
  "quoteType": "CALL_VISIT" | "WRITTEN_QUOTE",
  "propertyPostcode": "string",
  "location": "string",
  "state": "string",
  "energyBill": "number",
  "name": "string", // ❌ MISSING in current flow
  "phoneNumber": "string", // ❌ MISSING in current flow
  "address": "string", // ❌ MISSING in current flow
  "propertyType": "residential" | "commercial",
  "roofType": "string",
  "budgetRange": "string",
  "desiredOffset": "number",
  "batteryRequired": "boolean",
  "batteryCapacity": "string",
  "timeframe": "string",
  "additionalNotes": "string",
  "billType": "quarterly" | "monthly"
}
```

#### Second+ Lead (Flows 3 & 4)
- Same data as first lead
- Name/phone/address should auto-populate from first lead
- User can edit if needed

---

## Implementation Plan

### Phase 22: Homepage Lead Generation Flows Fix

#### Task 22.1: Add Missing State Variables
**File:** `src/app/page.tsx`
- Add state for ContactVerificationModal
- Add state for QuoteTypeDistributionModal
- Add state for LeadLimitReachedModal
- Add userLeadCount state
- Add isPhoneVerified state
- Add remainingLeadQuota state

#### Task 22.2: Add Missing Imports
**File:** `src/app/page.tsx`
- Import ContactVerificationModal
- Import QuoteTypeDistributionModal
- Import (create) LeadLimitReachedModal

#### Task 22.3: Create LeadLimitReachedModal Component
**File:** `src/components/homeowner/LeadLimitReachedModal.tsx` (NEW)
- Display: "You've reached your quote request limit"
- Show current usage (e.g., "3/3 quotes used")
- CTA: "Contact Support" or "View Pricing"
- Use neumorphic design system
- Match FirstQuoteSuccessModal styling

#### Task 22.4: Fetch User Lead Data on Mount
**File:** `src/app/page.tsx`
- useEffect to fetch user lead count
- useEffect to fetch phone verification status
- Calculate remaining quota
- Store in state

#### Task 22.5: Fix Flow 2 - Authenticated First Lead
**File:** `src/app/page.tsx` - Modify `handleQuoteOptionSelected`
- Check if user has 0 leads
- If yes, show HomeownersInfoForm to collect data
- Then create lead with collected data
- Show FirstQuoteSuccessModal on success

#### Task 22.6: Implement Flow 3 - Second Lead with Verification
**File:** `src/app/page.tsx`
- Check if user has 1+ leads AND phone unverified
- Show ContactVerificationModal
- After verification, show QuoteTypeDistributionModal
- Generate leads based on selection

#### Task 22.7: Implement Flow 4 - Second+ Lead without Verification
**File:** `src/app/page.tsx`
- Check if user has 1+ leads AND phone verified
- Skip verification, show QuoteTypeDistributionModal directly
- Generate leads based on selection

#### Task 22.8: Implement Flow 5 - Lead Limit Reached
**File:** `src/app/page.tsx`
- Check if user has reached lead limit
- Show LeadLimitReachedModal
- Block lead generation

#### Task 22.9: Testing
- Test Flow 1 (guest): Ensure still works
- Test Flow 2 (first lead): Data collection + lead creation
- Test Flow 3 (second lead, unverified): Verification → distribution
- Test Flow 4 (second+ lead, verified): Direct to distribution
- Test Flow 5 (limit reached): Modal displays correctly

---

## API Requirements

### New/Modified API Endpoints

#### 1. GET /api/user/stats
**Purpose:** Fetch user lead count and verification status
**Response:**
```json
{
  "leadCount": 2,
  "remainingQuota": 1,
  "maxLeads": 3,
  "isPhoneVerified": true,
  "isEmailVerified": true
}
```

#### 2. POST /api/leads (Existing - No Changes)
**Current:** Already handles lead creation
**Note:** Ensure it accepts name/phone/address for first lead

---

## Critical Rules

### ❌ DO NOT TOUCH
- Dashboard flows (`src/app/homeowner/dashboard/page.tsx`) - ✅ WORKING
- Guest flow (Flow 1) - ✅ WORKING
- Existing modals logic - ✅ WORKING

### ✅ SAFE TO MODIFY
- `src/app/page.tsx` - Add new states and handlers
- Create new LeadLimitReachedModal component
- Add modal integrations to homepage

---

## Testing Scenarios

### Test Case 1: Guest User
**Steps:**
1. Open homepage (not logged in)
2. Fill InstantQuote form
3. Click "Get Your Quotes"
4. Select "Call/Visit" or "Written Quote"
5. Fill HomeownersInfoForm
6. Complete signup
7. Lead should be created
8. FirstQuoteSuccessModal should show

**Expected:** ✅ PASS (already working)

---

### Test Case 2: Authenticated User - First Lead (0 leads)
**Steps:**
1. Login as user with 0 leads
2. Fill InstantQuote form
3. Click "Get Your Quotes"
4. Select "Call/Visit" or "Written Quote"
5. Should show HomeownersInfoForm to collect data
6. Fill name, phone, address
7. Click Continue
8. Lead should be created
9. FirstQuoteSuccessModal should show

**Expected:** ❌ FAIL (currently stops at QuoteOptionsModal)

---

### Test Case 3: Authenticated User - Second Lead (1 lead, unverified)
**Steps:**
1. Login as user with 1 lead, phone unverified
2. Fill InstantQuote form
3. Click "Get Detailed Quotes"
4. Should show ContactVerificationModal
5. Enter OTP and verify
6. Should show QuoteTypeDistributionModal
7. Select quote types (residential/commercial)
8. Leads should be created
9. Success modal should show

**Expected:** ❌ FAIL (flow not implemented)

---

### Test Case 4: Authenticated User - Second+ Lead (1+ leads, verified)
**Steps:**
1. Login as user with 1+ leads, phone verified
2. Fill InstantQuote form
3. Click "Get Detailed Quotes"
4. Should show QuoteTypeDistributionModal (skip verification)
5. Select quote types
6. Leads should be created
7. Success modal should show

**Expected:** ❌ FAIL (flow not implemented)

---

### Test Case 5: Authenticated User - Lead Limit Reached
**Steps:**
1. Login as user with max leads (e.g., 3/3)
2. Fill InstantQuote form
3. Click "Get Detailed Quotes"
4. Should show LeadLimitReachedModal
5. Should NOT allow lead creation

**Expected:** ❌ FAIL (flow not implemented)

---

## Risks & Mitigation

### Risk 1: Breaking Guest Flow
**Mitigation:** Add checks to preserve existing guest flow logic. Only add new conditions for authenticated users.

### Risk 2: Modal State Conflicts
**Mitigation:** Use clear state variable names. Ensure only one modal opens at a time.

### Risk 3: Data Loss Between Modals
**Mitigation:** Store pendingQuoteData, homeownerInfo in state. Pass data through modal chain.

### Risk 4: Session State Issues
**Mitigation:** Use existing session polling pattern from guest flow (lines 135-162).

---

## Success Criteria

- ✅ Flow 1 (guest): Still works after changes
- ✅ Flow 2 (first lead): HomeownersInfoForm → lead creation → success modal
- ✅ Flow 3 (second lead, unverified): Verification → distribution → leads created
- ✅ Flow 4 (second+ lead, verified): Distribution → leads created
- ✅ Flow 5 (limit reached): Modal shows, blocks lead creation
- ✅ All data correctly saved to database
- ✅ No console errors
- ✅ TypeScript compiles
- ✅ Build passes

---

## Files to Modify

1. **src/app/page.tsx** - Main homepage logic
2. **src/components/homeowner/LeadLimitReachedModal.tsx** - NEW component
3. **src/app/api/user/stats/route.ts** - NEW API endpoint (optional)

---

## Estimated Implementation Time

- Task 22.1-22.2: Add states & imports - 15 min
- Task 22.3: Create LeadLimitReachedModal - 45 min
- Task 22.4: Fetch user data on mount - 30 min
- Task 22.5: Fix Flow 2 (first lead) - 1 hour
- Task 22.6: Implement Flow 3 (verification) - 1.5 hours
- Task 22.7: Implement Flow 4 (no verification) - 1 hour
- Task 22.8: Implement Flow 5 (limit reached) - 30 min
- Task 22.9: Testing all flows - 1 hour

**Total:** ~6.5 hours

---

## Next Steps

1. Review this audit report
2. Get user approval on implementation plan
3. Create Phase 22 in tasks.md
4. Begin implementation with Task 22.1
5. Test each flow after implementation
6. Commit and push changes

---

**Report Status:** COMPLETE - Ready for Implementation  
**Priority:** HIGH - Blocking authenticated users from generating leads via homepage  
**Impact:** HIGH - Critical user flow broken
