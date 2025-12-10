# Implementation Plan: Lead Expiry Countdown Timer

**Branch**: `003-countdown-timer-for` | **Date**: October 22, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-countdown-timer-for/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds a visual countdown timer to leads that automatically expires leads after a configurable duration (default 7 days). When admins approve leads, they can optionally enable a countdown timer with custom duration (1-90 days). The timer is displayed on all dashboards (admin, homeowner, installer) with color-coded visual feedback (green for 6+ days, yellow for 3-5 days, red for 1-2 days). Leads automatically expire when the countdown reaches zero via a scheduled cron job. The system handles quote-type-specific behavior: CALL_VISIT and WRITTEN_QUOTE leads disable their countdown timers upon purchase (no expiry pressure for purchased leads), while BIDDING leads retain their countdown until expiry (maintaining competitive urgency). Admins have full control to reset, remove, or reactivate countdown timers at any time.

**Technical Approach**: Leverage existing `expiresAt` field in Lead model (currently set to 30 days on approval), modify admin approval flow to make countdown optional with custom duration, update existing `checkAllExpiredLeads()` cron job to handle new expiry logic, create reusable countdown timer UI component with color-coded progress bar, add countdown timer management controls to admin lead details page.

## Technical Context

**Language/Version**: TypeScript ~5.3.3 (strict mode)  
**Framework**: Next.js 14.2.33 (App Router, Server Components)  
**Primary Dependencies**: React 18.2.0, Prisma 6.17.1, NextAuth 4.24.11, Tailwind CSS 3.4.18  
**Storage**: PostgreSQL (Supabase-hosted) via Prisma ORM  
**Testing**: Manual QA (no automated tests per project standards)  
**Target Platform**: Web application (responsive: desktop, tablet, mobile)  
**Project Type**: Next.js web application with App Router architecture  
**Performance Goals**: 
- Countdown calculation < 50ms per lead
- Admin approval with timer selection < 30 seconds
- Cron job processes 1000+ leads in < 5 minutes
- UI renders countdown timers without layout shift
**Constraints**: 
- Must leverage existing `expiresAt` field (no schema breaking changes)
- Must integrate with existing admin approval flow at `/api/leads/[id]/approve`
- Must use existing cron job infrastructure (`checkAllExpiredLeads()`)
- Countdown timer optional (admins can approve without timer)
- Color thresholds fixed: green (6+), yellow (3-5), red (1-2 days)
**Scale/Scope**: 
- 10+ API endpoints (1 new, 9 modified)
- 5 UI components (3 new, 2 modified)
- 1 database field leveraged (expiresAt)
- 1 settings entry (LEAD_COUNTDOWN_DEFAULT_DAYS)
- 15+ TypeScript interfaces/types
- 1000+ concurrent leads with active countdown timers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **I. Next.js App Router First**
- Feature uses existing App Router structure (`src/app/admin/leads/[id]/page.tsx`)
- API route modifications at `src/app/api/leads/[id]/approve/route.ts`
- Server Components by default, client components only for interactive countdown UI
- No violations

✅ **II. TypeScript Strict Mode**
- All files will be `.ts` or `.tsx`
- Strict mode compliance (no `any` types)
- Type definitions for countdown timer props, API payloads, and database queries
- Extended types for countdown-related fields
- No violations

✅ **III. Database-First Design**
- Leverages existing `expiresAt DateTime?` field in Lead model
- No new migrations required (field already exists)
- Prisma Client used for all database operations
- No raw SQL
- No violations

✅ **IV. Authentication & Authorization**
- Countdown timer management restricted to ADMIN role
- Uses existing NextAuth session checks (`getServerSession(authOptions)`)
- Role verification in all countdown timer management APIs
- No new authentication patterns needed
- No violations

✅ **V. Security & Privacy**
- Countdown duration validation (1-90 days range)
- Admin role verification for timer management
- Audit logging for all countdown timer changes (timer_added, timer_reset, timer_removed)
- No sensitive data exposed in countdown timer display
- No violations

✅ **VI. Styling & Theming**
- Countdown timer UI uses Tailwind CSS utility classes
- Dark mode support via existing ThemeProvider
- Color-coded timers: green (`bg-green-500`), yellow (`bg-yellow-500`), red (`bg-red-500`)
- Responsive design (mobile-first)
- No violations

✅ **VII. Code Documentation**
- Teaching-first comments for countdown calculation logic
- API route documentation (inputs, outputs, errors)
- Component prop documentation
- Usage examples for countdown timer component
- No violations

### Technical Stack Compliance

✅ **All dependencies already in project**
- Next.js 14.2.33 ✓
- React 18.2.0 ✓
- TypeScript ~5.3.3 ✓
- Prisma 6.17.1 ✓
- NextAuth 4.24.11 ✓
- Tailwind CSS 3.4.18 ✓
- No new dependencies required

### Project Structure Compliance

✅ **Follows existing directory organization**
- API routes: `src/app/api/leads/[id]/approve/route.ts` (modify existing)
- Components: `src/components/CountdownTimer.tsx` (new), `src/components/admin/LeadCountdownControls.tsx` (new)
- Services: `src/lib/services/countdown-service.ts` (new helper functions)
- Types: `src/types/countdown.ts` (new countdown-related types)
- No structural violations

### Security Compliance

✅ **All security requirements met**
- Admin-only countdown timer management (role checks)
- Input validation (duration range: 1-90 days)
- Audit logging for accountability
- UTC timestamp storage (avoiding timezone issues)
- No security violations

### Documentation Compliance

✅ **Documentation standards followed**
- Implementation will be documented in `DOC/Records/COUNTDOWN-TIMER-IMPLEMENTATION-2025-10-22.md`
- Code comments explaining countdown calculation logic
- API documentation for new countdown timer endpoints
- No documentation violations

### Gate Summary

**Status**: ✅ **PASSED** - All constitutional requirements satisfied

**Justification for No Violations**: This feature integrates seamlessly with existing architecture. It leverages the existing `expiresAt` field (no schema changes), extends the existing admin approval flow (no new patterns), and uses established services (audit logging, notifications, settings). The feature is purely additive and does not introduce any new dependencies, authentication patterns, or architectural complexities.

## Project Structure

### Documentation (this feature)

```
specs/003-countdown-timer-for/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (data structures)
├── quickstart.md        # Phase 1 output (developer setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── countdown-api.openapi.yaml
└── checklists/
    └── requirements.md  # Validation checklist (completed)
```

### Source Code (repository root - Next.js App Router)

```
solarmatch/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── leads/
│   │   │       └── [id]/
│   │   │           ├── approve/
│   │   │           │   └── route.ts        # [MODIFY] Add countdown timer controls
│   │   │           ├── countdown/
│   │   │           │   └── route.ts        # [NEW] Reset/remove countdown timer
│   │   │           └── reactivate/
│   │   │               └── route.ts        # [NEW] Reactivate expired lead with timer
│   │   └── admin/
│   │       └── leads/
│   │           ├── page.tsx               # [MODIFY] Add countdown timer display
│   │           └── [id]/
│   │               └── page.tsx           # [MODIFY] Add countdown timer controls
│   ├── components/
│   │   ├── CountdownTimer.tsx             # [NEW] Reusable countdown timer component
│   │   ├── admin/
│   │   │   └── LeadCountdownControls.tsx  # [NEW] Admin countdown management UI
│   │   └── homeowner/
│   │       └── LeadCard.tsx               # [MODIFY] Add countdown timer to lead cards
│   ├── lib/
│   │   └── services/
│   │       ├── countdown-service.ts       # [NEW] Countdown calculation utilities
│   │       ├── lead-state.ts              # [MODIFY] Update expiry cron logic
│   │       └── settings-service.ts        # [EXISTING] Read countdown default setting
│   └── types/
│       └── countdown.ts                   # [NEW] Countdown-related TypeScript types
├── prisma/
│   ├── schema.prisma                      # [NO CHANGE] Uses existing expiresAt field
│   └── seed-settings.ts                   # [MODIFY] Add LEAD_COUNTDOWN_DEFAULT_DAYS
└── DOC/
    └── Records/
        └── COUNTDOWN-TIMER-IMPLEMENTATION-2025-10-22.md  # [NEW] Implementation record
```

**Structure Decision**: This feature follows the established Next.js App Router pattern with minimal new files. The countdown timer integrates into existing admin approval flow (`/api/leads/[id]/approve`), adds two new API endpoints for countdown management (`/countdown` and `/reactivate`), creates reusable UI components (`CountdownTimer.tsx`, `LeadCountdownControls.tsx`), and adds utility functions for countdown calculations (`countdown-service.ts`). No database migrations required since the `expiresAt` field already exists in the Lead model. The implementation is purely additive and non-breaking.

## Complexity Tracking

*This feature has NO constitutional violations and requires no justification.*

**Rationale**: The countdown timer feature integrates seamlessly into existing architecture without introducing new patterns, dependencies, or complexity. It leverages:
- Existing `expiresAt` field (no schema changes)
- Existing admin approval flow (extend, not replace)
- Existing cron job infrastructure (`checkAllExpiredLeads()`)
- Existing services (audit logging, notifications, settings)
- Established UI component patterns (Tailwind, Server/Client components)

The implementation follows all constitutional principles and maintains the project's simplicity and maintainability standards.
