# DS-Driven Pixel-Perfect UI Guideline

## Purpose
Strict instructions for AI or human developers: Use prototypes as visual references only—not as source code—when building a design system (DS) that enables pixel-perfect site implementation.

---

## 1. Prototype as Reference Only
- Treat the prototype (Figma, code, screenshots) as a visual and structural guide.
- Never copy prototype code, inline styles, or ad-hoc classes into the DS or app.

## 2. DS-First Component Construction
- Rebuild every UI block (section, card, button, nav, etc.) using DS components and utilities.
- If a DS component is missing a required visual detail, extend the DS (add tokens, classes, or variants) instead of patching in the app.

## 3. Token-Driven Styling
- All colors, spacing, typography, radii, and shadows must use DS tokens/variables.
- Do not hardcode values in app code or DS components—add/adjust tokens as needed for pixel accuracy.

## 4. Utility-First and Reusable Patterns
- If a visual pattern is needed in multiple places, create a DS utility class or variant.
- Avoid one-off or page-specific styles; all styling must be reusable and documented in the DS.

## 5. No App-Level Custom CSS
- Do not write custom CSS in the app or feature folders.
- All styling and overrides must be implemented inside the DS layer.

## 6. Iterative Visual Matching
- After each DS update, compare the rendered UI side-by-side with the prototype.
- Adjust DS tokens/utilities until the match is pixel-perfect.

## 7. Documentation and Naming
- Document all new tokens, utilities, and variants in the DS.
- Use clear, semantic names that describe the purpose, not the location or one-off use.

## 8. Review and Refactor
- Regularly review DS for duplicate or overly specific utilities.
- Refactor for generality and reusability as the system grows.

---

## Summary
- Prototypes are for reference, not for code reuse.
- All UI must be built from DS components, tokens, and utilities.
- Extend the DS as needed for pixel-perfect fidelity—never patch in the app.
- Maintain strict separation: DS = styling logic, App = composition only.

> Follow these rules strictly to ensure scalable, maintainable, and pixel-perfect UI development.
