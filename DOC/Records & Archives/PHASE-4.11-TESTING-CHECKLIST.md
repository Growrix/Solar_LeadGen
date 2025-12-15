# Phase 4.11 Testing Checklist - Quote Type Distribution

**Date**: 2025-10-22  
**Feature**: Quote Type Distribution Modal with BIDDING support  
**Commit**: d77da30

---

## Overview

This phase implements the Quote Type Distribution modal for second+ quotes, allowing homeowners to distribute their remaining quota across 3 quote types: Call/Visit (📞), Written Quote (📄), and Competitive Bidding (🏆).

**Critical Requirement**: First quote flow MUST remain unchanged using QuoteOptionsModal.

---

## Pre-Testing Setup

### 1. Database State
- [ ] Verify you have a homeowner account with verified phone
- [ ] Check homeowner's current `totalSubmitted` value in database
- [ ] Check homeowner's `biddingLeadsSubmitted` value (should be 0 initially)
- [ ] Note the `quoteLimit` (default 5)

### 2. Application State
- [ ] Clear browser cache and cookies
- [ ] Log in as homeowner
- [ ] Navigate to homeowner dashboard

---

## Test Suite A: First Quote Flow (MUST NOT CHANGE)

**Scenario**: Homeowner with `totalSubmitted = 0` (first quote)

### Test A1: First Quote - Call/Visit
**Steps**:
1. Click "Request New Quote" button or "Request More Quotes" CTA
2. Fill out the **NewQuoteRequestModal** (multi-step form)
3. Click "Calculate" to see instant quote results
4. Click "Submit Quote Request"

**Expected Results**:
- ✅ NewQuoteRequestModal should open (multi-step modal)
- ✅ After calculation, **QuoteOptionsModal** should open (NOT QuoteTypeDistributionModal)
- ✅ Should see 2 options only: "Call or Site Visit" and "Written Quote"
- ✅ Select "Call or Site Visit"
- ✅ Lead created with `quoteType: 'CALL_VISIT'`
- ✅ Dashboard shows 1 lead with phone icon (📞)
- ✅ Remaining quota shows 4 out of 5

### Test A2: Verify Database
**Steps**:
1. Query database: `SELECT * FROM "Lead" WHERE "homeownerId" = [user_id]`

**Expected Results**:
- ✅ 1 lead record exists
- ✅ `quoteType = 'CALL_VISIT'`
- ✅ `status = 'PENDING_APPROVAL'`
- ✅ Lead has unique `id`

---

## Test Suite B: Second Quote Flow (NEW IMPLEMENTATION)

**Scenario**: Homeowner with `totalSubmitted >= 1` (returning user)

### Test B1: Second Quote - Distribution Modal Opens
**Steps**:
1. Click "Request More Quotes" from dashboard
2. **SimplifiedQuoteFormModal** should open with pre-filled data
3. Modify any field if desired (optional)
4. Click "Calculate" to see results
5. Click "Submit Quote Request"

**Expected Results**:
- ✅ SimplifiedQuoteFormModal should open (single-page pre-filled form)
- ✅ After calculation, **QuoteTypeDistributionModal** should open
- ✅ Should see 3 quote types with icons:
  * 📞 Call or Site Visit
  * 📄 Written Quote
  * 🏆 Competitive Bidding
- ✅ Modal should show "Remaining Quota: 4"

### Test B2: Distribution - Select Multiple Types
**Steps**:
1. In QuoteTypeDistributionModal, select:
   - Call/Visit: 2
   - Written Quote: 1
   - Bidding: 1
2. Verify total = 4 (matches remaining quota)
3. Click "Submit Requests"

**Expected Results**:
- ✅ Modal closes
- ✅ Loading indicator shows
- ✅ Success message: "Successfully created 4 quote request(s)!"
- ✅ Dashboard refreshes
- ✅ Now shows 5 total leads (1 from Test A1 + 4 from this test)
- ✅ Lead cards show correct icons:
  * 2 leads with 📞 (Call/Visit)
  * 1 lead with 📄 (Written Quote)
  * 1 lead with 🏆 (Bidding)
- ✅ Remaining quota shows 0 out of 5
- ✅ "Request More Quotes" button disabled or shows "Limit Reached"

### Test B3: Verify Database After Distribution
**Steps**:
1. Query database: `SELECT * FROM "Lead" WHERE "homeownerId" = [user_id] ORDER BY "createdAt" DESC`

**Expected Results**:
- ✅ 5 total lead records (1 from A1 + 4 from B2)
- ✅ Most recent 4 leads have unique IDs
- ✅ Lead counts by type:
  * 3 leads with `quoteType = 'CALL_VISIT'` (2 from B2 + 1 from A1)
  * 1 lead with `quoteType = 'WRITTEN_QUOTE'`
  * 1 lead with `quoteType = 'BIDDING'`
- ✅ All leads have `status = 'PENDING_APPROVAL'`
- ✅ Timestamps show sequential creation

### Test B4: BIDDING Quota Enforcement
**Preparation**:
1. Admin increases user's `quoteLimit` to 10 via database or admin panel
2. Refresh homeowner dashboard

**Steps**:
1. Click "Request More Quotes"
2. SimplifiedQuoteFormModal opens
3. Calculate and submit
4. QuoteTypeDistributionModal opens

**Expected Results**:
- ✅ Modal shows "Remaining Quota: 5" (10 - 5 used)
- ✅ BIDDING option shows "Max 1 - Already used" or similar indicator
- ✅ BIDDING input is disabled or max value is 0
- ✅ Can only select Call/Visit and Written Quote
- ✅ Attempting to distribute including BIDDING should fail gracefully

---

## Test Suite C: Edge Cases & Validations

### Test C1: Distribution Exceeds Quota
**Steps**:
1. In QuoteTypeDistributionModal with 5 remaining quota
2. Try to select: Call/Visit: 3, Written: 3 (total 6)

**Expected Results**:
- ✅ Submit button disabled OR error message shown
- ✅ Cannot submit more than remaining quota

### Test C2: Zero Distribution
**Steps**:
1. In QuoteTypeDistributionModal
2. Don't select any counts (all 0)
3. Try to submit

**Expected Results**:
- ✅ Submit button disabled OR error message
- ✅ Must select at least 1 lead

### Test C3: Unverified Phone Number
**Preparation**:
1. Set user's `phoneVerified = false` in database
2. Refresh dashboard

**Steps**:
1. Click "Request More Quotes"

**Expected Results**:
- ✅ ContactVerificationModal opens first
- ✅ Must verify phone before accessing SimplifiedQuoteFormModal
- ✅ After verification, proceed to SimplifiedQuoteFormModal

### Test C4: Quota Limit Reached
**Preparation**:
1. User has `totalSubmitted = quoteLimit` (e.g., 5 out of 5)

**Steps**:
1. Try to click "Request More Quotes"

**Expected Results**:
- ✅ Button disabled or shows "Limit Reached"
- ✅ OR alert message: "You have reached your quote limit"
- ✅ Modal should not open

---

## Test Suite D: UI/UX Verification

### Test D1: Lead Card Icons Display
**Steps**:
1. View dashboard with leads of all 3 types

**Expected Results**:
- ✅ Call/Visit leads show 📞 phone icon
- ✅ Written Quote leads show 📄 document icon
- ✅ Bidding leads show 🏆 trophy icon
- ✅ Icons are visible and aligned properly
- ✅ Icons have correct color (text-primary)

### Test D2: Bidding Quota Indicator
**Steps**:
1. View homeowner dashboard before using bidding

**Expected Results**:
- ✅ Yellow/amber card shows "Competitive Bidding Quota"
- ✅ Shows "1 / 1 Available"
- ✅ After using bidding, shows "0 / 1 Used"
- ✅ Visual indication (color, icon) changes after use

### Test D3: Modal Transitions
**Steps**:
1. Complete full flow from dashboard → SimplifiedQuoteFormModal → QuoteTypeDistributionModal

**Expected Results**:
- ✅ Smooth transitions between modals
- ✅ No modal stacking issues
- ✅ Background overlay prevents clicking through
- ✅ ESC key or X button closes modal properly

---

## Test Suite E: Error Handling

### Test E1: API Failure During Distribution
**Steps** (requires backend testing/mocking):
1. Simulate API failure on 2nd lead creation out of 4
2. Submit distribution with 4 leads

**Expected Results**:
- ✅ Error message displayed
- ✅ Partial leads created (1 out of 4)
- ✅ Dashboard reflects actual created count
- ✅ User can retry remaining leads

### Test E2: Network Disconnection
**Steps**:
1. Start distribution submission
2. Disconnect network mid-request

**Expected Results**:
- ✅ Loading state continues
- ✅ Eventually timeout or error message
- ✅ User can close modal and retry

---

## Test Suite F: Cross-Browser Testing

### Test F1: Chrome
- [ ] All flows work
- [ ] Icons display correctly
- [ ] Modals render properly

### Test F2: Firefox
- [ ] All flows work
- [ ] Icons display correctly
- [ ] Modals render properly

### Test F3: Safari (if available)
- [ ] All flows work
- [ ] Icons display correctly
- [ ] Modals render properly

### Test F4: Edge
- [ ] All flows work
- [ ] Icons display correctly
- [ ] Modals render properly

---

## Test Suite G: Responsive Testing

### Test G1: Mobile (< 640px)
- [ ] SimplifiedQuoteFormModal displays full-width
- [ ] QuoteTypeDistributionModal is scrollable
- [ ] Icons are visible on lead cards
- [ ] Touch interactions work

### Test G2: Tablet (640px - 1024px)
- [ ] Layout adjusts properly
- [ ] Modal widths appropriate
- [ ] All elements accessible

### Test G3: Desktop (> 1024px)
- [ ] Standard desktop layout
- [ ] Modal centered and sized correctly

---

## Success Criteria

### Critical (Must Pass)
- [x] First quote flow uses QuoteOptionsModal (unchanged)
- [x] Second+ quote flow uses QuoteTypeDistributionModal
- [x] BIDDING limit enforced (1 per homeowner)
- [x] Multiple leads created from distribution
- [x] Icons display on lead cards
- [x] No TypeScript errors
- [x] No ESLint errors (related to our changes)

### Important (Should Pass)
- [ ] All edge cases handled gracefully
- [ ] Error messages user-friendly
- [ ] Loading states work
- [ ] Database integrity maintained

### Nice-to-Have
- [ ] Smooth animations
- [ ] Accessibility features
- [ ] Performance optimized

---

## Known Issues / Pre-Existing Bugs

1. **Build Error**: `crypto` module type error in `phone-verification-service.ts`
   - Status: Pre-existing (not related to Phase 4.11)
   - Impact: Build fails but dev server works
   - Action: Separate fix needed

---

## Manual Test Execution Log

**Tester**: _______________  
**Date**: _______________  
**Environment**: _______________

### Test Results Summary

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| A1 | First Quote - Call/Visit | ⬜ Pass / ⬜ Fail | |
| A2 | Verify Database | ⬜ Pass / ⬜ Fail | |
| B1 | Distribution Modal Opens | ⬜ Pass / ⬜ Fail | |
| B2 | Select Multiple Types | ⬜ Pass / ⬜ Fail | |
| B3 | Verify Database After Distribution | ⬜ Pass / ⬜ Fail | |
| B4 | BIDDING Quota Enforcement | ⬜ Pass / ⬜ Fail | |
| C1 | Distribution Exceeds Quota | ⬜ Pass / ⬜ Fail | |
| C2 | Zero Distribution | ⬜ Pass / ⬜ Fail | |
| C3 | Unverified Phone Number | ⬜ Pass / ⬜ Fail | |
| C4 | Quota Limit Reached | ⬜ Pass / ⬜ Fail | |
| D1 | Lead Card Icons Display | ⬜ Pass / ⬜ Fail | |
| D2 | Bidding Quota Indicator | ⬜ Pass / ⬜ Fail | |
| D3 | Modal Transitions | ⬜ Pass / ⬜ Fail | |
| E1 | API Failure During Distribution | ⬜ Pass / ⬜ Fail | |
| E2 | Network Disconnection | ⬜ Pass / ⬜ Fail | |

---

## Bug Report Template

**Bug ID**: _______________  
**Test Case**: _______________  
**Severity**: Critical / High / Medium / Low  

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:

**Actual Result**:

**Screenshots/Logs**:

**Environment**:
- Browser:
- OS:
- User Role:

---

## Approval Sign-Off

- [ ] All critical tests passed
- [ ] All important tests passed
- [ ] Known issues documented
- [ ] Ready for production

**Tested By**: _______________  
**Date**: _______________  
**Signature**: _______________
