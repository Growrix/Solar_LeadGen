---
description: "Execution plan draft for BLOG_MIRROR_STRAPI. Do not execute until FEATURE-SOT.md is Locked (Approved)."
---

# BLOG_MIRROR_STRAPI — Implementation Plan (Draft)

Status: Draft (Not approved; do not execute)

This document is an execution-oriented view derived from `DOC/Features/BLOG_MIRROR_STRAPI/SOT/FEATURE-SOT.md`.
If it conflicts with the SOT, the SOT wins.

## Scope Lock (MVP)
Implement a Strapi-like **Blog Management** experience inside solarmatch:
- Admin CRUD for blog posts
- Draft vs Published
- Categories + tags
- SEO title/description + OG image
- Public blog reads from owned CMS source

Explicitly NOT in MVP:
- Generic content type builder
- Plugin marketplace
- Multi-site
- Auto-publish AI

## Milestones

### M1 — Foundation Ready
- Data model defined and migrated (new blog tables only)
- Admin auth gate confirmed

Acceptance checks:
- Prisma validate passes
- `npx tsc --noEmit` passes

### M2 — Admin APIs
- Admin CRUD endpoints for posts/categories/tags

Acceptance checks:
- Non-admin gets 403
- Admin can create/list/update/delete

### M3 — Admin UI
- Admin pages under `/admin/blog*` using existing admin shell

Acceptance checks:
- Multi-theme compatible (no hardcoded colors)
- Basic forms and list tables are usable

### M4 — Public Blog Provider Switch
- Public blog pages read from DB-backed CMS
- Keep fallback behavior until migration is complete

Acceptance checks:
- `/blog` lists Published posts only
- `/blog/[slug]` renders correct metadata

### M5 — Migration
- Import existing Strapi content

Acceptance checks:
- Sample set of migrated posts renders correctly

## Files expected to be touched (when approved)
- `prisma/schema.prisma` (new blog models only)
- `src/app/admin/*` (new blog routes)
- `src/app/api/admin/*` (new blog endpoints)
- `src/app/blog/*` and/or `src/lib/blog/*` (provider switch)

## Stop Rules
- If any change affects lead flows or payments, stop.
- If themes require new tokens, stop and reconcile with `DESIGN-SYSTEM-SOT.md`.
- If requirements expand beyond blog MVP, update SOT and re-approve.
