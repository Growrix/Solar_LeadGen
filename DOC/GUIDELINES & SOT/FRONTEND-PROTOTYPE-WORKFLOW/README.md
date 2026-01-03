# Prototype-First Frontend Workflow (Google AI Studio → Frontend UI/UX Prompts)

This workflow is used when the UI/UX is first finalized in **Google AI Studio**, and then converted into a **sequence-locked plan + prompts** so implementation can start with minimal ambiguity.

## Canonical References (Must Read)
- Prompting SOP: `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md`
- Prompt Template (Strict): `DOC/PROMPTS/AI PROMPTING/Template_AIfrontend.md`
- Reference folderization: `DOC/FEATURES/NEWS ENGINE/`

## Required Folderization (Per Feature)
Create the same structure as `DOC/FEATURES/NEWS ENGINE/`:

- `SOT/` — 6-phase framework docs (planning SOT)
- `Plan/` — initial plan created by the user at feature start
- `GoogleAIStudio UI UX/` — prototype exports (pasted by the user)
- `Fontend UI UX Prompts/` — prompt artifacts generated from the prototype
- `Audit Report/` — audit reports; store all future audits here
- `BACKEND PLAN/` — empty until frontend is final

## Sequence (Strict)
1) User creates the initial plan in `Plan/`.
2) AI creates the 6-phase SOT docs under `SOT/`.
3) User places the Google AI Studio prototype exports in `GoogleAIStudio UI UX/`.
4) AI generates the prompt artifacts in `Fontend UI UX Prompts/` using the strict template.

## Output Requirements (What the AI Must Produce)
- Prompts must be **sequence-locked** (Step X of Y).
- UX must be decomposed into **pages first**, then **modals**, then **confirmations**.
- Every click must map to what opens next and what happens after close/submit.

---

## Migration Stage (Prototype → Next.js)

When the prototype UI is migrated into the Next.js app, the migration is **prototype-preserving**:
- The chosen prototype version (e.g., V6) is the **UI SOT**.
- Migration must preserve UI composition, layout, triggers, modals, and flows.
- Allowed changes are limited to semantic token `className` swaps + minimal wrapper/layout adjustments required for embedding inside the repo’s layouts.

Mandatory sequencing (2-part migration):
- Part 1: Structural mirror (tabs/modals/components in separate files; hub thin; UI preserved)
- Part 2: Design-system compliance (tokenization + class contracts + multi-theme + verification gates)

Authoritative contract:
- `DOC/GUIDELINES & SOT/README.md` → “Prototype-Preserving Migration Contract (Vite Prototype → Next.js)”

## IMPORTANT: Tasks.md Exception
For this workflow, do **NOT** create:
- `DOC/Features/<Feature Name>/SOT/tasks.md`

If/when implementation begins, track execution using:
- `specs/<feature>/tasks.md` (must follow `.specify/templates/tasks-template.md`)
