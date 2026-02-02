# SolarMatch Frontend System Gap Audit + Redesign (2026-02-02)

## Objective
Audit the **real, current** frontend implementation using the checklist in:
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Frontend-System-Audit-Instruction-2026.md`

…and compare it to the **universal guidelines** in:
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Frontend-Design-System.md`

Then propose a redesign that aligns SolarMatch’s system to the universal standard, and update the SOT:
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

---

## Sources Reviewed (Actual Implementation)

Core tokens + wiring:
- `src/app/globals.css` (theme token CSS vars, semantic utility classes, some component styles)
- `tailwind.config.js` (Tailwind mappings to CSS variables + TS token modules)
- `src/design-tokens/**` (typography, spacing, borders, shadows, animations, layout)

Theme mechanism:
- `src/components/ThemeProvider.tsx` (writes `theme-dark|light|purple` to `<html>`, persists `solarmatch-theme`)
- `src/components/ThemeSwitcher.tsx` (theme switch UI)

Representative UI components:
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/icon.tsx`

System examples / visual references:
- `src/app/component-library/page.tsx`
- Landing: `src/app/page.tsx`

Automated design-system enforcement:
- `npm run ds:verify` (strict)
- `npm run ds:audit` (broad/report-only)

---

## Screenshots

### Existing automation
Playwright screenshot automation already exists:
- `tests/e2e/frontend-design-system-audit-screenshots.spec.ts`

It captures:
- Pages: `/`, `/component-library`, `/theme-test`
- Themes: `dark`, `light`, `purple`
- Viewports: 320, 375, 768, 1024, 1440

Output folder:
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/AUDIT-OUTPUT-2026-02-01/screenshots/`

Representative files (examples):
- `dark__desktop-1440__component-library.png`
- `light__mobile-320__home.png`
- `purple__tablet-768__theme-test.png`

How to regenerate (local):
- `npx playwright test tests/e2e/frontend-design-system-audit-screenshots.spec.ts`

---

## Executive Summary

### What’s already strong
- The system has the **right architecture shape**: CSS variables for colors + Tailwind mapping + TS token modules.
- Multi-theme support exists via `theme-*` classes on `<html>`.
- The repo currently passes DS enforcement (`ds:verify` / `ds:audit` are green), meaning components are largely compliant with *“no arbitrary values / semantic tokens only”*.

### Biggest universal-standard gaps (high impact)
1) **Color model mismatch**: current CSS vars skew toward grayscale + accent-as-primary (and a neumorphic light theme), while the universal DS defines a Material-like palette (blue primary, orange secondary/accent, light background `#F5F5F5`).
2) **Typography scale mismatch**: the universal scale centers on 16px body and 32px H1; current semantic typography tokens are smaller (e.g., heading-1 starts at 24px).
3) **Radii + shadows mismatch**: universal calls for simple radii (4px/8px) and two shadow elevations; current tokens include heavier rounding and a neumorphic shadow system.
4) **Iconography inconsistency**: Lucide is adopted, but many icons are still inline SVGs and the ThemeSwitcher uses emojis.
5) **Accessibility + tap targets**: some controls (notably inputs) are below the universal 44×44 touch target recommendation.

---

## Gap / Fix Table (Key Items)

| Area | Universal Standard | Actual Implementation | Gap | Redesign / Fix | Priority |
| --- | --- | --- | --- | --- | --- |
| Colors | Primary blue `#1976D2`, Secondary/Accent orange `#FF9800`, Bg `#F5F5F5` | Tokens in `globals.css` implement grayscale/white accent; light theme uses neumorphic gray | Brand palette deviates | Re-tokenize CSS vars to universal palette; keep `theme-*` mechanism | P0 |
| Typography | Body 16px, H1 32px, consistent semantic scale | `src/design-tokens/semantic/typography.ts` uses smaller sizes (e.g., H1 24→36) | Scale mismatch | Update semantic typography tokens to universal sizes (and clamp strategy) | P0 |
| Radii | Default 4px, cards/modals 8px | `src/design-tokens/semantic/borders.ts` default 8px, card 12px, modal 16px | Too rounded | Align semantic radii to universal 4/8; keep `rounded-full` only where explicitly needed | P0 |
| Shadows | Two elevation levels | `globals.css` + Tailwind use neumorphic shadow variants + richer elevation set | Visual language mismatch | Adopt universal elevation shadows and map `shadow-card`, `shadow-modal` accordingly | P1 |
| Icons | Single system, consistent sizes | Mix of Lucide wrapper + many inline SVGs; ThemeSwitcher emojis | Inconsistent + harder theming | Migrate to `src/components/ui/icon.tsx` + Lucide; keep custom SVG only for brand/auth | P1 |
| Tap targets | ≥44×44px | Some inputs are `h-9` | Below spec | Tokenize control heights and raise default input/button min height | P1 |
| Z-index | Documented layering scale | `z-40`, `z-50` scattered | Not tokenized/documented | Introduce semantic z-index utilities + document in SOT | P2 |

---

# A. Layout & Structure

## A1. Actual Implementation
- Next.js App Router base layout: `src/app/layout.tsx` wraps `NextAuthProvider` → `ThemeProvider` → `LayoutContent`.
- Route-aware layout logic and modal orchestration: `src/components/LayoutContent.tsx`.
- Mobile app-like patterns exist via bottom nav components:
  - `src/components/GuestBottomNavBar.tsx`
  - `src/components/HomeownerBottomNavBar.tsx`
- Container sizing is a mix of `container ...` patterns and bespoke max-width wrappers (e.g. component library uses `max-w-7xl`).

## A2. Compare to Universal
Universal calls for:
- Explicit breakpoints + 12-column grid + documented container/gutter strategy.
- Mobile-first, app-like nav patterns (bottom nav, bottom sheets) and laptop breakpoint optimization.

## A3. Gaps / Deviations
- **Container system is not fully standardized** (multiple patterns exist and aren’t encoded as a “single way”).
- **Grid system is not explicit** (12-col is stated in docs, but not codified as a reusable pattern).

## A4. Redesign Proposal
- Standardize a small set of layout primitives:
  - `PageShell` (header + content + optional bottom nav)
  - `Container` (semantic max widths)
  - `Section` (semantic vertical rhythm)
- Document container max widths + gutters in the SOT and expose as Tailwind tokens.

---

# B. Color & Theme System

## B1. Actual Implementation
- Theme switching is class-based on `<html>` (good): `src/components/ThemeProvider.tsx`.
- Tailwind maps semantic colors to CSS variables: `tailwind.config.js`.
- Color tokens are predominantly **RGB triples in CSS vars**: `src/app/globals.css`.

## B2. Compare to Universal
Universal calls for:
- Primary/Secondary/Accent/Background/Surface/Text/Status palette.
- Light + dark token sets (and optional additional themes).

## B3. Gaps / Deviations
- **Palette mismatch** (primary/secondary/accent values do not match universal).
- **Neumorphic light theme diverges from universal baseline** (background is not `#F5F5F5`).
- **Mixed paradigms**: both “semantic RGB vars” and shadcn-like HSL tokens exist; documentation is unclear on which is authoritative.

## B4. Redesign Proposal
- Make universal palette the baseline token set:
  - `--color-primary` = `25 118 210` (brand blue)
  - `--color-secondary` / `--color-accent` = `255 152 0` (CTA orange)
  - `--color-background` = `245 245 245`
  - `--color-surface` = `255 255 255`
- Keep theme mechanism (`theme-*`) unchanged; re-map vars per theme.
- Clarify “single source of truth” in SOT: **CSS vars are the source**, Tailwind just consumes them.

---

# C. Typography

## C1. Actual Implementation
- Semantic typography tokens: `src/design-tokens/semantic/typography.ts`.
- Tailwind font sizes are driven by those tokens with a clamp helper: `tailwind.config.js`.

## C2. Compare to Universal
Universal calls for:
- Inter-based font stack.
- Sizes including 16px body, 32px H1, and the scale: 12/14/16/20/24/32/40.

## C3. Gaps / Deviations
- **Current semantic scale differs** (H1 starts at 24px, body at 14px mobile).
- **Micro size** is 10px in tokens, while universal suggests 12px minimum micro.

## C4. Redesign Proposal
- Move body default to 16px (mobile and desktop) unless there’s a strong reason.
- Set heading tokens so they map cleanly to universal sizes; preserve responsive clamp behavior.

---

# D. Spacing & Sizing

## D1. Actual Implementation
- Semantic spacing tokens exist and are wired into Tailwind: `src/design-tokens/semantic/spacing.ts` + Tailwind plugin in `tailwind.config.js`.
- Semantic sizing tokens exist for repeated viewport constraints: `src/design-tokens/semantic/layout.ts` (e.g. `min-h-hero`).

## D2. Compare to Universal
Universal calls for:
- 4px base unit and a small standard scale.
- Responsive rules and laptop breakpoint optimization.

## D3. Gaps / Deviations
- Spacing system is close to universal but **not fully documented as “the only way”** (some components still use ad-hoc Tailwind spacing).
- Touch target sizing is inconsistent in places.

## D4. Redesign Proposal
- Keep semantic spacing tokens and explicitly require them for repeated patterns.
- Add explicit semantic tokens for:
  - bottom nav height
  - input height
  - modal max width / height

---

# E. Components & UI Elements

## E1. Actual Implementation
- Core UI primitives exist: `src/components/ui/*`.
- There are also “neumorphic-*” components that encode a specific visual language.

## E2. Compare to Universal
Universal calls for:
- Button, card, input, modal/drawer, alerts/toasts, navigation patterns.
- Document variants/states.

## E3. Gaps / Deviations
- **Buttons**: exist, but variants map to neumorphic visuals and may not align with universal brand palette.
- **Inputs**: some are below touch-target guidance.
- **Dialogs**: good Radix base, but some values are not tokenized (z-index).

## E4. Redesign Proposal
- Treat `src/components/ui/*` as the authoritative DS layer.
- Ensure all DS primitives have documented variants + state styling (hover/active/disabled/loading).

---

# F. Iconography & Imagery

## F1. Actual Implementation
- Lucide is used in several places (e.g. component library) and an `Icon` wrapper exists: `src/components/ui/icon.tsx`.
- Many areas still use inline SVGs (e.g. `src/app/page.tsx`, `src/components/*NavBar.tsx`).

## F2. Compare to Universal
Universal calls for:
- A single icon system (Material icons *or* a specified alternative) and consistent sizing.

## F3. Gaps / Deviations
- **Mixed icon sources** increase maintenance and can break theming.
- `ThemeSwitcher` uses emojis and contains a corrupted purple glyph.

## F4. Redesign Proposal
- Standardize on Lucide + `Icon` wrapper for all general UI icons.
- Restrict custom SVGs to brand/auth only, stored under `src/components/icons/**`.

---

# G. Effects & Details (Radii, Shadows, Motion)

## G1. Actual Implementation
- Radii tokens are larger than universal: `src/design-tokens/semantic/borders.ts`.
- Neumorphic shadows are heavily used and tokenized via CSS vars in `globals.css`.
- Transition timing/duration tokens exist but do not strictly match universal 200ms baseline.

## G2. Compare to Universal
Universal calls for:
- Simple radii (4/8) and two elevation shadows.
- 200ms easing baseline.

## G3. Gaps / Deviations
- Visual language is “neumorphic” rather than “standard elevation”.

## G4. Redesign Proposal
- Decide explicitly: either adopt universal elevation (recommended for alignment), or document neumorphism as a deliberate brand deviation.
- If aligning: map `shadow-card` and `shadow-md` to universal values and deprecate neumorphic shadows.

---

# H. Accessibility

## H1. Actual Implementation
- Radix Dialog provides focus management hooks; inputs/buttons use focus rings.

## H2. Compare to Universal
Universal calls for:
- WCAG AA contrast across themes, keyboard navigation, ARIA and focus management.

## H3. Gaps / Deviations
- Potential tap target issues (inputs/buttons) vs 44×44 guidance.
- Some inline SVGs lack explicit accessibility handling.

## H4. Redesign Proposal
- Enforce minimum control sizes.
- Require `aria-label` for icon-only buttons and ensure icons are `aria-hidden` where appropriate.

---

# I. Documentation & Gaps

## I1. Actual Implementation
- SOT exists and is actively maintained: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`.

## I2. Gaps / Deviations
- SOT describes a universal-aligned target, but the implemented tokens are still partially neumorphic / grayscale.

## I3. Redesign Proposal
- Treat the SOT as **the target** and schedule implementation work in batches:
  1) Color retokenization (CSS vars)
  2) Typography scale alignment
  3) Radii/shadows alignment
  4) Icon consolidation
  5) Tap targets and accessibility polish

---

## Next Steps (Refactor Roadmap)

1) **P0: Retokenize colors** in `src/app/globals.css` to match universal palette for all themes.
2) **P0: Update typography tokens** in `src/design-tokens/semantic/typography.ts` to match universal sizes.
3) **P0: Update border radius tokens** to universal 4/8 values.
4) **P1: Replace emojis/inline SVG icons** with Lucide + `Icon` wrapper.
5) **P1: Raise minimum input/button heights** to satisfy 44×44 targets.

