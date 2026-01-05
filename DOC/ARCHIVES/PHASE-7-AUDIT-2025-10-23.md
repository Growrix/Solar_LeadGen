# Phase 7 - Admin Lead Assignment Audit Report
**Date**: October 23, 2025
**Branch**: 003-countdown-timer-for
**Phase**: Phase 7 - User Story 5 (Admin Manages Lead Lifecycle and Resale)

## Executive Summary

### Current State Analysis
**Status**: Phase 5 (Installer Marketplace) COMPLETE ✅
- ✅ Installers can browse PUBLIC leads via marketplace
- ✅ Self-service purchase flow implemented (Stripe bypass mode)
- ✅ Lead visibility controlled by `LeadVisibility` enum (HIDDEN, PUBLIC, PRIVATE)
- ❌ **MISSING**: Admin cannot manually assign leads to specific installers
- ❌ **MISSING**: PRIVATE visibility mode not utilized
- ❌ **MISSING**: Admin cannot bypass installer verification for assignments

### Critical Finding
**Phase 7 requires NEW assignment mechanism that coexists with existing marketplace**:
1. **Marketplace Flow** (existing): PUBLIC leads → all verified installers → self-purchase
2. **Admin Assignment Flow** (NEW): PRIVATE leads → specific installer(s) → admin-assigned

---

## 1. Database Schema Audit

### 1.1 Lead Model Analysis
**File**: `prisma/schema.prisma` (Lines 148-210)

**Existing Fields**:
```prisma
model Lead {
  id                    String            @id @default(cuid())
  homeownerId           String
  installerId           String?           // ✅ Single installer assignment
  status                LeadStatus        @default(DRAFT)
  visibility            LeadVisibility    @default(HIDDEN)
  purchaseStatus        PurchaseStatus?
  leadPrice             Float?
  approvedAt            DateTime?
  purchasedAt           DateTime?
  expiresAt             DateTime?
  // ... other fields
}
```

**Current Enums**:
```prisma
enum LeadVisibility {
  HIDDEN   // Not visible to installers
  PUBLIC   // Visible in marketplace to all
  PRIVATE  // ✅ EXISTS but not used - perfect for admin assignments
}

enum LeadStatus {
  DRAFT | PENDING | APPROVED | PURCHASED | QUOTED | 
  ACCEPTED | REJECTED | EXPIRED | CANCELLED | FLAGGED
}

enum PurchaseStatus {
  PENDING | COMPLETED | FAILED | REFUNDED
}
```

**Assessment**:
- ✅ `visibility: PRIVATE` enum value exists but unused
- ✅ `installerId` field exists for single assignment
- ❌ **MISSING**: `archivedAt DateTime?` for lead archival
- ❌ **MISSING**: Many-to-many relation for multi-installer assignments
- ❌ **MISSING**: Assignment metadata (assignedBy, assignedAt, assignmentNotes)

**Required Schema Changes**:
```prisma
model Lead {
  // Add missing fields
  archivedAt            DateTime?         // Phase 7: T087
  assignedAt            DateTime?         // NEW: Admin assignment timestamp
  assignedBy            String?           // NEW: Admin who made assignment
  assignmentNotes       String?           // NEW: Admin notes on assignment
  
  // Relations
  assignedInstallers    LeadAssignment[]  // NEW: Many-to-many assignments
}

// NEW MODEL: Track admin assignments with metadata
model LeadAssignment {
  id            String   @id @default(cuid())
  leadId        String
  installerId   String
  assignedBy    String   // Admin user ID
  assignedAt    DateTime @default(now())
  notes         String?  // Why this installer was chosen
  notified      Boolean  @default(false)
  lead          Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  installer     User     @relation("installer_assignments", fields: [installerId], references: [id])
  admin         User     @relation("admin_assignments", fields: [assignedBy], references: [id])
  
  @@unique([leadId, installerId])
  @@index([leadId])
  @@index([installerId])
  @@map("lead_assignments")
}
```

---

## 2. Current Lead Flow Analysis

### 2.1 Marketplace Flow (Phase 5 - Existing)
**Files**: 
- `src/components/InstallerMarketplace.tsx`
- `src/lib/services/lead-service.ts` (getLeads function)
- `src/lib/services/purchase-service.ts`

**Flow**:
```
1. Admin approves lead → status=APPROVED, visibility=PUBLIC
2. Lead appears in marketplace (GET /api/leads?marketplace=true)
3. Filter: visibility=PUBLIC, status=APPROVED, installerId=null
4. Verified installer purchases → installerId set, purchaseStatus=COMPLETED
5. Lead removed from marketplace → appears in "My Purchased Leads"
```

**Key Code** (`lead-service.ts` lines 307-315):
```typescript
if (marketplace) {
  whereClause.visibility = LeadVisibility.PUBLIC;
  whereClause.status = LeadStatus.APPROVED;
  whereClause.installerId = null; // Not yet purchased
}
```

### 2.2 Proposed Admin Assignment Flow (NEW)
**Flow**:
```
1. Admin assigns lead to installer(s) → visibility=PRIVATE
2. Creates LeadAssignment records with metadata
3. Installer sees assigned lead in dashboard (NEW filter)
4. Installer can view/accept without payment (bypass purchase)
5. Admin can reassign or release to marketplace (→ PUBLIC)
```

**Key Differences**:
| Feature | Marketplace | Admin Assignment |
|---------|-------------|------------------|
| Visibility | PUBLIC | PRIVATE |
| Discovery | Self-service browse | Admin selects |
| Payment | Required (Stripe) | Bypassed |
| Verification | Must be verified | Admin override |
| Multi-assign | No (first-come) | Yes (multiple installers) |

---

## 3. API Endpoint Audit

### 3.1 Existing APIs
**Lead Purchase** (`src/app/api/leads/[id]/purchase/route.ts`):
- ✅ POST initiate → Creates payment intent
- ✅ POST confirm → Assigns installer, sets purchaseStatus=COMPLETED
- ❌ No support for admin bypass

**Lead Retrieval** (`src/app/api/leads/route.ts`):
- ✅ GET with marketplace=true → PUBLIC leads only
- ✅ GET with purchased=true → installerId=userId
- ❌ No support for PRIVATE assigned leads

### 3.2 Missing APIs (Phase 7 Required)
**Assignment API** (NEW):
```typescript
// POST /api/admin/leads/[id]/assign
{
  installerIds: string[]        // Single or multiple
  visibility: 'PRIVATE'          // Always PRIVATE for assignments
  assignmentMode: 'exclusive' | 'competitive' // One vs multiple
  notifyInstallers: boolean     // Send email/notification
  assignmentNotes: string       // Why these installers
  bypassPayment: true           // Always true for admin assignments
}
```

**Resale API** (Existing Task T086):
```typescript
// POST /api/leads/[id]/resell
// - Clear installerId
// - Reset purchaseStatus to null
// - Change visibility PUBLIC or keep PRIVATE
// - Reset purchasedAt
```

**Archive API** (Existing Task T087):
```typescript
// POST /api/leads/[id]/archive
// - Set archivedAt timestamp
// - Keep all data intact
// - Remove from all feeds
```

**Assignment Removal API** (NEW):
```typescript
// DELETE /api/admin/leads/[id]/assignments/[installerId]
// - Remove specific LeadAssignment record
// - If last assignment removed → visibility=HIDDEN
```

---

## 4. UI Component Audit

### 4.1 Admin Lead Detail Page
**File**: `src/app/admin/leads/[id]/page.tsx` (914 lines)

**Existing Actions** (Lines 140-150):
- ✅ Approve lead
- ✅ Reject lead
- ✅ Set lead price
- ✅ Save admin notes
- ❌ **MISSING**: Assign to installer(s)
- ❌ **MISSING**: Resale button
- ❌ **MISSING**: Archive button
- ❌ **MISSING**: Reset timer

**Required UI Additions**:
1. **Installer Assignment Section**:
   - Multi-select dropdown (all installers, filterable)
   - Individual installer cards with "Assign" button
   - Group assignment ("All Verified Installers")
   - Assignment history table
   - Remove assignment button per installer

2. **Lead Lifecycle Actions**:
   - Resale button (if already purchased)
   - Archive button (with confirmation modal)
   - Timer reset button
   - Release to marketplace button (PRIVATE → PUBLIC)

### 4.2 Installer Dashboard
**Files**: 
- `src/components/InstallerMarketplace.tsx` (marketplace leads)
- `src/components/InstallerPurchasedLeads.tsx` (purchased leads)
- **MISSING**: Assigned leads component

**Required New Component**:
```tsx
// src/components/InstallerAssignedLeads.tsx
// - Shows PRIVATE leads where LeadAssignment.installerId = userId
// - No purchase button (assigned for free)
// - "Accept Assignment" button
// - Assignment notes from admin visible
// - Notification badge for new assignments
```

**Dashboard Integration**:
- Add "Assigned Leads" nav item (between Marketplace and Purchased)
- Badge count for unnotified assignments
- Filter for exclusive vs competitive assignments

---

## 5. Service Layer Audit

### 5.1 Lead Service
**File**: `src/lib/services/lead-service.ts`

**Existing Functions**:
- ✅ `createLead()` - Create new lead
- ✅ `getLeads()` - Get leads with filters
- ✅ `getHomeownerLeadSummary()` - Homeowner dashboard
- ❌ **MISSING**: `assignLeadToInstallers()`
- ❌ **MISSING**: `removeLeadAssignment()`
- ❌ **MISSING**: `getAssignedLeads()`
- ❌ **MISSING**: `resellLead()`
- ❌ **MISSING**: `archiveLead()`
- ❌ **MISSING**: `resetLeadTimer()`

**Required New Functions**:
```typescript
// Phase 7 Lead Assignment Service
async function assignLeadToInstallers(input: {
  leadId: string;
  installerIds: string[];
  assignedBy: string;
  notes?: string;
  mode: 'exclusive' | 'competitive';
}): Promise<{success: boolean; assignments: LeadAssignment[]}> {
  // 1. Validate lead exists and is assignable
  // 2. Update lead visibility to PRIVATE
  // 3. Create LeadAssignment records
  // 4. Send notifications to installers
  // 5. Create audit log
  // 6. Return assignment records
}

async function getInstallerAssignedLeads(installerId: string) {
  // Get leads where LeadAssignment.installerId = installerId
  // Include assignment metadata (notes, assignedBy, assignedAt)
  // Filter by notified status
}

async function resellLead(leadId: string, adminId: string) {
  // Clear installerId, purchaseStatus, purchasedAt
  // Keep assignedAt/assignedBy for history
  // Optionally set visibility back to PUBLIC
  // Create audit log
}

async function archiveLead(leadId: string, adminId: string, reason?: string) {
  // Set archivedAt timestamp
  // Keep all data intact (soft delete)
  // Create audit log
}
```

### 5.2 Purchase Service
**File**: `src/lib/services/purchase-service.ts`

**Current Behavior**:
- Requires payment for all purchases
- Only works with PUBLIC leads
- Sets purchaseStatus=COMPLETED after payment

**Required Changes**:
```typescript
// Add admin bypass mode
async function confirmPurchase(input: ConfirmPurchaseInput & { 
  adminAssigned?: boolean  // NEW: Skip payment if true
}) {
  if (input.adminAssigned) {
    // Skip payment verification
    // Set installerId directly
    // Don't set purchaseStatus (keep null for admin assignments)
  } else {
    // Existing Stripe flow
  }
}
```

---

## 6. User Flows

### 6.1 Admin Assigns Lead to Single Installer
```
1. Admin navigates to /admin/leads/[id]
2. Clicks "Assign to Installer" button
3. Modal opens with installer search/dropdown
4. Selects installer, adds notes (optional)
5. Clicks "Assign" → POST /api/admin/leads/[id]/assign
6. Lead visibility → PRIVATE, LeadAssignment created
7. Installer receives notification
8. Installer sees lead in "Assigned Leads" tab
9. Installer clicks "Accept Assignment" (no payment)
10. installerId set, lead no longer available to others
```

### 6.2 Admin Assigns Lead to Multiple Installers (Competitive)
```
1. Admin selects multiple installers or "All Verified"
2. Sets mode='competitive' in assignment
3. All selected installers see lead in "Assigned Leads"
4. First installer to accept → installerId set
5. Lead removed from other installers' views
6. Remaining installers notified "Lead no longer available"
```

### 6.3 Admin Resells Purchased Lead
```
1. Admin views purchased lead (installerId not null)
2. Clicks "Resell Lead" button
3. Confirmation modal: "Remove current installer?"
4. On confirm → POST /api/leads/[id]/resell
5. installerId cleared, purchaseStatus reset
6. Lead either:
   a) Returns to PUBLIC marketplace (all installers)
   b) Reassigned PRIVATE to different installer
```

### 6.4 Admin Archives Old Lead
```
1. Admin views expired/rejected lead
2. Clicks "Archive Lead" button
3. Confirmation: "Lead will be removed from all views"
4. On confirm → POST /api/leads/[id]/archive
5. archivedAt set, lead hidden from feeds
6. Admin can view in "Archived Leads" filter
7. Admin can unarchive by clearing archivedAt
```

---

## 7. Integration Points

### 7.1 Notification System
**File**: `src/lib/services/notification-service.ts`

**Required Notifications**:
- ✅ LEAD_PURCHASED (existing)
- ✅ LEAD_APPROVED (existing)
- ❌ **NEW**: LEAD_ASSIGNED_TO_INSTALLER
- ❌ **NEW**: LEAD_REASSIGNED
- ❌ **NEW**: LEAD_ARCHIVED
- ❌ **NEW**: ASSIGNMENT_REMOVED

### 7.2 Audit Logging
**File**: `src/lib/services/audit-logger.ts`

**Required Audit Actions**:
- ✅ LEAD_APPROVED (existing)
- ✅ LEAD_PURCHASED (existing)
- ❌ **NEW**: LEAD_ASSIGNED
- ❌ **NEW**: LEAD_RESOLD
- ❌ **NEW**: LEAD_ARCHIVED
- ❌ **NEW**: TIMER_RESET
- ❌ **NEW**: ASSIGNMENT_REMOVED

### 7.3 Installer Verification
**Current**: `user.installerVerified` boolean field

**Admin Override Requirement**:
- Admin can assign to unverified installer
- Assigned lead bypasses verification check
- Normal marketplace still requires verification

**Implementation**:
```typescript
// In installer assignment API
if (assignedByAdmin) {
  // Skip installer verification check
  allowAccess = true;
} else if (user.installerVerified) {
  // Normal marketplace flow
  allowAccess = true;
}
```

---

## 8. Phase 7 Gap Analysis

### 8.1 Missing Database Components
1. ❌ `Lead.archivedAt` field
2. ❌ `Lead.assignedAt` field
3. ❌ `Lead.assignedBy` field
4. ❌ `Lead.assignmentNotes` field
5. ❌ `LeadAssignment` model (many-to-many)

**Priority**: P0 (Critical - blocks all Phase 7 work)
**Migration Required**: Yes

### 8.2 Missing API Endpoints
1. ❌ POST `/api/admin/leads/[id]/assign` (T097 equivalent)
2. ❌ DELETE `/api/admin/leads/[id]/assignments/[installerId]` (NEW)
3. ❌ POST `/api/leads/[id]/resell` (T086)
4. ❌ POST `/api/leads/[id]/archive` (T087)
5. ❌ POST `/api/leads/[id]/reset-timer` (T088)
6. ❌ POST `/api/leads/[id]/unarchive` (NEW)
7. ❌ GET `/api/leads?assigned=true` (installer view)

**Priority**: P0 (Critical)

### 8.3 Missing UI Components
1. ❌ Installer assignment section in admin lead detail
2. ❌ Installer selector/search component
3. ❌ Assignment history table
4. ❌ Resale/Archive/Reset buttons
5. ❌ InstallerAssignedLeads component
6. ❌ "Assigned Leads" nav item in dashboard

**Priority**: P1 (High)

### 8.4 Missing Service Functions
1. ❌ `assignLeadToInstallers()`
2. ❌ `removeLeadAssignment()`
3. ❌ `getInstallerAssignedLeads()`
4. ❌ `resellLead()`
5. ❌ `archiveLead()`
6. ❌ `resetLeadTimer()`

**Priority**: P0 (Critical)

---

## 9. Recommendations

### 9.1 Coexistence Strategy
**The marketplace and admin assignment systems MUST coexist**:

| System | Visibility | Discovery | Payment | Verification |
|--------|-----------|-----------|---------|--------------|
| Marketplace | PUBLIC | Self-service | Required | Required |
| Admin Assign | PRIVATE | Admin selects | Bypassed | Bypassed |

**Implementation Approach**:
1. **DO NOT** modify existing marketplace logic
2. **ADD** new PRIVATE flow for admin assignments
3. **EXTEND** getLeads() with `assigned=true` filter
4. **CREATE** separate UI components for assignments

### 9.2 Phase 7 Task Sequence (Updated)

**Pre-Phase (Schema Migration)**:
- [ ] T000-PH7: Add `archivedAt`, `assignedAt`, `assignedBy`, `assignmentNotes` to Lead model
- [ ] T001-PH7: Create `LeadAssignment` model with relations
- [ ] T002-PH7: Run `npx prisma migrate dev --name phase7-admin-assignments`
- [ ] T003-PH7: Update Prisma client types

**Backend Services** (T086-T088 Enhanced):
- [ ] T086-Enhanced: Create `assignLeadToInstallers()` service function
- [ ] T087-Enhanced: Create `resellLead()` service function (was just API)
- [ ] T088-Enhanced: Create `archiveLead()` service function (was just API)
- [ ] T089-NEW: Create `removeLeadAssignment()` service function
- [ ] T090-NEW: Create `getInstallerAssignedLeads()` service function
- [ ] T091-NEW: Create `resetLeadTimer()` service function

**API Endpoints** (T086-T091 + NEW):
- [ ] T092: POST `/api/admin/leads/[id]/assign` (bulk or single)
- [ ] T093: DELETE `/api/admin/leads/[id]/assignments/[installerId]`
- [ ] T094: POST `/api/leads/[id]/resell` (use service)
- [ ] T095: POST `/api/leads/[id]/archive` (use service)
- [ ] T096: POST `/api/leads/[id]/unarchive` (clear archivedAt)
- [ ] T097: POST `/api/leads/[id]/reset-timer` (extend expiresAt)
- [ ] T098: PATCH `/api/leads` - add `assigned=true` filter support

**UI Components** (T099-T108 + NEW):
- [ ] T099: Create `InstallerSelectorModal` component (search, multi-select)
- [ ] T100: Create `AssignmentHistoryTable` component (show assignments)
- [ ] T101: Create `InstallerAssignedLeads` component (installer view)
- [ ] T102: Add assignment section to admin lead detail page
- [ ] T103: Add Resale/Archive/Reset buttons to admin lead detail
- [ ] T104: Add "Assigned Leads" nav item to installer dashboard
- [ ] T105: Update `getLeads()` in lead-service to handle assigned filter
- [ ] T106: Create assignment notification templates
- [ ] T107: Add assignment badge count to installer nav
- [ ] T108: Create assignment acceptance flow (installer side)

**Integration & Testing** (T109-T115):
- [ ] T109: Implement audit logging for all assignment actions
- [ ] T110: Implement notifications for assignments
- [ ] T111: Test admin assigns to single installer
- [ ] T112: Test admin assigns to multiple installers (competitive)
- [ ] T113: Test lead resale flow
- [ ] T114: Test lead archive/unarchive
- [ ] T115: Test timer reset functionality

### 9.3 Breaking Changes Prevention
**CRITICAL**: Do not modify these existing systems:
- ✅ Marketplace flow (`GET /api/leads?marketplace=true`)
- ✅ Purchase flow (`POST /api/leads/[id]/purchase`)
- ✅ PUBLIC visibility behavior
- ✅ Verification requirements for marketplace

**Safe Extension Points**:
- ✅ Add PRIVATE visibility handling
- ✅ Add `assigned=true` query parameter
- ✅ Add admin bypass in purchase service
- ✅ Add new assignment APIs (separate routes)

---

## 10. Updated Phase 7 Implementation Plan

### 10.1 Estimated Timeline
- **Schema Migration**: 2 hours
- **Backend Services**: 8 hours
- **API Endpoints**: 6 hours
- **UI Components**: 10 hours
- **Integration & Testing**: 6 hours
- **Total**: ~32 hours (4 days)

### 10.2 Success Criteria
- [ ] Admin can assign lead to single installer via UI
- [ ] Admin can assign lead to multiple installers (group)
- [ ] Admin can assign to all verified installers
- [ ] Admin can assign to unverified installer (bypass)
- [ ] Installer sees assigned leads in separate tab
- [ ] Installer can accept assignment without payment
- [ ] Admin can remove assignment from specific installer
- [ ] Admin can resell purchased lead
- [ ] Admin can archive/unarchive leads
- [ ] Admin can reset lead timer (extend expiresAt)
- [ ] All actions logged to audit trail
- [ ] All actions trigger notifications
- [ ] Marketplace flow unchanged and working
- [ ] No regressions in Phase 1-6 functionality

### 10.3 Technical Debt Notes
1. Consider future enhancement: LeadAssignment status (PENDING, ACCEPTED, REJECTED)
2. Consider future enhancement: Assignment expiry (auto-remove if not accepted)
3. Consider future enhancement: Assignment analytics (acceptance rate per installer)
4. Consider migration path from single `installerId` to many-to-many for historical data

---

## 11. Conclusion

**Current State**: Phase 5 marketplace is complete and functional. Installers can self-purchase PUBLIC leads.

**Phase 7 Requirement**: Add parallel admin-controlled assignment system using PRIVATE visibility.

**Key Implementation**: 
- New `LeadAssignment` model for many-to-many relationships
- Separate UI components for admin assignment interface
- Extended API with assignment-specific endpoints
- Coexistence with marketplace (do not modify existing flows)

**Risk Level**: MEDIUM
- Schema migration required (breaking if not careful)
- Many new components and APIs
- Must maintain existing marketplace functionality

**Recommendation**: ✅ PROCEED with updated task list
- Follow sequential task order
- Test marketplace after each change
- Use feature flags if needed for gradual rollout

---

**Next Steps**:
1. Review updated task list with user
2. Get approval for schema changes
3. Begin Pre-Phase schema migration
4. Implement backend services first
5. Build APIs with bypass mode
6. Create UI components last
7. Comprehensive testing before commit
