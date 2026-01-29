# E2E Feature Implementation Inventory & Mapping Audit Prompt

## Purpose
This prompt guides an AI agent to perform a comprehensive, implementation-driven inventory and mapping audit of a feature across all code surfaces—frontend, backend, API, and database. The goal is to produce a clear, accurate, and actionable map of the current state of the feature as implemented in the codebase (src, prisma, etc.), without comparing to any prototype or external SOT. This audit is intended to provide a factual baseline for further enhancement, refactoring, or expansion.

---

## Audit Scopes

### 1. File & Directory Inventory
- Enumerate all relevant files and folders for the feature (pages, components, API routes, services, models, migrations, utils, etc.).
- Output a structured tree or table showing the organization and location of all code assets.

### 2. Frontend Implementation Mapping
- List all implemented pages, modals, and UI components for the feature.
- For each, summarize its purpose, key props/state, and any known triggers or flows.
- Identify all entry points and navigation routes.

### 3. API Endpoint Mapping
- Enumerate all API endpoints (REST, GraphQL, etc.) implemented for the feature.
- For each endpoint, document:
  - Method, path, handler file
  - Request/response schema (summarized)
  - Main logic or service called
  - Any authentication/authorization

### 4. Backend Logic & Service Mapping
- List all backend service files, controllers, and business logic modules for the feature.
- For each, summarize its main responsibilities and how it is invoked (API, cron, internal, etc.).
- Note any background jobs, automation, or scheduled tasks.

### 5. Database & Prisma Model Mapping
- List all Prisma models, enums, and migrations related to the feature.
- For each model, summarize fields, relations, and key constraints.
- Note any indexes, triggers, or special DB logic.

### 6. E2E Flow Trace
- Map the end-to-end flow for key user actions (e.g., create, edit, publish, schedule, reject, etc.).
- For each flow, list the sequence of frontend → API → backend → DB operations.
- Note any known gaps, dead ends, or areas needing enhancement.

### 7. Audit Reporting
- Output a detailed, structured report (markdown or table) with:
  - File/directory tree
  - Component and endpoint inventories
  - Flow diagrams or step lists
  - Observed gaps, TODOs, or areas for improvement
- Do not compare to any prototype or SOT—focus only on what is actually implemented.

---

## Instructions for AI Agent
- Read all relevant code and documentation for the feature.
- For each scope, produce a factual, implementation-driven inventory and mapping.
- Do not compare to any external SOT, prototype, or requirements doc.
- Output a comprehensive, actionable audit report for use in enhancement planning.
- Flag any area where the audit could not be completed due to missing context or files.

---

## Example Output Structure
- File & Directory Inventory: [...]
- Frontend Implementation Mapping: [...]
- API Endpoint Mapping: [...]
- Backend Logic & Service Mapping: [...]
- Database & Prisma Model Mapping: [...]
- E2E Flow Trace: [...]
- Observed Gaps & TODOs: [...]

---

## Notes
- This audit prompt is for implementation inventory and mapping only.
- It is not for SOT/prototype comparison or requirements validation.
- Use this as a baseline for enhancement, refactoring, or expansion planning.
