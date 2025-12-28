# Blog Feature (WordPress-level + AI) — Execution Tasks (AI-Controlled)

Status: Ready (pre-implementation)

Source of Truth:
- Planning SOT (6-Phase Framework: Phases 0–5 docs + Phase 6 intent): DOC/Features/Blog Feature/SOT/FEATURE-SOT.md
- SOT Index (AI Continuity Pack / restart point): DOC/Features/Blog Feature/SOT/INDEX.md

Supporting:
- Audit: DOC/Features/Blog Feature/BLOG-FEATURE-AUDIT-2025-12-28.md

---

## EXEC-0 — GATE 0 System Health (Mandatory)

Run and record results:
- `npx tsc --noEmit`
- `npx prisma validate`
- `npm run build`

Stop if any check fails.

---

## EXEC-0.5 — DOCUMENTATION LOCK (Mandatory, before any code)

Goal: lock the plan so AI never loses the “what/why/how” across sessions.

Tasks:
- Confirm SOT is complete for Phases 0–5 (audit → vision → stories → scope → flows → technical proposal).
- Confirm the execution approach is **contract-first + frontend-first**.
- Mark SOT status as `Locked (Approved)`.

Checkpoint:
- SOT is explicitly locked and referenced from the SOT Index.
- No implementation starts until this is true.

---

## EXEC-1 — CONTRACT-FIRST (Types + Mock Data Provider) (No DB yet)

Goal: define the canonical “shape” of the blog system once, so the frontend is built against the same contract the backend will later implement.

Rules:
- Do NOT change the database in this phase.
- Define types/interfaces that mirror the planned Prisma entities.
- The UI must consume a single provider interface (mock now, real backend later).

Tasks:
- Define domain types for:
  - BlogPost (status state machine; slug; SEO fields)
  - BlogCategory
  - BlogTag
  - BlogPostRevision (basic snapshots)
  - BlogMediaAsset (media library metadata)
  - BlogAuthorProfile
- Add a mock provider implementing the contract (in-memory/static data).

Checkpoint:
- `npx tsc --noEmit` passes
- `npm run build` passes

---

## EXEC-2 — FRONTEND FIRST: Public Blog (Contract-backed)

Goal: keep `/blog` working while moving to canonical URLs, without waiting for backend.

Tasks:
- Public list:
  - Migrate `/blog` to consume the contract provider (mock provider initially).
- Canonical route:
  - Add `/blog/[slug]` (server-rendered; SEO metadata) consuming the contract provider.
- Deprecation:
  - Replace `/blog/post` sessionStorage flow with redirect to `/blog/[slug]` once safe.

Checkpoint:
- Manual: `/blog` renders list (mock provider)
- Manual: `/blog/<slug>` loads directly (shareable)
- `npm run build` passes

---

## EXEC-3 — FRONTEND FIRST: Admin Blog CMS (WordPress parity)

Goal: production-grade manual CMS under `/admin/blog`, built against the same contract provider.

Tasks:
- Admin list: drafts/pending/published/archived (mock provider)
- Admin editor (mock provider):
  - Title, slug, excerpt
  - Content editor supports both: Markdown + rich text
  - Categories/tags
  - Featured image (select from media library contract)
  - Preview
  - Schedule / publish now
- Revisions (UI + contract only in this phase):
  - Show revision list
  - Allow selecting a revision to restore (mocked behavior)

Checkpoint:
- `npx tsc --noEmit` passes
- `npm run build` passes
- Manual: create draft → preview → publish → appears on public blog (mock provider)

---

## EXEC-4 — BACKEND: Database + APIs (Match the Locked Contract)

Goal: implement the real backend to match the contract the UI already uses.

Rules:
- Follow DB Operations Standard (backup-first; no destructive commands).
- After schema edits run `npx prisma generate` immediately.
- Do NOT change frontend contracts in this phase unless a written Change Request is approved.

Tasks:
- Add Prisma models (delta-based) for:
  - BlogPost, BlogCategory, BlogTag, BlogPostTag join
  - BlogPostRevision
  - BlogMediaAsset
  - BlogAuthorProfile
  - BlogDraftJob
  - BlogSource
- Add backend data access + API surface that returns the same shapes as the contract.

Checkpoint:
- `npx prisma validate` passes
- `npx tsc --noEmit` passes
- `npm run build` passes

---

## EXEC-5 — INTEGRATION: Swap Mock Provider → Real Backend

Goal: wire the existing UI to the backend without rewriting UI components.

Tasks:
- Replace mock provider implementation with real backend calls.
- Keep UI behavior identical; only data source changes.
- Implement media upload pipeline end-to-end:
  - Prefer S3 using existing `src/lib/s3.ts` patterns
  - Persist `BlogMediaAsset` rows (key/url/type/size/createdBy)
  - Provide presigned upload and presigned read where needed

Checkpoint:
- Manual: `/blog` and `/blog/<slug>` load from DB
- Manual: admin create draft → publish → appears in public blog (DB)
- Manual: upload image → appears in library → selectable as featured image
- `npm run build` passes

---

## EXEC-6 — AI Drafting (Admin-assisted)

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

## EXEC-7 — Scheduling + SEO Plumbing

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
