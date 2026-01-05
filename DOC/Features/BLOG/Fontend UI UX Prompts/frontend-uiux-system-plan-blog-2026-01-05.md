# BLOG — Frontend UI/UX System Plan (SOT)

> **Status:** UI/UX Planning Complete (Draft pending approval)
> **Audience:** Frontend AI Builders → Backend Engineers → Product Owners
> **Dependency:** Must be completed BEFORE backend planning

---

## 0) Purpose & Contract

This document is the **Single Source of Truth (SOT)** for building the **BLOG UI/UX** across public + admin roles.

It guarantees:
- Logical, backend-implementable UI
- Deterministic user flows
- No missing states, triggers, or dead ends
- AI-safe, step-locked frontend building

⚠️ **No backend planning may begin until this document is approved.**

**Derived from:**
- Blog SOT frontend contract: `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md`
- Blog canonical plan: `DOC/FEATURES/BLOG/SOT/FEATURE-SOT.md`
- Repo workflow: `DOC/GUIDELINES & SOT/README.md`
- Prompting SOP: `DOC/PROMPTS/PROMPTS & TEMPLATES/FRONTEND/AI Prompting Guideline.md`

---

## 1) Non-Negotiable Rules (Must Be Enforced by Any AI)

### Structural Rules
- Pages are built **before** modals.
- One step = one page OR one modal.
- One modal = one intent.
- No step may reference future UI elements.

### Prompting Rules
- Every build prompt MUST declare:

  ```
  This is Step X of Y in the BLOG frontend flow.
  ```

- Each step must define:
  - Trigger source
  - Exit destination
  - UI states
- No backend logic or assumptions allowed (UI/UX only).

### UX Safety Rules
- No invisible state transitions.
- No irreversible actions without a confirmation UX.
- No “happy path only” flows.

---

## 2) Scope & Explicit Constraints

### In Scope
- UI/UX structure
- Navigation & layout
- Modals/confirmations
- UI-level states (loading, empty, disabled, error)
- UX permissions (visible vs disabled)

### Out of Scope (By Design)
- API contracts
- Database schema
- Automation logic
- Role enforcement logic (UX only, not auth)

### Baseline Contract: Existing UI Will NOT Be Lost
Existing blog routes must remain functional until explicitly approved to change:
- `/blog`
- `/blog/post` (legacy compatibility)
- `/blog/[slug]`
- `/admin/blog` and admin blog routes

---

## 3) Information Architecture (IA)

### Navigation Entry Points
- Public header/nav links (guest)
- Admin sidebar blog group (admin)
- Deep-link to `/blog/[slug]`

### Pages Hierarchy

```
Public
 ├─ /blog (Listing)
 ├─ /blog/[slug] (Canonical Post)
 └─ /blog/post (Legacy compatibility)

Admin
 ├─ /admin/blog (Posts list)
 ├─ /admin/blog/new (Create)
 ├─ /admin/blog/[id] (Edit)
 ├─ /admin/blog/[id]/preview (Preview)
 ├─ /admin/blog/categories (Categories)
 └─ /admin/blog/tags (Tags)
```

---

## 4) Core Domain Objects (UI-Level Contract)

> ⚠️ These are **conceptual objects**, NOT schemas.

### 4.1 Object: Blog Post
**Used in UI for:**
- Public cards (listing)
- Public post detail
- Admin posts table
- Admin editor

**Minimum display fields:**
- Title (primary)
- Slug (url + admin reference)
- Excerpt (card preview)
- Cover image (visual)
- Author name (trust)
- Published date (freshness)
- Read time (expectation)
- Status (admin)

### 4.2 Object: Category
**Used in UI for:**
- Public card label
- Admin category manager

**Minimum display fields:**
- Name
- Slug

### 4.3 Object: Tag
**Used in UI for:**
- Admin tag manager
- Optional public discovery (if exposed)

**Minimum display fields:**
- Name
- Slug

### 4.4 User-Facing Status System (Admin)
Statuses must be mutually exclusive, visually distinct, and map to behavior:
- `DRAFT`
- `SCHEDULED`
- `PUBLISHED`
- `ARCHIVED`

---

## 5) End-to-End UX Flow (Narrative)

### Public primary flow
1. Visitor enters `/blog`.
2. Visitor browses post cards.
3. Visitor clicks a post card.
4. Visitor reads at `/blog/[slug]`.
5. Visitor can share (MVP: Copy Link).

### Public compatibility flow
1. Visitor arrives at `/blog/post`.
2. Page reads `sessionStorage.currentBlogPost`.
3. If slug can be inferred → redirects to `/blog/[slug]`.
4. Else it renders the stored post payload.

### Admin primary flow
1. Admin opens `/admin/blog`.
2. Admin clicks “Add New” → `/admin/blog/new`.
3. Admin fills required fields, saves draft.
4. Admin previews → `/admin/blog/[id]/preview`.
5. Admin publishes now OR schedules for later.

### Alternate / failure paths
- Empty states: no posts yet (public/admin)
- Errors: fetch failed → show message + retry
- Disabled actions: cannot publish if required fields missing (UX-level disable)

---

## 6) Build Sequence (Locked Order)

**Total Steps:** `11`

| Step | Type         | Name                                   | Reason |
| ---- | ------------ | -------------------------------------- | ------ |
| 1    | Page         | Public Blog Listing (`/blog`)           | Entry point |
| 2    | Page         | Public Blog Post (`/blog/[slug]`)       | Core reading surface |
| 3    | Page         | Legacy Blog Post (`/blog/post`)         | Compatibility |
| 4    | Page         | Admin Posts List (`/admin/blog`)        | Admin entry |
| 5    | Page         | Admin Blog Editor (Create/Edit)         | Core admin workflow |
| 6    | Page         | Admin Post Preview (`/admin/blog/[id]/preview`) | Validate before publish |
| 7    | Page         | Admin Categories (`/admin/blog/categories`) | Taxonomy |
| 8    | Page         | Admin Tags (`/admin/blog/tags`)         | Taxonomy |
| 9    | Modal        | Confirm Delete/Trash Post               | Risk control |
| 10   | Modal        | Confirm Publish Now                     | Risk control |
| 11   | Modal        | Confirm Schedule Publish                | Risk control |

⚠️ Steps must be built strictly in order.

---

# 🧠 STEP-BY-STEP UI/UX SPEC + AI-READY PROMPTS

> Copy/paste each step into your AI builder. Do NOT skip steps.

---

## 🔹 Step 1 of 11 — Public Blog Listing Page (`/blog`)

### AI BUILD PROMPT (copy/paste)

This is Step 1 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS frontend UI/UX engineer.
- Scope: UI only.

Task:
- Build the Public Blog Listing page at `/blog`.

Layout Structure:
- Page header: title “SolarMatch Blog” + short intro text.
- Content section: responsive grid of Post Cards.
- Optional footer control: “Load More” button (only UI; no pagination logic).

Post Card layout:
- Cover image thumbnail
- Category badge
- Title
- Excerpt
- Meta row: author name + date + read time

Interaction Map:
- Click a post card → navigate to `/blog/[slug]` (do not build the slug page yet; reference only).

UI States:
- Default: grid of cards.
- Loading: skeleton cards.
- Empty: “No posts yet” message.
- Error: “Failed to load posts” + Retry button.

Constraints:
- Do not implement backend calls.
- Do not design future pages/modals.
- Do not change existing global layout system.

Stop after:
- This page UI only.

---

## 🔹 Step 2 of 11 — Public Blog Post Page (`/blog/[slug]`)

### AI BUILD PROMPT (copy/paste)

This is Step 2 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS frontend UI/UX engineer.
- Scope: UI only.

Trigger:
- User navigates here by clicking a post card from `/blog`.

Task:
- Build the Public Blog Post Detail page at `/blog/[slug]`.

Layout Structure:
- Hero image area
- Category badge
- Title
- Meta row: author + date + read time
- Body content area (readable typography)
- Share section (minimum: Copy Link)

Interaction Map:
- Click “Back to All Articles” → navigates to `/blog`.
- Click “Copy Link” → copies current URL (UI-only; describe behavior).

UI States:
- Default: post content visible.
- Loading: skeleton header + body.
- Not found: friendly “Post not found” + Back button.
- Error: “Failed to load post” + Retry.

Constraints:
- No backend logic.
- No social share integrations beyond Copy Link in this step.
- Do not design admin UI.

Stop after:
- This page UI only.

---

## 🔹 Step 3 of 11 — Legacy Blog Post Page (`/blog/post`) (Compatibility)

### AI BUILD PROMPT (copy/paste)

This is Step 3 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS frontend UI/UX engineer.
- Scope: UI only.

Trigger:
- User navigates to `/blog/post` directly OR from legacy navigation.

Task:
- Build the `/blog/post` compatibility page UI.

Behavior (describe, do not implement deep logic):
- Attempts to read a post payload from `sessionStorage.currentBlogPost`.
- If a slug can be inferred, it redirects to `/blog/[slug]`.
- If not, it renders the stored post content.

UI States:
- Missing payload: show message “No post selected” + button “Back to Blog”.
- Payload present: render same layout as `/blog/[slug]`.

Constraints:
- Do not delete or remove this route.
- Do not redesign the overall flow.

Stop after:
- This page UI only.

---

## 🔹 Step 4 of 11 — Admin Posts List (`/admin/blog`)

### AI BUILD PROMPT (copy/paste)

This is Step 4 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Build the Admin Posts List page at `/admin/blog`.

Layout Structure:
- Header: “Posts” + short description.
- Primary action: “Add New” button.
- Filters:
  - Search input
  - Status pills: All / Published / Draft
- Table:
  - Columns: Title, Status, Updated, Actions
  - Row actions: Edit, Preview, Trash

Interaction Map:
- Add New → `/admin/blog/new`
- Edit → `/admin/blog/[id]`
- Preview → `/admin/blog/[id]/preview`
- Trash → opens “Confirm Delete/Trash Post” modal (do not design modal yet)

UI States:
- Loading: table skeleton.
- Empty: “No posts yet” + Add New.
- Error: error banner + Retry.

Constraints:
- No backend logic.
- Do not build editor or modals yet.

Stop after:
- This page UI only.

---

## 🔹 Step 5 of 11 — Admin Blog Editor Page (Create + Edit) (`/admin/blog/new`, `/admin/blog/[id]`)

### AI BUILD PROMPT (copy/paste)

This is Step 5 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Create: from `/admin/blog` clicking “Add New”
- Edit: from `/admin/blog` clicking “Edit”

Task:
- Build an Admin Blog Editor surface that supports both create and edit.

Layout Structure:
- Top section fields:
  - Title
  - Slug
  - Excerpt
  - Cover Image URL
  - Category (dropdown)
  - Tags (input)
- Tabs:
  - Content
  - SEO
  - Scheduling
  - AI
- Footer actions:
  - Save
  - Preview
  - Publish Now
  - Schedule
  - Archive

Interaction Map:
- Preview → `/admin/blog/[id]/preview`
- Publish Now → opens “Confirm Publish Now” modal (do not design modal yet)
- Schedule → opens “Confirm Schedule Publish” modal (do not design modal yet)

UI States:
- Disabled: Publish/Schedule disabled if required fields missing.
- Loading: when opening existing post, show skeleton.
- Error: inline error banner.

Constraints:
- UI only (no editor logic, no API calls).
- Do not invent new pages beyond the SOT routes.

Stop after:
- This page UI only.

---

## 🔹 Step 6 of 11 — Admin Post Preview (`/admin/blog/[id]/preview`)

### AI BUILD PROMPT (copy/paste)

This is Step 6 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From editor clicking Preview.

Task:
- Build admin-only preview page that renders the public post layout.

Layout Structure:
- Show the same layout as `/blog/[slug]`.
- Add a top admin bar:
  - “Back to edit” button

Interaction Map:
- Back to edit → `/admin/blog/[id]`

UI States:
- Loading skeleton
- Not found
- Error

Constraints:
- UI only.

Stop after:
- This page UI only.

---

## 🔹 Step 7 of 11 — Admin Categories (`/admin/blog/categories`)

### AI BUILD PROMPT (copy/paste)

This is Step 7 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Build a Categories management page.

Layout Structure:
- Header: “Categories”
- List/table of categories: Name, Slug, Updated
- Actions: Add, Edit, Delete

Interaction Map:
- Delete → uses the “Confirm Delete/Trash” modal pattern (same modal intent; do not design modal yet)

UI States:
- Loading, empty, error

Constraints:
- UI only.

Stop after:
- This page UI only.

---

## 🔹 Step 8 of 11 — Admin Tags (`/admin/blog/tags`)

### AI BUILD PROMPT (copy/paste)

This is Step 8 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Build a Tags management page.

Layout Structure:
- Header: “Tags”
- List/table of tags: Name, Slug, Updated
- Actions: Add, Edit, Delete

Interaction Map:
- Delete → uses the “Confirm Delete/Trash” modal pattern (same modal intent; do not design modal yet)

UI States:
- Loading, empty, error

Constraints:
- UI only.

Stop after:
- This page UI only.

---

## 🔹 Step 9 of 11 — Modal: Confirm Delete/Trash Post

### AI BUILD PROMPT (copy/paste)

This is Step 9 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From `/admin/blog` (Trash action)
- From taxonomy pages (Delete action)

Purpose:
- Confirm a destructive action.

Modal Structure:
- Title: “Move to Trash?” or “Delete?” (depending on context label)
- Body: short warning that action is reversible/irreversible (copy only)
- Actions:
  - Cancel
  - Confirm

Exit Rules:
- Cancel → returns to the page that opened it.
- Confirm → closes modal and shows a success toast/banner (UX only).

UI States:
- Disabled confirm while “processing” (UI only)

Constraints:
- No backend logic.
- No nested modals.

Stop after:
- This modal only.

---

## 🔹 Step 10 of 11 — Modal: Confirm Publish Now

### AI BUILD PROMPT (copy/paste)

This is Step 10 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Admin Editor clicking “Publish Now”.

Purpose:
- Confirm immediate publication.

Modal Structure:
- Title: “Publish now?”
- Body: explain it will make the post publicly visible.
- Actions:
  - Cancel
  - Publish

Exit Rules:
- Cancel → back to editor.
- Publish → closes modal, shows success feedback.

UI States:
- Disabled publish while “processing” (UI only)

Constraints:
- No backend logic.

Stop after:
- This modal only.

---

## 🔹 Step 11 of 11 — Modal: Confirm Schedule Publish

### AI BUILD PROMPT (copy/paste)

This is Step 11 of 11 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Admin Editor clicking “Schedule”.

Purpose:
- Select a date/time and confirm scheduling.

Modal Structure:
- Title: “Schedule publication”
- Field: datetime picker input
- Helper copy: timezone clarity (UX copy)
- Actions:
  - Cancel
  - Schedule

Exit Rules:
- Cancel → back to editor.
- Schedule → closes modal, shows success feedback.

UI States:
- Validation: prevent scheduling in the past (UX-level message only)

Constraints:
- No backend logic.

Stop after:
- This modal only.

---

## Notes for Redesigning the Entire Blog UI/UX

If you decide to **change routes, add new pages (e.g., Media, Comments), or change major flows**, you must update:
- `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md`
- And reflect the changes in `DOC/FEATURES/BLOG/SOT/FEATURE-SOT.md`

Otherwise, this prompt plan assumes the existing SOT routes and flows remain the contract.
