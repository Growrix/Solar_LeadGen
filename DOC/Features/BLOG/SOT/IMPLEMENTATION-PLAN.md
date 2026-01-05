# Implementation Plan — BLOG

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2026-01-05

Purpose: define **what we implement next**, in what order, with acceptance checks and stop rules.

Anchors:
- `DOC/FEATURES/BLOG/SOT/FEATURE-SOT.md`
- `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md`

---

## Scope (This plan)

This implementation plan is **legacy-aware** and assumes a BLOG system already exists in code.

Primary goal for the next implementation cycle:
- Stabilize and complete the BLOG feature **as described in the Frontend Plan**, without breaking existing UI.

Out of scope:
- RSS / government feed ingestion (News feature)
- Newsletter automation (Newsletter feature)

---

## Sequencing

1) **Lock current-state audit**
   - Verify all baseline routes/APIs/DB tables listed in `CURRENT-UI-AUDIT-BLOG.md` are correct.

2) **Lock frontend contract**
   - Confirm the required pages/routes and minimum share UX (Copy Link).
   - Confirm `/blog/post` compatibility is preserved.

3) **Validate admin + automation boundaries**
   - Admin-only routes require `requireAdmin()`.
   - n8n webhooks require `N8N_WEBHOOK_SECRET`.
   - AI endpoint requires `OPENAI_API_KEY` and is rate limited + logged.

4) **Implementation (incremental, no regressions)**
   - Prioritize fixes that unblock publishing workflow:
     - Draft creation and editing
     - Scheduling and publishing
     - Public reading pages and SEO metadata

5) **Acceptance checkpoint**
   - Validate all acceptance checks below.

---

## Acceptance Checks

- Public
  - `/blog` renders and lists published posts.
  - `/blog/[slug]` renders post detail and is deep-link safe.
  - `/blog/post` still works as a compatibility route.

- Admin
  - Admin can create/edit a draft.
  - Admin can schedule a post.
  - Admin can preview a post.

- Automation
  - `POST /api/webhooks/n8n/blog/create-draft` works with secret.
  - `POST /api/webhooks/n8n/blog/schedule` works with secret.
  - `POST /api/webhooks/n8n/blog/run-scheduler` publishes due posts and writes job logs.

- AI
  - `POST /api/admin/blog/ai/generate` is admin-only, rate-limited, and logs requests.

---

## Stop Rules

- If a change would break `/blog` or `/blog/post` user-facing behavior, STOP and request explicit approval.
- If a change requires a breaking DB migration, STOP and produce a migration + rollback plan first.
- If a change would expose secrets to the client, STOP and redesign server-side.
