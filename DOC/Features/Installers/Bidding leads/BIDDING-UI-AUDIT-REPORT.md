# Bidding Feature UI Implementation - Comprehensive Audit Report

**Date**: November 27, 2025  
**Phase**: Pre-Implementation Audit  
**Scope**: UI/UX Only (Backend deferred per brainstorm3.md)  
**Reference**: `DOC/Installers/Bidding leads/brainstorm3.md`

---

## Executive Summary

This audit evaluates the current system against brainstorm3.md requirements for implementing bidding lead UI/UX. The analysis covers Quote Builder, Installer Lead Feed, Homeowner components, and Admin views to identify gaps and create a detailed implementation plan.

**Key Findings**:
- ✅ Quote Builder foundation exists with good structure
- ❌ Missing brand dropdowns with custom input capability
- ❌ No battery capacity field
- ❌ No GST/Federal Incentive toggles with manual inputs
- ❌ No autosave functionality
- ❌ Missing bidding-specific modals (BidEvaluationModal, HomeownerBiddingReviewModal)
- ❌ No bidding status badges or UI states
- ❌ Admin oversight components don't exist for bidding

---

## 1. Current State Analysis

### 1.1 Quote Builder Modal (`src/components/QuoteBuilderModal.tsx`)

**Current Implementation**:
- **File Path**: `src/components/QuoteBuilderModal.tsx` (250 lines)
- **Structure**: Modal with header, mobile tabs, editor panel (left), preview panel (right)
- **Actions**: Save Draft, Preview PDF, Send Quote buttons
- **System Design**: 
  - System Size input (number)
  - Panel Model dropdown (3 mock options: SunPower, Trina, Canadian Solar)
  - Inverter Model dropdown (2 mock options: Enphase, Fronius)
  - Battery dropdown (2 mock options: Tesla Powerwall, Enphase + "None")
- **Pricing**:
  - Line items with description, qty, unitPrice, tax toggle
  - Add/Remove line item functionality
  - Live totals calculation: subtotal, GST (fixed 10%), total
- **Live Preview**:
  - Totals (Subtotal, GST 10%, Total Price)
  - Financial Summary (Federal Incentive est., Net Cost est., Price per Watt, Est. Annual Savings, Simple Payback)
- **Autosave**: Mock timer (30s interval), shows "Saving..." state and last saved time
- **Themes**: Uses semantic classes (bg-background, text-foreground, shadow-neu-inset)

**Gap Analysis vs Brainstorm3 Requirements**:

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| Brand dropdowns with "Custom..." option | Fixed dropdowns, no custom input | ❌ Missing custom input pattern |
| Battery Capacity field (dropdown + custom) | No capacity field | ❌ Completely missing |
| AU market brands (15 panels, 9 inverters, 7 batteries) | Mock data (3 panels, 2 inverters, 2 batteries) | ❌ Insufficient options |
| GST toggle with % input | Fixed 10% GST | ❌ No toggle, no manual % input |
| Federal Incentive toggle with $ input | Fixed calculation, not editable | ❌ No toggle, no manual $ input |
| "Submit Bid" button | "Send Quote" button | ❌ Wrong label |
| No "Preview PDF" button | "Preview PDF" exists | ❌ Must remove |
| Autosave + restore on reopen | Mock autosave, no restore | ❌ No localStorage persistence or restore |
| Draft status on lead card | Not integrated | ❌ No feedback to parent |
| mode="BIDDING" prop support | No mode differentiation | ❌ No conditional rendering |

**Technical Details**:
- **Props**: `{ isOpen, onClose, lead, onSubmitQuote }`
- **State**: `quoteData`, `viewMode`, `mobileTab`, `isSaving`, `lastSaved`
- **Mock Data**: `MOCK_PANEL_MODELS`, `MOCK_INVERTER_MODELS`, `MOCK_BATTERY_MODELS`, `MOCK_PRESETS`
- **Calculations**: `useMemo` for subtotal, tax, total, pricePerWatt, federalIncentive, netCost, annualSavings, payback
- **Design System Compliance**: ✅ Uses semantic tokens, no hardcoded colors

---

### 1.2 Installer Lead Feed (`src/components/InstallerLeadFeed.tsx`)

**Current Implementation**:
- **File Path**: `src/components/InstallerLeadFeed.tsx` (1063 lines)
- **Structure**: Filter bar, lead cards, modals (LeadDetailsModal, QuoteBuilderModal)
- **Lead Types**: `'call_visit' | 'written' | 'bidding'` (type exists in TypeScript)
- **Lead Card Actions**: 
  - Purchase/Unlock (for call_visit when isUnlocked=false)
  - View Details
  - Submit Quote
  - Start Chat
- **Statuses**: `'new' | 'unlocked' | 'submitted' | 'expired' | 'contacted'`
- **Countdown**: Uses `<LiveCountdownBar>` component with `expiresAt` prop
- **Purchase Flow**: Shows purchase button, confirms, shows success banner "Lead Purchased"

**Gap Analysis vs Brainstorm3 Requirements**:

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| Bidding status badges (OPEN, BID_SUBMITTED, etc.) | Generic status badges | ❌ No bidding-specific states |
| "Lead Details" opens BidEvaluationModal | Opens LeadDetailsModal (shows all fields) | ❌ Wrong modal, exposes contact |
| "Place Bid"/"Update Bid" button | "Submit Quote" button | ❌ Wrong label, no bid/update distinction |
| "Draft Saved — Click to Edit" button | No draft detection | ❌ No localStorage check or button |
| Countdown locks inputs after expiry (UI-only) | Countdown exists, no lock logic | ❌ No disable state when expired |
| AWARDED — PURCHASE TO UNLOCK state | isPurchasedByAnother flag exists | ⚠️ Partial; needs winner-specific state |
| LOST state (move to history) | No history mechanism | ❌ Missing entirely |

**Technical Details**:
- **Props**: `{ leads, installer, onUnlockLead, onPurchaseLead, onSubmitQuote, onStartChat, refreshing, onRefresh }`
- **Lead Interface**: 76 lines, includes type, status, location, systemDetails, contact, expiresAt, etc.
- **LeadCard Component**: Lines 517-781 (internal to file)
- **Filtering**: By leadType, status, postcode, dateRange, priceRange
- **Design System Compliance**: ✅ Mostly semantic; some instances of hardcoded spacing

---

### 1.3 Homeowner Components

**Current State Search Results**:
- `HomeownerDashboardHeader` (basic page title)
- `HomeownerSidebar` (navigation)
- `HomeownerMobileSidebarMenu` (includes "Bidding Room" nav item - placeholder)
- `LeadEditModal` (allows editing PENDING_APPROVAL leads)
- `LeadPreviewModal` (read-only lead view for approved leads)
- `QuoteTypeDistributionModal` (allows selecting CALL_VISIT, WRITTEN_QUOTE, BIDDING counts; includes 1-bidding-max logic)

**Gap Analysis vs Brainstorm3 Requirements**:

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| Homeowner lead card shows "Responded by Installer" after first bid | "Purchased" text exists (call/visit) | ⚠️ Needs bidding-specific status |
| "Review Bids" CTA after countdown | No bidding review UI | ❌ Missing entirely |
| HomeownerBiddingReviewModal (anonymized bids) | No component | ❌ Missing entirely |
| "Deal Accepted" per bid | No component | ❌ Missing entirely |
| Post-selection: "Installer Selected — Expect Contact After Purchase" | No component | ❌ Missing entirely |

**Technical Details**:
- Homeowner bidding quota tracking exists in backend (`biddingLeadsSubmitted` field)
- `QuoteTypeDistributionModal` has `userAlreadyHasBiddingLead` prop and 1-max enforcement
- No bidding-specific dashboards or modals for post-submission flow

---

### 1.4 Admin Components

**Current State**:
- `AdminLeadManagementModal` (`src/components/admin/AdminLeadManagementModal.tsx`)
  - Purpose: Edit lead price, countdown, notes, assignments
  - Actions: Update price (until purchased), update countdown, assign/remove installers
  - Current Structure: Sections for details, pricing, countdown, admin notes, lifecycle, installer assignment
  - Countdown: Single SOT input field (days number input)
  - Assignments: Multi-select installers with individual notes

**Gap Analysis vs Brainstorm3 Requirements**:

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| AdminBidsPanel (monitoring bids per lead) | No component | ❌ Missing entirely |
| Disabled override buttons (Re-award, Reopen, Force Lock) | No placeholders | ❌ Missing entirely |
| Countdown as single SOT for bidding window | Countdown exists | ✅ Already single SOT |
| Price editable until purchase | Already implemented | ✅ Verified |

**Technical Details**:
- Modal uses Prisma Lead model
- Has price lock after `purchasedAt` is set
- Assignment flow uses upsert pattern (recent fix per conversation)
- No bidding-specific monitoring or override UI

---

## 2. Root Cause Analysis

### Why Gaps Exist

1. **Quote Builder**:
   - Built for generic quoting, not bidding-specific UX
   - No requirements for brand customization or incentive flexibility at prototype stage
   - Autosave was mocked for demo purposes, not production-ready

2. **Installer Lead Feed**:
   - Bidding type exists in enum but no UI implementation beyond basic card
   - Focus was on call/visit flow (recently completed per conversation)
   - No bidding-specific modals or workflows developed yet

3. **Homeowner UI**:
   - Bidding submission works (quota enforced), but post-submission flow missing
   - No design/implementation for bid review or selection
   - "Bidding Room" nav placeholder exists but no destination

4. **Admin UI**:
   - Lead management covers assignment + countdown, sufficient for bidding window setup
   - No monitoring/oversight tools built for live bidding scenarios

---

## 3. Impact Assessment

### Files to Modify

**High Priority** (Core bidding UX):
1. `src/components/QuoteBuilderModal.tsx` - Add brands, capacity, toggles, autosave, rename actions
2. `src/components/InstallerLeadFeed.tsx` - Add bidding statuses, draft detection, bid actions
3. `src/components/admin/AdminLeadManagementModal.tsx` - Add disabled override placeholders

**New Components Required**:
1. `src/components/BidEvaluationModal.tsx` - Installer: view technical details sans contact
2. `src/components/BiddingStatusBadge.tsx` - Shared status badge component
3. `src/components/homeowner/HomeownerBiddingReviewModal.tsx` - Homeowner: anonymized bid list + selection
4. `src/components/admin/AdminBidsPanel.tsx` - Admin: read-only bid monitoring

**Supporting Files**:
1. `src/lib/ui-stubs/bidding.ts` - UI-only in-memory helpers for draft/bid state (optional)
2. `src/types/bidding.ts` - TypeScript types for BidDraft, UIBid, BrandLists (optional)

### Features Affected

- ✅ **Existing call/visit flow**: No breaking changes (modifications are additive or conditional on `type="bidding"`)
- ✅ **Written quote flow**: No breaking changes
- ⚠️ **Bidding flow**: Currently non-functional for installers/homeowners; will become fully functional UI-only

### Risk Level

**LOW** - Changes are UI-only per brainstorm3.md Phase 1 scope. No backend API modifications, no database schema changes.

**Mitigation**:
- Use feature flags (`mode="BIDDING"`) to isolate new behavior
- Preserve existing button labels/actions when not in bidding mode
- LocalStorage for autosave/drafts (non-breaking, client-side only)
- Component composition (new modals are separate files, existing modals unchanged for other flows)

---

## 4. Implementation Plan

### Phase 0: Preparation (GATE 0 Checks + Setup)

**Tasks**:
1. ✅ Run TypeScript check (8 pre-existing errors noted, unrelated to bidding)
2. ✅ Run build check (verify dev environment)
3. ✅ Verify git status clean for bidding work
4. Create `specs/008-bidding-leads/tasks.md` with detailed phases
5. Read DESIGN-SYSTEM-SOT.md for token reference
6. Create brand constant files or inline arrays per brainstorm3 lists

**Exit Criteria**:
- tasks.md created with testing checkpoints
- Design token reference noted
- Brand lists ready for dropdowns

---

### Phase 1: Quote Builder Enhancements

**Tasks**:
1. Add `mode` prop to `QuoteBuilderModal` (`mode?: 'QUOTE' | 'BIDDING'`)
2. Replace "Send Quote" with "Submit Bid" when `mode === 'BIDDING'`
3. Remove "Preview PDF" button when `mode === 'BIDDING'`
4. Replace Panel dropdown with:
   - Dropdown with 15 AU brands + "Custom..."
   - Conditional text input when "Custom..." selected
5. Replace Inverter dropdown with:
   - Dropdown with 9 AU brands + "Custom..."
   - Conditional text input when "Custom..." selected
6. Replace Battery dropdown with:
   - Dropdown with 7 AU brands + "None" + "Custom..."
   - Conditional text input when "Custom..." selected
7. Add Battery Capacity field:
   - Dropdown with [3.5, 5, 7, 10, 13.5, 15, 20] kWh + "Custom..."
   - Conditional number input when "Custom..." selected
8. Add GST controls:
   - Checkbox "Include GST" (default checked)
   - Number input "GST %" (default 10, visible when checked)
   - Update calculations to use dynamic gstPercent
9. Add Federal Incentive controls:
   - Checkbox "Include Federal Incentive" (default unchecked)
   - Currency input "Incentive Amount $" (visible when checked)
   - Update calculations to subtract incentiveAmount
10. Implement autosave:
    - LocalStorage key: `bid:draft:${lead.id}:${installer.id}` (installer from context/prop)
    - Save debounced (750ms) on any input change
    - Save on modal close
    - Restore on modal open (show "Draft restored" banner)
    - Pass draft status up to parent via callback
11. Update Live Preview to show Final Bid Total with GST/Incentive adjustments

**Verification Commands**:
```powershell
# After modifications
npx tsc --noEmit  # Must pass (or same 8 pre-existing errors)
npm run build     # Must succeed
# Manual: Open modal in browser, test all new controls, verify autosave in localStorage
```

**Testing Checklist**:
- [ ] "Custom..." reveals text input for Panel/Inverter/Battery
- [ ] Battery Capacity dropdown + custom input works
- [ ] GST toggle shows/hides % input; calculations update
- [ ] Federal Incentive toggle shows/hides $ input; calculations update
- [ ] Live Preview shows correct Final Bid Total
- [ ] Autosave writes to localStorage every 750ms
- [ ] Closing modal saves draft
- [ ] Reopening modal restores draft and shows banner
- [ ] "Submit Bid" button appears when mode=BIDDING
- [ ] "Preview PDF" hidden when mode=BIDDING
- [ ] Dark, Light, Purple themes render correctly
- [ ] Mobile (320px), Tablet (768px), Desktop (1440px) layouts work

**Exit Criteria**:
- All checklist items pass
- No TypeScript errors introduced
- Design system verification: 0/0/0/0/0/0 (run 6 commands from DESIGN-SYSTEM-SOT.md)

---

### Phase 2: Installer Modals and Lead Card

**Tasks**:
1. Create `src/components/BidEvaluationModal.tsx`:
   - Props: `{ isOpen, onClose, lead }`
   - Display all technical fields from lead (location, systemDetails, energyBill, billType, roofType, budgetRange, desiredOffset, batteryRequired, capacity, timeframe, additionalNotes, quoteData)
   - Mask contact (name, email, phone show as "***LOCKED***")
   - Footer: Close button only
   - Semantic styling per design system
2. Create `src/components/BiddingStatusBadge.tsx`:
   - Props: `{ status: 'OPEN' | 'BID_SUBMITTED' | 'DECISION_PENDING' | 'AWARDED_PENDING_PURCHASE' | 'PURCHASED' | 'LOST' }`
   - Return appropriate badge with color/icon
   - Use semantic classes (bg-primary, text-primary, etc.)
3. Update `src/components/InstallerLeadFeed.tsx`:
   - Add state: `draftLeads` (Set<string> of lead IDs with drafts in localStorage)
   - On mount: check localStorage for keys matching `bid:draft:${leadId}:*`
   - LeadCard: if `lead.type === 'bidding'`:
     - Show `<BiddingStatusBadge status={...} />`
     - Replace "Submit Quote" with "Place Bid" (first time) or "Update Bid" (if draft exists)
     - Add secondary button "Draft Saved — Click to Edit" if draft exists
     - Add "Lead Details" button → opens `<BidEvaluationModal>`
     - After QuoteBuilder submit: update status to "BID_SUBMITTED" (UI-only state)
     - If countdown expired: disable inputs, set status to "DECISION_PENDING"
   - Pass `mode="BIDDING"` to QuoteBuilderModal when lead.type === 'bidding'

**Verification Commands**:
```powershell
npx tsc --noEmit
npm run build
# Manual: Navigate to installer lead feed, verify bidding lead card shows new buttons/statuses
```

**Testing Checklist**:
- [ ] BidEvaluationModal opens from "Lead Details" button
- [ ] Modal shows all technical fields, contact masked
- [ ] BiddingStatusBadge shows correct colors/labels for all 6 states
- [ ] "Place Bid" button appears on fresh bidding lead
- [ ] "Update Bid" button appears when draft exists
- [ ] "Draft Saved — Click to Edit" button appears when draft exists
- [ ] Clicking buttons opens QuoteBuilderModal in BIDDING mode
- [ ] After submit, status changes to "BID_SUBMITTED — AWAITING HOMEOWNER DECISION"
- [ ] Success toast appears: "Bid submitted successfully"
- [ ] If countdown expired, inputs disabled, status shows "DECISION_PENDING"
- [ ] All 3 themes work
- [ ] All 3 breakpoints work

**Exit Criteria**:
- All checklist items pass
- No new TypeScript errors
- Design system verification: 0/0/0/0/0/0

---

### Phase 3: Homeowner Bidding Review

**Tasks**:
1. Create `src/components/homeowner/HomeownerBiddingReviewModal.tsx`:
   - Props: `{ isOpen, onClose, leadId: string, bids: UIBid[], onDealAccepted: (bidId: string) => void }`
   - UI: List of bid tiles (anonymized)
   - Each tile shows:
     - System details (panel brand/custom, inverter, battery + capacity)
     - capacityOffer, expectedInstallDate, notes
     - Line items breakdown
     - GST handling (included/excluded with %)
     - Federal Incentive (included/excluded with $)
     - Final Bid Total
     - Company identity blurred/hidden (optional "Verified" badge)
   - CTA per bid: "Deal Accepted" button (enabled only after countdown ends)
   - Confirmation dialog on click
   - Post-selection: modal shows "Thank you! The installer will contact you soon."
2. Add UIBid type:
   ```typescript
   interface UIBid {
     id: string;
     installerId: string; // hidden from UI
     panelBrand?: string;
     panelCustom?: string;
     inverterBrand?: string;
     inverterCustom?: string;
     batteryBrand?: string;
     batteryCapacity?: number;
     capacityOffer?: number;
     expectedInstallDate?: string;
     notes?: string;
     lineItems: Array<{ label: string; qty: number; unitPrice: number }>;
     includeGst: boolean;
     gstPercent?: number;
     includeIncentive: boolean;
     incentiveAmount?: number;
     finalTotal: number;
     submittedAt: Date;
   }
   ```
3. Stub data provider (UI-only):
   - Create `src/lib/ui-stubs/bidding.ts` with mock bids array
   - Export `getMockBidsForLead(leadId: string): UIBid[]`
4. Wire modal from homeowner dashboard:
   - Add "Review Bids" button on bidding lead card (visible after countdown ends)
   - Opens `<HomeownerBiddingReviewModal>` with stubbed bids

**Verification Commands**:
```powershell
npx tsc --noEmit
npm run build
# Manual: Open homeowner dashboard, click "Review Bids" on mock bidding lead
```

**Testing Checklist**:
- [ ] Modal opens with anonymized bid list
- [ ] Each bid tile shows all required fields
- [ ] Company identity blurred
- [ ] "Verified" badge shows (if policy allows)
- [ ] "Deal Accepted" button enabled only after countdown ends (UI check)
- [ ] Confirmation dialog appears on click
- [ ] Post-selection message displays
- [ ] All 3 themes work
- [ ] All 3 breakpoints work
- [ ] Accessibility: keyboard navigation, contrast, ARIA labels

**Exit Criteria**:
- All checklist items pass
- No new TypeScript errors
- Design system verification: 0/0/0/0/0/0

---

### Phase 4: Admin Oversight UI

**Tasks**:
1. Create `src/components/admin/AdminBidsPanel.tsx`:
   - Props: `{ leadId?: string }` (optional filter to single lead)
   - UI: Table/list of bids
   - Columns: Lead ID/Name, Installer (anonymized toggle), Bid Total, GST included?, Incentive included?, Submitted At, Status
   - Sorting/filtering controls
   - Mock data from `src/lib/ui-stubs/bidding.ts`
2. Update `src/components/admin/AdminLeadManagementModal.tsx`:
   - Add section "Bidding Oversight" (visible when lead.quoteType === 'BIDDING')
   - Add disabled buttons:
     - "Re-award Lead" (disabled, tooltip "Available after backend implementation")
     - "Reopen Bidding Window" (disabled, tooltip "Available after backend implementation")
     - "Force Lock Bids" (disabled, tooltip "Available after backend implementation")
   - Verify countdown editor is single-source-of-truth (already implemented)

**Verification Commands**:
```powershell
npx tsc --noEmit
npm run build
# Manual: Open admin lead management modal for bidding lead, verify new section + disabled buttons
```

**Testing Checklist**:
- [ ] AdminBidsPanel renders with mock data
- [ ] Table columns show correct data
- [ ] Sorting/filtering works
- [ ] Anonymized toggle works
- [ ] AdminLeadManagementModal shows "Bidding Oversight" section for bidding leads
- [ ] Re-award, Reopen, Force Lock buttons visible but disabled
- [ ] Tooltips explain "backend not implemented yet"
- [ ] Countdown editor still works as SOT
- [ ] All 3 themes work
- [ ] All 3 breakpoints work

**Exit Criteria**:
- All checklist items pass
- No new TypeScript errors
- Design system verification: 0/0/0/0/0/0

---

### Phase 5: Full System Verification

**Tasks**:
1. Run all GATE 0 checks:
   ```powershell
   npx tsc --noEmit    # 0 new errors (8 pre-existing OK)
   npm run build       # Success
   npm run dev         # Starts without errors
   git status          # Review changes
   ```
2. Design system verification (6 commands from DESIGN-SYSTEM-SOT.md):
   ```powershell
   # Command 1: Hardcoded gray/slate colors → 0 matches
   Select-String -Path "src\components\QuoteBuilderModal.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"
   Select-String -Path "src\components\InstallerLeadFeed.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"
   Select-String -Path "src\components\BidEvaluationModal.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"
   Select-String -Path "src\components\homeowner\HomeownerBiddingReviewModal.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"
   # (Repeat for all 6 commands per DESIGN-SYSTEM-SOT.md for all modified/new files)
   ```
3. Theme testing:
   - Dark theme: all modals, lead cards, badges
   - Light theme: all modals, lead cards, badges
   - Purple theme: all modals, lead cards, badges
4. Responsive testing:
   - 320px (mobile): all components
   - 375px (mobile): all components
   - 768px (tablet): all components
   - 1024px (desktop): all components
   - 1440px (large desktop): all components
5. Accessibility:
   - Keyboard navigation (Tab, Enter, Escape) in all modals
   - Screen reader labels (ARIA attributes)
   - Contrast ratios pass WCAG 2.1 AA
6. Browser console: No errors
7. User flow testing:
   - **Installer**: View bidding lead → Open Lead Details (masked contact) → Place Bid (QuoteBuilder with brands/toggles/autosave) → Submit → See "BID_SUBMITTED" status → Draft button appears → Reopen modal restores draft
   - **Homeowner**: View bidding lead after countdown → Click "Review Bids" → See anonymized bids → Click "Deal Accepted" → See confirmation
   - **Admin**: Open bidding lead in management modal → See countdown editor → See disabled override buttons → Open AdminBidsPanel → See bid list
8. Git commit with descriptive message

**Final Verification Checklist**:
- [ ] TypeScript: 0 new errors
- [ ] Build: Success
- [ ] Dev server: Starts and runs
- [ ] Design system: 0/0/0/0/0/0 (all 6 commands, all modified files)
- [ ] Dark theme: Pass
- [ ] Light theme: Pass
- [ ] Purple theme: Pass
- [ ] 320px breakpoint: Pass
- [ ] 375px breakpoint: Pass
- [ ] 768px breakpoint: Pass
- [ ] 1024px breakpoint: Pass
- [ ] 1440px breakpoint: Pass
- [ ] Keyboard navigation: Pass
- [ ] Screen reader: Pass
- [ ] Contrast ratios: Pass
- [ ] Browser console: No errors
- [ ] Installer flow: End-to-end works
- [ ] Homeowner flow: End-to-end works
- [ ] Admin flow: End-to-end works
- [ ] Git commit: Created

**Exit Criteria**:
- ALL checklist items pass
- Honest status report created
- Ready for user review

---

## 5. Rollback Procedures

**If Phase 1 Fails**:
1. Revert `src/components/QuoteBuilderModal.tsx` via `git restore src/components/QuoteBuilderModal.tsx`
2. Clear localStorage keys matching `bid:draft:*`
3. Re-run TypeScript and build checks
4. Identify root cause before retry

**If Phase 2 Fails**:
1. Delete `src/components/BidEvaluationModal.tsx`
2. Delete `src/components/BiddingStatusBadge.tsx`
3. Revert `src/components/InstallerLeadFeed.tsx`
4. Re-run checks
5. Fix identified issues in isolation

**If Phase 3 Fails**:
1. Delete `src/components/homeowner/HomeownerBiddingReviewModal.tsx`
2. Delete `src/lib/ui-stubs/bidding.ts` (if created)
3. Revert homeowner dashboard changes
4. Re-run checks

**If Phase 4 Fails**:
1. Delete `src/components/admin/AdminBidsPanel.tsx`
2. Revert `src/components/admin/AdminLeadManagementModal.tsx`
3. Re-run checks

**General Rollback**:
```powershell
git stash  # Save work in progress
git status # Verify clean state
# Or specific file revert:
git restore <file-path>
```

---

## 6. Component Dependency Map

```
QuoteBuilderModal (modified)
└── (no children; leaf component)

InstallerLeadFeed (modified)
├── BidEvaluationModal (new) ← child
├── BiddingStatusBadge (new) ← child
├── QuoteBuilderModal (existing, modified) ← child
└── LeadCard (internal, modified)

HomeownerBiddingReviewModal (new)
└── BiddingStatusBadge (new) ← child (optional)

AdminLeadManagementModal (modified)
└── (no new children; internal sections added)

AdminBidsPanel (new)
└── BiddingStatusBadge (new) ← child (optional)
```

**Verification Order**:
1. Leaf components first: QuoteBuilderModal, BidEvaluationModal, BiddingStatusBadge, HomeownerBiddingReviewModal, AdminBidsPanel
2. Parent components: InstallerLeadFeed, AdminLeadManagementModal
3. Integration: Full user flows

---

## 7. Testing Strategy

### Unit-Level Testing (Per Phase)
- After each file modification: TypeScript check, build check
- Manual UI testing in browser with DevTools Console open
- LocalStorage inspection for autosave verification
- Network tab (no API calls expected in Phase 1; verify no errors)

### Integration Testing (Phase 5)
- End-to-end user flows (installer, homeowner, admin)
- Theme switching
- Responsive breakpoints
- Accessibility audit (keyboard, screen reader, contrast)

### Regression Testing
- Verify call/visit flow still works (purchase lead, unlock contact)
- Verify written quote flow still works (submit quote)
- Verify admin lead assignment still works (non-bidding leads)

---

## 8. Known Issues & Dependencies

**Pre-Existing TypeScript Errors (8 total)**:
- `leadId` type mismatch (string vs number) in installer pages and InstallerLeadFeed
- Per conversation summary: "Legacy issues from SOT merge; deferred; non-blocking for bidding work"
- **Decision**: Proceed with bidding UI implementation; these errors are unrelated

**External Dependencies**:
- None (UI-only phase; no API calls, no backend changes)

**Environment Requirements**:
- Node.js + npm (already working per GATE 0)
- Modern browser with localStorage support
- VS Code with TypeScript extension (recommended)

---

## 9. Success Criteria Checklist

Per AI-IMPLEMENTATION-GUIDELINES.md, a task is successful when:

- [x] All tests pass (no new failures)
- [ ] No breaking changes to existing features (to be verified in Phase 5)
- [ ] Code follows design system standards (semantic classes only)
- [ ] All component dependencies verified (map created above)
- [ ] Honest, accurate reporting (this audit provides baseline)
- [ ] User can verify results match brainstorm3.md expectations
- [ ] System is in a deployable state (UI-only; backend deferred)

---

## 10. Next Steps

1. ✅ Audit complete → Create `specs/008-bidding-leads/tasks.md`
2. ⏳ Implement Phase 1 (Quote Builder enhancements)
3. ⏳ Implement Phase 2 (Installer modals and lead card)
4. ⏳ Implement Phase 3 (Homeowner bidding review)
5. ⏳ Implement Phase 4 (Admin oversight UI)
6. ⏳ Implement Phase 5 (Full system verification)
7. ⏳ Create honest status report
8. ⏳ User review and approval
9. 🔜 Backend planning (deferred to Phase 2 per brainstorm3.md)

---

## Appendix A: Brand Lists (Per Brainstorm3)

**Solar Panel Brands (15)**:
Canadian Solar, JA Solar, Jinko, LG, Longi, Hanwha Q Cells, Hyundai, Phono Solar, REC Solar, Risen, Seraphim, SunPower, Suntech, Trina, Aiko Solar

**Inverter Brands (9)**:
Enphase Energy, Fronius, SMA Solar Technology, SolarEdge, Huawei, Sungrow, GoodWe, Growatt, Ginlong / Solis

**Battery Brands (7)**:
Tesla, Sungrow, BYD, Sigenergy, Enphase Energy, Hinen, Neovolt

**Battery Capacity Options (7 + Custom)**:
3.5, 5, 7, 10, 13.5, 15, 20 kWh + "Custom..." → manual input

---

## Appendix B: UI Calculation Formulas (Per Brainstorm3)

```typescript
// Final bid total calculation (UI-only contract)
const subtotal = sum(lineItems.qty * unitPrice);
const gstAmount = includeGst ? subtotal * (gstPercent / 100) : 0;
const incentive = includeIncentive ? incentiveAmount : 0;
const finalTotal = subtotal + gstAmount - incentive;
```

**Success toast message**: "Bid submitted successfully"

**Status labels**:
- OPEN
- BID SUBMITTED — AWAITING HOMEOWNER DECISION
- DECISION_PENDING (after countdown)
- AWARDED — PURCHASE TO UNLOCK
- PURCHASED
- LOST

---

**End of Audit Report**

**Prepared by**: AI Agent (Claude Sonnet 4.5)  
**Reviewed**: Pending user approval  
**Status**: Ready for tasks.md creation and Phase 1 implementation
