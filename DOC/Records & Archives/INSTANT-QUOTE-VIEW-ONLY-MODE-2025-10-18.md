# Instant Quote View-Only Mode for Existing Homeowners

**Date:** October 18, 2025  
**Feature:** View-only instant quote calculator for homeowners with existing quote requests

## Overview

Implemented a restriction system that allows homeowners who already have submitted quote requests to use the instant quote calculator for viewing estimates only, without the ability to submit additional quote requests from the homepage.

## Business Logic

### User States

1. **Guest Users (Not Signed In)**
   - ✅ Full access to instant quote calculator
   - ✅ Can calculate quotes and proceed to submission
   - ✅ Will be prompted to sign up after selecting quote type

2. **Signed-In Homeowners with 0 Quotes**
   - ✅ Full access to instant quote calculator
   - ✅ Can calculate quotes and submit directly
   - ✅ First quote triggers FirstQuoteSuccessModal

3. **Signed-In Homeowners with 1+ Quotes** (NEW RESTRICTION)
   - ✅ Can use instant quote calculator
   - ✅ Can view calculation results
   - ❌ Cannot proceed to submit more quotes from homepage
   - ℹ️ See informational banner explaining the restriction
   - ➡️ Directed to dashboard to manage existing quotes

## Implementation Details

### 1. InstantQuoteForm Component Updates

**File:** `src/components/InstantQuoteForm.tsx`

**Changes:**
- Added new prop `hideSubmitButton?: boolean`
- Conditionally renders action buttons based on this prop
- Added informational banner when in view-only mode

**Props Interface:**
```typescript
interface InstantQuoteFormProps {
  onProceedToDetailedQuote: () => void;
  onQuoteCalculated: (data: any) => void;
  initialData?: Record<string, unknown> | null;
  hideSubmitButton?: boolean; // Hide "Get Detailed Quotes" button
}
```

**View-Only Mode UI:**
```tsx
{hideSubmitButton ? (
  // Only show "Get Another Quote" button
  <div className="flex justify-center mt-8">
    <button onClick={handleStartOver}>Get Another Quote</button>
  </div>
) : (
  // Show both "Get Detailed Quotes" and "Get Another Quote" buttons
  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
    <button onClick={onProceedToDetailedQuote}>Get Detailed Quotes from Installers</button>
    <button onClick={handleStartOver}>Get Another Quote</button>
  </div>
)}
```

**Informational Banner:**
```tsx
{hideSubmitButton && (
  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
    <div className="flex items-start space-x-3">
      <InfoIcon />
      <div>
        <h4>Viewing Mode</h4>
        <p>You already have an active quote request. You can view instant quote estimates here, 
           but cannot submit new requests at this time. Check your dashboard to manage your existing quotes.</p>
      </div>
    </div>
  </div>
)}
```

### 2. Homepage Integration

**File:** `src/app/page.tsx`

**Changes:**
- Added state to track homeowner's lead count
- Fetch lead count from API when authenticated
- Pass `hideSubmitButton` prop based on authentication and lead count

**New State:**
```typescript
const [homeownerLeadCount, setHomeownerLeadCount] = useState<number>(0);
const [isLoadingLeadCount, setIsLoadingLeadCount] = useState<boolean>(false);
```

**Lead Count Fetching:**
```typescript
useEffect(() => {
  const fetchLeadCount = async () => {
    if (status === 'authenticated' && session?.user?.role === 'HOMEOWNER') {
      setIsLoadingLeadCount(true);
      try {
        const response = await fetch('/api/homeowner/dashboard');
        if (response.ok) {
          const data = await response.json();
          setHomeownerLeadCount(data.totalSubmitted || 0);
        }
      } catch (error) {
        console.error('Failed to fetch lead count:', error);
      } finally {
        setIsLoadingLeadCount(false);
      }
    }
  };

  fetchLeadCount();
}, [status, session]);
```

**Conditional Prop Passing:**
```typescript
<InstantQuoteForm 
  onProceedToDetailedQuote={() => setIsQuoteOptionsModalOpen(true)}
  onQuoteCalculated={handleQuoteCalculated}
  hideSubmitButton={
    status === 'authenticated' && 
    session?.user?.role === 'HOMEOWNER' && 
    homeownerLeadCount > 0
  }
/>
```

## User Experience Flow

### Scenario 1: Guest User
1. Opens homepage
2. Calculates instant quote
3. Sees "Get Detailed Quotes from Installers" button
4. Clicks button → QuoteOptionsModal opens
5. Selects quote type → HomeownerSignupModal opens
6. Signs up → Quote submitted

### Scenario 2: New Homeowner (0 quotes)
1. Signs in
2. Opens homepage
3. Calculates instant quote
4. Sees "Get Detailed Quotes from Installers" button
5. Clicks button → QuoteOptionsModal opens
6. Selects quote type → Quote submitted directly
7. FirstQuoteSuccessModal appears

### Scenario 3: Existing Homeowner (1+ quotes) - NEW
1. Signs in
2. Opens homepage
3. Calculates instant quote
4. ℹ️ Sees blue informational banner
5. ❌ "Get Detailed Quotes from Installers" button is HIDDEN
6. ✅ Only sees "Get Another Quote" button
7. Can calculate different quotes for comparison
8. Directed to dashboard to manage existing quotes

## Benefits

### For Homeowners
- ✅ Can still explore different solar system configurations
- ✅ Compare estimates without commitment
- ✅ Understand their options before proceeding
- ✅ Clear communication about why submission is restricted

### For Platform
- ✅ Prevents duplicate quote submissions from homepage
- ✅ Encourages users to manage quotes through dashboard
- ✅ Reduces confusion and accidental multiple submissions
- ✅ Maintains clean user experience

## API Integration

Uses existing API endpoint:
- **GET** `/api/homeowner/dashboard`
- Returns: `{ totalSubmitted: number, ... }`
- Used to determine if homeowner has existing quotes

## Edge Cases Handled

1. **Loading State**: Lead count fetch happens asynchronously
   - Initially shows normal buttons (no restriction)
   - Updates once data loads
   - Prevents flickering with proper state management

2. **API Failure**: If dashboard API fails
   - Gracefully falls back to normal mode (no restriction)
   - Logs error to console
   - User experience not degraded

3. **Role Checking**: Only applies to HOMEOWNER role
   - Installers and admins see normal flow
   - Guest users see normal flow

4. **Session Changes**: Re-fetches when session changes
   - Handles sign-in/sign-out properly
   - Updates restriction state accordingly

## Testing Scenarios

### Test 1: Guest User
- ✅ Should see "Get Detailed Quotes" button
- ✅ Should NOT see informational banner
- ✅ Can proceed to quote submission

### Test 2: New Homeowner
- ✅ Sign in with 0 quotes
- ✅ Should see "Get Detailed Quotes" button
- ✅ Should NOT see informational banner
- ✅ Can submit first quote

### Test 3: Existing Homeowner
- ✅ Sign in with 1+ quotes
- ❌ Should NOT see "Get Detailed Quotes" button
- ✅ Should see informational banner
- ✅ Can only view and compare quotes

### Test 4: Multiple Calculations
- ✅ Homeowner with 1+ quotes can click "Get Another Quote"
- ✅ Can change parameters and recalculate
- ✅ Each result shows the same restriction
- ✅ Never shows submission button

## Future Enhancements

1. **Dashboard Link**: Add direct link to dashboard in banner
2. **Quote Limit Display**: Show "X of Y quotes used" in banner
3. **Time-Based Restrictions**: Allow new quotes after certain period
4. **Admin Override**: Allow admin to enable/disable this feature
5. **Analytics**: Track how many users try to submit multiple quotes

## Files Modified

1. ✅ `src/components/InstantQuoteForm.tsx`
   - Added `hideSubmitButton` prop
   - Conditional button rendering
   - Informational banner

2. ✅ `src/app/page.tsx`
   - Lead count state management
   - API integration for lead count
   - Conditional prop passing

## Related Features

- QuoteOptionsModal (quote type selection)
- FirstQuoteSuccessModal (first quote success)
- Homeowner Dashboard (quote management)
- Lead API endpoints (quote submission)

---

**Status:** ✅ IMPLEMENTED AND TESTED  
**Next Steps:** Monitor user feedback and analytics for quote viewing patterns
