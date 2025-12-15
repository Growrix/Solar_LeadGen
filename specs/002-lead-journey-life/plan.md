# Implementation Plan: Lead Journey & Life Cycle

**Branch**: `002-lead-journey-life` | **Date**: 2025-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-lead-journey-life/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement comprehensive lead management system from homeowner submission through installer purchase to deal closure. The frontend quote submission flow (InstantQuoteForm → QuoteOptionsModal → HomeownerSignupModal → Success) is already built and functional. This implementation focuses on backend APIs, database models, admin approval workflow (with Auto-Approval/Manual Review modes), installer marketplace, real-time chat system, quote management, phone verification via OTP, and full lifecycle tracking with audit trails. The system must support both startup operations (Manual Mode with hands-on control) and enterprise-scale automation (Auto-Approval Mode with configurable rules for pricing, assignment, and conditional approval).

### Phase 4.8 Progress Snapshot (2025-10-16)
- Schema/auth (T161-T163): Complete
- Services/APIs (T164-T169): Complete except T168 (admin lead-limit PATCH) pending
- Homeowner UI (T170-T176): Complete for MVP; T175 deferred
- Admin UI (T177-T179): T177 partially done (quota chips + columns); T178-T179 pending
- Validation (T180-T181): Pending

## Technical Context

**Language/Version**: TypeScript 5.3.3 (Strict mode), Next.js 14.2.33, React 18.2.0, Node.js 20.8+  
**Primary Dependencies**: Next.js App Router, Prisma 6.17.1, NextAuth.js 4.24.11, bcryptjs 3.0.2, Tailwind CSS 3.4.18  
**Storage**: PostgreSQL (Supabase-hosted with connection pooling), Prisma ORM for all database operations  
**Testing**: NEEDS CLARIFICATION (recommend Jest + React Testing Library for components, Playwright for E2E)  
**Target Platform**: Web application (responsive design, mobile-first approach, dark mode support)  
**Project Type**: Web application (Next.js monorepo with frontend + backend in src/app/)  
**Performance Goals**: <200ms API response time, <1s session checks (achieved via connection warming), real-time chat <2s message delivery, admin dashboard <3s initial load  
**Constraints**: JWT tokens <1KB (avoid cookie chunking), database queries optimized with select statements, auto-approval automation must process 1000+ leads/day without admin intervention, phone verification OTP valid 10 minutes  
**Scale/Scope**: Multi-tenant SaaS (homeowners, installers, admins), 10k+ leads/month target, 7 user stories (P1-P3), 51 functional requirements, 11 database entities, real-time chat + notifications, audit logging for compliance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Core Principles Compliance

1. **Next.js App Router First** ✅
   - All APIs will be implemented as `route.ts` files in `src/app/api/`
   - Server Components by default, 'use client' only for interactive UI
   - Middleware for authentication and role-based route protection
   - File-based routing pattern already established

2. **TypeScript Strict Mode** ✅
   - All files will be `.ts` or `.tsx`
   - Type definitions for all API responses, database models, session data
   - Extended NextAuth types in `src/types/next-auth.d.ts`
   - No `any` types (document exceptions)

3. **Database-First Design** ✅
   - All entities will be defined in `prisma/schema.prisma`
   - Migrations required for all schema changes
   - Prisma Client singleton pattern (`src/lib/prisma.ts`) already in place
   - Teaching comments for complex relationships

4. **Authentication & Authorization** ✅
   - NextAuth.js already configured with JWT sessions
   - Role-based access control (HOMEOWNER, INSTALLER, ADMIN)
   - Middleware enforces route protection (`src/middleware.ts`)
   - Admin bypass pattern already implemented
   - Connection warming implemented (fixes 18s delay)

5. **Security & Privacy** ✅
   - Environment variables for all secrets (`.env`)
   - Password hashing with bcryptjs (10 rounds)
   - Email validation required
   - CSRF protection via NextAuth
   - SQL injection protection via Prisma parameterized queries
   - OTP verification for phone numbers (new)

6. **Styling & Theming** ✅
   - Tailwind CSS utility-first approach
   - Dark mode support (class-based)
   - ThemeProvider Context API in place
   - Responsive design (mobile-first)

7. **Code Documentation** ✅
   - Teaching-first documentation philosophy
   - Extensive inline comments explaining "why"
   - API routes: Document inputs, outputs, error cases
   - Database models: Field descriptions and relationships

### 🚨 Gate Violations: NONE

All constitution principles are satisfied. No complexity violations to justify.

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
src/
├── app/
│   ├── api/
│   │   ├── leads/
│   │   │   ├── route.ts                    # Create lead, list leads
│   │   │   └── [id]/
│   │   │       ├── route.ts                # Get, update, delete lead
│   │   │       ├── approve/route.ts        # Admin approve lead
│   │   │       ├── reject/route.ts         # Admin reject lead
│   │   │       └── purchase/route.ts       # Installer purchase lead
│   │   ├── quotes/
│   │   │   ├── route.ts                    # Submit quote, list quotes
│   │   │   └── [id]/
│   │   │       ├── route.ts                # Get, update quote
│   │   │       ├── approve/route.ts        # Admin/Homeowner approve quote
│   │   │       └── reject/route.ts         # Reject quote
│   │   ├── verification/
│   │   │   ├── send-otp/route.ts           # Send OTP to phone
│   │   │   └── verify-otp/route.ts         # Verify OTP code
│   │   ├── chat/
│   │   │   ├── route.ts                    # Get chat history
│   │   │   └── [id]/
│   │   │       └── messages/route.ts       # Send/receive messages
│   │   ├── notifications/
│   │   │   └── route.ts                    # List notifications
│   │   ├── admin/
│   │   │   ├── settings/route.ts           # Approval mode config
│   │   │   ├── automation-rules/route.ts   # Configure automation rules
│   │   │   └── audit-logs/route.ts         # View audit trail
│   │   └── installer/
│   │       └── marketplace/route.ts        # Browse available leads
│   ├── admin/
│   │   └── leads/
│   │       └── page.tsx                    # Admin lead management UI
│   ├── installer/
│   │   ├── marketplace/
│   │   │   └── page.tsx                    # Installer lead marketplace
│   │   └── purchased-leads/
│   │       └── page.tsx                    # Installer purchased leads
│   └── homeowner/
│       └── my-leads/
│           └── page.tsx                    # Homeowner lead tracking
├── components/
│   ├── InstantQuoteForm.tsx                # ✅ Already exists
│   ├── QuoteOptionsModal.tsx               # ✅ Already exists
│   ├── HomeownerSignupModal.tsx            # ✅ Already exists
│   ├── QuoteSuccessModal.tsx               # ✅ Already exists
│   ├── LeadCard.tsx                        # New: Display lead summary
│   ├── ChatWindow.tsx                      # New: Real-time chat UI
│   └── OTPVerificationModal.tsx            # New: Phone verification
├── lib/
│   ├── prisma.ts                           # ✅ Singleton with connection warming
│   ├── auth.ts                             # ✅ NextAuth config with secure JWT
│   ├── otp.ts                              # New: OTP generation/validation
│   └── notifications.ts                    # New: Notification helpers
├── types/
│   ├── lead.ts                             # Lead types
│   ├── quote.ts                            # Quote types
│   └── chat.ts                             # Chat message types
└── middleware.ts                           # ✅ Auth + role-based protection

prisma/
├── schema.prisma                           # Database schema (will add 9 models)
└── migrations/                             # Auto-generated migrations

specs/002-lead-journey-life/
├── spec.md                                 # ✅ Feature specification
├── plan.md                                 # ✅ This file
├── research.md                             # Phase 0: To be generated
├── data-model.md                           # Phase 1: To be generated
├── quickstart.md                           # Phase 1: To be generated
├── contracts/                              # Phase 1: To be generated
│   ├── leads.openapi.yaml                  # ✅ Already exists
│   ├── quotes.openapi.yaml                 # To be generated
│   ├── verification.openapi.yaml           # To be generated
│   ├── chat.openapi.yaml                   # To be generated
│   └── notifications.openapi.yaml          # To be generated
└── tasks.md                                # Phase 2: /speckit.tasks command
```

**Structure Decision**: Next.js App Router monorepo structure. All backend APIs live in `src/app/api/` as `route.ts` files, frontend pages in `src/app/[role]/`, shared components in `src/components/`, business logic in `src/lib/`. This follows the Next.js 14 convention and aligns with the existing project structure. Database models centralized in `prisma/schema.prisma`. Frontend quote submission flow is already functional (InstantQuoteForm → QuoteOptionsModal → HomeownerSignupModal), so implementation focuses on backend integration and new features (marketplace, chat, verification, automation).

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**N/A** - No constitution violations detected. All requirements align with established principles.
