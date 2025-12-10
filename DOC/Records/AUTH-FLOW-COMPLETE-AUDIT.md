# Complete Authentication Flow Audit

**Date**: 2025-11-09  
**Status**: CRITICAL - Mixed Auth System Detected  
**Purpose**: Document ALL authentication flows before legacy system removal

---

## 🚨 CRITICAL FINDINGS

### Current State: MIXED AUTHENTICATION SYSTEM
- ❌ **Clerk** (Partially Implemented) + **NextAuth** (Legacy) coexisting
- ❌ Causing runtime errors, build failures, and conflicts
- ❌ Missing component in Type 2 flow (Detailed Information Modal)
- ✅ **SOLUTION**: Delete ALL legacy auth FIRST, then rebuild cleanly

---

## 📋 AUTHENTICATION FLOWS

### **TYPE 1: Simple Header Signup** (Direct Dashboard Access)

**Trigger**: User clicks "Sign Up" button in Header  
**User Intent**: Create account to access dashboard features  
**Current Implementation**: ✅ WORKING (using Clerk)

#### Flow Steps:
```
┌─────────────────┐
│  1. ANY PAGE    │
│  Header visible │
└────────┬────────┘
         │ Click "Sign Up"
         ↓
┌─────────────────┐
│ 2. CLERK SIGNUP │ ← /sign-up page
│  Email/Password │
└────────┬────────┘
         │ Signup Success
         ↓
┌─────────────────┐
│ 3. CLERK WEBHOOK│ ← /api/webhooks/clerk
│  - Create User  │
│  - Set role     │
│  - Sync to DB   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 4. DASHBOARD    │ ← /dashboard (redirect handler)
│  Redirect       │
│  - Check role   │
│  - Route to:    │
│    /homeowner   │
│    /installer   │
│    /admin       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 5. ROLE DASHBOARD│
│  User lands here│
└─────────────────┘
```

#### Components Used:
- ✅ `src/components/Header.tsx` (Clerk SignInButton, SignUpButton)
- ✅ `src/app/sign-up/[[...sign-up]]/page.tsx` (Clerk)
- ✅ `src/app/api/webhooks/clerk/route.ts` (User sync)
- ✅ `src/app/dashboard/page.tsx` (Smart redirect)
- ✅ `src/middleware.ts` (Role-based protection)

#### Status: ✅ COMPLETE & WORKING

---

### **TYPE 2: Quote-Driven Signup** (InstantQuote Calculator Flow)

**Trigger**: User calculates instant quote and requests installer quotes  
**User Intent**: Get solar quotes from installers after calculation  
**Current Implementation**: ❌ PARTIALLY BROKEN (missing DetailedInformationModal)

#### Flow Steps:
```
┌─────────────────┐
│  1. HOMEPAGE    │ ← src/app/page.tsx
│  Instant Quote  │
│  Calculator     │
└────────┬────────┘
         │ Fill form & "Calculate"
         ↓
┌─────────────────┐
│ 2. RESULT CARD  │ ← InstantQuoteForm.tsx
│  - System size  │    (lines 1500-1700)
│  - Cost estimate│
│  - Savings      │
└────────┬────────┘
         │ Click "Get Quote from Installers"
         │ (saves quote to pendingQuoteData)
         ↓
┌─────────────────┐
│ 3. QUOTE OPTIONS│ ← QuoteOptionsModal.tsx
│  Modal          │
│  - Call/Visit   │
│  - Written Quote│
└────────┬────────┘
         │ Select option
         │ (checks if user is signed in)
         ↓
    ┌────┴────┐
    │         │
    │ LOGGED  │ NOT LOGGED IN
    │ IN?     │
    │         │
    └────┬────┘
         │
         ├─ YES → Submit lead directly to /api/leads
         │        → Show QuoteSuccessModal
         │        → Redirect to /homeowner/dashboard
         │
         └─ NO → ┌─────────────────┐
                 │ 4. CLERK SIGNUP │ ← HomeownerSignupModal
                 │  Email/Password │    (LEGACY - should use Clerk)
                 └────────┬────────┘
                          │ Signup Success
                          ↓
                 ┌─────────────────┐
                 │ 5. ❌ MISSING   │ ← DetailedInformationModal
                 │  COMPONENT      │    (NEEDS TO BE CREATED)
                 │  ─────────────  │
                 │  Collect:       │
                 │  - Full Name    │
                 │  - Phone Number │
                 │  - Address      │
                 └────────┬────────┘
                          │ Save to DB
                          ↓
                 ┌─────────────────┐
                 │ 6. SUBMIT LEAD  │ ← /api/leads POST
                 │  - quoteData    │
                 │  - quoteType    │
                 │  - name/phone   │
                 │  - address      │
                 └────────┬────────┘
                          │
                          ↓
                 ┌─────────────────┐
                 │ 7. SUCCESS MODAL│ ← QuoteSuccessModal
                 │  "Quote Submitted"│
                 └────────┬────────┘
                          │ Click "Go to Dashboard"
                          ↓
                 ┌─────────────────┐
                 │ 8. HOMEOWNER    │ ← /homeowner/dashboard
                 │  DASHBOARD      │
                 └─────────────────┘
```

#### Components Used:
- ✅ `src/app/page.tsx` (orchestrates flow)
- ✅ `src/components/InstantQuoteForm.tsx` (calculator, 2044 lines)
- ✅ `src/components/QuoteOptionsModal.tsx` (quote type selection)
- ❌ `src/components/HomeownerSignupModal.tsx` (LEGACY - should delete)
- ❌ **MISSING**: `src/components/DetailedInformationModal.tsx` (NEEDS CREATION)
- ✅ `src/components/QuoteSuccessModal.tsx` (confirmation)
- ✅ `src/app/api/leads/route.ts` (lead submission)
- 🔄 `src/app/homeowner/dashboard/page.tsx` (partially migrated to Clerk)

#### Data Flow:
```javascript
// Step 1-2: Calculate quote
InstantQuoteForm → handleQuoteCalculated() → setPendingQuoteData()

// Step 3: Select quote type
QuoteOptionsModal → onSelectOption('call_visit' | 'written')

// Step 4: Check authentication
if (isSignedIn) {
  → POST /api/leads with pendingQuoteData
  → Show QuoteSuccessModal
} else {
  → Show HomeownerSignupModal (LEGACY)
  → ❌ SHOULD REDIRECT TO Clerk /sign-up
}

// Step 5: ❌ MISSING STEP
// After Clerk signup, should show DetailedInformationModal
// Collect: name, phone, address
// Save to User table + Lead record

// Step 6: Submit lead
POST /api/leads {
  quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE',
  quoteData: { ...pendingQuoteData },
  name: string,
  phone: string,
  address: string
}

// Step 7-8: Success and dashboard
QuoteSuccessModal → onDashboardClick() → router.push('/homeowner/dashboard')
```

#### Status: ❌ INCOMPLETE - CRITICAL ISSUES
1. ❌ Using legacy `HomeownerSignupModal` instead of Clerk
2. ❌ Missing `DetailedInformationModal` after signup
3. ❌ No place to collect name, phone, address for lead
4. ❌ Quote data might be lost during signup flow

---

## 🗂️ COMPONENT INVENTORY

### ✅ CLERK COMPONENTS (Keep & Use)
| Component | Path | Lines | Status | Purpose |
|-----------|------|-------|--------|---------|
| ClerkProvider | `src/app/layout.tsx` | N/A | ✅ Active | Wraps entire app |
| SignUp Page | `src/app/sign-up/[[...sign-up]]/page.tsx` | 14 | ✅ Active | Clerk signup UI |
| SignIn Page | `src/app/sign-in/[[...sign-in]]/page.tsx` | 14 | ✅ Active | Clerk signin UI |
| Webhook | `src/app/api/webhooks/clerk/route.ts` | ~150 | ✅ Active | User sync to Prisma |
| User Sync API | `src/app/api/user/sync/route.ts` | ~80 | ✅ Active | Auto-create users |
| Dashboard Redirect | `src/app/dashboard/page.tsx` | ~60 | ✅ Active | Role-based routing |
| Middleware | `src/middleware.ts` | ~150 | ✅ Active | Role protection |
| Header | `src/components/Header.tsx` | ~300 | ✅ Active | SignInButton, SignUpButton, UserButton |
| LayoutContent | `src/components/LayoutContent.tsx` | ~200 | ✅ Active | Uses useUser() |

### ❌ LEGACY NEXTAUTH COMPONENTS (Delete)
| Component | Path | Lines | Status | Used In |
|-----------|------|-------|--------|---------|
| HomeownerSignupModal | `src/components/HomeownerSignupModal.tsx` | 432 | ❌ DELETE | page.tsx (Type 2 flow) |
| HomeownerSignInModal | `src/components/HomeownerSignInModal.tsx` | ~300 | ❌ DELETE | blog/post/page.tsx |
| InstallerSignupModal | `src/components/InstallerSignupModal.tsx` | ~400 | ❌ DELETE | LayoutContent.tsx |
| InstallerSignInModal | `src/components/InstallerSignInModal.tsx` | ~300 | ❌ DELETE | LayoutContent.tsx |
| AdminSignInModal | `src/components/AdminSignInModal.tsx` | 146 | ❌ DELETE | admin/page.tsx |
| DetailedQuoteAuthModal | `src/components/DetailedQuoteAuthModal.tsx` | 200 | ❌ DELETE | (currently unused) |
| NextAuthProvider | `src/components/NextAuthProvider.tsx` | ~50 | ❌ DELETE | Root layout (removed) |
| Auth Config | `src/lib/auth.ts` | 170 | ❌ DELETE | NextAuth config |
| Auth Types | `src/types/next-auth.d.ts` | ~30 | ❌ DELETE | Type extensions |

### ❌ LEGACY API ROUTES (Delete)
| Route | Path | Lines | Status |
|-------|------|-------|--------|
| Register Homeowner | `src/app/api/auth/register/homeowner/route.ts` | 163 | ❌ DELETE |
| Register Installer | `src/app/api/auth/register/installer/route.ts` | 213 | ❌ DELETE |
| NextAuth Handler | `src/app/api/auth/[...nextauth]/route.ts` | N/A | ✅ DELETED (2025-11-09) |

### ⚠️ MISSING COMPONENTS (Create)
| Component | Purpose | Fields | Integration Point |
|-----------|---------|--------|-------------------|
| DetailedInformationModal | Collect additional data after Clerk signup in Type 2 flow | - Full Name<br>- Phone Number<br>- Property Address | After Clerk signup, before QuoteSuccessModal |

---

## 📄 PAGES USING NEXTAUTH (Must Migrate)

### ❌ HOMEOWNER PAGES
| Page | Path | Lines | NextAuth Usage | Fix Required |
|------|------|-------|----------------|--------------|
| Dashboard | `src/app/homeowner/dashboard/page.tsx` | 612 | 🔄 PARTIAL (line 613, 746) | Replace remaining useSession |
| Layout | `src/app/homeowner/layout.tsx` | ~150 | ✅ FIXED | Using Clerk signOut() |

### ❌ INSTALLER PAGES
| Page | Path | Lines | NextAuth Usage | Fix Required |
|------|------|-------|----------------|--------------|
| Layout | `src/app/installer/layout.tsx` | ~200 | ❌ Line 23-24 | Replace `signOut` with Clerk |
| Marketplace | `src/app/installer/marketplace/page.tsx` | ~500 | ❌ Lines 19, 52, 63 | Replace `useSession`, redirect to Clerk |
| Lead Detail | `src/app/installer/leads/[id]/page.tsx` | ~800 | ❌ Lines 16, 81, 90 | Replace `useSession`, redirect to Clerk |
| Dashboard | `src/app/installer/page.tsx` | ~600 | ❌ Lines 5, 57 | Replace `signOut` with Clerk |
| Purchased Leads | `src/app/installer/purchased-leads/page.tsx` | ~400 | ❌ Lines 16, 51, 60 | Replace `useSession`, redirect to Clerk |

### ❌ ADMIN PAGES
| Page | Path | Lines | NextAuth Usage | Fix Required |
|------|------|-------|----------------|--------------|
| Admin Dashboard | `src/app/admin/page.tsx` | ~800 | ❌ Lines 5, 52, 55 | Remove AdminSignInModal, use Clerk |

### ❌ PUBLIC PAGES
| Page | Path | Lines | NextAuth Usage | Fix Required |
|------|------|-------|----------------|--------------|
| Homepage | `src/app/page.tsx` | 349 | ❌ Line 11 | Remove HomeownerSignupModal import |
| Blog Post | `src/app/blog/post/page.tsx` | ~600 | ❌ Lines 8, 34, 121, 138, 169, 175, 321 | Remove HomeownerSignInModal |

---

## 🔧 REPLACEMENT PATTERNS

### Pattern 1: useSession → useUser
```typescript
// ❌ OLD (NextAuth)
import { useSession } from 'next-auth/react'
const { data: session, status } = useSession();
if (status === 'loading') return <div>Loading...</div>;
if (status === 'unauthenticated') router.push('/api/auth/signin');
const userEmail = session?.user?.email;

// ✅ NEW (Clerk)
import { useUser } from '@clerk/nextjs'
const { user, isSignedIn, isLoaded } = useUser();
if (!isLoaded) return <div>Loading...</div>;
if (!isSignedIn) router.push('/sign-in');
const userEmail = user?.emailAddresses[0]?.emailAddress;
```

### Pattern 2: signOut → useClerk
```typescript
// ❌ OLD (NextAuth)
import { signOut } from 'next-auth/react'
await signOut({ redirect: false });

// ✅ NEW (Clerk)
import { useClerk } from '@clerk/nextjs'
const { signOut } = useClerk();
await signOut();
```

### Pattern 3: Server-side Session
```typescript
// ❌ OLD (NextAuth)
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// ✅ NEW (Clerk)
import { auth } from '@clerk/nextjs/server'
const { userId } = await auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

### Pattern 4: Modal Replacement
```typescript
// ❌ OLD (Legacy Modal)
import HomeownerSignupModal from '@/components/HomeownerSignupModal'
const [isSignupOpen, setIsSignupOpen] = useState(false);
<HomeownerSignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />

// ✅ NEW (Clerk Redirect)
import { useRouter } from 'next/navigation'
const router = useRouter();
// Store state before redirect
sessionStorage.setItem('pendingQuoteData', JSON.stringify(quoteData));
sessionStorage.setItem('redirectAfterAuth', '/instant-quote/complete');
// Redirect to Clerk
router.push('/sign-up');
```

---

## 🎯 CORRECT TYPE 2 FLOW (Target Implementation)

### New Flow with DetailedInformationModal:
```
1. InstantQuoteForm: Calculate → "Get Quote from Installers"
   ↓
2. QuoteOptionsModal: Select "Call/Visit" or "Written Quote"
   ↓
3. Check if user is signed in:
   - IF YES → Go to Step 6
   - IF NO → Continue to Step 4
   ↓
4. Save quote data to sessionStorage:
   sessionStorage.setItem('pendingQuoteData', JSON.stringify({
     quoteType: selectedQuoteType,
     quoteData: pendingQuoteData
   }));
   ↓
5. Redirect to Clerk Signup:
   router.push('/sign-up?redirect_url=/instant-quote/complete');
   ↓
   [User completes Clerk signup]
   ↓
   [Clerk webhook creates user in Prisma]
   ↓
   [Clerk redirects to /instant-quote/complete]
   ↓
6. NEW PAGE: /instant-quote/complete
   - Retrieve pendingQuoteData from sessionStorage
   - Show DetailedInformationModal
   - Collect: Full Name, Phone Number, Property Address
   - Validate Australian phone format
   - Save to Prisma:
     * User table: name, phone
     * (Address saved with lead submission)
   ↓
7. Submit lead to /api/leads:
   POST {
     quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE',
     quoteData: { ...retrievedQuoteData },
     propertyAddress: collectedAddress
   }
   ↓
8. Show QuoteSuccessModal
   ↓
9. Redirect to /homeowner/dashboard
```

### Required New Files:
1. **`src/app/instant-quote/complete/page.tsx`**
   - Purpose: Handle post-signup redirect
   - Responsibilities:
     * Retrieve pendingQuoteData from sessionStorage
     * Show DetailedInformationModal
     * Submit lead after data collection
     * Show success modal
     * Redirect to dashboard

2. **`src/components/DetailedInformationModal.tsx`**
   - Purpose: Collect additional user info after Clerk signup
   - Fields:
     * Full Name (text input)
     * Phone Number (Australian format: +61 or 04xx xxx xxx)
     * Property Address (autocomplete with Google Places API)
   - Validation:
     * All fields required
     * Phone: Australian mobile format
     * Address: Must be valid Australian address
   - API Call:
     * PATCH /api/user (update name, phone)
     * Returns: success/error
   - On Success:
     * Close modal
     * Parent submits lead with address
     * Show success modal

---

## 📊 MIGRATION STATISTICS

### Files Status:
- ✅ **Migrated to Clerk**: 9 files (~1000 lines)
- 🔄 **Partially Migrated**: 1 file (homeowner/dashboard/page.tsx)
- ❌ **Still Using NextAuth**: 9 files (~4000 lines)
- ❌ **Legacy Components to Delete**: 11 files (~2500 lines)
- ⚠️ **Missing Components**: 1 file (DetailedInformationModal.tsx)

### Database Status:
- ✅ Migration applied: `20251109063342_clerk_auth_migration`
- ✅ Schema updated: `clerkId` added, `password` removed
- ✅ NextAuth models deleted: `Account`, `Session`, `VerificationToken`
- ✅ Users syncing via webhook

### Build Status:
- ❌ TypeScript errors: Unknown (blocked by auth conflicts)
- ❌ Runtime errors: useSession errors in 7+ pages
- ❌ Mixed auth system causing cascading failures

---

## 🚨 CRITICAL NEXT STEPS

### PHASE 0: Complete Audit ✅
- [x] Document Type 1 flow
- [x] Document Type 2 flow
- [x] Identify all legacy components
- [x] Identify all pages using NextAuth
- [x] Map replacement patterns
- [x] Identify missing components

### PHASE 1: Delete ALL Legacy Auth (DO THIS FIRST)
1. Delete modal components (6 files)
2. Delete auth config (3 files)
3. Delete API routes (2 files)
4. Remove all imports from pages
5. Verify clean build

### PHASE 2: Create Missing Component
1. Create DetailedInformationModal.tsx
2. Create /instant-quote/complete page
3. Add PATCH /api/user endpoint (if not exists)

### PHASE 3: Rebuild Type 2 Flow
1. Update page.tsx to redirect to Clerk instead of HomeownerSignupModal
2. Implement sessionStorage for quote data persistence
3. Wire up complete flow with new modal

### PHASE 4: Migrate Remaining Pages
1. Complete homeowner/dashboard/page.tsx
2. Fix all installer pages (5 files)
3. Fix admin/page.tsx
4. Fix blog/post/page.tsx

### PHASE 5: Testing
1. Test Type 1 flow (header signup)
2. Test Type 2 flow (quote-driven signup)
3. Test installer flows
4. Test admin flow
5. Verify TypeScript builds
6. Verify npm run build succeeds

---

## 📝 LESSONS LEARNED

1. ❌ **Mistake**: Migrated piecemeal without deleting legacy system first
   - **Result**: Mixed auth state, cascading errors
   - **Fix**: Delete ALL legacy auth before rebuilding

2. ❌ **Mistake**: Didn't audit both signup flows comprehensively
   - **Result**: Missing component discovered late
   - **Fix**: Always map complete user journeys first

3. ❌ **Mistake**: Started coding before understanding full scope
   - **Result**: Half-migrated components, incomplete flows
   - **Fix**: Audit → Plan → Delete → Rebuild (in that order)

---

## ✅ SUCCESS CRITERIA

### Type 1 Flow:
- [ ] User clicks "Sign Up" in header
- [ ] Clerk signup modal appears
- [ ] After signup, redirects to /dashboard
- [ ] Dashboard routes to /homeowner/dashboard based on role
- [ ] User sees dashboard with no errors

### Type 2 Flow:
- [ ] User calculates instant quote
- [ ] Clicks "Get Quote from Installers"
- [ ] Selects quote type (Call/Visit or Written)
- [ ] IF logged in → submits lead directly
- [ ] IF NOT logged in → redirects to Clerk signup
- [ ] After signup → shows DetailedInformationModal
- [ ] After modal → submits lead with complete data
- [ ] Shows QuoteSuccessModal
- [ ] Redirects to dashboard with quote saved

### Build Success:
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → success
- [ ] No runtime errors in any page
- [ ] All 3 roles work (homeowner, installer, admin)

---

**End of Audit Report**
