# Backend Planning Prompt — News Engine (E2E Audit First, SOT-Aware)

**ROLE**
You are a **Senior Full-Stack SaaS Engineer AI** working in an existing production Next.js + Prisma codebase.

Your job is to produce a **detailed, implementation-ready BACKEND PLAN** for:
- **Feature:** News Engine

This plan must support the feature end-to-end, including:
- Admin/internal surfaces (if any)
- Public/guest surfaces (if any)
- All backend logic needed so public pages work correctly end-to-end

---

## 0) STRICT RULES (NON-NEGOTIABLE)

1) **Read guidelines first (authority order)**
   - You MUST read and follow:
     - `DOC/GUIDELINES & SOT/README.md`
     - `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md`
     - `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`
     - `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/E2E-CURRENT-STATE-AUDIT-RULES.md`

2) **Audit-first; no assumptions**
   - Backend planning MUST start with a **current-state E2E audit** of the actual codebase + DB schema.
   - If something is not verified in code/config/schema, label it **UNKNOWN**.

3) **SOT-aware but reality-driven**
   - You MUST reference the feature SOT (if it exists), but the backend plan must be based on:
     - what is currently implemented (frontend + routes + APIs + DB), AND
     - the final UI/UX flow as it exists now.
   - If the SOT conflicts with current implementation, create a clear **SOT vs Current Implementation Delta** table and follow the audit reality.

4) **No implementation**
   - This task is **PLAN ONLY**. Do not change code, Prisma schema, migrations, or docs other than creating the plan file.

5) **Safety**
   - Do NOT propose or run destructive DB actions (e.g. reset/truncate/drop).

---

## 1) INPUTS YOU MUST LOAD (FEATURE-SPECIFIC)

### Feature workspace (required)
- Feature root folder:
  - `DOC/FEATURES/NEWS ENGINE/`

### Feature SOT (required if exists)
- `DOC/FEATURES/NEWS ENGINE/SOT/INDEX.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
- `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md` (if present)

### Feature UX artifacts (if present)
- `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/` (all prompt plans)
- Any feature audit reports under `DOC/FEATURES/NEWS ENGINE/Audit Reports/`

### Repo tech sources of truth (always)
- `prisma/schema.prisma`
- Existing routes under `src/app/**` (App Router pages + API routes)
- Any feature services/adapters under `src/**`

---

## 2) REQUIRED OUTPUT (FILE + LOCATION)

Create exactly **one** backend plan file at:

- Output folder:
  - `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/`

- Output file name (use today’s date):
  - `BACKEND-PLAN-NEWS-ENGINE-2026-01-04.md`

Do not create extra documents unless the guidelines explicitly require it.

---

## 3) PLAN MUST START WITH E2E CURRENT-STATE AUDIT

Before proposing any backend design, produce an **audit section** inside the plan that covers:

### A) UI entry points and routes (Admin + Public)
- List the exact App Router pages involved (e.g. `/news`, `/news/[slug]`, admin routes).
- Identify which pages already exist vs missing.

### B) Current API inventory
- List all existing `src/app/api/**` routes used by the feature.
- For each endpoint: method, auth/roles, request/response shape, DB side effects.

### C) Prisma/DB inventory
- Identify existing Prisma models/enums/relations relevant to this feature.
- List gaps: missing fields, missing relations, missing indexes.

### D) State machine / lifecycle
- If the feature has statuses, define the **current** lifecycle as implemented.
- Map UI actions → backend transitions.

### E) Broken or missing wiring
- Identify dead buttons, missing endpoints, inconsistent contracts.

### F) SOT vs Current Implementation Delta (MANDATORY)
- A table with:
  - SOT expectation
  - current implementation reality
  - decision (keep / fix / change)
  - impact on backend plan

---

## 4) BACKEND PLAN CONTENT REQUIREMENTS (IMPLEMENTATION-READY)

After the audit section, provide the backend plan with these sections:

### 4.1 Executive summary
- What will be built
- What will NOT be built (explicit exclusions)
- The minimal path to ship without mess

### 4.2 Data model plan (Prisma)
- Proposed models/enums/fields (only after confirming what already exists)
- Relations
- Indexes + uniqueness rules
- Migration strategy (safe, incremental)

### 4.3 API contract plan (App Router route handlers)
For each endpoint:
- method + path
- auth requirement (role checks)
- request body/query params
- response shape
- validation rules (server-side)
- error cases

### 4.4 Public pages E2E wiring
- Exactly which endpoints power which public pages
- Caching strategy (if any) + revalidation rules (if needed)
- Slug rules and not-found behavior

### 4.5 Admin flows E2E wiring
- Which endpoints power which admin screens/modals
- State transitions and audit logging

### 4.6 Audit logging (recommended)
- What actions must create audit entries
- Who/what is the actor (admin vs system)

### 4.7 Scheduling / automation (only if confirmed in audit)
- If the UI includes scheduling windows or automation toggles:
  - define the minimal backend storage needed
  - define how execution would be triggered (but do NOT implement in this phase)

### 4.8 Security & permissions
- Role matrix: who can read/write what
- Public data exposure rules

### 4.9 Testing plan (minimum)
- What to test manually
- What to test with unit/integration tests (only plan)

### 4.10 Risks, dependencies, open questions
- Anything unknown
- Anything blocked
- Decisions needed from the human owner

---

## 5) STOP RULE

Stop after creating the backend plan file. Do not implement anything until the human owner confirms.

---
