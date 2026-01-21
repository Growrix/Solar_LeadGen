# News Engine Settings UI/Backend Audit (2026-01-19)

## Scope
This audit covers the **News Engine → Settings** tab (V6) end-to-end wiring:

- UI: `src/components/news-engine/v6/tabs/SettingsTab.tsx`
- Parent hub: `src/components/news-engine/AdminNewsEngineHub.tsx`
- Settings persistence API: `src/app/api/admin/news-engine/settings/route.ts`
- AI Router defaults API: `src/app/api/admin/news-engine/ai-router/defaults/route.ts`
- Model Profiles API: `src/app/api/admin/news-engine/model-profiles/*`
- Key Vault API: `src/app/api/admin/news-engine/key-vault/*`
- Provider model listing API: `src/app/api/admin/news-engine/ai/models/route.ts`

The purpose is to clarify what is **real, persisted, and used by automation** vs what is **UI-only**, and to identify failure modes that cause:

- “Settings disappear after refresh”
- “Models dropdown empty / wrong”
- “OpenAI models list failed (403)”
- “Automation runs but creates 0 drafts”

## Executive Summary (Findings)
### 1) “Settings disappear after refresh” root cause
**Root cause**: the UI previously triggered a “saved” indicator on local state changes, even when no network persistence occurred. Many settings changes updated React state only, and a page refresh would naturally revert to DB-backed values.

**Fix implemented**: Settings and AI Router defaults are now **debounced autosaved** to the backend so values persist across refresh and the saved indicator reflects actual persistence.

### 2) “Model ID dropdown must be real (no manual typing)” root cause
**Root cause**: the Model Profile modal previously had model listing only for OpenAI & Gemini. All other providers required manual model IDs, which is error-prone and can create “profiles that look configured but don’t actually work”.

**Fix implemented**: Model Profile creation now uses **dropdown selection for all providers**. For non-OpenAI/Gemini providers, the dropdown is powered by an OpenAI-compatible `/v1/models` listing endpoint (requires the provider base URL env var + a Key Vault key).

### 3) “OpenAI models list failed (403)” root cause
**Root cause**: OpenAI returned a 403 on `/v1/models` for at least one key used for listing. This is commonly caused by:

- invalid key
- key restricted to another project/org
- key lacks permission for the endpoint

**Fix implemented**: the model listing system now returns a structured response with `ok/error/warnings/keysUsed` and does not rely on exceptions. The UI can show which key label(s) were used and actionable warnings.

### 4) “Automation runs but no drafts are generated” likely blocking gates
The automation runner has multiple *legitimate* paths to create **0 drafts** even if it “runs successfully”. The most common blockers are:

- `dailyLimit` reached (remaining budget 0)
- no enabled sources / no new entries selected
- `autoDraft = false` (draft step is skipped)
- routing defaults missing for `draft_longform` (or selected model profile disabled/inactive)
- AI call failures due to missing/invalid key(s)

The runner now returns richer diagnostics in its response payload (see internal runner route `src/app/api/internal/news-engine/automation/run/route.ts`).

## Settings Tab Wiring Map

### A) News Engine Settings (daily limit, locale, dedup, etc.)
**UI Source**:
- `SettingsTabV6` updates `state.settings.*`

**Persistence**:
- `PUT /api/admin/news-engine/settings`
- Backed by the Settings table keys via `setNewsEngineSetting(...)`

**Used by Automation**:
- Internal runner reads settings keys such as:
  - `news.settings.daily_limit`
  - `news.settings.deduplication_enabled`

**Key risk**:
- If `dailyLimit` is 0 (or exhausted for the day), automation will select 0 entries.

### B) AI Personalization (tone, prompt, router defaults)

#### 1) Writing Tone + Input Prompt
**UI Source**:
- `state.settings.writingTone`
- `state.settings.aiInputPrompt`

**Persistence**:
- `PUT /api/admin/news-engine/settings`

**Used by Automation**:
- These values influence prompting for drafting/rewrite and are injected through the News Engine prompt building.

#### 2) AI Router Defaults (taskType → modelProfileId)
**UI Source**:
- `aiRouterDefaults[taskType]` inside `SettingsTabV6`

**Persistence**:
- `PUT /api/admin/news-engine/ai-router/defaults`

**Used by Automation**:
- `resolveNewsAiCallConfig(...)` selects the model profile for each task (drafting/rewrite/seo/etc.).

**Key risk**:
- If `draft_longform` default is empty or points to an inactive profile, draft generation can fail or be skipped.

### C) AI Router → Model Profiles
**UI Source**:
- The “Model profiles” table in SettingsTab

**Persistence**:
- Create/update: `POST/PUT /api/admin/news-engine/model-profiles`
- Delete: `POST /api/admin/news-engine/model-profiles/bulk-delete`

**Used by Automation**:
- Router defaults reference model profile IDs.
- Each model profile defines provider + modelId + enabled.

**Key risk**:
- A profile can be enabled but have no *usable key* (provider key disabled / Key Vault not configured).

### D) Key Vault
**UI Source**:
- Keys table and modal in SettingsTab

**Persistence**:
- `GET/POST /api/admin/news-engine/key-vault`
- `PUT/DELETE /api/admin/news-engine/key-vault/[id]`

**Used by Automation**:
- `resolveNewsAiCallConfig(...)` selects a usable key for the requested provider/pool.

**Key risk**:
- If `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` is missing/invalid, keys cannot be created/updated.

### E) Provider Model Listing (dropdown population)
**UI Source**:
- Add/Update Model Profile modal

**Persistence**:
- none (read-only listing)

**Endpoints**:
- `GET /api/admin/news-engine/ai/models?provider=...`

**Providers**:
- `openai`: lists from OpenAI `/v1/models` using Key Vault key (preferred) or `OPENAI_API_KEY` fallback.
- `gemini`: lists from Google `v1beta/models` using Key Vault key (preferred) or env fallback.
- other providers: lists from **OpenAI-compatible** `${BASE_URL}/v1/models` using Key Vault key.

**Required env for non-OpenAI/Gemini**:
- `NEWS_ENGINE_OPENAI_COMPAT_BASE_URL_<PROVIDER>` (preferred)
- or `NEWS_ENGINE_OPENAI_COMPAT_BASE_URL` (fallback)

Example:
- `NEWS_ENGINE_OPENAI_COMPAT_BASE_URL_DEEPSEEK=https://api.deepseek.com`

## Why Draft Generation Can Still Be 0 (Concrete Gates)
Even after configuration is correct, 0 drafts can be expected in these cases:

1) **Daily budget exhausted**
- internal runner computes remaining budget in `Australia/Sydney` day window.

2) **No eligible entries**
- no enabled sources
- feed fetch fails / returns empty
- dedup/operational rules filter everything

3) **Draft step disabled**
- `autoDraft = false` causes draft step to skip.

4) **Routing misconfiguration**
- `draft_longform` default missing
- profile disabled
- provider has no enabled key in Key Vault

5) **Provider/API failures**
- invalid key, 401/403
- missing baseUrl for OpenAI-compatible providers

## Recommendations (Operational)
- Keep daily limit non-zero while testing.
- Ensure at least one enabled source with fresh RSS entries.
- Ensure `draft_longform` router default points to an enabled model profile with an enabled key.
- For non-OpenAI/Gemini providers, confirm the appropriate `NEWS_ENGINE_OPENAI_COMPAT_BASE_URL_<PROVIDER>` env var is set.

## Change Log (What was fixed as part of this audit)
- Settings changes now autosave (debounced) so refresh is stable.
- Saved indicator now reflects successful persistence.
- Model Profile modal no longer supports manual model ID entry; it uses dropdown listing for all providers.
- Model listing endpoint now supports OpenAI-compatible providers and returns structured diagnostics on failure.
