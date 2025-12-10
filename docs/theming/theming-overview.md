# Theming Overview

## What It Is
Unified approach for styling via semantic design tokens and Tailwind configuration—eliminating hardcoded values while enabling adaptable visual identity.

## Why It Matters
Guarantees consistency, accessibility, and rapid support for brand or theme changes without mass refactors. Drives performance by avoiding over-specified CSS.

## Theme Layers
| Layer | Description | Examples |
|-------|-------------|----------|
| Primitive Tokens | Raw scales (color, spacing, typography) | `--color-brand-500`, `--space-4` |
| Semantic Tokens | Role-based mappings | `bg-surface`, `text-muted`, `border-accent` |
| Component Variants | Allowed configurations for UI primitives | `Button: primary | ghost | danger` |
| Mode Adjustments | Light/dark contrast adjustments | `surface-alt` changes background shade |

## Best Practices
- Depend on semantic tokens in components.
- Primitive tokens exposed only inside theme mapping layer.
- Keep variant names meaningful (avoid color names in variant keys).
- Provide mode-safe contrast; test WCAG ratio > required.
- Centralize token definitions; updates propagate automatically.

## Code Example (Semantic Mapping)
```css
:root { --color-brand-500: #2563eb; }
:root[data-theme="light"] { --bg-surface: #ffffff; }
:root[data-theme="dark"] { --bg-surface: #1e1e21; }
```

## Pitfalls / Anti-Patterns
- Direct hex usage in component class list.
- Variant explosion duplicating subtle style differences.
- Mixing primitive + semantic tokens arbitrarily.

## AI Guidance
Ask: "Refactor component X to use semantic tokens (list existing styles); produce diff mapping old classes → new tokens." Provide original class names.
