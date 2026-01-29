




# IMPLEMENTATION VS PROTOTYPE AUDIT INSTRUCTIONS

**Purpose:**
Audit the current implementation (site as built) against the approved prototype. Identify all missing, incomplete, or inaccurate features, flows, and UI/UX elements. All enhancements must be additive and appended only to the system plan.

**Workflow:**
- Do NOT update or edit the implementation (site) files directly during this phase.
- All enhancements must be additive and appended only to the system plan.
- If unsure, always default to additive prompts and do not modify the implementation directly.

---

## Audit Steps

1. **Preparation**
  - Review the prototype and the current implementation side-by-side.
  - Do not update implementation files directly during this phase.

2. **Audit**
  - For each gap, specify:
    - **Location/Step:** (page, modal, flow, etc.)
    - **Expected (from prototype):**
    - **Actual (in implementation):**
    - **Suggested Fix:**
  - Document all findings in detail, referencing both the prototype and implementation locations.

3. **Enhancement Plan**
  - For each gap or issue, outline a step-by-step enhancement plan.
  - Add new frontend enhancement steps/prompts after existing ones (additive only).
  - Do not modify or delete existing prompts; only add new ones for traceability.

4. **Strict Rules**
  - Implementation sync is strictly Phase 4 only.
  - Do NOT update implementation files directly during this phase.

5. **Green Signal**
  - If no gaps/issues are found, state clearly:
    "The implementation matches the prototype 100%. Green signal to move forward."

6. **Audit Log**
  - List all files updated as a result of this audit.
  - State the next steps (e.g., implementation, sign-off, further review).

---

## Audit Report Template

| Location/Step | Expected (from prototype) | Actual (in implementation) | Suggested Fix |
|---------------|--------------------------|----------------------------|---------------|
|               |                          |                            |               |

---

**Instructions:**
- Always attach this completed audit report to the feature’s audit folder.
- If you update the plan or implementation as a result, update all relevant prompts and implementation files.
- Use this template for all future frontend audits for consistency.


# Universal Frontend Audit Instructions (2026-01-06 Update)

> **NOTE (Workflow Alignment):**
> - For **Phase 3 (Frontend Enhancement)**, prefer using:
>   - `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/Prototype Audit & Enhancement_Prompt.md`
> - It contains the stricter E2E lifecycle + management-surfaces coverage gates needed to prevent partial enhancements.
> - This file can still be used for basic prototype-vs-implementation comparisons, but it is not the recommended Phase 3 driver.

> **IMPORTANT WORKFLOW UPDATE (Enhancement Phase):**
> - During the enhancement phase, the audit must focus on finding issues, unfinished triggers, missing endpoints, and e2e UI/UX gaps in the prototype.
> - The audit should then compare the prototype vs the current implementation to identify any missing gaps.
> - **Do NOT focus on updating implementation files in this phase.**
> - After the audit, prepare the audit report as instructed in the user prompt.
> - If gaps are found, create an enhancement plan and add new frontend prompts after existing prompts (additive only), as instructed in the user prompt.
> - Keep all existing prompts and implementation files unchanged during this phase.
> - Use the audit instructions below for the audit process, but follow the user's prompt for all file locations and context.


> **Purpose:**
> These instructions define a universal, repeatable process for auditing any frontend prototype against the current implementation (the site as built). Follow these steps to ensure 100% alignment before sign-off or further enhancement.

---



## Audit Instructions (E2E Prototype vs Implementation — Enhancement Phase Workflow)

### Step 1: Audit
- Deeply audit the updated prototype as per the instructions below.
- Focus first on finding issues, unfinished triggers, missing endpoints, and e2e UI/UX gaps in the prototype.
- Then compare vs the current implementation to find any missing gaps.
- Do **not** update implementation files in this phase.
- Prepare the audit report as instructed in the user prompt.

### Step 2: Analyze & Enhance
- After the audit findings, create an enhancement plan for all missing gaps and inaccuracies found.
- Add new frontend enhancement steps/prompts after existing prompts (additive only), as instructed in the user prompt.
- Do not modify or delete existing prompts; only add new ones for traceability.

### Strict Rules
- Use this audit instruction file for all audits.
- All new prompts must be added after existing ones in the system plan file (see user prompt for file location).
- Do not update implementation files during this enhancement phase.




...existing code...

> **Instructions:**
> - Always follow this audit process for any frontend feature before sign-off or further enhancement.
> - Use the universal audit report template to document your findings and actions.
> - Do not skip any step; full traceability and alignment are required for every audit.

---



# Universal Frontend Audit Report Template

> **Purpose:**
> This template is for auditing a frontend prototype against the current implementation (site as built). Use it to ensure 100% alignment before sign-off or further enhancement.

---


## 1. Audit Focus
- Compare the prototype and the current implementation only.
- Identify and list all missing, incomplete, or inaccurate features, flows, UI/UX elements, and behaviors in the implementation compared to the prototype.
- For each gap, specify:
  - **Location/Step:**
  - **Expected (from prototype):**
  - **Actual (in implementation):**
  - **Suggested Fix:**

---

## 2. Audit Scope
- **What was audited:** [Describe the prototype, pages, modals, flows, etc.]
- **What was NOT audited:** [Explicitly list any areas excluded from this audit]

---


## 3. Methodology

**How the audit was performed:**

### 3.1 Prototype-First Comprehensive Audit
- [ ] Deeply review the prototype UI/UX itself to identify:
  - All missing, unfinished, or non-functional triggers (buttons, links, icon buttons, dropdowns, toggles, tabs, menus, row actions, bulk actions, etc.)
  - Any missing or incomplete modals, drawers, or forms
  - Gaps in e2e flows (can the user complete all intended actions? Are there dead ends or missing confirmations?)
  - UI/UX logic issues (illogical flows, inconsistent states, unclear feedback, missing validations, etc.)
  - Unreachable, dead, or misleading controls
  - Any unfinished, placeholder, or stubbed UI that should be functional in this phase
  - Any missing feedback (toasts, banners, confirmations) for user actions
  - Any other UI/UX issues that would block a complete, logical, and testable frontend experience
- [ ] Document all findings in detail, referencing the prototype location (page, modal, flow, etc.)

### 3.2 Implementation Comparison (Secondary)
- [ ] After the prototype-first audit, compare the prototype against the current implementation:
  - Identify any required flows, triggers, or UI/UX elements in the implementation that are missing or incomplete compared to the prototype
  - Identify any extra or changed elements in the implementation that are not covered by the prototype (note: these may be intentional updates—just document them)
- [ ] Document all implementation gaps or mismatches, referencing both the prototype and implementation locations

### 3.3 Summary
- [ ] Clearly distinguish between prototype-found issues and implementation comparison gaps in your findings
- [ ] Do not update implementation files in this phase—focus only on frontend completeness and logic

---

## 4. Audit Findings

### 4.1 What Matches (Fully Aligned)
- [List all flows, pages, modals, and states that match the prototype exactly]

### 4.2 Gaps & Issues (Missing or Not Accurate)
- [List all missing, incomplete, or inaccurate items, referencing prototype step numbers or sections]
- [For each gap, specify:]
  - **Location/Step:**
  - **Expected:**
  - **Actual:**
  - **Impact:**
  - **Suggested Fix:**

---

## 5. Enhancement Plan (If Gaps Found)
- [If any gaps/issues were found, outline a step-by-step enhancement plan.]
- [Each step should reference the prompt plan and prototype, and specify if new prompts or UI/UX steps are needed.]

---

## 6. Green Signal (If Fully Aligned)
- [If no gaps/issues were found, state clearly:]
  - "The implementation matches the prototype 100%. Green signal to move forward."

---

## 7. Audit Log & Traceability
- **Files Updated:** [List all files updated as a result of this audit]
- **Next Steps:** [What happens after this audit—e.g., implementation, sign-off, further review]

---

> **Instructions:**
> - Always attach this completed audit report to the feature’s audit folder.
> - If you update the plan or implementation as a result, update all relevant prompts and implementation files as per the instructions at the top of the prompt plan.
> - Use this template for all future frontend audits for consistency.
