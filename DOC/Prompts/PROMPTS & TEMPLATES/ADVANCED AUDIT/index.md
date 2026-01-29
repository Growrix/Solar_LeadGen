# ADVANCED AUDIT — Prompt Index


This directory contains advanced audit prompt files for AI-driven feature and system audits. Use this index to understand the purpose, scope, and recommended usage for each file.


## File Index


### 1. comprehensive-feature-implementation-audit-prompt.md
**Purpose:** Guides AI agents through a deep, multi-surface audit of newly implemented features.
**Scope:** Frontend pages/modals, API endpoints, backend logic, Prisma/database models, e2e tests, internal wiring, SOT comparison, automated test execution, and reporting.
**Usage:** Run after building a feature to validate completeness, SOT alignment, and operational traceability.
**Output:** Detailed audit report with findings, gaps, recommendations, and summary tables.

### 2. Advanced_SystemAudit_Prompt.md
**Purpose:** Directs an AI auditor to perform a comprehensive, advanced-level audit of the entire SaaS system (backend, frontend, database).
**Scope:** Data structure, advanced querying, analytics, security, compliance, scalability, observability, workflow, and user experience.
**Usage:** Use for periodic or milestone system-wide audits to identify architectural, security, and operational improvement opportunities.
**Output:** Executive summary, detailed findings, actionable recommendations, and reviewed files/endpoints/models list.

### 3. Prototype Audit & Enhancement_Prompt.md
**Purpose:** Provides universal, repeatable instructions for auditing any frontend prototype or implementation against its approved plans and SOT documentation, especially during enhancement phases.
**Scope:** E2E UI/UX, unfinished triggers, missing endpoints, prototype-vs-SOT comparison, enhancement plan creation (additive only).
**Usage:** Use during frontend enhancement phases to find gaps, create enhancement plans, and ensure traceability before sign-off.
**Output:** Audit report and additive enhancement prompts.

### 4. Prototype vs SOT Audit_Prompt.md
**Purpose:** Focuses on comparing a frontend prototype against the SOT (Source of Truth) in enhancement phases, ensuring all enhancements are additive and SOT is not updated in this phase.
**Scope:** Prototype-vs-SOT comparison, identification of unimplemented SOT steps, additive prompt creation.
**Usage:** Use in Phase 3 (Frontend Enhancement) to ensure all SOT steps are implemented and enhancements are tracked additively.
**Output:** List of new enhancement prompts and unimplemented SOT steps.

### 5. SOT Sync Audit_Prompt.md
**Purpose:** Guides the final SOT sync audit (Phase 4), ensuring SOT and plan files are fully aligned with the latest frontend prototype and initial plan.
**Scope:** SOT/plan file audit and update only (no frontend code changes), alignment with prototype and plan, documentation of changes.
**Usage:** Use in Phase 4 (SOT Sync) after frontend implementation and enhancement are complete.
**Output:** Updated SOT/plan files, audit log, and summary of changes.


## How to Use


## Notes
