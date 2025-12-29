---
description: "Tasks for Blog Manual feature implementation"
---

# Tasks: Blog Manual (In-App Blog + Admin + AI + n8n)

**Input**: 
- `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`
- `DOC/Features/Blog Manual/SOT/IMPLEMENTATION-PLAN.md`

**Prerequisites**:
- Approval of the SOT documents above.

**Tests**: Only add automated tests if explicitly requested later.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2...)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [US0] Confirm canonical blog routing decision in `DOC/Features/Blog Manual/SOT/Frontend-Plan.md` (approval checkpoint)
- [ ] T002 [US0] Confirm comment UX decision (hide vs read-only mock) in `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`

---

## Phase 2: Foundational (Frontend-first, No DB)

- [ ] T003 [P] [US1] Add seed-backed canonical route page at `src/app/blog/[slug]/page.tsx`
- [ ] T004 [US1] Update navigation in `src/app/blog/page.tsx` to route to `/blog/[slug]` (remove `sessionStorage` dependency)
- [ ] T005 [US1] Decide legacy behavior for `src/app/blog/post/page.tsx` (redirect/compat) and implement minimal safe handling
- [ ] T006 [P] [US1] Add blog content adapter module (e.g. `src/lib/blog/adapter.ts`) exposing `getBlogPosts()` and `getBlogPostBySlug(slug)`
- [ ] T007 [US1] Refactor `src/app/blog/page.tsx` and `src/app/blog/[slug]/page.tsx` to use the adapter module

**Checkpoint**: Blog works with stable URLs and no sessionStorage.

---

## Phase 3: User Story 1 — Public Blog (Priority: P1) 🎯 MVP

**Goal**: Public blog browsing + detail reading with SEO-friendly metadata.

- [ ] T008 [US1] Add metadata generation for list and detail routes (`src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`)
- [ ] T009 [US1] Ensure category/search behavior remains consistent with legacy UI (`src/app/blog/page.tsx`)

---

## Phase 4: User Story 2 — Admin Blog UI (Priority: P1)

**Goal**: Admin CRUD UX exists end-to-end (mocked persistence).

- [ ] T010 [US2] Add admin blog list route `src/app/admin/blog/page.tsx`
- [ ] T011 [US2] Add admin create route `src/app/admin/blog/new/page.tsx`
- [ ] T012 [US2] Add admin edit route `src/app/admin/blog/[id]/page.tsx`
- [ ] T013 [US2] Add admin preview route `src/app/admin/blog/[id]/preview/page.tsx`

---

## Phase 5: User Story 3 — Backend Foundations (Priority: P1, Post-Approval)

**Goal**: Persist posts in PostgreSQL via Prisma and serve via route handlers.

- [ ] T014 [US3] Add Prisma blog models in `prisma/schema.prisma` (BlogPost/Category/Tag + enums)
- [ ] T015 [US3] Create and apply migrations (Prisma migrations under `prisma/migrations/`)
- [ ] T016 [US3] Implement public blog API routes under `src/app/api/blog/*`
- [ ] T017 [US3] Implement admin blog API routes under `src/app/api/admin/blog/*`
- [ ] T018 [US3] Switch adapter module to DB-backed reads

---

## Phase 6: User Story 4 — AI Drafting (Priority: P2)

- [ ] T019 [US4] Add admin-only AI generate endpoint `src/app/api/admin/blog/ai/generate/route.ts` (server-side key only)
- [ ] T020 [US4] Add admin UI panel for AI drafting inside admin editor pages
- [ ] T021 [US4] Add basic rate limiting and audit logging for AI requests

---

## Phase 7: User Story 5 — Scheduling + n8n Automation (Priority: P2)

- [ ] T022 [US5] Decide scheduling mechanism (cron vs n8n-driven) and document it in `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`
- [ ] T023 [US5] Implement scheduled publishing runner (location depends on selected approach)
- [ ] T024 [US5] Implement webhook endpoints under `src/app/api/webhooks/n8n/blog/*` with shared-secret auth
- [ ] T025 [US5] Add job logging/publish audit trail (DB model or audit log table)

---

## Dependencies & Execution Order

- Phase 2 (Frontend-first) blocks backend work.
- Admin auth patterns must be confirmed before admin API endpoints.
- AI and webhooks require secure secret handling and server-only execution.
