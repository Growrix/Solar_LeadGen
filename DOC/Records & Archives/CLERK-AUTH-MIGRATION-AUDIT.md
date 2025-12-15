# Clerk Authentication Migration - Comprehensive Audit Report

**Date**: November 9, 2025  
**Status**: 🔍 COMPLETE AUDIT - READY FOR MIGRATION PLAN  
**Goal**: Replace NextAuth.js with Clerk for all authentication flows (Homeowner, Installer, Admin)

---

## 📋 EXECUTIVE SUMMARY

### Current Authentication System (NextAuth.js)

**Technology Stack**:
- NextAuth.js v4 (CredentialsProvider only, no OAuth configured)
- bcrypt for password hashing
- JWT-based sessions
- Custom registration APIs
- Prisma + PostgreSQL for user storage

**User Types** (3 distinct flows):
1. **Homeowner** - Guest users who generate quotes and submit leads
2. **Installer** - Solar installation companies bidding on leads
3. **Admin** - Platform administrators managing leads and users

**Authentication Components** (8 modals):
- HomeownerSignupModal.tsx (432 lines)
- HomeownerSignInModal.tsx
- InstallerSignupModal.tsx
- InstallerSignInModal.tsx  
- InstallerEligibilityModal.tsx
- AdminSignInModal.tsx (146 lines)
- DetailedQuoteAuthModal.tsx (200 lines - instant quote flow)
- QuoteOptionsModal.tsx (uses session)

**API Routes** (5 routes):
- /api/auth/[...nextauth]/route.ts - NextAuth handler
- /api/auth/register/homeowner/route.ts (163 lines)
- /api/auth/register/installer/route.ts (213 lines)
- /api/verification/send-otp/route.ts - Phone verification
- /api/verification/verify-otp/route.ts - OTP validation
- /api/user/update-phone/route.ts - Phone number updates

**Session Management** (17 files using `useSession`):
- LayoutContent.tsx - Root level session provider
- page.tsx (main landing)
- homeowner/dashboard/page.tsx
- installer/dashboard/page.tsx
- admin/page.tsx
- blog/post/page.tsx
- And 11 more components

**Protected Routes** (3 layouts):
- /homeowner/layout.tsx - Homeowner-only pages
- /installer/layout.tsx - Installer-only pages
- /admin/layout.tsx - Admin-only pages (via middleware.ts)

---

## 🗂️ DETAILED COMPONENT INVENTORY

### 1. HOMEOWNER AUTHENTICATION FLOW

#### A. Header Signup (Simplified Flow)
**Component**: `HomeownerSignupModal.tsx` (432 lines)  
**Location**: `src/components/HomeownerSignupModal.tsx`  
**Trigger**: Header "Sign Up" button

**Fields** (Already simplified):
```typescript
{
  email: string,
  password: string,
  confirmPassword: string
}
```

**OAuth Buttons**: 
- ✅ Google button (UI only, not configured)
- ✅ Apple button (UI only, not configured)

**API Call**: `/api/auth/register/homeowner`

**Auto-Login**: Uses NextAuth `signIn()` after successful registration

**Features**:
- Email format validation
- Password strength validation (8+ chars, letter + number)
- Password match validation
- Duplicate email check
- Auto-redirect to /dashboard after signup

**Status**: ✅ Modern, simplified (email/password only)

---

#### B. Instant Quote Signup Flow
**Component**: `DetailedQuoteAuthModal.tsx` (200 lines)  
**Location**: `src/components/DetailedQuoteAuthModal.tsx`  
**Trigger**: InstantQuoteForm "Calculate Quote" button (unauthenticated users)

**Fields** (OLD multi-field system):
```typescript
{
  fullName: string,
  email: string,
  phone: string,
  address: string,
  password: string,
  confirmPassword: string
}
```

**OAuth Buttons**: ❌ NONE

**API Call**: Custom `onSignupAndSubmit()` handler (not direct API call)

**Features**:
- reCAPTCHA mock checkbox (not real reCAPTCHA)
- Full name, phone, address validation
- After signup → Save quote → Redirect

**Status**: ❌ Legacy multi-field flow (needs simplification)

---

#### C. Sign In Modal
**Component**: `HomeownerSignInModal.tsx`  
**Location**: `src/components/HomeownerSignInModal.tsx`  
**Trigger**: "Sign In" button from header or modals

**Fields**:
```typescript
{
  email: string,
  password: string
}
```

**OAuth Buttons**: 
- ✅ Google button (UI only)
- ✅ Apple button (UI only)

**API Call**: NextAuth `signIn('credentials', { email, password })`

**Features**:
- "Remember me" checkbox (localStorage)
- "Forgot password?" link (not implemented)
- Auto-redirect based on user role

**Status**: ✅ Standard login flow

---

### 2. INSTALLER AUTHENTICATION FLOW

#### A. Eligibility Modal
**Component**: `InstallerEligibilityModal.tsx`  
**Location**: `src/components/InstallerEligibilityModal.tsx`  
**Trigger**: "Become a Partner" button (pre-signup verification)

**Purpose**: Check if company is eligible to sign up as installer

**Fields**: NOT an auth form (eligibility check only)

**Status**: ✅ Can keep (optional pre-signup step)

---

#### B. Signup Modal
**Component**: `InstallerSignupModal.tsx`  
**Location**: `src/components/InstallerSignupModal.tsx`  
**Trigger**: After eligibility check, or "Sign Up" in installer section

**Fields** (Business-focused):
```typescript
{
  email: string,
  password: string,
  confirmPassword: string,
  companyName: string,
  contactName: string,
  phone: string,
  businessAddress: string,
  postcode: string
}
```

**OAuth Buttons**: 
- ✅ Google button (UI only)
- ✅ Apple button (UI only)

**API Call**: `/api/auth/register/installer`

**Validation**:
- Australian postcode (4 digits)
- Australian phone number format
- Company details required

**Status**: ❌ Complex business signup (requires data migration strategy)

---

#### C. Sign In Modal
**Component**: `InstallerSignInModal.tsx`  
**Location**: `src/components/InstallerSignInModal.tsx`  
**Trigger**: "Partner Sign In" button

**Fields**:
```typescript
{
  email: string,
  password: string
}
```

**OAuth Buttons**: 
- ✅ Google button (UI only)
- ✅ Apple button (UI only)

**Features**:
- Auto-redirect to /installer/dashboard
- Role verification (INSTALLER only)

**Status**: ✅ Standard login flow

---

### 3. ADMIN AUTHENTICATION FLOW

#### A. Admin Sign In Modal
**Component**: `AdminSignInModal.tsx` (146 lines)  
**Location**: `src/components/AdminSignInModal.tsx`  
**Trigger**: /admin page (auto-opens if unauthenticated)

**Fields**:
```typescript
{
  email: string,
  password: string
}
```

**OAuth**: ❌ NONE (admin login is email/password only)

**Features**:
- Role verification (ADMIN only)
- Auto-redirect to /admin/dashboard
- Hardened security (credentials only, no social login)

**Middleware Protection**:
```typescript
// src/middleware.ts
// Admin routes protected by JWT role check
if (pathname.startsWith('/admin')) {
  const token = req.nextauth.token;
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
}
```

**Status**: ✅ Secure admin-only flow

---

## 🔌 API ROUTES ANALYSIS

### 1. NextAuth Handler
**File**: `src/app/api/auth/[...nextauth]/route.ts` (6 lines)  
**Purpose**: Delegates to authOptions in lib/auth.ts

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Status**: ❌ DELETE (replaced by Clerk)

---

### 2. NextAuth Configuration
**File**: `src/lib/auth.ts` (170 lines)  
**Purpose**: Defines NextAuth providers, JWT callbacks, session callbacks

**Key Features**:
- CredentialsProvider (email/password validation)
- bcrypt password comparison
- JWT token generation with custom fields
- Session data mapping
- Role-based access control
- Phone/phoneVerified fields in JWT
- Lead submission quota tracking
- Auto-update lastLoginAt timestamp

**Environment Variables**:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_DEBUG=false
```

**Status**: ❌ DELETE (replaced by Clerk)

---

### 3. Homeowner Registration API
**File**: `src/app/api/auth/register/homeowner/route.ts` (163 lines)  
**Purpose**: Create homeowner account

**Request Body**:
```typescript
{
  fullName?: string,  // Optional (not sent by new modal)
  email: string,
  phone?: string,     // Optional
  address?: string,   // Optional (NOT STORED IN DB!)
  password: string
}
```

**Database Operation**:
```typescript
const user = await prisma.user.create({
  data: {
    name: fullName,           // NULL if not provided
    email: email.toLowerCase(),
    phone: phone,             // NULL if not provided
    password: hashedPassword, // bcrypt hash
    role: "HOMEOWNER",
    isActive: true,
  },
});
```

**Validation**:
- Email format
- Password strength (8+ chars, 1 letter, 1 number)
- Australian phone format (if provided)
- Duplicate email check

**Critical Bug**: API validates `address` field but NEVER stores it in database!

**Status**: ❌ DELETE (replaced by Clerk + webhook)

---

### 4. Installer Registration API
**File**: `src/app/api/auth/register/installer/route.ts` (213 lines)  
**Purpose**: Create installer account with business details

**Request Body**:
```typescript
{
  email: string,
  password: string,
  confirmPassword: string,
  companyName: string,
  contactName: string,
  phone: string,
  businessAddress: string,
  postcode: string
}
```

**Database Operation**:
```typescript
const user = await prisma.user.create({
  data: {
    email: email.toLowerCase(),
    password: hashedPassword,
    name: contactName,
    companyName: companyName,
    phone: phone,
    businessAddress: businessAddress,
    postcode: postcode,
    role: "INSTALLER",
    isActive: true,
    installerVerified: false, // Admin approval required
  },
});
```

**Validation**:
- All fields required
- Email format
- Password strength
- Australian postcode (4 digits)
- Australian phone number

**Status**: ❌ DELETE (replaced by Clerk + webhook with custom fields)

---

### 5. Phone Verification APIs
**Files**:
- `src/app/api/verification/send-otp/route.ts` - Send SMS OTP
- `src/app/api/verification/verify-otp/route.ts` - Verify OTP code
- `src/app/api/user/update-phone/route.ts` - Update phone number

**Purpose**: Phone number verification for lead submission

**Session Dependency**: Uses NextAuth `getServerSession(authOptions)`

**Status**: ⚠️ KEEP BUT MODIFY (replace session check with Clerk auth())

---

## 🗄️ DATABASE SCHEMA AUDIT

### User Model (Prisma)

**Location**: `prisma/schema.prisma`

**Required Fields**:
```prisma
model User {
  id                    String              @id @default(cuid())
  email                 String              @unique
  role                  UserRole            @default(HOMEOWNER)
  isActive              Boolean             @default(true)
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}
```

**Optional Auth Fields** (NULL allowed):
```prisma
  emailVerified         DateTime?
  password              String?              // ❌ DELETE (Clerk handles auth)
  name                  String?
  phone                 String?
  image                 String?
  companyName           String?
  businessAddress       String?
  postcode              String?
  lastLoginAt           DateTime?
  phoneVerified         Boolean             @default(false)
  installerVerified     Boolean             @default(false)
```

**Relationships**:
```prisma
  accounts              Account[]           // NextAuth accounts (OAuth)
  sessions              Session[]           // NextAuth sessions
  leadsAsHomeowner      Lead[]              @relation("homeowner_leads")
  leadsAsInstaller      Lead[]              @relation("installer_leads")
  quotesAsInstaller     Quote[]
  phoneVerifications    PhoneVerification[]
  installerAssignments  LeadAssignment[]
  adminAssignments      LeadAssignment[]
```

**NextAuth Tables** (TO BE DELETED):
```prisma
model Account {
  // OAuth provider accounts (Google, Apple)
  // Status: ❌ DELETE (Clerk manages OAuth)
}

model Session {
  // NextAuth session storage
  // Status: ❌ DELETE (Clerk uses JWTs)
}

model VerificationToken {
  // Email verification tokens
  // Status: ❌ DELETE (Clerk manages verification)
}
```

**Critical Fields for Clerk Migration**:
1. **`email`** - Will become secondary lookup (Clerk userId is primary)
2. **`role`** - Must sync to Clerk metadata
3. **`password`** - DELETE field (Clerk manages passwords)
4. **`phoneVerified`** - Keep (app-specific verification)
5. **`installerVerified`** - Keep (admin approval flow)

---

## 🔐 SESSION MANAGEMENT AUDIT

### Components Using `useSession()` (17 files)

**Root Level**:
- `src/components/LayoutContent.tsx` - Wraps entire app, manages modals

**Page Level**:
- `src/app/page.tsx` - Landing page (check auth status)
- `src/app/homeowner/dashboard/page.tsx` - Homeowner dashboard
- `src/app/installer/dashboard/page.tsx` - Installer dashboard (assumed)
- `src/app/admin/page.tsx` - Admin login page
- `src/app/blog/post/page.tsx` - Blog post (comment auth)

**Component Level** (12+ components):
- Header.tsx, HeaderMenu.tsx, TopBar.tsx
- HomeownerSignupModal.tsx, HomeownerSignInModal.tsx
- InstallerSignupModal.tsx, InstallerSignInModal.tsx
- AdminSignInModal.tsx
- DetailedQuoteAuthModal.tsx
- QuoteOptionsModal.tsx
- InstantQuoteForm.tsx
- QuoteBuilderModal.tsx

### Components Using `signOut()` (6 locations)

**Manual Logout**:
- LayoutContent.tsx - Header logout button
- homeowner/dashboard/page.tsx - Dashboard logout
- homeowner/layout.tsx - Layout guard (redirect on invalid role)
- installer/layout.tsx - Layout guard
- admin/layout.tsx - Layout guard

**Pattern**:
```typescript
const handleLogout = async () => {
  await signOut({ redirect: false });
  router.push('/');
};
```

---

## 🛡️ MIDDLEWARE & ROUTE PROTECTION

### Middleware File
**File**: `src/middleware.ts`  
**Purpose**: Protect admin routes with JWT role verification

```typescript
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Admin route protection
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/api')) {
    const token = req.nextauth.token;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Admin role is verified by NextAuth JWT - cannot be faked
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}
```

**Status**: ⚠️ MODIFY (replace with Clerk middleware)

---

## 📊 LEGACY CODE INVENTORY (TO DELETE/REPLACE)

### Files to DELETE (NextAuth-specific)

**API Routes** (3 files):
- [ ] `src/app/api/auth/[...nextauth]/route.ts`
- [ ] `src/app/api/auth/register/homeowner/route.ts`
- [ ] `src/app/api/auth/register/installer/route.ts`

**Configuration** (2 files):
- [ ] `src/lib/auth.ts` (170 lines)
- [ ] `src/types/next-auth.d.ts` (NextAuth type extensions)

**Prisma Models** (3 models):
- [ ] `Account` model (OAuth provider data)
- [ ] `Session` model (session storage)
- [ ] `VerificationToken` model (email verification)

**Database Fields** (1 field):
- [ ] `User.password` (bcrypt hash - Clerk manages passwords)

**Dependencies** (4 packages):
- [ ] `next-auth` (package.json)
- [ ] `@next-auth/prisma-adapter` (if present)
- [ ] `bcryptjs` (password hashing)
- [ ] `@types/bcryptjs` (dev dependency)

**Environment Variables** (3 vars):
- [ ] `NEXTAUTH_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_DEBUG`

---

### Files to REPLACE (Auth UI Components)

**Signup Modals** (3 files):
- [ ] `src/components/HomeownerSignupModal.tsx` (432 lines)
- [ ] `src/components/InstallerSignupModal.tsx`
- [ ] `src/components/DetailedQuoteAuthModal.tsx` (200 lines)

**Sign In Modals** (3 files):
- [ ] `src/components/HomeownerSignInModal.tsx`
- [ ] `src/components/InstallerSignInModal.tsx`
- [ ] `src/components/AdminSignInModal.tsx` (146 lines)

**Eligibility Modal** (1 file):
- [ ] `src/components/InstallerEligibilityModal.tsx` (can keep logic, remove auth)

**Total Lines to Replace**: ~1,500+ lines of custom auth UI

---

### Files to MODIFY (Session References)

**Replace `useSession()` with Clerk hooks** (17 files):
```typescript
// OLD:
import { useSession } from 'next-auth/react';
const { data: session } = useSession();

// NEW:
import { useUser } from '@clerk/nextjs';
const { user, isLoaded, isSignedIn } = useUser();
```

**Replace `signOut()` with Clerk** (6 files):
```typescript
// OLD:
import { signOut } from 'next-auth/react';
await signOut({ redirect: false });

// NEW:
import { useClerk } from '@clerk/nextjs';
const { signOut } = useClerk();
await signOut();
```

**Replace `getServerSession()` with Clerk** (3 API routes):
```typescript
// OLD:
import { getServerSession } from 'next-auth';
const session = await getServerSession(authOptions);

// NEW:
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();
```

---

## 🎯 CLERK MIGRATION STRATEGY

### Phase 1: Clerk Setup & User Sync

**Goal**: Set up Clerk, create sync mechanism between Clerk and Prisma

**Steps**:
1. Create Clerk account (free tier supports dev + production)
2. Install `@clerk/nextjs` package
3. Configure environment variables (.env.local)
4. Create Clerk webhook to sync user data to Prisma
5. Add `clerkId` field to User model (foreign key)

**Prisma Schema Changes**:
```prisma
model User {
  id                    String              @id @default(cuid())
  clerkId               String              @unique  // NEW: Clerk user ID
  email                 String              @unique
  // password            String?             // DELETE THIS FIELD
  role                  UserRole            @default(HOMEOWNER)
  // ... keep other fields
}

// DELETE these models:
// model Account { ... }
// model Session { ... }
// model VerificationToken { ... }
```

**Clerk Webhook** (new API route):
```typescript
// src/app/api/webhooks/clerk/route.ts
export async function POST(req: Request) {
  const { type, data } = await req.json();
  
  if (type === 'user.created') {
    // Sync new Clerk user to Prisma
    await prisma.user.create({
      data: {
        clerkId: data.id,
        email: data.email_addresses[0].email_address,
        name: data.first_name + ' ' + data.last_name,
        role: 'HOMEOWNER', // Default role
        isActive: true,
      },
    });
  }
  
  if (type === 'user.updated') {
    // Sync Clerk user updates to Prisma
    await prisma.user.update({
      where: { clerkId: data.id },
      data: {
        email: data.email_addresses[0].email_address,
        name: data.first_name + ' ' + data.last_name,
      },
    });
  }
  
  return new Response('OK', { status: 200 });
}
```

---

### Phase 2: Replace Auth UI

**Goal**: Replace all custom auth modals with Clerk components

**Homeowner Flow**:
```typescript
// Instead of HomeownerSignupModal, use:
import { SignUp } from '@clerk/nextjs';

<SignUp 
  appearance={{
    elements: {
      rootBox: 'theme-card',
      // Customize to match neumorphic design
    }
  }}
  redirectUrl="/dashboard"
/>

// Instead of HomeownerSignInModal, use:
import { SignIn } from '@clerk/nextjs';

<SignIn 
  appearance={{
    elements: {
      rootBox: 'theme-card',
    }
  }}
  redirectUrl="/dashboard"
/>
```

**Installer Flow** (with role metadata):
```typescript
<SignUp 
  unsafeMetadata={{
    role: 'INSTALLER',
    companyName: 'collected-separately',
  }}
  redirectUrl="/installer/dashboard"
/>
```

**Admin Flow** (restrict to specific emails):
```typescript
<SignIn 
  appearance={{
    elements: {
      rootBox: 'theme-card',
    }
  }}
  redirectUrl="/admin/dashboard"
  // Admin emails configured in Clerk dashboard
/>
```

---

### Phase 3: Update Session References

**Goal**: Replace NextAuth session hooks with Clerk hooks

**Client Components**:
```typescript
// OLD:
import { useSession } from 'next-auth/react';
const { data: session, status } = useSession();
const userRole = session?.user?.role;

// NEW:
import { useUser } from '@clerk/nextjs';
const { user, isLoaded, isSignedIn } = useUser();
const userRole = user?.publicMetadata?.role;
```

**Server Components**:
```typescript
// OLD:
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
const session = await getServerSession(authOptions);

// NEW:
import { auth, currentUser } from '@clerk/nextjs/server';
const { userId } = await auth();
const user = await currentUser();
```

**API Routes**:
```typescript
// OLD:
import { getServerSession } from 'next-auth';
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// NEW:
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

---

### Phase 4: Migrate Middleware

**Goal**: Replace NextAuth middleware with Clerk middleware

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isInstallerRoute = createRouteMatcher(['/installer(.*)']);
const isHomeownerRoute = createRouteMatcher(['/homeowner(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  
  // Admin route protection
  if (isAdminRoute(req)) {
    if (!userId) {
      return auth().redirectToSignIn();
    }
    if (sessionClaims?.metadata?.role !== 'ADMIN') {
      return Response.redirect(new URL('/', req.url));
    }
  }
  
  // Installer route protection
  if (isInstallerRoute(req)) {
    if (!userId) {
      return auth().redirectToSignIn();
    }
    if (sessionClaims?.metadata?.role !== 'INSTALLER') {
      return Response.redirect(new URL('/', req.url));
    }
  }
  
  // Homeowner route protection
  if (isHomeownerRoute(req)) {
    if (!userId) {
      return auth().redirectToSignIn();
    }
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

### Phase 5: Handle Custom Fields

**Problem**: Installer signup requires business fields (companyName, postcode, etc.)

**Solution**: Multi-step flow
1. User signs up with Clerk (email/password only)
2. Redirect to `/installer/onboarding` page
3. Collect business details in custom form
4. Save to Prisma User table via API

```typescript
// src/app/installer/onboarding/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function InstallerOnboarding() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    businessAddress: '',
    postcode: '',
  });
  
  const handleSubmit = async () => {
    // Save business details to Prisma
    await fetch('/api/user/update-business-info', {
      method: 'POST',
      body: JSON.stringify({
        clerkId: user.id,
        ...formData,
      }),
    });
    
    // Redirect to dashboard
    router.push('/installer/dashboard');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Business detail fields */}
    </form>
  );
}
```

---

## 📝 CLERK CONFIGURATION GUIDE

### 1. Clerk Account Setup (5 minutes)

**Steps**:
1. Go to https://clerk.com
2. Sign up (free tier: 10,000 MAUs, unlimited dev environments)
3. Create new application: "SolarMatch"
4. Enable authentication methods:
   - ✅ Email/Password
   - ✅ Google OAuth
   - ✅ Apple OAuth
5. Configure social providers:
   - Google: Add client ID/secret from Google Cloud Console
   - Apple: Add client ID/secret from Apple Developer Portal

---

### 2. Environment Variables

**Add to `.env.local`**:
```env
# Clerk API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (for dev)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook Secret (for user sync)
CLERK_WEBHOOK_SECRET=whsec_...
```

**Remove from `.env.local`**:
```env
# DELETE THESE:
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_DEBUG=...
```

---

### 3. Clerk Dashboard Configuration

**User Roles (Metadata)**:
- Go to Clerk Dashboard > Users > Metadata
- Add public metadata field: `role` (string)
- Values: "HOMEOWNER", "INSTALLER", "ADMIN"

**Webhooks**:
- Go to Clerk Dashboard > Webhooks
- Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
- Select events: `user.created`, `user.updated`, `user.deleted`
- Copy webhook secret to `.env.local`

**Email Templates**:
- Customize signup/login email templates to match SolarMatch branding
- Add logo, brand colors, footer

---

### 4. Local Development

**How Clerk Works Locally**:
- Clerk connects to Clerk's cloud in both dev and production
- Local development uses test API keys (`pk_test_...`, `sk_test_...`)
- All user data stored in Clerk's dev database (separate from production)
- Dev dashboard: https://dashboard.clerk.com (view/manage test users)

**Local User Management**:
- View test users: Clerk Dashboard > Users
- Create test user manually: Dashboard > Create User
- Delete test data: Dashboard > Delete User
- Test OAuth flows: Works locally (redirects to Google/Apple, back to localhost)

**Database Sync**:
- Clerk webhook fires when user signs up → Your Prisma DB updated
- Query users by `clerkId` in your Prisma DB
- Clerk userId = primary auth identifier
- Prisma User = app-specific data (role, quotes, leads)

---

## ✅ MIGRATION CHECKLIST

### Pre-Migration
- [ ] Backup current database (export all users)
- [ ] Create Clerk account
- [ ] Configure OAuth providers (Google, Apple)
- [ ] Set up environment variables
- [ ] Configure webhooks

### Database Migration
- [ ] Add `clerkId` field to User model
- [ ] Delete `password` field from User model
- [ ] Delete `Account`, `Session`, `VerificationToken` models
- [ ] Run Prisma migration
- [ ] Create data migration script (existing users)

### Code Migration
- [ ] Install `@clerk/nextjs` package
- [ ] Uninstall `next-auth`, `bcryptjs`, `@types/bcryptjs`
- [ ] Wrap app in `<ClerkProvider>` (src/app/layout.tsx)
- [ ] Create Clerk webhook API route
- [ ] Replace all auth modals with Clerk components (6 modals)
- [ ] Update all `useSession()` calls (17 files)
- [ ] Update all `signOut()` calls (6 files)
- [ ] Update all `getServerSession()` calls (3 API routes)
- [ ] Replace middleware with Clerk middleware
- [ ] Update phone verification APIs (use Clerk auth())
- [ ] Create installer onboarding page (business details)

### Testing
- [ ] Test homeowner signup flow
- [ ] Test homeowner login flow
- [ ] Test installer signup + onboarding flow
- [ ] Test installer login flow
- [ ] Test admin login flow
- [ ] Test instant quote auth flow
- [ ] Test protected routes (homeowner, installer, admin)
- [ ] Test logout flow
- [ ] Test OAuth (Google, Apple)
- [ ] Test role-based access control

### Cleanup
- [ ] Delete legacy API routes (3 files)
- [ ] Delete legacy auth config (2 files)
- [ ] Delete legacy modals (6 files)
- [ ] Remove NextAuth environment variables
- [ ] Update documentation

---

## 📊 MIGRATION IMPACT SUMMARY

**Files to Delete**: 11 files (~800 lines)
**Files to Replace**: 6 modals (~1,500 lines)
**Files to Modify**: 17+ components (~2,000 lines)
**Database Changes**: Add 1 field, delete 1 field, delete 3 models
**Dependencies**: Remove 3 packages, add 1 package
**Environment Variables**: Remove 3 vars, add 6 vars

**Estimated Time**: 10-12 hours (including testing)

**Risk Level**: MEDIUM
- Database migration needed (existing users)
- All auth flows affected
- Requires thorough testing

**Benefits**:
- ✅ Modern auth solution with built-in OAuth
- ✅ No password management (Clerk handles security)
- ✅ Built-in email verification
- ✅ Built-in MFA/2FA support
- ✅ User management dashboard
- ✅ Reduced code maintenance (~2,300 lines removed)
- ✅ Better dev experience (Clerk dev dashboard)

---

**Report Status**: ✅ COMPLETE  
**Next Step**: Create detailed Clerk Migration Plan (step-by-step implementation)
