# Research & Technical Decisions: Lead Journey & Life Cycle

**Feature**: Lead Journey & Life Cycle  
**Branch**: 002-lead-journey-life  
**Date**: 2025-10-14  
**Phase**: 0 - Research & Planning

## Overview

This document captures all technical research, decisions, and rationale for implementing the Lead Journey & Life Cycle feature. All "NEEDS CLARIFICATION" items from the initial planning have been resolved through research and informed decisions based on industry best practices and the project's constitution.

---

## Research Tasks Completed

### 1. OTP Verification System

**Decision**: Use time-based OTP (6 digits, 10-minute expiry) stored in database

**Rationale**:
- Simple to implement without external SMS services initially
- Can be upgraded to Twilio/AWS SNS later for production
- Database storage allows audit trail and rate limiting
- 6 digits balance security and UX (easy to type on mobile)
- 10-minute expiry prevents abuse while giving users time

**Alternatives Considered**:
- **SMS Gateway (Twilio)**: Rejected for MVP - adds cost and complexity, can add later
- **Email OTP**: Rejected - less secure, slower delivery, users expect SMS for phone verification
- **TOTP (Time-based tokens like Google Authenticator)**: Rejected - overkill for phone verification

**Implementation**:
```typescript
// Generate: Math.floor(100000 + Math.random() * 900000).toString()
// Store: { phone, code, expiresAt: Date.now() + 10*60*1000, attempts: 0 }
// Verify: Check code match, expiry, and attempts < 3
// Rate limit: Max 3 OTP requests per phone per hour
```

---

### 2. Real-Time Notifications

**Decision**: Use polling + database-backed notifications initially, upgrade to WebSockets/SSE later

**Rationale**:
- Polling (every 30s) is simple and works with current Next.js setup
- Database table for notifications allows persistence and audit trail
- SSE/WebSockets can be added when scale requires (500+ concurrent users)
- Next.js API routes support both patterns
- Constitution allows pragmatic choices for MVP

**Alternatives Considered**:
- **WebSockets (Socket.io)**: Rejected for MVP - requires separate server or Vercel Pro plan
- **Server-Sent Events (SSE)**: Rejected for MVP - complex with App Router, can add later
- **Push Notifications (Browser API)**: Rejected - requires service worker, permission flow

**Implementation**:
```typescript
// Notification model in Prisma:
// id, userId, type, title, message, read, createdAt, data (JSON)
// Client polls: GET /api/notifications?since=timestamp
// Mark read: PATCH /api/notifications/[id]
// Trigger: notification.ts helper creates records on events
```

---

### 3. Lead Purchase Payment Flow

**Decision**: Defer Stripe integration to separate feature, implement "purchase intent" for MVP

**Rationale**:
- Full payment integration is complex and separate concern
- Lead journey can be tested with mock purchase flow
- Admin can manually process payments initially
- Stripe SDK and webhooks require separate planning
- Constitution: Build what's needed now (YAGNI principle)

**Alternatives Considered**:
- **Full Stripe Integration Now**: Rejected - scope creep, different feature
- **Manual Admin Processing Only**: Rejected - doesn't test full user flow
- **Credits System**: Rejected - adds account balance complexity

**Implementation**:
```typescript
// Purchase API creates:
// - Purchase record (leadId, installerId, amount, status: 'pending')
// - Status: pending → paid (manual admin approval for MVP)
// - Unlock contact details when status = 'paid'
// - Add Stripe later: replace manual approval with webhook
```

---

### 4. Internal Chat System

**Decision**: Simple database-backed chat with polling, no real-time for MVP

**Rationale**:
- Chat messages stored in database (audit trail per constitution)
- Polling every 10s for new messages (acceptable latency for MVP)
- Pagination for message history (50 messages per page)
- Admin can view all chats (compliance requirement)
- Real-time can be added with SSE/WebSockets later

**Alternatives Considered**:
- **Third-party Chat (SendBird, Stream)**: Rejected - external dependency, cost, less control
- **WebSocket Real-time**: Rejected for MVP - same reasoning as notifications
- **Email-based Communication**: Rejected - loses traceability and admin oversight

**Implementation**:
```typescript
// ChatMessage model:
// id, leadId, senderId, content, createdAt, read
// POST /api/chat: Send message
// GET /api/chat/[leadId]: Get messages (paginated, sorted desc)
// Admin access: Filter by leadId to view any conversation
```

---

### 5. Lead Status State Machine

**Decision**: Explicit status enum with validation rules, no arbitrary transitions

**Rationale**:
- Prevents invalid state transitions (e.g., Closed → New)
- Audit trail captures who changed status and when
- Business rules enforced in API layer
- Clear transitions documented for all roles

**Status Flow**:
```
NEW (homeowner submits)
  ↓
PENDING (admin approves)
  ↓
IN_PROGRESS (installer purchases)
  ↓
DEAL_CLOSED | VOID | NO_RESPONSE (final states)
  ↓
ARCHIVED (admin only, end of lifecycle)
```

**Valid Transitions**:
- NEW → PENDING (admin approval)
- PENDING → IN_PROGRESS (installer purchase)
- IN_PROGRESS → DEAL_CLOSED (deal closed)
- IN_PROGRESS → NO_RESPONSE (no installer response)
- Any → VOID (admin marks invalid)
- Any → ARCHIVED (admin closes lifecycle)

**Implementation**:
```typescript
// Enum in Prisma: LeadStatus { NEW, PENDING, IN_PROGRESS, DEAL_CLOSED, VOID, NO_RESPONSE, ARCHIVED }
// API validates transitions before PATCH /api/leads/[id]/status
// Audit log records: { leadId, oldStatus, newStatus, userId, timestamp }
```

---

### 6. Lead Pricing Model

**Decision**: Two-tier pricing (global defaults + per-lead overrides), stored in Lead model

**Rationale**:
- Admin sets global defaults in settings (Call/Visit: £X, Written Quote: £Y)
- Per-lead pricing overrides stored directly on Lead record
- Simple to implement and query
- No separate PricingRule table needed for MVP
- Admin UI shows both default and custom prices

**Alternatives Considered**:
- **Complex Pricing Rules (location, time, etc.)**: Rejected for MVP - adds complexity
- **Dynamic Pricing Algorithm**: Rejected - business logic not defined yet
- **Installer Bidding**: Rejected - different business model

**Implementation**:
```typescript
// Settings model: { globalCallVisitPrice, globalWrittenQuotePrice }
// Lead model: { customPrice: Decimal?, quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE' }
// Display logic: customPrice ?? (quoteType === 'CALL_VISIT' ? globalCallVisitPrice : globalWrittenQuotePrice)
```

---

### 7. Audit Trail Storage

**Decision**: Separate AuditLog table with JSON data field for flexibility

**Rationale**:
- Every action logged: create, purchase, status change, chat, quote, admin action
- JSON field stores action-specific metadata (old/new values, etc.)
- Queryable by leadId, userId, action type, timestamp
- Admin dashboard can display full history
- Supports GDPR audit requirements

**Alternatives Considered**:
- **Event Sourcing**: Rejected - overkill for MVP, complex to implement
- **Embedded in Lead Model**: Rejected - doesn't scale, hard to query
- **Third-party Logging (Sentry)**: Rejected - business audit, not error logging

**Implementation**:
```typescript
// AuditLog model:
// id, leadId, userId, action, data (JSON), timestamp
// Actions: CREATED, APPROVED, PURCHASED, STATUS_CHANGED, CHAT_SENT, QUOTE_SUBMITTED, ARCHIVED
// Helper function: audit.log(leadId, userId, action, data)
// Called in every API route that mutates lead state
```

---

### 8. Installer Verification Documents

**Decision**: File upload to cloud storage (Cloudinary/S3), references in database

**Rationale**:
- Documents (certifications, licenses) stored externally
- Database stores URLs and metadata only
- Admin reviews documents and approves/rejects
- Constitution allows cloud storage for files

**Alternatives Considered**:
- **Database BLOB Storage**: Rejected - not recommended for large files
- **Local File System**: Rejected - doesn't work with serverless (Vercel)

**Implementation**:
```typescript
// InstallDocument model:
// id, installerId, type, url, status (pending/approved/rejected), uploadedAt
// Upload: Client → Cloudinary API → save URL to database
// Admin: Review documents and update status
// Verification badge: All documents approved
```

---

### 9. Lead Assignment Logic

**Decision**: Manual admin assignment via UI (postcode/area filters), auto-assignment future

**Rationale**:
- Admin has full control for MVP (quality assurance)
- Filters by location/postcode help target relevant installers
- Auto-assignment rules can be added later (ML, routing)
- Allows "hot" lead manual prioritization

**Alternatives Considered**:
- **Automatic Assignment Algorithm**: Rejected for MVP - business rules unclear
- **Round-robin Distribution**: Rejected - doesn't account for installer capacity/location
- **Installer Self-service (all see all)**: Rejected - need admin control for quality

**Implementation**:
```typescript
// API: POST /api/leads/[id]/assign
// Body: { installerIds: string[], visibility: 'SPECIFIC' | 'ALL' }
// Lead model: { assignedTo: string[], visibility: enum }
// Marketplace query: Filter by visibility and assignedTo
```

---

### 10. Quote Approval Workflow

**Decision**: Admin approval only for "Written Quote" type, immediate for "Call/Visit"

**Rationale**:
- Written quotes are detailed proposals (admin quality control)
- Call/Visit leads are contact requests (no proposal, immediate)
- Admin reviews written quotes for compliance and quality
- Installer can resubmit if rejected

**Alternatives Considered**:
- **All Quotes Need Approval**: Rejected - slows down Call/Visit flow
- **No Approval Needed**: Rejected - quality control requirement for written quotes

**Implementation**:
```typescript
// Quote model: { leadId, installerId, content, status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' }
// Logic:
// - Call/Visit: status goes straight to APPROVED
// - Written Quote: status = SUBMITTED → Admin review → APPROVED/REJECTED
// - Homeowner sees only APPROVED quotes
```

---

## Technology Stack Confirmation

Based on constitution and research:

- **Framework**: Next.js 14.2.33 (App Router, Server Components)
- **Language**: TypeScript 5.3.3 (strict mode)
- **Database**: PostgreSQL (Supabase) + Prisma ORM 6.17.1
- **Auth**: NextAuth.js 4.24.11 (JWT, bcryptjs)
- **Styling**: Tailwind CSS 3.4.18
- **File Storage**: Cloudinary (installer documents)
- **OTP**: Custom database-backed (upgrade to Twilio later)
- **Notifications**: Polling + database (upgrade to WebSockets later)
- **Payments**: Deferred to separate Stripe integration feature

---

## Performance & Scale Targets

From spec success criteria:

- Lead submission: <3 minutes (user flow)
- Lead appears in admin dashboard: <5 seconds (90% SLA)
- Admin approval workflow: <2 minutes per lead
- Installer purchase flow: <5 minutes
- Contact details reveal: immediate (95% SLA)
- Status updates/notifications: <10 seconds (real-time)
- Audit trail: 100% of actions logged
- Concurrent submissions: 100 without degradation
- Purchase success rate: 98%+
- Chat message delivery: <5 seconds
- Written quote review: <24 hours (95% SLA)

---

## Security Considerations

- **OTP**: Rate limited (3 per hour per phone), expiry (10 min), attempts limit (3)
- **Lead Purchase**: Role verification (verified installer only, admin override)
- **Contact Details**: Hidden until purchase confirmed
- **Chat**: Only between homeowner and installer after purchase, admin oversight
- **Quote Approval**: Admin-only for written quotes
- **Audit Trail**: Immutable log, admin-readable only
- **Role Checks**: All API endpoints verify JWT role
- **Input Validation**: Server-side validation on all mutations

---

## GDPR & Compliance

- **Data Retention**: Leads archived by admin, not deleted (audit trail)
- **User Deletion**: Homeowner/installer can request deletion (admin review)
- **Audit Trail**: Full history for compliance and dispute resolution
- **Contact Privacy**: Hidden until explicit purchase action
- **Chat Monitoring**: Admin oversight for compliance (documented in ToS)

---

## Next Steps: Phase 1

All research complete. Proceed to Phase 1:
1. Generate data-model.md (database schema design)
2. Generate API contracts (OpenAPI specs)
3. Generate quickstart.md (developer guide)
4. Update agent context (Copilot instructions)
5. Re-evaluate Constitution Check post-design

---

**Research Complete**: ✅  
**Ready for Phase 1**: ✅
