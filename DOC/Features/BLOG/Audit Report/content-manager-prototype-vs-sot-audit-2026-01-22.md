# Prototype vs SOT Audit — BLOG (Content Manager)

## 1. Audit Metadata
- **Feature/Module Audited:** BLOG (Admin) — Content Manager (Posts/Categories/Tags)
- **Prototype/Implementation Reference:** `DOC/Features/BLOG/GoogleAIStudio UI UX/solarmatch-blog/`
- **Initial Plan Reference:**
  - `DOC/Features/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
  - `DOC/Features/BLOG/tasks.md`
- **SOT Reference(s):**
  - `DOC/Features/BLOG/SOT/FEATURE-SOT.md`
  - `DOC/Features/BLOG/SOT/Frontend-Plan.md`
  - `DOC/Features/BLOG/SOT/IMPLEMENTATION-PLAN.md`
  - `DOC/Features/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- **Audit Date:** 2026-01-22
- **Auditor:** GitHub Copilot (GPT-5.2)

---

## 2. Audit Scope

### What was audited

**Prototype surfaces (source-of-truth for mirroring):**
- Content Manager hub/tabs (Posts/Categories/Tags):
  - `DOC/Features/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/BlogEngine.tsx`
  - `DOC/Features/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminPostList.tsx`
  - `DOC/Features/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminCategoryList.tsx`
  - `DOC/Features/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminTagList.tsx`
- Prototype modals used by Posts:
  - `DOC/Features/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/ConfirmationModal.tsx`
  - `DOC/Features/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/BulkTagModal.tsx`

**Current Next.js implementation (actual SOT code):**
- Route + hub:
  - `src/app/admin/blog/content-manager/page.tsx`
  - `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
- Tabs:
  - Posts: `src/components/admin/blog/content-manager/PostList.tsx`
  - Categories: `src/components/admin/blog/content-manager/CategoryList.tsx`
  - Tags: `src/components/admin/blog/content-manager/TagList.tsx`
- Shared components used:
  - `src/components/admin/blog/shared/ConfirmationModal.tsx`
  - `src/components/admin/blog/shared/ManageTaxonomyModal.tsx`
  - `src/components/admin/blog/shared/SkeletonAdminTable.tsx`
- Data API client used by SOT:
  - `src/lib/blog/adminApiClient.ts`

### What was NOT audited
- Media Library and its modals (explicitly out of scope for this report).
- Editor / Preview / Authors / Comments / Blog Engine automation screens.
- Backend correctness beyond the endpoints already called by the current UI.

---

## 3. Methodology

### 3.1 Prototype-first comprehensive audit
- Enumerated *all* visible/interactive controls in the prototype Content Manager surfaces:
  - Top nav tabs
  - Search, status filters, view mode toggles
  - View-options menus (columns/board fields)
  - Row actions + overflow menus
  - Bulk selection flows
  - Trash flows (restore/permanent delete)
  - Inline-edit triggers
  - Drag-and-drop status changes (board)
  - Toasts / feedback surfaces
- Enumerated modal surfaces and verified their open/close triggers.

### 3.2 SOT/Plan comparison (secondary)
- Mapped each prototype control → current Next.js equivalent.
- Logged gaps where the Next.js UI:
  - is missing a control entirely
  - has a control but it is not wired
  - has the control but differs in layout/styling/token usage

---

## 4. Audit Findings

### 4.1 What Matches (Fully Aligned)

**Content Manager Hub (partial):**
- The hub route exists and renders a tabbed surface:
  - `src/app/admin/blog/content-manager/page.tsx` → `ContentManagerHub`
- Tabs exist for Posts / Categories / Tags.

**Categories + Tags (mostly aligned):**
- Add/Edit modal flows exist via `ManageTaxonomyModal`.
- Delete confirmation exists via `ConfirmationModal`.
- Loading/error/empty states exist.

### 4.2 Gaps & Issues (Missing or Not Accurate)

#### A) Hub/Header parity

1) **Tab active styling + accent tokens mismatch**
- **Location/Step:** `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
- **Expected (prototype):** Solar accent tokens (`text-solar-*`, `border-solar-*`), underline active tab behavior.
- **Actual (SOT):** Uses `orange-*` tokens and different active styles.
- **Impact:** Not pixel-perfect; breaks brand token parity.
- **Suggested Fix:** Replace orange accents with solar accents to match prototype.

2) **Tab routing persistence mismatch (if required by prototype parity)**
- **Location/Step:** Prototype uses hash routing via `BlogEngine.tsx` and passes route into `AdminPostList`.
- **Expected:** URL reflects trash route and can control behavior on reload.
- **Actual:** Hub uses local state only; reload resets tab and there’s no tab-specific URL.
- **Impact:** Behavioral mismatch (deep link / refresh parity).
- **Suggested Fix:** If strict parity is required: implement query-param or nested routes; otherwise document as intentional deviation.

#### B) Posts parity (`AdminPostList.tsx` vs `PostList.tsx`)

1) **Trash workflow missing (major)**
- **Location/Step:** Prototype: `AdminPostList.tsx` supports a `deleted` mode (trash list) with restore + permanent delete.
- **Expected:**
  - Switch to Trash view
  - Per-row restore
  - Per-row permanent delete
  - Confirm modals for each action
- **Actual:** SOT has only a single “Delete Post?” modal and calls `deleteAdminBlogPost` (hard delete).
- **Impact:** Prototype parity broken; management workflow incomplete.
- **Suggested Fix:** Implement trash-mode UI + restore/permanent delete flows. If backend lacks soft-delete, use a safe UI-only overlay (e.g., localStorage-based trash) until backend is ready.

2) **Bulk actions missing (major)**
- **Location/Step:** Prototype includes bulk actions:
  - Bulk move to trash / bulk delete forever
  - Bulk restore
  - Bulk assign tags (via `BulkTagModal.tsx`)
  - Bulk publish / bulk archive
- **Expected:** A bulk action bar appears when selection is non-empty, with modals/confirmations.
- **Actual:** SOT tracks selection but provides no bulk-action UI, no bulk modals, and no tag modal.
- **Impact:** Missing core prototype behaviors.
- **Suggested Fix:** Add bulk action bar + implement `BulkTagModal` + confirm modals and wire to safe stubs / existing endpoints.

3) **View mode toggle exists but is not wired**
- **Location/Step:** `src/components/admin/blog/content-manager/PostList.tsx` viewMode toggle.
- **Expected:** Prototype supports list + board views, with board columns by status.
- **Actual:** Toggle renders but there is no board UI (file ends with only list table rendering).
- **Impact:** “Dead control” → breaks audit rule (unfinished trigger).
- **Suggested Fix:** Implement board UI (status columns) and render based on viewMode.

4) **View options & persistence missing**
- **Expected:** Prototype supports:
  - view mode persistence (`adminPostViewMode`)
  - visible columns set (`adminPostVisibleColumns`)
  - visible board fields set (`adminPostVisibleBoardFields`)
  - a view-options popover UI to control these
- **Actual:** None of the above exists in SOT.
- **Impact:** Not pixel-perfect; significant functionality gap.
- **Suggested Fix:** Implement view options popover + localStorage persistence.

5) **Inline editing parity missing**
- **Expected:** Prototype supports clicking into cells (title, tags, etc.) for inline editing with save/cancel.
- **Actual:** SOT has no inline edit behavior.
- **Impact:** Major workflow gap.
- **Suggested Fix:** Add inline edit state machine and wire saves to `updateAdminBlogPost` (where safe).

6) **Drag-and-drop status changes missing**
- **Expected:** Prototype supports drag-and-drop in board view to change post status.
- **Actual:** No board view; no drag/drop.
- **Impact:** Parity gap.
- **Suggested Fix:** Implement drag/drop (HTML5 DnD) for board columns and call `updateAdminBlogPost` with new status.

7) **Row actions + “More” menus not mirrored**
- **Expected:** Prototype includes richer row actions and overflow menus.
- **Actual:** SOT includes only Edit / Preview / Delete icons.
- **Impact:** Visual + functional mismatch.
- **Suggested Fix:** Mirror action layout and add overflow menu behavior.

8) **Selection UX mismatch**
- **Expected:** Prototype uses row highlight + solar-accent checkbox styling + indeterminate header checkbox behavior.
- **Actual:** Indeterminate logic exists, but styling is `orange-*` and row highlight/selection visuals differ.
- **Impact:** Not pixel-perfect.
- **Suggested Fix:** Mirror selection visuals and token usage.

#### C) Categories parity (`AdminCategoryList.tsx` vs `CategoryList.tsx`)

1) **Accent token mismatch**
- **Expected:** solar accents.
- **Actual:** orange accents.
- **Impact:** Not pixel-perfect.
- **Suggested Fix:** Replace orange accents with solar accents.

2) **Non-tabbed header variant not implemented**
- **Expected:** Prototype supports a standalone page header with back button when not in tabbed mode.
- **Actual:** SOT component has `isTabbed` but does not implement the non-tabbed header variant.
- **Impact:** Potential parity gap if standalone category routes are expected.
- **Suggested Fix:** Implement header variant or explicitly declare categories/tags are hub-only.

#### D) Tags parity (`AdminTagList.tsx` vs `TagList.tsx`)

1) **Accent token mismatch**
- **Expected:** solar accents.
- **Actual:** orange accents.
- **Impact:** Not pixel-perfect.
- **Suggested Fix:** Replace orange accents with solar accents.

2) **Non-tabbed header variant not implemented**
- Same as Categories.

---

## 5. Enhancement Plan (If Gaps Found)

### Phase CM-A — Visual/token parity (fast, unblock pixel-perfect pass)
1) Replace orange accents with solar accents across Content Manager hub + tabs.
2) Replace orange focus/checkbox styling in Posts/Categories/Tags.

### Phase CM-B — Posts management-surface parity (major)
1) Implement board view UI and wire the view toggle.
2) Implement view-options popover + localStorage persistence.
3) Implement bulk action bar + BulkTagModal.
4) Implement trash workflow parity (trash view + restore + permanent delete).
5) Implement inline editing parity.
6) Implement drag-and-drop status changes.

---

## 6. Green Signal
Not green. Posts parity is substantially incomplete (missing wiring + modals + board view + trash/bulk/inline edit features).

---

## 7. Audit Log & Traceability
- **Files Updated:** None (audit report only).
- **Next Steps:**
  1) Add a new phase to `DOC/Features/BLOG/tasks.md` for Content Manager audit-gap closure (more granular than existing items).
  2) Start implementing Phase CM-A immediately (token parity), then Phase CM-B incrementally.
