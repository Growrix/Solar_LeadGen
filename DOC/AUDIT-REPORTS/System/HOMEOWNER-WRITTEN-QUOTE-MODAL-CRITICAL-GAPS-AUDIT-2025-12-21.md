# Homeowner Written Quote Review Modal - Critical Gaps Audit
**Date**: December 21, 2025  
**Author**: AI Agent (Constitutional Audit Workflow)  
**Phase**: Phase 4.16.17 - Critical Bug Fixes  
**Authority**: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`  
**Status**: 🔴 CRITICAL - Multiple Production-Blocking Issues

---

## 🚨 EXECUTIVE SUMMARY

**User Complaint**: "Installer contact should be masked. Negotiation is not done. I have no idea about savings section. No grand total. Your enhancement is not good."

**Root Cause**: 
1. **NO MASKING LOGIC** - Installer contact details (email, phone, company) exposed to homeowner BEFORE lead purchase
2. **NEGOTIATION BROKEN** - Counter-offer UI appears but doesn't function properly
3. **MISSING GRAND TOTAL** - Line items table shows no sum total
4. **CONFUSING UX** - "Savings Projection Unavailable" message appears with no explanation of why
5. **DATA INCONSISTENCY** - `installerContact` JSON field vs `installer` relation confusion

**Impact**: 🔴 CRITICAL  
- **Security Violation**: Homeowner can contact installer directly, bypassing lead purchase (revenue loss)
- **Business Logic Broken**: Negotiation flow exists but doesn't work end-to-end
- **User Confusion**: UI shows features that don't work or aren't explained

**Priority**: P0 - Immediate fix required before any other work

---

## 📊 DETAILED GAP ANALYSIS

### GAP 1: 🔴 **NO MASKING FOR INSTALLER CONTACT** (CRITICAL - SECURITY)

**Current Behavior**:
```tsx
// src/components/written-quote/HomeownerWrittenQuoteReviewModal.tsx:228-264
{writtenQuote.installer && (
  <div className="bg-gradient-to-br from-primary/5...">
    <h3>Installer Information</h3>
    {/* ❌ EXPOSED - No masking check */}
    <p>{writtenQuote.installer.companyName || 'Not provided'}</p>
    <a href={`mailto:${writtenQuote.installer.email}`}>
      <Mail className="h-4 w-4" />
      {writtenQuote.installer.email}  {/* ❌ VISIBLE EMAIL */}
    </a>
    <a href={`tel:${writtenQuote.installer.phone}`}>
      <Phone className="h-4 w-4" />
      {writtenQuote.installer.phone}  {/* ❌ VISIBLE PHONE */}
    </a>
  </div>
)}
```

**Expected Behavior**:
```tsx
{writtenQuote.installer && (
  <div className="bg-gradient-to-br from-primary/5...">
    <h3>Installer Information</h3>
    {/* ✅ MASKED until lead is purchased */}
    {leadPurchased ? (
      <>
        <p>{writtenQuote.installer.companyName}</p>
        <a href={`mailto:${writtenQuote.installer.email}`}>
          {writtenQuote.installer.email}
        </a>
      </>
    ) : (
      <div className="blur-sm select-none pointer-events-none">
        <p>███████ Solar Co</p>
        <p>███████@███.com</p>
        <p>(███) ███-████</p>
      </div>
      <p className="text-label text-warning mt-2">
        Contact details will be revealed after quote is accepted and lead is purchased
      </p>
    )}
  </div>
)}
```

**Root Cause**:
- ❌ No `LeadPurchase` check in frontend logic
- ❌ No `leadPurchaseStatus` field passed to modal
- ❌ Backend `/api/written-quotes/get` doesn't include purchase status

**Files Affected**:
- `src/components/written-quote/HomeownerWrittenQuoteReviewModal.tsx` (lines 228-264)
- `src/app/api/written-quotes/get/route.ts` (missing LeadPurchase join)

**Data Model Gap**:
```prisma
// ❌ WrittenQuote has NO relation to LeadPurchase
model WrittenQuote {
  id          String @id
  leadId      String
  installerId String
  // NO FIELD: leadPurchased Boolean?
  // NO FIELD: purchasedAt DateTime?
}

// LeadPurchase is separate - need JOIN in query
model LeadPurchase {
  id          String @id
  leadId      String  // ✅ Can join on this
  installerId String
  purchasedAt DateTime
}
```

**Fix Required**:
1. Add `leadPurchased` derived field in API response (JOIN check)
2. Pass `leadPurchased` boolean to modal
3. Implement masking UI with blur + warning message
4. Add test: Verify contact is masked when NOT purchased
5. Add test: Verify contact is visible AFTER purchase

---

### GAP 2: 🔴 **NEGOTIATION PANEL DOESN'T WORK** (CRITICAL - FUNCTIONALITY)

**Current Behavior**:
User reports: "There is no option for homeowners to propose any price"

**Code Inspection**:
```tsx
// WrittenQuoteNegotiationPanel.tsx:243-280
{canNegotiate && (
  <Card className="neu-card p-4">
    <h4>Respond to Quote</h4>
    <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
    <Button onClick={handleAccept}>Accept Quote</Button>
    <Button onClick={handleSubmitOffer}>Counter-Offer</Button>  {/* ✅ BUTTON EXISTS */}
    <Button onClick={handleReject}>Reject</Button>
  </Card>
)}
```

**But**:
```tsx
// WrittenQuoteNegotiationPanel.tsx:118-148
const isMyTurn = 
  (role === 'installer' && status === 'installer_turn') ||
  (role === 'homeowner' && status === 'homeowner_turn');

const canNegotiate = isMyTurn && !disabled && !isFinalStatus;
```

**Problem**:
- ✅ UI exists (counter-offer input + button)
- ✅ API exists (`/api/written-quotes/[id]/counter`)
- ❌ But `canNegotiate` is **FALSE** because `status !== 'homeowner_turn'`

**Status Flow Broken**:
```typescript
// Expected flow:
1. Installer submits quote → status = 'HOMEOWNER_TURN' (homeowner can accept/counter/reject)
2. Homeowner counters → status = 'INSTALLER_TURN' (installer can accept/counter)
3. Installer accepts → status = 'ACCEPTED'

// Current database:
status = 'pending' // ❌ WRONG! Should be 'HOMEOWNER_TURN'
```

**Root Cause Investigation**:
```typescript
// src/app/api/written-quotes/[id]/counter/route.ts:88
if (quote.currentStatus !== 'HOMEOWNER_TURN') {
  return NextResponse.json(
    { error: `Cannot make counter-offer. Current status: ${quote.currentStatus}` },
    { status: 400 }
  );
}
```

**Status never gets set to 'HOMEOWNER_TURN'**:
- When installer submits quote from Quote Builder, status = 'DRAFT' or 'PENDING'
- Missing transition logic: `DRAFT → INSTALLER_OFFER → HOMEOWNER_TURN`

**Fix Required**:
1. ✅ Audit Quote Builder submission flow
2. ✅ Add status transition when installer submits: `status = 'HOMEOWNER_TURN'`
3. ✅ Verify status updates correctly after each action:
   - Installer submits → HOMEOWNER_TURN
   - Homeowner counters → INSTALLER_TURN
   - Installer counters → HOMEOWNER_TURN
   - Anyone accepts → ACCEPTED
   - Anyone rejects → REJECTED

**Files to Check**:
- `src/app/api/written-quotes/[id]/submit/route.ts` (or wherever Quote Builder submits)
- `src/app/api/written-quotes/[id]/counter/route.ts` (verify transitions)
- `src/app/api/written-quotes/[id]/offer/route.ts` (installer counter)
- `src/app/api/written-quotes/[id]/done/route.ts` (accept/reject)

---

### GAP 3: 🟡 **NO GRAND TOTAL IN LINE ITEMS** (HIGH - UX)

**Current Behavior**:
User reports: "There is no grand total in the description section"

**Code Inspection**:
```tsx
// HomeownerWrittenQuoteReviewModal.tsx:364-368
{writtenQuote.lineItems && writtenQuote.lineItems.length > 0 && (
  <QuoteLineItemsTable
    lineItems={writtenQuote.lineItems}  {/* ❌ No grand total prop */}
  />
)}
```

**QuoteLineItemsTable Component**:
```tsx
// src/components/quote-display/QuoteLineItemsTable.tsx (assumed)
export function QuoteLineItemsTable({ lineItems }: { lineItems: BidLineItem[] }) {
  return (
    <table>
      <tbody>
        {lineItems.map(item => (
          <tr key={item.id}>
            <td>{item.description}</td>
            <td>{item.quantity}</td>
            <td>${item.unitPrice}</td>
            <td>${item.total}</td>
          </tr>
        ))}
      </tbody>
      {/* ❌ NO FOOTER WITH GRAND TOTAL */}
    </table>
  );
}
```

**Expected Behavior**:
```tsx
<table>
  <tbody>...</tbody>
  <tfoot>
    <tr className="border-t-2 border-primary">
      <td colSpan="3" className="text-heading-4 text-right">Grand Total:</td>
      <td className="text-heading-2 text-primary">${grandTotal.toLocaleString()}</td>
    </tr>
  </tfoot>
</table>
```

**Fix Required**:
1. Calculate grand total from `lineItems`: `const total = lineItems.reduce((sum, item) => sum + item.total, 0)`
2. Add `<tfoot>` to `QuoteLineItemsTable` with grand total row
3. Style grand total row prominently (larger text, bold, primary color)
4. Alternative: Use `writtenQuote.currentPrice` as grand total (simpler)

---

### GAP 4: 🟡 **CONFUSING "SAVINGS PROJECTION UNAVAILABLE"** (MEDIUM - UX)

**Current Behavior**:
```tsx
// HomeownerWrittenQuoteReviewModal.tsx:340-352
{!writtenQuote.calculations?.estimatedAnnualSavings ? (
  <div className="bg-warning/10...">
    <AlertCircle className="h-5 w-5 text-warning" />
    <p>Savings Projection Unavailable</p>
    <p>The installer has not provided savings estimates yet. Contact them for details.</p>
  </div>
) : (
  <SavingsChart annualSavings={writtenQuote.calculations.estimatedAnnualSavings} />
)}
```

**User Confusion**:
- ❓ "I have no idea for this section" - User doesn't understand WHY savings is missing
- ❓ Is this an error? Is data broken? Should installer have provided this?

**Root Cause**:
- Savings graph depends on `calculations.estimatedAnnualSavings`
- Quote Builder may not require this field (optional)
- But UX doesn't explain WHY it's optional or what homeowner should do

**Improved UX**:
```tsx
{!writtenQuote.calculations?.estimatedAnnualSavings ? (
  <div className="bg-info/10 border border-info/20...">  {/* Changed from warning to info */}
    <Info className="h-5 w-5 text-info" />
    <div>
      <p className="text-body text-info font-medium">Savings Estimate Not Included</p>
      <p className="text-body-small text-info/80 mt-1">
        This installer chose not to provide annual savings projections with this quote.
        You can request a detailed savings breakdown when you contact them.
      </p>
      <p className="text-body-small text-info/80 mt-2">
        💡 Tip: Most installers can provide savings estimates based on your energy usage and system size.
      </p>
    </div>
  </div>
) : (
  <SavingsChart ... />
)}
```

**Fix Required**:
1. Change warning badge to info badge (less alarming)
2. Add explanation of WHY it's optional
3. Add actionable tip for homeowner
4. Consider: Prompt homeowner to ask installer for savings in counter-offer notes

---

### GAP 5: 🟡 **DATA INCONSISTENCY: `installerContact` vs `installer`** (MEDIUM - TECHNICAL DEBT)

**Current Behavior**:
```tsx
// HomeownerWrittenQuoteReviewModal.tsx uses installer relation (✅ correct)
{writtenQuote.installer && (
  <p>{writtenQuote.installer.email}</p>
)}

// But WrittenQuote model has BOTH fields:
installerContact?: {  // ❌ JSON field from Quote Builder (demo data)
  email?: string;
  phone?: string;
};
installer?: {  // ✅ User relation (live data)
  email: string;
  phone?: string;
};
```

**Problem**:
- `installerContact` JSON field contains demo data from Quote Builder prefill
- `installer` relation contains LIVE user data from User table
- Code currently uses `installer` relation (correct) but schema allows both (confusing)

**Risk**:
- Future developer might accidentally use `installerContact` instead of `installer`
- Inconsistent data source across components

**Fix Required**:
1. ✅ Keep using `installer` relation (live data)
2. ⚠️ Consider deprecating `installerContact` JSON field in schema
3. ✅ Add comment in schema: `installerContact: Json? // DEPRECATED: Use installer relation instead`
4. ✅ Add validation: If `installerContact` exists, log warning to migrate to `installer` relation

---

## 🎯 IMPLEMENTATION PRIORITY

### P0 - MUST FIX (Security + Critical UX)
1. **GAP 1**: Mask installer contact (security violation)
2. **GAP 2**: Fix negotiation status flow (broken functionality)

### P1 - SHOULD FIX (UX Polish)
3. **GAP 3**: Add grand total to line items
4. **GAP 4**: Improve savings unavailable messaging

### P2 - TECHNICAL DEBT (Future Cleanup)
5. **GAP 5**: Deprecate `installerContact` JSON field

---

## 🔧 PROPOSED SOLUTION ARCHITECTURE

### Solution 1: Masking Logic (GAP 1)

**Backend Change** (`src/app/api/written-quotes/get/route.ts`):
```typescript
// Add JOIN to check if lead is purchased
const quote = await prisma.writtenQuote.findUnique({
  where: { id: quoteId },
  include: {
    installer: true,
    lead: {
      include: {
        purchases: {  // ✅ NEW: Check if installer purchased this lead
          where: {
            installerId: quote.installerId,
            refundedAt: null  // Not refunded
          }
        }
      }
    }
  }
});

// Derive leadPurchased boolean
const leadPurchased = quote.lead.purchases.length > 0;

return NextResponse.json({
  quote: {
    ...quote,
    leadPurchased  // ✅ NEW: Frontend uses this to mask/unmask
  }
});
```

**Frontend Change** (`HomeownerWrittenQuoteReviewModal.tsx`):
```tsx
interface WrittenQuoteData {
  // ... existing fields
  leadPurchased?: boolean;  // ✅ NEW
}

// In render:
{writtenQuote.installer && (
  <div className="bg-gradient-to-br from-primary/5...">
    <h3>Installer Information</h3>
    
    {!writtenQuote.leadPurchased ? (
      {/* ❌ NOT PURCHASED - MASK CONTACT */}
      <div className="space-y-3">
        <div className="relative">
          <div className="blur-md select-none pointer-events-none">
            <p>Company: Green Energy Solutions</p>
            <p>Email: contact@greenenergy.com</p>
            <p>Phone: (555) 123-4567</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-body-small text-warning flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Contact details will be revealed after you accept this quote and the installer purchases the lead
          </p>
        </div>
      </div>
    ) : (
      {/* ✅ PURCHASED - SHOW REAL CONTACT */}
      <div className="space-y-3">
        <p className="text-body">{writtenQuote.installer.companyName}</p>
        <a href={`mailto:${writtenQuote.installer.email}`} className="text-primary">
          <Mail /> {writtenQuote.installer.email}
        </a>
        <a href={`tel:${writtenQuote.installer.phone}`} className="text-primary">
          <Phone /> {writtenQuote.installer.phone}
        </a>
      </div>
    )}
  </div>
)}
```

---

### Solution 2: Fix Negotiation Status Flow (GAP 2)

**Identify Where Installer Submits Quote**:
Need to find the API endpoint where Quote Builder submits the written quote.

**Assumption** (needs verification):
- Endpoint: `/api/written-quotes/create` or `/api/written-quotes/submit`
- Current logic: Creates WrittenQuote with `currentStatus = 'DRAFT'` or `'PENDING'`

**Required Fix**:
```typescript
// In Quote Builder submission endpoint:
const newQuote = await prisma.writtenQuote.create({
  data: {
    leadId,
    installerId: session.user.id,
    homeownerId: lead.homeownerId,
    currentPrice: calculations.grandTotal,
    currentStatus: 'HOMEOWNER_TURN',  // ✅ CHANGED from 'DRAFT' to 'HOMEOWNER_TURN'
    systemData,
    productsData,
    lineItems,
    calculations,
    // ... other fields
  }
});

// Also create initial event
await prisma.writtenQuoteEvent.create({
  data: {
    writtenQuoteId: newQuote.id,
    actorId: session.user.id,
    actorRole: 'installer',
    action: 'offer',  // ✅ Initial submission is an 'offer'
    priceOffered: calculations.grandTotal,
    notes: 'Initial written quote submission',
  }
});
```

**Status Transition Matrix**:
| Current Status | Actor | Action | New Status |
|---|---|---|---|
| DRAFT | Installer | Submit | HOMEOWNER_TURN |
| HOMEOWNER_TURN | Homeowner | Accept | ACCEPTED |
| HOMEOWNER_TURN | Homeowner | Reject | REJECTED |
| HOMEOWNER_TURN | Homeowner | Counter | INSTALLER_TURN |
| INSTALLER_TURN | Installer | Accept | ACCEPTED |
| INSTALLER_TURN | Installer | Reject | REJECTED |
| INSTALLER_TURN | Installer | Counter | HOMEOWNER_TURN |

**Verify in Counter API** (`/api/written-quotes/[id]/counter/route.ts`):
```typescript
// Line 100-115: Update quote with new status
const updatedQuote = await prisma.writtenQuote.update({
  where: { id: quoteId },
  data: {
    currentPrice: body.price,
    currentStatus: 'INSTALLER_TURN',  // ✅ Flip turn to installer
    lastActionBy: 'homeowner',
    lastActionAt: new Date()
  }
});

// Create event record
await prisma.writtenQuoteEvent.create({
  data: {
    writtenQuoteId: quoteId,
    actorId: auth.userId,
    actorRole: 'homeowner',
    action: 'counter',
    priceOffered: body.price,
    notes: body.notes
  }
});
```

---

### Solution 3: Add Grand Total to Line Items (GAP 3)

**Option A**: Calculate in component
```tsx
// QuoteLineItemsTable.tsx
export function QuoteLineItemsTable({ lineItems }: { lineItems: BidLineItem[] }) {
  const grandTotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="bg-surface rounded-xl p-6 border border-border">
      <h3 className="text-heading-4 mb-4 flex items-center gap-2">
        <List className="h-5 w-5 text-primary" />
        Description
      </h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-label text-muted-foreground p-2">Description</th>
            <th className="text-right text-label text-muted-foreground p-2">Qty</th>
            <th className="text-right text-label text-muted-foreground p-2">Unit Price</th>
            <th className="text-right text-label text-muted-foreground p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, idx) => (
            <tr key={idx} className="border-b border-border/50">
              <td className="text-body p-2">{item.description}</td>
              <td className="text-body text-right p-2">{item.quantity}</td>
              <td className="text-body text-right p-2">${item.unitPrice.toLocaleString()}</td>
              <td className="text-body text-right p-2">${item.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-primary">
            <td colSpan={3} className="text-heading-4 text-right p-3">Grand Total:</td>
            <td className="text-heading-2 text-primary text-right p-3">
              ${grandTotal.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
```

**Option B**: Use `currentPrice` (simpler)
```tsx
// HomeownerWrittenQuoteReviewModal.tsx
{writtenQuote.lineItems && writtenQuote.lineItems.length > 0 && (
  <QuoteLineItemsTable
    lineItems={writtenQuote.lineItems}
    grandTotal={writtenQuote.currentPrice}  // ✅ Pass from quote
  />
)}
```

**Recommendation**: Option A (calculate from line items) is more accurate if line items are itemized breakdown. Option B (use currentPrice) is simpler if currentPrice = sum of line items.

---

### Solution 4: Improve Savings Message (GAP 4)

**Before**:
```tsx
<div className="bg-warning/10...">
  <AlertCircle className="text-warning" />
  <p>Savings Projection Unavailable</p>
  <p>The installer has not provided savings estimates yet.</p>
</div>
```

**After**:
```tsx
<div className="bg-info/5 border border-info/20 rounded-xl p-6">
  <div className="flex items-start gap-3">
    <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="text-heading-xs text-info mb-2">Savings Estimate Not Included</h4>
      <p className="text-body-small text-foreground-secondary mb-3">
        This quote doesn't include annual savings projections. This is optional and some installers provide it separately.
      </p>
      <div className="bg-surface rounded-lg p-3 border-l-4 border-info">
        <p className="text-label text-foreground-secondary">💡 What you can do:</p>
        <ul className="text-body-small text-muted-foreground mt-2 space-y-1 list-disc list-inside">
          <li>Request a savings breakdown when you contact the installer</li>
          <li>Ask for estimated monthly bill reduction based on your usage</li>
          <li>Compare payback period with other quotes you receive</li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

---

## 📋 TESTING CHECKLIST

### Test Case 1: Masking Logic
- [ ] **GIVEN** homeowner views written quote AND installer has NOT purchased lead  
  **THEN** installer contact (name, email, phone) is blurred/masked
- [ ] **GIVEN** homeowner views written quote AND installer HAS purchased lead  
  **THEN** installer contact (name, email, phone) is visible and clickable
- [ ] **GIVEN** masked contact is displayed  
  **THEN** warning message explains contact will be revealed after acceptance + purchase

### Test Case 2: Negotiation Flow
- [ ] **GIVEN** installer submits written quote from Quote Builder  
  **THEN** quote status = 'HOMEOWNER_TURN' AND homeowner sees counter-offer UI
- [ ] **GIVEN** homeowner submits counter-offer  
  **THEN** quote status = 'INSTALLER_TURN' AND installer sees counter-offer UI
- [ ] **GIVEN** installer accepts homeowner's counter  
  **THEN** quote status = 'ACCEPTED' AND negotiation panel shows "Quote Accepted"
- [ ] **GIVEN** homeowner rejects quote  
  **THEN** quote status = 'REJECTED' AND negotiation panel shows "Quote Rejected"

### Test Case 3: Grand Total
- [ ] **GIVEN** line items table is displayed  
  **THEN** table footer shows grand total with bold/large text
- [ ] **GIVEN** grand total is calculated from line items  
  **THEN** grand total = sum of all line item totals
- [ ] **GIVEN** currentPrice !== sum of line items  
  **THEN** display warning or use currentPrice as authoritative

### Test Case 4: Savings Message
- [ ] **GIVEN** `calculations.estimatedAnnualSavings` is missing  
  **THEN** info badge (not warning) is displayed with helpful explanation
- [ ] **GIVEN** `calculations.estimatedAnnualSavings` exists  
  **THEN** SavingsChart is displayed with graph

---

## 🚀 IMPLEMENTATION PHASES

### Phase 4.16.17 - Critical Bug Fixes (155 minutes)

**Sprint 4.16.17.0**: Add Masking Logic (45 min)
- Backend: Join LeadPurchase in `/api/written-quotes/get`
- Backend: Add `leadPurchased` boolean to response
- Frontend: Add masking UI with blur + lock icon + warning
- Test: Verify masked when not purchased, visible when purchased

**Sprint 4.16.17.1**: Fix Negotiation Status Flow (50 min)
- Audit: Find Quote Builder submission endpoint
- Fix: Set `currentStatus = 'HOMEOWNER_TURN'` on submission
- Fix: Verify status transitions in counter/offer/done APIs
- Test: End-to-end negotiation flow (offer → counter → accept)

**Sprint 4.16.17.2**: Add Grand Total (20 min)
- Fix: Calculate grand total in `QuoteLineItemsTable`
- Fix: Add `<tfoot>` with grand total row
- Style: Make total prominent (text-heading-2, text-primary)
- Test: Verify total matches sum of line items

**Sprint 4.16.17.3**: Improve Savings Message (15 min)
- Fix: Change warning badge to info badge
- Fix: Add actionable tips for homeowner
- Style: Add helpful context (why optional, what to do)
- Test: Verify message is clear and non-alarming

**Sprint 4.16.17.4**: Build Verification (15 min)
- Run: `npx tsc --noEmit` (0 errors)
- Run: `npm run build` (success)
- Run: 6-command verification (0 violations)
- Commit: Phase 4.16.17 with descriptive message

**Sprint 4.16.17.5**: Git Commit & Push (10 min)
- Commit message with PROBLEM/SOLUTION/IMPACT format
- Push to `WrittenQuote_SeparateFlow` branch
- Update tasks.md with completion status

**Total Estimate**: 155 minutes (~2.5 hours)

---

## 📁 FILES TO MODIFY

### Backend (3 files)
1. `src/app/api/written-quotes/get/route.ts` - Add LeadPurchase JOIN + `leadPurchased` field
2. `src/app/api/written-quotes/create/route.ts` - Set `currentStatus = 'HOMEOWNER_TURN'` on submit (if exists)
3. `src/app/api/quote-builder/submit/route.ts` - (Alternative location for submit logic)

### Frontend (3 files)
1. `src/components/written-quote/HomeownerWrittenQuoteReviewModal.tsx` - Masking logic, improved messages
2. `src/components/quote-display/QuoteLineItemsTable.tsx` - Add grand total footer
3. `src/components/written-quote/WrittenQuoteNegotiationPanel.tsx` - (May need status badge updates)

### Schema (1 file)
1. `prisma/schema.prisma` - Add comment deprecating `installerContact` JSON field (optional)

---

## 🔗 RELATED DOCUMENTS

**Authority**:
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md` - 6-step workflow, GATE 0 checks
- `DOC/GUIDELINES & SOT/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md` - Zero-trust authorization (Article VI)

**Previous Audits**:
- `DOC/AUDIT-REPORTS/System/HOMEOWNER-WRITTEN-QUOTE-MODAL-CRITICAL-AUDIT-2025-12-21.md` - Previous Phase 4.16.15 issues
- `DOC/Features/Written Quote/HOMEOWNER-MODAL-ENHANCEMENT-PLAN-2025-12-21.md` - Enhancement plan (partially implemented)

**Implementation**:
- `specs/008-description-enhance-existing/tasks.md` - Phase tracking file

---

## ✅ ACCEPTANCE CRITERIA

**Phase 4.16.17 is complete when**:
1. ✅ Installer contact (email, phone, company) is **MASKED** when lead not purchased
2. ✅ Installer contact is **VISIBLE** when lead is purchased
3. ✅ Homeowner can submit counter-offer when `status = 'HOMEOWNER_TURN'`
4. ✅ Status transitions correctly: HOMEOWNER_TURN ↔ INSTALLER_TURN ↔ ACCEPTED/REJECTED
5. ✅ Grand total row appears at bottom of line items table
6. ✅ Grand total = sum of all line item totals (or `currentPrice`)
7. ✅ Savings unavailable message is info (not warning) with helpful tips
8. ✅ TypeScript: 0 errors
9. ✅ Build: SUCCESS
10. ✅ 6-command verification: 0 violations
11. ✅ Manual test: User confirms "now it works as expected"

---

**Next Steps**: Create Phase 4.16.17 in `tasks.md` and begin implementation.
