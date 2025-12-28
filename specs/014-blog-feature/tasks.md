# Blog Feature (Strapi-based + AI Automation) — Execution Tasks (AI-Controlled)

Status: PAUSED (Change Request Pending — Switch to Strapi)

Source of Truth:
- Planning SOT (6-Phase Framework: Phases 0–5 docs + Phase 6 intent): DOC/Features/Blog Feature/SOT/FEATURE-SOT.md
- SOT Index (AI Continuity Pack / restart point): DOC/Features/Blog Feature/SOT/INDEX.md

Supporting (Strapi):
- Strapi decision + architecture: DOC/Features/Blog Feature/SOT/STRAPI-DECISION-AND-ARCHITECTURE.md
- Automation pipeline: DOC/Features/Blog Feature/SOT/AUTOMATION-PIPELINE.md

Supporting:
- Audit: DOC/Features/Blog Feature/BLOG-FEATURE-AUDIT-2025-12-28.md

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
- Confirm the updated SOT reflects the Strapi change request.
- Confirm execution approach:
  - Public blog pages remain in Next.js
  - CMS authoring happens in Strapi
  - Automation creates drafts/publishes via Strapi APIs
- When approved, mark SOT status as `Locked (Approved)`.

Checkpoint:
- SOT is explicitly locked and referenced from the SOT Index.
- No implementation starts until this is true.

---

## EXEC-1 — STRAPI SETUP (CMS foundation)

Goal: establish Strapi as the system of record for Blog.

Tasks:
- Create Strapi project (environment-dependent; local + hosted strategy as decided)
- Define content types:
  - Post, Category, Tag, Author (+ media usage)
- Enable Draft/Publish and confirm editorial workflow approach

Checkpoint:
- Strapi Admin accessible
- API can list published posts

---

## EXEC-2 — FRONTEND: Public Blog (Strapi-backed)

Goal: keep `/blog` working while moving to canonical URLs, without waiting for backend.

Tasks:
- Public list: `/blog` fetches published posts from Strapi
- Canonical route: `/blog/[slug]` fetches by slug and renders SEO meta
- Deprecation: safely remove/redirect `/blog/post` sessionStorage flow

Checkpoint:
- Manual: `/blog` renders list (mock provider)
- Manual: `/blog/<slug>` loads directly (shareable)
- `npm run build` passes

---

## EXEC-3 — ADMIN INTEGRATION (Our dashboard entrypoint)

Goal: make Blog accessible from our admin without rebuilding the CMS UI.

Tasks:
- Add/keep an Admin sidebar entry that links to Strapi Admin ("Blog (Strapi)")
- Optional: add a small read-only page that deep-links to Strapi entries (no editing)

Checkpoint:
- Admin can reach Strapi quickly from our dashboard

---

## EXEC-4 — AUTOMATION MVP (Create drafts in Strapi)

Goal: generate drafts automatically per the raw plan.

Tasks:
- n8n (or worker) generates draft content (topic → outline → draft → SEO fields)
- Create draft posts in Strapi via API
- Store source links and job metadata (location decided in SOT)

Checkpoint:
- Manual: automation creates a Strapi draft
- Admin can approve/publish in Strapi

---

## EXEC-5 — SCHEDULING + REVALIDATION

Goal: scheduled publishing is reliable and reflected on the public site.

Tasks:
- Scheduling approach:
  - Use Strapi scheduling (if available in chosen setup), OR
  - Use n8n/worker to publish at scheduled time
- After publish:
  - Trigger Next.js revalidation (if using caching)
  - Regenerate sitemap

Checkpoint:
- Manual: scheduled post publishes at the right time and appears publicly

---

## EXEC-6 — RSS RESEARCH SIGNALS (Optional, Blog module only)

Goal: AI generates drafts, admin approves.

Tasks:
- Fetch RSS from allowlisted sources
- Convert RSS items into topic ideas + citation links
- Ensure no verbatim copying into generated posts

---

## EXEC-7 — SEO Plumbing

Tasks:
- Blog sitemap integration

Checkpoint:
- Manual: schedule in future → publish occurs
- Sitemap includes published blog posts

---

## Safety / Stop Rules

- If any phase introduces TypeScript errors, build warnings, or route conflicts: stop and fix before continuing.
- Never use destructive DB commands (`migrate reset`, `db push --force-reset`, etc.).
