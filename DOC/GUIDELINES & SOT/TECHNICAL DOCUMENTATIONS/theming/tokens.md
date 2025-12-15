# Tokens

## What It Is
Foundational design values abstracted from implementation specifics enabling consistent theming across all components.

## Why It Matters
Single source of truth ensuring rapid visual changes, accessibility compliance, and easier multi-brand support.

## Token Categories
| Category | Prefix | Example | Notes |
|----------|--------|---------|-------|
| Color (Primitive) | `--color-*` | `--color-brand-500` | Raw palette values |
| Color (Semantic) | `--bg-*`, `--text-*` | `--bg-surface` | Role-based mappings |
| Typography | `--font-*`, `--text-size-*` | `--text-size-sm` | Scales referencing base size |
| Spacing | `--space-*` | `--space-4` | Rem or px via scale |
| Radius | `--radius-*` | `--radius-md` | Component corner styling |
| Elevation | `--shadow-*` | `--shadow-sm` | Layer depth/drops |
| Transition | `--ease-*`, `--dur-*` | `--dur-fast` | Motion guidelines |
| Breakpoint | `--bp-*` | `--bp-md` | Reference for responsive logic |

## Token Lifecycle
1. Propose addition (rationale + contrast/a11y note).
2. Review for redundancy.
3. Add primitive → map to semantic if needed.
4. Update docs & usage examples.
5. Validate in visual & accessibility tests.

## Example Definition
```css
:root { --color-brand-500: #2563eb; --space-4: 1rem; --radius-md: 0.5rem; }
:root[data-theme="dark"] { --bg-surface: #1e1e21; --text-primary: #ffffff; }
```

## Usage Principles
- Components reference semantic tokens only (`var(--bg-surface)`).
- Animation durations standardized (fast/normal/slow sets).
- Avoid direct numeric spacing values; use spacing tokens.

## Pitfalls / Anti-Patterns
- Adding tokens for one-off experimental colors.
- Overlapping semantics (`--bg-panel` vs `--bg-surface-alt`).
- Hardcoding responsive values in components instead of referencing breakpoints.

## AI Guidance
Ask: "Introduce new emphasis background token; show primitive + semantic mapping + sample component diff." Provide existing token list.
