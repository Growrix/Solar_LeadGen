# Installer Assignment Enhancement - Audit Report
**Date**: November 23, 2025  
**Phase**: 25 - Enhanced Installer Assignment with Real Data  
**Scope**: Company names, postcodes, profile preview, smart suggestions, bulk messaging

---

## 1. Current Implementation Analysis

### 1.1 Frontend Component
**File**: `src/components/admin/AdminLeadManagementModal.tsx`

**Current Installer Interface**:
```typescript
interface Installer {
  id: string;
  name: string | null;
  email: string;
  companyName: string | null;
  installerVerified: boolean;
  postcode: string | null;
}
```

**Current Features**:
- ✅ Basic search by query
- ✅ Filter mode: all / verified / unverified
- ✅ Postcode match toggle
- ✅ Multi-select installers
- ✅ Smart suggestions (postcode match + verified)
- ✅ Bulk messaging textarea
- ⚠️ **API ENDPOINT MISSING**: Currently calls `/api/admin/users?role=INSTALLER` which **does not exist**
- ❌ No company name display (shows name instead)
- ❌ No postcode display (UI ready but data missing)
- ❌ No profile preview on hover/click
- ❌ No performance/activity data
- ❌ No real smart suggestions based on performance

### 1.2 Backend APIs

**Existing Endpoint**: `/api/admin/installers/list` (GET)
- ✅ Returns installer data with search, pagination
- ✅ Includes `installerVerification` relation (company name, phone, address, postcodes)
- ✅ Supports filtering by verification status
- ❌ No performance metrics
- ❌ No activity/responsiveness data

**Schema Analysis** (`prisma/schema.prisma`):

**User Model** (Installer):
```prisma
model User {
  email                 String    @unique
  role                  UserRole  @default(HOMEOWNER)
  companyName           String?   // ⚠️ Deprecated, use InstallerVerification
  postcode              String?   // ⚠️ Deprecated, use InstallerVerification
  installerVerified     Boolean   @default(false)
  installerVerification InstallerVerification?
}
```

**InstallerVerification Model** (Source of truth for business data):
```prisma
model InstallerVerification {
  id                 String   @id
  userId             String   @unique
  companyName        String?
  representativeName String?
  phone              String?
  address            String?
  postcodes          String?  // Comma-separated postcodes
  status             VerificationStatus
  // ... other fields
}
```

**Missing Data for Enhancements**:
- ❌ No `InstallerPerformance` model
- ❌ No `InstallerActivity` tracking
- ❌ No response time metrics
- ❌ No lead acceptance rate
- ❌ No recent activity timestamp

###1.3 Data Flow Issues

**Current Flow** (BROKEN):
```
AdminLeadManagementModal 
  → fetch('/api/admin/users?role=INSTALLER') ❌ 404 NOT FOUND
  → No data returned
  → UI shows "No installers found"
```

**Correct Flow Should Be**:
```
AdminLeadManagementModal 
  → fetch('/api/admin/installers/list?installerVerified=true/false')
  → Returns installers with verification data
  → Display company names, postcodes, verification status
```

---

## 2. Gap Analysis

| Feature | Audit Finding | Gap | Solution |
|---------|---------------|-----|----------|
| **Company Name Display** | Not shown (uses `name` field) | HIGH | Use `installerVerification.companyName` |
| **Postcodes Display** | Not shown | HIGH | Use `installerVerification.postcodes` (comma-separated) |
| **API Endpoint** | Calls non-existent `/api/admin/users` | CRITICAL | Change to `/api/admin/installers/list` |
| **Profile Preview** | Not implemented | MEDIUM | Build hover card with company, phone, address, verification status |
| **Performance Data** | No backend support | HIGH | Create lightweight in-memory tracking OR derive from existing data |
| **Smart Suggestions** | Basic postcode match only | MEDIUM | Enhance algorithm: postcode + verified + recent activity (if available) |
| **Bulk Messaging** | UI present, backend stub | MEDIUM | Wire to existing notification system or create simple email/SMS dispatch |

---

## 3. Implementation Plan

### Phase 25 Tasks

#### 25.1 Fix Critical API Integration ✅ PRIORITY
- Update `AdminLeadManagementModal.tsx` fetch URL
- Change from `/api/admin/users?role=INSTALLER` → `/api/admin/installers/list`
- Update response parsing to handle `installerVerification` nested object

#### 25.2 Enhance Installer Interface
**Add to existing interface**:
```typescript
interface Installer {
  id: string;
  email: string;
  installerVerified: boolean;
  phoneVerified: boolean;
  installerVerification: {
    companyName: string | null;
    representativeName: string | null;
    phone: string | null;
    address: string | null;
    postcodes: string | null; // Comma-separated
    status: string;
  } | null;
}
```

#### 25.3 Update UI to Display Real Data
- Show `installerVerification.companyName` instead of `name`
- Parse `installerVerification.postcodes` and display as chips
- Add verification status badge (Approved/Pending/Rejected)

#### 25.4 Build Profile Preview Component
**New Component**: `InstallerProfilePreview.tsx`
- Popover triggered on installer row click/hover
- Display:
  - Company name
  - Representative name
  - Phone
  - Address
  - Service postcodes (as chips)
  - Verification status badge
  - Placeholder for performance metrics (future)

#### 25.5 Enhance Smart Suggestions Algorithm
**Current**: Postcode match + verified status  
**Enhanced**:
1. Postcode match (primary factor)
2. Verification status (verified > unverified)
3. Active status (`isActive` field)
4. Recent creation (newer installers get visibility)

**Optional Future** (Phase 26):
- Response time metrics
- Lead acceptance rate
- Customer ratings

#### 25.6 Wire Bulk Messaging Backend
**Options**:
1. **Quick Win**: Send in-app notifications to selected installers
2. **Full Solution**: Create email/SMS dispatch for lead notification

**Implementation**:
- Use existing `LeadAssignment` notifications
- Bulk create assignments with custom message
- Send notification flag triggers email/SMS

#### 25.7 Add Performance Placeholders
**UI Placeholders** (no backend yet):
- "Recent Activity: Active" (based on `updatedAt`)
- "Leads Assigned: N/A" (future tracking)
- "Response Rate: N/A" (future tracking)

---

## 4. Technical Decisions

### 4.1 Data Source Priority
1. **Primary Source**: `InstallerVerification` model (company, phone, address, postcodes)
2. **Fallback**: `User` model fields (deprecated but may contain legacy data)
3. **Validation**: If `installerVerification` is null, show "Profile Incomplete" badge

### 4.2 Postcode Matching Logic
**Current** (client-side):
```typescript
const leadPostcodes = lead.postcode.split(',').map(p => p.trim().toLowerCase());
const instPostcodes = installer.postcode?.split(',').map(p => p.trim().toLowerCase()) || [];
return leadPostcodes.some(lp => instPostcodes.some(ip => ip.includes(lp) || lp.includes(ip)));
```

**Enhanced** (use InstallerVerification.postcodes):
```typescript
const leadPostcodes = lead.postcode.split(',').map(p => p.trim().toLowerCase());
const instPostcodes = installer.installerVerification?.postcodes?.split(',').map(p => p.trim().toLowerCase()) || [];
return installerVerified && leadPostcodes.some(lp => instPostcodes.some(ip => ip.includes(lp) || lp.includes(ip)));
```

### 4.3 Performance Tracking Strategy
**Phase 25** (Immediate):
- No dedicated tracking model
- Use heuristics from existing data:
  - `User.createdAt` → "Account Age"
  - `User.updatedAt` → "Last Active"
  - `User.isActive` → "Active/Paused"

**Phase 26** (Future):
- Add `InstallerMetrics` model:
  - `leadsAssigned: Int`
  - `leadsAccepted: Int`
  - `avgResponseTime: Float` (hours)
  - `lastActivityAt: DateTime`

### 4.4 Bulk Messaging Implementation
**Phase 25** (Simple):
- Reuse existing `LeadAssignment` creation
- Pass `notes` field as bulk message
- Set `notified: true` to trigger email

**Phase 26** (Advanced):
- Dedicated bulk messaging API
- Email templates
- SMS integration

---

## 5. Files to Modify

### 5.1 Frontend
1. **`src/components/admin/AdminLeadManagementModal.tsx`**
   - Fix API endpoint (line ~123)
   - Update `Installer` interface
   - Update UI to display company names, postcodes
   - Enhance smart suggestions algorithm

2. **`src/components/admin/InstallerProfilePreview.tsx`** (NEW)
   - Profile popover component
   - Display verification data
   - Performance placeholders

### 5.2 Backend (Optional Enhancements)
1. **`src/app/api/admin/installers/list/route.ts`**
   - Already returns correct data ✅
   - Optional: Add performance metrics in future phase

2. **`src/app/api/admin/leads/[id]/assign/route.ts`**
   - Already supports bulk assignment ✅
   - Verify `notes` field is passed through

### 5.3 Documentation
1. **Update `tasks.md`** with Phase 25 tasks
2. **This audit report** as baseline reference

---

## 6. Testing Checklist

### 6.1 API Integration
- [ ] Fetch installers successfully from `/api/admin/installers/list`
- [ ] Response includes `installerVerification` data
- [ ] Pagination works correctly
- [ ] Search filter works (company name, representative, phone)
- [ ] Verification filter works (verified/unverified)

### 6.2 UI Display
- [ ] Company name displays correctly
- [ ] Postcodes display as comma-separated or chips
- [ ] Verification status badge shows (Approved/Pending/Rejected)
- [ ] "Profile Incomplete" badge for missing verification
- [ ] Installer selection (multi-select) works
- [ ] Search filters installer list

### 6.3 Smart Suggestions
- [ ] Recommended installers appear at top
- [ ] Postcode match prioritized
- [ ] Verified installers prioritized
- [ ] "Select All Recommended" button works

### 6.4 Profile Preview
- [ ] Click installer row opens preview popover
- [ ] Preview shows company, representative, phone, address
- [ ] Postcodes display correctly
- [ ] Verification status clear
- [ ] Close preview works

### 6.5 Bulk Messaging
- [ ] Bulk message textarea accepts input
- [ ] Message passed to assignment API
- [ ] Notifications sent to selected installers (verify via logs)

### 6.6 Design System Compliance
- [ ] All semantic classes used (no hardcoded colors)
- [ ] Dark/Light/Purple themes work
- [ ] Responsive at 320px, 375px, 768px, 1024px, 1440px
- [ ] Accessibility (keyboard nav, ARIA labels)

---

## 7. Success Criteria

1. ✅ API integration fixed - installers load successfully
2. ✅ Company names and postcodes display correctly
3. ✅ Profile preview functional with real data
4. ✅ Smart suggestions enhanced (postcode + verified + active)
5. ✅ Bulk messaging wired to backend notification system
6. ✅ No TypeScript/build errors
7. ✅ Design system compliance (0/0/0/0/0/0 verification)
8. ✅ Multi-theme support maintained
9. ✅ User can test full assignment workflow end-to-end

---

## 8. Out of Scope (Phase 26+)

- Real-time performance metrics tracking
- Response time analytics
- Lead acceptance rate calculations
- Customer rating system
- Geospatial service area visualization (beyond postcode chips)
- Advanced bulk messaging (SMS, email templates)

---

## 9. Rollback Plan

**Before Starting**:
1. Commit current state: "chore: checkpoint before Phase 25 installer enhancements"
2. Push to remote
3. Note commit hash for rollback

**If Issues Arise**:
```bash
git reset --hard <commit-hash>
git push --force
```

---

## 10. Next Steps

1. ✅ Commit checkpoint (this audit completion)
2. Add Phase 25 tasks to `tasks.md`
3. Implement 25.1 (API fix) - CRITICAL PATH
4. Implement 25.2-25.3 (UI updates)
5. Implement 25.4 (Profile preview)
6. Implement 25.5 (Smart suggestions)
7. Implement 25.6 (Bulk messaging)
8. Test end-to-end
9. Multi-theme & responsive validation
10. Commit final implementation

---

**Audit Complete** - Ready for Phase 25 implementation.
