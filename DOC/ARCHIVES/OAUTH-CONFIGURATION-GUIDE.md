# OAuth Configuration Guide for Clerk

**Date**: November 10, 2025  
**Status**: ✅ Code Ready - Needs Clerk Dashboard Configuration

---

## ✅ What's Already Implemented (Code Side)

### 1. OAuth Handlers in All Modals
- ✅ `HomeownerSignupModal.tsx` - Google & Apple OAuth
- ✅ `HomeownerSignInModal.tsx` - Google & Apple OAuth
- ✅ `InstallerSignupModal.tsx` - Google & Apple OAuth
- ✅ `InstallerSignInModal.tsx` - Google & Apple OAuth

### 2. OAuth Redirect Flow
```typescript
await signUp.authenticateWithRedirect({
  strategy: 'oauth_google', // or 'oauth_apple'
  redirectUrl: '/sso-callback',
  redirectUrlComplete: '/homeowner/dashboard', // or '/installer/dashboard'
});
```

### 3. SSO Callback Page
- ✅ Created `/sso-callback` page to handle OAuth returns
- Processes authentication completion
- Redirects to appropriate dashboard

### 4. Role Assignment
- OAuth signups include `unsafeMetadata: { role }` 
- Webhook processes role on user creation
- Users redirect to correct dashboard based on role

---

## 🔧 Required: Clerk Dashboard Configuration

To enable OAuth, you must configure providers in Clerk Dashboard:

### Step 1: Access Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Select your application: **SolarMatch**
3. Navigate to **Configure** → **SSO Connections**

### Step 2: Enable Google OAuth

1. Click **Add connection** → **Google**
2. You'll need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create/Select project
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: Add Clerk's redirect URL (shown in Clerk dashboard)
   - Copy **Client ID** and **Client Secret**
3. Paste credentials into Clerk dashboard
4. **Enable** the connection
5. Configure scopes (Clerk suggests defaults):
   - `openid`
   - `email`
   - `profile`

### Step 3: Enable Apple OAuth

1. Click **Add connection** → **Apple**
2. You'll need Apple Developer credentials:
   - Go to [Apple Developer Portal](https://developer.apple.com)
   - Create a **Services ID** for Sign in with Apple
   - Configure return URLs (use Clerk's provided URL)
   - Generate a **Key** for Sign in with Apple
   - Download the key file (.p8)
3. In Clerk dashboard, provide:
   - Services ID
   - Team ID
   - Key ID
   - Private Key (contents of .p8 file)
4. **Enable** the connection

### Step 4: Configure OAuth Settings in Clerk

1. **Allowed redirect URLs**:
   ```
   https://yourdomain.com/sso-callback
   http://localhost:3003/sso-callback (for development)
   ```

2. **Email verification**:
   - ✅ Recommended: Disable email verification for OAuth users
   - OAuth providers already verify email addresses
   - In Clerk dashboard: **User & Authentication** → **Email** → Disable "Verify email address" for OAuth

3. **Account linking**:
   - ✅ Recommended: Enable account linking
   - Allows users to link OAuth account to existing email/password account
   - In Clerk dashboard: **User & Authentication** → **Account linking**

---

## 🧪 Testing OAuth (After Configuration)

### Test Google OAuth (Homeowner)
1. Open app: http://localhost:3003
2. Click **"Sign Up"** in header
3. Click **"Continue with Google"** button
4. Authorize with Google
5. Should redirect to `/homeowner/dashboard`
6. Verify user created in database with role='HOMEOWNER'

### Test Apple OAuth (Homeowner)
1. Open app: http://localhost:3003
2. Click **"Sign Up"** in header
3. Click **"Continue with Apple"** button
4. Authorize with Apple
5. Should redirect to `/homeowner/dashboard`
6. Verify user created in database with role='HOMEOWNER'

### Test Google OAuth (Installer)
1. Click **"Become a Partner"**
2. Complete eligibility check (all YES)
3. Click **"Continue with Google"** button
4. Authorize with Google
5. Should redirect to `/installer/dashboard`
6. Verify user created in database with role='INSTALLER'

### Test Apple OAuth (Installer)
1. Click **"Become a Partner"**
2. Complete eligibility check (all YES)
3. Click **"Continue with Apple"** button
4. Authorize with Apple
5. Should redirect to `/installer/dashboard`
6. Verify user created in database with role='INSTALLER'

---

## ⚠️ Important Notes

### Development vs Production
- **Development**: OAuth providers must whitelist `http://localhost:3003`
- **Production**: Update OAuth redirect URLs to your production domain
- Clerk handles different environments via publishable keys

### Role Assignment with OAuth
- Role is set in `unsafeMetadata` during OAuth signup
- Webhook picks up role from metadata and syncs to database
- If role not set, defaults to 'HOMEOWNER'

### Email Conflicts
- If user signs up with email/password, then tries OAuth with same email:
  - Without account linking: Error (email already exists)
  - With account linking: Accounts get linked automatically

### Error Handling
- OAuth errors redirect to `/?error=oauth_failed`
- Check browser console for detailed error messages
- Verify Clerk webhook is receiving events

---

## 📋 Verification Checklist

Before marking OAuth as complete:

- [ ] Google OAuth configured in Clerk Dashboard
- [ ] Apple OAuth configured in Clerk Dashboard
- [ ] Redirect URLs configured (dev + production)
- [ ] Account linking enabled in Clerk
- [ ] Test homeowner Google signup → correct dashboard
- [ ] Test homeowner Apple signup → correct dashboard
- [ ] Test installer Google signup → correct dashboard
- [ ] Test installer Apple signup → correct dashboard
- [ ] Verify roles in database match expected (HOMEOWNER/INSTALLER)
- [ ] Test signing in with OAuth (after signup)
- [ ] Verify webhook processes OAuth users correctly

---

## 🔍 Troubleshooting

### "Redirect URI mismatch" Error
- Verify redirect URL in Google/Apple console matches Clerk's URL
- Check for trailing slashes (match exactly)
- Ensure localhost port matches (3003 not 3000)

### OAuth Button Does Nothing
- Check browser console for errors
- Verify Clerk publishable key in `.env.local`
- Ensure OAuth provider is **enabled** in Clerk dashboard

### User Created with Wrong Role
- Check webhook logs in Clerk dashboard
- Verify `unsafeMetadata` is being passed in `authenticateWithRedirect()`
- Check database user record for correct role

### Redirect Goes to Wrong Dashboard
- Check `redirectUrlComplete` in modal OAuth handlers
- Verify middleware role-based routing is working
- Check if role synced to Clerk `publicMetadata`

---

## ✅ Current Status

**Code Implementation**: ✅ COMPLETE
- All modals have OAuth buttons
- OAuth redirect handlers implemented
- SSO callback page created
- Role assignment logic in place
- Webhook processing role metadata

**Clerk Configuration**: ⏳ PENDING
- Google OAuth: Needs credentials + enable
- Apple OAuth: Needs credentials + enable
- Redirect URLs: Needs configuration
- Account linking: Needs enable

**Next Step**: Configure OAuth providers in Clerk Dashboard using this guide.

---

**Last Updated**: November 10, 2025  
**Implementation**: Complete  
**Configuration**: Pending Clerk Dashboard setup
