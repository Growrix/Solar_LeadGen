# Project Control & Documentation Index

Start here for all tasks (human or AI).

## 1) System Authority & Workflow
- Primary entry: DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md
- Defines authority hierarchy, AI navigation rules, and execution workflow.

## 2) Technical Documentation
- Technical index: DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/README.md
- Maps engineering tasks to architecture, coding standards, testing, ops docs.

## How to Use (AI + Humans)
- Always begin with this file.
- Then read IMPLEMENTATION SOT/README.md to determine required authorities.
- When technical details are needed, follow TECHNICAL DOCUMENTATIONS/README.md.

Workflow note:
- The official, AI-controlled feature workflow (Docs Lock → Execution Tasks) is defined in: DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md

## Quick Links
- AI Workflow & Safety Standard: DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md
- System Constitution (highest authority): DOC/GUIDELINES & SOT/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md
- System Design Blueprint: DOC/GUIDELINES & SOT/SYSTEM DESIGN/Blueprint.md
- System Audit Prompt: DOC/GUIDELINES & SOT/SYSTEM DESIGN/UNIVERSAL SAAS SYSTEM AUDIT PROMPT.md

## Path Alias (Legacy)
- Any mention of `DOC/Guidelines/*` refers to `DOC/GUIDELINES & SOT/*` (canonical). Treat as the same folder.

## Folder Overview
- System Design: DOC/GUIDELINES & SOT/SYSTEM DESIGN/*
- Implementation SOT: DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/*
- Technical Docs: DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/*

## Messaging Standards (Notifications + Emails)
These rules are **non-negotiable** and must be followed by all humans and AI when creating or updating notification/email copy.

- Notification messaging rules: DOC/GUIDELINES & SOT/Messaging-Standards/notification-messaging-guidelines.md
- Email template standards: DOC/GUIDELINES & SOT/Messaging-Standards/email-template-standards.md
- Homeowner copy audit (policy violations log): DOC/Features/Written Quote/HOMEOWNER-MESSAGING-AUDIT-2025-12-27.md

This keeps a single entry point without merging large indexes.

---

## Product Planning Standard (6-Phase, Legacy-Safe)

All feature planning in this repo must follow the **Legacy-Safe 6-Phase Product Build Framework**.

- Canonical framework (read before creating any feature plan):
	- DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/LEGACY-SAFE-6-PHASE-PRODUCT-BUILD-FRAMEWORK.md

Folderization rule (to prevent planning chaos):

- Default: one feature = one SOT file:
	- `DOC/Features/<Feature Name>/SOT/FEATURE-SOT.md`
- If multiple supporting files are unavoidable:
	- `DOC/Features/<Feature Name>/SOT/INDEX.md` must exist and list all related docs

---

## Workflow Enhancement: Execution Artifacts (Required for Implementation)

When a feature moves from **planning** to **implementation**, the feature SOT folder must include execution-level artifacts so a new AI/human can continue without losing context.

Required additions under `DOC/Features/<Feature Name>/SOT/`:

- `IMPLEMENTATION-PLAN.md`
	- Purpose: clearly state *what is being implemented now*, *why*, *sequencing*, *acceptance checks*, and *stop rules*.
	- Must remain consistent with the locked `FEATURE-SOT.md`.

- `tasks.md`
	- Purpose: a **portable execution checklist** that lives with the SOT.
	- Must link to the repo-wide engineering tracker in `specs/<feature>/tasks.md` if one exists.

Notes:
- `FEATURE-SOT.md` remains the canonical planning SOT (Phases 0–6).
- `specs/<feature>/tasks.md` remains the repo-wide engineering execution tracker.
- The SOT-local `tasks.md` is the continuity-first checklist to prevent context loss.

---

## Tasks.md Template (Mandatory)

For **any** `tasks.md` created or updated in this repo (including both locations below), the author MUST follow:

- `.specify/templates/tasks-template.md`

Applies to:
- `specs/<feature>/tasks.md`
- `DOC/Features/<Feature Name>/SOT/tasks.md`

Minimum enforcement:
- Must use the task ID format (`T###`) and the `[P]` + `[US#]` labeling rules.
- Must group work by phases and user stories.
- Must include explicit file paths in task descriptions.