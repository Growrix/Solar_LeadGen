
# Blog Feature Backend: Phase-Based Task Workflow (tasks.md track record)

Use this workflow to create and maintain the Blog feature implementation track record at:
- `DOC\Features\BLOG\tasks.md`

All phases must be executed sequentially. The `tasks.md` file is a track record of work completed and work remaining. It can be used for context on what was done, but requirements must come from the current Audit/Plan artifacts created in this workflow.

**Instructions for AI (tasks.md friendly):**
- Add each phase as a clearly separated heading.
- Under each phase, create detailed, actionable tasks.
- After completing a phase deliverable, update `DOC\Features\BLOG\tasks.md` with:
	- the exact output file path(s) produced in that phase
	- a short status note (Done / Blocked / Needs Review)
	- any critical discoveries or open questions
- Focus strictly on the UI/UX and areas explicitly covered by the Phase 1 audit scope. Do not expand scope unless explicitly instructed.

---


***Phase 1: Audit***
Audit the current state of the `Blog Feature` & `Media Library` end-to-end:
- Strictly follow: `DOC\Prompts\PROMPTS & TEMPLATES\BACKEND\E2E-CURRENT-STATE-AUDIT-RULES.md`
- **Artifact (SOT):** `DOC\Features\BLOG\Audit Report\CURRENT-STATE-E2E-AUDIT.md` (must follow required structure; every section present, even if N/A or UNKNOWN)

**Audit Scope:**
1. Blog feature end-to-end, including:
   - Admin: Blog Content Manager page
   - Backend
   - Public: Blog Post page
2. Media Library feature in the Admin (as part of the Blog feature scope). The Media Library must be implemented as a reusable, site-wide asset manager accessible from any feature (e.g., Blog, News Engine), similar to a standard website media library.

---


***Phase 2: Backend Planning***
Begin only after the audit report from Phase 1 is complete and reviewed:
- Reference the audit report file created in Phase 1: `DOC\Features\BLOG\Audit Report\CURRENT-STATE-E2E-AUDIT.md`
- Strictly follow: `DOC\Prompts\PROMPTS & TEMPLATES\BACKEND\Backend_Planning_Prompt_Template_E2E_Audit_First.md`
- **Artifact (SOT):** `DOC\Features\BLOG\Backend\BACKEND-PLAN.md` (use this exact filename for the plan)
- Update `DOC\Features\BLOG\tasks.md` with the backend plan file path and a short summary of what the plan covers.

---


***Phase 3: Test Script Preparation***
Begin only after the backend plan from Phase 2 is complete and reviewed:
- Reference the backend plan file: `DOC\Features\BLOG\Backend\BACKEND-PLAN.md`
- Prepare all required test scripts (unit, integration, E2E) as specified in the backend plan and audit.
- Strictly follow: `DOC\Prompts\PROMPTS & TEMPLATES\BACKEND\testing-overview.md`
- **Artifact (SOT):** `DOC\Features\BLOG\Backend\BACKEND-TEST-SPECS.md` (summarize all test scripts and their locations in this file; actual scripts go in `tests/`)
- Output all test scripts to: `tests/` (use appropriate subfolders: unit, integration, e2e)
- Update `DOC\Features\BLOG\tasks.md` with the created/updated test file paths and what each test covers. Always reference `BACKEND-TEST-SPECS.md` as the SOT for test coverage.

---


***Phase 4: Implementation Tasks***
Begin only after test scripts from Phase 3 are complete and reviewed:
- Reference the backend plan file: `DOC\Features\BLOG\Backend\BACKEND-PLAN.md`
- Reference the test specs summary: `DOC\Features\BLOG\Backend\BACKEND-TEST-SPECS.md`
- Reference the test scripts: `tests/`
- Based on the backend plan and test scripts, create and update implementation tasks in: `DOC\Features\BLOG\tasks.md` following the existing task format. Use `.specify\templates\tasks-template.md` if needed.
- Then implement the backend tasks sequentially and keep `DOC\Features\BLOG\tasks.md` updated as work progresses. Always reference the plan and test specs summary as SOT for requirements and coverage.

---


***Phase 5: Testing & Validation Tasks***
Begin only after implementation tasks from Phase 4 are complete:
- Reference the test scripts from Phase 3: `tests/`
- Reference the test specs summary: `DOC\Features\BLOG\Backend\BACKEND-TEST-SPECS.md`
- Run all tests as per the testing plan and backend plan.
- **Artifact (SOT):** `DOC\Features\BLOG\Backend\BACKEND-VALIDATION.md` (summarize all validation results, issues, and required fixes here)
- Document results, issues, and any required fixes in this file under this phase. Always update `tasks.md` with a summary and a link to `BACKEND-VALIDATION.md`.
#
# Artifact Filenames (SOT for each phase)
#
# - Audit: `DOC\Features\BLOG\Audit Report\CURRENT-STATE-E2E-AUDIT.md`
# - Plan: `DOC\Features\BLOG\Backend\BACKEND-PLAN.md`
# - Test Specs Summary: `DOC\Features\BLOG\Backend\BACKEND-TEST-SPECS.md`
# - Validation: `DOC\Features\BLOG\Backend\BACKEND-VALIDATION.md`
