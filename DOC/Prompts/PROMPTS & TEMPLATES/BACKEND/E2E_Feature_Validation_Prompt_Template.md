---
description: "E2E Feature Validation & Reconciliation Prompt Template"
---

# EXECUTION-GRADE AI PROMPT

**E2E Feature Validation & Reconciliation (Original Plan → UI/UX → Backend → Final Product)**

---

## 0. NON-NEGOTIABLE RULES

1) **Read and follow project guidelines before doing anything else**:
- `DOC/GUIDELINES & SOT/README.md`

2) **No assumptions allowed**
- If anything is unclear, list it under **Unknowns** and propose the minimum set of questions needed.

3) **No partial acceptance**
- A flow is only “OK” if it is complete E2E: UI → API → DB → UI (or explicitly documented as intentionally deferred).

4) **Audit-first, then recommend changes**
- Do NOT implement code unless explicitly instructed. Output must be an audit + reconciliation plan.

---

## 1. ROLE

You are a **Senior Full-Stack SaaS Engineer AI** responsible for validating that a feature is delivered end-to-end (E2E) as originally planned, with no partial implementations or missing flows.

Your job is to:
- Reconcile the original feature plan, the current UI/UX, and the backend implementation.
- Identify any missing, changed, or illogical flows, endpoints, or UI elements.
- Ensure the final product matches the original intent, or document and justify any changes.

---


## 2. INPUTS (News Engine Feature Example)

- **Original Plan:**
  - `DOC/FEATURES/NEWS ENGINE/Plan/CHatGPT.md`
- **SOT (Source of Truth) & 6-Phase Docs:**
  - `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md` (main SOT doc)
  - `DOC/FEATURES/NEWS ENGINE/SOT/README.md` (phase tracking, status, lessons)
- **Feature README (high-level entrypoint):**
  - `DOC/FEATURES/NEWS ENGINE/README.md`
- **UI/UX Source of Truth:**
  - `DOC/FEATURES/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin- V6` (prototype)
  - `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/` (frontend UI/UX prompt plans)
  - `src/components/news-engine/` (actual implementation)
- **UX Fine-Tuning / Final UI Notes:**
  - `DOC/FEATURES/NEWS ENGINE/UX-FINE-TUNING-PLAN-2026-01-03.md`
- **Backend Plan & Implementation:**
  - `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-2026-01-04.md`
  - `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/tasks.md`
  - `src/app/api/news/` and `src/app/api/admin/news-engine/` (API routes)
  - `prisma/schema.prisma` (DB models)
- **Known Stub That Must Be Eliminated for True E2E:**
  - `src/lib/ui-stubs/news-engine.ts` (localStorage-based; must not be the source of truth in the final E2E state)
- **Tasks/Checklist:**
  - `DOC/FEATURES/NEWS ENGINE/tasks.md` (single feature task SOT; includes migration/backend/test phases)

Legacy note: if older folders contain additional `tasks.md` files (e.g., `BACKEND PLAN/tasks.md`), treat them as deprecated and migrate their contents into the single root `DOC/FEATURES/NEWS ENGINE/tasks.md`.

> Update these references if your feature uses different folders or filenames.

---

## 3. VALIDATION STEPS

### Step 0 — Define the Target “Done” State (Mandatory)

Write a short, explicit **Definition of Done** for the feature based on:
- The original plan (must-have intent)
- The final UI/UX currently implemented (must-have actions & screens)
- The backend plan decisions (e.g., soft delete, HTML content, SEO fields, scheduled auto-publish deferred)

This is the acceptance contract. If something is out of scope or deferred, it must be listed explicitly.

### A. Feature Matrix Construction
- For every user story, action, and flow in the original plan:
  - Map to UI element (modal, button, page, etc.)
  - Map to API endpoint (route, method, payload)
  - Map to DB model/field (if applicable)
- Build a table:

| User Action/Story | UI Element | API Endpoint | DB Model/Field | Status (OK/Missing/Changed) |
|-------------------|------------|--------------|----------------|-----------------------------|
|                   |            |              |                |                             |

**Important:** For News Engine, include both:
- Admin flows (`/admin/news-engine` UI actions and `/api/admin/news-engine/*`)
- Public flows (`/news`, `/news/[slug]` and `/api/news/*`)

### B. Gap & Drift Analysis
- For each row, mark as OK, Missing, or Changed.
- If changed, document the reason and whether it is justified.
- Identify any UI elements or backend endpoints that exist but are not in the original plan (and justify or flag as scope creep).

### C. E2E Testing Checklist
- For every mapped flow:
  - Describe the E2E test (UI action → API call → DB effect → UI result)
  - Mark as Pass/Fail/Blocked
- Document any blockers or partial implementations.

**News Engine critical E2E check:** confirm the UI is not reading from localStorage stubs (`src/lib/ui-stubs/news-engine.ts`) for the final E2E path.

### D. Documentation & SOT Update
- Summarize findings.
- List all required changes to bring the feature to true E2E completion.
- Update SOT/README and plans to reflect the reconciled, final state.

**Rule:** If you recommend changing endpoints, naming, or payload shapes, you must update the documentation plan(s) first (backend plan + tasks) so implementation stays aligned.

### E. Verification Gates (Do Not Skip)

State what verification gates must pass for “Done”:
- `npx prisma validate` (if Prisma schema is involved)
- `npx tsc --noEmit`
- `npm run build`

If a gate is not runnable in the current state, mark it as **Blocked** and explain why.

---

## 4. OUTPUT FORMAT

- **Feature Matrix Table** (see above)
- **Gap/Drift Analysis** (list of missing/changed/extra items)
- **E2E Testing Checklist** (step-by-step, with status)
- **Summary & Action Plan** (what must be done to achieve E2E completeness)

### Required Output Locations (News Engine)

Create these audit deliverables (documentation only):
- `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/E2E-VALIDATION-REPORT-YYYY-MM-DD.md`
- If tasks need changes: update `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/tasks.md`
- If backend plan needs changes: update `DOC/FEATURES/NEWS ENGINE/BACKEND PLAN/BACKEND-PLAN-NEWS-ENGINE-2026-01-04.md`

---

## 5. SUCCESS CRITERIA

- Every user story and flow from the original plan is present and functional E2E (UI → API → DB → UI).
- No partial implementations remain.
- All changes from the original plan are documented and justified.
- SOT/README and plans are updated to match the true, final state.
- The feature is ready for production with no hidden gaps.

---

**Use this prompt to validate any feature for true E2E delivery, ensuring nothing is missed and all plans, UI, and backend are fully aligned.**
