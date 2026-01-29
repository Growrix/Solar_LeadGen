# News Engine Expansion — Phase 14 / Phase 4
## E2E Feature Implementation Inventory & Mapping Audit (2026-01-14)

## Purpose
Provide a factual, implementation-driven inventory and mapping of the **Phase 14 / Phase 4** expansion work across DB + API + frontend wiring.

This report focuses on the Phase 4 deliverables:
- **US3**: Server-backed OG image health check (“Re-check”) + persisted last-check fields.
- **US4**: Provenance response enrichment to support source rows with kind/title/url/timestamp.

## Inputs
- Backend plan: `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/news-engine-expansion-backend-plan-v3-2026-01-14.md`
- Inventory/mapping audit prompt: `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/feature-implementation-inventory-mapping-audit-prompt.md`

## Scope
- Prisma schema + migration(s)
- Admin API routes:
  - `POST /api/admin/news-engine/items/[id]/og-image/check`
  - `GET /api/admin/news-engine/items/[id]/image-controls`
  - `GET /api/admin/news-engine/items/[id]/provenance`
- Client wrappers: `src/lib/news-engine/client.ts`
- Admin UI wiring: `src/components/news-engine/v6/modals/ReviewModal.tsx`

## Executive Summary
- **DB**: `NewsItem` includes new persisted OG image last-check fields; additive migration exists.
- **API**: New server-side OG check endpoint exists (Node runtime) and persists results; provenance returns unified `sources[]` while keeping legacy URL arrays.
- **Frontend**: Review modal uses server check endpoint for “Re-check” and renders enriched provenance sources when present (with graceful fallback to legacy URL arrays).
- **Gates**: `npx prisma validate`, `npx prisma generate`, `npx tsc --noEmit`, `npm run build` were run and passed (ESLint warnings in unrelated file only).

## 1) File & Directory Inventory

### Database / Prisma
- `prisma/schema.prisma`
  - `model NewsItem` additions:
    - `ogImageLastCheckedAt DateTime?`
    - `ogImageLastCheckStatus String?`
    - `ogImageLastCheckError String?`
- `prisma/migrations/20260114130000_news_engine_phase14_og_image_health_fields/migration.sql`
  - Adds 3 additive columns to `news_items`.

### Admin API Routes (Phase 4)
- `src/app/api/admin/news-engine/items/[id]/og-image/check/route.ts`
  - New Phase 4 endpoint (POST).
- `src/app/api/admin/news-engine/items/[id]/image-controls/route.ts`
  - Extended responses to include persisted last-check fields.
- `src/app/api/admin/news-engine/items/[id]/provenance/route.ts`
  - Enriched response includes `sources[]` while keeping `rssEntryUrls`/`researchUrls`.

### Backend Utilities
- `src/lib/news-engine/audit.ts`
  - `NewsEngineAuditAction` includes: `news_item_og_image_checked`
  - `writeNewsAuditLog()` writes to DB, best-effort.
- `src/lib/news-engine/index.ts`
  - Exports `writeNewsAuditLog` (via `export * from './audit';`).

### Client Wrappers
- `src/lib/news-engine/client.ts`
  - `AdminItemImageControls` includes last-check fields.
  - `AdminItemProvenance` includes optional `sources[]`.
  - Adds `adminCheckItemOgImage(itemId)`.

### Admin UI
- `src/components/news-engine/v6/modals/ReviewModal.tsx`
  - Reads `ogImageLastCheckedAt/status/error` from image-controls response.
  - “Re-check” calls the server check endpoint.
  - Provenance rendering uses `provenance.sources` if present.

## 2) Frontend Implementation Mapping

### Review Modal — Image Controls
Location: `src/components/news-engine/v6/modals/ReviewModal.tsx`

Key behaviors:
- On open, loads:
  - `adminFetchItemProvenance(item.id)`
  - `adminFetchItemImageControls(item.id)`
- Displays badge: `OK | BROKEN | UNKNOWN`.
- Displays a tooltip with last checked timestamp and error (if any).
- “Re-check”:
  - Calls `adminCheckItemOgImage(item.id)`.
  - Updates local state:
    - `ogImageHealth = res.status`
    - `ogImageCheckedAt = res.checkedAt`
    - `ogImageCheckError = res.error`

### Review Modal — Provenance
Location: `src/components/news-engine/v6/modals/ReviewModal.tsx`

Key behaviors:
- If `provenance.sources` exists:
  - Shows enriched source list with:
    - kind badge (RSS/WEB/SOCIAL/JOURNAL/TREND)
    - title
    - timestamp (relative + tooltip)
    - URL
- If `provenance.sources` is absent:
  - Falls back to legacy arrays:
    - `rssEntryUrls`
    - `researchUrls`

## 3) API Endpoint Mapping

### POST /api/admin/news-engine/items/[id]/og-image/check
File: `src/app/api/admin/news-engine/items/[id]/og-image/check/route.ts`

Auth:
- `requireAdmin()`

Request:
- No body

Logic:
- Load item `{ id, ogImageUrl }`.
- Validate URL is non-empty + http/https.
- Server check:
  - `HEAD` with timeout
  - fallback: `GET` with `Range: bytes=0-0` for origins that reject `HEAD`
- Classify:
  - `OK` if `res.ok` or 3xx (redirects allowed)
  - `BROKEN` on non-2xx/non-3xx or on fetch/timeout errors
  - `UNKNOWN` for missing/invalid URL
- Persist:
  - `ogImageLastCheckedAt = now`
  - `ogImageLastCheckStatus = status`
  - `ogImageLastCheckError = error`
- Audit log:
  - `writeNewsAuditLog({ action: 'news_item_og_image_checked', ... })`

Response:
```json
{
  "ok": true,
  "itemId": "...",
  "ogImageUrl": "...",
  "status": "OK" | "BROKEN" | "UNKNOWN",
  "checkedAt": "...",
  "error": "..." | null
}
```

### GET /api/admin/news-engine/items/[id]/image-controls
File: `src/app/api/admin/news-engine/items/[id]/image-controls/route.ts`

Auth:
- `requireAdmin()`

Response includes:
- `ogImageUrl`
- `ogImageLastCheckedAt`
- `ogImageLastCheckStatus`
- `ogImageLastCheckError`
- `ogImageApprovalRequired`
- `ogImageApprovedAt`
- `ogImageApprovedById`

### GET /api/admin/news-engine/items/[id]/provenance
File: `src/app/api/admin/news-engine/items/[id]/provenance/route.ts`

Auth:
- `requireAdmin()`

Response includes:
- `sources[]` (new)
- `rssEntryUrls` (legacy)
- `researchUrls` (legacy)
- `stages[]` (AI request log trace)

`sources[]` fields:
- `kind`: RSS | WEB | SOCIAL | JOURNAL | TREND
- `title`
- `url`
- `timestamp`: `publishedAt ?? fetchedAt ?? null`

## 4) Backend Logic & Service Mapping
- Server OG image check logic is implemented directly inside the route handler via helper functions:
  - `validateHttpUrl()`
  - `fetchWithTimeout()`
  - `checkOgImageUrlServerSide()`

- Audit logging uses `writeNewsAuditLog()` in `src/lib/news-engine/audit.ts`.

## 5) Database & Prisma Model Mapping

### NewsItem (Phase 4 additions)
- `ogImageLastCheckedAt DateTime?`
- `ogImageLastCheckStatus String?`
- `ogImageLastCheckError String?`

Migration:
- `prisma/migrations/20260114130000_news_engine_phase14_og_image_health_fields/migration.sql`

## 6) E2E Flow Trace (Phase 4)

### Flow A — Admin “Re-check” OG image health
1. Admin opens Review modal.
2. UI fetches image controls.
3. UI displays persisted last check status (if any).
4. Admin clicks “Re-check”.
5. UI calls `POST /api/admin/news-engine/items/[id]/og-image/check`.
6. Backend validates URL, runs server-side reachability check, persists status/error/timestamp.
7. UI updates badge + tooltip from response.

### Flow B — Admin sees enriched provenance sources
1. Admin opens Review modal.
2. UI calls `GET /api/admin/news-engine/items/[id]/provenance`.
3. Backend returns `sources[]` derived from `sourceEntries` and `researchEntries`.
4. UI renders enriched sources list when available; otherwise falls back to legacy URL arrays.

## 7) Observed Gaps / TODOs
- None found within Phase 4 scope.

Notes:
- Items created before provenance enrichment may still show URL-only fallback depending on whether related source/research rows exist.
- Phase 4 changes are additive and backward-compatible (legacy arrays retained).
