# Phase C: Verification Flow Enhancement Audit
**Date:** November 20, 2025  
**Branch:** main-secondary  
**Status:** 🔍 AUDIT PHASE

---

## Executive Summary

This audit addresses three enhancement requests for the installer verification workflow:
1. **Contact verification modal** not showing prefilled number for unverified profiles
2. **Auto-trigger contact verification** immediately after verification form submission
3. **Admin view optimization** - remove blank fields, show only fields with data
4. **Postcodes input** - allow comma-separated multiple entries

---

## Current State Analysis

### 1. Contact Verification Modal Flow

**Current Implementation:**
- Location: `src/components/homeowner/ContactVerificationModal.tsx`
- Props: `isOpen`, `onClose`, `defaultPhone?`, `onVerificationSuccess`
- Used in: Installer profile page

**Observed Behavior:**
- ✅ Shows prefilled number when profile is verified
- ❌ Does NOT show prefilled number when profile is unverified
- ❌ Does NOT auto-trigger after verification submission

**Root Cause Analysis:**

```typescript
// ContactVerificationModal.tsx interface
interface ContactVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;  // Optional prop
  onVerificationSuccess: () => void;
}
```

**Issue 1:** Profile page only passes `defaultPhone` when `user.phoneVerified === true`

```typescript
// Current profile page logic (hypothetical based on behavior)
{!user.phoneVerified && (
  <ContactVerificationModal
    isOpen={showContactModal}
    onClose={() => setShowContactModal(false)}
    // defaultPhone NOT passed when unverified ❌
    onVerificationSuccess={handleVerificationSuccess}
  />
)}
```

**Issue 2:** No auto-trigger mechanism after verification submission
- Verification submit handler: `src/app/api/installer/verification/submit/route.ts`
- Current: Returns success → Frontend shows success message → No phone modal trigger
- Expected: Returns success → Frontend triggers phone verification modal with submitted phone

---

### 2. Admin Verification View - Blank Fields

**Current Implementation:**
- Location: `src/app/admin/installers/[id]/page.tsx`
- Displays ALL fields from verification schema
- Shows "Not provided" or blank for optional fields

**Fields Always Displayed:**
```typescript
// Company Logo (even if logoKey is null)
{verification?.logoKey && (
  <div className="...">Logo Preview</div>
)}

// Website (even if null)
{verification.website && (
  <div>Website...</div>
)}

// Social Links (shows section even if all null)
{(verification.website || verification.socialLinks || verification.companyDescription) && (
  <div>Additional Information</div>
)}
```

**Issue:** Conditional rendering exists but **entire sections** still show when partially empty

**Observed in Screenshot:**
- Name: "Not provided" (no verification data submitted yet)
- Phone: "Not provided"
- Empty sections taking up space

---

### 3. Postcodes Input Field

**Current Implementation:**
- Location: `src/components/installer/VerificationModal.tsx`
- Input type: Single text input
- Current handler: Unknown (needs verification)

**Expected Behavior:**
- Input: "5000, 5001, 5002"
- Parse: Split by comma → ["5000", "5001", "5002"]
- Store: Array in `verification.postcodes`

**Current Schema:**
```typescript
postcodes: z.array(z.string()).min(1, 'Enter at least one postcode')
```

**Missing:** 
- Input parsing logic to split comma-separated values
- Visual feedback for multiple entries (tags/chips)
- Validation for postcode format

---

## Data Flow Audit

### Verification Submission Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Installer Profile Page                                       │
│    - Click "Get Verified" button                                │
│    - VerificationModal opens                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. VerificationModal (Form Submission)                          │
│    - User fills form including phone: "+61401731250"            │
│    - Click "Submit Application"                                 │
│    - POST /api/installer/verification/submit                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Backend: /api/installer/verification/submit/route.ts         │
│    - Validates data                                              │
│    - Creates/updates InstallerVerification record                │
│    - Returns: { success: true, message: "..." }                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Frontend: VerificationModal Success Handler                  │
│    - Shows success message                                       │
│    - Closes modal                                                │
│    - ❌ MISSING: Trigger ContactVerificationModal               │
└─────────────────────────────────────────────────────────────────┘
```

**Gap Identified:** No mechanism to open ContactVerificationModal after verification submission

---

### Contact Verification Trigger Points

**Current Trigger:**
- Manual: User clicks "Verify Phone" button in profile

**Required Trigger:**
- Auto: After verification form submission
- Should pass: `defaultPhone` from verification submission data

**Implementation Requirements:**
1. VerificationModal needs callback: `onSubmitSuccess(phone: string)`
2. Profile page handles callback → Opens ContactVerificationModal
3. ContactVerificationModal receives `defaultPhone` prop

---

## Gap Analysis

| Issue | Current State | Expected State | Priority | Effort |
|-------|---------------|----------------|----------|--------|
| **C1: Phone modal pre-fill** | defaultPhone not passed when unverified | Always pass phone (from user or verification) | HIGH | LOW |
| **C2: Auto-trigger phone verify** | Manual trigger only | Auto-open after verification submit | HIGH | MEDIUM |
| **C3: Admin blank fields** | All fields shown | Only show fields with data | MEDIUM | LOW |
| **C4: Postcode comma input** | Single input, no parsing | Parse comma-separated values | HIGH | LOW |

---

## Technical Requirements

### C1: Phone Modal Pre-fill Fix

**File:** `src/app/installer/(dashboard)/profile/page.tsx`

**Current (Hypothetical):**
```typescript
<ContactVerificationModal
  isOpen={showContactModal}
  onClose={() => setShowContactModal(false)}
  defaultPhone={user.phoneVerified ? user.phone : undefined} // ❌ Wrong
  onVerificationSuccess={handleVerificationSuccess}
/>
```

**Required:**
```typescript
<ContactVerificationModal
  isOpen={showContactModal}
  onClose={() => setShowContactModal(false)}
  defaultPhone={verification?.phone || user.phone || undefined} // ✅ Correct
  onVerificationSuccess={handleVerificationSuccess}
/>
```

---

### C2: Auto-trigger Contact Verification

**Files to Modify:**
1. `src/components/installer/VerificationModal.tsx`
2. `src/app/installer/(dashboard)/profile/page.tsx`

**Implementation Steps:**

**Step 1:** Add callback prop to VerificationModal
```typescript
interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VerificationFormData) => void;
  isSubmitting?: boolean;
  existingVerification?: Partial<VerificationFormData>;
  onSubmitSuccess?: (phone: string) => void; // NEW
}
```

**Step 2:** Call callback after successful submission
```typescript
const handleSubmitForm = async () => {
  if (validateForm()) {
    const submitData = { ...formData, phone: formData.phone?.replace(/\s/g, '') };
    await onSubmit(submitData);
    
    // NEW: Call success callback with phone
    if (onSubmitSuccess) {
      onSubmitSuccess(submitData.phone!);
    }
  }
};
```

**Step 3:** Handle callback in profile page
```typescript
const [pendingVerificationPhone, setPendingVerificationPhone] = useState<string | null>(null);

const handleVerificationSubmitSuccess = (phone: string) => {
  setPendingVerificationPhone(phone);
  setShowVerificationModal(false);
  setShowContactModal(true); // Auto-open contact modal
};

<VerificationModal
  open={showVerificationModal}
  onClose={() => setShowVerificationModal(false)}
  onSubmit={handleVerificationSubmit}
  onSubmitSuccess={handleVerificationSubmitSuccess}
  existingVerification={profileData?.verification}
/>

<ContactVerificationModal
  isOpen={showContactModal}
  onClose={() => setShowContactModal(false)}
  defaultPhone={pendingVerificationPhone || verification?.phone || user.phone || undefined}
  onVerificationSuccess={handleContactVerificationSuccess}
/>
```

---

### C3: Admin View - Remove Blank Fields

**File:** `src/app/admin/installers/[id]/page.tsx`

**Current Sections to Optimize:**

1. **Installer Information** - Already shows data or "Not provided" ✅
2. **Application Details** - Only show if `verification` exists ✅
3. **Company Logo** - Already conditional ✅
4. **Additional Information** - Needs granular conditionals

**Required Changes:**

```typescript
// Current: Shows section if ANY field has data
{(verification.website || verification.socialLinks || verification.companyDescription) && (
  <div>
    {verification.website && <div>Website...</div>}
    {verification.socialLinks?.facebook && <div>Facebook...</div>}
    // ... all social links
    {verification.companyDescription && <div>Description...</div>}
  </div>
)}

// Issue: If only website exists, all social link labels still render empty

// Required: More granular checks
{verification.website && <div>Website: {verification.website}</div>}
{verification.socialLinks?.facebook && <div>Facebook: {verification.socialLinks.facebook}</div>}
{verification.socialLinks?.instagram && <div>Instagram: {verification.socialLinks.instagram}</div>}
{verification.socialLinks?.linkedin && <div>LinkedIn: {verification.socialLinks.linkedin}</div>}
{verification.socialLinks?.youtube && <div>YouTube: {verification.socialLinks.youtube}</div>}
{verification.companyDescription && <div>Description: {verification.companyDescription}</div>}

// Only show "Additional Information" heading if at least one field exists
{(verification.website || 
  verification.socialLinks?.facebook || 
  verification.socialLinks?.instagram || 
  verification.socialLinks?.linkedin || 
  verification.socialLinks?.youtube || 
  verification.companyDescription) && (
  <div>
    <h3>Additional Information</h3>
    {/* Individual field conditionals */}
  </div>
)}
```

---

### C4: Postcodes Comma-Separated Input

**File:** `src/components/installer/VerificationModal.tsx`

**Current State (Needs Verification):**
```typescript
// Likely a single text input
<input
  type="text"
  value={formData.postcodes?.join(', ') || ''}
  onChange={(e) => setFormData(prev => ({ ...prev, postcodes: [e.target.value] }))}
/>
```

**Required Implementation:**

```typescript
const handlePostcodesChange = (value: string) => {
  // Parse comma-separated values
  const postcodes = value
    .split(',')
    .map(pc => pc.trim())
    .filter(pc => pc.length > 0);
  
  setFormData(prev => ({ ...prev, postcodes }));
};

<input
  type="text"
  value={formData.postcodes?.join(', ') || ''}
  onChange={(e) => handlePostcodesChange(e.target.value)}
  placeholder="e.g., 5000, 5001, 5002"
/>

// Optional: Visual feedback with tags
<div className="flex flex-wrap gap-2 mt-2">
  {formData.postcodes?.map((pc, idx) => (
    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded">
      {pc}
      <button onClick={() => removePostcode(pc)}>×</button>
    </span>
  ))}
</div>
```

**Validation Enhancement:**
```typescript
postcodes: z.array(z.string().regex(/^\d{4}$/, 'Invalid postcode format')).min(1)
```

---

## Testing Checklist

### C1: Phone Modal Pre-fill
- [ ] Unverified profile → Open phone modal → See phone number prefilled
- [ ] Verified profile → Open phone modal → See phone number prefilled
- [ ] No phone in verification → Open phone modal → See user.phone prefilled
- [ ] No phone anywhere → Open phone modal → Empty input

### C2: Auto-trigger Phone Verification
- [ ] Submit verification form → Modal closes → Contact modal opens immediately
- [ ] Contact modal shows submitted phone number prefilled
- [ ] Can close contact modal and manually re-open later
- [ ] Phone verification success → Updates user.phoneVerified

### C3: Admin View Blank Fields
- [ ] No optional fields → "Additional Information" section hidden
- [ ] Only website → Only website shown
- [ ] Only social links → Only those links shown
- [ ] All optional fields empty → Logo section hidden
- [ ] No blank "Not provided" labels in optional sections

### C4: Postcodes Comma Input
- [ ] Type "5000, 5001, 5002" → Array stored: ["5000", "5001", "5002"]
- [ ] Type "5000,5001,5002" (no spaces) → Same result
- [ ] Type "5000,  5001  , 5002" (extra spaces) → Trimmed correctly
- [ ] Submission → Backend receives array
- [ ] Admin view → Shows "5000, 5001, 5002"

---

## Implementation Plan

### Phase C Tasks

| ID | Task | Files | Est. Time | Priority |
|----|------|-------|-----------|----------|
| C1 | Fix phone modal pre-fill logic | `profile/page.tsx` | 15min | HIGH |
| C2.1 | Add onSubmitSuccess callback to VerificationModal | `VerificationModal.tsx` | 30min | HIGH |
| C2.2 | Wire auto-trigger in profile page | `profile/page.tsx` | 30min | HIGH |
| C3 | Optimize admin view blank fields | `admin/installers/[id]/page.tsx` | 45min | MEDIUM |
| C4.1 | Add postcode parsing logic | `VerificationModal.tsx` | 30min | HIGH |
| C4.2 | Add visual feedback (tags) | `VerificationModal.tsx` | 30min | LOW |

**Total Estimated Time:** 2-3 hours

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| ContactVerificationModal prop mismatch | HIGH | Verify interface accepts defaultPhone prop |
| Postcode validation breaking existing data | MEDIUM | Add migration for existing single-value postcodes |
| Admin view conditionals affecting layout | LOW | Test with various data states |
| Auto-trigger causing modal flashing | LOW | Add delay/animation between modals |

---

## Dependencies

**Frontend:**
- ContactVerificationModal must accept `defaultPhone?: string` prop ✅ (already exists)
- VerificationModal needs state management for success callback
- Profile page needs state for pending phone verification

**Backend:**
- No backend changes required ✅
- Existing APIs support all requirements

---

## Success Criteria

1. ✅ **C1 Complete:** Unverified users see phone number in contact modal
2. ✅ **C2 Complete:** Contact modal auto-opens after verification submission
3. ✅ **C3 Complete:** Admin view shows no blank optional fields
4. ✅ **C4 Complete:** Users can enter multiple postcodes with commas

---

## Next Steps

1. **Create Phase C tasks** in `tasks.md`
2. **Implement C1** (phone pre-fill) - Quick win
3. **Implement C4** (postcode parsing) - Quick win
4. **Implement C2** (auto-trigger) - Complex but high value
5. **Implement C3** (admin optimization) - Polish
6. **Test all flows** - End-to-end verification
7. **Commit and push** - Update gitstatus.md

---

## Notes

- All changes are frontend-only (no database migrations)
- Backward compatible with existing data
- Follows existing design system (no new UI patterns)
- Maintains alignment with constitution.md
- No breaking changes to existing APIs
