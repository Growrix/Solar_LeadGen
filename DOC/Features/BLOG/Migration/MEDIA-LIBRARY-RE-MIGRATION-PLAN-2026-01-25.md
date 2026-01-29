# BLOG — Media Library Re-Migration Plan (Prototype → Next.js) (2026-01-25)

## 0. Scope Lock
- **In scope (ONLY):** BLOG Admin Media Library surface.
  - Route: `/admin/blog/media`
  - UI + Modals under `src/components/admin/blog/media/**`
- **Out of scope:** Content Manager, Editor/Preview, non-media admin surfaces.

## 1. Source of Truth (Prototype)
- Primary SOT surface: `DOC/FEATURES/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/AdminMediaLibrary.tsx`
- Related SOT modals:
  - `UploadMediaModal.tsx`
  - `MediaDetailsModal.tsx`
  - `MoveMediaModal.tsx`
  - `BulkEditMediaModal.tsx`
  - `ConfirmationModal.tsx`

## 2. Current Implementation Targets
- Route wrapper: `src/app/admin/blog/media/page.tsx`
- Primary UI: `src/components/admin/blog/media/MediaLibrary.tsx`
- Modals: `src/components/admin/blog/media/{UploadMediaModal,MediaDetailsModal,MoveMediaModal,BulkEditMediaModal}.tsx`

## 3. Re-Migration Strategy (Prototype-first, no assumptions)
- Re-port the prototype layout and controls into the Next.js component(s) verbatim where possible.
- Keep behavior as UI-only stubs where backend contracts are not in place, but ensure:
  - Every action has a deterministic destination (Trash/Restore/Delete Forever)
  - All prototype controls exist and are visible
  - No non-prototype UX “improvements” are introduced

## 4. Implementation Plan (Ordered)

### 4.1 Media Library surface parity
- Implement `library` + `trash` tabs.
- Implement folder system and breadcrumb navigation.
- Implement selection model + floating bulk tray actions:
  - Library: Move, Bulk Edit, Move to Trash
  - Trash: Restore, Delete Forever
- Implement per-item action menu (…): Copy URL, Rename, Replace, Move, Trash/Restore.
- Implement date filter UI and thumbnail size controls as in prototype.

### 4.2 Modal parity
- Update `UploadMediaModal` to match prototype UI (solar styling) and include upload-to-folder selection.
- Update `MediaDetailsModal` to match prototype controls:
  - Rename + Replace
  - Copy URL feedback
  - Image edit mode UI (rotate/flip/crop/scale) as a safe stub (no real processing required)

### 4.3 Verification
- Run `npx tsc --noEmit`
- Run `npm run build`

## 5. Evidence
- After completion, capture a side-by-side checklist (prototype vs Next.js) for:
  - Tabs, folders, filters, selection tray
  - Details modal controls
  - Trash lifecycle (restore/delete forever)
