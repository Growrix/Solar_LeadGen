# Frontend System Audit Instruction (2026)

## Purpose
A comprehensive, step-by-step guide for auditing the entire current frontend system. This audit ensures a deep understanding of the actual design, structure, layout, color, theme, and component usage—so all future decisions are based on the real, live system.

---

## 1. Audit Preparation
- Ensure access to the full codebase and running application.
- Use visual inspection, code review, and available design tokens/theme files.

---

## 2. Audit Checklist

### A. Layout & Structure
- Map all main layouts (dashboard, landing, modals, etc.).
- Document page structure, navigation, and routing patterns.
- Identify all layout wrappers, containers, and grid/flex systems.

### B. Color & Theme System
- Extract all color tokens, variables, and theme definitions (light, dark, custom themes).
- List all primary, secondary, accent, and background colors.
- Check for hardcoded colors and document where they exist.
- Verify theme switching and multi-theme support.

### C. Typography
- List all font families, sizes, weights, and line heights.
- Map heading, body, and special text styles.

### D. Spacing & Sizing
- Document spacing scale (margins, paddings, gaps).
- Note breakpoints and responsive design rules.

### E. Components & UI Elements
- Inventory all reusable components (buttons, cards, forms, icons, etc.).
- For each, document props, variants, and states (hover, active, disabled).
- Note any custom or third-party components.

### F. Iconography & Imagery
- List all icon sets and image usage patterns.
- Document image optimization and responsive handling.

### G. Effects & Details
- Record border radii, shadows, transitions, and other visual effects.

### H. Accessibility
- Check color contrast, keyboard navigation, ARIA roles, and focus management.

### I. Documentation & Gaps
- Note any missing documentation or unclear areas.
- List all places where the implementation diverges from the intended design system.

---

## 3. Audit Output
- Prepare a detailed report (table or structured doc) covering all sections above.
- Include screenshots, code references, and examples where possible.
- Highlight inconsistencies, hardcoded values, and areas needing improvement.
- This audit becomes the single source of truth for the current frontend system.

_Last updated: January 22, 2026_
