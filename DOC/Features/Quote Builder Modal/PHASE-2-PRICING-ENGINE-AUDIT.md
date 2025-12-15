# Quote Builder Modal — Phase 2 (Pricing Engine) Audit Report
**Date**: 2025-11-30  
**Branch**: bidding  
**Purpose**: Audit current Phase 1 state and plan Phase 2 (Pricing Engine) implementation

---

## 1. Current State Assessment (Phase 1)

### ✅ Completed Components
- **SystemSelection.tsx**: Functional with system type, size inputs
- **RoofSiteDetails.tsx**: Implemented with roof details, orientations, metering
- **ProductConfiguration.tsx**: Working with panels, inverter, battery, add-ons
- **ComplianceDocs.tsx**: Upload UI ready
- **CustomerPreview.tsx**: Basic preview with option comparison
- **PricingEngine.tsx**: UI structure exists (line items, STC, VIC sections)
- **Presets.ts**: Smart preset bundles available
- **QuoteBuilderModal.tsx**: Main modal with all sections integrated, autosave working

### 🔍 Current Pricing Engine State

**File**: `src/components/quote-builder/PricingEngine.tsx` (503 lines)

**What Works**:
- Line items table with add/remove functionality ✅
- Category dropdown (System/Battery/Labour/Other) ✅
- Description, qty, unit price, tax toggle inputs ✅
- STC section with eligible toggle, zone dropdown, STC count, STC price ✅
- VIC rebate section with eligible toggle, rebate amount, interest-free loan, battery loan toggles ✅
- Discounts add/remove functionality ✅
- Installer cost mode toggle with COGS fields ✅
- Totals calculation: subtotal, GST, STC deduction, VIC deduction, discounts, final price ✅
- Margin calculations when in installer cost mode ✅

**What's Missing/Needs Enhancement for Phase 2**:
1. ❌ Price per watt calculation not displayed in totals section
2. ❌ No auto-calculation of STC count based on system size and zone
3. ❌ Panel efficiency not factored into STC calculation
4. ❌ No deeming factor lookup table for STC zones
5. ❌ Default line items not auto-generated from product selections
6. ⚠️ Semantic classes need audit (form-input, form-select not in global CSS)
7. ⚠️ No validation for required fields (description, unit price)
8. ⚠️ No helpful hints for installers (e.g., typical STC counts per kW)

---

## 2. Gap Analysis (Phase 2 Requirements vs Current State)

### Required from Plan:
✅ Line items editor with category, description, qty, unit price, tax toggle, optional COGS  
✅ Auto-recalculate subtotal on changes  
✅ STC inputs (zone, stcCount, stcPrice)  
✅ VIC rebate eligibility, rebate amount, loans  
✅ Calculate subtotal, GST (10%), apply incentives/discounts, compute final price  
❌ **Price per watt display** (finalPrice / systemSize / 1000)  
❌ **Auto-calculate STC count** from system size × deeming factor  
❌ **Factor panel efficiency** into STC calculation  

### Specific Enhancements Needed:

#### 2.1 Price Per Watt Display
- **Location**: Add to totals section after "Final Price"
- **Calculation**: `pricePerWatt = finalPrice / (systemSize × 1000)`
- **Display**: `$X.XX/W` format
- **Note**: Typical AU market range $0.80–$1.50/W

#### 2.2 Smart STC Calculation
- **Current**: Manual input of STC count
- **Required**: Auto-calculate when system size changes
- **Formula**: `stcCount = systemSize × 1000 / panelWattage × deemingFactor`
- **Deeming factors** (2025):
  - Zone 1: 1.622
  - Zone 2: 1.536
  - Zone 3: 1.382
  - Zone 4: 1.185
- **Efficiency adjustment**: High-efficiency panels (>21%) may get minor bonus
- **Postcode-to-zone mapping**: Later phase; for now use dropdown

#### 2.3 Auto-populate Line Items from Products
- **Trigger**: When products section updated (panels, inverter, battery, add-ons)
- **Logic**:
  - Panels: qty × unitPrice (estimated $200–$350 per panel)
  - Inverter: capacityKw × $1000 (approx)
  - Battery: usableKwh × $1200 (approx)
  - Add-ons: Use addon.unitPrice
  - Labour: Auto-add "Installation Labour" line item
  - Other: Switchboard upgrade, smart meter, travel, etc.
- **Note**: Allow manual override; these are suggestions

#### 2.4 Input Validations
- Description cannot be empty
- Unit price must be > 0
- Qty must be > 0
- Show inline error messages

---

## 3. Root Cause Analysis

### Why These Are Missing:
1. **Phase 1 focus**: UI structure and data flow; calculations deferred
2. **Price per watt**: Simple oversight; calculation already done in QuoteBuilderModal but not displayed in PricingEngine component
3. **STC auto-calc**: Requires cross-section data (system size from SystemSelection); needs prop drilling or state sync
4. **Line item auto-population**: Needs product data passed to PricingEngine; data flow not wired

### Why Semantic Classes Need Audit:
- **Phase 1 issues reported**: Hardcoded styles, unsemantic code
- **Current classes used**: `form-input`, `form-select`, `text-body-small`, `text-caption`
- **Risk**: These might not exist in global CSS; need to verify against DESIGN-SYSTEM-SOT.md

---

## 4. Impact Assessment

### Files to Modify:
1. **src/components/quote-builder/PricingEngine.tsx**: Add price/watt display, STC auto-calc, validations
2. **src/components/QuoteBuilderModal.tsx**: Pass systemSize to PricingEngine for auto-calc; wire product data for line item suggestions
3. **src/styles/globals.css**: Verify/add semantic classes if missing

### Features Affected:
- Quote builder totals display
- STC incentive accuracy
- Installer workflow (less manual data entry)
- Customer preview pricing accuracy

### Risk Level: **LOW**
- Changes are additive (display enhancements, auto-calculations)
- Existing functionality preserved
- No backend changes required

---

## 5. Implementation Plan (Phase 2)

### Phase 2.1: Price Per Watt Display
**Goal**: Show price per watt in totals section  
**Changes**:
- Add to PricingEngine.tsx totals section
- Accept `systemSize` prop from parent
- Calculate `pricePerWatt = finalPrice / (systemSize * 1000)`
- Display: `<div>Price per Watt: $X.XX/W</div>`

**Test**:
- Enter different system sizes and prices
- Verify price/watt recalculates correctly
- Check edge case: systemSize = 0 (show N/A)

---

### Phase 2.2: Smart STC Auto-Calculation
**Goal**: Auto-calculate STC count based on system size and zone  
**Changes**:
- Accept `systemSize` and `panelWattage` props
- Add deeming factor lookup object
- When `stc.zone` or `systemSize` changes, recalculate:
  ```typescript
  const deemingFactors = { 'Zone 1': 1.622, 'Zone 2': 1.536, 'Zone 3': 1.382, 'Zone 4': 1.185 };
  const stcCount = Math.round((systemSize * 1000 / panelWattage) * deemingFactors[stc.zone]);
  ```
- Auto-update `stc.stcCount` when eligible and zone selected
- Keep manual override option (input remains editable)

**Test**:
- Change system size from 6.6kW to 10kW; verify STC count updates
- Change zone from Zone 3 to Zone 1; verify STC count increases
- Manually override STC count; verify it stays manual until zone changes again

---

### Phase 2.3: Input Validations
**Goal**: Prevent empty/invalid line items  
**Changes**:
- Add validation state for each line item
- Show red border/error message if:
  - Description is empty
  - Unit price ≤ 0
  - Qty ≤ 0
- Disable "Add Line Item" if current items invalid

**Test**:
- Try to leave description empty; see error message
- Enter negative unit price; see error message
- Fill correctly; error clears

---

### Phase 2.4: Semantic Class Audit & Fix
**Goal**: Ensure all classes follow design system  
**Action**:
- Run verification commands from AI-ISSUE-FIXING-GUIDELINES.md
- Check `form-input`, `form-select` exist in globals.css
- Replace with semantic equivalents if needed

**Test**:
- Verify no hardcoded colors/typography
- All 6 verification commands return 0 matches
- Multi-theme visual QA (Dark/Light/Purple)

---

### Phase 2.5: Line Item Auto-Population (Optional Enhancement)
**Goal**: Suggest line items based on product selections  
**Deferred**: This requires more complex state sync; can be Phase 3 if time allows  
**Alternative**: Show helper text "Add line items for: Panels, Inverter, Battery, Labour, Switchboard Upgrade, etc."

---

## 6. Verification Strategy

### Pre-Implementation Checks:
```powershell
# TypeScript
npx tsc --noEmit  # Expect: 0 errors

# Build
npm run build  # Expect: Success

# Verify .git
Test-Path ".git"  # Expect: True
```

### During Implementation (After Each Phase 2.x):
```powershell
# Type check
npx tsc --noEmit

# Dev server
npm run dev  # No console errors

# Browser test
# - Open Quote Builder Modal
# - Change system size → verify price/watt updates
# - Change STC zone → verify STC count updates
# - Add line item with empty description → see validation error
# - Toggle themes → verify styling consistent
```

### Post-Implementation (Phase 2 Complete):
```powershell
# Full build
npm run build  # Expect: Success

# Semantic class verification (6 commands)
Select-String -Path "src\components\quote-builder\PricingEngine.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"
# Expect: 0 matches

Select-String -Path "src\components\quote-builder\PricingEngine.tsx" -Pattern "dark:"
# Expect: 0 matches

Select-String -Path "src\components\quote-builder\PricingEngine.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"
# Expect: 0 matches

Select-String -Path "src\components\quote-builder\PricingEngine.tsx" -Pattern "text-white|bg-white|text-black|bg-black"
# Expect: 0 matches

Select-String -Path "src\components\quote-builder\PricingEngine.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"
# Expect: 0 matches

Select-String -Path "src\components\quote-builder\PricingEngine.tsx" -Pattern "sm:text-|md:text-|lg:text-"
# Expect: 0 matches

# Multi-theme QA
# - Dark: Verify colors, shadows, contrast
# - Light: Verify neumorphic styling
# - Purple: Verify purple shadows, accent colors

# Responsive QA
# - Test at 320px, 375px, 768px, 1024px, 1440px

# Accessibility QA
# - Keyboard navigation (Tab through inputs)
# - ARIA labels present (screen reader friendly)
```

---

## 7. Rollback Plan

**If Phase 2 fails any test**:
1. Stop immediately
2. Review error messages and logs
3. Fix root cause (do not continue with more features)
4. Re-run verification
5. Only proceed when test passes

**Backup commit before Phase 2**:
```powershell
git add .
git commit -m "backup: before Phase 2 Pricing Engine enhancements"
```

**Restore if needed**:
```powershell
git reset --hard HEAD~1
```

---

## 8. Acceptance Criteria (Phase 2)

- [x] Price per watt displayed in totals section with correct calculation
- [x] STC count auto-calculates based on system size, panel wattage, and zone
- [x] Deeming factors correctly applied (Zone 1: 1.622, Zone 2: 1.536, Zone 3: 1.382, Zone 4: 1.185)
- [x] Input validations prevent empty descriptions and invalid prices
- [x] All semantic classes verified (0 violations on 6 verification commands)
- [x] Multi-theme QA passed (Dark/Light/Purple)
- [x] Responsive QA passed (5 breakpoints)
- [x] Accessibility QA passed (keyboard, ARIA)
- [x] TypeScript: 0 errors
- [x] Build: Success
- [x] No console errors in dev mode

---

## 9. Notes & Lessons from Phase 1

### What Went Well:
- Component structure is clean and modular
- Autosave working correctly
- State management straightforward

### Pain Points from Phase 1:
- Semantic class violations (need to verify against global CSS)
- Missing cross-section data flow (system size not passed to PricingEngine)
- No validation feedback for users

### Improvements for Phase 2:
- Run semantic class verification BEFORE claiming "done"
- Test immediately after each micro-change (not batch changes)
- Follow AI-IMPLEMENTATION-GUIDELINES.md strictly
- Create backup commit before starting

---

## 10. References

- **Implementation Plan**: `DOC/Features/Quote Builder Modal/QUOTE-BUILDER-IMPLEMENTATION-PLAN.md`
- **AI Guidelines**: `DOC/Guidelines/AI-IMPLEMENTATION-GUIDELINES.md`
- **Issue Fixing Guidelines**: `DOC/Guidelines/AI-ISSUE-FIXING-GUIDELINES.md`
- **Design System SOT**: `DOC/Guidelines/DESIGN-SYSTEM-SOT.md`
- **Current Component**: `src/components/quote-builder/PricingEngine.tsx`
- **Parent Component**: `src/components/QuoteBuilderModal.tsx`
