# Bid Builder Enhancement — Comprehensive Implementation Plan

Date: 2025-12-02
Branch: `008-description-enhance-existing`
Owner: Growrix / SOLARMATCH-SAAS

---

## 0) Purpose
- Close the gap between Instant Quote (homeowner inputs) and Bid Builder (installer workflow).
- Ensure visible, user-facing enhancements land in the actual Bid Builder modal.
- Remove ambiguity: plan enumerates concrete UI changes, backend wiring, tests, acceptance.

---

## 1) Conversation Audit — Tasks vs Plan vs Outcome

### 1.1 What we did (verified)
- E2E test infrastructure fixed and stabilized (Playwright + webServer, port pinning).
- Hydration failure resolved in test route; Bid Builder renders reliably in tests.
- Added stable `data-testid` hooks and assertions for Import flow, captions, budget banner.
- Budget banner logic verified via injected line items; console warnings filtered.

### 1.2 What was planned (from INSTANT-to-BID-ENHANCEMENT-PLAN.md)
- Add "Import from Instant Quote" button when `lead.quoteData` exists.
- Implement mapping pipeline `mapInstantToBid(instant): Partial<QuoteDraft>`.
- Normalize and prefill: projectType, systemSize, tariffs, roof tilt/orientation/shading, budget, battery/addons.
- Show helper captions: "Prefilled from homeowner Instant Quote".
- Non-blocking budget hint (>10% over max).
- Multi-field expansion in Roof & Site; installer extras.

### 1.3 Outcome Gaps (why UI looks unchanged)
- Import button and mapping were only exercised in the test route, not wired in production modal header.
- No visible production UI feature flag to toggle import or show captions across real sections.
- Mapper file (`instant-to-bid.ts`) not implemented or not integrated with modal state.
- Roof & Site field expansion not applied to production components.
- Budget banner exists, but depends on totals and is not guaranteed visible without realistic pricing.

Conclusion: Tests validate behaviors in a controlled test page, but production integration of import/mapping/UI expansion remains incomplete. This plan addresses that gap with concrete work.

---

## 2) Frontend Deep Audit — Current vs Target

### 2.1 Current (Bid Builder)
- Modal structure: Header (presets, save, submit), left sections (System, Roof/Site, Products, Pricing), right preview.
- Calculator: central totals and savings; autosave working; draft restore banner.
- Data tokens: design-system compliance enforced.

### 2.2 Target Enhancements (visible)
- Header: Add `Import from Instant Quote` button when `lead.quoteData` present.
- Diff Preview: Modal dialog listing before/after values; Accept → apply mapping, Cancel → do nothing.
- Helper Captions: Render muted caption under prefilled fields across System, Roof/Site, Assumptions, Pricing.
- Roof & Site Expansion: add arrays count, orientation chips (multi), installer notes (access/structural), mount system, conduit complexity, inverter location notes.
- Assumptions Prefill: retail/FiT from Instant data (c/kWh → $/kWh), self-consumption heuristic from `usagePattern`.
- Budget Hint: soft warning banner when `currentTotals.total > budgetRange.max * 1.1`.
- Quick Adjust: “±0.5 kW” controls in System Selection.

---

## 3) Backend/State Audit — Data Flow & Missing Wiring

### 3.1 Current
- LocalStorage key (bid mode): `bid:draft:${leadId}:installer-id`.
- Autosave/restore works; draft versioning banner shown.
- No import mapper wired to modal state.

### 3.2 Required Wiring
- Implement `src/lib/mappers/instant-to-bid.ts` exporting `mapInstantToBid(instant, defaults)`: 
  - projectType ← propertyType
  - systemSize ← recommendedSize or override
  - assumptions.retailPrice/feedInTariff ← customRetailRate/customFeedInRate ÷ 100
  - roof: orientations[], pitchDeg from bucket, shadingLevel 0..4, roofType
  - pricing.budgetRange ← band → {min,max}
  - products.battery / addons from Instant features
  - meta.importedAt, importSource, prefilledFields[] list of affected paths
- Integrate mapper in `QuoteBuilderModal.tsx` import flow; apply partial draft update + set captions context.
- Feature flag `features.importInstantQuote` to guard rollout.

---

## 4) Detailed Implementation Plan

### 4.1 Files to Add/Update
- Add: `src/lib/mappers/instant-to-bid.ts` (pure functions + unit tests when harness available)
- Update: `src/components/QuoteBuilderModal.tsx` (header import button, diff modal, apply mapping, captions)
- Update: `src/components/quote-builder/RoofSiteDetails.tsx` (expand fields per plan; show captions)
- Update: `src/components/quote-builder/SystemSelection.tsx` (quick adjust; captions)
- Update: `src/components/quote-builder/PricingEngine.tsx` (budget band hint; captions near STC and budget)
- Optional: `src/components/quote-builder/AssumptionsPanel.tsx` (retail/FiT/selfUse captions)
- Add: `src/design-tokens/captions.ts` (shared caption style helpers)

### 4.2 Mapping & Normalization Rules (final)
- Orientation: Instant `panelOrientation` string → Bid `roof.orientations[]` with tooltip showing performance %.
- Tilt → Pitch: buckets flat/low/optimal/steep → 5°/15°/25°/40° default pitch.
- Shading: none/minimal/partial/moderate/heavy → 0..4 numeric.
- Tariffs: `customRetailRate`/`customFeedInRate` (c/kWh) → `$`/kWh (÷100).
- Budget: range string → `{min,max}`; show banner at `> max * 1.1`.
- Battery/Addons: pre-create structures/tags; set $0 addons or notes.

### 4.3 Captions & Diff Preview
- Captions format: muted, small text under input: “Prefilled from homeowner Instant Quote”.
- Diff Preview modal shows changed paths with before→after; grouped by sections.
- On Accept: apply mapping, stamp `meta.importedAt`, push affected paths to `meta.prefilledFields`.

### 4.4 Feature Flag & Idempotency
- `features.importInstantQuote` in app config; button only appears if true and `lead.quoteData` present.
- If already imported (meta.importedAt exists), show re-import option with new diff; maintain idempotency.

### 4.5 Testing (Playwright)
- Add E2E tests that run against real modal route (not only test page):
  - Button presence when `lead.quoteData` exists.
  - Diff modal appears with populated changes.
  - After Accept, captions appear under affected fields.
  - Budget banner appears when totals exceed band by >10% (set example line items).
  - Quick adjust buttons update preview totals within 500ms.

### 4.6 Acceptance Criteria
- Import button visible only when `lead.quoteData` is available and feature flag enabled.
- Accepting import updates Bid Builder visible fields with helper captions.
- Roof & Site shows expanded field set with normalized values.
- Assumptions reflect Instant tariffs; preview updates instantly.
- Budget hint works and is dismissible; no console errors.
- Design-system checks remain 0/0/0/0/0/0 across themes/breakpoints.

---

## 5) Execution Phases

### Phase A — Wiring & Minimal UI
- Implement mapper + diff modal; wire import button in header.
- Prefill core fields (system size, tariffs, STC zone, roof type/orientation/pitch/shading).
- Add captions for affected fields.

### Phase B — Roof & Site Expansion
- Add arrays, orientation chips, installer notes, mount system, conduit complexity, inverter location notes.
- Ensure imported values appear and are editable.

### Phase C — Budget & Assumptions
- Implement budget band conversion + banner trigger.
- Heuristic self-consumption from `usagePattern`; unit conversions.

### Phase D — Tests & CI
- Extend Playwright suite to production modal route.
- Ensure all 6 existing tests pass; add 4 new tests for import/diff/captions/quick adjust.

---

## 6) Risk & Mitigation
- Hydration/SRR issues → keep import/diff in client components; avoid server-only APIs in UI.
- Data mismatch → defensive mapping with safe defaults; show soft error toast on malformed input.
- Visual regressions → maintain design tokens; run verification commands post-change.

---

## 7) Work Tracking & Commit Rules
- Atomic commits per component or feature slice.
- Update `DOC/Records/gitstatus.md` and `DOC/Prompts/gitstatus.md` after each commit with ID, timestamp, summary.
- Keep E2E green in CI; block merges on failures.

---

## 8) Deliverables Checklist
- [ ] `src/lib/mappers/instant-to-bid.ts`
- [ ] Header import button + diff modal (QuoteBuilderModal)
- [ ] Captions across prefilled fields
- [ ] Roof & Site expanded inputs
- [ ] Budget band hint + dismiss
- [ ] Assumptions prefill + quick adjust controls
- [ ] Extended Playwright tests against real modal
- [ ] Documentation updates (spec.md, tasks.md, enhancement plan)

---

## 9) Done vs Pending Snapshot (from audit)

### Already Implemented ✅
- ✅ `src/lib/mappers/instant-to-bid.ts` - Complete mapper with all normalization functions
- ✅ `src/components/ImportPreviewModal.tsx` - Full diff preview modal (241 lines)
- ✅ Import button in `QuoteBuilderModal.tsx` header (conditional on `lead.quoteData`)
- ✅ Import handler with preview → accept → apply mapping flow
- ✅ Caption rendering in `SystemSelection.tsx` and `RoofSiteDetails.tsx` ("Prefilled from homeowner Instant Quote")
- ✅ Budget banner logic with 110% threshold
- ✅ E2E test infrastructure (6/6 passing tests)
- ✅ Design-system compliance enforcement

### Why UI May Look Unchanged ❓
**Root Cause**: The Import button only appears when `lead.quoteData` is populated. If testing with leads that don't have Instant Quote data, the button won't show.

**Visibility Conditions**:
1. Lead must have `quoteData` field populated (from Instant Quote submission)
2. Modal must be in production route `/installer/leads/[id]` or similar
3. Captions only appear AFTER import is accepted (not before)
4. Budget banner only visible when totals exceed `budgetRange.max * 1.1`

### Verification Steps
1. Navigate to a lead that went through Instant Quote flow
2. Open Bid Builder modal
3. Look for "Import from Instant Quote" button (should be blue/primary colored)
4. Click Import → Review diff → Click Accept
5. Verify captions appear under System Size, Project Type, Roof Type, Pitch, etc.
6. Add line items to exceed budget threshold → verify banner appears

---

## 10) Implementation Status & Next Actions

### Phase A — ✅ COMPLETE
- ✅ Mapper implemented (`instant-to-bid.ts`)
- ✅ Import button wired in modal header
- ✅ Diff preview modal implemented
- ✅ Caption rendering in SystemSelection and RoofSiteDetails

### Phase B — ⚠️ PARTIAL
- ✅ Roof Type, Pitch, Orientation, Shading mapped and shown
- ⚠️ Arrays count, installer notes (access/structural), mount system fields NOT YET expanded in UI
- Action: Expand `RoofSiteDetails.tsx` with additional installer-specific fields

### Phase C — ✅ COMPLETE
- ✅ Budget band conversion (`parseBudgetRange`)
- ✅ Budget banner trigger (110% threshold)
- ✅ Tariff conversions (c/kWh → $/kWh)
- ✅ Self-consumption heuristic from usage pattern

### Phase D — ⚠️ PARTIAL
- ✅ 6/6 E2E tests passing in test environment
- ⚠️ Production modal tests with real lead data NOT yet added
- Action: Add E2E test that creates lead with quoteData → opens modal → verifies Import button → completes import flow

---

## 11) Immediate Remediation Plan

### Issue: "No visual changes"
**Diagnosis**: All code exists but may not be tested with leads containing `quoteData`.

**Solution**:
1. ✅ Verify implementation exists (DONE - confirmed above)
2. Create test lead with populated `quoteData` in database
3. Navigate to Bid Builder for that lead
4. Document Import flow with screenshots
5. Add production E2E test with mock lead containing quoteData

### Next Implementation Work
1. **Expand Roof & Site fields** (Phase B completion):
   - Add `arrays` number input
   - Add `roofAccessNotes` textarea
   - Add `structuralNotes` textarea  
   - Add `mountingSystemPreferred` text input
   - Add `conduitRunComplexity` select
   - Add `inverterLocationNotes` textarea

2. **Add production E2E tests**:
   - Test with lead containing quoteData
   - Verify Import button visibility
   - Test diff preview with actual data
   - Verify captions appear after import
   - Test budget banner with high line items

3. **Quick adjust controls** (±0.5 kW in System Selection):
   - Add increment/decrement buttons next to system size input
   - Wire to update draft immediately

---

## 12) Testing Instructions for User

To see the Import functionality:

```typescript
// Option 1: Use test route that simulates lead with quoteData
// Navigate to: /test/quote-builder?id=TEST_IMPORT_1

// Option 2: Manually add quoteData to existing lead in database
// Update lead record with quoteData JSON containing:
{
  propertyType: 'residential',
  recommendedSize: 6.6,
  roofType: 'tile',
  roofTilt: 'optimal',
  panelOrientation: 'north',
  shadingLevel: 'minimal',
  customRetailRate: 32, // c/kWh
  customFeedInRate: 8,   // c/kWh
  usagePattern: 'evening',
  budgetRange: '$8000-$10000',
  batteryIncluded: false
}
```

After adding quoteData, the Import button will appear in the modal header.

---

## 13) Deliverables Checklist (Updated)

- ✅ `src/lib/mappers/instant-to-bid.ts` (382 lines, fully implemented)
- ✅ Header import button + diff modal (QuoteBuilderModal)
- ✅ Captions for prefilled fields (SystemSelection, RoofSiteDetails)
- ⚠️ Roof & Site expanded inputs (PARTIAL - core fields done, installer extras pending)
- ✅ Budget band hint + dismiss
- ✅ Assumptions prefill (retail/FiT/selfConsumption)
- ⚠️ Quick adjust controls (NOT YET IMPLEMENTED)
- ⚠️ Extended Playwright tests against real modal with quoteData (PENDING)
- ✅ Documentation updates (this plan, audit report)
