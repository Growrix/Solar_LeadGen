# Blog Manual — Fix Audit + Fix Plan

## Scope (Reported Issues)
1. Admin blog post creation fails at runtime ("Failed to create blog post").
2. Admin blog UI layout mismatch vs dashboard/admin standards.
3. Missing Admin sidebar navigation section for Blog (submenu: All Posts, Create Post, Categories, Tags).
4. Slug auto-generation behavior not meeting expectations.
5. Editor lacks formatting controls (needs richer authoring than plain textarea).
6. Cover image upload option missing (only URL field).

---

## Audit Findings

### A) Root cause of “Failed to create blog post”
**Where it fails**
- API route: `POST /api/admin/blog/posts`
- Handler: [src/app/api/admin/blog/posts/route.ts](src/app/api/admin/blog/posts/route.ts)

**Observed server error (actual cause)**
- Prisma error `P2021`:
  - `The table public.blog_posts does not exist in the current database.`

**Why it surfaced as a generic error**
- The route’s catch-all returns `{ error: 'Failed to create blog post' }` on any non-auth exception.
- The admin client [src/lib/blog/adminApiClient.ts](src/lib/blog/adminApiClient.ts) throws using the API’s `error` string.

**Conclusion**
- This is not a UI bug.
- The database in the environment being tested had not applied the new blog migrations, so the underlying blog tables did not exist.

---

### B) Admin blog page layout inconsistencies
**Where**
- Create page: [src/app/admin/blog/new/page.tsx](src/app/admin/blog/new/page.tsx)

**Observed**
- Uses a full-page wrapper (`min-h-screen bg-background p-6`) which may conflict with the canonical dashboard layout patterns in:
  - `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

**Impact**
- Admin pages can look visually different from other admin/dashboard pages, especially if an admin layout already provides chrome/padding.

---

### C) Admin navigation missing “Blog” section
**Observed**
- `/admin/blog` routes exist but are not discoverable via admin sidebar.

**Impact**
- Admins must know URLs; poor CMS usability.

---

### D) Slug auto-generation behavior
**Where**
- Client side slug generation: [src/app/admin/blog/new/page.tsx](src/app/admin/blog/new/page.tsx)
- Server side slug generation: [src/app/api/admin/blog/posts/route.ts](src/app/api/admin/blog/posts/route.ts)

**Observed**
- Client only auto-fills slug if slug is currently empty.
- If the user edits slug manually once, subsequent title edits don’t update slug.

**Impact**
- Some users expect slug to keep updating until they explicitly “lock” it.

---

### E) Editor + cover image expectations
**Observed**
- Editor is a plain textarea.
- Cover image is a plain URL field (no upload flow).

**Impact**
- Not “WordPress-like”; content authorship friction.

---

## Fix Plan (Immediate / Phase 1)

### 1) Fix DB schema mismatch (required for create/list/read)
**Goal**: ensure blog tables exist in the active database.

**Mandatory safety** (per DB Operations Standard): take a backup before applying migrations.

**Steps**
1. Create a timestamped DB backup.
2. Apply migrations using `npx prisma migrate deploy`.
3. Verify `npx prisma migrate status` shows “Database schema is up to date!”.
4. Re-test:
   - `/admin/blog` loads without 500
   - `/admin/blog/new` can create a draft
   - `/blog` can list posts (even if empty)

**Acceptance criteria**
- No Prisma `P2021` errors.
- Admin Create Draft works and persists a record.

---

### 2) Improve error clarity for missing-table scenarios
**Goal**: when tables are missing, show a precise actionable error instead of a generic 500.

**Implementation approach**
- Detect Prisma known error `P2021` and return a message like:
  - “Database schema missing blog tables. Run migrations (prisma migrate deploy).”

**Acceptance criteria**
- Admin UI error message points to migrations when appropriate.

---

### 3) Admin navigation: add Blog section
**Goal**: Add an Admin sidebar section:
- All Posts → `/admin/blog`
- Create Post → `/admin/blog/new`
- Categories → `/admin/blog/categories`
- Tags → `/admin/blog/tags`

**Notes**
- If categories/tags pages are not ready, hide links or route to placeholders only if explicitly allowed.

---

### 4) Slug UX improvements
**Goal**: expected slug behavior.

**Proposed behavior (minimal + predictable)**
- Auto-generate slug from Title until user edits slug manually.
- After manual edit, stop auto-updating unless user clicks “Reset from title”.

**Acceptance criteria**
- No surprising slug changes after manual edits.

---

### 5) Layout alignment
**Goal**: match admin/dashboard layout standards and avoid wrapper duplication.

**Approach**
- Confirm whether admin has a shared layout providing padding/background.
- Remove redundant wrappers if present; otherwise keep admin wrapper pattern.

**Acceptance criteria**
- Blog admin pages match the admin chrome spacing and surfaces.

---

## Out of Scope (Phase 2 / Enhancements)
- Rich text editor, media library, image upload workflows, revisions, autosave, scheduled publishing UX, etc.
- These are tracked in the separate 2nd-phase plan.
