***Prepare Phases In the Tasks.md***
- Add a new phase and sub-phases as required in `DOC/FEATURES/[FEATURE]/tasks.md` based on the scenario below.
- At the beginning of the created phase, copy and paste all issues exactly as written by the user into tasks.md for tracking. This ensures all issues are preserved and visible in one place.

***Phase 1: User Story Creation***
- Create user stories using the template: `DOC/.specify/templates/spec-template.md` based on the issues listed below.
- Save the user story file(s) in: DOC/FEATURES/[FEATURE]/POST FEATURE/FIXING ISSUES

***Issues to solve***

- [List each issue to be fixed here.]

***Phase 2: Test Script Creation***
- Create all test scripts following: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-implementation-testing-guidelines.md`, strictly based on the user stories from Phase 1.
- Review the last phase user stories to understand the pain points and issues to solve.

***Phase 3: Issue Fixing***
- Prepare a step-by-step task list to fix each issue above, one by one.
- For each issue:
  - Start with a short analysis of the issue and why it is happening.
  - Identify the root cause and fix it.
  - After each fix, perform visual testing and confirm resolution.
  - Update tasks.md with each action and result.
- Do not batch fixes; address and verify each issue sequentially.

***Phase 4: Post-Fix Testing***
- Run the scripts and perform testing as per: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-implementation-testing-guidelines.md`.
- Only move to the next phase if all tests pass as per the user stories.
- If any test fails, fix the code and re-test before proceeding.

***Instructions***
- Address all findings and issues listed above by fixing them accordingly.
- Reference the latest audit reports and documentation from tasks.md and related files as needed.
- Always update tasks.md for every action, change, and sub-phase.
- Do not begin work until all tasks for the phase are planned and checked in tasks.md.
- For supporting documentation and to avoid hallucination, always refer to: `DOC/GUIDELINES & SOT/README.md`

***Task Planning Required***
> - Before starting implementation, enumerate and lock all actionable tasks for this phase below, following `.specify/templates/tasks-template.md`.
> - Add subtasks for each UI, logic, and audit step as needed.
> - Do not begin until all tasks are planned and checked in.

**Note**
- Add this section "Task Planning Required" in each phase in the tasks.md file of the relevant feature where applicable.
