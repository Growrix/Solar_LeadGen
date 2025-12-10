# Address Field Addition - Comprehensive Audit Report

**Date:** November 22, 2025  
**Phase:** F14 - Address Field Implementation  
**Status:** Audit Complete, Ready for Implementation

---

## Executive Summary

This audit identifies the complete scope of work required to add an "Address" input field to the installer verification workflow. The field must be added after the contact number field in all relevant locations: verification form, profile page, and admin review modal. Additionally, the admin installers table must display this address data.

---

## Current State Analysis

### 1. Database Schema (Prisma)

**File:** `prisma/schema.prisma`

#### InstallerVerification Model (Lines 514-545)
```prisma
model InstallerVerification {
  id                  String   @id @default(cuid())
  userId              String   @unique
  companyName         String
  representativeName  String
  designation         String
  email               String
  phone               String
  abnOrLicense        String
  establishedYear     Int
  employeeCount       Int
  services            String[]
  serviceAreas        String[]
  postcodes           String[]
  website             String?
  socialLinks         Json?
  companyDescription  String?
  licenseDocKey       String?
  abnDocKey           String?
  logoKey             String?
  status              String   @default("PENDING")
  adminNotes          String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Finding:** ❌ **Missing `address` field** in InstallerVerification model.

#### InstallerProfile Model (Lines 468-481)
```prisma
model InstallerProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  companyName       String
  businessAddress   String
  postcode          String
  operationalStatus String   @default("ACTIVE")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Finding:** ✅ **businessAddress exists** in InstallerProfile model but is bootstrap-only (set to 'Pending Address' during verification submit).

---

### 2. Frontend Components

#### A. Verification Form Modal

**File:** `src/components/installer/VerificationModal.tsx`

**Current Schema (Lines 18-46):**
```typescript
const verificationSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  representativeName: z.string().min(2, 'Representative name is required'),
  designation: z.string().min(2, 'Designation is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^\+61[0-9]{9}$/, 'Phone must be in E.164 format (+61XXXXXXXXX)'),
  abnOrLicense: z.string().min(5, 'ABN or License number is required'),
  establishedYear: z.number().min(1900).max(new Date().getFullYear(), 'Valid year required'),
  employeeCount: z.number().min(1, 'At least 1 employee required'),
  licenseDocKey: z.string().optional(),
  abnDocKey: z.string().optional(),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  serviceAreas: z.array(z.string()).min(1, 'Select at least one service area'),
  postcodes: z.array(z.string()).min(1, 'Enter at least one postcode'),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
  companyDescription: z.string().optional(),
  logoKey: z.string().optional(),
});
```

**Finding:** ❌ **Missing `address` field** in validation schema.

**Location where field should be added:** After "Contact Number" field (Line 337), before "Business Legal Information" section (Line 352).

---

#### B. Installer Profile Page

**File:** `src/app/installer/(dashboard)/profile/page.tsx`

**Personal Details Section (Lines 675-738):**
- Email field (read-only)
- Phone field (editable with OTP verification)

**Company Details Section (Lines 740+):**
- Company Name (editable)
- Representative Name (editable)
- Designation (editable)
- ABN/License (editable)
- Other fields...

**Finding:** ❌ **No address field** currently displayed in Personal Details or Company Details sections.

**Expected Location:** After phone field in Personal Details section (around Line 730) or at top of Company Details section (around Line 755).

---

#### C. Admin Installer Details Modal

**File:** `src/app/admin/installers/[id]/page.tsx`

**Installer Summary Section (Lines 250-284):**
```tsx
<div>
  <label>Name</label>
  <p>{installer.name || 'Not provided'}</p>
</div>
<div>
  <label>Email</label>
  <p>{installer.email}</p>
</div>
<div>
  <label>Phone</label>
  <p>{installer.phone || 'Not provided'}</p>
</div>
<div>
  <label>Account Created</label>
  <p>{new Date(installer.createdAt).toLocaleDateString()}</p>
</div>
```

**Application Details Section (Lines 297-334):**
Shows verification data including:
- Company Name, Representative Name, Designation
- Contact Email, Contact Phone
- ABN/License, Established Year, Employee Count

**Finding:** ❌ **No address field** displayed in either Installer Summary or Application Details sections.

**Expected Location:** After "Contact Phone" field (around Line 332) in Application Details section.

---

#### D. Admin Installers Table

**File:** `src/components/admin/InstallersTable.tsx`

**Current Table Columns (Lines 211-228):**
1. Company / Contact
2. Email
3. Phone
4. Verified (Phone + Installer)
5. Registered
6. Status
7. Actions

**Finding:** ❌ **No Address column** in table. Currently fetches:
- `companyName` from User model (incorrect source)
- `name` from User model
- `businessAddress` exists in InstallerProfile but not displayed

**Expected:** Add Address column after Phone column or integrate into Company/Contact column.

---

### 3. Backend API Routes

#### A. Verification Submit Route

**File:** `src/app/api/installer/verification/submit/route.ts`

**Current Flow (Lines 35-94):**
1. Validates data with `installerVerificationSubmitSchema`
2. Creates/updates InstallerVerification record
3. Creates bootstrap InstallerProfile record with:
   - `companyName`
   - `businessAddress: 'Pending Address'` (hardcoded)
   - `postcode: validatedData.postcodes[0]`

**Finding:** ⚠️ **Hardcoded 'Pending Address'** instead of actual address from form.

---

#### B. Profile Update Route

**File:** `src/app/api/installer/profile/route.ts` (assumed, not directly inspected)

**Expected:** Should handle address field updates from profile edit form.

**Finding:** ❓ Needs verification during implementation phase.

---

#### C. Admin Installers List Route

**File:** `src/app/api/admin/installers/list/route.ts` (assumed)

**Current:** Fetches installer data including `businessAddress` from InstallerProfile.

**Finding:** ✅ Backend likely already returns `businessAddress`, but frontend doesn't display it.

---

### 4. Validation Schema

**File:** `src/lib/validation/installer.ts` (assumed location)

**Expected Schema Export:** `installerVerificationSubmitSchema`

**Finding:** ❌ Needs to include `address` field validation.

---

## Gap Analysis Summary

| Component | Location | Current State | Required Change |
|-----------|----------|---------------|-----------------|
| **Prisma Schema** | `InstallerVerification` model | ❌ No `address` field | Add `address String?` field |
| **Verification Form** | Zod schema | ❌ No `address` field | Add to validation schema |
| **Verification Form** | UI (after phone) | ❌ No input field | Add text input after Line 337 |
| **Profile Page** | Personal/Company Details | ❌ No address display | Add read-only/editable field |
| **Admin Review Modal** | Application Details | ❌ No address display | Add after "Contact Phone" |
| **Admin Table** | Table columns | ❌ No Address column | Add column or integrate into existing |
| **API: Verification Submit** | Bootstrap InstallerProfile | ⚠️ Hardcoded 'Pending Address' | Use actual address from form |
| **API: Profile Update** | PUT handler | ❓ Unknown | Verify address field handling |
| **Validation Schema** | Backend Zod schema | ❌ No `address` field | Add optional string validation |

---

## Root Causes

1. **Initial Oversight:** Address field was not included in original installer verification requirements.
2. **Incomplete Data Collection:** Verification form collects company name, phone, and postcodes but not physical address.
3. **Disconnected Data Sources:** InstallerProfile has `businessAddress` but is not populated from verification form—hardcoded instead.
4. **Frontend-Backend Misalignment:** Admin table fetches data from wrong source (User model instead of InstallerProfile/Verification).

---

## Implementation Plan

### Phase F14: Address Field Addition

#### Task F14.1: Update Database Schema ✅ Priority
- Add `address String?` to `InstallerVerification` model
- Run migration: `npx prisma migrate dev --name add_address_to_installer_verification`
- Regenerate Prisma client: `npx prisma generate`

#### Task F14.2: Update Backend Validation Schema
- **File:** `src/lib/validation/installer.ts`
- Add `address: z.string().min(5, 'Address is required').optional()` to `installerVerificationSubmitSchema`

#### Task F14.3: Update Verification Form Frontend
- **File:** `src/components/installer/VerificationModal.tsx`
- Add `address` field to Zod schema (Line 25)
- Add `address` to form state initialization (Line 51)
- Add Address input field after "Contact Number" (after Line 348, before Line 352)
- Ensure prefill works when `existingVerification` has address (Line 76)

#### Task F14.4: Update Profile Page Frontend
- **File:** `src/app/installer/(dashboard)/profile/page.tsx`
- Add address display in Company Details section (after Line 750)
- Add address edit capability in `editableVerification` state
- Ensure address is included in profile update payload

#### Task F14.5: Update Admin Review Modal Frontend
- **File:** `src/app/admin/installers/[id]/page.tsx`
- Add address display after "Contact Phone" (after Line 332)
- Format: `<div><label>Address</label><p>{verification.address || 'Not provided'}</p></div>`

#### Task F14.6: Update Verification Submit API
- **File:** `src/app/api/installer/verification/submit/route.ts`
- Replace hardcoded `'Pending Address'` with `validatedData.address || 'Not provided'` (Line 88)
- Ensure address is saved to InstallerVerification record

#### Task F14.7: Update Admin Installers Table
- **File:** `src/components/admin/InstallersTable.tsx`
- Option A: Add new Address column after Phone column
- Option B: Display address as subtitle in Company/Contact column
- Ensure API returns address data from InstallerProfile or InstallerVerification

#### Task F14.8: End-to-End Testing
- Submit new verification with address → verify saved to DB
- Edit existing verification with address → verify updated
- Edit profile address → verify updated in DB and admin view
- Check admin review modal displays address correctly
- Check admin table displays address correctly

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ VERIFICATION FORM SUBMISSION                                 │
│ (VerificationModal.tsx)                                      │
│                                                               │
│ User inputs:                                                 │
│ - Company Name                                               │
│ - Representative Name                                        │
│ - Email                                                      │
│ - Phone ✅                                                   │
│ - Address ❌ MISSING                                         │
│ - ABN/License                                                │
│ - ...other fields                                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ API: /api/installer/verification/submit                     │
│ (route.ts)                                                   │
│                                                               │
│ 1. Validates with installerVerificationSubmitSchema         │
│    ❌ Schema lacks 'address' field                           │
│                                                               │
│ 2. Creates/updates InstallerVerification record             │
│    ❌ Address not saved to DB                                │
│                                                               │
│ 3. Creates InstallerProfile bootstrap:                      │
│    businessAddress: 'Pending Address' ⚠️ HARDCODED          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (Prisma)                                            │
│                                                               │
│ InstallerVerification {                                      │
│   companyName, phone, email, ...                             │
│   ❌ address: NOT IN SCHEMA                                  │
│ }                                                             │
│                                                               │
│ InstallerProfile {                                           │
│   businessAddress: 'Pending Address' ⚠️                     │
│ }                                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ ADMIN REVIEW MODAL                                           │
│ (/admin/installers/[id]/page.tsx)                          │
│                                                               │
│ Displays:                                                    │
│ - Company Name                                               │
│ - Representative Name                                        │
│ - Email                                                      │
│ - Phone ✅                                                   │
│ - Address ❌ NOT DISPLAYED                                   │
│ - ABN/License                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PROFILE PAGE                                                 │
│ (/installer/profile/page.tsx)                               │
│                                                               │
│ Personal Details:                                            │
│ - Email ✅                                                   │
│ - Phone ✅                                                   │
│ - Address ❌ NOT DISPLAYED                                   │
│                                                               │
│ Company Details:                                             │
│ - Company Name ✅                                            │
│ - Representative Name ✅                                     │
│ - Designation ✅                                             │
│ - Address ❌ NOT DISPLAYED                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ADMIN INSTALLERS TABLE                                       │
│ (/admin/installers/page.tsx → InstallersTable.tsx)         │
│                                                               │
│ Columns:                                                     │
│ - Company / Contact ✅                                       │
│ - Email ✅                                                   │
│ - Phone ✅                                                   │
│ - Address ❌ NOT DISPLAYED                                   │
│ - Verified ✅                                                │
│ - Status ✅                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Requirements

### Field Specifications

**Field Name:** Address  
**Database Column:** `address` (InstallerVerification), `businessAddress` (InstallerProfile)  
**Type:** String, optional  
**Validation:**
- Minimum 5 characters
- Optional during verification submission (can be added later via profile edit)
- Should accept multiline input (street, city, state, postcode)

**UI Placement:**
- **Verification Form:** After "Contact Number", before "Business Legal Information"
- **Profile Page:** In "Company Details" section, after "Designation" or "Representative Name"
- **Admin Review Modal:** After "Contact Phone" in "Company & Representative" section
- **Admin Table:** New column or integrate into "Company / Contact"

**Frontend Implementation:**
```tsx
<div>
  <label htmlFor="address" className="block text-body-small text-foreground mb-2">
    Address <span className="text-error">*</span>
  </label>
  <textarea
    id="address"
    rows={3}
    value={formData.address || ''}
    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
    className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground shadow-neu-inset focus:ring-2 focus:ring-primary focus:border-transparent"
    placeholder="Street address, city, state, postcode"
  />
  {errors.address && <p className="text-error text-body-small mt-1">{errors.address}</p>}
</div>
```

---

## Success Criteria

✅ **Database:**
- InstallerVerification model has `address` field
- Migration applied successfully
- Existing records nullable (optional field)

✅ **Verification Form:**
- Address input field visible after phone number
- Validation works (min 5 characters if provided)
- Data saves correctly to InstallerVerification table
- Prefill works when editing verification

✅ **Profile Page:**
- Address displays in view mode (from InstallerVerification or InstallerProfile)
- Address editable in edit mode
- Profile update API saves address to both tables if needed

✅ **Admin Review Modal:**
- Address displays after "Contact Phone"
- Shows "Not provided" if empty
- Reflects latest verification data

✅ **Admin Installers Table:**
- Address column/field visible
- Data fetched from correct source (InstallerProfile or InstallerVerification)
- Searchable in search query

✅ **End-to-End:**
- New installer submits verification with address → saved to DB
- Existing installer edits address via profile → updated in DB
- Admin sees address in both table and details modal
- All changes reflected in real-time

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing verification submissions | High | Add field as optional, test with existing data |
| Data source confusion (InstallerVerification vs InstallerProfile) | Medium | Use InstallerVerification as source of truth, sync to InstallerProfile |
| Frontend validation inconsistency | Medium | Centralize validation in shared Zod schema |
| Admin table performance with new column | Low | Address already exists in InstallerProfile, no new query cost |

---

## Alignment with Constitution & Design System

- **Constitution Alignment:** Follows audit-first, test-after approach as per constitution.md
- **Theming:** Use semantic classes from global.css (`form-input`, `theme-card`, `text-foreground`, etc.)
- **No Hardcoding:** Replace 'Pending Address' with actual user input
- **Neumorphic Design:** Use `shadow-neu-inset` for inputs, `shadow-neu-outset` for cards
- **Responsive:** Ensure mobile view displays address properly
- **Accessibility:** Use proper `<label>` tags, placeholder text, error messages

---

## Next Steps

1. ✅ Review and approve this audit report
2. Create Phase F14 in `specs/006-component-by-component/tasks.md`
3. Execute Task F14.1: Update Prisma schema and run migration
4. Execute Tasks F14.2-F14.7: Frontend and backend updates
5. Execute Task F14.8: End-to-end testing
6. Commit changes with descriptive message
7. Update gitstatus.md

---

## Files to Modify

### High Priority (Breaking Changes)
1. `prisma/schema.prisma` - Add address field
2. `src/lib/validation/installer.ts` - Add address validation
3. `src/app/api/installer/verification/submit/route.ts` - Remove hardcoded address

### Medium Priority (UI Updates)
4. `src/components/installer/VerificationModal.tsx` - Add address input
5. `src/app/installer/(dashboard)/profile/page.tsx` - Display/edit address
6. `src/app/admin/installers/[id]/page.tsx` - Display address in review modal

### Low Priority (Enhancement)
7. `src/components/admin/InstallersTable.tsx` - Add address column
8. `src/app/api/installer/profile/route.ts` - Verify address handling in profile update

---

**Audit Completed By:** GitHub Copilot  
**Audit Review Required:** Yes  
**Ready for Implementation:** After approval and phase creation
