# Tasks: Blog Manual — Phase 2 (LuminaCMS Prototype Mirror) — Refactor

**Input**: 
- `DOC/Features/Blog Manual/2nd Phase/SOT/FEATURE-SOT.md`
- `DOC/Features/Blog Manual/2nd Phase/SOT/Frontend-Plan.md`
- `DOC/Features/Blog Manual/2nd Phase/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/Features/Blog Manual/2nd Phase/Plan/LUMINACMS-PROTOTYPE-MIRROR-PLAN.md`
- `DOC/Features/Blog Manual/2nd Phase/SOT/CURRENT-STATE-AUDIT-ADMIN-BLOG-CMS.md`

**Prerequisites**: 
- The Phase-2 SOT documents above are approved/locked.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, ...)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T101 Establish baseline build gates (run `npx tsc --noEmit` and `npm run build`) and store outputs in `tsc-noemit.out.txt`, `next-build.out.txt`
- [ ] T102 [P] Confirm admin layout wrapper standards used by blog admin pages per `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`
- [ ] T103 [P] Inventory current blog admin routes in `src/app/admin/blog/**` and API routes in `src/app/api/admin/blog/**` to ensure planned work is additive

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T201 Define "Trash = archive" behavior and update contract notes in `DOC/Features/Blog Manual/2nd Phase/SOT/FEATURE-SOT.md` (if any ambiguity remains)
- [ ] T202 [P] Add/confirm Prisma soft-delete fields for blog posts (e.g., `deletedAt`) in `prisma/schema.prisma` (additive migration only)
- [ ] T203 Implement admin API behavior so deleting from CMS triggers archive (not hard delete) in `src/app/api/admin/blog/posts/[id]/route.ts`
- [ ] T204 Update list endpoints to exclude archived posts by default and add optional filter if needed in `src/app/api/admin/blog/posts/route.ts`
- [ ] T205 [P] Add minimal shared UI building blocks for Phase-2 blog CMS pages (only if needed) in `src/components/admin/blog/**`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 — Posts List Parity (Priority: P1) 🎯 MVP

**Goal**: WP-like posts list with search, status tabs, row actions, and bulk actions.

**Independent Test**: Navigate to `/admin/blog`, verify filtering/search works and row actions operate.

### Implementation for User Story 1

- [ ] T301 [US1] Refactor `src/app/admin/blog/page.tsx` to match list layout contract in `DOC/Features/Blog Manual/2nd Phase/SOT/Frontend-Plan.md`
- [ ] T302 [P] [US1] Add UI components for status tabs, bulk actions, and table row actions in `src/components/admin/blog/posts/**`
- [ ] T303 [US1] Wire search and status filter to existing list API `src/app/api/admin/blog/posts/route.ts`
- [ ] T304 [US1] Implement “Trash” UI action to call archive behavior via `src/app/api/admin/blog/posts/[id]/route.ts`
- [ ] T305 [US1] Verify gates pass (`npx tsc --noEmit`, `npm run build`)

**Checkpoint**: User Story 1 functional

---

## Phase 4: User Story 2 — Editor Parity (Priority: P1)

**Goal**: Editor mirrors prototype: title/slug/permalink, content, publishing box, and tabs (General/SEO/AI).

**Independent Test**: Create and edit a post with manual slug, schedule publish, and confirm preview.

### Implementation for User Story 2

- [ ] T401 [US2] Refactor create editor UI in `src/app/admin/blog/new/page.tsx` to match `DOC/Features/Blog Manual/2nd Phase/SOT/Frontend-Plan.md`
- [ ] T402 [US2] Refactor edit editor UI in `src/app/admin/blog/[id]/page.tsx` to match `DOC/Features/Blog Manual/2nd Phase/SOT/Frontend-Plan.md`
- [ ] T403 [P] [US2] Add tab UI scaffolding (General/SEO/AI) in `src/components/admin/blog/editor/**`
- [ ] T404 [US2] Implement schedule/publish UI wiring to existing PATCH route `src/app/api/admin/blog/posts/[id]/route.ts`
- [ ] T405 [US2] Ensure slug behavior parity (auto until edited, collision checks) stays correct across create/edit UI
- [ ] T406 [US2] Verify gates pass (`npx tsc --noEmit`, `npm run build`)

**Checkpoint**: User Story 2 functional

---

## Phase 5: User Story 3 — Taxonomy (Categories & Tags) (Priority: P1)

**Goal**: Admin taxonomy management UI and CRUD endpoints.

**Independent Test**: Create/edit/delete categories and tags; assign to posts.

### Implementation for User Story 3

- [ ] T501 [P] [US3] Add admin API routes for categories CRUD in `src/app/api/admin/blog/categories/route.ts` and `src/app/api/admin/blog/categories/[id]/route.ts`
- [ ] T502 [P] [US3] Add admin API routes for tags CRUD in `src/app/api/admin/blog/tags/route.ts` and `src/app/api/admin/blog/tags/[id]/route.ts`
- [ ] T503 [US3] Create `/admin/blog/taxonomy` UI in `src/app/admin/blog/taxonomy/page.tsx`
- [ ] T504 [P] [US3] Add taxonomy UI components in `src/components/admin/blog/taxonomy/**`
- [ ] T505 [US3] Ensure posts editor can assign categories/tags via existing connect/create patterns
- [ ] T506 [US3] Verify gates pass (`npx tsc --noEmit`, `npm run build`)

**Checkpoint**: User Story 3 functional

---

## Phase 6: User Story 4 — Comments Moderation (Priority: P2)

**Goal**: Admin comment queue with approve/spam/delete actions.

**Independent Test**: Moderate a comment and see status changes.

### Implementation for User Story 4

- [ ] T601 [US4] Add Prisma models/enums for blog comments in `prisma/schema.prisma` (additive migration)
- [ ] T602 [P] [US4] Add admin API routes for comments list + moderation actions in `src/app/api/admin/blog/comments/**`
- [ ] T603 [US4] Create `/admin/blog/comments` UI in `src/app/admin/blog/comments/page.tsx`
- [ ] T604 [P] [US4] Add comments moderation UI components in `src/components/admin/blog/comments/**`
- [ ] T605 [US4] Verify gates pass (`npx tsc --noEmit`, `npm run build`)

**Checkpoint**: User Story 4 functional

---

## Phase 7: User Story 5 — Media Library (Priority: P2)

**Goal**: Admin media grid, upload via presign, metadata edit, copy URL.

**Independent Test**: Upload an image, see it in grid, edit alt text, copy URL.

### Implementation for User Story 5

- [ ] T701 [US5] Add Prisma model(s) for media assets in `prisma/schema.prisma` (additive migration)
- [ ] T702 [P] [US5] Implement upload presign endpoint reusing existing patterns in `src/app/api/admin/**` (exact folder TBD, keep under `src/app/api/admin/blog/media/**`)
- [ ] T703 [P] [US5] Add CRUD endpoints for media list/details in `src/app/api/admin/blog/media/**`
- [ ] T704 [US5] Create `/admin/blog/media` UI in `src/app/admin/blog/media/page.tsx`
- [ ] T705 [P] [US5] Add media grid + details sidebar components in `src/components/admin/blog/media/**`
- [ ] T706 [US5] Verify gates pass (`npx tsc --noEmit`, `npm run build`)

**Checkpoint**: User Story 5 functional

---

## Phase 8: User Story 6 — AI Helpers (SEO + Media Alt) (Priority: P3)

**Goal**: Admin-only AI actions: SEO meta/keyword suggestions, alt text suggestions.

**Independent Test**: Trigger AI suggestion; ensure it logs and respects rate limiting.

### Implementation for User Story 6

- [ ] T801 [US6] Extend AI route(s) under `src/app/api/admin/blog/ai/**` for SEO metadata suggestion (or reuse `generate` route)
- [ ] T802 [US6] Add AI endpoint for media alt suggestions under `src/app/api/admin/blog/ai/**`
- [ ] T803 [P] [US6] Add UI buttons + wiring in editor SEO tab (`src/components/admin/blog/editor/**`) and media sidebar (`src/components/admin/blog/media/**`)
- [ ] T804 [US6] Add/extend logging models if needed in `prisma/schema.prisma` (prefer reuse of `BlogAiRequestLog`)
- [ ] T805 [US6] Verify gates pass (`npx tsc --noEmit`, `npm run build`)

**Checkpoint**: User Story 6 functional

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T901 [P] Update docs index links in `DOC/Features/Blog Manual/2nd Phase/SOT/INDEX.md` (keep SOT pack navigable)
- [ ] T902 Confirm no hardcoded colors and no `dark:` usage in Phase-2 admin blog UI files
- [ ] T903 Security review: all new admin API routes use `requireAdmin()`
- [ ] T904 Final gates: `npx tsc --noEmit` and `npm run build`
