# Blueprint Design System (DS) — Anatomy, Rules, and Operating Guide

**IMPORTANT:** Before making any DS/UI change, you MUST read [`DS_instruciton.md`](DS_instruciton.md) for strict rules, anti-hallucination protocol, and the system operating contract.

**Last updated:** 2026-02-10

**Location:** `src/ds/`

This document explains how the Design System (DS) in this repo is structured, how it works at runtime, and the strict rules for using/extending it while building frontend.

**Goal:** Any AI or human can build screens *systematically* using the DS without breaking theming, tokens, layout conventions, or the DS boundary.

---

## 0) Executive summary (what this DS is)

This DS is a **class-based design system**:

- **Styling is driven by DS-owned CSS** in `src/ds/styles/*`.
- React components (primitives + components + shells) mostly act as **thin wrappers** that apply DS class names like `ui-button`, `ui-container`, `ui-page`, etc.
- Visual consistency is enforced through:
  - **CSS variables (“tokens”)** in `src/ds/styles/ds.tokens.css`.
  - **Theme selection** via an `html` class: `theme-dark`, `theme-light`, `theme-purple`.
  - **CSS layer ordering** to guarantee predictable cascade.

**Single public API:** `@/ds` (backed by `src/ds/index.ts`). Import UI ONLY from there.

**Two distinct UX surfaces (core goal):**

- **Desktop (classic):** no platform presets on `<html>` → classic layout + typography.
- **Mobile (app-like):** DS-owned platform presets on `<html>` (via `app.PlatformPresetScript`) + app-like runtime shells (via `app.mobile.*`).

**Rule:** Mobile behavior/styling must be enabled by DS knobs (`data-platform`, `data-density`, `data-visual`) and DS runtime shells — never by ad-hoc feature code.

---

## 1) The DS boundary (non‑negotiable)

### Import boundary

✅ Do:

```ts
import { Button, Card, DashboardShell, ThemeSwitcher } from "@/ds";
import { Bell, Home } from "@/ds"; // icons are curated and re-exported
```

❌ Don’t:

- Import DS internals directly (example: `@/ds/primitives/Button`).
- Import icon libraries directly (example: `lucide-react`) from app/features.

**Why:** The DS uses `src/ds/index.ts` as the *only* stable surface. Internals can move; the barrel is the contract.

### Styling boundary

✅ Do:

- Use DS classes, DS components, and DS tokens.
- If you need a new visual style, add it **inside the DS** (new DS utility class, component style, or token).

❌ Don’t:

- Hardcode new hex colors, px values, shadows, etc. in feature code.
- Create “random one-off” CSS for UI primitives in feature folders.

---

## 2) How DS styles load (critical)

### Global import

The app loads DS styles once via:

- `src/app/globals.css`

```css
@import "../ds/styles/index.css";
```

So DS CSS is **always available** across the app.

### Layer ordering

The DS defines explicit CSS layers in `src/ds/styles/index.css`:

```css
@layer ds.tokens, ds.theme, ds.base, ds.utilities, ds.components;

@import "./ds.tokens.css";
@import "./ds.theme.css";
@import "./ds.base.css";
@import "./ds.utilities.css";
@import "./ds.components.css";
```

**Interpretation:**

1. `ds.tokens` → token variables (`--ds-*`) and theme overrides
2. `ds.theme` → `color-scheme` mapping per theme
3. `ds.base` → base element reset + body typography
4. `ds.utilities` → layout/typography helper classes (`ui-*`, `text-*`)
5. `ds.components` → component class implementations (`ui-button`, `ui-card`, etc.)

**Rule:** Do not reorder these layers or import DS CSS multiple times.

---

## 3) Tokens (the source of truth)

### Where tokens live

- **Source of truth (CSS variables):** `src/ds/styles/ds.tokens.css`
- **Typed references (TS helpers):** `src/ds/foundation/tokens/vars.ts`

The legacy folder `src/ds/tokens/` is intentionally present but **not** the source of truth.

### Token philosophy

- Components should prefer DS **classes** that already encode token usage.
- When code needs a stable variable reference, use typed helpers like:

```ts
import { tokens } from "@/ds";

// example: tokens.space.cardPadding
```

(Use token references sparingly; prefer DS classes/components.)

### Theme + platform knobs

`ds.tokens.css` supports scoped “knobs” that change tokens:

- Themes via `html.theme-*`.
- Density via `data-density="compact"` (on `html` or any wrapper).
- Visual variants via `data-visual="glass" | "neumorph" | "sleek"`.
- Platform presets via `data-platform="mobile"`.

**Canonical place to control these knobs globally:**

- Use `app.PlatformPresetScript` (exported from `@/ds`) in `src/app/layout.tsx`.
- Do not duplicate/inline a second platform script in app/feature code.

**Rule:** Prefer setting these knobs at a **page shell/root wrapper** instead of sprinkling per-component overrides.

---

## 4) Theming (how it works)

### Theme selector mechanism

A theme is applied by adding a class to `<html>`:

- `theme-dark`
- `theme-light`
- `theme-purple`

### Preventing “flash of wrong theme”

The app injects `ThemeInitScript` into `<head>` in `src/app/layout.tsx`:

```tsx
import { ThemeInitScript } from "@/ds";

<head>
  <ThemeInitScript />
</head>
```

`ThemeInitScript` reads localStorage key:

- `solarmatch-theme`

and applies `theme-*` class before React hydration.

### Runtime switching

`ThemeSwitcher`:

- reads stored theme
- calls `applyTheme()`
- stores theme via `storeTheme()`

**Rule:** Use the DS theme utilities/components. Don’t implement new theme logic in feature code.

---

## 5) Typography and semantic utility classes

Typography classes are defined in `src/ds/styles/ds.utilities.css`:

- Headings: `text-heading-1..4`
- Body: `text-body`, `text-body-large`, `text-body-small`
- Meta: `text-caption`, `text-micro`, `text-label`

The `Text` primitive is a thin wrapper:

- always uses `text-body`
- supports `tone="muted"` → `ui-text-muted`

### Semantic layout utilities

The DS has a small “semantic utility registry” in:

- `src/ds/foundation/semantics/registry.ts`

It defines stable names like:

- `ui-page`, `ui-page-main`
- `ui-container` (+ width modifiers)
- `ui-stack`, `ui-row`
- `ui-focus-ring`

Use these via DS components (preferred) or directly as classes when appropriate.

---

## 6) DS component architecture (what lives where)

### Overview

This DS is organized into multiple layers. Some are “real” implementation layers, others are **organizational/compatibility re-exports**.

The **real styling** lives primarily in:

- `src/ds/styles/ds.utilities.css`
- `src/ds/styles/ds.components.css`

The React components generally:

- render semantic HTML
- attach DS class names
- occasionally include client-side behavior (`"use client"`)

### Folder responsibilities (operational meaning)

#### `src/ds/primitives/`
Low-level building blocks. Usually minimal logic; mostly class wiring.

Examples:
- `Button`, `Input`, `Select`, `Stack`, `Grid`, `Container`, `Text`

Use primitives to assemble new UI before reaching for heavier components.

#### `src/ds/components/`
Higher-level components that combine primitives, behaviors, and DS class conventions.

This folder is now organized by **platform variants**:

- `src/ds/components/shared/` — default, cross-platform components (baseline)
- `src/ds/components/mobile/` — app-like mobile variants (when UX diverges)
- `src/ds/components/desktop/` — desktop-specific variants (when UX diverges)

Examples:
- `Modal`, `Drawer`, `Tabs`, `Toast`, `DataTable`, `MarkdownEditor`, `ThemeSwitcher`

These map to large sections inside `ds.components.css`.

#### `src/ds/layouts/`
Page shells that define layout structure and apply semantic utility classes.

Examples:
- `PublicShell`, `DashboardShell`, `DocsShell`, `CenteredShell`

If a page is a “dashboard”, it should use the dashboard shell.

#### `src/ds/runtime/`
Runtime “platform” helpers and re-exports.

- `runtime/web/shells.ts` re-exports layout shells.
- `runtime/app/*` contains presets for mobile/tablet style shells.

**Runtime is exposed as namespaces via the public DS barrel:**

```ts
import { app, web } from "@/ds";

// Global platform knobs
// <app.PlatformPresetScript />

// Mobile app-like shells
// <app.mobile.MobileAppShell />
```

Treat this as the DS “integration layer” for different app surfaces.

#### `src/ds/foundation/`
Foundational contracts:

- `tokens` (typed token references)
- `themes` (theme registry + init script + storage)
- `semantics` (semantic class registry)
- `a11y` and `motion` utilities

When extending the DS, this is where you define **new foundational primitives** (new theme, new semantic tokens, etc.).

#### `src/ds/styles/`
The DS stylesheet implementation.

- `ds.tokens.css` — tokens + theme overrides + knobs
- `ds.theme.css` — `color-scheme` per theme
- `ds.base.css` — base element + body rules
- `ds.utilities.css` — layout/type utilities (`ui-*`, `text-*`)
- `ds.components.css` — component styles (`ui-button`, `ui-card`, …)

#### `src/ds/icons.ts`
Curated icon exports. Keeps `lucide-react` behind DS boundary.

#### `src/ds/patterns/`
Reusable patterns for application states.

- `AsyncBoundary` (idle/loading/error/empty/ready switch)
- `ErrorBlock`

Also re-exports some component patterns for backwards compatibility.

#### `src/ds/composition/`
Higher-level “composition” helpers:

- `templates/PageTemplate.tsx` chooses a shell by name
- blocks/patterns/templates groupings

Use composition to standardize screen structure across features.

#### `src/ds/structures/` and `src/ds/interactions/`
These currently act as **organizational re-export layers** that point to primitives/components.

They exist to preserve/express a blueprint architecture and allow future “headless” or “structure-only” expansions without breaking imports.

#### `src/ds/widgets/` and `src/ds/visuals/`
Optional building blocks for dashboards and visual effects.

- Widgets: `WidgetShell`, `MetricWidget`, `StatWidget`, etc.
- Visuals: `Glow`, `NoiseOverlay`, `BackgroundFX`

Use these when building dashboard-like UIs.

#### `src/ds/preview/`
Preview context used by component-library screens:

- `PreviewPlatformProvider`
- `usePreviewPlatform()`

---

## 7) What the DS exports (public API)

The DS public API is the barrel:

- `src/ds/index.ts`

It exports:

- all primitives
- all components
- layouts
- foundation + runtime layers
- patterns, visuals, widgets, composition
- preview platform
- curated icons

**Rule:** If you add a new DS module, it is not “real” until it is exported from `src/ds/index.ts`.

---

## 8) How to build frontend using this DS (the operating workflow)

### A. Build a new page/screen

1) Pick a shell:

- Public marketing / landing → `PublicShell`
- App dashboard → `DashboardShell`
- Docs → `DocsShell`
- Simple centered content → `CenteredShell`

**If the screen must have different UX on mobile vs desktop (app-like vs classic):**

- Render both branches in the page and swap using DS utilities:
  - `.ui-only-mobile-block`
  - `.ui-only-desktop-block`
- Mobile branch should use `app.mobile.MobileAppShell` (app-like defaults).
- Desktop branch should use classic shells (`PublicShell`, `DashboardShell`, etc.).

2) Layout with primitives + utilities:

- `Container` for width
- `Stack` for vertical rhythm
- `Grid` for columns
- `Section` for content bands

3) Use DS components next:

- forms → `Field`, `Input`, `Select`, `Switch`, etc.
- overlay → `Modal`, `Drawer`, `Popover`, `Tooltip`
- feedback → `Alert`, `Toast`, `Skeleton`, `EmptyState`

4) Only then consider adding new DS capability.

### B. Add a new primitive/component (safe procedure)

**Checklist (follow in order):**

1. Create the implementation file in the correct folder:
   - primitive → `src/ds/primitives/NewThing.tsx`
  - component (default) → `src/ds/components/shared/NewThing.tsx`
  - component (mobile variant, if needed) → `src/ds/components/mobile/NewThing.tsx`
  - component (desktop variant, if needed) → `src/ds/components/desktop/NewThing.tsx`

2. Implement it in the DS style:
   - add DS classes (e.g. `ui-newthing`)
   - avoid hardcoded visuals; use tokens via CSS variables

3. Add styles:
   - layout/typography helper? → `src/ds/styles/ds.utilities.css`
   - component implementation? → `src/ds/styles/ds.components.css`

4. Export it from `src/ds/index.ts`.

5. If it affects shells/layouts, update the component-library pages (in `src/app/component-library/*`) so it’s visible and exercised.

6. Add/adjust tests if relevant:
   - shells already have snapshot tests in `src/ds/layouts/__tests__`.

### C. Add a new theme (strict)

1. Update `ThemeName` union and `THEMES` in `src/ds/foundation/themes/registry.ts`.
2. Add token overrides in `src/ds/styles/ds.tokens.css` under `html.theme-<name>`.
3. Ensure `ds.theme.css` includes the right `color-scheme` mapping.

**Rule:** New theme must be token-driven; do not introduce ad-hoc per-component theme rules.

---

## 9) Limitations and scope (important so no one “messes up”)

### Current scope (what this DS supports well)

- Tokenized, themeable UI using CSS variables.
- Consistent spacing/typography via utilities and primitives.
- Multiple shells (public/dashboard/docs) with responsive behavior.
- Curated icon surface.
- A component-library area in the app that already consumes the DS.

### Current limitations (don’t fight these)

- The DS is **not Tailwind-first**; it is DS-class-first.
- Many layers (`structures`, `interactions`, parts of `runtime`) are mostly **re-exports** today; don’t assume they contain distinct implementations.
- Tokens are primarily in CSS; typed token helpers exist but are intentionally minimal.
- Adding new visuals usually requires editing DS CSS files; do not patch around this in feature code.

---

## 10) Roadmap for systematic frontend builds (recommended)

### Phase 1 — Consume only

- Build all new pages using `@/ds` imports.
- Prefer shells + primitives + existing components.
- Avoid adding new utilities unless repeated use is proven.

### Phase 2 — Standardize patterns

- Use `composition/templates/PageTemplate` when page selection is dynamic.
- Adopt `patterns/AsyncBoundary` for all async state handling.

### Phase 3 — Extend DS carefully

- When something is missing, add it inside DS with:
  - DS classes
  - token-driven styles
  - exported API via `src/ds/index.ts`

### Phase 4 — Governance

- Add a lightweight “DS change checklist” to PR templates (optional):
  - exported from barrel
  - theme-safe
  - token-safe
  - no feature-layer hardcoded styling

---

## 11) Current DS file tree (snapshot)

High-level snapshot of `src/ds/` (kept intentionally stable; internals can move but the barrel stays the contract):

```text
src/ds/
  index.ts                 (ONLY public entrypoint; import from "@/ds")
  icons.ts                 (curated icons)

  styles/                  (CSS implementation; token-first)
    index.css              (layer order)
    ds.tokens.css          (tokens + knobs: theme/density/visual/platform)
    ds.theme.css           (color-scheme mapping)
    ds.base.css            (base reset)
    ds.utilities.css       (semantic utilities + visibility helpers)
    ds.components.css      (component styles + runtime surfaces)

  primitives/              (low-level building blocks)
  layouts/                 (PublicShell/DashboardShell/etc.)

  components/
    shared/                (default cross-platform components)
    mobile/                (mobile-only variants when UX diverges)
    desktop/               (desktop-only variants when UX diverges)

  runtime/                 (integration layer; exported as namespaces)
    index.ts               (exports: app, web)
    app/
      PlatformPresetScript.tsx   (controls <html data-*> globally)
      mobile/
        AppShell.tsx             (MobileAppShell)
        Screen.tsx               (mobile surface wrapper)
        Sheet.tsx/Overlay.tsx/FloatingAction.tsx/BottomNavPreset.tsx
      tablet/...
    web/
      shells.ts, DeviceFrame.tsx, WidgetFrame.tsx

  foundation/              (contracts: tokens/themes/semantics/a11y)
  patterns/ visuals/ widgets/ composition/ preview/
  structures/ interactions/ (organizational + compatibility layers)
```

---

## 12) Quick “do not mess up” checklist

Before merging any frontend work:

- [ ] UI imports come from `@/ds` only
- [ ] No new hardcoded colors/sizes/shadows in feature code
- [ ] Theme logic uses DS (`ThemeInitScript`, `ThemeSwitcher`, theme utilities)
- [ ] DS CSS remains a single global import (not duplicated)
- [ ] Any new DS component is exported in `src/ds/index.ts`
- [ ] Any new styling is token-driven and added in DS CSS layers

---

## Appendix: Notes for AI assistants

When generating UI code in this repo:

- Prefer using `DashboardShell`/`PublicShell`/`DocsShell` first.
- Use `Stack`, `Grid`, `Container`, `Section` for structure.
- Use DS typography classes (`text-*`) and DS components.
- If you think “I need Tailwind utilities”, stop: this DS expects DS classes and DS tokens.
