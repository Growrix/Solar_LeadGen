# Blog Feature — Context & Legacy Audit

Date: 2025-12-28
Scope: Blog Feature only (not News System, not Newsletter System)
Canonical SOT: DOC/Features/Blog Feature/SOT/FEATURE-SOT.md

---

## Current State (Confirmed)

Public Blog UI exists (mock-data driven):
- `src/app/blog/page.tsx`
  - Renders static posts from `src/data/blogData.ts`
  - Client-side search/filter
  - Uses `sessionStorage` to pass selected post to `/blog/post`

- `src/app/blog/post/page.tsx`
  - Reads post from `sessionStorage`
  - Article body is hardcoded (not from post)
  - Contains mock comments + mock auth gate via `localStorage` key `homeownerAuth`

Homepage Blog block:
- `src/components/BlogSection.tsx` uses hardcoded articles
- `src/app/page.tsx` routes to `/blog`

Newsletter (already real backend):
- Prisma: `NewsletterSubscriber` exists in `prisma/schema.prisma`
- API: `src/app/api/newsletter/subscribe/route.ts`

S3 tooling exists:
- `src/lib/s3.ts` uses AWS SDK and supports presigned URLs (environment-driven)

---

## Gaps vs Target (WordPress-level + AI)

- No DB-backed blog models (posts, categories, tags, revisions, media library, author profiles).
- No admin blog CMS under `/admin/blog`.
- No canonical shareable URLs for posts (`/blog/[slug]`).
- No production media upload + library for blog assets.
- No AI drafting pipeline or job history.
- No scheduled publishing executor.
- No blog sitemap integration.

---

## Risk Notes

- Do not copy RSS text verbatim; RSS is only used for topic discovery + citation/source linking.
- DB changes must follow the repo DB Operations Standard (backup-first; no destructive commands).
- Keep existing `/blog` route working during migration to DB-backed.

---

## Recommendation

Proceed via incremental phases (see `specs/014-blog-feature/tasks.md`):
1) Gate 0 checks
2) Schema + Prisma client generation
3) Public blog routes migrated to DB-backed `/blog/[slug]`
4) Admin CMS + Media Library
5) AI draft generation + approvals
6) Scheduling + sitemap
