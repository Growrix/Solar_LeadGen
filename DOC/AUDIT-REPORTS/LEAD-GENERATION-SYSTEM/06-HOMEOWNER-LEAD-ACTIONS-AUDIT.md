# Homeowner Lead Actions Audit Report

**Date**: November 16, 2025  
**Feature**: P1 High-Priority Lead Management (Edit, Cancel, Preview, Phone Sync)  
**Scope**: Homeowner dashboard lead action buttons and modals  
**Reference**: `DOC/AUDIT-REPORTS/LEAD-GENERATION-SYSTEM/05-ISSUES-AND-RECOMMENDATIONS.md`

---

## 🎯 Executive Summary

This audit examines the current state of homeowner lead management actions (Edit, Cancel, Preview, Phone Sync) to implement P1 high-priority features. The system **already has most components in place** but they are **not fully wired up** or visible in the UI.

### Key Findings

| Feature | Status | Components | API | Notes |
|---------|--------|------------|-----|-------|
| **Edit Lead** | ✅ 90% Complete | LeadEditModal exists | ❌ No PATCH endpoint | Modal works, needs API |
| **Cancel Lead** | ✅ 95% Complete | Button exists | ✅ API exists | Just needs visibility fix |
| **Preview Lead** | ✅ 100% Complete | LeadPreviewModal exists | N/A (read-only) | Fully functional |
| **Phone Sync** | ❌ 0% Complete | No warning UI | N/A | Needs implementation |

### Risk Assessment

- **Low Risk**: All existing functionality is preserved; we're only adding/fixing UI elements
- **No Breaking Changes**: Existing lead submission flow remains intact
- **Admin Impact**: Changes will automatically reflect in admin dashboard (uses same database)

---

## 📋 Current System Architecture

### Data Flow (Lead Actions)

```
Homeowner Dashboard
  └─ DashboardOverviewContent
      └─ Lead Card (in recentLeads map)
          ├─ Edit Button (visible if PENDING_APPROVAL) → LeadEditModal
          ├─ Preview Button (visible if APPROVED+) → LeadPreviewModal
          └─ Cancel Button (visible if !PURCHASED) → /api/leads/[id]/cancel
```

### File Structure

```
src/
├─ app/
│   ├─ homeowner/dashboard/page.tsx (Main dashboard - 1335 lines)
│   └─ api/leads/
│       ├─ route.ts (POST create, GET list)
│       └─ [id]/
│           └─ cancel/route.ts (PATCH cancel - ALREADY EXISTS)
│
├─ components/homeowner/
│   ├─ LeadEditModal.tsx (245 lines - ALREADY EXISTS)
│   └─ LeadPreviewModal.tsx (415 lines - ALREADY EXISTS)
│
└─ lib/services/
    └─ lead-service.ts (1350 lines)
        ├─ createLead() ✅
        ├─ cancelLead() ✅
        ├─ canCancelLead() ✅
        └─ updateLead() ❌ MISSING
```

---

## 🔍 Detailed Component Audit

### 1. LeadEditModal.tsx

**Location**: `src/components/homeowner/LeadEditModal.tsx`  
**Status**: ✅ **90% Complete** - Fully functional component, missing backend

**Current State**:
- ✅ Uses `SimplifiedQuoteForm` for pre-filled editing
- ✅ Handles form submission with PATCH request
- ✅ Shows success/error feedback
- ✅ Refreshes dashboard on success
- ❌ **PATCH /api/leads/[id] endpoint does NOT exist**

**Props**:
```typescript
interface LeadEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  initialData: Record<string, unknown> | null;
  onSaveSuccess: () => void;
}
```

**Integration Points**:
- Called from `handleEditLead()` in dashboard
- Pre-fills form with `lead.quoteData`
- Sends PATCH to `/api/leads/${leadId}`

**Issues Found**:
1. **Missing API Endpoint**: Frontend calls `PATCH /api/leads/[id]` but this route doesn't exist
2. **No Service Function**: `lead-service.ts` has no `updateLead()` function
3. **Button Not Visible**: Edit button only shows for `PENDING_APPROVAL` status (correct logic)

**Required Fixes**:
- ✅ Create `PATCH /api/leads/[id]` route
- ✅ Create `updateLead()` service function
- ✅ Add validation (only DRAFT/PENDING_APPROVAL can be edited)
- ✅ Ensure changes reflect in admin dashboard

---

### 2. Cancel Lead Flow

**Location**: `src/app/homeowner/dashboard/page.tsx` (line 934-962)  
**Status**: ✅ **95% Complete** - Fully functional, just needs UI visibility fix

**Current State**:
- ✅ `handleCancelLead()` function exists
- ✅ API endpoint `/api/leads/[id]/cancel` exists (PATCH)
- ✅ Service function `cancelLead()` exists
- ✅ Quota restoration logic implemented
- ⚠️ **Cancel button hidden** (only visible in old lead card design)

**API Route**: `src/app/api/leads/[id]/cancel/route.ts`
```typescript
export async function PATCH(req, { params: { id } }) {
  // ✅ Authentication check (homeowner only)
  // ✅ Ownership validation
  // ✅ Status check (cannot cancel PURCHASED)
  // ✅ Quota restoration
  // ✅ Audit logging
}
```

**Service Function**: `src/lib/services/lead-service.ts` (line 814-897)
```typescript
export async function cancelLead(
  leadId: string,
  userId: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string
) {
  // ✅ Ownership verification
  // ✅ Status validation (canCancelLead)
  // ✅ Update status to CANCELLED
  // ✅ Restore quota (decrement submission count)
  // ✅ Audit log with reason
}
```

**Current UI Implementation** (line 573 in dashboard):
```tsx
{canCancel && (
  <Button
    onClick={() => onCancelLead(lead)}
    variant="minimal"
    className="flex items-center gap-1 px-2 py-1 text-caption text-muted-foreground hover:text-error bg-transparent shadow-none"
    title="Cancel lead"
  >
    <XCircleIcon />
    <span className="hidden sm:inline">Cancel</span>
  </Button>
)}
```

**Business Rules** (from `canCancelLead`):
- ✅ DRAFT → Cancellable
- ✅ PENDING_PHONE → Cancellable
- ✅ PENDING_APPROVAL → Cancellable
- ❌ APPROVED → NOT cancellable (visible to installers)
- ❌ PURCHASED → NOT cancellable (installer involved)
- ❌ QUOTED → NOT cancellable (quotes received)
- ❌ ACCEPTED → NOT cancellable (deal closed)

**Issues Found**:
1. ❌ **Cancel button not visible in new lead card design** (line 520-590) - Button exists but is not rendered
2. ⚠️ **Inconsistent button logic**: `canCancel = lead.status !== PURCHASED` (line 537) but should use `canCancelLead()` helper

**Required Fixes**:
- ✅ Make cancel button visible in lead card UI
- ✅ Use `canCancelLead()` helper for consistent validation
- ✅ Add better confirmation dialog (currently uses `confirm()` and `prompt()`)
- ✅ Show cancellation reason in lead details

---

### 3. LeadPreviewModal.tsx

**Location**: `src/components/homeowner/LeadPreviewModal.tsx`  
**Status**: ✅ **100% Complete** - Fully functional, ready to use

**Current State**:
- ✅ Read-only modal for viewing lead details
- ✅ Shows all lead data in organized sections
- ✅ Includes verification badges, status indicators
- ✅ Boolean value formatting (checkmarks/crosses)
- ✅ Responsive design

**Props**:
```typescript
interface LeadPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    quoteType: string;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    quoteData: Record<string, any>;
  };
}
```

**Integration**:
- Called from `handlePreviewLead()` in dashboard
- Shows for APPROVED, PURCHASED, QUOTED, ACCEPTED statuses
- Pre-fills with `lead.quoteData`

**Issues Found**:
- ❌ **Preview button not visible** in current lead card design (should show for APPROVED+ statuses)

**Required Fixes**:
- ✅ Add preview button to lead card UI for APPROVED+ leads
- ✅ Show "Installer View" label to clarify what homeowners will see

---

### 4. Phone Number Sync (P1-05)

**Location**: N/A (not implemented)  
**Status**: ❌ **0% Complete** - Needs full implementation

**Current State**:
- ❌ No UI component
- ❌ No warning when User.phone ≠ Lead.phoneNumber
- ⚠️ Data can be inconsistent (User.phone updated, but Lead.phoneNumber stays old)

**Data Model**:
```typescript
// User table
User {
  phone: string | null
  phoneVerified: boolean
}

// Lead table
Lead {
  phoneNumber: string | null  // Phase 12: Can be different from User.phone
  phoneVerified: boolean      // Copied from User at creation
}
```

**Business Logic** (from lead-service.ts line 197-204):
```typescript
// At lead creation
Lead.phoneNumber = input.phoneNumber || homeowner?.phone || null
Lead.phoneVerified = homeowner?.phoneVerified || false
```

**Recommendation** (from 05-ISSUES-AND-RECOMMENDATIONS.md):
> **Option B: Lead phone independent, warn if different**
> ```typescript
> // Show warning if User.phone !== Lead.phoneNumber
> "⚠️ This lead uses a different phone number than your profile"
> ```

**Issues Found**:
1. ❌ No UI to warn user about phone mismatch
2. ❌ No guidance on which phone number to use
3. ⚠️ Profile updates don't propagate to existing leads (by design, but not communicated)

**Required Fixes**:
- ✅ Add warning badge to lead card if `User.phone !== Lead.phoneNumber`
- ✅ Show tooltip explaining independent phone numbers
- ✅ Add option to "sync" phone number in edit modal
- ✅ Document behavior in user-facing help text

---

## 🔧 Current UI Implementation

### Lead Card Structure (Dashboard)

**File**: `src/app/homeowner/dashboard/page.tsx` (line 520-590)

```tsx
<div className="flex items-center gap-3 p-3 rounded-full bg-background shadow-neu-outset">
  {/* Left: Quote type icon */}
  <div className="w-16 h-16 rounded-full bg-background shadow-neu-outset">
    {getQuoteTypeIcon(lead.quoteType)}
  </div>
  
  {/* Center: Lead details + countdown */}
  <div className="flex-1">
    <div className="rounded-full bg-background shadow-neu-inset px-6 py-3">
      {/* Countdown timer (APPROVED leads only) */}
      {lead.expiresAt && lead.status === 'APPROVED' && (
        <LiveCountdownBar expiresAt={lead.expiresAt} />
      )}
      
      {/* Lead info */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <span className="text-body-small">{QUOTE_TYPE_LABELS[lead.quoteType]}</span>
          <span className="text-caption text-muted-foreground">
            Created {formatDateTime(lead.createdAt)}
          </span>
        </div>
        
        {/* ACTION BUTTON AREA (Currently only Cancel) */}
        {canCancel && (
          <Button onClick={() => onCancelLead(lead)} variant="minimal">
            <XCircleIcon />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
        )}
      </div>
      
      {/* Status badges */}
      <div className="flex items-center gap-2 mt-1">
        {lead.phoneVerified && <span className="badge">Verified</span>}
        <span className="badge">{statusInfo.label}</span>
      </div>
    </div>
  </div>
</div>
```

**Problems**:
1. ❌ No Edit button (should show for PENDING_APPROVAL)
2. ❌ No Preview button (should show for APPROVED+)
3. ⚠️ Cancel button logic inconsistent (uses simple status check, not `canCancelLead()`)
4. ❌ No phone sync warning

---

## 🎯 Implementation Requirements

### P1-01: Lead Editing Capability

**Goal**: Allow homeowners to edit DRAFT/PENDING_APPROVAL leads

**Components to Create/Update**:
1. ✅ **LeadEditModal.tsx** - Already exists, fully functional
2. ❌ **API Route** - Create `src/app/api/leads/[id]/route.ts` (PATCH handler)
3. ❌ **Service Function** - Add `updateLead()` to `lead-service.ts`
4. ✅ **UI Button** - Add to lead card for PENDING_APPROVAL leads

**Business Rules**:
- Only DRAFT and PENDING_APPROVAL leads can be edited
- Cannot change `quoteType` (affects pricing)
- Cannot change `homeownerId` (security)
- Cannot change `status`, `visibility`, `leadPrice` (admin-controlled)
- All other fields can be updated

**API Endpoint Design**:
```typescript
// PATCH /api/leads/[id]
// Auth: Homeowner (must own lead)
// Body: Partial<Lead> (only allowed fields)

Allowed fields:
- energyBill, billType, roofType, budgetRange, desiredOffset
- batteryRequired, batteryCapacity, batteryBrand, batteryUsage
- timeframe, additionalNotes
- name, phoneNumber, address (Phase 12 fields)
- panelOrientation, roofTilt, shadingLevel, usagePattern
- hasExistingSystem, existingSystemSize
- includeEVCharging, includeSmartHome, includeGridServices
- panelBrand, systemSizeOverride, retailer, tariffPlan
- customRetailRate, customFeedInRate
- peakDemand, isThreePhase, projectPriority
- quoteData (complete form data for future reference)

NOT allowed:
- quoteType, status, visibility, leadPrice (admin only)
- homeownerId, installerId (security)
- createdAt, approvedAt, expiresAt (system-managed)
```

**Service Function Signature**:
```typescript
export async function updateLead(
  leadId: string,
  userId: string,  // For authorization
  updates: Partial<Lead>,
  ipAddress?: string,
  userAgent?: string
): Promise<Lead> {
  // 1. Verify ownership
  // 2. Verify editable status (DRAFT or PENDING_APPROVAL)
  // 3. Filter allowed fields
  // 4. Update database
  // 5. Log audit trail
  // 6. Return updated lead
}
```

---

### P1-02: Lead Cancellation Not Connected

**Goal**: Wire up cancel button and improve UX

**Components to Update**:
1. ✅ **API Route** - Already exists at `src/app/api/leads/[id]/cancel/route.ts`
2. ✅ **Service Function** - Already exists `cancelLead()` in `lead-service.ts`
3. ⚠️ **UI Button** - Make visible and improve logic
4. ❌ **Confirmation Dialog** - Replace `confirm()` with proper modal

**Current Issues**:
- Cancel button exists but not rendered in new card design
- Uses browser `confirm()` and `prompt()` (poor UX)
- Status check logic inconsistent with `canCancelLead()` helper

**Required Changes**:
```tsx
// In lead card (line 520-590)
const canCancel = canCancelLead({ status: lead.status });  // Use helper, not simple check

{/* Action buttons group */}
<div className="flex items-center gap-2">
  {canEdit && (
    <Button onClick={() => onEditLead(lead)} variant="minimal">
      <EditIcon /> Edit
    </Button>
  )}
  {canPreview && (
    <Button onClick={() => onPreviewLead(lead)} variant="minimal">
      <EyeIcon /> Preview
    </Button>
  )}
  {canCancel && (
    <Button onClick={() => onCancelLead(lead)} variant="minimal" className="hover:text-error">
      <XCircleIcon /> Cancel
    </Button>
  )}
</div>
```

**Quota Restoration Logic** (already implemented):
```typescript
// lead-service.ts (line 867-873)
await prisma.user.update({
  where: { id: existingLead.homeownerId },
  data: {
    leadSubmissionCount: { decrement: 1 },
    // TODO: Also decrement biddingLeadsSubmitted if quoteType === 'BIDDING'
  },
});
```

**⚠️ Found Issue**: BIDDING quota not restored on cancel! Needs fix.

---

### P1-04: No Lead Preview for Homeowners

**Goal**: Allow homeowners to preview approved leads (installer view)

**Components to Update**:
1. ✅ **LeadPreviewModal.tsx** - Already exists, fully functional
2. ❌ **UI Button** - Add to lead card for APPROVED+ leads

**Business Rules**:
- Preview available for: APPROVED, PURCHASED, QUOTED, ACCEPTED
- Shows all details installers see
- Masked contact info (shows after purchase)
- Includes lead price, expiry countdown

**Required Changes**:
```tsx
// In lead card
const canPreview = [
  'APPROVED',
  'PURCHASED',
  'QUOTED',
  'ACCEPTED'
].includes(lead.status);

{canPreview && (
  <Button onClick={() => onPreviewLead(lead)} variant="minimal">
    <EyeIcon />
    <span className="hidden sm:inline">Preview</span>
  </Button>
)}
```

**Modal Already Has**:
- ✅ All lead details in organized sections
- ✅ Status badge
- ✅ Verification indicators
- ✅ Boolean value formatting
- ✅ Date formatting
- ✅ Responsive design

---

### P1-05: Phone Number Sync Warning

**Goal**: Warn users when Lead.phoneNumber differs from User.phone

**Components to Create**:
1. ❌ **Warning Badge** - Add to lead card
2. ❌ **Tooltip** - Explain independent phone numbers
3. ❌ **Edit Modal Enhancement** - Show current phone vs profile phone
4. ❌ **Sync Option** - Allow updating lead phone to match profile

**UI Design**:
```tsx
// In lead card (after verification badge)
{lead.phoneNumber !== session.user.phone && (
  <span 
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-warning/10 text-warning shadow-neu-inset text-caption"
    title="This lead uses a different phone number than your profile"
  >
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
    <span>Different Phone</span>
  </span>
)}
```

**Edit Modal Enhancement**:
```tsx
// In LeadEditModal (show at top of form)
{initialData?.phoneNumber !== userProfile?.phone && (
  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
    <h4 className="text-body-small text-warning mb-2">📞 Phone Number Notice</h4>
    <p className="text-caption text-muted-foreground mb-3">
      This lead uses <strong>{initialData?.phoneNumber}</strong>, 
      but your profile shows <strong>{userProfile?.phone}</strong>.
    </p>
    <Button 
      variant="secondary" 
      size="sm"
      onClick={() => updatePhoneNumber(userProfile.phone)}
    >
      Sync with Profile Phone
    </Button>
  </div>
)}
```

---

## 🚀 Implementation Plan

### Phase Setup

**Branch**: `007-part-b-homeowner-lead-actions`  
**Estimated Time**: 6-8 hours  
**Prerequisites**: 
- ✅ Design system in place (neumorphic tokens)
- ✅ Dashboard UI stabilized
- ✅ Lead submission flow working

---

### Subtask Breakdown

#### Task 1: Create Lead Edit API Endpoint (1.5 hours)

**Files to Create/Update**:
1. `src/app/api/leads/[id]/route.ts` (NEW - PATCH handler)
2. `src/lib/services/lead-service.ts` (ADD `updateLead` function)

**Acceptance Criteria**:
- [ ] PATCH endpoint created at `/api/leads/[id]`
- [ ] Authentication required (homeowner only)
- [ ] Ownership validation (lead belongs to user)
- [ ] Status validation (only DRAFT/PENDING_APPROVAL)
- [ ] Field filtering (allowed fields only)
- [ ] Audit logging
- [ ] TypeScript errors resolved
- [ ] `npm run build` passes

**Implementation Steps**:
1. Create `src/app/api/leads/[id]/route.ts` with PATCH handler
2. Add `updateLead()` function to `lead-service.ts`
3. Add `canEditLead()` helper function
4. Test with curl/Postman

---

#### Task 2: Fix Cancel Button Visibility (30 min)

**Files to Update**:
1. `src/app/homeowner/dashboard/page.tsx` (line 520-590)
2. Import `canCancelLead` helper from lead-service

**Acceptance Criteria**:
- [ ] Cancel button visible in lead card
- [ ] Uses `canCancelLead()` helper for validation
- [ ] Shows for DRAFT, PENDING_PHONE, PENDING_APPROVAL only
- [ ] Hidden for APPROVED, PURCHASED, QUOTED, ACCEPTED
- [ ] Confirmation dialog functional
- [ ] Quota restored on cancel
- [ ] Dashboard refreshes after cancel

**Implementation Steps**:
1. Add cancel button to lead card action area
2. Import and use `canCancelLead()` helper
3. Test cancellation flow
4. Verify quota restoration in database

---

#### Task 3: Fix BIDDING Quota Restoration (15 min)

**Files to Update**:
1. `src/lib/services/lead-service.ts` (line 867-873 in `cancelLead()`)

**Acceptance Criteria**:
- [ ] BIDDING quota restored when BIDDING lead cancelled
- [ ] Regular quota also restored
- [ ] Audit log shows both quota changes

**Implementation**:
```typescript
// In cancelLead() function
const updateData: any = {
  leadSubmissionCount: { decrement: 1 },
};

// If BIDDING lead, also restore BIDDING quota
if (existingLead.quoteType === 'BIDDING') {
  updateData.biddingLeadsSubmitted = { decrement: 1 };
}

await prisma.user.update({
  where: { id: existingLead.homeownerId },
  data: updateData,
});
```

---

#### Task 4: Add Edit Button to Lead Card (30 min)

**Files to Update**:
1. `src/app/homeowner/dashboard/page.tsx` (line 520-590)

**Acceptance Criteria**:
- [ ] Edit button visible for PENDING_APPROVAL leads
- [ ] Edit button hidden for other statuses
- [ ] Clicking opens LeadEditModal with pre-filled data
- [ ] Modal closes on successful save
- [ ] Dashboard refreshes after edit

**Implementation**:
```tsx
const canEdit = lead.status === 'PENDING_APPROVAL';

{canEdit && (
  <Button onClick={() => onEditLead(lead)} variant="minimal">
    <EditIcon />
    <span className="hidden sm:inline">Edit</span>
  </Button>
)}
```

---

#### Task 5: Add Preview Button to Lead Card (30 min)

**Files to Update**:
1. `src/app/homeowner/dashboard/page.tsx` (line 520-590)

**Acceptance Criteria**:
- [ ] Preview button visible for APPROVED+ leads
- [ ] Preview button hidden for DRAFT/PENDING leads
- [ ] Clicking opens LeadPreviewModal with lead data
- [ ] Modal shows read-only view
- [ ] "Installer View" label visible

**Implementation**:
```tsx
const canPreview = [
  'APPROVED',
  'PURCHASED',
  'QUOTED',
  'ACCEPTED'
].includes(lead.status);

{canPreview && (
  <Button onClick={() => onPreviewLead(lead)} variant="minimal">
    <EyeIcon />
    <span className="hidden sm:inline">Preview</span>
  </Button>
)}
```

---

#### Task 6: Add Phone Sync Warning (1 hour)

**Files to Update**:
1. `src/app/homeowner/dashboard/page.tsx` (line 550-560 - badge area)
2. `src/components/homeowner/LeadEditModal.tsx` (add warning section)

**Acceptance Criteria**:
- [ ] Warning badge shows when Lead.phoneNumber ≠ User.phone
- [ ] Tooltip explains independent phone numbers
- [ ] Edit modal shows phone comparison
- [ ] "Sync with Profile" button functional
- [ ] Phone update triggers lead update API

**Implementation Steps**:
1. Add badge to lead card
2. Fetch user profile phone from session
3. Compare with lead.phoneNumber
4. Add warning section to LeadEditModal
5. Add sync button handler

---

#### Task 7: Visual Verification (30 min)

**Acceptance Criteria**:
- [ ] All 3 themes tested (Dark, Light, Purple)
- [ ] All 5 breakpoints tested (320px, 375px, 768px, 1024px, 1440px)
- [ ] Buttons have proper hover states
- [ ] Modals have proper shadows
- [ ] No hardcoded colors (0/0/0/0/0/0 verification)

**Verification Commands**:
```powershell
# Command 1: Hardcoded colors
Select-String -Path "src\app\homeowner\dashboard\page.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"

# Command 2: Dark mode classes
Select-String -Path "src\app\homeowner\dashboard\page.tsx" -Pattern "dark:"

# Command 3: RGB/HEX colors
Select-String -Path "src\app\homeowner\dashboard\page.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"

# Command 4: Hardcoded white/black
Select-String -Path "src\app\homeowner\dashboard\page.tsx" -Pattern "text-white|bg-white|text-black|bg-black"

# Command 5: Hardcoded typography
Select-String -Path "src\app\homeowner\dashboard\page.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"

# Command 6: Manual responsive classes
Select-String -Path "src\app\homeowner\dashboard\page.tsx" -Pattern "sm:text-|md:text-|lg:text-"
```

Expected: **0/0/0/0/0/0** (all zero matches)

---

#### Task 8: Functional Testing (1 hour)

**Test Scenarios**:

**Test 1: Edit Lead**
- [ ] Create PENDING_APPROVAL lead
- [ ] Click Edit button
- [ ] Modify energy bill, roof type, notes
- [ ] Submit form
- [ ] Verify lead updated in dashboard
- [ ] Verify lead updated in admin view
- [ ] Verify audit log created

**Test 2: Cancel Lead**
- [ ] Create PENDING_APPROVAL lead
- [ ] Note current quota (e.g., 2/5)
- [ ] Click Cancel button
- [ ] Confirm cancellation
- [ ] Verify quota restored (3/5)
- [ ] Verify lead status = CANCELLED
- [ ] Verify audit log created
- [ ] Test with BIDDING lead (verify BIDDING quota restored)

**Test 3: Preview Lead**
- [ ] Create and approve lead (admin action)
- [ ] Click Preview button
- [ ] Verify all lead details visible
- [ ] Verify status badge shows "Approved"
- [ ] Verify modal is read-only
- [ ] Close modal

**Test 4: Phone Sync Warning**
- [ ] Update user profile phone to different number
- [ ] Create lead with old phone number
- [ ] Verify warning badge shows
- [ ] Hover to see tooltip
- [ ] Click Edit
- [ ] Verify warning section in modal
- [ ] Click "Sync with Profile"
- [ ] Verify lead phone updated

---

#### Task 9: Admin Dashboard Verification (30 min)

**Acceptance Criteria**:
- [ ] Edited leads show updated data in admin view
- [ ] Cancelled leads show CANCELLED status
- [ ] Lead cards show correct phone number
- [ ] Audit logs visible in admin panel

**Test Steps**:
1. Login as admin
2. Navigate to `/admin/leads`
3. Find edited lead
4. Verify updated fields
5. Find cancelled lead
6. Verify CANCELLED status
7. Check audit log

---

#### Task 10: Build Validation (15 min)

**Acceptance Criteria**:
- [ ] `npx tsc --noEmit` passes (0 errors)
- [ ] `npm run build` passes
- [ ] No console errors in browser
- [ ] No React warnings

**Commands**:
```powershell
npx tsc --noEmit
npm run build
```

---

#### Task 11: Documentation and Commit (30 min)

**Files to Update**:
1. `specs/006-component-by-component/tasks.md` (add Phase 14)
2. `DOC/AUDIT-REPORTS/LEAD-GENERATION-SYSTEM/05-ISSUES-AND-RECOMMENDATIONS.md` (mark P1-01, P1-02, P1-04, P1-05 as implemented)

**Commit Message**:
```
feat(homeowner): implement P1 lead actions (edit, cancel, preview, phone sync)

- Add PATCH /api/leads/[id] endpoint for lead editing
- Add updateLead() service function with validation
- Fix cancel button visibility in lead cards
- Fix BIDDING quota restoration on cancel
- Add edit button for PENDING_APPROVAL leads
- Add preview button for APPROVED+ leads
- Add phone sync warning badge and modal section
- Test all actions across 3 themes and 5 breakpoints
- Verify changes reflect in admin dashboard

Resolves: P1-01, P1-02, P1-04, P1-05 from 05-ISSUES-AND-RECOMMENDATIONS.md
```

---

## 📊 Impact Assessment

### Database Changes

**No schema changes required** - All fields already exist:
- ✅ `Lead.phoneNumber` (Phase 12)
- ✅ `Lead.quoteData` (Phase 4.5)
- ✅ `Lead.cancelledBy`, `Lead.cancelledAt`, `Lead.cancelledReason` (Phase 4.11)
- ✅ `User.phone`, `User.phoneVerified` (Existing)
- ✅ `User.leadSubmissionCount`, `User.biddingLeadsSubmitted` (Existing)

### API Changes

**New Endpoints**:
- `PATCH /api/leads/[id]` - Update lead (NEW)

**Existing Endpoints** (no changes):
- `POST /api/leads` - Create lead
- `GET /api/leads` - List leads
- `PATCH /api/leads/[id]/cancel` - Cancel lead (already exists)

### Admin Dashboard Impact

**Automatic Updates** (no code changes needed):
- Edited leads show new data (database read)
- Cancelled leads show CANCELLED status (database read)
- Phone numbers updated (database read)
- Audit logs captured (existing logging)

### Installer Impact

**No changes** - Installers not affected:
- Edit only available for PENDING_APPROVAL (before installer sees)
- Cancel only available before PURCHASED (before installer involvement)
- Preview is homeowner-only view

---

## 🎯 Success Criteria

### Functional

- [ ] Homeowners can edit PENDING_APPROVAL leads
- [ ] Homeowners can cancel DRAFT/PENDING leads
- [ ] Homeowners can preview APPROVED+ leads
- [ ] Phone sync warning shows when phones differ
- [ ] Quota restored on cancel (including BIDDING)
- [ ] All changes reflect in admin dashboard
- [ ] No existing functionality broken

### Technical

- [ ] 0/0/0/0/0/0 verification (no hardcoded values)
- [ ] All 3 themes work (Dark, Light, Purple)
- [ ] All 5 breakpoints work (320px-1440px)
- [ ] TypeScript compiles (0 errors)
- [ ] Build succeeds
- [ ] No console errors/warnings

### User Experience

- [ ] Clear button labels (Edit, Cancel, Preview)
- [ ] Proper confirmation dialogs (not browser `confirm()`)
- [ ] Success/error feedback messages
- [ ] Tooltips for warnings
- [ ] Responsive on mobile

---

## 🔍 Risk Mitigation

### Risk 1: Breaking Existing Lead Submission

**Mitigation**:
- Only add UI buttons and API endpoint
- Do not modify `createLead()` function
- Do not modify lead submission flow
- Test existing flow after changes

### Risk 2: Admin Dashboard Desync

**Mitigation**:
- Changes go directly to database (no caching)
- Admin uses same database queries
- Test admin view after each change

### Risk 3: Quota Confusion

**Mitigation**:
- Use existing quota decrement logic
- Add BIDDING quota restoration
- Show clear success messages
- Test quota tracking thoroughly

### Risk 4: TypeScript Errors

**Mitigation**:
- Use existing types from Prisma
- Follow existing patterns in codebase
- Run `tsc --noEmit` frequently
- Fix errors before commit

---

## 📝 Notes for Implementation

### Design System Compliance

**Use semantic tokens ONLY**:
```css
/* Colors */
bg-surface, bg-background, bg-primary, bg-success, bg-warning, bg-error
text-foreground, text-muted-foreground, text-primary

/* Shadows */
shadow-neu-outset, shadow-neu-inset, shadow-neu-outset-sm

/* Typography */
text-body, text-body-small, text-caption, text-heading-4

/* Borders */
border-border, rounded-card, rounded-lg
```

### Button Variants

**Use existing Button component**:
```tsx
<Button variant="minimal">  // For action buttons
<Button variant="secondary">  // For confirm actions
<Button variant="ghost">  // For cancel actions
```

### Modal Patterns

**Follow existing modal structure**:
```tsx
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
  <div className="theme-card relative w-full max-w-4xl p-6">
    {/* Header with close button */}
    {/* Content */}
    {/* Footer with actions */}
  </div>
</div>
```

### Confirmation Dialogs

**Replace browser confirm() with custom modal**:
```tsx
// TODO: Create ConfirmationDialog component
<ConfirmationDialog
  isOpen={showConfirm}
  title="Cancel Lead?"
  message="This action cannot be undone. Your quota will be restored."
  onConfirm={handleConfirm}
  onCancel={() => setShowConfirm(false)}
  confirmText="Yes, Cancel Lead"
  cancelText="Keep Lead"
  variant="warning"
/>
```

---

## ✅ Checklist Before Implementation

- [x] Audit report created
- [ ] Phase added to tasks.md
- [ ] User approval received
- [ ] Design tokens verified (0/0/0/0/0/0)
- [ ] Backup created (optional, small changes)
- [ ] Branch created: `007-part-b-homeowner-lead-actions`

---

**End of Audit Report**

**Next Steps**: 
1. Add Phase 14 to `specs/006-component-by-component/tasks.md`
2. Get user approval for implementation
3. Begin Task 1: Create Lead Edit API Endpoint
