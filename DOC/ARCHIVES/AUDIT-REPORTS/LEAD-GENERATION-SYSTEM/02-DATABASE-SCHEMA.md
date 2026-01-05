# Database Schema - Lead Generation System

**Last Updated**: November 15, 2025  
**Schema Location**: `/prisma/schema.prisma`  
**Database**: PostgreSQL via Prisma ORM  

---

## 📊 Entity Relationship Overview

```
┌─────────────────┐
│      User       │◄────────┐
│  (HOMEOWNER)    │         │
└────────┬────────┘         │
         │                  │
         │ 1:N              │ 1:N
         │                  │
         ↓                  │
┌─────────────────┐         │
│      Lead       │─────────┘
│   (Quote Req)   │
└────────┬────────┘
         │
         │ 1:1
         │
         ↓
┌─────────────────┐
│  Lead quoteData │ (JSON - stores GuestInstantQuote structure)
└─────────────────┘

┌─────────────────────┐
│ GuestInstantQuote   │ (Separate table for analytics)
└─────────────────────┘

┌─────────────────────┐
│ PhoneVerification   │◄── User (1:N)
└─────────────────────┘

┌─────────────────────┐
│  LeadAssignment     │◄── Lead (1:N)
└─────────────────────┘  └── Installer (N:1)
```

---

## 🗃️ Core Models

### 1. User Model

**Purpose**: Stores all user accounts (homeowners, installers, admins)

**Key Fields**:

```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String?
  role                  UserRole  @default(HOMEOWNER)
  name                  String?
  phone                 String?
  phoneVerified         Boolean   @default(false)
  
  // Quota tracking
  leadSubmissionCount   Int       @default(0)
  leadSubmissionLimit   Int       @default(5)
  biddingLeadsSubmitted Int       @default(0)
  
  // Relationships
  leadsAsHomeowner      Lead[]    @relation("homeowner_leads")
  phoneVerifications    PhoneVerification[]
  
  // Timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

enum UserRole {
  GUEST
  HOMEOWNER
  INSTALLER
  ADMIN
}
```

**Field Details**:

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `id` | String (CUID) | ✅ Yes | Auto | Primary key |
| `email` | String | ✅ Yes | - | Unique identifier, login |
| `password` | String | ❌ No | null | Hashed password (nullable for OAuth) |
| `role` | Enum | ✅ Yes | HOMEOWNER | Access control |
| `name` | String | ❌ No | null | Display name |
| `phone` | String | ❌ No | null | Contact number (E.164 format) |
| `phoneVerified` | Boolean | ✅ Yes | false | OTP verification status |
| `leadSubmissionCount` | Int | ✅ Yes | 0 | Total leads created |
| `leadSubmissionLimit` | Int | ✅ Yes | 5 | Maximum allowed leads |
| `biddingLeadsSubmitted` | Int | ✅ Yes | 0 | BIDDING quote counter |

**Business Rules**:
- Email must be unique (enforced by DB)
- `leadSubmissionCount` increments on lead creation
- `biddingLeadsSubmitted` increments only for BIDDING type
- Phone verification required after 2 submissions
- Admin can adjust `leadSubmissionLimit` per user

**Storage Location**: `users` table

---

### 2. Lead Model

**Purpose**: Stores formal quote requests from homeowners

**Key Fields**:

```prisma
model Lead {
  id                String         @id @default(cuid())
  homeownerId       String
  installerId       String?
  
  // Core details
  name              String?         // Phase 12: User's full name
  phoneNumber       String?         // Phase 12: User's phone (E.164)
  address           String?         // Phase 12: Property address
  
  // Quote configuration
  quoteType         LeadQuoteType   @default(CALL_VISIT)
  projectType       String
  propertyType      String
  postcode          String
  location          String
  state             String
  
  // Energy & system
  energyBill        Float
  billType          String
  roofType          String
  budgetRange       String
  desiredOffset     Int
  batteryRequired   Boolean         @default(false)
  batteryCapacity   String?
  
  // Status & visibility
  status            LeadStatus      @default(DRAFT)
  visibility        LeadVisibility  @default(HIDDEN)
  phoneVerified     Boolean         @default(false)
  
  // Pricing & purchase
  leadPrice         Float?
  purchaseStatus    PurchaseStatus?
  
  // Complete instant quote data (JSON)
  quoteData         Json?
  
  // Lifecycle timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  approvedAt        DateTime?
  purchasedAt       DateTime?
  expiresAt         DateTime?       // Countdown timer
  
  // Relationships
  homeowner         User            @relation("homeowner_leads", ...)
  installer         User?           @relation("installer_leads", ...)
}

enum LeadQuoteType {
  CALL_VISIT      // Installer calls/visits homeowner
  WRITTEN_QUOTE   // Detailed written proposal
  BIDDING         // Competitive bidding (limited to 1 per user)
}

enum LeadStatus {
  DRAFT                 // Not yet submitted
  PENDING_PHONE         // Awaiting phone verification
  PENDING_APPROVAL      // Awaiting admin review
  APPROVED              // Ready for marketplace
  PURCHASED             // Installer bought lead
  QUOTED                // Installer sent quote
  ACCEPTED              // Homeowner accepted quote
  REJECTED              // Admin/homeowner rejected
  EXPIRED               // Countdown timer expired
  CANCELLED             // Homeowner cancelled
  FLAGGED               // Admin flagged for review
}

enum LeadVisibility {
  HIDDEN   // Not visible to installers (pre-approval)
  PUBLIC   // Visible to all installers (marketplace)
  PRIVATE  // Visible to assigned installers only
}
```

**Field Details**:

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `id` | String (CUID) | ✅ Yes | Auto | Primary key |
| `homeownerId` | String (FK) | ✅ Yes | - | Owner of lead |
| `name` | String | ❌ No | null | **User's full name** (Phase 12) |
| `phoneNumber` | String | ❌ No | null | **User's phone** (Phase 12, E.164) |
| `address` | String | ❌ No | null | **Property address** (Phase 12) |
| `quoteType` | Enum | ✅ Yes | CALL_VISIT | Type of service requested |
| `status` | Enum | ✅ Yes | DRAFT | Current lifecycle stage |
| `visibility` | Enum | ✅ Yes | HIDDEN | Who can see lead |
| `phoneVerified` | Boolean | ✅ Yes | false | Copy of homeowner verification |
| `quoteData` | JSON | ❌ No | null | **Complete instant quote inputs/results** |
| `leadPrice` | Float | ❌ No | null | Price for installer to purchase |
| `expiresAt` | DateTime | ❌ No | null | Countdown timer expiry |

**Business Rules**:
- `homeownerId` must reference existing User
- `quoteType` determines pricing (CALL_VISIT, WRITTEN_QUOTE, BIDDING)
- `status` transitions controlled by state machine
- `visibility` set by admin on approval:
  - HIDDEN: Pre-approval, not visible to installers
  - PUBLIC: Available to all installers (marketplace)
  - PRIVATE: Visible only to assigned installers
- `phoneVerified` copied from `User.phoneVerified` at creation
- `quoteData` stores full JSON from instant quote calculation
- `expiresAt` set on approval (default 30 days)

**Storage Location**: `leads` table

**Indexes**:
```prisma
@@index([homeownerId])
@@index([status])
@@index([visibility])
@@index([quoteType])
@@index([postcode])
@@index([expiresAt])
```

---

### 3. GuestInstantQuote Model

**Purpose**: Stores anonymous instant quote calculations for analytics

**Key Fields**:

```prisma
model GuestInstantQuote {
  id                    String    @id @default(cuid())
  
  // Tracking
  sessionId             String?
  ipAddress             String?
  userAgent             String?
  
  // Location
  quoteType             String
  postcode              String
  location              String
  state                 String
  
  // Energy
  electricityUsageType  String
  electricityValue      Float
  
  // System config
  roofType              String
  budgetRange           String
  panelOrientation      String
  roofTilt              String
  shadingLevel          String
  desiredOffset         Int
  usagePattern          String?
  
  // Battery options
  batteryIncluded       Boolean   @default(false)
  batteryCapacity       String?
  batteryBrand          String?
  batteryUsage          String?
  includeVPP            Boolean   @default(false)
  
  // Advanced options
  isThreePhase          Boolean   @default(false)
  peakDemand            String?
  retailer              String?
  tariffPlan            String?
  
  // Panel & equipment
  panelBrand            String?
  includeOptimizers     Boolean   @default(false)
  includeMicroinverters Boolean   @default(false)
  includeEVCharging     Boolean   @default(false)
  includeSmartHome      Boolean   @default(false)
  includeGridServices   Boolean   @default(false)
  
  // Existing system
  hasExistingSystem     Boolean   @default(false)
  existingSystemSize    String?
  systemSizeOverride    String?
  
  // Calculated results (JSON)
  results               Json
  
  // Admin notes
  adminNotes            String?
  isConverted           Boolean   @default(false)
  conversionDate        DateTime?
  
  // Timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

**Field Details**:

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `sessionId` | String | ❌ No | null | Track user across page visits |
| `ipAddress` | String | ❌ No | null | Geolocation, fraud detection |
| `userAgent` | String | ❌ No | null | Device/browser analytics |
| `electricityValue` | Float | ✅ Yes | - | Monthly/quarterly usage |
| `results` | JSON | ✅ Yes | - | **All calculation outputs** |
| `isConverted` | Boolean | ✅ Yes | false | Did user register? |
| `conversionDate` | DateTime | ❌ No | null | When conversion happened |

**Business Rules**:
- Stores **ALL** instant quote inputs (40+ fields)
- `results` JSON contains calculated:
  - System size (kW)
  - Annual production (kWh)
  - Annual savings ($)
  - Payback period (years)
  - Final price after rebates ($)
  - CO2 reduction (kg/year)
- `isConverted = true` when user registers after quote
- Used for analytics:
  - Conversion rate tracking
  - Popular configurations
  - Regional trends
  - Pricing optimization

**Storage Location**: `guest_instant_quotes` table

**Indexes**:
```prisma
@@index([createdAt])
@@index([state])
@@index([quoteType])
@@index([sessionId])
```

---

### 4. PhoneVerification Model

**Purpose**: Tracks OTP verification attempts for phone validation

**Key Fields**:

```prisma
model PhoneVerification {
  id              String    @id @default(cuid())
  phoneNumber     String
  code            String              // 6-digit OTP
  status          String   @default("PENDING")
  
  // Rate limiting
  attempts        Int      @default(0)
  lastAttemptAt   DateTime?
  
  // Lifecycle
  verifiedAt      DateTime?
  createdAt       DateTime @default(now())
  expiresAt       DateTime            // 15 minutes from creation
  
  // Twilio integration
  verificationSid String?             // Twilio verification ID
  
  // Relationships
  userId          String
  user            User     @relation(...)
}
```

**Field Details**:

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `phoneNumber` | String | ✅ Yes | - | E.164 format phone |
| `code` | String | ✅ Yes | - | 6-digit OTP |
| `status` | String | ✅ Yes | PENDING | PENDING, VERIFIED, EXPIRED |
| `attempts` | Int | ✅ Yes | 0 | Number of verification tries |
| `expiresAt` | DateTime | ✅ Yes | +15min | OTP expiration |
| `verificationSid` | String | ❌ No | null | Twilio tracking ID |

**Business Rules**:
- OTP expires 15 minutes after creation
- Maximum 3 verification attempts per phone
- Rate limiting: 3 OTP requests per 15 minutes
- `status` transitions:
  - PENDING → VERIFIED (on successful verification)
  - PENDING → EXPIRED (after 15 minutes)
- Successful verification:
  1. Sets `verifiedAt` timestamp
  2. Updates `status = "VERIFIED"`
  3. Updates `User.phoneVerified = true`

**Storage Location**: `phone_verifications` table

**Indexes**:
```prisma
@@index([phoneNumber])
@@index([userId])
@@index([status])
```

---

### 5. LeadAssignment Model

**Purpose**: Tracks private lead assignments to specific installers

**Key Fields**:

```prisma
model LeadAssignment {
  id            String   @id @default(cuid())
  leadId        String
  installerId   String
  assignedBy    String              // Admin user ID
  assignedAt    DateTime @default(now())
  notes         String?
  notified      Boolean  @default(false)
  
  // Relationships
  lead          Lead     @relation(...)
  installer     User     @relation(...)
  admin         User     @relation(...)
  
  @@unique([leadId, installerId])  // Prevent duplicate assignments
}
```

**Field Details**:

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `leadId` | String (FK) | ✅ Yes | - | Lead being assigned |
| `installerId` | String (FK) | ✅ Yes | - | Assigned installer |
| `assignedBy` | String (FK) | ✅ Yes | - | Admin who assigned |
| `notes` | String | ❌ No | null | Assignment context |
| `notified` | Boolean | ✅ Yes | false | Email notification sent? |

**Business Rules**:
- Unique constraint: One installer per lead
- Only used when `Lead.visibility = PRIVATE`
- Public leads (visibility = PUBLIC) don't use assignments
- Admin can reassign by deleting old assignment and creating new

**Storage Location**: `lead_assignments` table

**Indexes**:
```prisma
@@index([leadId])
@@index([installerId])
@@index([assignedBy])
```

---

## 🔗 Relationships Summary

### User → Lead (1:N)

```prisma
// One homeowner can create many leads
User.leadsAsHomeowner → Lead.homeowner
```

**Cascade**: DELETE (if user deleted, all their leads deleted)

### Lead → LeadAssignment (1:N)

```prisma
// One lead can be assigned to multiple installers (rare)
Lead.assignments → LeadAssignment.lead
```

**Cascade**: DELETE (if lead deleted, assignments deleted)

### User → PhoneVerification (1:N)

```prisma
// One user can have multiple verification attempts
User.phoneVerifications → PhoneVerification.user
```

**Cascade**: DELETE (if user deleted, verification history deleted)

---

## 📝 JSON Fields Deep Dive

### Lead.quoteData (JSON)

**Purpose**: Stores complete instant quote calculation data for pre-fill and reference

**Structure**:
```json
{
  // Location
  "quoteType": "residential",
  "postcode": "2000",
  "location": "Sydney",
  "state": "NSW",
  
  // Energy
  "electricityUsageType": "monthly",
  "electricityValue": 400,
  
  // System
  "roofType": "tile",
  "budgetRange": "10000-20000",
  "panelOrientation": "north",
  "roofTilt": "optimal",
  "shadingLevel": "none",
  "desiredOffset": 100,
  
  // Battery
  "batteryIncluded": false,
  "batteryCapacity": null,
  
  // Results (calculated)
  "results": {
    "systemSize": 6.6,
    "annualProduction": 9500,
    "annualSavings": 1250,
    "finalPrice": 5000,
    "paybackYears": 4.2,
    "co2Reduction": 5800
  }
}
```

**Use Cases**:
1. Pre-fill SimplifiedQuoteFormModal for repeat quotes
2. Show homeowner their original calculation
3. Admin reference for lead quality
4. Analytics on quote → lead conversion

---

### GuestInstantQuote.results (JSON)

**Purpose**: Stores all calculated outputs from instant quote engine

**Structure**:
```json
{
  "systemSize": 6.6,              // kW
  "panelCount": 20,
  "annualProduction": 9500,       // kWh/year
  "annualSavings": 1250,          // $/year
  "grossPrice": 8000,             // $
  "federalRebate": 2000,          // $
  "stateRebate": 1000,            // $
  "finalPrice": 5000,             // $
  "paybackYears": 4.2,
  "co2Reduction": 5800,           // kg/year
  "roi": 19.2,                    // %
  "lifetimeSavings": 31250        // $ over 25 years
}
```

**Use Cases**:
1. Display to user immediately
2. Analytics on quote trends
3. Conversion tracking
4. Pricing optimization

---

## 🔍 Data Integrity Constraints

### Foreign Keys

| Parent | Child | Field | Delete Rule |
|--------|-------|-------|-------------|
| User | Lead | homeownerId | CASCADE |
| User | PhoneVerification | userId | CASCADE |
| Lead | LeadAssignment | leadId | CASCADE |
| User | LeadAssignment | installerId | CASCADE |

### Unique Constraints

| Table | Fields | Purpose |
|-------|--------|---------|
| User | email | Prevent duplicate accounts |
| LeadAssignment | leadId + installerId | Prevent duplicate assignments |

### Indexes (Performance)

**Heavy Query Patterns**:
- Homeowner dashboard: `WHERE homeownerId = ? ORDER BY createdAt DESC`
- Marketplace: `WHERE visibility = 'PUBLIC' AND status = 'APPROVED'`
- Admin review: `WHERE status = 'PENDING_APPROVAL' ORDER BY createdAt ASC`
- Phone lookup: `WHERE phoneNumber = ? AND status = 'PENDING'`

**Indexed Fields**:
- `Lead`: homeownerId, status, visibility, quoteType, postcode, expiresAt, createdAt
- `PhoneVerification`: phoneNumber, userId, status
- `LeadAssignment`: leadId, installerId, assignedBy
- `GuestInstantQuote`: sessionId, state, quoteType, createdAt

---

## 📊 Data Volume Estimates

**Typical Usage** (per 1000 users):

| Table | Records | Growth Rate | Storage |
|-------|---------|-------------|---------|
| User | 1,000 | Steady | ~200 KB |
| Lead | 3,500 | High (3.5 per user avg) | ~3.5 MB |
| GuestInstantQuote | 10,000 | Very High | ~50 MB |
| PhoneVerification | 2,000 | Medium | ~100 KB |
| LeadAssignment | 500 | Low | ~50 KB |

**Total**: ~54 MB per 1,000 users

---

## 🔄 Lifecycle States

### Lead Status Transitions

```
DRAFT
  ↓
PENDING_APPROVAL (on submit)
  ↓
APPROVED (admin action)
  ↓
PURCHASED (installer buys)
  ↓
QUOTED (installer submits quote)
  ↓
ACCEPTED (homeowner accepts)

Alternative paths:
DRAFT → CANCELLED (user cancels)
PENDING_APPROVAL → REJECTED (admin rejects)
APPROVED → EXPIRED (countdown timer)
```

### PhoneVerification Status Flow

```
PENDING (on creation)
  ↓
VERIFIED (on successful code entry)

Alternative:
PENDING → EXPIRED (after 15 minutes)
```

---

## ⚠️ Critical Schema Notes

### Phase 12 Fields (Partially Implemented)

The following fields exist in schema but are **not yet collected in UI**:

- `Lead.name` ❌ Not collected
- `Lead.phoneNumber` ❌ Not collected
- `Lead.address` ❌ Not collected

**Issue**: First-time homeowner flow doesn't show DetailedInformationModal  
**Impact**: Installers receive leads without contact details  
**Fix Required**: Connect modal in dashboard flow (Phase 12 spec)

### BIDDING Quote Type

- `LeadQuoteType.BIDDING` ✅ Exists in schema
- `User.biddingLeadsSubmitted` ✅ Quota tracking in place
- UI support 🟡 Partial (SimplifiedQuoteFormModal pending)

### Soft Deletes

❌ **Not implemented** - Records are hard deleted  
**Recommendation**: Add `deletedAt` field for audit trail

---

## 📚 Migration History

**Current Schema Version**: Latest (no version tracking)

**Major Changes**:
- Initial schema with User, Lead models
- Added PhoneVerification table
- Added `biddingLeadsSubmitted` to User
- Added Phase 12 fields (name, phoneNumber, address) to Lead
- Added LeadAssignment for private leads
- Added countdown timer (`expiresAt`) to Lead

---

## 🔐 Security Considerations

### Sensitive Data

| Field | Sensitivity | Encryption | Notes |
|-------|-------------|------------|-------|
| User.password | High | ✅ Bcrypt | Hashed, never stored plain |
| User.email | Medium | ❌ No | Indexed, used for login |
| User.phone | Medium | ❌ No | E.164 format |
| Lead.phoneNumber | Medium | ❌ No | Should match User.phone |
| PhoneVerification.code | High | ❌ No | 6 digits, expires 15min |

**Recommendations**:
- Consider encrypting phone numbers at rest
- Implement PII access logging
- Add data retention policies

---

**Schema Documentation Complete**

Next: [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md)
