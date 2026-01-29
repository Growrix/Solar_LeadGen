# BLOG — Prototype → Next.js Migration Plan (Admin: Content Manager)

**Status**: Draft (Plan)
**Created At**: 2026-01-22

Purpose: migrate the Google AI Studio (Vite) prototype **Content Manager** UI into the existing Next.js admin dashboard **pixel-perfect and prototype-preserving** (structure + visuals + triggers/flows + modals), without creating duplicate files when partial Next.js structure already exists.

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

### In scope (only these admin pages/flows)
1) **Content Manager** (prototype “Blog Manager” / content management surface), including all prototype tabs and subflows:
  - Posts
  - Categories
  - Tags
  - Comments
  - Authors
  - New/Edit post editor
  - Preview
  - Posts Trash surface + restore/permanent delete

### Out of scope (explicit)
- Migrating the prototype’s **Blog Engine Hub / AI engine** (`BlogEngineHub.tsx`, automation tabs, etc.)
- Semantic-tokenization / multi-theme design-system adaptation (optional follow-up only, not part of this run)
- Media Library
- Backend build-out for Comments/Authors (UI parity can use safe stubs where no backend exists)

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

### 3.1 Content Manager Hub
- Route: `/admin/blog/content-manager`
- Goal: provide a **single hub** with tabs matching prototype: Posts / Categories / Tags / Comments / Authors.

### 3.2 Editor + Preview (prototype flows required by Content Manager)
- Route: `/admin/blog/new`
- Route: `/admin/blog/[id]`
- Route: `/admin/blog/[id]/preview`

Goal: mirror prototype editor tabs/modals and preview flow.

---

## 4) File / Component Map (Mirror Prototype Boundaries)

### 4.1 Suggested Next.js file layout

- Page routes:
  - `src/app/admin/blog/content-manager/page.tsx`
  - `src/app/admin/blog/new/page.tsx`
  - `src/app/admin/blog/[id]/page.tsx`
  - `src/app/admin/blog/[id]/preview/page.tsx`

- Content Manager components (mirroring prototype):
  - `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
  - `src/components/admin/blog/content-manager/PostList.tsx`
  - `src/components/admin/blog/content-manager/CategoryList.tsx`
  - `src/components/admin/blog/content-manager/TagList.tsx`
  - `src/components/admin/blog/content-manager/CommentsList.tsx` (new)
  - `src/components/admin/blog/content-manager/AuthorList.tsx` (new)

- Editor/Preview components (mirroring prototype):
  - `src/components/admin/blog/content-manager/editor/*` (new)
  - `src/components/admin/blog/content-manager/preview/*` (new)

### 4.3 Existing Next.js files already present (reuse/extend; do not duplicate)
These files already exist and should be modified/reused as the migration targets:

- Routes:
  - `src/app/admin/blog/content-manager/page.tsx`

- Components:
  - `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
  - `src/components/admin/blog/content-manager/PostList.tsx`
  - `src/components/admin/blog/content-manager/CategoryList.tsx`
  - `src/components/admin/blog/content-manager/TagList.tsx`

### 4.2 Navigation integration
- Sidebar: `src/components/AdminSidebar.tsx`
- Mobile sidebar: `src/components/AdminMobileSidebarMenu.tsx`

Add new Blog submenu items:
- Content Manager → `/admin/blog/content-manager`
- Media Library → `/admin/blog/media`

---

## 5) Data Wiring Strategy (Practical + Low Chaos)

### 5.1 Content Manager (Posts/Categories/Tags wire to real APIs now)
This repo already has Blog admin APIs and Prisma models:
- Posts: `/api/admin/blog/posts`
- Categories: `/api/admin/blog/categories`
- Tags: `/api/admin/blog/tags`

Plan:
- During structural mirror, wire these lists + basic CRUD actions to the existing endpoints.
- Keep this page additive: it does not replace the existing `/admin/blog` pages unless explicitly approved later.

### 5.2 Comments/Authors (prototype behavior first; backend optional follow-up)
The prototype uses an in-memory store/context for Comments and Authors.

Plan for this run:
- Mirror Comments and Authors UI and behaviors using safe stubs if no backend exists.
- Keep the UI pixel-perfect and do not redesign.

Follow-up (separate approval):
- Add real persistence + admin APIs for comments/authors and replace stubs.

---

## 6) Modals / Confirmations (After Pages)

Migrate only the modals used by the in-scope pages, mirroring prototype:

### 6.1 Content Manager (Posts)
- Confirm move-to-trash
- Confirm restore
- Confirm permanent delete
- Bulk Tag modal

### 6.2 Content Manager (Comments/Authors)
- Moderate Comment modal
- Bulk Moderate modal
- Author manage modal
- Author preview modal
- Confirmation modals for destructive actions

---

## 6.3 Remaining Gaps (Prototype-first audit — 2026-01-22)

Authoritative gap list: `DOC/FEATURES/BLOG/Audit Report/content-manager-prototype-first-audit-2026-01-22.md`

### Content Manager — Posts
- Add the prototype **stats cards** row (Total / Published / Scheduled / In Review / Drafts)
- Restructure the control row to match prototype (status tabs shown only in list view; search placement; button labels)
- Align **View Options** with prototype:
  - List columns: status / category / author / date
  - Board fields: coverImage / category / author / date / excerpt / tags
- Add missing prototype surfaces:
  - `Needs Review` lane and status filter
  - Inline status edit in list view (double-click status pill)
  - Missing metadata issues tooltip (cover image / excerpt / category)
  - Pagination placeholder footer

### Documentation hygiene
- Reconcile `DOC/FEATURES/BLOG/tasks.md` to reflect remaining work; do not mark done until verified.

---

## 6.4 Status Model Strategy (Prototype vs Backend)

### Problem
The prototype uses a `needs_review` state. The current backend admin status union used by the Next.js admin client is:
`DRAFT | SCHEDULED | PUBLISHED | ARCHIVED`.

### Plan (prototype-preserving, low-risk)
- Implement `needs_review` as a **UI-only overlay state** stored client-side (e.g., localStorage set of postIds).
- Use this overlay in:
  - Stats card counts (“In Review”)
  - Status filter tab (“Needs Review”)
  - Board column (“Needs Review”)
  - Inline status edit dropdown
- Continue to use real backend statuses for all other transitions.

This preserves prototype flows without changing backend contracts.

---

## 7) Verification / Acceptance Criteria

For each migrated page (and its full component tree):
- UI matches the prototype pixel-for-pixel (layout, spacing, typography, colors, shadows) within the page content area.
- Behavior matches the prototype (tabs, actions, selection, modals open/close flows).
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
