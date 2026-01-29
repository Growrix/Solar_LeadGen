# BLOG Admin — Editor + Preview Theme Migration Audit (T230)

Date: 2026-01-25

## Scope
- `src/components/admin/blog/editor/AdminPostEditorClient.tsx`
- `src/components/admin/blog/editor/AdminPostPreviewClient.tsx`
- Rendered children already migrated previously:
  - `src/components/admin/blog/shared/MediaPickerModal.tsx`
  - `src/components/admin/blog/shared/ConfirmationModal.tsx`

## Logic Preservation Checklist (must remain unchanged)
- Load existing post by id, show not-found and error states.
- Create draft when new, update existing draft, persist `postId` and route replace.
- Slug auto-generation until user manually edits slug.
- Publish now / schedule / archive flows and their loading/disabled states.
- Schedule modal open/close and datetime-local conversions.
- Media picker open/close and selecting cover image updates draft.
- Preview link computed only when `postId` exists.
- Preview client: fetch post, render cover, title, excerpt, and `post.content` HTML via `dangerouslySetInnerHTML`.

## Theme Migration Notes
- UI-only refactor: replaced hardcoded Tailwind colors and raw typography utilities with semantic theme tokens (background/surface/border/foreground + status tokens).
- No changes to state, handlers, API calls, validation, or data flow.

## Verification
- Required 6 scans were run pre-migration and showed many forbidden matches.
- Post-migration: re-run the 6 scans on each file and confirm 0 matches.
- Gate checks: `npx tsc --noEmit` and `npm run build` should pass.
