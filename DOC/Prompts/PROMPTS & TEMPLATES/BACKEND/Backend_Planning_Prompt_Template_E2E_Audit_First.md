# Backend Planning Instructions (E2E, Industry Standard)

**Purpose:**
This document provides strict, industry-standard instructions for AI to plan a complete, auditable, and implementation-ready backend for any feature in a production SaaS codebase. The AI must follow these steps and rules exactly, using the feature name provided in the prompt.

---

## Backend Planning (Based on Completed Audit)

The backend plan must be based strictly on the completed audit report for the feature (produced in Phase 1). Do NOT repeat or perform a new audit. Only use the audit report as the baseline. If any required audit section is missing or unclear, list it as an unknown and request clarification before proceeding.

---

## Backend Plan Requirements

Create a detailed backend plan that includes:
- Executive summary (scope, exclusions, minimal path to ship)
- Data model plan (Prisma models, relations, indexes, migration strategy)
- API contract plan (endpoints, methods, auth, validation, error cases)
- Public pages E2E wiring (endpoint-to-page mapping, caching, slug rules)
- Admin flows E2E wiring (endpoint-to-admin mapping, state transitions, audit logging)
- Audit logging requirements (actions, actors)
- Scheduling/automation (if present in UI)
- Security & permissions (role matrix, data exposure)
- Testing plan (manual, unit/integration, E2E test matrix: every UI element must have a test verifying backend integration)
- UI-to-Backend Mapping Table and E2E test matrix must be included and referenced
- Explicit verification that every interactive UI element is powered by backend logic and is functional
- Risks, dependencies, open questions
- Reference and address all findings from the audit report, including:
  - UI/UX elements not feasible for backend implementation (with reasons)
  - Conditional UI/Role/Feature Flag Coverage
  - Unknowns, gaps, or inconsistencies

---

## Rules & Compliance

- The backend plan and all implementation steps must never require a database reset, truncate, or destructive migration. All migrations must be additive and backward-compatible.
- All data model changes must be designed for zero-downtime, additive migrations. No breaking changes or destructive schema modifications are allowed. Plan for data backfills and safe rollouts.
- Never recommend dropping, truncating, or overwriting existing data. All migrations and changes must preserve all user and business data.
- Do NOT propose or run destructive DB actions (reset/truncate/drop).
- Do NOT implement code, migrations, or schema changes—planning only.
- Do NOT overwrite or delete existing documentation.
- Only add new files/folders or append to documentation as instructed.
- Do not automate any schema or data changes without explicit human approval and a rollback plan.
- The AI must never decide to perform or recommend any operation that could risk data loss, downtime, or require manual intervention for recovery. If a required change is risky or unclear, it must be flagged for explicit human review and approval.
- If the plan encounters any ambiguity, risk, or edge case not covered by these instructions, it must stop and request explicit human direction before proceeding.
- All backend plans must consider scalability and performance. Avoid N+1 queries, blocking operations, or synchronous external calls in critical paths. Document any potential bottlenecks.
- If anything is unclear, list it as an unknown—do not assume.
- The plan must be clear, actionable, and detailed enough for any developer or AI to implement without ambiguity.
- All backend logic must be auditable, testable, and traceable to the UI/UX and business requirements.
- Backend implementation is not complete until every interactive UI element is verified to be powered by backend logic and is functional (with evidence in the mapping table and test matrix).

---

## Output

Place the backend plan in the specified feature’s documentation folders as instructed in the prompt.

---

## Additional Backend Plan Requirements

The backend plan must also include:
- Rollback and recovery plan for all backend changes (API, business logic, data model)
- Observability and monitoring plan (logging, metrics, alerting for new/changed features)
- Data privacy, retention, and compliance review (GDPR, CCPA, etc. as applicable)
- Migration testing plan (dry-run, rollback validation, test coverage)
- Identification and handling of legacy, partial, or orphaned backend logic
- Documentation update plan (ensure all new/changed features are documented and linked)
---
