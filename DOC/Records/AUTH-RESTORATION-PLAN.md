# Auth Restoration Implementation Plan

**Status**: 🚀 READY TO IMPLEMENT  
**Date**: November 9, 2025

---

## 🎯 EXACT CHANGES NEEDED

### Step 1: Restore Modal Files (Copy from Backup)

Copy these 4 files AS-IS from `backup-2025-11-09/src/components/`:
1. `HomeownerSignupModal.tsx`
2. `HomeownerSignInModal.tsx`
3. `InstallerSignupModal.tsx`
4. `InstallerSignInModal.tsx`

---

### Step 2: Update Modal Files (Replace NextAuth with Clerk)

For EACH of the 4 modal files, make these replacements:

#### A. Imports
```typescript
// REMOVE:
import { signIn } from 'next-auth/react';

// ADD:
import { useSignUp, useSignIn, useClerk } from '@clerk/nextjs';
```

#### B. Signup Modals (Homeowner + Installer)

**Remove NextAuth registration**:
```typescript
// REMOVE THIS:
const response = await fetch('/api/auth/register/homeowner', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: formData.email, password: formData.password }),
});

const signInResult = await signIn('credentials', {
  redirect: false,
  email: formData.email,
  password: formData.password,
});
```

**Replace with Clerk SDK**:
```typescript
const { signUp, setActive } = useSignUp();

// For Homeowner:
await signUp.create({
  emailAddress: formData.email,
  password: formData.password,
  unsafeMetadata: { role: 'HOMEOWNER' }
});

// For Installer:
await signUp.create({
  emailAddress: formData.email,
  password: formData.password,
  unsafeMetadata: { role: 'INSTALLER' }
});

// Set session active
await setActive({ session: signUp.createdSessionId });

// Small delay to ensure webhook completes
await new Promise(resolve => setTimeout(resolve, 500));

// Then call onSuccess() which will redirect
```

#### C. Sign-In Modals (Homeowner + Installer)

**Remove NextAuth sign-in**:
```typescript
// REMOVE THIS:
const signInResult = await signIn('credentials', {
  redirect: false,
  email: formData.email,
  password: formData.password,
});
```

**Replace with Clerk SDK**:
```typescript
const { signIn, setActive } = useSignIn();

await signIn.create({
  identifier: formData.email,
  password: formData.password
});

await setActive({ session: signIn.createdSessionId });

// Then call onSuccess() which will redirect
```

---

### Step 3: Update LayoutContent.tsx

**Restore modal state management**:

```typescript
// ADD THESE IMPORTS:
import HomeownerSignupModal from './HomeownerSignupModal';
import HomeownerSignInModal from './HomeownerSignInModal';
import InstallerSignupModal from './InstallerSignupModal';
import InstallerSignInModal from './InstallerSignInModal';

// RESTORE THESE STATES:
const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
const [isInstallerSignInModalOpen, setIsInstallerSignInModalOpen] = useState(false);
const [isInstallerSignupModalOpen, setIsInstallerSignupModalOpen] = useState(false);
const [isHomeownerSignupModalOpen, setIsHomeownerSignupModalOpen] = useState(false);
const [isHomeownerSignInModalOpen, setIsHomeownerSignInModalOpen] = useState(false);

// RESTORE THESE HANDLERS:
const handleBecomePartner = () => {
  setIsEligibilityModalOpen(true); // Open modal, NOT redirect
};

const handleEligible = () => {
  setIsEligibilityModalOpen(false);
  setIsInstallerSignupModalOpen(true); // Open signup modal, NOT redirect
};

const handleLoginClick = () => {
  setIsHomeownerSignInModalOpen(true); // Open modal, NOT redirect
};

const handleSignupClick = () => {
  setIsHomeownerSignupModalOpen(true); // Open modal, NOT redirect
};

const handlePartnerSignIn = () => {
  setIsInstallerSignInModalOpen(true); // Open modal, NOT redirect
};

const handleHomeownerSignupSuccess = async () => {
  setIsHomeownerSignupModalOpen(false);
  router.push('/homeowner/dashboard');
};

const handleInstallerSignupSuccess = async () => {
  setIsInstallerSignupModalOpen(false);
  router.push('/installer/dashboard');
};

const handleHomeownerSignInSuccess = async () => {
  setIsHomeownerSignInModalOpen(false);
  router.push('/homeowner/dashboard');
};

const handleInstallerSignInSuccess = async () => {
  setIsInstallerSignInModalOpen(false);
  router.push('/installer/dashboard');
};
```

**Add modal components to JSX** (before closing `</>` tag):
```tsx
{/* Homeowner Modals */}
<HomeownerSignupModal
  isOpen={isHomeownerSignupModalOpen}
  onClose={() => setIsHomeownerSignupModalOpen(false)}
  onSuccess={handleHomeownerSignupSuccess}
  onSwitchToSignIn={() => {
    setIsHomeownerSignupModalOpen(false);
    setIsHomeownerSignInModalOpen(true);
  }}
/>

<HomeownerSignInModal
  isOpen={isHomeownerSignInModalOpen}
  onClose={() => setIsHomeownerSignInModalOpen(false)}
  onSuccess={handleHomeownerSignInSuccess}
  onSwitchToSignUp={() => {
    setIsHomeownerSignInModalOpen(false);
    setIsHomeownerSignupModalOpen(true);
  }}
/>

{/* Installer Modals */}
<InstallerSignupModal
  isOpen={isInstallerSignupModalOpen}
  onClose={() => setIsInstallerSignupModalOpen(false)}
  onSuccess={handleInstallerSignupSuccess}
  onSwitchToSignIn={() => {
    setIsInstallerSignupModalOpen(false);
    setIsInstallerSignInModalOpen(true);
  }}
/>

<InstallerSignInModal
  isOpen={isInstallerSignInModalOpen}
  onClose={() => setIsInstallerSignInModalOpen(false)}
  onSuccess={handleInstallerSignInSuccess}
  onSwitchToSignUp={handleBecomePartner}
/>
```

---

### Step 4: Remove/Update Sign-Up/Sign-In Pages

#### Option A: Delete Clerk Pages (Recommended)
```bash
# Delete these if we're using modals only:
rm -rf src/app/sign-up
rm -rf src/app/sign-in
```

#### Option B: Keep as Fallback
Keep them but ensure they don't interfere with modal flow.

---

### Step 5: Clean Up

1. **Remove NextAuth imports** from LayoutContent.tsx:
```typescript
// REMOVE:
import { useSession, signOut } from 'next-auth/react';
```

2. **Update Header.tsx** to use modal handlers instead of Clerk buttons:
```typescript
// REMOVE Clerk components:
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

// KEEP UserButton for logged-in state
// REPLACE SignInButton/SignUpButton with props:
interface HeaderProps {
  onLoginClick: () => void;  // Opens HomeownerSignInModal
  onSignupClick: () => void; // Opens HomeownerSignupModal
  // ... other props
}
```

---

## 🧪 TESTING CHECKLIST

After implementation, test:

- [ ] Click "Sign Up" (header) → HomeownerSignupModal opens (modal, not page)
- [ ] Submit homeowner signup → Creates user with role=HOMEOWNER
- [ ] Redirect to /homeowner/dashboard
- [ ] Click "Login" (header) → HomeownerSignInModal opens (modal, not page)
- [ ] Submit homeowner login → Redirects to /homeowner/dashboard
- [ ] Click "Become a Partner" → InstallerEligibilityModal opens
- [ ] Answer all YES → InstallerSignupModal opens (NOT page redirect)
- [ ] Submit installer signup → Creates user with role=INSTALLER
- [ ] Redirect to /installer/dashboard
- [ ] Click "Partner Sign In" → InstallerSignInModal opens (modal, not page)
- [ ] Submit installer login → Redirects to /installer/dashboard
- [ ] All dashboard logouts work

---

## 📦 FILES TO MODIFY

1. ✅ Copy 4 modal files from backup
2. ✅ Update 4 modals (replace NextAuth with Clerk SDK)
3. ✅ Update `LayoutContent.tsx` (restore modal management)
4. ✅ Update `Header.tsx` (remove Clerk buttons, use props)
5. ✅ Delete/update sign-up/sign-in pages
6. ✅ Test all flows

---

**Estimated Time**: 30-45 minutes  
**Complexity**: Medium (find-and-replace with testing)  
**Risk**: Low (backing up current state first)
