# SendGrid Functionality Audit Report
Date: 2025-12-13
Status: Initial Audit

## Scope
- Verify SendGrid integration across frontend, backend, API routes, Prisma, and notification service.
- Validate environment configuration and runtime behavior.
- Identify gaps per user role: homeowners, installers, admins.

## Configuration
- Env vars: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- Source: src/lib/sendgrid.ts (singleton client)
- Consumers: src/lib/services/notification-service.ts, src/lib/lead-state.ts, mailer.ts (internal abstraction)

## Implementation Overview
- sendgrid.ts: initializes `@sendgrid/mail`, provides `sendEmail()` and role-specific template helpers.
- notification-service.ts: calls `sendEmailNotification()` gated by `shouldSendEmail(type)`.
- lead-state.ts: imports specific sendgrid helper for approved leads.

## Findings

### 1. Environment Configuration
- ✅ API key present in `.env` (`SENDGRID_API_KEY`)
- ✅ `SENDGRID_FROM_EMAIL` configured
- ⚠️ **Security Risk**: API key visible in `.env` file (must not be committed to public repos)
- ✅ Graceful degradation: When API key missing, logs warning and continues

### 2. Code Paths
- ✅ Email triggered via `shouldSendEmail()` gate in `notification-service.ts`
- ✅ Templates exist in `sendgrid.ts` for: new lead, approved lead, purchased lead, chat messages
- ✅ Generic email template used in `notification-service.ts` for all notification types
- ✅ Test harness added (captures emails when `NODE_ENV=test` or `PLAYWRIGHT_TEST=1`)

### 3. Critical Gaps Identified

**Missing Email Triggers** (High Priority):
The following important user actions do NOT trigger emails (not in `shouldSendEmail` list):
- ❌ `PHONE_VERIFIED` - Homeowner phone verification success
- ❌ `BID_SUBMITTED` - Installer submits bid (affects both homeowners and admins)
- ❌ `INSTALLER_RESPONDED` - Installer purchases lead (homeowner notification)
- ❌ `NEW_OPPORTUNITY` - New lead assigned to installer
- ❌ `PURCHASE_CONFIRMED` - Installer purchase confirmation

**Current Email Coverage** (from `shouldSendEmail` function):
- ✅ `NEW_LEAD` - Admin notification
- ✅ `LEAD_PURCHASED` - Admin notification
- ✅ `LEAD_APPROVED` - Homeowner notification
- ✅ `NEW_QUOTE` - (not currently used in codebase)
- ✅ `QUOTE_ACCEPTED` - (not currently used in codebase)
- ✅ `PAYMENT_RECEIVED` - (not currently used in codebase)
- ✅ `BID_WON` - Installer winner notification
- ✅ `BID_LOST` - Installer loser notification

### 4. Risks
- ⚠️ **Silent failures**: When API key missing, only console.warn (no metrics/alerts)
- ⚠️ **Incomplete coverage**: 5 critical notification types don't trigger emails
- ⚠️ **No e2e validation**: No tests verify emails sent for actual user flows
- ⚠️ **Generic templates**: All notifications use same HTML template (not role/action-specific)

## Role-Based Flow Coverage (Verified from Codebase)

### Homeowners
- ✅ Phone verified (OTP) → Notification created via `/api/verification/verify-otp`
  - Type: `PHONE_VERIFIED` or custom
  - Email trigger: **NOT in shouldSendEmail list** (Gap identified)
- ✅ New bid received → Notification via `/api/bids` (POST)
  - Type: `BID_SUBMITTED`
  - Email trigger: **NOT in shouldSendEmail list** (Gap identified)
  - Message: "An installer has submitted a bid for your {location} project"
- ✅ Installer responded (lead purchased) → Notification via `/api/leads/[id]/purchase`
  - Type: `INSTALLER_RESPONDED`
  - Email trigger: **NOT in shouldSendEmail list** (Gap identified)
- ✅ Lead approved → Notification via `/api/leads/[id]/approve`
  - Type: `REQUEST_RECEIVED`
  - Email trigger: **YES** (`LEAD_APPROVED` in shouldSendEmail)

### Installers
- ✅ New opportunity assigned → Notification via `/api/leads/[id]/approve`
  - Type: `NEW_OPPORTUNITY`
  - Email trigger: **NOT in shouldSendEmail list** (Gap identified)
  - Message: "A new homeowner request is available in your feed"
- ✅ Bid won (winner selected) → Notification via `/api/bids/[bidId]/select-winner`
  - Type: `BID_WON`
  - Email trigger: **YES** (`BID_WON` in shouldSendEmail)
- ✅ Bid lost → Notification via `/api/bids/[bidId]/select-winner`
  - Type: `BID_LOST`
  - Email trigger: **YES** (`BID_LOST` in shouldSendEmail)
- ✅ Purchase confirmed → Notification via `/api/leads/[id]/purchase`
  - Type: `PURCHASE_CONFIRMED`
  - Email trigger: **NOT in shouldSendEmail list** (Gap identified)

### Admins
- ✅ New lead created → Notification via lead creation flow
  - Type: `NEW_LEAD`
  - Email trigger: **YES** (`NEW_LEAD` in shouldSendEmail)
- ✅ Bid submitted → Notification via `/api/bids` (POST)
  - Type: `BID_SUBMITTED`
  - Email trigger: **NOT in shouldSendEmail list** (Gap identified)
- ✅ Lead purchased → Notification via `/api/leads/[id]/purchase`
  - Type: `LEAD_PURCHASED`
  - Email trigger: **YES** (`LEAD_PURCHASED` in shouldSendEmail)

## Test Plan (Playwright + Observability)
- Stub SendGrid via env in test or wrap `sgMail.send` to capture calls.
- Trigger key flows in UI/API and assert `sendEmail()` was invoked with expected payload.
- Validate graceful behavior when `SENDGRID_API_KEY` missing.

## Recommended Actions

### Priority 1: Fix Missing Email Triggers
Update `shouldSendEmail()` function in `notification-service.ts` to include:
```typescript
const emailNotificationTypes: NotificationType[] = [
  'NEW_LEAD',
  'LEAD_PURCHASED',
  'LEAD_APPROVED',
  'NEW_QUOTE',
  'QUOTE_ACCEPTED',
  'PAYMENT_RECEIVED',
  'BID_WON',
  'BID_LOST',
  // ⚠️ ADD THESE:
  'PHONE_VERIFIED',       // Homeowner verification
  'BID_SUBMITTED',        // Homeowner + Admin
  'INSTALLER_RESPONDED',  // Homeowner lead purchase
  'NEW_OPPORTUNITY',      // Installer assignment
  'PURCHASE_CONFIRMED',   // Installer confirmation
];
```

### Priority 2: E2E Test Coverage
- ✅ Test harness implemented (captures emails in test mode)
- ✅ Debug API endpoint created (`/api/test/sent-emails`)
- 🔄 Wire Playwright tests to trigger actual flows
- 🔄 Assert email payloads (to, subject, content)

### Priority 3: Monitoring & Observability
- Add metrics for email send success/failure rates
- Alert on consecutive SendGrid API failures
- Log email queue depth if implementing async sending

### Priority 4: Template Improvements
- Create role-specific email templates (homeowner vs installer vs admin)
- Add action-specific templates for better UX (e.g., bid submitted vs won vs lost)
- Include brand colors/logo consistent with in-app UI

## Implementation Status

### ✅ Completed (Phase 8)
1. **T101 - Audit Report**: Comprehensive SendGrid audit with role-based flow mapping
2. **T102 - Code Fixes**: Updated `shouldSendEmail()` with 7 additional notification types:
   - `BID_SUBMITTED` - Admin/Homeowner email on bid submission
   - `REQUEST_RECEIVED` - Homeowner email on lead approval
   - `INSTALLER_RESPONDED` - Homeowner email on lead purchase
   - `SELECTION_CONFIRMED` - Homeowner email on winner selection
   - `NEW_OPPORTUNITY` - Installer email on lead assignment
   - `BID_OUTCOME_NOT_SELECTED` - Installer email on bid loss (new type)
   - `BID_PURCHASE_COMPLETED` - Installer email on purchase completion
3. **Test Harness**: Implemented email capture for e2e testing
   - Added `__getCapturedEmails()` and `__clearCapturedEmails()` to `sendgrid.ts`
   - Created debug API `/api/test/sent-emails` (GET/DELETE)
   - Guarded by `NODE_ENV=test` or `PLAYWRIGHT_TEST=1`
4. **Verification**: 
   - ✅ TypeScript compilation: 0 errors
   - ✅ Production build: Compiled successfully (pre-existing warnings documented)

### 🔄 In Progress
1. **T103 - Playwright E2E Tests**: Scaffold created, needs flow triggers wired
   - Test file: `tests/e2e/sendgrid-notifications.spec.ts`
   - Debug API integrated
   - Next: Trigger actual user flows and assert email payloads

### 📋 Future Enhancements
1. Implement email queue (BullMQ/Redis) for async/retry logic
2. Create role-specific email templates
3. Add metrics/alerting for email delivery failures
4. Migrate legacy notification templates to new system
