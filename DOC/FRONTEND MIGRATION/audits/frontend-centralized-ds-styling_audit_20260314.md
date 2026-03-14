# Frontend Audit - Centralized DS Styling With Legacy Component Preservation

**Date**: 2026-03-14  
**Scope**: Current end-to-end frontend state for a DS-governed styling model  
**Target**: Keep `src/components` as the feature/logic layer, move visual authority to `src/ds`

---

## 1. Executive Summary

The application is **not** in a “legacy CSS vs DS CSS” split anymore. Global CSS is already centralized under `src/ds/styles/index.css`, and `src/app/layout.tsx` already boots the app through DS wrappers. The real remaining problem is different:

1. `src/ds` owns the global token pipeline.
2. `src/components` still owns many local visual decisions through inline Tailwind utility strings and undeclared semantic class names.
3. Some feature components are incorrectly importing feature-level UI from `@/ds`, which breaks the intended architecture and currently breaks Gate 0 typecheck.

The current frontend should be classified as:

**DS-bootstrapped, token-backed, but visually decentralized at the feature layer.**

That means the correct next step is **not** moving feature components into `src/ds`. The correct next step is to make `src/ds` the single authority for:

- theme tokens
- typography scale
- background/surface rules
- overlay/backdrop rules
- semantic card/form/toggle/result styles
- allowed visual variants

while preserving the current business flows and file ownership inside `src/components`.

---

## 2. Evidence Collected

### 2.1 Global style entry is already centralized

`src/app/layout.tsx` imports DS wrappers and the single global stylesheet entry:

- `src/ds/styles/index.css`
- `ThemeInitScript`
- `ThemeProvider`
- `NextAuthProvider`
- `AppChrome`

There is no active `src/app/globals.css` file in the app root. The active global CSS path is already DS-owned.

### 2.2 The token stack is already DS-backed

`src/ds/styles/index.css` composes the DS layers only:

- `ds.tokens.css`
- `ds.theme.css`
- `ds.base.css`
- `ds.utilities.css`
- `ds.components.css`

`tailwind.config.js` is also DS-driven. It maps semantic Tailwind tokens like `bg-background`, `bg-surface`, `text-foreground`, `border-border`, `shadow-card`, and radius/shadow/motion aliases back to DS CSS variables.

This means the repo already has the foundation for centralized styling.

### 2.3 Visual ownership is still distributed across TSX files

Although DS tokens exist, many feature components still encode their visual rules locally inside JSX class strings. Current examples include:

- hardcoded overlays such as `fixed inset-0 bg-black/50` and `bg-black/80`
- hardcoded gray/slate utilities such as `text-gray-700`, `bg-slate-200`, `hover:bg-gray-200`
- local card/result styling patterns repeated in quote, messaging, marketplace, admin, and installer surfaces

This is the core blocker to central control.

### 2.4 Legacy semantic class names are being used without DS ownership

The homepage quote flows still use semantic-looking class names such as:

- `toggle-switch`
- `toggle-knob`
- `detail-card`
- `cost-item-label`
- `performance-item-label`
- `info-section`
- `neu-card`
- `panel-surface`

These class names appear in feature files, but no matching class definitions were found in `src/ds/styles/*.css` or other workspace CSS sources. That means they are currently **not centrally governed visual contracts**.

This is a major architectural gap: the code reads as if these are semantic DS classes, but the DS stylesheet does not own them.

### 2.5 DS runtime still depends on legacy components for behavior-heavy chrome

`src/ds/runtime/web/AppChrome.tsx` dynamically imports behavior-heavy feature components such as:

- `InstallerEligibilityModal`
- `InstallerSignInModal`
- `InstallerSignupModal`
- `HomeownerSignupModal`
- `HomeownerSignInModal`
- `GuestBottomNavBar`
- `HomeownerBottomNavBar`
- `HomeownerMobileSidebarMenu`
- `NewQuoteRequestModal`
- `MessagingModal`

This is acceptable under the corrected target architecture. DS runtime may compose feature components, but DS should not claim ownership of their business UI implementation unless that is intentional.

### 2.6 Dormant DS visual-mode capability exists but is not active globally

`src/ds/runtime/app/PlatformPresetScript.tsx` can set:

- `data-platform`
- `data-density`
- `data-visual`

and DS CSS already responds to `data-visual="glass" | "neumorph" | "sleek"`.

However, this preset script is not currently wired into the app root. As a result, DS has a mechanism for central visual-mode control, but that mechanism is not active as a real site-wide contract.

### 2.7 Gate 0 is currently red

Current typecheck result:

- `src/components/homeowner/SimplifiedQuoteForm.tsx`
- `src/components/quote-builder/InstantQuoteResult.tsx`
- `src/components/QuoteOptionsModal.tsx`

All three failures come from feature components importing feature-level UI from `@/ds` that `src/ds/index.ts` does not export:

- `SavingsChart`
- `OTPVerificationModal`

This is not just a type issue. It is a sign that feature/UI ownership boundaries are currently blurred.

---

## 3. Current E2E State

## 3.1 What is already working

- DS tokens, themes, base styles, and utilities load globally.
- Public routes already render through DS layout/bootstrap.
- Many feature components already consume DS primitives like `Button`, `Input`, `Select`, `Modal`, `Pressable`, `Card`, and DS icons.
- The homepage logic remains in place inside `src/app/page.tsx` and related modal/form components.

## 3.2 What is not yet centralized

- overlay/backdrop styling
- semantic card/result panel styling
- toggle styling
- quote result breakdown styling
- placeholder/skeleton styling
- dashboard/admin utility variants
- mobile chrome visual patterns
- consistent theme-driven “visual mode” behavior across routes

## 3.3 What must not be done

To reach the user’s stated goal, the following should **not** be the primary strategy:

- moving all `src/components/*` files into `src/ds`
- re-architecting page composition just to make imports come from `@/ds`
- mixing logic rewrites into UI migration
- exporting behavior-heavy feature components from `src/ds/index.ts` just to satisfy current broken imports

Those actions would increase risk without improving central style control.

---

## 4. Root Causes

### Root Cause A: DS owns tokens, but not enough semantic presentation contracts

The DS currently provides primitives and tokens, but not enough shared semantic classes/components for repeated product patterns like:

- modal overlays
- result cards
- quote breakdown sections
- segmented/toggle visuals
- stat panels
- skeleton/loading states

Because DS does not own those patterns yet, feature files keep solving them locally.

### Root Cause B: Tailwind semantic tokens exist, but direct utility composition still dominates

The Tailwind config is token-aware, but components still build their visuals ad hoc in JSX instead of consuming a small DS-owned semantic vocabulary.

### Root Cause C: DS barrel boundaries are being used as a migration shortcut

Some files are importing `SavingsChart` and `OTPVerificationModal` from `@/ds`, even though these are still feature-layer components. This creates a false sense of DS ownership and currently breaks typecheck.

### Root Cause D: Verification is still too file-local

The existing migration discipline is strong on “replace hardcoded classes,” but the repo still needs a stronger rule that checks:

- page/component trees
- DS barrel misuse
- semantic class definitions actually existing in DS CSS
- theme/visual mode propagation from root to feature layer

---

## 5. Correct Target Architecture

## 5.1 Ownership model

### `src/ds` should own

- tokens
- theme classes
- font definitions
- background/surface rules
- radius/shadow/motion rules
- shared semantic CSS classes
- shared primitives
- shared presentational wrappers
- global visual-mode switches
- verification rules for allowed styling patterns

### `src/components` should own

- product workflows
- state machines
- API interactions
- route-specific business UI composition
- feature-only components such as calculators, modals, and dashboards

### `src/app` should own

- route orchestration
- composition of feature surfaces
- page-level data/bootstrap wiring

## 5.2 Definition of success

This migration is complete when:

1. `src/components` remains intact functionally.
2. Repeated visual patterns are routed through DS-owned tokens/semantic contracts instead of local hardcoded class decisions.
3. Theme and visual behavior can be changed centrally from `src/ds` with predictable site-wide effect.
4. Feature components stop pretending to be DS exports.
5. Gate 0 passes.

---

## 6. Priority Findings

### P0

1. Gate 0 typecheck is red because feature components import `SavingsChart` and `OTPVerificationModal` from `@/ds` even though DS does not export them.
2. The codebase uses semantic-looking class names that are not defined in DS CSS, so the visual contract is not actually centralized.

### P1

1. Overlay, card, toggle, result, and skeleton patterns are repeated across feature files instead of being DS-owned semantic patterns.
2. The DS has dormant visual-mode support (`data-visual`) but the app root does not activate it.

### P2

1. Existing audit automation focuses on hardcoded class detection but does not yet enforce DS barrel boundaries or semantic-contract ownership.

---

## 7. Recommended Direction

Use a **DS-governed hybrid model**:

1. Fix the DS-boundary errors first.
2. Define the missing semantic presentation layer in `src/ds/styles` and small DS wrappers where needed.
3. Migrate feature files in place, UI only, from local hardcoded visual decisions to DS-owned semantic contracts.
4. Activate one root-level visual authority path for theme + visual mode.
5. Extend verification so future work cannot drift back to local styling ownership.

This approach achieves central frontend control without destabilizing the current business flows.