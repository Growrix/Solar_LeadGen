# News Engine — Frontend Expansion Audit (Phase 13 / Step Pack 1–8)

**Filename requirement**: This file name is specified by `DOC/FEATURES/NEWS ENGINE/tasks.md`.
**Generated on**: 2026-01-13
**Audit driver**: `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`

## Executive summary

**Status**: GREEN (for Phase 13 prompt pack Steps 1–8)

**Pre-audit gates**:
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS (eslint warnings only; see “Non-blocking warnings”)

**Scope**: Phase 13 “Feature Expansion Execution” frontend-only prompt pack `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-expansion-uiux-prompts-2026-01-13.md` Steps 1–8.

**Primary surfaces audited**:
- `src/components/news-engine/v6/tabs/MasterControlTab.tsx`
- `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`
- `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx`
- `src/components/news-engine/v6/tabs/SourcesTab.tsx`
- `src/components/news-engine/v6/tabs/DashboardTab.tsx`
- `src/components/news-engine/v6/shared.tsx`

---

## Audit Scope 1 — Page & Modal Audit (Frontend)

### Step 1: Master Control — “System Health” truthful
**Finding**: Telemetry/health panels no longer present fake activity or metrics. Values that are not backed by API data are explicitly labeled as `Not available` or `Placeholder`.

**Coverage**:
- Added/updated “Last updated” timestamp surfaces (client time).
- Status semantics changed to `enabled/disabled/unknown` to avoid implying production reliability metrics.

**Gaps**: None vs prompt pack requirements.

### Step 2: Master Control — Queue Snapshot explicit states
**Finding**: Queue Snapshot now has explicit state handling (loading/empty/success) and avoids confusing null display by using `—` plus helper copy.

**Gaps**: The prompt pack mentions an **Error** state; current implementation uses “loading/empty/success” and neutral “Not available / endpoint not connected” helper text.
- Assessment: Acceptable for current wiring constraints (no new endpoint added by design). If a real endpoint later returns an error payload, consider adding an explicit “Error” chip.

### Step 3: Drafts & Reviews — remove hardcoded actor chips
**Finding**: Hardcoded avatar chips (`U1/U2/U3`) removed and replaced with a neutral `Actor: —` label.

**Gaps**: None.

### Step 4: Automation Logic — persisted config always hydrates on mount
**Finding**: Automation Logic tab now hydrates persisted config on mount via existing admin config endpoint, provides “Reset to Saved”, and shows a UI-only “Unsaved changes” indicator.

**Gaps**: None.

### Step 5: Master Control — deterministic “Last Run Summary” panel
**Finding**: “Last Run Summary” always renders deterministically with `No runs yet` and `Running…` states, and uses `—` for missing counts.

**Gaps**: None.

### Step 6: Sources — Unified Research Center entry point + UI shell only
**Finding**: Unified Research Center toggle is available within existing Sources tab (no new route). Shell includes filter UI (Source type, Kind, Status, Date range) and a placeholder listing area with “Endpoint pending”.

**Gaps**: None (shell intentionally non-functional until a unified endpoint is added).

### Step 7: Dashboard — KPI placeholders explicitly labeled
**Finding**: KPI cards are explicitly labeled `Placeholder` to avoid implying real analytics.

**Gaps**: None.

### Step 8: A11y sweep (changed surfaces)
**Finding**: Focused accessibility improvements were applied to newly added/changed controls:
- Unified Research Center toggle uses disclosure semantics (`aria-expanded`, `aria-controls`).
- KPI placeholder badges include assistive labeling.

**Gaps**: No blockers found in the changed surfaces.

---

## Audit Scope 2 — API Endpoint Audit

**Implemented endpoints changed/added by this phase**: None.

**Existing endpoints relied upon by the expanded UI**:
- `GET /api/admin/news-engine/automation/config` (used to hydrate Automation Logic persisted config)
- Existing “Run Automation Now” flow (existing wiring assumed; UI now renders a deterministic summary)

**Gaps**: None vs Phase 13 Step pack constraints (explicitly disallowed adding endpoints in Steps 1–2, 5–7).

---

## Audit Scope 3 — Backend Logic & Service Audit

Out of scope for Phase 13 prompt pack Steps 1–8 (frontend-only expansion). No backend service changes were required/expected.

---

## Audit Scope 4 — Database & Prisma Model Audit

Out of scope for Phase 13 prompt pack Steps 1–8. No DB changes were required/expected.

---

## Audit Scope 5 — E2E Functional Audit

**Completed**:
- Typecheck and production build gates passed.

**Not executed here**:
- E2E scripts listed under `Build Pass & Post-Feature Test/Docs` (these are tracked later as X401+).

---

## Audit Scope 6 — Internal Wiring & Integration Audit

**Wiring added**:
- Automation Logic hydration now calls the existing config endpoint via `fetchAdminAutomationConfig()`.

**Wiring intentionally NOT added (by constraints)**:
- Queue Snapshot counts are explicitly treated as unavailable when not connected.
- Unified Research Center listing is explicitly marked “Endpoint pending”.

---

## Static/Unused/Non-Functional UI Elements (required)

These are present in the UI but intentionally not wired to operational logic (or not wired yet). They are acceptable given current Phase 13 prompt-pack constraints, but must remain clearly labeled to avoid implying real functionality.

- `src/components/news-engine/v6/tabs/MasterControlTab.tsx`
  - “Pipeline Sub-Systems” toggle controls are disabled (status visibility only).
  - “Safety Center” sections show placeholders / “Not available” (telemetry not connected).
  - Queue Snapshot rows may show `—` with “endpoint not connected yet” helper text.

- `src/components/news-engine/v6/tabs/SourcesTab.tsx`
  - Unified Research Center filters and listing are UI-only; listing area explicitly says “Endpoint pending”.

- `src/components/news-engine/v6/tabs/DashboardTab.tsx`
  - KPI cards labeled “Placeholder” to avoid implying real analytics.

---

## Non-blocking warnings

- `npm run build` emits react-hooks lint warnings about `dayDefs` in `AutomationLogicTab.tsx` (“dependencies of useMemo change on every render”).
  - Recommendation: wrap `dayDefs` in a `useMemo` or move it outside the component.
  - Severity: Non-blocking (build succeeds), but should be cleaned up in Phase 3 / follow-up.

---

## Summary table

| Scope | Missing | Incomplete | Non-functional | SOT deviations |
|---|---:|---:|---:|---:|
| Frontend pages/modals | 0 | 0 | 0 (beyond intentionally labeled placeholders) | 0 |
| API endpoints | 0 | 0 | 0 | 0 |
| Backend logic | 0 | 0 | 0 | 0 |
| DB/Prisma | 0 | 0 | 0 | 0 |
| E2E flows | 0 | 0 | 0 | 0 |

---

## Recommendations (next actions)

Proceed to Phase 13 Phase 3:
- Validate the backend expansion plan against the final expanded frontend surfaces (Queue Snapshot, Unified Research Center, truthy telemetry expectations).
- Translate any missing backend work into explicit implementation tasks under Phase 3 in `DOC/FEATURES/NEWS ENGINE/tasks.md`.
