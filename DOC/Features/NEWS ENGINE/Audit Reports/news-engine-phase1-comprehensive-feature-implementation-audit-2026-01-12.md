---
description: "Phase 1: Comprehensive Feature Implementation Audit (News Engine)"
date: "2026-01-12"
---

# News Engine — Phase 1 Comprehensive Feature Implementation Audit (2026-01-12)

## Goal
Produce a forensic, end-to-end picture of the current News Engine implementation versus SOT, including **any static/unused/non-functional UI/UX** (even if not in SOT).

## Sources of Truth (SOT)
- `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/AI-AUTOMATION-ADMIN-SOT-ADDENDUM.md`

## Evidence Surfaces Audited
**Frontend (Admin):**
- `src/app/admin/news-engine/page.tsx`
- `src/components/news-engine/AdminNewsEngineHub.tsx`
- `src/components/news-engine/v6/tabs/*`
- `src/components/news-engine/v6/modals/*`

**Frontend (Public):**
- `src/app/news/page.tsx`
- `src/app/news/[slug]/page.tsx`

**Client API wrappers:**
- `src/lib/news-engine/client.ts`

**Backend (Admin APIs):**
- `src/app/api/admin/news-engine/**/route.ts`

**Backend (Internal runner):**
- `src/app/api/internal/news-engine/automation/run/route.ts`

**Data layer:**
- `prisma/schema.prisma`

**Automation scripts + E2E:**
- `scripts/news-engine-e2e-automation-test.ts` (requires `OPENAI_API_KEY`)
- `scripts/news-engine-rss-http-test.ts` (requires dev server + `NEWS_ENGINE_CRON_SECRET` + `OPENAI_API_KEY`)
- `tests/e2e/news-engine-phase13-router-vault-provenance.spec.ts`

## High-level Implementation Status
- **Admin Hub + core CRUD**: Implemented and DB-backed.
- **Automation Run Now (dry/live)**: Implemented end-to-end and guarded.
- **Sources (RSS) sync**: Implemented (per-source sync) and DB-backed.
- **AI Router Defaults**: Implemented; hardened during this audit to recover from stale IDs.
- **Key Vault**: Implemented (requires master key env).
- **Provenance + Image controls persistence**: Implemented.
- **Research Sync (WEB/SOCIAL/JOURNAL/TREND) control surface**: Present but **intentionally UI-only (disabled controls)**.
- **Some scheduling UI controls**: Present but **not wired** (priority/expiry/featured).
- **AI image generation button**: Present but **disabled**.

## Executed Verification (Evidence)
### Playwright E2E
- Command: `npm run test:e2e:news-engine-phase13`
- Result: **PASS (3/3)** after fixes noted below.

### Notes on earlier instability
An earlier run encountered a corrupted `.next` runtime leading to a `SyntaxError: Unexpected end of input`. Clearing `.next` resolved the issue.

## SOT → Implementation Mapping (Key Areas)

### 1) Automation: “Run Automation Now” (Dry / Live)
**SOT expectation:** Admin can trigger a safe dry run and a real live run with enforced rules.

**Implementation:**
- UI triggers: `src/components/news-engine/v6/tabs/MasterControlTab.tsx` via `AdminNewsEngineHub.tsx`
- Admin route: `src/app/api/admin/news-engine/automation/run-now/route.ts`
- Internal route: `src/app/api/internal/news-engine/automation/run/route.ts` (guarded by `NEWS_ENGINE_CRON_SECRET` header)

**Status:** Implemented.

### 2) Automation rules + publish windows
**SOT expectation:** Admin-configurable operational rules and publish windows should affect automation decisions.

**Implementation:**
- UI config surfaces exist in `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx` and `src/components/news-engine/v6/modals/OperationalRuleModal.tsx`.
- Enforcement is primarily in the internal runner and settings/config parsers.

**Status:** Partially implemented (UI surfaces exist; some controls are informational and/or not fully enforced across every pipeline stage).

### 3) Sources config (minSources, countries, blacklist, research weights)
**SOT expectation:** Sources configuration and research rules are persisted and enforced.

**Implementation:**
- UI: `src/components/news-engine/v6/tabs/SourcesTab.tsx`
- Admin API: `src/app/api/admin/news-engine/sources/config/route.ts`
- Enforcement in runner: `src/app/api/internal/news-engine/automation/run/route.ts`

**Status:** Implemented.

### 4) AI Router defaults + model profiles
**SOT expectation:** Admin can save defaults per task type.

**Implementation:**
- UI: `src/components/news-engine/v6/tabs/SettingsTab.tsx`
- API: `src/app/api/admin/news-engine/ai-router/defaults/route.ts`, `src/app/api/admin/news-engine/model-profiles/*`

**Fix applied during audit:**
- Hardened PUT defaults endpoint to **clear invalid/stale modelProfileIds** instead of failing the entire save.

**Status:** Implemented.

### 5) Key Vault
**SOT expectation:** Keys are stored encrypted and write-only.

**Implementation:**
- UI: `src/components/news-engine/v6/tabs/SettingsTab.tsx`
- API: `src/app/api/admin/news-engine/key-vault/route.ts`
- E2E coverage: Playwright “Key Vault: can add key”

**Status:** Implemented (requires `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` or `NEWS_KEY_VAULT_MASTER_KEY`).

### 6) Review modal: provenance + image controls
**SOT expectation:** Review experience shows provenance and supports compliance/image controls persistence.

**Implementation:**
- UI: `src/components/news-engine/v6/modals/ReviewModal.tsx`
- API: provenance + image-controls endpoints under `src/app/api/admin/news-engine/items/[id]/*`
- E2E coverage: Playwright “Review modal persists image controls and loads provenance”

**Status:** Implemented.

## Static / Unused / Non-Functional UI Elements (Forensic Inventory)
These are UI/UX elements that are **disabled**, **purely visual**, or **collect state that is not persisted/enforced**.

1) **Review Modal → “Generate AI image” button**
- Location: `src/components/news-engine/v6/modals/ReviewModal.tsx`
- Evidence: Button is `disabled` and styled as `cursor-not-allowed`.
- Status: Non-functional placeholder.
- Recommendation: Either wire to an image generation endpoint + key pool, or remove/hide behind feature flag.

2) **Review Modal → “Require approval before publish” toggle**
- Location: `src/components/news-engine/v6/modals/ReviewModal.tsx`
- Evidence: UI copy says “UI-only toggle; publishing enforcement is backend-owned.”
- Reality: Value is persisted via `adminUpdateItemImageControls(...)`, but **enforcement is not guaranteed** (depends on publish path enforcement).
- Status: Partially integrated (data persists; enforcement unclear).
- Recommendation: Enforce in publish endpoints or remove “UI-only” copy and explicitly document enforcement rules.

3) **Schedule Modal → Priority / Auto-Expiry / Pin as Featured**
- Location: `src/components/news-engine/v6/modals/ScheduleModal.tsx`
- Evidence: Modal tracks `priority`, `hasExpiry`, `expiryDate`, `isFeatured`, but `onSchedule(iso)` only forwards ISO schedule time.
- Status: State is collected but not used (non-functional).
- Recommendation: Either (a) persist/enforce these fields in DB + APIs, or (b) remove UI to avoid misleading operators.

4) **Master Control → Pipeline Sub-Systems toggles**
- Location: `src/components/news-engine/v6/tabs/MasterControlTab.tsx`
- Evidence: Subsystem toggles are rendered as `disabled` and labeled “Visibility surface (read-only)”.
- Status: Intentionally non-interactive.
- Recommendation: Keep if it reflects real backend health signals; otherwise label as “mock/placeholder” and/or wire to job/health endpoints.

5) **Sources Tab → Recent Research Sync (WEB/SOCIAL/JOURNAL/TREND)**
- Location: `src/components/news-engine/v6/tabs/SourcesTab.tsx`
- Evidence: Section explicitly labeled “Visibility surface (UI only)” with disabled “Sync Research Now” / “View Entries” buttons.
- Status: Non-functional placeholder.
- Recommendation: Implement research sync endpoints per kind + list endpoint, or remove until available.

6) **Automation Guidelines Modal**
- Location: `src/components/news-engine/v6/modals/AutomationGuidelinesModal.tsx`
- Evidence: Modal description states controls are UI-only.
- Status: Informational UI-only.
- Recommendation: Keep as documentation, but ensure it doesn’t conflict with real enforcement.

## Gaps / Risks / Priority Fixes
- **Operator trust risk**: UI showing controls that do nothing (Schedule priority/expiry/featured; Research Sync buttons; Generate AI image) creates “false confidence”.
- **Defaults robustness**: Router defaults must not brick configuration when old profiles are deleted/disabled (addressed during this audit).

## Changes Applied During This Audit (to improve correctness + evidence)
- Hardened AI router defaults update to clear stale IDs instead of failing.
- Made Key Vault E2E test idempotent (unique label per run).

## Next Actions (tracked in tasks.md)
- Wire or remove the identified static controls (especially scheduling and research sync).
- Add explicit enforcement checks for any “approval required” semantics.
- Add/extend automated tests to cover the disabled/placeholder surfaces once implemented.
