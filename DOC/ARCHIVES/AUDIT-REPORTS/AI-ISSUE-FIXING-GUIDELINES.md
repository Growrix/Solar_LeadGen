---
title: AI Issue Fixing Guidelines (SOT)
description: Standard Operating Template to fix errors/issues safely without breaking code quality or consistency
version: 1.0
lastUpdated: 2025-11-30
scope: Next.js App Router + TypeScript + Tailwind + Prisma + LocalStorage
---

Purpose
- Provide a strict, repeatable process for fixing issues without causing regressions: no file deletions, no unsemantic code, no inline styles, no hardcoded values, consistent theming, and mandatory testing before moving forward.
- Complements existing guidelines; does not override them.

Core Principles
- Audit-first: Never modify code before you understand the exact problem and impact.
- Minimal, surgical changes: Fix root cause with the smallest possible change.
- UI-only vs logic changes: Respect scope; do not alter backend or UX unless explicitly requested.
- Consistency: Follow global semantic classes, design tokens, and multi-theme rules.
- Reproducible quality: Every fix must include tests (UI, functional, accessibility) and verification steps.

Non-Negotiables
- No file deletions unless explicitly requested and justified in an audit note.
- No inline styles; use semantic utility classes and global styles only.
- No hardcoded colors/typography/breakpoints; use design tokens and semantic classes.
- No mixing old/new class systems; 100% replacement when migrating.
- No logic rewrites when fixing UI-only issues.
- No partial work; complete the fix and validate with tests.

Fix Workflow (SOT)
1) Gate 0 Health Check
- Confirm design system availability: tokens, global classes, themes (Dark/Light/Purple).
- Verify the component’s responsibilities and scope (UI vs logic vs backend).

2) Problem Definition
- Reproduce the issue (route, trigger, data inputs). Capture exact error messages and stack.
- Identify impacted files/components and dependencies.
- Document assumptions and constraints.

3) Logic Audit Report
- Locate root cause; list state variables, effects, API calls, and guards.
- Note race conditions, undefined states, or brittle merges.
- Specify exactly what to change and what must remain untouched.

4) Plan the Fix
- Choose the smallest corrective change that addresses the root cause.
- Define acceptance criteria: what success looks like for UI, logic, and UX.
- Define tests required (unit, integration, UI, accessibility).

5) Implement Safely
- Restrict edits to scoped files; avoid refactors.
- Preserve public APIs and types; merge state with defaults to avoid undefined.
- Remove unnecessary guards that block rendering; keep essential safety checks.
- Follow semantic classes; no inline styles or hardcoded values.

6) Verification (Mandatory 6-Check for UI)
Run all commands on the changed component file and expect 0 matches:
- Hardcoded gray/slate: Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"
- Dark mode classes: Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "dark:"
- RGB/HEX colors: Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"
- Hardcoded white/black: Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "text-white|bg-white|text-black|bg-black"
- Hardcoded typography: Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"
- Manual responsive: Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "sm:text-|md:text-|lg:text-"

7) Multi-Theme Visual QA
- Dark, Light, Purple themes: verify colors, shadows, contrast.
- Responsive at 320, 375, 768, 1024, 1440 px.
- Accessibility: WCAG 2.1 AA contrast, keyboard nav, ARIA.

8) Functional Tests
- Reproduce original scenario; verify the fix under identical triggers.
- Validate state initialization and merges (defaults + persisted data).
- Confirm no unintended side effects across related flows.

9) Build Validation
- Type-check: `npx tsc --noEmit`
- Production build: `npm run build`
- If errors: stop, fix, retest. Do not proceed.

10) Documentation + Traceability
- Summarize fix, files changed, and acceptance results.
- Note any follow-ups separately; do not mix concerns in the same commit.

11) Commit + Status Update
- Commit atomically with descriptive message.
- Append commit id, timestamp, and summary to `DOC/Prompts/gitstatus.md`.
- Push to remote branch as instructed.

Testing Instructions (Per Fix)
- Unit: Cover the changed logic (e.g., state merges, guards). Expect no undefined access.
- Integration: Open affected routes/modals and simulate the exact trigger paths.
- UI: Run the 6 verification commands; expect zero violations.
- Accessibility: Keyboard and screen reader pass; ARIA labels present.
- Theme/Responsive: Validate in all required themes and breakpoints.
- Regression: Verify adjacent flows (e.g., other lead types or triggers) still work.

Post-Fix Rules
- Do not leave TODOs; complete or ticket them explicitly.
- Do not introduce new patterns without aligning with design system SOT.
- Keep localStorage persistence merges safe: always merge with defaults.
- Avoid adding new dependencies unless absolutely necessary; justify in the audit report.
- Re-run the verification suite before merging.

Incident Prevention Checklist (Quick Pass)
- [ ] Scope verified (UI-only vs logic).
- [ ] No inline styles.
- [ ] No hardcoded colors/typography/breakpoints.
- [ ] Uses semantic classes from global CSS.
- [ ] State merges use safe defaults.
- [ ] Multi-theme visual QA passed.
- [ ] UI 6-check commands all zero.
- [ ] Functional tests passed for original trigger.
- [ ] Type-check and build passed.
- [ ] Commit + gitstatus updated.

Notes
- This SOT emerges from repeated pain points: file deletions, unsemantic code, inline styles, hardcoded values, inconsistent theming, and missing tests. It mandates audit-first, minimal changes, semantic styling, and rigorous verification so fixes remain safe, consistent, and maintainable.
