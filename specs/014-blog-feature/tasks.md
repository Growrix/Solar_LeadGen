# Blog Feature (WordPress-level + AI) — Tasks

Status: Ready (pre-implementation)
SOT: DOC/Features/Blog Feature/SOT/FEATURE-SOT.md
Audit: DOC/Features/Blog Feature/BLOG-FEATURE-AUDIT-2025-12-28.md

---

## PHASE 0 — GATE 0 System Health (Mandatory)

Run and record results:
- `npx tsc --noEmit`
- `npx prisma validate`
- `npm run build`

Stop if any check fails.

---

## PHASE 1 — Blog Domain Modeling (DB + Types) (No UI yet)

Goal: introduce canonical blog entities without breaking existing data.

Rules:
- Follow DB Operations Standard (backup-first; no destructive commands).
- After schema edits run `npx prisma generate` immediately.

Tasks:
- Add Prisma models (delta-based) for:
  - BlogPost (status state machine; slug; SEO fields)
  - BlogCategory
  - BlogTag
  - BlogPostTag join
  - BlogPostRevision (basic snapshots)
  - BlogMediaAsset (media library; S3/local storage metadata)
  - BlogAuthorProfile (WordPress-like author profile linked to an admin user)
  - BlogDraftJob (AI generation history + source links)
  - BlogSource (RSS allowlist)

Checkpoint:
- `npx prisma validate` passes
- `npx tsc --noEmit` passes
- `npm run build` passes

---

## PHASE 2 — Public Blog (DB-backed, canonical URLs)

Goal: keep `/blog` working, migrate away from mock/sessionStorage.

Tasks:
- Replace static data usage with DB queries for published posts.
- Add canonical post route: `/blog/[slug]` (server-rendered; SEO metadata).
- Deprecate `/blog/post` sessionStorage flow (keep redirect or remove once safe).

Checkpoint:
- Manual: `/blog` renders list
- Manual: `/blog/<slug>` loads directly (shareable)
- `npm run build` passes

---

## PHASE 3 — Admin Blog CMS (WordPress parity)

Goal: production-grade manual CMS under `/admin/blog`.

Tasks:
- Admin list: drafts/pending/published/archived
- Admin editor:
  - Title, slug, excerpt
  - Content editor supports both: Markdown + rich text
  - Categories/tags
  - Featured image
  - Preview
  - Schedule / publish now
- Revisions:
  - Create a new revision snapshot on publish and on manual save checkpoints
  - Allow restore of a revision (MVP-lite)

Checkpoint:
- `npx tsc --noEmit` passes
- `npm run build` passes
- Manual: create draft → preview → publish → appears on public blog

---

## PHASE 4 — Media Library (Uploads + Management)

Goal: WordPress-like media upload + reuse.

Tasks:
- Add admin media library UI:
  - Upload image from local system
  - Browse/search/select existing assets
- Implement upload pipeline:
  - Prefer S3 using existing `src/lib/s3.ts` patterns
  - Persist `BlogMediaAsset` rows (key/url/type/size/createdBy)
  - Provide presigned upload and presigned read where needed

Checkpoint:
- Manual: upload image → appears in library → selectable as featured image
- Manual: published post shows featured image correctly

---

## PHASE 5 — AI Drafting (Admin-assisted)

Goal: AI generates drafts, admin approves.

Tasks:
- Add admin action: generate draft from topic
- Store:
  - prompt inputs
  - model metadata
  - source links used for topic discovery
  - job status + errors
- Default workflow: PENDING_APPROVAL
- Optional: allow auto-publish toggle

Checkpoint:
- Manual: generate → appears as pending → approve → schedule/publish

---

## PHASE 6 — Scheduling + SEO Plumbing

Tasks:
- Scheduled publish executor (simple cron approach first; n8n later)
- Blog sitemap integration

Checkpoint:
- Manual: schedule in future → publish occurs
- Sitemap includes published blog posts

---

## Safety / Stop Rules

- If any phase introduces TypeScript errors, build warnings, or route conflicts: stop and fix before continuing.
- Never use destructive DB commands (`migrate reset`, `db push --force-reset`, etc.).
