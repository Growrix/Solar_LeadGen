# Implementation Plan: Quote Builder Modal – Enhancement (Existing)

**Branch**: `008-description-enhance-existing` | **Date**: 2025-12-01 | **Spec**: `specs/008-description-enhance-existing/spec.md`
**Input**: Feature specification from `/specs/008-description-enhance-existing/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enhance the existing Quote Builder modal without rebuild. Integrate a single calculator for pricing and ROI (Subtotal, GST, Incentives, Total, $/W, Annual Production, Annual Savings, Payback) driven by assumptions. Support up to three options and enforce compliance validation before submit. All formulas and defaults sourced from: QUOTE-BUILDER-IMPROVEMENT-PLAN.md, ChatGPT_CalculationLogic.md, ChatGPT_research.md, AI-IMPLEMENTATION-GUIDELINES.md.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Next.js 14 App Router)  
**Primary Dependencies**: Next.js, Tailwind CSS, Prisma (existing)  
**Storage**: PostgreSQL via Prisma (existing models)  
**Testing**: Jest/React Testing Library; manual UI checks per design-system verification commands  
**Target Platform**: Web (Next.js, SSR/CSR as existing)
**Project Type**: Web application (frontend + existing backend)  
**Performance Goals**: UI updates < 500 ms perceived; build passes; zero design-system violations  
**Constraints**: Enhance only (no rebuild), preserve API contracts, multi-theme compliance  
**Scale/Scope**: Installer quoting flows; modal-level enhancements (no new pages)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- UI-first: Work is confined to enhancing existing modal UI; no backend-first changes.
- Next.js App Router: Components remain under `src/app` and `src/components`; no standalone pages.
- TypeScript strict: New/edited files remain `.tsx/.ts` with types.
- Styling & Theming: No hardcoded colors/typography/responsive classes; multi-theme tested.
- Database-first: No schema changes in this phase; reuse existing models.

Status: PASS (no violations planned).

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
src/
├── app/
├── components/
└── lib/

tests/
├── integration/
└── unit/
```

**Structure Decision**: Web app with existing Next.js App Router. Enhance existing components within `src/components` and modal flows; no new route groups.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
