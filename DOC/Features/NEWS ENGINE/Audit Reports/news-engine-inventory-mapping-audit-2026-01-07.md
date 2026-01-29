# News Engine — Implementation Inventory & Mapping Audit (Phase 1)

Date: 2026-01-07

Scope: Implementation-driven inventory and mapping of the **News Engine** feature across UI, API, backend logic, and database.

Constraints:
- This report **does not compare** to any prototype/SOT/requirements doc.
- This report reflects **only what exists in the codebase**.

---

## 1) File & Directory Inventory

### A) Frontend (Admin)
- Admin entry page: [src/app/admin/news-engine/page.tsx](src/app/admin/news-engine/page.tsx)
- Hub component: [src/components/news-engine/AdminNewsEngineHub.tsx](src/components/news-engine/AdminNewsEngineHub.tsx)
- V6 UI modules:
  - Shared utilities/state helpers: [src/components/news-engine/v6/shared.tsx](src/components/news-engine/v6/shared.tsx)
  - Tabs:
    - [src/components/news-engine/v6/tabs/DashboardTab.tsx](src/components/news-engine/v6/tabs/DashboardTab.tsx)
    - [src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx](src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx)
    - [src/components/news-engine/v6/tabs/AuditLogsTab.tsx](src/components/news-engine/v6/tabs/AuditLogsTab.tsx)
    - [src/components/news-engine/v6/tabs/MasterControlTab.tsx](src/components/news-engine/v6/tabs/MasterControlTab.tsx)
    - [src/components/news-engine/v6/tabs/AutomationLogicTab.tsx](src/components/news-engine/v6/tabs/AutomationLogicTab.tsx)
    - [src/components/news-engine/v6/tabs/SourcesTab.tsx](src/components/news-engine/v6/tabs/SourcesTab.tsx)
    - [src/components/news-engine/v6/tabs/SettingsTab.tsx](src/components/news-engine/v6/tabs/SettingsTab.tsx)
  - Modals:
    - [src/components/news-engine/v6/modals/AddEditSourceModal.tsx](src/components/news-engine/v6/modals/AddEditSourceModal.tsx)
    - [src/components/news-engine/v6/modals/ManualDraftModal.tsx](src/components/news-engine/v6/modals/ManualDraftModal.tsx)
    - [src/components/news-engine/v6/modals/ReviewModal.tsx](src/components/news-engine/v6/modals/ReviewModal.tsx)
    - [src/components/news-engine/v6/modals/ScheduleModal.tsx](src/components/news-engine/v6/modals/ScheduleModal.tsx)
    - [src/components/news-engine/v6/modals/RewriteModal.tsx](src/components/news-engine/v6/modals/RewriteModal.tsx)
    - [src/components/news-engine/v6/modals/RejectModal.tsx](src/components/news-engine/v6/modals/RejectModal.tsx)
    - [src/components/news-engine/v6/modals/TestPreviewModal.tsx](src/components/news-engine/v6/modals/TestPreviewModal.tsx)
    - [src/components/news-engine/v6/modals/AuditDateRangeModal.tsx](src/components/news-engine/v6/modals/AuditDateRangeModal.tsx)
    - [src/components/news-engine/v6/modals/AuditLogDetailsModal.tsx](src/components/news-engine/v6/modals/AuditLogDetailsModal.tsx)
    - [src/components/news-engine/v6/modals/PromptDetailsModal.tsx](src/components/news-engine/v6/modals/PromptDetailsModal.tsx)
    - [src/components/news-engine/v6/modals/AutomationGuidelinesModal.tsx](src/components/news-engine/v6/modals/AutomationGuidelinesModal.tsx)
    - [src/components/news-engine/v6/modals/OperationalRuleModal.tsx](src/components/news-engine/v6/modals/OperationalRuleModal.tsx)
    - [src/components/news-engine/v6/modals/ConfirmationModal.tsx](src/components/news-engine/v6/modals/ConfirmationModal.tsx)

### B) Frontend (Public)
- Public list page: [src/app/news/page.tsx](src/app/news/page.tsx)
- Public detail page: [src/app/news/[slug]/page.tsx](src/app/news/[slug]/page.tsx)
- Homepage/news widget section: [src/components/NewsSection.tsx](src/components/NewsSection.tsx)

### C) Client API wrapper + shared UI types
- Client fetch wrappers (admin + public): [src/lib/news-engine/client.ts](src/lib/news-engine/client.ts)
- UI types + CSV export + local seed/storage helpers: [src/lib/ui-stubs/news-engine.ts](src/lib/ui-stubs/news-engine.ts)

### D) Backend libraries (News Engine)
- Barrel export: [src/lib/news-engine/index.ts](src/lib/news-engine/index.ts)
- Constants: [src/lib/news-engine/constants.ts](src/lib/news-engine/constants.ts)
- Slugs: [src/lib/news-engine/slug.ts](src/lib/news-engine/slug.ts)
- Confirm helpers: [src/lib/news-engine/confirm.ts](src/lib/news-engine/confirm.ts)
- Settings helpers (wrapping settings-service): [src/lib/news-engine/settings.ts](src/lib/news-engine/settings.ts)
- Audit logging helper: [src/lib/news-engine/audit.ts](src/lib/news-engine/audit.ts)
- Scheduled publishing helper: [src/lib/news-engine/publish-due.ts](src/lib/news-engine/publish-due.ts)

### E) API routes

#### Admin API
Base: `/api/admin/news-engine/*` (Next.js App Router route handlers)

- Items
  - [src/app/api/admin/news-engine/items/route.ts](src/app/api/admin/news-engine/items/route.ts)
  - [src/app/api/admin/news-engine/items/[id]/route.ts](src/app/api/admin/news-engine/items/[id]/route.ts)
  - [src/app/api/admin/news-engine/items/[id]/schedule/route.ts](src/app/api/admin/news-engine/items/[id]/schedule/route.ts)
  - [src/app/api/admin/news-engine/items/[id]/publish-now/route.ts](src/app/api/admin/news-engine/items/[id]/publish-now/route.ts)
  - [src/app/api/admin/news-engine/items/[id]/reject/route.ts](src/app/api/admin/news-engine/items/[id]/reject/route.ts)
  - [src/app/api/admin/news-engine/items/[id]/rewrite-request/route.ts](src/app/api/admin/news-engine/items/[id]/rewrite-request/route.ts)
  - [src/app/api/admin/news-engine/items/[id]/regenerate/route.ts](src/app/api/admin/news-engine/items/[id]/regenerate/route.ts)
  - [src/app/api/admin/news-engine/items/[id]/purge/route.ts](src/app/api/admin/news-engine/items/[id]/purge/route.ts)
  - Manual AI draft generation: [src/app/api/admin/news-engine/items/generate-manual/route.ts](src/app/api/admin/news-engine/items/generate-manual/route.ts)

- Sources
  - [src/app/api/admin/news-engine/sources/route.ts](src/app/api/admin/news-engine/sources/route.ts)
  - [src/app/api/admin/news-engine/sources/[id]/route.ts](src/app/api/admin/news-engine/sources/[id]/route.ts)
  - Sync source: [src/app/api/admin/news-engine/sources/[id]/sync/route.ts](src/app/api/admin/news-engine/sources/[id]/sync/route.ts)
  - List entries: [src/app/api/admin/news-engine/sources/[id]/entries/route.ts](src/app/api/admin/news-engine/sources/[id]/entries/route.ts)
  - Sources config: [src/app/api/admin/news-engine/sources/config/route.ts](src/app/api/admin/news-engine/sources/config/route.ts)

- Research
  - Sync research entries: [src/app/api/admin/news-engine/research/sync/route.ts](src/app/api/admin/news-engine/research/sync/route.ts)
  - Generate draft from research: [src/app/api/admin/news-engine/research/generate-draft/route.ts](src/app/api/admin/news-engine/research/generate-draft/route.ts)
  - Test AI preview: [src/app/api/admin/news-engine/research/test/route.ts](src/app/api/admin/news-engine/research/test/route.ts)

- Entry actions
  - Generate draft from RSS entry: [src/app/api/admin/news-engine/entries/[entryId]/generate-draft/route.ts](src/app/api/admin/news-engine/entries/[entryId]/generate-draft/route.ts)

- Pipeline control
  - Status: [src/app/api/admin/news-engine/pipeline/status/route.ts](src/app/api/admin/news-engine/pipeline/status/route.ts)
  - Pause: [src/app/api/admin/news-engine/pipeline/pause/route.ts](src/app/api/admin/news-engine/pipeline/pause/route.ts)
  - Resume: [src/app/api/admin/news-engine/pipeline/resume/route.ts](src/app/api/admin/news-engine/pipeline/resume/route.ts)
  - Emergency stop: [src/app/api/admin/news-engine/pipeline/emergency-stop/route.ts](src/app/api/admin/news-engine/pipeline/emergency-stop/route.ts)

- Automation
  - Config toggles + JSON: [src/app/api/admin/news-engine/automation/config/route.ts](src/app/api/admin/news-engine/automation/config/route.ts)
  - Run now (admin triggers internal runner): [src/app/api/admin/news-engine/automation/run-now/route.ts](src/app/api/admin/news-engine/automation/run-now/route.ts)
  - Rules collection: [src/app/api/admin/news-engine/automation/rules/route.ts](src/app/api/admin/news-engine/automation/rules/route.ts)
  - Rule by id: [src/app/api/admin/news-engine/automation/rules/[id]/route.ts](src/app/api/admin/news-engine/automation/rules/[id]/route.ts)

- Settings
  - [src/app/api/admin/news-engine/settings/route.ts](src/app/api/admin/news-engine/settings/route.ts)

- Audit logs
  - [src/app/api/admin/news-engine/audit-logs/route.ts](src/app/api/admin/news-engine/audit-logs/route.ts)

#### Public API
- List published: [src/app/api/news/route.ts](src/app/api/news/route.ts)
- Detail by slug: [src/app/api/news/[slug]/route.ts](src/app/api/news/[slug]/route.ts)

#### Internal (cron/automation runner)
- Internal runner: [src/app/api/internal/news-engine/automation/run/route.ts](src/app/api/internal/news-engine/automation/run/route.ts)

### F) Database & migrations
- Prisma schema (models/enums): [prisma/schema.prisma](prisma/schema.prisma)
- Migrations:
  - Initial News Engine models: [prisma/migrations/20260104122941_add_news_engine_models/migration.sql](prisma/migrations/20260104122941_add_news_engine_models/migration.sql)
  - Phase 10 extensions (entries/logs/enums): [prisma/migrations/20260105132149_news_engine_phase10_extensions/migration.sql](prisma/migrations/20260105132149_news_engine_phase10_extensions/migration.sql)

---

## 2) Frontend Implementation Mapping

### A) Admin UI — Entry points & navigation
- Route: `/admin/news-engine`
  - Entry: [src/app/admin/news-engine/page.tsx](src/app/admin/news-engine/page.tsx) renders `AdminNewsEngineHub`.
  - Linked from admin navigation:
    - [src/components/AdminSidebar.tsx](src/components/AdminSidebar.tsx)
    - [src/components/AdminMobileSidebarMenu.tsx](src/components/AdminMobileSidebarMenu.tsx)

- Tabs (top-level views) are managed in `AdminNewsEngineHub` with internal state:
  - Dashboard
  - Drafts & Reviews
  - Audit Logs
  - Master Control
  - Automation Logic
  - Sources
  - Settings

### B) Admin UI — State + flows (high-level)
- `AdminNewsEngineHub` loads state via `fetchAdminState()` which aggregates multiple admin endpoints:
  - Items, sources, automation config, settings, audit logs, pipeline status.
- The hub triggers actions via client wrappers in [src/lib/news-engine/client.ts](../../../src/lib/news-engine/client.ts):
 - The hub triggers actions via client wrappers in [src/lib/news-engine/client.ts](src/lib/news-engine/client.ts):
  - Create/update/delete/purge items
  - Schedule / publish now
  - Reject / rewrite request / regenerate
  - Manage sources and source config
  - Run automation now
  - Update settings + pipeline status

### C) Admin UI — Modals
- Review/edit/publishing workflow modals:
  - Manual Draft, Review, Schedule, Rewrite, Reject
- Operational/admin control modals:
  - Confirmation (pause/resume/emergency stop/publish/run-now)
  - Audit date range + log details + prompt details
  - Add/edit source
  - Automation guidelines + operational rule editor

### D) Public UI — Listing & detail
- `/news`:
  - Client-side fetch of published items via `fetchPublicNewsList()`.
  - Includes search text filter + category filter.
- `/news/[slug]`:
  - Client-side fetch via `fetchPublicNewsBySlug(slug)`.
  - Displays article content HTML and includes share modal.
- `NewsSection`:
  - Pulls top 3 published items and links to `/news` and `/news/[slug]`.

---

## 3) API Endpoint Mapping

### Auth model summary
- **Admin endpoints**: `requireAdmin()` guard (401/403 patterns) used throughout.
- **Internal runner**: requires `x-news-engine-cron-secret` header matching `NEWS_ENGINE_CRON_SECRET`.
- **Public endpoints**: no auth.

### Public endpoints
- `GET /api/news` → [src/app/api/news/route.ts](src/app/api/news/route.ts)
  - Response: `{ items, nextCursor }` where items are `PUBLISHED` and not deleted.
  - Side-effect: best-effort calls `publishDueScheduledNewsItems()`.
- `GET /api/news/:slug` → [src/app/api/news/[slug]/route.ts](src/app/api/news/[slug]/route.ts)
  - Response: `{ item }` for a `PUBLISHED` + not deleted item; `404` if missing.
  - Side-effect: best-effort calls `publishDueScheduledNewsItems()`.

### Admin endpoints (representative request/response shapes)

#### Items
- `GET /api/admin/news-engine/items` → [src/app/api/admin/news-engine/items/route.ts](src/app/api/admin/news-engine/items/route.ts)
  - Query params: `limit`, `cursor`, `status`, `category`, `q`, `from`, `to`, `includeDeleted=1`.
  - Response: `{ items, nextCursor }`.
  - Side-effect: best-effort calls `publishDueScheduledNewsItems()`.
- `POST /api/admin/news-engine/items`
  - Body: `title` (required) plus optional `summary`, `contentHtml`, `category`, `tags`, `status`, `aiModel`, `relevanceScore`, `sourceType`, SEO fields, `slug`.
  - Response: `{ item }`.
- `GET/PUT/DELETE /api/admin/news-engine/items/:id` → [src/app/api/admin/news-engine/items/[id]/route.ts](src/app/api/admin/news-engine/items/[id]/route.ts)
  - Fetch/update/delete an item by id.
- `POST /api/admin/news-engine/items/generate-manual` → [src/app/api/admin/news-engine/items/generate-manual/route.ts](src/app/api/admin/news-engine/items/generate-manual/route.ts)
  - AI-assisted manual draft generation; creates `NewsAiRequestLog` and a `NewsItem`.
- Action endpoints (by id): schedule, publish-now, reject, rewrite-request, regenerate, purge
  - Located under [src/app/api/admin/news-engine/items/[id]/*](src/app/api/admin/news-engine/items/[id]/)

#### Sources
- `GET/POST /api/admin/news-engine/sources` → [src/app/api/admin/news-engine/sources/route.ts](src/app/api/admin/news-engine/sources/route.ts)
  - Query params (GET): `q`, `enabled=1|0`, `limit`, `cursor`.
- `PUT/DELETE /api/admin/news-engine/sources/:id` → [src/app/api/admin/news-engine/sources/[id]/route.ts](src/app/api/admin/news-engine/sources/[id]/route.ts)
- `POST /api/admin/news-engine/sources/:id/sync` → [src/app/api/admin/news-engine/sources/[id]/sync/route.ts](src/app/api/admin/news-engine/sources/[id]/sync/route.ts)
  - Fetches RSS feed URL, upserts `NewsSourceEntry` rows (`createMany skipDuplicates`), updates etag/last-modified, writes audit log.
- `GET /api/admin/news-engine/sources/:id/entries` → [src/app/api/admin/news-engine/sources/[id]/entries/route.ts](src/app/api/admin/news-engine/sources/[id]/entries/route.ts)
- `GET/PUT /api/admin/news-engine/sources/config` → [src/app/api/admin/news-engine/sources/config/route.ts](src/app/api/admin/news-engine/sources/config/route.ts)
  - Stores normalized JSON in settings key `news.sources.config_json`.

#### Research
- `POST /api/admin/news-engine/research/sync` → [src/app/api/admin/news-engine/research/sync/route.ts](src/app/api/admin/news-engine/research/sync/route.ts)
  - Body: `{ kind: WEB|SOCIAL|JOURNAL|TREND, query?, entries: [{url,title?,publishedAt?,rawJson?}] }`.
  - Writes `NewsResearchEntry` rows and audit log.
- `POST /api/admin/news-engine/research/generate-draft` → [src/app/api/admin/news-engine/research/generate-draft/route.ts](src/app/api/admin/news-engine/research/generate-draft/route.ts)
  - Consumes `NEW` research entries and generates AI draft -> creates `NewsItem` and marks entries `PROCESSED`.
- `POST /api/admin/news-engine/research/test` → [src/app/api/admin/news-engine/research/test/route.ts](src/app/api/admin/news-engine/research/test/route.ts)
  - AI preview draft (testing tool).

#### Entry actions
- `POST /api/admin/news-engine/entries/:entryId/generate-draft` → [src/app/api/admin/news-engine/entries/[entryId]/generate-draft/route.ts](src/app/api/admin/news-engine/entries/[entryId]/generate-draft/route.ts)
  - Creates AI draft from a single RSS `NewsSourceEntry`.

#### Pipeline control
- `GET /api/admin/news-engine/pipeline/status` → [src/app/api/admin/news-engine/pipeline/status/route.ts](src/app/api/admin/news-engine/pipeline/status/route.ts)
- `POST /api/admin/news-engine/pipeline/pause` → [src/app/api/admin/news-engine/pipeline/pause/route.ts](src/app/api/admin/news-engine/pipeline/pause/route.ts)
- `POST /api/admin/news-engine/pipeline/resume` → [src/app/api/admin/news-engine/pipeline/resume/route.ts](src/app/api/admin/news-engine/pipeline/resume/route.ts)
- `POST /api/admin/news-engine/pipeline/emergency-stop` → [src/app/api/admin/news-engine/pipeline/emergency-stop/route.ts](src/app/api/admin/news-engine/pipeline/emergency-stop/route.ts)

#### Automation
- `GET/PUT /api/admin/news-engine/automation/config` → [src/app/api/admin/news-engine/automation/config/route.ts](src/app/api/admin/news-engine/automation/config/route.ts)
  - Settings keys: `news.automation.auto_draft`, `news.automation.auto_schedule`, `news.automation.auto_publish`, `news.automation.config_json`.
- `POST /api/admin/news-engine/automation/run-now` → [src/app/api/admin/news-engine/automation/run-now/route.ts](src/app/api/admin/news-engine/automation/run-now/route.ts)
  - Admin-triggered invocation of internal runner with cron secret.
- `GET/POST /api/admin/news-engine/automation/rules` → [src/app/api/admin/news-engine/automation/rules/route.ts](src/app/api/admin/news-engine/automation/rules/route.ts)
- `PUT/DELETE /api/admin/news-engine/automation/rules/:id` → [src/app/api/admin/news-engine/automation/rules/[id]/route.ts](src/app/api/admin/news-engine/automation/rules/[id]/route.ts)

#### Audit logs
- `GET /api/admin/news-engine/audit-logs` → [src/app/api/admin/news-engine/audit-logs/route.ts](src/app/api/admin/news-engine/audit-logs/route.ts)
  - Filters: `from`, `to`, `itemId`, `action`, cursor pagination.

### Internal runner
- `POST /api/internal/news-engine/automation/run` → [src/app/api/internal/news-engine/automation/run/route.ts](src/app/api/internal/news-engine/automation/run/route.ts)
  - Requires header `x-news-engine-cron-secret` (env `NEWS_ENGINE_CRON_SECRET`).
  - Creates `NewsJobLog(type=AUTO_RUN)` + audit logs for start/completion.
  - Observed responsibilities (based on implementation):
    - Pipeline pause / emergency stop short-circuit.
    - Reads settings (daily limit, dedup enabled, autoDraft/autoSchedule/autoPublish, config JSON windows).
    - RSS parsing (via `rss-parser`) and ingestion.
    - AI drafting via `callOpenAiJson`.
    - Scheduling decisions (time windows parsing) and publishing actions.

---

## 4) Backend Logic & Service Mapping

### A) News Engine library modules
- `publishDueScheduledNewsItems` ([src/lib/news-engine/publish-due.ts](../../../src/lib/news-engine/publish-due.ts))
 - `publishDueScheduledNewsItems` ([src/lib/news-engine/publish-due.ts](src/lib/news-engine/publish-due.ts))
  - Finds `NewsItem(status=SCHEDULED, scheduledFor<=now, deletedAt=null)` and updates them to `PUBLISHED`.
  - Writes audit log action `news_item_auto_published`.
  - Used opportunistically by:
    - `GET /api/news`
    - `GET /api/news/[slug]`
    - `GET /api/admin/news-engine/items`

- `writeNewsAuditLog` ([src/lib/news-engine/audit.ts](../../../src/lib/news-engine/audit.ts))
 - `writeNewsAuditLog` ([src/lib/news-engine/audit.ts](src/lib/news-engine/audit.ts))
  - Best-effort insert into `news_audit_logs` with optional actor/item/source/prompt/metadata.

- Settings helpers ([src/lib/news-engine/settings.ts](../../../src/lib/news-engine/settings.ts))
 - Settings helpers ([src/lib/news-engine/settings.ts](src/lib/news-engine/settings.ts))
  - Wraps settings-service keys for pipeline status + feature settings.

- Slug helpers ([src/lib/news-engine/slug.ts](../../../src/lib/news-engine/slug.ts))
 - Slug helpers ([src/lib/news-engine/slug.ts](src/lib/news-engine/slug.ts))
  - Shared slugify routine used by endpoints and scheduled publishing.

### B) Cross-feature dependencies
- AI calls go through [src/lib/openai.ts](src/lib/openai.ts) (via `callOpenAiJson`).
- Persistent settings are stored via [src/lib/services/settings-service](src/lib/services/settings-service) (used by admin settings/config endpoints and runner).

### C) Background jobs / automation
- Implemented as an internal Next.js route handler (`/api/internal/news-engine/automation/run`) that expects to be triggered externally (cron/service) or manually via admin "Run now".

---

## 5) Database & Prisma Model Mapping

### Enums (News Engine)
Defined in [prisma/schema.prisma](../../../prisma/schema.prisma):
Defined in [prisma/schema.prisma](prisma/schema.prisma):
- `NewsItemStatus`: DRAFT, NEEDS_REVIEW, RESEARCH_DONE, DRAFT_READY, PUBLISHED, SCHEDULED, REJECTED, ERROR
- `NewsItemSourceType`: RSS_FEED, AI_AGENT, MANUAL_ENTRY
- `NewsSourceKind`: RSS_FEED
- `NewsResearchKind`: WEB, SOCIAL, JOURNAL, TREND
- `NewsSourceEntryStatus`: NEW, PROCESSED, IGNORED, ERROR
- `NewsJobType`: RSS_SYNC, RESEARCH_SYNC, AI_DRAFT, AI_REGENERATE, AUTO_RUN, AUTO_SCHEDULE, AUTO_PUBLISH, DEDUP_CLEANUP
- `NewsJobStatus`: SUCCESS, FAILURE

### Core tables/models
- `NewsSource` (`news_sources`)
  - RSS feed source registry + operational fields (etag/lastModified/interval/errorCount).
- `NewsSourceEntry` (`news_source_entries`)
  - Individual RSS items ingested from sources; unique `(sourceId,url)`; links optionally to `NewsItem`.
- `NewsResearchEntry` (`news_research_entries`)
  - Research citations/items; unique `(kind,url)`; links optionally to `NewsItem`.
- `NewsItem` (`news_items`)
  - Primary content entity (title/summary/contentHtml/tags/category/status/SEO fields/slugs) with soft-delete (`deletedAt`).
- `NewsAiRequestLog` (`news_ai_request_logs`)
  - AI request/response logging (provider/model/input/output/success/error) with optional actor and item linkage.
- `NewsJobLog` (`news_job_logs`)
  - Run logging for automation pipeline.
- `NewsAutomationRule` (`news_automation_rules`)
  - CRUD-managed rule configs (JSON).
- `NewsAuditLog` (`news_audit_logs`)
  - Operational/audit events across items/sources/pipeline.

---

## 6) E2E Flow Trace (Key User Actions)

### A) Public consumption: view news list → view article
1) User opens `/news` ([src/app/news/page.tsx](../../../src/app/news/page.tsx))
1) User opens `/news` ([src/app/news/page.tsx](src/app/news/page.tsx))
2) UI calls `fetchPublicNewsList()` ([src/lib/news-engine/client.ts](../../../src/lib/news-engine/client.ts))
2) UI calls `fetchPublicNewsList()` ([src/lib/news-engine/client.ts](src/lib/news-engine/client.ts))
3) Client hits `GET /api/news` → returns `PUBLISHED` items
4) User opens `/news/[slug]` ([src/app/news/[slug]/page.tsx](../../../src/app/news/%5Bslug%5D/page.tsx))
4) User opens `/news/[slug]` ([src/app/news/[slug]/page.tsx](src/app/news/[slug]/page.tsx))
5) UI calls `fetchPublicNewsBySlug(slug)` → `GET /api/news/[slug]`

### B) Admin: create an item manually (non-AI)
1) Admin opens `/admin/news-engine`
2) UI uses `adminCreateItem()` → `POST /api/admin/news-engine/items`
3) API writes `NewsItem` row + audit log `news_item_created`

### C) Admin: generate manual AI draft
1) Admin opens Manual Draft modal
2) UI calls `adminGenerateManualDraft()` → `POST /api/admin/news-engine/items/generate-manual`
3) API:
   - Writes `NewsAiRequestLog(action=manual_draft)`
   - Calls AI (`callOpenAiJson`)
   - Creates `NewsItem(status=DRAFT_READY, sourceType=MANUAL_ENTRY)`
   - Writes audit log `news_ai_draft_generated`

### D) Admin: ingest RSS source entries
1) Admin triggers sync on a source
2) UI calls `adminToggleSourceEnabled()` / `adminUpsertSource()` to manage source, then sync
3) `POST /api/admin/news-engine/sources/:id/sync` fetches RSS and creates `NewsSourceEntry(status=NEW)` rows

### E) Admin: turn one RSS entry into a draft item
1) Admin selects an entry from source entries
2) `POST /api/admin/news-engine/entries/:entryId/generate-draft`
3) API:
   - Creates `NewsAiRequestLog(action=generate_draft_from_rss_entry)`
   - Calls AI and creates `NewsItem(status=DRAFT_READY, sourceType=RSS_FEED, sourceId=<source>)`
   - Marks `NewsSourceEntry.status=PROCESSED` and links it to the new item

### F) Admin: generate draft from research entries
1) Admin syncs research results: `POST /api/admin/news-engine/research/sync`
2) Admin triggers: `POST /api/admin/news-engine/research/generate-draft`
3) API:
   - Queries `NewsResearchEntry(status=NEW)`
   - Creates draft `NewsItem(status=DRAFT_READY, sourceType=AI_AGENT)`
   - Marks research entries `PROCESSED` and links them

### G) Admin: schedule → publish
- Schedule:
  - UI calls `adminSchedule()` → `POST /api/admin/news-engine/items/:id/schedule`
  - Item becomes `SCHEDULED` with `scheduledFor`.
- Auto-publish (opportunistic):
  - Certain GET endpoints call `publishDueScheduledNewsItems()` which flips due items to `PUBLISHED`.
- Publish now:
  - UI calls `adminPublishNow()` → `POST /api/admin/news-engine/items/:id/publish-now`

### H) Admin: pipeline automation (cron)
1) Admin clicks Run Now OR external cron calls internal runner
2) Admin endpoint: `POST /api/admin/news-engine/automation/run-now` calls
3) Internal endpoint: `POST /api/internal/news-engine/automation/run` (requires secret)
4) Internal runner:
   - Checks pipeline status (pause/emergency stop)
   - Performs automation steps based on settings toggles and config JSON
   - Writes job logs + audit logs

---

## 7) Observed Gaps / TODOs / Risks (Implementation-only)

- **Scheduled publishing is opportunistic**: `publishDueScheduledNewsItems()` runs on select GET endpoints; if there is no traffic to those endpoints (or internal runner doesn’t run), scheduled items may not publish on time.
- **Cron wiring is external**: the repo implements an internal runner + admin trigger, but scheduling/hosting of periodic calls is outside the codebase.
- **Public pages are client-rendered**: `/news` and `/news/[slug]` fetch on the client, so SEO and first-contentful paint depend on client-side fetch behavior.
- **AI outputs are stored as HTML**: `contentHtml` is persisted and served; safety and sanitization assumptions should be validated separately (not audited here).
- **Config JSON schemas are loose**: automation config + sources config accept arbitrary JSON then normalize; formal schema validation is not enforced beyond normalization.

---

## Appendix: Quick endpoint index (by area)

- Public: `/api/news`, `/api/news/[slug]`
- Admin base: `/api/admin/news-engine/*`
- Internal base: `/api/internal/news-engine/*`
