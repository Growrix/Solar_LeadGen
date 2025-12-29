# Blog Manual — Feature SOT (Phases 0–6)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-29

**Canonical Notice**: This is the canonical SOT for the Blog Manual feature. All planning and future coding must align to this file.

**Inputs**:
- Plan (raw): `DOC/Features/Blog Manual/PLAN/RawPlan.md`
- Plan (main): `DOC/Features/Blog Manual/PLAN/mainplan.md`
- Index: `DOC/Features/Blog Manual/SOT/INDEX.md`

**Execution-level docs (pre-implementation)**:
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md`
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`
- `DOC/Features/Blog Manual/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/Features/Blog Manual/SOT/tasks.md`

---

## PHASE 0 — Context & Legacy Audit (Required)

### Why this audit is required
This is a **new feature expansion in an existing SaaS repo**, so planning must start with a legacy audit (per `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`).

### What already exists (confirmed in code)
**Public blog routes (Next.js App Router):**
- `src/app/blog/page.tsx`
  - Client-rendered blog listing.
  - Reads local seed data from `src/data/blogData.ts`.
  - Navigates to `/blog/post` by storing a post object in `sessionStorage`.
- `src/app/blog/post/page.tsx`
  - Client-rendered single-post page.
  - Loads post from `sessionStorage.getItem('currentBlogPost')`.
  - Contains demo comment UI and placeholder auth gating using localStorage.

**Seed data/types:**
- `src/types/blog.ts` defines `Post` fields currently used by the UI.
- `src/data/blogData.ts` contains seeded articles and categories.

**Database:**
- `prisma/schema.prisma` currently has **no blog models** (so blog is not persisted).

### Safe-to-reuse components/behaviors
- Existing blog list UI and card layout are usable as initial reference.
- Existing blog post layout (hero image, metadata, share buttons, author bio, comment section) is a usable baseline.
- The app already treats `/blog` as a guest route in shared layout logic.

### Locked / do-not-break areas (initial)
- Do not break guest navigation, header/bottom-nav behavior, or existing `/blog` entrypoints.
- Do not remove the existing `/blog/post` page until we have a confirmed redirect strategy.

### Gaps vs the plan (deep audit)
The main plan is directionally strong, but the following gaps must be resolved before implementation:

1. **Canonical URL strategy is not fully specified**
   - Plan says `/blog/[slug]` will be canonical, but current site uses `/blog/post` with sessionStorage.
   - Decision needed: how to support opening posts directly (no sessionStorage) while still allowing seeded/mock content during Phase 1.

2. **Content format & rendering approach needs explicit selection**
   - Plan suggests Markdown in DB.
   - Decision needed: which markdown renderer, how to handle headings, code blocks, tables, and safe HTML.

3. **Image handling is underspecified**
   - Seed data uses remote Unsplash URLs.
   - Decision needed: do we store image URLs only, or support uploads (S3) later? What’s MVP?

4. **Admin auth/permissions integration is underspecified**
   - Plan proposes roles (`ADMIN/EDITOR/AUTHOR/VIEWER`), but we must align with existing user roles in Prisma (`UserRole` enum) and current `/admin` protection patterns.

5. **Scheduling reliability needs a chosen execution mechanism**
   - Plan lists Vercel Cron vs n8n scheduling.
   - Decision needed: which mechanism is the MVP source of truth for scheduled publishing.

6. **AI + n8n needs governance boundaries**
   - Plan correctly calls for guardrails, but we must explicitly define:
     - webhook auth (shared secret vs signature)
     - idempotency keys
     - where job logs live (DB table vs vendor logs)

7. **Comments are currently misleading**
   - Current blog post page simulates login via localStorage and “posts” comments locally.
   - For MVP, we must decide: hide comments entirely, keep read-only mock comments, or implement real comments later.

### Open questions (must be confirmed before coding)
1. Is the blog intended to be fully public marketing content only, or will logged-in users have additional blog experiences?
2. What is the preferred authoring experience in admin: markdown textarea, simple rich text, or “markdown + preview” split pane?
3. Do we require categories *and* tags at MVP, or categories only?
4. Do posts require an explicit reviewer/approval step, or can admins publish directly?
5. Do you want AI to generate only drafts, or also auto-schedule (still admin-approved)?

---

## PHASE 1 — Vision & Problem Statement (WHY)

### Vision
Deliver a modern, SEO-friendly blog for SolarMatch with a controlled publishing workflow and optional AI-assisted drafting and n8n automation.

### Problem being solved
- Static seed posts are not scalable.
- Admin needs a safe workflow to draft, schedule, and publish content.
- AI automation must be governed to prevent brand/SEO risk.

### Target users
- **Public visitors**: browse and read blog content.
- **Admin/editor**: create, review, schedule, and publish posts.
- **Automation system (n8n/cron)**: performs safe background actions under constraints.

### Success criteria
- Blog detail pages are reachable via stable, canonical URLs.
- Admin can create and schedule posts (end-to-end).
- AI drafting is admin-only and key-safe.
- Automation can create/schedule drafts with auditable provenance.

---

## PHASE 2 — User Stories (WHAT, not how)

### Public visitor
- As a visitor, I can browse blog posts.
- As a visitor, I can search and filter posts by category.
- As a visitor, I can open a post via a stable URL.
- As a visitor, I see accurate SEO metadata.

### Admin/editor
- As an admin/editor, I can create a draft post.
- As an admin/editor, I can edit content and SEO fields.
- As an admin/editor, I can preview and schedule a post.
- As an admin/editor, I can publish/unpublish/archive a post.

### System automation
- As the system, I can publish scheduled posts on time.
- As the system, I can log publishing outcomes and failures.

### AI worker (admin-controlled)
- As the AI, I can generate outlines/drafts/SEO fields from admin-provided inputs.
- As the AI, I can propose tags/categories and internal link suggestions.

### n8n integration
- As n8n, I can create drafts and schedule posts via authenticated webhooks.
- As n8n, I can trigger “topic calendar” workflows that produce drafts awaiting review.

### Explicit exclusions (unless later approved)
- Public comment system with moderation.
- Full media library.
- Multi-tenant blog per customer.

---

## PHASE 3 — Scope & Modules (WHAT we will build)

### Module list (with legacy impact)
1. **Public Blog (Frontend)**
   - Incrementally migrate from sessionStorage navigation to canonical slug URLs.
   - Impact: Medium.

2. **Admin Blog Management (Frontend + Backend later)**
   - Post list, create/edit, schedule, preview.
   - Impact: High.

3. **Blog Persistence (Backend Foundations)**
   - Prisma models + admin APIs + public APIs.
   - Impact: High.

4. **AI Drafting (Admin-only)**
   - Server-side AI generation endpoints and audit trail.
   - Impact: Medium/High.

5. **Automation (n8n / cron)**
   - Webhook endpoints + scheduled publishing runner.
   - Impact: Medium/High.

### Dependencies
- Existing auth/roles patterns for `/admin`.
- A clear decision on scheduling mechanism.
- A safe markdown rendering approach.

---

## PHASE 4 — System & Flow Design (How it works, no code)

### Content lifecycle (recommended)
`Draft → Review → Scheduled → Published → Archived`

### Flow A — Public reading
1. Visitor opens `/blog` and sees published posts.
2. Visitor opens `/blog/[slug]` to read.
3. SEO metadata is derived from post fields.

### Flow B — Admin authoring
1. Admin creates a draft.
2. Admin edits content + SEO fields.
3. Admin previews.
4. Admin schedules or publishes immediately.

### Flow C — Scheduled publishing
1. A scheduler runs regularly.
2. It finds due scheduled posts.
3. It publishes them atomically.
4. It logs success/failure events.

### Flow D — AI drafting (admin-only)
1. Admin enters topic + keywords + constraints.
2. System generates outline + draft + SEO fields.
3. Draft is saved as `DRAFT` and is editable.

### Flow E — n8n automation
1. n8n triggers draft creation via webhook.
2. System validates signature/secret and creates a `DRAFT`.
3. Optional: n8n schedules post (still requires admin approval if enforced).

### Error handling rules
- If AI fails: do not corrupt existing drafts; log failure.
- If scheduler fails: do not publish partially; log and retry idempotently.
- If webhook auth fails: reject with 401/403 and log.

---

## PHASE 5 — Technical Design (Draft — requires approval before code)

> This section is draft design only. No application code changes should begin until you approve this SOT.

### Data model (draft)
Introduce new Prisma models (names final after confirming existing patterns):
- BlogPost (title/slug/excerpt/content/status/publishedAt/scheduledFor/coverImageUrl/seo fields)
- BlogCategory
- BlogTag (many-to-many)
- BlogPostRevision (optional; recommended)
- BlogJob (optional; recommended for scheduling + AI job logs)

### API surface (draft)
- Public:
  - `GET /api/blog/posts`
  - `GET /api/blog/posts/[slug]`
- Admin:
  - `POST /api/admin/blog/posts`
  - `PATCH /api/admin/blog/posts/[id]`
  - `POST /api/admin/blog/posts/[id]/schedule`
  - `POST /api/admin/blog/posts/[id]/publish`
  - `POST /api/admin/blog/ai/generate`
- Webhooks:
  - `POST /api/webhooks/n8n/blog/create-draft`
  - `POST /api/webhooks/n8n/blog/schedule`

### Frontend architecture (draft)
- A data adapter layer for blog content used by public pages:
  - Phase 1: local seed adapter
  - Phase 3+: DB adapter

### Security & compliance notes
- AI keys must be server-only (env var), never exposed client-side.
- Admin endpoints must enforce role checks server-side.
- Webhook endpoints must authenticate requests.
- Add basic rate limits for AI generation.

---

## PHASE 6 — Legacy-Aware Development Execution Plan (Docs-only)

> This is a docs-only execution outline. After approval, execution tasks will be followed from `tasks.md`.

### Step 1 — Freeze legacy behavior
- Document current `/blog` and `/blog/post` behavior.
- Confirm canonical route strategy (`/blog/[slug]`).

### Step 2 — Frontend-first migration (no DB)
- Create `/blog/[slug]` route (seed-based).
- Update list navigation to link by slug.
- Keep `/blog/post` temporarily (redirect/compat) if needed.

### Step 3 — Admin UI scaffolding (mocked)
- Implement admin blog routes and editor UI with mocked persistence.

### Step 4 — Backend foundations
- Add Prisma blog models + migrations.
- Implement public/admin APIs.

### Step 5 — AI drafting
- Implement admin-only AI draft generation endpoints.

### Step 6 — Scheduling + n8n
- Implement scheduler (cron or n8n-driven) and webhook integration.

### Rollback strategy (draft)
- Ability to revert public blog to seed adapter without breaking routes.
- Ability to disable AI endpoints and n8n webhooks via env flags.
