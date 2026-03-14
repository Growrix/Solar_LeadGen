# Frontend regressions audit (post DS migration)

Date: 2026-03-10

## Goal
Identify why the UI regressed after DS migration work, compare pre-migration vs current behavior where possible, and outline what to do next to get back to parity.

## Executive summary
- **P0 (real breakage):** Tailwind semantic color `muted` was defined as a plain `var(--ds-color-surface-2)` which **does not support Tailwind opacity modifiers** (e.g. `bg-muted/20`, `border-muted/30`). This pattern is used widely across the app and can cause elements (including modal panels/sections) to render with missing/incorrect background/border colors.
- **P0 (not DS-adapted):** The runtime app currently **does not import/use DS React primitives/components** (`@/ds/...`). A quick scan found **0 occurrences** of `@/ds/` imports in `src/`, while legacy `@/components/` imports occur **94 times**. Result: UI is still largely driven by Tailwind/legacy components, so a “DS-only” visual guarantee is not currently met.
- **P1 (parity drift):** Pre-migration Tailwind config had separate tokens for `primary` and `secondary` via `--color-primary` and `--color-secondary`. Current config maps both `primary` and `secondary` to `--ds-color-accent`, which makes “primary vs secondary” semantics visually indistinguishable wherever the app uses those classes.

## What changed (pre-migration vs now)
### Tailwind semantic colors
Pre-migration (branch `origin/Before_fresh_DS`):
- `muted`, `subtle`, `background-alt`, `surface-hover`, etc were defined as `rgb(var(--color-...) / <alpha-value>)`.
- This makes classes like `bg-muted/20` valid and predictable.

Current (this branch):
- Several semantic keys were defined using plain `var(...)` and/or `color-mix(...)` values.
- That is fine for non-opacity usage (`bg-muted`), **but breaks** the widespread `/xx` modifiers the codebase uses.

### Dark mode selector
Pre-migration:
- `darkMode: ['class', '.theme-dark']` (dark variants follow the app theme class on `<html>`)

Current:
- `darkMode: 'class'`

This is lower priority right now because a scan did not find meaningful `dark:` usage in `src/**` at the time of audit, but it is still a drift vs baseline and can bite later.

## Evidence (where regressions originate)
### Widespread opacity usage on `muted`
Examples of patterns that were impacted by the Tailwind config:
- `bg-muted/10`, `bg-muted/20`, `bg-muted/50`
- `border-muted/30`, `border-muted`
- `text-muted`

Representative files:
- `src/app/installer/(dashboard)/profile/page.tsx` (`bg-muted/10`, `bg-muted/20`)
- `src/app/admin/installers/[id]/page.tsx` (`bg-muted/20`, `bg-muted/10`, `bg-muted/5`)
- `src/components/QuoteSuccessModal.tsx` (`bg-muted/50`)
- `src/components/admin/InstallerProfileModal.tsx` (`bg-muted/20`, `hover:bg-muted/40`)
- `src/components/BiddingStatusBadge.tsx` (`bg-muted/20`, `border-muted/30`, `text-muted`)

### DS components not wired into product UI
- DS implementations exist (e.g. `src/ds/primitives/Button.tsx`, `src/ds/components/shared/Modal.tsx`).
- But product UI under `src/app/**` and `src/components/**` does not currently import from `@/ds/...`.

Adoption quick-counts (PowerShell scan):
- `@/ds/` imports: **0**
- `@/components/` imports: **94**

## Fix applied during this audit (P0)
### Tailwind `muted`/`subtle` opacity support
- Updated `tailwind.config.js` so `muted` and `subtle` are defined as `rgb(var(--ds-color-foreground-rgb) / <alpha-value>)`.
- This restores support for `bg-muted/20` etc without requiring new DS tokens.

Validation:
- `npm run build` succeeds after the change.

## Remaining issues / decisions (what to do next)
### 1) Decide how to achieve “DS-only” parity
Right now the UI is mostly Tailwind + legacy components. There are two viable paths:
- **Path A (recommended for DS-only guarantee):** Migrate the most user-visible components (buttons, modals, panels, badges) to DS primitives/components so visuals don’t depend on Tailwind semantic mappings.
- **Path B (stabilize legacy while migrating):** Keep legacy components for now, but align Tailwind semantic mappings with pre-migration expectations (restore distinct `secondary`, ensure all tokens used with `/xx` support alpha).

### 2) Restore/define `secondary` semantics
If the product UI expects “secondary” to differ from “primary”:
- Either reintroduce a DS token for a distinct secondary color,
- Or update product components to use DS button variants (secondary/outline) instead of relying on Tailwind `bg-secondary`.

### 3) Re-check overlay/scrim semantics for modals
Pre-migration Tailwind defined `scrim`. Current config does not. If any modal/backdrop still uses `bg-scrim/...`, reintroduce a `scrim` mapping to `--ds-color-overlay`.

### 4) (Optional) Align Tailwind dark mode selector to app themes
If the app uses `<html class="theme-dark">`, consider restoring `darkMode: ['class', '.theme-dark']` for parity.

## Suggested verification checklist
- Visit a page that uses modals (e.g. homeowner dashboard flows) and confirm:
  - backdrops show,
  - modal panels have visible background/borders,
  - skeleton/loading states render with muted fills.
- Spot check `bg-muted/20` usage screens (installer profile/admin installer detail pages).
- Confirm button hierarchy where applicable (if still using Tailwind semantics).
