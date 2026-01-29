---
description: "Task list for BLOG_STRAPI feature implementation (SOT-local, E2E, continuity-first)"
---

# Tasks: BLOG_STRAPI

**Input**: Design/execution documents from `DOC/Features/BLOG_STRAPI/SOT/`

**Prerequisites**:
- `DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md` (locked planning SOT)
- `DOC/Features/BLOG_STRAPI/SOT/INDEX.md` (continuity entry)
- `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md` (E2E execution plan)
- `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md` (Strapi provisioning + content model runbook)

**Engineering Tracker**: `specs/014-blog-feature/tasks.md` (must stay consistent)

**Tests**: OPTIONAL — only include test tasks if explicitly requested.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm plan lock and repo health before any implementation.

- [ ] T001 Confirm `DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md` status is `Locked (Approved)`
- [ ] T002 Run GATE 0: `npx tsc --noEmit`
- [ ] T003 Run GATE 0: `npx prisma validate`
- [ ] T004 Run GATE 0: `npm run build`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core boundaries that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Confirm canonical public URL is `/blog/[slug]` and `/blog/post` is legacy redirect-only (doc: `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`)
- [ ] T006 Confirm Strapi runs as a separate service and is integrated via HTTP API only (doc: `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md`)
- [ ] T007 Confirm Strapi token is server-only (no client exposure; no `NEXT_PUBLIC_` usage) (doc: `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`)
- [ ] T008 Confirm fallback requirement: if Strapi missing/down, public blog renders using seeded data (doc: `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`)

**Checkpoint**: Foundation ready — user story implementation can now begin in priority order.

---

## Phase 3: User Story 1 — Strapi CMS Setup + Content Model (Priority: P1) 🎯 MVP

**Goal**: A running Strapi instance with the required content types, permissions, and API token.

**Independent Test**:
- Strapi Admin loads
- You can create and publish a Post
- Public API returns published posts

### Implementation for User Story 1

- [ ] T009 [US1] Provision Strapi as a separate service (doc: `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md`)
- [ ] T010 [US1] Create content types: `Post`, `Category`, `Tag` and required fields (doc: `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md`)
- [ ] T011 [US1] Configure permissions and create a read-only API token for Next.js (doc: `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md`)
- [ ] T012 [US1] Set Next.js env vars: `STRAPI_URL`, `STRAPI_TOKEN` (doc: `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md`)

**Checkpoint**: Strapi is running with published content reachable via API.

---

## Phase 4: User Story 2 — Public Blog E2E (Routing + List + Post) (Priority: P1)

**Goal**: Public blog works end-to-end against Strapi, with seeded fallback.

**Independent Test**:
- Without Strapi env: `/blog` renders seeded list, `/blog/[slug]` renders seeded post
- With Strapi env: `/blog` renders Strapi list, `/blog/[slug]` renders Strapi post

### Implementation for User Story 2

- [ ] T013 [US2] Ensure canonical navigation to `/blog/[slug]` from blog listing (file: `src/app/blog/BlogPageClient.tsx`)
- [ ] T014 [US2] Ensure `/blog/post` remains redirect-only legacy route (file: `src/app/blog/post/page.tsx`)
- [ ] T015 [US2] Ensure server-only Strapi list fetch + fallback exists (file: `src/lib/blog/strapi.ts`)
- [ ] T016 [US2] Ensure server-only Strapi single-post fetch + fallback exists (file: `src/lib/blog/strapi.ts`)
- [ ] T017 [US2] Ensure `/blog` server page loads posts and renders client list (files: `src/app/blog/page.tsx`, `src/app/blog/BlogPageClient.tsx`)
- [ ] T018 [US2] Verify `STRAPI_TOKEN` never reaches client components (audit: `src/app/blog/BlogPageClient.tsx`, `src/lib/blog/strapi.ts`)
- [ ] T019 [US2] Run verification: `npx tsc --noEmit` and `npm run build`

**Checkpoint**: Public blog is stable, canonical URLs are shareable, and fallback works.

---

## Phase 5: User Story 3 — SEO + Indexing (Priority: P2)

**Goal**: Blog pages are shareable and search-friendly.

**Independent Test**:
- `/blog/[slug]` metadata matches post SEO fields (or sensible defaults when missing)

### Implementation for User Story 3

- [ ] T020 [US3] Implement/verify metadata mapping for blog detail pages (file: `src/app/blog/[slug]/page.tsx`)

---

## Phase 6: User Story 4 — Control Tower (Admin Governance) (Priority: P2)

**Goal**: SaaS controls lifecycle: research → draft → review → schedule → publish.

**Independent Test**:
- Admin can view content items and governance state
- Admin can approve/reject transitions

### Implementation for User Story 4

- [ ] T021 [US4] Add governance state model in Prisma (files: `prisma/schema.prisma`, `prisma/migrations/**`)
- [ ] T022 [US4] Add admin UI for governance state management (files: `src/app/**` as defined in `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`)

---

## Phase 7: User Story 5 — Automation (n8n + AI Worker) (Priority: P3)

**Goal**: Automated ingestion + research + draft generation with human approvals.

**Independent Test**:
- Trigger ingestion → research artifact created
- Approve research → draft created

### Implementation for User Story 5

- [ ] T023 [US5] Define automation workflow(s) and triggers (doc: `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`)

---

## Phase 8: User Story 6 — Auditability + Observability (Priority: P3)

**Goal**: Every action is traceable: who/what/when/why.

**Independent Test**:
- Admin can view audit events per content item

### Implementation for User Story 6

- [ ] T024 [US6] Define + implement audit event model and required events (doc: `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`)

---

## Phase 9: User Story 7 — Rollout + Safety (Priority: P3)

**Goal**: Safe rollout and rollback paths.

**Independent Test**:
- If Strapi is down, public blog still renders (fallback)

### Implementation for User Story 7

- [ ] T025 [US7] Document rollout + rollback steps (doc: `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`)
