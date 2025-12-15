# Migration & Build - Spec

## Purpose
Provide user stories, requirements, and success criteria for component migrations and builds.

## User Stories
- As a maintainer, I want UI components migrated to semantic tokens so themes remain consistent.
- As a developer, I want a clear verification checklist so I can confidently complete migrations without regressions.

## Requirements
- Use semantic tokens from DESIGN-SYSTEM-SOT.md
- No hardcoded colors, `dark:` classes, RGB/HEX values
- No logic changes during migration
- Multi-theme compliance (Dark, Light, Purple)
- Responsive at 5 breakpoints
- Accessibility: WCAG 2.1 AA

## Success Criteria
- All 6 verification commands return 0 matches
- The page and all child components in its tree are clean
- TypeScript and production build pass with zero warnings
- Visual checks pass across themes and breakpoints
- Functionality unchanged compared to pre-migration audit

## References
- DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md
- specs/007-migration-and-build/plan.md
