# System Control Index & AI Navigation Entry Point

Purpose: Single authoritative entry for humans and AI to operate this repository. This file defines document authority, navigation flow, and operational behavior. It references existing documents only and does not duplicate their content.

Note: For technical documentation index (architecture, coding standards, testing, operations), see TECHNICAL DOCUMENTATIONS/README.md in this folder.

---

## Authority Hierarchy

Conflicts are resolved by higher authority. Follow this order strictly:

1. System Constitution — SYSTEM DESIGN/SYSTEM_CONSTITUTION.md
2. System Design Blueprint — SYSTEM DESIGN/Blueprint.md
3. Universal SaaS System Audit Prompt — SYSTEM DESIGN/UNIVERSAL SAAS SYSTEM AUDIT PROMPT.md
4. AI Implementation Guidelines — IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md
5. Design System SOT — IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md
6. UI/UX Layout & Routing Standards — IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md
7. Feature Folders & Tasks — DOC/FEATURES/** (feature-specific plans, SOT, and tasks)
8. Technical Docs — TECHNICAL DOCUMENTATIONS/** (architecture, devops, security, testing, theming)
9. Audit Reports — DOC/AUDIT-REPORTS/** (issue-specific analysis and outcomes)

Rule: If any instruction conflicts, the higher-level document overrides lower levels. If something is not defined by the Constitution/Blueprint, it must not exist in code.

---

## AI Navigation Controller

Read in this order before any task:

 - Start: SYSTEM DESIGN/SYSTEM_CONSTITUTION.md → SYSTEM DESIGN/Blueprint.md → IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md
- Then: Choose relevant standards based on task type:
  - Design/UI: DESIGN-SYSTEM-SOT.md, UI-UX-Layout-and-Routing-Standards.md
  - Architecture/Domain: TECHNICAL DOCUMENTATIONS/architecture/** and SYSTEM DESIGN/Blueprint.md
  - Security/Access: SYSTEM DESIGN/SYSTEM_CONSTITUTION.md, TECHNICAL DOCUMENTATIONS/security/**
  - Testing/E2E: TECHNICAL DOCUMENTATIONS/testing/**, IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md
  - Theming: TECHNICAL DOCUMENTATIONS/theming/**, IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md
- Finally: Locate feature-specific materials in DOC/FEATURES/** and any related DOC/AUDIT-REPORTS/** entries.

---

## Official Feature Workflow (AI-Controlled, E2E)

Goal: prevent AI context loss by locking documentation before coding, and by making execution mechanically follow a phase checklist.

1) **Plan & Lock (Docs Only)**
- Create/maintain the feature SOT (Phases 0–5) at: `DOC/Features/<Feature Name>/SOT/FEATURE-SOT.md`
- If the feature has any supporting docs, add a single index at: `DOC/Features/<Feature Name>/SOT/INDEX.md`
- When the plan is approved, explicitly set SOT status to: `Locked (Approved)`

2) **Execute (Phase-by-phase Tasks)**
- Create/maintain execution tasks at: `DOC/FEATURES/<Feature Name>/tasks.md`
- Tasks must follow `DOC/.specify/templates/tasks-template.md`.
- Tasks must include testing checkpoints and stop rules.

3) **Execution Style (When you want Frontend-first)**
- Use **contract-first + frontend-first**:
  - Define domain types + provider interface first
  - Build the UI against a mock provider
  - Implement backend to match the locked contract
  - Swap mock provider → real backend (no UI rewrite)

Rule: If execution order changes, it must be documented in the feature SOT and reflected in `DOC/FEATURES/<Feature Name>/tasks.md`.

Token discipline:
- Load only the minimum set of documents required for the current task.
- Do not preload unrelated files; reference paths here to fetch precisely.
 - Design tokens source of truth is DESIGN-SYSTEM-SOT.md; other docs must reference it (do not redefine).

Assumption policy:
- Do not infer undocumented behavior.
- If a needed rule is absent, halt and request clarification.

---

## Document Map by Use-Case

- Architecture decisions: SYSTEM DESIGN/SYSTEM_CONSTITUTION.md, SYSTEM DESIGN/Blueprint.md, TECHNICAL DOCUMENTATIONS/architecture/**
- **Database operations**: TECHNICAL DOCUMENTATIONS/operations/database-operations-standard.md (MANDATORY for all schema changes, backups, migrations)
- Feature implementation rules: IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md, DOC/FEATURES/**
- Auditing & debugging: SYSTEM DESIGN/UNIVERSAL SAAS SYSTEM AUDIT PROMPT.md, DOC/AUDIT-REPORTS/**
- Refactoring: SYSTEM DESIGN/Blueprint.md (boundaries), IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md (workflow)
- UI/UX decisions: IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md, IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md
- Error handling & incidents: IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md (failure handling), DOC/AUDIT-REPORTS/**
- Security & permissions: SYSTEM DESIGN/SYSTEM_CONSTITUTION.md (Articles VI, VII), TECHNICAL DOCUMENTATIONS/security/**
- Testing standards: TECHNICAL DOCUMENTATIONS/testing/**, IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md (GATE 0, zero-warnings policy)

---

## AI Behavior Rules

- Do not proceed without reading the required authorities listed above for the task.
- If authority conflicts arise, stop and request clarification; do not choose arbitrarily.
- Never invent roles, states, permissions, workflows, or design tokens not present in the referenced documents.
- Enforce Zero-Trust and Separation of Concerns: UI displays, backend validates; business logic does not live in UI.
- Enforce maintainable Next.js structure during migrations: prototype fidelity applies to rendered UI/UX, not to file organization. Do not ship migrations that concentrate multiple major surfaces (tabs/pages/modals) into a single mega component file.
- Apply the 6-step universal workflow and GATE 0 checks from AI-IMPLEMENTATION-GUIDELINES.md before any change.
- Maintain auditability: emit and reference events/logs per Constitution and Blueprint; changes must be traceable.

---

## Stability & Maintenance

- This README is stable and rarely changes.
- Update only when authority structure or canonical locations change.
- Keep language precise and professional; avoid duplication of other files.

---

## Operational Notes

- Feature migrations and builds must follow specs/007-migration-and-build/plan.md (13-step workflow).
- Prototype-origin features (Google AI Studio/Vite exports) must follow the Prototype-Preserving Migration Contract in DOC/GUIDELINES & SOT/README.md.
- Prototype-preserving migrations must ALSO follow Next.js best practices for maintainability: establish a component boundary + file map before porting, keep route/page files thin, and colocate extracted tab/modals as feature components.
- Prototype-preserving migrations must follow the mandatory 2-part sequencing: (1) structural mirror with UI preserved, then (2) design-system compliance (tokenization + class contracts + multi-theme + verification gates).
- Multi-theme compliance (Dark, Light, Purple) is mandatory for UI; verification commands must return 0/0/0/0/0/0 before completion.
- Git hygiene: audit reports and implementation phases should be documented under DOC/AUDIT-REPORTS/** and specs/** respectively, with commit tracking in DOC/Prompts/gitstatus.md when required by project instructions.

End of index.