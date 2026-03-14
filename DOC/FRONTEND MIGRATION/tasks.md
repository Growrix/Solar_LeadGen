---
description: "DS-only frontend migration task list (SOT)"
---

# Tasks: DS-Only Frontend Migration (SOT)

**Input**: Design documents from `DOC/FRONTEND MIGRATION/` and migration workflow from `specs/007-migration-and-build/`
**Prerequisites**: `specs/007-migration-and-build/plan.md` (required), `DOC/FRONTEND MIGRATION/DS-ONLY-MIGRATION-PLAN.md`

**Hard Rules (SOT)**:
- Single DS: all new/migrated UI must import from `@/ds` and rely on `src/ds/styles/index.css`
- UI-only changes: do not change business logic, state variables, event handlers, API calls, auth flows, or validation rules
- No new app-level semantic CSS: add utilities/patterns only inside `src/ds/styles/*`

**Tests**: The `.specify` template includes test tasks as examples. Tests are OPTIONAL - only include them if explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and verification of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure) (Completed)

**Purpose**: Establish DS-only foundation and baseline verification

- [x] T001 Baseline audits captured (hardcoded scan + class audit)

---

## Phase 2: Foundational (Blocking Prerequisites) (Completed)

**Purpose**: Core DS wiring that MUST be complete before any user story migration

**⚠️ CRITICAL**: No user story work should begin unless this phase is complete

- [x] T002 DS CSS imported globally + ThemeInitScript wired
- [x] T003 Fix ThemeProvider to avoid `<html>` class clobber
- [x] T004 Convert internal demo surfaces to DS-only

---

## Phase 3: User Story 1 - Remove legacy UI imports (Priority: P1) 🎯 MVP

**Goal**: eliminate remaining imports from `src/components/ui/*`

**Independent Test**:
- Repo search yields no `@/components/ui/*` imports in migrated targets
- Gate0 tasks: Typecheck + Next build

### Implementation for User Story 1

- [x] T010 [P] [US1] Replace legacy Button imports with DS Button in:
  - `src/components/AdminHomeownersList.tsx`
  - `src/components/DetailedInformationModal.tsx`
  - `src/components/HomeownersInfoForm.tsx`
  - `src/components/OTPVerificationModal.tsx`
  - `src/components/ProfileManagement.tsx`
  - `src/components/QuoteBuilderModal.tsx`
  - `src/components/QuoteOptionsModal.tsx`
  - `src/components/QuoteSuccessModal.tsx`
  - `src/components/RebateCalculatorForm.tsx`
  - `src/components/WrittenQuoteBuilderModal.tsx`
  - `src/components/InstantQuoteForm.tsx`
  - `src/components/HomeownerPreviewModal.tsx`
  - `src/components/BidEvaluationModal.tsx`
  - `src/components/InstallerEligibilityModal.tsx`
  - `src/components/InstallerLeadFeed.tsx`
  - `src/components/homeowner/ContactVerificationModal.tsx`
  - `src/components/homeowner/FirstQuoteSuccessModal.tsx`
  - `src/components/homeowner/HomeownerBiddingReviewModal.tsx`
  - `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
  - `src/components/homeowner/LeadLimitReachedModal.tsx`
  - `src/components/homeowner/QuoteTypeDistributionModal.tsx`
  - `src/components/homeowner/RequestMoreQuotesCTA.tsx`
  - `src/components/homeowner/SimplifiedQuoteForm.tsx`
  - `src/components/installer/VerificationModal.tsx`
  - `src/components/quote-builder/ComplianceDocs.tsx`
  - `src/components/quote-builder/CustomerPreview.tsx`
  - `src/components/quote-builder/PricingEngine.tsx`
  - `src/components/quote-builder/ProductConfiguration.tsx`
  - `src/components/quote-builder/RoofSiteDetails.tsx`

- [x] T011 [P] [US1] Replace legacy Button imports with DS Button in App Router pages:
  - `src/app/homeowner/page.tsx`
  - `src/app/homeowner/dashboard/page.tsx`
  - `src/app/installer/page.tsx`
  - `src/app/installer/(dashboard)/profile/page.tsx`
  - `src/app/admin/instant-quotes/page.tsx`
  - `src/app/admin/installers/[id]/page.tsx`

- [x] T012 [US1] Replace legacy `FlexibleComboBox` usage:
  - Replace `src/components/ui/FlexibleComboBox.tsx` usage in `src/components/quote-builder/ProductConfiguration.tsx` with DS `Autocomplete` (or DS `Select` if appropriate)

- [x] T013 [US1] Replace legacy non-DS Button wrapper with DS Button:
  - Replace `@/components/Button` usage in:
    - `src/app/admin/leads/page.tsx`
    - `src/app/admin/leads/[id]/page.tsx`
    - `src/components/admin/NewsletterTable.tsx`

**Checkpoint**: No product code imports from `src/components/ui/*`.

---

## Phase 4: User Story 2 - Replace legacy form primitives (Priority: P1) 🎯 MVP

**Goal**: remove remaining `.form-input` / `.form-select` usage in high-traffic forms

**Independent Test**:
- Repo search yields no `.form-input` / `.form-select` in migrated targets
- Gate0 tasks: Typecheck + Next build

### Implementation for User Story 2

- [x] T020 [US2] Migrate homeowner signup form to DS inputs:
  - `src/components/HomeownerSignupModal.tsx` (`form-input` → DS `Input`, password toggles via DS `Button variant="icon"`)

- [x] T021 [US2] Migrate admin sign-in form to DS inputs:
  - `src/components/AdminSignIn.tsx` (`form-input` → DS `Input`, `theme-card` → DS Card/Modal patterns as applicable)

- [x] T022 [US2] Migrate quote-builder inputs/selects to DS primitives:
  - `src/components/quote-builder/PricingEngine.tsx` (`form-input`, `form-select`)
  - `src/components/quote-builder/ProductConfiguration.tsx` (`form-input`)
  - `src/components/quote-builder/RoofSiteDetails.tsx` (`form-input`, `form-select`, textarea)
  - `src/components/quote-builder/SystemSelection.tsx` (`form-input`, `form-select`)
  - `src/components/quote-builder/ComplianceDocs.tsx` (`form-input`)

- [x] T023 [US2] Migrate Rebate Calculator form controls to DS primitives:
  - `src/components/RebateCalculatorForm.tsx` (`form-input`, `form-select`)

- [x] T024 [US2] Migrate homeowner sign-in form controls to DS primitives:
  - `src/components/HomeownerSignInModal.tsx` (`form-input`)

- [x] T025 [US2] Migrate homeowner Instant Quote intake form controls to DS primitives:
  - `src/components/InstantQuoteForm.tsx` (`form-input`, `form-select`)

- [x] T026 [US2] Migrate homeowner Simplified Quote intake form controls to DS primitives:
  - `src/components/homeowner/SimplifiedQuoteForm.tsx` (`form-input`, `form-select`)

- [x] T027 [US2] Migrate remaining admin/installer table + filter controls to DS primitives:
  - `src/app/admin/leads/page.tsx` (`form-input`, `form-select`)
  - `src/app/admin/instant-quotes/page.tsx` (`form-input`)
  - `src/components/admin/InstallersTable.tsx` (`form-input`, `form-select`)
  - `src/components/admin/NewsletterTable.tsx` (`form-input`)
  - `src/components/admin/AdminLeadManagementModal.tsx` (`form-input`)
  - `src/components/admin/AdminBidsPanel.tsx` (`form-input`)
  - `src/components/InstallerLeadFeed.tsx` (`form-input`)

**Checkpoint**: No `.form-input` / `.form-select` remain in migrated targets.

---

## Phase 5: User Story 3 - Keep lucide-react behind DS boundary (Priority: P2)

**Goal**: replace direct `lucide-react` imports with DS icon exports (extend `src/ds/icons.ts` as needed)

**Independent Test**: repo search yields no `lucide-react` imports in migrated targets.

### Implementation for User Story 3

 - [x] T030 [P] [US3] Replace direct `lucide-react` imports with DS icon exports in:
  - `src/components/BidEvaluationModal.tsx`
  - `src/components/HomeownerPreviewModal.tsx`
  - `src/components/InstantQuoteForm.tsx`
  - `src/components/homeowner/SimplifiedQuoteForm.tsx`
  - `src/components/NotificationDropdown.tsx`
  - `src/components/QuoteBuilderModal.tsx`
  - `src/components/QuoteOptionsModal.tsx`
  - `src/components/WrittenQuoteBuilderModal.tsx`
  - `src/components/DetailedInformationModal.tsx`
  - `src/components/admin/AdminBidsPanel.tsx`
  - `src/components/quote-builder/*` that import `lucide-react`
  - `src/app/notifications/page.tsx`

**Checkpoint**: No direct `lucide-react` imports remain in migrated targets.

---

## Phase 6: User Story 4 - Migrate shells + navigation (Priority: P2)

**Goal**: reduce global semantic class reliance by migrating layout chrome and navigation patterns.

**Independent Test**: layout and navigation render correctly across themes.

### Implementation for User Story 4

- [x] T040 [US4] Migrate layout shell to DS patterns:
  - `src/components/LayoutContent.tsx` (containers, spacing, and mounted modal wrappers)

- [x] T041 [US4] Migrate top-level navigation components:
  - `src/components/TopBar.tsx`
  - `src/components/Header.tsx`
  - `src/components/AdminBottomNavBar.tsx`
  - `src/components/AdminMobileSidebarMenu.tsx`

- [x] T042 [US4] Remove/retire legacy local ThemeSwitcher if unused:
  - `src/components/ThemeSwitcher.tsx` (ensure all usage swaps to DS `ThemeSwitcher`)

---

## Phase 7: User Story 5 - Modal-heavy flows (Priority: P2)

**Goal**: unify dialogs/modals/drawers on DS `Modal`/`Drawer`/`Card` patterns and remove `.theme-card` wrappers.

**Independent Test**: each modal opens/closes and preserves logic; multi-theme visual checks.

### Implementation for User Story 5

- [x] T050 [US5] Migrate auth/contact modals to DS modal primitives:
  - `src/components/HomeownerSignInModal.tsx`
  - `src/components/HomeownerSignupModal.tsx`
  - `src/components/HomeownersInfoForm.tsx`
  - `src/components/homeowner/ContactVerificationModal.tsx`
  - `src/components/OTPVerificationModal.tsx`

- [x] T051 [US5] Migrate quote modals to DS modal primitives:
  - `src/components/NewQuoteRequestModal.tsx`
  - `src/components/QuoteOptionsModal.tsx`
  - `src/components/QuoteSuccessModal.tsx`
  - `src/components/QuoteBuilderModal.tsx`
  - `src/components/WrittenQuoteBuilderModal.tsx`
  - `src/components/BidEvaluationModal.tsx`
  - `src/components/HomeownerPreviewModal.tsx`


- [x] T052 [US5] Migrate installer flow modals to DS modal primitives:
  - `src/components/InstallerEligibilityModal.tsx`
  - `src/components/installer/VerificationModal.tsx`

---

## Phase 8: User Story 6 - Dashboards + data display (Priority: P3)

**Goal**: move tables/lists/cards to DS `Card`, `DataTable`, `ResourceTable`, `MetricCard` where applicable.

**Independent Test**: each dashboard page renders and primary interactions still work.

### Implementation for User Story 6

- [x] T060 [US6] Migrate admin panels to DS table/list/card patterns:
  - `src/components/admin/AdminBidsPanel.tsx`
  - `src/components/admin/AdminLeadManagementModal.tsx`
  - `src/components/admin/InstallersTable.tsx`
  - `src/components/admin/InstallerProfileModal.tsx`
  - `src/components/AdminHomeownersList.tsx`

- [x] T061 [US6] Migrate installer dashboard surfaces:
  - `src/components/InstallerLeadFeed.tsx`
  - `src/app/installer/(dashboard)/**`

- [x] T062 [US6] Migrate homeowner dashboard surfaces:
  - `src/app/homeowner/dashboard/page.tsx`
  - `src/components/homeowner/**` (dashboard-adjacent modals and panels)

---

## Phase 9: User Story 7 - Remove legacy tokens + semantic CSS (Priority: P3)

**Goal**: delete legacy systems once no longer referenced.

**Independent Test**:
- Repo search yields no `src/design-tokens/*` imports
- Repo search yields no `src/components/ui/*` imports
- Gate0 tasks: Typecheck + Next build

### Implementation for User Story 7

- [x] T070 [US7] Remove remaining references to legacy semantic CSS in `src/app/globals.css` (keep Tailwind directives + DS import + minimal resets only)

- [x] T071 [US7] Remove Tailwind dependency on legacy token module:
  - Update `tailwind.config.js` to remove `require('./src/design-tokens')`
  - Ensure build still passes and DS remains the only token/theme authority

- [x] T072 [US7] Remove or quarantine legacy token code:
  - `src/design-tokens/**` (only after T071 + all usage removed)

- [x] T073 [US7] Remove or quarantine legacy UI components:
  - `src/components/ui/**` (only after Phase 3 removes all imports)

- [x] T074 [US7] Re-run audits and capture “after” snapshot:
  - `npx tsx scripts/audit-css-classes.ts`
  - `npx tsx scripts/scan-hardcoded-values.ts`


**Definition of Done**:
- No usage of `.theme-card`, `.form-input`, `.form-select`, `shadow-neu-*` in product code
- No imports from `src/design-tokens/*`
- No imports from `src/components/ui/*`
- Gate0 tasks pass: Typecheck + Next build

---

## Phase 10: User Story 8 - Path A DS-only consolidation (Public Homepage First) (Priority: P1)

**Goal**: Make the public homepage use DS primitives/components for all interactive + layout primitives (Path A), then use the same approach for the rest of the app.

**Scope (this phase)**:
- Public homepage route: `src/app/page.tsx`
- Homepage sections/components used by that route:
  - `src/components/Hero.tsx`
  - `src/components/Footer.tsx`
  - `src/components/BlogSection.tsx`
  - `src/components/NewsletterSignup.tsx`
  - Homepage quote / auth / verification modals opened from homepage (captured in logic audit)

**Hard Rules**:
- Follow `specs/007-migration-and-build/plan.md` for each migrated component (13-step workflow)
- UI ONLY: do not change business logic, state variables, event handlers, API calls, auth flows, or validation rules
- DS-only primitives: interactive elements should use DS primitives (`Button`, `LinkText`, `Input`, `Modal`, etc.) instead of bespoke Tailwind button/link styling

**Independent Test**:
- Homepage renders and all homepage flows still work (Quote flow + modals)
- Repo search yields no `@/components/Button` imports
- Gate0 tasks: Typecheck + Next build

### Implementation for User Story 8

- [ ] T080 [US8] Gate0 health check before homepage work:
  - Run Gate0 Typecheck + Next build tasks

- [ ] T081 [US8] Create logic audit report for public homepage:
  - Create: `DOC/FRONTEND MIGRATION/audits/T080-logic-audit-public-homepage.md`
  - Include: route, component list, user flows, modal open/close triggers, API calls used

- [ ] T082 [US8] Homepage component inventory (evidence-based):
  - Document the component tree imported by `src/app/page.tsx`
  - Identify which components already use DS primitives and which still use bespoke Tailwind primitives

- [ ] T083 [US8] Pre-migration verification (homepage components):
  - Run SOT verification commands (6 scans) for each component being migrated

- [ ] T084 [US8] Migrate public homepage chrome components to DS primitives (UI-only):
  - `src/components/Footer.tsx`

- [ ] T085 [US8] Migrate remaining public homepage sections to DS primitives (UI-only), if gaps remain:
  - `src/components/Hero.tsx`
  - `src/components/BlogSection.tsx`
  - `src/components/NewsletterSignup.tsx`

- [ ] T086 [US8] Post-migration verification (must be clean for migrated files):
  - All 6 SOT verification commands return 0 matches

- [ ] T087 [US8] Manual UI verification for homepage:
  - Themes: Dark + Light + Purple
  - Responsive: 320 / 375 / 768 / 1024 / 1440
  - Accessibility: keyboard focus + contrast
  - Functionality: quote flow + modal open/close parity

- [ ] T088 [US8] Build validation:
  - `npx tsc --noEmit`
  - `npm run build`

- [ ] T089 [US8] Capture audit snapshot (after homepage Path A):
  - Add report: `DOC/FRONTEND MIGRATION/audits/US8_homepage_pathA_status.md`
  - Include: what changed, what remains, and next components to migrate

---

## Phase 11: User Story 9 - DS Visual Redesign + Single Active Theme (Priority: P1)

**Goal**: Redesign the DS visual language to match the new warm, editorial, product-style direction, keep only one active theme for now, and apply the upgraded DS to homepage top bar auth/modals without changing logic.

**Scope (this phase)**:
- DS foundation and theme runtime:
  - `src/ds/styles/ds.tokens.css`
  - `src/ds/styles/ds.theme.css`
  - `src/ds/styles/ds.components.css`
  - `src/ds/foundation/themes/registry.ts`
  - `src/ds/foundation/themes/theme.ts`
  - `src/ds/foundation/themes/ThemeInitScript.tsx`
  - `src/ds/components/shared/ThemeSwitcher.tsx`
- Top bar auth/modals that must inherit the upgraded DS:
  - `src/components/TopBar.tsx`
  - `src/components/InstallerEligibilityModal.tsx`
  - `src/components/InstallerSignInModal.tsx`
  - `src/components/InstallerSignupModal.tsx`

**Hard Rules**:
- Follow `src/ds/DS_instruciton.md`
- No hardcoded design values in feature files; visual changes must live in DS tokens/styles
- Keep multi-theme infrastructure possible for later, but expose/use only one active theme now
- UI ONLY: do not change auth logic, routing, state flow, API calls, or validation logic

**Independent Test**:
- Homepage top bar auth/modals render with the new DS visual system
- Only one active theme is available in runtime/UI
- Gate0 tasks: Typecheck + Next build

### Implementation for User Story 9

- [ ] T100 [US9] Create deep DS audit for visual redesign + single-theme rollout:
  - Create: `DOC/FRONTEND MIGRATION/audits/T100-ds-visual-redesign-audit.md`
  - Include: theme runtime, token baseline, component style gaps, screenshot design direction, affected surfaces

- [ ] T101 [US9] Simplify DS theme runtime to one active theme while preserving future multi-theme support:
  - `src/ds/foundation/themes/registry.ts`
  - `src/ds/foundation/themes/theme.ts`
  - `src/ds/foundation/themes/ThemeInitScript.tsx`
  - `src/ds/components/shared/ThemeSwitcher.tsx`

- [ ] T102 [US9] Redesign DS tokens for the new warm-light visual system:
  - `src/ds/styles/ds.tokens.css`
  - `src/ds/styles/ds.theme.css`
  - Introduce tokenized surface, border, accent, shadow, radius, and overlay refinements

- [ ] T103 [US9] Redesign DS primitives/components for stronger visual identity:
  - `src/ds/styles/ds.components.css`
  - Upgrade `ui-button`, `ui-input`, `ui-search`, `ui-modal`, `ui-auth-*` styles to a richer product look

- [ ] T104 [US9] Align homepage top bar installer auth surfaces to the redesigned DS (UI-only):
  - `src/components/TopBar.tsx`
  - `src/components/InstallerEligibilityModal.tsx`
  - `src/components/InstallerSignInModal.tsx`
  - `src/components/InstallerSignupModal.tsx`

- [ ] T105 [US9] Verification for redesigned DS surfaces:
  - Verify top bar modal and auth forms have clear button/input affordances
  - Verify only one active theme is exposed in runtime/UI

- [ ] T106 [US9] Build validation:
  - `npx tsc --noEmit`
  - `npm run build`

- [ ] T107 [US9] Capture status snapshot after DS redesign pass:
  - Update: `DOC/FRONTEND MIGRATION/audits/US8_homepage_pathA_status.md`
  - Summarize DS changes, modal/form improvements, and remaining redesign work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Completed
- **Foundational (Phase 2)**: Completed
- **User Stories (Phase 3+)**: Execute sequentially (US1 → US2 → US3 → US4 → US5 → US6 → US7)


