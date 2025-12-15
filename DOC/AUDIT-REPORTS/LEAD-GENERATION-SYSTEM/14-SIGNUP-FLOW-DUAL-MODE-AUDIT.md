# Signup Flow Dual-Mode Audit

**Date**: November 18, 2025  
**Issue**: Direct signup from header menu fails with "Email, password, and name are required"  
**Root Cause**: HomeownerSignupModal missing name field for direct signup flow

---

## Executive Summary

The `HomeownerSignupModal` was enhanced to accept `homeownerInfo` prop (name/phone/address) for the lead generation flow, but this broke the direct signup flow from the header menu where `homeownerInfo` is undefined.

---

## The Two Signup Flows

### Flow 1: Direct Signup (Header Menu)
**User Journey**:
1. User clicks "Sign Up" button in header
2. `LayoutContent.tsx` opens `HomeownerSignupModal`
3. NO `homeownerInfo` prop passed → `homeownerInfo = undefined`
4. User enters: email, password
5. Modal sends to API: `{ email, password, name: undefined, phone: undefined, address: undefined }`
6. API validation fails: `!name` → "Email, password, and name are required"

**File Flow**:
```
HeaderMenu.tsx 
  → LayoutContent.tsx (state: isHomeownerSignupModalOpen)
    → HomeownerSignupModal (isOpen, onClose, onSuccess, onSwitchToSignIn)
      → NO homeownerInfo prop
      → API call with name: undefined ❌
```

### Flow 2: Lead Generation Signup (Guest)
**User Journey**:
1. Guest user fills InstantQuoteForm
2. After 1st lead → HomeownersInfoForm collects: name, phone, address
3. `page.tsx` sets `homeownerInfo` state
4. User clicks "Continue" → `HomeownerSignupModal` opens with `homeownerInfo` prop
5. User enters: email, password
6. Modal sends to API: `{ email, password, name: "John", phone: "0400...", address: "..." }`
7. API validation passes: `name` exists ✅

**File Flow**:
```
InstantQuoteForm (page.tsx)
  → HomeownersInfoForm (collects name/phone/address)
    → page.tsx (state: homeownerInfo)
      → HomeownerSignupModal (isOpen, onClose, onSuccess, onSwitchToSignIn, homeownerInfo)
        → Has homeownerInfo prop
        → API call with name: "John" ✅
```

---

## Technical Analysis

### API Endpoint Requirements
**File**: `src/app/api/auth/register/homeowner/route.ts`

```typescript
// Line 18: Extract fields from request body
const { email, password, name, phone, address } = body;

// Line 27: Validation - name is REQUIRED
if (!email || !password || !name) {
  return NextResponse.json(
    { error:"Email, password, and name are required" },
    { status: 400 }
  );
}
```

**Required Fields**: `email`, `password`, `name`  
**Optional Fields**: `phone`, `address`

### Current Modal Implementation
**File**: `src/components/HomeownerSignupModal.tsx`

```typescript
// Line 73: Props interface
interface HomeownerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignIn?: () => void;
  homeownerInfo?: { name: string; phone: string; address: string } | null;
}

// Line 96: Form state - NO NAME FIELD
const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: '',
});

// Line 164: API call
body: JSON.stringify({
  email: formData.email,
  password: formData.password,
  name: homeownerInfo?.name, // ❌ undefined for direct signup
  phone: homeownerInfo?.phone,
  address: homeownerInfo?.address,
}),
```

**Problem**: When `homeownerInfo` is `undefined`, `name` is sent as `undefined` to the API, failing validation.

### Backup Version Comparison
**File**: `backup-2025-11-09/src/components/HomeownerSignupModal.tsx`

```typescript
// Backup modal sent ONLY email and password
body: JSON.stringify({
  email: formData.email,
  password: formData.password,
  // NO name, phone, or address fields
}),
```

**Backup API**: Required `fullName, email, phone, address, password` (all required)

**Conclusion**: The backup version would have ALSO FAILED for the same reason. The API required all fields, but the modal didn't send them.

---

## Root Cause

The modal has **two responsibilities** but only **one form structure**:
1. **Minimal Signup**: Collect email + password + name (for direct signup)
2. **Extended Signup**: Use pre-collected name/phone/address (for lead generation)

The current implementation assumes `name` comes from `homeownerInfo`, but doesn't provide a fallback input field when `homeownerInfo` is null.

---

## Solution Design

### Option 1: Conditional Name Field (RECOMMENDED)
**Show name input field ONLY when homeownerInfo is null**

**Pros**:
- Maintains backward compatibility
- Single modal handles both flows
- Clear user experience (don't ask for name twice)
- Aligns with API Phase 21 requirements (name is mandatory)

**Cons**:
- Slightly more complex form logic

### Option 2: Make Name Optional in API
**Change API to NOT require name**

**Pros**:
- Simpler modal logic

**Cons**:
- ❌ Violates Phase 21 requirement (name is mandatory for all homeowner registrations)
- ❌ Inconsistent data (some users with names, some without)
- ❌ Poor UX (ask for name later in profile updates)

### Decision: Option 1 (Conditional Name Field)

---

## Implementation Plan

### Phase 1: Update Modal Form State
**File**: `src/components/HomeownerSignupModal.tsx`

```typescript
// Add name field to formData
const [formData, setFormData] = useState({
  fullName: '', // 🆕 Add name field
  email: '',
  password: '',
  confirmPassword: '',
});
```

### Phase 2: Conditional Rendering
```tsx
{/* Show name field ONLY when homeownerInfo is null (direct signup) */}
{!homeownerInfo && (
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      Full Name
    </label>
    <input
      type="text"
      name="fullName"
      value={formData.fullName}
      onChange={handleInputChange}
      placeholder="Enter your full name"
      className={baseInputClasses}
      required
    />
  </div>
)}
```

### Phase 3: Update API Call Logic
```typescript
body: JSON.stringify({
  email: formData.email,
  password: formData.password,
  // Use homeownerInfo.name if available, otherwise use formData.fullName
  name: homeownerInfo?.name || formData.fullName,
  phone: homeownerInfo?.phone || null, // Optional
  address: homeownerInfo?.address || null, // Optional
}),
```

### Phase 4: Update Validation
```typescript
// Add name validation for direct signup
if (!homeownerInfo && !formData.fullName.trim()) {
  setError("Full name is required.");
  setLoading(false);
  return;
}
```

---

## Testing Matrix

### Test Case 1: Direct Signup from Header
**Steps**:
1. Navigate to homepage
2. Click "Sign Up" in header menu
3. Enter: Name = "John Doe", Email = "john@example.com", Password = "Pass1234", Confirm Password = "Pass1234"
4. Click "Sign Up"

**Expected**:
- ✅ Account created successfully
- ✅ User.name = "John Doe"
- ✅ User.phone = null
- ✅ Automatically signed in
- ✅ Redirected to dashboard

### Test Case 2: Lead Generation Signup (Guest)
**Steps**:
1. Fill InstantQuoteForm as guest (1st lead)
2. Fill HomeownersInfoForm: Name = "Jane Smith", Phone = "0400123456", Address = "123 Test St"
3. Enter: Email = "jane@example.com", Password = "Pass1234", Confirm Password = "Pass1234"
4. Click "Sign Up"

**Expected**:
- ✅ Account created successfully
- ✅ User.name = "Jane Smith" (from HomeownersInfoForm, NOT modal input)
- ✅ User.phone = "0400123456"
- ✅ Lead created with all contact info
- ✅ Automatically signed in
- ✅ Redirected to dashboard

### Test Case 3: Validation - Empty Name (Direct Signup)
**Steps**:
1. Click "Sign Up" in header
2. Leave name blank, enter email and password
3. Click "Sign Up"

**Expected**:
- ❌ Client-side validation: "Full name is required."
- ❌ Form NOT submitted

### Test Case 4: UI/UX - Name Field Visibility
**Steps**:
1. Open direct signup modal → name field SHOULD be visible
2. Open lead generation signup modal (after HomeownersInfoForm) → name field SHOULD NOT be visible

**Expected**:
- ✅ Direct signup: 3 fields (name, email, password)
- ✅ Lead gen signup: 2 fields (email, password) - name pre-filled from HomeownersInfoForm

---

## Success Criteria

1. ✅ Direct signup from header collects name in modal
2. ✅ Lead generation signup uses name from HomeownersInfoForm
3. ✅ Both flows create User with name populated
4. ✅ API validation passes for both flows
5. ✅ No duplicate name input in lead generation flow
6. ✅ Zero TypeScript errors
7. ✅ Zero ESLint violations
8. ✅ All 4 test cases pass

---

## Next Steps

1. Implement changes in `HomeownerSignupModal.tsx`
2. Run TypeScript validation: `npx tsc --noEmit`
3. Test direct signup flow
4. Test lead generation signup flow
5. Verify database records have correct name/phone values
6. Update Phase 23 with signup fix subtask
