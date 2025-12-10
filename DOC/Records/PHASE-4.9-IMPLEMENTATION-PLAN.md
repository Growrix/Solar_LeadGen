# Phase 4.9 Implementation Plan - Phone Verification UX Fixes

**Date:** January 16, 2025  
**Status:** 🎯 Ready to Start  
**Priority:** P1 - CRITICAL  
**Branch:** 002-lead-journey-life

---

## Problem Summary

During Phase 4.8 testing, critical UX issues were discovered in the phone verification flow:

### Issues Identified
1. ❌ **Empty Phone Input**: ContactVerificationModal opens with EMPTY phone field
   - Users must manually re-type their phone number
   - Phone number from signup is not shown
   - Poor user experience (extra work)

2. ❌ **No Profile Sync**: When users edit phone during verification, changes don't persist
   - Phone number update doesn't save to database
   - "My Profile" page shows old phone number
   - Session doesn't reflect the change

3. ❌ **Missing Test OTP**: Test code (123456) exists but not documented
   - No development testing instructions
   - SMS provider required even for local testing

### Root Causes
- User's phone exists in database but NOT in NextAuth session
- ContactVerificationModal doesn't receive user's current phone
- No API endpoint to update phone number
- No session synchronization after phone changes

---

## Solution Architecture

### 1. Session Enhancement
**Files to Modify:**
- `src/types/next-auth.d.ts`
- `src/lib/auth.ts`

**Changes:**
```typescript
// Add phone to session
interface Session {
  user: {
    phone: string | null;  // ← ADD THIS
    phoneVerified: boolean;
    // ... other fields
  }
}

// JWT callback
async jwt({ token, user, trigger, session }) {
  // On login: load phone from database
  if (user) {
    token.phone = user.phone;
  }
  
  // On session update: sync phone changes
  if (trigger === "update" && session) {
    if (session.phone !== undefined) {
      token.phone = session.phone;
    }
    if (session.phoneVerified !== undefined) {
      token.phoneVerified = session.phoneVerified;
    }
  }
  
  return token;
}
```

### 2. Phone Update API
**New File:** `src/app/api/user/update-phone/route.ts`

**Endpoint:** `PUT /api/user/update-phone`

**Request:**
```json
{
  "phoneNumber": "+61412345678"
}
```

**Response:**
```json
{
  "success": true,
  "phone": "+61412345678",
  "phoneVerified": false
}
```

**Logic:**
1. Validate E.164 format: `/^\+[1-9]\d{1,14}$/`
2. Update `user.phone` in database
3. Reset `user.phoneVerified` to false
4. Create audit log entry
5. Return updated values

### 3. ContactVerificationModal Enhancement
**File:** `src/components/homeowner/ContactVerificationModal.tsx`

**Changes:**
```typescript
// Add prop
interface Props {
  defaultPhone?: string;  // ← ADD THIS
  // ... other props
}

// Add hook
const { data: session, update: updateSession } = useSession();

// Pre-populate phone
const [phoneNumber, setPhoneNumber] = useState(defaultPhone ?? '');

// On submit: check if phone changed
const handleSubmit = async (e) => {
  if (phoneNumber !== session?.user?.phone) {
    // Update phone in database
    const res = await fetch('/api/user/update-phone', {
      method: 'PUT',
      body: JSON.stringify({ phoneNumber })
    });
    
    // Update session
    await updateSession({ 
      phone: phoneNumber, 
      phoneVerified: false 
    });
  }
  
  // Send OTP
  await sendOTP(phoneNumber);
};
```

### 4. Dashboard Integration
**File:** `src/app/homeowner/dashboard/page.tsx`

**Changes:**
```tsx
<ContactVerificationModal
  isOpen={showModal}
  defaultPhone={session?.user?.phone || ''}  // ← PASS PHONE
  onClose={...}
  onOTPRequested={...}
/>
```

### 5. Test OTP
**File:** `src/lib/services/phone-verification-service.ts`

**Changes:**
```typescript
// In verifyOTP function
const isTestOTP = code === "123456" && process.env.NODE_ENV === 'development';

if (!isTestOTP && hashedCode !== verification.code) {
  // Failed verification
  return {
    success: false,
    error: `Invalid code. (Dev: Use 123456 for testing)`
  };
}
```

---

## Implementation Tasks (13 Tasks)

### Session & Auth (T182-T184)
- [ ] T182: Extend NextAuth types with phone field
- [ ] T183: Update JWT callback for phone handling
- [ ] T184: Test session contains phone

### API Creation (T185)
- [ ] T185: Create PUT /api/user/update-phone endpoint

### UI Enhancement (T186-T188)
- [ ] T186: Update ContactVerificationModal (add defaultPhone prop, useSession)
- [ ] T187: Add phone update logic (check diff, call API, update session)
- [ ] T188: Pass phone from dashboard to modal

### Verification Flow (T189-T191)
- [ ] T189: Update OTP success handler (session update)
- [ ] T190: Add test OTP (123456)
- [ ] T191: Verify profile page shows updated phone

### Testing (T192-T194)
- [ ] T192: End-to-end test (signup → verify → edit → profile)
- [ ] T193: Test edge cases (null phone, errors, duplicates)
- [ ] T194: Test session sync (immediate updates, persistence)

---

## Testing Checklist

### Pre-Implementation
- [ ] Review current auth.ts structure
- [ ] Check ContactVerificationModal current props
- [ ] Verify User model has phone field in schema
- [ ] Plan file modifications list

### During Implementation
- [ ] After session changes: Check DevTools → Application → Storage → session includes phone
- [ ] After API creation: Test with Postman/curl
- [ ] After modal update: Open modal → see pre-filled phone
- [ ] After full flow: Complete verification → check profile

### Post-Implementation
- [ ] `npx tsc --noEmit` passes (0 errors)
- [ ] `npm run build` passes (0 errors)
- [ ] Login → session.user.phone populated
- [ ] Modal shows user's phone on open
- [ ] Edit phone → database updated
- [ ] Profile page shows new phone
- [ ] Enter "123456" → verification succeeds
- [ ] Refresh page → phone persists
- [ ] No regressions in existing flows

---

## Expected User Flow

### Current (Broken) Flow
1. User signs up with phone: +61412345678
2. User clicks "Verify Phone"
3. ❌ Modal opens with EMPTY field
4. User must re-type: +61412345678
5. User verifies with OTP
6. User edits phone to: +61412999888
7. ❌ Phone doesn't save anywhere
8. ❌ Profile still shows old phone

### Fixed Flow (Phase 4.9)
1. User signs up with phone: +61412345678
2. User clicks "Verify Phone"
3. ✅ Modal opens with +61412345678 PRE-FILLED
4. User can edit if needed: +61412999888
5. System saves new phone to database
6. System updates session immediately
7. User verifies with OTP (or "123456" for testing)
8. ✅ Profile shows +61412999888
9. ✅ Refresh page → phone still +61412999888

---

## Success Criteria

### Must Have (P0)
✅ Phone number from signup appears in verification modal  
✅ Phone input is editable  
✅ Phone changes save to database  
✅ Phone changes appear in "My Profile" immediately  
✅ Test OTP (123456) works for development  

### Should Have (P1)
✅ Session updates without page refresh  
✅ Phone persists across browser tabs  
✅ Proper error messages for validation failures  

### Nice to Have (P2)
⚠️ Phone number formatting (display with country code)  
⚠️ Country code selector dropdown  
⚠️ Phone number masking for privacy  

---

## Time Estimate
- **Session changes:** 1 hour
- **API creation:** 1 hour
- **UI updates:** 1 hour
- **Testing:** 1 hour
- **Total:** 3-4 hours

---

## Blockers
None - all dependencies exist:
- ✅ User model has phone field
- ✅ ContactVerificationModal exists
- ✅ OTP flow implemented
- ✅ NextAuth session management ready

---

## Next Steps

1. Start with T182 (session types)
2. Complete T183-T184 (auth.ts changes + test)
3. Create T185 (API endpoint)
4. Update T186-T188 (UI integration)
5. Test T189-T191 (verification flow)
6. Complete T192-T194 (full testing)
7. Get user approval
8. Commit Phase 4.9

---

**Document Owner:** Development Team  
**Last Updated:** January 16, 2025  
**Status:** Ready for Implementation
