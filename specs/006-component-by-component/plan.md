# Implementation Plan: Component-by-Component Migration to Neumorphic Design System

**Branch**: `006-component-by-component` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-component-by-component/spec.md`

**Note**: This plan follows the constitution's component migration workflow - one component at a time, with full validation.

## Summary

**Primary Requirement**: Systematically migrate 15 components from hardcoded Tailwind classes to neumorphic design token system, achieving 40% → 95% design system compliance.

**Technical Approach**: Component-by-component migration with mandatory pre-migration audit, 100% clean replacement (no hybrid patterns), logic preservation verification, and automated violation detection. Priority order: InstantQuoteForm (50+ violations) → Hero (6) → QuoteOptionsModal (10) → SimplifiedQuoteForm (35+) → MobileSidebar (20) → Auth components (5 remaining) → Verification tooling.

**Key Innovation**: Each component migration gated by logic audit report (prevents "hoping for the best") and verification script (ensures zero hardcoded classes remain).

## Technical Context

**Language/Version**: TypeScript 5.3.3 (strict mode), React 18.2.0, Next.js 14.2.33  
**Primary Dependencies**: 
- Tailwind CSS 3.4.18 (utility-first CSS with custom design tokens)
- Design Token System (`src/design-tokens/` - colors, typography, spacing, shadows, animations)
- Neumorphic CSS Classes (`src/app/globals.css` - 920+ lines of component classes)
- Centralized Components (`src/components/auth/` - AuthInput, AuthButton, AuthModal, etc.)

**Storage**: N/A (pure frontend refactoring - no database changes)  
**Testing**: Manual QA checklist (browser DevTools for responsive/accessibility testing)  
**Target Platform**: Web (Next.js SSR + Client Components), Chrome/Safari/Firefox, Mobile responsive (320px-1920px)  
**Project Type**: Web application (component library refactoring)  
**Performance Goals**: 
- Zero runtime performance impact (CSS-only changes)
- Bundle size neutral or reduced (centralized components replace duplication)
- First Contentful Paint < 1.5s (maintained)

**Constraints**: 
- 100% logic preservation (no functional changes during migration)
- Zero breaking changes (all components must work identically)
- Dark theme only (light theme future)
- No hybrid patterns allowed (component fully migrated or not at all)

**Scale/Scope**: 
- 15 components to migrate
- 285 hardcoded class violations to fix
- 40% → 95% design system compliance target
- ~1,500 lines of component code affected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Compliance with Constitution v1.0.2

**Core Principle 0 - Development Workflow**: ✅ PASS
- ✅ UI-First: Component migration IS the UI work (refactoring existing UI)
- ✅ Spec-Driven: Full spec.md created with 7 user stories, 25 functional requirements
- ✅ No Backend: Pure frontend refactoring (no API/database changes)

**Core Principle I - Next.js App Router**: ✅ PASS
- ✅ Not creating new pages (refactoring existing components)
- ✅ No layout duplication risk (maintaining existing page structure)
- ✅ Route planning N/A (no new routes)

**Core Principle II - TypeScript Strict Mode**: ✅ PASS
- ✅ All files are `.tsx` (existing components)
- ✅ Strict mode enabled (no changes to tsconfig)
- ✅ No `any` types introduced (className string replacements only)

**Core Principle III - Database-First Design**: ✅ PASS (N/A)
- No database changes for this feature

**Core Principle VI - Styling & Theming**: ✅ PASS (Core Focus)
- ✅ Neumorphic Dark-First: Migrating TO this system
- ✅ Design Tokens: Replacing hardcoded values WITH tokens
- ✅ Custom Components: Using AuthInput, AuthButton, etc.
- ✅ Manual QA: Checklist approach per constitution
- ✅ Atomic Migration: One component per commit rule
- ✅ Component-by-Component: Following new migration workflow

**Development Workflow Standards**: ✅ PASS
- ✅ Pre-Phase Audit: Logic preservation audit mandatory (User Story 0)
- ✅ Spec-Driven: Complete spec with acceptance scenarios
- ✅ Manual QA: Checklist for each component
- ✅ Post-Phase Validation: TypeScript + Build checks before commit

**Component Migration Workflow**: ✅ PASS (Perfect Alignment)
- ✅ 8-Step Workflow: Pre-audit → Plan → Migrate → Test → Accessibility → Build → Commit → Document
- ✅ 100% Clean Replacement Rule: No hybrid patterns allowed
- ✅ Logic Preservation: Full audit before touching code
- ✅ Verification Script: Automated violation detection

**Component Testing Requirements**: ✅ PASS
- ✅ Manual Testing: Browser DevTools + dev server
- ✅ Manual QA Checklist: 30+ items per component
- ✅ WCAG 2.1 AA: Accessibility validation included
- ✅ Real Device Testing: Mobile testing plan

**Code Review Standards**: ✅ PASS
- ✅ Design Token Compliance: Zero hardcoded values
- ✅ Atomic Migrations: One component per commit
- ✅ Manual QA Complete: Required before commit

### 🚨 Risks & Mitigations

**Risk 1**: Breaking component functionality during className changes
- **Mitigation**: Logic audit mandatory before migration (User Story 0)
- **Gate**: Cannot start migration without completed audit report

**Risk 2**: Incomplete migration (hybrid patterns)
- **Mitigation**: Verification script checks for ALL hardcoded classes
- **Gate**: Component not marked "migrated" until script returns 0 violations

**Risk 3**: Theme switching breaks after migration
- **Mitigation**: Manual QA checklist includes theme switching test
- **Gate**: Must test dark theme (and future light theme) before commit

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Next.js web application (existing structure, no changes)

This feature works with existing codebase - no new directories created.

```
solarmatch/
├── src/
│   ├── app/
│   │   └── globals.css                    # Neumorphic CSS classes (920+ lines)
│   ├── components/
│   │   ├── auth/                          # Centralized components (EXISTING)
│   │   │   ├── AuthInput.tsx             # ✅ Complete
│   │   │   ├── AuthButton.tsx            # ✅ Complete
│   │   │   ├── AuthModal.tsx             # ✅ Complete
│   │   │   ├── AuthAlert.tsx             # ✅ Complete
│   │   │   ├── AuthDivider.tsx           # ✅ Complete
│   │   │   ├── SocialAuthButtons.tsx     # ✅ Complete
│   │   │   └── index.ts                  # ✅ Complete
│   │   ├── icons/
│   │   │   └── auth/                     # Icon library (16+ icons)
│   │   ├── InstantQuoteForm.tsx          # 🎯 MIGRATE (50+ violations)
│   │   ├── Hero.tsx                      # 🎯 MIGRATE (6 violations)
│   │   ├── QuoteOptionsModal.tsx         # 🎯 MIGRATE (10 violations)
│   │   ├── SimplifiedQuoteForm.tsx       # 🎯 MIGRATE (35+ violations)
│   │   ├── HomeownerMobileSidebarMenu.tsx # 🎯 MIGRATE (20 violations)
│   │   ├── HomeownerBottomNavBar.tsx     # 🎯 MIGRATE (auth component)
│   │   ├── InstallerBottomNavBar.tsx     # 🎯 MIGRATE (auth component)
│   │   ├── AdminBottomNavBar.tsx         # 🎯 MIGRATE (auth component)
│   │   ├── GuestSignupModal.tsx          # 🎯 MIGRATE (auth component)
│   │   └── HomeownerSignupModal.tsx      # 🎯 MIGRATE (auth component)
│   └── design-tokens/                    # Design token system (EXISTING)
│       ├── colors.ts                     # Semantic color tokens
│       ├── typography.ts                 # Typography scale tokens
│       ├── spacing.ts                    # Spacing tokens
│       ├── shadows.ts                    # Neumorphic shadow tokens
│       └── animations.ts                 # Animation tokens
├── specs/
│   └── 006-component-by-component/       # This feature
│       ├── plan.md                       # ✅ This file
│       ├── spec.md                       # ✅ Complete
│       ├── research.md                   # ✅ Complete (Phase 0)
│       ├── data-model.md                 # ✅ Complete (Phase 1)
│       ├── quickstart.md                 # ✅ Complete (Phase 1)
│       ├── contracts/                    # ✅ Complete (N/A)
│       ├── audits/                       # 📝 TO CREATE
│       │   ├── InstantQuoteForm-logic.md # Per-component audits
│       │   ├── Hero-logic.md
│       │   └── [component]-logic.md
│       ├── migration-tracker.md          # 📝 TO CREATE
│       └── checklists/
│           └── requirements.md           # ✅ Complete
├── scripts/
│   └── verify-component.js               # 📝 TO CREATE (optional)
└── DOC/
    ├── DESIGN-SYSTEM-SOT.md              # ✅ Complete (reference)
    ├── DESIGN-SYSTEM-AUDIT-REPORT.md     # ✅ Complete (reference)
    └── CONSTITUTION-UPDATE-2025-11-01.md # ✅ Complete
```

### Files to Create

1. **Migration Tracker**: `specs/006-component-by-component/migration-tracker.md`
2. **Audit Reports**: `specs/006-component-by-component/audits/[component]-logic.md` (one per component)
3. **Verification Script** (optional): `scripts/verify-component.js`

### Files to Modify

**15 Component Files** (one at a time, atomic commits):
1. `src/components/InstantQuoteForm.tsx` (P1)
2. `src/components/Hero.tsx` (P2)
3. `src/components/QuoteOptionsModal.tsx` (P3)
4. `src/components/SimplifiedQuoteForm.tsx` (P4)
5. `src/components/HomeownerMobileSidebarMenu.tsx` (P5)
6. `src/components/HomeownerBottomNavBar.tsx` (P6)
7. `src/components/InstallerBottomNavBar.tsx` (P6)
8. `src/components/AdminBottomNavBar.tsx` (P6)
9. `src/components/GuestSignupModal.tsx` (P6)
10. `src/components/HomeownerSignupModal.tsx` (P6)
11. (+ 5 remaining auth components)

## Complexity Tracking

**No Constitution Violations** ✅

All gates passed - no complexity justification required.

---

## Phase Summaries

### Phase 0: Research & Outline  COMPLETE

**Status**: Complete  
**Output**: 
esearch.md (7 research questions answered)  
**Duration**: N/A (pre-planning complete)

**Key Decisions**:
1. **Migration Order**: Priority-based (highest violations first)
2. **Regression Prevention**: Mandatory pre-migration logic audit
3. **Verification**: Automated script with pattern matching
4. **Rollback Strategy**: Atomic commits + git revert
5. **Progress Tracking**: Markdown migration tracker
6. **Design Patterns**: Follow DESIGN-SYSTEM-SOT.md
7. **Mobile Testing**: Maintain responsive behavior, test all breakpoints

**All Clarifications Resolved**: 

---

### Phase 1: Design & Contracts  COMPLETE

**Status**: Complete  
**Output**: 
- data-model.md (3 entities: Component Audit Report, Migration Tracker Record, Verification Result)
- contracts/README.md (N/A - no API changes)
- quickstart.md (step-by-step first migration guide)
- Agent context updated (.github/copilot-instructions.md)

**Key Artifacts**:
1. **Data Model**: Documentation entities defined (not database models)
2. **Contracts**: N/A (pure frontend refactoring)
3. **Quickstart Guide**: 2-hour first migration walkthrough
4. **Agent Context**: GitHub Copilot instructions updated

**Constitution Re-Check**:  PASS (all gates passed)

---

### Phase 2: Task Breakdown  NOT STARTED

**Command**: /speckit.tasks (run separately)  
**Output**: 	asks.md (detailed task breakdown)  
**Status**: Ready to execute after plan approval

**Expected Tasks** (preview):
1. Setup: Create migration tracker
2. Setup: Create audits directory
3. Setup: Create verification script (optional)
4. US0: Audit InstantQuoteForm logic
5. US1: Migrate InstantQuoteForm to tokens
6. US2: Migrate Hero to tokens
7. US3: Migrate QuoteOptionsModal to tokens
8. US4: Migrate SimplifiedQuoteForm to tokens
9. US5: Migrate HomeownerMobileSidebarMenu to tokens
10. US6: Migrate remaining auth components
11. US7: Create verification script (if not done in setup)

---

## Next Steps

### 1. Review This Plan 

**Stakeholder**: Review plan.md, 
esearch.md, data-model.md, quickstart.md  
**Approval Gate**: Confirm migration approach, priority order, and workflow

### 2. Generate Tasks

**Command**: /speckit.tasks (after plan approval)  
**Output**: Detailed task breakdown with acceptance criteria  
**Duration**: ~15 minutes

### 3. Begin Implementation

**First Task**: Create migration tracker (specs/006-component-by-component/migration-tracker.md)  
**Duration**: 5 minutes  
**Next Task**: Audit InstantQuoteForm logic (User Story 0)  
**Duration**: 30 minutes

### 4. Follow Quickstart Guide

**Reference**: quickstart.md (step-by-step for first component)  
**Expected Time**: 2 hours for InstantQuoteForm (includes setup + migration)  
**Pattern Established**: Remaining components follow same workflow

---

## Success Criteria (Phase 2 Preview)

### After Plan Phase 
- [x] Research complete (all questions answered)
- [x] Data model defined
- [x] Quickstart guide created
- [x] Constitution check passed
- [x] Agent context updated
- [x] Plan reviewed and approved

### After Task Generation (Next)
- [ ] Detailed tasks created
- [ ] Acceptance criteria defined
- [ ] Estimates assigned

### After Implementation (Future)
- [ ] 15 components migrated
- [ ] 285 violations fixed
- [ ] 40%  95% compliance achieved
- [ ] Migration tracker shows 100% complete
- [ ] All verification scripts pass

---

## Plan Complete 

**Branch**:  06-component-by-component  
**Plan Location**: specs/006-component-by-component/plan.md  
**Phase 0 Status**:  Complete  
**Phase 1 Status**:  Complete  
**Phase 2 Status**:  Ready (run /speckit.tasks)

**Generated Artifacts**:
-  plan.md (this file)
-  
esearch.md (7 research questions)
-  data-model.md (3 entities)
-  contracts/README.md (N/A documented)
-  quickstart.md (first migration guide)
-  .github/copilot-instructions.md (agent context updated)

**Ready for**: Task generation (/speckit.tasks) and implementation

---

**Report**: Planning phase complete! All research resolved, data model defined, quickstart guide ready. Constitution check passed with zero violations. Ready to generate tasks and begin component-by-component migration.
