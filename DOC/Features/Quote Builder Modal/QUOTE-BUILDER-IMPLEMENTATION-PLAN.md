# Quote Builder Modal — Comprehensive Implementation Plan (AU Market)
Date: 2025-11-30  
Branch: bidding  
Status: Approved Plan (UI-first, backend aligned)

---

## 0. Objectives
- Build a professional, compliant, and installer-friendly Quote Builder aligned to Australian market standards.
- Support three usage modes: Quote (Written), Bid (Bidding), and Config-only (internal draft).
- Enforce design system, no hardcoded styles; implement autosave, versioning, and clear customer preview.

---

## 1. Scope & Phasing
- Phase 1 (UI Core): Implement all UI sections, autosave, presets, customer preview.
- Phase 2 (Pricing Engine): STC calculation, VIC rebates, tax and incentives integration.
- Phase 3 (Compliance & Export): Mandatory attachments, PDF/email/export, branding.
- Phase 4 (Backend Wiring): Persist quotes/bids, API endpoints, Prisma models; align with bidding flow.

Stop-on-fail testing after each phase per AI-IMPLEMENTATION-GUIDELINES.

---

## 2. Sections & Components
Break into six sections/components (collapsible, semantic):
- SystemSelection: system type, system size, price range
- RoofSiteDetails: roof, metering/switchboard, site notes, photos
- ProductConfiguration: panels, inverter, battery, add-ons
- PricingEngine: line items, incentives, totals
- ComplianceDocs: mandatory certificates & uploads
- CustomerPreview: options A/B/C + comparison view

Files to add/update under `src/components/`:
- `QuoteBuilderModal.tsx` (extend existing)
- `quote-builder/SystemSelection.tsx`
- `quote-builder/RoofSiteDetails.tsx`
- `quote-builder/ProductConfiguration.tsx`
- `quote-builder/PricingEngine.tsx`
- `quote-builder/ComplianceDocs.tsx`
- `quote-builder/CustomerPreview.tsx`
- `quote-builder/Presets.ts` (smart presets data)

---

## 3. Data Model (UI State)
State object (UI-only, later mapped to backend):
```
QuoteDraft {
  mode: 'quote' | 'bid' | 'config',
  system: { type, sizeKw, desiredPriceRange? },
  roof: { roofType, pitchDeg, arrays, orientations[], shadingLevel, phaseType, switchboardUpgrade, smartMeterRequired, distanceToSwitchboardM, notes, photos[] },
  products: {
    panels: { brand, model, wattage, efficiency, qty, productWarranty, performanceWarranty, datasheetKey?, tier1 },
    inverter: { brand, model, type, capacityKw, mppts, warranty, datasheetKey? },
    battery?: { brand, model, usableKwh, powerKw, expandable, warranty, chemistry, backupSupported, backupCircuitRequired, datasheetKey? },
    addons: Array<{ key, label, qty, unitPrice }>
  },
  pricing: {
    lineItems: Array<{ category, description, qty, unitPrice, taxGst, costCOGS? }>,
    stc: { eligible, zone, stcCount, stcPrice },
    vic: { rebateEligible, rebateAmount, interestFreeLoan, batteryLoan },
    discounts: Array<{ label, amount }>,
    totals: { subtotal, gstAmount, incentivesTotal, finalPrice, pricePerWatt }
  },
  compliance: { docs: Array<{ type, s3Key }>, cecAccreditation?, electricalLicence?, insurance? },
  preview: { options: Array<QuoteDraftOption> },
  meta: { version: number, lastSavedAt, autosaveStatus: 'idle'|'saving'|'saved', installerCostMode: boolean }
}
```
LocalStorage key: `quote:draft:${leadId}:${installerId}`.

---

## 4. UI Details per Section
- SystemSelection:
  - Type: grid-connected, hybrid, off-grid, battery-only, EV charger add-on, add panels, replace inverter
  - Size: numeric input + slider; auto-calc by panel wattage × qty
  - Desired price range: optional

- RoofSiteDetails:
  - Roof type; pitch; arrays count; orientations (chips: N/NE/E/SE/S/SW/W)
  - Shading: 0%, light (5–10%), medium (10–20%), heavy (20%+)
  - Metering/switchboard: upgrade?, phase type, smart meter?, distance
  - Notes, photos (upload UI stub)

- ProductConfiguration:
  - Panels: dropdown + Custom…, model, wattage, efficiency, qty, warranties, Tier 1 toggle, datasheet upload
  - Inverter: brand/model, type (string/hybrid/micro/optimizers), capacity, MPPTs, warranty, datasheet
  - Battery: brand/model, usable kWh, power kW, expandable, warranty, chemistry, backup supported, backup circuit required, datasheet
  - Add-ons: EV charger, extra array, extra battery, monitoring, smart meter, racking, bird-proofing, tilt frames, switchboard upgrade, extra labour, travel cost

- PricingEngine:
  - Line items table with category, description, qty, unit price, tax toggle, optional COGS
  - Incentives: STC (auto calc), VIC rebate & loans, FiT notes
  - Totals: subtotal, GST, incentives, discounts, final price, price per watt

- ComplianceDocs:
  - Upload: panel/inverter/battery datasheets; warranties; CEC accreditation; electrical licence; insurance; brochures

- CustomerPreview:
  - System overview, simple layout graphic, financial summary
  - Comparison view: up to 3 options (Economy/Balanced/Premium)

---

## 5. Pricing & Incentives Logic (UI)
- Subtotal = sum(lineItems.qty × unitPrice)
- GST = sum(items with tax) × GST% (default 10%)
- STC calculation (UI approximation):
  - Inputs: postcode, system size, zone rating, panel efficiency
  - STC count ≈ size × deeming factor; STC price configurable (default $40)
- VIC rebates:
  - RebateEligible → $1400; loan toggles ($1400; battery loan $8800)
- FinalPrice = Subtotal + GST − Incentives − Discounts
- PricePerWatt = FinalPrice / (systemSize kW × 1000)

---

## 6. Autosave & Versioning
- Autosave debounce 750ms; persist to LocalStorage.
- Versioning: maintain `meta.version` and create simple snapshots in LocalStorage (V1/V2/V3).
- Restore logic on modal open; show banner "Draft restored".

---

## 7. Smart Presets
- Provide preset bundles (Economy/Balanced/Premium) with line items and product combos.
- Quick apply & edit; installer can duplicate and modify.
---

## 8. Installer Cost Mode (Hidden)
- Toggle to reveal COGS fields and margin calculations (not shown to customers).
- Summary: COGS total, margin $, margin %.

---

## 9. Customer Preview & Export
- Generate customer-friendly view with editable branding: logo, company name, ABN, accreditation, signature.
- Export stubs: PDF/email/share link (wire later in Phase 3).

---

## 10. Integration Points (Backend Alignment)
- Map QuoteDraft to `Quote` (written) or `Bid` (bidding) payloads.
- When `mode='bid'`:
  - Rename primary CTA to "Submit Bid"
  - Hide Preview PDF
  - Use bidding totals for `amount`, capacityOffer, equipment details, incentives fields.
- API endpoints to use in Phase 4:
  - `POST /api/quotes` (written)
  - `POST /api/bids` (bidding) — see bidding audit for payload
  - File uploads via existing S3 flow (datasheets and compliance docs)

---

## 11. Testing Protocol (Per Phase)
- TypeScript: `npx tsc --noEmit` → 0 errors
- Build: `npm run build` → success
- Dev server: `npm run dev` → no errors
- Browser tests:
  - Section toggles, form validations
  - Autosave restore (LocalStorage key)
  - Totals recompute correctly (GST/incentives)
  - Presets apply correctly
  - Customer preview comparison shows three options
- Theming & responsive checks: Dark/Light/Purple and 320/375/768/1024/1440
- Accessibility: keyboard navigation, ARIA labels

---

## 12. Phased Task List
- Phase 1 — UI Core
  - [ ] Implement sections/components with semantic classes only
  - [ ] Wire autosave + restore
  - [ ] Add smart presets
  - [ ] Customer preview comparison (A/B/C)

- Phase 2 — Pricing Engine
  - [ ] Line items editor with tax toggle
  - [ ] STC + VIC incentives calculation (UI approximation)
  - [ ] Final totals + price per watt

- Phase 3 — Compliance & Export
  - [ ] Mandatory docs upload UI
  - [ ] Branding & export stubs

- Phase 4 — Backend Wiring
  - [ ] Map QuoteDraft to Quote/Bid payloads
  - [ ] Integrate `/api/bids` and `/api/quotes`
  - [ ] Persist and fetch drafts (later)

Stop immediately on any failing test; fix, re-test, then proceed.

---

## 13. Acceptance Criteria
- All sections implemented with functional UI.
- Autosave and restore work; versioning snapshots available.
- Pricing engine computes totals with GST and incentives.
- Customer preview shows options and accurate financial summary.
- Mode-specific behavior: "Submit Bid" in bid mode, Preview PDF hidden.
- Theming + responsive + accessibility checks pass.
- Clean TypeScript, build success, no browser console errors.

---

## 14. Notes & References
- Source: `DOC/Features/Quote Builder Modal/ChatGPT_research.md`
- Guidelines: `DOC/Guidelines/AI-IMPLEMENTATION-GUIDELINES.md`
- Bidding alignment: See `DOC/Installers/Bidding leads/BIDDING-FLOW-COMPREHENSIVE-AUDIT-2025-11-30.md`
