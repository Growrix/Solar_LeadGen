# Button Visibility Issue - Fix Report
## Date: October 21, 2025

---

## 🐛 Issue Report

**User Complaint:**
> "I cant see such button the instatQuote, there is only one button is showing up and that is the Get Another Quote button."

---

## 🔍 Root Cause

**File**: `src/app/page.tsx` Line 341

```typescript
// WRONG LOGIC
hideSubmitButton={status === 'authenticated' && session?.user?.role === 'HOMEOWNER' && homeownerLeadCount > 0}
```

**Problem:**
The "Get Detailed Quotes from Installers" button was being **hidden** if:
1. User is logged in as HOMEOWNER ✓
2. User has already submitted at least 1 lead (homeownerLeadCount > 0) ✓

**Why This is Wrong:**
- Homeowners should be able to submit **multiple quote requests** (limit is 5)
- Hiding the button after 1 submission prevents them from requesting more quotes
- This breaks the entire quote request workflow for returning users

---

## ✅ The Fix

### Change 1: Remove hideSubmitButton Logic

**File**: `src/app/page.tsx` Line 341

```typescript
// BEFORE (WRONG)
hideSubmitButton={status === 'authenticated' && session?.user?.role === 'HOMEOWNER' && homeownerLeadCount > 0}

// AFTER (CORRECT)
hideSubmitButton={false}
```

**Result**: Button now **always visible** for all users (guests and homeowners)

### Change 2: Remove Unnecessary Lead Count Fetching

**File**: `src/app/page.tsx` Lines 50-78

**Removed:**
- `homeownerLeadCount` state
- `isLoadingLeadCount` state
- `useEffect` that fetches lead count from dashboard API

**Why:** This data was only used for the hideSubmitButton logic, which we removed.

---

## 📋 Expected Behavior Now

### Guest Users (Not Logged In)
1. Fill InstantQuoteForm → Get results
2. Click **"Get Detailed Quotes from Installers"** ✅ VISIBLE
3. QuoteOptionsModal opens
4. Select type → HomeownerSignupModal opens
5. Register → Lead created → Dashboard

### Authenticated Homeowners (Logged In)
1. Fill InstantQuoteForm → Get results
2. Click **"Get Detailed Quotes from Installers"** ✅ VISIBLE (even if they have 1, 2, 3, 4 existing leads)
3. QuoteOptionsModal opens
4. Select type → Lead created immediately (no signup)
5. Dashboard shows all leads

### Quota Management
- Homeowner limit: **5 quote requests**
- Quota checked in `/api/leads` POST endpoint (server-side)
- If limit reached → API returns error
- Button remains visible (user sees error message explaining limit)

---

## 🎯 Files Changed

1. **`src/app/page.tsx`**
   - Line 341: Changed `hideSubmitButton={...complex logic...}` to `hideSubmitButton={false}`
   - Lines 50-78: Removed homeownerLeadCount state and fetching logic

---

## 🧪 Testing

**Test 1: Guest User**
1. Open incognito browser
2. Go to homepage
3. Fill instant quote form
4. **Verify**: "Get Detailed Quotes from Installers" button visible ✅

**Test 2: Homeowner with 0 Leads**
1. Login as homeowner (no previous leads)
2. Fill instant quote form
3. **Verify**: "Get Detailed Quotes from Installers" button visible ✅

**Test 3: Homeowner with 1+ Leads**
1. Login as homeowner (already has 1-4 leads)
2. Fill instant quote form
3. **Verify**: "Get Detailed Quotes from Installers" button visible ✅ (THIS WAS BROKEN BEFORE)

**Test 4: Homeowner at Limit (5 leads)**
1. Login as homeowner (already has 5 leads)
2. Fill instant quote form
3. **Verify**: "Get Detailed Quotes from Installers" button visible ✅
4. Click button → Select type → Submit
5. **Verify**: Error message "Quote limit reached (5/5)" ✅

---

## 📝 Summary

**Issue**: Button hidden for homeowners with existing leads  
**Root Cause**: Wrong conditional logic in hideSubmitButton prop  
**Fix**: Set hideSubmitButton to always false  
**Impact**: All users can now request quotes regardless of existing lead count  
**Quota Enforcement**: Moved to API level (server-side validation)  

**Status**: ✅ FIXED  
**Ready to Test**: YES  

---

## 💡 Lesson Learned

**Don't hide UI elements based on business rules** - show the button and let the API enforce limits with clear error messages. Better UX = visible button + helpful error vs hidden button + confused user.
