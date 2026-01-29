# News Engine — Post-Implementation Audit (Phase 13)

**Date**: 2026-01-08

## Scope
This audit focuses on Phase 13 deliverables added to the News Engine admin experience:
- AI Router defaults (per-task model profile selection)
- Key Vault (encrypted multi-key storage + pool selection)
- Per-item provenance endpoint/UX
- Per-item image controls (approval required + OG override URL)

Primary reference: `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-2026-01-08.md`

## Current Verification Snapshot
**Automated**
- Phase 13 Playwright E2E: `npm run test:e2e:news-engine-phase13`
  - Result: **2 passed, 1 skipped**
  - Skipped: Key Vault test (requires master key env)
  - Spec: `tests/e2e/news-engine-phase13-router-vault-provenance.spec.ts`

**Key Vault configuration behavior (from implementation)**
- Master key env var name(s): `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` (preferred) or `NEWS_KEY_VAULT_MASTER_KEY`
- Accepted formats:
  - 32-byte base64
  - 32-byte base64url
  - 64-char hex (optionally prefixed with `hex:`)
- Without a valid master key:
  - `POST /api/admin/news-engine/key-vault` cannot encrypt and will fail (server error)
  - `GET /api/admin/news-engine/key-vault` will return masked keys as `••••` (cannot decrypt)
  - AI runtime selection (`resolveNewsApiKeyForPool`) returns `null` and should fall back to env-based provider keys

**Runtime hardening**
- `PUT /api/admin/news-engine/items/[id]` now tolerates empty/invalid JSON bodies and returns a no-op success response.

## Audit Findings (By Scope)

### 1) Page & Modal Audit (Frontend)
**Covered surfaces**
- Admin hub: `src/components/news-engine/AdminNewsEngineHub.tsx`
- Settings: `src/components/news-engine/v6/tabs/SettingsTab.tsx`
- Review modal: `src/components/news-engine/v6/modals/ReviewModal.tsx`

**Findings**
- Settings → **AI Router** renders per-task dropdowns and persists defaults via backend.
- Review Modal loads provenance + image controls on open; SEO tab provides OG override URL input and approval toggle.

**Gaps / Risk**
- **Model Profiles have no UI CRUD**. The Settings page *consumes* model profiles but does not provide a way to create/enable them via UI.
  - Impact: AI Router dropdowns can appear “empty” (only `—`) in fresh DBs.
  - Current workaround: create model profiles via API or seed helper.

### 2) API Endpoint Audit
**Phase 13 admin endpoints implemented**
- Model Profiles
  - `GET/POST /api/admin/news-engine/model-profiles`
  - `PUT/DELETE /api/admin/news-engine/model-profiles/[id]`
- AI Router defaults
  - `GET/PUT /api/admin/news-engine/ai-router/defaults`
- Key Vault
  - `GET/POST /api/admin/news-engine/key-vault`
  - `PUT/DELETE /api/admin/news-engine/key-vault/[id]`
- Item provenance + image controls
  - `GET /api/admin/news-engine/items/[id]/provenance`
  - `GET/PUT /api/admin/news-engine/items/[id]/image-controls`

**Findings**
- Admin endpoints are guarded by `requireAdmin`.
- AI Router defaults endpoint validates that selected `modelProfileId` is enabled.

**Gaps / Risk**
- **Key Vault endpoints require a master key env var**.
  - If missing, key creation/update cannot succeed.

### 3) Backend Logic & Service Audit
**Findings**
- Key Vault encryption + selection logic exists under `src/lib/news-engine/`.
- AI Router resolution helpers exist under `src/lib/news-engine/`.

**Gaps / Risk**
- Default model profile seeding reduces “empty dropdown” risk but does not replace the missing UI for CRUD.

### 4) Database & Prisma Audit
**Findings**
- Schema includes Phase 13 additions (router defaults, model profiles, api keys, image-control fields).

**Gaps / Risk**
- Environments running old schema will fail at runtime; migrations must be applied.

### 5) E2E Functional Audit
**Covered by tests**
- Router defaults can be selected and saved.
- Review modal loads provenance and image controls; OG override persists.

**Not covered / Skipped**
- Key Vault create/update (requires master key env)

### 6) Internal Wiring & Integration Audit
**Findings**
- SettingsTab loads: model profiles + router defaults + masked key vault list on mount.
- ReviewModal loads: provenance + image controls on open.

**Gaps / Risk**
- “Static vs working” confusion remains primarily around:
  1) Model Profiles (no UI to create/enable)
  2) Key Vault (master key env requirement)

## Summary Table
| Scope | Status | Primary Risk |
|---|---|---|
| UI (Settings + Review) | Mostly complete | Model Profiles are API-only (no UI CRUD) |
| API | Complete for Phase 13 | Key Vault requires master key env |
| DB | Complete (with migration) | Runtime failures if migrations not deployed |
| E2E | 2/3 green | Key Vault skipped until env configured |

## Recommendations (Actionable)
1) Add a minimal **Model Profiles** CRUD UI (create/enable/disable) inside Settings.
2) Add a clear Settings UI note when **Key Vault master key env** is not configured (avoid silent failure confusion).
3) Keep Phase 13 E2E as a regression suite; optionally add a separate job that runs Key Vault tests only when master key is present.
