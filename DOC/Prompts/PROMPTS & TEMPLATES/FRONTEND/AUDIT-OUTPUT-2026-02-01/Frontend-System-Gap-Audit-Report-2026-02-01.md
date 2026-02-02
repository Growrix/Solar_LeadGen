# SolarMatch Frontend System Gap Audit + Redesign (2026-02-01)

## Scope & References

- Audit checklist: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Frontend-System-Audit-Instruction-2026.md`
- Universal guidelines: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Frontend-Design-System.md`
- SOT template to fill: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

## Sources of Truth (Actual Implementation)

Core:
- `src/app/globals.css` (theme tokens + semantic classes; very large)
- `tailwind.config.js` (Tailwind mappings to CSS variables + TS token modules)
- `src/design-tokens/**` (typography, spacing, borders, shadows, animations)
- `src/components/ThemeProvider.tsx` (theme switching; sets `theme-*` on `<html>`)
- `src/components/ThemeSwitcher.tsx` (UI for theme switching)

System examples / visual references:
- `src/app/component-library/page.tsx` (SOT-ish UI showcase)
- `src/app/theme-test/page.tsx` (theme test page; currently uses different theme mechanism)

Automated audit:
- `npm run ds:audit` (ran 2026-02-01): 281 violations found across `src/**/*.{ts,tsx}` (arbitrary values, manual responsive typography, `transition-all`, etc.)

Screenshots captured (automated via Playwright):
- Folder: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/AUDIT-OUTPUT-2026-02-01/screenshots/`
- Pages: `/`, `/component-library`, `/theme-test`
- Themes: `dark`, `light`, `purple`
- Viewports: 320, 375, 768, 1024, 1440

Key evidence (line-level anchors for fast review):
- Theme token blocks:
  - Dark tokens: `src/app/globals.css` (around lines 53–190)
  - Light tokens: `src/app/globals.css` (around lines 192–309)
  - Purple tokens: `src/app/globals.css` (around lines 310–420)
- Hardcoded theme-card hex + transform:
  - `src/app/globals.css` (around lines 24–33)
- Component-layer hardcoded values (hex/rgba/data-URL SVG, `transition: all`):
  - `src/app/globals.css` (around lines 700–780)
- Theme switching mechanism:
  - `src/components/ThemeProvider.tsx`
- Theme switcher UI + corrupted purple icon glyph:
  - `src/components/ThemeSwitcher.tsx`
- Tailwind token wiring + dark selector:
  - `tailwind.config.js`
- Duplicate buttons:
  - `src/components/Button.tsx` and `src/components/ui/button.tsx`

Representative screenshots (examples):
- `screenshots/dark__desktop-1440__component-library.png`
- `screenshots/light__mobile-320__home.png`
- `screenshots/purple__tablet-768__home.png`

---

## Executive Summary

The codebase already has the *structure* of a design system (central CSS variables + Tailwind mapping + TS token modules + semantic utility classes), but it is not aligned with the universal standard because:

1) **Brand color model differs**: current default uses a grayscale + white accent system, while universal guidelines define a Material-like palette with blue/orange primary/secondary.
2) **Theme mechanism is inconsistent**: the app uses `theme-dark/theme-light/theme-purple`, but `src/app/theme-test/page.tsx` toggles the `dark` class.
3) **Tokenization is incomplete**: many layout/sizing values are still hardcoded via Tailwind arbitrary values (e.g. `max-h-[90vh]`, `z-[1400]`, `text-[10px]`, `shadow-[...]`).
4) **System definition is fragmented**: globals define some tokens (RGB triples), shadcn-like tokens (HSL) coexist, and several values remain hardcoded (hex, rgba, data-URL SVG stroke).
5) **Component standardization is incomplete**: duplicated button implementations exist (`src/components/Button.tsx` vs `src/components/ui/button.tsx`) and icon usage is mixed (Lucide + Heroicons + inline SVG).

---

# A. Layout & Structure

## A1. Actual Implementation

- Next.js App Router with global layout: `src/app/layout.tsx`.
  - Wraps: `NextAuthProvider` → `ThemeProvider` → `LayoutContent`.
- Global layout controller: `src/components/LayoutContent.tsx`
  - Implements route-aware layout behavior (guest vs homeowner vs installer vs admin).
  - Uses dynamic imports for multiple modals + bottom nav bars.
- Containers:
  - Repeated usage of Tailwind container pattern: `container mx-auto px-4 sm:px-6 lg:px-8` in `src/components/TopBar.tsx` and `src/components/HeaderMenu.tsx`.
  - Many pages use `max-w-7xl mx-auto px-6` (e.g. `src/app/component-library/page.tsx`).
- Mobile app-like navigation exists via bottom nav components:
  - `src/components/GuestBottomNavBar.tsx`
  - `src/components/HomeownerBottomNavBar.tsx`
  - `src/components/InstallerBottomNavBar.tsx`

## A2. Universal Standard

- Map all main layouts (dashboard, landing, modals), document wrappers/containers, define 12-col grid + breakpoints.

## A3. Gaps / Deviations

- **Breakpoints do not match universal spec**: Tailwind uses defaults (sm=640, md=768, lg=1024, xl=1280, 2xl=1536) but the universal guidelines specify xs/sm/md/lg/xl/xxl with explicit ranges (0–480, 481–768, etc.).
- **No explicit grid/container system** documented or encoded as tokens:
  - Containers are ad-hoc (`container` vs `max-w-7xl`) rather than a documented and tokenized layout system.
- **Arbitrary sizing values** are common for layout constraints (from `npm run ds:audit`).

## A4. Redesign Proposal

- Define and document a single container strategy:
  - `container` for general pages.
  - A `content-max` token (e.g. 72rem) for editorial / blog.
- Add Tailwind `screens` to match universal breakpoints (xs/sm/md/lg/xl/xxl) and update the component guidelines accordingly.
- Create semantic sizing tokens for repeated constraints:
  - `modal-max-h`, `modal-max-w`, `bottom-nav-height`, `badge-size`, etc. to eliminate `max-h-[90vh]`, `z-[1400]`, `text-[10px]`.

---

# B. Color & Theme System

## B1. Actual Implementation

- Theme classes are applied to `<html>`:
  - `src/components/ThemeProvider.tsx`: adds/removes `theme-dark`, `theme-light`, `theme-purple` (localStorage key `solarmatch-theme`).
- Tailwind dark-mode selector is tied to `.theme-dark`:
  - `tailwind.config.js`: `darkMode: ['class', '.theme-dark']`.
- Core color tokens are CSS variables in `src/app/globals.css`:
  - Dark theme tokens: begins at ~line 53.
  - Light theme tokens: begins at ~line 192.
  - Purple theme tokens: begins at ~line 310.
- Mixed token formats:
  - Most semantic tokens are `rgb(var(--token) / <alpha-value>)` driven.
  - Some shadcn/ui compatibility tokens use HSL (`--destructive`, etc.).
- Hardcoded colors still exist:
  - `:root.theme-dark .theme-card { background: #121212; }` (hardcoded hex) near the top of `globals.css`.
  - Component layer contains hardcoded hex and rgba (e.g. `:root.theme-light .theme-card { background: #e0e5ec; }` and `border-bottom: 1px solid rgba(...)`).
  - `.form-select` uses a hardcoded SVG data URL with white stroke (`%23FFFFFF`) in `globals.css` around the component layer.
- Theme test page uses a different theme mechanism:
  - `src/app/theme-test/page.tsx` toggles `document.documentElement.classList.toggle('dark')`, which is not the same as `theme-dark`.

## B2. Universal Standard

- Provide primary/secondary/accent/background/surface/status + text hierarchy.
- Provide light and dark tokens.
- No hardcoded colors anywhere.

## B3. Gaps / Deviations

- **Universal palette mismatch**: current system uses grayscale + white/black accents (and purple accent), but universal defines:
  - Primary: #1976d2
  - Secondary: #ff9800
  - Background: #f5f5f5
  - Surface: #ffffff
  - Text Primary: #212121, Text Secondary: #757575
  - Status colors (error/success/warn/info)
- **Multiple sources of truth**:
  - RGB variables, HSL variables, plus hardcoded hex/rgba in the same file.
- **Theme switching inconsistency** (ThemeProvider vs theme-test).
- **Token semantics are confusing**:
  - `--color-accent` is “white only” in dark theme, while `--color-primary` is a legacy alias to the same.

## B4. Redesign Proposal

- Adopt the universal palette as the brand baseline, and re-map the existing semantic Tailwind color keys (`primary`, `secondary`, `accent`, `background`, `surface`, `border`, `foreground...`) to it.
- Eliminate hardcoded hex/rgba/data-URI stroke colors; replace with CSS variables:
  - e.g. `--color-select-arrow` per theme, used to generate the select caret.
- Standardize on one variable format:
  - Prefer **RGB triples** for all color tokens (to keep Tailwind `rgb(var(--x) / <alpha>)` simple) and keep only the minimum shadcn HSL variables needed.
- Make `src/app/theme-test/page.tsx` use ThemeProvider’s mechanism or explicitly document it as legacy.

---

# C. Typography

## C1. Actual Implementation

- Typography tokens are defined in TS and wired into Tailwind:
  - `src/design-tokens/semantic/typography.ts`
  - `tailwind.config.js` maps them into `fontSize` (e.g. `text-heading-1`, `text-body-small`, etc.).
- Font family is Inter via Next font loader: `src/app/layout.tsx`.
- Violations exist where components still force breakpoint typography:
  - `npm run ds:audit` flags many cases like `sm:text-heading-1`, `lg:text-heading-1`, etc.

## C2. Universal Standard

- Single font stack, defined semantic sizes, weights, line heights.

## C3. Gaps / Deviations

- **Manual responsive typography utilities** contradict the token model.
- Universal typography sizes are specified in rem values; the current system is pixel-based (which is acceptable but should be documented and consistent).

## C4. Redesign Proposal

- Treat `text-heading-*`, `text-body-*`, `text-caption`, `text-label`, `text-button` as the only allowed typography utilities.
- Remove manual responsive overrides and push responsiveness into token definitions only.
- Update the SOT to explicitly document the mapping from universal rem scale to the chosen px scale.

---

# D. Spacing & Sizing

## D1. Actual Implementation

- Spacing tokens exist in both CSS variables and TS tokens:
  - `globals.css` defines `--spacing-*` (comment says 8px base but values include 4px increments).
  - `src/design-tokens/semantic/spacing.ts` defines semantic spacing + responsive spacing objects.
  - Tailwind plugin in `tailwind.config.js` auto-creates `.p-card-padding`, `.m-section-margin`, etc. for responsive spacing objects.
- Many hardcoded size constraints remain:
  - `max-h-[90vh]`, `max-w-[98vw]`, `w-[70%]`, `min-w-[160px]`, etc. (see `npm run ds:audit`).

## D2. Universal Standard

- 4px base spacing scale, responsive breakpoints, avoid one-off values.

## D3. Gaps / Deviations

- **Base-scale messaging inconsistency** (comment says 8px, actual tokens include 4px).
- **Arbitrary values are used in many places**, indicating sizing tokens are missing.

## D4. Redesign Proposal

- Define a “layout sizing” token set:
  - `modal.maxH`, `modal.maxW`, `sheet.maxH`, `bottomNav.height`, `badge.size`, `table.minColW`, etc.
- Ban `[*]` arbitrary sizing outside of a documented exception list.

---

# E. Components & UI Elements

## E1. Actual Implementation

- UI components exist in `src/components/ui/**` (shadcn-inspired, using semantic Tailwind tokens).
- There is also a second Button implementation in `src/components/Button.tsx` (duplicated patterns).
- A “Component Library” page exists and documents semantic classes + patterns:
  - `src/app/component-library/page.tsx`.
- Many modal/dialog components exist in `src/components/**`.

## E2. Universal Standard

- Define variants + states for Button/Card/Input/Modal/Toast/Nav.

## E3. Gaps / Deviations

- **Duplicate component sources** (two button implementations).
- **Modal standards are inconsistent**:
  - `src/components/auth/AuthModal.tsx` implements focus trap + aria-labelledby/aria-describedby.
  - Many other dialogs use `role="dialog"` + `aria-modal="true"` but may not implement focus management consistently.
- **Z-index usage is inconsistent**:
  - CSS defines a z-scale (`--z-modal` etc.) in `globals.css`, but components still use `z-[1400]` (flagged by audit).

## E4. Redesign Proposal

- Standardize on `src/components/ui/*` as the only design-system component layer.
- Deprecate `src/components/Button.tsx` (or wrap it around the canonical UI button).
- Create a base `Modal`/`Dialog` component that all modals extend, matching `AuthModal` accessibility behavior.

---

# F. Iconography & Imagery

## F1. Actual Implementation

- Icons are mixed:
  - `lucide-react` used heavily in `src/app/component-library/page.tsx`.
  - `@heroicons/react` used in installer pages (see grep hits in installer marketplace/leads pages).
  - Inline SVG icons appear in headers/top bars/nav bars.
- Images generally use `next/image` (blog, profile, messaging, dashboard header).

## F2. Universal Standard

- Prefer a single icon system; default 24x24, 2px stroke, currentColor.
- Responsive, optimized images with lazy-loading.

## F3. Gaps / Deviations

- **Multiple icon sets** reduce consistency.
- Several inline SVGs use hardcoded `strokeWidth` values (including 2.5 on Plus icon) and ad-hoc sizes.

## F4. Redesign Proposal

- Pick one icon set (recommend: Lucide OR Material Icons) and document it.
- Provide semantic icon sizing utilities (already present: icon-xs..icon-xl in `tailwind.config.js`), and enforce usage.

---

# G. Effects & Details (Radii, Shadows, Motion)

## G1. Actual Implementation

- Global shadows are heavily neumorphic (`--shadow-outset-*`, `--shadow-inset-*`) in `globals.css`.
- TS token shadows exist in `src/design-tokens/semantic/shadows.ts`, but Tailwind also maps neumorphic CSS variable shadows (`shadow-neu-*`).
- Motion tokens exist in both CSS variables and TS tokens, but `transition: all ...` still appears in component-layer CSS.

## G2. Universal Standard

- Simple elevation shadows (subtle), consistent border radius, 0.2s cubic-bezier motion, prefers-reduced-motion.

## G3. Gaps / Deviations

- **Neumorphism diverges from universal shadow system**.
- **Arbitrary shadow usage exists** (e.g. `shadow-[0_-2px_10px_rgba(0,0,0,0.1)]` in bottom nav bars).
- **`transition-all` appears** (flagged by audit), which is discouraged.

## G4. Redesign Proposal

- Either:
  1) Adopt universal drop-shadow elevation system and phase out neumorphism, OR
  2) Treat neumorphism as a defined “brand style”, and rewrite the universal shadow section to match.
- In either case: define semantic shadow tokens only (card/modal/dropdown/button/focus) and prohibit arbitrary shadows.

---

# H. Accessibility

## H1. Actual Implementation

- `AuthModal` provides focus trap, ESC close, aria-labelledby/aria-describedby.
- Some dialogs use `role="dialog"` and `aria-modal="true"`.
- Buttons commonly include focus rings (e.g. `focus:ring-2 focus:ring-accent`).

## H2. Universal Standard

- WCAG AA contrast, keyboard navigation, ARIA roles, focus management.

## H3. Gaps / Deviations

- **Modal focus management is not guaranteed consistent** across all modal implementations.
- **Reduced motion** policy is not clearly enforced at the design-system layer.
- ThemeSwitcher uses emoji icons and includes a corrupted character for purple (`'�️'`).

## H4. Redesign Proposal

- Consolidate dialogs onto a single accessible modal implementation.
- Add `prefers-reduced-motion` handling at the design-system layer.
- Replace emoji icons in ThemeSwitcher with consistent SVG icons.

---

# I. Documentation & Gaps

## I1. Actual Implementation

- The repo has a detailed implementation SOT in:
  - `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md`
- `src/app/component-library/page.tsx` references `SEMANTIC-CLASSES-REGISTRY.md`, but that file is not present in `DOC/` (gap).

## I2. Universal Standard

- Documentation should be the single source of truth and match implementation.

## I3. Gaps / Deviations

- **SOT template in prompts is not filled** (this task).
- **Registry file referenced but missing**.
- **Universal doc and implementation doc are out of sync**.

## I4. Redesign Proposal

- Fill `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md` as the “future target SOT” for the redesign.
- Create (or re-add) `DOC/SEMANTIC-CLASSES-REGISTRY.md` and keep it generated/maintained.

---

## Gap / Fix Table (Consolidated)

| ID | Area | Gap | Evidence (file) | Fix / Redesign |
|---:|------|-----|-----------------|----------------|
| 1 | Breakpoints | Tailwind breakpoints don’t match universal xs..xxl | `tailwind.config.js` | Add custom `screens` + update docs |
| 2 | Theme switching | `theme-test` toggles `dark` class (wrong mechanism) | `src/app/theme-test/page.tsx` | Update to use ThemeProvider or remove legacy page |
| 3 | Colors | Brand palette doesn’t match universal (#1976d2/#ff9800) | `src/app/globals.css` | Redefine primary/secondary/accent tokens per universal |
| 4 | Colors | Hardcoded hex/rgba in globals | `src/app/globals.css` | Replace with CSS variables, remove literals |
| 5 | Forms | Hardcoded select caret color in data URL | `src/app/globals.css` (`.form-select`) | Use variable-driven caret or SVG mask technique |
| 6 | Typography | Manual responsive typography utilities | `npm run ds:audit` output | Remove `sm:/md:/lg:` typography overrides |
| 7 | Sizing | Widespread arbitrary values (`max-h-[90vh]`, `z-[1400]`, etc.) | `npm run ds:audit` output | Add semantic sizing + z-index tokens/utilities |
| 8 | Components | Duplicate button implementations | `src/components/Button.tsx`, `src/components/ui/button.tsx` | Standardize on one button component |
| 9 | Icons | Multiple icon sets + inline SVG | various | Standardize icon set + size rules |
| 10 | A11y | Modal focus management inconsistent outside AuthModal | various modal components | Provide base Dialog component w/ focus trap |
| 11 | Docs | Missing `DOC/SEMANTIC-CLASSES-REGISTRY.md` referenced by component library | `src/app/component-library/page.tsx` | Create/restore registry and maintain it |

---

## Next Implementation Steps (After this Audit)

1) Finalize palette decision: adopt universal palette as-is vs adapt it to SolarMatch brand.
2) Implement token changes (globals + Tailwind mapping) behind a “design system v3” toggle if needed.
3) Fix the top 20 audit violations by creating the missing semantic sizing and z-index tokens.
4) Standardize modal/dialog behavior by refactoring modals onto a shared base.
5) Remove duplication (Button) and standardize iconography.
