## 3) Non-negotiable constraints (from repo standards)

### 3.1 The 13-step migration workflow is mandatory
### 3.2 Design token rules (high-level)

From `DESIGN-SYSTEM-SOT.md` (examples):
### 3.3 Component tree rule

Migration is not “done” until **the page file and all child components** are verified clean.
### 3.4 Next.js maintainability rule (mandatory)

Prototype-preserving migration applies to **rendered UI/UX** (structure, labels, triggers, modals, flows). It does **not** justify shipping a single-file “mega component”.
### Step 3 — Ensure flows match V6 (before tokenization)

Output: Next.js UI that matches V6 end-to-end in **behavior and structure**.
**MANDATORY 2-PART MIGRATION SEQUENCE:**

1. **Structural mirror (UI preserved):**
  - Mirror V6 file/component boundaries (tabs, modals, shared helpers).
  - Wire all triggers so the rendered UI/UX matches V6 end-to-end.
  - Do not combine this with mass token/class rewrites unless a blocker forces it.

2. **Design-system compliance (tokenization + class contracts):**
  - Replace all prototype styling with repo semantic tokens (no hardcoded palette, no `dark:`).
  - Fix any repo-enforced `className` violations so commits/builds pass.
  - Run all multi-theme and hardcoded-style verification gates.

Reference: See `DOC/GUIDELINES & SOT/README.md` → “Prototype-Preserving Migration Contract (Vite Prototype → Next.js)” → “Two-Part Migration Strategy (Mandatory)”.

Output: Next.js UI that matches V6 end-to-end in **behavior and structure** (after Part 1), and passes all repo design-system and verification gates (after Part 2).
# NEWS ENGINE — Prototype → Next.js Migration Plan (Theme-Semantic + E2E Flow Safe)

**Status**: Draft (Plan)

---

## Execution Scope (Current Run)

Per latest instruction, this execution is scoped to **public News only**:
- `/news` (listing)
- `/news/[slug]` (details)
- Share modal (Copy Link)

This plan may include additional admin-related notes for completeness, but they are **not to be executed** as part of this scoped run.

**Purpose**
You already finalized the UI/UX flow in the Google AI Studio prototype, but:
- It is not semantic to the repo’s neumorphic theme system.
- It likely contains hardcoded Tailwind colors (`bg-slate-*`, `text-gray-*`, `dark:*`, etc.).
- It is exported as a Vite/React app, while this repo is **Next.js 14 (App Router) + TypeScript + Tailwind**.

This plan defines how to migrate the prototype into the real Next.js app **without losing E2E flow**, while ensuring **zero hardcoded styling** and **multi-theme compatibility**.

---

## 0) Inputs / Authority

### Must follow (repo authority)
- Global workflow index: `DOC/GUIDELINES & SOT/README.md`
- Design tokens & neumorphic rules: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md`
- Migration workflow (mandatory): `specs/007-migration-and-build/plan.md`

### Feature-specific references
- Audit report (authoritative for current work): `DOC/FEATURES/NEWS ENGINE/Audit Reports/v6-vs-current-nextjs-audit-2026-01-03.md`
- News Engine planning SOT: `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
- Admin frontend plan: `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-plan-admin.md`
- Public frontend plan: `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-plan-public.md`
- Prototype export(s): `DOC/FEATURES/NEWS ENGINE/GoogleAIStudio UI UX/*` (**UI SOT**; use the chosen authoritative version only)

### Migration playbook (explicit reference)
- Option A playbook: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/PROTOTYPE-TO-NEXTJS-OPTION-A-PLAYBOOK.md`

---

## 1) What the audit report says (must address before migration)

The audit report identifies **E2E UI blockers** (even for UI-only state) in the prototype:

### Critical missing UI endpoints
1) **Drafts & Reviews → Review modal** is not wired.
2) **Automation Control (Pause/Resume/Emergency)** does not open confirmations.
3) **Audit Logs → Prompt details** button has no endpoint.
4) **Test & Preview** footer actions (“Simulate Publish”, “Save to Drafts”) are not wired.
5) Multiple toggles are **no-op** (UI shows switches, but state doesn’t change / no feedback).

**Rule for migration**:
> We do NOT start styling/theme migration until these interaction endpoints are explicitly defined and implemented in the Next.js version (UI-only behavior is fine). Otherwise we risk “pretty UI” that doesn’t preserve the flow.

---

## 2) Migration goals (your requirements)

### A) Preserve E2E flow
- The Next.js implementation must preserve the same page→modal→action transitions described by the SOT and audit report.

### A2) Preserve prototype UI/UX exactly (prototype-locked)
- The authoritative prototype (V6) is the UI SOT.
- Migration must keep:
  - UI composition and structure
  - layout and column structures (tables/boards)
  - labels and button placement
  - triggers, modals, and their internal steps/tabs

### B) Make UI semantic to the project theme system
- Remove hardcoded colors, dark-mode prefixes, and typography utilities that violate the design system.
- Use semantic design tokens only (e.g., `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, neumorphic shadows).

### C) Migrate from Vite to Next.js
- Prototype UI composition is **ported 1:1** into `src/` (inside this repo’s Next.js structure).
- Only the following changes are allowed during migration:
  - `className` swaps to semantic tokens
  - minimal wrapper/layout adjustments required to render inside the existing app shell
  - minimal accessibility attribute additions if required for correctness
- Do **NOT** redesign or substitute alternative UIs.

---

## 3) Non-negotiable constraints (from repo standards)

### 3.1 The 13-step migration workflow is mandatory
For each migrated component/page, we must follow `specs/007-migration-and-build/plan.md`:
1) Gate 0 checks
2) Logic audit report (what must not change)
3) Pre-verification scan
4) UI-only migration
5) Post-verification scan (0/0/0/0/0/0)
6–8) Test Dark/Light/Purple
9) Responsive
10) A11y
11) Functionality preserved
12) Build validation (`npx tsc --noEmit`, `npm run build`)
13) Commit atomically

### 3.2 Design token rules (high-level)
From `DESIGN-SYSTEM-SOT.md` (examples):
- Structural containers: `bg-background`
- Elevated surfaces (cards/modals/inputs): `bg-surface` + neumorphic shadow
- Avoid hardcoded palette classes (`bg-slate-*`, `text-gray-*`, `border-gray-*`, `dark:*`, `bg-white`, `text-black`, etc.)

### 3.3 Component tree rule
Migration is not “done” until **the page file and all child components** are verified clean.

### 3.4 Next.js maintainability rule (mandatory)
Prototype-preserving migration applies to **rendered UI/UX** (structure, labels, triggers, modals, flows). It does **not** justify shipping a single-file “mega component”.

Primary rule (lowest risk):
> If the authoritative prototype already has separate files/components, mirror that structure in Next.js.

Required constraints:
- Keep route/page/hub files thin (orchestrate state + composition only).
- Mirror prototype component boundaries (tab = module, modal = module).
- Shared helpers/types belong in feature-scoped utilities (or existing shared libs), not embedded inline everywhere.

Stop rule:
> If a migration requires adding another major tab/modal/surface into an already-large hub file, stop and perform a UI-preserving component extraction refactor first.

---

## 4) The key decision: reduce migration pain BEFORE migration

You’re right: the best way to reduce migration time is to do “pre-migration work” that produces a clearer blueprint.

We will do this in two tracks (you can choose one or run both):

### Track A — Build directly in Next.js (recommended)
Use the prototype as **visual reference only**, and implement the Next.js UI using the existing SOT + the audit’s endpoint requirements.
- Pros: Avoids prototype rework churn; guarantees output matches the real stack.
- Cons: Migration work happens in the real codebase sooner.

### Track B — Harden the prototype first (optional)
Use Google AI Studio to produce a “Migration-Friendly Prototype” that is:
- Tokenized (uses semantic tokens, not hardcoded Tailwind palette)
- End-to-end wired (all missing UI endpoints implemented)
- Next.js-friendly (no Vite assumptions in component design; routing described in Next.js terms)
- Pros: Less guesswork during implementation; clearer handoff.
- Cons: Still can’t output a true Next.js app; adds extra prototype iteration time.

This plan includes an optional prompt pack for Track B.

---

## 5) Concrete execution plan (what we will do)

### Step 0 — Confirm authoritative prototype scope
Because multiple prototype versions can exist historically, we must choose one as the UI reference for implementation.
- If you confirm: “Use V6 only”, we treat `ai-news-engine-admin- V6/` as the sole reference.
- If you want to use this audit report as the truth source, we treat it as authoritative for “what must be wired”.

Output: a single sentence decision recorded at the top of the implementation audit.

### Step 1 — Create a Next.js target surface map (pages + modals)
Create a short mapping table (for the migration team/AI) that lists:
- Public routes (e.g., `/news`, `/news/[slug]`)
- Admin routes (under your admin area — do not invent new navigation patterns)
- Global modals (Review/Schedule/TestPreview/Rewrite/Reject/Source/Confirmation/PromptDetails/Share)

Output: a “surface map” section in the migration audit so nothing is forgotten.

### Step 1.5 — Create a component boundary + file map (required)
Before porting UI, define where each V6 surface will live in the Next.js codebase.

Rules:
- Mirror the prototype’s existing file/component boundaries (do not invent a new structure unless the prototype lacks one).
- One tab = one component module; one modal = one component module.
- The hub/page file should mostly assemble: state + handlers + tab switch + modal open/close.

Output: a short “File Map” section recorded alongside the surface map so the migration stays prototype-accurate and maintainable.

### Step 2 — Logic audit (E2E flow that must be preserved)
Based on the audit report, explicitly list:
- Trigger → Result transitions
  - Draft card click → opens Review modal
  - Control action click → opens Confirmation modal
  - Prompt icon click → opens Prompt Details
  - TestPreview complete → Save to Drafts / Simulate Publish works
- State changes (UI-only is acceptable at first)

Output: logic audit section used as a “do not break” contract.

### Step 3 — Ensure flows match V6 (before tokenization)
In the Next.js version, ensure all flows/triggers/modals match the authoritative prototype.
- If the prototype includes behavior, match it exactly.
- If something is ambiguous/missing, follow the feature SOT + frontend plan prompts without introducing new UX surfaces.

Output: Next.js UI that matches V6 end-to-end in **behavior and structure**.

### Step 4 — Tokenize + semanticize UI (component-by-component)
For each page/component, run the 13-step migration workflow:
- Pre-scan for forbidden classes
- Replace with semantic tokens only
- Post-scan must return 0 matches for all verification commands
- Then test themes/responsive/a11y

Output: fully theme-compliant UI.

### Step 5 — Confirm build safety
After each major chunk:
- `npx tsc --noEmit`
- `npm run build`

Output: no regression risk.

---

## 6) Suggested sequencing (lowest risk first)

### Phase 1: Public pages first
- `/news` listing
- `/news/[slug]` details
- Share modal (minimal copy-link first; avoid hardcoded social brand colors)

Why: lowest coupling to admin systems, easiest to validate.

### Phase 2: Admin shell pages (structure only)
- Dashboard
- Drafts & Reviews
- Sources & Research
- Schedule & Automation
- Automation Control
- Audit & Logs
- Settings

### Phase 3: Modals (flow-critical)
- Review modal
- Scheduling modal
- Confirmation modal (Pause/Resume/Emergency/Publish)
- Prompt Details modal
- Test & Preview modal
- Rewrite / Reject
- Source add/edit

---

## 7) Definition of Done (migration)

A migration is “done” only when:
- E2E flow is preserved (audit endpoints implemented)
- ALL migrated files and their child components pass verification (0/0/0/0/0/0)
- Dark/Light/Purple themes look correct
- Responsive works at 320/375/768/1024/1440
- Accessibility is acceptable (keyboard + contrast + ARIA)
- `npx tsc --noEmit` and `npm run build` succeed

---

## 8) Risks & mitigations

### Risk: The prototype uses hardcoded Tailwind palette everywhere
Mitigation: treat prototype as reference only; do not copy classNames. Use semantic tokens from day 1.

### Risk: Missing endpoints cause “dead UI” after migration
Mitigation: implement missing endpoints first (Step 3), before polishing UI.

### Risk: Component tree verification missed
Mitigation: every migration task must include dependency mapping and scans across child components.

---

## 9) Optional: If you want to iterate in Google AI Studio first (Prompt Pack)

If you choose Track B (harden prototype first), see:
- `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/prototype-hardening-prompts-V7.md`

This will:
- Remove no-op toggles
- Wire missing endpoints
- Reduce hardcoded UI
- Make the exported prototype closer to your theme system conventions

---

## 10) Next action (your choice)

Choose one:
1) **Proceed with Track A** (Next.js implementation first; prototype is a reference)
2) **Run Track B first** (produce a hardened prototype V7 using the prompt pack), then implement in Next.js

Once you confirm, we can create an execution tracker in `specs/<news-engine>/tasks.md` (following `.specify/templates/tasks-template.md`).
