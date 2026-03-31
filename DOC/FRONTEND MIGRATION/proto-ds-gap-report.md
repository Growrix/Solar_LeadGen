# Prototype → DS Gap Report

**Generated**: 2026-03-18T09:43:16.922Z

## Inputs

- Prototype SOT: `DOC/FRONTEND MIGRATION/solarconnect (3)` (Tailwind CDN config in `DOC/FRONTEND MIGRATION/solarconnect (3)/index.html`)
- DS tokens: `src/ds/styles/ds.tokens.css`

## Executive Summary (What’s Blocking “Prototype as DS”)

1. **Brand palette mismatch**: Prototype defines purple brand scale; DS currently defines an orange brand palette.
2. **Slate/neutral mismatch**: Prototype uses a custom slate scale (incl. slate-800/900/950); DS neutral scale does not match those hexes.
3. **Typography scale gaps**: Prototype relies on Tailwind sizes (12/14/16/18/20/24/36/60px etc). DS lacks several of these or uses different values.
4. **Tracking/leading gaps**: Prototype uses tracking-wider/widest and leading-none/snug/relaxed values that DS doesn’t fully encode.
5. **Arbitrary utilities**: Prototype uses custom shadows like `shadow-[0_0_8px_rgba(...)]` which require DS tokens/classes to avoid hardcoding.

## Color Palettes (Token-Level Diff)

### Brand (Prototype vs DS --ds-palette-brand-*)

| Step | Prototype | DS | Status |
|---:|---|---|---|
| 50 | `#f4f1fd` | `#f5f3ff` | MISMATCH |
| 100 | `#e8e2fb` | `#ede9fe` | MISMATCH |
| 200 | `#d0c3f7` | `#ddd6fe` | MISMATCH |
| 300 | `#b09cf2` | `#c4b5fd` | MISMATCH |
| 400 | `#8d6eeb` | `#a78bfa` | MISMATCH |
| 500 | `#6d3be2` | `#6d3be2` | OK |
| 600 | `#5e2cd1` | `#5e2cd1` | OK |
| 700 | `#5023b3` | `#4c1db8` | MISMATCH |
| 800 | `#431f94` | `#3b1499` | MISMATCH |
| 900 | `#381b7a` | `#2e0f7a` | MISMATCH |
| 950 | `#230f4f` | `#1a0854` | MISMATCH |

### Slate (Prototype) vs Neutral (DS --ds-palette-neutral-*)

| Step | Prototype | DS | Status |
|---:|---|---|---|
| 0 |  | `#ffffff` | EXTRA_IN_DS |
| 50 | `#fbfbfb` | `#f5f5f5` | MISMATCH |
| 100 | `#f3f4f6` | `#e5e5e5` | MISMATCH |
| 200 | `#e5e7eb` | `#d4d4d4` | MISMATCH |
| 300 | `#d1d5db` | `#a3a3a3` | MISMATCH |
| 400 | `#9ca3af` | `#737373` | MISMATCH |
| 500 | `#878787` | `#525252` | MISMATCH |
| 600 | `#4b5563` | `#404040` | MISMATCH |
| 700 | `#262626` | `#262626` | OK |
| 800 | `#1b1b1e` | `#1a1a1a` | MISMATCH |
| 850 |  | `#141414` | EXTRA_IN_DS |
| 900 | `#151419` | `#0f0f0f` | MISMATCH |
| 950 | `#0b0a0d` | `#0a0a0a` | MISMATCH |

## Typography Scale Gaps

### Prototype Text Sizes Used

| Utility | Tailwind px | Present in DS font-size set? |
|---|---:|---|
| `text-xs` | 12 | YES |
| `text-sm` | 14 | YES |
| `text-base` | 16 | YES |
| `text-lg` | 18 | YES |
| `text-xl` | 20 | YES |
| `text-2xl` | 24 | NO |
| `text-3xl` | 30 | YES |
| `text-4xl` | 36 | YES |

### DS Font Sizes (Current)

| DS token | Raw | Approx px (@16px/rem) |
|---|---|---:|
| `--ds-font-size-1` | `0.625rem` | 10 |
| `--ds-font-size-topbar` | `0.75rem` | 12 |
| `--ds-font-size-hero-eyebrow` | `0.75rem` | 12 |
| `--ds-font-size-1` | `0.75rem` | 12 |
| `--ds-font-size-2` | `0.8125rem` | 13 |
| `--ds-font-size-header-nav` | `0.875rem` | 14 |
| `--ds-font-size-2` | `0.875rem` | 14 |
| `--ds-font-size-3` | `1rem` | 16 |
| `--ds-font-size-3` | `1rem` | 16 |
| `--ds-font-size-4` | `1.125rem` | 18 |
| `--ds-font-size-4` | `1.125rem` | 18 |
| `--ds-font-size-5` | `1.125rem` | 18 |
| `--ds-font-size-5` | `1.25rem` | 20 |
| `--ds-font-size-header-brand` | `1.25rem` | 20 |
| `--ds-font-size-hero-subtitle` | `1.25rem` | 20 |
| `--ds-font-size-6` | `1.375rem` | 22 |
| `--ds-font-size-7` | `1.75rem` | 28 |
| `--ds-font-size-6` | `1.875rem` | 30 |
| `--ds-font-size-7` | `2rem` | 32 |
| `--ds-font-size-hero-title` | `2.25rem` | 36 |
| `--ds-font-size-8` | `3rem` | 48 |
| `--ds-font-size-hero-title-md` | `3rem` | 48 |
| `--ds-font-size-hero-title-lg` | `3.75rem` | 60 |
| `--ds-font-size-9` | `4.5rem` | 72 |

## Letter-Spacing (Tracking)

| Utility | Prototype value | DS has exact token value? | DS tokens |
|---|---|---|---|
| `tracking-wider` | `0.05em` | NO | `tight=-0.025em, loose=0.025em, header-nav=0.025em` |
| `tracking-widest` | `0.1em` | NO | `tight=-0.025em, loose=0.025em, header-nav=0.025em` |
| `tracking-tight` | `-0.025em` | YES | `tight=-0.025em, loose=0.025em, header-nav=0.025em` |
| `tracking-wide` | `0.025em` | YES | `tight=-0.025em, loose=0.025em, header-nav=0.025em` |

## Line-Height (Leading)

| Utility | Prototype value | DS has exact value? | DS line-heights |
|---|---:|---|---|
| `leading-relaxed` | 1.625 | NO | `tight=1.2, section=1.2778, meta=1.4, normal=1.5, relaxed=1.75` |
| `leading-tight` | 1.25 | NO | `tight=1.2, section=1.2778, meta=1.4, normal=1.5, relaxed=1.75` |
| `leading-snug` | 1.375 | NO | `tight=1.2, section=1.2778, meta=1.4, normal=1.5, relaxed=1.75` |
| `leading-none` | 1 | NO | `tight=1.2, section=1.2778, meta=1.4, normal=1.5, relaxed=1.75` |

## Arbitrary Utilities (Must Become DS Tokens/Classes)

| Utility | Count | Example |
|---|---:|---|
| `text-[10px]` | 3 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/QuoteOptionCard.tsx:57` |
| `min-h-[100px]` | 1 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Textarea.tsx:14` |
| `min-h-[42px]` | 1 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Select.tsx:120` |
| `max-h-[90vh]` | 1 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Modal.tsx:58` |
| `sizes[size]` | 1 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Container.tsx:27` |
| `h-[180px]` | 1 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/Hero.tsx:74` |
| `sm:h-[200px]` | 1 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/Hero.tsx:74` |
| `md:h-[240px]` | 1 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/Hero.tsx:74` |
| `min-h-[400px]` | 1 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/FeaturedNewsCard.tsx:16` |

## Highest-Impact Prototype Utilities (Top 60 Raw Tokens)

| Raw token | Count | Example |
|---|---:|---|
| `flex` | 104 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:47` |
| `items-center` | 75 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:47` |
| `:` | 49 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:128` |
| `w-full` | 39 | `DOC/FRONTEND MIGRATION/solarconnect (3)/App.tsx:15` |
| `font-medium` | 30 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:44` |
| `relative` | 29 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:37` |
| `absolute` | 27 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:38` |
| `text-sm` | 26 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:130` |
| `w-4` | 25 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:30` |
| `h-4` | 25 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:30` |
| `border` | 23 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:59` |
| `text-white` | 23 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:58` |
| `text-slate-400` | 22 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:57` |
| `flex-col` | 21 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:84` |
| `justify-between` | 21 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:21` |
| `transition-colors` | 21 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:126` |
| `h-full` | 19 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/ComponentLibrary.tsx:256` |
| `justify-center` | 18 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:84` |
| `rounded-full` | 18 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:153` |
| `font-bold` | 17 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:93` |
| `bg-slate-900` | 16 | `DOC/FRONTEND MIGRATION/solarconnect (3)/App.tsx:15` |
| `mb-4` | 16 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:36` |
| `overflow-hidden` | 16 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:52` |
| `text-xs` | 16 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:66` |
| `transition-all` | 16 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Tooltip.tsx:25` |
| `gap-4` | 15 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:84` |
| `uppercase` | 15 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:42` |
| `border-slate-700` | 15 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:105` |
| `border-b` | 15 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:160` |
| `focus:outline-none` | 15 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Textarea.tsx:14` |
| `mb-2` | 14 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:23` |
| `font-semibold` | 14 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:42` |
| `px-4` | 14 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Select.tsx:139` |
| `rounded-lg` | 13 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:59` |
| `p-4` | 11 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:59` |
| `gap-3` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:47` |
| `mb-6` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:47` |
| `text-brand-500` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:48` |
| `gap-2` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:23` |
| `group` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:37` |
| `transition-opacity` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:38` |
| `tracking-wider` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:42` |
| `w-5` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:135` |
| `h-5` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:135` |
| `border-slate-800` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/ComponentLibrary.tsx:61` |
| `cursor-pointer` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Switch.tsx:42` |
| `hover:text-white` | 10 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Select.tsx:91` |
| `w-6` | 9 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:48` |
| `h-6` | 9 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:48` |
| `p-6` | 9 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:37` |
| `z-10` | 9 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:41` |
| `transition-transform` | 9 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Switch.tsx:33` |
| `text-slate-300` | 9 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Select.tsx:109` |
| `inset-0` | 9 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Modal.tsx:46` |
| `border-t` | 9 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Modal.tsx:79` |
| `rounded` | 8 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/LayoutStructure.tsx:66` |
| `top-0` | 8 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/Dashboard.tsx:38` |
| `space-y-6` | 8 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/ComponentLibrary.tsx:60` |
| `border-white/5` | 8 | `DOC/FRONTEND MIGRATION/solarconnect (3)/pages/ComponentLibrary.tsx:68` |
| `border-white/10` | 8 | `DOC/FRONTEND MIGRATION/solarconnect (3)/components/ui/Tooltip.tsx:25` |

## Recommended DS Worklist (Prioritized)

1. **Replace DS brand palette** in `ds.tokens.css` with prototype `brand` scale from `index.html`.
2. **Add/align DS slate/neutral scale** to match prototype `slate` values (or introduce `--ds-palette-slate-*` and remap semantics).
3. **Add missing font sizes** to cover Tailwind defaults used (12, 14, 24, 36, 60px) and update semantic typography classes to use them.
4. **Add tracking tokens** for 0.05em and 0.1em and semantic classes for uppercase labels.
5. **Add leading tokens** matching Tailwind `none/snug/relaxed` where used (1, 1.375, 1.625).
6. **Convert arbitrary shadows** to DS tokens (e.g. hero indicator glow) and expose semantic classes.

