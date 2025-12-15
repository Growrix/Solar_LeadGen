# Component Migration Quick Reference

**Last Updated:** November 5, 2025  
**Purpose:** One-page reference aligned with current neumorphic design system

---

## 🚨 THE ADMIN LEAD DETAILS LESSON (What Went Wrong - Nov 5, 2025)

**Problem:** White areas persisted on Admin Lead Details page despite "migration complete" report

**Root Causes:**
1. ❌ Main page file verified clean, but child components NOT checked
2. ❌ QuoteDataDisplay, InstallerSelectorModal, AssignmentHistoryTable had 100+ hardcoded colors
3. ❌ Verification commands only checked main file (not component tree)
4. ❌ Reported "complete" without checking ALL files in tree
5. ❌ Old 4-command verification missed `dark:text-green-400` patterns

**The Fix (Current System - Nov 5, 2025):**
1. ✅ Component tree mapping is MANDATORY STEP 1 (identify ALL files)
2. ✅ 6-command verification on EVERY file (not just main)
3. ✅ Semantic tokens: `bg-surface`, `text-foreground`, `border-border`
4. ✅ Neumorphic shadows: `shadow-neu-outset` (raised), `shadow-neu-inset` (pressed)
5. ✅ Honest reporting showing 0/0/0/0/0/0 for EACH file
6. ✅ `.theme-card` class OR inline `bg-surface shadow-neu-outset` (both valid)

---

## ✅ THE 4-STEP SYSTEM (Follow This Every Time - Updated Nov 5, 2025)

### STEP 0: COMPONENT TREE MAPPING (5 min) - **NEW: MANDATORY**

```powershell
# STEP 0A: Find ALL components in the tree
Select-String -Path "src\app\your-page\page.tsx" -Pattern "import.*from.*components" | Select-Object Line

# STEP 0B: List ALL files to verify
@"
Component Tree for: [Page/Component Name]

Files to Verify:
- [ ] src/app/your-page/page.tsx (main file)
- [ ] src/components/Component1.tsx (child 1)
- [ ] src/components/Component2.tsx (child 2)
- [ ] src/components/Component3.tsx (child 3)

Migration Complete When: ALL files show 0/0/0/0/0/0
"@ | Out-File -FilePath "migration-checklist.txt"

# STEP 0C: Check if child components import MORE components (recursive)
Select-String -Path "src\components\Component1.tsx" -Pattern "import.*from.*components"
```

### STEP 1: PRE-FLIGHT (10 min)

```powershell
# System Health Check
Select-String -Path "src\app\globals.css" -Pattern "\.form-input" -Context 0,7
Select-String -Path "src\app\globals.css" -Pattern "\.theme-card" -Context 0,7
Select-String -Path "src\app\globals.css" -Pattern "--color-surface:|--shadow-neu-outset:|--shadow-neu-inset:"
Test-Path "src\components\ui\button.tsx"

# Component Inventory (run on EACH file in component tree)
$files = @("src\app\page.tsx", "src\components\Component1.tsx", "src\components\Component2.tsx")
foreach ($file in $files) {
    Write-Host "`n=== $file ===" -ForegroundColor Cyan
    Write-Host "Buttons: $((Select-String -Path $file -Pattern "<button" -AllMatches).Matches.Count)"
    Write-Host "Inputs: $((Select-String -Path $file -Pattern "<input" -AllMatches).Matches.Count)"
    Write-Host "Gray colors: $((Select-String -Path $file -Pattern "bg-(slate|gray|zinc)-" -AllMatches).Matches.Count)"
    Write-Host "Dark prefixes: $((Select-String -Path $file -Pattern "dark:" -AllMatches).Matches.Count)"
}

# Open Reference Components
code src\components\admin\QuoteDataDisplay.tsx  # Recently migrated example
code src\components\HomeownerSignInModal.tsx
code src\app\globals.css
code specs\006-component-by-component\DESIGN-SYSTEM-SOT.md
```

### STEP 2: MIGRATION (15-30 min)

```tsx
// ✅ CORRECT Patterns (Copy These - Current System Nov 5, 2025)

// Modals/Cards - Option 1: Use .theme-card class (preferred for consistency)
<div className="theme-card relative w-full max-w-md p-8">
  {/* Uses bg-surface + shadow-neu-outset + border via .theme-card */}
</div>

// Modals/Cards - Option 2: Inline Tailwind (if .theme-card not suitable)
<div className="bg-surface shadow-neu-outset rounded-lg border border-border p-6">
  {/* Explicit inline pattern */}
</div>

// Form Inputs - ALWAYS use complete neumorphic pattern
<input className="form-input w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 placeholder:text-muted-foreground" type="text" />

// Form Textareas - ALWAYS use complete neumorphic pattern
<textarea className="form-input w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 placeholder:text-muted-foreground" rows={4} />

// Buttons - ALWAYS use Button component
import Button from '@/components/ui/button';
<Button variant="primary" className="w-full py-3">Submit</Button>

// Text - Use semantic tokens
<h2 className="text-foreground text-xl font-semibold">Title</h2>
<p className="text-muted-foreground">Secondary text</p>
<span className="text-subtle">Tertiary/placeholder text</span>

// Status Colors
// Status Buttons (MANDATORY pattern for ALL status buttons)
<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-success/10 text-success border-success/20">Approved</span>
<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-error/10 text-error border-error/20">Rejected</span>
<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-warning/10 text-warning border-warning/20">Pending</span>
<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-info/10 text-info border-info/20">Info</span>
// Use these exact classes for ALL status buttons in every component. Do NOT use any other color, border, or size pattern for status buttons.

// Borders
<div className="border border-border">Standard border</div>
<div className="border border-success">Success border</div>
```

### STEP 3: VERIFICATION (15 min) - **UPDATED: 6-Command Set**

```powershell
# Run on EVERY file in component tree (not just main file!)
$files = @("src\app\page.tsx", "src\components\Component1.tsx", "src\components\Component2.tsx")

foreach ($file in $files) {
    Write-Host "`n=== Verifying $file ===" -ForegroundColor Cyan
    
    # Command 1: Gray/slate/zinc colors
    $cmd1 = (Select-String -Path $file -Pattern "text-gray-|text-slate-|text-zinc-|bg-gray-|bg-slate-|bg-zinc-|border-gray-|border-slate-" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "1. Gray/slate: $cmd1" -ForegroundColor $(if ($cmd1 -eq 0) { "Green" } else { "Red" })
    
    # Command 2: ALL dark: prefixes (catches dark:text-green-400)
    $cmd2 = (Select-String -Path $file -Pattern "dark:" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "2. Dark mode: $cmd2" -ForegroundColor $(if ($cmd2 -eq 0) { "Green" } else { "Red" })
    
    # Command 3: RGB/HEX colors (excluding SVG)
    $cmd3 = (Select-String -Path $file -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" -ErrorAction SilentlyContinue | Where-Object { $_.Line -notmatch "viewBox|fill=|d=" } | Measure-Object).Count
    Write-Host "3. RGB/HEX: $cmd3" -ForegroundColor $(if ($cmd3 -eq 0) { "Green" } else { "Red" })
    
    # Command 4: Hardcoded white/black
    $cmd4 = (Select-String -Path $file -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b|border-white\b" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "4. White/black: $cmd4" -ForegroundColor $(if ($cmd4 -eq 0) { "Green" } else { "Red" })
    
    # Command 5: Hardcoded typography
    $cmd5 = (Select-String -Path $file -Pattern "text-xs|text-sm|text-lg|text-xl|text-2xl|font-bold|font-semibold" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "5. Typography: $cmd5" -ForegroundColor $(if ($cmd5 -eq 0) { "Green" } else { "Red" })
    
    # Command 6: Manual responsive
    $cmd6 = (Select-String -Path $file -Pattern "sm:text-|md:text-|lg:text-" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "6. Responsive: $cmd6" -ForegroundColor $(if ($cmd6 -eq 0) { "Green" } else { "Red" })
    
    # Summary
    $total = $cmd1 + $cmd2 + $cmd3 + $cmd4 + $cmd5 + $cmd6
    if ($total -eq 0) {
        Write-Host "✅ CLEAN: 0/0/0/0/0/0" -ForegroundColor Green
    } else {
        Write-Host "❌ INCOMPLETE: $total violations ($cmd1/$cmd2/$cmd3/$cmd4/$cmd5/$cmd6)" -ForegroundColor Red
    }
}

# TypeScript
npx tsc --noEmit --project .

# Visual Test ALL 3 Themes (MANDATORY)
# Dark (#121212) → Light (#E0E5EC) → Purple (#2C1D4D)
# Verify: No white/gray bleed, neumorphic shadows visible, text readable
```

---

## 🔴 CRITICAL RULES (Zero Tolerance - Updated Nov 5, 2025)

### Rule #0: COMPONENT TREE MAPPING IS MANDATORY (NEW)
❌ Skip tree mapping → Miss child components → White areas persist → Rework  
✅ Map ALL files FIRST → Verify EACH file → Complete migration → No rework

### Rule #1: PRE-FLIGHT CHECK BEFORE STARTING
❌ Skip system check → Miss hardcoded values in globals.css → Rework  
✅ Run system check → Catch issues early → No rework

### Rule #2: USE .theme-card OR bg-surface shadow-neu-outset
❌ `<div className="bg-white dark:bg-gray-800">` (hardcoded)  
✅ `<div className="theme-card p-8">` (class) OR `<div className="bg-surface shadow-neu-outset rounded-lg p-6">` (inline)

### Rule #3: USE COMPLETE NEUMORPHIC PATTERN FOR ALL FORM INPUTS
❌ `<input className="form-input w-full" />` (incomplete - missing neumorphic styling)  
❌ `<input className="w-full bg-surface border border-border/50..." />` (no .form-input class)  
✅ `<input className="form-input w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 placeholder:text-muted-foreground" />` (COMPLETE pattern)

### Rule #4: RUN 6-COMMAND VERIFICATION ON ALL FILES
❌ Verify main file only → Child components have hardcoded colors → Rework  
✅ Verify ALL files in tree → 0/0/0/0/0/0 on each → Complete → No rework

### Rule #5: TEST ALL 3 THEMES BEFORE MARKING COMPLETE
❌ Test dark only → Mark complete → Light broken → Rework  
✅ Test dark/light/purple → All work → Mark complete → No rework

### Rule #6: ALL ADMIN PAGES (NEW OR MIGRATED) FOLLOW SAME STRUCTURE (Added Nov 8, 2025)
❌ Build admin page with inline logic/state → 600+ lines → Hard to maintain  
✅ Simple wrapper (p-4 sm:p-6 lg:p-8) → Extract to component → 20 lines → Maintainable

**APPROVED PATTERN FOR ALL ADMIN PAGES** (new or migrated):
```tsx
'use client';

import React from 'react';
import YourTableComponent from '@/components/admin/YourTableComponent';

export default function AdminPageName() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <YourTableComponent />
    </div>
  );
}
```

**VERIFICATION**: Check page file is <30 lines, has NO useState/useEffect, imports single component, uses EXACT padding pattern `p-4 sm:p-6 lg:p-8`. Run: `Get-Content "src\app\admin\your-page\page.tsx" | Measure-Object -Line` (should be <30).

### Rule #7: COMPONENT LIBRARY DEVELOPMENT REQUIRES COMPREHENSIVE AUDIT FIRST (Added Nov 8, 2025)
❌ Build library with assumed patterns → Fake button classes → Inaccurate docs → Rework  
✅ Audit globals.css + Button component + codebase → Create audit doc → Build library → Accurate

**MANDATORY WORKFLOW FOR COMPONENT LIBRARY DEVELOPMENT**:
```powershell
# STEP 1: Audit globals.css (ALL 1572 lines)
code src\app\globals.css
# - Identify @layer components classes
# - Document custom semantic classes (dashboard-*, toggle-*, form-*, etc.)

# STEP 2: Audit component files (Button, Badge, Card, Form)
code src\components\ui\button.tsx
# - Document ALL variant classes with EXACT classNames
# - Example: Button has 6 variants: primary, secondary, ghost, outline, minimal, destructive

# STEP 3: Grep codebase for real usage patterns
Select-String -Path "src\**\*.tsx" -Pattern "className.*button|className.*btn" | Select-Object -First 50
Select-String -Path "src\**\*.tsx" -Pattern "form-input|form-select" | Measure-Object
Select-String -Path "src\**\*.tsx" -Pattern "theme-card|detail-card" | Measure-Object

# STEP 4: Create comprehensive audit document (e.g., BUTTON-AUDIT-COMPLETE.md)
# - List EVERY real pattern with: name, exact className, real usage count, real locations
# - NO fake patterns, NO assumed classes, NO made-up examples
# - Document: Component variants, custom classes, raw Tailwind patterns

# STEP 5: Build library ONLY from audit document
# - Copy exact classNames from audit
# - Use real usage count from grep
# - Use real "Used In" locations from codebase
# - Examples must match real component usage
```

**VERIFICATION BEFORE MARKING COMPLETE**:
1. ✅ Every pattern exists in Button component OR globals.css OR codebase (verify with grep)
2. ✅ No fake classNames (check each with `Select-String`)
3. ✅ Usage counts match real grep count
4. ✅ "Used In" locations are real file paths (not assumed)
5. ✅ Example code matches real component usage (not mock examples)

**REFERENCE**: See `BUTTON-AUDIT-COMPLETE.md` for complete audit of all 14 real button patterns (6 Button variants, 4 custom dashboard classes, 4 raw Tailwind patterns).


### Rule #6: ALL ADMIN PAGES FOLLOW SAME STRUCTURE (NEW - Nov 8, 2025)
❌ Build page with inline state/logic (600+ lines) → Inconsistent with other pages → Rework  
✅ Simple wrapper + component extraction (<30 lines) → Consistent → No rework  

**MANDATORY Pattern for ALL Admin Pages** (new OR migrated):
```tsx
'use client';

import React from 'react';
import YourTableComponent from '@/components/admin/YourTableComponent';

export default function AdminPageName() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <YourTableComponent />
    </div>
  );
}
```

**Reference:** `src/app/admin/installers/page.tsx` (20 lines, gold standard)  
**See:** DESIGN-SYSTEM-SOT.md → "📐 ADMIN DASHBOARD LAYOUT STANDARD"

### Rule #6: HONEST REPORTING (NEVER CLAIM COMPLETE WITHOUT PROOF)
❌ "Migration complete!" (vague) → User finds white areas → Trust broken  
✅ "Main: 0/0/0/0/0/0 ✅, Child1: 0/0/0/0/0/0 ✅ → Complete" (detailed) → Trust maintained

### Rule #7: ATOMIC MIGRATION (100% or Nothing)
❌ Migrate 3 of 5 buttons → Inconsistent → Rework  
✅ Migrate all 5 buttons → Consistent → Done once

### Rule #8: COPY PATTERNS, DON'T INVENT
❌ Invent new CSS approach → Inconsistent with system  
✅ Copy from QuoteDataDisplay.tsx → Consistent patterns

### Rule #9: PRESERVE ALL LOGIC
❌ Change hooks/handlers → Functionality breaks  
✅ Change only className → Functionality preserved

### Rule #10: ADMIN PAGES USE STANDARD LAYOUT (NEW - Nov 6, 2025)
❌ `<div className="p-4 sm:p-6 lg:p-8"><div className="max-w-7xl mx-auto">...</div></div>` (Instant Quotes issue)  
✅ `<div className="p-4 sm:p-6 lg:p-8"><YourTableComponent /></div>` (Installers standard)  
**Reason**: Full-width layout for data tables, no centered containers on page level  
**Reference**: See `DOC/ADMIN-LAYOUT-AUDIT.md` for complete standard

---

## 🚫 TOP 6 MISTAKES TO AVOID

### Mistake #1: Partial Migration
```tsx
// ❌ WRONG
<form className="bg-surface">  // ✅ Migrated
  <button className="bg-teal-600">Submit</button>  // ❌ NOT MIGRATED
</form>
```

### Mistake #2: Only Verifying Main File (Admin Lead Details Issue - Nov 5)
```tsx
// ❌ WRONG
// Verified: src/app/admin/leads/[id]/page.tsx → Clean ✅
// Did NOT verify: QuoteDataDisplay.tsx, InstallerSelectorModal.tsx
// Result: Page shows white areas because child components not migrated

// ✅ CORRECT
// Step 1: Map component tree (find ALL imports)
// Step 2: Verify EACH file with 6 commands
// Main: 0/0/0/0/0/0 ✅
// QuoteDataDisplay: 0/0/0/0/0/0 ✅
// InstallerSelector: 0/0/0/0/0/0 ✅
// Result: No white areas, true complete
```

### Mistake #3: Using Incomplete .form-input Pattern
```tsx
// ❌ WRONG - Missing neumorphic styling
<input className="form-input w-full" />
<input className="form-input w-full placeholder:text-muted-foreground" />

// ❌ WRONG - No .form-input class
<input className="w-full bg-surface border border-border/50 rounded-xl shadow-neu-inset" />

// ✅ CORRECT - Complete neumorphic pattern (ALL inputs must use this)
<input className="form-input w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 placeholder:text-muted-foreground" type="text" />
<textarea className="form-input w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 placeholder:text-muted-foreground" rows={4} />
```

### Mistake #4: Hardcoding Colors with dark: Prefix
```tsx
// ❌ WRONG
<div className="bg-white dark:bg-gray-800">
<p className="text-gray-900 dark:text-white">
<span className="text-green-600 dark:text-green-400">

// ✅ CORRECT - Use semantic tokens
<div className="bg-surface shadow-neu-outset">
<p className="text-foreground">
<span className="text-success">
```

### Mistake #5: Reporting Complete Without Proof
```
❌ WRONG: "Migration complete! ✅" (no verification results shown)

✅ CORRECT: 
"Migration Verification Report:
- page.tsx: 0/0/0/0/0/0 ✅ CLEAN
- QuoteDataDisplay.tsx: 0/0/0/0/0/0 ✅ CLEAN
- InstallerSelector.tsx: 0/0/0/0/0/0 ✅ CLEAN
Status: COMPLETE ✅"
```

### Mistake #6: Skipping Theme Testing
```
❌ WRONG: Dark ✅ → Mark complete → Light shows white areas
✅ CORRECT: Dark ✅ → Light ✅ → Purple ✅ → Mark complete
```

---

## 📋 VERIFICATION COMMANDS (Copy-Paste - Updated Nov 5, 2025)

```powershell
# === SYSTEM HEALTH ===
Select-String -Path "src\app\globals.css" -Pattern "\.form-input" -Context 0,7
Select-String -Path "src\app\globals.css" -Pattern "\.theme-card" -Context 0,7
Select-String -Path "src\app\globals.css" -Pattern "--shadow-neu-outset|--shadow-neu-inset"

# === COMPONENT TREE MAPPING (STEP 0) ===
$mainFile = "src\app\admin\leads\page.tsx"  # Change this
Select-String -Path $mainFile -Pattern "import.*from.*components"

# === 6-COMMAND VERIFICATION (Run on ALL files in tree) ===
$files = @(
    "src\app\admin\leads\page.tsx",              # Main file
    "src\components\Component1.tsx",             # Child 1
    "src\components\Component2.tsx"              # Child 2
)

foreach ($file in $files) {
    Write-Host "`n=== Verifying $file ===" -ForegroundColor Cyan
    
    # Command 1: Gray/slate/zinc
    $cmd1 = (Select-String -Path $file -Pattern "text-gray-|text-slate-|text-zinc-|bg-gray-|bg-slate-|bg-zinc-|border-gray-|border-slate-" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "1. Gray/slate: $cmd1" -ForegroundColor $(if ($cmd1 -eq 0) { "Green" } else { "Red" })
    
    # Command 2: Dark mode
    $cmd2 = (Select-String -Path $file -Pattern "dark:" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "2. Dark mode: $cmd2" -ForegroundColor $(if ($cmd2 -eq 0) { "Green" } else { "Red" })
    
    # Command 3: RGB/HEX
    $cmd3 = (Select-String -Path $file -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" -ErrorAction SilentlyContinue | Where-Object { $_.Line -notmatch "viewBox|fill=|d=" } | Measure-Object).Count
    Write-Host "3. RGB/HEX: $cmd3" -ForegroundColor $(if ($cmd3 -eq 0) { "Green" } else { "Red" })
    
    # Command 4: White/black
    $cmd4 = (Select-String -Path $file -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b|border-white\b" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "4. White/black: $cmd4" -ForegroundColor $(if ($cmd4 -eq 0) { "Green" } else { "Red" })
    
    # Command 5: Typography
    $cmd5 = (Select-String -Path $file -Pattern "text-xs|text-sm|text-lg|text-xl|text-2xl|font-bold|font-semibold" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "5. Typography: $cmd5" -ForegroundColor $(if ($cmd5 -eq 0) { "Green" } else { "Red" })
    
    # Command 6: Responsive
    $cmd6 = (Select-String -Path $file -Pattern "sm:text-|md:text-|lg:text-" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "6. Responsive: $cmd6" -ForegroundColor $(if ($cmd6 -eq 0) { "Green" } else { "Red" })
    
    $total = $cmd1 + $cmd2 + $cmd3 + $cmd4 + $cmd5 + $cmd6
    if ($total -eq 0) {
        Write-Host "✅ CLEAN: 0/0/0/0/0/0" -ForegroundColor Green
    } else {
        Write-Host "❌ INCOMPLETE: $total ($cmd1/$cmd2/$cmd3/$cmd4/$cmd5/$cmd6)" -ForegroundColor Red
    }
}

# === COMPONENT-SPECIFIC CHECKS ===
# Zero native buttons (all should be <Button>)
(Select-String -Path $file -Pattern "<button").Matches.Count  # Expected: 0

# Central classes used
Select-String -Path $file -Pattern "(form-input|theme-card|Button component|bg-surface shadow-neu-outset)"  # Expected: FOUND

# TypeScript
npx tsc --noEmit --project .  # Expected: 0 errors
```

---

## 🎯 ONE-PAGE WORKFLOW

```
┌─────────────────────────────────────────────────┐
│ 0. COMPONENT TREE MAPPING (5 min)             │
│    ├─ Identify ALL child components            │
│    ├─ Document component hierarchy             │
│    ├─ List ALL files requiring verification    │
│    └─ Create verification checklist            │
├─────────────────────────────────────────────────┤
│ 1. PRE-FLIGHT (10 min)                         │
│    ├─ GATE 0 health check (MANDATORY)          │
│    ├─ Component inventory with tree mapping    │
│    ├─ Open reference components                │
│    └─ Logic audit (ALL files in tree)          │
├─────────────────────────────────────────────────┤
│ 2. MIGRATION (15-30 min)                       │
│    ├─ Replace ALL buttons → <Button>           │
│    ├─ Replace hardcoded colors → tokens        │
│    ├─ Use .theme-card OR bg-surface + shadow   │
│    ├─ Remove ALL dark: prefixes                │
│    ├─ Remove ALL legacy code                   │
│    └─ Preserve ALL logic (ZERO logic changes)  │
├─────────────────────────────────────────────────┤
│ 3. VERIFICATION (15 min)                       │
│    ├─ Run 6-command verification on ALL files  │
│    ├─ Verify 0/0/0/0/0/0 for EACH file         │
│    ├─ TypeScript compiles (npx tsc --noEmit)   │
│    ├─ Build succeeds (npm run build)           │
│    ├─ Visual test (3 themes)                   │
│    ├─ Functional test (all interactions)       │
│    └─ Document results for EACH file           │
├─────────────────────────────────────────────────┤
│ 4. HONEST REPORTING & COMMIT (5 min)           │
│    ├─ Create detailed status report            │
│    ├─ Show 0/0/0/0/0/0 for EACH file           │
│    ├─ List ANY files with violations           │
│    ├─ User approval                            │
│    └─ Mark task complete ONLY if ALL clean     │
└─────────────────────────────────────────────────┘

Total: 50-65 min/component (includes tree mapping + 6-command on all files)
Success: 100% (if checklist followed)
```

---

## 📋 CURRENT SYSTEM REFERENCE

**✅ What We Use (November 5, 2025)**
- `.theme-card` class (exists in globals.css, actively used)
- `.form-input` class (exists in globals.css, actively used)
- `<Button>` component (src/components/ui/button.tsx)
- Semantic tokens: `bg-surface`, `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`
- Neumorphic shadows: `shadow-neu-outset` (raised), `shadow-neu-inset` (pressed)
- Multi-theme support: Dark (#121212), Light (#E0E5EC), Purple (#2C1D4D)
- 6-command verification set (expanded from 4 commands)
- Component tree mapping (mandatory STEP 0)

**❌ What We Don't Use (Removed)**
- Storybook (no .storybook directory)
- Chromatic (never used)
- shadcn (never used in project)
- Theme toggle components (removed in spec-004)
- Direct dark: prefixes (use CSS variables instead)

**🔄 Migration Patterns**
- Cards/Containers: `.theme-card` OR `bg-surface shadow-neu-outset border border-border rounded-lg`
- Buttons: Replace ALL `<button>` → `<Button>` component
- Text: `text-foreground`, `text-muted-foreground` (never `text-gray-X` or `text-slate-X`)
- Backgrounds: `bg-surface`, `bg-background` (never `bg-white`, `bg-gray-X`)
- Borders: `border-border` (never `border-gray-X`)

---
Rework: 0% (component tree verified)
```

---

## 🔥 PRINT THIS & KEEP VISIBLE (Updated Nov 5, 2025)

**STEP 0: Component Tree Mapping (MANDATORY - NEW)**
1. ✅ Find ALL imports with `Select-String -Pattern "import.*from.*components"`
2. ✅ List ALL files to verify (main + all children)
3. ✅ Check if children import MORE components (recursive)
4. ✅ Create checklist file tracking each file's status

**Before starting ANY component:**
1. ✅ Map component tree (STEP 0 above) - 5 min
2. ✅ Run system health check - 5 min
3. ✅ Count elements to migrate in EACH file - 5 min
4. ✅ Open reference components (QuoteDataDisplay.tsx, HomeownerSignInModal.tsx) - 2 min
5. ✅ Identify logic to preserve - 2 min

**After migration:**
1. ✅ Run 6-command verification on EVERY file (not just main)
2. ✅ Verify 0/0/0/0/0/0 on ALL files
3. ✅ Test all 3 themes (Dark, Light, Purple)
4. ✅ Test all interactions
5. ✅ Create detailed report showing EACH file's status

**If ANY file has violations:** Migration is INCOMPLETE. Fix and re-verify ALL files.

**Never report complete without:**
1. ✅ Component tree mapped
2. ✅ 0/0/0/0/0/0 on ALL files
3. ✅ All 3 themes tested
4. ✅ Detailed status report created
5. ✅ User approval

**Current System (Nov 5, 2025):**
- `.theme-card` class for containers (preferred)
- `.form-input` class for form inputs (required) - MUST include complete neumorphic pattern
- Complete input pattern: `form-input w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 placeholder:text-muted-foreground`
- `<Button>` component for buttons (required)
- Semantic tokens: `bg-surface`, `text-foreground`, `border-border`, `text-muted-foreground`
- Neumorphic shadows: `shadow-neu-outset` (raised), `shadow-neu-inset` (pressed)
- Placeholder styling: ALWAYS use `placeholder:text-muted-foreground`
- 6-command verification (not 4)
- Component tree verification (not just main file)
