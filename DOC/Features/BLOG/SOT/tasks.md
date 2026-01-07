# Tasks: BLOG

**Input**: Planning documents from `DOC/FEATURES/BLOG/SOT/`
**Prerequisites**: `FEATURE-SOT.md` (required), `Frontend-Plan.md` (required), `CURRENT-UI-AUDIT-BLOG.md` (required), `IMPLEMENTATION-PLAN.md` (required)

**Template compliance**: This file follows `.specify/templates/tasks-template.md` (ID format `T###`, `[P]` labeling, grouped by phase and user story).

## Phase 0: Planning Lock (Blocks Implementation)

- [ ] T001 Lock `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md` (verify routes, APIs, DB models are complete and correct)
- [ ] T002 Lock `DOC/FEATURES/BLOG/SOT/Frontend-Plan.md` (confirm routes, admin flows, Bangla contract)
- [ ] T003 Lock `DOC/FEATURES/BLOG/SOT/IMPLEMENTATION-PLAN.md` (confirm sequencing, acceptance checks, stop rules)
- [ ] T004 Update `DOC/FEATURES/BLOG/SOT/FEATURE-SOT.md` with any locked decisions from T001–T003

**Checkpoint**: Planning locked (safe to implement incrementally)

---

## Phase 1: User Story 1 — Public Blog Reading (Priority: P1)

**Goal**: Visitors can browse and read published posts via stable slug URLs.

- [ ] T010 [P] [US1] Verify `/blog` lists only published posts (files: `src/app/blog/page.tsx`, `src/app/api/blog/posts/route.ts`)
- [ ] T011 [P] [US1] Verify `/blog/[slug]` is deep-link safe and renders published post (files: `src/app/blog/[slug]/page.tsx`, `src/app/api/blog/posts/[slug]/route.ts`)
- [ ] T012 [US1] Validate `/blog/post` compatibility remains functional (file: `src/app/blog/post/BlogPostPageClient.tsx`)

---

## Phase 2: User Story 2 — Admin Content Workflow (Priority: P1)

**Goal**: Admin can create/edit/schedule/publish posts with minimal friction.

- [ ] T020 [P] [US2] Validate admin list and editor routes load without errors (files under `src/app/admin/blog/*`)
- [ ] T021 [P] [US2] Validate admin post CRUD API behavior (files: `src/app/api/admin/blog/posts/*`)
- [ ] T022 [P] [US2] Validate taxonomy CRUD (categories/tags) (files: `src/app/api/admin/blog/categories/*`, `src/app/api/admin/blog/tags/*`)

---

## Phase 2B: User Story 2B — Admin Blog Engine Hub (AI + Automation) (Priority: P1)

**Goal**: Admin has a single Blog Engine hub to operate Manual/Assisted/Automatic workflows with operational visibility (even if some actions remain UI-only until backend wiring).

- [ ] T023 [P] [US2B] Add `/admin/blog/engine` hub route and tabbed surfaces (Dashboard / Drafts & Reviews / Automation Logic / Sources / Audit Logs / Master Control / Settings)
- [ ] T024 [P] [US2B] Add confirmation-gated Pause/Resume/Emergency Stop actions (re-use existing confirmation modal pattern)
- [ ] T025 [US2B] Add Prompt Details surface (read-only) for AI-generated items
- [ ] T026 [US2B] Ensure lifecycle states are visible in admin UX (Needs Review / Draft Ready / Scheduled / Rejected / Error)

---

## Phase 2C: User Story 2C — Admin Blog CMS (Media + Comments) (Priority: P1)

**Goal**: Admin can manage blog media assets and moderate blog comments (CMS extensions).

- [ ] T027 [P] [US2C] Add `/admin/blog/media` Media Library UI (upload/browse/copy URL/delete)
- [ ] T028 [P] [US2C] Add `/admin/blog/comments` Comments management UI (approve/hide/spam/delete)
- [ ] T029 [US2C] Add confirmation-gated destructive actions (delete media, delete comment)


---

## Phase 3: User Story 3 — Automation via n8n (Priority: P2)

**Goal**: n8n can create drafts, schedule, and publish due posts using authenticated webhooks.

- [ ] T030 [P] [US3] Verify secret auth behavior and docs (file: `src/app/api/webhooks/n8n/blog/_shared.ts`, env var: `N8N_WEBHOOK_SECRET`)
- [ ] T031 [P] [US3] Validate create-draft webhook contract (route: `src/app/api/webhooks/n8n/blog/create-draft/route.ts`)
- [ ] T032 [P] [US3] Validate schedule webhook contract (route: `src/app/api/webhooks/n8n/blog/schedule/route.ts`)
- [ ] T033 [P] [US3] Validate run-scheduler publishes due posts and writes `BlogJobLog` (route: `src/app/api/webhooks/n8n/blog/run-scheduler/route.ts`)

---

## Phase 4: User Story 4 — AI Draft Assist (Priority: P2)

**Goal**: Admin can generate safe drafts (content + SEO) via server-side AI.

- [ ] T040 [P] [US4] Validate AI endpoint is admin-only and rate-limited (route: `src/app/api/admin/blog/ai/generate/route.ts`)
- [ ] T041 [US4] Validate AI request logging (`BlogAiRequestLog`) includes success/failure + metadata (route: `src/app/api/admin/blog/ai/generate/route.ts`, model: `prisma/schema.prisma`)

---

## Phase 5: Polish & Cross-Cutting

- [ ] T090 [P] Update docs if any route/contracts change (files: `DOC/FEATURES/BLOG/SOT/*`)
- [ ] T091 Confirm no breaking changes to existing blog entry points

---

## Dependencies & Execution Order

- Phase 0 blocks all other phases.
- Phases 1–4 can proceed after Phase 0, in priority order.
