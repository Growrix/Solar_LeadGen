# SolarConnect (DOC/solarconnect) vs Current SolarMatch Design System (src/design-tokens) — Deep Dive + Minimal-Change Strategy

Date: 2026-02-03

## Executive Summary
You *can* make the Next.js app look like the SolarConnect prototype **without rewriting every component**. The key is to treat SolarConnect as:
1) a **visual target** (palette/typography/shadows/motion), and
2) a **component/class-pattern source**, but not a production-ready DS implementation.

The biggest reason you’re seeing “partial” results even after global updates is **not** Next.js vs Vite. It’s that the production app currently has **multiple styling sources** (semantic tokens + legacy/hardcoded Tailwind utilities + a few TS color sources), so global token changes only affect the parts that actually use the semantic layer.

Recommended minimal path:
- Keep the current semantic system (CSS variables + Tailwind semantic keys + `src/design-tokens`),
- Add a small “SolarConnect compatibility pack” centrally (aliases + utilities + animations) so SolarConnect components can drop in,
- Add a one-time codemod/migration step that converts SolarConnect’s raw Tailwind typography/colors/arbitrary values into your existing semantic classes (so DS audits don’t fight you).

This yields a fast result with controlled scope and avoids a full frontend rewrite.

---

## 1) What SolarConnect Actually Is (Prototype DS)
SolarConnect in `DOC/solarconnect` is a **Vite + Tailwind CDN prototype**.

Key properties:
- Tailwind config is injected at runtime in `index.html` (CDN mode).
- It defines **literal color palettes** (hex) for `brand` and `slate`.
- Components use **raw Tailwind classes** (e.g., `text-4xl`, `bg-slate-900/40`, `border-white/10`, `shadow-brand-500/20`).
- It contains **inline styles** / per-component keyframes in some places (e.g., Hero).

This is normal for a prototype: it optimizes for speed and visual iteration, not governance.

### Why this matters
Your production design system is governance-oriented:
- “No hardcoded colors”, “no raw typography utilities”, “no `dark:`”, “no arbitrary values”.

SolarConnect does the opposite (by design): it hardcodes the palette and uses raw utilities.

---

## 2) What the Current Production DS Actually Is
SolarMatch production DS is structured as:

### A) Runtime truth via CSS variables
- `src/app/globals.css` holds theme variables: `--color-background`, `--color-foreground`, etc.
- Theme switching is via `<html class="theme-dark">` etc (`src/components/ThemeProvider.tsx`).

### B) Tailwind semantic mapping
- `tailwind.config.js` maps semantic colors like `bg-background` → `rgb(var(--color-background) / <alpha-value>)`.
- Typography uses semantic sizes like `text-heading-1` generated from `src/design-tokens/semantic/typography.ts`.

### C) TS token modules
- `src/design-tokens/**` provides semantic spacing/shadows/typography/animations.
- IMPORTANT: `src/design-tokens/index.ts` intentionally does **not** export runtime color tokens to avoid “two sources of truth”.
- There are still primitive palettes / deprecated color modules present for historical reasons.

### D) Governance gate
- `scripts/design-system-verify.ts` enforces rules mainly for `src/components/ui/**` by default.
- The broader app may still contain legacy/hardcoded utilities outside that folder.

---

## 3) Why Global Token Updates Still Look “Partial”
Even if “most” components use semantic tokens, **a small percentage of hardcoded utilities can dominate the look**.

Typical root causes (we observed evidence of these patterns in `src/`):

### 3.1 Hardcoded Tailwind colors bypass CSS variables
If a component uses `bg-slate-900/40`, that is a fixed palette-based color (even if you alias some scales).
If it uses `border-white/10`, your semantic system can’t override “white”.

### 3.2 Raw typography utilities bypass semantic typography
SolarConnect uses `text-4xl`, `text-xs`, `font-bold`, etc.
Your DS expects `text-heading-1`, `text-body`, `text-micro`, etc.

So even after updating typography tokens, any leftover `text-3xl` or `text-sm` will not change.

### 3.3 Arbitrary values are “visual hotspots”
SolarConnect uses things like:
- `text-[10px]`
- `scale-[1.02]`
- `h-[200px]`

These create noticeable differences. Even if 90% is semantic, these 10% spots keep the design from matching.

### 3.4 Multiple token sources still exist in the repo
Example: chart colors are partially hardcoded (e.g., teal/yellow/green/red hex values) and partially read from CSS vars.
So some UI areas may remain “old brand” even after your global palette changes.

### 3.5 Theme + component-library differences
SolarConnect is effectively **dark-only** and tuned around `bg-slate-900` canvas.
If your app still renders some surfaces/typography assuming older light/neumorphic tokens in certain places, you’ll see inconsistencies.

---

## 4) Next.js vs Vite: Is That the Cause?
Not really.

- Next.js vs Vite impacts bundling, routing, server rendering, and asset handling.
- **Design system portability** is mostly about:
  - Tailwind config
  - CSS variable strategy
  - component class patterns

You can reproduce the SolarConnect look in Next.js perfectly.
The issue is the *implementation style* (prototype raw utilities vs governed semantic tokens), not the framework.

---

## 5) Options to Solve This (Tradeoffs)

### Option A — Compatibility Pack + Codemod (Recommended)
**Goal:** Use SolarConnect components quickly while preserving your production DS governance.

What you do:
1) Keep current semantic tokens + Tailwind mapping.
2) Add a small compatibility layer centrally:
   - `brand-*`, `slate-*` alias to CSS vars
   - `ring-offset-slate-900`
   - animations used by SolarConnect (`fade-in-up`, `ken-burns`)
   - glass utility classes
   - a few allowed `scale-*` steps (e.g., `scale-102`)
3) Add a simple codemod script:
   - Convert SolarConnect raw typography → semantic typography
   - Convert hardcoded whites (`border-white/10`, `bg-white/10`) → semantic glass border/background utilities
   - Convert raw slate usage (`bg-slate-900/40`) → `bg-background/40` or `bg-surface/40` equivalents

Pros:
- Minimal refactor of existing app.
- Fast path to “looks like SolarConnect”.
- Keeps governance and prevents regression.

Cons:
- Requires a one-time “import pipeline” (codemod) for SolarConnect components.
- You maintain a small compatibility set.

### Option B — Full DS replacement (tokens only), keep components
**Goal:** Change look via `globals.css` + token modules only.

Pros:
- Fast to implement.
- No component changes *if* everything is truly semantic.

Cons:
- In reality, it stays partial because legacy/hardcoded classes still exist.
- You will keep chasing “why this page still looks off”.

### Option C — Rewrite frontend UI layer (hard reset)
**Goal:** Replace old component library with SolarConnect UI primitives and rebuild screens.

Pros:
- Cleanest outcome.
- No hybrid tech debt.

Cons:
- Highest time cost.
- Requires re-implementing UI logic patterns screen-by-screen.

---

## 6) Recommended Strategy (Minimal + Reliable)
Choose Option A.

### Phase 0 — Lock SolarConnect as visual SOT (you already started)
- Tokens match SolarConnect palette/typography.
- Tailwind semantic mapping stays stable so old components don’t break.

### Phase 1 — Build “SolarConnect Compatibility Pack” (central only)
Target: “A SolarConnect component can be dropped into `src/` and work with little/no edits.”

Compatibility items (highest leverage):
- `colors.brand.*` and `colors.slate.*` mapping to CSS variables
- `ringOffsetColor['slate-900']` mapping to background token
- `animate-fade-in-up` + `animate-ken-burns`
- `.surface-glass` / `.card-glass`
- scale steps: `scale-102`

### Phase 2 — Add a codemod/import tool (the real unlock)
This is how you avoid refactoring everything manually.

Codemod rules (examples):
- `text-[10px]` → `text-micro`
- `text-xs`/`text-sm`/`text-xl` → semantic tokens where appropriate
- `text-white` → `text-foreground-secondary` or a semantic inverted token
- `border-white/10` → a semantic glass border class (e.g., `border-neutral-100/10` or a named utility)
- `bg-slate-900/40` → `bg-background/40`
- `bg-slate-800/90` → `bg-surface/90`

Result:
- Imported SolarConnect components start passing your DS verify rules.
- The app becomes consistent without hand-editing every file.

### Phase 3 — Expand enforcement scope *after* migration
- Keep `design-system-verify` default narrow while you migrate.
- Once migrated, expand the gate to cover more of `src/components/**`.

---

## 7) Why You’re Confused (and how to think about it cleanly)
You’re comparing:
- SolarConnect: **raw Tailwind + literal palettes** (fast prototype)
- SolarMatch: **semantic Tailwind + CSS vars + governance** (production DS)

They’re different *by intent*.

The clean mental model:
- SolarConnect defines the *visual language*.
- SolarMatch DS defines the *enforceable implementation*.
- Your job is to map SolarConnect visuals onto SolarMatch semantics once, centrally.

---

## 8) Concrete “Definition of Done”
You’ll know you’re finished when:
- Dropping SolarConnect components into `src/components/solarconnect/**` + running codemod results in:
  - no raw typography utilities
  - no hardcoded whites/blacks
  - no arbitrary values (or only sanctioned exceptions)
  - no `dark:` variants
- `npm run build` stays green.
- Visually: hero, cards, buttons, typography match the SolarConnect prototype within an acceptable tolerance.

---

## 9) Next Actions I Recommend
1) Run a one-time scan report over `src/` to list the **top 20** styling violations causing mismatch (raw typography + hardcoded colors + arbitrary values).
2) Implement the codemod script focused on the 5–10 most common patterns.
3) Add a dedicated folder for imported SolarConnect components (so you can migrate gradually without touching stable screens).

If you want, I can implement (1) + (2) as scripts so you can run:
- `npm run ds:audit` (existing)
- `npm run solarconnect:codemod -- path/to/component.tsx`

and have it automatically rewrite the common offenders.
