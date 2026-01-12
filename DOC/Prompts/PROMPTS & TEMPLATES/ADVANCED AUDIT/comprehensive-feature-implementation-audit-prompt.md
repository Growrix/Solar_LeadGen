# Comprehensive Feature Implementation Audit Prompt

## Purpose
This prompt guides an AI agent to perform a deep, multi-surface audit of a newly implemented feature across frontend, backend, database, and API layers. The audit compares the actual implementation against the Source of Truth (SOT) and identifies missing, incomplete, or non-functional elements. The goal is to ensure e2e traceability, operational completeness, and SOT alignment.

---

## Audit Scopes

### 1. Page & Modal Audit (Frontend)
- Read every implemented page and modal (React/Next.js/other).
- Identify all UI controls, triggers, and visible states.
- Validate that each control is wired to a deterministic outcome (no dead triggers).
- Explicitly detect and list all static, unused, or non-functional UI/UX elements (e.g., buttons, modals, controls) that are present in the UI but have no backend/API/service integration or are not connected to any operational logic. These must be reported even if not referenced in the SOT.
- Compare each page/modal against the SOT (contract, plan, requirements):
  - List missing pages, modals, or controls.
  - Flag any UI element that is present in SOT but not implemented.
- Check for error, loading, and empty states as defined in SOT.
- Validate navigation flows and route coverage.

### 2. API Endpoint Audit
- Enumerate all API endpoints exposed for the feature (REST, GraphQL, etc.).
- Compare implemented endpoints against SOT/API contract:
  - Identify missing endpoints, methods, or payloads.
  - Validate request/response schemas and error handling.
- Test endpoint functionality (can be simulated):
  - Run test scripts to check for expected responses and error cases.
  - Flag endpoints that do not return expected results or are not wired to frontend.

### 3. Backend Logic & Service Audit
- Read backend service files (controllers, services, business logic).
- Map each function to its corresponding SOT requirement.
- Identify missing, incomplete, or non-functional logic.
- Validate that all business rules, validation, and operational flows are implemented as per SOT.
- Check for unhandled edge cases and error propagation.

### 4. Database & Prisma Model Audit
- Read Prisma schema and migration files.
- Compare models, fields, and relations against SOT/data contract.
- Identify missing tables, fields, or relations.
- Validate that all required constraints, indexes, and relations are present.
- Check for orphaned or unused models.

### 5. E2E Functional Audit
- Run e2e test scripts (Cypress, Playwright, etc.) to simulate user flows.
- Validate that all critical paths (create, edit, delete, view, etc.) work as expected.
- Identify any broken flows, missing feedback, or unhandled errors.
- Compare e2e coverage against SOT acceptance criteria.

### 6. Internal Wiring & Integration Audit
- Trace the wiring between frontend controls, API calls, backend logic, and database operations.
- Identify any broken, missing, incomplete, or non-existent integrations.
- Flag any control, UI element, or endpoint that is not connected to its intended backend or database logic, or is present in the UI but not functional ("static only").
- Validate that all data flows are deterministic and traceable.

### 7. SOT Comparison & Gap Analysis
- For each audit scope, compare the actual implementation against the SOT (contract, plan, requirements).
- List all missing, incomplete, or non-functional elements.
- Flag any deviation from SOT (extra, missing, or altered functionality).
- Provide a summary table of gaps by scope (UI, API, backend, DB, e2e).

### 8. Automated Test Script Execution
- Run or simulate automated test scripts for all critical flows.
- Capture and report all test failures, errors, and warnings.
- Map test failures to SOT requirements and implementation gaps.

### 9. Audit Reporting & Recommendations
- Generate a detailed audit report:
  - List all findings, gaps, and missing elements by scope.
  - Provide actionable recommendations for remediation.
  - Highlight critical blockers and SOT misalignments.
  - **Include a dedicated section titled "Static/Unused/Non-Functional UI Elements" that lists every UI/UX element (button, modal, control, etc.) that is present in the UI but not connected to any backend, API, or operational logic. For each, specify the file/component, location, and recommended action (e.g., remove, wire up, clarify purpose).**
- Output the report in markdown or structured format for review.

---

## Instructions for AI Agent
- Follow each audit scope in order.
- For each scope, read all relevant files and implementation surfaces.
- Compare every finding against the SOT and acceptance criteria.
- Run or simulate test scripts where possible.
- Output a comprehensive, actionable audit report.
- Flag any area where the audit could not be completed due to missing context or files.

---


## Example Output Structure
- Audit Scope: [Page & Modal Audit]
  - Findings: [...]
  - Gaps: [...]
  - Recommendations: [...]
- Audit Scope: [API Endpoint Audit]
  - Findings: [...]
  - Gaps: [...]
  - Recommendations: [...]
- ...
- **Static/Unused/Non-Functional UI Elements:**
  - [List of all static, unused, or non-functional UI/UX elements, with file/component, location, and recommended action.]
- Summary Table: [Scope | Missing | Incomplete | Non-functional | SOT Deviations]

---

## Notes
- This audit prompt is designed for use after feature implementation.
- The AI agent should be able to read code, run test scripts, and compare against SOT files.
- The audit is intended to be comprehensive, e2e, and SOT-driven.
- Enhance or extend audit scopes as needed for your project.
