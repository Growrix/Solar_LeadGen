# T008 — Root Visual-Mode Strategy Decision

**Date**: 2026-03-14

---

## Context

`src/ds/runtime/app/PlatformPresetScript.tsx` is a script that injects a tiny inline script at HTML root to set `data-platform`, `data-density`, and `data-visual` attributes on `<html>` based on a media query (default: `(max-width: 48rem)`).

Currently, `src/app/layout.tsx` includes `ThemeInitScript` but does **not** include `PlatformPresetScript`.

---

## Options Evaluated

### Option A: Wire `PlatformPresetScript` into `src/app/layout.tsx`

**Pros**:
- Mobile surfaces get `data-platform="mobile"` and `data-density="compact"` correctly
- `data-visual="sleek"` activates app-like visual mode on mobile
- DS can provide mobile-specific overrides via CSS attribute selectors
- Enables `HomeownerMobileSidebarMenu` and `InstallerMobileSidebarMenu` to use DS visual-mode contracts

**Cons**:
- Requires testing on all breakpoints to confirm no visual regressions
- `data-visual="sleek"` may affect components not yet migrated to DS contracts

### Option B: Defer/Remove (scope out)

**Pros**: Zero risk of mobile visual regressions during the current migration.

**Cons**: Mobile sidebar menus and dense UI surfaces won't benefit from DS authority.

---

## Decision: **Option A — Wire `PlatformPresetScript` into layout**

### Rationale

1. The PlatformPresetScript already exists and is designed for exactly this use case.
2. US3 migration (T030) explicitly requires "the DS root visual-mode strategy chosen in T008" for mobile sidebars.
3. Deferring creates a second migration wave for something already built.
4. The `data-visual` attribute only activates visual overrides where explicitly coded in DS CSS — it is safe to enable.

---

## Implementation (done in T028/T030)

Add `PlatformPresetScript` to `src/app/layout.tsx` inside `<head>`:

```tsx
<head>
  <ThemeInitScript />
  <PlatformPresetScript />
</head>
```

Default props are appropriate for the app:
- `mediaQuery="(max-width: 48rem)"` — mobile breakpoint
- `platformAttr="mobile"`
- `densityAttr="compact"`
- `visualAttr="sleek"`

---

## Scope Note

The `data-visual="sleek"` attribute is dormant unless DS CSS explicitly uses `[data-visual="sleek"]` selectors. Currently `ds.tokens.css` has some visual-mode token overrides. Those will be reviewed during T030 to ensure they apply correctly.
