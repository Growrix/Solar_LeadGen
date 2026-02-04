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

## Phase 10: Frontend Design System v3 Rollout (Foundation → Component Library → Incremental Adoption) 🧩

**Purpose**: Implement the redesign proposals from `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/AUDIT-OUTPUT-2026-02-01/Frontend-System-Gap-Audit-Report-2026-02-01.md` in a safe, incremental way.

### Working Agreement (Execution Rules — This File Is The Only SOT)

**SOT rule**: This file is the single execution SOT while implementing. No implementation begins for a new item unless it is written as a task here first.

**No mid-stream decision asks**: If a decision is needed, it must be captured as a task in this file first (with a default choice documented here). Implementation continues using the default unless you explicitly change it in this file.

**Guiding principle**: Your existing UI is acceptable; the goal is to strengthen the foundation and grow a reusable component library. Migrations happen incrementally as we build new components or touch existing surfaces.

**Default choices (until overridden here)**:
- Rollout mode: **Compatibility/Additive** (non-breaking where possible)
- Migration order: **Foundation → Component Library → Incremental adoption** (no big-bang rewrite)

**Strategy**:
- Foundation first (tokens/theme wiring/Tailwind config) to prevent drift.
- Component library next (canonical primitives + documented semantic classes).
- Incremental adoption: update existing classes when we touch screens and add new components.

**Primary SOT (Target)**:
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

**Acceptance Criteria (each batch)**:
- `npx tsc --noEmit` passes
- `npm run build` passes
- No `dark:` classes introduced; theme handled via `ThemeProvider` (`theme-*` on `<html>`)
- For migrated component trees: all 6 verification commands return 0 matches (hardcoded colors/typography/manual responsive)

### Phase 9.A: Decisions + Compatibility Layer

- [x] T300 Set rollout mode to Compatibility/Additive (default; no breaking window)
        - Keep existing tokens working while adding v3 tokens + mappings
        - Any future breaking change must be added here as an explicit task first

- [x] T301 Fix theme mechanism inconsistency in Theme Test page: `src/app/theme-test/page.tsx`
        - Must use `ThemeProvider` (`theme-dark/theme-light/theme-purple`), not `dark` class

- [x] T302 Create missing semantic class registry referenced across docs/UI: `DOC/SEMANTIC-CLASSES-REGISTRY.md`

### Phase 9.B: Foundation Tokens + Tailwind Wiring (Non-breaking where possible)

- [x] T310 Add Tailwind `screens` to match universal breakpoints (xs/sm/md/lg/xl/xxl): `tailwind.config.js`
- [x] T311 Standardize theme tokens format (prefer RGB triples) and remove hardcoded hex/rgba where possible: `src/app/globals.css`
- [x] T312 Replace hardcoded select-caret data-URI color with variable-driven approach: `src/app/globals.css`
- [x] T313 Add semantic sizing + z-index utilities to remove common arbitrary values: `tailwind.config.js`, `src/design-tokens/**`, `src/app/globals.css`

### Phase 9.C: Component Library v3 (Canonical Components)

- [x] T320 Standardize Button (single source): consolidate `src/components/Button.tsx` usage to `src/components/ui/button.tsx`
- [x] T321 Create/standardize Modal/Dialog base (a11y + focus trap) and migrate modals incrementally
- [x] T321a Add dependency for accessible Dialog + focus trap: `@radix-ui/react-dialog`
- [x] T321b Create canonical Dialog primitives: `src/components/ui/dialog.tsx`
- [x] T321c Migrate one existing modal to canonical Dialog (incremental): `src/components/DetailedInformationModal.tsx`
- [x] T321d Run gates: `npx tsc --noEmit` and `npm run build`
- [x] T322 Standardize icon system usage (pick one set + size rules) and document in SOT
- [x] T322a Inventory icon usage (lucide/heroicons/custom) and pick default: lucide-react (keep custom brand/auth icons)
- [x] T322b Document icon rules + size scale in design system SOT: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`
- [x] T322c Add canonical Icon wrapper for lucide sizing/props: `src/components/ui/icon.tsx`
- [x] T322d Migrate remaining `@heroicons/react` usages to lucide equivalents (incremental; keep visuals stable)
- [x] T322e Run gates: `npx tsc --noEmit` and `npm run build`
- [x] T322f Fix lingering `@heroicons/react` import causing Gate0 failures (post-uninstall): `src/app/installer/(dashboard)/marketplace/page.tsx`

### Phase 9.D: Migration Rollout (Reuse-first)

- [ ] T330 Migrate BLOG admin surfaces to use canonical v3 components (reuse existing design where compatible)
        - Start with highest-traffic/most-reused primitives: Button, Input, Modal
- [x] T330a Scope mismatch handling (BLOG admin components not present here): default migration targets are existing non-admin modals/pages under `src/components/**` and `src/app/**` until BLOG admin surfaces are available
- [x] T330b Migrate one additional modal to canonical Dialog base (incremental): `src/components/InstallerSignInModal.tsx`
- [x] T330c Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330d Migrate one additional modal to canonical Dialog base (incremental): `src/components/InstallerSignupModal.tsx`
- [x] T330e Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330f Migrate one additional modal to canonical Dialog base (incremental): `src/components/HomeownerSignInModal.tsx`
- [x] T330g Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330h Migrate one additional modal to canonical Dialog base (incremental): `src/components/HomeownerSignupModal.tsx`
- [x] T330i Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330j Migrate one additional modal to canonical Dialog base (incremental): `src/components/OTPVerificationModal.tsx`
- [x] T330k Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330l Migrate one additional modal to canonical Dialog base (incremental): `src/components/DetailedQuoteAuthModal.tsx`
- [x] T330m Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330n Migrate one additional modal to canonical Dialog base (incremental): `src/components/NewQuoteRequestModal.tsx`
- [x] T330o Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330p Migrate one additional modal to canonical Dialog base (incremental): `src/components/QuoteOptionsModal.tsx`
- [x] T330q Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330r Migrate one additional modal to canonical Dialog base (incremental): `src/components/BidEvaluationModal.tsx`
- [x] T330s Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330t Migrate one additional modal to canonical Dialog base (incremental): `src/components/MessagingModal.tsx`
- [x] T330u Migrate one additional modal to canonical Dialog base (incremental): `src/components/InstallerMessagingModal.tsx`
- [x] T330v Run gates after migration batch: `npx tsc --noEmit` and `npm run build`

- [x] T330w Migrate one additional modal to canonical Dialog base (incremental): `src/components/InstallerEligibilityModal.tsx`
- [x] T330x Migrate one additional modal to canonical Dialog base (incremental): `src/components/HomeownersInfoForm.tsx`
- [x] T330y Fix DS sizing token in auth overlay: `src/components/AdminSignIn.tsx` (`max-h-[90vh]` → `max-h-modal`)

- [x] T330z Migrate one additional modal to canonical Dialog base (incremental): `src/components/installer/VerificationModal.tsx`
- [x] T331aa Migrate one additional modal to canonical Dialog base (incremental): `src/components/homeowner/LeadPreviewModal.tsx`
- [x] T331ab Migrate one additional modal to canonical Dialog base (incremental): `src/components/homeowner/QuoteTypeDistributionModal.tsx`
- [x] T331ac Migrate one additional modal to canonical Dialog base (incremental): `src/components/homeowner/FirstQuoteSuccessModal.tsx`
- [x] T331ad Migrate rebate results modal to canonical Dialog base (incremental): `src/components/RebateCalculatorForm.tsx`
- [x] T331ae Fix DS sizing token in shared auth wrapper: `src/components/auth/AuthModal.tsx` (`max-h-[90vh]` → `max-h-modal`)

- [x] T331af Run gates after migration batch: Gate0 typecheck + `npm run build` (passed 2026-02-02)

- [x] T331ag Migrate one additional modal to canonical Dialog base (incremental): `src/components/homeowner/LeadLimitReachedModal.tsx`
- [x] T331ah Migrate one additional modal to canonical Dialog base (incremental): `src/components/HomeownerPreviewModal.tsx` (remove `md:h-[90vh]`)
- [x] T331ai Migrate one additional modal to canonical Dialog base (incremental): `src/components/InstallerLeadFeed.tsx` (ViewDetailsModal)

- [x] T331aj Run gates after migration batch: `npx tsc -p tsconfig.gate.json --noEmit` and `npm run build` (passed 2026-02-02)
- [x] T331ak Run `npm run ds:audit` and record reduction (230 violations)

- [x] T331al Migrate one additional modal to canonical Dialog base (incremental): `src/components/homeowner/SimplifiedQuoteFormModal.tsx` (`max-h-[95vh]` → `max-h-modal`)
- [x] T331am Migrate one additional modal to canonical Dialog base (incremental): `src/components/homeowner/LeadEditModal.tsx` (`max-h-[95vh]` → `max-h-modal`)
- [x] T331an Migrate one additional modal to canonical Dialog base (incremental): `src/app/admin/instant-quotes/page.tsx` (QuoteDetailsModal `max-h-[90vh]` → `max-h-modal`)

- [x] T331ao Run `npm run build` (passed 2026-02-02)
- [x] T331ap Run `npm run ds:audit` and record reduction (224 violations)

- [x] T331aq Fix DS tokens in builder modals: `src/components/QuoteBuilderModal.tsx`, `src/components/WrittenQuoteBuilderModal.tsx`
        - `md:max-w-[98vw]`/`md:max-h-[98vh]` → `md:max-w-viewport-98`/`md:max-h-viewport-98`
        - `z-[1400]`/`z-[1410]` → `z-modal-backdrop`/`z-modal`
        - `w-[70%]`/`w-[30%]` → `grid-cols-10` layout (`col-span-7`/`col-span-3`)

- [x] T331ar Fix Gate0 Next build task flakiness on Windows: `.vscode/tasks.json` (clean `.next` before build)
- [x] T331as Run Gate0 build + ds:audit and record reduction (190 violations; passed 2026-02-02)

- [x] T331at Add smaller modal height token: `max-h-modal-sm` (70vh)
        - `src/design-tokens/semantic/layout.ts`, `src/app/globals.css`

- [x] T331au Fix remaining DS arbitrary values in admin + homeowner review modals
        - `src/components/admin/InstallerSelectorModal.tsx` (`max-h-[70vh]` → `max-h-modal-sm`)
        - `src/components/admin/AdminLeadManagementModal.tsx` (`max-h-[70vh]` → `max-h-modal-sm`)
        - `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx` (`lg:grid-cols-[65%_35%]` → `lg:grid-cols-10`, `min-w-[100px]` → `min-w-24`)
        - `src/components/homeowner/HomeownerBiddingReviewModal.tsx` (`lg:grid-cols-[65%_35%]` → `lg:grid-cols-10`, `min-w-[100px]` → `min-w-24`)

- [x] T331av Run Gate0 build + ds:audit and record reduction (166 violations; passed 2026-02-02)

- [x] T331aw Add `text-micro` semantic typography token (10px) for badges: `src/design-tokens/semantic/typography.ts`, `tailwind.config.js`
- [x] T331ax Fix DS arbitrary utilities in bottom nav bars: `src/components/InstallerBottomNavBar.tsx`, `src/components/HomeownerBottomNavBar.tsx`, `src/components/GuestBottomNavBar.tsx`
        - Badge positioning: remove `right-[calc(50%-22px)]` by anchoring badge to icon wrapper
        - Badge typography: remove `text-[10px]` in favor of `text-micro`
        - Shadow: remove `shadow-[...]` in favor of `shadow-card`
- [x] T331ay Run Gate0 build + ds:audit and record reduction (152 violations; passed 2026-02-02)

- [x] T331az Remove remaining arbitrary scale/typography utilities in header + notifications
        - `tailwind.config.js`: add `scale-98` and `scale-101`
        - `src/components/Header.tsx`: `active:scale-[0.98]` → `active:scale-98`
        - `src/components/NotificationDropdown.tsx`, `src/app/notifications/page.tsx`: `hover:scale-[1.01]` → `hover:scale-101`
        - `src/components/HeaderMenu.tsx`: `text-[10px]` → `text-micro`

- [x] T331ba Remove `max-w-[60%]` arbitrary value in installer lead details: `src/components/InstallerLeadFeed.tsx`
        - Replace flex row with `grid-cols-5` + spans for Full Address label/value

- [x] T331bb Run Gate0 build + ds:audit and record reduction (138 violations; passed 2026-02-02)

- [x] T331bc Remove remaining arbitrary layout utilities (min-widths/grid-template/min-height)
        - `src/components/quote-builder/SystemSelection.tsx`: `min-w-[160px|200px|140px]` → `min-w-40|min-w-52|min-w-36`; `max-w-[100px]` → `max-w-24`
        - `src/components/homeowner/RequestMoreQuotesCTA.tsx`: remove `sm:grid-cols-[1fr_auto]` by switching to `sm:flex-row` layout
        - `src/components/admin/InstallersTable.tsx`: `max-w-[200px]` → `max-w-52`
        - `src/components/admin/AdminBidsPanel.tsx`: `min-h-[80px]` → `min-h-20`

- [x] T331bd Run Gate0 build + ds:audit and record reduction (122 violations; passed 2026-02-02)

- [x] T331be Make semantic typography responsive-by-default + remove responsive typography utilities
        - `tailwind.config.js`: generate `clamp()` font sizes from semantic typography responsive values
        - `src/components/Hero.tsx`: remove `text-[34px]` + `sm:min-h-[calc(...)]` (use `text-heading-*` tokens and `min-h-viewport-minus-header`)
        - `src/design-tokens/semantic/layout.ts`, `src/app/globals.css`: add `min-h-viewport-minus-header`
        - Remove breakpoint-prefixed `text-*` utilities in: `src/components/NewsletterSignup.tsx`, `src/components/BlogSection.tsx`, `src/app/page.tsx`, `src/components/Header.tsx`, `src/components/HeaderMenu.tsx`
        - Replace arbitrary blog grid templates: `src/app/blog/BlogIndexClient.tsx`, `src/app/blog/[slug]/page.tsx` (`lg:grid-cols-[1fr_360px]` → `lg:grid-cols-10` with spans)

- [x] T331bf Run Gate0 build + ds:audit and record reduction (70 violations; passed 2026-02-02)

- [x] T331bg Remove remaining DS violations in installer/homeowner/admin surfaces
        - `src/app/installer/page.tsx`, `src/app/homeowner/page.tsx`: `min-h-[70vh]`/`min-h-[calc(...)]` → `min-h-hero`/`min-h-viewport-minus-header`; remove redundant breakpoint typography
        - `src/app/homeowner/dashboard/page.tsx`, `src/app/installer/(dashboard)/leads/page.tsx`: `min-h-[400px]` → `min-h-96`; `min-h-[80px]` → `min-h-20`; remove remaining responsive typography
        - `src/app/admin/leads/page.tsx`: `min-w-[220px|180px]` → `min-w-56|min-w-48`
        - `src/app/installer/(dashboard)/profile/page.tsx`: remove pseudo-element arbitrary values via `after-content-empty` + standard spacing/transition utilities

- [x] T331bh Add missing semantic helpers to eliminate repeated arbitrary patterns
        - `src/design-tokens/semantic/layout.ts`, `src/app/globals.css`: add `min-h-hero` (`--size-hero-min-h: 70vh`)
        - `src/app/globals.css`: add `.after-content-empty::after { content: '' }`

- [x] T331bi Remove remaining `transition-all` violations in touched TSX
        - `src/components/NotificationDropdown.tsx`, `src/app/notifications/page.tsx`, `src/components/BidEvaluationModal.tsx`, `src/components/admin/AdminBidsPanel.tsx`, `src/components/quote-builder/ProductConfiguration.tsx`: `transition-all` → `transition`
        - `src/components/quote-builder/CustomerPreview.tsx`: `min-w-[150px]` → `min-w-36`; `transition-all` → `transition-colors`
        - `src/components/DetailedInformationModal.tsx`, `src/components/homeowner/SimplifiedQuoteForm.tsx`: remove remaining arbitrary min-height / redundant typography

- [x] T331bj Move stray backup files out of `src/` so audit stays clean
        - `src/app/homeowner/dashboard/page.tsx.old.20251106` → `backup/page.tsx.old.20251106`
        - `src/app/notifications/page.tsx.backup` → `backup/page.tsx.backup`

- [x] T331bk Run gates + ds:audit and record result (0 violations; passed 2026-02-02)

- [ ] T331 Run audit loop (`npm run ds:audit`) after each batch; fix newly introduced violations
- [x] T331a Run `npm run ds:audit` and ensure no new violations introduced by the current batch (focus: files touched in this batch)
- [x] T331b Fix any ds:audit issues in batch-touched files (no unrelated refactors)

- [x] T331c Run `npm run ds:audit` and ensure no new violations introduced by the current batch (focus: files touched in this batch)
- [x] T331d Fix any ds:audit issues in batch-touched files (no unrelated refactors)

- [x] T331e Run `npm run ds:audit` and ensure no new violations introduced by the current batch (focus: files touched in this batch)
- [x] T331f Fix any ds:audit issues in batch-touched files (no unrelated refactors)

- [x] T331g Run `npm run ds:audit` and ensure no new violations introduced by the current batch (focus: files touched in this batch)
- [x] T331h Fix any ds:audit issues in batch-touched files (no unrelated refactors)

- [x] T331i Run `npm run ds:audit` and ensure no new violations introduced by the current batch (focus: files touched in this batch)
- [x] T331j Fix any ds:audit issues in batch-touched files (no unrelated refactors)

- [x] T331k Run `npm run ds:audit` and ensure no new violations introduced by the current batch (focus: files touched in this batch)
- [x] T331l Fix any ds:audit issues in batch-touched files (no unrelated refactors)

- [x] T331m Run `npm run ds:audit` and ensure no new violations introduced by the current batch (focus: files touched in this batch)
- [x] T331n Fix any ds:audit issues in batch-touched files (no unrelated refactors)

- [x] T331o Run `npm run ds:audit` after eligibility/homeowner/auth/verification sizing + modal migrations; violations decreased (236).

### Phase 9.E: Validation (Required)

- [ ] T340 Theme smoke test (Dark/Light/Purple) for key routes (start with BLOG admin)
- [ ] T341 Responsive smoke test: 320 / 375 / 768 / 1024 / 1440
- [ ] T342 Accessibility smoke test: focus states, keyboard nav, modal focus trap, contrast sanity

---

## Design System Blueprint Adoption (New SOT)

**Start Date:** 2026-02-03  
**SOT Blueprint:** `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design_system_Blueprint.md`  
**Gap Audit + Roadmap:** `DOC/Features/BLOG/Audit Report/design-system-blueprint-gap-audit-2026-02-03.md`

**Goal:** Align the repo to the Blueprint architecture (tokens → themes → primitives → components → shells/layouts → pages), with enforceable boundaries and drift-proof governance.

### Phase BP0: Governance Hardening (Prevent Drift First)

- [ ] TBP000 Make design-system verifier catch computed `className` patterns
        - Upgrade `scripts/design-system-verify.ts` to scan `TemplateExpression` literals and `className={...}` expressions (including `cn()`/`clsx()` args)
        - Acceptance: violations inside template strings are detected; `npm run gate0` remains green after fixes

- [ ] TBP010 Add CSS scan mode for theme CSS entrypoints
        - Scan at least `src/app/globals.css` for hardcoded `#hex`, `rgb(a)`, `white/black`, `transition: all`, and `@media`-driven typography
        - Acceptance: new script mode wired into `gate0` (or separate `ds:verify:css` in CI)

- [ ] TBP020 Establish a single import surface for DS consumption
        - Create `src/ds/index.ts` as the only supported import entry for DS consumers (`@/ds`)
        - Add a lint rule (later) to restrict direct imports from `src/design-tokens/**` in app code

### Phase BP1: DS Boundary Scaffold (`src/ds/**`)

- [ ] TBP100 Create the Blueprint folder structure
        - `src/ds/tokens`, `src/ds/themes`, `src/ds/primitives`, `src/ds/components`, `src/ds/layouts`, `src/ds/styles`, `src/ds/index.ts`
        - Start by re-exporting the existing token sources via `src/ds/tokens/*` (no behavior changes)

- [ ] TBP110 Move global DS CSS under `src/ds/styles/*` (no visual change)
        - Keep `src/app/globals.css` as the runtime entrypoint but relocate DS-owned parts behind a single import or clearly delimited section

### Phase BP2: Primitives (Layout + Typography Ownership)

- [ ] TBP200 Implement layout primitives
        - `Container`, `Stack`, `Grid`, `Spacer`, `Divider`
        - Acceptance: pages stop using repeated layout utilities (`container mx-auto px-* max-w-*` patterns)

- [ ] TBP210 Implement typography primitives
        - `Text`, `Heading`, `LinkText` (token-driven variants only)
        - Acceptance: no raw `text-sm|text-xl|font-semibold` outside DS primitives/components

### Phase BP3: Shells / Layouts (Pages Stop Making Decisions)

- [ ] TBP300 Add shells
        - `PublicShell`, `DashboardShell`, `CenteredShell`
        - Own responsive layout, gutters, max widths, and page scaffolding

- [ ] TBP310 Migrate a pilot route set
        - Start with `/solarconnect` + one existing route (home or installer dashboard)
        - Acceptance: pages become orchestration-only (composition + data), not styling-heavy

### Phase BP4: Repo-Wide Migration + Enforcement

- [ ] TBP400 Migrate remaining routes incrementally (feature-by-feature)
        - Prefer wrappers/adapters over big-bang rewrites
        - Keep `gate0` green after each batch

- [ ] TBP410 Enforce boundary rules
        - ESLint restricted imports: pages/components must consume `@/ds` only
        - CI gate: no direct token imports and no new hardcoded classes

- [ ] TBP420 Remove/retire legacy token paths and compatibility mappings
        - Acceptance: single DS SOT; no parallel token sources

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

---

## Phase B6: Storage Decoupling (No “replit”) (Surgical)

**Purpose:** Remove all “replit”-named code/paths and switch Media Library uploads to neutral storage while preserving functionality.

**Primary Audit (SOT for this phase):**
- `DOC/Features/BLOG/Audit Report/STORAGE-DECOUPLING-E2E-AUDIT-2026-01-27.md`

**Scope:**
- Media upload presign endpoint only: `src/app/api/admin/media/upload/route.ts`
- Removal of unused legacy artifacts: `src/lib/replit_integrations/**`, `.replit_integration_files/**`, `replit.md`
- Config cleanup where it references deleted paths (e.g. `tsconfig.json` excludes)

**Non-goals:**
- No DB schema renames/migrations (keep `MediaAsset.s3Key` as-is)
- No changes to Media Library UI upload flow (still POST presign → PUT upload → POST asset)

- [ ] TB060 [P] Add a safety baseline commit (docs only) before code changes
        - Include: the new audit report + this phase entry

- [ ] TB061 Update Media upload presign to use S3 helpers (no “replit” references)
        - File: `src/app/api/admin/media/upload/route.ts`
        - Use: `getPresignedUploadUrl()` + `getPublicUrlForKey()` from `src/lib/s3.ts`
        - Keep dev-local fallback (`ALLOW_LOCAL_MEDIA_UPLOADS=true` in non-production)

- [ ] TB062 Remove all “replit”-named code and artifacts
        - Delete: `src/lib/replit_integrations/**`
        - Delete: `.replit_integration_files/**`
        - Delete: `replit.md`

- [ ] TB063 Clean config and references after deletion
        - Remove dead `tsconfig.json` excludes pointing at deleted paths
        - Confirm there are no remaining `replit` string/import references in `src/**`

- [ ] TB064 Run gates
        - Typecheck: `npx tsc --noEmit`
        - Build: `npm run build`

**Checkpoint:** No “replit” named folders/files remain; Media Library uploads still work (S3 when configured, dev-local when enabled); gates green.

---

## Phase 9: Current-State Re-Audit + Traceable Next Execution (2026-02-01) ✅

**Purpose**: Stop confusion/drift by pinning *exactly* what remains, what is the SOT for each item, and the exact verification evidence required before proceeding.

### Phase 9.A: Global Design System SOT Lock (Applies to all BLOG UI work)

**SOT (must follow)**:
- Design System SOT: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`
- Global Design System Audit (why fixes exist): `DOC/Features/BLOG/Audit Report/frontend-global-design-system-audit-2026-01-26.md`

**Implementation Reality (global files that define behavior)**:
- `src/app/globals.css`
- `tailwind.config.js`
- `src/components/ThemeProvider.tsx`
- `src/app/layout.tsx`

**Enforcement tooling (must keep green)**:
- Strict (UI primitives): `npm run ds:verify`
- Broad audit (report-only): `npm run ds:audit`

### Phase 9.B: Repo Health / Build Evidence (Resolve task-runner mismatch)

**Why**: VS Code task runner currently reports `Gate0: Next build` exit code 1 intermittently, which creates false failures and confusion.

- [x] T012 Capture full output for VS Code task failure and store evidence under `DOC/Features/BLOG/Audit Report/`
        - Run task: `Gate0: Next build` (VS Code) and capture the full terminal output
        - Also run: `npm run build` in a normal terminal to compare
        - Output: `DOC/Features/BLOG/Audit Report/gate0-next-build-exitcode-investigation-2026-02-01.md`

- [x] T013 Fix the root cause of the exit-code mismatch (no guess fixes)
        - Update `.vscode/tasks.json` only if the evidence proves it’s a task configuration issue
        - Acceptance: `Gate0: Next build` exits 0 when build succeeds; exits non-zero only on real build failure

- [x] T014 Fix Gate0: Typecheck false failures caused by `.next/types` inclusion
        - Rationale: `.next/types` are generated artifacts; `npm run build` already validates Next.js type generation
        - Action: remove `.next/types/**/*.ts` from `tsconfig.gate.json` include to keep Gate0 typecheck focused on source
        - Acceptance: VS Code task `Gate0: Typecheck` exits 0 when source typecheck passes

- [x] T015 Fix VS Code `Gate0: Typecheck` task exit-code propagation
        - Evidence: running `npx tsc -p tsconfig.gate.json --noEmit` in a normal terminal exits 0, but the VS Code task reports exit 1
        - Action: update `.vscode/tasks.json` to run typecheck via `cmd /c` so `%ERRORLEVEL%` is propagated reliably
        - Acceptance: VS Code task output shows real TypeScript errors when present; exits 0 when clean

### Phase 9.C: BLOG UI Parity Closure (Prototype-first correctness)

**Blocker (2026-02-01)**: BLOG Admin implementation targets referenced below are not present in this workspace; see `DOC/Features/BLOG/Audit Report/blog-admin-scope-mismatch-2026-02-01.md`.

**SOT**:
- Migration plan: `DOC/FEATURES/BLOG/Migration/MIGRATION-PLAN-PROTOTYPE-TO-NEXTJS.md`
- Pixel-perfect policy: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/PROTOTYPE-TO-NEXTJS-PIXEL-PERFECT-MIGRATION.md`
- Prototype surface: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/`

**Open gaps already in this task list (do not expand scope)**:
- [ ] T092 Fix gaps and repeat audit until green
- [ ] T093 [US1] Audit Content Manager for unintended deviations (visibility/contrast/disabled states) and log each as tasks
- [ ] T094 [US1] Fix Add Tag modal visibility parity (Save Tag button must be visible and match prototype): `src/components/admin/blog/shared/ManageTaxonomyModal.tsx`
- [ ] T095 Re-run quick spot-check on Tags/Categories modals after fixes
- [ ] T102 Capture evidence (side-by-side or screenshots) for Media Library parity and record locations under `DOC/FEATURES/BLOG/Audit Report/`

### Phase 9.D: BLOG Theme System Adaptation — Remaining Verification (Theme-only)

**Blocker (2026-02-01)**: BLOG Admin routes/components referenced for verification are not present in this workspace; see `DOC/Features/BLOG/Audit Report/blog-admin-scope-mismatch-2026-02-01.md`.

**SOT**:
- Theme system audit: `DOC/Features/BLOG/Audit Report/blog-frontend-theme-system-audit-2026-01-25.md`
- Theme adaptation plan: `DOC/Features/BLOG/Migration/blog-admin-theme-adaptation-plan-2026-01-25.md`
- Global design system SOT: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

**Remaining mandatory checks (already listed above, pinned here for traceability)**:
- [ ] T292 Theme smoke test: verify Dark/Light/Purple for BLOG admin routes
- [ ] T293 Responsive smoke test: 320 / 375 / 768 / 1024 / 1440
- [ ] T294 Accessibility smoke test: focus states, keyboard nav for modals, contrast sanity

### Phase 9.E: BLOG Backend Implementation (E2E gaps from audit)

**Blocker (2026-02-01)**: BLOG/Media backend implementation targets (Prisma models + API routes) referenced below are not present in this workspace; see `DOC/Features/BLOG/Audit Report/blog-admin-scope-mismatch-2026-02-01.md`.

**SOT**:
- E2E current-state audit: `DOC/Features/BLOG/Audit Report/CURRENT-STATE-E2E-AUDIT.md`
- Backend plan: `DOC/Features/BLOG/Backend/BACKEND-PLAN.md`
- Test specs: `DOC/Features/BLOG/Backend/BACKEND-TEST-SPECS.md`

**Implementation tasks (remaining, already present; pinned here to avoid drift)**:
- [ ] TB030 Create Prisma migration for new models (BlogAuthor, BlogComment, MediaAsset, MediaFolder)
- [ ] TB031 Implement Authors API endpoints
- [ ] TB032 Implement Comments API endpoints
- [ ] TB033 Implement Media Library API endpoints
- [ ] TB034 Implement Media Folders API endpoints
- [ ] TB035 Create S3 upload service for media files
- [ ] TB036 Connect frontend components to new APIs
- [ ] TB040 Run unit tests
- [ ] TB041 Run integration tests
- [ ] TB042 Run E2E tests
- [ ] TB043 Manual validation of all UI flows
- [ ] TB044 Create validation report (`DOC/Features/BLOG/Backend/BACKEND-VALIDATION.md`)

### Phase 9.F: Storage Decoupling (No “replit”) — Remaining Execution

**Blocker (2026-02-01)**: Storage-decoupling targets referenced below are not present in this workspace; see `DOC/Features/BLOG/Audit Report/blog-admin-scope-mismatch-2026-02-01.md`.

**SOT**:
- Storage decoupling audit: `DOC/Features/BLOG/Audit Report/STORAGE-DECOUPLING-E2E-AUDIT-2026-01-27.md`

**Remaining tasks (already present; pinned here to avoid drift)**:
- [ ] TB060 [P] Add a safety baseline commit (docs only) before code changes
- [ ] TB061 Update Media upload presign to use S3 helpers (no “replit” references)
- [ ] TB062 Remove all “replit”-named code and artifacts
- [ ] TB063 Clean config and references after deletion
- [ ] TB064 Run gates (Typecheck + Build)

