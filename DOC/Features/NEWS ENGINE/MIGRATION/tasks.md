---
description: "Task list for News Engine migration execution"
---

# Tasks: NEWS ENGINE — Prototype → Next.js Migration

## Execution Scope Override (Current Run)

Per latest instruction, the only migration scope for this run is:
- Public News Listing Page: `/news`
- Public News Details Page: `/news/[slug]`
- Share modal (Copy Link)

Notes:
- Existing admin migration tasks below are preserved for record/continuity, but they are **out of scope for this run**.
- Do not start admin tasks unless explicitly re-approved in a separate scope instruction.

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

## Stop Rule: No Gate Spam (Mandatory)

This migration is **prototype-locked UI work**. Do **NOT** waste time re-running gates after small UI changes.

Allowed gate cadence:
- **GATE 0 (Phase 2)**: Run once before starting execution (already done).
- **Final Validation (Phase 6)**: Run once at the end.

Only re-run `npx tsc --noEmit` / `npm run build` mid-migration if you hit a blocker (compile/runtime error) that prevents continuing.

## Stop Rule: Mirror Prototype Structure (Mandatory)

This migration is prototype-preserving, and the prototype (V6) already contains separated files/components.

Hard rule:
- Mirror the V6 component/file boundaries in the Next.js feature folder.
- Do not consolidate multiple tabs + multiple modals into a single hub/page “mega component” file.

Stop rule:
> If the next change would add another major tab/modal/surface into a hub file, stop and mirror/extract using the prototype’s existing file boundaries before continuing.

## Mandatory Workflow: Two-Part Migration (Required)

To keep migrations reviewable and reduce risk, prototype-origin UI migrations must follow **two explicit parts**:

Part 1 — Structural mirror (UI preserved):
- Mirror the prototype’s component/file boundaries (tab = module, modal = module).
- Wire triggers/modals so rendered UI/UX matches V6 end-to-end.
- Keep hub/page files thin (orchestrator only).

Part 2 — Design-system compliance (tokenization + class contracts):
- Replace remaining prototype styling with repo semantic tokens (no hardcoded palette, no `dark:*`).
- Fix any repo-enforced `className` violations so commits/builds pass.
- Run multi-theme + verification gates.

**Organization**: Tasks are grouped by user story to enable scoped, low-risk delivery.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, ...)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Docs Lock + Migration Workspace)

**Purpose**: Ensure migration documentation is locked and the folderization stays clean before any code work.

- [x] T001 [US1] Confirm `DOC/FEATURES/NEWS ENGINE/MIGRATION/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md` is the authoritative migration plan and update any stale links inside it
- [x] T002 [US1] Confirm `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md` scope matches “News Engine pages + connected modals only” and update if needed
- [x] T003 [US1] Ensure `DOC/FEATURES/NEWS ENGINE/SOT/INDEX.md` references `SOT/Frontend-Plan.md` and `MIGRATION/` docs (add links if missing)
- [x] T004 [US1] Ensure `DOC/FEATURES/NEWS ENGINE/MIGRATION/README.md` explains what belongs in `MIGRATION/` and that `Plan Prompts/` is deprecated

**Checkpoint**: Docs lock complete — do not implement until approved.

### Migration Contract (Prototype-Locked)
Non-negotiable for this migration:
- Treat **Google AI Studio V6 export** as the **UI SOT** (not a design reference).
- Preserve UI/UX exactly (structure, layout, triggers, modals, labels).
- Allowed changes (scoped by the 2-part workflow):
	- Part 1: UI-preserving structural mirroring + wiring (extract tabs/modals into separate files that match V6; hub orchestration only)
	- Part 2: semantic token `className` swaps + minimal wrapper/layout adjustments required for Next.js/admin-shell embedding
- Forbidden: redesign, replacing UI surfaces (e.g., Kanban → list), changing table columns, changing modal structure or labels.

Authoritative prototype folder:
- `DOC/FEATURES/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin- V6/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mandatory GATE 0 and migration guardrails.

**Rule (to avoid wasted time):** Run GATE 0 **once** before starting execution, then re-run only at meaningful checkpoints (end of a phase / before final validation). Do **not** create extra “results” files unless explicitly requested — the checklist itself is the record.

- [x] T005 [US2] Run GATE 0 Typecheck via `npx tsc --noEmit`
- [x] T006 [US2] Run GATE 0 Build via `npm run build`
- [ ] T007 [US2] Run GATE 0 Dev start via `npm run dev` (manual confirmation, only when actively working in dev)
- [x] T008 [US2] Run GATE 0 Prisma validate via `npx prisma validate`
- [x] T009 [US2] Create a component dependency-tree checklist for News Engine routes/components (page → child components) to prevent false completion (see `DOC/FEATURES/NEWS ENGINE/MIGRATION/component-dependency-tree-checklist.md`)
- [x] T009a [US2] Audit V6 prototype vs current Next.js implementation (E2E: routes → tabs → modals → triggers) and write a report (completed: `DOC/FEATURES/NEWS ENGINE/Audit Reports/v6-vs-current-nextjs-audit-2026-01-03.md`)

**Checkpoint**: Foundation ready — execution can begin.

---

## Phase 3: User Story 1 — Public News MVP (Priority: P1)

**Goal**: Public `/news` and `/news/[slug]` exist and show only Published content (UI contract).

**Independent Test**: Navigate to `/news` and `/news/[slug]` and validate loading/empty/not-found states + Share modal behavior.

- [x] T010 [US3] Implement public listing route at `src/app/news/page.tsx` per `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- [x] T011 [US3] Implement public details route at `src/app/news/[slug]/page.tsx` per `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- [x] T012 [US3] Implement Share/Copy Link modal behavior inside `src/app/news/[slug]/page.tsx` (or extracted component if already established)
- [x] T013 [US3] Verify semantic-token compliance for public routes (no `dark:*`, no hardcoded colors/typography) across the full component tree
- [x] T013a [US3] Run verification scan on `src/app/news/page.tsx` (hardcoded colors, `dark:*`, rgb/hex, hardcoded white/black, raw typography, manual responsive classes)
- [x] T013b [US3] Run verification scan on `src/app/news/[slug]/page.tsx` (same checks)
- [x] T013c [US3] Run verification scan on public route dependencies: `src/components/Footer.tsx`, `src/components/ui/button.tsx`, `src/lib/ui-stubs/news-engine.ts` (only for checks that apply)

### Verification Note (Avoid False Positives)

The repo-wide “manual responsive classes” scan is meant to catch **responsive text sizing** (e.g., `md:text-sm`) and should not block on **alignment utilities** like `lg:text-right`.

If you run the raw regex `sm:text-|md:text-|lg:text-`, it will also match alignment utilities.

Preferred scan for responsive typography only:
```powershell
# Responsive text sizing only (catches md:text-sm, lg:text-xl, etc.)
Select-String -Path "src\app\news\page.tsx" -Pattern "(sm|md|lg):text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)"
Select-String -Path "src\app\news\[slug]\page.tsx" -Pattern "(sm|md|lg):text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)"
```

Allowed:
- `lg:text-right`, `md:text-center`, etc. (alignment)
- [ ] T014 [US3] Manual theme checks: Dark/Light/Purple for `/news` and `/news/[slug]`
- [ ] T015 [US3] Manual responsive checks: 320 / 375 / 768 / 1024 / 1440 for `/news` and `/news/[slug]`
- [ ] T016 [US3] Manual a11y checks: keyboard navigation + focus + contrast + ARIA labels where needed

**Checkpoint**: Public News MVP complete.

---

## Phase 4: User Story 2 — Admin News Engine Hub Shell (Priority: P1)

**Goal**: `/admin/news-engine` hub exists with tabbed sections matching the plan.

**Independent Test**: Navigate to `/admin/news-engine`; tabs render and switch; no regressions to admin layout.

- [x] T017 [US4] Implement admin route at `src/app/admin/news-engine/page.tsx` (mount hub)
- [x] T018 [US4] Replace the hub UI with a **V6-accurate port** rendered inside the existing SolarMatch admin shell (no prototype sidebar/topbar)
- [x] T018a [US4] Ensure V6 header actions exist and match labels/placement: `Test & Preview`, `Create Manual Draft`, and automation state control (V6)
- [x] T018b [US4] Ensure Dashboard UI matches V6 (KPI cards + search + filter row + feed table + actions)
- [x] T018c [US4] Ensure Drafts & Reviews matches V6 (Kanban board + per-column create trigger + top CTA)
- [x] T018d [US4] Ensure Sources matches V6 (Sources & Research layout, table, research toggles/weights, rules, saved indicator)
- [x] T018f [US4] Bring Audit Logs tab to V6 parity (filters + full table columns/badges + footer CTA) in `src/components/news-engine/v6/tabs/AuditLogsTab.tsx`
- [x] T018g [US4] Bring Master Control tab to V6 parity (banner, controls, subsystems grid, safety panel) in `src/components/news-engine/v6/tabs/MasterControlTab.tsx`
- [x] T018h [US4] Bring Automation Logic tab to V6 parity (safety banner + rule cards + saved indicator) in `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx`
- [x] T018i [US4] Bring Settings tab to V6 parity (sections + footer controls + saved indicator) in `src/components/news-engine/v6/tabs/SettingsTab.tsx`
- [x] T018e [US4] Mirror V6 file structure in Next.js (UI-preserving refactor): move each tab + each modal into dedicated feature component files that mirror the prototype’s separation; keep rendered structure/labels/triggers identical to V6; hub becomes orchestrator only
- [x] T019 [US4] Ensure admin layout patterns are followed (no redundant wrappers; uses repo admin standards)
- [x] T020 [US4] Add a minimal admin navigation link to `/admin/news-engine` (target file(s): `src/components/AdminSidebar.tsx` and/or `src/components/AdminMobileSidebarMenu.tsx`)

**Checkpoint**: Admin shell stable.

---

## Phase 5: User Story 3 — Admin Modals + E2E Flow Wiring (Priority: P1)

**Goal**: Preserve the prototype’s page→modal→action transitions as UI-only behavior.

**Independent Test**: Starting from `/admin/news-engine`, reach every modal and confirm close/return behavior.

- [x] T021 [US5] Port the **V6 Review modal** accurately (tab structure + internal sections + actions) and wire it to V6 triggers
- [x] T022 [US5] Implement Scheduling modal (opened from Review)
- [x] T023 [US5] Implement Test & Preview modal (opened from header action)
- [x] T024 [US5] Implement Request Rewrite modal (opened from Review)
- [x] T025 [US5] Implement Reject modal (opened from Review)
- [x] T026 [US5] Implement Add/Edit Source modal (opened from Sources tab)
- [x] T027 [US5] Implement Prompt Details modal (opened from Audit Logs tab)
- [x] T028 [US5] Implement confirmation modals for Pause Automation / Publish Now / Emergency Stop

### Phase 5b: Modal Parity Fixes (QA Blocker, Prototype-Locked)

**Finding (2026-01-03)**: Several triggered modals exist but are **simplified shells** and do **not** match V6 structure/fields/buttons, causing QA reports of “triggered modals not accurate”.

**Hard rule**: Replace simplified modal shells with **V6-accurate ports** (structure + labels + trigger behavior) while keeping semantic tokens (no hardcoded palette).
- [x] T022a [US5] Replace Scheduling modal with V6-accurate structure/fields/buttons
	- Target: `src/components/news-engine/v6/modals/ScheduleModal.tsx`
- [x] T023a [US5] Replace Test & Preview modal with V6-accurate structure + ensure Save/Publish actions are reachable
	- Target: `src/components/news-engine/v6/modals/TestPreviewModal.tsx`
- [x] T024a [US5] Replace Rewrite modal with V6-accurate structure (intensity, focus areas, required reasoning)
	- Target: `src/components/news-engine/v6/modals/RewriteModal.tsx`
- [x] T025a [US5] Replace Reject modal with V6-accurate structure (categories + required feedback)
	- Target: `src/components/news-engine/v6/modals/RejectModal.tsx`
- [x] T026a [US5] Replace Add/Edit Source modal with V6-accurate structure (friendly name, endpoint url validation, type selection, enable toggle)
	- Target: `src/components/news-engine/v6/modals/AddEditSourceModal.tsx`
- [x] T027a [US5] Fix Prompt Details trigger wiring to pass the correct log context (not window globals) + port modal to V6 structure
	- Targets: `src/components/news-engine/v6/tabs/AuditLogsTab.tsx`, `src/components/news-engine/v6/modals/PromptDetailsModal.tsx`, `src/components/news-engine/AdminNewsEngineHub.tsx`
- [x] T028a [US5] Replace confirmation modal UI with V6-accurate structure (typed confirm for publish)
	- Target: `src/components/news-engine/v6/modals/ConfirmationModal.tsx`

Note:
- If any of the above modals are currently implemented as simplified shells, they must be replaced with a V6-accurate port (structure preserved) before Phase 6 verification.

**Checkpoint**: E2E UI flows wired.

---


## Phase 6: Migration Verification + Build Validation (Cross-Cutting)

**Purpose**: Enforce zero hardcoded styling + multi-theme + build safety.

### Phase 6 Token Compliance Checklist (per component-dependency-tree-checklist.md)

- [ ] T029a [US6] Verify `/news` page: `src/app/news/page.tsx`
- [ ] T029b [US6] Verify `/news/[slug]` page: `src/app/news/[slug]/page.tsx`
- [ ] T029c [US6] Verify Footer: `src/components/Footer.tsx`
- [ ] T029d [US6] Verify Button: `src/components/ui/button.tsx`
- [ ] T029e [US6] Verify news-engine stub: `src/lib/ui-stubs/news-engine.ts`

- [ ] T029f [US6] Verify `/admin/news-engine` page: `src/app/admin/news-engine/page.tsx`
- [ ] T029g [US6] Verify AdminNewsEngineHub: `src/components/news-engine/AdminNewsEngineHub.tsx`
- [ ] T029h [US6] Verify DashboardTabV6: `src/components/news-engine/v6/tabs/DashboardTab.tsx`
- [ ] T029i [US6] Verify DraftsReviewsTabV6: `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`
- [ ] T029j [US6] Verify AuditLogsTabV6: `src/components/news-engine/v6/tabs/AuditLogsTab.tsx`
- [ ] T029k [US6] Verify MasterControlTabV6: `src/components/news-engine/v6/tabs/MasterControlTab.tsx`
- [ ] T029l [US6] Verify AutomationLogicTabV6: `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx`
- [ ] T029m [US6] Verify SourcesTabV6: `src/components/news-engine/v6/tabs/SourcesTab.tsx`
- [ ] T029n [US6] Verify SettingsTabV6: `src/components/news-engine/v6/tabs/SettingsTab.tsx`

- [ ] T029o [US6] Verify ReviewModalV6: `src/components/news-engine/v6/modals/ReviewModal.tsx`
- [ ] T029p [US6] Verify ManualDraftModalV6: `src/components/news-engine/v6/modals/ManualDraftModal.tsx`
- [ ] T029q [US6] Verify ScheduleModal: `src/components/news-engine/v6/modals/ScheduleModal.tsx`
- [ ] T029r [US6] Verify RewriteModal: `src/components/news-engine/v6/modals/RewriteModal.tsx`
- [ ] T029s [US6] Verify RejectModal: `src/components/news-engine/v6/modals/RejectModal.tsx`
- [ ] T029t [US6] Verify TestPreviewModal: `src/components/news-engine/v6/modals/TestPreviewModal.tsx`
- [ ] T029u [US6] Verify AddEditSourceModal: `src/components/news-engine/v6/modals/AddEditSourceModal.tsx`
- [ ] T029v [US6] Verify PromptDetailsModal: `src/components/news-engine/v6/modals/PromptDetailsModal.tsx`
- [ ] T029w [US6] Verify ConfirmationModal: `src/components/news-engine/v6/modals/ConfirmationModal.tsx`

- [ ] T029x [US6] Verify shared primitives: `src/components/news-engine/v6/shared.tsx`
- [ ] T029y [US6] Verify shared Button: `src/components/Button.tsx`
- [ ] T029z [US6] Verify news-engine data helpers: `src/lib/ui-stubs/news-engine.ts`

- [ ] T030 [US6] Confirm component-tree verification is complete (no unscanned children)
- [ ] T031 [US6] Re-run `npx tsc --noEmit` (FINAL ONLY)
- [ ] T032 [US6] Re-run `npm run build` (FINAL ONLY)

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
