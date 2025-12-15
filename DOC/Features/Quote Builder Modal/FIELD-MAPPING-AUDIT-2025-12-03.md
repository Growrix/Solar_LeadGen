# Bid Builder Field Mapping Audit & Implementation Plan

**Date**: December 3, 2025  
**Purpose**: Complete field-level analysis of Instant Quote → Bid Builder mapping  
**Status**: Comprehensive Audit Complete  
**Goal**: InstantQuote Fields + Bid Builder Extra Fields = Perfect Bid Builder for Installers

---

## Executive Summary

### Current State
- ✅ Import button is visible and functional
- ✅ Diff preview modal works and displays changes
- ⚠️ **PARTIAL**: Only 15 fields are currently mapped (out of 40+ available in Instant Quote)
- ❌ Bid Builder UI fields don't match Instant Quote structure (different labels, groupings, input types)
- ❌ Many homeowner-provided details are lost during import

### Root Issues Identified
1. **Incomplete Mapper**: `instant-to-bid.ts` only maps basic fields (system size, roof type, pitch, shading, tariffs, battery)
2. **UI Mismatch**: Bid Builder has different field names/structures than Instant Quote (e.g., "Panel Orientation" vs dropdown labels)
3. **Missing Fields**: 25+ Instant Quote fields have no equivalent in Bid Builder
4. **Lost Context**: Homeowner preferences (panel brand, optimizer requests, usage patterns, etc.) are not carried forward

---

## Part 1: Complete Field Inventory

### Instant Quote Form Fields (Source: `InstantQuoteForm.tsx`)

#### **Group A: Location & Property (5 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `postcode` | string | ✅ Mapped (STC zone) | `pricing.stc.postcode` | ✅ Working |
| `location` | string | ❌ Not mapped | N/A | ❌ Missing |
| `state` | string | ❌ Not mapped | N/A | ❌ Missing |
| `quoteType` (residential/commercial) | string | ✅ Mapped | `system.projectType` | ✅ Working |
| `roofType` | string | ✅ Mapped | `roof.roofType` | ✅ Working |

#### **Group B: System Sizing (4 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `recommendedSize` | number | ✅ Mapped | `system.systemSize` | ✅ Working |
| `systemSizeOverride` | number | ✅ Mapped (priority) | `system.systemSize` | ✅ Working |
| `desiredOffset` | number (%) | ❌ Not mapped | N/A | ❌ Missing |
| `hasExistingSystem` | boolean | ❌ Not mapped | N/A | ❌ Missing |
| `existingSystemSize` | string | ❌ Not mapped | N/A | ❌ Missing |

#### **Group C: Roof Details (6 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `roofType` | string | ✅ Mapped | `roof.roofType` | ✅ Working |
| `roofTilt` | string (bucket) | ✅ Mapped → degrees | `roof.pitchDeg` | ✅ Working |
| `panelOrientation` | string | ✅ Mapped | `roof.orientations[0]` | ✅ Working |
| `shadingLevel` | string (bucket) | ✅ Mapped → numeric | `roof.shadingLevel` | ✅ Working |
| `additionalArrays` | array | ❌ Not mapped | `roof.arrays` (count only) | ⚠️ Partial |
| Complex roof layout details | array | ❌ Not mapped | N/A | ❌ Missing |

#### **Group D: Energy & Tariffs (6 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `electricityValue` | number | ❌ Not mapped | N/A | ❌ Missing |
| `electricityUsageType` | string (monthly/quarterly) | ❌ Not mapped | N/A | ❌ Missing |
| `customRetailRate` | number (c/kWh) | ✅ Mapped → $/kWh | `assumptions.retailPrice` | ✅ Working |
| `customFeedInRate` | number (c/kWh) | ✅ Mapped → $/kWh | `assumptions.feedInTariff` | ✅ Working |
| `usagePattern` | string | ✅ Mapped → self-consumption | `assumptions.selfConsumption` | ✅ Working |
| `retailer` | string | ❌ Not mapped | N/A | ❌ Missing |
| `tariffPlan` | string | ❌ Not mapped | N/A | ❌ Missing |

#### **Group E: Battery (8 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `batteryIncluded` | boolean | ✅ Mapped | `products.battery.included` | ✅ Working |
| `batteryCapacity` | string (kWh) | ✅ Mapped | `products.battery.capacity` | ✅ Working |
| `batteryBrand` | string | ✅ Mapped | `products.battery.brand` | ✅ Working |
| `customBatteryCapacity` | string | ✅ Mapped (fallback) | `products.battery.capacity` | ✅ Working |
| `backupCritical` | string (essential/partial/whole-home) | ✅ Mapped → boolean | `products.battery.backupCircuitRequired` | ⚠️ Simplified |
| `batteryUsage` | string (self-consumption/backup/both) | ✅ Mapped | `products.battery.usage` | ✅ Working |
| `includeVPP` | boolean | ✅ Mapped → addon | `products.addons[]` | ✅ Working |
| Battery warranty preferences | N/A | ❌ Not mapped | N/A | ❌ Missing |

#### **Group F: Budget & Priorities (2 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `budgetRange` | string ($X-$Y) | ⚠️ Parsed but not used | `system.desiredPriceRange` | ⚠️ Not applied |
| `projectPriority` (commercial) | string | ❌ Not mapped | N/A | ❌ Missing |

#### **Group G: Advanced Features (4 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `includeEVCharging` | boolean | ✅ Mapped → addon | `products.addons[]` | ✅ Working |
| `includeSmartHome` | boolean | ✅ Mapped → addon | `products.addons[]` | ✅ Working |
| `includeGridServices` | boolean | ✅ Mapped → addon | `products.addons[]` | ✅ Working |
| `includeOptimizers` | boolean | ❌ Not mapped | N/A | ❌ Missing |
| `includeMicroinverters` | boolean | ❌ Not mapped | N/A | ❌ Missing |

#### **Group H: Product Preferences (3 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `panelBrand` | string | ❌ Not mapped | `products.panels.brand` | ❌ Missing |
| `batteryBrand` | string | ✅ Mapped | `products.battery.brand` | ✅ Working |
| Inverter preferences | N/A | ❌ Not mapped | `products.inverter.brand` | ❌ Missing |

#### **Group I: Commercial-Specific (3 fields)**
| Instant Quote Field | Type | Current Mapping | Bid Builder Equivalent | Status |
|---------------------|------|----------------|------------------------|--------|
| `peakDemand` | number (kW) | ❌ Not mapped | N/A | ❌ Missing |
| `isThreePhase` | boolean | ❌ Not mapped | `roof.phaseType` | ⚠️ Indirect |
| `projectPriority` | string | ❌ Not mapped | N/A | ❌ Missing |

---

### Bid Builder Fields NOT in Instant Quote (Installer-Specific)

#### **Group J: Installer Technical Fields (12 fields)**
| Bid Builder Field | Type | Source | Purpose |
|-------------------|------|--------|---------|
| `roof.arrays` | number | Manual | Number of roof arrays |
| `roof.arrayLayoutNotes` | string | Manual | Notes about panel layout |
| `roof.roofAccessNotes` | string | Manual | Site access challenges |
| `roof.structuralNotes` | string | Manual | Structural concerns |
| `roof.mountingSystemPreferred` | string | Manual | Mounting hardware choice |
| `roof.conduitRunComplexity` | enum | Manual | Wiring complexity |
| `roof.inverterLocationNotes` | string | Manual | Inverter placement notes |
| `roof.switchboardUpgrade` | boolean | Manual | Electrical panel upgrade needed |
| `roof.smartMeterRequired` | boolean | Manual | Smart meter installation |
| `roof.distanceToSwitchboardM` | number | Manual | Wiring distance |
| `roof.photos` | array | Upload | Site photos |
| `system.systemType` | string | Manual | Grid-connected vs off-grid |

#### **Group K: Product Configuration (8 fields)**
| Bid Builder Field | Type | Source | Purpose |
|-------------------|------|--------|---------|
| `products.panels.model` | string | Manual | Specific panel model |
| `products.panels.wattage` | number | Manual | Panel wattage |
| `products.panels.efficiency` | number | Manual | Panel efficiency % |
| `products.panels.qty` | number | Calculated | Number of panels |
| `products.panels.productWarranty` | number | Manual | Product warranty years |
| `products.panels.performanceWarranty` | number | Manual | Performance warranty years |
| `products.panels.tier1` | boolean | Manual | Tier 1 manufacturer |
| `products.inverter.*` | object | Manual | Full inverter specs |

#### **Group L: Pricing & Compliance (15+ fields)**
| Bid Builder Field | Type | Source | Purpose |
|-------------------|------|--------|---------|
| `pricing.lineItems[]` | array | Manual | Itemized quote |
| `pricing.stc.*` | object | Auto/Manual | STC rebate calculations |
| `pricing.vic.*` | object | Auto/Manual | VIC rebates |
| `pricing.discounts[]` | array | Manual | Discounts applied |
| `pricing.installerCostMode` | boolean | Manual | Show installer cost view |
| `compliance.docs[]` | array | Upload | Compliance documents |
| `compliance.cecAccreditation` | string | Manual | CEC license number |
| `compliance.electricalLicence` | string | Manual | Electrical license |
| `compliance.insurance` | string | Manual | Insurance details |

---

## Part 2: Field Mapping Status Summary

### ✅ Currently Mapped (15 fields)
1. System size (kW)
2. Project type (residential/commercial)
3. Roof type
4. Roof pitch (tilt → degrees)
5. Panel orientation
6. Shading level (bucket → numeric)
7. Retail electricity rate (c/kWh → $/kWh)
8. Feed-in tariff (c/kWh → $/kWh)
9. Self-consumption (derived from usage pattern)
10. Battery included (boolean)
11. Battery capacity (kWh)
12. Battery brand
13. Battery usage type
14. VPP addon
15. EV Charger addon
16. Smart Home addon
17. Grid Services addon
18. STC postcode & zone

### ⚠️ Partially Mapped (3 fields)
1. Budget range (parsed but not applied to `system.desiredPriceRange`)
2. Additional arrays (not mapped to array details)
3. Backup circuit (simplified from `backupCritical` enum)

### ❌ NOT Mapped (25+ fields)
1. Location & state
2. Desired offset %
3. Existing system details
4. Additional array layout details
5. Electricity usage value
6. Electricity usage type (monthly/quarterly)
7. Retailer name
8. Tariff plan name
9. Panel brand preference
10. Optimizer preference
11. Microinverter preference
12. Peak demand (commercial)
13. Three-phase (commercial)
14. Project priority (commercial)
15. Battery warranty preferences
16. ... and more

---

## Part 3: UI Field Mismatch Analysis

### Issue 1: Different Input Types
| Instant Quote | Bid Builder | Problem |
|---------------|-------------|---------|
| Radio buttons for orientation (N, NE, E, etc.) | Dropdown or text input | Homeowner sees friendly labels, installer sees different UI |
| Radio buttons for roof tilt (Flat, Low, Optimal, Steep) | Number input (degrees) | Values are converted but UI doesn't show homeowner's original choice |
| Radio buttons for shading (None, Minimal, Partial, etc.) | Slider (0-4) | Semantic meaning is lost in translation |

### Issue 2: Missing Context Fields
Homeowners provide context that installers need but don't see:
- Why they chose a specific battery size
- Which retailer/tariff plan they're on (affects calculation accuracy)
- Whether they have existing solar (affects design)
- Panel brand preferences (helps pre-select products)
- Usage pattern context (evening vs daytime heavy)

### Issue 3: Field Label Mismatch
| Instant Quote Label | Bid Builder Label | Impact |
|---------------------|-------------------|--------|
| "Panel Orientation" | "Orientations" (array) | Installer doesn't see the exact homeowner choice |
| "Roof Tilt" | "Pitch (degrees)" | Units and semantics differ |
| "Shading Level" | Numeric slider | Loses "None/Minimal/Heavy" context |

---

## Part 4: Gap Analysis — What's Missing

### Critical Gaps (High Impact)
1. **Budget Range Display**: Not shown anywhere in Bid Builder UI
2. **Panel Brand Preference**: Homeowner selection not carried forward
3. **Electricity Usage Context**: Monthly/quarterly bill amount not displayed
4. **Existing System Details**: If homeowner has solar, installer should know
5. **Optimizer/Microinverter Request**: Homeowner checkbox not reflected

### Moderate Gaps (Medium Impact)
6. **Retailer & Tariff Plan**: Helps installer verify rate accuracy
7. **Desired Offset %**: Homeowner's goal not visible to installer
8. **Project Priority**: Commercial homeowners indicate priority (reduce bills vs carbon)
9. **Peak Demand**: Commercial system sizing factor
10. **Three-Phase**: Critical electrical detail for commercial

### Low Priority Gaps (Nice-to-Have)
11. **Location & State**: Already visible in lead card, but could be in modal too
12. **Usage Pattern Label**: "Evening Heavy" vs numeric self-consumption %
13. **Battery Warranty Preferences**: Not captured in Instant Quote currently

---

## Part 5: Proposed Field Alignment Strategy

### Goal
**Instant Quote Fields + Bid Builder Extra Fields = Perfect Bid Builder**

### Approach A: Expand Bid Builder to Mirror Instant Quote

#### Step 1: Add Missing Read-Only Info Section
Create a new collapsible section at the top of Bid Builder: **"Homeowner Requirements"**

Fields (read-only, from Instant Quote):
- Budget Range: `$8,000 - $10,000`
- Desired Offset: `100%`
- Electricity Bill: `$950/month` *(new)*
- Retailer: `Origin Energy` *(new)*
- Tariff Plan: `Time of Use` *(new)*
- Usage Pattern: `Evening Heavy` *(show label, not just numeric)*
- Existing System: `Yes, 3kW installed 2018` *(new)*
- Panel Brand Preference: `LG Solar` *(new)*
- Special Requests: `Optimizers preferred, EV charger ready` *(new)*

#### Step 2: Align Roof Section Fields
Match Instant Quote structure in Bid Builder's "Roof & Site Details":

**Current Bid Builder:**
```
Roof Type: [dropdown]
Pitch (degrees): [number input]
Orientations: [multi-select]
Shading Level: [slider 0-4]
Arrays: [number]
```

**Proposed Bid Builder:**
```
Roof Type: [dropdown] ✅ (Prefilled: Tile ← from Instant Quote)
Roof Pitch: [dropdown: Flat/Low/Optimal/Steep OR degrees input] ⚠️ (Prefilled: Optimal ← show original label)
Panel Orientation: [multi-select: N/NE/E/SE/S/SW/W/NW] ✅ (Prefilled: North ← from Instant Quote)
Shading Level: [dropdown: None/Minimal/Partial/Moderate/Heavy] ⚠️ (Prefilled: Minimal ← show original label)
Number of Arrays: [number] (Installer adds this)
--- Installer-Only Fields Below ---
Array Layout Notes: [textarea]
Roof Access Notes: [textarea]
Structural Concerns: [textarea]
Mounting System: [dropdown]
Conduit Complexity: [dropdown]
Inverter Location: [textarea]
```

#### Step 3: Enhance System Selection Section
**Current Bid Builder:**
```
System Type: Grid-Connected / Off-Grid
System Size: [number] kW
Project Type: Residential / Commercial
```

**Proposed Bid Builder:**
```
Project Type: [dropdown: Residential/Commercial] ✅ (Prefilled from Instant Quote)
System Size: [number] kW ✅ (Prefilled: 6.6 kW ← recommended size)
  └─ Homeowner's Target Offset: 100% (read-only info)
  └─ Homeowner's Budget: $8,000 - $10,000 (read-only info)
System Type: [dropdown: Grid-Connected/Off-Grid]
Existing System: Yes, 3kW (2018) (read-only info from Instant Quote)
```

#### Step 4: Enhance Product Configuration
**Current Bid Builder:**
```
Panels:
  Brand: [dropdown]
  Model: [dropdown]
  Wattage: [number]
  Qty: [calculated]

Inverter:
  Brand: [dropdown]
  Model: [dropdown]
  Type: [dropdown]
```

**Proposed Bid Builder:**
```
Panels:
  Brand: [dropdown] (💡 Homeowner prefers: LG Solar)
  Model: [dropdown]
  Wattage: [number]
  Qty: [calculated]
  Optimizers: [checkbox] (💡 Homeowner requested)

Inverter:
  Brand: [dropdown]
  Model: [dropdown]
  Type: [dropdown]
  Microinverters: [checkbox] (💡 Homeowner requested)
```

#### Step 5: Add Budget Banner (Enhanced)
**Current:** Generic warning if price > budget * 1.1

**Proposed:**
```
┌─────────────────────────────────────────────────────────────┐
│ 💰 Homeowner Budget Context                                 │
│                                                              │
│ Requested Budget: $8,000 - $10,000                          │
│ Current Quote Total: $12,500                                │
│ ⚠️ Quote is 25% over budget max                             │
│                                                              │
│ Homeowner priorities:                                        │
│ • 100% offset target                                         │
│ • Battery included (13.5 kWh)                                │
│ • EV charger ready                                           │
│                                                              │
│ [Suggest reducing battery size] [Remove addons] [Dismiss]   │
└─────────────────────────────────────────────────────────────┘
```

---

### Approach B: Keep Bid Builder As-Is, Enhance Mapper Only

If you prefer NOT to change Bid Builder UI significantly, we can:
1. Map all available Instant Quote fields to closest Bid Builder equivalents
2. Add "Import Notes" section showing unmapped homeowner context
3. Use captions more extensively to show original homeowner values

**Pros**: Faster to implement, no UI redesign needed  
**Cons**: Installer still misses context, field mismatch persists

---

## Part 6: Recommended Implementation Plan

### Phase 1: Fix Import Functionality (Current Blockers)
**Goal**: Ensure existing 15 mapped fields actually apply correctly

**Tasks**:
1. ✅ Verify `handleImportClick` is wired (DONE - confirmed working)
2. ✅ Verify `handleImportAccept` merges data (DONE - confirmed working)
3. ⚠️ **FIX**: Budget range not applying to `system.desiredPriceRange`
4. ⚠️ **FIX**: Budget banner not showing (check threshold logic)
5. ⚠️ **FIX**: Field captions not rendering (check conditional logic)
6. ✅ Test import with real lead data (IN PROGRESS - user has test data)

**Testing**:
- Create test lead with Instant Quote data
- Import into Bid Builder
- Verify all 15 fields populate
- Verify captions appear
- Verify budget banner triggers

---

### Phase 2: Expand Mapper (Add Missing Fields)
**Goal**: Map 10 more critical fields

**New Mappings**:
1. `budgetRange` → `system.desiredPriceRange` (parse and apply)
2. `electricityValue` + `electricityUsageType` → `meta.homeownerUsage` (display info)
3. `desiredOffset` → `meta.homeownerOffset` (display info)
4. `panelBrand` → `products.panels.brand` (prefill)
5. `includeOptimizers` → `products.panels.optimizers` (new field)
6. `includeMicroinverters` → `products.inverter.microinverters` (new field)
7. `retailer` → `meta.homeownerRetailer` (display info)
8. `tariffPlan` → `meta.homeownerTariff` (display info)
9. `hasExistingSystem` + `existingSystemSize` → `meta.existingSystem` (display info)
10. `peakDemand` (commercial) → `system.peakDemand` (new field)

**Testing**:
- Update `instant-to-bid.ts` mapper
- Test with Instant Quote data containing all fields
- Verify import preview shows new fields
- Verify data applies correctly

---

### Phase 3: UI Enhancements (Bid Builder Field Alignment)
**Goal**: Add "Homeowner Requirements" section, enhance field labels

**Tasks**:
1. Create new collapsible section: "Homeowner Requirements"
2. Add read-only fields from `meta.homeowner*`
3. Enhance existing sections with homeowner context hints
4. Update field labels to match Instant Quote semantics
5. Add budget banner with detailed breakdown

**Testing**:
- Visual check: Homeowner Requirements section renders
- Visual check: Field labels are clear and match Instant Quote
- Visual check: Budget banner shows correct calculations
- Responsive check: Mobile layout

---

### Phase 4: Advanced Features (Future Enhancements)
**Goal**: Full field parity + installer workflow optimization

**Tasks**:
1. Add array layout visualization
2. Add product recommendation engine (based on homeowner preferences)
3. Add "Optimize for Budget" button (auto-adjust to fit budget)
4. Add "Compare to Homeowner Quote" view
5. Telemetry: Track which fields installers modify after import

---

## Part 7: Testing Protocol

### Test Case 1: Basic Import (15 Fields)
**Setup**: Lead with basic Instant Quote data
**Steps**:
1. Open Bid Builder for lead
2. Click "Import from Instant Quote"
3. Review diff preview modal
4. Accept import

**Expected**:
- System size: 6.6 kW
- Project type: Residential
- Roof type: Tile
- Roof pitch: 25° (from "Optimal")
- Orientation: North
- Shading: 1 (from "Minimal")
- Retail rate: $0.32/kWh
- Feed-in: $0.08/kWh
- Self-consumption: 55%
- Battery: 13.5 kWh, Tesla
- Addons: VPP, EV Charger

### Test Case 2: Budget Banner
**Setup**: Lead with budget $8k-$10k, quote total $12.5k
**Steps**:
1. Import quote data
2. Add line items to exceed budget

**Expected**:
- Banner appears when total > $11k (110% of max)
- Banner shows budget range
- Banner shows overage %

### Test Case 3: Field Captions
**Setup**: Lead with Instant Quote data
**Steps**:
1. Import data
2. Navigate to System Selection
3. Navigate to Roof & Site Details

**Expected**:
- Fields prefilled from import show caption: "Prefilled from homeowner Instant Quote"
- Fields not prefilled have no caption

### Test Case 4: Commercial Lead
**Setup**: Lead with commercial property type, peak demand, three-phase
**Steps**:
1. Import data

**Expected**:
- Project type: Commercial
- Peak demand field populated (if mapped in Phase 2)
- Three-phase indicator (if mapped in Phase 2)

---

## Part 8: Success Criteria

### Phase 1 Complete When:
- ✅ All 15 currently-mapped fields apply correctly after import
- ✅ Diff preview modal shows accurate before/after
- ✅ Field captions render on prefilled fields
- ✅ Budget banner triggers at correct threshold
- ✅ E2E test passes with real lead data

### Phase 2 Complete When:
- ✅ 25 total fields are mapped (10 new + 15 existing)
- ✅ Homeowner context (budget, offset, usage, preferences) visible in Bid Builder
- ✅ Mapper handles commercial fields (peak demand, three-phase)
- ✅ No field mapping errors or data loss

### Phase 3 Complete When:
- ✅ "Homeowner Requirements" section renders with all read-only info
- ✅ Field labels in Bid Builder match Instant Quote semantics
- ✅ Budget banner shows detailed breakdown
- ✅ Mobile responsive

### Phase 4 Complete When:
- ✅ Full field parity (40+ fields)
- ✅ Installer workflow optimizations (optimize-for-budget, product recommendations)
- ✅ Telemetry tracking

---

## Part 9: Files to Modify

### Phase 1 (Fix Current Issues)
1. `src/lib/mappers/instant-to-bid.ts` - Fix budget range application
2. `src/components/QuoteBuilderModal.tsx` - Fix budget banner logic, verify caption rendering
3. `src/components/quote-builder/SystemSelection.tsx` - Verify caption display
4. `src/components/quote-builder/RoofSiteDetails.tsx` - Verify caption display

### Phase 2 (Expand Mapper)
1. `src/lib/mappers/instant-to-bid.ts` - Add 10 new field mappings
2. `src/types.ts` or component interfaces - Add new fields to QuoteDraft type

### Phase 3 (UI Enhancements)
1. `src/components/QuoteBuilderModal.tsx` - Add Homeowner Requirements section
2. `src/components/quote-builder/SystemSelection.tsx` - Add budget/offset display
3. `src/components/quote-builder/RoofSiteDetails.tsx` - Update field labels
4. `src/components/quote-builder/ProductConfiguration.tsx` - Add preference hints

### Phase 4 (Advanced)
1. New component: `src/components/quote-builder/HomeownerContext.tsx`
2. New utility: `src/utils/budgetOptimizer.ts`
3. New utility: `src/utils/productRecommender.ts`

---

## Part 10: Field Mapping Matrix (Complete Reference)

### System & Sizing
| Instant Quote → Bid Builder | Transform | Status |
|------------------------------|-----------|--------|
| `recommendedSize` → `system.systemSize` | Direct | ✅ |
| `systemSizeOverride` → `system.systemSize` | Priority | ✅ |
| `propertyType` → `system.projectType` | Capitalize | ✅ |
| `desiredOffset` → `meta.homeownerOffset` | Display only | ❌ Phase 2 |
| `budgetRange` → `system.desiredPriceRange` | Parse $X-$Y | ⚠️ Fix Phase 1 |

### Roof
| Instant Quote → Bid Builder | Transform | Status |
|------------------------------|-----------|--------|
| `roofType` → `roof.roofType` | Direct | ✅ |
| `roofTilt` → `roof.pitchDeg` | Bucket → degrees | ✅ |
| `panelOrientation` → `roof.orientations[0]` | Array wrap | ✅ |
| `shadingLevel` → `roof.shadingLevel` | Bucket → 0-4 | ✅ |
| `additionalArrays` → `roof.arrays` | Count only | ⚠️ Partial |

### Energy & Tariffs
| Instant Quote → Bid Builder | Transform | Status |
|------------------------------|-----------|--------|
| `customRetailRate` → `assumptions.retailPrice` | c/kWh → $/kWh | ✅ |
| `customFeedInRate` → `assumptions.feedInTariff` | c/kWh → $/kWh | ✅ |
| `usagePattern` → `assumptions.selfConsumption` | Heuristic | ✅ |
| `electricityValue` → `meta.homeownerUsage` | Display only | ❌ Phase 2 |
| `retailer` → `meta.homeownerRetailer` | Display only | ❌ Phase 2 |

### Battery & Addons
| Instant Quote → Bid Builder | Transform | Status |
|------------------------------|-----------|--------|
| `batteryIncluded` → `products.battery.included` | Direct | ✅ |
| `batteryCapacity` → `products.battery.capacity` | Direct | ✅ |
| `batteryBrand` → `products.battery.brand` | Direct | ✅ |
| `backupCritical` → `products.battery.backupCircuitRequired` | Enum → boolean | ⚠️ Simplified |
| `includeVPP` → `products.addons[]` | Create addon | ✅ |
| `includeEVCharging` → `products.addons[]` | Create addon | ✅ |

### Product Preferences
| Instant Quote → Bid Builder | Transform | Status |
|------------------------------|-----------|--------|
| `panelBrand` → `products.panels.brand` | Direct | ❌ Phase 2 |
| `includeOptimizers` → `products.panels.optimizers` | Direct | ❌ Phase 2 |
| `includeMicroinverters` → `products.inverter.microinverters` | Direct | ❌ Phase 2 |

### Commercial
| Instant Quote → Bid Builder | Transform | Status |
|------------------------------|-----------|--------|
| `peakDemand` → `system.peakDemand` | Direct | ❌ Phase 2 |
| `isThreePhase` → `roof.phaseType` | Boolean → enum | ❌ Phase 2 |
| `projectPriority` → `meta.homeownerPriority` | Display only | ❌ Phase 2 |

---

## Conclusion

### Current Situation
The import functionality IS working, but only for 15 out of 40+ available fields. Homeowner context is being lost, and the Bid Builder UI doesn't fully align with Instant Quote structure.

### Immediate Action (Phase 1)
1. Fix budget range application
2. Fix budget banner threshold
3. Verify field captions render
4. Test with real lead data

### Next Steps (Phase 2-4)
1. Expand mapper to include 25+ fields
2. Add "Homeowner Requirements" display section
3. Align field labels and UI elements
4. Add workflow optimizations

### Timeline Estimate
- Phase 1 (Fix blockers): 2-4 hours
- Phase 2 (Expand mapper): 4-6 hours
- Phase 3 (UI enhancements): 6-8 hours
- Phase 4 (Advanced features): 8-12 hours

**Total**: 20-30 hours of development + testing

---

**Status**: Audit Complete ✅  
**Next**: Create Phase in tasks.md and begin Phase 1 implementation
