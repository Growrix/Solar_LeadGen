# News Engine Phase 16 Post‑Feature Docs Addendum
**Date**: 2026-01-15
**Scope**: Reliability hardening for OG images, key selection safety, and publish reflection.

---

## 1) What Changed (Operator Summary)
- **Public OG images are now reliable even with private S3 buckets** via an app proxy route.
- **OpenAI key selection is safer in dev/E2E**: News Engine uses env `OPENAI_API_KEY` by default unless explicitly configured to prefer Key Vault.
- **OG override ingestion accepts common page URLs** by resolving `og:image` / `twitter:image` when the provided URL is HTML.
- **Publish/Republish reflects latest edits** by persisting edits + image controls before publishing.
- **Next Image allowlist updated** so S3/CloudFront-hosted images don’t get silently blocked.

---

## 2) Updated Operator Guidance (Key Flows)

### Review Modal – OG Image Reliability
- If you see an S3-backed or proxy URL for the OG image, it should load consistently on public pages.
- If you paste a page URL (not a direct image), ingestion will attempt to resolve `og:image`/`twitter:image` before uploading.

### Key Vault vs Env Key (Operational Safety)
- In environments where Key Vault keys may be placeholders (e.g., dev/E2E), the system will default to `.env` `OPENAI_API_KEY` for News Engine AI calls unless configured otherwise.
- If Key Vault IMAGES keys are missing, OG image generation can still work via env fallback.

---

## 3) Functionality Map (Phase 16 Delta)
- **Proxy-backed public URLs**:
  - API: `GET /api/public/news-engine/s3/[...key]`
  - Helper: `src/lib/s3.ts`
- **OG image generation safeguards**:
  - API: `POST /api/admin/news-engine/items/[id]/og-image/generate`
  - Fallback + model guards: `src/app/api/admin/news-engine/items/[id]/og-image/generate/route.ts`
- **Override URL page resolution**:
  - Helper: `src/lib/news-engine/og-image.ts`
- **Publish reflection sequencing**:
  - UI: `src/components/news-engine/v6/modals/ReviewModal.tsx`

---

## 4) Verification Checklist (Phase 16)
- ✅ `npx tsc --noEmit`
- ✅ `npm run build`
- ✅ Playwright Phase 13 + Phase 14 specs

---

## 5) Known Limitations
- Proxy route requires the app to be able to read the S3 object; AWS credentials must be configured server-side.
- If an HTML page’s `og:image` points to a blocked or geo-restricted host, ingestion may still fail with a fetch error.

---

**End of Phase 16 Addendum**
