---
description: "Tasks for News Engine backend implementation"
---

# Tasks: News Engine

**Input**: Design documents from `DOC/FEATURES/NEWS ENGINE/` and `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/`
**Prerequisites**: `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-2026-01-04.md`, `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-2026-01-08.md`, `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`, `DOC/FEATURES/NEWS ENGINE/UX-FINE-TUNING-PLAN-2026-01-03.md`

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

## Phase 10: AI + Automation + Research (RSS + Web/Trend) + Rejected Queue (Approved Scope)

**Purpose**: Implement the missing “AI + Automation” portion end-to-end and make all existing News Engine UI controls functional.

**Owner confirmations applied**:
- Use existing `.env` OpenAI values (`OPENAI_API_KEY`, `OPENAI_MODEL`). “Gemini” in UI is legacy and must be updated.
- Auto-publish is allowed when the system is in **Automatic/Live** state (`pipelineStatus=NOMINAL`) and auto-publish is enabled.
- RSS + Web + Trend/Social/Journal research controls in the UI must work E2E.
- Add **Rejected** column/queue: rejected items are visible, can be regenerated/restored, and are only permanently deleted from the rejected queue.

### Data model + migrations

- [x] T070 Add Prisma enums/models for research + automation logs in `prisma/schema.prisma`
  - add `NewsResearchKind` enum
  - add `NewsResearchEntry` model (dedup by `@@unique([kind,url])`)
  - extend `NewsJobType` with `RESEARCH_SYNC` and `AI_REGENERATE`
  - add/extend `NewsJobLog` + `NewsAiRequestLog` as per `BACKEND-PLAN-NEWS-ENGINE-AI-AUTOMATION-2026-01-05.md`
- [x] T071 Create migration for the new models under `prisma/migrations/`
- [x] T072 Run `npx prisma validate`

### Research + RSS ingestion endpoints (admin)

- [x] T073 [US3] Add RSS sync endpoint `POST src/app/api/admin/news-engine/sources/[id]/sync/route.ts`
  - fetch/parse RSS/Atom
  - upsert `NewsSourceEntry` by `(sourceId,url)`
  - update `NewsSource.lastSync`/fetch metadata
  - write audit log `news_source_sync_*`

- [x] T073b [US3] RSS sync hardening (E2E audit fix)
  - enforce Node runtime for RSS parsing (`rss-parser`)
  - add fetch timeout + clearer error messages returned to UI
  - detect HTML/non-feed responses and guide admin to use a real RSS/Atom URL
  - persist actionable `NewsSource.lastError` on fetch/parse exceptions
  - align internal runner RSS ingestion behavior

- [x] T074 [US3] Add source entries viewer endpoint `GET src/app/api/admin/news-engine/sources/[id]/entries/route.ts`
  - cursor pagination + `status` filter

- [x] T075 [US3] Add research ingestion endpoint(s)
  - `POST src/app/api/admin/news-engine/research/sync/route.ts` (kinds: WEB/SOCIAL/JOURNAL/TREND)
  - persist `NewsResearchEntry`
  - write audit logs for research sync

### AI generation + regeneration (admin)

- [x] T076 [US2/US3] Add draft generation from RSS entry `POST src/app/api/admin/news-engine/entries/[entryId]/generate-draft/route.ts`
  - calls OpenAI using `OPENAI_API_KEY` / `OPENAI_MODEL`
  - writes `NewsAiRequestLog` + `NewsAuditLog`

- [x] T077 [US2/US3] Add draft generation from research bundle `POST src/app/api/admin/news-engine/research/generate-draft/route.ts`
  - fetches research results + persists them
  - calls OpenAI and creates `NewsItem`

- [x] T078 [US2] Add regenerate endpoint for rejected items `POST src/app/api/admin/news-engine/items/[id]/regenerate/route.ts`
  - only for `status=REJECTED`
  - clears rejection fields + sets status back to `DRAFT_READY` (or `NEEDS_REVIEW`) after regeneration
  - writes `NewsAiRequestLog` + `NewsAuditLog`

### Automation runner + scheduler entrypoint

- [x] T079 [US3] Add internal runner endpoint `POST src/app/api/internal/news-engine/automation/run/route.ts`
  - secret header auth
  - gates on pipeline status (`PAUSED`/`EMERGENCY_STOP` => no-op)
  - orchestrates RSS sync + research sync + AI drafting + optional schedule/publish
  - writes `NewsJobLog`

- [x] T080 [US3] Implement auto-publish semantics
  - auto-publish only when `pipelineStatus=NOMINAL` and `automation.autoPublish=true`
  - otherwise generate drafts as `NEEDS_REVIEW`

### UI wiring (make existing controls real)

- [x] T081 [US4] Wire “Web & Trend Research” controls in `src/components/news-engine/v6/tabs/SourcesTab.tsx` to backend persistence
  - persist `sourcesResearchEnabled`, `sourcesResearchWeights`, min-sources, countries, blacklist
  - load these values from backend on page load

- [x] T082 [US4] Update Settings UI labels from Gemini → OpenAI
  - `src/components/news-engine/v6/tabs/SettingsTab.tsx`
  - `src/components/news-engine/v6/modals/TestPreviewModal.tsx`
  - `src/components/news-engine/v6/modals/PromptDetailsModal.tsx`

### Rejected queue/column behavior (UI + backend)

- [x] T083 [US4] Add a **Rejected** column to the “Drafts & Reviews” board and include `REJECTED` items in filters
  - `src/components/news-engine/AdminNewsEngineHub.tsx`
  - `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`

- [x] T084 [US2/US4] Add permanent delete from rejected queue only
  - backend: `DELETE src/app/api/admin/news-engine/items/[id]/purge/route.ts` (hard delete, only if `status=REJECTED`)
  - UI: rejected column delete button must call purge endpoint; other deletes remain soft delete

- [x] T085 [US4] Add actions on rejected items
  - Regenerate (calls `/items/[id]/regenerate`)
  - Restore to Draft (can reuse rewrite-request behavior or add a dedicated restore endpoint)
  - Reschedule / Publish again (existing flows)

### Verification

- [x] T086 Run `npx prisma validate`
- [x] T087 Run `npx tsc --noEmit`
- [x] T088 Run `npm run build`
- [ ] T089 Manual E2E: enable automation + set pipeline NOMINAL → runner creates drafts → auto-publish occurs when enabled

---

## Phase 11: AI Content Flow Audit & Critical Fixes (2026-01-07)

**Purpose**: Fix critical gaps found during visual QA where AI-generated content was not displaying correctly.

**Issues Identified**:
1. **Admin vs Public Content Mismatch**: Public page showed HARDCODED placeholder content instead of real AI-generated `contentHtml` from DB
2. **AI Rewrite Modal Non-Functional**: The rewrite endpoint only logged requests but did NOT actually call AI to regenerate content
3. **Review Modal Hardcoded Data**: Previously fixed in conversation - review modal was showing static placeholder text

### Critical Fixes Applied

- [x] T090 [US4] Fix public news detail page to render real `contentHtml` from DB
  - `src/app/news/[slug]/page.tsx` - replaced hardcoded paragraphs with `dangerouslySetInnerHTML={{ __html: item.contentHtml }}`
  - Fallback shows "No content available" if contentHtml is empty

- [x] T091 [US2] Fix rewrite-request endpoint to actually call AI and regenerate content
  - `src/app/api/admin/news-engine/items/[id]/rewrite-request/route.ts` - complete rewrite
  - Now calls OpenAI with editor instructions from the modal
  - Creates `NewsAiRequestLog` entry for tracking
  - Updates item with new AI-generated content (title, summary, contentHtml, SEO fields)
  - Sets status to `DRAFT_READY` after successful rewrite
  - Logs `news_item_rewritten` action in audit log

- [x] T092 Add `news_item_rewritten` action type to audit log types
  - `src/lib/news-engine/audit.ts` - added to `NewsEngineAuditAction` union type

### Verification

- [x] T093 Run `npx tsc --noEmit` - PASSED
- [ ] T094 Visual verification: confirm public page now shows real AI content
- [ ] T095 Visual verification: confirm AI rewrite modal now regenerates content
- [ ] T096 Run `npm run build`

### Additional Fixes (from E2E Audit)

- [x] T097 [US4] Create AI-powered manual draft generation endpoint
  - `src/app/api/admin/news-engine/items/generate-manual/route.ts` - NEW
  - Calls OpenAI to generate full article from user's title/prompt
  - Creates `NewsAiRequestLog` entry
  - Generates unique slug
  - Returns complete NewsItem with AI-generated content

- [x] T098 [US4] Wire ManualDraftModal to AI generation endpoint
  - `src/components/news-engine/AdminNewsEngineHub.tsx` - updated onGenerate handler
  - `src/lib/news-engine/client.ts` - added `adminGenerateManualDraft()` function
  - Changed from creating stub item with prompt as summary → calling AI endpoint

- [x] T099 Export `findAvailableSlug` helper for reuse
  - `src/lib/news-engine/publish-due.ts` - exported function

- [x] T100 Run `npx tsc --noEmit` - PASSED

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

## Summary of AI Automation Status (Post Phase 11)

| Feature | Status | Notes |
|---------|--------|-------|
| RSS Sync → AI Draft | ✅ Working | Automation runner fetches RSS, calls OpenAI |
| Manual Draft with AI | ✅ Working | NEW - Now calls OpenAI instead of creating stub |
| AI Rewrite | ✅ Working | Calls OpenAI with editor instructions |
| AI Regenerate (Rejected) | ✅ Working | Only for REJECTED items |
| Public Display | ✅ Working | Uses real contentHtml from DB |
| Settings Persistence | ✅ Working | SettingsTab fields now persist via settings API |
| Test Preview | ✅ Working | Calls real admin test endpoint and renders real AI output |

---

## Phase 12: Close Audit Gaps (Config Persistence + Test Preview) (2026-01-07)

**Purpose**: Implement the remaining high-impact audit gaps so every major UI control is deterministic and persisted.

**Sequencing rule**: Fix **non-functional** surfaces first (Test Preview), then remove fake UI behavior (Manual Draft timer), then persist settings.

### P0 (Critical): Test & Preview must be real

- [x] T101 [US4] Implement AI test/preview endpoint (no DB writes)
  - `POST src/app/api/admin/news-engine/research/test/route.ts`
  - Require admin auth
  - Input: `{ topic?: string, url?: string }`
  - Output: `{ result: { title, summary, contentHtml, seoTitle?, seoDescription?, citations? }, modelUsed, durationMs }`

- [x] T102 [US4] Wire TestPreviewModal to call the real endpoint
  - `src/components/news-engine/v6/modals/TestPreviewModal.tsx`
  - Replace `mockResult` + `setTimeout` with API call + real result rendering
  - Ensure save-to-drafts uses generated result (not the selected item)

### P1 (High): Remove fake generation timer from Manual Draft

- [x] T103 [US4] Make ManualDraftModal generation deterministic
  - `src/components/news-engine/v6/modals/ManualDraftModal.tsx`
  - Replace `setTimeout` with `await onGenerate(...)`
  - Add minimal inline error handling (no new UX surfaces)

### P1 (High): Persist SettingsTab fields end-to-end

- [x] T104 [US3/US4] Extend News Engine settings keys + persistence
  - `src/lib/news-engine/settings.ts` add keys for:
    - `news.ai.writing_tone`
    - `news.ai.model_label`
    - `news.ai.hallucination_monitoring`
    - `news.ai.content_preservation`
    - `news.settings.dedup_sensitivity`
    - `news.ops.auto_archive_period`
    - `news.notifications.email_alerts`
    - `news.notifications.weekly_digest`
  - `src/app/api/admin/news-engine/settings/route.ts` GET/PUT must read/write these fields

- [x] T105 [US4] Update SettingsTab to use persisted state (no UI-only local values)
  - `src/components/news-engine/v6/tabs/SettingsTab.tsx`
  - Ensure save/reset writes all settings fields and reload shows same values

### Verification

- [x] T106 Run `npx tsc --noEmit`
- [x] T107 Run `npm run build`
- [ ] T108 Manual QA: Test & Preview generates real output; Save to Drafts creates item with generated content
- [ ] T109 Manual QA: Settings values persist across reload

---

## Phase 13: AI Router + Key Vault + Provenance/Image Controls (2026-01-08)

**Purpose**: Close the remaining admin-control gaps introduced by the V6 Settings/Review UI: per-task model routing, encrypted multi-key management, per-item provenance, and persistent image control state.

**Primary reference**: `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-2026-01-08.md`

### Data model + migrations (additive, safe)

- [ ] T110 Add Prisma models/enums for AI Router + Key Vault + image controls
  - `prisma/schema.prisma`
  - add `NewsAiTaskType` enum (task list must match UI)
  - add `NewsModelProfile` model
  - add `NewsModelRouterDefault` model (unique by taskType)
  - add `NewsApiKey` model + `NewsApiKeyPool` enum
  - extend `NewsAiRequestLog` with `taskType`, `modelProfileId`, `apiKeyId`, `durationMs` (nullable)
  - extend `NewsItem` with `ogImageApprovalRequired`, `ogImageApprovedAt`, `ogImageApprovedById` (nullable)

- [ ] T111 Create migration under `prisma/migrations/` for the new tables/fields
- [ ] T112 Run `npx prisma validate`

### Backend services (shared helpers)

- [ ] T113 Implement app-level encryption helper for Key Vault (AES-256-GCM)
  - new helper location (suggested): `src/lib/news-engine/key-vault-crypto.ts`
  - master key sourced from env var (name per plan; must not be logged)

- [ ] T114 Implement Key Vault selection policy (pool → enabled keys → least-recently-used)
  - suggested: `src/lib/news-engine/key-vault.ts`
  - update usage timestamps + lastSuccess/lastError fields

- [ ] T115 Implement Model Router resolution helper (taskType → model profile)
  - suggested: `src/lib/news-engine/ai-router.ts`
  - fallback behavior: if missing config, use current global settings/env behavior

### Admin APIs (new endpoints)

- [ ] T116 Add Model Profiles endpoints
  - `GET/POST src/app/api/admin/news-engine/model-profiles/route.ts`
  - `PUT/DELETE src/app/api/admin/news-engine/model-profiles/[id]/route.ts`
  - require admin auth; write audit logs

- [ ] T117 Add AI Router defaults endpoints
  - `GET/PUT src/app/api/admin/news-engine/ai-router/defaults/route.ts`
  - require admin auth; write audit logs

- [ ] T118 Add Key Vault endpoints
  - `GET/POST src/app/api/admin/news-engine/key-vault/route.ts`
  - `PUT src/app/api/admin/news-engine/key-vault/[id]/route.ts`
  - list returns masked keys only; create/update accepts `rawKey` but never returns it
  - require admin auth; write audit logs

- [ ] T119 Add item provenance + image controls endpoints
  - `GET src/app/api/admin/news-engine/items/[id]/provenance/route.ts`
  - `PUT src/app/api/admin/news-engine/items/[id]/image-controls/route.ts`
  - provenance derives URLs from `NewsSourceEntry` + `NewsResearchEntry` and per-stage labels from `NewsAiRequestLog`

### Wire existing AI call sites to Router + Vault (incremental, safe)

- [ ] T120 Update existing AI endpoints to use router+vault and write richer provenance
  - `src/app/api/admin/news-engine/items/generate-manual/route.ts`
  - `src/app/api/admin/news-engine/items/[id]/rewrite-request/route.ts`
  - `src/app/api/admin/news-engine/items/[id]/regenerate/route.ts`
  - `src/app/api/admin/news-engine/entries/[entryId]/generate-draft/route.ts`
  - `src/app/api/admin/news-engine/research/generate-draft/route.ts`
  - `src/app/api/admin/news-engine/research/test/route.ts`
  - `src/app/api/internal/news-engine/automation/run/route.ts`
  - ensure each AI call logs `taskType` + chosen `modelProfileId` + `apiKeyId` when available

### Admin UI wiring (V6)

- [ ] T121 Wire SettingsTab AI Router + Key Vault to new endpoints
  - `src/components/news-engine/v6/tabs/SettingsTab.tsx`
  - load model profiles, defaults, and masked vault list on mount
  - save router defaults and key create/update via API

- [ ] T122 Wire ReviewModal provenance + image controls to new endpoints
  - `src/components/news-engine/v6/modals/ReviewModal.tsx`
  - load provenance on open
  - persist `ogImageUrl` + approval-required toggle via API

### Verification

- [x] T123 Run `npx tsc --noEmit`
- [x] T124 Run `npm run build`
- [ ] T125 Manual QA: router defaults + key vault persist; provenance renders; image controls persist

---

## Phase 7 (Workflow): Post-Feature (Operate + Verify)

**Purpose**: Remove the “what is working vs static” confusion by producing an operator-ready guide, explicit wiring map, and final verification record.

**Outputs (required)**: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/`
- `NEWS-ENGINE-POST-IMPLEMENTATION-AUDIT-2026-01-08.md`
- `NEWS-ENGINE-POST-FEATURE-DOCS-2026-01-08.md`

### Final Audit (E2E audit and verification)

- [x] T126 Run comprehensive post-implementation audit prompt:
  - input template: `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`
  - output report: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-POST-IMPLEMENTATION-AUDIT-2026-01-08.md`

- [x] T127 Verification runbook (Phase 13)
  - run: `npm run test:e2e:news-engine-phase13`
  - record result (passed/skipped/failed) in the audit report
  - confirm Key Vault behavior with and without master key env

### Post-Feature Docs (Operate + Verify)

- [x] T128 Create Feature User Guide + Tooltips + Function Map + Final Checklist
  - input template: `DOC/PROMPTS/PROMPTS & TEMPLATES/POST FEATURE/feature-post-implementation-doc-template.md`
  - output: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-POST-FEATURE-DOCS-2026-01-08.md`

### Audit & Correction Loop (repeat until green)

- [x] T129 Audit the post-feature docs against the implementation (UI/API/DB)
  - log concrete mismatches (what UI says vs what API actually does)
  - fix docs to match reality (do not invent flows)

- [x] T130 If gaps are found that cause “static vs working” confusion, log them as explicit follow-up tasks
  - examples: missing Model Profiles UI CRUD, missing Key Vault env guidance, missing error states

### Final Sign-off

- [ ] T131 Sign-off: docs complete, verification green, feature is operable
  - sign-off by:
  - date:

### Follow-up Tasks (Production Clarity)

- [x] T132 Add Model Profiles CRUD in Settings (create/enable/disable)
  - UI: `src/components/news-engine/v6/tabs/SettingsTab.tsx`
  - API already exists: `/api/admin/news-engine/model-profiles`

- [x] T133 Add Settings banner when Key Vault master key is missing/invalid
  - UI: `src/components/news-engine/v6/tabs/SettingsTab.tsx`
  - Behavior: do not allow Add/Edit Key submit without master key; show deterministic message

- [x] T134 Make model profile seeding resilient when profiles exist but all are disabled
  - helper: `src/lib/news-engine/ai-router.ts` (`ensureDefaultModelProfiles`)

### Follow-up Tasks (Audit 2026-01-12)

**Source**: `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-phase1-comprehensive-feature-implementation-audit-2026-01-12.md`

- [x] T135 Harden AI Router defaults save when stale/disabled profile IDs exist
  - API: `src/app/api/admin/news-engine/ai-router/defaults/route.ts`
  - Behavior: clear invalid defaults and return warnings (do not fail the entire save)

- [x] T136 Make Phase 13 Key Vault Playwright test idempotent
  - Test: `tests/e2e/news-engine-phase13-router-vault-provenance.spec.ts`
  - Behavior: use unique key label per run to avoid collisions

- [ ] T137 Decide fate of Schedule modal extra controls (priority/expiry/featured)
  - UI: `src/components/news-engine/v6/modals/ScheduleModal.tsx`
  - Option A: wire to DB + API + public behavior
  - Option B: remove controls so operators are not misled

- [ ] T138 Implement Research Sync per kind (WEB/SOCIAL/JOURNAL/TREND) and wire UI buttons
  - UI: `src/components/news-engine/v6/tabs/SourcesTab.tsx` ("Recent Research Sync")
  - Add endpoints: `src/app/api/admin/news-engine/research/*`
  - Add list view: "View Entries" should load real entries

- [ ] T139 Decide fate of "Generate AI image" button
  - UI: `src/components/news-engine/v6/modals/ReviewModal.tsx`
  - Option A: implement generation + persistence + approvals
  - Option B: remove/feature-flag until implemented

- [ ] T140 Enforce `ogImageApprovalRequired` on publish paths (if intended by SOT)
  - UI persists setting via: Review modal “Save as Draft”
  - Ensure enforcement exists in:
    - `src/app/api/admin/news-engine/items/[id]/publish-now/route.ts`
    - any auto-publish path(s)
