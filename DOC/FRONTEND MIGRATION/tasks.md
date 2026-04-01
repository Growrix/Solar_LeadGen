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

## Phase 12: User Story 10 - Prototype-to-DS Conversion (SolarConnect Prototype) (Priority: P1) 🎯

**Goal**: Analyze, audit, and fully convert the Vite-based SolarConnect prototype (`DOC/FRONTEND MIGRATION/solarconnect (3)`) into a strict DS-driven implementation with 100% visual parity, zero inline styling or hardcoded values, and full adherence to the DS architecture.

**Input**: Prototype source at `DOC/FRONTEND MIGRATION/solarconnect (3)/`
**Prerequisites**: Phase 10 (US8) and Phase 11 (US9) complete or in progress; DS foundation stable

**Scope (this phase)**:
- Prototype surfaces (visual truth):
  - `solarconnect (3)/components/home/*` (Hero, BlogSection, BlogCard, FeaturedNewsCard, NewsSection, NewsCard, NewsletterSection, QuoteOptionCard)
  - `solarconnect (3)/components/layout/*` (Header, DocsSubNav)
  - `solarconnect (3)/components/ui/*` (25 primitives: Accordion, Avatar, Badge, Breadcrumbs, Button, Card, Checkbox, Container, Divider, Drawer, Grid, Input, Label, Modal, Pagination, Progress, Radio, Select, Spinner, Stack, Switch, Tabs, Textarea, Tooltip, Typography)
  - `solarconnect (3)/pages/*` (ComponentLibrary, LayoutStructure, Dashboard)
- DS files to extend:
  - `src/ds/styles/ds.tokens.css` (new/updated token variables)
  - `src/ds/styles/ds.theme.css` (theme variable alignment)
  - `src/ds/styles/ds.components.css` (new component class patterns)
  - `src/ds/styles/ds.utilities.css` (new layout/typography utilities)
  - `src/ds/components/shared/*` (new or updated shared components)
  - `src/ds/primitives/*` (primitive variant updates)
  - `src/ds/icons.ts` (missing icon exports)
  - `src/ds/index.ts` (barrel exports for any new DS additions)
- App feature files to rebuild using DS:
  - `src/components/Hero.tsx`
  - `src/components/BlogSection.tsx`
  - `src/components/NewsletterSignup.tsx`
  - `src/components/Footer.tsx`
  - `src/components/Header.tsx`
  - `src/components/TopBar.tsx`
  - `src/app/page.tsx`
  - Dashboard surfaces (as applicable)

**Hard Rules (non-negotiable)**:
- ❌ No inline styles (`style={{}}`) in feature code
- ❌ No hardcoded values (px, hex, rgba, shadows) in feature code
- ❌ No direct Tailwind or raw CSS usage in feature code — all styling via DS classes/tokens
- ❌ No importing from DS internals — only `@/ds` barrel
- ❌ No direct `lucide-react` imports — use DS icons only
- ✅ Prototype is **visual truth** but NOT copied directly — recompose using DS patterns
- ✅ UI ONLY: do not change business logic, state variables, event handlers, API calls, auth flows, or validation rules
- ✅ If something cannot be represented using current DS → extend the DS properly, never hack

**Independent Test**:
- Rebuilt screens visually match prototype (spacing, color, typography, alignment, shadow)
- Only `@/ds` imports used in feature code
- No inline styles or hardcoded values in feature code
- Gate0 tasks: Typecheck + Next build

---

### Phase 12a: Prototype Audit (Deep Analysis) [US10]

**Purpose**: Extract every visual decision, layout pattern, component pattern, and interaction pattern from the prototype

- [x] T110 [US10] Gate0 health check before prototype conversion:
  - Run Gate0 Typecheck + Next build tasks

- [x] T111 [US10] Deep prototype audit — visual tokens extraction:
  - Create: `DOC/FRONTEND MIGRATION/audits/T111-prototype-visual-audit.md`
  - Extract and document:
    - Color palette: primary (brand-50→brand-950), neutral (slate-50→slate-950), accent (red, green, emerald)
    - Spacing scale: all padding, gap, margin values used across prototype
    - Border radius system: rounded-lg, rounded-xl, rounded-2xl, rounded-3xl, rounded-full
    - Shadow and elevation: shadow-sm through shadow-2xl, brand-tinted shadows
    - Typography scale: heading levels 1–6, body sizes (xs→xl), font weights, tracking, leading
    - Gradient patterns: `bg-gradient-to-t`, `bg-gradient-to-br` with exact color stops
    - Animation/transition patterns: ken-burns (15s), fade-in-up, slide transitions, hover effects

- [x] T112 [US10] Deep prototype audit — layout and component patterns:
  - Append to: `DOC/FRONTEND MIGRATION/audits/T111-prototype-visual-audit.md`
  - Document:
    - Page structure: full-screen hero + section bands (py-24) + footer
    - Section patterns: header row with CTA + content grid + mobile CTA variant
    - Card patterns: BlogCard, FeaturedNewsCard (gradient overlay), NewsCard (compact list), QuoteOptionCard (recommended variant)
    - Grid patterns: 3-col responsive, 12-col featured+sidebar, 2-col docs
    - Navigation patterns: fixed header with scroll-blur, DocsSubNav tabs, mobile hamburger + overlay menu
    - Overlay patterns: Modal (sm/md/lg/xl), Drawer (left/right), backdrop-blur overlays
    - Platform patterns: mobile-first responsive (hidden sm:block, md:hidden), no native app-like surface detected

- [x] T113 [US10] Deep prototype audit — interaction and state patterns:
  - Append to: `DOC/FRONTEND MIGRATION/audits/T111-prototype-visual-audit.md`
  - Document:
    - Hero: background image auto-rotation (6s interval), ken-burns zoom, fade transitions, slide indicator dots
    - Header: scroll detection → backdrop-blur + shadow-lg, mobile menu toggle
    - Cards: group-hover scale/opacity transitions, hover border reveal
    - Forms: input focus ring (ring-2 ring-brand-500/50), password toggle, select dropdown open/close
    - Modals: backdrop click close, escape key close, scroll lock
    - Dashboard: stepper progress, stat card icon overlays with hover

---

### Phase 12b: DS Gap Analysis [US10]

**Purpose**: Compare prototype requirements against current DS inventory and identify all gaps

- [x] T114 [US10] DS gap analysis — tokens:
  - Create: `DOC/FRONTEND MIGRATION/audits/T114-ds-gap-analysis.md`
  - Compare prototype token needs vs `src/ds/styles/ds.tokens.css`:
    - Missing color tokens (brand scale completeness, gradient stops, tinted shadows)
    - Missing spacing tokens (section padding py-24, hero heights, specific gaps)
    - Missing shadow tokens (brand-tinted shadows: `shadow-brand-500/20`, `shadow-brand-900/50`)
    - Missing animation tokens (ken-burns keyframes, hero slide transitions, fade-in-up)
    - Missing gradient tokens/utilities
    - Missing backdrop-blur tokens

- [x] T115 [US10] DS gap analysis — components and primitives:
  - Append to: `DOC/FRONTEND MIGRATION/audits/T114-ds-gap-analysis.md`
  - Compare prototype components vs DS inventory:
    - Primitives needing variant updates: Button (white, link, danger, success variants), Badge (glass variant), Card (glass, highlight variants)
    - Missing DS components: FeaturedCard (gradient overlay pattern), CompactListCard (news-item pattern), PricingOptionCard (recommended variant pattern)
    - Missing DS patterns: SectionBand (py-24 section with header+grid), HeroSlider (auto-rotating background), TrustIndicators (pill strip)
    - Missing DS utilities: line-clamp helpers, gradient overlays, ken-burns animation class
    - Missing icons in `src/ds/icons.ts`: compare prototype lucide-react usage vs current 82 exports

- [x] T116 [US10] DS gap analysis — output summary:
  - Append to: `DOC/FRONTEND MIGRATION/audits/T114-ds-gap-analysis.md`
  - Produce categorized action list:
    - **Tokens to add** (with proposed CSS variable names)
    - **Components to create** (with proposed file names)
    - **Primitives to update** (with proposed variant additions)
    - **Utilities to add** (with proposed class names)
    - **Icons to export** (with lucide-react icon names)

---

### Phase 12c: Tokenization [US10]

**Purpose**: Convert all visual decisions from the prototype into DS tokens — no duplication, theme-compatible

- [x] T117 [US10] Extend DS tokens for prototype visual language:
  - `src/ds/styles/ds.tokens.css`:
    - Add missing spacing tokens (section-level padding, hero heights)
    - Add animation/motion tokens (ken-burns duration, hero-slide interval, fade durations)
    - Add shadow tokens for brand-tinted elevation
    - Add gradient tokens if applicable
  - Document rationale for each added token in `DOC/FRONTEND MIGRATION/audits/T117-token-additions.md`

- [x] T118 [US10] Extend DS theme variables for prototype color system:
  - `src/ds/styles/ds.theme.css`:
    - Ensure active theme covers full brand color scale (brand-50→brand-950)
    - Ensure neutral scale (slate-50→slate-950) is token-addressable
    - Add any missing accent color tokens (danger/success/eco)
  - Verify theme compatibility — tokens must work under current active theme

---

### Phase 12d: DS Extension [US10]

**Purpose**: Create or update DS primitives, components, and utilities to cover all prototype patterns

- [x] T119 [P] [US10] Update DS primitives with missing variants:
  - Review and align DS Button variants with prototype (white, link, danger, success, fab size)
  - Review and align DS Badge variants with prototype (glass, solid, soft, outline, surface)
  - Review and align DS Card variants with prototype (glass, highlight + composable Header/Content/Footer)
  - Review and align DS Typography/Heading levels with prototype responsive scaling
  - All changes in `src/ds/primitives/*` and `src/ds/styles/ds.components.css`

- [x] T120 [P] [US10] Add missing DS shared components for prototype patterns:
  - Create or extend in `src/ds/components/shared/`:
    - `FeaturedCard.tsx` — gradient-overlay image card (for featured news/blog)
    - `CompactListItem.tsx` — thumbnail + meta list item (for news sidebar)
    - `PricingOptionCard.tsx` — option card with recommended variant (for quote options)
  - Each component must use only DS tokens/classes — zero hardcoded values
  - Export from `src/ds/index.ts`

- [x] T121 [P] [US10] Add DS utilities for prototype layout patterns:
  - `src/ds/styles/ds.utilities.css`:
    - Section band pattern (`.ui-section-band` — standardized section padding + border-top)
    - Section header pattern (`.ui-section-header` — flex row with title/subtitle/CTA)
    - Line-clamp utilities (`.ui-line-clamp-2`, `.ui-line-clamp-3`)
    - Gradient overlay utility (`.ui-gradient-overlay`)
  - `src/ds/styles/ds.components.css`:
    - Ken-burns animation class (`.ui-ken-burns`)
    - Hero-slide fade transition class (`.ui-hero-fade`)
    - Background blur utility (`.ui-backdrop-blur`)

- [x] T122 [P] [US10] Export missing icons from DS:
  - `src/ds/icons.ts`:
    - Compare prototype lucide-react usage against current 82 exports
    - Add any missing icons (e.g., Newspaper, Leaf, ChevronRight if not present)
  - Verify all prototype icon needs are covered by DS exports

---

### Phase 12e: Screen Rebuild [US10]

**Purpose**: Rebuild all app screens to match prototype visuals using DS primitives, components, and layout shells — do NOT copy prototype JSX directly; recompose using DS patterns

- [x] T123 [US10] Pre-rebuild verification — run 6 SOT verification commands for all target files:
  - `src/components/Hero.tsx`
  - `src/components/BlogSection.tsx`
  - `src/components/NewsletterSignup.tsx`
  - `src/components/Footer.tsx`
  - `src/components/Header.tsx`
  - `src/app/page.tsx`

- [x] T124 [US10] Rebuild homepage Hero section using DS (UI-only):
  - `src/components/Hero.tsx`:
    - Background slider with DS animation tokens (ken-burns, fade transitions)
    - Quote option cards using DS `PricingOptionCard` or DS `Card` composable
    - Trust indicators using DS `Badge` or DS utility pattern
    - Slide indicator dots using DS tokens
    - All text using DS `Heading`, `Text` primitives
    - All layout using DS `Container`, `Stack`, `Grid`
  - Preserve: all state (useState for slide index, useEffect for auto-rotation), event handlers, timers

- [x] T125 [US10] Rebuild homepage BlogSection using DS (UI-only):
  - `src/components/BlogSection.tsx`:
    - Section band using DS section pattern (section header + grid)
    - Blog cards using DS `Card` composable or DS `ImageCard`
    - CTA buttons using DS `Button`
    - Responsive grid using DS `Grid`
  - Preserve: all data props, conditional rendering, mobile/desktop CTA logic

- [x] T126 [US10] Rebuild homepage NewsSection using DS (UI-only):
  - Create or update news section component:
    - Featured article card using DS `FeaturedCard`
    - Sidebar news list using DS `CompactListItem`
    - 12-col grid layout using DS `Grid` (featured: 7–8 cols, sidebar: 4–5 cols)
    - Section header with CTA using DS pattern
  - Preserve: all data props, link targets, external URL handling

- [x] T127 [US10] Rebuild homepage NewsletterSection using DS (UI-only):
  - `src/components/NewsletterSignup.tsx`:
    - Gradient background card using DS tokens (no hardcoded gradient colors)
    - Newsletter form using DS `Input` + DS `Button`
    - Feature indicators using DS `Badge` or DS utility
    - Decorative elements using DS visual tokens only
  - Preserve: form submit handler, email validation, loading state

- [x] T128 [US10] Rebuild Header/navigation using DS (UI-only):
  - `src/components/Header.tsx` / `src/components/TopBar.tsx`:
    - Fixed header with scroll-aware backdrop-blur using DS tokens
    - Desktop nav links using DS `LinkText` or DS nav pattern
    - Mobile hamburger menu using DS `Drawer` or DS pattern
    - Logo + brand using DS typography tokens
    - Auth buttons using DS `Button` variants
  - Preserve: scroll event handler, mobile menu toggle state, navigation callbacks

- [x] T129 [US10] Rebuild homepage route composition:
  - `src/app/page.tsx`:
    - Compose sections using DS `PublicShell` layout
    - Ensure section ordering matches prototype: Hero → BlogSection → NewsSection → Newsletter
    - All container/spacing using DS layout primitives

---

### Phase 12f: Platform Mode Verification [US10]

**Purpose**: Verify correct platform treatment — prototype is a web page (not mobile app), confirm DS runtime is set accordingly

- [x] T130 [US10] Platform mode verification:
  - Confirm prototype is treated as **responsive web** (not mobile-app UI)
  - Verify no `data-platform="mobile"` overrides are applied to public homepage
  - Verify DS `PublicShell` layout is used (not mobile `AppShell`)
  - Document any breakpoint-specific behavior differences in audit

---

### Phase 12g: Pixel-Perfect Validation [US10]

**Purpose**: Visual comparison of rebuilt screens against prototype — fix tokens not component code for any mismatches

- [x] T131 [US10] Post-rebuild verification — run 6 SOT verification commands for all rebuilt files:
  - All 6 commands must return 0 matches for every rebuilt file
  - Files: Hero, BlogSection, NewsSection/component, NewsletterSignup, Header, `src/app/page.tsx`

- [x] T132 [US10] Visual validation per screen:
  - Hero: verify spacing, color, typography, alignment, shadow, animation timing
  - BlogSection: verify card layout, grid gaps, responsive breakpoints, hover effects
  - NewsSection: verify featured+sidebar grid, card styles, link treatments
  - NewsletterSection: verify gradient, form styling, badge indicators
  - Header: verify scroll behavior, blur effect, nav link styles, mobile menu
  - If mismatch found → fix tokens in `src/ds/styles/*`, NOT component code

- [x] T133 [US10] Multi-theme visual check:
  - Verify all rebuilt screens under active theme
  - Verify DS token overrides apply correctly
  - Verify no theme-specific hardcoded values leaked into feature code

- [x] T134 [US10] Responsive validation:
  - 5 breakpoints: 320px / 375px / 768px / 1024px / 1440px
  - Verify: hero layout, card grids, section padding, navigation, mobile CTA visibility
  - Verify: text sizing, spacing compression, image handling at each breakpoint

- [x] T135 [US10] Accessibility check:
  - Keyboard navigation: all interactive elements focusable and operable
  - Focus ring visible (DS `ui-focus-ring`)
  - Contrast: WCAG 2.1 AA for all text/background combinations
  - ARIA labels: on navigation, buttons, modals, form inputs

---

### Phase 12h: Compliance Checklist + Build Validation [US10]

**Purpose**: Final verification that all hard rules are met and the build is clean

- [x] T136 [US10] DS compliance checklist verification:
  - [x] Only `@/ds` imports used in feature code (no DS internals)
  - [x] No inline styles (`style={{}}`) in any rebuilt file
  - [x] No hardcoded values (px, hex, rgba, shadows) in any rebuilt file
  - [x] No direct Tailwind in feature code — all styling from DS classes/tokens
  - [x] No direct `lucide-react` imports — all icons from DS
  - [x] All new DS components are reusable and theme-safe
  - [x] All new DS tokens follow naming convention (`--ds-*`)
  - [x] Platform-aware: public pages use web layout, no mobile-app misapplication

- [x] T137 [US10] Build validation:
  - `npx tsc --noEmit`
  - `npm run build`
  - Both must pass with zero errors

- [x] T138 [US10] Capture final audit snapshot:
  - Create: `DOC/FRONTEND MIGRATION/audits/US10_prototype_conversion_status.md`
  - Include:
    - Audit report summary (tokens extracted, gaps found)
    - DS extensions made (tokens added, components created, utilities added)
    - Screens rebuilt (with parity notes)
    - Remaining work (if any screens deferred)
    - Before/after metrics (hardcoded value count, DS import coverage)

**Definition of Done**:
- All rebuilt screens visually match prototype (perceptually identical)
- Zero inline styles or hardcoded values in feature code
- Only `@/ds` imports in feature code — no DS internals, no raw Tailwind, no direct lucide-react
- All new DS tokens, components, and utilities properly exported and documented
- Gate0 tasks pass: Typecheck + Next build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Completed
- **Foundational (Phase 2)**: Completed
- **User Stories (Phase 3+)**: Execute sequentially (US1 → US2 → US3 → US4 → US5 → US6 → US7)
- **Phase 12 (US10)**: Depends on Phase 10 (US8) + Phase 11 (US9) for DS foundation stability; execute sub-phases sequentially (12a → 12b → 12c → 12d → 12e → 12f → 12g → 12h); tasks marked [P] within a sub-phase can run in parallel
- **Phase 13 (US11)**: No dependencies beyond Phase 12h completion; eliminates competing styling systems
- **Phase 14 (US12)**: Depends on Phase 13; converts all raw HTML form elements to DS primitives

---

## Phase 13: DS Consolidation — Eliminate Competing Styling Systems (Critical) 🧹

**Purpose**: Eliminate ALL non-DS styling patterns so the codebase has exactly ONE styling system: the DS (`src/ds/`). No raw Tailwind form styling, no local class-string constants, no ghost CSS classes, no CSS modules.

**Goal**: After this phase, every visual styling decision flows through DS tokens/primitives/utilities defined in `src/ds/`. Components may use Tailwind utilities for layout (flex, grid, gap, padding, margin) but NOT for visual appearance (colors, shadows, borders, typography on form controls).

**Scope**: All TSX files under `src/components/`, `src/app/`, `src/ds/runtime/`

**Hard Rules**:
- ❌ No `baseInputClasses` or similar local style-string constants
- ❌ No `placeholder-*` Tailwind classes (DS handles placeholder styling via `ui-input`)
- ❌ No `shadow-inner` for neumorphic effects (use DS shadow tokens)
- ❌ No raw `<input>` with bespoke Tailwind for visual styling (use DS `Input` or `ui-input` class)
- ❌ No raw `<select>` with bespoke Tailwind (use DS `Select` or `ui-select__control` class)
- ❌ No inline `focus:border-*`, `focus:ring-*`, `focus:outline-none` on form elements (DS `ui-focus-ring` handles this)
- ✅ Layout-only Tailwind is OK: `w-full`, `flex`, `gap-*`, `p-*`, `m-*`, `grid`, etc.
- ✅ DS semantic classes are OK: `text-foreground`, `bg-surface`, `border-border`, `text-heading-*`, `text-body-*`, `text-caption`, `text-label`

---

### Phase 13a: Remove `baseInputClasses` Pattern

**Purpose**: Eliminate the local `baseInputClasses` constant pattern that competes with DS Input styling

- [ ] T200 Replace `baseInputClasses` in `DetailedQuoteAuthModal.tsx`:
  - File: `src/components/DetailedQuoteAuthModal.tsx`
  - Remove the `const baseInputClasses = "..."` declaration (line ~92)
  - Replace all 7 `<input className={baseInputClasses...}>` with `<input className="ui-input ui-focus-ring w-full">`
  - Remove `placeholder-slate-500` (DS handles placeholder color)
  - Preserve: all onChange handlers, validation logic, error state borders

- [ ] T201 Replace `baseInputClasses` in `SimplifiedQuoteForm.tsx`:
  - File: `src/components/homeowner/SimplifiedQuoteForm.tsx`
  - Remove the `const baseInputClasses = "..."` declaration (line ~707)
  - Replace all 10+ `<input className={baseInputClasses}>` and `<select className={baseInputClasses}>` with DS classes
  - Inputs → `className="ui-input ui-focus-ring w-full"`
  - Selects → `className="ui-select__control ui-focus-ring w-full"`
  - Remove `placeholder-muted-foreground` (DS handles it)
  - Preserve: all form state, onChange handlers, validation

---

### Phase 13b: Replace `placeholder-*` Tailwind Classes

**Purpose**: Remove explicit placeholder color classes — DS `ui-input` handles placeholder styling

- [ ] T202 Clean `HomeownersInfoForm.tsx` placeholder + bespoke input styling:
  - File: `src/components/HomeownersInfoForm.tsx`
  - Lines ~166-220: Replace 3 raw `<input>` elements with bespoke Tailwind
  - Current: `className="w-full bg-surface shadow-inner border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"`
  - Replace with: `className="ui-input ui-focus-ring w-full"`
  - Preserve: all value/onChange/placeholder/name/type props

---

### Phase 13c: Replace `shadow-inner` Neumorphic Patterns

**Purpose**: Eliminate legacy `shadow-inner` usage that competes with DS shadow tokens

**Files affected** (~80+ occurrences across many components):

- [ ] T203 Remove `shadow-inner` from DS runtime component:
  - File: `src/ds/runtime/web/Footer.tsx` (line ~33)
  - Replace `shadow-inner` with nothing (or `shadow-card` if container needs shadow)

- [ ] T204 Remove `shadow-inner` from written-quote components:
  - Files: `src/app/components/written-quote/HistoryList.tsx`, `CurrentStateCard.tsx`
  - Replace `shadow-inner` with DS shadow token or remove

- [ ] T205 Remove `shadow-inner` from `InstantQuoteForm.tsx`:
  - File: `src/components/InstantQuoteForm.tsx` (~18 occurrences)
  - Audit each `shadow-inner` usage and replace with DS class or remove
  - Preserve: all form logic, conditionals, state

- [ ] T206 Remove `shadow-inner` from remaining components:
  - Scan all files for `shadow-inner` and replace/remove
  - Key files: `InstallerLeadFeed.tsx`, `VerificationModal.tsx`, `HomeownersInfoForm.tsx`
  - Priority: user-facing components first

---

### Phase 13d: Convert Raw `<input>` Elements to DS

**Purpose**: All text/email/number/tel inputs must use DS `Input` primitive or `ui-input` class

**Files with raw `<input>` (non-DS)**:

- [ ] T207 Convert `ProfileManagement.tsx` inputs (8 raw inputs):
  - File: `src/components/ProfileManagement.tsx`
  - Replace raw `<input>` elements with DS `Input` primitive import
  - Or apply `className="ui-input ui-focus-ring"` to existing `<input>` elements
  - Preserve: all form state, onChange, value bindings, validation

- [ ] T208 Convert `InstantQuoteForm.tsx` inputs (5 raw inputs):
  - File: `src/components/InstantQuoteForm.tsx`
  - Replace raw `<input>` with `ui-input ui-focus-ring` class
  - Preserve: all form logic

- [ ] T209 Convert `MessagingModal.tsx` inputs (2 raw inputs):
  - File: `src/components/MessagingModal.tsx`

- [ ] T210 Convert `WrittenQuoteBuilderModal.tsx` inputs (2 raw inputs):
  - File: `src/components/WrittenQuoteBuilderModal.tsx`

- [ ] T211 Convert `OTPVerificationModal.tsx` input:
  - File: `src/components/OTPVerificationModal.tsx`

- [ ] T212 Convert `NewsletterSignup.tsx` input:
  - File: `src/components/NewsletterSignup.tsx`

- [ ] T213 Convert `InstallerMessagingModal.tsx` input:
  - File: `src/components/InstallerMessagingModal.tsx`

- [ ] T214 Convert `DetailedInformationModal.tsx` inputs:
  - File: `src/components/DetailedInformationModal.tsx`

- [ ] T215 Convert remaining raw `<input>` elements:
  - Run audit script: `npx tsx scripts/diagnostics/ui-consistency-audit.ts`
  - Convert any remaining raw inputs not in `src/ds/` to use DS classes
  - Exception: `<input type="file">`, `<input type="hidden">`, `<input type="checkbox">`, `<input type="radio">` — these have their own DS primitives

---

### Phase 13e: Convert Raw `<select>` Elements to DS

**Purpose**: All `<select>` dropdowns must use DS `Select` primitive or `ui-select__control` class

- [ ] T216 Convert `SimplifiedQuoteForm.tsx` selects (7 raw selects):
  - File: `src/components/homeowner/SimplifiedQuoteForm.tsx`
  - Replace raw `<select>` with `className="ui-select__control ui-focus-ring"`
  - Preserve: all option values, onChange handlers

- [ ] T217 Convert `AdminHomeownersList.tsx` select:
  - File: `src/components/AdminHomeownersList.tsx`

- [ ] T218 Convert `HomeownerWrittenQuoteReviewModal.tsx` select:
  - File: `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`

- [ ] T219 Convert `HomeownerBiddingReviewModal.tsx` select:
  - File: `src/components/homeowner/HomeownerBiddingReviewModal.tsx`

---

### Phase 13f: Verification & Audit

- [ ] T220 Run full audit and verify zero competing patterns:
  - Run: `npx tsx scripts/diagnostics/ui-consistency-audit.ts`
  - Expected: 0 `baseInputClasses`, 0 `placeholder-*`, 0 `shadow-inner` on form controls
  - All raw `<input>`/`<select>` should be in `src/ds/` only (primitives defining them)
  - Run Gate0: `npx tsc -p tsconfig.gate.json --noEmit` + `npm run build`

**Definition of Done (Phase 13)**:
- Zero `baseInputClasses` or similar local style constants
- Zero `placeholder-*` classes outside DS CSS
- Zero `shadow-inner` for form element neumorphic effects
- All `<input>`/`<select>` in feature code use DS classes (`ui-input`, `ui-select__control`)
- Gate0 passes: TypeScript ✓, Next.js build ✓

---

## Phase 14: DS Adoption — Component-Level Migration (Medium) 🔄

**Purpose**: Migrate remaining components from raw HTML + DS class to using DS React primitives (import from `@/ds`). This ensures component-level consistency and access to built-in props (error states, sizes, etc.).

**Goal**: All form controls use DS React primitives (`Input`, `Select`, `Button`, `Switch`, `Checkbox`, `Radio`) imported from `@/ds` instead of raw HTML elements with DS class names.

**Scope**: All components that were given `ui-*` classes in Phase 13 should now import and use the actual DS primitive components.

---

### Phase 14a: Migrate to DS `Input` Primitive

- [ ] T300 Migrate `DetailedQuoteAuthModal.tsx` to DS `Input`:
  - Import `Input` from `@/ds`
  - Replace `<input className="ui-input...">` → `<Input {...props} />`
  - Preserve: all validation, error states, onChange handlers

- [ ] T301 Migrate `HomeownersInfoForm.tsx` to DS `Input`:
  - Same pattern as T300

- [ ] T302 Migrate `ProfileManagement.tsx` to DS `Input`:
  - Same pattern as T300

- [ ] T303 Migrate `InstantQuoteForm.tsx` to DS `Input`:
  - Same pattern as T300

- [ ] T304 Migrate remaining components to DS `Input`:
  - `MessagingModal.tsx`, `WrittenQuoteBuilderModal.tsx`, `OTPVerificationModal.tsx`,
    `NewsletterSignup.tsx`, `InstallerMessagingModal.tsx`, `DetailedInformationModal.tsx`

---

### Phase 14b: Migrate to DS `Select` Primitive

- [ ] T305 Migrate `SimplifiedQuoteForm.tsx` to DS `Select`:
  - Import `Select` from `@/ds`
  - Replace `<select className="ui-select__control...">` → `<Select {...props}><option>...</option></Select>`

- [ ] T306 Migrate remaining selects to DS `Select`:
  - `AdminHomeownersList.tsx`, `HomeownerWrittenQuoteReviewModal.tsx`, `HomeownerBiddingReviewModal.tsx`

---

### Phase 14c: Migrate `toggle-switch` to DS `Switch` Primitive

**Note**: `toggle-switch` classes ARE defined in DS CSS but components use raw `<div>` with these classes instead of the DS `Switch` primitive.

- [ ] T307 Migrate `InstantQuoteForm.tsx` toggle switches (~9 usages):
  - Import `Switch` from `@/ds`
  - Replace raw `<div className="toggle-switch toggle-switch-md...">` → `<Switch checked={...} onChange={...} />`
  - Preserve: all toggle state logic

- [ ] T308 Migrate `SimplifiedQuoteForm.tsx` toggle switches (~9 usages):
  - Same pattern as T307

---

### Phase 14d: Migrate Auth Components to DS Primitives

- [ ] T309 Migrate `AuthButton.tsx` to use DS `Button`:
  - Replace the custom AuthButton component with DS `Button` primitive
  - Or update it to wrap DS `Button` if variant behavior is needed

- [ ] T310 Migrate `AuthInput.tsx` to use DS `Input`:
  - Replace the custom AuthInput component with DS `Input` primitive
  - Or update it to wrap DS `Input` with icon/password-toggle overlay

---

### Phase 14e: Final Verification

- [ ] T311 Run full audit — zero raw form elements in feature code:
  - Run: `npx tsx scripts/diagnostics/ui-consistency-audit.ts`
  - Expected: All raw `<input>`/`<select>` only in `src/ds/primitives/`
  - All form components import from `@/ds`
  - Run Gate0: TypeScript ✓, Next.js build ✓

- [ ] T312 Visual regression check:
  - Verify all migrated forms look identical pre/post migration
  - Test all 3 themes (Dark, Light, Purple)
  - Test responsive at 320px, 768px, 1024px, 1440px

**Definition of Done (Phase 14)**:
- Zero raw `<input>/<select>` in feature code (only in `src/ds/primitives/`)
- All form controls imported from `@/ds`
- All toggle switches use DS `Switch` primitive
- Gate0 passes: TypeScript ✓, Next.js build ✓
- Visual parity maintained across all 3 themes


