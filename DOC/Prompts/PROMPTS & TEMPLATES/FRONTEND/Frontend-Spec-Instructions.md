# Frontend Specification Instruction for AI

## Purpose
To convert any Initial Plan into a complete, actionable frontend plan/specification for real UI/UX development. This process ensures all features, flows, and components are defined with clear acceptance criteria, ready for implementation.

---

## Workflow Steps

### 1. Context Loading
- Load only the provided Initial Plan file.
- Do not reference other files unless explicitly instructed.

### 2. Feature Extraction
- List all features, modules, and user stories described in the Initial Plan.
- For each, note the intended purpose and any key requirements.

### 3. Page & Surface Definition
- For each feature/module, define all required pages, modals, drawers, and management surfaces.
- Specify the purpose of each page/surface and its relationship to the overall flow.

### 4. Component Breakdown
- For every page/surface, list all UI components needed (forms, tables, buttons, tabs, filters, etc.).
- For each component, specify:
  - Name
  - Purpose
  - States (default, loading, error, success, etc.)
  - Triggers (actions, events, user interactions)

### 5. State & Flow Mapping
- For each entity (e.g., post, comment, user), define all possible states (draft, published, archived, etc.).
- Map out all user flows:
  - Start point → actions/triggers → state changes → feedback → end point
- Ensure every flow is backend-doable (no dead ends, all actions have clear outcomes).

### 6. Acceptance Criteria
- For each feature, page, and flow, define clear acceptance criteria:
  - What must be present for the feature to be considered complete?
  - What user actions must be possible?
  - What feedback/validation is required?
  - What edge cases must be handled?

### 7. Design System & Guidelines Reference
- Specify which design system or UI guidelines to follow (e.g., Material UI, custom rules).
- Enforce accessibility, responsiveness, and code standards.

### 8. Output Format
- Structure the frontend plan/spec as follows:
  - **Feature/Module**
    - **Pages/Surfaces**
      - **Components**
        - States
        - Triggers
      - **Flows**
        - Step-by-step mapping
      - **Acceptance Criteria**
  - **Design System/Guidelines Reference**

### 9. Traceability
- For every item, reference the relevant section/line in the Initial Plan.
- Do not invent features or flows not present in the Initial Plan.

### 10. Review & Finalization
- Before finalizing, check that all features, flows, and acceptance criteria are covered.
- Ensure the plan is actionable for real UI/UX development.

---

## Instructions for AI

- Follow these steps exactly, in order.
- Do not skip or merge steps.
- Do not add, remove, or modify features unless explicitly instructed.
- Output the final frontend plan/spec in DOC\Prompts\PROMPTS & TEMPLATES\FRONTEND as a new markdown file.
- Use clear, structured headings and bullet points for readability.
