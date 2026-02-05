
# AI Design System Refactor Strict Instructions

## Purpose
Strictly guide AI agents to purge all legacy frontend UI classes and global CSS, and rebuild only the design system (DS). Existing components will be refactored to use the new DS, not fully rebuilt. Backend and modal flows remain intact.

---


## 1. Refactor Scope
- **Delete ALL legacy frontend UI classes and global CSS.**
- **Do NOT rebuild all components.**
- **Rebuild ONLY the design system (DS) in `src/ds` (primitives, tokens, layouts, styles, themes).**
- **Refactor existing components to use the new DS tokens, primitives, and classes.**
- **EXCLUDE (do NOT delete or modify):**
  - All modal-related files (any file whose name contains `Modal`, `Dialog`, `Drawer`, or `Sheet` is FROZEN)
  - Any file required for modal trigger/context/provider (keep the entire dependency chain)
  - All backend, API, DB, and Prisma files

### Authoritative Purge Lists (Must Use)
- KEEP set (must remain): `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/keep-files.txt`
- REMOVE set (delete all): `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/remove-files.txt`
- Audit metadata: `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/audit.json`


## 2. Backend Lock
- **Do NOT modify, delete, or refactor:**
  - Any backend/server/data logic
  - Any API, DB, or Prisma file


## 3. Modal System Freeze
- **Do NOT modify, delete, or refactor:**
  - Any modal import/export/context/provider/trigger
  - Any modal file or its dependencies
- Modals must remain fully functional and visually unchanged until new DS is complete and refactored in modal flows.


## 4. New DS-Only Design System
- **Build ONLY the design system in `src/ds` (primitives, tokens, layouts, styles, themes).**
- **No legacy class/component/global CSS allowed in any new code.**
- All DS code must follow semantic, token-driven design.


## 5. Integration Rules
- Refactor existing components to use DS tokens, primitives, and classes.
- Do NOT break or alter modal flows.
- Import/export/context/provider/trigger for modals must remain as-is.


## 6. After DS Refactor
- Once the DS is complete and stable, modal DS migration can be planned and executed separately.

---


## Summary Checklist
- [ ] Legacy UI classes/global CSS purged (except modals)
- [ ] Backend untouched
- [ ] Modals untouched and fully functional
- [ ] New DS built in `src/ds` (primitives/tokens/layouts/styles/themes)
- [ ] Existing components refactored to use DS
- [ ] No legacy class/component/global CSS in new code
- [ ] Modal flows, triggers, and context remain unchanged

---


**AI must follow these instructions strictly. Any deviation is a critical error.**
