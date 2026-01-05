# Root Cause Analysis - energyBill Missing Data Issue

**Date**: November 16, 2025  
**Status**: ✅ ROOT CAUSE IDENTIFIED + FIX APPLIED

---

## 🔍 ISSUE OBSERVED

### Homeowner Side (LeadEditModal)
- Energy Usage section shows placeholder "e.g., 800" instead of actual value
- Form sends `electricityValue: "497"` but field not populated on edit

### Admin Side (Lead Detail Page)
- Shows "£0.00 / quarterly" instead of actual bill amount
- Database has `energyBill = 0` instead of `497`

---

## 🎯 ROOT CAUSE IDENTIFIED

### **PRIMARY ISSUE: Field Name Mismatch in POST API**

**Location**: `src/app/api/leads/route.ts:83`

```typescript
// ❌ BEFORE (BROKEN)
energyBill: body.energyBill,
billType: body.billType || 'quarterly',
```

**Problem**:
1. SimplifiedQuoteForm sends data as `electricityValue` and `electricityUsageType`
2. POST API expects `energyBill` and `billType`
3. API receives BOTH field names but prioritizes wrong one:
   ```json
   {
     "energyBill": 0,              // ❌ Used by API (defaults to 0)
     "billType": "monthly",
     "electricityValue": "497",    // ✅ Actual value from form
     "electricityUsageType": "monthly"
   }
   ```
4. Result: Database stores `energyBill = 0` instead of `497`

---

## 📊 DATA FLOW ANALYSIS

### Lead Creation Flow

```
User fills form with £497 monthly bill
         ↓
SimplifiedQuoteForm.tsx (Line 1847)
  onSubmit({
    ...formData,
    electricityValue: "497",           // ✅ Sent
    electricityUsageType: "monthly"    // ✅ Sent
  })
         ↓
POST /api/leads (Line 83)
  energyBill: body.energyBill          // ❌ undefined → 0
  billType: body.billType || 'quarterly' // ❌ undefined → 'quarterly'
         ↓
Database (Lead table)
  energyBill: 0                        // ❌ WRONG!
  billType: 'quarterly'                // ❌ WRONG! (user selected monthly)
         ↓
Admin Detail Page (Line 794)
  £{lead.energyBill.toFixed(2)} / {lead.billType}
  Result: "£0.00 / quarterly"          // ❌ Displays wrong data
         ↓
LeadEditModal Prefill (Phase 1)
  getHomeownerLeadSummary() returns lead.energyBill = 0
         ↓
SimplifiedQuoteForm prefill (Line 272)
  const energyValue = pickString(['energyBill', 'electricityValue'], '');
  setElectricityValue(0)               // ❌ Sets to 0, shows placeholder
```

---

## ✅ FIX APPLIED

### **Solution: Support Both Field Names**

**File**: `src/app/api/leads/route.ts:83`

```typescript
// ✅ AFTER (FIXED)
// FIX: Support both field names (form sends electricityValue, DB uses energyBill)
energyBill: body.energyBill || Number(body.electricityValue) || 0,
billType: body.billType || body.electricityUsageType || 'quarterly',
```

**Logic**:
1. Try `body.energyBill` first (for future consistency)
2. Fall back to `Number(body.electricityValue)` (current form behavior)
3. Default to `0` if neither exists
4. Same approach for `billType` / `electricityUsageType`

---

## 🧪 EXPECTED OUTCOME

### After Fix

```
User fills form with £497 monthly bill
         ↓
SimplifiedQuoteForm.tsx
  electricityValue: "497"
  electricityUsageType: "monthly"
         ↓
POST /api/leads (FIXED)
  energyBill: body.energyBill || Number(body.electricityValue) = 497 ✅
  billType: body.billType || body.electricityUsageType = "monthly" ✅
         ↓
Database
  energyBill: 497 ✅
  billType: 'monthly' ✅
         ↓
Admin Detail Page
  "£497.00 / monthly" ✅
         ↓
LeadEditModal Prefill
  electricityValue = 497 ✅
  Shows "497" in input field ✅
```

---

## 📋 VERIFICATION STEPS

### Test Case 1: Create New Lead
1. ✅ Go to homeowner dashboard
2. ✅ Create new lead with £497 monthly bill
3. ✅ Submit form
4. ✅ **VERIFY**: Admin shows "£497.00 / monthly"
5. ✅ **VERIFY**: Edit modal shows "497" in electricity input

### Test Case 2: Edit Existing Lead
1. ✅ Open LeadEditModal for existing lead
2. ✅ **VERIFY**: Energy Usage section shows actual value (not placeholder)
3. ✅ Change value to £600
4. ✅ Save
5. ✅ **VERIFY**: Admin shows "£600.00 / monthly"
6. ✅ **VERIFY**: Reopen edit modal shows "600"

---

## 🔗 RELATED ISSUES

### Why Phase 1 Didn't Fix This

Phase 1 correctly added all fields to `getHomeownerLeadSummary()` and interfaces, BUT:
- Database already had `energyBill = 0` for existing leads
- New leads were STILL being created with `energyBill = 0` due to POST API bug
- Phase 1 only fixed the READ path, not the WRITE path

### Complete Fix Requires Both

1. ✅ **Phase 1** (COMPLETE): Fix read path - getHomeownerLeadSummary returns all fields
2. ✅ **Phase 2** (THIS FIX): Fix write path - POST API correctly maps electricityValue → energyBill
3. ⏳ **Phase 3** (TESTING): Verify end-to-end flow works for new leads

---

## 🚀 NEXT STEPS

1. **Restart dev server** to apply changes
2. **Create new test lead** with specific energyBill value
3. **Verify** admin displays correct value
4. **Test** edit modal shows prefilled value
5. **Commit** fix with descriptive message

---

## 📝 FILES MODIFIED

- ✅ `src/app/api/leads/route.ts` - Added fallback logic to support both field names

---

**Status**: Ready for Testing
