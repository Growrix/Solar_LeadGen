# Instant → Bid Builder Enhancement Plan

Date: 2025-12-01
Objective: Leverage Instant Quote inputs to streamline and enhance Bid Builder. Preserve logic integrity and design-system compliance (0/0/0/0/0/0).

---

## P0 – Import & Prefill (Foundational)

1) Import action in Bid Builder header
- Add `Import from Instant Quote` button when `lead.quoteData` exists.
- On click: run mapping pipeline; show diff preview (before/after) with accept/cancel.

2) Mapping pipeline (normalizers)
- Build `mapInstantToBid(instant: any): Partial<QuoteDraft>` in `src/lib/mappers/instant-to-bid.ts`.
- Conversions:
  - projectType ← propertyType
  - system.systemSize ← systemSizeOverride || recommendedSize
  - assumptions.retailPrice/fit ← customRetailRate/customFeedInRate (c/kWh → $/kWh)
  - roof: roofType, pitchDeg (tilt bucket→deg), shadingLevel (bucket→scale), orientations[] (from panelOrientation)
  - products.battery from batteryIncluded/capacity/brand; backupCircuitRequired from backupCritical
  - pricing: pre-seed line items minimal; incentives via existing STC/VIC logic
  - tags/addons for VPP/EV/SmartHome/GridServices

Concrete normalization rules (finalized):
- Orientation: InstantQuote `panelOrientation` string → Bid `roof.orientations[]` enum entry (retain performance % in helper text).
- Tilt: InstantQuote `roofTilt` bucket → Bid `pitchDeg` default mapping: flat=5°, low=15°, optimal=25°, steep=40°.
- Shading: InstantQuote `shadingLevel` bucket → Bid `shadingLevel` numeric scale: none=0, minimal=1, partial=2, moderate=3, heavy=4.
- Rates: `customRetailRate`/`customFeedInRate` in c/kWh → `assumptions.retailPrice`/`feedInTariff` in $/kWh (divide by 100).
- Budget: `budgetRange` band → internal {min,max} for soft guidance banner.

3) Safety & UX
- Non-blocking banners when totals > budgetRange; clickable hint “Adjust system size or components”.
- Persist an `importMeta` stamp so imports are idempotent and auditable.

Helper captions (finalized):
- Any prefilled field shows a muted caption: “Prefilled from homeowner Instant Quote”.
- Tooltips reused from InstantQuote for roof orientation/tilt/shading.

---

## P1 – Assumptions & Graph Accuracy

4) Tariff-aware defaults
- Default `assumptions.retailPrice`/`feedInTariff` from either instant custom rates or state averages.
- Display small note “From homeowner Instant Quote”.

5) Self-consumption heuristic
- Use `usagePattern` to set initial `selfConsumption` (e.g., evening→0.45, daytime→0.65, spread→0.55).

6) Postcode-driven STC guardrail
- When postcode present in instant data, run auto STC zone lookup; allow manual override as today.

---

## P1 – Roof & Site Coherence

7) Orientation model bridge
- Provide a helper to translate single orientation → initial `roof.orientations` entry.

8) Tilt/Shade conversion
- Buckets to numeric: flat=5°, low=15°, optimal=25°, steep=40°; shade none..heavy → 0..4.

Roof & Site – Expanded field set (finalized):
- Roof Material: tile, metal (Colorbond), flat (membrane), slate, other
- Roof Pitch: numeric degrees (derived from tilt buckets), editable by installer
- Shading Level: none/minimal/partial/moderate/heavy (stored as 0..4)
- Panel Orientation: north, northeast, northwest, east, west, southeast, southwest, south
- Array Count: number of arrays for complex roofs
- Array Layout Notes: free-text notes for stringing/combiner placement
- Roof Access Notes: ladder/scaffold, access constraints, safety considerations
- Structural Notes: truss spacing, batten type, tile condition, penetrations
- Smart Meter Required: boolean
- Switchboard Upgrade: boolean
- Distance to Switchboard (m): numeric
- Photos: list of image refs (optional)

Installer-only extras (optional but recommended):
- Mounting System Preferred: rail brand/model (text)
- Conduit Run Complexity: low/medium/high (enum)
- Inverter Location Notes: indoor/outdoor, ventilation

---

## P2 – Battery & Advanced Options

9) Battery mapping
- If homeowner selected battery: pre-create battery block with capacity, brand, purpose; add note for backup priority.

10) Feature toggles to addons
- Map VPP/EV/SmartHome/GridServices to addons with $0 line items or tags visible in preview.

---

## P2 – UI/UX Parity Improvements

11) Helper captions
- For any prefilled field, show muted caption: “Prefilled from homeowner Instant Quote”.

12) Quick adjust controls
- In System Selection, add compact controls to tweak system size ±0.5 kW quickly.

13) Budget hint
- If `budgetRange` mapped to (min,max), show discreet hint when current total exceeds max by >10%.

Plain-English summary (finalized):
- Add an “Import from Instant Quote” button that pre-fills Bid Builder with homeowner answers.
- Automatically map project type, system size, roof details, tariffs, battery choices, and special features.
- Convert units and buckets to installer-friendly formats (degrees, $/kWh, numeric shading).
- Show helper captions where values were prefilled and keep tooltips consistent.
- Provide quick size adjusters and a soft budget warning; keep everything reversible.

---

## Deliverables & Files

- `src/lib/mappers/instant-to-bid.ts` – pure mapping + normalization helpers (+ tests if harness available)
- `src/components/QuoteBuilderModal.tsx` – import button + apply mapping + captions
- `src/components/quote-builder/RoofSiteDetails.tsx` – expand fields to match InstantQuote + installer extras; include helper captions/tooltips
- Docs: update `specs/008-description-enhance-existing/spec.md` User Story 7 (Import & Prefill)
- This plan document and the audit report in `DOC/Features/Quote Builder Modal/`

---

## Acceptance Criteria

- Import button appears only when `lead.quoteData` present.
- Applying import pre-fills at least: projectType, systemSize, roofType, pitch/shade/orientation, retail/FiT, battery (if chosen).
- All changes maintain 0/0/0/0/0/0 design-system checks.
- No logic regressions in calculator; graphs reflect updated assumptions immediately.
- Import is idempotent and reversible (cancel or re-import allowed).
- Roof & Site section includes InstantQuote fields (orientation, tilt→pitch, shading, material) plus installer extras (array count, access, structural, notes).
- Helper captions visible on prefilled fields; design-system checks remain 0/0/0/0/0/0.

---

## Rollout Notes

- Start behind a feature flag `features.importInstantQuote` (env or config).
- Add telemetry counters (import clicked, succeeded, canceled) if analytics available.
- Provide fallback path when `quoteData` is malformed – soft error toast.

---

## Patch Outline – Expand Roof & Site Details (for developers)

Files to modify:
- `src/components/quote-builder/RoofSiteDetails.tsx`
- Optional helpers: `src/lib/mappers/instant-to-bid.ts`

Minimal UI changes (example outline – keep semantic classes):

1) Add new props to `RoofSiteDetailsData`:
- `arrays: number`
- `orientations: string[]`
- `roofAccessNotes?: string`
- `structuralNotes?: string`
- `mountingSystemPreferred?: string`
- `conduitRunComplexity?: 'low'|'medium'|'high'`
- `inverterLocationNotes?: string`

2) In `RoofSiteDetails` component, add inputs:
- Orientation select (single or multi): options = [north, northeast, northwest, east, west, southeast, southwest, south]
- Pitch input (degrees) with helper caption “Prefilled from Instant Quote (tilt → pitch)” when imported
- Shading level select mapped to numeric scale 0..4 with helper tooltip
- Array count number input + array layout notes textarea
- Roof access notes textarea
- Structural notes textarea
- Mounting system preferred text input
- Conduit run complexity select (low/medium/high)
- Inverter location notes textarea

3) Prefill logic (mapper):
- Map InstantQuote `roofTilt` → `pitchDeg` using bucket mapping
- Map `panelOrientation` → `orientations = [value]`
- Map `shadingLevel` → numeric scale per rules above
- Map `roofType` directly

4) Design-system verification:
- Ensure no hardcoded colors/typography/responsive classes outside tokens
- Run 6 commands to confirm 0 matches before commit

5) Testing notes:
- Import a lead with InstantQuote → open Bid Builder → verify prefilled roof fields
- Modify values → verify autosave and preview graphs update within 500ms
- Mobile/desktop responsiveness for new inputs; accessibility labels/tooltips present

---

## Phase 12 – Flexible Combo Box Implementation (Dec 2025)

**Date**: December 3, 2025  
**Status**: ✅ Complete  
**Objective**: Match UI with InstantQuote fields + flexible dropdowns so installers can type custom values

### Problem Statement

After implementing the import functionality, a critical UX gap was identified:
- **Field Mismatch**: Only 18/40+ fields were mapping from Instant Quote
- **Rigid Dropdowns**: Installers couldn't type custom values (e.g., "Custom Panel Model ABC123")
- **Real-world Pain**: Panel/inverter model not in dropdown → installer stuck
- **User Concern**: "Make sure Quick Presets functionality stays as it is, don't make it limited"

### Design Philosophy

**Formula**: `InstantQuote fields + Bid Builder extra fields = Perfect Bid Builder for installers`

**Key Principle**: Additive, not restrictive
- ✅ Provide common presets for speed (dropdown selection)
- ✅ Allow manual typing for flexibility (custom values)
- ✅ Preserve ALL existing features (60+ fields, Quick Presets, 9 categories)

### Implementation Overview (T110-T118)

#### T110: FlexibleComboBox Component ✅
**File**: `src/components/ui/FlexibleComboBox.tsx` (157 lines)

**Features**:
- Dropdown selection OR manual typing
- Real-time filtering as user types
- Keyboard navigation (Arrow/Enter/Escape)
- Click-outside detection
- Optional prefilled captions
- Design-system compliant (bg-surface, hover:bg-surface-hover)

**Props**:
```typescript
interface FlexibleComboBoxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FlexibleComboBoxOption[];
  placeholder?: string;
  allowCustom?: boolean; // Default true
  prefilledCaption?: string;
}
```

**Key Code**:
```typescript
// Filtering logic
const filteredOptions = options.filter(opt =>
  opt.label.toLowerCase().includes(filter.toLowerCase())
);

// Input handler (allows typing)
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  onChange(newValue); // Updates parent state
  setFilter(newValue); // Updates filter for dropdown
  setIsOpen(true); // Opens dropdown
};
```

#### T111: Expanded Mapper (18→28 fields) ✅
**File**: `src/lib/mappers/instant-to-bid.ts`

**Added 11 Homeowner Context Fields**:
- Energy Context: `electricityUsage`, `retailer`, `tariffPlan`
- Product Preferences: `panelBrandPreference`, `optimizers`, `microinverters`
- Property Context: `existingSystem`, `propertyType`
- Goals: `budgetRange`, `desiredOffset`, `usagePattern`

**Storage Location**: `quoteDraft.meta.homeowner*` fields

**Example**:
```typescript
if (instant.budgetRange) {
  result.meta.homeownerBudget = instant.budgetRange;
}
if (instant.panelBrandPreference) {
  result.meta.homeownerPanelPreference = instant.panelBrandPreference;
}
```

#### T112: Homeowner Requirements Section ✅
**File**: `src/components/quote-builder/HomeownerContext.tsx` (280 lines)

**Features**:
- Collapsible section (default collapsed)
- Only renders when homeowner data exists
- 4 subsections with read-only display:
  1. **Energy Usage**: electricity usage, pattern, retailer, tariff
  2. **Budget & Goals**: budget range, desired offset
  3. **Property Context**: property type, existing system
  4. **Product Preferences**: panel brand, optimizers, microinverters

**Integration**: Top of QuoteBuilderModal (above System Selection)

**Example Display**:
```
Homeowner Requirements [Imported from Instant Quote]

Energy Usage:
  Electricity Usage: 1200 kWh/bill
  Usage Pattern: Evening Peak
  Retailer: AGL
  Tariff: Peak/Off-Peak

Budget & Goals:
  Budget Range: $8000-$10000
  Desired Offset: 80%
```

#### T113: Roof & Site Flexible Fields ✅
**File**: `src/components/quote-builder/RoofSiteDetails.tsx`

**Converted 5 Fields**:
1. **Roof Type**: 7 presets (Tile, Metal, Colorbond, Tin, Slate, Flat, Other) + custom
2. **Roof Pitch**: 6 common angles (5°, 15°, 22°, 25°, 30°, 40°) + custom degrees
3. **Shading Level**: 4 levels (None, Light, Medium, Heavy) + custom
4. **Mounting System**: 6 brands (Clenergy, SunLock, IronRidge, Unirac, Quick Mount, K2) + custom
5. **Conduit Complexity**: 3 levels (Low, Medium, High) + custom

**Preserved**: Orientations multi-select chips (not modified - works well)

**Real-world Example**:
- Installer sees homeowner preferred 22° pitch → can select from dropdown
- Or type "27" for custom pitch not in list
- Or type "SunLock Pro Series" for mounting system variant

#### T114: Product Configuration Flexible Fields ✅
**File**: `src/components/quote-builder/ProductConfiguration.tsx`

**Converted 8 Fields**:

**Panels** (2 fields):
1. **Brand**: 8 major brands (Trina Solar, JinkoSolar, Canadian Solar, LONGi, JA Solar, Risen, Seraphim, Suntech) + custom
2. **Model**: 6 popular models (Vertex S+ 430W, Tiger Neo 440W, HiKu6 450W, Hi-MO 5 435W, etc.) + custom

**Inverters** (3 fields):
3. **Brand**: 8 major brands (Fronius, SolarEdge, Sungrow, Huawei, GoodWe, Enphase, SMA, Growatt) + custom
4. **Model**: 6 popular models (Primo GEN24, HD-Wave SE5000, SH5K, SUN2000-5KTL, etc.) + custom
5. **Type**: 4 types (String, Hybrid, Microinverter, Power Optimizers) + custom

**Battery** (3 fields):
6. **Brand**: 8 major brands (Tesla, LG Chem, BYD, Sungrow, Huawei, Sonnen, Alpha ESS, Pylontech) + custom
7. **Model**: 7 popular models (Powerwall 2, Powerwall 3, RESU10H, Battery-Box HVS, etc.) + custom
8. **Chemistry**: 3 types (LFP, NMC, NCA) + custom

**Real-world Example**:
- Homeowner selected "Trina Solar" in Instant Quote
- Installer sees this preference in Homeowner Requirements section
- Can quickly select "Trina Solar" from dropdown
- Or type "Trina Solar Custom Model XYZ-2024" if specific variant needed

#### Design System Audit ✅
**Commit**: 2e096c0

**Fixed Issues**:
- ❌ `bg-background-primary` → ✅ `bg-surface` (dropdowns are elevated)
- ❌ `bg-background-hover` → ✅ `bg-surface-hover` (correct hover state)
- ❌ `text-foreground-primary` → ✅ `text-foreground` (correct semantic)
- ❌ `text-foreground-muted` → ✅ `text-muted-foreground` (correct order)

**Rationale**:
- Dropdown list = elevated element → uses `bg-surface` (like cards/modals)
- Hover state → `bg-surface-hover` (defined in globals.css)
- Text hierarchy → `text-foreground` (primary), `text-muted-foreground` (secondary)

### Verification Results

**TypeScript**: Clean compilation (no errors)

**Design System**: 0/0/0/0/0/0 violations
1. Hardcoded gray/slate colors: 0 matches ✅
2. Dark mode classes: 0 matches ✅
3. RGB/HEX colors: 0 matches ✅
4. Hardcoded white/black: 0 matches ✅
5. Hardcoded typography: 0 matches ✅
6. Manual responsive classes: 0 matches ✅

**Feature Preservation**: ✅ All confirmed intact
- Quick Presets (3 bundles: Economy, Balanced, Premium)
- 60+ installer-only fields
- 9 pricing categories
- Import functionality
- Diff preview modal

### Impact & Benefits

**For Installers**:
- ⚡ **Speed**: Select common products from dropdown (1 click)
- 🎯 **Flexibility**: Type custom values when needed (no limitations)
- 💡 **Context**: See homeowner preferences highlighted
- ✅ **Familiarity**: Quick Presets still work exactly as before

**For Homeowners**:
- 🤝 **Alignment**: Installers see their preferences (budget, usage, product brands)
- 📊 **Transparency**: Homeowner context visible in collapsed section
- 🎯 **Relevance**: Bids match their actual needs and constraints

**Real-world Scenarios**:
1. **Common Case**: Installer selects "Tesla Powerwall 2" from dropdown → 1 click, done
2. **Custom Case**: Installer types "Tesla Powerwall 3 with backup gateway 2" → flexibility preserved
3. **Budget Aware**: Installer sees "$8k-$10k" budget → can adjust system accordingly
4. **Preference Match**: Homeowner wanted "Trina Solar" → installer prioritizes that brand

### Testing Checklist

- [x] FlexibleComboBox renders with dropdown + typing capability
- [x] Filtering works as user types
- [x] Keyboard navigation (Arrow/Enter/Escape)
- [x] Click-outside closes dropdown
- [x] Prefilled captions display correctly
- [x] 13 fields converted successfully
- [x] Homeowner Requirements section displays all context
- [x] Import still works (data pipeline intact)
- [x] Quick Presets still functional
- [x] Design-system compliant (0/0/0/0/0/0)
- [x] TypeScript compilation clean
- [x] No feature regressions

### Lessons Learned

**User Feedback Integration**:
- "Match UI with InstantQuote fields" → Added Homeowner Requirements section
- "Flexibility of installers inputs" → Built FlexibleComboBox with typing
- "Quick presets stays as it is" → Preserved all 60+ fields, confirmed in audit

**Design Decisions**:
- **Why combo box, not pure dropdown?** Real-world need for custom values (panel models change frequently)
- **Why show homeowner context?** Transparency and alignment (installers understand constraints)
- **Why preserve everything?** Trust and reliability (no feature loss = user confidence)

**Technical Wins**:
- Reusable component pattern (FlexibleComboBox used 13 times)
- Semantic design system compliance (proper bg-surface usage)
- Type-safe implementation (TypeScript interfaces for all options)
- Defensive programming (null checks, fallbacks)

### Future Enhancements (Optional)

**T115 - Budget Banner** (Skipped - time constraints):
- Add banner when total exceeds homeowner budget
- Quick actions: Reduce Battery, Remove Addons, Dismiss
- Non-blocking notification pattern

**T116 - Budget Badge** (Skipped - time constraints):
- Display budget as badge in System Selection
- Visual indicator: green (under), yellow (near), red (over)

**T117 - E2E Testing** (Recommended):
- Playwright test: Select from dropdown → verify value saved
- Playwright test: Type custom value → verify value saved
- Test all 13 flexible combo box fields
- Test import → prefilled captions appear

**Dynamic Model Filtering**:
- When panel brand selected → filter model dropdown to matching models
- When inverter brand selected → filter model dropdown
- Requires brand-to-models mapping data

### Commits

1. **9ffd96e**: Backup before Phase 12
2. **f3e9f93**: T110 FlexibleComboBox + T111 Mapper expansion
3. **6660333**: T112 Homeowner Requirements section
4. **2099ef3**: T113 Roof & Site flexible fields
5. **5826e0d**: T114 Product Configuration flexible fields
6. **2e096c0**: Design System audit fix

### Conclusion

Phase 12 successfully implemented flexible combo boxes across 13 fields, expanded the mapper to 28 fields, added homeowner context visibility, and maintained 100% design-system compliance with zero feature loss.

**Formula Achieved**: ✅ InstantQuote + Bid Builder = Perfect Bid Builder

The implementation balances speed (dropdown presets) with flexibility (custom typing) while preserving all existing functionality. Installers can now work efficiently with common products and handle custom scenarios without limitations.

