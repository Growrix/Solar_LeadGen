# BLOG — Prototype → Next.js Migration Plan (Admin: Content Manager, Media Library, Comments)

**Status**: Draft (Plan)
**Created At**: 2026-01-20

Purpose: migrate the Google AI Studio prototype UI into the existing Next.js admin dashboard **prototype-preserving**, using the repo’s semantic token design system.

---

## 0) Inputs / Authority (Must Follow)

### Repo authorities
- Global workflow index: `DOC/GUIDELINES & SOT/README.md`
- Prototype workflow: `DOC/GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md`
- Option A playbook: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/PROTOTYPE-TO-NEXTJS-OPTION-A-PLAYBOOK.md`
- Design tokens + hardcoded bans: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md`
- Layout/routing standards: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

### BLOG feature authorities
- Baseline audit: `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- Visual contract: `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md`

### Prototype (UI SOT)
- Prototype export root: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/`
- Admin prototype surfaces:
  - Content lists hub: `components/admin/BlogEngine.tsx`
  - Posts list: `components/admin/AdminPostList.tsx`
  - Categories list: `components/admin/AdminCategoryList.tsx`
  - Tags list: `components/admin/AdminTagList.tsx`
  - Media library: `components/admin/AdminMediaLibrary.tsx`
  - Comments list: `components/admin/AdminCommentsList.tsx`

---

## 1) Scope Lock (This Run)

### In scope (only these admin pages)
1) **Content Manager** (prototype “Blog Engine” tabbed lists)
2) **Media Library**
3) **Comments**

### Out of scope (explicit)
- Migrating the prototype’s **Blog Engine Hub / AI engine** (`BlogEngineHub.tsx`, automation tabs, etc.)
- Changing existing blog CRUD routes/pages behavior (`/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]`, taxonomy pages)
- Adding new design tokens or hardcoded colors
- Backend build-out for Media/Comments (can be planned, but not required for the UI migration deliverable unless explicitly approved)

### Baseline contract
- Existing admin UI will **NOT** be lost.
- These new pages are added to the existing admin dashboard navigation (sidebar + mobile menu) without removing current Blog menu items.

---

## 2) Non‑Negotiable Migration Constraints

### 2.1 Prototype-preserving (no drift)
- Preserve UI composition, layout, labels, and flows from the prototype.
- Allowed change during migration:
  - `className` swaps to repo semantic tokens
  - minimal wrapper/layout changes required to embed in Next.js admin chrome

### 2.2 Mandatory 2‑part migration sequence (per Option A)
1) **Structural mirror**: match prototype surfaces + interactions (UI preserved)
2) **Design-system compliance**: remove hardcoded palette classes and pass verification gates

### 2.3 Component tree rule
Migration is not “done” until the **page and all child components** are verified clean.

---

## 3) Target Routes (Next.js App Router)

Pages first (per workflow):

### 3.1 Content Manager
- Route: `/admin/blog/content-manager`
- Goal: provide a **single hub** with tabs (Posts / Categories / Tags), matching prototype.

### 3.2 Media Library
- Route: `/admin/blog/media`
- Goal: provide the prototype media management UI (library + trash + folders + bulk actions).

### 3.3 Comments
- Route: `/admin/blog/comments`
- Goal: provide the prototype comment moderation UI (filters + bulk actions + modals).

---

## 4) File / Component Map (Mirror Prototype Boundaries)

### 4.1 Suggested Next.js file layout
- Page routes:
  - `src/app/admin/blog/content-manager/page.tsx`
  - `src/app/admin/blog/media/page.tsx`
  - `src/app/admin/blog/comments/page.tsx`

- Content Manager components (mirroring prototype):
  - `src/components/admin/blog/content-manager/ContentManagerHub.tsx` (tabs header + routing state)
  - `src/components/admin/blog/content-manager/PostList.tsx`
  - `src/components/admin/blog/content-manager/CategoryList.tsx`
  - `src/components/admin/blog/content-manager/TagList.tsx`
  - `src/components/admin/blog/content-manager/modals/*` (confirmations, bulk actions)

- Media Library components (mirroring prototype):
  - `src/components/admin/blog/media/MediaLibrary.tsx`
  - `src/components/admin/blog/media/FolderTree.tsx`
  - `src/components/admin/blog/media/modals/*` (upload/details/move/bulk-edit/confirm)

- Comments components (mirroring prototype):
  - `src/components/admin/blog/comments/CommentsList.tsx`
  - `src/components/admin/blog/comments/modals/*` (moderate/bulk/confirm)

### 4.2 Navigation integration
- Sidebar: `src/components/AdminSidebar.tsx`
- Mobile sidebar: `src/components/AdminMobileSidebarMenu.tsx`

Add 3 new Blog submenu items:
- Content Manager → `/admin/blog/content-manager`
- Media Library → `/admin/blog/media`
- Comments → `/admin/blog/comments`

---

## 5) Data Wiring Strategy (Practical + Low Chaos)

### 5.1 Content Manager (wire to real APIs now)
This repo already has Blog admin APIs and Prisma models:
- Posts: `/api/admin/blog/posts`
- Categories: `/api/admin/blog/categories`
- Tags: `/api/admin/blog/tags`

Plan:
- During structural mirror, wire these lists + basic CRUD actions to the existing endpoints.
- Keep this page additive: it does not replace the existing `/admin/blog` pages unless explicitly approved later.

### 5.2 Media Library (UI-first; backend optional follow-up)
The prototype assumes an in-memory store. In this repo, Media Library needs storage + API.

Plan for this run:
- Migrate UI with **stubbed data** (UI-only) and clearly label “Backend not connected yet” in an operator-safe way.

Follow-up (separate approval):
- Add a `BlogMediaAsset` model + upload/list/delete endpoints, potentially reusing existing S3 patterns used elsewhere in the repo.

### 5.3 Comments (UI-first; backend optional follow-up)
The repo does not currently have Blog Comment tables/endpoints.

Plan for this run:
- Migrate UI with **stubbed data** (UI-only).

Follow-up (separate approval):
- Add `BlogComment` model + moderation endpoints and connect it to public blog pages (only if approved).

---

## 6) Modals / Confirmations (After Pages)

Migrate only the modals used by the in-scope pages, mirroring prototype:

### 6.1 Content Manager
- Confirm delete/trash
- Bulk actions (tagging / status changes), only if present in the prototype surface you are migrating

### 6.2 Media Library
- Upload modal
- Media details modal
- Move media modal
- Bulk edit media modal
- Confirmations (delete/restore/permanent delete)

### 6.3 Comments
- Moderate comment modal
- Bulk moderate modal
- Confirmations (delete)

---

## 7) Verification / Acceptance Criteria

For each migrated page (and its full component tree):
- Part 1: Structural mirror matches prototype flows (tabs, actions, modals open/close)
- Part 2: Design-system compliance
  - No hardcoded palette classes (`text-gray-*`, `bg-slate-*`, `dark:*`, `bg-white`, `text-black`, `rgb/hex`, etc.)
  - All required verification scans return **0 matches**
  - Dark/Light/Purple themes visually acceptable
  - Responsive checks: 320 / 375 / 768 / 1024 / 1440
  - Keyboard + focus usability

Build gates:
- `npx tsc --noEmit`
- `npm run build`

---

## 8) Notes / Risk Management

- Keep the hub pages thin; mirror the prototype component boundaries for maintainability.
- Avoid replacing existing blog pages/routes in this run to prevent churn.
- Media + Comments backend integration should be treated as separate follow-up work (explicit approval) to avoid scope creep.
