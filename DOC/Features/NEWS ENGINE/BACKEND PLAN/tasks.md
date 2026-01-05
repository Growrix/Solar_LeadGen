---
description: "Tasks for News Engine backend implementation"
---

# Tasks: News Engine

**Input**: Design documents from `DOC/FEATURES/NEWS ENGINE/` and `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/`
**Prerequisites**: `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-2026-01-04.md`, `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`, `DOC/FEATURES/NEWS ENGINE/UX-FINE-TUNING-PLAN-2026-01-03.md`

**Tests**: OPTIONAL - only include if explicitly requested in the feature spec (not requested for this feature).

**Organization**: Tasks are grouped by user story to enable independent implementation and verification of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Single Next.js project: `src/`, `prisma/` at repository root
- Next.js route handlers: `src/app/api/**/route.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal shared scaffolding to keep implementation consistent

- [ ] T001 [P] Create News Engine server modules folder `src/lib/news-engine/` (new)
- [ ] T002 [P] Create News Engine API folder structure under `src/app/api/news/` and `src/app/api/admin/news-engine/` (new)
- [ ] T003 [P] Confirm admin auth helper usage via `src/lib/auth/authorization.ts` (`requireAdmin`) for all admin endpoints

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Define News Engine constants and shared helpers in `src/lib/news-engine/` (slug generation, confirm-text validation)
- [ ] T005 Add Prisma enums/models for News Engine in `prisma/schema.prisma` (NewsItem, NewsSource, NewsAuditLog, NewsAutomationRule)
  - include `NewsItem.deletedAt DateTime?` (soft delete)
  - include `NewsItem.contentHtml String @default("")` (HTML content)
  - include `NewsItem.seoTitle String?`, `NewsItem.seoDescription String?`, `NewsItem.ogImageUrl String?`
- [ ] T006 Create migration `add_news_engine_models` under `prisma/migrations/` (via Prisma migrate)
- [ ] T007 Validate schema with `npx prisma validate`
- [ ] T008 [P] Add News Engine settings keys read/write helpers (use existing service in `src/lib/services/settings-service.ts`)
- [ ] T009 [P] Add News Engine audit log writer helper in `src/lib/news-engine/audit.ts` (writes to `NewsAuditLog` via `src/lib/prisma.ts`)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Public News Read (Priority: P1) 🎯 MVP

**Goal**: As a visitor, I can browse published news and open a published item by slug.

**Independent Test**: After at least one item is published, `/news` lists it and `/news/[slug]` renders it.

### Implementation for User Story 1

- [ ] T010 [US1] Implement public listing endpoint in `src/app/api/news/route.ts` (GET)
  - return only `PUBLISHED` where `deletedAt IS NULL`
  - cursor pagination by `id`, limit default 20, max 100
- [ ] T011 [US1] Implement public details endpoint in `src/app/api/news/[slug]/route.ts` (GET)
  - 404 if not found, not `PUBLISHED`, or soft-deleted

**Checkpoint**: Public read endpoints functional and testable independently

---

## Phase 4: User Story 2 - Admin Manage News Items (Priority: P1) 🎯 MVP

**Goal**: As an admin, I can create, edit, publish, schedule, reject, and delete (soft delete) News Items.

**Independent Test**: Using admin API only, create a draft, publish it, verify it appears via `GET /api/news`.

### Implementation for User Story 2

- [ ] T020 [US2] Implement items collection route in `src/app/api/admin/news-engine/items/route.ts`
  - GET list with filters (status/category/date range) + cursor pagination
  - POST create manual draft
- [ ] T021 [US2] Implement item detail route in `src/app/api/admin/news-engine/items/[id]/route.ts`
  - GET single item
  - PUT update item
  - DELETE soft delete (set `deletedAt`)
- [ ] T022 [US2] Implement publish-now action route in `src/app/api/admin/news-engine/items/[id]/publish-now/route.ts` (POST)
  - require confirm text
  - generate slug if missing
  - set `status=PUBLISHED`, `publishedAt=now()`
- [ ] T023 [US2] Implement schedule action route in `src/app/api/admin/news-engine/items/[id]/schedule/route.ts` (POST)
  - validate schedule time is in the future
  - set `status=SCHEDULED`, `scheduledFor`
- [ ] T024 [US2] Implement reject action route in `src/app/api/admin/news-engine/items/[id]/reject/route.ts` (POST)
  - set `status=REJECTED`, `rejectedAt`, `rejectionReason`
- [ ] T024a [US2] Implement rewrite request route in `src/app/api/admin/news-engine/items/[id]/rewrite-request/route.ts` (POST)
  - accept `{ note: string }` (required)
  - set `status=DRAFT` (keeps item editable)
  - write audit log entry with note in metadata/promptUsed
- [ ] T025 [US2] Write `NewsAuditLog` entries for create/update/publish/schedule/reject/delete via `src/lib/news-engine/audit.ts`

**Checkpoint**: Admin item lifecycle operations work and generate audit logs

---

## Phase 5: User Story 3 - Admin Pipeline, Sources, Automation, Audit Logs (Priority: P2)

**Goal**: As an admin, I can control pipeline status, manage sources, manage automation rules/config, and view audit logs.

**Independent Test**: Pipeline status endpoints update settings; sources/rules CRUD works; audit logs endpoint returns entries.

### Implementation for User Story 3

- [ ] T030 [US3] Implement pipeline status endpoint in `src/app/api/admin/news-engine/pipeline/status/route.ts` (GET)
- [ ] T031 [US3] Implement pipeline pause endpoint in `src/app/api/admin/news-engine/pipeline/pause/route.ts` (POST)
- [ ] T032 [US3] Implement pipeline resume endpoint in `src/app/api/admin/news-engine/pipeline/resume/route.ts` (POST)
- [ ] T033 [US3] Implement emergency stop endpoint in `src/app/api/admin/news-engine/pipeline/emergency-stop/route.ts` (POST)
  - require confirm text
- [ ] T034 [US3] Implement sources collection route in `src/app/api/admin/news-engine/sources/route.ts` (GET, POST)
- [ ] T035 [US3] Implement sources detail route in `src/app/api/admin/news-engine/sources/[id]/route.ts` (PUT, DELETE)
- [ ] T036 [US3] Implement automation rules collection route in `src/app/api/admin/news-engine/automation/rules/route.ts` (GET, POST)
- [ ] T037 [US3] Implement automation rules detail route in `src/app/api/admin/news-engine/automation/rules/[id]/route.ts` (PUT, DELETE)
- [ ] T038 [US3] Implement automation config endpoint in `src/app/api/admin/news-engine/automation/config/route.ts` (GET, PUT)
  - persist keys in Settings via `src/lib/services/settings-service.ts`
- [ ] T039 [US3] Implement audit logs endpoint in `src/app/api/admin/news-engine/audit-logs/route.ts` (GET)
  - filtering by date range, itemId, action + cursor pagination

- [ ] T039a [US3] Implement News Engine settings endpoints in `src/app/api/admin/news-engine/settings/route.ts` (GET, PUT)
  - persist `news.settings.*`, `news.ai.*`, `news.notifications.*`, `news.ops.*` via `src/lib/services/settings-service.ts`
  - do NOT persist AI provider API keys in DB (env-only)

**Checkpoint**: Admin controls + configuration endpoints functional

---

## Phase 6: User Story 4 - In-App E2E Wiring (Priority: P2)

**Goal**: The existing News Engine UI uses the real backend (DB + API) instead of localStorage stubs.

**Independent Test**: Publish via admin UI → item appears on public `/news` without relying on localStorage.

### Implementation for User Story 4

- [ ] T040 [P] [US4] Add client-side API wrappers in `src/lib/news-engine/client.ts` (new)
- [ ] T041 [US4] Update public listing page `src/app/news/page.tsx` to fetch from `GET /api/news`
- [ ] T042 [US4] Update public detail page `src/app/news/[slug]/page.tsx` to fetch from `GET /api/news/[slug]`
- [ ] T043 [US4] Update admin hub `src/components/news-engine/AdminNewsEngineHub.tsx` to load data from admin APIs
- [ ] T044 [US4] Update admin actions in hub/modals to call admin endpoints (publish/schedule/reject/create/edit/delete)
- [ ] T045 [US4] Decide localStorage fallback strategy:
  - keep `src/lib/ui-stubs/news-engine.ts` for dev-only fallback OR
  - remove usage entirely after cutover

**Checkpoint**: UI E2E verified against DB-backed backend

---

## Phase 7: Verification & Cross-Cutting

**Purpose**: Validate build and ensure no regressions

- [ ] T050 Run `npx prisma validate`
- [ ] T051 Run `npx tsc --noEmit`
- [ ] T052 Run `npm run build`
- [ ] T053 Manual smoke: create draft → publish → verify `/news` and `/news/[slug]` render from DB

---

## Phase 8: Post-Visual-QA Fixes (E2E Polish)

**Purpose**: Address issues found during real visual testing after the MVP cutover.

- [ ] T054 [US4] Publish confirmation modal: switch to Yes/No (no typed "PUBLISH")
  - `src/components/news-engine/v6/modals/ConfirmationModal.tsx`
  - `src/components/news-engine/AdminNewsEngineHub.tsx`

- [ ] T055 [US4] Scheduling modal: prefill saved `scheduledFor` and block past dates/times
  - `src/components/news-engine/v6/modals/ScheduleModal.tsx`

- [ ] T056 [US4] Share modal: add more channels (WhatsApp, Email) and wire buttons to real share links
  - `src/app/news/[slug]/page.tsx`

- [ ] T057 [US5] Request-driven scheduled publishing: publish due scheduled items on read
  - helper: `src/lib/news-engine/publish-due.ts`
  - call sites:
    - `src/app/api/news/route.ts`
    - `src/app/api/news/[slug]/route.ts`
    - `src/app/api/admin/news-engine/items/route.ts`

**Checkpoint**: Visual QA items resolved; scheduled items reliably become published without manual intervention.

---

## Phase 9: Scheduled Auto-Publish (Deferred)

**Decision**: Deferred to Phase 2 (future work)

- [ ] T060 [US5] Add scheduler/cron mechanism (Vercel Cron / server cron / job queue)
- [ ] T061 [US5] Job: publish items where `status=SCHEDULED AND scheduledFor<=now AND deletedAt IS NULL`
- [ ] T062 [US5] Write audit log entry for automatic publish in `src/lib/news-engine/audit.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Verification (Phase 7)**: Depends on desired user stories being complete
- **Scheduled auto-publish (Phase 8)**: Deferred by decision

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2
- **US2 (P1)**: Requires Phase 2
- **US3 (P2)**: Requires Phase 2
- **US4 (P2)**: Requires US1 + US2 endpoints to exist (for meaningful UI E2E)

---

## Notes
- Backend can be verified E2E via API without any frontend work.
- In-app E2E requires US4 because the current UI reads from `src/lib/ui-stubs/news-engine.ts` (localStorage).
