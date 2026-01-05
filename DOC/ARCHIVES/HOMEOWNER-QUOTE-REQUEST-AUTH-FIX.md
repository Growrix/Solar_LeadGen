# 🔧 Homeowner Quote Request Authentication Fix

**Date**: October 13, 2025  
**Status**: ✅ FIXED  
**Branch**: Version-2

---

## 📋 Issue Reported

### Problem:
> "When the user chose the quote options, it opens the modal to signup. But if the users are already logged in, they should not require to signup and the signup modal should not open. Instead, it should show the Quote request submitted modal with successful message."

### Current Behavior (BEFORE):
1. User fills instant quote form
2. User clicks "Get Real Quotes from Installers"
3. Quote options modal opens (Call/Visit or Written)
4. User selects an option
5. **❌ Signup modal ALWAYS opens** (even if user is logged in)

### Expected Behavior (AFTER):
1. User fills instant quote form
2. User clicks "Get Real Quotes from Installers"
3. Quote options modal opens (Call/Visit or Written)
4. User selects an option
5. **✅ Check authentication:**
   - If user is **logged in** → Submit quote directly → Show success modal
   - If user is **NOT logged in** → Show signup modal → After signup → Submit quote → Show success modal

---

## 🔍 Audit Findings

### Issue #1: No Authentication Check
**Location**: `src/app/page.tsx` - `handleQuoteOptionSelected()` function

**BEFORE**:
```tsx
const handleQuoteOptionSelected = (type: 'call_visit' | 'written') => {
  setSelectedQuoteType(type);
  setIsQuoteOptionsModalOpen(false);
  setIsHomeownerSignupModalOpen(true); // ❌ Always opens signup modal
};
```

**Problem**:
- No check for user session
- Always opens signup modal regardless of login status
- Confusing UX for logged-in users

---

### Issue #2: Missing useSession Hook
**Location**: `src/app/page.tsx`

**BEFORE**:
```tsx
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ❌ No useSession import
```

**Problem**:
- Page component doesn't have access to user session
- Cannot check if user is authenticated

---

## ✅ Fixes Implemented

### Fix #1: Added useSession Hook
**File**: `src/app/page.tsx`

**AFTER**:
```tsx
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // ✅ Added

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession(); // ✅ Get session data
  // ...
}
```

**Benefits**:
- ✅ Page now has access to authentication state
- ✅ Can check if user is logged in
- ✅ Can access user data (id, email, role)

---

### Fix #2: Updated handleQuoteOptionSelected with Auth Check
**File**: `src/app/page.tsx`

**AFTER**:
```tsx
const handleQuoteOptionSelected = (type: 'call_visit' | 'written') => {
  setSelectedQuoteType(type);
  setIsQuoteOptionsModalOpen(false);
  
  // ✅ Check if user is already logged in
  if (status === 'authenticated' && session?.user) {
    // User is logged in - submit quote directly without signup
    console.log('User already logged in, submitting quote request:', { 
      quoteType: type, 
      quoteData: pendingQuoteData,
      userId: session.user.id,
      userEmail: session.user.email
    });
    
    // TODO: In production, send quote request to backend API here
    // Example: await fetch('/api/quotes/submit', { method: 'POST', body: JSON.stringify({ type, data: pendingQuoteData }) });
    
    // Show success modal directly
    setIsQuoteSuccessModalOpen(true);
    setPendingQuoteData(null);
  } else {
    // User is not logged in - show signup modal
    setIsHomeownerSignupModalOpen(true);
  }
};
```

**Benefits**:
- ✅ Checks authentication status before deciding flow
- ✅ Logged-in users skip signup modal
- ✅ Guest users see signup modal as before
- ✅ Better UX for returning users

---

## 🎯 User Flow Visualization

### Flow for LOGGED-IN Users (✅ Fixed):
```
1. User on homepage (/)
     ↓
2. Fills instant quote form
     ↓
3. Clicks "Get Real Quotes from Installers"
     ↓
4. Quote options modal opens
     ↓
5. Selects "Call/Visit" or "Written Quote"
     ↓ [Check: status === 'authenticated']
     ↓ [YES - User is logged in]
     ↓
6. Submit quote request to backend (with user ID)
     ↓
7. ✅ Quote Success Modal appears
     ↓
8. Message: "Your quote request has been submitted!"
```

### Flow for GUEST Users (Same as Before):
```
1. Guest on homepage (/)
     ↓
2. Fills instant quote form
     ↓
3. Clicks "Get Real Quotes from Installers"
     ↓
4. Quote options modal opens
     ↓
5. Selects "Call/Visit" or "Written Quote"
     ↓ [Check: status === 'authenticated']
     ↓ [NO - Guest user]
     ↓
6. Signup modal opens (context="quote")
     ↓
7. User fills signup form
     ↓
8. Account created + Auto-login
     ↓
9. Submit quote request to backend
     ↓
10. ✅ Quote Success Modal appears
```

---

## 🧪 Testing Instructions

### Test 1: Logged-In User Requesting Quote
**Steps**:
1. Sign up or log in as homeowner
2. Navigate to homepage
3. Fill instant quote form (address, system size, etc.)
4. Click "Get Real Quotes from Installers"
5. Select "Call/Visit" or "Written Quote"

**Expected**:
- ✅ Signup modal does NOT open
- ✅ Quote Success Modal appears immediately
- ✅ Console log shows: "User already logged in, submitting quote request..."
- ✅ Can see userId and userEmail in console

### Test 2: Guest User Requesting Quote (Existing Flow)
**Steps**:
1. Open homepage in incognito/private window (or logout)
2. Fill instant quote form
3. Click "Get Real Quotes from Installers"
4. Select "Call/Visit" or "Written Quote"

**Expected**:
- ✅ Signup modal opens (context="quote")
- ✅ Title: "Almost there!"
- ✅ Button: "Create Account & Submit Request"
- ✅ After signup → Quote Success Modal appears

### Test 3: Logged-In User After Logout
**Steps**:
1. Log in as homeowner
2. Request quote (should skip signup)
3. Log out
4. Try requesting quote again

**Expected**:
- ✅ After logout, signup modal appears (as guest user)
- ✅ Session properly cleared

---

## 📊 Authentication State Matrix

| User State | Quote Action | Signup Modal | Success Modal | Backend API Call |
|------------|--------------|--------------|---------------|------------------|
| **Guest** (not logged in) | Request Quote | ✅ Opens | After signup | With new userId |
| **Homeowner** (logged in) | Request Quote | ❌ Skipped | Immediately | With existing userId |
| **Installer** (logged in) | Request Quote | ❌ Skipped | Immediately | With existing userId |
| **Admin** (logged in) | Request Quote | ❌ Skipped | Immediately | With existing userId |

---

## 🚀 Next Steps (TODO)

### Backend API Integration:
Currently using console.log for testing. In production, implement:

```tsx
// Replace console.log with actual API call
const response = await fetch('/api/quotes/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    quoteType: type,
    quoteData: pendingQuoteData,
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: session.user.role,
  }),
});

if (response.ok) {
  setIsQuoteSuccessModalOpen(true);
} else {
  setError('Failed to submit quote request. Please try again.');
}
```

### Create Backend Endpoint:
**File**: `src/app/api/quotes/submit/route.ts`

Required fields:
- `quoteType`: 'call_visit' | 'written'
- `quoteData`: Quote calculation data
- `userId`: From session
- `userEmail`: From session
- `timestamp`: Auto-generated

---

## 📝 Files Modified

| File | Changes | Lines Changed |
|------|---------|---------------|
| `src/app/page.tsx` | Added useSession hook + auth check in handleQuoteOptionSelected | ~25 lines |

**Total**: 1 file, ~25 lines modified

---

## ✅ Success Criteria

All requirements met:
- [x] Logged-in users don't see signup modal when requesting quotes
- [x] Guest users see signup modal as before
- [x] Quote success modal shows for both flows
- [x] Session data available for backend submission
- [x] Better UX for returning users
- [x] No breaking changes to existing flow

---

## 🎓 Key Implementation Details

### Why Check Both `status` and `session?.user`?
```tsx
if (status === 'authenticated' && session?.user) {
  // User is logged in
}
```

**Reason**:
- `status === 'authenticated'` - NextAuth session is valid
- `session?.user` - User object exists with data (id, email, role)
- Both checks prevent edge cases during session loading

### Why Use Console.log for Now?
- Allows testing the flow without backend API
- Easy to verify user data is available
- Can be replaced with actual API call later
- Shows what data will be sent to backend

---

**Status**: ✅ Ready for Testing  
**Impact**: Improved UX for logged-in users requesting quotes  
**Breaking Changes**: None - backward compatible with guest flow
