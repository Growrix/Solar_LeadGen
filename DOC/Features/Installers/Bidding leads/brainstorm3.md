# Bidding Feature — Owner-Aligned v3 (UI/UX Final Planning)

Scope: Phase 1 focuses strictly on UI/UX. No backend changes in this phase. All server models, APIs, and database schema will be planned and implemented only after this UI/UX is finalized and approved. A persistent note appears throughout: Backend will be designed to match the final UI contracts/specs.

---
## 0. Executive Summary
- Homeowner decides the winning installer; identity anonymized until selection.
- Installers view complete technical details (no contact) and submit bids via an enhanced Quote Builder modal.
- Admin has oversight via a monitoring panel and exception/re-award placeholders (disabled in P1).
- Status surfaces clearly across cards and modals. Autosave preserves installer work.
- UI-only deliverables: components, state, and interactions simulated client-side.

Backend note: All storage (bids, drafts), guards (window, award, purchase), and notifications are deferred; stubs only where needed for UI demonstration.

---
## 1. Installer UI — Quote Builder (Audit + Enhancements)
Target file(s): `src/components/QuoteBuilderModal.tsx` (existing), new helpers as noted.

What exists (from audit):
- Title "Quote Builder: {lead.name}", top actions include "Save Draft", "Preview PDF", and "Send Quote".
- Live Preview shows Subtotal, GST (10%), Total Price, and a Financial Summary with a federal incentive estimate.
- Used by `InstallerLeadFeed` and admin component library preview.

Required UI changes (aligning with your notes):
- Primary action renaming:
  - Replace "Send Quote" with "Submit Bid".
  - Remove "Preview PDF" button entirely.
- Autosave:
  - Keep the existing "Save Draft" button for explicit save.
  - Add background autosave and restore on reopen.
  - Show non-intrusive confirmation text/icon when autosaved.
  - On the bidding lead card, surface "Draft Saved — Click to Edit" when a draft exists (see Lead Card section).
- System Design controls:
  - Panel Model: dropdown populated with AU market brands + a "Custom…" option that reveals a manual text input.
  - Inverter Model: same pattern as panels.
  - Battery: dropdown with brands + a battery capacity field.
    - Battery Capacity: dropdown with common sizes (3.5, 5, 7, 10, 13.5, 15, 20 kWh) + "Custom…" to enter any capacity.
- Pricing controls:
  - GST: add a checkbox "Include GST". When checked, show a percent input (default 10%) and apply in totals + a "Custom…" option that reveals a manual number input.
  - Federal Incentive: add a checkbox "Include Federal Incentive". When checked, show a currency input for the amount to subtract from total.
- Live Preview: 
  - Reflect installer-entered Bid Amount and all adjustments (GST include/exclude with percent; Federal Incentive include/exclude with amount) in real time.
  - Show line items subtotal, GST amount, Incentive amount, and Final Bid Total clearly.
- Submit Bid flow:
  - On click: validate UI fields locally; show toast "Bid submitted successfully" and set the lead card state to "Bid Submitted — Awaiting Homeowner Decision".
  - Keep form editable until countdown expires (UI-only lock when timer passes end).

Brands (populate dropdowns; allow manual override via "Custom…"):
- Solar Panel Brands: Canadian Solar, JA Solar, Jinko, LG, Longi, Hanwha Q Cells, Hyundai, Phono Solar, REC Solar, Risen, Seraphim, SunPower, Suntech, Trina, Aiko Solar.
- Inverter Brands: Enphase Energy, Fronius, SMA Solar Technology, SolarEdge, Huawei, Sungrow, GoodWe, Growatt, Ginlong / Solis.
- Battery Brands: Tesla, Sungrow, BYD, Sigenergy, Enphase Energy, Hinen, Neovolt.

Autosave strategy (UI-only):
- LocalStorage key: `bid:draft:${leadId}:${installerId}`.
- Save on input change debounce (750ms) and on modal close.
- Restore on modal open; show banner "Draft restored".

Backend note: Draft persistence and bid submission will be stored server-side later; UI contracts will define the payload shape for the subsequent API.

---
## 2. Installer UI — Lead Card (Bidding)
Target file(s): `src/components/InstallerLeadFeed.tsx` (LeadCard region).

- Actions:
  - "Lead Details" opens new `BidEvaluationModal` (shows all technical inputs; masks contact).
  - "Place Bid" or "Update Bid" opens `QuoteBuilderModal`.
  - If a draft exists: show secondary button "Draft Saved — Click to Edit".
- Status chips:
  - OPEN (default when assigned and window active)
  - BID SUBMITTED — AWAITING HOMEOWNER DECISION (after successful submit)
  - AWAITING HOMEOWNER DECISION (after window closes; edits locked)
  - AWARDED — PURCHASE TO UNLOCK (if homeowner selected this installer; show purchase CTA but leave contact masked)
  - LOST (if homeowner selected another installer; card disappears from feed and appears in `InstallerBiddingHistory` view)
- Countdown:
  - Visible throughout bidding. Lock inputs when expired (UI-only).

Backend note: Award state and winner-only purchase checks will be enforced server-side later; UI will passively render based on provided state.

---
## 3. New Installer Modals
- `BidEvaluationModal` (new):
  - Props: `isOpen`, `onClose`, `lead`.
  - Content: all homeowner technical inputs (location, postcode, address or area, energyBill, billType, roofType, budgetRange, desiredOffset, batteryRequired, capacity, timeframe, additionalNotes, quoteData fields). Contact info masked unless purchased and awarded later.
  - Footer: Close only (no backend actions in P1).

- `BidSubmissionModal` (alias: reuse `QuoteBuilderModal` with feature flags):
  - Props: `isOpen`, `onClose`, `lead`, `mode="BIDDING"`.
  - Shows brands + custom inputs, GST/Incentive toggles, autosave, and Submit Bid.

Backend note: None in P1; server upserts and validations come in backend phase based on these props.

---
## 4. Homeowner UI — Bidding Review
New component: `HomeownerBiddingReviewModal`.

- Entry:
  - Homeowner dashboard shows lead card state changes as bids arrive: first bid sets status to "Responded by Installer".
  - After countdown ends, a CTA appears to "Review Bids" opening `HomeownerBiddingReviewModal`.
- List presentation (anonymized):
  - Each bid tile shows: offered system details (panel, inverter, battery + capacity), capacityOffer, expectedInstallDate, notes, itemized totals, GST handling, incentive, and Final Bid Total.
  - Company identity blurred/hidden until winner is selected; optionally show a "Verified" badge if policy allows.
- Selection:
  - CTA per bid: "Deal Accepted" (enabled only after countdown ends).
  - Confirmation dialog to avoid misclick.
- Post-selection UX:
  - Lead card shows "Installer Selected — Expect Contact After Purchase".
  - No further edits/cancellation by homeowner.
- Modal UI :
  - Tabs : each tabs shows individual bid details. 

Backend note: Winner selection, notifications, and subsequent purchase gating are deferred. UI will capture selection intent and show final-state mock until backend exists.

---
## 5. Admin UI — Oversight
- `AdminBidsPanel` (new):
  - Read-only monitoring of bids per lead (sorting/filtering), updated in UI via mock data.
  - Columns: Lead, Installer (anonymized toggle), Bid Total, GST included?, Incentive included?, Submitted At, Status.
- `AdminLeadManagementModal` (existing):
  - Keep price-edit-until-purchase behavior.
  - Ensure countdown editor is single-source-of-truth for bidding window.
  - Add placeholders (disabled buttons) for: Re-award, Reopen Window, and Force Lock.

Backend note: Real-time streams and auditing will be implemented later; P1 only shows static or simulated updates.

---
## 6. Component Contracts (UI-only)
- `QuoteBuilderModal` (Bidding mode)
  - Props: `{ isOpen: boolean; onClose: () => void; lead: Lead | null; onSubmitBid?: (draft: BidDraft) => Promise<void> | void; }`
  - State: `{ draft: BidDraft; autosaveStatus: 'idle'|'saving'|'saved'; showGst: boolean; gstPercent: number; showIncentive: boolean; incentiveAmount: number; brands: BrandLists; }`
  - Events: `onChange(draft)`, `onAutosave(draft)`, `onSubmitBid(draft)`
  - Visual: primary "Submit Bid"; secondary "Save Draft"; no "Preview PDF".

- `BidEvaluationModal`
  - Props: `{ isOpen: boolean; onClose: () => void; lead: Lead }`
  - Content: Technical data only; masked contact.

- `HomeownerBiddingReviewModal`
  - Props: `{ isOpen: boolean; onClose: () => void; leadId: string; bids: Array<UIBid>; onDealAccepted: (bidId: string) => void }`
  - Bids array for P1 provided via local state or stubbed provider.

- `BiddingStatusBadge`
  - Props: `{ status: 'OPEN' | 'BID_SUBMITTED' | 'DECISION_PENDING' | 'AWARDED_PENDING_PURCHASE' | 'PURCHASED' | 'LOST' }`

Types (UI-only):
- `BidDraft` minimal: `{ amount: number; capacityOffer?: number; expectedInstallDate?: string; notes?: string; panelBrand?: string; panelCustom?: string; inverterBrand?: string; inverterCustom?: string; batteryBrand?: string; batteryCapacity?: number; batteryCapacityCustom?: number; includeGst?: boolean; gstPercent?: number; includeIncentive?: boolean; incentiveAmount?: number; lineItems?: Array<{ label: string; qty: number; unitPrice: number }>; }`
- `BrandLists`: `{ panels: string[]; inverters: string[]; batteries: string[] }`
- `UIBid`: read-only snapshot of submitted data for homeowner view.

Backend note: These UI types will inform the final Prisma model and API schemas.

---
## 7. UI Behaviors & States
- Countdown enforcement (UI): disable editing after expiry and switch badges to DECISION_PENDING.
- Draft button visibility: on LeadCard, show "Draft Saved — Click to Edit" only when local draft exists for that lead.
- Success toasts:
  - Submit Bid: "Bid submitted successfully".
  - Autosave: subtle "Saved" indicator near the action bar.
- Theme & responsiveness:
  - Must pass Dark, Light, Purple themes and 5 breakpoints: 320, 375, 768, 1024, 1440.

---
## 8. Pages, Files, and Changes (UI-only)
- Modify:
  - `src/components/QuoteBuilderModal.tsx`: implement brand dropdowns + custom inputs; battery capacity; GST and Federal Incentive toggles; remove Preview PDF; rename action; autosave; live preview math.
  - `src/components/InstallerLeadFeed.tsx`: add bid statuses; buttons; draft state detection; integrate `QuoteBuilderModal` in Bidding mode; open `BidEvaluationModal`.
  - `src/components/admin/AdminLeadManagementModal.tsx`: keep countdown as SOT; add disabled placeholders for overrides.
- Add:
  - `src/components/BidEvaluationModal.tsx` (installer): details-only.
  - `src/components/homeowner/HomeownerBiddingReviewModal.tsx` (homeowner): anonymized list and selection UI.
  - `src/components/BiddingStatusBadge.tsx` (shared): standardized labels/colors.
- Optional UI stubs for P1 (if needed to demonstrate flows):
  - `src/lib/ui-stubs/bidding.ts`: in-memory arrays for bids/drafts with simple helpers.

Backend note: No API calls in P1. Replace stubs with real services later.

---
## 9. Acceptance Criteria (P1 UI-Only)
Installer
- Can open Lead Details (no contact info) and Place/Update Bid.
- Quote Builder shows brands dropdowns + custom, battery capacity, GST and Incentive toggles.
- Autosave + manual save works; draft restores automatically; Draft button appears on card when saved.
- Submit changes status to "Bid Submitted — Awaiting Homeowner Decision"; success toast appears; inputs lock after countdown.

Homeowner
- Lead card shows "Responded by Installer" after first bid.
- After countdown, can open Bidding Review and see anonymized bids with complete financial summaries reflecting GST/incentive handling.
- Can click "Deal Accepted" (UI-only confirmation) and see post-selection state on the card.

Admin
- Can see Admin Bids Panel with read-only rows; Lead Management Modal controls countdown (single SOT); override actions are visible but disabled.

Theming/Accessibility
- Passes Dark/Light/Purple and 5 breakpoints; maintains contrast and keyboard navigation in modals.

---
## 10. UI Implementation Plan (Sequenced)
1) Quote Builder
- Remove Preview PDF; rename Send → Submit Bid; add brand dropdowns with custom input; battery capacity; GST% toggle + input; incentive toggle + amount; live preview totals.
- Add autosave/restore, with key `bid:draft:${leadId}:${installerId}`.

2) Installer Lead Feed
- Add statuses and buttons per Bidding flow; detect/show Draft Saved; open BidEvaluationModal; handle UI-only submit and lock.

3) Homeowner Bidding Review
- Create anonymized list modal and wire from homeowner dashboard card; UI-only selection.

4) Admin Oversight
- Create AdminBidsPanel (UI-only list); enhance LeadManagementModal with countdown SOT and disabled override buttons.

5) QA
- Verify three themes, five breakpoints, status flows, autosave, toasts, and countdown locks.

Backend note: After P1 sign-off, we will generate the backend plan from these finalized UI contracts and component props, including Prisma models (Bid, BidDraft if needed), routes (submit/list/select), and winner-only purchase guard.

---
## 11. Open Items
- Show a neutral quality badge (e.g., Verified) to homeowners pre-selection? Default: allowed, identity still blurred.
- Reveal installer identity on selection or after purchase? Default: on selection; contact still masked until purchase.
- Allow homeowner to change selection before winner purchases? Default: grace period allowed; admin override required.

---
## 12. Quick UI Contract References
- Final bid total calculation (UI):
  - `subtotal = sum(lineItems.qty * unitPrice)`
  - `gstAmount = includeGst ? subtotal * (gstPercent/100) : 0`
  - `incentive = includeIncentive ? incentiveAmount : 0`
  - `finalTotal = subtotal + gstAmount - incentive`
- Success toast message: "Bid submitted successfully".
- Status labels: OPEN, BID SUBMITTED — AWAITING HOMEOWNER DECISION, DECISION_PENDING, AWARDED — PURCHASE TO UNLOCK, PURCHASED, LOST.

Backend note: Computation parity will be enforced server-side later; the UI formula above will be the contract baseline.
