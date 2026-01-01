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
- Prototype-First Frontend Workflow: DOC/GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md

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
	- Exception (NEW): For **Prototype-First Frontend Workflow** features (Google AI Studio → Frontend UI/UX Prompts), do **NOT** create `DOC/Features/<Feature Name>/SOT/tasks.md`. Track execution only in `specs/<feature>/tasks.md`.

Notes:
- `FEATURE-SOT.md` remains the canonical planning SOT (Phases 0–6).
- `specs/<feature>/tasks.md` remains the repo-wide engineering execution tracker.
- The SOT-local `tasks.md` is the continuity-first checklist to prevent context loss (except Prototype-First Frontend Workflow features).

---

## Frontend-Plan.md Requirement (Mandatory for All Features)

Every feature SOT folder **must include** a `Frontend-Plan.md` file:

- **Purpose**: To provide a clear, implementation-ready description of all pages, routes, modals, and UX flows to be built for the feature, before any coding begins.
- **Scope**: Must cover both public and admin UX, routing, navigation, and any legacy/compatibility handling.
- **Enforcement**: No implementation work may begin until the `Frontend-Plan.md` is present, approved, and referenced in the SOT `INDEX.md`.
- **Reference**: See `DOC/Features/Blog Manual/SOT/Frontend-Plan.md` for a canonical example.

This rule is non-negotiable and applies to all new and existing features. Update the SOT `INDEX.md` and planning workflow to reflect this requirement.

### Frontend-Plan.md Style Requirements (Contract + Visual + Bangla)

Every `Frontend-Plan.md` must be written as a **visual contract**:

- Must include “What you will see” sections with clear page-by-page layouts (ASCII is allowed and encouraged).
- Must include a **Bangla explanation (বাংলা ব্যাখ্যা)** for the key user-facing flows (at minimum: the public/guest flow; include admin flows if they are major).
- Must include an explicit “Baseline: Existing UI will NOT be lost” statement when the feature touches existing UI.

Reference example:
- `DOC/Features/Blog Manual/SOT/Frontend-Plan.md`

---

## Current State Audit Requirement (Mandatory Before Planning)

For any feature that touches existing behavior/UI, the feature SOT folder must include a current-state audit report **before** finalizing plans.

This audit is **E2E comprehensive** and must cover:
- Frontend UI (routes/pages/components, navigation, state/storage coupling)
- Backend/API (existing endpoints, auth/roles, request/response contracts)
- Prisma/DB (models/enums/relations, what exists vs what is missing)
- Integrations/automation (webhooks/cron/3rd-party calls) where relevant

Goal: give a **100% clear picture** of the current site/feature reality so the AI/human knows what already exists, what is broken, and what must be implemented next.

- File: `DOC/Features/<Feature Name>/SOT/CURRENT-UI-AUDIT-*.md`
- Purpose: document the **as-is** routes, pages, UX flows, data sources, APIs, DB schema touchpoints, and any tight couplings (e.g., sessionStorage/localStorage dependencies).

Enforcement rules:
- No implementation work may begin until the audit report exists and is referenced from the feature’s `SOT/INDEX.md`.
- New plans (`FEATURE-SOT.md`, `Frontend-Plan.md`, `IMPLEMENTATION-PLAN.md`, `tasks.md`) must explicitly state:
	- what already exists and should be kept,
	- what exists but is broken and must be fixed,
	- what does not exist and must be built,
	- what exists but must be intentionally changed (requires explicit approval).

Anti-duplication rule:
- If the audit says a UI element/flow already exists (e.g., blog share section), the plan must NOT re-add it; it must say “keep” or “fix” with scope.

Detailed audit rules:
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/E2E-CURRENT-STATE-AUDIT-RULES.md`

Reference example:
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md`

## Tasks.md Template (Mandatory)

For **any** `tasks.md` created or updated in this repo (including both locations below), the author MUST follow:

- `.specify/templates/tasks-template.md`

Applies to:
- `specs/<feature>/tasks.md`
- `DOC/Features/<Feature Name>/SOT/tasks.md`

Exception (NEW): For **Prototype-First Frontend Workflow** features, `DOC/Features/<Feature Name>/SOT/tasks.md` is intentionally **not created**.

Minimum enforcement:
- Must use the task ID format (`T###`) and the `[P]` + `[US#]` labeling rules.
- Must group work by phases and user stories.
- Must include explicit file paths in task descriptions.

---

## Workflow Enhancement: Prototype-First Frontend (Google AI Studio → Frontend UI/UX Prompts)

This workflow is for frontend features where the UI/UX is first prototyped in **Google AI Studio**, and then converted into a **sequence-locked frontend plan + prompts**.

### Goal
- Prepare the frontend plan and prompting artifacts in the feature’s **Fontend UI UX Prompts** folder, based on the Google AI Studio prototype, so the entire UI/UX flow is already defined before implementation.

### Canonical Prompting References (Must Use)
- Prompting SOP: `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md`
- Frontend plan + prompt template: `DOC/PROMPTS/AI PROMPTING/Template_AIfrontend.md`

### Required Folderization (per feature)
Each frontend feature must follow the same structure as:
`DOC/FEATURES/NEWS ENGINE/`

Minimum required folders (keep non-used folders empty until needed):
- `SOT/` (6-phase framework docs)
- `Plan/` (created by user at feature start)
- `GoogleAIStudio UI UX/` (prototype exports)
- `Fontend UI UX Prompts/` (AI prompt artifacts generated from the prototype)
- `Audit Report/` (audit reports; append future audits here)
- `BACKEND PLAN/` (empty until frontend is final)

### Sequence (Strict)
1) User creates the initial plan in `Plan/`.
2) AI creates/updates the 6-phase SOT docs under `SOT/`.
3) User provides/pastes Google AI Studio prototype artifacts into `GoogleAIStudio UI UX/`.
4) AI generates the prompt artifacts under `Fontend UI UX Prompts/` using `Template_AIfrontend.md` and the prompting SOP.

### Important Rule Change
- Do **NOT** create `DOC/Features/<Feature Name>/SOT/tasks.md` for this workflow.
- Use `specs/<feature>/tasks.md` if/when implementation begins.