# Installer Leadfeed Integration Audit Report

**Date:** 2025-11-24  
**Auditor:** GitHub Copilot (Claude Sonnet 4.5)  
**Status:** ✅ IMPLEMENTATION COMPLETE - Testing in Progress  
**Priority:** HIGH → RESOLVED

---

## Executive Summary

**Problem (RESOLVED):** Admin could assign leads to specific installers via `AdminLeadManagementModal`, but installer dashboard pages showed **mock data** instead of real assigned leads from the database.

**Solution Implemented:**
- ✅ Fixed LeadAssignment creation in approve route (commit fedf2d1)
- ✅ Created GET /api/installer/leads/assigned endpoint (~114 lines)
- ✅ Created src/types/installer.ts with type definitions
- ✅ Removed mock data from 2 installer dashboard pages (commit fa59965)
- ✅ Added loading/error states and type adapters

**Current Status:** 
- ✅ Phase 23.1-23.5 complete (implementation)
- 🔄 Phase 23.6 in progress (manual browser testing required)
- ⏳ Phase 23.7 pending (documentation & final commit)

**Test Plan:** See `DOC/TESTING/PHASE-23-INSTALLER-LEADFEED-TEST-PLAN.md`

---

## 1. Current State Analysis

### 1.1 Admin Side (✅ WORKING)

#### **AdminLeadManagementModal.tsx**
- **Location:** `src/components/admin/AdminLeadManagementModal.tsx`
- **Status:** ✅ Fully functional (all bugs resolved as of commit 7e8162a)
- **Functionality:**
  - Admin can assign leads to specific installers
  - Filters installers by matching postcodes
  - Creates `LeadAssignment` records in database
  - Updates lead price, countdown timer, admin notes
  - Real-time UI refresh after assignments

#### **Backend API: Lead Approval with Assignment**
- **Endpoint:** `POST /api/leads/[id]/approve`
- **File:** `src/app/api/leads/[id]/approve/route.ts`
- **Request Body:**
  ```typescript
  {
    price?: number,
    assignTo?: 'ALL' | string[], // Array of installer IDs
    isHot?: boolean,
    enableCountdown?: boolean,
    countdownDays?: number
  }
  ```
- **What it does:**
  1. Approves lead (status: DRAFT → APPROVED)
  2. Sets visibility: PUBLIC (assignTo='ALL') or PRIVATE (specific installers)
  3. Creates countdown timer (expiresAt)
  4. Sets lead price
  5. Creates notifications for assigned installers
  6. ⚠️ **ISSUE:** Does NOT create LeadAssignment records!

#### **Database Schema: LeadAssignment Model**
```prisma
model LeadAssignment {
  id            String   @id @default(cuid())
  leadId        String
  installerId   String
  assignedBy    String   // Admin user ID
  assignedAt    DateTime @default(now())
  notes         String?
  notified      Boolean  @default(false)
  
  lead          Lead     @relation("lead_assignments", fields: [leadId], references: [id], onDelete: Cascade)
  installer     User     @relation("installer_assignments", fields: [installerId], references: [id], onDelete: Cascade)
  admin         User     @relation("admin_assignments", fields: [assignedBy], references: [id])
  
  @@unique([leadId, installerId])
  @@index([leadId])
  @@index([installerId])
  @@index([assignedBy])
}
```

**Key Observations:**
- Model is well-structured with proper relations
- Unique constraint prevents duplicate assignments
- Indexes optimized for queries
- Missing field: `status` (pending, accepted, removed) - would be useful for tracking

---

### 1.2 Installer Side (❌ BROKEN - MOCK DATA)

#### **Page 1: /installer/(dashboard)/leads/page.tsx**
- **Purpose:** Display installer's purchased/assigned leads
- **Current Implementation:**
  ```typescript
  // Lines 10-11: Mock installer data
  const mockInstaller = {
    id: 1,
    companyName:"Solar Experts Inc.",
    email:"contact@solarexperts.com",
    phone:"+1 (555) 123-4567",
    serviceAreas: ["Sydney","Melbourne","Brisbane"],
    isApproved: true,
    creditBalance: 150,
    totalUnlocks: 42,
    successRate: 85.5
  };
  
  // Line 45: Component receives mock data
  <InstallerLeadFeed
    installer={mockInstaller}
    onUnlockLead={handleUnlockLead}
    onSubmitQuote={handleSubmitQuote}
    onStartChat={handleStartChat}
  />
  ```
- **Status:** ❌ Not connected to real data

#### **Page 2: /installer/(dashboard)/lead-feed/page.tsx**
- **Purpose:** Display available leads feed
- **Current Implementation:**
  ```typescript
  // Lines 6-7: Mock installer data
  const mockInstaller = {
    id: 1,
    companyName: 'Solar Solutions Inc.',
    email: 'contact@solarsolutions.com',
    phone: '+1234567890',
    serviceAreas: ['Sydney', 'Melbourne', 'Brisbane'],
    isApproved: true,
    creditBalance: 50,
    totalUnlocks: 25,
    successRate: 85,
  };
  
  // Line 35: Component receives mock data
  <InstallerLeadFeed 
    installer={mockInstaller} 
    onUnlockLead={handleUnlockLead} 
    onSubmitQuote={handleSubmitQuote} 
    onStartChat={handleStartChat} 
  />
  ```
- **Status:** ❌ Not connected to real data

#### **Page 3: /installer/(dashboard)/marketplace/page.tsx**
- **Purpose:** Lead marketplace for purchasing public leads
- **Current Implementation:**
  - Line 129: `paymentIntentId: 'bypass_mock'` (Stripe bypass for dev)
  - Uses `GET /api/leads?marketplace=true` to fetch public leads ✅
  - Has real database connection for public leads
- **Status:** ⚠️ Partially functional (public leads work, but assignment display missing)

#### **Component: InstallerLeadFeed.tsx**
- **Location:** `src/components/InstallerLeadFeed.tsx`
- **Props:**
  ```typescript
  interface InstallerLeadFeedProps {
    installer: InstallerProfile;
    onUnlockLead: (leadId: number) => Promise<boolean>;
    onSubmitQuote: (leadId: number, quoteData: any) => Promise<boolean>;
    onStartChat: (leadId: number) => void;
  }
  ```
- **Expected Data:** Receives installer profile + lead list (currently mock)
- **Status:** ❌ Component needs lead data from API

---

## 2. Gap Analysis

### 2.1 Missing API Endpoints

#### **Endpoint 1: Get Assigned Leads for Installer**
- **Required:** `GET /api/installer/leads/assigned`
- **Authentication:** Session-based (installer role only)
- **Query Parameters:**
  - `status?` - Filter by assignment status (if we add status field)
  - `expired?` - Include/exclude expired leads
- **Response:**
  ```typescript
  {
    success: true,
    leads: [
      {
        id: string,
        homeownerId: string,
        status: string,
        quoteType: string,
        postcode: string,
        location: string,
        state: string,
        leadPrice: number,
        expiresAt: string | null,
        createdAt: string,
        assignedAt: string,
        assignmentNotes: string | null,
        homeowner: {
          name: string | null, // Masked if not purchased
          phone: string | null, // Masked if not purchased
        },
        countdown: {
          daysLeft: number,
          hoursLeft: number,
          minutesLeft: number,
          expired: boolean,
        }
      }
    ]
  }
  ```
- **Database Query:**
  ```typescript
  const assignments = await prisma.leadAssignment.findMany({
    where: { installerId: session.user.id },
    include: {
      lead: {
        include: {
          homeowner: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          }
        }
      }
    },
    orderBy: { assignedAt: 'desc' }
  });
  ```

#### **Endpoint 2: Get Installer Session Data**
- **Required:** `GET /api/installer/profile`
- **Authentication:** Session-based (installer role only)
- **Response:**
  ```typescript
  {
    success: true,
    installer: {
      id: string,
      companyName: string,
      email: string,
      phone: string,
      serviceAreas: string[],
      postcodes: string[],
      isApproved: boolean,
      verified: boolean,
      creditBalance: number, // From payment/credit system
      totalUnlocks: number, // Count of purchased leads
      successRate: number, // From quote acceptance tracking
    }
  }
  ```
- **Database Query:**
  ```typescript
  const installer = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      installerVerification: {
        select: {
          companyName: true,
          postcodes: true,
          serviceAreas: true,
          services: true,
          verified: true,
        }
      }
    }
  });
  ```

---

### 2.2 Missing Frontend Logic

#### **Issue 1: Mock Data Replacement**
- **Files to Update:**
  - `src/app/installer/(dashboard)/leads/page.tsx` (Lines 10-11, 45)
  - `src/app/installer/(dashboard)/lead-feed/page.tsx` (Lines 6-7, 35)
  
- **Required Changes:**
  ```typescript
  // BEFORE (current mock)
  const mockInstaller = { id: 1, companyName: "...", ... };
  
  // AFTER (fetch from session)
  const { data: session } = useSession();
  const [installer, setInstaller] = useState(null);
  const [assignedLeads, setAssignedLeads] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      // Fetch installer profile
      const profileRes = await fetch('/api/installer/profile');
      const profileData = await profileRes.json();
      setInstaller(profileData.installer);
      
      // Fetch assigned leads
      const leadsRes = await fetch('/api/installer/leads/assigned');
      const leadsData = await leadsRes.json();
      setAssignedLeads(leadsData.leads);
    }
    
    if (session?.user?.role === 'INSTALLER') {
      fetchData();
    }
  }, [session]);
  ```

#### **Issue 2: Lead Data Structure Mismatch**
- **Component Expectation:** `InstallerLeadFeed` expects specific lead format
- **Current Type:**
  ```typescript
  export interface Lead {
    id: number, // ❌ Should be string (Prisma cuid)
    homeownerId: number, // ❌ Should be string
    type: LeadType, // 'call_visit' | 'written'
    status: LeadStatus, // 'new' | 'unlocked' | 'submitted' | 'expired' | 'contacted'
    dateSubmitted: Date,
    location: { suburb: string; postcode: string; state: string },
    systemDetails: { estimatedSize: string; roofType: string; propertyType: string; budget: string },
    contact: { name: string; email: string; phone: string },
    unlockPrice: number,
    isUnlocked: boolean,
    unlockedBy: number[],
    quotesReceived: number,
    expiresAt: Date,
    priority: 'low' | 'medium' | 'high',
    notes?: string
  }
  ```
- **Database Schema:**
  ```typescript
  model Lead {
    id: string, // ✅ cuid
    homeownerId: string, // ✅ cuid
    quoteType: LeadQuoteType, // CALL_VISIT | WRITTEN_QUOTE
    status: LeadStatus, // DRAFT | PENDING_APPROVAL | APPROVED | etc.
    postcode: string,
    location: string,
    state: string,
    leadPrice: number | null,
    expiresAt: DateTime | null,
    // ...
  }
  ```
- **Fix Required:** Create type adapter/transformer to match component expectations

---

### 2.3 Database Query Issues

#### **Issue 1: Lead Approval Route Does NOT Create LeadAssignment**
- **File:** `src/app/api/leads/[id]/approve/route.ts`
- **Problem:** When admin approves lead with `assignTo: [installerId1, installerId2]`, the route:
  - ✅ Creates notifications
  - ✅ Updates lead status and visibility
  - ❌ Does NOT create LeadAssignment records!

- **Required Fix:**
  ```typescript
  // Add to approve route (after line 143)
  if (body.assignTo && body.assignTo !== 'ALL' && Array.isArray(body.assignTo)) {
    // Create LeadAssignment records
    await prisma.leadAssignment.createMany({
      data: body.assignTo.map(installerId => ({
        leadId: id,
        installerId,
        assignedBy: session.user.id,
        notes: body.assignmentNotes || null,
      })),
      skipDuplicates: true, // Handle re-approval gracefully
    });
  }
  ```

#### **Issue 2: No Unassignment API**
- **Scenario:** Admin assigns lead to Installer A, then decides to remove assignment
- **Current State:** No API endpoint to delete LeadAssignment
- **Required:** `DELETE /api/leads/[id]/assignments/[installerId]`

---

## 3. Data Flow Architecture

### 3.1 Current Admin → Database Flow (✅ Working)

```
┌─────────────────────────────────────────────────────────────┐
│ Admin Lead Management Modal                                 │
│ - Select installers from suggested/filtered list            │
│ - Set price, countdown days                                 │
│ - Click "Save Changes"                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ PATCH /api/leads/[id]                                       │
│ - Updates leadPrice, adminNotes, expiresAt                  │
│ ⚠️  Does NOT handle assignments                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/leads/[id]/approve                                │
│ - Updates status: APPROVED                                  │
│ - Sets visibility: PUBLIC or PRIVATE                        │
│ - Creates notifications                                     │
│ ⚠️  Does NOT create LeadAssignment records!                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Proposed Database → Installer Flow (❌ Not Implemented)

```
┌─────────────────────────────────────────────────────────────┐
│ Installer Logs In                                           │
│ - Session created with userId, role: INSTALLER              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ GET /api/installer/profile                                  │
│ - Fetches User + InstallerVerification                      │
│ - Returns companyName, serviceAreas, postcodes, stats       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ GET /api/installer/leads/assigned                           │
│ - Query: LeadAssignment WHERE installerId = session.user.id│
│ - Include: Lead + Homeowner (masked contact)                │
│ - Returns: Array of assigned leads with countdown           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Installer Dashboard                                         │
│ - Display assigned leads from API                           │
│ - Show countdown timer per lead                             │
│ - Action buttons: Unlock, Submit Quote, Start Chat          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Plan

### Phase 1: Fix Lead Assignment Creation (CRITICAL)

**Objective:** Ensure LeadAssignment records are created when admin assigns leads.

**Tasks:**
1. ✅ Identify where assignments are created
2. ❌ Update `POST /api/leads/[id]/approve` route
3. ❌ Add `LeadAssignment.createMany()` logic
4. ❌ Test with AdminLeadManagementModal

**Files to Modify:**
- `src/app/api/leads/[id]/approve/route.ts` (Lines 180-196)

**Code Change:**
```typescript
// After line 180 (notification loop)
if (body.assignTo && body.assignTo !== 'ALL' && Array.isArray(body.assignTo)) {
  // Create LeadAssignment records
  await prisma.leadAssignment.createMany({
    data: body.assignTo.map(installerId => ({
      leadId: id,
      installerId,
      assignedBy: session.user.id,
      notes: body.assignmentNotes || null,
    })),
    skipDuplicates: true,
  });
  
  // Existing notification loop...
  for (const installerId of body.assignTo) {
    await createNotification({...});
  }
}
```

**Validation:**
- Assign lead to installer via admin modal
- Check `lead_assignments` table in database
- Verify record exists with correct leadId, installerId, assignedBy

---

### Phase 2: Create Installer API Endpoints

**Objective:** Build APIs for installers to fetch their assigned leads.

#### **Task 2.1: Installer Profile Endpoint**
- **File:** Create `src/app/api/installer/profile/route.ts`
- **Authentication:** Session required, role: INSTALLER
- **Query:**
  ```typescript
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      phone: true,
      companyName: true,
      installerVerified: true,
      installerVerification: {
        select: {
          companyName: true,
          postcodes: true,
          serviceAreas: true,
          services: true,
          verified: true,
        }
      }
    }
  });
  ```
- **Response:** Formatted installer profile with computed stats

#### **Task 2.2: Assigned Leads Endpoint**
- **File:** Create `src/app/api/installer/leads/assigned/route.ts`
- **Authentication:** Session required, role: INSTALLER
- **Query:**
  ```typescript
  const assignments = await prisma.leadAssignment.findMany({
    where: { installerId: session.user.id },
    include: {
      lead: {
        include: {
          homeowner: {
            select: {
              id: true,
              name: true,
              phone: true, // Mask if not purchased
            }
          }
        }
      }
    },
    orderBy: { assignedAt: 'desc' }
  });
  ```
- **Response:** Array of leads with countdown calculations

---

### Phase 3: Update Installer Dashboard Pages

**Objective:** Replace mock data with real API calls.

#### **Task 3.1: Update /leads/page.tsx**
- **File:** `src/app/installer/(dashboard)/leads/page.tsx`
- **Changes:**
  1. Remove lines 10-11 (mockInstaller)
  2. Add `useEffect` to fetch profile + assigned leads
  3. Add loading/error states
  4. Pass real data to `<InstallerLeadFeed>`

#### **Task 3.2: Update /lead-feed/page.tsx**
- **File:** `src/app/installer/(dashboard)/lead-feed/page.tsx`
- **Changes:**
  1. Remove lines 6-7 (mockInstaller)
  2. Add `useEffect` to fetch profile + assigned leads
  3. Add loading/error states
  4. Pass real data to `<InstallerLeadFeed>`

#### **Task 3.3: Update InstallerLeadFeed Component**
- **File:** `src/components/InstallerLeadFeed.tsx`
- **Changes:**
  1. Add prop: `leads: Lead[]` (optional, load inside component if not provided)
  2. Add loading state UI
  3. Handle empty state (no assigned leads)
  4. Fix type mismatches (id: number → string)

---

### Phase 4: Testing & Validation

**Test Case 1: End-to-End Assignment Flow**
1. Admin logs in
2. Admin opens AdminLeadManagementModal for lead X
3. Admin assigns lead X to installer Y
4. Admin saves changes
5. ✅ Verify LeadAssignment created in database
6. Installer Y logs in
7. ✅ Verify lead X appears in installer dashboard
8. ✅ Verify countdown timer shows correct time
9. ✅ Verify lead price displays correctly

**Test Case 2: Multiple Installers**
1. Admin assigns lead X to installers A, B, C
2. ✅ Verify 3 LeadAssignment records created
3. Installer A logs in → sees lead X
4. Installer B logs in → sees lead X
5. Installer C logs in → sees lead X

**Test Case 3: Public vs Private Leads**
1. Admin assigns lead X to installer A (PRIVATE)
2. Admin approves lead Y as PUBLIC
3. Installer A sees both X and Y
4. Installer B only sees Y (public)

**Test Case 4: Countdown Expiry**
1. Admin assigns lead with 1 day countdown
2. Wait 1 day (or manually update `expiresAt` in DB)
3. ✅ Verify lead shows as expired in installer dashboard
4. ✅ Verify expired lead is still visible but not actionable

---

## 5. Technical Specifications

### 5.1 API Route Structure

#### **GET /api/installer/profile**
```typescript
/**
 * Installer Profile API Route
 * 
 * GET /api/installer/profile - Get installer profile data
 * 
 * @access Installer only
 * @returns 200 OK + Installer profile
 * @errors 401 Unauthorized, 403 Forbidden
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  if (session.user.role !== 'INSTALLER') {
    return NextResponse.json({ error: 'Installer access required' }, { status: 403 });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      installerVerification: true,
      leadsAsInstaller: {
        where: { purchaseStatus: 'PURCHASED' },
        select: { id: true }
      }
    }
  });
  
  const totalUnlocks = user.leadsAsInstaller.length;
  
  return NextResponse.json({
    success: true,
    installer: {
      id: user.id,
      companyName: user.installerVerification?.companyName || user.companyName,
      email: user.email,
      phone: user.phone,
      serviceAreas: user.installerVerification?.serviceAreas || [],
      postcodes: user.installerVerification?.postcodes || [],
      isApproved: user.installerVerified,
      verified: user.installerVerification?.verified || false,
      totalUnlocks,
      creditBalance: 0, // TODO: Implement credit system
      successRate: 0, // TODO: Calculate from quote acceptance rate
    }
  });
}
```

#### **GET /api/installer/leads/assigned**
```typescript
/**
 * Assigned Leads API Route
 * 
 * GET /api/installer/leads/assigned - Get leads assigned to installer
 * 
 * @access Installer only
 * @query expired=true|false - Include/exclude expired leads
 * @returns 200 OK + Array of assigned leads
 * @errors 401 Unauthorized, 403 Forbidden
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  if (session.user.role !== 'INSTALLER') {
    return NextResponse.json({ error: 'Installer access required' }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const includeExpired = searchParams.get('expired') === 'true';
  
  const assignments = await prisma.leadAssignment.findMany({
    where: {
      installerId: session.user.id,
      lead: includeExpired ? undefined : {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    },
    include: {
      lead: {
        include: {
          homeowner: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          }
        }
      }
    },
    orderBy: { assignedAt: 'desc' }
  });
  
  const leads = assignments.map(assignment => {
    const lead = assignment.lead;
    const isPurchased = lead.installerId === session.user.id;
    
    return {
      id: lead.id,
      homeownerId: lead.homeownerId,
      status: lead.status,
      quoteType: lead.quoteType,
      postcode: lead.postcode,
      location: lead.location,
      state: lead.state,
      leadPrice: lead.leadPrice,
      expiresAt: lead.expiresAt?.toISOString() || null,
      createdAt: lead.createdAt.toISOString(),
      assignedAt: assignment.assignedAt.toISOString(),
      assignmentNotes: assignment.notes,
      homeowner: {
        name: isPurchased ? lead.homeowner.name : '***LOCKED***',
        phone: isPurchased ? lead.homeowner.phone : '***LOCKED***',
      },
      countdown: calculateCountdown(lead.expiresAt),
    };
  });
  
  return NextResponse.json({
    success: true,
    leads,
  });
}
```

---

### 5.2 Type Definitions

```typescript
// src/types/installer.ts

export interface InstallerProfile {
  id: string;
  companyName: string;
  email: string;
  phone: string | null;
  serviceAreas: string[];
  postcodes: string[];
  isApproved: boolean;
  verified: boolean;
  creditBalance: number;
  totalUnlocks: number;
  successRate: number;
}

export interface AssignedLead {
  id: string;
  homeownerId: string;
  status: string;
  quoteType: string;
  postcode: string;
  location: string;
  state: string;
  leadPrice: number | null;
  expiresAt: string | null;
  createdAt: string;
  assignedAt: string;
  assignmentNotes: string | null;
  homeowner: {
    name: string;
    phone: string;
  };
  countdown: {
    daysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    expired: boolean;
  };
}
```

---

## 6. Priority Ranking

| Priority | Task | Effort | Impact | Status |
|----------|------|--------|--------|--------|
| 🔴 P0 | Fix LeadAssignment creation in approve route | Low | Critical | ❌ Not Started |
| 🔴 P0 | Create GET /api/installer/profile | Low | Critical | ❌ Not Started |
| 🔴 P0 | Create GET /api/installer/leads/assigned | Medium | Critical | ❌ Not Started |
| 🟡 P1 | Update /leads/page.tsx with real data | Low | High | ❌ Not Started |
| 🟡 P1 | Update /lead-feed/page.tsx with real data | Low | High | ❌ Not Started |
| 🟡 P1 | Fix InstallerLeadFeed type mismatches | Medium | High | ❌ Not Started |
| 🟢 P2 | Add DELETE /api/leads/[id]/assignments/[installerId] | Medium | Medium | ❌ Not Started |
| 🟢 P2 | Add real-time notification system | High | Medium | ❌ Not Started |
| 🟢 P3 | Add status field to LeadAssignment (pending/accepted/removed) | Low | Low | ❌ Not Started |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing marketplace flow | Medium | High | Thoroughly test public lead display |
| Type mismatches causing runtime errors | High | Medium | Create type adapters, add runtime validation |
| Missing countdown calculations | Medium | Medium | Reuse existing countdown-service utilities |
| Authentication edge cases | Medium | High | Add comprehensive session checks |
| Database query performance | Low | Medium | Leverage existing indexes on LeadAssignment |

---

## 8. Success Criteria

### Minimum Viable Fix (MVP)
- [x] Admin assigns lead → LeadAssignment record created
- [ ] Installer logs in → sees assigned leads
- [ ] Countdown timer displays correctly
- [ ] Lead price displays correctly
- [ ] Homeowner contact masked until purchased

### Full Feature Completion
- [ ] All MVP criteria met
- [ ] No mock data in installer dashboard
- [ ] Public leads visible in marketplace
- [ ] Private leads only visible to assigned installers
- [ ] Expired leads marked clearly
- [ ] Real-time stats (totalUnlocks, successRate)
- [ ] Unassignment functionality working

---

## 9. Next Steps

1. **Create Issue/Task:** Document this audit in project management tool
2. **Assign Priority:** Mark as P0 (Critical) for sprint planning
3. **Start Phase 1:** Fix LeadAssignment creation (1 hour)
4. **Build Phase 2 APIs:** Create installer endpoints (2-3 hours)
5. **Update Phase 3 UI:** Replace mock data (2 hours)
6. **Test Phase 4:** End-to-end validation (1 hour)

**Estimated Total Time:** 6-7 hours

---

## 10. Appendix

### A. Related Files

**Backend:**
- `src/app/api/leads/[id]/approve/route.ts` - Lead approval with assignment
- `prisma/schema.prisma` - LeadAssignment model definition

**Frontend:**
- `src/app/installer/(dashboard)/leads/page.tsx` - Installed leads view
- `src/app/installer/(dashboard)/lead-feed/page.tsx` - Available leads feed
- `src/app/installer/(dashboard)/marketplace/page.tsx` - Public marketplace
- `src/components/InstallerLeadFeed.tsx` - Lead display component
- `src/components/admin/AdminLeadManagementModal.tsx` - Admin assignment UI

### B. Database Schema Relations

```
User (INSTALLER)
  ├── installerAssignments: LeadAssignment[]
  ├── installerVerification: InstallerVerification
  └── leadsAsInstaller: Lead[]

LeadAssignment
  ├── lead: Lead
  ├── installer: User (INSTALLER)
  └── admin: User (ADMIN)

Lead
  ├── homeowner: User (HOMEOWNER)
  ├── installer: User (INSTALLER) [if purchased]
  └── assignments: LeadAssignment[]
```

### C. Recent Commits (Context)

- `0084934` - Fixed layout, price/countdown editing, handler parameters
- `b6cc6e1` - Improved postcode matching logic
- `7e8162a` - Fixed postcodes String[] handling (critical bug fix)

---

**End of Audit Report**
