# Phase 16 — Failure Reproduction Notes (Planning Evidence)
**Date**: 2026-01-15
**Purpose**: Capture the operator-reported failures that motivated Phase 16, with reproducible steps and concrete error signatures.

> Note: This repo automation environment cannot capture UI screenshots. This document records reproducible steps + representative request/response/log evidence and links to the implementation fixes and verification results.

---

## 1) OpenAI “dummy key” error

### UI path
1. Go to `/admin/news-engine`.
2. Open a `NEEDS_REVIEW` item.
3. In the Review modal, trigger an AI action that calls the OpenAI API (e.g., OG image generation).

### Observed failure signature (representative)
- Server fails with an OpenAI authentication/authorization error when a placeholder/dev key is selected.
- Typical observable outcomes:
  - Operator sees an error toast/alert.
  - Server logs show `401/403` or a provider error indicating invalid API key.

### Root cause hypothesis (confirmed by code audit)
- Key selection could choose a non-working/dev placeholder key unless env-first fallback is enforced.

### Fix linkage
- Env-first runtime selection unless explicitly opting into Key Vault preference:
  - `src/lib/news-engine/ai-runtime.ts`
- OG image generation env fallback + model guards:
  - `src/app/api/admin/news-engine/items/[id]/og-image/generate/route.ts`

---

## 2) OG override URL not previewing (common HTML pages)

### UI path
1. Review modal → **SEO & Compliance** → **Image controls**.
2. Paste a non-direct-image URL (an HTML page) into **Override image URL**.
3. Click **Save to S3**.

### Observed failure signature (representative)
- Ingest fails because the URL returns HTML rather than an image.
- Server logs indicate fetch/content-type mismatch.

### Root cause hypothesis (confirmed)
- Many sources use meta tags (`og:image`, `twitter:image`) pointing to the real image.

### Fix linkage
- Resolve HTML pages by extracting `og:image`/`twitter:image` then ingest the resolved image:
  - `src/lib/news-engine/og-image.ts`

---

## 3) Republish not reflecting edits on public

### UI path
1. Open a `PUBLISHED` item in the Review modal.
2. Edit title/tags/content.
3. Click **Republish** (or publish action for published items).
4. Refresh `/news` and `/news/[slug]`.

### Observed failure signature (representative)
- Public pages show the previous content after republish.

### Root cause hypothesis
- Publish/republish sequencing and/or caching invalidation issues.

### Fix linkage
- Persist edits + image controls before publish/republish:
  - `src/components/news-engine/v6/modals/ReviewModal.tsx`

---

## 4) Public images missing

### UI path
1. Publish an item with an OG image.
2. Visit `/news` and `/news/[slug]`.

### Observed failure signature (representative)
- Broken image on public pages when bucket/object is private or blocked by Next image allowlist.

### Root cause hypothesis
- Direct bucket URLs may not be publicly readable; Next image host allowlist may reject.

### Fix linkage
- Proxy-backed public URLs + proxy route + Next image allowlist updates:
  - `src/lib/s3.ts`
  - `src/app/api/public/news-engine/s3/[...key]/route.ts`
  - `next.config.js`

---

## 5) Verification evidence (post-fix)
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS
- Playwright:
  - `tests/e2e/news-engine-phase13-router-vault-provenance.spec.ts`: PASS
  - `tests/e2e/news-engine-phase14-expansion.spec.ts`: PASS
  - `tests/e2e/news-engine-phase17-og-image-remediation.spec.ts`: PASS (covers OG ingest + approve + publish flows deterministically)
