# Homeowner UI Update Audit Report
**Date**: November 26, 2025  
**Phase**: 9.9 - Homeowner Lead Card & Preview Modal Enhancement  
**Auditor**: GitHub Copilot  
**Status**: ⏳ Pending Implementation

---

## Executive Summary

This audit analyzes the homeowner dashboard lead cards and preview modal to implement the following updates:
1. Replace all "Purchased" text with "Responded by Installer"
2. Add countdown timer to homeowner lead cards (matching installer design)
3. Remove countdown timer from preview modal for PURCHASED leads
4. Fix UI visibility issues (z-index overlapping, icon positioning)

---

## 1. Current State Analysis

### 1.1 Lead Card (HomeownerDashboard)

**File**: `src/app/homeowner/dashboard/page.tsx`

**Current "Purchased" References** (Line 195-198):
```typescript
[LeadStatusEnum.PURCHASED]: {
  label: 'Purchased',
  description: 'An installer has claimed this lead',
  accent: 'bg-primary/10 text-primary border border-primary/30',
},
```

**Countdown Timer Implementation** (Lines 586-597):
```tsx
{lead.expiresAt && lead.status === LeadStatusEnum.APPROVED && (
  <div className="flex items-center justify-center w-full h-full min-h-[32px] min-w-[120px]">
    <div className="rounded-lg bg-background shadow-neu-inset px-4 py-1 text-caption text-foreground">
      <LiveCountdownBar
        expiresAt={lead.expiresAt}
        leadId={lead.id}
        leadStatus={lead.status}
        quoteType={lead.quoteType}
        position="top"
      />
    </div>
  </div>
)}
```

**Issue**: Countdown only shows for APPROVED status, not PURCHASED.

**Installer Lead Card Reference** (for comparison):
- File: `src/components/installer/InstallerAssignedLeads.tsx` (Lines 257-264)
- Shows: "Expires: MMM d, yyyy" format with warning icon
- Logic: `{lead.expiresAt && ( ... )}`

**Lead Card Structure** (Lines 569-698):
```tsx
<div className="flex items-center gap-3 p-3 rounded-full bg-background shadow-neu-outset">
  {/* Left Icon Circle */}
  <div className="flex-shrink-0 ... w-16 h-16 rounded-full" style={{ zIndex: 2 }}>
    {/* Icon */}
  </div>
  
  {/* Main Content */}
  <div className="flex-1 flex flex-col justify-center min-w-0 pr-3">
    <div className="rounded-full bg-background shadow-neu-inset border border-border px-6 py-3">
      {/* Countdown (only for APPROVED) */}
      {/* Lead Info */}
      {/* Action Buttons */}
      {/* Badges */}
    </div>
  </div>
</div>
```

**UI Issues Identified**:
- Left icon uses `zIndex: 2` (inline style) - should use semantic classes
- No countdown for PURCHASED leads
- Countdown is center-aligned, but design should follow installer pattern

### 1.2 Preview Modal (LeadPreviewModal)

**File**: `src/components/homeowner/LeadPreviewModal.tsx`

**"Purchased" Status Badge** (Lines 103-109):
```tsx
<span className={`inline-flex items-center px-3 py-1 rounded-full text-body-small ${
  lead.status === 'APPROVED' ? 'bg-success/20 text-success' :
  lead.status === 'PURCHASED' ? 'bg-accent/20 text-accent' :
  'bg-surface text-foreground'
}`}>
  {lead.status.replace('_', ' ')}
</span>
```

**Issue**: Status displays as "PURCHASED" (uppercase with underscore replacement).

**Header Overlapping Issue** (Lines 84-101):
```tsx
<div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-lg -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6">
```

**Identified Problems**:
1. `z-10` may not be high enough for `z-modal` context
2. Negative margins: `-mx-4 sm:-mx-6 lg:-mx-8` - non-semantic, hardcoded
3. Header uses `bg-surface`, parent modal uses `theme-card` (potential color mismatch)

**Modal Wrapper** (Lines 77-82):
```tsx
<div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-modal flex items-center justify-center px-4 py-8 animate-fade-in">
  <div className="theme-card relative w-full max-w-4xl p-4 sm:p-6 lg:p-8 animate-slide-in-up max-h-[95vh] overflow-y-auto">
```

**Icon Outside Modal** (Screenshot observation):
- Phone icon appears outside left edge of modal
- Likely position issue with absolute/fixed elements
- Need to audit icon positioning

### 1.3 LiveCountdownBar Component

**File**: `src/components/LiveCountdownBar.tsx`

**PURCHASED Lead Logic** (Lines 108-112):
```tsx
// Hide countdown for purchased CALL_VISIT/WRITTEN_QUOTE leads
// (BIDDING leads keep countdown visible)
if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
  return null;
}
```

**Issue**: Countdown is hidden for PURCHASED CALL_VISIT/WRITTEN_QUOTE leads, but user wants it visible.

**Design Patterns**:
- Position "top": Full-width progress bar (Lines 133-164)
- Position "inline": Compact text format (Lines 166-186)
- Color coding: green (6+ days), yellow (3-5 days), red (1-2 days), gray (expired)

---

## 2. Requirements Analysis

### Requirement 1: Replace "Purchased" → "Responded by Installer"

**Scope**:
- Lead card status badge
- Preview modal status badge
- STATUS_LABELS object

**Files to Update**:
1. `src/app/homeowner/dashboard/page.tsx`:
   - Line 196: `label: 'Purchased'` → `label: 'Responded by Installer'`
   - Line 197: `description: 'An installer has claimed this lead'` → `description: 'An installer has responded to your request'`

2. `src/components/homeowner/LeadPreviewModal.tsx`:
   - No direct "Purchased" text, uses `lead.status.replace('_', ' ')`
   - Status badge shows "PURCHASED" from enum
   - **Solution**: Add status mapping logic like dashboard

### Requirement 2: Add Countdown Timer to Lead Cards

**Design Reference**: Installer lead card countdown (Lines 257-264 in InstallerAssignedLeads.tsx)

**Target States**:
- APPROVED leads: Already shows countdown ✅
- PURCHASED leads: Should show countdown ⚠️

**Implementation Strategy**:
1. Update condition: `lead.status === LeadStatusEnum.APPROVED` → `(lead.status === LeadStatusEnum.APPROVED || lead.status === LeadStatusEnum.PURCHASED)`
2. Keep existing LiveCountdownBar component
3. Update LiveCountdownBar to NOT hide for PURCHASED leads

**Design Alignment**:
- Installer uses: Plain text "Expires: MMM d, yyyy" + warning icon
- Homeowner uses: LiveCountdownBar with "Xd Yh Zm Ws remaining" + progress bar
- **Decision**: Keep homeowner's richer design (LiveCountdownBar), just show for PURCHASED

### Requirement 3: Remove Countdown from Preview Modal

**Current State**: Preview modal doesn't have countdown ✅

**Verification Needed**: Check if countdown appears anywhere in preview modal content (Lines 1-415).

**Result**: No countdown in preview modal. Requirement already met. ✅

### Requirement 4: Fix UI Visibility Issues

**Issue 1: Header Overlapping**
- Problem: Header sticky but z-index may conflict
- Solution: Use semantic z-index utilities from global CSS
- Check: `z-modal`, `z-modal-overlay`, `z-header`, `z-dropdown` available?

**Issue 2: Left Icon Outside Modal**
- Screenshot shows phone icon floating outside modal boundary
- Need to inspect icon positioning logic
- Likely issue: Icon uses absolute positioning without proper containment

**Issue 3: Inline Styles**
- Lead card uses `style={{ zIndex: 2 }}` (Line 579)
- Preview modal uses negative margins with hardcoded responsive values
- Solution: Replace with semantic CSS classes

---

## 3. Implementation Plan

### Phase 9.9: Homeowner UI Updates

#### Task 9.9.1: Update "Purchased" Status Labels
**Files**: `src/app/homeowner/dashboard/page.tsx`

**Changes**:
1. Line 195-198: Update STATUS_LABELS[LeadStatusEnum.PURCHASED]
   - `label: 'Purchased'` → `label: 'Responded by Installer'`
   - `description: 'An installer has claimed this lead'` → `description: 'An installer has responded to your request'`

2. Verify badge rendering (Line 688):
   ```tsx
   <span className={`px-2.5 py-0.5 rounded-lg shadow-neu-inset text-caption ${statusInfo.accent}`}>
     {statusInfo.label}
   </span>
   ```

**Test**:
- Open homeowner dashboard
- Find PURCHASED lead
- Verify badge shows "Responded by Installer"
- Verify description tooltip (if implemented)

---

#### Task 9.9.2: Add Countdown Timer to PURCHASED Leads
**Files**: 
- `src/app/homeowner/dashboard/page.tsx`
- `src/components/LiveCountdownBar.tsx`

**Changes**:

1. **Dashboard** (Lines 586-597): Update countdown condition
   ```tsx
   // OLD
   {lead.expiresAt && lead.status === LeadStatusEnum.APPROVED && (
   
   // NEW
   {lead.expiresAt && (lead.status === LeadStatusEnum.APPROVED || lead.status === LeadStatusEnum.PURCHASED) && (
   ```

2. **LiveCountdownBar** (Lines 108-112): Remove PURCHASED hide logic
   ```tsx
   // OLD
   if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
     return null;
   }
   
   // NEW
   // Removed - always show countdown if expiresAt exists
   ```

**Test**:
- Create test lead with PURCHASED status + expiresAt
- Open homeowner dashboard
- Verify countdown timer appears in lead card
- Verify countdown updates every second
- Verify color coding (green/yellow/red based on remaining time)

---

#### Task 9.9.3: Fix Preview Modal Status Display
**Files**: `src/components/homeowner/LeadPreviewModal.tsx`

**Changes**:

1. Add status label mapping (after imports, before component):
   ```tsx
   const STATUS_DISPLAY_LABELS: Record<string, string> = {
     PURCHASED: 'Responded by Installer',
     APPROVED: 'Approved',
     PENDING_APPROVAL: 'Awaiting Review',
     REJECTED: 'Rejected',
     EXPIRED: 'Expired',
     CANCELLED: 'Cancelled',
     FLAGGED: 'Flagged',
     QUOTED: 'Quotes Received',
     ACCEPTED: 'Accepted',
     PENDING_PHONE: 'Needs Verification',
   };
   ```

2. Update status badge (Lines 103-109):
   ```tsx
   // OLD
   {lead.status.replace('_', ' ')}
   
   // NEW
   {STATUS_DISPLAY_LABELS[lead.status] || lead.status.replace('_', ' ')}
   ```

**Test**:
- Open preview modal for PURCHASED lead
- Verify status badge shows "Responded by Installer"
- Test other statuses (APPROVED, REJECTED, etc.)
- Verify no countdown appears in modal

---

#### Task 9.9.4: Fix Modal Header Z-Index & Styling
**Files**: `src/components/homeowner/LeadPreviewModal.tsx`

**Changes**:

1. **Header** (Lines 84-101): Remove inline styles, use semantic classes
   ```tsx
   // OLD
   <div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-lg -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6">
   
   // NEW
   <div className="modal-header sticky top-0 z-modal-header bg-surface border-b border-border flex items-center justify-between">
   ```

2. **Modal Wrapper** (Lines 77-82): Ensure proper z-index hierarchy
   ```tsx
   // Update if needed
   <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-modal-overlay flex items-center justify-center modal-padding animate-fade-in">
     <div className="theme-card relative w-full modal-content-width modal-padding animate-slide-in-up modal-max-height overflow-y-auto">
   ```

3. Check if semantic classes exist in globals.css:
   - `z-modal-header`: z-index for sticky modal headers
   - `z-modal-overlay`: z-index for modal backdrop
   - `modal-padding`: consistent modal padding
   - `modal-content-width`: max-width for modal content
   - `modal-max-height`: max-height with scrolling

**Fallback** (if semantic classes don't exist):
- Keep Tailwind utilities but document in comment
- Replace hardcoded responsive values with spacing tokens

**Test**:
- Open preview modal
- Scroll down in modal content
- Verify header stays at top (sticky)
- Verify header doesn't overlap modal content
- Verify close button visible and clickable
- Check in all 3 themes (Dark, Light, Purple)

---

#### Task 9.9.5: Fix Lead Card Inline Styles
**Files**: `src/app/homeowner/dashboard/page.tsx`

**Changes**:

1. **Left Icon Circle** (Lines 577-584): Remove inline style
   ```tsx
   // OLD
   <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-neu-outset border-4 border-background relative" style={{ zIndex: 2 }}>
   
   // NEW
   <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-neu-outset border-4 border-background relative z-lead-icon">
   ```

2. Check if `z-lead-icon` class exists in globals.css:
   - If yes: Use it
   - If no: Create it or use existing z-index utility

**Alternative** (if no semantic class):
```tsx
<div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-neu-outset border-4 border-background relative z-10">
```

**Test**:
- Open homeowner dashboard
- Verify left icon appears above card content
- Verify icon doesn't overlap with adjacent cards
- Verify shadow rendering correct

---

#### Task 9.9.6: Audit & Document Icon Positioning
**Files**: Check for floating icons outside modal

**Investigation Steps**:
1. Open preview modal in browser DevTools
2. Inspect phone/call icons
3. Check for:
   - Absolute positioning without containment
   - Negative margins pushing elements outside
   - Overflow hidden not applied to parent

**Likely Culprit**: 
- Lead card structure uses phone icon in left circle
- Preview modal may render icons outside container

**Solution**:
- Ensure all icon containers have proper containment
- Add `overflow-hidden` to parent elements if needed
- Verify no negative positioning values

**Test**:
- Open preview modal
- Check left/right edges for floating icons
- Open in different screen sizes (mobile, tablet, desktop)
- Verify no visual artifacts

---

## 4. Design System Compliance

### 4.1 No Hardcoded Values

**Current Violations**:
1. Inline `style={{ zIndex: 2 }}` (Line 579)
2. Negative responsive margins: `-mx-4 sm:-mx-6 lg:-mx-8` (Line 84)
3. Hardcoded padding: `px-6 py-4` (Line 84)
4. Hardcoded modal width: `max-w-4xl` (Line 80)

**Required Approach**:
- Replace inline styles with semantic CSS classes
- Use design tokens from globals.css
- If semantic class doesn't exist, document Tailwind utility usage
- Prefer semantic class names: `modal-header`, `lead-card-icon`, etc.

### 4.2 Semantic CSS Classes

**From Project Guidelines**:
- Use `theme-card`, `modal-header`, `z-modal-overlay`, etc.
- Follow neumorphic design patterns (shadow-neu-inset, shadow-neu-outset)
- Use spacing tokens: `gap-3`, `p-4`, `py-6` (not `py-[24px]`)

**Check globals.css for**:
- Modal z-index utilities
- Lead card component classes
- Icon positioning utilities

### 4.3 Color Consistency

**Status Colors** (from STATUS_LABELS):
- PURCHASED: `bg-primary/10 text-primary border border-primary/30`
- APPROVED: `bg-success/10 text-success border border-success/30`
- QUOTED: `bg-secondary/10 text-secondary border border-secondary/30`

**Countdown Colors** (from LiveCountdownBar):
- Green: `bg-success`, `text-foreground`, `bg-success/10`
- Yellow: `bg-warning`, `text-foreground`, `bg-warning/10`
- Red: `bg-error`, `text-foreground`, `bg-error/10`

**Compliance**: All colors use theme tokens ✅

---

## 5. Testing Strategy

### 5.1 Functional Tests

**Test 1: Status Label Update**
1. Navigate to homeowner dashboard
2. Find lead with PURCHASED status
3. Verify badge shows "Responded by Installer"
4. Open preview modal for same lead
5. Verify modal badge shows "Responded by Installer"

**Test 2: Countdown Timer - APPROVED Lead**
1. Find APPROVED lead with expiresAt
2. Verify countdown displays in lead card
3. Verify format: "Xd Yh Zm Ws remaining"
4. Wait 5 seconds, verify countdown updates
5. Check color coding (green/yellow/red)

**Test 3: Countdown Timer - PURCHASED Lead**
1. Find PURCHASED lead with expiresAt
2. Verify countdown displays in lead card
3. Verify countdown updates live
4. Open preview modal
5. Verify NO countdown in modal

**Test 4: Countdown Timer - No Expiry**
1. Find lead without expiresAt
2. Verify no countdown displays
3. Verify lead card renders correctly without timer

### 5.2 UI/Visual Tests

**Test 5: Modal Header Visibility**
1. Open preview modal
2. Scroll down to bottom
3. Verify header stays at top (sticky)
4. Verify header background opaque
5. Verify close button always visible

**Test 6: Icon Positioning**
1. Open homeowner dashboard
2. Verify left icon centered in circle
3. Verify icon doesn't overlap adjacent cards
4. Open preview modal
5. Verify no icons outside modal boundaries

**Test 7: Responsive Design**
- Test at 320px, 375px, 768px, 1024px, 1440px
- Verify lead cards stack properly
- Verify modal scales correctly
- Verify countdown readable at all sizes

### 5.3 Theme Tests

**Test 8: Dark Theme**
- Switch to Dark theme
- Verify lead card shadows visible
- Verify countdown colors contrast correctly
- Verify modal header/content readable

**Test 9: Light Theme**
- Switch to Light theme
- Verify neumorphic shadows render
- Verify countdown progress bar visible
- Verify status badges readable

**Test 10: Purple Theme**
- Switch to Purple theme
- Verify purple accent colors applied
- Verify countdown uses purple shadows
- Verify status badges maintain contrast

### 5.4 Regression Tests

**Test 11: Other Status Labels**
- Test APPROVED, REJECTED, EXPIRED, CANCELLED
- Verify labels unchanged
- Verify accents render correctly

**Test 12: Edit/Cancel Actions**
- Test Edit button (PENDING_APPROVAL leads)
- Test Preview button (APPROVED/PURCHASED leads)
- Test Cancel button (cancellable leads)
- Verify all actions work

**Test 13: Property Type Badges**
- Test Residential lead card
- Test Commercial lead card
- Verify icons and labels display

---

## 6. Success Criteria

✅ **Task 9.9.1**: All "Purchased" text replaced with "Responded by Installer"  
✅ **Task 9.9.2**: Countdown timer appears on PURCHASED leads in lead cards  
✅ **Task 9.9.3**: Preview modal shows correct status label  
✅ **Task 9.9.4**: Modal header doesn't overlap content, proper z-index  
✅ **Task 9.9.5**: No inline styles in lead cards  
✅ **Task 9.9.6**: No floating icons outside modal boundaries  
✅ **Test Suite**: All 13 tests pass  
✅ **Build**: `npm run build` completes without errors  
✅ **TypeScript**: `npx tsc --noEmit` returns 0 errors  

---

## 7. Rollback Plan

### If Tests Fail

**Status Label Issues**:
```bash
git checkout HEAD -- src/app/homeowner/dashboard/page.tsx
git checkout HEAD -- src/components/homeowner/LeadPreviewModal.tsx
```

**Countdown Timer Issues**:
```bash
git checkout HEAD -- src/components/LiveCountdownBar.tsx
```

**Modal UI Issues**:
```bash
git checkout HEAD -- src/components/homeowner/LeadPreviewModal.tsx
```

### Backup Files
Before starting implementation:
```bash
cp src/app/homeowner/dashboard/page.tsx src/app/homeowner/dashboard/page.tsx.backup-20251126
cp src/components/homeowner/LeadPreviewModal.tsx src/components/homeowner/LeadPreviewModal.tsx.backup-20251126
cp src/components/LiveCountdownBar.tsx src/components/LiveCountdownBar.tsx.backup-20251126
```

---

## 8. Files Inventory

**Primary Files** (will be modified):
1. `src/app/homeowner/dashboard/page.tsx` (1451 lines)
   - Lines 195-198: STATUS_LABELS.PURCHASED
   - Lines 586-597: Countdown condition
   - Lines 577-584: Left icon inline style

2. `src/components/homeowner/LeadPreviewModal.tsx` (415 lines)
   - Lines 103-109: Status badge rendering
   - Lines 84-101: Header styling
   - Lines 77-82: Modal wrapper

3. `src/components/LiveCountdownBar.tsx` (209 lines)
   - Lines 108-112: PURCHASED hide logic

**Reference Files** (read-only):
1. `src/components/installer/InstallerAssignedLeads.tsx` (303 lines)
   - Countdown design reference

2. `DOC/Guidelines/DESIGN-SYSTEM-SOT.md`
   - Design token reference

3. `src/styles/globals.css`
   - Semantic CSS classes

---

## 9. Risks & Mitigation

### Risk 1: Countdown Performance Impact
**Issue**: Adding countdown to PURCHASED leads increases number of live timers  
**Mitigation**:
- LiveCountdownBar already has visibility-based pausing
- Pauses updates when tab inactive (battery optimization)
- Only updates visible timers (Intersection Observer potential future enhancement)

### Risk 2: Semantic CSS Classes Don't Exist
**Issue**: `z-modal-header`, `modal-padding`, etc. may not be in globals.css  
**Mitigation**:
- Check globals.css before implementation
- If missing, use Tailwind utilities with documentation comments
- Create follow-up task to add semantic classes

### Risk 3: Breaking Other Homeowner Components
**Issue**: STATUS_LABELS used by multiple components  
**Mitigation**:
- Search for all references: `grep -r "STATUS_LABELS" src/`
- Test all homeowner pages after changes
- Run full regression suite

### Risk 4: Icon Positioning Complex
**Issue**: Floating icon may be intentional design  
**Mitigation**:
- Screenshot analysis before changes
- Consult with designer if available
- Keep visual parity with existing design

---

## 10. Next Steps

1. ✅ Create audit report (this document)
2. ⏳ Create Phase 9.9 in tasks.md
3. ⏳ Implement Task 9.9.1: Update status labels
4. ⏳ Test Task 9.9.1
5. ⏳ Implement Task 9.9.2: Add countdown to PURCHASED
6. ⏳ Test Task 9.9.2
7. ⏳ Implement Task 9.9.3: Fix preview modal status
8. ⏳ Test Task 9.9.3
9. ⏳ Implement Task 9.9.4: Fix modal header
10. ⏳ Test Task 9.9.4
11. ⏳ Implement Task 9.9.5: Remove inline styles
12. ⏳ Test Task 9.9.5
13. ⏳ Implement Task 9.9.6: Audit icon positioning
14. ⏳ Run full test suite
15. ⏳ Build & TypeScript validation
16. ⏳ Mark Phase 9.9 complete

---

**End of Audit Report**
