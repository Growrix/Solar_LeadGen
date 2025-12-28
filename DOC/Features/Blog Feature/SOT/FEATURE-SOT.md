# Blog Feature — AI-Powered SEO Blog System (E2E)

- Status: Locked (Approved)
- Owner: AI (GitHub Copilot / GPT-5.2) + Human Owner

This file is the canonical **Planning SOT** for this feature (6-Phase Framework).

Execution (implementation) is tracked separately in:
- specs/014-blog-feature/tasks.md (execution phases EXEC-0..EXEC-7; contract-first + frontend-first)

## Locking & Change Control (AI Safety)

Lock rule:
- When you approve this plan, change `Status` at the top of this file to: `Locked (Approved)`.

After lock:
- Any scope/order/data-contract change must be recorded as a written **Change Request** inside this SOT.
- Execution must follow specs/014-blog-feature/tasks.md phase-by-phase; do not improvise.

Links:
  - Raw Plan (source conversation + Prompt 1/2 outputs): DOC/Features/Blog Feature/RAW PLAN/Initial_idea.md
  - Framework: DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md
  - Authority Index: DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md
   - SOT Index (AI Continuity Pack / restart point): DOC/Features/Blog Feature/SOT/INDEX.md

---

## Scope Note (Critical)

Your Raw Plan “Prompt 2” defines 3 modules:
1) Blog System (AI SEO Blogs)
2) News System (AI Auto-News from RSS + Govt sources)
3) Newsletter System (AI weekly digest + automated campaigns)

This SOT focuses ONLY on module (1) Blog System end-to-end.

- In-scope here:
   - WordPress-level manual blog CMS functionality (create/edit/preview/schedule/publish, categories/tags, featured image, drafts)
  - AI-assisted SEO blog content (including optional RSS research of "top solar blog" sources to discover topics)
  - Public blog reading experience
  - Admin minimal workflow (approve/reject/schedule)
  - Scheduling + publishing (automation hooks)

- Explicitly out-of-scope for this SOT (tracked for later features):
  - News System (government announcements / real-time newsroom)
  - Newsletter System (digest creation + sending workflows)
  - Homeowner “attraction tools” (calculators, rebate finder, chatbot)

These are not deleted from your goal; they are intentionally deferred to prevent planning chaos.

---

# PHASE 0 — CONTEXT & LEGACY AUDIT (Existing Project → Audit Required)

## 0.1 What Already Exists (Confirmed in repo)

Public UI (mock-data driven):
- Public blog listing page exists at `src/app/blog/page.tsx`.
  - Uses static `allArticles` and `categories` from `src/data/blogData.ts`.
  - Client-side search + category filter + “Load more”.
  - Navigates to `/blog/post` by writing the clicked post to `sessionStorage`.

- Blog post page exists at `src/app/blog/post/page.tsx`.
  - Reads selected post from `sessionStorage`.
  - Contains hardcoded article body content (not tied to post).
  - Includes mock comments and a “fake auth” gate using `localStorage` (`homeownerAuth`).

Homepage references blog UI:
- `src/app/page.tsx` imports `BlogSection` and routes to `/blog`.
- `src/components/BlogSection.tsx` has its own hardcoded article list.

Newsletter (partial real backend):
- Newsletter subscription API exists: `src/app/api/newsletter/subscribe/route.ts`.
- Prisma model exists: `NewsletterSubscriber` in `prisma/schema.prisma`.

## 0.2 What Does NOT Exist Yet (Gaps)

- No Prisma models for blog posts, categories, tags, authorship, publishing states.
- No admin CMS pages to create/edit/approve/schedule blog posts.
- No WordPress-level authoring experience (drafts, preview, featured image management, revisions/versioning).
- No server-side rendering / route structure for canonical blog URLs (e.g., `/blog/[slug]`).
- No SEO sitemap / RSS feed generation for blog content.
- No AI generation pipeline (prompts, auditability, job history, approvals).
- No automation hooks (n8n/cron) for scheduled publishing.

## 0.3 Locked / Do-Not-Touch Areas (Current constraints)

No explicit “do-not-touch” areas were provided.
However, to preserve stability:
- Keep `/blog` route functional (existing marketing pages link to it).
- Avoid breaking homepage section routing.

## 0.4 Risks & Constraints

- Content quality + SEO risk if AI content is not controlled/approved.
- Copyright risk if RSS content is copied verbatim; the system must treat RSS as “signals + sources”, not as copy.
- Must follow repo authority hierarchy before implementation (SYSTEM_CONSTITUTION / Blueprint / AI Implementation Guidelines).

---

# PHASE 1 — VISION & PROBLEM STATEMENT (WHY)

## Feature Vision
Create a real, SEO-friendly blog that attracts homeowners and grows organic traffic, while minimizing admin workload through AI-assisted drafting and automation.

## Target Users
- Public visitors/homeowners (read/search/share)
- Admin (approve/reject/schedule; minimal manual writing)

## Problem Being Solved
Current blog experience is mock-data based and not connected to real content management or automation; there is no admin workflow, no scheduled publishing, and no scalable way to generate SEO content.

## Success Criteria (Measurable)
- Public blog pages render real posts from the database using canonical URLs.
- Admin can approve/reject and schedule posts with minimal actions.
- Posts support SEO meta (title/description/OG) and appear in sitemap.
- AI-assisted drafting exists with traceability (source links + generation history).

---

# PHASE 2 — USER STORIES (WHAT, NOT HOW)

## 2.1 Public Visitor / Homeowner
- Browse a list of blog posts.
- Filter by category/tag.
- Search by keyword.
- Open a blog post via a shareable URL.
- See related posts.
- Share a post (link previews work well).

## 2.2 Admin (Minimal Workflow)
- Approve or reject AI-generated drafts.
- Schedule approved posts.
- Publish immediately when needed.
- Edit title/meta before publishing.
- Manage categories/tags.

## 2.2b Admin (Manual Blog — WordPress Parity)
- Create a new blog post manually (title, slug, excerpt, content).
- Save drafts and continue editing later.
- Preview a post before publishing.
- Set featured image / hero image.
- Set categories and tags.
- Schedule a post for later.
- Edit an existing published post and republish updates.
- Archive/unpublish a post.
- View basic revision history and restore a previous revision (industry standard; can be MVP-lite).

## 2.3 System / AI / Automation (Blog module only)
- Suggest blog topics from:
  - Trending signals (future)
  - Optional RSS research on popular solar blog sources (discover topics; not copy)
- Generate:
  - Outline
  - Full article draft
  - SEO meta title/description
  - OG fields
  - “What this means for homeowners” section (blog variant)
- Detect outdated posts and propose refresh drafts.
- Auto-run scheduled publish at the configured time.

## 2.4 Explicit Exclusions (For Blog SOT)
- No government/newsroom “real-time news system” in this feature.
- No newsletter digest creation/sending workflows in this feature.
- No interactive “attraction tools” (calculator, rebate finder, chatbot) in this feature.

---

# PHASE 3 — FEATURE SCOPE & MODULES

## 3.1 Modules (Blog Only)

1) Public Blog (New/Modify)
- Modify existing mock `/blog` and `/blog/post` into real routes.
- Provide canonical post URLs.

2) Blog Content Model (New)
- Persist posts, publish states, categories/tags.

3) Admin Blog CMS (New)
- Minimal admin UI for approvals, edits, scheduling.

3b) Manual Blog Authoring (New)
- Modern WordPress-like editor workflow for manual posts (with preview + featured image + categories/tags).
- Revision history (at least basic version snapshots).

4) AI Drafting (New)
- Generate drafts; admin approves.

5) Automation Hooks (New)
- Scheduled publish workflow (future: n8n).

6) SEO Infrastructure (New)
- Meta tags per post.
- Sitemap + (optional) RSS feed.

## 3.2 Reuse vs Modify vs New
- Reuse (concept/UI only): existing BlogSection/blog pages as starting point.
- Modify: replace static data/sessionStorage with real routing + DB-backed content.
- New: Admin pages, Prisma models, API routes, AI job tracking.

---

# PHASE 4 — SYSTEM & FLOW DESIGN (HOW IT WORKS, IN ENGLISH)

## 4.1 Public Reading Flow
1) Visitor opens `/blog` → sees list of published posts.
2) Visitor searches/filters → list updates.
3) Visitor clicks a post → navigates to `/blog/[slug]`.
4) Post page loads content server-side; renders SEO meta.
5) Related posts appear based on tags/category.

## 4.2 Admin Minimal Workflow
1) System generates a draft (AI).
2) Admin sees “Pending Approval” list.
3) Admin actions:
   - Approve (optionally edit title/meta)
   - Reject (optional reason)
   - Schedule publish time
4) At publish time, the system publishes and updates sitemap.

## 4.2b Admin Manual Authoring Flow (WordPress-like)
1) Admin creates a new post (manual) and saves as draft.
2) Admin adds/edits content, sets featured image, categories/tags, SEO fields.
3) Admin previews the post.
4) Admin either publishes now, or schedules.
5) Editing a published post creates a new revision; admin can roll back if needed.

## 4.3 AI Draft Generation Flow (Blog)
1) Input:
   - Admin enters topic OR system proposes topics (RSS research optional).
2) AI generates:
   - Outline → Draft → SEO meta.
3) System stores:
   - Draft content
   - Model metadata
   - Source URLs used for research
   - Admin approval decision

## 4.4 RSS Research Flow (Blog, optional)
1) System fetches RSS from approved “blog sources list”.
2) Extracts:
   - Titles, summaries/snippets, links, dates.
3) AI proposes:
   - Blog topic ideas (not copied content)
   - SEO keyword suggestions
4) Admin approves a topic → AI generates original draft.

## 4.5 Error / Fallback Handling
- If AI generation fails: draft remains in “failed” state with error; admin can retry.
- If scheduled publish fails: system logs event and alerts admin (notification/email in later feature).

---

# PHASE 5 — TECHNICAL DESIGN (PROPOSAL ONLY, REQUIRES APPROVAL BEFORE CODING)

## 5.1 Data Model (Prisma) — Proposed
- BlogPost (slug, title, excerpt, body, status: DRAFT/PENDING/PUBLISHED/ARCHIVED, publishedAt, scheduledAt, heroImageUrl, seoTitle, seoDescription, ogImageUrl, author fields)
- BlogCategory
- BlogTag
- BlogPostTag join
- BlogDraftJob / ContentGenerationJob (topic input, status, model, sourceLinks, generatedAt, error)
- BlogSource (approved RSS sources list)

Additional (WordPress parity, can be MVP-lite):
- BlogPostRevision (postId, createdAt, title/body/meta snapshot, createdBy)
- BlogMediaAsset (optional if you want admin-uploaded images instead of only URLs)

Note: Exact schema must be designed delta-based and follow repo DB operations standard before any migration.

## 5.2 Pages / Routes — Proposed
Public:
- `/blog` (published list)
- `/blog/[slug]` (published post)

Admin:
- `/admin/blog` (queue + list)
- `/admin/blog/new` (manual creation)
- `/admin/blog/[id]` (edit/approve/schedule)

## 5.3 API Routes — Proposed
- Public: read-only endpoints (or server actions) for listing + fetching by slug.
- Admin: CRUD endpoints guarded by admin role.
- AI: generate endpoints guarded by admin role.

## 5.4 SEO
- Per-post metadata + OpenGraph.
- Sitemap generation includes blog posts.
- Optional: Blog RSS feed for subscribers.

## 5.5 Security
- Public can only read PUBLISHED posts.
- Admin operations require authenticated admin.
- AI generation endpoints must be rate limited and logged.

---

## Applied Decisions (Your Answers)

1) Admin area location
- Decision: inside existing Admin dashboard under `/admin/blog`.

2) AI provider + key storage
- Decision: OpenAI directly for now.
- Keys: env variables.
- Note: allow future “admin settings key override” for testing later phase.

3) Editorial workflow
- Decision: default `PENDING_APPROVAL`, with an option to enable auto-publish when you want.

4) Comments
- Decision: defer comments (remove mock comment/auth UI during implementation, or keep but disabled/hidden until later).

5) RSS blog sources allowlist
- Decision: you don’t have one yet; initial suggested allowlist below.

6) Post editor format
- Decision: both Markdown and rich-text (WYSIWYG).

7) Images (production)
- Decision: admin can upload images from local system and manage a Media Library (WordPress-like).
- Target: store originals in S3 (preferred) with a fallback option for local storage if needed.
- Admin can select an existing asset from the library or upload new during post editing.

8) Authors (production)
- Decision: follow WordPress-like author profile system.
- Target: author is a profile linked to an admin user, with display name and optional avatar/bio.

### Suggested RSS Sources (Topic Discovery Only)

These are intended for discovering topics and linking to sources, not copying.

- NREL (National Renewable Energy Laboratory) — news releases: https://www.nrel.gov/news/rss.xml
- U.S. Department of Energy — energy.gov news (general): https://www.energy.gov/rss
- IEA (International Energy Agency) — news and updates: https://www.iea.org/feeds/news.xml
- PV Magazine — global solar industry news: https://www.pv-magazine.com/feed/
- CleanTechnica (solar category; verify feed filtering as needed): https://cleantechnica.com/feed/
- Solar Power World: https://www.solarpowerworldonline.com/feed/
- Renewable Energy World: https://www.renewableenergyworld.com/feed/

Note: We should verify each feed’s stability and any content usage restrictions before wiring automation.

---

# PHASE 6 — LEGACY-AWARE DEVELOPMENT EXECUTION PLAN

This is an incremental build plan intended to preserve the existing `/blog` UX while making it real.

## Step-by-step Plan
1) Confirm authorities before coding (Constitution/Blueprint/AI Guidelines).
2) Add Prisma blog models (delta-only) + migrations (following DB ops standards).
3) Implement public read flows:
   - Replace static blog data with DB queries.
   - Replace `/blog/post` sessionStorage routing with `/blog/[slug]`.
4) Add admin CMS MVP:
   - Create/edit drafts.
   - Approve/publish.
   - Schedule publish.
5) Add AI drafting MVP:
   - Topic → outline → draft.
   - Store job history + source links.
6) Add SEO infrastructure:
   - Metadata per post.
   - Sitemap.
7) Add automation hook for scheduled publishing:
   - Simple cron strategy first.
   - n8n integration later.

## Testing / Validation (per incremental step)
- Gate 0 typecheck/build checks after each major step.
- Manual sanity:
  - `/blog` list renders
  - `/blog/[slug]` shareable URLs work
  - Admin can publish and post appears publicly

## Rollback Strategy
- Keep changes incremental:
  - Maintain `/blog` route and update internals.
  - Avoid deleting old mock data until the DB-backed flow is proven.

---
