# News Engine — Post-Implementation Audit (Phase 13 + Production Clarity Follow-ups)

**Date**: 2026-01-10

## Scope
This audit covers the implemented News Engine “Production Clarity” follow-ups and Phase 13 regression surfaces:
- AI Router defaults (task → model profile)
- Model Profiles CRUD (create/edit/enable/disable)
- Key Vault (encrypted API keys; master key guarded)
- Provenance endpoint + Review Modal wiring
- Image controls persistence (OG override + approval required)
- Automation scripts validation (runner HTTP + OpenAI+DB draft)

Primary references:
- `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/`
- `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/tasks.md`

## Verification Snapshot (2026-01-10)

### Automated / E2E
- Phase 13 Playwright suite: `npm run test:e2e:news-engine-phase13`
  - Result: **3 passed**
  - Spec: `tests/e2e/news-engine-phase13-router-vault-provenance.spec.ts`

### Script Coverage
- Runner HTTP seed test: `npx tsx scripts/news-engine-rss-http-test.ts`
  - Result: **PASSED**
  - What it verifies:
    - Can seed a disabled RSS source + a NEW entry
    - Can call internal automation runner HTTP endpoint
    - Runner processes the seeded entry and creates a `NewsItem`

- Local OpenAI + DB draft test: `npx tsx scripts/news-engine-e2e-automation-test.ts`
  - Result: **PASSED**
  - What it verifies:
    - Direct model call can create structured draft content
    - DB rows are created (`NewsItem`, `NewsAiRequestLog`, and `NewsSourceEntry` status transitions)

### Post-Run Safety Cleanup
- Safe cleanup script: `npx tsx scripts/news-engine-cleanup-test-data.ts --apply`
  - Actions (scoped to E2E-labeled data only):
    - Disables `NewsApiKey` rows with E2E labels
    - Deletes E2E sources (and cascades E2E entries)
    - Soft-deletes E2E items (sets `deletedAt`)
    - Deletes explicit `e2e_*` AI request logs

## Audit Findings (By Scope)

### 1) Page & Modal Audit (Frontend)
**Covered surfaces**
- Admin hub: `src/components/news-engine/AdminNewsEngineHub.tsx`
- Settings: `src/components/news-engine/v6/tabs/SettingsTab.tsx`
- Review modal: `src/components/news-engine/v6/modals/ReviewModal.tsx`

**Findings**
- Settings → AI Router defaults can be saved and persist after reload.
- Settings → Model Profiles has working CRUD UI:
  - Create, edit, enable/disable are wired to backend and persist.
- Settings → Key Vault shows deterministic “locked” state when master key is missing/invalid and disables Add/Edit actions.
- Review Modal:
  - Loads provenance on open.
  - Loads and persists image controls (approval required + OG override URL).

**Risks / Notes**
- Key Vault remains intentionally gated by a valid master key env var; this is expected for secure operation.

### 2) API Endpoint Audit
**Admin endpoints in scope**
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
- Key Vault list response exposes `masterKeyConfigured` to support deterministic UI guardrails.

### 3) Backend Logic & Service Audit
**Findings**
- Key Vault encryption uses AES-256-GCM and requires a valid 32-byte master key.
- AI Router defaults enforce enabled model profiles.
- Default model profile seeding is resilient (enables existing defaults if present, otherwise creates).

### 4) Database & Prisma Audit
**Findings**
- Schema contains:
  - `NewsModelProfile`, `NewsModelRouterDefault`
  - `NewsApiKey` (encryptedKey)
  - Provenance + image controls fields on `NewsItem`

**Risks**
- Environments with missing migrations will fail at runtime; migrations must be deployed.

### 5) E2E Functional Audit
**Covered & passing**
- Router defaults save
- Key Vault add-key flow (when master key is configured)
- Review modal provenance + image controls persistence

### 6) Internal Wiring & Integration Audit
**Findings**
- SettingsTab loads model profiles + router defaults + vault state on mount.
- ReviewModal loads provenance + image controls on open.

## Summary Table
| Scope | Status | Primary Risk |
|---|---|---|
| UI (Settings + Review) | Complete for Phase 13 + follow-ups | Key Vault remains env-gated (expected) |
| API | Complete for Phase 13 + follow-ups | Requires admin auth + master key for vault |
| DB | Complete (with migrations) | Runtime failures if migrations not applied |
| E2E | **3/3 green** | Ensure master key exists in CI/env where vault tests run |
| Scripts | **2/2 green** | Requires OpenAI key + cron secret configured |

## Recommendations (Actionable)
1) Keep Phase 13 Playwright suite as a required regression.
2) Run the 2 scripts as on-demand “operator confidence checks” after config changes.
3) Keep using the safe cleanup script in dev environments after E2E/script validation.
