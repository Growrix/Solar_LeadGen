# Data Model: Lead Journey & Life Cycle

**Feature**: Lead Journey & Life Cycle  
**Branch**: 002-lead-journey-life  
**Date**: 2025-10-14  
**Phase**: 1 - Design

## Overview

This document defines the database schema for the Lead Journey & Life Cycle feature. All models follow Prisma conventions and the project constitution. Models are designed to support full audit trail, role-based access, and GDPR compliance.

Alignment notes (2025-10-16):
- User model includes `leadSubmissionLimit Int @default(5)` used for homeowner quotas.
- Lead model uses `QuoteType` enum (CALL_VISIT, WRITTEN_QUOTE) consistent with implementation.

---

## Entity Relationship Diagram

```
User (existing)
  ├─→ Lead (1:many) - homeownerId
  ├─→ Lead (1:many) - purchasedBy (installer)
  ├─→ PhoneVerification (1:many)
  ├─→ InstallDocument (1:many)
  ├─→ ChatMessage (1:many) - senderId
  ├─→ Quote (1:many) - installerId
  ├─→ LeadFeedback (1:many) - installerId
  ├─→ AuditLog (1:many) - userId
  └─→ Notification (1:many) - userId

Lead
  ├─→ ChatMessage (1:many)
  ├─→ Quote (1:many)
  ├─→ LeadFeedback (1:many)
  └─→ AuditLog (1:many)

Settings (singleton)
  └─→ Global pricing configuration
```

---

## New Models

### 1. Lead

**Purpose**: Represents a quote request from a homeowner

```prisma
model Lead {
  id                String      @id @default(cuid())
  
  // Homeowner Info
  homeownerId       String
  homeowner         User        @relation("HomeownerLeads", fields: [homeownerId], references: [id], onDelete: Cascade)
  
  // Lead Details
  quoteType         QuoteType   // CALL_VISIT or WRITTEN_QUOTE
  propertyAddress   String
  propertyPostcode  String
  propertyType      String?     // e.g., "Detached", "Semi-detached"
  roofType          String?
  roofArea          Float?      // sq meters
  energyUsage       Float?      // kWh per year
  budget            Float?      // estimated budget
  notes             String?     @db.Text
  
  // Status & Lifecycle
  status            LeadStatus  @default(NEW)
  priority          Boolean     @default(false) // "hot" lead flag
  visibility        Visibility  @default(ALL)   // ALL or SPECIFIC
  assignedTo        String[]    // Array of installer user IDs
  
  // Pricing
  customPrice       Decimal?    @db.Decimal(10, 2)
  
  // Purchase Info
  purchasedBy       String?
  purchasedByUser   User?       @relation("PurchasedLeads", fields: [purchasedBy], references: [id], onDelete: SetNull)
  purchasedAt       DateTime?
  purchaseAmount    Decimal?    @db.Decimal(10, 2)
  purchaseStatus    PurchaseStatus @default(PENDING)
  
  // Verification Badge (from homeowner)
  homeownerVerified Boolean     @default(false)
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  archivedAt        DateTime?
  
  // Relations
  chatMessages      ChatMessage[]
  quotes            Quote[]
  feedback          LeadFeedback[]
  auditLogs         AuditLog[]
  
  @@index([homeownerId])
  @@index([status])
  @@index([purchasedBy])
  @@index([propertyPostcode])
  @@index([createdAt])
  @@map("leads")
}

enum QuoteType {
  CALL_VISIT
  WRITTEN_QUOTE
}

enum LeadStatus {
  NEW
  PENDING
  IN_PROGRESS
  DEAL_CLOSED
  VOID
  NO_RESPONSE
  ARCHIVED
}

enum Visibility {
  ALL         // Visible to all verified installers
  SPECIFIC    // Visible only to assignedTo installers
}

enum PurchaseStatus {
  PENDING     // Purchase intent created, payment pending
  PAID        // Payment confirmed
  REFUNDED    // Payment refunded
  FAILED      // Payment failed
}
```

**Validation Rules**:
- `quoteType` is required
- `propertyAddress` and `propertyPostcode` are required
- `customPrice` overrides global pricing if set
- `purchasedBy` can only be set once (unless admin resells)
- `status` transitions must follow state machine (validated in API)
- `assignedTo` is empty array if `visibility` is ALL
- `homeownerVerified` copied from User verification status at creation

---

### 2. PhoneVerification

**Purpose**: Stores OTP codes for phone verification

```prisma
model PhoneVerification {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  phone       String
  code        String    // 6-digit OTP
  expiresAt   DateTime  // 10 minutes from creation
  attempts    Int       @default(0) // Max 3 attempts
  verified    Boolean   @default(false)
  
  createdAt   DateTime  @default(now())
  verifiedAt  DateTime?
  
  @@index([userId])
  @@index([phone])
  @@index([expiresAt])
  @@map("phone_verifications")
}
```

**Validation Rules**:
- `code` is 6 digits (100000-999999)
- `expiresAt` is 10 minutes from creation
- `attempts` cannot exceed 3
- `verified` set to true on successful verification
- Rate limit: Max 3 OTP requests per phone per hour (enforced in API)

---

### 3. InstallDocument

**Purpose**: Stores installer verification documents (certifications, licenses)

```prisma
model InstallDocument {
  id          String            @id @default(cuid())
  installerId String
  installer   User              @relation(fields: [installerId], references: [id], onDelete: Cascade)
  
  type        DocumentType
  url         String            // Cloudinary/S3 URL
  fileName    String
  fileSize    Int               // bytes
  status      DocumentStatus    @default(PENDING)
  
  rejectionReason String?        @db.Text
  reviewedBy      String?
  reviewedAt      DateTime?
  
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  @@index([installerId])
  @@index([status])
  @@map("install_documents")
}

enum DocumentType {
  CERTIFICATION
  LICENSE
  INSURANCE
  OTHER
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**Validation Rules**:
- `url` must be valid HTTPS URL
- `fileSize` max 10MB (enforced in upload)
- `status` can only be changed by admin
- `rejectionReason` required if status is REJECTED

---

### 4. ChatMessage

**Purpose**: Internal chat between homeowner and installer

```prisma
model ChatMessage {
  id        String    @id @default(cuid())
  leadId    String
  lead      Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  senderId  String
  sender    User      @relation(fields: [senderId], references: [id], onDelete: Cascade)
  
  content   String    @db.Text
  read      Boolean   @default(false)
  readAt    DateTime?
  
  createdAt DateTime  @default(now())
  
  @@index([leadId])
  @@index([senderId])
  @@index([createdAt])
  @@map("chat_messages")
}
```

**Validation Rules**:
- `content` max 2000 characters
- `senderId` must be homeowner or installer of lead
- Chat only available after lead is purchased
- Admin can view all chats (no direct participation)

---

### 5. Quote

**Purpose**: Installer's quote/proposal submission

```prisma
model Quote {
  id          String      @id @default(cuid())
  leadId      String
  lead        Lead        @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  installerId String
  installer   User        @relation(fields: [installerId], references: [id], onDelete: Cascade)
  
  // Quote Details
  amount      Decimal     @db.Decimal(10, 2)
  description String      @db.Text
  attachments String[]    // Array of file URLs
  validUntil  DateTime?
  
  // Status & Approval
  status      QuoteStatus @default(DRAFT)
  
  reviewedBy  String?
  reviewedAt  DateTime?
  rejectionReason String?  @db.Text
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([leadId])
  @@index([installerId])
  @@index([status])
  @@map("quotes")
}

enum QuoteStatus {
  DRAFT           // Installer working on it
  SUBMITTED       // Submitted for review (Written Quote) or to homeowner (Call/Visit)
  APPROVED        // Admin approved (Written Quote only)
  REJECTED        // Admin rejected (Written Quote only)
}
```

**Validation Rules**:
- `amount` must be positive
- `description` required, max 5000 characters
- `attachments` max 5 files
- For CALL_VISIT leads: status goes straight to APPROVED
- For WRITTEN_QUOTE leads: status SUBMITTED → admin review → APPROVED/REJECTED

---

### 6. LeadFeedback

**Purpose**: Installer feedback on lead quality

```prisma
model LeadFeedback {
  id          String   @id @default(cuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  installerId String
  installer   User     @relation(fields: [installerId], references: [id], onDelete: Cascade)
  
  rating      Int      // 1-5 stars
  comment     String?  @db.Text
  
  createdAt   DateTime @default(now())
  
  @@unique([leadId, installerId]) // One feedback per installer per lead
  @@index([leadId])
  @@index([installerId])
  @@map("lead_feedback")
}
```

**Validation Rules**:
- `rating` must be 1-5
- `comment` optional, max 1000 characters
- Only one feedback per installer per lead
- Can only submit after purchasing lead

---

### 7. AuditLog

**Purpose**: Immutable audit trail for all lead actions

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  action    AuditAction
  data      Json     // Flexible JSON for action-specific metadata
  
  createdAt DateTime @default(now())
  
  @@index([leadId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}

enum AuditAction {
  CREATED
  APPROVED
  REJECTED
  PURCHASED
  STATUS_CHANGED
  CHAT_SENT
  QUOTE_SUBMITTED
  QUOTE_APPROVED
  QUOTE_REJECTED
  ASSIGNED
  RESOLD
  ARCHIVED
  PRICE_UPDATED
}
```

**Validation Rules**:
- Records are immutable (never updated or deleted)
- `data` JSON stores old/new values for changes
- All API mutations must create audit log entry
- Admin can query and view all audit logs

---

### 8. Notification

**Purpose**: User notifications for events

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type      NotificationType
  title     String
  message   String           @db.Text
  data      Json?            // Event-specific data (e.g., leadId)
  
  read      Boolean          @default(false)
  readAt    DateTime?
  
  createdAt DateTime         @default(now())
  
  @@index([userId])
  @@index([read])
  @@index([createdAt])
  @@map("notifications")
}

enum NotificationType {
  LEAD_CREATED
  LEAD_APPROVED
  LEAD_PURCHASED
  LEAD_STATUS_CHANGED
  CHAT_MESSAGE
  QUOTE_SUBMITTED
  QUOTE_APPROVED
  QUOTE_REJECTED
}
```

**Validation Rules**:
- `title` max 100 characters
- `message` max 500 characters
- `data` JSON stores event context (e.g., leadId, quoteId)
- Notifications deleted after 30 days (future cleanup job)

---

### 9. Settings

**Purpose**: Global application settings (singleton)

```prisma
model Settings {
  id                        String   @id @default(cuid())
  
  // Lead Pricing
  globalCallVisitPrice      Decimal  @default(50.00) @db.Decimal(10, 2)
  globalWrittenQuotePrice   Decimal  @default(75.00) @db.Decimal(10, 2)
  
  // Lead Limits
  defaultLeadLimit          Int      @default(5)
  
  // Auto-approval
  autoApproveLeads          Boolean  @default(false)
  
  updatedAt                 DateTime @updatedAt
  
  @@map("settings")
}
```

**Validation Rules**:
- Only one Settings record exists (enforced in API)
- Prices must be positive
- `defaultLeadLimit` must be >= 1
- Admin-only access

---

## Updates to Existing Models

### User Model

Add new fields and relations:

```prisma
model User {
  // ... existing fields ...
  
  // New fields for verification
  phoneNumber         String?
  phoneVerified       Boolean         @default(false)
  phoneVerifiedAt     DateTime?
  accountVerified     Boolean         @default(false) // Installer: docs approved
  accountVerifiedAt   DateTime?
  leadRequestCount    Int             @default(0)     // Homeowner: track requests
  leadRequestLimit    Int             @default(5)     // Homeowner: max requests
  
  // New relations
  homeownerLeads      Lead[]          @relation("HomeownerLeads")
  purchasedLeads      Lead[]          @relation("PurchasedLeads")
  phoneVerifications  PhoneVerification[]
  installDocuments    InstallDocument[]
  chatMessages        ChatMessage[]
  quotes              Quote[]
  leadFeedback        LeadFeedback[]
  auditLogs           AuditLog[]
  notifications       Notification[]
}
```

---

## Migration Strategy

1. **Create new models**: Lead, PhoneVerification, InstallDocument, ChatMessage, Quote, LeadFeedback, AuditLog, Notification, Settings
2. **Update User model**: Add new fields and relations
3. **Seed Settings**: Create initial Settings record with defaults
4. **Indexes**: All indexes defined in models above
5. **Test migrations**: Run on development database first

---

## Data Validation Summary

| Model | Key Validations |
|-------|----------------|
| Lead | Status transitions, pricing logic, purchase rules |
| PhoneVerification | 6-digit OTP, 10-min expiry, max 3 attempts, rate limiting |
| InstallDocument | File size < 10MB, admin-only status changes |
| ChatMessage | Max 2000 chars, post-purchase only, role check |
| Quote | Positive amount, approval flow for written quotes |
| LeadFeedback | Rating 1-5, one per installer per lead |
| AuditLog | Immutable, all mutations logged |
| Notification | Read/unread tracking, 30-day retention |
| Settings | Singleton, positive prices, admin-only |

---

**Data Model Complete**: ✅  
**Ready for API Contracts**: ✅
