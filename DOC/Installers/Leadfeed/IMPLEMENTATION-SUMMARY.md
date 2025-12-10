# CALL/VISIT Lead Flow - Implementation Summary (REVISED)

**Date:** 2025-11-25  
**Status:** Audit Complete - Ready for Execution  
**Priority:** High  
**Estimated Time to MVP: 2 hours**

---

## ⚠️ AUDIT FINDINGS - CRITICAL UPDATES

**GOOD NEWS:**
- ✅ Backend infrastructure is production-ready
- ✅ Purchase API fully functional
- ✅ Frontend already removed mock data (Phase 1 complete)
- ✅ Data fetching works correctly

**ISSUES IDENTIFIED:**
- ❌ **CRITICAL:** `StripeUnlockModal` uses mock `setTimeout`, never calls real API
- ❌ **CRITICAL:** Purchased leads endpoint doesn't exist
- ❌ Multi-installer detection not implemented

**ACTION REQUIRED:** Read `DEEP-AUDIT-REPORT.md` for full analysis before proceeding.

---

## Overview

Complete end-to-end implementation of CALL/VISIT lead purchase flow with server-authoritative status management, multi-role synchronization, and no breaking changes to existing functionality.

---

## Key Findings from Audit

### ✅ **Already Built (Solid Foundation):**
- Database schema with correct enums (CALL_VISIT, PURCHASED, etc.)
- LeadAssignment model (many-to-many installer-lead relationships)
- `/api/installer/leads/assigned` - Returns assigned leads with masked contact
- `/api/installer/leads/[id]/purchase` - Purchase endpoint (updates status, unlocks contact)
- Frontend accepts real data via props (no mock data)
- Type mapping layer exists (`mapAssignedLeadToComponentLead`)

### ❌ **Gaps to Fix:**
1. ❌ **Modal not wired to API** - `StripeUnlockModal` uses mock setTimeout instead of calling parent's `onUnlockLead` callback
2. ❌ **Purchased leads endpoint missing** - `/api/installer/leads/purchased` doesn't exist, page calls wrong endpoint
3. ❌ **No multi-installer detection** - `isPurchasedByAnother` field not in API response
4. ⏳ No homeowner/admin flow integration (deferred)
5. ⏳ No audit logging (deferred)

---

## Revised Implementation Strategy

### **Phase 1: Frontend Data Integration** ✅ **COMPLETE**
**Status:** Already done - mock data removed, component accepts props, real API connected

**What Was Found:**
- Component already initializes from `leads` prop (no mock fallback)
- `leads/page.tsx` fetches from `/api/installer/leads/assigned` ✓
- Type mapping exists: backend enums → frontend types

**Remaining:** Status mapping enhancement (optional)

**Action:** ✅ Skip this phase - already complete

---

### **Phase 2: Purchase Flow Integration** 🔧 **CRITICAL - START HERE**
**Goal:** Wire `StripeUnlockModal` to real purchase API

**The Problem:**
```
leads/page.tsx (handleUnlockLead with real API call) ✓
  → InstallerLeadFeed (onUnlockLead prop passed) ✓
    → LeadCard (onUnlock prop passed) ✓
      → StripeUnlockModal ✓
        → handlePayment() uses mock setTimeout ❌ DISCONNECT HERE
```

**The Fix:**
1. Add `onUnlockLead` prop to `StripeUnlockModal` interface
2. Replace mock `setTimeout(2000)` with `await onUnlockLead(lead.id)`
3. Pass `onUnlockLead` prop when rendering modal

**Files:**
- `src/components/InstallerLeadFeed.tsx` (lines 85-118, line 733)

**Changes:**
```typescript
// 1. Update interface (line 85):
const StripeUnlockModal: React.FC<{
  // ... existing props
  onUnlockLead: (leadId: number) => Promise<boolean>;  // NEW
}> = ({ isOpen, onClose, lead, onUnlockLead, onPaymentSuccess, installer }) => {

// 2. Replace handlePayment (lines 91-118):
const handlePayment = async () => {
  if (!lead) return;
  setIsProcessing(true);
  setPaymentStatus('processing');
  
  try {
    const success = await onUnlockLead(lead.id);  // ← REAL API CALL
    
    if (!success) {
      setPaymentStatus('error');
      return;
    }
    
    setPaymentStatus('success');
    setTimeout(() => {
      onPaymentSuccess(lead.id);
      onClose();
      setPaymentStatus('idle');
    }, 1500);
  } catch (error) {
    setPaymentStatus('error');
  } finally {
    setIsProcessing(false);
  }
};

// 3. Pass prop (line 733):
<StripeUnlockModal
  // ... existing props
  onUnlockLead={onUnlockLead}  // NEW
  // ... rest
/>
```

**Testing:** Click Purchase → API call → Status updates → Contact unlocked

**Estimated Time: 30 minutes**

---

### **Phase 3: Purchased Leads Page** ❌ **ENDPOINT MISSING**
**Goal:** Create purchased leads API and fix page

**The Problem:**
- Page calls `/api/leads?purchased=true` (doesn't exist)
- Endpoint `/api/installer/leads/purchased` not created
- Page returns 404 error

**The Fix:**
1. Create new API endpoint
2. Update page to call correct endpoint

**Files:**
- `src/app/api/installer/leads/purchased/route.ts` (NEW)
- `src/app/installer/(dashboard)/purchased-leads/page.tsx` (line 76)

**New Endpoint:**
```typescript
// src/app/api/installer/leads/purchased/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== 'INSTALLER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const purchasedLeads = await prisma.lead.findMany({
    where: {
      installerId: session.user.id,
      purchasedAt: { not: null }
    },
    include: {
      homeowner: { select: { id, name, phone, email } },
      quotes: { select: { id } }
    },
    orderBy: { purchasedAt: 'desc' }
  });
  
  return NextResponse.json({ leads: purchasedLeads });
}
```

**Page Fix:**
```typescript
// Change line 76:
const response = await fetch('/api/installer/leads/purchased');  // Fixed endpoint
```

**Testing:** Purchase lead → Navigate to `/purchased-leads` → Verify in tab

**Estimated Time: 1 hour**

---

### **Phase 4: Multi-Installer Logic** ❌ **NOT IMPLEMENTED**
**Goal:** Show "Purchased by another installer" state

**The Problem:**
- API returns `isPurchased` (this installer) ✓
- API does NOT return `isPurchasedByAnother` (different installer) ❌
- UI can't detect when competitor purchases lead

**The Fix:**
1. Add field to API response
2. Update UI to show disabled state

**Files:**
- `src/app/api/installer/leads/assigned/route.ts` (line 89)
- `src/components/InstallerLeadFeed.tsx` (LeadCard component)
- `src/app/installer/(dashboard)/leads/page.tsx` (mapping function)

**API Enhancement:**
```typescript
// Line 89:
return {
  ...lead,
  isPurchased: lead.installerId === session.user.id && !!lead.purchasedAt,
  isPurchasedByAnother: !!lead.installerId && lead.installerId !== session.user.id,  // NEW
};
```

**UI Enhancement:**
```typescript
// In LeadCard:
const isPurchasedByAnother = lead.isPurchasedByAnother || false;

{isPurchasedByAnother && (
  <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
    <p className="text-body text-error">⛔ Purchased by another installer</p>
  </div>
)}

<Button
  disabled={isPurchasedByAnother}
  // ... rest
>
  Unlock Lead
</Button>
```

**Testing:** Installer A purchases → Installer B sees disabled state

**Estimated Time: 30 minutes**

---

### **Phase 5-8: Deferred (Future Work)**
- Phase 5: Real-time sync (polling or websockets)
- Phase 6: Homeowner notifications
- Phase 7: Admin purchase tracking
- Phase 8: Audit logging

**Status:** Not required for MVP, implement later as enhancements

---

## Testing Checklist

### **Phase 2 - Purchase Flow:**
- [ ] Click "Unlock Lead ($X)" button
- [ ] Confirm modal displays lead details
- [ ] Click "Pay to Unlock"
- [ ] Verify API call to `/api/installer/leads/[id]/purchase`
- [ ] Check network tab shows POST request with 200 response
- [ ] Verify lead status updates to PURCHASED
- [ ] Contact details revealed (name, phone, email unmasked)
- [ ] Modal closes with success message
- [ ] Lead refetches and shows updated state

### **Phase 3 - Purchased Leads:**
- [ ] Navigate to `/installer/purchased-leads`
- [ ] Verify purchased leads display
- [ ] Check tabs work (CALL_VISIT, WRITTEN_QUOTE, BIDDING)
- [ ] Confirm lead appears in correct tab
- [ ] Contact always visible (not masked)
- [ ] Purchase date/status displayed correctly

### **Phase 4 - Multi-Installer:**
- [ ] Create test lead assigned to 2 installers
- [ ] Installer A purchases lead
- [ ] Login as Installer B
- [ ] Verify lead shows "Purchased by another installer"
- [ ] Check "Unlock" button is disabled
- [ ] Confirm lead card is visually dimmed

### **Edge Cases:**
- [ ] Concurrent purchase → Error to slower installer
- [ ] Expired lead purchase → "Lead has expired" error
- [ ] Lead not assigned → "Not found or not assigned" error
- [ ] Wrong quote type (WRITTEN_QUOTE) → "Only CALL_VISIT requires purchase" error

---

## Success Criteria

✅ **Core Flow Working:**
- Installer views assigned CALL_VISIT leads with masked contact
- Purchase button triggers real API call (not mock)
- Lead status updates to PURCHASED
- Contact details unlock for purchasing installer only
- Purchased leads accessible in dedicated page
- Other installers see "Purchased by another" state

✅ **No Breaking Changes:**
- WRITTEN_QUOTE/BIDDING flows unaffected
- Dashboard routing preserved
- Design system standards maintained

✅ **Server-Authoritative:**
- All status updates come from backend
- No local state simulation
- Contact masking enforced by API

---

## Rollback Plan

Each phase committed separately. Revert in reverse order if issues arise:
- Phase 4 → Phase 3 → Phase 2

**Commands:**
```bash
# Revert last commit
git revert HEAD

# Or reset to specific commit
git log --oneline  # Find commit hash
git reset --hard <commit-hash>
```

---

## Next Actions

### **Immediate (30 minutes):**
1. ✅ Read `DEEP-AUDIT-REPORT.md` for detailed analysis
2. 🔧 Wire modal to API (Phase 2)
3. ✅ Test purchase flow end-to-end

### **Short-term (1 hour):**
4. 🔧 Create purchased leads endpoint (Phase 3)
5. ✅ Test tabbed interface

### **Medium-term (30 minutes):**
6. 🔧 Add multi-installer detection (Phase 4)
7. ✅ Test competitive purchase scenario

### **Final (15 minutes):**
8. ✅ Run full test checklist
9. ✅ Update gitstatus.md
10. ✅ Commit with message: "Implement CALL/VISIT lead purchase flow (Phases 2-4)"

---

## Time Estimate Summary

| Phase | Task | Time |
|-------|------|------|
| 1 | ✅ Already complete | 0 min |
| 2 | Wire modal to API | 30 min |
| 3 | Create purchased endpoint | 60 min |
| 4 | Multi-installer detection | 30 min |
| **TOTAL** | **MVP Ready** | **2 hours** |

---

**Full Technical Details:** See `CALL-VISIT-IMPLEMENTATION-PLAN.md` for complete code examples, file paths, and step-by-step instructions.

**Audit Findings:** See `DEEP-AUDIT-REPORT.md` for comprehensive backend/frontend analysis and validation results.
