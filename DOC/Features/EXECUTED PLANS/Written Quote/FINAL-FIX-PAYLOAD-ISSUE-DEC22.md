# Written Quote Payload Fix - Final Root Cause

**Date**: December 22, 2025  
**Issue**: "Missing required fields: leadId, amount" error when submitting Written Quote  
**Status**: ❌ **NOT RESOLVED** (superseded by Dec23 audit)

---

## Problem Statement

After fixing the `handleSubmitQuote` stub function, a new error appeared when clicking "Send Quote":

```
localhost:3000 says
Missing required fields: leadId, amount
```

**Screenshot Evidence**: WrittenQuoteBuilderModal open, all fields filled, error dialog visible.

---

## Root Cause Analysis (Partial)

### Issue Location
**File**: `src/components/WrittenQuoteBuilderModal.tsx` (Line 497)

### What Was Assumed
The WrittenQuoteBuilderModal's `handleSubmit` function was assumed to be the code path sending the request and was assumed to be sending incorrect data:

```typescript
// ❌ BEFORE (WRONG)
const bidPayload = {
  leadId: String(lead.id),
  amount: subtotal,  // ❌ Wrong! API expects finalTotal
  // ... rest of payload
};
```

### Why This Writeup Was Incomplete
This document focused on payload composition, but later investigation showed the runtime submission path for Written Quotes may not be executing the payload branch described here (see Dec23 audit).

### API Expectation (Correct)
**File**: `src/app/api/written-quotes/route.ts` (Line 48)

```typescript
// Validate required fields
if (!body.leadId || !body.amount) {
  logger.warn('Missing required fields', { body, correlationId });
  return NextResponse.json(
    { error: 'Missing required fields: leadId, amount' },
    { status: 400 }
  );
}
```

The API requires `leadId` and `amount`, and computes `gstAmount` and `finalTotal` server-side from the provided `amount` plus optional flags (`includeGst`, `gstPercent`, `includeIncentive`, `incentiveAmount`).

---

## The Fix (Attempted)

### Changes Made

**File**: `src/components/WrittenQuoteBuilderModal.tsx`

1. **Renamed variable** (Line 497):
   ```typescript
   // ✅ AFTER (CORRECT)
   const writtenQuotePayload = {
   ```

2. **Fixed amount field** (Line 499):
   ```typescript
   amount: finalTotal, // ✅ Correct! Already includes GST, deductions
   ```

3. **Updated comments** (Line 497):
   ```typescript
   // Phase 13W - Full JSON fields (not Phase 13B)
   ```

4. **Updated success message** (Line 580):
   ```typescript
   alert(`Written Quote submitted successfully! Quote ID: ${data.writtenQuoteId}`);
   ```

### Calculation Flow (Correct)

```typescript
const subtotal = 15000; // Sum of line items
const gstAmount = 1500; // 10% GST
const stcDeduction = 2000; // STC rebate
const vicDeduction = 1000; // VIC rebate
const totalDiscounts = 500; // Other discounts
const finalTotal = subtotal + gstAmount - stcDeduction - vicDeduction - totalDiscounts;
// = 15000 + 1500 - 2000 - 1000 - 500 = 13000 ✅
```

**This `finalTotal` is what the API expects in the `amount` field.**

---

## Verification (Build Only)

### Build Status
```powershell
npm run build
# Result: ✓ Compiled successfully
```

### TypeScript Status
```powershell
npx tsc --noEmit
# Result: 0 production errors (5 seed file errors, acceptable)
```

---

## Impact (Unverified)

**BEFORE FIX**:
- ❌ "Send Quote" button showed error dialog
- ❌ No quotes saved to database
- ❌ Feature completely non-functional

**AFTER FIX (EXPECTED)**:
- ✅ API validation should pass
- ✅ Quote should be saved

**Actual Outcome**:
- ❌ Manual testing still reported: "Missing required fields: leadId, amount"

---

## Related Files

1. **WrittenQuoteBuilderModal.tsx** - Fixed payload construction
2. **src/app/api/written-quotes/route.ts** - API validation (unchanged)
3. **src/app/installer/(dashboard)/leads/page.tsx** - handleSubmitQuote handler (unchanged)

---

## Lessons Learned

1. **Copy-Paste Issues**: The modal was copied from BidBuilderModal but variable names (`bidPayload`) weren't updated to reflect Written Quote context

2. **Amount Confusion**: Subtotal vs FinalTotal - Always check what the API expects vs what you're sending

3. **Testing Gaps**: Previous fixes only tested handler function, not end-to-end data flow from modal → handler → API

4. **Validation Value**: API validation caught the issue immediately with clear error message

---

## Testing Checklist

- [x] Build compiles successfully
- [x] TypeScript clean (0 production errors)
- [ ] API receives correct payload (must be verified in browser Network tab + server logs)
- [ ] Manual E2E: Installer submits quote → Database insert confirmed
- [ ] Manual E2E: Homeowner sees quote in review modal
- [ ] Manual E2E: Negotiation flow (counter → revise → done deal)

---

**Status**: ❌ **NOT RESOLVED** - Requires Dec23 audit + path verification

**Next Action**: Manual testing recommended to verify complete flow works as expected.
