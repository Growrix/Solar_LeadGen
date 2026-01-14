# Migration and Build - Execution Plan (13-Step Workflow)

Authoritative plan for any UI migration or build task. Follow strictly.

## 1) GATE 0 Health Check
- `npx tsc --noEmit` (0 errors)
- `npm run build` (Compiled successfully, no warnings)
- `npm run dev` (Starts without errors)
- `npx prisma validate` (Schema valid)

## 2) Logic Audit Report
- Document functionality to preserve
- List files/components, data models, routes, workflows

## 3) Pre-Migration Verification
- Capture baseline violations using SOT verification commands

## 4) Migrate Component (UI ONLY)
- Replace classNames to semantic tokens only
- Do NOT change logic, state, effects, API calls

## 5) Post-Migration Verification
- All 6 commands return 0/0/0/0/0/0 (see SOT)

## 6) Test Dark Theme
- Colors, shadows, contrast

## 7) Test Light Theme
- Neumorphic styling

## 8) Test Purple Theme
- Purple shadows, accents

## 9) Responsive Test (5 breakpoints)
- 320, 375, 768, 1024, 1440

## 10) Accessibility
- WCAG 2.1 AA (contrast, keyboard, ARIA)

## 11) Functionality
- Verify all audited logic works identically

## 12) Build Validation
- `npx tsc --noEmit`
- `npm run build`

## 13) Commit Atomically
- One component per commit
- Descriptive message

Notes:
- UI ONLY: No state/events/effects/API/validation changes during migration
- 100% replacement (no hybrid patterns)
- Multi-theme required (Dark/Light/Purple)
- Zero violations required before completion
