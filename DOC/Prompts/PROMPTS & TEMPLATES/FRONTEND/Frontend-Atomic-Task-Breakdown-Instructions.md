# Frontend Atomic Task Breakdown Instruction

## Purpose
Guide the AI to convert any finalized initial frontend plan/spec into a set of clear, atomic, and actionable build tasks. This ensures every feature, component, and flow is implemented in a focused, traceable, and efficient manner.

---

## Workflow Steps

### 1. Context Loading
- Load only the finalized initial frontend plan/spec provided.
- Do not reference other files unless explicitly instructed.

### 2. Identify All Features, Pages, Components, and Flows
- Review the frontend plan and list every:
  - Page or surface (e.g., Blog List Page, Admin Dashboard)
  - UI component (e.g., BlogCard, FilterBar, Modal)
  - User flow (e.g., Create Post, Edit Post, Publish Flow)
- For each, note the relevant section in the plan/spec.

### 3. Break Down into Atomic Tasks
- For each page, component, or flow, create a separate, atomic task.
- Each task should:
  - Be as small as possible while still being meaningful (e.g., "Implement BlogCard component with all states and triggers").
  - Have a clear objective and acceptance criteria.
  - Reference the relevant section of the frontend plan/spec.
- If a component or flow is complex, break it down further (e.g., "Implement BlogCard loading state" as a subtask).

### 4. Task Format
- Each atomic task should include:
  - **Task Title**: Short, descriptive name
  - **Objective**: What is to be built/achieved
  - **Acceptance Criteria**: Bullet points of what must be true for the task to be complete
  - **References**: Section(s) of the frontend plan/spec
- Example:
  - **Task Title**: Implement BlogCard Component
  - **Objective**: Build the BlogCard UI component with all required states and triggers
  - **Acceptance Criteria**:
    - Renders title, summary, image, and tags
    - Supports loading, error, and default states
    - Triggers onClick event to open blog detail
    - Uses design system tokens for all styles
  - **References**: Frontend Plan, Section 2.1.1

### 5. Output
- Output the list of atomic tasks as a structured markdown file.
- Use clear headings and bullet points for readability.
- Save the output in the specified location for the project/feature.

---

## Instructions for AI
- Follow these steps exactly, in order.
- Do not merge or skip tasks.
- Ensure every feature, component, and flow from the frontend plan/spec is covered by at least one atomic task.
- Output should be ready for direct use in development or task management systems.
