# Backend Plan — News Engine (E2E Audit First, SOT-Aware)

**Feature:** News Engine  
**Date:** 2026-01-04  
**Status:** Planning (Pending Confirmation)

---

# 2026-01-13 Expansion Audit & Planning Addendum (Post-Feature Grounding)

This plan contains older, preserved content from the period when News Engine was UI-stubbed. As of the current implementation, News Engine is DB/API-backed and includes an internal automation runner, research ingestion, AI drafting/rewriting/regeneration, OG image generation + approval gating, Key Vault, and model routing.

**Primary current-state audit inputs**
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-FEATURE-AUDIT-2026-01-13.md`
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-POST-FEATURE-DOCS-2026-01-13.md`

**Expansion blueprint**
- `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md`

## What Is Already Implemented (Do Not Rebuild)
- DB-backed public news endpoints and admin APIs for core item lifecycle.
- Internal automation runner endpoint guarded by `NEWS_ENGINE_CRON_SECRET`.
- RSS + research sync (multiple kinds) with persisted entries.
- AI generation flows (manual, from RSS, from research bundle) + rewrite + rejected regeneration.
- OG image generation + publish gating.
- Model router defaults + Model Profiles + Key Vault primitives (as implemented in current codebase).

## Expansion Priorities (Aligned to Expanding plan V2)

### 1) Image sourcing & reliability (high)
Goal: ensure every published item has a resilient OG image strategy.
- Add image source provenance and broken-link detection/remediation workflow.
- Prefer: (a) sourced image URLs with validation, (b) fallback to AI-generated, (c) final fallback to news URL/share card.
- Add scheduled/runner-time revalidation of `ogImageUrl` and auto-repair when broken.

### 2) Unified Research Center (high)
Goal: centralize research ingestion, dedup, and distribution across pipelines.
- Canonicalize research job model (manual + keyword-list scheduled jobs).
- Introduce unified listing/search over RSS entries + research entries with common metadata.
- Provide exportable provenance bundles for drafting and auditability.

### 3) Advanced AI content generation (high)
Goal: enforce admin-defined rules and quality controls.
- Implement deterministic rule enforcement at drafting time (and optionally publish time): block/downgrade to review/require citations.
- Add fact/originality scoring hooks (initially stubbed as structured fields + audit entries).

### 4) Automation & scheduling (high)
Goal: align runner scheduling with UI semantics and support expanded schedule features.
- Treat a single canonical schedule schema as the runner input and ensure UI persists exactly that schema.
- Expand schedule semantics (priority/expiry/featured/recurring/batch) in a runner-safe, backward-compatible way.
- Plan for n8n integration as an optional orchestration layer (runner remains the canonical core executor).

### 5) Analytics & auditability (medium)
Goal: operational visibility without guessing.
- Expand automation run summaries and job logs to include counts, timings, and last error surfaces.
- Add aggregation endpoints for dashboards (pipeline KPIs, research coverage, content throughput).

### 6) Operational hardening (high)
Goal: reliable deploy/run behavior.
- Harden validation for automation config JSON and return explicit warnings/errors.
- Add health checks and alerting surfaces for runner failures and ingestion failures.
- Ensure Key Vault master key and cron secret requirements are validated in a deployment-safe way.

## Backend surfaces implied by the expanded frontend (Phase 13 prompt pack)

The Phase 13 frontend expansion (Steps 1–8) intentionally added UI placeholders for observability and unified research listing. Phase 3 backend work should provide real admin endpoints for these surfaces:

- **Queue Snapshot (Master Control)**: counts for RSS new entries, research new entries by kind, drafts needing review, scheduled due soon, and error totals.
- **System Health surfaces (Master Control)**: last successful automation run, last error, and last updated timestamps for runner + ingestion.
- **Unified Research Center**: unified listing/search over RSS entries + research entries with filters (sourceType, kind, status, date range).
- **Dashboard KPIs**: aggregated KPIs so the dashboard can stop being explicitly labeled placeholder.

---

# 2026-01-12 Expansion Audit & Planning Addendum (Current-State Grounding)

This backend plan was originally drafted when the News Engine was still largely “UI-only”. As of the latest implementation audit, the News Engine now includes real DB-backed APIs, internal automation runner logic, research ingestion, and OG image generation.

**Primary audit input**
- `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-phase1-comprehensive-feature-implementation-audit-2026-01-12.md`

**Expansion blueprint**
- `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md`

## What Is Already Implemented (Do Not Rebuild)
- Public read endpoints publish due scheduled items opportunistically then return published content.
- Admin item lifecycle endpoints exist (list, schedule, publish-now, etc.).
- Automation config endpoint persists `news.automation.*` flags and `news.automation.config_json`.
- Internal automation runner exists (`/api/internal/news-engine/automation/run`) and schedules from `config.windows?: string[]`.
- Research sync endpoints exist and persist `NewsResearchEntry`.

## Gaps / Expansion Priorities (from Audit)

### 1) Canonical scheduling schema mismatch (critical)
- UI exposes “Publish Windows v2” semantics.
- Runner currently schedules only from `config.windows?: string[]`.

**Required decision:** pick one canonical schema and align:
- UI save format
- stored `news.automation.config_json`
- runner schedule selection

### 2) Automation rules are CRUD’d but not enforced (critical)
- DB model + endpoints exist for `NewsAutomationRule`.
- Runner does not evaluate those rules.

**Required decision:**
- Either implement runner enforcement of `NewsAutomationRule`, OR
- disable/gate rule CRUD surfaces until enforcement exists.

### 3) Config validation gap (high)
- `news.automation.config_json` accepts arbitrary JSON with no schema validation.

**Action:** validate known keys/types and surface warnings to the admin UI to avoid silent misconfiguration.

### 4) Observability/run summary (medium)
- “Run Automation Now” should return deterministic counts/timing/errors and write to logs.

## Expansion Plan — Backend Workstream (Implementation-Ready)

1) **Scheduling alignment**
- Ensure the saved automation config contains runner-compatible schedule windows.
- If “Publish Windows v2” remains the UI SOT, persist/derive a runner-consumable `windows` list.

2) **Rules engine enforcement**
- Add a rules evaluation phase in the internal runner consuming enabled `NewsAutomationRule` rows.
- Define enforcement actions clearly (block, warn, downgrade to review, adjust priority, etc.).

3) **Config schema validation**
- Validate and normalize `news.automation.config_json` on write.
- Return warnings (non-fatal) for unknown/unsupported keys.

4) **Operational hardening**
- Improve error clarity for RSS/research failures and automation runner failures.
- Add system health surfaces (last successful run, last error) exposed to admin.

---

The remaining content below is preserved for historical reference; the addendum above should be treated as the authoritative “current-state” expansion delta.

---

# PART 1 — E2E CURRENT-STATE AUDIT

---

## A) UI Entry Points and Routes (Admin + Public)

### Admin Routes (Exist)

| Route | Status | Component | Notes |
|-------|--------|-----------|-------|
| `/admin/news-engine` | ✅ EXISTS | `AdminNewsEngineHub.tsx` | Fully implemented admin hub with 7 tabs |

Admin Hub Tabs (all implemented as UI-only):
- Dashboard
- Drafts & Reviews
- Audit Logs
- Master Control
- Automation Logic
- Sources
- Settings

### Public Routes (Exist)

| Route | Status | Component | Notes |
|-------|--------|-----------|-------|
| `/news` | ✅ EXISTS | `src/app/news/page.tsx` | Public news listing page |
| `/news/[slug]` | ✅ EXISTS | `src/app/news/[slug]/page.tsx` | Public news detail by slug |

---

## B) Current API Inventory

> ⚠️ Historical note: The section below is preserved from the early UI-stubbed phase and is no longer accurate.
> The authoritative current state is described in the 2026-01-13 addendum at the top of this document.

### News Engine APIs

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/news-engine/*` | 🧾 HISTORICAL | The current codebase uses `/api/news/**` and `/api/admin/news-engine/**` patterns |
| `POST /api/news-engine/*` | 🧾 HISTORICAL | The current codebase uses `/api/news/**` and `/api/admin/news-engine/**` patterns |

**Finding (historical):** this was true during early prototyping. It is no longer true in the current implementation.

---

## C) Prisma/DB Inventory

### Existing Models Related to News/Content

| Model | Status | Relevance |
|-------|--------|-----------|
| `BlogPost` | ✅ EXISTS | Separate blog feature; similar structure but NOT News Engine |
| `BlogCategory` | ✅ EXISTS | Blog-specific |
| `BlogTag` | ✅ EXISTS | Blog-specific |
| `BlogPostTag` | ✅ EXISTS | Blog-specific |
| `BlogAiRequestLog` | ✅ EXISTS | Blog-specific |
| `BlogJobLog` | ✅ EXISTS | Blog-specific |
| `AuditLog` | ✅ EXISTS | Generic audit log (tied to Lead entity) |
| `DomainEvent` | ✅ EXISTS | Generic event log |

### News Engine Specific Models

| Model | Status | Notes |
|-------|--------|-------|
| `NewsItem` | ❌ DOES NOT EXIST | Needs to be created |
| `NewsSource` | ❌ DOES NOT EXIST | Needs to be created |
| `NewsAuditLog` | ❌ DOES NOT EXIST | Needs to be created |
| `NewsEngineSettings` | ❌ DOES NOT EXIST | Could use existing `Settings` table with prefixed keys |
| `NewsAutomationRule` | ❌ DOES NOT EXIST | Needs to be created |

---

## D) State Machine / Lifecycle

### Current UI-Only Status Enum (from `src/lib/ui-stubs/news-engine.ts`)

```typescript
type NewsItemStatus =
  | 'DRAFT'
  | 'NEEDS_REVIEW'
  | 'PUBLISHED'
  | 'SCHEDULED'
  | 'ERROR'
  | 'RESEARCH_DONE'
  | 'DRAFT_READY'
  | 'REJECTED';
```

### Current Pipeline Status Enum

```typescript
type PipelineStatus = 'NOMINAL' | 'PAUSED' | 'EMERGENCY_STOP';
```

### UI Action → Status Transition Map

| UI Action | From Status | To Status | Modal/Confirm |
|-----------|-------------|-----------|---------------|
| Publish Now | Any draft state | PUBLISHED | Yes (typed confirm) |
| Schedule | Any draft state | SCHEDULED | Yes (scheduling modal) |
| Request Rewrite | NEEDS_REVIEW | DRAFT | Yes (rewrite modal) |
| Reject | Any | REJECTED | Yes (reject modal) |
| Save Edits | Any draft | DRAFT_READY | No |
| Pause Pipeline | NOMINAL | PAUSED | Yes (confirmation) |
| Resume Pipeline | PAUSED | NOMINAL | Yes (confirmation) |
| Emergency Stop | Any | EMERGENCY_STOP | Yes (typed confirm) |

---

## E) Broken or Missing Wiring

### Critical Gaps (No Backend = All Data Lost on Refresh)

| Issue | Severity | Description |
|-------|----------|-------------|
| No persistence | 🔴 CRITICAL | All data in localStorage; clears on new device/browser |
| No API endpoints | 🔴 CRITICAL | Cannot fetch/save data to server |
| No Prisma models | 🔴 CRITICAL | No database schema for news items |
| Public pages read localStorage | 🟡 HIGH | Public `/news` page won't work for other users |
| No auth on admin | 🟡 HIGH | Admin actions not protected (UI-only) |
| Audit logs not persisted | 🟡 HIGH | Audit trail lost on refresh |

### UI Dead Ends (Documented in UX Fine-Tuning Plan)

| Issue | Status | Notes |
|-------|--------|-------|
| Dashboard row kebab | UI-only, no action | Low priority |
| Pagination | UI-only, broken | Low priority |
| Date Range filter | Fixed (modal added) | Works UI-only |
| Export CSV | Fixed (helper added) | Works UI-only |
| Add Rule | Fixed (modal added) | Works UI-only |

---

## F) SOT vs Current Implementation Delta

| SOT Expectation | Current Implementation | Decision | Backend Impact |
|-----------------|------------------------|----------|----------------|
| Admin can publish items | ✅ UI exists, no backend | **FIX** | Need `POST /api/news-engine/items/:id/publish` |
| Admin can schedule items | ✅ UI exists, no backend | **FIX** | Need `POST /api/news-engine/items/:id/schedule` |
| Admin can reject items | ✅ UI exists, no backend | **FIX** | Need `POST /api/news-engine/items/:id/reject` |
| Admin can pause/resume pipeline | ✅ UI exists, no backend | **FIX** | Need `POST /api/news-engine/pipeline/:action` |
| Admin can manage sources | ✅ UI exists, no backend | **FIX** | Need CRUD `/api/news-engine/sources` |
| Admin can manage automation rules | ✅ UI exists, no backend | **FIX** | Need CRUD `/api/news-engine/automation/rules` |
| Admin can view audit logs | ✅ UI exists, no backend | **FIX** | Need `GET /api/news-engine/audit-logs` |
| Public listing shows Published only | ✅ UI filters correctly | **KEEP** | Need `GET /api/news` (public) |
| Public details by slug | ✅ UI works | **KEEP** | Need `GET /api/news/:slug` (public) |
| Data persists in DB | ❌ localStorage only | **FIX** | Need Prisma models + migrations |

---

# PART 2 — BACKEND PLAN (IMPLEMENTATION-READY)

---

## 4.1 Executive Summary

### What Will Be Built

1. **Prisma Models** — NewsItem, NewsSource, NewsAuditLog, NewsAutomationRule
2. **Public API** — Read-only endpoints for public news listing and detail
3. **Admin API** — Full CRUD for items, sources, rules, plus pipeline control
4. **Settings Integration** — Use existing `Settings` table for pipeline status and automation config

### What Will NOT Be Built (Explicit Exclusions)

- ❌ External RSS feed fetching automation (requires cron/background job)
- ❌ AI content generation integration (requires external API integration)
- ❌ Real-time notifications (can be added later)
- ❌ Media upload for news items (use existing S3 infrastructure if needed later)

### Minimal Path to Ship

1. Create Prisma models → migrate
2. Implement public read endpoints (lowest risk)
3. Implement admin CRUD endpoints
4. Replace localStorage stubs with API calls
5. Test E2E

---

## 4.2 Data Model Plan (Prisma)

### New Enums

```prisma
enum NewsItemStatus {
  DRAFT
  NEEDS_REVIEW
  PUBLISHED
  SCHEDULED
  ERROR
  RESEARCH_DONE
  DRAFT_READY
  REJECTED
}

enum PipelineStatus {
  NOMINAL
  PAUSED
  EMERGENCY_STOP
}

enum NewsAuditLogStatus {
  INFO
  WARN
  ERROR
}
```

### New Models

```prisma
model NewsItem {
  id             String          @id @default(cuid())
  title          String
  summary        String          @default("")
  contentHtml    String          @default("")
  slug           String?         @unique
  status         NewsItemStatus  @default(DRAFT)
  category       String          @default("")
  tags           String[]        @default([])
  relevanceScore Float           @default(0)
  aiModel        String?
  sourceType     String?         // 'RSS Feed' | 'AI Agent' | 'Manual Entry'
  sourceId       String?
  source         NewsSource?     @relation(fields: [sourceId], references: [id], onDelete: SetNull)

  // SEO (optional)
  seoTitle       String?
  seoDescription String?
  ogImageUrl     String?
  
  scheduledFor   DateTime?
  publishedAt    DateTime?
  rejectedAt     DateTime?
  rejectionReason String?

  deletedAt      DateTime?
  
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  createdBy      String?         // Admin user ID
  
  auditLogs      NewsAuditLog[]

  @@index([status])
  @@index([publishedAt])
  @@index([scheduledFor])
  @@index([deletedAt])
  @@index([slug])
  @@index([createdAt])
  @@map("news_items")
}

model NewsSource {
  id           String     @id @default(cuid())
  name         String
  url          String
  enabled      Boolean    @default(true)
  lastSync     DateTime?
  articleCount Int        @default(0)
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  items        NewsItem[]

  @@unique([url])
  @@index([enabled])
  @@map("news_sources")
}

model NewsAuditLog {
  id          String              @id @default(cuid())
  itemId      String?
  item        NewsItem?           @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  action      String
  origin      String              // 'admin' | 'system' | 'automation'
  status      NewsAuditLogStatus  @default(INFO)
  adminId     String?
  promptUsed  String?
  metadata    Json?
  
  createdAt   DateTime            @default(now())

  @@index([itemId])
  @@index([adminId])
  @@index([createdAt])
  @@index([action])
  @@map("news_audit_logs")
}

model NewsAutomationRule {
  id          String   @id @default(cuid())
  type        String   // 'MIN_SCORE' | 'CATEGORY_FILTER' | 'DAILY_LIMIT' | etc.
  label       String
  value       String
  description String?
  enabled     Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([type])
  @@index([enabled])
  @@map("news_automation_rules")
}
```

### Settings Keys (Use Existing Settings Table)

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `news.pipeline.status` | PipelineStatus | `NOMINAL` | Current pipeline status |
| `news.automation.autoDraft` | boolean | `false` | Auto-create drafts |
| `news.automation.autoSchedule` | boolean | `false` | Auto-schedule approved |
| `news.automation.autoPublish` | boolean | `false` | Auto-publish scheduled |
| `news.settings.regionLocale` | string | `en-AU` | Region setting |
| `news.settings.dailyLimit` | number | `10` | Daily publish limit |
| `news.settings.deduplicationEnabled` | boolean | `true` | Dedup setting |

Additional UI-visible (non-secret) settings to persist (from Settings tab):

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `news.ai.tone` | string | `Journalistic` | Writing tone |
| `news.ai.defaultModel` | string | `Gemini 3 Pro` | Default research model label |
| `news.ai.dedupSensitivity` | number | `85` | Slider % shown in UI |
| `news.ai.hallucinationCheck` | boolean | `true` | Hallucination monitoring toggle |
| `news.ai.contentPreservation` | boolean | `true` | Content preservation toggle |
| `news.ops.autoArchivePeriod` | string | `48 Hours` | Auto-archive period |
| `news.notifications.emailAlerts` | boolean | `true` | Email alerts toggle |
| `news.notifications.weeklyDigest` | boolean | `false` | Weekly digest toggle |

**Security note:** Do NOT persist AI provider API keys in the database using the generic Settings table. Keys must remain server-side in environment variables unless/ until a dedicated secrets mechanism is implemented.

### Migration Strategy

1. Create new migration file
2. Run `npx prisma migrate dev --name add_news_engine_models`
3. No data migration needed (feature is new/empty)

---

## 4.3 API Contract Plan

### Public Endpoints (No Auth Required)

#### `GET /api/news`
- **Purpose:** List published news items for public
- **Auth:** None
- **Query Params:**
  - `category?: string` — filter by category
  - `limit?: number` — default 20, max 100
  - `cursor?: string` — pagination cursor (item ID)
- **Response:**
```json
{
  "items": [
    {
      "id": "...",
      "title": "...",
      "summary": "...",
      "slug": "...",
      "category": "...",
      "tags": ["..."],
      "publishedAt": "2026-01-04T...",
      "sourceType": "RSS Feed"
    }
  ],
  "nextCursor": "..." | null
}
```
- **DB Query:** `WHERE status = 'PUBLISHED' ORDER BY publishedAt DESC`

#### `GET /api/news/[slug]`
- **Purpose:** Get single published news item by slug
- **Auth:** None
- **Response:**
```json
{
  "id": "...",
  "title": "...",
  "summary": "...",
  "contentHtml": "...",
  "slug": "...",
  "category": "...",
  "tags": ["..."],
  "publishedAt": "2026-01-04T...",
  "sourceType": "RSS Feed"
}
```
- **Error:** 404 if not found or not PUBLISHED

---

### Admin Endpoints (ADMIN Role Required)

#### `GET /api/admin/news-engine/items`
- **Purpose:** List all news items for admin
- **Auth:** ADMIN only
- **Query Params:**
  - `status?: NewsItemStatus` — filter by status
  - `category?: string`
  - `dateRange?: { from: string, to: string }`
  - `limit?: number`
  - `cursor?: string`
- **Response:** Full item objects including all fields

#### `GET /api/admin/news-engine/items/[id]`
- **Purpose:** Get single item by ID
- **Auth:** ADMIN only

#### `POST /api/admin/news-engine/items`
- **Purpose:** Create manual draft
- **Auth:** ADMIN only
- **Body:**
```json
{
  "title": "...",
  "summary": "...",
  "contentHtml": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "ogImageUrl": "...",
  "category": "...",
  "tags": ["..."],
  "status": "DRAFT"
}
```
- **Side Effects:**
  - Auto-generate slug from title
  - Create audit log entry

#### `PUT /api/admin/news-engine/items/[id]`
- **Purpose:** Update item
- **Auth:** ADMIN only
- **Body:** Partial item fields
- **Side Effects:** Create audit log entry

#### `POST /api/admin/news-engine/items/[id]/publish-now`
- **Purpose:** Publish item immediately
- **Auth:** ADMIN only
- **Body:**
```json
{
  "confirmText": "PUBLISH"
}
```
- **Validation:** confirmText must match exactly
- **Side Effects:**
  - Set status = PUBLISHED
  - Set publishedAt = now
  - Generate slug if missing
  - Create audit log entry

#### `POST /api/admin/news-engine/items/[id]/schedule`
- **Purpose:** Schedule item for future publish
- **Auth:** ADMIN only
- **Body:**
```json
{
  "scheduledFor": "2026-01-10T09:00:00Z"
}
```
- **Side Effects:**
  - Set status = SCHEDULED
  - Set scheduledFor
  - Create audit log entry

#### `POST /api/admin/news-engine/items/[id]/reject`
- **Purpose:** Reject item
- **Auth:** ADMIN only
- **Body:**
```json
{
  "reason": "..."
}
```
- **Side Effects:**
  - Set status = REJECTED
  - Set rejectedAt, rejectionReason
  - Create audit log entry

#### `DELETE /api/admin/news-engine/items/[id]`
- **Purpose:** Delete item (soft or hard TBD)
- **Auth:** ADMIN only

#### `POST /api/admin/news-engine/items/[id]/rewrite-request`
- **Purpose:** Request an AI rewrite for a draft (records instructions; does NOT run AI in Phase 1)
- **Auth:** ADMIN only
- **Body:**
```json
{
  "note": "Instructions: ...\nIntensity: ...\nFocus Areas: ..."
}
```
- **Side Effects:**
  - Keep item editable (recommend: set status to `DRAFT`)
  - Create audit log entry with `promptUsed`/metadata containing the note

---

### Pipeline Control Endpoints

#### `POST /api/admin/news-engine/pipeline/pause`
- **Purpose:** Pause pipeline
- **Auth:** ADMIN only
- **Side Effects:** Update Settings, create audit log

#### `POST /api/admin/news-engine/pipeline/resume`
- **Purpose:** Resume pipeline
- **Auth:** ADMIN only

#### `POST /api/admin/news-engine/pipeline/emergency-stop`
- **Purpose:** Emergency stop
- **Auth:** ADMIN only
- **Body:** `{ "confirmText": "EMERGENCY STOP" }`

#### `GET /api/admin/news-engine/pipeline/status`
- **Purpose:** Get current pipeline status
- **Auth:** ADMIN only

---

### Sources CRUD

#### `GET /api/admin/news-engine/sources`
#### `POST /api/admin/news-engine/sources`
#### `PUT /api/admin/news-engine/sources/[id]`
#### `DELETE /api/admin/news-engine/sources/[id]`

---

### Automation Rules CRUD

#### `GET /api/admin/news-engine/automation/rules`
#### `POST /api/admin/news-engine/automation/rules`
#### `PUT /api/admin/news-engine/automation/rules/[id]`
#### `DELETE /api/admin/news-engine/automation/rules/[id]`

#### `GET /api/admin/news-engine/automation/config`
#### `PUT /api/admin/news-engine/automation/config`

---

### News Engine Settings (Admin)

The Settings tab includes additional UI-visible controls (tone, model label, dedup sensitivity, notifications). These should persist even before AI execution is implemented.

#### `GET /api/admin/news-engine/settings`
- **Purpose:** Get News Engine settings (operational + AI personalization toggles)
- **Auth:** ADMIN only

#### `PUT /api/admin/news-engine/settings`
- **Purpose:** Save News Engine settings
- **Auth:** ADMIN only
- **Body:**
```json
{
  "regionLocale": "AU",
  "dailyLimit": 6,
  "deduplicationEnabled": true,
  "ai": {
    "tone": "Journalistic",
    "defaultModel": "Gemini 3 Pro",
    "dedupSensitivity": 85,
    "hallucinationCheck": true,
    "contentPreservation": true
  },
  "notifications": {
    "emailAlerts": true,
    "weeklyDigest": false
  },
  "ops": {
    "autoArchivePeriod": "48 Hours"
  }
}
```

---

### Audit Logs

#### `GET /api/admin/news-engine/audit-logs`
- **Query Params:** `dateFrom`, `dateTo`, `action`, `itemId`, `limit`, `cursor`

---

## 4.4 Public Pages E2E Wiring

| Page | Endpoint | Caching |
|------|----------|---------|
| `/news` (listing) | `GET /api/news` | ISR 60s or on-demand revalidation |
| `/news/[slug]` (detail) | `GET /api/news/:slug` | ISR 60s |

### Slug Rules
- Auto-generated from title using `slugify()` helper
- Must be unique
- Public detail returns 404 for missing/non-published slugs

---

## 4.5 Admin Flows E2E Wiring

| Admin Action | Endpoint | Audit Log |
|--------------|----------|-----------|
| View dashboard | `GET /api/admin/news-engine/items` | No |
| Create manual draft | `POST /api/admin/news-engine/items` | Yes |
| Edit item | `PUT /api/admin/news-engine/items/:id` | Yes |
| Publish now | `POST /api/admin/news-engine/items/:id/publish-now` | Yes |
| Schedule | `POST /api/admin/news-engine/items/:id/schedule` | Yes |
| Reject | `POST /api/admin/news-engine/items/:id/reject` | Yes |
| Request rewrite | `POST /api/admin/news-engine/items/:id/rewrite-request` | Yes |
| Pause pipeline | `POST /api/admin/news-engine/pipeline/pause` | Yes |
| Resume pipeline | `POST /api/admin/news-engine/pipeline/resume` | Yes |
| Emergency stop | `POST /api/admin/news-engine/pipeline/emergency-stop` | Yes |
| Save settings | `PUT /api/admin/news-engine/settings` | Yes |

---

## 4.6 Audit Logging

### Actions to Log

| Action | Actor | Metadata |
|--------|-------|----------|
| Item Created | Admin | `{ itemId, title }` |
| Item Updated | Admin | `{ itemId, fields }` |
| Item Published | Admin | `{ itemId, title, slug }` |
| Item Scheduled | Admin | `{ itemId, scheduledFor }` |
| Item Rejected | Admin | `{ itemId, reason }` |
| Pipeline Paused | Admin | `{}` |
| Pipeline Resumed | Admin | `{}` |
| Emergency Stop | Admin | `{ confirmText }` |
| Source Added | Admin | `{ sourceId, name }` |
| Source Updated | Admin | `{ sourceId }` |
| Rule Added | Admin | `{ ruleId, type }` |

---

## 4.7 Scheduling / Automation (Future Phase)

### Storage Needed (Included in Models)
- `NewsItem.scheduledFor` — when to publish
- `Settings: news.automation.*` — automation toggles

### Execution (NOT in This Phase)
- Background job/cron to check `scheduledFor <= now AND status = SCHEDULED`
- Change status to PUBLISHED, set publishedAt
- Requires: Next.js API cron, external scheduler, or Vercel cron

---

## 4.8 Security & Permissions

### Role Matrix

| Endpoint Pattern | GUEST | HOMEOWNER | INSTALLER | ADMIN |
|------------------|-------|-----------|-----------|-------|
| `GET /api/news` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/news/:slug` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/admin/news-engine/*` | ❌ | ❌ | ❌ | ✅ |
| `POST /api/admin/news-engine/*` | ❌ | ❌ | ❌ | ✅ |
| `PUT /api/admin/news-engine/*` | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/admin/news-engine/*` | ❌ | ❌ | ❌ | ✅ |

### Public Data Exposure
- Public endpoints return only: id, title, summary, content, slug, category, tags, publishedAt, sourceType
- Never expose: relevanceScore, aiModel, adminId, rejectionReason, internal metadata

---

## 4.9 Testing Plan

### Manual Testing
1. Create news item via admin → verify in DB
2. Publish item → verify appears on `/news`
3. View item by slug → verify detail page
4. Reject item → verify not on public
5. Pause/resume pipeline → verify settings update
6. Schedule item → verify status change

### Unit/Integration Tests (Plan Only)
- `GET /api/news` returns only PUBLISHED items
- `GET /api/news/:slug` returns 404 for non-existent
- Admin endpoints return 401/403 for non-admin
- Publish requires correct confirmText
- Audit log created on each write action

---

## 4.10 Risks, Dependencies, Open Questions

### Risks
| Risk | Mitigation |
|------|------------|
| Breaking existing blog feature | Models are separate; no schema conflicts |
| Data loss during migration | No existing news data; safe to create fresh |
| Performance on large item lists | Add indexes; implement pagination |

### Dependencies
| Dependency | Status |
|------------|--------|
| Prisma schema access | ✅ Available |
| Auth system (ADMIN role check) | ✅ Exists |
| Settings table | ✅ Exists |

### Open Questions (Need Human Decision)
1. **Soft delete vs hard delete for news items?**
  - Decision: **Soft delete** (add `deletedAt` field)

2. **Should scheduled publish run automatically?**
  - Decision: **Defer to Phase 2** (manual publish/schedule only in Phase 1)

3. **Content field format?**
  - Decision: **HTML**

4. **SEO fields?**
  - Decision: **Yes** (include `seoTitle`, `seoDescription`, `ogImageUrl`)

---

# PART 3 — NEXT STEPS

After confirmation, create a `tasks.md` file with phased implementation:

**Phase 1:** Prisma models + migration  
**Phase 2:** Public read endpoints  
**Phase 3:** Admin CRUD endpoints  
**Phase 4:** Pipeline control endpoints  
**Phase 5:** Replace localStorage stubs with API calls  
**Phase 6:** E2E testing + verification

---

**STOP RULE:** This plan is complete. Awaiting human owner confirmation before implementation.
