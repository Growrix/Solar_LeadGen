# DS ↔ Prototype (SOT) Audit

## Scope
Prototype source of truth: `DOC/FRONTEND MIGRATION/solarconnect (3)`.
This audit focuses on the public homepage chrome + hero typography/colors.

## Prototype SOT (what we must match)
From `components/ui/Typography.tsx` + `components/layout/Header.tsx` + `components/home/Hero.tsx`:

- **Hero title (H1)**: `text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white` + `leading-none`
  - Sizes: 36px → 48px (≥768px) → 60px (≥1024px)
  - Letter-spacing: `tracking-tight` = -0.025em
  - Weight: `font-extrabold` = 800

- **Hero subtitle**: `text-xl leading-relaxed font-medium ... opacity-90`
  - Size: 20px
  - Line-height: `leading-relaxed` = 1.625
  - Weight: 500

- **Header logo wordmark**: `text-xl font-bold text-white tracking-tight`
  - Size: 20px
  - Weight: 700
  - Letter-spacing: -0.025em

- **Header nav links**: `text-sm uppercase tracking-wide font-medium`
  - Size: 14px
  - Letter-spacing: `tracking-wide` = 0.025em
  - Color: `text-slate-300` (#cbd5e1)
  - Hover: `hover:text-brand-400`

## Root causes found in production DS
1. **`rem` media queries drift from prototype `px` breakpoints**
   - The DS used `@media (min-width: 64rem)` / `48rem` / `40rem`.
   - If a user’s root font-size differs from 16px (browser accessibility settings), those `rem` breakpoints no longer align to Tailwind’s fixed `768px/1024px`.
   - Result: the hero title can remain at the smaller breakpoint size even at “desktop” widths.

2. **Global platform preset system is not part of the prototype**
   - `PlatformPresetScript` (previously injected in `src/app/layout.tsx`) can set `html[data-platform]`, `html[data-density]`, `html[data-visual]` using a `rem`-based matchMedia query.
   - Even though intended for mobile-only, this is extra global behavior that the prototype does not have.

3. **Token mismatches vs Tailwind typography**
   - DS `--ds-letter-spacing-tight/loose` did not match Tailwind’s `tracking-tight/wide`.
   - Public header nav used heavier weight than prototype.

## Fixes applied
- **Tokens updated** (prototype-aligned):
  - `--ds-letter-spacing-tight = -0.025em`
  - `--ds-letter-spacing-loose = 0.025em`
  - Added `--ds-font-weight-extrabold = 800`
  - Header brand size set to fixed 20px via `--ds-font-size-header-brand = 1.25rem`

- **Hero CSS now uses px breakpoints** (640/768/1024) in `src/ds/styles/ds.components.css`.

- **Removed remaining hardcoded hero/header lengths**
  - Replaced fixed `rem` values (spacing / slide heights) with DS tokens (e.g. `--ds-space-*`, `--ds-size-hero-slide-h-sm`).

- **Removed prototype-incompatible global behavior**:
  - Removed `<PlatformPresetScript />` injection from `src/app/layout.tsx`.

- **Overlay header colors aligned to prototype intent**:
  - Nav + Login text use `text-slate-300` equivalent (`--ds-color-hero-muted-rgb`).
  - Primary CTA uses `--ds-color-hero-accent` (purple) instead of a black pill.

- **Build determinism**
  - Updated `scripts/clean-next-build-artifacts.js` to fully remove `.next` before building to avoid intermittent `PageNotFoundError`.

## Next checks
- Compare homepage at 1440px width vs prototype screenshot:
  - Hero title hits 60px at ≥1024px.
  - Header logo is 20px, bold, tracking-tight, white.
  - Header nav is 14px, tracking-wide, slate-300 tint.
