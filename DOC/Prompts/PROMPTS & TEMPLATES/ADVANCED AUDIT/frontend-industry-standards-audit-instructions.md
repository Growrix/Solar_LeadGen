# Frontend Industry Standards Audit Instructions

**Purpose:**
A comprehensive checklist and workflow for auditing your frontend system against industry standards for theming, typography, layout, accessibility, and component usage. Use this to ensure your UI is modern, accessible, and maintainable.

---

## 1. Audit Preparation
- Ensure access to the full codebase and running application.
- Gather any design tokens, theme files, and component documentation.

---

## 2. Audit Checklist

### A. Typography & Heading Hierarchy
- [ ] All heading levels (H1–H6) are present, used semantically, and follow a logical hierarchy.
- [ ] Font families, sizes, weights, and line heights are consistent and documented.
- [ ] Body text, links, code, and special text styles are defined and accessible.
- [ ] No hardcoded font values—use tokens or classes.

### B. Layout & Structure
- [ ] Grid/flex systems are used for main layouts.
- [ ] Spacing scale (margins, paddings, gaps) is consistent and documented.
- [ ] Responsive breakpoints cover all device sizes.
- [ ] Containers, wrappers, and gutters are used consistently.

### C. Color & Theme
- [ ] All colors use semantic tokens/variables.
- [ ] Primary, secondary, accent, and background colors are defined and documented.
- [ ] Color contrast meets WCAG 2.1 AA standards.
- [ ] Theme switching (light/dark/custom) is supported if required.

### D. Components & UI Elements
- [ ] All reusable components (buttons, cards, forms, icons, etc.) are inventoried and documented.
- [ ] Each component has clear props, variants, and states (hover, active, disabled).
- [ ] No hardcoded styles—use design system classes/tokens.
- [ ] Custom/third-party components are documented and reviewed for consistency.

### E. Accessibility
- [ ] All interactive elements are keyboard accessible.
- [ ] ARIA roles and labels are used where needed.
- [ ] Focus management and visible focus indicators are present.
- [ ] All images/icons have alt text or appropriate labels.
- [ ] Color contrast and font sizes meet accessibility standards.

### F. Documentation & Gaps
- [ ] All tokens, classes, and components have clear usage documentation.
- [ ] Any missing documentation or unclear areas are listed.
- [ ] All places where the implementation diverges from the intended design system are noted.

---

## 3. Audit Output
- Prepare a detailed report (table or structured doc) covering all checklist sections above.
- Include screenshots, code references, and examples where possible.
- Highlight inconsistencies, hardcoded values, and areas needing improvement.
- This audit becomes the single source of truth for the current frontend system’s compliance with industry standards.

---

**References:**
- [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Material Design](https://m3.material.io/)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Typography best practices](https://css-tricks.com/snippets/css/complete-guide-to-css-fonts/)
- [Accessible color tools](https://webaim.org/resources/contrastchecker/)

_Last updated: January 24, 2026_