# Admin Homeowners Management Page - Comprehensive Audit Report

**Date:** November 17, 2025  
**Auditor:** GitHub Copilot  
**Status:** 🔴 CRITICAL ISSUES FOUND

---

## 📋 EXECUTIVE SUMMARY

The admin homeowners management page (`/admin/homeowners`) is currently **partially functional** but has **critical data gaps**. The page shows homeowners list but is **missing critical user information** (name, address, IP address, quote type) that should be displayed to admins.

### Key Findings:
1. ✅ **Working:** Email, phone, postcode, status, lead usage, registration date
2. ❌ **Broken:** User names not displaying (showing "No name" for all users)
3. ❌ **Missing:** Address, IP address, quote type (residential/commercial)
4. ⚠️ **Data Collection:** Some data IS being collected but NOT stored in User model

---

## 🔍 CURRENT STATE ANALYSIS

### 1. Frontend Component (`AdminHomeownersList.tsx`)

**Location:** `src/components/AdminHomeownersList.tsx`

**Current Columns Displayed:**
| Column | Data Source | Status |
|--------|-------------|---------|
| Homeowner | `user.name`, `user.email` | ⚠️ Email works, name shows "No name" |
| Contact | `user.phone`, `user.phoneVerified` | ✅ Working |
| Postcode | `user.postcode` | ✅ Working |
| Status | `user.isActive` | ✅ Working |
| Lead Usage | `user.leadSubmissionCount`, `user.leadSubmissionLimit` | ✅ Working |
| Remaining | `calculated` | ✅ Working |
| Registered | `user.createdAt` | ✅ Working |

**Missing Columns (Requested):**
- ❌ **Address** - Not in User model, stored in Lead model
- ❌ **IP Address** - Collected but not stored in User model
- ❌ **Quote Type** - Lead-level data, not user-level

---

### 2. Backend API (`/api/admin/homeowners`)

**Location:** `src/app/api/admin/homeowners/route.ts`

**Current Query:**
```typescript
SELECT
  "id",
  "name",           // ⚠️ Field exists but returns NULL
  "email",          // ✅ Works
  "phone",          // ✅ Works
  "postcode",       // ✅ Works
  "createdAt",      // ✅ Works
  "isActive",       // ✅ Works
  "phoneVerified",  // ✅ Works
  "leadSubmissionCount",  // ✅ Works
  "leadSubmissionLimit"   // ✅ Works
FROM "users"
WHERE "role" = 'HOMEOWNER'
```

**Issues:**
- ✅ Query is correct
- ❌ `name` field exists in database but is NOT being populated during signup
- ❌ No fields for: address, ipAddress, quote type preference

---

### 3. Database Schema (Prisma)

**User Model Fields:**
```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  name                  String?   // ⚠️ Optional, not always populated
  phone                 String?
  postcode              String?
  businessAddress       String?   // Only for installers
  // ❌ Missing: ipAddress
  // ❌ Missing: signupIp
  // ❌ Missing: lastLoginIp
}
```

**Lead Model (Where Additional Data Lives):**
```prisma
model Lead {
  id           String  @id
  homeownerId  String
  name         String?   // ✅ Homeowner name stored here
  address      String?   // ✅ Property address stored here
  quoteType    LeadQuoteType  // ✅ CALL_VISIT, WRITTEN_QUOTE, BIDDING
  projectType  String    // residential or commercial
}
```

**AuditLog Model (Where IP is Stored):**
```prisma
model AuditLog {
  id         String   @id
  userId     String?
  ipAddress  String?   // ✅ IP captured here
  userAgent  String?
  action     String
  createdAt  DateTime
}
```

---

## 🕵️ DATA COLLECTION POINTS

### Registration Flow

**Endpoint:** `/api/auth/register/homeowner`  
**File:** `src/app/api/auth/register/homeowner/route.ts`

**Data Collected:**
```typescript
{
  email: string,      // ✅ Stored in User.email
  password: string,   // ✅ Hashed and stored in User.password
  name: string,       // ✅ Stored in User.name (IF PROVIDED)
  phone: string,      // ✅ Stored in User.phone (IF PROVIDED)
  address: string     // ❌ IGNORED - not in User model
}
```

**Issues:**
1. ⚠️ **Name field is optional** - users can skip it, leading to "No name"
2. ❌ **Address is not stored** during registration
3. ❌ **IP address is not captured** during registration

---

### Lead Creation Flow

**Endpoint:** `/api/leads` (POST)  
**File:** `src/app/api/leads/route.ts`

**Data Collected:**
```typescript
{
  // ✅ IP Address captured
  ipAddress: request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown',
             
  // ✅ User Agent captured
  userAgent: request.headers.get('user-agent') || 'unknown',
  
  // ✅ Property address
  propertyAddress: body.propertyAddress || body.address,
  
  // ✅ Quote type
  quoteType: body.quoteType, // CALL_VISIT, WRITTEN_QUOTE, BIDDING
  
  // ✅ Property type
  propertyType: body.propertyType, // 'residential' or 'commercial'
  
  // ✅ Homeowner contact info
  name: body.name,
  phoneNumber: body.phoneNumber,
}
```

**Storage:**
- ✅ **IP Address** → Stored in `AuditLog.ipAddress` (via `createLead` service)
- ✅ **Address** → Stored in `Lead.address`
- ✅ **Quote Type** → Stored in `Lead.quoteType`
- ✅ **Property Type** → Stored in `Lead.propertyType`
- ✅ **Name** → Stored in `Lead.name` (per-lead basis)

---

## 🚨 ROOT CAUSE ANALYSIS

### Issue 1: Missing User Names

**Symptom:** Admin page shows "No name" for all homeowners

**Root Cause:**
1. Registration form (`HomeownersInfoForm`) includes name field
2. `/api/auth/register/homeowner` endpoint accepts name
3. BUT: Name is **optional** in User model (`name String?`)
4. If user skips name during signup → stored as `NULL`
5. Frontend shows "No name" when `user.name === null`

**Solution:** Make name **mandatory** during signup OR pull from first lead

---

### Issue 2: Address Not Shown

**Symptom:** No address column in admin homeowners table

**Root Cause:**
1. User model has NO `address` field (only `businessAddress` for installers)
2. Homeowner addresses are stored **per-lead** in `Lead.address`
3. A homeowner can have **multiple addresses** (one per lead/property)

**Solution Options:**
- **Option A:** Show "Primary Address" from first lead
- **Option B:** Show "Latest Address" from most recent lead
- **Option C:** Show count of unique addresses ("3 properties")

---

### Issue 3: IP Address Not Shown

**Symptom:** No IP address column in admin table

**Root Cause:**
1. User model has NO `ipAddress` field
2. IP is captured during lead creation → stored in `AuditLog`
3. IP is NOT captured during registration
4. Multiple IPs exist per user (signup IP, lead IPs, login IPs)

**Solution Options:**
- **Option A:** Add `signupIp` field to User model
- **Option B:** Show "First IP" from earliest AuditLog entry
- **Option C:** Show "Latest IP" from most recent activity

---

### Issue 4: Quote Type Not Shown

**Symptom:** No quote type preference column

**Root Cause:**
1. User model has NO `preferredQuoteType` field
2. Quote type is **lead-specific**, not user-specific
3. Same user can submit CALL_VISIT, WRITTEN_QUOTE, or BIDDING leads

**Solution Options:**
- **Option A:** Show "Most Used Quote Type" (aggregate from leads)
- **Option B:** Show quote type distribution ("2 Call/Visit, 1 Written")
- **Option C:** Add user preference field (but override per-lead)

---

## 📊 DATA AVAILABILITY MATRIX

| Data Field | User Model | Lead Model | AuditLog | Available? |
|------------|------------|------------|----------|------------|
| Name | ✅ `name` | ✅ `name` | ❌ | ✅ YES |
| Email | ✅ `email` | ❌ | ❌ | ✅ YES |
| Phone | ✅ `phone` | ✅ `phoneNumber` | ❌ | ✅ YES |
| Postcode | ✅ `postcode` | ✅ `postcode` | ❌ | ✅ YES |
| Address | ❌ | ✅ `address` | ❌ | ⚠️ Per-Lead |
| IP Address | ❌ | ❌ | ✅ `ipAddress` | ⚠️ Per-Action |
| Quote Type | ❌ | ✅ `quoteType` | ❌ | ⚠️ Per-Lead |
| Property Type | ❌ | ✅ `propertyType` | ❌ | ⚠️ Per-Lead |
| Signup Date | ✅ `createdAt` | ❌ | ❌ | ✅ YES |
| Last Login | ✅ `lastLoginAt` | ❌ | ❌ | ✅ YES |

---

## 🎯 RECOMMENDED SOLUTIONS

### Solution 1: Fix Missing Names (Immediate)

**Approach:** Backfill User.name from Lead.name where User.name is NULL

```sql
-- Backfill missing names from first lead
UPDATE users u
SET name = (
  SELECT l.name 
  FROM leads l 
  WHERE l."homeownerId" = u.id 
    AND l.name IS NOT NULL 
  ORDER BY l."createdAt" ASC 
  LIMIT 1
)
WHERE u.role = 'HOMEOWNER' 
  AND u.name IS NULL;
```

### Solution 2: Add Aggregated Data to API Response

**Modify `/api/admin/homeowners/route.ts` to include:**

```typescript
interface HomeownerWithAggregates {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  postcode: string | null;
  // ... existing fields
  
  // NEW AGGREGATED FIELDS
  primaryAddress: string | null;  // From first lead
  signupIp: string | null;        // From first audit log
  latestIp: string | null;        // From latest audit log
  quoteTypePreference: string | null; // Most used quote type
  residentialCount: number;       // Count of residential leads
  commercialCount: number;        // Count of commercial leads
}
```

### Solution 3: Enhance Database Schema (Long-term)

**Add tracking fields to User model:**

```prisma
model User {
  // ... existing fields
  
  // NEW TRACKING FIELDS
  signupIp         String?   // IP at registration
  signupUserAgent  String?   // Browser at registration
  lastLoginIp      String?   // IP at last login
  primaryAddress   String?   // Cached from latest lead
  preferredQuoteType LeadQuoteType? // User's default preference
}
```

---

## 📝 IMPLEMENTATION PLAN

### Phase 1: Data Backfill & Immediate Fixes (Priority: P0)

**Tasks:**
1. ✅ Run SQL backfill for missing names
2. ✅ Make name field **required** in registration form
3. ✅ Update API to pull names from User table correctly

### Phase 2: Add Aggregated Columns (Priority: P1)

**Tasks:**
1. ✅ Modify `/api/admin/homeowners` to join with Leads table
2. ✅ Add computed fields: primaryAddress, signupIp, quoteTypePreference
3. ✅ Update `AdminHomeownersList.tsx` to display new columns
4. ✅ Add column sorting and filtering for new fields

### Phase 3: Capture IP at Registration (Priority: P1)

**Tasks:**
1. ✅ Modify `/api/auth/register/homeowner` to capture IP
2. ✅ Add `signupIp` and `signupUserAgent` to User model
3. ✅ Update Prisma schema and run migration
4. ✅ Display signup IP in admin table

### Phase 4: Quote Type Aggregation (Priority: P2)

**Tasks:**
1. ✅ Add aggregate query to count leads by quote type
2. ✅ Show "2 Residential / 1 Commercial" in admin table
3. ✅ Add filter chips for "Residential Only" / "Commercial Only"

---

## 🧪 TESTING CHECKLIST

### Before Implementation:
- [ ] Export current homeowners data as baseline
- [ ] Document count of users with NULL names
- [ ] Verify API returns expected fields

### After Phase 1:
- [ ] Verify all homeowners have names (no "No name")
- [ ] Test new registration requires name
- [ ] Verify existing functionality not broken

### After Phase 2:
- [ ] Verify address column shows correct data
- [ ] Verify IP column shows signup IP
- [ ] Verify quote type shows distribution
- [ ] Test sorting by new columns
- [ ] Test filtering by new fields

### After Phase 3:
- [ ] Verify new signups capture IP
- [ ] Verify existing users backfilled with audit log IPs
- [ ] Test IP display in admin table

---

## 🚦 SUCCESS CRITERIA

### Definition of Done:

1. ✅ **Name Column:** All homeowners show actual names (no "No name")
2. ✅ **Address Column:** Shows primary/latest property address
3. ✅ **IP Address Column:** Shows signup IP (or first/latest IP)
4. ✅ **Quote Type Column:** Shows residential/commercial preference or count
5. ✅ **No Broken Functionality:** All existing features still work
6. ✅ **Performance:** API response time < 500ms for 1000 homeowners
7. ✅ **Data Accuracy:** All displayed data matches database records

---

## 📚 RELATED DOCUMENTATION

- **Auth System Audit:** `DOC/nextjsAuth.md/AuditNextjsAuth.md`
- **Lead Generation System:** `DOC/AUDIT-REPORTS/LEAD-GENERATION-SYSTEM/`
- **Prisma Schema:** `prisma/schema.prisma`
- **Constitution:** `DOC/constitution.md`

---

## 🔗 AFFECTED FILES

### Frontend:
- `src/components/AdminHomeownersList.tsx`
- `src/app/admin/homeowners/page.tsx`

### Backend:
- `src/app/api/admin/homeowners/route.ts`
- `src/app/api/auth/register/homeowner/route.ts`
- `src/lib/services/lead-service.ts`

### Database:
- `prisma/schema.prisma`
- `prisma/migrations/` (new migration needed)

---

## ✅ NEXT STEPS

1. **Review this audit** with project owner
2. **Get approval** for implementation plan
3. **Create Phase in tasks.md** for tracking
4. **Start Phase 1 implementation** (data backfill + name fixes)
5. **Test thoroughly** after each phase
6. **Document changes** in changelog

---

**End of Audit Report**
