# Admin Lead Assignment Flow - Comprehensive Audit Report

**Date:** November 26, 2025  
**Audit Scope:** Admin lead assignment process from approval to installer visibility  
**Issues Identified:** 3 critical workflow issues

---

## 🔍 EXECUTIVE SUMMARY

### Issues Found:
1. **Actions Section**: Approve/Reject buttons shown in Admin Lead Detail page when not needed
2. **Double Assignment Required**: First attempt (Approve) doesn't assign, second attempt (Save Changes) works
3. **Countdown Ignoring Admin Input**: System uses default 6-7 days instead of admin-specified days

### Root Causes Identified:
- Dual approval workflows causing confusion (standalone approve vs. Management Modal approve)
- Missing direct assignment flow in approval API
- Countdown calculation inconsistency between approval and assignment APIs

---

## 📋 CURRENT SYSTEM ARCHITECTURE

### Admin Lead Management Flow

```
Homeowner Submits Lead
         ↓
Admin Leads List Page (/admin/leads)
         ↓
Click Row → Lead Detail Page (/admin/leads/[id])
         ↓
    [Current UI Shows]
    ┌─────────────────────────────────────┐
    │ 1. "Manage Lead" Button (modal)     │ ✅ KEEP THIS
    │ 2. "Actions" Section with:          │ ❌ REMOVE THIS
    │    - Approve Lead Button            │
    │    - Reject Lead Button             │
    └─────────────────────────────────────┘
```

### Current Assignment Flow (BROKEN)

```
**Attempt 1 (Fails):**
Click "Manage Lead" Button
    ↓
AdminLeadManagementModal Opens
    ↓
Select Installers + Set Countdown (e.g., 3 days) + Set Price
    ↓
Click "Approve" Button
    ↓
API: POST /api/leads/[id]/approve
    ↓
Response: "Lead approved with 6 days countdown" ✅
    ↓
Check Installer Feed: NO LEADS SHOWING ❌
Check Modal: NO UPDATES VISIBLE ❌

**Attempt 2 (Works):**
Click "Manage Lead" Button AGAIN
    ↓
Modal Reopens (lead now APPROVED status)
    ↓
Select Installers AGAIN + Set Countdown AGAIN
    ↓
Click "Save Changes" Button
    ↓
API: POST /api/admin/leads/[id]/assign
    ↓
Response: "Lead assigned successfully" ✅
    ↓
Check Installer Feed: LEADS SHOWING ✅
Countdown: Shows 6-7 days (ignores admin's 3-day setting) ❌
```

---

## 🔧 TECHNICAL ANALYSIS

### Issue #1: Redundant Actions Section

**Location:** `src/app/admin/leads/[id]/page.tsx` lines 1000-1020

**Current Code:**
```tsx
{/* ACTION BUTTONS - Show for DRAFT, PENDING_APPROVAL, and PENDING_PHONE statuses */}
{(['DRAFT', 'PENDING_APPROVAL', 'PENDING_PHONE'].includes(lead.status)) && (
  <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
    <h2 className="text-heading-3 mb-4 text-foreground">
      Actions
    </h2>
    <div className="space-y-3">
      <Button onClick={() => setShowApproveModal(true)}>
        Approve Lead
      </Button>
      <Button onClick={() => setShowRejectModal(true)}>
        Reject Lead
      </Button>
    </div>
  </div>
)}
```

**Problem:**
- Duplicate approval UI (separate modal + management modal)
- User confusion: which approve button to use?
- Management Modal provides comprehensive approval flow already

**Solution:**
- Remove entire "Actions" section div
- Keep only "Manage Lead" button which opens AdminLeadManagementModal
- Remove standalone approve/reject modals and handlers

---

### Issue #2: Two-Step Assignment Requirement

**Root Cause Analysis:**

**File 1:** `src/app/api/leads/[id]/approve/route.ts`
- **Purpose:** Approve lead + optionally assign to installers
- **Current Behavior:** 
  - Accepts `assignTo` parameter (array of installer IDs)
  - Creates `LeadAssignment` records if `assignTo` provided
  - Sets `expiresAt` based on `countdownDays` parameter
- **Problem:** Frontend doesn't pass `assignTo` when calling this endpoint

**File 2:** `src/app/api/admin/leads/[id]/assign/route.ts`
- **Purpose:** Assign already-approved lead to installers
- **Current Behavior:**
  - Creates `LeadAssignment` records
  - Sends notifications to installers
  - Does NOT set `expiresAt` (lead already approved)
- **Problem:** Separate step required after approval

**File 3:** `src/app/admin/leads/[id]/page.tsx` (handler)
```typescript
// Line 1148: Approval handler
onApprove={async (data: any) => {
  // Transform modal data to match handleApprove signature
  await handleApprove(); // ❌ NO DATA PASSED
  setShowManagementModal(false);
}}
```

**File 4:** `src/components/admin/AdminLeadManagementModal.tsx`
- **Purpose:** Unified modal for all lead management actions
- **Current Behavior:**
  - Collects installer selection, countdown days, pricing
  - Has separate "Approve" and "Save Changes" buttons
  - "Approve" calls `onApprove()` prop
  - "Save Changes" calls `onAssign()` prop
- **Problem:** Two separate buttons doing partial operations

---

### Issue #3: Countdown Ignoring Admin Input

**Countdown Service:** `src/lib/services/countdown-service.ts`
- Function: `calculateExpiresAt(days: number)`
- Uses: `Date.now() + (days * 24 * 60 * 60 * 1000)`

**Approve API:** `src/app/api/leads/[id]/approve/route.ts` (lines 100-120)
```typescript
// Get countdown days from request or default setting
const defaultCountdownDays = await getSettingAsNumber('LEAD_COUNTDOWN_DEFAULT_DAYS');
const countdownDays = body.countdownDays || defaultCountdownDays; // ✅ Correct

// Validate countdown duration
const validation = validateCountdownDuration(countdownDays);

// Calculate expiry timestamp
expiresAt = calculateExpiresAt(countdownDays); // ✅ Uses correct value
```

**Problem Location:** Frontend not passing `countdownDays` in API call

**File:** `src/app/admin/leads/[id]/page.tsx` lines 1148-1152
```typescript
onApprove={async (data: any) => {
  // ❌ data parameter contains { enableCountdown, countdownDays, installerIds, etc. }
  // ❌ BUT handleApprove() is called with NO arguments
  await handleApprove(); // Uses default state values, not modal data
  setShowManagementModal(false);
}}
```

**handleApprove Function:** Lines 215-250
```typescript
const handleApprove = async () => {
  // Uses component state: enableCountdown, countdownDays
  // These are set to defaults (true, 7) and never updated from modal
  const response = await fetch(`/api/leads/${lead.id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price: parseFloat(leadPrice),
      enableCountdown, // ❌ Default state value (true)
      countdownDays,   // ❌ Default state value (7)
      // ❌ MISSING: assignTo parameter from modal
    }),
  });
}
```

---

## 📊 DATA FLOW DIAGRAM (CURRENT - BROKEN)

```
AdminLeadManagementModal
    ↓
  [User Actions]
  - Select 2 installers
  - Set countdown: 3 days
  - Set price: £25
  - Click "Approve"
    ↓
  onApprove(data) prop called
  data = {
    enableCountdown: true,
    countdownDays: 3,
    installerIds: ['id1', 'id2'],
    mode: 'competitive',
    notes: '...'
  }
    ↓
  ❌ DISCONNECT: handleApprove() called with NO parameters
    ↓
  POST /api/leads/[id]/approve
  Body: {
    price: 25,
    enableCountdown: true,  // ✅
    countdownDays: 7,       // ❌ Wrong (uses default state, not modal input)
    // ❌ MISSING: assignTo field
  }
    ↓
  Lead updated:
  - status: APPROVED ✅
  - expiresAt: now + 7 days ❌
  - LeadAssignment records: NOT CREATED ❌
    ↓
  Installer Feed: EMPTY (no assignments exist) ❌
```

---

## 🎯 REQUIRED SOLUTION

### Desired Flow (ONE-STEP):

```
Click "Manage Lead"
    ↓
AdminLeadManagementModal Opens
    ↓
[Sections Visible]
┌─────────────────────────────────────────────┐
│ A. Pricing (optional - pre-filled)         │
│ B. Installer Assignment (required)         │
│ C. Countdown Settings (required)           │
│ D. Admin Notes (optional)                  │
│ E. Mode: Exclusive/Competitive (required)  │
└─────────────────────────────────────────────┘
    ↓
User fills:
- Selects 2 installers
- Sets countdown: 3 days
- Confirms price: £25
- Mode: Competitive
    ↓
Clicks SINGLE BUTTON: "Approve & Assign Lead"
    ↓
Frontend calls: POST /api/leads/[id]/approve
Body: {
  price: 25,
  assignTo: ['id1', 'id2'],
  enableCountdown: true,
  countdownDays: 3,
  isHot: false,
  assignmentNotes: '...'
}
    ↓
Backend (approve/route.ts):
1. Set status = APPROVED ✅
2. Set expiresAt = now + 3 days ✅
3. Create LeadAssignment records ✅
4. Notify installers ✅
    ↓
Response: {
  success: true,
  message: "Lead assigned successfully",
  countdown: { daysLeft: 3, ... }
}
    ↓
Installer Feed: LEADS VISIBLE IMMEDIATELY ✅
Countdown: 3 days (as specified) ✅
```

---

## 🔨 IMPLEMENTATION PLAN

### Phase 9: Admin Lead Assignment Fix

#### Task 9.1: Remove Redundant Actions Section
**File:** `src/app/admin/leads/[id]/page.tsx`

**Changes:**
1. Remove entire "Actions" section div (lines ~1000-1020)
2. Remove `showApproveModal` state
3. Remove `showRejectModal` state
4. Remove standalone `handleApprove()` function
5. Remove standalone `handleReject()` function
6. Remove approve modal JSX
7. Remove reject modal JSX

**Keep:**
- "Manage Lead" button (line ~980)
- `showManagementModal` state
- AdminLeadManagementModal component
- Assignment History section

---

#### Task 9.2: Fix AdminLeadManagementModal Data Flow
**File:** `src/app/admin/leads/[id]/page.tsx`

**Update onApprove Handler:**
```typescript
onApprove={async (data: {
  enableCountdown: boolean;
  countdownDays: number;
  price?: number;
  installerIds: string[];
  mode: 'exclusive' | 'competitive';
  notes?: string;
  notifyInstallers: boolean;
}) => {
  try {
    const response = await fetch(`/api/leads/${lead.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: data.price || parseFloat(leadPrice),
        assignTo: data.installerIds, // ✅ Pass installer IDs
        enableCountdown: data.enableCountdown,
        countdownDays: data.countdownDays, // ✅ Use modal value
        assignmentNotes: data.notes,
        isHot: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve and assign lead');
    }

    await fetchLead(); // Refresh lead data
    setShowManagementModal(false);
    alert('Lead assigned successfully!');
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to approve lead');
    throw err; // Don't close modal on error
  }
}}
```

---

#### Task 9.3: Simplify AdminLeadManagementModal Buttons
**File:** `src/components/admin/AdminLeadManagementModal.tsx`

**Current Problem:** Two buttons with unclear purposes
- "Approve" button (calls onApprove)
- "Save Changes" button (calls onAssign)

**Solution:**

1. **For PENDING_APPROVAL/DRAFT leads:** Show single button "Approve & Assign Lead"
   - Calls `onApprove()` with all collected data
   - Requires: At least 1 installer selected
   - Button disabled if no installers selected

2. **For APPROVED leads:** Show "Save Changes" button
   - Calls `onAssign()` for adding/updating assignments
   - Existing functionality preserved

**Code Changes:**
```tsx
{/* Footer - Conditional based on lead status */}
<div className="border-t border-border p-6 flex gap-3">
  {(['DRAFT', 'PENDING_APPROVAL', 'PENDING_PHONE'].includes(lead.status)) ? (
    // Unapproved lead - single button for approve + assign
    <Button
      onClick={() => {
        if (selectedInstallerIds.length === 0) {
          alert('Please select at least one installer');
          return;
        }
        onApprove({
          enableCountdown: countdownEnabled,
          countdownDays: countdown Days,
          price: parseFloat(price),
          installerIds: selectedInstallerIds,
          mode: assignmentMode,
          notes: assignmentNotes,
          notifyInstallers: true,
        });
      }}
      disabled={selectedInstallerIds.length === 0}
      variant="primary"
      className="flex-1"
    >
      ✅ Approve & Assign Lead to {selectedInstallerIds.length} Installer(s)
    </Button>
  ) : (
    // Already approved - allow assignment updates
    <Button
      onClick={() => {
        if (selectedInstallerIds.length === 0) {
          alert('Please select at least one installer');
          return;
        }
        onAssign({
          installerIds: selectedInstallerIds,
          mode: assignmentMode,
          notes: assignmentNotes,
          notifyInstallers: true,
        });
      }}
      disabled={selectedInstallerIds.length === 0}
      variant="primary"
      className="flex-1"
    >
      💾 Save Changes
    </Button>
  )}
  
  <Button onClick={onClose} variant="secondary">
    Cancel
  </Button>
</div>
```

---

#### Task 9.4: Update API approve/route.ts (Verification)
**File:** `src/app/api/leads/[id]/approve/route.ts`

**Verify:** Lines 179-210 already handle assignment creation

```typescript
// Create LeadAssignment records and notify assigned installers (if specific assignment)
if (body.assignTo && body.assignTo !== 'ALL' && Array.isArray(body.assignTo)) {
  // Create LeadAssignment records in database
  await prisma.leadAssignment.createMany({
    data: body.assignTo.map((installerId: string) => ({
      leadId: id,
      installerId,
      assignedBy: session.user.id,
      notes: body.assignmentNotes || null,
    })),
    skipDuplicates: true,
  });

  // Send notifications to assigned installers
  for (const installerId of body.assignTo) {
    await createNotification({
      userId: installerId,
      type: 'NEW_LEAD',
      title: 'New Lead Available',
      message: `A new ${body.isHot ? 'HOT ' : ''}lead has been assigned to you.`,
      actionUrl: `/installer/marketplace`,
      metadata: { leadId: id },
    });
  }
}
```

**Status:** ✅ Backend code is correct, just needs frontend to pass data

---

## 📝 TESTING PLAN

### Test Case 1: Single-Step Assignment

**Prerequisites:**
- Fresh lead in PENDING_APPROVAL status
- At least 2 verified installers in system

**Steps:**
1. Login as Admin
2. Navigate to `/admin/leads`
3. Click on pending lead row
4. Verify: Only "Manage Lead" button visible (no "Actions" section)
5. Click "Manage Lead"
6. Modal opens showing:
   - Pricing section
   - Installer Assignment section
   - Countdown settings (default 7 days)
   - Admin notes
7. Select 2 installers
8. Change countdown to 3 days
9. Set price to £30
10. Click "Approve & Assign Lead to 2 Installer(s)"
11. Verify success message: "Lead assigned successfully!"
12. Modal closes
13. Lead detail page refreshes

**Expected Results:**
- ✅ Lead status: APPROVED
- ✅ Lead expiresAt: exactly 3 days from now
- ✅ Assignment History shows 2 installers
- ✅ No second attempt required

**Installer Verification:**
14. Login as one of assigned installers
15. Navigate to `/installer/leads`
16. Verify: Lead appears in feed immediately
17. Check countdown timer shows "3 days left"

---

### Test Case 2: Reject Flow (Unchanged)

**Steps:**
1. Open lead detail page
2. Click "Manage Lead"
3. Click "Reject Lead" (if available in modal)
4. Enter rejection reason
5. Confirm

**Expected Results:**
- ✅ Lead status: REJECTED
- ✅ Homeowner notified
- ✅ Lead removed from installer feeds

---

### Test Case 3: Update Existing Assignment

**Prerequisites:**
- Lead already APPROVED with 1 installer assigned

**Steps:**
1. Click "Manage Lead"
2. Select 1 additional installer (total 2 now)
3. Click "Save Changes"

**Expected Results:**
- ✅ 2nd installer added to Assignment History
- ✅ 2nd installer sees lead in feed
- ✅ Countdown unchanged (uses original expiresAt)

---

## 🚨 ROLLBACK STRATEGY

If Phase 9 breaks existing functionality:

1. **Revert commits:**
   ```bash
   git log --oneline -10  # Find commit before Phase 9
   git revert <commit-hash>
   ```

2. **Manual rollback:**
   - Restore `src/app/admin/leads/[id]/page.tsx` from backup
   - Restore `src/components/admin/AdminLeadManagementModal.tsx` from backup
   - Test approve flow works again

3. **Fix in isolation:**
   - Create new branch: `fix/admin-assignment-flow`
   - Apply changes one file at a time
   - Test after each file change

---

## 📎 RELATED FILES

### Files to Modify:
1. `src/app/admin/leads/[id]/page.tsx` - Remove Actions section, fix onApprove handler
2. `src/components/admin/AdminLeadManagementModal.tsx` - Simplify button logic

### Files to Verify (No Changes):
3. `src/app/api/leads/[id]/approve/route.ts` - Already handles assignment
4. `src/app/api/admin/leads/[id]/assign/route.ts` - Keep for update-only scenarios
5. `src/lib/services/countdown-service.ts` - Already correct

### Files to Test:
6. Installer lead feed: `/installer/leads`
7. Assignment history component
8. Countdown timer display

---

## ✅ SUCCESS CRITERIA

Phase 9 complete when ALL of these pass:

1. ✅ Admin lead detail page shows ONLY "Manage Lead" button (no Actions section)
2. ✅ Single click "Approve & Assign" creates assignment immediately
3. ✅ Countdown uses admin-specified days (not default)
4. ✅ Installers see lead in feed within 5 seconds
5. ✅ Assignment History populated correctly
6. ✅ No console errors
7. ✅ `npm run build` passes
8. ✅ Existing approved leads still manageable

---

**End of Audit Report**
