# News Engine Expansion — Backend Plan (Phase 14 / Phase 4) (2026-01-14)

## Purpose
Implement the backend changes required to complete the Phase 14 expansion items that were truthfully labeled as “planned/unavailable” during Phase 3.

Primary targets:
- **US3**: Server-backed OG image health check (“Re-check”) + persisted last-check fields.
- **US4**: Provenance endpoint enrichment so the UI can show complete sources (RSS + research) with kind/title/url/timestamp.

## Inputs / Single Sources of Truth
- Unified plan: `DOC/FEATURES/NEWS ENGINE/Plan/NEWS-ENGINE-EXPANSION-UNIFIED-PLAN-V3-2026-01-14.md`
- Acceptance criteria: `DOC/FEATURES/NEWS ENGINE/Plan/Expand_userstory.md`
- Expansion SOT addendum: `DOC/FEATURES/NEWS ENGINE/SOT/EXPANSION-SOT-ADDENDUM-2026-01-14.md`
- Latest frontend audit (Phase 3): `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-expansion-phase14-phase3-frontend-audit-2026-01-14.md`

## Current State Summary (as of Phase 3)
- Admin UI already displays an OG image health badge and “Re-check”, but it is **client-only**.
- Admin provenance UI provides “Copy/Open sources”, but rows are **URL-only**, with “Details pending Phase 4”.
- Backend already has:
  - Provenance endpoint: `GET /api/admin/news-engine/items/[id]/provenance`
  - Image controls endpoint: `GET/PUT /api/admin/news-engine/items/[id]/image-controls`

## Deliverables
1. Add DB fields on `NewsItem` to persist server image check results.
2. Implement server endpoint to check OG image reachability for a given item.
3. Enrich provenance endpoint response to provide a unified `sources[]` list with required fields.
4. Update frontend wiring to use the server check endpoint and render enriched provenance.
5. Gates: `npx prisma validate`, `npx tsc --noEmit`, `npm run build`.

---

## A) Prisma / DB Changes (Additive)

### Schema changes (proposed)
Add fields to `model NewsItem` in `prisma/schema.prisma`:
- `ogImageLastCheckedAt DateTime?`
- `ogImageLastCheckStatus String?` (values: `OK|BROKEN|UNKNOWN`)
- `ogImageLastCheckError String?`

Notes:
- Keep types simple initially (String + convention) to reduce migration friction.
- If the codebase already uses enums for similar statuses, consider a Prisma enum instead.

### Migration
- Create a single additive migration (name suggestion: `add_news_item_og_image_health_fields`).
- Validate with `npx prisma validate`.

---

## B) Endpoint: Server OG Image Health Check (US3)

### Route
`POST /api/admin/news-engine/items/[id]/og-image/check`

File:
- `src/app/api/admin/news-engine/items/[id]/og-image/check/route.ts`

### Auth
- `requireAdmin()`

### Behavior
- Load item by id; determine effective URL from `NewsItem.ogImageUrl` (and/or image-controls source of truth if different).
- Validate URL:
  - must be `http`/`https`
  - must not be empty
- Perform server-side check:
  - Prefer `fetch(url, { method: 'HEAD' })` with timeout
  - If HEAD not supported by origin, fallback to `GET` with `Range: bytes=0-0` if practical
  - Classify:
    - `OK`: response is 2xx (or 3xx if you decide redirects are allowed)
    - `BROKEN`: network error, timeout, or non-2xx
    - `UNKNOWN`: missing/invalid URL
- Persist:
  - `ogImageLastCheckedAt = now`
  - `ogImageLastCheckStatus`
  - `ogImageLastCheckError` (short message, optional)
- Write audit log via `writeNewsAuditLog` (action suggestion: `news_item_og_image_checked`).

### Response shape (proposed)
```json
{
  "ok": true,
  "itemId": "...",
  "ogImageUrl": "...",
  "status": "OK" | "BROKEN" | "UNKNOWN",
  "checkedAt": "2026-01-14T...Z",
  "error": "..." | null
}
```

---

## C) Endpoint: Provenance Enrichment (US4)

### Route
`GET /api/admin/news-engine/items/[id]/provenance`

File:
- `src/app/api/admin/news-engine/items/[id]/provenance/route.ts`

### Behavior
Expand response to include a unified `sources[]` list derived from:
- `NewsSourceEntry` rows linked to the item (`sourceEntries`)
- `NewsResearchEntry` rows linked to the item (`researchEntries`)

### Required output per acceptance
Each source row should include:
- `kind`: `RSS|WEB|SOCIAL|JOURNAL|TREND` (RSS entries are `RSS`; research entries use `NewsResearchKind`)
- `title`
- `url`
- `timestamp`: prefer `publishedAt`, fallback `fetchedAt`

### Response shape (proposed)
```json
{
  "itemId": "...",
  "sourceType": "...",
  "sources": [
    {
      "kind": "RSS",
      "title": "...",
      "url": "...",
      "timestamp": "2026-01-14T...Z"
    }
  ],
  "stages": [
    {
      "action": "...",
      "taskType": "...",
      "provider": "...",
      "model": "...",
      "modelProfileLabel": "...",
      "apiKeyLabel": "...",
      "createdAt": "..."
    }
  ]
}
```

Compatibility:
- Keep existing fields (`rssEntryUrls`, `researchUrls`, `stages`) temporarily if needed, but prefer migrating the UI to `sources[]`.

---

## D) Frontend Wiring (Phase 4 required)

### Client wrappers
Update `src/lib/news-engine/client.ts`:
- Add `adminCheckItemOgImage(itemId)` wrapper
- Extend provenance types to include `sources[]`

### Review modal
Update `src/components/news-engine/v6/modals/ReviewModal.tsx`:
- Replace client-only `new Image()` health check with server call.
- Render provenance `sources[]` rows (kind/title/timestamp + link).
- Remove Phase 3 “Phase 4 pending” labels once backend is live.

---

## E) Gates / Validation
- `npx prisma validate`
- `npx tsc --noEmit`
- `npm run build`

Non-goals:
- No new E2E scripts in Phase 4 (that’s Phase 5).
- No cron/runner jobs for daily checks unless explicitly pulled into scope.
