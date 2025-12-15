
**Date:** December 8, 2025  
**Project:** SolarMatch SaaS Platform  
**Current Auth System:** NextAuth.js v4.24.11  
**Proposed Migration:** Clerk with Custom UI

---

## Executive Summary

This document provides a comprehensive audit of the current NextAuth.js authentication system and a detailed migration plan for transitioning to Clerk while maintaining custom UI forms. The migration is **FEASIBLE and RECOMMENDED** with proper planning and execution.

### Key Findings

✅ **Custom UI with Clerk is Fully Supported**  
✅ **3 User Types Well-Defined**: HOMEOWNER, INSTALLER, ADMIN  
✅ **Complex Business Logic Can Be Preserved**  
⚠️ **Migration Requires Careful Planning** (2-3 weeks estimated)  
⚠️ **Zero Downtime Strategy Needed**

---

## Part 1: Current Authentication System Audit

### 1.1 Authentication Architecture Overview

**Current Stack:**
- **Framework:** Next.js 14 (App Router)
- **Auth Provider:** NextAuth.js v4.24.11
- **Database:** PostgreSQL via Prisma
- **Session Strategy:** JWT-based (stateless)
- **Password Hashing:** bcrypt.js
- **Email Service:** SendGrid (for verification emails)

**Key Files:**
```
src/
├── app/api/auth/
│   ├── [...nextauth]/route.ts          # NextAuth handler
│   ├── register/homeowner/route.ts     # Homeowner signup
│   ├── register/installer/route.ts     # Installer signup (minimal)
│   └── oauth-register/route.ts         # OAuth registration
├── lib/
│   ├── auth.ts                         # NextAuth configuration
│   └── clerk-auth-helpers.ts           # Deprecated Clerk shims
├── middleware.ts                       # Route protection
├── components/
│   ├── NextAuthProvider.tsx            # Session provider wrapper
│   ├── HomeownerSignInModal.tsx        # Custom sign-in UI
│   ├── HomeownerSignupModal.tsx        # Custom signup UI
│   ├── InstallerSignInModal.tsx        # Custom sign-in UI
│   ├── InstallerSignupModal.tsx        # Custom signup UI
│   └── AdminSignIn.tsx                 # Admin login page
└── types/next-auth.d.ts                # NextAuth type extensions
```

---

### 1.2 User Types & Role-Based Access Control (RBAC)

#### Three Distinct User Roles

| Role | Enum Value | Description | Registration Flow |
|------|-----------|-------------|-------------------|
| **HOMEOWNER** | `HOMEOWNER` | Solar panel seekers | Extended signup (email, password) |
| **INSTALLER** | `INSTALLER` | Solar installation companies | Minimal signup + onboarding |
| **ADMIN** | `ADMIN` | Platform administrators | Manual seed/creation only |

#### Role-Specific Features

**HOMEOWNER Capabilities:**
- Submit lead requests (solar installation quotes)
- Track lead submission count (quota system)
- View and manage their leads
- Communicate with installers via chat
- Review and accept/reject bids

**INSTALLER Capabilities:**
- Purchase leads from marketplace
- Submit bids on leads
- Access lead feed (filtered by location/preferences)
- Onboarding flow (business profile completion)
- Installer verification process

**ADMIN Capabilities:**
- **Universal Access**: Admins can access ALL routes (homeowner, installer, admin)
- Lead moderation and assignment
- User management (homeowners, installers)
- System settings and analytics
- Newsletter management

---

### 1.3 Database Schema Analysis

#### Core User Model (`User`)

```prisma
model User {
  id                    String                   @id @default(cuid())
  email                 String                   @unique
  emailVerified         DateTime?
  emailVerifiedAt       DateTime?                // Auth Part A+B
  password              String?
  role                  UserRole                 @default(HOMEOWNER)
  isActive              Boolean                  @default(true)
  name                  String?
  phone                 String?
  image                 String?
  companyName           String?
  businessAddress       String?
  postcode              String?
  createdAt             DateTime                 @default(now())
  updatedAt             DateTime                 @updatedAt
  lastLoginAt           DateTime?
  
  // Installer-specific fields
  installerVerified     Boolean                  @default(false)
  profileComplete       Boolean                  @default(false)
  
  // Homeowner-specific fields
  leadSubmissionCount   Int                      @default(0)
  leadSubmissionLimit   Int                      @default(5)
  phoneVerified         Boolean                  @default(false)
  
  // Security fields
  sessionVersion        Int                      @default(0)  // For forced logout
  signupIp              String?
  signupUserAgent       String?
  lastLoginIp           String?
  
  // Relations
  accounts              Account[]
  sessions              Session[]
  installerProfile      InstallerProfile?
  verificationTokens    EmailVerificationToken[]
  passwordResetTokens   PasswordResetToken[]
  // ... (leads, bids, quotes, messages, etc.)
}

enum UserRole {
  HOMEOWNER
  INSTALLER
  ADMIN
}
```

#### NextAuth-Specific Models

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String              # "credentials", "google", "apple"
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

#### Auth Enhancement Models (Auth Part A+B)

```prisma
model InstallerProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  companyName       String
  businessAddress   String
  postcode          String
  operationalStatus String   @default("ACTIVE")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model EmailVerificationToken {
  id          String   @id @default(cuid())
  userId      String
  hashedToken String
  expires     DateTime
  used        Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model PasswordResetToken {
  id          String   @id @default(cuid())
  userId      String
  hashedToken String
  expires     DateTime
  used        Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

### 1.4 Authentication Flows

#### 1.4.1 Homeowner Registration Flow

**Entry Points:**
- Homepage hero section "Get Started" button
- Quote submission (if not logged in)
- Header "Sign Up" link

**Registration Process:**

```typescript
// POST /api/auth/register/homeowner
{
  email: string,        // Required, validated format
  password: string,     // Required, min 8 chars, letter + number
}
```

**Validation Rules:**
- Email: RFC 5322 format, unique in database
- Password: Minimum 8 characters, at least 1 letter and 1 number
- Additional fields (name, phone) collected during first lead submission

**Post-Registration:**
1. Password hashed with bcrypt (salt rounds: 10)
2. User created with `role: "HOMEOWNER"`
3. Email verification token generated (optional, not enforced)
4. Auto sign-in via NextAuth `signIn()` callback
5. Redirect to homeowner dashboard

#### 1.4.2 Installer Registration Flow

**Entry Points:**
- Installer landing page "Join as Installer" CTA
- Header "For Installers" → "Sign Up"

**Registration Process (Minimal Signup - Auth Part A):**

```typescript
// POST /api/auth/register/installer
{
  email: string,        // Required
  password: string,     // Required
}
```

**Onboarding Flow (Protected Post-Login):**
1. User redirected to `/installer/onboarding` immediately after signup
2. Collect business details:
   - Company name
   - Contact name
   - Phone number
   - Business address
   - Postcode
3. Create `InstallerProfile` record
4. Set `user.profileComplete = true`
5. Redirect to installer dashboard

**Why Minimal Signup?**
- Reduces friction at registration
- Business details collected after authentication
- Aligns with "progressive profiling" best practice

#### 1.4.3 Admin Login Flow

**Entry Point:**
- `/admin` route (dedicated admin login page)

**Login Process:**
- Email/password only (no social login for admins)
- Manual account creation via Prisma seed script
- No self-registration allowed

**Admin Privileges:**
- Can access `/admin/*`, `/homeowner/*`, `/installer/*` routes
- Middleware grants universal access for `role: "ADMIN"`

---

### 1.5 Session Management & JWT Configuration

#### JWT Structure

**Token Payload:**
```typescript
{
  // NextAuth standard fields
  sub: string,           // User ID
  iat: number,           // Issued at
  exp: number,           // Expiration
  jti: string,           // JWT ID
  
  // Custom fields
  id: string,            // User ID
  role: string,          // HOMEOWNER | INSTALLER | ADMIN
  email: string,
  name: string | null,
  image: string | null,
  phone: string | null,
  phoneVerified: boolean,
  leadSubmissionCount: number,
  installerVerified: boolean,
  quoteLimit: number,
  sessionVersion: number,     // For forced logout
  profileComplete: boolean,   // Installer onboarding gate
}
```

**Session Configuration:**
```typescript
session: { 
  strategy: "jwt",              // Stateless (no DB session storage)
  maxAge: 30 * 24 * 60 * 60,   // 30 days
}
```

**Session Invalidation Strategy:**
- `sessionVersion` field on `User` model
- Incremented on password reset
- JWT checked against DB version on each request
- Mismatch forces logout

---

### 1.6 Middleware & Route Protection

#### Middleware Configuration (`src/middleware.ts`)

**Protected Routes:**
```typescript
export const config = {
  matcher: [
    '/homeowner/:path*',
    '/installer/:path*',
    '/admin/:path*',
  ],
};
```

**Authorization Logic:**

1. **Admin Bypass:**
   ```typescript
   if (token.role === 'ADMIN') {
     return NextResponse.next(); // Grant access to ALL routes
   }
   ```

2. **Role-Based Checks:**
   ```typescript
   // Homeowner routes
   if (path.startsWith('/homeowner') && token.role !== 'HOMEOWNER') {
     redirect('/'); // Unauthorized
   }
   
   // Installer routes
   if (path.startsWith('/installer') && token.role !== 'INSTALLER') {
     redirect('/'); // Unauthorized
   }
   
   // Admin routes
   if (path.startsWith('/admin') && token.role !== 'ADMIN') {
     redirect('/'); // Unauthorized
   }
   ```

3. **Exception:** `/admin` login page (no auth required)

---

### 1.7 Frontend Authentication UI

#### Custom Form Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `HomeownerSignInModal` | Homeowner login | Email/password, social login buttons (Google, Apple), password toggle |
| `HomeownerSignupModal` | Homeowner registration | Email/password, password confirmation, terms checkbox |
| `InstallerSignInModal` | Installer login | Same as homeowner modal |
| `InstallerSignupModal` | Installer registration | Minimal form (email/password only) |
| `AdminSignIn` | Admin login page | Dedicated page at `/admin` route |

#### Session Provider Setup

```tsx
// src/app/layout.tsx
<NextAuthProvider>
  <ThemeProvider>
    <LayoutContent>{children}</LayoutContent>
  </ThemeProvider>
</NextAuthProvider>

// src/components/NextAuthProvider.tsx
export default function NextAuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

#### Client-Side Session Usage

```typescript
import { useSession, signIn, signOut } from 'next-auth/react';

const { data: session, status, update: updateSession } = useSession();

// Status: "loading" | "authenticated" | "unauthenticated"
// session.user contains: { id, role, email, name, ... }
```

#### Server-Side Session Usage

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Access session.user.role, session.user.id, etc.
}
```

---

### 1.8 Authentication Features Summary

#### ✅ Implemented Features

- [x] Email/password authentication (credentials provider)
- [x] JWT-based sessions (stateless)
- [x] Role-based access control (3 roles: HOMEOWNER, INSTALLER, ADMIN)
- [x] Protected routes via middleware
- [x] Custom sign-in/signup UI for all user types
- [x] Password hashing with bcrypt
- [x] Session versioning (forced logout capability)
- [x] Admin universal access (bypass role restrictions)
- [x] Installer onboarding flow (progressive profiling)
- [x] Lead submission quota system (per homeowner)
- [x] Phone verification system (separate from email)
- [x] IP address and user agent tracking (signup/login)
- [x] Last login timestamp tracking

#### ⚠️ Partially Implemented

- [~] Email verification (tokens generated but not enforced)
- [~] Password reset (token models exist but no UI/flow)
- [~] OAuth providers (Google/Apple buttons in UI but not configured)

#### ❌ Not Implemented

- [ ] Two-factor authentication (2FA)
- [ ] Magic link login
- [ ] Remember me / "Stay signed in" option
- [ ] Account deletion flow
- [ ] Admin user self-registration

---

## Part 2: Clerk Migration Feasibility Analysis

### 2.1 Can You Use Clerk with Custom UI?

**Answer: YES, absolutely!** ✅

Clerk provides **two approaches** for UI integration:

#### Option A: Clerk's Prebuilt Components (Not Recommended for Your Case)
```tsx
import { SignIn, SignUp } from '@clerk/nextjs';

// Clerk's hosted UI components
<SignIn routing="path" path="/sign-in" />
```

#### Option B: Clerk's Headless API (RECOMMENDED) ✅
```tsx
import { useSignIn, useSignUp } from '@clerk/nextjs';

function CustomSignInForm() {
  const { signIn, isLoaded } = useSignIn();
  
  const handleSubmit = async (email, password) => {
    await signIn.create({
      identifier: email,
      password: password,
    });
  };
  
  // Your custom UI code here
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Key Advantage:** You can keep your **EXACT CURRENT UI DESIGNS** and only replace the authentication logic underneath!

---

### 2.2 Clerk vs. NextAuth.js Feature Comparison

| Feature | NextAuth.js | Clerk | Migration Impact |
|---------|-------------|-------|------------------|
| **Custom UI Support** | ✅ Full | ✅ Full | ✅ No change needed |
| **JWT Sessions** | ✅ Yes | ✅ Yes | ✅ Compatible |
| **Role-Based Access** | ✅ Manual setup | ✅ Built-in | ✅ Simplified |
| **Email/Password** | ✅ Yes | ✅ Yes | ✅ Direct replacement |
| **Social Login (OAuth)** | ✅ Yes (manual config) | ✅ Yes (easier setup) | ✅ Improvement |
| **Email Verification** | ⚠️ Manual | ✅ Built-in | ✅ Automatic |
| **Password Reset** | ⚠️ Manual | ✅ Built-in | ✅ Automatic |
| **2FA Support** | ❌ No | ✅ Yes | ✅ New capability |
| **Magic Links** | ❌ No | ✅ Yes | ✅ New capability |
| **User Management UI** | ❌ No | ✅ Dashboard | ✅ Admin convenience |
| **Multi-Session Support** | ⚠️ Limited | ✅ Yes | ✅ Better UX |
| **Webhooks** | ❌ No | ✅ Yes | ✅ Better integrations |
| **Pricing** | ✅ Free (self-hosted) | ⚠️ Free tier + paid | ⚠️ Cost increase |
| **Database Schema** | ⚠️ Manual | ⚠️ Clerk's schema | ⚠️ Data migration needed |

---

### 2.3 Clerk Architecture Overview

#### How Clerk Works

```
┌─────────────────────────────────────────────────────────────┐
│                     Clerk Cloud Service                       │
│  - User authentication database                               │
│  - Session management                                          │
│  - Email/SMS sending                                           │
│  - OAuth provider connections                                  │
│  - Admin dashboard                                             │
└─────────────────────────────────────────────────────────────┘
                              ▲ ▼ API Calls
┌─────────────────────────────────────────────────────────────┐
│                    Your Next.js App                           │
│  - Custom UI (your existing forms)                            │
│  - Clerk React hooks (useSignIn, useSignUp, etc.)            │
│  - Middleware (Clerk-provided)                                │
│  - Server actions (getAuth(), currentUser())                  │
└─────────────────────────────────────────────────────────────┘
                              ▲ ▼ Data sync
┌─────────────────────────────────────────────────────────────┐
│                    Your PostgreSQL Database                   │
│  - User metadata (role, preferences, etc.)                    │
│  - Business data (leads, bids, messages, etc.)               │
│  - Clerk userId stored as reference                           │
└─────────────────────────────────────────────────────────────┘
```

**Key Difference from NextAuth:**
- **NextAuth:** Everything in your database (self-contained)
- **Clerk:** Authentication in Clerk's cloud, business data in your DB

---

### 2.4 Clerk Pricing Analysis

#### Free Tier (Suitable for Development/Small Scale)
- ✅ Up to 10,000 Monthly Active Users (MAUs)
- ✅ Email/password authentication
- ✅ Social login (Google, Apple, etc.)
- ✅ Email verification
- ✅ Password reset
- ✅ JWT sessions
- ✅ Webhooks
- ✅ Prebuilt components + headless API
- ❌ Limited to 5 organizations
- ❌ No custom branding (Clerk logo appears)

#### Pro Tier ($25/month)
- ✅ Unlimited MAUs (pay-as-you-go after 10k)
- ✅ Custom branding (remove Clerk logo)
- ✅ Advanced security features
- ✅ Multi-factor authentication
- ✅ Priority support

#### Recommendation
Start with **Free Tier** for:
- Development and testing
- Initial MVP launch
- Proof of concept

Upgrade to **Pro Tier** when:
- Exceeding 10,000 MAUs
- Need custom branding (white-label)
- Require advanced security features

**Cost Comparison:**
- NextAuth: $0/month (self-hosted, but more dev time)
- Clerk Free: $0/month (up to 10k MAUs)
- Clerk Pro: $25/month + overages (faster development, less maintenance)

---

## Part 3: Migration Plan - Clerk with Custom UI

### 3.1 Migration Strategy Overview

**Approach:** **Phased Migration with Dual-Auth Transition Period**

**Timeline:** 2-3 weeks (depending on team size)

**Risk Level:** ⚠️ **Medium** (requires careful data migration and testing)

**Zero-Downtime Strategy:** ✅ YES (via feature flag system)

---

### 3.2 Phase 1: Preparation & Setup (3-5 days)

#### Step 1.1: Clerk Account Setup
```bash
# Create Clerk account at https://clerk.com
# Create new application (choose "Next.js")
# Note down API keys:
#   - Publishable Key (starts with pk_)
#   - Secret Key (starts with sk_)
```

#### Step 1.2: Install Clerk SDK
```bash
npm install @clerk/nextjs
```

#### Step 1.3: Environment Variables
```env
# .env.local
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Keep existing NextAuth for transition
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
DATABASE_URL=...
```

#### Step 1.4: Clerk Configuration
```typescript
// middleware.ts (Clerk-provided)
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes (no auth required)
  publicRoutes: ["/", "/api/public(.*)"],
  
  // Routes that trigger sign-in
  ignoredRoutes: ["/api/webhook/clerk"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

#### Step 1.5: Clerk Provider Wrapper
```tsx
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* Keep NextAuthProvider for transition period */}
          <NextAuthProvider>
            {children}
          </NextAuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

### 3.3 Phase 2: Database Schema Updates (2-3 days)

#### Step 2.1: Add Clerk User ID Field
```prisma
// prisma/schema.prisma
model User {
  id                    String   @id @default(cuid())
  clerkId               String?  @unique // NEW: Clerk user ID
  email                 String   @unique
  
  // Mark password as optional (Clerk handles it)
  password              String?  // Will be NULL for Clerk users
  
  // Keep existing fields
  role                  UserRole @default(HOMEOWNER)
  // ... rest of fields
}
```

#### Step 2.2: Create Migration
```bash
npx prisma migrate dev --name add_clerk_id
```

#### Step 2.3: Update User Model in Code
```typescript
// src/lib/prisma/user.ts
export async function findUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
  });
}

export async function findOrCreateClerkUser(clerkData: {
  clerkId: string;
  email: string;
  name: string | null;
  role: UserRole;
}) {
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkData.clerkId },
  });
  
  if (!user) {
    // Create new user with Clerk ID
    user = await prisma.user.create({
      data: {
        clerkId: clerkData.clerkId,
        email: clerkData.email,
        name: clerkData.name,
        role: clerkData.role,
        isActive: true,
        password: null, // Clerk handles authentication
      },
    });
  }
  
  return user;
}
```

---

### 3.4 Phase 3: Custom UI Migration (5-7 days)

#### Step 3.1: Homeowner Sign-In Form

**Before (NextAuth):**
```tsx
import { signIn } from 'next-auth/react';

const handleSubmit = async (e) => {
  const result = await signIn('credentials', {
    email: formData.email,
    password: formData.password,
    redirect: false,
  });
  
  if (result?.ok) {
    router.push('/homeowner/dashboard');
  }
};
```

**After (Clerk with Custom UI):**
```tsx
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const HomeownerSignInModal = () => {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    try {
      // Step 1: Create sign-in attempt
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });
      
      // Step 2: If successful, set as active session
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Step 3: Sync with your database
        await syncClerkUserWithDatabase(result.createdUserId);
        
        // Step 4: Redirect
        router.push('/homeowner/dashboard');
      }
    } catch (err) {
      setError(err.errors[0].message);
    }
  };
  
  // Keep your EXACT SAME UI JSX
  return (
    <form onSubmit={handleSubmit}>
      {/* Your existing form fields */}
    </form>
  );
};
```

#### Step 3.2: Homeowner Sign-Up Form

**After (Clerk with Custom UI):**
```tsx
import { useSignUp } from '@clerk/nextjs';

const HomeownerSignupModal = () => {
  const { signUp, isLoaded, setActive } = useSignUp();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    try {
      // Step 1: Create user account
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        // Custom metadata for role
        unsafeMetadata: {
          role: 'HOMEOWNER',
        },
      });
      
      // Step 2: Send email verification
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      
      // Step 3: Show verification code input
      setShowVerificationCode(true);
      
    } catch (err) {
      setError(err.errors[0].message);
    }
  };
  
  const handleVerifyEmail = async (code: string) => {
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });
      
      if (result.status === 'complete') {
        // Create user in your database
        await createUserInDatabase({
          clerkId: result.createdUserId,
          email: formData.email,
          role: 'HOMEOWNER',
        });
        
        await setActive({ session: result.createdSessionId });
        router.push('/homeowner/dashboard');
      }
    } catch (err) {
      setError('Invalid verification code');
    }
  };
  
  return (
    <>
      {!showVerificationCode ? (
        <form onSubmit={handleSubmit}>
          {/* Your existing signup form */}
        </form>
      ) : (
        <VerificationCodeInput onVerify={handleVerifyEmail} />
      )}
    </>
  );
};
```

#### Step 3.3: Database Sync Function

```typescript
// src/lib/clerk/sync.ts
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs';

export async function syncClerkUserWithDatabase(clerkId?: string) {
  // Get Clerk user data
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    throw new Error('No Clerk user found');
  }
  
  // Check if user exists in your database
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  
  if (!user) {
    // Create new user
    const role = clerkUser.unsafeMetadata.role as UserRole || 'HOMEOWNER';
    
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
          : null,
        role: role,
        emailVerified: clerkUser.emailAddresses[0].verification.status === 'verified'
          ? new Date()
          : null,
        isActive: true,
        password: null, // Clerk handles auth
      },
    });
  }
  
  return user;
}
```

#### Step 3.4: Installer Sign-Up (Minimal + Onboarding)

```tsx
// Registration page (minimal signup)
const InstallerSignupModal = () => {
  const { signUp, isLoaded, setActive } = useSignUp();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Step 1: Create account with Clerk
    const result = await signUp.create({
      emailAddress: formData.email,
      password: formData.password,
      unsafeMetadata: {
        role: 'INSTALLER',
        profileComplete: false, // Flag for onboarding
      },
    });
    
    // Step 2: Verify email
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    setShowVerificationCode(true);
  };
  
  const handleVerifyAndRedirect = async (code: string) => {
    const result = await signUp.attemptEmailAddressVerification({ code });
    
    if (result.status === 'complete') {
      // Create minimal user record
      await createUserInDatabase({
        clerkId: result.createdUserId,
        email: formData.email,
        role: 'INSTALLER',
        profileComplete: false,
      });
      
      await setActive({ session: result.createdSessionId });
      
      // Redirect to onboarding
      router.push('/installer/onboarding');
    }
  };
};

// Onboarding page (protected route)
const InstallerOnboarding = () => {
  const { user: clerkUser } = useUser(); // Clerk hook
  
  const handleCompleteOnboarding = async (profileData) => {
    // Update database with business details
    await prisma.installerProfile.create({
      data: {
        userId: userInDatabase.id,
        companyName: profileData.companyName,
        businessAddress: profileData.businessAddress,
        postcode: profileData.postcode,
      },
    });
    
    // Update user record
    await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: { 
        profileComplete: true,
        name: profileData.contactName,
        phone: profileData.phone,
      },
    });
    
    // Update Clerk metadata
    await clerkUser.update({
      unsafeMetadata: {
        ...clerkUser.unsafeMetadata,
        profileComplete: true,
      },
    });
    
    router.push('/installer/leads');
  };
};
```

#### Step 3.5: Admin Login

```tsx
// src/app/admin/page.tsx
import { useSignIn } from '@clerk/nextjs';

const AdminSignIn = () => {
  const { signIn, isLoaded, setActive } = useSignIn();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await signIn.create({
      identifier: formData.email,
      password: formData.password,
    });
    
    if (result.status === 'complete') {
      await setActive({ session: result.createdSessionId });
      
      // Verify admin role from database
      const user = await fetch('/api/auth/verify-admin').then(r => r.json());
      
      if (user.role !== 'ADMIN') {
        await signIn.remove(); // Sign out non-admin
        setError('Admin access only');
        return;
      }
      
      router.push('/admin/dashboard');
    }
  };
};
```

---

### 3.5 Phase 4: Server-Side Authentication (3-4 days)

#### Step 4.1: Replace `getServerSession` with Clerk's `auth()`

**Before (NextAuth):**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = session.user.id;
  const userRole = session.user.role;
  
  // ... business logic
}
```

**After (Clerk):**
```typescript
import { auth, currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Step 1: Get Clerk user ID
  const { userId: clerkId } = auth();
  
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Step 2: Fetch user from your database
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  
  const userId = user.id;
  const userRole = user.role;
  
  // ... business logic (same as before)
}
```

#### Step 4.2: Create Helper Functions

```typescript
// src/lib/clerk/server.ts
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@prisma/client';

export async function getCurrentUser(): Promise<User | null> {
  const { userId: clerkId } = auth();
  
  if (!clerkId) {
    return null;
  }
  
  return prisma.user.findUnique({
    where: { clerkId },
  });
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireAuth();
  
  if (user.role !== role && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  
  return user;
}

// Usage in API routes
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole('INSTALLER');
    
    // User is authenticated and has INSTALLER role
    // ... business logic
    
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.message === 'Unauthorized' ? 401 : 403 }
    );
  }
}
```

#### Step 4.3: Update All API Routes

**Files to Update:**
```
src/app/api/
├── leads/
│   ├── route.ts                   ✅ Replace getServerSession
│   └── [id]/
│       ├── route.ts               ✅ Replace getServerSession
│       ├── purchase/route.ts      ✅ Replace getServerSession
│       ├── cancel/route.ts        ✅ Replace getServerSession
│       └── bids/route.ts          ✅ Replace getServerSession
├── admin/
│   └── [...all admin routes]      ✅ Replace + add role check
└── installer/
    └── [...all installer routes]  ✅ Replace + add role check
```

**Example Migration:**
```typescript
// BEFORE
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });
  
  // ... rest of code
}

// AFTER
import { requireRole } from '@/lib/clerk/server';

export async function POST(request: NextRequest) {
  const user = await requireRole('HOMEOWNER');
  
  // ... rest of code (same business logic)
}
```

---

### 3.6 Phase 5: Middleware Migration (1 day)

#### Step 5.1: Replace NextAuth Middleware

**Before:**
```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Role-based checks
    if (path.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // ... more checks
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/homeowner/:path*', '/installer/:path*', '/admin/:path*'],
};
```

**After:**
```typescript
// src/middleware.ts
import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // Public routes (no auth required)
  publicRoutes: [
    '/',
    '/api/public(.*)',
    '/instant-quote(.*)',
    '/blog(.*)',
  ],
  
  // After authentication callback
  async afterAuth(auth, req) {
    const path = req.nextUrl.pathname;
    
    // If not authenticated and trying to access protected route
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // If authenticated, check role-based access
    if (auth.userId) {
      // Fetch user role from database
      const user = await prisma.user.findUnique({
        where: { clerkId: auth.userId },
        select: { role: true },
      });
      
      // Admin bypass (can access all routes)
      if (user?.role === 'ADMIN') {
        return NextResponse.next();
      }
      
      // Role-based checks
      if (path.startsWith('/homeowner') && user?.role !== 'HOMEOWNER') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      if (path.startsWith('/installer') && user?.role !== 'INSTALLER') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      if (path.startsWith('/admin') && user?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

### 3.7 Phase 6: Data Migration (2-3 days)

#### Step 6.1: Migration Script for Existing Users

**CRITICAL:** Existing users with passwords cannot be directly migrated to Clerk. Two options:

##### Option A: Password Reset Flow (Recommended)
```typescript
// scripts/migrate-users-to-clerk.ts
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

async function migrateUsers() {
  const users = await prisma.user.findMany({
    where: {
      clerkId: null, // Users not yet migrated
    },
  });
  
  for (const user of users) {
    try {
      // Step 1: Create user in Clerk WITHOUT password
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [user.email],
        skipPasswordRequirement: true, // Important!
        unsafeMetadata: {
          role: user.role,
          profileComplete: user.profileComplete,
        },
      });
      
      // Step 2: Update your database with Clerk ID
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          clerkId: clerkUser.id,
          password: null, // Remove old password hash
        },
      });
      
      // Step 3: Send password reset email via Clerk
      await clerkClient.users.updateUser(clerkUser.id, {
        // Trigger password setup email
        passwordDigest: null,
      });
      
      console.log(`Migrated user: ${user.email}`);
      
    } catch (err) {
      console.error(`Failed to migrate ${user.email}:`, err);
    }
  }
}

migrateUsers();
```

##### Option B: Gradual Migration (Zero Downtime)
```typescript
// Dual authentication system (both NextAuth and Clerk active)

// Step 1: Add feature flag
const USE_CLERK_AUTH = process.env.FEATURE_CLERK_AUTH === 'true';

// Step 2: Check both auth systems
export async function GET(request: NextRequest) {
  let user: User | null = null;
  
  if (USE_CLERK_AUTH) {
    // Try Clerk first
    const { userId: clerkId } = auth();
    if (clerkId) {
      user = await prisma.user.findUnique({ where: { clerkId } });
    }
  }
  
  if (!user) {
    // Fallback to NextAuth
    const session = await getServerSession(authOptions);
    if (session) {
      user = await prisma.user.findUnique({ where: { id: session.user.id } });
    }
  }
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // ... rest of logic
}
```

#### Step 6.2: User Notification Strategy

**Email Template:**
```
Subject: Action Required: Update Your SolarMatch Account

Hi [Name],

We've upgraded our authentication system to provide you with better security and features!

🔒 What's Changed:
- Enhanced security with 2-factor authentication (optional)
- Faster sign-in process
- Better password recovery

📝 Action Required:
Please reset your password to activate your account:
[Reset Password Button]

This is a one-time step and will only take a minute.

Questions? Contact support@solarmatch.com

Thanks,
The SolarMatch Team
```

---

### 3.8 Phase 7: Testing & Validation (3-4 days)

#### Test Cases Checklist

**Authentication Flows:**
- [ ] Homeowner sign-up (email/password)
- [ ] Homeowner sign-in
- [ ] Installer sign-up + onboarding
- [ ] Installer sign-in
- [ ] Admin sign-in
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Sign out

**Role-Based Access:**
- [ ] Homeowner can access `/homeowner/*` only
- [ ] Installer can access `/installer/*` only
- [ ] Admin can access ALL routes
- [ ] Unauthorized users redirected correctly

**Session Management:**
- [ ] Sessions persist across page reloads
- [ ] Sessions expire after 30 days
- [ ] Multi-tab session sync (Clerk feature)
- [ ] Sign-out clears session

**Database Sync:**
- [ ] User created in DB on signup
- [ ] Clerk ID stored correctly
- [ ] Role saved in DB and synced with Clerk metadata
- [ ] Profile completion status tracked

**Business Logic:**
- [ ] Lead submission works (with role check)
- [ ] Bid submission works (installer only)
- [ ] Admin actions work (role verified)
- [ ] User dashboard data loads correctly

---

### 3.9 Phase 8: Deployment & Rollback Plan (1-2 days)

#### Deployment Strategy

**Step 1: Deploy to Staging**
```bash
# Set Clerk environment variables in staging
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Deploy
git push staging main
```

**Step 2: Run Data Migration**
```bash
# On staging database
npm run migrate:users-to-clerk
```

**Step 3: Test All Flows**
- Manual testing by QA team
- Automated E2E tests (Playwright)

**Step 4: Production Deployment**
```bash
# Set production Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Deploy
git push production main
```

**Step 5: Run Production Migration**
```bash
# Run in off-peak hours
npm run migrate:users-to-clerk --production
```

**Step 6: Monitor**
- Check error logs
- Monitor Clerk dashboard
- Track user sign-in success rate

#### Rollback Plan

**If issues arise:**

```bash
# 1. Revert deployment
git revert HEAD
git push production main

# 2. Re-enable NextAuth
FEATURE_CLERK_AUTH=false

# 3. Restore database (if needed)
psql -U postgres -d solarmatch < backup-before-migration.sql

# 4. Notify users (if any accounts affected)
```

**Rollback-Safe Migration Strategy:**
- Keep NextAuth code in codebase for 2 weeks post-migration
- Use feature flag to toggle between systems
- Don't delete NextAuth-specific DB columns immediately

---

## Part 4: Pros & Cons Analysis

### 4.1 Benefits of Migrating to Clerk

#### ✅ Development Velocity
- **Less Code to Maintain:** Clerk handles email verification, password reset, 2FA
- **Built-in Security:** OWASP best practices, rate limiting, breach detection
- **Faster Feature Additions:** OAuth providers configured in minutes (not hours)

#### ✅ User Experience
- **Email Verification:** Automatic and reliable (no manual email sending)
- **Password Reset:** Built-in UI or headless API
- **Multi-Session Support:** Users can sign in on multiple devices seamlessly
- **Social Login:** Easier setup for Google, Apple, Microsoft, etc.

#### ✅ Security Improvements
- **2FA Support:** SMS and authenticator apps built-in
- **Breach Detection:** Clerk monitors compromised passwords
- **Rate Limiting:** Built-in protection against brute-force attacks
- **Session Management:** Revoke sessions from admin dashboard

#### ✅ Admin Features
- **User Management Dashboard:** View, search, ban, unban users
- **Analytics:** Sign-up rates, active users, session duration
- **Webhooks:** React to user events (user.created, user.deleted, etc.)

#### ✅ Compliance & Auditing
- **SOC 2 Type II Certified:** Clerk's infrastructure is audited
- **GDPR Compliant:** Data export and deletion APIs
- **Audit Logs:** Track all authentication events

---

### 4.2 Challenges & Risks

#### ⚠️ Vendor Lock-In
- **Risk:** Dependent on Clerk's service availability
- **Mitigation:** Clerk has 99.99% uptime SLA (Pro tier)
- **Exit Strategy:** Export user data via Clerk API if needed

#### ⚠️ Cost Implications
- **Free Tier:** 10,000 MAUs (sufficient for MVP)
- **Overage:** $0.02 per MAU after 10k (on Pro plan)
- **Example:** 50,000 users = $25/month + (40,000 × $0.02) = $825/month

#### ⚠️ Data Migration Complexity
- **Challenge:** Existing users must reset passwords
- **Impact:** User friction during migration
- **Mitigation:** Clear communication + incentives (e.g., "Reset password to unlock new features")

#### ⚠️ Learning Curve
- **Challenge:** Team must learn Clerk's API and concepts
- **Impact:** 1-2 weeks initial ramp-up
- **Mitigation:** Comprehensive documentation, sandbox environment

---

### 4.3 Should You Migrate?

**Recommendation:** ✅ **YES, Proceed with Migration**

**Why?**

1. **Your Use Case is Ideal for Clerk:**
   - Multi-role system (Clerk's metadata system handles this well)
   - Custom UI required (Clerk's headless API is perfect)
   - Need scalability (Clerk auto-scales)

2. **Long-Term Benefits Outweigh Costs:**
   - Reduced development time for auth features
   - Better security out-of-the-box
   - Improved user experience (email verification, 2FA, etc.)

3. **Free Tier is Generous:**
   - 10,000 MAUs is sufficient for initial growth
   - Only pay when you reach scale (which is a good problem to have)

4. **Migration is Low-Risk with Proper Planning:**
   - Phased approach allows testing at each step
   - Rollback plan in place
   - Can run dual-auth system during transition

**When to Delay Migration:**
- If you're launching in < 2 weeks (focus on launch first)
- If team is already overloaded (wait for slower period)
- If free tier MAU limit is a concern (validate user growth first)

---

## Part 5: Implementation Checklist

### Pre-Migration
- [ ] Create Clerk account and configure application
- [ ] Install `@clerk/nextjs` package
- [ ] Set up environment variables
- [ ] Add `clerkId` field to User model
- [ ] Run database migration
- [ ] Create backup of production database

### Phase 1: Frontend UI Migration
- [ ] Migrate `HomeownerSignInModal` to use `useSignIn`
- [ ] Migrate `HomeownerSignupModal` to use `useSignUp`
- [ ] Migrate `InstallerSignInModal` to use `useSignIn`
- [ ] Migrate `InstallerSignupModal` to use `useSignUp`
- [ ] Migrate `AdminSignIn` page to use `useSignIn`
- [ ] Add email verification UI
- [ ] Test all forms in development

### Phase 2: Server-Side Migration
- [ ] Replace `getServerSession` with `auth()` in all API routes
- [ ] Create helper functions (`getCurrentUser`, `requireRole`)
- [ ] Update lead API routes
- [ ] Update bid API routes
- [ ] Update admin API routes
- [ ] Test all endpoints with Postman/Thunder Client

### Phase 3: Middleware & Routes
- [ ] Replace NextAuth middleware with `authMiddleware`
- [ ] Add role-based checks in `afterAuth` callback
- [ ] Test protected routes (manual navigation attempts)
- [ ] Verify admin universal access

### Phase 4: Testing
- [ ] Write E2E tests for auth flows (Playwright)
- [ ] Test role-based access control
- [ ] Test session persistence
- [ ] Test password reset flow
- [ ] Test email verification flow
- [ ] Load test authentication endpoints

### Phase 5: Data Migration
- [ ] Write user migration script
- [ ] Test migration on staging database
- [ ] Prepare user notification emails
- [ ] Run migration on production (off-peak hours)
- [ ] Send password reset emails to all users

### Phase 6: Deployment
- [ ] Deploy to staging environment
- [ ] QA testing on staging
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Check Clerk dashboard for issues

### Post-Migration
- [ ] Remove NextAuth dependencies (after 2 weeks)
- [ ] Delete `password` column from User model (after 1 month)
- [ ] Remove old `Session`, `Account`, `VerificationToken` models
- [ ] Update documentation
- [ ] Train team on Clerk dashboard

---

## Part 6: Code Examples Summary

### Quick Reference: Key Clerk Hooks

```typescript
// Client-side hooks
import { useSignIn, useSignUp, useUser, useAuth, useClerk } from '@clerk/nextjs';

// Sign-in
const { signIn, isLoaded, setActive } = useSignIn();

// Sign-up
const { signUp, isLoaded, setActive } = useSignUp();

// Get current user
const { user, isLoaded, isSignedIn } = useUser();

// Get auth state
const { userId, sessionId, getToken } = useAuth();

// Server-side functions
import { auth, currentUser, clerkClient } from '@clerk/nextjs';

// Get user ID
const { userId } = auth();

// Get full user object
const user = await currentUser();

// Admin operations
await clerkClient.users.getUserList();
await clerkClient.users.updateUser(userId, { ... });
```

---

## Part 7: Estimated Timeline & Resources

### Timeline Breakdown

| Phase | Duration | Team Size | Effort (Person-Days) |
|-------|----------|-----------|----------------------|
| Setup & Preparation | 3-5 days | 1 developer | 3-5 days |
| Database Schema | 2-3 days | 1 developer | 2-3 days |
| Frontend UI Migration | 5-7 days | 2 developers | 10-14 days |
| Server-Side Migration | 3-4 days | 2 developers | 6-8 days |
| Middleware | 1 day | 1 developer | 1 day |
| Data Migration | 2-3 days | 1 developer + 1 DevOps | 4-6 days |
| Testing | 3-4 days | 1 QA + 1 developer | 6-8 days |
| Deployment | 1-2 days | 1 DevOps + 1 developer | 2-4 days |
| **Total** | **20-29 days** | **2-3 people** | **34-49 person-days** |

**Recommended Team:**
- 2 Full-Stack Developers (primary implementation)
- 1 QA Engineer (testing and validation)
- 1 DevOps Engineer (deployment and monitoring)

---

## Part 8: Conclusion

### Final Recommendation

✅ **PROCEED with Clerk Migration using Custom UI Approach**

### Key Takeaways

1. **Custom UI is Fully Supported:** Clerk's headless API allows you to keep your exact UI designs
2. **Migration is Feasible:** 2-3 weeks with proper planning
3. **Benefits Outweigh Costs:** Better security, faster development, improved UX
4. **Risk is Manageable:** Phased approach + rollback plan ensure safety
5. **Free Tier is Generous:** 10,000 MAUs at $0/month

### Next Steps

1. **Get Approval:** Present this audit to stakeholders
2. **Create Clerk Account:** Sign up at https://clerk.com
3. **Start Small:** Migrate one user type first (e.g., HOMEOWNER)
4. **Test Thoroughly:** Use staging environment extensively
5. **Communicate:** Keep users informed during migration

### Support & Resources

- **Clerk Documentation:** https://clerk.com/docs
- **Clerk Discord:** https://clerk.com/discord
- **Migration Support:** support@clerk.com
- **This Audit Document:** Reference for implementation details

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Author:** GitHub Copilot (Audit Agent)  
**Review Status:** Ready for Stakeholder Review

---

## Appendix A: Environment Variables Reference

```env
# ============================================================================
# CLERK CONFIGURATION (Production)
# ============================================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ============================================================================
# NEXTAUTH (Keep during transition period)
# ============================================================================
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_DEBUG=false

# ============================================================================
# FEATURE FLAGS
# ============================================================================
FEATURE_CLERK_AUTH=true  # Toggle to enable/disable Clerk

# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# ============================================================================
# EMAIL (If using custom email sending)
# ============================================================================
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
```

---

## Appendix B: Webhook Configuration

### Clerk Webhooks (Optional but Recommended)

```typescript
// src/app/api/webhook/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify webhook
  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id!,
      'svix-timestamp': svix_timestamp!,
      'svix-signature': svix_signature!,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Handle events
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } = evt.data;
    
    // Create user in your database
    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`.trim(),
        role: unsafe_metadata.role as UserRole || 'HOMEOWNER',
        isActive: true,
      },
    });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    // Delete user from your database
    await prisma.user.delete({
      where: { clerkId: id },
    });
  }

  return new Response('', { status: 200 });
}
```

---

**End of Audit Report**
