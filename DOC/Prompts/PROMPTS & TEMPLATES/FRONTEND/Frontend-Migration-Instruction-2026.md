# Frontend Migration Instruction (2026)

## Purpose
A clear, actionable guide for migrating frontend features or pages, based on the real, audited system. This file is self-contained—no external references or outdated context.

---

## 1. Migration Preparation
- Review the latest frontend system audit report to understand the current design, structure, and components.
- Define the exact scope of migration (pages, features, components).
- Lock the migration plan before starting any implementation.

---

## 2. Migration Workflow

### A. Audit & Mapping
- Inventory all prototype elements (pages, modals, triggers, UI components).
- Map each prototype element to the current system, noting gaps and mismatches.
- Use a checklist to track all items.

### B. Migration Planning
- For each gap, create a migration task (title, description, acceptance criteria).
- Do not start implementation until the plan is reviewed and approved.

### C. Implementation
- Migrate only the scoped items.
- Replace all hardcoded/inline styles with design system tokens and classes.
- Add missing components to the library and update the semantic system as needed.
- Ensure all new components are reusable and documented.

### D. Verification & Audit
- Perform side-by-side comparison with the prototype.
- Run all verification gates (typecheck, build, theme checks, accessibility, responsive).
- Document results and fix any gaps before proceeding.

### E. Enhancement (if required)
- After migration and audit, perform an enhancement audit.
- Add enhancements as sub-tasks and re-audit.

### F. Documentation
- Prepare user/admin guides, developer docs, and handover checklists for the migrated feature.

---

## 3. Strict Rules
- Never start coding before the migration plan is locked.
- Never move to the next phase until all tasks/audits are green.
- All documentation, plans, and audits must be traceable and auditable.

_Last updated: January 22, 2026_
