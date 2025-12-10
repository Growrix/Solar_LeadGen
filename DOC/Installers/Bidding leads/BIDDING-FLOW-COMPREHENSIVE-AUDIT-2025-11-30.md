# Bidding Flow Comprehensive Audit Report
**Date**: November 30, 2025  
**Branch**: bidding  
**Audit Type**: Full-Stack (Frontend + Backend + Database)  
**Status**: CRITICAL GAPS IDENTIFIED

---

## Executive Summary

### ⚠️ CRITICAL FINDINGS

**Overall Status**: **PARTIALLY IMPLEMENTED - MAJOR GAPS EXIST**

The bidding flow implementation shows significant progress on backend API endpoints but **CRITICAL gaps exist** in:
1. ❌ **NO Bid model in Prisma schema** - Backend APIs reference non-existent database tables
2. ❌ **Installer lead feed does NOT fetch or display bidding leads correctly**
3. ❌ **Homeowner bidding review modal is UI-only with mock data**
4. ❌ **No bid submission flow working end-to-end**
5. ❌ **Admin bidding oversight panel does NOT exist**

**Risk Level**: **HIGH** - Current implementation will crash when installers attempt to submit bids.

---

## 1. DATABASE SCHEMA AUDIT

### 1.1 Missing Bid Model (CRITICAL)

**Status**: ❌ **NOT IMPLEMENTED**

**Finding**: The `prisma/schema.prisma` file does **NOT contain a Bid model**, yet backend APIs (`src/app/api/bids/route.ts`, `src/app/api/leads/[id]/bids/route.ts`) reference `prisma.bid.findMany()`, `prisma.bid.create()`, etc.

**Impact**: 
- Any attempt to submit a bid will result in **runtime crash**: `PrismaClient.bid is undefined`
- Database cannot store bid data
- All bidding functionality is non-functional

**Expected Schema** (from brainstorm3.md plan):
```prisma
model Bid {
  id                   String   @id @default(cuid())
  leadId               String
  installerId          String
  amount               Float
  capacityOffer        Float?
  expectedInstallDate  DateTime?
  notes                String?
  
  // Equipment details
  panelBrand           String?
  panelCustom          String?
  inverterBrand        String?
  inverterCustom       String?
  batteryBrand         String?
  batteryCapacity      Float?
  batteryCapacityCustom Float?
  
  // Financial breakdown
  includeGst           Boolean  @default(true)
  gstPercent           Float    @default(10)
  includeIncentive     Boolean  @default(false)
  incentiveAmount      Float    @default(0)
  subtotal             Float
  gstAmount            Float
  finalTotal           Float
  
  // Line items (optional detailed breakdown)
  lineItems            Json?
  
  // Status and timestamps
  status               BidStatus @default(SUBMITTED)
  submittedAt          DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  selectedAt           DateTime?
  purchasedAt          DateTime?
  
  // Relations
  lead                 Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  installer            User      @relation("installer_bids", fields: [installerId], references: [id], onDelete: Cascade)
  
  @@unique([leadId, installerId])
  @@index([leadId])
  @@index([installerId])
  @@index([status])
  @@map("bids")
}

enum BidStatus {
  DRAFT
  SUBMITTED
  SHORTLISTED
  SELECTED
  LOST
  EXPIRED
}
```

**Required Action**:
1. Add Bid model to `prisma/schema.prisma`
2. Add `bids` relation to Lead model: `bids Bid[] @relation("lead_bids")`
3. Add `bids` relation to User model: `installerBids Bid[] @relation("installer_bids")`
4. Run `npx prisma migrate dev --name add-bidding-model`
5. Run `npx prisma generate`

---

### 1.2 Lead Model - Bidding Support

**Status**: ✅ **IMPLEMENTED**

**Finding**: Lead model correctly includes:
- `quoteType LeadQuoteType @default(CALL_VISIT)` with `BIDDING` enum value
- `expiresAt DateTime?` for countdown timer
- `leadPrice Float?` for bid pricing

**Gap**: No `bids` relation field (will be added when Bid model is created)

---

## 2. BACKEND API AUDIT

### 2.1 Bid Submission API (`/api/bids`)

**File**: `src/app/api/bids/route.ts`  
**Status**: ⚠️ **PARTIALLY IMPLEMENTED - WILL CRASH**

**What Exists**:
- POST endpoint with authentication (INSTALLER role only)
- Validation for `leadId`, `amount > 0`
- Validation for lead type = BIDDING
- Countdown expiry check
- Duplicate bid detection logic

**Critical Issues**:
```typescript
// Line 94: References non-existent Bid model
const existingBid = await prisma.bid.findUnique({
  where: {
    leadId_installerId: {
      leadId: body.leadId,
      installerId: session.user.id
    }
  }
});
```
**Error**: `prisma.bid` is `undefined` - No Bid model in schema

**What's Missing**:
1. ❌ Bid creation logic (commented out or incomplete)
2. ❌ Draft bid saving/restoring
3. ❌ Autosave functionality
4. ❌ Notification to homeowner after first bid
5. ❌ Audit logging

**Expected Flow** (not implemented):
```typescript
// After validation, should create bid
const bid = await prisma.bid.create({
  data: {
    leadId: body.leadId,
    installerId: session.user.id,
    amount: body.amount,
    capacityOffer: body.capacityOffer,
    expectedInstallDate: body.expectedInstallDate ? new Date(body.expectedInstallDate) : null,
    notes: body.notes,
    panelBrand: body.panelBrand,
    panelCustom: body.panelCustom,
    inverterBrand: body.inverterBrand,
    inverterCustom: body.inverterCustom,
    batteryBrand: body.batteryBrand,
    batteryCapacity: body.batteryCapacity,
    batteryCapacityCustom: body.batteryCapacityCustom,
    includeGst: body.includeGst ?? true,
    gstPercent: body.gstPercent ?? 10,
    includeIncentive: body.includeIncentive ?? false,
    incentiveAmount: body.incentiveAmount ?? 0,
    subtotal: body.subtotal,
    gstAmount: body.gstAmount,
    finalTotal: body.finalTotal,
    lineItems: body.lineItems,
    status: 'SUBMITTED'
  }
});

// Update lead status if first bid
const bidCount = await prisma.bid.count({ where: { leadId: body.leadId } });
if (bidCount === 1) {
  await prisma.lead.update({
    where: { id: body.leadId },
    data: { status: 'QUOTED' } // Or create new status: BID_RECEIVED
  });
}

// Send notification to homeowner
// ... notification logic

return NextResponse.json({ success: true, bidId: bid.id }, { status: 201 });
```

---

### 2.2 Bid Listing API (`/api/leads/[id]/bids`)

**File**: `src/app/api/leads/[id]/bids/route.ts`  
**Status**: ⚠️ **PARTIALLY IMPLEMENTED - WILL CRASH**

**What Exists**:
- GET endpoint with authentication (HOMEOWNER role only)
- Ownership validation (lead.homeownerId === session.user.id)
- Countdown status calculation
- Anonymization logic for installers

**Critical Issues**:
```typescript
// Line 76: References non-existent Bid model
const bids = await prisma.bid.findMany({
  where: { leadId },
  include: {
    installer: {
      select: {
        id: true,
        companyName: true,
        installerVerified: true
      }
    }
  },
  orderBy: { submittedAt: 'desc' }
});
```
**Error**: `prisma.bid` is `undefined`

**What's Missing**:
1. ❌ Actual bid data (will crash on fetch)
2. ❌ Recommendation score calculation (valueScore logic exists but can't execute)
3. ❌ Real anonymization (logic exists but no data)

---

### 2.3 Bid Selection API (`/api/bids/[bidId]/select`)

**File**: `src/app/api/bids/[bidId]/select/route.ts`  
**Status**: ⚠️ **IMPLEMENTED BUT UNTESTED**

**What Exists**:
- POST endpoint for homeowner to select winning bid
- Validation and ownership checks
- Status update logic (sets selected bid to SELECTED, others to LOST)

**Issues**: Cannot test until Bid model exists

---

### 2.4 Bid Purchase API (`/api/bids/[bidId]/purchase`)

**File**: `src/app/api/bids/[bidId]/purchase/route.ts`  
**Status**: ⚠️ **IMPLEMENTED BUT UNTESTED**

**What Exists**:
- POST endpoint for installer to purchase winning bid
- Payment processing placeholder (ready for Stripe)
- Contact unlocking logic

**Issues**: Cannot test until Bid model exists and selection flow works

---

### 2.5 Installer Assigned Leads API

**File**: `src/app/api/installer/leads/assigned/route.ts`  
**Status**: ✅ **WORKING FOR BIDDING LEADS**

**Finding**: Line 87 correctly converts `BIDDING` to `'bidding'` for frontend:
```typescript
quoteType: lead.quoteType.toLowerCase().replace('_quote', '') as 'call_visit' | 'written' | 'bidding'
```

**Confirmed**: API should return bidding leads when admin assigns them

---

## 3. FRONTEND AUDIT

### 3.1 Quote Builder Modal (Bid Submission UI)

**File**: `src/components/QuoteBuilderModal.tsx`  
**Status**: ✅ **MOSTLY IMPLEMENTED** with minor gaps

**What Exists**:
- Brand dropdowns (panels, inverters, batteries) with "Custom..." option ✅
- Battery capacity dropdown with custom input ✅
- GST toggle with percentage input ✅
- Federal incentive toggle with amount input ✅
- Line items editor ✅
- Live preview with totals calculation ✅
- Autosave states declared (`isSaving`, `lastSaved`) ✅

**Gaps**:
1. ⚠️ **"Submit Bid" button** - Currently shows "Send Quote", needs conditional rendering:
   ```tsx
   {mode === 'bid' ? 'Submit Bid' : 'Send Quote'}
   ```
2. ⚠️ **Autosave implementation incomplete** - States exist but no `useEffect` with debounce to actually save to localStorage
3. ⚠️ **Draft restore** - No logic to restore from `localStorage.getItem('bid:draft:${leadId}:${installerId}')`
4. ⚠️ **Preview PDF button** - Still visible, should be hidden for bidding mode
5. ⚠️ **Bid submission handler** - No API call to POST `/api/bids`

**Expected Flow** (missing):
```tsx
const handleSubmitBid = async () => {
  if (!lead) return;
  
  const bidData = {
    leadId: lead.id,
    amount: calculateFinalTotal(), // Use existing calculation
    capacityOffer: quoteData.systemSize,
    expectedInstallDate: expectedInstallDate,
    notes: additionalNotes,
    panelBrand: showCustomPanelInput ? null : selectedPanelBrand,
    panelCustom: showCustomPanelInput ? customPanelBrand : null,
    inverterBrand: showCustomInverterInput ? null : selectedInverterBrand,
    inverterCustom: showCustomInverterInput ? customInverterBrand : null,
    batteryBrand: showCustomBatteryInput ? null : selectedBatteryBrand,
    batteryCapacity: showCustomCapacityInput ? customBatteryCapacity : batteryCapacity,
    includeGst,
    gstPercent,
    includeIncentive,
    incentiveAmount,
    subtotal: calculateSubtotal(),
    gstAmount: calculateGstAmount(),
    finalTotal: calculateFinalTotal(),
    lineItems: quoteData.lineItems
  };
  
  const response = await fetch('/api/bids', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bidData)
  });
  
  if (response.ok) {
    toast.success('Bid submitted successfully');
    // Remove draft from localStorage
    localStorage.removeItem(`bid:draft:${lead.id}:${installerId}`);
    onClose();
    // Refresh lead feed
  }
};
```

---

### 3.2 Bid Evaluation Modal (Installer View)

**File**: `src/components/BidEvaluationModal.tsx`  
**Status**: ✅ **IMPLEMENTED** (UI-only)

**What Exists**:
- Modal displays lead technical details ✅
- Masked contact information ✅
- InstantQuote results with charts ✅
- Bidding status badge ✅

**Confirmed**: This component is display-only and should work once data flows correctly

---

### 3.3 Homeowner Bidding Review Modal

**File**: `src/components/homeowner/HomeownerBiddingReviewModal.tsx`  
**Status**: ⚠️ **UI-ONLY - NO BACKEND CONNECTION**

**What Exists**:
- Beautiful UI with anonymized bid cards ✅
- Sorting by status and price ✅
- "Request Contact" button ✅
- Rating display ✅

**Critical Issues**:
1. ❌ **Props accept mock data only** - `bids: BidForHomeowner[]` parameter expects pre-formatted array
2. ❌ **No data fetching** - Does NOT call `/api/leads/[id]/bids`
3. ❌ **`onRequestContact` is a stub** - Needs to call `/api/bids/[bidId]/select`

**Expected Integration** (missing in homeowner dashboard):
```tsx
// In src/app/homeowner/dashboard/page.tsx
const [biddingLeadId, setBiddingLeadId] = useState<string | null>(null);
const [bids, setBids] = useState<BidForHomeowner[]>([]);
const [loadingBids, setLoadingBids] = useState(false);

const fetchBids = async (leadId: string) => {
  setLoadingBids(true);
  try {
    const response = await fetch(`/api/leads/${leadId}/bids`);
    const data = await response.json();
    setBids(data.bids); // Transform to BidForHomeowner format
  } catch (error) {
    toast.error('Failed to load bids');
  } finally {
    setLoadingBids(false);
  }
};

const handleRequestContact = async (bidId: string) => {
  const response = await fetch(`/api/bids/${bidId}/select`, {
    method: 'POST'
  });
  if (response.ok) {
    toast.success('Installer selected! They can now purchase access to your contact details.');
    fetchBids(biddingLeadId); // Refresh
  }
};

// Trigger on "Review Bids" button click
<Button onClick={() => {
  setBiddingLeadId(lead.id);
  fetchBids(lead.id);
}}>
  Review Bids
</Button>

// Modal
<HomeownerBiddingReviewModal
  isOpen={!!biddingLeadId}
  onClose={() => setBiddingLeadId(null)}
  leadId={biddingLeadId}
  propertyAddress={lead.address}
  bids={bids}
  onRequestContact={handleRequestContact}
/>
```

---

### 3.4 Installer Lead Feed (Bidding Display)

**File**: `src/components/InstallerLeadFeed.tsx`  
**Status**: ⚠️ **PARTIALLY IMPLEMENTED**

**What Exists**:
- Imports `QuoteBuilderModal` and `BidEvaluationModal` ✅
- State for `isBidEvaluationOpen` ✅
- "Lead Details" button opens `BidEvaluationModal` ✅

**Critical Gaps**:
1. ⚠️ **No "Place Bid" button logic for BIDDING leads** - Button likely shows "View Details" or "Purchase" instead
2. ⚠️ **QuoteBuilderModal not opened in bidding mode** - Needs `mode="bid"` prop
3. ⚠️ **No draft detection** - Should show "Draft Saved — Click to Edit" button
4. ⚠️ **Status badges incomplete** - Missing: BID_SUBMITTED, AWAITING_HOMEOWNER_DECISION, AWARDED_PENDING_PURCHASE, LOST

**Expected UI Logic** (missing):
```tsx
// Detect draft
const hasDraft = typeof window !== 'undefined' && 
  localStorage.getItem(`bid:draft:${lead.id}:${installerId}`) !== null;

// Render buttons for bidding leads
{lead.type === 'bidding' && (
  <>
    <Button onClick={() => setIsBidEvaluationOpen(true)}>
      Lead Details
    </Button>
    
    {lead.status === 'OPEN' || lead.status === 'BID_SUBMITTED' ? (
      <>
        <Button 
          variant="primary" 
          onClick={() => {
            setSelectedLead(lead);
            setIsQuoteBuilderOpen(true);
          }}
        >
          {hasDraft ? 'Update Bid' : 'Place Bid'}
        </Button>
        
        {hasDraft && (
          <Button variant="secondary" size="small">
            Draft Saved — Click to Edit
          </Button>
        )}
      </>
    ) : lead.status === 'AWARDED_PENDING_PURCHASE' ? (
      <Button variant="success" onClick={() => handlePurchaseBid(lead.bidId)}>
        Purchase to Unlock Contact
      </Button>
    ) : (
      <StatusBadge status={lead.status} />
    )}
  </>
)}

// Pass mode prop to QuoteBuilderModal
<QuoteBuilderModal
  isOpen={isQuoteBuilderOpen}
  onClose={() => setIsQuoteBuilderOpen(false)}
  lead={selectedLead}
  mode={selectedLead?.type === 'bidding' ? 'bid' : 'quote'}
  onSubmitQuote={handleSubmitBid} // Rename or make conditional
/>
```

---

### 3.5 Admin Bidding Oversight

**File**: **DOES NOT EXIST**  
**Status**: ❌ **NOT IMPLEMENTED**

**Required Component**: `src/components/admin/AdminBidsPanel.tsx`

**Expected Features** (from brainstorm3.md):
- Read-only monitoring table
- Columns: Lead ID, Installer (anonymized toggle), Bid Total, GST included?, Incentive included?, Submitted At, Status
- Filter by lead, installer, status
- Export to CSV

**Required in Admin Lead Management Modal**:
- "View Bids" button when `lead.quoteType === 'BIDDING'`
- Opens `AdminBidsPanel` or inline table

---

## 4. DATA FLOW ANALYSIS

### 4.1 Complete Bidding Flow (Expected vs Actual)

#### **EXPECTED FLOW** (from brainstorm3.md):

1. **Homeowner Creates Lead**:
   - Selects `quoteType: BIDDING`
   - Admin assigns to multiple installers with countdown timer
   
2. **Admin Assigns Lead**:
   - Selects installers
   - Sets `expiresAt` (countdown)
   - Creates `LeadAssignment` records
   - Status: `APPROVED`

3. **Installer Receives Assignment**:
   - Sees lead in feed with status: `OPEN`
   - "Lead Details" button → `BidEvaluationModal` (masked contact)
   - "Place Bid" button → `QuoteBuilderModal` (bidding mode)

4. **Installer Submits Bid**:
   - Fills Quote Builder form
   - Clicks "Submit Bid"
   - POST `/api/bids` creates Bid record
   - Lead card status: `BID_SUBMITTED — AWAITING HOMEOWNER DECISION`
   - **First bid triggers**: Homeowner notification + Lead status → `QUOTED`

5. **Countdown Expires**:
   - All installers' inputs locked (UI-only)
   - Lead card status: `AWAITING HOMEOWNER DECISION` (or `DECISION_PENDING`)
   - Homeowner dashboard shows "Review Bids" button

6. **Homeowner Reviews Bids**:
   - Clicks "Review Bids" → `HomeownerBiddingReviewModal`
   - GET `/api/leads/[id]/bids` fetches anonymized bids
   - Sees bid comparison (anonymized installers)
   - Clicks "Request Contact" on preferred bid

7. **Homeowner Selects Winner**:
   - POST `/api/bids/[bidId]/select`
   - Selected bid status: `SELECTED`
   - Other bids status: `LOST`
   - Winner's lead card status: `AWARDED — PURCHASE TO UNLOCK`
   - Losers' lead cards disappear from feed or show `LOST`

8. **Winner Purchases**:
   - Sees "Purchase to Unlock Contact" button
   - POST `/api/bids/[bidId]/purchase` (with Stripe payment)
   - Bid status: `PURCHASED`
   - Contact details unlocked
   - Lead moves to "Purchased Leads → Bidding" tab
   - Homeowner lead card: "Installer Selected — Expect Contact After Purchase"

9. **Losers Notified**:
   - Email: "Thank you for bidding. Another installer was selected."
   - Bids archived

---

#### **ACTUAL FLOW** (Current Implementation):

1. **Homeowner Creates Lead**: ✅ Works
2. **Admin Assigns Lead**: ✅ Works (`LeadAssignment` created, `expiresAt` set)
3. **Installer Receives Assignment**: ⚠️ **PARTIALLY WORKS**
   - Lead appears in feed (confirmed by user)
   - Status may show as `WRITTEN_QUOTE` instead of `BIDDING` (user reported bug)
   - "Lead Details" button exists but may not be wired correctly
   - "Place Bid" button does **NOT** exist or is labeled incorrectly
4. **Installer Submits Bid**: ❌ **COMPLETELY BROKEN**
   - QuoteBuilderModal does NOT open in bidding mode
   - Even if opened, "Submit Bid" button does NOT exist
   - Even if clicked, API crashes (no Bid model)
5. **Countdown Expires**: ❌ **NOT IMPLEMENTED** (UI lock not enforced)
6. **Homeowner Reviews Bids**: ❌ **UI-ONLY, NO DATA**
   - Modal exists but not connected to API
   - No bids displayed (no data to display)
7. **Homeowner Selects Winner**: ❌ **CANNOT TEST** (no bids exist)
8. **Winner Purchases**: ❌ **CANNOT TEST**
9. **Losers Notified**: ❌ **NOT IMPLEMENTED**

---

### 4.2 User-Reported Issue: "Bidding lead showing as Written Quote"

**User Statement**: *"I have assigned a bidding lead to the installer > but it is showing up as a written quote in the installers lead feed"*

**Root Cause Analysis**:

**Possible Cause 1: Type Conversion Error**
- File: `src/app/api/installer/leads/assigned/route.ts`, Line 87
- Code: `quoteType: lead.quoteType.toLowerCase().replace('_quote', '') as 'call_visit' | 'written' | 'bidding'`
- Issue: `'BIDDING'.toLowerCase().replace('_quote', '')` = `'bidding'` ✅ (Correct)
- **Verdict**: API conversion is correct

**Possible Cause 2: Frontend Display Logic Error**
- File: `src/components/InstallerLeadFeed.tsx`
- Issue: Lead card rendering may have hardcoded type detection
- Example bug:
  ```tsx
  // WRONG: Assumes non-CALL_VISIT is written
  {lead.type !== 'call_visit' && <Badge>Written Quote</Badge>}
  
  // CORRECT:
  {lead.type === 'written' && <Badge>Written Quote</Badge>}
  {lead.type === 'bidding' && <Badge>Bidding</Badge>}
  ```
- **Verdict**: **LIKELY CAUSE** - Frontend type check logic is faulty

**Possible Cause 3: Assignment Modal Type Selection**
- Admin selects `BIDDING` but assignment doesn't save correctly
- **Verdict**: Unlikely (user confirmed assignment happened, just displayed wrong)

---

## 5. GAPS SUMMARY

### 5.1 Database Layer

| Component | Status | Priority | Issue |
|-----------|--------|----------|-------|
| Bid model | ❌ Missing | CRITICAL | No table to store bids |
| Bid relations | ❌ Missing | CRITICAL | Lead.bids[], User.installerBids[] |
| BidStatus enum | ❌ Missing | CRITICAL | Status tracking impossible |
| Migration | ❌ Not run | CRITICAL | Schema out of sync |

---

### 5.2 Backend APIs

| Endpoint | Status | Priority | Issue |
|----------|--------|----------|-------|
| POST /api/bids | ⚠️ Incomplete | CRITICAL | Crashes - no Bid model |
| GET /api/leads/[id]/bids | ⚠️ Incomplete | CRITICAL | Crashes - no Bid model |
| POST /api/bids/[bidId]/select | ⚠️ Untested | HIGH | Cannot test until Bid model exists |
| POST /api/bids/[bidId]/purchase | ⚠️ Untested | HIGH | Cannot test until selection works |
| Draft save/restore | ❌ Missing | MEDIUM | No autosave backend |
| Notifications | ❌ Missing | MEDIUM | Homeowner not notified of bids |

---

### 5.3 Frontend Components

| Component | Status | Priority | Issue |
|-----------|--------|----------|-------|
| QuoteBuilderModal - Submit Bid | ⚠️ Incomplete | CRITICAL | Still shows "Send Quote" |
| QuoteBuilderModal - Autosave | ⚠️ Incomplete | HIGH | No useEffect implementation |
| QuoteBuilderModal - Draft restore | ❌ Missing | HIGH | No localStorage restore |
| InstallerLeadFeed - Place Bid button | ❌ Missing | CRITICAL | No way to open bid form |
| InstallerLeadFeed - Bid statuses | ⚠️ Incomplete | HIGH | Missing BID_SUBMITTED, AWARDED, LOST |
| InstallerLeadFeed - Draft indicator | ❌ Missing | MEDIUM | No "Draft Saved" button |
| HomeownerBiddingReviewModal - API connection | ❌ Missing | CRITICAL | No data fetching |
| HomeownerBiddingReviewModal - Selection handler | ❌ Missing | CRITICAL | No API call to select winner |
| HomeownerDashboard - Review Bids trigger | ⚠️ Incomplete | HIGH | Button exists but doesn't fetch bids |
| AdminBidsPanel | ❌ Missing | MEDIUM | No oversight component |

---

### 5.4 User Experience Flows

| Flow | Status | Issue |
|------|--------|-------|
| Installer sees bidding lead | ⚠️ Broken | Shows as "Written Quote" |
| Installer places bid | ❌ Impossible | No button, no form, API crashes |
| Installer updates bid | ❌ Impossible | No draft system |
| Homeowner reviews bids | ❌ UI-only | No real data |
| Homeowner selects winner | ❌ Impossible | No API connection |
| Winner purchases | ❌ Untested | Cannot reach this stage |
| Losers notified | ❌ Missing | No notification system |

---

## 6. RECOMMENDATIONS

### 6.1 PHASE 0: Emergency Fixes (CRITICAL)

**MUST DO BEFORE ANY TESTING**:

1. **Create Bid Model**:
   ```bash
   # Add Bid model to prisma/schema.prisma (see Section 1.1)
   npx prisma migrate dev --name add-bidding-model
   npx prisma generate
   ```

2. **Fix Lead Feed Type Display**:
   - Audit `src/components/InstallerLeadFeed.tsx` rendering logic
   - Fix type badge display: `if (lead.type === 'bidding')` (not `!== 'call_visit'`)

3. **Test Dev Server**:
   ```bash
   npx tsc --noEmit  # Must return 0 errors
   npm run dev       # Must start without crashes
   ```

---

### 6.2 PHASE 1: Core Bidding Flow (HIGH PRIORITY)

**Goal**: Enable end-to-end bid submission and display

**Tasks**:

1. **Complete POST /api/bids**:
   - Add bid creation logic (see Section 2.1)
   - Add homeowner notification on first bid
   - Add audit logging
   - Test with Postman: Submit bid → Verify in Prisma Studio

2. **Wire QuoteBuilderModal**:
   - Add `mode` prop conditional rendering
   - Rename button: `{mode === 'bid' ? 'Submit Bid' : 'Send Quote'}`
   - Hide "Preview PDF" button for bidding mode
   - Add bid submission handler (see Section 3.1)
   - Test: Open modal → Fill form → Submit → Check network tab (201 Created)

3. **Fix InstallerLeadFeed**:
   - Add "Place Bid" button for `lead.type === 'bidding'`
   - Pass `mode="bid"` to QuoteBuilderModal
   - Test: Bidding lead → "Place Bid" → Modal opens → Submit → Success toast

4. **Connect HomeownerBiddingReviewModal**:
   - Add `fetchBids()` function in homeowner dashboard
   - Wire "Review Bids" button to fetch + open modal
   - Add `handleRequestContact()` → POST `/api/bids/[bidId]/select`
   - Test: Submit 2 bids → Homeowner reviews → Selects winner → Winner sees "Purchase" button

---

### 6.3 PHASE 2: Enhanced Features (MEDIUM PRIORITY)

1. **Autosave & Drafts**:
   - Add `useEffect` with debounce in QuoteBuilderModal
   - Save to `localStorage.setItem('bid:draft:${leadId}:${installerId}', JSON.stringify(draft))`
   - Restore on modal open
   - Show "Draft Saved — Click to Edit" button in lead feed

2. **Status Management**:
   - Add all bidding statuses to `BiddingStatusBadge`
   - Update lead card rendering for: BID_SUBMITTED, AWAITING_HOMEOWNER_DECISION, AWARDED, LOST
   - Lock inputs after countdown expires (UI-only)

3. **Winner Purchase Flow**:
   - Test POST `/api/bids/[bidId]/purchase`
   - Integrate Stripe payment (when API key available)
   - Unlock contact details on success
   - Move lead to "Purchased Leads → Bidding" tab

---

### 6.4 PHASE 3: Admin & Polish (LOW PRIORITY)

1. **Admin Bidding Panel**:
   - Create `AdminBidsPanel.tsx`
   - Read-only bid monitoring table
   - Add "View Bids" button in Lead Management Modal

2. **Notifications**:
   - Send email to homeowner on first bid
   - Send email to losers after selection
   - Send email to winner after selection

3. **Analytics**:
   - Track bid conversion rates
   - Show "Recently bid" highlights

---

## 7. TESTING PROTOCOL

### 7.1 Pre-Implementation Checklist

**BEFORE starting Phase 1**:

- [ ] Bid model added to schema
- [ ] Migration run successfully (`npx prisma migrate dev`)
- [ ] Prisma Client regenerated (`npx prisma generate`)
- [ ] TypeScript compiles (`npx tsc --noEmit` → 0 errors)
- [ ] Dev server starts (`npm run dev` → No crashes)
- [ ] Git backup created (`git add . && git commit -m "backup: before bidding phase 1"`)

---

### 7.2 Phase 1 Testing Steps

**After each task, STOP and test**:

**Task 1: Complete POST /api/bids**
1. Open Postman
2. POST `http://localhost:3000/api/bids`
3. Headers: `Content-Type: application/json`, Cookie: `{installer session}`
4. Body:
   ```json
   {
     "leadId": "test-lead-id",
     "amount": 15000,
     "capacityOffer": 6.6,
     "panelBrand": "Canadian Solar",
     "includeGst": true,
     "gstPercent": 10,
     "subtotal": 13636.36,
     "gstAmount": 1363.64,
     "finalTotal": 15000
   }
   ```
5. Expected: 201 Created, `{ success: true, bidId: "..." }`
6. Verify in Prisma Studio: `npx prisma studio` → bids table → See new record
7. **If fails, STOP. Fix before continuing.**

**Task 2: Wire QuoteBuilderModal**
1. Open browser: http://localhost:3000/installer/leads
2. Find bidding lead (if none, create via admin)
3. Click "Place Bid" button (must exist now)
4. Modal opens → Button text = "Submit Bid" (not "Send Quote")
5. Fill form → Click "Submit Bid"
6. Check browser console (no errors)
7. Check Network tab → POST `/api/bids` → 201 Created
8. Success toast appears
9. Modal closes
10. **If any step fails, STOP. Fix before continuing.**

**Task 3: Fix InstallerLeadFeed**
1. Refresh installer lead feed
2. Verify bidding lead card shows correct badge: "Bidding" (not "Written Quote")
3. Click "Place Bid" → Modal opens correctly
4. Submit bid → Card status updates to "Bid Submitted — Awaiting Homeowner Decision"
5. **If any step fails, STOP. Fix before continuing.**

**Task 4: Connect HomeownerBiddingReviewModal**
1. Log in as homeowner who created the bidding lead
2. Dashboard → See lead card with "Review Bids" button
3. Click "Review Bids" → Modal opens
4. Verify 2 bids displayed (submit 2 bids from different installers first)
5. Bids show: installer name (anonymized), price, equipment, timeline
6. Click "Request Contact" on one bid
7. Confirmation dialog → Confirm
8. Success toast → Modal closes
9. Log in as winning installer → Lead card shows "Purchase to Unlock Contact"
10. Log in as losing installer → Lead card shows "Lost" or disappears
11. **If any step fails, STOP. Fix before continuing.**

---

### 7.3 Acceptance Criteria

**Phase 1 is complete ONLY when**:

✅ Installer can see bidding leads with correct type badge  
✅ Installer can click "Place Bid" and submit bid successfully  
✅ Bid data is saved to database (verified in Prisma Studio)  
✅ Homeowner can see "Review Bids" button  
✅ Homeowner can open modal and see list of anonymized bids  
✅ Homeowner can select winning bid  
✅ Winner sees "Purchase to Unlock Contact" button  
✅ Losers see "Lost" status  
✅ All TypeScript errors = 0  
✅ Dev server runs without crashes  
✅ Browser console has no errors  

**DO NOT proceed to Phase 2 until ALL criteria pass.**

---

## 8. FILES TO MODIFY

### 8.1 Database

| File | Action | Priority |
|------|--------|----------|
| `prisma/schema.prisma` | Add Bid model, BidStatus enum, relations | CRITICAL |

### 8.2 Backend

| File | Action | Priority |
|------|--------|----------|
| `src/app/api/bids/route.ts` | Complete bid creation logic, notifications | CRITICAL |
| `src/app/api/leads/[id]/bids/route.ts` | Test and verify (should work after Bid model added) | HIGH |
| `src/app/api/bids/[bidId]/select/route.ts` | Test after Phase 1 complete | MEDIUM |
| `src/app/api/bids/[bidId]/purchase/route.ts` | Test after selection works | MEDIUM |

### 8.3 Frontend

| File | Action | Priority |
|------|--------|----------|
| `src/components/QuoteBuilderModal.tsx` | Add Submit Bid button, autosave, draft restore, API call | CRITICAL |
| `src/components/InstallerLeadFeed.tsx` | Fix type display, add Place Bid button, wire modal | CRITICAL |
| `src/components/homeowner/HomeownerBiddingReviewModal.tsx` | Wire to API (fetch bids, select winner) | CRITICAL |
| `src/app/homeowner/dashboard/page.tsx` | Add fetchBids(), handleRequestContact() | CRITICAL |
| `src/components/BiddingStatusBadge.tsx` | Add all bidding statuses | HIGH |

---

## 9. ESTIMATED EFFORT

| Phase | Tasks | Estimated Time | Risk Level |
|-------|-------|----------------|------------|
| Phase 0: Emergency Fixes | 3 tasks | 1-2 hours | LOW |
| Phase 1: Core Flow | 4 tasks | 6-8 hours | MEDIUM |
| Phase 2: Enhanced Features | 3 tasks | 4-6 hours | LOW |
| Phase 3: Admin & Polish | 3 tasks | 4-6 hours | LOW |
| **TOTAL** | **13 tasks** | **15-22 hours** | - |

---

## 10. CONCLUSION

The bidding flow is **30% implemented** with critical infrastructure in place (APIs, UI components) but **massive gaps prevent ANY functionality**:

1. ❌ **No database model** → Bids cannot be saved
2. ❌ **No bid submission flow** → Installers cannot bid
3. ❌ **No bid review flow** → Homeowners cannot see bids
4. ❌ **Type display bug** → Installers see wrong lead type

**The system will crash** if an installer attempts to submit a bid.

**RECOMMENDATION**: Follow Phase 0 → Phase 1 sequentially, testing after EACH task. Do NOT skip testing. Do NOT move to next phase until ALL acceptance criteria pass.

---

**End of Audit Report**
