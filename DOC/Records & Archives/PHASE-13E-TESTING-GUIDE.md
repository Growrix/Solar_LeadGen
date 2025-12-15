# Phase 13E Testing Guide
**Date**: December 7, 2025  
**Component**: Bid Selection Backend Integration  
**Status**: Ready for Testing

---

## ✅ Pre-Testing Verification

**All Warnings Fixed** (Commit: 4bdedf8)
- ✅ React Hook useEffect dependency resolved
- ✅ Invalid Tailwind classes fixed (animate-scale-in, text-heading-5, danger colors)
- ✅ TypeScript compilation: 0 errors
- ✅ Pre-commit hooks: Passed
- ✅ Design system compliance: 6/6 verification commands passed

**Backend Implementation Complete** (Commit: ed7be9a)
- ✅ Enhanced POST /api/bids/[bidId]/select endpoint
- ✅ Added lead status update (status → PURCHASED, purchasedAt → timestamp)
- ✅ Transaction atomicity preserved (ACID compliance)

**Frontend Integration Complete** (Commit: 92c4352)
- ✅ Connected HomeownerBiddingReviewModal to API
- ✅ Added error handling and user feedback
- ✅ Page reload on success for UI consistency

---

## 🧪 Manual Testing Checklist

### Test Environment Setup
```bash
# 1. Start development server
npm run dev

# 2. Open Prisma Studio (separate terminal)
npx prisma studio

# 3. Open browser DevTools
# - Network tab (monitor API calls)
# - Console tab (check for errors)
```

**Required Test Data:**
- ✅ At least 1 lead with status: APPROVED or EXPIRED
- ✅ At least 3 bids submitted for the lead
- ✅ Logged in as homeowner (owner of the lead)

---

## 📋 Test Scenario 1: Successful Winner Selection

**Objective**: Verify complete bid selection flow with database updates

### Steps:

**1. Navigate to Homeowner Dashboard**
- [ ] Log in as homeowner
- [ ] Dashboard loads without errors
- [ ] See list of leads with bids

**2. Open Lead with Multiple Bids**
- [ ] Find lead with status: APPROVED or EXPIRED
- [ ] Click "Review Bids" button
- [ ] Modal opens (HomeownerBiddingReviewModal)

**3. Review Modal UI**
- [ ] Modal displays with proper styling (neumorphic shadows)
- [ ] See installer dropdown selector
- [ ] Count shows correct number of bids (e.g., "3 bids received")
- [ ] Property address displayed correctly
- [ ] First bid selected by default

**4. Compare Multiple Installers**
- [ ] Change installer in dropdown
- [ ] Bid details update (left column shows new quote)
- [ ] System specifications display correctly
- [ ] Equipment details render properly
- [ ] Pricing breakdown shows line items
- [ ] Final total matches dropdown display
- [ ] Right column shows action buttons

**5. Select Winner**
- [ ] Click "Select Winner" button on preferred bid
- [ ] Confirmation modal appears
- [ ] Installer name displayed in confirmation
- [ ] See "Confirm Selection" and "Cancel" buttons

**6. Confirm Selection**
- [ ] Click "Confirm Selection" button
- [ ] Loading state appears (button disabled)

**7. Verify API Call (Network Tab)**
- [ ] Network tab shows: POST /api/bids/[bidId]/select
- [ ] Request body contains: `{ "leadId": "..." }`
- [ ] Response status: 200 OK
- [ ] Response body: `{ "success": true, "data": { "bid": {...}, "lead": {...} } }`

**8. Verify User Feedback**
- [ ] Success alert appears: "Winner selected! Installer will contact you."
- [ ] Modal closes automatically after alert
- [ ] Page reloads to show updated dashboard

**9. Verify Dashboard Update**
- [ ] Lead status changes (visual indicator)
- [ ] "Review Bids" button disabled or hidden
- [ ] Winner badge/indicator appears on lead card
- [ ] Countdown timer no longer displays (if applicable)

**10. Verify Database Changes (Prisma Studio)**

**Navigate to Bid table:**
- [ ] Selected bid: `status = "SELECTED"`
- [ ] Selected bid: `selectedAt` timestamp is set (not null)
- [ ] Other bids: `status = "REJECTED"`
- [ ] Other bids: `selectedAt` is null

**Navigate to Lead table:**
- [ ] Lead: `status = "PURCHASED"`
- [ ] Lead: `purchasedAt` timestamp is set (not null)
- [ ] Lead: `homeownerId` unchanged
- [ ] Lead: All other fields preserved

**Expected Result:** ✅ Winner selected successfully, database updated atomically, homeowner sees confirmation

---

## 📋 Test Scenario 2: Error Handling

**Objective**: Verify graceful error handling when API fails

### Steps:

**1. Simulate Network Failure**
```bash
# Stop dev server temporarily (Ctrl+C)
```

**2. Attempt Winner Selection**
- [ ] Open HomeownerBiddingReviewModal
- [ ] Click "Select Winner" button
- [ ] Click "Confirm Selection"

**3. Verify Error Handling**
- [ ] Error alert appears with network error message
- [ ] Modal stays open (not closed)
- [ ] Button returns to enabled state (not stuck loading)
- [ ] User can retry selection

**4. Restart Server and Retry**
```bash
npm run dev
```
- [ ] Retry winner selection without refreshing page
- [ ] Selection succeeds (API call works)
- [ ] Database updates correctly

**Expected Result:** ✅ Errors displayed gracefully, user can retry without page refresh

---

## 📋 Test Scenario 3: Validation Errors

**Objective**: Verify backend validation prevents invalid selections

### Steps:

**1. Invalid Lead ID**
- [ ] Manually call API with non-existent leadId
```bash
curl -X POST http://localhost:3000/api/bids/[validBidId]/select \
  -H "Content-Type: application/json" \
  -d '{"leadId": "invalid-lead-id"}'
```
- [ ] Response: 400 Bad Request
- [ ] Error message: "Invalid lead ID" or similar

**2. Bid Already Selected**
- [ ] Select winner successfully (Scenario 1)
- [ ] Try to select different bid for same lead
- [ ] Verify rejection (lead status = PURCHASED already)

**3. Lead Already Purchased**
- [ ] Open modal for lead with status: PURCHASED
- [ ] Verify "Select Winner" button is disabled
- [ ] Or verify warning message displayed
- [ ] Cannot make API call to change winner

**4. Authorization Check**
- [ ] Log in as different homeowner
- [ ] Try to select winner for lead owned by another user
- [ ] Verify: 403 Forbidden or similar error
- [ ] Database unchanged

**Expected Result:** ✅ Backend validation prevents invalid selections, appropriate errors returned

---

## 📋 Test Scenario 4: Multi-Theme Compatibility

**Objective**: Verify UI works in all 3 themes (Dark, Light, Purple)

### Steps:

**1. Dark Theme (Default)**
- [ ] Open HomeownerBiddingReviewModal
- [ ] Verify neumorphic shadows visible
- [ ] Text colors: High contrast on dark background
- [ ] Border colors: Subtle but visible
- [ ] Success message: Green with proper contrast
- [ ] Error message: Red with proper contrast

**2. Light Theme**
- [ ] Switch to Light theme (theme selector)
- [ ] Open HomeownerBiddingReviewModal
- [ ] Verify soft shadows (neumorphic light style)
- [ ] Text colors: Dark text on light background
- [ ] All semantic colors adjust automatically
- [ ] No hardcoded colors visible

**3. Purple Theme**
- [ ] Switch to Purple theme
- [ ] Open HomeownerBiddingReviewModal
- [ ] Verify purple accent shadows
- [ ] Primary buttons: Purple tone
- [ ] Success/error colors: Maintain readability
- [ ] No color bleeding or theme conflicts

**Expected Result:** ✅ Modal looks correct in all 3 themes, no hardcoded colors override

---

## 📋 Test Scenario 5: Responsive Design

**Objective**: Verify mobile and desktop layouts

### Steps:

**1. Desktop (1440px)**
- [ ] Modal: 95vw × 95vh (centered)
- [ ] Two-column layout: 65% left, 35% right
- [ ] Dropdown: Auto width (not full width)
- [ ] All sections visible without scroll
- [ ] Bid details: Readable font sizes

**2. Tablet (768px)**
- [ ] Modal: 95vw × 95vh (centered)
- [ ] Two-column layout maintained
- [ ] Left column: Scrollable if needed
- [ ] Right column: Sticky or scrollable
- [ ] Touch targets: Adequate size (44px)

**3. Mobile (375px)**
- [ ] Modal: Full screen (100vw × 100vh)
- [ ] Single-column layout (stacked)
- [ ] Dropdown: Full width
- [ ] Buttons: Full width or adequate size
- [ ] Text: Readable (16px minimum)
- [ ] No horizontal scroll

**4. Small Mobile (320px)**
- [ ] All content visible (no cutoff)
- [ ] Buttons: Not too small
- [ ] Modal: Closeable (X button accessible)

**Expected Result:** ✅ Responsive design works across all breakpoints

---

## 📋 Test Scenario 6: Accessibility (WCAG 2.1 AA)

**Objective**: Verify keyboard navigation and screen reader support

### Steps:

**1. Keyboard Navigation**
- [ ] Tab to "Review Bids" button → Press Enter
- [ ] Modal opens
- [ ] Tab through installer dropdown → Arrow keys work
- [ ] Tab to "Select Winner" button → Press Enter
- [ ] Confirmation modal appears
- [ ] Tab to "Confirm Selection" → Press Enter
- [ ] Selection succeeds
- [ ] Escape key closes modal at any point

**2. Screen Reader (NVDA/JAWS)**
- [ ] Modal title announced: "Review Solar Bids"
- [ ] Bid count announced: "3 bids received"
- [ ] Dropdown label: "Select Installer to Review"
- [ ] Button label: "Select Winner"
- [ ] Confirmation question read correctly
- [ ] Success message announced

**3. Color Contrast**
- [ ] All text meets 4.5:1 ratio (AA standard)
- [ ] Interactive elements: Visible focus indicators
- [ ] Error messages: Red with sufficient contrast
- [ ] Success messages: Green with sufficient contrast

**4. ARIA Attributes**
- [ ] Modal: `role="dialog"`, `aria-labelledby`
- [ ] Close button: `aria-label="Close modal"`
- [ ] Dropdown: Proper `<label>` association
- [ ] Loading state: `aria-busy="true"` when submitting

**Expected Result:** ✅ Fully accessible via keyboard and screen reader

---

## 📋 Test Scenario 7: Edge Cases

**Objective**: Test unusual but valid scenarios

### Steps:

**1. Only One Bid**
- [ ] Lead with exactly 1 bid
- [ ] Dropdown shows single option
- [ ] Can select winner without comparison
- [ ] No errors

**2. Very Large Bid Count (10+)**
- [ ] Dropdown scrollable
- [ ] All bids selectable
- [ ] Performance: No lag when switching
- [ ] Database handles correctly

**3. Long Installer Names**
- [ ] Dropdown: Text wraps or truncates properly
- [ ] Confirmation modal: Name fully visible
- [ ] No layout overflow

**4. Rapid Clicks (Double-Click)**
- [ ] Click "Select Winner" twice quickly
- [ ] Only ONE API call sent
- [ ] Button disabled after first click
- [ ] No duplicate selections

**5. Browser Back Button**
- [ ] Select winner → page reloads
- [ ] Click browser back button
- [ ] Previous page loads (not modal)
- [ ] Selection persists (not reverted)

**Expected Result:** ✅ Edge cases handled gracefully

---

## 🔧 Debugging Tools

### Check API Response
```javascript
// Browser Console
fetch('/api/bids/[bidId]/select', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ leadId: '[leadId]' })
})
.then(r => r.json())
.then(console.log)
```

### Check Database State
```sql
-- Prisma Studio or PostgreSQL
SELECT id, status, selectedAt FROM "Bid" WHERE "leadId" = '[leadId]';
SELECT id, status, purchasedAt FROM "Lead" WHERE id = '[leadId]';
```

### Check React State
```javascript
// React DevTools
// Find HomeownerBiddingReviewModal component
// Inspect hooks: selectedBidId, isSelecting, showConfirmation
```

---

## 📊 Success Criteria (All Must Pass)

**Functionality:**
- ✅ Winner selection updates database (bid.status, lead.status)
- ✅ Timestamps set correctly (selectedAt, purchasedAt)
- ✅ Transaction atomic (all updates or none)
- ✅ Error handling works (network, validation)
- ✅ User feedback clear (success alert, page reload)

**UI/UX:**
- ✅ Modal responsive (mobile, tablet, desktop)
- ✅ Multi-theme compatible (Dark, Light, Purple)
- ✅ Loading states visible (button disabled during API call)
- ✅ No console errors (React, TypeScript, network)

**Accessibility:**
- ✅ Keyboard navigable (Tab, Enter, Escape)
- ✅ Screen reader friendly (ARIA, labels)
- ✅ Color contrast meets WCAG 2.1 AA

**Performance:**
- ✅ Modal opens instantly (<500ms)
- ✅ API response <2s
- ✅ Page reload smooth (no flicker)

---

## 🚨 Known Limitations

**Phase 13E Scope:**
- ❌ Email/SMS notifications NOT implemented (Phase 13F)
- ❌ Bid analytics NOT implemented (Phase 13G)
- ❌ Installer chat NOT implemented (Phase 13H)
- ❌ Winner cannot be changed after selection (one-time action)

**Workarounds (If Needed):**
```sql
-- Manually revert winner selection (database admin only)
UPDATE "Bid" SET status = 'PENDING', "selectedAt" = NULL WHERE id = '[bidId]';
UPDATE "Lead" SET status = 'APPROVED', "purchasedAt" = NULL WHERE id = '[leadId]';
```

---

## 📝 Test Results Template

**Tester**: _______________  
**Date**: _______________  
**Browser**: _______________ (Chrome, Firefox, Safari, Edge)  
**Device**: _______________ (Desktop, Tablet, Mobile)  
**Theme**: _______________ (Dark, Light, Purple)

| Test Scenario | Status | Notes |
|---------------|--------|-------|
| 1. Successful Winner Selection | ☐ Pass ☐ Fail | |
| 2. Error Handling | ☐ Pass ☐ Fail | |
| 3. Validation Errors | ☐ Pass ☐ Fail | |
| 4. Multi-Theme Compatibility | ☐ Pass ☐ Fail | |
| 5. Responsive Design | ☐ Pass ☐ Fail | |
| 6. Accessibility | ☐ Pass ☐ Fail | |
| 7. Edge Cases | ☐ Pass ☐ Fail | |

**Overall Result:** ☐ PASS ☐ FAIL

**Issues Found:**
1. _______________
2. _______________
3. _______________

**Sign-off:** _______________

---

## ✅ Next Steps After Testing

**If All Tests Pass:**
1. ✅ Mark Phase 13E as complete
2. ✅ Update project documentation
3. ✅ Plan Phase 13F (Email/SMS notifications)
4. ✅ Deploy to staging environment

**If Tests Fail:**
1. ⚠️ Document issues in GitHub Issues
2. ⚠️ Prioritize: P0 (critical), P1 (high), P2 (medium)
3. ⚠️ Fix critical issues before marking complete
4. ⚠️ Re-run failed test scenarios

---

**Testing Prepared By**: GitHub Copilot  
**Implementation**: Phase 13E Backend Integration  
**Documentation**: DOC/PHASE-13E-BID-SELECTION-AUDIT.md
