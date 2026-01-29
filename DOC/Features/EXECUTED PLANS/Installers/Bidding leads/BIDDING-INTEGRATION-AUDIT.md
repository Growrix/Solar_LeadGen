# Bidding Lead Flow Integration - Comprehensive Audit

**Date**: November 27, 2025  
**Task**: Connect existing bidding modals and complete installer/homeowner bidding flows  
**Status**: Phase 1 - UI Integration (No Backend Changes)  
**Reference**: `DOC/Installers/Bidding leads/brainstorm3.md`

---

## Executive Summary

**Situation**: Bidding lead display is now working correctly (trophy icon, "Competitive Bidding" label, "Place Bid" button visible). However, the button shows an alert and opens QuoteBuilderModal without bid-specific functionality.

**Goal**: Connect existing bidding UI components (`BidEvaluationModal`, `HomeownerBiddingReviewModal`, `BiddingStatusBadge`, `QuoteBuilderModal`) to complete the bidding flow for installers and homeowners as defined in `brainstorm3.md`.

**Scope**: UI-only integration. No backend API changes, no database schema changes. All bid data simulated client-side using localStorage for Phase 1.

---

## Current State Analysis

### ✅ Already Built (Phase 1 Components)

1. **BidEvaluationModal** (`src/components/BidEvaluationModal.tsx`)
   - Purpose: Show anonymized competitor bids to installers
   - Features: Side-by-side comparison (up to 3 bids), price/system/brand details
   - Status: **Complete** - Ready to integrate
   - Props: `{ isOpen, onClose, leadId, bids, yourBidId }`

2. **HomeownerBiddingReviewModal** (`src/components/homeowner/HomeownerBiddingReviewModal.tsx`)
   - Purpose: Allow homeowners to review and select winning bid
   - Features: Anonymized installer names, sort by status/price, request contact
   - Status: **Complete** - Ready to integrate
   - Props: `{ isOpen, onClose, leadId, propertyAddress, bids, onRequestContact }`

3. **BiddingStatusBadge** (`src/components/BiddingStatusBadge.tsx`)
   - Purpose: Display bid status with semantic colors
   - Statuses: `no_bids`, `draft`, `submitted`, `shortlisted`, `not_selected`
   - Status: **Complete** - Ready to use
   - Props: `{ status, count? }`

4. **InstallerLeadFeed Display** (`src/components/InstallerLeadFeed.tsx`)
   - Trophy icon (orange) ✅
   - "Competitive Bidding" label ✅
   - "Place Bid" button ✅ (lines 746-762)
   - Filter dropdown includes "Competitive Bidding" ✅

### ❌ Not Yet Connected

1. **"Place Bid" Button** (line 748)
   - Currently: Shows alert + opens QuoteBuilderModal (generic mode)
   - Needed: Open Quote Builder in bidding mode with autosave

2. **QuoteBuilderModal** (`src/components/QuoteBuilderModal.tsx`)
   - Exists but not audited yet for bidding mode support
   - Needed per brainstorm3.md:
     - Remove "Preview PDF" button
     - Rename "Send Quote" → "Submit Bid"
     - Add brand dropdowns (panels, inverters, batteries) with "Custom" option
     - Add Battery Capacity dropdown (3.5, 5, 7, 10, 13.5, 15, 20 kWh)
     - Add GST toggle (checkbox + percent input, default 10%)
     - Add Federal Incentive toggle (checkbox + amount input)
     - Implement autosave to localStorage (`bid:draft:${leadId}:${installerId}`)
     - Show "Draft restored" banner on open if draft exists

3. **Lead Card Status Badges**
   - Not displaying BiddingStatusBadge component yet
   - Needed: Show status ("OPEN", "BID SUBMITTED", "DECISION_PENDING", etc.)

4. **Lead Details Button** (Installer)
   - Not connected to BidEvaluationModal
   - Needed: View full technical details without contact info

5. **Homeowner Lead Cards**
   - No "Review Bids" button yet
   - No integration with HomeownerBiddingReviewModal
   - Status updates not showing

---

## Gap Analysis

| Component | Current State | Needed | Priority |
|-----------|---------------|--------|----------|
| **Installer: Place Bid Button** | Shows alert | Open QuoteBuilderModal in bidding mode | **HIGH** |
| **Installer: Lead Details** | Not implemented | Open BidEvaluationModal (technical data only) | **HIGH** |
| **Installer: Status Badge** | Not showing | Add BiddingStatusBadge to lead card | **MEDIUM** |
| **Installer: Draft Detection** | Not implemented | Check localStorage, show "Draft Saved — Click to Edit" | **MEDIUM** |
| **QuoteBuilder: Bidding Mode** | Generic quote mode | Add brand dropdowns, GST/incentive toggles, autosave | **HIGH** |
| **Homeowner: Review Bids Button** | Not implemented | Add button when bids exist (after countdown) | **HIGH** |
| **Homeowner: Bidding Modal** | Exists but not wired | Connect to lead cards | **HIGH** |
| **Homeowner: Status Updates** | Not showing | Show "Responded by Installer" after first bid | **MEDIUM** |

---

## Implementation Plan

### Phase 1: Installer Bidding Flow (High Priority)

**Task 1.1**: Update "Place Bid" Button
- **File**: `src/components/InstallerLeadFeed.tsx` (line 748)
- **Change**: Remove alert, open QuoteBuilderModal with `mode="BIDDING"` prop
- **Test**: Click "Place Bid" → QuoteBuilderModal opens

**Task 1.2**: Add BiddingStatusBadge to Lead Cards
- **File**: `src/components/InstallerLeadFeed.tsx` (around line 590-610, header section)
- **Change**: Import BiddingStatusBadge, add below lead type label for bidding leads
- **Logic**: Detect status from localStorage bids array
  - `no_bids`: No draft/submission found
  - `draft`: Draft exists in localStorage
  - `submitted`: Bid submitted (marked in localStorage)
- **Test**: Verify badge displays with correct status and color

**Task 1.3**: Add "Lead Details" Button
- **File**: `src/components/InstallerLeadFeed.tsx` (action buttons section, around line 673-680)
- **Change**: Add new button "Lead Details" that opens BidEvaluationModal
- **State**: Add `const [isBidEvaluationOpen, setIsBidEvaluationOpen] = useState(false);`
- **Test**: Click "Lead Details" → BidEvaluationModal opens with tech details

**Task 1.4**: Detect and Show Draft Status
- **File**: `src/components/InstallerLeadFeed.tsx` (around line 750-760, before "Place Bid" button)
- **Logic**: Check `localStorage.getItem(`bid:draft:${lead.id}:${installerId}`)`
- **Change**: If draft exists, add secondary button "Draft Saved — Click to Edit"
- **Test**: Save draft → refresh → "Draft Saved" button appears

### Phase 2: QuoteBuilder Bidding Mode (High Priority)

**Task 2.1**: Audit QuoteBuilderModal
- **File**: `src/components/QuoteBuilderModal.tsx`
- **Action**: Read full file to understand current structure
- **Document**: Current props, state, UI sections, submit flow

**Task 2.2**: Add Bidding Mode Support
- **Changes**:
  - Add `mode?: 'QUOTE' | 'BIDDING'` prop (default 'QUOTE')
  - Conditional rendering:
    - If mode='BIDDING': Hide "Preview PDF", rename "Send Quote" → "Submit Bid"
    - Add brand dropdowns (per brainstorm3.md brand lists)
    - Add GST toggle + percent input
    - Add Federal Incentive toggle + amount input
    - Update live preview totals calculation
- **Test**: Open in bidding mode → verify UI changes

**Task 2.3**: Implement Autosave
- **Logic**:
  - localStorage key: `bid:draft:${leadId}:${installerId}`
  - Debounce save on input change (750ms)
  - Save on modal close
  - Restore on modal open (show "Draft restored" banner)
- **Test**: Type data → wait → close → reopen → data restored

### Phase 3: Homeowner Bidding Flow (High Priority)

**Task 3.1**: Add "Review Bids" Button to Homeowner Lead Cards
- **File**: Find homeowner lead card component (need to locate first)
- **Logic**: Show button when:
  - Lead type is 'bidding'
  - Countdown expired or bids exist
- **Action**: Opens HomeownerBiddingReviewModal
- **Test**: Homeowner sees "Review Bids" → clicks → modal opens

**Task 3.2**: Update Homeowner Lead Card Status
- **Logic**: Show "Responded by Installer" after first bid submitted
- **Change**: Check localStorage bids array for this lead
- **Test**: Installer submits bid → homeowner sees status update

**Task 3.3**: Wire HomeownerBiddingReviewModal
- **Props**: Pass `bids` array from localStorage
- **onRequestContact**: For Phase 1, just show success toast (no backend)
- **Test**: Homeowner reviews bids → clicks "Deal Accepted" → confirmation shown

### Phase 4: Client-Side Bid Management (UI Stubs)

**Task 4.1**: Create Bid Storage Utilities
- **File**: `src/lib/ui-stubs/bidding.ts` (NEW)
- **Functions**:
  - `saveBidDraft(leadId, installerId, draft)` → localStorage
  - `getBidDraft(leadId, installerId)` → draft object or null
  - `submitBid(leadId, installerId, bidData)` → save to bids array
  - `getBidsForLead(leadId)` → array of bids
  - `selectWinningBid(leadId, bidId)` → mark winner
- **Test**: Each function works with localStorage

**Task 4.2**: Integrate Bid Storage with Components
- **InstallerLeadFeed**: Use `getBidDraft` to detect status
- **QuoteBuilderModal**: Use `saveBidDraft` for autosave, `submitBid` on submit
- **HomeownerBiddingReviewModal**: Use `getBidsForLead` to populate list
- **Test**: Full flow works with localStorage persistence

---

## Verification Strategy

### Test Case 1: Installer Places Bid
**Steps**:
1. Login as Installer
2. Navigate to /installer/leads
3. Find bidding lead (trophy icon, orange color)
4. Click "Place Bid"
5. QuoteBuilderModal opens in bidding mode
6. Fill system details (panels, inverter, battery)
7. Toggle GST (10%) and Federal Incentive ($1500)
8. Verify live preview shows correct totals
9. Click "Submit Bid"
10. Success toast appears
11. Badge updates to "Bid Submitted"
12. Close and reopen → data persists

**Expected**: All 12 steps pass without errors

### Test Case 2: Draft Autosave
**Steps**:
1. Open "Place Bid" modal
2. Enter partial data (panel brand, inverter)
3. Wait 1 second (autosave debounce)
4. Close modal without submitting
5. Reopen modal
6. "Draft restored" banner appears
7. All entered data is present
8. "Draft Saved — Click to Edit" button appears on lead card

**Expected**: All 8 steps pass without errors

### Test Case 3: Homeowner Reviews Bids
**Steps**:
1. Installer A submits bid ($12,000)
2. Installer B submits bid ($11,500)
3. Login as Homeowner
4. Lead card shows "2 bids received"
5. Click "Review Bids"
6. HomeownerBiddingReviewModal opens
7. Both bids listed (anonymized: "Installer A", "Installer B")
8. Sorted by price (lowest first)
9. Click "Deal Accepted" on Installer B's bid
10. Confirmation dialog appears
11. Confirm → success toast
12. Lead card shows "Installer Selected"

**Expected**: All 12 steps pass without errors

### Test Case 4: Theme & Responsive
**Steps**:
1. Test all 3 themes (Dark, Light, Purple)
2. Test all 5 breakpoints (320px, 375px, 768px, 1024px, 1440px)
3. Verify:
   - BiddingStatusBadge colors match theme
   - Trophy icon is text-warning (orange)
   - Modals are fully visible and usable
   - No z-index issues
   - No text overflow

**Expected**: All themes and breakpoints pass

---

## Files to Modify

| File | Purpose | Changes |
|------|---------|---------|
| `src/components/InstallerLeadFeed.tsx` | Installer lead cards | Add BidEvaluationModal, wire "Place Bid", add status badge, draft detection |
| `src/components/QuoteBuilderModal.tsx` | Quote/bid submission | Add bidding mode, brand dropdowns, GST/incentive toggles, autosave |
| `src/lib/ui-stubs/bidding.ts` | Bid storage (NEW) | Create localStorage utilities for bid management |
| Homeowner lead card component (TBD) | Homeowner lead display | Add "Review Bids" button, wire HomeownerBiddingReviewModal, status updates |

**Total**: 3-4 files (1 new, 2-3 modifications)

---

## Rollback Plan

If integration causes issues:
1. **InstallerLeadFeed**: Revert "Place Bid" button to show alert only
2. **QuoteBuilderModal**: Remove bidding mode changes, keep generic quote mode
3. **Remove**: Delete `src/lib/ui-stubs/bidding.ts` file
4. **Git**: `git checkout -- <file>` for each modified file

---

## Success Criteria

✅ **Phase 1 Complete** when:
- Installer can click "Place Bid" and see QuoteBuilderModal in bidding mode
- QuoteBuilderModal shows brand dropdowns, GST/incentive toggles, autosave works
- Draft detection works ("Draft Saved" button appears when draft exists)
- BiddingStatusBadge displays correct status on lead cards
- "Lead Details" opens BidEvaluationModal with technical data
- Homeowner can click "Review Bids" and see HomeownerBiddingReviewModal
- Homeowner can select winning bid (UI-only confirmation)
- All bid data persists in localStorage
- All 4 test cases pass
- All 3 themes and 5 breakpoints verified

---

## Next Steps (Post Phase 1)

**Phase 2 - Backend Integration** (Future):
- Create Prisma Bid model
- Create `/api/bids` endpoints (POST, GET, PATCH)
- Replace localStorage with real API calls
- Implement winner-only purchase guard
- Add email notifications
- Add real-time bid updates via Pusher

---

## Known Constraints

1. **No Backend Changes**: Phase 1 is UI-only, all data stored client-side
2. **localStorage Limitations**: Data not shared across devices/browsers
3. **No Authentication**: localStorage keyed by leadId+installerId (string IDs)
4. **Mock Anonymization**: Installer names are client-side mocked
5. **No Purchase Flow**: Winner selection doesn't trigger purchase yet
6. **Countdown Timer**: Uses existing timer, no bid window validation

---

**Audit Completed By**: AI Assistant (GitHub Copilot)  
**Next Action**: Proceed to Task 1.1 (Update "Place Bid" Button)  
**Estimated Time**: 2-3 hours for full Phase 1 integration
