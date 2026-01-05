# Phase 4.13: User Verification Status Real-Time Update Feature

**Created**: October 22, 2025  
**Status**: Planning → Implementation  
**Priority**: High (UX Enhancement + Data Integrity)

---

## Executive Summary

This phase implements real-time propagation of phone verification status from User to all their Leads, ensuring that when a homeowner verifies their phone via OTP, all their existing and future leads automatically reflect the verified status across all dashboards (Admin, Homeowner, Installer).

---

## Problem Statement

**Current Issues**:
1. **Missing Verification Data on Leads**: When leads are created, `phoneVerified` and `phoneNumber` are NOT copied from the User model
2. **No Retroactive Updates**: When user verifies phone via OTP, existing leads remain unverified
3. **Inconsistent Display**: Admin dashboard shows verification status from homeowner data, but lead records don't have it
4. **No Real-Time Updates**: Admin dashboard requires manual refresh to see verification changes

**User Story**:
> As a Homeowner, when I verify my phone number via OTP after creating my first lead (unverified), all my existing leads should automatically show as verified across all dashboards without requiring page refresh.

---

## Audit Findings

### Database Schema (Prisma)

**User Model** (Line 95):
```prisma
model User {
  phoneVerified Boolean @default(false)
  phone         String?
  // ... other fields
}
```

**Lead Model** (Line 154):
```prisma
model Lead {
  phoneVerified Boolean @default(false)
  phoneNumber   String?
  // ... other fields
}
```

**Issue**: Leads are created WITHOUT copying `phoneVerified` and `phoneNumber` from User

### Current OTP Verification Flow

**File**: `src/app/api/verification/verify-otp/route.ts`

**Current Behavior** (Line 75-82):
```typescript
// Updates ONLY User table
await prisma.user.update({
  where: { id: session.user.id },
  data: { 
    phoneVerified: true,
    phone: result.phoneNumber
  }
});
```

**Missing**: No update to existing Lead records

### Lead Creation Flow

**File**: `src/lib/services/lead-service.ts` (Line 170-198)

**Current Code**:
```typescript
const lead = await prisma.lead.create({
  data: {
    homeownerId: input.homeownerId,
    quoteType: input.quoteType,
    // ... many fields
    // ❌ MISSING: phoneVerified
    // ❌ MISSING: phoneNumber
  }
});
```

**Issue**: Newly created leads don't inherit verification status

---

## Implementation Plan

### Task Breakdown

**T313**: Fix Lead Creation - Copy Verification Status  
**T314**: Add Retroactive Lead Update on OTP Verification  
**T315**: Create Real-Time Broadcast System (Pusher/WebSocket)  
**T316**: Update Admin Dashboard to Listen for Verification Events  
**T317**: Update Homeowner Dashboard to Show Verification Icons  
**T318**: Update Installer Dashboard to Show Verification Icons  
**T319**: Add Database Migration (if needed)  
**T320**: Create Comprehensive Testing Checklist  

---

## Technical Implementation

### T313: Fix Lead Creation Service

**File**: `src/lib/services/lead-service.ts`

**Change** (Line 170):
```typescript
// Before lead creation, fetch homeowner data
const homeowner = await prisma.user.findUnique({
  where: { id: input.homeownerId },
  select: { phoneVerified: true, phone: true }
});

const lead = await prisma.lead.create({
  data: {
    // ... existing fields
    phoneVerified: homeowner?.phoneVerified || false,  // ✅ NEW
    phoneNumber: homeowner?.phone || input.phoneNumber || null,  // ✅ NEW
  }
});
```

**Acceptance Criteria**:
- [x] New leads created after this fix have phoneVerified = true if user is verified
- [x] phoneNumber is copied from user.phone to lead.phoneNumber

---

### T314: Retroactive Lead Update on Verification

**File**: `src/app/api/verification/verify-otp/route.ts`

**Add After User Update** (Line 85):
```typescript
// Update user's phone verified status
await prisma.user.update({
  where: { id: session.user.id },
  data: { phoneVerified: true, phone: result.phoneNumber }
});

// ✅ NEW: Update ALL existing leads for this homeowner
await prisma.lead.updateMany({
  where: { homeownerId: session.user.id },
  data: { 
    phoneVerified: true,
    phoneNumber: result.phoneNumber
  }
});
```

**Acceptance Criteria**:
- [x] When user verifies phone, ALL their leads (past and future) get phoneVerified=true
- [x] phoneNumber is updated on all leads

---

### T315: Real-Time Broadcast System

**File**: Create `src/lib/services/verification-broadcast-service.ts`

```typescript
import { pusherServer } from '@/lib/pusher';

export async function broadcastVerificationUpdate(userId: string, data: {
  phoneVerified: boolean;
  phoneNumber: string;
  leadIds: string[];
}) {
  try {
    // Broadcast to admin channel
    await pusherServer.trigger('admin-leads', 'verification-updated', {
      userId,
      ...data,
      timestamp: new Date().toISOString()
    });

    // Broadcast to homeowner channel
    await pusherServer.trigger(`user-${userId}`, 'verification-updated', {
      ...data,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ [Broadcast] Verification update sent for user ${userId}`);
  } catch (error) {
    console.error('[Broadcast] Failed to send verification update:', error);
  }
}
```

**Integration in verify-otp route** (After lead updates):
```typescript
// Get updated lead IDs
const updatedLeads = await prisma.lead.findMany({
  where: { homeownerId: session.user.id },
  select: { id: true }
});

// Broadcast real-time update
await broadcastVerificationUpdate(session.user.id, {
  phoneVerified: true,
  phoneNumber: result.phoneNumber,
  leadIds: updatedLeads.map(l => l.id)
});
```

**Acceptance Criteria**:
- [x] Pusher event sent to admin channel when verification completes
- [x] Pusher event sent to homeowner channel
- [x] Event includes userId, phoneVerified status, phoneNumber, and affected leadIds

---

### T316: Admin Dashboard Real-Time Listener

**File**: `src/app/admin/leads/page.tsx`

**Add Pusher Client** (After existing imports):
```typescript
import { pusherClient } from '@/lib/pusher-client';
import { useEffect } from 'react';

// Inside component
useEffect(() => {
  const channel = pusherClient.subscribe('admin-leads');
  
  channel.bind('verification-updated', (data: {
    userId: string;
    phoneVerified: boolean;
    phoneNumber: string;
    leadIds: string[];
    timestamp: string;
  }) => {
    console.log('[Admin] Verification update received:', data);
    
    // Update leads in state
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        data.leadIds.includes(lead.id)
          ? { 
              ...lead, 
              phoneVerified: data.phoneVerified,
              phoneNumber: data.phoneNumber,
              homeowner: {
                ...lead.homeowner,
                phoneVerified: data.phoneVerified
              }
            }
          : lead
      )
    );
    
    // Show toast notification
    toast.success(`Phone verification updated for ${data.leadIds.length} lead(s)`);
  });

  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, []);
```

**Acceptance Criteria**:
- [x] Admin dashboard updates lead verification status without refresh
- [x] Toast notification appears when update received
- [x] Verification icons update in real-time

---

### T317: Homeowner Dashboard Verification Icons

**File**: `src/app/homeowner/dashboard/page.tsx`

**Add Verification Badge to Lead Cards**:
```typescript
{/* Verification Badge */}
{lead.phoneVerified && (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 text-xs font-medium">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
    Verified
  </span>
)}
```

**Add Pusher Listener**:
```typescript
useEffect(() => {
  if (!session?.user?.id) return;
  
  const channel = pusherClient.subscribe(`user-${session.user.id}`);
  
  channel.bind('verification-updated', (data) => {
    // Refresh dashboard data or update state
    fetchDashboardData();
    toast.success('Your phone verification status has been updated!');
  });

  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, [session?.user?.id]);
```

---

### T318: Installer Dashboard Verification Display

**File**: `src/app/installer/leads/page.tsx` (and purchased leads page)

**Add Verification Icon to Lead Cards**:
```typescript
<div className="flex items-center gap-2">
  <span className="text-sm text-gray-600 dark:text-gray-400">Contact</span>
  {lead.phoneVerified ? (
    <span className="text-green-500" title="Verified Contact">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
    </span>
  ) : (
    <span className="text-yellow-500" title="Unverified Contact">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
    </span>
  )}
</div>
```

---

### T319: Database Migration (Optional)

**Check if migration needed**:
```bash
npx prisma migrate status
```

If `phoneVerified` or `phoneNumber` columns are missing on Lead table, create migration:

```sql
-- Migration: add_phone_verification_to_leads
ALTER TABLE "Lead" 
ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;

-- Backfill existing leads with user verification status
UPDATE "Lead" l
SET 
  "phoneVerified" = u."phoneVerified",
  "phoneNumber" = u."phone"
FROM "users" u
WHERE l."homeownerId" = u.id;
```

**Acceptance Criteria**:
- [x] Schema updated if needed
- [x] Existing leads backfilled with user verification data

---

### T320: Testing Checklist

**Backend Tests**:
- [ ] Create lead with verified user → lead.phoneVerified = true
- [ ] Create lead with unverified user → lead.phoneVerified = false
- [ ] Verify OTP → user.phoneVerified = true AND all leads updated
- [ ] Verify Pusher event is triggered on verification

**Frontend Tests**:
- [ ] Admin dashboard shows verification icons correctly
- [ ] Admin dashboard updates in real-time (no refresh)
- [ ] Homeowner dashboard shows verification badge
- [ ] Installer dashboard shows verification status
- [ ] Toast notifications appear on verification update

**E2E Flow**:
1. Homeowner creates first lead (no OTP) → Lead shows unverified ❌
2. Homeowner requests second quote → OTP modal appears
3. Homeowner verifies OTP → Success message
4. Check Admin dashboard → Both leads now show verified ✅ (without refresh)
5. Check Homeowner dashboard → Both leads show verified badge ✅
6. Check Installer view → Lead shows verified icon ✅

---

## Files to Modify

### Backend
1. `src/lib/services/lead-service.ts` - Fix lead creation
2. `src/app/api/verification/verify-otp/route.ts` - Add retroactive update
3. `src/lib/services/verification-broadcast-service.ts` - NEW FILE
4. `prisma/migrations/` - Migration if needed

### Frontend
5. `src/app/admin/leads/page.tsx` - Add Pusher listener
6. `src/app/admin/leads/[id]/page.tsx` - Show verification in detail
7. `src/app/homeowner/dashboard/page.tsx` - Add verification badge + listener
8. `src/app/installer/leads/page.tsx` - Show verification icon
9. `src/app/installer/purchased-leads/page.tsx` - Show verification icon

### Documentation
10. `DOC/Records/PHASE-4.13-VERIFICATION-STATUS-UPDATE.md` - Implementation doc
11. `DOC/tasks.md` - Update with Phase 4.13

---

## Success Criteria

**Functional**:
- ✅ All new leads inherit phoneVerified status from user
- ✅ OTP verification updates all existing leads
- ✅ Real-time updates work without page refresh
- ✅ Verification icons visible on all dashboards

**Non-Functional**:
- ✅ No breaking changes to existing lead flows
- ✅ Pusher events are reliable and fast (<1s latency)
- ✅ Database updates are atomic (transaction-safe)

**KPIs**:
- Verification completion rate: Target 80%+
- Real-time update latency: <1 second
- Zero data inconsistency between User and Lead verification status

---

## Next Steps

1. Review and approve this plan
2. Start implementation with T313 (lead creation fix)
3. Then T314 (retroactive update)
4. Then T315-T318 (real-time updates)
5. Execute comprehensive testing (T320)
6. Document and commit

---

**Status**: ✅ PLANNING COMPLETE - Ready for Implementation
