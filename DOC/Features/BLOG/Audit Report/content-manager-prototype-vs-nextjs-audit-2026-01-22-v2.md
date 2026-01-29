---
description: "Prototype-first audit (v2) — Content Manager + Media Library (Admin BLOG)"
---

# BLOG Admin — Prototype vs Next.js Audit (v2)

## 1. Audit Metadata
- **Feature/Module Audited:** BLOG (Admin)
- **Prototype Reference:** `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/*`
- **Implementation Reference (Next.js):**
  - Content Manager: `src/app/admin/blog/content-manager/page.tsx`, `src/components/admin/blog/content-manager/*`
  - Media Library: `src/app/admin/blog/media/page.tsx`, `src/components/admin/blog/media/*`
- **Initial Plan Reference:** `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
- **SOT References:** `DOC/FEATURES/BLOG/SOT/*`, `DOC/FEATURES/BLOG/tasks.md`
- **Audit Date:** 2026-01-22
- **Auditor:** Copilot (GPT-5.2)

## 2. Audit Scope
### What was audited
- Prototype-first UI/UX flows for:
  - Content Manager (Posts/Categories/Tags tabs only)
  - Media Library (Library/Trash, folders, filters, selection, modals)
- Direct comparison to current Next.js implementation.

### What was NOT audited
- Comments/Authors tabs (prototype has them; out of scope for this run)
- Backend feature completeness beyond what’s required to mirror prototype UI behavior

## 3. Methodology
### 3.1 Prototype-first comprehensive audit
- Enumerated prototype surfaces, triggers, modals, and destination states.
- Identified prototype UX that must be mirrored even if backend lacks native support (handled via safe UI overlays).

### 3.2 SOT/plan comparison
- Cross-checked findings vs `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md` and current tasks.

## 4. Audit Findings

## 4.1 What matches (fully aligned)
### Media Library
- Core layout and major modal surfaces exist and are wired:
  - Upload modal, Move modal, Bulk Edit modal, Details modal, Trash/Restore confirmations.
- Folder CRUD exists in UI (safe in-memory behavior is acceptable).
- Drag/drop move-to-folder behavior exists.
- Date filter UI exists.

### Content Manager (Categories/Tags)
- Categories and Tags list UIs exist and are wired to admin APIs.

## 4.2 Gaps & Issues (missing or not accurate)

### A) Content Manager — Posts (High Priority)
**Location:** `src/components/admin/blog/content-manager/PostList.tsx`

1) **Missing Stats Cards row (prototype has 5 cards)**
- **Expected (prototype):** Total Posts / Published / Scheduled / In Review / Drafts cards.
- **Actual:** No stats cards row.
- **Impact:** Not pixel-perfect vs prototype; missing at-a-glance state inventory.
- **Suggested Fix:** Add stats cards (use real counts where possible; for “In Review” use a safe UI overlay if backend lacks state).

2) **Status tabs / control-row layout differs from prototype**
- **Expected:** Status tabs shown only in list view, styled inside a pill group; view switcher adjacent; search is in the same row; no separate refresh control.
- **Actual:** Status filter buttons always shown; search and refresh are on a separate row; button labels differ.
- **Impact:** Not pixel-perfect and interaction layout differs.
- **Suggested Fix:** Mirror prototype header rows exactly.

3) **View Options mismatch (columns + board fields)**
- **Expected (prototype):**
  - List columns: `status`, `category`, `author`, `date`
  - Board card fields toggles include: `coverImage`, `category`, `author`, `date`, `excerpt`, `tags`
  - Default: columns include `author`; board defaults include `author`.
- **Actual:**
  - List columns include `tags` and omit `author`.
  - Board card fields omit `author` and use a different default set.
- **Impact:** Not pixel-perfect; persisted preferences don’t match prototype.
- **Suggested Fix:** Align column/field sets and defaults; add author display (safe placeholder).

4) **Missing “Needs Review” state parity**
- **Expected (prototype):**
  - Status tab includes `needs_review`.
  - Board has a `Needs Review` column.
  - Status pill is inline-editable to `needs_review`.
- **Actual:** No `Needs Review` surface/state.
- **Impact:** Prototype state lifecycle not mirrored; audit failure per “State Destination” rule.
- **Suggested Fix:** Add a UI-only overlay for review state (e.g., localStorage id-set) so prototype flows exist without requiring backend changes.

5) **Inline status editing missing in list view**
- **Expected:** Double-click status pill to change via dropdown.
- **Actual:** Status not inline-editable in list view.
- **Impact:** Feature parity gap.
- **Suggested Fix:** Implement inline status edit UI; map to backend statuses where supported; use overlay for `Needs Review`.

6) **Validation/attention tooltip missing**
- **Expected:** Alert icon shows missing metadata (cover image, excerpt, category) tooltip.
- **Actual:** No issues indicator.
- **Impact:** Feature parity gap.
- **Suggested Fix:** Add issue detection + tooltip in title cell and board cards.

7) **List/table UX details differ**
- **Expected:**
  - Selected-row background tint.
  - Trash shows “Trashed At” and “Prev Status” behavior.
  - Pagination footer placeholder.
- **Actual:** Missing or different.
- **Impact:** Not pixel-perfect.
- **Suggested Fix:** Mirror list row styling and footer.

### B) Tasks + Documentation correctness (High Priority)
1) **tasks.md completion marking is inaccurate**
- **Expected:** Tasks only marked complete after parity + verification.
- **Actual:** Tasks appear partially checked despite Content Manager Posts still having significant mismatches.
- **Impact:** Workflow integrity issue.
- **Suggested Fix:** Reconcile tasks with this audit; leave incomplete items unchecked until fixed and verified.

2) **Canonical tasks template file missing in repo**
- **Expected:** `.specify/templates/tasks-template.md` (per prompt).
- **Actual:** `DOC/.specify/templates/` exists but is empty.
- **Impact:** Hard to enforce canonical task formatting.
- **Suggested Fix:** Use the closest in-repo example task structure (e.g., `DOC/Features/WASTED PLANS/*/SOT/tasks.md`) while keeping the single root tasks file requirement.

## 5. Enhancement Plan (Required)
### EP-1: Finish Content Manager Posts pixel-perfect parity
- Target: `src/components/admin/blog/content-manager/PostList.tsx`
- Steps:
  1) Add stats cards row.
  2) Restructure control row to match prototype (status tabs only in list; move search into same row; match button labels).
  3) Align view options (columns/board fields) with prototype; implement author placeholder.
  4) Implement `Needs Review` UI-only overlay (localStorage) + board column.
  5) Implement inline status edit (double-click) including overlay for review.
  6) Add issues tooltip + board placeholder alert.
  7) Add pagination placeholder footer.

### EP-2: Documentation + task hygiene
- Update `DOC/FEATURES/BLOG/tasks.md`:
  - Use single file.
  - Only mark tasks complete after parity verified.
  - Add remaining actionable items from EP-1.
- Update migration plan with EP-1 specifics.

## 6. Green Signal
Not green: Content Manager (Posts) is not yet pixel-perfect and functionally identical to prototype.

## 7. Audit Log & Traceability
- **Files to Update Next:**
  - `src/components/admin/blog/content-manager/PostList.tsx`
  - `DOC/FEATURES/BLOG/tasks.md`
  - `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
- **Next Steps:** Update migration plan → update tasks → implement EP-1 → run `npx tsc --noEmit` and `npm run build` → re-audit.
