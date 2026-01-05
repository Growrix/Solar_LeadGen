# User Flow Diagrams - Lead Generation System

**Last Updated**: November 15, 2025  
**Covers**: Guest, Homeowner (First & Second+ Quotes), Admin Flows  

---

## 🎯 Flow Index

1. [Guest User Flow](#1-guest-user-flow-unauthenticated)
2. [Homeowner First Quote Flow](#2-homeowner-first-quote-flow-authenticated)
3. [Homeowner Second+ Quote Flow](#3-homeowner-second-quote-flow-with-verification)
4. [Admin Approval Flow](#4-admin-approval-flow)
5. [Phone Verification Sub-Flow](#5-phone-verification-sub-flow)
6. [Data Storage Patterns](#6-data-storage-patterns)

---

## 1. Guest User Flow (Unauthenticated)

### Complete Journey: Homepage → Registration → First Lead

```
┌─────────────────────────────────────────────────────────────┐
│                    GUEST USER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

[1] Guest visits homepage
    │
    ↓
[2] Sees Hero section with "Get Instant Quote" CTA
    │
    ↓
[3] Clicks "Get Instant Quote"
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  INSTANT QUOTE FORM (Multi-step, 8 steps)            │
│  ---------------------------------------------------- │
│  Step 1: Quote Type (Residential/Commercial)         │
│  Step 2: Location (Postcode, auto-fill city/state)  │
│  Step 3: Energy Usage (Monthly/Quarterly bill)      │
│  Step 4: Roof Details (Type, orientation, tilt)     │
│  Step 5: Budget & System Size                        │
│  Step 6: Battery Options (Optional)                  │
│  Step 7: Advanced Options (Optional)                 │
│  Step 8: Calculate & View Results                    │
└───────────────────────────────────────────────────────┘
    │
    ↓
[4] Form calculates solar quote
    │  - System size recommendation (kW)
    │  - Annual savings ($)
    │  - Payback period (years)
    │  - Final price after rebates ($)
    │
    ↓
[5] API Call: POST /api/instant-quote
    │  - Saves anonymous quote to database
    │  - Table: GuestInstantQuote
    │  - Includes: all inputs + results + sessionId
    │
    ↓
[6] Results displayed on screen
    │  - "Your 6.6kW system will save you $1,250/year"
    │  - "Payback in 4.2 years"
    │  - "Final price: $5,000 after rebates"
    │
    ↓
[7] Call-to-Action appears
    │  - "Request Quote from Installers" button
    │  - "View Detailed Breakdown" link
    │
    ↓
[8] User clicks "Request Quote"
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  QUOTE OPTIONS MODAL                                  │
│  ---------------------------------------------------- │
│  "How would you like installers to contact you?"    │
│                                                       │
│  [●] Call/Visit - Installer contacts you directly   │
│  [ ] Written Quote - Get detailed written proposal  │
│                                                       │
│  [Continue →]                                        │
└───────────────────────────────────────────────────────┘
    │
    ↓
[9] User selects quote type and clicks Continue
    │
    ↓
[10] System stores pending quote data
     │  - State: pendingQuoteData = { ...quoteInputs, results }
     │  - State: selectedQuoteType = "CALL_VISIT" or "WRITTEN_QUOTE"
     │
     ↓
┌───────────────────────────────────────────────────────┐
│  HOMEOWNERS INFO FORM                                 │
│  ---------------------------------------------------- │
│  "Before we connect you with installers..."          │
│                                                       │
│  Name:     [________________]                        │
│  Phone:    [________________] (E.164 format)         │
│  Address:  [________________]                        │
│                                                       │
│  [Continue →]                                        │
└───────────────────────────────────────────────────────┘
     │
     ↓
[11] User fills in name, phone, address
     │  - Validates phone: E.164 format (+61...)
     │  - Validates all fields required
     │
     ↓
[12] Click Continue → stores info
     │  - State: homeownerInfo = { name, phone, address }
     │
     ↓
┌───────────────────────────────────────────────────────┐
│  HOMEOWNER SIGNUP MODAL                               │
│  ---------------------------------------------------- │
│  "Create your account"                                │
│                                                       │
│  Full Name: [________________]                        │
│  Email:     [________________]                        │
│  Password:  [________________] [👁]                  │
│                                                       │
│  [Sign Up] [Already have account? Sign In]          │
└───────────────────────────────────────────────────────┘
     │
     ↓
[13] User fills registration form
     │
     ↓
[14] API Call: POST /api/auth/register
     │  - Creates User record
     │  - Role: HOMEOWNER
     │  - leadSubmissionCount: 0
     │  - phoneVerified: false
     │
     ↓
[15] User record created successfully
     │  - Returns user ID
     │  - NextAuth session initialized
     │
     ↓
[16] ⚠️ SESSION POLLING (Phase 4.10 fix)
     │  - Wait for NextAuth session to be fully ready
     │  - Poll /api/auth/session every 200ms
     │  - Max 25 attempts (5 seconds)
     │  - Ensures session.user.id available
     │
     ↓
[17] Session ready! Now create lead
     │
     ↓
[18] API Call: POST /api/leads
     │  Request body:
     │  {
     │    quoteType: "CALL_VISIT",           // From step 9
     │    propertyPostcode: "2000",          // From instant quote
     │    location: "Sydney",                // From instant quote
     │    state: "NSW",                      // From instant quote
     │    energyBill: 400,                   // From instant quote
     │    quoteData: { ...pendingQuoteData }, // Complete instant quote
     │    propertyAddress: "123 Solar St",  // From step 11
     │    name: "John Smith",               // From step 11
     │    phoneNumber: "+61412345678"       // From step 11
     │  }
     │
     ↓
[19] Service: createLead() processes request
     │  ├─ Check quota: 0 < 5 ✓
     │  ├─ Check verification: count=0, not required ✓
     │  ├─ Create lead record
     │  ├─ Status: PENDING_APPROVAL
     │  ├─ Visibility: HIDDEN
     │  ├─ Increment: leadSubmissionCount = 1
     │  └─ Create audit log
     │
     ↓
[20] Lead created successfully!
     │  - Lead ID generated
     │  - Status: PENDING_APPROVAL
     │  - Awaiting admin review
     │
     ↓
┌───────────────────────────────────────────────────────┐
│  QUOTE SUCCESS MODAL                                  │
│  ---------------------------------------------------- │
│  ✓ "Quote Request Submitted!"                         │
│                                                       │
│  Your request has been sent to verified installers.  │
│  You'll hear from them within 24-48 hours.          │
│                                                       │
│  Lead Status: Pending Approval                       │
│  Quote Type: Call/Visit                              │
│                                                       │
│  [Go to Dashboard]                                   │
└───────────────────────────────────────────────────────┘
     │
     ↓
[21] User clicks "Go to Dashboard"
     │
     ↓
[22] Redirect: /homeowner/dashboard
     │
     ↓
[23] Dashboard loads
     │  - Shows: "1 Active Lead"
     │  - Shows: "4 quotes remaining (1/5 used)"
     │  - Shows: Lead card with status "Pending Approval"
     │
     ↓
[24] ✅ GUEST FLOW COMPLETE

┌─────────────────────────────────────────────────────────┐
│  DATA STORED AT END OF FLOW                             │
│  ------------------------------------------------------ │
│  ✓ User record (email, name, role=HOMEOWNER)           │
│  ✓ Lead record (status=PENDING_APPROVAL, quoteData)    │
│  ✓ GuestInstantQuote record (analytics)                │
│  ✓ Audit log (LEAD_CREATED action)                     │
│  ✓ Session (NextAuth)                                   │
│                                                          │
│  User.leadSubmissionCount = 1                           │
│  User.phoneVerified = false                             │
└─────────────────────────────────────────────────────────┘
```

### Critical Points

✅ **What Works**:
- Instant quote calculation
- Anonymous data capture
- Registration flow
- Lead creation
- Dashboard visibility

⚠️ **Known Issues**:
- **Session timing**: Fixed in Phase 4.10 with polling, needs validation
- **Data persistence**: GuestInstantQuote separate from Lead (by design)

---

## 2. Homeowner First Quote Flow (Authenticated)

### Authenticated User, Zero Previous Leads

```
┌─────────────────────────────────────────────────────────────┐
│     AUTHENTICATED HOMEOWNER - FIRST QUOTE (POST-LOGIN)      │
└─────────────────────────────────────────────────────────────┘

[1] User already logged in
    │  - Session exists
    │  - Role: HOMEOWNER
    │  - leadSubmissionCount: 0
    │
    ↓
[2] User on homeowner dashboard
    │  - Sees: "Get Started with Solar" section
    │  - Sees: "0 Active Leads"
    │  - Sees: "5 quotes available"
    │
    ↓
[3] Clicks "GET STARTED" button
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  NEW QUOTE REQUEST MODAL                              │
│  ---------------------------------------------------- │
│  Contains: InstantQuoteForm (same 8-step form)      │
│  Same flow as guest experience                        │
└───────────────────────────────────────────────────────┘
    │
    ↓
[4] User fills out instant quote form
    │  - All 8 steps
    │  - Calculates results
    │
    ↓
[5] Results displayed in modal
    │  - System size, savings, price, etc.
    │
    ↓
[6] Clicks "Request Quote from Installers"
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  QUOTE OPTIONS MODAL                                  │
│  (Same as guest flow)                                 │
└───────────────────────────────────────────────────────┘
    │
    ↓
[7] Selects quote type (CALL_VISIT or WRITTEN_QUOTE)
    │
    ↓
[8] ⚠️ CRITICAL GAP: DetailedInformationModal SHOULD open
    │  
    │  🔴 CURRENT BEHAVIOR (BROKEN):
    │  ├─ Modal doesn't open
    │  ├─ Lead submitted immediately
    │  └─ Missing: name, phone, address
    │  
    │  ✅ EXPECTED BEHAVIOR (Phase 12 spec):
    │  └─ DetailedInformationModal opens
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  ⚠️ MISSING STEP - DetailedInformationModal          │
│  ---------------------------------------------------- │
│  "We need a few more details..."                      │
│                                                       │
│  Full Name:    [________________]                     │
│  Phone Number: [________________] (E.164)            │
│  Property Address: [________________]                 │
│                                                       │
│  [Submit Quote Request]                              │
└───────────────────────────────────────────────────────┘
    │
    ↓
[9] ⚠️ Currently skipped, should collect:
    │  - name
    │  - phoneNumber (E.164 format)
    │  - address
    │
    ↓
[10] API Call: POST /api/leads
     │  ⚠️ Current: Missing user details
     │  ✅ Should include: name, phoneNumber, address
     │
     ↓
[11] Lead created
     │  - Status: PENDING_APPROVAL
     │  - Visibility: HIDDEN
     │  - leadSubmissionCount: 0 → 1
     │
     ↓
[12] Success feedback
     │  - Toast notification or modal
     │  - "Quote request submitted"
     │
     ↓
[13] Dashboard updates
     │  - Shows: "1 Active Lead"
     │  - Shows: "4 quotes remaining (1/5)"
     │  - Lead card appears with status
     │
     ↓
[14] ✅ FLOW COMPLETE (but with missing data)

┌─────────────────────────────────────────────────────────┐
│  🔴 PHASE 12 ISSUE                                      │
│  ------------------------------------------------------ │
│  DetailedInformationModal exists but is NOT connected  │
│  to the first-quote flow. Result: Leads are created    │
│  without name/phone/address fields.                     │
│                                                          │
│  Fix Required:                                           │
│  1. Open DetailedInformationModal after step 7          │
│  2. Collect user details                                 │
│  3. Pass to POST /api/leads                             │
│  4. API stores in Lead.name, Lead.phoneNumber, etc.     │
│                                                          │
│  Status: Documented in Phase 12 spec, not implemented   │
└─────────────────────────────────────────────────────────┘
```

### What Should Happen (Phase 12 Fix)

After step 7 (select quote type):
```
[7] Select quote type
    ↓
[8] DetailedInformationModal opens ← NEW
    ↓
[9] User enters: name, phone, address
    ↓
[10] Validate inputs (especially E.164 phone)
     ↓
[11] API Call: POST /api/leads
     Body includes: { name, phoneNumber, address, ...quoteData }
     ↓
[12] Lead created WITH complete user details
     ↓
[13] Installers receive actionable leads ✓
```

---

## 3. Homeowner Second+ Quote Flow (with Verification)

### Returning User Requesting Additional Quotes

```
┌─────────────────────────────────────────────────────────────┐
│     HOMEOWNER - SECOND+ QUOTE (COUNT >= 1)                  │
└─────────────────────────────────────────────────────────────┘

[1] User on dashboard
    │  - leadSubmissionCount: 1-4
    │  - Has previous lead(s)
    │
    ↓
[2] Sees "Request More Quotes" button
    │
    ↓
[3] Clicks "Request More Quotes"
    │
    ↓
[4] Check: leadSubmissionCount >= 2 AND !phoneVerified?
    │
    ├─ YES → Go to [5] (Verification Required)
    │
    └─ NO → Go to [13] (Skip Verification)

┌───────────────────────────────────────────────────────────────┐
│  VERIFICATION BRANCH (count >= 2, not verified)               │
└───────────────────────────────────────────────────────────────┘

[5] Show verification notice
    │  "To submit more quotes, please verify your phone number"
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  PHONE VERIFICATION MODAL                             │
│  ---------------------------------------------------- │
│  "Verify Your Phone Number"                           │
│                                                       │
│  We'll send a 6-digit code to verify your identity.  │
│                                                       │
│  Phone: [+61 4__ ___ ___] (Pre-filled from profile) │
│                                                       │
│  [Send Code]                                         │
└───────────────────────────────────────────────────────┘
    │
    ↓
[6] User clicks "Send Code"
    │
    ↓
[7] API Call: POST /api/verification/send-otp
    │  Body: { phoneNumber: "+61412345678" }
    │
    ↓
[8] Service: phoneVerificationService.sendOTP()
    │  ├─ Check rate limit (3 per 15 min)
    │  ├─ Generate 6-digit code
    │  ├─ Create PhoneVerification record
    │  │  - status: PENDING
    │  │  - expiresAt: now() + 15 minutes
    │  ├─ Send SMS via Twilio
    │  └─ Return verification ID
    │
    ↓
[9] SMS sent successfully
    │  - User receives: "Your verification code is: 123456"
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  OTP INPUT MODAL                                      │
│  ---------------------------------------------------- │
│  "Enter Verification Code"                            │
│                                                       │
│  We sent a 6-digit code to +61 412 *** 678          │
│                                                       │
│  Code: [_] [_] [_] [_] [_] [_]                      │
│                                                       │
│  Expires in: 14:32                                   │
│                                                       │
│  [Verify]  [Resend Code]                            │
└───────────────────────────────────────────────────────┘
    │
    ↓
[10] User enters 6-digit code
     │
     ↓
[11] API Call: POST /api/verification/verify-otp
     │  Body: { phoneNumber: "+61412345678", code: "123456" }
     │
     ↓
[12] Service: phoneVerificationService.verifyOTP()
     │  ├─ Find PhoneVerification record
     │  ├─ Check: expiresAt > now() ✓
     │  ├─ Check: attempts < 3 ✓
     │  ├─ Validate: code === "123456" ✓
     │  ├─ Update: status = VERIFIED
     │  ├─ Update: User.phoneVerified = true
     │  └─ Return success
     │
     ↓
     ✓ Phone verified!
     │
     ↓
     Continue to [13] ↓

┌───────────────────────────────────────────────────────────────┐
│  QUOTE SUBMISSION BRANCH (verified or count < 2)              │
└───────────────────────────────────────────────────────────────┘

[13] Open SimplifiedQuoteFormModal
     │
     ↓
┌───────────────────────────────────────────────────────┐
│  SIMPLIFIED QUOTE FORM MODAL                          │
│  ---------------------------------------------------- │
│  "Request More Quotes"                                │
│                                                       │
│  ✓ Pre-filled with previous quote data               │
│  - Location: Sydney, NSW 2000                        │
│  - Energy Bill: $400/month                           │
│  - Roof Type: Tile                                   │
│  - System Size: 6.6kW                                │
│  - Battery: Not included                             │
│                                                       │
│  User can edit any field and recalculate             │
│                                                       │
│  [Calculate] [Submit Quote Request]                  │
└───────────────────────────────────────────────────────┘
     │
     ↓
[14] User reviews/edits pre-filled data
     │  - Can change any field
     │  - Click Calculate to update results
     │
     ↓
[15] User clicks "Submit Quote Request"
     │
     ↓
[16] Open QuoteTypeDistributionModal (if Phase 4.9.6 complete)
     │  OR select quote type inline
     │
     ↓
[17] API Call: POST /api/leads
     │  Body: { quoteType, ...quoteData }
     │
     ↓
[18] Service: createLead()
     │  ├─ Check quota: count < limit ✓
     │  ├─ Check verification: verified ✓
     │  ├─ Create lead
     │  ├─ Increment: leadSubmissionCount += 1
     │  └─ Return success
     │
     ↓
[19] Success!
     │  - Toast: "Quote request submitted"
     │  - Dashboard updates
     │  - Counter: 2/5 → 3/5
     │
     ↓
[20] ✅ SECOND+ QUOTE FLOW COMPLETE

┌─────────────────────────────────────────────────────────┐
│  QUOTA TRACKING                                          │
│  ------------------------------------------------------ │
│  After each lead submission:                             │
│  - leadSubmissionCount increments                        │
│  - UI shows: "X/5 quotes used"                          │
│  - When count = 5: "Request More" button disabled       │
│                                                          │
│  Special: BIDDING quotes                                 │
│  - Separate counter: biddingLeadsSubmitted              │
│  - Max 1 BIDDING per user                               │
│  - Enforced independently of main quota                  │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Admin Approval Flow

### Admin Reviews and Approves/Rejects Leads

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN APPROVAL FLOW                       │
└─────────────────────────────────────────────────────────────┘

[1] New lead created by homeowner
    │  - Status: PENDING_APPROVAL
    │  - Visibility: HIDDEN
    │
    ↓
[2] Admin receives notification
    │  - Email: "New lead submitted"
    │  - Dashboard badge: "3 pending"
    │
    ↓
[3] Admin logs into dashboard
    │  - Role: ADMIN
    │  - Navigate to "Lead Management"
    │
    ↓
[4] Sees pending leads list
    │
┌───────────────────────────────────────────────────────┐
│  PENDING LEADS TABLE                                  │
│  ---------------------------------------------------- │
│  ID    | Location     | Type        | Submitted      │
│  ------|--------------|-------------|--------------- │
│  L-001 | Sydney, NSW  | Call/Visit  | 2 hours ago   │
│  L-002 | Melbourne    | Written     | 1 day ago     │
│  L-003 | Brisbane     | Bidding     | 3 hours ago   │
│                                                       │
│  [View] [Approve] [Reject] per row                   │
└───────────────────────────────────────────────────────┘
    │
    ↓
[5] Admin clicks "View" on lead L-001
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  LEAD DETAILS MODAL                                   │
│  ---------------------------------------------------- │
│  Lead ID: L-001                                       │
│  Status: Pending Approval                             │
│                                                       │
│  Homeowner:                                           │
│  - Name: John Smith                                   │
│  - Email: john@email.com                             │
│  - Phone: +61 412 345 678                            │
│  - Address: 123 Solar St, Sydney NSW 2000           │
│                                                       │
│  Quote Details:                                       │
│  - Type: Call/Visit                                  │
│  - Property: Residential, Tile roof                  │
│  - Energy Bill: $400/month                           │
│  - System Size: 6.6kW recommended                    │
│  - Budget: $10,000-$20,000                           │
│                                                       │
│  Instant Quote Data:                                  │
│  - Annual Savings: $1,250                            │
│  - Payback: 4.2 years                                │
│  - Final Price: $5,000 (after rebates)              │
│                                                       │
│  [Approve] [Reject] [Flag for Review]               │
└───────────────────────────────────────────────────────┘
    │
    ↓
[6] Admin clicks "Approve"
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  APPROVAL CONFIGURATION MODAL                         │
│  ---------------------------------------------------- │
│  "Approve Lead L-001"                                 │
│                                                       │
│  Lead Price: [$___50___] (installer pays this)      │
│                                                       │
│  Visibility:                                          │
│  [●] Public - Available to all installers           │
│  [ ] Private - Assign to specific installers        │
│                                                       │
│  Countdown Timer:                                     │
│  [✓] Enable  Duration: [__30__] days                │
│                                                       │
│  Priority:                                            │
│  [ ] Mark as HOT lead                                │
│                                                       │
│  [Approve Lead] [Cancel]                             │
└───────────────────────────────────────────────────────┘
    │
    ↓
[7] Admin configures approval
    │  - Sets price: $50
    │  - Selects: Public
    │  - Enables countdown: 30 days
    │
    ↓
[8] Clicks "Approve Lead"
    │
    ↓
[9] API Call: POST /api/leads/L-001/approve
    │  Body: {
    │    price: 50,
    │    assignTo: "ALL",
    │    enableCountdown: true,
    │    countdownDays: 30
    │  }
    │
    ↓
[10] Service processes approval
     │  ├─ Validate: status allows approval ✓
     │  ├─ Update lead:
     │  │  - status: APPROVED
     │  │  - visibility: PUBLIC
     │  │  - leadPrice: 50
     │  │  - approvedAt: now()
     │  │  - expiresAt: now() + 30 days
     │  │  - moderatedBy: admin.id
     │  ├─ Create audit log
     │  └─ Notify homeowner
     │
     ↓
[11] Lead now APPROVED
     │
     ↓
┌───────────────────────────────────────────────────────┐
│  LEAD STATE AFTER APPROVAL                            │
│  ---------------------------------------------------- │
│  Status: APPROVED                                     │
│  Visibility: PUBLIC                                   │
│  Price: $50                                           │
│  Expires: Nov 15, 2025 (30 days from now)           │
│                                                       │
│  Now visible in:                                      │
│  ✓ Installer marketplace                             │
│  ✓ Homeowner dashboard (approved status)             │
│  ✓ Admin dashboard (approved section)                │
└───────────────────────────────────────────────────────┘
     │
     ↓
[12] Notifications sent
     │  ├─ Homeowner: "Your quote request was approved"
     │  └─ Installers: "New lead available in Sydney"
     │
     ↓
[13] ✅ APPROVAL COMPLETE

┌─────────────────────────────────────────────────────────┐
│  ALTERNATIVE: PRIVATE ASSIGNMENT                         │
│  ------------------------------------------------------ │
│  If admin selects "Private" visibility:                  │
│  1. Opens installer selection modal                      │
│  2. Admin picks 1+ installers                           │
│  3. Lead visibility = PRIVATE                           │
│  4. Creates LeadAssignment records                      │
│  5. Only assigned installers see lead                   │
│  6. Email sent to assigned installers only              │
└─────────────────────────────────────────────────────────┘
```

### Rejection Flow

```
[6] Admin clicks "Reject" instead
    ↓
[7] Rejection reason modal opens
    │  "Why are you rejecting this lead?"
    │  [ ] Incomplete information
    │  [ ] Duplicate request
    │  [ ] Outside service area
    │  [ ] Other: [_____________]
    │
    ↓
[8] Admin selects reason and confirms
    │
    ↓
[9] API Call: POST /api/leads/L-001/reject
    │  Body: { reason: "Incomplete information" }
    │
    ↓
[10] Lead updated:
     │  - status: REJECTED
     │  - flaggedReason: reason
     │  - moderatedBy: admin.id
     │
     ↓
[11] Notification sent to homeowner
     │  "Your quote request needs more information"
     │
     ↓
[12] ⚠️ Note: Quota NOT restored
     │  (Could be enhancement: restore on rejection)
```

---

## 5. Phone Verification Sub-Flow

### Detailed OTP Process

```
┌─────────────────────────────────────────────────────────────┐
│              PHONE VERIFICATION DETAILED FLOW                │
└─────────────────────────────────────────────────────────────┘

TRIGGER: User has submitted 2+ leads and !phoneVerified

[1] User attempts 3rd lead submission
    │
    ↓
[2] API check: leadSubmissionCount >= 2 AND !phoneVerified
    │
    ↓
[3] API returns 403 Forbidden
    │  Body: { requiresVerification: true, message: "..." }
    │
    ↓
[4] Frontend shows verification modal
    │
    ↓
┌───────────────────────────────────────────────────────┐
│  PHONE VERIFICATION MODAL                             │
│  ---------------------------------------------------- │
│  Phone: [+61 4__ ___ ___] ← Pre-filled from User    │
│         [Edit]                                        │
│                                                       │
│  [Send Verification Code]                            │
└───────────────────────────────────────────────────────┘
    │
    ↓
[5] User clicks "Send Verification Code"
    │
    ↓
[6] Frontend validates phone format
    │  - Must be E.164: +[country][number]
    │  - Example: +61412345678
    │
    ↓
[7] API Call: POST /api/verification/send-otp
    │  Headers: { Authorization: "Bearer <session>" }
    │  Body: { phoneNumber: "+61412345678" }
    │
    ↓
[8] API checks rate limit
    │  - Query: PhoneVerification records by IP
    │  - Last 15 minutes
    │  - If count >= 3: return 429 Too Many Requests
    │
    ↓
[9] Generate 6-digit code
    │  - Random: 100000-999999
    │  - Example: "384726"
    │
    ↓
[10] Create PhoneVerification record
     │  - phoneNumber: "+61412345678"
     │  - code: "384726"
     │  - status: "PENDING"
     │  - userId: session.user.id
     │  - attempts: 0
     │  - expiresAt: now() + 15 minutes
     │
     ↓
[11] Send SMS via Twilio
     │  To: +61412345678
     │  Message: "Your Solar Match verification code is: 384726"
     │  API: Twilio REST API
     │
     ↓
[12] API returns success
     │  Response: {
     │    success: true,
     │    verificationId: "vrf_abc123",
     │    expiresAt: "2025-11-15T10:15:00Z",
     │    remainingAttempts: 3
     │  }
     │
     ↓
[13] Frontend shows OTP input
     │
     ↓
┌───────────────────────────────────────────────────────┐
│  OTP INPUT MODAL                                      │
│  ---------------------------------------------------- │
│  Code: [_] [_] [_] [_] [_] [_]                      │
│                                                       │
│  ⏱ Expires in: 14:32                                 │
│  📱 Sent to: +61 412 *** 678                         │
│                                                       │
│  [Verify]  [Didn't receive? Resend]                 │
└───────────────────────────────────────────────────────┘
    │
    ↓
[14] User types code "384726"
     │
     ↓
[15] Clicks "Verify"
     │
     ↓
[16] API Call: POST /api/verification/verify-otp
     │  Body: {
     │    phoneNumber: "+61412345678",
     │    code: "384726"
     │  }
     │
     ↓
[17] API finds PhoneVerification record
     │  WHERE phoneNumber = "+61412345678"
     │    AND userId = session.user.id
     │    AND status = "PENDING"
     │
     ↓
[18] Validate code
     │  ├─ Check: expiresAt > now() ✓
     │  ├─ Check: attempts < 3 ✓
     │  ├─ Check: code === "384726" ✓
     │  └─ All checks pass!
     │
     ↓
[19] Update PhoneVerification
     │  - status: "VERIFIED"
     │  - verifiedAt: now()
     │
     ↓
[20] Update User
     │  - phoneVerified: true
     │
     ↓
[21] Create audit log
     │  - action: "PHONE_VERIFIED"
     │  - userId: session.user.id
     │
     ↓
[22] API returns success
     │  Response: {
     │    success: true,
     │    message: "Phone verified successfully"
     │  }
     │
     ↓
[23] Frontend shows success
     │  ✓ "Phone verified! You can now submit more quotes."
     │
     ↓
[24] Close modal → Return to quote submission flow
     │
     ↓
[25] ✅ VERIFICATION COMPLETE

┌─────────────────────────────────────────────────────────┐
│  ERROR HANDLING                                          │
│  ------------------------------------------------------ │
│  Wrong Code (attempts < 3):                              │
│  - Increment attempts counter                            │
│  - Show error: "Invalid code. X attempts remaining."     │
│  - Allow retry                                           │
│                                                          │
│  Wrong Code (attempts = 3):                              │
│  - Update status: "EXPIRED"                              │
│  - Return 429: "Maximum attempts exceeded"               │
│  - User must request new code (15 min cooldown)         │
│                                                          │
│  Expired Code:                                           │
│  - Return 400: "Code has expired"                        │
│  - User clicks "Resend" to get new code                 │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Data Storage Patterns

### How Different Data Types Are Stored

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA STORAGE MATRIX                       │
└─────────────────────────────────────────────────────────────┘

USER INPUTS (from forms):
┌───────────────────────────┬──────────────┬─────────────────┐
│ Data Type                 │ First Storage│ Final Storage   │
├───────────────────────────┼──────────────┼─────────────────┤
│ Instant Quote Inputs      │ GuestInstant │ Lead.quoteData  │
│                           │ Quote        │ (JSON)          │
├───────────────────────────┼──────────────┼─────────────────┤
│ Instant Quote Results     │ GuestInstant │ Lead.quoteData  │
│                           │ Quote.results│ .results (JSON) │
├───────────────────────────┼──────────────┼─────────────────┤
│ User Details (name/phone) │ Form state   │ Lead record     │
│                           │ (temp)       │ + User record   │
├───────────────────────────┼──────────────┼─────────────────┤
│ Property Address          │ Form state   │ Lead.address    │
│                           │ (temp)       │                 │
├───────────────────────────┼──────────────┼─────────────────┤
│ OTP Code                  │ PhoneVerif   │ (deleted after  │
│                           │ ication      │  verification)  │
└───────────────────────────┴──────────────┴─────────────────┘

LIFECYCLE TRACKING:
┌───────────────────────────┬─────────────────────────────────┐
│ Event                     │ Storage Location                │
├───────────────────────────┼─────────────────────────────────┤
│ Lead Created              │ AuditLog.action="LEAD_CREATED"  │
│ Lead Approved             │ AuditLog.action="LEAD_APPROVED" │
│ OTP Sent                  │ AuditLog.action="OTP_SENT"      │
│ Phone Verified            │ AuditLog.action="PHONE_VERIFIED"│
└───────────────────────────┴─────────────────────────────────┘

QUOTA TRACKING:
┌───────────────────────────┬─────────────────────────────────┐
│ Metric                    │ Storage Location                │
├───────────────────────────┼─────────────────────────────────┤
│ Total Leads Count         │ User.leadSubmissionCount        │
│ BIDDING Leads Count       │ User.biddingLeadsSubmitted      │
│ Quota Limit               │ User.leadSubmissionLimit        │
│ Verification Status       │ User.phoneVerified              │
└───────────────────────────┴─────────────────────────────────┘
```

---

**User Flow Documentation Complete**

Next: [09-ISSUES-AND-RECOMMENDATIONS.md](./09-ISSUES-AND-RECOMMENDATIONS.md)
