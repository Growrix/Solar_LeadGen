# News Engine — AI Automation (Admin Deep Control) — Implementation Audit

- **Date**: 2026-01-07
- **Scope**: AI + Automation only (Admin control surfaces, RSS/Web/Trend research, model/key routing, pipeline runner, observability)
- **Audit Prompt Used**: `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md` (scopes applied selectively)
- **SOT References**:
  - `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
  - `DOC/FEATURES/NEWS ENGINE/SOT/AI-AUTOMATION-ADMIN-SOT-ADDENDUM.md`
- **Backend Plan Reference**:
  - `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-AI-AUTOMATION-2026-01-05.md`
  - `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/tasks.md` (Phase 10)

---

## Executive Summary

The News Engine already has a **working RSS → Draft/Schedule/Publish automation runner**, AI draft generation, and persistence for job logs and AI request logs.

However, the **Admin “deep control” you want is not implemented yet**, and several current UX areas are **stubs or ambiguous**:

- **Model control** is effectively “single model” (env `OPENAI_MODEL`) with no per-task router.
- **Multiple API keys** are not supported (env-only key, no admin key vault/pool).
- **Publish Windows** are stored as a loose string array and scheduled based on “next parsed start time”; no day-of-week/timezone builder.
- **Operational Rules** exist as UI concepts and as a CRUD table (`NewsAutomationRule`) but are **not enforced by the runner**.
- **Web/Trend research** can be synced into `NewsResearchEntry`, but the runner’s drafting uses **RSS entries only** (no clear decisioning of RSS vs Web vs Trend).
- **Live tracking** exists in DB (`NewsJobLog`) but is not surfaced as a first-class “Run History / Queue / What’s next” view for Admin.
- **AI image generation** is not present; only a string field `ogImageUrl` exists.

Net: **automation is “real”**, but **admin observability and configurability are the missing layer**, which matches your pain points.

---

## Scope 1: Page & Modal Audit (AI/Automation surfaces only)

### Findings (current behavior)
- Master Control has “Run Automation Now” but does not show:
  - a running state,
  - a run summary,
  - “blocked reason” details (beyond disable),
  - recent runs / last run time / errors.
- Automation Logic tab:
  - stores publish windows as strings like `"09:00 - 11:00"` and `"YYYY-MM-DD • 09:00 - 11:00"`.
  - has “Operational Rules” UI but the default rules list is **local-only** and not tied to `NewsAutomationRule` records.
- Sources tab supports RSS sources and has a sync endpoint, but:
  - the relationship between “Sources” and “automation runner ingest/select/draft” is not explained in-UI,
  - and the “Web & Trend Research” concepts are not shown as outputs (e.g., last sync, counts, recent entries).

### Gaps
- No in-UI “pipeline mental model” and no tooltips/explainers where you reported confusion.
- No queue view for:
  - RSS entries waiting to be drafted,
  - draft items waiting for review,
  - scheduled items waiting for publish,
  - rejected items pending regeneration.

### Recommendations
- Add “Run Summary” + “Run History” + “Queue” surfaces inside existing tabs (Master Control + Audit Logs + Sources).
- Convert publish windows to a **real schedule builder** (days/time ranges/timezone) while still persisting a computed “next slots” list for the runner.
- Replace “Operational Rules” UI-only with a persisted rules engine with presets.

---

## Scope 2: API Endpoint Audit (AI/Automation endpoints)

### Findings (what exists)
- Admin trigger:
  - `POST /api/admin/news-engine/automation/run-now` → calls internal runner.
- Internal runner:
  - `POST /api/internal/news-engine/automation/run` (secret-protected)
  - Performs: RSS fetch+parse → write `NewsSourceEntry` → select NEW entries → optional AI draft creation → optional auto schedule/publish.
- Research endpoints exist:
  - `POST /api/admin/news-engine/research/sync`
  - `POST /api/admin/news-engine/research/generate-draft`
  - (but the internal runner does not orchestrate these)

### Gaps
- No Admin endpoint for **Run History** (job logs list) or **Run Details**.
- No Admin endpoint for “Queue stats” (how many NEW source entries, how many scheduled due, how many errors).
- No endpoints to support **model profiles**, **routing rules**, or **key pools**.
- No endpoints for AI image generation.

### Recommendations
Add a small set of observability endpoints (read-only) and deep-control configuration endpoints:
- `GET /api/admin/news-engine/runs` (list job runs)
- `GET /api/admin/news-engine/runs/[id]` (details)
- `GET /api/admin/news-engine/queue` (counts + sample IDs)
- `GET/PUT /api/admin/news-engine/ai/router` (task→model mapping)
- `GET/POST /api/admin/news-engine/ai/keys` (key vault; write-only key value)
- `POST /api/admin/news-engine/ai/image/generate` (per item)

---

## Scope 3: Backend Logic & Service Audit (runner semantics)

### Runner semantics (as implemented)
- Runner gating:
  - If pipeline is `PAUSED` or `EMERGENCY_STOP`, it records a job run but **skips work**.
- Drafting:
  - Uses OpenAI JSON generation and writes `NewsAiRequestLog`.
  - Writes `NewsItem` with `contentHtml` (HTML is supported).
- Scheduling:
  - Auto-schedule uses `news.automation.config_json.windows[]` and picks the **next parsed start time**.
  - If none found, schedules **now + 1 hour**.
- Publishing:
  - If pipeline is `NOMINAL` and autoPublish is ON, the runner publishes immediately.

### Gaps vs desired admin control
- **Operational rules are not enforced**: runner does not read `NewsAutomationRule` records.
- **Relevance/minScore is not applied**: UI config includes minScore, but runner creates items with `relevanceScore: 0`.
- **Decisioning of RSS vs Web vs Trend is not implemented**: runner uses RSS entries only.
- **No model router**: model choice is effectively `OPENAI_MODEL || fallback`.
- **No multi-key**: requests always use env `OPENAI_API_KEY`.

---

## Scope 4: Database & Prisma Audit (AI/Automation schema)

### Findings
Schema already supports:
- RSS entries (`NewsSourceEntry`)
- Research entries (`NewsResearchEntry`)
- AI request logs (`NewsAiRequestLog`)
- Job runs (`NewsJobLog`)
- Automation rules (`NewsAutomationRule`)

### Gaps for “deep admin control”
- No model profile table (admin-defined models and per-task routing).
- No key vault table (admin-managed multi-key).
- No item provenance table to show “which source URLs were used for this item” beyond relationships.
- No image asset table (if you want generated images stored/managed).

---

## Scope 5: E2E Functional Audit (admin trust/visibility)

### Findings
- Automation can run and create drafts from RSS.
- Admin can trigger “Run Automation Now”.

### Gaps (your pain points)
- Admin cannot confidently answer:
  - what sources were used in a given run,
  - what was drafted vs skipped and why,
  - what model/key was used per stage,
  - what is next in the queue,
  - whether publish windows are actually enforced by day/time/timezone.

---

## High-Impact Fix List (AI/Automation only)

1) **Run visibility**: expose job logs + run summary UI.
2) **Publish windows v2**: days/timezone + upcoming slots preview.
3) **Operational rules v2**: persisted rules + runner enforcement + presets.
4) **Research decisioning**: define when RSS-only is enough and when web/trend research is required.
5) **Model router**: per-task model selection (Deep research GPT-5.2, drafting o3-mini, etc.).
6) **Multi-key pools**: admin-managed keys (encrypted) + rotation + health.
7) **AI image generation**: generate image prompts + images, store asset, audit.

---

## Notes / Constraints

- This audit intentionally focuses on AI/Automation only; full feature audit already exists in:
  - `DOC/FEATURES/NEWS ENGINE/Audit Reports/comprehensive-implementation-audit-2026-01-07.md`
- Security note: storing API keys from Admin UI requires encryption-at-rest and careful redaction; raw keys must never be shown after initial entry.
