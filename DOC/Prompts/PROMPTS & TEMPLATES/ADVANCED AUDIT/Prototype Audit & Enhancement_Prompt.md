

# Universal Frontend Audit Instructions (2026-01-06 Update)

> **IMPORTANT WORKFLOW UPDATE (Enhancement Phase):**
> - During the enhancement phase, the audit must focus on finding issues, unfinished triggers, missing endpoints, and e2e UI/UX gaps in the prototype.
> - The audit should then compare the prototype vs SOT/plan to identify any missing gaps.
> - **Do NOT focus on updating SOT files in this phase.**
> - After the audit, prepare the audit report as instructed in the user prompt.
> - If gaps are found, create an enhancement plan and add new frontend prompts after existing prompts (additive only), as instructed in the user prompt.
> - Keep all existing prompts and SOT files unchanged during this phase.
> - Use the audit instructions below for the audit process, but follow the user's prompt for all file locations and context.


> **Purpose:**
> These instructions define a universal, repeatable process for auditing any frontend prototype or implementation against its approved plans and SOT (Source of Truth) documentation. Follow these steps to ensure 100% alignment before sign-off or further enhancement.

---



## Audit Instructions (E2E Prototype vs SOT/Plan — Enhancement Phase Workflow)

### Step 1: Audit
- Deeply audit the updated prototype as per the instructions below.
- Focus first on finding issues, unfinished triggers, missing endpoints, and e2e UI/UX gaps in the prototype.
- Then compare vs SOT/plan to find any missing gaps.
- Do **not** update SOT files in this phase.
- Prepare the audit report as instructed in the user prompt.

### Step 2: Analyze & Enhance
- After the audit findings, create an enhancement plan for all missing gaps and inaccuracies found.
- Add new frontend enhancement steps/prompts after existing prompts (additive only), as instructed in the user prompt.
- Do not modify or delete existing prompts; only add new ones for traceability.

### Strict Rules
- Use this audit instruction file for all audits.
- All new prompts must be added after existing ones in the system plan file (see user prompt for file location).
- Do not update SOT files during this enhancement phase.




...existing code...

> **Instructions:**
> - Always follow this audit process for any frontend feature before sign-off or further enhancement.
> - Use the universal audit report template to document your findings and actions.
> - Do not skip any step; full traceability and alignment are required for every audit.

---


# Universal Frontend Audit Report Template

> **Purpose:**
> This template is for auditing a frontend prototype or implementation against the latest approved Initial Plan and SOT (Source of Truth) documentation. Use it to ensure 100% alignment before sign-off or further enhancement.

---

## 1. Audit Metadata
- **Feature/Module Audited:** [e.g., BLOG, NEWS ENGINE]
- **Prototype/Implementation Reference:** [Path or version]
- **Initial Plan Reference:** [Path]
- **SOT Reference(s):** [List all relevant SOT files]
- **Audit Date:** [YYYY-MM-DD]
- **Auditor:** [Name or role]

---

## 2. Audit Scope
- **What was audited:** [Describe the prototype, pages, modals, flows, etc.]
- **What was NOT audited:** [Explicitly list any areas excluded from this audit]

---


## 3. Methodology

**How the audit was performed:**

### 3.1 Prototype-First Comprehensive Audit
- [ ] Deeply review the prototype UI/UX itself, independent of SOT, to identify:
  - All missing, unfinished, or non-functional triggers (buttons, links, icon buttons, dropdowns, toggles, tabs, menus, row actions, bulk actions, etc.)
  - Any missing or incomplete modals, drawers, or forms
  - Gaps in e2e flows (can the user complete all intended actions? Are there dead ends or missing confirmations?)
  - UI/UX logic issues (illogical flows, inconsistent states, unclear feedback, missing validations, etc.)
  - Unreachable, dead, or misleading controls
  - Any unfinished, placeholder, or stubbed UI that should be functional in this phase
  - Any missing feedback (toasts, banners, confirmations) for user actions
  - Any other UI/UX issues that would block a complete, logical, and testable frontend experience
- [ ] Document all findings in detail, referencing the prototype location (page, modal, flow, etc.)

#### 3.1.1 Mandatory E2E “State Destination” Audit (Prevents Half-Flows)
- [ ] For every entity the UI manages (examples: Posts, Comments, Media, Drafts, Sources), define a **Lifecycle State Map** from the UI perspective:
  - States (examples): `draft`, `published`, `scheduled`, `needs_review`, `rejected`, `trashed`, `archived`, `hidden`, `spam`
  - For each state: where does the item live in the UI (page/tab/section)?
- [ ] For every destructive or “remove” action (Trash/Delete/Reject/Hide): verify the UI provides a deterministic destination:
  - If the intended behavior is **soft delete**: you MUST have a “Trash/Rejected/Archived” surface where items move, and actions to Restore / Permanently Delete.
  - If the intended behavior is **hard delete**: you MUST have confirmation + a deterministic success outcome.
- [ ] If an action removes an item from a list, the audit must answer: “Where can the user find it now?” If the answer is “nowhere”, it is an audit failure.

#### 3.1.2 Mandatory “Management Surfaces” Coverage Audit (Prevents Partial Admin UX)
- [ ] Create a **Surfaces Inventory** of the prototype UI (every page/tab/table/list/grid that manages items).
- [ ] For each surface, document:
  - What entities it manages (e.g., posts, comments, media, sources, drafts)
  - What actions exist (view/edit/status change/remove/restore/export/etc.)
  - Whether the surface supports:
    - Single-item actions (row actions)
    - Multi-item actions (batch operations) (only if appropriate)
    - Filters/search/sorting (only if appropriate)
- [ ] If a surface has any removal/moderation/status-change actions, verify the full flow exists end-to-end (trigger → confirmation → state destination → undo path if applicable).

#### 3.1.3 Backend-Friendly Action Mapping (No backend docs, but prevents missing capabilities)
- [ ] For each interactive action (single and bulk), capture an **Action Contract Stub**:
  - UI trigger → expected state change → success feedback → error feedback
  - Expected backend capability (name only; no backend plan): e.g., “trashItem”, “restoreItem”, “updateStatus”, “deletePermanently”, “createItem”, “editItem”
- [ ] This is not backend documentation; it is an audit artifact to ensure the UI is backend-implementable without surprises.

### 3.2 SOT/Plan Comparison (Secondary)
- [ ] After the prototype-first audit, compare the prototype against the latest SOT/plan:
  - Identify any required flows, triggers, or UI/UX elements in the SOT/plan that are missing or incomplete in the prototype
  - Identify any extra or changed elements in the prototype that are not covered by the SOT/plan (note: these may be intentional updates—just document them)
- [ ] Document all SOT/plan gaps or mismatches, referencing both the prototype and SOT/plan locations

### 3.3 Summary
- [ ] Clearly distinguish between prototype-found issues and SOT/plan comparison gaps in your findings
- [ ] Do not update SOT files in this phase—focus only on frontend completeness and logic

---

## 4. Audit Findings

### 4.1 What Matches (Fully Aligned)
- [List all flows, pages, modals, and states that match the plan/SOT exactly]

### 4.2 Gaps & Issues (Missing or Not Accurate)
- [List all missing, incomplete, or inaccurate items, referencing plan/SOT step numbers or sections]
- [For each gap, specify:]
  - **Location/Step:**
  - **Expected:**
  - **Actual:**
  - **Impact:**
  - **Suggested Fix:**

---

## 5. Enhancement Plan (If Gaps Found)
- [If any gaps/issues were found, outline a step-by-step enhancement plan.]
- [Each step should reference the prompt plan and SOT, and specify if new prompts or UI/UX steps are needed.]

### 5.1 Enhancement Plan Requirements (E2E + Backend-Friendly)
- [ ] Every enhancement must include the **complete flow**, not just the initiating button:
  - Trigger → modal/page → confirmation → destination state → where the item appears next → how to undo (if applicable)
- [ ] If you add any new action category (single-item, multi-item/batch, or system-level), you must also add:
  - Confirmation UX for destructive actions
  - Post-action destination surface for any soft-removal states (Trash/Rejected/Archived/etc.)
  - Restore/permanent delete flows if soft removal exists
- [ ] Each enhancement step must be additive-only (append prompts after existing ones).

---

## 6. Green Signal (If Fully Aligned)
- [If no gaps/issues were found, state clearly:]
  - "The prototype matches the Initial Plan and SOT 100%. Green signal to move forward."

---

## 7. Audit Log & Traceability
- **Files Updated:** [List all files updated as a result of this audit]
- **Next Steps:** [What happens after this audit—e.g., implementation, sign-off, further review]

---

> **Instructions:**
> - Always attach this completed audit report to the feature’s audit folder.
> - During the enhancement phase, do not update SOT files; only append new frontend prompts and update the prototype as needed.
> - Use this template for all future frontend audits for consistency.
