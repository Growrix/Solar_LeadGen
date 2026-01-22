# BLOG — Prototype → Next.js Migration Plan (Admin: Content Manager, Media Library)

**Status**: Draft (Plan)
**Created At**: 2026-01-22

Purpose: migrate the Google AI Studio (Vite) prototype UI into the existing Next.js admin dashboard **pixel-perfect and prototype-preserving** (structure + visuals + triggers/flows + modals), without creating duplicate files when partial Next.js structure already exists.

---

## 0) Inputs / Authority (Must Follow)

### Repo authorities
- Global workflow index: `DOC/GUIDELINES & SOT/README.md`
- Pixel-perfect migration policy (authoritative for this run): `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/PROTOTYPE-TO-NEXTJS-PIXEL-PERFECT-MIGRATION.md`
- Layout/routing standards (for Next.js embedding into admin dashboard): `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

### BLOG feature authorities
- Baseline audit: `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`

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

### Out of scope (explicit)
- Migrating the prototype’s **Blog Engine Hub / AI engine** (`BlogEngineHub.tsx`, automation tabs, etc.)
- Changing existing blog CRUD routes/pages behavior (`/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]`, taxonomy pages)
- Semantic-tokenization / multi-theme design-system adaptation (optional follow-up only, not part of this run)
- Comments UI + any comments backend work
- Backend build-out for Media Library (can be planned, but not required for the UI migration deliverable unless explicitly approved)

### Baseline contract
- Existing admin UI will **NOT** be lost.
- These new pages are added to the existing admin dashboard navigation (sidebar + mobile menu) without removing current Blog menu items.

---

## 2) Non‑Negotiable Migration Constraints

### 2.1 Pixel-perfect mirroring (no drift)
Follow: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/PROTOTYPE-TO-NEXTJS-PIXEL-PERFECT-MIGRATION.md`

- Preserve UI composition, layout, labels, and flows from the prototype.
- Preserve all triggers, navigation within the page, and modal open/close behavior.
- Hardcoded styles and custom classes are allowed and expected to match the prototype.

### 2.2 Reuse-first (no duplicate files)
- Before creating any new page/component file, audit the existing Next.js admin blog structure.
- Prefer reusing/extending existing route files and components instead of creating duplicates.

### 2.3 Next.js embedding constraints
- The pages must live under the existing admin dashboard and follow the admin shell routing patterns.
- Minimal wrapper/layout changes are allowed only when required to embed the pixel-perfect UI into the existing admin chrome.

---

## 3) Target Routes (Next.js App Router)

Pages first (per workflow):

### 3.1 Content Manager
- Route: `/admin/blog/content-manager`
- Goal: provide a **single hub** with tabs (Posts / Categories / Tags), matching prototype.

### 3.2 Media Library
- Route: `/admin/blog/media`
- Goal: provide the prototype media management UI (library + trash + folders + bulk actions).

---

## 4) File / Component Map (Mirror Prototype Boundaries)

### 4.1 Suggested Next.js file layout
- Page routes:
  - `src/app/admin/blog/content-manager/page.tsx`
  - `src/app/admin/blog/media/page.tsx`

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

### 4.3 Existing Next.js files already present (reuse/extend; do not duplicate)
These files already exist and should be modified/reused as the migration targets:

- Routes:
  - `src/app/admin/blog/content-manager/page.tsx`
  - `src/app/admin/blog/media/page.tsx`
- Components:
  - `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
  - `src/components/admin/blog/content-manager/PostList.tsx`
  - `src/components/admin/blog/content-manager/CategoryList.tsx`
  - `src/components/admin/blog/content-manager/TagList.tsx`
  - `src/components/admin/blog/media/MediaLibrary.tsx`

### 4.2 Navigation integration
- Sidebar: `src/components/AdminSidebar.tsx`
- Mobile sidebar: `src/components/AdminMobileSidebarMenu.tsx`

Add new Blog submenu items:
- Content Manager → `/admin/blog/content-manager`
- Media Library → `/admin/blog/media`

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

### 5.2 Media Library (prototype behavior first; backend optional follow-up)
The prototype uses an in-memory store/context. In this repo, Media Library likely needs storage + API.

Plan for this run:
- Mirror the Media Library UI and behaviors first (folders, filters, selection, modals, trash/restore/permanent delete), using stubbed data if necessary.
- If the backend is not connected yet, keep the UI pixel-perfect and use safe placeholders; do not redesign.

Follow-up (separate approval):
- Add a real storage model + upload/list/delete endpoints and replace stubs.

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

---

## 7) Verification / Acceptance Criteria

For each migrated page (and its full component tree):
- UI matches the prototype pixel-for-pixel (layout, spacing, typography, colors, shadows).
- Behavior matches the prototype (tabs, actions, selection, and all modals open/close flows).
- No duplicate/parallel implementations are introduced when an existing Next.js file already exists.
- Responsive behavior matches the prototype.

Build gates:
- `npx tsc --noEmit`
- `npm run build`

---

## 8) Notes / Risk Management

- Keep the hub pages thin; mirror the prototype component boundaries for maintainability.
- Avoid replacing existing blog pages/routes in this run to prevent churn.
- Media + Comments backend integration should be treated as separate follow-up work (explicit approval) to avoid scope creep.
