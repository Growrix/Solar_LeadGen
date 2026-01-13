# News Engine — Post-Implementation Feature Audit

**Date**: 2026-01-13

This audit is grounded in the current repository implementation (Next.js App Router + Prisma). It follows the audit scopes in `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`.

> **SOT note**: No formal News Engine feature spec/contract was found under `specs/**` in this workspace. Where “SOT comparison” is required, this report uses:
> 1) the existing prior doc draft in `DOC/FEATURES/NEWS ENGINE/POST FEATURE/old/NEWS-ENGINE-POST-FEATURE-DOCS-2026-01-10-FULL.md` as a reference, and
> 2) the codebase as the source of truth.

---

## 1) Page & Modal Audit (Frontend)

### Implemented surfaces
- Admin entry route: `src/app/admin/news-engine/page.tsx` → `src/components/news-engine/AdminNewsEngineHub.tsx`
- Main tabs (declared in `AdminNewsEngineHub.tsx`):
  - Dashboard
  - Drafts & Reviews
  - Audit Logs
  - Master Control
  - Automation Logic
  - Sources
  - Settings

### Core user actions and wiring (high confidence)
- Tab navigation is purely client-side within the hub; each tab is rendered conditionally by `activeTab`.
- State load/refresh is performed via `fetchAdminState()` from `src/lib/news-engine/client.ts` (fan-out to 6 admin endpoints).
- Most “write actions” call a corresponding `admin*` function, then `reloadState()`.

### Findings (by tab)

#### Dashboard (`src/components/news-engine/v6/tabs/DashboardTab.tsx`)
- Provides search + filtering over `state.items`, and entry points to open the Review flow.
- **Risk/Note**: KPI tiles / some “insights” can be presentation-only depending on data available in `state` (implementation dependent).

#### Drafts & Reviews (`src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`)
- Board columns render items by status; cards open review modal via `openReviewForItem(draft.id)`.
- Manual draft creation is wired to open the Manual Draft modal (`openManualDraft`).

#### Audit Logs (`src/components/news-engine/v6/tabs/AuditLogsTab.tsx`)
- Supports filtering/search over audit logs and showing prompt details/log details modals.
- CSV export is implemented through UI stub helper (see “Static/Unused/Non-Functional UI Elements” for caveat: export can be client-only formatting without server-side export support).

#### Master Control (`src/components/news-engine/v6/tabs/MasterControlTab.tsx`)
- “Run Automation Now” is wired (opens confirmation, then calls admin proxy to internal runner via `adminRunAutomationNow`).
- Pause / Resume / Emergency Stop are wired to pipeline endpoints via confirmation modal.
- “Queue Snapshot” navigation is wired (routes to other tabs) but **some values are currently shown as `null`** in the hub’s computed snapshot.

#### Automation Logic (`src/components/news-engine/v6/tabs/AutomationLogicTab.tsx`)
- Automation toggles (autoDraft/autoSchedule/autoPublish) are wired via `onSave` prop to `adminUpdateAutomation`.
- Operational rules list is wired to DB via:
  - `fetchAdminAutomationRules()`
  - `adminCreateAutomationRule()`
  - `adminUpdateAutomationRule()`
  - `adminDeleteAutomationRule()`
- “Publish Windows v2” is computed client-side and persisted via `adminUpdateAutomation` payload (as `config.publishWindowsV2`, `config.windows`, etc.).

#### Sources (`src/components/news-engine/v6/tabs/SourcesTab.tsx`)
- CRUD for sources is wired (create/edit via modal, toggle enabled).
- Sync actions are wired to API routes (per-source sync, entries view, and research sync flows where present).

#### Settings (`src/components/news-engine/v6/tabs/SettingsTab.tsx`)
- System settings save is wired to `adminUpdateSettings`.
- Key Vault and AI routing/model profiles are wired via multiple admin endpoints.
- **Important operational dependency**: Key Vault requires master key environment variable to function.

### Modals (high-level)
- Review: provenance, OG image settings, approve/schedule/publish/rewrite/reject/delete actions.
- Schedule / Rewrite / Reject / Manual Draft / Prompt Details / Run Details / Test Preview / Add/Edit Source / Audit date range / Audit log details / Automation guidelines / Operational rule.

---

## 2) API Endpoint Audit

### Public endpoints
- `GET /api/news` — list published items; triggers best-effort publish of due scheduled items.
- `GET /api/news/[slug]` — detail page; triggers best-effort publish of due scheduled items.

### Admin endpoints (core)
- Items
  - `GET /api/admin/news-engine/items`
  - `POST /api/admin/news-engine/items`
  - `GET|PUT|DELETE /api/admin/news-engine/items/[id]`
  - `POST /api/admin/news-engine/items/[id]/publish-now`
  - (also present in client: schedule, rewrite, reject, regenerate, purge)
- Pipeline
  - `GET /api/admin/news-engine/pipeline/status`
  - `POST /api/admin/news-engine/pipeline/pause`
  - `POST /api/admin/news-engine/pipeline/resume`
  - `POST /api/admin/news-engine/pipeline/emergency-stop`
- Automation
  - `GET|PUT /api/admin/news-engine/automation/config`
  - `POST /api/admin/news-engine/automation/run-now` (admin proxy)
  - `GET|POST /api/admin/news-engine/automation/rules`
  - `PUT|DELETE /api/admin/news-engine/automation/rules/[id]`
- Sources
  - `GET|POST /api/admin/news-engine/sources`
  - `POST /api/admin/news-engine/sources/[id]/sync`
  - `GET /api/admin/news-engine/sources/[id]/entries`
- Settings
  - `GET|PUT /api/admin/news-engine/settings`
- Audit logs
  - `GET /api/admin/news-engine/audit-logs`
- Key Vault / AI routing
  - `GET|POST /api/admin/news-engine/key-vault`
  - `GET|POST /api/admin/news-engine/model-profiles`
  - `GET|PUT /api/admin/news-engine/ai-router/defaults`
- Research
  - `POST /api/admin/news-engine/research/sync`
  - `POST /api/admin/news-engine/research/sync-now`
  - `GET /api/admin/news-engine/research/entries`
  - `POST /api/admin/news-engine/research/generate-draft`
  - `POST /api/admin/news-engine/items/generate-manual`

### Internal automation runner
- `POST /api/internal/news-engine/automation/run`
  - Guarded by `x-news-engine-cron-secret` header matching `NEWS_ENGINE_CRON_SECRET`.
  - Runs RSS import (where enabled), selection, drafting, and writes job/audit logs.

### API error-handling observations
- Multiple routes explicitly handle Prisma `P2021` (missing tables) with actionable messages.
- Source sync endpoint includes helpful diagnostics:
  - Detects HTML masquerading as RSS and returns `422` with guidance.
  - Stores `lastError` + increments `errorCount`.
- Publish-now endpoint returns `409` if OG image approval is required but not approved.

---

## 3) Backend Logic & Service Audit

### Key backend modules
- Settings: `src/lib/news-engine/settings.ts` (typed keys, pipeline status)
- Key Vault: `src/lib/news-engine/key-vault.ts` (AES-256-GCM, key pools, masking)
- AI Router: `src/lib/news-engine/ai-router.ts` (task → model profile)
- AI Runtime: `src/lib/news-engine/ai-runtime.ts` (provider+key resolution and call config)
- Publish due scheduled: `src/lib/news-engine/publish-due.ts` (auto-publish gate + slug generation)
- Audit log writer: `src/lib/news-engine/audit.ts`

### Findings
- Security is layered:
  - Admin endpoints require `requireAdmin()`.
  - Internal automation runner requires a shared secret header.
  - Key Vault depends on an explicit master key env var, which avoids accidental plaintext key operations.
- “Publish scheduled” logic is best-effort and is invoked on public reads (`/api/news*`). This is operationally convenient but creates a coupling between traffic and publishing.

---

## 4) Database & Prisma Model Audit

### Implemented domain
The Prisma schema includes dedicated models for:
- `NewsItem` (workflow statuses, publishing fields, SEO fields, OG image approval gating)
- `NewsSource` + `NewsSourceEntry`
- `NewsResearchEntry`
- `NewsAiRequestLog`
- `NewsApiKey` (encrypted keys + pools)
- `NewsModelProfile` + `NewsModelRouterDefault`
- `NewsAutomationRule`

### Findings
- Model set is comprehensive for an auditable pipeline.
- Several routes defensively handle missing schema (`P2021`), which implies this feature expects to be deployed into environments that may lag migrations.

---

## 5) E2E Functional Audit (test scripts)

### Available scripts
- `scripts/news-engine-rss-http-test.ts`
  - Seeds a disabled source + NEW entry, then calls the internal runner over HTTP.
  - Verifies entry processed → item created.
  - Requires dev server + `NEWS_ENGINE_CRON_SECRET` + valid Drafting key available.
- `scripts/news-engine-e2e-automation-test.ts`
  - Exercises OpenAI → DB draft flow locally (does not call internal runner).

### Gaps
- No Playwright/Cypress UI e2e coverage specifically for the admin hub flows was identified in the scanned context.

---

## 6) Internal Wiring & Integration Audit

### High-confidence wiring
- Admin hub → `src/lib/news-engine/client.ts` → Next.js route handlers → Prisma.
- Review flow → publish-now/schedule/reject/rewrite endpoints.
- Sources flow → sources CRUD + per-source sync + entries list.
- Settings flow → persisted settings + key vault + model routing.
- Automation flow → internal runner with cron secret + pipeline status gating.

### Medium-confidence wiring
- Dashboard metrics and “queue snapshot” counters: some appear computed only from currently loaded `state.items` (not from dedicated queue tables), and some counters are explicitly `null` placeholders.

---

## 7) SOT Comparison & Gap Analysis

Because a formal feature SOT was not found under `specs/**`, this section focuses on:
- Consistency vs the prior doc draft (2026-01-10)
- Internal consistency between UI claims and backend capabilities

### Notable deviations / risks
- “Master Control” presents multiple subsystem statuses and timings; those are currently generated client-side with static `lastActivity` strings and should not be treated as real health telemetry.
- “Safety Center” includes narrative claims (rate limiting, token consumption, dedupe latency) that appear presentation-only in the UI layer.

---

## Static/Unused/Non-Functional UI Elements (mandatory)

These are UI elements that are present but not connected to real backend/system telemetry, or are intentionally disabled/placeholder.

1) `src/components/news-engine/v6/tabs/MasterControlTab.tsx`
- **Pipeline Sub-Systems** panel
  - `lastActivity` values like `"2m ago"`, `"5m ago"`, `"Just now"` are set via a timeout and do not come from backend.
  - Toggle switches inside subsystem cards are `disabled` and labeled as “status panel (not a control)”.
- **Safety Center** panel
  - “Human Checkpoint… below 95%” and “Current token consumption: 14.2k / 1.5M / hr” are static text.
  - “Bias Checker / Hallucination Monitor / PII Filter” list is static.
  - “Operational Alert… dedupe latency” is static.
- **Queue Snapshot** values for RSS and Research NEW counts are `null` in `AdminNewsEngineHub.tsx` and therefore show “Not available”.

2) `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`
- The avatar chips `U1 / U2 / U3` are hardcoded placeholders (not tied to real users).

3) `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx`
- The `config` object (`minScore`, `strategy`) is persisted via `adminUpdateAutomation`, but **there is no evidence (in the scanned UI) that these values are loaded back from server** on mount; the UI initializes them locally.
  - Recommended action: read persisted config from the automation config endpoint and initialize UI state from it.

4) `src/components/news-engine/AdminNewsEngineHub.tsx`
- `queueSnapshot.rssNewEntries` and `queueSnapshot.researchNewEntries.*` are hard-coded `null` rather than fetched.
  - Recommended action: add backend endpoints for queue counts or include counts in `fetchAdminState`.

---

## Summary Table (Scope → Issues)

| Scope | Missing | Incomplete | Non-functional | Notes |
|---|---:|---:|---:|---|
| UI pages/modals | 0 | Some | Some | Placeholder health/telemetry in Master Control, queue snapshot counts null |
| API endpoints | 0 (observed) | Low | Low | Strong error handling (P2021, 409 publish gating, 422 RSS HTML) |
| Backend services | 0 | Low | Low | Key Vault + cron-secret gating are solid |
| Database/schema | 0 | Low | Low | Comprehensive domain schema |
| E2E coverage | Some | Some | 0 | Scripts exist; UI e2e not evidenced |

---

## Recommendations (actionable)

1) Replace placeholder telemetry with real signals or label explicitly as “demo data”.
2) Implement backend queue counters (RSS NEW, Research NEW by kind) and wire into `fetchAdminState`.
3) Persist and reload Automation Logic config (`minScore`, `strategy`, publish windows) so UI reflects stored state.
4) Add minimal UI e2e tests for: manual draft → review → schedule/publish → public listing.
