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

Prototype reference (UI-only, for alignment checks):
- `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/`

### Locked / do-not-break areas
- Do not break public `/blog` listing, or the legacy `/blog/post` sessionStorage-driven behavior.
- Do not break admin blog CRUD routes and their auth (admin-only).
- Do not expose any AI keys client-side.

### Scope clarification (important)
The raw plan includes **Blog + News + Newsletter** ideas.
- This SOT covers **BLOG only**.
- News (auto-news ingestion and news publishing from government feeds) must be planned separately under a News feature folder.
- Newsletter must be planned separately under a Newsletter feature folder.

Important clarification (new):
- **RSS for blog research/topic discovery** is **in scope** for BLOG when it supports SEO blog creation (sources → research notes → draft).
- **RSS for publishing “news articles”** remains **out of scope** for BLOG.

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

### Admin/editor (CMS extensions)
- As an admin, I can manage a Media Library for blog assets (upload, browse, copy URL, delete).
- As an admin, I can moderate blog comments (approve, hide, mark spam, delete).

### Admin (Blog Engine Hub: AI + Automation parity)
- As an admin, I can operate the Blog Engine in modes: **Manual**, **Assisted**, **Automatic**.
- As an admin, I can review AI-generated drafts in a queue and choose: publish now, schedule, request rewrite, reject (with reason), or save edits.
- As an admin, I can configure automation logic (auto-draft / auto-schedule / auto-publish) with publish windows and safeguards.
- As an admin, I can manage research sources (RSS feeds used for topic discovery and drafting inputs).
- As an admin, I can pause/resume automation and trigger an emergency stop.
- As an admin, I can view audit logs for AI generations, automation actions, admin actions, and errors.
- As an admin, I can view prompt details for AI-generated items (inputs used, intent, constraints).

### Admin (AI Control Plane: deep control over AI + automation)
- As an admin, I can manage **AI model profiles** used by the Blog Engine (e.g., “Deep Research”, “Drafting”, “Rewrite”, “SEO Metadata”, “Image Generation”).
- As an admin, I can configure **model routing per operation** (research vs drafting vs rewrite) so the engine uses the correct model consistently.
- As an admin, I can manage **multiple API credentials/keys** (server-side only) and assign them to providers/models, supporting rotation and fallback.
- As an admin, I can define **operational rules** for AI usage end-to-end (budgets/limits, quality gates, required fields, failure handling, retries).
- As an admin, I can run **safe test actions** (dry-run generation, connectivity test) that produce deterministic results and audit logs.
- As an admin, I can configure **AI image generation** rules for blog posts (hero/OG image) with review/approval before publish.

### Automation (Research ingestion)
- As the system, it can ingest research inputs from **RSS sources and approved web scraping sources** for BLOG topic discovery and drafting inputs.
- As the system, it can record ingestion results and failures in an audit trail for operational transparency.

### Automation (n8n)
- As n8n, I can create drafts via an authenticated webhook.
- As n8n, I can schedule a post via an authenticated webhook.
- As n8n, I can trigger the publish scheduler to publish due posts.

### Explicit exclusions (for this SOT unless later approved)
- RSS news ingestion for publishing “news posts” (belongs to News feature).
- Newsletter campaign management (belongs to Newsletter feature).
- Public comment submission + public comment display UI (admin moderation is in-scope; public commenting is out-of-scope unless explicitly approved).

---

## PHASE 3 — Feature Scope & Modules

### Module A — Public Blog
- Listing + post detail pages with SEO metadata.
- Legacy compatibility for `/blog/post` while canonical slug pages exist.

### Module B — Admin Blog
- Admin post CRUD.
- Taxonomy management (categories/tags).
- Preview workflow.

### Module B2 — Admin Blog Engine Hub (AI + Automation UI)
- One admin hub surface to operate the blog pipeline with minimal admin effort.
- Draft review queue and decision actions (publish/schedule/rewrite/reject/save).
- Operational mode selector (Manual/Assisted/Automatic).

### Module C — Sources & Research (Blog)
- RSS source manager (blog research only; not news publishing).
- Research notes/inputs surfaced for AI drafting transparency.

### Module D — Automation Logic & Master Control
- Automation toggles + publish windows configuration.
- Pause/resume + emergency stop (UX gated).

### Module E — Audit Trail & Prompt Details
- Audit logs for AI + automation + admin actions.
- Prompt details view for AI generations.

### Module I — Media Library (Blog CMS)
- Admin media library UI for blog assets: upload, browse, copy URL, delete.
- Minimal scope: media management is available as a CMS tool; editor integration can remain URL-based until explicitly expanded.

### Module J — Comments Moderation (Blog CMS)
- Admin moderation UI for comments on blog posts.
- Actions: approve, hide, mark spam, delete.
- Public comment submission/display remains out of scope unless explicitly approved.

### Module F — Backend Persistence
- Prisma-backed `BlogPost` / taxonomy models.

### Module G — AI Drafting
- Admin-only AI generation endpoint.
- Logging + rate limiting.

### Module K — AI Control Plane (Models, Credentials, Routing)
- Admin UX to configure which model is used for each AI operation (research, drafting, rewrite, SEO metadata, image prompt).
- Credentials management UX (server-side storage only): add/remove/disable credentials, mask key display, select default/fallback.
- Deterministic routing rules: “Operation → Model Profile → Provider/Credential”.

### Module L — AI Image Generation (Blog)
- Admin-configurable image generation for blog posts (hero/OG), gated behind review.
- Visible operational state if image generation fails (surfaced as `ERROR` with reason in logs).

### Module H — Automation (n8n)
- Authenticated webhooks for draft/schedule/publish scheduler.
- Job logs for auditing.

---

## PHASE 4 — System & Flow Design (How it works, no code)

### Content lifecycle (operational visibility)
Minimum lifecycle plus operational states (mirrors News Engine-style visibility):
- `DRAFT`
- `NEEDS_REVIEW`
- `DRAFT_READY`
- `SCHEDULED`
- `PUBLISHED`
- `ARCHIVED`
- `REJECTED`
- `ERROR`

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

### Blog Engine Hub flow (AI + automation)
1. Admin selects operational mode (Manual/Assisted/Automatic).
2. In Assisted/Automatic modes, AI generations create drafts that enter a review queue.
3. Admin reviews a draft and chooses publish now / schedule / rewrite / reject / save edits.
4. Automation can auto-schedule and auto-publish within configured publish windows.
5. Audit logs record AI actions, automation actions, and admin actions.
6. Admin can pause/resume or emergency stop automation at any time.

### AI control plane rules (model routing + multi-keys)
1. Admin configures **Model Profiles** (examples only):
	- Deep Research → `gpt-5.2`
	- Drafting → `o3-mini` (or equivalent)
	- Rewrite → `o3-mini`
	- SEO Metadata → lightweight model profile
	- Image Prompting → lightweight model profile
2. Admin configures **Credentials** (multiple keys allowed) per provider.
3. For each AI operation, the system uses deterministic routing: Operation → Model Profile → Credential selection (default/fallback/rotation).
4. All AI operations are server-side only; the UI never receives raw API keys.

### Research ingestion (RSS + scraping)
1. Sources are configured in the Engine Sources surface with a type:
	- RSS source (feed URL)
	- Scrape source (page URL + extraction rules)
2. In Assisted/Automatic modes, ingestion runs on a cadence and writes audit entries (success/failure).
3. In case of ingestion failure, the item is logged and surfaced in Engine Logs/Audit with an actionable error state.

### AI image generation (blog)
1. For posts that require images, the system generates an image prompt + image draft (provider-dependent) and attaches it to the post as a pending asset.
2. Admin can approve/regenerate/reject the image before publish.
3. Failures are tracked as operational `ERROR` with reason.

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

Additional technical design outputs (AI control plane):
- Secure credential storage strategy (encrypted at rest; never returned in full to the client).
- Model routing schema (operation → model profile → credential policy).
- Operational limits and budgets (per day/per hour), plus audit log fields for cost/usage visibility.

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
