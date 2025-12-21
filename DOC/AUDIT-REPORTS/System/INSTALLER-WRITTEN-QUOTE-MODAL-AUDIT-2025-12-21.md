# Installer Written Quote Review Modal - Audit Report
**Date**: 2025-12-21  
**Branch**: WrittenQuote_SeparateFlow  
**Auditor**: AI Agent (Claude Sonnet 4.5)  
**Context**: Phase 4.16.13 (Homeowner side complete), now auditing installer side

---

## Executive Summary

**CRITICAL FINDING**: There is **NO dedicated installer-side written quote review modal** analogous to the homeowner-side `HomeownerWrittenQuoteReviewModal.tsx` that was just built.

### Current State
- **Homeowner Side**: ✅ Fully functional dedicated modal (`HomeownerWrittenQuoteReviewModal.tsx`, 373 lines)
- **Installer Side**: ❌ **MISSING** - Installers use the **QuoteBuilderModal** in `'written-quote'` mode, which is a **creation/editing tool**, NOT a review modal

### User-Reported Issues (Validated by Audit)
1. ❌ **No proper calculations in description** - QuoteBuilderModal focuses on quote building, not display
2. ❌ **No savings graph** - Graph exists in QuoteBuilderModal (line 1107-1115) but buried in "Customer Preview" section
3. ❌ **Demo email/phone showing** - No evidence of contact masking logic for installers
4. ❌ **Negotiation flow broken** - `WrittenQuoteNegotiationPanel` exists but only in QuoteBuilderModal, not optimized for review
5. ❌ **Wrong modal paradigm** - Using a **builder modal** for **reviewing/negotiating** submitted quotes

---

## Audit Findings

### 1. Modal Architecture Gap

#### Homeowner Side (COMPLETE)
```
src/components/written-quote/
├── HomeownerWrittenQuoteReviewModal.tsx (373 lines)
│   ├── Purpose: Review submitted written quotes
│   ├── Layout: 60% quote details | 40% negotiation panel
│   ├── Data Source: /api/written-quotes/get?leadId=X
│   └── Actions: Accept, Counter-offer, Reject
```

#### Installer Side (MISSING)
```
❌ NO InstallerWrittenQuoteReviewModal.tsx
❌ NO dedicated review interface
❌ Uses QuoteBuilderModal instead (wrong paradigm)
```

**Root Cause**: Installers are using the **QuoteBuilderModal** (1284 lines) for both:
- Creating new quotes (correct)
- Reviewing/negotiating submitted quotes (incorrect)

This violates separation of concerns: **creation ≠ review**.

---

### 2. Component Inventory

#### Shared Components (Available for Installer Modal)
| Component | Location | Lines | Status |
|-----------|----------|-------|--------|
| `QuoteSystemSpecsCard` | `src/components/quote-display/` | 54 | ✅ Ready |
| `QuoteEquipmentCard` | `src/components/quote-display/` | 147 | ✅ Ready |
| `QuoteFinancialCard` | `src/components/quote-display/` | 106 | ✅ Ready |
| `QuoteLineItemsTable` | `src/components/quote-display/` | 50 | ✅ Ready |
| `WrittenQuoteNegotiationPanel` | `src/components/written-quote/` | 300 | ✅ Ready |
| `SavingsChart` | `src/components/` | Unknown | ✅ Available |

**Assessment**: All building blocks exist. Just need new modal component.

---

### 3. API Endpoint Analysis

#### GET /api/written-quotes/get?leadId=X
**File**: `src/app/api/written-quotes/get/route.ts` (160 lines)

**Authorization**: ✅ Zero-trust (Article VI)
```typescript
OR: [
  { installerId: auth.userId },  // ✅ Installer can fetch their quotes
  { homeownerId: auth.userId }   // ✅ Homeowner can fetch their quotes
]
```

**Response Structure**:
```typescript
{
  quote: {
    id, leadId, installerId, homeownerId,
    currentPrice, currentStatus, lastActionBy, lastActionAt,
    systemData, productsData, lineItems, assumptions,
    roofData, calculations,
    installerContact: {           // 🔴 CONTACT DATA STRUCTURE EXISTS
      primaryContactName?: string,
      email?: string,
      phone?: string
    },
    lead: { id, name, location, propertyType, status },
    installer: { id, companyName, email, phone },  // 🔴 UNMASKED DATA
    homeowner: { id, name, email },                // 🔴 UNMASKED DATA
    events: WQEvent[]
  }
}
```

**Contact Masking Issue**:
- API returns **raw installer.email, installer.phone, homeowner.email**
- ❌ **NO masking logic** for installers viewing homeowner details
- ❌ **NO purchase status check** before revealing contact info
- Homeowner modal shows installer contact (lines 287-313 in HomeownerWrittenQuoteReviewModal.tsx)
- **Installer should NOT see homeowner contact until lead is purchased**

---

### 4. Negotiation Flow Analysis

#### Current Implementation (QuoteBuilderModal)
**File**: `src/components/QuoteBuilderModal.tsx`

**Lines 1118-1136**: Written Quote Negotiation Section
```tsx
{mode === 'written-quote' && (
  <CollapsibleSection
    title="Written Quote Negotiation"
    expanded={expandedSections.writtenQuoteNegotiation || false}
    onToggle={() => toggleSection('writtenQuoteNegotiation')}
  >
    <WrittenQuoteNegotiationPanel
      role="installer"
      currentPrice={quoteDraft.preview.options[0]?.totalPrice || 0}
      status="draft"  // 🔴 HARDCODED TO "draft"
      history={[]}     // 🔴 EMPTY HISTORY
      onAction={async (action, data) => {
        console.log('Written Quote Action:', action, data);
        // TODO: Wire to API in Sprint 2E (T-WQ-214)  // 🔴 NOT WIRED
        alert(`Mock: ${action} action with price ${data.price || 'N/A'}`);
      }}
    />
  </CollapsibleSection>
)}
```

**Issues**:
1. ❌ `status` hardcoded to `"draft"` - should come from API
2. ❌ `history` empty array - should fetch from `/api/written-quotes/get`
3. ❌ `onAction` not wired to API endpoints:
   - `/api/written-quotes/[id]/offer` (POST)
   - `/api/written-quotes/[id]/counter` (POST)
   - `/api/written-quotes/[id]/done` (POST)
4. ❌ Embedded in quote builder (wrong context)
5. ❌ No visual prominence - just another collapsible section

---

### 5. Calculations & Savings Graph

#### Current State in QuoteBuilderModal
**Lines 1107-1115**: Savings Chart
```tsx
{quoteDraft.preview.options.length > 0 && (
  <div className="mt-4">
    <SavingsChart
      finalPrice={quoteDraft.preview.options[0].totalPrice}
      annualSavings={quoteDraft.preview.options[0].estimatedSavingsPerYear}
      currentAnnualBill={quoteDraft.preview.options[0].estimatedSavingsPerYear + (quoteDraft.preview.options[0].estimatedSavingsPerYear * 0.3)}
    />
  </div>
)}
```

**Issues**:
1. ✅ Savings chart exists and works
2. ❌ Hidden inside "Customer Preview" collapsible section
3. ❌ Not visible in review context
4. ❌ No dedicated "Calculations Summary" card

**Comparison to Bidding Leads**:
- Bidding leads have `BidEvaluationModal` with:
  - ✅ Prominent savings visualization
  - ✅ Calculation breakdowns
  - ✅ ROI projections
- Written quotes lack equivalent installer-facing review UI

---

### 6. Contact Display & Masking Logic

#### Homeowner Modal (Correct Implementation)
**File**: `src/components/written-quote/HomeownerWrittenQuoteReviewModal.tsx`  
**Lines 287-313**:
```tsx
{writtenQuote.installerContact && (
  <Card className="neu-card p-4">
    <h3 className="text-heading-3 mb-3">Installer Contact</h3>
    <div className="space-y-2">
      {writtenQuote.installerContact.primaryContactName && (
        <div><strong>Contact:</strong> {writtenQuote.installerContact.primaryContactName}</div>
      )}
      {writtenQuote.installerContact.email && (
        <a href={`mailto:${writtenQuote.installerContact.email}`}>
          {writtenQuote.installerContact.email}
        </a>
      )}
      {writtenQuote.installerContact.phone && (
        <a href={`tel:${writtenQuote.installerContact.phone}`}>
          {writtenQuote.installerContact.phone}
        </a>
      )}
    </div>
  </Card>
)}
```

**Assessment**: ✅ Displays installer contact to homeowner (correct - homeowner already purchased)

#### Installer Side (BROKEN)
**Expected Behavior**:
```typescript
// Installer should see homeowner contact ONLY if lead is purchased
if (lead.status === 'PURCHASED' && lead.purchasedAt) {
  // Show real homeowner name, email, phone
} else {
  // Show masked: "John D.", "j***@***.com", "(555) ***-****"
}
```

**Current State**:
- ❌ NO installer-side contact display component
- ❌ NO masking logic in QuoteBuilderModal
- ❌ API returns raw contact data (no server-side masking)
- User screenshot shows "demo data" - likely placeholder, NOT masked production data

---

### 7. Installer Lead Feed Integration

#### Current Trigger Points
**File**: `src/components/InstallerLeadFeed.tsx`

**Line 848-865**: Submit Quote Button
```tsx
{canQuote && (
  <Button
    onClick={() => {
      // T-WQ-905: Set mode to 'written-quote' for ASSIGNED written quote leads
      const modalMode = isAssignedWritten ? 'written-quote' : 'quote';
      setQuoteMode(modalMode);
      setIsQuoteModalOpen(true);  // Opens QuoteBuilderModal
    }}
    variant="primary"
  >
    <SendIcon className="h-4 w-4" />
    <span>Submit Quote</span>
  </Button>
)}
```

**Issues**:
1. ✅ Correctly identifies written quote leads
2. ❌ Opens **QuoteBuilderModal** (creation tool)
3. ❌ NO "Review Submitted Quote" button for installers
4. ❌ NO distinction between:
   - "Create new quote" (QuoteBuilderModal)
   - "Review/negotiate existing quote" (InstallerWrittenQuoteReviewModal - missing)

**Expected Flow**:
```
Installer Dashboard (Purchased Leads)
├── WRITTEN_QUOTE lead with submitted quote
│   ├── Button: "Review Written Quote" → InstallerWrittenQuoteReviewModal
│   │   ├── 60% Quote Details (read-only)
│   │   ├── 40% Negotiation Panel (active)
│   │   ├── Homeowner Contact (masked if not purchased)
│   │   └── Savings Graph (prominent)
│   └── Button: "Edit Quote" → QuoteBuilderModal (if editable)
```

---

## Gap Analysis Summary

| Feature | Homeowner Side | Installer Side | Status |
|---------|----------------|----------------|--------|
| **Dedicated Review Modal** | ✅ HomeownerWrittenQuoteReviewModal | ❌ Missing | 🔴 CRITICAL |
| **Quote Display Cards** | ✅ Uses shared components | ❌ Uses builder UI | 🔴 HIGH |
| **Savings Graph** | ✅ Visible in modal | ❌ Hidden in builder | 🔴 HIGH |
| **Calculations Summary** | ✅ Financial card | ❌ No summary | 🔴 HIGH |
| **Negotiation Panel** | ✅ Prominent (40% width) | ❌ Collapsible section | 🔴 HIGH |
| **Contact Display** | ✅ Installer contact shown | ❌ No homeowner contact | 🔴 CRITICAL |
| **Contact Masking** | N/A (homeowner paid) | ❌ No masking logic | 🔴 CRITICAL |
| **API Integration** | ✅ /api/written-quotes/get | ❌ Not wired | 🔴 HIGH |
| **Event History** | ✅ Displays all events | ❌ Empty array | 🔴 MEDIUM |
| **Action Handlers** | ✅ Counter/Accept/Reject | ❌ Mock alerts | 🔴 HIGH |

---

## Recommended Solution

### Phase 4.16.14: Build InstallerWrittenQuoteReviewModal

#### Scope
1. **Create New Component**: `src/components/installer/InstallerWrittenQuoteReviewModal.tsx`
   - Similar to `HomeownerWrittenQuoteReviewModal.tsx` (373 lines)
   - 2-column layout: 60% quote details | 40% negotiation panel
   - Fetch data via `/api/written-quotes/get?leadId=X`
   - Reuse shared components (QuoteSystemSpecsCard, etc.)

2. **Add Contact Masking Logic**:
   ```tsx
   interface HomeownerContactCardProps {
     contact: { name: string; email: string; phone: string };
     isPurchased: boolean;  // From lead.status === 'PURCHASED'
   }
   
   function HomeownerContactCard({ contact, isPurchased }: HomeownerContactCardProps) {
     if (!isPurchased) {
       return <MaskedContactDisplay contact={contact} />;
     }
     return <FullContactDisplay contact={contact} />;
   }
   ```

3. **Add Calculations Summary Card**:
   - Display pricing breakdown (subtotal, GST, STC, VIC rebates)
   - Show final price prominently
   - Link to savings graph

4. **Integrate Savings Graph**:
   - Position prominently in quote details column
   - Use existing `<SavingsChart />` component
   - Calculate from `quote.calculations` API data

5. **Wire Negotiation Panel**:
   - Fetch current status from API
   - Load full event history
   - Connect to `/api/written-quotes/[id]/offer`, `/counter`, `/done`

6. **Update Installer Dashboard Routing**:
   - Add "Review Written Quote" button
   - Route WRITTEN_QUOTE leads → `InstallerWrittenQuoteReviewModal`
   - Keep "Edit Quote" → `QuoteBuilderModal` for drafts

---

## Implementation Estimates

| Task | Estimated Time | Priority |
|------|----------------|----------|
| Create InstallerWrittenQuoteReviewModal base structure | 45 min | P0 |
| Add contact masking logic (component + util) | 30 min | P0 |
| Integrate shared quote display components | 20 min | P0 |
| Add Calculations Summary card | 30 min | P1 |
| Position savings graph prominently | 15 min | P1 |
| Wire WrittenQuoteNegotiationPanel to API | 45 min | P0 |
| Update InstallerLeadFeed routing logic | 30 min | P0 |
| Update purchased-leads page routing | 20 min | P0 |
| Build verification (TypeScript + npm build) | 15 min | P0 |
| 6-command post-migration verification | 10 min | P0 |
| **TOTAL** | **4h 20m** | - |

---

## API Modifications Needed

### Option A: Server-Side Masking (Recommended)
Modify `/api/written-quotes/get/route.ts`:
```typescript
// After fetching quote
const isPurchased = quote.lead.status === 'PURCHASED' && quote.lead.purchasedAt;

if (auth.role === 'INSTALLER' && !isPurchased) {
  // Mask homeowner contact
  quote.homeowner = {
    ...quote.homeowner,
    email: maskEmail(quote.homeowner.email),
    phone: maskPhone(quote.homeowner.phone)
  };
}
```

### Option B: Client-Side Masking (Fallback)
Add masking utilities in `src/utils/contactMasking.ts`:
```typescript
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local[0]}***@***.${domain.split('.').pop()}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{3}(\d{4})/, '$1-***-****');
}
```

---

## Testing Checklist

### Functional Tests
- [ ] Installer can open review modal for submitted written quotes
- [ ] Quote details display correctly (system, equipment, financial)
- [ ] Savings graph renders with correct data
- [ ] Calculations summary shows accurate pricing breakdown
- [ ] Negotiation panel displays current status and history
- [ ] Installer can submit counter-offer (API integration)
- [ ] Installer can mark as "Done Deal" (API integration)
- [ ] Contact masking works for unpurchased leads
- [ ] Full contact shown for purchased leads

### UI/UX Tests
- [ ] Modal layout: 60% quote details | 40% negotiation (responsive)
- [ ] All 3 themes render correctly (Dark, Light, Purple)
- [ ] Typography uses semantic tokens (text-heading-*, text-body-*)
- [ ] Colors use semantic tokens (bg-surface, text-muted-foreground)
- [ ] Shadows use semantic tokens (shadow-outset-*)
- [ ] Accessibility: Keyboard navigation, WCAG 2.1 AA contrast

### Build Verification
- [ ] TypeScript: 0 errors (`npx tsc --noEmit`)
- [ ] Production build: SUCCESS (`npm run build`)
- [ ] 6-command verification: 0/0/0/1/0/0 (1 acceptable: modal backdrop)

---

## Files to Create/Modify

### New Files
1. `src/components/installer/InstallerWrittenQuoteReviewModal.tsx` (new)
2. `src/components/installer/HomeownerContactCard.tsx` (new)
3. `src/components/quote-display/QuoteCalculationsSummary.tsx` (new)
4. `src/utils/contactMasking.ts` (new)

### Modified Files
1. `src/components/InstallerLeadFeed.tsx` (add "Review Written Quote" button)
2. `src/app/installer/(dashboard)/purchased-leads/page.tsx` (add modal routing)
3. `src/app/api/written-quotes/get/route.ts` (add contact masking if server-side)

---

## Conclusion

The installer-side written quote flow is **fundamentally incomplete**. While the homeowner side received a dedicated review modal in Phase 4.16.13, the installer side is still using the QuoteBuilderModal, which is the **wrong tool for the job**.

**Next Steps**:
1. Create new phase in `specs/008-description-enhance-existing/tasks.md`
2. Implement `InstallerWrittenQuoteReviewModal.tsx` using existing shared components
3. Add contact masking logic (server-side or client-side)
4. Update installer dashboard routing to use new modal
5. Run full verification (TypeScript, build, 6-command scan)

**Est. Completion**: 4-5 hours of focused implementation work.

---

**Audit Completed**: 2025-12-21 10:45 AM (UTC)  
**Branch**: WrittenQuote_SeparateFlow  
**Next Action**: Create Phase 4.16.14 in tasks.md
