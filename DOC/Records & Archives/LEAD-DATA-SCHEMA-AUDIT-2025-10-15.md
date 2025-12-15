# Lead Data Schema Audit & Mismatch Analysis
**Date**: October 15, 2025  
**Purpose**: Identify mismatches between InstantQuoteForm data collection and Lead database schema  
**Status**: 🔴 CRITICAL MISMATCHES FOUND

---

## 🔍 PROBLEM SUMMARY

The InstantQuoteForm collects **extensive quote calculation data** (30+ fields including system size, pricing, savings, panel details, battery specs, etc.), but the Lead model only stores **basic requirements** (10 fields).

**Result**: When a lead is created, we're **losing 90% of the valuable quote data** that installers need to provide accurate quotes!

---

## 📊 DATA COLLECTION vs DATABASE STORAGE

### **InstantQuoteForm Collects** (30+ fields):

#### **User Inputs**:
```typescript
{
  // Location
  postcode: '2000',
  location: 'Sydney',
  state: 'NSW',
  
  // Energy Usage
  electricityValue: 500,           // ← NOT STORED (only derived energyBill)
  electricityUsageType: 'quarterly-bill',  // ← NOT STORED
  
  // Property Details
  roofType: 'tile',
  roofTilt: 'optimal',             // ← NOT STORED
  panelOrientation: 'north',       // ← NOT STORED
  shadingLevel: 'none',            // ← NOT STORED
  usagePattern: 'spread',          // ← NOT STORED
  
  // System Requirements
  desiredOffset: 100,              // ✅ STORED
  budgetRange: '5000-10000',       // ✅ STORED
  
  // Battery Details
  batteryIncluded: true,           // ← Stored as batteryRequired
  batteryCapacity: '10kWh',        // ✅ STORED
  batteryBrand: 'Tesla',           // ← NOT STORED
  batteryUsage: 'self-consumption',// ← NOT STORED
  backupCritical: 'essential',     // ← NOT STORED
  
  // Advanced Options
  hasExistingSystem: false,        // ← NOT STORED
  existingSystemSize: '',          // ← NOT STORED
  includeVPP: false,               // ← NOT STORED
  includeEVCharging: false,        // ← NOT STORED
  includeOptimizers: false,        // ← NOT STORED
  includeMicroinverters: false,    // ← NOT STORED
  
  // Retailer & Tariff
  retailer: 'Origin Energy',       // ← NOT STORED
  tariffPlan: 'Peak/Off-Peak',     // ← NOT STORED
  customRetailRate: '0.28',        // ← NOT STORED
  customFeedInRate: '0.10',        // ← NOT STORED
  
  // Panel Preferences
  panelBrand: 'SunPower',          // ← NOT STORED
  
  // Commercial
  peakDemand: '',                  // ← NOT STORED
  isThreePhase: false,             // ← NOT STORED
  projectPriority: 'reduce_bills', // ← NOT STORED
}
```

#### **Calculated Results** (Quote Output):
```typescript
{
  // System Design
  recommendedSystemSize: 6.6,      // ← NOT STORED!
  numberOfPanels: 20,              // ← NOT STORED!
  panelWattage: 330,               // ← NOT STORED!
  totalPanelCapacity: 6600,        // ← NOT STORED!
  
  // Financial
  upfrontCost: 8500,               // ← NOT STORED!
  governmentIncentive: 2200,       // ← NOT STORED!
  finalCost: 6300,                 // ← NOT STORED!
  
  // Savings
  annualGeneration: 9500,          // ← NOT STORED!
  annualSavings: 1800,             // ← NOT STORED!
  paybackPeriod: 3.5,              // ← NOT STORED!
  roi25Years: 45000,               // ← NOT STORED!
  
  // Environmental
  co2OffsetAnnual: 7.5,            // ← NOT STORED!
  treesEquivalent: 165,            // ← NOT STORED!
  
  // Battery (if included)
  batteryModel: 'Tesla Powerwall 2', // ← NOT STORED!
  batteryCost: 12000,              // ← NOT STORED!
  batteryCapacity: 13.5,           // ← Only capacity string stored
  dailyUsableBattery: 12.8,        // ← NOT STORED!
}
```

---

### **Lead Model ACTUALLY Stores** (10 fields only):

```prisma
model Lead {
  // ✅ STORED FROM FORM:
  postcode: String,              // ← From postcode
  location: String,              // ← From location
  state: String,                 // ← From state
  address: String?,              // ← Optional, not from instant quote
  energyBill: Float,             // ← Derived from electricityValue
  billType: String,              // ← 'quarterly' or 'monthly'
  roofType: String,              // ← From roofType
  budgetRange: String,           // ← From budgetRange
  desiredOffset: Int,            // ← From desiredOffset
  batteryRequired: Boolean,      // ← From batteryIncluded
  batteryCapacity: String?,      // ← From batteryCapacity
  timeframe: String?,            // ← NOT in instant quote form!
  additionalNotes: String?,      // ← NOT in instant quote form!
  
  // ❌ MISSING ALL QUOTE CALCULATION DATA:
  // - System size, panel details
  // - Cost breakdown, savings
  // - Payback period, ROI
  // - Battery specifics
  // - Roof characteristics (tilt, orientation, shading)
  // - Retailer/tariff details
  // - Advanced preferences (VPP, EV charging, optimizers)
}
```

---

## 🔥 CRITICAL ISSUES

### **Issue #1: Lost Quote Data**
**Problem**: When a homeowner completes the instant quote and submits a lead, we **discard 90% of the calculated data**!

**Impact**:
- ❌ Installers don't see the original quote calculations
- ❌ Can't understand what system size the homeowner expects
- ❌ Lost context on pricing expectations (upfront cost, incentives)
- ❌ No ROI/payback period information
- ❌ Missing preferences (battery brand, panel brand, VPP, EV charging)

**Example**: 
```
User calculates:
- 6.6kW system
- $6,300 final cost
- $1,800/year savings
- 3.5 year payback
- Tesla Powerwall 2

Lead stores:
- energyBill: 500
- batteryCapacity: "10kWh"
- budgetRange: "5000-10000"

Installer sees: "This homeowner wants a battery system with $5k-$10k budget"
Installer doesn't know: The user already saw a $6.3k quote for 6.6kW + battery
```

---

### **Issue #2: Field Name Mismatches**
**Problem**: Form fields don't match Prisma schema field names

| Form Field | Lead Field | Status |
|------------|-----------|---------|
| `postcode` | `propertyPostcode` | ❌ Requires mapping |
| `electricityValue` | `energyBill` | ❌ Requires mapping + calculation |
| `batteryIncluded` (boolean) | `batteryRequired` (boolean) | ✅ Works but different names |
| `batteryCapacity` | `batteryCapacity` | ✅ Direct match |

---

### **Issue #3: Missing Form Fields in Lead Schema**
These fields should be in Lead but aren't:

```typescript
// Form collects but Lead doesn't store:
- roofTilt (optimal/steep/flat)
- panelOrientation (north/east/west)
- shadingLevel (none/partial/heavy)
- usagePattern (spread/morning/evening/night)
- batteryBrand (Tesla/LG/BYD)
- panelBrand (SunPower/Trina/Jinko)
- retailer (Origin/AGL/EnergyAustralia)
- tariffPlan (flat/peak-offpeak/TOU)
- hasExistingSystem (boolean)
- includeVPP (boolean)
- includeEVCharging (boolean)
- includeOptimizers (boolean)
```

---

### **Issue #4: Missing Lead Fields in Form**
These fields exist in Lead but aren't collected in instant quote:

```typescript
// Lead has but form doesn't collect:
- timeframe (urgent/3months/6months/year)
- additionalNotes (free text)
- address (full address - makes sense to skip in instant quote)
```

---

## ✅ SOLUTION OPTIONS

### **Option A: Store Full Quote Data in JSON Field** (RECOMMENDED)

Add a single JSON column to store all quote data:

```prisma
model Lead {
  // ... existing fields ...
  
  // NEW FIELD:
  quoteData Json?  // Stores complete instant quote calculation
  
  // Structure:
  // {
  //   inputs: { postcode, location, electricityValue, ... },
  //   results: { systemSize, cost, savings, payback, ... },
  //   timestamp: "2025-10-15T12:00:00Z"
  // }
}
```

**Pros**:
- ✅ Zero data loss - everything preserved
- ✅ Easy to implement - just pass entire quote object
- ✅ Flexible - can add/remove fields without migrations
- ✅ Backward compatible - existing leads work fine

**Cons**:
- ⚠️ Can't query by specific quote fields (e.g., find all leads with 10kW systems)
- ⚠️ Slightly larger database size

---

### **Option B: Add All Fields to Lead Schema**

Add 30+ new columns to Lead model:

```prisma
model Lead {
  // ... existing fields ...
  
  // NEW FIELDS (30+):
  roofTilt String?
  panelOrientation String?
  shadingLevel String?
  usagePattern String?
  recommendedSystemSize Float?
  numberOfPanels Int?
  upfrontCost Float?
  governmentIncentive Float?
  finalCost Float?
  annualSavings Float?
  paybackPeriod Float?
  // ... 20 more fields
}
```

**Pros**:
- ✅ Can query by any field
- ✅ Strongly typed in Prisma

**Cons**:
- ❌ Requires large migration
- ❌ Schema becomes bloated
- ❌ Hard to maintain as quote calculator evolves
- ❌ Many nullable fields (not all apply to all leads)

---

### **Option C: Hybrid Approach** (BEST)

Keep essential fields in schema + JSON for extras:

```prisma
model Lead {
  // ESSENTIAL FIELDS (indexed, queryable):
  postcode String              // ✅ Keep
  location String              // ✅ Keep
  state String                 // ✅ Keep
  energyBill Float             // ✅ Keep
  roofType String              // ✅ Keep
  budgetRange String           // ✅ Keep
  desiredOffset Int            // ✅ Keep
  batteryRequired Boolean      // ✅ Keep
  
  // QUOTE SYSTEM DETAILS (new, indexed):
  recommendedSystemSize Float? // NEW - for searching
  finalCost Float?             // NEW - for price filtering
  annualSavings Float?         // NEW - for ROI analysis
  
  // COMPLETE QUOTE DATA (JSON):
  quoteData Json?              // NEW - everything else
  
  // PREFERENCES (new):
  preferences Json?            // NEW - {batteryBrand, panelBrand, includeVPP, etc}
}
```

**Pros**:
- ✅ Best of both worlds
- ✅ Can query by important fields (system size, cost)
- ✅ Full data preserved in JSON
- ✅ Moderate database size increase

---

## 🎯 RECOMMENDED ACTION PLAN

### **Phase 1: Immediate Fix (Today)**

1. **Add `quoteData` JSON field to Lead model**:
   ```prisma
   quoteData Json?  @db.JsonB  // PostgreSQL JSON with indexing
   ```

2. **Update lead-service.ts to store full quote**:
   ```typescript
   const lead = await prisma.lead.create({
     data: {
       // ... existing fields ...
       quoteData: input.quoteData,  // Store complete quote object
     }
   });
   ```

3. **Update page.tsx and HomeownerSignupModal.tsx**:
   - Already passing `quoteData: pendingQuoteData` ✅
   - Just need to ensure it's included in Prisma create

---

### **Phase 2: Schema Enhancement (Next Sprint)**

Add indexed fields for common queries:

```prisma
model Lead {
  // ... existing fields ...
  
  // QUOTE SUMMARY (indexed for filtering)
  recommendedSystemSize Float?  // kW - for installer matching
  finalCost Float?              // $ - for price filtering
  annualSavings Float?          // $ - for ROI display
  paybackPeriod Float?          // years - for lead quality
  
  // FULL QUOTE DATA
  quoteData Json?  @db.JsonB
  
  @@index([recommendedSystemSize])
  @@index([finalCost])
}
```

---

### **Phase 3: Admin Dashboard (Future)**

Show quote details in admin lead view:
- Display system size, cost breakdown
- Show savings calculations
- Render preferences (battery brand, VPP, EV charging)
- Link to original quote results

---

## 📋 FIELD MAPPING REFERENCE

### **Current Working Mappings**:
```typescript
{
  propertyPostcode: quoteData.postcode,           // ✅ Fixed
  location: quoteData.location,                   // ✅ Fixed
  state: quoteData.state,                         // ✅ Fixed
  energyBill: quoteData.electricityValue || 0,    // ✅ Fixed
  billType: quoteData.billType || 'quarterly',    // ✅ Works
  roofType: quoteData.roofType || 'unknown',      // ✅ Works
  budgetRange: quoteData.budgetRange || 'unknown',// ✅ Works
  desiredOffset: quoteData.desiredOffset || 100,  // ✅ Works
  batteryRequired: quoteData.batteryIncluded || false, // ⚠️ Needs fix
  batteryCapacity: quoteData.batteryCapacity,     // ✅ Works
}
```

### **Proposed Enhanced Mapping**:
```typescript
{
  // Basic fields (existing)
  propertyPostcode: quoteData.postcode,
  location: quoteData.location,
  state: quoteData.state,
  energyBill: quoteData.electricityValue || 0,
  billType: 'quarterly', // Always from instant quote
  roofType: quoteData.roofType || 'unknown',
  budgetRange: quoteData.budgetRange || 'unknown',
  desiredOffset: quoteData.desiredOffset || 100,
  batteryRequired: quoteData.batteryIncluded || false,
  batteryCapacity: quoteData.batteryCapacity,
  
  // NEW: Summary fields (Phase 2)
  recommendedSystemSize: quoteData.recommendedSystemSize,
  finalCost: quoteData.finalCost,
  annualSavings: quoteData.annualSavings,
  paybackPeriod: quoteData.paybackPeriod,
  
  // NEW: Complete quote data (Phase 1)
  quoteData: {
    inputs: {
      postcode: quoteData.postcode,
      location: quoteData.location,
      electricityValue: quoteData.electricityValue,
      roofType: quoteData.roofType,
      roofTilt: quoteData.roofTilt,
      panelOrientation: quoteData.panelOrientation,
      shadingLevel: quoteData.shadingLevel,
      // ... all input fields
    },
    results: {
      recommendedSystemSize: quoteData.recommendedSystemSize,
      numberOfPanels: quoteData.numberOfPanels,
      upfrontCost: quoteData.upfrontCost,
      finalCost: quoteData.finalCost,
      annualSavings: quoteData.annualSavings,
      paybackPeriod: quoteData.paybackPeriod,
      // ... all calculated results
    },
    timestamp: new Date().toISOString(),
    version: '1.0', // For future compatibility
  }
}
```

---

## 🚨 IMMEDIATE TODO

1. ✅ **Audit complete** - Issues identified
2. ⏳ **Add `quoteData Json?` field to Prisma schema**
3. ⏳ **Run migration**: `npx prisma migrate dev`
4. ⏳ **Update lead-service.ts** to accept and store quoteData
5. ⏳ **Verify data is being saved** in database
6. ⏳ **Update admin dashboard** to display quote details

---

## 📊 IMPACT ANALYSIS

### **Before Fix**:
- 🔴 **Data Loss**: 90% of quote data discarded
- 🔴 **Installer Confusion**: No context on what homeowner expects
- 🔴 **Poor Lead Quality**: Missing critical details
- 🔴 **Bad UX**: Homeowner must re-explain everything to installer

### **After Fix**:
- ✅ **Zero Data Loss**: Complete quote preserved
- ✅ **Installer Clarity**: Full context provided
- ✅ **High Lead Quality**: All details available
- ✅ **Better UX**: Installer knows exact requirements

---

**Next Steps**: Awaiting your approval to implement Phase 1 (add quoteData JSON field)?
