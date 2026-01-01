# Installer Verification & Profile Field Mismatch Audit

**Date**: November 20, 2025  
**Status**: Critical Issues Identified  
**Priority**: HIGH

---

## Executive Summary

After comprehensive testing and code audit of the installer verification modal, profile page, and admin verification view, **critical data inconsistencies** have been identified. The root cause is that data is being pulled from **three different sources** (User model, InstallerVerification model, and InstallerProfile model) without proper synchronization.

**Critical Finding**: The Phone field in the Personal Details section shows `user.phone` from authentication, but this field is NOT updated when the installer submits the verification form with a different phone number stored in `verification.phone`.

---

## 1. Data Source Analysis

### Current Database Structure

```prisma
model User {
  phone         String?  // ❌ Source 1: From authentication signup
  email         String   // ✅ Consistent across all models
  name          String?  // ❌ Not in verification
  companyName   String?  // ❌ Duplicated in InstallerProfile and InstallerVerification
}

model InstallerProfile {
  companyName       String  // ❌ Duplicate of User.companyName and InstallerVerification.companyName
  businessAddress   String  // ❌ Not in verification form
  postcode          String  // ❌ Single postcode, but verification has postcodes array
  operationalStatus String
}

model InstallerVerification {
  companyName         String   // ❌ Duplicate (3rd instance)
  representativeName  String   // ❌ Should sync with User.name
  phone               String   // ❌ Source 2: From verification form (NOT synced with User.phone)
  email               String   // ❌ Duplicate of User.email
  designation         String   // ✅ Unique to verification
  abnOrLicense        String   // ✅ Unique to verification
  establishedYear     Int      // ✅ Unique to verification
  employeeCount       Int      // ✅ Unique to verification
  services            String[] // ✅ Unique to verification
  serviceAreas        String[] // ✅ Unique to verification
  postcodes           String[] // ❌ Conflicts with InstallerProfile.postcode
  website             String?  // ✅ Unique to verification
  socialLinks         Json?    // ✅ Unique to verification
  companyDescription  String?  // ✅ Unique to verification
  licenseDocKey       String?  // ✅ Unique to verification
  abnDocKey           String?  // ✅ Unique to verification
  logoKey             String?  // ✅ Unique to verification
  status              String   // ✅ Unique to verification
}
```

---

## 2. Field-by-Field Mismatch Analysis

### 🔴 CRITICAL: Phone Number Mismatch

| Component | Data Source | Current Implementation | Issue |
|-----------|-------------|------------------------|-------|
| **Verification Modal** | Form input → `verification.phone` | Stores in `InstallerVerification.phone` | ✅ Works |
| **Profile Page - Personal Details** | `user.phone` (from User model) | Shows authentication phone | ❌ **Shows WRONG phone** (not updated from verification) |
| **Profile Page - Company Details** | `user.phone` (from User model) | Shows authentication phone with label "(from account)" | ❌ **Shows WRONG phone** |
| **Admin View** | Mock data | `installer.phone` (should be from User model) | ❌ **Not connected to real data** |

**Expected Behavior**: When installer submits verification with phone `+61401731255`, this should be reflected in ALL views.

**Current Behavior**: Personal Details shows old/null phone from signup, while verification stores new phone separately.

---

### 🔴 CRITICAL: Name Field Missing from Verification

| Field | Verification Modal | Profile Page | Admin View | User Model |
|-------|-------------------|--------------|------------|------------|
| **Name** | ❌ NOT in form | ✅ Shows `user.name` | ✅ Shows `installer.name` | ✅ Exists |
| **Representative Name** | ✅ In form | ✅ Shows `verification.representativeName` | ✅ Shows `verification.representativeName` | ❌ Not stored |

**Issue**: `representativeName` and `user.name` are separate fields. No sync between them.

---

### 🟡 MEDIUM: Company Name Duplication

| Model | Field | Usage |
|-------|-------|-------|
| User | `companyName` | Stored during signup, shown in profile header |
| InstallerProfile | `companyName` | Created during verification approval |
| InstallerVerification | `companyName` | Submitted in verification form |

**Issue**: Three separate `companyName` fields that can have different values. No single source of truth.

---

### 🟡 MEDIUM: Postcode Inconsistency

| Model | Field | Type | Usage |
|-------|-------|------|-------|
| User | `postcode` | `String?` | Single postcode from signup |
| InstallerProfile | `postcode` | `String` | Single postcode (required) |
| InstallerVerification | `postcodes` | `String[]` | Multiple postcodes (array) |

**Issue**: Verification allows multiple postcodes, but User/Profile models only store one.

---

### 🟢 LOW: Email Duplication

| Model | Field | Usage |
|-------|-------|-------|
| User | `email` | Authentication email (source of truth) |
| InstallerVerification | `email` | Duplicated in verification form |

**Issue**: Email is duplicated in verification form but always same as `user.email`. Unnecessary duplication.

---

## 3. Frontend Implementation Gaps

### A. Verification Modal (`VerificationModal.tsx`)

#### ✅ Correctly Implemented
- All required fields from backend schema
- Services enum matches backend
- Service areas enum matches backend
- Phone E.164 format conversion
- Empty string to null conversion for optional fields

#### ❌ Missing Fields
- None (modal is correctly implemented)

#### ⚠️ Issues
- Phone submitted is NOT synced back to `User.phone`
- Representative name NOT synced to `User.name`
- Company name NOT synced to `User.companyName`

---

### B. Profile Page (`profile/page.tsx`)

#### Personal Details Section

```tsx
// Current Implementation (Lines 462-495)
<div>
  <label>Name</label>
  <p>{user.name}</p>  // ❌ Shows User.name (from signup)
</div>

<div>
  <label>Email</label>
  <p>{user.email}</p>  // ✅ Correct
</div>

<div>
  <label>Phone</label>
  <p>{user.phone}</p>  // ❌ Shows User.phone (from signup, NOT verification.phone)
</div>
```

**Issue**: Phone shows authentication phone, not verification phone.

**Expected**: Should show `verification.phone` if verification exists, otherwise `user.phone`.

#### Company Details Section

```tsx
// Current Implementation (Lines 514-590)
<div>
  <label>Representative Phone (from account)</label>
  <p>{user.phone}</p>  // ❌ Wrong source
</div>
```

**Issue**: Should show `verification.phone`, not `user.phone`.

---

### C. Admin Verification View (`admin/installers/[id]/page.tsx`)

#### ❌ CRITICAL: Using Mock Data

```tsx
// Line 8-59: Mock data hook
const useMockVerificationData = (id: string) => {
  return {
    installer: {
      phone: '+61 412 345 678',  // ❌ Hardcoded mock data
    },
    verification: {
      phone: '+61 412 345 678',  // ❌ Hardcoded mock data
    }
  };
};
```

**Issue**: Admin view is NOT connected to real database data.

**Required**: Wire to `GET /api/admin/installers/[id]/verification` endpoint (not yet created).

---

## 4. Backend API Gaps

### Existing APIs

| Endpoint | Status | Usage |
|----------|--------|-------|
| `POST /api/installer/verification/submit` | ✅ Working | Submit verification |
| `GET /api/installer/profile` | ✅ Working | Get installer data (User + Profile + Verification + Preferences) |
| `PUT /api/installer/profile` | ✅ Working | Update editable fields |

### Missing APIs

| Endpoint | Priority | Purpose |
|----------|----------|---------|
| `GET /api/admin/installers/[id]/verification` | 🔴 HIGH | Admin view real verification data |
| `PUT /api/admin/installers/[id]/verification/status` | 🔴 HIGH | Admin approve/reject verification |
| `GET /api/admin/installers/[id]/verification/logs` | 🟡 MEDIUM | Admin view verification history |

---

## 5. Data Synchronization Issues

### Issue 1: Phone Number Sync

**Current Flow**:
1. User signs up → `User.phone` set (if provided)
2. User submits verification → `InstallerVerification.phone` set
3. Profile page shows → `User.phone` (OLD value)

**Problem**: Two separate phone fields, no sync.

**Solution Options**:

#### Option A: Single Source of Truth (Recommended)
- Remove `phone` from `InstallerVerification` model
- Use only `User.phone`
- Verification form updates `User.phone` on submission

#### Option B: Sync After Verification Approval
- Keep both fields
- When admin approves verification → copy `verification.phone` to `User.phone`

#### Option C: Display Logic
- Keep both fields
- Profile page shows `verification.phone` if exists, otherwise `User.phone`

**Recommendation**: **Option A** for simplicity and data integrity.

---

### Issue 2: Representative Name Sync

**Current**: `verification.representativeName` is separate from `User.name`.

**Solution**: Sync `User.name` ← `verification.representativeName` on verification approval.

---

### Issue 3: Company Name Sync

**Current**: Three separate `companyName` fields.

**Solution**: Use `User.companyName` as single source of truth. Update it when verification is approved.

---

## 6. Recommended Single Source of Truth Architecture

### Proposed Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SOURCE OF TRUTH                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Model (Authentication + Basic Profile)                │
│  ├── email           (✅ Primary identifier)                │
│  ├── name            (✅ Synced from verification)          │
│  ├── phone           (✅ Synced from verification)          │
│  ├── companyName     (✅ Synced from verification)          │
│  └── installerVerified (✅ Set on approval)                │
│                                                              │
│  InstallerVerification (Business Details + Status)          │
│  ├── representativeName  (Used to update User.name)        │
│  ├── designation        (✅ Unique to business)            │
│  ├── abnOrLicense       (✅ Unique to business)            │
│  ├── establishedYear    (✅ Unique to business)            │
│  ├── employeeCount      (✅ Unique to business)            │
│  ├── services           (✅ Unique to business)            │
│  ├── serviceAreas       (✅ Unique to business)            │
│  ├── postcodes          (✅ Unique to business)            │
│  ├── website            (✅ Unique to business)            │
│  ├── socialLinks        (✅ Unique to business)            │
│  ├── companyDescription (✅ Unique to business)            │
│  ├── documents          (✅ Unique to business)            │
│  └── status             (✅ Verification workflow)         │
│                                                              │
│  InstallerProfile (Operational Settings)                    │
│  ├── operationalStatus  (✅ ACTIVE/PAUSED/INACTIVE)        │
│  └── preferences        (✅ Notification settings)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Sync Rules

1. **On Verification Submission**:
   - Store all business details in `InstallerVerification`
   - Do NOT modify `User` model yet

2. **On Admin Approval**:
   - Sync `User.name` ← `verification.representativeName`
   - Sync `User.phone` ← `verification.phone`
   - Sync `User.companyName` ← `verification.companyName`
   - Set `User.installerVerified = true`
   - Create `InstallerProfile` if not exists
   - Create `InstallerPreferences` if not exists

3. **Display Logic** (All Views):
   - Personal email → Always `User.email`
   - Personal name → `User.name` (synced from verification)
   - Personal phone → `User.phone` (synced from verification)
   - Company name → `verification.companyName` if approved, else `User.companyName`

---

## 7. Fix Plan - Phase B7

### Task B7.1: Update Verification Submission API ✅
**Status**: Already working correctly  
**Files**: `src/app/api/installer/verification/submit/route.ts`

### Task B7.2: Create User Sync Logic on Verification Approval
**Priority**: 🔴 CRITICAL  
**Action**: Update `PUT /api/admin/installers/[id]/verification/status` (needs to be created)

```typescript
// When status changes to APPROVED
if (newStatus === 'APPROVED') {
  await prisma.user.update({
    where: { id: verification.userId },
    data: {
      name: verification.representativeName,
      phone: verification.phone,
      companyName: verification.companyName,
      installerVerified: true,
    },
  });
  
  // Create InstallerProfile if not exists
  await prisma.installerProfile.upsert({
    where: { userId: verification.userId },
    create: {
      userId: verification.userId,
      companyName: verification.companyName,
      businessAddress: '', // TODO: Add to verification form
      postcode: verification.postcodes[0], // Use first postcode
      operationalStatus: 'ACTIVE',
    },
    update: {},
  });
}
```

### Task B7.3: Fix Profile Page Personal Details Display
**Priority**: 🔴 CRITICAL  
**Files**: `src/app/installer/(dashboard)/profile/page.tsx`

**Change**:
```tsx
// OLD (Lines 490-495)
<div>
  <label>Phone</label>
  <p>{user.phone}</p>
</div>

// NEW
<div>
  <label>Phone</label>
  <p>{verification?.phone || user.phone || 'Not provided'}</p>
  {user.phoneVerified && <CheckIcon />}
</div>
```

### Task B7.4: Fix Profile Page Company Details Display
**Priority**: 🔴 CRITICAL  
**Files**: `src/app/installer/(dashboard)/profile/page.tsx`

**Change**:
```tsx
// OLD (Lines 573-575)
<div>
  <label>Representative Phone (from account)</label>
  <p>{user.phone}</p>
</div>

// NEW
<div>
  <label>Representative Phone</label>
  <p>{verification?.phone || user.phone || 'Not provided'}</p>
</div>
```

### Task B7.5: Wire Admin Verification View to Real API
**Priority**: 🔴 CRITICAL  
**Files**: 
- `src/app/admin/installers/[id]/page.tsx`
- `src/app/api/admin/installers/[id]/verification/route.ts` (NEW)

**Action**:
1. Create `GET /api/admin/installers/[id]/verification` endpoint
2. Replace `useMockVerificationData` with real API call
3. Return aggregated User + Verification data

### Task B7.6: Create Admin Approval/Rejection API
**Priority**: 🔴 CRITICAL  
**Files**: 
- `src/app/api/admin/installers/[id]/verification/status/route.ts` (NEW)

**Actions**:
- `PUT /api/admin/installers/[id]/verification/status`
- Support status: APPROVED, REJECTED, MORE_INFO
- Implement sync logic from Task B7.2

### Task B7.7: Update Verification Modal Display Logic
**Priority**: 🟡 MEDIUM  
**Files**: `src/components/installer/VerificationModal.tsx`

**Action**: Pre-fill form with existing verification data if re-submitting.

### Task B7.8: Add Representative Name to Personal Details
**Priority**: 🟡 MEDIUM  
**Files**: `src/app/installer/(dashboard)/profile/page.tsx`

**Action**: 
```tsx
<div>
  <label>Name</label>
  <p>{verification?.representativeName || user.name || 'Not provided'}</p>
</div>
```

---

## 8. Testing Checklist

### Unit Tests
- [ ] Verification submission stores correct phone in InstallerVerification
- [ ] Admin approval syncs phone to User model
- [ ] Profile page shows correct phone (verification.phone > user.phone)
- [ ] Admin view loads real data from database

### Integration Tests
- [ ] Submit verification → Check InstallerVerification.phone saved
- [ ] Admin approve → Check User.phone updated
- [ ] Profile page displays updated phone immediately
- [ ] Phone verification works with synced phone number

### E2E Tests
1. [ ] Installer signs up with phone `+61400000000`
2. [ ] Installer submits verification with phone `+61411111111`
3. [ ] Profile Personal Details shows `+61411111111` ✅
4. [ ] Profile Company Details shows `+61411111111` ✅
5. [ ] Admin view shows `+61411111111` ✅
6. [ ] Admin approves verification
7. [ ] User.phone updates to `+61411111111` ✅
8. [ ] All views remain consistent ✅

---

## 9. Summary

### Critical Issues Identified: 7

1. ❌ Phone number mismatch (Personal Details shows wrong phone)
2. ❌ Phone number mismatch (Company Details shows wrong phone)
3. ❌ Admin view uses mock data (not connected to database)
4. ❌ No sync logic on verification approval
5. ❌ Representative name not synced to User.name
6. ❌ Company name duplicated in 3 models
7. ❌ Postcode vs postcodes inconsistency

### Priority

**Phase B7 Tasks**:
- **CRITICAL** (Must Fix Before Production): B7.2, B7.3, B7.4, B7.5, B7.6
- **MEDIUM** (Should Fix): B7.7, B7.8

### Estimated Effort

- **B7.2**: 2 hours (API + sync logic)
- **B7.3**: 30 minutes (display logic fix)
- **B7.4**: 30 minutes (display logic fix)
- **B7.5**: 2 hours (new API + frontend wiring)
- **B7.6**: 2 hours (approval API + sync)
- **B7.7**: 1 hour (pre-fill form)
- **B7.8**: 30 minutes (display logic)

**Total**: ~8.5 hours

---

## 10. Recommendations

1. **Immediate Fix**: Implement B7.3 and B7.4 (display logic) to show correct phone in profile page
2. **Backend Priority**: Implement B7.2 and B7.6 (sync logic on approval)
3. **Admin Priority**: Implement B7.5 (wire admin view to real data)
4. **Future Enhancement**: Consider removing duplicate fields from schema (B7.9 - Schema Cleanup)

---

**Next Steps**: Update `tasks.md` with Phase B7 and begin implementation.
