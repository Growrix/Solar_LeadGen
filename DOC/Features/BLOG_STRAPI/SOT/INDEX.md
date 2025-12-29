# BLOG_STRAPI — SOT Index (Continuity Pack)

**Feature**: Strapi-Powered Blog + AI Content Automation Engine

**Status**: Locked (Approved)  
**Owner**: GitHub Copilot (GPT-5.2)

**Locked At**: 2025-12-29

This index is the entry point for any human/AI continuing work on the Blog feature. It exists to prevent context drift.

## Authority (read order)
1. `DOC/GUIDELINES & SOT/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md`
2. `DOC/GUIDELINES & SOT/SYSTEM DESIGN/Blueprint.md`
3. `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`
4. `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`

## Canonical SOT
- `DOC/Features/BLOG_STRAPI/SOT/FEATURE-SOT.md` (Phases 0–6)

## Execution-Level Documents (must read before coding)
- `DOC/Features/BLOG_STRAPI/SOT/IMPLEMENTATION-PLAN.md` (what we are implementing + why + sequencing)
- `DOC/Features/BLOG_STRAPI/SOT/STRAPI-SETUP.md` (how Strapi is provisioned + content model + required env)
- `DOC/Features/BLOG_STRAPI/SOT/tasks.md` (portable execution checklist that lives with the SOT; **must follow** `.specify/templates/tasks-template.md`)

## Input Plans (do not edit; reference only)
- `DOC/Features/BLOG_STRAPI/PLAN/Raw_Plan.md`
- `DOC/Features/BLOG_STRAPI/PLAN/ChatGPT_plan.md`

## Current Implementation (legacy audit pointers)
These already exist in the codebase and must be treated as legacy:
- `src/app/blog/page.tsx` (blog list; currently uses local seed data)
- `src/app/blog/post/page.tsx` (legacy route; redirect-only)
- `src/app/blog/[slug]/page.tsx` (server page that can fetch from Strapi by slug)
- `src/lib/blog/strapi.ts` (Strapi fetch for single post by slug; env: `STRAPI_URL`, `STRAPI_TOKEN`)
- `src/data/blogData.ts` and `src/types/blog.ts` (local blog seed types/data)

## Next Step
- Start here (SOT-local execution checklist): `DOC/Features/BLOG_STRAPI/SOT/tasks.md`
- Engineering tracking + command-level execution: `specs/014-blog-feature/tasks.md`
- Start with GATE 0 checks, then proceed milestone-by-milestone.
