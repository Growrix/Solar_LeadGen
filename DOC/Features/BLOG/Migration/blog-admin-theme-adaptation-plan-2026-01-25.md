# BLOG Admin Theme Adaptation Plan (2026-01-25)

## Objective
Adapt BLOG admin UI to the repo’s semantic theme/token system (Dark/Light/Purple) without changing behavior.

## Constraints (Non-Negotiable)
- Theme-only changes: **no state/logic/API/validation changes**.
- No hardcoded Tailwind colors (`slate`, `gray`, `white`, `black`, direct status colors).
- No raw colors (`rgb(...)`, `rgba(...)`, hex), no `dark:` variants.
- No raw typography utilities (`text-sm`, `text-lg`, `font-bold`, etc.). Use semantic typography tokens.

## System Contract (What to Use)
- Theme class applied to `<html>`: `theme-dark`, `theme-light`, `theme-purple`, `theme-system`.
- Semantic Tailwind classes mapped to CSS variables via `tailwind.config.js`:
  - Colors: `bg-background`, `bg-surface`, `text-foreground`, `border-border`, `text-success|warning|error|info`, etc.
  - Typography: `text-heading-*`, `text-body-*` (exact set defined in Tailwind config).

## Component Tree (Target)

### US1 Content Manager
- `src/components/admin/blog/content-manager/ContentManagerHub.tsx`
- `src/components/admin/blog/content-manager/PostList.tsx`
- `src/components/admin/blog/content-manager/CategoryList.tsx`
- `src/components/admin/blog/content-manager/TagList.tsx`
- `src/components/admin/blog/content-manager/CommentsList.tsx`
- `src/components/admin/blog/content-manager/AuthorList.tsx`

Shared modals / UI:
- `src/components/admin/blog/shared/ModerateCommentModal.tsx`
- `src/components/admin/blog/shared/BulkModerateModal.tsx`
- `src/components/admin/blog/shared/ManageAuthorModal.tsx`
- `src/components/admin/blog/shared/AuthorPreviewModal.tsx`
- `src/components/admin/blog/shared/ManageTaxonomyModal.tsx`
- `src/components/admin/blog/shared/BulkTagModal.tsx`
- `src/components/admin/blog/shared/ConfirmationModal.tsx`

Editor:
- `src/components/admin/blog/editor/AdminPostEditorClient.tsx`
- `src/components/admin/blog/editor/AdminPostPreviewClient.tsx`

### US2 Media Library
- `src/components/admin/blog/media/MediaLibrary.tsx`
- `src/components/admin/blog/media/MediaDetailsModal.tsx`
- `src/components/admin/blog/media/UploadMediaModal.tsx`
- `src/components/admin/blog/media/MoveMediaModal.tsx`
- `src/components/admin/blog/media/BulkEditMediaModal.tsx`
- `src/components/admin/blog/shared/MediaPickerModal.tsx`
- `src/components/admin/blog/media/SkeletonMediaGrid.tsx`
- `src/components/admin/blog/shared/SkeletonAdminTable.tsx`

## Execution Order (Recommended)
1. Shared primitives first (modals, tables, skeletons) to reduce repetition.
2. Content Manager lists and hub.
3. Editor surfaces.
4. Media Library and all media-related modals.

## Definition of Done (Per Component Tree)
A component tree is complete only when:
- It renders correctly in Dark/Light/Purple.
- It has **0 matches** for each of the verification patterns across the component and all child components it renders.
- No regressions in interactions (open/close modals, selections, filters, uploads, navigation).

## Verification Commands (PowerShell)
Run for each component file being migrated (repeat for child files):

1) Hardcoded gray/slate colors
- `Select-String -Path "<file>" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"`

2) Dark mode variants
- `Select-String -Path "<file>" -Pattern "dark:"`

3) RGB/HEX colors
- `Select-String -Path "<file>" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"`

4) Hardcoded white/black
- `Select-String -Path "<file>" -Pattern "text-white|bg-white|text-black|bg-black"`

5) Hardcoded typography
- `Select-String -Path "<file>" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"`

6) Manual responsive typography
- `Select-String -Path "<file>" -Pattern "sm:text-|md:text-|lg:text-"`

## Build Gates (Phase End)
- `npx tsc --noEmit`
- `npm run build`

## Notes / Known Hotspots
- `MediaDetailsModal.tsx` uses a raw `rgba(...)` overlay via an arbitrary shadow class and must be converted to a tokenized overlay/shadow approach.
