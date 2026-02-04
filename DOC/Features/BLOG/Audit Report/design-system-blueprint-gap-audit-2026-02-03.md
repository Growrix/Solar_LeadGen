# Design System Blueprint Audit + Gap Analysis (2026-02-03)

## Why this audit exists
You created a new blueprint at:
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design_system_Blueprint.md`

This audit compares the **current** SolarMatch frontend design system implementation against that blueprint, identifies concrete gaps (with repo evidence), and proposes a roadmap to reach the blueprint’s target architecture.

---

## Executive summary
**Good news:** the repo already has several “design-system first” foundations in place:
- Runtime theming via CSS variables (multi-theme: dark/light/purple).
- Tailwind semantic token wiring that maps to CSS variables.
- An enforcement gate (`scripts/design-system-verify.ts`) used by `npm run gate0`.
- Playwright-based screenshot audit harness for theme/viewport coverage.

**Core issue:** the system is currently **tokenized**, but not yet **layered** per the blueprint.
- Pages still make layout/spacing decisions.
- DS primitives/layout shells are not the only way to build screens.
- Enforcement is incomplete (it misses common real-world className patterns and all CSS-defined styles).

**Outcome:** You have a strong “governance + tokens” base, but still need to build the blueprint’s missing layers: **Primitives**, **Composed components**, and especially **Layout/Shell components**, plus **import boundaries + stronger enforcement**.

---

## Current DS snapshot (what exists today)

### Tokens (partially centralized)
- Runtime tokens live in `src/app/globals.css` (CSS variables).
- TS semantic tokens exist at `src/design-tokens/**` and are consumed by `tailwind.config.js`.
  - Colors are runtime-only by design (TS color tokens are deprecated/reference-only).

**Key observation:** there are multiple token sources for non-colors (e.g., spacing/radius/shadows exist in CSS variables and also as TS values). This creates “split truth” risk.

### Themes
- Theme selection/persistence: `src/components/ThemeProvider.tsx` applies `theme-dark|theme-light|theme-purple` on `<html>`.
- Tailwind dark mode is aligned to `theme-dark` via `darkMode: ['class', '.theme-dark']`.

### Primitive & shared components
- UI-ish primitives exist under `src/components/ui/*` (button, card, input, dialog, etc.).
- Many other reusable components live across `src/components/**` (admin/homeowner/installer/etc), mixing primitives + composed components + layout behaviors.

### Layout / shells
- `src/components/LayoutContent.tsx` acts like a global wrapper (header/nav + modals + role-based behavior).
- There is no canonical set of shells like `DashboardShell`, `PublicShell`, `CenteredShell`.
- Multiple pages implement their own containers/max-width/padding/breakpoints.

### Enforcement
- `scripts/design-system-verify.ts` enforces:
  - no hardcoded Tailwind palette colors
  - no `bg-white`/`text-black`
  - no `dark:` variants (unless allowlisted)
  - no Tailwind arbitrary values (e.g. `w-[...]`)
  - no raw typography utilities

**Important limitation:** enforcement primarily detects class strings that are plain string literals. It does not reliably catch className template strings with `${...}` or other computed patterns.

### Tests
- Playwright screenshot harness exists: `tests/e2e/frontend-design-system-audit-screenshots.spec.ts`.
- No explicit automated accessibility (axe) checks are visible in the current DS tooling.

---

## Blueprint alignment matrix (high-level)

Blueprint layer → Current status → Gap severity

1) **Design Tokens (semantic, single source of truth)**
- Present (CSS variables + Tailwind semantic mapping + TS semantic tokens).
- **Gap:** “single source of truth” is not fully true for spacing/radius/shadows; there are duplicated token systems.
- Severity: **P1**

2) **Themes (runtime variants, components do not branch)**
- Present and mostly compliant.
- **Gap:** some theme-specific component styling exists in global CSS (theme selectors affecting component classes), which is “theme overrides component” rather than “theme overrides tokens”.
- Severity: **P1**

3) **Primitive components (UI alphabet)**
- Partial (Button/Card/Input exist), but not structured as a DS package.
- **Gap:** missing canonical primitives like Stack/Grid/Container/Text/Icon/Spacer as the only allowed layout mechanism.
- Severity: **P0/P1** depending on adoption plan

4) **Composed components (reusable blocks)**
- Many exist, but not clearly separated from page-specific components.
- **Gap:** inconsistent layering; composed components sometimes embed layout decisions.
- Severity: **P1**

5) **Layout / Shell components (most important)**
- Not present as a DS layer; pages still implement their own layout.
- Severity: **P0**

6) **Pages & Features (consumers only)**
- Not currently true: pages contain layout, spacing, and breakpoint decisions.
- Severity: **P0**

7) **Import rules (single DS entry)**
- Not implemented (no `src/ds/index.ts`, no restricted imports).
- Severity: **P0/P1**

8) **Enforcement (AI/human safe)**
- Present but incomplete coverage (computed className + CSS).
- Severity: **P0**

---

## Concrete gaps & issues (repo evidence)

### P0 — Blueprint violations that enable drift today

#### 1) Pages are still “decision makers” for layout/spacing/responsiveness
Blueprint rule broken:
- “Pages cannot define layout / padding / max-width / responsiveness.”

Evidence examples:
- `src/app/installer/(dashboard)/marketplace/page.tsx` uses `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` and breakpoint grids.
- `src/app/blog/BlogIndexClient.tsx` uses `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- `src/app/solarconnect/page.tsx` uses its own max-width/padding.

Impact:
- Layout changes require touching many pages.
- Inconsistent spacing rhythms across sections.
- Hard to keep “one place controls layout”.

#### 2) Enforcement misses common real-world className patterns
Blueprint rule broken:
- “No hardcoded values / no arbitrary values” must be enforceable, including with AI-generated template strings.

Evidence:
- `src/app/page.tsx` includes `w-[calc(50%-0.25rem)]` inside a template string with `${...}`.
- Gate0 currently passes, indicating the verifier is not reliably catching template-expression className strings.

Root cause:
- `scripts/design-system-verify.ts` extracts string literals and no-substitution template literals, but does not fully parse `TemplateExpression` / `clsx` call patterns.

Impact:
- Arbitrary values and forbidden utilities can be introduced silently.

#### 3) Global CSS contains component-like styling outside enforcement
Blueprint rule broken:
- “No hardcoded values; everything reusable or forbidden; system design dictates.”

Evidence:
- `src/app/globals.css` defines component-style classes like `.btn-delete` with hardcoded `rgb(255 255 255)` foreground.
- Global animation keyframes use fixed pixel values (e.g., `translateY(20px)`).

Impact:
- A parallel styling system can grow outside Tailwind governance.

#### 4) Import boundaries are missing (no single DS entry)
Blueprint rule broken:
- “Single public entry only: `import { Button, Stack, DashboardShell } from '@/ds'`.”

Evidence:
- No `src/ds` folder exists.
- Components are imported from multiple places (`@/components/*`, `@/components/ui/*`, etc.).

Impact:
- Team/AI can bypass DS primitives/shells.
- System layering cannot be enforced.

---

### P1 — Consistency/maintainability issues (risk of drift)

#### 5) Split token truth for spacing/radius/shadows
Blueprint intent:
- “Tokens are the single source of truth.”

Evidence:
- `src/app/globals.css` defines spacing/radius/shadow variables.
- `src/design-tokens/semantic/*` defines spacing/radius/shadows as TS objects consumed by Tailwind.

Impact:
- Over time, the CSS-variable values and TS token values can diverge.

#### 6) Theme option “system” exists in runtime but not in UI
Evidence:
- `src/components/ThemeProvider.tsx` supports `theme='system'`.
- `src/components/ThemeSwitcher.tsx` does not expose “System”.

Impact:
- Capability exists but user experience is incomplete.

#### 7) “Layouts are DS” is not expressed as a folder/layer
Evidence:
- `src/components/LayoutContent.tsx` mixes layout responsibilities with auth/session/modals.

Impact:
- Hard to create reusable shells without pulling app logic along.

#### 8) Tailwind status HSL tokens appear mismatched with runtime variables
Evidence:
- `tailwind.config.js` maps some `*-hsl` colors to CSS vars like `--success`, `--warning`, `--info`.
- `src/app/globals.css` defines `--color-success`, `--color-warning`, `--color-info` (not `--success` etc.).

Impact:
- Dead/undefined tokens may exist.

---

### P2 — Hygiene
- The repo contains both `src/app` and `src/pages` routes. This is workable, but conflicts with the blueprint’s “app/ routing only” mental model.

---

## Roadmap to reach the blueprint architecture
This roadmap is designed to be **drop-in** and incremental (no big-bang rewrite), while increasing governance at each phase.

### Phase 0 (1–3 days): Make governance match reality
1) **Strengthen DS enforcement**
   - Update verifier to detect class strings inside:
     - JSX `className={\`...${...}\`}` template expressions
     - `clsx(...)` / `cn(...)` call patterns (collect string literals across args)
   - Add a “CSS scan” mode for `src/app/globals.css` and other DS CSS layers (at minimum: ban hex/rgb literal colors and `transition: all`).

2) **Define a blueprint-compatible “allowed page styling surface”**
   - Start by forbidding `max-w-*`, `container`, `mx-auto`, and `px-*` directly in `src/app/**` (except in approved shells).
   - Do this gradually via an allowlist to avoid breaking the world.

Deliverable: enforcement that actually blocks blueprint violations.

### Phase 1 (3–7 days): Introduce canonical DS package boundary (`src/ds`)
Create the blueprint structure without forcing migrations immediately:
- `src/ds/index.ts` as the **only public DS entry**.
- `src/ds/tokens/*` re-export from `src/design-tokens/*` initially.
- `src/ds/styles/*` to host DS CSS (split out from `globals.css` over time).
- `src/ds/primitives/*` re-export existing `src/components/ui/*` initially.

Add ESLint “restricted imports”:
- Forbid importing from `src/components/ui/*` directly outside `src/ds/*`.

Deliverable: a boundary that matches the blueprint, even if internal content is still being migrated.

### Phase 2 (1–2 weeks): Build the missing primitives (layout primitives first)
Blueprint requires layout to be centralized and reusable. The fastest leverage primitives:
- `Stack`, `Inline`, `Grid`, `Container`, `Spacer`, `Text`.

Rules:
- These primitives own spacing + responsiveness (not pages).
- Prefer semantic spacing keys (e.g., `gap="form-gap"`) mapped to Tailwind tokens.

Deliverable: pages can stop writing `max-w-7xl px-4 sm:px-6`.

### Phase 3 (1–2 weeks): Create layout shells (the biggest blueprint unlock)
Add `src/ds/layouts/*` shells:
- `PublicShell`
- `DashboardShell`
- `CenteredShell`

Move “max-width, padding, breakpoint logic” into shells.

Deliverable: pages become “assembly only”.

### Phase 4 (ongoing): Migrate pages → shells + primitives
- Start with the highest-traffic pages (`/`, installer dashboard, homeowner dashboard, admin).
- Migrate one route group at a time.
- Keep Gate0 green.

Deliverable: consistent layout + controlled change surface.

### Phase 5 (ongoing): Consolidate tokens (remove split-truth)
Pick one source of truth for non-color tokens:
- Option A: make Tailwind consume CSS variables for spacing/radius/shadows too.
- Option B: remove CSS variables for those and keep them TS-only.

Deliverable: “tokens are single source of truth” becomes real.

### Phase 6 (hardening): Accessibility + testing enforcement
- Add automated a11y checks (Playwright + axe) at minimum for `/`, `/component-library`, `/theme-test`, `/solarconnect`.
- Add a “layout snapshot” or screenshot baseline per shell.

Deliverable: blueprint’s “Accessibility always on” becomes enforceable.

---

## Recommended next actions (pragmatic)
If you want the fastest path to blueprint compliance, do these first:
1) Fix enforcement blind spots (template string / computed className + CSS scanning).
2) Add `src/ds` boundary + restricted imports.
3) Build `Container` + `Stack` + `Grid` primitives.
4) Introduce `PublicShell` and migrate `/` + `/solarconnect` first.

---

## Appendix: Related existing audits
This blueprint audit complements (does not replace) the existing global DS audits:
- `DOC/Features/BLOG/Audit Report/frontend-global-design-system-audit-2026-02-01.md`

