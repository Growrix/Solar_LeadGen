# Purchased Leads Page Refactor Audit Report
**Date**: November 26, 2025  
**Task**: Extract LeadCard component and reuse in purchased-leads page  
**Status**: Ready for Implementation

---

## 1. CURRENT STATE

### Files Involved:
1. **`src/components/InstallerLeadFeed.tsx`** (lines 542-782)
   - Contains internal `LeadCard` component
   - Props: `lead`, `installer`, `onUnlock`, `onSubmitQuote`, `onStartChat`
   - Shows different states: new, unlocked, purchased by another
   - Has conditional rendering: unlock button, contact details, countdown timer

2. **`src/app/installer/(dashboard)/purchased-leads/page.tsx`** (425 lines)
   - Custom-built card structure (wrong approach ❌)
   - Has tabs: Call/Visit, Written Quotes, Bidding ✅
   - Displays purchased leads with contact details revealed
   - Uses Button component (semantic ✅)

### LeadCard Component Structure (SOT):
```tsx
// Key Features:
- Header: Lead type icon, status badge, time ago
- Banner: "Purchased by another" warning (if applicable)
- Details: Location, system size, budget, countdown timer
- Contact Info: Unlocked section with name/phone/email (if purchased)
- Actions: Unlock button, Submit Quote, Start Chat, View Details
```

### Data Flow:
- Lead Feed: Fetches assigned leads from `/api/installer/leads/assigned`
- Purchased Leads: Fetches purchased leads from `/api/installer/leads/purchased`
- Both use same `Lead` type but different states (assigned vs purchased)

---

## 2. GAP ANALYSIS

### What's Wrong:
❌ Purchased-leads page has custom card structure (duplicates UI logic)  
❌ Two different card designs for same lead data  
❌ Harder to maintain (fix bug twice)  
❌ Not following DRY principle

### What's Needed:
✅ Extract `LeadCard` to shared component  
✅ Reuse in both lead-feed AND purchased-leads  
✅ Pass `isPurchased` prop to show unlocked contact info  
✅ Remove duplicate card code from purchased-leads page  
✅ Keep tab filtering logic (working correctly)

---

## 3. ROOT CAUSE

**Why Custom Card Was Built:**
- Misunderstood requirement: "match UI design" interpreted as "rebuild similar structure"
- Didn't realize existing `LeadCard` should be reused
- Overcomplicated with new sections instead of extracting component

**Why This Matters:**
- User wants **one design** (SOT) for all lead cards
- Different lead types share UI but have different behaviors
- Purchased leads = same card with contact unlocked + no purchase button

---

## 4. IMPLEMENTATION PLAN

### Phase 1: Extract LeadCard Component (30 min)
**Files to Create:**
- `src/components/installer/LeadCard.tsx`

**Tasks:**
1. Copy `LeadCard` component from InstallerLeadFeed (lines 542-782)
2. Extract types/interfaces needed
3. Add `isPurchased` prop to control state
4. Export component

**Props Interface:**
```typescript
interface LeadCardProps {
  lead: Lead;
  installer: InstallerProfile;
  onUnlock: (leadId: string) => void;
  onSubmitQuote: (leadId: string, quoteData: any) => Promise<boolean>;
  onStartChat: (leadId: string) => void;
  isPurchased?: boolean; // NEW: Show as purchased (contact unlocked, no actions)
}
```

**Testing:**
- [ ] TypeScript: 0 errors
- [ ] File imports correctly
- [ ] All dependencies resolved

---

### Phase 2: Update InstallerLeadFeed to Use Extracted Component (15 min)
**Files to Modify:**
- `src/components/InstallerLeadFeed.tsx`

**Tasks:**
1. Import extracted `LeadCard` component
2. Remove internal `LeadCard` definition (lines 542-782)
3. Use imported component in render
4. Verify no functionality broken

**Testing:**
- [ ] TypeScript: 0 errors
- [ ] Lead feed still renders correctly
- [ ] Unlock/Quote/Chat actions still work
- [ ] Browser console: No errors
- [ ] Visual test: Card looks identical

---

### Phase 3: Update Purchased-Leads Page to Use LeadCard (20 min)
**Files to Modify:**
- `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Tasks:**
1. Import `LeadCard` component
2. Remove custom card JSX (lines 267-417)
3. Map purchased leads using `LeadCard` with `isPurchased={true}`
4. Keep tab filtering logic intact
5. Pass empty functions for onUnlock/onSubmitQuote (not needed for purchased)

**Code Pattern:**
```tsx
{leads.filter(lead => lead.quoteType === activeTab).map(lead => (
  <LeadCard
    key={lead.id}
    lead={transformedLead} // Transform to Lead type
    installer={installerProfile}
    onUnlock={() => {}} // No-op
    onSubmitQuote={async () => false} // No-op
    onStartChat={handleStartChat}
    isPurchased={true} // Show contact unlocked
  />
))}
```

**Testing:**
- [ ] TypeScript: 0 errors
- [ ] Purchased leads render with same card design
- [ ] Contact info visible (unlocked)
- [ ] No purchase/unlock buttons shown
- [ ] Tab filtering works (Call/Visit, Written Quotes, Bidding)
- [ ] "View Details" button works
- [ ] Browser console: No errors
- [ ] Visual test: Matches lead feed card design

---

### Phase 4: Final Verification (10 min)
**Tests to Run:**
1. **Build Check:**
   ```powershell
   npx tsc --noEmit
   npm run build
   ```
   Expected: Success ✅

2. **Visual Regression Test:**
   - Lead Feed: Card looks identical (before/after)
   - Purchased Leads: Uses same card design as lead feed
   - All themes: Dark, Light, Purple

3. **Functional Test:**
   - Lead Feed: Unlock → Contact revealed → View Details works
   - Purchased Leads: Contact already revealed → View Details works
   - Tab switching: Filters leads correctly

4. **Responsive Test:**
   - 320px: Cards stack properly
   - 768px: Grid layout works
   - 1440px: Max-width applied

---

## 5. ROLLBACK PROCEDURE

If anything breaks:
```powershell
git reset --hard fca6778  # Last known good commit
npm run dev  # Verify rollback successful
```

---

## 6. SUCCESS CRITERIA

✅ One `LeadCard` component used in both places  
✅ Lead feed functionality unchanged  
✅ Purchased leads show same card design  
✅ Contact info revealed for purchased leads  
✅ No purchase/unlock buttons on purchased leads  
✅ Tab filtering works correctly  
✅ TypeScript: 0 errors  
✅ Build: Success  
✅ All themes work (Dark/Light/Purple)  
✅ Responsive (320px, 768px, 1440px)  
✅ Browser console: No errors  

---

## 7. ESTIMATED TIME

- Phase 1: 30 min
- Phase 2: 15 min
- Phase 3: 20 min
- Phase 4: 10 min
**Total: 75 minutes**

---

## 8. RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Type mismatches between Lead types | High | Carefully map PurchasedLead → Lead type |
| Breaking lead feed functionality | High | Test Phase 2 thoroughly before Phase 3 |
| Visual regression | Medium | Screenshot before/after comparison |
| Missing dependencies | Low | Verify all imports resolved |

---

## RECOMMENDATION

✅ **Proceed with Option A** - Extract and reuse LeadCard component  
This aligns with DRY principles, ensures consistency, and makes future changes easier.
