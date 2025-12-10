# Fix: Request More Quotes Button - Conditional Modal Display

**Date:** October 21, 2025  
**Issue:** "Request more quotes" button was always showing the InstantQuote modal regardless of whether user had existing quotes  
**Status:** ✅ FIXED

---

## Problem Description

When users clicked "Request more quotes" button, the system was always showing the multi-step InstantQuoteForm modal, even for users who already had quotes generated. According to the specification:

- **First-time users (0 quotes)** → Should see **InstantQuoteForm** (multi-step modal)
- **Returning users (1+ quotes)** → Should see **SimplifiedQuoteForm** (single-page pre-filled form)

---

## Root Cause

The `handleRequestMoreQuotes()` function in `src/app/homeowner/dashboard/page.tsx` was unconditionally opening the `NewQuoteRequestModal` (which wraps InstantQuoteForm) without checking if the user had existing quote submissions.

```typescript
// BEFORE (incorrect)
const handleRequestMoreQuotes = () => {
  setQuoteFormInitialData(getLatestQuoteData(dashboardSummary ?? null));
  
  if (dashboardSummary?.requiresVerification) {
    setShowContactVerificationModal(true);
  } else {
    setIsNewQuoteModalOpen(true); // ❌ Always opens InstantQuoteForm
  }
};
```

---

## Solution

### 1. Created SimplifiedQuoteFormModal Component

**File:** `src/components/homeowner/SimplifiedQuoteFormModal.tsx`

A new modal wrapper component for `SimplifiedQuoteForm`, designed for returning users:

```typescript
interface SimplifiedQuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Record<string, unknown> | null;
}
```

**Features:**
- Single-page form (no multi-step wizard)
- Pre-fills data from user's most recent quote
- Allows editing and recalculation
- Directly submits to QuoteTypeDistributionModal

---

### 2. Updated Dashboard Logic

**File:** `src/app/homeowner/dashboard/page.tsx`

#### Added State:
```typescript
const [isSimplifiedQuoteModalOpen, setIsSimplifiedQuoteModalOpen] = useState(false);
```

#### Updated Functions:

**a) handleNewQuoteClick()** - For header "Request New Quote" button:
```typescript
const handleNewQuoteClick = () => {
  if (!dashboardSummary) return;
  
  setQuoteFormInitialData(getLatestQuoteData(dashboardSummary));
  
  if (dashboardSummary.requiresVerification) {
    setShowContactVerificationModal(true);
    return;
  }
  
  // ✅ Check quote count
  if (dashboardSummary.totalSubmitted === 0) {
    setIsNewQuoteModalOpen(true);           // First quote → InstantQuoteForm
  } else {
    setIsSimplifiedQuoteModalOpen(true);    // Subsequent → SimplifiedQuoteForm
  }
};
```

**b) handleRequestMoreQuotes()** - For dashboard CTA button:
```typescript
const handleRequestMoreQuotes = () => {
  setQuoteFormInitialData(getLatestQuoteData(dashboardSummary ?? null));
  
  if (dashboardSummary?.requiresVerification) {
    setShowContactVerificationModal(true);
  } else {
    // ✅ Check quote count
    if (dashboardSummary?.totalSubmitted === 0) {
      setIsNewQuoteModalOpen(true);           // First quote → InstantQuoteForm
    } else {
      setIsSimplifiedQuoteModalOpen(true);    // Subsequent → SimplifiedQuoteForm
    }
  }
};
```

**c) handleOTPVerificationSuccess()** - After phone verification:
```typescript
const handleOTPVerificationSuccess = async () => {
  // ... verification logic ...
  
  const updatedSummary = await fetchDashboardSummary();
  setQuoteFormInitialData(getLatestQuoteData(updatedSummary ?? dashboardSummary));
  
  // ✅ Check quote count after verification
  if ((updatedSummary ?? dashboardSummary)?.totalSubmitted === 0) {
    setIsNewQuoteModalOpen(true);
  } else {
    setIsSimplifiedQuoteModalOpen(true);
  }
};
```

#### Added Modal Rendering:
```tsx
{/* SimplifiedQuoteFormModal for returning users (1+ quotes) */}
<SimplifiedQuoteFormModal
  isOpen={isSimplifiedQuoteModalOpen}
  onClose={() => setIsSimplifiedQuoteModalOpen(false)}
  onSubmit={(data) => {
    console.log('Simplified quote form submitted:', data);
    setPendingQuoteData(data);
    setIsSimplifiedQuoteModalOpen(false);
    setIsQuoteOptionsModalOpen(true);
  }}
  initialData={quoteFormInitialData}
/>
```

---

## User Flow After Fix

### Scenario 1: First-Time User (0 quotes)
1. User clicks "Request more quotes" or "Get Started"
2. System checks: `totalSubmitted === 0` ✅
3. Opens **InstantQuoteForm** (multi-step modal)
4. User completes wizard → Selects quote type → Submits

### Scenario 2: Returning User (1+ quotes)
1. User clicks "Request more quotes"
2. System checks: `totalSubmitted > 0` ✅
3. Opens **SimplifiedQuoteForm** (single-page modal)
4. Form is pre-filled with latest quote data
5. User can edit fields, recalculate, and submit
6. Selects quote type → Submits

### Scenario 3: Unverified User (Requires Phone Verification)
1. User clicks "Request more quotes"
2. System checks: `requiresVerification === true`
3. Opens **ContactVerificationModal**
4. After OTP verification completes
5. System re-checks quote count and opens appropriate modal

---

## Files Modified

1. ✅ **Created:** `src/components/homeowner/SimplifiedQuoteFormModal.tsx`
2. ✅ **Modified:** `src/app/homeowner/dashboard/page.tsx`
   - Added import for SimplifiedQuoteFormModal
   - Added state: isSimplifiedQuoteModalOpen
   - Updated: handleNewQuoteClick()
   - Updated: handleRequestMoreQuotes()
   - Updated: handleOTPVerificationSuccess()
   - Added: SimplifiedQuoteFormModal render

---

## Testing Checklist

- [ ] **Test 1:** User with 0 quotes clicks "Get Started" → InstantQuoteForm opens
- [ ] **Test 2:** User with 0 quotes clicks "Request New Quote" (header) → InstantQuoteForm opens
- [ ] **Test 3:** User with 1+ quotes clicks "Request more quotes" → SimplifiedQuoteForm opens
- [ ] **Test 4:** SimplifiedQuoteForm pre-fills with latest quote data
- [ ] **Test 5:** SimplifiedQuoteForm allows editing and recalculation
- [ ] **Test 6:** SimplifiedQuoteForm submits → QuoteTypeDistributionModal opens
- [ ] **Test 7:** Unverified user → ContactVerificationModal → OTP → Correct modal based on quote count
- [ ] **Test 8:** Both modals correctly pass data to QuoteTypeDistributionModal
- [ ] **Test 9:** No TypeScript errors or console warnings
- [ ] **Test 10:** Mobile responsive behavior works for both modals

---

## Expected Behavior

✅ **First-time users:** See the full guided InstantQuote wizard experience  
✅ **Returning users:** See simplified pre-filled form for faster quote requests  
✅ **Verification flow:** Works seamlessly with both modal types  
✅ **Data persistence:** User's previous quote data is properly pre-filled  

---

## Additional Notes

- The SimplifiedQuoteForm component already existed (`src/components/homeowner/SimplifiedQuoteForm.tsx`)
- We only needed to create a modal wrapper and update the conditional logic
- The same QuoteOptionsModal and submission flow is used for both quote types
- Both modals support initialData prop for pre-filling previous quote information

---

## Related Specs

- **Task T273:** Update "Request More Quotes" button flow in dashboard
- **Phase 4.11:** Lead journey and quote request workflows
- **Feature:** Simplified quote form for returning users

---

**Status:** Ready for testing ✅
