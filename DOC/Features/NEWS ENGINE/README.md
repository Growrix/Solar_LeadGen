# NEWS ENGINE — Feature Workspace

This folder is the canonical workspace for the **News Engine** feature.

## Folder Structure (Required)
This feature workspace follows the repo’s prototype-first + migration workflow.

Required folders:
- `SOT/` — 6-phase planning + index + visual contract
- `Plan/` — initial user-created plan
- `GoogleAIStudio UI UX/` — prototype exports (V6 is authoritative)
- `Fontend UI UX Prompts/` — prompt artifacts generated from the prototype
- `Audit Reports/` — audit reports and findings
- `MIGRATION/` — migration plans + execution checklist
- `BACKEND PLAN/` — keep empty until the frontend is finalized

## Folderization Rule (Migration)
When creating a new feature folder structure, always create a `MIGRATION/` folder (can be empty at first) to hold all migration planning and execution docs. This ensures a single, predictable location for all migration artifacts.

**Do not place migration plans or prompt packs in `Plan Prompts/` or other folders.**

## Folder Structure (as of 2026-01-01)

- `SOT/` — 6-phase planning, visual contract, audit, and index
- `Plan/` — initial user-created plan
- `MIGRATION/` — migration plans, prompt packs, and migration documentation (all migration-related docs now live here)
- `Fontend UI UX Prompts/` — step-by-step UI/UX prompt artifacts
- `GoogleAIStudio UI UX/` — prototype exports
- `Audit Reports/` — audit reports and findings
- `BACKEND PLAN/` — backend planning (empty until frontend is final)

See each folder’s README for details. All migration planning and execution docs must be placed in the `MIGRATION/` folder from now on.

## Workflow (Prototype-First Frontend)
1) User creates the initial plan in `Plan/`.
2) AI creates/updates the 6-phase SOT docs under `SOT/`.
3) User places prototype exports under `GoogleAIStudio UI UX/`.
4) AI generates step-by-step prompts under `Fontend UI UX Prompts/`.

## Prompting References (Must Follow)
- `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md`
- `DOC/PROMPTS/AI PROMPTING/Template_AIfrontend.md`

## Notes
- This workflow does **not** require `SOT/tasks.md`.
- Track all feature work (including migration) in the single root tasks file: `DOC/FEATURES/NEWS ENGINE/tasks.md`.



