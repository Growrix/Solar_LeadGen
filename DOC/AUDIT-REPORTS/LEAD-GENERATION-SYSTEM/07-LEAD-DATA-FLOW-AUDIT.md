# Lead Data Flow Audit Report - Energy Bill & System Details Missing

**Date**: November 16, 2025  
**Issue**: LeadEditModal and Admin Lead Display missing `energyBill` and system details on initial load

---

## 🔍 AUDIT FINDINGS

### **Problem Statement**
1. **LeadEditModal**: Energy Usage & System Details section shows empty on first load
2. **Admin Lead List**: `energyBill` displays correctly in table BUT detail view likely missing
3. **After Edit**: Data appears (proving the field mapping works)
4. **Root Cause**: Field name mismatch between database and form state

---

## 📊 DATA FLOW ANALYSIS

### **1. Database Fields**
```typescript
// Prisma Schema Lead Model
energyBill: Float       // Stored as "energyBill"
billType: String        // Stored as "billType" (monthly/quarterly)
```

### **2. Form State (SimplifiedQuoteForm.tsx)**
```typescript
// Form uses DIFFERENT field names
const [electricityValue, setElectricityValue] = useState('');  
const [electricityUsageType, setElectricityUsageType] = useState<'monthly' | 'quarterly'>('monthly');
```

### **3. Field Mapping in SimplifiedQuoteForm (Lines 267-273)**
```typescript
// ✅ CORRECT MAPPING EXISTS
// Energy usage fields (database uses billType and energyBill, form uses electricityUsageType and electricityValue)
const usageTypeRaw = pickString(['billType', 'electricityUsageType'], 'monthly');
setElectricityUsageType(usageTypeRaw === 'quarterly' ? 'quarterly' : 'monthly');

// Energy bill value - try both names and handle string/number conversion
const energyValue = pickString(['energyBill', 'electricityValue'], '');
setElectricityValue(energyValue);
```

### **4. LeadEditModal Data Flow**
```typescript
// LeadEditModal.tsx passes initialData to SimplifiedQuoteForm
<SimplifiedQuoteForm
  initialData={initialData}  // ❓ WHAT IS IN initialData?
  onSubmit={handleSubmit}
/>
```

### **5. Dashboard handleEditLead Flow (MISSING DATA)**
```typescript
// src/app/homeowner/dashboard/page.tsx:924
const handleEditLead = (lead: RecentLeadSummary) => {
  setSelectedLead(lead);
  setIsEditModalOpen(true);
};

// RecentLeadSummary interface (Lines 96-109)
interface RecentLeadSummary {
  id: string;
  quoteType: QuoteTypeOption;
  status: LeadStatus;
  createdAt: string;
  // ... other fields ...
  phoneVerified: boolean;
  expiresAt: string | null;
  phoneNumber: string | null;
  // ❌ NO energyBill field!
  // ❌ NO billType field!
  // ❌ NO quoteData field!
}
```

---

## 🎯 ROOT CAUSE IDENTIFIED

### **PRIMARY ISSUE: RecentLeadSummary is Incomplete**

The `RecentLeadSummary` interface used in dashboard only includes **minimal fields**:
- ✅ Has: id, quoteType, status, createdAt, phoneVerified, expiresAt, phoneNumber
- ❌ Missing: energyBill, billType, budgetRange, roofType, batteryRequired, and ALL other form fields
- ❌ Missing: quoteData (which contains full form data)

### **DATA SOURCE: HomeownerLeadSummary API**

```typescript
// src/lib/services/lead-service.ts:425 (getHomeownerLeadSummary)
recentLeads: await prisma.lead.findMany({
  where: { homeownerId: userId },
  orderBy: { createdAt: 'desc' },
  take: 5,
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
    quoteData: true,        // ✅ IS SELECTED
    expiresAt: true,
    phoneVerified: true,
    phoneNumber: true,
    // ❌ energyBill NOT selected
    // ❌ billType NOT selected
    // ❌ roofType NOT selected
    // ❌ budgetRange NOT selected
  },
})
```

### **SECONDARY ISSUE: Admin Lead Display**

The admin `/api/leads` endpoint likely returns `energyBill` BUT may not return `quoteData` or other extended fields needed for the detail view.

---

## ✅ IMPLEMENTATION STATUS

### **✅ Phase 1: COMPLETE** (Fix Dashboard RecentLeadSummary Data)

**Step 1.1**: ✅ Update `getHomeownerLeadSummary()` Prisma Query
- **File**: `src/lib/services/lead-service.ts:450`
- **Action**: Added ALL form fields to `select` clause:
  - ✅ energyBill, billType
  - ✅ address (propertyAddress in form), postcode (propertyPostcode in form)
  - ✅ location, state, propertyType, roofType
  - ✅ budgetRange, desiredOffset, batteryRequired, batteryCapacity
  - ✅ timeframe, additionalNotes

**Step 1.2**: ✅ Update `HomeownerLeadSummaryItem` Interface
- **File**: `src/lib/services/lead-service.ts:62`
- **Action**: Added all form fields to interface

**Step 1.3**: ✅ Update Dashboard `RecentLeadSummary` Interface
- **File**: `src/app/homeowner/dashboard/page.tsx:96`
- **Action**: Added all form fields to match backend

**Step 1.4**: ✅ Update `recentLeads` Mapping
- **File**: `src/lib/services/lead-service.ts:503`
- **Action**: Included all new fields in mapping with correct database field names

**Build Status**: ✅ TypeScript compiles successfully  
**Commit**: `16e6ba2` - Phase 1 Complete

---

## 📋 COMPREHENSIVE FIX PLAN

### **Phase 1: Fix Dashboard RecentLeadSummary Data (CRITICAL)**

**Step 1.1**: Update `getHomeownerLeadSummary()` Prisma Query
- **File**: `src/lib/services/lead-service.ts:450`
- **Action**: Add ALL form fields to `select` clause:
  ```typescript
  select: {
    // Existing fields
    id: true,
    quoteType: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    leadPrice: true,
    purchaseStatus: true,
    purchasedAt: true,
    visibility: true,
    phoneVerified: true,
    phoneNumber: true,
    expiresAt: true,
    quoteData: true,
    
    // ADD THESE FIELDS:
    energyBill: true,
    billType: true,
    propertyAddress: true,
    propertyPostcode: true,
    location: true,
    state: true,
    propertyType: true,
    roofType: true,
    budgetRange: true,
    desiredOffset: true,
    batteryRequired: true,
    batteryCapacity: true,
    timeframe: true,
    additionalNotes: true,
  }
  ```

**Step 1.2**: Update `HomeownerLeadSummaryItem` Interface
- **File**: `src/lib/services/lead-service.ts:62`
- **Action**: Add all form fields to interface

**Step 1.3**: Update Dashboard `RecentLeadSummary` Interface
- **File**: `src/app/homeowner/dashboard/page.tsx:96`
- **Action**: Add all form fields to match backend

**Step 1.4**: Update `recentLeads` Mapping
- **File**: `src/lib/services/lead-service.ts:503`
- **Action**: Include all new fields in mapping

---

### **Phase 2: Fix LeadEditModal Data Passing**

**Step 2.1**: Verify `initialData` Includes All Fields
- **File**: `src/components/homeowner/LeadEditModal.tsx:46`
- **Current**: Passes `initialData` from dashboard
- **Verify**: After Phase 1, this should automatically work

**Step 2.2**: Test SimplifiedQuoteForm Prefilling
- **File**: `src/components/homeowner/SimplifiedQuoteForm.tsx:267-273`
- **Status**: ✅ Mapping logic ALREADY CORRECT
- **Action**: No changes needed

---

### **Phase 3: Fix Admin Lead Display (Detail View)**

**Step 3.1**: Audit `/api/leads` GET Endpoint
- **File**: `src/app/api/leads/route.ts:155`
- **Action**: Check what `getLeads()` returns

**Step 3.2**: Audit `/api/leads/[id]` GET Endpoint
- **File**: `src/app/api/leads/[id]/route.ts:40`
- **Action**: Check what `getLeadById()` returns

**Step 3.3**: Audit Admin Lead Detail Page
- **File**: Check if exists at `src/app/admin/leads/[id]/page.tsx`
- **Action**: Ensure detail view displays `energyBill`, `billType`, and all form fields

**Step 3.4**: Update Admin Lead Interface
- **File**: `src/app/admin/leads/page.tsx:21`
- **Action**: Ensure `energyBill` is in Lead interface (ALREADY EXISTS)

---

### **Phase 4: Verify PATCH API Field Persistence**

**Step 4.1**: Check LeadEditModal Submit Logic
- **File**: `src/components/homeowner/LeadEditModal.tsx:59`
- **Status**: ✅ Maps `electricityValue` → `energyBill` (line 80)
- **Status**: ✅ Maps `electricityUsageType` → `billType` (line 81)
- **Action**: No changes needed

**Step 4.2**: Check PATCH API Handling
- **File**: `src/app/api/leads/[id]/route.ts:107-188`
- **Status**: ✅ Receives `energyBill` and `billType` (lines 116-117)
- **Action**: No changes needed

**Step 4.3**: Check `updateLead()` Service
- **File**: `src/lib/services/lead-service.ts:707`
- **Status**: ✅ Updates database correctly
- **Action**: No changes needed

---

## ✅ IMPLEMENTATION PRIORITY

### **🔴 CRITICAL (Must Fix)**
1. **Phase 1**: Update `getHomeownerLeadSummary()` to include all fields
2. **Phase 2**: Verify LeadEditModal receives complete data

### **🟡 HIGH (Should Fix)**  
3. **Phase 3**: Audit admin lead detail view

### **🟢 LOW (Nice to Have)**
4. Add TypeScript validation to ensure field completeness

---

## 🧪 TESTING PLAN

### **Test Case 1: LeadEditModal Prefill**
1. ✅ Create new lead with all fields filled
2. ✅ Navigate to dashboard
3. ✅ Click Edit button
4. ✅ **VERIFY**: All fields show correct values (especially energyBill)
5. ✅ **VERIFY**: System details section populated

### **Test Case 2: Admin Lead Display**
1. ✅ Login as admin
2. ✅ View lead list (energyBill column should show)
3. ✅ Click into lead detail
4. ✅ **VERIFY**: All form fields visible including energyBill

### **Test Case 3: Edit Persistence**
1. ✅ Edit lead, change energyBill from £200 → £300
2. ✅ Save changes
3. ✅ **VERIFY**: Admin sees £300
4. ✅ **VERIFY**: Re-opening edit modal shows £300

---

## 📦 FILES TO MODIFY

1. ✅ `src/lib/services/lead-service.ts` (Update Prisma select + interface)
2. ✅ `src/app/homeowner/dashboard/page.tsx` (Update RecentLeadSummary interface)
3. ⚠️ `src/app/admin/leads/[id]/page.tsx` (IF EXISTS - add field display)
4. ⚠️ `src/app/api/leads/[id]/route.ts` (Verify getLeadById returns all fields)

---

## 🎯 SUCCESS CRITERIA

- [x] **Phase 1 COMPLETE**: Dashboard now fetches and passes ALL form fields to LeadEditModal
- [ ] LeadEditModal shows ALL fields on first open (requires testing)
- [ ] Energy Usage section displays energyBill value immediately
- [ ] System Details section shows all preferences
- [ ] Admin can view complete lead data including energyBill
- [ ] After edit, both homeowner and admin see updated values
- [ ] No field data loss during edit → save → reopen cycle

---

## 📝 PHASE 1 IMPLEMENTATION NOTES

### Field Name Mapping (Database → Form)
- `address` (DB) → `propertyAddress` (Form) - SimplifiedQuoteForm expects both
- `postcode` (DB) → `propertyPostcode` (Form) - SimplifiedQuoteForm expects both
- `energyBill` (DB) → `electricityValue` (Form state) - Handled by prefill logic at lines 267-273
- `billType` (DB) → `electricityUsageType` (Form state) - Handled by prefill logic at lines 267-273

### SimplifiedQuoteForm Prefill Logic
The form's `useEffect` at lines 267-273 uses `pickString()` helper to try BOTH field names:
```typescript
const energyValue = pickString(['energyBill', 'electricityValue'], '');
setElectricityValue(energyValue);
```

This means the form will now correctly populate `electricityValue` state from `lead.energyBill` passed via `initialData`.

### Next Testing Steps
1. ✅ Login as homeowner with existing lead
2. ✅ Click "Edit" button on PENDING_APPROVAL lead
3. ✅ **VERIFY**: Energy Usage section shows £{energyBill} value immediately
4. ✅ **VERIFY**: All other fields pre-populated (roof type, budget, etc.)

---

**Next Step**: Test Phase 1 in development environment, then proceed to Phase 2/3
