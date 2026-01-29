
***Phase 1: Vite to next.js Migration***

***Frontend Migration Workflow***

- Here is the prototype we built with Google AI Studio:
  `DOC\FEATURES\BLOG\GoogleAIStudio UI UX`

**Step 1: Audit**
- Follow the audit instructions from `DOC\Prompts\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype Audit & Enhancement_Prompt.md` (use the full prototype-first audit methodology).
- Prepare the audit report in `DOC\Features\BLOG\Audit Report`.
- Do not proceed until the audit report is complete and all findings are documented.

**Step 2: Migration Planning**
- Strictly follow the instructions in `DOC\Prompts\PROMPTS & TEMPLATES\FRONTEND\PROTOTYPE-TO-NEXTJS-PIXEL-PERFECT-MIGRATION.md` when preparing the migration plan, based on the audit report.
- Create the migration plan in: `DOC\FEATURES\BLOG\Migration`

**Step 3: Implementation**
- Based on the migration plan, update the single root tasks file for the feature (do NOT create any additional tasks.md files):
  `DOC\FEATURES\BLOG\tasks.md`
- Use the canonical template rules at:
  `.specify\templates\tasks-template.md`

- Migrate only the following:
  - Media Library
 

**Step 4: Verification**
- After migration, verify that the migrated pages are pixel-perfect and functionally identical to the prototype, using side-by-side comparison or screenshots.

***Strict Rules***
- Ensure a clear understanding of the current codebase before executing migration work.
- Do not adapt, refactor, or improve the UI/UX beyond what is in the prototype unless explicitly requested after mirroring is complete.
- Do not delete, remove, or hide any files unless I explicitly request it.
- Only focus migration work on the specified scope; do not modify, clean up, or remove files outside the scope.

------------------------------------------------------------------------------------------------

***Phase 2: Prototype to Nextjs Migration Audit, Validation,Fixing and Green Signal***

***Validation : Prototype to Nextjs Migration Audit & Enhancement***

- Audit following this : `DOC\Prompts\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs Implimentation Audit_Prompt.md`
- Prepare the audit report in the `DOC\Features\BLOG\Audit Report`. And after that

# Focus area : 
 - Content Manager 
 - Media Library 

- If the Audit report has any gaps, create enhancement tasks in the `DOC\FEATURES\BLOG\tasks.md` file based on the audit report and start implementing those tasks.
- After the implementation is done, re-run the audit to ensure all gaps are fixed.

- If no gaps are found, Then stop here and give me a green signal.


---------------------------------------------
***Phase 3: Frontend Adaption to Theme system***
createa a phase in the DOC\Features\BLOG\tasks.md , based on the below scenario and after that start executing. :


# Audit 
- Understand the entire theaming system and the frontend Globally applied themes by auditing followed by this : `DOC\Prompts\PROMPTS & TEMPLATES\FRONTEND\Frontend-System-Audit-Instruction-2026.md`
- Prepare the audit report in the : `DOC\Features\BLOG\Audit Report`.

# Plan
- Based on the audit report, create the adaption plan in the : `DOC\Features\BLOG\Migration` stricktly followed by this : `DOC\Prompts\PROMPTS & TEMPLATES\FRONTEND\Frontend-Migration-Instruction-2026.md`
- And create update the tasks.md file accordingly with the adaption tasks.


------------------------------------------

***Frontend Migration Workflow***
  - Here is the prototype we built with google ai studio :
  `DOC\FEATURES\BLOG\GoogleAIStudio UI UX`

 - Follow the audit instructions from `DOC\Prompts\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype Audit & Enhancement_Prompt.md` and
 
- prepare the audit report in the `DOC\Features\BLOG\Audit Report`. And after that 

  - Follow the file instructions strictly while preparing the migration plan based on the Audit report you created. 
 `DOC\Prompts\PROMPTS & TEMPLATES\FRONTEND\PROTOTYPE-TO-NEXTJS-PIXEL-PERFECT-MIGRATION.md`

  - Create the Migration plan in the :
  `DOC\FEATURES\BLOG\Migration`
`
  - Based on the Migration plan that you have created, update the single root tasks file for the feature (do NOT create any additional tasks.md files):
  `DOC\FEATURES\BLOG\tasks.md`

  - Use the canonical template rules at:
  `.specify\templates\tasks-template.md`

  ***Instructions*** 
  I only need to migrate as follows :
  - Content Manager 
  - Media Library
 
  Note: these migrated pages should be added in my existing admin dashboard. 

  ***Strickt Rules***
  Before starting implimentation work, make sure to audit the existing structure and necessary files to avoid duplication of any code or missimplimentations. Get the clear picture of the existing codebase and its structure. Then start executing the migration work.
  

-----------------------------------------------------------------------------------------------------

***Fixing missing gaps after the migration of Prototype to Nextjs codebase :***
- Now focus on the Content Manager page and follow instructions below :
- Follow the audit instructions from `DOC\Prompts\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md` and
- prepare the audit report in the `DOC\Features\BLOG\Audit Report`. And after that 
- create a new phaese in the `DOC\Features\BLOG\tasks.md` and then start implimenting. 

----------------------------------------------------------------------------------------------


### EXECUTION-GRADE AI PROMPT

***Frontend Migration Workflow***
  1. CONTEXT
You are migrating a Google AI Studio prototype (V6) to the production Next.js codebase for the NEWS ENGINE feature. The migration must strictly follow the project’s prototype-first, SOT-driven workflow and all documentation standards.

2. WORKFLOW STEPS
Prototype Reference

Use the finalized prototype:
DOC/FEATURES/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin- V6
This prototype is the UI SOT (Source of Truth) for migration.
Migration Plan Preparation

Strictly follow:
DOC/GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md
Reference the migration playbook:
DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/PROTOTYPE-TO-NEXTJS-OPTION-A-PLAYBOOK.md
Create a detailed migration plan in:
DOC/FEATURES/NEWS ENGINE/MIGRATION/
Task Tracking

Update the single root tasks file:
`DOC/FEATURES/NEWS ENGINE/tasks.md`

Do NOT create `tasks.md` in SOT or MIGRATION folders.
Verification & Documentation

After migration, run all verification gates (typecheck, build, theme checks, etc.) as per the migration contract.
Document verification results in the MIGRATION folder.
Update DOC/FEATURES/NEWS ENGINE/SOT/README.md to reflect migration status, deviations, and lessons learned.
SOT & Documentation Compliance

Ensure all SOT/README and index files are updated to reflect the new workflow and any changes.
All folderization and file creation must match the structure in DOC/FEATURES/NEWS ENGINE.
3. ENHANCEMENT RULES
Explicitly reference the migration playbook in all migration plans.
SOT/README must be updated after migration to maintain a single source of truth.
All verification steps must be documented and results stored in the MIGRATION folder.
Remove any instruction to create tasks.md in SOT for prototype-driven frontend features.
Ensure all documentation and plans are traceable, auditable, and compliant with the latest workflow.
4. SUCCESS CRITERIA
Migration plan exists in `DOC/FEATURES/NEWS ENGINE/MIGRATION/` and all tasks are tracked in `DOC/FEATURES/NEWS ENGINE/tasks.md`.
All steps reference the prototype, workflow README, and migration playbook.
SOT/README and index files are updated post-migration.
Verification results are documented.
No redundant or conflicting instructions remain in the guidelines.

  ***Instructions*** 
  I only need to migrate the news frontend pages and its realted modals. 
  - News Page
  - News Details Page
  - Share Modal.


----------------------------------------------------------------------------------------

***Prepare Phases In the Tasks.md***
- I want you to add phases in the DOC\FEATURES\NEWS ENGINE\tasks.md based on the below scenario :

***Phase 1: Migration Plan***
- Here is the prototype we built with google ai studio :
  `DOC\FEATURES\BLOG\GoogleAIStudio UI UX`
- Follow the file instructions strictly while preparing the migration plan
  `DOC\GUIDELINES & SOT\IMPLEMENTATION SOT\PROTOTYPE-TO-NEXTJS-OPTION-A-PLAYBOOK.md`
- Create the Migration plan in the :
  `DOC\FEATURES\BLOG\MIGRATION`

***Phase 2: Migration Execution***
- Based on the Migration plan that you have created, update the single root tasks file for the feature (do NOT create any additional tasks.md files):
  `DOC\FEATURES\BLOG\tasks.md`
- Add migration tasks for each and every component that needs to be migrated from the prototype to nextjs codebase.
- Use the canonical template rules at:
  `DOC\.specify\templates\tasks-template.md`
- After completing the migration tasks, run all verification gates (typecheck, build, theme checks, etc.) as per the migration contract.
- Perform e2e Audit testing to ensure the migrated components function as expected and as per the prototype design. remember, the prototype is the source of truth not a reference.
- The Audit should be based on Prototype vs Nextjs codebase comparison  followed by this : `DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md`
- create the audit report in the `DOC\FEATURES\BLOG\Audit Report`
***Sub-Phase: Conditional***
- If any gaps are found during the audit, create sub-tasks to fix those gaps.
- Update the tasks.md file accordingly with the sub-tasks.
- Re-run the audit after fixing the gaps to ensure all issues are resolved.
- If no gaps are found, proceed to the next phase.
***Strickt Rules for this sub-phase***
- never move to next phase until all gaps are fixed and audit is passed green.
- Always update the tasks.md file with the sub-tasks before starting any fixing work.

***Phase 3: Frontend Enhancement***
- Add the audit report link here once done : `DOC\FEATURES\BLOG\Audit Report` from the phase 2.
- Perform the enhancement audit followed by `DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\frontend-enhancement-audit-instructions.md`
- create the enhancement audit report in the `DOC\FEATURES\BLOG\Audit Report`
***Sub-Phase: Conditional*** 
- If any enhancement opportunities are found during the audit, create sub-tasks to implement those enhancements.
- Update the tasks.md file accordingly with the sub-tasks.
- Re-run the audit after implementing the enhancements to ensure all improvements are correctly applied. 
- If no enhancement opportunities are found, proceed to the next phase.
***Strickt Rules for this sub-phase***
- never move to next phase until all enhancements are implemented and audit is passed green. 

***Phase 4: Backend Planning & Implementations**
- Perform an audit followed by the `DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md`
- Create the audit report in the `DOC\FEATURES\BLOG\Audit Report`
- based on the Audit report, create the backend implementation plan followed by the `DOC\PROMPTS\PROMPTS & TEMPLATES\BACKEND\Backend_Planning_Prompt_Template_E2E_Audit_First.md`
- create the backend implementation plan in the `DOC\FEATURES\BLOG\BACKEND PLAN` folder. 
- Update the tasks.md file accordingly with the backend implementation tasks.

***Sub-Phase: Conditional***
- After the implimentation is done completely , prepare the test scripts to do the e2e testing of the entire expanded/enhanced feature and run the tests. 
- fix any issues found during the testing.
- After that run all the test scripts and make sure everything is passed green.
- if everything is passed green , update the tasks.md accordingly.
- only move to the next phase when all the tests are passed with green signal.

**Phase 5: Post-Feature Test & Documentation Prompt**

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

3. Complete the post-implementation documentation and handover checklist using:
`DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\post-implementation-documentation.md`

Ensure all user/admin guides, developer docs, testing instructions, troubleshooting, and handover steps are covered.
Keep the documentation concise and actionable for future maintenance and onboarding.

4. Prepare the documentation in:
	DOC\FEATURES\NEWS ENGINE\POST FEATURE
   
This ensures the feature is fully tested, documented, and ready for production.
