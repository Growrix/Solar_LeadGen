# Backend Plan — NEWS ENGINE — AI + Automation (E2E Audit First, SOT-Aware)

**Feature:** NEWS ENGINE (AI + Automation extension)
**Date:** 2026-01-05
**Status:** Planning (Inputs Confirmed)

This document is **plan-only**. Do not implement until the human owner confirms.

Confirmed scope inputs (owner decisions):
- AI provider is **OpenAI** using the existing `.env` values (`OPENAI_API_KEY`, `OPENAI_MODEL`). Any “Gemini” strings in the UI are legacy/prototype.
- **Auto-publish is desired** when the system is in **Automatic/Live** operational state (implemented today as `pipelineStatus === NOMINAL`) and auto-publish is enabled.
- The existing UI UX must be made **fully functional E2E**, including **RSS**, **Web research**, and **Trend/Social/Journal research** controls present in the UI.
- Add a dedicated **Rejected** column/queue UX (see Part 2) with regenerate + restore capabilities, and permanent delete only from the rejected queue.

Authorities loaded (per `DOC/GUIDELINES & SOT/README.md`):
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/E2E-CURRENT-STATE-AUDIT-RULES.md`

Primary feature references:
- `DOC/FEATURES/NEWS ENGINE/Plan/CHatGPT.md` (original goal includes RSS + AI + automation)
- `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`

---

# PART 1 — E2E CURRENT-STATE AUDIT (Reality First)

## A) UI entry points and routes (Admin + Public)

### Admin route (exists)
- `/admin/news-engine`
  - File: `src/app/admin/news-engine/page.tsx`
  - Notes: Tabbed hub UI includes **Automation Logic** and **Sources** and **Settings** tabs (but UI ≠ automation execution).

### Public routes (exist)
- `/news` — listing
  - File: `src/app/news/page.tsx`
- `/news/[slug]` — details
  - File: `src/app/news/[slug]/page.tsx`

## B) Current API inventory (what exists today)

### Public (no auth)
- `GET /api/news`
  - File: `src/app/api/news/route.ts`
  - Behavior: returns `PUBLISHED` items (cursor pagination); best-effort calls `publishDueScheduledNewsItems()`.
- `GET /api/news/[slug]`
  - File: `src/app/api/news/[slug]/route.ts`
  - Behavior: returns published item by slug; best-effort calls `publishDueScheduledNewsItems()`.

### Admin (requires admin auth)
**Items**
- `GET /api/admin/news-engine/items` (filters + cursor pagination)
  - File: `src/app/api/admin/news-engine/items/route.ts`
  - Behavior: also best-effort calls `publishDueScheduledNewsItems()`.
- `POST /api/admin/news-engine/items` (create manual draft)
  - File: `src/app/api/admin/news-engine/items/route.ts`

- `GET|PUT|DELETE /api/admin/news-engine/items/[id]`
  - File: `src/app/api/admin/news-engine/items/[id]/route.ts`
- `POST /api/admin/news-engine/items/[id]/publish-now`
  - File: `src/app/api/admin/news-engine/items/[id]/publish-now/route.ts`
- `POST /api/admin/news-engine/items/[id]/schedule`
  - File: `src/app/api/admin/news-engine/items/[id]/schedule/route.ts`
- `POST /api/admin/news-engine/items/[id]/reject`
  - File: `src/app/api/admin/news-engine/items/[id]/reject/route.ts`
- `POST /api/admin/news-engine/items/[id]/rewrite-request`
  - File: `src/app/api/admin/news-engine/items/[id]/rewrite-request/route.ts`

**Sources**
- `GET|POST /api/admin/news-engine/sources`
  - File: `src/app/api/admin/news-engine/sources/route.ts`
- `PUT|DELETE /api/admin/news-engine/sources/[id]`
  - File: `src/app/api/admin/news-engine/sources/[id]/route.ts`

**Automation config + rules (storage only today)**
- `GET|PUT /api/admin/news-engine/automation/config`
  - File: `src/app/api/admin/news-engine/automation/config/route.ts`
  - Behavior: stores booleans + JSON blob into Settings table keys (no runner executes it).
- `GET|POST /api/admin/news-engine/automation/rules`
  - File: `src/app/api/admin/news-engine/automation/rules/route.ts`
- `PUT|DELETE /api/admin/news-engine/automation/rules/[id]`
  - File: `src/app/api/admin/news-engine/automation/rules/[id]/route.ts`

**Pipeline controls (storage only today)**
- `GET /api/admin/news-engine/pipeline/status`
  - File: `src/app/api/admin/news-engine/pipeline/status/route.ts`
- `POST /api/admin/news-engine/pipeline/pause`
  - File: `src/app/api/admin/news-engine/pipeline/pause/route.ts`
- `POST /api/admin/news-engine/pipeline/resume`
  - File: `src/app/api/admin/news-engine/pipeline/resume/route.ts`
- `POST /api/admin/news-engine/pipeline/emergency-stop`
  - File: `src/app/api/admin/news-engine/pipeline/emergency-stop/route.ts`

**Audit logs**
- `GET /api/admin/news-engine/audit-logs`
  - File: `src/app/api/admin/news-engine/audit-logs/route.ts`

**Settings**
- `GET|PUT /api/admin/news-engine/settings`
  - File: `src/app/api/admin/news-engine/settings/route.ts`
  - Behavior: persists `regionLocale`, `dailyLimit`, `deduplicationEnabled`, plus `ai.provider` + `ai.model` (but no AI calls).

### AI calls already exist elsewhere (blog)
- `POST /api/admin/blog/ai/generate`
  - File: `src/app/api/admin/blog/ai/generate/route.ts`
  - Uses env: `OPENAI_API_KEY`, `OPENAI_MODEL`.

**Finding:** News Engine currently has **no RSS ingestion implementation**, **no AI generation endpoints**, and **no automation runner** (cron/job queue). It has only configuration storage + manual admin item lifecycle.

## C) Prisma / DB inventory (what exists today)

News Engine schema exists:
- Enums: `NewsItemStatus`, `NewsItemSourceType`
- Models: `NewsSource`, `NewsItem`, `NewsAutomationRule`, `NewsAuditLog`
  - File: `prisma/schema.prisma`

**Missing for AI/Automation E2E:**
- No table for **feed entries / ingested items** (GUID/link/title/publishedAt).
- No table for **AI request logs** for News Engine (prompt, model, output, cost/tokens).
- No table for **job runs** / scheduler execution history.
- No persisted **dedup keys** for sources/entries (beyond what you could infer from `NewsItem.slug/title`).

## D) State machine / lifecycle (as implemented)

Implemented statuses in DB (`NewsItemStatus`):
- `DRAFT`, `NEEDS_REVIEW`, `RESEARCH_DONE`, `DRAFT_READY`, `PUBLISHED`, `SCHEDULED`, `REJECTED`, `ERROR`

Pipeline status is persisted in Settings:
- `news.ops.pipeline_status` via `src/lib/news-engine/settings.ts`.

## E) Broken/missing wiring (AI/automation-specific)

| Capability | Current status | Impact |
|---|---:|---|
| RSS feed fetch + parse | ❌ missing | Sources cannot produce new items automatically |
| Deduplication across feeds | ❌ missing | Risk of repeated drafts/items |
| AI draft generation | ❌ missing | “AI News Engine” is currently manual drafting |
| Automation runner | ❌ missing | Automation toggles do not do anything beyond saving settings |
| Cron/scheduler | ❌ missing | No background execution for ingest/draft/schedule/publish |
| Prompt details (real) | ⚠️ partial | UI exists; audit logs can store `promptUsed`, but no generation pipeline populates it |

## F) SOT vs current implementation delta (AI/automation scope)

| SOT expectation (from `DOC/FEATURES/NEWS ENGINE/Plan/CHatGPT.md`) | Current reality | Decision | Backend impact |
|---|---|---|---|
| RSS ingestion from configured sources | Sources CRUD exists only | **FIX** | Add ingestion runner + feed-entry storage |
| AI researches & drafts stories | No AI endpoints | **FIX** | Add AI generation endpoints + logs + safety gating |
| Automation rules affect what gets drafted/scheduled | Rules stored only | **FIX** | Define rule schema + runner applies it |
| Daily limits + dedup constraints enforced | Stored in Settings only | **FIX** | Enforce in runner + audit logs |
| Human approval default | Manual publish exists | **UPDATE** | Auto-publish must be supported when operational state is Automatic/Live and auto-publish is enabled |

---

# PART 2 — AI + AUTOMATION BACKEND PLAN (Implementation-Ready)

## 4.1 Executive summary

### What will be built
- **RSS ingestion pipeline (safe, idempotent):** fetch feed → persist entries → map to candidate news items.
- **AI draft generation (admin-controlled):** generate drafts for a specific entry/item; write audit logs + request logs.
- **Automation runner:** optional background job that:
  - ingests feeds,
  - applies rules + limits,
  - creates draft items,
  - optionally schedules items inside publish windows,
  - optionally publishes only if explicitly enabled.
- **Operational observability:** job run logs + per-step audit entries.

### What will NOT be built (explicit exclusions)
- Social-network auto-posting (Facebook/Twitter/etc.) — **excluded** (UI does not require it; share is manual).
- Any provider-specific paid integrations not backed by env vars/keys — **excluded unless configured** (see Dependencies).

### Minimal safe path to ship (no partials)
1) Persist RSS feed entries + runner/job logs (no AI yet)
2) Add research ingestion persistence (web/social/journals/trends) and wire UI controls to backend settings
3) Add OpenAI draft generation endpoint(s) (per entry/research bundle → creates `NewsItem`)
4) Add automation runner behind pipeline status + automation toggles, including auto-publish when enabled
5) Add cron/invocation mechanism (Vercel Cron or external scheduler) + secret-protected endpoint

---

## 4.1a Rejected queue requirements (new)

The UI must expose rejected items instead of “losing” them.

Required UX outcomes:
- A **Rejected** column/queue exists in the admin “Drafts & Reviews” board.
- Rejecting an item moves it to **REJECTED** (no soft delete).
- **Delete** from the Rejected column performs **permanent delete** (hard delete) instead of soft delete.
- Rejected items can be:
  - **Regenerated** (AI rewrite/new draft from the rejected item) and returned to `DRAFT_READY` or `NEEDS_REVIEW`.
  - **Restored** to `DRAFT` without regeneration.
  - **Rescheduled** / **Published** again after edits.

---

## 4.2 Data model plan (Prisma)

### A) Extend existing models (incremental)

**`NewsSource` additions (support RSS fetch state):**
- `kind` enum (default `RSS_FEED`) OR infer from existence (recommended: explicit)
- `etag` string?
- `lastModified` string?
- `lastFetchedAt` DateTime?
- `lastError` string?
- `errorCount` int default 0
- `fetchIntervalMinutes` int default 60 (optional)

### B) New enums

```prisma
enum NewsSourceKind {
  RSS_FEED
}

enum NewsResearchKind {
  WEB
  SOCIAL
  JOURNAL
  TREND
}

enum NewsSourceEntryStatus {
  NEW
  PROCESSED
  IGNORED
  ERROR
}

enum NewsJobType {
  RSS_SYNC
  RESEARCH_SYNC
  AI_DRAFT
  AI_REGENERATE
  AUTO_RUN
  AUTO_SCHEDULE
  AUTO_PUBLISH
  DEDUP_CLEANUP
}

enum NewsJobStatus {
  SUCCESS
  FAILURE
}
```

### C) New models

**1) `NewsSourceEntry` (feed items, dedup anchor)**

```prisma
model NewsSourceEntry {
  id            String              @id @default(cuid())
  sourceId      String
  source        NewsSource          @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  externalId    String?             // guid/id from RSS (if present)
  url           String              // link/permalink
  title         String
  publishedAt   DateTime?
  fetchedAt     DateTime            @default(now())

  status        NewsSourceEntryStatus @default(NEW)
  error         String?

  // Optional raw content for traceability
  rawJson       Json?

  // Linking to created NewsItem (if any)
  itemId        String?
  item          NewsItem?           @relation(fields: [itemId], references: [id], onDelete: SetNull)

  @@unique([sourceId, url])
  @@index([status])
  @@index([publishedAt])
  @@index([fetchedAt])
  @@map("news_source_entries")
}
```

**1b) `NewsResearchEntry` (web/trend/social/journal results, dedup anchor)**

```prisma
model NewsResearchEntry {
  id            String           @id @default(cuid())
  kind          NewsResearchKind
  query         String?

  url           String
  title         String
  publishedAt   DateTime?
  fetchedAt     DateTime         @default(now())

  status        NewsSourceEntryStatus @default(NEW)
  error         String?

  rawJson       Json?

  itemId        String?
  item          NewsItem?        @relation(fields: [itemId], references: [id], onDelete: SetNull)

  @@unique([kind, url])
  @@index([kind])
  @@index([status])
  @@index([publishedAt])
  @@index([fetchedAt])
  @@map("news_research_entries")
}
```

**2) `NewsAiRequestLog` (AI usage auditability)**

```prisma
model NewsAiRequestLog {
  id        String   @id @default(cuid())
  actorId   String?
  actor     User?    @relation(fields: [actorId], references: [id], onDelete: SetNull)
  action    String

  itemId    String?
  item      NewsItem? @relation(fields: [itemId], references: [id], onDelete: SetNull)

  provider  String
  model     String
  input     Json
  output    Json?
  success   Boolean  @default(false)
  error     String?

  createdAt DateTime @default(now())

  @@index([createdAt])
  @@index([actorId])
  @@index([itemId])
  @@map("news_ai_request_logs")
}
```

**3) `NewsJobLog` (scheduler/job observability)**

```prisma
model NewsJobLog {
  id         String       @id @default(cuid())
  type       NewsJobType
  status     NewsJobStatus
  startedAt  DateTime     @default(now())
  finishedAt DateTime?
  meta       Json?
  error      String?

  @@index([startedAt])
  @@index([type])
  @@index([status])
  @@map("news_job_logs")
}
```

---

## 4.3 API contract plan (App Router route handlers)

### Principles
- **Admin-only** for everything that can change state or call AI.
- **Secret-protected internal route** for cron/scheduler invocation.
- **Idempotent operations**: re-running jobs should not duplicate entries/items.

### A) New admin endpoints (manual controls)

1) **Sync a source now (RSS fetch) — admin action**
- `POST /api/admin/news-engine/sources/[id]/sync`
- Auth: `requireAdmin()`
- Body: optional `{ maxItems?: number }`
- Response: `{ sourceId, fetchedCount, newEntriesCount, updatedAt }`
- Side effects:
  - fetch RSS/Atom XML
  - parse entries
  - upsert into `NewsSourceEntry` with unique `(sourceId,url)`
  - update `NewsSource.lastSync`, `articleCount` (based on entry counts)
  - write `NewsAuditLog` action `news_source_synced`

2) **View source entries (for debug/ops)**
- `GET /api/admin/news-engine/sources/[id]/entries?status=&cursor=&limit=`
- Auth: `requireAdmin()`
- Response: `{ entries, nextCursor }`

3) **Generate AI draft from a source entry**
- `POST /api/admin/news-engine/entries/[entryId]/generate-draft`
- Auth: `requireAdmin()`
- Body: `{ tone?, regionLocale?, model?, provider? }` (optional overrides)
- Response: `{ item }` (created NewsItem)
- Side effects:
  - calls OpenAI (using `OPENAI_API_KEY` and `OPENAI_MODEL`)
  - creates `NewsItem` with `sourceType=RSS_FEED`, `sourceId`, `status=NEEDS_REVIEW` (default)
  3b) **Generate AI draft from research entries (web/trend/social/journal)**
  - `POST /api/admin/news-engine/research/generate-draft`
  - Auth: `requireAdmin()`
  - Body: `{ kind: 'WEB'|'SOCIAL'|'JOURNAL'|'TREND', query?: string, maxResults?: number, tone?, regionLocale?, model? }`
  - Response: `{ item, sourcesUsed: Array<{ url, title }> }`
  - Side effects:
    - runs research fetch (provider-backed) and persists `NewsResearchEntry`
    - calls OpenAI to draft a `NewsItem` (default `NEEDS_REVIEW` unless auto-publish conditions apply)
    - writes `NewsAiRequestLog` + `NewsAuditLog` with prompt details

  3c) **Regenerate from rejected item**
  - `POST /api/admin/news-engine/items/[id]/regenerate`
  - Auth: `requireAdmin()`
  - Preconditions: item exists and `status=REJECTED`
  - Body: `{ note?: string, model?: string }`
  - Response: `{ item }` (same item updated, or a new replacement item — choose one and keep consistent; recommended: update-in-place)
  - Side effects:
    - calls OpenAI
    - updates content fields, clears `rejectedAt`/`rejectionReason`, sets status to `DRAFT_READY` (or `NEEDS_REVIEW`)
    - writes `NewsAiRequestLog` + `NewsAuditLog`

  3d) **Permanent delete (only from Rejected queue)**
  - `DELETE /api/admin/news-engine/items/[id]/purge`
  - Auth: `requireAdmin()`
  - Preconditions: item exists and `status=REJECTED`
  - Behavior: hard delete row (and any dependent relations that should be removed); write audit log `news_item_purged`
  - sets `title/summary/contentHtml/seoTitle/seoDescription/tags/category` from AI output
  - links `NewsSourceEntry.itemId`
  - writes `NewsAiRequestLog` + `NewsAuditLog` with `promptUsed` populated

### B) New internal endpoint (cron/scheduler runner)

4) **Automation runner entrypoint (cron)**
- `POST /api/internal/news-engine/automation/run`
- Auth: header secret (no session): `x-news-engine-cron-secret: <value>`
- Response: `{ runId, results }`
- Behavior:
  - checks pipeline status; if `PAUSED` or `EMERGENCY_STOP`, it exits (no side effects)
  - executes the runner steps (see 4.7) within `dailyLimit` and automation toggles
  - writes `NewsJobLog` for each run

**Note:** Vercel Cron is a likely target, but exact hosting is UNKNOWN from audit.

### C) Existing endpoints to extend (only if needed)

- `POST /api/admin/news-engine/items` should optionally accept `sourceId` and `sourceType` for system-created items.
- `GET /api/admin/news-engine/items` may add filters: `sourceType`, `sourceId`, `status=SCHEDULED|PUBLISHED|REJECTED` (currently status filter is limited to draft-ish statuses).

---

## 4.4 Public pages E2E wiring

No new public routes required for AI/automation.

- `/news` continues to read from `GET /api/news` (published only).
- `/news/[slug]` continues to read from `GET /api/news/[slug]`.

**Caching**: current endpoints are `force-dynamic` and should remain dynamic while automation is changing data frequently.

---

## 4.5 Admin flows E2E wiring (mapping UI → backend)

### Sources tab
- “Add Source / Edit Source” already maps to sources CRUD endpoints.
- Add a backend-mapped “Sync now” action:
  - UI action (new button) → `POST /sources/[id]/sync`.
  - Show results (fetched count + last sync) by refetching sources.

### Automation logic tab
- Toggles already persist via `PUT /automation/config`.
- Rules persist via `/automation/rules` CRUD.
- **Missing today:** any endpoint that actually runs automation.
  - Plan adds: `/api/internal/news-engine/automation/run` + optional admin “Run now” button that hits an admin runner endpoint.

### Audit logs tab
- Continue using `GET /audit-logs`.
- Add new audit actions for RSS sync and AI generation so Prompt Details is meaningful.

---

## 4.6 Audit logging (required additions)

Add these actions to `src/lib/news-engine/audit.ts` (plan-only; do not implement now):
- `news_source_sync_started`
- `news_source_sync_completed`
- `news_source_sync_failed`
- `news_entry_ingested`
- `news_ai_draft_generated`
- `news_ai_draft_failed`
- `news_automation_run_started`
- `news_automation_run_completed`

Also write `NewsJobLog` entries so ops can trace automation issues without reading server logs.

---

## 4.7 Scheduling / automation execution model

### Runner steps (single invocation)

1) **Gate checks**
- Read `news.ops.pipeline_status`.
- If `PAUSED` or `EMERGENCY_STOP`: stop.

2) **RSS ingestion**
- For each enabled `NewsSource`:
  - fetch feed (respect caching headers: `etag`, `lastModified`)
  - upsert `NewsSourceEntry` by `(sourceId,url)`
  - mark failures without crashing the run (per-source isolation)

3) **Dedup + selection**
- When `deduplicationEnabled` is true:
  - ignore entries whose `url` already has an attached `NewsItem` or already processed.
- Apply `dailyLimit` from settings.

4) **Draft creation**
- If `autoDraft` enabled:
  - for each selected entry: call AI draft endpoint logic internally (not via HTTP)
  - created items default to `NEEDS_REVIEW`.

5) **Optional schedule/publish**
- If `autoSchedule` enabled:
  - schedule in nearest allowed window (window config comes from automation config JSON)
- If `autoPublish` enabled:
  - publish only when:
    - `pipelineStatus === NOMINAL` (Automatic/Live)
    - and `autoPublish === true`
    - and the content passes all configured constraints (daily limit, min sources per story, blacklist, etc.)

### Idempotency guarantees
- A single feed entry can only map to one NewsItem (`NewsSourceEntry.itemId`).
- Re-running should never create duplicates for the same `(sourceId,url)`.

---

## 4.8 Security & permissions

- All admin routes must use `requireAdmin()`.
- Cron/internal runner must be protected by a secret header.
- AI provider API keys must be **env-only** (do not store in Settings/DB).

Env vars (confirmed):
- Reuse: `OPENAI_API_KEY` / `OPENAI_MODEL` (already used by Blog AI)

---

## 4.9 Testing plan (minimum)

### Manual E2E checks (admin)
1) Create 1–2 sources via Sources tab → verify in DB.
2) Call `POST /sources/[id]/sync` → verify entries created.
3) Call `POST /entries/[entryId]/generate-draft` → verify NewsItem created and linked.
4) Review item → publish now or schedule.
5) If cron runner enabled: call `/api/internal/news-engine/automation/run` with secret → verify run logs + new drafts.

### Public E2E checks
- Published item appears on `/news` and `/news/[slug]`.

### Observability checks
- Audit logs include entries for sync + AI generation.
- Job logs show run start/end and failures.

---

## 4.10 Risks, dependencies, open questions

### Dependencies
- RSS parsing library choice (none currently used in repo) — choose a minimal, well-maintained parser.
- Hosting/scheduler choice (Vercel Cron vs server cron vs external worker) — UNKNOWN.

### Risks
- RSS feeds are inconsistent; parsing must be robust and failure-isolated per source.
- AI costs + latency; must rate-limit and log.
- “Hallucination monitoring” exists in UI only; implementing real verification is non-trivial.

### Open questions (remaining)
1) Which provider(s) should power “Web Search” and “Social/Trend” ingestion?
  - If you already have API keys, confirm which service (Brave Search / Serper / Bing, etc.).
  - If not, we can implement RSS + academic (public) first, but “Web/Trend” cannot be truly functional without a data source.
2) Should “Regenerate” update the existing rejected item in place, or create a new item version and keep the rejected one as immutable history?

---

# STOP

This is plan-only. Confirm and I will start the implementation phase.
