# SolarConnect (AI Studio) vs SolarMatch Design System — Gap Audit (2026-02-02)

## Goal
Replicate the **SolarConnect** look-and-feel in the SolarMatch codebase with **minimal, centralized/global changes**, focusing on **one theme only** (new “SolarConnect Dark” theme now; additional themes later).

## Sources Reviewed
### SolarConnect prototype (reference implementation)
- `DOC/solarconnect/index.html` (Tailwind CDN config that defines **brand** + **slate** palettes)
- `DOC/solarconnect/App.tsx`
- `DOC/solarconnect/pages/ComponentLibrary.tsx`
- UI primitives:
  - `DOC/solarconnect/components/ui/Button.tsx`
  - `DOC/solarconnect/components/ui/Card.tsx`
  - `DOC/solarconnect/components/ui/Badge.tsx`
  - `DOC/solarconnect/components/ui/Input.tsx`
  - `DOC/solarconnect/components/ui/Typography.tsx`
- Key composition:
  - `DOC/solarconnect/components/layout/Header.tsx`
  - `DOC/solarconnect/components/home/Hero.tsx`
  - `DOC/solarconnect/components/home/QuoteOptionCard.tsx`

### SolarMatch (current system / SOT + implementation)
- SOT: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`
- Runtime tokens: `src/app/globals.css`
- Tailwind mappings: `tailwind.config.js`
- Semantic token modules (non-color):
  - `src/design-tokens/semantic/typography.ts`
  - `src/design-tokens/semantic/spacing.ts`
  - `src/design-tokens/semantic/shadows.ts`
  - `src/design-tokens/semantic/borders.ts`
  - `src/design-tokens/semantic/layout.ts`
- Theme mechanism: `src/components/ThemeProvider.tsx`

---

## 1) SolarConnect “New Design System” — What it actually is
SolarConnect is a **dark-first** system with:

### 1.1 Palette
**Brand (purple) scale** (from `DOC/solarconnect/index.html`):
- `brand-500`: `#6d3be2` (primary)
- `brand-950`: `#230f4f` (used as “on-brand” foreground)
- Full scale: `brand 50..950`

**Neutral (slate) scale** (custom slate override in the same file):
- `slate-900`: `#151419` (app background)
- `slate-800`: `#1B1B1E` (cards)
- `slate-700`: `#262626` (borders / dividers)
- `slate-100`: `#f3f4f6` (high contrast text)
- `slate-300`: `#d1d5db` (labels)
- `slate-400`: `#9ca3af` (default body)

### 1.2 Typography patterns
Defined in component code via Tailwind classes (not tokens):
- Heading 1: `text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white`
- Heading 2: `text-3xl md:text-4xl font-bold tracking-tight text-white`
- Body text:
  - Default: `text-slate-400 text-base`
  - Muted: `text-slate-500`
  - White: `text-slate-100`
  - Brand: `text-brand-400`

### 1.3 Shape & elevation
- Rounded: heavy use of `rounded-lg` (8px), `rounded-xl` (12px), `rounded-full`
- Shadows: conventional Tailwind shadows + **colored brand glow**
  - e.g. `shadow-lg shadow-brand-500/20`, `hover:shadow-brand-500/40`, `shadow-black/10`

### 1.4 “Glass” surfaces
Common pattern:
- `bg-slate-800/90 backdrop-blur-md border border-white/10` (or `border-white/5`)

### 1.5 Focus + ring offset
Common pattern:
- `focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-slate-900`

---

## 2) Current SolarMatch System — What’s centralized today
SolarMatch is already centralized around:
- **CSS variables** (runtime truth) in `src/app/globals.css`
- Semantic Tailwind color keys mapped to those variables in `tailwind.config.js`
- Semantic typography/spacing/shadows/radius tokens in `src/design-tokens/**`
- A theme switch mechanism (`theme-dark|theme-light|theme-purple`) via `ThemeProvider`

So the key question is not “can it be centralized?”, but **whether SolarConnect’s primitives can be represented by SolarMatch’s existing semantic tokens**.

---

## 3) Gap Analysis (SolarConnect → SolarMatch)

### 3.1 Colors: brand scale + neutral scale vs semantic keys
**SolarConnect uses scales** (`brand-50..950`, `slate-50..950`).

**SolarMatch uses semantic keys** (`background`, `surface`, `border`, `foreground-*`, `accent`, `success|warning|error|info`).

**Gaps / mismatches**
- Missing **brand scale** as first-class token set (useful for glow, subtle fills: `brand-500/10`, `brand-500/20`, etc.).
- Missing **neutral scale** as first-class token set (SolarConnect relies heavily on slate shades).
- Current dark theme accent is **white**, but SolarConnect’s accent is **purple**.

**Minimal global strategy**
- Keep SolarMatch semantic keys (so existing class usage stays stable).
- Update theme-dark CSS variables to match SolarConnect palette.
- Add OPTIONAL centralized “scales” (brand + neutral) as extra Tailwind keys for future SolarConnect page migration, without breaking the semantic system.

### 3.2 Typography: SolarConnect is much larger
SolarConnect headings are significantly larger than SolarMatch’s current semantic typography scale.

**Gaps / mismatches**
- SolarMatch `heading-1` currently clamps around ~24–36px, while SolarConnect expects ~36–60px.
- SolarConnect uses per-breakpoint typography (`md:text-*`, `lg:text-*`), while SolarMatch prefers responsive clamp tokens.

**Minimal global strategy**
- Adjust SolarMatch semantic typography tokens in `src/design-tokens/semantic/typography.ts` to match SolarConnect’s intended scale (using the existing clamp generator already in `tailwind.config.js`).
- No component-by-component typography edits needed if existing components already use semantic `text-heading-*`.

### 3.3 Shadows: colored brand glow vs neumorphism
SolarConnect uses conventional elevation + colored glow.
SolarMatch’s dark theme currently includes neumorphic shadow variables (and Tailwind `shadow-neu-*`).

**Gaps / mismatches**
- No centralized “brand glow” shadow tokens.
- Neumorphic shadows produce a different look than SolarConnect’s crisp elevation.

**Minimal global strategy**
- Keep semantic shadows (`shadow-card`, `shadow-modal`, etc.) but tune their values to match SolarConnect.
- Add 1–2 new semantic shadows (e.g. `shadow-brand-glow-sm`, `shadow-brand-glow-md`) mapped in `tailwind.config.js`.
- If `shadow-neu-*` is widely used, re-map those vars to SolarConnect-like elevation so existing class usage still works.

### 3.4 Glass surfaces: needs dedicated semantic tokens/classes
SolarConnect frequently uses `backdrop-blur-md` + translucent surfaces.

**Gaps / mismatches**
- No explicit, documented semantic surface tokens for “glass” (surface alpha, border alpha).

**Minimal global strategy**
- Add a small set of semantic classes (or tokens) like:
  - `bg-surface-glass`, `border-border-glass`, `backdrop-blur-glass`
- Implement via CSS variables and Tailwind mappings (central).

### 3.5 Form styling: ring-offset + inset backgrounds
SolarConnect inputs use:
- `bg-slate-900/40`, `border-white/10`, focus ring with offset.

**Gaps / mismatches**
- SolarMatch focus treatment may differ; ring-offset tokens are not explicit.

**Minimal global strategy**
- Ensure input components use semantic `accent` for focus ring.
- Add/standardize a semantic `ring-offset` background token if needed.

---

## 4) Minimal Global Task Plan (ONE THEME NOW)
This is the smallest set of work that shifts the whole product toward SolarConnect.

### Task A — Declare “SolarConnect Dark” as the active target theme (documentation)
- Update `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md` to describe:
  - Brand = SolarConnect Purple
  - Neutral = SolarConnect Slate
  - One-theme focus (others optional later)

### Task B — Update runtime theme tokens centrally (CSS variables)
In `src/app/globals.css` (theme-dark block):
- Set background/surface/border/text to SolarConnect values
- Set accent to `brand-500` and accent-foreground to `brand-950`
- Add optional scale variables:
  - `--color-brand-50 ... --color-brand-950`
  - `--color-neutral-50 ... --color-neutral-950`

### Task C — Map new keys in Tailwind (still centralized)
In `tailwind.config.js`:
- Add `brand-{50..950}` and `neutral-{50..950}` colors (mapped to CSS vars)
- Add brand glow shadows (e.g. `shadow-brand-glow`)
- Ensure focus ring uses `accent` consistently

### Task D — Align semantic typography tokens to SolarConnect (global)
In `src/design-tokens/semantic/typography.ts`:
- Update `heading-1..4`, `body`, `body-large`, `caption` to match SolarConnect’s intent
- Keep responsiveness via the existing clamp generator (no per-component `md:text-*` required)

### Task E — Add “glass surface” semantics (global)
One of:
- Add CSS classes under `@layer components` in `src/app/globals.css` (e.g., `.surface-glass`, `.card-glass`)
- Or add dedicated tokens + Tailwind keys

---

## 5) What may still require component-level work (later)
Even with a fully centralized token update, some SolarConnect patterns are structural:
- Hero slider animations + overlays are layout/feature code, not just tokens.
- Some components in SolarConnect use `scale-[1.02]` and `z-10` for “recommended” cards.

These can be migrated feature-by-feature, but they are not required to globally shift the system’s look.

---

## 6) Recommendation: safest adoption path
If your goal is “make the entire app look like SolarConnect” with minimal effort:
1) Do Tasks A–D first (tokens + typography). This changes 80% of the perception globally.
2) Add Task E (glass semantics) so feature pages can adopt the look consistently.
3) Only then migrate SolarConnect page-level compositions (Hero, Header, cards) as needed.

---

## Appendix — SolarConnect palette (for easy copying)
**brand**
- 50 `#f4f1fd`
- 100 `#e8e2fb`
- 200 `#d0c3f7`
- 300 `#b09cf2`
- 400 `#8d6eeb`
- 500 `#6d3be2`
- 600 `#5e2cd1`
- 700 `#5023b3`
- 800 `#431f94`
- 900 `#381b7a`
- 950 `#230f4f`

**slate (SolarConnect override)**
- 50 `#FBFBFB`
- 100 `#f3f4f6`
- 200 `#e5e7eb`
- 300 `#d1d5db`
- 400 `#9ca3af`
- 500 `#878787`
- 600 `#4b5563`
- 700 `#262626`
- 800 `#1B1B1E`
- 900 `#151419`
- 950 `#0b0a0d`
