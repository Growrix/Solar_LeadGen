# Phase E: Critical Bug Fixes - Audit Report

**Date:** November 20, 2025  
**Phase:** E (Critical Fixes Post Phase D Testing)  
**Priority:** CRITICAL - Production Blocking  
**Estimated Time:** 6-8 hours

---

## Executive Summary

Phase D testing revealed **5 critical bugs** preventing profile edit functionality from working correctly:

1. **OTP Verification Failure**: Phone OTP completes but save still fails
2. **Silent Update Failure**: Fields show success but don't actually update database
3. **Validation Error**: Company details trigger "Validation failed" error
4. **Name Field Not Editable**: Representative name input not wired to save
5. **Duplicate Fields**: Phone, Email, Name shown multiple times causing confusion

**Root Cause**: Mismatch between frontend payload structure and backend validation schema + missing field mappings in PUT endpoint.

---

## Critical Bug Analysis

### Bug E1: OTP Verification Save Failure ⚠️ CRITICAL

**Symptoms:**
- User edits phone number
- Phone change detected (warning badge shown)
- User clicks "Save All Changes"
- ContactVerificationModal opens correctly
- User enters OTP successfully
- Success badge shows "New phone number verified"
- Auto-save triggers after 500ms
- **ERROR: "Failed to Save Changes" appears**

**Root Cause Analysis:**

**File:** `src/app/installer/(dashboard)/profile/page.tsx` (Lines 263-312)

```typescript
// D5: Save handler includes phone
const handleSaveAllChanges = async () => {
  const updateData: any = {
    services: editableVerification?.services,
    serviceAreas: editableVerification?.serviceAreas,
    postcodes: editableVerification?.postcodes,
    website: editableVerification?.website,
    socialLinks: editableVerification?.socialLinks,
    companyDescription: editableVerification?.companyDescription,
  };

  // D5: Include phone if changed and verified
  if (phoneChanged && phoneVerificationComplete) {
    updateData.phone = editedPhone;  // ← Phone added to payload
  }
```

**Backend Validation Schema:**  
**File:** `src/lib/validation/installer.ts` (Lines 76-87)

```typescript
export const installerProfileUpdateSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  businessAddress: z.string().min(5).max(300).optional(),
  postcode: z.string().regex(/^[0-9]{4}$/).optional(),
  services: z.array(servicesEnum).optional(),
  serviceAreas: z.array(serviceAreasEnum).optional(),
  postcodes: z.array(z.string().regex(/^[0-9]{4}$/)).optional(),
  website: z.string().url().optional().nullable(),
  socialLinks: socialLinksSchema,
  companyDescription: z.string().max(2000).optional().nullable(),
  logoKey: z.string().optional().nullable(),
  // ❌ MISSING: phone field not in schema!
});
```

**Backend API Handler:**  
**File:** `src/app/api/installer/profile/route.ts` (Lines 155-165)

```typescript
// Update InstallerVerification (editable fields after approval)
if (user.installerVerified) {
  const verification = await prisma.installerVerification.findUnique({
    where: { userId: user.id },
  });

  if (verification && verification.status === 'APPROVED') {
    const updateData: any = {};
    
    if (dataForPrisma.services) updateData.services = dataForPrisma.services;
    // ... other fields ...
    // ❌ MISSING: No phone update logic!
  }
}
```

**Diagnosis:**
1. Frontend sends `phone` in payload
2. Backend validation schema **rejects** unknown field `phone`
3. Zod throws validation error
4. Frontend catches error, shows "Failed to Save Changes"

**Additional Issues:**
- Phone update should target `User.phone` table, not `InstallerVerification.phone`
- Phone verification status (`User.phoneVerified`) must be set to `true`
- Original phone (`InstallerVerification.phone`) should also update for consistency

---

### Bug E2: Silent Update Failure ⚠️ CRITICAL

**Symptoms:**
- User edits any field (services, website, description, etc.)
- User clicks "Save All Changes"
- Success toast shows: "Profile updated successfully"
- Page reloads
- **Fields revert to original values (no actual update)**

**Root Cause Analysis:**

**File:** `src/app/installer/(dashboard)/profile/page.tsx` (Lines 263-312)

```typescript
const handleSaveAllChanges = async () => {
  const updateData: any = {
    services: editableVerification?.services,  // ← From state
    serviceAreas: editableVerification?.serviceAreas,
    postcodes: editableVerification?.postcodes,
    website: editableVerification?.website,
    socialLinks: editableVerification?.socialLinks,
    companyDescription: editableVerification?.companyDescription,
  };

  await updateProfile(updateData);  // ← Sends to API
```

**State Initialization:**  
**File:** `src/app/installer/(dashboard)/profile/page.tsx` (Lines 34-43)

```typescript
// F4: Track editable verification fields
const [editableVerification, setEditableVerification] = useState<any>(null);

useEffect(() => {
  if (verification) {
    setEditableVerification({
      services: verification.services,
      serviceAreas: verification.serviceAreas,
      postcodes: verification.postcodes,
      website: verification.website,
      socialLinks: verification.socialLinks,
      companyDescription: verification.companyDescription,
      // ❌ MISSING: companyName, representativeName, designation, abnOrLicense, establishedYear, employeeCount
    });
  }
}, [verification]);
```

**Input Fields:**  
**File:** `src/app/installer/(dashboard)/profile/page.tsx` (Lines 655-750)

```typescript
{/* Company Name - EDITABLE */}
<input
  type="text"
  value={editableVerification?.companyName || ''}
  onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, companyName: e.target.value }))}
  // ❌ Value updates in state BUT companyName not initialized in useEffect!
/>

{/* Representative Name - EDITABLE */}
<input
  type="text"
  value={editableVerification?.representativeName || ''}
  onChange={(e) => setEditableVerification((prev: any) => ({ ...prev!, representativeName: e.target.value }))}
  // ❌ Same issue - not initialized!
/>
```

**Diagnosis:**
1. User edits `companyName` → updates `editableVerification.companyName` in state
2. `handleSaveAllChanges` sends payload: `{ services: [...], companyName: "NewName" }`
3. Backend receives payload, validates successfully
4. Backend updates `InstallerVerification` with `companyName: "NewName"` ✅
5. **BUT**: Frontend calls `loadProfile()` after save
6. `loadProfile()` re-initializes `editableVerification` from `verification`
7. `useEffect` **overwrites** `companyName` with original value because it's not in initialization list!

**Result:** User sees success toast but fields revert. Database **may** have been updated but frontend state resets.

---

### Bug E3: Company Details Validation Error ⚠️ CRITICAL

**Symptoms:**
- User edits company details (name, rep name, designation, ABN, year, employee count)
- User clicks "Save All Changes"
- **ERROR: "Failed to Save Changes - Validation failed"**

**Root Cause Analysis:**

**Backend Validation Schema:**  
**File:** `src/lib/validation/installer.ts` (Lines 76-87)

```typescript
export const installerProfileUpdateSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  // ... other fields ...
  // ❌ MISSING: representativeName, designation, abnOrLicense, establishedYear, employeeCount
});
```

**Diagnosis:**
1. Frontend sends: `{ companyName: "X", representativeName: "Y", designation: "Z", abnOrLicense: "123", establishedYear: 2020, employeeCount: 5 }`
2. Backend validation **rejects** unknown fields: `representativeName`, `designation`, `abnOrLicense`, `establishedYear`, `employeeCount`
3. Zod throws validation error with message: "Validation failed"
4. Frontend shows error banner

**Additional Issue:**
- Even if validation passed, backend PUT handler doesn't update these fields (Lines 155-175 of route.ts)
- Logic only updates: `services`, `serviceAreas`, `postcodes`, `website`, `socialLinks`, `companyDescription`, `logoKey`

---

### Bug E4: Name Field Not Editable (User Flow Confusion) ⚠️ HIGH

**Symptoms:**
- User sees "Name" field in Personal Details section
- Field shows user.name (from User table)
- Field is NOT editable in edit mode (displays as text, not input)
- User expects to edit but cannot

**Root Cause Analysis:**

**File:** `src/app/installer/(dashboard)/profile/page.tsx` (Lines 587-596)

```typescript
<div>
  <label className="block text-body-small text-muted-foreground mb-1">Name</label>
  {isEditingProfile ? (
    <input
      type="text"
      defaultValue={user.name || ''}  // ← Uses defaultValue, not controlled!
      className="w-full rounded-xl ..."
      // ❌ No onChange handler! No state binding!
    />
  ) : (
    <p>{verification?.representativeName || user.name || 'Not provided'}</p>
  )}
</div>
```

**Diagnosis:**
1. Input uses `defaultValue` instead of `value` + `onChange`
2. No state variable to track name changes
3. No save logic for name field
4. User can type but value is discarded on save

**User's Request:**
> "Personal Details area, name cant be edited, I do not need the name to be uneditable. it should be editable."

**Expected Behavior:**
- Name should be editable
- Name should update `User.name` (account-level name)
- OR remove "Name" field entirely and only show "Representative Name" in Company Details

---

### Bug E5: Duplicate Fields Causing Confusion ⚠️ HIGH

**Symptoms:**
- User sees **2 phone fields**: One in Personal Details, one in Company Details
- User sees **2 email fields**: One in Personal Details, one in Company Details
- User sees **2 name fields**: "Name" in Personal Details, "Representative Name" in Company Details
- User confused which field to edit

**File:** `src/app/installer/(dashboard)/profile/page.tsx`

**Duplicate #1: Phone**
- **Location 1 (Personal Details):** Lines 600-635
  - Shows: `verification?.phone || user.phone`
  - Editable: YES (connected to OTP verification)
  - Functionality: **WORKING** ✅
- **Location 2 (Company Details):** Lines 710-715
  - Shows: `verification?.phone || user.phone`
  - Editable: NO (read-only)
  - Functionality: **DUPLICATE** ❌

**Duplicate #2: Email**
- **Location 1 (Personal Details):** Lines 598-601
  - Shows: `user.email`
  - Editable: NO (intentionally read-only for security)
  - Functionality: **PRIMARY** ✅
- **Location 2 (Company Details):** Lines 696-702
  - Label: "Representative Email (from account)"
  - Shows: `user.email`
  - Editable: NO
  - Functionality: **DUPLICATE** ❌

**Duplicate #3: Name**
- **Location 1 (Personal Details):** Lines 587-596
  - Label: "Name"
  - Shows: `verification?.representativeName || user.name`
  - Editable: YES (but broken - see Bug E4)
  - Source: `User.name` (account name)
  - Functionality: **CONFUSED** ❌
- **Location 2 (Company Details):** Lines 670-683
  - Label: "Representative Name"
  - Shows: `verification?.representativeName`
  - Editable: YES (working)
  - Source: `InstallerVerification.representativeName` (business representative)
  - Functionality: **PRIMARY** ✅

**User's Request:**
> "remove the duplicate fields and keep only one field for each data point. but make sure to keep those which is functional. e.g the Contact number field which is connected with the OTP verification should be kept. E.g There is only 1 option to input user name which is the representative name , but there is a name field in personal details which is fetching the same name. so just keep the Representative name filed."

**Required Action:**
- **Phone:** Remove from Company Details, keep Personal Details (has OTP functionality)
- **Email:** Remove from Company Details, keep Personal Details
- **Name:** Remove "Name" from Personal Details, keep "Representative Name" in Company Details

---

## Data Flow Analysis

### Current (Broken) Flow

```
[User Input] → [editableVerification State] → [handleSaveAllChanges] → [updateProfile API]
     ↓                                              ↓
   onChange                                  { services, areas, postcodes,
     ↓                                         website, socialLinks, description,
setEditableVerification({                     companyName, repName, designation,  ← Includes fields
  ...prev, field: value })                    abn, year, employees, phone }
                                                       ↓
                                            [PUT /api/installer/profile]
                                                       ↓
                                           [installerProfileUpdateSchema validation]
                                                       ↓
                                              ❌ REJECT: Unknown fields
                                              (phone, repName, designation, abn, year, employees)
```

### Expected (Fixed) Flow

```
[User Input] → [State Variables] → [handleSaveAllChanges] → [updateProfile API]
     ↓              ↓                         ↓
   onChange    editableVerification    { services, areas, postcodes,
     ↓              ↓                     website, socialLinks, description,
  Updates all   editedPhone              companyName, repName, designation,
  fields in     editedName               abn, year, employees }
  state                                          ↓
                                      [PUT /api/installer/profile]
                                                 ↓
                                    [UPDATED installerProfileUpdateSchema]
                                    (includes ALL editable fields + phone)
                                                 ↓
                                           ✅ VALIDATE
                                                 ↓
                                    [Update InstallerVerification]
                                    [Update User.phone if changed]
                                    [Update User.phoneVerified if OTP completed]
                                                 ↓
                                    [Return success with updated data]
                                                 ↓
                                         [Frontend reloads]
                                         [State syncs with DB]
                                         [Show success toast]
```

---

## Phase E Task Breakdown

### Task E1: Fix OTP Phone Save (CRITICAL) ⚠️
**Priority:** CRITICAL  
**Estimated Time:** 2 hours  
**Blocking:** User cannot update phone number at all

**Changes Required:**

1. **Update Validation Schema** (`src/lib/validation/installer.ts`):
```typescript
export const installerProfileUpdateSchema = z.object({
  // ... existing fields ...
  phone: phoneE164Schema.optional(),  // ← ADD phone field
});
```

2. **Update API Route** (`src/app/api/installer/profile/route.ts`):
```typescript
// After validation, handle phone update
if (dataForPrisma.phone) {
  // Update User.phone (account-level)
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      phone: dataForPrisma.phone,
      phoneVerified: true,  // ← Mark as verified (OTP already completed)
    },
  });
  
  // Update InstallerVerification.phone (consistency)
  if (verification) {
    updateData.phone = dataForPrisma.phone;
  }
}
```

3. **Test Cases:**
- Change phone → Enter OTP → Verify auto-save succeeds
- Reload page → Phone shows new value
- Check `user.phoneVerified` = true
- Check `verification.phone` matches new phone

---

### Task E2: Fix Company Details Fields (CRITICAL) ⚠️
**Priority:** CRITICAL  
**Estimated Time:** 2 hours  
**Blocking:** User cannot update any company information

**Changes Required:**

1. **Update Validation Schema** (`src/lib/validation/installer.ts`):
```typescript
export const installerProfileUpdateSchema = z.object({
  // ... existing fields ...
  companyName: z.string().min(2).max(200).optional(),  // ← Already exists
  representativeName: z.string().min(2).max(100).optional(),  // ← ADD
  designation: z.string().min(2).max(100).optional(),  // ← ADD
  abnOrLicense: z.string().min(9).max(50).optional(),  // ← ADD
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),  // ← ADD
  employeeCount: z.number().int().min(1).max(10000).optional(),  // ← ADD
});
```

2. **Update State Initialization** (`profile/page.tsx`):
```typescript
useEffect(() => {
  if (verification) {
    setEditableVerification({
      services: verification.services,
      serviceAreas: verification.serviceAreas,
      postcodes: verification.postcodes,
      website: verification.website,
      socialLinks: verification.socialLinks,
      companyDescription: verification.companyDescription,
      // ADD these fields:
      companyName: verification.companyName,
      representativeName: verification.representativeName,
      designation: verification.designation,
      abnOrLicense: verification.abnOrLicense,
      establishedYear: verification.establishedYear,
      employeeCount: verification.employeeCount,
    });
  }
}, [verification]);
```

3. **Update Save Payload** (`profile/page.tsx`):
```typescript
const updateData: any = {
  services: editableVerification?.services,
  serviceAreas: editableVerification?.serviceAreas,
  postcodes: editableVerification?.postcodes,
  website: editableVerification?.website,
  socialLinks: editableVerification?.socialLinks,
  companyDescription: editableVerification?.companyDescription,
  // ADD these fields:
  companyName: editableVerification?.companyName,
  representativeName: editableVerification?.representativeName,
  designation: editableVerification?.designation,
  abnOrLicense: editableVerification?.abnOrLicense,
  establishedYear: editableVerification?.establishedYear,
  employeeCount: editableVerification?.employeeCount,
};
```

4. **Update API Handler** (`route.ts`):
```typescript
if (dataForPrisma.companyName) updateData.companyName = dataForPrisma.companyName;
if (dataForPrisma.representativeName) updateData.representativeName = dataForPrisma.representativeName;
if (dataForPrisma.designation) updateData.designation = dataForPrisma.designation;
if (dataForPrisma.abnOrLicense) updateData.abnOrLicense = dataForPrisma.abnOrLicense;
if (dataForPrisma.establishedYear) updateData.establishedYear = dataForPrisma.establishedYear;
if (dataForPrisma.employeeCount) updateData.employeeCount = dataForPrisma.employeeCount;
```

5. **Test Cases:**
- Edit company name → Save → Verify update
- Edit representative name → Save → Verify update
- Edit designation → Save → Verify update
- Edit ABN → Save → Verify update
- Edit established year → Save → Verify update
- Edit employee count → Save → Verify update
- Check admin view shows all updates

---

### Task E3: Remove Duplicate Fields (HIGH) ⚠️
**Priority:** HIGH  
**Estimated Time:** 1 hour  
**Blocking:** User confusion, poor UX

**Changes Required:**

**File:** `src/app/installer/(dashboard)/profile/page.tsx`

1. **Remove "Name" field from Personal Details** (Lines 587-596):
```typescript
// DELETE entire <div> block:
<div>
  <label>Name</label>
  {isEditingProfile ? (
    <input type="text" defaultValue={user.name || ''} />
  ) : (
    <p>{verification?.representativeName || user.name || 'Not provided'}</p>
  )}
</div>
```

2. **Remove "Representative Email" from Company Details** (Lines 696-702):
```typescript
// DELETE entire <div> block:
<div>
  <label>Representative Email <span>(from account)</span></label>
  <p>{user.email}</p>
</div>
```

3. **Remove "Representative Phone" from Company Details** (Lines 710-715):
```typescript
// DELETE entire <div> block:
<div>
  <label>Representative Phone</label>
  <p>{verification?.phone || user.phone || 'Not provided'}</p>
</div>
```

4. **Update Personal Details grid** (Lines 587-641):
- Before: 3 fields (Name, Email, Phone) in 2-column grid
- After: 2 fields (Email, Phone) in 2-column grid
- Result: Clean layout, no duplicates

5. **Test Cases:**
- Verify Personal Details shows: Email (read-only), Phone (editable with OTP)
- Verify Company Details shows: Company Name, Representative Name, Designation, ABN, Year, Employees
- Verify no duplicate fields anywhere
- Verify all editable fields save correctly

---

### Task E4: Fix Name Field Editability (MEDIUM) 🔧
**Priority:** MEDIUM (Can be done after E3 if "Name" is removed)  
**Estimated Time:** 30 minutes  
**Blocking:** Only if keeping "Name" field

**Option A:** Remove "Name" field (RECOMMENDED - see E3)

**Option B:** Fix "Name" field to be properly editable:

**Changes Required:**

1. **Add State Variable** (`profile/page.tsx`):
```typescript
const [editedName, setEditedName] = useState<string>('');

useEffect(() => {
  if (user.name) {
    setEditedName(user.name);
  }
}, [user.name]);
```

2. **Update Input** (`profile/page.tsx`):
```typescript
<input
  type="text"
  value={editedName}
  onChange={(e) => setEditedName(e.target.value)}
  className="..."
/>
```

3. **Update Save Handler** (`profile/page.tsx`):
```typescript
// Update User.name (separate from verification fields)
if (editedName !== user.name) {
  await fetch('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify({ name: editedName }),
  });
}
```

4. **Create New API Route** (`src/app/api/user/profile/route.ts`):
```typescript
// PUT /api/user/profile
// Update User.name only
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  
  await prisma.user.update({
    where: { email: session.user.email },
    data: { name: body.name },
  });
  
  return NextResponse.json({ success: true });
}
```

**Recommendation:** Go with Option A (remove field) to avoid complexity.

---

### Task E5: Add Field-Level Error Feedback (ENHANCEMENT) 🎨
**Priority:** LOW  
**Estimated Time:** 1 hour  
**Optional Enhancement**

**Changes Required:**

1. **Parse Zod Error Issues** (`profile/page.tsx`):
```typescript
const handleSaveAllChanges = async () => {
  try {
    await updateProfile(updateData);
  } catch (error: any) {
    if (error.status === 400 && error.data?.issues) {
      // Zod validation errors
      const fieldErrors: Record<string, string> = {};
      error.data.issues.forEach((issue: any) => {
        const field = issue.path[0];
        fieldErrors[field] = issue.message;
      });
      setFieldErrors(fieldErrors);  // New state variable
      setSaveError('Please fix the errors below');
    } else {
      setSaveError(getErrorMessage(error));
    }
  }
};
```

2. **Display Field Errors** (below each input):
```typescript
{fieldErrors.companyName && (
  <p className="text-body-small text-error mt-1">{fieldErrors.companyName}</p>
)}
```

3. **Test Cases:**
- Submit invalid postcode → See error below postcode input
- Submit invalid year → See error below year input
- Submit empty required field → See error below field

---

### Task E6: Add Admin Sync Logging (TESTING SUPPORT) 🔍
**Priority:** LOW  
**Estimated Time:** 30 minutes  
**Helps with D8 testing**

**Changes Required:**

1. **Add Console Logging** (`route.ts`):
```typescript
// Before update
console.log('[Profile Update] User ID:', user.id);
console.log('[Profile Update] Payload:', JSON.stringify(dataForPrisma, null, 2));

// After update
console.log('[Profile Update] Success - Updated InstallerVerification');
```

2. **Add Update Timestamp Log** (`route.ts`):
```typescript
// Return updated data for frontend verification
return NextResponse.json({
  success: true,
  message: 'Profile updated successfully',
  updatedAt: new Date().toISOString(),
  updatedFields: Object.keys(updateData),
});
```

3. **Test Cases:**
- Check dev console for update logs
- Verify `updatedFields` array in network tab
- Verify `updatedAt` timestamp

---

## Testing Plan

### Pre-Testing Checklist

1. **Backup Current State:**
```powershell
git add .; git commit -m "Pre Phase E backup"
```

2. **Create Phase E Branch:**
```powershell
git checkout -b phase-e-critical-fixes
```

3. **Install Dependencies:**
```powershell
npm install
```

4. **Start Dev Server:**
```powershell
npm run dev
```

5. **Open Two Browser Sessions:**
- Session A: Installer at `http://localhost:3001/installer/profile`
- Session B: Admin at `http://localhost:3001/admin/installers/[id]`

---

### Test Case Matrix

| Test ID | Scenario | Expected Result | Priority |
|---------|----------|-----------------|----------|
| **E1.1** | Change phone → Enter OTP → Auto-save | Success toast, phone updated in DB | CRITICAL |
| **E1.2** | Change phone without OTP → Click save | Error: "Verify phone first" | CRITICAL |
| **E1.3** | Check admin view after phone change | Admin sees new phone number | CRITICAL |
| **E2.1** | Edit company name → Save | Success toast, DB updated, admin sees change | CRITICAL |
| **E2.2** | Edit representative name → Save | Success toast, DB updated, admin sees change | CRITICAL |
| **E2.3** | Edit designation → Save | Success toast, DB updated, admin sees change | CRITICAL |
| **E2.4** | Edit ABN → Save | Success toast, DB updated, admin sees change | CRITICAL |
| **E2.5** | Edit year → Save | Success toast, DB updated, admin sees change | CRITICAL |
| **E2.6** | Edit employee count → Save | Success toast, DB updated, admin sees change | CRITICAL |
| **E3.1** | Check Personal Details section | Only Email + Phone (no Name field) | HIGH |
| **E3.2** | Check Company Details section | No duplicate Email/Phone fields | HIGH |
| **E3.3** | Count total field instances | 1 Email, 1 Phone (editable), 1 Rep Name | HIGH |
| **E4.1** | (If keeping Name) Edit name → Save | Name updates in User table | MEDIUM |
| **E5.1** | Submit invalid postcode format | Field-level error shown | LOW |
| **E5.2** | Submit invalid year | Field-level error shown | LOW |

---

## Success Criteria

### Phase E Complete When:

1. **Bug E1 (OTP Phone):**
   - ✅ User can change phone number
   - ✅ OTP verification completes successfully
   - ✅ Auto-save after OTP succeeds (no error)
   - ✅ Phone updates in `User.phone`
   - ✅ Phone updates in `InstallerVerification.phone`
   - ✅ `User.phoneVerified` set to `true`
   - ✅ Admin view shows new phone number

2. **Bug E2 (Company Fields):**
   - ✅ User can edit all 6 company fields (name, rep name, designation, ABN, year, employees)
   - ✅ Save succeeds without validation error
   - ✅ All fields persist after page reload
   - ✅ Admin view shows all updated fields
   - ✅ Database records match frontend display

3. **Bug E3 (Duplicates):**
   - ✅ Personal Details shows: Email (read-only), Phone (editable)
   - ✅ Company Details shows: Company Name, Rep Name, Designation, ABN, Year, Employees
   - ✅ No duplicate Email, Phone, or Name fields anywhere
   - ✅ UI is clean and unambiguous

4. **Bug E4 (Name):**
   - ✅ "Name" field removed from Personal Details (Option A)
   - OR ✅ "Name" field properly editable and saves to User.name (Option B)

5. **General:**
   - ✅ All TypeScript compiles (0 new errors)
   - ✅ All semantic checks pass (0/0/0/0/0/0)
   - ✅ Build succeeds (`npm run build`)
   - ✅ All Phase E tasks committed separately
   - ✅ Documentation updated (tasks.md, gitstatus.md)

---

## Rollback Plan

If Phase E introduces new bugs:

1. **Immediate Rollback:**
```powershell
git reset --hard HEAD~1  # Undo last commit
npm run dev              # Restart server
```

2. **Restore Pre-Phase-E State:**
```powershell
git checkout main-secondary
git branch -D phase-e-critical-fixes
npm run dev
```

3. **Database Rollback:**
```powershell
# If needed, restore from backup
docker-compose down
docker volume rm solarmatch_postgres_data
docker-compose up -d
npm run prisma:migrate:deploy
npm run prisma:seed
```

---

## Appendix: API Payload Examples

### Current (Broken) Payload

```json
{
  "services": ["Residential Solar", "Battery Storage"],
  "serviceAreas": ["Sydney", "Melbourne"],
  "postcodes": ["2000", "2001"],
  "website": "https://example.com",
  "socialLinks": {
    "facebook": "https://facebook.com/example",
    "instagram": null,
    "linkedin": null,
    "youtube": null
  },
  "companyDescription": "Leading solar provider",
  "phone": "+61401234567",  // ← REJECTED by validation
  "companyName": "Solar Pro",  // ← Not in payload sent by frontend
  "representativeName": "John Smith",  // ← REJECTED by validation
  "designation": "Director",  // ← REJECTED by validation
  "abnOrLicense": "12345678901",  // ← REJECTED by validation
  "establishedYear": 2020,  // ← REJECTED by validation
  "employeeCount": 10  // ← REJECTED by validation
}
```

### Fixed Payload (After Phase E)

```json
{
  "services": ["Residential Solar", "Battery Storage"],
  "serviceAreas": ["Sydney", "Melbourne"],
  "postcodes": ["2000", "2001"],
  "website": "https://example.com",
  "socialLinks": {
    "facebook": "https://facebook.com/example",
    "instagram": null,
    "linkedin": null,
    "youtube": null
  },
  "companyDescription": "Leading solar provider",
  "phone": "+61401234567",  // ← ACCEPTED ✅
  "companyName": "Solar Pro",  // ← ACCEPTED ✅
  "representativeName": "John Smith",  // ← ACCEPTED ✅
  "designation": "Director",  // ← ACCEPTED ✅
  "abnOrLicense": "12345678901",  // ← ACCEPTED ✅
  "establishedYear": 2020,  // ← ACCEPTED ✅
  "employeeCount": 10  // ← ACCEPTED ✅
}
```

### Backend Update Result

```typescript
// InstallerVerification table update
{
  services: ["Residential Solar", "Battery Storage"],
  serviceAreas: ["Sydney", "Melbourne"],
  postcodes: ["2000", "2001"],
  website: "https://example.com",
  socialLinks: { facebook: "...", ... },
  companyDescription: "Leading solar provider",
  phone: "+61401234567",  // ← Updated ✅
  companyName: "Solar Pro",  // ← Updated ✅
  representativeName: "John Smith",  // ← Updated ✅
  designation: "Director",  // ← Updated ✅
  abnOrLicense: "12345678901",  // ← Updated ✅
  establishedYear: 2020,  // ← Updated ✅
  employeeCount: 10,  // ← Updated ✅
  updatedAt: "2025-11-20T16:30:00.000Z"
}

// User table update (for phone)
{
  phone: "+61401234567",  // ← Updated ✅
  phoneVerified: true,  // ← Updated ✅
}
```

---

## Estimated Timeline

| Task | Priority | Time | Dependencies |
|------|----------|------|--------------|
| E1: OTP Phone Save | CRITICAL | 2h | None |
| E2: Company Fields | CRITICAL | 2h | None |
| E3: Remove Duplicates | HIGH | 1h | E2 complete |
| E4: Fix Name (if kept) | MEDIUM | 30min | E3 complete |
| E5: Field Errors | LOW | 1h | E1, E2 complete |
| E6: Admin Logging | LOW | 30min | E1, E2 complete |
| **Testing & QA** | - | 1.5h | All tasks complete |
| **Documentation** | - | 30min | Testing complete |
| **TOTAL** | - | **8.5h** | - |

**Critical Path:** E1 + E2 + E3 + Testing = 6.5 hours

**Recommended Execution Order:** E1 → E2 → E3 → Test → E5 → E6 → E4 (optional)

---

## Next Steps

1. **Create Phase E in tasks.md** with E1-E6 tasks
2. **Commit this audit document**
3. **Start with E1 (OTP Phone Save)** - highest priority
4. **Test after each task** - don't batch fixes
5. **Commit after each task** - atomic commits for rollback safety
6. **Update gitstatus.md** after each commit

**Approval Required:** Yes - Critical bugs blocking production
**Estimated Completion:** November 21, 2025 (1 full working day)
