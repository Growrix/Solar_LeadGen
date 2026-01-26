# Project Design System

## Purpose
A pro-level, modern, and scalable design system defining all visual and brand choices for the frontend. This file is the single source of truth for design tokens, component styles, usage guidelines, and mobile app-like design patterns.

---

## Source of Truth (Current Implementation)

These files define the global design system behavior and tokens used across the entire frontend:

- Global CSS variables, base styles, and reusable utility classes: `src/app/globals.css`
- Tailwind token wiring (semantic class names -> CSS variables): `tailwind.config.js`
- Theme application + persistence (adds `theme-dark|theme-light|theme-purple|theme-system` class to `<html>`): `src/components/ThemeProvider.tsx`
- App root layout (font + providers): `src/app/layout.tsx`
- Semantic TS tokens (typography/spacing/shadows/borders/animations used by Tailwind config): `src/design-tokens/*`

---

- **Colors:**
  - Primary (alias, maps to `--color-primary`):
    - Dark: #FFFFFF
    - Light: #000000
    - Purple: #A78BFA
  - Secondary (alias, maps to `--color-secondary`):
    - Dark: #1A1A1A
    - Light: #E8EDF4
    - Purple: #3E296C
  - Background (maps to `--color-background`):
    - Dark: #121212
    - Light: #E0E5EC
    - Purple: #2C1D4D
  - Surface / Elevated (maps to `--color-background-elevated`):
    - Dark: #1A1A1A
    - Light: #E8EDF4
    - Purple: #3E296C
  - Border (maps to `--color-border`):
    - Dark: #2C2C2C
    - Light: #9CA3AF
    - Purple: #4C3383
  - Accent (preferred for CTAs/focus, maps to `--color-accent`):
    - Dark: #FFFFFF
    - Light: #000000
    - Purple: #A78BFA
  - Error (maps to `--color-error`):
    - Dark: #F87171
    - Light: #DC2626
    - Purple: #F87171
  - Success (maps to `--color-success`):
    - Dark: #4ADE80
    - Light: #16A34A
    - Purple: #4ADE80
  - Warning (maps to `--color-warning`):
    - Dark: #FACC15
    - Light: #EAB308
    - Purple: #FACC15
  - Info (maps to `--color-info`):
    - Dark: #60A5FA
    - Light: #2563EB
    - Purple: #93C5FD
  - Text Primary (maps to `--color-foreground`):
    - Dark: #F3F4F6
    - Light: #000000
    - Purple: #E9E3FF
  - Text Secondary (maps to `--color-foreground-muted`):
    - Dark: #D1D5DB
    - Light: #374151
    - Purple: #CABEFF
- **Typography:**
  - Font Family:
    - Primary: Inter (loaded via Next.js `next/font/google` and also locally via `@font-face` in `globals.css`)
    - Fallback: system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif
    - Mono: Fira Code, Courier New, Consolas, Monaco, monospace
  - Font Sizes (semantic, see `src/design-tokens/semantic/typography.ts`):
    - Heading 1: 24 / 30 / 36 (mobile / md / lg)
    - Heading 2: 20 / 24 / 30
    - Heading 3: 18 / 20 / 24
    - Heading 4: 16 / 18 / 20
    - Body: 14 (mobile) → 16 (desktop)
    - Caption: 12
  - Font Weights: 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
  - Line Heights: 1 (none), 1.25 (tight), 1.375 (snug), 1.5 (normal), 1.625 (relaxed), 2 (loose)
- **Spacing:**
  - Unit: 4px base (0.25rem)
  - Scale (core, see `src/design-tokens/primitives/spacingScale.ts`): 0, 4, 8, 12, 16, 20, 24, 32, 48, 64 (and extended)
  - Global CSS spacing variables (used in some global CSS):
    - `--spacing-xs`: 4px, `--spacing-sm`: 8px, `--spacing-md`: 16px, `--spacing-lg`: 24px, `--spacing-xl`: 32px
- **Border Radius:**
  - Global CSS variables:
    - `--radius-sm`: 8px
    - `--radius-md`: 12px
    - `--radius-lg`: 16px
    - `--radius-xl`: 20px
    - `--radius-full`: 9999px
  - Tailwind semantic radii (wired from `src/design-tokens/semantic/borders.ts` in `tailwind.config.js`):
    - `rounded-card`: 12px, `rounded-button`: 8px, `rounded-input`: 8px, `rounded-modal`: 16px
- **Shadows:**
  - Neumorphic CSS shadow system (global, theme-aware):
    - `--shadow-outset-sm|md|lg|xl`
    - `--shadow-inset-sm|md|lg`
    - Legacy aliases: `--shadow-neu-outset*`, `--shadow-neu-inset*`
  - Tailwind semantic shadows (wired from `src/design-tokens/semantic/shadows.ts`):
    - `shadow-card`, `shadow-modal`, `shadow-dropdown`, `shadow-button`, `shadow-focus`
- **Motion:**
  - Transition:
    - Default: 250ms `cubic-bezier(0.4, 0, 0.2, 1)`
    - Fast: 150ms, Slow: 350ms
  - Easing:
    - `--ease-in-out`: cubic-bezier(0.4, 0, 0.2, 1)
    - `--ease-out`: cubic-bezier(0, 0, 0.2, 1)
- **Theme:**
  - Implemented themes: Dark, Light, Purple via `<html>` class `theme-dark|theme-light|theme-purple` in `src/components/ThemeProvider.tsx`
  - System theme: `theme-system` exists as a value in code, but is not currently mapped to `prefers-color-scheme` tokens

## 1a. Dark Mode Tokens
- **Colors (Dark):**
  - Background: #121212 (`--color-background`)
  - Surface / Elevated: #1A1A1A (`--color-background-elevated`)
  - Text Primary: #F3F4F6 (`--color-foreground`)
  - Text Secondary: #D1D5DB (`--color-foreground-muted`)
  - Card: use `.theme-card` or `bg-background-alt` (currently `--color-background-alt` is #1A1A1A)
  - Border: #2C2C2C (`--color-border`)
  - Update other tokens as needed for dark mode

## 1b. Animation & Motion
- **Motion:**
  - Use transitions for all interactive elements (buttons, modals, drawers, etc.)
  - Default: 0.2s cubic-bezier(0.4,0,0.2,1)
  - Use prefers-reduced-motion media query to disable non-essential animations for accessibility
  - Page transitions: fade/slide, 0.3s

## 1c. Z-Index & Layering
- **Z-Index Scale:**
  - Dropdown: 1000 (`--z-dropdown`)
  - Sticky: 1100 (`--z-sticky`)
  - Fixed: 1200 (`--z-fixed`)
  - Modal Backdrop: 1300 (`--z-modal-backdrop`)
  - Modal: 1400 (`--z-modal`)
  - Popover: 1500 (`--z-popover`)
  - Tooltip: 1600 (`--z-tooltip`)
  - Toast: (not standardized yet; Sonner is used via `Toaster` in `src/app/layout.tsx`)

## 1d. Iconography
- **Icon Set:** lucide-react (primary) and @heroicons/react (legacy/secondary)
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
- **Logo:** Use the header/sidebar logo as the canonical reference; keep logo color theme-aware via semantic tokens (`text-primary`, `text-foreground`, etc.)
- **Icons:** lucide-react preferred for consistency (24px / 2px stroke)
- **Imagery:** [Brand imagery guidelines]

---

## Usage Guidelines
- Always use tokens for colors, spacing, and typography—never hardcode values
- Reference this file for all component and layout decisions
- Always test layouts and forms at common laptop resolutions (e.g., 1366x768, 1440x900) to ensure comfortable sizing and spacing
- Update this file as the design evolves, but keep changes traceable

---

## Instructions
- Use this design system for all visual and brand choices in the frontend
- Never override industry standards or best practices
- Update and expand this file as your product grows
