# Design System - Source of Truth (SOT)
**Purpose**: Complete reference for the neumorphic design system  
**Date**: November 4, 2025 (Updated - Post Homeowner Dashboard Audit)  
**Status**: Active Standard  
**Theme**: Multi-Theme System (Dark, Light, Purple)

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

```powershell
# Run ALL of these - if ANY return matches, migration is INCOMPLETE

# 1. Hardcoded gray/slate/zinc colors
Select-String -Path "src\app\your-component\*.tsx" -Pattern "text-gray-|text-slate-|text-zinc-|bg-gray-|bg-slate-|bg-zinc-"

# 2. dark: prefixes (themes should use CSS variables, not dark:)
Select-String -Path "src\app\your-component\*.tsx" -Pattern "dark:"

# 3. Hardcoded RGB/RGBA/HEX colors (excluding SVG viewBox/fill)
Select-String -Path "src\app\your-component\*.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" | Where-Object { $_.Line -notmatch "viewBox|fill=" }

# 4. Hardcoded white/black (text-white, bg-white, text-black, bg-black)
Select-String -Path "src\app\your-component\*.tsx" -Pattern "text-white|bg-white|text-black|bg-black"

# Expected result for ALL: 0 matches (or NO OUTPUT)
```

### MANDATORY: Background Color Decision Tree

**Question: What element am I styling?**

```
Is it a STRUCTURAL element (body, main container, sidebar, header)?
├─ YES → Use bg-background (#121212 dark, #E0E5EC light, #2C1D4D purple)
└─ NO → Continue

Is it an ELEVATED element (card, modal, input, button)?
├─ YES → Use bg-surface (#1A1A1A dark, #E8EDF4 light, #3E296C purple)
└─ NO → Use bg-background or bg-transparent

Is it a HOVER state?
├─ YES → Use hover:bg-surface-hover
└─ NO → Done
```

**Examples:**
- ✅ `<body>` → `bg-background` (in globals.css)
- ✅ `<main className="bg-background">` → Structural
- ✅ `<aside className="bg-background">` → Sidebar (structural)
- ✅ `<header className="bg-background">` → Header (structural)
- ✅ `<div className="bg-surface rounded-card">` → Card (elevated)
- ✅ `<input className="bg-surface">` → Input (elevated)
- ✅ `<Button>` → Uses bg-surface internally (elevated)

**Common Mistakes:**
- ❌ `<aside className="bg-surface">` → Wrong! Use bg-background
- ❌ `<header className="bg-surface">` → Wrong! Use bg-background
- ❌ `<div className="bg-background rounded-card">` → Wrong! Cards use bg-surface

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
- [ ] CSS Variables Foundation (12 matches expected)
- [ ] Semantic Classes Catalog (file created)
- [ ] Reference Components Available (all True)
- [ ] Chart Hook Uses CSS Variables (if has charts)
- [ ] Input Classes Properly Separated (no arrow on text inputs)
- [ ] Theme-Card Uses Variables (not hardcoded white)

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
**Container:** `.theme-card` (for modal content)  
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

#### STEP 4: Pre-Migration Prep (Before Touching Code)

**Open These Files:**
1. ✅ `DOC/SEMANTIC-CLASSES-REGISTRY.md` - All available classes
2. ✅ Reference component(s) for your type
3. ✅ `tasks.md` verification commands for this phase
4. ✅ `DESIGN-SYSTEM-SOT.md` (this file) - Component type section

**Document Current State:**
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
├─ YES → Add className="form-input w-full"
└─ NO → Continue to next check

Element is <select>?
├─ YES → Add className="form-select w-full"
└─ NO → Continue to next check

Element is a chart (Bar, Line, Area, etc.)?
├─ YES → Use useChartColors() hook, replace hardcoded colors
└─ NO → Continue to next check

Element has hardcoded color class (bg-gray-*, text-slate-*)?
├─ YES → Replace with semantic token (bg-surface, text-foreground)
└─ NO → Element is OK, move to next

Element is a container (modal, card, panel)?
├─ Modal → Use .theme-card
├─ Data Card → Use .detail-card
├─ Metric Card → Use .metric-card
└─ Simple div → Use bg-surface, rounded-lg

Element is text/label/value?
├─ Cost Label → Use .cost-item-label
├─ Cost Value → Use .cost-item-value
├─ Metric Label → Use .metric-card-label
├─ Metric Value → Use .metric-card-value
└─ Generic → Use text-foreground or text-subtle
```

---

#### STEP 6: Post-Migration Verification (MANDATORY)

**Run ALL verification commands from tasks.md for your phase:**

```powershell
# Example for InstantQuoteForm:

# 1. No hardcoded colors
Select-String -Path "src\components\InstantQuoteForm.tsx" -Pattern "bg-gray|text-gray|bg-slate"
# Expected: 0 matches

# 2. No form-select on text inputs
Select-String -Path "src\components\InstantQuoteForm.tsx" -Pattern '<input.*form-select'
# Expected: 0 matches

# 3. Charts use hook (if has charts)
Select-String -Path "src\components\InstantQuoteForm.tsx" -Pattern "useChartColors"
# Expected: 1+ matches if has charts

# 4. All buttons replaced
Select-String -Path "src\components\InstantQuoteForm.tsx" -Pattern "<button"
# Expected: 0 matches (all should be <Button>)
```

**Visual Tests (MANDATORY for ALL components):**
1. Open in browser
2. Test Dark theme → Screenshot
3. Switch to Light theme → Screenshot
4. Switch to Purple theme → Screenshot
5. Verify:
   - [ ] No hardcoded colors visible
   - [ ] All text readable (good contrast)
   - [ ] Neumorphic shadows visible
   - [ ] No white/black bleed-through

**Runtime Tests:**
1. Open browser console
2. Interact with ALL features
3. Switch themes while component open
4. Expected: 0 errors in console

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
    className="form-input w-full"
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
| Form inputs | Form Pattern | InstallerSignupModal.tsx |
| Charts | Chart Pattern | SavingsChart.tsx |
| Result cards | Card Pattern | See card examples above |
| Modal container | `.theme-card` | HomeownerSignInModal.tsx |

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

## 🔥 CRITICAL: AUTH MODAL MIGRATION LESSONS (Read This First!)

### Pain Points from Auth Modal Migration (November 2, 2025)

**The Struggle:** Auth modal form background colors showed white/wrong colors in light theme despite multiple fix attempts.

**Root Causes Identified:**
1. ❌ **Overcomplicated CSS**: Created `.form-input` class but components used inline classes instead
2. ❌ **Inconsistent Approaches**: Some inputs used `bg-background`, others used `bg-surface`, some used custom classes
3. ❌ **Hardcoded Overrides**: Light theme `.theme-card` was hardcoded to white (`rgb(255, 255, 255)`) instead of using variables
4. ❌ **Partial Updates**: Only fixed 1 of 4 modals initially, creating inconsistency
5. ❌ **Multiple Failed Attempts**: Tried @apply, rgba(), CSS variables directly, creating confusion

**The Final Solution:**
1. ✅ **One Central Class**: `.form-input` in globals.css with embossed style (`shadow-inset-md`)
2. ✅ **One Background Variable**: All modals, inputs, and buttons use `bg-surface` (equals `--color-surface`)
3. ✅ **Theme Consistency**: All 3 themes (Dark, Light, Purple) use same variable structure
4. ✅ **No Hardcoded Values**: Light theme `.theme-card` changed from white to `rgb(var(--color-surface))`
5. ✅ **All Components Updated**: All 4 auth modals updated atomically

### The Universal Rule That Prevents This

**🔴 ONE CLASS, ONE PURPOSE, ONE VARIABLE**

```css
/* ✅ CORRECT - globals.css DEFAULT .theme-card */
.theme-card {
  background: rgb(var(--color-surface));  /* MUST use --color-surface, NOT --color-background-elevated */
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-outset-xl);
}

/* ✅ CORRECT - globals.css .form-input */
.form-input {
  @apply bg-surface border border-border/50 rounded-xl text-foreground transition-all;
  box-shadow: var(--shadow-inset-md) !important;  /* Embossed style */
}

/* ✅ CORRECT - Component usage */
<div className="theme-card p-8">  {/* Modal/card uses theme-card = bg-surface */}
  <input className="form-input w-full pl-11 pr-4 py-3" />  {/* Input uses form-input = bg-surface */}
</div>

/* ❌ WRONG - Using --color-background-elevated */
.theme-card {
  background: rgb(var(--color-background-elevated));  /* WRONG! Will show different color than inputs */
}

/* ❌ WRONG - Mixing approaches */
<input className="w-full bg-surface border border-border/50 rounded-xl..." />  /* Inline classes */
<input className="form-input" />  /* Custom class */
<input className="bg-background ..." />  /* Different variable */
```

**Why This Works:**
- ✅ One source of truth (`.form-input` class)
- ✅ One background color (`bg-surface` = `--color-surface`)
- ✅ **CRITICAL**: `.theme-card` uses SAME variable (`--color-surface`) as inputs
- ✅ All themes inherit automatically (no overrides needed)
- ✅ Embossed style applied consistently (`.shadow-inset-md`)

**🚨 THE ROOT CAUSE OF WHITE BACKGROUNDS:**
- `.theme-card` was using `rgb(var(--color-background-elevated))` (line 554)
- Light theme override tried to fix with `rgb(var(--color-surface))` (line 816)
- BUT default `.theme-card` applied FIRST, so override didn't work
- **FIX**: Change default `.theme-card` to use `--color-surface` ALWAYS

### Mandatory Pre-Migration Checklist (Prevents All Issues)

Before migrating ANY component with forms/inputs:

```bash
# 1. Check if .form-input class exists in globals.css
grep -A 5 "\.form-input {" src/app/globals.css
# Expected: Class definition with bg-surface and shadow-inset-md

# 2. Check if modal/container uses bg-surface or --color-surface
grep -E "(theme-card|modal|container).*background:" src/app/globals.css
# Expected: background: rgb(var(--color-surface)) or bg-surface

# 3. Verify all 3 themes have --color-surface defined
grep --color-surface src/app/globals.css
# Expected: 3 matches (dark, light, purple themes)

# 4. Verify --color-surface equals --color-background-elevated in each theme
# Dark: --color-surface: 26 26 26; --color-background-elevated: 26 26 26;
# Light: --color-surface: 232 237 244; --color-background-elevated: 232 237 244;
# Purple: --color-surface: 62 41 108; --color-background-elevated: 62 41 108;
```

**If ANY check fails → Fix globals.css FIRST before migrating components**

### Migration Pattern (Guaranteed Success)

**Step 1: Verify Central Classes Exist**
```bash
# Check form input class
grep "\.form-input" src/app/globals.css

# Check modal background
grep "theme-card.*background" src/app/globals.css
```

**Step 2: Use Central Classes Only**
```tsx
// ✅ CORRECT - All modals
<div className="theme-card relative w-full max-w-md p-8">
  {/* Modal uses theme-card = bg-surface */}
</div>

// ✅ CORRECT - All inputs
<input className="form-input w-full pl-11 pr-4 py-3" />
{/* Input uses form-input = bg-surface + embossed */}

// ✅ CORRECT - All buttons (already using bg-surface in previous migrations)
<Button variant="primary" className="px-5 py-2">
  {/* Button component uses bg-surface */}
</Button>
```

**Step 3: Test All 3 Themes**
```bash
# Open browser, switch themes
# Dark → Inputs match modal (dark gray #1A1A1A)
# Light → Inputs match modal (light gray #E8EDF4)
# Purple → Inputs match modal (purple #3E296C)
```

**Step 4: Verify Zero Hardcoded Colors**
```bash
# Should return ZERO results
grep -E "bg-(white|gray|slate|zinc)" src/components/YourModal.tsx
grep -E "rgb\(255, 255, 255\)" src/components/YourModal.tsx
grep -E "rgba\(" src/components/YourModal.tsx
```

### Anti-Patterns That Created the Problem

❌ **DON'T DO THIS:**
```tsx
// ❌ Creating custom class but not using it
// globals.css has .form-input
<input className="w-full bg-background border border-border/50..." />

// ❌ Using different background variables
<div className="bg-background">  {/* Modal */}
  <input className="bg-surface" />  {/* Input */}
</div>

// ❌ Hardcoding theme-specific values
:root.theme-light .theme-card {
  background: rgb(255, 255, 255); /* Hardcoded white */
}

// ❌ Updating only some components
// Fixed HomeownerSignInModal
// Forgot InstallerSignInModal
```

✅ **DO THIS:**
```tsx
// ✅ Use central class everywhere
<input className="form-input w-full pl-11 pr-4 py-3" />

// ✅ Use same variable for modal and inputs
<div className="theme-card">  {/* Uses --color-surface */}
  <input className="form-input" />  {/* Uses --color-surface */}
</div>

// ✅ Use variables, not hardcoded values
:root.theme-light .theme-card {
  background: rgb(var(--color-surface));
}

// ✅ Update ALL related components atomically
// Fixed: HomeownerSignInModal
// Fixed: InstallerSignInModal
// Fixed: HomeownerSignupModal
// Fixed: InstallerSignupModal
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

// Normal action buttons - ALWAYS use variant="secondary"
<Button variant="secondary" onClick={handleClick}>
  Save Changes
</Button>

// With semantic colors for status
<Button variant="secondary" className="bg-success text-success-foreground">
  Approve
</Button>

<Button variant="secondary" className="bg-error text-error-foreground">
  Reject
</Button>

<Button variant="secondary" className="bg-info text-info-foreground">
  Save Price
</Button>

<Button variant="secondary" className="bg-warning text-warning-foreground">
  Resell Lead
</Button>

// With disabled state
<Button 
  variant="secondary" 
  disabled={loading}
  className="bg-info text-info-foreground"
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

#### Status Color Classes (Combine with variant="secondary")

Use these semantic color classes for status-based buttons:

- **Success/Approve**: `bg-success text-success-foreground`
- **Error/Reject**: `bg-error text-error-foreground`
- **Info/Save**: `bg-info text-info-foreground`
- **Warning/Resell**: `bg-warning text-warning-foreground`
- **Muted/Cancel**: `bg-muted text-muted-foreground`
- **Accent**: `bg-accent text-white`

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

#### Theme Card (Alias for neu-card)

```css
.theme-card {
  @apply neu-card; /* Same as neu-card */
}
```

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
| Cards | `.neu-card` or `.theme-card` | globals.css | Standard card pattern |
| Icon Container | `.auth-icon-container` | globals.css | Neumorphic icon wrapper |
| Alerts | `.neu-alert-error\|success\|warning\|info` | globals.css | Status alerts |
| Modal | `.theme-card` + backdrop | globals.css | Modal container |

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

**Component Classes (globals.css)**
- ✅ `.neu-input` - Neumorphic input fields
- ✅ `.neu-card` / `.theme-card` - Card containers
- ✅ `.auth-icon-container` - Icon wrappers (80x80px)
- ✅ `.neu-alert-error/success/warning/info` - Status alerts
- ✅ `.neu-btn-primary/secondary/link` - Button styles (legacy, prefer Button component)

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
- `src/app/globals.css` - CSS classes (lines 1-921)

### Configuration

- `tailwind.config.js` - Tailwind setup with design tokens
- `tsconfig.json` - TypeScript config

---

## 📝 Changelog

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
