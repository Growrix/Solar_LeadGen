# Blog Feature — Strapi Decision & Architecture (SOT Supporting Doc)

- Status: Draft (Pending Approval)
- Date: 2025-12-28
- Owner: AI (GitHub Copilot / GPT-5.2) + Human Owner

Purpose: Capture the architectural “way we build Blog now” after switching the Blog CMS backend to Strapi, while keeping the public blog UI inside this Next.js app.

This document supports the canonical plan in:
- DOC/Features/Blog Feature/SOT/FEATURE-SOT.md

---

## 1) Decision (What changed)

We are switching Blog content management from an in-app custom CMS (Prisma + Next.js admin) to a headless CMS:
- CMS: Strapi
- Frontend: Next.js public blog pages remain the source of UI/UX for visitors

Rationale:
- Faster to reach “WordPress-level” CMS capabilities (media, roles, editorial workflow)
- Better long-term maintainability for content operations
- Automation can scale via Strapi APIs (draft creation, scheduling, publishing)

Non-goals:
- We do not attempt to copy Strapi admin UI into our Next.js admin.
- We do not merge identity systems in Phase 1 unless required.

---

## 2) High-level System Architecture

Actors:
- Admin/Editors: Use Strapi Admin (separate dashboard)
- Visitors: Use Next.js public blog pages
- Automation: n8n + a small “Blog Automation Worker” service (or n8n-only, depending on complexity)

Data flow:
1) Admin creates/edits posts in Strapi → posts are stored in Strapi DB
2) Next.js reads published posts from Strapi API → renders public pages
3) Automation creates drafts in Strapi via API → admin approves/schedules/publishes (or auto-publish when enabled)

---

## 3) Strapi Content Model (Proposed)

Keep this minimal and map cleanly to public UI + SEO.

### 3.1 Collection Types
- Post
  - title (string)
  - slug (UID)
  - excerpt (text)
  - content (rich text)
  - featuredImage (media)
  - categories (relation)
  - tags (relation)
  - author (relation)
  - status fields: use Strapi Draft/Publish + optional custom workflow state (e.g. PENDING_APPROVAL)
  - publishedAt (datetime) (Strapi-managed)
  - scheduledAt (datetime) (optional; if using automation for scheduled publishing)
  - seoTitle, seoDescription (string/text)
  - ogImage (media) (optional)
  - canonicalUrl (string) (optional; usually derived)

- Category
  - name, slug

- Tag
  - name, slug

- Author
  - displayName, bio, avatar (media)

### 3.2 Optional Types (Phase 2+)
- Source (RSS allowlist)
- GenerationJob (AI generation history, source URLs, model metadata)

Note: If GenerationJob is stored outside Strapi (recommended for auditability), it will live in this app DB later under its own feature/spec.

---

## 4) Next.js Public Blog Integration

### 4.1 Rendering strategy
- `/blog` list page: fetch published posts from Strapi
- `/blog/[slug]` post page: fetch one post by slug

Recommended approach:
- Server-side fetching in Next.js route handlers / server components
- Add caching strategy (ISR/revalidate) so Strapi isn’t hit on every request unnecessarily

### 4.2 Draft preview (Optional)
Two approaches:
- Keep preview inside Strapi only (simplest)
- Add Next.js “preview mode” that can fetch draft content using a preview token (requires secured access)

---

## 5) Auth, Security, and Tokens

Principles:
- Public site uses read-only access and only reads published content
- Automation uses privileged API token and must be protected and auditable

Token separation:
- `STRAPI_PUBLIC_API_TOKEN` (read-only, least privilege)
- `STRAPI_ADMIN_API_TOKEN` (write access, automation only)

Do not expose admin token to the browser.

---

## 6) Admin Dashboard Integration (Our App)

Options (choose one, simplest first):
1) Add “Blog (Strapi)” item in our admin sidebar that opens Strapi Admin in a new tab
2) Add “Blog” in our admin that is read-only analytics/status and deep-links to Strapi for editing

We do NOT copy Strapi’s admin UI into our app.

---

## 7) Migration / Coexistence Strategy

- Keep current partially built in-app Blog CMS code as “legacy/disabled” while we switch the source of truth to Strapi.
- Public pages are the priority: once they read from Strapi, the public experience becomes real.
- After stabilization, we can delete or archive legacy admin blog UI (only after approval).
