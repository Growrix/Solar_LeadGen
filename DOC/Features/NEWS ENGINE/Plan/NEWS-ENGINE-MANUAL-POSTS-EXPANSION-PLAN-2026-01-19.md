# News Engine — Manual Post Creation Expansion Plan (Create News)

Date: 2026-01-19

## Purpose
Add a complete **manual** News creation and lifecycle flow (draft → schedule → publish → edit → unpublish → delete) that reuses the existing News Engine pipeline + storage, without breaking AI automation.

This plan is grounded in current repo state.

---

## Current State (Repo Reality)

### Admin UI (existing)
- Admin hub route: [src/app/admin/news-engine/page.tsx](../../../src/app/admin/news-engine/page.tsx)
- Main controller: [src/components/news-engine/AdminNewsEngineHub.tsx](../../../src/components/news-engine/AdminNewsEngineHub.tsx)
- Draft board tab contains a “Create Manual Draft” action which currently opens an AI generation modal:
  - Tab: [src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx](../../../src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx)
  - Modal: [src/components/news-engine/v6/modals/ManualDraftModal.tsx](../../../src/components/news-engine/v6/modals/ManualDraftModal.tsx)
  - Backend: [src/app/api/admin/news-engine/items/generate-manual/route.ts](../../../src/app/api/admin/news-engine/items/generate-manual/route.ts)

### Rich formatting editor (already implemented)
- TipTap-based HTML editor exists and supports: H1/H2/H3, bullet/numbered lists, bold, italic, links (+ preview/raw HTML):
  - [src/components/news-engine/v6/components/RichHtmlEditor.tsx](../../../src/components/news-engine/v6/components/RichHtmlEditor.tsx)

### Review/Edit modal (already supports editing + rich HTML)
- Review modal loads editable fields including `contentHtml` and uses `RichHtmlEditor`:
  - [src/components/news-engine/v6/modals/ReviewModal.tsx](../../../src/components/news-engine/v6/modals/ReviewModal.tsx)

### Backend/API (existing)
- Admin CRUD for items:
  - List + create: [src/app/api/admin/news-engine/items/route.ts](../../../src/app/api/admin/news-engine/items/route.ts)
  - Get/update/delete: [src/app/api/admin/news-engine/items/[id]/route.ts](../../../src/app/api/admin/news-engine/items/[id]/route.ts)
  - Publish now: [src/app/api/admin/news-engine/items/[id]/publish-now/route.ts](../../../src/app/api/admin/news-engine/items/[id]/publish-now/route.ts)
  - Schedule: [src/app/api/admin/news-engine/items/[id]/schedule/route.ts](../../../src/app/api/admin/news-engine/items/[id]/schedule/route.ts)
  - Delete vs purge: [src/app/api/admin/news-engine/items/[id]/purge/route.ts](../../../src/app/api/admin/news-engine/items/[id]/purge/route.ts)

### Public rendering supports rich HTML
- Detail page renders stored HTML via `dangerouslySetInnerHTML` inside `prose`:
  - [src/app/news/[slug]/NewsDetailClient.tsx](../../../src/app/news/[slug]/NewsDetailClient.tsx)

### Data model (existing)
- Prisma already contains News Engine models/enums such as `NewsItemStatus`, and `NewsItem` includes `contentHtml`, `tags`, `ogImageUrl`, scheduling fields, and `sourceType`:
  - [prisma/schema.prisma](../../../prisma/schema.prisma)

---

## What’s Missing (Gap to Close)

1. **True manual creation UI**
   - Today “Manual Draft” is an AI draft generation flow.
   - Need a dedicated **Create News** flow where the admin manually writes title/body (rich formatting) and chooses Draft/Schedule/Publish.

2. **Unpublish workflow**
   - Requirement: “published posts should be unpublishable”.
   - Current system supports publish/schedule/reject/delete, but does not have a dedicated unpublish action (and status transitions may not clear `publishedAt`/`scheduledFor` safely).

3. **Clear separation of AI vs Manual actions**
   - Both must coexist without confusing operators.
   - “Create News” (manual) should not be conflated with “Generate AI Draft”.

---

## Requirements (User Ask → Concrete Acceptance)

### Admin — Manual Create + Lifecycle
- Add a **Create News** button.
- Clicking opens a **Create Post modal**.
- Admin can:
  - Create a Draft (manual).
  - Schedule publishing.
  - Publish now.
  - Remove draft / delete.
  - Re-edit published posts.
  - Unpublish a published post.

### Rich formatting
- Manual editor supports headings, bullet points, bold, italic, links.
- Content is stored as HTML and renders correctly on public pages.

### Coexistence
- AI pipeline continues to generate AI drafts/items.
- Manual posts do not break automation (no unintended overwrites).

---

## Proposed UX Design (Admin)

### 1) Buttons (top-level)
In the header area of the News Engine Admin UI:
- Primary: **Create News** (manual)
- Secondary: **Generate AI Draft** (existing flow; current “Create Manual Draft” renamed for clarity)

Files to update:
- [src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx](../../../src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx)
- Optionally also add to Dashboard tab header:
  - [src/components/news-engine/v6/tabs/DashboardTab.tsx](../../../src/components/news-engine/v6/tabs/DashboardTab.tsx)

### 2) Create News Modal (new)
Create a new modal that allows manual entry:
- Title (required)
- Summary (optional; can auto-derive but manual-editable)
- Category
- Tags
- Body (rich editor via `RichHtmlEditor`)
- SEO fields (optional): `seoTitle`, `seoDescription`
- OG Image (optional; can be handled later in Review Modal)

Primary actions in modal:
- **Save Draft** (creates item with `status=DRAFT`, `sourceType=MANUAL_ENTRY`)
- **Save & Publish** (create draft → publish-now)
- **Save & Schedule** (create draft → schedule)

Notes:
- After creating, auto-open the existing Review Modal for fine-tuning (image controls, approval, history, etc.).

New file (recommended):
- `src/components/news-engine/v6/modals/CreateNewsModal.tsx`

Wiring location:
- [src/components/news-engine/AdminNewsEngineHub.tsx](../../../src/components/news-engine/AdminNewsEngineHub.tsx)

---

## Proposed Backend Changes

### A) Reuse existing create endpoint where possible
The repo already supports manual create via:
- POST [src/app/api/admin/news-engine/items/route.ts](../../../src/app/api/admin/news-engine/items/route.ts)

For manual Create News, we will call POST `/api/admin/news-engine/items` with:
- `sourceType=MANUAL_ENTRY`
- `status=DRAFT`
- `title`, `summary`, `contentHtml`, `category`, `tags`, SEO fields

### B) Add an explicit Unpublish endpoint (recommended)
Add:
- `POST /api/admin/news-engine/items/[id]/unpublish`

Behavior:
- Only admin.
- Sets:
  - `status = DRAFT`
  - `publishedAt = null`
  - `scheduledFor = null`
  - (optional) keep `slug` stable (recommended) so links can be reused after republish.
- Writes audit log action `news_item_unpublished`.

New file:
- `src/app/api/admin/news-engine/items/[id]/unpublish/route.ts`

Client wrapper:
- Add `adminUnpublishItem(id)` to [src/lib/news-engine/client.ts](../../../src/lib/news-engine/client.ts)

### C) Publish-time validation (manual)
Ensure publishing enforces minimum content quality:
- If `contentHtml` is empty or extremely short, block publish with a 400 error.
- This validation should apply to both AI-generated and manual drafts (safe guard).

Where to enforce:
- Publish-now route: `src/app/api/admin/news-engine/items/[id]/publish-now/route.ts`

---

## Data Model Notes
No schema change is required for the manual workflow because:
- `NewsItem.contentHtml` already exists.
- `sourceType` supports `MANUAL_ENTRY` (already used).
- Status enum includes `DRAFT`, `PUBLISHED`, `SCHEDULED`.

---

## AI + Manual Coexistence Rules (Operational)

1. Automation must never mutate manual items unintentionally.
   - Draft generation should create new items; it should not “update existing” manual items unless explicitly requested.
   - If any automation code selects items by status, confirm it does not target `sourceType=MANUAL_ENTRY` for regeneration.

2. Manual posts use the same publish/schedule pipelines.
   - Public APIs already read only `PUBLISHED` items.

---

## Recommendations (Keep It Simple)
- Keep the UI labels explicit:
  - **Create News** = manual writing
  - **Generate AI Draft** = AI generation (existing flow)
- After Create News actions (Draft/Publish/Schedule), auto-open the existing Review Modal to reuse SEO + OG image + approval controls for both manual + automatic posts.
- Keep **Unpublish** as a dedicated action (published → draft) that preserves `slug` and clears `publishedAt` + `scheduledFor`.
- Add light publish-time validation server-side (block publish if body is effectively empty/too short) to protect both AI + manual flows.

---

## Implementation Checklist (Step-by-step)

### Step 1 — Add Create News UI
- Add new modal state + open handler in [src/components/news-engine/AdminNewsEngineHub.tsx](../../../src/components/news-engine/AdminNewsEngineHub.tsx)
- Update Drafts tab header button labels:
  - Rename “Create Manual Draft” → “Generate AI Draft”
  - Add “Create News” button for manual create

### Step 2 — Create CreateNewsModal
- New modal file using existing `RichHtmlEditor`.
- Wire actions:
  - Save Draft → `adminCreateItem`
  - Save & Publish → create + `adminPublishNow`
  - Save & Schedule → create + `adminSchedule`

### Step 3 — Unpublish endpoint
- Create route handler `items/[id]/unpublish`.
- Add client wrapper and a Review Modal button “Unpublish” visible only when item is `PUBLISHED`.

### Step 4 — Verify public rendering
- Confirm headings/lists/links render on:
  - `/news`
  - `/news/[slug]`

### Step 5 — Audit + regression checks
- Ensure AI automation still works and manual items remain stable.
- Ensure audit logs capture manual create/publish/unpublish.

---

## Acceptance Criteria
- Admin can create a manual post via **Create News** and publish it.
- Manual post content shows headings/lists/bold/italic/links on public detail page.
- Admin can edit a published post, save changes, and see changes reflected publicly.
- Admin can unpublish a post; it disappears from public pages.
- AI automation continues to generate AI content without impacting manual items.

---

## Open Decisions (Need confirmation)
1. When unpublishing, should the slug remain reserved (recommended) or be cleared?
# Answer: as per recommended, reserved. 
2. Should publishing require OG image approval for manual posts, or follow the same “require approval” toggle used in Review Modal?
# Answer: I want to use the review modal as it has SEO, Image and other control and more options. All the Automatic and Manual posts can be reviewed there. For the Manual creating post vs the Automatic post creation, the review modal is the same and most of the porcess is the same. just the creation is different. 
3. Should “Create News” allow creating directly into `NEEDS_REVIEW` vs `DRAFT`?
# Answer: Follow the existing pattern of creating as DRAFT first, then publishing or scheduling. 

***Note*** : This plan assumes familiarity with the existing News Engine codebase and workflows. Adjustments may be needed based on implementation details discovered during development. Just need to create a new modal for Create News and wire up the existing endpoints mostly. So, do not over-engineer it. Keep it simple and effective. 