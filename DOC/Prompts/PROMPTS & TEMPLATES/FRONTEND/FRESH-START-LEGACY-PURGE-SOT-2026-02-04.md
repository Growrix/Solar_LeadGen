# Fresh Start Legacy Purge SOT (Next Implementation Plan)

**Generated:** 2026-02-04T08:32:34.046Z

## Goal
- Eliminate legacy frontend UI/classes and start fresh on the new DS only.
- Keep backend unchanged (locked).
- Keep modal flows intact by freezing all modal files + their import dependencies (temporary exception).

## Non-Negotiable Rules (Aligned to Strict Instructions)
- Backend/API/DB/Prisma must not change.
- Modal triggers/flows/import-export wiring must not change.
- New UI must import from `@/ds` only (no legacy UI/classes).

## What Counts As “Legacy Frontend” in This Repo
- `src/components/**` (app UI + legacy UI kit)
- `src/app/**` (UI routes/pages/layouts) except backend routes under `src/app/api/**` and minimal bootstrapping files.
- `src/pages/**` (Pages Router remnants)

## Audit Totals
- Files scanned (src): 360
- Keep (DS + backend + frozen modals + dependencies): 221
- Remove candidates (legacy UI): 139
- Undecided (non-UI or not targeted): 0

## Keep Set (Authoritative)
The following outputs list the KEEP set (must remain to keep backend and modal flows compiling):
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/keep-files.txt`
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/audit.json`

## Remove Set (Authoritative)
The following output lists all files that can be removed to start fresh (legacy UI purge):
- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/remove-files.txt`

## Plan (High-Level)
1. Create a new branch (fresh-ui).
2. Delete every file in `remove-files.txt`.
3. Keep DS (`src/ds/**`) and tokens (`src/design-tokens/**`).
4. Ensure the app still compiles by adding minimal DS-only placeholder routes as needed (e.g. `src/app/page.tsx`).
5. Rebuild the component library inside DS (`src/ds/components/**`) before rebuilding pages.
6. Do NOT touch modals until the DS component library is stable; treat modals as a frozen compatibility island.

## Verification (Acceptance Criteria)
- `npm run gate0` passes.
- No imports from legacy UI in new code (enforce via lint rules in a follow-up step).
- Backend routes under `src/app/api/**` behave unchanged.
- Frozen modal flows still compile and triggers remain intact (no wiring changes).
