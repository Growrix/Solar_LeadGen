# Frontend Design System (Universal Guidelines)

## Purpose
A pro-level, modern, and scalable design system guideline for frontend projects. **This file is NOT the source of truth for any specific product or brand.**

---

- **Colors:**
  - Primary: _(example: #1976d2)_
  - Secondary: _(example: #ff9800)_
  - Background: _(example: #f5f5f5)_
  - Surface: _(example: #ffffff)_
  - Error: _(example: #d32f2f)_
  - Success: _(example: #388e3c)_
  - Warning: _(example: #ffa726)_
  - Info: _(example: #0288d1)_
  - Text Primary: _(example: #212121)_
  - Text Secondary: _(example: #757575)_
- **Typography:**
  - Font Family: 'Inter', 'Roboto', Arial, sans-serif
  - Font Sizes: 0.75rem, 0.875rem, 1rem, 1.25rem, 1.5rem, 2rem, 2.5rem
  - Font Weights: 400, 500, 700
  - Line Heights: 1.25, 1.5, 1.75
- **Spacing:**
  - Unit: 0.25rem (4px)
  - Scale: 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem, 2.5rem, 3rem
- **Border Radius:**
  - 0.25rem (default), 0.5rem (cards/modals)
- **Shadows:**
  - 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.12)
- **Motion:**
  - Transition: 0.2s cubic-bezier(0.4,0,0.2,1)
  - Easing: cubic-bezier(0.4,0,0.2,1)
- **Theme:**
  - Light and dark mode tokens (define overrides as needed)

## 1a. Dark Mode Tokens
- **Colors (Dark):**
  - Background: #181818
  - Surface: #232323
  - Text Primary: #f5f5f5
  - Text Secondary: #bdbdbd
  - Card: #232323
  - Border: #333
  - Update other tokens as needed for dark mode

## 1b. Animation & Motion
- **Motion:**
  - Use transitions for all interactive elements (buttons, modals, drawers, etc.)
  - Default: 0.2s cubic-bezier(0.4,0,0.2,1)
  - Use prefers-reduced-motion media query to disable non-essential animations for accessibility
  - Page transitions: fade/slide, 0.3s

## 1c. Z-Index & Layering
- **Z-Index Scale:**
  - Modal: 1000
  - Drawer: 1100
  - Tooltip: 1200
  - Toast: 1300
  - Dropdown: 1050

## 1d. Iconography
- **Icon Set:** Material Icons (or specify alternative)
- **Size:** 24x24px (default), 2px stroke
- **Color:** Use currentColor for fill/stroke
- **Usage:**
  - Use SVGs for custom icons
  - Maintain consistent style and alignment

## 1e. Image & Media
- **Aspect Ratios:** 16:9, 4:3, 1:1 (as needed)
- **Responsive Images:** Use srcset and sizes for responsive loading
- **Lazy Loading:** All images should use lazy loading by default
- **Optimization:** Compress images for web, use WebP where possible

## 1f. Form Elements & Validation
- **States:** default, focus, error, disabled, success
- **Validation Feedback:**
  - Inline (below field), toast, or modal as appropriate
  - Use color and icon cues for error/success
- **Accessibility:**
  - Use aria-invalid, aria-describedby for errors
  - Ensure all fields are keyboard accessible

## 1g. Internationalization (i18n)
- **Language Support:**
  - Plan for multiple languages, including RTL (right-to-left) support
- **Font Fallback:**
  - Ensure font stacks support all required scripts
- **Component Layout:**
  - Test all components for RTL and LTR

## 1h. Documentation & Examples
- For each component, provide code examples or Figma references (add links or sections as needed)

## 1i. Testing & QA
- All components and layouts must be tested for:
  - Accessibility (WCAG AA)
  - Responsiveness (all breakpoints, especially laptop)
  - Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
  - Keyboard navigation and screen reader support

## 2. Breakpoints & Grid
- **Breakpoints:**
  - xs: 0-480px (mobile small)
  - sm: 481-768px (mobile large)
  - md: 769-1024px (tablet)
  - lg: 1025-1440px (laptop/desktop, optimize for 1366–1440px)
    - Note: Always test and optimize layouts, forms, and cards for common laptop resolutions (e.g., 1366x768, 1440x900) to avoid oversized or sparse UI. Use max-widths for containers and forms at this breakpoint.
  - xl: 1441-1920px (large desktop)
  - xxl: 1921px+
- **Grid:**
  - 12-column, fluid grid
  - Gutters: 0.5rem, 1rem, 1.5rem

## 3. Components
- **Button:**
  - Variants: primary, secondary, text, icon, fab (floating action button)
  - States: default, hover, active, disabled, loading
  - Mobile: Large touch targets, bottom action bar support
- **Card:**
  - Responsive padding, elevation, border radius
  - Mobile: Compact, swipeable, stackable
- **Input:**
  - Label, helper text, error state, clear button
  - Mobile: Large tap area, auto-complete, numeric keypad for numbers
- **Modal/Drawer:**
  - Centered (desktop), full-screen or bottom sheet (mobile)
  - Focus trap, scrollable, swipe-to-close (mobile)
- **Alert/Toast:**
  - Success, error, info, warning
  - Mobile: Slide-in from bottom, dismissible by swipe
- **Navigation:**
  - Desktop: App bar, side nav, breadcrumbs, tabs
  - Mobile: Bottom navigation, hamburger menu, swipe gestures

## 4. Layout & Responsiveness
- **Desktop:**
  - Standard grid, sidebar, header/footer
- **Mobile App-Like Design Guidelines:**
  - Design mobile layouts as if for a native app, not just a scaled-down desktop
  - Use bottom navigation for primary actions
  - Floating action buttons for key actions
  - Cards: Compact, swipeable, stack vertically, avoid excessive padding
  - Touch targets: Minimum 44x44px (2.75rem)
  - Typography: Larger, higher contrast, avoid dense text blocks
  - Use sticky footers, pull-to-refresh, and mobile-specific gestures where appropriate
  - Modals: Use bottom sheets or full-screen overlays
  - Navigation: Hamburger menu or tab bar, avoid desktop-style sidebars
  - Feedback: Use toasts, banners, and subtle haptics (if supported)
  - Test all flows on real devices and emulators

## 5. Accessibility & UX
- Ensure all components have focus states and are keyboard accessible
- Use aria-labels and roles as needed
- Maintain color contrast (WCAG AA minimum)
- Support screen readers and dynamic font scaling

## 6. Branding
- **Logo:** [Add logo usage guidelines]
- **Icons:** [Preferred icon set]
- **Imagery:** [Brand imagery guidelines]

---


## Usage Guidelines
- This file provides universal design system guidelines and examples only.
- **Do not use the color codes or tokens here as the source of truth for any product.**
- For any specific product or SaaS, always refer to the SOT file: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`.
- Always use tokens for colors, spacing, and typography—never hardcode values.
- Reference this file for general component and layout decisions, but defer to your product's SOT for implementation.
- Always test layouts and forms at common laptop resolutions (e.g., 1366x768, 1440x900) to ensure comfortable sizing and spacing.
- Update this file as the design evolves, but keep changes traceable.

---

## Instructions
- Use this file as a universal reference for best practices and design patterns.
- **Do not treat this file as the implementation source of truth.**
- For the actual design system of your SaaS or product, use and maintain `Design-System.md` as the SOT.
- Never override industry standards or best practices.
- Update and expand this file as your product grows.
