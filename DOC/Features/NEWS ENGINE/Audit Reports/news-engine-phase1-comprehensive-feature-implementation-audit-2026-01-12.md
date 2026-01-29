---
description: "Phase 1: Comprehensive Feature Implementation Audit (News Engine)"
date: "2026-01-12"
---

# News Engine — Phase 1 Comprehensive Feature Implementation Audit (2026-01-12)

This report follows the audit template in `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`.

## Goal
Produce a forensic, end-to-end picture of the current News Engine implementation versus SOT, including **static/unused/non-functional UI/UX** (even if not in SOT).

## Sources of Truth (SOT)
- `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/AI-AUTOMATION-ADMIN-SOT-ADDENDUM.md`

## Evidence Surfaces Audited
**Frontend (Admin):**
- `src/app/admin/news-engine/page.tsx`
- `src/components/news-engine/AdminNewsEngineHub.tsx`
- `src/components/news-engine/v6/tabs/*`
- `src/components/news-engine/v6/modals/*`

**Frontend (Public):**
- `src/app/news/page.tsx`
- `src/app/news/[slug]/page.tsx`

**Client API wrappers:**
- `src/lib/news-engine/client.ts`

**Backend (Admin APIs):**
- `src/app/api/admin/news-engine/**/route.ts`

**Backend (Internal runner):**
- `src/app/api/internal/news-engine/automation/run/route.ts`

**Backend helpers:**
- `src/lib/news-engine/publish-due.ts`

**Data layer:**
- `prisma/schema.prisma`

---

## 1) Page & Modal Audit (Frontend)

### Findings
- The Admin hub is a multi-tab UI with working modal flows (Review, Schedule, rewrite/reject, etc.) backed by a centralized client wrapper.
- Review modal contains functional OG image controls (fetch/update controls, generate image via OpenAI images API, approve gate) and provenance loading.
- Schedule modal collects scheduling time plus schedule metadata (priority/expiry/featured) and passes it up to the caller.
- Sources tab supports:
	- RSS source “Sync now” per source.
	- Research sync “Sync Research Now” per kind and “View Entries” modal backed by admin endpoints.
	- Sources config inputs (research enabled/weights, dedup/verify, min sources, countries, blacklist) that are intended to persist via sources config.
- Automation Logic tab exposes:
	- toggles for auto draft/schedule/publish (persisted via automation config)
	- an in-UI “Publish Windows v2” builder (timezone + per-day ranges + jitter + blackout + preview)
	- an “Operational Rules” UI editor (local list created by `OperationalRuleModal`)

### Gaps / Issues
- Several UI elements are placeholders or not wired to deterministic outcomes (see the dedicated “Static/Unused/Non-Functional UI Elements” section).
- The Sources tab “Recent Research Sync” section is labeled “Visibility surface (UI only)” but is actually wired and functional; this creates operator confusion.
- The Automation Logic “Publish Windows v2” builder appears to be a V2 semantics surface, but the runner uses a different schema (`config.windows?: string[]`) and does not consume the v2 builder shape.
- The “Operational Rules” UI editor in Automation Logic is not connected to the DB-backed automation rules endpoints (`NewsAutomationRule`).

### Recommendations
- Remove/rename misleading “UI only” labels where the UI is actually wired.
- Align Automation Logic persistence/enforcement:
	- either implement Publish Windows v2 semantics end-to-end
	- or change the UI to edit the runner’s actual `config.windows` format.
- Either connect “Operational Rules” UI to `/api/admin/news-engine/automation/rules` + runner enforcement, or mark it explicitly as draft/placeholder and keep it out of persistence.

---

## 2) API Endpoint Audit

### Findings (key endpoints)
**Public read**
- `GET /api/news` publishes due scheduled items opportunistically, then returns published items.
- `GET /api/news/[slug]` publishes due scheduled items opportunistically, then returns a published item by slug.

**Admin core**
- `GET /api/admin/news-engine/items` publishes due scheduled items opportunistically, then returns items with filters.
- `POST /api/admin/news-engine/items/[id]/schedule` validates a future schedule time and persists `schedulePriority`, `scheduleExpiresAt`, `scheduleIsFeatured`.
- `POST /api/admin/news-engine/items/[id]/publish-now` requires typed confirmation and enforces OG image approval if required.

**Admin automation**
- `GET/PUT /api/admin/news-engine/automation/config` persists `news.automation.*` toggles and an arbitrary `news.automation.config_json` payload.
- `POST /api/admin/news-engine/automation/run-now?mode=dry|live` triggers the internal runner using the cron secret header.
- `GET/POST /api/admin/news-engine/automation/rules` provides CRUD for DB-backed rules (`NewsAutomationRule`).
- `PUT/DELETE /api/admin/news-engine/automation/rules/[id]` updates/deletes a rule.

**Admin research**
- `POST /api/admin/news-engine/research/sync-now` fetches public RSS/Atom feeds per kind (WEB/SOCIAL/JOURNAL/TREND) and persists `NewsResearchEntry` rows.
- `POST /api/admin/news-engine/research/sync` supports bulk ingest of entries (server-to-server style).
- `GET /api/admin/news-engine/research/entries?kind=...&limit=...` lists recent research entries.

**Admin OG image controls**
- `GET/PUT /api/admin/news-engine/items/[id]/image-controls` reads/writes `ogImageUrl` and `ogImageApprovalRequired`.
- `POST /api/admin/news-engine/items/[id]/og-image/generate` generates an OG image via OpenAI images (requires Key Vault IMAGES pool configured).
- `POST /api/admin/news-engine/items/[id]/og-image/approve` approves the current OG image.

### Gaps / Issues
- The admin automation config endpoint stores arbitrary JSON; the internal runner currently expects `AutomationConfig = { windows?: string[] }`. There is no validation that the stored config JSON matches what the runner will actually use.

### Recommendations
- Add schema validation (even a minimal “known keys + types” validation) for `news.automation.config_json` to avoid silent misconfiguration.

---

## 3) Backend Logic & Service Audit

### Findings
- Internal runner (`src/app/api/internal/news-engine/automation/run/route.ts`):
	- guarded by `x-news-engine-cron-secret` and `NEWS_ENGINE_CRON_SECRET`.
	- uses `safeParseSourcesConfig()` with enforceable rules limited to `deduplication` and `verifyPayload`.
	- uses `safeParseAutomationConfig()` with enforceable scheduling limited to `windows?: string[]` parsed by `parseWindowStart()`.
	- scheduling decision:
		- if `autoSchedule` on and `autoPublish` off → sets `scheduledFor = chooseNextScheduleTime(automationConfig, now)` and status `SCHEDULED`.
		- if `autoPublish` on and pipeline nominal → status `PUBLISHED`.
	- OG image gate: if item is PUBLISHED/SCHEDULED and `ogImageApprovalRequired` is true but `ogImageApprovedAt` missing, it downgrades back to `NEEDS_REVIEW` and clears publish/schedule timestamps.
- Scheduled publishing helper (`src/lib/news-engine/publish-due.ts`) publishes due scheduled items and enforces the OG image approval requirement.
- “Publish Now” endpoint also enforces OG image approval requirement.
- OG image generation endpoint uses:
	- key vault routing (`resolveNewsAiCallConfig`) with `taskType: image_generate`, pool `IMAGES`.
	- OpenAI images generation API (`/v1/images/generations`).

### Gaps / Issues
- DB-backed automation rules (`NewsAutomationRule`) are not consumed in the internal runner; enforcement is effectively absent beyond the limited sources config rules.
- Publish windows v2 semantics (timezone/day/ranges/jitter/blackouts) are not implemented in runner; runner schedules via `config.windows` string list.

### Recommendations
- Either:
	- implement a rules engine evaluation phase in the runner that consumes `NewsAutomationRule.config`, or
	- remove/disable rule CRUD surfaces until the runner enforces them.
- Decide on one canonical publish-window schema; update UI + stored config + runner to match.

---

## 4) Database & Prisma Model Audit

### Findings
- `NewsItem` supports the schedule extras used by the scheduling UI/API:
	- `schedulePriority String @default("Normal")`
	- `scheduleExpiresAt DateTime?`
	- `scheduleIsFeatured Boolean @default(false)`
- `NewsItem` contains OG image gating fields:
	- `ogImageApprovalRequired`, `ogImageApprovedAt`, `ogImageApprovedById`.
- `NewsResearchEntry` exists and is unique on `(kind, url)`.
- `NewsAutomationRule` exists and is indexed on `enabled`.

### Gaps / Issues
- `NewsAutomationRule` appears “orphaned” from enforcement: it is CRUD’d by admin routes but not applied by the runner.

### Recommendations
- Either wire `NewsAutomationRule` into the runner, or explicitly mark it as “planned” and gate the admin UI/API behind a feature flag.

---

## 5) E2E Functional Audit

### Findings
- This audit did not execute Playwright or scripts in this run; any e2e results should be considered unknown until re-run.

### Recommendations (how to verify)
- Run the focused Playwright spec for News Engine:
	- `npm run test:e2e:news-engine-phase13` (if configured in package scripts)
- Run TypeScript and build gates:
	- `npx tsc --noEmit`
	- `npm run build`

---

## 6) Internal Wiring & Integration Audit

### Findings (deterministic wiring)
- Scheduling flow is end-to-end:
	- UI collects `scheduledForIso`, `schedulePriority`, `scheduleExpiresAt`, `scheduleIsFeatured` (Schedule modal).
	- Admin hub calls client `adminSchedule()` which POSTs to `/api/admin/news-engine/items/[id]/schedule`.
	- API persists schedule fields in `NewsItem`.
- Research sync flow is end-to-end:
	- UI calls `adminSyncResearchNow(kind)` → `POST /api/admin/news-engine/research/sync-now`.
	- UI calls `fetchAdminResearchEntries(kind)` → `GET /api/admin/news-engine/research/entries`.
	- Backend persists/reads `NewsResearchEntry`.
- OG image flow is end-to-end:
	- UI calls `adminGenerateItemOgImage()` → generate endpoint → OpenAI images.
	- UI calls `adminApproveItemOgImage()` → approve endpoint.
	- Publish paths (runner, publishDue, publish-now) enforce OG image approval requirement.

### Broken / Missing integrations
- Automation Logic “Operational Rules” UI is not connected to the DB-backed rules endpoints and is not enforced by the runner.
- Automation Logic “Publish Windows v2” builder is not connected to runner scheduling enforcement.

---

## 7) SOT Comparison & Gap Analysis

### SOT alignment notes
- `FEATURE-SOT.md` explicitly frames some surfaces as UI-only placeholders (e.g., Master Control subsystem toggles).
- `AI-AUTOMATION-ADMIN-SOT-ADDENDUM.md` demands deep semantics for:
	- Publish Windows v2 (timezone/day/ranges/jitter/blackouts + “Next 10 slots” preview)
	- Operational rules persisted and enforced by runner
	- Deterministic “Run Automation Now” UX with run summary

### Observed SOT gaps (implementation vs addendum)
- Publish Windows:
	- UI implements a v2-like builder and preview list.
	- Runner schedules from `config.windows?: string[]` and ignores v2 builder schema.
	- Result: SOT addendum semantics are not enforced.
- Operational rules:
	- DB model + CRUD endpoints exist (`NewsAutomationRule`).
	- Automation Logic UI uses an unrelated “operationalRules” list in config JSON.
	- Runner does not evaluate DB rules.
	- Result: “persisted + enforced” requirement is not met.

### Summary table (by scope)
| Scope | Missing | Incomplete | Non-functional | SOT deviations |
|---|---:|---:|---:|---:|
| UI (Pages/Modals) | 0 | 2 | 4 | 2 |
| API | 0 | 1 | 0 | 1 |
| Backend | 0 | 2 | 0 | 2 |
| DB | 0 | 1 | 0 | 1 |
| E2E | 1 | 0 | 0 | 0 |

Notes:
- “E2E missing” indicates tests were not executed in this run.

---

## 8) Automated Test Script Execution

### Status
- Not executed as part of this audit run.

### Available verification surfaces (known in repo)
- `scripts/news-engine-e2e-automation-test.ts` (requires OpenAI + server prerequisites)
- `scripts/news-engine-rss-http-test.ts` (requires dev server + `NEWS_ENGINE_CRON_SECRET` + OpenAI)
- `tests/e2e/news-engine-phase13-router-vault-provenance.spec.ts`

---

## 9) Audit Reporting & Recommendations

### Critical
- Decide and implement one canonical publish window schema across UI + stored config + runner.
- Implement runner enforcement of `NewsAutomationRule` (or disable the CRUD surface until enforcement exists).

### High
- Remove or clearly label placeholder UI surfaces to preserve operator trust.
- Add validation for automation config JSON to prevent silently storing unusable shapes.

### Medium
- Ensure “Run Automation Now” produces an explicit run summary (counts, timing, errors) if this is required by the addendum.

---

## Static/Unused/Non-Functional UI Elements
This list is limited to UI/UX elements that are present in the UI but are not connected to backend/API/service logic, or are placeholders with no deterministic outcome.

1) Dashboard KPI strip (static values)
- File: `src/components/news-engine/v6/tabs/DashboardTab.tsx`
- Issue: KPI values are hardcoded (e.g. Total Stories 1284, Avg Relevance 92%, Review Queue 12).
- Recommendation: Drive from admin stats endpoint or label as mock data.

2) Dashboard pagination “Previous”
- File: `src/components/news-engine/v6/tabs/DashboardTab.tsx`
- Issue: “Previous” button is rendered as disabled/static; there is no paging state.
- Recommendation: Implement cursor paging or remove the control.

3) Drafts & Reviews → “View Options”
- File: `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`
- Issue: Button has no handler; appears to be a placeholder.
- Recommendation: Implement view options (columns/filter presets) or remove.

4) “More options” (ellipsis) buttons in item lists/cards
- Files:
	- `src/components/news-engine/v6/tabs/DashboardTab.tsx`
	- `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`
- Issue: Rendered icon/button with no menu actions.
- Recommendation: Wire to actions (copy link, open prompt details, etc.) or remove.

5) Master Control → Pipeline Sub-Systems toggle switches
- File: `src/components/news-engine/v6/tabs/MasterControlTab.tsx`
- Issue: Explicitly disabled/read-only; visual only.
- Recommendation: Keep if backed by real health signals; otherwise label as placeholder.

6) Misleading UI-only labeling (operator trust issue)
- File: `src/components/news-engine/v6/tabs/SourcesTab.tsx`
- Issue: “Recent Research Sync” header says “Visibility surface (UI only)” but the section is wired (`sync-now`, entries list).
- Recommendation: Remove/rename the label to match reality.
