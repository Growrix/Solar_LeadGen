# Guest Flow Audit - October 21, 2025

## Executive Summary

**Status**: 🔴 CRITICAL ISSUES IDENTIFIED  
**Priority**: P0 (BLOCKING)  
**Scope**: Guest instant quote flow → signup → lead creation → dashboard visibility

### Critical Issues Found

1. **❌ Leads Not Appearing in Dashboards**
   - **Root Cause**: Lead created in `HomeownerSignupModal` BEFORE session is established
   - **Impact**: Leads created with stale/incorrect user context
   - **Evidence**: Session refresh happens 800ms after registration, lead created immediately

2. **❌ No Edit/Preview Modal for Leads**
   - **Current**: No UI to view/edit lead details after creation
   - **Expected**: Pre-filled modal with all InstantQuote inputs + results

3. **❌ No Cancellation Functionality**
   - **Current**: No cancel button, no API endpoint, no quota restoration
   - **Expected**: Homeowners can cancel before installer purchase

4. **❌ Edit Restrictions Not Enforced**
   - **Current**: No validation for editing after admin approval
   - **Expected**: Edit blocked after approval/purchase

---

## Detailed Findings

### 1. Guest Flow Architecture (Current State)

```
Guest Journey:
1. InstantQuoteForm calculation → quoteData stored in page.tsx state
2. Click "Request Quote from Installer" → QuoteOptionsModal opens
3. Select quote type (call_visit/written) → handleQuoteOptionSelected()
4. Check if authenticated:
   - NO → HomeownerSignupModal opens
   - YES → POST /api/leads directly
5. Signup → auto-login → wait 800ms → create lead
6. Success modal → redirect to dashboard
```

**Problem Areas**:
- ❌ Lead creation timing in HomeownerSignupModal (line 136-148)
- ❌ No session validation before lead creation
- ❌ No error handling if lead creation fails after signup

### 2. File Analysis

#### **HomeownerSignupModal.tsx** (Lines 136-148)
```typescript
// CRITICAL: Force session refresh to ensure fresh session data
// This prevents stale admin sessions from being used
// Wait for session to be established before proceeding
await new Promise(resolve => setTimeout(resolve, 800));

// If this is a quote context with quote data, submit the lead
if (context === 'quote' && quoteData && quoteType) {
  try {
    const leadResponse = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteType,
        propertyPostcode: quoteData?.postcode || quoteData?.propertyPostcode,
        location: quoteData?.location,
        state: quoteData?.state,
        energyBill: quoteData?.electricityValue || quoteData?.energyBill || 0,
        quoteData: quoteData,
        ...quoteData
      })
    });
```

**Issues**:
1. ❌ 800ms arbitrary timeout - not guaranteed session ready
2. ❌ Errors silently logged, user not notified
3. ❌ Partial quoteData passed (not all InstantQuote fields)

#### **POST /api/leads** (route.ts Lines 20-40)
```typescript
const session = await getServerSession(authOptions);

if (!session?.user) {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  );
}

// Only homeowners can create leads
if (session.user.role !== 'HOMEOWNER') {
  return NextResponse.json(
    { error: 'Only homeowners can create leads' },
    { status: 403 }
  );
}
```

**Observation**:
- ✅ Proper session validation
- ✅ Role-based access control
- ❌ But gets called BEFORE session is fully established in signup flow

#### **lead-service.ts** (createLead function)
```typescript
// Create lead in database
const lead = await prisma.lead.create({
  data: {
    homeownerId: input.homeownerId,
    quoteType: input.quoteType,
    projectType: input.propertyType,
    // ... other fields
    status: LeadStatus.DRAFT, // ✅ Starts as DRAFT
    visibility: LeadVisibility.HIDDEN, // ✅ Hidden until approved
    quoteData: input.quoteData || null, // ✅ Phase 4.5 complete
  },
  // ...
});
```

**Observation**:
- ✅ QuoteData field exists and is populated
- ✅ Proper status/visibility defaults
- ❌ No cancellation date field
- ❌ No edit restrictions enforced

#### **Prisma Schema** (Lead model Lines 570-650)
```prisma
model Lead {
  id            String         @id @default(cuid())
  homeownerId   String
  quoteType     LeadQuoteType  @default(CALL_VISIT)
  status        LeadStatus     @default(DRAFT)
  visibility    LeadVisibility @default(HIDDEN)
  quoteData     Json?          @db.JsonB  // ✅ Exists (Phase 4.5)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  approvedAt    DateTime?
  purchasedAt   DateTime?
  expiresAt     DateTime?
  // ❌ MISSING: cancelledAt DateTime?
  // ❌ MISSING: cancelledReason String?
}
```

**Gaps Identified**:
1. ❌ No `cancelledAt` field
2. ❌ No `cancelledReason` field
3. ❌ LeadStatus has CANCELLED but no timestamp tracking

#### **Homeowner Dashboard** (page.tsx Lines 1-250)
```typescript
interface RecentLeadSummary {
  id: string;
  quoteType: QuoteTypeOption;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  leadPrice: number | null;
  purchaseStatus: string | null;
  purchasedAt: string | null;
  visibility: string;
  quoteData: Record<string, unknown> | null; // ✅ Includes quoteData
}
```

**Observations**:
- ✅ Dashboard fetches quoteData
- ❌ No edit button in lead list
- ❌ No cancel button in lead list
- ❌ No preview modal component

### 3. Data Flow Analysis

#### **InstantQuoteForm quoteData Structure**
Based on code analysis, quoteData includes:
```typescript
{
  // Location
  postcode: string,
  location: string,
  state: string,
  
  // Energy
  electricityValue: number,
  billType: string,
  
  // System
  systemSize: number,
  systemCost: number,
  
  // Savings
  yearlySavings: number,
  monthlySavings: number,
  paybackPeriod: number,
  
  // Preferences
  propertyType: string,
  roofType: string,
  batteryRequired: boolean,
  batteryCapacity?: string,
  budgetRange?: string,
  desiredOffset: number,
  timeframe?: string,
  additionalNotes?: string,
  
  // Calculation Results
  rebateAmount: number,
  finalCost: number,
  roi: number,
  // ... potentially more fields
}
```

**Issue**: HomeownerSignupModal only passes partial fields:
```typescript
{
  quoteType,
  propertyPostcode: quoteData?.postcode,
  location: quoteData?.location,
  state: quoteData?.state,
  energyBill: quoteData?.electricityValue,
  quoteData: quoteData, // ✅ Full object passed here
  ...quoteData // ✅ Spread operator includes all
}
```

**Verdict**: ✅ Full quoteData IS passed via spread operator

---

## Root Cause Analysis

### Issue #1: Leads Not Appearing

**Root Cause**: Race condition between session establishment and lead creation

**Evidence**:
1. `signIn()` called in HomeownerSignupModal line 120
2. 800ms arbitrary wait (line 132)
3. Lead creation immediately after (line 136)
4. Session may not be fully committed to NextAuth

**Why This Fails**:
- NextAuth session establishment is async
- 800ms is not guaranteed to be enough time
- Server-side `getServerSession()` may return null/stale session
- Lead created with wrong user context or fails silently

**Fix Strategy**:
1. Remove lead creation from HomeownerSignupModal
2. Move lead creation to page.tsx after signup success
3. Use session hook to verify user is authenticated
4. Only then call POST /api/leads

### Issue #2: No Edit Modal

**Current**: No component exists to edit leads

**Expected User Flow**:
1. Homeowner clicks "Edit" button on lead card
2. Modal opens with ALL InstantQuote fields pre-filled
3. User edits fields (address, system size, preferences)
4. Click "Calculate Again" → results update
5. Click "Save Changes" → PATCH /api/leads/[id]

**Components Needed**:
1. `LeadEditModal.tsx` - Pre-filled form with quoteData
2. PATCH `/api/leads/[id]` endpoint
3. Edit button in dashboard lead list

### Issue #3: No Cancellation

**Current**: No way to cancel leads

**Expected User Flow**:
1. Homeowner clicks "Cancel Request" on lead card
2. Confirmation modal: "Are you sure? This will free up 1 quote."
3. Confirm → PATCH /api/leads/[id]/cancel
4. Status → CANCELLED, cancelledAt timestamp
5. leadSubmissionCount decremented
6. Dashboard quota updates (5 used → 4 used)

**Components Needed**:
1. Cancel button in dashboard (visible when status !== PURCHASED)
2. PATCH `/api/leads/[id]/cancel` endpoint
3. Schema migration: add cancelledAt, cancelledReason
4. Quota restoration logic

### Issue #4: Edit After Approval

**Current**: No restrictions enforced

**Expected**:
- Edit allowed: DRAFT, PENDING_PHONE, PENDING_APPROVAL
- Edit blocked: APPROVED, PURCHASED, QUOTED, ACCEPTED, CANCELLED, EXPIRED

**Implementation**:
1. Add `canEditLead(status)` validator in lead-service.ts
2. PATCH endpoint checks status before allowing update
3. UI hides edit button when status is final
4. Show "Preview" button instead for approved leads

---

## Recommendations

### Phase 4.10: Guest Flow Fixes (Priority: P0)

**Scope**: Fix critical bugs blocking guest quote flow

**Tasks**:
1. T238: Fix lead creation timing (remove from HomeownerSignupModal)
2. T239: Add cancelledAt/cancelledReason to schema
3. T240: Create PATCH /api/leads/[id] endpoint (edit)
4. T241: Create PATCH /api/leads/[id]/cancel endpoint
5. T242: Create LeadEditModal component
6. T243: Create QuotePreviewModal component (read-only)
7. T244: Add edit/cancel buttons to dashboard
8. T245: Implement quota restoration on cancellation
9. T246: Add canEditLead() validator
10. T247: End-to-end testing

**Estimated Time**: 8-10 hours

**Blockers**: None - all dependencies exist

**Success Criteria**:
- ✅ Guest signup → lead appears in both homeowner & admin dashboards
- ✅ Edit modal shows ALL quoteData fields
- ✅ Edit blocked after approval
- ✅ Cancel button works, quota restored
- ✅ Preview modal shows read-only data for approved leads

---

## Testing Strategy

### Manual QA Checklist

**Scenario 1: Guest Flow (Happy Path)**
1. Visit homepage (logged out)
2. Fill InstantQuoteForm → see results
3. Click "Request Quote from Installer"
4. Select quote type (Written Quote)
5. Fill signup form → submit
6. Verify success message
7. Verify redirect to homeowner dashboard
8. **EXPECTED**: Lead appears in "Recent Leads" section
9. Open admin dashboard
10. **EXPECTED**: Lead appears in admin leads list
11. **EXPECTED**: Status = PENDING_APPROVAL

**Scenario 2: Edit Lead (Before Approval)**
1. Login as homeowner with 1 DRAFT lead
2. Click "Edit" button on lead card
3. **EXPECTED**: Modal opens with ALL fields pre-filled
4. Edit system size, recalculate
5. **EXPECTED**: Results update
6. Click "Save Changes"
7. **EXPECTED**: Lead updated, modal closes, dashboard refreshes
8. Verify database: quoteData updated

**Scenario 3: Cancel Lead**
1. Login as homeowner with 1 PENDING_APPROVAL lead
2. Current quota: 1 used, 4 remaining
3. Click "Cancel Request" button
4. **EXPECTED**: Confirmation modal
5. Confirm cancellation
6. **EXPECTED**: Lead status → CANCELLED
7. **EXPECTED**: Quota updates: 0 used, 5 remaining
8. Verify database: cancelledAt timestamp set

**Scenario 4: Edit Restrictions**
1. Admin approves lead (status → APPROVED)
2. Homeowner refreshes dashboard
3. **EXPECTED**: "Edit" button hidden
4. **EXPECTED**: "Preview" button visible
5. Click "Preview"
6. **EXPECTED**: Read-only modal with all data
7. Try to cancel
8. **EXPECTED**: "Cannot cancel after purchase" error

---

## Files Requiring Changes

### Schema & Database
- `prisma/schema.prisma` - Add cancelledAt, cancelledReason
- Migration: `20251021_add_lead_cancellation_fields`

### Services
- `src/lib/services/lead-service.ts` - Add updateLead(), cancelLead(), canEditLead()

### API Routes
- `src/app/api/leads/[id]/route.ts` - PATCH endpoint (edit)
- `src/app/api/leads/[id]/cancel/route.ts` - PATCH endpoint (cancel)

### Components
- `src/components/LeadEditModal.tsx` - NEW (edit modal)
- `src/components/QuotePreviewModal.tsx` - NEW (read-only preview)
- `src/components/HomeownerSignupModal.tsx` - MODIFY (remove lead creation)

### Pages
- `src/app/page.tsx` - MODIFY (handle post-signup lead creation)
- `src/app/homeowner/dashboard/page.tsx` - MODIFY (add edit/cancel buttons)
- `src/app/admin/leads/page.tsx` - VERIFY (no changes needed)

---

## Implementation Plan

### Step 1: Fix Lead Creation Timing (T238)
1. Remove lines 136-148 from HomeownerSignupModal.tsx
2. In page.tsx, update handleHomeownerSignupSuccess():
   ```typescript
   const handleHomeownerSignupSuccess = async () => {
     setIsHomeownerSignupModalOpen(false);
     
     // Wait for session to be established
     await new Promise(resolve => setTimeout(resolve, 1000));
     
     // Verify session exists
     const { data: newSession } = await getSession();
     if (!newSession?.user) {
       alert('Session not established. Please try again.');
       return;
     }
     
     // Now create lead via API
     try {
       const response = await fetch('/api/leads', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           quoteType: selectedQuoteType,
           propertyPostcode: pendingQuoteData?.postcode,
           location: pendingQuoteData?.location,
           state: pendingQuoteData?.state,
           energyBill: pendingQuoteData?.electricityValue || 0,
           quoteData: pendingQuoteData,
           ...pendingQuoteData
         })
       });
       
       if (response.ok) {
         setIsQuoteSuccessModalOpen(true);
         setPendingQuoteData(null);
       } else {
         const data = await response.json();
         alert(data.error || 'Failed to create lead');
       }
     } catch (err) {
       console.error('Lead creation error:', err);
       alert('Failed to create lead. Please try again from your dashboard.');
     }
   };
   ```

### Step 2: Schema Migration (T239)
```prisma
model Lead {
  // ... existing fields
  cancelledAt     DateTime?
  cancelledReason String?       @db.Text
  cancelledBy     String?       // User ID who cancelled
}
```

### Step 3: Service Functions (T240, T241, T246)
```typescript
// lead-service.ts

export function canEditLead(status: LeadStatus): boolean {
  const editableStatuses = [
    LeadStatus.DRAFT,
    LeadStatus.PENDING_PHONE,
    LeadStatus.PENDING_APPROVAL
  ];
  return editableStatuses.includes(status);
}

export async function updateLead(
  leadId: string,
  homeownerId: string,
  updates: Partial<CreateLeadInput>
): Promise<{ success: boolean; lead?: any; error?: string }> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { status: true, homeownerId: true }
  });
  
  if (!lead) {
    return { success: false, error: 'Lead not found' };
  }
  
  if (lead.homeownerId !== homeownerId) {
    return { success: false, error: 'Unauthorized' };
  }
  
  if (!canEditLead(lead.status)) {
    return { success: false, error: 'Cannot edit lead after approval' };
  }
  
  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      quoteData: updates.quoteData,
      propertyPostcode: updates.propertyPostcode,
      location: updates.location,
      // ... other fields
      updatedAt: new Date()
    }
  });
  
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_UPDATED,
    entityType: 'lead',
    entityId: leadId,
    userId: homeownerId,
    metadata: { updates }
  });
  
  return { success: true, lead: updated };
}

export async function cancelLead(
  leadId: string,
  homeownerId: string,
  reason?: string
): Promise<{ success: boolean; error?: string; quotaRestored?: boolean }> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { status: true, homeownerId: true, purchasedAt: true }
  });
  
  if (!lead) {
    return { success: false, error: 'Lead not found' };
  }
  
  if (lead.homeownerId !== homeownerId) {
    return { success: false, error: 'Unauthorized' };
  }
  
  if (lead.purchasedAt) {
    return { success: false, error: 'Cannot cancel purchased lead' };
  }
  
  await prisma.$transaction([
    prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledReason: reason,
        cancelledBy: homeownerId
      }
    }),
    prisma.user.update({
      where: { id: homeownerId },
      data: {
        leadSubmissionCount: { decrement: 1 }
      }
    })
  ]);
  
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_CANCELLED,
    entityType: 'lead',
    entityId: leadId,
    userId: homeownerId,
    metadata: { reason }
  });
  
  return { success: true, quotaRestored: true };
}
```

---

## Next Steps

1. ✅ Audit complete - create Phase 4.10 in tasks.md
2. ⏭️ Implement T238 (fix lead creation timing)
3. ⏭️ Test guest flow end-to-end
4. ⏭️ Implement remaining tasks (T239-T247)
5. ⏭️ Final testing & user approval

---

## Appendix: Session Timing Investigation

**Test Results** (needs validation):
- signIn() completion time: ~500-800ms
- getServerSession() availability: ~1000-1500ms
- Recommendation: Use session hook instead of arbitrary timeout

**Better Approach**:
```typescript
// In page.tsx
const handleHomeownerSignupSuccess = async () => {
  setIsHomeownerSignupModalOpen(false);
  
  // Poll for session every 200ms, max 5 seconds
  let attempts = 0;
  const maxAttempts = 25;
  
  while (attempts < maxAttempts) {
    const { data: session } = await getSession();
    if (session?.user?.role === 'HOMEOWNER') {
      // Session ready! Create lead now
      await createLeadFromPendingData();
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    attempts++;
  }
  
  // Session not established after 5 seconds
  alert('Login successful but session not ready. Please create your quote from the dashboard.');
  router.push('/homeowner/dashboard');
};
```

---

**Audit Completed**: October 21, 2025  
**Next Phase**: Phase 4.10 Implementation  
**Estimated Completion**: 1-2 days
