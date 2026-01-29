---
description: "Tasks for Blog Manual feature implementation"
---

# Tasks: Blog Manual (In‑App Blog + Admin Workflow + AI + Automation)

**Input**:
- `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md`
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`
- `DOC/Features/Blog Manual/SOT/IMPLEMENTATION-PLAN.md`

**Prerequisites**:
- Approval of the SOT documents above (Phase gates).

**Tests**: Only add automated tests if explicitly requested later.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US0, US1, US2...)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 [US0] Confirm routing choice (keep `/blog/post` vs introduce `/blog/[slug]`) in `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`
- [x] T002 [US0] Confirm comment UX stance (keep demo vs read-only vs hide) in `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`
- [x] T003 [US0] Confirm slug rules (generation + uniqueness + collision) in `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`

---

## Phase 2: Foundational (Frontend-first, No DB)

**Goal**: Preserve baseline while enabling future DB swap cleanly.

- [x] T004 [P] [US1] Create blog content adapter module (e.g. `src/lib/blog/adapter.ts`) with `getBlogPosts()` and `getBlogPostBySlug(slug)`
- [x] T005 [US1] Refactor `src/app/blog/page.tsx` to read posts via adapter (not directly from `src/data/blogData.ts`)

**Routing option tasks (choose based on approval):**
- [x] T006 [P] [US1] If `/blog/[slug]` approved: add `src/app/blog/[slug]/page.tsx` (seed/mock backed)
- [x] T007 [US1] If `/blog/[slug]` approved: update navigation in `src/app/blog/page.tsx` to route to `/blog/[slug]` (remove sessionStorage dependency)
- [x] T008 [US1] If `/blog/[slug]` approved: decide and implement compatibility behavior for `src/app/blog/post/page.tsx` (redirect or fallback) without breaking `/blog`

**Checkpoint**: Guest blog browsing works and baseline is preserved.

---

## Phase 3: User Story 1 — Public Blog (Priority: P1) 🎯 MVP

**Goal**: SEO-friendly public blog routes.

- [x] T009 [US1] Add metadata generation for public routes (`src/app/blog/page.tsx` and detail route page) to support SEO/OG tags
- [x] T010 [US1] Decide whether to expose search + category filter controls in `/blog` UI and implement if approved (`src/app/blog/page.tsx`)
- [x] T011 [US1] Decide minimum share-button functionality (at least Copy Link) and implement on the approved detail route (`src/app/blog/post/page.tsx` or `src/app/blog/[slug]/page.tsx`)

---

## Phase 4: User Story 2 — Admin Blog UI (Priority: P1)

**Goal**: Admin publishing workflow UX exists end-to-end (mocked).

- [x] T012 [US2] Add admin blog dashboard page at `src/app/admin/blog/page.tsx`
- [x] T013 [US2] Add admin create page at `src/app/admin/blog/new/page.tsx`
- [x] T014 [US2] Add admin edit page at `src/app/admin/blog/[id]/page.tsx`
- [x] T015 [US2] Add admin preview page at `src/app/admin/blog/[id]/preview/page.tsx`
- [x] T016 [US2] Align admin route protection with existing auth patterns (audit existing `/admin` usage first)

---

## Phase 5: User Story 3 — Backend Foundations (Priority: P1, Post‑Approval)

**Goal**: Persist blog content in PostgreSQL via Prisma and serve via route handlers.

- [x] T017 [US3] Audit existing Prisma schema and decide model names/relations in `prisma/schema.prisma`
- [x] T018 [US3] Add blog models + enums in `prisma/schema.prisma` (BlogPost/Category/Tag + status enum)
- [x] T019 [US3] Create Prisma migrations under `prisma/migrations/`
- [x] T020 [US3] Implement public blog APIs under `src/app/api/blog/*`
- [x] T021 [US3] Implement admin blog APIs under `src/app/api/admin/blog/*`
- [x] T022 [US3] Switch adapter module to DB-backed reads (`src/lib/blog/adapter.ts`)

---

## Phase 6: User Story 4 — AI Drafting (Priority: P2)

- [x] T023 [US4] Define prompt contract + guardrails in SOT (no code) `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`
- [x] T024 [US4] Implement admin-only AI generate endpoint at `src/app/api/admin/blog/ai/generate/route.ts` (server-side key only)
- [x] T025 [US4] Add admin editor UI panel for AI drafting in `src/app/admin/blog/[id]/page.tsx`
- [x] T026 [US4] Add basic rate limiting and audit logging for AI requests (location depends on existing infra)

---

## Phase 7: User Story 5 — Scheduling + n8n Automation (Priority: P2)

- [x] T027 [US5] Decide scheduling mechanism (cron vs n8n-driven) and lock it in `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`
- [x] T028 [US5] Implement scheduled publishing runner (location depends on chosen approach)
- [x] T029 [US5] Implement n8n webhook endpoints under `src/app/api/webhooks/n8n/blog/*` with shared-secret auth
- [x] T030 [US5] Add job logging/audit trail (DB table or logging strategy) and document it

---

## Phase 8: Fixes & Hardening (Post‑Audit, Priority: P0)

**Authority**: `DOC/Features/Blog Manual/PLAN/FIX-AUDIT-AND-PLAN.md`

**Goal**: Resolve runtime create failures, improve admin CMS usability, and align admin blog pages with admin/dashboard standards.

- [x] T031 [US2] Ensure blog migrations are applied in the active DB before testing (backup + `npx prisma migrate deploy` + verify `npx prisma migrate status`) — see `DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/operations/database-operations-standard.md`
- [x] T032 [P] [US3] Improve API error clarity for Prisma missing-table scenarios (detect `P2021` and return actionable message) in `src/app/api/admin/blog/posts/route.ts` and `src/app/api/admin/blog/posts/[id]/route.ts`
- [x] T033 [P] [US2] Prevent unhandled runtime errors in admin blog UI by catching API client errors and showing inline error UI in `src/app/admin/blog/page.tsx` and `src/app/admin/blog/new/page.tsx`
- [x] T034 [P] [US2] Add Admin sidebar “Blog” section with submenu routes (All Posts, Create Post, Categories, Tags) in `src/components/AdminSidebar.tsx`, `src/components/AdminMobileSidebarMenu.tsx`, and active-page mapping in `src/app/admin/layout.tsx`
- [x] T035 [P] [US2] Slug UX: auto-generate from Title until user edits slug; add “Reset from title” action in `src/app/admin/blog/new/page.tsx` and `src/app/admin/blog/[id]/page.tsx`
- [x] T036 [P] [US2] Align admin blog pages wrapper spacing/typography with established admin patterns (match existing admin pages: `p-4 sm:p-6 lg:p-8` wrapper; avoid extra `min-h-screen`/`bg-background` shells) in `src/app/admin/blog/*/page.tsx`
- [x] T037 [US2] Add minimal placeholder pages for `/admin/blog/categories` and `/admin/blog/tags` if required by sidebar structure

---

## Dependencies & Execution Order

- Phase 2 blocks Phase 5 (no DB until frontend-first is approved).
- Admin auth patterns must be confirmed before admin APIs.
- AI + webhooks require secure secret handling and server-only execution.
