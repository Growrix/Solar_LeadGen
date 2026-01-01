# Frontend-Backend Integration Audit Report

**Date**: November 19, 2025  
**Scope**: Installer Verification System - Frontend to Backend Connection Gaps  
**Status**: 🔴 Critical - No API calls implemented  
**Reporter**: System Audit

---

## Executive Summary

**Critical Finding**: The installer verification form submission is completely non-functional. When users click "Submit Application", the data is only logged to console and never sent to the backend API. The entire frontend-backend integration layer is missing across all features.

### Impact Assessment
- **Severity**: P0 (Critical)
- **User Impact**: 100% - Verification system is completely broken
- **Data Loss**: All form submissions are lost (not persisted to database)
- **Admin Impact**: Admins see no new verification applications despite submissions
- **Business Impact**: No new installers can be onboarded

### Root Cause
Phase B5 backend implementation was completed, but Phase B5.10 (UI wiring) was never executed. All frontend handlers have `TODO` comments and only perform local state updates or console logs.

---

## Detailed Findings

### 1. Verification Modal Submission ❌ CRITICAL

**File**: `src/components/installer/VerificationModal.tsx`

**Issue**: Form submission only passes data to parent via callback prop, no direct API call

```tsx
// Line 111-114
const handleSubmitForm = () => {
  if (validateForm()) {
    onSubmit(formData as VerificationFormData);  // ❌ Only callback, no API
  }
};
```

**Impact**: 
- Form validation works ✅
- Data collected correctly ✅
- **Data never reaches database** ❌
- No error handling for API failures ❌
- No loading states during submission ❌

**Expected Behavior**:
Should call `POST /api/installer/verification/submit` with form data and handle response

---

### 2. Profile Page Handler ❌ CRITICAL

**File**: `src/app/installer/(dashboard)/profile/page.tsx`

**Issue**: Handler only logs data and closes modal

```tsx
// Line 137-140
const handleVerificationSubmit = (data: any) => {
  console.log('Verification data submitted:', data);  // ❌ Only console log
  setIsVerificationModalOpen(false);
  // TODO: API call in Phase B5
};
```

**Impact**:
- Modal closes (gives false impression of success)
- Data never persisted
- No feedback to user about actual submission
- No error handling

**Expected Behavior**:
Should call API, show loading state, handle success/error, update local state with response

---

### 3. File Upload System ❌ CRITICAL

**File**: `src/components/installer/VerificationModal.tsx` (Lines 326-350, 358-370, 551-563)

**Issue**: File upload UI exists but has NO functionality

```tsx
// Lines 326-340 - License Document Upload
<div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-surface shadow-neu-inset hover:border-primary transition-colors cursor-pointer">
  <svg className="mx-auto h-12 w-12 text-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
  <p className="text-body-small text-muted-foreground mt-2">
    Click to upload or drag and drop
  </p>
  <p className="text-caption text-muted-foreground">
    PDF, JPG, PNG (max 5MB)
  </p>
</div>
// ❌ NO onClick, NO onChange, NO file input element
```

**Missing Components**:
1. Hidden file input elements
2. onChange handlers to capture file selection
3. File validation (type, size)
4. Presigned URL fetch from `GET /api/installer/uploads/presign`
5. Direct S3 upload via presigned URL
6. S3 key storage in formData state
7. Upload progress indicators
8. Error handling for upload failures

**Expected Behavior**:
```tsx
// Should have:
<input type="file" ref={licenseFileRef} onChange={handleLicenseUpload} style={{ display: 'none' }} />
<div onClick={() => licenseFileRef.current?.click()}>...</div>

const handleLicenseUpload = async (e) => {
  const file = e.target.files[0];
  // 1. Validate file
  // 2. GET presigned URL from API
  // 3. PUT file to S3 using presigned URL
  // 4. Store returned key in formData.licenseDocKey
  // 5. Show success/error
};
```

---

### 4. Profile Data Fetching ❌ CRITICAL

**File**: `src/app/installer/(dashboard)/profile/page.tsx` (Lines 9-58)

**Issue**: Using mock data instead of real API call

```tsx
// Line 9-58
const useMockProfileData = () => {
  return {
    user: {
      id: 'mock-user-id',  // ❌ Hardcoded mock data
      name: 'John Smith',
      email: 'john@solarsolutions.com.au',
      // ... all mock data
    },
    // ...
  };
};

// Line 61
const { user, profile, verification, preferences } = useMockProfileData();  // ❌ Using mock
```

**Impact**:
- Users see fake data instead of their actual profile
- Changes to profile in DB not reflected in UI
- Admin updates invisible to installer

**Expected Behavior**:
```tsx
const [profileData, setProfileData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProfile = async () => {
    const res = await fetch('/api/installer/profile');
    const data = await res.json();
    setProfileData(data);
    setLoading(false);
  };
  fetchProfile();
}, []);
```

---

### 5. Profile Update ❌ CRITICAL

**File**: `src/app/installer/(dashboard)/profile/page.tsx` (Lines 193-197)

**Issue**: Only local state update, no API call

```tsx
// Line 193-197
const handleSaveVerificationEdits = () => {
  console.log('Verification edits saved:', editableVerification);  // ❌ Only log
  setIsEditingVerification(false);
  // TODO: API call in Phase B5
};
```

**Expected Behavior**:
Should call `PUT /api/installer/profile` with updated fields

---

### 6. Password Change ❌ CRITICAL

**File**: `src/app/installer/(dashboard)/profile/page.tsx` (Lines 175-183)

**Issue**: Validation works, but no API call

```tsx
// Line 175-183
const handlePasswordChange = () => {
  if (validatePassword()) {
    console.log('Password change requested');  // ❌ Only log
    // TODO: API call in Phase B5
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
  }
};
```

**Expected Behavior**:
Should call `POST /api/installer/account/change-password` and handle session invalidation

---

### 7. Operational Status Toggle ❌ CRITICAL

**File**: `src/app/installer/(dashboard)/profile/page.tsx` (Lines 186-190)

**Issue**: Only local state update

```tsx
// Line 186-190
const handleStatusToggle = (newStatus: 'ACTIVE' | 'PAUSED') => {
  console.log('Status toggle:', newStatus);  // ❌ Only log
  setOperationalStatus(newStatus);  // ❌ Local state only
  // TODO: API call in Phase B5
};
```

**Expected Behavior**:
Should call `PUT /api/installer/account/status` and persist change

---

### 8. Preferences Management ❌ CRITICAL

**File**: `src/app/installer/(dashboard)/profile/page.tsx` (Lines 65-67)

**Issue**: No API integration for preferences

```tsx
// Line 65
const [localPreferences, setLocalPreferences] = useState(preferences);  // ❌ Mock data
// No GET call on mount
// No PUT call on preference toggle
```

**Expected Behavior**:
- Fetch from `GET /api/installer/preferences` on mount
- Save via `PUT /api/installer/preferences` on change

---

## Backend API Status ✅

All backend APIs are **fully implemented and functional** (verified in Phase B5):

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/api/installer/profile` | GET | ✅ Ready | Fetch aggregated profile data |
| `/api/installer/profile` | PUT | ✅ Ready | Update profile + verification fields |
| `/api/installer/verification/submit` | POST | ✅ Ready | Submit/update verification |
| `/api/installer/uploads/presign` | GET | ✅ Ready | Get S3 presigned upload URLs |
| `/api/installer/preferences` | GET | ✅ Ready | Fetch preferences |
| `/api/installer/preferences` | PUT | ✅ Ready | Update preferences |
| `/api/installer/account/status` | PUT | ✅ Ready | Toggle ACTIVE/PAUSED |
| `/api/installer/account/change-password` | POST | ✅ Ready | Change password + rotate session |
| `/api/admin/installers/[id]/verification` | GET | ✅ Ready | View verification details |
| `/api/admin/installers/[id]/verification` | PUT | ✅ Ready | APPROVE/REJECT/REQUEST_INFO |
| `/api/admin/installers/[id]/logs` | GET | ✅ Ready | View audit trail |
| `/api/admin/installers/[id]/status` | PUT | ✅ Ready | Admin set status (incl. INACTIVE) |

**Validation**: All routes tested with TypeScript (0 errors), Zod validation in place

---

## Integration Gap Summary

### Missing Components

1. **API Client Functions** (Recommended: Create `src/lib/api/installer.ts`)
   - `submitVerification(data)`
   - `uploadDocument(file, type)`
   - `fetchProfile()`
   - `updateProfile(data)`
   - `updatePreferences(data)`
   - `changePassword(passwords)`
   - `toggleStatus(status)`

2. **File Upload Logic**
   - File input elements in VerificationModal
   - Upload handlers with validation
   - S3 presigned URL integration
   - Progress tracking
   - Error handling

3. **State Management**
   - Replace mock data with API data
   - Loading states for all async operations
   - Error states with user-friendly messages
   - Success feedback (toasts/notifications)
   - Optimistic updates where appropriate

4. **Error Handling**
   - Network error recovery
   - Validation error display
   - Session expiry handling
   - Retry logic for failed uploads

5. **User Feedback**
   - Loading spinners during API calls
   - Success messages
   - Error messages with actionable guidance
   - Upload progress bars
   - Form submission states (disabled during submit)

---

## Fix Plan

### Phase B6: Frontend-Backend Integration

**Goal**: Connect all UI components to backend APIs

**Timeline**: 11 tasks (estimated 4-6 hours)

**Priority**: P0 (Block all other work)

### Task Breakdown

#### B6.1: Create API Client Library ✅
**File**: `src/lib/api/installer.ts`
- Centralized fetch wrappers for all installer endpoints
- Error handling utilities
- TypeScript interfaces for request/response types

#### B6.2: Implement File Upload System ✅
**Files**: 
- `src/components/installer/VerificationModal.tsx`
- `src/hooks/useFileUpload.ts` (new custom hook)
- Wire presigned URL fetch + S3 upload
- Add file input elements + handlers
- Implement progress tracking
- Validate file types/sizes

#### B6.3: Wire Verification Submission ✅
**File**: `src/app/installer/(dashboard)/profile/page.tsx`
- Replace console.log with API call
- Add loading state
- Handle success (update local state, show message)
- Handle errors (display to user)
- Close modal only on success

#### B6.4: Wire Profile GET API ✅
**File**: `src/app/installer/(dashboard)/profile/page.tsx`
- Replace `useMockProfileData` with real fetch
- Add useEffect to fetch on mount
- Add loading state
- Handle fetch errors
- Store data in state

#### B6.5: Wire Profile PUT API ✅
**File**: `src/app/installer/(dashboard)/profile/page.tsx`
- Implement `handleSaveVerificationEdits`
- Call PUT endpoint
- Update local state on success
- Show feedback

#### B6.6: Wire Preferences GET/PUT APIs ✅
**File**: `src/app/installer/(dashboard)/profile/page.tsx`
- Fetch preferences on mount
- Wire toggle handlers to PUT endpoint
- Optimistic updates

#### B6.7: Wire Password Change API ✅
**File**: `src/app/installer/(dashboard)/profile/page.tsx`
- Implement API call in `handlePasswordChange`
- Handle session invalidation (force logout)
- Show success message before logout

#### B6.8: Wire Status Toggle API ✅
**File**: `src/app/installer/(dashboard)/profile/page.tsx`
- Call PUT endpoint in `handleStatusToggle`
- Update local state on success
- Show feedback

#### B6.9: Add Loading & Error States ✅
**All Components**
- Add loading spinners
- Disable forms during submission
- Display errors with retry options

#### B6.10: Admin Panel Integration ✅
**Files**: `src/app/admin/installers/**`
- Wire admin verification view
- Wire approve/reject actions
- Wire logs display
- Wire admin status control

#### B6.11: End-to-End Testing ✅
- Submit verification → verify DB entry
- Upload files → verify S3 storage
- Admin approve → verify user.installerVerified updated
- Password change → verify forced logout
- All preference toggles → verify persistence

---

## Testing Checklist

### Before Fix
- [ ] Submit verification → Nothing in database
- [ ] Click file upload → No file selector opens
- [ ] Change preferences → Resets on page refresh
- [ ] Change password → Nothing happens
- [ ] Admin panel shows no submissions

### After Fix
- [ ] Submit verification → Creates InstallerVerification record
- [ ] Upload license → File appears in S3, key stored in DB
- [ ] Change preferences → Persists across sessions
- [ ] Change password → Forces logout, new password works
- [ ] Admin sees new verification with download links
- [ ] Admin approve → User sees verified badge
- [ ] Status toggle → Persists and affects lead visibility

---

## Risk Assessment

### Risks if Not Fixed
1. **Data Loss**: All user-submitted verifications lost permanently
2. **User Frustration**: Users think they've submitted but nothing happens
3. **Support Burden**: Users will contact support repeatedly
4. **Business Impact**: Cannot onboard new installers
5. **Reputation Damage**: System appears broken/amateur

### Dependencies
- ✅ Backend APIs functional (verified in Phase B5)
- ✅ Database schema complete
- ✅ Validation schemas in place
- ❌ Frontend integration missing (this phase)
- ⚠️ S3 configuration (AWS credentials needed for uploads)

### Blockers
- **S3 Access**: Requires AWS credentials in environment variables
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_S3_BUCKET`
  - *Note*: File upload can be skipped if S3 not configured (optional fields)

---

## Success Criteria

### Functional Requirements
1. ✅ Verification form submits to backend
2. ✅ Data persists in PostgreSQL
3. ✅ File uploads work (if S3 configured) or gracefully skipped
4. ✅ Profile data loads from API
5. ✅ All updates persist across page refreshes
6. ✅ Admin sees submitted verifications
7. ✅ Admin actions update installer state
8. ✅ Password change invalidates session

### Non-Functional Requirements
1. ✅ Loading states visible during all async operations
2. ✅ Errors displayed with actionable messages
3. ✅ Form validation prevents invalid submissions
4. ✅ Success feedback confirms actions
5. ✅ No console errors in browser
6. ✅ TypeScript compiles with 0 errors
7. ✅ API responses handled correctly (200, 400, 401, 500)

---

## Recommendations

### Immediate Actions
1. **Priority 1**: Fix verification submission (B6.1-B6.3)
2. **Priority 2**: Wire profile data loading (B6.4)
3. **Priority 3**: Complete remaining integrations (B6.5-B6.8)
4. **Priority 4**: Testing and validation (B6.11)

### Code Quality
- Create reusable API client library (avoid duplicate fetch code)
- Use custom hooks for file uploads (reusable across components)
- Centralize error handling (consistent UX)
- Add TypeScript types for all API payloads/responses

### Future Enhancements
- Add optimistic UI updates (instant feedback, rollback on error)
- Implement retry logic for network failures
- Add request cancellation on component unmount
- Cache profile data with SWR or React Query
- Add toast notification system for better UX

---

## Appendix: Code Examples

### A. API Client Pattern
```typescript
// src/lib/api/installer.ts
export async function submitVerification(data: VerificationFormData) {
  const res = await fetch('/api/installer/verification/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Submission failed');
  }
  return res.json();
}
```

### B. File Upload Pattern
```typescript
// src/hooks/useFileUpload.ts
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  
  const upload = async (file: File, fileType: 'document' | 'logo') => {
    setUploading(true);
    try {
      // 1. Get presigned URL
      const presignRes = await fetch(
        `/api/installer/uploads/presign?filename=${file.name}&contentType=${file.type}&fileType=${fileType}`
      );
      const { uploadUrl, key } = await presignRes.json();
      
      // 2. Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      
      return key;
    } finally {
      setUploading(false);
    }
  };
  
  return { upload, uploading };
}
```

### C. Integration Pattern
```typescript
// src/app/installer/(dashboard)/profile/page.tsx
const handleVerificationSubmit = async (data: VerificationFormData) => {
  setSubmitting(true);
  setError(null);
  try {
    const result = await submitVerification(data);
    setIsVerificationModalOpen(false);
    toast.success('Verification submitted successfully!');
    // Refresh profile data
    await refetchProfile();
  } catch (err: any) {
    setError(err.message);
    toast.error(err.message);
  } finally {
    setSubmitting(false);
  }
};
```

---

**Report End**

**Next Steps**: 
1. Review audit findings
2. Create Phase B6 in tasks.md
3. Begin implementation starting with B6.1
4. Test each component after implementation
5. Full E2E testing after all integrations complete
