# InstallerEligibilityModal Component - Logic Preservation Audit

**Component**: `src/components/InstallerEligibilityModal.tsx`  
**Created**: 2025-11-01  
**Purpose**: Document component logic to preserve during design token migration  
**Status**: 🔄 NEEDS MIGRATION - Hardcoded dark mode classes found

---

## Component Overview

**Lines**: 145 lines  
**Type**: Client component  
**Dependencies**: React (useState, useEffect)

**Purpose**: Pre-qualification modal for installer partners (CEC accreditation, ABN, installation services)

**Current State**: 🔄 Uses mix of design tokens + hardcoded `dark:` classes

---

## Props Interface

```typescript
interface EligibilityFormProps {
  isOpen: boolean;           // Modal visibility state
  onClose: () => void;        // Close modal callback
  onEligible: () => void;     // Success callback (triggers InstallerSignupModal)
}

interface FormData {
  cecAccredited: string;      // 'yes' | 'no' | ''
  hasABN: string;            // 'yes' | 'no' | ''
  providesInstallation: string; // 'yes' | 'no' | ''
}
```

**Validation**: ✅ Props are simple - no changes needed

---

## State Management

### Local State

1. **`formData: FormData`**
   - Tracks 3 yes/no questions
   - Initial: All empty strings
   - Updated: On button clicks via `handleInputChange`

2. **`eligibilityStatus: 'idle' | 'ineligible'`**
   - Initial: `'idle'` (shows form)
   - Set to `'ineligible'`: When any answer is 'no'
   - Reset to `'idle'`: On answer change or "Try Again"

**Preserve**: ✅ All state logic must remain unchanged

---

## Event Handlers

### 1. `handleInputChange(field, value)`
- **Trigger**: Click Yes/No button for any question
- **Action**: Updates `formData[field]`, resets `eligibilityStatus` to 'idle'
- **Preserve**: ✅ State update logic

### 2. `handleCheckEligibility()`
- **Trigger**: Click "Check Eligibility" button
- **Logic**: 
  - Validate all fields answered
  - If all 'yes' → call `onEligible()` (opens InstallerSignupModal)
  - If any 'no' → set `eligibilityStatus = 'ineligible'`
- **Preserve**: ✅ Eligibility logic, callback invocation

### 3. `resetForm()`
- **Trigger**: Click "Try Again" button
- **Action**: Reset `formData` and `eligibilityStatus` to initial state
- **Preserve**: ✅ Reset logic

### 4. `handleClose()`
- **Trigger**: Click X button, backdrop, or ESC key
- **Action**: Call `resetForm()`, then `onClose()`
- **Preserve**: ✅ Cleanup before close

### 5. `useEffect` (ESC key + body overflow)
- **Trigger**: `isOpen` changes
- **Action**: 
  - Add ESC keydown listener → call `handleClose()`
  - Set `body.style.overflow = 'hidden'` (prevent background scroll)
  - Cleanup on unmount
- **Preserve**: ✅ Keyboard navigation, scroll lock

---

## UI States

### State 1: Idle (Eligibility Form)
- Shows 3 questions with Yes/No button pairs
- "Check Eligibility" button (disabled until all answered)
- **Condition**: `eligibilityStatus === 'idle'`

### State 2: Ineligible (Error State)
- Shows red error message
- Lists unmet requirements
- "Try Again" button
- **Condition**: `eligibilityStatus === 'ineligible'`

**Validation**: ✅ Conditional rendering logic must be preserved

---

## Hardcoded Values Audit

### 🔴 Colors (MIGRATION REQUIRED)

#### Heading Colors
```tsx
// Line 86: Modal title
text-slate-900 dark:text-white → text-foreground

// Line 87: Subtitle
text-slate-600 dark:text-slate-400 → text-muted-foreground

// Line 95: Section heading
text-slate-900 dark:text-white → text-foreground

// Line 103: Question labels
text-slate-600 dark:text-slate-300 → text-muted-foreground
```

#### Border Colors
```tsx
// Line 85: Header border
border-gray-200 dark:border-slate-800 → border-border

// Line 107: Unselected button borders
border-border dark:border-slate-700 → border-border (already semantic, remove dark:)

// Line 113: Unselected button borders (duplicate)
border-border dark:border-slate-700 → border-border
```

#### Button Background Colors
```tsx
// Line 107: Unselected button bg
bg-gray-100/50 dark:bg-slate-800/20 → bg-surface/50

// Line 113: Unselected button bg (duplicate)
bg-gray-100/50 dark:bg-slate-800/20 → bg-surface/50
```

#### Button Text Colors
```tsx
// Line 107: Unselected button text
text-slate-600 dark:text-slate-300 → text-muted-foreground

// Line 113: Unselected button text (duplicate)
text-slate-600 dark:text-slate-300 → text-muted-foreground

// Line 107: Hover border color
hover:border-slate-400 dark:hover:border-slate-500 → hover:border-muted

// Line 113: Hover border color (duplicate)
hover:border-slate-400 dark:hover:border-slate-500 → hover:border-muted
```

#### Selected State Colors (FUNCTIONAL - Keep)
```tsx
// Line 107: Selected Yes state (emerald - success)
border-emerald-500 bg-emerald-500/10 text-emerald-500 → KEEP (functional success color)

// Line 113: Selected No state (red - destructive)
border-destructive bg-red-500/10 text-destructive → KEEP (functional error color)
```

#### Close Button Colors
```tsx
// Line 89: Close button
text-slate-500 dark:text-slate-400 → text-subtle
hover:text-slate-800 dark:hover:text-white → hover:text-foreground
```

#### Primary Button (Already Using Token)
```tsx
// Line 119: "Check Eligibility" button
bg-primary → ✅ KEEP (uses orange accent token)
hover:bg-primary/90 → ✅ KEEP
```

#### Ineligible State (Error Message)
```tsx
// Line 130: Error heading
text-slate-900 dark:text-white → text-foreground

// Line 131: Error body text
text-slate-600 dark:text-slate-400 → text-muted-foreground

// Line 141: "Try Again" button
bg-gray-200 dark:bg-slate-700 → bg-surface
text-slate-700 dark:text-slate-300 → text-foreground
hover:bg-gray-300 dark:hover:bg-slate-600 → hover:bg-surface-hover
```

**Total Color Violations**: ~20 instances (mostly `dark:` classes)

### ✅ Typography (ALREADY COMPLIANT)
- Uses `text-2xl`, `text-xl`, `text-sm` (standard sizes)
- Uses `font-bold`, `font-semibold` (standard weights)

### ✅ Spacing (ALREADY COMPLIANT)
- Uses `p-6`, `space-y-6`, `gap-3` (standard tokens)
- Uses `mb-6`, `mt-8` (standard tokens)

### ✅ Borders (ALREADY COMPLIANT)
- Uses `rounded-xl`, `rounded-full` (standard)
- Uses `border-2` (standard)

### ✅ Shadows (ALREADY COMPLIANT)
- Uses `theme-card` (semantic component class)

### ✅ Animations (ALREADY COMPLIANT)
- Uses `animate-fade-in`, `animate-slide-in-up` (design tokens)
- Uses `transition-all`, `transition-colors` (standard)

---

## Responsive Behavior

**Breakpoints**: None (modal is responsive by default via `max-w-2xl` and `px-4`)

**Mobile Behavior**:
- Modal scales to fit screen (`max-w-2xl w-full`)
- Max height: `90vh` with scroll (`overflow-y-auto`)

**Validation**: ✅ No responsive logic to preserve

---

## Logic Preservation Checklist

### ✅ PRESERVE (Do Not Change)
- [x] Props interface (`isOpen`, `onClose`, `onEligible`)
- [x] State management (`formData`, `eligibilityStatus`)
- [x] Event handlers (all 5 functions)
- [x] Conditional rendering (idle vs ineligible states)
- [x] Form validation logic (all 'yes' → eligible)
- [x] ESC key listener + body overflow lock
- [x] Modal backdrop + click-outside-to-close
- [x] 3 eligibility questions structure
- [x] Yes/No button pairs
- [x] Disabled state on "Check Eligibility" button
- [x] Error message + unmet requirements list
- [x] Icon components (inline SVGs)
- [x] Animation classes (fade-in, slide-in-up)
- [x] Transform hover effect (`hover:scale-105` on primary button)

### ❌ REPLACE (Migration Targets)
- [ ] All `text-slate-*` → semantic tokens
- [ ] All `bg-slate-*`, `bg-gray-*` → semantic tokens
- [ ] All `border-gray-*`, `border-slate-*` → semantic tokens
- [ ] All `dark:*` classes → remove (auto-theme via tokens)
- [ ] Close button hover states → semantic tokens
- [ ] "Try Again" button colors → semantic tokens

### ⚠️ KEEP (Functional Colors)
- [x] Selected Yes state: `border-emerald-500 bg-emerald-500/10 text-emerald-500`
- [x] Selected No state: `border-destructive bg-red-500/10 text-destructive`
- [x] Error message box: `bg-red-500/10 border-destructive/30`
- [x] Error icon background: `bg-red-500/20`

---

## Migration Tasks (T017-T023)

### T017: Replace modal heading colors
```tsx
// Line 86
text-slate-900 dark:text-white → text-foreground

// Line 87
text-slate-600 dark:text-slate-400 → text-muted-foreground

// Line 95
text-slate-900 dark:text-white → text-foreground
```

### T018: Replace modal body text
```tsx
// Line 103
text-slate-600 dark:text-slate-300 → text-muted-foreground

// Line 131
text-slate-600 dark:text-slate-400 → text-muted-foreground
```

### T019: Replace form inputs with AuthInput
**NOT APPLICABLE** - This modal uses custom Yes/No buttons, not text inputs. No AuthInput needed.

**Alternative**: Replace button styling with design tokens (already covered in T017-T018)

### T020: Replace buttons with AuthButton
**PARTIAL** - Only "Check Eligibility" button could use AuthButton
- "Check Eligibility": Already uses `bg-primary` → **Keep as-is** (already semantic)
- Yes/No buttons: Custom styling required → **Use design tokens only**
- "Try Again": Secondary button → **Use design tokens only**

**Decision**: Keep custom buttons, migrate colors only

### T021: Verify eligibility logic
- Test form validation (all fields required)
- Test all 'yes' → `onEligible()` called → InstallerSignupModal opens
- Test any 'no' → `eligibilityStatus = 'ineligible'` → Error state shows
- Test "Try Again" → form resets
- Test ESC key → modal closes
- Test backdrop click → modal closes

### T022: Run verification
```bash
grep -E '(bg-slate-|text-slate-|dark:)' src/components/InstallerEligibilityModal.tsx
# Expected: ZERO matches after migration
```

### T023: Update migration tracker
Mark InstallerEligibilityModal as "✅ Complete" in tracker

---

## Testing Checklist

### Visual Verification (After Migration)
- [ ] Modal backdrop has proper opacity
- [ ] Modal card has neumorphic styling
- [ ] Question labels are readable (muted foreground)
- [ ] Unselected buttons: Surface background, muted text
- [ ] Hover: Button borders highlight
- [ ] Selected Yes: Green border + background (functional color)
- [ ] Selected No: Red border + background (functional color)
- [ ] "Check Eligibility" button: Orange primary color
- [ ] "Check Eligibility" disabled: Reduced opacity
- [ ] Ineligible state: Error message readable
- [ ] Error icon background: Red tint
- [ ] "Try Again" button: Surface background
- [ ] Close button: Subtle color, hover to foreground
- [ ] No hardcoded `dark:` classes remain

### Functional Verification
- [ ] Click Yes/No → Button highlights
- [ ] Change answer → Error state resets
- [ ] All 'yes' + submit → InstallerSignupModal opens
- [ ] Any 'no' + submit → Error state shows
- [ ] Error state: Lists unmet requirements correctly
- [ ] "Try Again" → Form resets to idle
- [ ] ESC key → Modal closes
- [ ] Backdrop click → Modal closes
- [ ] Close button → Modal closes
- [ ] Body scroll locked when modal open
- [ ] Body scroll restored when modal closed

---

## Estimated Migration Time

- **Audit**: ✅ Complete (this document)
- **Color Replacement**: ~15 minutes (20 instances)
- **Testing**: ~10 minutes (all states + logic)
- **Total**: ~25 minutes

---

## Conclusion

**Status**: 🔄 **NEEDS MIGRATION**

This component has ~20 hardcoded color violations (mostly `dark:` classes). All logic and animations are already correct. Migration is straightforward: replace color classes with semantic tokens.

**Key Preservation**:
- Keep all event handlers unchanged
- Keep Yes/No button structure
- Keep functional colors (green success, red error)
- Keep eligibility logic (all 'yes' → eligible)
- Keep ESC + backdrop close behavior

**Next Steps**: Execute T017-T023 in tasks.md
