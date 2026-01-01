# NEWS ENGINE — Prototype → Next.js Migration Plan (Theme-Semantic + E2E Flow Safe)

**Status**: Draft (Plan)

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
- Audit report (latest referenced): `DOC/FEATURES/NEWS ENGINE/Audit Reports/prototype-audit-google-ai-studio-uiux.md`
- News Engine planning SOT: `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
- Admin frontend plan: `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-plan-admin.md`
- Public frontend plan: `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-plan-public.md`
- Prototype export(s): `DOC/FEATURES/NEWS ENGINE/GoogleAIStudio UI UX/*` (treat as UX reference, not production code)

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

### B) Make UI semantic to the project theme system
- Remove hardcoded colors, dark-mode prefixes, and typography utilities that violate the design system.
- Use semantic design tokens only (e.g., `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, neumorphic shadows).

### C) Migrate from Vite to Next.js
- Prototype code is **not copied as-is** into `src/`.
- Instead, we rebuild the same surfaces in Next.js App Router using this repo’s patterns.

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

### Step 2 — Logic audit (E2E flow that must be preserved)
Based on the audit report, explicitly list:
- Trigger → Result transitions
  - Draft card click → opens Review modal
  - Control action click → opens Confirmation modal
  - Prompt icon click → opens Prompt Details
  - TestPreview complete → Save to Drafts / Simulate Publish works
- State changes (UI-only is acceptable at first)

Output: logic audit section used as a “do not break” contract.

### Step 3 — Implement missing UI endpoints FIRST (no styling migration yet)
In the Next.js version, implement the missing UI-only endpoints as described in the audit.
- This ensures E2E flows work in the real stack.
- Styling at this stage can be minimal/rough, but must not introduce hardcoded classes.

Output: Next.js UI that works end-to-end in **behavior**.

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
