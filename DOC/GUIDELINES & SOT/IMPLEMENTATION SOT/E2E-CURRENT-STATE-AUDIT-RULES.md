# E2E Current State Audit Rules (Frontend + Backend + DB)

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

Each feature audit report must include the sections below.

### A) Scope & entry points
- Feature name + affected user roles
- Primary entry routes/pages and where users click to reach them
- “In scope / out of scope” list

### B) Frontend (Routes, Pages, Components)
- All routes/pages involved (App Router paths)
- For each page:
  - what renders (major components)
  - what data it reads (props, hooks, adapters)
  - what state it stores (client state + sessionStorage/localStorage)
  - navigation behavior (push/redirect/deep link support)
- Feature-specific UI elements:
  - modals
  - toasts
  - tables
  - filters/search
  - empty states
- Any known broken UI (buttons that do nothing, missing inputs, dead links)

### C) Backend/API (Routes, Auth, Contracts)
- All API routes used by the feature (app routes under `/api/*`)
- For each endpoint:
  - method + path
  - auth requirement (session/cookies/role checks)
  - request/response shape (as implemented)
  - side effects (DB writes, external calls)
- Identify:
  - missing endpoints needed by the UI
  - endpoints that exist but are unused

### D) Data layer (Prisma / DB)
- Relevant Prisma models and enums
- Relationships that affect behavior
- Which fields are used by the UI
- Any “derived” values in code that should be canonical in DB
- Migration history considerations (if present)

### E) Business rules & state transitions
- Status/state machine table (if applicable):
  - action → from state → to state → visible UI change
- Role permissions:
  - who can see/do what

### F) Integrations & automation
- Webhooks
- Cron/schedulers
- External services used
- Idempotency & retry expectations

### G) Risks & coupling map
- Hard couplings like:
  - sessionStorage/localStorage dependencies
  - special routing assumptions
  - shared components relied upon by other pages
  - feature flags

### H) “What’s already there” inventory (anti-duplication)
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

If the blog post page already has share buttons in UI, the audit must record:
- share buttons: **Exists**
- behavior: **Non-functional** (if true)

Then the plan should say:
- “Keep share section; implement ‘Copy Link’ behavior”

Not:
- “Add share section”
