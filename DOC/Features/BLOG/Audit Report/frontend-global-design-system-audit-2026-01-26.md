# Frontend Global Design System Audit (2026-01-26)

## Revalidation (2026-01-29)

This report was revalidated against the current rollback state on **2026-01-29** (pre-migration).

- No material changes were found in the core global design-system files:
  - `src/app/globals.css`
  - `tailwind.config.js`
  - `src/components/ThemeProvider.tsx`
  - `src/app/layout.tsx`
- The findings in this report were accurate at the time of revalidation.

### Status After P0 Fixes (2026-01-29)

The following P0 fixes were implemented after revalidation:

- Tailwind dark selector now matches `.theme-dark` (so `dark:*` variants can work).
- `system` theme now resolves to OS `prefers-color-scheme` and applies `theme-dark` or `theme-light`.

Remaining high-priority work:

- Multiple competing sources of truth for colors (CSS vs TS token files) still needs a final decision and cleanup.

## Scope
This audit reviews the **global frontend settings** and any files that define or influence the **design system** (tokens, theming, typography, spacing, motion, layering) and compares them against the requirements implied by the design system template in:

- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

The goal is to identify gaps/inconsistencies and define a clear path to a single, maintainable design system.

---

## Global Files That Affect the Entire Design System (Must-Know)

1. **Global tokens + base styles + global utilities**
   - `src/app/globals.css`
   - Defines `:root.theme-dark|theme-light|theme-purple` CSS variables, base typography, reusable global classes (e.g., `.neu-btn`, `.theme-card`, sidebar classes), motion preferences, focus styles, and some animations.

2. **Tailwind wiring for semantic tokens**
   - `tailwind.config.js`
   - Maps Tailwind semantic color names (e.g., `bg-background`, `text-foreground`, `border-border`) to CSS variables like `--color-background`.
   - Pulls typography/spacing/shadows/borders/animations from `src/design-tokens/*`.

3. **Theme selection + persistence**
   - `src/components/ThemeProvider.tsx`
   - Persists theme in `localStorage` under key `solarmatch-theme`.
   - Applies theme via `document.documentElement.className = 'theme-…'`.

4. **App root layout (global providers + font)**
   - `src/app/layout.tsx`
   - Wraps the app with `NextAuthProvider`, `ThemeProvider`, `LayoutContent` and mounts `Toaster` (sonner).
   - Loads Inter font via `next/font/google`.

5. **Semantic token library (TypeScript)**
   - `src/design-tokens/index.ts` and subfolders (`semantic/*`, `primitives/*`, `themes/*`)
   - Used by Tailwind config for typography/spacing/shadows/borders/animations.
   - Contains additional color/theme concepts that are currently **not the real source of truth** for the live UI.

6. **Dependencies that affect UI primitives**
   - `package.json` (e.g., `tailwindcss`, `lucide-react`, `@heroicons/react`, `sonner`, `next/font`).

---

## Current Design System (What’s Actually Running)

### Theming model
- Themes are applied by class on `<html>`:
  - `theme-dark` (default)
  - `theme-light`
  - `theme-purple`
  - `theme-system` (exists as a value, but not implemented as an actual system-driven theme)

### Token model
- **Primary runtime tokens are CSS variables** in `src/app/globals.css` (e.g., `--color-background`, `--color-foreground`, `--shadow-outset-md`).
- Tailwind semantic classes are wired to those CSS variables in `tailwind.config.js`.

### Typography
- Inter is configured in two places:
  - `src/app/layout.tsx` via `next/font/google`
  - `src/app/globals.css` via multiple `@font-face` rules loading local `/public/fonts/inter/*`.

---

## Key Findings / Gaps (Compared to a “True” Design System)

### 1) Multiple competing “sources of truth” for colors
- `src/app/globals.css` defines a **white/black/purple** accent strategy.
- `src/design-tokens/semantic/colors.ts` defines an **orange accent** strategy (with comments about future switching).
- `src/design-tokens/themes/default-theme.ts` defines a **teal/amber** brand theme.

Impact:
- The codebase has **three different “design systems”** for brand color direction.
- Tailwind’s color tokens in `tailwind.config.js` are driven by **CSS variables**, not the TS color tokens, so the TS color definitions can easily drift and confuse future work.

Recommendation (priority: P0):
- Declare one source of truth for colors:
  - Either “CSS vars in globals.css” (recommended given current implementation), or
  - “TS tokens generate CSS vars” (more ambitious, but requires build/runtime strategy).

### 2) “System” theme is not implemented
- `ThemeProvider` supports `'system'` but applies `theme-system` class.
- There is no CSS variable set for `:root.theme-system` and no mapping to `prefers-color-scheme`.

Impact:
- Selecting system theme is currently undefined (likely wrong colors / missing tokens).

Recommendation (priority: P0):
- Implement system theme properly:
  - Either map system to dark/light at runtime using `matchMedia('(prefers-color-scheme: dark)')`, or
  - Replace `'system'` with `'dark'|'light'|'purple'` only, until system behavior exists.

### 3) Tailwind dark mode selector mismatch
- `tailwind.config.js` sets `darkMode: 'class'` (Tailwind default expects class `dark`).
- App uses `theme-dark` on `<html>`.

Impact:
- Any `dark:` variants in components will not activate.
- Even if currently avoided, this is a latent bug source.

Recommendation (priority: P0):
- Configure Tailwind dark mode selector to match the app’s theme class (or remove reliance on `dark:` entirely).

### 4) Font loading duplication
- Inter is loaded by both Next.js font optimization and local `@font-face`.

Impact:
- Potential double downloads, inconsistent font weights, and confusion about which font source is canonical.

Recommendation (priority: P1):
- Pick one:
  - Prefer `next/font` for optimization and consistency, OR
  - Prefer local font files if you need exact offline control.

### 5) Hardcoded colors and non-tokenized visual values in globals
- `src/app/globals.css` includes hardcoded hex colors and rgba values in places (e.g., animated gradients, box-shadow rgba values).

Impact:
- Violates “never hardcode values” rule from the design system.
- Makes theme consistency harder.

Recommendation (priority: P1):
- Move these values into CSS variables (tokenize them) or express them via Tailwind semantic utilities.

### 6) Spacing/radius standards are inconsistent between CSS variables and TS tokens
- `globals.css` uses radius vars: 8/12/16/20.
- `src/design-tokens/semantic/borders.ts` defines `sm: 4px`, `md: 8px`, etc.

Impact:
- Two “correct” answers for border radius.

Recommendation (priority: P1):
- Standardize on one set (prefer runtime CSS vars if that’s what the UI uses today).

### 7) Z-index is partially standardized
- CSS variables define dropdown→tooltip scale.
- Toast layer is not standardized (Sonner is used, but not tokenized in design tokens).

Recommendation (priority: P2):
- Add a toast z-index token (either CSS var or agreed constant) and align Sonner styling if needed.

---

## What Was Updated as Part of This Audit

- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`
  - Filled the placeholder fields with the **current real token values** and referenced the true global sources.

---

## Suggested Next Steps (Ordered)

P0 (must do before further UI work):
1. Decide the single source of truth for **colors** (CSS vars vs TS token generation) and remove/align the other(s).
2. Fix or remove `system` theme until it is fully supported.
3. Align Tailwind dark mode selector with `theme-dark` (or enforce “no dark: usage”).

P1 (stability + maintainability):
4. Deduplicate font loading (choose next/font OR local @font-face).
5. Tokenize the remaining hardcoded values in `globals.css`.
6. Standardize border radius + spacing between CSS vars and TS tokens.

P2 (polish + completeness):
7. Add a standardized toast z-index and any remaining layering conventions.

---

## Appendix: Theme Token Snapshot (CSS Variables)

From `src/app/globals.css`:

- Dark:
  - Background: `--color-background` = `18 18 18` (#121212)
  - Elevated: `--color-background-elevated` = `26 26 26` (#1A1A1A)
  - Foreground: `--color-foreground` = `243 244 246` (#F3F4F6)
  - Accent: `--color-accent` = `255 255 255` (#FFFFFF)

- Light:
  - Background: `--color-background` = `224 229 236` (#E0E5EC)
  - Elevated: `--color-background-elevated` = `232 237 244` (#E8EDF4)
  - Foreground: `--color-foreground` = `0 0 0` (#000000)
  - Accent: `--color-accent` = `0 0 0` (#000000)

- Purple:
  - Background: `--color-background` = `44 29 77` (#2C1D4D)
  - Elevated: `--color-background-elevated` = `62 41 108` (#3E296C)
  - Foreground: `--color-foreground` = `233 227 255` (#E9E3FF)
  - Accent: `--color-accent` = `167 139 250` (#A78BFA)
