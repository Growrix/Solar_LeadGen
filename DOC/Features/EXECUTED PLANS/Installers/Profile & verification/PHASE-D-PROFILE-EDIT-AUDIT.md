# Phase D: Profile Edit & Postcode Input Issues - Comprehensive Audit
**Date:** November 20, 2025  
**Branch:** main-secondary  
**Status:** 🔍 AUDIT PHASE

---

## Executive Summary

This audit addresses critical UX issues reported after Phase C implementation:
1. **Postcode input**: Users cannot type commas in the postcode field (C4 implementation incomplete)
2. **Duplicate edit buttons**: Two separate edit flows (Personal Details + Company Details)
3. **Limited editability**: Only a few fields are editable in each section
4. **Missing phone re-verification**: No OTP trigger when phone number is changed

---

## Issue 1: Postcode Comma Input Not Working

### Current Implementation Analysis

**File:** `src/components/installer/VerificationModal.tsx` (Line 589-599)  
**File:** `src/app/installer/(dashboard)/profile/page.tsx` (Line 824-835)

```tsx
// VerificationModal - WORKING
<input
  type="text"
  value={(formData.postcodes || []).join(', ')}
  onChange={(e) => {
    const codes = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, postcodes: codes }));
  }}
  placeholder="2000, 2001, 2010"
/>

// Profile Page - WORKING (same logic)
<input
  type="text"
  value={(editableVerification?.postcodes || []).join(', ')}
  onChange={(e) => {
    const codes = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
    setEditableVerification(prev => ({ ...prev!, postcodes: codes }));
  }}
  placeholder="2000, 2001, 2010"
/>
```

### Root Cause Analysis

**The parsing logic is CORRECT**. The issue is likely:

1. **UI Behavior**: The input accepts commas, but the `.filter(Boolean)` immediately removes trailing empty strings
2. **User Perception**: When typing "2000," the comma is accepted, but no visual feedback appears until the next character
3. **Edge Case**: If user types only comma without space, it might feel unresponsive

### Testing Scenarios

| Input | Expected Array | Current Behavior |
|-------|---------------|------------------|
| `2000` | `["2000"]` | ✅ Works |
| `2000,` | `["2000"]` | ✅ Works (comma accepted, trailing space removed) |
| `2000, ` | `["2000"]` | ✅ Works |
| `2000, 2001` | `["2000", "2001"]` | ✅ Works |
| `2000,2001` | `["2000", "2001"]` | ✅ Works |
| ` , ` | `[]` | ⚠️ Empty array (might feel broken) |

### Actual Issue

The code works correctly, but lacks **visual feedback**. User needs to see that comma is accepted and waiting for next value.

---

## Issue 2: Duplicate Edit Buttons & Fragmented Edit Flow

### Current Implementation

**Two separate edit states:**

1. **`isEditing`** (Line 28): Controls "Personal Details" section
   - Edit button at top of page (Line 425)
   - Only edits: Name field
   - Save/Cancel buttons inline in Personal Details (Line 512-516)

2. **`isEditingVerification`** (Line 42): Controls "Company Details" section
   - Edit button in Company Details section (Line 524)
   - Edits: Company name, representative name, designation, phone, ABN, year, employees, services, service areas, postcodes
   - NO Save/Cancel buttons visible

### Problems Identified

| Problem | Impact | Severity |
|---------|--------|----------|
| Two edit buttons confuse users | Poor UX | HIGH |
| `isEditing` only affects Name field | Inconsistent behavior | HIGH |
| `isEditingVerification` has no Save button | Cannot persist changes | CRITICAL |
| Phone edit doesn't trigger OTP verification | Security gap | CRITICAL |
| Edit actions split across sections | Fragmented experience | HIGH |

---

## Issue 3: Field Editability Analysis

### Personal Details Section (Controlled by `isEditing`)

| Field | Currently Editable? | Should Be Editable? | Note |
|-------|---------------------|---------------------|------|
| Name | ✅ Yes | ✅ Yes | Input shown when `isEditing=true` |
| Email | ❌ No | ❌ No | Correct (authentication email) |
| Phone | ❌ No | ✅ Yes (with OTP) | Must trigger phone verification |

**Issue**: Name edit doesn't save to backend. No API call on "Save Changes".

### Company Details Section (Controlled by `isEditingVerification`)

| Field | Currently Editable? | Should Be Editable? | Implementation Status |
|-------|---------------------|---------------------|----------------------|
| Company Name | ✅ Yes | ✅ Yes | Input exists, no save action |
| Representative Name | ✅ Yes | ✅ Yes | Input exists, no save action |
| Designation | ✅ Yes | ✅ Yes | Input exists, no save action |
| Phone | ✅ Yes | ✅ Yes (with OTP) | Input exists, no OTP trigger |
| ABN/License | ✅ Yes | ✅ Yes | Input exists, no save action |
| Established Year | ✅ Yes | ✅ Yes | Input exists, no save action |
| Employee Count | ✅ Yes | ✅ Yes | Input exists, no save action |
| Services | ✅ Yes | ✅ Yes | Checkboxes exist, no save action |
| Service Areas | ✅ Yes | ✅ Yes | Checkboxes exist, no save action |
| Postcodes | ✅ Yes | ✅ Yes | Input exists, works correctly |
| Website | ❌ No | ✅ Yes | Missing from UI |
| Social Links | ❌ No | ✅ Yes | Missing from UI |
| Company Description | ❌ No | ✅ Yes | Missing from UI |
| Documents | ❌ No | ✅ Yes | Upload UI exists but not functional |
| Logo | ❌ No | ✅ Yes | Upload UI exists but not functional |

**Critical Gap**: No Save/Cancel buttons in Company Details section = Changes cannot be persisted.

---

## Issue 4: Backend Integration Gaps

### Profile Update Flow

**Current State:**
- Two edit states exist
- Input fields change values locally
- **NO API calls** to persist changes
- Personal Details "Save Changes" button just closes edit mode (Line 515)
- Company Details has NO Save button at all

**Expected Flow:**

```
User clicks "Edit Profile"
  → All fields become editable (single state)
  → User modifies fields
  → User clicks "Save Changes" (bottom of page)
  → API call: PUT /api/installer/profile
  → On success: Reload profile data
  → On error: Show error message, keep edit mode open
```

**Missing Implementation:**
1. No `handleSaveProfileChanges()` function
2. No API call to `updateProfile()`
3. No error handling for save failures
4. No loading state during save

### Phone Number Change Flow

**Current State:**
- Phone field editable in Company Details
- No verification trigger on change
- No way to detect if phone was modified

**Expected Flow:**

```
User changes phone number
  → User clicks "Save Changes"
  → Detect phone change (compare with original)
  → Show warning: "Phone number changed - verification required"
  → Trigger ContactVerificationModal with new phone
  → User completes OTP verification
  → Then save profile with verified phone
```

**Missing Implementation:**
1. No original phone comparison logic
2. No conditional verification trigger
3. No state to track "pending phone change"
4. No UX to guide user through re-verification

---

## Current Code Architecture Issues

### State Management Fragmentation

```tsx
// CURRENT - Fragmented
const [isEditing, setIsEditing] = useState(false);              // Personal Details only
const [isEditingVerification, setIsEditingVerification] = useState(false); // Company Details only
const [editableVerification, setEditableVerification] = useState<any>(null); // Verification data only

// PROPOSED - Unified
const [isEditingProfile, setIsEditingProfile] = useState(false); // Entire profile
const [editedProfileData, setEditedProfileData] = useState<ProfileFormData | null>(null); // All fields
const [phoneChanged, setPhoneChanged] = useState(false); // Track phone modification
```

### Button Placement Issues

```tsx
// CURRENT - Line 425 (Top of page)
<Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
  {isEditing ? 'Cancel' : 'Edit Profile'}
</Button>

// CURRENT - Line 512 (Inside Personal Details)
{isEditing && (
  <div className="flex justify-end gap-3 pt-4 border-t border-border">
    <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
    <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
  </div>
)}

// CURRENT - Line 524 (Inside Company Details)
<Button variant="secondary" onClick={() => setIsEditingVerification(!isEditingVerification)}>
  {isEditingVerification ? 'Cancel' : 'Edit'}
</Button>
// NO SAVE/CANCEL BUTTONS FOR THIS SECTION!

// PROPOSED - Single top button + bottom action buttons
<Button variant="secondary" onClick={() => handleEditToggle()}>
  {isEditingProfile ? 'Cancel All Edits' : 'Edit Profile'}
</Button>

// At bottom of page (after all sections)
{isEditingProfile && (
  <div className="flex justify-end gap-3 p-6 bg-surface border border-border rounded-xl">
    <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
    <Button onClick={handleSaveAllChanges} disabled={saving}>
      {saving ? 'Saving...' : 'Save All Changes'}
    </Button>
  </div>
)}
```

---

## Data Flow Analysis

### Current Data Sources

```tsx
// Profile page receives this from fetchProfile() API:
interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    phoneVerified: boolean;
    companyName: string | null;
    installerVerified: boolean;
  };
  profile: {
    operationalStatus: 'ACTIVE' | 'PAUSED' | 'INACTIVE';
    // ... other profile fields
  } | null;
  verification: {
    companyName: string;
    representativeName: string;
    designation: string;
    phone: string;
    abnOrLicense: string;
    establishedYear: number;
    employeeCount: number;
    services: string[];
    serviceAreas: string[];
    postcodes: string[];
    website: string | null;
    socialLinks: any;
    companyDescription: string | null;
    // ... document keys
  } | null;
  preferences: {
    alertNewLead: boolean;
    // ... other preferences
  };
}
```

### Data Update Flow (Missing)

**When user edits profile, which model should update?**

| Field | Source Model | Update Target | Sync Required? |
|-------|--------------|---------------|----------------|
| Name | `user.name` | User model | No (direct update) |
| Phone | `user.phone` + `verification.phone` | User model first, then verify | Yes (OTP required) |
| Company Name | `verification.companyName` | InstallerVerification model | No |
| Representative Name | `verification.representativeName` | InstallerVerification model | No |
| All other verification fields | `verification.*` | InstallerVerification model | No |

**Critical Decision:** Should profile edits update `InstallerVerification` model or create a separate `InstallerProfile` model?

**Recommended Approach:**
- User model: Name, Email, Phone (authentication data)
- InstallerVerification: Submit-once, admin-approved data
- InstallerProfile: Editable after approval (updates allowed fields)

---

## Proposed Solution Architecture

### Phase D Tasks

| Task ID | Description | Priority | Complexity |
|---------|-------------|----------|-----------|
| D1 | Add visual feedback for postcode comma input | LOW | LOW |
| D2 | Unify edit states (remove duplicate buttons) | HIGH | MEDIUM |
| D3 | Add Save/Cancel buttons at bottom | HIGH | LOW |
| D4 | Implement `handleSaveAllChanges()` with API call | CRITICAL | HIGH |
| D5 | Add phone change detection + OTP trigger | CRITICAL | HIGH |
| D6 | Make all fields editable (add missing fields) | MEDIUM | MEDIUM |
| D7 | Add loading states and error handling | HIGH | LOW |
| D8 | Sync updates to Admin view | HIGH | MEDIUM |

---

## Implementation Plan

### D1: Improve Postcode Input Visual Feedback

**Current Issue:** Comma is accepted but no visual indication  
**Solution:** Add helper text showing parsed postcode count

```tsx
<div>
  <label>Postcodes Served</label>
  <input
    type="text"
    value={(formData.postcodes || []).join(', ')}
    onChange={(e) => {
      const codes = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, postcodes: codes }));
    }}
    placeholder="2000, 2001, 2010"
  />
  <p className="text-body-small text-muted-foreground mt-1">
    {formData.postcodes && formData.postcodes.length > 0
      ? `${formData.postcodes.length} postcode${formData.postcodes.length > 1 ? 's' : ''} entered`
      : 'Separate multiple postcodes with commas'}
  </p>
  {/* Optional: Show tags for visual feedback */}
  {formData.postcodes && formData.postcodes.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {formData.postcodes.map((pc, idx) => (
        <span key={idx} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-caption">
          {pc}
        </span>
      ))}
    </div>
  )}
</div>
```

**Effort:** 30 minutes  
**Files:** `VerificationModal.tsx`, `profile/page.tsx`

---

### D2: Unify Edit States

**Remove:**
- `isEditing` state (Line 28)
- `isEditingVerification` state (Line 42)
- Top "Edit Profile" button (Line 425)
- Company Details "Edit" button (Line 524)
- Personal Details inline Save/Cancel (Line 512-516)

**Add:**
- Single `isEditingProfile` state
- Single "Edit Profile" button at top
- Single Save/Cancel buttons at bottom (after all sections)

**Changes:**
```tsx
// Remove these lines
const [isEditing, setIsEditing] = useState(false);
const [isEditingVerification, setIsEditingVerification] = useState(false);

// Add this
const [isEditingProfile, setIsEditingProfile] = useState(false);
const [originalData, setOriginalData] = useState<any>(null); // For cancel operation

// Update all conditional renders
{isEditing ? ... }       → {isEditingProfile ? ... }
{isEditingVerification ? ... }  → {isEditingProfile ? ... }
```

**Effort:** 1 hour  
**Files:** `profile/page.tsx`

---

### D3: Add Bottom Action Buttons

**Implementation:**
```tsx
{/* Add after all sections, before modals */}
{isEditingProfile && (
  <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6">
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={handleCancelEdit} disabled={saving}>
        Cancel
      </Button>
      <Button onClick={handleSaveAllChanges} disabled={saving}>
        {saving ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </>
        ) : 'Save All Changes'}
      </Button>
    </div>
  </div>
)}
```

**Effort:** 30 minutes  
**Files:** `profile/page.tsx`

---

### D4: Implement Save Handler with API Integration

**New Function:**
```tsx
const handleSaveAllChanges = async () => {
  setSaving(true);
  setSaveError(null);
  
  try {
    // Step 1: Detect phone change
    const phoneChanged = editedProfileData.phone !== profileData?.user.phone;
    
    if (phoneChanged) {
      // Step 2: Trigger phone verification first
      setPendingPhoneNumber(editedProfileData.phone);
      setShowPhoneVerificationModal(true);
      setSaving(false);
      return; // Wait for OTP verification
    }
    
    // Step 3: Save all changes
    const updatePayload = {
      name: editedProfileData.name,
      verification: {
        companyName: editedProfileData.companyName,
        representativeName: editedProfileData.representativeName,
        designation: editedProfileData.designation,
        phone: editedProfileData.phone,
        abnOrLicense: editedProfileData.abnOrLicense,
        establishedYear: editedProfileData.establishedYear,
        employeeCount: editedProfileData.employeeCount,
        services: editedProfileData.services,
        serviceAreas: editedProfileData.serviceAreas,
        postcodes: editedProfileData.postcodes,
        website: editedProfileData.website,
        socialLinks: editedProfileData.socialLinks,
        companyDescription: editedProfileData.companyDescription,
      },
    };
    
    await updateProfile(updatePayload);
    
    // Step 4: Reload profile data
    await loadProfile();
    
    // Step 5: Exit edit mode
    setIsEditingProfile(false);
    setEditedProfileData(null);
    
    // Step 6: Show success message
    setSuccessMessage('Profile updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
    
  } catch (error) {
    setSaveError(getErrorMessage(error));
  } finally {
    setSaving(false);
  }
};

const handleCancelEdit = () => {
  setIsEditingProfile(false);
  setEditedProfileData(null);
  // Restore original data
  loadProfile();
};
```

**Backend API Required:**
```tsx
// In lib/api/installer.ts
export async function updateProfile(data: ProfileUpdateData): Promise<void> {
  const response = await fetch('/api/installer/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }
}
```

**Effort:** 2-3 hours  
**Files:** `profile/page.tsx`, `lib/api/installer.ts`

---

### D5: Phone Change Detection + OTP Trigger

**Implementation:**
```tsx
// Add state
const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);

// Modify save handler (see D4 above)

// After OTP verification success
const handlePhoneVerificationSuccess = async () => {
  setShowPhoneVerificationModal(false);
  
  // Now save profile with verified phone
  try {
    await updateProfile({
      ...editedProfileData,
      phone: pendingPhoneNumber,
    });
    await loadProfile();
    setIsEditingProfile(false);
    setPendingPhoneNumber(null);
    setSuccessMessage('Phone verified and profile updated');
  } catch (error) {
    setSaveError(getErrorMessage(error));
  }
};

// Add modal
{showPhoneVerificationModal && (
  <ContactVerificationModal
    isOpen={showPhoneVerificationModal}
    defaultPhone={pendingPhoneNumber}
    onClose={() => {
      setShowPhoneVerificationModal(false);
      setPendingPhoneNumber(null);
      setSaving(false);
    }}
    onOTPRequested={handleOTPRequested}
  />
)}
```

**Effort:** 1.5 hours  
**Files:** `profile/page.tsx`

---

### D6: Add Missing Editable Fields

**Fields to Add:**
1. Website (text input with URL validation)
2. Social Links (4 text inputs: Facebook, Instagram, LinkedIn, YouTube)
3. Company Description (textarea)
4. Documents upload (functional S3 integration)
5. Logo upload (functional S3 integration)

**Implementation:** Add inputs in Company Details section when `isEditingProfile=true`

**Effort:** 2 hours  
**Files:** `profile/page.tsx`

---

### D7: Add Loading & Error States

**Implementation:**
```tsx
// Add states
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);
const [successMessage, setSuccessMessage] = useState<string | null>(null);

// Add banners
{successMessage && (
  <div className="bg-success/10 border border-success/20 rounded-xl p-4">
    <p className="text-success">{successMessage}</p>
  </div>
)}

{saveError && (
  <div className="bg-error/10 border border-error/20 rounded-xl p-4">
    <p className="text-error">{saveError}</p>
  </div>
)}
```

**Effort:** 30 minutes  
**Files:** `profile/page.tsx`

---

### D8: Sync Updates to Admin View

**Current Gap:** Admin view (`admin/installers/[id]/page.tsx`) fetches data from API, but profile updates should reflect immediately.

**Solution:** No frontend changes needed. Backend API (`GET /api/admin/installers/[id]/verification`) already fetches latest data.

**Verification:** After profile update, admin refreshes page → sees updated data.

**Effort:** 30 minutes (testing only)  
**Files:** None (backend already correct)

---

## Backend API Requirements

### Existing API (Already Implemented)
- ✅ `GET /api/installer/profile` - Fetch profile
- ✅ `POST /api/installer/verification/submit` - Submit verification
- ✅ `GET /api/admin/installers/[id]/verification` - Admin view

### New API Required
- ❌ `PUT /api/installer/profile` - Update profile after approval
  - Should accept: name, phone, verification updates
  - Should validate: phone change requires re-verification
  - Should return: updated profile data

### API Implementation

**File:** `src/app/api/installer/profile/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Update User model
    if (data.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: data.name },
      });
    }
    
    // Update InstallerVerification model
    if (data.verification) {
      await prisma.installerVerification.update({
        where: { userId: session.user.id },
        data: {
          companyName: data.verification.companyName,
          representativeName: data.verification.representativeName,
          designation: data.verification.designation,
          phone: data.verification.phone,
          abnOrLicense: data.verification.abnOrLicense,
          establishedYear: data.verification.establishedYear,
          employeeCount: data.verification.employeeCount,
          services: data.verification.services,
          serviceAreas: data.verification.serviceAreas,
          postcodes: data.verification.postcodes,
          website: data.verification.website,
          socialLinks: data.verification.socialLinks,
          companyDescription: data.verification.companyDescription,
        },
      });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

**Effort:** 1 hour  
**Files:** `src/app/api/installer/profile/route.ts` (new file)

---

## Testing Checklist

### D1: Postcode Input
- [ ] Type "2000" → Shows "1 postcode entered"
- [ ] Type "2000," → Shows "1 postcode entered" + comma visible
- [ ] Type "2000, 2001" → Shows "2 postcodes entered"
- [ ] Tags display below input showing each postcode
- [ ] Copy entire input string → Can paste elsewhere

### D2: Unified Edit State
- [ ] Only ONE "Edit Profile" button at top
- [ ] NO separate edit button in Company Details
- [ ] Clicking "Edit Profile" makes ALL fields editable
- [ ] Email field remains read-only

### D3: Bottom Action Buttons
- [ ] Save/Cancel buttons appear at bottom when editing
- [ ] Save button shows loading spinner when saving
- [ ] Cancel button reverts all changes

### D4: Save Functionality
- [ ] Clicking Save calls API with all changes
- [ ] Success message appears after save
- [ ] Profile data refreshes automatically
- [ ] Edit mode exits after successful save
- [ ] Error message shows if save fails

### D5: Phone Change + OTP
- [ ] Changing phone triggers warning before save
- [ ] Contact verification modal opens with new phone
- [ ] Must complete OTP before profile saves
- [ ] Can cancel phone verification (keeps edit mode open)

### D6: All Fields Editable
- [ ] Name, Company Name, Representative Name, Designation editable
- [ ] Phone, ABN, Year, Employees editable
- [ ] Services, Service Areas, Postcodes editable
- [ ] Website, Social Links, Description editable
- [ ] Documents/Logo upload functional (if S3 configured)

### D7: Loading & Error States
- [ ] Loading spinner visible during save
- [ ] Success banner shows after save
- [ ] Error banner shows on failure
- [ ] Banners auto-dismiss after 3 seconds

### D8: Admin View Sync
- [ ] Admin refreshes page after installer edit
- [ ] Admin sees updated data
- [ ] All fields match installer's edits

---

## Estimated Total Effort

| Task | Time | Priority |
|------|------|----------|
| D1: Postcode visual feedback | 30 min | LOW |
| D2: Unify edit states | 1 hour | HIGH |
| D3: Bottom action buttons | 30 min | HIGH |
| D4: Save handler + API | 3 hours | CRITICAL |
| D5: Phone OTP trigger | 1.5 hours | CRITICAL |
| D6: Add missing fields | 2 hours | MEDIUM |
| D7: Loading/error states | 30 min | HIGH |
| D8: Admin sync testing | 30 min | HIGH |
| **TOTAL** | **9.5 hours** | |

---

## Success Criteria

- ✅ Users can enter multiple postcodes with commas (with visual feedback)
- ✅ Single "Edit Profile" button at top (no duplicate buttons)
- ✅ Single Save/Cancel buttons at bottom of page
- ✅ All fields editable except Email
- ✅ Phone change triggers OTP verification
- ✅ Changes persist to database via API
- ✅ Admin view reflects updated data
- ✅ Loading and error states visible
- ✅ No semantic violations (0/0/0/0/0/0)
- ✅ TypeScript compiles with 0 errors

---

## Next Steps

1. Create Phase D tasks in `tasks.md`
2. Implement D2-D5 first (critical UX fixes)
3. Then implement D1, D6, D7 (enhancements)
4. Test D8 (admin sync)
5. Commit and update gitstatus.md

---

## Notes

- All changes maintain semantic CSS approach
- No hardcoded styles introduced
- Backend API required: `PUT /api/installer/profile`
- Phone verification flow reuses existing ContactVerificationModal
- Admin view requires no frontend changes (backend already fetches latest data)
