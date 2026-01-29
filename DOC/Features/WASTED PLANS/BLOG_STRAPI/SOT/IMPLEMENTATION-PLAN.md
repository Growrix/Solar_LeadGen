# BLOG_STRAPI — Implementation Plan (Execution-Level)

**Status**: Draft (Execution Plan)  
**Owner**: GitHub Copilot (GPT-5.2)  
**Created**: 2025-12-29

This document answers the missing piece you flagged:
- *What exactly are we implementing?*
- *In what order?*
- *Based on which locked decisions?*

It is **execution-level** and must stay consistent with the locked planning SOT:
- `DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md`

It also defines the Strapi provisioning/runbook authority for this feature:
- `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md`

---

## 0) Authority & Inputs

Read order:
1. `DOC/GUIDELINES & SOT/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md`
2. `DOC/GUIDELINES & SOT/SYSTEM DESIGN/Blueprint.md`
3. `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`
4. `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`

Feature inputs (reference only):
- `DOC/Features/BLOG_STRAPI/PLAN/Raw_Plan.md`
- `DOC/Features/BLOG_STRAPI/PLAN/ChatGPT_plan.md`

---

## 1) Executive Summary (End-to-End Scope)

This plan is **end-to-end**. Work is phased for safety, but no major module is left “to decide later”.

### E2E Modules (what this feature includes)

1) **Strapi CMS**
- Provision Strapi as a separate service
- Define content model (Post/Category/Tag + SEO fields)
- Configure API token + permissions
- Define required Next.js environment variables

2) **Public Blog (Next.js)**
- Canonical routing: `/blog/[slug]`
- Legacy compatibility: `/blog/post` redirect-only
- Listing and detail pages load from Strapi when configured
- Safe fallback to seeded data when Strapi is missing/unreachable

3) **SEO + Indexing**
- Metadata derived from post SEO fields
- Canonical URL rules remain stable

4) **Control Tower (Admin Governance in SaaS)**
- Governance lifecycle stored in SaaS DB (Prisma)
- States and approvals are enforced in SaaS, not in Strapi

5) **Automation (n8n + AI worker)**
- Ingestion → research → draft generation → approval gating
- Automation must respect governance states and audit requirements

6) **Auditability + Observability**
- Audit log for every lifecycle transition and automated action
- Traceability: who/what/when/why per content item

7) **Rollout + Safety**
- Feature operates with or without Strapi (fallback)
- Rollback paths are documented and feasible

---

## 2) Locked Decisions (Derived from the locked Feature SOT)

These are the decisions the implementation must follow:

1) **Canonical post URL**: `/blog/[slug]`
- Rationale: stable shareable URL; aligns with SEO metadata generation.

2) **Legacy behavior preserved**
- `/blog/post` continues to function for existing navigation flows, but only as a redirect.

3) **Server-only Strapi access**
- `STRAPI_TOKEN` must not reach the browser.
- Strapi reads happen in server code paths only.

5) **Strapi is a separate service**
- Strapi provisioning and content model are defined by: `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md`

4) **Fallback required**
- If `STRAPI_URL` missing or Strapi fetch fails, public blog must still render using `src/data/blogData.ts`.

---

## 3) Current State (What exists in the repo)

### Existing legacy routes and data
- `src/app/blog/page.tsx` (blog list)
- `src/app/blog/post/page.tsx` (legacy single-post via sessionStorage)
- `src/app/blog/[slug]/page.tsx` (server route; supports slug-based fetch)
- `src/lib/blog/strapi.ts` (Strapi integration)
- `src/data/blogData.ts` (seed data)
- `src/types/blog.ts` (types)

### Existing feature limitation
The current repository code covers public blog routing/listing/detail and Strapi fetch utilities. Control tower + automation + audit are included in the **feature E2E scope** and must be implemented under explicit phases below.

---

## 4) Work Completed So Far (So you can see what changed)

This is a factual “what’s already been implemented” inventory.

### A) Shared slug utility
- Added: `src/lib/blog/slugify.ts`

### B) Strapi list support + seed fallback
- Updated: `src/lib/blog/strapi.ts`
  - Added a list function (`getBlogPosts`) that:
    - Uses Strapi when `STRAPI_URL` is configured
    - Falls back to local seeded articles on missing env or error

### C) `/blog` list becomes server-driven
- Updated: `src/app/blog/page.tsx`
  - Server-load posts (Strapi or fallback) and render a client list UI

### D) Client list UI
- Added: `src/app/blog/BlogPageClient.tsx`

### E) Legacy `/blog/post` redirected
- Updated: `src/app/blog/post/page.tsx`
  - Minimal redirect-only implementation

---

## 5) Execution Plan (Phased, End-to-End)

This is the step-by-step execution plan. Phases are sequenced to keep the system shippable at every checkpoint.

### Phase 0 — GATE 0 health checks
Run:
- `npx tsc --noEmit`
- `npx prisma validate`
- `npm run build`

Stop if any fails.

### Phase 1 — Strapi provisioning + content model
Authority: `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md`

Success criteria:
- Strapi Admin loads
- A published post exists
- List and slug endpoints return published content

### Phase 2 — Public blog E2E verification (Strapi + fallback)
Success criteria:
- Clicking a post on `/blog` opens `/blog/[slug]`
- Visiting `/blog/post` redirects to `/blog/[slug]` when sessionStorage has the post
- If sessionStorage is missing/invalid, `/blog/post` redirects to `/blog`

Two scenarios:
- Without Strapi env:
  - `/blog` renders using seed data
  - `/blog/[slug]` renders seed post
- With Strapi env:
  - `/blog` renders Strapi posts (published only)
  - `/blog/[slug]` renders Strapi post

### Phase 3 — SEO + indexing
Success criteria:
- `/blog/[slug]` metadata matches post SEO fields
- Canonical URL rules remain stable

### Phase 4 — Control tower (governance)
Success criteria:
- SaaS DB contains content governance records and lifecycle states
- Admin can transition states with approvals

### Phase 5 — Automation (n8n + AI worker)
Success criteria:
- Ingestion produces research artifacts
- Approvals gate drafts and publishing actions

### Phase 6 — Auditability + observability
Success criteria:
- Lifecycle transitions and automation actions are fully auditable per content item

### Phase 7 — Rollout + rollback
Success criteria:
- If Strapi is down, public blog still renders via fallback
- Rollback steps are documented and do not require destructive DB operations

---

## 6) Stop Rules

- If any change breaks TypeScript or `npm run build`, stop and fix before proceeding.
- Do not introduce DB schema changes in public blog routing/list phases.
- Never expose `STRAPI_TOKEN` to client components.

---

## 7) Where the live checklist is

- Local execution checklist (portable, continuity-friendly):
  - `DOC/Features/BLOG_STRAPI/SOT/tasks.md`
- Engineering execution script (repo-wide specs tracking):
  - `specs/014-blog-feature/tasks.md`

---

## 8) Restart Protocol (No Partial Planning)

If work resumes after interruption:
1) Start from `DOC/Features/BLOG_STRAPI/SOT/INDEX.md`
2) Re-read `DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md` (locked decisions)
3) Follow `DOC/Features/BLOG_STRAPI/SOT/tasks.md` in order
4) If a phase requires new decisions, update the locked planning SOT first (do not improvise scope mid-execution)
