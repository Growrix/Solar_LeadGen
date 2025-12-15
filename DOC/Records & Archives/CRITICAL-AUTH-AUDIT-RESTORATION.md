# CRITICAL AUDIT: Original vs Current Authentication Implementation

**Date**: November 9, 2025  
**Status**: 🔴 CRITICAL - Current implementation broken  
**Issue**: Replaced modal-based auth with page-based Clerk, breaking UX and flows

---

## 🚨 PROBLEM SUMMARY

### What We Did Wrong
1. ❌ Replaced custom signup/signin **modals** with Clerk's **page-based** auth
2. ❌ Removed eligibility flow connection to signup
3. ❌ Broke role assignment during signup
4. ❌ Changed UX from modal popups to full-page redirects
5. ❌ Over-complicated the implementation

### What User Wanted
✅ Replace **ONLY NextAuth backend** with Clerk  
✅ Keep **ALL existing UI/UX** (custom modals)  
✅ Keep **ALL existing flows** (eligibility → signup)  
✅ Keep **ALL role assignment logic**

---

## 📊 ORIGINAL IMPLEMENTATION (Backup-2025-11-09)

### Authentication Flow

#### **HOMEOWNER SIGNUP** (Main Header)
```
User clicks "Sign Up" (Header)
  ↓
HomeownerSignupModal OPENS (modal popup, NOT page redirect)
  ↓
Custom form with:
  - Email input
  - Password input
  - Confirm password input
  - Google signup button
  - Apple signup button
  - "Switch to Sign In" link
  ↓
Submit → POST /api/auth/register/homeowner
  ↓
Backend creates user with role='HOMEOWNER'
  ↓
Auto sign-in with NextAuth signIn('credentials')
  ↓
Fetch session → role='HOMEOWNER'
  ↓
Redirect to /homeowner/dashboard
  ↓
Modal CLOSES
```

**Key Files**:
- `HomeownerSignupModal.tsx` - Custom modal component
- `/api/auth/register/homeowner` - Registration endpoint
- NextAuth `signIn('credentials')` - Auto login after signup

---

#### **INSTALLER SIGNUP** (TopBar "Become a Partner")
```
User clicks "Become a Partner" (TopBar)
  ↓
InstallerEligibilityModal OPENS (modal popup)
  ↓
User answers 3 questions:
  1. CEC-accredited? (Yes/No)
  2. Have ABN? (Yes/No)
  3. Provide installation in Australia? (Yes/No)
  ↓
If ALL YES:
  - Eligibility modal CLOSES
  - InstallerSignupModal OPENS (modal popup, NOT page redirect)
  ↓
Custom form with:
  - Email input
  - Password input
  - Confirm password input
  - Google signup button
  - Apple signup button
  - "Switch to Sign In" link
  ↓
Submit → POST /api/auth/register/installer
  ↓
Backend creates user with role='INSTALLER', installerVerified=false
  ↓
Auto sign-in with NextAuth signIn('credentials')
  ↓
Fetch session → role='INSTALLER'
  ↓
Redirect to /installer/dashboard
  ↓
Modal CLOSES
  ↓
If ANY NO:
  - Show "Not Eligible" screen in same modal
  - List missing requirements
  - "Try Again" button
```

**Key Files**:
- `InstallerEligibilityModal.tsx` - Eligibility check modal
- `InstallerSignupModal.tsx` - Custom signup modal
- `/api/auth/register/installer` - Registration endpoint
- NextAuth `signIn('credentials')` - Auto login after signup

---

#### **HOMEOWNER SIGN-IN** (Main Header)
```
User clicks "Login" (Header)
  ↓
HomeownerSignInModal OPENS (modal popup)
  ↓
Custom form with:
  - Email input
  - Password input
  - "Remember me" checkbox
  - Google sign-in button
  - Apple sign-in button
  - "Forgot password?" link
  - "Switch to Sign Up" link
  ↓
Submit → NextAuth signIn('credentials', { email, password })
  ↓
Fetch session → get role
  ↓
Redirect based on role:
  - HOMEOWNER → /homeowner/dashboard
  - INSTALLER → /installer/dashboard
  - ADMIN → /admin/dashboard
  ↓
Modal CLOSES
```

**Key Files**:
- `HomeownerSignInModal.tsx` - Custom signin modal
- NextAuth `signIn('credentials')` - Authentication

---

#### **INSTALLER SIGN-IN** (TopBar "Partner Sign In")
```
User clicks "Partner Sign In" (TopBar)
  ↓
InstallerSignInModal OPENS (modal popup)
  ↓
Custom form with:
  - Email input
  - Password input
  - "Remember me" checkbox
  - Google sign-in button
  - Apple sign-in button
  - "Forgot password?" link
  - "Switch to Sign Up" link (opens eligibility modal)
  ↓
Submit → NextAuth signIn('credentials', { email, password })
  ↓
Fetch session → get role
  ↓
Redirect based on role:
  - INSTALLER → /installer/dashboard
  - HOMEOWNER → /homeowner/dashboard
  - ADMIN → /admin/dashboard
  ↓
Modal CLOSES
```

**Key Files**:
- `InstallerSignInModal.tsx` - Custom signin modal
- NextAuth `signIn('credentials')` - Authentication

---

### Modal State Management (LayoutContent.tsx)

```typescript
// ORIGINAL STATE MANAGEMENT
const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
const [isInstallerSignInModalOpen, setIsInstallerSignInModalOpen] = useState(false);
const [isInstallerSignupModalOpen, setIsInstallerSignupModalOpen] = useState(false);
const [isHomeownerSignupModalOpen, setIsHomeownerSignupModalOpen] = useState(false);
const [isHomeownerSignInModalOpen, setIsHomeownerSignInModalOpen] = useState(false);

// HANDLERS
const handleBecomePartner = () => {
  setIsEligibilityModalOpen(true); // Open modal
};

const handleEligible = () => {
  setIsEligibilityModalOpen(false);
  setIsInstallerSignupModalOpen(true); // Open signup modal
};

const handleLoginClick = () => {
  setIsHomeownerSignInModalOpen(true); // Open modal
};

const handleSignupClick = () => {
  setIsHomeownerSignupModalOpen(true); // Open modal
};
```

---

## ❌ CURRENT BROKEN IMPLEMENTATION

### What Changed (WRONG)

#### **HOMEOWNER SIGNUP** (Current - BROKEN)
```
User clicks "Sign Up" (Header)
  ↓
Clerk <SignUpButton mode="modal"> → Opens Clerk's modal ❌
  ↓
OR redirects to /sign-up page ❌
  ↓
Clerk's default UI (no customization) ❌
  ↓
No role assignment ❌
  ↓
Creates user with default role (HOMEOWNER?) ❌
  ↓
Redirect happens but role not set correctly ❌
```

**Problems**:
1. ❌ Lost custom modal UI
2. ❌ Lost custom form design
3. ❌ Lost neumorphic styling
4. ❌ Clerk modal doesn't match design system
5. ❌ Page-based auth breaks UX flow

---

#### **INSTALLER SIGNUP** (Current - BROKEN)
```
User clicks "Become a Partner" (TopBar)
  ↓
InstallerEligibilityModal OPENS (still works ✅)
  ↓
User answers questions, all YES
  ↓
Eligibility modal closes
  ↓
Redirects to /sign-up?role=installer ❌
  ↓
Shows Clerk signup page (full page, NOT modal) ❌
  ↓
Sign-up page tries to set unsafeMetadata.role ❌
  ↓
BUT: Clerk webhook receives user.created
  ↓
Webhook looks for unsafe_metadata.role OR public_metadata.role
  ↓
BUT: User is redirected to /installer/dashboard BEFORE webhook completes ❌
  ↓
Middleware checks role → role not set yet (database lag)
  ↓
User created with default HOMEOWNER role ❌
  ↓
Redirects to /homeowner/dashboard (WRONG!) ❌
```

**Problems**:
1. ❌ Replaced modal with page redirect
2. ❌ Lost direct connection: eligibility → signup
3. ❌ Race condition: redirect before webhook completes
4. ❌ Role not set correctly (webhook timing issue)
5. ❌ Installer redirected to homeowner dashboard
6. ❌ Lost custom modal UI

---

## 🎯 CORRECT SOLUTION

### What We Need To Do

1. **Keep Clerk as backend** ✅
2. **Restore custom modals** ✅
3. **Replace NextAuth calls with Clerk SDK** ✅
4. **Keep ALL original flows** ✅

---

### Corrected Implementation Plan

#### **HOMEOWNER SIGNUP** (Corrected)
```
User clicks "Sign Up" (Header)
  ↓
HomeownerSignupModal OPENS (custom modal, restored from backup)
  ↓
Custom form (same UI as before)
  ↓
Submit → Use Clerk SDK:
  const { signUp } = useSignUp();
  await signUp.create({
    emailAddress: formData.email,
    password: formData.password,
    unsafeMetadata: { role: 'HOMEOWNER' }
  });
  await signUp.prepareEmailAddressVerification();
  await signUp.attemptEmailAddressVerification({ code });
  ↓
OR skip verification and set session directly
  await setActive({ session: signUp.createdSessionId });
  ↓
Webhook creates database user with role='HOMEOWNER'
  ↓
Redirect to /homeowner/dashboard
  ↓
Modal CLOSES
```

---

#### **INSTALLER SIGNUP** (Corrected)
```
User clicks "Become a Partner" (TopBar)
  ↓
InstallerEligibilityModal OPENS
  ↓
User answers all YES
  ↓
Eligibility modal CLOSES
  ↓
InstallerSignupModal OPENS (custom modal, restored from backup) ✅
  ↓
Custom form (same UI as before)
  ↓
Submit → Use Clerk SDK:
  const { signUp } = useSignUp();
  await signUp.create({
    emailAddress: formData.email,
    password: formData.password,
    unsafeMetadata: { role: 'INSTALLER' }
  });
  await setActive({ session: signUp.createdSessionId });
  ↓
Webhook creates database user with role='INSTALLER', installerVerified=false
  ↓
Wait for session to be fully set (small delay or callback)
  ↓
Redirect to /installer/dashboard
  ↓
Modal CLOSES
```

---

#### **HOMEOWNER SIGN-IN** (Corrected)
```
User clicks "Login" (Header)
  ↓
HomeownerSignInModal OPENS (custom modal, restored from backup)
  ↓
Custom form (same UI as before)
  ↓
Submit → Use Clerk SDK:
  const { signIn } = useSignIn();
  await signIn.create({
    identifier: formData.email,
    password: formData.password
  });
  await setActive({ session: signIn.createdSessionId });
  ↓
Fetch user role from database or Clerk publicMetadata
  ↓
Redirect based on role
  ↓
Modal CLOSES
```

---

#### **INSTALLER SIGN-IN** (Corrected)
```
User clicks "Partner Sign In" (TopBar)
  ↓
InstallerSignInModal OPENS (custom modal, restored from backup)
  ↓
Custom form (same UI as before)
  ↓
Submit → Use Clerk SDK (same as homeowner)
  ↓
Redirect based on role
  ↓
Modal CLOSES
```

---

## 📝 FILES TO RESTORE/MODIFY

### Files to RESTORE from Backup
1. ✅ `src/components/HomeownerSignupModal.tsx`
2. ✅ `src/components/HomeownerSignInModal.tsx`
3. ✅ `src/components/InstallerSignupModal.tsx`
4. ✅ `src/components/InstallerSignInModal.tsx`
5. ✅ `src/components/LayoutContent.tsx` (modal state management)

### Files to MODIFY (Replace NextAuth with Clerk SDK)
1. ✅ Replace `signIn('credentials')` with Clerk `useSignIn()`
2. ✅ Replace `signIn('google')` with Clerk OAuth
3. ✅ Replace `signOut()` with Clerk `signOut()`
4. ✅ Replace `/api/auth/register/*` with Clerk signup
5. ✅ Remove `/api/auth/[...nextauth]` route
6. ✅ Keep webhook for database sync

### Files to KEEP
1. ✅ `src/components/InstallerEligibilityModal.tsx` (already working)
2. ✅ `src/app/api/webhooks/clerk/route.ts` (webhook)
3. ✅ `src/middleware.ts` (role-based routing)

---

## 🔄 MIGRATION STEPS

### Phase 1: Restore Custom Modals
1. Copy `HomeownerSignupModal.tsx` from backup
2. Copy `HomeownerSignInModal.tsx` from backup
3. Copy `InstallerSignupModal.tsx` from backup
4. Copy `InstallerSignInModal.tsx` from backup
5. Restore modal state management in `LayoutContent.tsx`

### Phase 2: Replace NextAuth with Clerk SDK
1. In `HomeownerSignupModal`:
   - Replace `fetch('/api/auth/register/homeowner')` with Clerk `signUp.create()`
   - Replace `signIn('credentials')` with `setActive({ session })`
   - Keep Google/Apple buttons, use Clerk OAuth

2. In `InstallerSignupModal`:
   - Replace `fetch('/api/auth/register/installer')` with Clerk `signUp.create()`
   - Add `unsafeMetadata: { role: 'INSTALLER' }`
   - Replace `signIn('credentials')` with `setActive({ session })`

3. In `HomeownerSignInModal`:
   - Replace `signIn('credentials')` with Clerk `signIn.create()`
   - Use `setActive({ session })`

4. In `InstallerSignInModal`:
   - Same as HomeownerSignInModal

### Phase 3: Remove NextAuth Remnants
1. Delete `/api/auth/register/homeowner`
2. Delete `/api/auth/register/installer`
3. Delete `/api/auth/[...nextauth]` route
4. Remove `next-auth` from package.json
5. Remove NextAuth types and imports

### Phase 4: Test All Flows
1. Test homeowner signup (header)
2. Test homeowner sign-in (header)
3. Test installer eligibility → signup (topbar)
4. Test installer sign-in (topbar)
5. Test role-based redirects
6. Test dashboard logouts

---

## ✅ SUCCESS CRITERIA

- [ ] Custom modals restored (NOT page-based auth)
- [ ] Eligibility → Signup flow works (modal → modal)
- [ ] Role assignment works correctly (INSTALLER, HOMEOWNER, ADMIN)
- [ ] All redirects work (role-based)
- [ ] Neumorphic design preserved in modals
- [ ] Google/Apple OAuth works
- [ ] No race conditions (role set before redirect)
- [ ] All dashboard logouts work

---

## 🚨 CRITICAL ISSUES TO FIX

### Issue 1: Installer Signup Creates HOMEOWNER
**Root Cause**: Clerk page-based signup doesn't properly set role before redirect  
**Fix**: Use custom modal with Clerk SDK, set role in `unsafeMetadata` BEFORE redirect

### Issue 2: Page-Based Auth Breaks UX
**Root Cause**: Replaced modals with `/sign-up` and `/sign-in` pages  
**Fix**: Restore custom modals, use Clerk SDK inside modals

### Issue 3: Lost Eligibility → Signup Connection
**Root Cause**: Eligibility modal redirects to page instead of opening signup modal  
**Fix**: Restore `handleEligible()` to open `InstallerSignupModal`

---

## 📚 REFERENCES

**Original Working Files** (Backup-2025-11-09):
- `src/components/LayoutContent.tsx` - Lines 1-487
- `src/components/HomeownerSignupModal.tsx`
- `src/components/HomeownerSignInModal.tsx`
- `src/components/InstallerSignupModal.tsx`
- `src/components/InstallerSignInModal.tsx`
- `src/app/api/auth/register/homeowner/route.ts`
- `src/app/api/auth/register/installer/route.ts`

**Clerk SDK Documentation**:
- `useSignUp()` hook
- `useSignIn()` hook
- `useClerk()` hook
- OAuth providers

---

**Status**: ✅ Audit complete - Ready for implementation  
**Next Step**: Restore custom modals and replace NextAuth with Clerk SDK
