# Blog Manual — Phase 2 (Prototype Mirror Plan)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Purpose**: Mirror the LuminaCMS admin prototype UX into this repo’s real Admin app, while staying compliant with the Design System SOT (semantic tokens only) and the Admin layout standard.

Scope is **admin CMS only** for these pages:
- Posts (list)
- Post Editor
- Comments
- Categories & Tags (Taxonomy)
- Media Library

Explicit exclusions (not part of this plan unless later approved):
- Dashboard analytics
- Settings page
- Public comment submission UI
- Rich-text/WYSIWYG editor (prototype is a textarea)

---

## 0) Key Constraints (Non-negotiable)

- **Admin layout** must follow the padding-only wrapper: `p-4 sm:p-6 lg:p-8` and avoid extra app shells.
- **Theming**: semantic tokens only; no hardcoded colors; no `dark:` classes.
- **Contract-first + frontend-first** execution:
  1) lock contracts/types,
  2) build UI against a mock/provider,
  3) implement API/backend to match,
  4) swap provider.

---

## 1) Recommendation: Refactor vs “Start Fresh”

### Recommendation (minimal time, minimal mess): **Refactor UI, keep backend foundation**
This repo already has:
- Prisma models for `BlogPost`, `BlogCategory`, `BlogTag`, join table, statuses, AI logs, and job logs.
- Admin API for posts: `GET/POST /api/admin/blog/posts` and `GET/PATCH/DELETE /api/admin/blog/posts/[id]`.
- Admin UI pages for posts list/new/edit/preview.

Phase 2 is primarily **UI/UX expansion** (WP-like list, taxonomy management, comments moderation, media library). Keeping the existing blog foundation avoids redoing:
- schema design,
- authz plumbing (`requireAdmin`),
- slug uniqueness logic,
- post CRUD.

### If you still want a clean slate
If you insist on discarding current blog work, treat it as a separate, explicit ops workflow:
- keep the DB backup you already created,
- remove blog migrations/models via a new migration (preferred) or a controlled SQL change (only with explicit approval),
- restore code from the chosen “pre-blog” commit,
- re-implement Phase 1 foundations again.

This path is slower and riskier, so it’s not recommended for “minimal time”.

---

## 2) Admin Route Map (Target)

These routes implement the prototype pages without adding unrelated screens:
- `/admin/blog` → **Posts List** (prototype `PostList`)
- `/admin/blog/new` → **Editor** (new post)
- `/admin/blog/[id]` → **Editor** (edit post)
- `/admin/blog/comments` → **Comments** moderation
- `/admin/blog/taxonomy` → **Categories & Tags** combined tab UI
- `/admin/blog/media` → **Media Library**

Notes:
- Existing placeholder routes `/admin/blog/categories` and `/admin/blog/tags` can be repointed to `/admin/blog/taxonomy` (optional compatibility).

---

## 3) Frontend UX Contract (Prototype Mirror)

### A) Posts List — `/admin/blog`

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐
│ Posts      [Add New]                           [Search…]     │
├──────────────────────────────────────────────────────────────┤
│ All (N) | Published (N) | Drafts (N)                          │
├──────────────────────────────────────────────────────────────┤
│ [Bulk Actions v] [Apply]   [All Dates v] [All Categories v]   │
│ [Filter]                                                     │
├──────────────────────────────────────────────────────────────┤
│ [ ] Title | Author | Categories | Tags | 💬 | Date            │
│     Title button (Draft label when draft)                    │
│     Hover row actions: Edit | Quick Edit | Trash | View       │
├──────────────────────────────────────────────────────────────┤
│ X items selected                Y items     [pagination UI]   │
└──────────────────────────────────────────────────────────────┘
```

**Fields / behaviors to implement (mirror prototype):**
- **Header**
  - Page title: “Posts”
  - Button: “Add New” → navigates to `/admin/blog/new`
  - Search input: “Search Posts…” (filters list by title)
- **Status filter bar**
  - Buttons: All / Published / Drafts with counts
  - Selecting a filter updates the table contents
- **Bulk actions**
  - Select: “Bulk Actions”, “Edit”, “Move to Trash”
  - Button: “Apply” (executes action on selected rows)
- **Table filters**
  - Select: “All Dates” (options list can be derived from post months)
  - Select: “All Categories” (from categories)
  - Button: “Filter”
- **Table columns**
  - Checkbox select (select all + per row)
  - Title column:
    - Title is a button → opens editor for that post
    - Draft label: “— Draft” when status is draft
    - Row actions appear on hover: Edit / Quick Edit / Trash / View
  - Author (clickable in prototype; in our app can be non-interactive text)
  - Categories
  - Tags
  - Comment count bubble:
    - Prototype uses a random number; implementation should show real count if comments exist, otherwise 0
  - Date column:
    - Label is “Published” if published else “Last Modified”
    - Show a date string
- **Pagination footer**
  - Mirrors prototype’s disabled controls (“1 of 1”) unless/until real pagination is implemented.

**Required data points for this page**
- Post id/title/status/updatedAt/publishedAt, author display name, category name, tags list, comment count.

---

### B) Editor — `/admin/blog/new` and `/admin/blog/[id]`

**What you will see:**

```
┌───────────────────────────────┬──────────────────────────────┐
│ Title (large)                 │ Publishing Controls box       │
│ Permalink: /blog/[slug]       │ - Status (Edit dropdown)      │
│ Content textarea (tall)       │ - Visibility: Public (Edit)   │
│                               │ - Publish: immediately/Edit   │
│                               │   (month/day/year/hour/min)   │
│                               │ [Move to Trash] [Publish]     │
├───────────────────────────────┼──────────────────────────────┤
│                               │ Tabs: General | SEO | AI      │
│                               │ General: Category, Author     │
│                               │ SEO: search preview, meta     │
│                               │ AI: generate intro, suggest   │
└───────────────────────────────┴──────────────────────────────┘

Bottom fixed action bar:
Cancel | Last autosaved at HH:MM | [Save Draft] [Publish Now/Schedule Post]
```

**Fields / behaviors to implement (mirror prototype):**
- **Main editor**
  - Title input
  - Permalink display with editable slug
    - Auto-generate slug from title when slug is initially empty
  - Content textarea
- **Publishing Controls**
  - Status badge + “Status: X (Edit)” → toggles a dropdown (Draft/Published/Scheduled) and an OK button
  - Visibility: “Public” with an “Edit” link (prototype placeholder; keep as non-functional UI)
  - Publish schedule line:
    - shows “immediately” unless status is scheduled
    - Edit link toggles date/time editor (month/day/year/hour/min)
    - changing schedule sets status to scheduled
    - OK/Cancel buttons close editor
  - Footer actions:
    - “Move to Trash”
    - Publish button changes label depending on scheduled vs not (Schedule vs Publish)
- **Tabbed sidebar**
  - Tabs: general / seo / ai
  - General tab:
    - Category input
    - Author card (display-only)
  - SEO tab:
    - Search preview (meta title, URL with slug, meta description)
    - Meta Title input with char count indicator (0 is neutral; in-range is “good”; out-of-range is “warn”)
    - Meta Description textarea with char count + “Generate with AI” action
    - Focus Keywords:
      - input where Enter adds a keyword chip
      - chips removable
  - AI tab:
    - “Generate Intro Draft” appends generated text to content
    - “Suggest SEO Keywords” adds suggested keywords
- **Bottom action bar**
  - Cancel button returns to posts list
  - “Save Draft”
  - “Publish Now” or “Schedule Post” button

**Field mapping to current DB (recommended, minimal changes)**
- Prototype “Focus Keywords” are treated as **tags** (prototype itself stores `tags: keywords`).
- SEO fields map to existing `seoTitle` and `seoDescription`.
- Schedule maps to existing `scheduledFor` and status `SCHEDULED`.
- Trash maps to status `ARCHIVED` (do not hard-delete).

---

### C) Comments — `/admin/blog/comments`

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐
│ Comments  (description)     [All] [Pending] [Approved] [Spam]│
├──────────────────────────────────────────────────────────────┤
│ Author | Comment | Status | Actions                          │
│ Actions: Approve / Spam / Delete                             │
└──────────────────────────────────────────────────────────────┘
```

**Behaviors to implement (mirror prototype):**
- Filter tabs: all / pending / approved / spam
- Table rows show:
  - author name + email
  - “on {postTitle}” indicator
  - comment content (clamped) + date
  - status pill
  - actions:
    - Approve (if not already approved)
    - Spam (if not already spam)
    - Delete (confirm)

---

### D) Categories & Tags — `/admin/blog/taxonomy`

**What you will see:**

```
┌───────────────────────────────┬──────────────────────────────┐
│ Add New Category/Tag (sticky) │ Tabs: Categories | Tags       │
│ Name                          │ Table: Name | Slug | Posts    │
│ Slug (optional)               │ Delete action per row         │
│ [Add New]                     │                              │
└───────────────────────────────┴──────────────────────────────┘
```

**Behaviors to implement (mirror prototype):**
- Two tabs inside the page: Categories / Tags
- Add form:
  - Name (required)
  - Slug (optional; auto derived if empty)
  - “Add New” adds to current active tab
- Table:
  - shows name, slug, count of posts
  - delete action removes taxonomy item

---

### E) Media Library — `/admin/blog/media`

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐
│ [All Media v] [Search…]                      [Add New]       │
├──────────────────────────────────────────────────────────────┤
│ Grid of thumbnails (image/video/document)                    │
│ Click selects (border highlight)                             │
├──────────────────────────────────────────────────────────────┤
│ Right sidebar (when selected): Attachment Details            │
│ - Preview                                                    │
│ - Filename, uploaded date, size, dimensions                  │
│ - Delete Permanently                                         │
│ - Title (editable)                                           │
│ - Alt (editable) + AI Suggest (images only)                  │
│ - Caption (editable)                                         │
│ - File URL (read-only) + Copy                                │
└──────────────────────────────────────────────────────────────┘
```

**Behaviors to implement (mirror prototype):**
- Filter dropdown: all / image / video / document
- Search by title or filename
- Add New button:
  - triggers upload flow (recommended: presigned S3 upload pattern reused from existing uploads)
- Selecting an item opens details sidebar
- Details sidebar:
  - delete confirm
  - updates to title/alt/caption are persisted
  - “Copy” copies URL and shows a simple confirmation
  - “AI Suggest” generates alt text for images only

---

## 4) Backend Plan (Prisma + API)

### A) Prisma additions (Phase 2)

Add models for admin-managed comments and media.

1) **BlogComment** (new)
- Fields (suggested):
  - `id`, `postId`, `authorName`, `authorEmail`, `content`, `status`, `createdAt`, `updatedAt`
- Status enum: `PENDING`, `APPROVED`, `SPAM`
- Relation: belongs to `BlogPost`

2) **BlogMediaAsset** (new)
- Fields (suggested):
  - `id`, `type`, `url`, `s3Key`, `filename`, `title`, `alt`, `caption`, `mimeType`, `byteSize`, `width`, `height`, `createdAt`, `createdBy`
- Type enum: `IMAGE`, `VIDEO`, `DOCUMENT`
- Optional: link to posts (cover image usage) later; not required for Phase 2 UI.

### B) Admin API surface (Phase 2)

Existing (already present):
- `GET/POST /api/admin/blog/posts`
- `GET/PATCH/DELETE /api/admin/blog/posts/[id]`
- `POST /api/admin/blog/ai/generate`

Add (Phase 2):

1) **Posts list enhancements**
- Extend `GET /api/admin/blog/posts` query support:
  - `status=...` (already supported)
  - `q=...` (search by title)
  - `category=...` (category slug)
  - `month=YYYY-MM` (for “All Dates” filter)
  - pagination (optional; keep prototype pagination UI disabled until added)

2) **Taxonomy CRUD**
- `GET/POST /api/admin/blog/categories`
- `PATCH/DELETE /api/admin/blog/categories/[id]`
- `GET/POST /api/admin/blog/tags`
- `PATCH/DELETE /api/admin/blog/tags/[id]`
- Responses should include `count` (computed number of posts)

3) **Comments moderation**
- `GET /api/admin/blog/comments?status=...`
- `PATCH /api/admin/blog/comments/[id]` (change status)
- `DELETE /api/admin/blog/comments/[id]`

4) **Media library**
- `GET /api/admin/blog/media?type=...&q=...`
- `POST /api/admin/blog/media` (create asset record after upload)
- `PATCH /api/admin/blog/media/[id]` (update title/alt/caption)
- `DELETE /api/admin/blog/media/[id]` (delete)
- `POST /api/admin/blog/media/presign` (get presigned upload URL)

5) **AI support for Media SEO**
- `POST /api/admin/blog/ai/alt-text` (or extend existing AI route with an action)
- Must log to `BlogAiRequestLog` with `action` set accordingly.

### C) Authorization
- All admin CMS endpoints must enforce `requireAdmin()`.

---

## 5) Execution Outline (Phase 2)

1) Lock UI contracts for:
- `AdminPostListItem`, `AdminComment`, `AdminTaxonomyItem`, `AdminMediaAsset`

2) Build pages with a mock provider to match the prototype layout/behaviors exactly:
- Posts list
- Editor
- Comments
- Taxonomy
- Media library

3) Implement backend routes and Prisma changes in small increments:
- Taxonomy endpoints
- Comments endpoints
- Media endpoints + presign
- Posts list query enhancements

4) Swap mock provider → real API.

---

## 6) Acceptance Criteria (Phase 2)

- All 5 admin CMS pages exist and match the prototype UX structure and actions.
- Admin layout standard respected on every page.
- No hardcoded colors, no `dark:` classes.
- All admin routes enforce `requireAdmin()`.
- “Move to Trash” archives posts (no hard delete).
- Media “AI Suggest” and Editor SEO AI actions are server-side only.
