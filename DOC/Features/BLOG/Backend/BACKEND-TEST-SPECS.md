# Blog Feature Backend Test Specifications

**Created:** 2026-01-26  
**Based On:** `DOC/Features/BLOG/Backend/BACKEND-PLAN.md`

---

## Table of Contents

1. [Test Overview](#1-test-overview)
2. [Unit Tests](#2-unit-tests)
3. [Integration Tests](#3-integration-tests)
4. [E2E Tests](#4-e2e-tests)
5. [Test File Locations](#5-test-file-locations)
6. [Coverage Requirements](#6-coverage-requirements)

---

## 1. Test Overview

### Test Pyramid

| Level | Purpose | Tools | Frequency |
|-------|---------|-------|-----------|
| Unit | Logic correctness in isolation | Vitest | On each commit |
| Integration | API + DB interaction | Vitest + test DB | On PR |
| E2E | Full user flows | Playwright | On PR + nightly |

### Test Principles

- **Deterministic:** No time/random flakiness
- **Fast feedback:** Unit tests < 300ms each
- **Clear naming:** `should <expected>` pattern
- **Isolated:** Use ephemeral test database
- **Traceable:** Reference feature/requirement

---

## 2. Unit Tests

### 2.1 Authors Unit Tests

**File:** `tests/unit/blog/authors.test.ts`

| Test Case | Description | Priority |
|-----------|-------------|----------|
| should validate author name is required | Empty name returns validation error | P1 |
| should validate author email is required | Empty email returns validation error | P1 |
| should validate email format | Invalid email format returns error | P1 |
| should normalize author data | Trim whitespace, lowercase email | P1 |
| should generate correct status transitions | ACTIVE ↔ INACTIVE | P1 |
| should handle social links JSON | Parse and validate social links | P2 |

### 2.2 Comments Unit Tests

**File:** `tests/unit/blog/comments.test.ts`

| Test Case | Description | Priority |
|-----------|-------------|----------|
| should validate comment content is required | Empty content returns error | P1 |
| should validate author name is required | Empty author name returns error | P1 |
| should validate author email format | Invalid email returns error | P1 |
| should sanitize comment content | Strip dangerous HTML | P1 |
| should validate status transitions | PENDING → APPROVED/REJECTED/SPAM | P1 |
| should handle nested replies | parentId validation | P2 |
| should enforce rate limits | IP-based rate limit check | P1 |

### 2.3 Media Assets Unit Tests

**File:** `tests/unit/media/assets.test.ts`

| Test Case | Description | Priority |
|-----------|-------------|----------|
| should validate file type | Only allowed types (image/video/document) | P1 |
| should validate file size | Max 50MB limit | P1 |
| should generate unique S3 key | Unique key generation | P1 |
| should extract image dimensions | Parse width/height from image | P1 |
| should normalize metadata | Trim strings, validate tags array | P1 |
| should handle trash/restore transitions | ACTIVE ↔ TRASHED | P1 |
| should validate folder hierarchy | No circular references | P2 |

### 2.4 Media Folders Unit Tests

**File:** `tests/unit/media/folders.test.ts`

| Test Case | Description | Priority |
|-----------|-------------|----------|
| should validate folder name is required | Empty name returns error | P1 |
| should validate unique name per parent | Duplicate name in same parent | P1 |
| should handle folder hierarchy | Parent-child relationships | P1 |
| should validate no circular references | Prevent folder in own subtree | P2 |

---

## 3. Integration Tests

### 3.1 Authors API Integration Tests

**File:** `tests/integration/blog/authors-api.test.ts`

| Test Case | Description | Priority |
|-----------|-------------|----------|
| GET /api/admin/blog/authors should return all authors | List endpoint works | P1 |
| GET /api/admin/blog/authors?status=ACTIVE should filter | Filter by status | P1 |
| GET /api/admin/blog/authors?q=john should search | Search by name/email | P1 |
| POST /api/admin/blog/authors should create author | Create with valid data | P1 |
| POST /api/admin/blog/authors should reject duplicate email | 409 on duplicate | P1 |
| GET /api/admin/blog/authors/[id] should return author | Get single author | P1 |
| GET /api/admin/blog/authors/[id] should return 404 | Not found handling | P1 |
| PATCH /api/admin/blog/authors/[id] should update | Update fields | P1 |
| DELETE /api/admin/blog/authors/[id] should deactivate | Soft delete | P1 |
| should require admin auth | 401 without auth, 403 for non-admin | P1 |

### 3.2 Comments API Integration Tests

**File:** `tests/integration/blog/comments-api.test.ts`

| Test Case | Description | Priority |
|-----------|-------------|----------|
| GET /api/admin/blog/comments should return all comments | List with counts | P1 |
| GET /api/admin/blog/comments?status=PENDING should filter | Filter by status | P1 |
| GET /api/admin/blog/comments?postId=X should filter | Filter by post | P1 |
| PATCH /api/admin/blog/comments/[id] should approve | Status → APPROVED | P1 |
| PATCH /api/admin/blog/comments/[id] should reject | Status → REJECTED | P1 |
| DELETE /api/admin/blog/comments/[id] should delete | Hard delete | P1 |
| POST /api/admin/blog/comments/bulk approve should work | Bulk approve | P1 |
| POST /api/admin/blog/comments/bulk reject should work | Bulk reject | P1 |
| POST /api/admin/blog/comments/bulk delete should work | Bulk delete | P1 |
| GET /api/blog/posts/[slug]/comments should return approved only | Public endpoint | P1 |
| POST /api/blog/posts/[slug]/comments should create pending | Public submit | P1 |
| POST /api/blog/posts/[slug]/comments should rate limit | Rate limit check | P1 |
| should require admin auth for admin endpoints | Auth check | P1 |

### 3.3 Media API Integration Tests

**File:** `tests/integration/media/media-api.test.ts`

| Test Case | Description | Priority |
|-----------|-------------|----------|
| GET /api/admin/media should return assets | List assets | P1 |
| GET /api/admin/media?folderId=X should filter | Filter by folder | P1 |
| GET /api/admin/media?status=TRASHED should show trash | Trash view | P1 |
| GET /api/admin/media?type=IMAGE should filter | Filter by type | P1 |
| POST /api/admin/media should upload file | File upload | P1 |
| POST /api/admin/media should reject invalid type | Type validation | P1 |
| POST /api/admin/media should reject large files | Size validation | P1 |
| PATCH /api/admin/media/[id] should update metadata | Update fields | P1 |
| DELETE /api/admin/media/[id] should move to trash | Soft delete | P1 |
| POST /api/admin/media/[id]/restore should restore | Restore from trash | P1 |
| DELETE /api/admin/media/[id]/permanent should delete | Hard delete + S3 | P1 |
| POST /api/admin/media/bulk/move should move multiple | Bulk move | P1 |
| POST /api/admin/media/bulk/edit should edit multiple | Bulk edit | P1 |
| POST /api/admin/media/bulk/delete should delete multiple | Bulk delete | P1 |
| GET /api/admin/media/folders should return folders | List folders | P1 |
| POST /api/admin/media/folders should create folder | Create folder | P1 |
| PATCH /api/admin/media/folders/[id] should rename | Rename folder | P1 |
| DELETE /api/admin/media/folders/[id] should delete | Delete folder | P1 |
| should require admin auth | Auth check | P1 |

---

## 4. E2E Tests

### 4.1 Blog Backend E2E Tests

**File:** `tests/e2e/blog-backend.spec.ts`

| Test Case | Description | Priority |
|-----------|-------------|----------|
| Admin can view authors list | Navigate, verify table | P1 |
| Admin can create new author | Fill form, submit, verify | P1 |
| Admin can edit author | Edit fields, save, verify | P1 |
| Admin can deactivate author | Toggle status, verify | P1 |
| Admin can view comments list | Navigate, verify table | P1 |
| Admin can approve comment | Click approve, verify status | P1 |
| Admin can reject comment | Click reject, verify status | P1 |
| Admin can bulk moderate comments | Select multiple, approve | P1 |
| Admin can view media library | Navigate, verify grid | P1 |
| Admin can upload media file | Upload, verify appears | P1 |
| Admin can edit media metadata | Edit alt text, save | P1 |
| Admin can move media to folder | Drag or use move modal | P1 |
| Admin can trash media | Click trash, verify in trash | P1 |
| Admin can restore media | Click restore, verify active | P1 |
| Admin can permanently delete | Delete from trash | P1 |
| Admin can create folder | Create, verify appears | P1 |
| Admin can rename folder | Rename, verify name | P1 |
| Admin can delete folder | Delete, verify gone | P1 |
| Public can view blog comments | Navigate to post, see comments | P2 |
| Public can submit comment | Fill form, submit, verify pending | P2 |

---

## 5. Test File Locations

### Directory Structure

```
tests/
├── unit/
│   ├── blog/
│   │   ├── authors.test.ts
│   │   └── comments.test.ts
│   └── media/
│       ├── assets.test.ts
│       └── folders.test.ts
├── integration/
│   ├── blog/
│   │   ├── authors-api.test.ts
│   │   └── comments-api.test.ts
│   └── media/
│       └── media-api.test.ts
└── e2e/
    └── blog-backend.spec.ts
```

### File Summary

| File | Type | Test Count | Coverage |
|------|------|------------|----------|
| `tests/unit/blog/authors.test.ts` | Unit | 6 | Author validation/logic |
| `tests/unit/blog/comments.test.ts` | Unit | 7 | Comment validation/logic |
| `tests/unit/media/assets.test.ts` | Unit | 7 | Media validation/logic |
| `tests/unit/media/folders.test.ts` | Unit | 4 | Folder validation/logic |
| `tests/integration/blog/authors-api.test.ts` | Integration | 10 | Authors API |
| `tests/integration/blog/comments-api.test.ts` | Integration | 13 | Comments API |
| `tests/integration/media/media-api.test.ts` | Integration | 18 | Media API |
| `tests/e2e/blog-backend.spec.ts` | E2E | 20 | Full user flows |

---

## 6. Coverage Requirements

### Minimum Coverage Targets

| Area | Target | Measured By |
|------|--------|-------------|
| Unit Tests | 80% line coverage | Vitest coverage |
| Integration Tests | All API endpoints | Endpoint count |
| E2E Tests | All UI actions | UI-to-Backend mapping |

### Critical Paths (Must Have 100% Coverage)

1. Author CRUD operations
2. Comment moderation flow
3. Media upload/delete flow
4. Bulk operations
5. Permission checks

---

**Test Specs Complete.**

*Reference this document during implementation and validation phases.*
