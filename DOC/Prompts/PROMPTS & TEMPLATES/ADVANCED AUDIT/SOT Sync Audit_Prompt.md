# Universal SOT Sync Audit Instructions (Phase 4)

## Purpose
This audit prompt is for **Phase 4: SOT Sync**—the final audit and alignment phase for any frontend feature. It is designed to be reusable for any future frontend feature audit.

- **Goal:** Ensure the SOT (Source of Truth) and all related plan files are fully aligned with the latest frontend prototype and the updated initial plan.
- **Scope:** This audit is based **only** on the updated initial plan and the SOT. Do not focus on frontend enhancements or prototype code in this phase—focus on SOT and plan file accuracy.

---

## Audit Methodology

1. **Preparation**
   - Gather the following:
     - The most recent frontend prototype (for reference only)
     - The updated initial plan
     - All SOT files and related plan documents

2. **SOT-First Audit**
   - Treat the SOT and plan files as the primary source.
   - Compare every feature, flow, trigger, and state in the SOT/plan against the updated initial plan and the final frontend prototype.
   - Identify any of the following:
     - Features or flows present in the prototype but missing or outdated in the SOT/plan
     - Features or flows present in the SOT/plan but missing or outdated in the prototype
     - Any discrepancies, ambiguities, or outdated logic in the SOT/plan

3. **Update SOT and Plan Files**
   - For every gap or misalignment, update the SOT and plan files to:
     - Accurately reflect the current, intended state of the frontend as per the updated initial plan and the final prototype
     - Remove outdated, ambiguous, or superseded content
     - Ensure all triggers, flows, and states are deterministic and fully described
   - Do **not** update frontend prompts or prototype code in this phase—SOT and plan files only.

4. **Documentation**
   - Document all changes made to the SOT and plan files in a clear audit log or summary section.
   - Note any areas where further clarification or future enhancement may be needed, but do not implement them in this phase.

---

## Output Requirements
- All SOT and plan files must be fully up to date and aligned with the updated initial plan and the final frontend prototype.
- The audit instructions and methodology must remain generic and reusable for any frontend feature.
- No changes should be made to frontend prompts or prototype code in this phase.

---

## Usage
- Place this file in `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/`.
- Use this prompt for any Phase 4 (SOT Sync) audit for any frontend feature.
- Always reference the latest initial plan, SOT, and prototype for alignment.
