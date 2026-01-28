# Blog Feature & Media Library: Storage Decoupling E2E Audit (No “replit”)

**Audit Date:** 2026-01-27  
**Auditor:** AI Agent  
**Audit Scope:** Blog Feature (Admin + Public) + Media Library (Admin), with focus on eliminating all “replit”-named code/paths while preserving functionality

---

## Table of Contents

1. [Scope & Entry Points](#scope--entry-points)
2. [Frontend (Routes, Pages, Components, Assets)](#frontend-routes-pages-components-assets)
3. [Backend/API (Routes, Auth, Contracts, Middleware, Adapters)](#backendapi-routes-auth-contracts-middleware-adapters)
4. [Data Layer (Prisma / DB)](#data-layer-prisma--db)
5. [Business Rules & State Transitions](#business-rules--state-transitions)
6. [Integrations & Automation](#integrations--automation)
7. [Risks, Coupling Map & Config](#risks-coupling-map--config)
8. [Test Coverage & Documentation](#test-coverage--documentation)
9. [Error Handling & Edge Cases](#error-handling--edge-cases)
10. ["What's Already There" Inventory (Anti-Duplication)](#whats-already-there-inventory-anti-duplication)
11. [UI-to-Backend Mapping Table](#ui-to-backend-mapping-table)
12. [Conditional UI/Role/Feature Flag Coverage](#conditional-uirolefeature-flag-coverage)
13. [Additional Audit Requirements](#additional-audit-requirements)
14. [Audit Verification Checklist](#audit-verification-checklist)

---

## Scope & Entry Points

### Feature: Blog + Media Library

**Roles**
- `ADMIN`: Full access to Blog Content Manager and Media Library
- `PUBLIC` (unauthenticated): Read-only access to published blog posts

**Admin Entry Routes**
| Route | Purpose | Status |
|---|---|---|
| `/admin/blog/content-manager` | Content Manager hub (Posts/Categories/Tags/Comments/Authors tabs) | **Exists** |
| `/admin/blog/media` | Media Library | **Exists** |
| `/admin/blog/new` | Create new blog post | **Exists** |
| `/admin/blog/[id]` | Edit blog post | **Exists** |
| `/admin/blog/[id]/preview` | Preview blog post | **Exists** |

**Public Entry Routes**
| Route | Purpose | Status |
|---|---|---|
| `/blog` | Blog listing page | **Exists** |
| `/blog/[slug]` | Individual blog post page | **Exists** |

**In Scope**
- Admin blog content manager + editor/preview
- Admin media library upload + asset CRUD + folder CRUD
- Public blog pages + public blog APIs
- Storage/presign upload implementation (primary target)

**Out of Scope**
- Any unrelated installer/news-engine upload paths
- Changing DB schema field names (e.g. `MediaAsset.s3Key`) as part of the “surgical” rename

---

## Frontend (Routes, Pages, Components, Assets)

### Admin Routes & Key Components

| Area | Path | Status |
|---|---|---|
| Blog content manager page | `src/app/admin/blog/content-manager/page.tsx` | **Exists** |
| Blog media page | `src/app/admin/blog/media/page.tsx` | **Exists** |
| Blog editor | `src/components/admin/blog/editor/AdminPostEditorClient.tsx` | **Exists** |
| Media library UI | `src/components/admin/blog/media/MediaLibrary.tsx` | **Exists** |

### Media Upload UI Flow (Current)

**Source:** `src/components/admin/blog/media/MediaLibrary.tsx`
- POST `/api/admin/media/upload` with `{ name, size, contentType }` to get:
  - `uploadURL` (PUT target)
  - `objectPath` (stored as DB field `s3Key`)
  - `publicUrl` (stored as DB field `url`)
- PUT the file to `uploadURL`
- POST `/api/admin/media/assets` to create DB record using `{ url, s3Key: objectPath, ...metadata }`

**Status:** Works when storage backend is configured; has dev-local fallback.

---

## Backend/API (Routes, Auth, Contracts, Middleware, Adapters)

### Auth
- Admin routes use `requireAdmin()`.

### Admin Media Routes (Storage-Relevant)

| Method | Path | Purpose | Status |
|---|---|---|---|
| POST | `/api/admin/media/upload` | Create presigned upload URL + return public URL + object key | **Exists (now S3/local only, Replit integration fully removed)** |
| PUT | `/api/admin/media/upload?local=1&objectPath=...` | Dev-only local upload (writes to `public/uploads/...`) | **Exists** |
| POST | `/api/admin/media/assets` | Create DB record (requires `s3Key`) | **Exists** |

### Public Blog Routes (Storage-Adjacent)
- Public blog APIs do not depend on object storage directly; they consume `coverImageUrl` / `ogImageUrl` URLs stored in DB.

---

## Data Layer (Prisma / DB)

**Key Models (storage-related):**
- `MediaAsset`
  - `url` (public URL)
  - `s3Key` (object key; naming is “S3-ish” but currently used as a generic object key)

**Status:** Schema supports current UI flow. **No DB migration is required** for storage decoupling if we keep using `s3Key` as a generic object key.

---

## Business Rules & State Transitions

### Media Upload
- Enforces max file size 100MB and basic content-type classification (IMAGE/VIDEO/DOCUMENT).
- Current behavior:
  - Primary: presigned upload URL for object storage
  - Fallback (dev-only): local upload into `public/uploads/...` gated by `ALLOW_LOCAL_MEDIA_UPLOADS=true` and non-production

### Media Asset Lifecycle
- Create asset after successful file upload.
- Trash/restore and permanent delete are DB-driven.

---

## Integrations & Automation

### Previous Storage Integration (Removed)
- Used to dynamically import a module under `src/lib/replit_integrations/...` (now deleted).

### Target Storage Integration (Replacement)
- Use existing AWS S3 helper in `src/lib/s3.ts`:
  - `getPresignedUploadUrl(key, contentType)`
  - `getPublicUrlForKey(key)`

**Status:** Replacement utilities exist; not currently wired for Media Library uploads.

---

## Risks, Coupling Map & Config

### Coupling Map (All Replit integration removed)

| Layer | Location | Coupling | Status |
|---|---|---|---|
| API | `src/app/api/admin/media/upload/route.ts` | Now uses S3 helpers only | **Clean** |
| Library | `src/lib/replit_integrations/object_storage/**` | (Deleted) | **Clean** |
| Misc | `.replit_integration_files/**`, `replit.md` | (Deleted) | **Clean** |
| TS Config | `tsconfig.json` excludes `src/lib/replit_integrations/object_storage/routes.ts` | (Cleaned) | **Clean** |

### Required Config for S3 Mode
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- Optional: `AWS_S3_PUBLIC_BASE_URL` (CloudFront or public bucket base)

### Required Config for Dev-Local Mode
- `ALLOW_LOCAL_MEDIA_UPLOADS=true` (non-production only)

### Primary Risks
- If AWS env vars are missing, presign fails; API should return a clear 503 and/or use dev-local fallback when enabled.
- Existing DB field name `s3Key` is a misnomer if local mode is used. This audit recommends keeping it for now (avoid migration) and treating it as a generic “object key”.

---

## Test Coverage & Documentation

### Tests
- No dedicated unit tests were reviewed for `/api/admin/media/upload`.

### Docs
- Existing broader audit: `DOC/Features/BLOG/Audit Report/CURRENT-STATE-E2E-AUDIT.md`.
- This document is a targeted storage-decoupling audit to drive the next implementation phase.

---

## Error Handling & Edge Cases

### Observed / Required Behaviors
- On missing storage backend:
  - If dev-local enabled: return local-mode `uploadURL` + `publicUrl`.
  - Else: return 503 with actionable configuration guidance (AWS or enable local dev uploads).

### Edge Cases
- Empty/invalid filename or contentType → 400.
- File too large (>100MB) → 400.
- PUT upload failure → surfaced as “Upload failed (status)” in UI.

---

## "What's Already There" Inventory (Anti-Duplication)

### Existing building blocks to reuse
- S3 utilities: `src/lib/s3.ts` (presign + public URL helpers)
- Local dev upload path: `src/app/api/admin/media/upload/route.ts` PUT handler

### What NOT to rebuild
- A new DB schema for media storage
- A second storage SDK abstraction layer unless needed for clarity

---

## UI-to-Backend Mapping Table

| UI Surface | Component | Backend Endpoint(s) | DB Model(s) | Status |
|---|---|---|---|---|
| Media upload | `src/components/admin/blog/media/MediaLibrary.tsx` | POST `/api/admin/media/upload` → PUT uploadURL → POST `/api/admin/media/assets` | `MediaAsset` | **Exists; storage backend needs rework** |
| Media list + filters | `src/components/admin/blog/media/MediaLibrary.tsx` | GET `/api/admin/media/assets` | `MediaAsset` | **Exists** |
| Folder tree | `src/components/admin/blog/media/MediaLibrary.tsx` | GET/POST `/api/admin/media/folders` | `MediaFolder` | **Exists** |
| Blog posts (admin) | `src/components/admin/blog/content-manager/PostList.tsx` | `/api/admin/blog/posts` (+ `[id]`) | `BlogPost` | **Exists** |
| Blog posts (public) | `src/app/blog/**` | `/api/blog/posts` (+ `/[slug]`) | `BlogPost` | **Exists** |

---

## Conditional UI/Role/Feature Flag Coverage

| Condition | Location | Behavior | Status |
|---|---|---|---|
| Admin auth required | `requireAdmin()` in admin APIs | Blocks non-admin access | **Exists** |
| Dev-local upload allowed | `ALLOW_LOCAL_MEDIA_UPLOADS=true` and not production | Enables PUT local upload path | **Exists** |

---

## Additional Audit Requirements

### Rename/Removal Requirement (User Requirement)
- No folder/file includes “replit” in its name. (Verified)

### Compatibility Requirement
- Media uploads must keep working:
  - S3 mode when configured
  - Dev-local fallback when explicitly enabled

---

## Audit Verification Checklist

- [x] Remove all code imports referencing `replit_integrations`
- [x] Delete `src/lib/replit_integrations/**`
- [x] Delete `.replit_integration_files/**` and `replit.md`
- [x] Update `/api/admin/media/upload` to use S3 helpers + local fallback
- [x] Ensure `npx tsc --noEmit` passes
- [x] Ensure `npm run build` passes
- [x] Confirm Media Library upload flow still works in dev-local mode
