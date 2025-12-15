# Test Data Credentials - Solar Match

**Generated**: November 9, 2025  
**Seed Script**: `prisma/seed-complete.ts`  
**Database**: PostgreSQL (solarmatch-db-1)

---

## 🔐 Test User Accounts

### Admin User
- **Email**: `admin@solarmatch.com`
- **Clerk ID**: `user_35EMmqOVNhJHOajl16qhX6DcuFv`
- **Role**: ADMIN
- **Status**: Active, Verified
- **Access**: All dashboards (`/admin`, `/installer`, `/homeowner`)
- **Purpose**: System administration, lead approval, user management

**Clerk Configuration**:
```json
{
  "publicMetadata": {
    "role": "ADMIN"
  }
}
```

---

### Installer Test Users

#### Installer 1 (Verified)
- **Email**: `installer1@test.com`
- **Clerk ID**: `test_installer_1_clerk_id`
- **Name**: Solar Pro Installations
- **Company**: Solar Pro Installations
- **Address**: 123 Solar Street, Austin, TX 78701
- **Phone**: +1-555-0101
- **Postcode**: 78701
- **Role**: INSTALLER
- **Status**: Active, **Verified** ✅
- **Access**: `/installer` dashboard (can purchase leads)
- **Purpose**: Test verified installer flow, lead purchases

**Clerk Configuration**:
```json
{
  "publicMetadata": {
    "role": "INSTALLER"
  }
}
```

#### Installer 2 (Pending Verification)
- **Email**: `installer2@test.com`
- **Clerk ID**: `test_installer_2_clerk_id`
- **Name**: Green Energy Solutions
- **Company**: Green Energy Solutions
- **Address**: 456 Eco Drive, San Diego, CA 92101
- **Phone**: +1-555-0102
- **Postcode**: 92101
- **Role**: INSTALLER
- **Status**: Active, **NOT Verified** ⏳
- **Access**: `/installer` dashboard (limited features)
- **Purpose**: Test unverified installer flow, verification process

**Clerk Configuration**:
```json
{
  "publicMetadata": {
    "role": "INSTALLER"
  }
}
```

---

### Homeowner Test Users

#### Homeowner 1 (Phone Verified)
- **Email**: `homeowner1@test.com`
- **Clerk ID**: `test_homeowner_1_clerk_id`
- **Name**: John Smith
- **Phone**: +1-555-1001
- **Postcode**: 85001
- **Role**: HOMEOWNER
- **Status**: Active, **Phone Verified** ✅
- **Access**: `/homeowner` dashboard (can submit leads)
- **Leads**: 3 DRAFT, 2 PENDING_APPROVAL, 1 APPROVED
- **Purpose**: Test full homeowner flow, lead submission

**Clerk Configuration**:
```json
{
  "publicMetadata": {
    "role": "HOMEOWNER"
  }
}
```

#### Homeowner 2 (Phone NOT Verified)
- **Email**: `homeowner2@test.com`
- **Clerk ID**: `test_homeowner_2_clerk_id`
- **Name**: Jane Doe
- **Phone**: +1-555-1002
- **Postcode**: 98101
- **Role**: HOMEOWNER
- **Status**: Active, **Phone NOT Verified** ⏳
- **Access**: `/homeowner` dashboard (phone verification required)
- **Leads**: 3 PUBLIC (1 APPROVED, 1 PURCHASED)
- **Purpose**: Test phone verification flow

**Clerk Configuration**:
```json
{
  "publicMetadata": {
    "role": "HOMEOWNER"
  }
}
```

---

## 📊 Test Data Summary

### Users
- **Total**: 5 users
- **Admins**: 1
- **Installers**: 2 (1 verified, 1 pending)
- **Homeowners**: 2 (1 phone verified, 1 unverified)

### Leads
- **Total**: 10 leads
- **DRAFT**: 3 (homeowner1)
- **PENDING_APPROVAL**: 3 (homeowner1 and homeowner2)
- **APPROVED**: 3 (homeowner2 - visible in marketplace)
- **PURCHASED**: 1 (bought by installer1)

---

## 🧪 Testing Scenarios

### Scenario 1: Admin Workflow
1. Login as `admin@solarmatch.com`
2. Navigate to `/admin`
3. View all leads (including PENDING_APPROVAL)
4. Approve leads → status changes to APPROVED
5. View all installers (verified + pending)
6. Verify installer → `installerVerified` = true

### Scenario 2: Verified Installer Workflow
1. Login as `installer1@test.com`
2. Navigate to `/installer`
3. Browse marketplace → see APPROVED leads
4. Purchase lead → lead becomes PURCHASED
5. View purchased leads → see lead details
6. Contact homeowner via lead details

### Scenario 3: Pending Installer Workflow
1. Login as `installer2@test.com`
2. Navigate to `/installer`
3. See verification pending message
4. Limited marketplace access
5. Cannot purchase leads until verified

### Scenario 4: Verified Homeowner Workflow
1. Login as `homeowner1@test.com`
2. Navigate to `/homeowner`
3. Submit new lead → status = DRAFT
4. View leads → see DRAFT, PENDING_APPROVAL, APPROVED
5. Lead gets approved → visible in marketplace
6. Installer purchases → homeowner gets notified

### Scenario 5: Unverified Homeowner Workflow
1. Login as `homeowner2@test.com`
2. Navigate to `/homeowner`
3. See phone verification prompt
4. Enter phone → receive verification code
5. Submit code → `phoneVerified` = true
6. Unlock full lead submission

---

## 🔄 Creating Clerk Accounts

### For Local Development

You have 2 options:

#### Option A: Manual Signup (Recommended)
1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/sign-up`
3. Sign up with each test email:
   - admin@solarmatch.com
   - installer1@test.com
   - installer2@test.com
   - homeowner1@test.com
   - homeowner2@test.com
4. After signup, update Clerk publicMetadata for each user

#### Option B: Create in Clerk Dashboard
1. Go to Clerk Dashboard → Users
2. Click "Create User"
3. Enter email (e.g., `installer1@test.com`)
4. Set password or send invitation
5. **IMPORTANT**: Set `publicMetadata.role` to match database role
6. Repeat for all 5 test users

### Setting Clerk Metadata

For each user in Clerk Dashboard:
1. Click user → Metadata tab
2. Set `publicMetadata`:
   ```json
   {
     "role": "ADMIN"  // or "INSTALLER" or "HOMEOWNER"
   }
   ```
3. Save metadata

---

## 🐛 Troubleshooting

### Issue: User redirects to wrong dashboard
**Cause**: Clerk `publicMetadata.role` doesn't match database role  
**Fix**: Update Clerk metadata or re-run `npm run seed:complete`

### Issue: "User not found" error
**Cause**: Clerk account exists but database user missing  
**Fix**: Webhook should create user automatically. If not, check webhook logs.

### Issue: Phone verification doesn't work
**Cause**: Twilio credentials not configured  
**Fix**: Set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in `.env.local`

### Issue: Cannot purchase leads
**Cause**: Installer not verified  
**Fix**: Login as admin → verify installer in `/admin/installers`

---

## 📝 Seed Script Usage

### Run Complete Seed
```bash
npm run seed:complete
```

### What It Does
1. Checks for admin user (requires `npm run seed:admin` first)
2. Creates 2 installer test users (1 verified, 1 pending)
3. Creates 2 homeowner test users (1 phone verified, 1 not)
4. Creates 10 sample leads (various statuses)
5. Outputs credentials and next steps

### Re-running Seed
The script uses `upsert` so it's **idempotent**:
- Existing users won't be duplicated
- Leads will be created fresh each time
- Safe to run multiple times

---

## 🔐 Security Notes

⚠️ **IMPORTANT**: These are TEST credentials for DEVELOPMENT ONLY.

- **Never use in production**
- Clerk IDs are placeholder values (e.g., `test_installer_1_clerk_id`)
- Phone numbers are fake (+1-555-xxxx)
- Passwords should be simple for testing (e.g., `Test1234!`)

For production:
- Generate real Clerk IDs via webhook
- Use real email addresses
- Enforce strong passwords
- Implement proper phone verification
- Remove test data before deployment

---

## 📚 Related Documentation

- **Admin Setup**: `DOC/AUTH-SYSTEM-AUDIT-2025-11-09.md`
- **Webhook Audit**: `DOC/CLERK-WEBHOOK-AUDIT-2025-11-09.md`
- **Seed Script**: `prisma/seed-complete.ts`
- **Database Schema**: `prisma/schema.prisma`
- **Middleware**: `src/middleware.ts`

---

## ✅ Checklist

Before testing, ensure:
- [ ] Database seeded (`npm run seed:complete`)
- [ ] Clerk accounts created for all test users
- [ ] Clerk `publicMetadata.role` set correctly
- [ ] Webhook secret configured (`.env.local`)
- [ ] Dev server running (`npm run dev`)
- [ ] Docker PostgreSQL container running

---

**Last Updated**: November 9, 2025  
**Next Review**: After Phase 10.7 (End-to-end testing)
