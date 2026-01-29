# Blog Manual — SOT Index (Continuity Pack)

**Feature**: In-App Blog + Admin Workflow + AI Drafting + n8n Automation (Manual Blog track)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-29

This index is the entry point for any human/AI continuing work on the Blog Manual feature. It exists to prevent context drift.

## Authority (read order)
1. `DOC/GUIDELINES & SOT/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md`
2. `DOC/GUIDELINES & SOT/SYSTEM DESIGN/Blueprint.md`
3. `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`
4. `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`

## Canonical SOT
- `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md` (Phases 0–6)

## Current State Audit (must read before changing UI)
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md` (as-is guest blog UX + constraints)

## Execution-Level Documents (must read before coding)
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md` (pages/routes/modals/UX + routing)
- `DOC/Features/Blog Manual/SOT/IMPLEMENTATION-PLAN.md` (what we will implement first + sequencing + stop rules)
- `DOC/Features/Blog Manual/SOT/tasks.md` (portable execution checklist; must follow `.specify/templates/tasks-template.md`)

## Input Plans (reference only)
- `DOC/Features/Blog Manual/PLAN/RawPlan.md`
- `DOC/Features/Blog Manual/PLAN/mainplan.md`

## Current Implementation (legacy audit pointers)
These already exist in the codebase and must be treated as legacy:
- `src/app/blog/page.tsx` (blog list; currently uses local seed data)
- `src/app/blog/post/page.tsx` (legacy single-post route using `sessionStorage`)
- `src/data/blogData.ts` and `src/types/blog.ts` (local blog seed types/data)

## Next Step (no coding yet)
1. Review `FEATURE-SOT.md` open questions and confirm product decisions.
2. Approve the `Frontend-Plan.md` UX/routing structure.
3. After approval, we will start Phase 1 frontend implementation per `IMPLEMENTATION-PLAN.md` and `tasks.md`.
