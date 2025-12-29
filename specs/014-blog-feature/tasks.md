---
description: "Task list for BLOG_STRAPI feature implementation"
---

# Tasks: BLOG_STRAPI

**Input**: Design documents (continuity + execution basis)
- `DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md`
- `DOC/Features/BLOG_STRAPI/SOT/INDEX.md`
- `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/Features/BLOG_STRAPI/SOT/tasks.md`

**Prerequisites**: `DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md` must be `Locked (Approved)`.

**Tests**: OPTIONAL — only add new tests if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US0, US1, US2...)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline system health (GATE 0) and lock confirmation.

- [ ] T001 [US0] Confirm SOT lock status in `DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md`
- [ ] T002 [US0] Run `npx tsc --noEmit`
- [ ] T003 [US0] Run `npx prisma validate`
- [ ] T004 [US0] Run `npm run build`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Canonical routing and legacy-safe constraints.

**⚠️ CRITICAL**: No DB changes in this phase.

- [ ] T005 [US1] Confirm canonical URL is `/blog/[slug]` and `/blog/post` is legacy redirect-only (doc: `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md`)

**Checkpoint**: Canonical routing decisions are fixed and understood.

---

## Phase 3: User Story 1 — Canonical Public Blog Routing (Priority: P1) 🎯 MVP

**Goal**: Make `/blog/[slug]` the canonical shareable URL without breaking existing navigation.

**Independent Test**:
- Clicking a post on `/blog` opens `/blog/[slug]`
- Visiting `/blog/post` redirects safely:
  - with sessionStorage `currentBlogPost` → `/blog/[slug]`
  - otherwise → `/blog`

### Implementation for User Story 1

- [ ] T006 [US1] Ensure blog list navigation routes to `/blog/[slug]` (file: `src/app/blog/BlogPageClient.tsx`)
- [ ] T007 [US1] Keep legacy `/blog/post` as redirect-only route (file: `src/app/blog/post/page.tsx`)
- [ ] T008 [US1] Ensure homepage blog navigation routes to `/blog/[slug]` when applicable (file: `src/app/page.tsx`)
- [ ] T009 [US1] Verify `npx tsc --noEmit` and `npm run build`

**Checkpoint**: US1 is functional and independently testable.

---

## Phase 4: User Story 2 — Strapi-Backed Blog Listing (Priority: P1)

**Goal**: Load `/blog` list from Strapi when configured; fall back to seed data when not.

**Independent Test**:
- Missing `STRAPI_URL`: `/blog` renders seeded posts
- With `STRAPI_URL`: `/blog` renders Strapi posts

### Implementation for User Story 2

- [ ] T010 [US2] Implement/maintain server-only Strapi list fetch with safe fallback (file: `src/lib/blog/strapi.ts`)
- [ ] T011 [US2] Ensure `/blog` server page loads posts and renders client list UI (file: `src/app/blog/page.tsx`)
- [ ] T012 [US2] Confirm Strapi token is never used in client components (audit: `src/app/blog/BlogPageClient.tsx`)
- [ ] T013 [US2] Verify `npx tsc --noEmit` and `npm run build`

**Checkpoint**: US2 is functional and independently testable.

---

## Phase 5: User Story 3 — Control Tower + Automation Planning Split (Priority: P2) (STOP UNTIL APPROVED)

**Goal**: Do not expand scope into admin/control-tower, DB governance models, or n8n automation until sequencing is confirmed.

- [ ] T014 [US3] Get written confirmation on sequencing for:
  - Admin review/approval/scheduling UI
  - Governance/audit DB models (Prisma)
  - n8n automation (RSS → research → draft)
# BLOG_STRAPI — Execution Tasks (AI-Controlled)

Status: In Progress

Source of Truth:
- Planning SOT (Locked): DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md
- SOT Index (AI Continuity Pack / restart point): DOC/Features/BLOG_STRAPI/SOT/INDEX.md

Execution Basis (SOT-local, continuity-first):
- Implementation plan: DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md
- Portable checklist: DOC/Features/BLOG_STRAPI/SOT/tasks.md

---

## EXEC-0 — GATE 0 System Health (Mandatory)

Run and record results:
- `npx tsc --noEmit`
- `npx prisma validate`
- `npm run build`

Stop if any check fails.

---

## EXEC-0.5 — DOCUMENTATION LOCK (Mandatory, before any code)

Goal: lock the plan so AI never loses the “what/why/how” across sessions.

Tasks:
- Confirm SOT is complete for Phases 0–5 (audit → vision → stories → scope → flows → technical proposal).
- Confirm SOT status is `Locked (Approved)`.

Checkpoint:
- SOT is explicitly locked and referenced from the SOT Index.
- No implementation starts until this is true.

---

## EXEC-1 — Canonical Public Blog Routing (Safe, Incremental)

Goal: make `/blog/[slug]` the canonical shareable URL without breaking existing navigation.

Rules:
- Do NOT change the database in this phase.
- Preserve existing blog UI/UX as much as possible.

Tasks:
- Update `/blog` navigation so clicking a post routes to `/blog/[slug]`.
- Update legacy `/blog/post` to redirect to `/blog/[slug]` when possible (sessionStorage), otherwise to `/blog`.

Checkpoint:
- Manual: clicking a post from `/blog` opens `/blog/[slug]`
- Manual: visiting `/blog/post` does not trap the user (redirects safely)
- `npx tsc --noEmit` passes
- `npm run build` passes

---

## EXEC-2 — Strapi-Backed Blog Listing (With Safe Fallback)

Goal: load the blog list from Strapi when configured, otherwise fall back to local seed content.

Rules:
- Do NOT expose Strapi tokens to the browser.
- If Strapi is down/unconfigured, `/blog` must still render.

Tasks:
- Extend `src/lib/blog/strapi.ts` with a list function (published-only, sorted, paginated).
- Update `/blog` to render posts from Strapi list when available.

Checkpoint:
- Manual (no STRAPI env): `/blog` shows seeded articles
- Manual (with STRAPI env): `/blog` shows Strapi posts
- `npx tsc --noEmit` passes
- `npm run build` passes

---

## EXEC-3 — Control Tower + Automation Planning Split (No Code Until Approved)

Goal: keep public blog stable while we separately plan/admin-approve the control tower + n8n automation layers.

Tasks:
- Confirm desired scope/order for:
  - Admin review & approval UI
  - RSS ingestion
  - AI research summaries
  - AI drafting
  - Scheduling & auditing

Checkpoint:
- Written confirmation of which submodules to implement first

---

## EXEC-4 — Governance/Audit Data Layer (If Needed)

Goal: implement the real backend to match the contract the UI already uses.

Rules:
- Follow DB Operations Standard (backup-first; no destructive commands).
- After schema edits run `npx prisma generate` immediately.
- Do NOT proceed without a clear, approved data model scope.

Tasks (draft):
- Add Prisma models only if the SaaS must store governance/audit state separate from Strapi.
- Add backend APIs for admin control tower and automation.

Checkpoint:
- `npx prisma validate` passes
- `npx tsc --noEmit` passes
- `npm run build` passes

---

## EXEC-5 — INTEGRATION: Swap Mock Provider → Real Backend

Goal: wire the existing UI to the backend without rewriting UI components.

Tasks:
- Replace mock provider implementation with real backend calls.
- Keep UI behavior identical; only data source changes.
- Implement media upload pipeline end-to-end:
  - Prefer S3 using existing `src/lib/s3.ts` patterns
  - Persist `BlogMediaAsset` rows (key/url/type/size/createdBy)
  - Provide presigned upload and presigned read where needed

Checkpoint:
- Manual: `/blog` and `/blog/<slug>` load from DB
- Manual: admin create draft → publish → appears in public blog (DB)
- Manual: upload image → appears in library → selectable as featured image
- `npm run build` passes

---

## EXEC-6 — AI Drafting (Admin-assisted)

Goal: AI generates drafts, admin approves.

Tasks:
- Add admin action: generate draft from topic
- Store:
  - prompt inputs
  - model metadata
  - source links used for topic discovery
  - job status + errors
- Default workflow: PENDING_APPROVAL
- Optional: allow auto-publish toggle

Checkpoint:
- Manual: generate → appears as pending → approve → schedule/publish

---

## EXEC-7 — Scheduling + SEO Plumbing

Tasks:
- Scheduled publish executor (simple cron approach first; n8n later)
- Blog sitemap integration

Checkpoint:
- Manual: schedule in future → publish occurs
- Sitemap includes published blog posts

---

## Safety / Stop Rules

- If any phase introduces TypeScript errors, build warnings, or route conflicts: stop and fix before continuing.
- Never use destructive DB commands (`migrate reset`, `db push --force-reset`, etc.).
