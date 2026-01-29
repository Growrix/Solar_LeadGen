# Phase 13H: Bidding Payment Flow Enhancement - Audit Report

**Feature**: Bidding Winner Payment Flow  
**Date**: December 7, 2025  
**Status**: Planning Phase  
**Priority**: P0 - Critical (Blocks revenue)

---

## 🎯 Objective

Fix the bidding winner payment flow to ensure:
1. Winner sees lead in feed with trophy icon and payment CTA (not moved to purchased)
2. Homeowner contact details remain locked until payment
3. Lead moves to "Purchased Leads" only after payment completion
4. Loser notification message is polite and professional

---

## 🔍 Current State Analysis

### Issue 1: Loser Notification Message

**Current Message** (Backend):
```typescript
// src/app/api/bids/[bidId]/select/route.ts (line 202-210)
message: `Thank you for your bid on ${leadLocation}. The homeowner has selected another installer for this project. We appreciate your participation and encourage you to continue bidding on future leads.`
```

**Current UI Display** (Frontend):
```tsx
// src/components/InstallerLeadFeed.tsx (line 586)
"? This lead has been purchased by another installer"
```

**Problem**: Frontend shows harsh "purchased by another installer" message (red with lock icon), not the polite backend message.

**Expected**: "The bid was won by another installer. Better luck next time!" or similar polite message.

---

### Issue 2: Lead Status Flow (Critical Bug)

**Current Flow** (WRONG):
```typescript
// src/app/api/bids/[bidId]/select/route.ts (line 143-149)
await tx.lead.update({
  where: { id: bid.leadId },
  data: {
    status: 'PURCHASED', // ❌ WRONG - Set immediately without payment
    installerId: bid.installerId,
    purchasedAt: new Date() // ❌ WRONG - Timestamp before payment
  }
});
```

**Problem**: Lead marked as PURCHASED immediately when winner selected, before payment.

**Expected Flow**:
```
1. Homeowner selects winner
   → Lead status: 'APPROVED' (no change)
   → Bid status: 'SELECTED' (winner)
   → Bid status: 'REJECTED' (losers)
   
2. Winner sees lead in feed
   → Trophy icon displayed
   → "You won! Proceed to payment to unlock contact details"
   → Contact details: LOCKED (hidden)
   → Lead remains in "Lead Feed" (not moved to purchased)

3. Winner clicks "Proceed to Payment"
   → Redirects to payment page
   → Processes payment (Stripe/existing flow)
   
4. Payment successful
   → Lead status: 'PURCHASED'
   → purchasedAt: Current timestamp
   → Contact details: UNLOCKED (visible)
   → Lead moves to "Purchased Leads" section
```

---

### Issue 3: Contact Details Premature Reveal

**Current Behavior**:
- When bid selected as winner, lead status → 'PURCHASED'
- Frontend checks: `if (lead.status === 'PURCHASED')` → Show contact details
- Result: Homeowner name, email, phone visible WITHOUT payment

**Expected Behavior**:
- Contact details should only reveal AFTER payment
- Need new status or flag to track "winner selected but not paid yet"

---

## 🗂️ Files Requiring Changes

### 1. Database Schema (`prisma/schema.prisma`)

**Current Bid Status** (line 357):
```prisma
status String @default("SUBMITTED") // SUBMITTED | SELECTED | REJECTED
```

**Problem**: No status for "winner selected, awaiting payment"

**Solution**: Add new status or use combination:
- Option A: Add `SELECTED_UNPAID` status
- Option B: Use `SELECTED` + check `purchasedAt === null`
- **Recommended**: Option B (no schema change needed)

---

### 2. Backend API (`src/app/api/bids/[bidId]/select/route.ts`)

**Changes Needed**:

**Line 143-149**: Remove premature PURCHASED status
```typescript
// ❌ REMOVE THIS:
await tx.lead.update({
  where: { id: bid.leadId },
  data: {
    status: 'PURCHASED', // Delete this line
    installerId: bid.installerId,
    purchasedAt: new Date() // Delete this line
  }
});

// ✅ REPLACE WITH:
await tx.lead.update({
  where: { id: bid.leadId },
  data: {
    installerId: bid.installerId, // Track winner
    // status remains 'APPROVED'
    // purchasedAt remains null until payment
  }
});
```

**Line 178-185**: Update winner notification message
```typescript
// Current:
message: `The homeowner at ${leadLocation} has selected your bid! Proceed to payment to unlock full contact details and begin installation.`

// ✅ GOOD - Already mentions payment requirement
```

**Line 202-210**: Loser notification (backend is fine)
```typescript
// ✅ CURRENT MESSAGE IS POLITE - Keep it
message: `Thank you for your bid on ${leadLocation}. The homeowner has selected another installer for this project. We appreciate your participation and encourage you to continue bidding on future leads.`
```

---

### 3. Frontend Lead Card (`src/components/InstallerLeadFeed.tsx`)

**Current Loser Banner** (line 581-591):
```tsx
{isPurchasedByAnother && (
  <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
    <div className="flex items-center space-x-2">
      <LockIcon className="h-5 w-5 text-error" />
      <p className="text-body text-error">
        ? This lead has been purchased by another installer
      </p>
    </div>
  </div>
)}
```

**Changes Needed**:
1. Update message text to match polite backend version
2. Change color from error (red) to warning (yellow/orange)
3. Remove lock icon, use info icon instead

**New Winner Banner Needed**:
```tsx
{isWinner && !isPaid && (
  <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
    <div className="flex items-center space-x-2">
      <TrophyIcon className="h-6 w-6 text-warning" />
      <div>
        <p className="text-h6 text-success font-semibold">
          🎉 Congratulations! You won this bid!
        </p>
        <p className="text-body text-muted-foreground">
          Proceed to payment to unlock homeowner contact details.
        </p>
      </div>
    </div>
  </div>
)}
```

**Logic to Determine States**:
```typescript
// Check if this installer won
const myBid = lead.bids?.find(b => b.installerId === installer.id);
const isWinner = myBid?.status === 'SELECTED';
const isPaid = lead.status === 'PURCHASED' && lead.purchasedAt !== null;

// Check if another installer won
const isPurchasedByAnother = lead.status === 'PURCHASED' && lead.installerId !== installer.id;

// OR if bid is REJECTED
const isLoser = myBid?.status === 'REJECTED';
```

---

### 4. Contact Details Locking Logic

**Current Logic** (various files):
```typescript
// Checks lead.status === 'PURCHASED' to show contacts
if (lead.status === 'PURCHASED') {
  // Show name, email, phone
}
```

**New Logic**:
```typescript
// Must check BOTH status AND payment
const canSeeContacts = lead.status === 'PURCHASED' && lead.purchasedAt !== null;

if (canSeeContacts) {
  // Show name, email, phone
} else if (isWinner && !lead.purchasedAt) {
  // Show "Unlock with Payment" button
} else {
  // Show locked icon
}
```

---

### 5. Payment Flow (Existing - May Need Updates)

**File**: `src/app/api/leads/[id]/purchase/route.ts` (or similar)

**Changes Needed**:
- After successful payment, update:
  - `lead.status = 'PURCHASED'`
  - `lead.purchasedAt = new Date()`
  - `bid.purchasedAt = new Date()` (for winner's bid)

**Current Payment Flow** (Need to verify):
- Installer dashboard → "Proceed to Payment" button
- Redirects to payment page with lead ID
- Payment processed (Stripe?)
- On success: Update database
- Redirect to purchased leads page

---

## 📊 Data Model Review

### Lead Model (schema.prisma line 142-214)

**Relevant Fields**:
```prisma
model Lead {
  status       LeadStatus @default(NEW)
  installerId  String?    // Winner installer ID (set when selected)
  purchasedAt  DateTime?  // Timestamp when payment completed
  // ...
  bids Bid[] // All bids for this lead
}

enum LeadStatus {
  NEW
  APPROVED
  PURCHASED  // Only set AFTER payment
  REJECTED
  EXPIRED
  CLOSED
}
```

**Status Flow**:
```
NEW → (Admin approves) → APPROVED → (Winner selected) → APPROVED (unchanged)
     → (Winner pays) → PURCHASED
```

---

### Bid Model (schema.prisma line 339-383)

**Relevant Fields**:
```prisma
model Bid {
  status       String    @default("SUBMITTED") // SUBMITTED | SELECTED | REJECTED
  selectedAt   DateTime? // When homeowner selected this bid
  purchasedAt  DateTime? // When installer paid for this bid
  rejectedAt   DateTime? // When bid was rejected (loser)
}
```

**Status Flow**:
```
SUBMITTED → (Homeowner selects) → SELECTED (winner)
         → (Homeowner selects other) → REJECTED (loser)

SELECTED → (Installer pays) → SELECTED (status unchanged, purchasedAt set)
```

---

## 🧪 Testing Scenarios

### Scenario 1: Loser Installer View
1. Homeowner selects another installer as winner
2. Loser logs in to dashboard
3. **Expected**: See polite message "The bid was won by another installer. Better luck next time!"
4. **Expected**: Message in yellow/warning color (not red error)
5. **Expected**: Lead remains visible but locked

### Scenario 2: Winner Installer View (Before Payment)
1. Homeowner selects this installer as winner
2. Winner logs in to dashboard
3. **Expected**: See trophy icon and "You won!" banner
4. **Expected**: See "Proceed to Payment" button
5. **Expected**: Contact details are LOCKED (name/email/phone hidden)
6. **Expected**: Lead still in "Lead Feed" (not in "Purchased Leads")

### Scenario 3: Winner Payment Flow
1. Winner clicks "Proceed to Payment"
2. Redirected to payment page
3. Processes payment (Stripe)
4. Payment successful
5. **Expected**: Redirected to "Purchased Leads"
6. **Expected**: Contact details UNLOCKED (name/email/phone visible)
7. **Expected**: Lead status = 'PURCHASED'
8. **Expected**: Lead moved to "Purchased Leads" section

### Scenario 4: Winner Installer View (After Payment)
1. Winner has paid
2. Winner logs in to dashboard
3. **Expected**: Lead in "Purchased Leads" section (not Lead Feed)
4. **Expected**: Full contact details visible
5. **Expected**: Can contact homeowner

---

## 🛠️ Implementation Plan

### Phase 13H Tasks

**T194**: Update loser notification frontend message
- File: `src/components/InstallerLeadFeed.tsx`
- Change: Update banner message to polite version
- Change: Color from error (red) to warning (yellow)
- Change: Icon from lock to info icon
- Verification: Visual check in browser

**T195**: Remove premature PURCHASED status in select winner endpoint
- File: `src/app/api/bids/[bidId]/select/route.ts`
- Change: Remove `status: 'PURCHASED'` from lead update
- Change: Remove `purchasedAt: new Date()` from lead update
- Keep: `installerId: bid.installerId` to track winner
- Verification: Prisma Studio - lead status remains 'APPROVED' after winner selection

**T196**: Add winner banner to lead card (before payment)
- File: `src/components/InstallerLeadFeed.tsx`
- Add: Trophy icon + "You won!" banner
- Add: "Proceed to Payment" CTA button
- Logic: Show only if `myBid.status === 'SELECTED' && !lead.purchasedAt`
- Verification: Visual check in browser

**T197**: Update contact details locking logic
- Files: All lead display components
- Change: `if (lead.status === 'PURCHASED')` → `if (lead.status === 'PURCHASED' && lead.purchasedAt)`
- Add: Conditional rendering for locked state
- Verification: Contact details hidden until payment

**T198**: Verify payment endpoint updates lead correctly
- File: `src/app/api/leads/[id]/purchase/route.ts` (or similar)
- Verify: Sets `lead.status = 'PURCHASED'`
- Verify: Sets `lead.purchasedAt = new Date()`
- Verify: Sets `bid.purchasedAt = new Date()` for winner's bid
- Create endpoint if missing

**T199**: Test complete flow end-to-end
- Test: Loser sees polite message
- Test: Winner sees trophy before payment
- Test: Contact details locked before payment
- Test: Payment flow works
- Test: Contact details unlock after payment
- Test: Lead moves to purchased section

**T200**: Build verification and commit
- Run: `npx tsc --noEmit` (0 errors)
- Run: `npm run build` (success)
- Test: All scenarios in browser
- Commit: Atomic commit with detailed message

---

## 📋 Success Criteria

### Functional Requirements
- [ ] Loser notification message is polite and professional
- [ ] Loser notification color is warning (not error/red)
- [ ] Winner sees trophy icon and "You won!" message
- [ ] Winner sees "Proceed to Payment" button
- [ ] Contact details locked until payment
- [ ] Lead remains in feed (not moved) until payment
- [ ] Payment flow works correctly
- [ ] Lead moves to purchased section after payment
- [ ] Contact details unlock after payment

### Technical Requirements
- [ ] No schema changes required (use existing fields)
- [ ] Backend logic updated (no premature PURCHASED status)
- [ ] Frontend logic updated (proper status checks)
- [ ] TypeScript: 0 errors
- [ ] Build: Success
- [ ] No console errors

### Testing Requirements
- [ ] All 4 scenarios tested and passing
- [ ] Database state verified in Prisma Studio
- [ ] UX verified in browser
- [ ] No regressions in existing functionality

---

## 🚨 Risk Assessment

**Low Risk**:
- Frontend message updates (cosmetic)
- Backend logic fix (remove premature status)

**Medium Risk**:
- Contact details locking logic (need to find all places)
- Payment flow integration (may need updates)

**Mitigation**:
- Test each change immediately
- Use grep to find all contact detail rendering locations
- Verify payment endpoint exists and works

---

## 📝 Notes

- No database schema changes needed (use existing `purchasedAt` field)
- Backend loser notification message is already polite (no change needed)
- Frontend loser notification UI needs update (message + color + icon)
- Payment flow may already exist (need to verify and test)

---

**Status**: AUDIT COMPLETE - Ready to create Phase 13H tasks
