# BLOG — Feature SOT (Phases 0–6)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2026-01-05

**Canonical Notice**: This is the canonical SOT for the BLOG feature. All planning and implementation must align to this file.

**Inputs**:
- Raw plan: `DOC/FEATURES/BLOG/RAW PLAN/Initial_idea.md`
- Index: `DOC/FEATURES/BLOG/SOT/INDEX.md`

**Required pre-implementation docs (must exist and be approved):**
- `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md`
- `DOC/FEATURES/BLOG/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/FEATURES/BLOG/SOT/tasks.md`

---

## PHASE 0 — Context & Legacy Audit (Required)

### Why audit is required
This feature exists inside an **already-running SaaS repo**. Per the legacy-safe framework, we must audit what already exists so we do not re-design or break working blog flows.

### Current state (confirmed in code)
See `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`.

High-level confirmation:
- Public blog routes exist: `/blog`, `/blog/post` (legacy compatibility), `/blog/[slug]`.
- Admin blog surfaces exist: `/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]`, `/admin/blog/[id]/preview`, plus taxonomy pages.
- Public + admin APIs exist under `/api/blog/*` and `/api/admin/blog/*`.
- n8n webhook endpoints exist under `/api/webhooks/n8n/blog/*`.
- Blog Prisma models exist: `BlogPost`, `BlogCategory`, `BlogTag`, `BlogPostTag`, `BlogAiRequestLog`, `BlogJobLog`.

### Locked / do-not-break areas
- Do not break public `/blog` listing, or the legacy `/blog/post` sessionStorage-driven behavior.
- Do not break admin blog CRUD routes and their auth (admin-only).
- Do not expose any AI keys client-side.

### Scope clarification (important)
The raw plan includes **Blog + News + Newsletter** ideas.
- This SOT covers **BLOG only**.
- News (RSS feeds, government announcements) must be planned separately under a News feature folder.
- Newsletter must be planned separately under a Newsletter feature folder.

---

## PHASE 1 — Vision & Problem Statement (WHY)

### Vision
Operate a modern, SEO-friendly blog inside SolarMatch that can be managed by admins with **minimal manual effort**, leveraging **AI drafting + automation** safely.

### Problem being solved
- Admin needs a structured way to create, edit, schedule, and publish posts.
- Public needs fast, shareable, indexable blog pages.
- AI/automation must reduce admin workload without compromising safety.

### Target users
- Public visitors (read/search/browse)
- Admin/editor (create, review, schedule, publish)
- Automation actors (n8n webhooks) for draft/schedule/publish

### Success criteria
- Stable blog URLs and SEO metadata.
- Admin can manage content lifecycle reliably.
- Automation actions are authenticated and auditable.
- AI generation is rate-limited, logged, and server-side only.

---

## PHASE 2 — User Stories (WHAT, not how)

### Public visitor
- As a visitor, I can browse blog posts.
- As a visitor, I can open a post by a stable URL (slug route).
- As a visitor, I can share a post (minimum: copy link).
- As a visitor, I can discover related or relevant posts (MVP: category browsing; tags optional).

### Admin/editor
- As an admin, I can create/edit blog posts.
- As an admin, I can keep posts as drafts.
- As an admin, I can schedule posts for a future time.
- As an admin, I can publish/unpublish/archive posts.
- As an admin, I can manage categories and tags.
- As an admin, I can generate a draft (title/body/SEO/category/tags) using AI, then review/edit.

### Automation (n8n)
- As n8n, I can create drafts via an authenticated webhook.
- As n8n, I can schedule a post via an authenticated webhook.
- As n8n, I can trigger the publish scheduler to publish due posts.

### Explicit exclusions (for this SOT unless later approved)
- RSS news ingestion (belongs to News feature).
- Newsletter campaign management (belongs to Newsletter feature).
- Public comments and moderation system.

---

## PHASE 3 — Feature Scope & Modules

### Module A — Public Blog
- Listing + post detail pages with SEO metadata.
- Legacy compatibility for `/blog/post` while canonical slug pages exist.

### Module B — Admin Blog
- Admin post CRUD.
- Taxonomy management (categories/tags).
- Preview workflow.

### Module C — Backend Persistence
- Prisma-backed `BlogPost` / taxonomy models.

### Module D — AI Drafting
- Admin-only AI generation endpoint.
- Logging + rate limiting.

### Module E — Automation (n8n)
- Authenticated webhooks for draft/schedule/publish scheduler.
- Job logs for auditing.

---

## PHASE 4 — System & Flow Design (How it works, no code)

### Content lifecycle (minimum)
`DRAFT → SCHEDULED → PUBLISHED → ARCHIVED`

### Public reading flow
1. Visitor opens `/blog`.
2. Visitor clicks a post.
3. Visitor reads via `/blog/[slug]` (deep-link safe).
4. Legacy route `/blog/post` remains supported for existing sessionStorage navigation.

### Admin authoring flow
1. Admin creates draft.
2. Admin edits title/body/SEO/category/tags.
3. Admin previews.
4. Admin schedules or publishes.

### n8n automation flow
1. n8n calls webhook(s) to create drafts or schedule posts.
2. n8n triggers scheduler webhook to publish due posts.
3. Each automation job is logged (success/failure).

### AI drafting flow (admin-only)
1. Admin submits topic + optional constraints.
2. Server calls AI provider using server-held key.
3. Response is parsed into structured fields.
4. Request is rate limited and written to an audit log.

---

## PHASE 5 — Technical Design (Only after approval)

This phase must be a delta-based design against what already exists.

Minimum technical design outputs (to be finalized after approval):
- DB changes: only if needed (prefer reuse of existing blog models).
- API contracts: document request/response schemas for admin + public APIs + n8n webhooks.
- Frontend: route list + component boundaries per `Frontend-Plan.md`.
- AI: prompt contract, logging fields, safety rules.

---

## PHASE 6 — Legacy-Aware Development Execution Plan

### Strategy
- Prefer incremental changes.
- Freeze stable existing blog flows.
- Extend via existing APIs/components.

### Mandatory checkpoints
- Reconfirm current-state audit accuracy.
- Validate auth boundaries (admin-only routes, webhook secrets).
- Validate slug routing compatibility (`/blog/post` → `/blog/[slug]`).

### Stop rules
- If implementation requires breaking existing public blog navigation, stop and seek explicit approval.
- If new work requires schema-breaking migrations, stop and produce a migration plan + rollback.
