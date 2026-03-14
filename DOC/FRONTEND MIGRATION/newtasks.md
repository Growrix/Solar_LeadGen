# Tasks: Centralized DS Styling With Legacy Component Preservation

**Input**: `DOC/FRONTEND MIGRATION/CENTRALIZED-DS-STYLING-TECHNICAL-PLAN.md`, `DOC/FRONTEND MIGRATION/audits/frontend-centralized-ds-styling_audit_20260314.md`.
**Prerequisites**: Current DS token pipeline remains in `src/ds/styles/index.css`; all migration work is UI-only unless a task explicitly says documentation or verification.

**Tests**: Use the 13-step workflow and the 6-command SOT verification set for every migrated component tree. Add automated tests only if a later task explicitly requires them.

**Organization**: Tasks are grouped by user story so each surface can be migrated and validated independently while preserving feature logic in `src/components`.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture the current baseline and lock the corrected migration rules before any component styling changes.

- [ ] T001 Create a Gate 0 baseline report in `DOC/FRONTEND MIGRATION/audits/T001-gate0-baseline.md` using `npx tsc -p tsconfig.gate.json --noEmit`, `npx prisma validate`, and `npm run build`.
- [ ] T002 Create a public-route component-tree audit in `DOC/FRONTEND MIGRATION/audits/T002-public-route-component-tree.md` for `src/app/page.tsx`, `src/components/Hero.tsx`, `src/components/InstantQuoteForm.tsx`, `src/components/RebateCalculatorForm.tsx`, `src/components/QuoteOptionsModal.tsx`, `src/components/QuoteSuccessModal.tsx`, `src/components/HomeownerSignupModal.tsx`, `src/components/HomeownersInfoForm.tsx`, `src/components/OTPVerificationModal.tsx`, `src/components/BlogSection.tsx`, and `src/components/NewsletterSignup.tsx`.
- [ ] T003 [P] Create a DS-style-contract inventory in `DOC/FRONTEND MIGRATION/audits/T003-ds-style-contract-inventory.md` from `src/ds/styles/index.css`, `src/ds/styles/ds.tokens.css`, `src/ds/styles/ds.theme.css`, `src/ds/styles/ds.base.css`, `src/ds/styles/ds.utilities.css`, `src/ds/styles/ds.components.css`, and `tailwind.config.js`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Clear current blockers and define the DS styling contract that all feature components will consume.

**⚠️ CRITICAL**: No user story migration work should begin until this phase is complete.

- [ ] T004 [P] Fix DS barrel misuse in `src/components/QuoteOptionsModal.tsx`, `src/components/homeowner/SimplifiedQuoteForm.tsx`, and `src/components/quote-builder/InstantQuoteResult.tsx` so feature-only components are not imported from `@/ds`.
- [ ] T005 Document the DS export boundary in `DOC/FRONTEND MIGRATION/audits/T005-ds-boundary-rules.md` and align `src/ds/index.ts` with that rule.
- [ ] T006 Create a semantic-style gap report in `DOC/FRONTEND MIGRATION/audits/T006-semantic-class-gap-report.md` for legacy class names used in feature files but not defined in `src/ds/styles/*.css`, including `toggle-switch`, `toggle-knob`, `detail-card`, `cost-item-label`, `performance-item-label`, `info-section`, `neu-card`, and `panel-surface`.
- [ ] T007 Implement DS-owned semantic contracts in `src/ds/styles/ds.utilities.css` and `src/ds/styles/ds.components.css` for overlays, info sections, toggles, result/detail cards, cost/performance rows, and shared panel surfaces identified in T006.
- [ ] T008 Decide the single root visual-mode strategy in `DOC/FRONTEND MIGRATION/audits/T008-root-visual-mode-decision.md` and either wire `src/ds/runtime/app/PlatformPresetScript.tsx` into `src/app/layout.tsx` or explicitly defer/remove dormant `data-visual` behavior from scope.
- [ ] T009 Extend verification automation in `scripts/audit-css-classes.ts` or a sibling script under `scripts/` to report DS barrel misuse, undefined semantic class names, and hardcoded visual tokens across imported component trees.

**Checkpoint**: Gate 0 is green enough to proceed, DS styling contracts are explicit, and verification can detect future drift.

---

## Phase 3: User Story 1 - Public Homepage Uses Central DS Styling (Priority: P1) 🎯 MVP

**Goal**: Keep the public homepage and quote-entry flows working exactly as they do now while moving their visual authority into DS tokens and semantic contracts.

**Independent Test**: The homepage at `/` renders with unchanged behavior, uses DS-governed styles across its full component tree, passes the 6-command verification for the tree, and preserves quote/signup/OTP routing behavior.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create/update a logic audit in `DOC/FRONTEND MIGRATION/audits/T010-logic-audit-public-homepage-centralized-styling.md` covering `src/app/page.tsx` and all homepage child components before UI changes.
- [ ] T011 [US1] Migrate `src/components/Hero.tsx` and `src/components/BlogSection.tsx` to DS-governed section/background/typography contracts using `src/ds/styles/ds.utilities.css`, `src/ds/styles/ds.components.css`, and token-backed classes from `tailwind.config.js`.
- [ ] T012 [US1] Migrate `src/components/NewsletterSignup.tsx` and `src/components/FooterNav.tsx` to DS-governed CTA, surface, and spacing contracts without changing copy or interaction behavior.
- [ ] T013 [US1] Migrate `src/components/InstantQuoteForm.tsx` and `src/components/SavingsChart.tsx` to DS-governed form, toggle, panel, and result contracts without changing quote calculation logic.
- [ ] T014 [US1] Migrate `src/components/RebateCalculatorForm.tsx` to DS-governed modal, form, and result contracts without changing calculator logic.
- [ ] T015 [US1] Migrate `src/components/QuoteOptionsModal.tsx`, `src/components/QuoteSuccessModal.tsx`, `src/components/HomeownerSignupModal.tsx`, `src/components/HomeownersInfoForm.tsx`, and `src/components/OTPVerificationModal.tsx` to DS-governed overlay, card, input, and action styling without changing auth or OTP flow logic.
- [ ] T016 [US1] Migrate `src/components/homeowner/ContactVerificationModal.tsx`, `src/components/homeowner/QuoteTypeDistributionModal.tsx`, `src/components/homeowner/LeadLimitReachedModal.tsx`, and `src/components/homeowner/FirstQuoteSuccessModal.tsx` to the same DS-governed modal contract.
- [ ] T017 [US1] Run the 6-command verification against the full homepage tree and record results in `DOC/FRONTEND MIGRATION/audits/T017-us1-verification.md`.
- [ ] T018 [US1] Validate US1 visually and functionally in dark, light, and purple themes plus breakpoints 320, 375, 768, 1024, and 1440; record findings in `DOC/FRONTEND MIGRATION/audits/T018-us1-theme-responsive-validation.md`.
- [ ] T019 [US1] Run `npx tsc -p tsconfig.gate.json --noEmit` and `npm run build` after US1 and record the outcome in `DOC/FRONTEND MIGRATION/audits/T019-us1-build-validation.md`.

**Checkpoint**: The public funnel is visually controlled by DS while keeping all current business logic intact.

---

## Phase 4: User Story 2 - Shared Product UI Patterns Consume DS Contracts (Priority: P2)

**Goal**: Convert the repeated feature-level patterns used across homeowner, installer, and messaging surfaces to the same centrally governed DS styling contracts.

**Independent Test**: Shared product components render without hardcoded gray/slate/black overlay drift, and repeated UI patterns resolve through DS contracts instead of local one-off styling.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create/update a component-tree audit in `DOC/FRONTEND MIGRATION/audits/T020-shared-product-pattern-tree.md` for `src/components/homeowner/SimplifiedQuoteForm.tsx`, `src/components/homeowner/LeadPreviewModal.tsx`, `src/components/quote-builder/InstantQuoteResult.tsx`, `src/components/MessagingModal.tsx`, `src/components/InstallerMessagingModal.tsx`, `src/components/InstallerMarketplace.tsx`, and `src/components/InstallerPurchasedLeads.tsx`.
- [ ] T021 [US2] Migrate `src/components/homeowner/SimplifiedQuoteForm.tsx` and `src/components/quote-builder/InstantQuoteResult.tsx` to the DS contracts defined in Phase 2 without changing homeowner quote logic.
- [ ] T022 [US2] Migrate `src/components/homeowner/LeadPreviewModal.tsx`, `src/components/homeowner/LeadEditModal.tsx`, and `src/components/homeowner/HomeownerBiddingReviewModal.tsx` to DS-governed overlay, panel, and detail-row contracts.
- [ ] T023 [US2] Migrate `src/components/MessagingModal.tsx` and `src/components/InstallerMessagingModal.tsx` to DS-governed overlay, conversation-shell, typing-indicator, and empty-state styling.
- [ ] T024 [US2] Migrate `src/components/InstallerMarketplace.tsx`, `src/components/InstallerPurchasedLeads.tsx`, and `src/components/installer/InstallerAssignedLeads.tsx` to DS-governed skeleton, filter, card, and action-state styling.
- [ ] T025 [US2] Run the 6-command verification for the US2 component tree and record results in `DOC/FRONTEND MIGRATION/audits/T025-us2-verification.md`.
- [ ] T026 [US2] Validate US2 in all three themes, five breakpoints, and keyboard navigation flows; record results in `DOC/FRONTEND MIGRATION/audits/T026-us2-theme-responsive-a11y-validation.md`.

**Checkpoint**: The shared product UI language is centralized without moving the components themselves into DS.

---

## Phase 5: User Story 3 - Admin, Installer, and App Chrome Respect DS Styling Authority (Priority: P3)

**Goal**: Bring the remaining management and chrome surfaces under the same DS styling rules so the site can be redesigned centrally from `src/ds`.

**Independent Test**: Admin, installer, and app-chrome surfaces stop carrying independent visual systems and follow DS-owned tokens/contracts while preserving all existing workflows.

### Implementation for User Story 3

- [ ] T027 [P] [US3] Create/update a component-tree audit in `DOC/FRONTEND MIGRATION/audits/T027-admin-installer-chrome-tree.md` for `src/ds/runtime/web/AppChrome.tsx`, `src/components/admin/InstallerSelectorModal.tsx`, `src/components/AdminHomeownersAnalytics.tsx`, `src/components/AdminSignIn.tsx`, `src/components/HomeownerMobileSidebarMenu.tsx`, and `src/components/InstallerMobileSidebarMenu.tsx`.
- [ ] T028 [US3] Migrate `src/ds/runtime/web/AppChrome.tsx`, `src/ds/runtime/web/HeaderMenu.tsx`, and `src/ds/runtime/web/TopBar.tsx` to consume only DS-owned visual contracts for sticky headers, mobile chrome, and public navigation states.
- [ ] T029 [US3] Migrate `src/components/admin/InstallerSelectorModal.tsx`, `src/components/AdminHomeownersAnalytics.tsx`, and `src/components/AdminSignIn.tsx` to DS-governed tables, overlays, tabs, and surface contracts.
- [ ] T030 [US3] Migrate `src/components/HomeownerMobileSidebarMenu.tsx`, `src/components/InstallerMobileSidebarMenu.tsx`, and related mobile shell surfaces to the DS root visual-mode strategy chosen in T008.
- [ ] T031 [US3] Run the 6-command verification for the US3 tree and record results in `DOC/FRONTEND MIGRATION/audits/T031-us3-verification.md`.
- [ ] T032 [US3] Validate US3 across dark, light, and purple themes plus responsive/mobile-shell behavior; record results in `DOC/FRONTEND MIGRATION/audits/T032-us3-theme-responsive-validation.md`.

**Checkpoint**: Navigation chrome and management surfaces no longer bypass DS styling authority.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lock the centralized DS styling model so future work cannot regress.

- [ ] T033 [P] Update `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md` with the finalized DS boundary rule, approved semantic contracts, and verification procedure for component trees.
- [ ] T034 Remove any temporary migration-only styling shims from `src/ds/styles/*.css` and reconcile final semantic contract names used by feature files.
- [ ] T035 [P] Run the expanded audit script from T009 across `src/app/**/*.{ts,tsx}` and `src/components/**/*.{ts,tsx}` and save the final report in `DOC/FRONTEND MIGRATION/audits/T035-final-style-audit.md`.
- [ ] T036 Run final Gate 0 validation with `npx tsc -p tsconfig.gate.json --noEmit`, `npx prisma validate`, and `npm run build`, then record results in `DOC/FRONTEND MIGRATION/audits/T036-final-gate0-validation.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 and blocks all user story work.
- **User Story 1 (Phase 3)**: Starts only after Phase 2 is complete.
- **User Story 2 (Phase 4)**: Starts after Phase 2; can overlap US1 only if the DS semantic contracts from T007 are stable.
- **User Story 3 (Phase 5)**: Starts after Phase 2; should follow US1 if App Chrome depends on the same public-surface contracts.
- **Polish (Phase 6)**: Starts after the desired user stories are complete.

### User Story Dependencies

- **US1** is the MVP because it validates the public conversion funnel.
- **US2** depends on the shared DS semantic contracts from T007 and should reuse the patterns stabilized in US1.
- **US3** depends on the same DS contracts plus the root visual-mode decision from T008.

### Within Each User Story

- Update the logic audit first.
- Run baseline verification for the full component tree.
- Migrate UI only.
- Re-run verification until the tree is 0/0/0/0/0/0.
- Validate themes, responsive behavior, accessibility, and original logic.
- Re-run typecheck/build before closing the story.

---

## Parallel Opportunities

- T003 can run in parallel with T002 after T001 starts.
- T004, T005, and T006 can run in parallel in Phase 2, but T007 depends on T006 findings.
- In US1, T011 and T012 can run in parallel after T010 if they do not touch the same DS semantic contracts.
- In US2, T022 and T023 can run in parallel after T020 if contract names are already stable.
- In US3, T029 and T030 can run in parallel after T027 and T028.
- T033 and T035 can run in parallel during Polish.

---

## Implementation Strategy

### MVP First

1. Complete Phases 1 and 2.
2. Complete US1 only.
3. Stop and validate that the homepage and quote-entry journey are visually centralized while logic remains unchanged.

### Incremental Delivery

1. Public homepage and quote funnel.
2. Shared product surfaces.
3. Admin/installer/chrome surfaces.
4. Final audit and SOT hardening.

### Success Metric

Success is **not** “everything imports from `@/ds`.”

Success is:

- `src/components` keeps its business ownership
- `src/ds` controls the visual system centrally
- theme/visual changes can be made from DS with site-wide effect
- Gate 0 and verification are green
