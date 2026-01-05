# Authentication Signup Issue - Complete Audit & Rebuild Plan

**Date**: November 10, 2025  
**Status**: 🚨 CRITICAL - Signup completely broken  
**Root Cause**: Webhook not configured + Metadata approach flawed

---

## 🔴 Current Critical Issues

### Issue 1: Webhook Not Firing
**Evidence from logs**:
```
[API /user/sync] ⚠️ User not found in DB, attempting to fetch from Clerk
[API /user/sync] Clerk metadata - unsafeRole: undefined, publicRole: undefined, final: null
[API /user/sync] ❌ No role found in Clerk metadata
```

**Problem**: 
- NO `[Webhook user.created]` logs appear when users sign up
- Users exist in Clerk Dashboard (nayeem4978@gmail.com, mohammadikramul7@gmail.com)
- Users DO NOT exist in database
- Webhook endpoint exists at `/api/webhooks/clerk` but is never called

**Root Cause**: Webhook not configured in Clerk Dashboard

---

### Issue 2: Metadata Not Being Set
**Evidence**: User tried to sign up with email `nayeem4978@gmail.com`
- User appears in Clerk Dashboard
- Logs show: `publicRole: undefined, unsafeRole: undefined`
- The `signUp.update({ publicMetadata: { role: 'HOMEOWNER' }})` call is failing silently

**Root Cause**: Clerk API has restrictions on when metadata can be set

---

## 🎯 Complete Rebuild Plan

### Option A: Fix Webhook + Simplify Metadata (RECOMMENDED)
**Time**: 1 hour  
**Risk**: LOW  
**Approach**: Configure webhook properly + use server-side role determination

**Steps**:
1. **Configure Clerk Webhook** (15 min)
   - Go to Clerk Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Enable event: `user.created`
   - Copy webhook secret to `.env.local`

2. **Simplify Signup Flow** (20 min)
   - Remove metadata setting from signup modals
   - Let webhook determine role based on which modal was used
   - Pass role via session storage or URL parameter

3. **Update Webhook Logic** (15 min)
   - Webhook reads role from URL parameter or determines from email pattern
   - Creates user in database with correct role immediately
   - Sets Clerk publicMetadata for future reference

4. **Test & Verify** (10 min)
   - Test fresh signup
   - Verify webhook logs appear
   - Verify user created in database with correct role

---

### Option B: Use Clerk Organizations (COMPLEX)
**Time**: 3-4 hours  
**Risk**: MEDIUM  
**Approach**: Use Clerk's built-in organization system for roles

This is overkill for your needs - not recommended.

---

### Option C: Manual Database Sync on Signup (TEMPORARY)
**Time**: 30 minutes  
**Risk**: LOW (temporary fix)  
**Approach**: Create user in database immediately during signup, bypass webhook

**Steps**:
1. Add API endpoint `/api/auth/register` that:
   - Creates user in Clerk
   - Immediately creates user in database
   - Returns success only if both succeed

2. Update signup modals to call this endpoint instead of Clerk directly

3. Keep webhook as backup for OAuth signups

---

## ✅ Recommended Solution: Option C (Immediate) + Option A (Proper Fix)

### Phase 1: IMMEDIATE FIX (30 min) - Get signups working NOW
Create a synchronous registration endpoint that handles both Clerk and database in one transaction.

### Phase 2: PROPER FIX (1 hour) - Configure webhooks for production
Set up Clerk webhooks properly for OAuth and edge cases.

---

## 📋 Implementation Details - Phase 1 (IMMEDIATE FIX)

### File 1: Create `/api/auth/register/route.ts`
```typescript
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();
    
    // Validate inputs
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (!['HOMEOWNER', 'INSTALLER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // 1. Create user in Clerk first
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      password: password,
      publicMetadata: {
        role: role
      }
    });
    
    console.log(`[Register] ✅ User created in Clerk: ${email} (${clerkUser.id})`);
    
    // 2. Create user in database
    const dbUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: email,
        role: role as 'HOMEOWNER' | 'INSTALLER',
        isActive: true,
        installerVerified: role === 'INSTALLER' ? false : undefined,
      },
    });
    
    console.log(`[Register] ✅ User created in DB: ${email} (role: ${role})`);
    
    return NextResponse.json({ 
      success: true, 
      userId: clerkUser.id,
      role: role 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('[Register] ❌ Error:', error);
    
    // If it's a Clerk error (user already exists), return specific message
    if (error?.clerkError) {
      return NextResponse.json({ 
        error: error.errors?.[0]?.message || 'Email already registered' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Registration failed. Please try again.' 
    }, { status: 500 });
  }
}
```

### File 2: Update HomeownerSignupModal.tsx
Replace the entire `handleSubmit` function with a call to `/api/auth/register`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  // Client-side validation
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    setLoading(false);
    return;
  }

  if (formData.password.length < 8) {
    setError("Password must be at least 8 characters long.");
    setLoading(false);
    return;
  }

  try {
    // Call our custom registration endpoint (handles both Clerk + DB)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        role: 'HOMEOWNER'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    // User created successfully, now sign them in
    if (!isLoaded || !signIn) {
      setError("Authentication system not ready");
      setLoading(false);
      return;
    }

    // Sign in with the credentials they just registered with
    const signInResult = await signIn.create({
      identifier: formData.email,
      password: formData.password,
    });

    if (signInResult.status === 'complete') {
      await setActive({ session: signInResult.createdSessionId });
      setSuccess('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        router.push('/homeowner/dashboard');
        onSuccess();
        onClose();
      }, 500);
    }
  } catch (err: any) {
    console.error('Signup error:', err);
    setError(err?.message || 'An error occurred during registration');
    setLoading(false);
  }
};
```

### File 3: Update InstallerSignupModal.tsx
Same change, but with `role: 'INSTALLER'` and redirect to `/installer/dashboard`

---

## 🧪 Testing Checklist

After implementation:
- [ ] Fresh homeowner signup → Creates in Clerk AND database
- [ ] Fresh installer signup → Creates in Clerk AND database  
- [ ] Duplicate email → Shows clear error message
- [ ] User can sign in immediately after signup
- [ ] Correct dashboard based on role
- [ ] Check database: User exists with correct role
- [ ] Check Clerk Dashboard: User exists with publicMetadata.role set

---

## 🔮 Phase 2: Webhook Configuration (After Phase 1 Working)

1. **Configure in Clerk Dashboard**:
   - Webhooks → Add Endpoint
   - URL: `https://your-production-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy signing secret

2. **Add to `.env.local`**:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

3. **Update webhook to handle missing users**:
   - If user.created event fires but user already in DB, skip
   - If user.created event fires and NOT in DB, create them
   - This handles OAuth flows (Google/Apple)

---

## 📊 Current System Analysis

### What's Working:
✅ Clerk authentication (signIn works)  
✅ Role validation in signin modals  
✅ Middleware role checking  
✅ Database schema  
✅ /api/user/sync endpoint  

### What's Broken:
❌ Webhook not configured/not firing  
❌ Users not created in database during signup  
❌ Metadata not being set on signup  
❌ Email verification flow broken (no user in DB)  
❌ Can't access dashboard after signup (404 user not found)  

### Why Previous Fixes Failed:
1. Changed `unsafeMetadata` to `publicMetadata` - **Still didn't work** because webhook isn't configured
2. Added `signUp.update()` call - **Fails silently** because Clerk API has restrictions
3. Added 1000ms delay - **Doesn't help** because webhook never fires

---

## 🎯 Recommendation

**IMPLEMENT PHASE 1 NOW** (30 minutes)
- Creates users synchronously
- No webhook dependency  
- Works immediately
- Simple to test
- Low risk

Then configure webhooks properly for production (Phase 2) to handle OAuth flows.
