# Current State Audit — Admin Blog CMS (for Phase 2)

**Status**: Draft (Audit complete; pending review)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-30

Purpose: E2E current-state audit for the existing **admin blog CMS** surface so Phase 2 can extend it safely.

Scope:
- Admin blog routes
- Admin blog APIs
- Prisma/DB blog schema
- Integrations related to blog scheduling

Out of scope:
- Guest blog audit (already exists in Phase 1 SOT)

---

## 1) Frontend UI (As-Is)

### Existing Admin Routes
- `src/app/admin/blog/page.tsx`
  - Lists posts from `/api/admin/blog/posts` via `src/lib/blog/adminApiClient.ts`.
  - Matches admin layout standard (padding-only wrapper).
- `src/app/admin/blog/new/page.tsx`
  - “Create Draft” form with fields (title, slug, excerpt, content, coverImageUrl, readTime, category, tagsCsv, seo fields, status, scheduledFor).
  - Uses preview pane (plain text rendering).
- `src/app/admin/blog/[id]/page.tsx`
  - Edit form with similar fields.
  - Includes “Reset slug from title” behavior.
  - Includes AI drafting UI that calls `/api/admin/blog/ai/generate`.
- `src/app/admin/blog/[id]/preview/page.tsx`
  - Admin preview route exists.
- Placeholder routes (Phase 1 placeholders):
  - `src/app/admin/blog/categories/page.tsx`
  - `src/app/admin/blog/tags/page.tsx`

### Gaps vs Phase-2 Prototype
- Posts list is not yet WP-like (no bulk actions UX, no date/category filters, no row hover actions).
- No combined Taxonomy UI.
- No Comments page.
- No Media library.
- Editor UI exists but does not match prototype layout/controls (publishing meta-box + tabs + fixed action bar).

---

## 2) Backend / API (As-Is)

### Existing Admin APIs
- `src/app/api/admin/blog/posts/route.ts`
  - `GET` supports optional `status` query.
  - `POST` creates post; enforces unique slug; connect-or-create category + tags.
  - Auth: `requireAdmin()`.
  - Handles Prisma missing-table error `P2021` with a friendly message.

- `src/app/api/admin/blog/posts/[id]/route.ts`
  - `GET` fetches by id.
  - `PATCH` updates partial fields.
    - slug uniqueness check on edits.
    - category connect-or-create.
    - tags replace via `deleteMany` + `create`.
  - `DELETE` hard-deletes a post.
  - Auth: `requireAdmin()`.
  - Handles Prisma missing-table error `P2021`.

- `src/app/api/admin/blog/ai/generate/route.ts`
  - Admin-only AI generation.
  - Uses rate limiter.
  - Logs to `BlogAiRequestLog`.
  - Uses OpenAI via `OPENAI_API_KEY` and `OPENAI_MODEL`.

### Existing Public APIs
- `src/app/api/blog/posts/route.ts`
- `src/app/api/blog/posts/[slug]/route.ts`
(Phase 2 should not regress these.)

### Integrations / Automation (Existing)
- n8n webhook routes exist under `src/app/api/webhooks/n8n/blog/*` (create draft, schedule, run-scheduler).

---

## 3) Prisma / DB (As-Is)

Blog-related schema currently exists in `prisma/schema.prisma`:
- Enums:
  - `BlogPostStatus`: `DRAFT`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`
  - `BlogJobType`, `BlogJobStatus`
- Models:
  - `BlogPost`
  - `BlogCategory`
  - `BlogTag`
  - `BlogPostTag` (many-to-many join)
  - `BlogAiRequestLog`
  - `BlogJobLog`

Notably missing for Phase 2:
- No `BlogComment` model.
- No `BlogMediaAsset` model.

---

## 4) Risks / Locked Areas

### Locked / Do-not-break
- Guest blog routes and behavior as defined in Phase 1 SOT.
- Admin post CRUD must keep working throughout UI refactor.
- Theming + admin layout standards.

### Known mismatches to resolve in Phase 2
- Prototype expects “Trash” to archive; current API supports **hard delete**.
  - Phase-2 plan recommends: map “Trash” to status `ARCHIVED` (no hard delete).

---

## 5) What Exists vs What Must Be Built

### Reuse as-is
- Blog Prisma post/category/tag foundation
- Admin auth pattern `requireAdmin()`
- Existing admin post CRUD endpoints
- Existing AI audit logging

### Modify
- Admin posts list UI to prototype WP-like list
- Admin editor UI to prototype (publishing meta-box, tabs, schedule editor)
- Admin API DELETE behavior (Trash => archive)
- Posts list API to support query/search filters (optional)

### Build new
- Admin Taxonomy UI + CRUD endpoints
- Admin Comments UI + backend (if approved)
- Admin Media library UI + backend + presigned upload
- AI alt-text action for media (server-side)
