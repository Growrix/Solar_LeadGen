# CURRENT UI AUDIT — BLOG

**Status**: Draft (Baseline capture)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2026-01-05

Purpose: document the **as-is** BLOG feature across frontend, backend, DB, and integrations so future planning does not re-add or break what already exists.

---

## 1) Frontend (Public)

### Routes
- `/blog`
  - Page: `src/app/blog/page.tsx`
  - Client: `src/app/blog/BlogPageClient.tsx`
  - Data source: `src/lib/blog/adapter.ts` → `/api/blog/posts`

- `/blog/[slug]`
  - Page: `src/app/blog/[slug]/page.tsx`
  - Data source: `src/lib/blog/adapter.ts` → `/api/blog/posts/[slug]`

- `/blog/post` (legacy compatibility route)
  - Page: `src/app/blog/post/page.tsx`
  - Client: `src/app/blog/post/BlogPostPageClient.tsx`
  - Behavior:
    - Reads `sessionStorage.currentBlogPost`
    - If possible, redirects to `/blog/[slug]`
    - Otherwise renders the stored post (legacy behavior)

### Notable coupling
- Legacy navigation relies on `sessionStorage` for passing the post payload.

---

## 2) Frontend (Admin)

### Routes
- `/admin/blog`
  - Page: `src/app/admin/blog/page.tsx`

- `/admin/blog/new`
  - Page: `src/app/admin/blog/new/page.tsx`

- `/admin/blog/[id]`
  - Page: `src/app/admin/blog/[id]/page.tsx`

- `/admin/blog/[id]/preview`
  - Page: `src/app/admin/blog/[id]/preview/page.tsx`

- Taxonomy
  - `/admin/blog/categories`: `src/app/admin/blog/categories/page.tsx`
  - `/admin/blog/tags`: `src/app/admin/blog/tags/page.tsx`
  - (Also present) `/admin/blog/taxonomy`: `src/app/admin/blog/taxonomy/page.tsx`

### Admin navigation links
- Admin sidebar/menu includes Blog links:
  - `src/components/AdminSidebar.tsx`
  - `src/components/AdminMobileSidebarMenu.tsx`

---

## 3) Backend APIs (Public)

- `GET /api/blog/posts`
  - Route: `src/app/api/blog/posts/route.ts`
  - Behavior: lists **published** posts (server-side filtering)

- `GET /api/blog/posts/[slug]`
  - Route: `src/app/api/blog/posts/[slug]/route.ts`
  - Behavior: returns a **published** post by slug

---

## 4) Backend APIs (Admin)

Admin APIs are protected via `requireAdmin()`.

- `GET/POST /api/admin/blog/posts`
  - Route: `src/app/api/admin/blog/posts/route.ts`

- `GET/PATCH/DELETE /api/admin/blog/posts/[id]`
  - Route: `src/app/api/admin/blog/posts/[id]/route.ts`

- `GET/POST /api/admin/blog/categories`
  - Route: `src/app/api/admin/blog/categories/route.ts`

- `GET/PATCH/DELETE /api/admin/blog/categories/[id]`
  - Route: `src/app/api/admin/blog/categories/[id]/route.ts`

- `GET/POST /api/admin/blog/tags`
  - Route: `src/app/api/admin/blog/tags/route.ts`

- `GET/PATCH/DELETE /api/admin/blog/tags/[id]`
  - Route: `src/app/api/admin/blog/tags/[id]/route.ts`

- `POST /api/admin/blog/ai/generate`
  - Route: `src/app/api/admin/blog/ai/generate/route.ts`
  - Notes:
    - Server-only key: `OPENAI_API_KEY`
    - Model env: `OPENAI_MODEL` (default `gpt-4o-mini`)
    - Rate limiting: `checkRateLimit()`
    - Audit log: `BlogAiRequestLog`

---

## 5) Integrations / Automation (n8n)

All n8n webhooks are protected by a shared secret:
- Env var: `N8N_WEBHOOK_SECRET`
- Accepted via:
  - Header: `x-n8n-secret`
  - Or query param: `?secret=...`

Shared helper:
- `src/app/api/webhooks/n8n/blog/_shared.ts`

Webhooks:
- `POST /api/webhooks/n8n/blog/create-draft`
  - Route: `src/app/api/webhooks/n8n/blog/create-draft/route.ts`
  - Logs: `BlogJobLog` type `N8N_CREATE_DRAFT`

- `POST /api/webhooks/n8n/blog/schedule`
  - Route: `src/app/api/webhooks/n8n/blog/schedule/route.ts`
  - Logs: `BlogJobLog` type `N8N_SCHEDULE_POST`

- `POST /api/webhooks/n8n/blog/run-scheduler`
  - Route: `src/app/api/webhooks/n8n/blog/run-scheduler/route.ts`
  - Behavior: publishes due scheduled posts
  - Logs: `BlogJobLog` type `PUBLISH_SCHEDULED`

---

## 6) Database (Prisma)

Schema definitions:
- `prisma/schema.prisma`

Blog enums:
- `BlogPostStatus` = `DRAFT | SCHEDULED | PUBLISHED | ARCHIVED`
- `BlogJobType` = `PUBLISH_SCHEDULED | N8N_CREATE_DRAFT | N8N_SCHEDULE_POST`
- `BlogJobStatus` = `SUCCESS | FAILURE`

Blog tables:
- `BlogPost` (unique `slug`, lifecycle status, SEO fields, scheduled/published timestamps)
- `BlogCategory`
- `BlogTag`
- `BlogPostTag` (join)
- `BlogAiRequestLog` (AI audit)
- `BlogJobLog` (automation audit)

---

## 7) Gaps / Follow-ups

- Confirm the public blog UI renders DB-backed post body consistently (markdown vs plain text).
- Confirm who is set as `authorId` for n8n-created drafts (and what admin user is used).
- Confirm SEO metadata source-of-truth (page `generateMetadata` vs stored fields).
- Confirm whether `/blog/post` is still required long-term; keep for compatibility until explicitly removed.
