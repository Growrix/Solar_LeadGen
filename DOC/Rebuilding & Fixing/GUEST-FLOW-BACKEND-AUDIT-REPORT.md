# Guest Flow & Backend Mismatch Audit Report

**Date:** November 11, 2025  
**Report ID:** AUDIT-2025-11-11-GUEST-FLOW  
**Status:** 🔴 CRITICAL MISMATCHES IDENTIFIED

---

## Executive Summary

This audit identifies critical mismatches between the new guest flow (with updated auth system) and the existing backend infrastructure. The primary issue is that **user contact information (name, phone, address) is now collected in HomeownersInfoForm but NOT being stored or passed to the backend**, causing data loss and breaking the lead generation system.

### Key Findings:
- ❌ **CRITICAL**: Name, phone, and address collected in HomeownersInfoForm are NOT saved to User model during signup
- ❌ **CRITICAL**: Lead creation expects phone number from User.phone, but it's NULL after new signup flow
- ❌ **CRITICAL**: Address collected in HomeownersInfoForm is NOT passed to lead creation
- ⚠️ **WARNING**: Phone verification system expects User.phone to be populated
- ⚠️ **WARNING**: Lead.phoneNumber and Lead.phoneVerified fields are copied from User model, but User has no phone data

---

## 1. Current Guest Flow Analysis

### Flow Steps:
1. **InstantQuoteForm** → User fills out solar quote details (system size, location, etc.)
2. **QuoteOptionsModal** → User selects quote type (CALL_VISIT or WRITTEN_QUOTE)
3. **HomeownersInfoForm** 🆕 → User provides:
   - Full Name
   - Contact Number (phone)
   - Property Address
4. **HomeownerSignupModal** 🆕 → User creates account with:
   - Email
   - Password
5. **Lead Creation** → System creates lead in database
6. **SuccessModal** → Confirmation shown

### Data Collection Points:

| Field | Collected In | Used For | Currently Stored? |
|-------|-------------|----------|-------------------|
| Name | HomeownersInfoForm | User identification, lead owner | ❌ NO |
| Phone | HomeownersInfoForm | Contact, verification | ❌ NO |
| Address | HomeownersInfoForm | Property location, lead details | ❌ NO |
| Email | HomeownerSignupModal | Auth, account | ✅ YES |
| Password | HomeownerSignupModal | Auth | ✅ YES (hashed) |
| Quote Data | InstantQuoteForm | Lead details, calculations | ✅ YES |
| Quote Type | QuoteOptionsModal | Lead type | ✅ YES |

---

## 2. Backend Database Schema Analysis

### 2.1 User Model (Prisma)

```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String?
  name                  String?   // ⚠️ Optional, but NOT populated in new flow
  phone                 String?   // ⚠️ Optional, but NOT populated in new flow
  role                  UserRole  @default(HOMEOWNER)
  phoneVerified         Boolean   @default(false)
  // ... other fields
}
```

**Current State:**
- `name` field exists but is NOT populated during signup
- `phone` field exists but is NOT populated during signup
- Both fields are OPTIONAL (nullable)
- Registration endpoint `/api/auth/register/homeowner` only accepts `email` and `password`

### 2.2 Lead Model (Prisma)

```prisma
model Lead {
  id                    String    @id @default(cuid())
  homeownerId           String
  phoneVerified         Boolean   @default(false)
  phoneNumber           String?   // ⚠️ Copied from User.phone (which is NULL)
  address               String?   // ⚠️ Expected from frontend but NOT passed
  postcode              String    // ✅ Passed from quoteData
  location              String    // ✅ Passed from quoteData
  state                 String    // ✅ Passed from quoteData
  // ... other fields
}
```

**Current State:**
- `phoneNumber` is copied from `User.phone` during lead creation (line 212 of lead-service.ts)
- `phoneVerified` is copied from `User.phoneVerified` (always false for new users)
- `address` is expected but NOT provided in lead creation payload from page.tsx

---

## 3. Critical Mismatches Identified

### 3.1 ❌ CRITICAL: Name Field Mismatch

**Where Collected:** HomeownersInfoForm (line 175-186)
```tsx
<input
  type="text"
  id="name"
  name="name"
  value={formData.name}
  placeholder="John Smith"
  required
/>
```

**What Happens:**
1. User enters name in HomeownersInfoForm
2. Name is stored in `homeownerInfo` state in page.tsx (line 128)
3. HomeownerSignupModal is opened, but **homeownerInfo is NOT passed as prop**
4. Signup API call does NOT include name field (HomeownerSignupModal.tsx line 162-168)
5. User.name remains NULL in database

**Backend Expectation:**
- User.name is used for personalization in dashboards
- Lead notifications reference User.name for installers
- Admin panel displays User.name for lead management

**Impact:**
- User dashboards show "null" or empty name fields
- Lead notifications to installers have no homeowner name
- Admin cannot identify users easily

---

### 3.2 ❌ CRITICAL: Phone Field Mismatch

**Where Collected:** HomeownersInfoForm (line 188-207)
```tsx
<input
  type="tel"
  id="phone"
  name="phone"
  value={formData.phone}
  placeholder="0412 345 678"
  required
/>
```

**What Happens:**
1. User enters phone in HomeownersInfoForm with validation (Australian format)
2. Phone is stored in `homeownerInfo` state in page.tsx (line 128)
3. HomeownerSignupModal is opened, but **homeownerInfo is NOT passed as prop**
4. Signup API call does NOT include phone field
5. User.phone remains NULL in database
6. Lead creation copies NULL from User.phone to Lead.phoneNumber (lead-service.ts line 212)

**Backend Expectation:**
- Lead.phoneNumber expects a valid phone number for installer contact
- Phone verification system requires User.phone to send OTP
- Second lead submission requires phone verification (checks User.phoneVerified)

**Impact:** (MOST CRITICAL)
- ❌ Lead.phoneNumber is NULL → installers cannot contact homeowners
- ❌ Phone verification cannot be initiated (no phone number to verify)
- ❌ Second lead submission will fail verification check
- ❌ Notification system cannot send SMS alerts
- ❌ Lead quality is degraded (missing primary contact method)

**Code Evidence:**
```typescript
// lead-service.ts line 212
phoneNumber: homeowner?.phone || null, // ❌ Always NULL for new signups
```

---

### 3.3 ❌ CRITICAL: Address Field Mismatch

**Where Collected:** HomeownersInfoForm (line 209-226)
```tsx
<input
  type="text"
  id="address"
  name="address"
  value={formData.address}
  placeholder="123 Main Street, Sydney NSW 2000"
  required
/>
```

**What Happens:**
1. User enters full address in HomeownersInfoForm
2. Address is stored in `homeownerInfo` state in page.tsx (line 128)
3. Lead creation is called from page.tsx, but **address is NOT included in payload**
4. Lead.address remains NULL in database

**Backend Expectation:**
- Lead.address is used for installer quotes and site visits
- Admin uses address for lead validation and verification
- Address is required for accurate solar system design

**Impact:**
- ❌ Lead.address is NULL → installers don't know property location
- ❌ Site visit scheduling impossible without address
- ❌ Lead quality degraded (critical field missing)
- ⚠️ Only postcode and location (suburb name) are captured, not full address

**Code Evidence:**
```typescript
// page.tsx line 191-203 (lead creation payload)
body: JSON.stringify({
  quoteType: apiQuoteType,
  propertyPostcode: pendingQuoteData?.postcode,
  location: pendingQuoteData?.location,
  // ❌ NO propertyAddress field included
  // homeownerInfo.address is collected but never used
})
```

---

### 3.4 ⚠️ WARNING: Phone Verification Flow Broken

**Current Phone Verification Logic:** (lead-service.ts line 134-140)
```typescript
// Check if phone verification is required
if (!homeowner.phoneVerified && currentCount >= maxBeforeVerification) {
  return {
    requiresVerification: true,
    // ...
  };
}
```

**Problem:**
- System expects `User.phoneVerified` to be true after verification
- But `User.phone` is NULL, so verification cannot be initiated
- Second lead submission will block user, but no way to verify

**Impact:**
- Users stuck after first lead submission
- Phone verification modal/flow cannot be triggered (no phone number)
- Manual admin intervention required to approve additional leads

---

### 3.5 ⚠️ WARNING: User Profile Incomplete

**Problem:**
- User.name, User.phone are optional fields but expected for full functionality
- Homeowner dashboard likely shows incomplete profile
- Profile completion flow (if exists) may not prompt for these fields

**Impact:**
- Poor user experience (incomplete profile)
- Dashboard personalization broken
- Profile completion percentage incorrect

---

## 4. Root Cause Analysis

### 4.1 Primary Root Cause: Data Flow Break

**The Issue:**
HomeownersInfoForm collects data → stores in `homeownerInfo` state → BUT state is never consumed by:
1. HomeownerSignupModal (doesn't receive homeownerInfo as prop)
2. Lead creation API call (doesn't include address from homeownerInfo)

**Code Evidence:**
```tsx
// page.tsx line 47
const [homeownerInfo, setHomeownerInfo] = useState<{ name: string; phone: string; address: string } | null>(null);

// page.tsx line 128 - Data is stored
const handleHomeownerInfoContinue = (info: { name: string; phone: string; address: string }) => {
  setHomeownerInfo(info); // ✅ Stored
  setIsHomeownersInfoFormOpen(false);
  setIsHomeownerSignupModalOpen(true); // ❌ homeownerInfo NOT passed to modal
};

// page.tsx line 355 - Modal opened without homeownerInfo
<HomeownerSignupModal
  isOpen={isHomeownerSignupModalOpen}
  onClose={() => setIsHomeownerSignupModalOpen(false)}
  onSuccess={handleHomeownerSignupSuccess}
  // ❌ MISSING: homeownerInfo={homeownerInfo}
/>
```

### 4.2 Secondary Root Cause: Registration API Limitations

**The Issue:**
`/api/auth/register/homeowner` only accepts email and password (auth-only fields)

**Code Evidence:**
```typescript
// src/app/api/auth/register/homeowner/route.ts line 16-17
const { email, password } = body; // ❌ Only destructures email/password

// Line 24-27 - Only validates email and password
if (!email || !password) {
  return NextResponse.json(
    { error: "Email and password are required" },
```

**Design Decision:**
- Registration was intentionally simplified to "minimal signup" (email + password only)
- User.name and User.phone were intended to be added "later via profile update"
- But profile update flow doesn't exist in guest flow
- Auth Part A+B spec focused on auth, not profile completion

---

## 5. Impact Assessment

### 5.1 Severity Levels

| Issue | Severity | Impact | User Experience | Business Impact |
|-------|----------|--------|----------------|----------------|
| Phone missing from Lead | 🔴 CRITICAL | Installers cannot contact homeowners | Lead conversion fails | Lost revenue, poor installer satisfaction |
| Address missing from Lead | 🔴 CRITICAL | Installers cannot quote accurately | Lead quality degraded | Lost revenue, poor lead quality |
| Name missing from User | 🔴 HIGH | Dashboards show null, impersonal UX | Confusing, unprofessional | Poor user retention |
| Phone verification broken | 🟠 HIGH | Users stuck after 1st lead | Frustrating, blocking | Support burden, user churn |
| Profile incomplete | 🟡 MEDIUM | Profile pages show gaps | Confusing | Minor UX degradation |

### 5.2 Affected Systems

1. **Lead Generation** 🔴
   - Leads created without phone or full address
   - Installer cannot contact or quote
   - Lead distribution system degraded

2. **Phone Verification** 🔴
   - Cannot initiate verification (no phone number)
   - Second lead submission blocks users
   - Manual admin override required

3. **User Management** 🟠
   - User profiles incomplete
   - Personalization broken
   - Dashboard shows "null" for name

4. **Notifications** 🟠
   - SMS notifications cannot be sent (no phone)
   - Email is only notification channel

5. **Analytics** 🟡
   - Lead quality metrics skewed
   - User completion rates incorrect

---

## 6. Recommended Solutions

### 6.1 Solution A: Update Registration API (RECOMMENDED)

**Approach:** Extend registration endpoint to accept name, phone, address

**Implementation:**

#### Step 1: Update HomeownerSignupModal to accept homeownerInfo prop

```tsx
// HomeownerSignupModal.tsx
interface HomeownerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignIn?: () => void;
  homeownerInfo?: { name: string; phone: string; address: string } | null; // 🆕 ADD THIS
}

const HomeownerSignupModal: React.FC<HomeownerSignupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  onSwitchToSignIn,
  homeownerInfo // 🆕 ADD THIS
}) => {
  // ... existing code ...
  
  // Update API call to include homeownerInfo
  const response = await fetch('/api/auth/register/homeowner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      name: homeownerInfo?.name, // 🆕 ADD THIS
      phone: homeownerInfo?.phone, // 🆕 ADD THIS
      address: homeownerInfo?.address, // 🆕 ADD THIS (store in User or pass separately)
    }),
  });
```

#### Step 2: Update page.tsx to pass homeownerInfo to modal

```tsx
// page.tsx line 355
<HomeownerSignupModal
  isOpen={isHomeownerSignupModalOpen}
  onClose={() => setIsHomeownerSignupModalOpen(false)}
  onSuccess={handleHomeownerSignupSuccess}
  homeownerInfo={homeownerInfo} // 🆕 ADD THIS
/>
```

#### Step 3: Update registration API to accept and store additional fields

```typescript
// src/app/api/auth/register/homeowner/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, address } = body; // 🆕 ADD name, phone, address
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // 🆕 Optional validation for name and phone (recommended)
    if (name && name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }
    
    if (phone) {
      const phoneRegex = /^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return NextResponse.json(
          { error: "Invalid Australian phone number format" },
          { status: 400 }
        );
      }
    }
    
    // ... existing validation and hashing ...
    
    // Create user with additional fields
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "HOMEOWNER",
        isActive: true,
        name: name || null, // 🆕 ADD THIS
        phone: phone || null, // 🆕 ADD THIS
        // Note: address is NOT in User model, need to store elsewhere or add to schema
      },
      // ... existing select ...
    });
    
    return NextResponse.json({ 
      user,
      message: "Account created successfully" 
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

#### Step 4: Update lead creation to use address from homeownerInfo

```tsx
// page.tsx - Update handleHomeownerSignupSuccess function
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quoteType: apiQuoteType,
    propertyPostcode: pendingQuoteData?.postcode || pendingQuoteData?.propertyPostcode,
    location: pendingQuoteData?.location,
    state: pendingQuoteData?.state,
    energyBill: pendingQuoteData?.electricityValue || pendingQuoteData?.energyBill || 0,
    propertyAddress: homeownerInfo?.address || pendingQuoteData?.address, // 🆕 ADD THIS
    // ... rest of payload ...
  })
});
```

**Pros:**
- ✅ Fixes all critical issues in one solution
- ✅ User.phone is populated immediately for verification system
- ✅ Lead.phoneNumber is correctly populated from User.phone
- ✅ Lead.address is passed correctly
- ✅ Minimal frontend changes (just pass props)

**Cons:**
- ⚠️ Registration API signature changes (but backward compatible)
- ⚠️ Address not in User model (need to decide where to store)

---



## 7. Implementation Roadmap

### 7.1 PHASE 1: Critical Fixes (IMMEDIATE - Priority 🔴)

**Goal:** Restore lead quality and basic functionality

**Tasks:**

1. **Update HomeownerSignupModal** (1 hour)
   - Add `homeownerInfo` prop to interface
   - Pass name, phone, address to registration API

2. **Update page.tsx** (30 min)
   - Pass `homeownerInfo` to HomeownerSignupModal
   - Pass `homeownerInfo.address` to lead creation API

3. **Update Registration API** (1 hour)
   - Accept name, phone fields
   - Validate phone format
   - Store in User model

4. **Update Lead Creation** (30 min)
   - Ensure propertyAddress is included in payload
   - Verify Lead.phoneNumber copies from User.phone correctly

5. **Testing** (2 hours)
   - End-to-end guest flow test
   - Verify User.name and User.phone are populated
   - Verify Lead.phoneNumber and Lead.address are populated
   - Test phone verification flow

**Total Estimated Time:** 5 hours

**Success Criteria:**
- ✅ User.name populated after signup
- ✅ User.phone populated after signup
- ✅ Lead.phoneNumber populated from User.phone
- ✅ Lead.address populated from homeownerInfo
- ✅ No NULL values in critical fields

---

### 7.2 PHASE 2: Address Storage Decision (FOLLOW-UP - Priority 🟠)

**Goal:** Decide where to permanently store user address

**Options:**

**Option A: Add address to User model**
```prisma
model User {
  // ... existing fields ...
  address String? // User's primary address
}
```
**Pros:** Centralized, easy to access
**Cons:** User may have multiple properties

**Option B: Keep address in Lead model only**
**Pros:** Address is property-specific, not user-specific
**Cons:** First-time address must be passed from frontend

**Option C: Create PropertyAddress table**
```prisma
model PropertyAddress {
  id        String @id @default(cuid())
  userId    String
  address   String
  postcode  String
  isPrimary Boolean @default(false)
  user      User   @relation(fields: [userId], references: [id])
}
```
**Pros:** Supports multiple properties per user
**Cons:** Adds complexity

**Recommended:** Option B (keep in Lead model) for now, add PropertyAddress table in future if needed

---

### 7.3 PHASE 3: Phone Verification Enhancement (FUTURE - Priority 🟡)

**Goal:** Implement complete phone verification flow

**Tasks:**

1. Add phone verification modal (OTP input)
2. Integrate with Twilio/AWS SNS for SMS
3. Update User.phoneVerified after successful verification
4. Test second lead submission with verification

**Estimated Time:** 8-12 hours (low priority until Phases 1-2 complete)

---

## 8. Testing Plan

### 8.1 Manual Testing Checklist

**Test Scenario 1: New Guest User Flow**

1. ✅ Open homepage, fill InstantQuoteForm
2. ✅ Click "Get Quotes", select quote type in QuoteOptionsModal
3. ✅ Fill HomeownersInfoForm with:
   - Name: "John Smith"
   - Phone: "0412345678"
   - Address: "123 Main St, Sydney NSW 2000"
4. ✅ Click Continue, fill HomeownerSignupModal with:
   - Email: "test@example.com"
   - Password: "Test1234"
5. ✅ Submit signup
6. ✅ Wait for session to be ready
7. ✅ Verify lead created successfully

**Validation:**
- ✅ Check database: User.name = "John Smith"
- ✅ Check database: User.phone = "0412345678"
- ✅ Check database: Lead.phoneNumber = "0412345678"
- ✅ Check database: Lead.address = "123 Main St, Sydney NSW 2000"
- ✅ Check frontend: Success modal displayed
- ✅ Check frontend: Dashboard shows user name

**Test Scenario 2: Phone Verification Flow**

1. ✅ Create first lead (should succeed)
2. ✅ Try to create second lead
3. ✅ Verify phone verification prompt appears
4. ✅ Verify phone number pre-filled from User.phone
5. ✅ Complete phone verification
6. ✅ Verify User.phoneVerified = true
7. ✅ Create second lead (should succeed)

---

### 8.2 Database Queries for Verification

```sql
-- Check User data after signup
SELECT id, name, email, phone, phoneVerified, createdAt 
FROM users 
WHERE email = 'test@example.com';

-- Check Lead data after creation
SELECT id, homeownerId, phoneNumber, phoneVerified, address, postcode, location 
FROM leads 
WHERE homeownerId = 'USER_ID_FROM_ABOVE';

-- Verify data consistency
SELECT 
  u.name AS user_name,
  u.phone AS user_phone,
  u.phoneVerified AS user_phone_verified,
  l.phoneNumber AS lead_phone,
  l.phoneVerified AS lead_phone_verified,
  l.address AS lead_address
FROM leads l
JOIN users u ON l.homeownerId = u.id
WHERE u.email = 'test@example.com';
```

---

## 9. Migration Strategy (Existing Users)

**Problem:** Users who already signed up have NULL name/phone in database

**Solution Options:**

**Option A: Prompt on Next Login**
- Show profile completion modal on next dashboard visit
- Collect missing name and phone
- Update User model

**Option B: Email Campaign**
- Send email asking users to complete profile
- Provide link to profile page
- Incentivize completion (e.g., "Improve your lead quality")

**Option C: Do Nothing**
- Let existing users continue with incomplete profiles
- Only fix for new signups
- Manual admin intervention for critical cases

**Recommended:** Option A (least intrusive, highest completion rate)

---

## 10. Conclusion

### Summary of Critical Issues:

1. ❌ **Name not stored in User model** → Fix by passing to registration API
2. ❌ **Phone not stored in User model** → Fix by passing to registration API
3. ❌ **Address not passed to lead creation** → Fix by including in API payload
4. ❌ **Phone verification broken** → Will be fixed once User.phone is populated

### Recommended Actions:

1. **IMMEDIATE:** Implement Solution A (Phase 1) to fix data flow
2. **THIS WEEK:** Complete testing and deploy to production
3. **NEXT SPRINT:** Implement phone verification enhancement (Phase 3)
4. **MONITOR:** Track lead quality metrics, user completion rates

### Success Metrics:

- Lead.phoneNumber NULL rate: 0% (currently ~100%)
- Lead.address NULL rate: 0% (currently ~100%)
- User.name NULL rate: 0% for new signups
- User.phone NULL rate: 0% for new signups
- Phone verification completion rate: >80%

---

## Appendix A: Code References

### Files Reviewed:
- `src/components/HomeownersInfoForm.tsx` (data collection)
- `src/components/HomeownerSignupModal.tsx` (registration UI)
- `src/app/page.tsx` (guest flow orchestration)
- `src/app/api/auth/register/homeowner/route.ts` (registration API)
- `src/app/api/leads/route.ts` (lead creation API)
- `src/lib/services/lead-service.ts` (lead creation logic)
- `prisma/schema.prisma` (database models)

### Key Line Numbers:
- HomeownersInfoForm data collection: lines 175-226
- page.tsx homeownerInfo state: line 47
- page.tsx handleHomeownerInfoContinue: line 128
- page.tsx HomeownerSignupModal render: line 355 (MISSING homeownerInfo prop)
- HomeownerSignupModal registration call: line 162-168 (only email/password)
- Registration API body destructure: line 16-17 (only email/password)
- lead-service.ts phoneNumber copy: line 212
- Lead creation propertyAddress: missing in page.tsx payload (line 191-203)

---

**Report Prepared By:** AI Assistant (GitHub Copilot)  
**Audit Duration:** 45 minutes  
**Files Analyzed:** 7 core files + database schema  
**Next Review:** After Phase 1 implementation (ETA: 1 week)
