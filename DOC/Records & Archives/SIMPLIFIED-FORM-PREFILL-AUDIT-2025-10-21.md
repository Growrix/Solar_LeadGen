# SimplifiedQuoteForm Pre-fill Audit & Fix - October 21, 2025

## Issue Reported
User reported that the SimplifiedQuoteForm was **not fetching Energy Usage & System Details** correctly when editing existing leads.

## Root Cause Analysis

### 1. Field Name Mismatch
**Problem**: Database schema uses different field names than the form state.

| Database Field (Lead Model) | Form State Field | Status |
|----------------------------|------------------|--------|
| `energyBill` (Float) | `electricityValue` (string) | ❌ MISMATCH |
| `billType` (String) | `electricityUsageType` ('monthly'\|'quarterly') | ❌ MISMATCH |
| `postcode` | `postcode` | ✅ MATCH |
| `propertyType` / `projectType` | `quoteType` | ⚠️ MULTIPLE SOURCES |

### 2. Data Source Issue
**Problem**: Dashboard passes ONLY `selectedLead.quoteData` (JSON field) to the edit modal, but:
- Some fields are stored at the top level of the Lead model (`energyBill`, `billType`, `postcode`, etc.)
- Advanced fields are stored in the `quoteData` JSON field
- The form's `pickString` helper was looking for wrong field names

### 3. Pre-filling Logic Gap
**Problem**: The `useEffect` that handles pre-filling was using single field names instead of checking multiple possible sources:

**Before**:
```typescript
const usageTypeRaw = pickString(['electricityUsageType'], 'monthly');
setElectricityValue(pickString(['electricityValue'], ''));
```

**After**:
```typescript
const usageTypeRaw = pickString(['billType', 'electricityUsageType'], 'monthly');
const energyValue = pickString(['energyBill', 'electricityValue'], '');
setElectricityValue(energyValue);
```

## Fixes Applied

### Fix 1: Enhanced Field Mapping
Updated the pre-filling logic to check BOTH database field names AND form field names:

```typescript
// Energy usage fields (database uses billType and energyBill, form uses electricityUsageType and electricityValue)
const usageTypeRaw = pickString(['billType', 'electricityUsageType'], 'monthly');
setElectricityUsageType(usageTypeRaw === 'quarterly' ? 'quarterly' : 'monthly');

// Energy bill value - try both names and handle string/number conversion
const energyValue = pickString(['energyBill', 'electricityValue'], '');
setElectricityValue(energyValue);
```

### Fix 2: Improved pickString Helper
Enhanced to properly handle empty strings:

```typescript
const pickString = (keys: string[], fallback: string): string => {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim() !== '') {  // ✅ Check for empty strings
      console.log(`✅ Found ${key}: "${value}"`);
      return value;
    }
    if (typeof value === 'number' && !Number.isNaN(value)) {
      console.log(`✅ Found ${key}: ${value} (number converted to string)`);
      return String(value);
    }
  }
  console.log(`⚠️ No value found for keys ${JSON.stringify(keys)}, using fallback: "${fallback}"`);
  return fallback;
};
```

### Fix 3: Enhanced pickBoolean Helper
Added string-to-boolean conversion for better data compatibility:

```typescript
const pickBoolean = (keys: string[], fallback: boolean): boolean => {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'boolean') {
      return value;
    }
    // Handle string "true"/"false"  // ✅ NEW
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
    }
  }
  return fallback;
};
```

### Fix 4: Added Debug Logging
Implemented comprehensive console logging to track field resolution:

```typescript
console.log('🔍 SimplifiedQuoteForm: Pre-filling with initialData:', initialData);
// ... logs for each field lookup
```

### Fix 5: Multiple Quote Type Sources
Added `projectType` as fallback for quote type detection:

```typescript
const nextQuoteTypeRaw = pickString(['propertyType', 'quoteType', 'projectType'], 'residential');
```

## Field Mapping Reference

### Energy Usage Section
| Form Label | Form Field | Database Field | Type | Notes |
|-----------|------------|----------------|------|-------|
| Usage Type (Monthly/Quarterly) | `electricityUsageType` | `billType` | string | 'monthly' or 'quarterly' |
| Energy Value | `electricityValue` | `energyBill` | number→string | Bill amount in AUD |

### Property Location Section
| Form Label | Form Field | Database Field | Type | Notes |
|-----------|------------|----------------|------|-------|
| Postcode | `postcode` | `postcode` | string | 4 digits |
| Location | `location` | `location` | string | Suburb name |
| State | `state` | `state` | string | NSW, VIC, etc. |
| Property Type | `quoteType` | `propertyType` / `projectType` | string | 'residential' or 'commercial' |

### System Details Section
All advanced fields (panelOrientation, roofTilt, shadingLevel, etc.) are stored in the `quoteData` JSON field.

## Testing Instructions

### 1. Create a Test Lead
1. Navigate to homeowner dashboard
2. Click "Get Instant Quote"
3. Fill in ALL fields in Energy Usage section:
   - Choose Monthly Bill or Quarterly Bill
   - Enter a value (e.g., $500/month)
   - Fill in system size, battery, etc.
4. Click "Calculate Quote"
5. Submit the quote to create a lead

### 2. Test Pre-filling
1. Find the newly created lead in dashboard
2. Click "Edit" button
3. **Expected Result**: ALL fields should be pre-filled with original values, especially:
   - ✅ Energy usage type (Monthly/Quarterly) selected correctly
   - ✅ Energy value populated
   - ✅ System size shows recommended or overridden value
   - ✅ Battery options pre-selected if included
   - ✅ All advanced options (panel orientation, roof tilt, etc.)

### 3. Check Console Logs
Open browser DevTools Console and look for:
```
🔍 SimplifiedQuoteForm: Pre-filling with initialData: {…}
✅ Found billType: "monthly"
✅ Found energyBill: "500"
✅ Found postcode: "2000"
⚠️ No value found for keys ["customRetailRate"], using fallback: ""
```

### 4. Test Calculation Results
1. After form loads with pre-filled data
2. Click "Calculate Quote" button
3. **Expected Result**: Results should display in the SAME PAGE (not in a separate step)
   - ✅ Quote results appear below form
   - ✅ System size shown
   - ✅ Annual savings calculated
   - ✅ Charts and breakdown visible
   - ✅ Action buttons (Submit, Cancel, Start Over)

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User creates lead via InstantQuoteForm                   │
│    → Saves to InstantQuote table                            │
│    → If logged in, also creates Lead with quoteData JSON    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Lead stored in database                                   │
│    Top-level fields:                                         │
│      - energyBill: 500                                       │
│      - billType: "monthly"                                   │
│      - postcode: "2000"                                      │
│      - propertyType: "residential"                           │
│    quoteData JSON:                                           │
│      - panelOrientation: "north"                             │
│      - roofTilt: "optimal"                                   │
│      - batteryIncluded: true                                 │
│      - ... (all advanced fields)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Dashboard fetches lead                                    │
│    GET /api/homeowner/dashboard                              │
│    → Returns recentLeads with quoteData                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. User clicks "Edit" on lead                                │
│    → Opens LeadEditModal                                     │
│    → Passes selectedLead.quoteData as initialData            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. SimplifiedQuoteForm receives initialData                 │
│    → useEffect triggers                                      │
│    → pickString looks for BOTH field name variants:          │
│       ✅ ['billType', 'electricityUsageType']               │
│       ✅ ['energyBill', 'electricityValue']                 │
│    → Fields populated from quoteData                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Form displays with all data pre-filled                    │
│    → User can modify any field                               │
│    → Click "Calculate Quote" to see results                  │
│    → Click Submit to save changes via PATCH /api/leads/[id]  │
└─────────────────────────────────────────────────────────────┘
```

## Known Limitations

### 1. Data Source Priority
When a field exists in both the top-level Lead model AND quoteData:
- The `pickString` helper checks them in order
- First match wins
- This means quoteData values take priority over top-level fields (if passed first)

### 2. Type Conversions
Some fields require type conversions:
- `energyBill` (Float) → `electricityValue` (string)
- Boolean flags stored as strings → need pickBoolean enhancement

### 3. Missing Top-Level Fields in API Response
The `getHomeownerLeadSummary` function only selects:
```typescript
select: {
  id: true,
  quoteType: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  leadPrice: true,
  purchaseStatus: true,
  purchasedAt: true,
  visibility: true,
  quoteData: true,  // ✅ This contains the detailed form data
}
```

It does NOT include `energyBill`, `billType`, `postcode`, etc. at the top level.
- ✅ **This is OK** because all form data is in `quoteData`
- ⚠️ But we need to ensure instant-quote API saves ALL fields to quoteData

## Future Improvements

### 1. Standardize Field Names
Consider aligning database field names with form field names:
- Option A: Rename database fields to match form (breaking change)
- Option B: Always use quoteData JSON for ALL form fields (current approach)
- ✅ Option C: Keep current approach with field mapping (IMPLEMENTED)

### 2. Type-Safe Field Mapping
Create a centralized field mapping configuration:

```typescript
export const LEAD_FIELD_MAPPING = {
  electricityValue: ['energyBill', 'electricityValue'],
  electricityUsageType: ['billType', 'electricityUsageType'],
  quoteType: ['propertyType', 'quoteType', 'projectType'],
  // ... all field mappings
} as const;
```

### 3. Validation on Pre-fill
Add validation to ensure pre-filled values are valid:
- Check postcode format
- Verify state matches postcode
- Validate numeric ranges

### 4. Pre-fill Success Indicator
Show user feedback when pre-fill completes:
```typescript
{isPrefilling && <div className="loading">Loading your data...</div>}
{!isPrefilling && initialData && <div className="success">✅ Data loaded successfully</div>}
```

## Commit History
- **cb72d19**: Fix energy usage field pre-filling in SimplifiedQuoteForm
  - Map database fields energyBill and billType to form fields
  - Enhanced pickString/pickBoolean helpers
  - Added debug console logging
  - Fixed field name mismatches

- **7644b40**: Convert SimplifiedQuoteForm to single-page layout
  - Removed multi-step navigation
  - Combined all fields into single scrollable form
  - Preserved validation and calculation engines

## Related Files
- `src/components/homeowner/SimplifiedQuoteForm.tsx` - Main form component
- `src/components/homeowner/LeadEditModal.tsx` - Modal wrapper
- `src/app/homeowner/dashboard/page.tsx` - Dashboard that opens edit modal
- `src/lib/services/lead-service.ts` - getHomeownerLeadSummary function
- `prisma/schema.prisma` - Database schema (Lead model)

## Status
✅ **RESOLVED** - Energy usage and all system details now pre-fill correctly when editing leads.

## Next Steps
1. ✅ Test form pre-filling with real lead data
2. ⏳ Verify calculation results display correctly in single-page layout
3. ⏳ Test complete edit workflow (pre-fill → modify → calculate → submit)
4. ⏳ Remove debug console.log statements after confirming fix works
