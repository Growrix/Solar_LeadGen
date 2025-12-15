# Installer Authentication Flow Audit

**Date**: November 9, 2025  
**Purpose**: Audit and implement proper installer signup flow with eligibility check  
**Status**: 🔄 IN PROGRESS

---

## 📋 Current State Analysis

### Main Header (Header.tsx)
**Purpose**: Guest users to become homeowners

**Current Implementation**:
```typescript
// Login/Signup buttons use Clerk
<SignInButton mode="modal">
  <button>Login</button>
</SignInButton>
<SignUpButton mode="modal">
  <button>Sign Up</button>
</SignUpButton>
```

**Status**: ✅ **CORRECT** - Uses Clerk authentication for homeowner signups

---

### TopBar (TopBar.tsx)
**Purpose**: Installer-specific authentication

**Current Buttons**:
1. **"Become a Partner"** - For new installer signups
2. **"Partner Sign In"** - For existing installer logins

**Current Implementation**:
```typescript
const handleBecomePartner = () => {
  router.push('/sign-up');  // ❌ Direct to Clerk signup without eligibility check
};

const handlePartnerSignIn = () => {
  router.push('/sign-in');  // ✅ Correct - Clerk sign-in
};
```

**Issues**:
- ❌ "Become a Partner" bypasses `InstallerEligibilityModal`
- ❌ No role distinction during signup (homeowner vs installer)
- ❌ No CEC accreditation check
- ❌ No ABN verification check
- ❌ No Australia service area check

---

## 🎯 Required User Flows

### Flow 1: Homeowner Signup (Main Header)
```
Guest → Click "Sign Up" (Header)
  → Clerk SignUpButton modal
  → Create account
  → Set role: HOMEOWNER (default)
  → Redirect to /homeowner/dashboard
```

**Status**: ✅ Working (Clerk handles this)

---

### Flow 2: Homeowner Login (Main Header)
```
Guest → Click "Login" (Header)
  → Clerk SignInButton modal
  → Enter credentials
  → Redirect based on role:
    - HOMEOWNER → /homeowner/dashboard
    - INSTALLER → /installer/dashboard
    - ADMIN → /admin/dashboard
```

**Status**: ✅ Working (middleware handles role-based redirects)

---

### Flow 3: Installer Signup (TopBar "Become a Partner")
```
Guest → Click "Become a Partner" (TopBar)
  → Open InstallerEligibilityModal
  → User answers 3 questions:
    1. CEC-accredited installer? (Yes/No)
    2. Have ABN? (Yes/No)
    3. Provide installation services in Australia? (Yes/No)
  
  → If ALL YES:
    ✅ Close eligibility modal
    ✅ Open Clerk signup OR redirect to /sign-up with installer metadata
    ✅ During signup, set publicMetadata.role = "INSTALLER"
    ✅ Create database user with role = INSTALLER, installerVerified = false
    ✅ Redirect to /installer/dashboard (pending verification view)
  
  → If ANY NO:
    ❌ Show "Not Eligible" message
    ❌ List which requirements not met
    ❌ Provide "Try Again" button
```

**Status**: ❌ **BROKEN** - Currently bypasses eligibility modal

---

### Flow 4: Installer Login (TopBar "Partner Sign In")
```
Installer → Click "Partner Sign In" (TopBar)
  → Redirect to /sign-in (Clerk)
  → Enter credentials
  → Middleware checks role
  → Redirect to /installer/dashboard
  → If installerVerified = false:
    - Show "Pending Verification" banner
    - Limited access to features
  → If installerVerified = true:
    - Full access to marketplace
    - Can purchase leads
```

**Status**: ✅ Working (Clerk + middleware handles this)

---

## 🔧 Technical Implementation Plan

### Option 1: Use Clerk's Built-in Signup (RECOMMENDED)
**Pros**:
- ✅ No custom modal needed
- ✅ Clerk handles password security, email verification
- ✅ Can set `publicMetadata` during signup
- ✅ Integrates with existing auth flow

**Implementation**:
```typescript
// In LayoutContent.tsx
const handleBecomePartner = () => {
  setIsEligibilityModalOpen(true);  // Show eligibility first
};

const handleEligible = () => {
  setIsEligibilityModalOpen(false);
  // Redirect to Clerk signup with installer role indication
  router.push('/sign-up?role=installer');
};
```

**Then in /sign-up page**:
```typescript
// Check URL param and set metadata during signup
const searchParams = useSearchParams();
const role = searchParams.get('role');

// During Clerk signup, set:
await signUp.create({
  emailAddress,
  password,
  unsafeMetadata: { role: role === 'installer' ? 'INSTALLER' : 'HOMEOWNER' }
});
```

---

### Option 2: Custom Installer Signup Modal with Clerk
**Pros**:
- ✅ More control over UI
- ✅ Can collect additional installer details (business name, CEC number, ABN)
- ✅ Better UX for installers

**Cons**:
- ❌ More code to maintain
- ❌ Need to integrate with Clerk SDK directly
- ❌ Duplicate signup UI

**Implementation**:
```typescript
// Create new InstallerSignupModal.tsx (Clerk-based)
const handleSignup = async () => {
  const { signUp } = useSignUp();
  
  await signUp.create({
    emailAddress: formData.email,
    password: formData.password,
    unsafeMetadata: {
      role: 'INSTALLER',
      businessName: formData.businessName,
      cecNumber: formData.cecNumber,
      abn: formData.abn
    }
  });
  
  // Webhook will create database user with INSTALLER role
  router.push('/installer/dashboard');
};
```

---

## 🎨 Current Component States

### InstallerEligibilityModal
**Location**: `src/components/InstallerEligibilityModal.tsx`  
**Status**: ✅ EXISTS and working  
**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `onEligible: () => void` - Called when user is eligible

**Questions**:
1. Are you a CEC-accredited installer? (Yes/No)
2. Do you have an ABN? (Yes/No)
3. Do you provide installation services in Australia? (Yes/No)

**Logic**:
- If all 3 = YES → Call `onEligible()`
- If any = NO → Show "Not Eligible" screen with reasons

---

### InstallerSignupModal (OLD - NextAuth)
**Location**: `backup-2025-11-09/src/components/InstallerSignupModal.tsx`  
**Status**: ❌ NOT IN CURRENT SRC (uses NextAuth, outdated)  
**Note**: This file uses NextAuth which was replaced by Clerk

---

## 📝 Required Changes

### 1. Update LayoutContent.tsx ✅

**Current**:
```typescript
const handleBecomePartner = () => {
  router.push('/sign-up');  // ❌ Bypasses eligibility
};
```

**Change To**:
```typescript
const handleBecomePartner = () => {
  setIsEligibilityModalOpen(true);  // ✅ Show eligibility first
};

const handleEligible = () => {
  setIsEligibilityModalOpen(false);
  router.push('/sign-up?role=installer');  // ✅ Pass role indicator
};
```

---

### 2. Update TopBar.tsx (IF NEEDED)

**Current**:
```typescript
<button onClick={onBecomePartnerClick}>
  Become a Partner
</button>
```

**Status**: ✅ Already correct (uses prop from LayoutContent)

---

### 3. Create Custom Sign-Up Page (Optional)

**Option A**: Use Clerk's default signup  
**Option B**: Create custom `/sign-up` page that:
- Checks `?role=installer` param
- Shows different UI for installers vs homeowners
- Sets `publicMetadata.role` during signup

---

### 4. Ensure Webhook Sets Role Correctly

**Current Webhook** (`/api/webhooks/clerk`):
```typescript
// Should check if user has role in publicMetadata
const role = evt.data.public_metadata?.role || 'HOMEOWNER';

await prisma.user.create({
  data: {
    clerkUserId: evt.data.id,
    email: evt.data.email_addresses[0].email_address,
    role: role,
    installerVerified: role === 'INSTALLER' ? false : null,
  }
});
```

**Status**: ⚠️ Need to verify webhook handles `publicMetadata.role`

---

## 🧪 Testing Checklist

### Homeowner Flow (Header)
- [ ] Click "Sign Up" (header) → Opens Clerk signup modal
- [ ] Create account → Database user created with role = HOMEOWNER
- [ ] Login → Redirects to /homeowner/dashboard
- [ ] Logout (dashboard) → Session cleared, redirects to /
- [ ] Logout (header UserButton) → Session cleared

### Installer Flow (TopBar)
- [ ] Click "Become a Partner" → Opens eligibility modal
- [ ] Answer all YES → Eligibility modal closes
- [ ] Redirects to signup → Clerk signup with installer role
- [ ] Create account → Database user created with role = INSTALLER, installerVerified = false
- [ ] Login → Redirects to /installer/dashboard
- [ ] Dashboard shows "Pending Verification" banner
- [ ] Logout (dashboard) → Session cleared, redirects to /

### Installer Sign-In (TopBar)
- [ ] Click "Partner Sign In" → Redirects to /sign-in
- [ ] Enter credentials → Middleware checks role
- [ ] Redirects to /installer/dashboard
- [ ] Logout works correctly

### Admin Flow (Direct URL)
- [ ] Navigate to /admin → Redirects to /sign-in
- [ ] Login with admin credentials → Redirects to /admin/dashboard
- [ ] Logout works correctly

---

## 🚨 Critical Issues to Fix

### Issue 1: TopBar "Become a Partner" Bypasses Eligibility
**Priority**: 🔴 HIGH  
**Impact**: Unqualified installers can sign up  
**Fix**: Update `handleBecomePartner` to open eligibility modal first

### Issue 2: No Role Distinction During Signup
**Priority**: 🔴 HIGH  
**Impact**: All signups become homeowners by default  
**Fix**: Pass `?role=installer` param and update signup logic

### Issue 3: Installer Verification Flow Unclear
**Priority**: 🟡 MEDIUM  
**Impact**: Installers might not understand why they have limited access  
**Fix**: Add clear "Pending Verification" banner in installer dashboard

---

## 📚 Related Files

### Components
- `src/components/TopBar.tsx` - TopBar with installer buttons
- `src/components/Header.tsx` - Main header with homeowner login/signup
- `src/components/LayoutContent.tsx` - Layout wrapper with modal state management
- `src/components/InstallerEligibilityModal.tsx` - Eligibility check modal

### Layouts
- `src/app/installer/layout.tsx` - Installer dashboard layout with logout
- `src/app/homeowner/layout.tsx` - Homeowner dashboard layout with logout
- `src/app/admin/layout.tsx` - Admin dashboard layout with logout

### API Routes
- `src/app/api/webhooks/clerk/route.ts` - Clerk webhook for user creation
- `src/app/api/user/sync/route.ts` - User role sync endpoint

### Middleware
- `src/middleware.ts` - Role-based route protection and redirects

---

## 🎯 Recommended Solution

**RECOMMENDATION**: Use **Option 1** (Clerk's built-in signup with URL param)

**Why**:
1. ✅ Minimal code changes
2. ✅ Leverages existing Clerk integration
3. ✅ No custom modal to maintain
4. ✅ Clerk handles security best practices
5. ✅ Consistent with homeowner signup flow

**Implementation Steps**:
1. Update `handleBecomePartner` to open eligibility modal ✅
2. Update `handleEligible` to redirect to `/sign-up?role=installer` ✅
3. Create custom `/sign-up` page that reads `role` param ✅
4. Set `publicMetadata.role` during Clerk signup ✅
5. Verify webhook creates database user with correct role ✅
6. Test end-to-end flow ✅

---

## 📊 Current vs Desired State

### Current State
```
TopBar "Become a Partner" 
  → Directly to /sign-up 
  → No eligibility check ❌
  → No role set ❌
  → Creates HOMEOWNER by default ❌
```

### Desired State
```
TopBar "Become a Partner"
  → InstallerEligibilityModal ✅
  → Check CEC/ABN/Australia ✅
  → If eligible: /sign-up?role=installer ✅
  → Set publicMetadata.role = INSTALLER ✅
  → Webhook creates INSTALLER user ✅
  → Redirect to /installer/dashboard ✅
```

---

## 🔄 Next Steps

1. **Update LayoutContent.tsx**:
   - Change `handleBecomePartner` to open eligibility modal
   - Change `handleEligible` to redirect with role param

2. **Create /sign-up Custom Page** (optional but recommended):
   - Read `?role` param from URL
   - Show installer-specific UI if role=installer
   - Set `publicMetadata.role` during signup

3. **Verify Webhook**:
   - Check `/api/webhooks/clerk` handles `publicMetadata.role`
   - Ensure database user created with correct role

4. **Test All Flows**:
   - Homeowner signup (header)
   - Installer signup (topbar + eligibility)
   - Partner sign-in (topbar)
   - All dashboard logouts

5. **Document**:
   - Update this audit with test results
   - Create user flow diagrams
   - Add to project documentation

---

**Last Updated**: November 9, 2025  
**Status**: Ready for implementation
