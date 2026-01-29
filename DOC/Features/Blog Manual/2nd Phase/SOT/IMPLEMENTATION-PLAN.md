# Implementation Plan — Blog Manual (Phase 2) — Refactor Strategy

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-30

This plan defines sequencing, safety gates, stop rules, and a minimal-risk execution path.

Anchors:
- Source plan (prototype mirror): `DOC/Features/Blog Manual/2nd Phase/Plan/LUMINACMS-PROTOTYPE-MIRROR-PLAN.md`
- Current state audit: `DOC/Features/Blog Manual/2nd Phase/SOT/CURRENT-STATE-AUDIT-ADMIN-BLOG-CMS.md`
- Feature SOT: `DOC/Features/Blog Manual/2nd Phase/SOT/FEATURE-SOT.md`

---

## 1) Strategy

**Refactor, not rebuild**:
- Keep existing routes working.
- Incrementally add missing backend primitives (comments/media/taxonomy CRUD) behind admin auth.
- Replace UI per prototype page-by-page, with smallest delta per PR.

---

## 2) Safety Gates (Mandatory)

Before and after each meaningful batch (UI + API):
- `npx tsc --noEmit`
- `npm run build`

DB safety:
- Do not run destructive DB resets.
- Any schema change must be additive-first; if any destructive migration is needed, create backup and write rollback notes.

---

## 3) Stop Rules

Stop and escalate (do not continue stacking changes) if any happens:
- Admin auth is bypassed or broken (any admin route becomes publicly accessible).
- `npm run build` fails after the change set.
- Slug uniqueness regressions occur (duplicate slug for published posts).
- Trash action deletes data instead of archiving.

---

## 4) Execution Phases

### Phase 2.1 — Stabilize Contracts (No UX changes)
- Confirm API contract for “Trash = archive” and document behavior.
- Confirm canonical admin layout wrapper applied to all admin blog pages.

Deliverables:
- Updated docs if required.
- No visible UI changes required.

### Phase 2.2 — Taxonomy + Posts List parity
- Implement taxonomy endpoints (categories/tags CRUD) admin-only.
- Implement `/admin/blog/taxonomy` UI.
- Update `/admin/blog` to mirror prototype list layout and row actions.

Deliverables:
- Admin list parity + taxonomy parity.

### Phase 2.3 — Editor parity
- Add tabbed editor UI: General/SEO/AI.
- Ensure slug UX parity (auto-generate until edited; manual override persists).
- Add scheduling UI/fields in editor.

Deliverables:
- `/admin/blog/new` and `/admin/blog/[id]` mirror prototype structure.

### Phase 2.4 — Comments moderation
- Add comment models + admin endpoints.
- Add `/admin/blog/comments` UI with moderation actions.

Deliverables:
- Moderation flows (approve/spam/delete) with audit logging.

### Phase 2.5 — Media library
- Add media model + admin endpoints.
- Reuse presigned upload pattern in repo.
- Add `/admin/blog/media` grid + details sidebar.
- Add AI alt-text suggestion endpoint (admin-only) and logs.

Deliverables:
- Upload, browse, edit metadata, copy URL.

---

## 5) Rollback Plan

- Prefer feature-flagging by route isolation (new routes: `/admin/blog/media`, `/admin/blog/comments`, `/admin/blog/taxonomy`).
- For posts list/editor changes: preserve old components until parity is confirmed, then swap.
- DB migrations: keep them additive; rollback is `prisma migrate resolve` only if needed (no reset). Backup required before any destructive change.

---

## 6) Definition of Done

- All target routes exist and match the Frontend Plan.
- All new API routes require admin auth.
- Build gates pass.
- Trash archives (soft delete) and is reversible.
- No hardcoded colors and no `dark:` classes in UI.
