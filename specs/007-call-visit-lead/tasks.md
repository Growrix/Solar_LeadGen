# CALL/VISIT Lead Implementation Tasks
**Date:** 2025-11-25  
**Branch:** 007-call-visit-lead  
**Implementation Order:** Installer → Admin → Homeowner

---

## 🎯 MANDATORY TESTING RULES

### **Rule 1: STOP-ON-FAIL**
- ❌ If ANY test fails in a phase, **STOP IMMEDIATELY**
- ❌ DO NOT proceed to next phase until all tests pass
- ❌ Fix the failed test before continuing

### **Rule 2: INCREMENTAL VALIDATION**
- ✅ Test after each file modification
- ✅ Run `npm run build` after each phase
- ✅ Check browser console for errors
- ✅ Verify Network tab shows correct API calls

### **Rule 3: ROLLBACK ON BREAKING CHANGES**
- ❌ If a change breaks existing functionality, revert immediately
- ❌ Fix in isolation before reapplying

### **Rule 4: DESIGN SYSTEM COMPLIANCE**
- ✅ Reference `DOC/Guidelines/DESIGN-SYSTEM-SOT.md` for all UI changes
- ✅ Use semantic classes from global CSS only (no inline styles)
- ✅ Follow `DOC/Guidelines/UI-UX-Layout-and-Routing-Standards.md`
- ❌ NO hardcoded colors, spacing, or typography

### **Rule 5: CHECKPOINT VALIDATION**
- Each phase ends with a checkpoint
- ALL tests must pass before marking phase complete
- Document any deviations or issues found

---

## 📋 PHASE STRUCTURE

Each phase follows this pattern:
1. **Implementation** - Code changes with file paths
2. **Testing** - Detailed test steps with expected results
3. **Checkpoint** - Pass/fail validation before proceeding
4. **Rollback** - Instructions if tests fail

---

## PHASE 1: Setup & Validation (PREREQUISITE)

**Goal:** Verify current state and dependencies

### Task 1.1: Verify Backend Infrastructure
**File Audit:**
```bash
# Check these files exist and have correct structure:
- prisma/schema.prisma (Lead, LeadAssignment models)
- src/app/api/installer/leads/assigned/route.ts
- src/app/api/installer/leads/[id]/purchase/route.ts
```

**Testing:**
```bash
# Run Prisma validation
npx prisma validate

# Check TypeScript compilation
npx tsc --noEmit

# Start dev server
npm run dev
```

**Expected Results:**
- ✅ Prisma schema valid
- ✅ No TypeScript errors
- ✅ Dev server starts without errors

**❌ STOP:** If any errors, fix before Phase 2.

---

### Task 1.2: Test Existing APIs Manually
**Steps:**
1. Login as installer
2. Open DevTools Network tab
3. Navigate to `/installer/leads`
4. Check API calls

**Expected Results:**
- ✅ GET `/api/installer/leads/assigned` returns 200
- ✅ Response includes leads array
- ✅ Contact fields show `***LOCKED***` for unpurchased leads

**❌ STOP:** If API fails or returns wrong data, fix before Phase 2.

---

### Task 1.3: Read Design Guidelines
**Files to Review:**
```
DOC/Guidelines/DESIGN-SYSTEM-SOT.md
DOC/Guidelines/UI-UX-Layout-and-Routing-Standards.md
```

**Key Points to Note:**
- Color token names (--color-foreground, --color-surface, etc.)
- Typography classes (text-heading-3, text-body, etc.)
- Spacing utilities (spacing-4, spacing-6, etc.)
- Component patterns (theme-card, btn-primary, etc.)

**✅ CHECKPOINT:** Ready to proceed to Phase 2 (Installer Flow)

---

## PHASE 2: Installer Purchase Flow (CRITICAL)

**Goal:** Wire `StripeUnlockModal` to real purchase API with mock payment

### Task 2.1: Update Modal Interface
**File:** `src/components/InstallerLeadFeed.tsx` (lines 85-90)

**Changes:**
```typescript
// ADD new prop to interface:
const StripeUnlockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUnlockLead: (leadId: number) => Promise<boolean>;  // NEW
  onPaymentSuccess: (leadId: number) => void;
  installer: InstallerProfile;
}> = ({ isOpen, onClose, lead, onUnlockLead, onPaymentSuccess, installer }) => {
```

**Testing:**
```bash
# Save file and check for TypeScript errors
npx tsc --noEmit
```

**Expected:**
- ✅ No TypeScript errors
- ✅ Modal interface updated

**❌ STOP:** If TypeScript errors appear, fix interface first.

---

### Task 2.2: Implement Mock Purchase Flow
**File:** `src/components/InstallerLeadFeed.tsx` (lines 91-118)

**Changes:**
```typescript
const handlePayment = async () => {
  if (!lead) return;
  
  setIsProcessing(true);
  setPaymentStatus('processing');
  
  try {
    // MOCK PAYMENT (Stripe placeholder)
    // TODO: When Stripe available, add here:
    // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    // const { error } = await stripe.confirmCardPayment(clientSecret);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Call real purchase API
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

**Testing Steps:**
1. Save file
2. Check browser console for errors
3. Verify no syntax errors

**Expected:**
- ✅ File saves without errors
- ✅ No console errors

**❌ STOP:** If errors, fix syntax first.

---

### Task 2.3: Pass Callback Through Component Tree
**File:** `src/components/InstallerLeadFeed.tsx` (line 733)

**Changes:**
```typescript
<StripeUnlockModal
  isOpen={showUnlockModal}
  onClose={() => {
    setShowUnlockModal(false);
    setSelectedLead(null);
  }}
  lead={selectedLead}
  onUnlockLead={onUnlockLead}  // NEW: Pass through
  onPaymentSuccess={handlePaymentSuccess}
  installer={installer}
/>
```

**Testing:**
```bash
npm run build
```

**Expected:**
- ✅ Build completes successfully
- ✅ No build errors

**❌ STOP:** If build fails, check component props.

---

### Task 2.4: End-to-End Purchase Flow Test

**Prerequisites:**
- Have test installer account
- Have assigned CALL_VISIT lead

**Test Steps:**
1. Login as installer
2. Navigate to `/installer/leads`
3. Find a CALL_VISIT lead with "Unlock Lead" button
4. Click "Unlock Lead ($X)"
5. Verify modal opens
6. Click "Pay $X to Unlock"
7. Watch for "Processing..." state (1.5s)
8. Open DevTools Network tab
9. Check for POST request to `/api/installer/leads/[id]/purchase`
10. Verify response is 200 OK
11. Check modal shows "Payment successful!"
12. Wait for modal to close automatically
13. Verify lead card now shows contact details (unmasked)
14. Check name, phone, email are visible

**Expected Results:**
- ✅ Modal opens correctly
- ✅ Payment processing animation shows
- ✅ API call succeeds (200 status)
- ✅ Contact details unlock
- ✅ Success message appears
- ✅ Modal closes automatically
- ✅ No console errors

**❌ STOP CRITERIA:**
- ❌ If modal doesn't open → Fix modal trigger
- ❌ If API returns error → Check backend logs
- ❌ If contact stays masked → Check API response
- ❌ If console errors → Fix JavaScript errors

**✅ CHECKPOINT 2:** Purchase flow working end-to-end. Proceed to Phase 3.

---

## PHASE 3: Purchased Leads Page (HIGH PRIORITY)

**Goal:** Create purchased leads endpoint and tabbed UI

### Task 3.1: Create Purchased Leads API Endpoint
**File:** `src/app/api/installer/leads/purchased/route.ts` (NEW)

**Full Implementation:**
```typescript
/**
 * GET /api/installer/leads/purchased
 * Returns leads purchased by logged-in installer
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'INSTALLER') {
      return NextResponse.json(
        { error: 'Installer access required' },
        { status: 403 }
      );
    }
    
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

**Testing:**
```bash
# Save file
# Build project
npm run build

# Check for errors
npx tsc --noEmit
```

**Expected:**
- ✅ File created successfully
- ✅ No TypeScript errors
- ✅ Build succeeds

**❌ STOP:** If build fails, check import paths and Prisma syntax.

---

### Task 3.2: Update Purchased Leads Page
**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx` (line 76)

**Change:**
```typescript
// REPLACE:
const response = await fetch('/api/leads?purchased=true');

// WITH:
const response = await fetch('/api/installer/leads/purchased');
```

**Testing:**
```bash
npm run build
```

**Expected:**
- ✅ Build succeeds

---

### Task 3.3: Test Purchased Leads Page

**Prerequisites:**
- Complete Phase 2 (have purchased at least 1 lead)

**Test Steps:**
1. Login as installer who purchased a lead
2. Navigate to `/installer/purchased-leads`
3. Check page loads without errors
4. Verify "Call/Visit" tab is active by default
5. Check purchased lead appears in list
6. Verify contact details visible:
   - Name (not `***LOCKED***`)
   - Phone (not `***LOCKED***`)
   - Email (visible)
7. Check purchase date displays
8. Check status shows correctly
9. Click "Written Quotes" tab
10. Verify empty state or correct leads
11. Click "Bidding" tab
12. Verify empty state or correct leads
13. Return to "Call/Visit" tab
14. Verify filtering persists

**Expected Results:**
- ✅ Page loads without errors
- ✅ Purchased lead displays in correct tab
- ✅ All contact details unmasked
- ✅ Tab switching works
- ✅ Filtering by quoteType accurate
- ✅ No console errors

**❌ STOP CRITERIA:**
- ❌ If 404 error → Check API route path
- ❌ If contact still masked → Check API response mapping
- ❌ If tabs don't filter → Check tab logic
- ❌ If empty when should have data → Check where clause

**✅ CHECKPOINT 3:** Purchased leads page functional. Proceed to Phase 4.

---

## PHASE 4: Multi-Installer Detection (MEDIUM PRIORITY)

**Goal:** Show "Purchased by another installer" state

### Task 4.1: Add API Field
**File:** `src/app/api/installer/leads/assigned/route.ts` (line 89)

**Change:**
```typescript
// FIND (around line 89):
const isPurchased = lead.installerId === session.user.id && !!lead.purchasedAt;

return {
  ...lead,
  homeowner: {
    name: isPurchased ? lead.homeowner.name : '***LOCKED***',
    phone: isPurchased ? lead.homeowner.phone : '***LOCKED***'
  },
  isPurchased,
};

// ADD one line:
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

**Testing:**
```bash
npm run build
```

**Expected:**
- ✅ Build succeeds

---

### Task 4.2: Update Type Mapping
**File:** `src/app/installer/(dashboard)/leads/page.tsx` (line 10)

**Change:**
```typescript
// In mapAssignedLeadToComponentLead function, ADD:
return {
  // ... existing fields
  isUnlocked: !isLocked,
  isPurchasedByAnother: apiLead.isPurchasedByAnother || false, // NEW
  // ... rest
};
```

**Testing:**
```bash
npx tsc --noEmit
```

**Expected:**
- ✅ No TypeScript errors

---

### Task 4.3: Update Lead Card UI
**File:** `src/components/InstallerLeadFeed.tsx` (LeadCard component)

**Changes:**

**Step 1 - Add check (around line 240):**
```typescript
// FIND:
const isUnlockedByInstaller = lead.unlockedBy.includes(installer.id);
const canUnlock = lead.type === 'call_visit' && !isUnlockedByInstaller && lead.status === 'new';

// REPLACE WITH:
const isUnlockedByInstaller = lead.isUnlocked;
const isPurchasedByAnother = lead.isPurchasedByAnother || false;  // NEW
const canUnlock = lead.type === 'call_visit' && 
                  !isUnlockedByInstaller && 
                  !isPurchasedByAnother &&  // NEW
                  lead.status === 'new';
```

**Step 2 - Add banner (after line 260):**
```typescript
// FIND the opening div of LeadCard:
<div className={`theme-card border-l-4 ${getPriorityColor()} p-6 transition-colors duration-200`}>

// REPLACE WITH:
<div className={`theme-card border-l-4 ${getPriorityColor()} p-6 transition-colors duration-200 ${isPurchasedByAnother ? 'opacity-50' : ''}`}>
  
  {/* NEW: Show banner if purchased by another */}
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
```

**Step 3 - Disable button (around line 480):**
```typescript
// FIND the unlock button section:
{canUnlock && (
  <Button
    onClick={() => onUnlock(lead.id)}
    variant="primary"
    className="flex items-center space-x-2"
  >

// REPLACE WITH:
{canUnlock && !isPurchasedByAnother && (  // NEW: Additional check
  <Button
    onClick={() => onUnlock(lead.id)}
    variant="primary"
    className="flex items-center space-x-2"
    disabled={isPurchasedByAnother}  // NEW: Disable state
  >
```

**Testing:**
```bash
npm run build
```

**Expected:**
- ✅ Build succeeds
- ✅ No console errors

---

### Task 4.4: Multi-Installer Test

**Prerequisites:**
- Need 2 installer accounts (A and B)
- Admin access to assign lead to both

**Setup:**
1. Login as Admin
2. Create/select a CALL_VISIT lead
3. Assign to both Installer A and B

**Test Steps:**

**Part 1 - Installer A Purchases:**
1. Login as Installer A
2. Navigate to `/installer/leads`
3. Find the assigned lead
4. Click "Unlock Lead"
5. Complete purchase (Phase 2 flow)
6. Verify success

**Part 2 - Installer B Views:**
1. Login as Installer B
2. Navigate to `/installer/leads`
3. Find the same lead
4. Verify red banner: "⛔ This lead has been purchased by another installer"
5. Check "Unlock Lead" button is disabled or hidden
6. Verify card has reduced opacity (dimmed)
7. Try clicking purchase button (should not work)
8. Open DevTools Network tab
9. Check API response includes `isPurchasedByAnother: true`

**Expected Results:**
- ✅ Installer B sees "purchased by another" banner
- ✅ Button disabled/hidden
- ✅ Card visually dimmed
- ✅ API returns correct flag
- ✅ No way for Installer B to purchase
- ✅ No console errors

**❌ STOP CRITERIA:**
- ❌ If Installer B can still purchase → Fix API check
- ❌ If banner doesn't show → Fix UI conditional
- ❌ If API missing field → Check assigned route

**✅ CHECKPOINT 4:** Multi-installer detection working. 

---

## 🎯 INSTALLER FLOW COMPLETE

**Before Proceeding to Admin/Homeowner:**

### Manual Testing Checklist:
- [ ] Phase 2: Purchase flow works end-to-end
- [ ] Phase 3: Purchased leads page displays correctly
- [ ] Phase 4: Multi-installer state shows correctly
- [ ] No console errors in any phase
- [ ] All API calls return 200 status
- [ ] Contact masking/unmasking works correctly
- [ ] Tab filtering works in purchased page
- [ ] Purchase button disabled for purchased leads

### Build Validation:
```bash
# Run full build
npm run build

# Check for warnings
# Should complete without errors
```

**Expected:**
- ✅ Build: 0 errors, 0 warnings
- ✅ All manual tests passed

**❌ STOP:** If ANY test failed, DO NOT proceed to Phase 6. Fix first.

**✅ PROCEED:** Once all tests pass, proceed to Phase 6 (Homeowner Flow).

---

## PHASE 6: Homeowner Flow (AFTER Installer Complete)

**Goal:** Lock homeowner actions after purchase, show notifications

**Prerequisites:** Phases 2-4 must ALL pass

### Task 6.1: Add Purchase Notification
**File:** `src/app/api/installer/leads/[id]/purchase/route.ts`

**Change:**
```typescript
// FIND (after successful lead update, around line 110):
const updatedLead = await prisma.lead.update({
  where: { id: leadId },
  data: {
    installerId: session.user.id,
    purchasedAt: new Date(),
    purchaseStatus: 'COMPLETED',
    status: 'PURCHASED'
  },
  include: {
    homeowner: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    }
  }
});

// ADD after update (before return):
// Create notification for homeowner
await prisma.notification.create({
  data: {
    userId: updatedLead.homeownerId,
    type: 'LEAD_PURCHASED',
    title: 'Installer Responded to Your Request',
    message: 'An installer has responded to your solar request and will contact you soon.',
    leadId: updatedLead.id,
    read: false
  }
});
```

**Testing:**
```bash
npm run build
```

**Expected:**
- ✅ Build succeeds

---

### Task 6.2: Block Homeowner Edit After Purchase
**File:** `src/app/api/homeowner/leads/[id]/route.ts`

**Find PUT/PATCH/DELETE handlers and add validation:**
```typescript
// At the start of PUT/PATCH/DELETE handler, ADD:
const existingLead = await prisma.lead.findUnique({
  where: { id: params.id },
  select: { purchasedAt: true, homeownerId: true }
});

// Check if purchased
if (existingLead.purchasedAt) {
  return NextResponse.json(
    {
      error: 'Cannot modify lead after installer purchase',
      message: 'An installer has already responded to this request. Please contact them directly.'
    },
    { status: 403 }
  );
}
```

**Testing:**
```bash
npm run build
```

**Expected:**
- ✅ Build succeeds

---

### Task 6.3: Test Homeowner Flow

**Prerequisites:**
- Complete Phases 2-4
- Have homeowner account for a purchased lead

**Test Steps:**

**Part 1 - Notification:**
1. Login as installer
2. Purchase a lead (Phase 2 flow)
3. Logout
4. Login as homeowner (owner of that lead)
5. Navigate to homeowner dashboard
6. Check for notification bell/badge
7. Open notifications
8. Verify message: "Installer Responded to Your Request"
9. Check notification details

**Part 2 - Lead Status:**
1. Navigate to homeowner leads page
2. Find the purchased lead
3. Verify status badge shows "Installer Responded" or similar
4. Check for message about installer contacting soon

**Part 3 - Edit Block:**
1. Try to click "Edit" on purchased lead
2. Should be disabled or show error
3. Try to cancel lead
4. Should be blocked with message
5. Check error message is clear

**Expected Results:**
- ✅ Notification created in database
- ✅ Homeowner sees notification
- ✅ Lead status updated correctly
- ✅ Edit button disabled/hidden
- ✅ Cancel action blocked
- ✅ Error messages clear and helpful
- ✅ No console errors

**❌ STOP CRITERIA:**
- ❌ If notification missing → Check notification creation
- ❌ If edit still works → Check validation logic
- ❌ If error message unclear → Update message text

**✅ CHECKPOINT 6:** Homeowner flow working. Proceed to Phase 7.

---

## PHASE 7: Admin Flow (FINAL)

**Goal:** Admin can view purchase info and track lifecycle

**Prerequisites:** Phases 2-4 and 6 must ALL pass

### Task 7.1: Update Admin Lead Modal
**File:** `src/components/admin/LeadDetailsModal.tsx`

**Change:**
```typescript
// FIND the lead details section (inside modal body)
// ADD new section after lead details:

{lead.purchasedAt && (
  <div className="bg-surface rounded-lg shadow-neu-inset border border-border p-4 mt-4">
    <h4 className="text-heading-4 text-foreground mb-3">Purchase Information</h4>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-body-small text-muted">Purchased By:</span>
        <span className="text-body-small text-foreground">
          {lead.installer?.companyName || 'Unknown Installer'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-body-small text-muted">Purchase Date:</span>
        <span className="text-body-small text-foreground">
          {new Date(lead.purchasedAt).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-body-small text-muted">Purchase Status:</span>
        <span className="px-2 py-1 text-caption rounded-full bg-success/10 text-success">
          {lead.purchaseStatus}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-body-small text-muted">Lead Price:</span>
        <span className="text-body-small text-foreground">
          ${lead.leadPrice || 'N/A'}
        </span>
      </div>
    </div>
  </div>
)}
```

**Testing:**
```bash
npm run build
```

**Expected:**
- ✅ Build succeeds
- ✅ No styling conflicts

---

### Task 7.2: Test Admin View

**Prerequisites:**
- Complete Phases 2-4 and 6
- Have admin account
- Have at least 1 purchased lead

**Test Steps:**
1. Login as admin
2. Navigate to admin leads page
3. Find a purchased lead
4. Click to open lead details modal
5. Scroll to "Purchase Information" section
6. Verify all fields display correctly:
   - Installer company name
   - Purchase date (formatted)
   - Purchase status (COMPLETED)
   - Lead price
7. Check styling matches design system
8. Close modal
9. Open another unpurchased lead
10. Verify "Purchase Information" section doesn't show

**Expected Results:**
- ✅ Purchase info section displays for purchased leads
- ✅ All data accurate
- ✅ Styling consistent with design system
- ✅ Section hidden for unpurchased leads
- ✅ No console errors

**❌ STOP CRITERIA:**
- ❌ If data missing → Check include in query
- ❌ If styling wrong → Check class names
- ❌ If shows for unpurchased → Check conditional

**✅ CHECKPOINT 7:** Admin flow complete.

---

## 🏁 FINAL VALIDATION

**ALL PHASES COMPLETE - Run Full Test Suite:**

### 1. Build Validation
```bash
npm run build
```
**Expected:** 0 errors, 0 warnings

### 2. Type Check
```bash
npx tsc --noEmit
```
**Expected:** 0 errors

### 3. Manual Test Matrix

**Installer Tests:**
- [ ] Can view assigned CALL_VISIT leads
- [ ] Can purchase lead (mock payment works)
- [ ] Contact details unlock after purchase
- [ ] Purchased leads show in purchased-leads page
- [ ] Tabs filter correctly (Call/Visit, Written, Bidding)
- [ ] Cannot purchase lead bought by another installer
- [ ] "Purchased by another" banner shows correctly

**Homeowner Tests:**
- [ ] Receives notification on purchase
- [ ] Lead status updates to "Installer Responded"
- [ ] Cannot edit purchased lead
- [ ] Cannot cancel purchased lead
- [ ] Clear error messages on blocked actions

**Admin Tests:**
- [ ] Can view purchase info in lead modal
- [ ] All purchase details accurate
- [ ] Purchase info only shows for purchased leads
- [ ] Can track lead lifecycle

**Cross-Role Tests:**
- [ ] Installer A purchases → Installer B sees "purchased by another"
- [ ] Installer purchases → Homeowner notified immediately
- [ ] Homeowner actions locked → Installer has contact
- [ ] Admin can see full history

### 4. Edge Cases
- [ ] Expired lead cannot be purchased
- [ ] Concurrent purchase (2 installers) → Only 1 succeeds
- [ ] Lead cancelled by homeowner → Shows correct state
- [ ] Network error during purchase → Error handled gracefully

### 5. Design System Compliance
- [ ] All colors use CSS variables (no hex codes)
- [ ] All spacing uses design tokens
- [ ] Typography uses semantic classes
- [ ] Buttons use semantic variants
- [ ] Forms use consistent styling
- [ ] No inline styles anywhere

**✅ SUCCESS CRITERIA:**
- All manual tests passed
- Build with 0 errors
- No console errors in browser
- Design system compliant
- All 3 user flows working

**📝 DOCUMENTATION:**
- Update gitstatus.md with completion
- Document any deviations from plan
- Note Stripe integration points for future

---

## 🔄 ROLLBACK PROCEDURES

**If Critical Issues Found:**

### Phase 7 Rollback:
```bash
# Revert admin modal changes
git checkout HEAD -- src/components/admin/LeadDetailsModal.tsx
npm run build
```

### Phase 6 Rollback:
```bash
# Revert homeowner validation
git checkout HEAD -- src/app/api/homeowner/leads/[id]/route.ts
# Revert notification creation
git checkout HEAD -- src/app/api/installer/leads/[id]/purchase/route.ts
npm run build
```

### Phase 4 Rollback:
```bash
# Revert UI changes
git checkout HEAD -- src/components/InstallerLeadFeed.tsx
# Revert API changes
git checkout HEAD -- src/app/api/installer/leads/assigned/route.ts
git checkout HEAD -- src/app/installer/(dashboard)/leads/page.tsx
npm run build
```

### Phase 3 Rollback:
```bash
# Delete endpoint
rm src/app/api/installer/leads/purchased/route.ts
# Revert page
git checkout HEAD -- src/app/installer/(dashboard)/purchased-leads/page.tsx
npm run build
```

### Phase 2 Rollback:
```bash
# Revert modal
git checkout HEAD -- src/components/InstallerLeadFeed.tsx
npm run build
```

**After any rollback:** Re-test previous working state before attempting fixes.

---

## PHASE 8: Post-Purchase Enhancements (BUG FIXES + UX)

**Status:** 🔴 Not Started  
**Priority:** 🔥 CRITICAL (Blocks user experience)  
**Goal:** Fix email unlock, add View Details, create tabs in Purchased Leads, update homeowner status label

**Audit Report:** `DOC/Installers/Leadfeed/PHASE8-POST-PURCHASE-AUDIT.md`

---

### 8.1 Fix Contact Email Unlock - Backend

**File:** `src/app/api/installer/leads/assigned/route.ts`

**Current Issue:** Email field missing from API response, causing it to remain locked after purchase

**Implementation:**
```typescript
// Around line 91-95, update homeowner object:
homeowner: {
  name: isPurchased ? lead.homeowner.name : '***LOCKED***',
  phone: isPurchased ? lead.homeowner.phone : '***LOCKED***',
  email: isPurchased ? lead.homeowner.email : '***LOCKED***'  // ADD THIS LINE
},
```

**File:** `src/types/installer.ts`

**Update AssignedLead interface:**
```typescript
export interface AssignedLead {
  // ... existing fields
  homeowner: {
    name: string;
    phone: string;
    email: string;  // ADD THIS LINE
  };
  // ... rest of interface
}
```

**Testing 8.1:**

**⚠️ MANDATORY: Open Browser DevTools - Network Tab**

1. **Setup:**
   - Open browser, press F12 → Network tab
   - Check "Preserve log" checkbox
   - Login as installer

2. **Test Locked Lead (Before Purchase):**
   - Navigate to `/installer/leads`
   - Find GET request to `assigned` in Network tab
   - Click request → Preview/Response tab
   - Expand: `leads[0]` → `homeowner`
   - **VERIFY ALL 4 FIELDS EXIST:**
     ```json
     "homeowner": {
       "id": "...",
       "name": "***LOCKED***",
       "phone": "***LOCKED***",
       "email": "***LOCKED***"  ← MUST EXIST
     }
     ```
   - ❌ FAIL IF: `email` field missing/undefined

3. **Purchase & Test Unlocked:**
   - Click "Unlock Lead", complete purchase
   - Find new GET `assigned` request (after purchase)
   - Expand purchased lead → `homeowner`
   - **VERIFY REAL EMAIL:**
     ```json
     "homeowner": {
       "name": "Real Name",
       "phone": "+614...",
       "email": "real@email.com"  ← REAL EMAIL
     }
     ```

4. **TypeScript Check:**
   ```powershell
   npx tsc --noEmit
   ```

**❌ STOP IF:** Email missing → Fix Prisma query (add `email: true` to select)

**Checkpoint 8.1:** ✅ API returns email field correctly

---

### 8.2 Fix Contact Email Unlock - Frontend

**File:** `src/app/installer/(dashboard)/leads/page.tsx`

**Current Issue:** Mapping function hardcodes email as `***LOCKED***` regardless of purchase status

**Implementation:**
```typescript
// Around line 42, update contact mapping:
contact: {
  name: apiLead.homeowner.name || '***LOCKED***',
  email: apiLead.homeowner.email || '***LOCKED***',  // CHANGE THIS (use real email from API)
  phone: apiLead.homeowner.phone || '***LOCKED***'
},
```

**File:** `src/components/InstallerLeadFeed.tsx` (Line 263)

**Critical Fix - Use isUnlocked property:**
```typescript
// CHANGE FROM:
const isUnlockedByInstaller = lead.unlockedBy.includes(installer.id);

// CHANGE TO:
const isUnlockedByInstaller = lead.isUnlocked;
```

**Why:** The component was checking a legacy `unlockedBy` array instead of the `isUnlocked` boolean property from the API.

**Testing 8.2:**

**Step 1 - Initial State (Before Purchase):**
1. Login as installer
2. Navigate to `/installer/leads`
3. Find assigned CALL_VISIT lead
4. **Verify locked state:**
   - Name: `***LOCKED***` ✅
   - Phone: `***LOCKED***` ✅
   - Email: `***LOCKED***` ✅
   - No green "Contact Details Unlocked" section visible
5. Open DevTools Console - verify no errors
6. Open DevTools Network tab

**Step 2 - Purchase Lead:**
1. Click "Unlock Lead ($25)" button
2. Verify modal opens
3. Click "Pay $25 to Unlock"
4. Watch processing animation (1.5 seconds)
5. **In Network tab, verify:**
   - POST request to `/api/installer/leads/[id]/purchase`
   - Status: 200 OK
   - Response includes: `homeowner.email = "real@email.com"`
6. Watch for "Payment successful!" message
7. Modal should auto-close after 1 second

**Step 3 - Verify Email Unlocked:**
1. After modal closes, lead card should refresh
2. **Verify green unlock banner appears:**
   ```
   🔓 Contact Details Unlocked
   ```
3. **Verify all contact fields visible:**
   - Name: `Mohammad Ikramul nayeem` ✅ (real name)
   - Phone: `+61412952399` ✅ (real phone)
   - Email: `real@email.com` ✅ (REAL EMAIL, NOT ***LOCKED***)
4. **Open DevTools Network tab:**
   - Find GET request to `/api/installer/leads/assigned`
   - Click on request → Preview tab
   - Navigate to homeowner object
   - **Verify it includes:**
     ```json
     "homeowner": {
       "name": "Mohammad Ikramul nayeem",
       "phone": "+61412952399",
       "email": "real@email.com"
     }
     ```
5. **Console check:** No errors

**Step 4 - Refresh Page Test:**
1. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
2. Navigate back to `/installer/leads`
3. Find the purchased lead
4. **Verify contact details persist:**
   - Green unlock banner still shows ✅
   - Name, phone, email all visible ✅
   - Email is NOT `***LOCKED***` ✅

**Step 5 - Other Leads Still Locked:**
1. Scroll to other assigned leads (not purchased)
2. **Verify they remain locked:**
   - No green banner
   - Name: `***LOCKED***`
   - Phone: `***LOCKED***`
   - Email: `***LOCKED***`

**Expected Results:**
- ✅ Email field shows real address after purchase
- ✅ Name and phone also unlocked
- ✅ Green "Contact Details Unlocked" banner appears
- ✅ Unlock persists after page refresh
- ✅ Other leads remain locked
- ✅ No console errors
- ✅ Network tab shows email in API response

**❌ STOP IF:**
- ❌ Email still shows `***LOCKED***` → Check mapping function line 42
- ❌ Green banner doesn't appear → Check `isUnlockedByInstaller` logic (should use `lead.isUnlocked`)
- ❌ API response missing email → Check Task 8.1 backend fix
- ❌ Console errors → Fix JavaScript errors before proceeding

**Checkpoint 8.2:** ✅ Email unlocks correctly after purchase in UI

---

### 8.3 Add View Details Button + Modal

**File:** `src/components/InstallerLeadFeed.tsx`

**Current Issue:** No way to view full lead details after purchase

**Implementation Steps:** Add state, create modal component, add button, render modal

**Testing 8.3:**

**⚠️ MANDATORY: Open Browser DevTools Before Testing**

**Step 1 - Verify Button Appears After Purchase:**
1. Login as installer
2. Navigate to `/installer/leads`
3. Find an unpurchased CALL_VISIT lead
4. **Before purchase:** Scroll to action buttons section
   - Should see "Unlock Lead ($X)" button ✅
   - Should NOT see "View Details" button ❌
5. Click "Unlock Lead", complete purchase (Phase 2 flow)
6. Wait for modal to close and card to refresh
7. **After purchase:** Scroll to contact details section
   - Should see green "🔓 Contact Details Unlocked" banner ✅
   - Name, phone, email all visible (not ***LOCKED***) ✅
   - **NEW:** "View Details" button should appear below contact info ✅
8. **Button styling check:**
   - Uses design system button styles
   - Clear label: "View Details" or "View Full Details"
   - Icon present (optional but recommended)

**Step 2 - Modal Opens Correctly:**
1. Click "View Details" button
2. **Verify modal behavior:**
   - Modal overlay appears with semi-transparent background ✅
   - Modal slides in/fades in smoothly ✅
   - Background content dimmed/blurred ✅
   - Modal is centered on screen ✅
3. **Check DevTools Console:** No errors

**Step 3 - Modal Content Verification:**
1. **Header Section:**
   - Title: "Lead Details" or similar ✅
   - Close button (X) in top-right corner ✅
   - Lead ID or reference number visible ✅

2. **Contact Information Section:**
   - Homeowner Name: Real name (not ***LOCKED***) ✅
   - Phone: Real phone number with proper formatting ✅
   - Email: Real email address (not ***LOCKED***) ✅
   - Section clearly labeled (e.g., "Contact Information") ✅

3. **Property Details Section:**
   - Location/Address ✅
   - Postcode ✅
   - State ✅
   - Property Type ✅
   - Roof Type ✅
   - Budget Range ✅
   - All fields populated (no undefined/null) ✅

4. **Lead Metadata Section:**
   - Quote Type: CALL_VISIT ✅
   - Lead Status ✅
   - Purchase Date with formatting ✅
   - Lead Price ✅
   - Purchase Status: COMPLETED ✅

5. **Styling Check:**
   - Uses design system tokens (--color-*, --spacing-*) ✅
   - Consistent typography (text-body, text-heading-*) ✅
   - Proper spacing between sections ✅
   - Readable contrast ratios ✅
   - No inline styles or hardcoded colors ✅

**Step 4 - Modal Close Functionality:**
1. **Test Close Button:**
   - Click X button in top-right
   - Modal should close with animation ✅
   - Background returns to normal ✅
   - No console errors ✅

2. **Test Overlay Click:**
   - Re-open modal (click "View Details")
   - Click on dark overlay (outside modal)
   - Modal should close ✅

3. **Test Escape Key:**
   - Re-open modal
   - Press Escape key
   - Modal should close ✅

4. **Verify State Reset:**
   - After closing, modal completely unmounts ✅
   - No visual artifacts left behind ✅
   - Lead card remains in purchased state ✅

**Step 5 - Multiple Leads Test:**
1. Navigate back to `/installer/leads`
2. Find another unpurchased lead, purchase it
3. Open "View Details" for FIRST purchased lead
4. Verify correct lead data shows (not mixed up) ✅
5. Close modal
6. Open "View Details" for SECOND purchased lead
7. Verify correct data for second lead ✅
8. **Data integrity check:** Each modal shows unique lead data

**Step 6 - Edge Cases:**
1. **Test with missing optional fields:**
   - Find lead with minimal data (if available)
   - Open View Details
   - Verify graceful handling of missing fields (show "N/A" or hide section) ✅

2. **Test rapid clicking:**
   - Click "View Details" multiple times quickly
   - Should not open multiple modals ✅
   - No console errors ✅

3. **Test during page refresh:**
   - Open modal
   - Refresh page (F5)
   - Navigate back, verify button still works ✅

**Step 7 - TypeScript & Build Validation:**
```powershell
# Check TypeScript
npx tsc --noEmit

# Check build
npm run build
```

**Expected Results:**
- ✅ "View Details" button appears only after purchase
- ✅ Button styled correctly with design system
- ✅ Modal opens with smooth animation
- ✅ All lead data displays correctly
- ✅ Contact details are real (not ***LOCKED***)
- ✅ Modal closes via X, overlay click, and Escape key
- ✅ Multiple leads show correct individual data
- ✅ No console errors at any step
- ✅ TypeScript compiles without errors
- ✅ Build succeeds

**❌ STOP IF:**
- ❌ Button appears before purchase → Check conditional rendering
- ❌ Modal doesn't open → Check state management and event handlers
- ❌ Contact details still show ***LOCKED*** → Verify Task 8.1 & 8.2 fixes
- ❌ Modal shows wrong lead data → Check lead state/props passing
- ❌ Close button doesn't work → Check onClick handlers
- ❌ Console errors → Fix JavaScript errors before proceeding
- ❌ TypeScript errors → Fix type definitions
- ❌ Build fails → Fix compilation errors

**Checkpoint 8.3:** ✅ View Details button works, modal displays all information correctly

---

### 8.4 Create Tabs in Purchased Leads Page

**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Current Issue:** All purchased leads shown in single list, no categorization by lead type

**Implementation:** Add tab state, filtering, and tab UI

**Testing 8.4:**

**⚠️ MANDATORY: Test with Multiple Lead Types**

**Prerequisites:**
- Purchase at least 1 lead of each type:
  - 1 CALL_VISIT lead
  - 1 WRITTEN_QUOTES lead (if available)
  - 1 BIDDING lead (if available)
- If not available, you can still test with existing purchased leads

**Step 1 - Initial Tab Display:**
1. Login as installer
2. Navigate to `/installer/purchased-leads`
3. Wait for page to load completely
4. **Verify tab bar exists:**
   - Should see 3 tabs horizontally aligned ✅
   - Tab labels: "Call/Visit", "Written Quotes", "Bidding" ✅
   - Each tab shows count in parentheses, e.g., "Call/Visit (2)" ✅
5. **Check active tab:**
   - "Call/Visit" tab should be active by default ✅
   - Active tab has different styling (highlighted/underlined) ✅
6. **Open DevTools Console:** Check for no errors

**Step 2 - Tab Styling Verification:**
1. **Active tab styling:**
   - Background color or underline indicator ✅
   - Text color changes (more prominent) ✅
   - Uses design system tokens (--color-primary, etc.) ✅
2. **Inactive tab styling:**
   - Subdued appearance ✅
   - Clear visual distinction from active ✅
   - Hover state changes cursor to pointer ✅
3. **Tab counts:**
   - Each tab shows correct count ✅
   - Count updates dynamically (test later) ✅

**Step 3 - Call/Visit Tab Filtering:**
1. **Verify default state (Call/Visit tab active):**
   - Only CALL_VISIT leads display ✅
   - Count in tab matches number of cards shown ✅
   - If no CALL_VISIT leads: Empty state message ✅
2. **Check lead cards:**
   - Each card shows quoteType badge: "Call/Visit" ✅
   - Contact details visible (not ***LOCKED***) ✅
   - Purchase date displays ✅
3. **Open DevTools Network tab:**
   - Find GET request to `/api/installer/leads/purchased`
   - Click request → Preview
   - Verify response includes leads with `quoteType: "CALL_VISIT"` ✅

**Step 4 - Written Quotes Tab:**
1. Click "Written Quotes" tab
2. **Verify tab switch:**
   - "Written Quotes" tab becomes active (styling changes) ✅
   - "Call/Visit" tab becomes inactive ✅
   - URL updates with query param (optional): `?tab=written` ✅
3. **Verify lead filtering:**
   - Only WRITTEN_QUOTES leads display ✅
   - Count in tab matches number shown ✅
   - If no leads: Empty state with message ✅
4. **Check empty state (if applicable):**
   - Message: "No written quote leads purchased yet" or similar ✅
   - Clear, helpful message ✅
   - No broken UI elements ✅
5. **Console check:** No errors

**Step 5 - Bidding Tab:**
1. Click "Bidding" tab
2. **Verify tab switch:**
   - "Bidding" tab becomes active ✅
   - Other tabs inactive ✅
3. **Verify filtering:**
   - Only BIDDING leads show ✅
   - Count accurate ✅
   - Empty state if no leads ✅
4. **Console check:** No errors

**Step 6 - Tab Switching Rapid Test:**
1. Quickly click between tabs:
   - Call/Visit → Written Quotes ✅
   - Written Quotes → Bidding ✅
   - Bidding → Call/Visit ✅
2. **Verify smooth transitions:**
   - No flickering or layout shifts ✅
   - Content updates immediately ✅
   - No duplicate API calls (check Network tab) ✅
   - Active state updates correctly ✅
3. **Console check:** No errors during rapid switching

**Step 7 - Count Accuracy Verification:**
1. **Manual count check:**
   - Note count shown in "Call/Visit" tab, e.g., (3)
   - Count visible cards in that tab
   - Numbers should match exactly ✅
2. **Repeat for other tabs:**
   - Written Quotes count vs. visible cards ✅
   - Bidding count vs. visible cards ✅
3. **Open DevTools Network tab:**
   - Find `/api/installer/leads/purchased` response
   - Count leads with each quoteType in JSON
   - Compare with tab counts - should match ✅

**Step 8 - Empty State Testing:**
1. If you have a tab with 0 leads:
   - Click that tab
   - **Verify empty state UI:**
     - Icon or illustration (optional) ✅
     - Clear message: "No [type] leads purchased yet" ✅
     - Helpful subtext or CTA (optional) ✅
     - Uses design system styling ✅
2. If all tabs have leads:
   - Note in testing: "Empty state not tested - all tabs have data"

**Step 9 - Page Refresh Persistence:**
1. Select "Written Quotes" tab
2. Refresh page (F5 or Ctrl+R)
3. **After refresh:**
   - If using URL params: Same tab stays active ✅
   - If not: Defaults back to "Call/Visit" (expected) ✅
4. **Console check:** No errors after refresh

**Step 10 - Responsive Design Check:**
1. Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. **Test mobile view (375px):**
   - Tabs stack vertically OR scroll horizontally ✅
   - All tabs accessible (not cut off) ✅
   - Active state still visible ✅
   - Touch-friendly tap targets (min 44x44px) ✅
3. **Test tablet view (768px):**
   - Tabs display appropriately ✅
   - Content readable ✅
4. Return to desktop view

**Step 11 - TypeScript & Build Validation:**
```powershell
# Check TypeScript
npx tsc --noEmit

# Full build
npm run build
```

**Expected Results:**
- ✅ 3 tabs display with correct labels and counts
- ✅ Active tab visually distinct
- ✅ Clicking tab filters leads correctly
- ✅ Only matching quoteType leads show in each tab
- ✅ Counts match actual number of cards
- ✅ Empty state displays when no leads in tab
- ✅ Tab switching smooth with no errors
- ✅ No duplicate API calls
- ✅ Responsive on mobile/tablet
- ✅ No console errors
- ✅ TypeScript compiles
- ✅ Build succeeds

**❌ STOP IF:**
- ❌ Tabs don't appear → Check tab component rendering
- ❌ All leads show in every tab → Check filter logic (quoteType matching)
- ❌ Counts wrong → Check counting logic or API response
- ❌ Active tab not highlighted → Check CSS classes and state
- ❌ Console errors → Fix JavaScript errors
- ❌ Empty state doesn't show → Check conditional rendering
- ❌ TypeScript errors → Fix type definitions
- ❌ Build fails → Fix compilation errors

**Checkpoint 8.4:** ✅ Tabs work, filter correctly, counts accurate

---

### 8.5 Replace Purchased Leads UI with LeadCard

**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Current Issue:** Custom card design inconsistent with main feed

**Implementation:** Import InstallerLeadFeed, create mapping function, replace custom UI

**Testing 8.5:**

**⚠️ MANDATORY: Visual Comparison Required**

**Step 1 - Before Implementation Screenshot:**
1. Navigate to `/installer/purchased-leads`
2. Take screenshot or note current card design
3. Note differences from main leads page

**Step 2 - After Implementation - Initial Load:**
1. Navigate to `/installer/purchased-leads`
2. Wait for page to load completely
3. **Verify InstallerLeadFeed component renders:**
   - Lead cards appear ✅
   - No layout breaks or overflow ✅
   - Page doesn't crash ✅
4. **Open DevTools Console:** Check for no errors

**Step 3 - Visual Consistency Check:**
1. **Split-screen comparison:**
   - Open `/installer/leads` in one tab (main feed)
   - Open `/installer/purchased-leads` in another tab (purchased)
2. **Compare card styling (same for both):**
   - Card border and shadow (theme-card) ✅
   - Border-left color indicator ✅
   - Padding and spacing ✅
   - Typography (font sizes, weights) ✅
   - Color scheme (uses design tokens) ✅
   - Icon styles ✅
3. **Compare sections:**
   - Header section (lead type badge, status) ✅
   - Property details section ✅
   - Contact details section (green banner) ✅
   - Action buttons section ✅
4. **Verify identical layout:** Cards should be visually indistinguishable

**Step 4 - Contact Details Display:**
1. In `/installer/purchased-leads` page
2. Find a purchased CALL_VISIT lead
3. **Verify green unlock banner:**
   - Text: "🔓 Contact Details Unlocked" ✅
   - Green background with proper styling ✅
   - Located above contact fields ✅
4. **Verify contact fields visible:**
   - Name: Real name (NOT ***LOCKED***) ✅
   - Phone: Real phone (NOT ***LOCKED***) ✅
   - Email: Real email (NOT ***LOCKED***) ✅
   - Proper formatting and spacing ✅
5. **Compare with main feed:**
   - Navigate to `/installer/leads`
   - Find same lead (or another purchased lead)
   - Contact section should look identical ✅

**Step 5 - View Details Button Test:**
1. In `/installer/purchased-leads` page
2. Scroll to action buttons in a lead card
3. **Verify "View Details" button:**
   - Button exists and visible ✅
   - Styled correctly (design system) ✅
   - Same position as in main feed ✅
4. Click "View Details"
5. **Verify modal opens:**
   - Modal component renders ✅
   - Shows correct lead data ✅
   - All sections populated ✅
6. Close modal (X button or overlay)
7. Repeat for 2-3 different leads
8. **Console check:** No errors

**Step 6 - Tab Integration Test:**
1. Click "Call/Visit" tab
2. **Verify LeadCard displays:**
   - Only CALL_VISIT leads show ✅
   - Cards use LeadCard component ✅
3. Click "Written Quotes" tab
4. **Verify:**
   - Only WRITTEN_QUOTES leads show ✅
   - Same LeadCard styling ✅
   - Empty state if no leads ✅
5. Click "Bidding" tab
6. **Verify:**
   - Only BIDDING leads show ✅
   - Same LeadCard styling ✅
7. **Consistency check:** All tabs use same card component

**Step 7 - Lead Actions Verification:**
1. In a lead card, check for action buttons
2. **Verify appropriate buttons show:**
   - "View Details" button ✅
   - NO "Unlock Lead" button (already purchased) ✅
   - Any other context-appropriate buttons ✅
3. **Button state check:**
   - All buttons enabled (not disabled) ✅
   - Cursor changes to pointer on hover ✅
4. Test each button's functionality

**Step 8 - Data Mapping Accuracy:**
1. **Open DevTools Network tab**
2. Find GET `/api/installer/leads/purchased` request
3. Click request → Preview tab
4. **Compare API data with UI:**
   - First lead in API response:
     - Check homeowner.name matches card ✅
     - Check homeowner.phone matches card ✅
     - Check homeowner.email matches card ✅
     - Check quoteType matches badge ✅
     - Check purchasedAt matches date shown ✅
5. **Verify no data loss in mapping:** All fields correctly transformed

**Step 9 - Responsive Design Test:**
1. Open DevTools → Toggle device toolbar
2. **Test mobile (375px):**
   - Cards stack vertically ✅
   - All content readable ✅
   - Buttons accessible ✅
   - No horizontal scroll ✅
3. **Test tablet (768px):**
   - Cards display appropriately ✅
   - Tabs work correctly ✅
4. **Test desktop (1440px):**
   - Cards use available space well ✅
   - Layout matches main feed ✅

**Step 10 - Edge Cases:**
1. **Test with 0 purchased leads:**
   - Delete or hide purchased leads (if possible)
   - Verify empty state shows correctly ✅
   - Message clear and helpful ✅
2. **Test with many leads (10+):**
   - Scroll through list ✅
   - No performance issues ✅
   - Infinite scroll or pagination works (if implemented) ✅
3. **Test lead with minimal data:**
   - Find lead with missing optional fields
   - Verify graceful handling (shows "N/A" or hides) ✅

**Step 11 - Cross-Page Navigation:**
1. Start at `/installer/purchased-leads`
2. Click browser back button (or navigate to `/installer/leads`)
3. Verify main feed still works ✅
4. Navigate back to `/installer/purchased-leads`
5. Verify page loads correctly ✅
6. **State persistence check:** Tab selection, scroll position reasonable

**Step 12 - TypeScript & Build Validation:**
```powershell
# Check TypeScript
npx tsc --noEmit

# Full build
npm run build
```

**Expected Results:**
- ✅ Purchased leads page uses InstallerLeadFeed component
- ✅ Cards visually identical to main feed
- ✅ Contact details show real data (not ***LOCKED***)
- ✅ "View Details" button works correctly
- ✅ Tabs filter leads using LeadCard
- ✅ All lead data maps correctly from API
- ✅ Responsive on all screen sizes
- ✅ No console errors
- ✅ TypeScript compiles
- ✅ Build succeeds

**❌ STOP IF:**
- ❌ Cards look different from main feed → Check component import and props
- ❌ Contact details still show ***LOCKED*** → Verify Task 8.1 & 8.2 fixes
- ❌ "View Details" doesn't work → Check Task 8.3 implementation
- ❌ Tabs don't filter → Check filter logic integration
- ❌ Data mapping errors → Fix mapping function
- ❌ Console errors → Fix JavaScript errors
- ❌ TypeScript errors → Fix type definitions
- ❌ Build fails → Fix compilation errors
- ❌ Layout breaks on mobile → Fix responsive styles

**Checkpoint 8.5:** ✅ UI consistent, LeadCard reused, all features work

---

### 8.6 Update Homeowner Status Label

**File:** `src/app/homeowner/dashboard/page.tsx`

**Current Issue:** Status shows "Purchased" instead of user-friendly message

**Implementation:**
```typescript
// Around line 195-199, update PURCHASED status:
[LeadStatusEnum.PURCHASED]: {
  label: 'Responded by an Installer',  // CHANGED
  description: 'An installer will contact you soon',  // CHANGED
  accent: 'bg-primary/10 text-primary border border-primary/30',
},
```

**Testing 8.6:**

**⚠️ MANDATORY: Multi-User Testing Required**

**Prerequisites:**
- Have installer account
- Have homeowner account
- Know credentials for both
- Have at least 1 CALL_VISIT lead assigned to installer, owned by homeowner

**Step 1 - Initial Homeowner State:**
1. Login as homeowner
2. Navigate to homeowner dashboard
3. Find the CALL_VISIT lead (not yet purchased)
4. **Note current status:**
   - Status label (e.g., "New", "Active") ✅
   - Status description ✅
   - Badge color/styling ✅
5. Take screenshot for comparison
6. Logout

**Step 2 - Installer Purchases Lead:**
1. Login as installer
2. Navigate to `/installer/leads`
3. Find the same lead (cross-reference ID or details)
4. Click "Unlock Lead ($X)"
5. Complete purchase flow
6. **Verify purchase success:**
   - Modal shows "Payment successful!" ✅
   - Contact details unlock ✅
7. Logout

**Step 3 - Homeowner Views Updated Status:**
1. Login as homeowner (same account as lead owner)
2. Navigate to homeowner dashboard
3. **Find the purchased lead**
4. **Verify status label changed:**
   - OLD label: "Purchased" or "Active" ❌
   - NEW label: "Responded by an Installer" ✅
   - Case sensitivity correct ✅
   - No typos ✅
5. **Verify status description:**
   - NEW description: "An installer will contact you soon" ✅
   - Clear and reassuring message ✅
   - Grammatically correct ✅
6. **Verify badge styling:**
   - Background: Light blue/primary color ✅
   - Text: Primary color (readable) ✅
   - Border: Subtle primary border ✅
   - Uses design system classes ✅

**Step 4 - Status Badge Visual Check:**
1. **Compare with other statuses:**
   - If you have other leads with different statuses, compare
   - Verify "Responded by an Installer" status is visually distinct ✅
   - Color scheme appropriate (not error red, not success green) ✅
2. **Check responsiveness:**
   - Badge doesn't overflow on mobile ✅
   - Text wraps appropriately ✅

**Step 5 - Notification Check (if applicable):**
1. Check homeowner notifications
2. **Verify notification about purchase:**
   - Title: "Installer Responded to Your Request" (from Phase 6) ✅
   - Message matches new status concept ✅
   - Notification marked as unread ✅
3. Click notification
4. Verify navigates to lead details or dashboard ✅

**Step 6 - Lead Details Page Check:**
1. From dashboard, click on the purchased lead
2. Navigate to lead details page
3. **Verify status label shows:**
   - Same label: "Responded by an Installer" ✅
   - Same description: "An installer will contact you soon" ✅
   - Consistent styling ✅
4. **Check for any status timeline:**
   - If timeline exists, verify "Responded by an Installer" appears ✅
   - Timestamp shows purchase date/time ✅

**Step 7 - Multiple Leads Scenario:**
1. If homeowner has multiple leads:
   - Purchase another lead as installer
   - Return to homeowner dashboard
   - **Verify both show correct status:**
     - Both say "Responded by an Installer" ✅
     - Statuses independent (not shared state) ✅
2. If homeowner has unpurchased leads:
   - Verify they still show "New" or "Active" ✅
   - Only purchased leads show new status ✅

**Step 8 - Edge Case - Different Status Values:**
1. **Check status enum mapping:**
   - Open DevTools Network tab
   - Find API request that fetches homeowner leads
   - Click request → Preview tab
   - Find purchased lead in response
   - **Verify status field:**
     - Value: "PURCHASED" (enum) ✅
     - Maps to "Responded by an Installer" (label) ✅
2. **Test other status values don't break:**
   - Find leads with status: NEW, ACTIVE, CANCELLED, etc.
   - Verify they still display correctly ✅

**Step 9 - Accessibility Check:**
1. **Keyboard navigation:**
   - Tab through dashboard
   - Status badge should be keyboard accessible (if interactive) ✅
2. **Screen reader test (if possible):**
   - Use browser screen reader or NVDA/JAWS
   - Verify status announced as "Responded by an Installer" ✅
   - Description also announced ✅
3. **Color contrast:**
   - Use browser DevTools Accessibility panel
   - Check contrast ratio meets WCAG AA (4.5:1 min) ✅

**Step 10 - TypeScript & Build Validation:**
```powershell
# Check TypeScript
npx tsc --noEmit

# Full build
npm run build
```

**Expected Results:**
- ✅ Status label changed to "Responded by an Installer"
- ✅ Description changed to "An installer will contact you soon"
- ✅ Badge styling uses design system (primary color theme)
- ✅ Status shows consistently across dashboard and details page
- ✅ Only purchased leads show new status
- ✅ Unpurchased leads retain original status
- ✅ Notification matches new status concept
- ✅ No console errors
- ✅ TypeScript compiles
- ✅ Build succeeds
- ✅ Accessible to keyboard and screen readers
- ✅ Color contrast meets WCAG AA

**❌ STOP IF:**
- ❌ Status still says "Purchased" → Check status enum mapping in code
- ❌ Description wrong or missing → Verify status config object
- ❌ Styling wrong (wrong colors) → Check design system class names
- ❌ Status doesn't update after purchase → Check API response and state
- ❌ Other statuses broken → Verify enum mapping for all status values
- ❌ Console errors → Fix JavaScript errors
- ❌ TypeScript errors → Fix type definitions
- ❌ Build fails → Fix compilation errors
- ❌ Poor contrast → Adjust colors to meet WCAG standards

**Checkpoint 8.6:** ✅ Homeowner sees user-friendly status label

---

### 8.7 End-to-End Testing

**⚠️ MANDATORY: Complete System Integration Test**

**Complete Flow Test:**

**Test 1: Single Purchase Flow (Full Journey)**

**Part A - Setup:**
1. Login as admin
2. Create new CALL_VISIT lead or verify existing
3. Assign to test installer
4. Note lead ID for tracking
5. Logout

**Part B - Installer Purchase:**
1. Login as installer (assigned to lead)
2. Navigate to `/installer/leads`
3. Find assigned CALL_VISIT lead
4. **Verify locked state:**
   - Contact shows ***LOCKED*** ✅
   - "Unlock Lead ($X)" button visible ✅
5. Click "Unlock Lead ($X)"
6. **Verify purchase flow:**
   - Modal opens ✅
   - Lead details display ✅
   - Price shown correctly ✅
7. Click "Pay $X to Unlock"
8. **Verify processing:**
   - Loading state (1.5s) ✅
   - DevTools Network: POST `/api/installer/leads/[id]/purchase` → 200 ✅
9. **Verify success:**
   - "Payment successful!" message ✅
   - Modal auto-closes ✅
10. **Verify unlock in UI:**
    - Green banner "🔓 Contact Details Unlocked" ✅
    - Real name, phone, email visible ✅
    - Email NOT ***LOCKED*** ✅
11. **Verify "View Details" appears:**
    - Button visible below contact ✅
    - Click button → Modal opens ✅
    - All lead data correct ✅
    - Close modal ✅
12. Navigate to `/installer/purchased-leads`
13. **Verify purchased page:**
    - Lead appears in "Call/Visit" tab ✅
    - Contact details visible ✅
    - "View Details" works ✅
14. Logout

**Part C - Homeowner Notification:**
1. Login as homeowner (owner of purchased lead)
2. Navigate to homeowner dashboard
3. **Verify notification:**
   - Notification badge/indicator ✅
   - Open notifications ✅
   - Message: "Installer Responded to Your Request" ✅
4. **Verify status updated:**
   - Lead shows "Responded by an Installer" ✅
   - Description: "An installer will contact you soon" ✅
   - Badge styled correctly ✅
5. **Verify edit blocked:**
   - Try to edit lead → Blocked/disabled ✅
   - Try to cancel lead → Blocked ✅
   - Error message clear ✅
6. Logout

**Part D - Admin View:**
1. Login as admin
2. Navigate to admin leads page
3. Find the purchased lead
4. Click to open lead details modal
5. **Verify purchase info section:**
   - Section titled "Purchase Information" ✅
   - Installer company name ✅
   - Purchase date formatted ✅
   - Purchase status: COMPLETED ✅
   - Lead price ✅
6. Close modal
7. Logout

**✅ Test 1 Result:** Single purchase flow works end-to-end

---

**Test 2: Multi-Installer Scenario**

**Setup:**
1. Login as admin
2. Create/select CALL_VISIT lead
3. Assign to Installer A AND Installer B
4. Logout

**Part A - Installer A Purchases:**
1. Login as Installer A
2. Navigate to `/installer/leads`
3. Find lead, verify unlockable ✅
4. Purchase lead (full flow)
5. Verify success ✅
6. Logout

**Part B - Installer B Blocked:**
1. Login as Installer B
2. Navigate to `/installer/leads`
3. Find same lead
4. **Verify blocked state:**
   - Red banner: "⛔ This lead has been purchased by another installer" ✅
   - Card dimmed/opacity reduced ✅
   - "Unlock Lead" button disabled/hidden ✅
5. **DevTools check:**
   - Network: GET `/api/installer/leads/assigned`
   - Response includes `isPurchasedByAnother: true` ✅
6. Try clicking purchase button (should not work) ✅
7. Logout

**✅ Test 2 Result:** Multi-installer protection works

---

**Test 3: Different Lead Types**

**Part A - Written Quote Lead:**
1. Login as admin
2. Create WRITTEN_QUOTES lead
3. Assign to installer
4. Logout
5. Login as installer
6. Purchase lead (if purchase flow applies to this type)
7. Navigate to `/installer/purchased-leads`
8. Click "Written Quotes" tab
9. **Verify:**
   - Lead appears in correct tab ✅
   - Badge shows "Written Quotes" ✅
   - Contact details visible ✅
10. Logout

**Part B - Bidding Lead:**
1. Repeat steps for BIDDING lead type
2. **Verify:**
   - Appears in "Bidding" tab ✅
   - Badge shows "Bidding" ✅
   - All features work ✅

**✅ Test 3 Result:** All lead types handled correctly

---

**Test 4: Performance & Load Testing**

**Part A - Many Leads Test:**
1. Login as installer with 15+ purchased leads (or create via admin)
2. Navigate to `/installer/purchased-leads`
3. **Measure performance:**
   - Page loads in < 2 seconds ✅
   - No lag when switching tabs ✅
   - Smooth scrolling ✅
4. Open DevTools Performance tab
5. Record profile while switching tabs
6. **Verify:**
   - No long tasks (>50ms) ✅
   - No memory leaks ✅

**Part B - Concurrent Actions:**
1. Have 2 installers in separate browsers
2. Assign same lead to both
3. Both click "Unlock Lead" simultaneously
4. **Verify:**
   - Only 1 purchase succeeds ✅
   - Other gets error message ✅
   - No duplicate charges ✅

**✅ Test 4 Result:** Performance acceptable, race conditions handled

---

**Test 5: Cross-Browser Testing**

**Browsers to Test:**
- Chrome/Edge (Chromium)
- Firefox
- Safari (if Mac available)

**For Each Browser:**
1. Complete Test 1 (Single Purchase Flow)
2. **Verify:**
   - All styling renders correctly ✅
   - Modals open/close properly ✅
   - Tabs work ✅
   - No browser console errors ✅
   - DevTools Network shows correct API calls ✅

**✅ Test 5 Result:** Works in all major browsers

---

**Test 6: Mobile Responsive Testing**

**Part A - Mobile (375px):**
1. Open DevTools → Toggle device toolbar
2. Select iPhone SE or similar (375px width)
3. Complete purchase flow
4. **Verify:**
   - Modal fits screen ✅
   - Buttons tappable (min 44x44px) ✅
   - Text readable (min 16px) ✅
   - No horizontal scroll ✅
   - Tabs accessible ✅
   - Cards stack vertically ✅

**Part B - Tablet (768px):**
1. Select iPad or similar
2. Navigate through all pages
3. **Verify:**
   - Layout adapts well ✅
   - Tabs display properly ✅
   - Touch targets appropriate ✅

**Part C - Touch Interactions:**
1. Use real mobile device (if available)
2. Test tap, swipe, scroll
3. **Verify:**
   - All interactions work ✅
   - No ghost clicks ✅
   - Modals dismissible ✅

**✅ Test 6 Result:** Fully responsive on all screen sizes

---

**Test 7: Edge Cases & Error Handling**

**Case A - Network Failure:**
1. Open DevTools Network tab
2. Set throttling to "Offline"
3. Try to purchase lead
4. **Verify:**
   - Error message displays ✅
   - User informed of network issue ✅
   - Can retry after reconnecting ✅

**Case B - Expired Lead:**
1. Set lead expiration to past date (admin)
2. Try to purchase as installer
3. **Verify:**
   - Purchase blocked ✅
   - Clear error message ✅

**Case C - Insufficient Funds (if implemented):**
1. Set installer balance to $0 (if balance system exists)
2. Try to purchase
3. **Verify:**
   - Error message ✅
   - Redirected to add funds (if applicable) ✅

**Case D - Malformed Data:**
1. Use browser console to corrupt state
2. Try various actions
3. **Verify:**
   - App doesn't crash ✅
   - Graceful error handling ✅

**✅ Test 7 Result:** Edge cases handled gracefully

---

**Test 8: Build & Deploy Validation**

**Part A - TypeScript Check:**
```powershell
npx tsc --noEmit
```
**Expected:** 0 errors ✅

**Part B - Production Build:**
```powershell
npm run build
```
**Expected:**
- Build completes successfully ✅
- 0 errors, 0 warnings ✅
- Build time reasonable (< 2 minutes) ✅

**Part C - Build Output Verification:**
```powershell
# Start production server
npm run start
```
**Test in production mode:**
1. Complete full purchase flow
2. **Verify:**
   - All features work identically ✅
   - No console errors ✅
   - Performance same or better ✅

**Part D - Environment Variables Check:**
```powershell
# Verify all required env vars set
cat .env.local
```
**Verify:**
- Database URL ✅
- NextAuth secret ✅
- Any API keys ✅

**✅ Test 8 Result:** Production build successful, ready to deploy

---

## PHASE 8 - E2E Test Results Summary

**Test Results Matrix:**

| Test | Status | Notes |
|------|--------|-------|
| 1. Single Purchase Flow | ⬜ | Full journey: Installer → Homeowner → Admin |
| 2. Multi-Installer | ⬜ | Protection against duplicate purchase |
| 3. Different Lead Types | ⬜ | Call/Visit, Written, Bidding |
| 4. Performance | ⬜ | Load time, concurrent actions |
| 5. Cross-Browser | ⬜ | Chrome, Firefox, Safari |
| 6. Mobile Responsive | ⬜ | 375px, 768px, 1440px |
| 7. Edge Cases | ⬜ | Network failures, expired leads |
| 8. Build & Deploy | ⬜ | Production build validation |

**Sign-Off Criteria:**
- ✅ All 8 tests passed
- ✅ No critical bugs found
- ✅ Performance acceptable (< 2s page loads)
- ✅ Build succeeds with 0 errors
- ✅ All user flows work end-to-end
- ✅ Design system compliance verified
- ✅ Accessibility standards met (WCAG AA)

**Checkpoint 8.7:** ✅ ALL TESTS PASS - Phase 8 Complete

---

## PHASE 8 COMPLETION CHECKLIST

- [ ] Task 8.1: Email field added to assigned API
- [ ] Task 8.2: Email unlocks in UI after purchase
- [ ] Task 8.3: View Details button works with modal
- [ ] Task 8.4: Tabs created in Purchased Leads page
- [ ] Task 8.5: LeadCard reused for UI consistency
- [ ] Task 8.6: Homeowner status label updated
- [ ] Task 8.7: All E2E tests pass
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] No console errors
- [ ] All existing features work

---

## Phase 8 Rollback

```bash
# Task 8.6 Rollback
git checkout HEAD -- src/app/homeowner/dashboard/page.tsx

# Task 8.5 Rollback
git checkout HEAD -- src/app/installer/(dashboard)/purchased-leads/page.tsx

# Task 8.4 Rollback  
git checkout HEAD -- src/app/installer/(dashboard)/purchased-leads/page.tsx

# Task 8.3 Rollback
git checkout HEAD -- src/components/InstallerLeadFeed.tsx

# Task 8.2 Rollback
git checkout HEAD -- src/app/installer/(dashboard)/leads/page.tsx

# Task 8.1 Rollback
git checkout HEAD -- src/app/api/installer/leads/assigned/route.ts
git checkout HEAD -- src/types/installer.ts

npm run build
```

---

## PHASE 9: Admin Lead Assignment Flow Fix

**Date:** November 26, 2025  
**Goal:** Fix admin lead assignment workflow to be single-step  
**Audit Report:** `DOC/ADMIN/ADMIN-LEAD-ASSIGNMENT-AUDIT.md`

### Issues Being Fixed:
1. ❌ Remove redundant "Actions" section (Approve/Reject buttons)
2. ❌ Fix double-attempt requirement (Approve → fails → Save Changes → works)
3. ❌ Fix countdown ignoring admin input (uses default 6-7 days instead of specified)

### Expected Outcome:
- ✅ Single "Manage Lead" button opens modal
- ✅ One click "Approve & Assign" completes entire flow
- ✅ Countdown uses admin-specified days
- ✅ Installers see lead immediately in feed

---

### Task 9.1: Remove Redundant Actions Section

**Goal:** Clean up admin lead detail page by removing duplicate approval UI

**File:** `src/app/admin/leads/[id]/page.tsx`

**Changes Required:**
1. Remove "Actions" section div (lines showing Approve/Reject buttons for DRAFT/PENDING statuses)
2. Remove `showApproveModal` state variable
3. Remove `showRejectModal` state variable
4. Remove standalone `handleApprove()` function
5. Remove standalone `handleReject()` function
6. Remove approve modal JSX (the one triggered by showApproveModal)
7. Remove reject modal JSX (the one triggered by showRejectModal)

**Keep:**
- "Manage Lead" button
- `showManagementModal` state
- AdminLeadManagementModal component
- Assignment History section

**Implementation:**
```typescript
// DELETE THIS ENTIRE BLOCK (around line 1000):
{(['DRAFT', 'PENDING_APPROVAL', 'PENDING_PHONE'].includes(lead.status)) && (
  <div className="p-6 rounded-lg bg-surface shadow-neu-outset">
    <h2 className="text-heading-3 mb-4 text-foreground">
      Actions
    </h2>
    <div className="space-y-3">
      <Button onClick={() => setShowApproveModal(true)}>
        <CheckIcon />
        Approve Lead
      </Button>
      <Button onClick={() => setShowRejectModal(true)}>
        <XIcon />
        Reject Lead
      </Button>
    </div>
  </div>
)}

// DELETE STATE VARIABLES (around line 180):
const [showApproveModal, setShowApproveModal] = useState(false);
const [showRejectModal, setShowRejectModal] = useState(false);

// DELETE OLD HANDLERS (around line 215-290):
const handleApprove = async () => { ... }
const handleReject = async () => { ... }

// DELETE STANDALONE MODALS (around line 1050-1130):
{showApproveModal && ( ... )}
{showRejectModal && ( ... )}
```

**Testing:**
1. Open any lead in DRAFT/PENDING_APPROVAL status
2. Verify: ONLY "Manage Lead" button visible in right column
3. Verify: NO "Actions" section with Approve/Reject buttons
4. Click "Manage Lead" → modal opens correctly
5. Check console: no errors

**Expected Result:**
- ✅ Clean UI with single entry point ("Manage Lead")
- ✅ No duplicate approval options
- ✅ Modal still opens and functions

**❌ STOP:** If modal doesn't open or console shows errors

---

### Task 9.2: Fix onApprove Handler Data Flow

**Goal:** Pass modal data (installers, countdown) to approval API

**File:** `src/app/admin/leads/[id]/page.tsx`

**Current Problem (around line 1148):**
```typescript
onApprove={async (data: any) => {
  await handleApprove(); // ❌ Calls handler with NO data
  setShowManagementModal(false);
}}
```

**Fix:**
```typescript
onApprove={async (data: {
  enableCountdown: boolean;
  countdownDays: number;
  price?: number;
  installerIds: string[];
  mode: 'exclusive' | 'competitive';
  notes?: string;
  notifyInstallers: boolean;
}) => {
  try {
    // Validate installer selection
    if (!data.installerIds || data.installerIds.length === 0) {
      alert('Please select at least one installer');
      return;
    }

    const response = await fetch(`/api/leads/${lead.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: data.price || parseFloat(leadPrice),
        assignTo: data.installerIds, // ✅ Pass installer IDs
        enableCountdown: data.enableCountdown,
        countdownDays: data.countdownDays, // ✅ Use modal value
        assignmentNotes: data.notes,
        isHot: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve and assign lead');
    }

    const result = await response.json();
    
    // Show success message
    alert(`Lead assigned successfully! Countdown: ${data.countdownDays} days`);
    
    // Refresh lead data to show assignments
    await fetchLead();
    
    // Close modal
    setShowManagementModal(false);
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to approve lead');
    // Don't close modal on error - let user try again
  }
}}
```

**Testing:**
1. Open lead detail page (PENDING_APPROVAL status)
2. Click "Manage Lead"
3. Modal opens
4. Select 2 installers
5. Set countdown to 3 days
6. Set price to £30
7. Open DevTools Network tab
8. Click "Approve & Assign" button (we'll update button in next task)
9. Check Network tab:
   - POST `/api/leads/[id]/approve`
   - Request body should show:
     ```json
     {
       "price": 30,
       "assignTo": ["id1", "id2"],
       "enableCountdown": true,
       "countdownDays": 3,
       "assignmentNotes": "...",
       "isHot": false
     }
     ```
10. Check response: success message
11. Modal closes
12. Assignment History section updates

**Expected Results:**
- ✅ Request body includes `assignTo` array
- ✅ `countdownDays` = 3 (not 6 or 7)
- ✅ Response success
- ✅ Lead status changes to APPROVED
- ✅ Assignment History shows 2 installers

**❌ STOP:** If request body missing fields or response fails

---

### Task 9.3: Update AdminLeadManagementModal Button Logic

**Goal:** Show single "Approve & Assign" button for unapproved leads

**File:** `src/components/admin/AdminLeadManagementModal.tsx`

**Find Footer Section** (around line 943-1000):
Current has confusing dual buttons:
- "Approve" (for unapproved leads)
- "Save Changes" (for approved leads)

**Replace Footer** with conditional logic:

```typescript
{/* Footer: Summary & Actions */}
<div className="border-t border-border p-6">
  {/* Summary */}
  <div className="mb-4 p-4 rounded-lg bg-surface shadow-neu-inset">
    <h4 className="text-body-small mb-2 text-foreground">Assignment Summary</h4>
    <div className="space-y-2 text-body-small">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Selected Installers:</span>
        <span className="text-foreground">{selectedInstallerIds.length}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Mode:</span>
        <span className="text-foreground capitalize">{assignmentMode}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Countdown:</span>
        <span className="text-foreground">
          {countdownEnabled ? `${countdownDays} days` : 'Disabled'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Lead Price:</span>
        <span className="text-foreground">£{price || '0'}</span>
      </div>
    </div>
  </div>

  {/* Action Buttons - Conditional based on lead status */}
  <div className="flex gap-3">
    {(['DRAFT', 'PENDING_APPROVAL', 'PENDING_PHONE'].includes(lead.status)) ? (
      // Unapproved lead - single button for approve + assign
      <Button
        onClick={() => {
          if (selectedInstallerIds.length === 0) {
            alert('Please select at least one installer before approving');
            return;
          }
          if (!price || parseFloat(price) <= 0) {
            alert('Please set a valid lead price');
            return;
          }
          
          onApprove({
            enableCountdown: countdownEnabled,
            countdownDays: countdownDays,
            price: parseFloat(price),
            installerIds: selectedInstallerIds,
            mode: assignmentMode,
            notes: assignmentNotes,
            notifyInstallers: true,
          });
        }}
        disabled={selectedInstallerIds.length === 0 || !price}
        variant="primary"
        className="flex-1 bg-success text-success-foreground"
      >
        <CheckIcon />
        ✅ Approve & Assign to {selectedInstallerIds.length} Installer(s)
      </Button>
    ) : (
      // Already approved - allow assignment updates
      <Button
        onClick={() => {
          if (selectedInstallerIds.length === 0) {
            alert('Please select at least one installer');
            return;
          }
          
          onAssign({
            installerIds: selectedInstallerIds,
            mode: assignmentMode,
            notes: assignmentNotes,
            notifyInstallers: true,
          });
        }}
        disabled={selectedInstallerIds.length === 0}
        variant="primary"
        className="flex-1 bg-info text-info-foreground"
      >
        <SaveIcon />
        💾 Update Assignments
      </Button>
    )}
    
    <Button onClick={onClose} variant="secondary" className="px-8">
      Cancel
    </Button>
  </div>
</div>
```

**Testing:**
1. Open PENDING_APPROVAL lead
2. Click "Manage Lead"
3. Verify button text: "✅ Approve & Assign to 0 Installer(s)"
4. Verify button is DISABLED (no installers selected)
5. Select 1 installer
6. Verify button text updates: "✅ Approve & Assign to 1 Installer(s)"
7. Verify button is ENABLED
8. Select 2nd installer
9. Verify button text: "✅ Approve & Assign to 2 Installer(s)"
10. Set countdown to 3 days
11. Set price to £25
12. Verify summary shows: 2 installers, 3 days, £25
13. Click "Approve & Assign" button
14. Verify success message
15. Open APPROVED lead with assignments
16. Click "Manage Lead"
17. Verify button text: "💾 Update Assignments"

**Expected Results:**
- ✅ Button label changes based on lead status
- ✅ Button disabled when no installers selected
- ✅ Summary shows all settings correctly
- ✅ Validation prevents empty submissions
- ✅ Success flow works for both new and existing assignments

**❌ STOP:** If button doesn't update or validation fails

---

### Task 9.4: End-to-End Integration Test

**Goal:** Verify complete single-step workflow

**Test Scenario 1: New Lead Assignment**

**Prerequisites:**
- Fresh lead in PENDING_APPROVAL status (not yet approved)
- At least 2 verified installers in system
- Have 2 browser windows ready: Admin + Installer

**Steps:**
1. **Admin Window:**
   - Login as admin
   - Navigate to `/admin/leads`
   - Click on pending lead
   - Verify: Only "Manage Lead" button visible (no "Actions" section)
   
2. **Open Management Modal:**
   - Click "Manage Lead"
   - Modal opens
   
3. **Configure Assignment:**
   - Pricing section: Verify price pre-filled (e.g., £25)
   - Installer section: Select 2 installers
   - Countdown: Change to **3 days**
   - Mode: Select "Competitive"
   - Notes: Enter "Test assignment"
   
4. **Verify Summary:**
   - Selected Installers: 2
   - Mode: competitive
   - Countdown: 3 days
   - Lead Price: £25
   
5. **Submit:**
   - Click "✅ Approve & Assign to 2 Installer(s)"
   - Wait for success alert: "Lead assigned successfully! Countdown: 3 days"
   - Modal closes
   
6. **Verify Admin View:**
   - Lead status badge: APPROVED
   - Assignment History section shows 2 installers
   - Each installer row shows: company name, email, "Assigned" status
   - Countdown timer shows: "3 days left" (not 6 or 7)
   
7. **Installer Window:**
   - Login as one of the assigned installers
   - Navigate to `/installer/leads`
   - **Within 5 seconds:** Verify lead appears in feed
   - Check lead card:
     - Contact: Masked (***LOCKED***)
     - Location visible
     - "Purchase" button enabled
     - Countdown: "3 days left"
   
8. **DevTools Verification:**
   - Admin DevTools → Network tab
   - Find: POST `/api/leads/[id]/approve`
   - Request body should include:
     ```json
     {
       "assignTo": ["installer-id-1", "installer-id-2"],
       "countdownDays": 3,
       "enableCountdown": true,
       "price": 25
     }
     ```
   - Response: 200 OK with success message

**Expected Results:**
- ✅ Single-step process (no second attempt needed)
- ✅ Countdown = 3 days (as specified, not default)
- ✅ Both installers see lead immediately
- ✅ Assignment History accurate
- ✅ No console errors
- ✅ All timestamps correct

**❌ STOP:** If any step fails, double attempts required, or countdown wrong

---

**Test Scenario 2: Update Existing Assignment**

**Prerequisites:**
- Lead already APPROVED with 1 installer assigned

**Steps:**
1. Open lead detail page
2. Click "Manage Lead"
3. Verify button text: "💾 Update Assignments" (not Approve)
4. Select 1 additional installer (total 2 now)
5. Click "Update Assignments"
6. Verify success message
7. Assignment History shows 2 installers
8. Check 2nd installer's feed → lead visible
9. Verify countdown UNCHANGED (uses original expiresAt)

**Expected Results:**
- ✅ Can add installers to already-approved lead
- ✅ Countdown doesn't reset
- ✅ All installers see lead

**❌ STOP:** If countdown resets or assignments don't update

---

**Test Scenario 3: Validation & Edge Cases**

**Test 3.1: No Installers Selected**
1. Open modal
2. Don't select any installers
3. Verify button DISABLED
4. Try clicking (should not work)

**Test 3.2: Invalid Price**
1. Open modal
2. Select installers
3. Clear price field or set to 0
4. Verify button DISABLED or shows error

**Test 3.3: Countdown Edge Cases**
1. Set countdown to 1 day → should work
2. Set countdown to 30 days → should work
3. Set countdown to 0 days → should show error
4. Set countdown to 100 days → should show error (if max limit exists)

**Test 3.4: Network Failure**
1. Open modal
2. Select installers
3. Open DevTools → Network tab → Set to "Offline"
4. Click "Approve & Assign"
5. Verify error message
6. Verify modal stays open (doesn't close on error)
7. Set network back to "Online"
8. Click button again
9. Should succeed

**Expected Results:**
- ✅ All validations work
- ✅ Clear error messages
- ✅ Modal doesn't close on error
- ✅ Can retry after fixing issues

---

### Task 9.5: Build & Type Check

**Commands:**
```bash
# TypeScript validation
npx tsc --noEmit

# Build validation
npm run build

# Start dev server
npm run dev
```

**Expected Results:**
- ✅ 0 TypeScript errors
- ✅ Build succeeds
- ✅ No build warnings related to our changes
- ✅ Dev server starts without errors

**Check for:**
- Missing imports
- Type mismatches
- Unused variables
- Console errors in browser

**❌ STOP:** If build fails or TypeScript errors

---

### Task 9.6: Regression Testing

**Goal:** Ensure existing features still work

**Test Checklist:**

**Admin Features:**
- [ ] Can view leads list
- [ ] Can filter leads by status
- [ ] Can search leads
- [ ] Can view lead details
- [ ] Can edit lead price (outside modal)
- [ ] Can add admin notes (outside modal)
- [ ] Can archive/unarchive leads
- [ ] Can reset countdown timer
- [ ] Can resell purchased leads

**Installer Features:**
- [ ] Can view assigned leads feed
- [ ] Can purchase leads
- [ ] Email unlocks after purchase
- [ ] Can view purchased leads
- [ ] Countdown timer displays correctly

**Homeowner Features:**
- [ ] Can submit new leads
- [ ] Can view lead status
- [ ] Receives notifications

**System:**
- [ ] No console errors on any page
- [ ] No network request failures
- [ ] Notifications working
- [ ] Audit logs created

**❌ STOP:** If any existing feature broken

---

## PHASE 9 TESTING SUMMARY

### Critical Tests:
1. ✅ Single-step assignment works
2. ✅ Countdown uses admin input (not default)
3. ✅ Installers see leads immediately
4. ✅ No double-attempt required
5. ✅ "Actions" section removed
6. ✅ Build succeeds
7. ✅ No regressions

### Test Results Table:

| Test | Status | Notes |
|------|--------|-------|
| Remove Actions Section | ⬜ | UI cleanup |
| Pass Modal Data | ⬜ | onApprove handler |
| Update Button Logic | ⬜ | Conditional rendering |
| Single-Step Assignment | ⬜ | E2E test |
| Countdown Accuracy | ⬜ | 3 days test |
| Update Assignment | ⬜ | Add installer |
| Validations | ⬜ | Edge cases |
| Build & Types | ⬜ | npm run build |
| Regression Tests | ⬜ | Existing features |

**Sign-Off Criteria:**
- ✅ All 9 tests passed
- ✅ No duplicate approval flows
- ✅ Countdown accuracy verified
- ✅ Build succeeds with 0 errors
- ✅ All existing features work
- ✅ No console errors
- ✅ Performance acceptable

**Checkpoint 9.6:** ✅ ALL TESTS PASS - Phase 9 Complete

---

## PHASE 9 COMPLETION CHECKLIST

- [ ] Task 9.1: Actions section removed
- [ ] Task 9.2: onApprove handler passes data correctly
- [ ] Task 9.3: Modal button logic updated
- [ ] Task 9.4: E2E tests pass
- [ ] Task 9.5: Build succeeds
- [ ] Task 9.6: Regression tests pass
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Single-step assignment works
- [ ] Countdown uses admin input

---

## Phase 9 Rollback

```bash
# Full rollback
git checkout HEAD -- src/app/admin/leads/[id]/page.tsx
git checkout HEAD -- src/components/admin/AdminLeadManagementModal.tsx

# Verify
npm run build

# Test
npm run dev
```

**Alternative: Revert specific commits**
```bash
git log --oneline -5  # Find Phase 9 commits
git revert <commit-hash>
npm run build
```

---

**End of Phase 9 - Admin Lead Assignment Flow Fix**

---

## PHASE 9.7: Enable Countdown Timer Update (NEW)

**Date:** November 26, 2025  
**Goal:** Allow admin to update countdown timer to specific value (e.g., 30 days → 3 days)  
**Audit Report:** `DOC/ADMIN/COUNTDOWN-TIMER-UPDATE-AUDIT.md`

### Current Problem:
- ❌ Admin can only "extend" timer (add days), cannot set to specific value
- ❌ Countdown input in modal is editable but has no save action
- ❌ "Extend Timer" button adds days instead of setting countdown

### Expected Solution:
- ✅ Admin can update countdown from 30 days to 3 days directly
- ✅ "Update Countdown" button next to countdown input
- ✅ New API endpoint: POST `/api/leads/[id]/update-countdown`
- ✅ Separate from "Extend Timer" (which adds days)

---

### Task 9.7.1: Create Update Countdown Service Function

**Goal:** Add service function to set countdown to specific days

**File:** `src/lib/services/lead-service.ts` (add new function)

**Implementation:**
```typescript
/**
 * Update lead countdown timer to specific number of days from now
 * @param leadId - Lead ID
 * @param days - Number of days (absolute, not relative)
 * @param updatedBy - Admin user ID
 */
export async function updateLeadCountdown(
  leadId: string,
  days: number,
  updatedBy: string
) {
  // 1. Validate inputs
  if (!leadId || !updatedBy) {
    throw new Error('leadId and updatedBy are required');
  }

  if (typeof days !== 'number' || days < 1 || days > 90) {
    throw new Error('days must be between 1 and 90');
  }

  // 2. Check lead exists
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      assignments: {
        include: {
          installer: {
            include: {
              installerVerification: true,
            },
          },
        },
      },
    },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  // 3. Only allow for approved/assigned leads
  if (!['APPROVED', 'ASSIGNED'].includes(lead.status)) {
    throw new Error('Can only update countdown for approved or assigned leads');
  }

  // 4. Calculate new expiry date (absolute, not relative)
  const now = new Date();
  const newExpiryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

  // 5. Update lead
  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      expiresAt: newExpiryDate,
      updatedAt: now,
    },
    include: {
      homeowner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
        include: {
          installer: {
            include: {
              installerVerification: true,
            },
          },
        },
      },
    },
  });

  // 6. Log action for audit
  console.log(`✅ [Lead Service] Countdown updated for lead ${leadId}:`, {
    newExpiryDate: newExpiryDate.toISOString(),
    daysSet: days,
    updatedBy,
  });

  return {
    lead: updatedLead,
    newExpiryDate,
    daysSet: days,
  };
}
```

**Testing:**
```bash
# TypeScript check
npx tsc --noEmit

# Expected: No errors in lead-service.ts
```

**❌ STOP:** If TypeScript errors

---

### Task 9.7.2: Create Update Countdown API Endpoint

**Goal:** New API route to handle countdown updates

**File:** `src/app/api/leads/[id]/update-countdown/route.ts` (NEW)

**Implementation:**
```typescript
/**
 * POST /api/leads/[id]/update-countdown
 * 
 * Purpose: Update lead countdown timer to specific days (absolute, not relative)
 * Difference from reset-timer: This SETS countdown, reset-timer ADDS days
 * Auth: ADMIN role required
 * 
 * Body:
 * - days: number - Number of days from now (1-90)
 * 
 * Returns: Updated lead with new expiry date
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateLeadCountdown } from '@/lib/services/lead-service';
import { UserRole } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Check admin role
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json().catch(() => ({}));
    const { days } = body;

    // 4. Validate days
    if (!days) {
      return NextResponse.json(
        { error: 'days parameter is required' },
        { status: 400 }
      );
    }

    if (typeof days !== 'number' || days < 1 || days > 90) {
      return NextResponse.json(
        { error: 'days must be a number between 1 and 90' },
        { status: 400 }
      );
    }

    // 5. Update countdown
    const result = await updateLeadCountdown(
      params.id,
      days,
      session.user.id
    );

    // 6. Return success
    return NextResponse.json(
      {
        success: true,
        lead: result.lead,
        newExpiryDate: result.newExpiryDate,
        daysSet: result.daysSet,
        message: `Countdown updated to ${days} day${days !== 1 ? 's' : ''}`,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] POST /api/leads/[id]/update-countdown error:', error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('only update countdown')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update countdown' },
      { status: 500 }
    );
  }
}
```

**Testing:**
1. Start dev server: `npm run dev`
2. Use Postman/curl to test API:
```bash
curl -X POST http://localhost:3000/api/leads/[lead-id]/update-countdown \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin-session-cookie]" \
  -d '{"days": 3}'
```
3. Expected response:
```json
{
  "success": true,
  "message": "Countdown updated to 3 days",
  "daysSet": 3,
  "newExpiryDate": "2025-11-29T..."
}
```

**❌ STOP:** If API returns error or wrong expiry date

---

### Task 9.7.3: Add onUpdateCountdown Handler to Admin Page

**Goal:** Connect modal to new API endpoint

**File:** `src/app/admin/leads/[id]/page.tsx`

**Find:** AdminLeadManagementModal props (around line 1080)

**Add handler after onResetTimer:**
```typescript
onResetTimer={async (days: number) => {
  // Existing extend timer handler
  try {
    const response = await fetch(`/api/leads/${lead.id}/reset-timer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset timer');
    }

    // Refresh lead data immediately
    await fetchLead();
  } catch (err) {
    throw err;
  }
}}
onUpdateCountdown={async (days: number) => {
  // NEW: Update countdown to specific days
  try {
    const response = await fetch(`/api/leads/${lead.id}/update-countdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update countdown');
    }

    const result = await response.json();
    
    // Show success message
    alert(result.message || `Countdown updated to ${days} days`);
    
    // Refresh lead data
    await fetchLead();
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to update countdown');
    throw err;
  }
}}
onArchive={async () => {
  // Existing handler...
}}
```

**Testing:**
```bash
npx tsc --noEmit
# Expected: No TypeScript errors
```

**❌ STOP:** If TypeScript errors

---

### Task 9.7.4: Update AdminLeadManagementModal Interface

**Goal:** Add new prop type for onUpdateCountdown

**File:** `src/components/admin/AdminLeadManagementModal.tsx`

**Find interface** (around line 79):
```typescript
interface AdminLeadManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  // Handler props (preserve existing backend logic)
  onApprove: (data: { enableCountdown: boolean; countdownDays: number }) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onSavePrice: (price: string) => Promise<void>;
  onSaveNotes: (notes: string) => Promise<void>;
  onResell?: () => Promise<void>;
  onResetTimer?: (days: number) => Promise<void>;
  onArchive?: () => Promise<void>;
  onUnarchive?: () => Promise<void>;
  onAssign: (data: {
    installerIds: string[];
    mode: 'exclusive' | 'competitive';
    notes?: string;
    notifyInstallers: boolean;
  }) => Promise<void>;
  onRemoveAssignment?: (installerId: string) => Promise<void>;
}
```

**Add new prop:**
```typescript
interface AdminLeadManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  // Handler props (preserve existing backend logic)
  onApprove: (data: { enableCountdown: boolean; countdownDays: number }) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onSavePrice: (price: string) => Promise<void>;
  onSaveNotes: (notes: string) => Promise<void>;
  onResell?: () => Promise<void>;
  onResetTimer?: (days: number) => Promise<void>;
  onUpdateCountdown?: (days: number) => Promise<void>; // NEW: Set countdown to specific days
  onArchive?: () => Promise<void>;
  onUnarchive?: () => Promise<void>;
  onAssign: (data: {
    installerIds: string[];
    mode: 'exclusive' | 'competitive';
    notes?: string;
    notifyInstallers: boolean;
  }) => Promise<void>;
  onRemoveAssignment?: (installerId: string) => Promise<void>;
}
```

**Update destructuring** (around line 100):
```typescript
export default function AdminLeadManagementModal({
  isOpen,
  onClose,
  lead,
  onApprove,
  onReject,
  onSavePrice,
  onSaveNotes,
  onResell,
  onResetTimer,
  onUpdateCountdown, // NEW
  onArchive,
  onUnarchive,
  onAssign,
  onRemoveAssignment,
}: AdminLeadManagementModalProps) {
```

**Testing:**
```bash
npx tsc --noEmit
# Expected: No TypeScript errors
```

**❌ STOP:** If TypeScript errors

---

### Task 9.7.5: Add "Update Countdown" Button to Modal

**Goal:** Add button next to countdown input for immediate updates

**File:** `src/components/admin/AdminLeadManagementModal.tsx`

**Find countdown input** (around line 795-817):
```typescript
<div>
  <label className="block text-body-small mb-2 text-muted-foreground">
    Countdown Days (1-90)
  </label>
  <input
    type="number"
    min="1"
    max="90"
    value={countdownDays}
    onChange={(e) => setCountdownDays(parseInt(e.target.value) || 7)}
    placeholder="Enter expiry days"
    className="form-input w-full px-4 py-3 placeholder:text-muted-foreground"
    disabled={submitting}
  />
  <p className="text-caption mt-1 text-muted-foreground">
    {lead.expiresAt ? (
      <>
        Current expiry: {new Date(lead.expiresAt).toLocaleDateString('en-GB')}
        {' • '}
        {(() => {
          const daysLeft = Math.ceil((new Date(lead.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft > 0 ? `${daysLeft}d left` : 'Expired';
        })()}
      </>
    ) : (
      `Will expire in ${countdownDays} day${countdownDays !== 1 ? 's' : ''}`
    )}
  </p>
</div>
```

**Replace with:**
```typescript
<div>
  <label className="block text-body-small mb-2 text-muted-foreground">
    Countdown Days (1-90)
  </label>
  <div className="flex gap-2">
    <input
      type="number"
      min="1"
      max="90"
      value={countdownDays}
      onChange={(e) => setCountdownDays(parseInt(e.target.value) || 7)}
      placeholder="Enter expiry days"
      className="form-input flex-1 px-4 py-3 placeholder:text-muted-foreground"
      disabled={submitting}
    />
    {onUpdateCountdown && lead.expiresAt && (
      <Button
        onClick={async () => {
          if (countdownDays < 1 || countdownDays > 90) {
            alert('Please enter a valid countdown (1-90 days)');
            return;
          }
          
          setSubmitting(true);
          try {
            await onUpdateCountdown(countdownDays);
            // Success message handled by parent
          } catch (err: any) {
            setError(err.message || 'Failed to update countdown');
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={submitting || countdownDays < 1 || countdownDays > 90}
        variant="primary"
        className="px-6 bg-info text-info-foreground"
      >
        Update
      </Button>
    )}
  </div>
  <p className="text-caption mt-1 text-muted-foreground">
    {lead.expiresAt ? (
      <>
        Current expiry: {new Date(lead.expiresAt).toLocaleDateString('en-GB')}
        {' • '}
        {(() => {
          const daysLeft = Math.ceil((new Date(lead.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft > 0 ? `${daysLeft}d left` : 'Expired';
        })()}
      </>
    ) : (
      `Will expire in ${countdownDays} day${countdownDays !== 1 ? 's' : ''}`
    )}
  </p>
</div>
```

**Key Changes:**
- ✅ Wrapped input + button in flex container
- ✅ "Update" button only shows if lead has expiry (already assigned)
- ✅ Button validates countdown range (1-90)
- ✅ Uses semantic classes (no inline styles)
- ✅ Disabled state during submission

**Testing:**
```bash
npm run dev
```

1. Open browser → `/admin/leads/[id]` (lead with existing countdown)
2. Click "Manage Lead"
3. Find countdown input
4. Verify "Update" button visible next to input
5. Change countdown from 30 to 3
6. Click "Update" button
7. Check DevTools Network tab:
   - POST `/api/leads/[id]/update-countdown`
   - Body: `{"days": 3}`
8. Verify success alert
9. Check countdown display updates
10. Refresh page
11. Verify countdown persists (3 days)

**Expected Results:**
- ✅ Button appears next to input
- ✅ API call succeeds
- ✅ Countdown updates to 3 days
- ✅ No console errors
- ✅ Persists after refresh

**❌ STOP:** If button doesn't work or API fails

---

### Task 9.7.6: End-to-End Countdown Update Test

**Goal:** Verify complete update workflow

**Test Scenario: Reduce Countdown from 30 to 3 Days**

**Prerequisites:**
- Lead with 30 days countdown (create via assignment with 30 days)
- Admin account
- Installer account (assigned to the lead)

**Steps:**

1. **Initial State Verification:**
   - Admin: View lead detail page
   - Verify: Countdown shows "30 days left"
   - Installer: View lead feed
   - Verify: Lead shows "30 days left"

2. **Update Countdown:**
   - Admin: Click "Manage Lead"
   - Modal opens
   - Find "Countdown Days" input
   - Current value: 30
   - Change to: 3
   - Click "Update" button
   - Wait for success alert: "Countdown updated to 3 days"
   - Modal stays open (doesn't close)

3. **Verify Admin View:**
   - Close modal manually
   - Lead detail page updates
   - Countdown now shows: "3 days left"
   - Expiry date updated in Assignment History

4. **Verify Installer View:**
   - Installer: Refresh lead feed (or wait 5 seconds)
   - Find the lead
   - Verify countdown: "3 days left" (NOT 30 days)
   - Verify "Purchase" button still enabled

5. **DevTools Verification:**
   - Admin DevTools → Network tab
   - Find: POST `/api/leads/[id]/update-countdown`
   - Request body:
     ```json
     {"days": 3}
     ```
   - Response:
     ```json
     {
       "success": true,
       "message": "Countdown updated to 3 days",
       "daysSet": 3,
       "newExpiryDate": "2025-11-29T..."
     }
     ```

6. **Database Verification:**
   - Check `Lead.expiresAt` in database
   - Should be: `now + 3 days` (NOT old value + 3 days)

**Expected Results:**
- ✅ Countdown changes from 30 → 3 days
- ✅ Installer sees updated countdown immediately
- ✅ Expiry date absolute (not relative)
- ✅ "Update" button works
- ✅ Success message correct
- ✅ No console errors

**❌ STOP:** If countdown doesn't update or shows wrong value

---

**Test Scenario: Increase Countdown from 3 to 10 Days**

**Steps:**
1. Open lead with 3 days countdown
2. Click "Manage Lead"
3. Change countdown to 10
4. Click "Update"
5. Verify success message
6. Verify countdown shows "10 days left"
7. Verify installer feed updates

**Expected Results:**
- ✅ Countdown increases correctly
- ✅ Works in both directions (reduce/increase)

---

**Test Scenario: Edge Cases**

**Test 1: Minimum Countdown (1 day)**
1. Set countdown to 1
2. Click "Update"
3. Expected: Success, countdown = 1 day

**Test 2: Maximum Countdown (90 days)**
1. Set countdown to 90
2. Click "Update"
3. Expected: Success, countdown = 90 days

**Test 3: Invalid Countdown (0 days)**
1. Set countdown to 0
2. Click "Update"
3. Expected: Alert "Please enter a valid countdown (1-90 days)"
4. No API call made

**Test 4: Invalid Countdown (100 days)**
1. Set countdown to 100
2. Click "Update"
3. Expected: Alert with validation error
4. No API call made

**Test 5: Network Failure**
1. Set countdown to 5
2. Open DevTools → Network → Set to "Offline"
3. Click "Update"
4. Expected: Error alert "Failed to update countdown"
5. Modal stays open
6. Set network to "Online"
7. Click "Update" again
8. Expected: Success

**Expected Results:**
- ✅ All validations work
- ✅ Clear error messages
- ✅ Button disabled for invalid values
- ✅ Can retry after network failure

---

### Task 9.7.7: Build & Type Check

**Commands:**
```bash
# TypeScript validation
npx tsc --noEmit

# Build validation
npm run build

# Start dev server
npm run dev
```

**Expected Results:**
- ✅ 0 TypeScript errors
- ✅ Build succeeds
- ✅ No warnings related to countdown changes
- ✅ Dev server starts without errors

**Check for:**
- Missing imports in new API route
- Type mismatches in onUpdateCountdown
- Unused variables
- Console errors in browser

**❌ STOP:** If build fails or TypeScript errors

---

### Task 9.7.8: Regression Testing

**Goal:** Ensure existing features still work

**Test Checklist:**

**Countdown Features:**
- [ ] Initial assignment with countdown still works
- [ ] "Extend Timer" (+X days) still works independently
- [ ] Countdown displays correctly in all views
- [ ] Expired leads handled correctly

**Admin Features:**
- [ ] Can still approve/assign leads
- [ ] Can still edit price/notes
- [ ] Can still archive leads
- [ ] Can still resell leads

**Installer Features:**
- [ ] Countdown updates reflect in feed immediately
- [ ] Purchase flow unaffected
- [ ] Email unlocks after purchase
- [ ] Countdown timer ticks down correctly

**System:**
- [ ] No console errors
- [ ] No network request failures
- [ ] Notifications working
- [ ] Audit logs created

**❌ STOP:** If any existing feature broken

---

## PHASE 9.7 TESTING SUMMARY

### Critical Tests:
1. ✅ Update countdown reduces days (30 → 3)
2. ✅ Update countdown increases days (3 → 10)
3. ✅ Installer sees updated countdown
4. ✅ "Update" button works correctly
5. ✅ Validations prevent invalid values
6. ✅ Build succeeds
7. ✅ No regressions

### Test Results Table:

| Test | Status | Notes |
|------|--------|-------|
| Create Service Function | ⬜ | updateLeadCountdown |
| Create API Endpoint | ⬜ | POST /update-countdown |
| Add Handler to Page | ⬜ | onUpdateCountdown |
| Update Modal Interface | ⬜ | Type definitions |
| Add Update Button | ⬜ | UI implementation |
| E2E Update Test | ⬜ | 30 → 3 days |
| Edge Cases | ⬜ | Validations |
| Build & Types | ⬜ | npm run build |
| Regression Tests | ⬜ | Existing features |

**Sign-Off Criteria:**
- ✅ All 9 tasks passed
- ✅ Countdown updates to specific value
- ✅ Separate from "Extend Timer"
- ✅ Build succeeds with 0 errors
- ✅ All existing features work
- ✅ No console errors
- ✅ Performance acceptable

**Checkpoint 9.7.8:** ✅ ALL TESTS PASS - Phase 9.7 Complete

---

## PHASE 9.7 COMPLETION CHECKLIST

- [ ] Task 9.7.1: Service function created
- [ ] Task 9.7.2: API endpoint created
- [ ] Task 9.7.3: Handler added to admin page
- [ ] Task 9.7.4: Modal interface updated
- [ ] Task 9.7.5: "Update" button added to modal
- [ ] Task 9.7.6: E2E tests pass
- [ ] Task 9.7.7: Build succeeds
- [ ] Task 9.7.8: Regression tests pass
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Countdown updates correctly
- [ ] Installer feed reflects changes

---

## Phase 9.7 Rollback

**If Task 9.7.1-9.7.8 fail:**

```bash
# Remove new API route
rm -rf src/app/api/leads/[id]/update-countdown

# Revert service function
git checkout HEAD -- src/lib/services/lead-service.ts

# Revert admin page
git checkout HEAD -- src/app/admin/leads/[id]/page.tsx

# Revert modal
git checkout HEAD -- src/components/admin/AdminLeadManagementModal.tsx

# Verify
npm run build

# Test
npm run dev
```

**Alternative: Revert specific commits**
```bash
git log --oneline -5  # Find Phase 9.7 commits
git revert <commit-hash>
npm run build
```

---

**End of Phase 9.7 - Countdown Timer Update Feature**

---

## PHASE 9.9: Homeowner UI Updates - Status Labels & Countdown Timer

**Goal:** Update homeowner dashboard and preview modal for better UX

**Date:** November 26, 2025  
**Audit Report:** `DOC/ADMIN/HOMEOWNER-UI-UPDATE-AUDIT.md`

### Requirements:
1. Replace all "Purchased" text with "Responded by Installer"
2. Add countdown timer to homeowner lead cards (APPROVED + PURCHASED leads)
3. Ensure preview modal shows correct status label
4. Fix UI visibility issues (z-index, icon positioning)
5. Remove inline styles, use semantic CSS classes only

---

### Task 9.9.1: Update Status Labels in Dashboard

**File:** `src/app/homeowner/dashboard/page.tsx`

**Changes:**
1. Update STATUS_LABELS.PURCHASED (Lines 195-198)

**Implementation:**
```typescript
// OLD
[LeadStatusEnum.PURCHASED]: {
  label: 'Purchased',
  description: 'An installer has claimed this lead',
  accent: 'bg-primary/10 text-primary border border-primary/30',
},

// NEW
[LeadStatusEnum.PURCHASED]: {
  label: 'Responded by Installer',
  description: 'An installer has responded to your request',
  accent: 'bg-primary/10 text-primary border border-primary/30',
},
```

**Testing:**
```bash
# 1. Start dev server
npm run dev

# 2. Open homeowner dashboard
# Navigate to: http://localhost:3000/homeowner/dashboard

# 3. Find PURCHASED lead card
# Expected: Badge shows "Responded by Installer" (not "Purchased")

# 4. Check status breakdown stats
# Expected: "Responded by Installer" count displays correctly

# 5. Test other statuses unchanged
# - APPROVED: "Approved" ✓
# - PENDING_APPROVAL: "Awaiting Review" ✓
# - REJECTED: "Rejected" ✓
```

**Expected Results:**
- ✅ PURCHASED badge shows "Responded by Installer"
- ✅ Accent color unchanged (primary blue)
- ✅ Description tooltip shows new text
- ✅ Stats counter shows correct label
- ✅ Other status labels unchanged

**❌ STOP:** If badge still shows "Purchased" or breaks, rollback and debug.

---

### Task 9.9.2: Add Countdown Timer to PURCHASED Leads

**Files:** 
1. `src/app/homeowner/dashboard/page.tsx` (Lines 586-597)
2. `src/components/LiveCountdownBar.tsx` (Lines 108-112)

**Changes:**

**File 1: Dashboard Condition**
```typescript
// OLD (Line 586)
{lead.expiresAt && lead.status === LeadStatusEnum.APPROVED && (

// NEW
{lead.expiresAt && (lead.status === LeadStatusEnum.APPROVED || lead.status === LeadStatusEnum.PURCHASED) && (
```

**File 2: LiveCountdownBar Logic**
```typescript
// OLD (Lines 108-112)
// Hide countdown for purchased CALL_VISIT/WRITTEN_QUOTE leads
// (BIDDING leads keep countdown visible)
if (leadStatus === 'PURCHASED' && quoteType !== 'BIDDING') {
  return null;
}

// NEW
// Always show countdown if expiresAt exists (regardless of status)
// Remove PURCHASED hide logic
```

**Implementation Steps:**
1. Update dashboard condition to include PURCHASED status
2. Remove conditional return in LiveCountdownBar for PURCHASED leads
3. Keep existing countdown styling and behavior

**Testing:**
```bash
# 1. Create test PURCHASED lead with expiresAt
# In Prisma Studio or SQL:
UPDATE "Lead" SET status = 'PURCHASED', "expiresAt" = NOW() + INTERVAL '5 days' WHERE id = '<lead-id>';

# 2. Refresh homeowner dashboard
# Expected: Countdown appears in lead card

# 3. Verify countdown format
# Expected: "Xd Yh Zm Ws remaining" with progress bar

# 4. Wait 5 seconds
# Expected: Countdown updates live (seconds decrement)

# 5. Check color coding
# - 6+ days: Green background
# - 3-5 days: Yellow background
# - 1-2 days: Red background
# - Expired: Gray background

# 6. Test APPROVED lead countdown
# Expected: Still works (no regression)

# 7. Test lead without expiresAt
# Expected: No countdown displays (no error)
```

**Expected Results:**
- ✅ PURCHASED leads show countdown timer
- ✅ APPROVED leads still show countdown (regression test)
- ✅ Countdown updates every second
- ✅ Color coding correct (green/yellow/red)
- ✅ No countdown for leads without expiresAt
- ✅ No console errors

**❌ STOP:** If countdown doesn't appear or causes errors, rollback and debug.

---

### Task 9.9.3: Update Preview Modal Status Display

**File:** `src/components/homeowner/LeadPreviewModal.tsx`

**Changes:**

**Step 1: Add Status Mapping** (after imports, before component):
```typescript
// Add this constant after imports (around Line 25)
const STATUS_DISPLAY_LABELS: Record<string, string> = {
  PURCHASED: 'Responded by Installer',
  APPROVED: 'Approved',
  PENDING_APPROVAL: 'Awaiting Review',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  FLAGGED: 'Flagged',
  QUOTED: 'Quotes Received',
  ACCEPTED: 'Accepted',
  PENDING_PHONE: 'Needs Verification',
};
```

**Step 2: Update Status Badge** (Lines 103-109):
```tsx
// OLD
<span className={`inline-flex items-center px-3 py-1 rounded-full text-body-small ${
  lead.status === 'APPROVED' ? 'bg-success/20 text-success' :
  lead.status === 'PURCHASED' ? 'bg-accent/20 text-accent' :
  'bg-surface text-foreground'
}`}>
  {lead.status.replace('_', ' ')}
</span>

// NEW
<span className={`inline-flex items-center px-3 py-1 rounded-full text-body-small ${
  lead.status === 'APPROVED' ? 'bg-success/20 text-success' :
  lead.status === 'PURCHASED' ? 'bg-accent/20 text-accent' :
  'bg-surface text-foreground'
}`}>
  {STATUS_DISPLAY_LABELS[lead.status] || lead.status.replace('_', ' ')}
</span>
```

**Testing:**
```bash
# 1. Open homeowner dashboard
npm run dev

# 2. Click "Preview" on PURCHASED lead
# Expected: Modal opens

# 3. Check status badge at top
# Expected: Shows "Responded by Installer"

# 4. Verify badge styling
# Expected: accent/20 background, accent text color

# 5. Scroll through modal content
# Expected: No countdown timer visible anywhere

# 6. Test other statuses
# - APPROVED lead: "Approved" ✓
# - REJECTED lead: "Rejected" ✓
# - PENDING_APPROVAL lead: "Awaiting Review" ✓

# 7. Close modal
# Expected: No console errors
```

**Expected Results:**
- ✅ PURCHASED status shows "Responded by Installer"
- ✅ Badge styling unchanged (accent colors)
- ✅ No countdown timer in modal
- ✅ Other statuses display correctly
- ✅ Modal functions normally (scrolling, closing)

**❌ STOP:** If status label wrong or modal breaks, rollback and debug.

---

### Task 9.9.4: Fix Modal Header Z-Index & Styling

**File:** `src/components/homeowner/LeadPreviewModal.tsx`

**Changes:**

**Step 1: Update Header** (Lines 84-101):
```tsx
// OLD
<div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-lg -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6">

// NEW
<div className="sticky top-0 z-50 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-lg -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6">
```

**Rationale:**
- Increase z-index from `z-10` to `z-50` for proper stacking
- Modal wrapper uses `z-modal` (likely z-40), header needs higher z-index
- Keep responsive negative margins (no semantic class available yet)
- Document need for semantic classes in follow-up task

**Testing:**
```bash
# 1. Open preview modal
# Click "Preview" on any lead

# 2. Scroll down to bottom of modal
# Expected: Header stays at top (sticky)

# 3. Verify header visibility
# Expected: 
# - Background opaque (not transparent)
# - Border visible at bottom of header
# - Close (X) button visible and clickable

# 4. Check header text
# Expected:
# - "Quote Request Details" heading visible
# - "Read-only view • Created..." subtitle visible
# - Text not overlapping with content below

# 5. Scroll back to top
# Expected: No visual glitches, smooth transition

# 6. Test in all themes
# - Dark: Header bg-surface (dark gray) ✓
# - Light: Header bg-surface (light gray) ✓
# - Purple: Header bg-surface (purple tint) ✓

# 7. Test responsive (resize browser)
# - Desktop (1440px): Header full width ✓
# - Tablet (768px): Header adjusts padding ✓
# - Mobile (375px): Header remains visible ✓
```

**Expected Results:**
- ✅ Header stays at top when scrolling
- ✅ Header background opaque (not transparent)
- ✅ Close button always clickable
- ✅ No text overlap with content
- ✅ All themes render correctly
- ✅ Responsive design works

**❌ STOP:** If header overlaps content or disappears, rollback and debug.

---

### Task 9.9.5: Remove Inline Styles from Lead Card

**File:** `src/app/homeowner/dashboard/page.tsx`

**Changes:**

**Step 1: Remove Inline Z-Index** (Line 579):
```tsx
// OLD
<div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-neu-outset border-4 border-background relative" style={{ zIndex: 2 }}>

// NEW
<div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-neu-outset border-4 border-background relative z-10">
```

**Rationale:**
- Replace `style={{ zIndex: 2 }}` with Tailwind `z-10` utility
- Ensures icon appears above card content
- Follows design system rule: no inline styles

**Testing:**
```bash
# 1. Open homeowner dashboard
npm run dev

# 2. Verify left icon rendering
# Expected:
# - Icon visible in circular container
# - Icon centered in circle
# - Icon above card background (not behind)

# 3. Check icon shadow
# Expected: Neumorphic shadow-neu-outset visible

# 4. Test multiple lead cards
# Expected: All icons render consistently

# 5. Check icon overlap
# Expected: Icon doesn't overlap adjacent cards

# 6. Test responsive
# - Mobile (375px): Icon size appropriate ✓
# - Tablet (768px): Icon renders correctly ✓
# - Desktop (1440px): Icon proportional ✓

# 7. Test all themes
# - Dark: Icon and shadow visible ✓
# - Light: Neumorphic effect clear ✓
# - Purple: Purple accent on shadow ✓
```

**Expected Results:**
- ✅ Icon renders above card content (proper z-index)
- ✅ No inline styles (style prop removed)
- ✅ Neumorphic shadows visible
- ✅ Icon centered in circle
- ✅ No overlap with adjacent cards
- ✅ Responsive sizing works

**❌ STOP:** If icon disappears behind content, rollback and debug.

---

### Task 9.9.6: Verify No Floating Icons (Visual Audit)

**File:** `src/components/homeowner/LeadPreviewModal.tsx`

**Investigation:**
1. Open preview modal in browser DevTools
2. Inspect for absolutely positioned elements
3. Check for elements outside modal boundaries

**Testing:**
```bash
# 1. Open preview modal
npm run dev
# Navigate to homeowner dashboard
# Click "Preview" on any lead

# 2. Open Chrome DevTools
# Press F12 → Elements tab

# 3. Inspect modal container
# Expected:
# - Modal wrapper: fixed inset-0
# - Modal content: relative positioning
# - All content inside modal boundaries

# 4. Visual check - Left edge
# Expected: No phone/call icons floating outside

# 5. Visual check - Right edge
# Expected: No action buttons extending beyond modal

# 6. Visual check - Top
# Expected: Header contained within modal

# 7. Visual check - Bottom
# Expected: Footer/buttons within modal

# 8. Scroll modal content
# Expected: All elements scroll correctly, none fixed outside

# 9. Test edge cases
# - Very long content: Scrolling works ✓
# - Short content: No empty space at bottom ✓
# - Wide content: Horizontal scroll or wrap ✓

# 10. Test responsive
# - Mobile (375px): Modal fits screen ✓
# - Tablet (768px): Modal centered ✓
# - Desktop (1440px): Modal max-width applies ✓
```

**Expected Results:**
- ✅ All icons contained within modal boundaries
- ✅ No absolutely positioned elements outside modal
- ✅ No negative positioning values causing overflow
- ✅ Scrolling works correctly
- ✅ Responsive design maintains containment

**If Issues Found:**
- Document specific element causing issue
- Check CSS positioning (absolute, fixed, negative margins)
- Add `overflow-hidden` to parent if needed
- Ensure proper containment with `relative` positioning

**❌ STOP:** If visual artifacts found, create follow-up task to fix.

---

## PHASE 9.9 TESTING SUMMARY

### Functional Tests:
- [ ] Task 9.9.1: Status label "Responded by Installer" displays
- [ ] Task 9.9.2: Countdown appears on PURCHASED leads
- [ ] Task 9.9.2: Countdown updates live (every second)
- [ ] Task 9.9.3: Preview modal shows correct status
- [ ] Task 9.9.3: Preview modal has no countdown

### UI/Visual Tests:
- [ ] Task 9.9.4: Modal header stays at top (sticky)
- [ ] Task 9.9.4: Header doesn't overlap content
- [ ] Task 9.9.5: Lead card icon renders correctly
- [ ] Task 9.9.5: No inline styles present
- [ ] Task 9.9.6: No floating icons outside modal

### Theme Tests:
- [ ] Dark theme: All changes render correctly
- [ ] Light theme: Neumorphic effects visible
- [ ] Purple theme: Accent colors applied

### Responsive Tests:
- [ ] Mobile (375px): UI elements scale properly
- [ ] Tablet (768px): Layout adjusts correctly
- [ ] Desktop (1440px): Full design visible

### Regression Tests:
- [ ] APPROVED leads: Countdown still works
- [ ] Other status labels: Unchanged
- [ ] Edit/Preview/Cancel actions: All functional
- [ ] Property type badges: Render correctly

### Build Validation:
```bash
# TypeScript compilation
npx tsc --noEmit
# Expected: 0 errors

# Production build
npm run build
# Expected: Build succeeds

# Start production server
npm start
# Expected: No runtime errors
```

---

## PHASE 9.9 COMPLETION CHECKLIST

- [ ] Task 9.9.1: Status labels updated (dashboard)
- [ ] Task 9.9.2: Countdown added to PURCHASED leads
- [ ] Task 9.9.3: Preview modal status labels updated
- [ ] Task 9.9.4: Modal header z-index fixed
- [ ] Task 9.9.5: Inline styles removed
- [ ] Task 9.9.6: Visual audit passed
- [ ] All functional tests pass
- [ ] All UI/visual tests pass
- [ ] All theme tests pass
- [ ] All responsive tests pass
- [ ] All regression tests pass
- [ ] TypeScript compilation succeeds
- [ ] Production build succeeds
- [ ] No console errors in browser
- [ ] No network errors in DevTools

---

## Phase 9.9 Rollback

**If Task 9.9.1-9.9.6 fail:**

```bash
# Option 1: Revert specific files
git checkout HEAD -- src/app/homeowner/dashboard/page.tsx
git checkout HEAD -- src/components/homeowner/LeadPreviewModal.tsx
git checkout HEAD -- src/components/LiveCountdownBar.tsx

# Option 2: Revert to backup (if created)
cp src/app/homeowner/dashboard/page.tsx.backup-20251126 src/app/homeowner/dashboard/page.tsx
cp src/components/homeowner/LeadPreviewModal.tsx.backup-20251126 src/components/homeowner/LeadPreviewModal.tsx
cp src/components/LiveCountdownBar.tsx.backup-20251126 src/components/LiveCountdownBar.tsx

# Verify
npm run build
npx tsc --noEmit

# Test
npm run dev
# Open homeowner dashboard
# Verify original state restored
```

**Alternative: Revert specific commits**
```bash
git log --oneline -5  # Find Phase 9.9 commits
git revert <commit-hash>
npm run build
npm run dev
```

**Verify Rollback Success:**
- ✅ Dashboard shows "Purchased" (original label)
- ✅ No countdown on PURCHASED leads
- ✅ Modal status shows "PURCHASED"
- ✅ Inline styles present (original code)
- ✅ No build errors
- ✅ No runtime errors

---

**End of Phase 9.9 - Homeowner UI Updates**

---

## PHASE 10: Installer Purchased Leads Page UI Enhancement

**Date Added:** November 26, 2025  
**Goal:** Add tab navigation and update lead card design to match InstallerLeadFeed (SOT)  
**Prerequisites:** Phase 1-9 complete, GATE 0 passed  
**Audit Report:** `DOC/Installers/Leadfeed/PURCHASED-LEADS-PAGE-AUDIT.md`

---

### PHASE 10.0: Pre-Implementation Validation

**Task 10.0.1: Verify Current State**

```bash
# Check file exists
ls src/app/installer/(dashboard)/purchased-leads/page.tsx

# Run TypeScript check
npx tsc --noEmit
# Expected: 0 errors

# Start dev server
npm run dev
# Expected: Starts without errors
```

**Testing:**
1. Login as installer
2. Navigate to `/installer/purchased-leads`
3. Verify page loads
4. Check browser console (should be no errors)
5. Verify purchased leads display correctly

**Expected Results:**
- ✅ Page loads successfully
- ✅ Purchased leads display
- ✅ Stats cards show correct data
- ✅ No console errors
- ✅ TypeScript: 0 errors

**❌ STOP:** If any issues, resolve before Phase 10.1.

---

### Task 10.0.2: Reference Design System

**Files to Read:**
```
DOC/Guidelines/DESIGN-SYSTEM-SOT.md
DOC/Guidelines/UI-UX-Layout-and-Routing-Standards.md
DOC/Guidelines/AI-IMPLEMENTATION-GUIDELINES.md
```

**Study InstallerLeadFeed Card:**
```
src/components/InstallerLeadFeed.tsx (lines 516-780)
```

**Key Patterns to Note:**
- Card structure: Header → Location → System Details → Contact → Actions
- Semantic classes: `bg-surface`, `text-foreground`, `border-border`
- Badge components: Quote type, status, priority
- Button styles: `btn-primary`, `btn-secondary`, `btn-success`
- Neumorphic shadows: `shadow-neu-outset`, `shadow-neu-inset`

**❌ STOP:** Don't proceed until design patterns understood.

---

### PHASE 10.1: Add Tab Navigation

**Goal:** Add 3 tabs to filter leads by quote type

**Task 10.1.1: Add Tab State and Filter Logic**

**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Changes:**
1. Add state for active tab (after existing useState declarations):
```typescript
const [activeTab, setActiveTab] = useState<'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING'>('CALL_VISIT');
```

2. Add filter function (before return statement):
```typescript
// Filter leads by active tab
const filteredLeads = leads.filter(lead => lead.quoteType === activeTab);

// Calculate counts per tab
const callVisitCount = leads.filter(l => l.quoteType === 'CALL_VISIT').length;
const writtenQuoteCount = leads.filter(l => l.quoteType === 'WRITTEN_QUOTE').length;
const biddingCount = leads.filter(l => l.quoteType === 'BIDDING').length;
```

3. Replace `leads.map(lead => ...)` with `filteredLeads.map(lead => ...)`

**Testing:**
```bash
# TypeScript check
npx tsc --noEmit
# Expected: 0 errors

# Build check
npm run build
# Expected: Success
```

**Manual Testing:**
1. Open browser DevTools console
2. Navigate to `/installer/purchased-leads`
3. Check console for errors (should be none)
4. Verify leads still display

**Expected Results:**
- ✅ TypeScript: 0 errors
- ✅ Build: Success
- ✅ Console: No errors
- ✅ Leads display correctly

**❌ STOP:** If errors, fix before 10.1.2.

---

**Task 10.1.2: Add Tab UI Component**

**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Changes:**
Add tab navigation UI (after stats cards, before leads list):

```typescript
{/* Tab Navigation */}
<div className="mb-6">
  <div className="flex gap-2 p-1 bg-surface rounded-lg border border-border shadow-neu-inset">
    {/* Call/Visit Tab */}
    <button
      onClick={() => setActiveTab('CALL_VISIT')}
      className={`flex-1 px-4 py-3 rounded-lg text-body transition-all ${
        activeTab === 'CALL_VISIT'
          ? 'bg-brand text-brand-foreground shadow-neu-outset'
          : 'bg-transparent text-muted hover:bg-surface-hover'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <span>Call/Visit</span>
        {callVisitCount > 0 && (
          <span className="text-caption bg-brand-foreground/20 px-2 py-0.5 rounded-full">
            {callVisitCount}
          </span>
        )}
      </div>
    </button>

    {/* Written Quotes Tab */}
    <button
      onClick={() => setActiveTab('WRITTEN_QUOTE')}
      className={`flex-1 px-4 py-3 rounded-lg text-body transition-all ${
        activeTab === 'WRITTEN_QUOTE'
          ? 'bg-brand text-brand-foreground shadow-neu-outset'
          : 'bg-transparent text-muted hover:bg-surface-hover'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <span>Written Quotes</span>
        {writtenQuoteCount > 0 && (
          <span className="text-caption bg-brand-foreground/20 px-2 py-0.5 rounded-full">
            {writtenQuoteCount}
          </span>
        )}
      </div>
    </button>

    {/* Bidding Tab */}
    <button
      onClick={() => setActiveTab('BIDDING')}
      className={`flex-1 px-4 py-3 rounded-lg text-body transition-all ${
        activeTab === 'BIDDING'
          ? 'bg-brand text-brand-foreground shadow-neu-outset'
          : 'bg-transparent text-muted hover:bg-surface-hover'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <span>Bidding</span>
        {biddingCount > 0 && (
          <span className="text-caption bg-brand-foreground/20 px-2 py-0.5 rounded-full">
            {biddingCount}
          </span>
        )}
      </div>
    </button>
  </div>
</div>
```

**Testing:**
```bash
# TypeScript check
npx tsc --noEmit

# Build check
npm run build

# Start dev server
npm run dev
```

**Visual Testing:**
1. Open `/installer/purchased-leads`
2. Verify 3 tabs visible
3. Click each tab → Verify active state changes
4. Verify lead count badges display
5. Verify only matching leads show per tab

**Theme Testing:**
1. Switch to Dark theme → Verify tabs render
2. Switch to Light theme → Verify neumorphic shadows
3. Switch to Purple theme → Verify purple brand colors

**Responsive Testing:**
1. Resize to 320px → Tabs should adjust (may stack on very small screens)
2. Resize to 768px → Tabs should be horizontal
3. Resize to 1440px → Tabs should be horizontal

**Expected Results:**
- ✅ TypeScript: 0 errors
- ✅ Build: Success
- ✅ Tabs visible and clickable
- ✅ Active tab highlighted
- ✅ Lead counts accurate
- ✅ Filtering works correctly
- ✅ All 3 themes work
- ✅ Responsive on all breakpoints

**❌ STOP:** If any test fails, fix before Phase 10.2.

---

### PHASE 10.2: Replace Lead Card Design

**Goal:** Update lead card to match InstallerLeadFeed design (SOT)

**Task 10.2.1: Replace Lead Card JSX**

**File:** `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Changes:**
Replace the entire lead card section (currently lines ~200-320) with InstallerLeadFeed-style card.

**New Card Structure:**
```typescript
{filteredLeads.map(lead => (
  <div
    key={lead.id}
    className="bg-surface rounded-lg shadow-neu-outset border border-border p-6 hover:shadow-neu-outset-hover transition-shadow"
  >
    {/* Header: Quote Type Badge + Purchased Badge */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {/* Quote Type Badge */}
        <span className="px-3 py-1 rounded-full text-caption bg-brand/20 text-brand">
          {lead.quoteType.replace('_', ' ')}
        </span>
        
        {/* Purchased Badge */}
        <span className="px-3 py-1 rounded-full text-caption bg-success/20 text-success flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3" />
          Purchased
        </span>
      </div>
      
      {/* Purchase Date */}
      <p className="text-body-small text-muted">
        {new Date(lead.purchasedAt).toLocaleDateString()}
      </p>
    </div>

    {/* Location Info */}
    <div className="flex items-start gap-2 mb-4">
      <MapPinIcon className="h-5 w-5 text-icon flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-body text-foreground">
          {lead.location || 'Location not specified'}
        </p>
        <p className="text-body-small text-muted">
          {lead.postcode}, {lead.state}
        </p>
      </div>
    </div>

    {/* System Details Grid */}
    <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-surface/50 rounded-lg border border-border">
      {lead.propertyType && (
        <div>
          <p className="text-caption text-muted">Property Type</p>
          <p className="text-body text-foreground">{lead.propertyType}</p>
        </div>
      )}
      {lead.roofType && (
        <div>
          <p className="text-caption text-muted">Roof Type</p>
          <p className="text-body text-foreground">{lead.roofType}</p>
        </div>
      )}
      {lead.estimatedBudget && (
        <div>
          <p className="text-caption text-muted">Budget</p>
          <p className="text-body text-foreground">£{lead.estimatedBudget.toLocaleString()}</p>
        </div>
      )}
      {lead.electricityBill && (
        <div>
          <p className="text-caption text-muted">Monthly Bill</p>
          <p className="text-body text-foreground">£{lead.electricityBill}</p>
        </div>
      )}
    </div>

    {/* Contact Details - Always Revealed for Purchased Leads */}
    <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4">
      <h3 className="text-body text-success mb-3 flex items-center gap-2">
        <CheckCircleIcon className="h-4 w-4" />
        Contact Information
      </h3>
      <div className="space-y-2">
        <p className="text-body text-success font-medium">
          {lead.homeowner.name}
        </p>
        <div className="flex items-center gap-2 text-body text-success">
          <PhoneIcon className="h-4 w-4" />
          <a href={`tel:${lead.homeowner.phone}`} className="hover:underline">
            {lead.homeowner.phone}
          </a>
        </div>
        <div className="flex items-center gap-2 text-body text-success">
          <EnvelopeIcon className="h-4 w-4" />
          <a href={`mailto:${lead.homeowner.email}`} className="hover:underline">
            {lead.homeowner.email}
          </a>
        </div>
      </div>
    </div>

    {/* Price Display */}
    <div className="mb-4 p-3 bg-surface/50 rounded-lg border border-border">
      <p className="text-caption text-muted mb-1">Purchase Price</p>
      <div className="flex items-center gap-1">
        <CurrencyPoundIcon className="h-5 w-5 text-brand" />
        <span className="text-heading-3 text-foreground">{lead.leadPrice}</span>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      <button
        onClick={() => handleCall(lead.homeowner.phone)}
        className="btn-success flex-1"
      >
        <PhoneIcon className="h-4 w-4 mr-2" />
        Call Now
      </button>
      <button
        onClick={() => handleEmail(lead.homeowner.email)}
        className="btn-primary flex-1"
      >
        <EnvelopeIcon className="h-4 w-4 mr-2" />
        Email
      </button>
      <button
        onClick={() => handleViewDetails(lead.id)}
        className="btn-secondary flex-1"
      >
        <EyeIcon className="h-4 w-4 mr-2" />
        Details
      </button>
    </div>
  </div>
))}
```

**Testing:**
```bash
# TypeScript check
npx tsc --noEmit

# Build check
npm run build

# Dev server
npm run dev
```

**Visual Testing:**
1. Open `/installer/purchased-leads`
2. Verify new card design matches InstallerLeadFeed style
3. Verify all data displays correctly
4. Verify contact details are visible (not locked)
5. Verify no unlock button present
6. Verify all 3 action buttons work

**Theme Testing:**
1. Dark theme: Cards render correctly
2. Light theme: Neumorphic effects visible
3. Purple theme: Purple accents applied

**Responsive Testing:**
1. Mobile (320px): Cards adjust, buttons stack if needed
2. Tablet (768px): Cards display properly
3. Desktop (1440px): Full card layout visible

**Expected Results:**
- ✅ TypeScript: 0 errors
- ✅ Build: Success
- ✅ Cards match InstallerLeadFeed design
- ✅ All data fields populate correctly
- ✅ Contact details always visible
- ✅ All buttons functional
- ✅ All 3 themes work
- ✅ Responsive on all breakpoints

**❌ STOP:** If any test fails, fix before Phase 10.3.

---

### PHASE 10.3: Verification & Cleanup

**Task 10.3.1: Run Design System Verification**

**Commands (PowerShell):**
```powershell
# Command 1: Hardcoded gray/slate colors
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"

# Command 2: Dark mode classes
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "dark:"

# Command 3: RGB/HEX colors
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"

# Command 4: Hardcoded white/black
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "text-white|bg-white|text-black|bg-black"

# Command 5: Hardcoded typography
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"

# Command 6: Manual responsive classes
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "sm:text-|md:text-|lg:text-"
```

**Expected Result:** 0/0/0/0/0/0 (all commands return 0 matches)

**❌ STOP:** If any command returns matches, fix hardcoded values before 10.3.2.

---

**Task 10.3.2: Final Build Validation**

```bash
# TypeScript compilation
npx tsc --noEmit
# Expected: 0 errors

# Production build
npm run build
# Expected: Build succeeds

# Start production server
npm start
# Expected: No runtime errors
```

**Expected Results:**
- ✅ TypeScript: 0 errors
- ✅ Build: Success
- ✅ Production server starts
- ✅ No console errors

**❌ STOP:** If build fails, fix before 10.3.3.

---

**Task 10.3.3: Comprehensive Manual Testing**

**Functional Tests:**
1. Tab Navigation:
   - Click "Call/Visit" → Only call/visit leads show
   - Click "Written Quotes" → Only written quote leads show
   - Click "Bidding" → Only bidding leads show
   - Verify lead counts on tabs are accurate

2. Lead Cards:
   - Verify quote type badge displays correctly
   - Verify "Purchased" badge displays
   - Verify purchase date shows
   - Verify location info complete
   - Verify system details populate
   - Verify contact details visible (not locked)
   - Verify purchase price displays

3. Actions:
   - Click "Call Now" → Phone dialer opens with correct number
   - Click "Email" → Email client opens with correct address
   - Click "Details" → Navigate to lead details page

4. Stats Cards:
   - Verify "Total Purchased" count accurate
   - Verify "Total Spent" sum correct
   - Verify "This Month" count accurate

**UI/Visual Tests:**
1. Verify no hardcoded colors (all semantic)
2. Verify neumorphic shadows present
3. Verify proper spacing and alignment
4. Verify icons render correctly
5. Verify badges have correct styling

**Theme Tests:**
1. Dark theme:
   - Cards have correct background
   - Text readable
   - Shadows visible
   - Buttons styled correctly

2. Light theme:
   - Neumorphic effects prominent
   - Cards have raised appearance
   - Text contrast adequate

3. Purple theme:
   - Brand colors use purple
   - Active tab uses purple
   - Success colors unchanged

**Responsive Tests:**
1. Mobile (320px):
   - Tabs readable (may stack)
   - Cards full-width
   - Action buttons may stack
   - All content accessible

2. Tablet (768px):
   - Tabs horizontal
   - Cards display well
   - 2-column grid if space allows

3. Desktop (1440px):
   - Full layout visible
   - Optimal spacing
   - All elements comfortable to interact with

**Regression Tests:**
1. Stats cards still work
2. Empty state message works
3. Loading state works
4. Error state works
5. Navigation works

**Expected Results:**
- ✅ All functional tests pass
- ✅ All UI/visual tests pass
- ✅ All theme tests pass
- ✅ All responsive tests pass
- ✅ All regression tests pass
- ✅ No console errors
- ✅ No network errors

**❌ STOP:** If any test fails, document issue and fix before marking complete.

---

### PHASE 10 COMPLETION CHECKLIST

- [ ] Task 10.0.1: Pre-implementation validation passed
- [ ] Task 10.0.2: Design guidelines reviewed
- [ ] Task 10.1.1: Tab state and filter logic added
- [ ] Task 10.1.2: Tab UI component implemented
- [ ] Task 10.2.1: Lead card design replaced
- [ ] Task 10.3.1: Design system verification passed (0/0/0/0/0/0)
- [ ] Task 10.3.2: Final build validation passed
- [ ] Task 10.3.3: Comprehensive manual testing passed
- [ ] All functional tests pass
- [ ] All UI/visual tests pass
- [ ] All theme tests pass
- [ ] All responsive tests pass
- [ ] All regression tests pass
- [ ] TypeScript: 0 errors
- [ ] Build: Success
- [ ] No console errors
- [ ] No network errors

---

### PHASE 10 ROLLBACK

**If Task 10.1-10.3 fail:**

```bash
# Revert purchased leads page
git checkout HEAD -- src/app/installer/(dashboard)/purchased-leads/page.tsx

# Verify rollback
npx tsc --noEmit
npm run build
npm run dev

# Test
# Open /installer/purchased-leads
# Verify original design restored
```

**Verify Rollback Success:**
- ✅ Original purchased leads page restored
- ✅ No tabs present
- ✅ Original card design displays
- ✅ All functionality works
- ✅ No build errors
- ✅ No runtime errors

---

**End of Phase 10 - Installer Purchased Leads Page UI Enhancement**

---

## PHASE 18: Quote Builder Enhancements (Bidding UI - Phase 1)

**Date Added:** November 26, 2025  
**Goal:** Add brand dropdowns, battery capacity, GST/Incentive toggles, autosave, bidding mode  
**Prerequisites:** Phase 1-10 complete, GATE 0 passed  
**Audit Report:** `DOC/Installers/Bidding leads/BIDDING-UI-AUDIT-REPORT.md`

### Task 18.1: Add Mode Prop to QuoteBuilderModal

**File:** `src/components/QuoteBuilderModal.tsx`

**Changes:**
1. Add `mode` prop to interface (lines 20-30):
```typescript
interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSubmit: (quoteData: QuoteData) => Promise<void>;
  mode?: 'quote' | 'bid'; // NEW: Default 'quote'
}
```

2. Update destructuring:
```typescript
export default function QuoteBuilderModal({
  isOpen,
  onClose,
  lead,
  onSubmit,
  mode = 'quote' // NEW: Default to quote mode
}: QuoteBuilderModalProps) {
```

**Testing:**
```bash
npx tsc --noEmit
npm run build
```

**Expected:** 0 errors

---

### Task 18.2: Add Custom Brand Inputs

**File:** `src/components/QuoteBuilderModal.tsx`

**Changes:**
1. Add brand lists (after imports):
```typescript
const SOLAR_PANELS = [
  'JA Solar', 'Jinko Solar', 'LONGi Solar', 'Trina Solar', 'Canadian Solar',
  'Risen Energy', 'Seraphim', 'Phono Solar', 'Suntech', 'REC Group',
  'Q CELLS', 'SunPower', 'LG', 'Panasonic', 'Winaico', 'Custom...'
];

const INVERTERS = [
  'Fronius', 'SMA', 'Solis', 'GoodWe', 'Growatt', 'Sungrow',
  'Enphase', 'SolarEdge', 'Huawei', 'Custom...'
];

const BATTERIES = [
  'Tesla Powerwall 2', 'BYD Battery-Box Premium', 'sonnen Battery',
  'LG Chem RESU', 'Enphase Encharge', 'Sungrow SBR',
  'Pylontech US2000', 'Custom...'
];
```

2. Add custom input state:
```typescript
const [customPanelBrand, setCustomPanelBrand] = useState('');
const [customInverterBrand, setCustomInverterBrand] = useState('');
const [customBatteryBrand, setCustomBatteryBrand] = useState('');
const [showCustomPanelInput, setShowCustomPanelInput] = useState(false);
const [showCustomInverterInput, setShowCustomInverterInput] = useState(false);
const [showCustomBatteryInput, setShowCustomBatteryInput] = useState(false);
```

3. Update panel brand dropdown (around line 250):
```typescript
<select
  value={showCustomPanelInput ? 'Custom...' : panelBrand}
  onChange={(e) => {
    if (e.target.value === 'Custom...') {
      setShowCustomPanelInput(true);
      setPanelBrand('');
    } else {
      setShowCustomPanelInput(false);
      setPanelBrand(e.target.value);
    }
  }}
  className="form-select"
>
  <option value="">Select brand...</option>
  {SOLAR_PANELS.map(brand => (
    <option key={brand} value={brand}>{brand}</option>
  ))}
</select>

{showCustomPanelInput && (
  <input
    type="text"
    value={customPanelBrand}
    onChange={(e) => {
      setCustomPanelBrand(e.target.value);
      setPanelBrand(e.target.value);
    }}
    placeholder="Enter custom panel brand"
    className="form-input mt-2"
  />
)}
```

**Repeat for inverter and battery**

**Testing:**
1. Open QuoteBuilderModal
2. Select "Custom..." from panel dropdown
3. Verify custom input appears
4. Enter custom brand name
5. Verify it saves correctly

**Expected:** Custom inputs work, no console errors

---

### Task 18.3: Add Battery Capacity Field

**File:** `src/components/QuoteBuilderModal.tsx`

**Changes:**
1. Add state:
```typescript
const [batteryCapacity, setBatteryCapacity] = useState<number>(10);
```

2. Add input field (after battery brand):
```typescript
<div>
  <label className="block text-body-small mb-2 text-muted-foreground">
    Battery Capacity (kWh)
  </label>
  <input
    type="number"
    min="5"
    max="100"
    step="0.5"
    value={batteryCapacity}
    onChange={(e) => setBatteryCapacity(parseFloat(e.target.value))}
    className="form-input"
  />
  <p className="text-caption mt-1 text-muted-foreground">
    Typical range: 5-20 kWh for residential
  </p>
</div>
```

**Testing:**
1. Open modal
2. Verify capacity input visible
3. Enter 13.5 kWh
4. Verify it accepts decimal values

**Expected:** Capacity field works correctly

---

### Task 18.4: Add GST and Incentive Toggles

**File:** `src/components/QuoteBuilderModal.tsx`

**Changes:**
1. Replace fixed GST with toggles:
```typescript
const [includeGst, setIncludeGst] = useState(true);
const [includeIncentive, setIncludeIncentive] = useState(true);
const [incentiveAmount, setIncentiveAmount] = useState(2000);
const GST_PERCENT = 10;
```

2. Update calculation:
```typescript
const subtotal = systemCost + installationCost + additionalCosts;
const gstAmount = includeGst ? (subtotal * GST_PERCENT / 100) : 0;
const finalTotal = subtotal + gstAmount - (includeIncentive ? incentiveAmount : 0);
```

3. Add toggle UI (in pricing section):
```typescript
<div className="flex items-center gap-4">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={includeGst}
      onChange={(e) => setIncludeGst(e.target.checked)}
      className="form-checkbox"
    />
    <span className="text-body">Include GST (10%)</span>
  </label>
</div>

<div className="flex items-center gap-4">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={includeIncentive}
      onChange={(e) => setIncludeIncentive(e.target.checked)}
      className="form-checkbox"
    />
    <span className="text-body">Include Government Incentive</span>
  </label>
  {includeIncentive && (
    <input
      type="number"
      value={incentiveAmount}
      onChange={(e) => setIncentiveAmount(parseFloat(e.target.value))}
      className="form-input w-32"
      placeholder="Amount"
    />
  )}
</div>
```

**Testing:**
1. Toggle GST on/off → Verify total updates
2. Toggle incentive on/off → Verify total updates
3. Change incentive amount → Verify calculation correct

**Expected:** Toggles work, calculations accurate

---

### Task 18.5: Implement Real Autosave

**File:** `src/components/QuoteBuilderModal.tsx`

**Changes:**
1. Add autosave effect:
```typescript
useEffect(() => {
  if (!isOpen) return;
  
  const saveDraft = () => {
    const draftData = {
      leadId: lead.id,
      panelBrand,
      inverterBrand,
      batteryBrand,
      batteryCapacity,
      systemSize,
      systemCost,
      installationCost,
      additionalCosts,
      includeGst,
      includeIncentive,
      incentiveAmount,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`quote-draft-${lead.id}`, JSON.stringify(draftData));
  };
  
  const timer = setTimeout(saveDraft, 2000);
  return () => clearTimeout(timer);
}, [panelBrand, inverterBrand, batteryBrand, batteryCapacity, systemSize, 
    systemCost, installationCost, additionalCosts, includeGst, includeIncentive, incentiveAmount]);
```

2. Load draft on mount:
```typescript
useEffect(() => {
  if (!isOpen) return;
  
  const draftKey = `quote-draft-${lead.id}`;
  const draft = localStorage.getItem(draftKey);
  if (draft) {
    const data = JSON.parse(draft);
    setPanelBrand(data.panelBrand || '');
    setInverterBrand(data.inverterBrand || '');
    // ... restore all fields
  }
}, [isOpen, lead.id]);
```

**Testing:**
1. Fill quote form halfway
2. Close modal (don't submit)
3. Reopen modal
4. Verify all fields restored

**Expected:** Draft saves and restores correctly

---

### Task 18.6: Update Submit Button for Bidding Mode

**File:** `src/components/QuoteBuilderModal.tsx`

**Changes:**
1. Update button text based on mode:
```typescript
<Button
  onClick={handleSubmit}
  disabled={isSubmitting}
  variant="primary"
  className="flex-1"
>
  {mode === 'bid' ? (
    <>
      <SendIcon className="h-4 w-4 mr-2" />
      Submit Bid
    </>
  ) : (
    <>
      <SendIcon className="h-4 w-4 mr-2" />
      Send Quote
    </>
  )}
</Button>
```

2. Remove "Preview PDF" for bidding mode:
```typescript
{mode === 'quote' && (
  <Button
    onClick={handlePreviewPDF}
    disabled={isSubmitting}
    variant="secondary"
    className="flex-1"
  >
    <EyeIcon className="h-4 w-4 mr-2" />
    Preview PDF
  </Button>
)}
```

**Testing:**
1. Open modal in quote mode → Verify "Send Quote" button
2. Open modal in bid mode → Verify "Submit Bid" button
3. Verify "Preview PDF" only shows in quote mode

**Expected:** Button text conditional, PDF preview hidden for bids

---

### Task 18.7: Phase 18 Testing

**Checklist:**
- [ ] Mode prop works (quote/bid)
- [ ] Custom brand inputs appear and work
- [ ] Battery capacity field accepts decimals
- [ ] GST toggle updates total correctly
- [ ] Incentive toggle updates total correctly
- [ ] Autosave saves draft every 2 seconds
- [ ] Draft restores on modal reopen
- [ ] Submit button text changes by mode
- [ ] Preview PDF hidden in bid mode
- [ ] No hardcoded colors (0/0/0/0/0/0)
- [ ] TypeScript: 0 errors
- [ ] Build: Success

**Testing:**
```bash
npx tsc --noEmit
npm run build
npm run dev
```

**Expected:** All tests pass, 0 errors

**❌ STOP:** If any test fails, fix before Phase 19

---

## PHASE 19: Installer Bidding Modals (Bidding UI - Phase 2)

**Goal:** Add BidEvaluationModal, BiddingStatusBadge, update InstallerLeadFeed

### Task 19.1: Create BiddingStatusBadge Component

**File:** `src/components/BiddingStatusBadge.tsx` (NEW)

**Implementation:**
```typescript
import React from 'react';

interface BiddingStatusBadgeProps {
  status: 'no_bids' | 'draft' | 'submitted' | 'shortlisted' | 'not_selected';
  count?: number;
}

export default function BiddingStatusBadge({ status, count }: BiddingStatusBadgeProps) {
  const configs = {
    no_bids: {
      label: 'No Bids Yet',
      className: 'bg-muted/20 text-muted'
    },
    draft: {
      label: 'Draft Saved',
      className: 'bg-warning/20 text-warning'
    },
    submitted: {
      label: 'Bid Submitted',
      className: 'bg-info/20 text-info'
    },
    shortlisted: {
      label: 'Shortlisted',
      className: 'bg-success/20 text-success'
    },
    not_selected: {
      label: 'Not Selected',
      className: 'bg-error/20 text-error'
    }
  };

  const config = configs[status];

  return (
    <span className={`px-3 py-1 rounded-full text-caption ${config.className}`}>
      {config.label}
      {count !== undefined && count > 0 && ` (${count} bids)`}
    </span>
  );
}
```

**Testing:**
```bash
npx tsc --noEmit
```

**Expected:** 0 errors

---

### Task 19.2: Create BidEvaluationModal Component

**File:** `src/components/BidEvaluationModal.tsx` (NEW)

**Implementation:** (See BIDDING-UI-AUDIT-REPORT.md for full spec)

Key sections:
- Lead technical details (property, roof, budget)
- Your bid summary (if submitted)
- Competitor bids table (anonymized: "Installer A", "Installer B")
- Action buttons: "Place Bid" / "Update Bid"

**Testing:**
1. Open modal for bidding lead
2. Verify lead details display
3. Verify competitor bids show anonymously
4. Verify "Place Bid" opens QuoteBuilderModal in bid mode

**Expected:** Modal renders correctly, all data displays

---

### Task 19.3: Update InstallerLeadFeed for Bidding

**File:** `src/components/InstallerLeadFeed.tsx`

**Changes:**
1. Add import:
```typescript
import BiddingStatusBadge from './BiddingStatusBadge';
```

2. Update status badge section (around line 380):
```typescript
{lead.type === 'bidding' ? (
  <BiddingStatusBadge 
    status={lead.biddingStatus || 'no_bids'}
    count={lead.bidsCount}
  />
) : (
  <span className={`px-3 py-1 rounded-full text-caption ${statusConfig.className}`}>
    {statusConfig.label}
  </span>
)}
```

3. Add "View Bids" button for bidding leads:
```typescript
{lead.type === 'bidding' && (
  <Button
    onClick={() => handleViewBids(lead.id)}
    variant="info"
    className="flex items-center gap-2"
  >
    <EyeIcon className="h-4 w-4" />
    View Bids
  </Button>
)}
```

**Testing:**
1. View bidding lead in feed
2. Verify BiddingStatusBadge displays
3. Click "View Bids" → BidEvaluationModal opens

**Expected:** Bidding leads show correct status, modal opens

---

### Task 19.4: Phase 19 Testing

**Checklist:**
- [ ] BiddingStatusBadge renders all 5 statuses
- [ ] BidEvaluationModal displays lead details
- [ ] Competitor bids anonymized correctly
- [ ] "Place Bid" opens QuoteBuilderModal in bid mode
- [ ] InstallerLeadFeed shows bidding status badge
- [ ] "View Bids" button appears for bidding leads
- [ ] No hardcoded colors (0/0/0/0/0/0)
- [ ] TypeScript: 0 errors
- [ ] Build: Success

**Testing:**
```bash
npx tsc --noEmit
npm run build
```

**Expected:** All tests pass

**❌ STOP:** If any test fails, fix before Phase 20

---

## PHASE 20: Homeowner Bidding Review (Bidding UI - Phase 3)

**Goal:** Create HomeownerBiddingReviewModal for bid comparison

### Task 20.1: Create HomeownerBiddingReviewModal

**File:** `src/components/homeowner/HomeownerBiddingReviewModal.tsx` (NEW)

**Key Features:**
- Side-by-side bid comparison table
- Anonymized installer names
- System specs, pricing, ratings
- "Request Contact" button per bid
- Admin approval required before revealing contact

**Implementation:** (See BIDDING-UI-AUDIT-REPORT.md Section 4.2)

**Testing:**
1. Homeowner views bidding lead
2. Click "Review Bids"
3. Verify table shows all submitted bids
4. Verify installers anonymized
5. Click "Request Contact" → Admin notification created

**Expected:** Modal renders, data displays correctly

---

### Task 20.2: Update Homeowner Dashboard

**File:** `src/app/homeowner/dashboard/page.tsx`

**Changes:**
1. Add "Review Bids" button for bidding leads:
```typescript
{lead.quoteType === 'BIDDING' && lead.bidsCount > 0 && (
  <Button
    onClick={() => openBiddingReview(lead.id)}
    variant="primary"
  >
    Review {lead.bidsCount} Bid{lead.bidsCount !== 1 ? 's' : ''}
  </Button>
)}
```

**Testing:**
1. Homeowner dashboard
2. Find bidding lead
3. Verify "Review X Bids" button appears
4. Click button → HomeownerBiddingReviewModal opens

**Expected:** Button appears, modal opens

---

### Task 20.3: Phase 20 Testing

**Checklist:**
- [ ] HomeownerBiddingReviewModal renders
- [ ] Bid comparison table displays correctly
- [ ] Installers anonymized
- [ ] "Request Contact" button works
- [ ] Admin notification created on contact request
- [ ] "Review Bids" button appears on dashboard
- [ ] No hardcoded colors (0/0/0/0/0/0)
- [ ] TypeScript: 0 errors
- [ ] Build: Success

**Expected:** All tests pass

**❌ STOP:** If any test fails, fix before Phase 21

---

## PHASE 21: Admin Bidding Oversight (Bidding UI - Phase 4)

**Goal:** Add AdminBidsPanel for bid management

### Task 21.1: Create AdminBidsPanel Component

**File:** `src/components/admin/AdminBidsPanel.tsx` (NEW)

**Features:**
- View all bids for a lead
- Shortlist/reject bids
- Approve homeowner contact requests
- Flag suspicious bids

**Implementation:** (See BIDDING-UI-AUDIT-REPORT.md Section 4.3)

**Testing:**
1. Admin opens lead with bids
2. Click "Manage Bids"
3. Verify all bids visible with installer names
4. Shortlist 2 bids
5. Verify homeowner sees only shortlisted bids

**Expected:** Admin panel works, shortlist feature functional

---

### Task 21.2: Update AdminLeadManagementModal

**File:** `src/components/admin/AdminLeadManagementModal.tsx`

**Changes:**
1. Add "Bids" tab (if lead is bidding type)
2. Render AdminBidsPanel in tab

**Testing:**
1. Admin opens bidding lead
2. Verify "Bids" tab appears
3. Click tab → AdminBidsPanel displays

**Expected:** Tab shows, panel renders

---

### Task 21.3: Phase 21 Testing

**Checklist:**
- [ ] AdminBidsPanel displays all bids
- [ ] Shortlist feature works
- [ ] Reject feature works
- [ ] Contact approval workflow works
- [ ] "Bids" tab appears in modal
- [ ] No hardcoded colors (0/0/0/0/0/0)
- [ ] TypeScript: 0 errors
- [ ] Build: Success

**Expected:** All tests pass

**❌ STOP:** If any test fails, fix before Phase 22

---

## PHASE 22: Full System Verification (Bidding UI - Phase 5)

**Goal:** End-to-end testing of all bidding features

### Task 22.1: Installer Workflow Test

**Test Steps:**
1. Installer views bidding lead in feed
2. Clicks "View Bids" → BidEvaluationModal opens
3. Clicks "Place Bid" → QuoteBuilderModal opens in bid mode
4. Fills custom brands, capacity, toggles
5. Draft autosaves
6. Submits bid
7. Bid appears in "submitted" status

**Expected:** Full workflow works, no errors

---

### Task 22.2: Homeowner Workflow Test

**Test Steps:**
1. Homeowner views bidding lead
2. Clicks "Review Bids"
3. Compares anonymized bids
4. Requests contact for 2 bids
5. Admin approves
6. Contact info revealed to homeowner

**Expected:** Full workflow works

---

### Task 22.3: Admin Workflow Test

**Test Steps:**
1. Admin opens bidding lead
2. Views all bids with installer names
3. Shortlists 3 bids
4. Homeowner sees only shortlisted bids
5. Approves contact requests
6. Monitors bid activity

**Expected:** Admin controls work correctly

---

### Task 22.4: Design System Verification

**Run all 6 commands:**
```powershell
Select-String -Path "src\components\QuoteBuilderModal.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"
Select-String -Path "src\components\QuoteBuilderModal.tsx" -Pattern "dark:"
Select-String -Path "src\components\QuoteBuilderModal.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"
Select-String -Path "src\components\QuoteBuilderModal.tsx" -Pattern "text-white|bg-white|text-black|bg-black"
Select-String -Path "src\components\QuoteBuilderModal.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"
Select-String -Path "src\components\QuoteBuilderModal.tsx" -Pattern "sm:text-|md:text-|lg:text-"
```

**Repeat for all new components**

**Expected:** 0/0/0/0/0/0 for all components

---

### Task 22.5: Phase 22 Completion

**Final Checklist:**
- [ ] All installer tests pass
- [ ] All homeowner tests pass
- [ ] All admin tests pass
- [ ] Design system compliance verified
- [ ] TypeScript: 0 errors
- [ ] Build: Success
- [ ] All 3 themes work
- [ ] All 5 breakpoints work
- [ ] No console errors
- [ ] No network errors

**Testing:**
```bash
npx tsc --noEmit
npm run build
npm run dev
```

**Expected:** All tests pass, ready for backend integration

---

**End of Bidding UI Implementation Phases**

**Next Steps:** Backend API development (deferred per brainstorm3.md)

---

**End of Implementation Tasks**


