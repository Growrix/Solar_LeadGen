# Phase 11 – E2E Failures Audit (2025-12-02)

This report documents a deep audit of the Bid/Quote Builder E2E tests, frontend behavior, and test infrastructure. It captures root causes for current failures and proposes a focused remediation plan.

## Scope
- Frontend components: `QuoteBuilderModal`, `ImportPreviewModal`, `quote-builder/*` sections, `instant-to-bid` mapper
- Test page: `src/app/test/quote-builder/page.tsx`
- Tests: `tests/e2e/quote-builder.spec.ts`
- Test infra: `playwright.config.ts` (baseURL, server), CI readiness

## Current Symptoms
- 6/6 tests failing after recent changes
- "Import workflow" test: "Import from Instant Quote" modal does not appear after clicking the button
- Other tests miss expected UI (STC caption, tooltips, prefilled captions, budget banner) or time out

## Evidence Summary
- Page snapshot shows Bid Builder UI and Import button rendered
- No page console logs from component despite button click (suggests onClick not bound / hydration not complete)
- Data-testids exist in codebase:
  - `budget-exceed-banner` in `QuoteBuilderModal.tsx`
  - `stc-postcode-caption` in `quote-builder/PricingEngine.tsx`
  - `tooltip-orientation`, `tooltip-pitch`, `tooltip-shading` in `quote-builder/RoofSiteDetails.tsx`
- Tests previously attempted to clear `localStorage` in `beforeEach`; this regressed behavior and broke the modal
- Tests that re-import after Test 1 often encounter "no changes" (Accept button absent) due to persisted draft
- Playwright config had no `webServer` – relied on an external server implicitly, causing flakiness and possible hydration timing issues

## Root Causes
1. Hydration uncertainty due to missing managed dev server:
   - `playwright.config.ts` lacked a `webServer` definition. Tests depended on an external dev server, leading to inconsistent hydration or timing.
2. Test isolation and state management:
   - Re-import flow depends on diff with existing draft. After first import, subsequent tests see "no changes" and never see the Accept button.
   - Earlier attempt to `localStorage.clear()` + `reload()` introduced additional instability (modal did not appear).
3. Collapsed sections hiding assertions:
   - UI sections (Roof & Site Details, Pricing Engine) are collapsible and often collapsed by default. Tests asserted inner elements without expanding sections first.
4. A temporary syntax error in the spec file caused a run-time parse failure (now fixed).

## What’s Verified OK
- Frontend import flow wiring:
  - `QuoteBuilderModal` uses `handleImportClick` to map data via `mapInstantToBid`, sets `mappedImportData`, and toggles `isImportPreviewOpen`.
  - `ImportPreviewModal` renders even when no changes (Accept disabled), so lack of modal implies click handler never fired or hydration absent.
- Data-testIds are present in expected components.

## Remediation Plan (Prioritized)
1. Stabilize test infrastructure
   - Add `webServer` to Playwright config to launch Next.js dev server automatically.
   - Use `reuseExistingServer` locally, disable reuse in CI.
2. Make tests deterministic and independent
   - Use a helper to set imported draft state (`setupImportedDraft`) for tests that require post-import UI.
   - Avoid re-import in those tests (prevents "no changes").
   - After setting draft, `page.reload()` + `waitForLoadState('networkidle')` to ensure hydration.
3. Expand sections explicitly where needed
   - Click `Roof & Site Details` for tooltip checks
   - Click `Pricing Engine` for STC caption and prefilled caption checks
4. Keep the import workflow test as the only place validating the modal and Accept flow
   - With a managed dev server, hydration should complete and the modal should render.
5. CI & repeatability
   - Add CI workflow to run E2E with the new config; publish artifacts for debugging.

## Changes Applied
- Added `webServer` to `playwright.config.ts` to auto-start `npm run dev` with `baseURL` `http://localhost:3000`.
- Implemented `setupImportedDraft(page)` helper to set stable imported state directly into `localStorage` using the existing key.
- Refactored tests 2, 4, 5 to use deterministic imported state + reload and section expansion.
- Removed stray section-expansion block that broke the spec structure; simplified `beforeEach`.

## Next Steps
- Re-run the suite. If the "Import workflow" modal still does not appear:
  - Confirm hydration by capturing component console logs via `page.on('console')` (already added); if none, check dev server logs.
  - If hydration is still an issue, increase initial wait and verify `mapInstantToBid` via `page.evaluate` on click to detect runtime exceptions.
  - As a fallback for flakiness, use `test.describe.serial()` for this suite and/or explicitly `waitForSelector` of a minimal hydrated signal (e.g., a client-only element attribute).
- Add CI workflow to `.github/workflows/e2e.yml` (Node setup, Playwright deps, run tests, upload artifacts).

## Acceptance Criteria
- 6/6 tests pass locally with `npm run test:e2e`
- CI runs green with artifacts
- Tests are deterministic (no reliance on previous test’s side effects)
- Import modal test validates modal visibility and Accept click without flakiness

---
Prepared by: E2E Audit – 2025-12-02
