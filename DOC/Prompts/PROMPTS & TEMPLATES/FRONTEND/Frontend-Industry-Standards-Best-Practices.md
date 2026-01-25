# Frontend Industry Standards & Best Practices

## Purpose
A universal reference for all frontend development, ensuring every UI/UX build is robust, accessible, maintainable, and follows industry best practices.

---

## 1. Accessibility (WCAG, ARIA)
- All interactive elements must be keyboard accessible.
- Use semantic HTML (buttons, links, headings, etc.).
- Provide alt text for images and aria-labels where needed.
- Ensure sufficient color contrast (WCAG AA minimum).
- Support screen readers and focus management.

## 2. Responsiveness
- Use a mobile-first approach.
- Support all major breakpoints (mobile, tablet, desktop).
- Layouts must adapt fluidly to screen size changes.

## 3. Componentization & Reusability
- Build atomic, reusable components.
- Avoid duplication—use shared components for repeated UI patterns.
- Follow clear naming conventions and folder structure.

## 4. State Management
- Use predictable, scalable state management (e.g., React hooks, context, Redux, etc.).
- Keep state local where possible; lift state only when needed.

## 5. Code Quality
- Enforce linting and formatting (e.g., ESLint, Prettier).
- Write clear, maintainable, and well-documented code.
- Use TypeScript for type safety.

## 6. Performance
- Optimize images and assets.
- Lazy-load components and data where appropriate.
- Minimize re-renders and bundle size.

## 7. Testing
- Write unit and integration tests for all critical components and flows.
- Use test IDs for reliable selectors.

## 8. Security
- Sanitize all user input.
- Avoid inline scripts and dangerous HTML.
- Follow best practices for authentication and authorization.

## 9. Design System Compliance
- Always use the current design system for all tokens, components, and styles.
- Never hardcode colors, fonts, or spacing—reference design tokens.

---

## Instructions
- These standards must be followed for every frontend build task.
- Do not override or ignore these rules unless explicitly approved.
- Reference this file in all build instructions and code reviews.
