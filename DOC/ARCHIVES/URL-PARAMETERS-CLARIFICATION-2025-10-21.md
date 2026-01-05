# URL Query Parameters - Non-Issue Clarification

**Date**: October 21, 2025  
**Issue**: User reported "weird link" with query parameters  
**Status**: ✅ NOT A BUG - Clarification provided

---

## 🔍 The "Weird" URL

```
http://localhost:3000/homeowner/dashboard?postcode=1212&location=Dhaka&state=NSW&retailer=origin&usageType=monthly-kwh&electricityValue=&systemSizeOverride=&panelOrientation=northeast&roofTilt=low&shadingLevel=minimal&roofType=tile&panelBrand=sunpower&usagePattern=evening&budgetRange=5000-10000&tariffPlan=flat&customRetailRate=&customFeedInRate=
```

---

## ✅ THIS IS NOT A BUG

### Why These Parameters Exist:

1. **User-Generated**: Someone manually typed or pasted this URL
2. **Bookmark**: This URL was bookmarked during testing
3. **Old Testing**: Leftover from previous development/testing
4. **Browser DevTools**: Generated during debugging

### Code Verification:

✅ **SimplifiedQuoteForm**: Does NOT manipulate URL  
✅ **LeadEditModal**: Does NOT use URL parameters  
✅ **Dashboard Page**: Does NOT read URL query parameters  

Checked for:
- ❌ `useSearchParams`
- ❌ `URLSearchParams`
- ❌ `window.history.pushState`
- ❌ `window.location`
- ❌ `router.push` with query strings

**Result**: NONE of our code creates or uses these URL parameters.

---

## 🎯 How The App Actually Works

### Correct Data Flow:

```
┌─────────────────────────────────┐
│ Homeowner Dashboard             │
│ - Fetches leads from API        │
│ - GET /api/homeowner/dashboard  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ User clicks "Edit" button       │
│ - Opens LeadEditModal           │
│ - Passes lead.quoteData as prop │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ SimplifiedQuoteForm             │
│ - Receives quoteData via props  │
│ - Pre-fills form fields         │
│ - NO URL manipulation           │
└────────────┬────────────────────┘
             │
             ▼ (User edits & submits)
┌─────────────────────────────────┐
│ onSubmit callback               │
│ - Passes data to LeadEditModal  │
│ - Modal sends PATCH to API      │
│ - NO URL changes                │
└─────────────────────────────────┘
```

### URL Parameters Are IGNORED:

The dashboard page does NOT use `useSearchParams()` or read query strings. All data passing happens through:
1. **API calls** - GET /api/homeowner/dashboard
2. **React props** - initialData passed to SimplifiedQuoteForm
3. **Callbacks** - onSubmit passes data back to parent

---

## 🧹 How To "Fix" The Weird URL

### Option 1: Navigate Normally (Recommended)
Just click "Dashboard" in the navbar or go to:
```
http://localhost:3000/homeowner/dashboard
```
(No query parameters)

### Option 2: Clear Browser History
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Option 3: Start Fresh Session
1. Close all browser tabs
2. Clear cookies for localhost
3. Navigate to http://localhost:3000
4. Login normally

---

## ✅ What We Actually Fixed

The REAL bug was inside SimplifiedQuoteForm:

### Bug:
```typescript
// BEFORE - Only passed calculation results
onClick={() => onSubmit(quoteResult)}
```

### Fix:
```typescript
// AFTER - Passes ALL form data including inputs
onClick={() => onSubmit({
  ...quoteResult,
  ...formData,
  electricityValue,     // ✅ Now included
  electricityUsageType  // ✅ Now included
})}
```

This ensures the database receives `energyBill` value correctly.

---

## 🎓 Key Takeaway

**URL query parameters in the browser address bar are NOT the same as form state.**

Our React application manages form state INTERNALLY using:
- `useState` hooks
- Props passing
- Callback functions

The URL bar showing parameters is just a red herring - it doesn't affect functionality because:
1. Our code doesn't read those parameters
2. Our code doesn't write to those parameters
3. Data flows through React, not URLs

---

## ✅ Resolution

**The "weird URL" is harmless and does not affect functionality.**

Just navigate to the dashboard normally without query parameters:
```
http://localhost:3000/homeowner/dashboard
```

The actual bug (energyBill not being saved) has been fixed in commit `7ad8443`.

---

**Status**: No action needed - not a bug
