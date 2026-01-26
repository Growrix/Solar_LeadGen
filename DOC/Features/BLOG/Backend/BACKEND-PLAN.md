# Blog Feature Backend Plan

**Plan Date:** 2026-01-26  
**Based On:** `DOC/Features/BLOG/Audit Report/CURRENT-STATE-E2E-AUDIT.md`  
**Planner:** AI Agent

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Data Model Plan](#2-data-model-plan)
3. [API Contract Plan](#3-api-contract-plan)
4. [Public Pages E2E Wiring](#4-public-pages-e2e-wiring)
5. [Admin Flows E2E Wiring](#5-admin-flows-e2e-wiring)
6. [Audit Logging Requirements](#6-audit-logging-requirements)
7. [Scheduling/Automation](#7-schedulingautomation)
8. [Security & Permissions](#8-security--permissions)
9. [Testing Plan](#9-testing-plan)
10. [UI-to-Backend E2E Test Matrix](#10-ui-to-backend-e2e-test-matrix)
11. [Rollback & Recovery Plan](#11-rollback--recovery-plan)
12. [Observability & Monitoring](#12-observability--monitoring)
13. [Migration Testing Plan](#13-migration-testing-plan)
14. [Legacy/Orphaned Logic](#14-legacyorphaned-logic)
15. [Documentation Update Plan](#15-documentation-update-plan)
16. [Risks, Dependencies & Open Questions](#16-risks-dependencies--open-questions)
17. [Implementation Priority](#17-implementation-priority)

---

## 1. Executive Summary

### Scope

This backend plan covers the implementation of missing backend functionality for the Blog Feature and Media Library:

**In Scope:**
- Comments backend (CRUD, moderation, bulk operations)
- Authors backend (CRUD, status management)
- Media Library backend (CRUD, file storage, folders, trash, bulk operations)
- Public comments API (read/submit)

**Exclusions:**
- No changes to existing Posts/Categories/Tags API (already complete)
- No frontend changes (UI already exists)
- No destructive migrations
- No database resets

### Minimal Path to Ship

1. **Phase 1:** Add Prisma models (additive migration)
2. **Phase 2:** Implement Authors API (simplest, no file handling)
3. **Phase 3:** Implement Comments API (depends on posts)
4. **Phase 4:** Implement Media Library API with S3 integration
5. **Phase 5:** Connect existing UI components to new APIs

### Key Constraints

- All migrations must be additive and backward-compatible
- No dropping, truncating, or overwriting existing data
- All changes must be auditable and testable
- Zero-downtime deployments required

---

## 2. Data Model Plan

### New Prisma Models

#### BlogAuthor

```prisma
enum BlogAuthorStatus {
  ACTIVE
  INACTIVE
}

model BlogAuthor {
  id          String           @id @default(cuid())
  name        String
  email       String           @unique
  bio         String           @default("")
  avatarUrl   String           @default("")
  status      BlogAuthorStatus @default(ACTIVE)
  socialLinks Json?
  userId      String?
  user        User?            @relation(fields: [userId], references: [id], onDelete: SetNull)
  posts       BlogPost[]       @relation("BlogAuthorPosts")
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([status])
  @@index([email])
  @@map("blog_authors")
}
```

**Migration Notes:**
- Link to existing User model is optional (for external authors)
- Update BlogPost to support both authorId (User) and blogAuthorId (BlogAuthor)
- Add `blogAuthorId` field to BlogPost as nullable

#### BlogComment

```prisma
enum BlogCommentStatus {
  PENDING
  APPROVED
  REJECTED
  SPAM
}

model BlogComment {
  id          String             @id @default(cuid())
  postId      String
  post        BlogPost           @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorName  String
  authorEmail String
  content     String
  status      BlogCommentStatus  @default(PENDING)
  ipAddress   String?
  userAgent   String?
  parentId    String?
  parent      BlogComment?       @relation("CommentReplies", fields: [parentId], references: [id], onDelete: SetNull)
  replies     BlogComment[]      @relation("CommentReplies")
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  @@index([postId])
  @@index([status])
  @@index([parentId])
  @@index([createdAt])
  @@map("blog_comments")
}
```

**Migration Notes:**
- Add relation to BlogPost model
- Supports nested replies (parentId)
- Track IP/UserAgent for spam detection

#### MediaAsset

```prisma
enum MediaAssetType {
  IMAGE
  VIDEO
  DOCUMENT
}

enum MediaAssetStatus {
  ACTIVE
  TRASHED
}

model MediaAsset {
  id           String            @id @default(cuid())
  name         String
  type         MediaAssetType
  url          String
  s3Key        String            @unique
  size         Int
  dimensions   String?
  mimeType     String
  altText      String            @default("")
  caption      String            @default("")
  tags         String[]
  folderId     String?
  folder       MediaFolder?      @relation(fields: [folderId], references: [id], onDelete: SetNull)
  status       MediaAssetStatus  @default(ACTIVE)
  uploadedById String
  uploadedBy   User              @relation(fields: [uploadedById], references: [id], onDelete: Restrict)
  trashedAt    DateTime?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  @@index([folderId])
  @@index([status])
  @@index([type])
  @@index([uploadedById])
  @@index([createdAt])
  @@map("media_assets")
}
```

#### MediaFolder

```prisma
model MediaFolder {
  id        String        @id @default(cuid())
  name      String
  parentId  String?
  parent    MediaFolder?  @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children  MediaFolder[] @relation("FolderHierarchy")
  assets    MediaAsset[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@unique([parentId, name])
  @@index([parentId])
  @@map("media_folders")
}
```

### Model Updates

#### User Model (Add Relations)

```prisma
model User {
  // ... existing fields ...
  mediaAssets   MediaAsset[]
  blogAuthors   BlogAuthor[]
}
```

#### BlogPost Model (Add Relations)

```prisma
model BlogPost {
  // ... existing fields ...
  comments      BlogComment[]
  blogAuthorId  String?
  blogAuthor    BlogAuthor?   @relation("BlogAuthorPosts", fields: [blogAuthorId], references: [id], onDelete: SetNull)
}
```

### Migration Strategy

1. **Migration 1:** Add BlogAuthor model
2. **Migration 2:** Add BlogComment model + BlogPost relation
3. **Migration 3:** Add MediaFolder model
4. **Migration 4:** Add MediaAsset model

All migrations are additive - no existing data affected.

---

## 3. API Contract Plan

### Authors API

#### GET /api/admin/blog/authors

**Auth:** `requireAdmin`

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by ACTIVE/INACTIVE |
| q | string | Search by name/email |

**Response:**
```typescript
{
  authors: Array<{
    id: string;
    name: string;
    email: string;
    bio: string;
    avatarUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
    socialLinks: Record<string, string> | null;
    postsCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

#### POST /api/admin/blog/authors

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, string>;
}
```

**Response:** `{ author: Author }` (201)

**Errors:**
- 400: name/email required
- 409: email already exists

#### GET /api/admin/blog/authors/[id]

**Auth:** `requireAdmin`

**Response:** `{ author: Author }`

**Errors:**
- 404: not found

#### PATCH /api/admin/blog/authors/[id]

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  socialLinks?: Record<string, string>;
}
```

**Response:** `{ author: Author }`

#### DELETE /api/admin/blog/authors/[id]

**Auth:** `requireAdmin`

**Behavior:** Soft-delete (set status to INACTIVE)

**Response:** `{ success: true }`

---

### Comments API

#### GET /api/admin/blog/comments

**Auth:** `requireAdmin`

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by PENDING/APPROVED/REJECTED/SPAM |
| postId | string | Filter by post |
| q | string | Search by content/author |

**Response:**
```typescript
{
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
  };
  comments: Array<{
    id: string;
    postId: string;
    postTitle: string;
    postSlug: string;
    authorName: string;
    authorEmail: string;
    content: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

#### PATCH /api/admin/blog/comments/[id]

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  content?: string;
}
```

**Response:** `{ comment: Comment }`

#### DELETE /api/admin/blog/comments/[id]

**Auth:** `requireAdmin`

**Behavior:** Hard delete

**Response:** `{ success: true }`

#### POST /api/admin/blog/comments/bulk

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  ids: string[];
  action: 'approve' | 'reject' | 'spam' | 'delete';
}
```

**Response:** `{ success: true, count: number }`

---

### Public Comments API

#### GET /api/blog/posts/[slug]/comments

**Auth:** None

**Response:**
```typescript
{
  comments: Array<{
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
    replies: Array<{ ... }>;
  }>;
}
```

**Note:** Only returns APPROVED comments

#### POST /api/blog/posts/[slug]/comments

**Auth:** None (rate-limited)

**Request:**
```typescript
{
  authorName: string;
  authorEmail: string;
  content: string;
  parentId?: string;
}
```

**Response:** `{ comment: { id, message: 'Comment submitted for review' } }` (201)

---

### Media Library API

#### GET /api/admin/media

**Auth:** `requireAdmin`

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| folderId | string | Filter by folder (null for root) |
| type | string | Filter by IMAGE/VIDEO/DOCUMENT |
| status | string | Filter by ACTIVE/TRASHED |
| q | string | Search by name |
| dateFrom | string | Date range start |
| dateTo | string | Date range end |

**Response:**
```typescript
{
  assets: Array<{
    id: string;
    name: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    url: string;
    size: number;
    dimensions: string | null;
    mimeType: string;
    altText: string;
    caption: string;
    tags: string[];
    folderId: string | null;
    status: 'ACTIVE' | 'TRASHED';
    trashedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  folders: Array<{
    id: string;
    name: string;
    parentId: string | null;
    assetCount: number;
  }>;
}
```

#### POST /api/admin/media

**Auth:** `requireAdmin`

**Content-Type:** `multipart/form-data`

**Request:**
```
file: File
folderId?: string
altText?: string
caption?: string
tags?: string (comma-separated)
```

**Response:** `{ asset: MediaAsset }` (201)

**Processing:**
1. Validate file type/size
2. Generate unique S3 key
3. Upload to S3
4. Extract dimensions (images)
5. Create database record

#### GET /api/admin/media/[id]

**Auth:** `requireAdmin`

**Response:** `{ asset: MediaAsset }`

#### PATCH /api/admin/media/[id]

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  name?: string;
  altText?: string;
  caption?: string;
  tags?: string[];
  folderId?: string | null;
}
```

**Response:** `{ asset: MediaAsset }`

#### DELETE /api/admin/media/[id]

**Auth:** `requireAdmin`

**Behavior:** Move to trash (set status = TRASHED, trashedAt = now())

**Response:** `{ success: true }`

#### POST /api/admin/media/[id]/restore

**Auth:** `requireAdmin`

**Behavior:** Restore from trash (set status = ACTIVE, trashedAt = null)

**Response:** `{ asset: MediaAsset }`

#### DELETE /api/admin/media/[id]/permanent

**Auth:** `requireAdmin`

**Behavior:** 
1. Delete from S3
2. Delete database record

**Response:** `{ success: true }`

#### POST /api/admin/media/[id]/replace

**Auth:** `requireAdmin`

**Content-Type:** `multipart/form-data`

**Request:**
```
file: File
```

**Behavior:**
1. Delete old file from S3
2. Upload new file
3. Update database record

**Response:** `{ asset: MediaAsset }`

---

### Bulk Media Operations

#### POST /api/admin/media/bulk/move

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  ids: string[];
  folderId: string | null;
}
```

**Response:** `{ success: true, count: number }`

#### POST /api/admin/media/bulk/edit

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  ids: string[];
  altText?: string;
  caption?: string;
  tags?: string[];
}
```

**Response:** `{ success: true, count: number }`

#### POST /api/admin/media/bulk/delete

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  ids: string[];
  permanent?: boolean;
}
```

**Response:** `{ success: true, count: number }`

---

### Media Folders API

#### GET /api/admin/media/folders

**Auth:** `requireAdmin`

**Response:**
```typescript
{
  folders: Array<{
    id: string;
    name: string;
    parentId: string | null;
    assetCount: number;
    childCount: number;
  }>;
}
```

#### POST /api/admin/media/folders

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  name: string;
  parentId?: string;
}
```

**Response:** `{ folder: MediaFolder }` (201)

#### PATCH /api/admin/media/folders/[id]

**Auth:** `requireAdmin`

**Request:**
```typescript
{
  name?: string;
  parentId?: string | null;
}
```

**Response:** `{ folder: MediaFolder }`

#### DELETE /api/admin/media/folders/[id]

**Auth:** `requireAdmin`

**Behavior:** 
1. Move all assets in folder to parent folder (or root)
2. Delete folder

**Response:** `{ success: true }`

---

## 4. Public Pages E2E Wiring

### Blog Post Page with Comments

| Page | Component | Backend Endpoint | Caching |
|------|-----------|------------------|---------|
| `/blog/[slug]` | Comments section | GET /api/blog/posts/[slug]/comments | ISR 5min |
| `/blog/[slug]` | Comment form | POST /api/blog/posts/[slug]/comments | None |

### Slug Rules

- Comments inherit post slug rules
- No additional slug requirements

---

## 5. Admin Flows E2E Wiring

### Content Manager - Comments Tab

| UI Action | API Call | State Transition |
|-----------|----------|------------------|
| Load comments | GET /api/admin/blog/comments | - |
| Filter by status | GET /api/admin/blog/comments?status=X | - |
| Approve comment | PATCH /api/admin/blog/comments/[id] {status: 'APPROVED'} | PENDING → APPROVED |
| Reject comment | PATCH /api/admin/blog/comments/[id] {status: 'REJECTED'} | PENDING → REJECTED |
| Mark spam | PATCH /api/admin/blog/comments/[id] {status: 'SPAM'} | ANY → SPAM |
| Delete comment | DELETE /api/admin/blog/comments/[id] | ANY → DELETED |
| Bulk approve | POST /api/admin/blog/comments/bulk {action: 'approve'} | Multiple PENDING → APPROVED |

### Content Manager - Authors Tab

| UI Action | API Call | State Transition |
|-----------|----------|------------------|
| Load authors | GET /api/admin/blog/authors | - |
| Add author | POST /api/admin/blog/authors | - → ACTIVE |
| Edit author | PATCH /api/admin/blog/authors/[id] | - |
| Deactivate author | PATCH /api/admin/blog/authors/[id] {status: 'INACTIVE'} | ACTIVE → INACTIVE |
| Reactivate author | PATCH /api/admin/blog/authors/[id] {status: 'ACTIVE'} | INACTIVE → ACTIVE |

### Media Library

| UI Action | API Call | State Transition |
|-----------|----------|------------------|
| Load media | GET /api/admin/media | - |
| Switch to trash | GET /api/admin/media?status=TRASHED | - |
| Upload file | POST /api/admin/media | - → ACTIVE |
| Edit metadata | PATCH /api/admin/media/[id] | - |
| Move to folder | PATCH /api/admin/media/[id] {folderId} | - |
| Move to trash | DELETE /api/admin/media/[id] | ACTIVE → TRASHED |
| Restore | POST /api/admin/media/[id]/restore | TRASHED → ACTIVE |
| Permanent delete | DELETE /api/admin/media/[id]/permanent | TRASHED → DELETED |
| Create folder | POST /api/admin/media/folders | - |
| Rename folder | PATCH /api/admin/media/folders/[id] | - |
| Delete folder | DELETE /api/admin/media/folders/[id] | - |
| Bulk move | POST /api/admin/media/bulk/move | - |
| Bulk edit | POST /api/admin/media/bulk/edit | - |
| Bulk delete | POST /api/admin/media/bulk/delete | - |

---

## 6. Audit Logging Requirements

### Actions to Log

| Entity | Action | Actor | Metadata |
|--------|--------|-------|----------|
| BlogComment | CREATE | System (public) | postId, authorEmail, ipAddress |
| BlogComment | UPDATE | Admin userId | previousStatus, newStatus |
| BlogComment | DELETE | Admin userId | commentId |
| BlogComment | BULK_MODERATE | Admin userId | ids[], action |
| BlogAuthor | CREATE | Admin userId | - |
| BlogAuthor | UPDATE | Admin userId | changedFields[] |
| BlogAuthor | STATUS_CHANGE | Admin userId | previousStatus, newStatus |
| MediaAsset | UPLOAD | Admin userId | filename, size, folderId |
| MediaAsset | UPDATE | Admin userId | changedFields[] |
| MediaAsset | TRASH | Admin userId | - |
| MediaAsset | RESTORE | Admin userId | - |
| MediaAsset | DELETE | Admin userId | s3Key |
| MediaAsset | BULK_MOVE | Admin userId | ids[], targetFolderId |
| MediaAsset | BULK_DELETE | Admin userId | ids[] |
| MediaFolder | CREATE | Admin userId | parentId |
| MediaFolder | RENAME | Admin userId | oldName, newName |
| MediaFolder | DELETE | Admin userId | movedAssetCount |

### Audit Log Schema

```prisma
model BlogMediaAuditLog {
  id        String   @id @default(cuid())
  entity    String
  entityId  String
  action    String
  actorId   String?
  actor     User?    @relation(fields: [actorId], references: [id], onDelete: SetNull)
  metadata  Json?
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([entity, entityId])
  @@index([action])
  @@index([actorId])
  @@index([createdAt])
  @@map("blog_media_audit_logs")
}
```

---

## 7. Scheduling/Automation

### Comment Auto-Moderation (Future)

- Auto-approve comments from previously approved authors
- Auto-reject comments with spam keywords
- Rate limiting by IP address

### Media Trash Cleanup (Future)

- Auto-permanently-delete items in trash > 30 days
- Cron job: daily

---

## 8. Security & Permissions

### Role Matrix

| Endpoint | ADMIN | HOMEOWNER | INSTALLER | PUBLIC |
|----------|-------|-----------|-----------|--------|
| GET /api/admin/blog/authors | ✅ | ❌ | ❌ | ❌ |
| POST /api/admin/blog/authors | ✅ | ❌ | ❌ | ❌ |
| GET /api/admin/blog/comments | ✅ | ❌ | ❌ | ❌ |
| POST /api/admin/blog/comments/bulk | ✅ | ❌ | ❌ | ❌ |
| GET /api/admin/media | ✅ | ❌ | ❌ | ❌ |
| POST /api/admin/media | ✅ | ❌ | ❌ | ❌ |
| GET /api/blog/posts/[slug]/comments | ✅ | ✅ | ✅ | ✅ |
| POST /api/blog/posts/[slug]/comments | ✅ | ✅ | ✅ | ✅ (rate-limited) |

### Input Validation

All endpoints must validate:
- String fields: max length, sanitization
- Email fields: valid format
- File uploads: type whitelist, max size
- IDs: valid cuid format

### Rate Limiting

Public comment submission:
- 5 comments per IP per hour
- 1 comment per email per 5 minutes

---

## 9. Testing Plan

### Unit Tests

| Test File | Coverage |
|-----------|----------|
| `tests/unit/blog/authors.test.ts` | Author CRUD, validation |
| `tests/unit/blog/comments.test.ts` | Comment CRUD, moderation logic |
| `tests/unit/media/assets.test.ts` | Media CRUD, metadata handling |
| `tests/unit/media/folders.test.ts` | Folder CRUD, hierarchy |
| `tests/unit/media/upload.test.ts` | File upload, S3 integration mocks |

### Integration Tests

| Test File | Coverage |
|-----------|----------|
| `tests/integration/blog/authors-api.test.ts` | Authors API with DB |
| `tests/integration/blog/comments-api.test.ts` | Comments API with DB |
| `tests/integration/media/media-api.test.ts` | Media API with DB + S3 mock |
| `tests/integration/media/folders-api.test.ts` | Folders API with DB |

### E2E Tests

| Test File | Coverage |
|-----------|----------|
| `tests/e2e/blog-comments.spec.ts` | Comment moderation flow |
| `tests/e2e/blog-authors.spec.ts` | Author management flow |
| `tests/e2e/media-library.spec.ts` | Media upload, organize, delete |
| `tests/e2e/public-comments.spec.ts` | Public comment submission |

---

## 10. UI-to-Backend E2E Test Matrix

| UI Element | Endpoint | Test Case | Priority |
|------------|----------|-----------|----------|
| Authors list table | GET /api/admin/blog/authors | List loads with data | P1 |
| Add Author button → modal save | POST /api/admin/blog/authors | Creates author | P1 |
| Author row edit | PATCH /api/admin/blog/authors/[id] | Updates author | P1 |
| Author status toggle | PATCH /api/admin/blog/authors/[id] | Status changes | P1 |
| Comments list table | GET /api/admin/blog/comments | List loads with data | P1 |
| Comment approve button | PATCH /api/admin/blog/comments/[id] | Status → APPROVED | P1 |
| Comment reject button | PATCH /api/admin/blog/comments/[id] | Status → REJECTED | P1 |
| Bulk approve | POST /api/admin/blog/comments/bulk | Multiple approved | P1 |
| Media grid | GET /api/admin/media | Assets displayed | P1 |
| Upload button → modal | POST /api/admin/media | File uploaded to S3 | P1 |
| Media details modal save | PATCH /api/admin/media/[id] | Metadata updated | P1 |
| Trash button | DELETE /api/admin/media/[id] | Status → TRASHED | P1 |
| Restore button | POST /api/admin/media/[id]/restore | Status → ACTIVE | P1 |
| Permanent delete | DELETE /api/admin/media/[id]/permanent | Deleted from S3 | P1 |
| Create folder | POST /api/admin/media/folders | Folder created | P1 |
| Drag to folder | PATCH /api/admin/media/[id] | folderId updated | P1 |
| Bulk move | POST /api/admin/media/bulk/move | Multiple moved | P1 |
| Public comment form | POST /api/blog/posts/[slug]/comments | Comment submitted | P2 |
| Public comments display | GET /api/blog/posts/[slug]/comments | Comments displayed | P2 |

---

## 11. Rollback & Recovery Plan

### Database Rollback

All migrations are additive:
- New tables can be dropped without affecting existing data
- No foreign key changes to existing tables

### Rollback Steps

1. **Prisma:** `npx prisma migrate resolve --rolled-back <migration_name>`
2. **Code:** Revert to previous commit
3. **S3:** Media files remain (orphaned but recoverable)

### Recovery Procedures

| Failure | Recovery |
|---------|----------|
| Failed migration | Run rollback migration |
| S3 upload failure | Retry with exponential backoff |
| Orphaned DB records | Run cleanup script |
| Orphaned S3 files | Run reconciliation script |

---

## 12. Observability & Monitoring

### Logging

| Event | Log Level | Details |
|-------|-----------|---------|
| API request start | DEBUG | method, path, userId |
| API request complete | INFO | method, path, status, duration |
| API error | ERROR | method, path, error, stack |
| S3 upload start | DEBUG | filename, size |
| S3 upload complete | INFO | s3Key, duration |
| S3 upload error | ERROR | error, filename |

### Metrics (Future)

| Metric | Type | Description |
|--------|------|-------------|
| blog_comments_created | Counter | Comments submitted |
| blog_comments_moderated | Counter | Comments moderated |
| media_uploads_total | Counter | Files uploaded |
| media_uploads_size_bytes | Histogram | Upload sizes |
| media_s3_latency_ms | Histogram | S3 operation latency |

### Alerting (Future)

| Alert | Condition | Severity |
|-------|-----------|----------|
| High error rate | >5% requests fail | Critical |
| S3 unavailable | S3 errors > 10/min | Critical |
| Slow uploads | p95 latency > 30s | Warning |

---

## 13. Migration Testing Plan

### Pre-Migration

1. Backup database
2. Run migration in staging
3. Verify new tables created
4. Verify existing data intact

### Dry-Run Steps

```bash
# Check migration status
npx prisma migrate status

# Generate migration (do not apply)
npx prisma migrate dev --create-only --name add_blog_comments_authors_media

# Review generated SQL
cat prisma/migrations/<timestamp>_add_blog_comments_authors_media/migration.sql

# Validate migration
npx prisma validate
```

### Rollback Validation

```bash
# Test rollback capability
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 14. Legacy/Orphaned Logic

### Identified Orphaned Code

None found during audit.

### Cleanup Required

- Remove mock data from frontend components after backend integration
- Update component types to match API response shapes

---

## 15. Documentation Update Plan

### Files to Update

| File | Update Required |
|------|-----------------|
| `DOC/Features/BLOG/tasks.md` | Add backend implementation tasks |
| `DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/architecture/api-architecture.md` | Add new endpoints |
| `DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/architecture/database-schema.md` | Add new models |
| `README.md` | Add S3 configuration instructions |

### New Files to Create

| File | Purpose |
|------|---------|
| `DOC/Features/BLOG/Backend/BACKEND-TEST-SPECS.md` | Test specifications |
| `DOC/Features/BLOG/Backend/BACKEND-VALIDATION.md` | Validation results |

---

## 16. Risks, Dependencies & Open Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| S3 integration complexity | Medium | High | Use existing S3 patterns from InstallDocument |
| Large file uploads timeout | Medium | Medium | Implement chunked uploads |
| Comment spam | High | Low | Rate limiting + moderation queue |
| Migration failure | Low | High | Test in staging, backup first |

### Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| AWS S3 access | **Exists** (InstallDocument uses it) | Media uploads |
| Prisma | **Exists** | Database access |
| NextAuth session | **Exists** | Admin authentication |

### Open Questions

1. **Q:** Should authors be linked to User accounts?
   **A:** Optional - external authors don't need User accounts

2. **Q:** Should we support comment editing after submission?
   **A:** No - admin can edit, public cannot

3. **Q:** Max file size for uploads?
   **A:** Propose 50MB (configurable)

4. **Q:** Supported file types?
   **A:** Images (jpg, png, webp, gif), Videos (mp4, webm), Documents (pdf, doc, docx)

---

## 17. Implementation Priority

### Phase 1: Database Models (Priority: P0)

1. Create Prisma migration with all new models
2. Run migration
3. Verify schema

### Phase 2: Authors Backend (Priority: P1)

1. Create `/api/admin/blog/authors` routes
2. Create `/api/admin/blog/authors/[id]` routes
3. Add unit tests
4. Connect frontend

### Phase 3: Comments Backend (Priority: P1)

1. Create `/api/admin/blog/comments` routes
2. Create `/api/admin/blog/comments/[id]` routes
3. Create `/api/admin/blog/comments/bulk` route
4. Create `/api/blog/posts/[slug]/comments` routes
5. Add unit tests
6. Connect frontend

### Phase 4: Media Library Backend (Priority: P1)

1. Create media upload service (S3 integration)
2. Create `/api/admin/media` routes
3. Create `/api/admin/media/[id]` routes
4. Create `/api/admin/media/folders` routes
5. Create bulk operation routes
6. Add unit tests
7. Connect frontend

### Phase 5: Testing & Validation (Priority: P1)

1. Run all tests
2. E2E validation
3. Create validation report

---

**Plan Complete.**

*This plan is based on the audit report: `DOC/Features/BLOG/Audit Report/CURRENT-STATE-E2E-AUDIT.md`*
