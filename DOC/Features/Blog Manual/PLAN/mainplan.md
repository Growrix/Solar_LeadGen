# Blog Feature – Main Plan (Frontend-first, then Backend)

## Goals
- Build a production-grade blog inside this Next.js 14 (App Router) SaaS app using PostgreSQL + Prisma + Tailwind + React + TypeScript.
- Provide an admin-first publishing workflow: drafts → review → schedule → publish.
- Add AI-assisted SEO content creation (using ChatGPT/OpenAI API keys) with **strong guardrails**.
- Integrate n8n to automate post creation/scheduling and to run repeatable “content pipeline” workflows.

## Non-goals (for MVP)
- Multi-tenant customer blogs (per-organization blogs). Keep it single blog for the marketing site unless/ until needed.
- Building a full CMS (e.g., media library with folders, WYSIWYG blocks with complex layout). Start simple.

## Current State (Quick Audit – What Exists Today)
Found existing blog scaffolding that is **frontend-only**:
- Blog list page: `src/app/blog/page.tsx`
  - Uses static data source: `src/data/blogData.ts` and types in `src/types/blog.ts`.
  - Basic search + category filter + “load more” paging.
  - Navigates to detail page by storing the post object in `sessionStorage` and routing to `/blog/post`.
- Blog post page: `src/app/blog/post/page.tsx`
  - Loads current post from `sessionStorage`; redirects back to `/blog` if missing.
  - Comment UI is local state only (not persisted); gates comment posting via a localStorage flag (not DB).
- The shell app already routes guests to `/blog` via `LayoutContent` and homepage CTA.

Implication: We will keep the current UX patterns as a baseline for Phase 1, then progressively replace the storage/navigation with canonical URLs and DB-driven content.

---

## Key Product Decisions (Make Once, Reuse Everywhere)
These decisions should be settled during Phase 0 and referenced in every implementation task:

### URL & Routing
- Target public routes:
  - `/blog` (list)
  - `/blog/[slug]` (detail)
  - Optional: `/blog/category/[slug]`, `/blog/tag/[slug]` later
- Redirect legacy route `/blog/post` → canonical `/blog/[slug]` when DB content exists.

### Content Format
Pick one for MVP:
- Option A (recommended): Markdown stored in DB (string) + render via a markdown renderer.
- Option B: MDX stored in repo (content files) + DB stores metadata only.

Given you want AI + scheduling + n8n + admin editing, **Option A (DB content)** is usually simpler.

### Publishing Workflow
- Statuses: `DRAFT` → `IN_REVIEW` → `SCHEDULED` → `PUBLISHED` → `ARCHIVED`
- Publication rules:
  - Only `PUBLISHED` shows publicly.
  - `SCHEDULED` becomes `PUBLISHED` automatically at `publishedAt`.

### Admin Roles & Permissions
- Admin-only blog management inside `/admin`.
- If you have multiple internal roles, add:
  - `ADMIN` (full control)
  - `EDITOR` (create/edit/schedule)
  - `AUTHOR` (create/edit own drafts)
  - `VIEWER` (read-only analytics)

### AI Key Management
Two supported patterns:
- Pattern 1 (simplest): One server-side key via env var `OPENAI_API_KEY`.
- Pattern 2 (advanced): Per-admin keys stored encrypted in DB (requires encryption strategy + rotation).

MVP should use Pattern 1.

---

## Phase 0 — Discovery, Audit, and Architecture (1–2 days)
### Outcomes
- Finalize decisions above.
- Produce a clear backlog split into frontend-first and backend-second.

### User Stories
- As a developer, I can identify existing blog code paths and data sources.
- As an admin, I can describe the publishing workflow (draft → schedule → publish).

### Tasks
- Audit current blog UX and components:
  - Confirm list page behaviors (search, filter, load more).
  - Confirm detail page requirements (comments, sharing buttons, author section).
- Inventory existing admin patterns under `/admin` to reuse layout + auth.
- Define “MVP feature set” and “Later feature set” (below).
- Decide: markdown rendering approach + image handling.

---

## Phase 1 — Frontend MVP (No Backend Yet) (3–7 days)
**Goal:** Implement the blog UX fully on the frontend using mock data, but with a structure that will swap cleanly to backend data later.

### Public Blog (Frontend)
#### User Stories
- As a visitor, I can browse blog posts, search, and filter by category.
- As a visitor, I can open a post via a canonical URL (slug).
- As a visitor, I see SEO-friendly metadata (title/description/OG image).

#### Tasks
- Refactor routing:
  - Create `/blog/[slug]` page and migrate the current `/blog/post` UI to it.
  - Update list navigation to route to `/blog/[slug]` instead of sessionStorage.
- Introduce a “content adapter” layer:
  - A single `getBlogPosts()` + `getBlogPostBySlug()` interface used by pages.
  - For Phase 1, it returns from `blogData.ts`; in Phase 3 it returns from DB.
- Ensure UI stays consistent with existing design system tokens and components.
- Add `generateMetadata` (or equivalent) on blog pages:
  - Title, description, canonical URL, open graph, twitter cards.

### Blog Comments (Frontend-only in MVP)
You currently have a local-only comment UI.

#### User Stories
- As a visitor, I can read comments (mock/static).
- As a logged-in user (future), I can post a comment.

#### Tasks
- Keep comments UI but clearly mark as non-persistent in Phase 1.
- Structure comment component for later API integration (Phase 4).

### Admin Blog UI (Frontend-first, mocked)
**Goal:** Create admin screens and flows without wiring DB yet.

#### User Stories
- As an admin/editor, I can create a new draft post.
- As an admin/editor, I can edit title, slug, excerpt, body, categories/tags, cover image.
- As an admin/editor, I can schedule a post for publication.
- As an admin/editor, I can preview the post before publishing.

#### Tasks
- Add admin routes (example):
  - `/admin/blog` (table: drafts/scheduled/published)
  - `/admin/blog/new` (create)
  - `/admin/blog/[id]` (edit)
  - `/admin/blog/[id]/preview` (preview)
- Implement form UI with validation (client-side only for now).
- Add status controls + schedule input UI.
- Use in-memory or mocked API calls to simulate saves.

**Exit Criteria (Phase 1 Complete)**
- Public routes use slugs and no longer depend on `sessionStorage` to open a post.
- Admin UX exists end-to-end (create/edit/schedule/preview) with mock persistence.
- No backend schema changes yet.

---

## Phase 2 — SEO + Content Quality Features (Frontend-first) (2–5 days)
### User Stories
- As a visitor, I can discover content via categories/tags.
- As a visitor, I can see “related posts”.
- As an admin, I can manage SEO fields.

### Tasks
- Add tags support to UI (even if mocked initially).
- Related posts (simple heuristic): same category/tag.
- SEO fields in admin editor:
  - Meta title, meta description, OG image, canonical, robots.
- Add sitemap/RSS plan (implementation likely Phase 5 after backend).

---

## Phase 3 — Backend Foundations (PostgreSQL + Prisma) (3–10 days)
**Note:** This phase starts only after Phase 1 frontend is approved.

### Data Model (Proposed Prisma Models)
(Exact details will be finalized after reviewing your existing `schema.prisma` user/auth tables.)

- `BlogPost`
  - `id` (cuid/uuid)
  - `title`, `slug` (unique)
  - `excerpt`
  - `content` (markdown)
  - `status` enum
  - `publishedAt`, `scheduledFor`
  - `coverImageUrl`
  - `readingTimeMinutes` (computed or stored)
  - `categoryId` (optional) + many-to-many `tags`
  - `authorId` (relation to existing `User` if present)
  - `createdAt`, `updatedAt`, `deletedAt` (optional)

- `BlogCategory`
  - `id`, `name`, `slug`

- `BlogTag`
  - `id`, `name`, `slug`

- `BlogPostRevision` (optional but recommended)
  - `id`, `postId`, `contentSnapshot`, `titleSnapshot`, `createdById`, `createdAt`

- `BlogJob` (for scheduling + automation)
  - `id`, `type` (PUBLISH_POST / GENERATE_AI_DRAFT / SYNC_TO_N8N)
  - `status`, `runAt`, `payloadJson`, `resultJson`, `error`

### API Design (Next.js Route Handlers)
- Public:
  - `GET /api/blog/posts` (published only)
  - `GET /api/blog/posts/[slug]`
- Admin:
  - `POST /api/admin/blog/posts`
  - `PATCH /api/admin/blog/posts/[id]`
  - `POST /api/admin/blog/posts/[id]/schedule`
  - `POST /api/admin/blog/posts/[id]/publish`
  - `POST /api/admin/blog/posts/[id]/archive`

### User Stories
- As a visitor, I see published posts served from DB.
- As an admin, I can CRUD posts with server-side validation.
- As an admin, I can schedule posts and they publish automatically.

### Tasks
- Add Prisma schema + migrations.
- Implement route handlers with:
  - validation (zod or existing pattern)
  - authorization checks for admin routes
  - consistent error responses
- Replace Phase 1 mock adapter with real DB adapter.

---

## Phase 4 — AI-Assisted Content Creation (Admin-only) (3–10 days)
### What AI Does (MVP)
- Generate:
  - post outline
  - full draft (markdown)
  - SEO meta title + meta description
  - suggested slug, categories/tags
  - FAQs schema suggestions

### Guardrails (Must-Haves)
- Never expose API keys to the browser.
- Admin-only endpoints.
- Rate limiting per admin.
- Prompt injection resistance:
  - treat external URLs/content as untrusted
  - avoid “tool” execution from model output
- Plagiarism risk mitigation:
  - require human review before publish
  - optional: store AI generation provenance metadata

### User Stories
- As an admin, I can generate a draft from a topic + target keywords.
- As an admin, I can regenerate sections (intro, conclusion, FAQ).
- As an admin, I can run an SEO checklist and see issues.

### Tasks
- Add admin UI panel: “AI Assistant” with form inputs:
  - topic, audience, geo (Australia), keywords, word count, tone
  - internal links to include (optional)
- Create server route: `POST /api/admin/blog/ai/generate`.
- Store generation request + result for auditability.

---

## Phase 5 — Scheduling, Automation, and n8n Integration (2–10 days)
### Scheduling Options
Choose one MVP scheduling strategy:
- Option A: Vercel Cron (or a server cron) that periodically publishes due scheduled posts.
- Option B: n8n does scheduling (n8n cron triggers calling your webhook endpoints).

If n8n is already central to your ops, Option B can be simplest.

### n8n Integration Patterns
- Pattern 1 (Inbound): n8n calls your webhook to create/update/schedule posts.
  - Example: `POST /api/webhooks/n8n/blog/create-draft`
- Pattern 2 (Outbound): Your app calls n8n webhook URLs when events occur.
  - Example: on post publish, notify n8n to syndicate to social/email.

### Suggested n8n Workflows
- “Content Calendar Generator” (weekly):
  - AI proposes topics + keywords → admin approves → drafts created scheduled.
- “SEO Refresh” (monthly):
  - pick older posts → regenerate meta description + add new FAQ → create revision.
- “Syndication” (on publish):
  - post to newsletter list, schedule social posts, ping search engines.

### User Stories
- As an admin, I can schedule posts and trust they publish on time.
- As an admin, I can run a workflow that creates drafts automatically.

### Tasks
- Implement webhook authentication strategy:
  - shared secret header (e.g. `X-N8N-SECRET`)
  - replay protection (timestamp + signature) if needed
- Add `BlogJob` runner (or simple scheduled publishing query).

---

## Phase 6 — Analytics, Monitoring, and Quality (2–7 days)
### User Stories
- As an admin, I can see which posts drive leads.
- As an admin, I can see top posts, search terms, and conversion.

### Tasks
- Track events:
  - post view, CTA clicks (e.g., “Get Quote”), newsletter signup
- Add basic admin analytics screen.
- Add logging + audit trail for publish actions.

---

## MVP Feature List (Recommended)
- Public blog list + detail with canonical slugs.
- Categories + basic search.
- Admin CRUD + schedule + preview.
- AI draft generation (admin-only).
- n8n webhook integration to auto-create/schedule drafts.

## Later Enhancements (Backlog)
- Full comment system with moderation + spam prevention.
- Author pages.
- Rich media management (uploads to S3).
- Multi-language support.
- A/B testing headlines.
- Internal linking suggestions and automated “related content” graph.

---

## Acceptance Criteria (High Level)
- Public blog content is indexable and stable (no sessionStorage-only navigation).
- Admin flows are protected and auditable.
- AI keys are never exposed client-side.
- Scheduling is reliable (clear job logs + retry path).
- n8n integration is authenticated and resilient.

---

## Next Step (What I Will Do First When You Say “Start”)
1. Phase 0: produce a deeper audit doc (routes, components, schema, existing admin auth patterns).
2. Phase 1: migrate `/blog/post` to `/blog/[slug]` using the adapter layer (frontend-first, minimal UX changes).
