# Option A Playbook — Prototype (Google AI Studio/Vite) → Next.js (App Router)

**Status**: Active Workflow (Documentation-first)

Purpose: define a reusable, low-risk process to migrate a prototype UX into this repo’s **Next.js + TypeScript + multi-theme neumorphic design system**, without AI drift.

This playbook is designed to be reused for **every future feature** that starts as a prototype.

---

## Authority (read order)

1) `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md`
2) `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md`
3) `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`
4) `DOC\GUIDELINES & SOT\IMPLEMENTATION SOT\Migration_plan.md`

If any conflict exists, higher authority wins.

---

## Core Rule: Docs Lock Before Code

No implementation work may begin until ALL of these are true:

- `DOC/Features/<Feature>/SOT/Frontend-Plan.md` exists, is approved, and is referenced by `SOT/INDEX.md`.
- `DOC/Features/<Feature>/SOT/CURRENT-UI-AUDIT-*.md` exists (if feature touches existing UI) and is referenced by `SOT/INDEX.md`.
- Scope is locked (In Scope / Out of Scope explicitly listed).

---

## What “Option A” means in this repo

Option A = implement directly in the production Next.js app:

- Default: the chosen prototype version is the **UI SOT** and must be migrated **prototype-preserving**.
  - Preserve UI composition, layout, triggers, modals, and labels.
  - Allowed changes only: semantic token `className` swaps + minimal wrapper/layout adjustments required for Next.js embedding.

Mandatory sequencing (2-part migration):
- Part 1: Structural mirror (match prototype file/component boundaries; hub thin; UI preserved)
- Part 2: Design-system compliance (tokenization + class contracts + multi-theme + verification gates)
- Any alternative approach ("prototype as UX reference only" / redesign / rebuild) must be explicitly approved and recorded in the feature SOT before implementation.

Authoritative contract:
- `DOC/GUIDELINES & SOT/README.md` → “Prototype-Preserving Migration Contract (Vite Prototype → Next.js)”

The Next.js implementation must follow:
  - semantic tokens only (no hardcoded colors, no `dark:`)
  - multi-theme support (Dark/Light/Purple)
  - existing layout/routing patterns (admin chrome, app router conventions)

---

## Drift Prevention (Stop Rules)

When executing Option A:

- Do not add any pages/modals not listed in `Frontend-Plan.md`.
- Do not “improve” UX beyond the plan.
- If a new UX need is discovered, stop and update the plan first.
- Do not introduce new design tokens or new Tailwind color stacks.
- Do not mix legacy classes with new semantic tokens (“no hybrid”).

---

## Scope Lock Template (copy into every `Frontend-Plan.md`)

- Baseline contract: existing UI will not be lost.
- In Scope: exact routes, tabs/sections, modals, confirmations.
- Out of Scope: backend, auth changes, prototype extras, unrelated scaffolding.
- Locked decisions: routing decisions, visibility rules, minimum share behavior, etc.

---

## Execution Checklist (Engineering)

### A) GATE 0 health check (required)
Run:
- `npx tsc --noEmit`
- `npm run build`
- `npm run dev`
- `npx prisma validate`

### B) Logic audit (required)
Before migrating/implementing UI:
- Write a logic audit report that lists:
  - routes touched
  - components to be created/modified
  - modal flows + entry/exit points
  - any stored state (local/session storage) and why

### C) Component tree mapping (required before claiming “done”)
- Identify all child components rendered by any page being migrated.
- Verification must cover the full tree, not only the page file.

### D) Verification (hardcoded style bans)
Run the full verification command set from `DESIGN-SYSTEM-SOT.md`.
Expected result: **0/0/0/0/0/0** before marking any component/page complete.

### E) Manual checks (required)
- Dark theme: pass
- Light theme: pass
- Purple theme: pass
- Responsive: 320 / 375 / 768 / 1024 / 1440
- Accessibility: keyboard + focus + ARIA + contrast

### F) Build validation (required)
- `npx tsc --noEmit`
- `npm run build`

### G) Atomic commits (required)
- One component/page per commit.

---

## Handling “WIP code exists before docs lock”

If implementation code was created before documentation lock:

- Do not extend it.
- Decide explicitly:
  - **Revert it** (preferred if it risks drifting from plan), OR
  - **Keep it as WIP** but treat it as non-authoritative until `Frontend-Plan.md` is approved.

Either way, the authoritative source remains the locked documentation, not the existing WIP.

---

## Completion Definition (Option A)

Option A is complete only when:

- All routes and modals listed in the locked `Frontend-Plan.md` exist and behave as specified.
- Verification commands return 0/0/0/0/0/0 across the full component tree.
- Dark/Light/Purple manual checks pass.
- `npx tsc --noEmit` and `npm run build` succeed.

End.
