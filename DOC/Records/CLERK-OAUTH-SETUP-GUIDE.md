# Clerk OAuth Configuration Guide

**Date**: November 10, 2025  
**Phase**: Phase 2 - Hybrid Clerk Modal Restoration  
**Status**: ⚠️ **ACTION REQUIRED**

---

## Overview

After implementing the Hybrid Clerk authentication approach, OAuth providers (Google and Apple) need to be configured in the Clerk Dashboard to enable social login functionality.

---

## Prerequisites

- Active Clerk account with access to the project dashboard
- Admin permissions for the SolarMatch project in Clerk
- Access to Google Cloud Console (for Google OAuth)
- Apple Developer account (for Apple OAuth)

---

## Step 1: Access Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your **SolarMatch** project
3. Navigate to **Configure** → **SSO Connections** in the left sidebar

---

## Step 2: Enable Google OAuth

### 2.1 In Clerk Dashboard

1. Click **Add connection** or find **Google** in the providers list
2. Click **Enable** on the Google OAuth card
3. You'll see two required fields:
   - **Client ID**
   - **Client Secret**

### 2.2 Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one (e.g., "SolarMatch Auth")
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the consent screen if prompted:
   - **Application name**: SolarMatch
   - **Support email**: your-email@example.com
   - **Authorized domains**: Add your domain(s)
6. For **Application type**, select **Web application**
7. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://yourdomain.com
   https://www.yourdomain.com
   ```
8. Add **Authorized redirect URIs** (get from Clerk Dashboard):
   ```
   https://clerk.yourdomain.com/v1/oauth_callback
   https://accounts.yourdomain.com/v1/oauth_callback
   ```
   *(Replace with actual Clerk-provided redirect URLs)*

9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

### 2.3 Complete Clerk Configuration

1. Return to Clerk Dashboard
2. Paste the **Client ID** and **Client Secret**
3. Click **Save**
4. Test the connection using the **Test** button

---

## Step 3: Enable Apple OAuth

### 3.1 In Clerk Dashboard

1. Click **Add connection** or find **Apple** in the providers list
2. Click **Enable** on the Apple OAuth card
3. You'll see required fields:
   - **Services ID** (Identifier)
   - **Team ID**
   - **Key ID**
   - **Private Key**

### 3.2 Set Up Apple Sign In

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**

#### Create an App ID:
1. Go to **Identifiers** → **App IDs**
2. Click the **+** button to create a new identifier
3. Select **App IDs** → **App** → **Continue**
4. Configure:
   - **Description**: SolarMatch Web App
   - **Bundle ID**: `com.solarmatch.web` (or your domain reversed)
   - **Capabilities**: Check **Sign in with Apple**
5. Click **Continue** → **Register**

#### Create a Services ID:
1. Go to **Identifiers** → Click **+** button
2. Select **Services IDs** → **Continue**
3. Configure:
   - **Description**: SolarMatch Sign In
   - **Identifier**: `com.solarmatch.signin` (must be different from App ID)
4. Click **Continue** → **Register**
5. Click on the newly created Services ID
6. Check **Sign in with Apple**
7. Click **Configure** next to it
8. Add **Domains and Subdomains**:
   ```
   yourdomain.com
   www.yourdomain.com
   ```
9. Add **Return URLs** (get from Clerk Dashboard):
   ```
   https://clerk.yourdomain.com/v1/oauth_callback
   ```
10. Click **Save** → **Continue** → **Save**

#### Create a Key:
1. Go to **Keys** → Click **+** button
2. Configure:
   - **Key Name**: SolarMatch Sign In Key
   - **Enable**: Check **Sign in with Apple**
   - Click **Configure** → Select the Services ID created above
3. Click **Continue** → **Register**
4. **Download the key file** (`.p8` file) - **You can only download this once!**
5. Note down the **Key ID** shown on the page

#### Get Team ID:
1. Go to **Membership** in the Apple Developer portal
2. Copy your **Team ID** (10-character alphanumeric)

### 3.3 Complete Clerk Configuration

1. Return to Clerk Dashboard
2. Fill in the fields:
   - **Services ID**: The identifier you created (e.g., `com.solarmatch.signin`)
   - **Team ID**: Your Apple Developer Team ID
   - **Key ID**: The Key ID from the downloaded key
   - **Private Key**: Open the `.p8` file and paste the entire content
3. Click **Save**
4. Test the connection using the **Test** button

---

## Step 4: Configure Redirect URLs in Clerk

### Development Environment

1. In Clerk Dashboard, go to **Configure** → **Paths**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:3000
   http://localhost:3000/homeowner/dashboard
   http://localhost:3000/installer/dashboard
   ```

### Production Environment

1. Add production URLs:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   https://yourdomain.com/homeowner/dashboard
   https://yourdomain.com/installer/dashboard
   https://www.yourdomain.com/homeowner/dashboard
   https://www.yourdomain.com/installer/dashboard
   ```

---

## Step 5: Verify OAuth Scopes

### Google OAuth Scopes

Clerk automatically requests these scopes:
- `email` - User's email address
- `profile` - User's basic profile information (name, picture)

### Apple OAuth Scopes

Clerk automatically requests:
- `email` - User's email address
- `name` - User's name

---

## Step 6: Test OAuth Flows

### Testing Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000`

3. **Test Homeowner Signup via Google**:
   - Click "Sign Up" button
   - In the modal, click "Continue with Google"
   - Verify redirect to Google login
   - Complete Google authentication
   - Verify redirect back to `/homeowner/dashboard`
   - Check that role is set to `HOMEOWNER`

4. **Test Homeowner Signup via Apple**:
   - Repeat above steps with "Continue with Apple"
   - Verify Apple authentication flow
   - Verify redirect to `/homeowner/dashboard`

5. **Test Installer Signup via OAuth**:
   - Click "Become a Partner"
   - Complete eligibility modal
   - In signup modal, test Google and Apple OAuth
   - Verify redirect to `/installer/dashboard`
   - Check that role is set to `INSTALLER`

### Testing in Production

1. Deploy your application to production
2. Repeat all tests above using production URLs
3. Verify SSL certificates are valid
4. Check that OAuth redirects work correctly

---

## Troubleshooting

### Common Issues

#### Issue 1: "Redirect URI mismatch" error

**Cause**: The redirect URI configured in Google/Apple doesn't match what Clerk is sending.

**Solution**:
1. Copy the exact redirect URI from Clerk Dashboard
2. Ensure it's added to Google Cloud Console / Apple Developer Portal
3. Check for trailing slashes or protocol mismatches (http vs https)

#### Issue 2: Google OAuth shows "App not verified" warning

**Cause**: Google OAuth app is in testing mode.

**Solution**:
1. For development, add test users in Google Cloud Console
2. For production, submit app for verification
3. Or continue with "Advanced" → "Go to SolarMatch (unsafe)" during testing

#### Issue 3: Apple OAuth fails with "Invalid client"

**Cause**: Services ID or private key configuration incorrect.

**Solution**:
1. Double-check Services ID in Apple Developer Portal
2. Ensure private key is copied completely (including BEGIN/END lines)
3. Verify Key ID matches the downloaded key
4. Confirm Team ID is correct

#### Issue 4: Role not being assigned after OAuth signup

**Cause**: Webhook not triggering or metadata not being passed.

**Solution**:
1. Check Clerk webhook is configured (see existing webhook setup)
2. Verify `unsafeMetadata` is being passed in `<SignUp />` component
3. Check webhook logs in Clerk Dashboard
4. Ensure database has `role` field and webhook is updating it

---

## Security Considerations

### Best Practices

1. **Never commit OAuth secrets to version control**
   - Add `.env.local` to `.gitignore`
   - Use environment variables for sensitive data

2. **Use separate OAuth credentials for dev/prod**
   - Create different Google projects for dev and prod
   - Use different Apple Services IDs for dev and prod

3. **Regularly rotate secrets**
   - Regenerate Client Secrets every 90 days
   - Download new Apple keys periodically

4. **Monitor OAuth usage**
   - Check Clerk Dashboard for failed authentication attempts
   - Review Google Cloud Console for quota usage
   - Monitor Apple Developer Portal for issues

5. **Test error scenarios**
   - User denies permission
   - Network timeout during OAuth flow
   - Email already registered with different provider

---

## Verification Checklist

After configuration, verify:

- [ ] Google OAuth button appears in signup modals
- [ ] Apple OAuth button appears in signup modals
- [ ] Clicking Google OAuth redirects to Google login
- [ ] Clicking Apple OAuth redirects to Apple login
- [ ] Successful OAuth signup creates user in database
- [ ] Role metadata is correctly assigned (HOMEOWNER/INSTALLER)
- [ ] User is redirected to correct dashboard after OAuth signup
- [ ] Session is created and persisted
- [ ] User can sign out and sign back in with OAuth
- [ ] OAuth works in both light and dark themes
- [ ] OAuth works on mobile devices
- [ ] Error messages display correctly if OAuth fails

---

## Environment Variables (Optional)

If you need to reference OAuth configuration in your app:

```env
# .env.local

# Clerk OAuth (these are managed in Clerk Dashboard, not needed in .env)
# CLERK_GOOGLE_CLIENT_ID=<your-google-client-id>
# CLERK_GOOGLE_CLIENT_SECRET=<your-google-client-secret>
# CLERK_APPLE_SERVICES_ID=<your-apple-services-id>
# CLERK_APPLE_TEAM_ID=<your-apple-team-id>
# CLERK_APPLE_KEY_ID=<your-apple-key-id>
# CLERK_APPLE_PRIVATE_KEY=<your-apple-private-key>
```

**Note**: With Clerk's Hybrid approach, you don't need to store OAuth credentials in your app's environment variables. They're managed entirely in the Clerk Dashboard.

---

## Next Steps

After OAuth is configured:

1. **Test all authentication flows** (see Step 6)
2. **Update user onboarding** to handle OAuth signup
3. **Configure email templates** in Clerk Dashboard
4. **Set up 2FA** (optional but recommended)
5. **Add analytics tracking** for OAuth signup conversions
6. **Monitor Clerk Dashboard** for OAuth errors and usage

---

## Resources

- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/social-connections/overview)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Clerk Appearance API](https://clerk.com/docs/components/customization/overview)

---

**Last Updated**: November 10, 2025  
**Phase**: Phase 2 - Hybrid Clerk Modal Restoration  
**Status**: Configuration Pending
