# System Control Index & AI Navigation Entry Point

Purpose: Single authoritative entry for humans and AI to operate this repository. This file defines document authority, navigation flow, and operational behavior. It references existing documents only and does not duplicate their content.

---

## Authority Hierarchy

Conflicts are resolved by higher authority. Follow this order strictly:

1. System Constitution — DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md
2. System Design Blueprint — DOC/Guidelines/SYSTEM DESIGN/Blueprint.md
3. Universal SaaS System Audit Prompt — DOC/Guidelines/SYSTEM DESIGN/UNIVERSAL SAAS SYSTEM AUDIT PROMPT.md
4. AI Implementation Guidelines — DOC/Guidelines/AI-IMPLEMENTATION-GUIDELINES.md
5. Design System SOT — DOC/Guidelines/DESIGN-SYSTEM-SOT.md
6. UI/UX Layout & Routing Standards — DOC/Guidelines/UI-UX-Layout-and-Routing-Standards.md
7. Feature Specs & Tasks — specs/** (feature-specific plans and phases)
8. Operational Docs — docs/** (architecture, devops, security, testing, theming)
9. Audit Reports — DOC/AUDIT-REPORTS/** (issue-specific analysis and outcomes)

Rule: If any instruction conflicts, the higher-level document overrides lower levels. If something is not defined by the Constitution/Blueprint, it must not exist in code.

---

## AI Navigation Controller

Read in this order before any task:

- Start: SYSTEM_CONSTITUTION.md → Blueprint.md → AI-IMPLEMENTATION-GUIDELINES.md
- Then: Choose relevant standards based on task type:
  - Design/UI: DESIGN-SYSTEM-SOT.md, UI-UX-Layout-and-Routing-Standards.md
  - Architecture/Domain: docs/architecture/** and Blueprint.md
  - Security/Access: SYSTEM_CONSTITUTION.md, docs/security/**
  - Testing/E2E: docs/testing/**, AI-IMPLEMENTATION-GUIDELINES.md
  - Theming: docs/theming/**, DESIGN-SYSTEM-SOT.md
- Finally: Locate feature-specific materials in specs/** and any related DOC/AUDIT-REPORTS/** entries.

Token discipline:
- Load only the minimum set of documents required for the current task.
- Do not preload unrelated files; reference paths here to fetch precisely.

Assumption policy:
- Do not infer undocumented behavior.
- If a needed rule is absent, halt and request clarification.

---

## Document Map by Use-Case

- Architecture decisions: SYSTEM_CONSTITUTION.md, Blueprint.md, docs/architecture/**
- Feature implementation rules: AI-IMPLEMENTATION-GUIDELINES.md, specs/**
- Auditing & debugging: UNIVERSAL SAAS SYSTEM AUDIT PROMPT.md, DOC/AUDIT-REPORTS/**
- Refactoring: Blueprint.md (boundaries), AI-IMPLEMENTATION-GUIDELINES.md (workflow)
- UI/UX decisions: DESIGN-SYSTEM-SOT.md, UI-UX-Layout-and-Routing-Standards.md
- Error handling & incidents: AI-IMPLEMENTATION-GUIDELINES.md (failure handling), DOC/AUDIT-REPORTS/**
- Security & permissions: SYSTEM_CONSTITUTION.md (Articles VI, VII), docs/security/**
- Testing standards: docs/testing/**, AI-IMPLEMENTATION-GUIDELINES.md (GATE 0, zero-warnings policy)

---

## AI Behavior Rules

- Do not proceed without reading the required authorities listed above for the task.
- If authority conflicts arise, stop and request clarification; do not choose arbitrarily.
- Never invent roles, states, permissions, workflows, or design tokens not present in the referenced documents.
- Enforce Zero-Trust and Separation of Concerns: UI displays, backend validates; business logic does not live in UI.
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
- Multi-theme compliance (Dark, Light, Purple) is mandatory for UI; verification commands must return 0/0/0/0/0/0 before completion.
- Git hygiene: audit reports and implementation phases should be documented under DOC/AUDIT-REPORTS/** and specs/** respectively, with commit tracking in DOC/Prompts/gitstatus.md when required by project instructions.

End of index.