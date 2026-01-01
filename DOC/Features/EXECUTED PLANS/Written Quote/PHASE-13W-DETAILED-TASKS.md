# Phase 13W — Written Quote Negotiation (Copy & Adapt from Bidding Flow)
**Date**: December 22, 2025  
**Status**: IN PROGRESS  
**Priority**: P0 (Critical for Written Quote feature)

**References**:
- **Primary Audit**: DOC/Features/Written Quote/WRITTEN-QUOTE-COPY-BID-AUDIT.md (Complete system analysis)
- Original Audit: DOC/Features/Written Quote/WRITTEN-QUOTE-AUDIT-2025-12-14.md
- Guidelines: DOC/GUIDELINES & SOT/README.md, IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md
- Source: DOC/Features/Written Quote/Raw_plan.md
- Task Tracking: specs/008-description-enhance-existing/tasks.md (Phase 13W section)

**Strategy**: Copy existing Bid flow components and backend (QuoteBuilderModal + HomeownerBiddingReviewModal + /api/bids), then adapt for negotiation functionality

**Key Differences from Bidding Flow**:
1. ✅ Add 7 negotiation fields to database (counter amounts, revised amounts, agreed amount, timestamps)
2. ✅ Add negotiation status tracking (PENDING → HOMEOWNER_COUNTERED → INSTALLER_RESPONDED → AGREED)
3. ✅ Add 3 new API endpoints: PATCH /counter, PATCH /revise, POST /agree
4. ✅ Add NegotiationTimeline shared component for both modals
5. ✅ Modify right column in both modals to show negotiation history + action buttons
6. ✅ Enforce 1-time counter limit for homeowner
7. ✅ Allow unlimited revisions for installer
8. ✅ "Done Deal" button for both parties to finalize

---

## PHASE 1: Database & Types (P0 - Foundation)

### T13W-1.1: Create WrittenQuote Prisma Model ⏳
**File**: `prisma/schema.prisma`  
**Effort**: 30 minutes  
**Dependencies**: None

**Action**:
1. Add WrittenQuote model (based on Bid model structure)
2. Add 7 negotiation-specific fields:
   - `negotiationStatus` (String, default 'PENDING')
   - `homeownerCounterAmount` (Float?, nullable)
   - `homeownerCounterAt` (DateTime?, nullable)
   - `installerRevisedAmount` (Float?, nullable)
   - `installerRevisedAt` (DateTime?, nullable)
   - `agreedAmount` (Float?, nullable)
   - `agreedAt` (DateTime?, nullable)
   - `agreedBy` (String?, nullable - USER_ID)

3. Add User relation:
   ```prisma
   model User {
     // ... existing fields
     writtenQuotes WrittenQuote[] @relation("installer_written_quotes")
   }
   ```

4. Add Lead relation:
   ```prisma
   model Lead {
     // ... existing fields
     writtenQuotes WrittenQuote[]
   }
   ```

**Testing**:
```bash
npx prisma format
npx prisma validate
```

**Expected Output**: "Environment variables loaded from .env" + "The schema is valid"

**Acceptance Criteria**:
- ✅ Schema validates without errors
- ✅ All 6 indexes created (leadId, installerId, negotiationStatus, status, createdAt, unique constraint)
- ✅ Relations properly defined with cascade delete

**Rollback Plan**: If errors, revert schema.prisma changes via git

---

### T13W-1.2: Create Database Migration ⏳
**File**: `prisma/migrations/YYYYMMDDHHMMSS_add_written_quotes/migration.sql`  
**Effort**: 15 minutes  
**Dependencies**: T13W-1.1

**Action**:
```bash
npx prisma migrate dev --name add_written_quotes
```

**What This Creates**:
- Migration file with CREATE TABLE statement
- All columns with correct types
- All indexes (6 total)
- Foreign key constraints to leads and users tables

**Testing**:
1. Check migration file created in `prisma/migrations/`
2. Open Prisma Studio: `npx prisma studio`
3. Verify "written_quotes" table exists with all columns

**Acceptance Criteria**:
- ✅ Migration file created successfully
- ✅ Database table "written_quotes" created
- ✅ No migration errors in terminal
- ✅ Can see table in Prisma Studio

**Rollback Plan**: `npx prisma migrate reset` (WARNING: Deletes all data)

---

### T13W-1.3: Generate Prisma Client ⏳
**Effort**: 5 minutes  
**Dependencies**: T13W-1.2

**Action**:
```bash
npx prisma generate
```

**What This Does**:
- Regenerates `@prisma/client` with WrittenQuote type
- Updates TypeScript autocomplete

**Testing**:
1. In VSCode, create test file:
   ```typescript
   import { prisma } from '@/lib/prisma';
   const quote = await prisma.writtenQuote.findMany();
   ```
2. Verify autocomplete suggests `writtenQuote`
3. Delete test file

**Acceptance Criteria**:
- ✅ Prisma Client regenerated
- ✅ WrittenQuote type available in TypeScript
- ✅ No errors in terminal

---

### T13W-1.4: Create TypeScript Types ⏳
**File**: `src/types/written-quote.ts` (NEW)  
**Effort**: 20 minutes  
**Dependencies**: None

**Action**: Create file with all required types (see audit report Section 3.2 for full code)

**Key Types**:
- `CreateWrittenQuoteRequest` (POST body)
- `CounterOfferRequest` (PATCH /counter body)
- `ReviseQuoteRequest` (PATCH /revise body)
- `AgreeQuoteRequest` (POST /agree body)
- `GetWrittenQuotesResponse` (GET response)
- `NegotiationEvent` (Timeline item)

**Testing**:
1. Import in another file: `import { CreateWrittenQuoteRequest } from '@/types/written-quote';`
2. Verify TypeScript autocomplete works
3. Run `npx tsc --noEmit` → 0 errors

**Acceptance Criteria**:
- ✅ All 6 interfaces exported correctly
- ✅ No TypeScript compilation errors
- ✅ Types match Prisma schema structure

---

## PHASE 2: Backend APIs (P0 - Core Functionality)

### T13W-2.1: Create POST /api/written-quotes ⏳
**File**: `src/app/api/written-quotes/route.ts` (NEW)  
**Effort**: 45 minutes  
**Dependencies**: T13W-1.4

**Action**:
1. Copy entire `src/app/api/bids/route.ts`
2. Rename all `bid` → `writtenQuote`
3. Update documentation comments
4. Set `negotiationStatus: 'PENDING'` on create
5. Keep all validations identical

**Validations** (same as bids):
- Installer authentication via `requireRole('INSTALLER')`
- Lead exists check
- No duplicate check: `findUnique({ where: { leadId_installerId: {...} } })`
- Amount > 0 validation

**Testing**:
1. Use Postman/cURL:
   ```bash
   curl -X POST http://localhost:3000/api/written-quotes \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <INSTALLER_TOKEN>" \
     -d '{
       "leadId": "test-lead-id",
       "amount": 10000,
       "systemData": {...},
       "includeGst": true,
       "gstPercent": 10
     }'
   ```
2. Expected: 201 Created + `{ success: true, writtenQuoteId: "..." }`
3. Check Prisma Studio → Written Quote record created
4. Check notifications table → Homeowner notification created

**Acceptance Criteria**:
- ✅ Endpoint creates Written Quote
- ✅ All 8 JSON fields stored correctly
- ✅ Homeowner notification sent
- ✅ Audit log created
- ✅ Duplicate submission blocked (403)

**Error Handling**:
- 400: Missing leadId or amount
- 401: Not authenticated
- 403: Not installer role OR duplicate submission
- 404: Lead not found
- 500: Database error

---

### T13W-2.2: Add GET /api/written-quotes?leadId={id} ⏳
**File**: `src/app/api/written-quotes/route.ts` (same file)  
**Effort**: 20 minutes  
**Dependencies**: T13W-2.1

**Action**: Add GET handler to same file

**Implementation**: (See audit report Section 3.3 for code)

**Testing**:
```bash
curl http://localhost:3000/api/written-quotes?leadId=test-lead-id \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: 200 + `{ writtenQuotes: [...] }`

**Acceptance Criteria**:
- ✅ Returns all Written Quotes for lead
- ✅ Includes installer info (companyName, email)
- ✅ Ordered by createdAt DESC
- ✅ Respects role permissions (homeowner sees own leads, installer sees own quotes)

---

### T13W-2.3: Create PATCH /api/written-quotes/[id]/counter ⏳
**File**: `src/app/api/written-quotes/[id]/counter/route.ts` (NEW)  
**Effort**: 35 minutes  
**Dependencies**: T13W-2.1

**Action**: Create counter offer endpoint (homeowner only, 1 time limit)

**Implementation**: (See audit report Section 3.3 for full code)

**Validations**:
1. ✅ Homeowner authentication
2. ✅ Homeowner owns this lead
3. ✅ Not already countered (`homeownerCounterAt` is null)
4. ✅ Not already agreed (`negotiationStatus` !== 'AGREED')
5. ✅ Counter amount > 0

**Testing**:
```bash
# First counter - should succeed
curl -X PATCH http://localhost:3000/api/written-quotes/{id}/counter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <HOMEOWNER_TOKEN>" \
  -d '{ "counterAmount": 8000, "message": "Can we meet in the middle?" }'

# Expected: 200 + { success: true }

# Second counter - should fail
curl -X PATCH http://localhost:3000/api/written-quotes/{id}/counter \
  -H "Authorization: Bearer <HOMEOWNER_TOKEN>" \
  -d '{ "counterAmount": 7500 }'

# Expected: 403 + { error: "You have already submitted a counter offer (1 time limit)" }
```

**Acceptance Criteria**:
- ✅ Counter offer saved to database
- ✅ `homeownerCounterAt` timestamp set
- ✅ `negotiationStatus` updated to 'HOMEOWNER_COUNTERED'
- ✅ Installer notification sent
- ✅ 2nd counter attempt blocked

---

### T13W-2.4: Create PATCH /api/written-quotes/[id]/revise ⏳
**File**: `src/app/api/written-quotes/[id]/revise/route.ts` (NEW)  
**Effort**: 30 minutes  
**Dependencies**: T13W-2.1

**Action**: Create revise quote endpoint (installer only, unlimited)

**Validations**:
1. ✅ Installer authentication
2. ✅ Installer owns this quote
3. ✅ Not already agreed
4. ✅ Revised amount > 0

**Testing**:
```bash
# First revision
curl -X PATCH http://localhost:3000/api/written-quotes/{id}/revise \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <INSTALLER_TOKEN>" \
  -d '{ "revisedAmount": 9500 }'

# Second revision (should also succeed - no limit)
curl -X PATCH http://localhost:3000/api/written-quotes/{id}/revise \
  -H "Authorization: Bearer <INSTALLER_TOKEN>" \
  -d '{ "revisedAmount": 9000 }'

# Both should return: 200 + { success: true }
```

**Acceptance Criteria**:
- ✅ Revised amount saved
- ✅ `installerRevisedAt` timestamp updated
- ✅ `negotiationStatus` updated to 'INSTALLER_RESPONDED'
- ✅ Homeowner notification sent
- ✅ No limit on number of revisions

---

### T13W-2.5: Create POST /api/written-quotes/[id]/agree ⏳
**File**: `src/app/api/written-quotes/[id]/agree/route.ts` (NEW)  
**Effort**: 40 minutes  
**Dependencies**: T13W-2.3, T13W-2.4

**Action**: Create "Done Deal" endpoint (either party can finalize)

**Business Logic**:
```typescript
// Last price is authoritative
const agreedAmount = writtenQuote.installerRevisedAmount 
  || writtenQuote.homeownerCounterAmount 
  || writtenQuote.amount;
```

**Validations**:
1. ✅ User is either installer OR homeowner of this quote
2. ✅ Not already agreed
3. ✅ Negotiation in progress (has been started)

**Testing**:
```bash
# Homeowner clicks "Done Deal"
curl -X POST http://localhost:3000/api/written-quotes/{id}/agree \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <HOMEOWNER_TOKEN>" \
  -d '{ "agreedBy": "<HOMEOWNER_USER_ID>" }'

# Expected: 200 + { success: true, agreedAmount: 9000 }
```

**Verify in Prisma Studio**:
- `negotiationStatus` = 'AGREED'
- `agreedAmount` = last price (installer revised OR homeowner counter OR initial)
- `agreedAt` = current timestamp
- `agreedBy` = user ID who clicked button

**Acceptance Criteria**:
- ✅ Negotiation finalized
- ✅ Both parties notified
- ✅ Correct agreed amount calculated
- ✅ Status = 'AGREED'
- ✅ 2nd agree attempt blocked

---

### T13W-2.6: Run GATE 0 Health Checks 🚦
**Effort**: 10 minutes  
**Dependencies**: T13W-2.5

**Commands**:
```bash
# 1. TypeScript compilation
npx tsc --noEmit

# 2. Build check
npm run build

# 3. Dev server
npm run dev
```

**Expected Results**:
1. TypeScript: Empty output (0 errors, 0 warnings)
2. Build: "✓ Compiled successfully"
3. Dev server: Starts on http://localhost:3000

**Acceptance Criteria**:
- ✅ 0 TypeScript errors
- ✅ 0 build warnings
- ✅ Dev server starts without errors
- ✅ All 5 API routes accessible

**If Fails**: Stop and fix errors before proceeding

---

## PHASE 3: Frontend - Shared Component (P1)

### T13W-3.1: Create NegotiationTimeline Component ⏳
**File**: `src/components/shared/NegotiationTimeline.tsx` (NEW)  
**Effort**: 60 minutes  
**Dependencies**: None

**Action**: Create reusable timeline component for both modals

**Props**:
```typescript
interface NegotiationTimelineProps {
  writtenQuoteId: string;
  negotiations: NegotiationEvent[];
  currentAmount: number;
}
```

**UI Design**: (See audit report Section 4.1.C for full implementation)

**Features**:
- Icon mapping: 📋 Submit, 💬 Counter, 💬 Revise, ✅ Accept
- Timestamp formatting
- Role indicators (Installer vs Homeowner)
- Current price highlighting
- Optional message display

**Testing**:
1. Create test data:
   ```typescript
   const mockNegotiations = [
     { id: '1', actorRole: 'INSTALLER', action: 'SUBMIT', amount: 10000, createdAt: '2025-12-22T10:00:00Z' },
     { id: '2', actorRole: 'HOMEOWNER', action: 'COUNTER', amount: 8000, createdAt: '2025-12-22T11:30:00Z' },
     { id: '3', actorRole: 'INSTALLER', action: 'REVISE', amount: 9000, createdAt: '2025-12-22T14:15:00Z' }
   ];
   ```
2. Render: `<NegotiationTimeline negotiations={mockNegotiations} currentAmount={9000} />`
3. Verify timeline displays correctly
4. Verify responsive (mobile, tablet, desktop)
5. Verify all 3 themes (Dark, Light, Purple)

**Acceptance Criteria**:
- ✅ Component renders without errors
- ✅ All events displayed in chronological order
- ✅ Icons match actions correctly
- ✅ Timestamps formatted (e.g., "Dec 22, 2025 10:00 AM")
- ✅ Current amount highlighted prominently
- ✅ Responsive on all breakpoints
- ✅ Multi-theme compatible (uses design tokens only)

---

## PHASE 4: Frontend - WrittenQuoteBuilderModal (P1)

### T13W-4.1: Copy QuoteBuilderModal File ⏳
**Effort**: 15 minutes  
**Dependencies**: None

**Action**:
```bash
cp src/components/QuoteBuilderModal.tsx src/components/WrittenQuoteBuilderModal.tsx
```

**Changes**:
1. Rename component: `QuoteBuilderModal` → `WrittenQuoteBuilderModal`
2. Update all text labels: "Bid" → "Written Quote"
3. Update submit endpoint: `/api/bids` → `/api/written-quotes`
4. Update localStorage key: `bid:draft` → `writtenQuote:draft`

**Find & Replace** (use VSCode):
- "Bid Builder" → "Written Quote Builder"
- "Submit Bid" → "Submit Written Quote"
- "bid-builder-heading" → "written-quote-builder-heading"
- "/api/bids" → "/api/written-quotes"

**Testing**:
1. Import in test file: `import WrittenQuoteBuilderModal from '@/components/WrittenQuoteBuilderModal';`
2. Run `npx tsc --noEmit` → 0 errors
3. Render component in Storybook (if available)

**Acceptance Criteria**:
- ✅ File created successfully
- ✅ Component renamed throughout file
- ✅ All text labels updated
- ✅ No TypeScript errors
- ✅ Component imports without issues

---

### T13W-4.2: Add Negotiation Section to Right Column ⏳
**File**: `src/components/WrittenQuoteBuilderModal.tsx`  
**Effort**: 90 minutes  
**Dependencies**: T13W-3.1, T13W-4.1

**Action**: Modify right column (30% width) layout

**Current Right Column**:
1. Customer Preview (live totals)
2. Savings Chart

**NEW Right Column** (add below existing):
3. NegotiationTimeline component
4. Revise Quote section (input + button)
5. "Done Deal" button

**Implementation**:
```tsx
{/* RIGHT COLUMN - 30% */}
<div className="w-[30%] space-y-6 overflow-y-auto">
  {/* Existing: Customer Preview */}
  <CustomerPreview 
    data={quoteDraft.preview}
    calculations={calculations}
  />
  
  {/* Existing: Savings Chart */}
  <SavingsChart
    annualSavings={calculations.annualSavings}
    paybackYears={calculations.paybackYears}
  />
  
  {/* NEW: Negotiation Timeline */}
  {writtenQuoteId && (
    <div className="bg-surface p-6 rounded-xl border border-border">
      <h4 className="text-heading-4 text-foreground mb-4">
        Price Negotiation
      </h4>
      <NegotiationTimeline
        writtenQuoteId={writtenQuoteId}
        negotiations={negotiations}
        currentAmount={currentNegotiatedAmount}
      />
    </div>
  )}
  
  {/* NEW: Revise Quote Section */}
  {writtenQuoteId && negotiationStatus !== 'AGREED' && (
    <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
      <h5 className="text-label text-foreground">Revise Your Quote</h5>
      <div className="space-y-2">
        <label className="text-caption text-muted-foreground">
          New Amount ($):
        </label>
        <input
          type="number"
          value={revisedAmount}
          onChange={(e) => setRevisedAmount(Number(e.target.value))}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body text-foreground"
          placeholder="Enter new quote amount"
        />
      </div>
      <Button 
        onClick={handleReviseQuote}
        variant="primary"
        className="w-full"
        disabled={!revisedAmount || revisedAmount <= 0}
      >
        Update Quote
      </Button>
    </div>
  )}
  
  {/* NEW: Done Deal Button */}
  {writtenQuoteId && negotiationStatus !== 'AGREED' && (
    <Button
      onClick={handleDoneDeal}
      variant="success"
      className="w-full py-3"
    >
      ✅ Accept & Proceed to Payment
    </Button>
  )}
  
  {/* Negotiation Finalized Message */}
  {negotiationStatus === 'AGREED' && (
    <div className="bg-success/10 border border-success p-4 rounded-lg">
      <h5 className="text-heading-5 text-success mb-2">
        ✅ Quote Finalized
      </h5>
      <p className="text-body-small text-foreground">
        Final Amount: ${agreedAmount?.toLocaleString()}
      </p>
      <p className="text-caption text-muted-foreground mt-2">
        Proceed to payment to complete the transaction.
      </p>
    </div>
  )}
</div>
```

**Add State Variables**:
```typescript
const [writtenQuoteId, setWrittenQuoteId] = useState<string | null>(null);
const [negotiations, setNegotiations] = useState<NegotiationEvent[]>([]);
const [negotiationStatus, setNegotiationStatus] = useState<string>('PENDING');
const [currentNegotiatedAmount, setCurrentNegotiatedAmount] = useState<number>(0);
const [revisedAmount, setRevisedAmount] = useState<number>(0);
const [agreedAmount, setAgreedAmount] = useState<number | null>(null);
```

**Add Handler Functions**:
```typescript
const handleReviseQuote = async () => {
  try {
    const response = await fetch(`/api/written-quotes/${writtenQuoteId}/revise`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisedAmount })
    });
    
    if (response.ok) {
      toast.success('Quote revised successfully!');
      fetchNegotiations(); // Refresh timeline
    }
  } catch (error) {
    toast.error('Failed to revise quote');
  }
};

const handleDoneDeal = async () => {
  try {
    const response = await fetch(`/api/written-quotes/${writtenQuoteId}/agree`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agreedBy: session?.user?.id })
    });
    
    if (response.ok) {
      const data = await response.json();
      setAgreedAmount(data.agreedAmount);
      setNegotiationStatus('AGREED');
      toast.success('Quote finalized! Proceed to payment.');
    }
  } catch (error) {
    toast.error('Failed to finalize quote');
  }
};
```

**Testing**:
1. Open WrittenQuoteBuilderModal
2. Fill form and submit → Verify writtenQuoteId set
3. Negotiation timeline appears
4. Enter revised amount → Click "Update Quote"
5. Verify API call succeeds
6. Verify timeline updates with new entry
7. Click "Done Deal"
8. Verify status changes to AGREED
9. Verify success message appears

**Acceptance Criteria**:
- ✅ Negotiation timeline displays correctly
- ✅ Revise quote functional
- ✅ "Done Deal" button works
- ✅ All API calls successful
- ✅ UI updates in real-time
- ✅ Error handling works
- ✅ Responsive design

---

## PHASE 5: Frontend - HomeownerWrittenQuoteReviewModal (P1)

### T13W-5.1: Copy HomeownerBiddingReviewModal File ⏳
**Effort**: 15 minutes  
**Dependencies**: None

**Action**:
```bash
cp src/components/homeowner/HomeownerBiddingReviewModal.tsx \
   src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx
```

**Changes**:
1. Rename: `HomeownerBiddingReviewModal` → `HomeownerWrittenQuoteReviewModal`
2. Update all "Bid" → "Written Quote"
3. Update API: `/api/bids` → `/api/written-quotes`
4. Update props interface name

**Find & Replace**:
- "Review Solar Bids" → "Review Written Quotes"
- "bid" → "writtenQuote" (variable names)
- "/api/bids" → "/api/written-quotes"

**Testing**: Same as T13W-4.1

**Acceptance Criteria**:
- ✅ File created successfully
- ✅ Component renamed
- ✅ All text labels updated
- ✅ No TypeScript errors

---

### T13W-5.2: Add Negotiation Section to Right Column ⏳
**File**: `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`  
**Effort**: 90 minutes  
**Dependencies**: T13W-3.1, T13W-5.1

**Action**: Modify right column (35% width)

**Current Right Column**:
1. InstantQuote Details
2. Lead Technical Details
3. InstantQuote Results

**NEW Right Column** (add below existing):
4. NegotiationTimeline
5. Counter Offer section (1 time only)
6. "Done Deal" button

**Implementation**:
```tsx
{/* RIGHT COLUMN - 35% */}
<div className="space-y-6 overflow-y-auto">
  {/* Existing sections... */}
  
  {/* NEW: Negotiation Timeline */}
  <div className="bg-surface p-6 rounded-xl border border-border">
    <h4 className="text-heading-4 text-foreground mb-4">
      Price Negotiation
    </h4>
    <NegotiationTimeline
      writtenQuoteId={selectedQuote.id}
      negotiations={negotiations}
      currentAmount={currentNegotiatedAmount}
    />
  </div>
  
  {/* NEW: Counter Offer Input (1 time only) */}
  {!selectedQuote.homeownerCounterAt && negotiationStatus !== 'AGREED' && (
    <div className="bg-warning/5 border border-warning p-4 rounded-lg space-y-3">
      <h5 className="text-label text-foreground flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-warning" />
        Your Counter Offer
      </h5>
      <p className="text-caption text-muted-foreground">
        ⚠️ You can only counter once. Make it count!
      </p>
      <div className="space-y-2">
        <label className="text-caption text-foreground">
          Counter Amount ($):
        </label>
        <input
          type="number"
          value={counterAmount}
          onChange={(e) => setCounterAmount(Number(e.target.value))}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg"
          placeholder="Enter your offer"
        />
        <textarea
          value={counterMessage}
          onChange={(e) => setCounterMessage(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-caption"
          placeholder="Optional message to installer"
          rows={2}
        />
      </div>
      <Button
        onClick={handleSubmitCounter}
        variant="primary"
        className="w-full"
        disabled={!counterAmount || counterAmount <= 0}
      >
        Submit Counter Offer
      </Button>
    </div>
  )}
  
  {/* Already Countered Message */}
  {selectedQuote.homeownerCounterAt && negotiationStatus !== 'AGREED' && (
    <div className="bg-info/10 border border-info p-4 rounded-lg">
      <p className="text-body-small text-foreground">
        ✅ Counter offer submitted: ${selectedQuote.homeownerCounterAmount?.toLocaleString()}
      </p>
      <p className="text-caption text-muted-foreground mt-1">
        Waiting for installer to respond...
      </p>
    </div>
  )}
  
  {/* NEW: Done Deal Button */}
  {negotiationStatus !== 'AGREED' && (
    <Button
      onClick={handleDoneDeal}
      variant="success"
      className="w-full py-3"
    >
      ✅ Accept Quote & Finalize
    </Button>
  )}
  
  {/* Negotiation Finalized */}
  {negotiationStatus === 'AGREED' && (
    <div className="bg-success/10 border border-success p-4 rounded-lg">
      <h5 className="text-heading-5 text-success mb-2">
        ✅ Quote Finalized
      </h5>
      <p className="text-body text-foreground">
        Final Amount: ${selectedQuote.agreedAmount?.toLocaleString()}
      </p>
      <Button
        onClick={() => router.push('/homeowner/payment')}
        variant="primary"
        className="w-full mt-4"
      >
        Proceed to Payment
      </Button>
    </div>
  )}
</div>
```

**Add State**:
```typescript
const [counterAmount, setCounterAmount] = useState<number>(0);
const [counterMessage, setCounterMessage] = useState<string>('');
const [negotiations, setNegotiations] = useState<NegotiationEvent[]>([]);
const [negotiationStatus, setNegotiationStatus] = useState<string>('PENDING');
```

**Add Handler**:
```typescript
const handleSubmitCounter = async () => {
  if (!counterAmount || counterAmount <= 0) {
    toast.error('Please enter a valid amount');
    return;
  }
  
  try {
    const response = await fetch(`/api/written-quotes/${selectedQuote.id}/counter`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        counterAmount,
        message: counterMessage
      })
    });
    
    if (response.ok) {
      toast.success('Counter offer submitted!');
      fetchWrittenQuotes(); // Refresh data
    } else {
      const error = await response.json();
      toast.error(error.error || 'Failed to submit counter');
    }
  } catch (error) {
    toast.error('Network error');
  }
};
```

**Testing**:
1. Open HomeownerWrittenQuoteReviewModal
2. View written quote details
3. Enter counter amount (e.g., $8000)
4. Add optional message
5. Click "Submit Counter Offer"
6. Verify API call succeeds
7. Verify UI updates (counter section hidden, "already countered" message shown)
8. Try to counter again → Verify button disabled
9. Click "Done Deal"
10. Verify finalization works

**Acceptance Criteria**:
- ✅ Counter offer functional
- ✅ 1-time limit enforced in UI
- ✅ Error handling for 2nd counter attempt
- ✅ "Done Deal" button works
- ✅ Timeline updates in real-time
- ✅ Responsive design
- ✅ Multi-theme compatible

---

## PHASE 6: Integration & E2E Testing (P0)

### T13W-6.1: E2E Test - Complete Negotiation Flow 🧪
**File**: `tests/e2e/written-quote-negotiation.spec.ts` (NEW)  
**Effort**: 120 minutes  
**Dependencies**: All previous tasks

**Test Scenario**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Written Quote Negotiation Flow', () => {
  test('Complete negotiation: Submit → Counter → Revise → Accept', async ({ page, context }) => {
    // Setup: Create test lead
    const leadId = await createTestLead();
    
    // Step 1: Installer submits Written Quote ($10,000)
    await page.goto('/installer');
    await loginAsInstaller(page, 'installer@test.com', 'password');
    await page.click(`[data-testid="lead-${leadId}"]`);
    await page.click('[data-testid="submit-written-quote-btn"]');
    
    // Fill Written Quote Builder
    await page.fill('[data-testid="amount-input"]', '10000');
    await page.fill('[data-testid="system-size-input"]', '6.6');
    await page.click('[data-testid="submit-written-quote"]');
    
    await expect(page.locator('text=Written Quote submitted successfully')).toBeVisible();
    
    // Step 2: Homeowner counters ($8,000)
    await loginAsHomeowner(page, 'homeowner@test.com', 'password');
    await page.goto('/homeowner/dashboard');
    await page.click(`[data-testid="lead-${leadId}"]`);
    await page.click('[data-testid="review-written-quotes-btn"]');
    
    await page.fill('[data-testid="counter-amount-input"]', '8000');
    await page.click('[data-testid="submit-counter-btn"]');
    
    await expect(page.locator('text=Counter offer submitted')).toBeVisible();
    
    // Step 3: Installer revises ($9,000)
    await loginAsInstaller(page);
    await page.goto(`/installer/written-quotes/${leadId}`);
    await page.fill('[data-testid="revise-amount-input"]', '9000');
    await page.click('[data-testid="update-quote-btn"]');
    
    await expect(page.locator('text=Quote revised successfully')).toBeVisible();
    
    // Step 4: Homeowner accepts
    await loginAsHomeowner(page);
    await page.goto('/homeowner/dashboard');
    await page.click(`[data-testid="lead-${leadId}"]`);
    await page.click('[data-testid="review-written-quotes-btn"]');
    await page.click('[data-testid="done-deal-btn"]');
    
    await expect(page.locator('text=Quote finalized')).toBeVisible();
    
    // Step 5: Verify final state in database
    const quote = await getWrittenQuoteFromDB(leadId);
    expect(quote.negotiationStatus).toBe('AGREED');
    expect(quote.agreedAmount).toBe(9000);
    expect(quote.agreedBy).toBeTruthy();
    
    // Step 6: Verify negotiation timeline
    await expect(page.locator('[data-testid="negotiation-timeline"]')).toContainText('Initial Quote: $10,000');
    await expect(page.locator('[data-testid="negotiation-timeline"]')).toContainText('Counter Offer: $8,000');
    await expect(page.locator('[data-testid="negotiation-timeline"]')).toContainText('Revised Quote: $9,000');
    await expect(page.locator('[data-testid="negotiation-timeline"]')).toContainText('Deal Closed: $9,000');
  });
});
```

**Acceptance Criteria**:
- ✅ Full flow completes end-to-end
- ✅ All API calls succeed (201, 200, etc.)
- ✅ UI updates correctly at each step
- ✅ Final agreed amount = $9,000
- ✅ Negotiation status = 'AGREED'
- ✅ Timeline shows all 4 events

---

### T13W-6.2: E2E Test - Counter Offer 1-Time Limit 🧪
**File**: `tests/e2e/written-quote-negotiation.spec.ts` (same file)  
**Effort**: 30 minutes

**Test Scenario**:
```typescript
test('Homeowner counter offer 1-time limit enforced', async ({ page }) => {
  const leadId = await createTestLead();
  
  // Installer submits quote
  await installerSubmitsQuote(page, leadId, 10000);
  
  // Homeowner logs in
  await loginAsHomeowner(page);
  await page.goto(`/homeowner/dashboard`);
  await openWrittenQuoteReviewModal(page, leadId);
  
  // First counter - should succeed
  await page.fill('[data-testid="counter-amount-input"]', '8000');
  await page.click('[data-testid="submit-counter-btn"]');
  
  await expect(page.locator('text=Counter offer submitted')).toBeVisible();
  
  // Verify counter input is now disabled/hidden
  await expect(page.locator('[data-testid="counter-amount-input"]')).not.toBeVisible();
  await expect(page.locator('text=already submitted')).toBeVisible();
  
  // Second counter attempt via API (should fail)
  const response = await page.request.patch(`/api/written-quotes/{id}/counter`, {
    data: { counterAmount: 7500 }
  });
  
  expect(response.status()).toBe(403);
  const error = await response.json();
  expect(error.error).toContain('already submitted');
});
```

**Acceptance Criteria**:
- ✅ 1st counter succeeds
- ✅ UI updates (input hidden, message shown)
- ✅ 2nd counter blocked (403 error)
- ✅ Error message clear

---

### T13W-6.3: E2E Test - Installer Multiple Revisions 🧪
**Effort**: 30 minutes

**Test Scenario**:
```typescript
test('Installer can revise quote multiple times', async ({ page }) => {
  const leadId = await createTestLead();
  
  // Initial quote: $10,000
  await installerSubmitsQuote(page, leadId, 10000);
  
  // Revision 1: $9,500
  await installerRevisesQuote(page, leadId, 9500);
  await expect(page.locator('text=Quote revised successfully')).toBeVisible();
  
  // Revision 2: $9,000
  await installerRevisesQuote(page, leadId, 9000);
  await expect(page.locator('text=Quote revised successfully')).toBeVisible();
  
  // Revision 3: $8,800
  await installerRevisesQuote(page, leadId, 8800);
  await expect(page.locator('text=Quote revised successfully')).toBeVisible();
  
  // Verify timeline shows all revisions
  await expect(page.locator('[data-testid="negotiation-timeline"]')).toContainText('$10,000');
  await expect(page.locator('[data-testid="negotiation-timeline"]')).toContainText('$9,500');
  await expect(page.locator('[data-testid="negotiation-timeline"]')).toContainText('$9,000');
  await expect(page.locator('[data-testid="negotiation-timeline"]')).toContainText('$8,800');
  
  // Current amount should be last revision
  await expect(page.locator('[data-testid="current-amount"]')).toContainText('$8,800');
});
```

**Acceptance Criteria**:
- ✅ All 3 revisions succeed
- ✅ No limit enforced
- ✅ Timeline shows all events
- ✅ Current amount = last revision

---

## PHASE 7: Validation & Build (P0)

### T13W-7.1: TypeScript Validation 🚦
**Effort**: 5 minutes

**Command**:
```bash
npx tsc --noEmit
```

**Expected Output**: Empty (no errors, no warnings)

**If Fails**:
1. Read error messages carefully
2. Fix one error at a time
3. Re-run until 0 errors

**Acceptance Criteria**: ✅ 0 TypeScript errors, 0 warnings

---

### T13W-7.2: Build Validation 🚦
**Effort**: 5 minutes

**Command**:
```bash
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
Route (app)                              Size     First Load JS
┌ ○ /                                   ...
...
```

**Check For**:
- ✅ "Compiled successfully" message
- ✅ No red error lines
- ✅ No yellow warning lines

**If Fails**: Fix warnings/errors before proceeding

---

### T13W-7.3: Multi-Theme Verification 🚦
**Effort**: 15 minutes  
**Reference**: specs/007-migration-and-build/plan.md

**Commands** (PowerShell):
```powershell
# Command 1: Hardcoded gray/slate colors
Select-String -Path "src\components\WrittenQuoteBuilderModal.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"

# Command 2: Dark mode classes
Select-String -Path "src\components\WrittenQuoteBuilderModal.tsx" -Pattern "dark:"

# Command 3: RGB/HEX colors
Select-String -Path "src\components\WrittenQuoteBuilderModal.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"

# Command 4: Hardcoded white/black
Select-String -Path "src\components\WrittenQuoteBuilderModal.tsx" -Pattern "text-white|bg-white|text-black|bg-black"

# Command 5: Hardcoded typography
Select-String -Path "src\components\WrittenQuoteBuilderModal.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"

# Command 6: Manual responsive classes
Select-String -Path "src\components\WrittenQuoteBuilderModal.tsx" -Pattern "sm:text-|md:text-|lg:text-"
```

**Repeat for**:
- `src\components\homeowner\HomeownerWrittenQuoteReviewModal.tsx`
- `src\components\shared\NegotiationTimeline.tsx`

**Expected Result**: **0/0/0/0/0/0** (all commands return 0 matches)

**If Violations Found**:
1. Replace hardcoded values with design tokens
2. Use `text-foreground`, `bg-surface`, `border-border`, etc.
3. Re-run commands until 0/0/0/0/0/0

**Acceptance Criteria**: ✅ All 6 commands return 0 matches for all 3 files

---

## PHASE 8: Documentation & Commit (P1)

### T13W-8.1: Create Implementation Report 📝
**File**: `DOC/Features/Written Quote/IMPLEMENTATION-REPORT.md` (NEW)  
**Effort**: 45 minutes

**Content Sections**:
1. **Executive Summary**
   - Feature overview
   - Key achievements
   - Timeline
   
2. **Technical Implementation**
   - Database changes (WrittenQuote model)
   - API endpoints created (5 total)
   - Frontend components (3 files)
   
3. **Testing Results**
   - E2E test results (pass/fail)
   - Build validation (0 errors)
   - Multi-theme verification (0/0/0/0/0/0)
   
4. **Challenges & Solutions**
   - Any issues encountered
   - How they were resolved
   
5. **Next Steps**
   - Integration with payment flow
   - User onboarding/documentation

**Acceptance Criteria**:
- ✅ Report created with all sections
- ✅ Test results documented
- ✅ Commit IDs referenced

---

### T13W-8.2: Update Git Status 📝
**File**: `DOC/Prompts/gitstatus.md` (UPDATE)  
**Effort**: 15 minutes

**Action**: Add entry for Phase 13W

**Format**:
```markdown
## Phase 13W - Written Quote Negotiation (Dec 22, 2025)

**Feature**: Copy & adapt Bid flow for Written Quote with negotiation

**Commits**:
- `abc123def` - Add WrittenQuote Prisma model & migration
- `ghi456jkl` - Create 5 Written Quote API endpoints
- `mno789pqr` - Add NegotiationTimeline shared component
- `stu012vwx` - Create WrittenQuoteBuilderModal (installer)
- `yza345bcd` - Create HomeownerWrittenQuoteReviewModal (homeowner)
- `efg678hij` - Add E2E tests for negotiation flow
- `klm901nop` - Documentation & final verification

**Files Changed**:
- Added: `prisma/migrations/YYYYMMDD_add_written_quotes/`
- Added: `src/types/written-quote.ts`
- Added: `src/app/api/written-quotes/route.ts`
- Added: `src/app/api/written-quotes/[id]/counter/route.ts`
- Added: `src/app/api/written-quotes/[id]/revise/route.ts`
- Added: `src/app/api/written-quotes/[id]/agree/route.ts`
- Added: `src/components/WrittenQuoteBuilderModal.tsx`
- Added: `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- Added: `src/components/shared/NegotiationTimeline.tsx`
- Added: `tests/e2e/written-quote-negotiation.spec.ts`

**Test Results**:
- ✅ TypeScript: 0 errors
- ✅ Build: 0 warnings
- ✅ E2E tests: 3/3 passed
- ✅ Multi-theme: 0/0/0/0/0/0

**Status**: Complete ✓
```

**Acceptance Criteria**:
- ✅ Git status updated
- ✅ All commit IDs included
- ✅ Test results documented

---

### T13W-8.3: Atomic Commits 📝
**Effort**: 30 minutes

**Commit Strategy**: One logical change per commit

**Suggested Commits**:
```bash
# 1. Database
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(written-quote): add WrittenQuote model with negotiation fields

- Add WrittenQuote model (copy from Bid, add 7 negotiation fields)
- Create migration for written_quotes table
- Add User and Lead relations
- Add indexes for negotiationStatus, leadId, installerId

Ref: T13W-1.1, T13W-1.2"

# 2. Types
git add src/types/written-quote.ts
git commit -m "feat(written-quote): add TypeScript types

- CreateWrittenQuoteRequest, CounterOfferRequest, etc.
- NegotiationEvent interface for timeline

Ref: T13W-1.4"

# 3. Backend APIs
git add src/app/api/written-quotes/
git commit -m "feat(written-quote): implement 5 API endpoints

- POST /api/written-quotes (submit initial quote)
- GET /api/written-quotes (fetch by leadId)
- PATCH /counter (homeowner counter, 1 time limit)
- PATCH /revise (installer revise, unlimited)
- POST /agree (either party finalize)

Ref: T13W-2.1 - T13W-2.5"

# 4. Shared Component
git add src/components/shared/NegotiationTimeline.tsx
git commit -m "feat(written-quote): add NegotiationTimeline shared component

- Timeline UI with icons for Submit/Counter/Revise/Accept
- Timestamp formatting
- Current amount highlighting

Ref: T13W-3.1"

# 5. Installer Modal
git add src/components/WrittenQuoteBuilderModal.tsx
git commit -m "feat(written-quote): create WrittenQuoteBuilderModal

- Copy from QuoteBuilderModal
- Update all 'Bid' → 'Written Quote' text
- Add negotiation section to right column
- Add revise quote input + Done Deal button

Ref: T13W-4.1, T13W-4.2"

# 6. Homeowner Modal
git add src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx
git commit -m "feat(written-quote): create HomeownerWrittenQuoteReviewModal

- Copy from HomeownerBiddingReviewModal
- Add counter offer section (1 time limit)
- Add negotiation timeline
- Add Done Deal button

Ref: T13W-5.1, T13W-5.2"

# 7. Tests
git add tests/e2e/written-quote-negotiation.spec.ts
git commit -m "test(written-quote): add E2E tests for negotiation flow

- Complete flow: Submit → Counter → Revise → Accept
- Counter offer 1-time limit test
- Installer multiple revisions test

Ref: T13W-6.1, T13W-6.2, T13W-6.3"

# 8. Documentation
git add DOC/Features/Written\ Quote/
git commit -m "docs(written-quote): add implementation report and audit

- WRITTEN-QUOTE-COPY-BID-AUDIT.md (system analysis)
- IMPLEMENTATION-REPORT.md (results & learnings)
- Update gitstatus.md with commit IDs

Ref: T13W-8.1, T13W-8.2"
```

**Acceptance Criteria**:
- ✅ 8 atomic commits created
- ✅ Each commit compiles successfully
- ✅ Commit messages follow convention (feat/test/docs)
- ✅ All commits reference task IDs

---

## Summary & Next Actions

### Completion Checklist
- [ ] All 25 tasks completed
- [ ] 0 TypeScript errors
- [ ] 0 build warnings
- [ ] E2E tests passing (3/3)
- [ ] Multi-theme verification (0/0/0/0/0/0)
- [ ] 8 atomic commits pushed
- [ ] Documentation complete

### Rollout Plan
1. **Beta Testing** (1 week)
   - Enable feature for 10 test users
   - Monitor for bugs
   - Collect feedback

2. **Full Release** (Week 2)
   - Enable for all users
   - Update user documentation
   - Send announcement email

3. **Post-Release** (Week 3+)
   - Monitor analytics (usage, completion rate)
   - Iterate based on feedback
   - Plan payment integration

---

**END OF PHASE 13W DETAILED TASKS**
