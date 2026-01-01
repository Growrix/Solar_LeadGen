---
description: "Task list for News Engine migration execution"
---

# Tasks: NEWS ENGINE — Prototype → Next.js Migration

**Input**:
- `DOC/FEATURES/NEWS ENGINE/MIGRATION/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
- `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-plan-admin.md`
- `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-plan-public.md`

**Prerequisites**:
- Repo workflow authority: `DOC/GUIDELINES & SOT/README.md`
- Design tokens: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md`
- Routing/layout rules: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`
- Migration workflow (mandatory): `specs/007-migration-and-build/plan.md`

**Tests**: Not requested for this migration plan (do not add tests unless explicitly requested later).

**Organization**: Tasks are grouped by user story to enable scoped, low-risk delivery.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, ...)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Docs Lock + Migration Workspace)

**Purpose**: Ensure migration documentation is locked and the folderization stays clean before any code work.

- [ ] T001 [US1] Confirm `DOC/FEATURES/NEWS ENGINE/MIGRATION/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md` is the authoritative migration plan and update any stale links inside it
- [ ] T002 [US1] Confirm `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md` scope matches “News Engine pages + connected modals only” and update if needed
- [ ] T003 [US1] Ensure `DOC/FEATURES/NEWS ENGINE/SOT/INDEX.md` references `SOT/Frontend-Plan.md` and `MIGRATION/` docs (add links if missing)
- [ ] T004 [US1] Ensure `DOC/FEATURES/NEWS ENGINE/MIGRATION/README.md` explains what belongs in `MIGRATION/` and that `Plan Prompts/` is deprecated

**Checkpoint**: Docs lock complete — do not implement until approved.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mandatory GATE 0 and migration guardrails.

- [ ] T005 [US2] Run GATE 0 Typecheck via `npx tsc --noEmit` and record results in migration notes
- [ ] T006 [US2] Run GATE 0 Build via `npm run build` and record results in migration notes
- [ ] T007 [US2] Run GATE 0 Dev start via `npm run dev` (manual confirmation) and record results in migration notes
- [ ] T008 [US2] Run GATE 0 Prisma validate via `npx prisma validate` and record results in migration notes
- [ ] T009 [US2] Create a component dependency-tree checklist for News Engine routes/components (page → child components) to prevent false completion

**Checkpoint**: Foundation ready — execution can begin.

---

## Phase 3: User Story 1 — Public News MVP (Priority: P1)

**Goal**: Public `/news` and `/news/[slug]` exist and show only Published content (UI contract).

**Independent Test**: Navigate to `/news` and `/news/[slug]` and validate loading/empty/not-found states + Share modal behavior.

- [ ] T010 [US3] Implement public listing route at `src/app/news/page.tsx` per `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- [ ] T011 [US3] Implement public details route at `src/app/news/[slug]/page.tsx` per `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- [ ] T012 [US3] Implement Share/Copy Link modal behavior inside `src/app/news/[slug]/page.tsx` (or extracted component if already established)
- [ ] T013 [US3] Verify semantic-token compliance for public routes (no `dark:*`, no hardcoded colors/typography) across the full component tree
- [ ] T014 [US3] Manual theme checks: Dark/Light/Purple for `/news` and `/news/[slug]`
- [ ] T015 [US3] Manual responsive checks: 320 / 375 / 768 / 1024 / 1440 for `/news` and `/news/[slug]`
- [ ] T016 [US3] Manual a11y checks: keyboard navigation + focus + contrast + ARIA labels where needed

**Checkpoint**: Public News MVP complete.

---

## Phase 4: User Story 2 — Admin News Engine Hub Shell (Priority: P1)

**Goal**: `/admin/news-engine` hub exists with tabbed sections matching the plan.

**Independent Test**: Navigate to `/admin/news-engine`; tabs render and switch; no regressions to admin layout.

- [ ] T017 [US4] Implement admin route at `src/app/admin/news-engine/page.tsx` (mount hub)
- [ ] T018 [US4] Implement hub component at `src/components/news-engine/AdminNewsEngineHub.tsx` with tabs defined in `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- [ ] T019 [US4] Ensure admin layout patterns are followed (no redundant wrappers; uses repo admin standards)
- [ ] T020 [US4] Add a minimal admin navigation link to `/admin/news-engine` (target file(s): `src/components/AdminSidebar.tsx` and/or `src/components/AdminMobileSidebarMenu.tsx`)

**Checkpoint**: Admin shell stable.

---

## Phase 5: User Story 3 — Admin Modals + E2E Flow Wiring (Priority: P1)

**Goal**: Preserve the prototype’s page→modal→action transitions as UI-only behavior.

**Independent Test**: Starting from `/admin/news-engine`, reach every modal and confirm close/return behavior.

- [ ] T021 [US5] Implement Review/Draft View modal (entry from Dashboard + Drafts & Reviews)
- [ ] T022 [US5] Implement Scheduling modal (opened from Review)
- [ ] T023 [US5] Implement Test & Preview modal (opened from header action)
- [ ] T024 [US5] Implement Request Rewrite modal (opened from Review)
- [ ] T025 [US5] Implement Reject modal (opened from Review)
- [ ] T026 [US5] Implement Add/Edit Source modal (opened from Sources tab)
- [ ] T027 [US5] Implement Prompt Details modal (opened from Audit Logs tab)
- [ ] T028 [US5] Implement confirmation modals for Pause Automation / Publish Now / Emergency Stop

**Checkpoint**: E2E UI flows wired.

---

## Phase 6: Migration Verification + Build Validation (Cross-Cutting)

**Purpose**: Enforce zero hardcoded styling + multi-theme + build safety.

- [ ] T029 [US6] Run full verification command set (6 commands) against News Engine page files and their child components (no hardcoded colors, no `dark:*`, no hardcoded typography)
- [ ] T030 [US6] Confirm component-tree verification is complete (no unscanned children)
- [ ] T031 [US6] Re-run `npx tsc --noEmit` after changes
- [ ] T032 [US6] Re-run `npm run build` after changes

**Checkpoint**: Migration-safe deliverable.

---

## Dependencies & Execution Order

### Phase Dependencies
- Phase 1 (Docs Lock) → blocks all execution
- Phase 2 (Foundational/GATE 0) → blocks all implementation
- Phases 3–5 can proceed in the listed order (public → admin shell → modals) to minimize risk
- Phase 6 runs after each significant chunk, and must be clean at the end

### Parallel Opportunities
- Within a phase, tasks marked [P] may be split by file/component ownership (only if they do not overlap the same files)
