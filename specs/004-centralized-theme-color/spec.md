# Feature Specification: Centralized Design Token System (Colors, Typography, Spacing & UI)

**Feature Branch**: `004-centralized-theme-color`  
**Created**: January 27, 2025  
**Last Updated**: January 28, 2025 (FINALIZED - Version 2.1)  
**Status**: Ready for Implementation  
**Project Type**: 🔄 **REDESIGN/REFACTORING** (Existing Site - Not New Build)

---

## 🚨 CRITICAL: Project Context

### This is a REDESIGN Project, NOT a New Site

**What This Means**:
- ✅ **Existing Application**: Full application already built and running (50+ pages, 100+ components)
- ✅ **Existing Codebase**: 450+ hardcoded design values scattered across components
- ✅ **Users in Production**: Real users actively using the application
- ✅ **No Breaking Changes**: Must maintain functionality while improving design system
- ❌ **NOT Starting Fresh**: Cannot rebuild from scratch or change fundamental architecture

**What We're Doing**:
- **Centralize Design Tokens**: Extract hardcoded values → Create centralized token files
- **Page-by-Page Refactoring**: Systematically migrate each page to use new design system
- **Component-by-Component**: Replace hardcoded classes with centralized token-based classes
- **Validate Everything**: Audit before touching, test after changing, validate before committing
- **Zero "Hope for the Best"**: Visual regression testing mandatory for every change

**Why This Happened**:
- Original development didn't follow design system principles
- Hardcoded values proliferated across codebase (200 colors, 150 font sizes, 100 spacing values)
- Now revalidating and standardizing everything to industry standards

**Scope**: Colors, Typography, Spacing, Shadows, Animations, Border Radius - **Design System ONLY** (not functional changes)

---

## 🎯 Development Workflow Integration (UI-First, Spec-Driven)

**This feature follows the mandatory three-phase workflow** (as defined in `.specify/memory/constitution.md`):

### Phase 1: UI/UX First (MANDATORY)
- **Goal**: Build centralized design token files and a shadcn-compatible CSS variable layer; validate in isolation with Storybook
- **Deliverables**:
  - **Centralized Token Files**: `colors.ts`, `typography.ts`, `spacing.ts`, `shadows.ts`, `animations.ts`, `borders.ts` (TypeScript semantic tokens)
  - **CSS Variable Layer**: Define shadcn-compatible variables in `src/app/globals.css` `:root` (`--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--destructive-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, and `--radius`).
  - **Tailwind Mapping**: Map variables to utilities in `tailwind.config.js` using `hsl(var(--token))` where available; keep existing `theme.extend` mapping from TypeScript tokens for backward compatibility.
  - **Storybook Setup**: Import global CSS in `.storybook/preview.ts` and provide a theme toolbar/decorator.
  - **Sample Page Refactoring**: Pick 2–3 representative pages, audit, refactor, validate.
  - **Documentation**: Token usage guide with before/after examples.
  - **Theme Scope (One-Theme-First)**: Maintain the Light theme only for now; prepare but do not ship Dark/Brand overrides (they will be CSS variable overrides under `[data-theme]`).
- **Approval Gate**: Stakeholder reviews token system + sample pages and approves approach
- **Tools**: TypeScript, Tailwind CSS, Storybook, Chromatic/Percy for visual regression
- **Duration**: Week 1 (40 hours)
- **Output**: Centralized token system + proven refactoring methodology

**🔍 Phase 1 Includes MANDATORY Pre-Migration Audit**:
- Current state documentation (what exists, what's hardcoded)
- Token mapping strategy (which hardcoded values map to which tokens)
- Risk assessment (which pages are highest risk to refactor)
- Test plan (how to validate each page after refactoring)

### Phase 2: Spec Alignment (MANDATORY)
- **Goal**: Update all SpecKit files before backend integration
- **SpecKit Updates**:
  - ✅ `spec.md` (this file) - COMPLETE
  - ⏳ `tasks.md` - Update with real-time task progress (Tier 1: 30s updates)
  - ⏳ `changelog.md` - Daily decision log (Tier 2: 2 min/day)
  - ⏳ `execution-plan.md` - Weekly timeline updates (Tier 3: 30 min/week)
- **Approval Gate**: All SpecKit files reflect current UI implementation state
- **Tools**: Markdown editor, SpecKit three-tier update system
- **Duration**: 1 hour before backend work begins
- **Output**: Specs, tasks, changelog, execution plan all aligned with UI reality

### Phase 3: Backend Implementation (AFTER UI Approved)
- **Goal**: Systematically migrate existing pages/components to use centralized design tokens
- **Approach**: **PAGE-BY-PAGE, MODAL-BY-MODAL** (not bulk refactoring)
- **Deliverables**:
  - **Week 2**: High-traffic pages (Dashboard, Homepage, Lead Forms) - 10-15 pages
  - **Week 3**: Secondary pages (Settings, Profile, Reports) + Critical modals - 15-20 pages
  - **Week 4**: Remaining pages + Edge cases + Final QA - 10-15 pages
  - **Total**: 40-50 pages/modals migrated with zero functional changes
- **Per-Page Workflow** (MANDATORY):
  1. **Audit Page**: Document current hardcoded values (colors, fonts, spacing)
  2. **Create Migration Plan**: Map hardcoded → token replacements
  3. **Refactor Components**: Replace hardcoded classes with token-based classes
  4. **Visual Testing**: Storybook stories + Chromatic visual regression
  5. **Manual QA**: Test all themes, states, breakpoints (checklist)
  6. **Production Validation**: Deploy to staging, smoke test, rollback plan ready
  7. **Commit & Document**: Clear commit message + changelog entry
- **Approval Gate**: Each page passes visual regression + manual QA before next page
- **Tools**: TypeScript, Tailwind CSS, Storybook, Chromatic, Git
- **Duration**: Weeks 2-4 (120 hours)
- **Output**: Fully migrated application with <10 hardcoded design values remaining

**🔍 Zero "Hope for the Best" Protocol**:
- **NEVER** refactor multiple pages simultaneously
- **ALWAYS** audit page before touching code
- **ALWAYS** test in Storybook before testing in real app
- **ALWAYS** complete QA checklist before commit
- **ALWAYS** have rollback plan (git revert ready)

**Workflow Rule**: UI → Spec Update → Backend → Never Backend First

---

## Shadcn/UI Alignment

- Components must use Tailwind utilities that resolve to CSS variables, e.g., `bg-primary`, `text-foreground`, `border-input`, and `ring-2 ring-ring` for focus states.
- No hardcoded palette classes (e.g., `bg-blue-500`) or hex values in component code.
- Focus states must use the `--ring` variable via Tailwind ring utilities.
- The theming layer uses CSS variables for shadcn compatibility and coexists with our TypeScript semantic tokens during migration.

---

## 📄 Page-by-Page Migration Strategy (CRITICAL)

**This section defines the MANDATORY workflow for migrating existing pages/modals to the new design system.**

### Why Page-by-Page (Not Bulk Refactoring)?

**Problem with Bulk Approach**:
- ❌ Refactor 20 pages at once → 200+ visual bugs to debug
- ❌ Hard to isolate which change broke what
- ❌ Rollback requires reverting weeks of work
- ❌ QA overwhelmed with testing scope

**Benefits of Page-by-Page**:
- ✅ Refactor 1 page → 5-10 visual issues max (manageable)
- ✅ Easy to isolate and fix issues immediately
- ✅ Rollback affects only 1 page (low risk)
- ✅ QA can thoroughly test each page
- ✅ Continuous delivery (ship improvements incrementally)

---

### Per-Page Migration Workflow (7 Steps - MANDATORY)

**Time per page**: 2-4 hours (depending on complexity)  
**Pages per day**: 2-3 pages (sustainable pace)  
**Total**: 40-50 pages in 3 weeks

#### Step 1: Page Audit (30-45 minutes)

**Goal**: Understand current state before touching any code.

**Audit Checklist**:
- [ ] Open page in all 3 themes (Light/Dark/System) - screenshot each
- [ ] Document all interactive elements (buttons, forms, modals, tooltips, dropdowns)
- [ ] Identify all hardcoded values:
  - [ ] Colors: `bg-teal-600`, `text-gray-900`, hex codes `#0d9488`
  - [ ] Typography: `text-sm`, `text-lg`, `font-medium`, `font-bold`
  - [ ] Spacing: `p-4`, `m-6`, `gap-3`, `space-y-4`
  - [ ] Shadows: `shadow-lg`, `shadow-md`, inline shadow styles
  - [ ] Border Radius: `rounded-lg`, `rounded-xl`, `rounded-full`
  - [ ] Animations: Custom animations, transition classes
- [ ] Count total hardcoded instances (target reduction: 80-90%)
- [ ] Note any custom/unique styling that might need special handling
- [ ] Identify dependencies (shared components used on this page)

**Output**: Audit document (e.g., `specs/004-centralized-theme-color/audits/dashboard-audit.md`)

**Example Audit Template**:
```markdown
# Page Audit: Dashboard

**Page Path**: `/dashboard`  
**Complexity**: High (15 components, 3 modals, 5 charts)  
**Audit Date**: 2025-01-28

## Current State (Before Migration)

### Hardcoded Colors (23 instances)
- Primary actions: `bg-teal-600` (8 instances) → `bg-primary`
- Status badges: `bg-green-500`, `bg-yellow-500`, `bg-red-500` (12 instances) → `bg-success`, `bg-warning`, `bg-error`
- Text colors: `text-gray-900`, `text-gray-600` (3 instances) → `text-foreground`, `text-muted`

### Hardcoded Typography (15 instances)
- Headings: `text-2xl font-bold` (3 instances) → `text-heading-1`
- Body text: `text-sm` (8 instances) → `text-body`
- Captions: `text-xs text-gray-500` (4 instances) → `text-caption`

### Hardcoded Spacing (18 instances)
- Card padding: `p-6` (5 instances) → `p-card-padding`
- Form gaps: `space-y-4` (6 instances) → `space-y-form-gap`
- Section margins: `mt-8` (7 instances) → `mt-section-margin`

### Custom Styling (Needs Special Handling)
- Chart tooltips with inline styles (need Recharts token integration)
- Modal backdrop blur (glassmorphism - needs theme-aware handling)

## Migration Plan
1. Replace colors (30 min)
2. Replace typography (20 min)
3. Replace spacing (20 min)
4. Handle custom styling (30 min)
5. Visual testing (30 min)
6. Manual QA (30 min)

**Estimated Time**: 3 hours  
**Risk Level**: Medium (charts need special attention)
```

---

#### Step 2: Create Token Mapping (15 minutes)

**Goal**: Define exact replacements before writing code.

**Mapping Template**:
```typescript
// Token Mapping for Dashboard Page

// COLORS
'bg-teal-600' → 'bg-primary'
'bg-teal-700' → 'bg-primary-dark'
'hover:bg-teal-700' → 'hover:bg-primary-hover'
'bg-green-500' → 'bg-success'
'text-gray-900' → 'text-foreground'
'text-gray-600' → 'text-muted'

// TYPOGRAPHY
'text-2xl font-bold' → 'text-heading-1'
'text-xl font-semibold' → 'text-heading-2'
'text-sm' → 'text-body'
'text-xs text-gray-500' → 'text-caption text-muted'

// SPACING
'p-6' → 'p-card-padding' or 'p-desktop-lg'
'space-y-4' → 'space-y-form-gap'
'mt-8' → 'mt-section-margin'
'gap-3' → 'gap-mobile-md lg:gap-desktop-md'

// SHADOWS
'shadow-lg' → 'shadow-card'
'shadow-xl' → 'shadow-modal'

// BORDER RADIUS
'rounded-lg' → 'rounded-card'
'rounded-full' → 'rounded-full' (keep as-is)
```

**Output**: Token mapping document (reference during refactoring)

---

#### Step 3: Refactor Page Components (45-90 minutes)

**Goal**: Replace hardcoded values with token-based classes.

**Refactoring Rules**:
- **ONE component at a time** (not entire page at once)
- **Test immediately** after each component (don't batch)
- **Use find-and-replace carefully** (review each replacement)
- **Preserve functionality** (no logic changes, only styling)

**Example Refactoring**:

**Before** (Hardcoded):
```tsx
<div className="bg-teal-600 text-white p-6 rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
  <p className="text-sm text-gray-100">Welcome back!</p>
  <button className="bg-teal-700 hover:bg-teal-800 px-4 py-2 rounded-md">
    View Details
  </button>
</div>
```

**After** (Token-Based):
```tsx
<div className="bg-primary text-white p-card-padding rounded-card shadow-card">
  <h2 className="text-heading-1 mb-heading-margin">Dashboard</h2>
  <p className="text-body text-white/90">Welcome back!</p>
  <button className="bg-primary-dark hover:bg-primary-darker px-button-x py-button-y rounded-button">
    View Details
  </button>
</div>
```

**Refactoring Checklist (Per Component)**:
- [ ] Replace all color classes with semantic tokens
- [ ] Replace all typography classes with semantic tokens
- [ ] Replace all spacing classes with semantic/grid tokens
- [ ] Replace all shadow classes with elevation tokens
- [ ] Replace all border radius classes with radius tokens
- [ ] Remove any inline styles (convert to token-based classes)
- [ ] Save file and verify TypeScript compiles (no errors)

---

#### Step 4: Visual Testing in Storybook (20-30 minutes)

**Goal**: Catch visual regressions before testing in real app.

**Storybook Testing Workflow**:

1. **Create/Update Story**:
   ```tsx
   // DashboardPage.stories.tsx
   import type { Meta, StoryObj } from '@storybook/react';
   import { DashboardPage } from './DashboardPage';

   const meta: Meta<typeof DashboardPage> = {
     title: 'Pages/Dashboard',
     component: DashboardPage,
     parameters: {
       layout: 'fullscreen',
     },
   };

   export default meta;
   type Story = StoryObj<typeof DashboardPage>;

   export const LightTheme: Story = {};

   export const DarkTheme: Story = {
     parameters: {
       theme: 'dark',
     },
   };

   export const MobileView: Story = {
     parameters: {
       viewport: { defaultViewport: 'mobile1' },
     },
   };
   ```

2. **Visual Inspection**:
   - [ ] Open Storybook (`npm run storybook`)
   - [ ] View page in all 3 themes (Light/Dark/System)
   - [ ] View page at all breakpoints (320px, 375px, 768px, 1024px, 1440px)
   - [ ] Test all interactive states (hover, focus, active, disabled)
   - [ ] Compare with "Before" screenshots from audit

3. **Run Visual Regression Tests**:
   ```bash
   npm run chromatic  # Or Percy/Loki
   ```
   - [ ] Review visual diffs
   - [ ] Approve intentional changes
   - [ ] Fix unintended regressions immediately

**If ANY visual regression found**: STOP, fix immediately, re-test before proceeding.

---

#### Step 5: Manual QA Checklist (20-30 minutes)

**Goal**: Verify page works correctly in real application context.

**QA Checklist Template**:
```markdown
# QA Checklist: Dashboard Page

**Page**: `/dashboard`  
**Tester**: [Your Name]  
**Date**: 2025-01-28

## Theme Switching
- [ ] Light theme: All elements display correctly
- [ ] Dark theme: All elements display correctly
- [ ] System theme: Respects OS preference
- [ ] Theme switch is instant (no flicker)

## Responsive Breakpoints
- [ ] Mobile (320px): Layout works, no horizontal scroll
- [ ] Mobile (375px): Text readable, touch targets 44px+
- [ ] Tablet (768px): Layout adapts appropriately
- [ ] Desktop (1024px): Full layout displays correctly
- [ ] Large desktop (1440px+): No excessive white space

## Interactive Elements
- [ ] All buttons: Correct colors, hover states work
- [ ] All forms: Inputs styled correctly, focus states visible
- [ ] All modals: Open/close correctly, backdrop works
- [ ] All dropdowns: Appear above content, styled correctly
- [ ] All tooltips: Display on hover, readable in both themes

## Typography
- [ ] All headings: Correct hierarchy (h1 > h2 > h3)
- [ ] All body text: Readable size (14px mobile, 16px desktop)
- [ ] All captions: Smaller than body, sufficient contrast

## Spacing
- [ ] Card padding: Consistent with other cards
- [ ] Form gaps: Comfortable spacing between fields
- [ ] Section margins: Clear visual separation

## Accessibility
- [ ] Color contrast: All text meets WCAG AA (4.5:1)
- [ ] Focus indicators: Visible in all themes
- [ ] Touch targets: 44px+ on mobile

## Functional Testing (No Regressions)
- [ ] All buttons work (same functionality as before)
- [ ] All forms submit correctly
- [ ] All API calls succeed
- [ ] All charts/visualizations render correctly
- [ ] All modals function properly
- [ ] No console errors or warnings

## Cross-Browser Testing (Sample)
- [ ] Chrome: Works correctly
- [ ] Firefox: Works correctly
- [ ] Safari: Works correctly (if available)
- [ ] Mobile Safari: Works correctly (iOS)

**Result**: ✅ PASS / ❌ FAIL  
**Issues Found**: [List any issues]  
**Screenshots**: [Attach if needed]  
**Time Taken**: [X minutes]
```

---

#### Step 6: Production Validation (15-20 minutes)

**Goal**: Validate in staging environment before production deploy.

**Staging Validation Workflow**:

1. **Deploy to Staging**:
   ```bash
   git push origin 004-centralized-theme-color
   # Wait for staging deployment
   ```

2. **Smoke Test in Staging**:
   - [ ] Open staging URL
   - [ ] Navigate to refactored page
   - [ ] Quick visual check (1-2 minutes)
   - [ ] Test 1-2 critical interactions (button click, form submit)
   - [ ] Check browser console (no errors)

3. **Prepare Rollback Plan**:
   ```bash
   # Note current commit hash for rollback
   git log -1  # Copy commit hash
   
   # Rollback command (if needed):
   # git revert <commit-hash>
   # git push origin 004-centralized-theme-color
   ```

4. **Production Deploy** (if staging passes):
   - Follow standard production deployment process
   - Monitor error logs for 10-15 minutes after deploy
   - Have rollback ready if issues detected

---

#### Step 7: Commit & Document (10 minutes)

**Goal**: Clear documentation for future reference and team coordination.

**Commit Message Template**:
```bash
git add .
git commit -m "refactor(dashboard): migrate to design token system

SCOPE: Dashboard page (/dashboard)

CHANGES:
- Replaced 23 hardcoded color classes with semantic tokens
- Replaced 15 hardcoded font size classes with typography tokens
- Replaced 18 hardcoded spacing classes with spacing/grid tokens
- Updated 3 modals to use design tokens
- Refactored chart components to use chart color tokens

TESTING:
- Visual regression tests passed (Chromatic)
- Manual QA checklist completed (all themes, states, breakpoints)
- Staging validation completed
- No functional regressions detected

TOKENS USED:
- Colors: bg-primary, bg-success, bg-warning, bg-error, text-foreground, text-muted
- Typography: text-heading-1, text-heading-2, text-body, text-caption
- Spacing: p-card-padding, space-y-form-gap, mt-section-margin
- Shadows: shadow-card, shadow-modal
- Radius: rounded-card, rounded-button

BEFORE/AFTER:
- Hardcoded values: 56 instances → 2 instances (96% reduction)
- Themes tested: Light ✅, Dark ✅, System ✅
- Breakpoints tested: 320px ✅, 768px ✅, 1024px ✅

Closes #XXX"
```

**Changelog Entry** (in `specs/004-centralized-theme-color/changelog.md`):
```markdown
### 2025-01-28 - Dashboard Page Migration

**Page**: `/dashboard`  
**Time Taken**: 3.5 hours  
**Complexity**: High

**Decisions**:
- Used semantic tokens (`bg-primary`) instead of numeric (`bg-teal-600`) for easier rebranding
- Chart tooltips required custom Recharts token integration (see `useChartColors` hook)
- Modal backdrop blur handled with theme-aware glassmorphism utility

**Challenges**:
- Recharts library needed custom color prop mapping (not straightforward)
- Mobile spacing required responsive tokens (`p-mobile-md lg:p-desktop-lg`)

**Lessons Learned**:
- Always audit charts/data viz libraries BEFORE refactoring (special handling needed)
- Responsive spacing tokens work well but need consistent naming convention
- Storybook caught 3 visual regressions that manual testing missed

**Stats**:
- Hardcoded values reduced: 56 → 2 (96%)
- QA time: 30 minutes (thorough)
- Zero production issues
```

---

### Page Migration Priority Order

**Week 2: High-Traffic Pages First** (10-15 pages)

**Priority 1 - Critical User Flows**:
1. Dashboard (`/dashboard`) - Main landing page
2. Lead Forms (`/instant-quote`, `/guest-quote-request`) - Revenue critical
3. Homepage (`/`) - First impression
4. Auth Pages (`/login`, `/register`) - Entry points

**Priority 2 - Core Functionality**:
5. Homeowner Dashboard (`/homeowner/dashboard`)
6. Installer Dashboard (`/installer/dashboard`)
7. Lead Details Page (`/leads/[id]`)
8. Settings Page (`/settings`)

**Priority 3 - Secondary Pages**:
9. Profile Page (`/profile`)
10. Notifications Page (`/notifications`)
11. Help/Support Page (`/help`)

---

**Week 3: Secondary Pages + Modals** (15-20 pages)

**Priority 4 - Admin/Management**:
12. Admin Dashboard (`/admin/dashboard`)
13. Admin Users Page (`/admin/users`)
14. Admin Settings (`/admin/settings`)
15. Reports Page (`/reports`)

**Priority 5 - Critical Modals**:
16. Lead Assignment Modal (used in dashboard)
17. Confirmation Modals (delete, archive, etc.)
18. Filter/Search Modals
19. Image Upload Modals

**Priority 6 - Additional Pages**:
20-30. Remaining secondary pages

---

**Week 4: Edge Cases + Polish** (10-15 pages)

**Priority 7 - Edge Cases**:
31. Error Pages (404, 500)
32. Loading States/Skeleton Screens
33. Empty States
34. Onboarding Flows

**Priority 8 - Marketing Pages** (if applicable):
35. Landing pages
36. Pricing page
37. About page
38. Blog pages (if any)

**Priority 9 - Final QA**:
39. Full application regression testing
40. Cross-browser testing
41. Performance testing
42. Accessibility audit

---

### Migration Tracking

**Progress Dashboard** (update daily):

```markdown
# Design Token Migration Progress

**Start Date**: 2025-01-28  
**Target Completion**: 2025-02-18 (3 weeks)  
**Current Status**: Week 2, Day 3

## Overall Progress
- **Pages Migrated**: 12 / 45 (27%)
- **Hardcoded Values**: 450 → 215 (52% reduction)
- **Visual Regressions**: 18 found, 18 fixed (0 outstanding)
- **Production Issues**: 0

## Week 2 Progress (10-15 pages)
- [x] Dashboard (/dashboard) - ✅ Done (3.5h)
- [x] Lead Forms (/instant-quote) - ✅ Done (2.5h)
- [x] Homepage (/) - ✅ Done (4h)
- [x] Login (/login) - ✅ Done (1.5h)
- [x] Register (/register) - ✅ Done (2h)
- [x] Homeowner Dashboard (/homeowner/dashboard) - ✅ Done (4h)
- [x] Installer Dashboard (/installer/dashboard) - ✅ Done (3.5h)
- [x] Lead Details (/leads/[id]) - ✅ Done (3h)
- [x] Settings (/settings) - ✅ Done (2.5h)
- [x] Profile (/profile) - ✅ Done (2h)
- [ ] Notifications (/notifications) - 🔄 In Progress
- [ ] Help/Support (/help) - ⏳ Not Started

## Week 3 Plan (15-20 pages)
- [ ] Admin Dashboard
- [ ] Admin Users
- [ ] Admin Settings
- [ ] Reports
- [ ] Modals (5-8 critical modals)
- [ ] Secondary pages (5-10)

## Week 4 Plan (10-15 pages)
- [ ] Edge cases
- [ ] Error pages
- [ ] Marketing pages
- [ ] Final QA

## Blockers / Issues
- None currently

## Velocity
- **Pages per day**: 2.2 avg (target: 2-3)
- **Hours per page**: 2.8 avg (target: 2-4)
- **On track**: ✅ Yes
```

---

## 📋 SpecKit Three-Tier Update System

**This spec integrates with the Just-In-Time Spec Updates workflow** (as defined in `.specify/memory/WORKFLOW-MANAGEMENT.md`):

### Tier 1: Real-Time (tasks.md - 30 seconds)
- **When**: Discover new task, complete task, encounter blocker
- **Action**: Update `tasks.md` immediately with status change
- **Example**: "Discovered: Tailwind config needs custom spacing scale for 8-point grid" → Add to tasks.md instantly

### Tier 2: Daily (changelog.md - 2 minutes)
- **When**: End of day (5pm)
- **Action**: Log decisions, fixes, lessons learned in `changelog.md`
- **Example**: 
  ```markdown
  ### 2025-01-28
  - **Decision**: Use semantic tokens (e.g., `bg-primary`) instead of numeric (e.g., `bg-blue-600`) for better rebranding flexibility
  - **Discovery**: Inter font already loaded in layout.tsx, no additional font setup needed
  - **Challenge**: Storybook HMR not detecting token changes, requires manual refresh
  ```

### Tier 3: Weekly (spec.md + execution-plan.md - 30 minutes)
- **When**: Friday 4pm weekly sync
- **Action**: Batch update spec with new FRs/SCs discovered during implementation
- **Example**: Add newly discovered edge cases, update success criteria based on real testing results

**Benefit**: Maintains spec alignment with only 45 min/week overhead (vs 2+ hours daily updates)

---

## 📱 Mobile-First Standards Compliance

**This feature enforces mobile-first design principles** (as defined in `DOC/INDUSTRY-STANDARD-GUIDELINES.md` Section 1.6):

### Critical Mobile-First Rules

1. **Design for Mobile FIRST** (320px-640px):
   - Base font size: **14px on mobile** (not 16px - avoids "fonts too large" issue)
   - Spacing: **50-75% of desktop spacing** (e.g., 12px mobile vs 24px desktop padding)
   - Touch targets: **Minimum 44px × 44px** (WCAG 2.5.5 compliance)
   - Cards: **Full-width or 2-column grid** (avoid 3+ columns causing tiny cards)

2. **Progressive Enhancement for Desktop**:
   - Desktop base font size: **16px** (standard)
   - Desktop spacing: **Standard 8-point grid** (16px, 24px, 32px, etc.)
   - Desktop layouts: **Multi-column grids, sidebars** (not on mobile)

3. **Testing Protocol**:
   - **ALWAYS test mobile first**: 320px (iPhone SE), 375px (iPhone 12/13), 414px (iPhone 14 Pro Max)
   - Desktop testing: 1024px, 1440px, 1920px
   - **No component approved until mobile testing complete**

### Mobile-First Design Token Requirements

**Typography Tokens (Mobile-First)**:
```typescript
// Base font sizes - MOBILE FIRST
'text-xs': '12px',      // Captions, small labels
'text-sm': '14px',      // Mobile body text (BASE SIZE)
'text-base': '16px',    // Desktop body text
'text-lg': '18px',      // Mobile headings (h3-h4)
'text-xl': '20px',      // Mobile headings (h2)
'text-2xl': '24px',     // Mobile headings (h1)
// Larger sizes for desktop only
```

**Spacing Tokens (Mobile-First)**:
```typescript
// Mobile spacing scale (50-75% of desktop)
'space-mobile-xs': '4px',
'space-mobile-sm': '8px',
'space-mobile-md': '12px',  // Mobile card padding
'space-mobile-lg': '16px',

// Desktop spacing scale (standard 8-point grid)
'space-desktop-sm': '12px',
'space-desktop-md': '16px',
'space-desktop-lg': '24px',  // Desktop card padding
'space-desktop-xl': '32px',
```

**Component Sizing (Mobile-First)**:
- Buttons: **Full-width on mobile** (< 640px), **auto-width on desktop**
- Cards: **Full-width on mobile**, **grid layout on desktop**
- Modals: **Full-screen on mobile**, **centered overlay on desktop**
- Tables: **Card layout on mobile**, **table layout on desktop**

### Red Flags (Violations to Avoid)

❌ **DON'T**:
- Base font size > 14px on mobile (causes "fonts too large" issue)
- Card padding > 16px on mobile (causes "too much white space")
- 3+ column grids on mobile (causes "cards too small")
- Desktop-first responsive classes (`lg:text-sm` - wrong direction)
- Touch targets < 44px on mobile (WCAG violation)

✅ **DO**:
- Start with mobile classes: `text-sm md:text-base` (correct direction)
- Mobile-first spacing: `p-mobile-md lg:p-desktop-lg`
- Mobile-first layouts: `flex-col lg:flex-row`
- Test mobile breakpoints FIRST, desktop SECOND
- Use responsive token variants (mobile/tablet/desktop)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Designer Changes Primary Brand Color (Priority: P1)

A designer needs to update the primary brand color across the entire application from teal (#0d9488) to a new brand color. Currently, this requires manually finding and updating 200+ instances across 50+ files, taking 4-6 hours and risking inconsistencies.

**Why this priority**: This is the core value proposition - reducing color change time from 4-6 hours to 5 minutes (96% time savings). It directly addresses the most critical pain point identified in the audit.

**Independent Test**: Can be fully tested by changing a single color value in the central token file and verifying that all components (buttons, links, badges, charts) reflect the new color across all 3 themes (Light, Dark, System).

**Acceptance Scenarios**:

1. **Given** the designer opens the central color token file, **When** they change the primary color from #0d9488 to #1e40af, **Then** all primary buttons, links, and accent elements across the entire application display the new color
2. **Given** the application has 3 active themes (Light, Dark, System), **When** the primary color is changed, **Then** all themes correctly apply the new color with appropriate variations (light/dark versions)
3. **Given** charts and data visualizations use the primary color, **When** the primary color is changed, **Then** all charts automatically update to use the new color
4. **Given** the designer saves the color change, **When** they refresh the application, **Then** no hardcoded color values override the new color (100% consistency)

---

### User Story 2 - Developer Implements New Component with Theme Support (Priority: P1)

A developer needs to create a new component (e.g., a new type of status badge, button variant, or card) that respects all 3 themes and follows the design system. Currently, they must manually implement theme-aware styles using inconsistent patterns.

**Why this priority**: Ensures new code follows the standard pattern, preventing regression back to hardcoded values. This is critical for long-term maintainability.

**Independent Test**: Can be fully tested by creating a sample component that uses the provided hook/utilities and verifying it automatically adapts to theme changes without any custom theme logic.

**Acceptance Scenarios**:

1. **Given** a developer creates a new button component, **When** they use the provided color utilities, **Then** the button automatically supports all variant types (primary, secondary, success, danger) without hardcoding colors
2. **Given** a new component needs status indicators, **When** the developer uses the status color mapping, **Then** all status types (active, pending, rejected, completed) display consistent colors across the application
3. **Given** a component needs to display differently in dark mode, **When** the developer uses theme-aware utilities, **Then** the component automatically adapts without manual dark mode logic
4. **Given** the developer adds a new chart, **When** they reference chart color tokens, **Then** the chart colors match the design system and work across all themes

---

### User Story 3 - Business Rebrands or Creates White-Label Version (Priority: P2)

The business needs to create a white-label version of the application with a completely different color scheme, or rebrand the existing application to match new brand guidelines.

**Why this priority**: High business value for scaling and customization, but less urgent than fixing current maintainability issues. Enables revenue opportunities through white-labeling.

**Independent Test**: Can be fully tested by creating a new set of color tokens (e.g., "client-blue-theme") and verifying the entire application renders with the new color scheme without touching component code.

**Acceptance Scenarios**:

1. **Given** a new client requires their brand colors (primary: #3b82f6, secondary: #f59e0b), **When** a new color token set is created with these values, **Then** the entire application renders in the client's brand colors
2. **Given** multiple white-label versions need to coexist, **When** color tokens are organized by brand, **Then** the application can switch between brands without code changes
3. **Given** brand guidelines specify accessible color combinations, **When** color tokens are defined, **Then** all text/background combinations meet WCAG AA standards (4.5:1 contrast ratio)
4. **Given** rebranding affects marketing materials, **When** designers export colors from the token system, **Then** they have a single source of truth for all brand materials

---

### User Story 4 - QA Tests Theme Consistency (Priority: P2)

QA needs to verify that all components display correctly across all 3 themes (Light, Dark, System) without visual inconsistencies or broken styles.

**Why this priority**: Ensures quality and consistency, but depends on P1 implementation. Reduces QA time and improves release confidence.

**Independent Test**: Can be fully tested by switching themes and verifying all pages render correctly without manual inspection of code.

**Acceptance Scenarios**:

1. **Given** QA switches from Light to Dark theme, **When** they navigate through the application, **Then** all components display properly without visual glitches or missing styles
2. **Given** a component uses status colors, **When** QA views it in different themes, **Then** the status colors remain distinguishable and meet accessibility standards
3. **Given** QA finds a color inconsistency, **When** they report it, **Then** developers can trace the issue to a single source file rather than searching 50+ files
4. **Given** the application uses glassmorphism effects, **When** themes change, **Then** all transparency and blur effects adapt appropriately to the theme

---

### User Story 5 - Developer Fixes Legacy Hardcoded Colors (Priority: P3)

A developer needs to refactor existing components that currently use hardcoded color values (e.g., `bg-teal-600`, hex codes like `#0d9488`) to use the new centralized system.

**Why this priority**: Technical debt cleanup - important for long-term health but can be done incrementally after the foundation is established.

**Independent Test**: Can be fully tested by refactoring a single component (e.g., InstantQuoteForm with 50+ hardcoded instances) and verifying it works identically while using the new system.

**Acceptance Scenarios**:

1. **Given** a component has 50+ hardcoded color instances, **When** the developer refactors it to use color utilities, **Then** the component renders identically but is now centrally managed
2. **Given** search results show 200+ hardcoded color references, **When** developers progressively refactor components, **Then** the count decreases and progress is measurable
3. **Given** a component uses inline styles with hex colors, **When** refactored to use design tokens, **Then** the component becomes theme-aware automatically
4. **Given** chart components have hardcoded fill/stroke colors, **When** refactored to use chart color tokens, **Then** charts can be recolored instantly for rebranding

---

### User Story 6 - Designer Updates Typography System (Priority: P1)

A designer needs to update the font size scale, font family, or typography hierarchy across the entire application. Currently, this requires finding and updating 150+ hardcoded font size instances across 50+ components, with inconsistent patterns (same content using different sizes).

**Why this priority**: Typography is equally critical as colors for visual consistency and brand identity. Inconsistent font sizes create unprofessional appearance and poor hierarchy. This addresses 150+ hardcoded instances.

**Independent Test**: Can be fully tested by changing the base font size or heading scale in the typography token file and verifying all text content (headings, body, captions) adjusts proportionally while maintaining hierarchy.

**Acceptance Scenarios**:

1. **Given** the designer opens the typography token file, **When** they change the base body text size from 16px to 18px, **Then** all body text throughout the application increases proportionally
2. **Given** heading sizes need to be more dramatic, **When** the designer adjusts the heading scale ratio (e.g., h1 from 30px to 36px), **Then** all h1 headings across pages reflect the new size
3. **Given** the application needs tighter line spacing, **When** the designer changes the base line-height from 1.5 to 1.4, **Then** all body text automatically adjusts without affecting heading line-heights
4. **Given** a new font family is introduced (e.g., replacing Inter with Roboto), **When** the designer updates the font family token, **Then** the entire application adopts the new font instantly

---

### User Story 7 - Developer Creates Component with Consistent Spacing (Priority: P1)

A developer needs to create a new card component with proper padding, gaps, and margins that match existing components. Currently, they must guess spacing values or copy from other components, leading to 100+ inconsistent spacing combinations.

**Why this priority**: Consistent spacing is fundamental to professional UI. Inconsistent gaps/padding create visual chaos. This establishes an 8-point grid system for systematic spacing.

**Independent Test**: Can be fully tested by creating a new component using spacing tokens and verifying it maintains consistent spacing with similar components across the application.

**Acceptance Scenarios**:

1. **Given** a developer creates a new card component, **When** they use `space-card-padding` token, **Then** the card has identical internal padding to all other cards (consistency)
2. **Given** a form needs spacing between input fields, **When** the developer uses `space-form-gap` token, **Then** all forms have consistent field spacing
3. **Given** a component needs responsive spacing (tighter on mobile), **When** the developer uses responsive spacing tokens, **Then** spacing adapts automatically across breakpoints
4. **Given** the design system spacing scale needs adjustment, **When** tokens are updated, **Then** all components using those tokens adjust proportionally

---

### User Story 8 - Designer Implements Consistent Shadow/Elevation System (Priority: P2)

A designer needs to establish a consistent elevation system using shadows to indicate hierarchy (e.g., dropdowns above cards, modals above dropdowns). Currently, 30+ scattered shadow definitions create inconsistent depth perception.

**Why this priority**: Shadows communicate visual hierarchy and depth. Inconsistent shadows confuse users. This establishes a 5-level elevation system following Material Design principles.

**Independent Test**: Can be fully tested by applying elevation tokens to various components (buttons, cards, dropdowns, modals) and verifying they create clear visual hierarchy.

**Acceptance Scenarios**:

1. **Given** a dropdown menu appears over a card, **When** proper elevation tokens are applied, **Then** the dropdown's shadow clearly indicates it's above the card (visual hierarchy)
2. **Given** a modal dialog appears, **When** the highest elevation token is applied, **Then** it's visually clear the modal is the topmost layer
3. **Given** buttons need subtle depth, **When** `elevation-1` token is used, **Then** all buttons have consistent subtle shadows
4. **Given** dark mode is enabled, **When** elevation shadows are applied, **Then** shadows adjust appropriately for dark backgrounds (lighter shadow colors)

---

### User Story 9 - Developer Standardizes Border Radius (Priority: P2)

A developer needs to apply corner rounding to UI elements. Currently, 50+ different radius values exist (`rounded-lg`, `rounded-xl`, `rounded-2xl`) with no clear system, creating visual inconsistency.

**Why this priority**: Consistent border radius is a simple but visible part of brand identity. Mixed radius values look unprofessional. This establishes a standard radius scale.

**Independent Test**: Can be fully tested by applying radius tokens to buttons, cards, inputs, and modals, verifying consistency across similar component types.

**Acceptance Scenarios**:

1. **Given** all buttons should have the same corner style, **When** `radius-button` token is applied, **Then** all buttons have identical border radius
2. **Given** input fields need consistent styling, **When** `radius-input` token is used, **Then** all text inputs, selects, and textareas have matching corner radius
3. **Given** large containers (cards, modals) need softer corners, **When** `radius-lg` token is applied, **Then** all large containers have consistent corner rounding
4. **Given** status badges need to be fully rounded, **When** `radius-full` token is used, **Then** all pill-shaped badges have fully circular corners

---

### User Story 10 - Designer Centralizes Animation System (Priority: P3)

A designer needs to standardize animation durations, easing functions, and transition effects. Currently, 15+ animation keyframes are defined in CSS, with many inline transition declarations creating inconsistent motion design.

**Why this priority**: Consistent animations improve perceived performance and brand polish. Scattered animations create jarring UX. This is lower priority but important for professional finish.

**Independent Test**: Can be fully tested by applying animation tokens to hover states, loading states, and entrance animations, verifying consistent timing and easing across the application.

**Acceptance Scenarios**:

1. **Given** button hover states need consistent transitions, **When** `duration-fast` and `ease-out` tokens are applied, **Then** all buttons animate consistently on hover (200ms ease-out)
2. **Given** modal entrance animations need standard timing, **When** `duration-normal` token is used, **Then** all modals fade-in with consistent 300ms duration
3. **Given** loading spinners need uniform speed, **When** centralized spinner animation is used, **Then** all loading states have identical animation speed
4. **Given** page transitions need smoothness, **When** `ease-in-out` easing token is applied, **Then** all route transitions feel consistent

---

### Edge Cases

**Color System Edge Cases:**
- What happens when a component needs a color variant that doesn't exist in the token system? (Should the system be extensible?)
- How does the system handle gradients and color opacity variations?
- What if a theme requires more than the standard color variants (light/DEFAULT/dark)?
- How are animation colors (loading spinners, transitions) managed across themes?
- What happens when CSS variables are not supported (legacy browser compatibility)?
- How do email templates (HTML) access color tokens when CSS variables aren't available?
- What if two themes need completely different semantic meanings (e.g., "warning" is orange in one theme but yellow in another)?
- How are focus states and accessibility indicators colored to meet WCAG standards across all themes?

**Typography System Edge Cases:**
- What happens when a component needs a font size between two standard tokens (e.g., between `text-sm` and `text-base`)?
- How should responsive typography work - should font sizes change at breakpoints or use fluid scaling (clamp)?
- What if a third-party component library injects its own font styles that conflict with tokens?
- How are emoji and icon sizes coordinated with text size tokens?
- Should monospace font tokens have different size/line-height ratios than sans-serif?
- How should letter-spacing (tracking) be applied to all-caps text vs normal text?
- What if content is user-generated and includes inline font styling?

**Spacing System Edge Cases:**
- What happens when a component needs spacing that falls outside the 8-point grid?
- Should negative margins be tokenized or discouraged entirely?
- How should spacing work with CSS Grid `gap` vs Flexbox `space-between` vs traditional `margin`?
- What if responsive spacing needs different scales (e.g., mobile uses 4-point grid, desktop uses 8-point grid)?
- How are optical adjustments handled (e.g., circular buttons needing more padding than rectangular ones)?
- Should component-internal spacing (padding) follow the same scale as component-external spacing (margins/gaps)?

**Shadow/Elevation Edge Cases:**
- How should shadows behave with semi-transparent backgrounds (glassmorphism effects)?
- What if a component needs different shadows on different sides (e.g., bottom-only shadow)?
- Should shadow color adapt to the primary color or always remain neutral?
- How are inner shadows (inset) tokenized vs outer shadows?
- What if dark mode needs lighter shadows but the design system only defines dark shadows?

**Border Radius Edge Cases:**
- What happens when a component needs different radius on different corners (e.g., top-left rounded, others square)?
- Should border radius scale proportionally with component size (larger cards = larger radius)?
- How are circular elements (avatars, icon buttons) distinguished from pill-shaped elements (badges)?
- What if border radius conflicts with child element radius (nested rounded containers)?

**Animation Edge Cases:**
- What happens when an animation needs to chain multiple animations (e.g., fade-in + slide-up)?
- Should animations be disabled for users with `prefers-reduced-motion` enabled?
- How are animation durations coordinated with loading states (skeleton screens, spinners)?
- What if two animations with different durations need to synchronize (e.g., modal backdrop + modal content)?
- Should hover animations have the same duration as click/active animations?

## Requirements *(mandatory)*

### Functional Requirements

**Core Token System:**

- **FR-001**: System MUST provide a centralized color token file that serves as the single source of truth for all application colors
- **FR-002**: System MUST define brand colors (primary, secondary) with light/DEFAULT/dark variants for hover and active states
- **FR-003**: System MUST define semantic colors (success, warning, error, info) with light/DEFAULT/dark variants
- **FR-004**: System MUST define specialized color categories (chart colors, neutral scales)
- **FR-005**: System MUST support all 3 existing themes (Light, Dark, System/Eco-Green) without breaking current functionality
- **FR-006**: System MUST provide centralized typography tokens including font families, sizes, weights, line heights, and letter spacing
- **FR-007**: System MUST define spacing tokens following an 8-point grid system (4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px)
- **FR-008**: System MUST provide border radius tokens with semantic scale (sm, md, lg, xl, 2xl, full)
- **FR-009**: System MUST define shadow/elevation tokens with 5-level system (sm, DEFAULT, md, lg, xl, 2xl)
- **FR-010**: System MUST provide animation/transition tokens including durations (fast, normal, slow) and easing functions

**Developer Experience:**

- **FR-011**: System MUST provide type-safe utilities for accessing all design tokens in components (TypeScript support)
- **FR-012**: System MUST provide pre-built component variants (buttons, badges, alerts, inputs) that use token-based styling
- **FR-013**: System MUST integrate with Tailwind CSS to enable utility classes for colors (`bg-primary`), typography (`text-body`, `font-heading`), spacing (`space-card`), etc.
- **FR-014**: Developers MUST be able to apply theme-aware styles without writing custom theme logic
- **FR-015**: System MUST provide status-to-color mapping functions for consistent status indicators across the application
- **FR-016**: System MUST provide semantic typography tokens (display, heading, body, caption) rather than size-only tokens (sm, md, lg)
- **FR-017**: Developers MUST be able to apply consistent spacing using semantic tokens (`gap-form-field`, `padding-card`) rather than arbitrary numbers

**Visual Testing & Quality Assurance:**

- **FR-056**: System MUST include Storybook (or equivalent UI component explorer) for isolated component visual testing during migration
- **FR-057**: System MUST support visual regression testing (Chromatic, Percy, or Loki) to catch visual breaking changes automatically
- **FR-058**: Developers MUST add or update Storybook stories for every component refactored to use design tokens
- **FR-059**: Each refactored component MUST have a manual QA checklist completed before commit (verify all themes, states, and responsive breakpoints)
- **FR-060**: System MUST enable instant visual preview of design token changes without full application rebuild
- **FR-061**: Build pipeline MUST validate visual regression tests pass before allowing merge to main branch
- **FR-062**: Manual QA checklists MUST include theme switching (Light/Dark/System), interactive states (hover/focus/active), and responsive breakpoints (mobile/tablet/desktop)

**Accessibility:**

- **FR-018**: System MUST document which color combinations meet WCAG AA standards (4.5:1 contrast ratio for normal text, 3:1 for large text)
- **FR-019**: System MUST provide accessible color combinations for all semantic states (error, warning, success, info)
- **FR-020**: Dark mode colors MUST maintain sufficient contrast for readability and accessibility
- **FR-021**: Typography line-height ratios MUST ensure readability (minimum 1.5 for body text, 1.2 for headings)
- **FR-022**: Shadow colors MUST adapt to theme to maintain visibility (darker shadows in light mode, lighter shadows in dark mode)

**Maintainability:**

- **FR-023**: System MUST eliminate the need to search and replace values across 50+ files when rebranding or adjusting design
- **FR-024**: System MUST prevent hardcoded values (colors, font sizes, spacing) from being introduced in new code through clear patterns
- **FR-025**: System MUST support gradual migration from hardcoded values to token-based values (both systems can coexist temporarily)
- **FR-026**: System MUST provide clear documentation showing before/after examples for common refactoring patterns
- **FR-027**: System MUST reduce total hardcoded design values from 450+ instances (200 colors + 150 typography + 100 spacing) to fewer than 10

**Data Visualization:**

- **FR-028**: System MUST provide chart-specific color tokens for data visualization libraries (Recharts, Chart.js)
- **FR-029**: Chart colors MUST be semantically meaningful (e.g., savings=green, cost=teal, loss=red)
- **FR-030**: System MUST support gradient definitions for area charts and complex visualizations
- **FR-031**: Chart text (labels, legends) MUST use typography tokens for consistency with main application

**Theme Switching:**

- **FR-032**: System MUST work seamlessly with the existing ThemeProvider component without requiring major changes
- **FR-033**: Design token changes MUST be instantaneous when users switch themes (no flicker or re-render delays)
- **FR-034**: System MUST persist theme-specific preferences if users customize themes
- **FR-035**: Typography, spacing, and shadows MUST adapt appropriately between light and dark themes

**Typography System:**

- **FR-036**: System MUST define at least 3 font families (sans for UI, serif for long-form optional, mono for code)
- **FR-037**: System MUST provide 8-10 font size tokens covering UI needs (10px - 48px range)
- **FR-038**: System MUST define 4 font weight tokens (normal, medium, semibold, bold) aligned with Inter font capabilities
- **FR-039**: System MUST provide line-height tokens optimized for different content types (tight for headings, normal for body, relaxed for long-form)
- **FR-040**: System MUST define letter-spacing tokens for specific use cases (uppercase headers, tight display text)

**Spacing System:**

- **FR-041**: System MUST follow an 8-point grid system with tokens: 0, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
- **FR-042**: System MUST provide semantic spacing tokens (e.g., `card-padding`, `form-gap`, `section-margin`) in addition to numeric scale
- **FR-043**: System MUST support responsive spacing tokens that adapt to breakpoints (e.g., `padding-card-sm` for mobile, `padding-card-lg` for desktop)
- **FR-044**: System MUST discourage or prevent spacing values that break the 8-point grid system

**Shadow/Elevation System:**

- **FR-045**: System MUST define 7 shadow levels (none, sm, DEFAULT, md, lg, xl, 2xl, inner) following elevation hierarchy
- **FR-046**: Shadow colors MUST be theme-aware (dark shadows for light mode, lighter shadows for dark mode)
- **FR-047**: System MUST provide semantic shadow tokens (e.g., `shadow-card`, `shadow-dropdown`, `shadow-modal`)
- **FR-048**: Shadows MUST be composable (e.g., combining elevation shadow + border glow)

**Animation/Transition System:**

- **FR-049**: System MUST define 3 duration tokens: fast (150ms), normal (300ms), slow (500ms)
- **FR-050**: System MUST provide 4 easing function tokens: ease-in, ease-out, ease-in-out, linear
- **FR-051**: System MUST centralize existing animation keyframes (gradient-shift, float, pulse, etc.) as reusable tokens
- **FR-052**: System MUST respect `prefers-reduced-motion` user preference and disable animations accordingly

**Border Radius System:**

- **FR-053**: System MUST define 7 border radius tokens: none (0), sm (4px), md (8px), lg (12px), xl (16px), 2xl (24px), full (9999px)
- **FR-054**: System MUST provide semantic radius tokens (e.g., `radius-button`, `radius-input`, `radius-card`)
- **FR-055**: Border radius tokens MUST be consistently applied to similar component types

**Mobile-First Responsive Design (CRITICAL - Based on Real-World Pain Points):**

- **FR-056**: System MUST follow mobile-first design approach: design for mobile (320px-640px) FIRST, then progressively enhance for tablet (640px-1024px) and desktop (>1024px)
- **FR-057**: Typography tokens MUST include responsive scaling: 14px base font size on mobile, 16px on desktop (avoid fonts too large on mobile)
- **FR-058**: Spacing tokens MUST include responsive variants: mobile spacing 50-75% of desktop spacing (avoid excessive white space on mobile)
- **FR-059**: Component layouts MUST have mobile-specific patterns: full-width mobile layouts (avoid cards too large, taking too much space)
- **FR-060**: All interactive elements MUST meet WCAG 2.5.5 touch target size: minimum 44px × 44px on mobile (48-56px preferred)
- **FR-061**: System MUST provide mobile-optimized component variants: bottom navigation for mobile (thumb-friendly), sidebar for desktop
- **FR-062**: Tables MUST have mobile alternatives: card-based layout on mobile (avoid horizontal scroll issues)
- **FR-063**: Forms MUST use responsive layouts: stacked fields on mobile, multi-column on desktop
- **FR-064**: Modals MUST adapt to mobile: full-screen or properly sized for small viewports
- **FR-065**: System MUST enforce mobile-first testing: all components tested on 320px, 375px, 414px viewports BEFORE desktop

### Key Entities

- **Color Token**: Represents a named color value with variants (light, DEFAULT, dark), includes metadata about usage and accessibility
- **Typography Token**: Represents font properties including family (sans, serif, mono), size (xs-4xl), weight (normal-bold), line-height (tight-relaxed), and letter-spacing
- **Spacing Token**: Represents spacing values following 8-point grid system (0, 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px) with semantic names
- **Shadow/Elevation Token**: Represents shadow definitions for visual hierarchy with 7 levels (none, sm, DEFAULT, md, lg, xl, 2xl, inner)
- **Border Radius Token**: Represents corner rounding values (none, sm, md, lg, xl, 2xl, full) for consistent component styling
- **Animation Token**: Represents transition durations (fast: 150ms, normal: 300ms, slow: 500ms) and easing functions (ease-in, ease-out, ease-in-out)
- **Theme Configuration**: Represents a complete theme with mappings of semantic tokens to specific values (Light/Dark/System)
- **Component Variant**: Represents pre-styled component patterns (e.g., "primary button") that use design tokens
- **Status Mapping**: Represents the relationship between application status values (new, active, pending) and semantic colors (info, success, warning)
- **Accessibility Rule**: Represents contrast ratio requirements and approved color/typography combinations for WCAG compliance

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Time Efficiency:**

- **SC-001**: Designers can change the primary brand color across the entire application in under 5 minutes (down from 4-6 hours, 96% reduction)
- **SC-002**: Developers can create new theme-aware components in under 10 minutes without writing custom theme logic
- **SC-003**: Rebranding the entire application (all colors) takes under 15 minutes (down from 8+ hours)
- **SC-004**: Designers can adjust the entire typography scale (all font sizes) in under 5 minutes (down from 2-3 hours)
- **SC-005**: Developers can change global spacing scale in under 5 minutes (down from 3-4 hours)
- **SC-006**: Adjusting shadow/elevation system takes under 3 minutes (down from 1-2 hours searching files)

**Code Quality:**

- **SC-007**: Number of hardcoded color instances reduces from 200+ to fewer than 5 application-wide
- **SC-008**: Number of hardcoded font size instances reduces from 150+ to fewer than 5 application-wide
- **SC-009**: Number of hardcoded spacing instances reduces from 100+ to fewer than 5 application-wide
- **SC-010**: 100% of new components use the centralized design token system (no new hardcoded values)
- **SC-011**: Design token-related bugs reduce by 80% (from inconsistent value usage)
- **SC-012**: Total hardcoded design values reduce from 450+ (colors + typography + spacing) to fewer than 10

**Consistency:**

- **SC-013**: All components display consistent colors across the application (no visual discrepancies)
- **SC-014**: All 3 themes (Light, Dark, System) render correctly with no broken styles or missing values
- **SC-015**: Status indicators show consistent colors across all tables, forms, and dashboards
- **SC-016**: All headings of the same level (h1, h2, h3) have consistent font sizes, weights, and line-heights
- **SC-017**: All buttons have consistent padding, border radius, and typography styling
- **SC-018**: All cards have consistent padding, border radius, and shadow elevations
- **SC-019**: Similar UI elements (forms, tables, modals) use consistent spacing patterns

**Developer Experience:**

- **SC-020**: 90% of developers report the new system is easier to use than hardcoded values (survey)
- **SC-021**: Developers can find and apply the correct design token in under 30 seconds using documentation
- **SC-022**: New developer onboarding includes design system training completed in under 20 minutes (up from 15 to account for typography/spacing)
- **SC-023**: Developers can create new components 50% faster using pre-built token-based variants
- **SC-047**: All refactored components have passing visual regression tests in Storybook
- **SC-048**: Developers can preview design token changes instantly in Storybook (under 5 seconds)
- **SC-049**: Manual QA checklist completed for every refactored component before commit (100% compliance)
- **SC-050**: Zero visual regressions detected in production after migration (caught in Storybook/Chromatic)

**Business Impact:**

- **SC-024**: Application achieves 95%+ industry standard compliance for design systems (up from 60%)
- **SC-025**: White-label customization becomes feasible (can create client-specific design system in under 2 hours)
- **SC-026**: Support tickets related to design inconsistencies reduce by 60%
- **SC-027**: Design system documentation becomes single source of truth for designers, developers, and stakeholders

**Accessibility:**

- **SC-028**: 100% of text/background color combinations meet WCAG AA standards (4.5:1 contrast for normal text)
- **SC-029**: Dark mode maintains readability with sufficient contrast for all text elements
- **SC-030**: Status indicators remain distinguishable for users with color vision deficiency
- **SC-031**: All body text meets minimum line-height requirements (1.5) for readability
- **SC-032**: Focus indicators meet WCAG requirements for visibility (3:1 contrast with adjacent colors)

**Typography:**

- **SC-033**: All text content uses semantic typography tokens (display, heading, body, caption) instead of size-only classes
- **SC-034**: Font size changes propagate instantly across all 200+ text instances
- **SC-035**: Typography hierarchy is visually consistent across all pages (h1 always larger than h2, etc.)
- **SC-036**: Line-height ratios optimize readability (1.5 for body text, 1.2-1.3 for headings)

**Spacing:**

- **SC-037**: All spacing values follow 8-point grid system (no arbitrary values like 13px or 27px)
- **SC-038**: Component internal spacing (padding) is consistent across similar components (all cards, all forms, all modals)
- **SC-039**: Spacing between elements follows consistent patterns (form fields, list items, card grids)
- **SC-040**: Responsive spacing adapts appropriately at breakpoints (tighter on mobile, more generous on desktop)

**Shadows & Visual Effects:**

- **SC-041**: Visual hierarchy is clear through consistent shadow elevations (dropdowns above cards, modals above dropdowns)
- **SC-042**: Shadow styles adapt appropriately to light/dark themes
- **SC-043**: All elevation levels are visually distinguishable (each level is noticeably different from adjacent levels)

**Animations:**

- **SC-044**: Hover/focus transitions have consistent duration (150ms-300ms across all interactive elements)
- **SC-045**: Animations respect user `prefers-reduced-motion` preference
- **SC-046**: Loading states use consistent animation patterns (spinners, skeleton screens)

**Mobile-First Responsive Design (CRITICAL):**

- **SC-051**: All pages tested on mobile viewports (320px iPhone SE, 375px iPhone 12/13, 414px iPhone 14 Pro Max) BEFORE desktop
- **SC-052**: Text is readable on mobile: minimum 14px font size for body text, no text smaller than 12px
- **SC-053**: Touch targets meet WCAG 2.5.5: all buttons, links, and interactive elements minimum 44px × 44px on mobile
- **SC-054**: No horizontal scroll on mobile: all content fits within viewport width (320px minimum)
- **SC-055**: Spacing is comfortable on mobile: not cramped (minimum 8px gaps) and not excessive (maximum 24px padding)
- **SC-056**: Navigation is thumb-friendly: bottom navigation or easily reachable menu on mobile
- **SC-057**: Forms are usable on mobile: full-width inputs, large touch-friendly buttons
- **SC-058**: Tables are readable on mobile: card layout alternative or horizontal scroll with clear indicators
- **SC-059**: Modals work correctly on mobile: full-screen or properly sized, not cut off or too small
- **SC-060**: Performance is good on mobile: pages load in under 3 seconds on 3G network
- **SC-061**: Mobile experience feels app-like: full-screen content, edge-to-edge design, no wasted space
- **SC-062**: Fonts are not too large on mobile: 14px base (not 16px+), headings scale proportionally
- **SC-063**: Cards are appropriately sized on mobile: full-width or 2-column grid (not 3+ columns causing tiny cards)
- **SC-064**: Spacing is responsive: mobile uses 50-75% of desktop spacing (e.g., 12px mobile vs 24px desktop padding)

## Assumptions *(optional but recommended)*

### Technical Assumptions

- The application uses Tailwind CSS v3+ and can leverage its theming capabilities
- The existing ThemeProvider component works correctly and doesn't require major changes
- Browsers support CSS custom properties (variables) for theme switching
- TypeScript is used throughout the application for type safety
- The build system can process and bundle the new design token files
- Inter font from Google Fonts remains the primary typeface (already implemented in layout.tsx)
- Next.js font optimization system will handle typography token integration seamlessly
- Modern browsers support CSS Grid and Flexbox for spacing system implementation

### Design Assumptions

- The current 3-theme system (Light, Dark, System) is sufficient and won't expand to more themes in the near term
- Each color needs light/DEFAULT/dark variants for hover/active states
- Semantic color categories (success, warning, error, info) are universally applicable
- Glassmorphism effects (transparency, blur) should remain theme-aware
- Chart colors follow industry conventions (green=positive, red=negative)
- **8-point grid system** (multiples of 4px/8px) is sufficient for all spacing needs
- Font size scale from 12px to 48px covers all UI typography needs
- Three font families (sans, mono, optional serif) are sufficient
- Five shadow/elevation levels provide adequate hierarchy for UI depth
- Standard transition durations (150ms, 300ms, 500ms) cover most animation needs

### Migration Assumptions

- Legacy hardcoded values (colors, fonts, spacing) can be refactored gradually over 2-3 weeks
- Both old and new design token systems can coexist during migration without conflicts
- High-priority components (buttons, forms, status badges, cards) will be refactored first
- Email templates may require a separate solution since they don't support CSS variables
- Typography refactoring can happen independently from color refactoring (separate PRs)
- Spacing refactoring may require more visual QA testing than color/typography changes

### Business Assumptions

- Rebranding or white-labeling is a realistic future requirement worth optimizing for
- Reducing design change time from hours to minutes provides significant ROI
- Design system consistency improves user experience and brand perception
- The 96% time savings (colors + typography + spacing) justifies the 40-hour implementation effort (expanded from 20 hours)
- Professional UI consistency improves customer trust and conversion rates
- Industry-standard design system improves developer hiring and onboarding

### Typography Assumptions

- Inter font family is appropriate for both headings and body text (no separate display font needed initially)
- Letter-spacing adjustments are only needed for specific cases (all-caps headers, tight display text)
- Responsive font sizes can be handled with standard Tailwind breakpoint utilities (sm:, md:, lg:)
- Line-height ratios of 1.2 (headings), 1.5 (body), 1.75 (long-form) are universally appropriate
- Monospace font is only needed for code snippets and technical content (not primary UI)

### Spacing Assumptions

- 8-point grid system provides sufficient granularity for UI spacing (no 5px or 7px values needed)
- Component padding and component margins can follow the same spacing scale
- Responsive spacing adjustments are handled at breakpoints (mobile uses smaller spacing, desktop uses larger)
- Optical adjustments for circular elements can be handled with component-specific overrides
- Negative margins are discouraged and will not be tokenized

### Shadow/Animation Assumptions

- Five shadow levels (sm, DEFAULT, md, lg, xl) provide adequate elevation hierarchy
- Shadow colors can be neutral (black/white with opacity) rather than brand-colored
- Animation durations don't need responsive variations (same duration on mobile and desktop)
- Users with `prefers-reduced-motion` enabled should have all animations disabled or minimal

## Dependencies *(optional)*

### Internal Dependencies

- **Existing ThemeProvider**: Must continue functioning without breaking changes
- **Tailwind Configuration**: Must be updated to include all design tokens (colors, typography, spacing, shadows, animations)
- **Global CSS Variables**: Currently defined in `globals.css`, need to align with token system
- **Component Library**: 50+ components currently use hardcoded values (colors, fonts, spacing) and will need gradual refactoring
- **Font System (layout.tsx)**: Inter font from Google Fonts already configured, needs integration with typography tokens
- **Animation Keyframes (globals.css)**: 15+ existing animations need migration to token-based system

### External Dependencies

- **Tailwind CSS v3+**: Required for extended configuration (colors, typography, spacing) and CSS variable support
- **React Context API**: Used by ThemeProvider for theme state management
- **TypeScript**: Provides type safety for design tokens and utilities
- **Recharts**: Data visualization library that needs chart color tokens
- **Google Fonts API**: Provides Inter font with Next.js font optimization
- **Next.js Font Optimization**: Built-in system for optimized font loading
- **Storybook v7+**: Required for isolated component visual testing and design token preview
- **Chromatic, Percy, or Loki**: Visual regression testing tool to catch UI breaking changes automatically
- **SWR or React Query (optional)**: For real-time design token hot-reloading in Storybook

### Documentation Dependencies

- **Color Palette Guide**: Must be expanded to include typography, spacing, shadow guides
- **Developer Onboarding**: Must include comprehensive design token training (expanded from 15 to 20 minutes)
- **Design System Documentation**: Must reflect the centralized token approach for all design properties
- **Component Storybook (if exists)**: Must showcase all token-based variants
- **Manual QA Checklist Templates**: Must be available for each component type (buttons, forms, cards, modals, etc.)
- **Visual Regression Testing Guide**: Documentation on running and interpreting Chromatic/Percy/Loki results

## Out of Scope *(optional)*

### Explicitly Excluded

- **Complete component refactoring**: Only high-priority components will be refactored initially; full migration is a 2-3 week separate effort
- **Email template integration**: HTML email templates can't use CSS variables; they'll need a separate solution (e.g., build-time token injection)
- **Dynamic user customization**: End-users won't be able to customize design tokens; only designers/developers can
- **Advanced theming features**: Complex features like per-page themes or user-created themes are not included
- **Legacy browser support**: Browsers without CSS custom property support (IE11) are not supported
- **Third-party component libraries**: External UI libraries (if any) won't automatically adopt the token system
- **Fluid/responsive typography**: Advanced fluid typography using CSS `clamp()` is not included (static responsive sizes only)
- **Multi-language typography**: Right-to-left (RTL) language support and non-Latin character sets are not addressed
- **Advanced animation system**: Complex animation orchestration, spring physics, or gesture-based animations are excluded
- **Print stylesheets**: Print-specific design tokens are not included (may use default screen tokens)
- **Accessibility automation**: Automated contrast checking tools and linting are not included (manual documentation only)

### Future Enhancements (Not in Initial Implementation)

- Automatic contrast checking tools that warn developers of WCAG violations
- Visual theme builder UI for non-technical users
- Export design tokens to design tools (Figma, Sketch) via plugins
- A/B testing different design schemes for conversion optimization
- Seasonal or promotional theme variations
- Advanced fluid typography with CSS `clamp()` for better responsive scaling
- Typography presets for different content types (marketing, documentation, dashboard)
- Component-specific spacing presets (form spacing, table spacing, card grid spacing)
- Advanced shadow system with colored shadows (brand-colored glows, not just neutral shadows)
- Complex animation orchestration (chained animations, animation sequences)
- Design token versioning system for coordinated design team workflows
- Storybook integration showcasing all token combinations
- Visual regression testing with screenshot comparison

## Risk Assessment *(optional)*

### High Risk

- **Risk**: Refactoring 450+ hardcoded values (200 colors + 150 typography + 100 spacing) might introduce visual regressions
  - **Mitigation**: Gradual migration with thorough visual QA testing; screenshot comparison tools; component-by-component approach
  
- **Risk**: Developers might continue using hardcoded values if the new system is too complex or not well-documented
  - **Mitigation**: Make utilities extremely simple; provide extensive examples; enforce with linting rules; comprehensive onboarding
  
- **Risk**: Typography changes might break layouts or cause text overflow/truncation issues
  - **Mitigation**: Test all font size changes across responsive breakpoints; ensure line-height prevents text clipping; QA high-density content areas

- **Risk**: Spacing system changes might misalign layouts or break responsive grid systems
  - **Mitigation**: Visual testing at all breakpoints; maintain spacing ratios during refactoring; test edge cases (very long content, very short containers)

### Medium Risk

- **Risk**: Performance impact from extensive CSS variable lookups instead of hardcoded values
  - **Mitigation**: CSS variables have negligible performance impact in modern browsers; benchmark critical pages before/after

- **Risk**: Existing themes might break during migration
  - **Mitigation**: Test all 3 themes continuously; maintain backward compatibility during transition; create theme test checklist

- **Risk**: Typography token changes might affect third-party components (charts, date pickers) that have their own font styling
  - **Mitigation**: Document which components need custom typography handling; test data visualization libraries with new font tokens

- **Risk**: Shadow system changes might not be visible enough in dark mode or light mode
  - **Mitigation**: Test shadow visibility in both themes; adjust shadow colors/opacity for theme-specific needs; get design approval

- **Risk**: Animation token changes might conflict with existing animation keyframes in globals.css
  - **Mitigation**: Audit all existing animations before tokenization; plan migration path for custom animations; test all animated components

### Low Risk

- **Risk**: Design token changes might not propagate to all components due to caching
  - **Mitigation**: Clear build cache during token changes; document cache-clearing steps; use cache-busting strategies

- **Risk**: Accessibility violations from new color or typography combinations
  - **Mitigation**: Pre-test all combinations for WCAG compliance; document approved combinations; provide contrast ratio reference

- **Risk**: Border radius changes might make UI feel inconsistent during partial migration
  - **Mitigation**: Migrate border radius in logical groups (all buttons first, then all inputs, then all cards)

- **Risk**: Spacing changes might create unintended visual gaps or cramped layouts
  - **Mitigation**: Test spacing changes with content of varying lengths; ensure 8-point grid maintains visual rhythm

## Open Questions *(optional)*

*These questions don't block implementation but should be considered:*

**Color System Questions:**
1. Should the system support runtime theme customization (e.g., admin panel to change colors without code deployment)?
2. How should we handle print styles - should they use theme colors or a print-specific palette?
3. Do we need separate color tokens for mobile apps if native iOS/Android versions are planned?
4. Should we create a visual style guide page within the app that showcases all colors and variants?
5. How should we version color token changes to coordinate with design team workflows?

**Typography Questions:**
6. Should we implement fluid typography using CSS `clamp()` for smoother responsive scaling?
7. Do we need a separate display font for hero headings, or is Inter sufficient for all use cases?
8. Should font sizes scale proportionally with user browser font size settings (accessibility)?
9. How should we handle typography for data-dense interfaces (tables, admin panels) - smaller scale or same scale?
10. Should we add typography presets for specific content types (e.g., "blog-post", "dashboard-card", "form-label")?

**Spacing Questions:**
11. Should we implement responsive spacing tokens that automatically adjust at breakpoints, or rely on manual responsive classes?
12. Do we need component-specific spacing tokens (e.g., `button-padding-x`, `card-padding-y`) or is the numeric scale sufficient?
13. How should we handle optical spacing adjustments (e.g., icons appearing smaller than text of same size)?
14. Should we enforce the 8-point grid system with linting, or allow exceptions for edge cases?

**Shadow/Elevation Questions:**
15. Should shadows be neutral (black/white opacity) or brand-colored (e.g., teal glow for primary actions)?
16. Do we need separate shadow tokens for different contexts (cards vs dropdowns vs modals)?
17. Should dark mode use lighter shadows or rely more on borders for depth indication?

**Animation Questions:**
18. Should we implement more sophisticated animation tokens (spring physics, custom easing curves)?
19. How should we handle animation orchestration when multiple elements animate in sequence?
20. Should animations have responsive variations (faster on mobile, slower on desktop)?
21. How should we coordinate animation durations with loading states and skeleton screens?

**Implementation Questions:**
22. Should we implement automated screenshot testing to catch visual regressions during refactoring?
23. How should we prioritize component refactoring - by page, by component type, or by usage frequency?
24. Should we create a visual diff tool to compare before/after design token changes?
25. How should we train the team on the new design token system - documentation only, or hands-on workshop?

## Reference Materials *(optional)*

### Audit Documentation

**Color System Audit:**
- `DOC/THEME-AUDIT-SUMMARY.md` - Executive summary of current state and proposed solution
- `DOC/THEME-AUDIT-REPORT-2025-01-27.md` - Comprehensive 600-line technical analysis
- `DOC/COLOR-PALETTE-GUIDE.md` - Visual reference guide with current colors
- `DOC/QUICK-START-THEME-IMPLEMENTATION.md` - Step-by-step implementation guide
- `DOC/THEME-ARCHITECTURE-DIAGRAM.md` - System architecture diagrams

**Typography, Spacing & UI Audit (NEW):**
- `DOC/UI-UX-DESIGN-SYSTEM-AUDIT-2025-01-27.md` - Comprehensive typography, spacing, shadow, animation audit with industry standard comparison

### Implementation Files (Already Created)

**Color System (Ready to Use):**
- `src/lib/theme/colors.ts` - Design token definitions (150 lines, ready to use)
- `src/lib/theme/useThemeColors.ts` - React hook for components (200 lines, ready to use)
- `tailwind.config.NEW.js` - Enhanced Tailwind configuration (90 lines, ready to deploy)

**Typography, Spacing & UI (To Be Created):**
- `src/lib/theme/typography.ts` - Typography token definitions (TBD)
- `src/lib/theme/spacing.ts` - Spacing token definitions following 8-point grid (TBD)
- `src/lib/theme/shadows.ts` - Shadow/elevation token definitions (TBD)
- `src/lib/theme/animations.ts` - Animation/transition token definitions (TBD)
- `src/lib/theme/borders.ts` - Border radius token definitions (TBD)
- `src/lib/theme/useDesignTokens.ts` - Comprehensive React hook for all design tokens (expansion of useThemeColors.ts)
- `tailwind.config.COMPLETE.js` - Full Tailwind configuration with all design tokens

### Current System Files

- `tailwind.config.js` - Current minimal configuration (only 2 colors defined)
- `src/app/globals.css` - Current CSS variables, theme definitions, and animation keyframes (619 lines)
- `src/components/ThemeProvider.tsx` - Theme state management (89 lines, works well)
- `src/app/layout.tsx` - Font configuration (Inter from Google Fonts)

### Key Statistics from Audits

**Color Audit:**
- **200+ hardcoded color instances** across 50+ files
- **3 different color application patterns** causing inconsistency
- **4-6 hours** currently required to change primary color
- **60% industry compliance** score

**Typography Audit (NEW):**
- **150+ hardcoded font size instances** across 50+ components
- **100+ font weight/line-height instances** inconsistently applied
- **2-3 hours** currently required to change typography scale
- **No semantic typography system** (only size-based classes)
- **Single font family (Inter)** with no fallback stack or alternative fonts

**Spacing Audit (NEW):**
- **100+ unique spacing combinations** (padding, margin, gap)
- **3-4 hours** currently required to adjust spacing scale
- **No 8-point grid adherence** (arbitrary values like 13px, 27px found)
- **Inconsistent spacing patterns** across similar components

**Shadow/Animation Audit (NEW):**
- **30+ scattered shadow definitions** with inconsistent elevations
- **15+ animation keyframes** in globals.css without token system
- **50+ inline transition declarations** with varying durations
- **1-2 hours** currently required to adjust shadow/animation system

**Overall Impact:**
- **450+ total hardcoded design values** (200 colors + 150 typography + 100 spacing)
- **10-15 hours** currently required for comprehensive rebranding
- **96% time savings potential** with centralized token system (down to 15-20 minutes)
- **60% industry compliance** (target: 95%+)

### Industry Standards Referenced

- **Material Design 3**: Complete design system including color, typography, spacing, elevation guidelines
- **Ant Design**: Design token documentation and implementation patterns
- **Chakra UI**: Theme specification and token architecture
- **Radix Themes**: Modern token system with excellent developer experience
- **Tailwind CSS**: Design system best practices and theming capabilities
- **Design Tokens Community Group (W3C)**: Token specifications and standards
- **WCAG 2.1 Level AA**: Accessibility guidelines for color contrast and typography readability
- **8-Point Grid System**: Industry-standard spatial system used by Google, Apple, Airbnb

---

## Implementation Workflow & Testing Strategy *(MANDATORY)*

This section defines the **required workflow** for implementing design token migration to ensure **zero "hoping for the best"** and immediate visual validation at every step.

### 🚨 Critical Workflow Rules

1. **NO component refactoring without Storybook story**
2. **NO commits without passing visual regression tests**
3. **NO merge without manual QA checklist completion**
4. **NO batch refactoring - ONE component at a time**
5. **NO token changes without testing in all 3 themes**

---

### Phase 0: Setup (ONE-TIME, ~2-3 hours)

**Goal**: Install and configure visual testing infrastructure before any migration work begins.

#### Setup Tasks:

1. **Install Storybook**:
   ```bash
   npx storybook@latest init
   npm install --save-dev @storybook/addon-a11y @storybook/addon-themes
   ```

2. **Configure Storybook for Next.js + Tailwind**:
   - Update `.storybook/preview.ts` to import `globals.css`
   - Add ThemeProvider wrapper for all stories
   - Configure theme switching addon for Light/Dark/System preview

3. **Install Visual Regression Tool** (choose one):
   - **Chromatic** (recommended, GitHub integration):
     ```bash
     npm install --save-dev chromatic
     npx chromatic --project-token=<token>
     ```
   - **Percy** (alternative):
     ```bash
     npm install --save-dev @percy/cli @percy/storybook
     ```
   - **Loki** (local-first option):
     ```bash
     npm install --save-dev loki
     ```

4. **Create Manual QA Checklist Templates**:
   - Create `specs/004-centralized-theme-color/checklists/component-qa-template.md`
   - Include sections for: Theme Switching, Interactive States, Responsive Breakpoints, Accessibility

5. **Verify Setup**:
   ```bash
   npm run storybook  # Should open on localhost:6006
   npm run chromatic  # Should run visual regression tests
   ```

**Checkpoint**: Storybook running, visual regression tests configured, QA template ready.

---

### Component Migration Workflow (PER COMPONENT)

**Time per component**: 30-60 minutes (including testing)  
**Order**: High-impact components first (buttons, forms, cards, modals)

#### Step 1: Pre-Migration Preparation (5 minutes)

- [ ] Choose ONE component to refactor (e.g., `Button.tsx`)
- [ ] Read relevant spec section (typography, spacing, colors)
- [ ] Review current component implementation
- [ ] Identify all hardcoded values (colors, fonts, spacing, shadows)
- [ ] List which design tokens will replace each hardcoded value

#### Step 2: Create Storybook Story FIRST (10 minutes)

**Critical**: Create the story BEFORE refactoring so you have a visual baseline.

```tsx
// Example: Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

// Create stories for ALL variants
export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary Button' },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Button variant="primary">Default</Button>
      <Button variant="primary" disabled>Disabled</Button>
      <Button variant="primary" className="hover:scale-105">Hover</Button>
    </div>
  ),
};
```

**Verify**:
- [ ] Run `npm run storybook`
- [ ] View component in all variants
- [ ] Take baseline screenshot (manual or Chromatic)

#### Step 3: Refactor Component to Use Design Tokens (15 minutes)

**Before**:
```tsx
<button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium">
  Click Me
</button>
```

**After**:
```tsx
<button className="bg-primary text-white px-button-x py-button-y rounded-button font-button">
  Click Me
</button>
```

**Rules**:
- Replace ALL hardcoded colors with semantic tokens (`bg-primary`, `text-success`)
- Replace ALL hardcoded font sizes with typography tokens (`text-body`, `text-heading-2`)
- Replace ALL hardcoded spacing with spacing tokens (`px-card-padding`, `gap-form-field`)
- Replace ALL hardcoded shadows with elevation tokens (`shadow-card`, `shadow-dropdown`)
- Replace ALL hardcoded border radius with radius tokens (`rounded-button`, `rounded-card`)

#### Step 4: Visual Testing in Storybook (10 minutes)

**Immediate Checks**:
- [ ] Component renders correctly in Storybook
- [ ] Switch between Light/Dark/System themes - verify all look correct
- [ ] Test all interactive states (hover, focus, active, disabled)
- [ ] Test all responsive breakpoints (mobile, tablet, desktop)
- [ ] Check accessibility (color contrast, focus indicators)

**Visual Regression Test**:
```bash
npm run chromatic  # Or Percy/Loki equivalent
```

- [ ] Review visual diff - should show ZERO unexpected changes
- [ ] If differences exist: fix immediately, don't proceed

#### Step 5: Manual QA Checklist (10 minutes)

**Use `specs/004-centralized-theme-color/checklists/component-qa-template.md`**:

```markdown
# Component QA Checklist: Button

**Component**: `src/components/Button.tsx`  
**Refactored by**: [Your Name]  
**Date**: 2025-01-27

## Theme Switching
- [ ] Light theme: All variants display correctly
- [ ] Dark theme: All variants display correctly
- [ ] System theme: Respects OS preference
- [ ] No color flicker when switching themes

## Interactive States
- [ ] Default state: Correct colors/spacing
- [ ] Hover state: Visual feedback clear
- [ ] Focus state: Focus ring visible (accessibility)
- [ ] Active/pressed state: Visual feedback
- [ ] Disabled state: Clearly indicates disabled

## Responsive Breakpoints
- [ ] Mobile (< 640px): Layout/spacing appropriate
- [ ] Tablet (640px - 1024px): Layout/spacing appropriate
- [ ] Desktop (> 1024px): Layout/spacing appropriate

## Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus indicators visible in all themes
- [ ] Screen reader accessible (semantic HTML)

## Design Token Compliance
- [ ] Zero hardcoded colors (all use semantic tokens)
- [ ] Zero hardcoded font sizes (all use typography tokens)
- [ ] Zero hardcoded spacing (all use spacing tokens)
- [ ] Zero hardcoded shadows (all use elevation tokens)
- [ ] Zero hardcoded border radius (all use radius tokens)

## Integration Testing
- [ ] Component works in actual application (not just Storybook)
- [ ] No console errors or warnings
- [ ] No layout breaks on parent pages

**Result**: ✅ PASS / ❌ FAIL  
**Issues Found**: [List any issues]  
**Screenshots**: [Attach if needed]
```

#### Step 6: Integration Test in Real Application (5 minutes)

**Don't just trust Storybook - verify in real app**:

- [ ] Run `npm run dev`
- [ ] Navigate to page(s) using this component
- [ ] Test component in real context (with real data, real layouts)
- [ ] Verify theme switching works
- [ ] Check browser console for errors

#### Step 7: Build & TypeScript Validation (3 minutes)

```bash
npx tsc --noEmit  # Must pass (0 errors)
npm run build     # Must pass (0 errors)
```

- [ ] TypeScript compiles successfully
- [ ] Build completes without errors
- [ ] No type errors related to design tokens

#### Step 8: Commit (2 minutes)

**Only commit if ALL checks pass**:

```bash
git add .
git commit -m "refactor(Button): migrate to design token system

- Replaced hardcoded colors with semantic tokens (bg-primary, text-white)
- Replaced hardcoded spacing with spacing tokens (px-button-x, py-button-y)
- Replaced hardcoded border radius with radius-button token
- Added Storybook stories for all variants
- Visual regression tests passed
- Manual QA checklist completed (all themes, states, breakpoints)

Closes #XXX"
```

**Checkpoint**: Component refactored, visually tested, QA verified, committed.

---

### Continuous Testing During Migration

#### Daily Visual Regression

```bash
# Run visual tests before starting work
npm run chromatic

# Run visual tests after each component migration
npm run chromatic

# Run visual tests before end of day
npm run chromatic
```

#### Weekly QA Review

- [ ] Review all completed QA checklists
- [ ] Verify no patterns of failures
- [ ] Update QA template if new issues discovered
- [ ] Celebrate progress (X/50 components migrated!)

---

### Token Change Testing Workflow

**When design tokens change** (e.g., primary color update, spacing scale adjustment):

1. **Update Token File**:
   ```typescript
   // src/lib/theme/colors.ts
   primary: {
     light: '#3b82f6',  // Changed from #0d9488
     DEFAULT: '#1e40af',
     dark: '#1e3a8a',
   }
   ```

2. **Instant Visual Preview**:
   - Storybook auto-reloads (if using HMR)
   - View ALL components with new token
   - Verify change looks correct across all variants

3. **Visual Regression Test**:
   ```bash
   npm run chromatic
   ```
   - Review ALL visual diffs
   - Approve intentional changes
   - Reject unintended side effects

4. **Manual Spot Check**:
   - Open real application
   - Switch themes (Light/Dark/System)
   - Verify token change propagated correctly
   - Check high-traffic pages (dashboard, forms, modals)

5. **Commit Token Change**:
   ```bash
   git commit -m "design(tokens): update primary color to blue

   - Changed primary color from teal to blue (#1e40af)
   - Visual regression tests approved
   - Verified across 50+ components in Storybook
   - Manual QA completed in all 3 themes"
   ```

---

### Preventing "Crossed Fingers" Syndrome

**Common Failure Modes & Solutions**:

| Failure Mode | Old Approach (Risky) | New Approach (Safe) |
|--------------|---------------------|---------------------|
| **"I'll test everything at the end"** | Refactor 10 components → Test once → Fix 50 bugs | Refactor 1 component → Test immediately → Fix 0-2 bugs |
| **"It looks fine in dev mode"** | Trust visual inspection → Ship → Production breaks | Run visual regression tests → Catch breaks before commit |
| **"I tested in light mode only"** | Assume dark mode works → Users report bugs | Test all 3 themes for every component → Zero theme bugs |
| **"Build passes, ship it"** | TypeScript compiles → Assume UI is correct | Build + Storybook + Visual tests + Manual QA → Confidence |
| **"I don't have time for checklists"** | Skip QA → Spend 3 hours debugging later | Complete 10-min checklist → Save 3 hours later |

---

### Success Metrics (Per Phase)

**After each migration phase** (e.g., "All buttons migrated"), measure:

- [ ] **Visual Regression Pass Rate**: 100% (all tests green)
- [ ] **Manual QA Pass Rate**: 100% (all checklists complete)
- [ ] **Build Success Rate**: 100% (no TypeScript/build errors)
- [ ] **Theme Coverage**: 100% (all 3 themes tested)
- [ ] **Token Compliance**: 100% (zero hardcoded values in migrated components)

**If any metric < 100%**: STOP, fix issues before proceeding to next component.

---

### Example Migration Timeline

**Week 1**: Setup + Foundation (5-10 components)
- Day 1: Storybook setup, visual regression config
- Day 2-5: Migrate buttons, badges, inputs, cards (2 components/day)

**Week 2**: Forms & Modals (10-15 components)
- Day 1-5: Migrate form components, modals, tooltips (2-3 components/day)

**Week 3**: Tables & Dashboards (10-15 components)
- Day 1-5: Migrate table components, dashboard cards, charts (2-3 components/day)

**Week 4**: Polish & Edge Cases (5-10 components)
- Day 1-3: Migrate remaining components (alerts, notifications, etc.)
- Day 4-5: Final QA, documentation, deployment

**Total**: ~40-50 components in 4 weeks (manageable pace with zero risk)

---

### Emergency Rollback Plan

**If migration causes production issues**:

1. **Immediate**:
   ```bash
   git revert <commit-hash>  # Revert last migration commit
   npm run build
   git push
   ```

2. **Investigation** (Post-Rollback):
   - Review visual regression test results
   - Check which QA checklist item was missed
   - Reproduce issue in Storybook
   - Fix in isolated environment
   - Re-run full testing workflow

3. **Prevention**:
   - Add new test case to QA template
   - Update visual regression baseline
   - Document lesson learned

---

## Summary: Zero "Hoping for the Best"

**Old Workflow** (High Risk):
1. Refactor 10 components blindly
2. Hope everything works
3. Ship to production
4. Users report bugs
5. Spend days debugging
6. Frustration and delays

**New Workflow** (Zero Risk):
1. Refactor 1 component with Storybook story
2. Test immediately (visual regression + manual QA)
3. See results in under 5 minutes
4. Fix issues before committing
5. Commit only when 100% confident
6. Repeat for next component

**Result**: Predictable progress, zero surprises, professional quality.

---

## 📚 Document Version History

### Version 2.1 (January 28, 2025) - REDESIGN CLARIFICATION

**Major Updates**:
- ✅ **CRITICAL**: Clarified this is a **REDESIGN/REFACTORING** project (not new site build)
- ✅ Added comprehensive **Page-by-Page Migration Strategy** section (7-step workflow)
- ✅ Added **Per-Page Audit Template** with hardcoded value tracking
- ✅ Added **Token Mapping Template** for systematic replacements
- ✅ Added **Migration Priority Order** (40-50 pages over 3 weeks)
- ✅ Added **Migration Progress Tracking** dashboard template
- ✅ Emphasized **Zero "Hope for the Best"** protocol throughout
- ✅ Updated Phase 1 to include pre-migration audit
- ✅ Updated Phase 3 with page-by-page approach (not bulk refactoring)

**Key Philosophy**:
- "Audit before touching, test after changing, validate before committing"
- "One page at a time, never batch refactoring"
- "Visual regression testing mandatory for every page"
- "No functional changes, only design system improvements"

### Version 2.0 (January 28, 2025) - WORKFLOW INTEGRATION

**Major Updates**:
- ✅ Integrated UI-First Workflow (Phase 0 from constitution.md)
- ✅ Added SpecKit Three-Tier Update System integration
- ✅ Added Mobile-First Standards Compliance section
- ✅ Clarified approval gates and workflow rules
- ✅ Updated status from "Draft" to "Ready for Implementation"
- ✅ Added version history tracking

**Alignment Completed**:
- Constitution Phase 0 workflow → This spec Phase 1-2-3 workflow
- WORKFLOW-MANAGEMENT.md three-tier system → SpecKit Updates section
- INDUSTRY-STANDARD-GUIDELINES.md Section 1.6 → Mobile-First Standards section
- Visual testing workflow → Implementation Workflow & Testing Strategy section

### Version 1.0 (January 27, 2025) - EXPANDED SCOPE

**Initial Specification**:
- Comprehensive design token system covering colors, typography, spacing, shadows, animations
- 10 user stories with acceptance scenarios
- 65 functional requirements (FR-001 to FR-065)
- 64 success criteria (SC-001 to SC-064)
- Implementation workflow with Storybook and visual regression testing
- Expanded from color-only scope to complete design system

---

## ✅ Pre-Implementation Checklist

**Before starting Phase 1 (Token Creation + Sample Pages), verify**:

### Understanding & Context
- [ ] **CRITICAL**: Understand this is a REDESIGN (not new build) - existing 50+ pages must remain functional
- [ ] This spec reviewed and approved by stakeholders
- [ ] All audit documents reviewed (color, typography, spacing, shadow/animation)
- [ ] Current application state documented (what pages exist, what's hardcoded where)
- [ ] Mobile-first standards understood (14px base mobile, 50-75% spacing)
- [ ] UI-first workflow understood (no backend until UI approved)
- [ ] SpecKit three-tier update system understood (tasks → changelog → spec)

### Technical Setup
- [ ] Storybook setup plan understood
- [ ] Visual regression testing tool selected (Chromatic/Percy/Loki)
- [ ] Page-by-page migration strategy understood (7-step workflow)
- [ ] Per-page audit template ready (`audits/[page-name]-audit.md`)
- [ ] Token mapping template ready
- [ ] Manual QA checklist template ready
- [ ] Migration progress tracking dashboard setup

### Team Readiness
- [ ] Team trained on new workflow (20-minute onboarding)
- [ ] Team understands "audit before touching" protocol
- [ ] Team understands "one page at a time" rule (no batch refactoring)
- [ ] Team understands visual regression testing is MANDATORY
- [ ] Rollback procedures documented and understood

### Environment
- [ ] Development environment ready (Node.js, npm, VS Code)
- [ ] Feature branch `004-centralized-theme-color` checked out
- [ ] Staging environment available for validation
- [ ] Production rollback plan documented

**Estimated Total Time**: 
- **Phase 1 (Token Files + Sample Pages)**: 40 hours (Week 1)
  - Token file creation: 16 hours
  - Storybook setup: 8 hours
  - Sample page refactoring (2-3 pages): 12 hours
  - Documentation: 4 hours
- **Phase 2 (Spec Alignment)**: 1 hour (Before Week 2)
- **Phase 3 (Page-by-Page Migration)**: 120 hours (Weeks 2-4)
  - Week 2: 10-15 high-traffic pages (40 hours)
  - Week 3: 15-20 secondary pages + modals (40 hours)
  - Week 4: 10-15 edge cases + final QA (40 hours)
- **Total**: 161 hours (~4 weeks at 40 hours/week)

**Expected ROI**:
- **Time Savings**: 96% reduction in rebranding time (4-6 hours → 5 minutes)
- **Hardcoded Values**: 450+ instances → <10 instances (98% reduction)
- **Industry Compliance**: 60% → 95%+ (professional-grade design system)
- **Developer Productivity**: 50% faster component creation
- **Business Value**: White-label capability, faster iterations, professional consistency
- **Risk Mitigation**: Zero production issues via systematic testing approach

**Success Metrics** (Track Weekly):
- Pages migrated: X / 45 (target: 15 per week)
- Hardcoded values reduced: 450 → X (target: 80-90% reduction)
- Visual regressions: X found, X fixed (target: 0 outstanding)
- Production issues: X (target: 0)
- QA time per page: X minutes (target: 20-30 minutes)

---

## 📞 Support & Questions

**Workflow Questions**: Review `.specify/memory/WORKFLOW-MANAGEMENT.md`  
**Mobile Standards**: Review `DOC/INDUSTRY-STANDARD-GUIDELINES.md` Section 1.6  
**Constitution Principles**: Review `.specify/memory/constitution.md` Phase 0  
**Quick Reference**: Review `.specify/memory/QUICK-REFERENCE.md`

**Spec Owner**: Development Team  
**Last Reviewed**: January 28, 2025  
**Next Review**: Weekly (Friday 4pm) during implementation

---

**Document Status**: ✅ FINALIZED - Ready for Phase 1 Implementation

