# Admin Installers Table Data Fetching - Audit Report

**Date:** November 22, 2025  
**Phase:** F15 - Admin Installers Table Enhancement  
**Status:** Issues Identified - Fix Required

---

## Executive Summary

The Admin Installers table is fetching data from the **wrong source** (`User` model) instead of `InstallerVerification` model, causing:
1. Company name and representative name only showing after admin approval
2. Updates to installer profile not reflecting in the table
3. Inconsistent data display between verification submission and approval

---

## Current Architecture Analysis

### Data Models

#### 1. **User Model** (Authentication & Basic Profile)
```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  role              UserRole @default(HOMEOWNER)
  name              String?              // ❌ This is NOT filled during verification
  phone             String?              // ❌ This is NOT updated from verification
  companyName       String?              // ❌ Only updated AFTER admin approval
  businessAddress   String?              // ❌ Only updated AFTER admin approval
  postcode          String?              // ❌ Only updated AFTER admin approval
  phoneVerified     Boolean  @default(false)
  installerVerified Boolean  @default(false)
  ...
}
```

**Purpose:** Authentication, role management, and post-approval profile data  
**Problem:** This model is only populated AFTER admin approves the installer

#### 2. **InstallerVerification Model** (Verification Application Data)
```prisma
model InstallerVerification {
  id                 String   @id @default(cuid())
  userId             String   @unique
  companyName        String   // ✅ Filled immediately on verification submission
  representativeName String   // ✅ Filled immediately on verification submission
  designation        String
  email              String
  phone              String   // ✅ Filled immediately on verification submission
  address            String?  // ✅ Filled immediately on verification submission
  postcodes          String[] // ✅ Filled immediately on verification submission
  status             String   @default("PENDING")
  ...
}
```

**Purpose:** Stores installer verification application data  
**Lifecycle:** Created when installer submits verification form, exists regardless of approval status

---

## Current Implementation (WRONG)

### Backend API: `/api/admin/installers/list/route.ts`

**Current Query:**
```typescript
const installers = await prisma.user.findMany({
  where: { role: 'INSTALLER' },
  select: {
    id: true,
    email: true,
    name: true,              // ❌ NULL until admin approval
    phone: true,             // ❌ NULL until admin approval
    companyName: true,       // ❌ NULL until admin approval
    businessAddress: true,   // ❌ NULL until admin approval
    postcode: true,          // ❌ NULL until admin approval
    phoneVerified: true,
    installerVerified: true,
    ...
  },
});
```

**Issues:**
1. ❌ Fetches from `User` model only
2. ❌ `companyName`, `name`, `phone`, `businessAddress`, `postcode` are NULL in User until admin approves
3. ❌ When installer edits profile, changes update `InstallerVerification` but table still shows old User data
4. ❌ No join to `InstallerVerification` model

### Frontend: `InstallersTable.tsx`

**Interface:**
```typescript
interface Installer {
  id: string;
  email: string;
  name: string | null;              // ❌ Shows NULL before approval
  phone: string | null;             // ❌ Shows NULL before approval
  companyName: string | null;       // ❌ Shows NULL before approval
  businessAddress: string | null;   // ❌ Shows NULL before approval
  postcode: string | null;          // ❌ Shows NULL before approval
  ...
}
```

**Display:**
```tsx
<div className="text-body-small text-foreground">
  {installer.companyName || 'No company name'}  // ❌ Shows "No company name" before approval
</div>
<div className="text-body-small text-muted-foreground">
  {installer.name || 'No name'}                 // ❌ Shows "No name" before approval
</div>
```

---

## Root Cause Analysis

### Issue 1: Data Source Mismatch
- **What happens:** Installer submits verification form → data saved to `InstallerVerification` model
- **Problem:** Admin table fetches from `User` model → shows NULL values
- **Impact:** Table shows "No company name" / "No name" even though data exists

### Issue 2: Approval Dependency
- **What happens:** Admin approves installer → approval logic copies data from `InstallerVerification` to `User` model
- **Problem:** Table only shows data AFTER approval, not immediately after submission
- **Impact:** Admin cannot see installer details before approving them

### Issue 3: Profile Edit Sync Issue
- **What happens:** Installer edits profile → changes update `InstallerVerification` model
- **Problem:** Table fetches from `User` model → shows outdated data
- **Impact:** Profile edits don't reflect in admin table

### Issue 4: Search Inconsistency
- **Current search:**
```typescript
where.OR = [
  { email: { contains: search } },
  { name: { contains: search } },           // ❌ Searching NULL field
  { phone: { contains: search } },          // ❌ Searching NULL field
  { companyName: { contains: search } },    // ❌ Searching NULL field
  { businessAddress: { contains: search } }, // ❌ Searching NULL field
];
```
- **Problem:** Cannot search by company name or representative name before approval

---

## Correct Data Flow (REQUIRED)

```
Installer Signs Up
     ↓
User record created (role: INSTALLER, email only)
     ↓
Installer Submits Verification Form
     ↓
InstallerVerification record created ← ✅ DATA SOURCE FOR ADMIN TABLE
     ↓
Admin Views Installers Table
     ↓
Table fetches from InstallerVerification (NOT User) ← ✅ FIX REQUIRED
     ↓
Admin Approves Installer
     ↓
Data copied from InstallerVerification to User
     ↓
Installer Edits Profile
     ↓
Changes update InstallerVerification ← ✅ SINGLE SOURCE OF TRUTH
     ↓
Admin Table reflects changes immediately ← ✅ DESIRED BEHAVIOR
```

---

## Required Changes

### 1. Backend API Update

**File:** `src/app/api/admin/installers/list/route.ts`

**Change:** Include `InstallerVerification` relation in query

```typescript
const installers = await prisma.user.findMany({
  where: { role: 'INSTALLER' },
  select: {
    id: true,
    email: true,              // ✅ Keep from User (auth source)
    phoneVerified: true,      // ✅ Keep from User (auth flag)
    installerVerified: true,  // ✅ Keep from User (approval flag)
    isActive: true,
    image: true,
    createdAt: true,
    updatedAt: true,
    // ✅ ADD: Include verification data
    verification: {
      select: {
        companyName: true,        // ✅ Source of truth
        representativeName: true, // ✅ Source of truth
        phone: true,              // ✅ Source of truth
        address: true,            // ✅ Source of truth
        postcodes: true,          // ✅ Source of truth
        status: true,
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
});
```

**Update search filter:**
```typescript
if (search.trim()) {
  where.OR = [
    { email: { contains: search, mode: 'insensitive' } },
    // ✅ Search in InstallerVerification relation
    {
      verification: {
        companyName: { contains: search, mode: 'insensitive' }
      }
    },
    {
      verification: {
        representativeName: { contains: search, mode: 'insensitive' }
      }
    },
    {
      verification: {
        phone: { contains: search, mode: 'insensitive' }
      }
    },
    {
      verification: {
        address: { contains: search, mode: 'insensitive' }
      }
    },
  ];
}
```

### 2. Frontend Interface Update

**File:** `src/components/admin/InstallersTable.tsx`

**Update interface:**
```typescript
interface InstallerVerification {
  companyName: string;
  representativeName: string;
  phone: string;
  address: string | null;
  postcodes: string[];
  status: string;
}

interface Installer {
  id: string;
  email: string;              // From User
  phoneVerified: boolean;     // From User
  installerVerified: boolean; // From User
  isActive: boolean;          // From User
  image: string | null;       // From User
  createdAt: string;
  updatedAt: string;
  verification: InstallerVerification | null; // ✅ From InstallerVerification
}
```

**Update display logic:**
```tsx
<div className="text-body-small text-foreground">
  {installer.verification?.companyName || 'No company name'}
</div>
<div className="text-body-small text-muted-foreground">
  {installer.verification?.representativeName || 'No name'}
</div>
```

```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-body-small text-foreground">
    {installer.verification?.phone || 'N/A'}
  </div>
</td>
```

```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-body-small text-foreground truncate max-w-xs" 
       title={installer.verification?.address || 'Not provided'}>
    {installer.verification?.address || 'Not provided'}
  </div>
</td>
```

**Add postcode display:**
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-body-small text-foreground">
    {installer.verification?.postcodes?.[0] || 'N/A'}
    {installer.verification?.postcodes && installer.verification.postcodes.length > 1 
      ? ` +${installer.verification.postcodes.length - 1}` 
      : ''
    }
  </div>
</td>
```

---

## Benefits of This Fix

### 1. Immediate Data Display
✅ Admin sees company name and representative name as soon as installer submits verification form

### 2. Real-Time Updates
✅ When installer edits profile, changes reflect immediately in admin table

### 3. Consistent Data Source
✅ Single source of truth (`InstallerVerification`) for all installer business details

### 4. Better Search
✅ Admin can search by company name, representative name, phone, address before approval

### 5. Accurate Display
✅ No more "No company name" / "No name" for pending verifications

---

## Data Field Mapping

| Display Field | Current Source (WRONG) | Correct Source | Available When |
|--------------|------------------------|----------------|----------------|
| Email | User.email | User.email ✅ | Signup |
| Company Name | User.companyName ❌ | verification.companyName ✅ | Verification submission |
| Representative Name | User.name ❌ | verification.representativeName ✅ | Verification submission |
| Phone | User.phone ❌ | verification.phone ✅ | Verification submission |
| Address | User.businessAddress ❌ | verification.address ✅ | Verification submission |
| Postcode | User.postcode ❌ | verification.postcodes[0] ✅ | Verification submission |
| Phone Verified | User.phoneVerified ✅ | User.phoneVerified ✅ | Phone OTP verification |
| Installer Verified | User.installerVerified ✅ | User.installerVerified ✅ | Admin approval |
| Active Status | User.isActive ✅ | User.isActive ✅ | Always |

---

## Testing Checklist

### Before Fix (Current Issues)
- ❌ New installer submits verification → table shows "No company name"
- ❌ Admin cannot see installer details until approval
- ❌ Installer edits company name → table doesn't update
- ❌ Search by company name doesn't work for pending installers

### After Fix (Expected Behavior)
- ✅ New installer submits verification → table shows company name immediately
- ✅ Admin sees all installer details (company, name, phone, address) before approval
- ✅ Installer edits company name → table updates immediately
- ✅ Search by company name works for all installers (pending or approved)

---

## Edge Cases to Handle

### 1. Installer Without Verification
- **Scenario:** User with role INSTALLER but no verification record
- **Solution:** Display "Pending verification submission" in table
- **Code:**
```typescript
{installer.verification?.companyName || 'Verification not submitted'}
```

### 2. Multiple Postcodes
- **Scenario:** Installer serves multiple postcodes
- **Solution:** Show first postcode + count (e.g., "2000 +3")

### 3. Null Address
- **Scenario:** Address field is optional
- **Solution:** Show "Not provided" instead of empty cell

---

## Implementation Priority

**Priority:** 🔴 HIGH (Blocks admin workflow)

**Complexity:** 🟢 LOW (Simple join query change)

**Impact:** 🟢 HIGH (Fixes 3 major issues)

---

## Related Files

- `src/app/api/admin/installers/list/route.ts` - Backend API
- `src/components/admin/InstallersTable.tsx` - Frontend table component
- `prisma/schema.prisma` - Data models

---

## Next Steps

1. ✅ Update backend API to include `verification` relation
2. ✅ Update search filter to search in `verification` fields
3. ✅ Update frontend interface to expect `verification` object
4. ✅ Update frontend display to use `verification` data
5. ✅ Add postcode column to table
6. ✅ Test with new installer submission
7. ✅ Test with profile edit
8. ✅ Test search functionality
9. ✅ Update phase in tasks.md

---

**End of Audit Report**
