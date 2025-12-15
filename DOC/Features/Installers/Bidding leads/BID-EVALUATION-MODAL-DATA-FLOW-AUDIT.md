# Bid Evaluation Modal - Data Flow Audit Report
**Date**: November 29, 2025  
**Status**: Complete Data Flow Analysis  
**Issue**: Missing user inputs (custom battery size, graph data, incomplete field display)

---

## 1. EXECUTIVE SUMMARY

**User Requirement**:
> "All the InstantQuote user inputs should show under a heading 'InstantQuote Details'. The result card should show accordingly with graph and all the data under a heading 'InstantQuote Result'"

**Current Problem**:
- ❌ Custom battery size (`customBatteryCapacity`) not displayed
- ❌ Graph/chart visualization missing
- ❌ Many user input fields not shown (retailer, tariff, panel brand, roof tilt, shading, orientation, usage pattern, etc.)
- ❌ Mixed display approach - some fields in "Component Specifications", some in "Financial Summary", incomplete coverage

**Root Cause**:
1. BidEvaluationModal was incrementally patched, not designed from scratch for complete data display
2. Interface `InstantQuoteResults` has ~25 optional fields but UI only renders ~8-10 fields
3. No systematic mapping between InstantQuoteForm's 40+ input fields and modal display
4. Graph component exists (`SavingsChart`) but not integrated into modal

---

## 2. COMPLETE DATA STRUCTURE AUDIT

### 2.1 InstantQuoteForm - ALL User Inputs (Line 36-96)

**40+ Input Fields Collected**:

```typescript
formData = {
  // STEP 1: Location & Property
  postcode: string,
  location: string,
  state: string,
  
  // STEP 2: System Preferences
  roofType: string,                    // ✅ Currently shown in parent Lead details
  budgetRange: string,                 // ✅ Currently shown in parent Lead details
  
  // Battery Configuration
  batteryIncluded: boolean,            // ✅ Shown as "Battery Required"
  batteryCapacity: string,             // ✅ Shown in Component Specifications
  batteryBrand: string,                // ✅ Shown in Component Specifications
  customBatteryCapacity: string,       // ❌ MISSING - NOT DISPLAYED
  backupCritical: string,              // ❌ MISSING - NOT DISPLAYED
  batteryUsage: string,                // ❌ MISSING - NOT DISPLAYED
  
  // Solar System Configuration
  panelBrand: string,                  // ✅ Shown in Component Specifications
  panelOrientation: string,            // ✅ Shown in Component Specifications
  roofTilt: string,                    // ✅ Shown in Component Specifications
  shadingLevel: string,                // ✅ Shown in Component Specifications
  includeOptimizers: boolean,          // ✅ Shown as tag
  includeMicroinverters: boolean,      // ✅ Shown as tag
  
  // Energy Usage
  usagePattern: string,                // ✅ Shown in Component Specifications
  desiredOffset: number,               // ❌ MISSING - NOT DISPLAYED
  hasExistingSystem: boolean,          // ❌ MISSING - NOT DISPLAYED
  existingSystemSize: string,          // ❌ MISSING - NOT DISPLAYED
  
  // Retailer & Tariff
  retailer: string,                    // ✅ Shown in Component Specifications
  tariffPlan: string,                  // ❌ MISSING - NOT DISPLAYED
  customRetailRate: string,            // ❌ MISSING - NOT DISPLAYED
  customFeedInRate: string,            // ❌ MISSING - NOT DISPLAYED
  
  // Additional Features
  includeVPP: boolean,                 // ✅ Shown as tag
  includeEVCharging: boolean,          // ✅ Shown as tag
  includeSmartHome: boolean,           // ❌ MISSING - NOT AS TAG
  includeGridServices: boolean,        // ❌ MISSING - NOT AS TAG
  
  // Commercial-Specific
  peakDemand: string,                  // ❌ MISSING - NOT DISPLAYED
  isThreePhase: boolean,               // ❌ MISSING - NOT DISPLAYED
  projectPriority: string,             // ❌ MISSING - NOT DISPLAYED
  
  // System Override
  systemSizeOverride: string,          // ❌ MISSING - NOT DISPLAYED
  additionalArrays: array,             // ❌ MISSING - NOT DISPLAYED
}

// SEPARATE STATE VARIABLES (Line 99-100)
electricityUsageType: 'monthly' | 'quarterly',  // ❌ MISSING - NOT DISPLAYED
electricityValue: string,                       // ❌ MISSING - NOT DISPLAYED (electricity bill amount)
```

### 2.2 InstantQuoteForm - Calculation Results (Line 650-710)

**Residential Results**:
```typescript
resultData = {
  quoteType: 'residential',
  systemSize: number,              // ✅ Shown
  annualProduction: number,        // ✅ Shown (in compact format)
  annualSavings: number,           // ✅ Shown
  currentAnnualBill: number,       // ❌ MISSING - NOT DISPLAYED
  totalCost: number,               // ✅ Shown
  federalRebate: number,           // ✅ Shown
  batteryRebate: number,           // ✅ Shown
  stateRebate: number,             // ✅ Shown
  finalPrice: number,              // ✅ Shown
  simplePaybackYears: number,      // ✅ Shown
  selfConsumedKwh: number,         // ✅ Shown
  exportedKwh: number,             // ❌ MISSING - NOT DISPLAYED
  co2Reduction: number,            // ✅ Shown
  roofArea: number,                // ❌ MISSING - NOT DISPLAYED
  panelsRequired: number,          // ✅ Shown
  disclaimers: string[]            // ❌ MISSING - NOT DISPLAYED
}
```

**Commercial Results**:
```typescript
resultData = {
  quoteType: 'commercial',
  systemSize, annualProduction, annualSavings,
  demandChargeSavings: number,     // ❌ MISSING - NOT DISPLAYED
  energySavings: number,           // ❌ MISSING - NOT DISPLAYED
  currentAnnualBill, totalCost, federalRebate, batteryRebate, stateRebate,
  finalPrice, simplePaybackYears,
  disclaimers: string[]
}
```

### 2.3 What's Saved to Database (Line 716-723)

```typescript
onQuoteCalculated({ 
  ...formData,              // ALL 40+ user input fields
  ...resultData,            // ALL calculation result fields
  propertyType: quoteType,  // 'residential' or 'commercial'
  electricityValue,         // Electricity bill amount
  electricityUsageType      // 'monthly' or 'quarterly'
});
```

**Confirmation**: ALL data IS saved to database in `Lead.quoteData` JSON field.

---

## 3. CURRENT MODAL DISPLAY - FIELD COVERAGE

### 3.1 What's Currently Displayed

**Component Specifications Section** (Lines 355-422):
- ✅ Panel Brand (`panelBrand`)
- ✅ Inverter Size (calculated from `systemSize`)
- ✅ Battery Brand + Capacity (`batteryBrand`, `batteryCapacity`)
- ❌ Custom Battery Capacity (`customBatteryCapacity`) - **MISSING**
- ✅ Panel Orientation (`panelOrientation`)
- ✅ Roof Tilt (`roofTilt`)
- ✅ Shading Level (`shadingLevel`)
- ✅ Usage Pattern (`usagePattern`)
- ✅ Retailer (`retailer`)
- ❌ Tariff Plan (`tariffPlan`) - **MISSING**
- ✅ Tags: Optimizers, Microinverters, VPP, EV Charging
- ❌ Tags: Smart Home, Grid Services - **MISSING**

**Financial Summary Section** (Lines 425-498):
- ✅ System Size, Panels, Annual Output
- ✅ Total Cost, Federal Rebate, Battery Rebate, State Rebate, Final Price
- ✅ Annual Savings, Payback, CO₂ Reduction, Self-Use
- ❌ Current Annual Bill - **MISSING**
- ❌ Exported kWh - **MISSING**
- ❌ Roof Area - **MISSING**
- ❌ Disclaimers - **MISSING**

### 3.2 What's MISSING

**Critical User Inputs NOT Displayed**:
1. ❌ `customBatteryCapacity` - User's custom battery size
2. ❌ `electricityValue` + `electricityUsageType` - Electricity bill amount
3. ❌ `tariffPlan` - Retailer tariff plan
4. ❌ `customRetailRate` + `customFeedInRate` - Custom rates
5. ❌ `desiredOffset` - Target solar offset percentage
6. ❌ `hasExistingSystem` + `existingSystemSize` - Existing solar system
7. ❌ `backupCritical` - Battery backup criticality
8. ❌ `batteryUsage` - Battery usage strategy
9. ❌ `includeSmartHome` + `includeGridServices` - Additional features
10. ❌ `peakDemand` (commercial) - Peak demand value
11. ❌ `isThreePhase` (commercial) - Three-phase connection
12. ❌ `projectPriority` (commercial) - Project priority

**Critical Results NOT Displayed**:
1. ❌ `currentAnnualBill` - Current electricity bill
2. ❌ `exportedKwh` - Exported energy
3. ❌ `demandChargeSavings` (commercial) - Demand charge savings
4. ❌ `energySavings` (commercial) - Energy cost savings
5. ❌ `disclaimers` - Important disclaimers array
6. ❌ **GRAPH** - SavingsChart component not integrated

---

## 4. ROOT CAUSE ANALYSIS

**Why Data is Missing**:

1. **Incremental Patching**: Modal was patched to add "Component Specifications" section without full audit of all available fields
2. **No Systematic Mapping**: No comprehensive mapping between InstantQuoteForm inputs → Database → Modal display
3. **Interface vs UI Mismatch**: `InstantQuoteResults` interface has fields defined but UI doesn't render them
4. **Custom Battery Size Logic**: Form uses EITHER `batteryCapacity` (dropdown) OR `customBatteryCapacity` (text input), modal only checks `batteryCapacity`
5. **Graph Integration**: `SavingsChart` component exists in InstantQuoteForm but never imported/used in BidEvaluationModal
6. **Mixed Presentation**: Data scattered across "Component Specifications" and "Financial Summary" with no clear structure

---

## 5. REQUIRED RESTRUCTURE

### 5.1 New Modal Structure

```
HEADER: "Bid Evaluation - Lead #{leadId}"
↓
SECTION 1: "InstantQuote Details" (All User Inputs)
  Subsection A: Property & Location
    - Property Type, Location, State, Postcode
    - Roof Type
  
  Subsection B: Energy Usage
    - Electricity Bill: ${electricityValue} / {electricityUsageType}
    - Current Annual Bill: ${currentAnnualBill}
    - Desired Offset: {desiredOffset}%
    - Usage Pattern: {usagePattern}
  
  Subsection C: Solar System Configuration
    - System Size: {systemSize} kW (or {systemSizeOverride} if overridden)
    - Panel Brand: {panelBrand}
    - Panel Orientation: {panelOrientation}
    - Roof Tilt: {roofTilt}
    - Shading Level: {shadingLevel}
    - Optimizers: {includeOptimizers ? 'Yes' : 'No'}
    - Microinverters: {includeMicroinverters ? 'Yes' : 'No'}
  
  Subsection D: Battery Configuration (if batteryIncluded)
    - Battery Brand: {batteryBrand}
    - Battery Capacity: {batteryCapacity || customBatteryCapacity} kWh
    - Backup Criticality: {backupCritical}
    - Battery Usage: {batteryUsage}
  
  Subsection E: Retailer & Tariff
    - Retailer: {retailer}
    - Tariff Plan: {tariffPlan}
    - Custom Retail Rate: {customRetailRate} (if provided)
    - Custom Feed-in Rate: {customFeedInRate} (if provided)
  
  Subsection F: Additional Features
    - Tags: VPP, EV Charging, Smart Home, Grid Services
  
  Subsection G: Existing System (if hasExistingSystem)
    - Has Existing System: Yes
    - Existing System Size: {existingSystemSize} kW
  
  Subsection H: Commercial-Specific (if quoteType === 'commercial')
    - Peak Demand: {peakDemand} kW
    - Three-Phase Connection: {isThreePhase ? 'Yes' : 'No'}
    - Project Priority: {projectPriority}
↓
SECTION 2: "InstantQuote Result" (Calculation Results + Graph)
  Subsection A: System Overview
    - Visual: 3-column cards (System Size, Panels, Annual Production)
  
  Subsection B: Financial Summary
    - Total Cost, Rebates (Federal, Battery, State), Final Price
    - Visual: Pricing breakdown table
  
  Subsection C: Performance Metrics
    - Annual Savings, Payback Period, CO₂ Reduction
    - Self-Consumed vs Exported Energy
    - Visual: 4-column metric cards
  
  Subsection D: Savings Projection Graph
    - Component: <SavingsChart data={...} />
    - 25-year savings projection chart
  
  Subsection E: Disclaimers
    - Display all disclaimer text from resultData.disclaimers[]
↓
SECTION 3: "Competitor Bids" (Existing functionality)
  - Keep current bid comparison UI
```

### 5.2 Implementation Plan

**Phase 1: Audit & Prepare**
- [x] Complete data flow audit (this document)
- [ ] Read SavingsChart component to understand required props
- [ ] Create InstantQuoteDetails sub-component
- [ ] Create InstantQuoteResult sub-component

**Phase 2: Refactor BidEvaluationModal**
- [ ] Remove current "Component Specifications" section
- [ ] Remove current "Financial Summary" section
- [ ] Add "InstantQuote Details" section with ALL user inputs (systematic rendering)
- [ ] Add "InstantQuote Result" section with calculation results + graph

**Phase 3: Fix Custom Battery Size**
- [ ] Check for BOTH `batteryCapacity` AND `customBatteryCapacity`
- [ ] Display whichever is present (custom takes priority if both exist)

**Phase 4: Integrate Graph**
- [ ] Import SavingsChart component
- [ ] Pass required data (annualSavings, finalPrice, simplePaybackYears)
- [ ] Test chart rendering in modal

**Phase 5: Verification**
- [ ] TypeScript: npx tsc --noEmit → 0 errors
- [ ] Build: npm run build → Success
- [ ] Test with real lead: All fields visible, graph renders
- [ ] Test edge cases: Missing optional fields, commercial vs residential

---

## 6. TECHNICAL SPECIFICATIONS

### 6.1 Custom Battery Size Logic

**Problem**: Form uses dropdown OR text input
```typescript
// In InstantQuoteForm (Line 1507-1534)
{formData.batteryIncluded && (
  <select name="batteryCapacity" value={formData.batteryCapacity}>
    <option value="5">5 kWh</option>
    <option value="10">10 kWh</option>
    <option value="13.5">13.5 kWh (Tesla Powerwall 2)</option>
    <option value="custom">Custom Size</option>
  </select>
)}

{formData.batteryCapacity === 'custom' && (
  <input 
    type="number"
    name="customBatteryCapacity"
    placeholder="Enter custom capacity (kWh)"
  />
)}
```

**Solution**: Check both fields in modal
```typescript
const displayBatteryCapacity = 
  formData.batteryCapacity === 'custom' 
    ? formData.customBatteryCapacity 
    : formData.batteryCapacity;
```

### 6.2 SavingsChart Integration

**File**: `src/components/SavingsChart.tsx`

**Required Props** (need to audit component):
```typescript
interface SavingsChartProps {
  annualSavings: number;
  systemCost: number;
  // ... other props TBD
}
```

**Action**: Read SavingsChart.tsx to determine exact props needed.

---

## 7. SUCCESS CRITERIA

- [ ] ALL 40+ user input fields from InstantQuoteForm displayed under "InstantQuote Details"
- [ ] Custom battery size (`customBatteryCapacity`) correctly displayed when present
- [ ] ALL calculation results displayed under "InstantQuote Result"
- [ ] SavingsChart graph renders correctly in modal
- [ ] Disclaimers array displayed
- [ ] Exported kWh, current annual bill, demand charge savings (commercial) shown
- [ ] Clean section separation: "InstantQuote Details" vs "InstantQuote Result"
- [ ] TypeScript: 0 errors
- [ ] Build: Success
- [ ] Multi-theme: Dark/Light/Purple pass
- [ ] Responsive: 320px/768px/1440px layouts work

---

## 8. FILES TO MODIFY

| File | Action | Estimated Lines |
|------|--------|-----------------|
| `src/components/BidEvaluationModal.tsx` | Complete refactor of InstantQuote sections | -200, +350 |
| `src/components/SavingsChart.tsx` | Audit for integration (no changes expected) | 0 |

---

## 9. NEXT STEPS

1. **Read SavingsChart.tsx** - Understand required props for graph integration
2. **Refactor BidEvaluationModal** - Implement new 2-section structure
3. **Test with real lead** - Verify all data displays correctly
4. **Fix any missing fields** - Systematically check all 40+ inputs

---

**Status**: Audit Complete - Ready for Implementation  
**Next Action**: Read SavingsChart.tsx → Implement Phase 2 (Refactor Modal)
