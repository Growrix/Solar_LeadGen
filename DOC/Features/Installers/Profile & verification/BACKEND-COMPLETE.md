# Backend Phase B5 - Implementation Complete

Date: 2025-11-19
Status: ✅ Complete - Ready for UI wiring and testing
Commits: 12732d9, 2bdb5b9, 586bedd

## What Was Built

### Database Models (B5.1)
- `InstallerVerification`: Full verification application (company, representative, legal, services, documents)
- `InstallerVerificationLog`: Immutable audit trail for admin actions
- `InstallerPreferences`: Notification toggles (5 alert types)
- `InstallerProfile.operationalStatus`: ACTIVE | PAUSED | INACTIVE

### Validation Schemas
- `src/lib/validation/installer.ts`: Complete Zod schemas for all payloads
- E.164 phone validation (+61XXXXXXXXX)
- Services/service areas enums
- Password complexity (12+ chars, upper/lower/digit/symbol)

### Installer APIs (8 endpoints)

#### Verification & Profile
- **GET `/api/installer/profile`**: Aggregated user + profile + verification + preferences + operationalStatus
- **PUT `/api/installer/profile`**: Update profile + editable verification fields (post-approval subset)
- **POST `/api/installer/verification/submit`**: Create/update verification application + log (blocks resubmit if APPROVED)
- **GET `/api/installer/uploads/presign`**: S3 presigned upload URLs (5-min expiry, validates type/size)

#### Preferences & Account
- **GET `/api/installer/preferences`**: Read preferences (creates defaults if missing)
- **PUT `/api/installer/preferences`**: Update notification toggles
- **PUT `/api/installer/account/status`**: Toggle ACTIVE/PAUSED (installer-only)
- **POST `/api/installer/account/change-password`**: Validate current + complexity + hash + rotate sessionVersion (force re-login)

### Admin APIs (4 endpoints)

#### Verification Management
- **GET `/api/admin/installers/[id]/verification`**: Full details + presigned S3 download URLs (1-hour expiry)
- **PUT `/api/admin/installers/[id]/verification`**: APPROVE/REJECT/REQUEST_INFO + update User.installerVerified + create log + send notification
- **GET `/api/admin/installers/[id]/logs`**: Audit trail with admin attribution (ordered by date desc)

#### Control
- **PUT `/api/admin/installers/[id]/status`**: Set ACTIVE/PAUSED/INACTIVE + send notification (admin can set INACTIVE, installers cannot)

### Features Implemented
✅ Role-based access control (INSTALLER vs ADMIN gates)
✅ Zod validation on all inputs with detailed error responses
✅ Prisma Json handling for socialLinks
✅ S3 integration (presigned uploads and downloads)
✅ Notification creation for verification actions and status changes
✅ Password hashing with bcrypt (12 rounds)
✅ Session invalidation on password change (sessionVersion++)
✅ Audit logging with admin attribution
✅ Default preferences creation on first access
✅ Prevents resubmission if already approved
✅ TypeScript clean (0 errors in API routes)
✅ Semantic check clean (0 violations)

## Testing Checklist

### Installer Flow
1. **Submit Verification**:
   - POST to `/api/installer/verification/submit` with all required fields
   - Verify log entry created with action=SUBMITTED
   - Check status=PENDING

2. **Upload Documents**:
   - GET `/api/installer/uploads/presign?filename=license.pdf&contentType=application/pdf&fileType=document`
   - Use returned uploadUrl to PUT file directly to S3
   - Store returned key in verification

3. **Check Profile**:
   - GET `/api/installer/profile`
   - Verify aggregated data (user, profile, verification, preferences, operationalStatus)

4. **Update Profile** (after approval):
   - PUT `/api/installer/profile` with services/areas/social links
   - Verify only approved installers can edit verification fields

5. **Manage Preferences**:
   - GET `/api/installer/preferences` (creates defaults if missing)
   - PUT `/api/installer/preferences` with toggles

6. **Toggle Status**:
   - PUT `/api/installer/account/status` with status=PAUSED
   - Verify cannot set INACTIVE (admin-only)

7. **Change Password**:
   - POST `/api/installer/account/change-password` with current + new passwords
   - Verify complexity validation
   - Verify session invalidated (force logout)

### Admin Flow
1. **View Verification**:
   - GET `/api/admin/installers/[userId]/verification`
   - Verify presigned download URLs for documents (if S3 configured)

2. **Approve/Reject**:
   - PUT `/api/admin/installers/[userId]/verification` with action=APPROVE
   - Verify User.installerVerified updated
   - Verify log created
   - Verify notification sent

3. **View Logs**:
   - GET `/api/admin/installers/[userId]/logs`
   - Verify admin attribution and chronological order

4. **Control Status**:
   - PUT `/api/admin/installers/[userId]/status` with status=INACTIVE
   - Verify notification sent

## Error Scenarios to Test
- ❌ Non-authenticated requests (401)
- ❌ Wrong role (403)
- ❌ Invalid Zod payload (400 with issues)
- ❌ Resubmit approved verification (400 with message)
- ❌ Invalid file type for upload (400)
- ❌ Wrong current password (400)
- ❌ Weak new password (400 with complexity errors)
- ❌ Password mismatch (400)

## Next Steps (UI Wiring - Phase B5.10)
1. Wire Profile page to GET/PUT `/api/installer/profile`
2. Wire VerificationModal to POST `/api/installer/verification/submit` + presign upload
3. Wire Preferences section to GET/PUT `/api/installer/preferences`
4. Wire Operational Status toggle to PUT `/api/installer/account/status`
5. Wire Password Change form to POST `/api/installer/account/change-password`
6. Wire Admin Verification page to GET `/api/admin/installers/[id]/verification` + PUT for actions
7. Wire Admin Logs view to GET `/api/admin/installers/[id]/logs`
8. Wire Admin Status control to PUT `/api/admin/installers/[id]/status`

## Rollback Instructions
If needed, rollback to commit `cf3ba34` (backup checkpoint before schema changes):
```bash
git reset --hard cf3ba34
npx prisma db push --force-reset  # WARNING: Drops new tables
npx prisma generate
```

## File Structure
```
src/
├── lib/
│   └── validation/
│       └── installer.ts (NEW - all Zod schemas)
└── app/
    └── api/
        ├── installer/
        │   ├── profile/
        │   │   └── route.ts (GET + PUT)
        │   ├── verification/
        │   │   └── submit/
        │   │       └── route.ts (POST)
        │   ├── uploads/
        │   │   └── presign/
        │   │       └── route.ts (GET)
        │   ├── preferences/
        │   │   └── route.ts (GET + PUT)
        │   └── account/
        │       ├── status/
        │       │   └── route.ts (PUT)
        │       └── change-password/
        │           └── route.ts (POST)
        └── admin/
            └── installers/
                └── [id]/
                    ├── verification/
                    │   └── route.ts (GET + PUT)
                    ├── logs/
                    │   └── route.ts (GET)
                    └── status/
                        └── route.ts (PUT)
```

---

**All backend infrastructure is complete and ready for UI integration.**
