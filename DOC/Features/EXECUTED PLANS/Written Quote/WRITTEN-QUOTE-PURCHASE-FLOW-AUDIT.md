# Written Quote Purchase Flow Audit Report

**Date**: December 23, 2025  
**Purpose**: Implement purchase flow for Written Quotes, mirroring bidding lead flow  
**Status**: Audit Complete - Ready for Implementation

---

## 1. Current State Analysis

### 1.1 What Exists

| Component | Status | Location |
|-----------|--------|----------|
| WrittenQuote Prisma Model | ✅ Complete | `prisma/schema.prisma` (lines 385-435) |
| Negotiation Fields | ✅ Complete | `negotiationStatus`, `agreedAmount`, `agreedAt`, `agreedBy`, `purchasedAt`, `rejectedAt`, `rejectionReason` |
| Agree API | ✅ Complete | `/api/written-quotes/[id]/agree/route.ts` |
| Revise API | ✅ Complete | `/api/written-quotes/[id]/revise/route.ts` |
| Counter API | ✅ Complete | `/api/written-quotes/[id]/counter/route.ts` |
| Homeowner Modal Done Deal | ✅ Complete | `HomeownerWrittenQuoteReviewModal.tsx` |
| Installer Modal Done Deal | ✅ Complete | `WrittenQuoteBuilderModal.tsx` |

### 1.2 What's Missing

| Component | Status | Required Action |
|-----------|--------|-----------------|
| Reject API endpoint | ❌ Missing | Create `/api/written-quotes/[id]/reject/route.ts` |
| Purchase API endpoint | ❌ Missing | Create `/api/written-quotes/[id]/purchase/route.ts` |
| Reject button (Homeowner) | ❌ Missing | Add to `HomeownerWrittenQuoteReviewModal.tsx` |
| Purchase flow (Installer) | ❌ Missing | Add to `InstallerLeadFeed.tsx` for written leads |
| Contact reveal after purchase | ❌ Missing | Show in installer lead card + homeowner dashboard |
| Notifications for reject | ❌ Missing | Notify installer when homeowner rejects |
| Notifications for purchase | ❌ Missing | Notify homeowner + admin when installer purchases |

---

## 2. Reference Pattern: Bidding Lead Purchase Flow

### 2.1 Bidding Purchase API (`/api/bids/[bidId]/purchase/route.ts`)

**Flow**:
1. Installer calls POST with bidId
2. Validates installer owns the bid
3. Validates bid status is SELECTED
4. Updates bid with `purchasedAt` timestamp
5. Updates lead status to PURCHASED with `purchasedAt`
6. Creates notifications (homeowner, installer, admin)
7. Returns full lead details with unmasked contacts

### 2.2 UI Pattern (InstallerLeadFeed.tsx lines 600-650)

**Winner Banner Pattern**:
- Trophy icon + congratulations message
- "Proceed to Payment" button
- Calls `/api/bids/{bidId}/purchase`
- On success: reloads page to show unlocked contacts

---

## 3. Implementation Plan

### 3.1 Backend Changes

#### Task 1: Create Reject API
**File**: `src/app/api/written-quotes/[id]/reject/route.ts`
- POST endpoint for homeowner to reject quote
- Updates `negotiationStatus` to 'REJECTED'
- Sets `rejectedAt` timestamp
- Stores optional `rejectionReason`
- Notifies installer

#### Task 2: Create Purchase API
**File**: `src/app/api/written-quotes/[id]/purchase/route.ts`
- POST endpoint for installer to purchase after AGREED status
- Validates quote is AGREED
- Updates `purchasedAt` timestamp
- Updates lead status to PURCHASED
- Notifies homeowner + admin
- Returns unmasked contact details

### 3.2 Frontend Changes

#### Task 3: Add Reject Button to Homeowner Modal
**File**: `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- Add "Reject" button beside "Done Deal"
- Confirmation dialog before reject
- Call reject API
- Show success/error feedback

#### Task 4: Add Purchase Flow to Installer Lead Card
**File**: `src/components/InstallerLeadFeed.tsx`
- Detect AGREED written quotes
- Show banner similar to winning bid
- "Proceed to Payment" button
- Call purchase API
- Reveal contacts on success

#### Task 5: Show Installer Contact to Homeowner After Purchase
**File**: `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- When quote is PURCHASED, show installer contact details
- Display from `installerContact` JSON field

---

## 4. Data Flow Diagram

```
Homeowner clicks "Done Deal"
         ↓
    POST /agree
         ↓
  negotiationStatus = 'AGREED'
         ↓
  Installer notified
         ↓
  Installer lead card shows "Deal Agreed - Proceed to Payment"
         ↓
    POST /purchase
         ↓
  WrittenQuote.purchasedAt = now
  Lead.status = 'PURCHASED'
         ↓
  Homeowner + Admin notified
         ↓
  Contact details revealed to both parties
```

```
Homeowner clicks "Reject"
         ↓
    POST /reject
         ↓
  negotiationStatus = 'REJECTED'
  rejectedAt = now
         ↓
  Installer notified
         ↓
  Installer sees rejection in lead card
```

---

## 5. Files to Create/Modify

| File | Action | Priority |
|------|--------|----------|
| `src/app/api/written-quotes/[id]/reject/route.ts` | CREATE | P1 |
| `src/app/api/written-quotes/[id]/purchase/route.ts` | CREATE | P1 |
| `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx` | MODIFY | P2 |
| `src/components/InstallerLeadFeed.tsx` | MODIFY | P2 |
| `src/lib/notifications/notification-service.ts` | VERIFY | P3 |

---

## 6. Testing Checklist

- [ ] Homeowner can click "Reject" → Installer gets notification
- [ ] Homeowner can click "Done Deal" → Quote becomes AGREED
- [ ] Installer sees "Deal Agreed" banner after homeowner agrees
- [ ] Installer can click "Proceed to Payment" → Quote becomes PURCHASED
- [ ] After purchase: Installer sees homeowner contact details
- [ ] After purchase: Homeowner sees installer contact details
- [ ] All notifications sent correctly

---

## 7. Conclusion

The Written Quote purchase flow can be implemented by:
1. Creating 2 new API endpoints (reject, purchase)
2. Adding UI for reject button in homeowner modal
3. Adding purchase banner in installer lead card
4. Revealing contacts after purchase

This mirrors the bidding flow pattern exactly, ensuring consistency.
