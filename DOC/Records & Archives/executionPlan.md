# Instant Quote & Lead Management - Execution Plan

## Overview
This document outlines an **iterative, agile implementation plan** for building the complete Instant Quote and Lead Management feature set. Each feature follows a **Audit Current State → Build → Test → Document** cycle to ensure we always work with the latest reality.

---

## 🎯 Project Goal
Deliver a robust, user-friendly Instant Quote and Lead Management feature that empowers Admins, Homeowners, and Installers with clear, actionable data and seamless workflows—while maintaining code quality, scalability, and clean development.

---

## 📋 Agile Implementation Principles

### Iterative Development Approach:
**We build one feature at a time, always auditing the current state before starting.**

1. **Audit Current State** - Review relevant code/DB/APIs for THIS feature only
2. **Build Feature** - Implement the feature incrementally
3. **Test Thoroughly** - Validate functionality works as expected
4. **Document Decisions** - Record only what's necessary (issues, changes, decisions)
5. **Commit Progress** - Save working code with clear commit message
6. **Move to Next Feature** - Repeat cycle

### Why This Approach?
- ✅ **No outdated documentation** - We audit before each feature, not months in advance
- ✅ **Flexible to changes** - If one feature changes everything, we adapt immediately
- ✅ **Faster delivery** - Less planning overhead, more building
- ✅ **Real feedback** - Test with actual code, not theoretical plans
- ✅ **Less confusion** - Work with current state, not assumptions from weeks ago

### Development Rules:
- ✅ **One feature at a time** - Finish completely before starting next
- ✅ **Audit only what you need** - Don't audit the entire codebase for one small feature
- ✅ **Test immediately** - Don't accumulate untested code
- ✅ **Commit working code** - Never commit broken features
- ✅ **Document decisions, not plans** - Record what you DID and WHY, not what you MIGHT do
- ✅ **Reuse existing patterns** - Maintain consistency with existing codebase

---

## 🔄 Lead Lifecycle Statuses (Global Reference)

```
NEW → PENDING → IN_PROGRESS → DEAL_CLOSED
                              ↓
                         VOID / NO_RESPONSE
```

### Status Definitions:
- **NEW** - Just created, not yet viewed by installer
- **PENDING** - Viewed by installer, awaiting action
- **IN_PROGRESS** - Installer actively working on lead
- **DEAL_CLOSED** - Successfully converted to customer
- **VOID** - Lead cancelled or invalid
- **NO_RESPONSE** - Homeowner did not respond

---

# 🎯 Feature Implementation Roadmap

## Current Progress: Initial Audit Complete ✅

**What We Know So Far** (from Phase 1.1 audit):
- ✅ No formal auth exists (localStorage only)
- ✅ All UI components ready (33 components, 90% complete)
- ✅ 3 dashboards built but need backend
- ✅ Only 3 API endpoints exist (instant quote, admin quotes, newsletter)
- ✅ GuestInstantQuote table complete with 48 fields
- ✅ 🚨 Critical: Admin API has no authentication

**Audit Documents Created**:
- `DOC/audit-phase1-auth.md`
- `DOC/audit-phase1-guest-quotes.md`
- `DOC/audit-phase1-dashboards.md`
- `DOC/audit-phase1-api-endpoints.md`
- `DOC/audit-phase1-ui-components.md`

Now we build features one at a time.

---

# Feature 1: User Authentication System

**Priority**: 🔴 CRITICAL (Blocks all other features)  
**Status**: 🟡 Ready to Start

## Why This Feature First?
Without authentication:
- No user accounts = No quote requests
- No role-based access = Security risk
- Admin panel is exposed to everyone (critical vulnerability)
- Can't track homeowner requests or installer purchases

## What We Know (From Initial Audit):
✅ No formal auth exists (localStorage only - insecure)  
✅ Auth UI components ready (HomeownerSignupModal, InstallerSignupModal, etc.)  
✅ 4 roles needed: Guest, Homeowner, Installer, Admin  
✅ Admin API currently has NO protection (critical vulnerability)  

**See**: `DOC/audit-phase1-auth.md` for full details

---

## Implementation Steps

### Step 1: Design User Database Model ✅ COMPLETE
**Before building anything, design the User table**

**Tasks**:
- [x] Review what fields we need (email, password, name, role, phone, etc.)
- [x] Decide on role system (enum or separate tables)
- [x] Plan relationships to other tables (quote requests, etc.)
- [x] Add User model to `prisma/schema.prisma`
- [x] Review schema, don't migrate yet

**Output**: Updated Prisma schema with User model

---

### Step 2: Set Up NextAuth.js ✅ COMPLETE
**Install and configure authentication provider**

**Tasks**:
- [x] Install NextAuth.js: `npm install next-auth @next-auth/prisma-adapter`
- [x] Create NextAuth config: `src/app/api/auth/[...nextauth]/route.ts`
- [x] Configure providers (email/password, Google, Apple)
- [x] Set up session strategy and callbacks
- [x] Add role to session object
- [x] Test NextAuth setup works

**Output**: Working NextAuth.js configuration

---

### Step 3: Create Database Migration ✅ COMPLETE
**Now that auth is configured, migrate the database**

**Tasks**:
- [x] Run migration: `npx prisma migrate dev --name add_user_authentication`
- [x] Run Prisma generate: `npx prisma generate`
- [x] Verify User table created in database
- [x] Test: Create a user manually via Prisma Studio

**Output**: User table in database, Prisma types updated

---

### Step 4: Build Registration API ✅ COMPLETE
**Create signup endpoints for Homeowners and Installers**

**Tasks**:
- [x] Audit: Review `HomeownerSignupModal.tsx` to see what fields it sends
- [x] Create `POST /api/auth/register/homeowner` endpoint
- [x] Hash passwords with bcrypt
- [x] Validate email format and password strength
- [x] Return success/error responses
- [x] Test with Postman/Thunder Client
- [x] Repeat for installer: `POST /api/auth/register/installer`

**Output**: Working registration APIs

---

### Step 5: Connect Signup Modals to API ✅ COMPLETE
**Make the UI modals actually create accounts**

**Tasks**:
- [x] Audit: Open `HomeownerSignupModal.tsx` and find the form submission handler
- [x] Replace mock API call with real fetch to registration endpoint
- [x] Handle loading states
- [x] Handle error messages (email exists, weak password, etc.)
- [x] Handle success (auto-login or redirect to login)
- [x] Test: Fill signup form → Submit → Verify account created
- [x] Repeat for `InstallerSignupModal.tsx`
- [x] **BONUS**: Added automatic login after successful signup

**Output**: Signup modals create real user accounts + auto-login

---

### Step 6: Build Login Flow ✅ COMPLETE
**Let users sign in to their accounts**

**Tasks**:
- [x] Audit: Review `HomeownerSignInModal.tsx` to see form structure
- [x] Connect to NextAuth `signIn()` function
- [x] Handle login errors (wrong password, user not found)
- [x] Handle success (redirect to dashboard based on role)
- [x] Test: Login as homeowner → Redirect to `/homeowner/dashboard`
- [x] Test: Login as installer → Redirect to `/installer/dashboard`
- [x] Test: Login as admin → Redirect to `/admin/dashboard`
- [x] **CRITICAL FIXES**: 
  - Fixed race condition in success handlers
  - Success handlers now fetch fresh session before redirecting
  - Fixed "Dashboard" button to check user role

**Output**: Login flow working for all roles with correct redirects

---

### Step 7: Protect Routes with Middleware ✅ COMPLETE
**Stop unauthorized users from accessing dashboards**

**Tasks**:
- [x] Create `src/middleware.ts`
- [x] Check if user is authenticated using NextAuth session
- [x] Redirect unauthenticated users to login
- [x] Check user role and restrict access:
  - `/admin/*` → Only admin role
  - `/homeowner/*` → Only homeowner role
  - `/installer/*` → Only installer role
- [x] Auto-redirect to correct dashboard if wrong role
- [x] Test: Try accessing `/admin/dashboard` without login → Redirected
- [x] Test: Login as homeowner, try accessing `/installer/dashboard` → Blocked

**Output**: All dashboard routes protected by role

**CRITICAL FIX**: Removed DEV bypass buttons that were completely bypassing authentication

---

### Step 8: Secure Admin API ⏸️ PENDING
**Fix the critical vulnerability in admin endpoints**

**Tasks**:
- [ ] Audit: Check `src/app/api/admin/instant-quotes/route.ts`
- [ ] Add authentication check at the top of GET handler
- [ ] Verify user role is "admin"
- [ ] Return 401 Unauthorized if not admin
- [ ] Test: Access API without login → 401 error
- [ ] Test: Access API as homeowner → 403 Forbidden
- [ ] Test: Access API as admin → Success

**Output**: Admin API secured

---

### Step 9: Test Complete Auth Flow ⏸️ PENDING (USER TESTING REQUIRED)
**Validate everything works end-to-end**

**Tasks**:
- [ ] Test guest journey: Homepage → Can't access dashboards
- [ ] Test signup: Create homeowner account → Auto-login → Dashboard
- [ ] Test login: Logout → Login again → Dashboard
- [ ] Test role redirect: Login as installer → Goes to installer dashboard
- [ ] Test admin access: Login as admin → Can see admin panel
- [ ] Test security: Logout → Try accessing dashboard → Redirected to login
- [ ] Test middleware: Type dashboard URL without login → Blocked
- [ ] Test wrong role: Installer types homeowner URL → Redirected to installer

**Output**: All auth flows working perfectly

---

### Step 10: Document & Commit ✅ COMPLETE
**Save your work and document decisions**

**Tasks**:
- [x] Create comprehensive documentation:
  - `DOC/COMPREHENSIVE-AUTH-AUDIT-OCTOBER-13.md` - Full audit report
  - `DOC/AUTH-FIXES-SUMMARY-OCTOBER-13.md` - All fixes applied
  - `DOC/FINAL-AUTH-RESOLUTION.md` - Testing guide
  - `DOC/CRITICAL-BUG-AUTH-BYPASS.md` - First bug fix
  - `DOC/CRITICAL-BUG-2-ROLE-REDIRECTS.md` - Second bug fix
- [x] Documented all issues encountered and solutions
- [x] Created testing checklist
- [x] Update this execution plan: Mark steps as complete

**Output**: Feature fully documented

---

## 🚨 Critical Issues Found & Fixed (October 13, 2025)

### Issue #1: DEV Bypass Buttons ✅ FIXED
- **Problem**: DEV buttons (`DEV: H.Dash`, etc.) bypassed authentication completely
- **Impact**: Anyone could access any dashboard without logging in
- **Solution**: Removed all DEV bypass buttons from `HeaderMenu.tsx`

### Issue #2: No Middleware ✅ FIXED
- **Problem**: No server-side route protection existed
- **Impact**: Could type dashboard URLs and access without authentication
- **Solution**: Created `src/middleware.ts` with role-based protection

### Issue #3: Race Condition in Success Handlers ✅ FIXED
- **Problem**: Success handlers checked session before it was updated
- **Impact**: Wrong dashboard redirects, role not detected
- **Solution**: Success handlers now fetch `/api/auth/session` before redirecting

### Issue #4: Dashboard Button Always Homeowner ✅ FIXED
- **Problem**: "Dashboard" button hardcoded to homeowner dashboard
- **Impact**: Installers went to wrong dashboard
- **Solution**: Created smart `handleDashboardClick()` that checks role

### Issue #5: No Auto-Login After Signup ✅ FIXED
- **Problem**: Users not logged in after successful signup
- **Impact**: Confusing UX, redirected to dashboard but not authenticated
- **Solution**: Signup modals now automatically call `signIn()` after registration

**See**: `DOC/COMPREHENSIVE-AUTH-AUDIT-OCTOBER-13.md` for full analysis

---

## Success Criteria
Feature 1 is complete when:
- [x] Users can sign up (homeowners and installers)
- [x] Users can log in with email/password
- [x] Users are redirected to correct dashboard based on role
- [x] All dashboard routes are protected by middleware
- [x] DEV bypass buttons removed
- [x] Success handlers correctly fetch session before redirecting
- [x] "Dashboard" button routes based on user role
- [x] Auto-login after signup
- [ ] Admin API requires admin authentication (Step 8 - Pending)
- [ ] Tests pass for all scenarios (Step 9 - User testing required)
- [ ] Code is committed (Ready to commit after testing)

**Current Status**: 🟡 80% Complete - Awaiting user testing before final commit

---

## Success Criteria
Feature 1 is complete when:
- ✅ Users can sign up (homeowners and installers)
- ✅ Users can log in with email/password
- ✅ Users are redirected to correct dashboard based on role
- ✅ All dashboard routes are protected
- ✅ Admin API requires admin authentication
- ✅ Tests pass for all scenarios
- ✅ Code is committed

---

# Feature 2: Database Models for Quote Requests

**Priority**: 🟠 HIGH (Needed for homeowner quote requests)  
**Status**: ⏸️ Blocked by Feature 1 (Need User model first)  
**Depends On**: Feature 1 (User authentication)

## Why This Feature Second?
Once users can sign up/login, they need to be able to request quotes. This feature creates the database structure to store those requests.

---

## Audit Before Building

**Tasks**:
- [ ] Audit: Review existing `GuestInstantQuote` model (already done in Phase 1.1)
- [ ] Audit: Check what fields homeowners will need for quote requests
- [ ] Audit: Review `NewQuoteRequestModal.tsx` to see what data it collects

**What We Already Know**:
- ✅ `GuestInstantQuote` table exists with 48 fields
- ✅ `NewQuoteRequestModal` component exists (wraps InstantQuoteForm)
- ✅ Need two types: Call/Visit requests and Written quote requests

---

## Implementation Steps

### Step 1: Design Quote Request Models
**Plan the database tables for quote requests**

**Tasks**:
- [ ] Open `prisma/schema.prisma`
- [ ] Design `CallVisitQuoteRequest` model:
  - id, userId (FK to User), guestQuoteId (FK to GuestInstantQuote)
  - status (enum: NEW, PENDING, IN_PROGRESS, DEAL_CLOSED, VOID, NO_RESPONSE)
  - requestedAt, purchasedBy (installerId), purchasedAt
  - Additional fields as needed
- [ ] Design `WrittenQuoteRequest` model (similar structure)
- [ ] Create `LeadStatus` enum
- [ ] Add relationships between tables
- [ ] Review schema, don't migrate yet

**Output**: Quote request models designed in schema

---

### Step 2: Add FK Relationship to GuestInstantQuote
**Link guest quotes to quote requests**

**Tasks**:
- [ ] Add optional `userId` field to `GuestInstantQuote` model
- [ ] Add relationship: `quoteRequests CallVisitQuoteRequest[]`
- [ ] This allows linking guest quote → user account → quote request

**Output**: Guest quotes can be linked to user accounts

---

### Step 3: Create Migration
**Apply schema changes to database**

**Tasks**:
- [ ] Review complete schema one more time
- [ ] Run: `npx prisma migrate dev --name add_quote_request_models`
- [ ] Run: `npx prisma generate`
- [ ] Verify tables created in database
- [ ] Test: Create a quote request manually in Prisma Studio

**Output**: Quote request tables in database

---

### Step 4: Document & Commit
**Save your work**

**Tasks**:
- [ ] Create `DOC/feature-quote-models-implementation.md`
- [ ] Document table structure and relationships
- [ ] Commit: `feat: add quote request database models`
- [ ] Mark Feature 2 as ✅ Complete

**Output**: Feature documented and committed

---

## Success Criteria
Feature 2 is complete when:
- ✅ CallVisitQuoteRequest and WrittenQuoteRequest tables exist
- ✅ Relationships to User and GuestInstantQuote are working
- ✅ LeadStatus enum is defined
- ✅ Migration applied successfully
- ✅ Code is committed

---

# Feature 3: Homeowner Quote Request Flow

**Priority**: 🟠 HIGH  
**Status**: ⏸️ Blocked by Features 1 & 2  
**Depends On**: Authentication + Database models

## Why This Feature Third?
After authentication and database models are ready, homeowners need to actually request quotes from installers. This connects the instant quote flow to real quote requests.

---

## Audit Before Building

**Tasks**:
- [ ] Audit: Check `NewQuoteRequestModal.tsx` component behavior
- [ ] Audit: Review `InstantQuoteForm.tsx` to see where the modal triggers
- [ ] Audit: Understand current flow: Guest generates quote → What happens next?

---

## Implementation Steps

### Step 1: Create Quote Request APIs
**Build backend endpoints to create quote requests**

**Tasks**:
- [ ] Create `POST /api/quote-requests/call-visit` endpoint
  - Accept: userId, guestQuoteId, additional details
  - Create CallVisitQuoteRequest in database
  - Set status to "NEW"
  - Return created request
- [ ] Create `POST /api/quote-requests/written` endpoint (similar)
- [ ] Test with Postman: Create request → Verify in database

**Output**: APIs for creating quote requests

---

### Step 2: Connect NewQuoteRequestModal to API
**Make the modal actually create quote requests**

**Tasks**:
- [ ] Audit: Open `NewQuoteRequestModal.tsx` and find submit handler
- [ ] Add logic: After quote calculated → Show "Request Quote" button
- [ ] On button click: Check if user is logged in
  - If not logged in → Show auth modal (signup/login)
  - If logged in → Call quote request API
- [ ] Handle success: Show success message, redirect to homeowner dashboard
- [ ] Handle errors: Show error messages

**Output**: Homeowner can request quotes from the modal

---

### Step 3: Post-Auth Auto-Request
**After signup, automatically create the quote request**

**Tasks**:
- [ ] Store quote type and guest quote ID in session/state when user clicks "Request Quote"
- [ ] After successful signup/login, check if pending quote request exists
- [ ] Automatically create the quote request
- [ ] Redirect to homeowner dashboard with success message

**Output**: Seamless flow from guest to homeowner with quote request

---

### Step 4: Build Homeowner Dashboard Quote List
**Show quote requests in homeowner dashboard**

**Tasks**:
- [ ] Audit: Check existing homeowner dashboard structure
- [ ] Create `GET /api/quote-requests/my-requests` endpoint
  - Fetch all quote requests for current user
  - Include related GuestInstantQuote data
  - Sort by date (newest first)
- [ ] Update homeowner dashboard to fetch and display requests
- [ ] Show: Date, Type (Call/Visit or Written), Status, Actions
- [ ] Add "View Details" button for each request

**Output**: Homeowner can see all their quote requests

---

### Step 5: Test & Document
**Validate the complete flow**

**Tasks**:
- [ ] Test: Generate instant quote → Request quote → Sign up → Request created
- [ ] Test: Login as homeowner → See quote requests in dashboard
- [ ] Test: Create multiple quote requests → All appear in dashboard
- [ ] Document in `DOC/feature-quote-request-flow.md`
- [ ] Commit: `feat: homeowner quote request flow`

**Output**: Feature complete and documented

---

## Success Criteria
Feature 3 is complete when:
- ✅ Homeowners can request Call/Visit quotes
- ✅ Homeowners can request Written quotes
- ✅ Quote requests are created in database
- ✅ Homeowner dashboard displays all quote requests
- ✅ Complete flow works: Guest → Signup → Request → Dashboard
- ✅ Code is committed

---

# Feature 4: Installer Lead Feed & Purchase

**Priority**: 🟠 HIGH  
**Status**: ⏸️ Blocked by Feature 3  
**Depends On**: Quote requests must exist first

## Why This Feature Fourth?
Once homeowners can request quotes, installers need to see those requests as "leads" they can purchase and work on.

---

## Audit Before Building

**Tasks**:
- [ ] Audit: Check `InstallerLeadFeed.tsx` component (already exists, 806 lines)
- [ ] Audit: Understand how mock leads are displayed
- [ ] Audit: Review lead unlock modal and purchase flow (UI is ready)

**What We Know**:
- ✅ `InstallerLeadFeed` component fully built (mock data)
- ✅ Lead card UI ready
- ✅ Unlock modal ready (Stripe payment UI)
- ✅ Need to connect to real data

---

## Implementation Steps

### Step 1: Create Lead Feed API
**Build API to fetch available quote requests**

**Tasks**:
- [ ] Create `GET /api/leads/feed` endpoint
  - Fetch CallVisitQuoteRequest and WrittenQuoteRequest where status = "NEW"
  - Filter by installer's service areas (location matching)
  - Don't show leads already purchased by this installer
  - Include preview info: Location, System size, Budget, Type
  - Hide contact info (not purchased yet)
- [ ] Test: Fetch leads → Verify only NEW leads shown

**Output**: Lead feed API working

---

### Step 2: Connect InstallerLeadFeed to Real Data
**Replace mock data with real API calls**

**Tasks**:
- [ ] Audit: Find where `InstallerLeadFeed` uses mock data
- [ ] Replace with API call to `/api/leads/feed`
- [ ] Map API response to component's Lead type
- [ ] Test: Load feed → See real quote requests as leads

**Output**: Installer sees real leads in feed

---

### Step 3: Build Lead Purchase API
**Create API to purchase/unlock leads**

**Tasks**:
- [ ] Create `POST /api/leads/:id/unlock` endpoint
  - Check installer has enough credits (future: Stripe integration)
  - Update lead status to "PENDING"
  - Set `purchasedBy` to installer ID
  - Set `purchasedAt` timestamp
  - Return full lead details (including contact info)
- [ ] Test: Purchase lead → Verify status updated, contact info returned

**Output**: Lead purchase API working

---

### Step 4: Connect Purchase Flow in Component
**Make the unlock button actually purchase leads**

**Tasks**:
- [ ] Audit: Find unlock button click handler in `InstallerLeadFeed`
- [ ] Connect to `POST /api/leads/:id/unlock` API
- [ ] Handle success: Show full lead details with contact info
- [ ] Handle errors: Insufficient credits, lead already purchased, etc.
- [ ] Update lead card to show "Unlocked" state

**Output**: Installer can purchase leads

---

### Step 5: Build Purchased Leads Page
**Show all purchased leads in installer dashboard**

**Tasks**:
- [ ] Create `GET /api/leads/my-purchases` endpoint
  - Fetch all leads purchased by current installer
  - Include full details and contact info
- [ ] Create purchased leads page in installer dashboard
- [ ] Show: Homeowner contact, quote details, status
- [ ] Add action buttons: Update status, Add comment

**Output**: Installer can view all purchased leads

---

### Step 6: Test & Document
**Validate the complete flow**

**Tasks**:
- [ ] Test: Login as installer → See leads → Purchase lead → See full details
- [ ] Test: Check purchased leads page → Lead appears there
- [ ] Test: Homeowner creates request → Appears in installer feed immediately
- [ ] Document in `DOC/feature-installer-leads.md`
- [ ] Commit: `feat: installer lead feed and purchase system`

**Output**: Feature complete and documented

---

## Success Criteria
Feature 4 is complete when:
- ✅ Installers can see available leads in feed
- ✅ Installers can purchase/unlock leads
- ✅ After purchase, full contact info is revealed
- ✅ Purchased leads appear in dedicated page
- ✅ Lead status updates after purchase
- ✅ Code is committed

---

# Feature 5: Admin Lead Management Dashboard

**Priority**: 🟡 MEDIUM  
**Status**: ⏸️ Blocked by Features 1-4  
**Depends On**: Auth, quote requests, and lead purchases working

## Why This Feature Fifth?
Admins need to monitor all quote requests and lead activity across the platform.

---

## Audit Before Building

**Tasks**:
- [ ] Audit: Check existing `/admin/instant-quotes` page
- [ ] Audit: Understand current admin dashboard structure
- [ ] Audit: Review what data admins need to see

---

## Implementation Steps

### Step 1: Create Admin Leads API
**Build API to fetch all leads for admin**

**Tasks**:
- [ ] Create `GET /api/admin/leads` endpoint
  - Fetch all CallVisitQuoteRequest and WrittenQuoteRequest
  - Include homeowner info, installer info (if purchased)
  - Support filtering by status, type, date
  - Support pagination
  - Return summary stats (total, by status, conversion rate)
- [ ] Add authentication check: Only admin role can access
- [ ] Test: Fetch as admin → Success; Fetch as homeowner → 403 Forbidden

**Output**: Admin leads API working

---

### Step 2: Build Admin Leads Page
**Create UI for admin to view and manage leads**

**Tasks**:
- [ ] Create `/admin/leads` page
- [ ] Display summary stats at top (cards)
- [ ] Show table of all leads with filters
- [ ] Add "View Details" modal
- [ ] Add status update controls
- [ ] Add admin notes field

**Output**: Admin can view and manage all leads

---

### Step 3: Test & Document
**Validate admin functionality**

**Tasks**:
- [ ] Test: Login as admin → View leads → Filter/sort → Update status
- [ ] Test: Check all role permissions work correctly
- [ ] Document in `DOC/feature-admin-leads.md`
- [ ] Commit: `feat: admin lead management dashboard`

**Output**: Feature complete and documented

---

## Success Criteria
Feature 5 is complete when:
- ✅ Admin can view all quote requests across platform
- ✅ Admin can filter and search leads
- ✅ Admin can update lead status
- ✅ Admin can add notes to leads
- ✅ Summary statistics display correctly
- ✅ Code is committed

---

# Feature 6: Lead Status Updates & Sync

**Priority**: 🟡 MEDIUM  
**Status**: ⏸️ Blocked by Features 1-5  

## Why This Feature Sixth?
Status updates need to sync across homeowner, installer, and admin dashboards in real-time.

---

## Implementation Steps

### Step 1: Create Status Update API
**Build API for updating lead status**

**Tasks**:
- [ ] Create `PATCH /api/leads/:id/status` endpoint
  - Allow installer or admin to update status
  - Validate status transitions (NEW → PENDING → IN_PROGRESS → DEAL_CLOSED)
  - Track status change history
  - Return updated lead
- [ ] Test: Update status → Verify in database

**Output**: Status update API working

---

### Step 2: Add Status History Tracking
**Track all status changes over time**

**Tasks**:
- [ ] Add `statusHistory` JSON field to quote request models
- [ ] Or create separate `LeadStatusHistory` table
- [ ] Log: old status, new status, changed by (user ID), timestamp
- [ ] Display history in lead details modal

**Output**: Status changes are tracked

---

### Step 3: Sync Across Dashboards
**Ensure status updates reflect everywhere**

**Tasks**:
- [ ] Update homeowner dashboard to refetch when status changes
- [ ] Update installer purchased leads page to show current status
- [ ] Update admin leads table to reflect changes
- [ ] Add real-time updates (optional: WebSocket or polling)

**Output**: Status changes visible everywhere

---

### Step 4: Test & Document
**Validate synchronization**

**Tasks**:
- [ ] Test: Installer updates status → Check homeowner dashboard → Status updated
- [ ] Test: Admin updates status → Check both homeowner and installer views → Updated
- [ ] Document in `DOC/feature-status-sync.md`
- [ ] Commit: `feat: lead status updates and synchronization`

**Output**: Feature complete and documented

---

## Success Criteria
Feature 6 is complete when:
- ✅ Status can be updated by installer or admin
- ✅ Status changes sync across all dashboards
- ✅ Status history is tracked
- ✅ Invalid status transitions are blocked
- ✅ Code is committed

---

# Feature 7: Installer Feedback & Comments

**Priority**: 🟢 LOW  
**Status**: ⏸️ Blocked by Features 1-6  

## Why This Feature Seventh?
Installers should be able to rate lead quality and leave feedback for admins to improve the system.

---

## Implementation Steps

### Step 1: Create Comment/Rating Model
**Add database table for installer feedback**

**Tasks**:
- [ ] Add `InstallerComment` model to schema
  - id, installerId, leadId, rating (1-5), comment, createdAt
- [ ] Run migration
- [ ] Test: Create comment manually in Prisma Studio

**Output**: Comment model in database

---

### Step 2: Build Feedback API
**Create endpoints for submitting feedback**

**Tasks**:
- [ ] Create `POST /api/leads/:id/feedback` endpoint
  - Accept rating and comment
  - Only allow installer who purchased the lead
  - Save to database
- [ ] Create `GET /api/admin/lead-feedback` endpoint
  - Fetch all feedback for admin review
  - Only accessible by admin

**Output**: Feedback API working

---

### Step 3: Add UI for Feedback
**Add feedback form to installer purchased leads page**

**Tasks**:
- [ ] Add rating selector (1-5 stars) and comment box
- [ ] Add submit button
- [ ] Connect to feedback API
- [ ] Show success message after submission

**Output**: Installer can submit feedback

---

### Step 4: Display Feedback in Admin Dashboard
**Show feedback in admin lead details**

**Tasks**:
- [ ] Update admin lead details modal
- [ ] Display installer rating and comments
- [ ] Show feedback history for each lead

**Output**: Admin can see all installer feedback

---

### Step 5: Test & Document
**Validate feedback system**

**Tasks**:
- [ ] Test: Installer submits feedback → Verify saved
- [ ] Test: Admin views feedback → See all comments
- [ ] Document in `DOC/feature-installer-feedback.md`
- [ ] Commit: `feat: installer feedback and rating system`

**Output**: Feature complete and documented

---

## Success Criteria
Feature 7 is complete when:
- ✅ Installers can rate and comment on leads
- ✅ Feedback is saved to database
- ✅ Admin can view all feedback
- ✅ Only installer who purchased can leave feedback
- ✅ Code is committed

---

# Feature 8: Email Notifications (Optional)

**Priority**: 🟢 LOW  
**Status**: Optional enhancement

## Implementation Steps

### Step 1: Set Up Email Service
**Configure email provider**

**Tasks**:
- [ ] Choose provider (SendGrid, Resend, etc.)
- [ ] Set up API keys
- [ ] Create email templates

---

### Step 2: Add Notification Triggers
**Send emails for key events**

**Tasks**:
- [ ] Email homeowner when quote request created
- [ ] Email installer when lead is purchased
- [ ] Email homeowner when installer updates status
- [ ] Email admin for important events

---

### Step 3: Test & Document
**Validate email system**

**Tasks**:
- [ ] Test all notification triggers
- [ ] Document in `DOC/feature-email-notifications.md`
- [ ] Commit: `feat: email notification system`

---

# Final Steps: Testing & Deployment

## Pre-Deployment Checklist

**Tasks**:
- [ ] Test all features end-to-end
- [ ] Check mobile responsiveness
- [ ] Verify dark mode works
- [ ] Security audit (auth, permissions)
- [ ] Performance check (API response times)
- [ ] Environment variables documented
- [ ] Database migration plan ready

---

## Deployment

**Tasks**:
- [ ] Deploy to staging → Test
- [ ] Deploy to production
- [ ] Set up monitoring (errors, analytics)
- [ ] Verify all features work in production

---

# 📊 Progress Tracking

## Features Completed:
- [ ] Feature 1: User Authentication System
- [ ] Feature 2: Database Models for Quote Requests
- [ ] Feature 3: Homeowner Quote Request Flow
- [ ] Feature 4: Installer Lead Feed & Purchase
- [ ] Feature 5: Admin Lead Management Dashboard
- [ ] Feature 6: Lead Status Updates & Sync
- [ ] Feature 7: Installer Feedback & Comments
- [ ] Feature 8: Email Notifications (Optional)

---

## Current Sprint:
**Feature**: Feature 1 - User Authentication System  
**Started**: October 12, 2025  
**Status**: 🟡 In Progress (Steps 1-6 Complete - 60% Done!)

**Tasks Completed This Sprint**:
- ✅ Step 1: Designed User database model with roles (GUEST, HOMEOWNER, INSTALLER, ADMIN)
- ✅ Step 2: Installed and configured NextAuth.js with Credentials and Google providers
- ✅ Step 3: Created database migration `add_user_authentication` - User, Account, Session tables created
- ✅ Step 4: Built Registration APIs for homeowners and installers with validation
- ✅ Step 5: Connected signup modals to real APIs - Users can now create accounts!
- ✅ Step 6: Connected signin modals to NextAuth - Password verification now working!

**Tasks In Progress**:
- 🟡 Step 7: Protect Routes with Middleware (prevent unauthorized dashboard access)

**Issues Found & Fixed**:
- 🚨 **CRITICAL BUG 1**: Login was accepting ANY password (mock API still in use)
  - ✅ **FIXED**: Both signin modals now use NextAuth signIn() with proper password verification
  
- 🚨 **CRITICAL BUG 2**: Role-based redirects broken, using localStorage instead of NextAuth
  - ✅ **FIXED**: Replaced localStorage with NextAuth useSession() hook
  - ✅ **FIXED**: Installers now redirect to /installer/dashboard (not homeowner)
  - ✅ **FIXED**: Logout now uses signOut() properly
  - ✅ **FIXED**: Wrapped app in SessionProvider

**Commits This Sprint**:
- 8342c5f - docs: restructure execution plan to iterative feature-based approach

**API Endpoints Created**:
- POST /api/auth/register/homeowner - Creates homeowner accounts
- POST /api/auth/register/installer - Creates installer accounts with business details

**UI Components Updated**:
- HomeownerSignupModal.tsx - Now creates real accounts with error/success handling
- InstallerSignupModal.tsx - Now creates real accounts with validation

---

# 🚨 Important Reminders

1. **Audit before building** - Always check current state for that specific feature
2. **Test immediately** - Don't accumulate untested code
3. **Commit working code** - Save progress after each step
4. **Document decisions** - Record what you did and why, not future plans
5. **One feature at a time** - Finish completely before moving to next
6. **Security first** - Always validate authentication and permissions
7. **Mobile-first** - Test on mobile as you build
8. **Reuse patterns** - Follow existing code style

---

**Let's build this iteratively, one feature at a time! 🚀**
