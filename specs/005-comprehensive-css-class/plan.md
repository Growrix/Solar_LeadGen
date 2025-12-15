# Implementation Plan: Comprehensive CSS Class Audit & Standardization

**Branch**: `005-comprehensive-css-class` | **Date**: 2025-10-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-comprehensive-css-class/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Systematic migration of all CSS classes across the SolarMatch codebase to use shadcn/ui components with design token-based utility classes. This feature will install shadcn/ui, audit existing component logic to preserve functionality, migrate components from custom implementations to shadcn/ui equivalents (Button, Input, Card, Dialog, etc.), standardize typography to use semantic tokens from feature 004, and establish enterprise-grade testing/documentation practices. **Dark theme only** during migration - light/brand themes added after dark theme is 100% perfect. The migration follows a 6-phase rollout plan with risk mitigation at every step, ensuring zero functional regression while improving consistency, accessibility (WCAG 2.1 AA), and maintainability.

**CRITICAL POLICY**: 100% Clean Replacement - NO hybrid old+new class patterns allowed. Each component migration MUST completely replace old classes with shadcn/ui components or semantic tokens. This is industry standard practice (Material UI, Chakra UI, Ant Design all require complete replacement). Enforced via verification tasks (T064a, T075a, T089a, T100a, T112a, T129a) and pre-commit hooks. See [100-percent-replacement-policy.md](./100-percent-replacement-policy.md) for details.

## Technical Context

**Language/Version**: TypeScript 5.3.3, React 18.2.0, Next.js 14.2.33 (App Router)  
**Primary Dependencies**: 
- shadcn/ui (component library - to be installed)
- Tailwind CSS 3.4.18 (utility-first CSS)
- lucide-react (icon library - replaces heroicons)
- Design token system from feature 004 (already implemented)
- Storybook 7+ (UI component explorer)
- Chromatic (visual regression testing)

**Storage**: N/A (UI-only feature, no database changes)  
**Testing**: 
- Visual regression: Chromatic
- Accessibility: axe-core, Lighthouse, manual screen reader (NVDA/VoiceOver)
- Interaction: React Testing Library or Playwright (for high-risk components)
- Unit: Jest (for utility functions like cn())

**Target Platform**: Web (Chrome, Firefox, Safari, Edge - all modern browsers)  
**Project Type**: Web application (Next.js 14 App Router with Server/Client Components)  
**Performance Goals**: 
- Storybook hot reload <3 seconds
- Audit script completes <5 minutes
- Animation performance 60fps
- Bundle size increase <5%
- Lighthouse performance score ≥90

**Constraints**: 
- Dark theme ONLY during migration (light/brand themes added after)
- Zero functional regression (all logic preserved)
- Component-by-component migration (no big-bang)
- WCAG 2.1 AA compliance required
- Migration must not block other feature development

**Scale/Scope**: 
- 33+ existing components to audit
- ~200+ files in src/ directory to scan
- 10 user stories (P0 foundation → P10 tracking)
- 69 functional requirements
- 43 success criteria
- 6-week phased rollout plan

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ **Compliance Review**

| Constitution Principle | Status | Notes |
|----------------------|---------|-------|
| **0. Development Workflow (UI-First, Spec-Driven)** | ✅ PASS | This is a UI standardization feature - follows UI-first by design. Spec is comprehensive with 69 FRs, 43 SCs. Will update spec after each phase completion. |
| **I. Next.js App Router First** | ✅ PASS | Migration preserves existing App Router structure. No routing changes. Components remain in `src/components/`, pages in `src/app/`. shadcn/ui components go to `src/components/ui/`. |
| **II. TypeScript Strict Mode** | ✅ PASS | All migration scripts and components will be TypeScript. shadcn/ui is TypeScript-first. No `any` types except for dynamic className edge cases (documented). |
| **III. Database-First Design** | ✅ N/A | UI-only feature - no database schema changes. |
| **IV. Authentication & Authorization** | ✅ PASS | Migration preserves all auth logic. No changes to NextAuth, middleware, or session handling. |
| **V. Security & Privacy** | ✅ PASS | No security impact. Audit reports sanitized (no credentials exposed). Migration backups excluded from git (.gitignore). |
| **VI. Styling & Theming** | ✅ PASS (CORE FOCUS) | **This feature enforces Constitution VI**:<br>- Centralized design tokens (feature 004) integrated with shadcn/ui<br>- Dark theme first (class-based, ThemeProvider)<br>- shadcn-compatible CSS variables in globals.css<br>- Component rule: tokenized utilities only (bg-primary, text-foreground)<br>- Storybook REQUIRED for all changes<br>- Visual regression testing REQUIRED (Chromatic)<br>- Atomic migration: one component per commit<br>- Manual QA checklist MANDATORY |
| **VII. Code Documentation** | ✅ PASS | Migration guide with 10+ examples. Inline comments document logic preservation. Troubleshooting section. New developer onboarding <15 min. |

### ⚠️ **Constitution Alignment Notes**

1. **Theme Strategy**: Constitution VI allows `data-theme` attribute for future theme switching. This feature uses ThemeProvider to set `.dark` class on `<html>`. Compatible with Constitution - can add `data-theme` later if needed.

2. **CSS Variable Layer**: Constitution VI mentions "CSS Variables layer is introduced for shadcn/ui alignment" - this feature implements exactly that via FR-000a (shadcn-compatible CSS variables in globals.css).

3. **Migration Approach**: Constitution VI requires "Atomic migration: Only ONE component or token group per commit" - this feature enforces via FR-023 (component-by-component migration).

4. **Quality Gates**: Constitution VI requires Storybook + visual regression - this feature enforces via FR-050-051 (Storybook stories) and FR-054 (Chromatic visual regression).

### 🎯 **No Gates Violated**

This feature is in **full compliance** with the Constitution. In fact, it **implements and enforces** Constitution Section VI (Styling & Theming) across the entire codebase.

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

```
solarmatch/
├── src/
│   ├── app/                        # Next.js App Router (no changes to structure)
│   │   ├── (dashboard)/           # Dashboard route group
│   │   ├── (marketing)/           # Public pages
│   │   ├── (auth)/                # Auth pages
│   │   ├── globals.css            # 🆕 ADD shadcn CSS variables (--background, --foreground, etc.)
│   │   └── layout.tsx             # Root layout (update ThemeProvider if needed)
│   ├── components/
│   │   ├── ui/                    # 🆕 NEW - shadcn/ui components
│   │   │   ├── button.tsx        # 🆕 shadcn Button component
│   │   │   ├── input.tsx         # 🆕 shadcn Input component
│   │   │   ├── card.tsx          # 🆕 shadcn Card component
│   │   │   ├── dialog.tsx        # 🆕 shadcn Dialog component
│   │   │   ├── label.tsx         # 🆕 shadcn Label component
│   │   │   ├── select.tsx        # 🆕 shadcn Select component
│   │   │   ├── textarea.tsx      # 🆕 shadcn Textarea component
│   │   │   └── ...               # Other shadcn components as needed
│   │   ├── [33+ existing components] # 🔄 MIGRATE - preserve logic, swap UI
│   │   └── ThemeProvider.tsx     # 🔄 UPDATE - lock to dark theme during migration
│   ├── design-tokens/             # Existing design token system (feature 004)
│   │   ├── semantic/
│   │   │   ├── typography.ts     # Already exists - semantic typography tokens
│   │   │   ├── colors.ts         # Already exists - semantic color tokens
│   │   │   └── ...
│   │   └── primitives/
│   ├── lib/
│   │   ├── utils.ts              # 🆕 ADD - cn() utility for className merging (shadcn standard)
│   │   └── prisma.ts             # Existing (no changes)
│   └── types/
│       └── next-auth.d.ts        # Existing (no changes)
├── scripts/                       # 🆕 NEW - Migration & audit scripts
│   ├── audit-css-classes.ts      # 🆕 Phase 0 - Scan codebase for className usage
│   ├── audit-component-logic.ts  # 🆕 Phase 0 - Extract component logic signatures
│   ├── migrate-component.ts      # 🆕 Phase 1+ - Migrate single component to shadcn
│   ├── validate-migration.ts     # 🆕 Phase 1+ - Validate component against conventions
│   └── track-progress.ts         # 🆕 Phase 1+ - Generate migration progress report
├── .storybook/                    # 🔄 UPDATE - Configure for dark theme only
│   ├── preview.ts                # 🔄 UPDATE - Import globals.css, add theme decorator
│   └── main.ts                   # Existing (may need updates for shadcn)
├── stories/                       # 🆕 NEW - Storybook stories for shadcn components
│   ├── button.stories.tsx        # 🆕 Button component stories (all variants/states)
│   ├── input.stories.tsx         # 🆕 Input component stories
│   ├── card.stories.tsx          # 🆕 Card component stories
│   └── ...
├── backup/                        # 🆕 NEW - Timestamped backups before migration
│   └── [auto-generated]          # Created by migration scripts
├── components.json                # 🆕 NEW - shadcn/ui CLI configuration
├── tailwind.config.js             # 🔄 UPDATE - Map CSS variables to Tailwind utilities
├── package.json                   # 🔄 UPDATE - Add shadcn/ui, lucide-react, etc.
└── DOC/
    └── [existing docs]            # No changes (feature-specific docs in specs/)
```

**Structure Decision**: 
- **Web application (Next.js 14 App Router)** - chosen structure
- shadcn/ui components live in `src/components/ui/` (shadcn CLI default)
- Migration scripts in `scripts/` directory (TypeScript, run with tsx)
- Existing component files are migrated in-place (preserve file locations)
- Design token system (feature 004) remains in `src/design-tokens/`
- Storybook stories in `stories/` directory (existing convention)
- Migration backups in `backup/` directory (excluded from git)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - This feature is in full compliance with all Constitution principles. No complexity justifications needed.

## Phase 0: Research & Discovery

### Research Tasks

#### 1. shadcn/ui Installation & Configuration
**Question**: What is the exact installation process for shadcn/ui in a Next.js 14 App Router project with existing Tailwind configuration?

**Research Needed**:
- Official shadcn/ui installation guide for Next.js App Router
- components.json configuration format
- Integration with existing Tailwind config (design tokens from feature 004)
- CSS variable naming conventions for dark theme

**Output**: Installation guide in research.md

#### 2. Component Logic Audit Strategy
**Question**: How to systematically extract and document component logic (props, state, handlers, effects) from existing React components?

**Research Needed**:
- AST parsing tools for TypeScript/React (e.g., ts-morph, @typescript-eslint/parser)
- Pattern detection for useState, useEffect, onClick handlers
- Prop interface extraction from TypeScript
- Best practices for documenting component behavioral contracts

**Output**: Audit script architecture in research.md

#### 3. Migration Script Architecture
**Question**: How to build safe, idempotent migration scripts that preserve component logic while swapping UI?

**Research Needed**:
- Code transformation patterns (AST manipulation vs. regex)
- Backup/rollback strategies
- Dry-run mode for validation
- Error handling and partial migration recovery

**Output**: Migration script design in research.md

#### 4. Visual Regression Testing Setup
**Question**: How to configure Chromatic for Next.js + Storybook with dark theme only?

**Research Needed**:
- Chromatic integration with existing Storybook setup
- Dark theme testing configuration
- Baseline capture process
- CI/CD integration for automated visual regression

**Output**: Chromatic setup guide in research.md

#### 5. Accessibility Testing Tools
**Question**: What tools and processes ensure WCAG 2.1 AA compliance during migration?

**Research Needed**:
- axe-core integration with Storybook
- Lighthouse CI configuration
- Screen reader testing workflow (NVDA/VoiceOver)
- Keyboard navigation testing patterns

**Output**: Accessibility testing checklist in research.md

#### 6. Pre-commit Hook Configuration
**Question**: How to create pre-commit hooks that block CSS convention violations without blocking hotfixes?

**Research Needed**:
- Husky configuration for Next.js projects
- ESLint rules for className patterns
- Bypass mechanism for emergencies (--no-verify with justification)
- Hook performance optimization (<3 second execution)

**Output**: Pre-commit hook implementation guide in research.md

### Consolidation

All research findings will be documented in 
esearch.md with:
- **Decision**: What was chosen
- **Rationale**: Why chosen (benefits, trade-offs)
- **Alternatives Considered**: What else was evaluated and why rejected
- **Implementation Notes**: Specific configuration, gotchas, best practices

## Phase 1: Design & Contracts

### Data Model

**File**: data-model.md

This feature does not introduce new database entities. Data model documentation will cover:

1. **Migration Status Tracking** (in-memory or file-based):
   - Component name
   - File path
   - Status (not-started, in-progress, completed, verified, exception)
   - Migration date
   - Logic preservation checklist status

2. **Audit Report Structure**:
   - CSS Class Pattern (className, usage count, file locations, consistency status)
   - Component Logic Signature (props, state, handlers, effects)
   - Exception Record (component, justification, approved by)

3. **Configuration Entities**:
   - shadcn components.json format
   - Naming convention rules
   - Typography token mappings
   - Icon size scale
   - Animation duration tokens

### API Contracts

**Directory**: contracts/

No REST/GraphQL APIs for this feature. Contract documentation will cover:

1. **Migration Script CLI Contract** (contracts/migration-cli.md):
   `ash
   # Audit CSS classes
   tsx scripts/audit-css-classes.ts --output specs/005-comprehensive-css-class/audit-report.md
   
   # Audit component logic
   tsx scripts/audit-component-logic.ts --component Button --output specs/005-comprehensive-css-class/logic-audit.md
   
   # Migrate component
   tsx scripts/migrate-component.ts --component Button --dry-run
   tsx scripts/migrate-component.ts --component Button --execute
   
   # Validate migration
   tsx scripts/validate-migration.ts --component Button
   
   # Track progress
   tsx scripts/track-progress.ts --output specs/005-comprehensive-css-class/progress-report.md
   `

2. **shadcn/ui Component API** (contracts/shadcn-components.md):
   - Button: variants (default, secondary, destructive, outline, ghost), sizes (sm, default, lg, icon)
   - Input: type, placeholder, value, onChange, error states
   - Card: CardHeader, CardTitle, CardDescription, CardContent, CardFooter composition
   - Dialog: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose composition
   - (Document all shadcn components used)

3. **Design Token Contract** (contracts/design-tokens.md):
   - CSS variables (--background, --foreground, --primary, etc.)
   - Typography tokens (text-heading-1, text-body, text-caption)
   - Color tokens (bg-primary, text-foreground, border-input)
   - Spacing, shadow, animation tokens

### Quickstart Guide

**File**: quickstart.md

Step-by-step guide for developers to:
1. Set up development environment (install shadcn/ui, configure Storybook)
2. Run audit scripts to understand current state
3. Migrate their first component (Button example)
4. Test migration (Storybook, visual regression, interaction)
5. Submit PR with migration checklist

**Target**: New developer can migrate a component in <2 hours after reading quickstart.

### Agent Context Update

Run agent context update script:
`ash
.\.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot
`

This will add new technologies to the agent context file:
- shadcn/ui component library
- lucide-react icon library
- Chromatic visual regression testing
- axe-core accessibility testing

## Phase 2: Task Breakdown

**NOTE**: Phase 2 is handled by the /speckit.tasks command (NOT part of /speckit.plan).

The tasks.md file will be generated separately with detailed task breakdown for each user story (P0  P10), including:
- Task dependencies
- Time estimates
- Acceptance criteria
- Testing requirements
- Documentation requirements

## Next Steps

1. **Review this plan** - Validate technical context, constitution check, project structure
2. **Approve research tasks** - Confirm Phase 0 research questions are complete
3. **Run Phase 0** - Execute research tasks, generate research.md
4. **Run Phase 1** - Generate data-model.md, contracts/, quickstart.md, update agent context
5. **Run /speckit.tasks** - Generate tasks.md with detailed task breakdown
6. **Begin implementation** - Start with Phase 1 of 6-phase rollout plan (Week 1: Foundation)

---

**Plan Status**:  Complete - Ready for Phase 0 Research
**Next Command**: Proceed to Phase 0 research task execution
