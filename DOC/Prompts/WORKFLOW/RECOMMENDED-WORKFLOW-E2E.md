# RECOMMENDED WORKFLOW (E2E, Production-Ready)


Goal: Build a SaaS feature end-to-end with **clarity of outcome**, **no static UI**, a **final user-operating guide**, and a single, continuously updated implementation task record.

**MANDATORY:** Every feature must have a single `tasks.md` file (see below) that is updated at every phase. This is the only source of truth (SOT) for all implementation steps, and must follow the canonical template at `DOC/.specify/templates/tasks-template.md`.

**NON-NEGOTIABLE RULE:** Every action, phase, and sub-phase must be tracked and accomplished via `tasks.md`. The AI must always update `tasks.md` for every task, action, or change—no exceptions. No implementation step is valid unless it is reflected in `tasks.md`.


This workflow reuses your existing directories and prompt templates.


**Reference:** For all phases, see documentation standards in `DOC/GUIDELINES & SOT/README.md`.

---

## [NEW] Controlled Enhancement Loop (Iterative)
**Purpose:** Manage enhancement cycles efficiently, avoid endless loops, and keep documentation up-to-date.

**Sequence:**
1. Audit current implementation using enhancement prompt (see `DOC/GUIDELINES & SOT/README.md` for audit prompt references).
2. Document findings and enhancement plan in the feature's enhancement file (e.g., `Fontend UI UX Prompts/frontend-uiux-system-plan-<feature>-<date>.md`).
3. Generate new prompts and implement enhancements.
4. Run a mini-audit after each loop.
5. After a set number of loops or reaching stability, trigger the SOT Realignment Phase.

**Always update `tasks.md` for every action, change, or sub-phase in this loop.**

**Prompt:**
> "You are in the Controlled Enhancement Loop for `<FEATURE>`. Audit the current implementation, document findings and enhancement plan, generate new prompts, and implement enhancements. After several loops or when stable, trigger SOT Realignment. Reference audit/enhancement documentation in `DOC/GUIDELINES & SOT/README.md`. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Audit & Correction Loop: Audit enhancements, log/fix gaps, repeat as needed.
- Enhancement: Add improvements/refactor as needed.
- Documentation: All new prompts/enhancements must be appended to the enhancement file.

---

## [NEW] SOT Realignment Phase
**Purpose:** Realign all SOT files and initial plans after major enhancements, ensuring a single source of truth.

**Sequence:**
1. Audit the current implementation, enhancement plans, and tasks.md.
2. Update all SOT files and initial plan in one batch to reflect the current state.
3. Document changes in tasks.md and SOT README.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in the SOT Realignment Phase for `<FEATURE>`. Audit the current implementation, enhancement plans, and tasks.md. Update all SOT files and initial plan to reflect the current state. Document changes in tasks.md and SOT README. Reference SOT documentation standards in `DOC/GUIDELINES & SOT/README.md`. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Audit & Correction Loop: Audit SOT vs. current state, log/fix gaps, repeat until green.
- Documentation: Update SOT README and initial plan.

---

## [NEW] Migration Phase (Conditional)
**Purpose:** Migrate frontend prototypes (e.g., Google AI Studio, Vite) to the main Next.js codebase, adapting to project theming and layout.

**Entry Criteria:** Triggered only if frontend was built externally.

**Sequence:**
1. Prepare migration plan referencing playbooks in `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/PROTOTYPE-TO-NEXTJS-OPTION-A-PLAYBOOK.md` and workflow in `DOC/GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md`.
2. Track migration tasks as a Migration phase inside `DOC/FEATURES/<FEATURE>/tasks.md` (use canonical template).
3. Perform migration, adapting UI to Next.js and project theming.
4. Run verification gates and document results in MIGRATION folder.
5. Update SOT/README to reflect migration status and lessons learned.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in the Migration Phase for `<FEATURE>`. Prepare a migration plan referencing playbooks and workflow documentation. Track all migration work as a Migration phase inside `DOC/FEATURES/<FEATURE>/tasks.md`. Migrate the UI to Next.js and project theming. Run verification gates and document results. Update SOT/README to reflect migration status. Reference all migration documentation in `DOC/GUIDELINES & SOT/README.md`. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Planning: Prepare migration plan and tasks.
- Implementation: Perform migration and adapt UI.
- Verification: Run gates and document results.
- Documentation: Update SOT/README and migration records.

---

## Sub-Phases in Every Major Phase (Quality & Control)

Each main phase below includes the following sub-phases for robust, iterative quality control:

- **Quality Gate:** Checklist and audit before moving forward.
- **Audit & Correction Loop:** Run audit prompt, log/fix issues, repeat as needed until green signal.
- **Enhancement:** Allow for improvements/refactoring as needed.
- **Backtrack/Reconciliation:** If issues are found later, log and fix them, update the plan, SOT, and the single root `tasks.md`.
- **Functional Verification:** E2E test and sign-off before release or next phase.

These sub-phases are mandatory and must be reflected in `tasks.md` for every feature.

---




## Phase 0 — Research (One-time)
**Output:**
  - Problem statement + goal
  - Key decisions (what we will/won’t build)
  - Risks/unknowns
  - Location: `DOC/FEATURES/<FEATURE>/tasks.md`
  - Use the canonical template: `DOC/.specify/templates/tasks-template.md`
  - Add initial research/planning tasks as Phase 0.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are starting a new feature. Please read the initial plan file at `DOC/FEATURES/<FEATURE>/Plan/<PLAN-FILE>.md`. Summarize the problem statement, key decisions, and risks. Then create or update `DOC/FEATURES/<FEATURE>/tasks.md` using the canonical template at `DOC/.specify/templates/tasks-template.md` and add all research/planning tasks as Phase 0. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Quality Gate: Review research completeness and clarity.
- Audit & Correction Loop: Audit research vs. requirements, log/fix gaps.

---





## Phase 1 — Build SOT (Docs Only)
**Sequence:**
1. **Reference the Initial Plan:**
  - You create the feature folder and the initial plan file in `DOC/FEATURES/<FEATURE>/Plan/`.
  - Share this plan file with the AI as the starting point for all further work.

2. **AI Reads the Plan:**
  - The AI must read and understand the initial plan before generating or updating the SOT.

3. **Create/Update the SOT:**
  - AI creates or updates `DOC/FEATURES/<FEATURE>/SOT/FEATURE-SOT.md` based on the initial plan.

4. **Update `tasks.md`:**
  - Add all SOT-related documentation and planning tasks as Phase 1.
  - Do **NOT** create `tasks.md` inside the SOT folder; always use the root feature folder.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in Phase 1 (Build SOT) for the feature in `DOC/FEATURES/<FEATURE>`. Read the initial plan at `DOC/FEATURES/<FEATURE>/Plan/<PLAN-FILE>.md`. Create or update the SOT at `DOC/FEATURES/<FEATURE>/SOT/FEATURE-SOT.md` based on the plan. Update `DOC/FEATURES/<FEATURE>/tasks.md` with all SOT-related documentation and planning tasks as Phase 1. Do NOT create tasks.md inside the SOT folder. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Quality Gate: Review SOT completeness and alignment with research/plan.
- Audit & Correction Loop: Audit SOT vs. requirements, log/fix gaps, repeat until green.

---


## Phase 2 — Frontend Planning (From SOT)
If you’re doing prototype-first UI:
  - Read: `DOC/GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md`
  - Use prompting SOP + template:
    - `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md`
    - `DOC/PROMPTS/AI PROMPTING/Template_AIfrontend.md`

Output: sequence-locked prompts in:
  - `DOC/FEATURES/<FEATURE>/Fontend UI UX Prompts/`

**Update `tasks.md`:**
  - Add all frontend planning and prompt generation tasks as Phase 2.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in Phase 2 (Frontend Planning) for the feature in `DOC/FEATURES/<FEATURE>`. Read the SOT at `DOC/FEATURES/<FEATURE>/SOT/FEATURE-SOT.md`. Use the SOP and template at `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md` and `DOC/PROMPTS/AI PROMPTING/Template_AIfrontend.md` to prepare sequence-locked prompts in `DOC/FEATURES/<FEATURE>/Fontend UI UX Prompts/`. Update `DOC/FEATURES/<FEATURE>/tasks.md` with all frontend planning and prompt generation tasks as Phase 2. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Quality Gate: Review frontend plan vs. SOT.
- Audit & Correction Loop: Audit plan, log/fix gaps, repeat until green.

---



## Phase 3 — Frontend Build (Prototype or Real UI)
Build the UI based on the prompt plan.

If prototype enhancement is needed, use:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/Prototype Audit & Enhancement_Prompt.md`

Output audit reports to:
  - `DOC/FEATURES/<FEATURE>/Audit Report/`

**Update `tasks.md`:**
  - Add all frontend build and enhancement tasks as Phase 3.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in Phase 3 (Frontend Build) for the feature in `DOC/FEATURES/<FEATURE>`. Build the UI based on the prompt plan in `DOC/FEATURES/<FEATURE>/Fontend UI UX Prompts/`. If enhancement is needed, use `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/Prototype Audit & Enhancement_Prompt.md`. Output audit reports to `DOC/FEATURES/<FEATURE>/Audit Report/`. Update `DOC/FEATURES/<FEATURE>/tasks.md` with all frontend build and enhancement tasks as Phase 3. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Quality Gate: Review UI vs. plan and SOT.
- Audit & Correction Loop: Audit UI, log/fix gaps, repeat until green.
- Enhancement: Add improvements/refactor as needed.
- Backtrack/Reconciliation: If issues found later, log/fix, update plan/SOT and the single root `tasks.md`.

---




## Phase 4 — Backend Planning (Based on FINAL UI)
Use:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/BACKEND/Backend_Planning_Prompt_Template_E2E_Audit_First.md`

Output backend plan into:
  - `DOC/FEATURES/<FEATURE>/BACKEND PLAN/`

**Update `tasks.md`:**
  - Add all backend planning and mapping tasks as Phase 4.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in Phase 4 (Backend Planning) for the feature in `DOC/FEATURES/<FEATURE>`. Use the prompt at `DOC/PROMPTS/PROMPTS & TEMPLATES/BACKEND/Backend_Planning_Prompt_Template_E2E_Audit_First.md` to prepare the backend plan. Output the backend plan to `DOC/FEATURES/<FEATURE>/BACKEND PLAN/`. Update `DOC/FEATURES/<FEATURE>/tasks.md` with all backend planning and mapping tasks as Phase 4. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Quality Gate: Review backend plan vs. UI and SOT.
- Audit & Correction Loop: Audit backend plan, log/fix gaps, repeat until green.

---




## Phase 5 — Backend Implementation
Implement backend to match the final UI flows + backend plan.

**Update `tasks.md`:**
  - Add all backend implementation tasks as Phase 5.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in Phase 5 (Backend Implementation) for the feature in `DOC/FEATURES/<FEATURE>`. Implement the backend to match the final UI flows and backend plan in `DOC/FEATURES/<FEATURE>/BACKEND PLAN/`. Update `DOC/FEATURES/<FEATURE>/tasks.md` with all backend implementation tasks as Phase 5. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Quality Gate: Review backend implementation vs. plan and UI.
- Audit & Correction Loop: Audit backend, log/fix gaps, repeat until green.
- Enhancement: Add improvements/refactor as needed.
- Backtrack/Reconciliation: If issues found later, log/fix, update plan/SOT and the single root `tasks.md`.

---




## Phase 6 — Test & Fix (Pre-Release)
Run project gates + do E2E manual testing.

Recommended audit driver:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`

Output audit report to:
  - `DOC/FEATURES/<FEATURE>/Audit Reports/`

**Update `tasks.md`:**
  - Add all testing, audit, and bugfix tasks as Phase 6.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in Phase 6 (Test & Fix) for the feature in `DOC/FEATURES/<FEATURE>`. Run project gates and E2E manual testing. Use the audit driver at `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`. Output audit reports to `DOC/FEATURES/<FEATURE>/Audit Reports/`. Update `DOC/FEATURES/<FEATURE>/tasks.md` with all testing, audit, and bugfix tasks as Phase 6. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Functional Verification: E2E test all flows, sign-off before release.
- Audit & Correction Loop: Audit feature, log/fix gaps, repeat until green.

---




## Phase 7 — Post-Feature (Operate + Verify)
Goal: remove the “what is working vs static” confusion.

1) Run post-implementation audit:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`

2) Create the **Feature User Guide + Tooltips + Function Map + Final Checklist** using:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/POST FEATURE/feature-post-implementation-doc-template.md`

Output docs to:
  - `DOC/FEATURES/<FEATURE>/POST FEATURE/`

**Update `tasks.md`:**
  - Add all post-feature documentation, verification, and sign-off tasks as Phase 7.

**Always update `tasks.md` for every action, change, or sub-phase in this phase.**

**Prompt:**
> "You are in Phase 7 (Post-Feature) for the feature in `DOC/FEATURES/<FEATURE>`. Run the post-implementation audit using `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`. Create the Feature User Guide, Tooltips, Function Map, and Final Checklist using `DOC/PROMPTS/PROMPTS & TEMPLATES/POST FEATURE/feature-post-implementation-doc-template.md`. Output docs to `DOC/FEATURES/<FEATURE>/POST FEATURE/`. Update `DOC/FEATURES/<FEATURE>/tasks.md` with all post-feature documentation, verification, and sign-off tasks as Phase 7. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Final Audit: E2E audit and verification.
- Audit & Correction Loop: Audit post-feature docs, log/fix gaps, repeat until green.

---


## Summary: `tasks.md` as the Single Source of Truth

- All implementation steps, from research to post-feature, enhancement, migration, and SOT realignment, must be reflected in this file.
- This file is the only SOT for implementation progress and planning.
