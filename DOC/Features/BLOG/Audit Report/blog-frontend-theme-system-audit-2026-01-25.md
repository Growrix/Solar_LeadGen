# BLOG Frontend Theme System Audit (2026-01-25)

## Goal
Establish the authoritative theme/token system for this repo and assess BLOG admin UI compliance risks before migration.

## Scope
- System sources: Tailwind config, global CSS variables, theme switching mechanism, design token modules, and the Design System SOT.
- Target surfaces: `src/components/admin/blog/**` and related admin/blog routes.

## Current Theme System (Observed)

### 1) Theme switching mechanism
- `src/components/ThemeProvider.tsx` applies theme class to the root html element:
  - `document.documentElement.className = theme-${theme}`
  - Persisted in `localStorage` under key `solarmatch-theme`
  - Supported themes: `dark | light | purple | system`

### 2) CSS variables as runtime source of truth
- `src/app/globals.css` defines per-theme CSS variables under selectors like:
  - `:root.theme-dark { --color-background: ...; --color-surface: ...; ... }`
  - `:root.theme-light { ... }`
  - `:root.theme-purple { ... }`
- These variables include semantic buckets:
  - Background/surface, foreground tiers, borders
  - Status colors: success/warning/error/info
  - Shadows (neumorphic + legacy aliases)

### 3) Tailwind semantic utilities map to CSS variables
- `tailwind.config.js` maps Tailwind color names to CSS variables, enabling semantic class usage:
  - Examples: `bg-background`, `bg-surface`, `text-foreground`, `border-border`, `text-success`, etc.
- Typography also has semantic sizing (via tokens imported into Tailwind):
  - Examples: `text-heading-*`, `text-body-*` (exact keys per config)

### 4) Design tokens modules exist, but may not be the sole SOT
- Design tokens live under `src/design-tokens/**`.
- Observed semantic token strategy includes accent/status/overlay primitives (example: an orange accent plan and `overlay: rgba(0,0,0,0.8)`), which may not 1:1 match the globals.css theme palette narrative.

### 5) Governance / rules
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md` is the enforcement narrative:
  - Prohibits hardcoded colors and raw typography utilities
  - Requires running a standard verification set (hardcoded color names, rgb/hex, white/black, dark: variants, manual responsive typography, etc.)

## Findings: BLOG Admin Compliance

### High-severity: widespread hardcoded Tailwind colors
- BLOG admin components contain extensive uses of non-semantic Tailwind classes such as:
  - `bg-slate-*`, `text-slate-*`, `border-slate-*`
  - `bg-white`, `text-white`, `bg-black`, `text-black`
  - status hardcodes: `bg-green-*`, `bg-red-*`, `bg-blue-*`, etc.

### High-severity: hardcoded overlays / effects
- At least one modal uses a raw `rgba(...)` overlay via arbitrary shadow utilities.
  - This must be migrated to semantic overlay/shadow tokens supported by the design system.

### Medium: typography utilities likely non-semantic
- Many components use raw `text-sm`, `text-lg`, `font-semibold`, etc. (to be removed in favor of semantic typography tokens).

### Note: dark mode variant usage
- No `dark:` usage was found in BLOG admin components during the initial scan (good), but this should be re-verified per-file as we migrate.

## Risks / Ambiguities

### Multiple “sources of truth” for color strategy
- Runtime theme palette is clearly present in `globals.css` via `--color-*` variables.
- `src/design-tokens/**` includes additional semantic definitions (accent/overlay strategy) that may differ from globals.css.
- Recommendation: for BLOG admin migration, treat **Tailwind semantic classes backed by globals.css CSS variables** as the binding contract unless/until a unified token reconciliation is completed.

## Migration Recommendation (Summary)

1. Migrate BLOG admin UI to semantic Tailwind utilities only:
   - Colors: `bg-background`, `bg-surface`, `text-foreground`, `border-border`, status tokens.
   - Typography: `text-heading-*`, `text-body-*`, etc.
2. Replace raw overlay/shadow classes with semantic equivalents:
   - Prefer existing shadow tokens configured in Tailwind; otherwise introduce an approved semantic utility (only if already supported by repo conventions).
3. Enforce per-component “component tree” verification:
   - A component is only complete when it and all child components it renders pass the verification command set (0 matches).

## Outputs (for Phase 8)
- This audit: `DOC/Features/BLOG/Audit Report/blog-frontend-theme-system-audit-2026-01-25.md`
- Adaptation plan: `DOC/Features/BLOG/Migration/blog-admin-theme-adaptation-plan-2026-01-25.md`
