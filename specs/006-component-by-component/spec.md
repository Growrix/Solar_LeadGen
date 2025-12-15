# Feature Specification: Component-by-Component Migration to Neumorphic Design System

**Feature Branch**: `007-component-by-component`  
**Created**: 2025-11-01  
**Status**: Draft  
**Input**: User description: "Component-by-component migration to neumorphic design tokens: systematically migrate InstantQuoteForm, Hero, QuoteOptionsModal, and remaining components to use centralized design tokens, replacing all hardcoded Tailwind classes with semantic tokens, eliminating manual dark mode classes, and ensuring 100% design system compliance through careful component-level refactoring with logic preservation"

---

## 🎯 CRITICAL MIGRATION PRINCIPLES

### Industry Standard: 100% Clean Replacement

**NO hybrid old+new class patterns allowed.** Each component migration MUST be complete replacement.

**Rationale**:
- ✅ **Maintainability**: Mixing `bg-slate-600` and `bg-surface` creates confusion
- ✅ **Consistency**: Partial migrations lead to inconsistent UX
- ✅ **Technical Debt**: Hybrid patterns accumulate, making future refactors harder
- ✅ **Industry Standard**: All major design systems (Material UI, Chakra, shadcn) require complete component replacement

**Migration Rules**:
1. ❌ **FORBIDDEN**: `<div className="bg-slate-700 text-foreground">` (mixing old+new)
2. ❌ **FORBIDDEN**: Some divs use `bg-gray-100`, others use `bg-surface` (inconsistent)
3. ❌ **FORBIDDEN**: Leaving ANY hardcoded classes in migrated components
4. ✅ **REQUIRED**: 100% replacement: `bg-slate-700` → `bg-surface` (ALL instances)
5. ✅ **REQUIRED**: Verification task after each component confirms ZERO old classes remain
6. ✅ **REQUIRED**: Component marked "migrated" only after passing verification

**What "Logic Preservation" Means**:
- ✅ **Preserve Logic**: `onClick={handleSubmit}`, `disabled={isLoading}`, form validation ← Keep these
- ✅ **Preserve Behavior**: Navigation, API calls, state management ← Keep these
- ❌ **Don't Preserve Classes**: `className="bg-slate-700"` ← Replace completely
- ❌ **Don't Preserve Hardcoded Values**: `text-2xl font-bold` ← Replace with `text-heading-2`

---

## 📊 Current State Analysis

### Design System Audit Summary (November 1, 2025)

**Total Violations Found**: ~285 instances across 15+ components  
**Design System Compliance**: 40% (60% of components still use hardcoded classes)  
**Auth Components Migrated**: 1/6 (17%)

### Violation Breakdown by Priority

| Priority | Type | Instances | Impact |
|----------|------|-----------|--------|
| **P0 Critical** | Hardcoded colors | 100+ | Breaks theming, inconsistent UI |
| **P0 Critical** | Manual dark mode classes | 80+ | Defeats CSS variables, not scalable |
| **P1 Important** | Raw Tailwind typography | 50+ | No responsive scaling, poor hierarchy |
| **P1 Important** | Hardcoded input classes | 5 | Code duplication, maintenance burden |
| **P2 Nice-to-have** | Inline SVG icons | 20+ | Bundle size, duplication |

### Components with Most Violations (Priority Order)

1. **InstantQuoteForm.tsx** - 50+ violations (P0)
2. **SimplifiedQuoteForm.tsx** - 35+ violations (P0)
3. **HomeownerMobileSidebarMenu.tsx** - 20 violations (P0)
4. **Hero.tsx** - 6 violations (P0)
5. **QuoteOptionsModal.tsx** - 10 violations (P0)

---

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Audit Component Logic & Create Preservation Map (Priority: P0) 🎯 FOUNDATION

**Actor**: Developer  
**Goal**: Document ALL component logic (state, props, handlers, side effects) BEFORE touching any code

**User Story**: Before migrating a component, developer needs a complete "logic preservation map" that documents every piece of functionality that must work exactly the same after migration. This prevents "hoping for the best" and ensures zero regression bugs.

**Why this priority**: MUST be completed first for each component. Cannot safely migrate without understanding what logic to preserve. Prevents breaking functionality while fixing styling.

**Independent Test**: For target component (e.g., InstantQuoteForm), audit report exists showing: all state variables, props interface, event handlers (onClick, onChange, onSubmit), useEffect hooks, API calls, conditional rendering, form validation, navigation logic. Developer can reference this report during migration to ensure nothing breaks.

**Acceptance Scenarios**:

1. **Given** component selected for migration (e.g., InstantQuoteForm), **When** developer runs logic audit, **Then** markdown report generated in `specs/007-component-by-component/audits/[component-name]-logic.md` with complete logic inventory
2. **Given** audit report generated, **When** developer reviews "State Management" section, **Then** all useState, useReducer, useContext calls documented with: variable name, type, initial value, update functions
3. **Given** component has event handlers, **When** audit runs, **Then** "Event Handlers" section lists: onClick, onChange, onSubmit, onBlur, etc. with exact function signatures and what they do
4. **Given** component has side effects, **When** audit runs, **Then** "Side Effects" section documents: useEffect hooks, dependencies, cleanup functions, API calls
5. **Given** component has conditional rendering, **When** audit runs, **Then** "Conditional Logic" section shows: if/else branches, ternary operators, &&/|| chains, what conditions control what UI
6. **Given** component uses forms, **When** audit runs, **Then** "Form Validation" section flagged as "HIGH RISK - Test Thoroughly" with validation rules, error handling, submission logic
7. **Given** component has navigation, **When** audit runs, **Then** "Navigation" section documents: router.push calls, Link components, redirect logic, URL parameters
8. **Given** audit complete, **When** developer starts migration, **Then** can reference checklist: "Preserve useState for email/password, preserve handleSubmit logic, preserve validation rules, etc."

---

### User Story 1 - Migrate InstantQuoteForm to Design Tokens (Priority: P1) 🎯 MVP

**Actor**: Developer  
**Goal**: Fix the single most violated component (50+ violations) as proof of concept

**User Story**: Developer systematically replaces all 50+ hardcoded Tailwind classes in InstantQuoteForm.tsx with semantic design tokens, eliminating all `bg-slate-*`, `text-slate-*`, `dark:` classes, and raw typography, while preserving ALL form logic, validation, and quote calculation functionality.

**Why this priority**: This is the MOST violated component. Fixing it demonstrates immediate visual improvement, establishes migration pattern for other components, and delivers maximum impact (50+ fixes in one component).

**Independent Test**: After migration, InstantQuoteForm renders identically (or intentionally improved), all form fields work, quote calculation works, validation works, submission works, but grep search shows ZERO hardcoded classes (`bg-slate-`, `text-slate-`, `dark:text-white`). Component passes design system compliance check.

**Acceptance Scenarios**:

1. **Given** InstantQuoteForm has hardcoded background colors, **When** migrated, **Then** ALL replaced: `bg-slate-50/50 dark:bg-slate-800/50` → `bg-surface/50`, `bg-gray-100/50 dark:bg-slate-800/50` → `bg-surface/50`, `bg-white/50 dark:bg-slate-700/30` → `bg-surface/50`
2. **Given** component has hardcoded text colors, **When** migrated, **Then** ALL replaced: `text-slate-700 dark:text-slate-300` → `text-muted-foreground`, `text-slate-800 dark:text-white` → `text-foreground`, `text-slate-900 dark:text-white` → `text-foreground`
3. **Given** component has hardcoded borders, **When** migrated, **Then** ALL replaced: `border-slate-200 dark:border-slate-700` → `border-border`, `border-gray-200 dark:border-slate-700` → `border-border`
4. **Given** component has raw typography, **When** migrated, **Then** replaced: `text-4xl md:text-5xl font-bold` → `text-heading-1`, `text-lg font-semibold` → `text-heading-4`, `text-sm` → `text-body-small`
5. **Given** component uses manual dark mode classes, **When** migrated, **Then** ALL `dark:` classes removed (CSS variables handle theming automatically)
6. **Given** migration complete, **When** grep search runs, **Then** returns ZERO matches for: `bg-slate-`, `text-slate-`, `border-gray-`, `dark:bg-`, `dark:text-`, `text-2xl`, `text-xl`, `font-bold`
7. **Given** form logic preserved, **When** user fills form and clicks submit, **Then** quote calculation works, validation works, all useState/useEffect hooks work exactly as before
8. **Given** component passes verification, **When** added to "migrated" list, **Then** excluded from future violation scans

**Logic Preservation Checklist** (from audit):
- ✅ Preserve: Quote calculation logic (systemSize, totalCost, payback)
- ✅ Preserve: Form validation (required fields, email format, phone format)
- ✅ Preserve: State management (useState for all form fields)
- ✅ Preserve: Submit handler (API call, error handling, success redirect)
- ✅ Preserve: Conditional rendering (loading state, error state, success state)
- ❌ Replace: ALL className strings with design tokens

---

### User Story 2 - Migrate Hero Component to Design Tokens (Priority: P2)

**Actor**: Developer  
**Goal**: Fix homepage hero section (6 violations, high visibility)

**User Story**: Developer replaces hardcoded typography and colors in Hero.tsx, ensuring the main landing page headline uses semantic tokens and proper responsive scaling.

**Why this priority**: Hero is first thing users see. High visibility component. Quick win (only 6 violations). Demonstrates typography token benefits (auto responsive scaling).

**Independent Test**: Hero renders with proper responsive heading (24px → 36px auto-scaling), uses `text-heading-1` instead of manual `text-[34px] sm:text-5xl md:text-6xl lg:text-7xl`, zero hardcoded colors, preserves all animations and layout.

**Acceptance Scenarios**:

1. **Given** Hero has manual responsive typography, **When** migrated, **Then** replaced: `text-[34px] sm:text-5xl md:text-6xl lg:text-7xl font-bold` → `text-heading-1` (auto-responsive, includes font-weight, optimal line-height, letter-spacing)
2. **Given** Hero has hardcoded text colors, **When** migrated, **Then** replaced: `text-slate-900 dark:text-white` → `text-foreground`, `text-slate-600 dark:text-slate-300` → `text-muted-foreground`
3. **Given** migration complete, **When** viewed on mobile (375px), **Then** heading is 24px (optimal mobile size)
4. **Given** migration complete, **When** viewed on tablet (768px), **Then** heading is 30px (auto-scales)
5. **Given** migration complete, **When** viewed on desktop (1440px), **Then** heading is 36px (auto-scales)
6. **Given** component uses animations, **When** migrated, **Then** fade-in-up animations preserved exactly
7. **Given** verification runs, **When** grep search executes, **Then** zero matches for `text-slate-`, `dark:text-`, manual breakpoints (`sm:text-`, `md:text-`)

**Logic Preservation Checklist**:
- ✅ Preserve: Inline animation styles (`style={{ animation: 'fade-in-up 0.8s ease-out' }}`)
- ✅ Preserve: Button click handlers (navigation to quote form)
- ✅ Preserve: Layout structure (spacing, alignment)
- ❌ Replace: Manual responsive typography with `text-heading-1`
- ❌ Replace: Hardcoded colors with design tokens

---

### User Story 3 - Migrate QuoteOptionsModal to Design Tokens (Priority: P3)

**Actor**: Developer  
**Goal**: Fix modal component (10 violations, user flow critical)

**User Story**: Developer migrates QuoteOptionsModal to use design tokens for text and backgrounds, ensuring modal styling is consistent with design system while preserving modal open/close logic and quote type selection.

**Why this priority**: Critical user flow component (user must choose quote type). Moderate violations (10). Good practice for modal patterns before tackling more complex modals.

**Independent Test**: Modal opens/closes correctly, quote type selection works, uses `text-foreground` instead of `text-slate-900 dark:text-white`, zero hardcoded classes, passes verification.

**Acceptance Scenarios**:

1. **Given** modal has hardcoded heading colors, **When** migrated, **Then** replaced: `text-slate-900 dark:text-white` → `text-foreground`
2. **Given** modal has hardcoded body text colors, **When** migrated, **Then** replaced: `text-slate-600 dark:text-slate-400` → `text-muted-foreground`, `text-slate-500 dark:text-slate-400` → `text-subtle`
3. **Given** modal uses raw typography, **When** migrated, **Then** replaced: `text-2xl font-bold` → `text-heading-2`, `text-sm` → `text-body-small`
4. **Given** migration complete, **When** modal opened, **Then** quote type buttons work, selection state updates, continue button enabled after selection
5. **Given** modal logic preserved, **When** user selects "Instant Quote", **Then** onSelectQuoteType('instant') called, modal closes, quote form opens
6. **Given** verification runs, **When** grep search executes, **Then** zero matches for hardcoded classes

**Logic Preservation Checklist**:
- ✅ Preserve: Modal open/close state (isOpen, onClose)
- ✅ Preserve: Quote type selection logic (onSelectQuoteType callback)
- ✅ Preserve: Button click handlers
- ✅ Preserve: Keyboard navigation (ESC to close)
- ❌ Replace: Hardcoded text colors with tokens
- ❌ Replace: Raw typography with semantic classes

---

### User Story 4 - Migrate SimplifiedQuoteForm to Design Tokens (Priority: P4)

**Actor**: Developer  
**Goal**: Replace hardcoded input classes with AuthInput component (35+ violations)

**User Story**: Developer removes 175-character `baseInputClasses` string and replaces all manual inputs with centralized AuthInput component, eliminating code duplication and ensuring consistent form styling across application.

**Why this priority**: Second-most violated component. Demonstrates centralized component usage. High code reduction (175 chars → 1 component per input).

**Independent Test**: All form inputs use `<AuthInput>` component, `baseInputClasses` constant deleted, form submission works, validation works, zero hardcoded input classes, 99% code reduction in input styling.

**Acceptance Scenarios**:

1. **Given** form has baseInputClasses constant with 175 characters, **When** migrated, **Then** constant deleted, replaced with AuthInput component imports
2. **Given** form has manual input with hardcoded classes, **When** migrated, **Then** replaced: `<input className={baseInputClasses}>` → `<AuthInput name="email" type="email" placeholder="Email" value={email} onChange={handleEmailChange} />`
3. **Given** form uses AuthInput, **When** rendered, **Then** input uses neumorphic styling (shadow-neu-inset, proper spacing, icon support) automatically from component
4. **Given** migration complete, **When** input has icon, **Then** AuthInput handles icon positioning automatically (no manual pl-12, icon positioning)
5. **Given** form validation present, **When** migrated, **Then** error handling preserved: `<AuthInput error={errors.email} />` shows red border, error message
6. **Given** form has multiple inputs, **When** all migrated to AuthInput, **Then** consistent styling across all fields (no more inconsistent manual classes)
7. **Given** verification runs, **When** search for baseInputClasses, **Then** zero matches found

**Logic Preservation Checklist**:
- ✅ Preserve: Form state (useState for all fields)
- ✅ Preserve: Validation logic (email regex, required fields)
- ✅ Preserve: Submit handler (API call, error handling)
- ✅ Preserve: onChange handlers for each input
- ❌ Replace: baseInputClasses constant with AuthInput component
- ❌ Replace: Manual `<input>` tags with `<AuthInput>`

---

### User Story 5 - Migrate HomeownerMobileSidebarMenu to Design Tokens (Priority: P5)

**Actor**: Developer  
**Goal**: Fix mobile navigation component (20 violations)

**User Story**: Developer migrates mobile sidebar to use design tokens for navigation items, modal styling, and text colors, ensuring consistent mobile UX.

**Why this priority**: Mobile-only component, moderate violations, critical for mobile UX consistency.

**Independent Test**: Mobile sidebar opens/closes, navigation works, uses design tokens for all colors, zero hardcoded classes.

**Acceptance Scenarios**:

1. **Given** nav items have conditional styling, **When** migrated, **Then** active state: `bg-primary text-white` preserved, inactive state: `bg-gray-100 dark:bg-slate-800` → `bg-surface`, `text-slate-700 dark:text-slate-300` → `text-muted-foreground`
2. **Given** modal backdrop uses hardcoded colors, **When** migrated, **Then** replaced: `bg-white dark:bg-black` → `bg-background`, `border-gray-200 dark:border-slate-800` → `border-border`
3. **Given** close button has hardcoded hover, **When** migrated, **Then** replaced: `hover:bg-gray-100 dark:hover:bg-slate-800` → `hover:bg-surface-hover`
4. **Given** migration complete, **When** user taps hamburger icon, **Then** sidebar slides in, navigation items clickable, routing works
5. **Given** verification runs, **When** grep search executes, **Then** zero hardcoded classes found

**Logic Preservation Checklist**:
- ✅ Preserve: Sidebar open/close animation
- ✅ Preserve: Navigation routing (router.push)
- ✅ Preserve: Active route detection
- ✅ Preserve: Touch gesture handling
- ❌ Replace: Hardcoded colors with tokens

---

### User Story 6 - Complete Remaining Auth Component Migrations (Priority: P6)

**Actor**: Developer  
**Goal**: Migrate remaining 5 auth components to centralized system

**User Story**: Developer migrates HomeownerSignupModal, InstallerSignInModal, InstallerSignupModal, AdminSignInModal, DetailedQuoteAuthModal to use centralized auth components (AuthInput, AuthButton, AuthModal, etc.), following the pattern established by HomeownerSignInModal.

**Why this priority**: Complete the auth migration started earlier. 5 components remaining. Establishes full auth consistency.

**Independent Test**: All 6 auth components use centralized auth components, zero hardcoded input classes, zero inline icons, consistent neumorphic styling, all authentication flows work (login, signup, password reset).

**Acceptance Scenarios**:

1. **Given** HomeownerSignupModal has 345 lines, **When** migrated, **Then** reduced to ~240 lines (30% reduction), uses AuthInput for all fields, AuthButton for submit, zero hardcoded classes
2. **Given** InstallerSignInModal has 225 lines, **When** migrated, **Then** reduced to ~160 lines, matches HomeownerSignInModal pattern exactly
3. **Given** InstallerSignupModal has 425 lines (most complex), **When** migrated, **Then** reduced to ~300 lines, multi-step form preserved, uses AuthInput throughout
4. **Given** AdminSignInModal has 146 lines, **When** migrated, **Then** reduced to ~100 lines, admin-specific styling preserved via variant props
5. **Given** DetailedQuoteAuthModal has 200 lines, **When** migrated, **Then** reduced to ~140 lines, guest quote flow preserved
6. **Given** all auth components migrated, **When** user tests signup flow, **Then** email validation works, password strength indicator works, form submission works
7. **Given** all auth components migrated, **When** user tests login flow, **Then** credential validation works, error messages display, redirect to dashboard works

**Logic Preservation Checklist** (per component):
- ✅ Preserve: Form validation (email, password strength, phone format)
- ✅ Preserve: Submit handlers (API calls, error handling, redirects)
- ✅ Preserve: State management (useState for form fields)
- ✅ Preserve: Loading states (spinner during API calls)
- ✅ Preserve: Error display (validation errors, API errors)
- ❌ Replace: Inline input classes with AuthInput
- ❌ Replace: Inline button classes with AuthButton
- ❌ Replace: Inline icons with centralized icon components

---

### User Story 7 - Create Component Verification Script (Priority: P7)

**Actor**: Developer  
**Goal**: Automated check to verify component is 100% migrated (no hybrid patterns)

**User Story**: Developer runs verification script on migrated component to confirm ZERO hardcoded classes remain, ensuring migration is complete before marking component as "done".

**Why this priority**: Enforces 100% clean replacement rule. Prevents partial migrations. Automates quality check.

**Independent Test**: Script scans component file, returns list of any remaining hardcoded classes (bg-slate-, text-slate-, dark:, text-2xl, etc.), exits with error if violations found, exits with success if clean.

**Acceptance Scenarios**:

1. **Given** component migrated but missed one `bg-slate-700`, **When** verification runs, **Then** script outputs: "❌ FAILED: Found 1 violation: bg-slate-700 on line 45", exits with code 1
2. **Given** component fully migrated (zero violations), **When** verification runs, **Then** script outputs: "✅ PASSED: Zero hardcoded classes found", exits with code 0
3. **Given** verification script runs, **When** checking for hardcoded colors, **Then** searches for: `bg-slate-`, `bg-gray-`, `text-slate-`, `text-gray-`, `border-slate-`, `border-gray-`, `bg-white/`, `bg-black/`
4. **Given** verification script runs, **When** checking for manual dark mode, **Then** searches for: `dark:bg-`, `dark:text-`, `dark:border-`, `dark:hover:`
5. **Given** verification script runs, **When** checking for raw typography, **Then** searches for: `text-2xl`, `text-xl`, `text-lg`, `text-base`, `text-sm`, `font-bold`, `font-semibold`, `leading-`
6. **Given** component passes verification, **When** added to migration tracker, **Then** component marked "✅ Migrated" with date, excluded from future scans
7. **Given** developer tries to commit with violations, **When** pre-commit hook runs verification, **Then** commit blocked with error message listing violations

---

### Edge Cases

#### Migration Process Edge Cases
- **What happens if component has mix of hardcoded + token classes during migration?** Component is NOT marked complete until verification passes (zero violations). Partial migrations not allowed.
- **How to handle third-party component libraries that don't use our tokens?** Wrap in semantic div with our classes, or document as exception with inline comment: `{/* Exception: External lib - ChartJS uses own styling */}`
- **What if design token doesn't exist for needed style?** Add to design token system FIRST (update colors.ts, typography.ts, etc.), then use in component. Don't create one-off classes.
- **How to handle dynamic className with template literals?** Use `cn()` utility from shadcn with conditional tokens: `cn("text-body", isActive && "text-primary")`
- **What if component uses CSS Modules alongside Tailwind?** Preserve CSS Modules, migrate only Tailwind classes in className prop. Flag for separate CSS Module refactor if needed.

#### Logic Preservation Edge Cases
- **What if component logic is unclear from code review?** Mark as "HIGH RISK" in audit, add comprehensive test coverage BEFORE migration, pair program during migration
- **How to verify logic preserved after migration?** Run existing tests (if any), manual QA of all user flows, compare behavior with pre-migration recording/screenshots
- **What if component has no tests?** Write tests BEFORE migration based on audit report, ensures logic captured and verifiable
- **How to handle complex state management (useReducer, context)?** Document in audit with state diagram, preserve reducer logic exactly, only change className strings
- **What if form validation is inline (not separate function)?** Extract to separate validation function BEFORE migration (clean code practice), then migrate UI

#### Verification Edge Cases
- **What if verification script has false positives?** Add exception comment above line: `{/* Design system compliant - using responsive Tailwind */}`, script skips lines with this comment
- **How to handle legitimate use of Tailwind utilities (like w-full, flex)?** Verification only flags HARDCODED classes (colors, typography with specific values), not layout utilities
- **What if component needs custom one-time styling?** Use Tailwind utilities but document why: `{/* One-time: Custom grid for this specific dashboard layout */}`, or extract to component-specific CSS if complex

#### User Experience Edge Cases
- **What if migrated component looks slightly different?** Document intentional improvements (better spacing, proper shadows), revert if unintentional, get design approval
- **How to handle responsive behavior changes?** Typography tokens have auto-responsive scaling - may look better. Compare on mobile/tablet/desktop, adjust if needed
- **What if user reports "looks broken" after migration?** Check browser (CSS variable support?), verify no JavaScript errors, compare with pre-migration screenshot

---

## Requirements *(mandatory)*

### Functional Requirements

#### Component Audit (P0 - Foundation)

- **FR-001**: System MUST generate logic audit report for each component BEFORE migration starts
- **FR-002**: Audit report MUST document all state variables (useState, useReducer, useContext) with types and initial values
- **FR-003**: Audit report MUST list all event handlers (onClick, onChange, onSubmit, onBlur, etc.) with function signatures
- **FR-004**: Audit report MUST document all side effects (useEffect hooks, API calls, subscriptions) with dependencies and cleanup
- **FR-005**: Audit report MUST identify conditional rendering logic (if/else, ternary, &&, ||) and what controls visibility
- **FR-006**: Audit report MUST flag form validation and async operations as "HIGH RISK - Test Thoroughly"
- **FR-007**: Audit report MUST include "Logic Preservation Checklist" section with ✅ Preserve / ❌ Replace items

#### Component Migration (P1 - Core Functionality)

- **FR-010**: Developer MUST replace ALL hardcoded color classes: `bg-slate-*` → `bg-surface`, `text-slate-*` → `text-foreground`, `border-gray-*` → `border-border`
- **FR-011**: Developer MUST eliminate ALL manual dark mode classes: `dark:bg-black`, `dark:text-white`, `dark:border-*` (CSS variables handle theming)
- **FR-012**: Developer MUST replace raw typography with semantic tokens: `text-2xl font-bold` → `text-heading-2`, `text-base` → `text-body`
- **FR-013**: Developer MUST replace hardcoded input classes with AuthInput component: `<input className={baseInputClasses}>` → `<AuthInput name="..." />`
- **FR-014**: Developer MUST preserve ALL component logic during migration: state, props, handlers, side effects unchanged
- **FR-015**: Developer MUST add inline comments documenting logic preservation: `{/* Preserved: onClick handler, form validation - only styling changed */}`
- **FR-016**: Migration MUST be 100% clean replacement (NO hybrid old+new class patterns)

#### Component Verification (P0 - Quality Gate)

- **FR-020**: System MUST provide verification script that scans component for hardcoded classes
- **FR-021**: Verification script MUST search for: `bg-slate-`, `bg-gray-`, `text-slate-`, `text-gray-`, `border-slate-`, `border-gray-`, `bg-white/`, `dark:bg-`, `dark:text-`, `text-2xl`, `text-xl`, `font-bold`, `leading-`
- **FR-022**: Verification script MUST exit with error (code 1) if ANY violations found, listing each violation with line number
- **FR-023**: Verification script MUST exit with success (code 0) if ZERO violations found
- **FR-024**: Component MUST pass verification before marked as "migrated" in tracker
- **FR-025**: Pre-commit hook MUST run verification on changed .tsx files and block commit if violations found

#### Migration Tracking (P2 - Progress Monitoring)

- **FR-030**: System MUST maintain migration tracker markdown file showing: component name, status (Not Started / In Progress / Migrated), date completed, violations before/after
- **FR-031**: Migrated components MUST be excluded from future violation scans
- **FR-032**: Tracker MUST show overall progress: X/15 components migrated, Y% design system compliance
- **FR-033**: Tracker MUST list components by priority (P1, P2, P3, etc.)

### Success Criteria *(mandatory)*

**Measurable, technology-agnostic outcomes:**

- **SC-001**: InstantQuoteForm migrated with ZERO hardcoded classes (grep search returns 0 matches), all form functionality works (quote calculation, validation, submission)
- **SC-002**: Hero component uses semantic typography tokens (`text-heading-1`), renders responsively (24px mobile → 36px desktop), zero manual breakpoints
- **SC-003**: QuoteOptionsModal uses design tokens for all colors, modal open/close works, quote type selection works
- **SC-004**: SimplifiedQuoteForm uses AuthInput component for all inputs, `baseInputClasses` constant deleted, form submission works
- **SC-005**: HomeownerMobileSidebarMenu uses design tokens, sidebar animation works, navigation routing works
- **SC-006**: All 6 auth components migrated (HomeownerSignIn done + 5 remaining), zero inline input classes, 30% average code reduction
- **SC-007**: Verification script exists and passes for all migrated components (exits with code 0)
- **SC-008**: Design system compliance increases from 40% to 95%+ (only 5% exceptions remain for third-party libs)
- **SC-009**: Zero manual dark mode classes remain (`dark:text-white`, `dark:bg-black`) - CSS variables handle theming
- **SC-010**: All hardcoded typography replaced with semantic tokens - zero `text-2xl`, `text-xl`, `font-bold` classes on text elements
- **SC-011**: Migration tracker shows 15/15 components migrated with dates and before/after metrics
- **SC-012**: Pre-commit hook blocks commits with hardcoded classes, ensures no new violations introduced

### Assumptions *(optional - include if relevant)*

1. **Design Token System Complete**: Assumes existing design token system in `src/design-tokens/` is comprehensive and covers all needed colors, typography, spacing, shadows
2. **Centralized Auth Components Ready**: Assumes AuthInput, AuthButton, AuthModal, AuthAlert, etc. are production-ready and tested
3. **No Breaking Changes**: Assumes migration only changes className strings, no changes to component APIs or props
4. **Browser Support**: Assumes target browsers support CSS variables (all modern browsers, excludes IE11)
5. **Existing Tests**: Assumes components have some test coverage to verify logic preservation (if not, tests should be written first)
6. **Design Approval**: Assumes minor visual improvements (better spacing, proper shadows) are acceptable, revert if design team disagrees
7. **TypeScript Strict Mode**: Assumes project uses TypeScript strict mode, type errors caught at compile time
8. **Next.js Version**: Assumes Next.js 14+ with App Router (affects how components import and use routing)

### Dependencies *(optional - include if relevant)*

**Internal Dependencies:**
- ✅ Design token system (`src/design-tokens/`)
- ✅ Centralized auth components (`src/components/auth/`)
