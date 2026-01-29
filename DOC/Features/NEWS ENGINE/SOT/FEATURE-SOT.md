# NEWS ENGINE — Admin + Public — Feature SOT (Phases 0–6)

- Status: Baseline implemented; Enhancement planning active (2026-01-07)
- Owner: AI (GitHub Copilot / GPT-5.2) + Human Owner

This file is the canonical **Feature SOT** for the News Engine feature (Legacy-safe 6-phase framework).

Links (start here):
- Index / restart point: `INDEX.md`
- Current-state implementation audit (authoritative for “what exists”): `../Audit Reports/news-engine-inventory-mapping-audit-2026-01-07.md`
- Enhancement plan (AI/Automation/Admin deep control): `../Plan/AI-AUTOMATION-ADMIN-ENHANCEMENT-PLAN-2026-01-07.md`
- AI/Automation SOT addendum: `AI-AUTOMATION-ADMIN-SOT-ADDENDUM.md`

Framework + SOP:
- Framework: `../../GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`
- Prototype-first frontend workflow: `../../GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md`
- Admin UI prompts (step-by-step): `../Fontend UI UX Prompts/frontend-plan-admin.md`
- Public UI prompts (step-by-step): `../Fontend UI UX Prompts/frontend-plan-public.md`

---

# PHASE 0 — CONTEXT & LEGACY AUDIT (Existing Project → Audit Required)

## 0.1 Project context (what exists now)

This repo is an existing Next.js application.

For News Engine specifically, there is a working implementation in this repo (UI + API + DB). The best “what exists” map is the current-state audit:
- `../Audit Reports/news-engine-inventory-mapping-audit-2026-01-07.md`

The Google AI Studio V6 export still exists and remains the **UI reference**:
- Prototype folder: `../GoogleAIStudio UI UX/ai-news-engine-admin- V6/`

Known V6 surfaces (also implemented as Next.js components/routes):
- Admin views (tabbed): Dashboard, Drafts & Reviews, Audit Logs, Master Control, Automation Logic, Sources, Settings
- Public views: Public News Listing, Public News Details
- Modals: Review, Scheduling, Test & Preview, Manual Draft, Rewrite, Reject, Source (add/edit), Confirmation, Prompt Details

## 0.2 Supporting documentation already present

UX plans (prototype-first):
- Admin UI plan: `../Fontend UI UX Prompts/frontend-plan-admin.md`
- Public UI plan: `../Fontend UI UX Prompts/frontend-plan-public.md`

V6 prototype audit:
- `../Audit Reports/prototype-audit-google-ai-studio-uiux-V6.md`

## 0.3 Locked / do-not-touch areas

- No explicit “do-not-touch” areas were provided for this feature.
- Since this is an existing project, implementation must be incremental and avoid refactors unless explicitly approved.

## 0.4 Gaps / risks surfaced by the V6 inventory

- Prototype export is a UX reference and may contain affordances not fully implemented.
- Some backend semantics (cron wiring, scheduling behavior) are implementation-defined; see Phase 5 for current baseline and Phase 6 for enhancement alignment.

---

# PHASE 1 — VISION & PROBLEM STATEMENT (WHY)

## Feature vision
Provide an admin control center (“News Engine Hub”) that turns sources + AI research into publishable news/insights with human oversight, and a public reading experience that shows only published content.

## Target users
- Admin editors/operators (internal)
- Public visitors (guest readers)

## Problem being solved
- Admins need a single place to monitor pipeline status, review drafts, enforce safety gates, and publish or schedule content.
- Public users need a clean feed + details page for published content.

## Success criteria
- Admin can move an item through key lifecycle steps (draft/review/schedule/publish) with auditability.
- Public pages show only published items and display publish dates consistently.
- Safety controls exist (pause/resume/emergency stop + publish confirmations).

---

# PHASE 2 — USER STORIES (WHAT, NOT HOW)

## Admin
- As an Admin, I can view a dashboard of recent items and pipeline health.
- As an Admin, I can review an item and decide to publish, schedule, request rewrite, reject, or save edits.
- As an Admin, I can configure sources and research rules.
- As an Admin, I can configure automation rules and publishing windows.
- As an Admin, I can globally pause/resume the pipeline and perform an emergency stop.
- As an Admin, I can see an audit trail of system/admin actions and view prompt context when available.

## Public
- As a Public user, I can browse published posts.
- As a Public user, I can open a published post by slug.
- As a Public user, I can share/copy a link to a post.

## System / AI
- As the System, I can record audit entries for AI generations and admin actions.
- As the System, I can represent content lifecycle states (including error/rejected) for operational visibility.

Explicit exclusions (until approved in Phase 5):
- No new AI providers, key vault, model router, rules engine semantics, or publish windows v2 unless explicitly implemented as part of the enhancement plan.

---

# PHASE 3 — FEATURE SCOPE & MODULES

## Module A — Admin Hub (UI)
- Dashboard (KPI + filters + items list)
- Drafts & Reviews (board/queue)
- Review modal flow (publish/schedule/rewrite/reject/save)

## Module B — Sources & Research (UI)
- RSS source manager (add/edit/toggle)
- Research toggles + weights
- Research rules panel

## Module C — Automation Logic (UI)
- Core toggles (auto draft, auto schedule, auto publish)
- Operational rules editor
- Publish window configuration

## Module D — Master Control (UI)
- Global status (nominal/paused/emergency)
- Pause/resume/emergency stop confirmation gating
- Subsystem health toggles (UI only)

## Module E — Audit Trail (UI)
- Logs table + filters
- Prompt details modal when a log has prompt context

## Module F — Public News (UI)
- Listing page
- Details page by slug
- Share modal

## Module G — API + DB (Implemented Baseline)
- Public read API (`/api/news`, `/api/news/[slug]`)
- Admin API (`/api/admin/news-engine/*`) for items/sources/research/pipeline/automation/audit
- Internal automation runner (`/api/internal/news-engine/automation/run`) guarded by a secret header
- Prisma models/enums + migrations for News Engine entities

---

# PHASE 4 — SYSTEM & FLOW DESIGN (HOW IT WORKS)

## 4.1 Core lifecycle states (UI contract)

Implemented lifecycle states (Prisma enum `NewsItemStatus`) are:
- DRAFT
- NEEDS_REVIEW
- RESEARCH_DONE
- DRAFT_READY
- PUBLISHED
- SCHEDULED
- REJECTED
- ERROR

## 4.2 Admin flows (behavioral)

Primary review flow:
1) Admin selects an item from dashboard or drafts board.
2) Review modal opens.
3) Admin can:
   - Publish now (requires typed confirm; sets `Published` + `publishedAt`).
   - Approve for scheduling (opens scheduling modal; sets `Scheduled`).
   - Request rewrite (opens rewrite modal; moves item back to a draft/rewrite state).
   - Reject (opens reject modal; sets `Rejected` + reason).
   - Save edits (records manual save; sets `Draft Ready`).

Sources flow:
- Admin adds/edits/toggles RSS sources via Source modal.

Automation flow:
- Admin edits automation toggles and constraints (min score, daily limits, publish windows).

Global control flow:
- Admin pauses/resumes pipeline (confirmation gated).
- Admin performs emergency stop (confirmation gated + stronger warning).

Audit flow:
- Admin can inspect log entries.
- If a log has prompt context, Admin can open Prompt Details modal.

## 4.3 Public flows
- Listing shows only `Published` items.
- Details page loads by `slug`.
- Share modal can copy/share the URL.

## 4.4 Error & fallback behaviors (UI-level)
- Loading states: skeletons across pages.
- Empty states: clear messaging per page.
- Public not-found state for invalid slug.

---

# PHASE 5 — TECHNICAL BASELINE (IMPLEMENTED AS OF 2026-01-07)

This phase documents the current implementation baseline so enhancements can be built safely.

Authoritative inventory for this baseline:
- `../Audit Reports/news-engine-inventory-mapping-audit-2026-01-07.md`

## 5.1 Routes (UI)
- Admin hub: `/admin/news-engine`
   - Entry: `src/app/admin/news-engine/page.tsx`
   - Hub: `src/components/news-engine/AdminNewsEngineHub.tsx`
- Public list: `/news` (`src/app/news/page.tsx`)
- Public details: `/news/[slug]` (`src/app/news/[slug]/page.tsx`)

## 5.2 API surfaces
- Public read:
   - `GET /api/news`
   - `GET /api/news/[slug]`
- Admin (guarded by `requireAdmin()`):
   - Items CRUD + item actions (schedule, publish-now, reject, rewrite-request, regenerate, purge)
   - Sources CRUD + RSS sync + entries list + sources config
   - Research sync + AI draft from research + test preview
   - Pipeline status + pause/resume/emergency-stop
   - Automation config + run-now + operational rules CRUD
   - Audit logs list
- Internal runner:
   - `POST /api/internal/news-engine/automation/run`
   - Secret header: `x-news-engine-cron-secret` matching env `NEWS_ENGINE_CRON_SECRET`

## 5.3 Core backend helpers
- `publishDueScheduledNewsItems()` in `src/lib/news-engine/publish-due.ts`
   - Best-effort auto-publishes due scheduled items.
- `writeNewsAuditLog()` in `src/lib/news-engine/audit.ts`
- Settings wrappers in `src/lib/news-engine/settings.ts` (backed by `src/lib/services/settings-service`)

## 5.4 Data model (Prisma)
News Engine models/enums live in `prisma/schema.prisma` and are created/extended by News Engine migrations.

Key models:
- `NewsItem`, `NewsSource`, `NewsSourceEntry`, `NewsResearchEntry`
- `NewsAutomationRule`, `NewsJobLog`, `NewsAiRequestLog`, `NewsAuditLog`

## 5.5 Known behavioral notes / risks (baseline)
- Scheduled publishing is opportunistic (triggered by select GET endpoints) and depends on traffic and/or the internal runner.
- Cron wiring is external to the repo (runner exists; scheduler/host invoking it is not part of codebase).
- Public pages are client-rendered; SEO/TTFB depend on client fetch behavior.
- `contentHtml` is stored and served; content safety/sanitization assumptions should be validated separately.

---

# PHASE 6 — LEGACY-AWARE DEVELOPMENT EXECUTION PLAN

This repo already contains working functionality unrelated to News Engine; execution must be incremental.

Recommended execution sequence (when implementation begins):
1) Reconfirm Phase 0 constraints (what exists, what is safe to extend).
2) Lock this SOT (set Status to `Locked (Approved)`) once you approve scope.
3) Treat V6 prototype as the UI reference; use the Admin/Public UI prompt docs as the build spec.
4) Implement public `/news` read-only surfaces first (lowest-risk), then admin shells, then admin modals.
5) Add audit trail wiring and safety gates before enabling any publish automation.

Verification / readiness:
- V6 prototype audit indicates E2E publish → public flow is ready at the UI level.
- If this SOT remains aligned with the existing Admin/Public UI plans, no additional prototype enhancement plan is required.

## 6.1 Enhancement alignment (AI/Automation/Admin deep control)

Planned work for the next enhancement cycle is defined here:
- `../Plan/AI-AUTOMATION-ADMIN-ENHANCEMENT-PLAN-2026-01-07.md`
- `AI-AUTOMATION-ADMIN-SOT-ADDENDUM.md`

Implementation sequencing (as stated in the plan):
- Phase A — Observability first (trust)
- Phase B — Publish windows v2
- Phase C — Rules engine v2
- Phase D — Research decisioning
- Phase E — Model router + multi-key
- Phase F — AI image generation

Non-goal for Phase 2 SOT update:
- This SOT update records baseline + planned scope; it does not itself implement or redesign the feature.
