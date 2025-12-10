# Quote Builder Modal — Improvement Plan (AU Market)

Date: 2025-12-01
Owner: Engineering
Scope: UI/UX, pricing engine, analytics, export

---

## Objectives
- Elevate Quote/Bid Builder to AU market standard per research.
- Integrate robust, transparent calculation engine with time-series payback.
- Enable multi-option quoting (Economy / Balanced / Premium) with presets.
- Add missing inputs (roof/site, rebates, costs) and compliance artefacts.
- Keep design-system compliance and follow AI Implementation Guidelines.

---

## Additional Recommendations (2025-12-01)

- **User Feedback & Error Handling:**
  - Add inline validation for all numeric and required fields, especially in assumptions and compliance panels.
  - Surface calculation errors (e.g., invalid inputs, negative savings, missing required fields) with clear, actionable messages.

- **Accessibility:**
  - Ensure all new UI elements (inputs, toggles, tables, charts) are accessible (ARIA labels, keyboard navigation, focus states).
  - Test modal and preview sections with screen readers.

- **Performance:**
  - For large quotes or multiple options, ensure calculation and UI updates remain performant (debounce inputs, memoize calculations if needed).

- **Testing:**
  - Add/expand unit tests for the new calculation engine and option manager.
  - Consider integration tests for the modal flow (e.g., Cypress or Playwright).

- **Documentation:**
  - Update or add developer documentation for the new calculation logic, option manager, and any new utilities.
  - Document all assumptions and formulas for transparency and future audits.

- **Analytics (Optional):**
  - Consider tracking which presets/options are most used, and where users drop off in the quote process (for future UX improvements).

- **Internationalization (i18n):**
  - If future expansion is planned, structure labels and currency formatting for easy localization.

---

## References Read
- ChatGPT_CalculationLogic.md (formulas, TS module, payback series)
- ChatGPT_research.md (complete AU blueprint, sections and features)
- AI-IMPLEMENTATION-GUIDELINES.md (Gate-0, phased workflow, verification)

---

## Current State (quick audit)
Files:
- `src/components/QuoteBuilderModal.tsx` — container, autosave, presets, submit.
- `src/components/quote-builder/PricingEngine.tsx` — line items, GST toggle, STC & VIC inputs, discounts, price/W, installer cost mode, basic STC auto-calc.
- `src/components/quote-builder/*` — SystemSelection, RoofSiteDetails, ProductConfiguration, ComplianceDocs, CustomerPreview.

Strengths:
- Sections match research structure A–F.
- Draft autosave, presets, installer cost mode present.
- STC/VIC rebate inputs exist; STC count rough auto-calc.

Gaps vs research:
- Only ONE preview option generated; no A/B/C options or versioning.
- No postcode → STC zone mapping; no deeming-by-postcode.
- No feed-in tariff input in preview math; uses constants (yield 4.2, self-use 0.5, retail $0.30), ignores FIT and OPEX.
- No annual escalation, degradation, cashflow arrays, break-even interpolation, NPV/IRR.
- No side-by-side presets in one quote; CustomerPreview lacks scenario toggles.
- Compliance section doesn’t validate required artefacts (CEC, licence, insurance, datasheets) nor attach to export.
- PDF/Export is stub; branding inputs exist only as note.

---

## Calculation Logic Validation
Current formulas (from `QuoteBuilderModal.generatePreviewOptions` and `PricingEngine`):
- Subtotal/GST/discounts/STC/VIC → Total: OK.
- Price/W: OK.
- Annual prod/savings: `systemSize * 4.2 * 365 * 0.5 * 0.30` →
  - Issues: hardcoded yield (4.2), self-consumption (0.5), retail price (0.30); FIT not included; OPEX not subtracted.
- Payback: `total / estimatedSavingsPerYear` → simple payback only; no time series or escalation; Infinity handling absent when savings <= 0.
- STC auto-count: rough calc using panel wattage × deeming factor; lacks postcode/zone mapping and current-year deeming period.

Conclusion: Replace with `utils/quoteCalculator.ts` from research; wire inputs; expose time-series for graph & metrics (payback, NPV/IRR optional).

---

## Implementation Plan (Phased)

### Phase 0 — Gate-0 & Audit (No code changes)
- Run: `npx tsc --noEmit`; `npm run build`; `git status`; verify `.git` exists.
- Map quote builder files and data flow; list imports; verify packages used (no new deps needed initially).

### Phase 1 — Calculation Engine Integration
- Add `src/utils/quoteCalculator.ts` using research module (subtotal, tax, annual production/savings, payback, series, NPV/IRR).
- Inputs: collect from UI
  - System: `systemSize_kW`.
  - Pricing: `lineItems[] {qty, unitPrice, taxGst}` → subtotal; `includeGst` derived from per-line `taxGst` (keep current per-line behavior but also compute global tax for display consistency); `includeIncentive`, `incentiveAmount` = (STC + VIC + discounts).
  - Assumptions panel (new in Pricing/Preview): `yield_kWh_per_kW_per_day`, `selfConsumption`, `retailElectricityPrice`, `feedInTariff`, `annualOpex`, `annualDegradationPercent`, `electricityEscalationPercent`.
- Replace preview math in `QuoteBuilderModal.generatePreviewOptions` with calculator outputs. Guard against `annualSavings <= 0`.

### Phase 2 — STC & Rebate Enhancements
- Add lightweight postcode→zone lookup util and current-year deeming factor; compute STC count = arrays × zone × deeming period, override-able.
- UI: in `PricingEngine`, add postcode input and auto-zone selector; allow manual override with clear label.
- Combine incentives:
  - STC value = `stcCount * stcPrice`.
  - VIC rebate + loan flags persisted but loan not subtracted from Total (it’s a financing item) — show separate.

### Phase 3 — Multi-Option Quoting
- Add option manager in modal state: `preview.options` as array of 1–3 configs.
- UI in `CustomerPreview` already supports multiple options—enable creation:
  - Add “Add Option from Preset” + “Duplicate Current Option”.
  - Each option stores its own lineItems/assumptions snapshot.
- Ensure side-by-side comparison table fills from calculator outputs.

### Phase 4 — Performance & Finance
- Add Assumptions panel (right sidebar or Pricing tab footer) with sliders/inputs for self-use, yield, tariffs, OPEX, degradation, escalation, analysis years.
- Use `generateCashflowSeries` to output cumulative cashflow + annual savings.
- Add mini chart component (later): line for cumulative cashflow; bar for annual savings; show break-even marker (interpolated year).
- Optional: expose `npv(rate)` and `irr()` in advanced panel; default rate 5%.

### Phase 5 — Compliance & Branding
- Compliance checklist: validate required artefacts before submit (panel, inverter, battery datasheets; CEC accreditation; licence; insurance). Add inline validation and clear error messages for missing artefacts.
- Branding inputs: company name, logo, ABN, accreditation; store in quote meta.
- PDF export stub → JSON export first; later integrate server-side PDF.

### Phase 6 — UX & Presets
- Presets: confirm 3 named bundles map to research’s Economy/Balanced/Premium (brands, wattage, warranty). Provide price guardrails.
- Quick actions: apply preset to new option; re-run calculator; update preview.
- Ensure all new UI/UX elements are accessible and performant. Add ARIA labels, keyboard navigation, and focus states. Test with screen readers.

### Phase 7 — Testing & Verification
- Type checks: `npx tsc --noEmit` → 0 errors.
- Build: `npm run build`.
- Design system verification (6 commands) on changed files → 0/0/0/0/0/0.
- Manual checks: themes (Dark/Light/Purple) and breakpoints (320/375/768/1024/1440).
- Functional tests:
  - STC auto updates when size/zone/postcode changes; manual override persists.
  - Options A/B/C compute distinct totals and payback; comparison table populates.
  - Guards: if annualSavings <= 0, show message, payback = N/A.
- Add/expand unit and integration tests for calculation engine, option manager, and modal flow.

---

## Data Model & API Notes
- No schema change required for UI iteration; keep calculations client-side; include summary in payload for now.
- For bids (`/api/bids`), add optional fields later: `pricePerWatt`, `annualSavings`, `paybackYears` and a `calcAssumptions` blob for transparency. Plan for backward compatibility if adding new fields.

---

## Acceptance Criteria
- Preview shows Total, $/W, Annual Production, Annual Savings, Payback for each option using calculator, not constants.
- Multi-option (up to 3) supported with quick presets and duplication.
- STC auto-calc reflects postcode/zone and deeming; manual override allowed.
- Assumptions panel present; changing values immediately updates preview.
- Compliance artefacts validated before submit; clear error messages.
- All verifications pass; no design-system violations.

---

## Rollout & Safety
- Feature flag multi-option and advanced finance; default on in staging. Ensure feature flags are easy to toggle for QA/staging/production and are documented.
- Keep autosave keys versioned; migrating drafts should merge safely. Confirm autosave logic is robust for multi-option drafts and handles version migrations gracefully.
- Backup commit before modifying modal and pricing files per guidelines.

---

## Known Gaps to Address (from research)
- Add-ons marketplace catalog (EV charger, monitoring, bird-proofing, tilt frames).
- Performance layout graphic and PDF export pipeline.
- Installer-only cost analysis: show gross margin %, target range indicator.

---

## Task Breakdown (engineering)
1. Add `src/utils/quoteCalculator.ts` and unit tests (pure functions).
2. Wire `generatePreviewOptions` to calculator; add assumptions state.
3. Extend `PricingEngine` with postcode/zone + assumptions panel.
4. Option manager: CRUD for up to 3 options; integrate presets.
5. Compliance validation pre-submit; user feedback.
6. Add cumulative cashflow array to preview API; placeholder chart.
7. QA + verification; commit with atomic changes.
