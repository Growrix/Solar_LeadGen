# Blog Manual — Feature SOT (Phases 0–6)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-29

**Canonical Notice**: This is the canonical SOT for the Blog Manual feature. All planning and future coding must align to this file.

**Inputs**:
- Plan (main): `DOC/Features/Blog Manual/PLAN/mainplan.md`
- Plan (raw): `DOC/Features/Blog Manual/PLAN/RawPlan.md`
- Index: `DOC/Features/Blog Manual/SOT/INDEX.md`

**Required pre-implementation docs (must exist and be approved):**
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md`
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`
- `DOC/Features/Blog Manual/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/Features/Blog Manual/SOT/tasks.md`

---

## PHASE 0 — Context & Legacy Audit (Required)

### Why audit is required
This is a new feature expansion inside an existing SaaS repo. Per the legacy-safe 6-phase framework, we must audit current behavior first to avoid breaking existing UI.

### Current state (confirmed in code)
See `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md`.

Summary:
- Existing guest blog UI exists at `/blog` and `/blog/post`.
- Navigation relies on `sessionStorage`.
- Seed data has no slug/body.
- Post body is mostly hard-coded.

### Plan audit (deep) — what the plan gets right
The plan in `PLAN/mainplan.md` is directionally strong:
- Clear MVP boundaries (not a full CMS).
- Sensible lifecycle statuses: `DRAFT → IN_REVIEW → SCHEDULED → PUBLISHED → ARCHIVED`.
- Strong security guardrails for AI (server-only keys, admin-only).
- Good integration strategy options for scheduling and n8n.

### Plan audit (deep) — gaps that must be resolved before coding
These are “decision points” that the plan mentions but does not fully lock down. They must be explicitly approved so implementation does not drift.

1) **Canonical URL + legacy route strategy**
- Plan prefers `/blog/[slug]`.
- Current UI uses `/blog/post` with `sessionStorage`.
- Decision needed: compatibility strategy for `/blog/post` (keep as legacy, redirect, or support both temporarily).

2) **Content format and rendering**
- Plan recommends Markdown-in-DB (Option A).
- Decision needed: the markdown renderer approach and a safety stance (no unsafe HTML by default).

3) **Slug generation and uniqueness**
- Seed data has no slug.
- Decision needed: slug rules (unique, deterministic, collision handling).

4) **Admin roles mapping**
- Plan proposes `ADMIN/EDITOR/AUTHOR/VIEWER`.
- Decision needed: map to existing auth/roles system in this repo (no assumptions).

5) **Scheduling mechanism source-of-truth**
- Plan offers Vercel cron vs n8n scheduling.
- Decision needed: MVP choice and where publish-job logs live.

6) **Comments scope clarity**
- Current UI includes a client-only demo comments flow.
- Plan lists full comments as “Later.”
- Decision needed: keep demo comments (as-is), make read-only, or hide.

### Locked / do-not-break areas
- Do not break guest navigation, header/footer behaviors, or existing `/blog` entry points.
- No DB migrations until the frontend-first approach is approved.

### Open questions (approval required)
These were locked on **2025-12-30** and are no longer open questions:

1) **Routing choice**
- Canonical detail route is `/blog/[slug]`.
- `/blog/post` remains as a compatibility route that attempts to redirect using the existing `sessionStorage` payload.

2) **Search + category filter controls**
- Exposed in `/blog` UI for MVP.

3) **Comments scope**
- Demo comments UI is **hidden** for MVP (no public comments feature yet).

4) **Slug rules**
- Slugify algorithm: lowercased, trimmed, quotes removed, non-alphanumerics to `-`, collapse `-`, trim `-`.
- Uniqueness: enforced at DB level (unique `slug`).
- Create behavior: if slug collides, auto-suffix `-2`, `-3`, ... until unique.
- Update behavior: if admin explicitly sets a colliding slug, return conflict (no auto-suffix on edits).

5) **Scheduling mechanism**
- MVP uses **n8n-driven scheduling** calling authenticated webhooks (shared secret in env).
- A scheduler runner endpoint publishes due scheduled posts and writes a job log entry.

---

## PHASE 1 — Vision & Problem Statement (WHY)

### Vision
Build a production-grade blog inside the SolarMatch SaaS that is SEO-friendly, admin-managed, and extensible to AI drafting + automation.

### Problem being solved
- Current blog is seed-only and not scalable.
- Current detail pages are not deep-link friendly.
- Admin needs a controlled publishing workflow.
- AI and automation must be governed with strict safety.

### Target users
- Public visitors (read content)
- Admin/editor (create, review, schedule, publish)
- Automation system (publishes scheduled posts; triggers workflows)

### Success criteria
- Stable, indexable blog URLs.
- Admin can draft/schedule/publish reliably.
- No client exposure of AI keys.
- Automation is authenticated and auditable.

---

## PHASE 2 — User Stories (WHAT, not how)

### Public visitor
- As a visitor, I can browse blog posts.
- As a visitor, I can open a post via a stable URL.
- As a visitor, I can discover content via categories/tags (MVP: categories; tags optional).
- As a visitor, I see SEO metadata that matches the post.

### Admin/editor
- As an admin/editor, I can create a draft.
- As an admin/editor, I can edit post content and SEO fields.
- As an admin/editor, I can preview.
- As an admin/editor, I can schedule and publish.

### System automation
- As the system, I can publish scheduled posts on time.
- As the system, I can log success/failure.

### AI drafting (admin-controlled)
- As an admin, I can generate a draft outline/body and SEO fields from inputs.
- As an admin, I can regenerate sections without exposing keys client-side.

### n8n integration
- As n8n, I can create drafts/schedules via authenticated webhooks.

### Explicit exclusions (unless later approved)
- Full CMS media library with folders.
- Public comment system with moderation.
- Multi-tenant per-organization blogs.

---

## PHASE 3 — Feature Scope & Modules

### Module A — Public Blog (Guest)
- Migrate towards stable canonical URLs.
- Preserve existing UI baseline unless explicitly approved for change.

### Module B — Admin Blog UI
- Admin dashboard, editor, preview, status transitions.

### Module C — Backend Persistence
- Prisma models + APIs + public reads.

### Module D — AI Assistant
- Admin-only server endpoints; auditability.

### Module E — Automation (Scheduling + n8n)
- Scheduled publishing + job logs.
- Authenticated webhooks for automation.

---

## PHASE 4 — System & Flow Design (How it works, no code)

### Content lifecycle
`DRAFT → IN_REVIEW → SCHEDULED → PUBLISHED → ARCHIVED`

### Public reading flow
1. Visitor opens `/blog`.
2. Visitor opens a post detail page via stable URL.
3. SEO metadata renders from post fields.

### Admin authoring flow
1. Admin creates a draft.
2. Admin edits content + SEO fields.
3. Admin previews.
4. Admin schedules or publishes.

### Scheduled publishing flow
1. Scheduler runs on an interval.
2. Finds due scheduled posts.
3. Publishes atomically.
4. Writes a publish audit entry.

### AI drafting flow (admin-only)
1. Admin provides topic/keywords/tone/constraints.
2. System generates draft + SEO fields.
3. Draft saved for human review.

---

## AI Prompt Contract + Guardrails (T023)

**Purpose**: Generate a safe blog draft and SEO fields for an admin to review and edit.

**Inputs (admin-provided)**
- Topic
- Keywords (optional)
- Tone (optional)
- Target audience (optional)
- CTA (optional)

**Outputs (server returns JSON)**
- `title`
- `excerpt`
- `content` (markdown/plain text)
- `seoTitle`
- `seoDescription`
- `category`
- `tags[]`
- `readTime`

**Guardrails**
- Admin-only endpoint; API keys never exposed client-side.
- Basic rate limiting per admin user.
- Audit log written for each AI request (success/failure + minimal metadata).
- No unsafe HTML is assumed; content is stored as text.

### n8n flow
1. n8n calls authenticated webhook.
2. System validates auth + idempotency.
3. Creates draft or schedules post.
4. Logs the action for audit.

---

## PHASE 5 — Technical Design (Draft — requires approval before code)

### Data model (draft)
Proposed new Prisma models (finalized only after checking existing `schema.prisma` patterns):
- BlogPost
- BlogCategory
- BlogTag (+ many-to-many post tags)
- BlogPostRevision (optional)
- BlogJob / BlogAuditLog (optional but recommended)

### API surface (draft)
- Public:
  - `GET /api/blog/posts` (published only)
  - `GET /api/blog/posts/[slug]`
- Admin:
  - `POST /api/admin/blog/posts`
  - `PATCH /api/admin/blog/posts/[id]`
  - `POST /api/admin/blog/posts/[id]/schedule`
  - `POST /api/admin/blog/posts/[id]/publish`
  - `POST /api/admin/blog/posts/[id]/archive`
- AI:
  - `POST /api/admin/blog/ai/generate`
- Webhooks:
  - `POST /api/webhooks/n8n/blog/create-draft`
  - `POST /api/webhooks/n8n/blog/schedule`

### Security constraints (non-negotiable)
- AI keys are server-only.
- Admin endpoints enforce role checks server-side.
- Webhooks require secret auth (+ optional signature/timestamp).

---

## PHASE 6 — Legacy-Aware Development Execution Plan (Docs-only)

> Execution details live in `IMPLEMENTATION-PLAN.md` and `tasks.md`. No coding starts until you approve them.

### Step 1 — Freeze baseline
- Treat `CURRENT-UI-AUDIT-GUEST-BLOG.md` as the baseline contract.

### Step 2 — Frontend-first
- Implement stable routing (per approved frontend plan) without DB changes.

### Step 3 — Admin UI scaffolding
- Build admin UX mocked first.

### Step 4 — Backend foundations
- Add Prisma models + APIs.

### Step 5 — AI drafting
- Add admin-only generation endpoints.

### Step 6 — Automation
- Add scheduling + n8n integration + audit logs.

### Rollback stance
- Any step must be reversible without breaking `/blog` guest browsing.
