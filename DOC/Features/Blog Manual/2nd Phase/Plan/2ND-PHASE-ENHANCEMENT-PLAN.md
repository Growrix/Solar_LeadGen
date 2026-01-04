# Blog Manual — 2nd Phase Enhancement Plan (WordPress-like CMS)

## Prototype Mirror Plan (Implementation-Ready)
For the detailed, page-by-page plan that mirrors the LuminaCMS prototype UX (Posts, Editor, Comments, Categories & Tags, Media Library) and includes the backend plan, see:

- `DOC/Features/Blog Manual/2nd Phase/Plan/LUMINACMS-PROTOTYPE-MIRROR-PLAN.md`

## Goal
Upgrade the admin blog experience from “developer CRUD” to a practical CMS suitable for daily content operations (WordPress-like), while preserving the existing Next.js + Prisma foundation and multi-theme design system constraints.

---

## Product Outcomes
- Faster authoring: rich editor, blocks/formatting, reusable templates.
- Media workflow: upload, browse, reuse, optimize images.
- Publishing workflow: drafts, scheduled posts, preview, revisions.
- SEO workflow: per-post metadata + validation.
- Taxonomy workflow: categories and tags are first-class admin screens.

---

## Phase 2 Workstreams

### 1) Rich editor (authoring UX)
**Minimum CMS set**
- Rich-text formatting toolbar (headings, bold/italic, links, lists, quotes)
- Markdown support or WYSIWYG (choose one canonical source of truth)
- Live preview panel rendering the same as the public blog

**Operational requirements**
- Autosave drafts (debounced)
- Unsaved-changes guard
- Word/reading-time helper

---

### 2) Media library + cover image upload
**Capabilities**
- Upload cover image from admin UI
- Media library page to browse previously uploaded assets
- Insert image into content

**Storage approach (recommended)**
- Use existing S3 integration patterns (if present in the codebase) for:
  - Signed upload
  - Public URL storage

**Data model additions (suggested)**
- `MediaAsset` table: id, url, key, mimeType, size, width/height, createdBy, createdAt
- Optional: image variants (thumb/medium/original)

---

### 3) Taxonomy management (Categories/Tags)
**Admin screens**
- Categories index: create/edit/delete
- Tags index: create/edit/delete
- Inline assignment in post editor with search and create-on-the-fly

**UX requirements**
- Slug auto-generation + manual override
- Uniqueness checks + friendly conflict resolution

---

### 4) Publishing workflow
**Capabilities**
- Status transitions (DRAFT → SCHEDULED → PUBLISHED → ARCHIVED)
- Schedule picker with timezone clarity
- “Publish now” action
- Preview links that work for:
  - drafts (admin-only preview)
  - scheduled posts
  - published posts

**Automation**
- Scheduler job (cron / n8n) that publishes scheduled posts
- Reliable job logging surfaced in admin UI

---

### 5) Revisions, history, and auditability
**Capabilities**
- Revision snapshots on save/publish
- View diff and restore
- Audit trail for admin actions

**Data model additions (suggested)**
- `BlogPostRevision` table: postId, content, excerpt, seo fields, createdAt, createdBy

---

### 6) SEO tooling
**Capabilities**
- SEO title/description preview (SERP + social)
- Canonical URL validation
- Robots selector
- Optional: OpenGraph image generation/upload

**Validation**
- Prevent publish if required fields are missing (configurable)

---

## UX/Design Constraints (Mandatory)
- Follow multi-theme design tokens; no hardcoded colors and no `dark:` classes.
- Use the canonical layout patterns defined in:
  - `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

---

## Suggested Milestones
1. Add admin Blog navigation + Categories/Tags pages.
2. Add rich editor with safe autosave + preview.
3. Add media upload + media library + cover upload.
4. Add publish workflow UI + scheduler visibility.
5. Add revisions + restore.
6. Add SEO validation + previews.
