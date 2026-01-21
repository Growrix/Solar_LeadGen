---
description: "News Engine backend plan addendum (AI Router + Key Vault + Provenance/Image) — audit-first"
---

# BACKEND PLAN — NEWS ENGINE (2026-01-08)

## 0) Strict rules confirmation (audit-first)
- This document is **PLAN ONLY**.
- No destructive DB actions are proposed.
- This plan is **reality-driven** (code/schema audited) and **SOT-aware** (references the addendum).

## 1) Inputs loaded
### Guidelines (authority order)
- `DOC/GUIDELINES & SOT/README.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/E2E-CURRENT-STATE-AUDIT-RULES.md`

### Feature docs
- `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-2026-01-04.md`
- `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-AI-AUTOMATION-2026-01-05.md`
- `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/tasks.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/AI-AUTOMATION-ADMIN-SOT-ADDENDUM.md`

### Repo tech SOT (audited)
- Prisma schema: `prisma/schema.prisma`
- API route handlers under `src/app/api/**`
- Admin UI entrypoint: `src/app/admin/news-engine/page.tsx`
- Admin V6 UI surfaces (Settings + Review):
  - `src/components/news-engine/v6/tabs/SettingsTab.tsx`
  - `src/components/news-engine/v6/modals/ReviewModal.tsx`

---

## 2) E2E current-state audit (MANDATORY)

### A) UI entry points and routes (Admin + Public)
**Public**
- `/news` (Next.js page) — exists
- `/news/[slug]` (Next.js page) — exists
- Public API used by pages:
  - `GET /api/news`
  - `GET /api/news/[slug]`

**Admin**
- `/admin/news-engine` — exists (`src/app/admin/news-engine/page.tsx`)
- Within admin, key V6 surfaces relevant to this plan:
  - Settings tab: AI Router + Key Vault UI exists but is **UI-only**
  - Review modal: Provenance + Image controls UI exists but is **UI-only**

### B) Current API inventory (News Engine)
**Public**
- `GET src/app/api/news/route.ts`
- `GET src/app/api/news/[slug]/route.ts`

**Admin**
- Items CRUD and actions
  - `GET/POST src/app/api/admin/news-engine/items/route.ts`
  - `GET/PUT/DELETE src/app/api/admin/news-engine/items/[id]/route.ts`
  - `POST src/app/api/admin/news-engine/items/[id]/publish-now/route.ts`
  - `POST src/app/api/admin/news-engine/items/[id]/schedule/route.ts`
  - `POST src/app/api/admin/news-engine/items/[id]/reject/route.ts`
  - `POST src/app/api/admin/news-engine/items/[id]/rewrite-request/route.ts`
  - `POST src/app/api/admin/news-engine/items/[id]/regenerate/route.ts`
  - `DELETE src/app/api/admin/news-engine/items/[id]/purge/route.ts`
  - `POST src/app/api/admin/news-engine/items/generate-manual/route.ts`

- Pipeline controls
  - `GET src/app/api/admin/news-engine/pipeline/status/route.ts`
  - `POST src/app/api/admin/news-engine/pipeline/pause/route.ts`
  - `POST src/app/api/admin/news-engine/pipeline/resume/route.ts`
  - `POST src/app/api/admin/news-engine/pipeline/emergency-stop/route.ts`

- Settings + sources + research + automation
  - `GET/PUT src/app/api/admin/news-engine/settings/route.ts`
  - `GET/POST src/app/api/admin/news-engine/sources/route.ts`
  - `PUT/DELETE src/app/api/admin/news-engine/sources/[id]/route.ts`
  - `GET/PUT src/app/api/admin/news-engine/sources/config/route.ts`
  - `POST src/app/api/admin/news-engine/sources/[id]/sync/route.ts`
  - `GET src/app/api/admin/news-engine/sources/[id]/entries/route.ts`
  - `POST src/app/api/admin/news-engine/research/sync/route.ts`
  - `POST src/app/api/admin/news-engine/research/generate-draft/route.ts`
  - `POST src/app/api/admin/news-engine/research/test/route.ts`
  - `GET src/app/api/admin/news-engine/audit-logs/route.ts`
  - `GET/PUT src/app/api/admin/news-engine/automation/config/route.ts`
  - `GET/POST src/app/api/admin/news-engine/automation/rules/route.ts`
  - `PUT/DELETE src/app/api/admin/news-engine/automation/rules/[id]/route.ts`
  - `POST src/app/api/admin/news-engine/automation/run-now/route.ts` (proxy to internal runner)

**Internal**
- `POST src/app/api/internal/news-engine/automation/run/route.ts`

**Audit finding:** there are **no** endpoints for:
- Model Profiles (CRUD)
- Task → model routing defaults (AI Router persistence)
- Key Vault (store encrypted keys, list masked keys, health)
- Item provenance summary (URLs used; per-stage model+key label)
- Item image controls persistence (approval requirement; override URL)

### C) Prisma/DB inventory (News Engine)
Existing models/enums (confirmed in `prisma/schema.prisma`):
- `NewsItem` (includes `contentHtml`, `seoTitle`, `seoDescription`, `ogImageUrl`)
- `NewsSource`, `NewsSourceEntry`
- `NewsResearchEntry`
- `NewsAiRequestLog` (has `provider`, `model`, `input/output`, `actorId`, optional `itemId`)
- `NewsJobLog`, `NewsAutomationRule`, `NewsAuditLog`

**Audit finding (gaps):** there are **no** DB entities for:
- `Model profiles` as first-class admin-configured objects
- `Task type` enum and routing defaults
- `Key vault` entries (encrypted)
- `Per-item image approval state` (only `ogImageUrl` exists)

### D) State machine / lifecycle (current)
**NewsItemStatus** includes: `DRAFT`, `NEEDS_REVIEW`, `RESEARCH_DONE`, `DRAFT_READY`, `PUBLISHED`, `SCHEDULED`, `REJECTED`, `ERROR`.

Current transitions (observed via existing endpoints):
- Create → `DRAFT`
- Generate (AI) → typically `NEEDS_REVIEW` / `DRAFT_READY` (depends on endpoint)
- Publish-now → `PUBLISHED`
- Schedule → `SCHEDULED`
- Reject → `REJECTED`
- Rewrite-request → regenerates content and sets back to `DRAFT_READY` (per Phase 11)

### E) Broken or missing wiring (what the admin UI shows vs what backend supports)
- Settings/AI Router: UI has per-task model defaults but backend only stores a single global `news.ai.model` + `news.ai.model_label` setting.
- Settings/Key Vault: UI shows masked keys and pool assignment, but backend only supports env-only OpenAI key (no DB vault).
- Review modal provenance: UI shows research used label + source URLs, but backend does not expose a canonical provenance contract.
- Review modal image controls: UI has approval toggle + override URL input, but backend has only `NewsItem.ogImageUrl`.

### F) SOT vs Current Implementation Delta (MANDATORY)
| SOT expectation (AI-AUTOMATION-ADMIN-SOT-ADDENDUM) | Current implementation reality | Decision | Impact on plan |
|---|---|---|---|
| Per-task **Model Router** with stable task types | No DB + no API; only global `news.ai.*` settings | Implement | Add models + endpoints + runner integration |
| **Key Vault** with pools (research/drafting/images), encrypted-at-rest | No DB vault; env-only OpenAI key | Implement | Add encrypted key storage + selection policy + logging |
| Per-item provenance (sources used, research used, model/key per stage) | Partial (relations exist; logs exist; no contract) | Implement | Add provenance endpoint (derived from relations + AI request logs) |
| AI image workflow (prompt + generate) and approval gate | Only `ogImageUrl` field exists; UI button is disabled | Implement **storage + controls** now; defer generation | Add approval fields + endpoints; generation can be later |

---

## 3) Executive summary
### What will be built (this increment)
- A persistent **AI Router** backend (task → model profile defaults) with admin CRUD for **Model Profiles**.
- A persistent, encrypted **Key Vault** with pool assignment and masked display.
- A canonical **Provenance** contract for a News Item (sources/research URLs used + per-stage model/key labels derived from logs).
- Persistent **Image Controls** for each News Item (approval requirement + override URL), stored in DB.

### What will NOT be built (explicit exclusions)
- No new admin pages/tabs beyond what already exists.
- No destructive DB resets.
- No actual image generation implementation in this phase (UI button is currently disabled; storage + auditability only).

### Minimal path to ship without mess
1) Add Prisma models/fields + migrations (non-breaking).
2) Add admin API endpoints for Model Profiles, Router Defaults, Key Vault, and Item Provenance/Image controls.
3) Wire admin UI to these endpoints.
4) Optionally update AI call sites to log `taskType`, `modelProfile`, and `keyLabel` for provenance completeness.

---

## 4) Backend plan (implementation-ready)

### 4.2 Data model plan (Prisma)

#### 4.2.1 Enums
- `NewsAiTaskType` (new enum):
  - `research_deep`, `research_fast`, `draft_longform`, `rewrite`, `seo`, `dedup_semantic`, `image_prompt`, `image_generate`
  - Note: SOT mentions `draft_short`; current UI does not. Keep extensible for future add.

- `NewsApiKeyPool` (new enum):
  - `RESEARCH`, `DRAFTING`, `IMAGES`

#### 4.2.2 Models
- `NewsModelProfile` (new)
  - `id`, `displayName`, `provider`, `modelId`, `useCaseTags String[]`, `costTier`, `jsonModeRequired Boolean`, `maxTokens Int?`, `enabled Boolean`, `createdAt`, `updatedAt`

- `NewsModelRouterDefault` (new)
  - `taskType NewsAiTaskType @unique`
  - `modelProfileId` → relation to `NewsModelProfile`
  - `createdAt`, `updatedAt`

- `NewsApiKey` (new)
  - `id`, `provider` (string), `label`, `pools NewsApiKeyPool[]`, `enabled Boolean`
  - `encryptedKey String` (ciphertext bundle)
  - `lastUsedAt DateTime?`, `lastSuccessAt DateTime?`, `lastErrorAt DateTime?`, `lastError String?`
  - optional: `dailyBudgetCents Int?` (only if you intend to enforce caps)
  - `createdAt`, `updatedAt`

#### 4.2.3 Extend existing models (minimal)
- `NewsAiRequestLog`
  - add `taskType NewsAiTaskType?`
  - add `modelProfileId String?` (optional relation to `NewsModelProfile`)
  - add `apiKeyId String?` (optional relation to `NewsApiKey`)
  - add `durationMs Int?` (optional)

- `NewsItem`
  - add `ogImageApprovalRequired Boolean @default(true)`
  - add `ogImageApprovedAt DateTime?`
  - add `ogImageApprovedById String?` (optional relation to `User`)

#### 4.2.4 Index/uniqueness rules
- `NewsModelRouterDefault.taskType` unique
- `NewsApiKey` indexes: `enabled`, `provider`, `pools`
- `NewsAiRequestLog` indexes: `taskType`, `modelProfileId`, `apiKeyId`, `createdAt`

#### 4.2.5 Migration strategy
- Add new models/fields via a single migration (safe additive changes).
- Do not backfill historical logs immediately; provenance endpoint should gracefully handle missing `taskType/modelProfileId/apiKeyId`.

---

### 4.3 API contract plan (App Router route handlers)

#### 4.3.1 Model Profiles (admin)
- `GET /api/admin/news-engine/model-profiles`
  - Auth: `requireAdmin`
  - Response: `{ profiles: Array<{ id, displayName, provider, modelId, enabled, useCaseTags, costTier, jsonModeRequired, maxTokens? }> }`

- `POST /api/admin/news-engine/model-profiles`
  - Body: `{ displayName, provider, modelId, ... }`
  - Validations: unique-ish `displayName` (recommended), non-empty `modelId`

- `PUT /api/admin/news-engine/model-profiles/[id]`
- `DELETE /api/admin/news-engine/model-profiles/[id]` (soft-delete via `enabled=false` recommended)

#### 4.3.2 AI Router defaults (admin)
- `GET /api/admin/news-engine/ai-router/defaults`
  - Response: `{ defaults: Record<NewsAiTaskType, { modelProfileId, displayName }> }`

- `PUT /api/admin/news-engine/ai-router/defaults`
  - Body: `{ defaults: Record<NewsAiTaskType, { modelProfileId }> }`
  - Server validates taskType is known; modelProfile exists and enabled.

#### 4.3.3 Key Vault (admin)
- `GET /api/admin/news-engine/key-vault`
  - Response: `{ keys: Array<{ id, provider, label, pools, enabled, maskedKey, lastUsedAt?, lastSuccessAt?, lastErrorAt?, lastError? }> }`
  - Mask policy: return only last 4 digits; never return raw key.

- `POST /api/admin/news-engine/key-vault`
  - Body: `{ provider, label, pools, enabled, rawKey }`
  - Encrypt `rawKey` at write time using a master key from environment.

- `PUT /api/admin/news-engine/key-vault/[id]`
  - Body: `{ label?, pools?, enabled?, rawKey? }`
  - `rawKey` optional; if absent, keep existing.

#### 4.3.4 Item provenance + image controls (admin)
- `GET /api/admin/news-engine/items/[id]/provenance`
  - Response:
    - `sources`: list of `NewsSourceEntry` URLs (or RSS entry urls)
    - `research`: list of `NewsResearchEntry` URLs
    - `researchUsedLabel`: derived string
    - `stages`: map of `taskType -> { modelProfileLabel?, apiKeyLabel? }` derived from `NewsAiRequestLog`

- `PUT /api/admin/news-engine/items/[id]/image-controls`
  - Body: `{ ogImageUrl?: string, ogImageApprovalRequired?: boolean, approve?: boolean }`
  - Validations:
    - If `approve=true`, set `ogImageApprovedAt` and `ogImageApprovedById=actor`
    - If toggling `ogImageApprovalRequired` from true→false, keep approval fields as-is.

---

### 4.4 Public pages E2E wiring
- No changes required for public pages beyond ensuring `ogImageUrl` behavior remains stable.
- Any future “approval-required” logic should be enforced on publish (admin) rather than on public read.

---

### 4.5 Admin flows E2E wiring
- Settings tab:
  - Load model profiles + router defaults + key vault list.
  - Save router defaults and key vault create/update.

- Review modal:
  - Load provenance from `/items/[id]/provenance`.
  - Save image controls via `/items/[id]/image-controls`.

---

### 4.6 Audit logging
Add audit entries for:
- `news_model_profile_created/updated/disabled`
- `news_ai_router_defaults_updated`
- `news_key_created/updated/disabled`
- `news_item_image_controls_updated`

Also ensure AI call sites write `NewsAiRequestLog` entries with:
- `taskType`, `modelProfileId`, `apiKeyId` (when available)

---

### 4.7 Scheduling / automation
- Runner integration (future within this increment if feasible):
  - Resolve `taskType → modelProfile → apiKey pool → key`.
  - Fallback behavior:
    - If router defaults missing → use existing env/model behavior (`OPENAI_MODEL` / existing settings).
    - If key vault empty → use env key (current behavior).

---

### 4.8 Security & permissions
- Admin-only access for all model/router/key endpoints.
- Key vault encryption:
  - Use a single master key from env, e.g. `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` (exact name TBD).
  - Encrypt with AES-256-GCM; store `iv`, `ciphertext`, `tag`.
  - Never log raw keys; never return raw keys.

---

### 4.9 Testing plan (minimum)
Manual QA (planned):
- Add a model profile → set router default → reload Settings tab → values persist.
- Add a key → list shows masked key only → edit without rawKey retains old key.
- Open review modal → provenance shows URLs used (if any) and stage labels (when logs exist).
- Update `ogImageUrl` and approval flag → reload item → values persist.

---

### 4.10 Risks, dependencies, open questions
**Dependencies**
- Decide on env var name + format for the master encryption key.
- Confirm whether settings-service already supports secure secret storage (audit indicates it does not).

**Open questions (UNKNOWN until owner confirms)**
- Should model profiles allow providers beyond OpenAI now, or keep provider fixed to OpenAI for MVP?
- Should key pools be multi-select (SOT suggests yes) or single pool (current UI is single-select)?
- Should publish be blocked if `ogImageApprovalRequired=true` and no approval recorded?
- Should per-stage provenance be derived strictly from logs, or stored directly on `NewsItem` for speed?

---

## 5) Stop rule
Stop here. Do not implement until human owner confirms.
