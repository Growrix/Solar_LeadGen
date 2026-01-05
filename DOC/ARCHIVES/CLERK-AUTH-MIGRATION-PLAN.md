# Clerk Authentication Migration - Implementation Plan

**Feature Branch**: `008-clerk-auth-migration`  
**Parent Branch**: `007-migration-and-build`  
**Date**: November 9, 2025  
**Est. Duration**: 10-12 hours  
**Dependencies**: DOC/CLERK-AUTH-MIGRATION-AUDIT.md

---

## 🎯 MIGRATION OBJECTIVE

**Goal**: Replace NextAuth.js with Clerk for all authentication (Homeowner, Installer, Admin) while preserving all existing functionality and user data.

**Approach**:
- Install Clerk and configure webhooks for user sync
- Update Prisma schema (add clerkId, remove password/NextAuth models)
- Replace all custom auth UI with Clerk components
- Update session management across 17+ files
- Migrate middleware for route protection
- Preserve business logic (roles, phone verification, lead quotas)

**Success Criteria**:
- [ ] All 3 user types (Homeowner, Installer, Admin) can authenticate via Clerk
- [ ] Existing functionality preserved (quotes, leads, dashboards)
- [ ] Local dev environment fully functional with Clerk
- [ ] TypeScript compilation passes (0 errors)
- [ ] Build succeeds (`npm run build`)
- [ ] All protected routes work correctly

---

## 📋 PHASE 1: CLERK SETUP & CONFIGURATION (90 minutes)

### 1.1 Create Clerk Account & Application (15 min)

**Steps**:
1. Visit https://clerk.com and sign up
2. Create new application: "SolarMatch"
3. Select authentication methods:
   - ✅ Email/Password
   - ✅ Google OAuth  
   - ✅ Apple OAuth (optional for now)
4. Copy API keys

**Deliverable**: Clerk application created with API keys

---

### 1.2 Configure OAuth Providers (20 min)

**Google OAuth Setup**:
1. Go to https://console.cloud.google.com
2. Create new project: "SolarMatch"
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://accounts.clerk.dev/oauth_callback`
   - `http://localhost:3001` (for dev)
6. Copy Client ID and Client Secret
7. Add to Clerk Dashboard > Social Connections > Google

**Apple OAuth Setup** (Optional - can skip for initial migration):
1. Go to https://developer.apple.com
2. Create App ID and Service ID
3. Configure Sign in with Apple
4. Add to Clerk Dashboard > Social Connections > Apple

**Deliverable**: OAuth providers configured in Clerk

---

### 1.3 Configure Environment Variables (10 min)

**Add to `.env.local`**:
```env
# Clerk API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Clerk URLs (customize based on your routes)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook Secret (get from Clerk Dashboard after creating webhook)
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Remove from `.env.local`**:
```env
# DELETE THESE (no longer needed):
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your_secret
# NEXTAUTH_DEBUG=false
```

**Validation**:
- [ ] All Clerk variables added
- [ ] NextAuth variables removed
- [ ] `.env.example` updated with Clerk vars

---

### 1.4 Install Clerk Package (5 min)

```powershell
cd "D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch"

# Install Clerk
npm install @clerk/nextjs

# Uninstall NextAuth and bcrypt
npm uninstall next-auth bcryptjs @types/bcryptjs @next-auth/prisma-adapter
```

**Validation**:
- [ ] @clerk/nextjs installed
- [ ] next-auth removed from package.json
- [ ] bcryptjs removed from package.json

---

### 1.5 Wrap App in ClerkProvider (10 min)

**File**: `src/app/layout.tsx`

**Changes**:
```typescript
// ADD THIS IMPORT:
import { ClerkProvider } from '@clerk/nextjs';

// REMOVE THIS IMPORT:
import { NextAuthProvider } from '@/components/NextAuthProvider';

// UPDATE LAYOUT:
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* REPLACE NextAuthProvider with ClerkProvider */}
        <ClerkProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

**Validation**:
- [ ] ClerkProvider wraps entire app
- [ ] NextAuthProvider removed
- [ ] App compiles without errors

---

### 1.6 Configure Clerk Webhooks (30 min)

**Step 1: Create Webhook API Route**

**File**: `src/app/api/webhooks/clerk/route.ts` (NEW FILE)

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  // Handle events
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } = evt.data;
    
    try {
      // Create user in Prisma database
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : null,
          role: (unsafe_metadata?.role as string) || 'HOMEOWNER',
          isActive: true,
        },
      });
      
      console.log(`✅ User synced to database: ${email_addresses[0].email_address}`);
    } catch (error) {
      console.error('Failed to create user in database:', error);
      return NextResponse.json({ error: 'Database sync failed' }, { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0].email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : null,
        },
      });
      
      console.log(`✅ User updated in database: ${email_addresses[0].email_address}`);
    } catch (error) {
      console.error('Failed to update user in database:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      // Soft delete (set isActive = false)
      await prisma.user.update({
        where: { clerkId: id },
        data: { isActive: false },
      });
      
      console.log(`✅ User deactivated in database: ${id}`);
    } catch (error) {
      console.error('Failed to deactivate user in database:', error);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
```

**Step 2: Configure Webhook in Clerk Dashboard**

1. Go to Clerk Dashboard > Webhooks
2. Click "Add Endpoint"
3. Endpoint URL: `https://yourdomain.com/api/webhooks/clerk` (for production)
   - For local dev: Use ngrok or Clerk dev webhook forwarding
4. Select events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
5. Copy webhook secret
6. Add secret to `.env.local` as `CLERK_WEBHOOK_SECRET`

**Step 3: Test Webhook Locally** (using Clerk CLI)

```powershell
# Install Clerk CLI globally
npm install -g @clerk/clerk-cli

# Forward webhooks to local dev server
clerk webhooks forward --port 3001 --endpoint /api/webhooks/clerk
```

**Validation**:
- [ ] Webhook API route created
- [ ] Webhook configured in Clerk Dashboard
- [ ] Webhook secret added to .env.local
- [ ] Local webhook forwarding tested

---

## 📋 PHASE 2: DATABASE MIGRATION (60 minutes)

### 2.1 Update Prisma Schema (15 min)

**File**: `prisma/schema.prisma`

**Changes**:

```prisma
model User {
  id                    String              @id @default(cuid())
  clerkId               String              @unique  // NEW: Clerk user ID
  email                 String              @unique
  emailVerified         DateTime?
  // password           String?             // DELETE THIS LINE
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
  
  // Keep these relationships:
  leadsAsHomeowner      Lead[]              @relation("homeowner_leads")
  leadsAsInstaller      Lead[]              @relation("installer_leads")
  phoneVerifications    PhoneVerification[]
  quotesAsInstaller     Quote[]             @relation("installer_quotes")
  installerAssignments  LeadAssignment[]    @relation("installer_assignments")
  adminAssignments      LeadAssignment[]    @relation("admin_assignments")
  
  // DELETE THESE RELATIONSHIPS:
  // accounts           Account[]
  // sessions           Session[]

  @@index([email])
  @@index([role])
  @@index([clerkId])  // NEW: Index for faster lookups
  @@map("users")
}

// DELETE THESE MODELS ENTIRELY:
// model Account { ... }
// model Session { ... }
// model VerificationToken { ... }
```

**Validation**:
- [ ] `clerkId` field added with @unique
- [ ] `password` field removed
- [ ] Index added on `clerkId`
- [ ] Account, Session, VerificationToken models deleted

---

### 2.2 Create Prisma Migration (10 min)

```powershell
cd "D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch"

# Generate migration
npx prisma migrate dev --name clerk_auth_migration

# This will:
# 1. Add clerkId column to users table
# 2. Remove password column from users table
# 3. Drop accounts, sessions, verification_tokens tables
# 4. Add index on clerkId
```

**Validation**:
- [ ] Migration file created in `prisma/migrations/`
- [ ] Migration applied to local database
- [ ] Prisma Client regenerated

---

### 2.3 Handle Existing Users (35 min)

**Problem**: Existing users in database don't have clerkId values

**Solution**: Create data migration script to handle existing users

**File**: `scripts/migrate-existing-users-to-clerk.ts` (NEW FILE)

```typescript
import { prisma } from '../src/lib/prisma';

async function migrateExistingUsers() {
  console.log('🔄 Starting user migration to Clerk...');

  // Get all users without clerkId
  const users = await prisma.user.findMany({
    where: {
      clerkId: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    console.log(`\n📧 Migrating user: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Action Required:`);
    console.log(`   1. Go to Clerk Dashboard > Users`);
    console.log(`   2. Click "Create User"`);
    console.log(`   3. Email: ${user.email}`);
    console.log(`   4. Set temporary password (user will reset)`);
    console.log(`   5. Copy Clerk User ID`);
    console.log(`   6. Run: npx tsx scripts/update-user-clerk-id.ts ${user.id} <clerkId>`);
  }

  console.log(`\n✅ Migration checklist generated for ${users.length} users`);
  console.log(`\nNOTE: Users can also self-migrate by:`);
  console.log(`1. Going to sign-up page`);
  console.log(`2. Using their existing email`);
  console.log(`3. Creating new password in Clerk`);
  console.log(`4. Webhook will link to existing Prisma record`);
}

migrateExistingUsers()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**File**: `scripts/update-user-clerk-id.ts` (NEW FILE)

```typescript
import { prisma } from '../src/lib/prisma';

async function updateUserClerkId(userId: string, clerkId: string) {
  console.log(`Updating user ${userId} with Clerk ID ${clerkId}...`);

  await prisma.user.update({
    where: { id: userId },
    data: { clerkId: clerkId },
  });

  console.log('✅ User updated successfully');
}

// Run with: npx tsx scripts/update-user-clerk-id.ts <userId> <clerkId>
const [userId, clerkId] = process.argv.slice(2);

if (!userId || !clerkId) {
  console.error('Usage: npx tsx scripts/update-user-clerk-id.ts <userId> <clerkId>');
  process.exit(1);
}

updateUserClerkId(userId, clerkId)
  .catch((e) => {
    console.error('Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Alternative: Bulk Migration Script** (if many users):

**File**: `scripts/bulk-migrate-users-to-clerk.ts`

```typescript
import { Clerk } from '@clerk/backend';
import { prisma } from '../src/lib/prisma';

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY! });

async function bulkMigrateUsers() {
  const users = await prisma.user.findMany({
    where: { clerkId: null },
  });

  for (const user of users) {
    try {
      // Create user in Clerk
      const clerkUser = await clerk.users.createUser({
        emailAddress: [user.email],
        firstName: user.name?.split(' ')[0],
        lastName: user.name?.split(' ').slice(1).join(' '),
        publicMetadata: {
          role: user.role,
        },
        skipPasswordRequirement: true, // User will set password on first login
      });

      // Update Prisma record with Clerk ID
      await prisma.user.update({
        where: { id: user.id },
        data: { clerkId: clerkUser.id },
      });

      console.log(`✅ Migrated: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${user.email}:`, error);
    }
  }
}

bulkMigrateUsers();
```

**Validation**:
- [ ] Migration scripts created
- [ ] Existing users handled (manual or bulk)
- [ ] All users have clerkId values

---

## 📋 PHASE 3: REPLACE AUTH UI COMPONENTS (180 minutes)

### 3.1 Create Centralized Sign-In Page (30 min)

**File**: `src/app/sign-in/[[...sign-in]]/page.tsx` (NEW FILE)

```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: 'theme-card shadow-neu-outset',
            card: 'bg-transparent shadow-none',
            headerTitle: 'text-foreground text-2xl font-bold',
            headerSubtitle: 'text-subtle',
            socialButtonsBlockButton: 'btn-secondary shadow-neu-outset-sm hover:shadow-neu-inset-sm',
            formButtonPrimary: 'btn-primary shadow-neu-outset hover:shadow-neu-inset',
            formFieldInput: 'form-input',
            footerActionLink: 'text-primary hover:underline',
          },
        }}
        redirectUrl="/dashboard"
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}
```

**Validation**:
- [ ] Sign-in page created
- [ ] Neumorphic styling applied
- [ ] Redirects to /dashboard after login

---

### 3.2 Create Centralized Sign-Up Page (30 min)

**File**: `src/app/sign-up/[[...sign-up]]/page.tsx` (NEW FILE)

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignUp 
        appearance={{
          elements: {
            rootBox: 'theme-card shadow-neu-outset',
            card: 'bg-transparent shadow-none',
            headerTitle: 'text-foreground text-2xl font-bold',
            headerSubtitle: 'text-subtle',
            socialButtonsBlockButton: 'btn-secondary shadow-neu-outset-sm hover:shadow-neu-inset-sm',
            formButtonPrimary: 'btn-primary shadow-neu-outset hover:shadow-neu-inset',
            formFieldInput: 'form-input',
            footerActionLink: 'text-primary hover:underline',
          },
        }}
        redirectUrl="/dashboard"
        routing="path"
        path="/sign-up"
      />
    </div>
  );
}
```

**Validation**:
- [ ] Sign-up page created
- [ ] Neumorphic styling applied
- [ ] Redirects to /dashboard after signup

---

### 3.3 Replace Header Buttons with Clerk Components (20 min)

**File**: `src/components/Header.tsx`

**Changes**:
```typescript
// ADD THESE IMPORTS:
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

// REMOVE THESE IMPORTS:
// import { useSession, signOut } from 'next-auth/react';

const Header: React.FC<HeaderProps> = ({ ... }) => {
  // REPLACE useSession with useUser:
  const { isSignedIn, user } = useUser();
  
  return (
    <header className="py-4 sm:py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-full shadow-neu-outset px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={onHomeClick} className="flex items-center space-x-3">
              <SunIcon />
              <span className="text-xl sm:text-2xl font-bold text-primary">SolarMatch</span>
            </button>
            
            {/* Right Side */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <ThemeSwitcher />
              
              <div className="hidden sm:flex items-center space-x-2">
                {isSignedIn ? (
                  <>
                    <button 
                      onClick={onDashboardClick}
                      className="px-5 py-2 text-sm font-bold tracking-wider text-foreground hover:text-primary transition-colors rounded-full bg-background shadow-neu-outset-sm hover:shadow-neu-inset-sm"
                    >
                      Dashboard
                    </button>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: 'w-10 h-10 shadow-neu-outset rounded-full',
                        }
                      }}
                    />
                  </>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <button className="px-5 py-2 text-sm font-bold tracking-wider text-foreground hover:text-primary transition-colors rounded-full bg-background shadow-neu-outset-sm hover:shadow-neu-inset-sm">
                        Login
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-5 py-2 text-sm font-bold tracking-wider border border-primary text-primary rounded-full bg-transparent shadow-neu-outset-sm hover:shadow-neu-inset-sm">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
```

**Validation**:
- [ ] Login/Signup buttons replaced with Clerk components
- [ ] UserButton displays logged-in user
- [ ] Modals open correctly (Clerk modal or redirect to /sign-in)

---

### 3.4 Delete Legacy Auth Modals (10 min)

**Files to DELETE**:
```powershell
# Delete all custom auth modals
Remove-Item "src/components/HomeownerSignupModal.tsx"
Remove-Item "src/components/HomeownerSignInModal.tsx"
Remove-Item "src/components/InstallerSignupModal.tsx"
Remove-Item "src/components/InstallerSignInModal.tsx"
Remove-Item "src/components/AdminSignInModal.tsx"
Remove-Item "src/components/DetailedQuoteAuthModal.tsx"
```

**Validation**:
- [ ] 6 modal files deleted
- [ ] No import errors in other files

---

### 3.5 Update LayoutContent.tsx (40 min)

**File**: `src/components/LayoutContent.tsx`

**Replace entire authentication section**:

```typescript
'use client';

import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
// ... other imports

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  
  // Remove all modal states:
  // const [isHomeownerSignupModalOpen, setIsHomeownerSignupModalOpen] = useState(false);
  // const [isHomeownerSignInModalOpen, setIsHomeownerSignInModalOpen] = useState(false);
  // const [isInstallerSignupModalOpen, setIsInstallerSignupModalOpen] = useState(false);
  // const [isInstallerSignInModalOpen, setIsInstallerSignInModalOpen] = useState(false);
  
  const handleLoginClick = () => {
    router.push('/sign-in');
  };
  
  const handleSignupClick = () => {
    router.push('/sign-up');
  };
  
  const handleDashboardClick = () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    
    // Redirect based on user role
    const role = user?.publicMetadata?.role as string;
    if (role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (role === 'INSTALLER') {
      router.push('/installer/dashboard');
    } else {
      router.push('/homeowner/dashboard');
    }
  };
  
  // Delete all modal components at the end of return statement
  // <HomeownerSignupModal ... />
  // <HomeownerSignInModal ... />
  // <InstallerSignupModal ... />
  // <InstallerSignInModal ... />
  
  return (
    <>
      <Header
        theme={theme}
        setTheme={setTheme}
        isLoggedIn={isSignedIn}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onLogoutClick={() => {}} // Clerk handles logout via UserButton
        onHomeClick={() => router.push('/')}
        onDashboardClick={handleDashboardClick}
        // ... other props
      />
      {children}
      <Footer ... />
    </>
  );
}
```

**Validation**:
- [ ] useUser replaces useSession
- [ ] Modal states removed
- [ ] Modal components removed from JSX
- [ ] Role-based routing preserved

---

### 3.6 Update InstantQuoteForm Authentication (50 min)

**File**: `src/components/InstantQuoteForm.tsx`

**Replace authentication modal trigger**:

```typescript
'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function InstantQuoteForm() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { openSignUp } = useClerk();
  
  const handleCalculateQuote = async () => {
    // Validate form...
    
    // If user not signed in, prompt signup
    if (!isSignedIn) {
      // Save quote data to localStorage (temp storage)
      localStorage.setItem('pendingQuoteData', JSON.stringify(formData));
      
      // Open Clerk signup modal
      openSignUp({
        redirectUrl: '/instant-quote/complete',
      });
      return;
    }
    
    // User is signed in, proceed with quote submission
    await submitQuote();
  };
  
  return (
    <form onSubmit={handleCalculateQuote}>
      {/* Form fields */}
    </form>
  );
}
```

**Create quote completion page**:

**File**: `src/app/instant-quote/complete/page.tsx` (NEW FILE)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function CompleteQuotePage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }
    
    // Get pending quote data from localStorage
    const pendingData = localStorage.getItem('pendingQuoteData');
    if (!pendingData) {
      router.push('/');
      return;
    }
    
    // Submit quote
    const submitPendingQuote = async () => {
      setIsSubmitting(true);
      try {
        const quoteData = JSON.parse(pendingData);
        
        const response = await fetch('/api/instant-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quoteData),
        });
        
        if (response.ok) {
          localStorage.removeItem('pendingQuoteData');
          router.push('/homeowner/dashboard?quoteSubmitted=true');
        }
      } catch (error) {
        console.error('Quote submission failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
    
    submitPendingQuote();
  }, [isSignedIn, router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="theme-card p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Completing Your Quote...</h2>
        <p className="text-subtle">Please wait while we process your solar quote request.</p>
      </div>
    </div>
  );
}
```

**Validation**:
- [ ] InstantQuoteForm uses Clerk signup
- [ ] Quote data saved to localStorage temporarily
- [ ] Completion page submits quote after signup
- [ ] User redirected to dashboard after submission

---

## 📋 PHASE 4: UPDATE SESSION MANAGEMENT (120 minutes)

### 4.1 Replace useSession in Components (90 min)

**Pattern to find and replace** (17 files):

**OLD CODE**:
```typescript
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();
const userEmail = session?.user?.email;
const userRole = session?.user?.role;
```

**NEW CODE**:
```typescript
import { useUser } from '@clerk/nextjs';

const { user, isSignedIn, isLoaded } = useUser();
const userEmail = user?.emailAddresses[0]?.emailAddress;
const userRole = user?.publicMetadata?.role as string;
```

**Files to update** (search for `useSession`):
1. src/app/page.tsx
2. src/app/homeowner/dashboard/page.tsx
3. src/app/blog/post/page.tsx
4. src/components/LayoutContent.tsx
5. src/components/QuoteOptionsModal.tsx
6. src/components/Header.tsx (if not already done)
7. And 11+ other components

**Validation**:
- [ ] All useSession calls replaced
- [ ] No TypeScript errors
- [ ] User data accessed correctly

---

### 4.2 Replace getServerSession in API Routes (30 min)

**Pattern to find and replace**:

**OLD CODE**:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  const userRole = session.user.role;
  // ...
}
```

**NEW CODE**:
```typescript
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get user from Prisma (includes role, phone, etc.)
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  const userId = user.id; // Prisma user ID
  const userRole = user.role;
  // ...
}
```

**Files to update**:
- src/app/api/verification/send-otp/route.ts
- src/app/api/verification/verify-otp/route.ts
- src/app/api/user/update-phone/route.ts
- And any other API routes using getServerSession

**Validation**:
- [ ] All getServerSession calls replaced
- [ ] API routes still protect endpoints correctly
- [ ] User lookup works via clerkId

---

## 📋 PHASE 5: UPDATE MIDDLEWARE & ROUTE PROTECTION (45 minutes)

### 5.1 Replace NextAuth Middleware with Clerk Middleware (30 min)

**File**: `src/middleware.ts`

**OLD CODE** (delete entirely):
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/api')) {
    const token = req.nextauth.token;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}
```

**NEW CODE**:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isInstallerRoute = createRouteMatcher(['/installer(.*)']);
const isHomeownerRoute = createRouteMatcher(['/homeowner(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  // Admin route protection
  if (isAdminRoute(req) && pathname !== '/admin') {
    if (!userId) {
      return Response.redirect(new URL('/admin', req.url));
    }
    
    const userRole = sessionClaims?.publicMetadata?.role as string;
    if (userRole !== 'ADMIN') {
      return Response.redirect(new URL('/', req.url));
    }
  }

  // Installer route protection
  if (isInstallerRoute(req)) {
    if (!userId) {
      return Response.redirect(new URL('/sign-in?redirect=/installer/dashboard', req.url));
    }
    
    const userRole = sessionClaims?.publicMetadata?.role as string;
    if (userRole !== 'INSTALLER') {
      return Response.redirect(new URL('/', req.url));
    }
  }

  // Homeowner route protection
  if (isHomeownerRoute(req)) {
    if (!userId) {
      return Response.redirect(new URL('/sign-in?redirect=/homeowner/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

**Validation**:
- [ ] Clerk middleware configured
- [ ] Admin routes protected (role check)
- [ ] Installer routes protected (role check)
- [ ] Homeowner routes protected (auth check)

---

### 5.2 Update Layout Guards (15 min)

**Files to update**:
- src/app/homeowner/layout.tsx
- src/app/installer/layout.tsx
- src/app/admin/layout.tsx

**OLD CODE**:
```typescript
import { signOut } from 'next-auth/react';

if (userRole !== 'HOMEOWNER') {
  const { signOut } = await import('next-auth/react');
  await signOut({ redirect: false });
  redirect('/');
}
```

**NEW CODE**:
```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const { userId, sessionClaims } = await auth();

if (!userId) {
  redirect('/sign-in');
}

const userRole = sessionClaims?.publicMetadata?.role as string;
if (userRole !== 'HOMEOWNER') {
  redirect('/');
}
```

**Validation**:
- [ ] Layout guards updated
- [ ] Role checks working
- [ ] Redirects work correctly

---

## 📋 PHASE 6: INSTALLER ONBOARDING (60 minutes)

### 6.1 Create Installer Onboarding Page (45 min)

**Problem**: Installer signup requires business details (companyName, phone, businessAddress, postcode)

**Solution**: Multi-step onboarding after Clerk signup

**File**: `src/app/installer/onboarding/page.tsx` (NEW FILE)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Button from '@/components/ui/button';

export default function InstallerOnboarding() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    businessAddress: '',
    postcode: '',
  });

  useEffect(() => {
    if (!isSignedIn && isLoaded) {
      router.push('/sign-in');
      return;
    }
    
    // Check if already completed onboarding
    if (user?.publicMetadata?.onboardingComplete) {
      router.push('/installer/dashboard');
    }
  }, [isSignedIn, isLoaded, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate postcode (4 digits)
    if (!/^\d{4}$/.test(formData.postcode)) {
      setError('Postcode must be 4 digits');
      setLoading(false);
      return;
    }

    // Validate phone (Australian format)
    const phoneRegex = /^(\+?61|0)[2-478](\d{8})$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      setError('Invalid phone number format');
      setLoading(false);
      return;
    }

    try {
      // Save business details to Prisma
      const response = await fetch('/api/user/update-business-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save business information');
      }

      // Update Clerk user metadata (mark onboarding complete)
      await user?.update({
        unsafeMetadata: {
          role: 'INSTALLER',
          onboardingComplete: true,
        },
      });

      // Redirect to dashboard
      router.push('/installer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="theme-card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Complete Your Installer Profile</h1>
        <p className="text-subtle text-sm mb-6">
          We need a few more details to set up your installer account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 px-4 py-3 rounded-xl text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="0412345678"
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Business Address *
            </label>
            <input
              type="text"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleInputChange}
              required
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Postcode *
            </label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              required
              maxLength={4}
              placeholder="2000"
              className="form-input w-full"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

**Validation**:
- [ ] Onboarding page created
- [ ] Form validates business details
- [ ] Data saved to Prisma after submission
- [ ] Redirects to dashboard after completion

---

### 6.2 Create Business Info API Route (15 min)

**File**: `src/app/api/user/update-business-info/route.ts` (NEW FILE)

```typescript
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { companyName, phone, businessAddress, postcode } = body;

  // Validate required fields
  if (!companyName || !phone || !businessAddress || !postcode) {
    return NextResponse.json(
      { error: 'All business details are required' },
      { status: 400 }
    );
  }

  try {
    // Update user in Prisma
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        companyName,
        phone,
        businessAddress,
        postcode,
        role: 'INSTALLER', // Ensure role is set
      },
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Failed to update business info:', error);
    return NextResponse.json(
      { error: 'Failed to update business information' },
      { status: 500 }
    );
  }
}
```

**Validation**:
- [ ] API route created
- [ ] Clerk authentication enforced
- [ ] Business details saved to Prisma
- [ ] Error handling implemented

---

## 📋 PHASE 7: CLEANUP & DELETION (30 minutes)

### 7.1 Delete Legacy Files (15 min)

**API Routes**:
```powershell
Remove-Item "src/app/api/auth/[...nextauth]/route.ts"
Remove-Item "src/app/api/auth/register/homeowner/route.ts"
Remove-Item "src/app/api/auth/register/installer/route.ts"
```

**Configuration**:
```powershell
Remove-Item "src/lib/auth.ts"
Remove-Item "src/types/next-auth.d.ts"
Remove-Item "src/components/NextAuthProvider.tsx"
```

**Environment Variables**:
- Remove NEXTAUTH_URL
- Remove NEXTAUTH_SECRET
- Remove NEXTAUTH_DEBUG

**Validation**:
- [ ] Legacy API routes deleted
- [ ] Legacy config files deleted
- [ ] Environment variables cleaned up

---

### 7.2 Update Import Statements (15 min)

**Search for broken imports** (files referencing deleted modals):

```powershell
Select-String -Path "src/**/*.tsx" -Pattern "HomeownerSignupModal|HomeownerSignInModal|InstallerSignupModal|InstallerSignInModal|AdminSignInModal|DetailedQuoteAuthModal"
```

**Remove import statements** for deleted components

**Validation**:
- [ ] No broken imports remain
- [ ] TypeScript compiles without errors

---

## 📋 PHASE 8: TESTING & VALIDATION (120 minutes)

### 8.1 TypeScript Compilation (5 min)

```powershell
npx tsc --noEmit
```

**Expected**: 0 errors

**Validation**:
- [ ] TypeScript compilation passes

---

### 8.2 Build Validation (10 min)

```powershell
npm run build
```

**Expected**: Build succeeds

**Validation**:
- [ ] Build completes successfully
- [ ] No build errors

---

### 8.3 Manual Testing - Homeowner Flow (30 min)

**Test Scenario 1: New User Signup**
1. [ ] Go to / (landing page)
2. [ ] Click "Sign Up" in header
3. [ ] Fill email + password in Clerk modal
4. [ ] Submit signup
5. [ ] Verify: User created in Clerk Dashboard
6. [ ] Verify: User synced to Prisma (check database)
7. [ ] Verify: Redirected to /homeowner/dashboard
8. [ ] Verify: Can access dashboard (no auth errors)

**Test Scenario 2: Existing User Login**
1. [ ] Click "Login" in header
2. [ ] Enter credentials in Clerk modal
3. [ ] Verify: Logged in successfully
4. [ ] Verify: Redirected to dashboard

**Test Scenario 3: Instant Quote Flow**
1. [ ] Fill instant quote form (unauthenticated)
2. [ ] Click "Calculate Quote"
3. [ ] Verify: Clerk signup modal opens
4. [ ] Sign up with new email
5. [ ] Verify: Quote data saved
6. [ ] Verify: Redirected to dashboard with quote

**Test Scenario 4: OAuth Login (Google)**
1. [ ] Click "Login" → "Continue with Google"
2. [ ] Authenticate with Google
3. [ ] Verify: User created in Clerk + Prisma
4. [ ] Verify: Redirected to dashboard

**Validation**:
- [ ] All homeowner flows working correctly

---

### 8.4 Manual Testing - Installer Flow (30 min)

**Test Scenario 1: Installer Signup + Onboarding**
1. [ ] Go to /sign-up
2. [ ] Sign up with email + password
3. [ ] Verify: Redirected to /installer/onboarding
4. [ ] Fill business details form
5. [ ] Submit onboarding
6. [ ] Verify: Data saved to Prisma
7. [ ] Verify: Redirected to /installer/dashboard

**Test Scenario 2: Installer Login (Completed Onboarding)**
1. [ ] Login with installer credentials
2. [ ] Verify: Directly to /installer/dashboard (no onboarding)

**Test Scenario 3: Role-Based Access**
1. [ ] Login as installer
2. [ ] Try to access /homeowner/dashboard
3. [ ] Verify: Redirected to / (unauthorized)

**Validation**:
- [ ] Installer flows working correctly
- [ ] Onboarding works correctly
- [ ] Role checks working

---

### 8.5 Manual Testing - Admin Flow (20 min)

**Test Scenario 1: Admin Login**
1. [ ] Go to /admin
2. [ ] Enter admin credentials in Clerk modal
3. [ ] Verify: Admin role check passes
4. [ ] Verify: Redirected to /admin/dashboard

**Test Scenario 2: Non-Admin Access**
1. [ ] Login as homeowner
2. [ ] Try to access /admin/dashboard
3. [ ] Verify: Redirected to / (middleware blocks)

**Validation**:
- [ ] Admin login working
- [ ] Admin route protection working

---

### 8.6 API Route Testing (15 min)

**Test Phone Verification APIs**:
1. [ ] Login as homeowner
2. [ ] Go to /homeowner/dashboard
3. [ ] Click "Add Phone Number"
4. [ ] Submit phone verification
5. [ ] Verify: OTP sent
6. [ ] Verify: Clerk authentication working in API

**Validation**:
- [ ] API routes using Clerk auth() correctly
- [ ] User lookup by clerkId working

---

### 8.7 Theme Testing (10 min)

**Test All 3 Themes**:
1. [ ] Dark theme - Clerk modal renders correctly
2. [ ] Light theme - Neumorphic styling visible
3. [ ] Purple theme - Purple accents applied

**Validation**:
- [ ] All themes working with Clerk components

---

## 📋 PHASE 9: DOCUMENTATION & COMMIT (30 minutes)

### 9.1 Update Documentation (15 min)

**Update README.md** (if exists):
- Replace NextAuth setup instructions with Clerk
- Update environment variables section
- Add Clerk dashboard link

**Update API documentation**:
- Document new authentication approach
- Update webhook endpoint docs

**Validation**:
- [ ] Documentation updated

---

### 9.2 Git Commit (15 min)

```powershell
cd "D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch"

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat(auth): Migrate from NextAuth.js to Clerk authentication

- Install @clerk/nextjs and remove next-auth dependencies
- Add clerkId field to User model, remove password field
- Delete Account, Session, VerificationToken models
- Create Clerk webhook for user sync (user.created, user.updated, user.deleted)
- Replace all custom auth modals with Clerk SignIn/SignUp components
- Update 17+ components from useSession to useUser hook
- Replace NextAuth middleware with Clerk middleware for route protection
- Create installer onboarding flow for business details collection
- Delete legacy auth API routes and configuration (~800 lines)
- Remove legacy auth modals (~1,500 lines)

BREAKING CHANGE: All users must re-authenticate via Clerk
TEST: All 3 user types (Homeowner, Installer, Admin) tested
CLOSES: #CLERK-MIGRATION"

# Push to branch
git push origin 008-clerk-auth-migration
```

**Validation**:
- [ ] All changes committed
- [ ] Branch pushed to remote

---

## ✅ FINAL VALIDATION CHECKLIST

### Code Quality
- [ ] TypeScript: 0 compilation errors
- [ ] Build: `npm run build` succeeds
- [ ] Linting: No ESLint errors
- [ ] No console errors in browser

### Functionality
- [ ] Homeowner signup works (email/password + OAuth)
- [ ] Homeowner login works
- [ ] Installer signup + onboarding works
- [ ] Installer login works
- [ ] Admin login works
- [ ] Instant quote auth flow works
- [ ] Protected routes enforce authentication
- [ ] Role-based access control works
- [ ] Logout works (via Clerk UserButton)

### Database
- [ ] Users synced via Clerk webhook
- [ ] clerkId field populated for all users
- [ ] password field deleted
- [ ] NextAuth models deleted
- [ ] Existing user relationships preserved

### Local Dev
- [ ] Clerk works in local environment
- [ ] Webhook forwarding works (Clerk CLI)
- [ ] Can view users in Clerk Dashboard
- [ ] OAuth providers work locally

### UI/UX
- [ ] Clerk components match neumorphic design
- [ ] Dark theme works
- [ ] Light theme works
- [ ] Purple theme works
- [ ] Mobile responsive

---

## 🚨 ROLLBACK PLAN (If Issues Arise)

### Immediate Rollback
```powershell
# Revert to previous branch
cd "D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch"
git checkout 007-migration-and-build

# Delete failed migration branch
git branch -D 008-clerk-auth-migration
```

### Database Rollback
```powershell
# Revert Prisma migration
npx prisma migrate reset

# Restore from backup (if backup created)
# psql -U postgres -d solarmatch < backup_before_clerk_migration.sql
```

---

## 📞 SUPPORT & TROUBLESHOOTING

**Common Issues**:

1. **Webhook not firing locally**
   - Use Clerk CLI: `clerk webhooks forward --port 3001`
   - Or use ngrok to expose localhost

2. **User not syncing to Prisma**
   - Check webhook secret in .env.local
   - Check webhook logs in Clerk Dashboard
   - Verify svix signature validation

3. **Role metadata not accessible**
   - Ensure role set in publicMetadata (not privateMetadata)
   - Check user.publicMetadata.role in code

4. **OAuth redirect not working**
   - Add all redirect URLs in Clerk Dashboard
   - Check NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL

**Clerk Documentation**:
- https://clerk.com/docs/quickstarts/nextjs
- https://clerk.com/docs/users/sync-data
- https://clerk.com/docs/users/metadata

---

**Plan Status**: ✅ READY FOR EXECUTION  
**Estimated Duration**: 10-12 hours  
**Risk Level**: MEDIUM (database migration, all auth flows affected)  
**Next Action**: Begin Phase 1 - Clerk Setup & Configuration
