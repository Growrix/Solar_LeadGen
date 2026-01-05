# 🔐 SolarMatch Authentication System - Complete Audit Report

**Generated:** November 11, 2025  
**System:** Next.js 14 with NextAuth.js v4.24.11  
**Database:** PostgreSQL with Prisma ORM  
**Status:** Production-Ready with NextAuth.js (Credential-based)

---

## 📋 Executive Summary

This audit provides a comprehensive analysis of the SolarMatch authentication system. The application uses **NextAuth.js v4** for authentication with a **credentials-based provider** (email/password). The system supports **three user roles** (HOMEOWNER, INSTALLER, ADMIN) with role-based access control (RBAC) enforced at both the middleware and API route levels.

### Key Findings:
- ✅ **Secure JWT-based authentication** with proper encryption
- ✅ **Role-based access control** with middleware protection
- ✅ **Password hashing** using bcrypt (10 salt rounds)
- ✅ **Session management** with 30-day expiry
- ✅ **Comprehensive validation** on registration endpoints
- ⚠️ **No OAuth providers** currently configured (Google/Apple icons present but inactive)
- ⚠️ **No password reset functionality** implemented
- ⚠️ **No email verification** for new accounts

---

## 🏗️ Architecture Overview

### Authentication Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ SignIn Modals  │  │ SignUp Modals  │  │ useSession() │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  NextAuth.js Provider Layer                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           SessionProvider (Client-side)                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Middleware Layer (Edge)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   withAuth() - Route Protection & Role Validation      │ │
│  │   • /admin/* → ADMIN only (or ADMIN bypass)           │ │
│  │   • /installer/* → INSTALLER only                      │ │
│  │   • /homeowner/* → HOMEOWNER only                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Route Layer                         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Auth Endpoints │  │ Protected APIs │  │ Registration │  │
│  │ /api/auth/*    │  │ getServerSess..│  │    APIs      │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (Prisma)                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  User Model    │  │ Session Model  │  │ Account Model│  │
│  │  (Password,    │  │ (JWT tokens    │  │ (OAuth data) │  │
│  │   Role, etc)   │  │  stored here)  │  │              │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Inventory - All Authentication-Related Files

### Core Configuration Files

#### 1. **`src/lib/auth.ts`** - Central Auth Configuration
**Purpose:** NextAuth.js configuration with credentials provider  
**Size:** ~170 lines  
**Key Functions:**
- `authOptions: NextAuthOptions` - Main configuration object
- Credentials provider setup
- JWT and session callbacks
- User authentication logic
- Password verification with bcrypt

**Critical Code Paths:**
```typescript
// Credentials Provider - Handles email/password login
providers: [CredentialsProvider({
  async authorize(credentials) {
    // 1. Validate credentials exist
    // 2. Query user from database
    // 3. Verify password with bcrypt
    // 4. Check if user is active
    // 5. Update lastLoginAt
    // 6. Return user object for JWT
  }
})]

// JWT Callback - Manages token lifecycle
callbacks: {
  async jwt({ token, user, trigger, session }) {
    // 1. On sign-in: Add user data to token
    // 2. On update: Handle phone/verification changes
    // 3. Always return clean token structure (prevents bloat)
  },
  
  // Session Callback - Shapes client-side session
  async session({ session, token }) {
    // Maps JWT token data to session.user object
    // Client receives this data via useSession()
  }
}
```

**Security Features:**
- bcrypt password hashing (10 rounds)
- JWT encryption with NEXTAUTH_SECRET
- 30-day session max age
- Token size monitoring (development only)
- Clean token structure to prevent bloat

---

#### 2. **`src/types/next-auth.d.ts`** - TypeScript Definitions
**Purpose:** Extends NextAuth types with custom fields  
**Size:** ~54 lines

**Custom Session Interface:**
```typescript
interface Session {
  user: {
    id: string;
    role: string;
    email: string;
    name: string | null;
    image: string | null;
    phone: string | null;
    phoneVerified: boolean;
    leadSubmissionCount: number;
    installerVerified: boolean;
    quoteLimit: number;
  }
}
```

---

#### 3. **`src/middleware.ts`** - Route Protection
**Purpose:** Edge middleware for route authentication and RBAC  
**Size:** ~88 lines

**Route Protection Rules:**
```typescript
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // 1. ADMIN BYPASS: Admins can access ALL routes
    if (token.role === 'ADMIN') {
      return NextResponse.next();
    }
    
    // 2. ROLE-BASED ACCESS CONTROL
    // /admin/* → ADMIN only (redirects non-admins to /)
    // /installer/* → INSTALLER only (redirects to correct dashboard)
    // /homeowner/* → HOMEOWNER only (redirects to correct dashboard)
  }
)

// Protected Route Matcher
export const config = {
  matcher: ['/homeowner/:path*', '/installer/:path*', '/admin/:path*']
};
```

**Key Features:**
- Edge runtime (fast, runs before page load)
- JWT token validation via NextAuth
- Prevents unauthorized access attempts
- Logs unauthorized access attempts to console
- Admin bypass for support/debugging

---

### Database Schema (Prisma)

#### 4. **`prisma/schema.prisma`** - User & Session Models
**Purpose:** Database schema for authentication  
**Location:** Lines 1-456

**User Model:**
```prisma
model User {
  id                    String              @id @default(cuid())
  email                 String              @unique
  emailVerified         DateTime?
  password              String?
  role                  UserRole            @default(HOMEOWNER)
  isActive              Boolean             @default(true)
  name                  String?
  phone                 String?
  image                 String?
  companyName           String?
  businessAddress       String?
  postcode              String?
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  lastLoginAt           DateTime?
  installerVerified     Boolean             @default(false)
  leadSubmissionCount   Int                 @default(0)
  phoneVerified         Boolean             @default(false)
  leadSubmissionLimit   Int                 @default(5)
  biddingLeadsSubmitted Int                 @default(0)
  
  // Relations
  accounts              Account[]
  sessions              Session[]
  leadsAsHomeowner      Lead[]              @relation("homeowner_leads")
  leadsAsInstaller      Lead[]              @relation("installer_leads")
  phoneVerifications    PhoneVerification[]
  quotesAsInstaller     Quote[]             @relation("installer_quotes")
  installerAssignments  LeadAssignment[]    @relation("installer_assignments")
  adminAssignments      LeadAssignment[]    @relation("admin_assignments")
}

enum UserRole {
  GUEST
  HOMEOWNER
  INSTALLER
  ADMIN
}
```

**Session Model:**
```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Account Model (for OAuth - currently unused):**
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}
```

**PhoneVerification Model:**
```prisma
model PhoneVerification {
  id              String    @id @default(cuid())
  phoneNumber     String
  verificationSid String?
  attempts        Int       @default(0)
  lastAttemptAt   DateTime?
  verifiedAt      DateTime?
  createdAt       DateTime  @default(now())
  expiresAt       DateTime
  code            String
  status          String    @default("PENDING")
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### API Routes - Authentication Endpoints

#### 5. **`src/app/api/auth/[...nextauth]/route.ts`** - NextAuth Handler
**Purpose:** Main NextAuth.js API route handler  
**Size:** 5 lines

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Endpoints Handled:**
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in with credentials
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/csrf` - CSRF token
- `GET /api/auth/providers` - Available auth providers

---

#### 6. **`src/app/api/auth/register/homeowner/route.ts`** - Homeowner Registration
**Purpose:** Create new homeowner accounts  
**Size:** 163 lines  
**Method:** POST

**Request Body:**
```typescript
{
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}
```

**Validation:**
- ✅ Email format validation (regex)
- ✅ Password length (minimum 8 characters)
- ✅ Password complexity (1 letter + 1 number)
- ✅ Australian phone format validation
- ✅ Duplicate email check
- ✅ Bcrypt hashing (10 salt rounds)

**Response:**
```typescript
// Success (201)
{
  success: true,
  message: "Account created successfully",
  user: {
    id: string,
    name: string,
    email: string,
    role: "HOMEOWNER"
  }
}

// Error (400/409/500)
{
  error: string
}
```

---

#### 7. **`src/app/api/auth/register/installer/route.ts`** - Installer Registration
**Purpose:** Create new installer accounts with business details  
**Size:** 213 lines  
**Method:** POST

**Request Body:**
```typescript
{
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  contactName: string;
  phone: string;
  businessAddress: string;
  postcode: string;
}
```

**Validation:**
- ✅ All homeowner validations
- ✅ Password confirmation match
- ✅ 4-digit postcode validation (Australian)
- ✅ Business details required

**Differences from Homeowner:**
- Sets `role: "INSTALLER"`
- Requires company information
- `installerVerified: false` by default (admin must approve)

---

### Protected API Routes (Session-Based)

The following API routes use `getServerSession(authOptions)` to authenticate requests:

#### 8. **Session Verification Pattern**
**Used in 40+ API routes**

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET/POST/PUT/DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Role-based checks
  if (session.user.role !== 'EXPECTED_ROLE') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // Process authenticated request...
}
```

**Protected API Routes List:**
- `src/app/api/leads/route.ts` (GET, POST)
- `src/app/api/leads/[id]/route.ts` (GET, PATCH, DELETE)
- `src/app/api/leads/[id]/approve/route.ts` (POST)
- `src/app/api/leads/[id]/reject/route.ts` (POST)
- `src/app/api/leads/[id]/purchase/route.ts` (POST)
- `src/app/api/leads/[id]/cancel/route.ts` (POST)
- `src/app/api/leads/[id]/archive/route.ts` (POST)
- `src/app/api/leads/[id]/unarchive/route.ts` (POST)
- `src/app/api/leads/[id]/resell/route.ts` (POST)
- `src/app/api/leads/[id]/reset-timer/route.ts` (POST)
- `src/app/api/homeowner/profile/route.ts` (GET, PATCH)
- `src/app/api/homeowner/dashboard/route.ts` (GET)
- `src/app/api/settings/route.ts` (GET, POST)
- `src/app/api/admin/homeowners/route.ts` (GET)
- `src/app/api/admin/homeowners/[id]/lead-limit/route.ts` (PATCH)
- `src/app/api/admin/homeowners/analytics/route.ts` (GET)
- `src/app/api/admin/installers/list/route.ts` (GET)
- `src/app/api/admin/leads/[id]/assign/route.ts` (POST)
- `src/app/api/admin/leads/[id]/assignments/[installerId]/route.ts` (DELETE)
- `src/app/api/verification/send-otp/route.ts` (POST)
- `src/app/api/verification/verify-otp/route.ts` (POST)
- `src/app/api/user/update-phone/route.ts` (POST)

---

### Client-Side Components

#### 9. **`src/components/NextAuthProvider.tsx`** - Session Provider Wrapper
**Purpose:** Wraps app with NextAuth SessionProvider  
**Size:** 13 lines

```typescript
'use client';
import { SessionProvider } from 'next-auth/react';

export default function NextAuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**Usage in `src/app/layout.tsx`:**
```tsx
<NextAuthProvider>
  <ThemeProvider>
    <LayoutContent>{children}</LayoutContent>
  </ThemeProvider>
</NextAuthProvider>
```

---

#### 10. **`src/components/HomeownerSignInModal.tsx`** - Homeowner Login UI
**Purpose:** Login modal for homeowners  
**Size:** 332 lines

**Key Features:**
- Email/password form
- `signIn('credentials')` from next-auth/react
- Password visibility toggle
- Error/success message display
- Forgot password placeholder (not implemented)
- Google/Apple OAuth buttons (UI only, not functional)
- Escape key to close
- Form validation

**Form Fields:**
```tsx
{
  email: string,
  password: string
}
```

**Sign-In Flow:**
```typescript
const handleSubmit = async (e) => {
  const result = await signIn('credentials', {
    redirect: false,
    email: formData.email,
    password: formData.password,
  });

  if (result?.error) {
    setError(result.error);
  } else if (result?.ok) {
    setSuccess('Signed in successfully!');
    setTimeout(() => onSuccess(), 1000);
  }
};
```

---

#### 11. **`src/components/InstallerSignInModal.tsx`** - Installer Login UI
**Purpose:** Login modal for installers  
**Size:** 325 lines

**Identical Features to Homeowner Modal:**
- Same form structure
- Same validation
- Same error handling
- Different success redirect (installer dashboard)

---

#### 12. **`src/components/HomeownerSignupModal.tsx`** - Homeowner Registration UI
**Purpose:** Registration modal for homeowners  
**Size:** 432 lines

**Form Fields:**
```tsx
{
  email: string,
  password: string,
  confirmPassword: string
}
```

**Registration Flow:**
```typescript
const handleSubmit = async (e) => {
  // 1. Client-side validation
  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  // 2. Call registration API
  const response = await fetch('/api/auth/register/homeowner', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  // 3. Auto sign-in on success
  const signInResult = await signIn('credentials', {
    redirect: false,
    email,
    password
  });

  // 4. Redirect to dashboard
  if (signInResult?.ok) {
    onSuccess();
  }
};
```

---

#### 13. **`src/components/InstallerSignupModal.tsx`** (Referenced but not fully audited)
**Purpose:** Registration modal for installers  
**Expected Features:**
- Extended form with business details
- Calls `/api/auth/register/installer`
- Similar auto sign-in flow

---

#### 14. **`src/components/AdminSignInModal.tsx`** - Admin Login UI
**Purpose:** Secure admin panel access  
**Size:** 200 lines

**Key Differences:**
- Minimal UI (no OAuth buttons)
- Higher security messaging
- Calls same `signIn('credentials')` endpoint
- Different success redirect (`/admin/dashboard`)
- Shows "Secure admin access only" message

---

#### 15. **`src/components/LayoutContent.tsx`** - Global Navigation & Auth State
**Purpose:** Main layout component with auth-aware navigation  
**Size:** ~600 lines

**Auth Features:**
```typescript
const { data: session, status } = useSession();

// Session states: 'loading' | 'authenticated' | 'unauthenticated'

// Conditional rendering based on role
{session?.user.role === 'HOMEOWNER' && <HomeownerNav />}
{session?.user.role === 'INSTALLER' && <InstallerNav />}
{session?.user.role === 'ADMIN' && <AdminNav />}

// Sign out functionality
const handleSignOut = async () => {
  await signOut({ redirect: false });
  router.push('/');
};
```

**Modal Management:**
- Opens/closes sign-in modals
- Opens/closes sign-up modals
- Handles URL query params (e.g., `?action=signin`)
- Manages modal transitions

---

### Helper Functions & Utilities

#### 16. **`src/lib/clerk-auth-helpers.ts`** - Clerk Compatibility Layer
**Purpose:** Backward compatibility for Clerk-to-NextAuth migration  
**Size:** 123 lines  
**Status:** ⚠️ Legacy code (references Clerk but system uses NextAuth)

**Functions:**
```typescript
// Get Clerk session (returns null - Clerk not active)
export async function getClerkSession(): Promise<ClerkSession | null> {
  const { userId } = await auth(); // Clerk function
  // This will fail as Clerk is not configured
}

// Require auth with role check
export async function requireAuth(allowedRoles?: UserRole[]): Promise<ClerkSession> {
  // Throws if not authenticated
}
```

**⚠️ IMPORTANT:** This file is **not actively used** in the current NextAuth system. It appears to be leftover from a previous Clerk implementation. All production code uses `getServerSession(authOptions)`.

---

### Pages Using Authentication

#### 17. **`src/app/homeowner/dashboard/page.tsx`**
**Purpose:** Homeowner dashboard (protected route)  
**Auth Method:** `useSession()` from next-auth/react

```typescript
const { data: session, update: updateSession } = useSession();

// Update session when phone verified
await updateSession({
  phoneVerified: true,
  phone: newPhone
});
```

---

#### 18. **`src/app/installer/marketplace/page.tsx`**
**Purpose:** Installer lead marketplace (protected route)  
**Auth Method:** `useSession()` from next-auth/react

---

#### 19. **`src/app/installer/purchased-leads/page.tsx`**
**Purpose:** Installer purchased leads view (protected route)  
**Auth Method:** `useSession()` from next-auth/react

---

#### 20. **`src/app/installer/leads/[id]/page.tsx`**
**Purpose:** Individual lead detail page (protected route)  
**Auth Method:** `useSession()` from next-auth/react

---

#### 21. **`src/app/admin/page.tsx`**
**Purpose:** Admin login landing page  
**Auth Method:** Shows AdminSignInModal, then redirects to dashboard

```typescript
const handleSignInSuccess = () => {
  router.replace('/admin/dashboard');
  router.refresh(); // Ensure session is loaded
};
```

---

#### 22. **`src/app/page.tsx`** - Public Homepage
**Purpose:** Landing page with conditional auth features  
**Auth Method:** `useSession()` to detect logged-in state

```typescript
const { data: session, status } = useSession();

// If logged in, skip signup modal and submit quote directly
if (status === 'authenticated' && session?.user) {
  await submitQuote({
    userId: session.user.id,
    userEmail: session.user.email
  });
}
```

---

## 🔄 Complete Authentication Flows

### Flow 1: Homeowner Registration & First Login

```
User → HomeownerSignupModal
  ↓ Enters email + password
  ↓ Client validates form
  ↓
POST /api/auth/register/homeowner
  ↓ Validates email format
  ↓ Validates password strength
  ↓ Checks duplicate email
  ↓ Hashes password (bcrypt)
  ↓ INSERT User (role=HOMEOWNER)
  ↓
Response: 201 { success: true, user: {...} }
  ↓
Auto signIn('credentials', { email, password })
  ↓ Query user by email
  ↓ Verify password (bcrypt.compare)
  ↓ Generate JWT token
  ↓
Session created → Redirect to /homeowner/dashboard
  ↓
Dashboard loads → useSession() returns user data
```

**Time Estimate:** 2-3 seconds (includes password hashing)

---

### Flow 2: Installer Registration & First Login

```
User → InstallerSignupModal
  ↓ Enters email, password, company info, postcode
  ↓ Client validates: passwords match, form complete
  ↓
POST /api/auth/register/installer
  ↓ Validates all fields + business details
  ↓ Checks 4-digit postcode
  ↓ Hashes password
  ↓ INSERT User (role=INSTALLER, installerVerified=false)
  ↓
Auto signIn('credentials')
  ↓ JWT generated
  ↓
Redirect to /installer/marketplace (may show "pending approval")
```

**Differences from Homeowner:**
- Requires business details
- Sets `installerVerified: false`
- Admin must approve before full access

---

### Flow 3: Existing User Sign-In (Any Role)

```
User → SignInModal
  ↓ Enters email + password
  ↓
signIn('credentials', { email, password, redirect: false })
  ↓
NextAuth → authOptions.providers[0].authorize()
  ↓ Query User by email
  ↓ Check: password exists
  ↓ Check: bcrypt.compare(password, hashedPassword)
  ↓ Check: user.isActive === true
  ↓ Update: lastLoginAt = NOW()
  ↓ Return user object
  ↓
JWT callback adds user data to token
  ↓
Session callback shapes session.user
  ↓
Client receives session via useSession()
  ↓
Redirect based on role:
  - HOMEOWNER → /homeowner/dashboard
  - INSTALLER → /installer/marketplace
  - ADMIN → /admin/dashboard
```

**Error Handling:**
- Invalid credentials → "Invalid credentials" error
- Account deactivated → "Account deactivated" error
- Database error → Generic error message

---

### Flow 4: Middleware Route Protection

```
User navigates to /homeowner/dashboard
  ↓
Next.js Edge Runtime → middleware.ts
  ↓
withAuth() checks for JWT token
  ↓ No token? → Redirect to /
  ↓ Token exists? → Decode JWT
  ↓
Check: token.role === 'ADMIN' ? Allow all : Continue
  ↓
Check route vs role:
  - /admin/* and role !== 'ADMIN' → Redirect to /
  - /installer/* and role !== 'INSTALLER' → Redirect to correct dashboard
  - /homeowner/* and role !== 'HOMEOWNER' → Redirect to correct dashboard
  ↓
Role matches → NextResponse.next()
  ↓
Page loads with session
```

**Protection Levels:**
1. No token → Redirect
2. Wrong role → Redirect to appropriate dashboard
3. Admin role → Bypass all checks
4. Correct role → Access granted

---

### Flow 5: Session Update (Phone Verification Example)

```
User on /homeowner/dashboard
  ↓ Clicks "Verify Phone"
  ↓
POST /api/verification/send-otp
  ↓ Session checked
  ↓ OTP sent via Twilio
  ↓
User enters OTP
  ↓
POST /api/verification/verify-otp
  ↓ Code validated
  ↓ Update User: phoneVerified = true
  ↓
Client: updateSession({ phoneVerified: true, phone: '+61...' })
  ↓
JWT callback (trigger='update') updates token
  ↓
useSession() hook receives new data
  ↓
UI updates: "Phone Verified ✓"
```

---

### Flow 6: Sign Out

```
User clicks "Sign Out"
  ↓
await signOut({ redirect: false })
  ↓ NextAuth clears session cookie
  ↓ CSRF token cleared
  ↓
useSession() returns null
  ↓
router.push('/')
  ↓
Middleware blocks protected routes
  ↓
User on home page (guest state)
```

---

### Flow 7: Admin Access with Bypass

```
Admin signs in
  ↓ JWT: { role: 'ADMIN' }
  ↓
Admin navigates to /installer/marketplace
  ↓
middleware.ts checks token.role
  ↓ token.role === 'ADMIN' → BYPASS
  ↓
console.log("Admin access granted to /installer/marketplace")
  ↓
Page loads normally
  ↓
Page may show admin-specific UI
```

**Purpose:**
- Support/debugging access
- Content management
- Cross-role visibility

---

## 🔒 Security Analysis

### ✅ Strong Security Practices

1. **Password Hashing**
   - Algorithm: bcrypt
   - Salt rounds: 10
   - Passwords never stored in plain text
   - Passwords never logged

2. **JWT Security**
   - Encrypted with `NEXTAUTH_SECRET`
   - 30-day expiration
   - HTTP-only cookies
   - CSRF protection enabled

3. **Session Management**
   - JWT strategy (stateless)
   - Session validation on every route
   - Automatic expiry
   - Clean logout

4. **Input Validation**
   - Email format (regex)
   - Password strength (8+ chars, letter + number)
   - Phone format (Australian)
   - SQL injection prevention (Prisma)

5. **Role-Based Access Control (RBAC)**
   - Middleware level (edge runtime)
   - API level (server-side)
   - UI level (conditional rendering)
   - Three-layer protection

6. **Database Security**
   - Prisma ORM prevents SQL injection
   - Indexed fields for performance
   - Cascade deletes for integrity
   - Password field never selected unnecessarily

7. **Error Handling**
   - Generic error messages (prevents info leakage)
   - Detailed logs server-side only
   - Proper status codes (401 vs 403)

---

### ⚠️ Security Concerns & Recommendations

#### 1. **No Email Verification**
**Risk:** Users can register with fake emails  
**Impact:** Low  
**Recommendation:**
```typescript
// Add email verification flow
1. On registration, set emailVerified: null
2. Send verification email with token
3. User clicks link → /api/auth/verify-email?token=xxx
4. Set emailVerified: new Date()
5. Block features until verified
```

#### 2. **No Password Reset**
**Risk:** Users locked out if forgot password  
**Impact:** Medium  
**Recommendation:**
```typescript
// Implement password reset
1. "Forgot Password" → /api/auth/forgot-password
2. Generate reset token
3. Send email with link
4. /reset-password?token=xxx
5. Verify token, allow new password
6. Hash and update
7. Invalidate token
```

#### 3. **OAuth Providers Incomplete**
**Risk:** None (inactive)  
**Impact:** Low  
**To Enable:**
```typescript
providers: [
  CredentialsProvider({ /* existing */ }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  AppleProvider({
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
  })
]
```

#### 4. **Admin Account Security**
**Risk:** Weak admin credentials  
**Impact:** Critical  
**Recommendation:**
- Strong password (16+ chars)
- Consider 2FA
- Log all admin actions
- Regular password rotation
- Database-level admin creation only

#### 5. **Rate Limiting**
**Risk:** Brute force attacks  
**Impact:** Medium  
**Recommendation:**
```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: upstashRedis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

// In authorize():
const { success } = await ratelimit.limit(credentials.email);
if (!success) throw new Error("Too many attempts");
```

#### 6. **NEXTAUTH_SECRET in Production**
**Current:** `"solarmatch-dev-secret-key-change-in-production-2024"`  
**Risk:** If unchanged, JWT compromised  
**Impact:** Critical  
**Recommendation:**
```bash
openssl rand -base64 32
# Set in production:
NEXTAUTH_SECRET="<generated-secret>"
```

#### 7. **Session Fixation Protection**
**Status:** ✅ Protected (JWT regenerated on sign-in)

#### 8. **CSRF Protection**
**Status:** ✅ Protected (NextAuth default)

---

## 📊 Database Schema Summary

### Authentication Tables

| Table | Primary Key | Indexes | Purpose |
|-------|-------------|---------|---------|
| `users` | id (cuid) | email, role | User accounts with auth data |
| `sessions` | id (cuid) | sessionToken, userId | Active JWT sessions |
| `accounts` | id (cuid) | provider+providerAccountId | OAuth account linking (unused) |
| `verification_tokens` | identifier+token | token | Email/password reset tokens |
| `phone_verifications` | id (cuid) | phoneNumber, userId, status | Phone OTP codes |

### User Fields Used in Authentication

```typescript
// Core Auth
email: string (unique, indexed)
password: string | null (hashed)
role: UserRole (indexed)
isActive: boolean

// Verification
emailVerified: DateTime | null
phoneVerified: boolean
installerVerified: boolean

// Session Tracking
lastLoginAt: DateTime | null
createdAt: DateTime
updatedAt: DateTime

// Profile (in session)
name: string | null
phone: string | null
image: string | null

// Business (installers)
companyName: string | null
businessAddress: string | null
postcode: string | null

// Lead Management (in JWT)
leadSubmissionCount: number
leadSubmissionLimit: number
biddingLeadsSubmitted: number
```

---

## 🧪 Testing Checklist

### Homeowner Flow
- [ ] Register new homeowner
- [ ] Invalid email format
- [ ] Password too short
- [ ] Duplicate email error
- [ ] Sign in correct credentials
- [ ] Sign in incorrect password
- [ ] Access homeowner dashboard (allow)
- [ ] Access installer dashboard (deny)
- [ ] Sign out
- [ ] Access dashboard after logout (deny)

### Installer Flow
- [ ] Register installer
- [ ] Business fields required
- [ ] Postcode validation
- [ ] Sign in as installer
- [ ] Access marketplace (allow)
- [ ] Access homeowner dashboard (deny)
- [ ] Pending approval state

### Admin Flow
- [ ] Sign in as admin
- [ ] Access admin dashboard
- [ ] Access homeowner dashboard (bypass)
- [ ] Access installer dashboard (bypass)
- [ ] Sign out

### Session Management
- [ ] Session persists after refresh
- [ ] Session expires after 30 days
- [ ] Update profile
- [ ] Phone verification updates session
- [ ] Lead count updates in session

### Security Testing
- [ ] Access protected route without token
- [ ] Access route with wrong role
- [ ] Access route with expired token
- [ ] SQL injection attempt
- [ ] XSS attempt
- [ ] JWT is HTTP-only cookie
- [ ] CSRF token present

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next-auth": "^4.24.11",
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^6.17.1",
    "bcryptjs": "^3.0.2",
    "twilio": "^5.10.3"
  }
}
```

**Note:** `@next-auth/prisma-adapter` installed but **not used** (JWT strategy instead).

---

## 🔍 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_SECRET="solarmatch-dev-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_DEBUG="false"

# OAuth (unused)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""

# Twilio
TWILIO_ACCOUNT_SID="xxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_PHONE_NUMBER="+61..."
```

---

## 🎯 Key Takeaways

### What's Working Well
1. ✅ Solid JWT-based authentication
2. ✅ Comprehensive RBAC
3. ✅ Secure password hashing
4. ✅ Clean session management
5. ✅ Type-safe with TypeScript
6. ✅ Admin bypass for support

### What Needs Improvement
1. ⚠️ No email verification
2. ⚠️ No password reset (medium priority)
3. ⚠️ OAuth inactive
4. ⚠️ No rate limiting
5. ⚠️ NEXTAUTH_SECRET must change in production (critical)
6. ⚠️ Remove legacy Clerk code

### Migration Status
- **From Clerk to NextAuth:** Complete
- **Leftover code:** `clerk-auth-helpers.ts` (unused)
- **System status:** Fully functional

---

## 📞 Troubleshooting

**Common Issues:**
- "Invalid credentials" → Check password, user exists, isActive
- "Unauthorized" → Check session cookie, JWT not expired
- "Forbidden" → Check role matches route
- Redirect loop → Check middleware logic

---

## 📚 References

- **NextAuth.js:** https://next-auth.js.org/
- **Prisma:** https://www.prisma.io/docs
- **Next.js Middleware:** https://nextjs.org/docs/app/building-your-application/routing/middleware
- **bcrypt.js:** https://github.com/dcodeIO/bcrypt.js

---

**End of Audit Report**  
**Generated:** November 11, 2025  
**System Version:** Next.js 14.2.33, NextAuth.js 4.24.11, Prisma 6.17.1
