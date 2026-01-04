# Lead Lifecycle Section Removal Audit

**Date**: November 26, 2025  
**Task**: Remove "Lifecycle & Maintenance" section from Admin Lead Management Modal  
**Reason**: User no longer needs resell, extend timer, archive/unarchive functionality

---

## Current State Analysis

### Frontend (AdminLeadManagementModal.tsx)

**Section D: Lifecycle & Maintenance** (Lines 864-959)
```tsx
{/* SECTION D: Lifecycle & Maintenance (moved up) */}
{(lead.installerId || lead.expiresAt || !lead.archivedAt) && (
  <div className="p-6 rounded-lg bg-surface shadow-neu-outset space-y-4">
    <h3 className="text-heading-3 text-foreground">Lifecycle & Maintenance</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {lead.installerId && onResell && (
        <Button onClick={onResell}>🔄 Resell Lead</Button>
      )}

      {lead.expiresAt && onResetTimer && (
        <div className="flex gap-2">
          <input value={resetDays} onChange={(e) => setResetDays(...)} />
          <Button onClick={onResetTimer}>⏰ Extend Timer (+{resetDays}d)</Button>
        </div>
      )}

      {!lead.archivedAt && onArchive && (
        <Button onClick={onArchive}>🗄️ Archive Lead</Button>
      )}

      {lead.archivedAt && onUnarchive && (
        <Button onClick={onUnarchive}>📤 Restore Lead</Button>
      )}
    </div>
  </div>
)}
```

**Features in Lifecycle Section:**
1. **Resell Lead**: Unassign installer, make lead available again
2. **Extend Timer**: Add days to expiry (replaced by Update Countdown)
3. **Archive Lead**: Hide lead from active lists
4. **Restore Lead**: Unarchive lead

**Props Interface:**
```typescript
interface AdminLeadManagementModalProps {
  onResell?: () => Promise<void>;
  onResetTimer?: (days: number) => Promise<void>;
  onArchive?: () => Promise<void>;
  onUnarchive?: () => Promise<void>;
  // ... other props
}
```

**State Variables Used:**
- `resetDays`: Number input for extend timer (Line 153)

### Parent Component (src/app/admin/leads/[id]/page.tsx)

**Handler Implementations** (Lines 1065-1127):
```typescript
onResell={async () => {
  await handleResell();  // ❌ Function doesn't exist
  setShowManagementModal(false);
}}
onResetTimer={async (days: number) => {
  // Makes API call to /api/leads/[id]/reset-timer
  // ✅ Still needed? NO - replaced by onUpdateCountdown
}}
onArchive={async () => {
  await handleArchive();  // ❌ Function doesn't exist
  setShowManagementModal(false);
}}
onUnarchive={async () => {
  await handleUnarchive();  // ❌ Function doesn't exist
  setShowManagementModal(false);
}}
```

**State Variables** (Lines 166-172):
```typescript
// Phase 7: Lifecycle action states
const [reselling, setReselling] = useState(false);
const [archiving, setArchiving] = useState(false);
const [unarchiving, setUnarchiving] = useState(false);
const [resettingTimer, setResettingTimer] = useState(false);
const [resetDays, setResetDays] = useState(7);
```

### Backend API Routes

**Existing Endpoints:**
1. `POST /api/leads/[id]/resell` - Unassign lead
2. `POST /api/leads/[id]/reset-timer` - Extend countdown (add days)
3. `POST /api/leads/[id]/archive` - Archive lead
4. `POST /api/leads/[id]/unarchive` - Restore lead

---

## What Will Be Removed

### 1. UI Components ✅
- [ ] Entire "Lifecycle & Maintenance" section (Lines 864-959)
- [ ] Resell Lead button
- [ ] Extend Timer input + button
- [ ] Archive Lead button
- [ ] Restore Lead button

### 2. Modal Props ✅
- [ ] `onResell?: () => Promise<void>`
- [ ] `onResetTimer?: (days: number) => Promise<void>`
- [ ] `onArchive?: () => Promise<void>`
- [ ] `onUnarchive?: () => Promise<void>`

### 3. State Variables ✅
**Modal (AdminLeadManagementModal.tsx):**
- [ ] `resetDays` state variable (Line 153)

**Parent Page (admin/leads/[id]/page.tsx):**
- [ ] `reselling` state
- [ ] `archiving` state
- [ ] `unarchiving` state
- [ ] `resettingTimer` state
- [ ] `resetDays` state

### 4. Handler Functions ✅
**Parent Page:**
- [ ] `onResell` handler implementation (Lines 1065-1068)
- [ ] `onResetTimer` handler implementation (Lines 1069-1087)
- [ ] `onArchive` handler implementation (Lines 1114-1117)
- [ ] `onUnarchive` handler implementation (Lines 1118-1121)

### 5. Destructuring ✅
**Modal:**
- [ ] Remove `onResell, onResetTimer, onArchive, onUnarchive` from destructuring

**Parent:**
- [ ] Remove handler references from modal props

---

## What Will Be Kept

### 1. Update Countdown Feature ✅
- Keep `onUpdateCountdown` prop and handler
- Keep countdown input with "Update" button (Lines 795-838)
- This replaces the old "Extend Timer" but sets absolute days instead of adding

### 2. Other Sections ✅
- Section A: Approval & Pricing (with countdown update)
- Section B: Installer Assignment
- Section C: Admin Notes
- Footer: Summary & Actions

### 3. Backend APIs ⚠️
**Decision Required:**
- Keep API routes? (May be used elsewhere or for future)
- Delete API routes? (Clean removal)

**Recommendation**: Keep API routes but mark as deprecated. They may be needed for:
- Manual database operations
- Future features
- Emergency recovery

---

## Implementation Plan

### Step 1: Remove Lifecycle Section from Modal ✅
**File**: `src/components/admin/AdminLeadManagementModal.tsx`
- Remove Lines 864-959 (entire Lifecycle section)
- Remove `resetDays` state variable (Line 153)
- Remove lifecycle props from interface:
  - `onResell?`
  - `onResetTimer?`
  - `onArchive?`
  - `onUnarchive?`
- Remove from destructuring (Lines 100-111)

### Step 2: Remove Handlers from Parent Page ✅
**File**: `src/app/admin/leads/[id]/page.tsx`
- Remove lifecycle state variables (Lines 166-172)
- Remove `onResell` handler (Lines 1065-1068)
- Remove `onResetTimer` handler (Lines 1069-1087)
- Remove `onArchive` handler (Lines 1114-1117)
- Remove `onUnarchive` handler (Lines 1118-1121)

### Step 3: Update Comments/Documentation ✅
- Remove "Section D: Lifecycle & Maintenance" from file header comments
- Update modal description to reflect removal

### Step 4: Test ✅
1. Open Admin Lead Detail page
2. Click "Manage Lead"
3. Verify:
   - ✅ No "Lifecycle & Maintenance" section
   - ✅ Approval & Pricing section works (with Update Countdown)
   - ✅ Installer Assignment works
   - ✅ Admin Notes works
   - ✅ Modal saves changes correctly
4. Check console: No errors about missing props

---

## Affected Features

### What Still Works:
✅ Approve lead and assign to installers  
✅ Update countdown to specific days  
✅ Set lead price  
✅ Add admin notes  
✅ Remove installer assignments  
✅ View assignment history  

### What No Longer Works:
❌ Resell lead (unassign installer)  
❌ Extend timer by adding days (replaced by Update Countdown)  
❌ Archive lead  
❌ Unarchive/restore lead  

---

## Rollback Plan

If removal causes issues:

```bash
# Revert modal changes
git checkout HEAD -- src/components/admin/AdminLeadManagementModal.tsx

# Revert parent page changes
git checkout HEAD -- src/app/admin/leads/[id]/page.tsx

# Restart dev server
npm run dev
```

---

## API Routes Status

**Keep but Deprecate:**
- `/api/leads/[id]/resell` - May need manual resell in future
- `/api/leads/[id]/reset-timer` - Replaced by `/update-countdown`
- `/api/leads/[id]/archive` - May need archiving feature later
- `/api/leads/[id]/unarchive` - Paired with archive

**Recommendation**: Add deprecation comments to these routes but don't delete.

---

## Success Criteria

- [x] Audit completed
- [ ] Lifecycle section removed from modal
- [ ] Lifecycle props removed from interface
- [ ] Lifecycle handlers removed from parent
- [ ] Lifecycle state variables removed
- [ ] Modal compiles without errors
- [ ] Modal opens and functions correctly
- [ ] Update Countdown still works
- [ ] All other features unaffected
- [ ] No console errors

---

## Conclusion

**Complexity**: Low (clean UI removal)  
**Risk**: Low (features not actively used)  
**Time**: 10-15 minutes  
**Dependencies**: None (isolated to modal + parent)

The Lifecycle section can be safely removed as:
1. No other components depend on it
2. Backend APIs remain intact
3. "Update Countdown" replaces "Extend Timer"
4. Archive/Resell features are unused
