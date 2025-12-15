# API Endpoints Audit - Phase 1.1.4
**Date**: 2025-01-XX  
**Status**: Complete  
**Auditor**: AI Development Assistant

---

## Executive Summary

This audit documents all existing API endpoints in the application. Currently, there are **3 functional endpoints**:

1. **POST /api/instant-quote** - Guest instant quote submissions
2. **GET /api/admin/instant-quotes** - Admin analytics and quote list
3. **POST /api/newsletter/subscribe** - Newsletter subscriptions

**Key Finding**: No API endpoints exist for authentication, quote requests (call/visit or written), bidding, messaging, or user management. All dashboards lack backend support.

---

## 1. Instant Quote API

### Endpoint Details
- **File**: `src/app/api/instant-quote/route.ts` (396 lines)
- **Route**: `POST /api/instant-quote`
- **Purpose**: Save guest instant quote submissions to database
- **Authentication**: None (public endpoint)

### Request Body Structure
```typescript
{
  // Required fields
  quoteType: "residential" | "commercial",
  postcode: string,
  location: string,
  state: string,
  electricityUsageType: "monthly" | "quarterly",
  electricityValue: string,
  roofType: string,
  budgetRange: string,
  panelOrientation: string,
  roofTilt: string,
  shadingLevel: string,
  desiredOffset: number,
  
  // Calculated results (from frontend)
  results: {
    systemSize: number,
    annualProduction: number,
    annualSavings: number,
    finalPrice: number,
    // ... other calculated fields
  },
  
  // Optional tracking fields
  sessionId?: string,
  userAgent?: string,
  ipAddress?: string,
  usagePattern?: string,
  
  // Additional optional fields (40+ total)
  batteryIncluded?: boolean,
  hasExistingSystem?: boolean,
  urgency?: string,
  // ... etc.
}
```

### Response Structure
```typescript
{
  success: true,
  data: {
    id: number,
    quoteType: string,
    location: string,
    state: string,
    results: object,
    createdAt: string,
    sessionId: string
  }
}

// Or on error:
{
  error: "Error message",
  details: "Detailed error information"
}
```

### Functionality
✅ Validates required fields  
✅ Stores all 48 fields from InstantQuoteForm  
✅ Saves calculated results JSON  
✅ Tracks sessionId, userAgent, ipAddress  
✅ Returns created quote with ID  
✅ Console logging for debugging  
✅ Error handling with try-catch  

### Database Operations
- **INSERT**: Creates new `GuestInstantQuote` record via Prisma
- **Fields**: All 48 fields from schema (see `audit-phase1-guest-quotes.md`)

### Integration Points
- Used by: `InstantQuoteForm.tsx` component (homepage)
- Triggers: When guest completes instant quote form
- Success behavior: Returns quote ID, can be used for lead conversion later

### Security Notes
- ⚠️ **Public endpoint** - No authentication required
- ⚠️ **Rate limiting** - Not implemented (should add to prevent spam)
- ⚠️ **Input validation** - Basic validation only
- ✅ **Appropriate** - Guests need to submit quotes anonymously

### What's Missing
- Rate limiting middleware
- IP address capture (currently optional, not automatic)
- Email notification to admin on new quote
- Lead scoring/priority calculation
- Duplicate detection (same sessionId/email)

---

## 2. Admin Instant Quotes API

### Endpoint Details
- **File**: `src/app/api/admin/instant-quotes/route.ts` (473 lines)
- **Route**: `GET /api/admin/instant-quotes`
- **Purpose**: Provide admin dashboard with quote analytics and list
- **Authentication**: None (⚠️ **CRITICAL SECURITY ISSUE**)

### Query Parameters
```typescript
{
  // Mode selection
  mode?: "metrics" | "list" | "both" (default: "both"),
  
  // Pagination
  limit?: number (default: 20, max: 100),
  offset?: number (default: 0),
  
  // Filters
  state?: string (e.g., "NSW"),
  quoteType?: "residential" | "commercial",
  dateFrom?: string (ISO date),
  dateTo?: string (ISO date),
  search?: string (searches location/postcode)
}
```

### Response Structure (mode="both")
```typescript
{
  metrics: {
    totalQuotes: number,
    residentialCount: number,
    commercialCount: number,
    topStates: Array<{ state: string, count: number }>,
    recentActivity: Array<{ date: string, count: number }>,
    avgSystemSize: number,
    avgAnnualProduction: number,
    avgAnnualSavings: number,
    avgFinalPrice: number
  },
  quotes: [
    {
      id: number,
      quoteType: string,
      postcode: string,
      location: string,
      state: string,
      electricityValue: string,
      roofType: string,
      budgetRange: string,
      results: object,
      createdAt: string,
      sessionId: string
    },
    // ... more quotes
  ],
  pagination: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean
  }
}
```

### Functionality
✅ Real-time metrics calculation  
✅ Flexible filtering (state, type, date range, search)  
✅ Pagination with limit/offset  
✅ Aggregated analytics (averages, counts, top states)  
✅ Recent activity timeline (last 7 days)  
✅ Mode selection (metrics only, list only, or both)  
✅ Error handling with try-catch  

### Database Operations
- **COUNT**: Total quotes with filters
- **COUNT**: Quotes by type (residential, commercial)
- **GROUP BY**: Top states by quote count
- **GROUP BY**: Daily quote counts (last 7 days)
- **AGGREGATE**: Average system size, production, savings, price
- **SELECT**: Paginated quote list with filters

### Integration Points
- Used by: `/admin/instant-quotes` page
- Admin dashboard analytics widgets
- Export functionality (future)

### Security Notes
- 🚨 **CRITICAL**: No authentication/authorization
- 🚨 **CRITICAL**: Any user can access admin data
- ⚠️ **TODO**: Must add admin middleware in Phase 2
- ⚠️ **TODO**: Add rate limiting
- Comment in code: "In production, this MUST require admin authentication!"

### Performance Considerations
- Multiple database queries (can be optimized with single aggregation)
- Limit capped at 100 to prevent overload
- Indexes on createdAt, state, quoteType support fast filtering

### What's Missing
- Authentication/authorization middleware
- Export to CSV functionality
- Quote status management (contacted, converted, etc.)
- Lead assignment to installers
- Bulk operations (delete, update status)

---

## 3. Newsletter Subscription API

### Endpoint Details
- **File**: `src/app/api/newsletter/subscribe/route.ts` (284 lines)
- **Route**: `POST /api/newsletter/subscribe`
- **Purpose**: Handle newsletter email subscriptions
- **Authentication**: None (public endpoint)

### Request Body Structure
```typescript
{
  email: string (required)
}
```

### Response Structure
```typescript
// Success (new subscription)
{
  success: true,
  message: "Successfully subscribed to newsletter!"
}

// Success (already subscribed)
{
  success: true,
  message: "You're already subscribed!"
}

// Error (validation)
{
  error: "Please provide a valid email address."
}

// Error (database)
{
  error: "Failed to subscribe. Please try again."
}
```

### Functionality
✅ Email validation (basic regex)  
✅ Duplicate detection (checks existing email)  
✅ Database insertion via Prisma  
✅ User-friendly error messages  
✅ Try-catch error handling  
✅ Console logging for debugging  

### Database Operations
- **SELECT**: Check if email exists (`findUnique`)
- **INSERT**: Create new subscriber if email doesn't exist

### Integration Points
- Used by: Newsletter subscription form (footer, homepage)
- Can be extended for: Email marketing campaigns, announcements

### Security Notes
- ✅ **Appropriate** - Public endpoint for newsletter signups
- ⚠️ **Rate limiting** - Not implemented (can be abused for spam)
- ⚠️ **Email verification** - Not implemented (anyone can add emails)
- ⚠️ **CAPTCHA** - Not implemented (bot protection needed)

### What's Missing
- Rate limiting middleware
- Email verification (double opt-in)
- CAPTCHA/bot protection
- Welcome email on successful subscription
- Unsubscribe functionality
- Email preference management

---

## 4. Missing API Endpoints

### Authentication APIs (Phase 2)
```typescript
// Required for all dashboards
POST   /api/auth/signup          // Create new user account
POST   /api/auth/signin          // User login
POST   /api/auth/signout         // User logout
GET    /api/auth/session         // Get current session
POST   /api/auth/verify-email    // Email verification
POST   /api/auth/reset-password  // Password reset
```

### Quote Request APIs (Phase 3)
```typescript
// Homeowner quote requests
POST   /api/quote-requests/call-visit     // Create call/visit request
POST   /api/quote-requests/written        // Create written quote request
GET    /api/quote-requests/my-requests    // Get user's requests
GET    /api/quote-requests/:id            // Get single request
PATCH  /api/quote-requests/:id            // Update request
DELETE /api/quote-requests/:id            // Cancel request

// Installer lead feed
GET    /api/leads/feed                    // Browse available requests
GET    /api/leads/:id                     // Get lead details
POST   /api/leads/:id/unlock              // Purchase lead access
GET    /api/leads/my-leads                // Get unlocked leads
```

### Bidding/Quote Submission APIs (Phase 4)
```typescript
// Installer bids
POST   /api/bids                          // Submit bid on lead
GET    /api/bids/my-bids                  // Get installer's bids
GET    /api/bids/:id                      // Get single bid
PATCH  /api/bids/:id                      // Update bid
DELETE /api/bids/:id                      // Withdraw bid

// Homeowner bid management
GET    /api/bids/request/:requestId       // Get bids for a request
POST   /api/bids/:bidId/accept            // Accept installer bid
POST   /api/bids/:bidId/reject            // Reject installer bid
```

### Messaging APIs (Phase 6)
```typescript
// Real-time messaging
GET    /api/messages/conversations        // Get user's conversations
GET    /api/messages/:conversationId      // Get conversation messages
POST   /api/messages/:conversationId      // Send message
PATCH  /api/messages/:messageId/read      // Mark message as read
DELETE /api/messages/:messageId           // Delete message

// WebSocket for real-time
WS     /api/messages/ws                   // WebSocket connection
```

### User/Profile APIs
```typescript
// User management
GET    /api/users/me                      // Get current user
PATCH  /api/users/me                      // Update profile
GET    /api/users/:id                     // Get user (if authorized)

// Installer-specific
PATCH  /api/installers/me                 // Update company profile
GET    /api/installers/me/stats           // Get installer stats
POST   /api/installers/me/credits/purchase // Buy credits
```

### Admin Management APIs (Phase 5)
```typescript
// Admin lead management
GET    /api/admin/leads                   // All quote requests
PATCH  /api/admin/leads/:id               // Update lead status
DELETE /api/admin/leads/:id               // Delete lead

// Admin installer management
GET    /api/admin/installers              // All installers
GET    /api/admin/installers/:id          // Single installer
PATCH  /api/admin/installers/:id/approve  // Approve installer
PATCH  /api/admin/installers/:id/suspend  // Suspend installer

// Admin analytics
GET    /api/admin/analytics               // Dashboard stats
GET    /api/admin/reports                 // Generate reports
```

### Payment/Credit APIs
```typescript
// Stripe integration
POST   /api/payments/create-intent        // Create payment intent
POST   /api/payments/confirm              // Confirm payment
GET    /api/payments/history              // Payment history

// Credit system
GET    /api/credits/balance               // Get credit balance
POST   /api/credits/purchase              // Buy credits
GET    /api/credits/transactions          // Credit history
```

---

## 5. API Architecture Recommendations

### Middleware Required (Phase 2)
```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Admin routes
      if (req.nextUrl.pathname.startsWith("/api/admin")) {
        return token?.role === "admin"
      }
      // Installer routes
      if (req.nextUrl.pathname.startsWith("/api/installers")) {
        return token?.role === "installer"
      }
      // Protected user routes
      return !!token
    }
  }
})

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/quote-requests/:path*",
    "/api/bids/:path*",
    "/api/messages/:path*",
    "/api/users/:path*",
    "/api/installers/:path*",
    "/api/credits/:path*",
    "/api/payments/:path*"
  ]
}
```

### Rate Limiting
```typescript
// Apply to all public endpoints
- POST /api/instant-quote: 5 requests/minute per IP
- POST /api/newsletter/subscribe: 3 requests/hour per IP
- POST /api/auth/signin: 5 attempts/15min per email
```

### Error Handling Pattern
```typescript
// Standardized error responses
{
  error: string,           // User-friendly message
  code: string,            // Error code (e.g., "UNAUTHORIZED")
  details?: object,        // Additional error info (dev mode only)
  timestamp: string        // ISO timestamp
}
```

### Response Pagination Pattern
```typescript
// Standard pagination structure
{
  data: Array<T>,
  pagination: {
    total: number,
    limit: number,
    offset: number,
    page: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

### API Versioning
```typescript
// Consider versioning for future changes
/api/v1/quote-requests
/api/v2/quote-requests (with breaking changes)

// Or use headers
Accept: application/vnd.solarmatch.v1+json
```

---

## 6. Database Integration Status

### Working Models
✅ `GuestInstantQuote` - Full CRUD via instant-quote API  
✅ `NewsletterSubscriber` - CREATE via newsletter API  

### Models Needed (No APIs Yet)
❌ `User` - No auth system  
❌ `CallVisitQuoteRequest` - No APIs  
❌ `WrittenQuoteRequest` - No APIs  
❌ `InstallerComment` - No APIs  
❌ `Bid` - No APIs  
❌ `Message` - No APIs  
❌ `Payment` - No APIs  
❌ `Credit` - No APIs  

---

## 7. Integration with Existing Components

### InstantQuoteForm.tsx → POST /api/instant-quote
✅ **Working** - Form submits to API, saves to database  
- Success: Returns quote ID
- Error: Shows error message to user

### Admin Dashboard → GET /api/admin/instant-quotes
✅ **Working** - Dashboard fetches metrics and quote list  
- Filters: State, type, date range, search
- Pagination: Limit/offset
- 🚨 **Security Issue**: No auth required

### Newsletter Form → POST /api/newsletter/subscribe
✅ **Working** - Footer form submits email  
- Validates email format
- Prevents duplicates
- Shows success/error message

### Homeowner Dashboard → APIs NOT BUILT
❌ NewQuoteRequestModal needs POST /api/quote-requests/*  
❌ Quote lists need GET /api/quote-requests/my-requests  
❌ MessagingModal needs GET/POST /api/messages/*  

### Installer Dashboard → APIs NOT BUILT
❌ InstallerLeadFeed needs GET /api/leads/feed  
❌ Lead unlock needs POST /api/leads/:id/unlock  
❌ Quote submission needs POST /api/bids  
❌ InstallerMessagingModal needs GET/POST /api/messages/*  

---

## 8. Audit Conclusion

### Current State
- **3 working endpoints**: Instant quotes, admin analytics, newsletter
- **0 authentication endpoints**: Major security gap
- **0 quote request endpoints**: Dashboards not functional
- **0 bidding endpoints**: Lead management not possible
- **0 messaging endpoints**: Communication not implemented

### Critical Priority (Phase 2)
1. Implement NextAuth.js authentication
2. Add auth middleware to protect admin routes
3. Create User model and registration/login APIs

### High Priority (Phase 3)
4. Build quote request APIs (CallVisitQuoteRequest, WrittenQuoteRequest)
5. Build lead feed API for installers
6. Implement lead unlock API

### Medium Priority (Phase 4-6)
7. Build bidding APIs
8. Implement messaging system
9. Add payment/credit APIs

### Code Quality
✅ Good error handling in existing APIs  
✅ Clear documentation in code comments  
✅ Consistent response structures  
⚠️ Need rate limiting on all public endpoints  
⚠️ Need input validation middleware  
⚠️ Need to fix admin API security immediately  

### Next Steps
1. Complete Task 1.1.5: Audit UI components
2. Consolidate Phase 1.1 findings
3. Move to Phase 1.2: Design database schema
4. Phase 2: Implement authentication system

---

**End of API Endpoints Audit**
