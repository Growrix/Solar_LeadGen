# Clerk Authentication Migration Plan (REVISED)

**Date**: 2025-11-09  
**Status**: CRITICAL REVISION - Delete Legacy First Approach  
**Previous Approach**: ❌ Piecemeal migration (caused conflicts)  
**New Approach**: ✅ Complete cleanup → Fresh rebuild

---

## 🎯 REVISED MIGRATION STRATEGY

### Why This Revision?
**Problem Identified**: Migrating components one-by-one while legacy auth system remained active caused:
- Runtime errors (`useSession` conflicts)
- Build failures (bcryptjs dependencies)
- Mixed authentication state
- Cascading failures
- Missing components discovered late

**Solution**: **DELETE ALL LEGACY AUTH FIRST**, then rebuild cleanly with Clerk

### Core Principle:
> "I need a clean and fresh authentication system" - User Requirement

---

## 📋 COMPLETE PHASE BREAKDOWN

### ✅ PHASE 0: Backup & Audit (COMPLETED)
**Status**: ✅ DONE (2025-11-09)

**Completed Actions**:
- [x] Created backup: `backup-2025-11-09/` (909 files)
- [x] Documented Type 1 flow (Simple Header Signup)
- [x] Documented Type 2 flow (Quote-Driven Signup)
- [x] Identified all legacy components (11 files, ~2500 lines)
- [x] Identified all pages using NextAuth (9 pages)
- [x] Created comprehensive audit: `DOC/AUTH-FLOW-COMPLETE-AUDIT.md`
- [x] Identified missing component: DetailedInformationModal

---

### ✅ PHASE 1: Clerk Infrastructure (COMPLETED)
**Status**: ✅ DONE (2025-11-09)

**Completed Actions**:
- [x] Installed @clerk/nextjs package
- [x] Added environment variables:
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
  - NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  - NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  - NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
  - NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
- [x] Wrapped app with ClerkProvider in root layout
- [x] Created /sign-in page
- [x] Created /sign-up page
- [x] Created /dashboard redirect handler (role-based routing)
- [x] Created Clerk webhook: /api/webhooks/clerk
  - Syncs users to Prisma on signup
  - Sets role from unsafe_metadata or defaults to HOMEOWNER
  - Updates publicMetadata with role
- [x] Created user sync API: /api/user/sync
  - Auto-creates users on first middleware access
  - Returns role for middleware protection

---

### ✅ PHASE 2: Database Migration (COMPLETED)
**Status**: ✅ DONE (2025-11-09)

**Completed Actions**:
- [x] Updated Prisma schema:
  ```prisma
  model User {
    id        String   @id @default(cuid())
    clerkId   String   @unique  // Added
    password  String?  // Removed (made optional, will be deleted)
    // ... other fields
  }
  
  // Deleted NextAuth models:
  // - Account
  // - Session
  // - VerificationToken
  ```
- [x] Created migration: `20251109063342_clerk_auth_migration`
- [x] Applied migration: `npx prisma migrate deploy`
- [x] Regenerated Prisma Client: `npx prisma generate`
- [x] Verified database: Users table has clerkId column

---

### ✅ PHASE 5: Middleware (COMPLETED - Done Early)
**Status**: ✅ DONE (2025-11-09)

**Why Done Early**: Fixed middleware to unblock development

**Completed Actions**:
- [x] Replaced NextAuth middleware with clerkMiddleware
- [x] Implemented role-based route protection:
  - /admin/* → requires ADMIN role
  - /installer/* → requires INSTALLER role
  - /homeowner/* → requires HOMEOWNER role
- [x] Added user auto-creation via /api/user/sync (Edge runtime workaround)
- [x] Set default role to HOMEOWNER for new users
- [x] Protected API routes: /api/leads, /api/bids, etc.

**File**: `src/middleware.ts`

---

### 🚧 PHASE 3: Delete ALL Legacy Auth (CRITICAL - DO NOW)
**Status**: ⏳ PENDING (BLOCKING ALL OTHER WORK)

**Priority**: 🔥 URGENT - Must complete before any other migration work

#### Step 3.1: Delete Modal Components
**Estimated Time**: 5 minutes

```powershell
# Delete 6 modal files (~1500 lines total)
Remove-Item "src\components\HomeownerSignupModal.tsx"
Remove-Item "src\components\HomeownerSignInModal.tsx"
Remove-Item "src\components\InstallerSignupModal.tsx"
Remove-Item "src\components\InstallerSignInModal.tsx"
Remove-Item "src\components\AdminSignInModal.tsx"
Remove-Item "src\components\DetailedQuoteAuthModal.tsx"
```

**Files to Delete**:
| File | Lines | Last Used In |
|------|-------|--------------|
| HomeownerSignupModal.tsx | 432 | page.tsx (homepage) |
| HomeownerSignInModal.tsx | ~300 | blog/post/page.tsx |
| InstallerSignupModal.tsx | ~400 | LayoutContent.tsx |
| InstallerSignInModal.tsx | ~300 | LayoutContent.tsx |
| AdminSignInModal.tsx | 146 | admin/page.tsx |
| DetailedQuoteAuthModal.tsx | 200 | (unused) |

**Verification**:
```powershell
# Verify files are deleted
Test-Path "src\components\*SignupModal.tsx" # Should return False
Test-Path "src\components\*SignInModal.tsx" # Should return False
Test-Path "src\components\DetailedQuoteAuthModal.tsx" # Should return False
```

---

#### Step 3.2: Delete Auth Configuration Files
**Estimated Time**: 2 minutes

```powershell
# Delete 3 config files (~250 lines total)
Remove-Item "src\lib\auth.ts"
Remove-Item "src\types\next-auth.d.ts"
Remove-Item "src\components\NextAuthProvider.tsx"
```

**Files to Delete**:
| File | Lines | Purpose |
|------|-------|---------|
| src/lib/auth.ts | 170 | NextAuth configuration |
| src/types/next-auth.d.ts | ~30 | TypeScript type extensions |
| src/components/NextAuthProvider.tsx | ~50 | Session provider wrapper |

**Verification**:
```powershell
Test-Path "src\lib\auth.ts" # Should return False
Test-Path "src\types\next-auth.d.ts" # Should return False
Test-Path "src\components\NextAuthProvider.tsx" # Should return False
```

---

#### Step 3.3: Delete Legacy API Routes
**Estimated Time**: 2 minutes

```powershell
# Delete 2 registration routes (~376 lines total)
Remove-Item -Recurse "src\app\api\auth\register"

# Note: /api/auth/[...nextauth] already deleted (2025-11-09)
```

**Files to Delete**:
| File | Lines | Purpose |
|------|-------|---------|
| src/app/api/auth/register/homeowner/route.ts | 163 | Custom homeowner signup |
| src/app/api/auth/register/installer/route.ts | 213 | Custom installer signup |

**Verification**:
```powershell
Test-Path "src\app\api\auth\register" # Should return False
```

---

#### Step 3.4: Remove Legacy Package Dependencies
**Estimated Time**: 2 minutes

```bash
npm uninstall next-auth bcryptjs @types/bcryptjs
```

**Verification**:
```bash
npm list next-auth # Should show: (empty)
npm list bcryptjs # Should show: (empty)
```

---

#### Step 3.5: Remove Imports from All Pages (Auto-cleanup)
**Estimated Time**: 10 minutes

**Files with Legacy Imports** (will cause TypeScript errors after deletion):
1. `src/app/page.tsx` (line 11)
   ```typescript
   // ❌ REMOVE
   import HomeownerSignupModal from '../components/HomeownerSignupModal';
   ```

2. `src/app/blog/post/page.tsx` (line 8)
   ```typescript
   // ❌ REMOVE
   import HomeownerSignInModal from '@/components/HomeownerSignInModal'
   ```

3. `src/app/admin/page.tsx` (line 5)
   ```typescript
   // ❌ REMOVE
   import AdminSignInModal from '@/components/AdminSignInModal'
   ```

4. `src/components/LayoutContent.tsx`
   ```typescript
   // ❌ REMOVE
   import InstallerSignupModal from './InstallerSignupModal'
   import InstallerSignInModal from './InstallerSignInModal'
   ```

5. All installer pages (5 files)
   ```typescript
   // ❌ REMOVE
   import { useSession, signOut } from 'next-auth/react'
   ```

6. `src/app/homeowner/dashboard/page.tsx` (line 613)
   ```typescript
   // Already partially fixed, just needs cleanup
   ```

**Strategy**: 
- After deleting files, TypeScript will show errors
- Use errors to find all remaining imports
- Remove imports and update code to use Clerk

**Verification Commands**:
```powershell
# Search for any remaining NextAuth imports (should return 0)
Select-String -Path "src\**\*.tsx" -Pattern "next-auth"
Select-String -Path "src\**\*.tsx" -Pattern "HomeownerSignupModal|HomeownerSignInModal"
Select-String -Path "src\**\*.tsx" -Pattern "InstallerSignupModal|InstallerSignInModal"
Select-String -Path "src\**\*.tsx" -Pattern "AdminSignInModal|DetailedQuoteAuthModal"
```

---

#### Step 3.6: Verify Clean State
**Estimated Time**: 5 minutes

**Run All Verification Checks**:
```powershell
# 1. Check deleted files
@(
  "src\components\HomeownerSignupModal.tsx",
  "src\components\HomeownerSignInModal.tsx",
  "src\components\InstallerSignupModal.tsx",
  "src\components\InstallerSignInModal.tsx",
  "src\components\AdminSignInModal.tsx",
  "src\components\DetailedQuoteAuthModal.tsx",
  "src\lib\auth.ts",
  "src\types\next-auth.d.ts",
  "src\components\NextAuthProvider.tsx",
  "src\app\api\auth\register"
) | ForEach-Object {
  if (Test-Path $_) {
    Write-Host "❌ STILL EXISTS: $_" -ForegroundColor Red
  } else {
    Write-Host "✅ DELETED: $_" -ForegroundColor Green
  }
}

# 2. Check for NextAuth imports (should return 0 matches)
$imports = Select-String -Path "src\**\*.tsx" -Pattern "next-auth|HomeownerSignupModal|InstallerSignupModal|AdminSignInModal|DetailedQuoteAuthModal"
if ($imports.Count -eq 0) {
  Write-Host "✅ No legacy imports found" -ForegroundColor Green
} else {
  Write-Host "❌ Found $($imports.Count) legacy imports:" -ForegroundColor Red
  $imports | ForEach-Object { Write-Host "   $($_.Path):$($_.LineNumber)" }
}

# 3. Check package.json
$pkg = Get-Content "package.json" | ConvertFrom-Json
if ($pkg.dependencies.'next-auth' -or $pkg.dependencies.'bcryptjs') {
  Write-Host "❌ Legacy packages still in package.json" -ForegroundColor Red
} else {
  Write-Host "✅ Legacy packages removed" -ForegroundColor Green
}
```

**Success Criteria**:
- ✅ All 9 legacy files deleted
- ✅ No legacy imports in any file
- ✅ No next-auth or bcryptjs in package.json
- ✅ TypeScript shows only expected errors (missing Clerk implementations)

---

### 🔄 PHASE 4: Create Missing Components (AFTER CLEANUP)
**Status**: ⏳ PENDING (Blocked by Phase 3)

**Priority**: 🟡 HIGH - Required for Type 2 flow

#### Step 4.1: Create DetailedInformationModal Component
**Estimated Time**: 30 minutes

**File**: `src/components/DetailedInformationModal.tsx`

**Purpose**: Collect additional user info after Clerk signup in Type 2 flow

**Requirements**:
- **Fields**:
  - Full Name (text input, required)
  - Phone Number (text input, Australian format, required)
  - Property Address (autocomplete with Google Places API, required)
- **Validation**:
  - Name: Min 2 characters, max 100 characters
  - Phone: Australian mobile format (+61 4XX XXX XXX or 04XX XXX XXX)
  - Address: Must be valid Australian address (validated by Google Places API)
- **Styling**: Use theme-card, theme-input, Button components (centralized design system)
- **API Integration**:
  - PATCH /api/user → Update name and phone
  - Return user object on success
- **Error Handling**:
  - Display validation errors inline
  - Show API errors in toast/alert
- **User Experience**:
  - Modal closes on successful submission
  - Parent component receives collected data
  - Parent submits lead with address

**Component Structure**:
```typescript
interface DetailedInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    address: string;
  }) => Promise<void>;
}

// Flow:
// 1. User fills form
// 2. Validates fields client-side
// 3. Calls PATCH /api/user with name + phone
// 4. On success, calls onSubmit() with all data (including address)
// 5. Parent component submits lead with address
// 6. Shows success modal
```

**Verification**:
- [ ] Component renders correctly
- [ ] All fields validate properly
- [ ] Australian phone format works
- [ ] Google Places autocomplete works
- [ ] API call updates user in database
- [ ] onSubmit callback receives correct data
- [ ] Modal closes on success
- [ ] Errors display correctly

---

#### Step 4.2: Create Instant Quote Complete Page
**Estimated Time**: 45 minutes

**File**: `src/app/instant-quote/complete/page.tsx`

**Purpose**: Handle post-Clerk-signup redirect for Type 2 flow

**Requirements**:
- **URL**: `/instant-quote/complete`
- **Protected**: Requires authentication (Clerk middleware)
- **Responsibilities**:
  1. Retrieve `pendingQuoteData` from sessionStorage
  2. Show DetailedInformationModal
  3. On modal submit:
     - Submit lead to /api/leads with quoteData + address
     - Show QuoteSuccessModal
     - Clear sessionStorage
     - Redirect to /homeowner/dashboard

**Flow**:
```typescript
// 1. Check authentication
const { user, isSignedIn, isLoaded } = useUser();
if (!isLoaded) return <Loading />;
if (!isSignedIn) router.push('/sign-in');

// 2. Retrieve quote data
const pendingData = sessionStorage.getItem('pendingQuoteData');
if (!pendingData) {
  // No pending quote - redirect to homepage
  router.push('/');
  return;
}
const { quoteType, quoteData } = JSON.parse(pendingData);

// 3. Show modal
const [showModal, setShowModal] = useState(true);

// 4. Handle submission
const handleDetailedInfoSubmit = async (data: {
  name: string;
  phone: string;
  address: string;
}) => {
  // Submit lead
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteType: quoteType === 'call_visit' ? 'CALL_VISIT' : 'WRITTEN_QUOTE',
      quoteData: quoteData,
      propertyAddress: data.address,
      ...quoteData
    })
  });
  
  if (response.ok) {
    setShowModal(false);
    setShowSuccessModal(true);
    sessionStorage.removeItem('pendingQuoteData');
  }
};

// 5. Success modal
const handleDashboardClick = () => {
  router.push('/homeowner/dashboard');
};
```

**Verification**:
- [ ] Page is protected by middleware
- [ ] Retrieves pendingQuoteData correctly
- [ ] Shows DetailedInformationModal
- [ ] Submits lead with all data
- [ ] Shows QuoteSuccessModal
- [ ] Clears sessionStorage
- [ ] Redirects to dashboard
- [ ] Handles errors gracefully

---

#### Step 4.3: Create/Update User API Endpoint
**Estimated Time**: 15 minutes

**File**: `src/app/api/user/route.ts` (PATCH method)

**Purpose**: Update user's name and phone after collecting detailed info

**Requirements**:
- **Method**: PATCH
- **Authentication**: Required (Clerk userId)
- **Body**:
  ```json
  {
    "name": "John Doe",
    "phone": "+61412345678"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "user_xyz",
      "name": "John Doe",
      "phone": "+61412345678",
      "email": "john@example.com"
    }
  }
  ```

**Implementation**:
```typescript
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { name, phone } = await req.json();
  
  // Validate
  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
  }
  
  // Update user
  const user = await prisma.user.update({
    where: { clerkId: userId },
    data: { name, phone }
  });
  
  return NextResponse.json({ user });
}
```

**Verification**:
- [ ] Endpoint requires authentication
- [ ] Validates name and phone
- [ ] Updates user in database
- [ ] Returns updated user object
- [ ] Handles errors (user not found, validation errors)

---

### 🔄 PHASE 6: Rebuild Type 2 Flow (AFTER MISSING COMPONENTS)
**Status**: ⏳ PENDING (Blocked by Phases 3 & 4)

**Priority**: 🟡 HIGH - Core user flow

#### Step 6.1: Update Homepage (page.tsx)
**Estimated Time**: 20 minutes

**File**: `src/app/page.tsx`

**Changes Required**:
1. **Remove legacy import** (line 11):
   ```typescript
   // ❌ REMOVE
   import HomeownerSignupModal from '../components/HomeownerSignupModal';
   ```

2. **Remove modal state**:
   ```typescript
   // ❌ REMOVE
   const [isHomeownerSignupModalOpen, setIsHomeownerSignupModalOpen] = useState(false);
   ```

3. **Update handleQuoteOptionSelected** to redirect to Clerk:
   ```typescript
   const handleQuoteOptionSelected = async (type: 'call_visit' | 'written') => {
     setSelectedQuoteType(type);
     setIsQuoteOptionsModalOpen(false);
     
     const apiQuoteType = type === 'call_visit' ? 'CALL_VISIT' : 'WRITTEN_QUOTE';
     
     if (isSignedIn && user) {
       // User is logged in - submit lead directly
       // ... existing code ...
     } else {
       // User is NOT logged in - save data and redirect to Clerk
       sessionStorage.setItem('pendingQuoteData', JSON.stringify({
         quoteType: type,
         quoteData: pendingQuoteData
       }));
       router.push('/sign-up?redirect_url=/instant-quote/complete');
     }
   };
   ```

4. **Remove HomeownerSignupModal JSX**:
   ```typescript
   // ❌ REMOVE entire block
   {isHomeownerSignupModalOpen && (
     <HomeownerSignupModal ... />
   )}
   ```

5. **Remove handleHomeownerSignupSuccess** function (no longer needed)

**Verification**:
- [ ] No HomeownerSignupModal import
- [ ] No modal state variables
- [ ] Quote data saved to sessionStorage before redirect
- [ ] Redirect to Clerk signup with correct redirect_url
- [ ] Logged-in users can still submit directly

---

#### Step 6.2: Update InstantQuoteForm (if needed)
**Estimated Time**: 10 minutes

**File**: `src/components/InstantQuoteForm.tsx`

**Check**: Does this component have any NextAuth dependencies?
```powershell
Select-String -Path "src\components\InstantQuoteForm.tsx" -Pattern "next-auth|useSession|signIn|signOut"
```

**Expected**: No NextAuth usage (component just handles calculation)

**Verification**:
- [ ] No NextAuth imports
- [ ] Component still calculates quotes correctly
- [ ] Calls onQuoteCalculated() properly

---

#### Step 6.3: Test Complete Type 2 Flow
**Estimated Time**: 15 minutes

**Manual Test Steps**:
1. **Start flow**:
   - Go to homepage (not logged in)
   - Fill instant quote calculator
   - Click "Calculate"
   - Result card appears

2. **Request quote**:
   - Click "Get Quote from Installers"
   - QuoteOptionsModal appears
   - Select "Written Quote"

3. **Signup**:
   - Redirected to /sign-up
   - Complete Clerk signup form
   - Clerk webhook creates user

4. **Complete details**:
   - Redirected to /instant-quote/complete
   - DetailedInformationModal appears
   - Fill name, phone, address
   - Click "Submit"

5. **Success**:
   - Lead submitted to /api/leads
   - QuoteSuccessModal appears
   - Click "Go to Dashboard"
   - Redirected to /homeowner/dashboard

6. **Verification**:
   - Check database: User has name + phone
   - Check database: Lead exists with quoteData + address
   - Dashboard shows lead in "My Quotes" section

**Success Criteria**:
- [ ] All steps complete without errors
- [ ] Quote data persists through signup
- [ ] Detailed info saved to User table
- [ ] Lead created with all data
- [ ] User lands on dashboard
- [ ] No console errors

---

### 🔄 PHASE 7: Migrate Remaining Pages (AFTER TYPE 2 FLOW)
**Status**: ⏳ PENDING (Blocked by Phase 6)

**Priority**: 🟡 MEDIUM - Required for full app functionality

#### Step 7.1: Complete Homeowner Dashboard Migration
**Estimated Time**: 15 minutes

**File**: `src/app/homeowner/dashboard/page.tsx`

**Current State**: Partially migrated (line 613, 746)

**Remaining Changes**:
1. Remove any remaining NextAuth imports
2. Replace all `useSession()` with `useUser()`
3. Update user data access:
   ```typescript
   // ❌ OLD
   const userEmail = session?.user?.email;
   
   // ✅ NEW
   const userEmail = user?.emailAddresses[0]?.emailAddress;
   ```

4. Update loading/auth checks:
   ```typescript
   // ❌ OLD
   if (status === 'loading') return <Loading />;
   if (status === 'unauthenticated') router.push('/api/auth/signin');
   
   // ✅ NEW
   if (!isLoaded) return <Loading />;
   if (!isSignedIn) router.push('/sign-in');
   ```

**Verification**:
- [ ] No NextAuth imports
- [ ] All `useSession` replaced with `useUser`
- [ ] Dashboard loads correctly
- [ ] User data displays properly
- [ ] Sign out works
- [ ] No console errors

---

#### Step 7.2: Migrate Installer Pages (5 files)
**Estimated Time**: 60 minutes (12 min per file)

**Files**:
1. `src/app/installer/layout.tsx` (line 23-24)
2. `src/app/installer/marketplace/page.tsx` (lines 19, 52, 63)
3. `src/app/installer/leads/[id]/page.tsx` (lines 16, 81, 90)
4. `src/app/installer/page.tsx` (lines 5, 57)
5. `src/app/installer/purchased-leads/page.tsx` (lines 16, 51, 60)

**Pattern for Each File**:
```typescript
// 1. Replace imports
// ❌ OLD
import { useSession, signOut } from 'next-auth/react'

// ✅ NEW
import { useUser, useClerk } from '@clerk/nextjs'

// 2. Replace hooks
// ❌ OLD
const { data: session, status } = useSession();

// ✅ NEW
const { user, isSignedIn, isLoaded } = useUser();

// 3. Replace loading check
// ❌ OLD
if (status === 'loading') return <Loading />;

// ✅ NEW
if (!isLoaded) return <Loading />;

// 4. Replace auth check
// ❌ OLD
if (status === 'unauthenticated') router.push('/api/auth/signin');

// ✅ NEW
if (!isSignedIn) router.push('/sign-in');

// 5. Replace sign out
// ❌ OLD
await signOut({ redirect: false });

// ✅ NEW
const { signOut } = useClerk();
await signOut();

// 6. Update user data access
// ❌ OLD
const userEmail = session?.user?.email;
const userName = session?.user?.name;

// ✅ NEW
const userEmail = user?.emailAddresses[0]?.emailAddress;
const userName = user?.fullName || user?.firstName;
```

**Verification for Each File**:
- [ ] No NextAuth imports
- [ ] All hooks replaced
- [ ] Page loads correctly
- [ ] Authentication works
- [ ] User data displays
- [ ] Sign out works
- [ ] No TypeScript errors
- [ ] No console errors

---

#### Step 7.3: Migrate Admin Page
**Estimated Time**: 20 minutes

**File**: `src/app/admin/page.tsx` (lines 5, 52, 55)

**Changes Required**:
1. **Remove AdminSignInModal import** (line 5):
   ```typescript
   // ❌ REMOVE
   import AdminSignInModal from '@/components/AdminSignInModal'
   ```

2. **Add Clerk imports**:
   ```typescript
   // ✅ ADD
   import { useUser } from '@clerk/nextjs'
   import { useRouter } from 'next/navigation'
   ```

3. **Replace authentication logic**:
   ```typescript
   // ❌ OLD
   const [showSignInModal, setShowSignInModal] = useState(false);
   
   // Check session and show modal if not authenticated
   if (!session) {
     return <AdminSignInModal isOpen={showSignInModal} ... />;
   }
   
   // ✅ NEW
   const { user, isSignedIn, isLoaded } = useUser();
   const router = useRouter();
   
   // Redirect to sign-in if not authenticated
   useEffect(() => {
     if (isLoaded && !isSignedIn) {
       router.push('/sign-in');
     }
   }, [isLoaded, isSignedIn, router]);
   
   if (!isLoaded) return <Loading />;
   if (!isSignedIn) return null; // Will redirect
   
   // Check ADMIN role (middleware already protects, but double-check)
   const role = user.publicMetadata.role as string;
   if (role !== 'ADMIN') {
     return <div>Access Denied</div>;
   }
   ```

4. **Remove modal JSX** (lines 52, 55)

**Verification**:
- [ ] No AdminSignInModal import
- [ ] No modal state or JSX
- [ ] Redirects to /sign-in if not authenticated
- [ ] Shows "Access Denied" if not ADMIN role
- [ ] Admin users can access page
- [ ] No TypeScript errors
- [ ] No console errors

---

#### Step 7.4: Migrate Blog Post Page
**Estimated Time**: 15 minutes

**File**: `src/app/blog/post/page.tsx` (lines 8, 34, 121, 138, 169, 175, 321)

**Changes Required**:
1. **Remove HomeownerSignInModal import** (line 8):
   ```typescript
   // ❌ REMOVE
   import HomeownerSignInModal from '@/components/HomeownerSignInModal'
   ```

2. **Remove modal state** (lines 34, 121, 138, 169, 175):
   ```typescript
   // ❌ REMOVE
   const [showSignInModal, setShowSignInModal] = useState(false);
   ```

3. **Replace comment submission auth check**:
   ```typescript
   // ❌ OLD
   if (!session) {
     setShowSignInModal(true);
     return;
   }
   
   // ✅ NEW
   import { useUser } from '@clerk/nextjs'
   import { useRouter } from 'next/navigation'
   
   const { isSignedIn } = useUser();
   const router = useRouter();
   
   if (!isSignedIn) {
     // Save current page to return after sign-in
     sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
     router.push('/sign-in');
     return;
   }
   ```

4. **Remove modal JSX** (lines 321-324)

**Verification**:
- [ ] No HomeownerSignInModal import
- [ ] No modal state or JSX
- [ ] Redirects to /sign-in when trying to comment
- [ ] Returns to blog post after sign-in
- [ ] Logged-in users can comment
- [ ] No TypeScript errors
- [ ] No console errors

---

#### Step 7.5: Update LayoutContent Component
**Estimated Time**: 20 minutes

**File**: `src/components/LayoutContent.tsx`

**Check Current State**:
```powershell
Select-String -Path "src\components\LayoutContent.tsx" -Pattern "InstallerSignupModal|InstallerSignInModal|next-auth"
```

**Changes Required**:
1. **Remove installer modal imports**:
   ```typescript
   // ❌ REMOVE
   import InstallerSignupModal from './InstallerSignupModal'
   import InstallerSignInModal from './InstallerSignInModal'
   ```

2. **Remove modal state variables**

3. **Replace modal triggers with Clerk redirects**:
   ```typescript
   // ❌ OLD
   <button onClick={() => setShowInstallerSignup(true)}>
     Become an Installer
   </button>
   
   // ✅ NEW
   import { useRouter } from 'next/navigation'
   const router = useRouter();
   
   <button onClick={() => router.push('/sign-up')}>
     Become an Installer
   </button>
   ```

4. **Remove modal JSX**

**Note**: Installer role selection should happen during Clerk signup via unsafe_metadata

**Verification**:
- [ ] No installer modal imports
- [ ] No modal state or JSX
- [ ] "Become an Installer" button redirects to Clerk signup
- [ ] Clerk signup allows role selection
- [ ] No TypeScript errors
- [ ] No console errors

---

### 🧪 PHASE 8: Testing (AFTER ALL MIGRATIONS)
**Status**: ⏳ PENDING (Blocked by Phase 7)

**Priority**: 🔴 CRITICAL - Must verify everything works

#### Test 8.1: Type 1 Flow (Simple Signup)
**Estimated Time**: 10 minutes

**Test Steps**:
1. Go to homepage (not logged in)
2. Click "Sign Up" in header
3. Complete Clerk signup
4. Verify redirect to /dashboard
5. Verify redirect to /homeowner/dashboard
6. Verify dashboard loads correctly
7. Verify user data displays
8. Sign out
9. Sign back in
10. Verify dashboard loads again

**Success Criteria**:
- [ ] Signup completes without errors
- [ ] Redirects work correctly
- [ ] Dashboard displays user data
- [ ] Sign out works
- [ ] Sign in works
- [ ] No console errors
- [ ] No network errors

---

#### Test 8.2: Type 2 Flow (Quote-Driven Signup)
**Estimated Time**: 15 minutes

**Test Steps**:
1. Go to homepage (not logged in)
2. Fill instant quote calculator
3. Click "Calculate"
4. Click "Get Quote from Installers"
5. Select "Written Quote"
6. Verify redirect to Clerk signup
7. Complete Clerk signup
8. Verify redirect to /instant-quote/complete
9. Verify DetailedInformationModal appears
10. Fill name, phone, address
11. Click "Submit"
12. Verify QuoteSuccessModal appears
13. Click "Go to Dashboard"
14. Verify dashboard loads with quote saved

**Success Criteria**:
- [ ] Quote data persists through signup
- [ ] DetailedInformationModal collects data
- [ ] Lead submitted successfully
- [ ] User data updated in database
- [ ] Dashboard shows submitted quote
- [ ] No data loss during flow
- [ ] No console errors
- [ ] No network errors

---

#### Test 8.3: Installer Flows
**Estimated Time**: 20 minutes

**Test Steps**:
1. Sign up as installer (with role selection)
2. Verify redirect to /dashboard
3. Verify redirect to /installer (dashboard)
4. Test installer marketplace page
5. Test lead detail page
6. Test purchased leads page
7. Sign out and sign in
8. Verify all pages still work

**Success Criteria**:
- [ ] Installer signup works
- [ ] Role-based redirect works
- [ ] All installer pages load
- [ ] Authentication persists
- [ ] Sign out/in works
- [ ] No console errors

---

#### Test 8.4: Admin Flow
**Estimated Time**: 10 minutes

**Test Steps**:
1. Sign in as admin user
2. Verify redirect to /admin
3. Test admin dashboard functionality
4. Sign out
5. Try accessing /admin while logged out (should redirect)
6. Try accessing /admin as homeowner (should show "Access Denied")

**Success Criteria**:
- [ ] Admin can access /admin
- [ ] Non-admin users cannot access /admin
- [ ] Logged-out users redirected to sign-in
- [ ] Admin dashboard functions correctly
- [ ] No console errors

---

#### Test 8.5: Build Verification
**Estimated Time**: 10 minutes

**Commands**:
```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Build production
npm run build

# 3. Start production server
npm run start

# 4. Test production build
# - Test Type 1 flow
# - Test Type 2 flow
# - Test all role dashboards
```

**Success Criteria**:
- [ ] TypeScript: 0 errors
- [ ] Build: success (no errors)
- [ ] Production server starts
- [ ] All flows work in production
- [ ] No runtime errors
- [ ] No console warnings

---

### 📝 PHASE 9: Documentation & Cleanup (FINAL)
**Status**: ⏳ PENDING (Blocked by Phase 8)

**Priority**: 🟢 LOW - Nice to have

#### Task 9.1: Update Documentation
**Estimated Time**: 30 minutes

**Files to Create/Update**:
1. **Update DOC/AUTH-FLOW-COMPLETE-AUDIT.md**:
   - Mark all phases as complete
   - Add "Final State" section
   - Document any lessons learned

2. **Create DOC/CLERK-MIGRATION-SUMMARY.md**:
   - Overview of migration
   - Before/After comparison
   - New authentication flows
   - API endpoints
   - Components reference

3. **Update README.md**:
   - Update authentication section
   - Document Clerk setup
   - Add environment variables
   - Update development guide

**Content to Include**:
- New authentication flows (Type 1 & 2)
- Clerk configuration
- Environment variables required
- API endpoints for user management
- Troubleshooting guide
- Migration timeline

---

#### Task 9.2: Clean Up Backup Files
**Estimated Time**: 5 minutes

**Check Backups**:
```powershell
# List all backups
Get-ChildItem "backup*" -Directory
Get-ChildItem "backup-*" -Directory
```

**Decision**:
- Keep most recent backup: `backup-2025-11-09/`
- Archive or delete older backups (if migration successful)

**Verification**:
- [ ] Latest backup exists
- [ ] Can restore if needed
- [ ] Old backups archived/deleted

---

#### Task 9.3: Commit Changes
**Estimated Time**: 10 minutes

**Atomic Commits** (separate commits for clarity):
```bash
# 1. Delete legacy auth
git add .
git commit -m "feat: Remove NextAuth legacy authentication system

BREAKING CHANGE: Removed all NextAuth components, config, and API routes
- Deleted 6 modal components (~1500 lines)
- Deleted auth config and types (~250 lines)
- Deleted registration API routes (~376 lines)
- Removed next-auth and bcryptjs packages

Refs: DOC/AUTH-FLOW-COMPLETE-AUDIT.md Phase 3"

# 2. Create missing components
git add src/components/DetailedInformationModal.tsx
git add src/app/instant-quote/complete/
git add src/app/api/user/route.ts
git commit -m "feat: Add DetailedInformationModal for Type 2 signup flow

- Created modal to collect name, phone, address after Clerk signup
- Created /instant-quote/complete page for post-signup redirect
- Added PATCH /api/user endpoint for updating user details
- Implements complete Type 2 quote-driven signup flow

Refs: DOC/AUTH-FLOW-COMPLETE-AUDIT.md Phase 4"

# 3. Rebuild Type 2 flow
git add src/app/page.tsx
git add src/components/InstantQuoteForm.tsx
git commit -m "feat: Rebuild Type 2 flow with Clerk authentication

- Replaced HomeownerSignupModal with Clerk redirect
- Implemented sessionStorage for quote data persistence
- Wired up complete flow: Quote → Signup → Details → Submit
- All quote data preserved through authentication

Refs: DOC/AUTH-FLOW-COMPLETE-AUDIT.md Phase 6"

# 4. Migrate remaining pages
git add src/app/homeowner/
git add src/app/installer/
git add src/app/admin/
git add src/app/blog/
git add src/components/LayoutContent.tsx
git commit -m "feat: Complete migration of all pages to Clerk

- Migrated homeowner dashboard (completed partial migration)
- Migrated all 5 installer pages
- Migrated admin page
- Migrated blog post page
- Updated LayoutContent component
- All NextAuth references removed

Refs: DOC/AUTH-FLOW-COMPLETE-AUDIT.md Phase 7"

# 5. Documentation
git add DOC/
git add README.md
git commit -m "docs: Update authentication documentation

- Updated AUTH-FLOW-COMPLETE-AUDIT.md with final state
- Created CLERK-MIGRATION-SUMMARY.md
- Updated README.md with Clerk setup guide
- Documented all authentication flows

Refs: DOC/AUTH-FLOW-COMPLETE-AUDIT.md Phase 9"
```

**Verification**:
- [ ] All changes committed
- [ ] Commit messages are descriptive
- [ ] Breaking changes documented
- [ ] References to documentation included

---

## 📊 OVERALL PROGRESS TRACKING

### Phase Checklist:
- [x] Phase 0: Backup & Audit (✅ COMPLETE)
- [x] Phase 1: Clerk Infrastructure (✅ COMPLETE)
- [x] Phase 2: Database Migration (✅ COMPLETE)
- [x] Phase 5: Middleware (✅ COMPLETE)
- [ ] Phase 3: Delete Legacy Auth (⏳ PENDING - BLOCKING)
- [ ] Phase 4: Create Missing Components (⏳ PENDING)
- [ ] Phase 6: Rebuild Type 2 Flow (⏳ PENDING)
- [ ] Phase 7: Migrate Remaining Pages (⏳ PENDING)
- [ ] Phase 8: Testing (⏳ PENDING)
- [ ] Phase 9: Documentation (⏳ PENDING)

### Estimated Time Remaining:
| Phase | Estimated Time |
|-------|----------------|
| Phase 3: Delete Legacy Auth | 25 minutes |
| Phase 4: Create Missing Components | 90 minutes |
| Phase 6: Rebuild Type 2 Flow | 45 minutes |
| Phase 7: Migrate Remaining Pages | 140 minutes |
| Phase 8: Testing | 65 minutes |
| Phase 9: Documentation | 45 minutes |
| **TOTAL** | **~6.5 hours** |

### Files to Touch:
- **Delete**: 11 files (~2500 lines)
- **Create**: 3 files (~500 lines)
- **Modify**: 12 files (~5000 lines)
- **Document**: 3 files (~1000 lines)

---

## 🎯 SUCCESS CRITERIA

### Technical Success:
- [ ] ✅ All legacy NextAuth code removed
- [ ] ✅ All pages using Clerk authentication
- [ ] ✅ Type 1 flow working (header signup)
- [ ] ✅ Type 2 flow working (quote-driven signup)
- [ ] ✅ DetailedInformationModal collecting data
- [ ] ✅ All roles working (homeowner, installer, admin)
- [ ] ✅ TypeScript builds with 0 errors
- [ ] ✅ npm run build succeeds
- [ ] ✅ No runtime errors
- [ ] ✅ No console warnings

### User Experience Success:
- [ ] ✅ Users can sign up via header
- [ ] ✅ Users can sign up after quote calculation
- [ ] ✅ Quote data persists through signup
- [ ] ✅ Additional details collected after signup
- [ ] ✅ Leads submitted successfully
- [ ] ✅ Dashboards load correctly
- [ ] ✅ Sign out/in works smoothly
- [ ] ✅ No broken flows or dead ends

### Code Quality Success:
- [ ] ✅ No mixed authentication state
- [ ] ✅ Clean separation of concerns
- [ ] ✅ Consistent Clerk usage across app
- [ ] ✅ Well-documented code
- [ ] ✅ Atomic commits with clear messages
- [ ] ✅ Comprehensive documentation
- [ ] ✅ Backup available for rollback

---

## 📞 SUPPORT & RESOURCES

### Clerk Documentation:
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [User Management](https://clerk.com/docs/users/overview)
- [Session Management](https://clerk.com/docs/users/sessions)
- [Webhooks](https://clerk.com/docs/integrations/webhooks/overview)
- [Metadata](https://clerk.com/docs/users/metadata)

### Internal Documentation:
- `DOC/AUTH-FLOW-COMPLETE-AUDIT.md` - Complete flow analysis
- `DOC/CLERK-MIGRATION-SUMMARY.md` - Migration overview (to be created)
- `README.md` - Project setup guide

### Troubleshooting:
- **Issue**: User not found in database after signup
  - **Solution**: Check Clerk webhook is configured correctly
  - **Verify**: /api/webhooks/clerk receiving events

- **Issue**: Quote data lost during signup
  - **Solution**: Verify sessionStorage is being set before redirect
  - **Verify**: pendingQuoteData exists in /instant-quote/complete

- **Issue**: Role-based redirect not working
  - **Solution**: Check middleware is reading publicMetadata.role
  - **Verify**: User has role set in Clerk dashboard

---

**End of Migration Plan**
