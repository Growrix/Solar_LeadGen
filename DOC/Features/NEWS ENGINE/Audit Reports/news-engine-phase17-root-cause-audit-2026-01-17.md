# News Engine — Phase 17 Root-Cause Audit (2026-01-17)

## Scope
Audit the Phase 17 OG image pipeline end-to-end (UI  API  validation  S3 proxy  approval/publish gating) and explain why the Phase 17 “PASS” reporting did not match visual/manual testing.

This audit is intentionally focused on root causes and evidence. Fixes are tracked separately in the Phase 17 redo section of the task ledger.

---

## Observed Issues (from operator report)
1. AI image generation fails (DALLE access).
2. Free-source image flow does not reliably produce a usable image URL.
3. OG preview only shows after clicking “Save to S3”; initial URL should be auto-ingested to S3.
4. “Approve OG Image” is blocked by “Image URL is invalid” / URL-health failures even when preview renders.
5. Publishing gets blocked as a consequence of approval issues.
6. New issue introduced: build/typecheck failures.

---

## High-Signal Evidence Collected
### A) Build is currently failing
- `npm run build` fails with a type error in `src/app/login/page.tsx` ("searchParams" possibly null).
  - This contradicts the Phase 17 ledger claim that build passed.

### B) Server logs show OG image generation failing at the OpenAI call
- `POST /api/admin/news-engine/items/[id]/og-image/generate` fails with:
  - `Error: Unknown parameter: 'response_format'.`
- This prevents any DALLE-based OG image generation from succeeding.

### C) Server-side ingest to S3 frequently fails with 403/404/503 from remote hosts
- `POST /api/admin/news-engine/items/[id]/og-image/ingest` fails with:
  - `Image fetch failed (404)`
  - `Image fetch failed (503)`
  - `Image fetch failed (403)`
- This is consistent with remote origins blocking automated fetches (bot detection / auth-required / hotlink protections).

### D) URL health check is incompatible with proxy-relative URLs
- `src/lib/s3.ts` intentionally returns a *relative* URL by default:
  - `/api/public/news-engine/s3/<encodedKey>`
- `POST /api/admin/news-engine/items/[id]/og-image/check` currently validates `ogImageUrl` using `new URL(trimmed)`, which rejects relative URLs.
  - Result: health check becomes `UNKNOWN` with an error like “ogImageUrl is not a valid URL”, despite the image being fetchable from the same-origin route.

---

## Root Causes
### RC1: OpenAI image-generation request payload is invalid for the current API/model behavior
**Where:** `src/app/api/admin/news-engine/items/[id]/og-image/generate/route.ts`

**Symptom:** OpenAI rejects the request with “Unknown parameter: 'response_format'”.

**Impact:** AI image generation fails immediately and never reaches ingest-to-S3.

---

### RC2: Ingest-to-S3 is brittle against real-world image hosts
**Where:** `src/lib/news-engine/og-image.ts` and `src/app/api/admin/news-engine/items/[id]/og-image/ingest/route.ts`

**Symptom:** Remote fetch often fails with 403/404/503.

**Why:** Many “free” or semi-free sources (and especially gated marketplaces) block server-side fetches without user-agent/referrer/cookies or require auth.

**Impact:**
- Auto-ingest cannot complete reliably.
- Operators observe preview loading (browser can fetch), but server ingest fails, so approval/publish path never becomes deterministic.

---

### RC3: URL health check rejects valid, same-origin proxy URLs
**Where:** `src/app/api/admin/news-engine/items/[id]/og-image/check/route.ts`

**Symptom:** Health check can mark URLs as invalid even though preview works.

**Why:** The check endpoint assumes `ogImageUrl` is an absolute `http(s)` URL.

**Impact:**
- “BROKEN/UNKNOWN” status appears even for S3-proxied images.
- This contributes to false “URL invalid” signals and operator confusion.

---

### RC4: Phase 17 verification reporting does not match actual, current repository state
**Where:** `DOC/FEATURES/NEWS ENGINE/tasks.md` Phase 17 section.

**Symptom:** Ledger claims `tsc` + `build` + Phase 17 Playwright spec PASS.

**Reality in this workspace state:**
- `npm run build` fails.
- The Phase 17 Playwright spec is among failing tests.

**Likely explanation:** Tests were either not run in the exact same state that was reported, or the checks were run but later changes/regressions were introduced without updating the ledger.

---

## Why the Tests Looked “Green” but Visual QA Failed
1. **Mismatch between test URLs and real operator URLs:** tests likely use deterministic E2E routes (e.g., local `/api/e2e/...`) while operators paste real-world URLs (Envato, etc.) that block server-side fetch.
2. **Health-check semantics were not asserted against proxy-relative URLs:** tests can pass while `/og-image/check` still marks a valid proxy URL as invalid.
3. **AI-image generation path not validated end-to-end against OpenAI error modes:** the test may accept fallback behavior without ensuring AI generation works when configured, and/or it may not surface invalid request payloads.

---

## Corrective Actions (Phase 17 Redo)
Planned implementation changes to address the above root causes:
- Fix OpenAI image generation request payload; add robust fallback and clear operator notices.
- Harden ingest fetch behavior (headers, redirects, HTML og:image resolution), and improve operator-facing error messaging when a host blocks server-side fetch.
- Update OG image check endpoint to support same-origin proxy-relative URLs.
- Update ledger Phase 17 verification items to reflect actual pass/fail and re-run gates after fixes.

---

## Notes
This audit does not attempt to “paper over” blocked-origin behavior. If an origin cannot be fetched server-side, the only reliable solution is: pick a fetchable source or ingest from a fetchable URL (or add a user-upload flow).
