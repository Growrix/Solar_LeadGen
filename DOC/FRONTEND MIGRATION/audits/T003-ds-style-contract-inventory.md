# T003 — DS Style Contract Inventory

**Date**: 2026-03-14  
**Source**: `src/ds/styles/` and `tailwind.config.js`

---

## 1. CSS Layer Architecture

```
@layer ds.tokens    → src/ds/styles/ds.tokens.css
@layer ds.theme     → src/ds/styles/ds.theme.css
@layer ds.base      → src/ds/styles/ds.base.css
@layer ds.utilities → src/ds/styles/ds.utilities.css
@layer ds.components → src/ds/styles/ds.components.css
```

Entry point: `src/ds/styles/index.css` (imported once in `src/app/layout.tsx`)

---

## 2. Token Inventory (`ds.tokens.css`)

### Typography
- Scale: `--ds-font-size-1` (10px) to `--ds-font-size-7` (32px)
- Weights: regular(400), book(450), medium(500), demibold(550), semibold(600), bold(700)
- Line heights: tight(1.2), section(1.28), meta(1.4), normal(1.5), relaxed(1.75)

### Spacing
- `--ds-space-1` (4px) through `--ds-space-9` (48px)
- Semantic: `--ds-space-card-padding`, `--ds-space-modal-padding`, `--ds-space-form-gap`

### Radii
- `--ds-radius-default` (14px), `--ds-radius-card` (22px), `--ds-radius-modal` (24px), `--ds-radius-full`

### Shadows
- `--ds-shadow-sm`, `--ds-shadow-md`

### Z-index
- `--ds-z-sticky`, `--ds-z-dropdown`, `--ds-z-modal`, `--ds-z-toast`

### Colors (theme-aware, per theme layer)
- Background: `--ds-color-bg`, `--ds-color-surface`, `--ds-color-surface-2`
- Text: `--ds-color-text`, `--ds-color-fg`, `--ds-color-fg-muted`
- Accent: `--ds-color-accent`, `--ds-color-accent-hover`
- Status: `--ds-color-success`, `--ds-color-warning`, `--ds-color-danger`, `--ds-color-info`
- Border: `--ds-color-border`

---

## 3. Theme Layer (`ds.theme.css`)

Supports three themes via HTML class:
- `.theme-dark` — dark color-scheme
- `.theme-light` — light color-scheme (default)
- `.theme-purple` — dark color-scheme with purple accent

---

## 4. Utility Contracts (`ds.utilities.css`)

| Class | Purpose |
|---|---|
| `.ui-page` | Full page flex column layout |
| `.ui-band` | Full-width section band |
| `.ui-band--surface` | Surface-colored band with border |
| `.ui-sticky-top` / `.ui-sticky-bottom` | Sticky positioning |
| `.ui-container` | Centered max-width container |
| `.ui-header-pad` | Section header vertical padding |
| `.ui-mobile-scroll` | Touch-optimized scroll container |
| `.ui-safe-area` | Mobile safe-area padding helper |

---

## 5. Component Contracts (`ds.components.css`)

| Class | Purpose |
|---|---|
| `.ui-icon` | Icon sizing/coloring |
| `.ui-navlink` | Navigation link styling |
| `.ui-range` | Range slider container |
| `.ui-table` | Data table container |
| `.ui-table__*` | Table sub-elements |

---

## 6. Tailwind Semantic Aliases (`tailwind.config.js`)

| Alias | Resolves to |
|---|---|
| `bg-background` | `--ds-color-background-rgb` |
| `bg-surface` | `--ds-color-surface-rgb` |
| `text-foreground` | `--ds-color-foreground-rgb` |
| `text-foreground-secondary` | `--ds-color-foreground-secondary-rgb` |
| `text-foreground-muted` | `--ds-color-text-muted` |
| `border-border` | `--ds-color-border-rgb` |
| `bg-primary` | `--ds-color-accent-rgb` |
| `text-primary` | `--ds-color-accent-rgb` |
| `shadow-card` | `--ds-shadow-sm` |
| `shadow-modal` | `--ds-shadow-md` |
| `rounded-card` | `--ds-radius-card` |
| `rounded-button` | `--ds-radius-full` |

---

## 7. Gaps Identified (to be addressed in T007)

The following semantic classes are **used in feature components but not defined** in any DS style layer:

| Class | Used In |
|---|---|
| `toggle-switch` | `SimplifiedQuoteForm.tsx`, `InstantQuoteForm.tsx` |
| `toggle-knob` | `SimplifiedQuoteForm.tsx`, `InstantQuoteForm.tsx` |
| `toggle-switch-sm/md/on/off` | `SimplifiedQuoteForm.tsx` |
| `toggle-knob-sm/md/on/off` | `SimplifiedQuoteForm.tsx` |
| `detail-card` | `SavingsChart.tsx` |
| `detail-card-header` | `SavingsChart.tsx` |
| `cost-item-label` | `SavingsChart.tsx` |
| `performance-item-label` | `SavingsChart.tsx` |
| `info-section` | `SimplifiedQuoteForm.tsx`, `LeadPreviewModal.tsx` |

**Action**: All 9 class families must be defined as DS-owned semantic contracts in T007.
