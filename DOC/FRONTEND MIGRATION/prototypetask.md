# Tasks: Prototype-First Public Site Redesign

**Input**: Design documents from `DOC/FRONTEND MIGRATION/Redesign/proto.md` and prototype reference in `DOC/FRONTEND MIGRATION/solarconnect (3)/`
**Prerequisites**: `DOC/FRONTEND MIGRATION/Redesign/proto.md` (required), prototype component references under `DOC/FRONTEND MIGRATION/solarconnect (3)/components/`

**Tests**: Automated tests are not the primary deliverable here. Include code-safety and visual-validation tasks because the redesign plan explicitly requires typecheck, build, and screenshot comparison.

**Organization**: Tasks are grouped by delivery story so each redesign slice can be implemented and validated independently without changing production logic.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which delivery story the task belongs to (`US1`, `US2`, `US3`, `US4`)
- Include exact file paths in descriptions

## Path Conventions
- Single project paths at repository root
- Public UI implementation lives mainly in `src/ds/`, `src/components/`, and `src/app/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Convert the redesign plan into measurable execution inputs before code changes start

- [ ] T001 Create a measured visual audit doc in `DOC/FRONTEND MIGRATION/Redesign/` covering prototype vs live header, hero, calculator band, editorial sections, and footer at `320px`, `375px`, `768px`, `1024px`, and `1440px`
- [ ] T002 Create a component mapping worksheet in `DOC/FRONTEND MIGRATION/Redesign/` that links prototype surfaces under `DOC/FRONTEND MIGRATION/solarconnect (3)/components/` to production files under `src/ds/`, `src/components/`, and `src/app/`
- [ ] T003 [P] Capture baseline screenshots for `/` and `/blog` from the live app for before/after comparison

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the one-theme prototype-aligned DS foundation that all later redesign work depends on

**⚠️ CRITICAL**: No public redesign story should begin until this phase is complete

- [ ] T004 Update `src/ds/foundation/themes/registry.ts` to reduce the public runtime to one prototype-aligned theme
- [ ] T005 Update `src/ds/components/shared/ThemeSwitcher.tsx` to remove or disable public theme switching behavior
- [ ] T006 Update `src/ds/styles/ds.theme.css` so public pages resolve to the single approved theme mode
- [ ] T007 Update `src/ds/styles/ds.tokens.css` with prototype-aligned public tokens for color, typography, spacing, radius, shadows, overlay, and shell sizing
- [ ] T008 [P] Update `src/ds/styles/index.css` only as needed to support the revised DS layering and imports for the one-theme public system
- [ ] T009 [P] Rework shared public visual semantics in `src/ds/styles/ds.components.css` for buttons, cards, badges, inputs, containers, headings, text, and recurring marketing surfaces
- [ ] T010 [P] Update `src/ds/primitives/Button.tsx` to support prototype-accurate CTA proportions without changing consumer logic
- [ ] T011 [P] Update `src/ds/primitives/Card.tsx` to support prototype-accurate marketing card presentation without changing consumer logic
- [ ] T012 [P] Update `src/ds/primitives/Container.tsx` to support prototype-accurate content widths and shell framing
- [ ] T013 [P] Update `src/ds/primitives/Badge.tsx` to support prototype-accurate badge and pill presentation
- [ ] T014 [P] Update `src/ds/primitives/Input.tsx` to support prototype-accurate field styling for newsletter and calculator surfaces
- [ ] T015 [P] Update `src/ds/primitives/Heading.tsx` and `src/ds/primitives/Text.tsx` to align shared typography rendering with the prototype token scale
- [ ] T016 Run `npx tsc -p tsconfig.gate.json --noEmit` after the foundational DS changes
- [ ] T017 Run `npm run build` after the foundational DS changes

**Checkpoint**: One-theme DS foundation is ready and public components can now be redesigned against a stable visual contract

---

## Phase 3: User Story 1 - Public Chrome and Hero Match the Prototype (Priority: P1) 🎯 MVP

**Goal**: Deliver a prototype-accurate public shell and hero while preserving all existing routing, auth, handlers, and slide logic

**Independent Test**: Open `/` and verify the header, top bar, sticky/transparent states, hero layout, indicators, CTAs, card stack, and trust strip visually match the prototype while existing hero interactions still work

### Implementation for User Story 1

- [ ] T018 [US1] Audit current shell behavior in `src/ds/runtime/web/AppChrome.tsx`, `src/ds/runtime/web/HeaderMenu.tsx`, and `src/ds/runtime/web/TopBar.tsx` and document logic that must not change
- [ ] T019 [US1] Update `src/ds/runtime/web/HeaderMenu.tsx` to match prototype navigation structure, spacing, logo scale, CTA treatment, and mobile menu presentation while preserving routing behavior
- [ ] T020 [US1] Update `src/ds/runtime/web/TopBar.tsx` to match prototype-aligned public chrome proportions and styling while preserving installer action wiring
- [ ] T021 [US1] Update `src/ds/runtime/web/AppChrome.tsx` only where needed to support prototype-like transparent and scrolled shell behavior without changing modal or auth logic
- [ ] T022 [US1] Extend `src/ds/styles/ds.components.css` with the final public chrome semantics used by `AppChrome.tsx`, `HeaderMenu.tsx`, and `TopBar.tsx`
- [ ] T023 [US1] Audit `src/components/Hero.tsx` against `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/Hero.tsx` and `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/QuoteOptionCard.tsx` and record all logic that must remain intact
- [ ] T024 [US1] Update `src/components/Hero.tsx` to match prototype hero structure and proportions while preserving `onInstantQuoteClick`, `onRebateCalculatorClick`, slide timing, and interaction pause behavior
- [ ] T025 [US1] Finalize hero-specific semantics in `src/ds/styles/ds.components.css` and token adjustments in `src/ds/styles/ds.tokens.css` for copy width, hero height, indicators, option cards, and trust strip
- [ ] T026 [US1] Run `npx tsc -p tsconfig.gate.json --noEmit` after public chrome and hero work
- [ ] T027 [US1] Run `npm run build` after public chrome and hero work
- [ ] T028 [US1] Capture and compare `/` screenshots at `320px`, `375px`, `768px`, `1024px`, and `1440px` for header transparent state, header scrolled state, hero initial slide, and hero alternate slides

**Checkpoint**: The homepage frame and hero are independently functional and visually aligned to the prototype

---

## Phase 4: User Story 2 - Homepage Sections Follow the Prototype Language (Priority: P2)

**Goal**: Bring the homepage body below the hero into the same prototype-derived design system without changing calculator, blog, or newsletter logic

**Independent Test**: Open `/` and verify the calculator band, blog/editorial region, newsletter block, section transitions, and footer read as one coherent prototype-derived page while all existing quote, rebate, blog, and newsletter flows remain intact

### Implementation for User Story 2

- [ ] T029 [US2] Audit homepage composition in `src/app/page.tsx` and identify all public sections that must be visually reworked without changing flow logic
- [ ] T030 [US2] Update layout and section wrappers in `src/app/page.tsx` so the homepage follows prototype-derived vertical rhythm and section transitions
- [ ] T031 [US2] Update `src/components/InstantQuoteForm.tsx` styling structure to align with the redesigned public DS while preserving submission logic, validation, and modal triggers
- [ ] T032 [US2] Update `src/components/RebateCalculatorForm.tsx` styling structure to align with the redesigned public DS while preserving calculator logic and navigation behavior
- [ ] T033 [US2] Extend `src/ds/styles/ds.components.css` and relevant DS primitives to support the redesigned calculator band, tabs, form cards, and CTA surfaces
- [ ] T034 [US2] Update `src/components/BlogSection.tsx` to visually map to `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/BlogSection.tsx` while preserving WordPress data loading and navigation behavior
- [ ] T035 [US2] Update `src/components/NewsletterSignup.tsx` to visually map to `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/NewsletterSection.tsx` while preserving newsletter validation and submission logic
- [ ] T036 [US2] Update `src/ds/runtime/web/Footer.tsx` and `src/components/FooterNav.tsx` to create a prototype-aligned footer and terminal contact zone while preserving click destinations
- [ ] T037 [US2] Run `npx tsc -p tsconfig.gate.json --noEmit` after homepage section work
- [ ] T038 [US2] Run `npm run build` after homepage section work
- [ ] T039 [US2] Capture and compare `/` screenshots at `320px`, `375px`, `768px`, `1024px`, and `1440px` for calculator band, blog/editorial zone, newsletter block, section transitions, and footer spacing

**Checkpoint**: The full homepage is independently functional and visually coherent under the prototype-derived system

---

## Phase 5: User Story 3 - Public Blog Routes Match the Redesigned Site (Priority: P3)

**Goal**: Bring the blog listing and blog detail surfaces into the same public design language so public routes no longer look like separate systems

**Independent Test**: Open `/blog` and a blog detail page and verify the shell, cards, sidebar, newsletter insertions, spacing, and footer match the redesigned homepage language while search and WordPress-driven content still work

### Implementation for User Story 3

- [ ] T040 [US3] Audit blog route composition in `src/app/blog/page.tsx`, `src/app/blog/BlogIndexClient.tsx`, `src/app/blog/BlogSidebarClient.tsx`, and `src/app/blog/[slug]/page.tsx`
- [ ] T041 [US3] Update `src/app/blog/BlogIndexClient.tsx` to use the redesigned public DS language for hero spacing, search, article cards, pagination/load-more, and footer handoff
- [ ] T042 [US3] Update `src/app/blog/BlogSidebarClient.tsx` to align sidebar widgets and newsletter surfaces with the redesigned DS language
- [ ] T043 [US3] Update `src/app/blog/[slug]/page.tsx` and any directly related blog presentation components to align article detail layout and terminal navigation with the redesigned public system
- [ ] T044 [US3] Update `src/components/NewsletterSignup.tsx` compact variant if needed so blog sidebar usage matches the redesigned homepage system
- [ ] T045 [US3] Extend `src/ds/styles/ds.components.css` only where repeated blog-route semantics are needed across listing and detail pages
- [ ] T046 [US3] Run `npx tsc -p tsconfig.gate.json --noEmit` after blog route work
- [ ] T047 [US3] Run `npm run build` after blog route work
- [ ] T048 [US3] Capture and compare `/blog` and one `/blog/[slug]` page at `375px`, `768px`, `1024px`, and `1440px` for shell consistency, cards, sidebar, newsletter block, and footer

**Checkpoint**: Public blog routes are independently functional and visually consistent with the redesigned homepage

---

## Phase 6: User Story 4 - Public Conversion Modals and Edge Surfaces Stop Falling Back to Old Styling (Priority: P4)

**Goal**: Audit and re-skin public-facing modals and edge entry points that would otherwise visually break the redesigned public system

**Independent Test**: Trigger public sign-in, sign-up, quote options, quote success, and OTP-related flows from the redesigned homepage and confirm they use the updated DS language while all validation and flow logic remain intact

### Implementation for User Story 4

- [ ] T049 [US4] Audit public-facing modal components in `src/components/HomeownerSignupModal.tsx`, `src/components/HomeownerSignInModal.tsx`, `src/components/InstallerSignupModal.tsx`, `src/components/InstallerSignInModal.tsx`, `src/components/QuoteOptionsModal.tsx`, `src/components/QuoteSuccessModal.tsx`, and `src/components/OTPVerificationModal.tsx`
- [ ] T050 [US4] Extend shared modal, form, and overlay semantics in `src/ds/styles/ds.components.css` so public conversion flows inherit the redesigned DS language
- [ ] T051 [US4] Update only the presentational structure of the audited public modal components that still visually mismatch after DS updates, preserving all flow, validation, and API behavior
- [ ] T052 [US4] Audit any additional public edge surfaces triggered from `/` or `/blog` and update only those that visibly regress to the old system
- [ ] T053 [US4] Run `npx tsc -p tsconfig.gate.json --noEmit` after public modal work
- [ ] T054 [US4] Run `npm run build` after public modal work
- [ ] T055 [US4] Capture screenshots for key public modal flows from `/` and verify visual consistency with the redesigned shell

**Checkpoint**: Public conversion flows visually match the redesigned system without logic regressions

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and final validation across all completed redesign stories

- [ ] T056 [P] Remove obsolete public theme classes, dead styling branches, and duplicated migration-only rules from `src/ds/styles/ds.theme.css` and `src/ds/styles/ds.components.css`
- [ ] T057 [P] Update `DOC/FRONTEND MIGRATION/Redesign/proto.md` with any implementation decisions that changed during execution
- [ ] T058 Perform final full-route screenshot comparison for `/`, `/blog`, and one `/blog/[slug]` page against the prototype-derived target
- [ ] T059 Run final `npx tsc -p tsconfig.gate.json --noEmit`
- [ ] T060 Run final `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all implementation stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow User Story 1 for stable shell alignment
- **User Story 3 (Phase 5)**: Depends on Foundational completion and should follow User Story 2 for shared editorial semantics
- **User Story 4 (Phase 6)**: Depends on Foundational completion and should follow the main public shell redesign so only real residual mismatches are touched
- **Polish (Phase 7)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1**: Establishes the public frame and hero and is the MVP slice
- **US2**: Builds on the finalized public frame and shared DS surfaces from US1
- **US3**: Reuses the shared DS language created by US1 and US2
- **US4**: Should happen after US1-US3 so only remaining public mismatches are audited and changed

### Within Each User Story

- Audit current logic first
- Update DS layer before feature-specific overrides when the mismatch is systemic
- Preserve event handlers, API calls, auth logic, validation, and routing
- Run typecheck and build before visual sign-off
- Complete screenshot comparison before marking the story done

### Parallel Opportunities

- T003 can run while T001-T002 are being documented
- T008-T015 can run in parallel after the theme direction is fixed in T004-T007
- Within US2, T031 and T032 can run in parallel after T029-T030 establish the homepage section structure
- Within US3, T041 and T042 can run in parallel after T040 audit is complete

---

## Parallel Example: Foundational Phase

```bash
Task: "Update src/ds/primitives/Button.tsx to support prototype-accurate CTA proportions"
Task: "Update src/ds/primitives/Card.tsx to support prototype-accurate marketing card presentation"
Task: "Update src/ds/primitives/Container.tsx to support prototype-accurate content widths"
Task: "Update src/ds/primitives/Badge.tsx to support prototype-accurate badge presentation"
Task: "Update src/ds/primitives/Input.tsx to support prototype-accurate field styling"
Task: "Update src/ds/primitives/Heading.tsx and src/ds/primitives/Text.tsx to align typography rendering"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1
2. Complete Phase 2
3. Complete Phase 3
4. Stop and validate `/` independently before moving further

### Incremental Delivery

1. Foundation ready
2. Deliver public chrome and hero
3. Deliver full homepage body
4. Deliver blog routes
5. Deliver public modals and residual surfaces
6. Perform final cleanup and validation

### Parallel Team Strategy

With multiple developers:

1. Complete Phase 1 and Phase 2 together
2. Then split by slice:
	- Developer A: US1 public chrome and hero
	- Developer B: US2 homepage body and footer
	- Developer C: US3 blog routes
3. Reserve US4 for final consistency cleanup after shared DS semantics stabilize

---

## Notes

- `[P]` tasks are safe to parallelize only when they do not edit the same file
- Keep all public redesign work frontend-only
- Treat `DOC/FRONTEND MIGRATION/solarconnect (3)/` as visual SOT, not logic SOT
- Prefer DS-led fixes before feature-local patches
- Do not change APIs, auth flows, validation flows, state machines, or routing behavior
- Run screenshot comparison at the defined breakpoints before signing off any story
