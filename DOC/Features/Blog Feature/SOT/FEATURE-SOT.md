# Blog Feature — AI-Powered SEO Blog System (E2E)

- Status: Change Request Pending (Switch to Strapi)
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

Strapi supporting docs:
   - Strapi decision + architecture: DOC/Features/Blog Feature/SOT/STRAPI-DECISION-AND-ARCHITECTURE.md
   - Automation pipeline: DOC/Features/Blog Feature/SOT/AUTOMATION-PIPELINE.md

---

## Change Request (Approved Direction, Plan Update Required)

Change: Switch Blog CMS backend from in-app custom CMS (Prisma + Next.js Admin) to **Strapi headless CMS**.

Reason:
- You decided to use Strapi for better CMS capability and scalability.
- We still need automation for blog post creation (AI + RSS research signals + scheduling), as described in the Raw Plan.

Immediate implications:
- Public blog pages remain in this Next.js app, but content source becomes Strapi.
- Our Next.js Admin dashboard should not attempt to copy Strapi’s admin UI.
- Any partially built in-app Blog admin/editor UI becomes “legacy/paused” until we decide to remove it safely.

Locking rule:
- This SOT is now **unlocked** (Change Request Pending). Do not continue execution tasks until you re-approve and we set status back to `Locked (Approved)`.

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

Admin blog UI (partially implemented):
- `/admin/blog` entry was added to the admin navigation.
- A rich text editor UI was integrated for blog authoring (in-app), but this will be superseded by Strapi authoring once the change request is adopted.

## 0.2 What Does NOT Exist Yet (Gaps)

- No Prisma models for blog posts, categories, tags, authorship, publishing states.
- No admin CMS pages to create/edit/approve/schedule blog posts.
- No WordPress-level authoring experience (drafts, preview, featured image management, revisions/versioning).
- No server-side rendering / route structure for canonical blog URLs (e.g., `/blog/[slug]`).
- No SEO sitemap / RSS feed generation for blog content.
- No AI generation pipeline (prompts, auditability, job history, approvals).
- No automation hooks (n8n/cron) for scheduled publishing.

Strapi-specific gaps (new plan):
- No Strapi instance configured for Blog content yet.
- No Strapi content model defined (Post/Category/Tag/Author + media usage).
- No Next.js public blog pages fetching content from Strapi yet.
- No automation pipeline wiring to create drafts/publish via Strapi APIs.

## 0.3 Locked / Do-Not-Touch Areas (Current constraints)

No explicit “do-not-touch” areas were provided.
However, to preserve stability:
- Keep `/blog` route functional (existing marketing pages link to it).
- Avoid breaking homepage section routing.

## 0.4 Risks & Constraints

- Content quality + SEO risk if AI content is not controlled/approved.
- Copyright risk if RSS content is copied verbatim; the system must treat RSS as “signals + sources”, not as copy.
- Must follow repo authority hierarchy before implementation (SYSTEM_CONSTITUTION / Blueprint / AI Implementation Guidelines).
- Automation must not copy RSS text verbatim (copyright + trust risk). RSS is for discovery + citations only.

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

Note: With Strapi, these actions happen in Strapi Admin by default (not in our Next.js admin).

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

Note: With Strapi, “WordPress parity” is achieved via Strapi’s editor + media system, and optionally extensions/plugins.

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

## 3.1 Modules (Blog Only, Strapi-based)

1) Strapi CMS for Blog (New)
- Strapi becomes the system of record for blog content and media.
- Admin/editor workflow primarily happens in Strapi Admin.

2) Public Blog (Modify)
- Keep Next.js public blog UI and routes, but change data source to Strapi.
- Provide canonical post URLs (prefer `/blog/[slug]`).

3) Admin Dashboard Integration (Modify)
- Our Next.js admin should expose a clear entrypoint (e.g., “Blog (Strapi)”) linking to Strapi Admin.
- Optional: add read-only status panels later (draft count, publish schedule), but do not re-implement the CMS UI.

4) AI Drafting + Automation (New)
- Use n8n and/or a small worker to generate drafts and create them in Strapi via API.
- Admin approves/schedules/publishes in Strapi (minimal actions).

5) SEO Infrastructure (Modify/New)
- Per-post metadata + OpenGraph driven from Strapi fields.
- Sitemap includes published blog posts.
- Optional: Blog RSS feed for subscribers.

## 3.2 Reuse vs Modify vs New
- Reuse (concept/UI): existing BlogSection/blog pages as starting point.
- Modify: replace static data/sessionStorage with canonical URLs and Strapi-backed content.
- New: Strapi CMS content model + automation pipeline; optional job audit store.

---

# PHASE 4 — SYSTEM & FLOW DESIGN (HOW IT WORKS, IN ENGLISH)

## 4.1 Public Reading Flow
1) Visitor opens `/blog` → sees list of published posts.
2) Visitor searches/filters → list updates.
3) Visitor clicks a post → navigates to `/blog/[slug]`.
4) Post page loads content server-side; renders SEO meta.
5) Related posts appear based on tags/category.

Data source:
- Next.js fetches published content from Strapi API.

## 4.2 Admin Minimal Workflow
1) Automation generates a draft (AI) and creates it in Strapi.
2) Admin reviews drafts in Strapi (optional: keep a “PENDING_APPROVAL” workflow state).
3) Admin actions (Strapi):
   - Approve (optionally edit title/meta)
   - Reject (optional reason)
   - Schedule publish time (either Strapi scheduling or automation-driven)
4) At publish time, publish occurs and the public site is revalidated/sitemap updated.

## 4.2b Admin Manual Authoring Flow (WordPress-like)
In Strapi Admin:
1) Admin creates a new post (manual) and saves as draft.
2) Admin edits content, sets featured image/media, categories/tags, SEO fields.
3) Admin previews (either in Strapi or via optional Next.js preview mode).
4) Admin publishes now or schedules.
5) Revision strategy depends on Strapi capabilities and/or an additional “revisions” layer (optional).

## 4.3 AI Draft Generation Flow (Blog)
1) Input:
   - Admin enters topic OR system proposes topics (RSS research optional).
2) AI generates:
   - Outline → Draft → SEO meta.
3) Automation stores (minimum):
   - Source URLs used for research
   - Model metadata
   - Job status/errors
4) Automation creates the draft post in Strapi (Draft).

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

Reference for Strapi + automation details:
- DOC/Features/Blog Feature/SOT/STRAPI-DECISION-AND-ARCHITECTURE.md
- DOC/Features/Blog Feature/SOT/AUTOMATION-PIPELINE.md

---

# PHASE 5 — TECHNICAL DESIGN (PROPOSAL ONLY, REQUIRES APPROVAL BEFORE CODING)

## 5.1 Data Model (Strapi) — Proposed

Strapi becomes the canonical data model for Blog.

Minimum types:
- Post (title, slug, excerpt, content, featuredImage, categories, tags, author, seoTitle, seoDescription, ogImage, publishedAt)
- Category (name, slug)
- Tag (name, slug)
- Author (displayName, bio, avatar)

Automation/job audit storage (two options):
1) Store in Strapi (GenerationJob type) for simplicity
2) Store in this app (separate feature later) for stronger auditability and scaling

## 5.2 Pages / Routes — Proposed
Public:
- `/blog` (published list)
- `/blog/[slug]` (published post)

Admin:
- Our app:
   - `/admin` sidebar includes “Blog (Strapi)” entrypoint (link-out)
- Strapi:
   - Strapi Admin is the authoring CMS UI

## 5.3 API Routes — Proposed
- Public: server-side fetches from Strapi for listing + fetching by slug.
- Automation: privileged Strapi API calls for creating drafts and publishing.
- Optional: Next.js “revalidate” endpoint to update cached pages after publish.

## 5.4 SEO
- Per-post metadata + OpenGraph.
- Sitemap generation includes blog posts.
- Optional: Blog RSS feed for subscribers.

## 5.5 Security
- Public can only read PUBLISHED posts.
- Strapi Admin is protected by Strapi auth and network/environment controls.
- Automation tokens must be least-privilege and never exposed to client.

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

# PHASE 6 — LEGACY-AWARE DEVELOPMENT EXECUTION PLAN (Strapi)

This is an incremental build plan intended to preserve the existing `/blog` UX while moving content ownership to Strapi.

## Step-by-step Plan
1) Confirm authorities before any implementation (Constitution/Blueprint/AI Guidelines).
2) Stand up Strapi instance and define Blog content types (Post/Category/Tag/Author + media).
3) Switch Next.js public blog routes to fetch published content from Strapi:
   - `/blog` list
   - `/blog/[slug]` canonical post page
   - Deprecate `/blog/post` sessionStorage flow safely
4) Admin dashboard integration:
   - Add/keep an admin navigation entry that takes admins to Strapi (link-out)
5) Automation MVP:
   - n8n (or worker) generates drafts and creates them in Strapi
   - Admin approves/schedules/publishes in Strapi
6) SEO plumbing:
   - Per-post metadata
   - Sitemap generation + publish-triggered revalidation

## Testing / Validation (per incremental step)
- Gate 0 typecheck/build checks after each major step.
- Manual sanity:
  - `/blog` list renders
  - `/blog/[slug]` shareable URLs work
  - Admin can publish and post appears publicly

## Rollback Strategy
- Keep changes incremental:
  - Maintain `/blog` route and update internals.
   - Avoid deleting old mock data or legacy admin UI until Strapi-backed flow is proven.

---
