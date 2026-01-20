
---

# Tasks: BLOG

**Input**: Design documents under `DOC/FEATURES/BLOG/` and prototype exports under `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/`
**Prerequisites**: `DOC/FEATURES/BLOG/SOT/FEATURE-SOT.md`, `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md`, `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`, `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`

**Scope (this run)**: Frontend prototype migration ONLY for:
- Content Manager
- Media Library
- Comments

**Format: `[ID] [P?] [Story] Description`**
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Include exact file paths in descriptions

---

## Phase 0: Docs Lock (Planning Only)

- [x] T001 [P] Create migration plan in `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
- [ ] T002 [P] Confirm scope lock in `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md` matches requested pages only (Content Manager, Media Library, Comments)

---

## Phase 1: Gate 0 (Repo Health)

**Purpose**: ensure the repo is healthy before UI migration work.

- [ ] T010 Run `npx tsc --noEmit` and record any blockers (do not fix unrelated issues)
- [ ] T011 Run `npm run build` and record any blockers (do not fix unrelated issues)

---

## Phase 2: US1 — Content Manager (Prototype → Next.js)

**Goal**: Migrate the prototype “Blog Engine” tabbed content lists into the existing admin dashboard.

- [ ] T020 [US1] Add route `/admin/blog/content-manager` in `src/app/admin/blog/content-manager/page.tsx`
- [ ] T021 [P] [US1] Create tab hub component in `src/components/admin/blog/content-manager/ContentManagerHub.tsx` (prototype-preserving tabs: Posts / Categories / Tags)
- [ ] T022 [P] [US1] Migrate Posts list surface (prototype mirror of `AdminPostList`) into `src/components/admin/blog/content-manager/PostList.tsx`
- [ ] T023 [P] [US1] Migrate Categories list surface (prototype mirror of `AdminCategoryList`) into `src/components/admin/blog/content-manager/CategoryList.tsx`
- [ ] T024 [P] [US1] Migrate Tags list surface (prototype mirror of `AdminTagList`) into `src/components/admin/blog/content-manager/TagList.tsx`
- [ ] T025 [US1] Wire Content Manager lists to existing admin APIs (no backend changes)
	- Posts: `src/app/api/admin/blog/posts/**`
	- Categories: `src/app/api/admin/blog/categories/**`
	- Tags: `src/app/api/admin/blog/tags/**`

**Checkpoint**: Content Manager renders inside admin shell and tabs switch correctly.

---

## Phase 3: US2 — Media Library (Prototype → Next.js)

**Goal**: Migrate the Media Library prototype UI into the existing admin dashboard.

- [ ] T030 [US2] Add route `/admin/blog/media` in `src/app/admin/blog/media/page.tsx`
- [ ] T031 [P] [US2] Migrate Media Library UI into `src/components/admin/blog/media/MediaLibrary.tsx` (mirror prototype)
- [ ] T032 [P] [US2] Migrate required child components + modals under `src/components/admin/blog/media/**`
- [ ] T033 [US2] Add UI-only seen-state/placeholder that clearly indicates “backend not connected yet” if no storage API exists

**Checkpoint**: Media Library renders and all modals open/close as in prototype.

---

## Phase 4: US3 — Comments (Prototype → Next.js)

**Goal**: Migrate the Comments moderation prototype UI into the existing admin dashboard.

- [ ] T040 [US3] Add route `/admin/blog/comments` in `src/app/admin/blog/comments/page.tsx`
- [ ] T041 [P] [US3] Migrate Comments UI into `src/components/admin/blog/comments/CommentsList.tsx` (mirror prototype)
- [ ] T042 [P] [US3] Migrate required modals under `src/components/admin/blog/comments/modals/**`
- [ ] T043 [US3] Add UI-only placeholder that clearly indicates “backend not connected yet” if no comments API exists

**Checkpoint**: Comments page renders and bulk actions/modals behave like prototype.

---

## Phase 5: Admin Dashboard Integration

- [ ] T050 [P] Add Blog submenu routes in `src/components/AdminSidebar.tsx`
	- Content Manager → `/admin/blog/content-manager`
	- Media Library → `/admin/blog/media`
	- Comments → `/admin/blog/comments`
- [ ] T051 [P] Add same links to `src/components/AdminMobileSidebarMenu.tsx`

---

## Phase 6: Design System Compliance (Tokenization)

**Purpose**: remove prototype hardcoded classes and enforce semantic tokens.

- [ ] T060 [US1] Tokenize Content Manager component tree (`src/app/admin/blog/content-manager/**`, `src/components/admin/blog/content-manager/**`) and pass verification scans
- [ ] T061 [US2] Tokenize Media Library component tree (`src/app/admin/blog/media/**`, `src/components/admin/blog/media/**`) and pass verification scans
- [ ] T062 [US3] Tokenize Comments component tree (`src/app/admin/blog/comments/**`, `src/components/admin/blog/comments/**`) and pass verification scans

---

## Phase 7: Final Validation

- [ ] T070 Run `npx tsc --noEmit`
- [ ] T071 Run `npm run build`

