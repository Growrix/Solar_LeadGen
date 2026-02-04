

# SolarMatch Design System SOT (Target v3)

> **IMPORTANT:** This file is the **only source of truth** for the SolarMatch (or your SaaS) frontend design system. The universal guideline (`Frontend-Design-System.md`) is for reference and examples only—**do not use its color codes or tokens as SOT**. All implementation and product decisions must be based on this file.

## Purpose
This document is the single source of truth for the *target* frontend design system, referencing but not dictated by the universal guidelines in:
`DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Frontend-Design-System.md`.

It defines the tokens, rules, and component standards that the codebase will be refactored to match.

---

## Source of Truth (Implementation References)

Current implementation sources (what exists today):
- `src/app/globals.css` (CSS variables for theme tokens + semantic component classes)
- `tailwind.config.js` (Tailwind mappings to CSS variables + TS token modules)
- `src/design-tokens/**` (typography, spacing, borders, shadows, animations)
- `src/components/ThemeProvider.tsx` (theme switching; writes `theme-*` classes on `<html>`)
- `src/components/ThemeSwitcher.tsx` (theme switch UI)
- `src/app/component-library/page.tsx` (component showcase / working examples)

Audit output:
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/AUDIT-OUTPUT-2026-02-01/Frontend-System-Gap-Audit-Report-2026-02-01.md`

---

## Design Tokens & Rules

### Colors

Token naming convention:
- `primary` = brand primary (links, highlights)
- `secondary` = brand secondary (secondary emphasis)
- `accent` = primary call-to-action emphasis (buttons, focus)
- `background`/`surface` = base layers
- `foreground-*` = text hierarchy

Current target (ONE THEME NOW): **SolarConnect Dark**

This repo is currently focused on shipping **one theme** that matches the Google AI Studio SolarConnect design. Additional themes can be added later without changing component code by extending CSS variables.

**Semantic tokens (used across the app)**
- `background`: `#151419`
- `surface` / elevated: `#1B1B1E`
- `border`: `#262626`
- `foreground` (body): `#9CA3AF`
- `foreground-secondary` (high emphasis): `#F3F4F6`
- `accent` (CTA + focus): `#6D3BE2`
- `accent-foreground`: `#230F4F`

**Optional scales (SolarConnect compatibility)**
To support SolarConnect-style utilities like `bg-brand-500/20` or `text-neutral-300` without hardcoding values, the system provides optional centralized scales:
- `brand-50..950` (purple scale)
- `neutral-50..950` (SolarConnect slate override)

These scales must be mapped to CSS variables (theme-driven) and are optional; most of the app should continue using semantic keys (`background`, `surface`, `accent`, etc.).

Rules:
- No hardcoded hex/rgb/rgba values in components.
- No `text-gray-*`, `bg-slate-*`, or `dark:` classes.
- Colors must be expressed via semantic Tailwind keys that map to CSS variables.

---

### Typography

Font family (universal-aligned):
- Primary: `Inter`
- Fallback stack: `Inter, Roboto, Arial, system-ui, -apple-system, "Segoe UI", sans-serif`
- Mono: `"Fira Code", Consolas, Monaco, "Courier New", monospace`

Universal size scale (token baseline):
- `0.75rem` (12px)
- `0.875rem` (14px)
- `1rem` (16px)
- `1.25rem` (20px)
- `1.5rem` (24px)
- `2rem` (32px)
- `2.5rem` (40px)

Semantic typography utilities (project standard):
- Headings: `text-heading-1` .. `text-heading-4`
- Body: `text-body`, `text-body-large`, `text-body-small`
- Meta: `text-caption`, `text-micro`, `text-label`

Responsiveness:
- Typography may be responsive via token definitions (e.g., clamp-based), but must not be applied ad-hoc via `sm:text-*` / `lg:text-*`.

Font weights:
- 400 (regular)
- 500 (medium)
- 700 (bold)

Line heights:
- 1.25 (tight)
- 1.5 (normal)
- 1.75 (relaxed)

Rules:
- Only use semantic typography utilities (e.g. `text-heading-1`, `text-body-small`).
- Do not apply breakpoint typography overrides (`sm:text-*`, `lg:text-*`). Responsiveness must live in the token definitions.

---

### Icons

Default icon system (UI):
- Use `lucide-react` for all general-purpose UI icons.
- Do not introduce new `@heroicons/react` imports.

Allowed exceptions:
- Brand/auth icons (e.g., Google/Apple) remain as custom SVG components under `src/components/icons/**`.

Size scale:
- `xs` = 14px
- `sm` = 16px
- `md` = 20px
- `lg` = 24px
- `xl` = 32px

Implementation standard:
- Prefer the canonical wrapper `src/components/ui/icon.tsx` to enforce consistent sizing/props.
- Icons should inherit current text color (`className="text-current"` when needed) and rely on theme tokens for color.

Rules:
- Avoid inline SVGs in feature/pages. Use Lucide via `Icon`, or (for brand/auth only) custom SVG components under `src/components/icons/**`.
- Icon-only buttons must have an `aria-label`.

### Spacing

Unit:
- `4px` base (`0.25rem`).

Scale:
- `0.25rem` (4px)
- `0.5rem` (8px)
- `1rem` (16px)
- `1.5rem` (24px)
- `2rem` (32px)
- `2.5rem` (40px)
- `3rem` (48px)

Semantic spacing tokens (implemented in TS):
- `card-padding`, `modal-padding`, `form-gap`, `section-margin`, `heading-margin`, `button-padding-x/y`, `input-padding`, `nav-padding`

Rules:
- No Tailwind arbitrary spacing values (`p-[...]`, `gap-[...]`, `w-[...]`) except with an explicitly documented exception.

---

### Sizing

Semantic sizing tokens (implemented via CSS variables in `src/app/globals.css` and surfaced through Tailwind):

- Hero minimum height: `min-h-hero` (backs onto `--size-hero-min-h`)
- Viewport minus header: `min-h-viewport-minus-header` (backs onto `--size-viewport-minus-header`)

Rules:
- Use semantic sizing utilities for repeated viewport/layout constraints; do not use `min-h-[...]` / `max-h-[...]` arbitrary values.

---

### Border Radius

Universal-aligned radii:
- Default: `0.25rem` (4px)
- Card/Modal: `0.5rem` (8px)
- Full: `9999px`

Rules:
- Components must use semantic radii (`rounded-card`, `rounded-modal`, etc.) mapped to these values.

---

### Shadows

Universal-aligned elevation:
- `shadow-sm`: `0 1px 3px rgba(0,0,0,0.08)`
- `shadow-md`: `0 4px 12px rgba(0,0,0,0.12)`

Rules:
- No arbitrary shadows (`shadow-[...]`).
- Shadows are semantic by elevation level (button/card/dropdown/modal).

Note:
- Neumorphic shadows may exist in the current implementation, but the **target v3** system aligns to the universal elevation model above.

---

### Motion

Default transition:
- `200ms cubic-bezier(0.4, 0, 0.2, 1)`

Rules:
- Prefer targeted transitions (`transition-colors`, `transition-shadow`, `transition-transform`, `transition-opacity`).
- Respect `prefers-reduced-motion`: disable non-essential animations.

---

### Z-Index & Layering

Universal-aligned scale:
- Modal: `1000`
- Drawer: `1100`
- Tooltip: `1200`
- Toast: `1300`
- Dropdown: `1050`

Rules:
- Prefer semantic z-index utilities mapped from tokens; avoid scattered `z-*` usage in components.

---

### Theme

Supported themes:
- Current shipping focus: `dark` only (SolarConnect Dark).
- `light` / additional themes may be added later via CSS variable overrides.

How theme switching works:
- The `ThemeProvider` applies one of `theme-dark`, `theme-light`, `theme-purple` to `<html>`.
- Theme preference is stored in localStorage key `solarmatch-theme`.
- Tailwind dark variant uses `.theme-dark` selector (see `tailwind.config.js`).

Rules:
- Do not toggle Tailwind’s `dark` class directly.
- Theme-aware colors must come from CSS variables.

---

## Tailwind & Utility Mapping

- Semantic color keys in Tailwind (`primary`, `secondary`, `accent`, `background`, `surface`, `border`, `foreground-*`) map to CSS variables (RGB triples).
- Typography utilities map to `src/design-tokens/semantic/typography.ts`.
- Spacing utilities include semantic responsive tokens generated via a Tailwind plugin (see `tailwind.config.js`).

Dark mode:
- `darkMode: ['class', '.theme-dark']`
- Use `theme-*` classes on `<html>`; avoid `dark:` usage.

---

## Component & Layout Guidelines

### Breakpoints & Grid (Universal)

Breakpoints:
- xs: 0–480px
- sm: 481–768px
- md: 769–1024px
- lg: 1025–1440px (optimize for 1366×768 and 1440×900)
- xl: 1441–1920px
- xxl: 1921px+

Grid:
- 12-column fluid grid
- Gutters: `0.5rem`, `1rem`, `1.5rem`

### Components

Button:
- Variants: primary, secondary, text/ghost, icon, fab
- States: default, hover, active, disabled, loading

Card:
- Use consistent padding + elevation + radius

Input:
- Label, helper text, error state, disabled state
- Use `aria-invalid` and `aria-describedby` for errors

Modal/Drawer:
- Desktop: centered
- Mobile: full-screen or bottom sheet
- Must have focus trap + ESC close

Alert/Toast:
- success/error/info/warning
- Mobile: bottom slide-in, swipe-to-dismiss where feasible

Navigation:
- Desktop: top bar / side nav as needed
- Mobile: bottom navigation for primary actions

### Layout & Responsiveness

Desktop:
- Use max-width containers and avoid sparse layouts at laptop resolutions.

Mobile app-like rules:
- Touch targets: minimum 44×44px (`2.75rem`)
- Prefer bottom nav and bottom sheets
- Avoid dense typography; use semantic scale

---

## Accessibility & UX

- WCAG 2.1 AA contrast in all themes
- Visible focus states for all interactive elements
- Keyboard navigation must work end-to-end
- Dialogs must trap focus and restore focus on close
- Reduced motion supported via `prefers-reduced-motion`

---

## Image & Media

- Use `next/image` for all product imagery.
- Responsive images: provide `sizes` and correct intrinsic `width`/`height`.
- Lazy load by default unless the image is LCP-critical.
- Prefer WebP/AVIF where possible.

---

## Forms & Validation

- States: default, focus, error, disabled, success.
- Accessibility: use `aria-invalid` and `aria-describedby` for errors.
- Touch targets: interactive controls should meet the 44×44px minimum where feasible.

---

## Internationalization (i18n)

- Plan for multiple languages, including RTL support.
- Ensure font stacks support required scripts.

---

## Testing & QA

- Test all themes (dark/light/purple), key breakpoints, and WCAG AA contrast.
- Verify keyboard navigation and focus management for dialogs/menus.

---

## Branding

- Logo: SolarMatch wordmark + sun icon (document exact assets and usage)
- Icons: Standardize on a single set (preferred: Lucide or Material Icons) and document size/stroke rules
- Imagery: Use `next/image`, responsive sizing, lazy load by default

---

## Usage Guidelines

- Always use semantic tokens for colors/typography/spacing; never hardcode values.
- Prefer `src/components/ui/**` for design-system components.
- Enforce with scripts:
  - `npm run ds:verify`
  - `npm run ds:audit`

---

## Instructions

- When adding UI:
  1) Choose the semantic component (Button/Card/Input/Modal) first.
  2) Use semantic classes and tokens only.
  3) Verify in all themes (dark/light/purple) and at key breakpoints.
- Keep this file updated as the system evolves; changes should be traceable.
