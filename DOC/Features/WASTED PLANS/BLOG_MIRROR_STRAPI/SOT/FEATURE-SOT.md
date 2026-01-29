---
description: "Canonical SOT for BLOG_MIRROR_STRAPI (Legacy-Safe 6-Phase framework)."
---

# BLOG_MIRROR_STRAPI — FEATURE SOT

Status: Draft (Planning)
Owner: AI + Human approval required

This is the **canonical SOT** for BLOG_MIRROR_STRAPI.
All planning and implementation must align to this file.

Links:
- Raw plan input: `DOC/Features/BLOG_MIRROR_STRAPI/Plan/ChatGPTplan.md`
- SOT index: `DOC/Features/BLOG_MIRROR_STRAPI/SOT/INDEX.md`
- 6-phase framework: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md`

---

## PHASE 0 — Context & Legacy Audit (Existing System Reality)

### What already exists in solarmatch (confirmed)
- Public blog routing exists:
  - `src/app/blog/page.tsx`
  - `src/app/blog/[slug]/page.tsx`
- Strapi adapter exists:
  - `src/lib/blog/strapi.ts` (server-only; supports fallback seed content)
- Admin area exists:
  - `src/app/admin/*` (layout + multiple admin pages)

### Safe-to-reuse
- Existing public blog UI routes and metadata generation.
- Existing admin shell (sidebar/header/mobile nav) patterns for new “Blog Admin” pages.

### Do-not-break / do-not-touch (until explicit approval)
- Lead generation flows, payments, negotiation logic, and any existing admin lead management UX.
- Any production DB tables unrelated to blog.

### Current gap vs desired state
- Today: blog content comes from Strapi (if configured) or seed content.
- Desired: blog content is fully owned in solarmatch DB + admin UI (Strapi-like editing experience), so Strapi can be removed.

### Constraints
- Must respect the neumorphic design system (multi-theme: Dark/Light/Purple) and avoid hardcoded colors.
- Must follow existing auth/authorization patterns.

---

## PHASE 1 — Vision & Problem Statement (WHY)

### Vision
Build a **fully owned, Strapi-inspired blog CMS** inside solarmatch so content creation, SEO, and publishing can be managed in one deployment without external Strapi hosting.

### Target users
- Platform Admin (site owner)
- Content Admin / Editor (may be the same as Admin initially)
- AI Agent (system role; draft assistance only)
- Public readers

### Problem being solved
- Strapi is costly and operationally inconvenient as a separate service.
- Prior custom blog attempts lacked a professional/standard admin UX.

### Success criteria (MVP)
- Admin can create/edit/publish blog posts from inside solarmatch.
- Public blog displays posts from the same owned source.
- SEO fields are supported (title/description/OG).
- Workflow is stable and predictable (draft vs published).

---

## PHASE 2 — User Stories (WHAT, not HOW)

### US1 (P1) — Admin: Manage Blog Posts
As an Admin, I can list, create, edit, and archive blog posts, and set status to Draft or Published.

### US2 (P1) — Admin: Taxonomy (Categories/Tags)
As an Admin, I can create and manage categories and tags and assign them to posts.

### US3 (P1) — Admin: SEO Fields
As an Admin, I can set SEO title/description and OG image for each post.

### US4 (P1) — Public: Read Blog
As a public user, I can browse and read published posts.

### US5 (P2) — Admin: Editorial Workflow Enhancements
As an Admin/Editor, I can preview posts and optionally schedule publication.

### US6 (P3) — AI Agent: Draft Assistance (No Auto-Publish)
As an Admin/Editor, I can generate draft text via AI, but AI cannot publish without explicit approval.

### US7 (P3) — System: RSS-to-Draft Pipeline
As an Admin, I can connect RSS sources and ingest items into Draft posts (never auto-publish).

Explicit exclusions (for MVP)
- No generic “Content Type Builder” (arbitrary schemas) in MVP.
- No plugin marketplace.
- No multi-site or multilingual requirements unless explicitly confirmed.

---

## PHASE 3 — Feature Scope & Modules

### Module A — Blog CMS Core (MVP)
- (New) Blog post CRUD, status management, publishing rules.
- (New) Category/Tag management.
- (New) SEO fields per post.

### Module B — Public Blog Integration (MVP)
- (Modify/Reuse) Reuse existing routes under `src/app/blog/*` but swap the data source to “owned CMS” provider.
- (Reuse) Preserve existing metadata generation behavior.

### Module C — Admin UX (MVP)
- (New) Add a “Blog” area inside existing admin shell.
- (Reuse) Use existing admin layout patterns and design tokens.

### Module D — Automation + AI (Post-MVP)
- (Later) AI assisted drafting.
- (Later) RSS ingestion.
- (Later) analytics attribution.

Dependencies
- Existing auth system for admin gating.
- Existing design system tokens and class conventions.

---

## PHASE 4 — System & Flow Design (HOW IT WORKS, in English)

### 4.1 Admin Post Lifecycle
- Draft: editable, not visible publicly.
- Published: visible publicly.
- Archived: hidden from public listing but retained for audit/history.

### 4.2 Public Read Flow
- `/blog` shows only Published posts.
- `/blog/[slug]` shows the published post; if not found, show a fallback.

### 4.3 SEO Flow
- Each post may override:
  - meta title
  - meta description
  - OG image
- If not set, fall back to post title/excerpt.

### 4.4 Error handling
- If CMS is unavailable, do not hard-fail the site. Provide a safe fallback (existing seed fallback can remain until migration is complete).

### 4.5 Permissions
- Only Admin users can access blog admin routes and admin APIs.
- Public routes never expose admin-only draft content.

---

## PHASE 5 — Technical Design (Proposed; requires approval before coding)

### Data model (proposed)
- BlogPost: title, slug, excerpt, content, contentFormat, status, publishedAt, featuredImageUrl, seoTitle, seoDescription, ogImageUrl, categoryId
- BlogCategory: name, slug
- BlogTag: name, slug
- BlogPostTag join table

### API surface (proposed)
- Admin APIs (CRUD):
  - `/api/admin/blog/posts`
  - `/api/admin/blog/categories`
  - `/api/admin/blog/tags`
- Public read (server-side in app router):
  - query DB directly in server components or via internal read helper

### UI (proposed)
- Admin routes:
  - `/admin/blog` (list)
  - `/admin/blog/new` (create)
  - `/admin/blog/[id]` (edit)
  - `/admin/blog/categories`
  - `/admin/blog/tags`

### Migration strategy (proposed)
- Run Strapi and new CMS in parallel.
- Export from Strapi (JSON/CSV) → import to new tables.
- Flip provider in public blog from Strapi → Owned CMS.

Security notes (proposed)
- Admin endpoints require server-side role check.
- Validate slug uniqueness and content size limits.

---

## PHASE 6 — Legacy-Aware Execution Plan (Docs Only; no implementation until approved)

### Step-by-step build order (MVP-first)
1. Lock this SOT (Status: Locked/Approved) and confirm MVP boundaries.
2. Add DB models + migrations for BlogPost/Category/Tag.
3. Build admin APIs (CRUD) with admin auth checks.
4. Scaffold admin pages under existing admin shell.
5. Switch public blog provider to read from owned CMS (with temporary fallback).
6. Add basic SEO fields to metadata generation.
7. Content migration: import seed/Strapi content.
8. Validate E2E (Admin create → Publish → Public read).

### Testing & validation checkpoints
- Gate 0: typecheck + build must pass.
- Verify public routes return published content only.
- Verify admin routes are forbidden for non-admin.

### Stop rules
- If auth boundaries are unclear, stop and confirm.
- If multi-theme tokens would be violated, stop and adjust to existing tokens.
- No expansion into “Content Type Builder” until blog MVP is shipped and stable.

### Rollback plan
- Keep Strapi adapter path available until the new CMS is validated.
- Ability to toggle provider back if critical issues occur.
