# Design System - Source of Truth (SOT)
**Purpose**: Complete reference for the neumorphic design system  
**Date**: November 4, 2025 (Updated - Post Homeowner Dashboard Audit)  
**Status**: Active Standard  
**Theme**: Multi-Theme System (Dark, Light, Purple)

---

## 🚨 NEW: CRITICAL LESSONS FROM ADMIN LEAD DETAILS MIGRATION (Nov 5, 2025)

### PAIN POINT #1: Shared Component Dependencies Not Identified

**The Problem:**
- Main page file (`src/app/admin/leads/[id]/page.tsx`) was migrated ✅
- Verification commands checked ONLY the page file ✅
- AI reported "migration complete" ✅
- **BUT**: Page renders `QuoteDataDisplay`, `InstallerSelectorModal`, `AssignmentHistoryTable` components
- These components still had `bg-white`, `dark:bg-gray-800`, `border-gray-200` ❌
- User sees white cards and says "You said it's done, why are there white areas?" ❌

**Why This Happened:**
1. No component dependency tree was created before migration
2. Verification commands only checked the main page file, not imported components
3. AI assumed page migration = complete, without checking child components

**The Solution: Component Tree Mapping (MANDATORY BEFORE MIGRATION)**

```bash
# STEP 1: Identify ALL components rendered by the page
grep -E "import.*from.*components" src/app/admin/leads/[id]/page.tsx

# STEP 2: For EACH imported component, check if it has hardcoded colors
Select-String -Path "src\components\admin\QuoteDataDisplay.tsx" -Pattern "bg-white|bg-gray-|dark:"
Select-String -Path "src\components\admin\InstallerSelectorModal.tsx" -Pattern "bg-white|bg-gray-|dark:"
Select-String -Path "src\components\admin\AssignmentHistoryTable.tsx" -Pattern "bg-white|bg-gray-|dark:"

# STEP 3: If ANY child component has hardcoded colors, add it to migration list
# Migration is NOT complete until ALL components in the tree are migrated
```

**New Rule:**
> **A page migration is ONLY complete when the page file AND ALL its child components are verified clean.**

---

### PAIN POINT #2: Incomplete Verification Patterns

**What Was Missed:**
```powershell
# Old verification only checked these:
Select-String -Pattern "bg-white|bg-gray-|dark:"

# But MISSED these patterns:
dark:text-green-400          # Semantic colors with dark: prefix
dark:text-blue-400           # Status colors with dark: prefix
bg-yellow-50 dark:bg-yellow-950  # Warning backgrounds
border-green-200 dark:border-green-900  # Semantic borders
text-gray-900 dark:text-white     # Text colors
```

**Complete Verification Command Set (Use ALL 6):**

```powershell
# Command 1: Gray/slate/zinc hardcoded colors
Select-String -Path "src\components\**\*.tsx" -Pattern "text-gray-|text-slate-|text-zinc-|bg-gray-|bg-slate-|bg-zinc-|border-gray-|border-slate-"

# Command 2: ALL dark: prefixes (including semantic colors)
Select-String -Path "src\components\**\*.tsx" -Pattern "dark:text-|dark:bg-|dark:border-"

# Command 3: Hardcoded RGB/RGBA/HEX (excluding SVG)
Select-String -Path "src\components\**\*.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" | Where-Object { $_.Line -notmatch "viewBox|fill=|d=" }

# Command 4: Hardcoded white/black
Select-String -Path "src\components\**\*.tsx" -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b|border-white\b"

# Command 5: Hardcoded color names (blue, green, red, yellow, etc.)
Select-String -Path "src\components\**\*.tsx" -Pattern "bg-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]|text-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]|border-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]"

# Command 6: Hardcoded typography (should use semantic tokens)
Select-String -Path "src\components\**\*.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|text-2xl|text-3xl|font-bold|font-semibold|font-medium"

# EXPECTED RESULT: ALL commands return 0 matches
# If ANY command returns matches, migration is INCOMPLETE
```

**New Rule:**
> **Before reporting "migration complete", run ALL 6 verification commands and confirm 0/0/0/0/0/0 results.**

---

### PAIN POINT #3: False Completion Reporting

**User Quote:**
> "You said several times it is done, but now saying you found hardcoded elements. are you insane? You are giving false information most of the time."

**Why This Happened:**
1. AI checked main file, found 0 hardcoded colors ✅
2. AI reported "migration complete" ✅
3. AI didn't check child components ❌
4. User sees white areas, reports issue ❌
5. AI re-checks, finds hardcoded colors in child components ❌
6. User loses trust ❌

**The Solution: Honest, Detailed Reporting**

```markdown
# ❌ WRONG RESPONSE:
"Migration complete! All hardcoded colors removed."

# ✅ CORRECT RESPONSE:
"Migration Status:
- ✅ Main page file (src/app/admin/leads/[id]/page.tsx): Clean (0 hardcoded colors)
- ❌ QuoteDataDisplay component: 47 hardcoded colors found
- ❌ InstallerSelectorModal component: Not checked yet
- ❌ AssignmentHistoryTable component: Not checked yet

**Migration is INCOMPLETE.** Child components must be migrated before marking this task complete."
```

**New Rule:**
> **Never report "complete" unless ALL files in the component tree are verified clean. Be explicit about what's done and what's remaining.**

---

### PAIN POINT #4: Tool Selection Mistakes

**What Happened:**
- Tried `apply_patch` tool 3+ times, all failed due to context matching
- Kept retrying same approach instead of switching to `replace_string_in_file`
- Wasted time and frustrated user

**Tool Selection Guide:**

```
Need to change 1-3 specific lines with known exact context?
├─ YES → Use replace_string_in_file (include 3-5 lines context before/after)
└─ NO → Continue

Need to change 10+ lines or restructure code?
├─ YES → Use apply_patch
└─ NO → Use replace_string_in_file

Tool failed twice with same approach?
├─ YES → STOP, analyze root cause, switch tool or approach
└─ NO → Check context accuracy, try once more
```

**New Rule:**
> **If a tool fails twice, stop and switch tools or approach. Don't repeat the same failure.**

---

## 🚨 CRITICAL: LESSONS FROM HOMEOWNER DASHBOARD MIGRATION (Nov 4, 2025)

### What Went Wrong (Never Repeat These Mistakes):

1. **❌ Missing CSS Variables** - Status colors (`--color-error`, `--color-success`, `--color-warning`, `--color-info`) were NOT defined in `globals.css`, causing theme inconsistencies
   - **Fix Applied**: Added to all 3 themes (dark, light, purple)
   - **Prevention**: Run CSS variable audit BEFORE starting ANY migration

2. **❌ Incomplete Hardcoded Color Search** - Found `text-gray-800`/`text-white` on first check, then found `rgba()` values later
   - **Fix Applied**: Comprehensive regex search for ALL color patterns
   - **Prevention**: Use the complete verification command set (see below)

3. **❌ Wrong Semantic Token Usage** - Used `bg-surface` for sidebar/header instead of `bg-background`
   - **Fix Applied**: Structural elements (body, sidebar, header) use `bg-background`; cards/modals use `bg-surface`
   - **Prevention**: Follow the Background Color Decision Tree (see below)

4. **❌ No Pre-Migration Checklist** - Started migrating without verifying system health
   - **Fix Applied**: Mandatory GATE 0 health check before ANY migration
   - **Prevention**: NEVER skip GATE 0 checks

### MANDATORY: Complete Hardcoded Color Verification (Use This Every Time)

**STEP 1: Identify Component Tree (BEFORE Migration)**

```powershell
# Find ALL components imported by the page
Select-String -Path "src\app\your-page\page.tsx" -Pattern "import.*from.*components"

# Example output:
# import QuoteDataDisplay from '@/components/admin/QuoteDataDisplay'
# import InstallerSelectorModal from '@/components/admin/InstallerSelectorModal'
# import AssignmentHistoryTable from '@/components/admin/AssignmentHistoryTable'

# Create a list of ALL files to verify:
# - src/app/your-page/page.tsx (main file)
# - src/components/admin/QuoteDataDisplay.tsx (child 1)
# - src/components/admin/InstallerSelectorModal.tsx (child 2)
# - src/components/admin/AssignmentHistoryTable.tsx (child 3)
```

**STEP 2: Run ALL 6 Verification Commands on EACH File**

```powershell
# FOR EACH FILE in component tree, run ALL 6 commands:

# Command 1: Hardcoded gray/slate/zinc colors
Select-String -Path "src\app\your-component\*.tsx" -Pattern "text-gray-|text-slate-|text-zinc-|bg-gray-|bg-slate-|bg-zinc-|border-gray-|border-slate-"

# Command 2: ALL dark: prefixes (including semantic colors like dark:text-green-400)
Select-String -Path "src\app\your-component\*.tsx" -Pattern "dark:text-|dark:bg-|dark:border-"

# Command 3: Hardcoded RGB/RGBA/HEX colors (excluding SVG viewBox/fill)
Select-String -Path "src\app\your-component\*.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" | Where-Object { $_.Line -notmatch "viewBox|fill=|d=" }

# Command 4: Hardcoded white/black
Select-String -Path "src\app\your-component\*.tsx" -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b|border-white\b"

# Command 5: Hardcoded semantic color names
Select-String -Path "src\app\your-component\*.tsx" -Pattern "bg-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]|text-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]|border-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]"

# Command 6: Hardcoded typography (should use semantic typography tokens)
Select-String -Path "src\app\your-component\*.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|text-2xl|text-3xl|font-bold|font-semibold|font-medium"

# Expected result for ALL: 0 matches (or NO OUTPUT) for EVERY FILE
```

**STEP 3: Report Completion Status Honestly**

```markdown
# ✅ CORRECT: Detailed Status Report
Migration Verification Results:
- Main File (page.tsx): 0/0/0/0/0/0 ✅ CLEAN
- QuoteDataDisplay: 0/0/0/0/0/0 ✅ CLEAN
- InstallerSelectorModal: 0/0/0/0/0/0 ✅ CLEAN
- AssignmentHistoryTable: 0/0/0/0/0/0 ✅ CLEAN

**Migration Status: COMPLETE** ✅

# ❌ WRONG: Premature Completion
"Migration complete! All colors removed."
(Without checking child components)
```

### MANDATORY: Background Color Decision Tree (Updated Nov 5, 2025)

**Question: What element am I styling?**

```
Is it a STRUCTURAL element (body, main container, sidebar, header)?
├─ YES → Use bg-background (#121212 dark, #E0E5EC light, #2C1D4D purple)
└─ NO → Continue

Is it an ELEVATED element (card, modal, input, button)?
├─ YES → Use bg-surface (#1A1A1A dark, #E8EDF4 light, #3E296C purple)
│         Add shadow-neu-outset for neumorphic effect
└─ NO → Use bg-background or bg-transparent

Is it a HOVER state?
├─ YES → Use hover:bg-surface-hover or hover:shadow-neu-outset-lg
└─ NO → Done
```

**⚠️ CRITICAL: Available Semantic Tokens (NO OTHER OPTIONS)**

```tsx
// ✅ ONLY THESE EXIST IN THE SYSTEM:
bg-background      // Structural elements (body, sidebar, header)
bg-surface         // Elevated elements (cards, modals, inputs)
bg-primary         // Primary button background
bg-muted           // Muted backgrounds
bg-accent          // Accent backgrounds
bg-destructive     // Destructive action backgrounds

// Status colors (for alerts, badges, etc.)
bg-success         // Success states
bg-error           // Error states
bg-warning         // Warning states
bg-info            // Info states

// Text colors
text-foreground    // Primary text
text-muted-foreground  // Secondary/muted text
text-subtle        // Tertiary/subtle text
text-primary       // Primary brand text
text-success       // Success text
text-error         // Error text
text-warning       // Warning text
text-info          // Info text

// Border colors
border-border      // Default border
border-primary     // Primary borders
border-success     // Success borders
border-error       // Error borders
border-warning     // Warning borders
border-info        // Info borders

// ❌ THESE DO NOT EXIST - DO NOT USE:
bg-card            // WRONG! Use bg-surface instead
bg-elevated        // WRONG! Use bg-surface instead
bg-modal           // WRONG! Use bg-surface instead
text-default       // WRONG! Use text-foreground instead
border-default     // WRONG! Use border-border instead
```

**Examples:**
- ✅ `<body>` → `bg-background` (in globals.css)
- ✅ `<main className="bg-background">` → Structural
- ✅ `<aside className="bg-background">` → Sidebar (structural)
- ✅ `<header className="bg-background">` → Header (structural)
- ✅ `<div className="bg-surface shadow-neu-outset rounded-lg">` → Card (elevated)
- ✅ `<input className="bg-surface border-border">` → Input (elevated)
- ✅ `<Button>` → Uses bg-surface internally (elevated)
- ✅ `<div className="bg-surface shadow-neu-outset">` → Modal content
- ✅ `<span className="bg-success text-success-foreground">` → Success badge

**Common Mistakes:**
- ❌ `<aside className="bg-surface">` → Wrong! Use bg-background
- ❌ `<header className="bg-surface">` → Wrong! Use bg-background
- ❌ `<div className="bg-background rounded-card">` → Wrong! Cards use bg-surface
- ❌ `<div className="bg-card">` → Wrong! bg-card doesn't exist, use bg-surface
- ❌ `<div className="bg-elevated">` → Wrong! bg-elevated doesn't exist, use bg-surface
- ❌ `<div className="bg-surface">` without shadow → Missing neumorphic effect! Add shadow-neu-outset

---

## 📐 ADMIN DASHBOARD LAYOUT STANDARD (Added Nov 6, 2025)

**Reference Audit**: See `DOC/ADMIN-LAYOUT-AUDIT.md` for complete analysis

### APPROVED STANDARD: Full-Width Layout with Responsive Padding

**Problem Identified**: Instant Quotes page uses centered container (`max-w-7xl mx-auto`) while all other admin pages use consistent full-width layout, causing visual inconsistency.

**Approved Pattern** (Use this for ALL admin pages):

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

### Key Principles:

1. **✅ Full-Width Layout**: NO `max-w-*` or `mx-auto` on page level
   - Reason: Data tables need full screen width on large monitors (1920px+)
   - Tables/components can set their own max-widths internally if needed

2. **✅ Responsive Padding**: `p-4 sm:p-6 lg:p-8` (consistent breakpoints)
   - Mobile (< 640px): 16px padding (`p-4`)
   - Tablet (640px - 1024px): 24px padding (`sm:p-6`)
   - Desktop (≥ 1024px): 32px padding (`lg:p-8`)

3. **✅ Component Extraction**: Page file should be <30 lines
   - ALL state management, filtering, pagination → in component
   - Page file is simple wrapper only

4. **✅ Theme Inheritance**: NO redundant classes on page
   - ❌ WRONG: `min-h-screen bg-background text-foreground` (inherited from admin layout.tsx)
   - ✅ CORRECT: Only `p-4 sm:p-6 lg:p-8`

5. **✅ Consistency**: Every admin page should be structurally identical
   - User navigates between pages without layout shifts
   - Predictable, professional experience

### Reference Implementation (Gold Standard):

**File**: `src/app/admin/installers/page.tsx`

```tsx
'use client';

/**
 * Admin Installers Page
 * Phase 7.5.13 - T342
 * 
 * Main page for managing installer verification and profiles.
 * Integrates all installer management components.
 */

import React from 'react';
import InstallersTable from '@/components/admin/InstallersTable';

export default function AdminInstallersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <InstallersTable />
    </div>
  );
}
```

**Why This Is Perfect**:
- ✅ 20 lines total (simple, maintainable)
- ✅ Single responsibility (page wrapper only)
- ✅ Full-width layout with responsive padding
- ✅ Component handles all complexity
- ✅ Matches all other admin pages
- ✅ No redundant classes

### Current Status (6 Admin Pages):

| Page | Structure | Status | Action Required |
|------|-----------|--------|-----------------|
| Installers | Simple wrapper + `p-4 sm:p-6 lg:p-8` | ✅ **APPROVED STANDARD** | None - use as reference |
| Newsletter | Same as Installers | ✅ Consistent | None |
| Homeowners | Same as Installers | ✅ Consistent | None |
| Leads | Full-width but uses `md:p-8` | ⚠️ Minor cleanup needed | Change `md:p-8` → `lg:p-8`, remove redundant classes |
| Dashboard | Placeholder | ⚠️ Needs implementation | Use approved standard when building |
| **Instant Quotes** | **Centered container + max-w-7xl** | ❌ **NON-STANDARD** | **REQUIRED: Remove max-w-7xl, extract to component** |

### Migration Checklist (Use for Every Admin Page):

When migrating any admin page, verify:

- [ ] Page file uses `className="p-4 sm:p-6 lg:p-8"` (exact spacing)
- [ ] NO `max-w-*` or `mx-auto` on page-level wrapper
- [ ] NO `min-h-screen bg-background text-foreground` (inherited from layout)
- [ ] Page file imports single table/list component
- [ ] Page file is <30 lines (all logic in component)
- [ ] Component handles all state, filtering, pagination internally
- [ ] Layout matches Installers/Newsletter/Homeowners reference pages

### Verification Command:

```powershell
# Check all admin pages for non-standard patterns
Select-String -Path "src\app\admin\*\page.tsx" -Pattern "max-w-|mx-auto" -Exclude "*layout.tsx"
# Expected: 1 match (instant-quotes) before fix, 0 matches after fix

# Verify padding consistency
Select-String -Path "src\app\admin\*\page.tsx" -Pattern 'className="p-4 sm:p-6 lg:p-8"'
# Expected: 5 matches (all pages except instant-quotes/dashboard)
```

### Common Mistakes to Avoid:

❌ **WRONG - Centered Container**:
```tsx
<div className="p-4 sm:p-6 lg:p-8">
  <div className="max-w-7xl mx-auto">  {/* ❌ Inconsistent with other pages */}
    <YourTableComponent />
  </div>
</div>
```

❌ **WRONG - Redundant Classes**:
```tsx
<div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">  {/* ❌ Inherited from layout, wrong breakpoint */}
  <YourTableComponent />
</div>
```

❌ **WRONG - Embedded UI Logic**:
```tsx
export default function AdminPage() {
  const [data, setData] = useState([]);  {/* ❌ Should be in component */}
  // ...1000+ lines of logic...
  return <div>...</div>;
}
```

✅ **CORRECT - Approved Standard**:
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

---

## 🎯 MIGRATION STATUS (Updated: November 3, 2025)

### ✅ Completed Components (8 total)
These components are FULLY MIGRATED and serve as **reference examples** for future migrations:

**Navigation Layer:**
- ✅ `TopBar.tsx` - Neumorphic top navigation bar
- ✅ `HeaderMenu.tsx` - Main header with ThemeSwitcher, rounded neumorphic bar

**Installer Authentication Flow:**
- ✅ `InstallerEligibilityModal.tsx` - Modal with Button component
- ✅ `InstallerSignupModal.tsx` - Multi-step form with .form-input class
- ✅ `InstallerSignInModal.tsx` - Auth modal with social login

**Homeowner Authentication Flow:**
- ✅ `HomeownerSignupModal.tsx` - Multi-field signup form with .form-input
- ✅ `HomeownerSignInModal.tsx` - Auth modal with password toggle

**Hero Section:**
- ✅ `Hero.tsx` - Hero section with responsive typography, animations

### 🔄 In Progress (2 components - Phase 4)
- 🔄 `NewQuoteRequestModal.tsx` - Dashboard quote request modal
- 🔄 `MessagingModal.tsx` - Dashboard messaging feature

### 📚 Use These as Reference for Next Migrations
When migrating new components, **ALWAYS** open and study these examples:
1. **HeaderMenu.tsx** - Button component usage, ThemeSwitcher integration
2. **InstallerSignupModal.tsx** - .form-input class usage, multi-step forms
3. **HomeownerSignInModal.tsx** - Complete auth modal pattern with social login
4. **Hero.tsx** - Responsive typography, animation preservation

---

## �️ MIGRATION DECISION FLOWCHART (Added Nov 3, 2025)

**Use this to determine how to migrate YOUR component**

### START: I need to migrate a component

#### STEP 1: Run Gate 0 Health Check
**MANDATORY:** Run all health checks in `tasks.md` GATE 0 section
- [ ] CSS Variables Foundation (color-background, color-surface, color-foreground defined in globals.css)
- [ ] Semantic Classes Catalog (file created with form-input, form-select patterns)
- [ ] Reference Components Available (check migrated components list)
- [ ] Chart Hook Uses CSS Variables (if component has charts - useChartColors hook exists)
- [ ] Input Classes Properly Separated (no form-select class on text inputs)
- [ ] Neumorphic Shadows Available (shadow-neu-outset, shadow-neu-inset defined in globals.css)

**❌ IF ANY FAILS:** STOP migration, fix system issue, re-run checks

**✅ ALL PASS:** Continue to Step 2

---

#### STEP 2: What type of component is this?

##### Option A: Form Component (inputs, buttons, labels)
**Characteristics:** Sign up/sign in forms, contact forms, settings forms  
**Use Pattern:** Form Migration Pattern  
**Reference:** `InstallerSignupModal.tsx`, `HomeownerSignInModal.tsx`  
**Classes:** `.form-input`, `.form-select`, `<Button>` component  
**[Jump to Form Migration Guide](#type-1-form-components)**

---

##### Option B: Chart/Graph Component (data visualization)
**Characteristics:** Uses Recharts, shows graphs, dynamic data colors  
**Use Pattern:** Chart Migration Pattern  
**Reference:** `SavingsChart.tsx`  
**Hook:** `useChartColors()` - MUST read CSS variables  
**[Jump to Chart Migration Guide](#type-2-data-visualization-components-charts)**

---

##### Option C: Result/Data Card (metrics, summaries)
**Characteristics:** Display calculated results, system specs, cost breakdowns  
**Use Pattern:** Card Migration Pattern  
**Classes:** `.detail-card`, `.cost-item`, `.performance-item`, `.metric-card`  
**[Jump to Card Migration Guide](#type-3-resultdata-display-cards)**

---

##### Option D: Modal/Dialog (overlays)
**Characteristics:** Pop-up windows, confirmation dialogs, auth modals  
**Use Pattern:** Modal Migration Pattern  
**Reference:** `HomeownerSignInModal.tsx`, `InstallerEligibilityModal.tsx`  
**Container Pattern:** `className="bg-surface shadow-neu-outset rounded-lg p-8"` (elevated neumorphic surface)  
**[Jump to Modal Migration Guide](#migration-principles)**

---

##### Option E: Navigation/Header (topbar, sidebar, menu)
**Characteristics:** Navigation bars, sidebars, menu components  
**Use Pattern:** Nav Migration Pattern  
**Reference:** `TopBar.tsx`, `HeaderMenu.tsx`  
**Classes:** Custom nav classes, `<Button>` for nav buttons  

---

##### Option F: Mixed Component (multiple types)
**Characteristics:** Has forms AND charts AND cards  
**Example:** `InstantQuoteForm` (forms + charts + result cards)  
**Strategy:** Break into sub-components, migrate each using appropriate pattern  
**Migration Order:**
1. Container/layout (page wrapper)
2. Form elements (inputs, buttons)
3. Charts (if any)
4. Result cards (if any)

**[Jump to Mixed Component Strategy](#type-4-mixed-components-advanced)**

---

#### STEP 3: Does it have sub-components?

##### YES - Complex Component
**Examples:** InstantQuoteForm (forms + charts + cards), Dashboard pages  
**Strategy:**
1. List all sub-component types (forms, charts, cards, etc.)
2. Find reference component for EACH type
3. Open Semantic Classes Registry for available classes
4. Migrate in order: Container → Forms → Charts → Cards

**Checklist:**
- [ ] Identified all sub-component types
- [ ] Found reference for each type
- [ ] Opened semantic classes registry
- [ ] Planned migration order

---

##### NO - Simple Component
**Examples:** Button-only component, Single input field, Icon component  
**Strategy:**
1. Identify single pattern to apply
2. Find one reference component
3. Apply pattern directly

---

#### STEP 4: Pre-Migration Prep (Before Touching Code) - UPDATED Nov 5, 2025

**STEP 4A: Map Component Dependency Tree (MANDATORY)**

```powershell
# 1. Find ALL components imported by the page/component
Select-String -Path "src\app\your-page\page.tsx" -Pattern "import.*from.*components" | Select-Object -Property Line

# Example output:
# import QuoteDataDisplay from '@/components/admin/QuoteDataDisplay'
# import InstallerSelectorModal from '@/components/admin/InstallerSelectorModal'

# 2. Create component tree file (for tracking)
@"
Migration Component Tree: Admin Lead Details Page

Main File:
- src/app/admin/leads/[id]/page.tsx

Child Components (MUST ALL BE MIGRATED):
- src/components/admin/QuoteDataDisplay.tsx
- src/components/admin/InstallerSelectorModal.tsx
- src/components/admin/AssignmentHistoryTable.tsx

Status:
- [ ] Main file migrated
- [ ] QuoteDataDisplay migrated
- [ ] InstallerSelectorModal migrated
- [ ] AssignmentHistoryTable migrated

Migration is COMPLETE only when ALL checkboxes are checked.
"@ | Out-File -FilePath "migration-tree.txt"

# 3. For EACH child component, check if it imports MORE components (recursive)
Select-String -Path "src\components\admin\QuoteDataDisplay.tsx" -Pattern "import.*from.*components"
# If it does, add those to the tree as well
```

**STEP 4B: Quick Pre-Check (Identify Problem Areas)**

```powershell
# Run quick check on ALL files in the tree
# This tells you which files NEED migration vs which are already clean

$files = @(
    "src\app\admin\leads\[id]\page.tsx",
    "src\components\admin\QuoteDataDisplay.tsx",
    "src\components\admin\InstallerSelectorModal.tsx",
    "src\components\admin\AssignmentHistoryTable.tsx"
)

foreach ($file in $files) {
    Write-Host "`n=== Checking $file ===" -ForegroundColor Cyan
    
    $hardcodedColors = (Select-String -Path $file -Pattern "bg-white|bg-gray-|dark:" -ErrorAction SilentlyContinue | Measure-Object).Count
    
    if ($hardcodedColors -gt 0) {
        Write-Host "❌ NEEDS MIGRATION: $hardcodedColors hardcoded colors found" -ForegroundColor Red
    } else {
        Write-Host "✅ CLEAN: No hardcoded colors" -ForegroundColor Green
    }
}

# Output tells you EXACTLY which files need work
```

**STEP 4C: Open Reference Files**

1. ✅ `DOC/SEMANTIC-CLASSES-REGISTRY.md` - All available classes
2. ✅ Reference component(s) for your type
3. ✅ `tasks.md` verification commands for this phase
4. ✅ `DESIGN-SYSTEM-SOT.md` (this file) - Component type section
5. ✅ `migration-tree.txt` (created in Step 4A) - Track progress

**STEP 4D: Document Current State**

```powershell
# Count elements BEFORE migration
Select-String -Path "src\components\YourComponent.tsx" -Pattern "<button" | Measure-Object
Select-String -Path "src\components\YourComponent.tsx" -Pattern "<input" | Measure-Object
Select-String -Path "src\components\YourComponent.tsx" -Pattern "<select" | Measure-Object
# Write down counts - must be 0 after migration
```

---

#### STEP 5: During Migration (Element-by-Element)

**For EACH element in your component, apply decision:**

```
Element is <button>?
├─ YES → Replace with <Button> component from ui/button.tsx
└─ NO → Continue to next check

Element is <input type="text/number/email">?
├─ YES → Add className="form-input w-full px-4 py-3"
└─ NO → Continue to next check

Element is <select>?
├─ YES → Add className="form-select w-full px-4 py-3"
└─ NO → Continue to next check

Element is a chart (Bar, Line, Area, etc.)?
├─ YES → Use useChartColors() hook, replace hardcoded colors
└─ NO → Continue to next check

Element has hardcoded color class (bg-gray-*, text-slate-*)?
├─ YES → Replace with semantic token (bg-surface, text-foreground)
└─ NO → Element is OK, move to next

Element is a container (modal, card, panel)?
├─ Modal → Use `bg-surface shadow-neu-outset rounded-lg p-8` (elevated neumorphic)
├─ Data Card → Use `bg-surface shadow-neu-outset rounded-lg p-6` (elevated neumorphic)
├─ Metric Card → Use `.metric-card` class (if defined) or `bg-surface shadow-neu-outset`
└─ Simple div → Use `bg-surface rounded-lg` (elevated without shadow if non-interactive)

Element is text/label/value?
├─ Cost Label → Use .cost-item-label
├─ Cost Value → Use .cost-item-value
├─ Metric Label → Use .metric-card-label
├─ Metric Value → Use .metric-card-value
└─ Generic → Use text-foreground or text-subtle
```

---

#### STEP 6: Post-Migration Verification (MANDATORY) - UPDATED Nov 5, 2025

**CRITICAL: Run ALL 6 Commands on ALL Files in Component Tree**

Never report "migration complete" without verifying EVERY file in the component tree. A page is NOT complete if any child component has hardcoded colors.

**The 6 Comprehensive Verification Commands:**

```powershell
# Define ALL files in component tree (example):
$files = @(
    "src\app\admin\leads\[id]\page.tsx",              # Main file
    "src\components\admin\QuoteDataDisplay.tsx",       # Child 1
    "src\components\admin\InstallerSelectorModal.tsx", # Child 2
    "src\components\admin\AssignmentHistoryTable.tsx"  # Child 3
)

# FOR EACH FILE, run ALL 6 verification commands:
foreach ($file in $files) {
    Write-Host "`n=== Verifying $file ===" -ForegroundColor Cyan
    
    # Command 1: Hardcoded gray/slate/zinc colors
    $cmd1 = (Select-String -Path $file -Pattern "text-gray-|text-slate-|text-zinc-|bg-gray-|bg-slate-|bg-zinc-|border-gray-|border-slate-" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "1. Gray/slate colors: $cmd1 matches" -ForegroundColor $(if ($cmd1 -eq 0) { "Green" } else { "Red" })
    
    # Command 2: ALL dark: prefixes (this catches dark:text-green-400 patterns)
    $cmd2 = (Select-String -Path $file -Pattern "dark:" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "2. Dark mode classes: $cmd2 matches" -ForegroundColor $(if ($cmd2 -eq 0) { "Green" } else { "Red" })
    
    # Command 3: RGB/RGBA/HEX colors (excluding SVG attributes)
    $cmd3 = (Select-String -Path $file -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" -ErrorAction SilentlyContinue | Where-Object { $_.Line -notmatch "viewBox|fill=|d=" } | Measure-Object).Count
    Write-Host "3. RGB/HEX colors: $cmd3 matches" -ForegroundColor $(if ($cmd3 -eq 0) { "Green" } else { "Red" })
    
    # Command 4: Hardcoded white/black
    $cmd4 = (Select-String -Path $file -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b|border-white\b" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "4. White/black: $cmd4 matches" -ForegroundColor $(if ($cmd4 -eq 0) { "Green" } else { "Red" })
    
    # Command 5: Hardcoded typography sizes
    $cmd5 = (Select-String -Path $file -Pattern "text-xs|text-sm|text-lg|text-xl|text-2xl|text-3xl|font-bold|font-semibold|font-medium" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "5. Typography sizes: $cmd5 matches" -ForegroundColor $(if ($cmd5 -eq 0) { "Green" } else { "Red" })
    
    # Command 6: Manual responsive classes
    $cmd6 = (Select-String -Path $file -Pattern "sm:text-|md:text-|lg:text-|xl:text-" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "6. Manual responsive: $cmd6 matches" -ForegroundColor $(if ($cmd6 -eq 0) { "Green" } else { "Red" })
    
    # Summary for this file
    $total = $cmd1 + $cmd2 + $cmd3 + $cmd4 + $cmd5 + $cmd6
    if ($total -eq 0) {
        Write-Host "✅ CLEAN: $file (0/0/0/0/0/0)" -ForegroundColor Green
    } else {
        Write-Host "❌ INCOMPLETE: $file has $total violations ($cmd1/$cmd2/$cmd3/$cmd4/$cmd5/$cmd6)" -ForegroundColor Red
    }
}
```

**EXPECTED RESULT:** ALL files show `✅ CLEAN: 0/0/0/0/0/0`  
**If ANY file shows violations, the migration is INCOMPLETE.**

**Component-Specific Checks:**

```powershell
# For form components: No form-select on text inputs
Select-String -Path "src\components\YourForm.tsx" -Pattern '<input.*form-select'
# Expected: 0 matches

# For chart components: Must use useChartColors hook
Select-String -Path "src\components\YourChart.tsx" -Pattern "useChartColors"
# Expected: 1+ matches

# For button-heavy components: All buttons replaced
Select-String -Path "src\components\YourComponent.tsx" -Pattern "<button"
# Expected: 0 matches (all should be <Button>)
```

**Visual Tests (MANDATORY for ALL components):**
1. Open in browser
2. Test Dark theme → Screenshot → Check for white/gray bleed
3. Switch to Light theme → Screenshot → Check neumorphic shadows
4. Switch to Purple theme → Screenshot → Check purple accent
5. Verify:
   - [ ] No hardcoded colors visible in ANY theme
   - [ ] All text readable (good contrast in all themes)
   - [ ] Neumorphic shadows visible (cards, modals, inputs)
   - [ ] No white/black bleed-through
   - [ ] No flash of wrong colors when switching themes

**Runtime Tests:**
1. Open browser console (F12)
2. Interact with ALL features (forms, buttons, modals)
3. Switch themes while component is actively open
4. Expected: 0 errors in console
5. Check for CSS variable warnings

**Honest Reporting Template (MANDATORY Format):**

```markdown
### Migration Verification Report: [Component/Page Name]

**Component Tree Identified:**
- Main file: src/app/[path]/page.tsx
- Child 1: src/components/[name].tsx
- Child 2: src/components/[name].tsx
- Child 3: src/components/[name].tsx

**Verification Results:**
- Main file: 0/0/0/0/0/0 ✅ CLEAN
- Child 1: 0/0/0/0/0/0 ✅ CLEAN
- Child 2: 15/47/0/8/0/0 ❌ INCOMPLETE (70 total violations)
- Child 3: 0/0/0/0/0/0 ✅ CLEAN

**Visual Testing:**
- Dark theme: ❌ White cards visible in Child 2
- Light theme: ❌ Not tested (Child 2 incomplete)
- Purple theme: ❌ Not tested (Child 2 incomplete)

**Runtime Testing:**
- Console errors: N/A (incomplete migration)
- Theme switching: N/A (incomplete migration)

**Migration Status: INCOMPLETE** ❌

**Reason:** Child 2 (ComponentName.tsx) has 70 hardcoded color violations. Main file being clean does NOT mean page is complete.

**Next Steps:**
1. Migrate Child 2 using semantic tokens
2. Re-run 6-command verification on Child 2
3. When Child 2 shows 0/0/0/0/0/0, proceed to visual testing
4. Only after ALL files pass + visual tests pass → Mark complete
```

**NEVER use these false reporting patterns:**
- ❌ "Migration complete" (without listing each file's verification status)
- ❌ "All components migrated" (without showing 0/0/0/0/0/0 for each)
- ❌ "Page is done" (without checking child components)
- ❌ Reporting main file status only (must check ALL imports)

---

#### STEP 7: Mark Complete & Move On

**Only when ALL checks pass:**
- [ ] Verification commands returned expected results
- [ ] Visual tests passed in all 3 themes
- [ ] No runtime errors in console
- [ ] Code is clean (no commented code, TODOs removed)

**Then:**
1. Update migration progress in tasks.md
2. Commit with atomic message: "Migrate [ComponentName] to neumorphic design"
3. Move to next component

---

## 📦 COMPONENT TYPE TAXONOMY (Detailed Patterns)

### Type 1: Form Components

**Characteristics:** Input fields, dropdowns, checkboxes, buttons  
**Examples:** InstallerSignupModal, HomeownerSignInModal, ProfileManagement  

**Migration Pattern:**
- All `<button>` → `<Button>` component
- All `<input type="text/number/email">` → `.form-input` class
- All `<select>` → `.form-select` class
- Labels use `text-subtle` or `text-foreground-muted`
- Error messages use `text-destructive`

**Reference Components:**
- ✅ `InstallerSignupModal.tsx` - Multi-step form with validation
- ✅ `HomeownerSignInModal.tsx` - Auth form with social login

**Code Example:**
```tsx
// ❌ BEFORE
<div className="mb-4">
  <label className="block text-gray-700 dark:text-gray-300 mb-2">
    Email
  </label>
  <input 
    type="email"
    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
  />
</div>

// ✅ AFTER
<div className="mb-4">
  <label className="block text-subtle mb-2">
    Email
  </label>
  <input 
    type="email"
    className="form-input w-full px-4 py-3"
  />
</div>
```

**Verification:**
```powershell
# No hardcoded grays
Select-String -Path "src\components\YourForm.tsx" -Pattern "bg-gray|text-gray"
# Expected: 0 matches

# All buttons are Button component
Select-String -Path "src\components\YourForm.tsx" -Pattern "<button"
# Expected: 0 matches
```

---

### Type 2: Data Visualization Components (Charts)

**Characteristics:** Uses Recharts, graphs, dynamic data colors  
**Examples:** SavingsChart, FinancialProjections, PerformanceGraph  

**Migration Pattern:**
- Chart colors MUST use `useChartColors()` hook
- Hook MUST read from CSS variables (not design tokens)
- NO hardcoded hex colors (`fill="#FF6B00"`)
- Chart background uses `bg-surface`
- Grid/axis use colors from hook (grid, axis, text)

**Critical Rules:**
1. ❌ NEVER `import { colors } from '@/design-tokens'`
2. ❌ NEVER hardcode colors: `fill="#FF6B00"`
3. ✅ ALWAYS use hook: `const chartColors = useChartColors(); fill={chartColors.primary}`
4. ✅ ALWAYS test in all 3 themes (color MUST change)

**Reference Component:**
- ✅ `SavingsChart.tsx` - Complete chart implementation

**Code Example:**
```tsx
// ❌ BEFORE - Hardcoded orange
import { colors } from '@/design-tokens';
<Bar dataKey="Annual Cost" fill="#FF6B00" />
<CartesianGrid stroke="#e5e7eb" />

// ✅ AFTER - Theme-adaptive
import { useChartColors } from '@/hooks/useChartColors';

const MyChart = () => {
  const chartColors = useChartColors();
  
  return (
    <BarChart>
      <Bar dataKey="Annual Cost" fill={chartColors.primary} />
      <CartesianGrid stroke={chartColors.grid} />
      <XAxis tick={{ fill: chartColors.text }} />
    </BarChart>
  );
};
```

**Verification:**
```powershell
# No hardcoded hex colors
Select-String -Path "src\components\YourChart.tsx" -Pattern "fill=['\"]#|stroke=['\"]#"
# Expected: 0 matches (except in gradient IDs)

# Uses useChartColors hook
Select-String -Path "src\components\YourChart.tsx" -Pattern "useChartColors"
# Expected: At least 2 matches (import + usage)

# Hook reads CSS variables (not design tokens)
Select-String -Path "src\hooks\useChartColors.ts" -Pattern "getComputedStyle"
# Expected: At least 1 match
```

---

### Type 3: Result/Data Display Cards

**Characteristics:** Display calculated data, metrics, summaries  
**Examples:** Cost Breakdown, System Specifications, Financial Projections summary  

**Migration Pattern:**
- Container uses `.detail-card` (has neumorphic shadow)
- Headers use `.detail-card-header`
- Values use type-specific classes:
  - Cost data: `.cost-item-label` + `.cost-item-value`
  - Performance: `.performance-item-label` + `.performance-item-value`
  - Specs: `.spec-card-label` + `.spec-card-value`
  - Metrics: `.metric-card-label` + `.metric-card-value`

**Neumorphic Enhancement Checklist:**
- [ ] Card has `box-shadow: var(--shadow-outset-md)` or stronger
- [ ] Hover state uses `var(--shadow-outset-lg)`
- [ ] Background is `rgb(var(--color-surface))`
- [ ] Border uses `rgb(var(--color-border))`
- [ ] NO `bg-gray-*` or `text-gray-*` classes

**Code Example:**
```tsx
// ❌ BEFORE
<div className="bg-gray-800 rounded-lg p-6">
  <h3 className="text-xl font-bold text-gray-100 mb-4">Cost Breakdown</h3>
  <div className="flex justify-between">
    <span className="text-gray-400">System Cost</span>
    <span className="text-gray-100 font-bold">{formatCurrency(cost)}</span>
  </div>
</div>

// ✅ AFTER
<div className="detail-card">
  <h3 className="detail-card-header">Cost Breakdown</h3>
  <div className="cost-item">
    <span className="cost-item-label">System Cost</span>
    <span className="cost-item-value">{formatCurrency(cost)}</span>
  </div>
</div>
```

**Verification:**
```powershell
# No hardcoded grays
Select-String -Path "src\components\YourCard.tsx" -Pattern "bg-gray|text-gray|bg-slate|text-slate"
# Expected: 0 matches

# Uses semantic card classes
Select-String -Path "src\components\YourCard.tsx" -Pattern "detail-card|cost-item|spec-card|performance-item|metric-card"
# Expected: 5+ matches
```

---

### Type 4: Mixed Components (Advanced)

**Characteristics:** Complex components with multiple element types  
**Examples:** InstantQuoteForm (forms + charts + cards), Dashboard pages  

**Migration Strategy:**
1. **Identify Sub-Components:** List all types (forms, charts, cards)
2. **Find References:** Get reference component for EACH type
3. **Plan Order:** Container → Forms → Charts → Cards
4. **Migrate Atomically:** Complete entire component in one commit

**Sub-Component Pattern Mapping:**
| Sub-Component Type | Pattern to Use | Reference Component |
|-------------------|----------------|-------------------|
| Form inputs | `.form-input` class | InstallerSignupModal.tsx |
| Charts | `useChartColors()` hook | SavingsChart.tsx |
| Result cards | `bg-surface shadow-neu-outset` | See card examples above |
| Modal container | `bg-surface shadow-neu-outset rounded-lg p-8` | HomeownerSignInModal.tsx |

**Example: InstantQuoteForm Migration Order**
1. ✅ Container (page layout, sections)
2. ✅ Form inputs (postcode, location, budget, etc.)
3. ✅ Chart (SavingsChart component)
4. ✅ Result cards (Cost Breakdown, Specs, Performance)

**Verification (ALL patterns combined):**
```powershell
# Form checks
Select-String -Path "src\components\InstantQuoteForm.tsx" -Pattern '<input.*form-select'
# Expected: 0

# Chart checks
Select-String -Path "src\components\SavingsChart.tsx" -Pattern "fill=['\"]#"
# Expected: 0

# Card checks
Select-String -Path "src\components\InstantQuoteForm.tsx" -Pattern "bg-gray|text-gray"
# Expected: 0
```

---

## �📋 Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Migration Principles](#migration-principles) ⚠️ **READ THIS FIRST**
4. [Color System](#color-system)
5. [Typography System](#typography-system)
6. [Spacing System](#spacing-system)
7. [Shadow System (Neumorphic)](#shadow-system-neumorphic)
8. [Component Classes](#component-classes)
9. [Form Components](#form-components)
10. [Animation System](#animation-system)
11. [Border & Radius](#border--radius)
12. [Complete Migration Checklist](#complete-migration-checklist)
13. [Code Cleanup Standards](#code-cleanup-standards)

---

## 🔥 CRITICAL: NEUMORPHIC DESIGN SYSTEM - CURRENT STANDARDS (Nov 5, 2025)

### Current Design System Overview

**System:** Pure neumorphic design with CSS variables and Tailwind semantic tokens  
**Approach:** No custom CSS classes for containers - use Tailwind + shadow utilities  
**Pattern:** `bg-surface shadow-neu-outset` for ALL elevated elements

**Root Causes of Past Issues:**
1. ❌ **Legacy .theme-card class**: Was hardcoded, caused theme inconsistencies - NOW REMOVED
2. ❌ **Inconsistent Approaches**: Mixed custom classes with inline Tailwind - NOW STANDARDIZED
3. ❌ **Partial Migrations**: Only fixed main file, not child components - NOW USE COMPONENT TREE MAPPING
4. ❌ **Incomplete Verification**: Missed dark: patterns and border colors - NOW USE 6-COMMAND VERIFICATION

**The Current Solution (November 5, 2025):**
1. ✅ **Semantic Tokens Only**: Use `bg-surface`, `text-foreground`, `border-border` (NOT custom classes)
2. ✅ **Neumorphic Shadows**: ALL elevated elements use `shadow-neu-outset` or `shadow-neu-inset`
3. ✅ **Component Tree Verification**: Map ALL child components, verify EACH file with 6 commands
4. ✅ **Multi-Theme Support**: Dark (#121212), Light (#E0E5EC), Purple (#2C1D4D) via CSS variables
5. ✅ **Honest Reporting**: Never claim "complete" without 0/0/0/0/0/0 on ALL files

### The Universal Pattern (Current Standard)

**🔴 SEMANTIC TOKENS + NEUMORPHIC SHADOWS**

```tsx
/* ✅ CORRECT - Elevated Elements (Cards, Modals, Panels) */
<div className="bg-surface shadow-neu-outset rounded-lg p-6">
  {/* Card content */}
</div>

/* ✅ CORRECT - Pressed/Input Elements */
<input className="form-input w-full" />  // .form-input includes shadow-neu-inset

/* ✅ CORRECT - Modal Container */
<div className="bg-surface shadow-neu-outset rounded-lg p-8 max-w-md">
  {/* Modal content */}
</div>

/* ✅ CORRECT - Text Colors */
<h2 className="text-foreground text-xl font-semibold">Title</h2>
<p className="text-muted-foreground">Description</p>

/* ❌ WRONG - Hardcoded Colors (OLD SYSTEM) */
<div className="bg-white dark:bg-gray-800">  // Don't use hardcoded
<div className="text-gray-900 dark:text-white">  // Don't use hardcoded
<div className="theme-card">  // Legacy class - removed from system
<input className="w-full bg-surface border border-border/50 rounded-xl..." />  /* Inline classes */
<input className="bg-surface border-border shadow-neu-inset" />  /* Mixing patterns */
```

**Why Current System Works:**
- ✅ Semantic tokens directly in className (`bg-surface`, `text-foreground`, `border-border`)
- ✅ Neumorphic shadows via utility classes (`shadow-neu-outset`, `shadow-neu-inset`)
- ✅ CSS variables in globals.css define colors per theme
- ✅ All themes inherit automatically via Tailwind config
- ✅ No custom CSS classes needed for containers (except `.form-input`)

**🚨 CURRENT SYSTEM (Nov 5, 2025):**
- ✅ `.form-input` class exists for form elements (includes embossed style)
- ✅ Containers use inline Tailwind: `bg-surface shadow-neu-outset rounded-lg`
- ✅ NO `.theme-card` class (removed from system)
- ✅ ALL elevated elements follow same pattern: `bg-surface + shadow-neu-outset`

### Mandatory Pre-Migration Checklist (Current System - Nov 5, 2025)

Before migrating ANY component:

```powershell
# 1. Check if .form-input class exists in globals.css
Select-String -Path "src\app\globals.css" -Pattern "\.form-input"
# Expected: Class definition with bg-surface and shadow-neu-inset

# 2. Verify all 3 themes have CSS variables defined
Select-String -Path "src\app\globals.css" -Pattern "--color-background:|--color-surface:|--color-foreground:"
# Expected: 3 sets (dark, light, purple themes) - 9+ matches total

# 3. Verify neumorphic shadows defined
Select-String -Path "src\app\globals.css" -Pattern "--shadow-neu-outset|--shadow-neu-inset"
# Expected: Multiple matches for both shadow types

# 4. Check Tailwind config has semantic tokens
Select-String -Path "tailwind.config.js" -Pattern "bg-surface|text-foreground|border-border|shadow-neu"
# Expected: Semantic tokens configured in theme extension
```

**If ANY check fails → Fix system configuration FIRST before migrating components**

### Migration Pattern (Current System - Guaranteed Success)

**Step 1: Map Component Tree**
```powershell
# Find ALL components imported by the file
Select-String -Path "src\app\your-page\page.tsx" -Pattern "import.*from.*components"
# List main file + all child components
```

**Step 2: Use Semantic Tokens + Neumorphic Shadows**
```tsx
// ✅ CORRECT - Modal/Card Containers
<div className="bg-surface shadow-neu-outset rounded-lg p-8 max-w-md">
  {/* Modal content - elevated neumorphic surface */}
</div>

// ✅ CORRECT - Form Inputs
<input 
  className="form-input w-full pl-11 pr-4 py-3" 
  type="text"
/>
{/* .form-input class includes bg-surface + shadow-neu-inset */}

// ✅ CORRECT - Text Elements
<h2 className="text-foreground text-xl font-semibold">Title</h2>
<p className="text-muted-foreground text-sm">Description</p>

// ✅ CORRECT - Buttons
<Button variant="primary" className="px-5 py-2">
  {/* Button component uses bg-surface internally */}
</Button>
```

**Step 3: Test All 3 Themes**
```powershell
# Open browser to component
# Switch themes: Dark → Light → Purple
# Dark: bg-surface = #1A1A1A, text-foreground = #F3F4F6
# Light: bg-surface = #E8EDF4, text-foreground = #1F2937
# Purple: bg-surface = #3E296C, text-foreground = #E9D5FF
# All should show neumorphic shadows (soft, subtle depth)
```

**Step 4: Run 6-Command Verification on ALL Files**
```powershell
# Run on main file AND all child components
Select-String -Path "src\components\YourComponent.tsx" -Pattern "text-gray-|bg-gray-|border-gray-"  # Cmd 1
Select-String -Path "src\components\YourComponent.tsx" -Pattern "dark:"  # Cmd 2
Select-String -Path "src\components\YourComponent.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]"  # Cmd 3
Select-String -Path "src\components\YourComponent.tsx" -Pattern "text-white\b|bg-white\b"  # Cmd 4
Select-String -Path "src\components\YourComponent.tsx" -Pattern "text-xs|text-sm|font-bold"  # Cmd 5
Select-String -Path "src\components\YourComponent.tsx" -Pattern "sm:text-|md:text-"  # Cmd 6
# EXPECTED: 0/0/0/0/0/0 for ALL files
```

### Anti-Patterns to Avoid (Updated Nov 5, 2025)

❌ **DON'T DO THIS:**
```tsx
// ❌ Hardcoded colors with dark mode variants
<div className="bg-white dark:bg-gray-800">
<p className="text-gray-900 dark:text-white">

// ❌ Using bg-background for elevated elements
<div className="bg-background rounded-lg p-6">  {/* Wrong! No elevation */}

// ❌ Missing neumorphic shadows on cards/modals
<div className="bg-surface rounded-lg p-6">  {/* Missing shadow-neu-outset */}

// ❌ Only verifying main file, not child components
"Main file clean (0/0/0/0/0/0) → Migration complete!" // Wrong if children not checked

// ❌ Reporting complete without showing file-by-file results
"Migration done! ✅" // Vague - no proof of verification
```

✅ **DO THIS:**
```tsx
// ✅ Semantic tokens for all colors
<div className="bg-surface shadow-neu-outset rounded-lg p-6">
<p className="text-foreground">

// ✅ bg-background ONLY for structural elements
<body className="bg-background">
<aside className="bg-background">  {/* Sidebar */}

// ✅ ALL elevated elements have neumorphic shadows
<div className="bg-surface shadow-neu-outset rounded-lg p-6">  {/* Card */}
<div className="bg-surface shadow-neu-outset rounded-lg p-8">  {/* Modal */}

// ✅ Verify ALL files in component tree
Main: 0/0/0/0/0/0 ✅
Child1: 0/0/0/0/0/0 ✅
Child2: 0/0/0/0/0/0 ✅
→ NOW report complete

// ✅ Detailed reporting showing each file
"Verification Results:
- page.tsx: 0/0/0/0/0/0 ✅ CLEAN
- QuoteDataDisplay.tsx: 0/0/0/0/0/0 ✅ CLEAN
- InstallerSelector.tsx: 0/0/0/0/0/0 ✅ CLEAN
Status: COMPLETE ✅"
```

---

## 🎯 Overview

### What is This System?

This is a **neumorphic multi-theme design system** built on:
- **Design Tokens**: Semantic variables for colors, typography, spacing, shadows
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe design token interfaces
- **Dark-First**: Constitution VI compliant (dark theme only, light theme future)

### Architecture

```
Design System
├── Primitives (Raw Values)
│   ├── Color Palette (#101010, #1A1A1A, etc.)
│   ├── Font Sizes (12px, 14px, 16px, etc.)
│   └── Spacing Scale (4px, 8px, 12px, etc.)
├── Semantic Tokens (Meaningful Names)
│   ├── Colors (primary, surface, foreground, etc.)
│   ├── Typography (heading-1, body, caption, etc.)
│   └── Spacing (card-padding, section-gap, etc.)
└── Component Classes (Reusable Patterns)
    ├── Buttons (.neu-btn-primary, .neu-btn-secondary)
    ├── Cards (.neu-card, .theme-card)
    └── Forms (.neu-input, .auth-input-icon)
```

---

## 🎨 Design Principles

### 1. **Neumorphism**
- All interactive elements use soft shadows (raised/inset)
- Multi-theme support: Dark (default), Light, Purple
- Shadows create depth perception

### 2. **Design Tokens Only**
- ❌ Never use: `bg-teal-600`, `text-slate-400`, `border-gray-300`, `dark:bg-slate-800`
- ✅ Always use: `bg-primary`, `text-foreground`, `border-border`
- ❌ Never use `dark:` prefixes - tokens handle themes automatically

### 3. **Multi-Theme System**
- 3 themes: Dark (Google AI Studio aligned), Light (neumorphic), Purple (premium)
- All themes use identical CSS variable names
- No theme-specific classes in components
- Theme switching via ThemeProvider context

### 4. **Accessibility**
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly (ARIA labels)

### 5. **Type Safety**
- Full TypeScript interfaces for all tokens
- Compile-time validation of token usage

### 6. **Zero Legacy Code After Migration**
- ⚠️ **CRITICAL**: Remove ALL unused CSS after migration
- Delete deprecated classes, commented code, unused imports
- No Storybook/Chromatic code (we don't use them)
- Clean, production-ready code only

---

## 🚨 MIGRATION PRINCIPLES (READ FIRST)

### ⚠️ THE PROBLEM: Partial Migrations Create Double Work

**Your Pain Points:**
1. ✅ Form migrated → ❌ Buttons still hardcoded
2. ✅ Modal container updated → ❌ Modal header still has `dark:` classes
3. ✅ Component 80% done → ❌ 20% missed = entire QA cycle wasted
4. ✅ Semantic tokens used → ❌ Legacy CSS classes still in file

**Result:** Inconsistency, rework, frustration, wasted time.

---

### ✅ THE SOLUTION: 100% Complete Migration Rules

#### RULE #1: MIGRATE ENTIRE COMPONENT OR NOTHING
- ❌ **NEVER** migrate "just the form" or "just the header"
- ✅ **ALWAYS** migrate the ENTIRE component file in one go
- ✅ Include ALL buttons, inputs, text, borders, backgrounds, shadows

**Example - Button Migration:**
```bash
# WRONG ❌ - Partial migration
grep -c '<button' Component.tsx    # Output: 5 buttons found
# Migrate only 3 buttons, leave 2 for "later"
# RESULT: Inconsistent UI, rework needed

# RIGHT ✅ - Complete migration
grep -c '<button' Component.tsx    # Output: 5 buttons found
# Migrate ALL 5 buttons before marking task complete
# RESULT: Consistent UI, no rework
```

#### RULE #2: NO HARDCODED VALUES AFTER MIGRATION
**Search for these patterns AFTER migration:**
```bash
# All of these should return ZERO results
grep -E 'bg-(slate|gray|zinc|neutral|stone)-[0-9]' src/components/YourComponent.tsx
grep -E 'text-(slate|gray|zinc)-[0-9]' src/components/YourComponent.tsx
grep -E 'border-(slate|gray)-[0-9]' src/components/YourComponent.tsx
grep -E 'dark:' src/components/YourComponent.tsx
grep -E 'bg-teal-[0-9]|bg-blue-[0-9]|bg-red-[0-9]' src/components/YourComponent.tsx
```

**If ANY pattern returns results = MIGRATION NOT COMPLETE**

#### RULE #3: NO DARK: PREFIXES EVER
- ❌ `dark:bg-slate-800`
- ❌ `dark:text-white`
- ❌ `dark:border-gray-700`
- ✅ Use semantic tokens - they handle themes automatically

**Why:** Multi-theme system uses CSS variables, not class switching.

#### RULE #4: CLEAN CODE - ZERO LEGACY
After migration, component should have:
- ✅ No commented-out CSS
- ✅ No unused imports (check with TypeScript)
- ✅ No Storybook/Chromatic references
- ✅ No deprecated classes
- ✅ No "TODO: migrate later" comments

**Before Committing:**
```bash
# Check for legacy code
grep -E '(TODO|FIXME|HACK|XXX)' src/components/YourComponent.tsx
grep -E 'import.*@storybook' src/components/YourComponent.tsx
grep -E 'chromatic' src/components/YourComponent.tsx
```

#### RULE #5: UI CHANGES ONLY - PRESERVE ALL LOGIC
**What You CAN Change:**
- ✅ `className` strings
- ✅ Button wrapper elements (`<button>` → `<Button>`)
- ✅ CSS class names
- ✅ Shadow/color/spacing values

**What You CANNOT Change:**
- ❌ `useState`, `useEffect`, `useMemo` hooks
- ❌ Event handlers (`onClick`, `onSubmit`, `onChange`)
- ❌ API calls, data fetching
- ❌ Form validation logic
- ❌ Conditional rendering logic (`if`, `&&`, `?:`)
- ❌ Props interface/types
- ❌ Component structure/JSX hierarchy

**Example - CORRECT Migration:**
```tsx
// BEFORE (hardcoded)
<button 
  onClick={handleSubmit}              // ← DON'T TOUCH
  disabled={isLoading}                // ← DON'T TOUCH
  className="bg-teal-600 hover:bg-teal-700 px-4 py-2"  // ← CHANGE THIS ONLY
>
  {isLoading ? 'Submitting...' : 'Submit'}  // ← DON'T TOUCH
</button>

// AFTER (semantic tokens)
<Button 
  onClick={handleSubmit}              // ← PRESERVED
  disabled={isLoading}                // ← PRESERVED
  variant="primary"                   // ← CHANGED
  className="px-5 py-2"               // ← CHANGED
>
  {isLoading ? 'Submitting...' : 'Submit'}  // ← PRESERVED
</Button>
```

#### RULE #6: REFERENCE COMPONENTS BEFORE STARTING
**MANDATORY - Open these files FIRST:**
1. `src/components/HeaderMenu.tsx` - Button component usage
2. `src/components/InstallerSignupModal.tsx` - Modal patterns
3. `src/components/HomeownerSignInModal.tsx` - Form patterns
4. `src/app/globals.css` - All available tokens

**Copy exact imports and patterns - DON'T INVENT NEW ONES**

---

### 📋 COMPLETE MIGRATION CHECKLIST

Before marking ANY task complete:

```bash
# 1. Count all interactive elements
grep -c '<button' src/components/Component.tsx
grep -c '<input' src/components/Component.tsx
grep -c '<select' src/components/Component.tsx
grep -c '<textarea' src/components/Component.tsx

# 2. Verify ZERO hardcoded colors
grep -E 'bg-(slate|gray|zinc|neutral|stone|teal|blue|red|green|yellow)-[0-9]' src/components/Component.tsx
# Expected: NO OUTPUT

# 3. Verify ZERO dark: prefixes
grep 'dark:' src/components/Component.tsx
# Expected: NO OUTPUT (or only in comments)

# 4. Verify ZERO legacy code
grep -E '(TODO|FIXME|commented.*code|storybook|chromatic)' src/components/YourComponent.tsx
# Expected: NO OUTPUT

# 5. Verify TypeScript compiles
npx tsc --noEmit --project .
# Expected: 0 errors

# 6. Visual test in ALL 3 themes
# Open component in browser
# Switch theme: Dark → Light → Purple
# Verify: All elements visible, consistent, interactive

# 7. Functional test
# Test ALL buttons, forms, modals, interactions
# Verify: Everything works exactly as before
```

**If ANY check fails = MIGRATION NOT COMPLETE**

---

### 🚫 COMMON MISTAKES TO AVOID

#### Mistake #1: "I'll migrate the buttons later"
```tsx
// ❌ WRONG - Partial migration
<form className="bg-surface shadow-neu-outset rounded-xl p-6">  // ✅ Migrated
  <input className="bg-surface/5 border-border" />               // ✅ Migrated
  <button className="bg-teal-600 hover:bg-teal-700">Submit</button>  // ❌ NOT MIGRATED
</form>
// RESULT: Inconsistent, needs rework
```

```tsx
// ✅ CORRECT - Complete migration
<form className="bg-surface shadow-neu-outset rounded-xl p-6">  // ✅ Migrated
  <input className="bg-surface/5 border-border" />               // ✅ Migrated
  <Button variant="primary" className="px-5 py-2">Submit</Button> // ✅ Migrated
</form>
// RESULT: Consistent, production-ready
```

#### Mistake #2: "I'll remove this legacy code later"
```tsx
// ❌ WRONG - Leaving legacy code
// import { useTheme } from 'next-themes';  // TODO: Remove this
import Button from '@/components/ui/button';

export default function Component() {
  // const { theme } = useTheme();  // Old code - remove later
  return (
    <Button variant="primary">Click</Button>
    {/* <button className="bg-teal-600">Old button</button> */}
  );
}
// RESULT: Messy, confusing, unprofessional
```

```tsx
// ✅ CORRECT - Clean code
import Button from '@/components/ui/button';

export default function Component() {
  return (
    <Button variant="primary">Click</Button>
  );
}
// RESULT: Clean, professional, maintainable
```

#### Mistake #3: "Just using dark: is easier"
```tsx
// ❌ WRONG - Using dark: prefixes
<div className="bg-white dark:bg-slate-900 text-black dark:text-white">
  Content
</div>
// PROBLEM: Doesn't work with multi-theme system (Light/Purple themes broken)
```

```tsx
// ✅ CORRECT - Using semantic tokens
<div className="bg-surface text-foreground">
  Content
</div>
// RESULT: Works with ALL themes automatically
```

#### Mistake #4: "I changed the form logic accidentally"
```tsx
// ❌ WRONG - Changed validation logic
<input
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    // Added this line during migration - WRONG!
    if (e.target.value.includes('@')) setIsValid(true);
  }}
  className="bg-surface/5 border-border"  // Only this should change
/>
```

```tsx
// ✅ CORRECT - Only changed className
<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}  // PRESERVED EXACTLY
  className="bg-surface/5 border-border"      // ONLY THIS CHANGED
/>
```

---

### ⚡ QUICK REFERENCE: MUST-DO vs NEVER-DO

| MUST DO ✅ | NEVER DO ❌ |
|-----------|------------|
| Migrate entire component | Partial migrations |
| Replace ALL buttons | Leave some buttons for "later" |
| Remove ALL `dark:` classes | Keep `dark:` classes |
| Use semantic tokens | Use hardcoded colors |
| Preserve ALL logic | Change event handlers |
| Clean up legacy code | Leave commented code |
| Test in ALL 3 themes | Test in one theme only |
| Verify with grep commands | Trust visual check only |
| Check reference components first | Invent new patterns |
| Count elements before/after | Assume all elements migrated |

---

## 🎨 Color System

### CSS Variables (globals.css :root)

```css
:root {
  /* Background Colors */
  --bg-primary: #101010;        /* Main background */
  --bg-secondary: #1A1A1A;      /* Secondary surfaces */
  
  /* Text Colors */
  --text-primary: #F5F5F5;      /* Main text */
  --text-secondary: #FFFFFF;    /* White text (rare) */
  
  /* Border Colors */
  --border-color: #2C2C2C;      /* Subtle borders */
  
  /* Accent Colors */
  --accent-color: #FFFFFF;      /* White accent */
  
  /* RGB Values for Tailwind (with opacity support) */
  --color-primary: 255 255 255;              /* White */
  --color-primary-hover: 255 255 255;        /* White hover */
  --color-secondary: 26 26 26;               /* Dark gray */
  --color-background: 16 16 16;              /* #101010 */
  --color-surface: 26 26 26;                 /* #1A1A1A */
  --color-surface-hover: 37 37 37;           /* #252525 */
  --color-foreground: 245 245 245;           /* #F5F5F5 */
  --color-muted: 64 64 64;                   /* #404040 */
  --color-subtle: 255 255 255;               /* White */
  --color-border: 44 44 44;                  /* #2C2C2C */
  --color-accent: 255 255 255;               /* White */
  
  /* Status Colors */
  --color-success: 22 163 74;    /* Green */
  --color-warning: 234 179 8;    /* Yellow/Orange */
  --color-error: 220 38 38;      /* Red */
  --color-info: 37 99 235;       /* Blue */
}
```

### Tailwind Color Tokens

```tsx
// ✅ CORRECT USAGE
bg-primary           // White (primary brand color)
bg-secondary         // Dark gray (#1A1A1A)
bg-surface           // Surface color (#1A1A1A)
bg-surface-hover     // Hover state (#252525)
bg-background        // Main background (#101010)

text-foreground      // Main text (#F5F5F5)
text-muted-foreground // Muted text (white)
text-subtle          // Subtle text (white)

border-border        // Border color (#2C2C2C)

// Status Colors
bg-success           // Green success state
bg-warning           // Yellow/orange warning
bg-error             // Red error state
bg-info              // Blue info state

// With Opacity
bg-primary/20        // 20% opacity white
bg-surface/50        // 50% opacity surface
text-foreground/80   // 80% opacity text
```

### ❌ NEVER Use (Industry Violation)

```tsx
// ❌ FORBIDDEN - Hardcoded Colors
bg-teal-600          // Use bg-primary
bg-slate-700         // Use bg-surface
text-blue-500        // Use text-info
border-gray-300      // Use border-border
bg-white/5           // Use bg-surface/5
dark:bg-black        // Use bg-background
dark:text-white      // Use text-foreground
text-slate-400       // Use text-muted-foreground
```

### shadcn/ui HSL Colors

```css
/* For shadcn/ui components */
--background: 0 0% 6%;              /* #101010 */
--foreground: 0 0% 96%;             /* #F5F5F5 */
--card: 0 0% 10%;                   /* #1A1A1A */
--primary: 0 0% 63%;                /* Muted gray */
--secondary: 0 0% 14%;              /* #252525 */
--muted: 0 0% 25%;                  /* #404040 */
--accent: 0 0% 25%;                 /* Accent color */
--destructive: 0 63% 50%;           /* Red */
--success: 142 71% 45%;             /* Green */
--info: 217 91% 60%;                /* Blue */
--warning: 38 92% 50%;              /* Orange */
--border: 0 0% 17%;                 /* #2C2C2C */
--radius: 1rem;                     /* Border radius */
```

---

## ✍️ Typography System

### TypeScript Tokens (src/design-tokens/semantic/typography.ts)

```typescript
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, Consolas, monospace',
  },
  heading: {
    1: {
      fontSize: { DEFAULT: '24px', md: '30px', lg: '36px' }, // Responsive
      lineHeight: '1.25',
      fontWeight: 'bold',
      letterSpacing: '-0.02em',
    },
    2: {
      fontSize: { DEFAULT: '20px', md: '24px', lg: '30px' },
      lineHeight: '1.25',
      fontWeight: 'bold',
      letterSpacing: '-0.01em',
    },
    3: {
      fontSize: { DEFAULT: '18px', md: '20px', lg: '24px' },
      lineHeight: '1.3',
      fontWeight: 'semibold',
    },
    4: {
      fontSize: { DEFAULT: '16px', md: '18px', lg: '20px' },
      lineHeight: '1.4',
      fontWeight: 'semibold',
    },
  },
  body: {
    fontSize: { DEFAULT: '14px', lg: '16px' },
    lineHeight: '1.5',
    fontWeight: 'normal',
  },
  'body-large': {
    fontSize: { DEFAULT: '16px', lg: '18px' },
    lineHeight: '1.6',
  },
  'body-small': {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  caption: {
    fontSize: '12px',
    lineHeight: '1.4',
    letterSpacing: '0.025em', // All-caps tracking
  },
  label: {
    fontSize: '14px',
    lineHeight: '1.5',
    fontWeight: 'medium',
  },
  button: {
    fontSize: { DEFAULT: '14px', lg: '16px' },
    lineHeight: '1',
    fontWeight: 'semibold',
    letterSpacing: '0.025em',
  },
};
```

### Tailwind Typography Classes

```tsx
// ✅ CORRECT USAGE
text-heading-1       // Largest heading (responsive: 24px → 36px)
text-heading-2       // h2 (responsive: 20px → 30px)
text-heading-3       // h3 (responsive: 18px → 24px)
text-heading-4       // h4 (responsive: 16px → 20px)
text-body            // Body text (14px → 16px)
text-body-large      // Large body (16px → 18px)
text-body-small      // Small body (14px)
text-caption         // Captions, metadata (12px)
text-label           // Form labels (14px, medium)
text-button          // Button text (14px → 16px, semibold)

font-sans            // Inter font family
font-mono            // Fira Code (for code snippets)
```

### ❌ NEVER Use (Industry Violation)

```tsx
// ❌ FORBIDDEN - Raw Tailwind Typography
text-2xl             // Use text-heading-1
text-xl              // Use text-heading-2
text-lg              // Use text-heading-3
text-base            // Use text-body
text-sm              // Use text-body-small
text-xs              // Use text-caption

font-bold            // Use text-heading-X (font-weight included)
font-semibold        // Use text-heading-X or text-label
leading-tight        // Use text-heading-X (line-height included)
leading-relaxed      // Use text-body (line-height included)
```

### Semantic HTML Must Match Visual Size

```tsx
// ✅ CORRECT
<h1 className="text-heading-1">         // h1 uses heading-1 class
<h2 className="text-heading-2">         // h2 uses heading-2 class
<p className="text-body">               // Paragraphs use body class

// ❌ WRONG - Semantic Mismatch
<h1 className="text-sm">                // h1 looks tiny
<div className="text-2xl font-bold">   // Not semantic HTML
```

---

## 📏 Spacing System

### TypeScript Tokens (src/design-tokens/semantic/spacing.ts)

```typescript
export const spacing = {
  // Component-specific (auto-responsive)
  'card-padding': { DEFAULT: '24px', md: '32px' },
  'section-padding': { DEFAULT: '32px', md: '48px', lg: '64px' },
  'container-padding': { DEFAULT: '16px', md: '24px', lg: '32px' },
  
  // Layout gaps
  'section-gap': { DEFAULT: '32px', md: '48px' },
  'card-gap': '16px',
  'element-gap': '12px',
  
  // Form spacing
  'form-field-gap': '16px',
  'form-section-gap': '24px',
  
  // Button spacing
  'button-padding-x': '24px',
  'button-padding-y': '12px',
  
  // Icon spacing
  'icon-gap': '12px',
  
  // Fixed values (for exact control)
  '0': '0px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
};
```

### Tailwind Spacing Classes

```tsx
// ✅ CORRECT USAGE - Semantic Spacing
p-card-padding       // Card padding (responsive: 24px → 32px)
p-section-padding    // Section padding (responsive: 32px → 64px)
gap-card-gap         // Gap between cards (16px)
gap-element-gap      // Gap between elements (12px)
mb-form-section-gap  // Margin below form section (24px)

// ✅ CORRECT USAGE - Fixed Spacing
p-4                  // 16px padding
m-6                  // 24px margin
gap-3                // 12px gap
space-y-4            // 16px vertical spacing
```

### Form Spacing Standards

```tsx
// Form Structure
<form className="space-y-4">          // 16px between fields
  <div className="space-y-2">         // 8px between label and input
    <label>                           
    <input>
  </div>
  
  <div className="mt-6">              // 24px above buttons
    <button>
  </div>
</form>
```

---

## 🌑 Shadow System (Neumorphic)

### CSS Variables (globals.css)

```css
:root {
  /* Shadow Colors (for #101010 background) */
  --neu-shadow-light: rgba(40, 40, 40, 0.5);    /* Highlight */
  --neu-shadow-dark: rgba(0, 0, 0, 0.9);        /* Shadow */
  --neu-shadow-inset-light: rgba(40, 40, 40, 0.3);
  --neu-shadow-inset-dark: rgba(0, 0, 0, 0.7);
  
  /* Neumorphic Shadow Presets */
  --shadow-neu-outset: 6px 6px 12px var(--neu-shadow-dark), 
                       -6px -6px 12px var(--neu-shadow-light);
  
  --shadow-neu-inset: inset 6px 6px 12px var(--neu-shadow-dark), 
                      inset -6px -6px 12px var(--neu-shadow-light);
  
  --shadow-neu-outset-sm: 4px 4px 8px var(--neu-shadow-dark), 
                          -4px -4px 8px var(--neu-shadow-light);
  
  --shadow-neu-inset-sm: inset 4px 4px 8px var(--neu-shadow-dark), 
                         inset -4px -4px 8px var(--neu-shadow-light);
  
  --shadow-neu-outset-lg: 8px 8px 16px var(--neu-shadow-dark), 
                          -8px -8px 16px var(--neu-shadow-light);
}
```

### Tailwind Shadow Classes

```tsx
// ✅ CORRECT USAGE
shadow-neu-outset     // Raised element (buttons, cards)
shadow-neu-inset      // Pressed element (inputs, active states)
shadow-neu-outset-sm  // Small raised
shadow-neu-inset-sm   // Small pressed
shadow-neu-outset-lg  // Large raised (hover states)
```

### When to Use Which Shadow

| Element Type | Shadow Type | Example |
|-------------|-------------|---------|
| Buttons (default) | `shadow-neu-outset` | Appears raised |
| Buttons (pressed) | `shadow-neu-inset` | Appears pressed |
| Cards | `shadow-neu-outset` | Floating above background |
| Inputs | `shadow-neu-inset` | Recessed into surface |
| Icon containers | `shadow-neu-outset` | Raised circle/square |
| Active/pressed states | `shadow-neu-inset` | Pressed down |
| Hover states | `shadow-neu-outset-lg` | Lift higher |

---

## 🧩 Component Classes

### Buttons

**IMPORTANT: ALWAYS use the `<Button>` component with `variant="secondary"` for all normal buttons.**

#### ✅ CORRECT Button Usage

```tsx
import Button from '@/components/Button';

// TYPE 1: Regular Action Buttons (Save, Cancel, Refresh, etc.)
// Let variant="secondary" handle text colors (adapts to all themes)
<Button variant="secondary" onClick={handleClick}>
  Save Changes
</Button>

<Button variant="secondary" className="w-full">
  Save Price
</Button>

<Button variant="secondary" className="w-full text-sm">
  Extend Timer
</Button>

<Button variant="secondary" className="w-full text-sm">
  Archive Lead
</Button>

// TYPE 2: Status Buttons (Approve/Reject/Restore with semantic colors)
// Use bg-* and text-*-foreground to show semantic meaning
<Button variant="secondary" className="w-full bg-success text-success-foreground">
  <CheckIcon />
  Approve Lead
</Button>

<Button variant="secondary" className="w-full bg-error text-error-foreground">
  <XIcon />
  Reject Lead
</Button>

<Button variant="secondary" className="w-full bg-success text-success-foreground">
  Restore Lead
</Button>

// With disabled state
<Button 
  variant="secondary" 
  disabled={loading}
  className="w-full"
>
  {loading ? <LoadingIcon /> : 'Save'}
</Button>
```

#### ❌ NEVER Do This

```tsx
// ❌ Don't use <button> elements directly
<button className="neu-btn-secondary">Click</button>

// ❌ Don't use hardcoded colors
<button className="bg-blue-500 hover:bg-blue-600">Click</button>

// ❌ Don't create custom button classes
<button className="action-btn">Click</button>

// ❌ Don't use neu-btn classes directly
<button className="neu-btn-primary">Click</button>
```

#### Button Component (src/components/Button.tsx)

The Button component automatically provides:
- `variant="secondary"`: Neumorphic raised effect with `shadow-neu-outset`
- Hover state: `hover:shadow-neu-inset` (pressed look)
- Background: Uses `bg-surface` by default
- Full theme support (Dark, Light, Purple)

```tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';  // Always use 'secondary' for normal buttons
  withArrow?: boolean;
  className?: string;
  // ...all standard button props
}
```

#### ⚠️ CRITICAL: Two Button Patterns (Nov 5, 2025)

**Pattern 1: Regular Action Buttons (Save, Refresh, Cancel, Archive)**
- **Purpose**: General actions without semantic meaning
- **Rule**: Let `variant="secondary"` handle text colors
- **Why**: `text-muted-foreground` adapts to all themes automatically

```tsx
// ✅ CORRECT - No text color override (adapts to all themes)
<Button variant="secondary" className="w-full">Save Price</Button>
<Button variant="secondary" className="w-full text-sm">Extend Timer</Button>
<Button variant="secondary" className="w-full h-12">Refresh</Button>

// ❌ WRONG - Breaks theme adaptation (white text invisible on light theme)
<Button variant="secondary" className="w-full bg-info text-info-foreground">Save</Button>
<Button variant="secondary" className="w-full bg-accent text-white">Extend</Button>
```

**Pattern 2: Status Buttons (Approve/Reject/Restore)**
- **Purpose**: Actions with semantic meaning (success/error/warning)
- **Rule**: Use `bg-*` and `text-*-foreground` to convey status
- **Why**: Green = approve, Red = reject, visual distinction needed

```tsx
// ✅ CORRECT - Status colors show semantic meaning
<Button variant="secondary" className="w-full bg-success text-success-foreground">
  Approve Lead
</Button>
<Button variant="secondary" className="w-full bg-error text-error-foreground">
  Reject Lead
</Button>
<Button variant="secondary" className="w-full bg-warning text-warning-foreground">
  Review Later
</Button>
```

**Decision Tree:**
```
Does the button convey STATUS (approve/reject/restore/warning)?
├─ YES → Use bg-success/error/warning + text-*-foreground
└─ NO → Use ONLY w-full, text-sm (let variant handle text color)
```

**Allowed className Props on Regular Action Buttons:**
- ✅ Width/sizing: `w-full`, `w-auto`, `max-w-md`
- ✅ Typography size: `text-sm`, `text-base` (NOT color)
- ✅ Spacing: `px-6`, `py-3`, `mx-auto`
- ❌ Text colors: `text-white`, `text-*-foreground` (breaks theme)
- ❌ Background colors: `bg-info`, `bg-accent` (for status only)

**DO NOT use hardcoded colors like `bg-blue-500`, `bg-green-500`, `bg-red-500`, etc.**

### Cards (globals.css)

#### Standard Card - Flat Raised

```css
.neu-card {
  @apply bg-primary rounded-[20px] p-6;
  box-shadow: 10px 10px 20px var(--neu-shadow-dark),
              -10px -10px 20px var(--neu-shadow-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.neu-card:hover {
  box-shadow: 12px 12px 24px var(--neu-shadow-dark),
              -12px -12px 24px var(--neu-shadow-light);
  transform: translateY(-4px);
}
```

**Usage:**
```tsx
<div className="neu-card">
  <h3 className="text-heading-3 text-foreground mb-4">Card Title</h3>
  <p className="text-body text-subtle">Card content...</p>
</div>
```

#### Card Pattern (Current System - Nov 5, 2025)

**NO custom CSS class needed - use inline Tailwind:**

```tsx
// ✅ CORRECT - Card/Modal Container
<div className="bg-surface shadow-neu-outset rounded-lg p-6">
  <h3 className="text-foreground text-lg font-semibold mb-4">Card Title</h3>
  <p className="text-muted-foreground">Card content...</p>
</div>
```

**Pattern Explained:**
- `bg-surface` = Elevated background (uses --color-surface CSS variable)
- `shadow-neu-outset` = Neumorphic raised shadow (defined in globals.css)
- `rounded-lg` = Border radius (16px)
- `p-6` = Padding (24px)

#### Pressed Card - Concave Effect

```css
.neu-card-pressed {
  @apply bg-primary rounded-[20px] p-6;
  box-shadow: inset 6px 6px 12px var(--neu-shadow-inset-dark),
              inset -6px -6px 12px var(--neu-shadow-inset-light);
}
```

### Icon Buttons

```css
.neu-btn-icon {
  @apply bg-primary rounded-full;
  @apply w-12 h-12 flex items-center justify-center;
  box-shadow: 6px 6px 12px var(--neu-shadow-dark),
              -6px -6px 12px var(--neu-shadow-light);
}
```

---

## 📝 Form Components

### Input Fields (globals.css)

#### Standard Input - Neumorphic Inset

```css
.neu-input {
  @apply w-full bg-surface border border-border rounded-xl py-3 px-4;
  @apply text-foreground placeholder:text-muted-foreground;
  @apply transition-all duration-200;
  @apply focus:border-primary focus:shadow-neu-inset focus:outline-none;
  @apply shadow-neu-inset;
}

.neu-input::placeholder {
  @apply text-muted-foreground opacity-60;
  @apply transition-opacity duration-200;
}

.neu-input:focus::placeholder {
  @apply opacity-40; /* Fade on focus */
}
```

**Usage:**
```tsx
<input 
  type="text" 
  className="neu-input" 
  placeholder="Enter text..."
/>
```

#### Error State Input

```css
.neu-input-error {
  @apply neu-input border-destructive;
}
```

### Input Icons (Left-side)

```css
.auth-input-icon {
  @apply absolute left-4 top-1/2 -translate-y-1/2;
  @apply text-muted-foreground pointer-events-none;
  @apply transition-colors duration-200;
}

/* Icon highlights when input focused */
.neu-input:focus ~ .auth-input-icon,
.neu-input:focus + .auth-input-icon {
  @apply text-subtle;
}
```

**Usage:**
```tsx
<div className="relative">
  <input className="neu-input pl-12" />
  <div className="auth-input-icon">
    <MailIcon className="h-5 w-5" />
  </div>
</div>
```

**Spacing Standards:**
- Icon position: `left-4` (16px from left edge)
- Input left padding: `pl-12` (48px) when icon present
- Icon size: `h-5 w-5` (20x20px)

### Form Header Icon Container - Neumorphic

```css
.auth-icon-container {
  @apply w-20 h-20 bg-surface rounded-[1.25rem];
  @apply flex items-center justify-center;
  @apply shadow-neu-outset;
  @apply transition-all duration-300;
}

.auth-icon-container:hover {
  @apply shadow-neu-outset-lg;
}
```

**Usage:**
```tsx
<div className="auth-icon-container mb-6">
  <LockIcon className="h-10 w-10 text-primary" />
</div>
```

**Sizing Standards:**
- Container: `80x80px` (w-20 h-20)
- Icon inside: `40x40px` (h-10 w-10)
- Margin below: `mb-6` (24px)

### Form Alerts

```css
.neu-alert-error {
  @apply bg-destructive/10 text-destructive;
  @apply border border-destructive/30 rounded-xl p-4;
  @apply shadow-neu-inset;
}

.neu-alert-success {
  @apply bg-success/10 text-success;
  @apply border border-success/30 rounded-xl p-4;
  @apply shadow-neu-inset;
}

.neu-alert-warning {
  @apply bg-warning/10 text-warning;
  @apply border border-warning/30 rounded-xl p-4;
  @apply shadow-neu-inset;
}

.neu-alert-info {
  @apply bg-info/10 text-info;
  @apply border border-info/30 rounded-xl p-4;
  @apply shadow-neu-inset;
}
```

---

## 🎬 Animation System

### CSS Variables (globals.css)

```css
:root {
  /* Animation Durations */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  
  /* Easing Functions */
  --easing-linear: linear;
  --easing-easeIn: cubic-bezier(0.4, 0, 1, 1);
  --easing-easeOut: cubic-bezier(0, 0, 0.2, 1);
  --easing-easeInOut: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Tailwind Animation Classes

```tsx
// Transition Durations
duration-fast        // 150ms
duration-normal      // 250ms
duration-slow        // 350ms
duration-slower      // 500ms

// Transition Properties (NEVER use transition-all)
transition-colors    // Color transitions only
transition-shadow    // Shadow transitions only
transition-transform // Transform transitions only
transition-opacity   // Opacity transitions only

// Built-in Animations
animate-fade-in      // Fade in
animate-fade-out     // Fade out
animate-slide-in-up  // Slide in from bottom
animate-spin         // Loading spinners
```

### ❌ NEVER Use

```tsx
transition-all       // ❌ PERFORMANCE KILLER - animates everything
transition           // ❌ Too generic - be specific
```

### Animation Best Practices

1. **Be Specific**: Use `transition-colors` not `transition-all`
2. **Use Normal Duration**: Default to `duration-200` (200ms)
3. **Smooth Easing**: Use `ease-in-out` for most transitions
4. **Respect Accessibility**: Components auto-disable animations if user prefers reduced motion

```tsx
// ✅ CORRECT
<button className="neu-btn-primary transition-colors duration-200">
  
// ❌ WRONG
<button className="neu-btn-primary transition-all duration-500">
```

---

## 📐 Border & Radius

### Border Radius Tokens

```typescript
export const borders = {
  radius: {
    card: '20px',
    button: '12px',
    input: '12px',
    modal: '24px',
    badge: '9999px', // Fully rounded
  },
  width: {
    default: '1px',
    thick: '2px',
  },
};
```

### Tailwind Border Classes

```tsx
// Radius
rounded-card         // 20px (cards)
rounded-button       // 12px (buttons)
rounded-input        // 12px (inputs)
rounded-modal        // 24px (modals)
rounded-badge        // 9999px (badges, pills)

// Width
border               // 1px solid
border-2             // 2px solid

// Color
border-border        // Default border color (#2C2C2C)
```

---

## 🚨 Industry Standard Violations

### Current Violations Found (November 1, 2025 Audit)

#### 1. ❌ Hardcoded Colors (HIGH PRIORITY)

**Files Affected:** 
- `src/components/InstantQuoteForm.tsx` (30+ violations)
- `src/components/Hero.tsx` (4 violations)
- `src/components/QuoteOptionsModal.tsx` (6 violations)
- `src/components/HomeownerMobileSidebarMenu.tsx` (12 violations)
- `src/components/homeowner/SimplifiedQuoteForm.tsx` (20+ violations)

**Violations:**
```tsx
// ❌ WRONG
className="bg-slate-50/50 dark:bg-slate-800/50"
className="text-slate-900 dark:text-white"
className="border-gray-200 dark:border-slate-700"
className="bg-white/50 dark:bg-slate-700/30"
className="text-slate-600 dark:text-slate-300"

// ✅ SHOULD BE
className="bg-surface/50"
className="text-foreground"
className="border-border"
className="bg-surface/50"
className="text-muted-foreground"
```

**Impact:** 
- Inconsistent colors across components
- Breaks when theme changes
- Not maintainable
- 100+ instances need fixing

**Priority:** P0 - Must fix before any new features

---

#### 2. ❌ Raw Tailwind Typography (MEDIUM PRIORITY)

**Files Affected:**
- `src/components/Hero.tsx`
- `src/components/QuoteOptionsModal.tsx`
- `src/components/InstantQuoteForm.tsx`

**Violations:**
```tsx
// ❌ WRONG
className="text-2xl font-bold"
className="text-sm font-medium"
className="text-4xl md:text-5xl font-bold"

// ✅ SHOULD BE
className="text-heading-2"
className="text-body-small"
className="text-heading-1"
```

**Impact:**
- No responsive scaling (manual breakpoints needed)
- Inconsistent heading hierarchy
- Missing optimal line-heights/letter-spacing
- Harder to maintain

**Priority:** P1 - Fix during next component updates

---

#### 3. ❌ Hardcoded Input Classes (MEDIUM PRIORITY)

**Files Affected:**
- `src/components/homeowner/SimplifiedQuoteForm.tsx`

**Violations:**
```tsx
// ❌ WRONG
const baseInputClasses = "w-full bg-gray-100 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

// ✅ SHOULD BE
<AuthInput />  // or  className="neu-input"
```

**Impact:**
- Duplicate code across components
- Not using centralized form components
- Inconsistent form styling

**Priority:** P1 - Migrate to centralized components

---

#### 4. ❌ Conditional Dark Mode Classes (HIGH PRIORITY)

**Violations:**
```tsx
// ❌ WRONG - Manual dark mode switching
className="text-slate-900 dark:text-white"
className="bg-gray-100 dark:bg-slate-800"

// ✅ CORRECT - CSS variables handle theme automatically
className="text-foreground"
className="bg-surface"
```

**Why It's Wrong:**
- CSS variables already handle dark mode
- Adding `dark:` creates duplicate theming logic
- Harder to add future themes (light, brand)
- Not scalable

**Priority:** P0 - Critical industry standard violation

---

#### 5. ❌ Inline Icon SVGs (LOW PRIORITY)

**Files Affected:**
- Various components with inline `<svg>` tags

**Violations:**
```tsx
// ❌ WRONG - Inline SVG
<svg xmlns="http://www.w3.org/2000/svg">...</svg>

// ✅ CORRECT - Centralized icon component
<MailIcon className="h-5 w-5" />
```

**Impact:**
- Code duplication
- Harder to maintain consistent icon sizing
- Bundle size increase

**Priority:** P2 - Fix gradually during refactors

---

#### 6. ❌ Missing Semantic HTML (MEDIUM PRIORITY)

**Violations:**
```tsx
// ❌ WRONG - Visual size doesn't match semantic meaning
<div className="text-2xl font-bold">Title</div>
<h1 className="text-sm">Small heading</h1>

// ✅ CORRECT - Semantic HTML matches visual hierarchy
<h1 className="text-heading-1">Title</h1>
<h2 className="text-heading-2">Subtitle</h2>
```

**Why It Matters:**
- SEO impact (search engines rely on semantic HTML)
- Accessibility (screen readers use heading hierarchy)
- WCAG 2.1 compliance requirement

**Priority:** P1 - Fix during typography migration

---

### Violation Summary Table

| Violation Type | Priority | Instances Found | Files Affected |
|----------------|----------|-----------------|----------------|
| Hardcoded colors | P0 | 100+ | 10+ components |
| Raw Tailwind typography | P1 | 50+ | 8 components |
| Hardcoded input classes | P1 | 5 | 3 components |
| Manual dark mode classes | P0 | 80+ | 10+ components |
| Inline icon SVGs | P2 | 20+ | 5 components |
| Semantic HTML misuse | P1 | 30+ | 6 components |

**Total Technical Debt:** ~285 violations across codebase

---

## 🔄 MIGRATION PRINCIPLES - COMPLETE SYSTEM

### 🎯 Core Migration Philosophy

**GOLDEN RULE**: NO HARDCODING, ONLY SEMANTIC & GLOBAL IMPLEMENTATIONS

Based on extensive migration experience and pain points, these principles ensure:
- ✅ **100% completion** - No partial migrations (e.g., migrating forms but not buttons)
- ✅ **Zero inconsistency** - All components follow identical patterns
- ✅ **No double work** - Do it once, do it right
- ✅ **Theme-agnostic** - Works across Dark, Light, and Purple themes automatically

---

### 🚨 CRITICAL MIGRATION RULES

#### Rule #1: COMPLETE COMPONENT MIGRATION (100% Rule)

**❌ WRONG - Partial Migration:**
```tsx
// Migrated form fields but left buttons hardcoded
<form className="space-y-4">
  <input className="neu-input" />  {/* ✅ Migrated */}
  <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3"> {/* ❌ Not migrated */}
    Submit
  </button>
</form>
```

**✅ CORRECT - Complete Migration:**
```tsx
<form className="space-y-4">
  <input className="neu-input" />
  <Button variant="primary">Submit</Button>  {/* ✅ Both migrated */}
</form>
```

**CHECKLIST before marking component "complete":**
- [ ] All colors use semantic tokens (bg-surface, text-foreground)
- [ ] All buttons use Button component from `@/components/ui/button`
- [ ] All typography uses semantic tokens (text-heading-1, text-body)
- [ ] All spacing uses semantic tokens (p-card-padding, gap-element-gap)
- [ ] All shadows use neumorphic tokens (shadow-neu-outset, shadow-neu-inset)
- [ ] All borders use semantic tokens (border-border, rounded-button)
- [ ] All form inputs use centralized components (neu-input class or AuthInput)
- [ ] All icons use centralized components (not inline SVGs)
- [ ] Zero `dark:` classes (themes handled by CSS variables)
- [ ] Zero hardcoded Tailwind colors (bg-slate-*, text-gray-*, etc.)

---

#### Rule #2: NO DARK MODE CLASSES (Theme-Agnostic Rule)

**❌ WRONG - Manual Dark Mode:**
```tsx
// Creates double work and breaks when adding new themes
className="bg-white dark:bg-black text-slate-900 dark:text-white"
className="border-gray-200 dark:border-slate-700"
className="bg-gray-100 dark:bg-slate-800"
```

**✅ CORRECT - Theme-Agnostic:**
```tsx
// Works automatically across Dark, Light, Purple themes
className="bg-surface text-foreground"
className="border-border"
className="bg-surface"
```

**WHY THIS MATTERS:**
- Current system has 3 themes (Dark, Light, Purple)
- Each theme defines its own CSS variable values
- Using semantic tokens means: change theme → component updates automatically
- Using `dark:` classes means: must manually handle each theme variation

**MIGRATION PATTERN:**
```tsx
// Find all instances of:
dark:bg-*
dark:text-*
dark:border-*
dark:hover:*

// Replace with semantic tokens (remove dark: prefix)
bg-surface
text-foreground
border-border
hover:bg-surface-hover
```

---

#### Rule #3: ATOMIC COMPONENT CONSISTENCY (No Reinventing)

**❌ WRONG - Creating New Patterns:**
```tsx
// Component A - Custom button
<button className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg">
  Click Me
</button>

// Component B - Another custom button (inconsistent)
<button className="bg-accent hover:bg-accent-hover px-6 py-3 rounded-xl shadow-neu-outset">
  Submit
</button>

// Component C - Yet another pattern
<button className="neu-btn-primary">
  Save
</button>
```

**✅ CORRECT - Use Centralized Button:**
```tsx
import Button from '@/components/ui/button';

// Component A, B, C - All consistent
<Button variant="primary">Click Me</Button>
<Button variant="primary">Submit</Button>
<Button variant="primary">Save</Button>
```

**CENTRALIZED COMPONENTS REGISTRY:**

| Element | Component/Class | Import Path | Documentation |
|---------|----------------|-------------|---------------|
| Buttons | `<Button variant="primary\|secondary\|ghost">` | `@/components/ui/button` | See HeaderMenu.tsx |
| Form Inputs | `.neu-input` class | globals.css | See FORM-DESIGN-STANDARD-SOT.md |
| Auth Inputs | `<AuthInput />` | `@/components/auth` | Auth-specific inputs with icons |
| Cards | `bg-surface shadow-neu-outset rounded-lg` | Inline Tailwind | Standard card pattern |
| Modals | `bg-surface shadow-neu-outset rounded-lg p-8` | Inline Tailwind | Modal container |
| Alerts | Status color classes | `bg-success`, `bg-error`, `bg-warning`, `bg-info` | Status indicators |

**BEFORE CODING:**
1. Open `HeaderMenu.tsx` - Check Button usage
2. Open `InstallerSignupModal.tsx` - Check form patterns
3. Open `TopBar.tsx` - Check neumorphic shadows
4. Search codebase: `grep -r "neu-btn-primary" src/` - Find existing patterns

---

#### Rule #4: GREP BEFORE & AFTER (Violation Check)

**MANDATORY VERIFICATION:**

```bash
# BEFORE STARTING MIGRATION - Document current state
grep -r "bg-slate-" src/components/YourComponent.tsx > violations-before.txt
grep -r "text-slate-" src/components/YourComponent.tsx >> violations-before.txt
grep -r "dark:" src/components/YourComponent.tsx >> violations-before.txt
grep -c "<button" src/components/YourComponent.tsx >> violations-before.txt

# AFTER MIGRATION - Must be ZERO
grep -r "bg-slate-" src/components/YourComponent.tsx  # Expected: EMPTY
grep -r "text-slate-" src/components/YourComponent.tsx  # Expected: EMPTY
grep -r "dark:" src/components/YourComponent.tsx  # Expected: EMPTY (except comments)
grep -c "<button" src/components/YourComponent.tsx  # Expected: 0 (all replaced with Button)
```

**RED FLAGS (Must fix before commit):**
- Any `bg-slate-*`, `text-slate-*`, `border-gray-*` found
- Any `dark:` classes found (except in globals.css)
- Any native `<button>` elements (should use Button component)
- Any `text-2xl font-bold` (should use `text-heading-2`)
- Any inline SVG icons (should use centralized icon components)

---

#### Rule #5: REFERENCE COMPONENT MANDATE (Never Assume)

**BEFORE TOUCHING ANY COMPONENT:**

**Step 1: Identify Reference Components**
```tsx
// For Buttons → HeaderMenu.tsx
import Button from '@/components/ui/button';

<Button variant="primary" className="px-5 py-2">Sign Up</Button>
<Button variant="secondary" className="px-5 py-2">Logout</Button>
<Button variant="ghost" className="px-5 py-2">Login</Button>
```

**Step 2: For Forms → InstallerSignupModal.tsx**
```tsx
// Input pattern
<input 
  className="neu-input pl-12"
  placeholder="Email"
/>

// Icon container
<div className="auth-icon-container">
  <MailIcon className="h-10 w-10 text-primary" />
</div>

// Icon inside input
<div className="relative">
  <input className="neu-input pl-12" />
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
    <MailIcon className="h-5 w-5" />
  </div>
</div>
```

**Step 3: For Neumorphic Shadows → TopBar.tsx**
```tsx
// Raised elements
shadow-neu-outset       // Buttons, cards
shadow-neu-outset-lg    // Hover states

// Pressed elements
shadow-neu-inset        // Inputs, active buttons
```

**❌ NEVER DO THIS:**
```tsx
// Creating new patterns without checking references
<button className="bg-primary hover:bg-accent px-4 py-3 rounded-md shadow-lg">
  // ❌ Wrong: padding, radius, shadow don't match SOT
</button>
```

---

### 📋 STEP-BY-STEP MIGRATION PROCESS

#### Phase 1: Pre-Migration Audit (5 minutes)

```bash
# 1. Document current violations
cd "d:\\Desktop Mass\\SOLAR LEAD GEN PROJECT MAIN FILE\\solarmatch"

# Count violations
grep -rn "bg-slate-\|text-slate-\|border-gray-" src/components/[Component].tsx | wc -l
grep -rn "dark:" src/components/[Component].tsx | wc -l
grep -c "<button" src/components/[Component].tsx

# 2. Identify all element types
grep -n "className=" src/components/[Component].tsx | head -20

# 3. Check for forms/buttons/modals
grep -n "onSubmit\|onClick\|type=\"submit\"" src/components/[Component].tsx
```

**Document findings:**
- Total violations: ___ 
- Button count: ___
- Has forms: Yes/No
- Has modals: Yes/No
- Reference components needed: ___ (list)

---

#### Phase 2: Open Reference Components (2 minutes)

**MANDATORY - Open these files side-by-side:**

1. `src/components/HeaderMenu.tsx` - Button patterns
2. `src/components/InstallerSignupModal.tsx` - Form patterns
3. `src/components/TopBar.tsx` - Neumorphic shadows
4. `src/app/globals.css` (lines 300-600) - All CSS classes

**Copy exact import statements:**
```tsx
import Button from '@/components/ui/button';  // ✅ Exact import
```

---

#### Phase 3: Replace Hardcoded Colors (P0)

**COMPREHENSIVE REPLACEMENT MAP (Copy-Paste Ready):**

```tsx
/* ============================================
   COLOR REPLACEMENTS - Theme-Agnostic
   ============================================ */

// BACKGROUNDS
bg-white dark:bg-black                  → bg-background
bg-white/5 dark:bg-black/20             → bg-surface/5
bg-gray-50 dark:bg-slate-900            → bg-surface
bg-gray-100 dark:bg-slate-800           → bg-surface
bg-slate-50/50 dark:bg-slate-800/50     → bg-surface/50
bg-slate-700 dark:bg-slate-900          → bg-surface
bg-white/50 dark:bg-slate-700/30        → bg-surface/50

// TEXT COLORS
text-slate-900 dark:text-white          → text-foreground
text-black dark:text-white              → text-foreground
text-slate-600 dark:text-slate-400      → text-muted-foreground
text-slate-500 dark:text-slate-300      → text-muted-foreground
text-gray-600 dark:text-gray-400        → text-muted-foreground
text-slate-400                          → text-muted-foreground (icons, placeholders)

// BORDERS
border-gray-200 dark:border-slate-700   → border-border
border-slate-200 dark:border-slate-800  → border-border
border-border/30 dark:border-slate-700/50 → border-border/30 (remove dark:)
border-slate-700/50                     → border-border/50

// HOVER STATES (remove dark: variations)
hover:bg-gray-100 dark:hover:bg-slate-800 → hover:bg-surface-hover
hover:text-slate-800 dark:hover:text-white → hover:text-foreground

// PLACEHOLDERS
placeholder-slate-500 dark:placeholder-slate-400 → placeholder-muted-foreground

// COMMON ICONS
text-slate-400                          → text-muted-foreground (for icons)
text-slate-500 dark:text-slate-400      → text-muted-foreground
```

**STATUS COLORS (Keep semantic meaning):**
```tsx
// Error states (keep Tailwind semantic)
bg-red-50 dark:bg-red-900/20            → bg-destructive/10
text-red-500 dark:text-red-400          → text-destructive
border-red-200 dark:border-red-800      → border-destructive/30

// Success states
bg-green-50 dark:bg-green-900/20        → bg-success/10
text-green-500 dark:text-green-400      → text-success
border-green-200 dark:border-green-800  → border-success/30

// Warning states
bg-yellow-50 dark:bg-yellow-900/20      → bg-warning/10
text-yellow-500 dark:text-yellow-400    → text-warning
border-yellow-200 dark:border-yellow-800 → border-warning/30

// Info states
bg-blue-50 dark:bg-blue-900/20          → bg-info/10
text-blue-500 dark:text-blue-400        → text-info
border-blue-200 dark:border-blue-800    → border-info/30
```

**MIGRATION SCRIPT (VS Code Find & Replace with Regex):**

```bash
# Enable Regex in VS Code (Alt+R)
# Replace in current file or entire src/components/ folder

# Pattern 1: Background with dark mode
Find:    bg-white/5 dark:bg-black/20
Replace: bg-surface/5

# Pattern 2: Text with dark mode
Find:    text-slate-900 dark:text-white
Replace: text-foreground

# Pattern 3: Border with dark mode
Find:    border-gray-200 dark:border-slate-700
Replace: border-border

# Pattern 4: Remove dark: prefix globally (careful!)
Find:    dark:(bg|text|border|hover:)-([\w-/]+)
Replace: $1-$2
```

---

#### Phase 4: Replace ALL Buttons (P0 - CRITICAL)

**❌ COMMON MISTAKE - Forgetting Buttons:**
```tsx
// Migrated form but forgot buttons!
<form className="space-y-4">
  <input className="neu-input" />  {/* ✅ Migrated */}
  <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl">
    {/* ❌ Still hardcoded! */}
    Submit
  </button>
</form>
```

**✅ COMPLETE MIGRATION:**

**Step 1: Count ALL buttons**
```bash
grep -n "<button" src/components/YourComponent.tsx
# Note line numbers and types (submit, reset, click, etc.)
```

**Step 2: Add Button import**
```tsx
import Button from '@/components/ui/button';
```

**Step 3: Replace each button**
```tsx
// OLD
<button 
  type="submit"
  className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
  onClick={handleSubmit}
>
  Submit Form
</button>

// NEW
<Button 
  type="submit"
  variant="primary"
  onClick={handleSubmit}
  className="w-full"
>
  Submit Form
</Button>

// Button Variant Map:
// Primary CTA (submit, confirm, save) → variant="primary"
// Secondary action (cancel, back)     → variant="secondary"
// Tertiary/ghost (skip, dismiss)     → variant="ghost"
```

**Step 4: Verify zero native buttons**
```bash
grep -c "<button" src/components/YourComponent.tsx
# Expected: 0
```

---

#### Phase 5: Migrate Typography (P1)

**COMPLETE REPLACEMENT MAP:**

```tsx
/* ============================================
   TYPOGRAPHY REPLACEMENTS
   ============================================ */

// HEADINGS (remove font-weight, it's included)
text-4xl font-bold leading-tight         → text-heading-1
text-3xl font-bold                       → text-heading-2
text-2xl font-bold                       → text-heading-2
text-xl font-semibold                    → text-heading-3
text-lg font-semibold                    → text-heading-4

// BODY TEXT
text-base leading-relaxed                → text-body
text-base                                → text-body
text-sm                                  → text-body-small
text-xs                                  → text-caption

// LABELS (form labels, nav items)
text-sm font-medium                      → text-label

// BUTTONS
text-sm font-semibold                    → text-button

// REMOVE THESE (redundant with semantic classes)
font-bold                                → (remove, already in text-heading-*)
font-semibold                            → (remove, already in text-heading-*)
font-medium                              → (remove, already in text-label)
leading-tight                            → (remove, already in text-heading-*)
leading-relaxed                          → (remove, already in text-body)
leading-normal                           → (remove, default)
```

**SEMANTIC HTML REQUIREMENT:**
```tsx
// ✅ CORRECT - Visual matches semantic
<h1 className="text-heading-1">Main Title</h1>
<h2 className="text-heading-2">Section Title</h2>
<p className="text-body">Body paragraph</p>

// ❌ WRONG - Visual doesn't match semantic
<div className="text-heading-1">Not semantic</div>  {/* Should be h1 */}
<h1 className="text-caption">Tiny heading</h1>     {/* Confusing hierarchy */}
```

---

#### Phase 6: Use Centralized Form Components (P1)

**FORM INPUT STANDARDIZATION:**

**Option A: Use CSS Class (Recommended for simple forms)**
```tsx
// ✅ Simple, consistent
<input 
  type="email"
  className="neu-input"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// With icon (left-side)
<div className="relative">
  <input 
    className="neu-input pl-12"
    placeholder="Enter email"
  />
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
    <MailIcon className="h-5 w-5" />
  </div>
</div>
```

**Option B: Use AuthInput Component (For auth forms)**
```tsx
import { AuthInput } from '@/components/auth';

<AuthInput
  name="email"
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  icon={<MailIcon className="h-5 w-5" />}
  showPasswordToggle={type === 'password'}
/>
```

**❌ NEVER CREATE CUSTOM INPUT CLASSES:**
```tsx
// ❌ WRONG - Reinventing the wheel
const baseInputClasses = "w-full bg-gray-100 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

// ✅ CORRECT - Use existing class
<input className="neu-input" />
```

**ICON PATTERNS:**

```tsx
// Form Header Icon (80x80px container, 40x40px icon)
<div className="auth-icon-container mb-6">
  <LockIcon className="h-10 w-10 text-primary" />
</div>

// Input Icon (20x20px, left-aligned)
<div className="relative">
  <input className="neu-input pl-12" />
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
    <MailIcon className="h-5 w-5" />
  </div>
</div>
```

---

#### Phase 7: Final Verification (MANDATORY - 5 minutes)

**ZERO-VIOLATION CHECK:**

```bash
cd "d:\\Desktop Mass\\SOLAR LEAD GEN PROJECT MAIN FILE\\solarmatch"

# 1. COLOR VIOLATIONS (Must be ZERO)
grep -rn "bg-slate-" src/components/YourComponent.tsx
grep -rn "text-slate-" src/components/YourComponent.tsx
grep -rn "border-gray-" src/components/YourComponent.tsx
grep -rn "dark:bg-" src/components/YourComponent.tsx
grep -rn "dark:text-" src/components/YourComponent.tsx
grep -rn "dark:border-" src/components/YourComponent.tsx

# Expected: EMPTY (or only in comments)

# 2. BUTTON VIOLATIONS (Must be ZERO)
grep -c "<button" src/components/YourComponent.tsx

# Expected: 0

# 3. TYPOGRAPHY VIOLATIONS (Must be ZERO)
grep -rn "text-2xl font-" src/components/YourComponent.tsx
grep -rn "text-xl font-" src/components/YourComponent.tsx
grep -rn "text-sm font-medium" src/components/YourComponent.tsx

# Expected: EMPTY (replaced with semantic tokens)

# 4. INLINE SVG VIOLATIONS (Should be minimal)
grep -c "<svg" src/components/YourComponent.tsx

# Expected: 0 (use centralized icon components)
```

**CHECKLIST (All must be ✅):**

- [ ] Zero hardcoded colors (`bg-slate-*`, `text-gray-*`, `border-*`)
- [ ] Zero `dark:` classes (except in globals.css)
- [ ] Zero native `<button>` elements (all use Button component)
- [ ] Zero raw typography (`text-2xl font-bold` → `text-heading-2`)
- [ ] Zero custom input classes (use `neu-input` or `AuthInput`)
- [ ] Zero inline SVGs (use centralized icons)
- [ ] All semantic HTML matches visual hierarchy (h1 uses text-heading-1)
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Component still functions (test all interactions)

**IF ANY CHECK FAILS:**
1. Fix immediately (should take <5 minutes)
2. Re-run verification
3. Repeat until all checks pass

**ONLY THEN:**
- Mark task complete in tasks.md
- Request user approval for commit

---

### 🔥 COMMON PAIN POINTS & SOLUTIONS

#### Pain Point #1: Partial Migrations (Forms but not Buttons)

**SYMPTOM:**
- Form fields look neumorphic and themed
- Buttons still have hardcoded teal/slate colors
- Creates visual inconsistency

**ROOT CAUSE:**
- Developer focused only on `<input>` elements
- Forgot to check for `<button>` elements
- No systematic verification

**SOLUTION:**
```bash
# ALWAYS count buttons BEFORE starting
grep -c "<button" src/components/YourComponent.tsx

# Create checklist:
# - [ ] Input 1 (line X)
# - [ ] Input 2 (line Y)
# - [ ] Button 1 (line Z) ← DON'T FORGET
# - [ ] Button 2 (line A) ← DON'T FORGET
```

**PREVENTION:**
- Use "100% Rule" - migrate EVERYTHING in the component
- Verify button count before AND after: must go from N → 0

---

#### Pain Point #2: Inconsistency Across Components

**SYMPTOM:**
- Component A uses `bg-primary` for buttons
- Component B uses `bg-accent` for buttons
- Component C uses `bg-surface` for buttons
- Same visual intent, different implementations

**ROOT CAUSE:**
- Not checking reference components first
- Assuming/guessing instead of copying patterns
- Creating new patterns instead of reusing

**SOLUTION:**
```tsx
// BEFORE coding, open these files:
// 1. HeaderMenu.tsx - for Button usage
// 2. InstallerSignupModal.tsx - for form patterns
// 3. TopBar.tsx - for shadows

// COPY exact import:
import Button from '@/components/ui/button';

// COPY exact usage:
<Button variant="primary">Submit</Button>  // ✅ Consistent across all components
```

**PREVENTION:**
- "Reference Component Mandate" (Rule #5)
- Never assume - always verify
- Copy-paste patterns, don't reinvent

---

#### Pain Point #3: Dark Mode Classes Still Present

**SYMPTOM:**
```tsx
className="bg-white dark:bg-black text-slate-900 dark:text-white"
```
- Component "works" but violates theme-agnostic principle
- Breaks when purple theme is selected
- Creates double work

**ROOT CAUSE:**
- Habit from old codebase
- Not understanding CSS variable system
- Copying old patterns

**SOLUTION:**
```tsx
// REMOVE all dark: prefixes
className="bg-surface text-foreground"  // ✅ Works for Dark, Light, Purple
```

**PREVENTION:**
- Grep check after migration: `grep -r "dark:" YourComponent.tsx`
- Must return ZERO (except in globals.css)

---

#### Pain Point #4: Creating New CSS Classes

**SYMPTOM:**
```tsx
const customInputClass = "w-full bg-gray-100 dark:bg-slate-900 border...";
```
- Reinventing existing `.neu-input` class
- Creates maintenance burden

**ROOT CAUSE:**
- Not checking globals.css first
- Not aware of existing classes
- Trying to "improve" on existing patterns

**SOLUTION:**
```tsx
// DON'T create new classes
// USE existing classes from globals.css

<input className="neu-input" />  // ✅ Already exists, already perfect
```

**PREVENTION:**
- Search globals.css before creating: `grep "neu-input" src/app/globals.css`
- Check similar components for patterns
- "Atomic Component Consistency" (Rule #3)

---

#### Pain Point #5: Icon Inconsistency

**SYMPTOM:**
- Some components use inline SVGs
- Some use `h-5 w-5` icons
- Some use `h-10 w-10` icons
- No clear pattern

**ROOT CAUSE:**
- Not documenting icon sizing standards
- Copying from different sources

**SOLUTION:**
```tsx
// ICON SIZING STANDARDS:

// Header icons (form title) - 80x80px container, 40x40px icon
<div className="auth-icon-container">
  <LockIcon className="h-10 w-10 text-primary" />
</div>

// Input icons (inline) - 20x20px
<MailIcon className="h-5 w-5 text-muted-foreground" />

// Nav icons - 24x24px
<HomeIcon className="h-6 w-6" />

// Button icons - 16x16px
<PlusIcon className="h-4 w-4" />
```

**PREVENTION:**
- Always check reference components for icon sizing
- Use centralized icon components (not inline SVGs)

---

#### Pain Point #6: Grep Violations After "Complete" Migration

**SYMPTOM:**
- Developer marks task complete
- User runs grep check: finds 20+ violations
- Must redo entire component

**ROOT CAUSE:**
- Skipping verification step
- Trusting visual check only
- Not using grep before commit

**SOLUTION:**
```bash
# MANDATORY before marking complete:
grep -r "bg-slate-\|text-slate-\|dark:" src/components/YourComponent.tsx

# Must return EMPTY
# If violations found → fix them → re-check
```

**PREVENTION:**
- "Grep Before & After" (Rule #4)
- Never skip verification
- Automate with pre-commit hook (future)

---

### Pre-Commit Checklist

Before committing component changes:

- [ ] Zero hardcoded colors (`bg-teal-600`, `text-slate-400`)
- [ ] Zero manual dark mode classes (`dark:bg-black`, `dark:text-white`)
- [ ] Typography uses semantic tokens (`text-heading-1`, `text-body`)
- [ ] Forms use centralized components (`AuthInput`, `AuthButton`)
- [ ] Semantic HTML matches visual hierarchy (`h1` uses `text-heading-1`)
- [ ] Animations are specific (`transition-colors`, not `transition-all`)
- [ ] Icons use centralized components (`<MailIcon />`)
- [ ] Spacing uses semantic tokens (`p-card-padding`, `gap-element-gap`)

---

## 📚 Quick Reference

### Component Migration Checklist

```tsx
// ✅ Fully Compliant Component Example
import { AuthInput, AuthButton, AuthAlert } from '@/components/auth';
import { MailIcon, LockIcon } from '@/components/icons/auth';

export function LoginForm() {
  return (
    <form className="space-y-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="auth-icon-container mb-6">
          <LockIcon className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-heading-2 text-foreground mb-2">
          Sign In
        </h1>
        <p className="text-body-small text-muted-foreground">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      {/* Form Fields */}
      <AuthInput
        type="email"
        name="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<MailIcon className="h-5 w-5" />}
      />

      <AuthInput
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<LockIcon className="h-5 w-5" />}
        showPasswordToggle
      />

      {/* Error Alert */}
      {error && (
        <AuthAlert variant="error">
          {error}
        </AuthAlert>
      )}

      {/* Submit Button */}
      <AuthButton
        type="submit"
        variant="primary"
        loading={loading}
      >
        Sign In
      </AuthButton>
    </form>
  );
}
```

---

---

## 📊 CURRENT SYSTEM STATUS (Audit: November 2, 2025)

### ✅ What's Working (Keep & Reuse)

**Multi-Theme System (3 Themes)**
- ✅ Dark Theme (Default) - Google AI Studio aligned
- ✅ Light Theme - Neumorphic style
- ✅ Purple Theme - Premium brand variant
- ✅ ThemeProvider with React Context + localStorage persistence
- ✅ 200ms smooth transitions between themes
- ✅ All themes use identical variable names (only values differ)

**CSS Variables (globals.css)**
- ✅ Complete color system: `--color-background`, `--color-foreground`, etc.
- ✅ Neumorphic shadows: `--shadow-outset-*`, `--shadow-inset-*`
- ✅ Spacing system: `--spacing-*` (xs, sm, md, lg, xl, 2xl, 3xl)
- ✅ Animation system: `--duration-*`, `--ease-*`
- ✅ Z-index scale: `--z-base`, `--z-modal`, `--z-tooltip`

**Tailwind Integration**
- ✅ All CSS variables mapped to Tailwind utilities
- ✅ Support for opacity variants: `bg-surface/50`, `text-foreground/80`
- ✅ Responsive spacing utilities
- ✅ Status colors: `bg-success`, `bg-error`, `bg-warning`, `bg-info`

**Component Classes (globals.css) - Updated Nov 5, 2025**
- ✅ `.form-input` - Form input fields with neumorphic inset style
- ✅ `.form-select` - Dropdown select fields with neumorphic style
- ✅ Semantic tokens: `bg-surface`, `bg-background`, `text-foreground`, `border-border`
- ✅ Neumorphic shadows: `shadow-neu-outset` (raised), `shadow-neu-inset` (pressed)
- ✅ Status colors: `bg-success`, `bg-error`, `bg-warning`, `bg-info`
- ❌ `.theme-card` - REMOVED (use inline: `bg-surface shadow-neu-outset rounded-lg`)
- ❌ `.neu-card` - REMOVED (use inline: `bg-surface shadow-neu-outset rounded-lg`)
- ❌ `.neu-btn-*` - REMOVED (use `<Button>` component from `@/components/ui/button`)

**Centralized Components**
- ✅ `Button` component (`@/components/ui/button`) - Primary, Secondary, Ghost variants
- ✅ `AuthInput` component (`@/components/auth`) - Auth-specific inputs with icons
- ✅ `ThemeSwitcher` component - Icon-only theme toggle (Dark/Light/Purple)

---

### ❌ Current Violations (Must Fix)

**Critical Issues (P0) - Block all new work:**

1. **Hardcoded Colors (100+ instances)**
   ```tsx
   // Found in: 10+ components
   bg-slate-50/50 dark:bg-slate-800/50
   text-slate-900 dark:text-white
   border-gray-200 dark:border-slate-700
   ```
   **Files:** `DetailedQuoteAuthModal.tsx`, `GuestBottomNavBar.tsx`, `CountdownTimer.tsx`, `Hero.tsx`, etc.

2. **Dark Mode Classes (80+ instances)**
   ```tsx
   // Breaks theme-agnostic principle
   dark:bg-black
   dark:text-white
   dark:border-slate-700
   ```
   **Impact:** Purple theme doesn't work correctly

3. **Native Buttons (50+ instances)**
   ```tsx
   // Not using centralized Button component
   <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3">
   ```
   **Impact:** Inconsistent button styling across components

**High Priority Issues (P1):**

4. **Raw Tailwind Typography (50+ instances)**
   ```tsx
   text-2xl font-bold
   text-sm font-medium
   text-xs
   ```
   **Impact:** No responsive scaling, inconsistent hierarchy

5. **Inline SVG Icons (20+ instances)**
   ```tsx
   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400">...</svg>
   ```
   **Impact:** Code duplication, inconsistent sizing

6. **Custom Input Classes (5+ instances)**
   ```tsx
   const baseInputClasses = "w-full bg-gray-100 dark:bg-slate-900 border...";
   ```
   **Impact:** Duplicate code, not using centralized `.neu-input`

---

### 📈 Migration Progress

**Completed Components (100% Compliant):**
- ✅ `InstallerSignInModal.tsx` - SOT reference for modals
- ✅ `HomeownerSignInModal.tsx` - All semantic tokens, embossed inputs
- ✅ `InstallerSignupModal.tsx` - Complete neumorphic design
- ✅ `HomeownerSignupModal.tsx` - Reduced fields, semantic tokens
- ✅ `TopBar.tsx` - Neumorphic shadows reference
- ✅ `HeaderMenu.tsx` - Button component reference

**Pending Components (Need Migration):**
- ⏳ `DetailedQuoteAuthModal.tsx` (92 violations)
- ⏳ `GuestBottomNavBar.tsx` (8 violations)
- ⏳ `CountdownTimer.tsx` (12 violations)
- ⏳ `Hero.tsx` (4 violations)
- ⏳ `InstantQuoteForm.tsx` (40+ violations)
- ⏳ All dashboard pages (15+ violations each)

**Total Technical Debt:**
- ~285 violations across codebase
- Estimated 15-20 hours to fix all
- Priority: P0 violations first (colors + dark mode)

---

### 🎯 Next Steps

**Immediate Actions (This Week):**
1. Fix P0 violations in top 5 components
2. Update all buttons to use Button component
3. Remove all `dark:` classes (except globals.css)
4. Verify zero violations in completed components

**Short-term (Next 2 Weeks):**
1. Migrate all auth components (100% semantic)
2. Migrate all form components (use `.neu-input`)
3. Replace all inline SVGs with centralized icons
4. Update typography to semantic tokens

**Long-term (Next Month):**
1. Create Storybook documentation
2. Add component visual regression tests
3. Create migration automation scripts
4. Establish pre-commit hooks for violation prevention

---

## 🎓 Resources

### Documentation Files

1. **FORM-DESIGN-STANDARD-SOT.md** - Form component patterns
2. **AUTH-COMPONENTS-AUDIT.md** - Auth component violations
3. **AUTH-MIGRATION-PROGRESS.md** - Migration tracking
4. **COMPLETED-FORM-IMPROVEMENTS.md** - Recent improvements
5. **BUTTON-AUDIT-COMPLETE.md** - Complete button component audit (Added Nov 8, 2025)

### Design Token Files

- `src/design-tokens/index.ts` - Main export
- `src/design-tokens/semantic/colors.ts` - Color tokens
- `src/design-tokens/semantic/typography.ts` - Typography tokens
- `src/design-tokens/semantic/spacing.ts` - Spacing tokens
- `src/design-tokens/semantic/shadows.ts` - Shadow tokens
- `src/design-tokens/semantic/animations.ts` - Animation tokens

### Component Library

- `src/components/auth/` - Centralized auth components
- `src/components/icons/auth/` - Centralized icons
- `src/app/globals.css` - CSS classes (lines 1-1572)
- `src/components/ui/button.tsx` - Button component with 6 variants (Added Nov 8, 2025)
- `src/components/admin/` - Admin dashboard components

### Configuration

- `tailwind.config.js` - Tailwind setup with design tokens
- `tsconfig.json` - TypeScript config

---

## 📚 Component Library Development Process (Added Nov 8, 2025)

### Overview
Component Library documentation (e.g., `/admin/components`) must be built from **comprehensive audits**, not assumed patterns. This prevents fake classes, inaccurate usage counts, and outdated documentation.

### MANDATORY 5-STEP WORKFLOW

#### STEP 1: Audit globals.css (ALL 1572 lines)
```powershell
code src\app\globals.css

# IDENTIFY:
# - @layer components classes (form-input, form-select, theme-card, detail-card, etc.)
# - Custom semantic classes (dashboard-*, toggle-*, slider-*, etc.)
# - Neumorphic shadow definitions (--shadow-neu-outset, --shadow-neu-inset)
# - Custom dashboard classes (dashboard-header__action-btn, dashboard-collapse-btn, etc.)

# DOCUMENT: Class name, purpose, usage pattern, defined location
```

#### STEP 2: Audit Component Files (Button, Badge, Card, Form, etc.)
```powershell
code src\components\ui\button.tsx

# IDENTIFY:
# - Component variants (e.g., Button has 6: primary, secondary, ghost, outline, minimal, destructive)
# - Exact className strings for each variant
# - Base classes applied to all variants
# - Props interface (variant, withArrow, etc.)

# DOCUMENT: Component name, variant names, exact classNames, props, usage
```

#### STEP 3: Grep Codebase for Real Usage Patterns
```powershell
# Find button patterns
Select-String -Path "src\**\*.tsx" -Pattern "className.*button|className.*btn" | Select-Object -First 50

# Count form pattern usage
Select-String -Path "src\**\*.tsx" -Pattern "form-input|form-select" | Measure-Object

# Count card pattern usage
Select-String -Path "src\**\*.tsx" -Pattern "theme-card|detail-card" | Measure-Object

# Find dashboard action buttons
Select-String -Path "src\**\*.tsx" -Pattern "dashboard-header__action-btn|dashboard-collapse-btn"

# Find raw Tailwind button patterns (not using Button component)
Select-String -Path "src\**\*.tsx" -Pattern "px-6 py-3 rounded-full.*shadow-neu"
```

#### STEP 4: Create Comprehensive Audit Document
**Template: COMPONENT-AUDIT-COMPLETE.md**

```markdown
# [COMPONENT TYPE] AUDIT - COMPLETE
**Date**: [Date]
**Auditor**: [Name]
**Source**: globals.css + src/components/ui/[component].tsx + codebase scan

---

## REAL [COMPONENT] COMPONENT (src/components/ui/[component].tsx)

### Component Props:
- `variant`: 'primary' | 'secondary' | etc.
- Other props...

### Base Classes (ALL [components]):
[Exact base className string from component file]

### Variant Classes:

#### 1. **[Variant Name]** (`variant="[name]"`)
**Classes**:
```
[Exact className string from component file]
```
**Usage**: [Describe usage]
**Used In**: [Real file paths from grep results]

[Repeat for each variant]

---

## CUSTOM CLASSES (globals.css)

### [N]. **[Custom Class Name]** (`.custom-class-name`)
**Classes**: CUSTOM CLASS (defined in globals.css)
```css
[Exact CSS from globals.css]
```
**Usage**: [Describe usage]
**Used In**: [Real file paths from codebase]

---

## RAW TAILWIND PATTERNS (No Component)

### [N]. **[Pattern Name]**
**Classes**:
```
[Exact className string from real usage in codebase]
```
**Used In**: [Real file paths from grep results]

---

## SUMMARY

### Total [Component] Patterns Found: **[N]**

### Breakdown:
- **Component Variants**: [N] (list variant names)
- **Custom Classes**: [N] (list custom class names)
- **Raw Tailwind Patterns**: [N] (list raw pattern names)

### Key Findings:
1. [Key finding 1]
2. [Key finding 2]
3. [Key finding 3]

---

## RECOMMENDATIONS

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

---

## FILES AUDITED:
- `src/app/globals.css` (lines [start]-[end])
- `src/components/ui/[component].tsx` (lines [start]-[end])
- `src/components/admin/*` (usage audit)
- `src/components/homeowner/*` (usage audit)
- `src/components/installer/*` (usage audit)
```

**CRITICAL RULES FOR AUDIT DOCUMENT**:
- ✅ List EVERY real pattern with: name, exact className, real usage count, real locations
- ❌ NO fake patterns, NO assumed classes, NO made-up examples
- ✅ Document: Component variants, custom classes (globals.css), raw Tailwind patterns
- ✅ Usage counts must match grep count
- ✅ "Used In" must be real file paths from codebase

#### STEP 5: Build Component Library ONLY from Audit Document
```tsx
// ComponentLibraryTable.tsx
const buttonsPatterns: ComponentPattern[] = [
  {
    name: 'Primary Button (variant="primary")', // From audit doc
    description: 'Button component primary variant', // From audit doc
    className: '[EXACT className from Button component file]', // From audit doc
    usageCount: 25, // From grep count in audit
    usedIn: ['Real/File/Path.tsx', 'Another/Real/Path.tsx'], // From audit doc
    example: (
      <button className="[EXACT className from Button component]">
        [Real button text from codebase]
      </button>
    ),
  },
  // Repeat for EVERY pattern in audit document
];
```

**VERIFICATION BEFORE MARKING COMPLETE**:
1. ✅ Every pattern exists in Button component OR globals.css OR codebase (verify with grep)
2. ✅ No fake classNames (check each with `Select-String`)
3. ✅ Usage counts match real grep count from audit
4. ✅ "Used In" locations are real file paths (not assumed)
5. ✅ Example code matches real component usage (not mock examples)
6. ✅ Audit document created and referenced in Component Library

**WHY THIS MATTERS**:
- ❌ Without audit: Fake patterns, wrong classes, outdated docs, user confusion, rework
- ✅ With audit: Real patterns, correct classes, accurate docs, user trust, no rework

**REFERENCE EXAMPLE**: See `BUTTON-AUDIT-COMPLETE.md` for complete audit of all 14 real button patterns (6 Button variants, 4 custom dashboard classes, 4 raw Tailwind patterns).

---

## 📝 Changelog

### November 8, 2025
- Added Component Library Development Process (5-step workflow)
- Added BUTTON-AUDIT-COMPLETE.md to resources
- Updated globals.css line count (1-1572)
- Added Button component to Component Library resources

### November 1, 2025
- Created comprehensive design system SOT
- Documented all violations (285 instances)
- Added migration guidelines
- Defined component standards

### October 30, 2025
- Completed auth component migration (1/6 done)
- Created form design standard
- Enhanced CSS classes with neumorphic effects

---

## ✅ Next Steps

1. **Immediate (P0)**:
   - Migrate InstantQuoteForm.tsx (30+ hardcoded colors)
   - Migrate Hero.tsx (typography + colors)
   - Migrate QuoteOptionsModal.tsx (colors)

2. **Short-term (P1)**:
   - Migrate all remaining auth components (5 pending)
   - Replace raw typography with semantic tokens
   - Centralize all form inputs

3. **Long-term (P2)**:
   - Centralize all icons
   - Add light theme support
   - Create Storybook documentation

---

**End of Design System SOT**
