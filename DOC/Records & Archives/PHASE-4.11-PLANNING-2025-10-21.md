# Phase 4.11 Planning - Enhanced Homeowner Quote Request Flow
**Date:** October 21, 2025  
**Status:** ✅ PLANNING COMPLETE - AWAITING APPROVAL TO START IMPLEMENTATION  
**Related Commit:** 6d234cc (guest flow fixes completed)

---

## 🎯 OBJECTIVE

Enhance the homeowner quote request experience with:
1. **Simplified prefilled quote form** (single-page, not multi-step)
2. **BIDDING quote support** with 1x limit per user
3. **CRUD operations** for lead management (Edit/Update/Cancel/Preview)
4. **Quote type distribution modal** with icons (trophy/phone/document)
5. **Price visibility control** (remove from homeowner views)

---

## 📝 USER REQUIREMENTS (DIRECT QUOTES)

From user message on October 21, 2025:

> "when the users already have generated 1 lead, it should showup a pre-filled form which is just a clone of the instantQUotfrom but not in multistep"

> "3 types of quote to generate within the remaining balance. the bidding quote will be limited to 1 only"

> "add trophy icon in the bidding quotes after generated, also add icons for the written quote and call/visit quotes"

> "After the quotes are generated each quote card should be able to edit, update and cancel. edit and update is not allowed after the admin approved"

> "no need to show the leadPrice on this for homeowners. remove that component from the modal"

---

## 🔍 CURRENT STATE ANALYSIS

### ✅ What Currently Exists

**Database Schema (prisma/schema.prisma):**
- ✅ Lead model with `quoteData` (Json) field for storing form data
- ✅ LeadQuoteType enum: CALL_VISIT, WRITTEN_QUOTE, BIDDING
- ✅ LeadStatus enum includes: PENDING_APPROVAL, APPROVED, PURCHASED, CANCELLED
- ✅ Cancellation fields: cancelledAt, cancelledReason, cancelledBy
- ✅ User model with quotaBalance

**Services (src/lib/services/lead-service.ts):**
- ✅ createLead() function creates leads with quoteData preservation
- ✅ HomeownerLeadSummaryItem interface includes quoteData field
- ✅ getHomeownerLeadSummary() returns recent leads with full data

**UI Components:**
- ✅ InstantQuoteForm: Multi-step form in src/app/page.tsx
- ✅ QuoteTypeDistributionModal: Basic implementation with partial BIDDING support
- ✅ HomeownerDashboard: Displays recent leads in card format

**API Endpoints:**
- ✅ POST /api/leads - Create new lead
- ✅ GET /api/homeowner/dashboard - Fetch summary with recent leads

### ❌ What's Missing

**Database Schema:**
- ❌ No User.biddingLeadsSubmitted field to track BIDDING quota usage

**Services:**
- ❌ No canEditLead() validation function
- ❌ No updateLead() function for editing leads
- ❌ No canCancelLead() validation function
- ❌ No cancelLead() function for cancellation with quota restoration
- ❌ No BIDDING limit enforcement in createLead()
- ❌ No bidding quota info in getHomeownerLeadSummary()

**API Endpoints:**
- ❌ No PATCH /api/leads/[id] for updates
- ❌ No PATCH /api/leads/[id]/cancel for cancellation
- ❌ No bidding quota in dashboard response

**UI Components:**
- ❌ No SimplifiedQuoteForm (single-page prefilled form)
- ❌ No LeadEditModal component
- ❌ No LeadPreviewModal component (read-only view)
- ❌ QuoteTypeDistributionModal needs BIDDING + icons enhancement
- ❌ Price display still visible in QuoteTypeDistributionModal
- ❌ No Edit/Cancel/Preview buttons on lead cards
- ❌ No bidding quota indicator in dashboard

---

## 📋 IMPLEMENTATION PLAN

### Phase Structure: 26 Tasks (T255-T280)

**Category Breakdown:**
- **Schema & Database:** 3 tasks (T255-T257)
- **Services & Business Logic:** 6 tasks (T258-T263)
- **API Endpoints:** 3 tasks (T264-T266)
- **UI Components - Forms:** 3 tasks (T267-T269)
- **UI Components - Distribution:** 2 tasks (T270-T271)
- **Dashboard Integration:** 3 tasks (T272-T274)
- **Testing & Validation:** 6 tasks (T275-T280)

### Implementation Sequence (Dependency Order)

**Stage 1: Foundation (BLOCKING)**
```
T255: Add User.biddingLeadsSubmitted field
T256: Run migration
T257: Generate Prisma client
```
⏱️ Estimated: 30 minutes  
🚧 Blocks: All services and API work

**Stage 2: Business Logic (BLOCKING FOR API)**
```
T258: Create canEditLead() function
T259: Create updateLead() function
T260: Create canCancelLead() function
T261: Create cancelLead() function
T262: Update createLead() with BIDDING enforcement
T263: Update getHomeownerLeadSummary() with bidding quota
```
⏱️ Estimated: 2-3 hours  
🚧 Blocks: API endpoint implementation

**Stage 3: API Layer (BLOCKING FOR UI)**
```
T264: Create PATCH /api/leads/[id]
T265: Create PATCH /api/leads/[id]/cancel
T266: Update GET /api/homeowner/dashboard
```
⏱️ Estimated: 1.5-2 hours  
🚧 Blocks: UI component integration

**Stage 4: UI Components (CAN PARALLEL)**
```
T267: Create SimplifiedQuoteForm
T268: Create LeadEditModal
T269: Create LeadPreviewModal
T270: Enhance QuoteTypeDistributionModal
T271: Remove price from QuoteTypeDistributionModal
```
⏱️ Estimated: 3-4 hours  
✅ Can work in parallel after API ready

**Stage 5: Dashboard Integration**
```
T272: Add Edit/Cancel/Preview buttons
T273: Update "Request More Quotes" button
T274: Add bidding quota indicator
```
⏱️ Estimated: 1-2 hours  
✅ Final wiring and styling

**Stage 6: Testing & Validation**
```
T275-T280: Comprehensive testing scenarios
```
⏱️ Estimated: 1-2 hours  
✅ End-to-end validation

### Total Estimated Time: 8-10 hours

---

## 🎨 USER JOURNEY FLOW

### Scenario 1: New Quote Request (Has Existing Leads)

```
User clicks "Request More Quotes"
    ↓
SimplifiedQuoteForm appears (prefilled with last lead data)
    ↓
User reviews/modifies: address, roof size, bill, property type
    ↓
User clicks "Continue"
    ↓
QuoteTypeDistributionModal appears
    ↓
User selects: CALL_VISIT (🏠), WRITTEN_QUOTE (📄), BIDDING (🏆)
    ↓
System validates:
    - Total selections ≤ remaining quota
    - BIDDING selections ≤ 1 (if never used before)
    ↓
Multiple leads created (one per selection)
    ↓
Dashboard updates with new lead cards
```

### Scenario 2: Edit Existing Lead

```
User views "Recent Quote Requests"
    ↓
User sees lead card with status "Awaiting Review"
    ↓
User clicks "Edit" button
    ↓
LeadEditModal appears with SimplifiedQuoteForm (prefilled)
    ↓
User modifies: address, bill, etc.
    ↓
User clicks "Save Changes"
    ↓
API validates: status === PENDING_APPROVAL
    ↓
Lead updated with audit log
    ↓
Dashboard refreshes with updated data
```

### Scenario 3: Cancel Lead

```
User views lead card with status "Awaiting Review"
    ↓
User clicks "Cancel" button
    ↓
Confirmation dialog: "Are you sure? This will restore 1 quote to your balance."
    ↓
User confirms
    ↓
API validates: status !== PURCHASED
    ↓
Lead status → CANCELLED, quota restored
    ↓
Dashboard updates: lead removed, balance +1
```

### Scenario 4: Preview Approved Lead

```
User views lead card with status "Approved"
    ↓
User clicks "View Details" button
    ↓
LeadPreviewModal appears (read-only, no editing)
    ↓
Shows: address, roof size, bill, property type, quote type
    ↓
User clicks "Close"
```

---

## 🔑 KEY FEATURES & VALIDATIONS

### BIDDING Quota Enforcement

**Business Rules:**
- ✅ Each user can create maximum 1 BIDDING quote (lifetime limit)
- ✅ Track via User.biddingLeadsSubmitted field
- ✅ Validation in createLead() service function
- ✅ UI shows bidding quota in distribution modal

**Implementation:**
```typescript
// In lead-service.ts createLead()
if (quoteType === 'BIDDING') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { biddingLeadsSubmitted: true }
  });
  
  if (user.biddingLeadsSubmitted >= 1) {
    throw new Error('BIDDING quota exceeded (max 1)');
  }
  
  // Increment counter after successful creation
  await prisma.user.update({
    where: { id: userId },
    data: { biddingLeadsSubmitted: { increment: 1 } }
  });
}
```

### Edit/Update Restrictions

**Business Rules:**
- ✅ Only leads with status PENDING_APPROVAL can be edited
- ✅ After admin approval (status → APPROVED), editing disabled
- ✅ After installer purchase (status → PURCHASED), editing disabled
- ✅ UI shows "Edit" button only when canEditLead() returns true

**Implementation:**
```typescript
// In lead-service.ts
export function canEditLead(lead: Lead): boolean {
  return lead.status === LeadStatus.PENDING_APPROVAL;
}

// In LeadCard component
{canEditLead(lead) && (
  <Button onClick={() => openEditModal(lead)}>
    Edit
  </Button>
)}
```

### Cancel Restrictions

**Business Rules:**
- ✅ Cannot cancel if status === PURCHASED (installer paid)
- ✅ Can cancel: PENDING_APPROVAL, APPROVED
- ✅ Cancellation restores 1 quota to user balance
- ✅ Audit logging: cancelledAt, cancelledReason, cancelledBy

**Implementation:**
```typescript
// In lead-service.ts
export function canCancelLead(lead: Lead): boolean {
  return lead.status !== LeadStatus.PURCHASED;
}

export async function cancelLead(
  leadId: string, 
  userId: string, 
  reason: string
) {
  // Update lead status
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: LeadStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledReason: reason,
      cancelledBy: userId
    }
  });
  
  // Restore quota
  await prisma.user.update({
    where: { id: userId },
    data: { quotaBalance: { increment: 1 } }
  });
}
```

### Quote Type Icons

**Mapping:**
- 🏆 BIDDING → Trophy icon (lucide-react Trophy)
- 📞 CALL_VISIT → Phone icon (lucide-react Phone)
- 📄 WRITTEN_QUOTE → Document icon (lucide-react FileText)

**Usage:**
```tsx
// In LeadCard and QuoteTypeDistributionModal
const QUOTE_TYPE_ICONS = {
  BIDDING: Trophy,
  CALL_VISIT: Phone,
  WRITTEN_QUOTE: FileText
};

const Icon = QUOTE_TYPE_ICONS[lead.quoteType];
<Icon className="h-5 w-5" />
```

---

## 📂 FILES TO MODIFY/CREATE

### Modify (7 files):
1. **prisma/schema.prisma** - Add biddingLeadsSubmitted field
2. **src/lib/services/lead-service.ts** - Add 6 new functions
3. **src/app/homeowner/dashboard/page.tsx** - Add buttons, integrate modals
4. **src/components/homeowner/QuoteTypeDistributionModal.tsx** - Add BIDDING + icons
5. **src/app/page.tsx** - Wire SimplifiedQuoteForm flow
6. **src/types/lead.ts** - Extend interfaces if needed
7. **src/lib/auth/constants.ts** - No changes (just verify HOMEOWNER role)

### Create (6 files):
1. **src/components/homeowner/SimplifiedQuoteForm.tsx** - Single-page form
2. **src/components/homeowner/LeadEditModal.tsx** - Edit modal wrapper
3. **src/components/homeowner/LeadPreviewModal.tsx** - Read-only preview
4. **src/app/api/leads/[id]/route.ts** - PATCH endpoint for updates
5. **src/app/api/leads/[id]/cancel/route.ts** - PATCH endpoint for cancellation
6. **DOC/Records/PHASE-4.11-IMPLEMENTATION-2025-10-21.md** - Implementation record

---

## ✅ VALIDATION CHECKLIST (30+ Checkpoints)

### Schema & Database (5 checks)
- [ ] User.biddingLeadsSubmitted field added (Int @default(0))
- [ ] Migration runs successfully without errors
- [ ] Prisma client generated with new field
- [ ] Existing users have biddingLeadsSubmitted = 0
- [ ] Field accessible in User model queries

### Services (12 checks)
- [ ] canEditLead() returns true only for PENDING_APPROVAL
- [ ] canEditLead() returns false for APPROVED/PURCHASED
- [ ] updateLead() validates ownership (userId matches)
- [ ] updateLead() validates status (only PENDING_APPROVAL)
- [ ] updateLead() updates quoteData field
- [ ] canCancelLead() returns false for PURCHASED
- [ ] canCancelLead() returns true for PENDING_APPROVAL/APPROVED
- [ ] cancelLead() updates status to CANCELLED
- [ ] cancelLead() restores quota (+1)
- [ ] createLead() blocks BIDDING if biddingLeadsSubmitted >= 1
- [ ] createLead() increments biddingLeadsSubmitted after BIDDING creation
- [ ] getHomeownerLeadSummary() includes biddingQuotaRemaining field

### API (9 checks)
- [ ] PATCH /api/leads/[id] requires authentication
- [ ] PATCH /api/leads/[id] validates ownership
- [ ] PATCH /api/leads/[id] calls updateLead() service
- [ ] PATCH /api/leads/[id] returns 403 if not editable
- [ ] PATCH /api/leads/[id]/cancel requires authentication
- [ ] PATCH /api/leads/[id]/cancel validates ownership
- [ ] PATCH /api/leads/[id]/cancel calls cancelLead() service
- [ ] PATCH /api/leads/[id]/cancel returns 403 if not cancellable
- [ ] GET /api/homeowner/dashboard returns biddingQuotaRemaining

### UI Components (15 checks)
- [ ] SimplifiedQuoteForm renders all fields (address, roof, bill, property)
- [ ] SimplifiedQuoteForm prefills from quoteData prop
- [ ] SimplifiedQuoteForm submits to onSubmit callback
- [ ] LeadEditModal opens with prefilled SimplifiedQuoteForm
- [ ] LeadEditModal calls PATCH /api/leads/[id] on save
- [ ] LeadEditModal shows success/error feedback
- [ ] LeadPreviewModal shows read-only fields (no inputs)
- [ ] LeadPreviewModal does NOT have Save button
- [ ] QuoteTypeDistributionModal shows BIDDING option
- [ ] QuoteTypeDistributionModal shows trophy icon for BIDDING
- [ ] QuoteTypeDistributionModal shows phone icon for CALL_VISIT
- [ ] QuoteTypeDistributionModal shows document icon for WRITTEN_QUOTE
- [ ] QuoteTypeDistributionModal disables BIDDING if biddingQuotaRemaining = 0
- [ ] QuoteTypeDistributionModal does NOT show leadPrice
- [ ] Dashboard lead cards show Edit/Cancel/View buttons conditionally

### End-to-End (10+ checks)
- [ ] Homeowner with existing lead sees "Request More Quotes" button
- [ ] Clicking button opens SimplifiedQuoteForm (prefilled)
- [ ] SimplifiedQuoteForm → QuoteTypeDistributionModal flow works
- [ ] Creating BIDDING lead succeeds (first time)
- [ ] Creating second BIDDING lead fails with quota error
- [ ] Edit button visible on PENDING_APPROVAL leads
- [ ] Edit button hidden on APPROVED/PURCHASED leads
- [ ] Editing lead updates database and refreshes dashboard
- [ ] Cancel button visible on non-PURCHASED leads
- [ ] Cancelling lead restores quota and removes from dashboard
- [ ] Preview button shows read-only modal for APPROVED leads
- [ ] Icons display correctly (trophy/phone/document)

---

## 🚀 NEXT STEPS

### 1. **USER APPROVAL REQUIRED**
- Review this document
- Review Phase 4.11 tasks in `specs/002-lead-journey-life/tasks.md`
- Confirm requirements match expectations
- Approve to start implementation OR request modifications

### 2. **IF APPROVED - Implementation Starts With:**
```powershell
# Stage 1: Schema (T255-T257)
cd "d:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch"
npx prisma migrate dev --name add-bidding-tracking
npx prisma generate
```

### 3. **Implementation Order:**
- ✅ **Stage 1:** Schema & migration (30 min)
- ✅ **Stage 2:** Service functions (2-3 hours)
- ✅ **Stage 3:** API endpoints (1.5-2 hours)
- ✅ **Stage 4:** UI components (3-4 hours)
- ✅ **Stage 5:** Dashboard integration (1-2 hours)
- ✅ **Stage 6:** Testing & validation (1-2 hours)

### 4. **Success Criteria:**
- All 26 tasks (T255-T280) completed
- All 30+ validation checkpoints passing
- Manual testing confirms all flows working
- No TypeScript errors (`npx tsc --noEmit`)
- Build succeeds (`npm run build`)
- Git commit with descriptive message
- Documentation updated (this file + implementation record)

---

## 📊 EXPECTED OUTCOMES

### 10 Deliverables:

1. ✅ **User.biddingLeadsSubmitted** field in database (migration + client)
2. ✅ **6 new service functions** in lead-service.ts (1200+ lines of business logic)
3. ✅ **3 new API endpoints** (PATCH update, PATCH cancel, GET dashboard extended)
4. ✅ **SimplifiedQuoteForm** component (single-page prefilled form)
5. ✅ **LeadEditModal** component (edit wrapper with form)
6. ✅ **LeadPreviewModal** component (read-only view)
7. ✅ **Enhanced QuoteTypeDistributionModal** (BIDDING + icons + price removal)
8. ✅ **Updated Dashboard** (Edit/Cancel/Preview buttons + bidding quota indicator)
9. ✅ **Comprehensive testing** (6 test scenarios with 30+ checkpoints)
10. ✅ **Documentation** (implementation record + updated tasks.md)

---

## 📝 NOTES & CONSIDERATIONS

### Design Decisions:

**Why SimplifiedQuoteForm instead of reusing InstantQuoteForm?**
- InstantQuoteForm is multi-step (5 steps) - user requested single-page
- Prefilling multi-step form is complex state management
- SimplifiedQuoteForm is cleaner, faster UX for repeat users

**Why BIDDING limit at User level instead of global?**
- Per-user tracking allows future flexibility (e.g., premium users get 3)
- User.biddingLeadsSubmitted field is scalable
- Global limit would require separate Settings model

**Why restore quota on cancellation?**
- User paid for quota, should get it back if lead unused
- Only restore if status !== PURCHASED (installer hasn't paid yet)
- Encourages users to manage their leads actively

**Why separate Edit/Preview modals?**
- Edit mode requires validation, save logic, error handling
- Preview mode is simpler (read-only, no state management)
- Separation of concerns = cleaner code

### Edge Cases Handled:

- ✅ User tries to edit APPROVED lead → canEditLead() returns false, button hidden
- ✅ User tries to cancel PURCHASED lead → canCancelLead() returns false, button hidden
- ✅ User tries to create 2nd BIDDING lead → createLead() throws error, modal shows message
- ✅ User has 0 quota left → distribution modal validates total ≤ 0, prevents submission
- ✅ User edits lead then admin approves → Edit button disappears on next dashboard refresh

### Pre-Existing Issues (NOT IN SCOPE):

- ⚠️ Build has 20+ TypeScript errors (process.env types) - separate issue, not blocking
- ⚠️ No email notifications on lead status change - future feature
- ⚠️ No lead history/audit trail in UI - future feature
- ⚠️ No bulk operations (cancel multiple leads) - future feature

---

## 🔗 RELATED DOCUMENTS

- **Tasks File:** `specs/002-lead-journey-life/tasks.md` (Phase 4.11, lines 2650+)
- **Previous Phase:** `DOC/Records/PHASE-4.10-IMPLEMENTATION-STATUS-2025-10-21.md`
- **Guest Flow Fixes:** `DOC/Records/GUEST-FLOW-RESOLUTION-2025-10-21.md`
- **Schema:** `prisma/schema.prisma` (Lead and User models)
- **Services:** `src/lib/services/lead-service.ts`
- **Dashboard:** `src/app/homeowner/dashboard/page.tsx`

---

**STATUS:** ✅ **PLANNING COMPLETE - READY FOR IMPLEMENTATION**  
**AWAITING:** User approval to begin Stage 1 (Schema changes)  
**CONTACT:** Reply with "start implementation" or request modifications
