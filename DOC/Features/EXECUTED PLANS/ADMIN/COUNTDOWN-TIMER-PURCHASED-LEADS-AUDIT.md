# Countdown Timer for Purchased Leads - Audit & Fix Plan

**Date**: November 26, 2025  
**Phase**: 9.10 - Remove Countdown from Purchased Leads  
**Status**: ⏳ Implementation Required

---

## Executive Summary

**Issue**: Countdown timers are showing for PURCHASED leads, but they should be completely hidden once a lead is purchased by an installer.

**Root Cause**: Recent Phase 9.9 changes enabled countdown for PURCHASED status in homeowner dashboard, but the requirement is the opposite - countdown should ONLY be visible while lead is assigned (APPROVED), not after purchase.

---

## 1. Current State Analysis

### 1.1 Homeowner Dashboard (INCORRECT)

**File**: `src/app/homeowner/dashboard/page.tsx` (Line 591)

**Current Code**:
```typescript
{lead.expiresAt && (lead.status === LeadStatusEnum.APPROVED || lead.status === LeadStatusEnum.PURCHASED) && (
  <LiveCountdownBar ... />
)}
```

**Issue**: Shows countdown for BOTH APPROVED and PURCHASED leads. Should ONLY show for APPROVED.

**Expected**: Countdown visible ONLY when status is APPROVED (lead assigned but not yet purchased).

---

### 1.2 Installer Assigned Leads (CORRECT)

**File**: `src/components/installer/InstallerAssignedLeads.tsx` (Lines 257-264)

**Current Code**:
```tsx
{lead.expiresAt && (
  <div className="flex items-center gap-2 text-caption text-warning">
    <svg className="w-4 h-4" ...>
    Expires: {format(new Date(lead.expiresAt), 'MMM d, yyyy')}
  </div>
)}
```

**Issue**: Shows countdown regardless of purchase status. Should hide after purchase.

**Analysis**: Installer assigned leads feed shows all assigned leads with countdown, even if purchased by the installer. Need to add condition to hide countdown after purchase.

---

### 1.3 LiveCountdownBar Component (INCORRECT)

**File**: `src/components/LiveCountdownBar.tsx` (Lines 106-109)

**Previous Code (Correct)**:
```typescript
// Hide countdown for purchased CALL_VISIT/WRITTEN_QUOTE leads
// (BIDDING leads keep countdown visible)
if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
  return null;
}
```

**Current Code (Phase 9.9 change - INCORRECT)**:
```typescript
// Always show countdown if expiresAt exists (removed PURCHASED hide logic)
// Homeowner dashboard needs countdown visible for all lead statuses
```

**Issue**: Removed the PURCHASED hide logic in Phase 9.9, but this was needed.

**Solution**: Restore the hide logic for PURCHASED leads.

---

### 1.4 CountdownTimer Component

**File**: `src/components/CountdownTimer.tsx` (Lines 76-79)

**Current Code**:
```typescript
// Hide countdown for purchased CALL_VISIT/WRITTEN_QUOTE leads
// (BIDDING leads keep countdown visible)
if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
  return null;
}
```

**Status**: ✅ CORRECT - Already hides countdown for PURCHASED leads (except BIDDING).

---

### 1.5 Preview Modal

**File**: `src/components/homeowner/LeadPreviewModal.tsx`

**Status**: ✅ NO COUNTDOWN - Modal doesn't show countdown timer at all (verified by grep search).

---

## 2. Business Requirements Clarification

### Countdown Timer Visibility Rules:

| Lead Status | Homeowner View | Installer View (Assigned) | Installer View (Purchased) |
|-------------|----------------|---------------------------|----------------------------|
| APPROVED (assigned) | ✅ Show countdown | ✅ Show countdown | N/A |
| PURCHASED | ❌ Hide countdown | ❌ Hide countdown | ❌ Hide countdown |
| QUOTED | ❌ No countdown | ❌ No countdown | ❌ No countdown |
| Other statuses | ❌ No countdown | N/A | N/A |

**Key Principle**: Countdown timer is ONLY for tracking the assignment deadline before purchase. Once purchased, the timer is irrelevant and should disappear.

---

## 3. Implementation Plan

### Task 9.10.1: Revert Homeowner Dashboard Countdown Condition

**File**: `src/app/homeowner/dashboard/page.tsx` (Line 591)

**Change**:
```typescript
// OLD (Phase 9.9 - INCORRECT)
{lead.expiresAt && (lead.status === LeadStatusEnum.APPROVED || lead.status === LeadStatusEnum.PURCHASED) && (

// NEW (Correct - ONLY for APPROVED)
{lead.expiresAt && lead.status === LeadStatusEnum.APPROVED && (
```

**Rationale**: Countdown should only show while lead is awaiting installer purchase (APPROVED status). After purchase, countdown is no longer relevant.

---

### Task 9.10.2: Restore LiveCountdownBar PURCHASED Hide Logic

**File**: `src/components/LiveCountdownBar.tsx` (Lines 106-110)

**Change**:
```typescript
// OLD (Phase 9.9 - INCORRECT)
// Always show countdown if expiresAt exists (removed PURCHASED hide logic)
// Homeowner dashboard needs countdown visible for all lead statuses

// NEW (Restore original logic)
// Hide countdown for purchased CALL_VISIT/WRITTEN_QUOTE leads
// (BIDDING leads keep countdown visible)
if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
  return null;
}
```

**Rationale**: Original logic was correct. Countdown should hide after purchase for all lead types except BIDDING (which has different behavior).

---

### Task 9.10.3: Add Purchase Status Check to Installer Assigned Leads

**File**: `src/components/installer/InstallerAssignedLeads.tsx` (Lines 257-264)

**Change**:
```typescript
// OLD
{lead.expiresAt && (
  <div className="flex items-center gap-2 text-caption text-warning">
    <svg className="w-4 h-4" ...>
    Expires: {format(new Date(lead.expiresAt), 'MMM d, yyyy')}
  </div>
)}

// NEW
{lead.expiresAt && lead.assignmentStatus !== 'purchased' && (
  <div className="flex items-center gap-2 text-caption text-warning">
    <svg className="w-4 h-4" ...>
    Expires: {format(new Date(lead.expiresAt), 'MMM d, yyyy')}
  </div>
)}
```

**Rationale**: Installer shouldn't see countdown after they've purchased the lead. The deadline is no longer relevant.

---

### Task 9.10.4: Verify CountdownTimer Component

**File**: `src/components/CountdownTimer.tsx` (Lines 76-79)

**Status**: ✅ Already correct - No changes needed.

**Verification**: Confirm logic is:
```typescript
if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
  return null;
}
```

---

## 4. Testing Plan

### Test 9.10.1: Homeowner Dashboard - APPROVED Lead

**Steps**:
1. Login as homeowner
2. Navigate to homeowner dashboard
3. Find lead with status APPROVED and expiresAt set

**Expected**:
- ✅ Countdown timer visible in lead card
- ✅ Format: "Xd Yh Zm Ws remaining" with progress bar
- ✅ Updates every second (live countdown)
- ✅ Color coding: green (6+ days), yellow (3-5 days), red (1-2 days)

---

### Test 9.10.2: Homeowner Dashboard - PURCHASED Lead

**Steps**:
1. Login as homeowner
2. Navigate to homeowner dashboard
3. Find lead with status "Responded by Installer" (PURCHASED)

**Expected**:
- ❌ NO countdown timer visible
- ✅ Status badge shows "Responded by Installer"
- ✅ Lead card renders correctly without countdown
- ✅ All other lead details visible

---

### Test 9.10.3: Installer Assigned Leads - Before Purchase

**Steps**:
1. Login as installer
2. Navigate to assigned leads feed
3. Find lead with assignmentStatus 'pending' and expiresAt set

**Expected**:
- ✅ Countdown visible: "Expires: MMM d, yyyy"
- ✅ Warning icon visible
- ✅ "Purchase Lead" button enabled
- ✅ Countdown in yellow/warning color

---

### Test 9.10.4: Installer Assigned Leads - After Purchase

**Steps**:
1. Login as installer
2. Navigate to assigned leads feed
3. Find lead with assignmentStatus 'purchased' (purchased by this installer)

**Expected**:
- ❌ NO countdown visible
- ✅ Full contact details unlocked
- ✅ "View Details" button visible
- ✅ No "Purchase Lead" button

---

### Test 9.10.5: Preview Modal - No Countdown

**Steps**:
1. Login as homeowner
2. Click "Preview" on any lead (APPROVED or PURCHASED)
3. Check modal content

**Expected**:
- ❌ NO countdown timer anywhere in modal
- ✅ Status badge shows correct label
- ✅ All lead details visible
- ✅ Modal header sticky and visible

---

### Test 9.10.6: Edge Cases

**Test 6a: Lead Without expiresAt**
- APPROVED lead with no expiresAt
- Expected: No countdown, no errors

**Test 6b: BIDDING Lead**
- PURCHASED BIDDING lead
- Expected: Countdown may remain visible (different business logic)

**Test 6c: Theme Compatibility**
- Test countdown visibility in Dark, Light, Purple themes
- Expected: Consistent behavior across all themes

---

## 5. Success Criteria

✅ **Homeowner Dashboard**:
- Countdown visible ONLY for APPROVED leads
- NO countdown for PURCHASED leads

✅ **Installer Assigned Leads**:
- Countdown visible ONLY before purchase
- NO countdown after purchase (assignmentStatus='purchased')

✅ **Preview Modal**:
- NO countdown timer anywhere

✅ **Components**:
- LiveCountdownBar hides for PURCHASED (except BIDDING)
- CountdownTimer hides for PURCHASED (except BIDDING)

✅ **Build**:
- `npm run build` succeeds
- `npx tsc --noEmit` returns 0 errors
- No console errors in browser

---

## 6. Rollback Plan

**If tests fail:**

```bash
# Restore Phase 9.9 changes (if needed)
git checkout HEAD~1 -- src/app/homeowner/dashboard/page.tsx
git checkout HEAD~1 -- src/components/LiveCountdownBar.tsx
git checkout HEAD~1 -- src/components/installer/InstallerAssignedLeads.tsx

# Verify
npm run build
npm run dev
```

**Or revert specific changes:**
```bash
# Open files and manually revert to Phase 9.9 state
# Test to confirm original behavior restored
```

---

## 7. Root Cause Analysis

**Why did Phase 9.9 introduce this issue?**

1. **User Request Misinterpretation**: Phase 9.9 request said "add countdown timer to PURCHASED leads", but actual requirement was the opposite.

2. **Context Missing**: The prompt in Phase 9.9 didn't clarify that "Responded by Installer" means the lead is SOLD, not actively being bid on.

3. **Business Logic**: Countdown timer represents "time until offer expires for installers to purchase". Once purchased, this timer is irrelevant.

4. **Correct Interpretation**: 
   - APPROVED = Lead assigned to installers, waiting for purchase (countdown relevant)
   - PURCHASED = Installer has bought the lead (countdown irrelevant, should be hidden)

---

## 8. Files to Modify

1. ✅ `src/app/homeowner/dashboard/page.tsx` - Remove PURCHASED from countdown condition
2. ✅ `src/components/LiveCountdownBar.tsx` - Restore PURCHASED hide logic
3. ✅ `src/components/installer/InstallerAssignedLeads.tsx` - Add purchase status check
4. ❌ `src/components/CountdownTimer.tsx` - No changes (already correct)
5. ❌ `src/components/homeowner/LeadPreviewModal.tsx` - No changes (no countdown exists)

---

## 9. Impact Analysis

**User Roles Affected**:
- Homeowners: Will see countdown only for assigned leads, not purchased
- Installers: Will see countdown only before purchase, not after
- Admins: No changes (admin views don't show countdown in same way)

**Business Logic**:
- Countdown timer = "Time remaining for installers to purchase"
- After purchase, timer no longer relevant
- Clear UX: Timer disappears when lead is sold

**Performance**:
- Reduced number of active countdown timers (better performance)
- Fewer DOM updates for leads that don't need countdown

---

**End of Audit Report**
