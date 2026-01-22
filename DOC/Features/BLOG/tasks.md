

---
description: "Task list for BLOG pixel-perfect prototype migration"
---

# Tasks: BLOG

**Input**: Prototype export under `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/` and feature docs under `DOC/FEATURES/BLOG/`

**Prerequisites**:
- Migration plan: `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
- Pixel-perfect migration policy: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/PROTOTYPE-TO-NEXTJS-PIXEL-PERFECT-MIGRATION.md`
- Existing UI audit (reuse-first): `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- Layout/routing (admin shell embedding): `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

**Scope (this run)**: Frontend prototype migration ONLY for:
- Content Manager
- Media Library

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2
- Include exact file paths in descriptions

---

## Phase 1: Setup (Docs Lock + Audit)

**Purpose**: Lock scope and prevent duplication before implementation.

- [ ] T001 [P] Confirm scope lock in `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md` matches requested pages only (Content Manager, Media Library)
- [ ] T002 [P] Audit existing BLOG admin pages/components to avoid duplication (reuse/extend existing files; do not create parallel duplicates)
	- Routes: `src/app/admin/blog/content-manager/page.tsx`, `src/app/admin/blog/media/page.tsx`
	- Components: `src/components/admin/blog/content-manager/**`, `src/components/admin/blog/media/**`
	- Existing admin blog routes documented in `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- [ ] T003 [P] Prototype surface mapping (record exact prototype components/features to mirror)
	- Content Manager: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/BlogEngine.tsx`
	- Media Library: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminMediaLibrary.tsx`

**Checkpoint**: Audit completed; reuse targets identified; no duplicate-file plan.

---

## Phase 2: Foundational (Repo Health)

**⚠️ CRITICAL**: No migration work begins until repo health is green.

- [ ] T010 Run `npx tsc --noEmit` and record any blockers (do not fix unrelated issues)
- [ ] T011 Run `npm run build` and record any blockers (do not fix unrelated issues)

**Checkpoint**: Gates green; proceed to user stories.

---

## Phase 3: User Story 1 — Content Manager (Priority: P1) 🎯

**Goal**: Pixel-perfect mirror of the prototype Blog Manager tabs (Posts/Categories/Tags only) inside the existing admin dashboard.

**Independent Test**: Visit `/admin/blog/content-manager` and confirm header/tabs/layout match prototype; switching tabs matches prototype behavior.

- [ ] T020 [US1] Reuse existing route and make it prototype-matching: `src/app/admin/blog/content-manager/page.tsx`
- [ ] T021 [US1] Pixel-perfect port of prototype tabs/header into `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
	- Source of truth: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/BlogEngine.tsx`
	- In scope tabs: Posts / Categories / Tags (do not add Authors/Comments)
- [ ] T022 [P] [US1] Port Posts list UI/behaviors into `src/components/admin/blog/content-manager/PostList.tsx`
	- Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminPostList.tsx`
- [ ] T023 [P] [US1] Port Categories list UI/behaviors into `src/components/admin/blog/content-manager/CategoryList.tsx`
	- Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminCategoryList.tsx`
- [ ] T024 [P] [US1] Port Tags list UI/behaviors into `src/components/admin/blog/content-manager/TagList.tsx`
	- Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminTagList.tsx`

**Checkpoint**: `/admin/blog/content-manager` looks and behaves like the prototype for the in-scope tabs.

---

## Phase 4: User Story 2 — Media Library (Priority: P1) 🎯

**Goal**: Pixel-perfect mirror of the prototype Media Library (Library/Trash, folders, filters, selection, modals) inside the existing admin dashboard.

**Independent Test**: Visit `/admin/blog/media` and confirm layout matches prototype; selection + modals open/close match prototype.

- [ ] T030 [US2] Reuse existing route and make it prototype-matching: `src/app/admin/blog/media/page.tsx`
- [ ] T031 [US2] Pixel-perfect port of Media Library core UI into `src/components/admin/blog/media/MediaLibrary.tsx`
	- Source of truth: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminMediaLibrary.tsx`
- [ ] T032 [P] [US2] Port required Media Library child components/modals under `src/components/admin/blog/media/**`
	- Likely sources: `FolderTree.tsx`, `UploadMediaModal.tsx`, `MediaDetailsModal.tsx`, `MoveMediaModal.tsx`, `BulkEditMediaModal.tsx`, `ConfirmationModal.tsx`
- [ ] T033 [US2] If backend is not connected yet, use safe stubs but keep UI pixel-perfect (do not redesign).

**Checkpoint**: `/admin/blog/media` looks and behaves like prototype for Library/Trash + modals.

---

## Phase 5: Admin Dashboard Integration

- [ ] T040 [P] Ensure Blog submenu routes exist in `src/components/AdminSidebar.tsx`
	- Content Manager → `/admin/blog/content-manager`
	- Media Library → `/admin/blog/media`
- [ ] T041 [P] Ensure same links exist in `src/components/AdminMobileSidebarMenu.tsx`

---

## Audit & Correction Loop (Mandatory)

**Purpose**: Ensure pixel-perfect prototype parity and no missing flows.

- [ ] T090 Compare Next.js UI vs prototype for Content Manager + Media Library (visual parity + interactions + modals)
- [ ] T091 Log every gap as new tasks in this file
- [ ] T092 Fix gaps and repeat audit until green

---

## Phase 6: Final Validation

- [ ] T100 Run `npx tsc --noEmit`
- [ ] T101 Run `npm run build`

