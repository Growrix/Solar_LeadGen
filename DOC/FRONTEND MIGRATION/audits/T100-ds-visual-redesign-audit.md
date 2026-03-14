# T100 DS Visual Redesign Audit

Date: 2026-03-12

## Objective

Redesign the Blueprint DS to support a richer, warmer, more editorial product look based on the provided screenshot direction, while temporarily operating with one active theme only.

## DS Findings

### 1. Theme system is still dark-first

Current DS defaults are anchored in a dark baseline:

- `src/ds/styles/ds.tokens.css` root tokens default to dark neutrals and purple brand accents
- `src/ds/foundation/themes/registry.ts` exposes three active themes: dark, light, purple
- `ThemeInitScript` and `readStoredTheme()` accept any of those themes at runtime

Impact:

- The visual center of gravity remains dark/purple even when individual components are moved onto DS primitives
- Components designed to feel premium in a light system still inherit muted/dark assumptions

### 2. Visual language is too low-contrast and under-shaped for the desired direction

The shared DS classes for modal, button, input, and search are structurally correct but visually conservative:

- `ui-modal__panel` has limited hierarchy and atmosphere
- `ui-button` variants read as functional, not product-defining
- `ui-input` and `ui-search` lack enough frame, inset definition, and field presence
- `ui-auth-*` styles are too sparse for a strong sign-in/sign-up experience

Impact:

- Modals feel plain and flat
- CTAs do not read strongly enough as actions
- Form fields can visually disappear into the modal surface

### 3. Top bar auth surfaces are good probes for DS quality

Affected feature surfaces:

- `src/components/TopBar.tsx`
- `src/components/InstallerEligibilityModal.tsx`
- `src/components/InstallerSignInModal.tsx`
- `src/components/InstallerSignupModal.tsx`

Why this scope is useful:

- It includes lightweight chrome, modal shell, action buttons, icon buttons, divider patterns, social auth buttons, and search-style form fields
- It exposes whether DS tokens and DS component classes are visually strong enough without local hardcoding

### 4. Single-theme requirement should be implemented as active-theme reduction, not architecture deletion

The repo still needs future multi-theme support, so the right move is:

- Keep theme selectors and theme infrastructure in place
- Reduce active runtime theme availability to one theme now
- Make that one active theme the new warm-light baseline

This avoids deleting the DS theme architecture while still enforcing a single visual direction now.

## Screenshot Direction Interpreted as DS Requirements

The shared screenshot implies the following DS traits:

- Warm light background instead of stark white or dark charcoal
- Product-orange accent system with stronger button identity
- Soft editorial paper surfaces with visible framing
- Subtle grid/print/spec-sheet influence rather than generic SaaS flatness
- Inputs with clear field boundaries and inset depth
- Cards/modals with stronger layering and intentional shadow structure

## Implementation Direction

### Theme

- Make the warm-light theme the default and only active runtime theme
- Keep dark/purple theme selectors as dormant future infrastructure

### Tokens

- Rebuild color tokens around warm paper backgrounds, ink text, orange accent, softer borders, and richer shadows
- Add token support for stronger modal and field elevation

### Components

- Strengthen `ui-modal__panel`, `ui-button`, `ui-input`, `ui-search`, and `ui-auth-*`
- Preserve DS ownership of all visual design decisions

### Feature surfaces

- Keep top bar installer auth flow logic untouched
- Let the redesigned DS classes do the design work

## Non-Goals

- No routing changes
- No auth flow changes
- No validation changes
- No API changes
- No feature-level hardcoded redesign values