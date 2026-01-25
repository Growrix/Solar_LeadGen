---
description: "Task list for BLOG pixel-perfect prototype migration"
---

# Tasks: BLOG

**Input**: Prototype export under `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/` and feature docs under `DOC/FEATURES/BLOG/`

**Prerequisites**:
- Migration plan: `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
- Media Library re-migration plan: `DOC/FEATURES/BLOG/Migration/MEDIA-LIBRARY-RE-MIGRATION-PLAN-2026-01-25.md`
- Pixel-perfect migration policy: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/PROTOTYPE-TO-NEXTJS-PIXEL-PERFECT-MIGRATION.md`
- Existing UI audit (reuse-first): `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- Layout/routing (admin shell embedding): `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

**Scope (this run)**: Media Library prototype re-migration ONLY (do not modify other BLOG admin areas):
- Media Library

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2
- Include exact file paths in descriptions

---

## Phase 1: Setup (Docs Lock + Audit)

**Purpose**: Lock scope and prevent duplication before implementation.

- [x] T001 [P] Confirm scope lock in `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md` matches requested pages only (Content Manager)
- [x] T002 [P] Audit existing BLOG admin pages/components to avoid duplication (reuse/extend existing files; do not create parallel duplicates)
	- Routes: `src/app/admin/blog/content-manager/page.tsx`, `src/app/admin/blog/media/page.tsx`
	- Components: `src/components/admin/blog/content-manager/**`, `src/components/admin/blog/media/**`
	- Existing admin blog routes documented in `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- [x] T003 [P] Prototype surface mapping (record exact prototype components/features to mirror)
	- Content Manager: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/BlogEngine.tsx`

- [x] T004 [P] Prototype-first audit completed and recorded in `DOC/FEATURES/BLOG/Audit Report/content-manager-prototype-first-audit-2026-01-22.md`

**Checkpoint**: Audit completed; reuse targets identified; no duplicate-file plan.

---

## Phase 2: Foundational (Repo Health)

**⚠️ CRITICAL**: No migration work begins until repo health is green.


- [x] T010 Run `npx tsc --noEmit` and record any blockers (do not fix unrelated issues)
- [x] T011 Run `npm run build` and record any blockers (do not fix unrelated issues)

**Checkpoint**: Gates green; proceed to user stories.

---

## Phase 3: User Story 1 — Content Manager (Priority: P1) 🎯

**Goal**: Pixel-perfect mirror of the prototype Content Manager surface inside the existing admin dashboard.

**Independent Test**: Visit `/admin/blog/content-manager` and confirm header/tabs/layout match prototype; switching tabs matches prototype behavior.

- [x] T020 [US1] Reuse existing route and make it prototype-matching: `src/app/admin/blog/content-manager/page.tsx`
- [x] T021 [US1] Pixel-perfect port of prototype tabs/header into `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
	- Source of truth: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/BlogEngine.tsx`
	- In scope tabs: Posts / Categories / Tags / Comments / Authors

- [x] T021a [US1] Add Comments tab UI + behaviors (prototype parity; safe stubs if needed)
	- Source of truth: prototype admin components under `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/`

- [x] T021b [US1] Add Authors tab UI + behaviors (prototype parity; safe stubs if needed)
	- Source of truth: prototype admin components under `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/`


- [x] T021c [US1] Implement editor + preview routes required by prototype flows
	- Routes: `src/app/admin/blog/new/page.tsx`, `src/app/admin/blog/[id]/page.tsx`, `src/app/admin/blog/[id]/preview/page.tsx`
	- Source of truth: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminEditor.tsx` and prototype preview flow

- [x] T022 [P] [US1] Finish Posts list pixel-perfect parity (prototype-preserving): `src/components/admin/blog/content-manager/PostList.tsx`
	- Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminPostList.tsx`
- [x] T022a [US1] Add prototype stats cards row (Total / Published / Scheduled / In Review / Drafts)
- [x] T022b [US1] Align header/control row layout (status tabs only in list view; search placement; labels)
- [x] T022c [US1] Align View Options (list columns: status/category/author/date; board fields: coverImage/category/author/date/excerpt/tags)
- [x] T022d [US1] Implement `Needs Review` parity as UI-only overlay (localStorage id-set) + board lane + status tab
- [x] T022e [US1] Implement inline status edit (double-click status pill) including `Needs Review` overlay support
- [x] T022f [US1] Add issues tooltip (missing cover image/excerpt/category) + board placeholder alert
- [x] T022g [US1] Add pagination placeholder footer

- [x] T023 [P] [US1] Port Categories list UI/behaviors into `src/components/admin/blog/content-manager/CategoryList.tsx`
	- Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminCategoryList.tsx`
- [x] T024 [P] [US1] Port Tags list UI/behaviors into `src/components/admin/blog/content-manager/TagList.tsx`
	- Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminTagList.tsx`

**Checkpoint**: Content Manager hub + all in-scope tabs + editor/preview routes look and behave like the prototype.

---

## Phase 4: Admin Dashboard Integration

- [x] T040 [P] Ensure Blog submenu route exists in `src/components/AdminSidebar.tsx`
	- Content Manager → `/admin/blog/content-manager`
- [x] T041 [P] Ensure same link exists in `src/components/AdminMobileSidebarMenu.tsx`

---

## Phase 5: User Story 2 — Media Library (Priority: P1) 🎯

**Goal**: Pixel-perfect mirror of the prototype Media Library surface inside the existing admin dashboard.

**Independent Test**: Visit `/admin/blog/media` and confirm tabs/folders/breadcrumbs/filters/selection tray and modals match prototype.

- [x] T050 [US2] Confirm Media Library route exists and is wired: `src/app/admin/blog/media/page.tsx`

- [x] T051 [US2] Create prototype vs Next.js audit report: `DOC/Features/BLOG/Audit Report/media-library-prototype-vs-nextjs-audit-2026-01-25.md`

- [x] T052 [US2] Re-port Media Library surface from prototype (prototype-first, UI-only safe stubs): `src/components/admin/blog/media/MediaLibrary.tsx`
	- Source of truth: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminMediaLibrary.tsx`
	- Must include: Library/Trash tabs, folders + breadcrumbs, selection + floating bulk tray, per-item menu actions

- [x] T053 [P] [US2] Align Upload modal UI and folder selection to prototype: `src/components/admin/blog/media/UploadMediaModal.tsx`
	- Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/UploadMediaModal.tsx`

- [x] T054 [P] [US2] Align Media Details modal UI/controls to prototype (rename/replace/edit-mode UI): `src/components/admin/blog/media/MediaDetailsModal.tsx`
	- Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/MediaDetailsModal.tsx`
	- Note: image editing can be UI-only (no real processing), but controls and states must exist

- [x] T055 [P] [US2] Integrate Move + Bulk Edit modals with prototype flows (wiring only; UI parity):
	- `src/components/admin/blog/media/MoveMediaModal.tsx`
	- `src/components/admin/blog/media/BulkEditMediaModal.tsx`

**Checkpoint**: Media Library matches prototype UI and interactions; no changes outside Media Library scope.

---

## Phase 6: Audit & Correction Loop (Mandatory)

**Purpose**: Ensure pixel-perfect prototype parity and no missing flows.

- [x] T089 [US1] Create prototype vs Next.js audit report scaffold: `DOC/Features/BLOG/Audit Report/content-manager-prototype-vs-nextjs-audit-2026-01-24.md`
- [ ] T090 Compare Next.js UI vs prototype for Content Manager (visual parity + interactions + modals)
- [ ] T091 Log every remaining gap as tasks in this file
- [x] T091a [US1] Sync Content Manager tab selection to URL (`?tab=`) for prototype-like navigation: `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
- [x] T091b [US1] Match prototype non-tabbed headers for Categories/Tags (back button + title/subtitle + add button; action-row add button tabbed-only): `src/components/admin/blog/content-manager/CategoryList.tsx`, `src/components/admin/blog/content-manager/TagList.tsx`
- [x] T091c [US1] Align Comments list UI to prototype (header, filter bar styling/placeholder, fixed bulk tray, table columns/actions): `src/components/admin/blog/content-manager/CommentsList.tsx`
- [x] T091d [US1] Remove non-prototype Refresh action from Authors list (keep search + optional Add Author only): `src/components/admin/blog/content-manager/AuthorList.tsx`
- [x] T091e [US1] Align Authors table row visuals to prototype (avatar `<img>`, status dot + Active/Inactive labels, action icon padding/hover colors): `src/components/admin/blog/content-manager/AuthorList.tsx`
- [ ] T092 Fix gaps and repeat audit until green

### Sub-Phase: Fix Unintended Deviations (No-Assumptions)

**Purpose**: Remove any non-prototype behaviors/visual states introduced during implementation (e.g., hidden/low-contrast buttons, unexpected disabled states, altered modal footers).

- [ ] T093 [US1] Audit Content Manager for unintended deviations (visibility/contrast/disabled states) and log each as tasks
- [ ] T094 [US1] Fix Add Tag modal visibility parity (Save Tag button must be visible and match prototype): `src/components/admin/blog/shared/ManageTaxonomyModal.tsx`
- [ ] T095 Re-run quick spot-check on Tags/Categories modals after fixes

---

## Phase 7: Final Validation + Evidence

- [x] T100 Run `npx tsc --noEmit` (passed 2026-01-25)
- [x] T101 Run `npm run build` (passed 2026-01-25)
- [ ] T102 Capture evidence (side-by-side or screenshots) for Media Library parity and record locations under `DOC/FEATURES/BLOG/Audit Report/`

