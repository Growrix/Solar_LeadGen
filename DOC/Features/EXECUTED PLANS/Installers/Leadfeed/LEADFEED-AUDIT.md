# Installer Lead Feed Audit

Date: 2025-11-24
Scope: Frontend (InstallerLeadFeed.tsx + mapping in leads/page.tsx) & Backend (Lead model, LeadAssignment, assigned leads API)
Goal: Identify gaps to implement distinct lifecycles for CALL_VISIT, WRITTEN_QUOTE, BIDDING leads; fix residential/property type display; ensure proper contact unlock after payment; surface bidding leads.

---
## 1. Data Model Summary (Prisma)
- Lead.quoteType enum: CALL_VISIT | WRITTEN_QUOTE | BIDDING
- Lead.status enum: DRAFT, PENDING_PHONE, PENDING_APPROVAL, APPROVED, PURCHASED, QUOTED, ACCEPTED, REJECTED, EXPIRED, CANCELLED, FLAGGED
- LeadAssignment relates installers to leads (competitive / multi-assignment).
- purchase/unlock concept implied by `installerId`, `purchasedAt`, `purchaseStatus`, `leadPrice`.

## 2. Current Installer API Coverage
- Implemented: GET /api/installer/leads/assigned returns assigned leads only.
- Missing:
  1. Endpoint to unlock/purchase CALL_VISIT leads (e.g. POST /api/installer/leads/{id}/purchase).
  2. Endpoint to submit quotes for WRITTEN_QUOTE (distinct from general quote builder; currently generic QuoteBuilderModal uses mock logic).
  3. Endpoint to list bidding leads separately or flag lead.purchaseStatus + aggregated quotes.
  4. Endpoint to list marketplace (unassigned/public) leads vs assigned (competitive) leads.

## 3. Frontend Component State (InstallerLeadFeed.tsx)
Findings:
- Contains hardcoded `mockLeads` array (ids 1–3) with mixed types; still used if `propLeads` undefined.
- `LeadType` union only: 'call_visit' | 'written' (NO 'bidding').
- Unlock logic local: `unlockedBy` array + status mutate in memory after simulated payment (StripeUnlockModal). No backend call.
- Contact masking logic: relies on `isUnlockedByInstaller` (client-only) rather than server purchase state; backend assigned route already masks homeowner name/phone until purchased.
- Countdown uses `LiveCountdownBar` with hardcoded `quoteType="instant"` (mismatch with actual lead.quoteType enum).
- Property/Residential display: uses `lead.systemDetails.estimatedSize` & `roofType`; mapping in page.tsx sets propertyType default 'Residential' and estimatedSize from `projectType`; underlying API `projectType` and `propertyType` may hold distinct semantics; residential area complaint likely due to missing field mapping.
- Bidding-specific UI absent: no representation for multi-installer competitive phase, persistent countdown after purchase, or distinct actions.

## 4. Mapping Layer (leads/page.tsx)
- Converts AssignedLead → Lead with:
  - `type`: maps quoteType CALL_VISIT -> 'call_visit', else -> 'written' (collapses WRITTEN_QUOTE & BIDDING into 'written').
  - Loses differentiation for BIDDING leads entirely.
  - PropertyType set to apiLead.propertyType or fallback 'Residential'; roofType forced 'N/A'; budget static placeholder.
  - Unlock status derived from homeowner.name === '***LOCKED***' (server mask) -> sets status 'new' or 'unlocked'; does not reflect real Lead.status lifecycle or purchase state.

## 5. Gap Analysis by Lead Type
### CALL_VISIT
Desired:
- Locked contact until payment.
- Unlock triggers backend purchase endpoint (updates lead.installerId, purchasedAt, status PURCHASED).
- Countdown visible pre-purchase (market availability window). Post-purchase maybe hidden (except bidding).
Current Gaps:
- No purchase endpoint; simulated payment only.
- Status mapping incorrect (uses 'new'/'unlocked' instead of APPROVED/PURCHASED).
- Unlock price display uses local data; must bind to `lead.leadPrice`.

### WRITTEN_QUOTE
Desired:
- Immediate ability to submit formal quotes without contact lock? (Installation may require contact details earlier—clarify).
- Separate quota/status transitions: APPROVED → QUOTED → ACCEPTED/REJECTED.
Current Gaps:
- Treated same as CALL_VISIT after mapping; no lifecycle difference; quoting gate uses `canQuote = lead.type === 'written' || isUnlocked` but mapping collapsed BIDDING.
- No backend quote submission integration.

### BIDDING
Desired:
- Competitive window; multiple installer proposals; contact unlock condition (only after homeowner selects winning bid or after window?).
- Countdown persists after purchase (per existing countdown code logic referencing BIDDING exemption).
Current Gaps:
- Collapsed into 'written'; not shown in feed; no bid submission UI (needs different semantics than standard quote builder).
- No API call for listing competitive bidding leads separately (marketplace vs assigned).

## 6. Root Causes
1. Data normalization collapsed enum values → lost differentiation (WRITTEN_QUOTE vs BIDDING).
2. InstallerLeadFeed designed pre-backend integration; retains mock dataset and client-only unlock state.
3. Absence of purchase/quote/bid endpoints prevents real lifecycle transitions.
4. Mapping oversimplifies property & system fields; 'residential area' issue likely due to using generic placeholders for roofType, budget.
5. Countdown `quoteType="instant"` mismatches enumerations and may mis-handle BIDDING logic.

## 7. Recommended Backend Additions
- POST /api/installer/leads/{leadId}/purchase (CALL_VISIT unlock) → validates assignment, charges credits, updates lead.installerId, purchaseStatus COMPLETED, purchasedAt, returns unmasked contact.
- POST /api/installer/leads/{leadId}/quotes (WRITTEN_QUOTE & BIDDING) → create Quote records.
- GET /api/installer/leads/marketplace?quoteType=CALL_VISIT|WRITTEN_QUOTE|BIDDING → list available non-assigned leads (visibility PUBLIC, status APPROVED, not expired).
- GET /api/installer/leads/bidding (or param) → return bidding leads with aggregated quote counts and remaining time.
- GET /api/installer/leads/{leadId} → unified detail view with contact masking logic.

## 8. Recommended Frontend Refactor
1. Replace local Lead interface with normalized shape referencing backend enums directly (quoteType, status, purchasedAt, leadPrice, countdown from API).
2. Remove mockLeads & client unlock simulation; rely solely on `leads` prop (or fetch marketplace vs assigned arrays separately).
3. Add distinct card rendering branches:
   - CALL_VISIT: Unlock CTA until purchased; show lock state & price.
   - WRITTEN_QUOTE: Immediate "Submit Quote"; contact possibly locked until accept (clarify spec) — if locked show placeholder; else show details.
   - BIDDING: Show number of bids, countdown always visible, "Submit Bid" action, contact locked until homeowner selects winner.
4. Maintain server-driven contact masking (name/phone). Do not locally decide masked state based on status alone.
5. Fix residential area display: ensure propertyType and location fields map correctly; remove static 'N/A' placeholders—use real roofType & budgetRange.
6. Integrate LiveCountdownBar with actual `quoteType` from enum.

## 9. Data Mapping Adjustments Needed
- Use raw API fields (propertyType, roofType, budgetRange) from lead instead of placeholders.
- Extend AssignedLead API to include roofType, budgetRange, purchaseStatus, purchasedAt, quotes count if required for feed.
- Distinguish quoteType values: map directly, do not collapse.

## 10. Risks & Considerations
- Introducing purchase endpoint changes credit balance logic; must validate concurrency & unique purchase (installerId assignment race conditions).
- Bidding flow complexity: need rules for max bidding leads per homeowner (already tracked by biddingLeadsSubmitted on User).
- UI migration must avoid logic changes until endpoints exist (phased approach: adjust types first, then connect endpoints).
- Countdown logic depends on expiresAt; ensure consistent timezone (ISO) usage.

## 11. Phase Outline (High-Level)
Phase A: Type & Data Alignment
- Update API (assigned leads) to include missing fields (roofType, budgetRange, purchaseStatus, purchasedAt, quotes count).
- Update mapping & component types; remove mock data.

Phase B: CALL_VISIT Purchase Flow
- Implement purchase endpoint.
- Integrate payment/unlock button -> real POST, update feed state from response.

Phase C: WRITTEN_QUOTE Submission
- Implement quote submission endpoint.
- Connect QuoteBuilderModal to backend; adapt status transitions.

Phase D: BIDDING Lifecycle
- Implement bidding listing endpoint.
- Add bid submission UI variant.
- Countdown persistence logic.

Phase E: Contact Unlock Policies
- Standardize when contacts are revealed per quoteType.
- Ensure server authoritative masking always.

Phase F: Final QA & Theming Consistency
- Multi-theme styling checks.
- Accessibility & responsiveness verification per existing migration specs.

---
## 12. Immediate Fix Targets
1. Remove mockLeads; feed should only use provided leads.
2. Preserve quoteType differentiation (add 'bidding').
3. Correct residential/property display using real propertyType / roofType / budgetRange.

---
## 13. Next Steps
- Append detailed task list to specs/006-component-by-component/tasks.md under new Leadfeed Improvement Phase.
- Begin Phase A implementation (non-breaking): adjust AssignedLead API & refactor InstallerLeadFeed types.

---
## 14. Open Clarifications Needed
- WRITTEN_QUOTE contact unlock timing (immediate or post homeowner acceptance?).
- BIDDING contact reveal trigger (after selection?).
- Distinction between assignment vs marketplace for WRITTEN_QUOTE leads.

---
Prepared by: GitHub Copilot (Audit)
