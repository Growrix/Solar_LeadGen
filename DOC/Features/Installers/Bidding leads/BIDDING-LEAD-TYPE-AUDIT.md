# Bidding Lead Type Assignment Issue - Audit Report

**Date**: November 27, 2025  
**Issue**: Bidding leads show as "Written Quote" in installer feed, assignments don't persist  
**Priority**: HIGH  
**Status**: Investigation Complete  

---

## 1. CURRENT STATE ANALYSIS

### Issue Symptoms:
1. ✅ Admin assigns bidding lead (quoteType: 'BIDDING') to installer
2. ❌ Lead shows as "Written Quote Lead" in installer feed (not "Competitive Bidding")
3. ❌ After assignment, admin modal shows no installers assigned
4. ✅ Lead exists in database with correct quoteType

### Root Cause Identified:

**Problem 1: Frontend Type Mismatch**
- **File**: `src/components/InstallerLeadFeed.tsx` (Line 25)
- **Current**: `export type LeadType = 'call_visit' | 'written';`
- **Issue**: TypeScript type doesn't include 'bidding', so API value is lost
- **Impact**: Lead with quoteType='BIDDING' gets type-cast to 'written' (closest match)

**Problem 2: Display Logic Hardcoded**
- **File**: `src/components/InstallerLeadFeed.tsx` (Lines 287-295)
- **Current**:
```typescript
{lead.type === 'call_visit' ? (
  <PhoneIcon className="h-5 w-5 text-blue-500" />
) : (
  <FileTextIcon className="h-5 w-5 text-purple-500" />
)}
<span className="font-semibold text-slate-900 dark:text-white">
  {lead.type === 'call_visit' ? 'Call/Visit Lead' : 'Written Quote Lead'}
</span>
```
- **Issue**: Binary logic assumes only 2 types, defaults to "Written Quote Lead" for anything not 'call_visit'
- **Impact**: Bidding leads display as "Written Quote Lead"

**Problem 3: Database Schema vs Frontend Mismatch**
- **Database (Prisma)**: `enum LeadQuoteType { CALL_VISIT, WRITTEN_QUOTE, BIDDING }`
- **API Response**: Returns uppercase with underscores: 'CALL_VISIT', 'WRITTEN_QUOTE', 'BIDDING'
- **Frontend**: Expects lowercase with underscores: 'call_visit', 'written', 'bidding'
- **Conversion Gap**: API returns 'BIDDING', but frontend TypeScript type doesn't recognize it

---

## 2. GAP ANALYSIS

### What's Missing:

**A. Frontend Type Definition**
- Need to add 'bidding' to LeadType union
- Update all type guards and conditional logic

**B. Display Mapping**
- Need icon for bidding leads (trophy/gavel icon)
- Need "Competitive Bidding" label
- Need color scheme (orange/gold?)

**C. Conditional Logic**
- `canUnlock` logic assumes only call_visit needs unlock
- `canQuote` logic assumes written OR unlocked call_visit
- Need `canBid` logic for bidding leads

**D. Case Conversion**
- API returns uppercase enum: 'BIDDING'
- Frontend needs lowercase: 'bidding'
- Need mapper function in API response or frontend

---

## 3. FILES REQUIRING CHANGES

### Primary Files:
1. **`src/components/InstallerLeadFeed.tsx`** (Main LeadCard component)
   - Lines 25: Update LeadType type
   - Lines 287-295: Update icon/label logic (add bidding case)
   - Lines 240-242: Update `canUnlock`, `canQuote` logic
   - Lines 720-722: Update filter dropdown (add bidding option)

2. **`src/app/api/installer/leads/assigned/route.ts`** (API mapper)
   - Line 98: Map `quoteType` from uppercase to lowercase
   - Consider: `quoteType: lead.quoteType.toLowerCase().replace('_', '')` → 'callvisit'?
   - OR: Keep uppercase, update frontend to match

### Secondary Files (Potential):
3. **`src/types/installer.ts`** (If exists - shared types)
4. **`src/app/installer/(dashboard)/purchased-leads/page.tsx`** (Tab filtering)

---

## 4. IMPLEMENTATION PLAN

### Phase 1: Fix Type Definition (CRITICAL)
**Goal**: Make 'bidding' a valid LeadType

**Task 1.1: Update InstallerLeadFeed Type**
**File**: `src/components/InstallerLeadFeed.tsx`

**Changes**:
```typescript
// Line 25 - FIND:
export type LeadType = 'call_visit' | 'written';

// REPLACE WITH:
export type LeadType = 'call_visit' | 'written' | 'bidding';
```

**Testing**:
```powershell
npx tsc --noEmit
# Expected: 0 errors
```

---

### Phase 2: Add Bidding Display (UI)
**Goal**: Show "Competitive Bidding" icon + label

**Task 2.1: Add Icon Component**
**File**: `src/components/InstallerLeadFeed.tsx`

**Changes**:
```typescript
// After line 16 (icon imports) - ADD:
const TrophyIcon = ({ className = "h-4 w-4" }: { className?: string }) => 
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>;
```

**Task 2.2: Update Header Display Logic**
**File**: `src/components/InstallerLeadFeed.tsx`

**Changes**:
```typescript
// Lines 287-295 - FIND:
{lead.type === 'call_visit' ? (
  <PhoneIcon className="h-5 w-5 text-blue-500" />
) : (
  <FileTextIcon className="h-5 w-5 text-purple-500" />
)}
<span className="font-semibold text-slate-900 dark:text-white">
  {lead.type === 'call_visit' ? 'Call/Visit Lead' : 'Written Quote Lead'}
</span>

// REPLACE WITH:
{lead.type === 'call_visit' ? (
  <PhoneIcon className="h-5 w-5 text-blue-500" />
) : lead.type === 'bidding' ? (
  <TrophyIcon className="h-5 w-5 text-orange-500" />
) : (
  <FileTextIcon className="h-5 w-5 text-purple-500" />
)}
<span className="font-semibold text-slate-900 dark:text-white">
  {lead.type === 'call_visit' 
    ? 'Call/Visit Lead' 
    : lead.type === 'bidding'
    ? 'Competitive Bidding'
    : 'Written Quote Lead'}
</span>
```

**Testing**:
```powershell
npx tsc --noEmit
npm run build
# Expected: 0 errors, successful build
```

**Manual Test**:
1. Assign bidding lead to installer
2. Login as installer → Navigate to Lead Feed
3. **Verify**: Lead shows trophy icon + "Competitive Bidding" label

---

### Phase 3: Fix Action Buttons (Conditional Logic)
**Goal**: Bidding leads show "Place Bid" button, not "Submit Quote"

**Task 3.1: Update canUnlock/canQuote Logic**
**File**: `src/components/InstallerLeadFeed.tsx`

**Changes**:
```typescript
// Lines 240-242 - FIND:
const isUnlockedByInstaller = lead.unlockedBy.includes(installer.id);
const canUnlock = lead.type === 'call_visit' && !isUnlockedByInstaller && lead.status === 'new';
const canQuote = lead.type === 'written' || isUnlockedByInstaller;

// REPLACE WITH:
const isUnlockedByInstaller = lead.unlockedBy.includes(installer.id);
const canUnlock = lead.type === 'call_visit' && !isUnlockedByInstaller && lead.status === 'new';
const canQuote = lead.type === 'written' || isUnlockedByInstaller;
const canBid = lead.type === 'bidding'; // NEW: Bidding leads allow bids
```

**Task 3.2: Update Action Buttons Section**
**File**: `src/components/InstallerLeadFeed.tsx`

**Changes**:
```typescript
// After line 400 (existing Submit Quote button) - ADD:
{canBid && (
  <button
    onClick={() => {
      // TODO: Open BidEvaluationModal or QuoteBuilderModal in bid mode
      console.log('Place bid for lead:', lead.id);
    }}
    className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
  >
    <TrophyIcon className="h-4 w-4" />
    <span>Place Bid</span>
  </button>
)}
```

**Testing**:
1. Assign bidding lead
2. Login as installer → Open lead
3. **Verify**: "Place Bid" button appears (orange color)
4. **Verify**: "Submit Quote" button does NOT appear

---

### Phase 4: Update Filter Dropdown
**Goal**: Add "Bidding" option to lead type filter

**Task 4.1: Add Filter Option**
**File**: `src/components/InstallerLeadFeed.tsx`

**Changes**:
```typescript
// Lines 720-722 - FIND:
<select
  value={filters.leadType}
  onChange={(e) => setFilters(prev => ({ ...prev, leadType: e.target.value as any }))}
  className="..."
>
  <option value="all">All Types</option>
  <option value="call_visit">Call/Visit</option>
  <option value="written">Written Quote</option>
</select>

// REPLACE WITH:
<select
  value={filters.leadType}
  onChange={(e) => setFilters(prev => ({ ...prev, leadType: e.target.value as any }))}
  className="..."
>
  <option value="all">All Types</option>
  <option value="call_visit">Call/Visit</option>
  <option value="written">Written Quote</option>
  <option value="bidding">Competitive Bidding</option>
</select>
```

**Testing**:
1. Open Lead Feed → Click filter dropdown
2. **Verify**: "Competitive Bidding" option appears
3. Select "Competitive Bidding"
4. **Verify**: Only bidding leads displayed

---

### Phase 5: Fix Case Conversion (Backend → Frontend)
**Goal**: Convert API response from 'BIDDING' to 'bidding'

**Option A: Fix in API Response (RECOMMENDED)**
**File**: `src/app/api/installer/leads/assigned/route.ts`

**Changes**:
```typescript
// Line 98 - FIND:
quoteType: lead.quoteType, // CALL_VISIT | WRITTEN_QUOTE | BIDDING

// REPLACE WITH:
quoteType: lead.quoteType.toLowerCase().replace('_quote', '') as 'call_visit' | 'written' | 'bidding',
// Converts: CALL_VISIT → call_visit, WRITTEN_QUOTE → written, BIDDING → bidding
```

**Testing**:
```bash
# Hit API endpoint
curl http://localhost:3000/api/installer/leads/assigned

# Expected: quoteType values are lowercase
```

**Option B: Fix in Frontend (Alternative)**
**File**: `src/components/InstallerLeadFeed.tsx`

**Changes**:
```typescript
// Add mapper utility (top of file):
const mapQuoteType = (apiType: string): LeadType => {
  const map: Record<string, LeadType> = {
    'CALL_VISIT': 'call_visit',
    'WRITTEN_QUOTE': 'written',
    'BIDDING': 'bidding'
  };
  return map[apiType] || 'written'; // Fallback to written
};

// Then use when fetching leads (if fetching directly in component)
```

---

## 5. TESTING PROTOCOL

### Test Case 1: Create Bidding Lead
**Steps**:
1. Login as Admin
2. Navigate to Leads → Click bidding lead (quoteType: 'BIDDING')
3. Open Lead Management Modal
4. Select 1 installer, set price, countdown
5. Click "Approve & Assign"

**Expected**:
- ✅ Success message: "Lead assigned successfully"
- ✅ Modal shows installer in Assignment History
- ✅ Database: LeadAssignment record created

**Verification Commands**:
```sql
SELECT * FROM "Lead" WHERE id = 'lead-id';
-- quoteType should be 'BIDDING'

SELECT * FROM "LeadAssignment" WHERE "leadId" = 'lead-id';
-- Should have 1 record with installerId
```

---

### Test Case 2: View Bidding Lead in Installer Feed
**Steps**:
1. Login as assigned installer
2. Navigate to Lead Feed
3. Find assigned bidding lead

**Expected**:
- ✅ Trophy icon (orange color)
- ✅ Label: "Competitive Bidding"
- ✅ "Place Bid" button (orange, not "Submit Quote")
- ✅ No "Unlock Lead" button
- ✅ Lead shows in "All Types" filter
- ✅ Lead shows when "Competitive Bidding" filter selected

---

### Test Case 3: Multi-Installer Assignment
**Steps**:
1. Admin assigns bidding lead to Installer A, B, C
2. Login as Installer A → Check Lead Feed
3. Login as Installer B → Check Lead Feed
4. Login as Installer D (not assigned) → Check Lead Feed

**Expected**:
- ✅ Installer A: Sees bidding lead
- ✅ Installer B: Sees bidding lead
- ✅ Installer C: Sees bidding lead
- ❌ Installer D: Does NOT see bidding lead (visibility: PRIVATE)

---

### Test Case 4: Bidding vs Call/Visit vs Written
**Steps**:
1. Create 3 leads: 1 bidding, 1 call_visit, 1 written
2. Assign all to same installer
3. Login as installer → View Lead Feed

**Expected**:
| Lead Type | Icon | Label | Button |
|-----------|------|-------|--------|
| call_visit | Phone (blue) | Call/Visit Lead | Unlock Lead ($X) |
| written | FileText (purple) | Written Quote Lead | Submit Quote |
| bidding | Trophy (orange) | Competitive Bidding | Place Bid |

---

## 6. KNOWN ISSUES & LIMITATIONS

### Current Blockers:
1. **BidEvaluationModal not integrated**: "Place Bid" button needs modal
2. **QuoteBuilderModal mode prop**: Needs to support `mode="bid"`
3. **Backend bid submission**: No `/api/bids` endpoint yet

### Post-Fix Work Needed:
1. Implement bid submission flow (Phase 19-21)
2. Add bid evaluation modal
3. Admin bid review panel
4. Homeowner bid comparison

---

## 7. ROLLBACK PLAN

If issues arise after deployment:

**Step 1: Revert Type Change**
```typescript
// Revert to:
export type LeadType = 'call_visit' | 'written';
```

**Step 2: Hide Bidding Leads**
```typescript
// Add filter in API:
lead: {
  quoteType: { not: 'BIDDING' } // Hide bidding leads temporarily
}
```

**Step 3: Database Cleanup**
```sql
-- Mark bidding leads as DRAFT (hide from feed)
UPDATE "Lead" 
SET status = 'DRAFT' 
WHERE "quoteType" = 'BIDDING';
```

---

## 8. SUCCESS CRITERIA

### Phase 1-2 Complete When:
- [ ] TypeScript compiles with 0 errors
- [ ] Next.js builds successfully
- [ ] Bidding leads show trophy icon + "Competitive Bidding" label
- [ ] No "Written Quote Lead" mislabeling

### Phase 3-4 Complete When:
- [ ] "Place Bid" button appears for bidding leads
- [ ] Filter dropdown includes "Competitive Bidding" option
- [ ] Filtering by type works correctly

### Phase 5 Complete When:
- [ ] API returns lowercase quoteType values
- [ ] Frontend correctly maps 'BIDDING' → 'bidding'
- [ ] No type mismatches in browser console

---

## 9. NEXT STEPS

**Immediate Actions (Today)**:
1. ✅ Complete audit (this document)
2. ⏳ Implement Phase 1-2 (type + display fix)
3. ⏳ Test with real bidding lead
4. ⏳ Verify assignment persistence

**Short-Term (This Week)**:
1. Implement Phase 3-4 (conditional logic + filter)
2. Fix case conversion (Phase 5)
3. Full end-to-end test (admin → installer flow)

**Long-Term (Next Sprint)**:
1. Build bid submission flow (Phases 19-21 from bidding UI plan)
2. Integrate BidEvaluationModal
3. Admin bid review panel
4. Homeowner bid comparison modal

---

**Status**: Ready for Implementation  
**Next Action**: Begin Phase 1 (Type Definition Fix)
