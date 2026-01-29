# Phase 13H Testing Guide - Payment-Gated Bidding Flow

**Task**: T199 - End-to-End Testing (All 4 Scenarios)  
**Date**: January 2025  
**Status**: Ready for Testing  

---

## Testing Prerequisites

### 1. Database Verification (Prisma Studio)
```powershell
npx prisma studio
```

**Check Tables**:
- `Lead`: Status field, purchasedAt field, installerId field
- `Bid`: Status field, purchasedAt field, selectedAt field
- `Installer`: Active accounts with valid credentials

### 2. Dev Server Running
```powershell
npm run dev
```
**Expected**: Server running on `http://localhost:3000`

### 3. Test Accounts
- **Homeowner**: User with active lead in bidding
- **Winner Installer**: User whose bid will be selected
- **Loser Installer**: User whose bid will be rejected
- **Admin**: admin@solarmatch.com / Admin123!Secure

---

## Scenario 1: Loser Installer View

### Objective
Verify that rejected installers see polite, professional message.

### Steps
1. **Setup** (as Homeowner):
   - Login as homeowner
   - Navigate to lead in bidding
   - Select a winner bid (not Loser Installer)
   - Click "Select Winner" button

2. **Test** (as Loser Installer):
   - Login as loser installer
   - Navigate to `/installer/leads`
   - Find the lead where bid was rejected

3. **Verify**:
   - [ ] ✅ Banner displays with message:
     ```
     "The bid was won by another installer. Better luck next time!"
     ```
   - [ ] ✅ Banner color: Yellow/Warning (NOT red/error)
   - [ ] ✅ Icon: `InfoIcon` (NOT `LockIcon`)
   - [ ] ✅ Banner classes: `bg-warning/10 border-warning/20 text-warning`
   - [ ] ✅ No harsh language like "purchased by another"
   - [ ] ✅ Banner is not dismissible (no close button)

### Database Check (Prisma Studio)
```typescript
Bid {
  status: "REJECTED", // ✅ Must be REJECTED
  installerId: <loser-installer-id>
}

Lead {
  status: "APPROVED", // ✅ Still APPROVED (payment not done)
  purchasedAt: null, // ✅ No payment yet
  installerId: <winner-installer-id>
}
```

### Screenshot Verification
- [ ] Banner visible on lead card
- [ ] Yellow color theme
- [ ] InfoIcon present
- [ ] Full lead card visible (not hidden)

---

## Scenario 2: Winner Before Payment

### Objective
Verify winner sees congratulations banner with payment CTA, contacts locked.

### Steps
1. **Test** (as Winner Installer):
   - Login as winner installer
   - Navigate to `/installer/leads`
   - Find the lead where bid was selected as winner

2. **Verify - Winner Banner**:
   - [ ] ✅ Trophy icon visible (🏆)
   - [ ] ✅ Banner displays message:
     ```
     "🎉 Congratulations! You won this bid! Please proceed to payment to unlock homeowner contact details."
     ```
   - [ ] ✅ Banner color: Success/Green (`bg-success/10 border-success/30`)
   - [ ] ✅ "Proceed to Payment" button visible
   - [ ] ✅ Button classes: `bg-primary text-primary-foreground hover:bg-primary/90`

3. **Verify - Contact Details Locked**:
   - [ ] ✅ Contact section shows locked state
   - [ ] ✅ Lock icon visible
   - [ ] ✅ Placeholder text:
     ```
     "Complete payment to unlock homeowner contact details"
     ```
   - [ ] ✅ Homeowner name: Hidden/masked
   - [ ] ✅ Email: Hidden (e.g., "j***@example.com")
   - [ ] ✅ Phone: Hidden (e.g., "***-***-1234")

4. **Verify - Lead Location**:
   - [ ] ✅ Lead visible in "Lead Feed" section
   - [ ] ✅ Lead NOT in "Purchased Leads" section yet
   - [ ] ✅ Lead card remains in original list

### Database Check (Prisma Studio)
```typescript
Bid {
  status: "SELECTED", // ✅ Winner selected
  purchasedAt: null, // ✅ Payment not done yet
  selectedAt: <timestamp>, // ✅ When homeowner selected
  installerId: <winner-installer-id>
}

Lead {
  status: "APPROVED", // ✅ Still APPROVED (not PURCHASED yet)
  purchasedAt: null, // ✅ No payment timestamp
  installerId: <winner-installer-id> // ✅ Tracks winner
}
```

### Screenshot Verification
- [ ] Winner banner visible with trophy
- [ ] Payment button visible
- [ ] Contact details section locked
- [ ] Lock icon visible
- [ ] Lead in "Lead Feed" (not "Purchased Leads")

---

## Scenario 3: Payment Flow

### Objective
Verify payment endpoint works and updates database correctly.

### Steps
1. **Initiate Payment** (as Winner Installer):
   - Click "Proceed to Payment" button
   - Should navigate to `/installer/leads/${leadId}/payment`
   - Or trigger payment modal/API call

2. **Dev Mode Payment**:
   - In dev mode (STRIPE_BYPASS_MODE=true), payment should complete instantly
   - No actual Stripe charge
   - Should see success message or redirect

3. **Network Verification** (Browser DevTools):
   - Open DevTools → Network tab
   - Watch for POST request to `/api/bids/${bidId}/purchase`
   - [ ] ✅ Request sent with correct bidId
   - [ ] ✅ Response status: 200 OK
   - [ ] ✅ Response body contains:
     ```json
     {
       "success": true,
       "lead": {
         "homeowner": {
           "name": "John Doe",
           "email": "john@example.com",
           "phone": "555-1234"
         }
       }
     }
     ```

4. **Verify Success State**:
   - [ ] ✅ Success message displayed
   - [ ] ✅ Page refreshes or redirects
   - [ ] ✅ No error messages

### Database Check (Prisma Studio - Immediate After Payment)
```typescript
Bid {
  status: "SELECTED", // ✅ Remains SELECTED
  purchasedAt: <timestamp>, // ✅ Payment timestamp set
  installerId: <winner-installer-id>
}

Lead {
  status: "PURCHASED", // ✅ NOW PURCHASED
  purchasedAt: <timestamp>, // ✅ Payment timestamp set
  installerId: <winner-installer-id>
}
```

### Console Check (Browser DevTools)
- [ ] ✅ No JavaScript errors
- [ ] ✅ No React hydration errors
- [ ] ✅ No API error messages

---

## Scenario 4: Winner After Payment

### Objective
Verify contacts unlocked, lead moved to purchased section.

### Steps
1. **Test** (as Winner Installer - After Payment):
   - Refresh page or navigate to `/installer/leads`
   - Find the purchased lead

2. **Verify - Lead Location**:
   - [ ] ✅ Lead MOVED to "Purchased Leads" section
   - [ ] ✅ Lead NOT in "Lead Feed" anymore
   - [ ] ✅ Lead visible under "Bidding Leads → Purchased" tab

3. **Verify - Contact Details Unlocked**:
   - [ ] ✅ Lock icon REMOVED
   - [ ] ✅ Homeowner full name visible (no masking)
   - [ ] ✅ Email address fully visible
   - [ ] ✅ Phone number fully visible
   - [ ] ✅ All homeowner details accessible:
     ```typescript
     {
       name: "John Doe",
       email: "john@example.com",
       phone: "555-1234-5678"
     }
     ```

4. **Verify - Winner Banner Removed**:
   - [ ] ✅ Trophy banner NOT visible anymore
   - [ ] ✅ "Proceed to Payment" button REMOVED
   - [ ] ✅ No payment-related messages

5. **Verify - Lead Details**:
   - [ ] ✅ All lead information accessible
   - [ ] ✅ Property address visible
   - [ ] ✅ System details visible
   - [ ] ✅ Budget information visible
   - [ ] ✅ Timeline visible

### Database Check (Prisma Studio - Final State)
```typescript
Bid {
  status: "SELECTED", // ✅ Winner status preserved
  purchasedAt: <timestamp>, // ✅ Payment timestamp exists
  installerId: <winner-installer-id>
}

Lead {
  status: "PURCHASED", // ✅ PURCHASED status
  purchasedAt: <timestamp>, // ✅ Payment timestamp exists
  installerId: <winner-installer-id> // ✅ Winner tracked
}
```

### Additional Checks
- [ ] ✅ Other losers still see polite rejection message
- [ ] ✅ Homeowner sees lead marked as "Winner Selected" or "Purchased"
- [ ] ✅ Admin can see purchase history in admin panel

---

## Critical Test Points

### Flow Validation
```
✓ Select Winner → Lead status APPROVED (not PURCHASED)
✓ Winner sees trophy + payment CTA
✓ Contacts LOCKED for winner
✓ Losers see polite message
✓ Payment completes → Lead status PURCHASED
✓ Contacts UNLOCKED for winner
✓ Lead moves to "Purchased Leads"
```

### Color/Icon Validation
- **Loser**: Yellow banner (`bg-warning/10`) + InfoIcon
- **Winner Before**: Green banner (`bg-success/10`) + TrophyIcon
- **Winner After**: No banner, unlocked contacts

### Database State Transitions
```
Before Winner Selection:
├─ Lead: status=APPROVED, purchasedAt=null, installerId=null
└─ Bids: All status=SUBMITTED

After Winner Selection:
├─ Lead: status=APPROVED, purchasedAt=null, installerId=<winner-id>
├─ Winner Bid: status=SELECTED, purchasedAt=null
└─ Loser Bids: status=REJECTED

After Payment:
├─ Lead: status=PURCHASED, purchasedAt=<timestamp>, installerId=<winner-id>
└─ Winner Bid: status=SELECTED, purchasedAt=<timestamp>
```

---

## Test Checklist Summary

### Pre-Testing
- [ ] Database seeded with test data
- [ ] Dev server running
- [ ] Prisma Studio open
- [ ] Browser DevTools open

### Scenario 1: Loser View
- [ ] Polite message visible
- [ ] Yellow color theme
- [ ] InfoIcon present
- [ ] Database: bid.status=REJECTED

### Scenario 2: Winner Before Payment
- [ ] Trophy banner visible
- [ ] Payment button visible
- [ ] Contacts locked
- [ ] Lead in "Lead Feed"
- [ ] Database: lead.purchasedAt=null

### Scenario 3: Payment Flow
- [ ] Payment endpoint called
- [ ] 200 response received
- [ ] Database updated correctly
- [ ] No console errors

### Scenario 4: Winner After Payment
- [ ] Contacts unlocked
- [ ] Lead in "Purchased Leads"
- [ ] Trophy banner removed
- [ ] Database: lead.status=PURCHASED, lead.purchasedAt exists

### Build Verification
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → Success
- [ ] No console warnings

---

## Troubleshooting

### Issue: Winner banner not showing
**Check**:
- `myBid.status === 'SELECTED'` in database
- `lead.purchasedAt === null` in database
- Component logic: `isWinner && !isPaid`

### Issue: Contacts not unlocking after payment
**Check**:
- `lead.status === 'PURCHASED'` in database
- `lead.purchasedAt` has timestamp in database
- Component logic: `isPaid = lead.status === 'purchased' && lead.purchasedAt`

### Issue: Loser message still harsh
**Check**:
- File: `src/components/InstallerLeadFeed.tsx` lines 614-622
- Message should be: "The bid was won by another installer. Better luck next time!"
- Color should be: `bg-warning/10 border-warning/20 text-warning`

### Issue: Payment endpoint error
**Check**:
- Bid status is 'SELECTED' (not 'SUBMITTED' or 'REJECTED')
- Installer is the winner of the bid
- Network tab shows request details
- Console shows error stack trace

---

## Success Criteria

**All 4 scenarios pass** ✅  
**Database state transitions correct** ✅  
**No console errors** ✅  
**TypeScript check passes** ✅  
**Build succeeds** ✅

When all checks pass, proceed to **T200: Atomic Commit**.
