# E2E Current State Audit Rules (Frontend + Backend + DB)
---

## Audit Report Output Structure & Formatting (MANDATORY)

Every audit report must follow this structure and formatting to ensure clarity, completeness, and consistency:

### Required Section Order (Table of Contents)

1. **Scope & Entry Points**
2. **Frontend (Routes, Pages, Components, Assets)**
3. **Backend/API (Routes, Auth, Contracts, Middleware, Adapters)**
4. **Data Layer (Prisma / DB)**
5. **Business Rules & State Transitions**
6. **Integrations & Automation**
7. **Risks, Coupling Map & Config**
8. **Test Coverage & Documentation**
9. **Error Handling & Edge Cases**
10. **“What’s Already There” Inventory (Anti-Duplication)**
11. **UI-to-Backend Mapping Table**
12. **Conditional UI/Role/Feature Flag Coverage**
13. **Additional Audit Requirements**
14. **Audit Verification Checklist**

### Formatting Expectations
- Use clear markdown headings for each section (e.g., `## Scope & Entry Points`).
- Use tables where mapping or inventory is required (e.g., UI-to-Backend Mapping Table).
- Use bullet points or concise paragraphs for lists and explanations.
- Every required section must be present in the output, even if the answer is “N/A” or “UNKNOWN.”
- For each “Additional Audit Requirement,” explicitly state findings or “No gaps found.”

### Example Section Heading
```markdown
## Scope & Entry Points
- Feature: [Feature Name]
- Affected Roles: [List]
- Entry Routes: [List]
- In Scope: [List]
- Out of Scope: [List]
```

This structure is mandatory for all audit reports to ensure all required areas are addressed and easily reviewed.

**Purpose**: Define non-negotiable rules for producing a **complete, zero-assumption** current-state audit of an existing feature area before planning or implementation.

This exists to prevent:
- planning that conflicts with the current system,
- rebuilding UI/APIs that already exist,
- silent regressions from missing couplings (routing, storage, auth, state transitions).

---

## 1) Core Principles (Non‑Negotiable)

1) **No assumptions**
- If it is not verified in code/config/schema, it must be labeled **UNKNOWN**.

2) **Audit before planning**
- The audit is the baseline. The plan must reference it.

3) **Plan must not duplicate existing behavior**
- If a capability already exists (e.g., share buttons already present), the plan must say:
  - “Exists (keep)”, or
  - “Exists but broken (fix)”, or
  - “Exists but wrong UX (change)”.

4) **Compatibility first**
- If there are legacy routes, storage patterns, or existing UI flows, the audit must describe them so implementation can keep the app working while migrating.

---


## 2) Required Audit Outputs (What the audit MUST include)


Each feature audit report must include the sections below. The audit must be exhaustive and explicitly trace every interactive UI element to its backend handler or API. All user roles, feature flags, and conditional UI states must be covered.
### K) UI-to-Backend Mapping Table (MANDATORY)
- Create a table mapping every interactive UI element (button, form, modal, etc.) to its backend endpoint, handler, or service.
- Columns should include: UI Element | Page/Route | Expected Action | Backend Endpoint/Handler | Status (Exists/Needs Implementation)

### L) Conditional UI/Role/Feature Flag Coverage
- Explicitly document all UI elements that are conditionally rendered based on user role, feature flag, or state.
- For each, verify and document the backend connection or note as UNKNOWN if not found.

### A) Scope & Entry Points
- Feature name + affected user roles
- Primary entry routes/pages and where users click to reach them
- “In scope / out of scope” list

### B) Frontend (Routes, Pages, Components, Assets)
- All routes/pages involved (App Router paths)
- For each page:
  - what renders (major components)
  - what data it reads (props, hooks, adapters)
  - what state it stores (client state + sessionStorage/localStorage)
  - navigation behavior (push/redirect/deep link support)
  - static/public assets used (images, files, etc.)
- Feature-specific UI elements:
  - modals
  - toasts
  - tables
  - filters/search
  - empty states
- Any known broken UI (buttons that do nothing, missing inputs, dead links)
- Third-party scripts, analytics, or SDKs present in the frontend

### C) Backend/API (Routes, Auth, Contracts, Middleware, Adapters)
- All API routes used by the feature (app routes under `/api/*`)
- For each endpoint:
  - method + path
  - auth requirement (session/cookies/role checks)
  - request/response shape (as implemented)
  - side effects (DB writes, external calls)
  - middleware or shared utilities involved (auth, logging, error handling, etc.)
  - adapters or service layers between API and DB
- Identify:
  - missing endpoints needed by the UI
  - endpoints that exist but are unused
  - partial, legacy, or orphaned backend files, models, or logic (present but not wired to UI/API)
  - deprecated or versioned APIs

### D) Data Layer (Prisma / DB)
- Relevant Prisma models and enums
- Relationships that affect behavior
- Which fields are used by the UI
- Any “derived” values in code that should be canonical in DB
- Migration history considerations (if present)
- Orphaned or unused models/fields

### E) Business Rules & State Transitions
- Status/state machine table (if applicable):
  - action → from state → to state → visible UI change
- Role permissions:
  - who can see/do what

### F) Integrations & Automation
- Webhooks
- Cron/schedulers
- External services used
- Idempotency & retry expectations
- Third-party integrations (SDKs, analytics, payment, etc.)

### G) Risks, Coupling Map & Config
- Hard couplings like:
  - sessionStorage/localStorage dependencies
  - special routing assumptions
  - shared components relied upon by other pages
  - feature flags
- Environment/config dependencies (env vars, config files, feature flags)

### H) Test Coverage & Documentation
- Inventory of existing unit, integration, and e2e tests for the feature
- Summary of what is covered and what is not
- In-code comments or documentation relevant to the feature

### I) Error Handling & Edge Cases
- How errors are currently handled (frontend, API, DB)
- Known edge cases and their current handling

### J) “What’s Already There” Inventory (Anti-Duplication)
For each planned capability, label one of:
- **Exists & works** (do not re-implement)
- **Exists but broken** (fix)
- **Does not exist** (implement)
- **Exists but wrong UX** (change only if approved)

---


## 3) Audit Verification Checklist (Minimum)

The audit is incomplete unless it answers:
- Where is the UI entry point?
- What pages/routes are involved?
- What are the data sources today?
- What APIs are called (or missing)?
- What DB entities exist (or don’t)?
- What role checks exist?
- What flows are deep-link safe vs state-dependent?
- Does every interactive UI element have a mapped backend handler or API? (see UI-to-Backend Mapping Table)
- Are all conditional UI elements (roles, feature flags, states) covered and mapped?

---

## 4) Required File Location & Naming

- Put the audit report inside the feature SOT folder:
  - `DOC/Features/<Feature Name>/SOT/CURRENT-STATE-E2E-AUDIT.md`
  - or `DOC/Features/<Feature Name>/SOT/CURRENT-UI-AUDIT-<area>.md` (when multiple audits are needed)

- The feature SOT index MUST link it:
  - `DOC/Features/<Feature Name>/SOT/INDEX.md`

---

## 5) Planning Rules (How plans must use the audit)

All planning docs must explicitly reference the audit and carry forward the verified reality:
- `FEATURE-SOT.md` Phase 0 must summarize the key findings.
- `Frontend-Plan.md` must match existing routes/UX unless an intentional change is listed.
- `IMPLEMENTATION-PLAN.md` must sequence changes safely (compat routes first, canonical later).
- `tasks.md` must include tasks for fixing broken existing UI elements before building net-new.

---

## 6) Stop Rules

Stop and ask the user before planning/implementation if:
- the audit reveals conflicting “sources of truth” (UI vs API vs DB)
- the current system relies on brittle storage hacks (sessionStorage for navigation)
- the plan would remove/replace a UX the business relies on

---

## 7) Example (Blog)
---

## Additional Audit Requirements

Every audit must also include:
- Review of observability: logging, metrics, and alerting coverage for the feature (identify any gaps or missing monitoring)
- Data privacy, retention, and compliance review for all data flows (GDPR, CCPA, etc. as applicable)
- Migration and upgrade history: list past migrations, rollbacks, or failed upgrades if present
- API versioning and deprecation: identify any deprecated, versioned, or shadow APIs
- Security review: authZ/authN gaps, secrets management, and exposure risks

If the blog post page already has share buttons in UI, the audit must record:
- share buttons: **Exists**
- behavior: **Non-functional** (if true)

Then the plan should say:
- “Keep share section; implement ‘Copy Link’ behavior”

Not:
- “Add share section”
