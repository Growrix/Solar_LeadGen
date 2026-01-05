# Clerk Webhook Audit - Phase 10.2

**Date**: November 9, 2025  
**Status**: AUDIT IN PROGRESS  
**Objective**: Verify Clerk webhook configuration and ensure automatic user sync on signup

---

## 📋 Webhook Overview

### Current Implementation
- **Endpoint**: `/api/webhooks/clerk`
- **Location**: `src/app/api/webhooks/clerk/route.ts`
- **Events Handled**: `user.created`, `user.updated`
- **Verification**: Svix signature verification using `CLERK_WEBHOOK_SECRET`

### Webhook Logic (user.created)
```
1. User signs up in Clerk → Clerk fires webhook
2. Webhook handler receives event
3. Verifies Svix signature for security
4. Checks if user already exists in database (prevents duplicates)
5. Determines role:
   - Priority 1: unsafe_metadata.role
   - Priority 2: public_metadata.role
   - Priority 3: Default to "HOMEOWNER"
6. Creates user in PostgreSQL database
7. Syncs role back to Clerk publicMetadata (if not already set)
8. Returns success response
```

---

## ✅ Verification Checklist

### Step 1: Check Environment Variable
**Location**: `.env.local`

```bash
# Expected format
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Current Status**: ⚠️ PLACEHOLDER VALUE  
`.env.local` shows: `CLERK_WEBHOOK_SECRET=whsec_placeholder_for_local_dev`

**Required Action**:
- [ ] Replace placeholder with actual webhook secret from Clerk Dashboard
- [ ] For production: Set in deployment environment (Vercel/AWS/etc.)
- [ ] For local development: Use Clerk CLI webhook forwarding

---

### Step 2: Verify Clerk Dashboard Configuration

**Instructions**:
1. **Login to Clerk Dashboard**: https://dashboard.clerk.com/
2. **Navigate to**: Your App → Webhooks (in left sidebar)
3. **Check Webhook Exists**: Should see endpoint listed
4. **Verify Configuration**:

| Setting | Expected Value | Status |
|---------|---------------|--------|
| **Endpoint URL** | `https://yourdomain.com/api/webhooks/clerk` (production) <br> OR `http://localhost:3000/api/webhooks/clerk` (local with Clerk CLI) | ⏳ TO VERIFY |
| **Events Subscribed** | `user.created` ✅<br>`user.updated` ✅ | ⏳ TO VERIFY |
| **Status** | Active / Enabled | ⏳ TO VERIFY |
| **Signing Secret** | Starts with `whsec_` | ⏳ TO VERIFY |

---

### Step 3: Local Development Setup

For local testing, you MUST use Clerk CLI to forward webhooks:

```bash
# Install Clerk CLI (if not installed)
npm install -g @clerk/cli

# Login to Clerk
clerk login

# Forward webhooks to local server
clerk webhooks forward --port 3000
```

**What this does**:
- Creates a secure tunnel from Clerk → your localhost:3000
- Provides a temporary webhook secret (copy to `.env.local`)
- Allows testing webhook events locally without deploying

**Current Status**: ⏳ NOT CONFIGURED YET

---

### Step 4: Test Webhook Flow

**Test Scenario 1: New User Signup (Default HOMEOWNER)**
1. Create new test user in Clerk Dashboard (or use Clerk signup UI)
2. Check terminal logs for webhook confirmation:
   ```
   ✅ User synced to database: test@example.com (HOMEOWNER)
   ✅ Role synced to Clerk publicMetadata: HOMEOWNER
   ```
3. Verify in database:
   ```bash
   npx tsx check-users.ts
   # Should show new user with HOMEOWNER role
   ```

**Test Scenario 2: New User with Custom Role**
1. In Clerk Dashboard → Users → Create user
2. Before creating, set metadata:
   ```json
   {
     "public_metadata": {
       "role": "INSTALLER"
     }
   }
   ```
3. Check webhook creates user with INSTALLER role
4. Verify user can access `/installer` routes

**Test Scenario 3: User Update**
1. Update user details in Clerk Dashboard (name, email)
2. Check webhook logs for update confirmation
3. Verify database reflects changes

---

## 🔍 Code Analysis

### Webhook Security
```typescript
// ✅ GOOD: Svix signature verification
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
```

**Security Assessment**: ✅ SECURE  
- Uses Svix library for cryptographic verification
- Rejects requests without valid signatures
- Prevents replay attacks with timestamp validation

### Role Determination Logic
```typescript
// Priority: unsafe_metadata > public_metadata > default
const userRole = (unsafe_metadata?.role as string) || (public_metadata?.role as string) || 'HOMEOWNER';

// ✅ GOOD: Validates against enum
const validRoles = ['HOMEOWNER', 'INSTALLER', 'ADMIN'];
const role = validRoles.includes(userRole) ? userRole : 'HOMEOWNER';
```

**Assessment**: ✅ SECURE  
- Validates role is one of allowed values
- Falls back to HOMEOWNER if invalid role provided
- Prevents SQL injection or invalid enum values

### Duplicate Prevention
```typescript
// ✅ GOOD: Checks if user already exists
const existingUser = await prisma.user.findUnique({
  where: { clerkId: id },
});

if (existingUser) {
  console.log(`✅ User already exists: ${email_addresses[0].email_address}`);
  return NextResponse.json({ success: true, message: 'User already exists' }, { status: 200 });
}
```

**Assessment**: ✅ IDEMPOTENT  
- Handles webhook retries gracefully
- Won't create duplicate users
- Returns success even if user exists

### Metadata Sync Back to Clerk
```typescript
// ✅ GOOD: Syncs role to publicMetadata if missing
if (!public_metadata?.role) {
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(id, {
    publicMetadata: {
      role: userRole,
    },
  });
  console.log(`✅ Role synced to Clerk publicMetadata: ${userRole}`);
}
```

**Assessment**: ✅ SMART  
- Ensures Clerk publicMetadata always has role
- Middleware can read role without database query
- Reduces database load

---

## ⚠️ Identified Issues

### Issue 1: Webhook Secret is Placeholder
**Severity**: 🔴 CRITICAL  
**Impact**: Webhook cannot verify requests, all webhook events will fail  
**Current Value**: `whsec_placeholder_for_local_dev`  
**Fix Required**:
- Production: Get secret from Clerk Dashboard → Webhooks → Click webhook → Copy signing secret
- Local Dev: Run `clerk webhooks forward --port 3000` and copy generated secret

### Issue 2: No Webhook Event Logging
**Severity**: 🟡 MEDIUM  
**Impact**: Hard to debug webhook issues, no audit trail  
**Recommendation**:
```typescript
// Add to webhook handler
await prisma.webhookLog.create({
  data: {
    event: eventType,
    payload: JSON.stringify(evt.data),
    status: 'success',
    timestamp: new Date(),
  },
});
```

### Issue 3: No Webhook Retry Handling
**Severity**: 🟡 MEDIUM  
**Impact**: If database is down, user creation fails permanently  
**Recommendation**:
- Clerk auto-retries failed webhooks (returns 200 = success, 500 = retry)
- Current implementation: Returns 500 on database error ✅
- Could add: Dead letter queue for permanently failed events

---

## 📝 Recommended Next Steps

1. **IMMEDIATE** (Required for webhooks to work):
   - [ ] Get webhook secret from Clerk Dashboard
   - [ ] Update `.env.local` with real secret
   - [ ] Test webhook with new user signup

2. **PHASE 10.3** (Installer Signup):
   - [ ] Create installer signup flow
   - [ ] Set `public_metadata.role = "INSTALLER"` during signup
   - [ ] Test webhook creates installer users correctly

3. **PHASE 10.4** (Seed Data):
   - [ ] Create test users for all 3 roles
   - [ ] Test webhook doesn't duplicate existing users
   - [ ] Verify metadata sync works

4. **PHASE 10.5** (Performance):
   - [ ] Add webhook event logging (optional but recommended)
   - [ ] Monitor webhook success/failure rates
   - [ ] Set up alerts for webhook failures

---

## 🎯 Success Criteria

Webhook audit is complete when:
- ✅ Webhook secret configured (real value, not placeholder)
- ✅ Clerk Dashboard shows webhook active and subscribed to correct events
- ✅ Test signup creates user in database with correct role
- ✅ Metadata sync updates Clerk publicMetadata
- ✅ Duplicate signups handled gracefully
- ✅ User can login and access role-appropriate dashboard

---

## 📚 References

- **Clerk Webhook Docs**: https://clerk.com/docs/integrations/webhooks/overview
- **Svix Verification**: https://docs.svix.com/receiving/verifying-payloads/how
- **Webhook Handler Code**: `src/app/api/webhooks/clerk/route.ts`
- **User Sync Endpoint**: `src/app/api/user/sync/route.ts` (fallback if metadata empty)

---

## 🔄 Status Log

| Date | Action | Result |
|------|--------|--------|
| 2025-11-09 | Initial audit | Identified placeholder webhook secret |
| 2025-11-09 | Code review | Verified security and logic correctness |
| 2025-11-09 | Created audit doc | Awaiting webhook secret configuration |
