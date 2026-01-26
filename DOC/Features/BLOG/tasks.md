---
description: "Task list for BLOG pixel-perfect prototype migration"
---

# Tasks: BLOG

**Input**: Prototype export under `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/` and feature docs under `DOC/FEATURES/BLOG/`

**Prerequisites**:
- Migration plan: `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
- Media Library re-migration plan: `DOC/FEATURES/BLOG/Migration/MEDIA-LIBRARY-RE-MIGRATION-PLAN-2026-01-25.md`
- Pixel-perfect migration policy: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/PROTOTYPE-TO-NEXTJS-PIXEL-PERFECT-MIGRATION.md`
- Existing UI audit (reuse-first): `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- Layout/routing (admin shell embedding): `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

**Scope (this run)**: Media Library prototype re-migration ONLY (do not modify other BLOG admin areas):
- Media Library

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2
- Include exact file paths in descriptions

---

## Phase 1: Setup (Docs Lock + Audit)

**Purpose**: Lock scope and prevent duplication before implementation.

- [x] T001 [P] Confirm scope lock in `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md` matches requested pages only (Content Manager)
- [x] T002 [P] Audit existing BLOG admin pages/components to avoid duplication (reuse/extend existing files; do not create parallel duplicates)
        - Routes: `src/app/admin/blog/content-manager/page.tsx`, `src/app/admin/blog/media/page.tsx`
        - Components: `src/components/admin/blog/content-manager/**`, `src/components/admin/blog/media/**`
        - Existing admin blog routes documented in `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md`
- [x] T003 [P] Prototype surface mapping (record exact prototype components/features to mirror)
        - Content Manager: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/BlogEngine.tsx`

- [x] T004 [P] Prototype-first audit completed and recorded in `DOC/FEATURES/BLOG/Audit Report/content-manager-prototype-first-audit-2026-01-22.md`

**Checkpoint**: Audit completed; reuse targets identified; no duplicate-file plan.

---

## Phase 2: Foundational (Repo Health)

**⚠️ CRITICAL**: No migration work begins until repo health is green.


- [x] T010 Run `npx tsc --noEmit` and record any blockers (do not fix unrelated issues)
- [x] T011 Run `npm run build` and record any blockers (do not fix unrelated issues)

**Checkpoint**: Gates green; proceed to user stories.

---

## Phase 3: User Story 1 — Content Manager (Priority: P1) 🎯

**Goal**: Pixel-perfect mirror of the prototype Content Manager surface inside the existing admin dashboard.

**Independent Test**: Visit `/admin/blog/content-manager` and confirm header/tabs/layout match prototype; switching tabs matches prototype behavior.

- [x] T020 [US1] Reuse existing route and make it prototype-matching: `src/app/admin/blog/content-manager/page.tsx`
- [x] T021 [US1] Pixel-perfect port of prototype tabs/header into `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
        - Source of truth: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/BlogEngine.tsx`
        - In scope tabs: Posts / Categories / Tags / Comments / Authors

- [x] T021a [US1] Add Comments tab UI + behaviors (prototype parity; safe stubs if needed)
        - Source of truth: prototype admin components under `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/`

- [x] T021b [US1] Add Authors tab UI + behaviors (prototype parity; safe stubs if needed)
        - Source of truth: prototype admin components under `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/`


- [x] T021c [US1] Implement editor + preview routes required by prototype flows
        - Routes: `src/app/admin/blog/new/page.tsx`, `src/app/admin/blog/[id]/page.tsx`, `src/app/admin/blog/[id]/preview/page.tsx`
        - Source of truth: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminEditor.tsx` and prototype preview flow

- [x] T022 [P] [US1] Finish Posts list pixel-perfect parity (prototype-preserving): `src/components/admin/blog/content-manager/PostList.tsx`
        - Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminPostList.tsx`
- [x] T022a [US1] Add prototype stats cards row (Total / Published / Scheduled / In Review / Drafts)
- [x] T022b [US1] Align header/control row layout (status tabs only in list view; search placement; labels)
- [x] T022c [US1] Align View Options (list columns: status/category/author/date; board fields: coverImage/category/author/date/excerpt/tags)
- [x] T022d [US1] Implement `Needs Review` parity as UI-only overlay (localStorage id-set) + board lane + status tab
- [x] T022e [US1] Implement inline status edit (double-click status pill) including `Needs Review` overlay support
- [x] T022f [US1] Add issues tooltip (missing cover image/excerpt/category) + board placeholder alert
- [x] T022g [US1] Add pagination placeholder footer

- [x] T023 [P] [US1] Port Categories list UI/behaviors into `src/components/admin/blog/content-manager/CategoryList.tsx`
        - Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminCategoryList.tsx`
- [x] T024 [P] [US1] Port Tags list UI/behaviors into `src/components/admin/blog/content-manager/TagList.tsx`
        - Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminTagList.tsx`

**Checkpoint**: Content Manager hub + all in-scope tabs + editor/preview routes look and behave like the prototype.

---

## Phase 4: Admin Dashboard Integration

- [x] T040 [P] Ensure Blog submenu route exists in `src/components/AdminSidebar.tsx`
        - Content Manager → `/admin/blog/content-manager`
- [x] T041 [P] Ensure same link exists in `src/components/AdminMobileSidebarMenu.tsx`

---

## Phase 5: User Story 2 — Media Library (Priority: P1) 🎯

**Goal**: Pixel-perfect mirror of the prototype Media Library surface inside the existing admin dashboard.

**Independent Test**: Visit `/admin/blog/media` and confirm tabs/folders/breadcrumbs/filters/selection tray and modals match prototype.

- [x] T050 [US2] Confirm Media Library route exists and is wired: `src/app/admin/blog/media/page.tsx`

- [x] T051 [US2] Create prototype vs Next.js audit report: `DOC/Features/BLOG/Audit Report/media-library-prototype-vs-nextjs-audit-2026-01-25.md`

- [x] T052 [US2] Re-port Media Library surface from prototype (prototype-first, UI-only safe stubs): `src/components/admin/blog/media/MediaLibrary.tsx`
        - Source of truth: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminMediaLibrary.tsx`
        - Must include: Library/Trash tabs, folders + breadcrumbs, selection + floating bulk tray, per-item menu actions

- [x] T053 [P] [US2] Align Upload modal UI and folder selection to prototype: `src/components/admin/blog/media/UploadMediaModal.tsx`
        - Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/UploadMediaModal.tsx`

- [x] T054 [P] [US2] Align Media Details modal UI/controls to prototype (rename/replace/edit-mode UI): `src/components/admin/blog/media/MediaDetailsModal.tsx`
        - Source: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/MediaDetailsModal.tsx`
        - Note: image editing can be UI-only (no real processing), but controls and states must exist

- [x] T055 [P] [US2] Integrate Move + Bulk Edit modals with prototype flows (wiring only; UI parity):
        - `src/components/admin/blog/media/MoveMediaModal.tsx`
        - `src/components/admin/blog/media/BulkEditMediaModal.tsx`

**Checkpoint**: Media Library matches prototype UI and interactions; no changes outside Media Library scope.

---

## Phase 6: Audit & Correction Loop (Mandatory)

**Purpose**: Ensure pixel-perfect prototype parity and no missing flows.

- [x] T089 [US1] Create prototype vs Next.js audit report scaffold: `DOC/Features/BLOG/Audit Report/content-manager-prototype-vs-nextjs-audit-2026-01-24.md`
- [x] T090 Compare Next.js UI vs prototype for Content Manager (visual parity + interactions + modals)
- [x] T091 Log every remaining gap as tasks in this file
- [x] T091a [US1] Sync Content Manager tab selection to URL (`?tab=`) for prototype-like navigation: `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
- [x] T091b [US1] Match prototype non-tabbed headers for Categories/Tags (back button + title/subtitle + add button; action-row add button tabbed-only): `src/components/admin/blog/content-manager/CategoryList.tsx`, `src/components/admin/blog/content-manager/TagList.tsx`
- [x] T091c [US1] Align Comments list UI to prototype (header, filter bar styling/placeholder, fixed bulk tray, table columns/actions): `src/components/admin/blog/content-manager/CommentsList.tsx`
- [x] T091d [US1] Remove non-prototype Refresh action from Authors list (keep search + optional Add Author only): `src/components/admin/blog/content-manager/AuthorList.tsx`
- [x] T091e [US1] Align Authors table row visuals to prototype (avatar `<img>`, status dot + Active/Inactive labels, action icon padding/hover colors): `src/components/admin/blog/content-manager/AuthorList.tsx`
- [ ] T092 Fix gaps and repeat audit until green
- [x] T096 [US2] Add Media Library date range filter controls + wiring (prototype parity)
        - Prototype reference: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminMediaLibrary.tsx` (dateRange filtering + missing UI trigger)
        - Implementation target: `src/components/admin/blog/media/MediaLibrary.tsx`

### Sub-Phase: Fix Unintended Deviations (No-Assumptions)

**Purpose**: Remove any non-prototype behaviors/visual states introduced during implementation (e.g., hidden/low-contrast buttons, unexpected disabled states, altered modal footers).

- [ ] T093 [US1] Audit Content Manager for unintended deviations (visibility/contrast/disabled states) and log each as tasks
- [ ] T094 [US1] Fix Add Tag modal visibility parity (Save Tag button must be visible and match prototype): `src/components/admin/blog/shared/ManageTaxonomyModal.tsx`
- [ ] T095 Re-run quick spot-check on Tags/Categories modals after fixes

---

## Phase 7: Final Validation + Evidence

- [x] T100 Run `npx tsc --noEmit` (passed 2026-01-25)
- [x] T101 Run `npm run build` (passed 2026-01-25)
- [ ] T102 Capture evidence (side-by-side or screenshots) for Media Library parity and record locations under `DOC/FEATURES/BLOG/Audit Report/`

---

## Phase 8: Frontend Adaptation to Theme System (BLOG Admin) 🎨

**Purpose**: Bring BLOG admin UI into the global multi-theme design system (Dark/Light/Purple) using semantic tokens (no hardcoded colors/typography).

**Reference Instructions**:
- System audit: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Frontend-System-Audit-Instruction-2026.md`
- Migration workflow: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Frontend-Migration-Instruction-2026.md`

**Scope (this phase)**:
- BLOG admin routes and components under `src/app/admin/blog/**` and `src/components/admin/blog/**`
- Use existing theme tokens/classes (e.g., `bg-background`, `bg-surface`, `text-foreground`, `border-border`, `text-heading-*`, `text-body-*`, neumorphic shadows)

**Non-goals**:
- No behavior changes, API changes, state/validation changes, or feature additions (theme-only adaptation)

### Phase 8.A: Audit (Required)

- [x] T200 [P] Create theme system audit report (current system SOT): `DOC/Features/BLOG/Audit Report/blog-frontend-theme-system-audit-2026-01-25.md`
- [x] T201 [P] Create BLOG admin theme adaptation plan: `DOC/Features/BLOG/Migration/blog-admin-theme-adaptation-plan-2026-01-25.md`

**Checkpoint**: Audit report + adaptation plan exist and are reviewed before implementation.

### Phase 8.B: Implementation Tasks (Theme-only)

**Acceptance Criteria (MANDATORY for each component tree):**
- All 6 verification commands return 0 matches for the component AND all child components it renders.
- No `dark:` classes.
- No `bg-white`, `text-white`, `bg-black`, `text-black`, `text-gray-*`, `text-slate-*`, `bg-slate-*`, `border-slate-*`.
- No raw typography utilities: `text-sm`, `text-lg`, `font-bold`, etc. (use semantic typography tokens).

- [x] T210 [US1] Migrate Content Manager hub + tabs to semantic tokens (no hardcoded styles): `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
- [x] T211 [US1] Migrate Posts list surface to semantic tokens (includes status pills, badges, bulk tray): `src/components/admin/blog/content-manager/PostList.tsx`
- [x] T212 [US1] Migrate Categories list UI to semantic tokens: `src/components/admin/blog/content-manager/CategoryList.tsx`
- [x] T213 [US1] Migrate Tags list UI to semantic tokens: `src/components/admin/blog/content-manager/TagList.tsx`

- [x] T214 [US1] Migrate Comments list UI + modals to semantic tokens:
        - `src/components/admin/blog/content-manager/CommentsList.tsx`
        - `src/components/admin/blog/shared/ModerateCommentModal.tsx`
        - `src/components/admin/blog/shared/BulkModerateModal.tsx`
        - [x] `src/components/admin/blog/content-manager/CommentsList.tsx`
        - [x] `src/components/admin/blog/shared/ModerateCommentModal.tsx`
        - [x] `src/components/admin/blog/shared/BulkModerateModal.tsx`

- [x] T215 [US1] Migrate Authors list UI + modals to semantic tokens:
        - `src/components/admin/blog/content-manager/AuthorList.tsx`
        - `src/components/admin/blog/shared/ManageAuthorModal.tsx`
        - `src/components/admin/blog/shared/AuthorPreviewModal.tsx`
        - [x] `src/components/admin/blog/content-manager/AuthorList.tsx`
        - [x] `src/components/admin/blog/shared/ManageAuthorModal.tsx`
        - [x] `src/components/admin/blog/shared/AuthorPreviewModal.tsx`

- [x] T220 [US1] Migrate shared taxonomy + confirmation modals to semantic tokens:
        - `src/components/admin/blog/shared/ManageTaxonomyModal.tsx`
        - `src/components/admin/blog/shared/BulkTagModal.tsx`
        - `src/components/admin/blog/shared/ConfirmationModal.tsx`
        - [x] `src/components/admin/blog/shared/ManageTaxonomyModal.tsx`
        - [x] `src/components/admin/blog/shared/BulkTagModal.tsx`
        - [x] `src/components/admin/blog/shared/ConfirmationModal.tsx`

- [x] T230 [US1] Migrate Admin Editor + Preview surfaces to semantic tokens:
        - `src/components/admin/blog/editor/AdminPostEditorClient.tsx`
        - `src/components/admin/blog/editor/AdminPostPreviewClient.tsx`

- [x] T240 [US2] Migrate Media Library + all media modals to semantic tokens:
        - `src/components/admin/blog/media/MediaLibrary.tsx`
        - `src/components/admin/blog/media/MediaDetailsModal.tsx`
        - `src/components/admin/blog/media/UploadMediaModal.tsx`
        - `src/components/admin/blog/media/MoveMediaModal.tsx`
        - `src/components/admin/blog/media/BulkEditMediaModal.tsx`
        - `src/components/admin/blog/shared/MediaPickerModal.tsx`
        - `src/components/admin/blog/media/SkeletonMediaGrid.tsx`
        - `src/components/admin/blog/shared/SkeletonAdminTable.tsx`
        - [x] `src/components/admin/blog/media/MediaLibrary.tsx`
        - [x] `src/components/admin/blog/media/MediaDetailsModal.tsx`
        - [x] `src/components/admin/blog/media/UploadMediaModal.tsx`
        - [x] `src/components/admin/blog/media/MoveMediaModal.tsx`
        - [x] `src/components/admin/blog/media/BulkEditMediaModal.tsx`
        - [x] `src/components/admin/blog/shared/MediaPickerModal.tsx`
        - [x] `src/components/admin/blog/media/SkeletonMediaGrid.tsx`
        - [x] `src/components/admin/blog/shared/SkeletonAdminTable.tsx`

### Phase 8.C: Verification (Required)

- [x] T290 Run typecheck: `npx tsc --noEmit`
- [x] T291 Run build: `npm run build`
- [ ] T292 Theme smoke test: verify Dark/Light/Purple for BLOG admin routes
- [ ] T293 Responsive smoke test: 320 / 375 / 768 / 1024 / 1440
- [ ] T294 Accessibility smoke test: focus states, keyboard nav for modals, contrast sanity

---

## Backend Implementation Phases

**Start Date:** 2026-01-26  
**Reference Workflow:** `attached_assets/Pasted--Blog-Feature-Backend-Phase-Based-Task-Workflow-tasks-m_1769420812658.txt`

---

## Phase B1: Audit (Backend)

**Purpose:** Complete E2E audit of Blog & Media Library current state.

- [x] TB001 Create E2E current state audit following `DOC\Prompts\PROMPTS & TEMPLATES\BACKEND\E2E-CURRENT-STATE-AUDIT-RULES.md`
        - **Output:** `DOC/Features/BLOG/Audit Report/CURRENT-STATE-E2E-AUDIT.md`
        - **Status:** Done
        - **Findings:** Posts/Categories/Tags have full backend; Comments/Authors/Media Library have UI only (no backend)

**Checkpoint:** Audit complete; gaps identified.

---

## Phase B2: Backend Planning

**Purpose:** Create detailed backend implementation plan based on audit.

- [x] TB010 Create backend plan following `DOC\Prompts\PROMPTS & TEMPLATES\BACKEND\Backend_Planning_Prompt_Template_E2E_Audit_First.md`
        - **Output:** `DOC/Features/BLOG/Backend/BACKEND-PLAN.md`
        - **Status:** Done
        - **Summary:** Plan covers Authors, Comments, Media Library backend with Prisma models, API contracts, S3 integration, testing requirements

**Checkpoint:** Backend plan complete; ready for test script preparation.

---

## Phase B3: Test Script Preparation

**Purpose:** Prepare all test scripts before implementation.

- [x] TB020 Create test specifications summary
        - **Output:** `DOC/Features/BLOG/Backend/BACKEND-TEST-SPECS.md`
        - **Status:** Done
        
- [x] TB021 Create unit test scripts for Authors
        - **Output:** `tests/unit/blog/authors.test.ts`
        
- [x] TB022 Create unit test scripts for Comments  
        - **Output:** `tests/unit/blog/comments.test.ts`
        
- [x] TB023 Create unit test scripts for Media Assets
        - **Output:** `tests/unit/media/assets.test.ts`

- [x] TB024 Create integration test scripts
        - **Output:** `tests/integration/blog/authors-api.test.ts`, `tests/integration/blog/comments-api.test.ts`, `tests/integration/media/media-api.test.ts`

- [x] TB025 Create E2E test scripts
        - **Output:** `tests/e2e/blog-backend.spec.ts`

**Architect Review Notes (2026-01-26):**
- Unit tests are currently template/stub tests with inline logic - will be refactored to import real modules during Phase B4
- Integration tests need auth setup and stricter assertions - will be enhanced during Phase B4
- E2E tests are UI flow templates - will add persistence verification during Phase B5
- These are intentionally templates that define test structure; real logic imported after implementation

**Checkpoint:** All test script templates created; ready for implementation.

---

## Phase B4: Implementation Tasks

**Purpose:** Implement backend based on plan and test scripts.

- [ ] TB030 Create Prisma migration for new models (BlogAuthor, BlogComment, MediaAsset, MediaFolder)
        - Additive migration only; no destructive changes
        
- [ ] TB031 Implement Authors API endpoints
        - `src/app/api/admin/blog/authors/route.ts`
        - `src/app/api/admin/blog/authors/[id]/route.ts`
        
- [ ] TB032 Implement Comments API endpoints
        - `src/app/api/admin/blog/comments/route.ts`
        - `src/app/api/admin/blog/comments/[id]/route.ts`
        - `src/app/api/admin/blog/comments/bulk/route.ts`
        - `src/app/api/blog/posts/[slug]/comments/route.ts`
        
- [ ] TB033 Implement Media Library API endpoints
        - `src/app/api/admin/media/route.ts`
        - `src/app/api/admin/media/[id]/route.ts`
        - `src/app/api/admin/media/[id]/restore/route.ts`
        - `src/app/api/admin/media/[id]/permanent/route.ts`
        - `src/app/api/admin/media/bulk/move/route.ts`
        - `src/app/api/admin/media/bulk/edit/route.ts`
        - `src/app/api/admin/media/bulk/delete/route.ts`
        
- [ ] TB034 Implement Media Folders API endpoints
        - `src/app/api/admin/media/folders/route.ts`
        - `src/app/api/admin/media/folders/[id]/route.ts`

- [ ] TB035 Create S3 upload service for media files
        - `src/lib/media/upload-service.ts`

- [ ] TB036 Connect frontend components to new APIs
        - Update `CommentsList.tsx` to use real API
        - Update `AuthorList.tsx` to use real API
        - Update `MediaLibrary.tsx` to use real API

**Checkpoint:** Implementation complete; ready for testing.

---

## Phase B5: Testing & Validation

**Purpose:** Run all tests and validate implementation.

- [ ] TB040 Run unit tests
- [ ] TB041 Run integration tests
- [ ] TB042 Run E2E tests
- [ ] TB043 Manual validation of all UI flows
- [ ] TB044 Create validation report
        - **Output:** `DOC/Features/BLOG/Backend/BACKEND-VALIDATION.md`

**Checkpoint:** All tests passing; validation complete.

