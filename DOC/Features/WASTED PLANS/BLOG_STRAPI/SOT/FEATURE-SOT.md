# BLOG_STRAPI — Feature SOT (Phases 0–6)

**Status**: Locked (Approved)  
**Owner**: GitHub Copilot (GPT-5.2)

**Locked At**: 2025-12-29

**Canonical Notice**: This is the canonical SOT for the Blog/Strapi feature. All planning and future coding must align to this file.

**Inputs**:
- Plan (raw): `DOC/Features/BLOG_STRAPI/PLAN/Raw_Plan.md`
- Plan (expanded): `DOC/Features/BLOG_STRAPI/PLAN/ChatGPT_plan.md`
- Index: `DOC/Features/BLOG_STRAPI/SOT/INDEX.md`

**Execution-level docs (post-lock, does not change this plan)**:
- `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/Features/BLOG_STRAPI/SOT/tasks.md`

---

## PHASE 0 — Context & Legacy Audit (Required)

### Why this audit is required
This is a **new feature expansion in an existing SaaS repo**, so planning must start with a legacy audit (per `LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`).

### What already exists (confirmed in code)
**Public blog routes (Next.js App Router):**
- `src/app/blog/page.tsx`
  - Client-rendered blog listing.
  - Currently reads local seed data from `src/data/blogData.ts`.
  - Navigates to `/blog/post` using `sessionStorage`.
- `src/app/blog/post/page.tsx`
  - Client-rendered single-post page.
  - Relies on `sessionStorage.getItem('currentBlogPost')` (legacy preview behavior).
  - Contains a demo comment UI and homeowner auth placeholders (localStorage-based).
- `src/app/blog/[slug]/page.tsx`
  - Server-rendered post route.
  - Fetches a post by slug using `getBlogPostBySlug` from `src/lib/blog/strapi.ts`.
  - Uses SEO metadata from post fields.

**Strapi integration (partial):**
- `src/lib/blog/strapi.ts`
  - Fetches **one** post by slug from Strapi endpoint `/api/posts`.
  - Uses env vars: `STRAPI_URL`, `STRAPI_TOKEN`.
  - Has a local fallback to seed data if `STRAPI_URL` is missing.

**Local seed types/data:**
- `src/types/blog.ts` defines `BlogPost` and `Post`.
- `src/data/blogData.ts` contains seeded articles and categories.

### Gaps vs the requested idea
Based on the plan, the desired system is not just a blog—it’s a **content automation system** with Strapi as CMS + SaaS as control tower + AI as worker + automation engine (n8n). The following are currently missing:
- Strapi-backed **blog listing** (and canonical routing strategy).
- Admin “control tower” features (approval workflow, scheduling rules, audit trails).
- Automation engine integration (RSS ingestion, research generation, drafting, state transitions).
- Persistent auditability for “who did what, when, why” for content lifecycle events.

### Do-not-touch / stability constraints (initial)
- Avoid breaking existing guest routes and shared layout behavior that treats `/blog` as a guest page.
- Preserve the existing design system + routing standards.

### Open questions (must be confirmed before implementation)
1. **Deployment model**: Is Strapi self-hosted (Docker) or managed hosting? Where will it run (same server vs separate)?
2. **Publishing authority**: Do we allow Strapi users to publish directly, or must publishing be gated by the SaaS control plane?
3. **Auth strategy**: Will the SaaS authenticate to Strapi via token only, or via Strapi users/roles?
4. **Automation runtime**: Is n8n already used elsewhere in this repo/org? Where are workflows stored and how are secrets managed?
5. **SEO + indexing**: Are we targeting static generation/ISR for blog pages? Any sitemap/robots requirements?

---

## PHASE 1 — Vision & Problem Statement (WHY)

### Vision
Build a **Strapi-powered blog** where **Strapi is the content source of truth**, and the **SolarMatch SaaS acts as the control tower** for AI-assisted research/drafting and safe publishing workflows.

### Problem being solved
- Manual blog operations don’t scale.
- AI content automation without governance causes brand, SEO, and trust risk.
- The system needs a controlled lifecycle: **Idea → Research → Draft → Review → Optimize → Schedule → Publish → Audit**.

### Target users
- **Public visitors**: read blog content.
- **Admin/editor**: manage strategy, review AI output, approve/schedule/publish.
- **System/automation**: runs ingestion and drafting workflows.

### Success criteria (measurable)
- A canonical blog experience that can render content from Strapi (not only local seed data).
- No publishing happens without passing through defined governance states.
- Every post has traceability: origin/source, draft history, approvals, and publish event.

---

## PHASE 2 — User Stories (WHAT, not how)

### Public visitor (guest)
- As a visitor, I can view a list of blog posts.
- As a visitor, I can open a blog post via a stable URL.
- As a visitor, I see correct SEO metadata (title/description/open graph) per post.

### Admin/editor (human authority)
- As an admin/editor, I can define content sources (RSS/keywords) and enable/disable them.
- As an admin/editor, I can review AI research summaries before drafting.
- As an admin/editor, I can edit AI drafts and request rewrites.
- As an admin/editor, I can approve a post for scheduling/publishing.
- As an admin/editor, I can see an audit trail of all actions and automation steps.

### System automation (n8n / scheduler)
- As the system, I can run scheduled ingestion from RSS/other sources.
- As the system, I can create a research summary and store it for review.
- As the system, I can generate a draft only from approved research.
- As the system, I can move content through states without skipping steps.

### AI worker
- As the AI worker, I can produce research summaries from multiple sources.
- As the AI worker, I can draft content, headlines, and SEO fields from approved research.
- As the AI worker, I can propose SEO improvements and internal link suggestions.

### Explicit exclusions (non-goals in this plan unless later approved)
- Building a full social/comment system for public users.
- Real-time collaboration editing inside the SaaS.
- Automatic publishing without human approval.

---

## PHASE 3 — Scope & Modules (WHAT we will build)

### Module list (with legacy impact)
1. **Public Blog (Frontend)**
   - Reuse existing `/blog` routes but replace local-seed dependence with Strapi-backed content (incremental migration).
   - Impact: Medium (touches routing + data loading).

2. **Strapi CMS (External Truth Holder)**
   - Content types for posts, categories/tags, SEO metadata, publish states.
   - Impact: Medium/High (external system setup + content model).

3. **Control Tower (Admin within SaaS)**
   - Source management, research review, draft review, approval + scheduling controls, audit views.
   - Impact: High (new admin UI + domain workflows).

4. **Automation Orchestrator (n8n)**
   - RSS ingestion, trigger logic, draft generation pipeline, state transitions, notifications.
   - Impact: High (integration + ops/security).

5. **Audit & Traceability Layer**
   - Store and present lifecycle events and AI provenance.
   - Impact: High (data + observability).

### Dependencies
- Env/Secrets management for Strapi URL/token and AI provider keys.
- A stable internal “content lifecycle state machine” that cannot be bypassed.

---

## PHASE 4 — System & Flow Design (How it works, no code)

### Canonical content lifecycle (non-negotiable)
`Idea → Research → Draft → Review → Optimize → Schedule → Publish → Audit`

### Flow A — RSS/Source ingestion to research
1. Scheduler triggers ingestion.
2. System fetches multiple sources (RSS/news/keywords).
3. AI produces a **Research Summary** (not a post).
4. Research summary is stored and awaits admin review.

### Flow B — Research approval to drafting
1. Admin reviews research.
2. Admin approves research → system triggers AI drafting.
3. AI generates:
   - Outline
   - Headlines
   - Draft
   - SEO title/description
   - Suggested tags/categories
4. Draft becomes editable and versioned.

### Flow C — Editorial control
1. Admin edits draft or requests rewrite.
2. Admin approves draft for scheduling.

### Flow D — Scheduling & publishing
1. Admin sets scheduling rules or a schedule time.
2. Automation publishes to Strapi.
3. System performs post-publish verification (fetch back from Strapi).

### Flow E — Post-publish intelligence
1. System tracks performance signals (definition TBD).
2. AI may recommend refresh/expand/repurpose.

### Error handling (must be explicit)
- If Strapi is unreachable: do not publish; keep state pending and raise an admin-visible alert.
- If AI fails: keep the previous version; do not corrupt content state.
- All retries must be idempotent (no duplicate publishes).

---

## PHASE 5 — Technical Design (Draft — requires approval before code)

> This phase is a **draft technical plan** only. No application code changes are permitted until you approve and we lock this SOT.

### Integration boundaries (principle)
- **Strapi** stores the public canonical post content.
- **SaaS** stores governance, automation settings, and audit trails.
- **AI** never publishes directly.
- **Automation (n8n)** triggers actions, but cannot bypass state constraints.

### Strapi API usage (existing + needed)
- Existing: fetch post by slug via Strapi `/api/posts` filter.
- Needed:
  - List posts (pagination, filters, published only).
  - Fetch categories/tags.
  - Publish/schedule endpoints (or Strapi publish workflow).

### Proposed internal entities (SaaS DB) — to confirm
The repo currently has **no blog models** in Prisma. To support governance + audit, we likely need new models (names are placeholders):
- ContentSource (RSS feed, keyword list, etc.)
- ContentItem (represents a post concept + lifecycle state)
- ContentRevision (draft versions)
- ContentAuditEvent (who/what/when/why)

If you prefer “Strapi-only storage” for drafts and audits, we can reduce DB scope, but we must still satisfy auditability requirements.

### Security constraints
- Secrets (Strapi token, AI keys, RSS credentials) must be env-managed and never logged.
- All admin actions must be role-checked server-side.

### Routing strategy (draft)
- Choose one canonical post URL format:
  - Prefer `/blog/[slug]` as canonical.
- Plan to deprecate sessionStorage-based `/blog/post` behavior (keep temporarily as legacy during migration).

---

## PHASE 6 — Legacy-Aware Development Execution Plan (Docs-only plan)

> This is the execution plan outline. Actual implementation tasks will be created only after you approve this SOT.

### Step 1 — Confirm & freeze legacy behavior
- Document current blog routes and ensure we do not break guest navigation.
- Decide canonical route and migration path.

### Step 2 — Strapi content model + environments
- Define Strapi content type(s): Post, Category/Tag, Media, SEO fields.
- Define required env vars and secret storage.

### Step 3 — Public blog data integration
- Implement Strapi-backed list endpoint function(s) and update `/blog` to render from Strapi (with safe fallback).
- Keep SEO + metadata correct.

### Step 4 — Control tower (admin) scaffolding
- Add minimal admin UI for post lifecycle visibility and approval gates.

### Step 5 — Automation workflows (n8n)
- Implement ingestion → research → draft pipeline with approvals.
- Ensure idempotency and audit logging.

### Step 6 — Audit + monitoring
- Implement lifecycle audit events, admin audit views, and failure alerts.

### Step 7 — Rollback strategy
- Ability to disable automation without losing content.
- Ability to fall back to manual Strapi publishing.

---

## Approval Gate
When you confirm this plan:
1. I will update this file’s status to `Locked (Approved)`.
2. I will create the execution task plan in `specs/<blog-feature>/tasks.md` and start implementation phase-by-phase.

✅ Approved and locked on 2025-12-29.
