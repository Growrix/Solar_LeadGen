


***Phase 1 : Inventory Mapping Audit***

 - Focusing on the News Engine Feature, Follow this instructions strictly and perfrom the audit : DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\feature-implementation-inventory-mapping-audit-prompt.md

 - and after that prepare the report in the : DOC\FEATURES\NEWS ENGINE\Audit Reports 

------------------------------------------------------------------------------------------------

***Phase 2 : SOT alignment with Current Enhancement Plan***

- Here is the existing SOT : 
  DOC\FEATURES\NEWS ENGINE\POST FEATURE\NEWS-ENGINE-FEATURE-AUDIT-2026-01-13.md

- Here is the current state of this feature after the initial implementation as per SOT: 
  DOC\FEATURES\NEWS ENGINE\Audit Reports\news-engine-inventory-mapping-audit-2026-01-07.md

- Here is the current Enhancement plan : 
  DOC\FEATURES\NEWS ENGINE\Plan\AI-AUTOMATION-ADMIN-ENHANCEMENT-PLAN-2026-01-07.md

***instruction*** As we are expanding and enhancing the feature now, I want you to deeply understand the existing SOT vs the current state audit report and update the SOT the align and sync with the new enhencement plan and also the current state of the feature. prepare the updated SOT files only as per the final analysis. The Goal is to update the SOT files to reflect the current state of the feature and also the new enhancement plan. So that we can safely follow the updated SOT while implimenting the enhancement. 

------------------------------------------------------------------------------------------------

***Phase 3 : Frontend Developemnt***

- Here is the Enhancement plan : 
  DOC\FEATURES\NEWS ENGINE\Plan\AI-AUTOMATION-ADMIN-ENHANCEMENT-PLAN-2026-01-07.md

- Here is the Current Inventory Mapping Audit Report : 
  DOC\FEATURES\NEWS ENGINE\Audit Reports\news-engine-inventory-mapping-audit-2026-01-07.md

- Prepare the frontend enhancement prompts in : 
  DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts 
  folder by following the :
  DOC\PROMPTS\AI PROMPTING\AI Prompting Guideline.md Instructions. 

- The Outcome should be followed by This : 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\Template_Comprehensive_UI UX.md

  ***Instrcutions*** 
  - perform as per mentioned above but make sure everyting alined with the updated SOT files in : DOC\FEATURES\NEWS ENGINE\SOT folder.
------------------------------------------------------------------------------------------------

***phase 4 : Backend Developemnt***

 - here is the excatly current state audit report : 

 - we have implimented the frontend based on this enhancement plan : 
   DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts\AI-AUTOMATION-ADMIN-ENHANCEMENT-FRONTEND-PROMPTS-2026-01-07.md

- prepare the backend plan by following the prompt in : 
  DOC\PROMPTS\PROMPTS & TEMPLATES\BACKEND\Backend_Planning_Prompt_Template_E2E_Audit_First.md

***Instructions***
As we have enhance and expanded the frontend based on the new enhancement plan, now prepare the backend plan by following the above mentioned prompt. Make sure the backend plan is aligned with the updated frontend and never messup with existing builds. we need to do it safely. 

--------------------------------------------------------------------------


***Prepare Phases In the Tasks.md***
- I want you to add phases in the DOC\FEATURES\NEWS ENGINE\tasks.md based on the below scenario :

***Phase 1***

- Here is the latest audit report of the News Engine Feature : 
  DOC\FEATURES\NEWS ENGINE\Audit Reports\news-engine-post-phase13-audit-2026-01-13.md
- Here is the post Feature Documentations : 
  DOC\FEATURES\NEWS ENGINE\POST FEATURE\NEWS-ENGINE-USER-GUIDE.md

- Here is the expanded plan : DOC\FEATURES\NEWS ENGINE\Plan\Expanding plan V2.md 

***Instructions***
- You have to prepare a frontend + Backned plan for the expansion/enhancement by following the above mentioned files carefully :DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Expansion Instructions.md

- Prepare the plan in this DOC\FEATURES\NEWS ENGINE\Plan Folder
- And update the tasks.md Phase 1 ending with the file created in the Plan folder. So that the next phase can follow the plan accordingly without confusion.

***Sub Instructions for Phase 1***
- after that , based on the  You have to prepare the "Expand_userstory.md" file based on Expanding plan V2.md  by this template : .specify\templates\spec-template.md > create the file in in the DOC\FEATURES\NEWS ENGINE\Plan Folder.
- And Refer to this file in the tasks.md, QA/audit scripts, and code review checklists. Its main purpose is to serve as the single source of truth for acceptance criteria, ensuring the implementation is complete, testable, and ready for production.

- Prepare the plan in this DOC\FEATURES\NEWS ENGINE\SOT Folder
- And update the tasks.md Phase 1 ending with the file created in the Plan folder. So that the next phase can follow the plan accordingly without confusion.

***Phase 2*** 
- Create the frontend expansion/enhancement prompts in : 
  DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts 
  folder by following the :
  DOC\PROMPTS\PROMPTS & TEMPLATES\FRONTEND\AI Prompting Guideline.md Instructions.
- Update the tasks.md Phase 2 ending with the file created in the Fontend UI UX Prompts folder. So that the next phase can follow the plan accordingly without confusion.

***Phase 3*** 
- Start implimenting the Frontend expansion/enhancement by following the prompts created in the Fontend UI UX Prompts folder.
- Update the tasks.md Phase 3 ending with the completion of the Frontend expansion/enhancement. So that the next phase can follow the plan accordingly without confusion.
- After implimentation do a audit of the frontend Implimentation done vs the plan by following the prompt in : DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\comprehensive-feature-implementation-audit-prompt.md . prepare the audit report in : DOC\FEATURES\NEWS ENGINE\Audit Reports folder.
- Update the tasks.md and add the audit report as a latest state reference in order to do the next phase 4.

***Sub Phase in Phase 3***
- condition 1 : if there are gaps, issues, missing implementations etc found in the audit report, then you need to fix them first based on the audit report and then move to the 4th phase.
- condition 2 : if there are no gaps, issues, missing implementations etc found in the audit report, then you can move to the 4th phase directly by double checking the backend plan is accurate or not as per the final frontend build. If everything is good then move to the 4th phase directly.

***Phase 4***
- Start planning the Backend expansion/enhancement by following the updated frontend build and the plan created in the Phase 1. 
- And create the backend expansion/enhancement plan in the DOC\FEATURES\NEWS ENGINE\BACKEND PLAN folder based on the updated frontend build and the plan created in the Phase 1.
- The phase 3 audit report as the latest state reference In order to start implimenting the backend. But always checkback before implimentation of the backend. 
- THe goal here is to stay aligned with the Expansion plan and the Frontend implimentations e2e. So, that the backend implimentations will not have any issues. 
- After Implimentation you must Audit the implimentation followed by : DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\feature-implementation-inventory-mapping-audit-prompt.md and compare vs the frontend backend plan created in the Phase 1. prepare the audit report in : DOC\FEATURES\NEWS ENGINE\Audit Reports folder.
- Update the tasks.md and add the audit report as a latest state reference in order to do the next phase 5.

***Sub Phase in Phase 4***
- condition 1 : if there are gaps, issues, missing implementations etc found in the audit report, then you need to fix them first based on the audit report and then move to the 5th phase.
- condition 2 : if there are no gaps, issues, missing implementations etc found in the audit report, then you can move to the 5th phase directly by double checking everything is aligned e2e. If everything is good then move to the 5th phase directly.

***Phase 5*** 
- create the script in order to do the e2e testing of the entire expanded/enhanced feature and run the tests. 
- fix any issues found during the testing.
- After that run all the test scripts and make sure everything is passed green.
- if everything is passed green , update the tasks.md accordingly.
- If not, fix the issues and re run the tests until everything is passed green.
- Move to the next phase only when all the tests are passed with green signal. 

***Phase 6***
**Post-Feature Test & Documentation Prompt**

After E2E implementation and audit, follow these steps:

1. Use the audit prompt at:
	DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md
	to perform a full post-implementation feature audit.

2. Prepare the final user guide, tooltips, functionality map, and checklist using the template at:
	DOC/PROMPTS/PROMPTS & TEMPLATES/POST FEATURE/feature-post-implementation-doc-template.md

	**Documentation completeness requirement (mandatory):**
	- Document the feature **section-by-section** for every main tab/section in the UI.
	- For each tab/section, explain **what it does**, **why it exists**, **who uses it**, and **how it impacts the system end-to-end**.
	- Cover the template’s key concepts (e.g., routing/automation, configuration profiles, secret/key handling, review/provenance), plus:
	  - Typical E2E flows (input → processing → output/publish equivalent)
	  - How to know the system is working end-to-end
	  - Common errors/blockers and exact resolution steps
	  - Limitations/edge cases and what to verify after each release

3. Prepare the documentation in:
	DOC\FEATURES\NEWS ENGINE\POST FEATURE
   
This ensures the feature is fully tested, documented, and ready for production.

***Strickt Rules***

The tasks.md is the only master track record of all the tasks. so you need to update the tasks.md file accordingly for every action, change, sub-phase etc. Always refer to the tasks.md file before starting any new phase or sub-phase. Always update/Add with the executional tasks before any action. 
**Task Planning Required:**
> - Before starting implementation, enumerate and lock all actionable tasks for this phase below, following `.specify/templates/tasks-template.md`.
> - Add subtasks for each UI, logic, and audit step as needed.
> - Do not begin until all tasks are planned and checked in.
**Note**
- Add this section "ask Planning Required" in each phase in the tasks.md file of the News Engine Feature where ever applicable.

***For Anykind of Supporting Docs to aviod hallucination*** follow this : DOC\GUIDELINES & SOT\README.md

------------------------------

















## Phase 14: Expansion/Enhancement Cycle (V2) — Frontend + Backend

**Purpose**: Plan and deliver a controlled expansion/enhancement on top of the current, audited feature state.

**Inputs (provided by owner per run)**
- Latest current-state audit report (E2E)
- Latest post-feature documentation/user guide
- Latest expansion/enhancement plan (V2)

**Planning driver**
- Use: `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/Expansion Instructions.md`

---

### Expansion Phase 1 — Unified Expansion Plan (Frontend + Backend)

**Goal**: Produce a single, unified plan that merges frontend + backend expansion work into one document (plan only).

- [x] E1401 Read the provided current-state audit + post-feature docs + expansion plan (V2)
- [x] E1402 Create ONE unified expansion plan file in `DOC/FEATURES/NEWS ENGINE/Plan/`
  - Must include:
    - Frontend expansion plan (E2E flows, UI states, triggers)
    - Backend expansion plan (endpoints, DB changes, automation execution strategy)
    - Mapping table (UI action ↔ endpoint ↔ data model)
    - Implementation checklist
  - Must follow: `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/Expansion Instructions.md`
- [x] E1403 Phase 1 completion gate: `tasks.md` updated with the exact path to the newly created unified plan file
  - Unified plan: `DOC/FEATURES/NEWS ENGINE/Plan/NEWS-ENGINE-UNIFIED-EXPANSION-PLAN-V2-2026-01-13.md`

---

### Expansion Phase 2 — Frontend Expansion Prompt Pack

**Goal**: Produce a sequence-locked prompt pack to build the frontend expansion with minimal surprises.

- [ ] E1421 Create frontend expansion prompts in `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/`
  - Must follow:
    - `DOC/PROMPTS/PROMPTS & TEMPLATES/FRONTEND/AI Prompting Guideline.md`
    - `DOC/PROMPTS/PROMPTS & TEMPLATES/FRONTEND/Template_Comprehensive_UI UX.md`
  - Prompt pack must:
    - Be step-by-step (pages before modals, one intent per modal)
    - Include default/loading/empty/error/disabled/success states
    - Reference the unified expansion plan as the SOT for this cycle
- [ ] E1422 Phase 2 completion gate: `tasks.md` updated with the exact path to the prompt pack file

---

### Expansion Phase 3 — Frontend Implementation + Audit Bridge

**Goal**: Implement the expanded frontend, then audit it against the unified expansion plan.

- [ ] E1431 Implement the frontend expansion strictly by following the prompt pack
- [ ] E1432 Run a frontend-vs-plan implementation audit using:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`
  - Output audit report to: `DOC/FEATURES/NEWS ENGINE/Audit Reports/`
- [ ] E1433 Sub-phase (fix loop):
  - If the audit finds gaps/missing wiring/dead UI: fix them and re-audit until green
  - If green: proceed to Expansion Phase 4
- [ ] E1434 Phase 3 completion gate: `tasks.md` updated with the exact path to the latest frontend expansion audit report

---

### Expansion Phase 4 — Backend Expansion Plan + Implementation + Inventory Audit

**Goal**: Plan and implement backend changes aligned to the final expanded frontend and unified plan.

- [ ] E1441 Create/update the backend expansion plan in `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/`
  - Must use the Phase 3 audit report as “latest state reference”
  - Must ensure all frontend actions have matching endpoints + DB support
- [ ] E1442 Implement the backend expansion based on the updated backend plan
- [ ] E1443 Run inventory/mapping audit after backend implementation using:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/feature-implementation-inventory-mapping-audit-prompt.md`
  - Compare inventory vs the unified expansion plan (Phase 1)
  - Output audit report to: `DOC/FEATURES/NEWS ENGINE/Audit Reports/`
- [ ] E1444 Sub-phase (fix loop):
  - If gaps/missing implementations found: fix and re-audit until green
  - If green: proceed to Expansion Phase 5
- [ ] E1445 Phase 4 completion gate: `tasks.md` updated with the exact path to the latest backend inventory/mapping audit report

---

### Expansion Phase 5 — E2E Testing Script(s) + Fix Loop

**Goal**: Execute repeatable E2E testing for the expanded feature and fix issues until green.

- [ ] E1451 Create an E2E test script (or scripts) to validate the expanded feature end-to-end
  - Location recommendation: `scripts/` (consistent with existing News Engine E2E scripts)
- [ ] E1452 Run the E2E script(s) and log failures as tasks
- [ ] E1453 Fix all issues found and re-run until green
- [ ] E1454 Phase 5 completion gate: `tasks.md` updated with script path(s) and last green run timestamp

---

### Expansion Phase 6 — Post-Feature Audit + Post-Feature Documentation

**Goal**: Produce final, operator-ready documentation and a final audit record for the expanded feature.

- [ ] E1461 Run a full post-implementation feature audit using:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`
  - Output audit report to: `DOC/FEATURES/NEWS ENGINE/Audit Reports/`
- [ ] E1462 Prepare final docs (user guide, tooltips, functionality map, checklist) using:
  - `DOC/PROMPTS/PROMPTS & TEMPLATES/POST FEATURE/feature-post-implementation-doc-template.md`
  - Output docs to: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/`
- [ ] E1463 Phase 6 completion gate: `tasks.md` updated with the exact path(s) to the final audit report and final post-feature docs