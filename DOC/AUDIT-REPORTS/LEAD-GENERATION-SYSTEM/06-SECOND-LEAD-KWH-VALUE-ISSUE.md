# Audit Report: Second Lead kWh Value Not Showing Correctly in Edit Modal

**Date:** November 16, 2025  
**Auditor:** AI Agent  
**Priority:** P1 (High - Data Integrity Issue)  
**Status:** Root Cause Identified, Fix Ready

---

## Executive Summary

**Issue:** When a homeowner creates a second lead with a different kWh value, the edit modal shows the first lead's kWh value instead of the unique value for that specific lead.

**Root Cause:** Field name mismatch in dashboard payload builder (`electricityUsage` vs `electricityValue`).

**Impact:** Each lead's unique energy usage data is not persisted correctly to the database, causing edit modal prefill to show incorrect values.

**Fix Complexity:** Low (single field name correction)

---

## 1. Issue Description

### User Report
- ✅ **First lead:** User creates lead with kWh value `960` → Edit modal shows `960` ✓
- ❌ **Second lead:** User creates lead with kWh value `550` → Edit modal shows `0` or wrong value ✗

### Expected Behavior
Each lead should store and display its own unique `energyBill` value based on user input (`electricityValue` from SimplifiedQuoteForm).

### Actual Behavior
Second+ leads are created with `energyBill: 0` because the dashboard handler payload is looking for the wrong field name.

---

## 2. Data Flow Audit

### 2.1 SimplifiedQuoteForm (Frontend Form)
**File:** `src/components/homeowner/SimplifiedQuoteForm.tsx`

**State Variables:**
```typescript
const [electricityValue, setElectricityValue] = useState(''); // User input
const [electricityUsageType, setElectricityUsageType] = useState<'monthly' | 'quarterly'>('monthly');
```

**Form Submission:**
- Form sends: `electricityValue` and `electricityUsageType`
- These values are included in the `quoteData` object returned by `onSubmit`

**Prefill Logic (Lines 274-276):**
```typescript
// Energy bill value - try both names and handle string/number conversion
const energyValue = pickString(['energyBill', 'electricityValue'], '');
setElectricityValue(energyValue);
```
✅ **Prefill works correctly** - tries both `energyBill` and `electricityValue`.

---

### 2.2 Dashboard Handler (Second Lead Submission)
**File:** `src/app/homeowner/dashboard/page.tsx`  
**Function:** `handleDistributionSubmit` (Lines 900-950)

**Payload Builder (Line 913):**
```typescript
const payload = {
  quoteType,
  quoteData: pendingQuoteData,
  propertyPostcode: pendingQuoteData?.postcode || '',
  location: pendingQuoteData?.location || '',
  state: pendingQuoteData?.state || '',
  propertyType: pendingQuoteData?.propertyType || 'residential',
  roofType: pendingQuoteData?.roofType || '',
  energyBill: pendingQuoteData?.electricityUsage || 0, // ❌ BUG: electricityUsage doesn't exist
  billType: pendingQuoteData?.electricityUsageType || 'quarterly',
  budgetRange: pendingQuoteData?.budgetRange || '',
  desiredOffset: pendingQuoteData?.desiredOffset || 100,
  batteryRequired: pendingQuoteData?.batteryIncluded || false,
  batteryCapacity: pendingQuoteData?.batteryCapacity || '',
};
```

❌ **BUG FOUND:** Line 913 reads `pendingQuoteData?.electricityUsage` but SimplifiedQuoteForm sends `electricityValue`.

**Result:** `energyBill` defaults to `0` for all second+ leads.

---

### 2.3 POST API (Lead Creation)
**File:** `src/app/api/leads/route.ts`  
**Lines:** 91-93

```typescript
// FIX: Convert to Number - handle both string and number inputs
energyBill: Number(body.energyBill) || Number(body.electricityValue) || 0,
billType: body.billType || body.electricityUsageType || 'quarterly',
```

✅ **POST API handles both names correctly** - tries `body.energyBill` first, then `body.electricityValue`.

**However:** If dashboard sends `energyBill: 0`, the API will save `0` to database.

---

### 2.4 getHomeownerLeadSummary (Database Read)
**File:** `src/lib/services/lead-service.ts`  
**Lines:** 443-555

**Prisma Select (Lines 481-494):**
```typescript
select: {
  id: true,
  quoteType: true,
  status: true,
  // ... other fields ...
  energyBill: true, // ✅ Correctly selected
  billType: true,
  address: true,
  postcode: true,
  // ... other fields ...
}
```

✅ **Database read is correct** - fetches `energyBill` and all form fields.

**Mapping (Lines 534-554):**
```typescript
recentLeads: recentLeads.map(lead => ({
  id: lead.id,
  quoteType: lead.quoteType as 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING',
  // ... other fields ...
  energyBill: lead.energyBill, // ✅ Correctly mapped
  billType: lead.billType,
  // ... other fields ...
})),
```

✅ **Mapping is correct** - returns `energyBill` from database.

---

### 2.5 Edit Modal Prefill
**File:** `src/app/homeowner/dashboard/page.tsx`  
**Lines:** 1370-1377

**initialData Builder:**
```typescript
initialData={{
  // Merge quoteData (has form inputs) with top-level fields (has database values)
  // This ensures SimplifiedQuoteForm prefill can find energyBill/billType
  ...selectedLead.quoteData,
  ...selectedLead, // Top-level fields override quoteData
}}
```

✅ **initialData merge is correct** - spreads `quoteData` first, then top-level fields (including `energyBill` from database).

**Result:** SimplifiedQuoteForm receives `energyBill: 0` (from database) and prefills with that incorrect value.

---

## 3. Root Cause Analysis

### Primary Issue
**File:** `src/app/homeowner/dashboard/page.tsx`  
**Line:** 913  
**Bug:** `energyBill: pendingQuoteData?.electricityUsage || 0`

**Should be:** `energyBill: Number(pendingQuoteData?.electricityValue) || 0`

### Why First Lead Works
- **First lead** uses `SimplifiedQuoteFormModal` → calls POST API directly with `quoteData` object
- **POST API** correctly extracts `electricityValue` from `body.quoteData` or `body.electricityValue`
- Result: First lead saves correct `energyBill`

### Why Second+ Leads Fail
- **Second+ leads** use `QuoteTypeDistributionModal` → calls `handleDistributionSubmit`
- **handleDistributionSubmit** manually builds payload with wrong field name (`electricityUsage`)
- **POST API** receives `energyBill: 0` in body → saves `0` to database
- Result: Second+ leads have `energyBill: 0`

---

## 4. Fix Plan

### 4.1 Immediate Fix (Required)
**File:** `src/app/homeowner/dashboard/page.tsx`  
**Line:** 913

**Change:**
```typescript
// BEFORE (BUG):
energyBill: pendingQuoteData?.electricityUsage || 0,

// AFTER (FIX):
energyBill: Number(pendingQuoteData?.electricityValue) || 0,
```

**Rationale:**
- SimplifiedQuoteForm sends `electricityValue`, not `electricityUsage`
- Convert to `Number` for type safety (Prisma expects `Float`)
- Keep `|| 0` fallback for safety

---

### 4.2 Verification Steps

**Before deploying fix:**
1. ✅ Verify `SimplifiedQuoteForm` sends `electricityValue` in returned data
2. ✅ Verify POST API accepts `electricityValue` or `energyBill`
3. ✅ Verify database field is `energyBill` (Float)
4. ✅ Verify prefill logic tries both names

**After deploying fix:**
1. **Test Scenario 1:** Create first lead with kWh `960` → Edit modal shows `960` ✓
2. **Test Scenario 2:** Create second lead with kWh `550` → Edit modal shows `550` ✓
3. **Test Scenario 3:** Edit second lead to `750` → Save → Reopen → Shows `750` ✓
4. **Test Scenario 4:** Admin views lead details → Correct kWh shown ✓

---

## 5. Prevention Measures

### 5.1 Field Naming Consistency
**Current inconsistency:**
- Database: `energyBill`, `billType`
- Form: `electricityValue`, `electricityUsageType`
- API: Accepts both names

**Recommendation:** Document field name mappings in `DOC/DATA-FIELD-MAPPINGS.md`:
```
| Database       | Form Component         | API Body (accepts)       |
|----------------|------------------------|--------------------------|
| energyBill     | electricityValue       | energyBill, electricityValue |
| billType       | electricityUsageType   | billType, electricityUsageType |
| address        | propertyAddress        | address, propertyAddress |
| postcode       | propertyPostcode       | postcode, propertyPostcode |
```

### 5.2 Type Safety Enhancement
Add TypeScript interface for payload builder:

```typescript
interface LeadSubmissionPayload {
  quoteType: QuoteTypeOption;
  quoteData: Record<string, unknown>;
  propertyPostcode: string;
  location: string;
  state: string;
  propertyType: string;
  roofType: string;
  energyBill: number; // Force number type
  billType: 'monthly' | 'quarterly';
  budgetRange: string;
  desiredOffset: number;
  batteryRequired: boolean;
  batteryCapacity: string;
}
```

### 5.3 Testing Checklist
Add to `specs/006-component-by-component/tasks.md`:

```markdown
**Post-Lead-Creation Testing (MANDATORY):**
- [ ] Create first lead with specific kWh value (e.g., 960)
- [ ] Edit first lead → Verify prefill shows 960
- [ ] Create second lead with different kWh value (e.g., 550)
- [ ] Edit second lead → Verify prefill shows 550 (not 960 or 0)
- [ ] Admin views both leads → Verify correct kWh shown for each
- [ ] Edit second lead to new value (e.g., 750) → Save → Verify persistence
```

---

## 6. Impact Assessment

### Data Integrity
- ❌ **Existing leads:** All second+ leads in production have `energyBill: 0`
- ✅ **Fix will prevent:** Future leads will save correct values
- ⚠️ **Requires:** Manual data migration if historical accuracy is needed

### User Experience
- **Before fix:** Homeowners see wrong kWh values in edit modal → Confusion
- **After fix:** Each lead shows its own unique kWh value → Accurate prefill

### Admin Experience
- **Before fix:** Admin sees `energyBill: 0` for second+ leads → Cannot properly price/approve
- **After fix:** Admin sees correct kWh for all leads → Proper pricing/approval

---

## 7. Implementation Checklist

- [ ] Apply fix to `src/app/homeowner/dashboard/page.tsx` line 913
- [ ] Test scenario 1 (first lead)
- [ ] Test scenario 2 (second lead with different kWh)
- [ ] Test scenario 3 (edit and save second lead)
- [ ] Test scenario 4 (admin view)
- [ ] Commit with message: "fix: Use electricityValue not electricityUsage for second+ lead energyBill - Each lead now saves its unique kWh value"
- [ ] Update `DOC/Prompts/gitstatus.md` with commit info
- [ ] Document in `specs/006-component-by-component/tasks.md` as new phase
- [ ] (Optional) Create data migration script for existing leads with `energyBill: 0`

---

## 8. Related Files

**Modified:**
- `src/app/homeowner/dashboard/page.tsx` (Line 913)

**Verified Correct:**
- `src/components/homeowner/SimplifiedQuoteForm.tsx` (Prefill logic)
- `src/app/api/leads/route.ts` (POST handler)
- `src/lib/services/lead-service.ts` (getHomeownerLeadSummary)
- `src/components/homeowner/LeadEditModal.tsx` (PATCH handler)

**No Changes Needed:**
- POST API already handles both field names
- Prefill logic already tries both names
- Database schema is correct

---

## 9. Success Criteria

✅ **Fix is successful when:**
1. First lead created with kWh `960` → Edit modal prefills with `960`
2. Second lead created with kWh `550` → Edit modal prefills with `550` (not `960` or `0`)
3. Third lead created with kWh `1200` → Edit modal prefills with `1200`
4. Edit any lead → Change kWh → Save → Reopen → New value persists
5. Admin views all leads → Each shows its correct unique kWh value
6. No TypeScript errors
7. `npx tsc --noEmit` passes
8. `npm run build` succeeds

---

## 10. Conclusion

**Single-line fix resolves the issue:**
- Change `electricityUsage` to `electricityValue` in dashboard payload builder
- Add `Number()` conversion for type safety
- All other components already handle both field names correctly

**Estimated time:** 5 minutes to fix, 15 minutes to test, 10 minutes to document.

**Risk level:** Low (isolated change, defensive coding in API)

**Deployment:** Can be deployed immediately after verification testing passes.
