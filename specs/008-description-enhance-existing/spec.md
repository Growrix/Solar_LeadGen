# Feature Specification: [FEATURE NAME]
# Feature Specification: Quote Builder Modal – Enhancement (Existing)

**Feature Branch**: `008-description-enhance-existing`  
**Created**: 2025-12-01  
**Status**: Draft  
**Input**: User description: "Enhance existing Quote Builder modal UI/UX and calculation logic per QUOTE-BUILDER-IMPROVEMENT-PLAN.md. Audit current state first. Do not rebuild from scratch. Follow AI-IMPLEMENTATION-GUIDELINES.md. Use improvement plan as SOT. Implement safely with phased testing and verification."

## User Scenarios & Testing (mandatory)

### User Story 1 - Accurate pricing and savings with real-time calculator (Priority: P1)

As an installer, I can configure the existing Quote Builder (system size, line items, STC/VIC incentives) and adjust assumptions (yield, self‑consumption, tariffs, OPEX) to instantly see Total price, $/W, Annual Production, Annual Savings, and Payback computed by the calculator—without leaving the modal.

**Why this priority**: This delivers core value—credible, transparent pricing and ROI—while leveraging the existing modal (no rebuild).

**Independent Test**: Enter a 6.6 kW system with line items and incentives; adjust self‑consumption from 0.3 to 0.7 and verify that Annual Savings and Payback update immediately and consistently across summary cards and preview.

**Acceptance Scenarios**:
1. Given a valid system and line items, when I toggle STC eligible and set STC price/count, then Total updates to reflect the deduction and Price/W changes accordingly.
2. Given assumptions with yield=4.2, selfUse=0.5, retail=0.30, FiT=0.08, OPEX=0, when I increase selfUse to 0.7, then Annual Savings increases and Payback decreases.
3. Given Annual Savings <= 0 (e.g., very low tariffs or very high OPEX), when I compute payback, then Payback shows "N/A" with guidance to adjust assumptions.

---

### User Story 2 - Multi‑option quoting & comparison (Priority: P2)

As an installer, I can create up to three options (Economy/Balanced/Premium) from presets or by duplicating the current configuration, and compare their size, Total, $/W, Annual Savings, and Payback side‑by‑side in Customer Preview.

**Why this priority**: Multi‑option proposals are standard in AU quoting and improve close rates.

**Independent Test**: Create options A/B/C from presets; verify comparison table renders with all metrics sourced from the same calculator logic.

**Acceptance Scenarios**:
1. Given one configured option, when I click "Add Option from Preset", then a new option appears with its own stored line items and assumptions snapshot.
2. Given three options exist, when I update assumptions (e.g., self‑consumption), then all options recompute and the comparison table reflects changes.

---

### User Story 4 - UX Improvements & Addon Integration (Priority: P2)

As an installer, I want addons (EV Charger, Bird Proofing, etc.) to automatically reflect in total price calculations and appear in the customer preview, with enhanced category options and real-time preview updates without manual refresh.

**Why this priority**: Improves accuracy of pricing (addons must be included in totals), streamlines workflow (no button clicks), and provides comprehensive categorization for line items.

**Independent Test**: Add an EV Charger addon for $1,500 → verify it appears as a line item in Pricing Engine with category "Addons" → verify total price increases by $1,500 → verify "EV Charger" appears in Customer Preview under Additional Items → change system configuration → verify preview updates automatically within 500ms.

**Acceptance Scenarios**:
1. Given I add an addon in Product Configuration, when I view Pricing Engine, then a line item with category "Addons" is automatically created with matching qty and price.
2. Given I modify addon quantity from 1 to 2, when I check the line item, then qty updates to 2 and total price recalculates correctly.
3. Given I remove an addon, when I view Pricing Engine, then the corresponding line item is automatically removed.
4. Given I have selected multiple addons, when I view Customer Preview, then all addons appear under "Additional Items" section.
5. Given I change any product configuration field, when I view Customer Preview, then the preview updates automatically without clicking any button within 500ms.
6. Given I create a line item in Pricing Engine, when I open the category dropdown, then I see 9 options: Panels, Inverter, Battery, Mounting Structure, EV Charger, Electrical, Labour, Addons, Other.

---

### User Story 5 - Graphs, Lead Details, and Preview Modal (Priority: P2)

As an installer, I want to see financial projection graphs in the Quote Builder, access Lead Technical Details with one click, and preview the bid exactly as homeowners will see it (with masked contact info) before submitting, so I can ensure accuracy and professionalism.

**Why this priority**: Visual graphs improve credibility and help installers communicate value. Lead details provide quick reference without leaving the modal. Preview modal reduces errors and builds confidence before submission.

**Independent Test**: Open Quote Builder for a lead → click "Lead Details" button → verify lead info (location, property, energy, budget, roof type) displays → close → scroll to graphs section → verify ROI and annual cost charts render → click "Preview" button → verify modal shows bid as homeowner sees it with masked contact and note "Contact details will be unlocked after winner is selected" → click "Edit Bid" → return to builder → make change → click Preview again → verify updated → click "Confirm & Submit Bid" → verify submission succeeds.

**Acceptance Scenarios**:
1. Given I am in Quote Builder with a valid configuration, when I view the modal, then I see a "Financial Projections" section with ROI graph (cumulative savings area chart with break-even marker) and Annual Cost comparison bar chart.
2. Given graphs are displayed, when I change financial assumptions (e.g., self-consumption from 0.5 to 0.7), then graphs update automatically within 500ms to reflect new calculations.
3. Given I am in Quote Builder, when I click the "Lead Details" button in the action bar, then a modal or collapsible section opens showing: Location & Property (location, postcode, property type, project type), Energy & Budget (energy bill, budget range, desired offset, lead price), System Requirements (roof type, battery required, battery capacity, timeframe), and Contact Information (masked until purchase).
4. Given Lead Details is open, when I click close or outside the section, then it closes and I can continue building the quote without data loss.
5. Given I am in Quote Builder with quote data filled, when I click the "Preview" button (Eye icon) in the action bar, then HomeownerPreviewModal opens showing: System details, pricing breakdown with line items, equipment specifications (panels, inverter, battery if applicable), financial projections graph (same as in builder), installer information with contact masked and note, and two buttons: "Edit Bid" and "Confirm & Submit Bid".
6. Given HomeownerPreviewModal is open, when I click "Edit Bid", then the modal closes and I return to the Quote Builder with all data preserved.
7. Given HomeownerPreviewModal is open with valid data, when I click "Confirm & Submit Bid", then the bid is submitted via API, success/error message displays, and on success the modal closes and draft is cleared.
8. Given I preview the bid multiple times, when I make changes between previews, then the preview always shows the current state of the quote draft.

---

### User Story 6 - System Selection & Pricing Engine UI Optimization (Priority: P2)

As an installer, I want a more compact and streamlined System Selection section with dropdowns instead of button grids, and I want the Pricing Engine's installer cost mode to fit properly within the section width, so I can build quotes faster without layout issues.

**Why this priority**: Reduces visual clutter, saves screen space, and fixes layout overflow that disrupts workflow when using installer cost mode.

**Independent Test**: Open Quote Builder → verify System Selection shows dropdowns for System Type and Project Type → verify System Size input is compact (no slider or range labels) → verify no Desired Price Range fields → scroll to Pricing Engine → toggle Installer Cost Mode ON → verify COGS column appears and all columns fit within section (no horizontal scroll or overflow) → toggle OFF → verify layout returns to normal.

**Acceptance Scenarios**:
1. Given I am in System Selection, when I view System Type, then I see a single dropdown (not button grid) with 7 options: Grid-Connected, Hybrid, Off-Grid, Battery Only, EV Charger, Add Panels, Replace Inverter.
2. Given I select any System Type from the dropdown, when I make a selection, then the value updates immediately and is reflected in the quote draft.
3. Given I am in System Selection, when I view Project Type, then I see a dropdown with 2 options: Residential, Commercial (default: Residential).
4. Given I select Project Type, when I make a selection, then the value persists and can be used for project-specific logic or reporting.
5. Given I am in System Selection, when I view System Size, then I see only a compact number input (max-w-xs) with inline "kW" label—no slider, no 0kW-20kW range labels.
6. Given I type a system size value, when I enter a number, then the input updates immediately and the rest of the form remains compact and clean.
7. Given I am in System Selection, when I view the section, then I do NOT see any "Desired Price Range" fields (Min/Max).
8. Given I am in Pricing Engine with Installer Cost Mode OFF, when I view the line items table, then I see columns: Category, Description, Qty, Unit Price, Tax, Total, Actions (7 columns).
9. Given I toggle Installer Cost Mode ON, when I view the table, then I see an additional COGS column (8 columns total: Category, Description, Qty, Unit Price, COGS, Tax, Total, Actions) and all columns fit within the section width with no horizontal overflow.
10. Given I toggle Installer Cost Mode OFF again, when I view the table, then the COGS column disappears and the layout returns to the original 7-column format.

---

### User Story 3 - Compliance validation before submit (Priority: P3)

As an installer, I must provide required artefacts (panel/inverter/battery datasheets, CEC accreditation, licence, insurance) and receive inline validation errors if any are missing before I can submit a Quote/Bid.

**Why this priority**: Compliance reduces audit risk and rework; aligns to improvement plan.

**Independent Test**: Attempt to submit without an inverter datasheet → form displays an inline error; adding the file clears the error and enables submission.

**Acceptance Scenarios**:
1. Given a missing required document, when I click Submit, then submission is blocked and the field shows an inline error with guidance.
2. Given all required artefacts are attached, when I click Submit, then validation passes and the modal submits successfully.

---

### Edge Cases

- System size is 0 or negative → disable calculation and show guidance.
- No line items → subtotal is 0; show message to add at least one line item.
- Annual Savings computed <= 0 → Payback shows N/A with guidance to adjust assumptions; graphs show flat/negative trend.
- Combined incentives lead to negative totals → clamp at minimum 0 with warning.
- Postcode not mapped → allow manual STC zone override with transparent label.
- Lead data fetch fails when opening Lead Details → display error message with retry option.
- Preview modal opened with incomplete data → show validation warnings inline (e.g., "Add at least one line item to generate accurate preview").
- Graphs fail to render due to invalid data → display fallback message "Unable to generate graph with current data".

---

### User Story 7 - Import & Prefill from Instant Quote (Priority: P0)

As an installer, I can import homeowner Instant Quote inputs with one click to pre-fill system size, project type, roof details, tariffs, battery requirements, and feature requests into the Bid Builder, so I can leverage homeowner-provided data and streamline quote preparation.

**Why this priority**: Eliminates duplicate data entry, improves accuracy, and reduces friction by auto-mapping homeowner inputs to installer fields—foundational for a seamless homeowner-to-installer workflow.

**Independent Test**: Open Bid Builder for a lead with quoteData → click "Import from Instant Quote" button → verify diff preview modal shows before/after comparison → click Accept → verify systemSize, projectType, roofType, pitchDeg, orientations, shadingLevel, retailPrice, feedInTariff, selfConsumption, battery, and addons are prefilled → modify a field → verify autosave triggers → verify graphs update within 500ms → run 6 verification commands → must return 0/0/0/0/0/0.

**Acceptance Scenarios**:
1. Given a lead with quoteData exists, when I open Bid Builder, then I see an "Import from Instant Quote" button in the header (styled with primary accent).
2. Given I click the Import button, when the mapper processes quoteData, then a diff preview modal opens showing side-by-side current values vs. new values from Instant Quote.
3. Given the diff preview modal is open, when I click "Accept & Import", then all mapped fields update in quoteDraft, autosave triggers, modal closes, and I see the imported values in the form.
4. Given the diff preview modal is open, when I click "Cancel", then the modal closes with no changes applied to quoteDraft.
5. Given quoteData contains customRetailRate and customFeedInRate in c/kWh, when I import, then assumptions.retailPrice and feedInTariff are set to $/kWh (divided by 100).
6. Given quoteData contains roofTilt='optimal' and shadingLevel='minimal', when I import, then roof.pitchDeg=25 and roof.shadingLevel=1 (normalized per tilt/shading mapping).
7. Given quoteData contains panelOrientation='north', when I import, then roof.orientations=['north'].
8. Given quoteData contains batteryIncluded=true with capacity and brand, when I import, then products.battery is created with matching capacity and brand.
9. Given quoteData contains includeVPP=true, includeEVCharging=true, when I import, then products.addons includes "VPP Enrollment" and "EV Charger Ready" with $0 prices.
10. Given quoteData contains usagePattern='evening', when I import, then assumptions.selfConsumption=0.45 (heuristic mapping).
11. Given I import data and then modify a prefilled field, when I check RoofSiteDetails, then I see new installer-only fields: arrayLayoutNotes, roofAccessNotes, structuralNotes, mountingSystemPreferred, conduitRunComplexity, inverterLocationNotes (all editable).
12. Given I import data successfully, when I run 6 verification commands on modified files, then all return 0 matches (no hardcoded colors, no dark mode classes, no raw typography).

---

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: The existing modal MUST compute Subtotal, GST (line‑item GST flag), Incentives (STC + VIC), Total, and Price per Watt using a single calculator.
- **FR-001A**: Calculator formulas and output definitions MUST match `ChatGPT_CalculationLogic.md` exactly (no deviations).
- **FR-002**: The modal MUST compute Annual Production, Annual Savings, and Payback using user‑adjustable assumptions (yield, self‑consumption, retail price, FiT, OPEX).
- **FR-002A**: Default assumption values MUST match `QUOTE-BUILDER-IMPROVEMENT-PLAN.md` and be overrideable per lead.
- **FR-003**: When Annual Savings <= 0, the system MUST display Payback as "N/A" and a hint to adjust assumptions.
- **FR-004**: Users MUST be able to create up to three options (A/B/C) and compare their metrics side‑by‑side in Customer Preview.
- **FR-005**: STC section MUST support postcode→zone mapping with manual override and deeming factor application; value = stcCount × stcPrice.
- **FR-006**: Compliance section MUST block submission until required artefacts are attached and MUST show inline errors per missing artefact.
- **FR-007**: Autosave MUST persist drafts per lead and option set; restoring a draft MUST not lose any entered data.
- **FR-008**: All UI changes MUST follow the design‑system SOT (no hardcoded colors/typography, zero violations by verification commands).
- **FR-009**: All calculator updates MUST reflect in summary cards and comparison table within perceptibly instant time (< 500 ms perceived by user).
- **FR-010**: The feature MUST not remove or rebuild the modal—enhance only; existing API contracts remain unchanged.
- **FR-010A**: Implementation MUST pass a pre‑migration audit gate: compare current modal logic to SOT files and document gaps before any changes.
- **FR-010B**: Any logic change or clarification MUST be documented and approved per `AI-IMPLEMENTATION-GUIDELINES.md`.

Unclear or decision items (limit 3):
- **FR-011**: [NEEDS CLARIFICATION: Should FiT escalate annually with retail price or remain flat?]
- **FR-012**: [NEEDS CLARIFICATION: Should VIC interest‑free loan be displayed as financing info only (not deducted from Total)?]
- **FR-013**: [NEEDS CLARIFICATION: Default assumptions (yield, selfUse, retail, FiT, OPEX) — adopt plan defaults or expose per‑lead presets?]

### Key Entities

- **QuoteOption**: name (Economy/Balanced/Premium), systemSize, lineItems[], incentives, totals, calculator outputs, stored assumptions snapshot.
- **Assumptions**: yield, selfConsumption, retailPrice, feedInTariff, annualOpex, degradation, escalation, years.
- **Incentives**: STC {eligible, zone, stcCount, stcPrice}, VIC {rebateEligible, rebateAmount, interestFreeLoan, batteryLoan}.
- **ComplianceAttachment**: type (datasheet, accreditation, licence, insurance), label, required?, fileRef.

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: Users see updated Total, $/W, Annual Savings, and Payback within 0.5 seconds of changing inputs (perceived responsiveness).
- **SC-002**: 100% of submissions are blocked if any required compliance artefact is missing, with clear inline errors.
- **SC-003**: 0 design‑system violations (0/0/0/0/0/0 across color/typography/responsive checks) on all changed files.
- **SC-004**: Multi‑option comparison shows consistent calculator outputs across all options with no mismatches in displayed metrics.
- **SC-005**: Draft restore reproduces the last saved options and assumptions without data loss in 100% of tested sessions.
 
## References & Source of Truth

- All enhancements, calculation logic, and assumptions MUST strictly follow:
	- `DOC/Features/Quote Builder Modal/QUOTE-BUILDER-IMPROVEMENT-PLAN.md`
	- `DOC/Features/Quote Builder Modal/Main Plan/ChatGPT_CalculationLogic.md`
	- `DOC/Features/Quote Builder Modal/Main Plan/ChatGPT_research.md`
	- `DOC/Guidelines/AI-IMPLEMENTATION-GUIDELINES.md`

## Assumptions & Governance

- Formulas, calculation steps, and business rules are sourced from the above SOT files.
- No new logic or deviation is allowed unless explicitly approved and documented per `AI-IMPLEMENTATION-GUIDELINES.md`.
- Pre‑migration audit MUST compare current modal logic to SOT and list gaps before changes.
- Any clarifications to FR‑011..FR‑013 MUST be resolved against SOT and recorded in the spec change log.

### Key Entities *(include if feature involves data)*
