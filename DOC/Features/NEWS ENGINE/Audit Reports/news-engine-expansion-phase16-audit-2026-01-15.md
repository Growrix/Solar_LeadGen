# News Engine Phase 16 Audit Addendum (Owner-Reported Gap Remediation)
**Date**: 2026-01-15
**Scope**: Targeted hardening for OG image reliability + key selection safety + publish reflection.

## Executive Summary
Phase 16 closes the remaining reliability gaps reported after Phase 15 by making the OG image pipeline resilient to private S3 buckets (proxy-backed public URLs), making OpenAI key selection safe in dev/E2E (env-first fallback with an explicit opt-in for Key Vault preference), and improving operator workflows so publish/republish reflects the latest edits and image-control state.

---

## 1) Operator Symptoms → Root Causes → Fixes

### A) OG images not reliably visible on public pages
- **Symptom**: Public `/news` and `/news/[slug]` sometimes show broken/blocked OG images, especially when S3 objects are not publicly readable.
- **Root cause**: The public pages were relying on direct bucket URLs that may be private or blocked by Next image host allowlists.
- **Fix**:
  - Default to proxy-backed public URLs for News Engine images.
  - Add proxy route to stream objects via the app.
  - Expand Next image allowlist for expected S3/CloudFront patterns.
- **Targets**:
  - `src/lib/s3.ts`
  - `src/app/api/public/news-engine/s3/[...key]/route.ts`
  - `next.config.js`

### B) OG image generation fails in dev/E2E due to “dummy DB keys” or missing Key Vault IMAGES key
- **Symptom**: Generating OG images fails in certain environments despite `.env` having a valid `OPENAI_API_KEY`.
- **Root cause**: Key selection could choose non-working keys (e.g., seeded/dev placeholders) unless a reliable policy is enforced.
- **Fix**:
  - Prefer env `OPENAI_API_KEY` by default for News Engine AI runtime unless explicitly opting into Key Vault usage.
  - For OG image generation, fall back to env `OPENAI_API_KEY` when Key Vault IMAGES key is missing.
  - Guard invalid/unsupported image models.
- **Targets**:
  - `src/lib/news-engine/ai-runtime.ts`
  - `src/app/api/admin/news-engine/items/[id]/og-image/generate/route.ts`

### C) “Override image URL” fails for common page URLs
- **Symptom**: Operators paste a page URL (not a direct image) and ingestion fails.
- **Root cause**: Many sources publish images via page meta tags (`og:image`, `twitter:image`).
- **Fix**: Resolve HTML pages by extracting `og:image`/`twitter:image` then ingest the resolved image.
- **Targets**:
  - `src/lib/news-engine/og-image.ts`

### D) Republish/publish doesn’t reflect last edits/image controls
- **Symptom**: Operators publish/republish and later discover the public item doesn’t reflect latest changes.
- **Root cause**: Inconsistent sequencing between saving edits, persisting image controls, and publish action.
- **Fix**: Ensure publish/republish flow persists edits + image controls before publish.
- **Targets**:
  - `src/components/news-engine/v6/modals/ReviewModal.tsx`

---

## 2) Verification Evidence (Repeatable)
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS
- Playwright regression coverage:
  - `tests/e2e/news-engine-phase13-router-vault-provenance.spec.ts`: PASS
  - `tests/e2e/news-engine-phase14-expansion.spec.ts`: PASS

---

## 3) Outcome
**Audit Outcome**: ✅ Phase 16 remediation is production-ready for the scoped reliability gaps.
