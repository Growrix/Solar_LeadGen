# Universal Prototype → Design System (SOT) Adoption Playbook

## Purpose
This document is a reusable, project-agnostic instruction set for converting a fast prototype (Vite, Tailwind CDN, AI Studio, etc.) into a **production-grade design system** that becomes the **single source of truth (SOT)** for tokens, styles, primitives, and shared UI.

Use this playbook when:
- You have a prototype that is visually “correct” but contains **hardcoded styles** (hex colors, raw Tailwind utilities, arbitrary values, inline styles).
- You want a governed Design System that is applied to an existing app by **refactoring** existing components—not rewriting the entire app.

This playbook is designed for **pixel-perfect visual matching** with **token-driven implementation**.

---

## Definitions (Common Language)
- **Prototype (Visual SOT):** The prototype defines the target look/feel (colors, spacing, motion, shadows, states). It is *not* a production DS implementation.
- **Design System (Implementation SOT):** The canonical implementation for tokens + primitives. All application UI must consume it.
- **Tokens:** Named values for colors/typography/spacing/radius/shadows/motion. Tokens are stable public API.
- **Primitives:** Reusable low-level UI building blocks (Button, Input, Card, Text, Stack, Container, etc.) built on tokens.
- **Compatibility Pack (Optional):** A small centralized layer that helps imported prototype code run while you codemod/refactor it.
- **Protected Zone (Freeze Island):** Code you must not change during the DS adoption (e.g., modals, auth flows, backend).

---

## Non‑Negotiable Rules
1. **One SOT:** After adoption, there must be exactly one authoritative DS location for tokens and primitives.
2. **No Hardcoded UI in App Code:** App/UI code must not contain:
   - Hex/RGB/HSL literals (`#...`, `rgb(...)`, `hsl(...)`)
   - “Raw” palette utilities (e.g., `bg-slate-900`, `text-gray-300`) unless explicitly allowed as compatibility aliases
   - Arbitrary value utilities (e.g., `h-[240px]`, `text-[10px]`)
   - Inline styles and per-component `<style>` tags (move into DS motion tokens / global DS layers)
3. **No Logic Changes During Styling Refactors:** Styling refactors must not change state, event handlers, fetches, validation, or business rules.
4. **Pixel-Perfect Target:** The DS must reproduce the prototype’s visuals (within agreed tolerance) using tokens—not ad-hoc one-offs.
5. **Protected Zones Stay Untouched:** If a protected zone is declared (modals, backend, etc.), do not modify its files or dependency chain.

---

## Deliverables (What “Done” Produces)
- A token set:
  - `colors` (semantic + optional scales)
  - `typography` (semantic, responsive if needed)
  - `spacing`, `radius`, `shadows`, `motion`, `layout`
- A primitive component set (minimum viable):
  - Button, Input, Text/TextStyles, Card/Surface, Badge, Divider, Spinner, Tooltip (as needed)
- A **mapping table** from prototype patterns → DS tokens/primitives
- A repeatable audit process (scripts/commands) that detects regressions
- Verification gates: typecheck/build + DS-verify = clean

---

## Phase 0 — Project Setup (Fast, Saves Time Later)
1. **Pick the DS target location** (example: `src/ds/**`).
2. **Declare protected zones** (example: modals, backend, auth flows).
3. **Freeze the prototype**:
   - Treat it as a read-only reference.
   - Do not “fix” prototype code; interpret it.
4. **Capture baseline visuals** (minimum):
   - Desktop + mobile screenshots for key pages
   - Component Library page (if exists)
   - Key interactive states (hover/focus/active/disabled/loading)

Output:
- `prototype-baseline/` screenshots (or an equivalent folder)
- A written “Scope Lock” list: what you will and won’t touch

---

## Phase 1 — Prototype Audit (Find All Hardcoded Sources)
The goal is to create a complete inventory of hardcoded styling and extract it into tokens.

### 1.1 Identify prototype styling sources
Check for:
- Tailwind CDN config in HTML (common in prototypes)
- CSS variables in `:root` or theme classes
- Global CSS files (reset, utilities)
- Inline styles in components (`style={{...}}`)
- `<style>` tags embedded in components (keyframes, animations)

#### Special case: Tailwind CDN config inside `index.html`
If the prototype uses Tailwind via CDN and sets `tailwind.config = { ... }` in HTML:
- Treat that config object as the prototype’s **raw token dump**.
- Extract the following into your DS SOT (do not leave them in HTML):
  - `theme.extend.colors` → DS color tokens (semantic + optional scales)
  - `theme.extend.fontFamily` → DS typography tokens
- Record the exact literal values and the intended meaning (e.g., `brand-500` is “accent/primary”).

### 1.2 Produce an “Extraction List”
Create a list of:
- Color palettes (brand + neutral)
- Semantic color meanings (background, surface, border, foreground levels, accent)
- Typography scale (heading/body/caption/micro), including responsive behavior
- Shadows (including colored glows)
- Glass effects (blur + translucent surfaces + alpha borders)
- Motion (durations/easings/keyframes)
- One-off layout constants (fixed heights, min-heights)

### 1.3 Create a mapping table (prototype → DS)
Create a single “dictionary” table for repeated patterns. Examples of entries:
- `bg-slate-900` → `bg-background`
- `bg-slate-800/90 backdrop-blur-md border-white/10` → `surface-glass` (or `Surface variant="glass"`)
- `text-4xl md:text-5xl lg:text-6xl font-extrabold` → `text-heading-1`
- `shadow-lg shadow-brand-500/20` → `shadow-card` + optional `shadow-brand-glow-sm`

Rules for the mapping table:
- Each prototype pattern must map to exactly one DS token or DS primitive pattern.
- If you cannot map a pattern, you must add a DS token/utility/primitive (do not sprinkle one-offs).

---

## Phase 2 — Tokenization (Convert Prototype Values Into Token API)
### 2.1 Create token taxonomy
Minimum recommended taxonomy:
- **Color tokens (semantic)**
  - `background`, `surface`, `surfaceHover`, `border`, `scrim`
  - `foreground`, `foregroundSecondary`, `foregroundTertiary`
  - `accent`, `accentHover`, `accentForeground`
  - `success`, `warning`, `error`, `info`
- **Optional scales (compatibility)**
  - `brand-50..950`, `neutral-50..950` (or `slate-*` aliases)
- **Typography tokens**
  - `heading-1..4`, `body`, `body-large`, `caption`, `micro`, `button`, `label`
- **Spacing tokens**
  - `space-1..N` or semantic spacing (xs/sm/md/lg)
- **Radius tokens**
  - `radius-card`, `radius-button`, `radius-input`
- **Shadow/Elevation tokens**
  - `shadow-card`, `shadow-modal`, `shadow-dropdown`, `shadow-focus`, optional `shadow-brand-glow-*`
- **Motion tokens**
  - `duration-*`, `ease-*`, `keyframes-*` (e.g., fade-in-up, ken-burns)

### 2.2 Token rules
- Tokens are **public API**: changing token meaning is a breaking change.
- Tokens must be **themeable** (CSS variables recommended for runtime themes).
- Scales are allowed only if:
  - They are mapped through variables (so themes can change them)
  - App code still prefers semantic tokens by default

### 2.3 Exception policy (avoid paralysis)
If pixel-perfect parity requires a value that does not fit your current token system:
1. Add a named token (preferred), or
2. Add a named DS utility backed by a token (acceptable), or
3. Add a narrow, documented allowlist exception (last resort).

Never leave arbitrary values or hex literals in app UI code because “it’s faster”.

---

## Phase 3 — Implement DS SOT (Centralize Everything)
### 3.1 Runtime token source
Preferred approach:
- Store runtime values in CSS variables (theme classes on `<html>`).
- Map Tailwind semantic keys to those variables.

### 3.2 Tailwind / utility mapping
- Map semantic color keys (`bg-background`, `text-foreground`, etc.) to CSS variables.
- Map typography tokens to semantic font sizes (`text-heading-1`, `text-body`, etc.).
- Add a controlled alias layer for prototype scales if needed (e.g., `brand-*`, `neutral-*`).

### 3.2.1 Do not duplicate token sources
Choose one runtime truth for colors (recommended: CSS variables) and ensure that:
- Tailwind config reads from variables
- Component code never embeds raw hex/rgb/hsl values

### 3.3 Motion + keyframes
If the prototype uses embedded `<style>` tags for keyframes:
- Move keyframes into the DS layer (global CSS `@layer utilities` or Tailwind `keyframes/animation`).
- Use named tokens/classes like `animate-ken-burns`, `animate-fade-in-up`.

### 3.4 Glass surfaces
If the prototype uses repeated glass patterns:
- Create **named DS utilities** or primitives:
  - `Surface variant="glass"`
  - `className="surface-glass"`
- Tokenize blur, alpha backgrounds, and border alpha.

---

## Phase 4 — Build/Refine Primitives (Minimum Viable Set)
Start with what the prototype uses most:
1. Typography (Heading/Text)
2. Button (variants + sizes + loading)
3. Input (label + error + icons + focus)
4. Card/Surface (default + glass + highlight)
5. Badge / Divider / Spinner

Rules:
- Primitives may expose `variant`/`size` props, but the underlying styling must be token-driven.
- Avoid “random new variants” not present in the prototype.
- If the prototype uses a pattern repeatedly (e.g., focus ring offset), implement it once centrally.

---

## Phase 5 — Refactor App Components (Apply DS Without Rewriting)
This is the fastest, safest path:

### 5.1 Refactor order (saves time)
1. **Shared primitives first** (Button/Input/Typography/Card)
2. **High fan-out components** (Header/Nav/Footer)
3. **Page sections** (Hero sections, cards, forms)
4. **Long tail** components

### 5.2 Refactor method
- Replace raw prototype classes with DS tokens/classes.
- Prefer swapping components (use DS `Button` instead of local `button + classes`).
- Preserve DOM structure where pixel-perfect is sensitive.
- Do not change business logic.

### 5.3 Codemod approach (recommended)
To avoid hand-editing hundreds of class strings:
- Create a codemod that rewrites common patterns:
  - raw typography (`text-4xl`, `text-xs`) → semantic typography (`text-heading-1`, `text-micro`)
  - palette colors (`bg-slate-900/40`) → semantic backgrounds (`bg-background/40`)
  - hardcoded whites (`border-white/10`) → semantic borders (glass border token)
  - arbitrary sizes (`h-[240px]`) → named utilities (`h-hero-headline-md`) or layout tokens

---

## Phase 6 — Remove Legacy Styling + Enforce
Only after enough refactoring is complete:
1. Remove legacy/global CSS sources that conflict with DS.
2. Turn on enforcement in CI/local scripts:
   - Fail builds on hardcoded colors/arbitrary values/raw typography.
3. Expand enforcement scope gradually:
   - Start with new DS + new UI folder
   - Expand to all UI components

---

## Audit & Detection Rules (Universal)
Run these audits on both:
- Prototype import folder (if you temporarily copy components into the app)
- Production app `src/**`

### A) Color literal detection
- Hex: `#[0-9a-fA-F]{3,8}`
- RGB/RGBA: `rgb\(|rgba\(`
- HSL/HSLA: `hsl\(|hsla\(`

### B) Raw palette utility detection (Tailwind)
Detect usage like `bg-slate-900`, `text-gray-300`, `border-white/10`.

### C) Arbitrary value detection
Detect `*-[]` or `[...]` tokens:
- `\[[^\]]+\]`

### D) Raw typography detection
Detect:
- `text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)`
- `font-(bold|semibold|extrabold|...)`

### E) Inline style / embedded style detection
Detect:
- `style={{`
- `<style>` inside components

### Recommended execution patterns
Provide both ripgrep and PowerShell styles for portability:

**ripgrep (mac/linux/windows):**
- `rg "#[0-9a-fA-F]{3,8}" src`  
- `rg "rgba?\\(" src`  
- `rg "\\[[^\\]]+\\]" src`  

**PowerShell:**
- `Select-String -Path "src\\**\\*.{ts,tsx,js,jsx,css}" -Pattern "#[0-9a-fA-F]{3,8}" -AllMatches`

### Audit outputs (required)
For each adoption effort, store:
- `prototype-audit.md` (human-readable findings)
- `prototype-token-extract.json` (raw extracted colors/fonts/etc.)
- `prototype-to-ds-mapping.md` (the mapping table)
- `ds-verify-report.json` or `ds-verify-report.md` (if available)

### If the repo has a DS verify script
- Run the DS verify script against the target folder.
- Required output should be “0 violations” (unless an explicit allowlist exists).

---

## Planning Template (Copy/Paste)
Create a short plan before implementation:

1. **Prototype inventory**
   - entrypoints:
   - token sources:
   - key components:
2. **Token mapping decisions**
   - semantic colors:
   - scales needed?:
   - typography scale:
   - shadows + glass:
   - motion:
3. **Primitives to build first**
4. **Refactor order**
5. **Protected zones**
6. **Verification gates**

---

## Verification Gates (Definition of Done)
Minimum gates:
- Typecheck passes
- Production build passes
- DS verify/audit passes (no hardcoded colors/arbitrary values/raw typography in governed folders)
- Visual checks:
  - Key pages match prototype across 5 breakpoints (or your breakpoint set)
  - Focus/hover/active/loading states match
  - No regressions in protected zones

---

## Common Pitfalls (Avoid Wasted Time)
- **Token drift:** creating token names that don’t match how people think (semantic first).
- **Hybrid styling:** mixing old + new systems in the same component.
- **Hidden one-offs:** leaving `border-white/10`, `bg-slate-900/40`, or `text-[10px]` scattered across the app.
- **Inline keyframes:** per-component `<style>` tags that become ungovernable.
- **Refactoring logic accidentally:** keep styling-only diffs styling-only.

---

## Notes for This Repo (Optional, if present)
If your host repo already has DS enforcement scripts and semantic Tailwind mapping:
- Prefer extending the existing DS rather than creating a parallel system.
- Add compatibility aliases (brand/neutral scales, ring offsets, motion utilities) centrally.
- Use a codemod to convert prototype raw utilities into semantic tokens.

Examples of typical “already present” tooling you can wire into this workflow:
- A DS enforcement gate script (e.g., `scripts/design-system-verify.ts`) to block hardcoded styles.
- A class usage audit (e.g., `scripts/audit-css-classes.ts`) to identify the worst offenders.
- A keep/remove audit generator (e.g., `scripts/frontend-purge-audit.ts`) if you’re doing any targeted cleanup.
- Build/typecheck gates (run via tasks or commands) before and after each migration slice.

