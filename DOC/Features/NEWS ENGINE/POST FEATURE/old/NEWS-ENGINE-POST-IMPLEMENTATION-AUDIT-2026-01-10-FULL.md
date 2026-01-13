# News Engine — Post-Implementation Audit (Full Feature)

**Date**: 2026-01-10

## Scope (What this audit covers)
This audit is a post-implementation, operator-focused review of the **full News Engine feature** across:
- Admin UI (V6 tab surfaces + modals)
- Public UI (news list + detail)
- Admin API routes (operational controls + CRUD + pipeline)
- Internal automation runner (secret-protected)
- Data model (Prisma + Postgres tables/enums)
- Security/guardrails (admin authorization, cron secret, key-vault master key)

It is written to answer:
- “What exists today?”
- “What is real vs UI-only?”
- “How do we verify the system end-to-end?”
- “What are the most likely failures and their exact fixes?”

---

## Evidence Basis
This report is based on code inspection of the following primary surfaces:
- Admin entry: `src/app/admin/news-engine/page.tsx`
- Admin hub: `src/components/news-engine/AdminNewsEngineHub.tsx`
- V6 tabs: `src/components/news-engine/v6/tabs/*`
- V6 modals: `src/components/news-engine/v6/modals/*`
- Admin client API wrapper: `src/lib/news-engine/client.ts`
- Public pages: `src/app/news/page.tsx`, `src/app/news/[slug]/page.tsx`
- Public APIs: `src/app/api/news/route.ts`, `src/app/api/news/[slug]/route.ts`
- Scheduled publish helper: `src/lib/news-engine/publish-due.ts`
- Admin automation endpoints: `src/app/api/admin/news-engine/automation/*`
- Admin sources config endpoint: `src/app/api/admin/news-engine/sources/config/route.ts`
- Admin pipeline control endpoints: `src/app/api/admin/news-engine/pipeline/*`
- Internal runner: `src/app/api/internal/news-engine/automation/run/route.ts`
- Key vault + AI router: `src/lib/news-engine/key-vault.ts`, `src/lib/news-engine/ai-router.ts`, related admin routes
- Prisma schema: `prisma/schema.prisma` (News Engine models/enums)

This audit **does not claim** any commands/tests were executed unless explicitly stated.

---

## High-level Architecture (Reality Check)

### Admin surface
- Admin route: `/admin/news-engine`
- Single hub component coordinates:
  - Tab navigation
  - Loading admin state from backend
  - Opening modals for review/schedule/rewrite/reject/test preview/manual draft
  - Confirmation gating for destructive / high-risk actions

### Public surface
- Public route: `/news` (client-rendered listing)
- Public route: `/news/[slug]` (client-rendered detail)
- Public APIs:
  - `GET /api/news` (list published items; best-effort publish-due)
  - `GET /api/news/[slug]` (published detail by slug; best-effort publish-due)

### Backend / automation
- Admin APIs under `/api/admin/news-engine/*` are guarded by admin authorization.
- Automation can be triggered:
  - Manually from admin via `POST /api/admin/news-engine/automation/run-now`
  - Internally via `POST /api/internal/news-engine/automation/run` (requires header `x-news-engine-cron-secret`)

### Storage
- Prisma/Postgres models for:
  - News items (draft/review/scheduled/published/rejected, etc.)
  - Sources and source entries
  - Research entries
  - Audit logs and AI request logs
  - Model profiles + router defaults
  - Encrypted API keys (Key Vault)

---

## UI Surface Audit (Tab-by-tab)

### 1) Dashboard
**What exists**
- Search + filter UI for items.
- “AI News Feed” table is backed by the loaded item list.
- Review entrypoint is wired (opens Review modal).

**Gaps / UI-only**
- KPI cards are currently static/hardcoded values.
- Pagination controls (“Previous/Next”) are UI-only (no cursor/limit wiring).

### 2) Drafts & Reviews
**What exists**
- Kanban-style board and filtering.
- “Create Manual Draft” entrypoint wired (opens Manual Draft modal).
- Clicking a card opens Review modal.

**Gaps / UI-only**
- “View Options” appears UI-only.

### 3) Review Modal (core operations)
**What exists**
- Loads provenance (`GET /api/admin/news-engine/items/[id]/provenance`).
- Loads and persists image controls (`GET/PUT /api/admin/news-engine/items/[id]/image-controls`).
- Save-as-draft persists image controls and refreshes state.
- Actions wired via backend:
  - Publish now
  - Schedule (via Approve → Schedule modal)
  - Reject (opens Reject modal)
  - Rewrite request (opens Rewrite modal)
  - Delete / Purge
  - Restore rejected → draft-ready
  - Regenerate rejected

**Risk / UX gap**
- The “Headline” and “Article Body” fields are currently **uncontrolled inputs** and are **not persisted** as edits on Save.
  - In practice: “Save as Draft” is saving status + image controls, not text edits.

### 4) Schedule Modal
**What exists**
- Validates “future time” in UI.
- Calls backend schedule endpoint with ISO datetime.

**Gaps / UI-only**
- Priority/expiry/featured toggles are UI-only; only scheduled datetime is sent.

### 5) Master Control
**What exists**
- Pipeline status controls:
  - Pause pipeline
  - Resume all
  - Emergency stop (typed confirm `LOCKDOWN`)
- “Run automation now” (dry/live mode) calls admin run-now endpoint.

**Gaps / UI-only**
- Feature health tiles are simulated data (not derived from real backend health checks).
- Queue snapshot partially computed from loaded items; RSS/research counts are currently null.

### 6) Automation Logic
**What exists**
- AutoDraft/AutoSchedule/AutoPublish config is persisted via settings service (`PUT /api/admin/news-engine/automation/config`).
- Complex config JSON (publish windows V2, operational rules) is sent to backend (stored as JSON in settings).

**Gaps / Risk**
- Some controls may be conceptual/preview and not fully enforced by the runner unless implemented in internal automation logic.

### 7) Sources
**What exists**
- CRUD for RSS sources (add/edit) and enable toggle backed by admin APIs.
- “Sync now” is wired to `POST /api/admin/news-engine/sources/[id]/sync`.
- “Sources config” auto-saves to `/api/admin/news-engine/sources/config`.

**Gaps / UI-only**
- “Recent Research Sync” section is explicitly labeled “Visibility surface (UI only)”; “Sync Research Now” buttons are disabled.

### 8) Audit Logs
**What exists**
- Filters (query/origin/status/date range) applied client-side to loaded audit logs.
- Log details + prompt details modals.
- CSV export is UI stub-based.

**Gaps / UX/Truthfulness**
- Some columns are displayed as “System” labels in the UI stub; the real backend may carry more actor identity, but the UI is not showing it.

### 9) Settings
**What exists (real backend wiring)**
- General settings are persisted via `PUT /api/admin/news-engine/settings`.
- AI Router defaults are loaded/saved via `GET/PUT /api/admin/news-engine/ai-router/defaults`.
- Model Profiles are CRUD-backed via `/api/admin/news-engine/model-profiles`.
- Key Vault:
  - Lists masked keys and master key status via `/api/admin/news-engine/key-vault`.
  - Adds/edits keys (encrypted server-side) when master key configured.

---

## API & Backend Audit (Key endpoints)

### Authorization/guardrails
- Admin routes consistently call `requireAdmin()`.
- Internal automation runner requires `NEWS_ENGINE_CRON_SECRET` and the matching request header.

### Confirm-text guardrails
- Publish-now requires `confirmText: "PUBLISH"`.
- Emergency-stop requires `confirmText: "LOCKDOWN"`.

### Common backend error surfaced
- Prisma schema missing tables: `PrismaClientKnownRequestError P2021`.
  - Some endpoints explicitly return an actionable message.

---

## Public API & “Scheduled publish” behavior
- Both public endpoints attempt **best-effort** scheduled publishing (`publishDueScheduledNewsItems`) before serving content.
  - This improves “it just works” behavior for scheduled items in environments without a separate cron worker.
  - It also means public reads may perform writes (publish scheduled items) and produce audit logs.

---

## Operational Risks & Recommendations

### P0 (operator blockers)
1) **Missing migrations** → runtime errors (`P2021`).
   - Recommendation: ensure `npx prisma migrate deploy` is part of deployment/boot.

2) **Key Vault locked** when master key missing/invalid.
   - Recommendation: standardize `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` provisioning and document accepted formats.

3) **Automation run-now cannot work** when `NEWS_ENGINE_CRON_SECRET` is missing.
   - Recommendation: set `NEWS_ENGINE_CRON_SECRET` in every env where automation should run.

### P1 (quality / correctness)
1) Review modal text edits are not persisted.
   - Recommendation: wire controlled inputs and call item update endpoint on save.

2) “UI only” sections can mislead operators.
   - Recommendation: add explicit “Not wired yet” badges consistently (like Sources already does for research sync).

---

## Verification Checklist (commands to run)
These are the recommended steps to convert this audit from “code-inspection” to “verified in runtime”:

1) Typecheck
- `npx tsc --noEmit`

2) Build
- `npm run build`

3) Prisma validation
- `npx prisma validate`

4) Manual smoke tests (admin)
- Open `/admin/news-engine` and confirm state loads.
- Toggle a source enabled/disabled, confirm persists after reload.
- Use “Sync now” on a source, confirm imported count and audit log entry.
- Create a manual draft, confirm it appears in Drafts & Reviews.
- Save image controls in Review modal and confirm persistence after reopen.

5) Public smoke tests
- Open `/news` and verify published list.
- Open a known slug `/news/[slug]` and verify content.

---

## Final Status
- **Feature shape**: Implemented end-to-end across Admin + Public + API + DB.
- **Operator usability**: Strong (pipeline controls, auditability, key vault gating), with some UI-only surfaces and one important editing limitation in Review.
- **Production readiness**: Depends primarily on environment provisioning (migrations + cron secret + key vault master key) and on whether “Review edits must persist” is required before launch.
