# Phase 9.11 - Complete Countdown Timer Fixes

**Date**: November 26, 2025  
**Issues**: Multiple countdown timer problems still unresolved

---

## Remaining Issues from Screenshots

### Issue 1: Countdown Text in Preview Modal ❌
**Screenshot Evidence**: Modal shows "2d 23h 22m 12s remaining" in multiple sections
**Root Cause**: The text is coming from the dashboard lead card's LiveCountdownBar, not the modal itself
**Location**: The countdown is visible in the lead card on the dashboard, and when modal opens showing the same data

### Issue 2: Homeowner Countdown UI Style ❌
**Current**: Complex LiveCountdownBar with "Xd Yh Zm Ws remaining" + progress bar
**Required**: Simple format like installer: "Expires: MMM d, yyyy" with warning icon
**File**: `src/app/homeowner/dashboard/page.tsx` (Lines 591-601)

### Issue 3: Modal Visibility Issues ❌
**Problems**:
- Header text may be overlapping
- Icons appearing outside modal boundaries (left side phone icons)
**File**: `src/components/homeowner/LeadPreviewModal.tsx`

---

## Implementation Plan

### Task 9.11.1: Replace LiveCountdownBar with Simple Expiry Display

**File**: `src/app/homeowner/dashboard/page.tsx` (Lines 590-602)

**Current Code** (Complex countdown bar):
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

**New Code** (Simple expiry like installer):
```tsx
{lead.expiresAt && lead.status === LeadStatusEnum.APPROVED && (
  <div className="flex items-center gap-2 text-caption text-warning">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Expires: {new Date(lead.expiresAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}
  </div>
)}
```

**Rationale**: 
- Matches installer lead card design exactly
- No live updating (less DOM manipulation)
- Cleaner, simpler UI
- No "remaining" text to confuse users

---

### Task 9.11.2: Remove Import for LiveCountdownBar

**File**: `src/app/homeowner/dashboard/page.tsx` (Line 27)

**Remove**:
```typescript
import { LiveCountdownBar } from '@/components/LiveCountdownBar'; // Phase 4.5: Enhanced live countdown
```

**Rationale**: No longer used in homeowner dashboard after Task 9.11.1

---

### Task 9.11.3: Fix Modal Header Overlap

**File**: `src/components/homeowner/LeadPreviewModal.tsx` (Line 91)

**Current**:
```tsx
<div className="sticky top-0 z-50 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-lg -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6">
```

**Issues**:
- Negative margins pull header outside modal boundaries
- May cause text overlap

**New**:
```tsx
<div className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between mb-6 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
```

**Changes**:
- Added `backdrop-blur-sm` for better text readability
- Changed `bg-surface` to `bg-surface/95` for slight transparency
- Unified padding to `p-6` instead of `px-6 py-4`

---

### Task 9.11.4: Fix Modal Container for Icon Containment

**File**: `src/components/homeowner/LeadPreviewModal.tsx` (Line 87)

**Current**:
```tsx
<div 
  className="theme-card relative w-full max-w-4xl p-4 sm:p-6 lg:p-8 animate-slide-in-up max-h-[95vh] overflow-y-auto"
  onClick={(e) => e.stopPropagation()}
>
```

**New**:
```tsx
<div 
  className="theme-card relative w-full max-w-4xl p-4 sm:p-6 lg:p-8 animate-slide-in-up max-h-[95vh] overflow-y-auto overflow-x-hidden"
  onClick={(e) => e.stopPropagation()}
>
```

**Changes**:
- Added `overflow-x-hidden` to prevent horizontal overflow
- Ensures no elements escape modal boundaries horizontally

---

## Testing Plan

### Test 9.11.1: Homeowner Dashboard - Simple Expiry Display

**Steps**:
1. Login as homeowner
2. Find APPROVED lead with expiresAt
3. Check lead card countdown

**Expected**:
- ✅ Simple format: "Expires: Nov 26, 2025" (or similar)
- ✅ Warning clock icon visible
- ✅ Yellow/warning color
- ✅ NO "Xd Yh Zm Ws remaining" format
- ✅ NO progress bar

---

### Test 9.11.2: Preview Modal - No Countdown Text

**Steps**:
1. Click "Preview" on APPROVED lead
2. Scroll through all modal sections
3. Check Location Details, Energy Usage, Property Details

**Expected**:
- ❌ NO countdown text anywhere ("2d 23h remaining" etc.)
- ✅ All fields show correct data
- ✅ Status badge shows "Approved"
- ✅ Modal scrolls smoothly

---

### Test 9.11.3: Modal Header Visibility

**Steps**:
1. Open preview modal
2. Check header text readability
3. Scroll down to bottom
4. Scroll back to top

**Expected**:
- ✅ Header text always readable (no overlap)
- ✅ Header stays at top when scrolling (sticky)
- ✅ Backdrop blur effect visible on scroll
- ✅ Close button always clickable

---

### Test 9.11.4: Modal Icon Containment

**Steps**:
1. Open preview modal
2. Check left edge of modal
3. Check right edge of modal
4. Resize browser window

**Expected**:
- ❌ NO icons outside modal boundaries
- ✅ All phone/action icons contained within modal
- ✅ No horizontal scroll
- ✅ Modal centered on screen

---

## Success Criteria

✅ **Homeowner Dashboard**:
- Simple expiry format: "Expires: MMM d, yyyy"
- Matches installer lead card design
- NO LiveCountdownBar component

✅ **Preview Modal**:
- NO countdown text anywhere in content
- Header always visible and readable
- All icons contained within modal

✅ **Build**:
- TypeScript compiles without errors
- No console errors in browser
- No visual glitches

---

**End of Plan**
