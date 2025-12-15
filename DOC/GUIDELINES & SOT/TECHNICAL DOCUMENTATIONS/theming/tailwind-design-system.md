# Tailwind Design System

## What It Is
Tailwind configuration + utilities layering tokens, semantic classes, and variant generators for consistent UI composition.

## Why It Matters
Eliminates ad hoc styling, reduces cognitive overhead, and ensures maintainable scalability of appearance and modes.

## Configuration Principles
- Extend theme with token scales only (colors, spacing, fontSizes, shadows).
- Avoid inline arbitrary values unless prototyping (replace before merge).
- Use plugin hooks for semantic utilities (e.g., `bg-surface`, `text-inverted`).

## Suggested Tailwind Additions
```js
// tailwind.config.js (example snippet)
module.exports = {
  theme: {
    extend: {
      colors: { brand: { 500: 'var(--color-brand-500)' } },
      spacing: { 4: 'var(--space-4)' }
    }
  }
};
```

## Utility Strategy
- Compose semantic class sets (`class-variants` pattern) rather than embedding entire style objects.
- Use data attributes (`data-state="open"`) for stateful styling.

## Pitfalls / Anti-Patterns
- Over-reliance on arbitrary `[]` syntax for stable values.
- Repeating long class lists across multiple components.
- Hardcoded responsive values without referencing breakpoints.

## AI Guidance
Ask: "Simplify these class lists using semantic utilities; list mapping diff; ensure dark mode parity." Provide original lists.
