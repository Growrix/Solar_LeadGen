# SolarMatch Semantic Classes Registry

This file is the quick reference for the semantic classes and token-driven utilities used across the app.

**Goal**: make it easy to migrate UI without guessing, and prevent hardcoded colors/typography/arbitrary values.

## Sources of truth

- Token definitions + theme variables: `src/app/globals.css`
- Tailwind token wiring: `tailwind.config.js`
- Working examples: `src/app/component-library/page.tsx`
- Target v3 SOT: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

## Rules

- Use semantic tokens/utilities (e.g. `bg-background`, `text-foreground`, `border-border`).
- Prefer semantic component classes for complex patterns (cards, forms, tables).
- Do not use hardcoded colors (`#...`, `rgb(...)`, `rgba(...)`) in components.
- Do not use `dark:` classes; theme is controlled by `ThemeProvider` (`theme-*` on `<html>`).

---

## Token-Driven Utility Classes (Tailwind)

### Backgrounds / Surfaces

- `bg-background`
- `bg-background-alt`
- `bg-surface`
- `bg-surface-hover`
- `bg-muted` / `bg-muted/…` (if present in the Tailwind mapping)

### Text

- `text-foreground`
- `text-foreground-secondary`
- `text-muted-foreground`
- `text-subtle`

### Borders

- `border-border`

### Brand / Status

(Exact availability depends on Tailwind mapping; prefer these semantic keys when present)

- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-accent`, `bg-accent-hover`, `text-accent`
- `text-destructive`

---

## Typography Utilities (Semantic)

Use the semantic typography utilities wired in Tailwind (avoid `text-sm`, `text-lg`, `font-bold`, etc.):

- `text-heading-1`
- `text-heading-2`
- `text-heading-3`
- `text-heading-4`
- `text-body`
- `text-body-small`
- `text-caption`
- `text-label`

---

## Semantic Component Classes (globals.css)

These are referenced and demonstrated in the Component Library page.

### Containers

- `.theme-card` — modal/dialog container (strong elevation)
- `.detail-card` — content/info card
- `.neu-card` — neumorphic card variant
- `.info-section` — section wrapper

### Form elements

- `.form-input` — text inputs
- `.form-select` — select dropdowns (only where a caret is correct)
- `.toggle-switch` — toggle buttons
- `.slider-track` — range slider track

### Data display

- `.cost-item` — key/value row for financial data
- `.metric-card` — KPI metric tiles
- `.spec-card` — specification cards
- `.rebate-item` — rebate rows

---

## Notes

- If you add/rename a semantic class in `src/app/globals.css`, update this registry and the `Component Library` page.
- If you’re unsure which class to use, start from `src/app/component-library/page.tsx` and the target SOT.
