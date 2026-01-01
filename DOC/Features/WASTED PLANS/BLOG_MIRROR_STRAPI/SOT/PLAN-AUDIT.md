---
description: "Deep audit of the BLOG_MIRROR_STRAPI plan and recommended corrections before implementation."
---

# BLOG_MIRROR_STRAPI — Plan Audit (Deep)

Input plan: `DOC/Features/BLOG_MIRROR_STRAPI/Plan/ChatGPTplan.md`

## 1) Summary of What the Plan Gets Right
- Correctly prioritizes **user stories first** and treats Strapi as **inspiration, not a dependency**.
- Correctly recognizes that “blog” should evolve into a **content engine** (SEO + lead attribution + automation).
- Correctly separates roles (Admin / Editor / AI Agent / Public) and insists AI cannot publish without approval.

## 2) Major Risks / Gaps (Must Address Before Coding)

### Gap A — Scope is equivalent to “build a Strapi competitor”
The plan includes **Content Type Builder** (arbitrary schemas), role permissions, media library, workflow, scheduling, RSS ingestion, AI generation, automations, analytics, and multi-site.

That is not a “blog feature”; it’s a **general CMS platform**. If implemented as-is without an MVP boundary, it risks:
- long timelines,
- unclear acceptance criteria,
- unstable UX,
- large database surface area,
- inconsistent editorial workflows.

**Fix**: define an MVP that mirrors Strapi blog **content entry experience**, not the entire Strapi platform.

### Gap B — Missing explicit parity targets
The plan says “mirror Strapi-like capabilities”, but it does not specify:
- which Strapi features are P1 (must-have parity),
- which are P2/P3 (nice-to-have),
- which are explicitly out of scope.

**Fix**: create a Strapi parity matrix with “Must / Should / Later / Never”.

### Gap C — No legacy audit section
The framework requires a Phase 0 legacy audit. The plan doesn’t inventory existing repo reality.

In solarmatch, there is already:
- public blog routes under `src/app/blog/*`
- a Strapi fetch adapter `src/lib/blog/strapi.ts`
- admin area routing under `src/app/admin/*`

**Fix**: document what exists, what we reuse, and what we must not break.

### Gap D — Permissions model not mapped to your actual auth system
The plan introduces roles like “Content Admin / Editor / AI Agent”, but solarmatch’s current auth appears to use `UserRole` (e.g. ADMIN/HOMEOWNER/INSTALLER).

**Fix**: define how CMS roles map into existing roles (e.g. reusing ADMIN, or adding CMS roles safely later).

### Gap E — No operational constraints
Missing:
- image storage strategy (S3 vs local),
- editorial audit logs,
- rollback strategy for publish mistakes,
- SEO safety requirements (canonical URLs, redirects),
- performance strategy (caching, revalidation),
- migration plan from Strapi content (export/import format).

**Fix**: add an “Ops + Safety” section before Phase 5 technical design is approved.

## 3) Recommended “Legacy-Safe MVP” Reframe (Still aligned to your plan)

### MVP (P1) — “Strapi-like Blog Management” (not Content Type Builder)
- Admin can manage Blog Posts with:
  - draft/publish
  - slug
  - excerpt + content
  - featured image URL
  - category + tags
  - SEO title/description + OG image
- Public blog reads from the same source.
- A clean admin UX that matches your design system.

### P2 — Media library + scheduling + richer workflow
- Upload media (first pass may be URL-based only)
- Schedule publication
- Internal review steps and comments

### P3 — AI + RSS automation + analytics attribution
- AI draft generation (admin-assisted)
- RSS ingestion to drafts (never auto-publish)
- Conversion attribution (blog → lead)

### Later — Content type builder + multi-site
- Only after blog MVP is stable and validated.

## 4) Open Questions (Must Be Answered to Avoid Guesswork)
- Do you want this CMS to be **ADMIN-only**, or do you want separate roles like Editor accounts?
- Do you require **true rich text** (HTML/MD editor), or is plain text acceptable for MVP?
- For media: do you want **upload** in MVP, or URL-only initially?
- Do you need multilingual from day 1?
- Do you want to fully remove Strapi immediately, or run both in parallel during migration?

## 5) Recommendation
Proceed with a 6-phase SOT that:
- locks a blog-first MVP,
- defines parity explicitly,
- and treats advanced CMS/automation as phased follow-ups.

This avoids repeating the prior issue you mentioned: “UI was poor / not standard” — we’ll lock UX requirements first, then code.
