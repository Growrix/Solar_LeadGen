# Testing Guide: Request More Quotes Modal Fix

## Issue Being Tested
The "Request more quotes" button should show different modals based on quote count:
- **0 quotes** → InstantQuoteForm (multi-step modal)  
- **1+ quotes** → SimplifiedQuoteForm (single-page pre-filled form)

---

## Test Setup

The development server is running on: **http://localhost:3001**

Console logs have been added to help debug the issue:
- `[handleRequestMoreQuotes]` - Shows dashboard summary and totalSubmitted value
- `[Modal States]` - Shows which modals are open/closed

---

## Testing Steps

### Test 1: Check Dashboard Summary Data
1. Open the browser console (F12)
2. Navigate to homeowner dashboard: `http://localhost:3001/homeowner/dashboard`
3. Look for the initial dashboard data in console
4. **Note the value of `totalSubmitted`** - This is the key variable

### Test 2: Click "Request more quotes" Button
1. Click the "Request more quotes" button on the dashboard
2. Watch the console logs for:
   ```
   [handleRequestMoreQuotes] Dashboard Summary: {...}
   [handleRequestMoreQuotes] totalSubmitted: X
   [handleRequestMoreQuotes] Condition check (totalSubmitted === 0): true/false
   [handleRequestMoreQuotes] → Opening InstantQuoteForm (first quote, totalSubmitted = 0)
   OR
   [handleRequestMoreQuotes] → Opening SimplifiedQuoteForm (returning user, totalSubmitted = X)
   ```
3. **Verify which modal actually opens**

### Test 3: Check Modal States
Watch for the `[Modal States]` log to see:
```javascript
{
  isNewQuoteModalOpen: true/false,
  isSimplifiedQuoteModalOpen: true/false,
  isQuoteOptionsModalOpen: true/false
}
```

---

## Expected Behavior

| Scenario | totalSubmitted | Expected Modal | Console Log |
|----------|----------------|----------------|-------------|
| First-time user | 0 | InstantQuoteForm | "Opening InstantQuoteForm" |
| Returning user | 1+ | SimplifiedQuoteForm | "Opening SimplifiedQuoteForm" |

---

## What to Report

Please share:
1. ✅ The value of `totalSubmitted` from the console
2. ✅ Which console log message appears when clicking the button
3. ✅ Which modal actually opens (InstantQuoteForm or SimplifiedQuoteForm)
4. ✅ The `[Modal States]` log output

---

## Common Issues to Check

### Issue 1: totalSubmitted is always 0
- This means the user account has no leads yet
- Solution: Submit at least one quote first to test the "1+ quotes" flow

### Issue 2: Wrong modal opens despite correct condition
- Check if both modals are rendered in the DOM
- Check if SimplifiedQuoteFormModal component is properly imported

### Issue 3: Modal doesn't open at all
- Check for JavaScript errors in console
- Check if isSimplifiedQuoteModalOpen state is being set

---

## Quick Test Commands

Open browser console and run:
```javascript
// Check current dashboard summary
JSON.parse(localStorage.getItem('dashboardSummary'))

// Manually trigger modal (for debugging)
// In React DevTools, find the dashboard component and update state
```

---

## Files to Check if Issue Persists

1. **Dashboard page:** `src/app/homeowner/dashboard/page.tsx`
   - Lines 787-807: handleRequestMoreQuotes function
   - Lines 1027-1039: SimplifiedQuoteFormModal rendering

2. **Modal component:** `src/components/homeowner/SimplifiedQuoteFormModal.tsx`
   - Check if file exists and is properly exported

3. **SimplifiedQuoteForm:** `src/components/homeowner/SimplifiedQuoteForm.tsx`
   - Check if component is working correctly

---

## Next Steps After Testing

Based on the console logs, we can determine:
- ✅ If the condition is working correctly
- ✅ If the right modal state is being set
- ✅ If there's a rendering issue with SimplifiedQuoteFormModal
- ✅ If totalSubmitted data is being fetched correctly

Please click the button and share the console output!
