# AI Implementation & Testing Guidelines

## Overview
These guidelines define the industry-standard process for any AI or developer when creating scripts, writing tests, and editing code in this project. They ensure quality, traceability, and user-centric outcomes.

---

## 1. User Story-Driven Development
- **Always start with user stories.**
  - Convert all issues, requirements, or plans into clear, testable user stories.
  - Each user story must have acceptance criteria and be independently testable.

---

## 2. Test-First Principle
- **Write test scripts before implementation whenever possible (TDD/BDD).**
  - Tests should be based on user stories and acceptance criteria.
  - If tests are not written first, create them immediately after implementation—never skip tests.

---

## 3. Test Script Principles
- **Clarity:** Each test must have a clear purpose and expected outcome.
- **Independence:** Tests must not depend on each other.
- **Repeatability:** Tests must yield the same result if the code is unchanged.
- **Coverage:** Cover all user stories, edge cases, and acceptance criteria.
- **Automation:** Automate tests where possible (unit, integration, e2e).
- **Maintainability:** Write tests that are easy to update as requirements change.
- **Traceability:** Each test must map to a specific user story or requirement.

---

## 4. Running & Responding to Tests

- **Run only the minimal set of essential test scripts directly related to the area or feature being worked on.**
  - Avoid running the entire test suite for small, isolated changes unless required by the change scope.
  - Select and execute only those tests that validate the relevant user stories, acceptance criteria, and edge cases for the current work.

- **After automated tests, always perform a real-world, manual/visual QA and audit for the affected area:**
  - Manually execute the relevant user flow(s) in the actual UI or system, not just in test scripts.
  - Confirm that the change works as expected in production-like or realistic conditions (e.g., real APIs, real storage, real rendering, etc.).
  - Attach evidence (screenshots, logs, or video) of the result in action if possible.
  - Compare the real result to the user story and acceptance criteria. Do not mark as done if the real-world outcome does not match.

- **If a test or real-world check fails:**
  - Investigate the root cause.
  - Update the implemented codebase to fix the bug or meet the requirement.
  - Only update the test script if the test is incorrect or requirements have changed.
  - Never change a test just to "make it pass" unless the test itself is wrong.

- **After all changes, require an explicit audit/review phase:**
  - Re-audit the affected area or feature using the latest audit report template or checklist.
  - Validate the change by re-running the relevant user scenario(s), not just the test script.
  - Only mark the task as complete if the change passes both automated and real-world validation.

---

## 5. Editing & Refactoring Rules
- **Edits must be traceable to a user story or bug.**
- **Refactor only with supporting tests in place.**
- **All AI-generated code must be reviewed for clarity, maintainability, and alignment with user stories.**

---

## 6. Documentation
- **Document all user stories, test scripts, and major code changes.**
- **Keep documentation up to date with the codebase.**

---

## 7. Continuous Improvement
- **Regularly review and improve user stories, tests, and code quality.**
- **Encourage feedback and learning from test failures and user feedback.**

---

*These guidelines must be followed by all contributors, including AI agents, to ensure robust, user-focused, and maintainable solutions.*
