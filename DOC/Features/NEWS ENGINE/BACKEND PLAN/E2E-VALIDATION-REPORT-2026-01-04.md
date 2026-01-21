# E2E Validation Report — News Engine

**Date:** 2026-01-04  
**Scope:** Validate News Engine end-to-end alignment across: original plan → current UI/UX → backend plan → repo implementation state.  
**Rules followed:** `DOC/GUIDELINES & SOT/README.md` (audit-first, no assumptions, no partial acceptance).

---

## 1) Executive Summary (Reality Check)

- **Current repo state:** News Engine is **UI-only** and uses `localStorage` as the source of truth via `src/lib/ui-stubs/news-engine.ts`.
- **Backend state:** **No News Engine API routes exist yet** under `src/app/api/news/` or `src/app/api/admin/news-engine/`.
- **DB state:** **No News Engine Prisma models exist yet** (no `NewsItem`, `NewsSource`, `NewsAuditLog`, `NewsAutomationRule`).
- **Conclusion:** True E2E behavior (UI → API → DB → UI) is **BLOCKED** until backend + wiring tasks are implemented.

This is not a failure of planning—this is the expected result of having built frontend-first. But it means: **after “backend only” work, you will still not have in-app E2E unless the UI is also cut over from localStorage to APIs (US4).**

---

## 2) Definition of Done (Target End Result)

The feature is “Done” only when ALL items below are true:

### Must-have (E2E)
- Admin UI `/admin/news-engine` uses **server-backed APIs** for items/sources/rules/audit/settings.
- Public pages `/news` and `/news/[slug]` render from **server-backed APIs** and show content published by admins.
- News persistence is in Postgres via Prisma models with:
  - `NewsItem.contentHtml` (HTML content)
  - `NewsItem.seoTitle`, `NewsItem.seoDescription`, `NewsItem.ogImageUrl`
  - soft delete via `NewsItem.deletedAt`
- Publish Now requires typed confirm; schedules validate future datetime; reject requires reason.
- Audit trail persists in DB for create/update/publish/schedule/reject/delete + rewrite-request.
- News Engine settings persist via the existing settings mechanism (DB-backed settings keys).

### Explicitly deferred (allowed to be NOT done)
- External RSS ingestion automation
- AI generation execution
- Scheduled auto-publish runner/cron

---

## 3) Current-State Audit Findings (Implementation)

### 3.1 UI entry points
- Admin: `src/app/admin/news-engine/page.tsx` → `src/components/news-engine/AdminNewsEngineHub.tsx`
- Public:
  - `src/app/news/page.tsx`
  - `src/app/news/[slug]/page.tsx`
- Home page section using stubs:
  - `src/components/NewsSection.tsx`

### 3.2 Source of truth (critical)
- The UI reads/writes the News Engine state from `localStorage`:
  - `src/lib/ui-stubs/news-engine.ts` (`solarmatch.newsEngine.v1`)

### 3.3 Backend/API reality
- No route handlers exist for:
  - `src/app/api/news/**/route.ts`
  - `src/app/api/admin/news-engine/**/route.ts`

### 3.4 Prisma/DB reality
- `prisma/schema.prisma` does not contain News Engine models.

---

## 4) Feature Matrix (Original Plan → UI → API → DB)

Status meaning:
- **OK** = complete E2E (UI → API → DB → UI)
- **Missing** = E2E missing (even if UI exists)
- **Changed** = behavior differs from original plan and needs justification

| User Action/Story | UI Element (Current Repo) | API Endpoint (Current Repo) | DB Model/Field (Current Repo) | Status |
|---|---|---|---|---|
| Admin opens News Engine | `/admin/news-engine` | — | — | OK (UI only; E2E not applicable) |
| View dashboard list/KPIs | Dashboard tab | — | — | Missing (no API/DB) |
| Open draft review | Review modal | — | — | Missing (no API/DB) |
| Edit headline/body | Review modal (inputs/textarea) | — | — | Missing (not persisted) |
| Publish Now (typed confirm) | Confirmation + review flow | Planned: `POST /api/admin/news-engine/items/[id]/publish-now` | Planned: `NewsItem.status`, `publishedAt`, `slug` | Missing |
| Schedule publish | Schedule modal | Planned: `POST /api/admin/news-engine/items/[id]/schedule` | Planned: `NewsItem.status`, `scheduledFor` | Missing |
| Reject item with reason | Reject modal | Planned: `POST /api/admin/news-engine/items/[id]/reject` | Planned: `rejectedAt`, `rejectionReason` | Missing |
| Request rewrite | Rewrite modal | Planned: `POST /api/admin/news-engine/items/[id]/rewrite-request` | Planned: audit metadata | Missing |
| Create manual draft | Manual Draft modal | Planned: `POST /api/admin/news-engine/items` | Planned: `NewsItem` | Missing |
| Pause/Resume/Emergency stop | Header + Confirmation modal | Planned: `/api/admin/news-engine/pipeline/*` | Planned: settings keys | Missing |
| Manage sources | Sources tab + Add/Edit Source modal | Planned: `/api/admin/news-engine/sources` | Planned: `NewsSource` | Missing |
| Automation rules/windows | Automation Logic tab + OperationalRuleModal | Planned: `/api/admin/news-engine/automation/*` | Planned: `NewsAutomationRule` + settings keys | Missing |
| View audit logs + details | Audit Logs tab + PromptDetails/LogDetails | Planned: `GET /api/admin/news-engine/audit-logs` | Planned: `NewsAuditLog` | Missing |
| Export audit CSV | Audit Logs export helper | — | — | Changed (UI-only export; OK for UI, Missing for E2E persistence) |
| Settings persist | Settings tab | Planned: `GET/PUT /api/admin/news-engine/settings` | Planned: `Settings` table keys | Missing |
| Public list published | `/news` page | Planned: `GET /api/news` | Planned: `NewsItem` | Missing |
| Public details by slug | `/news/[slug]` page | Planned: `GET /api/news/[slug]` | Planned: `NewsItem.slug` | Missing |
| Homepage “Latest News” | `NewsSection` | Planned: `GET /api/news` | Planned: `NewsItem` | Missing |

---

## 5) Gap / Drift Analysis

### 5.1 E2E blockers (must fix)
- **No Prisma schema for News Engine** → cannot persist anything.
- **No API routes** → UI cannot call backend.
- **UI still coupled to localStorage stubs** → even if backend is built, the UI won’t use it until cutover.

### 5.2 Drift from original plan (needs explicit sign-off)
The original plan emphasizes frontend-first, with backend attached later. That part is consistent.

However, the original plan includes “Test & Preview” and implies AI token usage. Current UI shows token usage text in Test & Preview, but **backend plan explicitly defers AI execution**. This is acceptable only if documented as:
- **UI test mode is a simulation in Phase 1**
- AI execution and token consumption are Phase 2

### 5.3 Intent alignment check
- Admin control surfaces in the original plan broadly match the V6-derived UI tabs that exist now.
- The feature’s true end result is still achievable, but only if the implementation proceeds through:
  - Backend (US1–US3) **and**
  - In-app wiring/cutover (US4)

---

## 6) E2E Testing Checklist (Acceptance)

These are the tests that must pass before calling the feature “Done”.

### Public
- `/news` loads via `GET /api/news` and shows only `PUBLISHED` and `deletedAt IS NULL`.
- `/news/[slug]` returns 404 for non-existent/unpublished/soft-deleted items.

### Admin
- Create manual draft → appears in admin list.
- Publish now (with typed confirm) → sets `publishedAt`, generates slug if missing.
- Schedule → validates future datetime; sets `SCHEDULED` + `scheduledFor`.
- Reject → sets `REJECTED` + reason.
- Rewrite request → writes audit entry with note; item remains editable.
- Pipeline pause/resume/emergency stop updates persisted pipeline status.
- Sources CRUD persists.
- Automation config/rules persist.
- Audit logs endpoint returns entries with pagination + filters.

### Stub elimination (hard requirement)
- Admin and public pages do **not** use `src/lib/ui-stubs/news-engine.ts` as the data source in the final E2E path.

---

## 7) Verification Gates (Repo)

- `npx prisma validate`: **PASS** (validated on 2026-01-04)
- `npx tsc --noEmit`: **PASS** (no errors output on 2026-01-04)
- `npm run build`: **PASS** (most recent run in this session showed exit code 0)

---

## 8) Action Plan (How to Reach True E2E, No Partials)

Use the existing execution tracker:
- `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/tasks.md`

Minimum sequence to reach E2E:
1) Phase 2 (Foundational): Prisma models + migrations + server helpers
2) US1: Public read endpoints (`/api/news`, `/api/news/[slug]`)
3) US2: Admin item lifecycle endpoints (create/edit/publish-now/schedule/reject/rewrite-request)
4) US3: Pipeline, sources, automation, audit logs, settings endpoints
5) US4: UI cutover (remove localStorage as source of truth)
6) Phase 7: Run gates + manual smoke tests

---

## 9) Unknowns (Must be Confirmed if They Block Implementation)

- None identified that block starting backend work, because `tasks.md` already defines a safe, staged approach.

If you want “zero surprises”, the next best step is to treat US4 (UI cutover) as part of the same delivery milestone as US1–US3, so you do not stop at a backend that the UI is not using.
