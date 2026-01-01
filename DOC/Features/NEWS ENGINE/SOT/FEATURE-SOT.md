# NEWS ENGINE — AI News Engine (Admin + Public) — Feature SOT (Phases 0–6)

- Status: Draft (Generated from V6 prototype + existing UX plans)
- Owner: AI (GitHub Copilot / GPT-5.2) + Human Owner

This file is the canonical **Planning SOT** for the News Engine feature (Legacy-safe 6-phase framework).

Links:
- Index / restart point: `INDEX.md`
- Framework: `../../GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`
- Prototype-first frontend workflow: `../../GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md`
- Admin UI prompts (step-by-step): `../Fontend UI UX Prompts/frontend-plan-admin.md`
- Public UI prompts (step-by-step): `../Fontend UI UX Prompts/frontend-plan-public.md`

---

# PHASE 0 — CONTEXT & LEGACY AUDIT (Existing Project → Audit Required)

## 0.1 Project context (what exists now)

This repo is an existing Next.js application.

For News Engine specifically, there is a **standalone prototype export** (Google AI Studio V6):
- Prototype folder: `../GoogleAIStudio UI UX/ai-news-engine-admin- V6/`

Known V6 surfaces (from `App.tsx` + page/modal inventory):
- Admin views (tabbed): Dashboard, Drafts & Reviews, Audit Logs, Master Control, Automation Logic, Sources, Settings
- Public views: Public News Listing, Public News Details
- Modals: Review (draft review), Scheduling, Test & Preview, Manual Draft, Rewrite, Reject, Source (add/edit), Confirmation, Prompt Details, Share

Audit scope constraint:
- Only V6 is authoritative. Ignore V1–V5.

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

- Prototype export is not necessarily integrated into the Next.js app yet (treat as UX reference, not production code).
- UX documentation must remain the canonical source; prototype may contain extra UI affordances beyond the prompt plans.

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
- No commitments to backend schema/API, automation runners, or external integrations.

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

---

# PHASE 4 — SYSTEM & FLOW DESIGN (HOW IT WORKS)

## 4.1 Core lifecycle states (UI contract)

V6 prototype enumerates these statuses:
- Draft
- Needs Review
- Published
- Scheduled
- Error
- Research Done
- Draft Ready
- Rejected

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

# PHASE 5 — TECHNICAL DESIGN (ONLY AFTER APPROVAL)

## 5.1 Frontend integration targets (high-level)

- Admin UI should ultimately live inside this Next.js application’s admin area.
- Public UI should ultimately map to `/news` and `/news/[slug]` routes.

## 5.2 UI data contracts (high-level)

Minimum UI fields inferred from V6 types:
- News item: `title`, `summary`, `status`, `category`, `relevanceScore`, `aiModel`, `createdAt`, optional `publishedAt`, optional `slug`, `tags`, `sourceType`
- Source: `name`, `url`, `status`, `lastSync`, `articleCount`
- Log: `timestamp`, `action`, `source`, `origin`, `admin`, `status`, optional `promptUsed`

No DB/API design is finalized until Phase 5 is explicitly approved.

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
