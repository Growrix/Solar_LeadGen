# Frontend Global Design System Audit (2026-02-01)

## Goal
Deeply audit the current frontend global design system implementation against the SOT:
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

Deliverables:
1) A complete, implementation-accurate design system SOT (updated as needed)
2) A gap list (this report) with concrete, repo-specific evidence

---

## Global Influencer Files (must be considered “global SOT influencers”)
These files affect the entire frontend design system behavior:

### Runtime tokens + base styling
- `src/app/globals.css`
  - Defines CSS variable tokens for `theme-dark`, `theme-light`, `theme-purple`
  - Defines base styles and global reusable classes (e.g. neumorphic classes)

### Tailwind token wiring + semantic class surface
- `tailwind.config.js`
  - Maps semantic Tailwind classes to CSS variables
  - Defines `darkMode: ['class', '.theme-dark']`
  - Adds plugins for responsive spacing utilities and icon sizing utilities

### Theme application + persistence
- `src/components/ThemeProvider.tsx`
  - Persists preference in `localStorage` and applies `theme-dark|theme-light|theme-purple` to `<html>`
  - Supports a `system` preference by resolving to `theme-dark` or `theme-light` via `prefers-color-scheme`

### App root (providers + font + global UX)
- `src/app/layout.tsx`
  - Imports global CSS
  - Applies `next/font` Inter class on `<body>`
  - Wraps app with `ThemeProvider` and global `Toaster`

### Semantic TS tokens consumed by Tailwind
- `src/design-tokens/**`
  - Semantic typography/spacing/shadows/borders/animations are used by `tailwind.config.js`
  - Colors are intentionally runtime-only (CSS vars), TS color tokens are deprecated for runtime

### Design-system enforcement tooling
- `scripts/design-system-verify.ts`
  - Enforces “no hardcoded palette colors / no raw typography / no dark: / no arbitrary values” for TS/TSX class strings
- `package.json`
  - Scripts: `ds:verify`, `ds:audit`

### Frontend build/tooling that affects global styling correctness
- `postcss.config.js` (Tailwind pipeline)
- `tsconfig.json` (global includes/excludes)
- `.eslintrc.json` (Tailwind linting rules; Storybook plugin also enabled)

---

## What’s already aligned / in good shape
- Multi-theme model exists and is centrally expressed via CSS variables in `src/app/globals.css`.
- Tailwind semantic token approach exists (colors are CSS variables, not hardcoded palettes).
- Theme application preserves non-theme `<html>` classes and limits removal to `theme-*` classes.
- Enforcement exists for TS/TSX class strings via `scripts/design-system-verify.ts`.

---

## Gaps (by priority)

### P0 — Correctness (can produce real UI inconsistencies or broken tokens)

1) **Tailwind config references HSL status variables that do not exist at runtime**
   - `tailwind.config.js` defines: `success-hsl`, `info-hsl`, `warning-hsl` using `--success`, `--info`, `--warning`
   - `src/app/globals.css` does **not** define `--success`, `--info`, `--warning` (no matches found)
   - Impact: any usage of these `*-hsl` tokens will resolve to undefined CSS vars.

2) **Status foreground tokens are partially hardcoded and may not be theme-correct**
   - `tailwind.config.js` sets `error-foreground`, `success-foreground`, `warning-foreground`, `info-foreground` to hardcoded white (`rgb(255 255 255 / <alpha-value>)`).
   - `src/app/globals.css` explicitly uses a non-white destructive foreground in purple theme (`--destructive-foreground: 26 17 46`) for contrast.
   - Impact: semantic `*-foreground` utilities can be wrong on non-dark themes.

3) **Theme UX surface does not expose the `system` option even though runtime supports it**
   - `src/components/ThemeProvider.tsx` supports `theme='system'`.
   - `src/components/ThemeSwitcher.tsx` offers only Dark/Light/Purple (no System).
   - Impact: “system theme” exists as a capability but is not reliably reachable via UI.

4) **Font loading is duplicated (potentially inconsistent)**
   - `src/app/layout.tsx` loads Inter via `next/font/google`.
   - `src/app/globals.css` also defines multiple `@font-face` rules for Inter from `/public/fonts/...`.
   - Impact: double downloads, unexpected font precedence, and harder-to-reason typography.

### P1 — Consistency / Maintainability (increases drift risk)

5) **Canonical vs alias token naming is not fully normalized**
   - Canonical elevated surface token exists: `--color-background-elevated`.
   - Tailwind’s `bg-surface` currently maps to `--color-surface` (a legacy alias).
   - Impact: new code can pick different tokens for the same concept.

6) **Two shadow systems exist (standard RGBA shadows vs neumorphic variable system)**
   - `src/app/globals.css` defines neumorphic shadows (`--shadow-outset-*`, `--shadow-inset-*`).
   - `src/design-tokens/semantic/shadows.ts` defines RGBA-based shadows used for `shadow-card`, `shadow-modal`, etc.
   - Impact: inconsistent “depth language” across the app unless conventions are clarified.

7) **Global CSS contains component-like reusable classes that bypass Tailwind enforcement**
   - `src/app/globals.css` defines many reusable classes (e.g. `.neu-btn`, `.btn-outline`) and some include broad transitions (`transition: all ...`).
   - The enforcement script checks TS/TSX class strings, not CSS.
   - Impact: policy drift (hardcoded values or discouraged patterns can sneak in via CSS).

8) **A few hardcoded values remain inside otherwise tokenized global styles**
   - Example: `:root.theme-dark .theme-card { background: #121212; }` (hardcoded hex)
   - Impact: theme-correctness is more fragile than it needs to be.

### P2 — Tooling hygiene / noise (doesn’t break UI but adds confusion)

9) **Storybook lint config exists even when Storybook may not be part of the current workflow**
   - `.eslintrc.json` extends `plugin:storybook/recommended`.
   - `tailwind.config.js` includes `./stories/**/*` in `content`.
   - Impact: noise in linting/config and possible confusion about SOT.

---

## SOT update performed
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`
  - Clarified theme application behavior (`system` resolves to `theme-dark`/`theme-light`)
  - Added enforcement references (`ds:verify`, `ds:audit`, `scripts/design-system-verify.ts`)
  - Added canonical-vs-alias token precedence and a core semantic Tailwind map

---

## Recommended Next Focus (after this audit)
Prioritize addressing P0 items first:
- Either remove the unused `*-hsl` Tailwind tokens OR define the missing runtime CSS variables.
- Make status foreground tokens theme-aware (CSS variables) instead of hardcoded white.
- Decide whether “system theme” is a supported user option and expose it in UI if yes.
- Choose one Inter font loading strategy (Next font OR local `@font-face`) to remove ambiguity.
