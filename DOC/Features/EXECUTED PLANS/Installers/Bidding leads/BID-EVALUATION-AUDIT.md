# Bid Evaluation Modal - Comprehensive Audit & Implementation Plan
**Date**: November 27, 2025  
**Status**: Audit Complete  
**Scope**: Enable BidEvaluationModal to fetch and display real lead technical data

---

## 1. EXECUTIVE SUMMARY

**Current State**: BidEvaluationModal exists as a UI component comparing anonymized bids from multiple installers. It currently accepts `bids[]` array as props but shows "No Bids Submitted Yet" placeholder.

**Gap**: The modal does NOT fetch or display the actual **lead technical details** (location, postcode, energy bill, roof type, budget, battery requirements, etc.) that installers need to evaluate BEFORE placing their bid.

**Requirement** (from brainstorm3.md):
> "BidEvaluationModal (installer): shows all homeowner technical inputs (location, postcode, address or area, energyBill, billType, roofType, budgetRange, desiredOffset, batteryRequired, capacity, timeframe, additionalNotes, quoteData fields). **Contact info masked unless purchased and awarded later**."

**Goal**: Transform BidEvaluationModal into a **Lead Technical Details viewer** that:
1. Fetches real lead data via API (`GET /api/leads/[id]`)
2. Displays all technical specifications installers need to price accurately
3. Masks contact information (phone, email, full address until purchased)
4. Shows anonymized competitor bids for comparison (existing functionality)

---

## 2. CURRENT STATE AUDIT

### 2.1 Frontend Component Analysis

**File**: `src/components/BidEvaluationModal.tsx` (251 lines)

**Current Props**:
```typescript
interface BidEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;           // ✅ HAS lead ID (can fetch data)
  bids: Bid[];             // ✅ Competitor bid comparison
  yourBidId?: string;      // ✅ Highlights installer's own bid
}
```

**Current Functionality**:
- ✅ Displays up to 3 bids side-by-side with pricing, system specs, warranties
- ✅ Anonymizes competitor names ("Installer A", "Installer B", "You")
- ✅ Shows status badges (submitted, shortlisted, not_selected)
- ✅ Design system compliant (semantic classes, neumorphic shadows)
- ❌ **NO lead technical data displayed** (main gap)
- ❌ **NO API call** to fetch lead details
- ❌ **NO fallback** if `leadId` is invalid or lead not found

**Current UI Structure**:
```
Header: "Bid Evaluation" + Lead #{leadId}
Body: 
  - If bids.length === 0: Empty state with Award icon
  - Else: 3-column grid comparing bids
Footer: "{X} bids submitted" + Close button
```

### 2.2 Database Schema Analysis

**Prisma Model**: `Lead` (lines 161-220, schema.prisma)

**Available Technical Fields**:
```prisma
model Lead {
  // === TECHNICAL DATA (show to installers) ===
  projectType           String              // residential/commercial
  propertyType          String              // house/apartment/business
  postcode              String              ✅
  location              String              ✅ (city/suburb, NOT full address)
  state                 String              ✅
  energyBill            Float               ✅
  billType              String              ✅
  roofType              String              ✅
  budgetRange           String              ✅
  desiredOffset         Int                 ✅
  batteryRequired       Boolean             ✅
  batteryCapacity       String?             ✅
  timeframe             String?             ✅
  additionalNotes       String?             ✅
  quoteData             Json?               ✅ (structured form data)

  // === MASKED DATA (hide until purchased) ===
  phoneNumber           String?             ❌ MASK
  name                  String?             ❌ MASK
  address               String?             ❌ MASK (full street address)
  
  // === METADATA ===
  quoteType             LeadQuoteType       ✅ (should be BIDDING)
  expiresAt             DateTime?           ✅ (countdown deadline)
  leadPrice             Float?              ✅ (what installer pays to unlock)
  status                LeadStatus          ✅
}
```

### 2.3 Backend API Analysis

**Existing Endpoint**: `GET /api/leads/[id]` (src/app/api/leads/[id]/route.ts)

**Current Behavior**:
```typescript
// Line 24-50: Uses getLeadById service with role-based field filtering
const lead = await getLeadById({
  leadId,
  userId: session.user.id,
  userRole: session.user.role,  // ✅ Filters fields by role
});

// Returns filtered lead object based on:
// - ADMIN: sees all fields
// - HOMEOWNER: sees own lead fully
// - INSTALLER: sees limited fields (needs verification)
```

**Service File**: `src/lib/services/lead-service.ts` (needs audit)

**Expected Behavior for Installers**:
- ✅ Show technical fields (postcode, energyBill, roofType, etc.)
- ❌ **MASK** contact fields (phoneNumber, name, full address)
- ✅ Include countdown (expiresAt) and lead price

### 2.4 Integration Point

**Caller**: `src/components/InstallerLeadFeed.tsx` (line 850-857)

```tsx
<BidEvaluationModal
  isOpen={isBidEvaluationOpen}
  onClose={() => setIsBidEvaluationOpen(false)}
  leadId={String(lead.id)}   // ✅ Passes lead ID
  bids={[]}                  // ❌ Empty array (no bids yet in Phase 1)
  yourBidId={undefined}      // ❌ No bid tracking yet
/>
```

**Current Trigger**: "Lead Details" button on bidding lead cards

---

## 3. GAP ANALYSIS

| Feature | Current State | Required State | Gap |
|---------|--------------|----------------|-----|
| **Lead Data Fetching** | ❌ None | ✅ API call to `GET /api/leads/[id]` | HIGH |
| **Technical Fields Display** | ❌ Not shown | ✅ Show all non-contact fields | HIGH |
| **Contact Masking** | ❌ N/A (no data) | ✅ Mask phone, name, full address | HIGH |
| **Loading State** | ❌ None | ✅ Skeleton/spinner while fetching | MEDIUM |
| **Error Handling** | ❌ None | ✅ Show error if API fails | MEDIUM |
| **Empty Bids State** | ✅ Works | ✅ Keep existing | LOW |
| **Bid Comparison** | ✅ Works (with mock data) | ✅ Keep existing | LOW |

---

## 4. ROOT CAUSE

**Why the modal doesn't show lead data:**
1. **Design assumption**: Modal was built for **bid comparison** (installer vs competitors), NOT as a **lead details viewer**
2. **Missing data flow**: No `useEffect` to fetch lead data when modal opens
3. **No backend contract**: API doesn't explicitly support "technical-only" view for installers (needs verification)
4. **Props mismatch**: Modal expects `bids[]` but doesn't expect `leadData` object

---

## 5. IMPLEMENTATION PLAN

### Phase 0: Verification & Setup
**Tasks**:
1. ✅ Audit lead-service.ts to confirm installer field filtering
2. ✅ Test `GET /api/leads/[id]` with INSTALLER role (verify masked fields)
3. ✅ Review quoteData JSON structure (what's inside?)

**Testing**:
- Postman/curl: `GET /api/leads/{bidding-lead-id}` with installer JWT
- Expected: Returns technical fields, NO phoneNumber/name/address

---

### Phase 1: Backend API Enhancement (if needed)

**File**: `src/lib/services/lead-service.ts`

**Task 1.1**: Verify `getLeadById` filters correctly for INSTALLER role

**Expected Logic**:
```typescript
if (userRole === 'INSTALLER') {
  // ✅ INCLUDE technical fields
  const allowedFields = {
    id, projectType, propertyType, postcode, location, state,
    energyBill, billType, roofType, budgetRange, desiredOffset,
    batteryRequired, batteryCapacity, timeframe, additionalNotes,
    quoteData, quoteType, expiresAt, leadPrice, status
  };
  
  // ❌ EXCLUDE contact fields
  delete lead.phoneNumber;
  delete lead.name;
  delete lead.address;  // Full street address
  
  // ⚠️ PARTIAL: Keep "location" (suburb/city only, NOT full address)
}
```

**Action**: If service doesn't filter correctly, update it. Otherwise, skip to Phase 2.

---

### Phase 2: Frontend Component Enhancement

**File**: `src/components/BidEvaluationModal.tsx`

**Task 2.1**: Add state for lead data
```typescript
const [leadData, setLeadData] = useState<Lead | null>(null);
const [isLoadingLead, setIsLoadingLead] = useState(false);
const [leadError, setLeadError] = useState<string | null>(null);
```

**Task 2.2**: Add `useEffect` to fetch lead on modal open
```typescript
useEffect(() => {
  if (!isOpen || !leadId) return;
  
  const fetchLead = async () => {
    setIsLoadingLead(true);
    setLeadError(null);
    
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (!res.ok) throw new Error('Failed to fetch lead');
      
      const data = await res.json();
      setLeadData(data.lead);
    } catch (err) {
      setLeadError(err.message);
    } finally {
      setIsLoadingLead(false);
    }
  };
  
  fetchLead();
}, [isOpen, leadId]);
```

**Task 2.3**: Add UI section for lead technical details (ABOVE bid comparison)

**Layout Structure**:
```
Header: "Bid Evaluation"
↓
[NEW] Lead Technical Details Section
  - Location: {location}, {state} {postcode}
  - Property: {propertyType} ({projectType})
  - Energy Bill: ${energyBill} / {billType}
  - Roof Type: {roofType}
  - Budget: {budgetRange}
  - Desired Offset: {desiredOffset}%
  - Battery: {batteryRequired ? `Yes, ${batteryCapacity}` : 'No'}
  - Timeframe: {timeframe}
  - Notes: {additionalNotes}
  - Countdown: {expiresAt} (calculate remaining time)
  - [Masked] Contact: ●●●●● (Available after purchase)
↓
Competitor Bids Comparison (existing)
```

**Task 2.4**: Add loading and error states
```tsx
{isLoadingLead && <Skeleton />}
{leadError && <ErrorBanner message={leadError} />}
{leadData && <LeadDetailsSection {...leadData} />}
```

---

### Phase 3: UI Enhancement (Design System Compliance)

**Task 3.1**: Create reusable `LeadDetailRow` component
```tsx
const LeadDetailRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-border">
    <span className="flex items-center gap-2 text-body-small text-muted-foreground">
      {icon}
      {label}
    </span>
    <span className="text-body text-foreground font-medium">{value}</span>
  </div>
);
```

**Task 3.2**: Use semantic classes (no hardcoded colors/spacing)
- Backgrounds: `bg-surface`, `bg-background`
- Text: `text-foreground`, `text-muted-foreground`
- Borders: `border-border`
- Shadows: `shadow-neu-inset`, `shadow-neu-outset`

**Task 3.3**: Add responsive grid for mobile/desktop
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Left: Lead specs */}
  {/* Right: Financial summary */}
</div>
```

---

### Phase 4: Contact Masking Logic

**Task 4.1**: Display masked contact placeholder
```tsx
<LeadDetailRow
  icon={<PhoneIcon />}
  label="Contact Information"
  value={
    <span className="text-muted flex items-center gap-2">
      <LockIcon className="h-4 w-4" />
      Available after purchase
    </span>
  }
/>
```

**Task 4.2**: If installer already purchased (future):
```tsx
{lead.purchaseStatus === 'PURCHASED' && (
  <>
    <LeadDetailRow label="Name" value={lead.name} />
    <LeadDetailRow label="Phone" value={lead.phoneNumber} />
    <LeadDetailRow label="Address" value={lead.address} />
  </>
)}
```

---

### Phase 5: QuoteData JSON Parsing

**Task 5.1**: Audit quoteData structure
```typescript
// Example from homeowner form:
quoteData: {
  systemSize?: string;
  panelPreference?: string;
  inverterPreference?: string;
  customRequirements?: string;
  // ... other form fields
}
```

**Task 5.2**: Display additional quoteData fields
```tsx
{lead.quoteData && (
  <div className="mt-4 p-4 bg-info/10 rounded-xl">
    <h4 className="text-label mb-2">Additional Requirements</h4>
    {Object.entries(lead.quoteData).map(([key, value]) => (
      <LeadDetailRow key={key} label={key} value={String(value)} />
    ))}
  </div>
)}
```

---

## 6. VERIFICATION STRATEGY

### Test Case 1: API Response Validation
**Steps**:
1. Create bidding lead as homeowner
2. Assign to installer as admin
3. Log in as installer
4. Call `GET /api/leads/{id}`
5. **Expected**:
   - ✅ Returns technical fields (postcode, energyBill, etc.)
   - ❌ phoneNumber is `null` or absent
   - ❌ name is `null` or absent
   - ❌ address is `null` or absent

### Test Case 2: Modal UI Rendering
**Steps**:
1. Open InstallerLeadFeed
2. Find bidding lead card
3. Click "Lead Details" button
4. **Expected**:
   - ✅ Modal opens with loading spinner
   - ✅ After 1-2s, shows lead technical details
   - ✅ Contact section shows lock icon + "Available after purchase"
   - ✅ No console errors
   - ✅ Bid comparison section still works (empty state if no bids)

### Test Case 3: Error Handling
**Steps**:
1. Pass invalid `leadId` to modal
2. **Expected**:
   - ✅ Shows error banner: "Lead not found"
   - ✅ Close button still works

### Test Case 4: Multi-Theme Validation
**Themes**: Dark, Light, Purple  
**Breakpoints**: 320px, 768px, 1440px  
**Expected**:
- ✅ All text readable (contrast >= 4.5:1)
- ✅ Shadows visible in all themes
- ✅ Responsive layout works on mobile

### Test Case 5: TypeScript Compilation
```powershell
npx tsc --noEmit  # → 0 errors
npm run build     # → Success
```

---

## 7. FILES TO MODIFY

| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `src/components/BidEvaluationModal.tsx` | Add lead data fetching, display technical details | +120 lines |
| `src/lib/services/lead-service.ts` (if needed) | Verify/update installer field filtering | ±30 lines |
| `src/types/lead.ts` (if needed) | Add `LeadTechnicalData` type | +20 lines |

---

## 8. ROLLBACK PLAN

**If tests fail**:
1. Git checkout original `BidEvaluationModal.tsx`
2. Keep existing bid comparison functionality
3. Revert any service changes
4. Re-audit and try alternative approach

**Backup**: Keep current empty state ("No Bids Submitted Yet") functional

---

## 9. SUCCESS CRITERIA

- [ ] BidEvaluationModal fetches lead data via API
- [ ] Displays all technical fields (12+ data points)
- [ ] Masks contact information (phone, name, address)
- [ ] Shows loading/error states appropriately
- [ ] Maintains existing bid comparison functionality
- [ ] TypeScript: 0 errors
- [ ] Build: Success
- [ ] Browser console: No errors
- [ ] Multi-theme: Dark/Light/Purple pass
- [ ] Responsive: 320px, 768px, 1440px layouts work

---

## 10. NEXT STEPS

1. **Verify backend**: Test `GET /api/leads/[id]` with installer auth
2. **Implement Phase 2**: Add data fetching to modal
3. **Implement Phase 3**: Build lead details UI
4. **Test**: Run all 5 test cases
5. **Report**: Update this document with results

---

## 11. OPEN QUESTIONS

1. **QuoteData structure**: What fields are actually in `quoteData` JSON?
2. **Location vs Address**: Confirm "location" is suburb/city (NOT full street address)
3. **Purchased state**: Should modal behavior change if installer already purchased? (Future scope)
4. **Countdown display**: Show remaining time vs absolute expiry date?

---

**Status**: Ready for implementation  
**Next Action**: Run GATE 0 verification → Test API endpoint → Proceed to Phase 2
