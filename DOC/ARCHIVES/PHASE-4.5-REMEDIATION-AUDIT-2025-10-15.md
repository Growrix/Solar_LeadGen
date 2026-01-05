# CRITICAL ARCHITECTURE AUDIT: Lead Data Storage
**Date**: October 15, 2025  
**Severity**: 🔴 CRITICAL - Affects Phases 1-4  
**Status**: REQUIRES IMMEDIATE REMEDIATION  
**Branch**: 002-lead-journey-life

---

## 🚨 EXECUTIVE SUMMARY

**Problem**: The Lead model stores only 10 basic requirement fields, but the InstantQuoteForm collects 30+ fields of rich quote data (system size, costs, savings, ROI, preferences). When leads are created, **90% of this valuable data is discarded**.

**Impact**: 
- ❌ Installers purchasing leads don't see what the homeowner calculated
- ❌ No context on expected system size, costs, or savings
- ❌ Homeowner preferences (battery brand, panel brand, VPP, EV charging) lost
- ❌ Admin can't analyze lead quality based on quote details
- ❌ Future phases (Chat, Quotes, Feedback) won't have baseline data to reference

**Root Cause**: Schema design mismatch between data collection (InstantQuoteForm) and data storage (Lead model)

---

## 📊 AUDIT FINDINGS

### Phase 1: Setup ✅ (No Impact)
- External service clients configured correctly
- No changes needed

### Phase 2: Foundation ⚠️ (SCHEMA ISSUE)
**Files Affected**:
- `prisma/schema.prisma` - Lead model missing quote data field
- `src/types/lead.ts` - Type definitions don't include quote data

**Missing**:
```prisma
model Lead {
  // ... existing fields ...
  quoteData Json?  @db.JsonB  // ← MISSING: Complete instant quote data
}
```

### Phase 3: User Story 1 (Lead Submission) 🔴 (CRITICAL)
**Files Affected**:
1. `src/app/api/leads/route.ts` - POST endpoint doesn't accept quoteData
2. `src/lib/services/lead-service.ts` - createLead() doesn't store quoteData
3. `src/app/page.tsx` - Passes quoteData but API ignores it ✅ (already passing!)
4. `src/components/HomeownerSignupModal.tsx` - Passes quoteData but API ignores it ✅

**Current Behavior**:
```typescript
// Frontend sends (page.tsx line 76-83):
body: JSON.stringify({
  quoteType: type,
  quoteData: pendingQuoteData,  // ← SENT but IGNORED!
  propertyPostcode: ...,
  energyBill: ...,
  ...
})

// Backend receives (lead-service.ts):
export interface CreateLeadInput {
  quoteData?: any;  // ← Defined in interface
  // ... other fields
}

// But Prisma.lead.create() DOESN'T SAVE IT:
const lead = await prisma.lead.create({
  data: {
    // ... basic fields only
    // quoteData: NOT INCLUDED! ❌
  }
});
```

### Phase 4: User Story 2 (Admin Approval) ⚠️ (MINOR IMPACT)
**Files Affected**:
- `src/app/admin/leads/page.tsx` - Can't filter/display by system size or cost
- `src/app/admin/leads/[id]/page.tsx` - Can't show quote calculation details

**Impact**: Admins can't see what quote the homeowner calculated, making approval decisions less informed.

---

## 🔧 REMEDIATION PLAN

### Option 1: Quick Fix (RECOMMENDED FOR NOW)
**Add JSON field to store everything**

**Pros**:
- ✅ Minimal changes - 1 schema field + 2 line code change
- ✅ Zero data loss
- ✅ Backward compatible
- ✅ Can implement in 30 minutes
- ✅ No breaking changes to existing phases

**Cons**:
- ⚠️ Can't query by specific quote fields (e.g., "find all leads with 10kW systems")
- ⚠️ Slightly larger database storage

**Implementation**:
1. Add `quoteData Json? @db.JsonB` to Lead model
2. Run migration
3. Update lead-service.ts to store quoteData
4. Update admin UI to display quote details

---

### Option 2: Comprehensive Schema Enhancement (RECOMMENDED LONG-TERM)
**Add indexed summary fields + JSON for complete data**

**Pros**:
- ✅ Can query/filter by key metrics (system size, cost, savings)
- ✅ Zero data loss (full quote in JSON)
- ✅ Better admin analytics
- ✅ Supports future features (matching installers by system size)

**Cons**:
- ⚠️ Requires larger schema change
- ⚠️ More complex migration
- ⚠️ Takes 2-3 hours to implement fully

**Implementation**:
1. Add summary fields + quoteData JSON to Lead model:
```prisma
model Lead {
  // ... existing fields ...
  
  // NEW: Key metrics for filtering
  recommendedSystemSize Float?
  finalCost Float?
  annualSavings Float?
  paybackPeriod Float?
  
  // NEW: Complete quote data
  quoteData Json? @db.JsonB
  
  @@index([recommendedSystemSize])
  @@index([finalCost])
}
```
2. Run migration
3. Update lead-service.ts to extract + store summary fields
4. Update admin UI to show summary metrics + full quote
5. Add filtering by system size/cost in admin leads list

---

## 📋 PHASE 4.5: LEAD DATA SCHEMA REMEDIATION

**Purpose**: Fix data loss issue before continuing to Phase 5+

**Priority**: 🔴 CRITICAL - MUST complete before Phase 5 (Installer Purchase)

**Why Before Phase 5?**: Installers purchasing leads NEED to see quote details. If we wait, purchased leads will have no context.

### Tasks for Phase 4.5

#### Core Schema & Service Changes (BLOCKING)
- [ ] **T147** [Foundation] Add `quoteData Json? @db.JsonB` to Lead model in `prisma/schema.prisma`
- [ ] **T148** [Foundation] Run Prisma migration `npx prisma migrate dev --name add-lead-quote-data`
- [ ] **T149** [Foundation] Update `CreateLeadInput` interface in `src/lib/services/lead-service.ts` (ensure quoteData is properly typed)
- [ ] **T150** [Foundation] Update `createLead()` function in lead-service.ts to include `quoteData: input.quoteData` in Prisma create
- [ ] **T151** [Foundation] Update Lead type in `src/types/lead.ts` to include quoteData field

#### API Validation
- [ ] **T152** [US1] Update POST `/api/leads` route to validate quoteData is received (add console.log temporarily)
- [ ] **T153** [US1] Test lead creation: verify quoteData is saved to database (check with Prisma Studio)

#### Admin UI Enhancements
- [ ] **T154** [US2] Create QuoteDataDisplay component in `src/components/admin/QuoteDataDisplay.tsx` (displays quote calculation results)
- [ ] **T155** [US2] Add QuoteDataDisplay to admin lead detail page `src/app/admin/leads/[id]/page.tsx`
- [ ] **T156** [US2] Add quote summary to admin leads list (system size, cost columns)

#### Verification & Testing
- [ ] **T157** [Testing] Create new test lead with quote data - verify it's stored
- [ ] **T158** [Testing] Check existing leads in database - verify quoteData field exists (will be null for old leads)
- [ ] **T159** [Testing] Admin views lead detail - verify quote data displays correctly
- [ ] **T160** [Testing] Verify no breaking changes to existing lead creation flow

### Validation Checklist for Phase 4.5

**Pre-Phase (30 min)**:
- [X] Audit complete - documented in LEAD-DATA-SCHEMA-AUDIT-2025-10-15.md
- [ ] Review InstantQuoteForm.tsx line 569 - what data is in quote result?
- [ ] Review current Lead model fields vs. collected data
- [ ] Check how page.tsx and HomeownerSignupModal.tsx pass quoteData
- [ ] Verify quoteData structure matches what we need to store

**During Implementation**:
- [ ] After T147-T151 (Schema): Run `npx prisma validate` and `npx prisma migrate dev`
- [ ] After T152-T153 (API): Test with curl or Postman - verify quoteData saved
- [ ] After T154-T156 (UI): Run `npm run build` - verify no errors
- [ ] After T157-T160 (Testing): Complete end-to-end test

**Post-Phase Validation**:
- [ ] Schema Validation: `npx prisma validate` passes
- [ ] TypeScript: `npx tsc --noEmit` (0 errors)
- [ ] Build: `npm run build` (0 errors)
- [ ] Migration Applied: Check Prisma migrations folder for new migration file
- [ ] Database Check: Open Prisma Studio, verify Lead table has quoteData column
- [ ] Data Integrity: Create test lead, verify quoteData JSON saved correctly
- [ ] UI Verification: Admin can see quote details in lead detail page
- [ ] API Testing:
  - [ ] POST /api/leads with quoteData - returns 201, data saved
  - [ ] GET /api/leads/[id] - returns lead with quoteData field
  - [ ] Verify quoteData structure matches InstantQuoteForm output
- [ ] No Regression: Existing lead creation flow still works
- [ ] User approval received for commit
- [ ] Git commit: "Phase 4.5: Add quote data storage to Lead model"

**Expected Outcomes**:
1. ✅ Lead model has quoteData field (JSON)
2. ✅ All new leads store complete instant quote data
3. ✅ Admins can see quote calculation details in lead view
4. ✅ No data loss when leads are created
5. ✅ Foundation ready for Phase 5 (installers will see quote context)

---

## 🔍 FUTURE PHASE IMPACTS (if not fixed)

### Phase 5: Installer Purchase
**Impact**: 🔴 CRITICAL
- Installers purchase leads blind - no idea what system size homeowner calculated
- Can't match installer capabilities to lead requirements
- Poor lead quality experience

### Phase 6: Status Tracking
**Impact**: ⚠️ MEDIUM
- Status updates lack context (e.g., "In Progress" but for what system size?)
- Audit trail shows basic info only

### Phase 8: Chat & Quotes
**Impact**: 🔴 CRITICAL
- Installer asks "What system size did you see?" - homeowner says "I don't remember"
- Installer submits quote for 5kW, homeowner saw 10kW in instant quote
- Misaligned expectations cause friction

### Phase 9: Lead Feedback
**Impact**: ⚠️ MEDIUM
- Installer rates lead quality but can't reference original quote
- Can't correlate feedback with quote accuracy

---

## 📝 RECOMMENDATION

**Implement Phase 4.5 NOW with Option 1 (JSON field)**:

1. **Immediate (30 minutes)**: Add quoteData JSON field, run migration, update lead-service.ts
2. **Short-term (1-2 hours)**: Add QuoteDataDisplay component to admin UI
3. **Medium-term (Phase 10 Polish)**: Consider Option 2 (indexed summary fields) if admin needs to filter by system size/cost

**Reasoning**:
- ✅ Stops data loss immediately
- ✅ Minimal risk - single field addition
- ✅ Unblocks Phase 5 (installers will see quote context)
- ✅ Can enhance later with indexed fields if needed
- ✅ No breaking changes to existing code

**Timeline**:
- **Today**: Complete Phase 4.5 (T147-T160)
- **Tomorrow**: Resume Phase 5 with confidence that data is preserved

---

## 🎯 DECISION REQUIRED

**Option A**: Implement Phase 4.5 now (RECOMMENDED)
- Pros: Fixes root cause, prevents future issues
- Cons: Delays Phase 5 by ~2-3 hours

**Option B**: Continue to Phase 5, fix later
- Pros: Maintain momentum
- Cons: Phase 5 installers won't see quote data, harder to fix retroactively

**Option C**: Do comprehensive Option 2 now
- Pros: Best long-term solution
- Cons: Takes 6-8 hours, larger risk

---

**My Recommendation**: **Option A - Implement Phase 4.5 now with JSON field**

This is a 2-3 hour investment that prevents weeks of technical debt and user frustration. The data loss issue will compound with every phase we build without fixing it.

**Shall I proceed with implementing Phase 4.5?**
