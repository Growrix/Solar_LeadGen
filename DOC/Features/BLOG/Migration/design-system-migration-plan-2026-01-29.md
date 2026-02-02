# Design System Migration Plan (Industry Standard) — 2026-01-29

## Goal
Create a **single-source-of-truth**, industry-standard design system + component library so:
- Tokens/themes are consistent and centrally managed
- Semantic Tailwind classes remain stable (minimal component refactor)
- Future AI/codegen cannot introduce token/class chaos

**Design System SOT:** `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

---

## Current Reality (Revalidated)
Primary runtime tokens are CSS variables in `src/app/globals.css`, and Tailwind semantic classes map to those variables in `tailwind.config.js`. Theme is applied via `src/components/ThemeProvider.tsx`.

---

## Principles (Lock Rules)
1. **One token source of truth:** runtime CSS variables (themeable tokens).
2. **One theme mechanism:** `<html>` has exactly one of `theme-dark|theme-light|theme-purple` applied.
3. **Semantic Tailwind only:** components use semantic classes (`bg-background`, `text-foreground`, etc.).
4. **No hardcoded styling values:** forbid `#hex`, `rgb(a)`, and Tailwind arbitrary values unless explicitly approved.

---

## Phase 0 — Baseline & Safety Gates
**Objective:** establish a clean baseline before migration.

- Run:
  - `npx tsc --noEmit`
  - `npm run build`
- Snapshot key files (git history is enough):
  - `src/app/globals.css`
  - `tailwind.config.js`
  - `src/components/ThemeProvider.tsx`
  - `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/Design-System.md`

---

## Phase 1 — P0 Fixes (Correctness)
### 1.1 Tailwind dark selector alignment
**Problem:** Tailwind `dark:` variants won’t work if the app uses `theme-dark` but Tailwind expects `dark`.

**Change:** Configure Tailwind dark selector to match `.theme-dark`.

**Acceptance:** any `dark:*` utilities behave correctly when `<html class="theme-dark">`.

### 1.2 Implement real “system theme” behavior
**Problem:** `theme-system` exists but has no tokens and doesn’t map to OS preference.

**Change:** If user selects `system`, compute actual theme as `dark|light` using `prefers-color-scheme`, apply the corresponding `theme-dark|theme-light` class, and listen for OS changes.

**Acceptance:** system theme matches OS and updates on OS theme change.

### 1.3 Make theme class application safe
**Problem:** `document.documentElement.className = …` can wipe unrelated `<html>` classes.

**Change:** manipulate `classList` (remove known theme classes, add the computed theme).

---

## Phase 2 — Token Unification (Industry Standard)
### 2.1 Declare CSS variables as the canonical token source
**Decision:** Colors, shadows, radii, motion, z-index live as CSS vars in `src/app/globals.css`.

### 2.2 De-conflict TS token files
**Problem:** `src/design-tokens/semantic/colors.ts` and `src/design-tokens/themes/default-theme.ts` describe different brand directions than `globals.css`.

**Action options (choose one):**
- Option A (recommended): Deprecate TS color/theme files for now (keep typography/spacing/shadows/borders/animations if used).
- Option B: Update TS token files to match the CSS variable design system and document the relationship.

**Acceptance:** there is exactly one “truth” for colors in docs + code.

---

## Phase 3 — Component Library (Build & Lock)
**Objective:** move from “semantic classes scattered everywhere” to a reusable library.

- Create `src/components/ui/` primitives:
  - Button, Card, Input, Select, Badge, Modal/Dialog, Drawer/Sheet, Toast wrapper
- Each component uses only semantic classes defined by the design system.
- Publish usage patterns in docs:
  - “Use `<Button variant="primary" />` instead of re-assembling class strings.”

**Acceptance:** new UI is built from the library; ad-hoc styling decreases over time.


## Phase 4 — Enforcement (Automated Gate)
**Objective:** Prevent new design-system drift and ensure all new UI work is AI/codegen-safe.

- All new or modified code in `src/components/ui/**` must pass:
  - `npm run ds:verify` (strict, fails on any violation)
- For legacy code and backlog sizing, use:
  - `npm run ds:audit` (report-only, whole app)
- Violations include:
  - Hardcoded Tailwind palette colors (e.g., `bg-slate-200`)
  - Direct `bg/text-(black|white)` usage
  - Tailwind arbitrary values (e.g., `w-[123px]`)
  - Raw typography classes (e.g., `text-lg`, `font-bold`)
  - `transition-all` and manual responsive typography
- Rationale: This gate ensures the design system remains enforceable for both humans and AI/codegen, and that all new UI work is future-proofed against drift.

## Phase 4 — Enforcement (Prevent AI Chaos)
**Objective:** automated checks block drift.

- Add CI/script checks (regex scans) to block:
  - `#hex`, `rgb(`, `rgba(` in components
  - Tailwind arbitrary values `[...]` (unless whitelisted)
  - (Optional) direct `dark:` usage if you want everything driven only by theme CSS variables

**Acceptance:** PRs fail if rules are violated.

---

## Phase 5 — Verification
- Run:
  - `npx tsc --noEmit`
  - `npm run build`
- Manual checks:
  - Toggle Dark/Light/Purple
  - Toggle System theme (and change OS theme)
  - Smoke test key pages

---

## Rollback Strategy
- All changes are incremental and git-revertable.
- Theme changes are isolated to:
  - `tailwind.config.js`
  - `src/components/ThemeProvider.tsx`

