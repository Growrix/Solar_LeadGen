# DS Instruction — Blueprint Design System (Strict Rules)

**Audience:** Humans + AI agents working in this repo

**Purpose (system-first):**
You are not building “a page”. You are building a **Design System + two stable UX surfaces**:

- **Mobile = app-like** (feels like an app)
- **Desktop = classic web** (stays unchanged)

All work must keep the DS consistent, reusable, and globally controllable.

---

## 1) One rule to remember (public API)

✅ Always import UI from the DS barrel:

```ts
import { Button, Card, Stack, DashboardShell, ThemeSwitcher, app } from "@/ds";
```

❌ Never deep-import DS internals:

```ts
// BAD
import { Button } from "@/ds/primitives/Button";
import { Sheet } from "@/ds/runtime/app/mobile/Sheet";
```

**Why:** `src/ds/index.ts` is the contract. Internals can move.

---

## 2) Mobile app-like vs Desktop classic (how the system works)

### A) Global platform switching (authoritative)

The **only** supported global switch is:

- `app.PlatformPresetScript` (DS-owned)
- Used in `src/app/layout.tsx`

What it does:
- On `(max-width: 48rem)` it sets `<html>` attributes:
  - `data-platform="mobile"`
  - `data-density="compact"`
  - `data-visual="sleek"`
- Otherwise it removes those attributes (desktop remains classic)

**Rules:**
- Do not add a second platform script anywhere else.
- Do not hardcode `<html data-platform>` in app pages.
- If platform logic must change, change it inside `PlatformPresetScript`.

### B) Mobile shell (app-like)

Mobile app-like screens should be composed with DS runtime shells:

```tsx
import { app } from "@/ds";

export default function Page() {
  return (
    <app.mobile.MobileAppShell topbar={...} bottomNav={...}>
      {...}
    </app.mobile.MobileAppShell>
  );
}
```

This provides app-like defaults:
- Screen wrapper (`app.mobile.Screen`) + app surface behavior
- Compact density + full-width container by default

### C) Desktop shell (classic)

Desktop uses the classic DS layouts:
- `PublicShell`, `DashboardShell`, `DocsShell`, `CenteredShell`

Desktop must not inherit mobile knobs because `<html data-*>` is removed on desktop.

### D) Rendering both surfaces in one route (allowed)

When a page needs **different layout/UX**, render both and swap with DS utilities:
- `.ui-only-mobile-block`
- `.ui-only-desktop-block`

Do not implement custom media-query CSS in feature folders.

---

## 3) Styling rules (no hardcoding)

### A) Where styles are allowed

All UI styling must live in DS stylesheets:
- `src/ds/styles/ds.tokens.css` (tokens + knobs)
- `src/ds/styles/ds.utilities.css` (utilities like visibility helpers, layout helpers)
- `src/ds/styles/ds.components.css` (component class implementations)

✅ Allowed in app/features:
- Using DS classes already defined (e.g. `ui-row`, `text-label`)
- Composing DS primitives/components

❌ Not allowed in app/features:
- New hex colors, px values, shadows, font sizes
- One-off CSS files to style DS primitives
- Inline `style={{ ... }}` for design decisions

### B) Token-first

If you need a new spacing/radius/size/font decision, create/adjust tokens in:
- `src/ds/styles/ds.tokens.css`

Then consume via DS classes/components.

### C) Platform-scoped overrides

If it’s mobile-only, scope it like:

```css
:where(html[data-platform="mobile"], [data-platform="mobile"]) {
  /* mobile overrides */
}
```

Never change desktop defaults to “make mobile look good”.

---

## 4) Component building rules (reusable system components)

### A) Where to create components

- **Primitives:** `src/ds/primitives/` (low-level, minimal behavior)
- **Components (default):** `src/ds/components/shared/`
- **Mobile variants:** `src/ds/components/mobile/`
- **Desktop variants:** `src/ds/components/desktop/`

### B) When to create a mobile component

Create a mobile variant only when UX truly diverges, e.g.:
- navigation patterns (BottomNav)
- top bars
- sheets / overlays
- touch-first interactions

If it’s mostly the same, keep it in `shared/` and rely on platform tokens.

### C) Runtime vs Components (strict separation)

- `components/*` = reusable UI building blocks
- `runtime/app/*` = platform “integration” wrappers/presets (shells, screen, sheet primitives)

**Rule of thumb:**
- If it’s a generic UI element → `components/shared`
- If it’s a platform surface/shell/preset → `runtime/app/mobile`

### D) Export rule

A DS module is not real until it’s exported from `src/ds/index.ts`.

Do not instruct people/AI to import from internal paths.

---

## 5) Theme rules

- Themes are applied via `<html class="theme-…">`
- Theme flash prevention is DS-owned via `ThemeInitScript`
- Storage key is DS-owned: `solarmatch-theme`

Do not implement new theme logic in feature code.

---

## 6) Safe-area + notch rules (mobile)

Mobile app-like UI must respect safe-area:
- `viewport-fit=cover` is set in `src/app/layout.tsx`
- DS utilities/components handle `env(safe-area-inset-*)` where needed

If you introduce a new fixed/sticky mobile element, it must consider safe-area.

---

## 7) AI operating protocol (anti-mess, anti-hallucination)

When an AI agent changes UI in this repo, it must follow this sequence:

1) **Search first**: confirm the component/class/token exists.
2) **Use DS first**: prefer primitives/components already exported from `@/ds`.
3) If something is missing:
   - add it inside DS (correct folder)
   - add token-driven styles in DS CSS
   - export from `src/ds/index.ts`
4) **Never invent APIs** (props/components/tokens). If uncertain, open the actual file.
5) After changes, run `npm run build`.

---

## 8) Change checklist (required)

Before merging any DS/UI change:

- Imports are only from `@/ds`
- No new hardcoded design values in app/features
- Mobile changes are scoped via `data-platform="mobile"`
- Desktop stays classic (no accidental overrides)
- Any new DS module is exported from `src/ds/index.ts`
- `npm run build` passes

---

## 9) Quick reference (paths)

- DS barrel: `src/ds/index.ts`
- Tokens: `src/ds/styles/ds.tokens.css`
- Utilities: `src/ds/styles/ds.utilities.css`
- Components CSS: `src/ds/styles/ds.components.css`
- Runtime app presets: `src/ds/runtime/app/PlatformPresetScript.tsx`
- Mobile shell: `src/ds/runtime/app/mobile/AppShell.tsx`
- Anatomy doc: `src/ds/DESIGN-SYSTEM-ANATOMY.md`
