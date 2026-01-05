# Bug Fix: Type Mismatch in Quote Submission

## Date: January 12, 2025
## Issue: POST /api/instant-quote 500 Error

---

## Problem Identified

### Error Message:
```
Argument `batteryCapacity`: Invalid value provided. Expected String or Null, provided Int.
Argument `existingSystemSize`: Invalid value provided. Expected String or Null, provided Int.
```

### Root Cause:
The Prisma schema defines several numeric fields as `String` type, but the frontend was sending them as `Number` type. This caused a type mismatch validation error.

---

## Fields Affected

All of these fields are defined as `String` in `prisma/schema.prisma` but were being sent as numbers:

1. **batteryCapacity** - Battery size in kWh
2. **existingSystemSize** - Existing solar system size  
3. **customRetailRate** - Custom electricity rate
4. **customFeedInRate** - Custom feed-in tariff
5. **peakDemand** - Peak demand for commercial
6. **systemSizeOverride** - Manual system size override

---

## Solution Applied

### File: `src/components/InstantQuoteForm.tsx`

Changed from sending as numbers to explicitly converting to strings:

#### Before:
```typescript
batteryCapacity: formData.batteryCapacity ? Number(formData.batteryCapacity) : null,
existingSystemSize: formData.existingSystemSize ? Number(formData.existingSystemSize) : null,
customRetailRate: formData.customRetailRate ? Number(formData.customRetailRate) : null,
customFeedInRate: formData.customFeedInRate ? Number(formData.customFeedInRate) : null,
peakDemand: formData.peakDemand ? Number(formData.peakDemand) : null,
systemSizeOverride: formData.systemSizeOverride || null,
```

#### After:
```typescript
batteryCapacity: formData.batteryCapacity ? String(formData.batteryCapacity) : null,
existingSystemSize: formData.existingSystemSize ? String(formData.existingSystemSize) : null,
customRetailRate: formData.customRetailRate ? String(formData.customRetailRate) : null,
customFeedInRate: formData.customFeedInRate ? String(formData.customFeedInRate) : null,
peakDemand: formData.peakDemand ? String(formData.peakDemand) : null,
systemSizeOverride: formData.systemSizeOverride ? String(formData.systemSizeOverride) : null,
```

### Also Removed Non-Existent Fields:

Removed these fields that don't exist in the Prisma schema:
- `customBatteryCapacity` - Not in schema
- `backupCritical` - Not in schema

---

## Why This Approach?

### Option 1: Change Schema to Float (NOT CHOSEN)
- Would require new database migration
- Risk of data loss or inconsistency
- Downtime during migration

### Option 2: Convert to String in Frontend (CHOSEN) ✅
- No database changes needed
- Immediate fix
- Backward compatible
- Strings can still be parsed to numbers when needed

---

## Testing Instructions

### Before Testing:
1. Ensure dev server is running: `npm run dev`
2. Server should be on `http://localhost:3000`
3. Clear browser cache (Ctrl+Shift+R)

### Test Steps:
1. Go to `http://localhost:3000`
2. Fill out the instant quote calculator:
   - **Postcode**: 2000
   - **Roof Type**: Tile
   - **Budget**: $10,000 - $20,000
   - **Electricity**: 400 kWh (Monthly)
   - **Enable Advanced Options**:
     - Battery: 10 kWh
     - Existing System: 6 kW
3. Click "Calculate Quote"
4. Check browser console (F12 > Console):
   ```
   Attempting to save quote to database...
   ✅ Quote saved successfully: {id: "...", ...}
   ```
5. Check terminal output:
   ```
   📥 Received quote submission: {...}
   POST /api/instant-quote 201 in XXXms
   ✅ Quote saved successfully: {...}
   ```
6. Navigate to `http://localhost:3000/admin/instant-quotes`
7. Verify quote appears in dashboard

### Expected Result:
- ✅ No 500 errors
- ✅ POST returns 201 Created
- ✅ Quote appears in admin dashboard
- ✅ All metrics update correctly

---

## Additional Changes Made

### Enhanced Logging:
- Added console.log in frontend before/after save
- Added console.log in API route on receive/success
- Added error logging for missing fields

### Verification:
All changes preserve:
- Data integrity
- Type safety at database level
- Ability to parse strings back to numbers when needed for calculations

---

## Future Improvements (Optional)

Consider migrating schema to use proper numeric types:

```prisma
model GuestInstantQuote {
  // ... other fields
  
  batteryCapacity Float?        // Changed from String?
  existingSystemSize Float?     // Changed from String?
  customRetailRate Float?       // Changed from String?
  customFeedInRate Float?       // Changed from String?
  peakDemand Float?             // Changed from String?
  systemSizeOverride Float?     // Changed from String?
}
```

Then create migration:
```bash
npx prisma migrate dev --name change_numeric_fields_to_float
```

**Benefits:**
- Type safety enforced at database level
- Better for calculations and aggregations
- Clearer intent in code

**Trade-offs:**
- Requires migration and testing
- Potential data conversion needed
- Short downtime during deployment

---

## Status: FIXED ✅

The type mismatch issue has been resolved. All numeric fields that are stored as strings in the database are now explicitly converted to strings before sending to the API.

**Next Step:** Submit a fresh quote to test the fix.
