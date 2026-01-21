# Expansion/Enhancement Planning Instructions (Frontend + Backend)

## Purpose
Guide AI to plan the expansion or enhancement of an existing feature by analyzing the current state and the new expansion plan, then produce a unified plan covering both frontend and backend.

---

## Workflow Steps

### 1. Analyze Current State
- Carefully review the latest audit report and post-feature documentation.
- Understand what is already implemented, what works, and any existing gaps or issues.

### 2. Review Expansion/Enhancement Plan
- Read the expansion/enhancement plan.
- Identify new features, enhancements, and changes required.

### 3. Compare and Identify Gaps
- Compare the current state with the expansion/enhancement plan.
- List all missing features, broken flows, and areas needing enhancement for both frontend and backend.

### 4. Plan Unified Expansion/Enhancement
- For each identified gap or new requirement:
	- **Frontend**: Specify UI/UX changes, new pages, modals, components, states, triggers, and integration points.
	- **Backend**: Specify new/updated API endpoints, database changes, business logic, automation, and integration with frontend.
- Ensure all frontend elements are mapped to backend actions and vice versa.

### 5. Produce Unified Expansion/Enhancement Plan
- Structure the plan as follows:
	- **Section 1: Frontend Expansion/Enhancement Plan**
		- Detailed UI/UX plan, user flows, component breakdown, states, triggers, and AI-ready prompts.
	- **Section 2: Backend Expansion/Enhancement Plan**
		- API endpoints, database schema updates, business logic, automation, and integration details.
	- **Section 3: Mapping Table**
		- Map each frontend element to its backend counterpart for traceability.
	- **Section 4: Implementation Checklist**
		- List all tasks required for both frontend and backend, ready to be tracked.

### 6. Strict Rules
- Only update existing, relevant plans.
- All tasks and changes must be reflected in the master task tracking file.
- Do not create new files unless explicitly instructed.

---

## Outcome
- One unified plan file containing both frontend and backend expansion/enhancement plans, ready for implementation.
- All tasks tracked in the master task file.
- Every change is grounded in the audit, documentation, and expansion/enhancement plan.

---

## Usage Notes
- For new UI/UX features, use the (DOC\PROMPTS\PROMPTS & TEMPLATES\FRONTEND\Frontend Planning Prompt.md) template.
- For backend-aligned, detailed planning, use the (DOC\PROMPTS\PROMPTS & TEMPLATES\FRONTEND\Template_Comprehensive_UI UX.md)
- For crafting AI-ready prompts, use the (DOC\PROMPTS\PROMPTS & TEMPLATES\FRONTEND\AI Prompting Guideline.md) template.

---

This instruction file is reusable for any feature expansion or enhancement planning.
