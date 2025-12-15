# API Endpoints - Lead Generation System

**Last Updated**: November 15, 2025  
**Base URL**: `/api/`  
**Authentication**: NextAuth.js session-based  

---

## 📡 Endpoint Overview

### Lead Management
- `POST /api/leads` - Create new lead
- `GET /api/leads` - List leads (role-based)
- `GET /api/leads/[id]` - Get lead details
- `POST /api/leads/[id]/approve` - Admin approve lead
- `POST /api/leads/[id]/reject` - Admin reject lead
- `POST /api/leads/[id]/cancel` - User cancel lead

### Instant Quotes
- `POST /api/instant-quote` - Save guest quote
- `GET /api/instant-quote` - List guest quotes (admin)

### Phone Verification
- `POST /api/verification/send-otp` - Send OTP via SMS
- `POST /api/verification/verify-otp` - Verify OTP code

### Admin
- `GET /api/admin/instant-quotes` - Analytics dashboard
- `GET /api/homeowner/dashboard` - Homeowner stats

---

## 🔐 Authentication Matrix

| Endpoint | Guest | Homeowner | Admin | Installer |
|----------|-------|-----------|-------|-----------|
| POST /api/instant-quote | ✅ | ✅ | ✅ | ✅ |
| POST /api/leads | ❌ | ✅ | ❌ | ❌ |
| GET /api/leads | ❌ | ✅ (own) | ✅ (all) | ✅ (marketplace) |
| POST /api/leads/[id]/approve | ❌ | ❌ | ✅ | ❌ |
| POST /api/verification/send-otp | ❌ | ✅ | ✅ | ✅ |
| GET /api/admin/* | ❌ | ❌ | ✅ | ❌ |

---

## 📋 Detailed Endpoint Documentation

### POST /api/instant-quote

**Purpose**: Save anonymous instant quote calculation

**Auth**: None (public endpoint)

**Request Body**:
```typescript
{
  // Required
  quoteType: "residential" | "commercial",
  postcode: string,
  location: string,
  state: string,
  electricityUsageType: "monthly" | "quarterly",
  electricityValue: number,
  roofType: string,
  budgetRange: string,
  panelOrientation: string,
  roofTilt: string,
  shadingLevel: string,
  desiredOffset: number,
  results: object, // Calculated outputs
  
  // Optional tracking
  sessionId?: string,
  userAgent?: string,
  ipAddress?: string,
  
  // Optional config
  batteryIncluded?: boolean,
  batteryCapacity?: string,
  hasExistingSystem?: boolean,
  // ... 30+ optional fields
}
```

**Response** (201 Created):
```typescript
{
  quote: {
    id: string,
    quoteType: string,
    location: string,
    results: object,
    createdAt: string
  },
  message: "Quote saved successfully"
}
```

**Errors**:
- 400: Missing required fields
- 500: Database error

**Business Logic**:
- Stores complete quote data in `GuestInstantQuote` table
- Used for analytics and conversion tracking
- No authentication required
- Session ID links multiple quotes from same user

---

### POST /api/leads

**Purpose**: Create formal lead request from homeowner

**Auth**: Required (HOMEOWNER role only)

**Request Body**:
```typescript
{
  // Required
  quoteType: "CALL_VISIT" | "WRITTEN_QUOTE" | "BIDDING",
  propertyPostcode: string,
  location: string,
  state: string,
  energyBill: number,
  
  // Optional (Phase 12 - should be required)
  name?: string,           // User's full name
  phoneNumber?: string,    // E.164 format
  address?: string,        // Property address
  
  // Optional config
  quoteData?: object,      // From instant quote
  propertyType?: string,
  roofType?: string,
  budgetRange?: string,
  desiredOffset?: number,
  batteryRequired?: boolean,
  timeframe?: string,
  additionalNotes?: string
}
```

**Response** (201 Created):
```typescript
{
  lead: {
    id: string,
    status: "PENDING_APPROVAL",
    visibility: "HIDDEN",
    quoteType: string,
    createdAt: string
  },
  message: "Lead created successfully",
  autoApproved: boolean,
  leadSubmissionCount: number,
  quoteLimit: number,
  remainingLeadAllowance: number,
  dashboardSummary: object
}
```

**Response** (403 Forbidden - Verification Required):
```typescript
{
  error: "Phone verification required",
  message: "You must verify your phone number...",
  leadSubmissionCount: number,
  quoteLimit: number,
  remainingLeadAllowance: number,
  requiresVerification: true
}
```

**Response** (403 Forbidden - Limit Reached):
```typescript
{
  error: "Lead limit reached",
  message: "You have reached the maximum...",
  leadSubmissionCount: number,
  quoteLimit: number,
  remainingLeadAllowance: number
}
```

**Business Logic**:
1. Check homeowner role
2. Validate required fields
3. Check quota: `leadSubmissionCount < leadSubmissionLimit`
4. Check verification: If `count >= 2` AND `!phoneVerified`, require verification
5. Check BIDDING quota: If type = BIDDING, check `biddingLeadsSubmitted < 1`
6. Create lead with status = PENDING_APPROVAL
7. Increment `leadSubmissionCount`
8. If BIDDING, increment `biddingLeadsSubmitted`
9. Create audit log
10. Notify admin

**Service**: `createLead()` in `/src/lib/services/lead-service.ts`

---

### GET /api/leads

**Purpose**: List leads with role-based filtering

**Auth**: Required (all authenticated roles)

**Query Parameters**:
```typescript
{
  status?: LeadStatus,
  quoteType?: "CALL_VISIT" | "WRITTEN_QUOTE" | "BIDDING",
  postcode?: string,
  marketplace?: "true" | "false",  // Installers: available leads
  purchased?: "true" | "false",    // Installers: owned leads
  assigned?: "true" | "false",     // Installers: assigned leads
  page?: number,                   // Default: 1
  limit?: number                   // Default: 20
}
```

**Response** (200 OK):
```typescript
{
  leads: [{
    id: string,
    status: LeadStatus,
    visibility: LeadVisibility,
    quoteType: string,
    postcode: string,
    location: string,
    leadPrice: number,
    createdAt: string,
    expiresAt: string,
    homeowner: {
      id: string,
      name: string,
      email: string
    }
  }],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Role-Based Filtering**:

**HOMEOWNER**:
- Only sees their own leads (`homeownerId = session.user.id`)
- All statuses visible

**INSTALLER**:
- `marketplace=true`: Public approved leads not yet purchased
- `purchased=true`: Leads they've purchased
- `assigned=true`: Leads assigned to them privately
- Default: Both available and purchased

**ADMIN**:
- Sees all leads without filters
- Can filter by any field

**Service**: `getLeads()` in `/src/lib/services/lead-service.ts`

---

### POST /api/leads/[id]/approve

**Purpose**: Admin approves lead for marketplace/assignment

**Auth**: Required (ADMIN role only)

**Request Body**:
```typescript
{
  price?: number,                    // Lead price (default from settings)
  assignTo?: "ALL" | string[],       // "ALL" = public, array = private
  isHot?: boolean,                   // Priority flag
  enableCountdown?: boolean,         // Default: true
  countdownDays?: number            // Default from settings
}
```

**Response** (200 OK):
```typescript
{
  lead: {
    id: string,
    status: "APPROVED",
    visibility: "PUBLIC" | "PRIVATE",
    leadPrice: number,
    approvedAt: string,
    expiresAt: string,
    countdown: {
      timeRemaining: string,
      percentage: number,
      isExpired: boolean
    }
  },
  message: "Lead approved successfully"
}
```

**Business Logic**:
1. Check admin role
2. Validate lead status (must be DRAFT, PENDING_APPROVAL, or PENDING_PHONE)
3. Set price (provided or default)
4. Determine visibility:
   - `assignTo = "ALL"` → PUBLIC (marketplace)
   - `assignTo = [...]` → PRIVATE (assigned installers)
5. Calculate expiry: `expiresAt = now() + countdownDays`
6. Update lead: status = APPROVED
7. If PRIVATE, create LeadAssignment records
8. Create audit log
9. Notify homeowner

**Service**: Direct Prisma call + `calculateCountdown()` from countdown-service

---

### POST /api/verification/send-otp

**Purpose**: Send OTP code via SMS for phone verification

**Auth**: Required (authenticated users)

**Request Body**:
```typescript
{
  phoneNumber: string  // E.164 format (e.g., +61412345678)
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  message: "OTP sent successfully",
  verificationId: string,
  expiresAt: string,
  remainingAttempts: number
}
```

**Response** (429 Too Many Requests):
```typescript
{
  error: "Rate limit exceeded...",
  retryAfter: number  // Seconds until reset
}
```

**Business Logic**:
1. Validate phone format (E.164)
2. Check rate limit: max 3 requests per 15 minutes (per IP)
3. Generate 6-digit code
4. Create PhoneVerification record: status = PENDING, expiresAt = +15min
5. Send SMS via Twilio
6. Create audit log

**Service**: `phoneVerificationService.sendOTP()` in `/src/lib/services/phone-verification-service.ts`

---

### POST /api/verification/verify-otp

**Purpose**: Verify OTP code and mark phone as verified

**Auth**: Required (authenticated users)

**Request Body**:
```typescript
{
  phoneNumber: string,
  code: string  // 6 digits
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  message: "Phone verified successfully"
}
```

**Response** (400 Bad Request):
```typescript
{
  error: "Invalid or expired OTP"
}
```

**Response** (429 Too Many Requests):
```typescript
{
  error: "Maximum attempts exceeded",
  remainingAttempts: 0
}
```

**Business Logic**:
1. Find PhoneVerification record: phoneNumber + userId + status=PENDING
2. Check expiry: expiresAt > now()
3. Check attempts: attempts < 3
4. Verify code matches
5. Update PhoneVerification: status = VERIFIED, verifiedAt = now()
6. Update User: phoneVerified = true
7. Create audit log

**Service**: `phoneVerificationService.verifyOTP()` in `/src/lib/services/phone-verification-service.ts`

---

## 🔄 Service Layer Architecture

### Key Services

**lead-service.ts**:
- `createLead()` - Lead creation with validation
- `getLeads()` - Role-based lead fetching
- `getHomeownerLeadSummary()` - Dashboard stats
- Quota enforcement logic
- Verification gate logic

**phone-verification-service.ts**:
- `sendOTP()` - OTP generation and SMS sending
- `verifyOTP()` - Code validation
- Rate limiting logic
- Twilio integration

**countdown-service.ts**:
- `calculateExpiresAt()` - Expiry calculation
- `calculateCountdown()` - Time remaining
- `validateCountdownDuration()` - Input validation

**audit-logger.ts**:
- `createAuditLog()` - Activity tracking
- Action constants (LEAD_CREATED, LEAD_APPROVED, etc.)

**notification-service.ts**:
- `createNotification()` - User notifications
- Email/push integration (future)

---

## 🔍 Error Handling Patterns

### Standard Error Responses

```typescript
// 400 Bad Request
{
  error: "Missing required fields",
  details?: string
}

// 401 Unauthorized
{
  error: "Authentication required"
}

// 403 Forbidden
{
  error: "Insufficient permissions",
  message?: string
}

// 404 Not Found
{
  error: "Resource not found"
}

// 429 Too Many Requests
{
  error: "Rate limit exceeded",
  retryAfter: number
}

// 500 Internal Server Error
{
  error: "Internal server error",
  details?: string  // Only in development
}
```

---

## 📊 Rate Limiting

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| POST /api/verification/send-otp | 3 requests | 15 min | Per IP |
| POST /api/verification/verify-otp | 3 attempts | Per OTP | Per verification |
| POST /api/instant-quote | None | - | - |
| POST /api/leads | Quota-based | - | Per user |

---

## 🔐 Security Headers

All API routes include:
- CORS headers (Next.js default)
- CSRF protection (NextAuth)
- Session validation
- Role-based authorization

---

**API Documentation Complete**

Next: [04-GUEST-USER-FLOW.md](./04-GUEST-USER-FLOW.md)
