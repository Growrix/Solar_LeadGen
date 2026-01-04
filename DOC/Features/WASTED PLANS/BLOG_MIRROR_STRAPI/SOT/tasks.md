---
description: "Execution checklist for BLOG_MIRROR_STRAPI (must follow .specify/tasks-template)."
---

# Tasks: BLOG_MIRROR_STRAPI (Strapi-like Blog CMS)

**Input**: `DOC/Features/BLOG_MIRROR_STRAPI/SOT/FEATURE-SOT.md`, `DOC/Features/BLOG_MIRROR_STRAPI/Plan/ChatGPTplan.md`
**Prerequisites**: SOT must be set to `Locked (Approved)` before implementation tasks begin.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, ... from `FEATURE-SOT.md`
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm SOT approval and set status to `Locked (Approved)` in `DOC/Features/BLOG_MIRROR_STRAPI/SOT/FEATURE-SOT.md`
- [ ] T002 Create provider contract doc section in `DOC/Features/BLOG_MIRROR_STRAPI/SOT/FEATURE-SOT.md` (owned CMS vs Strapi adapter)

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 [US1] Add blog Prisma models to `prisma/schema.prisma` (BlogPost/BlogCategory/BlogTag/BlogPostTag)
- [ ] T004 [US1] Create migration and validate schema (`npx prisma validate`) (do not run destructive DB commands)
- [ ] T005 [P] [US1] Add server-side validators/types in `src/types/blog.ts` (extend existing types without breaking public blog)

Checkpoint: Foundation ready — proceed to user stories.

---

## Phase 3: User Story 1 — Admin: Manage Blog Posts (Priority: P1)

Goal: Admin can create/edit/publish posts.

- [ ] T006 [P] [US1] Create admin posts API route `src/app/api/admin/blog/posts/route.ts` (GET list + POST create)
- [ ] T007 [P] [US1] Create admin post detail API route `src/app/api/admin/blog/posts/[id]/route.ts` (GET/PUT/DELETE)
- [ ] T008 [US1] Add admin pages:
  - `src/app/admin/blog/page.tsx` (list)
  - `src/app/admin/blog/new/page.tsx` (create)
  - `src/app/admin/blog/[id]/page.tsx` (edit)

---

## Phase 4: User Story 2 — Admin: Taxonomy (Categories/Tags) (Priority: P1)

- [ ] T009 [P] [US2] Create categories API `src/app/api/admin/blog/categories/route.ts`
- [ ] T010 [P] [US2] Create tags API `src/app/api/admin/blog/tags/route.ts`
- [ ] T011 [US2] Add admin pages:
  - `src/app/admin/blog/categories/page.tsx`
  - `src/app/admin/blog/tags/page.tsx`

---

## Phase 5: User Story 3 — Admin: SEO Fields (Priority: P1)

- [ ] T012 [US3] Extend post editor form components to edit SEO fields (`src/app/admin/blog/[id]/page.tsx`, `src/app/admin/blog/new/page.tsx`)

---

## Phase 6: User Story 4 — Public: Read Blog (Priority: P1)

- [ ] T013 [US4] Add owned CMS read helpers in `src/lib/blog/ownedCms.ts` (server-only)
- [ ] T014 [US4] Update public blog pages to use owned CMS provider with safe fallback:
  - `src/app/blog/page.tsx`
  - `src/app/blog/[slug]/page.tsx`

---

## Phase 7: Validation

- [ ] T015 Run typecheck: `npx tsc --noEmit`
- [ ] T016 Run build: `npm run build`
- [ ] T017 Manual E2E checklist: Admin create → publish → public view

---

## Phase 8: Post-MVP (P2/P3)

- [ ] T018 [US5] Scheduling + preview enhancements (files TBD; must update SOT first)
- [ ] T019 [US6] AI draft assistance (files TBD; must update SOT first)
- [ ] T020 [US7] RSS ingestion (files TBD; must update SOT first)

---

## Dependencies & Execution Order

- Phase 2 blocks all user stories.
- US1/US2/US3 can be partially parallel once schema is in place, but avoid file conflicts.
- Public provider switch (US4) should happen after core CRUD is functional.
