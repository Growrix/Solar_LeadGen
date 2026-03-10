# SolarMatch Frontend Migration Plan (DS-Only)

## Goal
Make `src/ds` the **only** design system and the **single source of truth** for:

- Theme + tokens (dark/light/purple)
- Global styles + utilities
- UI primitives (Button, Input, Card, Modal, etc.)
- App shells/layout patterns (marketing, dashboard, mobile)

The end-state is:

- No dependency on legacy `src/app/globals.css` semantic classes (e.g. `.theme-card`, `.neu-card`, `.form-input`)
- No dependency on legacy `src/design-tokens/*`
- No new usage of `src/components/ui/*` (legacy/shadcn-like UI) in product pages

## Non-goals
- Rewriting business logic, API calls, validation, auth/session flows, or Prisma.
- Changing product IA (routes, pages, features) as part of styling work.

## Current State (what’s coupled today)

### 1) Global CSS is doing too much
`src/app/globals.css` currently contains:

- Tailwind directives (`@tailwind base/components/utilities`)
- Theme token variables (multi-theme)
- A large set of semantic classes and neumorphic shadow utilities

These classes are referenced widely across `src/components/**` and `src/app/**`.

### 2) Theme bootstrapping is unsafe
`src/components/ThemeProvider.tsx` sets:

- `document.documentElement.className = ...`

This **clobbers all existing `<html>` classes** and is a frequent source of conflicts.

### 3) Tailwind config depends on legacy tokens
`tailwind.config.js` imports from `src/design-tokens/*` and expects legacy CSS variables.

### 4) DS exists but is mostly not used by app UI
`src/ds` already provides:

- CSS layers: `src/ds/styles/index.css`
- Theme init + storage key compatible with the app (`solarmatch-theme`)
- Primitives and shared components (Card, Modal, Drawer, etc.)

But most pages/components still use legacy semantic classes or `src/components/ui/*`.

## Target Architecture (DS-Only)

### Single DS entrypoints
- CSS: `src/ds/styles/index.css` is the authoritative DS CSS.
- Components: import from `@/ds` (public barrel: `src/ds/index.ts`).
- Theme: use DS theme functions + `ThemeInitScript` to avoid flash.

### Compatibility stance
During migration we can temporarily keep legacy CSS in place to avoid a “big bang” break.

But:

- **No new legacy classes** should be introduced.
- Every migrated component must use DS primitives/tokens only.

## Guardrails (rules during migration)

1) **No new semantic classes in `globals.css`**. Only DS CSS may introduce new global classes.
2) **No new imports from `src/design-tokens/*`**.
3) Prefer DS primitives/components over raw Tailwind.
4) If Tailwind is used, it must remain semantic (no hardcoded colors/typography).
5) Theme class management must never overwrite the whole `className` of `<html>`.

### Automated checks to keep us honest
- Hardcoded scanner: `npx ts-node scripts/scan-hardcoded-values.ts`
- Classname violations: `npx tsx scripts/validate-classnames.ts`
- Class usage audit: `npx tsx scripts/audit-css-classes.ts`

## Migration Phases

### Phase 0 — Baseline + inventory (1 day)
Deliverables:

- A “before” audit snapshot committed to docs/specs
- A prioritized migration list (highest traffic + highest reuse)

Steps:

1) Generate audits:
   - `npx tsx scripts/audit-css-classes.ts`
   - `npx ts-node scripts/scan-hardcoded-values.ts`
2) Capture the biggest legacy semantic class usage clusters:
   - `.theme-card`, `.detail-card`, `.neu-card`, `.form-input`, `.form-select`, `shadow-neu-*`
3) Identify top UI hotspots to migrate first:
   - Layout shells and nav
   - Modal-heavy flows (sign-in/sign-up/eligibility/quote request)
   - Dashboard tables/cards


Success criteria:

- We can point to a stable baseline report.
- We have a short “Wave 1” list with owners.

---

### Phase 1 — Wire DS globally (safe, no UI rewrite) (0.5–1 day)
Goal: make DS CSS + theme init available everywhere with minimal behavior change.

Steps:

1) Import DS CSS globally
   - Add `@import "../ds/styles/index.css";` inside `src/app/globals.css`.
   - Keep Tailwind directives in `globals.css` (they are still needed for now).
   - Ensure import order is consistent across environments (avoid duplicate imports).

2) Add DS theme bootstrap
   - In `src/app/layout.tsx`, render `ThemeInitScript` (from `@/ds`) in `<head>`.
   - This ensures `theme-dark|light|purple` is applied before paint.

3) Fix theme class clobbering (critical)
   - Replace the legacy behavior of `document.documentElement.className = ...`.
   - Adopt DS theme approach: remove only `theme-*` classes and add the new one.
   - Keep `solarmatch-theme` storage key to avoid breaking existing user preference.

Success criteria:

- App still renders with existing UI.
- Theme switching works (dark/light/purple) without removing unrelated `<html>` classes.
- No noticeable “flash” during first paint.

---

### Phase 2 — Stop the bleeding (new code uses DS only) (same day as Phase 1)
Goal: prevent migration scope from growing.

Steps:

1) Update internal dev guidance
   - New components/pages must import primitives from `@/ds`.
   - Don’t use `src/components/ui/*` for new work.
   - Don’t add new semantic classes in `globals.css`.

2) Convert test/demo pages to DS (low risk, high signal)
   - `src/app/component-library/page.tsx` currently showcases legacy semantics and `src/components/ui/*`.
   - Convert it into a DS showcase (Card, Button, Input, Badge equivalents from `@/ds`).
   - `src/app/theme-test/page.tsx` currently toggles `dark` class (not aligned with `theme-*`).
     Either remove it, or update it to exercise DS themes.

Success criteria:

- Team has a single reference surface that reflects DS reality.
- No new legacy usage lands after this phase.

---

### Phase 3 — Migrate primitives usage (UI layer) (2–5 days)
Goal: replace legacy UI primitives usages in the app with DS primitives.

Primary replacements:

- `src/components/ui/button` → `@/ds` `Button`
- `src/components/ui/input` → `@/ds` `Input`
- `src/components/ui/card` → `@/ds` `Card`/`CardHeader`/`CardContent`/`CardFooter`
- `src/components/ui/label` → `@/ds` `Label`
- Legacy `.form-input`/`.form-select` → DS `Input`/`Select`/`Textarea`

Approach:

- Start with shared primitives that appear everywhere.
- Avoid changing runtime behavior; keep props and event handlers stable.

Verification:

- Run `npx tsx scripts/validate-classnames.ts src/components/<file>.tsx` per migrated component.

---

### Phase 4 — Migrate shells + navigation (3–7 days)
Goal: move layout containers and navigational chrome onto DS structures.

High-ROI targets:

- `src/components/LayoutContent.tsx` (wraps most pages and mounts many modals)
- `src/components/TopBar.tsx`, `src/components/HeaderMenu.tsx`, bottom nav bars
- Sidebars and mobile menus that heavily use `.theme-card`, `shadow-neu-*`, and `bg-surface` patterns

Why this wave matters:

- Reduces global semantic class reliance dramatically.
- Establishes DS spacing/layout patterns that child pages can follow.

---

### Phase 5 — Migrate modal-heavy flows (5–10 days)
Goal: unify dialogs/modals/drawers on DS components.

Targets (examples seen in layout):

- Installer eligibility/sign-in/sign-up modals
- Homeowner sign-in/sign-up modals
- Quote request modal, messaging modal

Preferred DS building blocks:

- `@/ds` `Modal` / `Drawer` (shared components)
- DS `Card` for dialog content sections
- DS form primitives

Success criteria:

- No `.theme-card` usage remains in these flows.
- Keyboard focus + ESC close behavior is consistent.

---

### Phase 6 — Dashboard + data display migration (7–14 days)
Goal: bring tables, lists, stat cards, and charts onto DS widgets/patterns.

Targets:

- Admin analytics/list pages
- Installer lead feeds
- Homeowner dashboard overview

Preferred DS blocks:

- `Card`, `MetricCard`, `StatWidget`, tables/resources patterns in `src/ds/components/shared/*`

---

### Phase 7 — Remove legacy tokens and semantic CSS (cleanup) (2–5 days)
Goal: delete legacy systems once no longer referenced.

Steps:

1) Remove legacy semantic blocks from `src/app/globals.css`.
2) Remove `src/design-tokens/*` and any Tailwind config imports that reference it.
3) Remove or quarantine `src/components/ui/*` if no longer used.
4) Re-run audits and ensure they reflect DS-only usage.

Success criteria:

- `globals.css` contains only Tailwind directives + minimal app-wide resets + DS import.
- No code references legacy semantic classes.
- Tailwind config no longer imports `src/design-tokens/*`.

## “Definition of Done” (DS-only)

1) `src/ds/styles/index.css` is the only token/theme authority.
2) Theme switching uses DS theme application logic (no `<html>.className = ...`).
3) No usage of:
   - `.theme-card`, `.detail-card`, `.neu-card`, `.form-input`, `.form-select`, `shadow-neu-*`
4) No imports from `src/design-tokens/*`.
5) Build gates pass:
   - Typecheck (Gate0 task: `Gate0: Typecheck`)
   - Next build (Gate0 task: `Gate0: Next build`)

## How to run checks (commands)

Repo scripts that are useful during the migration:

- `npx tsx scripts/audit-css-classes.ts` (writes report under `specs/005-comprehensive-css-class/audit-report.md`)
- `npx ts-node scripts/scan-hardcoded-values.ts` (hardcoded hex/rgb/tailwind scans)
- `npx tsx scripts/validate-classnames.ts [optional-glob]` (CI-friendly violations)

Note: some scripts mention “shadcn” in comments due to earlier migrations; they’re still useful as general scanners/validators for DS-only enforcement.

## Practical Mapping (legacy → DS)

| Legacy pattern | DS replacement |
|---|---|
| `.theme-card` modal container | `@/ds` `Modal` + DS layout primitives |
| `.detail-card` content card | `@/ds` `Card` |
| `.neu-card*` variants | `@/ds` `Card` + DS surface/shadow tokens |
| `.form-input` | `@/ds` `Input` / `Textarea` |
| `.form-select` | `@/ds` `Select` |
| `src/components/ui/*` | `@/ds` primitives/components |
| Theme switching via `<html>.className = ...` | DS `applyTheme()` + `ThemeInitScript` |

## Notes / Known Pitfalls

- `src/app/theme-test/page.tsx` uses a `dark` class toggle which is unrelated to the `theme-*` system.
  This page should be updated or removed to prevent confusion.
- `src/app/component-library/page.tsx` currently documents the legacy semantic system.
  It should become the DS showcase to keep future work aligned.
