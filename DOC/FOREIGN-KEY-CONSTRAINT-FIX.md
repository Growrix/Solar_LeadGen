# Foreign Key Constraint Error - Root Cause Analysis & Fix

**Issue Date**: December 7, 2025  
**Error**: `Foreign key constraint violated on the constraint: lead_assignments_assignedBy_fkey`  
**Context**: Admin panel lead assignment failing after database reset

---

## 🔍 Root Cause Analysis

### Error Details
```
Invalid `prisma.leadAssignment.upsert()` invocation:
Foreign key constraint violated on the constraint: `lead_assignments_assignedBy_fkey`
```

### What Happened

1. **Database Reset Occurred** (during Phase 13G implementation)
   ```powershell
   npx prisma migrate reset  # ⚠️ This destroyed all data including users
   ```

2. **Admin User Recreated** (with new ID)
   ```typescript
   // Old admin ID (before reset): clb1a2b3c4d5e6f7g8h9i0j1
   // New admin ID (after reset):  clm9x8w7v6u5t4s3r2q1p0o9
   // ❌ Session cookie still contains OLD admin ID!
   ```

3. **Session Cookie Contains Stale Data**
   - NextAuth session stored in encrypted cookie
   - Cookie created before database reset
   - Contains old admin user ID that no longer exists
   - Browser doesn't know database was reset

4. **Foreign Key Constraint Fails**
   ```typescript
   // Admin panel tries to assign lead:
   await prisma.leadAssignment.create({
     assignedBy: session.user.id,  // ❌ Old ID from cookie
     // ... other fields
   });
   
   // Database checks foreign key:
   // "Does user with ID 'clb1a2b3c4d5e6f7g8h9i0j1' exist?"
   // Result: NO → Foreign key constraint violated!
   ```

### Schema Context
```prisma
model LeadAssignment {
  assignedBy  String
  admin       User @relation("admin_assignments", fields: [assignedBy], references: [id])
  //                                                       ^^^^^^^^^^^^ Must exist in User table
}
```

---

## ✅ Solution: Clear Session and Re-Login

### Step 1: Clear Browser Session
**Option A - Clear Cookies (Recommended):**
1. Open DevTools (F12)
2. Go to Application tab → Cookies
3. Delete all cookies for `http://localhost:3000`
4. Refresh page

**Option B - Sign Out:**
1. Click profile menu → Sign Out
2. This will clear the session cookie automatically

### Step 2: Re-Login with Admin Credentials
```
Email: admin@solarmatch.com
Password: Admin123!Secure
```

### Step 3: Verify Fix
1. Go to Admin Panel → Lead Management
2. Try assigning a lead to an installer
3. Should work without foreign key error ✅

---

## 🧠 Technical Explanation

### Why This Happens After Database Reset

**Before Reset:**
```
┌─────────────────┐     ┌──────────────────┐
│ Browser Cookie  │     │  Database        │
│ admin ID: ABC123│────▶│  User(ABC123)    │  ✅ Valid reference
└─────────────────┘     └──────────────────┘
```

**After Reset:**
```
┌─────────────────┐     ┌──────────────────┐
│ Browser Cookie  │     │  Database        │
│ admin ID: ABC123│──✗─▶│  User(XYZ789)    │  ❌ Invalid reference
└─────────────────┘     └──────────────────┘
                        (new ID after reset)
```

**After Re-Login:**
```
┌─────────────────┐     ┌──────────────────┐
│ Browser Cookie  │     │  Database        │
│ admin ID: XYZ789│────▶│  User(XYZ789)    │  ✅ Valid reference
└─────────────────┘     └──────────────────┘
```

### Why Foreign Keys Exist
- **Data Integrity**: Ensures `assignedBy` always points to a real user
- **Prevents Orphans**: Can't have assignments from deleted users
- **Cascade Rules**: When user deleted, assignments can be handled (CASCADE, SET NULL, etc.)

### Why Session Cookies Don't Auto-Update
- **Security**: Sessions are encrypted and signed
- **Stateless**: Server doesn't track all active sessions
- **Expiry**: Sessions expire naturally (default: 30 days)
- **Manual Clear**: Database reset is rare, expected to re-login

---

## 🚨 Prevention Checklist

To avoid this issue in the future:

### For Developers
- [ ] **NEVER use `npx prisma migrate reset` unless absolutely necessary**
- [ ] Use incremental migrations: `npx prisma migrate dev --name feature_name`
- [ ] If reset is required, document it in commit message
- [ ] After reset, immediately:
  - [ ] Run ALL seed scripts (seed-settings.ts, seed-admin.ts, seed-test-bidding.ts)
  - [ ] Clear browser cookies
  - [ ] Re-login to all test accounts
  - [ ] Re-test all features that use foreign keys

### For Testers
- [ ] After any database reset notice:
  - [ ] Clear browser cache and cookies
  - [ ] Re-login to all accounts
  - [ ] Expect test data to be reset

### Automated Checks
- [ ] Add migration policy to AI-IMPLEMENTATION-GUIDELINES.md ✅ (Done)
- [ ] Document seed script execution order
- [ ] Add pre-migration checklist

---

## 📝 Related Issues

**Settings Table Empty** (Fixed):
- Cause: Database reset wiped Settings table
- Solution: Ran `npx tsx prisma/seed-settings.ts`

**Homeowner Dashboard Not Loading** (Fixed):
- Cause: Settings table empty
- Solution: Reseeded settings

**Lead Assignment Foreign Key Error** (This Issue):
- Cause: Session cookie has old admin ID
- Solution: Clear cookies and re-login

---

## 🔗 References

- **Schema Definition**: `prisma/schema.prisma` (line 229-248)
- **Seed Scripts**:
  - `prisma/seed-admin.ts` - Creates admin user
  - `prisma/seed-settings.ts` - Populates settings
  - `prisma/seed-test-bidding.ts` - Test data
- **API Endpoint**: `src/app/api/admin/leads/[id]/assign/route.ts` (line 75)
- **Migration Policy**: `DOC/Guidelines/AI-IMPLEMENTATION-GUIDELINES.md` (Database Reset Policy section)

---

## ✅ Issue Resolution

**Status**: RESOLVED  
**Resolution**: Clear browser cookies and re-login with admin credentials  
**Root Cause**: Session cookie contained stale admin user ID after database reset  
**Prevention**: Follow incremental migration policy to avoid database resets  

---

**Note**: This is an expected consequence of database resets. In production, database resets NEVER happen, so this issue only affects development after a reset operation.
