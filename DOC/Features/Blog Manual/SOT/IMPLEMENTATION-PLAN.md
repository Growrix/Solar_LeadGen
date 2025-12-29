# Implementation Plan — Blog Manual (Docs-Only, Pre-Approval)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-29

This plan defines *what we implement first*, sequencing, validation checks, and stop rules.

Derived from:
- `DOC/Features/Blog Manual/PLAN/mainplan.md`
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md`
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`

---

## 0) Stop Rules (Non‑Negotiable)

- No database migrations until the frontend-first milestone is approved.
- No AI endpoints until admin auth patterns are confirmed.
- No breaking changes to guest browsing (`/blog`) and existing entrypoints.

---

## 1) Milestones (Incremental, Legacy‑Safe)

### Milestone A — Freeze Baseline (Docs)
**Goal**: Lock the as-is behavior so implementation doesn’t accidentally drift.

**Work**
- Treat `CURRENT-UI-AUDIT-GUEST-BLOG.md` as baseline contract.
- Confirm whether Phase 1 changes routing or preserves `/blog/post` temporarily.

**Acceptance**
- You approve the baseline and the “intentional changes list.”

### Milestone B — Frontend-First Canonical Routing (Optional; requires approval)
**Goal**: Move from sessionStorage-only detail pages to stable deep-linkable pages.

**Two safe options (choose one):**

Option 1 (Conservative)
- Keep `/blog` → `/blog/post` behavior for Phase 1.
- Defer canonical `/blog/[slug]` to after backend is available.

Option 2 (Recommended per plan)
- Add `/blog/[slug]` backed by seed/mock adapter.
- Update `/blog` cards to navigate by slug.
- Keep `/blog/post` as compatibility during transition.

**Acceptance**
- No regressions to `/blog`.
- If `/blog/[slug]` exists: refresh works and does not require sessionStorage.

### Milestone C — Public SEO Metadata (Frontend)
**Goal**: Ensure routes provide correct metadata for indexing and sharing.

**Acceptance**
- Title/description/OG metadata present for list and detail pages.

### Milestone D — Admin UI Scaffolding (Mocked)
**Goal**: Create admin UX flows (draft → preview → schedule/publish) without DB first.

**Acceptance**
- Admin pages render and allow the workflow in mocked mode.

### Milestone E — Backend Foundations (Post-Approval)
**Goal**: Add Prisma models and APIs for persistence.

**Acceptance**
- Posts stored in DB.
- Public reads use DB.
- Admin CRUD uses server validation.

### Milestone F — AI Drafting (Post-Approval)
**Goal**: Admin-only AI endpoints and editor integration.

**Acceptance**
- Keys are server-only.
- Requests are logged/auditable.

### Milestone G — Scheduling + n8n Automation (Post-Approval)
**Goal**: Publish scheduled posts reliably and integrate automation.

**Acceptance**
- Scheduling source-of-truth chosen.
- Webhooks authenticated.
- Job logs exist.

---

## 2) Risks & Dependencies

- Slugs: seed data has no slug; we must define deterministic slug rules.
- Admin auth/roles: must match existing system (no assumptions).
- Markdown rendering: needs a safe approach (no unsafe HTML by default).

---

## 3) Hand-off

Execution checklist lives in:
- `DOC/Features/Blog Manual/SOT/tasks.md`

No code changes should begin until you approve this file and the Frontend Plan.
