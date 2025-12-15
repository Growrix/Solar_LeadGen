# Homeowner Dashboard Audit

**File**: `src/app/homeowner/dashboard/page.tsx`  
**Date**: 2025-10-29  
**Task**: T098-T104 (Phase 12 - Week 1)  
**Status**: 🔍 Audit In Progress

---

## 📊 Summary

- **Total Hardcoded Values**: 330
- **Breakdown**:
  - Colors: 166 (50.3%)
  - Spacing: 104 (31.5%)
  - Typography: 24 (7.3%)
  - Border Radius: 28 (8.5%)
  - Shadows: 4 (1.2%)
  - Animations: 4 (1.2%)

- **File Size**: 1,372 lines
- **Migration Complexity**: 🔴 HIGH (large file, many components)
- **Estimated Time**: 3-4 hours

---

## 🎯 Token Mapping Strategy

### 1. Color Replacements (166 issues)

#### Theme Switcher Component (Lines 57-59)
| Hardcoded Value | Design Token | Rationale |
|-----------------|--------------|-----------|
| `bg-gray-100` | `bg-muted` | Muted background for switcher container |
| `dark:bg-slate-800` | (uses dark: prefix from theme) | Already theme-aware via dark: prefix |
| `bg-white` | `bg-background` | Background for active button |
| `dark:bg-slate-700` | (uses dark: prefix from theme) | Already theme-aware via dark: prefix |
| `text-gray-500` | `text-muted-foreground` | Inactive button text |
| `text-slate-900` | `text-foreground` | Hover text for inactive button |
| `dark:text-gray-400` | (uses dark: prefix from theme) | Already theme-aware via dark: prefix |
| `dark:hover:text-white` | (uses dark: prefix from theme) | Already theme-aware via dark: prefix |
| `focus:ring-offset-gray-100` | `focus:ring-offset-background` | Focus ring offset |
| `dark:focus:ring-offset-slate-800` | (uses dark: prefix from theme) | Already theme-aware via dark: prefix |

#### NavItem Component (Line 67)
| Hardcoded Value | Design Token | Rationale |
|-----------------|--------------|-----------|
| `text-slate-500` | `text-muted-foreground` | Inactive nav item text |
| `dark:text-slate-400` | (uses dark: prefix from theme) | Already theme-aware via dark: prefix |
| `bg-gray-200` | `bg-muted/50` | Hover background for nav item |
| `dark:hover:bg-slate-800` | (uses dark: prefix from theme) | Already theme-aware via dark: prefix |

#### Badge Component (Line 73)
| Hardcoded Value | Design Token | Rationale |
|-----------------|--------------|-----------|
| `bg-red-500` | `bg-error` | Error/alert badge background |
| `text-white` | `text-error-foreground` | Error badge text (white on red) |

#### Status Badges (Lines 130-165) - MAJOR REFACTOR NEEDED
These are custom status color variants. Need to map to semantic status tokens:

| Current Pattern | Design Token | Notes |
|-----------------|--------------|-------|
| `bg-slate-100 text-slate-600` | `bg-muted text-muted-foreground` | Neutral/default status |
| `bg-amber-100 text-amber-700` | `bg-warning text-warning-foreground` | Warning status |
| `bg-sky-100 text-sky-700` | `bg-info text-info-foreground` | Info status |
| `bg-emerald-100 text-emerald-700` | `bg-success text-success-foreground` | Success status |
| `bg-indigo-100 text-indigo-700` | `bg-primary/10 text-primary` | Primary status variant |
| `bg-violet-100 text-violet-700` | `bg-secondary/10 text-secondary` | Secondary status variant |
| `bg-teal-100 text-teal-700` | `bg-primary/10 text-primary` | Primary status (teal is brand) |
| `bg-rose-100 text-rose-700` | `bg-error/10 text-error` | Error status |

**Dark Mode Variants**:
- All `dark:bg-*-900/30 dark:text-*-300` patterns → handled by semantic tokens automatically

### 2. Spacing Replacements (104 issues)

| Hardcoded Value | Design Token | Usage Context |
|-----------------|--------------|---------------|
| `p-1` | `p-1` | Keep - primitive spacing |
| `p-1.5` | `p-1.5` | Keep - primitive spacing |
| `px-4` | `px-card-padding-x` | Horizontal padding for nav items |
| `py-2.5` | `py-card-padding-y` | Vertical padding for nav items |
| `space-x-3` | `space-x-3` | Keep - primitive spacing |
| `w-5 h-5` | `w-5 h-5` | Keep - icon sizing (primitive) |
| `rounded-full` | `rounded-full` | Keep - primitive radius for badges |
| `rounded-lg` | `rounded-card` | Card/container rounding |

### 3. Typography Replacements (24 issues)

| Hardcoded Value | Design Token | Usage Context |
|-----------------|--------------|---------------|
| `text-sm` | `text-body-small` | Small body text |
| `text-xs` | `text-caption` | Caption/badge text |
| `font-medium` | `font-medium` | Keep - primitive font weight |
| `font-bold` | `font-bold` | Keep - primitive font weight |

### 4. Border Radius Replacements (28 issues)

| Hardcoded Value | Design Token | Usage Context |
|-----------------|--------------|---------------|
| `rounded-lg` | `rounded-card` | Card/button rounding |
| `rounded-full` | `rounded-full` | Keep - primitive for circular elements |

### 5. Shadow Replacements (4 issues)

| Hardcoded Value | Design Token | Usage Context |
|-----------------|--------------|---------------|
| `shadow-sm` | `shadow-button` | Button elevation |
| `shadow-md` | `shadow-card` | Card elevation |

### 6. Animation Replacements (4 issues)

| Hardcoded Value | Design Token | Usage Context |
|-----------------|--------------|---------------|
| `transition-colors` | `transition-colors` | Keep - primitive transition |
| `duration-200` | `duration-fast` | Fast transition timing |

---

## 🔥 High-Impact Refactorings

### 1. Status Badge System (Priority: HIGH)
**Current Code** (Lines 130-165):
```tsx
const statusConfig = {
  DRAFT: {
    label: 'Draft',
    accent: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    icon: <FileTextIcon />
  },
  PENDING: {
    label: 'Pending Review',
    accent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    icon: <SparklesIcon />
  },
  // ... more statuses
};
```

**Refactored Code**:
```tsx
const statusConfig = {
  DRAFT: {
    label: 'Draft',
    accent: 'bg-muted text-muted-foreground',
    icon: <FileTextIcon />
  },
  PENDING: {
    label: 'Pending Review',
    accent: 'bg-warning/10 text-warning',
    icon: <SparklesIcon />
  },
  ACTIVE: {
    label: 'Active',
    accent: 'bg-info/10 text-info',
    icon: <SparklesIcon />
  },
  PURCHASED: {
    label: 'Purchased',
    accent: 'bg-success/10 text-success',
    icon: <DollarSignIcon />
  },
  ACCEPTED: {
    label: 'Accepted',
    accent: 'bg-success/10 text-success',
    icon: <FileSignatureIcon />
  },
  COMPLETED: {
    label: 'Completed',
    accent: 'bg-success text-success-foreground',
    icon: <TrophyIcon />
  },
  EXPIRED: {
    label: 'Expired',
    accent: 'bg-error/10 text-error',
    icon: <XCircleIcon />
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    accent: 'bg-error/10 text-error',
    icon: <XCircleIcon />
  }
};
```

**Impact**: Removes 48+ hardcoded color values, ensures theme consistency

### 2. ThemeSwitcher Component (Priority: MEDIUM)
**Current Code** (Lines 54-62):
```tsx
<div className="flex items-center p-1 rounded-full bg-gray-100 dark:bg-slate-800">
  <button className={`p-1.5 rounded-full transition-colors duration-200 ... 
    ${theme === opt.name ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'}`}>
```

**Refactored Code**:
```tsx
<div className="flex items-center p-1 rounded-full bg-muted">
  <button className={`p-1.5 rounded-full transition-colors duration-fast ... 
    ${theme === opt.name ? 'bg-background shadow-button' : 'text-muted-foreground hover:text-foreground'}`}>
```

**Impact**: Removes 8+ hardcoded values, automatic theme switching

### 3. NavItem Component (Priority: MEDIUM)
**Current Code** (Line 67):
```tsx
<button className={`... ${isActive ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800'}`}>
```

**Refactored Code**:
```tsx
<button className={`... ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}>
```

**Impact**: Removes 4 hardcoded values, simplifies conditional logic

---

## 📋 Step-by-Step Refactoring Plan

### Phase 1: Preparation (15 min)
- [ ] Read entire file to understand component structure
- [ ] Identify all status badge usages
- [ ] Document component dependencies
- [ ] Create backup branch: `git checkout -b backup/homeowner-dashboard-pre-migration`

### Phase 2: Component-by-Component Migration (90 min)

#### 2.1: ThemeSwitcher Component (15 min)
- [ ] Replace `bg-gray-100` → `bg-muted`
- [ ] Replace `bg-white` → `bg-background`
- [ ] Replace `text-gray-500` → `text-muted-foreground`
- [ ] Replace `text-slate-900` → `text-foreground`
- [ ] Replace `duration-200` → `duration-fast`
- [ ] Remove all `dark:` variants (handled by semantic tokens)
- [ ] Test in browser: Light/Dark themes

#### 2.2: NavItem Component (10 min)
- [ ] Replace `text-slate-500` → `text-muted-foreground`
- [ ] Replace `bg-gray-200` → `bg-muted/50`
- [ ] Remove `dark:` variants
- [ ] Test active/inactive states

#### 2.3: Badge Component (5 min)
- [ ] Replace `bg-red-500` → `bg-error`
- [ ] Replace `text-white` → `text-error-foreground`

#### 2.4: Status Config Object (30 min) - MAJOR REFACTOR
- [ ] Create new status mapping using semantic tokens
- [ ] Update all status badge references
- [ ] Test all status variants:
  - DRAFT → `bg-muted text-muted-foreground`
  - PENDING → `bg-warning/10 text-warning`
  - ACTIVE → `bg-info/10 text-info`
  - PURCHASED → `bg-success/10 text-success`
  - ACCEPTED → `bg-success/10 text-success`
  - COMPLETED → `bg-success text-success-foreground`
  - EXPIRED → `bg-error/10 text-error`
  - WITHDRAWN → `bg-error/10 text-error`
- [ ] Verify all dark mode variants render correctly

#### 2.5: Spacing & Layout (20 min)
- [ ] Replace `px-4` → `px-card-padding-x` in nav items
- [ ] Replace `py-2.5` → `py-card-padding-y` in nav items
- [ ] Replace `rounded-lg` → `rounded-card` in cards/containers
- [ ] Keep primitive spacing values (p-1, space-x-3, etc.)

#### 2.6: Global Pass - Remaining Values (10 min)
- [ ] Search for remaining hardcoded colors: `bg-`, `text-`, `border-`
- [ ] Replace any missed values with semantic tokens
- [ ] Verify no hex codes remaining

### Phase 3: Verification (60 min)

#### 3.1: Browser Testing (30 min)
- [ ] Start dev server: `npm run dev`
- [ ] Test Light theme:
  - [ ] All components render correctly
  - [ ] Status badges show correct colors
  - [ ] Nav items highlight correctly
  - [ ] Theme switcher works
- [ ] Test Dark theme:
  - [ ] Colors adapt automatically
  - [ ] Contrast is readable
  - [ ] No visual regressions
- [ ] Test System theme:
  - [ ] Respects OS preference
  - [ ] Switches dynamically

#### 3.2: Responsive Testing (15 min)
- [ ] Mobile (320px): Layout not broken, text readable
- [ ] Tablet (768px): Proper spacing, no overflow
- [ ] Desktop (1024px): Full layout works

#### 3.3: Interactive Testing (15 min)
- [ ] Click all nav items → verify active state changes
- [ ] Toggle theme switcher → verify smooth transitions
- [ ] Hover buttons → verify hover states work
- [ ] Test all status badges → verify colors correct

### Phase 4: Storybook Story (30 min)
- [ ] Create `stories/pages/HomeownerDashboard.stories.tsx`
- [ ] Include theme switcher control
- [ ] Show all status badge variants
- [ ] Show active/inactive nav states
- [ ] Document token usage in story

### Phase 5: Chromatic & QA (30 min)
- [ ] Run Chromatic: `npm run chromatic`
- [ ] Review visual diffs
- [ ] Accept intentional changes
- [ ] Fix any unintended regressions
- [ ] Complete manual QA checklist

### Phase 6: Commit (15 min)
- [ ] Review all changes: `git diff`
- [ ] Stage files: `git add src/app/homeowner/dashboard/page.tsx stories/pages/HomeownerDashboard.stories.tsx`
- [ ] Create commit with stats:
  ```
  Phase 12 (T098-T104): Migrate Homeowner Dashboard to design tokens
  
  - Replaced 330 hardcoded values with semantic tokens
  - Refactored status badge system (8 variants → theme-aware)
  - Migrated ThemeSwitcher, NavItem, Badge components
  - Removed all dark: mode manual overrides
  - Added Storybook story with theme switcher
  
  Before: 166 colors, 104 spacing, 24 typography, 28 radius, 4 shadows, 4 animations
  After: 0 hardcoded values, 100% semantic tokens
  
  Testing: ✅ Light/Dark/System themes, ✅ 320px/768px/1024px breakpoints, ✅ Chromatic passed
  ```
- [ ] Push to feature branch
- [ ] Update `DOC/gitstatus.md`

---

## ✅ Completion Checklist

### Code Quality
- [ ] TypeScript compiles: `npx tsc --noEmit` (0 errors)
- [ ] Build passes: `npm run build` (0 errors)
- [ ] No eslint errors: `npm run lint`
- [ ] All imports valid
- [ ] No unused variables

### Visual Regression
- [ ] Chromatic baseline captured
- [ ] Zero unintended visual regressions
- [ ] All themes tested (Light/Dark/System)
- [ ] All breakpoints tested (320px/768px/1024px)

### Manual QA (Per-Task Template)
- [ ] **Visual Verification**: Component renders correctly in browser and Storybook
- [ ] **Theme Testing**: Light/Dark/System themes all work, no contrast issues
- [ ] **Responsive Testing**: Mobile/Tablet/Desktop layouts work, no overflow
- [ ] **Chromatic Verification**: Snapshot captured, no unintended regressions
- [ ] **Token Usage Verification**: No hardcoded colors/spacing/typography

### Documentation
- [ ] Storybook story created with token usage examples
- [ ] Audit document complete (this file)
- [ ] Migration progress dashboard updated
- [ ] `DOC/gitstatus.md` updated

### User Approval
- [ ] Present changes to user (before/after screenshots if needed)
- [ ] Get explicit approval to commit
- [ ] Address any feedback

---

## 📝 Notes & Discoveries

### Patterns Found
- **Status Badge System**: Heavily uses custom color variants (8 different status colors)
- **Theme Switcher**: Custom component with manual dark mode handling
- **Nav Items**: Consistent pattern with active/inactive states

### Challenges Anticipated
1. **Status Config Refactor**: Large object with 8+ status variants, need careful mapping
2. **Dark Mode Removal**: Many `dark:` prefixes to remove (semantic tokens handle this automatically)
3. **File Size**: 1,372 lines - need to be methodical and test frequently

### Time Estimates
- Preparation: 15 min
- Migration: 90 min
- Verification: 60 min
- Storybook: 30 min
- Chromatic/QA: 30 min
- Commit: 15 min
- **Total: ~4 hours**

---

## 🎯 Success Criteria

- ✅ All 330 hardcoded values replaced with semantic tokens
- ✅ Zero visual regressions (Chromatic confirms identical rendering)
- ✅ All themes work (Light/Dark/System)
- ✅ All breakpoints tested (320px/768px/1024px)
- ✅ TypeScript compiles with 0 errors
- ✅ Build succeeds
- ✅ Storybook story created
- ✅ User approval received
- ✅ Committed with detailed message
- ✅ `DOC/gitstatus.md` updated

**When all criteria met → Mark T098-T104 complete ✅**
