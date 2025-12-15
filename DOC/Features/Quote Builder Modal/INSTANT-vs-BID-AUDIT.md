# Instant Quote vs Bid Builder – Frontend Audit

Date: 2025-12-01
Scope: Deep-dive audit of Instant Quote Calculator (homeowner-facing) and Bid Builder Modal (installer-facing). Goal is to align fields, reuse homeowner inputs, and streamline the Bid Builder for faster, more relevant bids.

---

## 1) Instant Quote Calculator – UI/Fields Inventory

Component: `src/components/InstantQuoteForm.tsx`
Structure: 3-step flow with progressive disclosure, strong inline validation and guidance.

- Global
  - Mode switch: Residential / Commercial
  - Stepper indicator (1 → 3)

- Step 1: Property Details
  - `postcode` (required, 4 digits, region validation)
  - `location` (required)
  - `state` (required, select)
  - `retailer` (optional select)
  - Existing system toggle: `hasExistingSystem` → `existingSystemSize` (required when true)

- Step 2: Energy & System Details
  - Usage input model
    - Radio select between: Monthly kWh OR Quarterly Bill ($)
    - `electricityUsageType`, `electricityValue` with bounds + contextual helper text
  - Recommendation
    - Computed `recommendedSize` banner
    - `systemSizeOverride` (optional numeric)
  - Offset target
    - `desiredOffset` range slider (25–150%) + labels (reduce bills → zero → export income)
  - Commercial-only
    - `peakDemand`, `projectPriority`, `isThreePhase`
  - Roof & System configuration
    - `panelOrientation` (8 options with performance %)
    - `roofTilt` (flat/low/optimal/steep)
    - `shadingLevel` (none→heavy)
    - `roofType` (required)
    - `panelBrand` preference (optional)
    - Residential-only `usagePattern`
    - Advanced options: `includeOptimizers`, `includeMicroinverters`
  - Budget & Tariff
    - `budgetRange` (required; ranges per res/com)
    - `tariffPlan` (flat/tou/demand/controlled)
    - `customRetailRate` (c/kWh)
    - `customFeedInRate` (c/kWh)
  - Battery options (conditional when `batteryIncluded`)
    - `batteryCapacity` (+ custom size)
    - `batteryBrand`
    - `backupCritical` (essential/partial/whole/none)
    - `batteryUsage` (self-consumption/backup/arbitrage/independence)
    - Advanced battery toggles: `includeVPP`, `includeEVCharging`, `includeSmartHome`, `includeGridServices`

- Step 3: Results
  - Key metrics: Final Price, Payback, Annual Savings
  - Cost breakdown (subtotal + rebates)
  - System specs (size, panel count, wattage, inverter size, battery)
  - Energy performance (annual/daily, CO₂, 25-year savings)
  - Graph: `SavingsChart`
  - CTA: Proceed to detailed quotes / get another quote

UX Strengths
- Clear steps, validation, and helper tooltips
- Rich context with banners, recommendations, and realistic ranges
- Residential/Commercial split influences available inputs and copy

---

## 2) Bid Builder Modal – UI/Fields Inventory

Component: `src/components/QuoteBuilderModal.tsx` with sections in `src/components/quote-builder/*`
Structure: Multi-section modal with sticky right-side preview + graphs.

- Header
  - Quick Presets, Lead Details (BidEvaluationModal), Preview (HomeownerPreviewModal), Save Draft, Submit
  - Autosave, draft restore banner

- Sections (left column)
  - System Selection
    - `projectType` (Residential/Commercial)
    - `systemType` (dropdown 7 types)
    - `systemSize` (kW)
  - Roof & Site Details
    - `roofType`, `pitchDeg`, `arrays`, `orientations[]`, `shadingLevel` (0–?), `phaseType`, `switchboardUpgrade`, `smartMeterRequired`, `distanceToSwitchboardM`, `notes`, `photos[]`
  - Product Configuration
    - Panels (brand, model, wattage, efficiency, qty, warranties, tier1)
    - Inverter (brand, model, type, capacityKw, mppts, warranty)
    - Battery (optional; brand, model, usableKwh, warranty, backupCircuitRequired)
    - Addons[] (auto-synced to line items)
  - Pricing Engine
    - Line items with GST per row; categories (9), installer cost mode (COGS)
    - Incentives: STC (eligible, zone, stcCount, stcPrice), VIC (rebate + loans)
    - Discounts[]
    - Assumptions panel provided via props
  - Compliance Docs
    - Artefacts + identifiers

- Right column
  - Customer Preview summary (real-time)
  - Graph: `SavingsChart` (ROI & annual cost)

- Calculator & Persistence
  - Centralized `quoteCalculator.ts` (subtotals, GST, incentives, savings, payback)
  - Autosave to localStorage (per lead & mode)

UX Strengths
- Professional bi-column layout, live preview + graphs
- Presets, addon sync, robust pricing & assumptions
- Zero design-system violations enforced

---

## 3) Field Mapping – What Homeowners Provide vs What Installers Need

| Instant Quote (Homeowner) | Bid Builder (Installer) | Mapping Notes |
| --- | --- | --- |
| propertyType (res/com) | projectType | Direct map (Residential/Commercial) ✓ |
| postcode, state | STC zone, pricing assumptions | Use postcode/state to prefill STC zone and defaults ✓ |
| retailer, tariffPlan | assumptions.retailPrice/feedInTariff | Prefill assumptions; show source note ✓ |
| electricityUsageType + electricityValue | assumptions.selfConsumption, system sizing context | Use to derive recommendation; optional banner ✓ |
| recommendedSize / systemSizeOverride | system.systemSize | Prefill; lock a note showing homeowner input ✓ |
| budgetRange | pricing/discount guidance | Suggest target total or flag affordability band 🟨 |
| hasExistingSystem + size | products/presets or roof details | Prefill addon “add panels”, inverter-only, or array count 🟨 |
| panelOrientation / roofTilt / shadingLevel | roof.orientations / pitchDeg / shadingLevel | Normalize: orientation enum list, tilt→pitch, shade scale ✓/🟨 |
| roofType | roof.roofType | Direct map ✓ |
| usagePattern (res only) | assumptions.selfConsumption | Tweak self-consumption default (e.g., evening → lower) 🟨 |
| batteryIncluded + capacity/brand/backup/usage | products.battery & addons | Prefill battery block; map usage→notes/backupCircuitRequired ✓ |
| includeVPP / EV / SmartHome / GridServices | addons/tags | Prefill as addons or flags; show in preview 🟨 |

Legend: ✓ direct, 🟨 requires normalization or design decision

---

## 4) Gaps & Misalignments

1) Prefill bridge missing
- Lead model stores `quoteData`, but Bid Builder does not import homeowner answers automatically.

2) Tariff & retailer context not surfaced
- Assumptions exist but ignore InstantQuote’s `customRetailRate/customFeedInRate` and `retailer/tariffPlan`.

3) Orientation/tilt/shade models differ
- InstantQuote uses orientation string + tilt buckets + shade buckets; Bid Builder has `orientations[]` and numeric `pitchDeg`. Needs normalization helpers.

4) Budget signals unused
- `budgetRange` could set target bands or warnings when totals exceed homeowner budget.

5) Battery intent lost
- Battery purpose, backup priorities, brand preferences not mapped to product fields or notes.

6) Existing system path
- No fast path for “add panels” or “replace inverter” tied to `hasExistingSystem`.

7) UX parity
- InstantQuote has strong helper copy, tooltips, and guardrails; Bid Builder could mirror selective hints where homeowner inputs apply.

---

## 5) Data Normalization – Proposed Conversions

- Orientation: string → enum in `roof.orientations[]` with percent hints retained in UI help.
- Roof tilt: bucket → `pitchDeg` defaults: flat=5°, low=15°, optimal=25°, steep=40°.
- Shading: bucket → numeric { none:0, minimal:1, partial:2, moderate:3, heavy:4 }.
- Rate inputs: `customRetailRate`/`customFeedInRate` (c/kWh) → assumptions.retailPrice/fit (AUD/kWh).
- Budget bands: map to { min, max } guidance for total; show subtle banner if over range.

---

## 6) Security & Validation Observations

- InstantQuote: robust field-level validation and scroll-to-error; good ranges and ARIA.
- Bid Builder: relies more on installer knowledge; should add soft validations only for prefilled values (non-blocking hints).

---

## 7) Accessibility & Design-System

- Both adhere to tokenized classes; InstantQuote uses additional guidance text that improves comprehension. Recommend reusing the tooltip pattern and helper captions in Bid Builder for prefilled values.

---

## 8) Summary – Biggest Wins if We Align

- Faster bid creation through single-click import from homeowner answers
- More accurate assumptions (retail/FiT) → better graphs/payback
- Clearer roof/site defaults from homeowner context
- Battery and advanced feature intent retained → fewer back-and-forths

