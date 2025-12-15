# Tasks: Lead Journey & Life Cycle

**Feature Branch**: `002-lead-journey-life`  
**Input**: Design documents from `/specs/002-lead-journey-life/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/  
**Tests**: Not requested in specification - excluded from task list  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7, Setup, Foundation, Polish)
- File paths follow Next.js App Router conventions

---

## ⚠️ MANDATORY WORKFLOW FOR EACH PHASE

### Before Starting Any Phase:
1. **Pre-Phase Audit & Planning** (30-60 minutes):
   - Read ALL spec files thoroughly (`spec.md`, `data-model.md`, `contracts/*.openapi.yaml`)
   - Map out EXACT data structures from spec (don't invent new ones)
   - Identify existing code patterns to follow (auth, services, API routes)
   - Check Prisma schema matches spec BEFORE writing any code
   - List all files to create/modify with their exact purposes
   - Verify external dependencies are installed and configured
   - Document any spec ambiguities - ASK USER before assuming
   - **RULE**: If spec says PhoneVerification links to User, schema MUST link to User. Don't change mid-implementation.

### During Phase Implementation:
2. **Spec-Driven Implementation** (Task by Task):
   - **For each task**: Re-read relevant spec section FIRST
   - Copy exact field names, types, and structures from spec
   - Follow existing code patterns (e.g., how other services are structured)
   - Use EXISTING utilities (don't reinvent: getSetting, createAuditLog, etc.)
   - Check function signatures in services BEFORE calling them
   - **Incremental Build Check**: After every 3-5 tasks, run `npm run build`
     - If errors appear: FIX according to spec, not by changing architecture
     - Don't create "temporary workarounds" that contradict spec
   - **Type Safety First**: Let TypeScript errors guide you to spec compliance
     - Missing field? Check spec - should it exist in schema?
     - Wrong type? Check spec - is service signature correct?
   - **No Spec Drift**: If you modify Prisma schema, update it ONCE at start of phase, not mid-phase

3. **Post-Phase Validation** (MUST COMPLETE BEFORE COMMIT):
   - ✅ **Schema Validation**: Run `npx prisma validate` - schema must match spec
   - ✅ **Type Check**: Run `npx tsc --noEmit` - all TypeScript must be valid
   - ✅ **Build**: Run `npm run build` - MUST pass with 0 errors
     - **Build Error Protocol**:
       1. Read error message carefully
       2. Check spec: Is implementation following spec exactly?
       3. Fix by aligning with spec, NOT by changing architecture
       4. If spec is ambiguous: STOP, document issue, ask user
       5. **Time Limit**: If fixing takes >30 min, STOP and report to user
   - ✅ **Lint**: Run `npm run lint` - fix critical issues only
   - ✅ **Manual Spot Check**: Open 2-3 key files, verify they match spec intent
   - ✅ **Task Checklist**: Every task T### must be checked off with proof
   - ✅ **Regression Check**: Run dev server, verify existing features still work

4. **Commit Approval** (MANDATORY):
   - ❌ **NEVER commit without explicit user approval**
   - Present validation results:
     - Build output (success/warnings)
     - Files changed count
     - Key changes summary
     - Any deviations from spec (with justification)
   - Wait for user confirmation: "Yes, commit this phase"
   - Only then: `git add .` → `git commit -m "Phase X: <summary>"`

### Phase Completion Criteria:
- ✅ All tasks marked complete with evidence
- ✅ Implementation matches spec exactly (data model, API contracts, types)
- ✅ Prisma schema validated
- ✅ TypeScript compiles with no errors
- ✅ Build passes (`npm run build`)
- ✅ No critical lint errors
- ✅ No spec drift or architectural changes mid-phase
- ✅ User approval received
- ✅ Git commit created with detailed message

### 🚨 RED FLAGS - STOP IMMEDIATELY:
- Schema doesn't match spec → Review spec, fix schema ONCE
- Service function signatures differ from usage → Check existing services, align
- Build errors persist >30 minutes → Report to user, don't spiral
- Creating new patterns not in existing codebase → Use existing patterns
- Inventing field names not in spec → Use exact spec names
- "I'll fix it later" thoughts → Fix now according to spec, or ask user

---

## 🛡️ BUILD ERROR PREVENTION CHECKLIST

**Use this BEFORE writing any integration code:**

### 1. Schema Verification (5 min)
```bash
# Check Prisma schema for exact model structure
cat prisma/schema.prisma | grep -A 20 "model YourModel"

# Validate schema is correct
npx prisma validate

# Check what relations exist
grep -E "model (User|Lead|PhoneVerification)" prisma/schema.prisma -A 15
```

### 2. Service Signature Verification (10 min)
```bash
# Check what a service actually exports
grep "^export" src/lib/services/your-service.ts

# Check function signatures
grep "export async function" src/lib/services/your-service.ts -A 3

# Example: Before calling getSetting()
grep "export.*getSetting" src/lib/services/settings-service.ts -A 5
# Result: getSetting(key: string) - only ONE parameter!
```

### 3. Type Verification (5 min)
```bash
# Check NextAuth session type
grep -A 20 "interface Session" src/types/next-auth.d.ts

# Check if field exists in session.user
grep "interface.*User" src/lib/auth.ts -A 10

# Check Prisma Client types
grep "export.*CreateNotificationInput" src/types/notification.ts -A 10
```

### 4. Existing Patterns Review (10 min)
- Open 2-3 similar existing files (e.g., if creating lead-service.ts, read audit-logger.ts)
- Note how they import Prisma client: `import { prisma } from '@/lib/prisma'`
- Note how they handle errors: try/catch patterns
- Note how they call other services: `await createAuditLog({ ... })`
- Copy-paste patterns, don't reinvent

### 5. Pre-Implementation Checklist
- [ ] Read spec section for this task completely
- [ ] Checked Prisma schema matches spec requirements
- [ ] Verified all service functions I'll call actually exist with correct signatures
- [ ] Confirmed all types I'll use exist and have required fields
- [ ] Reviewed 1-2 similar existing files for patterns
- [ ] Identified all imports needed (services, types, Prisma)
- [ ] Know exact field names from spec (not inventing new ones)

**TIME INVESTMENT**: 30 minutes of verification SAVES 3+ hours of build error fixing

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and environment configuration

- [X] T001 [P] [Setup] Add Twilio Verify API dependencies to `package.json` (@twilio/twilio-verify)
- [X] T002 [P] [Setup] Add Pusher real-time dependencies to `package.json` (pusher, pusher-js)
- [X] T003 [P] [Setup] Add Stripe payment dependencies to `package.json` (@stripe/stripe-js, stripe)
- [X] T004 [P] [Setup] Add SendGrid email dependencies to `package.json` (@sendgrid/mail)
- [X] T005 [P] [Setup] Add AWS S3 client dependencies to `package.json` (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
- [X] T006 [P] [Setup] Configure environment variables in `.env` (Twilio, Pusher, Stripe, SendGrid, AWS credentials)
- [X] T007 [P] [Setup] Create Pusher client singleton in `src/lib/pusher.ts` (server-side)
- [X] T008 [P] [Setup] Create Pusher client hook in `src/lib/hooks/usePusher.ts` (client-side)
- [X] T009 [P] [Setup] Create Stripe client singleton in `src/lib/stripe.ts` (server-side)
- [X] T010 [P] [Setup] Create SendGrid client singleton in `src/lib/sendgrid.ts`
- [X] T011 [P] [Setup] Create Twilio Verify client singleton in `src/lib/twilio.ts`
- [X] T012 [P] [Setup] Create S3 client singleton in `src/lib/s3.ts` with presigned URL helpers

**Checkpoint**: ✅ External service clients configured and ready for use

### Phase 1 Validation Checklist:
- [X] Pre-Phase Audit: Current state documented
- [X] All T001-T012 tasks completed
- [X] `npm run build` passes (0 errors)
- [X] All client singletons have proper error handling
- [X] Environment variables documented in .env
- [X] No TypeScript errors in service files
- [X] User approval received for commit
- [X] Git commit created with phase summary (Commit: b7e69c6)

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**✅ COMPLETE**: Foundation is ready - user story implementation can now begin

- [X] T013 [Foundation] Add all new Prisma models to `prisma/schema.prisma` (Lead, PhoneVerification, InstallDocument, ChatMessage, Quote, LeadFeedback, AuditLog, Notification, Settings)
- [X] T014 [Foundation] Add all new enums to `prisma/schema.prisma` (QuoteType, LeadStatus, Visibility, PurchaseStatus, NotificationType, etc.)
- [X] T015 [Foundation] Run Prisma migration `npx prisma migrate dev --name lead-journey-init`
- [X] T016 [Foundation] Generate Prisma Client `npx prisma generate`
- [X] T017 [P] [Foundation] Create TypeScript types in `src/types/lead.ts` (extends Prisma types with computed fields)
- [X] T018 [P] [Foundation] Create TypeScript types in `src/types/chat.ts`
- [X] T019 [P] [Foundation] Create TypeScript types in `src/types/quote.ts`
- [X] T020 [P] [Foundation] Create TypeScript types in `src/types/notification.ts`
- [X] T021 [P] [Foundation] Create lead state machine in `src/lib/services/lead-state.ts` (validates status transitions)
- [X] T022 [P] [Foundation] Create audit logger service in `src/lib/services/audit-logger.ts` (writes to AuditLog table)
- [X] T023 [P] [Foundation] Create notification service in `src/lib/services/notification-service.ts` (Pusher + SendGrid integration)
- [X] T024 [P] [Foundation] Create global Settings service in `src/lib/services/settings-service.ts` (manages approval mode, pricing)
- [X] T025 [Foundation] Extend NextAuth User type in `src/types/next-auth.d.ts` (add phoneVerified, leadSubmissionCount, installerVerified)
- [X] T026 [Foundation] Update `src/lib/auth.ts` JWT callbacks to include new user fields (phoneVerified, leadSubmissionCount, installerVerified)
- [X] T027 [Foundation] Seed Settings table with default values in `prisma/seed-settings.ts` (approval mode, default pricing)

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

### Phase 2 Validation Checklist:
- [X] Pre-Phase Audit: Database schema and existing models reviewed
- [X] All T013-T027 tasks completed
- [X] Prisma migration applied successfully (20251015084536_add_user_verification_fields)
- [X] `npm run build` passes (0 errors, only informational warnings)
- [X] All TypeScript types compile correctly
- [X] State machine validates all transitions
- [X] Services integrate with Prisma client correctly
- [X] NextAuth types extended properly
- [X] Settings seeded successfully (16 default settings)
- [X] No breaking changes to existing auth flow
- [ ] User approval received for commit
- [ ] Git commit created with phase summary

---

## Phase 3: User Story 1 - Homeowner Submits Lead Request (Priority: P1) 🎯 MVP

**Goal**: Enable homeowners to submit quote requests via existing UI flow, with OTP verification for subsequent submissions

**Independent Test**: Guest completes instant quote → selects quote type → sees signup modal → creates account → auto-login → submit → success. Logged-in user skips signup. 2nd submission requires OTP verification.

### Implementation for User Story 1

- [X] T028 [P] [US1] Create POST `/api/leads` route in `src/app/api/leads/route.ts` (create lead endpoint per leads.openapi.yaml)
- [X] T029 [P] [US1] Create GET `/api/leads` route in same file (list leads with role-based filtering)
- [X] T030 [P] [US1] Create GET `/api/leads/[id]/route.ts` (get single lead details)
- [X] T031 [P] [US1] Create lead creation service in `src/lib/services/lead-service.ts` (validation, creation, audit logging)
- [X] T032 [P] [US1] Create POST `/api/verification/send-otp` route in `src/app/api/verification/send-otp/route.ts` (Twilio integration per verification.openapi.yaml)
- [X] T033 [P] [US1] Create POST `/api/verification/verify-otp` route in `src/app/api/verification/verify-otp/route.ts` (verify OTP and update user)
- [X] T034 [P] [US1] Create phone verification service in `src/lib/services/phone-verification-service.ts` (rate limiting, OTP validation)
- [X] T035 [US1] Update existing `QuoteOptionsModal.tsx` to call POST `/api/leads` when quote type selected (integrate with existing flow)
- [X] T036 [US1] Update existing `HomeownerSignupModal.tsx` to auto-submit lead after successful signup (context="quote" flow)
- [X] T037 [US1] Create OTP verification modal component in `src/components/OTPVerificationModal.tsx` (shown on 2nd+ submission with 6-digit input)
- [X] T038 [US1] Create "Verified" badge component in `src/components/VerifiedBadge.tsx` (display phone verification status)
- [X] T039 [US1] Implement rate limiting feedback in UI (OTPVerificationModal shows retry timers and cooldowns)
- [X] T040 [US1] E.164 phone validation (implemented in send-otp route with regex validation)
- [X] T041 [US1] Rate limiting (✅ COMPLETE: 3 OTP per 15min in phone-verification-service.ts checkRateLimit())
- [X] T042 [US1] Admin notifications on lead creation (✅ COMPLETE: createNotification() called in lead-service.ts createLead())
- [-] T043 [US1] Update homeowner dashboard to show submission count, limits, and verification badge (⚠️ DEFERRED: Non-critical UI enhancement, can be done in Phase 10 Polish)

**Phase 3 Status**: ✅ **IMPLEMENTATION COMPLETE** - Core functionality ready, build passes, pending final testing and user approval for commit

**Checkpoint**: At this point, homeowners can submit leads (guest + logged-in flows), verify phone, and see verification badge. Leads appear in admin dashboard.

### Phase 3 (User Story 1) Validation Checklist:
- [X] Pre-Phase Audit: Reviewed spec.md, data-model.md, contracts/leads.openapi.yaml, contracts/verification.openapi.yaml
- [X] Schema Alignment: PhoneVerification model updated to link to User (not Lead) per verification flow requirements
- [X] Service Signatures Verified: getSetting, getSettingAsNumber, createAuditLog, createNotification checked before use
- [X] All T028-T043 tasks completed (T043 deferred as non-critical UI enhancement)
- [X] Prisma Schema Validated: `npx prisma validate` passed after PhoneVerification model update
- [X] Migration Applied: `20251015101959_update_phone_verification_schema` successful
- [X] TypeScript Check: `npx tsc --noEmit` passed (no type errors)
- [X] Build: `npm run build` passed (0 errors, only expected warnings about dynamic routes)
- [ ] API Testing: 
  - [ ] POST /api/leads (create lead as logged-in homeowner)
  - [ ] POST /api/leads (403 response when verification required)
  - [ ] POST /api/verification/send-otp (E.164 validation, rate limiting)
  - [ ] POST /api/verification/verify-otp (correct code acceptance, user.phoneVerified update)
- [ ] UI Testing:
  - [ ] QuoteOptionsModal: Lead submission flow
  - [ ] OTPVerificationModal: 6-digit input, countdown timer, resend functionality
  - [ ] VerifiedBadge: Display variants (inline, badge, icon-only)
- [ ] Business Logic:
  - [ ] Lead submission count increments correctly
  - [ ] Submission limits enforced (1 before verification, 5 total)
  - [ ] Rate limiting (3 OTP per 15 minutes) working
  - [ ] Admin notifications sent on lead creation
- [ ] No Regression: Existing instant quote flow, signup, login still working
- [ ] User approval received for commit
- [ ] Git commit created with detailed message

**Build Error Lessons Learned**:
1. ❌ PhoneVerification schema initially linked to Lead, but service expected userId → Fixed by updating schema to match service requirements
2. ❌ Used `auditLogger.log()` but service exports `createAuditLog()` function → Fixed by checking actual exports with grep
3. ❌ Used `notificationService.send()` but service exports `createNotification()` → Fixed by verifying export signatures
4. ❌ Called `getSetting(key, defaultValue)` but function only takes one parameter → Fixed by using getSettingAsNumber() instead
5. ❌ Used `session.user.phone` but phone not in session type → Fixed by passing phone from quoteData
6. ⚠️ **ROOT CAUSE**: Did not thoroughly review existing service signatures and Prisma schema before implementation
7. ✅ **SOLUTION**: Always grep for function exports and check schema relationships BEFORE writing integration code

---

## Phase 4: User Story 2 - Admin Reviews and Approves Leads (Priority: P1) 🎯 MVP

**Goal**: Admin can switch between Auto-Approval Mode and Manual Review Mode, configure automation rules, and manually approve/reject/price/assign leads

**Independent Test**: Switch to Manual Mode → new lead appears in "New" → admin approves, sets price, assigns → lead appears in installer feed. Switch to Auto Mode → configure rules → new lead auto-approved without admin action.

### Implementation for User Story 2

- [X] T044 [P] [US2] Create POST `/api/leads/[id]/approve` route in `src/app/api/leads/[id]/approve/route.ts` (admin approve lead)
- [X] T045 [P] [US2] Create POST `/api/leads/[id]/reject` route in `src/app/api/leads/[id]/reject/route.ts` (admin reject lead)
- [X] T046 [P] [US2] Create admin dashboard lead list page in `src/app/admin/leads/page.tsx` (table with filtering by status, verification, postcode)
- [ ] T047 [P] [US2] Create admin lead detail page in `src/app/admin/leads/[id]/page.tsx` (view full lead, set price, assign, approve/reject)
- [ ] T048 [P] [US2] Create admin settings page in `src/app/admin/settings/page.tsx` (switch modes, configure automation rules, set global pricing)
- [X] T049 [P] [US2] Create Settings API routes in `src/app/api/settings/route.ts` (GET/PATCH settings per spec)
- [X] T050 [US2] Implement automation rules engine in `src/lib/services/automation-engine.ts` (evaluates rules, auto-approves matching leads)
- [ ] T051 [US2] Create automation rules UI in admin settings page (add/edit/delete rules for quote type, verification, postcode)
- [ ] T052 [US2] Add mode-switching logic in Settings service (update database, validate mode change)
- [X] T053 [US2] Add lead auto-approval trigger in POST `/api/leads` route (call automation engine if Auto Mode enabled)
- [ ] T054 [US2] Create global pricing configuration UI in admin settings (Call/Visit default, Written Quote default)
- [ ] T055 [US2] Create lead assignment UI in admin lead detail page (select installers by filter or "All Installers")
- [ ] T056 [US2] Add "hot" lead toggle in admin lead detail page (mark lead as priority)
- [X] T057 [US2] Add lead status change tracking in approve/reject routes (log to audit trail, update status via state machine)
- [X] T058 [US2] Send notifications on lead approval/rejection (homeowner, assigned installers)
- [X] T059 [US2] Add middleware check in admin routes to enforce ADMIN role (prevent non-admins from accessing)

**Checkpoint**: Admins can switch modes, configure automation, manually approve/reject/price/assign leads. Auto-approved leads appear instantly in installer feeds.

### Phase 4 (User Story 2) Validation Checklist:
**Pre-Phase (30-60 min):**
- [ ] Read spec.md User Story 2 section completely
- [ ] Read contracts/leads.openapi.yaml for approve/reject endpoints
- [ ] Review existing admin dashboard structure and patterns
- [ ] Check lead-state.ts for valid status transitions
- [ ] Verify settings-service.ts exports (getSetting, updateSetting signatures)
- [ ] Grep for existing admin route patterns: `grep -r "role.*ADMIN" src/app/\(dashboard\)/admin`
- [ ] List all files to create/modify for this phase
- [ ] Prisma schema check: Settings model fields, Lead model approval fields

**During Implementation:**
- [ ] After T044-T049 (API routes): Run `npx tsc --noEmit` - fix type errors
- [ ] After T050-T053 (Services): Run `npm run build` - validate service integrations
- [ ] After T054-T059 (UI): Run `npm run build` - final validation

**Post-Phase Validation:**
- [ ] Schema Validation: `npx prisma validate`
- [ ] TypeScript: `npx tsc --noEmit` (0 errors)
- [ ] Build: `npm run build` (0 errors, warnings OK)
- [ ] All T044-T059 tasks completed
- [ ] Service Integrations Verified:
  - [ ] automation-engine.ts uses correct lead-state.ts functions
  - [ ] Approve/reject routes call createAuditLog correctly
  - [ ] Settings routes use getSetting/updateSetting correctly
- [ ] API Testing:
  - [ ] POST /api/leads/[id]/approve (status updates, audit logs)
  - [ ] POST /api/leads/[id]/reject (status updates, notifications)
  - [ ] GET/PATCH /api/settings (mode switching, pricing updates)
- [ ] UI Testing:
  - [ ] Admin leads list page displays, filters work
  - [ ] Admin lead detail page shows all actions
  - [ ] Settings page mode toggle works
  - [ ] Automation rules CRUD functional
- [ ] Business Logic:
  - [ ] Manual mode: Leads stay DRAFT until approved
  - [ ] Auto mode: Matching leads auto-approved
  - [ ] Pricing configuration applies to new leads
  - [ ] Lead assignment notifies assigned installers
  - [ ] Admin role enforcement prevents non-admin access
- [ ] No Regression: Phase 1-3 functionality still working
- [ ] User approval received for commit
- [ ] Git commit with detailed message

**Build Error Prevention Applied:**
- ✅ Checked settings-service.ts exports before calling
- ✅ Verified lead-state.ts transition functions exist
- ✅ Reviewed existing admin route auth patterns
- ✅ Confirmed all Prisma model fields exist in schema

---

## Phase 5: User Story 3 - Installer Discovers and Purchases Lead (Priority: P1) 🎯 MVP

**Goal**: Verified installers browse marketplace, purchase leads via Stripe, unlock contact details and chat

**Independent Test**: Verified installer views marketplace → selects lead (contact hidden) → purchases (Stripe payment) → lead moves to "Purchased Leads" → contact revealed → can chat.

### Implementation for User Story 3

- [ ] T060 [P] [US3] Create installer marketplace page in `src/app/(dashboard)/installer/marketplace/page.tsx` (list approved leads with filters)
- [ ] T061 [P] [US3] Create installer purchased leads page in `src/app/(dashboard)/installer/purchased-leads/page.tsx` (list purchased leads)
- [ ] T062 [P] [US3] Create installer lead detail page in `src/app/(dashboard)/installer/leads/[id]/page.tsx` (view lead, purchase button, chat UI)
- [ ] T063 [P] [US3] Create POST `/api/leads/[id]/purchase` route in `src/app/api/leads/[id]/purchase/route.ts` (Stripe payment integration per leads.openapi.yaml)
- [ ] T064 [P] [US3] Create Stripe webhook handler in `src/app/api/webhooks/stripe/route.ts` (confirm payment, update lead purchaseStatus)
- [ ] T065 [US3] Implement lead purchase service in `src/lib/services/purchase-service.ts` (create Stripe payment intent, verify payment, update lead)
- [ ] T066 [US3] Add contact details reveal logic in installer lead detail page (show only after purchaseStatus = PAID)
- [ ] T067 [US3] Add "Purchased" badge to marketplace lead cards (prevent duplicate purchase attempts)
- [ ] T068 [US3] Add installer verification check in marketplace page (redirect unverified to verification flow)
- [ ] T069 [US3] Create installer verification modal in `src/components/modals/InstallerVerificationModal.tsx` (phone OTP + document upload)
- [ ] T070 [US3] Create POST `/api/installer/verify` route in `src/app/api/installer/verify/route.ts` (handle document upload to S3)
- [ ] T071 [US3] Add "Verified Installer" badge display in installer profile and marketplace
- [ ] T072 [US3] Implement simultaneous purchase prevention in purchase route (optimistic locking or transaction)
- [ ] T073 [US3] Send notifications on lead purchase (homeowner, admin)
- [ ] T074 [US3] Add middleware check in installer routes to enforce INSTALLER role

**Checkpoint**: Verified installers can browse marketplace, purchase leads, see contact details, and access chat. Stripe payments processed successfully.

### Phase 5 (User Story 3) Validation Checklist:
**Pre-Phase (30-60 min):**
- [ ] Read spec.md User Story 3 section completely
- [ ] Read contracts/leads.openapi.yaml for purchase endpoint
- [ ] Review Stripe integration docs and src/lib/stripe.ts
- [ ] Review S3 integration docs and src/lib/s3.ts
- [ ] Check existing installer dashboard structure
- [ ] Grep Stripe webhook patterns: `grep -r "stripe.*webhook" src/`
- [ ] Verify lead-service.ts getLeadById() contact masking logic
- [ ] List all files to create/modify for this phase
- [ ] Prisma schema check: Lead.purchaseStatus, Lead.stripePaymentIntentId, InstallDocument model

**During Implementation:**
- [ ] After T060-T064 (Routes): Run `npx tsc --noEmit` - fix type errors
- [ ] After T065 (Purchase service): Run `npm run build` - validate Stripe integration
- [ ] After T066-T074 (UI + Verification): Run `npm run build` - final validation

**Post-Phase Validation:**
- [ ] Schema Validation: `npx prisma validate`
- [ ] TypeScript: `npx tsc --noEmit` (0 errors)
- [ ] Build: `npm run build` (0 errors, warnings OK)
- [ ] All T060-T074 tasks completed
- [ ] Service Integrations Verified:
  - [ ] purchase-service.ts uses stripe client correctly
  - [ ] Webhook validates Stripe signatures
  - [ ] S3 presigned URL generation for documents
  - [ ] createNotification called on purchase
- [ ] API Testing:
  - [ ] POST /api/leads/[id]/purchase (creates payment intent)
  - [ ] POST /api/webhooks/stripe (processes payment confirmation)
  - [ ] POST /api/installer/verify (uploads documents to S3)
  - [ ] GET /api/leads/[id] (contact masking before purchase)
- [ ] UI Testing:
  - [ ] Marketplace page lists approved leads
  - [ ] Lead detail hides contact until purchased
  - [ ] Purchase button triggers Stripe modal
  - [ ] Verification modal uploads documents
  - [ ] Verified badge displays correctly
- [ ] Business Logic:
  - [ ] Only APPROVED leads appear in marketplace
  - [ ] Contact details masked until purchaseStatus = PAID
  - [ ] Duplicate purchase prevented (optimistic locking)
  - [ ] Unverified installers redirected to verification
  - [ ] Homeowner and admin notified on purchase
  - [ ] Installer role enforcement working
- [ ] Stripe Integration:
  - [ ] Payment intent created successfully
  - [ ] Webhook receives and processes events
  - [ ] Payment failures handled gracefully
  - [ ] No duplicate charges
- [ ] S3 Integration:
  - [ ] Documents uploaded successfully
  - [ ] Presigned URLs generated correctly
  - [ ] File size/type validation working
- [ ] No Regression: Phase 1-4 functionality still working
- [ ] User approval received for commit
- [ ] Git commit with detailed message

**Build Error Prevention Applied:**
- ✅ Checked stripe.ts client initialization
- ✅ Verified s3.ts presigned URL functions
- ✅ Reviewed webhook signature verification patterns
- ✅ Confirmed PurchaseStatus enum in schema

---

## Phase 6: User Story 4 - Lead Status Tracking and Updates (Priority: P2)

**Goal**: All users see real-time status updates and full audit trail in their dashboards

**Independent Test**: Create lead → purchase → change status (e.g., "In Progress" → "Deal Closed") → verify all users see updated status and receive notifications. Check audit trail shows all actions.

### Implementation for User Story 4

- [ ] T075 [P] [US4] Create PATCH `/api/leads/[id]/status` route in `src/app/api/leads/[id]/status/route.ts` (update lead status with state machine validation)
- [ ] T076 [P] [US4] Create GET `/api/leads/[id]/audit` route in `src/app/api/leads/[id]/audit/route.ts` (fetch audit trail)
- [ ] T077 [P] [US4] Create lead status timeline component in `src/components/leads/LeadTimeline.tsx` (visual timeline with timestamps)
- [ ] T078 [US4] Add status timeline to homeowner lead detail page `src/app/(dashboard)/homeowner/leads/[id]/page.tsx`
- [ ] T079 [US4] Add status timeline to installer purchased lead detail page
- [ ] T080 [US4] Add status timeline to admin lead detail page
- [ ] T081 [US4] Implement real-time status update push via Pusher in status route (broadcast to all relevant users)
- [ ] T082 [US4] Add Pusher listener in lead detail pages (auto-refresh on status change event)
- [ ] T083 [US4] Create status change dropdown UI in installer/admin lead detail pages (select new status, validate transition)
- [ ] T084 [US4] Send notifications on status change (homeowner, installer, admin)
- [ ] T085 [US4] Add audit log display in admin lead detail page (table with all actions, timestamps, users)

**Checkpoint**: Status tracking and audit trail fully functional. All users see real-time updates and notifications.

### Phase 6 (User Story 4) Validation Checklist:
**Pre-Phase (30-60 min):**
- [ ] Read spec.md User Story 4 section completely
- [ ] Review lead-state.ts state machine transitions
- [ ] Review audit-logger.ts functions: `grep "^export" src/lib/services/audit-logger.ts`
- [ ] Review pusher.ts real-time patterns
- [ ] Check existing lead detail pages (homeowner/installer/admin)
- [ ] Verify AuditLog model fields in Prisma schema
- [ ] List all files to create/modify for this phase

**During Implementation:**
- [ ] After T075-T077 (API + Component): Run `npx tsc --noEmit`
- [ ] After T078-T085 (Integration): Run `npm run build`

**Post-Phase Validation:**
- [ ] Schema Validation: `npx prisma validate`
- [ ] TypeScript: `npx tsc --noEmit` (0 errors)
- [ ] Build: `npm run build` (0 errors, warnings OK)
- [ ] All T075-T085 tasks completed
- [ ] Service Integrations Verified:
  - [ ] Status route uses validateTransition() from lead-state.ts
  - [ ] Status route calls createAuditLog() correctly
  - [ ] Pusher trigger uses correct channel names
  - [ ] createNotification called on status changes
- [ ] API Testing:
  - [ ] PATCH /api/leads/[id]/status (validates transitions)
  - [ ] GET /api/leads/[id]/audit (returns audit trail)
  - [ ] Invalid transitions rejected (e.g., DRAFT → COMPLETED)
- [ ] UI Testing:
  - [ ] Timeline component displays status history
  - [ ] Status dropdown shows valid transitions only
  - [ ] Real-time updates appear without refresh
  - [ ] Audit log table displays in admin view
- [ ] Business Logic:
  - [ ] State machine prevents invalid transitions
  - [ ] All status changes logged to audit trail
  - [ ] Notifications sent to relevant parties
  - [ ] Real-time updates via Pusher working
  - [ ] Role-based status change permissions enforced
- [ ] Pusher Integration:
  - [ ] Channel subscriptions working
  - [ ] Events broadcast correctly
  - [ ] No duplicate updates
  - [ ] Fallback if Pusher unavailable
- [ ] No Regression: Phase 1-5 functionality still working
- [ ] User approval received for commit
- [ ] Git commit with detailed message

**Build Error Prevention Applied:**
- ✅ Verified lead-state.ts validateTransition signature
- ✅ Checked pusher.ts trigger function exports
- ✅ Confirmed AuditLog model structure
- ✅ Reviewed existing audit-logger.ts usage patterns

---

## Phase 7: User Story 5 - Admin Manages Lead Lifecycle and Resale (Priority: P3)

**Goal**: Admins can resell leads, reset timers, archive leads, and manage user accounts

**Independent Test**: Admin takes purchased lead → marks for resale → reset timer → lead reappears in marketplace. Archive lead → verify removed from feeds. Suspend user → verify access blocked.

### Implementation for User Story 5

- [ ] T086 [P] [US5] Create POST `/api/leads/[id]/resell` route in `src/app/api/leads/[id]/resell/route.ts` (reset purchase, mark available)
- [ ] T087 [P] [US5] Create POST `/api/leads/[id]/archive` route in `src/app/api/leads/[id]/archive/route.ts` (set archivedAt, remove from feeds)
- [ ] T088 [P] [US5] Create POST `/api/leads/[id]/reset-timer` route in `src/app/api/leads/[id]/reset-timer/route.ts` (update createdAt to now)
- [ ] T089 [P] [US5] Create admin user management page in `src/app/(dashboard)/admin/users/page.tsx` (list users with filters)
- [ ] T090 [P] [US5] Create POST `/api/admin/users/[id]/suspend` route in `src/app/api/admin/users/[id]/suspend/route.ts` (suspend user account)
- [ ] T091 [P] [US5] Create POST `/api/admin/users/[id]/verify` route in `src/app/api/admin/users/[id]/verify/route.ts` (manually verify user)
- [ ] T092 [US5] Add resale button to admin lead detail page (call resell endpoint)
- [ ] T093 [US5] Add archive button to admin lead detail page (call archive endpoint with confirmation)
- [ ] T094 [US5] Add timer reset button to admin lead detail page (call reset-timer endpoint)
- [ ] T095 [US5] Create user action buttons (suspend/verify) in admin user management page
- [ ] T096 [US5] Add archived leads filter in admin leads page (show/hide archived)
- [ ] T097 [US5] Implement admin exception flow for unverified installer lead access (assign lead to specific unverified installer)
- [ ] T098 [US5] Send notifications on account actions (suspend/verify)

**Checkpoint**: Advanced admin controls fully functional. Leads can be resold, archived, and users managed.

### Phase 7 (User Story 5) Validation Checklist:
**Pre-Phase (30-60 min):**
- [ ] Read spec.md User Story 5 section completely
- [ ] Review Lead model fields: archivedAt, expiresAt, createdAt, purchaseStatus
- [ ] Review User model fields: isActive, installerVerified
- [ ] Check lead-service.ts for existing lead update patterns
- [ ] Review existing admin lead detail page structure
- [ ] List all files to create/modify for this phase
- [ ] Verify state machine allows status changes for resale

**During Implementation:**
- [ ] After T086-T091 (API routes): Run `npx tsc --noEmit`
- [ ] After T092-T098 (UI integration): Run `npm run build`

**Post-Phase Validation:**
- [ ] Schema Validation: `npx prisma validate`
- [ ] TypeScript: `npx tsc --noEmit` (0 errors)
- [ ] Build: `npm run build` (0 errors, warnings OK)
- [ ] All T086-T098 tasks completed
- [ ] Service Integrations Verified:
  - [ ] Resale route resets purchaseStatus correctly
  - [ ] Archive route sets archivedAt without deleting
  - [ ] Suspend route updates User.isActive
  - [ ] All routes call createAuditLog
- [ ] API Testing:
  - [ ] POST /api/leads/[id]/resell (resets purchase, clears installer)
  - [ ] POST /api/leads/[id]/archive (sets archivedAt timestamp)
  - [ ] POST /api/leads/[id]/reset-timer (updates createdAt/expiresAt)
  - [ ] POST /api/admin/users/[id]/suspend (blocks user access)
  - [ ] POST /api/admin/users/[id]/verify (sets installerVerified)
- [ ] UI Testing:
  - [ ] Resale button appears in admin lead detail
  - [ ] Archive confirmation modal works
  - [ ] Timer reset updates expiry display
  - [ ] User management page lists users correctly
  - [ ] Suspend/verify actions update UI immediately
- [ ] Business Logic:
  - [ ] Resold leads reappear in marketplace
  - [ ] Archived leads hidden from all feeds
  - [ ] Timer reset extends lead availability
  - [ ] Suspended users cannot log in
  - [ ] Manual verification bypasses document upload
  - [ ] Admin exception allows unverified installer access
  - [ ] All actions logged to audit trail
  - [ ] Notifications sent on user account changes
- [ ] Data Integrity:
  - [ ] No data loss on resale (lead data preserved)
  - [ ] Archive reversible (archivedAt can be cleared)
  - [ ] Timer reset doesn't affect other timestamps
  - [ ] User suspension doesn't delete user data
- [ ] No Regression: Phase 1-6 functionality still working
- [ ] User approval received for commit
- [ ] Git commit with detailed message

**Build Error Prevention Applied:**
- ✅ Verified Lead model has all required timestamp fields
- ✅ Checked User model isActive and verification fields
- ✅ Reviewed existing Prisma update patterns
- ✅ Confirmed no breaking changes to lead filtering logic

---

## Phase 8: User Story 6 - Internal Chat and Quote Exchange (Priority: P2)

**Goal**: Real-time chat between homeowner and installer after purchase, with admin monitoring. Quote submission with admin review for Written Quotes.

**Independent Test**: Installer purchases lead → sends chat message → homeowner receives real-time notification → replies → installer sees reply instantly. Admin views chat history in real-time. Submit Written Quote → admin approves → homeowner sees quote.

### Implementation for User Story 6

- [ ] T099 [P] [US6] Create GET `/api/chat/[leadId]/messages` route in `src/app/api/chat/[leadId]/messages/route.ts` (fetch chat history per chat.openapi.yaml)
- [ ] T100 [P] [US6] Create POST `/api/chat/[leadId]/messages` route in same file (send message, persist, broadcast via Pusher)
- [ ] T101 [P] [US6] Create POST `/api/quotes` route in `src/app/api/quotes/route.ts` (submit quote per quotes.openapi.yaml)
- [ ] T102 [P] [US6] Create GET `/api/quotes/[id]` route in `src/app/api/quotes/[id]/route.ts` (get quote details)
- [ ] T103 [P] [US6] Create POST `/api/quotes/[id]/approve` route in `src/app/api/quotes/[id]/approve/route.ts` (admin/homeowner approve quote)
- [ ] T104 [P] [US6] Create POST `/api/quotes/[id]/reject` route in `src/app/api/quotes/[id]/reject/route.ts` (reject quote)
- [ ] T105 [US6] Create chat message component in `src/components/chat/ChatMessage.tsx` (message bubble with sender, timestamp)
- [ ] T106 [US6] Create chat window component in `src/components/chat/ChatWindow.tsx` (message list + input, Pusher real-time updates)
- [ ] T107 [US6] Add chat window to installer lead detail page (visible after purchase)
- [ ] T108 [US6] Add chat window to homeowner lead detail page (visible after purchase)
- [ ] T109 [US6] Add chat monitoring view to admin lead detail page (read-only chat history with real-time updates)
- [ ] T110 [US6] Implement Pusher channel subscription in chat window (subscribe to `lead-{id}-chat` channel)
- [ ] T111 [US6] Implement message persistence in POST messages route (save to database before broadcasting)
- [ ] T112 [US6] Create quote submission form in installer lead detail page (price, description, attachments via S3)
- [ ] T113 [US6] Create quote display component in `src/components/quotes/QuoteCard.tsx` (show quote details, approve/reject buttons)
- [ ] T114 [US6] Add quote approval workflow for Written Quotes (admin review before homeowner visibility)
- [ ] T115 [US6] Add quote display for Call/Visit quotes (immediate homeowner visibility)
- [ ] T116 [US6] Add admin quote review queue in `src/app/(dashboard)/admin/quotes/page.tsx` (list pending written quotes)
- [ ] T117 [US6] Implement file upload to S3 for quote attachments (use presigned URLs)
- [ ] T118 [US6] Send real-time notifications on chat messages (Pusher + email)
- [ ] T119 [US6] Send notifications on quote submission/approval/rejection

**Checkpoint**: Real-time chat and quote exchange fully functional. Admin can monitor chats. Written Quote approval workflow complete.

### Phase 8 (User Story 6) Validation Checklist:
**Pre-Phase (30-60 min):**
- [ ] Read spec.md User Story 6 section completely
- [ ] Read contracts/chat.openapi.yaml and contracts/quotes.openapi.yaml
- [ ] Review ChatMessage and Quote models in Prisma schema
- [ ] Review pusher.ts for chat channel patterns
- [ ] Review s3.ts for file upload presigned URLs
- [ ] Check existing installer/homeowner lead detail pages
- [ ] List all files to create/modify for this phase
- [ ] Verify QuoteType enum and approval workflow requirements

**During Implementation:**
- [ ] After T099-T104 (API routes): Run `npx tsc --noEmit`
- [ ] After T105-T111 (Chat components): Run `npm run build`
- [ ] After T112-T119 (Quote workflow): Run `npm run build` - final

**Post-Phase Validation:**
- [ ] Schema Validation: `npx prisma validate`
- [ ] TypeScript: `npx tsc --noEmit` (0 errors)
- [ ] Build: `npm run build` (0 errors, warnings OK)
- [ ] All T099-T119 tasks completed
- [ ] Service Integrations Verified:
  - [ ] Chat routes use Prisma ChatMessage model correctly
  - [ ] Quote routes use Prisma Quote model correctly
  - [ ] Pusher trigger for chat uses correct channel format
  - [ ] S3 upload for attachments uses presigned URLs
  - [ ] createNotification called on messages and quotes
- [ ] API Testing:
  - [ ] GET /api/chat/[leadId]/messages (returns chat history)
  - [ ] POST /api/chat/[leadId]/messages (saves + broadcasts)
  - [ ] POST /api/quotes (creates quote, triggers approval if Written)
  - [ ] GET /api/quotes/[id] (returns quote with access control)
  - [ ] POST /api/quotes/[id]/approve (approves, notifies)
  - [ ] POST /api/quotes/[id]/reject (rejects, notifies)
- [ ] UI Testing:
  - [ ] Chat window displays messages correctly
  - [ ] Message input sends and displays immediately
  - [ ] Real-time updates appear for both parties
  - [ ] Admin sees read-only chat history
  - [ ] Quote submission form works
  - [ ] Quote card displays with approve/reject buttons
  - [ ] File attachments upload successfully
- [ ] Business Logic:
  - [ ] Chat only accessible after lead purchased
  - [ ] Messages persist to database before Pusher broadcast
  - [ ] Written Quotes require admin approval before homeowner sees
  - [ ] Call/Visit quotes immediately visible to homeowner
  - [ ] Quote attachments stored in S3 with secure URLs
  - [ ] Admin can approve/reject Written Quotes
  - [ ] Notifications sent on new messages
  - [ ] Notifications sent on quote submission/approval/rejection
- [ ] Pusher Integration:
  - [ ] Chat channel `lead-{id}-chat` working
  - [ ] Messages broadcast in real-time
  - [ ] No duplicate messages
  - [ ] Fallback if Pusher unavailable
- [ ] S3 Integration:
  - [ ] Quote attachments uploaded successfully
  - [ ] Presigned URLs generated correctly
  - [ ] File download access controlled
- [ ] Data Integrity:
  - [ ] No message loss
  - [ ] Message order preserved
  - [ ] Quote versions tracked if edited
- [ ] No Regression: Phase 1-7 functionality still working
- [ ] User approval received for commit
- [ ] Git commit with detailed message

**Build Error Prevention Applied:**
- ✅ Verified ChatMessage and Quote model structures
- ✅ Checked pusher.ts chat trigger patterns
- ✅ Confirmed s3.ts presigned URL functions
- ✅ Reviewed QuoteType enum values in schema

---

## Phase 9: User Story 7 - Installer Feedback and Lead Quality Rating (Priority: P3)

**Goal**: Installers can rate and comment on lead quality, visible to admins

**Independent Test**: Installer purchases lead → rates it (1-5 stars) → adds comment → admin views feedback in lead detail and aggregate view.

### Implementation for User Story 7

- [ ] T120 [P] [US7] Create POST `/api/leads/[id]/feedback` route in `src/app/api/leads/[id]/feedback/route.ts` (submit installer feedback)
- [ ] T121 [P] [US7] Create GET `/api/leads/[id]/feedback` route in same file (fetch feedback for lead)
- [ ] T122 [P] [US7] Create lead rating component in `src/components/feedback/LeadRating.tsx` (star rating + comment input)
- [ ] T123 [US7] Add rating UI to installer lead detail page (visible after purchase, one-time submission)
- [ ] T124 [US7] Create feedback display in admin lead detail page (show rating, comment, timestamp)
- [ ] T125 [US7] Create lead quality dashboard in `src/app/(dashboard)/admin/lead-quality/page.tsx` (aggregate ratings, filter by rating)
- [ ] T126 [US7] Add feedback summary to admin leads list (average rating per lead)
- [ ] T127 [US7] Send notification to admin on low-quality lead feedback (e.g., rating < 3 stars)

**Checkpoint**: Lead quality feedback system complete. Admins can identify and address poor quality leads.

### Phase 9 (User Story 7) Validation Checklist:
**Pre-Phase (30-60 min):**
- [ ] Read spec.md User Story 7 section completely
- [ ] Review LeadFeedback model in Prisma schema
- [ ] Check existing installer lead detail page structure
- [ ] Review admin dashboard patterns for aggregate views
- [ ] List all files to create/modify for this phase
- [ ] Verify rating scale (1-5 stars) and comment requirements

**During Implementation:**
- [ ] After T120-T122 (API + Component): Run `npx tsc --noEmit`
- [ ] After T123-T127 (Integration): Run `npm run build`

**Post-Phase Validation:**
- [ ] Schema Validation: `npx prisma validate`
- [ ] TypeScript: `npx tsc --noEmit` (0 errors)
- [ ] Build: `npm run build` (0 errors, warnings OK)
- [ ] All T120-T127 tasks completed
- [ ] Service Integrations Verified:
  - [ ] Feedback routes use LeadFeedback model correctly
  - [ ] createNotification called for low ratings
  - [ ] createAuditLog called for feedback submissions
- [ ] API Testing:
  - [ ] POST /api/leads/[id]/feedback (creates feedback)
  - [ ] GET /api/leads/[id]/feedback (returns feedback)
  - [ ] One feedback per installer per lead enforced
  - [ ] Rating validation (1-5 range)
- [ ] UI Testing:
  - [ ] Rating component displays stars correctly
  - [ ] Comment input works
  - [ ] Feedback displays in admin lead detail
  - [ ] Quality dashboard shows aggregates
  - [ ] Low-rating alerts appear for admin
- [ ] Business Logic:
  - [ ] Feedback only submittable after purchase
  - [ ] One-time submission per installer per lead
  - [ ] Rating range validated (1-5 stars)
  - [ ] Comment optional but recommended
  - [ ] Admin sees all feedback in lead detail
  - [ ] Aggregate ratings calculated correctly
  - [ ] Low-rating notification sent (< 3 stars)
  - [ ] Feedback influences future lead quality
- [ ] Data Integrity:
  - [ ] Feedback immutable after submission
  - [ ] Timestamps preserved
  - [ ] Average ratings accurate
- [ ] No Regression: Phase 1-8 functionality still working
- [ ] User approval received for commit
- [ ] Git commit with detailed message

**Build Error Prevention Applied:**
- ✅ Verified LeadFeedback model structure
- ✅ Checked rating field type (Int)
- ✅ Confirmed unique constraint on installerId + leadId
- ✅ Reviewed notification-service.ts for alert patterns

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T128 [P] [Polish] Add loading states to all forms and buttons (skeleton loaders, spinners)
- [ ] T129 [P] [Polish] Add error boundary components for graceful error handling (`src/components/ErrorBoundary.tsx`)
- [ ] T130 [P] [Polish] Add toast notifications for all user actions (success, error messages using react-hot-toast)
- [ ] T131 [P] [Polish] Optimize database queries with Prisma select statements (reduce payload size)
- [ ] T132 [P] [Polish] Add API response caching for frequently accessed data (React Query or SWR)
- [ ] T133 [P] [Polish] Add pagination to all list endpoints (leads, notifications, audit logs)
- [ ] T134 [P] [Polish] Add mobile-responsive design improvements for all dashboard pages
- [ ] T135 [P] [Polish] Add dark mode support for new components (follow existing ThemeProvider)
- [ ] T136 [P] [Polish] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T137 [P] [Polish] Create comprehensive API documentation in `DOC/API-DOCUMENTATION.md` (all endpoints, examples)
- [ ] T138 [P] [Polish] Update quickstart.md with actual test results (validate all 4 test scenarios)
- [ ] T139 [P] [Polish] Add rate limiting to all API routes (prevent abuse)
- [ ] T140 [P] [Polish] Add input validation middleware for all routes (Zod schemas)
- [ ] T141 [P] [Polish] Security audit: Check for SQL injection, XSS, CSRF vulnerabilities
- [ ] T142 [P] [Polish] Performance audit: Check all API routes < 200ms response time
- [ ] T143 [Polish] Code cleanup: Remove console.logs, format code, fix linting errors
- [ ] T144 [Polish] Run quickstart.md validation (complete all 4 test scenarios)
- [ ] T145 [Polish] Create feature demo video or screenshots for DOC/Records/
- [ ] T146 [Polish] Update constitution.md with any new patterns established (if needed)
- [ ] Pre-Phase Audit: Feedback systems reviewed
- [ ] All T120-T127 tasks completed
- [ ] `npm run build` passes (0 errors)
- [ ] Feedback submission tested
- [ ] Rating display works correctly
- [ ] Admin dashboard shows aggregates
- [ ] Low-quality lead alerts working
- [ ] One-time submission enforced
- [ ] User approval received for commit
- [ ] Git commit created with phase summary

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T128 [P] [Polish] Add loading states to all forms and buttons (skeleton loaders, spinners)
- [ ] T129 [P] [Polish] Add error boundary components for graceful error handling (`src/components/ErrorBoundary.tsx`)
- [ ] T130 [P] [Polish] Add toast notifications for all user actions (success, error messages using react-hot-toast)
- [ ] T131 [P] [Polish] Optimize database queries with Prisma select statements (reduce payload size)
- [ ] T132 [P] [Polish] Add API response caching for frequently accessed data (React Query or SWR)
- [ ] T133 [P] [Polish] Add pagination to all list endpoints (leads, notifications, audit logs)
- [ ] T134 [P] [Polish] Add mobile-responsive design improvements for all dashboard pages
- [ ] T135 [P] [Polish] Add dark mode support for new components (follow existing ThemeProvider)
- [ ] T136 [P] [Polish] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T137 [P] [Polish] Create comprehensive API documentation in `DOC/API-DOCUMENTATION.md` (all endpoints, examples)
- [ ] T138 [P] [Polish] Update quickstart.md with actual test results (validate all 4 test scenarios)
- [ ] T139 [P] [Polish] Add rate limiting to all API routes (prevent abuse)
- [ ] T140 [P] [Polish] Add input validation middleware for all routes (Zod schemas)
- [ ] T141 [P] [Polish] Security audit: Check for SQL injection, XSS, CSRF vulnerabilities
- [ ] T142 [P] [Polish] Performance audit: Check all API routes < 200ms response time
- [ ] T143 [Polish] Code cleanup: Remove console.logs, format code, fix linting errors
- [ ] T144 [Polish] Run quickstart.md validation (complete all 4 test scenarios)
- [ ] T145 [Polish] Create feature demo video or screenshots for DOC/Records/
- [ ] T146 [Polish] Update constitution.md with any new patterns established (if needed)

### Phase 10 (Polish) Validation Checklist:
**Pre-Phase (60-90 min):**
- [ ] Full application review across all phases
- [ ] Identify common patterns to standardize
- [ ] Review all TODO/FIXME comments in codebase
- [ ] Check all console.log statements for removal
- [ ] Review error handling consistency
- [ ] List all API routes for rate limiting audit
- [ ] Identify components needing loading states
- [ ] Check mobile responsiveness gaps

**During Implementation:**
- [ ] After T128-T133 (UX improvements): Run `npm run build`
- [ ] After T134-T136 (Responsive/A11y): Test on mobile devices
- [ ] After T137-T142 (Security/Performance): Run audits
- [ ] After T143-T146 (Cleanup): Final `npm run build`

**Post-Phase Validation:**
- [ ] Schema Validation: `npx prisma validate`
- [ ] TypeScript: `npx tsc --noEmit` (0 errors)
- [ ] Build: `npm run build` (0 errors, 0 warnings)
- [ ] Lint: `npm run lint` (0 errors, warnings OK)
- [ ] All T128-T146 tasks completed

**UX & Accessibility:**
- [ ] All forms have loading states
- [ ] Error boundaries catch and display errors gracefully
- [ ] Toast notifications appear for all user actions
- [ ] Mobile responsiveness tested (375px, 768px, 1024px)
- [ ] Dark mode works on all new components
- [ ] Keyboard navigation functional
- [ ] ARIA labels added to interactive elements
- [ ] Screen reader compatible

**Performance:**
- [ ] All API routes respond < 200ms (test with network throttling)
- [ ] Database queries optimized (only select needed fields)
- [ ] API caching implemented for static/frequent data
- [ ] Pagination working on all list endpoints (max 50 items)
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size acceptable (<500KB main bundle)

**Security:**
- [ ] SQL injection tests passed (parameterized queries)
- [ ] XSS protection enabled (input sanitization)
- [ ] CSRF tokens on all POST/PATCH/DELETE routes
- [ ] Rate limiting on all API routes (max 100 req/min per IP)
- [ ] Input validation with Zod schemas
- [ ] No sensitive data in logs or error messages
- [ ] Authentication checks on all protected routes

**Code Quality:**
- [ ] No console.log in production code
- [ ] All files formatted consistently
- [ ] No unused imports or variables
- [ ] All ESLint errors fixed
- [ ] TypeScript strict mode enabled
- [ ] No `any` types without justification
- [ ] Error handling consistent across codebase

**Testing:**
- [ ] Quickstart.md Test 1: Guest lead submission → signup → OTP → success
- [ ] Quickstart.md Test 2: Admin approval → marketplace → purchase → chat
- [ ] Quickstart.md Test 3: Status updates → real-time → notifications
- [ ] Quickstart.md Test 4: Feedback → quality dashboard → low-rating alert
- [ ] All user stories testable independently

**Documentation:**
- [ ] API-DOCUMENTATION.md complete with all endpoints
- [ ] All endpoints have request/response examples
- [ ] Error codes documented
- [ ] Rate limits documented
- [ ] Authentication requirements documented
- [ ] Feature demo created (video or screenshots)
- [ ] Constitution.md updated with new patterns (if any)

**Final Checks:**
- [ ] Dev server starts without errors: `npm run dev`
- [ ] Production build successful: `npm run build`
- [ ] No regression in any phase 1-9 functionality
- [ ] All environment variables documented in .env.example
- [ ] Database migrations all applied successfully
- [ ] User approval received for commit
- [ ] Git commit with comprehensive phase summary

**Build Error Prevention Applied:**
- ✅ Incremental validation after every polish task group
- ✅ Mobile and accessibility testing continuous
- ✅ Performance monitoring throughout
- ✅ Security audit checklists followed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
  - **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories
  - **User Story 3 (P1)**: Can start after Foundational - No dependencies on other stories (but logically follows US1+US2 for MVP flow)
  - **User Story 4 (P2)**: Depends on US1, US2, US3 (requires leads to be created, approved, purchased)
  - **User Story 5 (P3)**: Depends on US3 (requires purchased leads for resale)
  - **User Story 6 (P2)**: Depends on US3 (requires purchased leads for chat/quotes)
  - **User Story 7 (P3)**: Depends on US3 (requires purchased leads for feedback)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### Recommended MVP Scope (Immediate Business Value)

**Phase 1 + Phase 2 + User Stories 1-3 (P1)** = Complete transaction loop:
1. Homeowner submits lead (US1)
2. Admin approves/prices/assigns (US2)
3. Installer purchases lead (US3)

This delivers core revenue generation. Additional user stories (US4-US7) add transparency, lifecycle management, and quality control but are not strictly required for MVP launch.

### Parallel Opportunities

- **Setup Phase**: All tasks T001-T012 marked [P] can run in parallel
- **Foundational Phase**: Tasks T017-T024 marked [P] can run in parallel (after schema is created)
- **User Story 1**: Tasks T028-T034, T037, T039 marked [P] can run in parallel (different files)
- **User Story 2**: Tasks T044-T048 marked [P] can run in parallel (different files)
- **User Story 3**: Tasks T060-T063 marked [P] can run in parallel (different files)
- **User Story 4**: Tasks T075-T077 marked [P] can run in parallel (different files)
- **User Story 5**: Tasks T086-T091 marked [P] can run in parallel (different files)
- **User Story 6**: Tasks T099-T104 marked [P] can run in parallel (different files)
- **User Story 7**: Tasks T120-T122 marked [P] can run in parallel (different files)
- **Polish Phase**: Most tasks marked [P] can run in parallel (independent improvements)

### Within Each User Story

1. API routes and services can be built in parallel (marked [P])
2. UI components follow after API routes are complete
3. Integration work comes last within each story
4. Each story should be independently testable before moving to next priority

---

## Parallel Example: User Story 1 (Lead Submission)

```bash
# Can run simultaneously (different files):
- T028: Create POST /api/leads route
- T029: Create GET /api/leads route  
- T030: Create GET /api/leads/[id] route
- T031: Create lead-service.ts
- T032: Create POST /api/verification/send-otp route
- T033: Create POST /api/verification/verify-otp route
- T034: Create phone-verification-service.ts
- T037: Create OTPVerificationModal.tsx
- T039: Create VerifiedBadge.tsx

# Must run sequentially (integration):
- T035: Update QuoteOptionsModal.tsx (needs T028 complete)
- T036: Update HomeownerSignupModal.tsx (needs T028 complete)
- T038: Add submission count tracking (needs T028, T034 complete)
```

---

## Implementation Strategy

### MVP-First Approach (Recommended)

1. **Week 1**: Complete Setup + Foundational (T001-T027)
2. **Week 2**: User Story 1 - Lead Submission (T028-T043)
3. **Week 3**: User Story 2 - Admin Approval (T044-T059)
4. **Week 4**: User Story 3 - Installer Purchase (T060-T074)
5. **Week 5**: Polish Phase (critical items T128-T144)

**Result**: MVP launch with complete revenue cycle in 5 weeks

### Incremental Delivery

After MVP launch, add remaining user stories incrementally:
- **Week 6**: User Story 4 - Status Tracking (T075-T085)
- **Week 7**: User Story 6 - Chat & Quotes (T099-T119)
- **Week 8**: User Story 5 - Admin Lifecycle (T086-T098)
- **Week 9**: User Story 7 - Feedback (T120-T127)
- **Week 10**: Final Polish (T145-T146)

### Team Parallelization

If multiple developers available:
- **Dev 1**: User Stories 1 + 4 (homeowner-focused)
- **Dev 2**: User Stories 2 + 5 (admin-focused)
- **Dev 3**: User Stories 3 + 7 (installer-focused)
- **Dev 4**: User Story 6 (chat/quotes - complex real-time)

All can work in parallel after Foundational phase completes.

---

## Task Summary

- **Total Tasks**: 146
- **Setup**: 12 tasks
- **Foundational**: 15 tasks (BLOCKING)
- **User Story 1 (P1)**: 16 tasks (MVP)
- **User Story 2 (P1)**: 16 tasks (MVP)
- **User Story 3 (P1)**: 15 tasks (MVP)
- **User Story 4 (P2)**: 11 tasks
- **User Story 5 (P3)**: 13 tasks
- **User Story 6 (P2)**: 21 tasks
- **User Story 7 (P3)**: 8 tasks
- **Polish**: 19 tasks
- **Parallel Opportunities**: 68 tasks marked [P] (46% can run in parallel)
- **MVP Scope**: 59 tasks (Setup + Foundational + US1-3 + critical Polish)

---

**Ready to implement!** Each task is specific enough for immediate execution. Follow the phase order, leverage parallel opportunities, and use the quickstart.md for testing guidance.
