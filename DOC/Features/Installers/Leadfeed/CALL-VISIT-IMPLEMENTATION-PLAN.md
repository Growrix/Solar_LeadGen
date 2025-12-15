# CALL/VISIT Lead Implementation Plan (REVISED)
**Date:** 2025-11-25  
**Branch:** 007-call-visit-lead  
**Status:** Ready for Implementation  
**Payment Strategy:** Mock implementation (Stripe-ready architecture)

---

## 1. Executive Summary

This plan implements the complete CALL/VISIT lead purchase flow with backend-driven status management, contact masking, and multi-role synchronization. The implementation is **non-breaking** and builds upon existing infrastructure (LeadAssignment, purchase endpoint, assigned leads API).

**Key Principle:** All status, unlock, and contact masking logic is server-authoritative. UI reflects backend state only—no local simulation or mock data.

**Implementation Order:** 
1. **Installer Flow First** (Phases 2-4) - Purchase flow, purchased leads page, multi-installer detection
2. **Admin Flow Second** (Phase 7) - Purchase tracking, reassignment
3. **Homeowner Flow Last** (Phase 6) - Notifications, action locking

**Stripe Payment Strategy:**
- Use mock purchase flow initially (instant approval)
- Architecture designed for easy Stripe integration later
- Single point of change when real API is added
- No breaking changes required for future Stripe upgrade

---

## 2. Current State Analysis

### ✅ **What's Already Built:**
1. **Database Schema (Prisma):**
   - `Lead` model with `quoteType`, `status`, `purchaseStatus`, `purchasedAt`, `installerId`, `leadPrice`
   - `LeadAssignment` model (many-to-many installer-lead assignments)
   - Enums: `LeadQuoteType` (CALL_VISIT, WRITTEN_QUOTE, BIDDING), `LeadStatus` (APPROVED, PURCHASED, etc.), `PurchaseStatus` (COMPLETED, PENDING, etc.)
   
2. **Backend APIs:**
   - `GET /api/installer/leads/assigned` - Returns assigned leads with masked contact (`***LOCKED***` for unpurchased)
   - `POST /api/installer/leads/[id]/purchase` - Purchase endpoint (updates lead.installerId, purchasedAt, status=PURCHASED, returns unmasked contact)
   
3. **Frontend Components:**
   - `InstallerLeadFeed.tsx` - Main lead feed (currently using mock data)
   - `StripeUnlockModal` - Purchase confirmation modal (currently simulates payment)
   - `leads/page.tsx` (installer dashboard) - Fetches real data from `/api/installer/leads/assigned`

### ❌ **Gaps Identified:**

1. **Frontend Still Uses Mock Data:**
   - `InstallerLeadFeed.tsx` initializes `mockLeads` array (3 leads with hardcoded contact/status)
   - Types collapsed: `LeadType = 'call_visit' | 'written'` (missing 'bidding')
   - Status mapping incorrect: Uses 'new'/'unlocked' instead of APPROVED/PURCHASED
   
2. **Purchase Flow Simulated:**
   - `StripeUnlockModal` calls mock setTimeout instead of real API (`POST /api/installer/leads/[id]/purchase`)
   - Lead status updated locally in state (`setLeads`), not from server response
   
3. **No Purchased Leads Page:**
   - Requirement states purchased leads move to `/installer/purchased-leads` page (with Call/Visit, Written Quotes, Bidding tabs)
   - Page exists but not connected to purchase flow
   
4. **Missing Multi-Installer Purchase Logic:**
   - Backend allows one installer to purchase (sets `installerId`), but frontend doesn't reflect "Purchased by another installer" state
   
5. **No Real-Time/Polling Sync:**
   - No mechanism to refresh lead status after another installer purchases
   
6. **Homeowner/Admin Flows Not Implemented:**
   - Homeowner notifications on purchase
   - Admin view of purchase status/history
   - Lead status locking after purchase (prevent homeowner edits)

---

## 3. Implementation Phases

### **Phase 1: Frontend Data Integration** ✅ **MOSTLY COMPLETE**
**Status:** Mock data already removed, component accepts props, type mapping exists

**Audit Findings:**
- ✅ Mock data already removed from `InstallerLeadFeed.tsx`
- ✅ Component accepts `leads` prop and initializes from it
- ✅ `leads/page.tsx` fetches from `/api/installer/leads/assigned` and passes data
- ✅ Type mapping layer exists: `mapAssignedLeadToComponentLead()`
- ⚠️ Status mapping simplified (APPROVED→'new', PURCHASED→'unlocked')

**Remaining Work:** Enhance status mapping (optional)

#### **Step 1.1: Enhance Status Mapping (Optional)**
**File:** `src/app/installer/(dashboard)/leads/page.tsx`

**Current (line 25):**
```typescript
status: isLocked ? 'new' : 'unlocked', // Simplified
```

**Enhancement (if full status support needed):**
```typescript
const statusMap: Record<string, Lead['status']> = {
  APPROVED: 'new',
  PURCHASED: 'unlocked',
  QUOTED: 'submitted',
  EXPIRED: 'expired',
  CANCELLED: 'expired',
  FLAGGED: 'contacted',
  // Default: 'new'
};

status: statusMap[apiLead.status] || 'new',
```

**Note:** Current simplified mapping is functional for CALL_VISIT flow. Full mapping only needed if UI requires distinguishing all backend states.

**Testing:** ✅ Already working - lead feed displays real assigned leads.

---

### **Phase 2: Purchase Flow Integration** 🔧 **CRITICAL - WIRE MODAL TO API**
**Goal:** Connect `StripeUnlockModal` to real purchase API (currently uses mock setTimeout).

**Audit Findings:**
- ✅ `leads/page.tsx` has real `handleUnlockLead()` calling purchase API
- ✅ Purchase API endpoint fully functional
- ❌ **CRITICAL:** `StripeUnlockModal.handlePayment()` uses mock `setTimeout(2000)`
- ❌ Modal doesn't call parent's `onUnlockLead` callback
- ❌ Purchase flow never reaches real API despite callback existing

**Root Cause:** Prop chain misconfiguration. Modal calls `onPaymentSuccess(leadId)` instead of `onUnlockLead(leadId)`.

#### **Step 2.1: Update `StripeUnlockModal` to Accept `onUnlockLead` Prop**
**File:** `src/components/InstallerLeadFeed.tsx` (lines 85-90)

**CHANGE Interface:**
```typescript
const StripeUnlockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUnlockLead: (leadId: number) => Promise<boolean>;  // NEW: Add this prop
  onPaymentSuccess: (leadId: number) => void;
  installer: InstallerProfile;
}> = ({ isOpen, onClose, lead, onUnlockLead, onPaymentSuccess, installer }) => {
```

#### **Step 2.2: Update `handlePayment` to Call Real API (Mock Payment)**
**File:** `src/components/InstallerLeadFeed.tsx` (lines 91-118)

**REPLACE:**
```typescript
const handlePayment = async () => {
  if (!lead) return;
  
  setIsProcessing(true);
  setPaymentStatus('processing');
  
  try {
    // MOCK PAYMENT SIMULATION (Stripe-ready architecture)
    // When Stripe is available, replace this section with:
    // const paymentIntent = await stripe.createPaymentIntent(...)
    // await stripe.confirmPayment(paymentIntent)
    
    // Simulate payment processing delay (remove when Stripe is added)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Call real purchase API (this stays even with Stripe)
    const success = await onUnlockLead(lead.id);
    
    if (!success) {
      setPaymentStatus('error');
      setTimeout(() => setPaymentStatus('idle'), 3000);
      return;
    }
    
    setPaymentStatus('success');
    setTimeout(() => {
      onPaymentSuccess(lead.id);
      onClose();
      setPaymentStatus('idle');
    }, 1500);
  } catch (error) {
    console.error('Purchase error:', error);
    setPaymentStatus('error');
    setTimeout(() => setPaymentStatus('idle'), 3000);
  } finally {
    setIsProcessing(false);
  }
};
```

**Stripe Integration Point (Future):**
```typescript
// FUTURE: Add between line "setPaymentStatus('processing')" and "await onUnlockLead"
const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});
if (stripeError) throw new Error(stripeError.message);
```

#### **Step 2.3: Pass `onUnlockLead` Through Component Tree**
**File:** `src/components/InstallerLeadFeed.tsx` (line 733)

**UPDATE Modal Props:**
```typescript
<StripeUnlockModal
  isOpen={showUnlockModal}
  onClose={() => {
    setShowUnlockModal(false);
    setSelectedLead(null);
  }}
  lead={selectedLead}
  onUnlockLead={onUnlockLead}  // NEW: Pass through parent's real API callback
  onPaymentSuccess={handlePaymentSuccess}
  installer={installer}
/>
```

**Note:** `leads/page.tsx` already provides `onUnlockLead={handleUnlockLead}` which calls the purchase API and refetches data. We're just wiring the modal to use it.

**Testing:** 
1. ✅ Click "Unlock Lead" button
2. ✅ Confirm modal opens with lead details
3. ✅ Click "Pay $X to Unlock"
4. ✅ Verify mock payment processing (1.5s delay)
5. ✅ Check API call to `/api/installer/leads/[id]/purchase` in Network tab
6. ✅ Verify lead status updates to PURCHASED
7. ✅ Contact details revealed (name, phone, email unmasked)
8. ✅ Modal closes with success message
9. ✅ Lead refetches and shows updated state

**❌ STOP RULE:** If any test fails, DO NOT proceed to Phase 3. Fix issues first.

**Success Criteria:**
- Purchase flow completes without errors
- API call returns 200 status
- Contact details unlock correctly
- UI updates reflect server state

---

### **Phase 3: Purchased Leads Page** ❌ **ENDPOINT MISSING**
**Goal:** Create purchased leads API endpoint and fix page to call correct endpoint.

**Audit Findings:**
- ✅ UI exists with tabbed interface (CALL_VISIT, WRITTEN_QUOTE, BIDDING)
- ❌ **CRITICAL:** Endpoint `/api/installer/leads/purchased` does not exist
- ❌ Page calls wrong endpoint `/api/leads?purchased=true` (404 error)
- ❌ Page is non-functional

#### **Step 3.1: Create Purchased Leads API Endpoint**
**File:** `src/app/api/installer/leads/purchased/route.ts` (NEW)

```typescript
/**
 * GET /api/installer/leads/purchased - Get leads purchased by logged-in installer
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check installer role
    if (session.user.role !== 'INSTALLER') {
      return NextResponse.json(
        { error: 'Installer access required' },
        { status: 403 }
      );
    }
    
    // Query purchased leads
    const purchasedLeads = await prisma.lead.findMany({
      where: {
        installerId: session.user.id,
        purchasedAt: { not: null }
      },
      include: {
        homeowner: { 
          select: { id: true, name: true, phone: true, email: true } 
        },
        quotes: { 
          select: { id: true } 
        }
      },
      orderBy: { purchasedAt: 'desc' }
    });
    
    // Format response
    const leads = purchasedLeads.map(lead => ({
      id: lead.id,
      quoteType: lead.quoteType,
      status: lead.status,
      purchaseStatus: lead.purchaseStatus,
      purchasedAt: lead.purchasedAt?.toISOString(),
      leadPrice: lead.leadPrice,
      homeowner: {
        id: lead.homeowner.id,
        name: lead.homeowner.name,
        phone: lead.homeowner.phone,
        email: lead.homeowner.email
      },
      location: lead.location,
      postcode: lead.postcode,
      state: lead.state,
      propertyType: lead.propertyType,
      roofType: lead.roofType,
      budgetRange: lead.budgetRange,
      quotesCount: lead.quotes.length
    }));
    
    return NextResponse.json({
      success: true,
      leads,
      count: leads.length
    });
    
  } catch (error) {
    console.error('Error fetching purchased leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchased leads' },
      { status: 500 }
    );
  }
}
```

#### **Step 3.2: Update `purchased-leads/page.tsx` to Call Correct Endpoint**
**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx` (line 76)

**REPLACE:**
```typescript
// OLD (404 error):
const response = await fetch('/api/leads?purchased=true');

// NEW:
const response = await fetch('/api/installer/leads/purchased');
```

#### **Step 3.3: Enhance UI with Tab Filtering (Already Exists)**
**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Current Implementation (lines 95-110):** ✅ Already correct
```typescript
const [activeTab, setActiveTab] = useState<'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING'>('CALL_VISIT');

const filteredLeads = leads.filter(lead => lead.quoteType === activeTab);

// Tabs render with onClick={() => setActiveTab(tab)}
// Filtered leads displayed per tab
```

**Testing:** 
1. ✅ Purchase a CALL_VISIT lead via Phase 2 flow
2. ✅ Navigate to `/installer/purchased-leads`
3. ✅ Verify lead appears in "Call/Visit" tab
4. ✅ Check contact details fully visible (name, phone, email)
5. ✅ Switch tabs to verify filtering works (tabs should show 0 leads if no purchases)
6. ✅ Verify purchased date displayed correctly
7. ✅ Check endpoint returns 200 with correct data structure

**❌ STOP RULE:** If API returns 404 or page shows errors, DO NOT proceed to Phase 4. Fix endpoint first.

**Success Criteria:**
- Endpoint `/api/installer/leads/purchased` returns valid data
- Tabbed interface filters correctly by quoteType
- All contact details unmasked and displayed
- Purchase date/status shown correctly

---

### **Phase 4: Multi-Installer Purchase Logic** ❌ **NOT IMPLEMENTED**
**Goal:** Show "Purchased by another installer" state when lead is bought by competitor.

**Audit Findings:**
- ✅ API includes `isPurchased` field (this installer bought it)
- ❌ API does NOT include `isPurchasedByAnother` field
- ❌ UI cannot detect when another installer purchased the lead
- ❌ Leads remain clickable even after another installer purchases

#### **Step 4.1: Update Assigned Leads API to Include Purchase Info**
**File:** `src/app/api/installer/leads/assigned/route.ts` (line 89)

**ADD Field:**
```typescript
// Current (line 89):
const isPurchased = lead.installerId === session.user.id && !!lead.purchasedAt;

return {
  ...lead,
  homeowner: {
    name: isPurchased ? lead.homeowner.name : '***LOCKED***',
    phone: isPurchased ? lead.homeowner.phone : '***LOCKED***'
  },
  isPurchased,
  isPurchasedByAnother: !!lead.installerId && lead.installerId !== session.user.id, // NEW
};
```

**Logic Explanation:**
- `isPurchased`: This installer purchased it (show unlocked contact)
- `isPurchasedByAnother`: Different installer purchased it (show disabled state)
- Both false: Lead available for purchase

#### **Step 4.2: Update Type Definition**
**File:** `src/types/installer.ts` or inline in `leads/page.tsx`

**ADD Field:**
```typescript
interface AssignedLead {
  id: string;
  // ... existing fields
  isPurchased: boolean;
  isPurchasedByAnother: boolean;  // NEW
}
```

#### **Step 4.3: Update Lead Card to Show "Purchased by Another" State**
**File:** `src/components/InstallerLeadFeed.tsx` (LeadCard component)

**Current Check (line 240):**
```typescript
const isUnlockedByInstaller = lead.unlockedBy.includes(installer.id);
const canUnlock = lead.type === 'call_visit' && !isUnlockedByInstaller && lead.status === 'new';
```

**UPDATE With New Field:**
```typescript
const isUnlockedByInstaller = lead.isUnlocked;  // From mapped data
const isPurchasedByAnother = lead.isPurchasedByAnother || false;  // NEW
const canUnlock = lead.type === 'call_visit' && 
                  !isUnlockedByInstaller && 
                  !isPurchasedByAnother &&  // NEW: Disable if someone else bought it
                  lead.status === 'new';
```

**ADD Visual Indicator (after line 260):**
```typescript
<div className={`theme-card border-l-4 ${getPriorityColor()} p-6 ${isPurchasedByAnother ? 'opacity-50' : ''}`}>
  
  {/* Show banner if purchased by another */}
  {isPurchasedByAnother && (
    <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
      <div className="flex items-center space-x-2">
        <LockIcon className="h-5 w-5 text-error" />
        <p className="text-body text-error">
          ⛔ This lead has been purchased by another installer
        </p>
      </div>
    </div>
  )}
  
  {/* Rest of card content */}
```

**DISABLE Actions (line 480):**
```typescript
{/* Action Buttons */}
<div className="flex flex-wrap gap-2">
  {canUnlock && !isPurchasedByAnother && (  // NEW: Additional check
    <Button
      onClick={() => onUnlock(lead.id)}
      variant="primary"
      className="flex items-center space-x-2"
      disabled={isPurchasedByAnother}  // NEW
    >
      <LockIcon className="h-4 w-4" />
      <span>Unlock Lead (${lead.unlockPrice})</span>
    </Button>
  )}
  
  {isPurchasedByAnother && (  // NEW: Show why disabled
    <div className="text-body-small text-error italic">
      This lead is no longer available (purchased by another installer)
    </div>
  )}
```

#### **Step 4.4: Update Mapping Function**
**File:** `src/app/installer/(dashboard)/leads/page.tsx` (line 10)

**ADD Field Mapping:**
```typescript
function mapAssignedLeadToComponentLead(apiLead: AssignedLead): Lead {
  const isLocked = apiLead.homeowner.name === '***LOCKED***';
  
  return {
    // ... existing fields
    isUnlocked: !isLocked,
    isPurchasedByAnother: apiLead.isPurchasedByAnother || false,  // NEW
    unlockedBy: !isLocked ? [1] : [],
    // ... rest
  };
}
```

**Testing:** 
1. ✅ Create test lead assigned to 2 installers (Installer A and B)
2. ✅ Login as Installer A and purchase lead
3. ✅ Verify purchase completes successfully
4. ✅ Login as Installer B
5. ✅ Verify lead shows "Purchased by another installer" banner
6. ✅ Check "Unlock" button is disabled or hidden
7. ✅ Confirm lead card is visually dimmed (opacity-50)
8. ✅ Verify API returns `isPurchasedByAnother: true` for Installer B

**❌ STOP RULE:** If Installer B can still purchase the lead, DO NOT proceed. Fix API field first.

**Success Criteria:**
- API includes `isPurchasedByAnother` field
- UI shows disabled state for purchased leads
- Multi-installer scenario works correctly
- No duplicate purchases possible

---

## 🎯 INSTALLER FLOW COMPLETE - PHASE 2-4 CHECKPOINT

**Before Proceeding to Admin/Homeowner Flows:**
- ✅ All Phases 2-4 tests passed
- ✅ Purchase flow works end-to-end
- ✅ Purchased leads page functional
- ✅ Multi-installer detection working
- ✅ No errors in console or network tab
- ✅ Manual testing with 2+ installer accounts successful

**If ANY test failed:** Stop and fix before proceeding to Phase 6-7.

---

### **Phase 5: Real-Time Status Sync (Optional Enhancement)**
**Goal:** Refresh lead status when another installer purchases.

#### **Option A: Polling (Simple)**
**File:** `src/components/InstallerLeadFeed.tsx`

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Re-fetch assigned leads every 30 seconds:
    fetch('/api/installer/leads/assigned')
      .then(res => res.json())
      .then(data => setLocalLeads(data.leads));
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

#### **Option B: Websockets (Advanced)**
- Setup Pusher/Ably for real-time events
- Emit `lead.purchased` event when purchase completes
- Subscribe in frontend to update UI instantly

**Recommendation:** Start with polling (Phase 5A), upgrade to websockets later if needed.

---

### **Phase 6: Homeowner Flow**
**Goal:** Lock homeowner actions after purchase, send notifications.

#### **Step 6.1: Update Purchase Endpoint to Trigger Homeowner Notification**
**File:** `src/app/api/installer/leads/[id]/purchase/route.ts`

```typescript
// After successful purchase:
await prisma.notification.create({
  data: {
    userId: lead.homeownerId,
    type: 'LEAD_PURCHASED',
    message: 'An installer has responded to your request and will contact you soon.',
    leadId: lead.id
  }
});

// TODO: Send email/SMS notification (future enhancement)
```

#### **Step 6.2: Disable Homeowner Lead Editing After Purchase**
**File:** `src/app/api/homeowner/leads/[id]/route.ts` (PUT/PATCH/DELETE)

```typescript
// Before allowing update/delete:
const lead = await prisma.lead.findUnique({ where: { id: leadId } });

if (lead.purchasedAt) {
  return NextResponse.json(
    { error: 'Cannot modify lead after installer purchase' },
    { status: 403 }
  );
}
```

**Testing:** Purchase lead as installer → Login as homeowner → Try to edit/cancel lead → Verify blocked with message.

---

### **Phase 7: Admin Flow** (AFTER Homeowner Flow Complete)
**Goal:** Admin can view purchase history, reassign leads.

**Prerequisites:** Phases 2-4 and 6 must pass all tests.

#### **Step 7.1: Update Admin Lead Details Modal**
**File:** `src/components/admin/LeadDetailsModal.tsx`

```typescript
// Add section showing purchase status (after lead details):
{lead.purchasedAt && (
  <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4">
    <h4 className="text-heading-4 text-foreground mb-3">Purchase Information</h4>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-body-small text-muted">Purchased By:</span>
        <span className="text-body-small text-foreground">
          {lead.installer?.companyName || 'Unknown'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-body-small text-muted">Purchase Date:</span>
        <span className="text-body-small text-foreground">
          {new Date(lead.purchasedAt).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-body-small text-muted">Status:</span>
        <span className="text-body-small text-success">{lead.purchaseStatus}</span>
      </div>
    </div>
  </div>
)}
```

#### **Step 7.2: Add Reassign Lead Functionality (Optional)**
**File:** `src/app/api/admin/leads/[id]/reassign/route.ts` (NEW - Optional)

```typescript
/**
 * POST /api/admin/leads/[id]/reassign - Reassign lead to another installer
 * NOTE: This resets purchase status (use with caution)
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  // Admin auth check
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  const { installerId, reason } = await request.json();
  
  await prisma.lead.update({
    where: { id: params.id },
    data: {
      installerId,
      purchasedAt: null, // Reset purchase
      purchaseStatus: null,
      status: 'APPROVED',
      adminNotes: `Reassigned: ${reason || 'No reason provided'}`
    }
  });
  
  // Log admin action
  await prisma.auditLog.create({
    data: {
      action: 'LEAD_REASSIGNED',
      performedBy: session.user.id,
      leadId: params.id,
      details: JSON.stringify({ installerId, reason })
    }
  });
  
  return NextResponse.json({ success: true });
}
```

**Testing:** 
1. ✅ Complete Phases 2-4 and 6
2. ✅ Purchase a lead as installer
3. ✅ Login as admin
4. ✅ Open lead details modal
5. ✅ Verify purchase information section displays
6. ✅ Check installer name, date, status are correct
7. ✅ (Optional) Test reassign functionality if implemented

**❌ STOP RULE:** If purchase info doesn't display or data is incorrect, DO NOT mark complete. Fix data fetching first.

**Success Criteria:**
- Purchase info visible in admin modal
- All purchase details accurate
- (Optional) Reassign functionality works if implemented
- Admin can track lead lifecycle

---

### **Phase 8: Audit Logging & Analytics**
**Goal:** Track all purchase attempts, status changes.

#### **Step 8.1: Add Audit Log Entry on Purchase**
**File:** `src/app/api/installer/leads/[id]/purchase/route.ts`

```typescript
// After successful purchase:
await prisma.auditLog.create({
  data: {
    leadId: lead.id,
    userId: session.user.id,
    action: 'LEAD_PURCHASED',
    details: JSON.stringify({
      leadPrice: lead.leadPrice,
      purchaseStatus: 'COMPLETED',
      timestamp: new Date().toISOString()
    })
  }
});
```

#### **Step 8.2: Track Purchase Attempt Failures**
```typescript
// In catch block:
await prisma.auditLog.create({
  data: {
    leadId: leadId,
    userId: session.user.id,
    action: 'PURCHASE_FAILED',
    details: JSON.stringify({ error: error.message })
  }
});
```

**Testing:** Check audit logs table after purchase → Verify entries created.

---

## 4. Testing Checklist

### **Installer Flow:**
- [ ] Assigned leads display with masked contact
- [ ] Purchase button shows price and terms
- [ ] Confirmation modal appears before purchase
- [ ] API call to `/api/installer/leads/[id]/purchase` succeeds
- [ ] Lead status updates to PURCHASED
- [ ] Contact details unlock after purchase
- [ ] Success toast appears
- [ ] Lead moves to purchased-leads page
- [ ] Other installers see "Purchased by another" state
- [ ] Polling updates lead status every 30 seconds

### **Homeowner Flow:**
- [ ] Notification sent on purchase
- [ ] Lead status shown as "Responded by an Installer"
- [ ] Edit/cancel actions disabled after purchase
- [ ] Message displayed: "An installer will contact you soon"

### **Admin Flow:**
- [ ] Purchase info visible in lead details modal
- [ ] Admin can reassign lead
- [ ] Audit log entries created for purchases
- [ ] Admin can view purchase history

### **Edge Cases:**
- [ ] Concurrent purchase attempts → Error shown to slower installer
- [ ] Expired lead purchase → Error: "Lead has expired"
- [ ] Insufficient credits → Error: "Insufficient balance" (future)
- [ ] Lead cancelled/archived post-purchase → "No longer available" shown

---

## 5. Rollback Plan

If issues arise, revert changes in reverse order:

1. **Phase 8-7:** Remove audit logging & admin features (non-breaking)
2. **Phase 6:** Re-enable homeowner edit actions (remove lock)
3. **Phase 5:** Disable polling (no impact on core flow)
4. **Phase 4:** Remove "Purchased by another" UI (leads still function)
5. **Phase 3:** Hide purchased-leads page (leads remain in feed)
6. **Phase 2:** Revert to mock purchase flow (temporary)
7. **Phase 1:** Restore mock data (full rollback)

**Git:** Each phase committed separately for easy cherry-pick/revert.

---

## 6. Success Criteria

✅ **Core Flow Working:**
- Installer can view assigned CALL_VISIT leads with masked contact
- Purchase button triggers real API call
- Lead status updates to PURCHASED
- Contact details unlock for purchasing installer only
- Other installers see lead as unavailable

✅ **No Breaking Changes:**
- Existing WRITTEN_QUOTE and BIDDING flows unaffected
- Dashboard routing preserved
- Design system standards maintained

✅ **Audit Trail:**
- All purchase attempts logged
- Admin can view purchase history

---

## 7. Next Steps

1. **Review Audit Report:**
   - Read `DEEP-AUDIT-REPORT.md` for detailed findings
   - Understand what's already complete vs what needs work

2. **Start Phase 2 (CRITICAL):**
   - Wire `StripeUnlockModal` to call `onUnlockLead` prop
   - Pass callback through component tree
   - Test end-to-end purchase flow
   - **Estimated Time: 30 minutes**

3. **Execute Phase 3 (HIGH PRIORITY):**
   - Create `/api/installer/leads/purchased` endpoint
   - Fix `purchased-leads/page.tsx` to call correct endpoint
   - Test tabbed interface and filtering
   - **Estimated Time: 1 hour**

4. **Execute Phase 4 (MEDIUM PRIORITY):**
   - Add `isPurchasedByAnother` field to assigned leads API
   - Update UI to show disabled state for purchased leads
   - Test multi-installer scenario
   - **Estimated Time: 30 minutes**

5. **Defer Phases 5-8:**
   - Polling/real-time sync (optional enhancement)
   - Homeowner notifications (future work)
   - Admin tracking (future work)
   - Audit logging (future work)

6. **Final Validation:**
   - Run full test suite (Phases 2-4)
   - Verify all success criteria met
   - Update gitstatus.md with final commit

---

**⏱️ Total Time to MVP: 2 hours**
- Phase 2 (wire modal): 30 min
- Phase 3 (purchased endpoint): 1 hour
- Phase 4 (multi-installer): 30 min

**Key Takeaway from Audit:**
- ✅ Backend is production-ready
- ✅ Data fetching works correctly
- 🔧 Modal just needs wiring to existing API
- 🔧 Purchased leads needs new endpoint
- 🔧 Multi-installer detection is simple 1-line addition

---

**End of Implementation Plan**
