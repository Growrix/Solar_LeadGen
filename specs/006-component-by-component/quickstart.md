# Quickstart: Component-by-Component Migration

**Feature**: Migrate components to neumorphic design token system  
**Time to First Migration**: ~2 hours (includes setup + first component)  
**Date**: 2025-11-01

---

## Prerequisites

✅ You already have:
- Design token system (`src/design-tokens/`)
- Neumorphic CSS classes (`src/app/globals.css`)
- Centralized components (`src/components/auth/`)
- Design system SOT (`DOC/DESIGN-SYSTEM-SOT.md`)
- Audit report (`DOC/DESIGN-SYSTEM-AUDIT-REPORT.md`)

🎯 You're ready to start migrating!

---

## Quick Start (15 minutes)

### 1. Setup Branch (Already Done ✅)

```bash
# You're already on the correct branch
git branch  # Should show: 006-component-by-component
```

### 2. Create Migration Tracker (5 minutes)

```bash
cd specs/006-component-by-component
```

Create `migration-tracker.md`:

```markdown
# Component Migration Tracker

**Goal**: 40% → 95% design system compliance  
**Total Components**: 15  
**Total Violations**: 285

## Progress

**Components Migrated**: 0/15 (0%)  
**Design System Compliance**: 40%  
**Violations Fixed**: 0/285 (0%)

## Component Status

| Component | Status | Violations Before | Violations After | Date | Commit | Notes |
|-----------|--------|-------------------|------------------|------|--------|-------|
| InstantQuoteForm | ⏳ Not Started | 50 | - | - | - | P1: Highest violations |
| Hero | ⏳ Not Started | 6 | - | - | - | P2: High visibility |
| QuoteOptionsModal | ⏳ Not Started | 10 | - | - | - | P3: User flow critical |
| SimplifiedQuoteForm | ⏳ Not Started | 35 | - | - | - | P4: Backup form |
| HomeownerMobileSidebarMenu | ⏳ Not Started | 20 | - | - | - | P5: Mobile UX |
| HomeownerBottomNavBar | ⏳ Not Started | 5 | - | - | - | P6: Auth components |
| InstallerBottomNavBar | ⏳ Not Started | 5 | - | - | - | P6: Auth components |
| AdminBottomNavBar | ⏳ Not Started | 5 | - | - | - | P6: Auth components |
| GuestSignupModal | ⏳ Not Started | 8 | - | - | - | P6: Auth components |
| HomeownerSignupModal | ⏳ Not Started | 8 | - | - | - | P6: Auth components |
| (Add remaining 5 components...) | | | | | | |

## Legend

- ⏳ Not Started: No work begun
- 🚧 In Progress: Audit created, migration started
- ✅ Complete: Verification passed, committed
- ❌ Blocked: Dependency or issue preventing progress
```

### 3. Create Audits Directory (1 minute)

```bash
mkdir -p audits
```

---

## Your First Migration: InstantQuoteForm (2 hours)

### Step 1: Create Logic Audit (30 minutes)

Create `audits/InstantQuoteForm-logic.md`:

```bash
# Open the component
code src/components/InstantQuoteForm.tsx
```

Document:
1. **State variables**: List all useState calls
2. **Props**: Copy TypeScript interface
3. **Event handlers**: List onClick, onChange, onSubmit
4. **Side effects**: Document useEffect, API calls
5. **Conditional logic**: Note if/else, ternary operators
6. **Form validation**: Document validation rules
7. **Checklist**: Mark what to ✅ Preserve vs ❌ Replace

**Template**:
```markdown
# Component Logic Audit: InstantQuoteForm

**File**: `src/components/InstantQuoteForm.tsx`  
**Lines**: [count]  
**Violations**: 50+  
**Risk Level**: HIGH

## State Management
[List all useState, useReducer, useContext]

## Props Interface
[Copy TypeScript interface]

## Event Handlers
[List all onClick, onChange, etc.]

## Side Effects
[List useEffect, API calls]

## Conditional Logic
[List if/else, ternary operators]

## Form Validation
[Document validation rules]

## Logic Preservation Checklist
- ✅ PRESERVE: [what to keep]
- ❌ REPLACE: className strings only
```

### Step 2: Plan Replacement Map (15 minutes)

Using `DOC/DESIGN-SYSTEM-SOT.md`, create replacement list:

```markdown
## Replacement Map

| Old Class | New Class | Count | Notes |
|-----------|-----------|-------|-------|
| bg-slate-700 | bg-surface | 15 | Card backgrounds |
| text-slate-400 | text-muted | 8 | Secondary text |
| dark:text-white | text-foreground | 12 | Remove dark: prefix |
| text-2xl font-bold | text-heading-2 | 3 | Section headings |
| px-6 py-4 | px-card-padding py-card-padding | 10 | Consistent spacing |
| baseInputClasses | <AuthInput> | 5 | Use centralized component |
```

### Step 3: Execute Migration (45 minutes)

```bash
# Open component in editor
code src/components/InstantQuoteForm.tsx
```

**Replace systematically** (use Find & Replace):
1. Search: `bg-slate-700` → Replace: `bg-surface` (Replace All)
2. Search: `text-slate-400` → Replace: `text-muted` (Replace All)
3. Search: `dark:text-white` → Replace: `text-foreground` (Replace All)
4. Search: `text-2xl font-bold` → Replace: `text-heading-2` (Replace All)
5. Replace `baseInputClasses` with `<AuthInput>` component
6. Replace inline SVG with icon library components

**Save file** after each replacement batch.

### Step 4: Test Immediately (15 minutes)

```bash
# Start dev server
npm run dev
```

**Manual QA Checklist** (Quick Version):
- [ ] Navigate to instant quote page
- [ ] Component renders without errors
- [ ] All buttons clickable
- [ ] Form inputs work (type, clear, submit)
- [ ] Validation shows errors correctly
- [ ] API submission works
- [ ] No console errors
- [ ] Responsive (test mobile 375px)

### Step 5: Verify Migration (5 minutes)

```bash
# Check for remaining violations
grep -E "(bg-slate-|text-slate-|dark:)" src/components/InstantQuoteForm.tsx

# Should return NOTHING (zero violations)
```

**If violations found**: Go back to Step 3, fix remaining classes.

### Step 6: Build Validation (5 minutes)

```bash
# TypeScript check
npx tsc --noEmit

# Build check
npm run build
```

**Both MUST pass** before committing.

### Step 7: Commit (5 minutes)

```bash
git add src/components/InstantQuoteForm.tsx
git commit -m "refactor(InstantQuoteForm): migrate to design token system

- Replaced 15 bg-slate-* with bg-surface
- Replaced 8 text-slate-* with text-muted
- Replaced 12 dark:text-white with text-foreground
- Replaced 3 text-2xl font-bold with text-heading-2
- Replaced 10 hardcoded spacing with px-card-padding
- Migrated 5 inputs to AuthInput component

Logic preserved:
- Form validation unchanged
- Quote calculation unchanged
- API submission unchanged

Validation:
- Manual QA checklist passed
- Zero violations remaining
- TypeScript validation passed
- Build passed

Closes #006 (Component-by-Component - InstantQuoteForm)"
```

### Step 8: Update Tracker (2 minutes)

Edit `migration-tracker.md`:

```markdown
| InstantQuoteForm | ✅ Complete | 50 | 0 | 2025-11-02 | abc123f | Used AuthInput |
```

Update progress:
```markdown
**Components Migrated**: 1/15 (6.7%)  
**Design System Compliance**: 47%  
**Violations Fixed**: 50/285 (17.5%)
```

---

## Repeat for Remaining Components

### Priority Order

1. ✅ **InstantQuoteForm** (P1) - DONE! 🎉
2. ⏳ **Hero** (P2) - Next! (6 violations, ~1 hour)
3. ⏳ **QuoteOptionsModal** (P3) - (10 violations, ~1.5 hours)
4. ⏳ **SimplifiedQuoteForm** (P4) - (35 violations, ~2 hours)
5. ⏳ **HomeownerMobileSidebarMenu** (P5) - (20 violations, ~1.5 hours)
6. ⏳ **Auth Components** (P6) - (5 components, ~1 hour each)

**Total Time**: ~15-20 hours spread over 5-7 days

---

## Verification Script Setup (Optional but Recommended)

### Create Script (30 minutes)

Create `scripts/verify-component.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Patterns to detect hardcoded classes
const patterns = [
  /bg-slate-\d+/g,
  /text-slate-\d+/g,
  /bg-gray-\d+/g,
  /text-gray-\d+/g,
  /dark:text-/g,
  /dark:bg-/g,
  /text-\d+xl/g,
  /font-(bold|semibold)/g,
  /p(x|y)?-\d+/g,
];

function verifyComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let violations = [];
  
  lines.forEach((line, idx) => {
    patterns.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        violations.push({
          line: idx + 1,
          matches: matches,
          content: line.trim()
        });
      }
    });
  });
  
  if (violations.length === 0) {
    console.log(`✅ PASSED: ${filePath} - Zero violations found`);
    process.exit(0);
  } else {
    console.log(`❌ FAILED: ${filePath} - ${violations.length} violations found\n`);
    violations.forEach(v => {
      console.log(`Line ${v.line}: ${v.matches.join(', ')}`);
      console.log(`  ${v.content}\n`);
    });
    process.exit(1);
  }
}

// Usage: node scripts/verify-component.js src/components/InstantQuoteForm.tsx
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node verify-component.js <file-path>');
  process.exit(1);
}

verifyComponent(filePath);
```

### Use Script

```bash
# Verify specific component
node scripts/verify-component.js src/components/InstantQuoteForm.tsx

# Exit code 0 = PASSED (ready to commit)
# Exit code 1 = FAILED (fix violations first)
```

---

## Troubleshooting

### Issue: Component breaks after migration

**Solution**: Reference logic audit report
1. Check: Did you preserve all state variables?
2. Check: Did you preserve event handlers?
3. Check: Did you preserve form validation?
4. Check: Did you only change className strings?

**Quick Fix**: Revert commit, re-read audit, try again
```bash
git log --oneline  # Find commit hash
git revert <hash>  # Undo migration
```

### Issue: Verification script finds violations

**Solution**: Complete the migration
1. Look at reported line numbers
2. Replace remaining hardcoded classes
3. Re-run verification
4. Repeat until exit code 0

### Issue: TypeScript errors after migration

**Solution**: Likely unrelated to className changes
1. Check: Did you accidentally change prop types?
2. Check: Did you remove required imports?
3. Fix TypeScript errors first
4. Then re-run verification

### Issue: Component looks different in dark mode

**Solution**: You're using design tokens correctly! 
1. Dark theme is PRIMARY theme (not secondary)
2. If it looks good in dark, you succeeded
3. Light theme coming later (constitution v1.0.2)

---

## Tips for Success

### DO ✅
- Create audit report BEFORE touching code
- Test IMMEDIATELY after each change batch
- Use Find & Replace for bulk changes
- Commit ONE component at a time
- Update tracker after each migration
- Reference DESIGN-SYSTEM-SOT.md for patterns

### DON'T ❌
- Skip the audit (risk breaking functionality)
- Change multiple components at once (hard to review)
- Mix old and new classes (hybrid patterns)
- Commit without verification passing
- Forget to update migration tracker
- Invent new patterns (follow SOT document)

---

## Success Metrics

### After First Component (InstantQuoteForm)
- ✅ 50 violations fixed (17.5% of total)
- ✅ Compliance: 40% → 47%
- ✅ Pattern established for remaining components

### After Priority 1-3 Components
- ✅ 66 violations fixed (23% of total)
- ✅ Compliance: 40% → 54%
- ✅ High-impact work complete

### After All Components
- ✅ 285 violations fixed (100%)
- ✅ Compliance: 40% → 95%+
- ✅ Design system fully adopted

---

## Next Steps

1. **Complete InstantQuoteForm** (first migration, establishes pattern)
2. **Migrate Hero** (quick win, high visibility)
3. **Build verification script** (automate quality gates)
4. **Continue through priority list** (systematic approach)
5. **Celebrate milestones** (each component done is progress!)

---

**Ready to Start!** 🚀

Open `src/components/InstantQuoteForm.tsx` and begin Step 1: Create Logic Audit
