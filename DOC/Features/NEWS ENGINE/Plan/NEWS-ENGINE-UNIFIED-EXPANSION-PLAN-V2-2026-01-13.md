# News Engine — Unified Expansion/Enhancement Plan (V2)

**Date**: 2026-01-13  
**Scope**: Frontend + Backend expansion planning (plan only)

## Inputs (SOT for this cycle)

1) Current-state audit (E2E / implementation reality)
- `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-post-phase13-audit-2026-01-13.md`

2) Post-feature docs / operator guide
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-USER-GUIDE.md`
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-FEATURE-AUDIT-2026-01-13.md`

3) Expansion/enhancement plan (V2 brief)
- `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md`

---

## Current State Summary (from audits)

- Admin hub V6 is implemented and wired end-to-end (items, sources, research, automation, settings, key vault, AI router, audit logs).
- Observability endpoints exist (queue snapshot, health, run summary), and dashboard KPIs are API-backed.
- Scheduling “extras” (priority/expiry/featured) are present and wired.
- OG image controls exist, including approval gating for publish paths.

---

## V2 Gap Analysis (V2 brief vs current state)

This section lists **what V2 asks for** that is not fully represented as a first-class, operable surface today.

### 1) News image sourcing & reliability
**V2 asks**:
- Source free, relevant images from the internet per post; fallback to AI image generation.
- Detect broken image links and auto-replace.

**Current state**:
- OG image controls exist (manual URL + AI generation + approval gating).
- No dedicated system to discover external images per item, track image provenance, or perform link health checks.

### 2) Unified Research Center expansion
**V2 asks**:
- Aggregate research from RSS, web scraping, search engines, Google Trends, and social media APIs.
- Support manual prompt-based and automated keyword-list jobs.
- Store in a single unified center and distribute to News + Blog pipelines.

**Current state**:
- Unified listing endpoint exists over RSS entries + research entries.
- Research kinds exist (WEB/SOCIAL/JOURNAL/TREND) and UI supports syncing per kind.
- No explicit “research job” orchestration layer (job definitions, runs, schedules, keywords) described in the V2 brief.
- “Blog pipeline” is not explicitly part of the current audited surfaces.

### 3) Advanced AI content generation
**V2 asks**:
- Admin UI to prompt AI with topic/keywords/audience/tone.
- Keyword list management for automated research + content generation.
- Rules enforcement + flagging.
- Fact-checking + originality scoring; human review for sensitive content.

**Current state**:
- Manual draft generation exists.
- Operational rules exist and are enforced by the automation runner.
- No dedicated fact-check/originality scoring pipeline is described in the V2 brief.

### 4) Automation & scheduling (incl n8n)
**V2 asks**:
- Integrate n8n for workflows (research, AI, publishing, notifications).
- Fully support scheduling options (priority, expiry, featured, recurring, batch publishing).

**Current state**:
- Internal runner exists (cron-secret guarded) and can be triggered by admin “run now”.
- Priority/expiry/featured appear implemented.
- No recurring/batch publishing UX/API is described in the V2 brief.
- No n8n integration surface is described in the V2 brief.

### 5) UI/UX & analytics
**V2 asks**:
- Ensure all UI controls are wired.
- Dashboards for research coverage, pipeline, analytics.
- Expand audit logs: full actor identity, CSV export, advanced filtering.

**Current state**:
- Expanded frontend work (Phase 13) removed misleading placeholders and wired ops/analytics endpoints.
- Audit logs exist with filtering/search and some export support.
- “Advanced filtering” and server-side CSV export are not explicitly described.

### 6) Operational hardening
**V2 asks**:
- Enforce migrations, key vault, cron secret setup.
- System health checks and alerting for automation/research failures.

**Current state**:
- Key Vault master-key requirement is enforced.
- Cron secret guard exists for internal runner.
- Health surfaces exist, but “alerting” is not described in the V2 brief.

---

# Section 1 — Frontend Expansion/Enhancement Plan

This is the **UI plan** to make V2 operable and reduce “hidden functionality” risk.

## FE-1: Image Sourcing & Link Reliability (Operator-first)

### Goals
- Make image sourcing explicit and auditable per item.
- Detect broken OG image URLs and provide deterministic remediation actions.

### Proposed UI surfaces
1) Review Modal: **Image Sources & Health** panel
   - Fields (read-only unless admin action):
     - `ogImageUrl`
     - `ogImageSourceType` (manual|ai|web)
     - `ogImageSourceUrl` (where it came from)
     - `ogImageCheckedAt`, `ogImageIsBroken`, `ogImageLastError`
   - Actions:
     - “Check Image Link” (manual health check)
     - “Find Web Image” (search + select)
     - “Generate AI Image” (existing; keep)
     - “Fallback to Article URL image” (if available)

2) Master Control: **Image Health Summary**
   - Counters: broken images pending review, last check time, last job error.

### UX states
- Loading / empty / error states for image search and link check.
- Disabled actions when pipeline is Emergency Stopped.
- Clear messaging when Key Vault is missing (for AI image generation).

## FE-2: Unified Research Center v2 (Jobs + Keywords)

### Goals
- Turn “research” into a managed system: definitions, runs, schedules, outputs.

### Proposed UI surfaces
1) Sources tab: add sub-tabs
   - **Entries** (existing unified listing)
   - **Jobs** (new)
   - **Keyword Lists** (new)

2) Jobs UI
   - Create/edit job: name, kind(s), query template/prompt, source targets, schedule (manual/cron-like), enabled.
   - Run now → shows run summary + errors.
   - View run history (last 10/30) with status, counts, duration.

3) Keyword Lists UI
   - CRUD: list name, keywords, enabled.
   - Attach lists to jobs.

### UX states
- Explicit “Job created but never run” empty state.
- Deterministic error surface for provider/API failures.

## FE-3: Content Studio (Advanced AI Content Generation)

### Goals
- Provide an operator-ready “prompt-based drafting” UI aligned with V2.

### Proposed UI surfaces
1) New tab: **Content Studio** (or a new section under Drafts)
   - Form: topic, keywords, audience, tone, length, references.
   - Output preview, then “Save as Draft”.

2) Optional: “Compliance / Flags” box
   - Shows rule violations / sensitivity flags / scores.

### UX states
- If fact-check/originality is pending (not implemented), label as “Endpoint pending” until backend is delivered.

## FE-4: Scheduling Enhancements (Recurring + Batch)

### Goals
- Make recurring/batch publishing operable without manual repetition.

### Proposed UI surfaces
1) Schedule modal
   - Add “Recurring” toggle → (daily/weekly cadence) + allowed windows.
   - Add “Batch schedule” action in Drafts & Reviews

## FE-5: Audit Logs: Export + Advanced Filtering

### Goals
- Support the V2 requirement for CSV export and richer filters.

### Proposed UI surfaces
- Add server-side export flow with date range + filters.
- Add filters: actorId, actionType grouping, modelProfileId/apiKeyId (where present).

---

# Section 2 — Backend Expansion/Enhancement Plan

This is the backend plan to support the above UI and the V2 brief.

## BE-1: Image Sourcing & Link Health

### Data model (additive)
- Extend `NewsItem` with:
  - `ogImageSourceType` (enum: MANUAL|AI|WEB)
  - `ogImageSourceUrl` (nullable)
  - `ogImageCheckedAt` (nullable)
  - `ogImageIsBroken` (boolean, default false)
  - `ogImageLastError` (nullable)
- New table (suggested): `NewsImageCandidate`
  - Candidate URL, thumbnail URL, source page URL, license/attribution fields if available, score, createdAt.

### Endpoints (admin)
- `POST /api/admin/news-engine/items/[id]/og-image/check`
  - Performs a HEAD/GET to validate `ogImageUrl`; updates health fields.
- `GET /api/admin/news-engine/items/[id]/og-image/candidates`
  - Returns candidates (cached) for selection.
- `POST /api/admin/news-engine/items/[id]/og-image/candidates/search`
  - Runs external search (implementation choice) and stores candidates.
- `POST /api/admin/news-engine/items/[id]/og-image/select`
  - Sets `ogImageUrl` + provenance fields.

### Automation strategy
- Add a periodic job (internal) to re-check published items’ OG images and flag broken ones.

## BE-2: Unified Research Center v2 (Jobs + Keywords)

### Data model (additive)
- `NewsKeywordList`
  - name, enabled, keywordsJson/text, createdBy, timestamps
- `NewsResearchJob`
  - name, enabled, kindsJson, promptTemplate, schedule, sourcesJson, keywordListId (nullable)
- `NewsResearchJobRun`
  - jobId, status, startedAt, finishedAt, counts, lastError

### Endpoints (admin)
- Keyword lists
  - `GET|POST /api/admin/news-engine/research/keyword-lists`
  - `PUT|DELETE /api/admin/news-engine/research/keyword-lists/[id]`
- Jobs
  - `GET|POST /api/admin/news-engine/research/jobs`
  - `PUT|DELETE /api/admin/news-engine/research/jobs/[id]`
  - `POST /api/admin/news-engine/research/jobs/[id]/run-now`
  - `GET /api/admin/news-engine/research/jobs/[id]/runs`

### Internal execution
- `POST /api/internal/news-engine/research/run`
  - guarded by cron secret; runs enabled jobs, writes runs + entries.

## BE-3: Content Studio (Advanced AI Drafting)

### Endpoints (admin)
- `POST /api/admin/news-engine/content-studio/draft`
  - Input: topic, keywords, audience, tone, length.
  - Output: generated content + optional flags/scores.
  - Writes `NewsAiRequestLog` with a new `taskType`.

### Future-proofing
- Define optional scoring hooks:
  - `factCheckStatus`, `originalityScore`, `safetyFlagsJson` (nullable fields) on `NewsItem`.

## BE-4: Scheduling Enhancements (Recurring + Batch)

### Data model (additive)
- `NewsSchedulePlan`
  - itemId, mode (ONE_TIME|RECURRING), recurrenceRule, nextRunAt, expiresAt
- Or extend existing scheduling fields if already present (keep additive).

### Endpoints (admin)
- `POST /api/admin/news-engine/items/batch-schedule`
- `POST /api/admin/news-engine/items/[id]/schedule-recurring`

### Runner changes
- Runner should resolve “nextRunAt” deterministically and avoid double-publish.

## BE-5: Audit Logs: Server-side Export + Filtering

### Endpoints (admin)
- `GET /api/admin/news-engine/audit-logs/export`
  - Query params: date range + filters; returns CSV download.

### Storage
- Ensure audit events persist actor identity and context fields already present in schema.

## BE-6: n8n Integration (optional, gated)

Because V2 explicitly calls out n8n, treat this as **opt-in** and **config-gated**.

### Endpoints
- `POST /api/internal/news-engine/n8n/webhook`
  - Guarded by secret header; accepts events like “research completed”, “publish completed”.

### Config
- Settings keys for n8n base URL + secret(s) (stored in settings table).

---

# Section 3 — Mapping Table (UI ↔ Endpoint ↔ Data Model)

| UI action / element | Endpoint(s) | Data model touched |
|---|---|---|
| Review: Check Image Link | `POST /items/[id]/og-image/check` | `NewsItem` (health fields) |
| Review: Find Web Image | `POST /items/[id]/og-image/candidates/search` | `NewsImageCandidate` |
| Review: Select Candidate | `POST /items/[id]/og-image/select` | `NewsItem` + provenance |
| Sources: Create Keyword List | `POST /research/keyword-lists` | `NewsKeywordList` |
| Sources: Create Research Job | `POST /research/jobs` | `NewsResearchJob` |
| Jobs: Run Now | `POST /research/jobs/[id]/run-now` | `NewsResearchJobRun` + entries |
| Jobs: View Runs | `GET /research/jobs/[id]/runs` | `NewsResearchJobRun` |
| Content Studio: Generate Draft | `POST /content-studio/draft` | `NewsAiRequestLog` + `NewsItem` |
| Drafts: Batch Schedule | `POST /items/batch-schedule` | `NewsItem`/schedule tables |
| Logs: Export CSV | `GET /audit-logs/export` | `NewsAuditLog` (read) |
| n8n webhook (optional) | `POST /internal/news-engine/n8n/webhook` | job logs / audit logs |

---

# Section 4 — Implementation Checklist (ready for tracking)

## Phase 14-A: Planning artifacts
- [ ] Confirm V2 scope boundaries (what is in vs deferred)
- [ ] Define “image sourcing provider” approach and licensing/attribution policy
- [ ] Define “fact-check/originality” provider approach (or explicitly defer)

## Phase 14-B: Database migrations (additive)
- [ ] Add image provenance + health fields on `NewsItem`
- [ ] Add research jobs + keyword lists schema
- [ ] Add recurring schedule schema (or additive extension)

## Phase 14-C: Backend endpoints
- [ ] Implement image check/search/select endpoints
- [ ] Implement research keyword lists CRUD
- [ ] Implement research jobs CRUD + runs + internal runner
- [ ] Implement content studio drafting endpoint
- [ ] Implement audit export endpoint

## Phase 14-D: Frontend implementation
- [ ] Review modal: Image Sources & Health
- [ ] Sources tab: Jobs + Keyword Lists
- [ ] New tab: Content Studio
- [ ] Schedule modal: recurring + batch scheduling UI
- [ ] Audit logs: export UX + advanced filters

## Phase 14-E: Verification
- [ ] `npx prisma validate`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] Manual QA: image sourcing + broken link remediation
- [ ] Manual QA: research jobs → entries → draft creation
