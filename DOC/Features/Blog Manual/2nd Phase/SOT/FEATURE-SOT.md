# Blog Manual — Phase 2 — Feature SOT (Phases 0–6)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-30

**Canonical Notice**: This is the canonical SOT for Blog Manual **Phase 2** only.

**Inputs**:
- Primary plan (Phase 2): `DOC/Features/Blog Manual/2nd Phase/Plan/LUMINACMS-PROTOTYPE-MIRROR-PLAN.md`
- Phase-2 index: `DOC/Features/Blog Manual/2nd Phase/SOT/INDEX.md`
- Baseline (Phase 1 blog): `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`

**Required pre-implementation docs (must exist and be approved):**
- `DOC/Features/Blog Manual/2nd Phase/SOT/CURRENT-STATE-AUDIT-ADMIN-BLOG-CMS.md`
- `DOC/Features/Blog Manual/2nd Phase/SOT/Frontend-Plan.md`
- `DOC/Features/Blog Manual/2nd Phase/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/Features/Blog Manual/2nd Phase/SOT/tasks.md`

---

## PHASE 0 — Context & Legacy Audit (Required)

### Why audit is required
Phase 2 touches an existing feature area (admin blog + Prisma blog tables). Per the legacy-safe framework, we must audit:
- what already exists,
- what must not regress,
- what is missing and will be added.

### Baseline contract (do not break)
- Public blog UX and routing decisions remain as locked in Phase 1 SOT:
  - canonical `/blog/[slug]`
  - `/blog/post` compatibility route
- Existing admin blog post CRUD already exists and must remain functional while being refactored to match the prototype UX.

### Phase-2 current-state audit (must be referenced)
- `DOC/Features/Blog Manual/2nd Phase/SOT/CURRENT-STATE-AUDIT-ADMIN-BLOG-CMS.md`

### Constraints (non-negotiable)
- Theming: semantic tokens only; no hardcoded colors; no `dark:` classes.
- Admin layout: padding-only wrapper `p-4 sm:p-6 lg:p-8`; avoid extra app shells.
- Admin auth: all admin CMS endpoints must enforce `requireAdmin()`.

---

## PHASE 1 — Vision & Problem Statement (WHY)

### Vision
Deliver a WordPress-like admin CMS experience for blog operations (posts, editor, comments moderation, taxonomy, media library) while preserving existing Next.js + Prisma foundations and repo UI standards.

### Problem being solved
- Current admin blog UI is functional but not operationally efficient (no WP-like listing, no taxonomy management UI, no media library, no comment moderation).
- Phase 2 must mirror a known-good UX prototype to reduce iteration time and confusion.

### Success criteria
- Admin can manage posts using the prototype-matched list and editor UX.
- Admin can manage categories/tags on dedicated taxonomy UI.
- Admin can browse/manage media assets and generate alt text server-side.
- Admin can view/moderate comments (admin-only) if Phase-2 schema is approved.
- No regressions to public blog.

---

## PHASE 2 — User Stories (WHAT, not how)

### Admin (CMS operator)
- As an admin, I can view a post list with search, status filters, row actions, and bulk actions.
- As an admin, I can create/edit a post using an editor UI with publishing controls, SEO tab, and AI tab.
- As an admin, I can schedule a post for later publication.
- As an admin, I can move a post to trash (archive) without permanently deleting it.
- As an admin, I can manage categories and tags (create, list, delete).
- As an admin, I can manage media assets (upload, browse, search/filter, edit metadata).
- As an admin, I can request AI suggestions (editor draft/SEO/meta description; media alt text) without exposing API keys client-side.
- As an admin, I can moderate comments (approve/spam/delete) if comments are enabled in Phase 2.

### System / Security
- As the system, I enforce admin-only access for CMS routes and endpoints.
- As the system, I log AI requests for auditability.

### Explicit exclusions (Phase 2)
- Dashboard analytics and settings UI.
- Rich text / block editor (prototype uses a textarea).
- Public comment submission feature.

---

## PHASE 3 — Feature Scope & Modules

### Module A — Posts List (Admin)
- Refactor `/admin/blog` to prototype-matched WP-like listing UI.

### Module B — Post Editor (Admin)
- Refactor `/admin/blog/new` and `/admin/blog/[id]` to prototype-matched editor UI.

### Module C — Taxonomy (Admin)
- Implement combined “Categories & Tags” UI and CRUD.

### Module D — Media Library (Admin)
- Implement media grid + details sidebar + presigned upload.

### Module E — Comments (Admin)
- Implement admin-only comments moderation UI + backend (if approved).

### Module F — AI Assist (Admin)
- Use existing AI endpoint patterns; add alt-text support and any missing editor actions.

---

## PHASE 4 — System & Flow Design (How it works, no code)

### Posts list flow
- Admin opens `/admin/blog`.
- System loads posts with filters/search.
- Admin selects rows and runs bulk actions (minimum: archive).
- Admin uses row actions to open editor or view public/admin preview.

### Editor flow
- Admin edits title/slug/content.
- Publishing controls:
  - admin can set status and schedule.
  - schedule implies status scheduled.
- SEO tab manages meta title/description and keyword chips.
- AI tab can generate intro draft and suggest SEO keywords.
- Save draft persists changes.

### Taxonomy flow
- Admin toggles between Categories and Tags.
- Admin can add (name + optional slug) and delete.
- Counts show number of posts assigned.

### Media flow
- Admin opens `/admin/blog/media`.
- Admin filters/searches assets.
- Admin selects an asset to edit metadata.
- Admin uploads via presigned URL and registers asset in DB.
- Admin can request AI alt text (images only).

### Comments flow
- Admin opens `/admin/blog/comments`.
- Admin filters by status.
- Admin updates status and can delete.

---

## PHASE 5 — Technical Design (Delta-based)

**Important**: Technical design details are sourced from the prototype mirror plan and the current-state audit; any schema changes must follow DB operations standards.

### Existing foundations to reuse (Phase 1)
- Prisma: `BlogPost`, `BlogCategory`, `BlogTag`, `BlogPostTag`, `BlogAiRequestLog`, `BlogJobLog`
- Admin post APIs: `/api/admin/blog/posts` and `/api/admin/blog/posts/[id]`
- AI generate: `/api/admin/blog/ai/generate`

### New additions (Phase 2, subject to approval)
- Comments model + endpoints
- Media model + endpoints + presign upload endpoint
- Taxonomy endpoints (if not already present)

### Design system compliance
- UI must use semantic tokens and existing components.

---

## PHASE 6 — Legacy-Aware Development Execution Plan (Docs-only)

Implementation sequencing lives in:
- `DOC/Features/Blog Manual/2nd Phase/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/Features/Blog Manual/2nd Phase/SOT/tasks.md`

Rollback stance:
- Changes must be incremental; posts CRUD cannot break at any step.

Stop rule:
- If any step requires destructive DB operations, stop and require explicit approval + verified backup.
