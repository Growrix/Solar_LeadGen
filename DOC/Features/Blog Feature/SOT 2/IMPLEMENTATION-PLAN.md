# Implementation Plan — Blog Manual (Pre-Approval Draft)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-29

Purpose: define *exactly what we implement first*, sequencing, validation checks, and stop rules.

This plan is derived from:
- `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`

---

## 0) Stop Rules (Non-Negotiable)
- No database migrations until the frontend-first Phase 1 is approved.
- No AI endpoint implementation until admin auth patterns are confirmed.
- No breaking changes to guest navigation or the current `/blog` entrypoints.

---

## 1) Implementation Milestones

### Milestone A — Canonical Blog Routing (Frontend-only)
**Goal**: Replace the current sessionStorage-based `/blog/post` navigation with a canonical `/blog/[slug]` route using seed/mock data.

**Work includes**
- Add `src/app/blog/[slug]/page.tsx` (seed-backed).
- Update `src/app/blog/page.tsx` to route to `/blog/[slug]`.
- Decide what to do with `src/app/blog/post/page.tsx`:
  - keep temporarily (legacy)
  - redirect to `/blog` if accessed directly

**Acceptance checks**
- Clicking a blog card opens `/blog/[slug]`.
- Refreshing `/blog/[slug]` loads correctly.
- `/blog/post` no longer required for normal browsing.

### Milestone B — Blog Data Adapter Layer (Frontend-only)
**Goal**: Ensure public pages call a single interface so switching to DB later is clean.

**Work includes**
- Add a small adapter module (location decided during coding) with:
  - `getBlogPosts()`
  - `getBlogPostBySlug(slug)`

**Acceptance checks**
- Public pages read via adapter (not directly from `blogData.ts`).

### Milestone C — Admin UI Scaffolding (Mocked)
**Goal**: Build admin routes and the editor UX without backend persistence.

**Work includes**
- Add `/admin/blog` list.
- Add `/admin/blog/new` create.
- Add `/admin/blog/[id]` edit.
- Add `/admin/blog/[id]/preview`.

**Acceptance checks**
- Admin screens render and support the draft workflow using mock state.

---

## 2) Risks & Dependencies
- Slug uniqueness: seed data currently lacks slugs; we must derive stable slugs for mock mode.
- Existing auth: admin route protection must match current system patterns.
- Markdown rendering: needs a safe renderer decision.

---

## 3) After Approval (Backend Track)
Once Milestones A–C are approved, we proceed to:
- Prisma models + migrations
- Public + admin APIs
- Scheduling mechanism
- AI drafting
- n8n webhooks

All of that work will be tracked in `DOC/Features/Blog Manual/SOT/tasks.md`.
