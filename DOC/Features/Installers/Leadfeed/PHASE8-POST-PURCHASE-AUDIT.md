# Phase 8: Post-Purchase Enhancements Audit Report

**Date:** November 25, 2025  
**Branch:** 007-call-visit-lead  
**Scope:** Purchase flow improvements, Purchased leads page tabs, Homeowner status label

---

## Executive Summary

After implementing Phases 1-7 of the CALL/VISIT lead system, manual testing revealed several issues with the post-purchase experience:

1. ✅ **RESOLVED:** Lead ID type mismatch bug (string CUIDs parsed as integers)
2. ❌ **ISSUE:** Email still shows `***LOCKED***` after purchase in installer feed
3. ❌ **ISSUE:** No "View Details" button after purchase
4. ❌ **ISSUE:** Purchased leads page lacks tabs (Call/Visit, Written Quotes, Bidding)
5. ❌ **ISSUE:** Purchased leads page uses inconsistent UI design
6. ❌ **ISSUE:** Homeowner dashboard shows "Purchased" instead of "Responded by an Installer"

---

## 1. Current State Analysis

### 1.1 Purchase API Endpoint
**File:** `src/app/api/installer/leads/[id]/purchase/route.ts`

**Status:** ✅ Working correctly after ID type fix

**Flow:**
```typescript
POST /api/installer/leads/[id]/purchase
→ Validates installer authentication (line 23-37)
→ Checks lead assignment (line 45-68)
→ Validates CALL_VISIT lead type (line 72-77)
→ Checks not already purchased (line 80-85)
→ Checks not expired (line 88-94)
→ Updates lead with installerId & purchasedAt (line 99-109)
→ Creates homeowner notification (line 112-121)
→ Returns full homeowner contact details (line 124-156)
```

**Response includes:**
```json
{
  "success": true,
  "lead": {
    "homeowner": {
      "name": "Real Name",
      "phone": "+61412952399",
      "email": "real@email.com"  // ✅ REAL EMAIL RETURNED
    }
  }
}
```

**Audit Finding:** API correctly returns real email in response, but installer feed doesn't use it.

---

### 1.2 Assigned Leads API Endpoint
**File:** `src/app/api/installer/leads/assigned/route.ts`

**Status:** ⚠️ Partially correct

**Flow:**
```typescript
GET /api/installer/leads/assigned
→ Fetches LeadAssignments for installer (line 48-69)
→ Maps to formatted leads (line 72-103)
→ Returns homeowner data based on isPurchased flag
```

**Current Logic (lines 91-95):**
```typescript
homeowner: {
  name: isPurchased ? lead.homeowner.name : '***LOCKED***',
  phone: isPurchased ? lead.homeowner.phone : '***LOCKED***'
  // ❌ EMAIL NOT INCLUDED AT ALL
},
isPurchased,
```

**Audit Finding:** 
- ❌ Email field completely missing from response
- ❌ After purchase, installer feed refetches this endpoint, which provides name & phone but NOT email
- ✅ Name & phone unlock correctly after purchase

---

### 1.3 Installer Feed Mapping
**File:** `src/app/installer/(dashboard)/leads/page.tsx`

**Current Mapping (lines 12-51):**
```typescript
function mapAssignedLeadToComponentLead(apiLead: AssignedLead): Lead {
  const isLocked = apiLead.homeowner.name === '***LOCKED***';
  
  return {
    contact: {
      name: apiLead.homeowner.name || '***LOCKED***',
      email: isLocked ? '***LOCKED***' : '***LOCKED***',  // ❌ ALWAYS LOCKED
      phone: apiLead.homeowner.phone || '***LOCKED***'
    },
    isUnlocked: !isLocked,
  };
}
```

**Audit Finding:**
- ❌ Line 42: Email hardcoded to `***LOCKED***` regardless of purchase status
- ❌ `apiLead.homeowner.email` doesn't exist (not in API response)
- ✅ Name & phone unlock correctly via `isLocked` check

---

### 1.4 Installer Lead Feed Component
**File:** `src/components/InstallerLeadFeed.tsx`

**Contact Unlocked Section (lines 413-438):**
```tsx
{isUnlockedByInstaller && (
  <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
    <div className="flex items-center space-x-2 mb-2">
      <UnlockIcon className="h-4 w-4 text-success" />
      <span className="text-label text-success">
        Contact Details Unlocked
      </span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-body-small">
      <div>
        <span className="text-muted-foreground">Name:</span>
        <span className="ml-2 text-foreground">{lead.contact.name}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Phone:</span>
        <span className="ml-2 text-foreground">{lead.contact.phone}</span>
      </div>
      <div className="md:col-span-2">
        <span className="text-muted-foreground">Email:</span>
        <span className="ml-2 text-foreground">{lead.contact.email}</span>  {/* Shows ***LOCKED*** */}
      </div>
    </div>
  </div>
)}
```

**Action Buttons (lines 440-453):**
```tsx
<div className="flex flex-wrap gap-2">
  {canUnlock && (
    <Button onClick={() => onUnlock(lead.id)} variant="primary">
      <LockIcon className="h-4 w-4" />
      <span>Unlock Lead (${lead.unlockPrice})</span>
    </Button>
  )}
  
  {/* ❌ NO "VIEW DETAILS" BUTTON FOR PURCHASED LEADS */}
```

**Audit Finding:**
- ❌ Email displays as `***LOCKED***` even when contact section shows
- ❌ No "View Details" button appears after purchase
- ✅ Name & phone display correctly after purchase

---

### 1.5 Purchased Leads Page
**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Current UI Structure:**
```tsx
export default function PurchasedLeadsPage() {
  // ❌ NO TABS - shows all leads in single list
  // ❌ CUSTOM UI - not using InstallerLeadFeed component
  
  return (
    <div className="container mx-auto p-6">
      <div className="header-section mb-6">
        <h1 className="text-heading-1">Purchased Leads</h1>
      </div>
      
      {/* ❌ Custom card design, not LeadCard from InstallerLeadFeed */}
      {leads.map(lead => (
        <div key={lead.id} className="custom-purchased-lead-card">
          {/* Custom layout */}
        </div>
      ))}
    </div>
  );
}
```

**API Integration (lines 72-84):**
```typescript
async function fetchPurchasedLeads() {
  const response = await fetch('/api/installer/leads/purchased');
  const data = await response.json();
  setLeads(data.leads || []);  // All leads together, no tab filtering
}
```

**Audit Finding:**
- ❌ No tabs to separate Call/Visit, Written Quotes, Bidding leads
- ❌ Custom UI instead of reusing LeadCard component from InstallerLeadFeed
- ❌ Inconsistent design with main leads feed
- ✅ API returns all purchased leads correctly with full contact info

---

### 1.6 Purchased Leads API Endpoint
**File:** `src/app/api/installer/leads/purchased/route.ts`

**Current Response (lines 42-63):**
```typescript
const leads = purchasedLeads.map(lead => ({
  id: lead.id,
  quoteType: lead.quoteType,  // ✅ Includes type for tab filtering
  homeowner: {
    id: lead.homeowner.id,
    name: lead.homeowner.name,
    phone: lead.homeowner.phone,
    email: lead.homeowner.email  // ✅ REAL EMAIL INCLUDED
  },
  location: lead.location,
  postcode: lead.postcode,
  state: lead.state,
  propertyType: lead.propertyType,
  roofType: lead.roofType,
  budgetRange: lead.budgetRange,
  quotesCount: lead.quotes.length
}));
```

**Audit Finding:**
- ✅ Returns full contact details including email
- ✅ Includes `quoteType` for tab filtering
- ✅ Provides all necessary data for LeadCard rendering

---

### 1.7 Homeowner Dashboard
**File:** `src/app/homeowner/dashboard/page.tsx`

**Status Configuration (lines 195-199):**
```typescript
[LeadStatusEnum.PURCHASED]: {
  label: 'Purchased',  // ❌ Should be 'Responded by an Installer'
  description: 'An installer has claimed this lead',
  accent: 'bg-primary/10 text-primary border border-primary/30',
},
```

**Usage in Lead Cards:**
- Line 444: Status breakdown statistics
- Line 572: Lead preview conditions
- Multiple places render status badge with this label

**Audit Finding:**
- ❌ Label says "Purchased" instead of "Responded by an Installer"
- ❌ Description could be more homeowner-friendly

---

## 2. Root Causes

### Issue #1: Email Still Locked After Purchase
**Root Cause:**
1. Purchase API returns email in response ✅
2. Installer feed refetches `/api/installer/leads/assigned` ✅
3. Assigned API doesn't include email field in response ❌
4. Mapping function hardcodes email as `***LOCKED***` ❌

**Fix Required:**
- Add `email` field to `/api/installer/leads/assigned` response
- Update mapping to use real email when `isPurchased = true`

---

### Issue #2: No View Details Button
**Root Cause:**
- LeadCard component only shows "Unlock Lead" button when `canUnlock = true`
- After purchase, `canUnlock = false` and no alternative button appears
- No conditional rendering for purchased state button

**Fix Required:**
- Add View Details button when `isUnlockedByInstaller = true`
- Button should open lead details modal with full information

---

### Issue #3: Purchased Leads Page Lacks Tabs
**Root Cause:**
- Page fetches all purchased leads without filtering
- No tab UI component implemented
- No state management for active tab

**Fix Required:**
- Add tab component: Call/Visit | Written Quotes | Bidding
- Filter leads by `quoteType` based on active tab
- Use semantic tab classes from design system

---

### Issue #4: Inconsistent UI Design
**Root Cause:**
- Purchased leads page uses custom card layout
- Doesn't reuse LeadCard from InstallerLeadFeed component
- Different styling, layout, and information display

**Fix Required:**
- Import and reuse InstallerLeadFeed component or LeadCard
- Map API data to Lead interface format
- Ensure consistent styling with main feed

---

### Issue #5: Homeowner Status Label
**Root Cause:**
- Status configuration uses "Purchased" label
- Not user-friendly for homeowners (technical term)
- Doesn't communicate value (installer will contact them)

**Fix Required:**
- Change label to "Responded by an Installer"
- Update description to "An installer will contact you soon"

---

## 3. Data Flow Diagrams

### Current Purchase Flow (With Issues)
```
1. Installer clicks "Unlock Lead" 
   ↓
2. POST /api/installer/leads/{id}/purchase
   ↓ Returns: { homeowner: { name, phone, email } } ✅
   ↓
3. InstallerLeadsPage refetches
   GET /api/installer/leads/assigned
   ↓ Returns: { homeowner: { name, phone } } ❌ NO EMAIL
   ↓
4. mapAssignedLeadToComponentLead()
   ↓ Hardcodes: email: '***LOCKED***' ❌
   ↓
5. LeadCard renders contact section
   ↓ Shows: name ✅, phone ✅, email: ***LOCKED*** ❌
```

### Desired Purchase Flow (After Fix)
```
1. Installer clicks "Unlock Lead"
   ↓
2. POST /api/installer/leads/{id}/purchase
   ↓ Returns: { homeowner: { name, phone, email } } ✅
   ↓
3. InstallerLeadsPage refetches
   GET /api/installer/leads/assigned
   ↓ Returns: { homeowner: { name, phone, email } } ✅
   ↓
4. mapAssignedLeadToComponentLead()
   ↓ Maps: email: isPurchased ? apiLead.homeowner.email : '***LOCKED***'
   ↓
5. LeadCard renders contact section + View Details button
   ↓ Shows: name ✅, phone ✅, email ✅
   ↓ Button: "View Details" (opens modal)
```

---

## 4. Implementation Plan

### Phase 8: Post-Purchase Enhancements

#### Task 8.1: Fix Contact Email Unlock (Backend)
**Files to modify:**
- `src/app/api/installer/leads/assigned/route.ts`
- `src/types/installer.ts` (add email to AssignedLead interface)

**Changes:**
```typescript
// Update API response to include email
homeowner: {
  name: isPurchased ? lead.homeowner.name : '***LOCKED***',
  phone: isPurchased ? lead.homeowner.phone : '***LOCKED***',
  email: isPurchased ? lead.homeowner.email : '***LOCKED***'  // ADD THIS
},
```

**Testing:**
- Purchase a lead
- Call GET /api/installer/leads/assigned
- Verify response includes real email for purchased lead

---

#### Task 8.2: Fix Contact Email Unlock (Frontend)
**Files to modify:**
- `src/app/installer/(dashboard)/leads/page.tsx`

**Changes:**
```typescript
// Update mapping function (line 42)
contact: {
  name: apiLead.homeowner.name || '***LOCKED***',
  email: apiLead.homeowner.email || '***LOCKED***',  // Use real email from API
  phone: apiLead.homeowner.phone || '***LOCKED***'
},
```

**Testing:**
- Purchase lead
- Verify contact section shows real email
- Verify locked leads still show ***LOCKED***

---

#### Task 8.3: Add View Details Button
**Files to modify:**
- `src/components/InstallerLeadFeed.tsx`

**Changes:**
1. Add View Details button after contact section
2. Create lead details modal component
3. Show modal on button click

**UI Placement (after line 438):**
```tsx
{isUnlockedByInstaller && (
  <div className="mt-4">
    <Button
      onClick={() => setShowDetailsModal(true)}
      variant="secondary"
      className="w-full flex items-center justify-center space-x-2"
    >
      <EyeIcon className="h-4 w-4" />
      <span>View Details</span>
    </Button>
  </div>
)}
```

**Modal Content:**
- Full homeowner contact (name, email, phone)
- Lead details (property type, roof type, budget, location)
- Purchase info (date purchased, price paid)
- Assignment notes from admin

**Testing:**
- Purchase lead
- Click "View Details" button
- Verify modal opens with complete information
- Close modal and verify it doesn't affect feed

---

#### Task 8.4: Create Tabs in Purchased Leads Page
**Files to modify:**
- `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Changes:**
1. Add tab state management
2. Create tab component using semantic classes
3. Filter leads by quoteType based on active tab

**Tab Structure:**
```tsx
type LeadTab = 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING';

const [activeTab, setActiveTab] = useState<LeadTab>('CALL_VISIT');

const filteredLeads = leads.filter(lead => lead.quoteType === activeTab);

// Tab UI (semantic classes)
<div className="tabs-container mb-6">
  <button
    className={`tab-button ${activeTab === 'CALL_VISIT' ? 'tab-button-active' : ''}`}
    onClick={() => setActiveTab('CALL_VISIT')}
  >
    Call/Visit ({leads.filter(l => l.quoteType === 'CALL_VISIT').length})
  </button>
  <button
    className={`tab-button ${activeTab === 'WRITTEN_QUOTE' ? 'tab-button-active' : ''}`}
    onClick={() => setActiveTab('WRITTEN_QUOTE')}
  >
    Written Quotes ({leads.filter(l => l.quoteType === 'WRITTEN_QUOTE').length})
  </button>
  <button
    className={`tab-button ${activeTab === 'BIDDING' ? 'tab-button-active' : ''}`}
    onClick={() => setActiveTab('BIDDING')}
  >
    Bidding ({leads.filter(l => l.quoteType === 'BIDDING').length})
  </button>
</div>
```

**Testing:**
- Purchase leads of different types
- Navigate to Purchased Leads page
- Click each tab
- Verify correct leads show in each tab
- Verify counts are accurate

---

#### Task 8.5: Replace Purchased Leads UI with LeadCard
**Files to modify:**
- `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Changes:**
1. Import InstallerLeadFeed component
2. Map API data to Lead interface
3. Replace custom cards with LeadCard rendering

**Implementation:**
```tsx
import InstallerLeadFeed from '@/components/InstallerLeadFeed';
import type { Lead } from '@/components/InstallerLeadFeed';

// Map API purchased leads to component format
const mappedLeads: Lead[] = filteredLeads.map(mapPurchasedLeadToComponentLead);

// Render using same component
<InstallerLeadFeed
  installer={installer}
  leads={mappedLeads}
  onUnlockLead={async () => false}  // No unlock action on purchased page
  onSubmitQuote={handleSubmitQuote}
  onStartChat={handleStartChat}
/>
```

**Mapping Function:**
```typescript
function mapPurchasedLeadToComponentLead(apiLead: PurchasedLead): Lead {
  return {
    id: apiLead.id,
    homeownerId: apiLead.homeowner.id,
    type: quoteTypeMap[apiLead.quoteType] || 'call_visit',
    status: 'unlocked',
    contact: {
      name: apiLead.homeowner.name,
      email: apiLead.homeowner.email,  // ✅ Real email
      phone: apiLead.homeowner.phone
    },
    isUnlocked: true,
    isPurchasedByAnother: false,
    unlockedBy: [1],  // Current installer
    // ... rest of mapping
  };
}
```

**Testing:**
- Navigate to Purchased Leads page
- Verify cards look identical to main feed
- Verify all data displays correctly
- Verify View Details button works

---

#### Task 8.6: Update Homeowner Status Label
**Files to modify:**
- `src/app/homeowner/dashboard/page.tsx`

**Changes:**
```typescript
[LeadStatusEnum.PURCHASED]: {
  label: 'Responded by an Installer',  // Changed from 'Purchased'
  description: 'An installer will contact you soon',  // More friendly
  accent: 'bg-primary/10 text-primary border border-primary/30',
},
```

**Testing:**
- As admin, assign and approve lead
- As installer, purchase lead
- As homeowner, view dashboard
- Verify status shows "Responded by an Installer"
- Verify description is user-friendly

---

#### Task 8.7: End-to-End Testing
**Test Scenarios:**

1. **Purchase Flow:**
   - Assign lead to installer
   - Purchase lead as installer
   - Verify contact details unlock (name, phone, email)
   - Verify "View Details" button appears
   - Click button, verify modal opens with all details

2. **Purchased Leads Page:**
   - Navigate to Purchased Leads
   - Verify tabs appear (Call/Visit, Written Quotes, Bidding)
   - Click each tab, verify correct leads show
   - Verify UI matches main feed design
   - Click "View Details", verify modal works

3. **Homeowner Dashboard:**
   - View as homeowner
   - Find purchased lead
   - Verify status shows "Responded by an Installer"
   - Verify description is clear

4. **Multi-Installer Scenario:**
   - Assign same lead to 2 installers
   - Installer A purchases
   - Verify Installer B sees "Purchased by another installer"
   - Verify Installer B cannot purchase

5. **Different Lead Types:**
   - Purchase Call/Visit lead → appears in Call/Visit tab
   - Purchase Written Quote lead → appears in Written Quotes tab
   - Purchase Bidding lead → appears in Bidding tab

---

## 5. File Structure Impact

### New Files:
- None (all changes to existing files)

### Modified Files:
1. `src/app/api/installer/leads/assigned/route.ts` - Add email to response
2. `src/types/installer.ts` - Add email to AssignedLead interface
3. `src/app/installer/(dashboard)/leads/page.tsx` - Fix email mapping
4. `src/components/InstallerLeadFeed.tsx` - Add View Details button + modal
5. `src/app/installer/(dashboard)/purchased-leads/page.tsx` - Add tabs + use LeadCard
6. `src/app/homeowner/dashboard/page.tsx` - Update status label

### API Endpoints:
- ✅ POST `/api/installer/leads/[id]/purchase` - Already correct
- 🔧 GET `/api/installer/leads/assigned` - Needs email field
- ✅ GET `/api/installer/leads/purchased` - Already correct

---

## 6. Success Criteria

### Installer Feed (After Purchase):
- ✅ Contact section shows real name
- ✅ Contact section shows real phone
- ✅ Contact section shows real email (NOT ***LOCKED***)
- ✅ "View Details" button appears
- ✅ Modal opens with complete lead information

### Purchased Leads Page:
- ✅ Three tabs visible: Call/Visit | Written Quotes | Bidding
- ✅ Tabs show correct counts
- ✅ Clicking tab filters leads correctly
- ✅ UI uses LeadCard component (consistent design)
- ✅ All purchased leads show full contact details

### Homeowner Dashboard:
- ✅ Purchased leads show "Responded by an Installer" status
- ✅ Description is user-friendly
- ✅ Status badge styling remains consistent

### Cross-Cutting:
- ✅ No TypeScript errors
- ✅ Build succeeds (`npm run build`)
- ✅ All existing features still work
- ✅ Multi-installer scenarios work correctly

---

## 7. Dependencies & Constraints

### Design System Compliance:
- Must use semantic classes from `DOC/Guidelines`
- Tab styles: `tab-button`, `tab-button-active`
- Modal styles: Standard modal pattern
- No inline styles, no hardcoded colors

### Existing Architecture:
- Reuse LeadCard component (don't duplicate)
- Maintain Lead interface compatibility
- Follow existing modal patterns (StripeUnlockModal)

### Performance:
- Tab switching should not refetch data
- Modal rendering should not impact feed performance
- Filter operation should be client-side (already fetched data)

---

## 8. Risk Analysis

### Low Risk:
- ✅ Email field addition (straightforward backend change)
- ✅ Status label change (simple text update)
- ✅ Tab filtering (client-side logic)

### Medium Risk:
- ⚠️ View Details modal (new component, ensure doesn't break existing modals)
- ⚠️ LeadCard reuse in purchased page (ensure mapping compatibility)

### Mitigation:
- Test each change in isolation
- Test on multiple lead types
- Test with multiple installers
- Verify existing purchase flow still works

---

## 9. Estimated Effort

- **Task 8.1:** Backend email field - 15 minutes
- **Task 8.2:** Frontend email mapping - 10 minutes
- **Task 8.3:** View Details button + modal - 45 minutes
- **Task 8.4:** Tabs implementation - 30 minutes
- **Task 8.5:** LeadCard integration - 30 minutes
- **Task 8.6:** Status label update - 5 minutes
- **Task 8.7:** End-to-end testing - 30 minutes

**Total Estimated Time:** ~2.5 hours

---

## 10. Next Steps

1. ✅ Create this audit report
2. ⏭️ Add Phase 8 to `specs/007-call-visit-lead/tasks.md`
3. ⏭️ Implement Task 8.1 (Backend email fix)
4. ⏭️ Test Task 8.1
5. ⏭️ Implement Task 8.2 (Frontend email mapping)
6. ⏭️ Test Task 8.2
7. ⏭️ Implement Task 8.3 (View Details button)
8. ⏭️ Test Task 8.3
9. ⏭️ Implement Task 8.4 (Tabs)
10. ⏭️ Test Task 8.4
11. ⏭️ Implement Task 8.5 (LeadCard integration)
12. ⏭️ Test Task 8.5
13. ⏭️ Implement Task 8.6 (Status label)
14. ⏭️ Test Task 8.6
15. ⏭️ Final E2E testing
16. ⏭️ Commit all changes

---

**Audit completed by:** GitHub Copilot (AI Assistant)  
**Reviewed against:** Constitution.md, Design System Guidelines, Phase 1-7 implementation
