# Blog Manual — SOT Index (Continuity Pack)

**Feature**: In‑App Blog (Guest) + Admin Publishing Workflow + AI Drafting + Automation (n8n)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-29

This folder is the **single starting point** for any AI/human working on the Blog Manual feature.

## Authority (read order)
1. `DOC/GUIDELINES & SOT/README.md`
2. `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`
3. `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`
4. (When needed) `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/E2E-CURRENT-STATE-AUDIT-RULES.md`

## Canonical Feature SOT (Phases 0–6)
- `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`

## Current State Audit (must read before changing UI)
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md`

## Frontend Plan (visual contract + Bangla)
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`

## Execution Documents (no code until approved)
- `DOC/Features/Blog Manual/SOT/IMPLEMENTATION-PLAN.md`
- `DOC/Features/Blog Manual/SOT/tasks.md` (must follow `.specify/templates/tasks-template.md`)

## Input Plans (reference-only)
- `DOC/Features/Blog Manual/PLAN/mainplan.md` (primary plan)
- `DOC/Features/Blog Manual/PLAN/RawPlan.md` (raw notes)

## Current Code (legacy pointers)
- Blog list route: `src/app/blog/page.tsx`
- Blog post route (legacy sessionStorage flow): `src/app/blog/post/page.tsx`
- Seed data: `src/data/blogData.ts`
- Types: `src/types/blog.ts`

## Next Step (Approval Gate)
1. Confirm Phase 0 decisions and open questions in `FEATURE-SOT.md`.
2. Approve `Frontend-Plan.md` (visual contract + Bangla).
3. Approve `IMPLEMENTATION-PLAN.md` and `tasks.md`.
4. Only after approval: begin implementation tasks.
