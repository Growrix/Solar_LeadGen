# Homeowner Written Quote Review Modal - Enhancement Plan
**Date**: December 21, 2025  
**Version**: 1.0  
**Target Phase**: 4.16.16  
**Estimated Effort**: 6-8 hours (3 sprints)

---

## Executive Summary

This plan addresses critical usability and data integrity issues in the homeowner written quote review modal identified in [HOMEOWNER-WRITTEN-QUOTE-MODAL-CRITICAL-AUDIT-2025-12-21.md](../../AUDIT-REPORTS/System/HOMEOWNER-WRITTEN-QUOTE-MODAL-CRITICAL-AUDIT-2025-12-21.md).

**Primary Goals**:
1. Replace demo installer contact data with live User table data
2. Fix missing calculation fields (estimatedAnnualSavings, paybackYears)
3. Improve visual hierarchy and professional appearance
4. Ensure negotiation flow works end-to-end
5. Add comprehensive data validation and empty states

---

## Problem Statement

**User Feedback** (December 21, 2025):
> "The description part is still unfinished. And the negotiation part is still same as before. The contact area is still showing mock data. I have no idea what have you implemented. You should audit back and identify the reason and also come up with the overall enhancement idea that will make this review modal more professional and logical, now it does not look so well organized."

**Root Causes**:
1. ❌ Installer contact shows hardcoded demo data from Quote Builder JSON field
2. ❌ Savings calculation incomplete (estimatedAnnualSavings = 0)
3. ❌ Layout lacks visual hierarchy and professional polish
4. ❌ Negotiation panel works but user expectations unclear

---

## Enhancement Scope

### Sprint 1: Data Integrity & Live Contact (2.5 hours)

**Objective**: Replace all demo/mock data with live database relationships

#### 1.1 Replace Installer Contact Source (1 hour)

**Current**:
```typescript
// Uses installerContact JSON field (demo data from Quote Builder)
{writtenQuote.installerContact && (
  <div>
    <p>Email: {writtenQuote.installerContact.email}</p> {/* installer@example.com */}
    <p>Phone: {writtenQuote.installerContact.phone}</p> {/* (555) 123-4567 */}
  </div>
)}
```

**Enhanced**:
```typescript
// Use installer relation (live User table data)
{writtenQuote.installer && (
  <InstallerInfoCard
    companyName={writtenQuote.installer.companyName}
    email={writtenQuote.installer.email}
    phone={writtenQuote.installer.phone}
    cec={writtenQuote.installer.cec}
    accreditation={writtenQuote.installer.accreditation}
  />
)}
```

**Files to Modify**:
- `src/components/written-quote/HomeownerWrittenQuoteReviewModal.tsx`
  - Lines 309-337: Replace `installerContact` with `installer` relation
  - Add proper formatting, icons (Building, Mail, Phone)
  - Add CEC/accreditation badges if available

**API Changes** (if needed):
- Verify `src/app/api/written-quotes/get/route.ts` includes:
  ```typescript
  installer: {
    select: {
      companyName: true,
      email: true,
      phone: true,
      cec: true,  // Add if missing
      accreditation: true  // Add if missing
    }
  }
  ```

#### 1.2 Fix Missing Calculation Fields (1 hour)

**Problem**: Quote Builder doesn't save `estimatedAnnualSavings` or `paybackYears`

**Investigation Required**:
1. Check Quote Builder save handler: Where calculations are created
2. Verify calculation logic includes annual savings formula
3. Ensure `assumptions` object has required fields (feedInTariff, dailyUsage, etc.)

**Likely File to Fix**:
- `src/components/quote-builder/PricingEngine.tsx` (or similar)
- Find where `calculations` JSON is built
- Add missing fields:
  ```typescript
  const calculations: BidCalculations = {
    subtotal,
    gstPercent,
    gstAmount,
    includeIncentive,
    incentiveAmount,
    finalTotal,
    pricePerWatt,
    // ADD THESE:
    estimatedAnnualSavings: calculateAnnualSavings(systemSize, assumptions),
    paybackYears: calculatePayback(finalTotal, annualSavings)
  };
  ```

**Fallback UI**:
- If `estimatedAnnualSavings` is 0 or missing, show message:
  ```tsx
  {!writtenQuote.calculations?.estimatedAnnualSavings ? (
    <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
      <p className="text-body text-warning">
        Savings projection unavailable. Contact installer for details.
      </p>
    </div>
  ) : (
    <SavingsChart {...} />
  )}
  ```

#### 1.3 Add Data Validation (30 min)

**Objective**: Gracefully handle missing/incomplete data

**Empty State Components**:
```tsx
// If no system data
{!writtenQuote.systemData && (
  <EmptyStateCard 
    title="System Details Unavailable"
    message="The installer has not provided system specifications yet."
  />
)}

// If no calculations
{!writtenQuote.calculations?.finalTotal && (
  <EmptyStateCard
    title="Pricing Information Pending"
    message="Quote pricing is being finalized by the installer."
  />
)}
```

**Files to Create**:
- `src/components/written-quote/EmptyStateCard.tsx` (simple reusable component)

---

### Sprint 2: Visual Hierarchy & Professional Layout (2.5 hours)

**Objective**: Reorganize modal for better user experience and professional appearance

#### 2.1 Redesign Information Architecture (1.5 hours)

**Current Order** (disorganized):
1. Quote Metadata
2. System Specs
3. Equipment
4. Price Breakdown
5. Financial Card
6. Savings Graph
7. Line Items
8. Installer Contact ← BURIED AT BOTTOM

**Proposed Order** (user-centric):
1. **Installer Info** ← PROMOTED TO TOP
2. **Quote Summary** (System size, payback, savings at a glance)
3. **Financial Breakdown** (Price + Graph together)
4. **System Details** (Equipment, Specs) - Collapsible
5. **Line Items** - Collapsible

**New Component Structure**:
```tsx
<div className="grid grid-cols-3 gap-6">
  {/* LEFT 60% */}
  <div className="col-span-2 space-y-6">
    {/* SECTION 1: WHO - Installer Info (Most Important) */}
    <InstallerInfoCard 
      installer={writtenQuote.installer}
      isPrimary={true}
    />

    {/* SECTION 2: WHAT - Quick Summary */}
    <QuoteOverviewCard
      systemSize={systemData?.capacityKw}
      payback={calculations?.paybackYears}
      savings={calculations?.estimatedAnnualSavings}
      finalPrice={currentPrice}
    />

    {/* SECTION 3: HOW MUCH - Financial Deep Dive */}
    <div className="space-y-4">
      <QuoteCalculationsSummary calculations={calculations} />
      {calculations?.estimatedAnnualSavings && (
        <SavingsChart {...} />
      )}
    </div>

    {/* SECTION 4: DETAILS - Collapsible */}
    <Accordion type="multiple" defaultValue={["equipment"]}>
      <AccordionItem value="equipment">
        <AccordionTrigger>Equipment & Specifications</AccordionTrigger>
        <AccordionContent>
          <QuoteSystemSpecsCard {...} />
          <QuoteEquipmentCard {...} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="lineitems">
        <AccordionTrigger>Detailed Line Items</AccordionTrigger>
        <AccordionContent>
          <QuoteLineItemsTable {...} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>

  {/* RIGHT 40% - Negotiation (Sticky) */}
  <div className="col-span-1">
    <div className="sticky top-4">
      <WrittenQuoteNegotiationPanel {...} />
    </div>
  </div>
</div>
```

**New Components to Create**:
1. `InstallerInfoCard.tsx` - Professional installer profile card with icons
2. `QuoteOverviewCard.tsx` - At-a-glance summary (4 key metrics)
3. Use shadcn Accordion for collapsible sections

#### 2.2 Visual Design Enhancements (1 hour)

**Add Icons Throughout**:
```tsx
import { Building, Mail, Phone, Award, Zap, DollarSign, TrendingUp, Calendar } from 'lucide-react';
```

**Installer Info Card Design**:
```tsx
<div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
        <Building className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="text-heading-3 text-foreground">{companyName}</h3>
        <div className="flex gap-2 mt-1">
          <Badge variant="success" className="text-body-small">
            <Award className="h-3 w-3 mr-1" />
            CEC Approved
          </Badge>
          <Badge variant="outline" className="text-body-small">
            {accreditation}
          </Badge>
        </div>
      </div>
    </div>
  </div>
  
  <div className="space-y-3">
    <div className="flex items-center gap-3 text-body">
      <Mail className="h-4 w-4 text-muted-foreground" />
      <a href={`mailto:${email}`} className="text-primary hover:underline">
        {email}
      </a>
    </div>
    <div className="flex items-center gap-3 text-body">
      <Phone className="h-4 w-4 text-muted-foreground" />
      <a href={`tel:${phone}`} className="text-primary hover:underline">
        {phone}
      </a>
    </div>
  </div>
</div>
```

**Overview Card Design**:
```tsx
<div className="grid grid-cols-4 gap-4 p-4 bg-surface rounded-xl border border-border">
  <MetricCard
    icon={<Zap />}
    label="System Size"
    value={`${capacityKw} kW`}
  />
  <MetricCard
    icon={<DollarSign />}
    label="Total Price"
    value={formatCurrency(finalPrice)}
  />
  <MetricCard
    icon={<TrendingUp />}
    label="Annual Savings"
    value={formatCurrency(savings)}
  />
  <MetricCard
    icon={<Calendar />}
    label="Payback"
    value={`${payback} years`}
  />
</div>
```

---

### Sprint 3: Negotiation Flow & Real-Time Updates (1.5 hours)

**Objective**: Ensure negotiation actions work correctly and provide clear feedback

#### 3.1 Verify Negotiation API Flow (45 min)

**Test Scenario**:
1. Homeowner counter-offers $10,000
2. Verify `WrittenQuoteEvent` created with action='counter'
3. Verify `WrittenQuote.currentPrice` updated to $10,000
4. Verify `WrittenQuote.currentStatus` changed to `installer_turn`
5. Verify `WrittenQuote.lastActionBy` set to homeowner userId

**API Endpoints to Test**:
- POST `/api/written-quotes/[id]/counter` - Homeowner counter-offer
- POST `/api/written-quotes/[id]/accept` - Installer accepts
- POST `/api/written-quotes/[id]/reject` - Installer rejects

**Manual Testing Steps**:
```bash
# 1. Homeowner counter-offers
curl -X POST http://localhost:3000/api/written-quotes/cmjb7g32g0001i15w24f3h2ia/counter \
  -H "Content-Type: application/json" \
  -d '{"counterPrice": 9500, "notes": "Can you do $9,500?"}'

# 2. Check database
psql -d solarmatch -c "SELECT id, currentPrice, currentStatus FROM \"WrittenQuote\" WHERE id='cmjb7g32g0001i15w24f3h2ia';"

# 3. Check events
psql -d solarmatch -c "SELECT action, priceOffered, actorRole FROM \"WrittenQuoteEvent\" WHERE writtenQuoteId='cmjb7g32g0001i15w24f3h2ia' ORDER BY timestamp DESC;"
```

#### 3.2 Improve Negotiation Panel UI (45 min)

**Current Issue**: "Waiting for the other party to respond..." - vague

**Enhanced Messages**:
```tsx
const getStatusMessage = (status: string, role: string) => {
  if (status === 'installer_turn') {
    return role === 'homeowner' 
      ? "✅ Your counter-offer has been sent! The installer will respond soon."
      : "⏰ Homeowner is waiting for your response to their counter-offer.";
  }
  if (status === 'homeowner_turn') {
    return role === 'homeowner'
      ? "⏰ Installer has responded. Review their offer above."
      : "✅ Your response has been sent! Waiting for homeowner's decision.";
  }
  // ... more states
};
```

**Action Button States**:
```tsx
// Disable buttons when it's not user's turn
<Button
  disabled={status === 'installer_turn'}  // Homeowner can't act during installer's turn
  variant="primary"
>
  {status === 'installer_turn' ? 'Waiting for Installer...' : 'Submit Counter-Offer'}
</Button>
```

**Add Loading States**:
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleCounter = async () => {
  setIsSubmitting(true);
  try {
    await onAction({ action: 'counter', price: counterPrice });
    toast.success('Counter-offer submitted successfully!');
  } catch (error) {
    toast.error('Failed to submit counter-offer. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Technical Implementation Details

### Files to Create

1. **`src/components/written-quote/InstallerInfoCard.tsx`** (~80 lines)
   - Props: `{ installer: { companyName, email, phone, cec, accreditation } }`
   - Design: Gradient background, large company name, badges, contact icons
   - Accessibility: ARIA labels, keyboard navigation

2. **`src/components/written-quote/QuoteOverviewCard.tsx`** (~60 lines)
   - Props: `{ systemSize, payback, savings, finalPrice }`
   - Design: 4-column grid, icon + label + value for each metric
   - Responsive: 2 columns on mobile, 4 on desktop

3. **`src/components/written-quote/EmptyStateCard.tsx`** (~30 lines)
   - Props: `{ title, message, icon? }`
   - Design: Warning background, centered text, optional icon
   - Reusable for all empty states

4. **`src/components/written-quote/MetricCard.tsx`** (~40 lines)
   - Props: `{ icon, label, value, trend? }`
   - Design: Icon + label + large value, optional trend indicator
   - Used in QuoteOverviewCard

### Files to Modify

1. **`src/components/written-quote/HomeownerWrittenQuoteReviewModal.tsx`**
   - Lines 1-10: Add new imports (Accordion, new components, icons)
   - Lines 280-340: Complete restructure per Sprint 2.1 layout
   - Lines 309-337: Replace installerContact with InstallerInfoCard
   - Lines 345-351: Enhance WrittenQuoteNegotiationPanel integration

2. **`src/components/quote-builder/PricingEngine.tsx`** (or similar)
   - Add `estimatedAnnualSavings` calculation logic
   - Add `paybackYears` calculation logic
   - Ensure calculations object includes all BidCalculations fields

3. **`src/app/api/written-quotes/get/route.ts`** (if needed)
   - Add `cec` and `accreditation` to installer select fields
   - Verify all required relations included

4. **`src/components/written-quote/WrittenQuoteNegotiationPanel.tsx`**
   - Improve status messages (Sprint 3.2)
   - Add loading states for actions
   - Add disabled states based on turn

### Database Migrations (if needed)

**If CEC/Accreditation missing from User table**:
```sql
-- Check current schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name IN ('cec', 'accreditation');

-- Add if missing
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cec" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accreditation" TEXT;
```

---

## Success Criteria

### Functional Requirements

✅ **FR1**: Installer contact displays live User table data (companyName, email, phone)  
✅ **FR2**: Installer contact shows CEC and accreditation badges (if available)  
✅ **FR3**: Savings graph renders with actual annual savings (not $0)  
✅ **FR4**: Payback period displays calculated years (not 0)  
✅ **FR5**: Missing data shows clear "Unavailable" messages (not blank cards)  
✅ **FR6**: Negotiation actions update database correctly (WrittenQuote + WrittenQuoteEvent)  
✅ **FR7**: Status messages are clear and action-oriented (not vague "Waiting...")  
✅ **FR8**: Action buttons disabled appropriately (can't act when not your turn)  

### Visual Requirements

✅ **VR1**: Installer info promoted to top of left column  
✅ **VR2**: Overview card shows 4 key metrics at a glance  
✅ **VR3**: All cards have consistent spacing, shadows, borders  
✅ **VR4**: Icons used throughout for visual clarity  
✅ **VR5**: Equipment/Line Items sections collapsible (less clutter)  
✅ **VR6**: Negotiation panel sticky on scroll (always visible)  
✅ **VR7**: Loading states show during API calls (no sudden changes)  
✅ **VR8**: Empty states use warning colors and helpful messages  

### Performance Requirements

✅ **PR1**: Modal loads in <2 seconds  
✅ **PR2**: Actions submit in <1 second  
✅ **PR3**: No TypeScript errors  
✅ **PR4**: No console warnings  
✅ **PR5**: Build completes successfully  

---

## Testing Plan

### Unit Tests

**Quote Builder Calculations**:
```typescript
describe('BidCalculations', () => {
  it('calculates estimated annual savings correctly', () => {
    const result = calculateAnnualSavings(6.6, {
      feedInTariffCentsKwh: 8,
      dailyUsageKwh: 20,
      solarOffsetPercent: 70
    });
    expect(result).toBeGreaterThan(0);
  });

  it('calculates payback years correctly', () => {
    const result = calculatePayback(10000, 1500);
    expect(result).toBe(6.67);
  });
});
```

### Integration Tests

**API Flow Test**:
```typescript
describe('Written Quote Negotiation Flow', () => {
  it('allows homeowner to counter-offer', async () => {
    // 1. Homeowner submits counter
    const response = await fetch('/api/written-quotes/xxx/counter', {
      method: 'POST',
      body: JSON.stringify({ counterPrice: 9500 })
    });
    expect(response.status).toBe(200);

    // 2. Verify database updated
    const quote = await prisma.writtenQuote.findUnique({ where: { id: 'xxx' } });
    expect(quote.currentPrice).toBe(9500);
    expect(quote.currentStatus).toBe('installer_turn');
  });
});
```

### Manual Testing Checklist

- [ ] Open homeowner dashboard
- [ ] Click "Review written quote" on WRITTEN_QUOTE lead
- [ ] Verify installer info shows LIVE company name/email/phone (not demo data)
- [ ] Verify overview card shows 4 metrics (system size, price, savings, payback)
- [ ] Verify savings graph renders (not hidden due to $0)
- [ ] Verify calculations breakdown shows all fields
- [ ] Expand/collapse Equipment section (Accordion works)
- [ ] Expand/collapse Line Items section
- [ ] Submit counter-offer as homeowner
- [ ] Verify status changes to "Installer will respond soon"
- [ ] Switch to installer account
- [ ] Open same quote as installer
- [ ] Verify homeowner's counter-offer shows
- [ ] Accept counter-offer
- [ ] Switch back to homeowner account
- [ ] Verify acceptance notification shows

---

## Risk Assessment

### High Risk

**Risk 1**: Quote Builder doesn't have annual savings logic  
**Mitigation**: Add calculation function to PricingEngine, use industry-standard formula  
**Fallback**: Show "Contact installer for savings estimate" message  

**Risk 2**: Database schema missing CEC/accreditation fields  
**Mitigation**: Add migration, update seed data  
**Fallback**: Don't show badges if fields null  

### Medium Risk

**Risk 3**: Accordion component not available in current UI library  
**Mitigation**: Use shadcn/ui Accordion (already installed)  
**Fallback**: Use simple show/hide with state  

**Risk 4**: Performance impact of sticky negotiation panel  
**Mitigation**: Use CSS `position: sticky` (native browser optimization)  
**Fallback**: Non-sticky panel if issues arise  

### Low Risk

**Risk 5**: Icon library missing needed icons  
**Mitigation**: Use lucide-react (comprehensive icon set)  
**Fallback**: Use Unicode symbols (⚡ 💰 📈 📅)  

---

## Rollout Plan

### Phase 1: Sprint 1 (Data Integrity)
**Deploy**: As soon as Sprint 1 complete  
**Revert Plan**: Git revert if installer contact doesn't show  
**Monitoring**: Check logs for API errors, verify data in production DB  

### Phase 2: Sprint 2 (Visual Enhancements)
**Deploy**: After Sprint 1 verified working  
**Revert Plan**: CSS changes only, easily reversible  
**Monitoring**: User feedback on appearance, check Sentry for UI errors  

### Phase 3: Sprint 3 (Negotiation Polish)
**Deploy**: After Sprint 2 verified  
**Revert Plan**: Full rollback if negotiation flow breaks  
**Monitoring**: Track negotiation success rate, check for stuck statuses  

---

## Appendix

### A. BidCalculations Complete Interface

```typescript
export interface BidCalculations {
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  includeIncentive: boolean;
  incentiveAmount: number;
  finalTotal: number;
  pricePerWatt: number;
  estimatedAnnualSavings?: number;  // NEW: Must calculate
  paybackYears?: number;            // NEW: Must calculate
}
```

### B. Calculation Formulas

**Annual Savings**:
```typescript
function calculateAnnualSavings(
  systemSizeKw: number,
  assumptions: BidAssumptions
): number {
  const annualGeneration = systemSizeKw * 365 * 4.5; // kWh/year (4.5 hours avg sun)
  const selfConsumption = annualGeneration * (assumptions.solarOffsetPercent / 100);
  const exportAmount = annualGeneration - selfConsumption;
  
  const savingsFromSelfConsumption = selfConsumption * (assumptions.electricityRateCentsKwh / 100);
  const savingsFromExport = exportAmount * (assumptions.feedInTariffCentsKwh / 100);
  
  return savingsFromSelfConsumption + savingsFromExport;
}
```

**Payback Period**:
```typescript
function calculatePayback(
  systemCost: number,
  annualSavings: number
): number {
  if (annualSavings === 0) return 0;
  return Math.round((systemCost / annualSavings) * 10) / 10; // Round to 1 decimal
}
```

### C. Component Hierarchy Diagram

```
HomeownerWrittenQuoteReviewModal
├── Modal Header (Title, Close Button)
├── Grid Container (3 columns)
│   ├── LEFT COLUMN (col-span-2)
│   │   ├── InstallerInfoCard [NEW]
│   │   │   ├── Company Name + Badges
│   │   │   ├── Email (clickable)
│   │   │   └── Phone (clickable)
│   │   ├── QuoteOverviewCard [NEW]
│   │   │   ├── MetricCard (System Size)
│   │   │   ├── MetricCard (Total Price)
│   │   │   ├── MetricCard (Annual Savings)
│   │   │   └── MetricCard (Payback Years)
│   │   ├── Financial Section
│   │   │   ├── QuoteCalculationsSummary
│   │   │   └── SavingsChart (conditional)
│   │   └── Accordion [NEW]
│   │       ├── Equipment Details (expanded by default)
│   │       │   ├── QuoteSystemSpecsCard
│   │       │   └── QuoteEquipmentCard
│   │       └── Line Items (collapsed by default)
│   │           └── QuoteLineItemsTable
│   └── RIGHT COLUMN (col-span-1)
│       └── WrittenQuoteNegotiationPanel (sticky)
│           ├── Status Badge
│           ├── Current Price
│           ├── History Timeline
│           └── Action Buttons (enhanced)
```

---

**End of Enhancement Plan**
