# BLOG — Frontend UI/UX System Plan (SOT)

> **IMPORTANT: If you enhance, update, or change this plan (including additions or removals), you MUST also update all relevant SOT folder files to keep the documentation in sync. This includes:**
> - `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md`
> - `DOC/FEATURES/BLOG/SOT/FEATURE-SOT.md`
> - `DOC/FEATURES/BLOG/SOT/IMPLEMENTATION-PLAN.md`
> - `DOC/FEATURES/BLOG/SOT/tasks.md`
> - Any other SOT or audit files impacted by the change
>
> **Additionally, for every new or changed step, add or update the corresponding prompts in this file to reflect the updated plan.**
>
> **When using an AI builder, always refer to this instruction so that all documentation and prompt plans remain aligned.**

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
  This is Step X in the BLOG frontend flow.
  ```
- Each step must define:
  - Trigger source
  - Exit destination
  - UI states

### UX Safety Rules
- No invisible state transitions.
- No irreversible actions without a confirmation UX.
- No “happy path only” flows.

---

### In Scope
- Navigation & layout
- Modals/confirmations
- UX permissions (visible vs disabled)

- Database schema
- Automation logic
Existing blog routes must remain functional until explicitly approved to change:
- `/blog`
---


- Public header/nav links (guest)
- Admin sidebar blog group (admin)
- Deep-link to `/blog/[slug]`

### Pages Hierarchy

```
 ├─ /blog/[slug] (Canonical Post)
 └─ /blog/post (Legacy compatibility)
Admin
 ├─ /admin/blog (Posts list)
 ├─ /admin/blog/[id] (Edit)
 ├─ /admin/blog/[id]/preview (Preview)
 ├─ /admin/blog/comments (Comments Management)
 ├─ /admin/blog/categories (Categories)
```
---

## 4) Core Domain Objects (UI-Level Contract)

> ⚠️ These are **conceptual objects**, NOT schemas.

### 4.1 Object: Blog Post
- Public post detail
- Admin posts table

**Minimum display fields:**
- Slug (url + admin reference)
- Excerpt (card preview)
- Author name (trust)
- Published date (freshness)
- Read time (expectation)

### 4.2 Object: Category
- Public card label

**Minimum display fields:**
- Name
- Slug

### 4.3 Object: Tag
**Used in UI for:**

**Minimum display fields:**
- Slug

Statuses must be mutually exclusive, visually distinct, and map to behavior:
- `DRAFT`
- `ARCHIVED`



### Public primary flow
1. Visitor enters `/blog`.
2. Visitor browses post cards.
3. Visitor clicks a post card.
4. Visitor reads at `/blog/[slug]`.
5. Visitor can share (MVP: Copy Link).
1. Visitor arrives at `/blog/post`.
2. Page reads `sessionStorage.currentBlogPost`.
4. Else it renders the stored post payload.

### Admin primary flow
5. Admin publishes now OR schedules for later.

- Empty states: no posts yet (public/admin)
- Errors: fetch failed → show message + retry
- Disabled actions: cannot publish if required fields missing (UX-level disable)

---

## 6) Build Sequence (Locked Order)

**Total Steps:** `54`

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
| 12   | Page         | Admin Blog Engine Hub Shell (`/admin/blog/engine`) | Automation parity |
| 13   | Page         | Hub Tab: Dashboard                      | Pipeline visibility |
| 14   | Page         | Hub Tab: Drafts & Reviews               | Review-first workflow |
| 15   | Page         | Hub Tab: Automation Logic               | Rules + publish windows |
| 16   | Page         | Hub Tab: Sources (RSS for blog research) | Research inputs |
| 17   | Page         | Hub Tab: Audit Logs                     | Traceability |
| 18   | Page         | Hub Tab: Master Control                 | Pause/stop safety |
| 19   | Modal        | Draft Review Modal (AI draft decisioning) | Approve/reject/rewrite |
| 20   | Modal        | Prompt Details Modal                    | Transparency |
| 21   | Modal        | Confirm Pause Automation                | Risk control |
| 22   | Modal        | Confirm Emergency Stop                  | Risk control |
| 23   | Page         | Admin Media Library (`/admin/blog/media`) | Blog CMS |
| 24   | Page         | Admin Comments (`/admin/blog/comments`) | Blog CMS |
| 25   | Modal        | Upload/Add Media                        | CMS action |
| 26   | Modal        | Confirm Delete Media                    | Risk control |
| 27   | Modal        | Moderate Comment                        | CMS action |
| 28   | Modal        | Confirm Delete Comment                  | Risk control |
| 29   | Modal        | Create/Edit Category or Tag             | UI/UX enhancement |
| 30   | Modal        | Engine Hub Header Action Triggers       | UI/UX enhancement |
| 31   | Modal        | Engine Hub Settings Tab Placeholder      | UI/UX enhancement |
| 32   | Modal        | Remove or Disable Out-of-Scope Media Library Controls | UI/UX enhancement |
| 33   | Modal        | Trigger & Interaction Completeness Audit | UI/UX enhancement |
| 34   | Modal        | Admin Sidebar System Actions (Settings + Logout) | UI/UX enhancement |
| 35   | Page/Control | Public Blog Listing “Load More Articles” Behavior | UI/UX enhancement |
| 36   | Modal/Action | Admin Editor AI “Generate” Action Behavior | UI/UX enhancement |
| 37   | Modal/Menu   | Media Library Mobile Overflow Actions Menu | UI/UX enhancement |
| 38   | Modal        | Engine Sources Edit Source Modal        | UI/UX enhancement |
| 39   | Modal        | Final Trigger & Interaction Completeness Audit (Additions) | UI/UX enhancement |
| 40   | Page         | Admin Posts Bulk Selection + Bulk Actions | UI/UX enhancement |
| 41   | Modal        | Confirm Bulk Move Posts to Trash         | UI/UX enhancement |
| 42   | Page         | Admin Comments Bulk Selection + Bulk Actions | UI/UX enhancement |
| 43   | Modal        | Confirm Bulk Delete Comments             | UI/UX enhancement |
| 44   | Modal        | Bulk Moderate Comments                   | UI/UX enhancement |
| 45   | Modal        | Draft Review Modal “Edit” Trigger Wiring | UI/UX enhancement |
| 46   | Page/Tab     | Engine Hub Settings Tab — MVP Settings UI | UI/UX enhancement |
| 47   | Modal        | Final Trigger & Interaction Audit (Bulk + Draft + Settings) | UI/UX enhancement |
| 48   | Page         | Admin Posts Trash (`/admin/blog/trash`)  | UI/UX enhancement |
| 49   | Modal        | Confirm Restore Post                      | UI/UX enhancement |
| 50   | Modal        | Confirm Permanent Delete Post             | UI/UX enhancement |
| 51   | Modal/Action | Admin Editor “Save Draft” Button Behavior | UI/UX enhancement |
| 52   | Modal/Action | Admin Editor “Archive” Button — No Dead Trigger | UI/UX enhancement |
| 53   | Page         | Admin Trash Bulk Selection + Bulk Actions | UI/UX enhancement |
| 54   | Modal        | Engine Sources Delete Confirmation Modal  | UI/UX enhancement |

⚠️ Steps must be built strictly in order.

---

# 🧠 STEP-BY-STEP UI/UX SPEC + AI-READY PROMPTS

> Copy/paste each step into your AI builder. Do NOT skip steps.

---

## 🔹 Step 1 — Public Blog Listing Page (`/blog`)

### AI BUILD PROMPT (copy/paste)

This is Step 1 in the BLOG frontend flow.

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

## 🔹 Step 2 — Public Blog Post Page (`/blog/[slug]`)

### AI BUILD PROMPT (copy/paste)

This is Step 2 in the BLOG frontend flow.

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

## 🔹 Step 3 — Legacy Blog Post Page (`/blog/post`) (Compatibility)

### AI BUILD PROMPT (copy/paste)

This is Step 3 in the BLOG frontend flow.

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

## 🔹 Step 4 — Admin Posts List (`/admin/blog`)

### AI BUILD PROMPT (copy/paste)

This is Step 4 in the BLOG frontend flow.

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

## 🔹 Step 5 — Admin Blog Editor Page (Create + Edit) (`/admin/blog/new`, `/admin/blog/[id]`)

### AI BUILD PROMPT (copy/paste)

This is Step 5 in the BLOG frontend flow.

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

## 🔹 Step 6 — Admin Post Preview (`/admin/blog/[id]/preview`)

### AI BUILD PROMPT (copy/paste)

This is Step 6 in the BLOG frontend flow.

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

## 🔹 Step 7 — Admin Categories (`/admin/blog/categories`)

### AI BUILD PROMPT (copy/paste)

This is Step 7 in the BLOG frontend flow.

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

## 🔹 Step 8 — Admin Tags (`/admin/blog/tags`)

### AI BUILD PROMPT (copy/paste)

This is Step 8 in the BLOG frontend flow.

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

## 🔹 Step 9 — Modal: Confirm Delete/Trash Post

### AI BUILD PROMPT (copy/paste)

This is Step 9 in the BLOG frontend flow.

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

## 🔹 Step 10 — Modal: Confirm Publish Now

### AI BUILD PROMPT (copy/paste)

This is Step 10 in the BLOG frontend flow.

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

## 🔹 Step 11 — Modal: Confirm Schedule Publish

### AI BUILD PROMPT (copy/paste)

This is Step 11 in the BLOG frontend flow.

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

# ✅ ADDENDUM — AI + AUTOMATION PARITY (Steps 12–22)

These steps extend the existing v1 blog UI so the BLOG feature has the same kind of operational AI + automation UX expectations as the News Engine.

Rules:
- Build strictly in order.
- Pages first, then modals.
- UI only (no backend calls). Describe behaviors.

---

## 🔹 Step 12 — Admin Blog Engine Hub Shell (`/admin/blog/engine`)

### AI BUILD PROMPT (copy/paste)

This is Step 12 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin navigates to `/admin/blog/engine` from the admin sidebar.

Task:
- Build the Blog Engine Hub shell page.

Layout Structure:
- Header: “Blog Engine” + short helper text.
- Operational mode selector (UI-only): Manual / Assisted / Automatic.
- Global actions (UI-only): “Pause Automation” and “Test Generate”.
- Tabs (no separate routes required in this step):
  - Dashboard
  - Drafts & Reviews
  - Automation Logic
  - Sources
  - Audit Logs
  - Master Control
  - Settings

UI States:
- Default: hub shell rendered with empty tab placeholders.
- Loading: show skeleton within tab area.
- Error: show a simple inline banner + Retry button.

Constraints:
- Do not implement backend logic.
- Do not remove or redesign existing `/admin/blog` CRUD pages.

Stop after:
- This page shell only (no deep tab content yet).

---

## 🔹 Step 13 — Hub Tab: Dashboard (Pipeline Visibility)

### AI BUILD PROMPT (copy/paste)

This is Step 13 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin opens `/admin/blog/engine` and selects the “Dashboard” tab.

Task:
- Build the Dashboard tab content inside the hub.

Layout Structure:
- KPI strip cards (UI-only): Drafts Today, Needs Review, Scheduled, Published.
- Minimal filters: Status dropdown + Search input.
- List/table of items (AI drafts and manual drafts appear here): Title, Status, Updated, Actions.

Interaction Map:
- “Review” action → opens Draft Review Modal (do not build modal yet; reference Step 19).

UI States:
- Loading, empty, error.

Stop after:
- Dashboard tab UI only.

---

## 🔹 Step 14 — Hub Tab: Drafts & Reviews

### AI BUILD PROMPT (copy/paste)

This is Step 14 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin opens `/admin/blog/engine` and selects the “Drafts & Reviews” tab.

Task:
- Build the review queue UI.

Layout Structure:
- Queue list (cards or table): Title, Source (Manual/AI/Automation), Status, Updated.
- Status pills: All / Needs Review / Draft Ready / Rejected / Error.

Interaction Map:
- Click “Review” → opens Draft Review Modal (Step 19).
- Click “Open in Editor” → navigates to `/admin/blog/[id]` (existing route).

UI States:
- Loading, empty, error.

Stop after:
- Drafts & Reviews tab UI only.

---

## 🔹 Step 15 — Hub Tab: Automation Logic

### AI BUILD PROMPT (copy/paste)

This is Step 15 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin opens `/admin/blog/engine` and selects “Automation Logic”.

Task:
- Build the automation configuration UI.

Layout Structure:
- Toggles (UI-only): Auto Draft, Auto Schedule, Auto Publish.
- Publish windows panel (UI-only): timezone note + one or more time window rows.
- Safeguards panel (UI-only): daily limit, min quality score, block publish if missing required fields.

UI States:
- Saving indicator after toggle changes (UI-only), success feedback.

Constraints:
- No real persistence.

Stop after:
- Automation Logic tab UI only.

---

## 🔹 Step 16 — Hub Tab: Sources (RSS for blog research)

### AI BUILD PROMPT (copy/paste)

This is Step 16 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin selects “Sources”.

Task:
- Build a Sources manager for RSS feeds used for blog research/topic discovery.

Layout Structure:
- Table/list: Name, URL, Enabled toggle, Last checked (placeholder), Items found (placeholder), Actions.
- Primary action: “Add Source” (UI-only).

Interaction Map:
- Add/Edit opens an inline drawer or simple modal (UI-only; you may keep it inline in this step).

UI States:
- Loading, empty, error.

Constraints:
- This is for BLOG research only, not publishing news.

Stop after:
- Sources tab UI only.

---

## 🔹 Step 17 — Hub Tab: Audit Logs

### AI BUILD PROMPT (copy/paste)

This is Step 17 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin selects “Audit Logs”.

Task:
- Build an audit log table for AI + automation + admin actions.

Layout Structure:
- Table: Timestamp, Actor (AI/Automation/Admin), Action, Target (post), Result (success/error).
- Row action: “Prompt Details” (only visible for AI-generated rows).

Interaction Map:
- Click “Prompt Details” → opens Prompt Details Modal (Step 20).

UI States:
- Loading, empty, error.

Stop after:
- Audit Logs tab UI only.

---

## 🔹 Step 18 — Hub Tab: Master Control

### AI BUILD PROMPT (copy/paste)

This is Step 18 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin selects “Master Control”.

Task:
- Build a safety-focused control panel.

Layout Structure:
- Current status indicator: Running / Paused / Emergency Stopped.
- Actions:
  - Pause automation → opens Confirm Pause Automation modal (Step 21)
  - Resume automation → confirmation-gated (can reuse Step 21 with different copy)
  - Emergency stop → opens Confirm Emergency Stop modal (Step 22)

Constraints:
- UI only.

Stop after:
- Master Control tab UI only.

---

## 🔹 Step 19 — Modal: Draft Review (AI Draft Decisioning)

### AI BUILD PROMPT (copy/paste)

This is Step 19 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Blog Engine Hub tabs (Dashboard, Drafts & Reviews) clicking “Review”.

Purpose:
- Let admin review an AI/automation-generated draft and take a decision.

Modal Structure:
- Title: “Review Draft”
- Summary section: title, status, generated source (Manual/AI/Automation)
- Content preview area (read-only)
- Actions:
  - Save edits (UI-only)
  - Request rewrite (UI-only)
  - Reject (ask for reason inline in modal)
  - Publish Now → uses existing “Confirm Publish Now” modal (Step 10)
  - Schedule → uses existing “Confirm Schedule Publish” modal (Step 11)

Exit Rules:
- Close returns to hub.
- Any action shows success feedback (UI-only).

Constraints:
- No nested modals other than invoking Step 10/11 confirmations.

Stop after:
- This modal only.

---

## 🔹 Step 20 — Modal: Prompt Details

### AI BUILD PROMPT (copy/paste)

This is Step 20 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Audit Logs tab clicking “Prompt Details”.

Purpose:
- Transparency for AI-generated content.

Modal Structure:
- Title: “Prompt Details”
- Sections:
  - Intent (outline/article/SEO/rewrite)
  - Inputs used (topic, keywords)
  - Source links used (RSS URLs list)
  - Constraints (tone/length)
- Action: Close

Constraints:
- Read-only.

Stop after:
- This modal only.

---

## 🔹 Step 21 — Modal: Confirm Pause Automation

### AI BUILD PROMPT (copy/paste)

This is Step 21 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Master Control tab clicking “Pause automation”.

Purpose:
- Confirm a risk-control action.

Modal Structure:
- Title: “Pause automation?”
- Body: explain that automated drafts/scheduling/publishing will stop until resumed.
- Actions: Cancel / Pause

Stop after:
- This modal only.

---

## 🔹 Step 22 — Modal: Confirm Emergency Stop

### AI BUILD PROMPT (copy/paste)

This is Step 22 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Master Control clicking “Emergency stop”.

Purpose:
- Confirm a high-risk stop action.

Modal Structure:
- Title: “Emergency stop?”
- Body: strong warning copy.
- Actions: Cancel / Emergency Stop

Stop after:
- This modal only.

---

## Notes for Redesigning the Entire Blog UI/UX

If you decide to **change routes, add new pages (beyond those already listed), or change major flows**, you must update:
- `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md`
- And reflect the changes in `DOC/FEATURES/BLOG/SOT/FEATURE-SOT.md`

Otherwise, this prompt plan assumes the existing SOT routes and flows remain the contract.

---

# ✅ ADDENDUM — BLOG CMS EXTENSIONS (Media + Comments) (Steps 23–28)

These steps extend the BLOG admin CMS to include a Media Library and Comments management.

Rules:
- Build strictly in order.
- Pages first, then modals.
- UI only (no backend calls). Describe behaviors.
- This addendum covers **admin CMS** only; it does not add public comment submission/display unless explicitly approved.

---

## 🔹 Step 23 — Admin Media Library (`/admin/blog/media`)

### AI BUILD PROMPT (copy/paste)

This is Step 23 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin navigates to `/admin/blog/media` from the admin sidebar (Blog CMS group).

Task:
- Build the Admin Media Library page.

Layout Structure:
- Header: “Media Library” + short helper text.
- Primary action: “Upload Media” button (opens Step 25 modal; do not build modal yet).
- Secondary actions (UI-only): “New Folder” (optional), “Bulk Select” toggle.
- Filters:
  - Search input
  - Type filter (All / Images / Videos / Documents)
- Main content:
  - Grid of media tiles OR table view.
  - Each item shows: thumbnail/icon, filename, type, size (placeholder), uploaded date (placeholder).
- Item actions:
  - “Copy URL” (shows success toast UI-only)
  - “Preview” (inline panel or lightbox UI-only)
  - “Delete” (opens Step 26 modal; do not build modal yet)

UI States:
- Loading: skeleton grid.
- Empty: “No media yet” + Upload button.
- Error: inline banner + Retry.

Constraints:
- Do not implement real uploads.
- Keep this independent from the editor (editor can continue using URL inputs; admin can copy URL from here).

Stop after:
- This page UI only.

---

## 🔹 Step 24 — Admin Comments Management (`/admin/blog/comments`)

### AI BUILD PROMPT (copy/paste)

This is Step 24 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin navigates to `/admin/blog/comments` from the admin sidebar (Blog CMS group).

Task:
- Build the Comments management page (moderation queue).

Layout Structure:
- Header: “Comments” + short helper text.
- Filters:
  - Search input (author/text)
  - Status pills: All / Pending / Approved / Hidden / Spam
- Table:
  - Columns: Author, Comment (truncated), Post (title/slug), Status, Submitted (timestamp placeholder), Actions
- Row actions:
  - “Moderate” (opens Step 27 modal; do not build modal yet)
  - Quick actions (optional UI-only): Approve, Hide, Spam
  - “Delete” (opens Step 28 modal; do not build modal yet)

UI States:
- Loading: table skeleton.
- Empty: “No comments yet”.
- Error: inline banner + Retry.

Constraints:
- Admin moderation UI only.
- No public comment submission or public comment display in this plan unless explicitly approved.

Stop after:
- This page UI only.

---Done until now 

## 🔹 Step 25 — Modal: Upload/Add Media

### AI BUILD PROMPT (copy/paste)

This is Step 25 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Media Library clicking “Upload Media”.

Purpose:
- Provide a safe UI to select files and add metadata.

Modal Structure:
- Title: “Upload media”
- Body:
  - Dropzone area (UI-only)
  - File list (selected files)
  - Optional fields (UI-only): Alt text, Caption, Folder
- Actions: Cancel / Upload

UI States:
- Uploading state: disable actions and show progress (UI-only).
- Validation: show error if no file selected (UI-only).

Stop after:
- This modal only.

---

## 🔹 Step 26 — Modal: Confirm Delete Media

### AI BUILD PROMPT (copy/paste)

This is Step 26 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Media Library clicking “Delete” on a media item.

Purpose:
- Confirm destructive deletion of a media asset.

Modal Structure:
- Title: “Delete media?”
- Body: warn about breaking existing posts that reference the asset URL.
- Actions: Cancel / Delete

Stop after:
- This modal only.

---

## 🔹 Step 27 — Modal: Moderate Comment

### AI BUILD PROMPT (copy/paste)

This is Step 27 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Comments page clicking “Moderate”.

Purpose:
- Let admin review and take a moderation decision.

Modal Structure:
- Title: “Moderate comment”
- Body:
  - Comment preview (read-only)
  - Post reference (title/slug)
  - Author + submitted time (placeholder)
  - Optional internal note field
- Actions:
  - Approve
  - Hide
  - Mark as Spam
  - Cancel

Constraints:
- No nested modals.

Stop after:
- This modal only.

---


## 🔹 Step 28 — Modal: Confirm Delete Comment

### AI BUILD PROMPT (copy/paste)

This is Step 28 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Comments page clicking “Delete”.

Purpose:
- Confirm a destructive moderation action.

Modal Structure:
- Title: “Delete comment?”
- Body: warn that this permanently removes the comment.
- Actions: Cancel / Delete

Stop after:
- This modal only.

---

## 🔹 Step 29 — Modal: Create/Edit Category or Tag

### AI BUILD PROMPT (copy/paste)

This is Step 29 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Categories or Tags page clicking “Add Category”, “Add Tag”, or “Edit” on a row.

Purpose:
- Provide a modal for creating or editing a category or tag.

Modal Structure:
- Title: “Add Category”, “Edit Category”, “Add Tag”, or “Edit Tag” (contextual)
- Fields:
  - Name (required)
  - Slug (required; auto-generate from name but editable)
- Actions: Save / Cancel
- Validation: show error if required fields missing
- Success: show toast/banner on save

Acceptance criteria:
- All Add/Edit controls have `onClick` and open this modal.
- Modal is pre-filled for Edit.
- Works from both table and empty state Add buttons.
- Data can be kept in component state (prototype-only).

Stop after:
- This modal only.

---

## 🔹 Step 30 — Engine Hub Header Action Triggers

### AI BUILD PROMPT (copy/paste)

This is Step 30 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Blog Engine Hub header clicking “Pause Automation” or “Test Generate”.

Task:
- Ensure both header buttons are not dead controls.

Acceptance criteria:
- “Pause Automation” switches to the “Master Control” tab and focuses the pause/resume section, OR opens the existing confirmation modal.
- “Test Generate” switches to the “Drafts & Reviews” tab and shows a toast “Test generation queued (UI-only)”, OR creates a new mock draft row and shows it in the review queue.

Stop after:
- This header action logic only (UI-only, no backend).

---

## 🔹 Step 31 — Engine Hub Settings Tab Placeholder

### AI BUILD PROMPT (copy/paste)

This is Step 31 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- Admin selects the “Settings” tab in Blog Engine Hub.

Task:
- Render a dedicated Settings panel as a placeholder.

Acceptance criteria:
- Panel copy must state:
  - “Settings is a placeholder in this prototype”
  - “No secrets are exposed client-side”
  - “Settings will be defined in a future approved SOT update”
- No interactive controls inside Settings.

Stop after:
- This placeholder panel only.

---

## 🔹 Step 32 — Remove or Disable Out-of-Scope Media Library Controls

### AI BUILD PROMPT (copy/paste)

This is Step 32 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Media Library header/toolbar, encountering “New Folder” or grid/list toggle controls.

Task:
- Remove or disable any controls not in SOT scope.

Acceptance criteria:
- “New Folder” is either removed or disabled with “Not in scope” copy.
- Grid/List toggle is either removed, implemented as a local state toggle, or disabled with “Not in scope” copy.

Stop after:
- This toolbar logic only.

---

## 🔹 Step 33 — Trigger & Interaction Completeness Audit

### AI BUILD PROMPT (copy/paste)

This is Step 33 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- After Steps 1–32, re-run the “Trigger & Interaction Completeness” audit pass:
  - Click every visible button/icon-button in Categories, Tags, Media Library header/toolbar, Engine Hub header, and Engine Hub Settings.

Acceptance criteria:
- No control is “dead” (no-op) unless clearly disabled.
- Categories/Tags support create/edit/delete with feedback.
- Engine Hub header actions produce deterministic outcomes.
- Settings is either meaningful or explicitly a documented placeholder.

Stop after:
- This audit pass only.

---

## 🔹 Step 34 — Admin Sidebar System Actions (Settings + Logout)

### AI BUILD PROMPT (copy/paste)

This is Step 34 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In the Admin Sidebar “System” section: clicking “Settings”.
- In the Admin Sidebar user footer: clicking the Logout icon-button.

Task:
- Make both controls deterministic (no dead triggers) without adding backend auth.

Requirements:
- Settings button:
  - Must not be a no-op.
  - Simplest acceptable outcome: render as disabled with explicit “Not in scope” tooltip/title and `aria-disabled`.
  - Alternative acceptable outcome: navigate to an existing placeholder surface if one already exists (do not invent new routes).
- Logout icon-button:
  - On click: show a deterministic UI-only feedback (toast or inline message) like “Logged out (demo)”.
  - Then route the user back to the public site (e.g., clear `window.location.hash` or navigate to `/blog`).

Acceptance criteria:
- Clicking Settings results in either a disabled state with clear copy OR a meaningful navigation/placeholder.
- Clicking Logout produces visible feedback and routes out of admin.
- No new backend calls.

Stop after:
- Sidebar logic only.

---

## 🔹 Step 35 — Public Blog Listing “Load More Articles” Button Behavior

### AI BUILD PROMPT (copy/paste)

This is Step 35 in the BLOG frontend flow.

Context:
- You are a SaaS frontend UI/UX engineer.
- Scope: UI only.

Trigger:
- On `/blog`, clicking the “Load More Articles” button.

Task:
- Replace the dead trigger with deterministic UI-only behavior.

Requirements:
- On click:
  - Provide a brief loading state (button spinner/disabled) then show a deterministic result.
  - The deterministic result can be either:
    - A toast/inline message “No more articles in demo”, OR
    - The button becomes disabled with “End of results” copy.
- Do not implement pagination or backend.

Acceptance criteria:
- Button is never a no-op.
- Behavior is deterministic and clearly communicates “UI-only”.

Stop after:
- This control behavior only.

---

## 🔹 Step 36 — Admin Editor AI “Generate” Button Behavior

### AI BUILD PROMPT (copy/paste)

This is Step 36 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Admin Blog Editor AI tab, clicking “Generate”.

Task:
- Replace the dead trigger with deterministic UI-only behavior.

Requirements:
- On click:
  - Show a visible feedback state (loading on the button).
  - Then show a deterministic outcome:
    - At minimum: toast/inline message like “AI generation is UI-only in this demo”.
    - Optional (allowed): generate mock text based on the prompt textarea and insert it into a suitable editor field (do not call an API).

Acceptance criteria:
- Generate is not a no-op.
- User sees a clear result every time.

Stop after:
- AI tab behavior only.

---

## 🔹 Step 37 — Media Library Mobile Overflow Actions Menu

### AI BUILD PROMPT (copy/paste)

This is Step 37 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Media Library grid view on mobile (`sm:hidden`), clicking the overflow (kebab) icon.

Task:
- Implement a deterministic overflow actions menu for the media item.

Requirements:
- Clicking the kebab button opens a small menu anchored to the button.
- Menu options (minimum):
  - Copy URL (reuse existing copy handler behavior).
  - Delete (reuse existing delete confirmation behavior).
- Clicking outside closes the menu.

Acceptance criteria:
- Kebab button is not a no-op.
- Mobile users can reach actions.

Stop after:
- This overflow menu only.

---

## 🔹 Step 38 — Engine Sources “Edit Source” Modal

### AI BUILD PROMPT (copy/paste)

This is Step 38 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Engine Hub → Sources tab, clicking the Edit icon for a source row.

Task:
- Implement a deterministic Edit Source flow.

Requirements:
- Clicking Edit opens the existing Add Source modal in edit mode (do not create a new design).
- Prefill fields using the selected source.
- Save updates the source row in local state.
- Cancel closes without changes.

Acceptance criteria:
- Edit is not a no-op.
- Save/Cancel behave deterministically.

Stop after:
- Sources edit flow only.

---

## 🔹 Step 39 — Final Trigger & Interaction Completeness Audit (Additions)

### AI BUILD PROMPT (copy/paste)

This is Step 39 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Re-run the “Trigger & Interaction Completeness” audit pass for the additions:
  - Admin Sidebar: Settings + Logout.
  - Public `/blog`: “Load More Articles”.
  - Admin Editor AI tab: “Generate”.
  - Media Library mobile grid: overflow actions.
  - Engine Sources: Edit.

Acceptance criteria:
- No control is dead unless clearly disabled.
- Each trigger results in deterministic feedback.

Stop after:
- This audit pass only.

---

## 🔹 Step 40 — Admin Posts Bulk Selection + Bulk Actions

### AI BUILD PROMPT (copy/paste)

This is Step 40 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- On Admin Posts List (`/admin/blog`), user wants to select multiple posts and run a bulk action.

Task:
- Add bulk selection + a bulk actions surface to the Posts table without changing existing single-row actions.

Requirements:
- Add a leading checkbox column:
  - Header checkbox = select/deselect all visible rows.
  - Row checkbox = select/deselect the row.
- When one or more rows are selected, show a bulk actions bar (above table or sticky within table container):
  - Shows selected count.
  - Action button: “Move to Trash” (bulk).
  - Action button: “Clear selection”.
- “Move to Trash” must open a confirmation modal (do not delete immediately).

Acceptance criteria:
- Admin can select multiple posts.
- Bulk bar only appears when selection > 0.
- Single-row actions remain unchanged.

Stop after:
- Bulk selection + bulk bar UI only (modal built in the next step).

---

## 🔹 Step 41 — Modal: Confirm Bulk Move Posts to Trash

### AI BUILD PROMPT (copy/paste)

This is Step 41 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Step 40 bulk bar, clicking “Move to Trash”.

Task:
- Add a confirmation modal for bulk trashing posts.

Requirements:
- Modal content:
  - Title: “Move selected posts to trash?”
  - Body: show selected count and warn it can be undone only if your product supports it (UI-only copy).
  - Primary action: “Move to Trash” (destructive).
  - Secondary: “Cancel”.
- On confirm:
  - Apply deterministic UI-only behavior:
    - Remove the selected rows from the table list OR mark them as trashed locally.
  - Clear selection.
  - Show a success toast.

Acceptance criteria:
- Bulk trash action is deterministic.
- No irreversible action occurs without confirmation.

Stop after:
- This modal + wiring to Step 40 only.

---

## 🔹 Step 42 — Admin Comments Bulk Selection + Bulk Actions

### AI BUILD PROMPT (copy/paste)

This is Step 42 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- On Admin Comments (`/admin/blog/comments`), user wants to select multiple comments and bulk moderate or bulk delete.

Task:
- Add bulk selection + a bulk actions surface to the Comments table without removing existing per-row quick actions.

Requirements:
- Add a leading checkbox column:
  - Header checkbox = select/deselect all visible rows.
  - Row checkbox = select/deselect row.
- When selection > 0, show a bulk actions bar:
  - Selected count.
  - Buttons:
    - “Approve” (bulk)
    - “Hide” (bulk)
    - “Mark Spam” (bulk)
    - “Delete” (bulk)
  - “Clear selection”
- Bulk actions must not be no-ops:
  - Bulk Delete opens a confirmation modal (next step).
  - Bulk status changes open a bulk moderation modal (Step 44).

Acceptance criteria:
- Admin can select multiple comments.
- Bulk action buttons only appear when selection > 0.

Stop after:
- Bulk selection + bulk bar UI only (modals built in next steps).

---

## 🔹 Step 43 — Modal: Confirm Bulk Delete Comments

### AI BUILD PROMPT (copy/paste)

This is Step 43 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Step 42 bulk bar, clicking “Delete”.

Task:
- Add a confirmation modal for bulk deleting comments.

Requirements:
- Title: “Delete selected comments?”
- Body: show selected count and emphasize permanence.
- Confirm: “Delete comments” (destructive)
- Cancel.
- On confirm:
  - Remove selected comments from the table list (UI-only local state).
  - Clear selection.
  - Show toast.

Acceptance criteria:
- Bulk delete is deterministic and confirmed.

Stop after:
- This modal + wiring to Step 42 only.

---

## 🔹 Step 44 — Modal: Bulk Moderate Comments

### AI BUILD PROMPT (copy/paste)

This is Step 44 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- From Step 42 bulk bar, clicking “Approve”, “Hide”, or “Mark Spam”.

Task:
- Add a bulk moderation modal that confirms the selected action and applies it to selected comments.

Requirements:
- Modal shows:
  - Action being applied (Approve / Hide / Mark Spam).
  - Selected count.
  - Optional internal note field (UI-only).
  - Confirm + Cancel.
- On confirm:
  - Update status of all selected comments in local state.
  - Clear selection.
  - Show toast.

Acceptance criteria:
- Bulk status changes are deterministic.
- No dead triggers.

Stop after:
- This modal + wiring to Step 42 only.

---

## 🔹 Step 45 — Draft Review Modal “Edit” Trigger Wiring

### AI BUILD PROMPT (copy/paste)

This is Step 45 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Engine Hub → Drafts & Reviews, opening the Draft Review modal, then clicking the “Edit” button.

Task:
- Ensure “Edit” is not a dead control.

Requirements:
- Clicking “Edit” must do something deterministic.
- Simplest acceptable behavior:
  - Close the review modal.
  - Navigate to the Admin Blog Editor for that draft id (route already used elsewhere).
  - Show a toast “Opened in editor” (optional but preferred).

Acceptance criteria:
- “Edit” is no longer a no-op.
- Admin has a clear path from review → edit.

Stop after:
- Review modal wiring only.

---

## 🔹 Step 46 — Engine Hub Settings Tab — MVP Settings UI

### AI BUILD PROMPT (copy/paste)

This is Step 46 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Engine Hub, clicking the Settings tab.

Task:
- Replace the empty/placeholder Settings surface with an MVP settings UI that supports the existing Engine Hub behaviors.

Requirements:
- Must remain safe (no secrets client-side). UI-only local state is fine.
- Add an MVP form with clearly labeled sections such as:
  - Automation Controls Defaults (e.g., default paused state display)
  - Draft Generation (frequency dropdown / toggle UI-only)
  - Review Queue Rules (e.g., auto-assign, confidence threshold UI-only)
  - Sources Refresh (e.g., refresh cadence UI-only)
- Include Save/Cancel controls with deterministic feedback (toast “Saved (UI-only)”).
- Do not invent new routes.

Acceptance criteria:
- Settings is not empty.
- Admin can interact with settings controls and gets deterministic feedback.

Stop after:
- Settings tab UI only.

---

## 🔹 Step 47 — Final Trigger & Interaction Audit (Bulk + Draft + Settings)

### AI BUILD PROMPT (copy/paste)

This is Step 47 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Re-run the “Trigger & Interaction Completeness” audit pass for the newest additions:
  - Posts bulk selection + bulk trash.
  - Comments bulk selection + bulk moderate + bulk delete.
  - Draft Review modal “Edit” button.
  - Engine Hub Settings tab MVP UI.

Acceptance criteria:
- No dead triggers.
- Bulk actions always confirm before destructive changes.
- All actions produce deterministic feedback.

Stop after:
- This audit pass only.

---

## 🔹 Step 48 — Admin Posts Trash Page (`/admin/blog/trash`)

### AI BUILD PROMPT (copy/paste)

This is Step 48 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Why this exists:
- The Posts list supports “Move to Trash” and claims it can be undone “from the trash folder”.
- This step adds that missing destination so the lifecycle is end-to-end.

Trigger:
- From Admin Posts List (`/admin/blog`), admin must have a deterministic way to reach the Trash page.

Task:
- Build an Admin Posts Trash page at `/admin/blog/trash`.

Layout Structure:
- Header:
  - Title: “Trash”
  - Short helper text: “Posts moved to trash can be restored or permanently deleted.”
  - “Back to Posts” control that navigates to `/admin/blog`.
- Content:
  - Table layout consistent with Posts list (reuse the same styling patterns).
  - Columns (minimum): Title | Previous Status | Trashed At | Actions
  - Actions per row:
    - Restore (non-destructive)
    - Delete Permanently (destructive)

Interaction Map:
- Restore → opens “Confirm Restore Post” modal (Step 49).
- Delete Permanently → opens “Confirm Permanent Delete Post” modal (Step 50).
- Back to Posts → `/admin/blog`.

UI States:
- Loading: skeleton.
- Empty: “Trash is empty”.
- Error: error message + Retry.

Constraints:
- UI-only (no backend calls).
- Must not invent unrelated new admin sections.

Stop after:
- This page UI only.

---

## 🔹 Step 49 — Confirm Restore Post

### AI BUILD PROMPT (copy/paste)

This is Step 49 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- On `/admin/blog/trash`, admin clicks “Restore” for a trashed post.

Task:
- Add a confirmation modal for restoring a post from trash.

Requirements:
- Copy:
  - Title: “Restore post?”
  - Body: “This will move the post back to your Posts list.”
  - Primary: “Restore”
  - Secondary: “Cancel”
- Deterministic UI-only result on confirm:
  - Remove the item from the Trash list UI.
  - Show a toast “Post restored (demo)”.

Acceptance criteria:
- Restore is confirmation-gated.
- After confirm, the UI deterministically reflects the restore.

Stop after:
- This modal + wiring from Step 48.

---

## 🔹 Step 50 — Confirm Permanent Delete Post

### AI BUILD PROMPT (copy/paste)

This is Step 50 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- On `/admin/blog/trash`, admin clicks “Delete Permanently” for a trashed post.

Task:
- Add a confirmation modal for permanently deleting a trashed post.

Requirements:
- Copy:
  - Title: “Delete permanently?”
  - Body: “This action is permanent and cannot be undone.”
  - Primary: “Delete Permanently”
  - Secondary: “Cancel”
- Deterministic UI-only result on confirm:
  - Remove the item from the Trash list UI.
  - Show a toast “Post permanently deleted (demo)”.

Acceptance criteria:
- Permanent delete is confirmation-gated.
- No dead triggers.

Stop after:
- This modal + wiring from Step 48.

---

## 🔹 Step 51 — Admin Editor “Save Draft” Button Behavior

### AI BUILD PROMPT (copy/paste)

This is Step 51 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Admin Blog Editor footer, clicking “Save Draft”.

Task:
- Replace any dead/no-op behavior with deterministic UI-only save feedback.

Requirements:
- On click:
  - Show a visible saving/loading state (e.g., spinner on button and temporarily disabled).
  - Then show a deterministic outcome:
    - Toast/banner: “Draft saved (demo)”.
    - Update any “Last saved …” label to reflect the action (UI-only).
- No backend calls.

Acceptance criteria:
- “Save Draft” is never a no-op.
- User gets visible feedback on every click.

Stop after:
- This button behavior only.

---

## 🔹 Step 52 — Admin Editor “Archive” Button — No Dead Trigger

### AI BUILD PROMPT (copy/paste)

This is Step 52 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Admin Blog Editor footer, the “Archive” button.

Task:
- Ensure the Archive control is not a dead/no-op trigger and does not create an undefined lifecycle destination.

Default (simplest) implementation:
- Disable the Archive button with explicit “Not in scope” affordance:
  - Use `disabled` + `aria-disabled`.
  - Provide a tooltip/title like “Not in scope”.
  - Ensure styling clearly communicates disabled state.

Constraints:
- Do not invent new archive destinations or new routes unless an approved SOT step explicitly defines the full archive lifecycle.

Acceptance criteria:
- Archive is not a no-op.
- If disabled, it is clearly and explicitly disabled (not clickable).

Stop after:
- This button behavior only.

---

## 🔹 Step 53 — Admin Trash Bulk Selection + Bulk Actions

### AI BUILD PROMPT (copy/paste)

This is Step 53 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- On Admin Posts Trash page (`/admin/blog/trash`), user wants to select multiple trashed posts and run a bulk action.

Task:
- Add bulk selection + bulk actions bar to the Trash table without changing existing single-row actions.

Requirements:
- Add a leading checkbox column:
  - Header checkbox = select/deselect all visible rows.
  - Row checkbox = select/deselect the row.
- When selection > 0, show a bulk actions bar:
  - Selected count.
  - "Restore Selected" button.
  - "Delete Forever" button (destructive).
  - "Clear Selection" button.
- Both bulk actions must open confirmation modals before execution:
  - Bulk Restore: "Restore [N] posts?" with Restore/Cancel actions.
  - Bulk Delete Forever: "Permanently delete [N] posts?" with Delete/Cancel actions (destructive styling).
- On confirm:
  - Update local state (remove from trash or restore to posts list).
  - Clear selection.
  - Show success toast.

UI States:
- Bulk bar only visible when selection > 0.
- Processing state on confirm buttons.

Acceptance criteria:
- Admin can select multiple trashed posts.
- Bulk bar appears when selection > 0.
- Bulk Restore and Bulk Delete Forever are confirmation-gated.
- Single-row actions remain unchanged.
- Checkbox indeterminate state works correctly.

Stop after:
- Bulk selection + bulk actions bar + confirmation modals.

---

## 🔹 Step 54 — Engine Sources Delete Confirmation Modal

### AI BUILD PROMPT (copy/paste)

This is Step 54 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- On Engine Hub → Sources tab, clicking delete icon for a source row.

Task:
- Replace the browser `confirm()` call with the existing `ConfirmationModal` component for consistency.

Requirements:
- Add modal state to EngineSources component:
  - `isDeleteModalOpen: boolean`
  - `sourceToDelete: SourceItem | null`
  - `isDeleting: boolean`
- On delete icon click:
  - Set `sourceToDelete` to the clicked source.
  - Open ConfirmationModal with:
    - Title: "Remove source?"
    - Message: "Are you sure you want to remove this RSS source? This will stop the engine from checking it for new topics."
    - Confirm label: "Remove Source"
    - Cancel label: "Cancel"
    - `isDestructive: true`
- On confirm:
  - Set loading state.
  - Remove the source from the local state array.
  - Close modal.
  - Show toast: "Source removed successfully."
- On cancel:
  - Close modal without changes.

Acceptance criteria:
- Delete no longer uses browser `confirm()`.
- Delete is confirmation-gated with custom modal.
- UX is consistent with other delete flows in the prototype.
- Loading/processing state works correctly.

Stop after:
- This confirmation modal wiring only.

---

## 🔹 Step 55 — Admin Posts Operational Status Expansion (SOT Alignment)

### AI BUILD PROMPT (copy/paste)

This is Step 55 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Purpose:
- Align the Admin Posts lifecycle visibility with BLOG SOT expectations (operational states) without adding backend logic.

Trigger:
- In Admin Posts surfaces (`/admin/blog` and `/admin/blog/trash`), viewing and filtering posts by lifecycle state.
- In Admin Editor, scheduling/publishing changes the post lifecycle state.

Task:
- Expand the UI-only post lifecycle model beyond just `draft/published` so that admins can see deterministic operational states.

Requirements:
- Add UI-only lifecycle states for admin posts (minimum set):
  - `scheduled`
  - `archived`
  - `needs_review`
  - `rejected`
  - `error`
- Update Admin Posts list status pills to include (minimum):
  - All / Published / Draft / Scheduled / Archived
  - Optional: Needs Review / Rejected / Error (only if it stays readable)
- Ensure every state has a deterministic “where it appears next”:
  - Scheduled posts appear under Scheduled filter.
  - Archived posts appear under Archived filter.
  - Needs Review / Rejected / Error appear under their respective filters (if implemented).
- Update scheduling behavior (UI-only):
  - When admin confirms scheduling a post, reflect a UI-only `scheduled` status and show a clear “Scheduled” state in the list.
- Update publish behavior (UI-only):
  - When admin confirms publish now, reflect `published` state.

Constraints:
- UI-only; do not add backend calls.
- Do not introduce new routes.
- Do not redesign the whole table; keep existing layout.

Acceptance criteria:

Stop after:

---

# ✅ PHASE 2 — AI & AUTOMATION ADMIN ENHANCEMENT PROMPTS (Steps 56–67)

These steps extend the BLOG admin UI/UX plan to provide deep, backend-friendly, deterministic admin control over all AI and automation surfaces, as required for e2e operational traceability and advanced admin workflows. All enhancements are UI-only and must be surfaced in existing Engine Hub tabs/routes.

---

## 🔹 Step 56 — AI Model Profile Management (Admin Control)

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add a UI surface in Engine Hub → Settings tab for managing AI model profiles.
- Admin can view, add, edit, and disable model profiles (UI-only; no backend calls).
- Each profile includes: Model name, provider, description, enabled/disabled toggle.

Acceptance criteria:
- Profiles are listed and editable in local state.
- No dead triggers; all actions show deterministic feedback.
- No secrets or keys exposed client-side.

---

## 🔹 Step 57 — Multi-Key Credential Pool (Admin Control)

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add a UI surface in Engine Hub → Settings tab for managing API credentials (multi-key pool).
- Admin can view, add, disable, and remove credentials (UI-only).
- Each credential: Label, provider, last used (placeholder), enabled/disabled toggle.

Acceptance criteria:
- Credentials are managed in local state only.
- No secrets or keys exposed client-side.
- All actions show deterministic feedback.

---

## 🔹 Step 58 — Model Routing Table (Admin Control)

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add a UI surface in Engine Hub → Settings tab for configuring routing rules.
- Admin can define which model/profile is used for which task (draft, review, image, etc.).
- Routing rules are editable and saved in local state.

Acceptance criteria:
- Routing table is visible and editable.
- All changes show deterministic feedback.

---

## 🔹 Step 59 — Operational Rules (Admin Control)

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add a UI surface in Engine Hub → Automation Logic tab for operational rules.
- Admin can set rules: max drafts/day, min quality score, block publish if missing fields, etc.
- Rules are editable and saved in local state.

Acceptance criteria:
- Rules are visible and editable.
- All changes show deterministic feedback.

---

## 🔹 Step 60 — Research Ingestion Source Types (Admin Control)

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add a UI surface in Engine Hub → Sources tab for managing research ingestion sources (RSS, scraper, manual).
- Admin can add, edit, enable/disable, and remove sources.
- Source type is selectable (RSS, scraper, manual input).

Acceptance criteria:
- Sources are managed in local state.
- All actions show deterministic feedback.

---

## 🔹 Step 61 — AI Image Generation Gating (Admin Control)

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add a UI surface in Engine Hub → Automation Logic tab for controlling AI image generation.
- Admin can enable/disable image generation, set limits, and review generated images (UI-only).

Acceptance criteria:
- Controls are visible and editable.
- All actions show deterministic feedback.

---

## 🔹 Step 62 — Audit Log Enrichment (AI/Automation Actions)

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Expand the Audit Logs tab to show enriched details for AI/automation actions.
- Each log entry includes: Timestamp, actor, action, target, result, prompt details (if AI-generated).

Acceptance criteria:
- Log entries are visible and filterable.
- Prompt details modal is accessible for AI actions.

---

## 🔹 Step 63 — Deterministic UI Flows for All Admin Actions

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Ensure every admin action in Engine Hub tabs produces deterministic, traceable UI feedback (toast, banner, modal, etc.).
- No dead triggers; every control produces a visible outcome.

Acceptance criteria:
- All admin actions are traceable in UI.
- No control is a no-op.

---

## 🔹 Step 64 — Advanced Review Queue Controls

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add advanced controls to Drafts & Reviews tab: bulk review, assign reviewer, confidence threshold (UI-only).
- Admin can select multiple drafts and apply actions.

Acceptance criteria:
- Bulk actions and assignment are visible and functional in local state.

---

## 🔹 Step 65 — Engine Hub Tab Copy & Help Modals

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add contextual help modals or info copy to each Engine Hub tab explaining its purpose and controls (UI-only).

Acceptance criteria:
- Help/info is accessible from each tab.
- No dead triggers.

---

## 🔹 Step 66 — Admin-Only AI/Automation Test Harness

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Add a UI-only test harness in Engine Hub → Master Control tab for admins to simulate AI/automation actions (generate draft, run review, etc.).
- All actions produce deterministic feedback and update local state.

Acceptance criteria:
- Test harness is visible and functional in local state.

---

## 🔹 Step 67 — Final AI/Automation Admin Enhancement Audit

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Task:
- Re-run a completeness audit for all new admin controls in Engine Hub tabs:
  - Model profile management
  - Credential pool
  - Routing table
  - Operational rules
  - Source types
  - Image generation gating
  - Audit log enrichment
  - Advanced review queue
  - Test harness

Acceptance criteria:
- All controls are surfaced, deterministic, and traceable in UI.
- No dead triggers remain.

---

# ✅ PHASE 3 — FRONTEND POLISH (PROMPTS FROM PROTOTYPE AUDIT) (Steps 68–70)

## 🔹 Step 68 — Replace Browser-Native `alert()` (Admin Editor Preview Guard)

### AI BUILD PROMPT (copy/paste)

This is Step 68 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Admin Blog Editor footer, clicking “Preview” while creating a new post that has not been saved yet.

Task:
- Remove any browser-native `alert()` usage from the preview guard.
- Replace it with a deterministic in-app UX pattern.

Requirements:
- Preferred: disable the Preview button until the post has a saved ID.
  - Use `disabled` + `aria-disabled`.
  - Provide a tooltip/title like “Save draft to enable preview (demo)”.
- Acceptable alternative: allow click but show an in-app toast/banner (NOT `alert`) saying “Save draft to enable preview (demo)”.

Acceptance criteria:
- No `alert()` is used.
- User gets deterministic feedback and a clear next action.

Stop after:
- Preview gating UX only.

---

## 🔹 Step 69 — Replace Browser-Native `confirm()` (Folder Delete)

### AI BUILD PROMPT (copy/paste)

This is Step 69 in the BLOG frontend flow.

Context:
- You are a SaaS admin UI/UX engineer.
- Scope: UI only.

Trigger:
- In Folder Tree (Media or Posts), clicking “Delete folder”.

Task:
- Remove any browser-native `confirm()` usage.
- Replace it with the existing in-app destructive confirmation modal pattern.

Requirements:
- Use the app’s confirmation modal component/pattern.
- Confirmation copy must be explicit and match the intent:
  - Title: “Delete folder?”
  - Message: “Items inside will be moved to root.”
  - Destructive confirm label: “Delete folder”
- After confirm, perform the existing UI-only delete behavior.

Acceptance criteria:
- No `confirm()` is used.
- Folder deletion remains deterministic and consistent with other destructive actions.

Stop after:
- Folder delete confirmation UX only.

---

## 🔹 Step 70 — Remove/Guard Debug Console Output in User Flows

### AI BUILD PROMPT (copy/paste)

This is Step 70 in the BLOG frontend flow.

Context:
- You are a SaaS frontend UI/UX engineer.
- Scope: UI only.

Trigger:
- Any normal navigation through public or admin blog surfaces.

Task:
- Remove or guard debug `console.log()` calls in user-facing flows.

Requirements:
- Default: remove `console.log()` statements related to routing and button clicks.
- If you must keep logs for development, gate them behind a single boolean (e.g., `const DEBUG = false`) so production behavior is silent.

Acceptance criteria:
- No debug console spam occurs during standard flows.

Stop after:
- Debug logging cleanup only.

---

