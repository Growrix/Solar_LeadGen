# Centralized DS Styling Technical Plan

**Date**: 2026-03-14  
**Goal**: Centralize theme, color, typography, background, shape, and shared visual behavior in `src/ds` while preserving all business logic and feature ownership in `src/components`.

---

## 1. Non-Negotiable Rules

1. **UI only during migration steps.** Do not change state, effects, API calls, routing, validation, or business workflows while converting styling.
2. **`src/components` stays in place.** Feature components are preserved unless a presentational helper truly becomes shared DS infrastructure.
3. **`src/ds` owns styling authority.** Tokens, theme classes, visual variants, semantic CSS contracts, and shared presentational wrappers live in DS.
4. **No fake DS ownership.** Feature-only components must not be re-exported from `src/ds` just to simplify imports.
5. **Every migration follows the 13-step workflow** in `specs/007-migration-and-build/plan.md`.

---

## 2. Target End State

### 2.1 Root styling authority

The app root should expose one authoritative styling path:

- `ThemeInitScript` sets initial theme state.
- `ThemeProvider` controls theme switching.
- a root-level visual-mode authority controls `data-visual` and any density/platform variants that are intentionally supported.
- `src/ds/styles/index.css` remains the only global CSS entry.

### 2.2 Feature styling contract

Feature files may still use Tailwind classes, but only through DS-governed semantics:

- token-backed Tailwind utilities from `tailwind.config.js`
- DS-owned semantic classes defined in `src/ds/styles/*.css`
- DS primitives/shared presentational wrappers

Feature files should stop encoding ad hoc visual systems locally.

### 2.3 DS barrel boundary

`src/ds/index.ts` should export:

- primitives
- shared components
- layouts
- theme/runtime helpers
- icons
- generic presentational contracts

It should not export feature-specific components like quote forms, OTP flows, or result widgets unless they are intentionally elevated to shared DS assets.

---

## 3. Workstreams

## Workstream A: Stabilize the boundary

### Objective

Remove architectural ambiguity before broader styling work.

### Tasks

- Fix current Gate 0 failures by removing feature-component imports from `@/ds` in:
  - `src/components/QuoteOptionsModal.tsx`
  - `src/components/homeowner/SimplifiedQuoteForm.tsx`
  - `src/components/quote-builder/InstantQuoteResult.tsx`
- Decide and document the DS export rule in writing.
- Keep `src/ds/index.ts` limited to true DS-owned assets.

### Outcome

Typecheck becomes green enough for styling migration to proceed safely.

## Workstream B: Define the missing semantic layer

### Objective

Move repeated visual patterns out of local JSX and into DS-owned contracts.

### Needed DS contracts

- modal/backdrop overlays
- semantic panel/card/result surfaces
- quote breakdown sections
- info blocks
- toggle visuals
- stat/metric rows
- skeleton/loading placeholders
- marketing/public section shells

### Implementation shape

Prefer the least risky DS surface for each pattern:

1. token-backed Tailwind utility use where a semantic alias already exists
2. DS semantic CSS classes in `src/ds/styles/ds.components.css` or `src/ds/styles/ds.utilities.css`
3. small shared presentational wrappers in `src/ds/components/shared/*` only when class contracts are not enough

### Outcome

Repeated product styling becomes centrally editable.

## Workstream C: Activate global visual mode control

### Objective

Make theme and optional visual-mode changes real site-wide levers.

### Current gap

`PlatformPresetScript` and `data-visual` support exist, but are not active from the app root.

### Plan

- Decide whether the product should actively support one default visual mode plus mobile preset behavior.
- If yes, mount the preset mechanism from `src/app/layout.tsx` or equivalent DS root wiring.
- If no, remove or defer dormant visual-mode contracts from the migration scope so the system has one explicit authority path.

### Outcome

Theme changes and visual-mode changes stop being half-wired capabilities.

## Workstream D: Migrate feature surfaces in place

### Objective

Convert feature components to DS-owned visual contracts without relocating them.

### Sequence

1. Public homepage journey
2. Shared public/auth modal family
3. Homeowner quote flows
4. Installer/admin shared surfaces
5. Secondary dashboards and edge states

### Rule

Each component migration is:

- UI only
- one component tree at a time
- verified before the next tree begins

## Workstream E: Harden verification

### Objective

Prevent future styling drift.

### Plan

- Keep using the 6-command verification set from the SOT.
- Extend audit coverage to include:
  - imported child components in the migration tree
  - DS barrel misuse (`@/ds` importing feature-only components)
  - semantic class names used in TSX that are not defined in `src/ds/styles`
- Upgrade `scripts/audit-css-classes.ts` or add a sibling audit script to report these violations.

### Outcome

The migration becomes enforceable instead of aspirational.

---

## 4. File Ownership Plan

## 4.1 Files that remain DS-owned

- `src/ds/styles/index.css`
- `src/ds/styles/ds.tokens.css`
- `src/ds/styles/ds.theme.css`
- `src/ds/styles/ds.base.css`
- `src/ds/styles/ds.utilities.css`
- `src/ds/styles/ds.components.css`
- `src/ds/index.ts`
- `src/ds/foundation/themes/*`
- `src/ds/runtime/*`
- any new generic presentational wrappers added under `src/ds/components/shared/*`

## 4.2 Files that remain feature-owned but must consume DS contracts

- `src/app/page.tsx`
- `src/components/Hero.tsx`
- `src/components/InstantQuoteForm.tsx`
- `src/components/RebateCalculatorForm.tsx`
- `src/components/QuoteOptionsModal.tsx`
- `src/components/QuoteSuccessModal.tsx`
- `src/components/HomeownerSignupModal.tsx`
- `src/components/HomeownersInfoForm.tsx`
- `src/components/OTPVerificationModal.tsx`
- `src/components/SavingsChart.tsx`
- `src/components/homeowner/*`
- `src/components/installer/*`
- `src/components/admin/*`

---

## 5. Delivery Strategy

## Phase 1: Stabilize and define contracts

- clear Gate 0 blockers
- finalize DS boundary rules
- define missing semantic contracts
- choose root visual-mode behavior

## Phase 2: Public journey first

- homepage route tree
- quote calculators
- quote/auth/signup/OTP modals
- newsletter/blog/footer-adjacent public surfaces

This is the highest-value path because it validates the central styling model against the main conversion funnel without touching logic.

## Phase 3: Reusable product patterns

- homeowner lead/quote surfaces
- installer cards, filters, placeholders, messaging shells
- admin analytics/tables/modals

## Phase 4: Enforcement and cleanup

- extend audit scripts
- document DS styling rules
- remove any temporary hybrid patches
- rerun full verification and build gates

---

## 6. Validation Protocol

For every migrated component tree:

1. Run Gate 0 health check as applicable.
2. Create/update the logic audit for the tree.
3. Capture baseline violations using the 6-command SOT verification.
4. Migrate UI only.
5. Re-run the 6-command verification and require 0/0/0/0/0/0 for the full tree.
6. Verify dark theme.
7. Verify light theme.
8. Verify purple theme.
9. Verify responsive behavior at 320, 375, 768, 1024, 1440.
10. Verify accessibility.
11. Verify original logic still behaves identically.
12. Re-run typecheck and build.

---

## 7. Definition of Done

This initiative is done when all of the following are true:

1. `src/components` remains the feature layer.
2. `src/ds` is the real single source of truth for tokens, semantic presentation rules, and global visual behavior.
3. No feature-only component is falsely exported from `@/ds`.
4. Repeated product styling patterns are DS-owned and reused.
5. The 6-command verification set is green for each migrated tree.
6. Gate 0 typecheck and Next build are green.

The measure of success is **centralized control**, not “everything imports from `@/ds`.”