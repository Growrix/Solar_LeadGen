# Countdown Timer Update Audit Report

**Date**: November 26, 2025  
**Issue**: Admin cannot update countdown timer to specific days (e.g., from 30 days to 3 days)  
**Reported By**: User  
**Priority**: High

---

## Executive Summary

The countdown timer in the Admin Lead Management Modal can only be **extended** (add more days) but cannot be **updated** to a specific value. For example, if a lead was assigned with 30 days countdown, the admin cannot change it to 3 days directly.

**Root Cause**: The current implementation uses `onResetTimer` which **adds** days to the expiry date, rather than **setting** the expiry to a specific number of days from now.

---

## Current Implementation Analysis

### 1. Frontend State (AdminLeadManagementModal.tsx)

**Lines 114-128**: Countdown state initialization
```typescript
const [countdownDays, setCountdownDays] = useState(() => {
  // Calculate from expiresAt if exists, otherwise default to 7
  if (lead.expiresAt) {
    const now = new Date();
    const expires = new Date(lead.expiresAt);
    const daysRemaining = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 ? daysRemaining : 7;
  }
  return 7;
});
```

**Lines 795-817**: Countdown input field
```typescript
<input
  type="number"
  min="1"
  max="90"
  value={countdownDays}
  onChange={(e) => setCountdownDays(parseInt(e.target.value) || 7)}
  placeholder="Enter expiry days"
  className="form-input w-full px-4 py-3 placeholder:text-muted-foreground"
  disabled={submitting}
/>
```

**Current Behavior**:
- ✅ Input field is editable
- ✅ Displays current days remaining
- ❌ Changes to the input are NOT saved/applied to backend

### 2. Lifecycle Section (Lines 860-890)

**Current "Extend Timer" Functionality**:
```typescript
{lead.expiresAt && onResetTimer && (
  <div className="flex gap-2">
    <input
      type="number"
      value={resetDays}
      onChange={(e) => setResetDays(parseInt(e.target.value) || 7)}
      min="1"
      max="365"
      placeholder="Days"
      className="form-input w-20 px-4 py-3"
    />
    <Button
      onClick={async () => {
        setSubmitting(true);
        try {
          await onResetTimer(resetDays);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setSubmitting(false);
        }
      }}
      disabled={submitting}
      variant="secondary"
      className="flex-1"
    >
      ⏰ Extend Timer (+{resetDays}d)
    </Button>
  </div>
)}
```

**Problem**: This **adds** days (e.g., +7 days), rather than **setting** to a specific countdown.

### 3. Backend API (`/api/leads/[id]/reset-timer/route.ts`)

**Current Logic** (Lines 54-58):
```typescript
const result = await resetLeadTimer(
  params.id,
  days,
  session.user.id
);
```

**Service Function** (need to check `lead-service.ts`):
- Likely adds `days` to current `expiresAt`
- Does NOT set `expiresAt` to `now + days`

### 4. Assignment Flow (Admin Page Lines 1148-1188)

**Current `onApprove` Handler**:
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
  // ... approval logic
  // Sets initial countdown via /api/leads/[id]/approve
}}
```

**Works Correctly**: Initial assignment sets countdown properly.

---

## Gap Analysis

| Feature | Current State | Required State | Gap |
|---------|---------------|----------------|-----|
| **Initial Assignment** | ✅ Admin can set countdown (e.g., 3 days) | ✅ Works | No gap |
| **Extend Timer** | ✅ Admin can add days (e.g., +7 days) | ✅ Works | No gap |
| **Update Timer** | ❌ Admin cannot change to specific value | ✅ Admin should change 30d → 3d | **Critical Gap** |
| **UI Indication** | ❌ Countdown input shows days but no save action | ✅ Should have "Update Countdown" button | **Critical Gap** |

---

## Root Cause Summary

### Issue #1: No Update Countdown Handler
- **Location**: `AdminLeadManagementModal.tsx` Lines 795-817
- **Problem**: Input field exists but no button/handler to apply changes
- **Impact**: Admin edits countdown value but nothing happens

### Issue #2: Wrong API Endpoint Usage
- **Location**: Lifecycle section uses `onResetTimer` (Lines 860-890)
- **Problem**: `onResetTimer` **extends** (adds days) rather than **sets** countdown
- **Impact**: Cannot reduce countdown or set specific value

### Issue #3: Missing "Update Countdown" Button
- **Location**: Approval & Pricing section
- **Problem**: No button to trigger countdown update
- **Impact**: User expects immediate save after editing input

---

## Proposed Solution

### Option A: Create New "Update Countdown" API Endpoint ✅ **RECOMMENDED**

**Why**: Clear separation of concerns (extend vs update)

1. **New API**: `POST /api/leads/[id]/update-countdown`
   - Accepts: `{ days: number }` (absolute value, not relative)
   - Sets: `expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)`
   - Returns: Updated lead with new expiry

2. **New Handler**: Add to admin page
   ```typescript
   onUpdateCountdown={async (days: number) => {
     await fetch(`/api/leads/${lead.id}/update-countdown`, {
       method: 'POST',
       body: JSON.stringify({ days })
     });
     await fetchLead();
   }}
   ```

3. **Modal UI**: Add button next to countdown input
   ```tsx
   <div className="flex gap-2">
     <input
       type="number"
       value={countdownDays}
       onChange={(e) => setCountdownDays(parseInt(e.target.value) || 7)}
       className="form-input flex-1"
     />
     <Button onClick={() => onUpdateCountdown(countdownDays)}>
       Update
     </Button>
   </div>
   ```

### Option B: Modify Existing `reset-timer` Endpoint

**Why**: Less code changes, but semantically confusing

- Change `resetLeadTimer` service to **set** expiry instead of **add** days
- **Risk**: Breaking existing "extend timer" functionality

---

## Implementation Plan

### Phase 9.7: Enable Countdown Timer Update

**Files to Modify**:
1. `src/app/api/leads/[id]/update-countdown/route.ts` (NEW)
2. `src/lib/services/lead-service.ts` (NEW function)
3. `src/app/admin/leads/[id]/page.tsx` (add `onUpdateCountdown` handler)
4. `src/components/admin/AdminLeadManagementModal.tsx` (add Update button)

**Acceptance Criteria**:
- ✅ Admin opens lead with 30 days countdown
- ✅ Admin edits countdown input to 3
- ✅ Admin clicks "Update Countdown" button
- ✅ Success message shows "Countdown updated to 3 days"
- ✅ Lead feed reflects new expiry (3 days from now)
- ✅ Installer feed shows updated countdown

---

## Testing Instructions

### Test Case 1: Update Countdown (Reduce Days)
1. Assign lead with 30 days countdown
2. Open Admin Lead Management Modal
3. Edit countdown input to 3
4. Click "Update Countdown"
5. **Expected**: Success message "Countdown updated to 3 days"
6. Verify Assignment History shows new expiry date
7. Verify installer feed shows "3 days left"

### Test Case 2: Update Countdown (Increase Days)
1. Open lead with 3 days countdown
2. Edit countdown input to 10
3. Click "Update Countdown"
4. **Expected**: Success message, new expiry = now + 10 days

### Test Case 3: Edge Cases
- Set countdown to 1 day → should work
- Set countdown to 90 days → should work
- Set countdown to 0 or negative → should show validation error
- Set countdown to 365+ → should show validation error

### Test Case 4: Regression Test
- Verify "Extend Timer" (+X days) still works independently
- Verify initial assignment countdown still works

---

## Security Considerations

- ✅ Require ADMIN role authentication
- ✅ Validate `days` parameter (1-90 range)
- ✅ Log all countdown updates for audit trail
- ✅ Check lead exists before updating
- ✅ Only allow for APPROVED/ASSIGNED leads

---

## Database Impact

**Prisma Model**: `Lead.expiresAt`
- Type: `DateTime?`
- Update: Set to `new Date(Date.now() + days * 24 * 60 * 60 * 1000)`
- No schema changes required

---

## Conclusion

**Priority**: High  
**Complexity**: Low (1-2 hour implementation)  
**Risk**: Low (new endpoint, no breaking changes)  

**Recommendation**: Proceed with **Option A** (new endpoint) to maintain clear separation between:
- **Extend Timer**: Add days to existing expiry (for temporary extensions)
- **Update Countdown**: Set specific countdown value (for corrections/changes)
