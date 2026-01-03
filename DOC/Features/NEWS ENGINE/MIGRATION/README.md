# MIGRATION Folder — News Engine

This folder contains all migration-related documentation for the News Engine feature.

## What belongs here?
- Migration plans (e.g., prototype-to-Next.js plans)
- Prompt packs for migration (e.g., Google AI Studio prompt sequences)
- Migration execution documentation and checklists

Key files (authoritative for execution):
- `tasks.md` — migration execution checklist (what is done vs pending)
- `component-dependency-tree-checklist.md` — component tree map used to avoid false completion

## Migration quality rule (mandatory)
Prototype-preserving means preserving the **rendered UI/UX**. It does not justify shipping a single-file “mega component”.

During migration, enforce maintainable Next.js structure:
- Keep route/page/hub files thin (composition + state orchestration).
- When the prototype already has separated files/components (V6), **mirror that structure** in Next.js.
- Record the component boundary + file map in the migration plan/tasks before continuing.

## Mandatory 2-Part Migration Strategy
This repo uses a **two-part** approach for prototype-origin UI migrations to reduce risk and keep changes reviewable.

Part 1 — Structural mirror (UI preserved):
- Mirror V6 component boundaries (tabs/modals as separate feature components).
- Wire all triggers so the rendered UI/UX matches V6 end-to-end.

Part 2 — Design-system compliance (tokenization + class contracts):
- Normalize `className` to repo semantic tokens.
- Fix any repo-enforced `className` violations so commits/builds pass.
- Run multi-theme and hardcoded-style verification gates.

Authority:
- See `DOC/GUIDELINES & SOT/README.md` → “Prototype-Preserving Migration Contract (Vite Prototype → Next.js)” → “Two-Part Migration Strategy (Mandatory)”.

## Folderization Rule
When creating a new feature folder structure, always create a `MIGRATION/` folder (can be empty at first) to hold all migration planning and execution docs. This ensures a single, predictable location for all migration artifacts.

**Do not place migration plans or prompt packs in `Plan Prompts/` or other folders.**

---

See the main feature README for the full folder structure and documentation flow.
