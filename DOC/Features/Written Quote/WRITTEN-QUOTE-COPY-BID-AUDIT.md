# Written Quote Flow - Comprehensive Audit Report
**Date**: December 22, 2025  
**Purpose**: Copy and adapt existing Bid flow modals for Written Quote system with negotiation functionality  
**Status**: Active Planning Document

---

## Executive Summary

This audit analyzes the existing Bidding Lead system to create a parallel **Written Quote** flow by copying and modifying:
1. **QuoteBuilderModal** (Installer side) → **WrittenQuoteBuilderModal**
2. **HomeownerBiddingReviewModal** (Homeowner side) → **HomeownerWrittenQuoteReviewModal**
3. Backend API `/api/bids` → `/api/written-quotes`
4. Database schema `Bid` model → `WrittenQuote` model

**Key Differences from Bidding Flow**:
- Adds negotiation functionality (1 round: Homeowner counter → Installer response)
- "Done Deal" button to close negotiation and proceed to payment
- Negotiation history timeline visible to both parties
- All other fields remain identical to Bid flow

---

## 1. FRONTEND AUDIT

### 1.1 Existing Bid Builder Modal (Installer Side)

**File**: `src/components/QuoteBuilderModal.tsx`  
**Status**: ✅ Fully functional and tested

#### Current Features:
- **Mode Support**: Already has `mode` prop (`'quote' | 'bid'`)
- **Two-Column Layout**: 
  - Left (70%): Form sections (System Selection, Roof/Site, Products, Pricing, Compliance)
  - Right (30%): Live preview, charts, homeowner context
- **8 Section Architecture**:
  1. System Selection (capacity, type, price range)
  2. Roof & Site Details (roof type, pitch, arrays, orientations, shading)
  3. Product Configuration (panels, inverter, battery, addons)
  4. Pricing Engine (9 line item categories, GST, incentives)
  5. Compliance Docs (certifications, datasheets)
  6. Customer Preview (3 quote options)
  7. Homeowner Context (prefilled from InstantQuote)
  8. Assumptions (yield, retail price, feed-in tariff, degradation)
- **Financial Calculations**:
  - Subtotal from line items
  - GST toggle (10% default)
  - Federal incentive toggle (custom amount)
  - Final total calculation
- **Actions**: Save Draft, Preview, Submit Bid, Lead Details
- **Autosave**: Declared (isSaving, lastSaved states exist)
- **Submit Endpoint**: POST `/api/bids` with comprehensive Quote Builder data

#### UI Components Used:
- Collapsible sections with expand/collapse
- Presets for quick system setup
- Live preview with totals
- Savings chart integration
- Homeowner preview modal
- Bid evaluation modal

#### Submit Handler:
```typescript
const handleSubmit = async () => {
  if (mode === 'bid') {
    const bidPayload = {
      leadId: lead.id,
      amount: subtotal,
      systemData: quoteDraft.system,
      productsData: quoteDraft.products,
      lineItems: quoteDraft.pricing.lineItems,
      assumptions: quoteDraft.assumptions,
      roofData: quoteDraft.roof,
      calculations: { subtotal, gstAmount, incentiveAmount, finalTotal },
      importMeta: quoteDraft.meta,
      installerContact: { /* contact info */ },
      includeGst: quoteDraft.pricing.includeGst,
      gstPercent: quoteDraft.pricing.gstPercent,
      includeIncentive: quoteDraft.pricing.includeIncentive,
      incentiveAmount: quoteDraft.pricing.incentiveAmount
    };
    
    const response = await fetch('/api/bids', {
      method: 'POST',
      body: JSON.stringify(bidPayload)
    });
  }
};
```

---

### 1.2 Existing Review Bid Modal (Homeowner Side)

**File**: `src/components/homeowner/HomeownerBiddingReviewModal.tsx`  
**Status**: ✅ Fully functional and tested

#### Current Features:
- **Two-Column Layout**:
  - Left (65%): Bid details (quotation style)
  - Right (35%): Homeowner's InstantQuote details
- **Bid Selector Dropdown**: Compare multiple installers side-by-side
- **Left Column Sections**:
  1. Quote Header (Quote #, Date, Installer Name, Rating)
  2. System Specifications (Capacity, Type, Annual Production)
  3. Equipment Details (Panels, Inverter, Battery with brands/models)
  4. Pricing Breakdown (Line items, Subtotal, GST, Incentive, Final Total)
  5. Financial Summary (Price/Watt, ROI, Payback, Savings)
  6. Installation Details (Timeline, Warranty, Notes)
  7. Action Buttons (Select as Winner, Shortlist, Contact)
- **Right Column Sections**:
  1. InstantQuote Details (Homeowner's original requirements)
  2. Lead Technical Details (Property type, roof, budget)
  3. InstantQuote Results (Original estimate)
- **Winner Selection**: "Select as Winner" button → Confirm modal → Update bid status
- **States**: Loading, Error, Empty state handling

#### Data Fetching:
```typescript
const fetchBids = async () => {
  const response = await fetch(`/api/bids?leadId=${leadId}`);
  const data: GetBidsResponse = await response.json();
  
  const transformedBids = data.bids.map(bid => ({
    ...bid,
    installerName: bid.installer?.companyName,
    installerRating: 4.5,
    pricePerWatt: bid.finalTotal / (bid.systemData?.capacityKw * 1000),
    isWinner: bid.status === 'SELECTED'
  }));
};
```

---

## 2. BACKEND AUDIT

### 2.1 Existing Bid API Endpoint

**File**: `src/app/api/bids/route.ts`  
**Status**: ✅ Fully functional with comprehensive data storage

#### POST /api/bids
**Purpose**: Installer submits bid for a bidding lead

**Request Body** (`CreateBidRequest`):
```typescript
{
  leadId: string;
  amount: number; // Subtotal
  capacityOffer?: number;
  expectedInstallDate?: string;
  notes?: string;
  panelBrand?: string;
  inverterBrand?: string;
  batteryBrand?: string;
  batteryCapacity?: string;
  includeGst: boolean;
  gstPercent: number;
  includeIncentive: boolean;
  incentiveAmount: number;
  
  // Phase 13B - Comprehensive Quote Builder data (8 JSON fields)
  systemData?: Json;
  productsData?: Json;
  lineItems?: Json;
  assumptions?: Json;
  roofData?: Json;
  calculations?: Json;
  importMeta?: Json;
  installerContact?: Json;
}
```

**Validations**:
1. ✅ Installer authentication (requireRole('INSTALLER'))
2. ✅ Lead exists check
3. ✅ Lead is BIDDING type
4. ✅ Countdown not expired
5. ✅ No duplicate bid from same installer (unique constraint `leadId_installerId`)
6. ✅ Amount > 0

**Business Logic**:
```typescript
const gstAmount = includeGst ? (amount * (gstPercent / 100)) : 0;
const finalTotal = amount + gstAmount - incentiveAmount;

const bid = await prisma.bid.create({
  data: {
    leadId, installerId, amount, finalTotal,
    systemData, productsData, lineItems, assumptions,
    roofData, calculations, importMeta, installerContact,
    includeGst, gstPercent, gstAmount,
    includeIncentive, incentiveAmount,
    status: 'SUBMITTED'
  }
});
```

**Notifications** (Phase 13P):
1. Homeowner → BID_SUBMITTED notification
2. Admin → BID_SUBMITTED notification

**Response**:
```typescript
{ success: true, bidId: string, message: 'Bid submitted successfully' }
```

---

#### GET /api/bids?leadId={id}
**Purpose**: Homeowner fetches all bids for their lead

**Response** (`GetBidsResponse`):
```typescript
{
  bids: Array<{
    id: string;
    amount: number;
    finalTotal: number;
    status: string;
    createdAt: string;
    systemData: Json;
    productsData: Json;
    lineItems: Json;
    assumptions: Json;
    roofData: Json;
    calculations: Json;
    installer: {
      id: string;
      companyName: string;
      email: string;
    }
  }>
}
```

---

### 2.2 Database Schema - Bid Model

**File**: `prisma/schema.prisma`

```prisma
model Bid {
  id                  String    @id @default(cuid())
  leadId              String
  installerId         String
  amount              Float
  capacityOffer       Float?
  expectedInstallDate DateTime?
  notes               String?
  panelBrand          String?
  inverterBrand       String?
  batteryBrand        String?
  batteryCapacity     String?
  includeGst          Boolean   @default(true)
  gstPercent          Float     @default(10.0)
  gstAmount           Float     @default(0)
  includeIncentive    Boolean   @default(false)
  incentiveAmount     Float     @default(0)
  finalTotal          Float
  status              String    @default("SUBMITTED")
  selectedAt          DateTime?
  purchasedAt         DateTime?
  rejectedAt          DateTime?
  rejectionReason     String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Phase 13 - Comprehensive Quote Builder data (JSON fields)
  systemData       Json?
  productsData     Json?
  lineItems        Json?
  assumptions      Json?
  roofData         Json?
  calculations     Json?
  importMeta       Json?
  installerContact Json?

  lead      Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  installer User @relation("installer_bids", fields: [installerId], references: [id], onDelete: Cascade)

  @@unique([leadId, installerId])
  @@index([leadId])
  @@index([installerId])
  @@index([status])
  @@index([createdAt])
  @@map("bids")
}
```

---

## 3. GAP ANALYSIS - What's Missing for Written Quote Flow

### 3.1 NEW Requirements (Not in Bidding Flow)

#### A. Negotiation Functionality
**Requirement**: 1-round price negotiation between Homeowner and Installer

**Negotiation Flow**:
1. Installer submits initial Written Quote amount (e.g., $10,000)
2. Homeowner can counter with new amount (e.g., $8,000) **[1 time only]**
3. Installer can respond with revised amount (e.g., $9,000)
4. Either party can click "Done Deal" to finalize
5. Negotiation history visible to both sides with timestamps

**Negotiation States**:
- `PENDING`: Installer submitted, awaiting homeowner response
- `HOMEOWNER_COUNTERED`: Homeowner proposed new amount
- `INSTALLER_RESPONDED`: Installer updated amount
- `AGREED`: Either party clicked "Done Deal"
- `EXPIRED`: Negotiation window closed without agreement

**Negotiation Rules**:
- Homeowner limited to 1 counter offer
- Installer can update price multiple times
- "Last price" is always authoritative
- "Done Deal" freezes negotiation and enables payment

#### B. Negotiation History Timeline
**Display Format**:
```
📋 Initial Quote: $10,000 (Installer, Dec 22, 2025 10:00 AM)
💬 Counter Offer: $8,000 (Homeowner, Dec 22, 2025 11:30 AM)
💬 Revised Quote: $9,000 (Installer, Dec 22, 2025 2:15 PM)
✅ Deal Closed: $9,000 (Homeowner accepted, Dec 22, 2025 3:00 PM)
```

**Right Column Integration**:
- Replace/extend existing right column content
- Show timeline above or below InstantQuote details
- Highlight current price with visual emphasis
- Show counter remaining (e.g., "You have 1 counter offer remaining")

#### C. "Done Deal" Button
**Installer Side**:
- Button: "Accept & Proceed to Payment"
- Only enabled when negotiation in progress
- Clicking freezes negotiation, updates status to `AGREED`
- Redirects to payment flow

**Homeowner Side**:
- Button: "Accept Quote & Finalize"
- Same behavior as installer side
- Confirms they're happy with final price

---

### 3.2 Database Changes Required

#### New Model: WrittenQuote
```prisma
model WrittenQuote {
  id                  String    @id @default(cuid())
  leadId              String
  installerId         String
  
  // Financial fields (same as Bid)
  amount              Float
  capacityOffer       Float?
  expectedInstallDate DateTime?
  notes               String?
  panelBrand          String?
  inverterBrand       String?
  batteryBrand        String?
  batteryCapacity     String?
  includeGst          Boolean   @default(true)
  gstPercent          Float     @default(10.0)
  gstAmount           Float     @default(0)
  includeIncentive    Boolean   @default(false)
  incentiveAmount     Float     @default(0)
  finalTotal          Float
  
  // NEW: Negotiation fields
  negotiationStatus   String    @default("PENDING") // PENDING, HOMEOWNER_COUNTERED, INSTALLER_RESPONDED, AGREED, EXPIRED
  homeownerCounterAmount Float?
  homeownerCounterAt     DateTime?
  installerRevisedAmount Float?
  installerRevisedAt     DateTime?
  agreedAmount           Float?
  agreedAt               DateTime?
  agreedBy               String? // USER_ID who clicked "Done Deal"
  
  // Status fields (same as Bid)
  status              String    @default("SUBMITTED")
  selectedAt          DateTime?
  purchasedAt         DateTime?
  rejectedAt          DateTime?
  rejectionReason     String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Comprehensive Quote Builder data (8 JSON fields - same as Bid)
  systemData       Json?
  productsData     Json?
  lineItems        Json?
  assumptions      Json?
  roofData         Json?
  calculations     Json?
  importMeta       Json?
  installerContact Json?

  lead      Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  installer User @relation("installer_written_quotes", fields: [installerId], references: [id], onDelete: Cascade)

  @@unique([leadId, installerId])
  @@index([leadId])
  @@index([installerId])
  @@index([negotiationStatus])
  @@index([status])
  @@index([createdAt])
  @@map("written_quotes")
}
```

#### New Model: WrittenQuoteNegotiation (Optional - for detailed history)
```prisma
model WrittenQuoteNegotiation {
  id              String   @id @default(cuid())
  writtenQuoteId  String
  actorId         String   // USER_ID (installer or homeowner)
  actorRole       String   // INSTALLER or HOMEOWNER
  action          String   // SUBMIT, COUNTER, REVISE, ACCEPT
  amount          Float
  message         String?
  createdAt       DateTime @default(now())
  
  writtenQuote WrittenQuote @relation(fields: [writtenQuoteId], references: [id], onDelete: Cascade)
  actor        User         @relation(fields: [actorId], references: [id])
  
  @@index([writtenQuoteId])
  @@index([createdAt])
  @@map("written_quote_negotiations")
}
```

---

### 3.3 API Endpoints Required

#### POST /api/written-quotes
**Purpose**: Installer submits initial Written Quote

**Request** (identical to bid request):
```typescript
{
  leadId: string;
  amount: number;
  // ... all other fields same as CreateBidRequest
}
```

**Response**:
```typescript
{ success: true, writtenQuoteId: string, message: 'Written Quote submitted successfully' }
```

---

#### GET /api/written-quotes?leadId={id}
**Purpose**: Homeowner/Installer fetches Written Quotes for a lead

**Response**:
```typescript
{
  writtenQuotes: Array<{
    id: string;
    amount: number;
    finalTotal: number;
    negotiationStatus: string;
    homeownerCounterAmount?: number;
    installerRevisedAmount?: number;
    agreedAmount?: number;
    // ... all other fields same as GetBidsResponse
  }>
}
```

---

#### PATCH /api/written-quotes/[id]/counter
**Purpose**: Homeowner submits counter offer (1 time only)

**Request**:
```typescript
{
  counterAmount: number;
  message?: string; // Optional note
}
```

**Validations**:
1. Homeowner is the lead owner
2. Written Quote status is PENDING or INSTALLER_RESPONDED
3. Homeowner has not already countered (homeownerCounterAt is null)
4. counterAmount > 0

**Response**:
```typescript
{ success: true, message: 'Counter offer submitted' }
```

---

#### PATCH /api/written-quotes/[id]/revise
**Purpose**: Installer updates quote amount (multiple times allowed)

**Request**:
```typescript
{
  revisedAmount: number;
  message?: string;
}
```

**Validations**:
1. Installer owns this Written Quote
2. Negotiation not already agreed
3. revisedAmount > 0

**Response**:
```typescript
{ success: true, message: 'Quote revised successfully' }
```

---

#### POST /api/written-quotes/[id]/agree
**Purpose**: Either party finalizes negotiation ("Done Deal")

**Request**:
```typescript
{
  agreedBy: string; // USER_ID
}
```

**Validations**:
1. User is either installer or homeowner of this Written Quote
2. Negotiation in progress (not already agreed/expired)

**Business Logic**:
```typescript
const finalAmount = writtenQuote.installerRevisedAmount 
  || writtenQuote.homeownerCounterAmount 
  || writtenQuote.amount;

await prisma.writtenQuote.update({
  where: { id },
  data: {
    negotiationStatus: 'AGREED',
    agreedAmount: finalAmount,
    agreedAt: new Date(),
    agreedBy: userId
  }
});
```

**Response**:
```typescript
{ success: true, message: 'Quote finalized', agreedAmount: number }
```

---

## 4. COPY & ADAPT PLAN

### 4.1 Frontend Components to Create

#### A. WrittenQuoteBuilderModal.tsx
**Copy From**: `QuoteBuilderModal.tsx`

**Modifications**:
1. ✅ Rename all "Bid" → "Written Quote" in UI text
2. ✅ Keep all 8 sections identical (System, Roof, Products, Pricing, etc.)
3. ✅ Keep submit handler structure but call `/api/written-quotes`
4. ✅ **ADD**: Negotiation section in right column

**Right Column Layout** (NEW):
```tsx
{/* RIGHT COLUMN - 30% */}
<div className="w-[30%] space-y-6">
  {/* Existing: Live Preview */}
  <CustomerPreview ... />
  
  {/* Existing: Savings Chart */}
  <SavingsChart ... />
  
  {/* NEW: Negotiation History */}
  <NegotiationTimeline
    writtenQuoteId={writtenQuoteId}
    negotiations={negotiations}
    currentAmount={currentAmount}
  />
  
  {/* NEW: Revise Quote Section */}
  {negotiationStatus !== 'AGREED' && (
    <div className="bg-surface p-4 rounded-lg">
      <label>Revise Quote Amount:</label>
      <input
        type="number"
        value={revisedAmount}
        onChange={(e) => setRevisedAmount(e.target.value)}
      />
      <Button onClick={handleReviseQuote}>
        Update Quote
      </Button>
    </div>
  )}
  
  {/* NEW: Done Deal Button */}
  {negotiationStatus !== 'AGREED' && (
    <Button onClick={handleDoneDeal} variant="success">
      ✅ Accept & Proceed to Payment
    </Button>
  )}
</div>
```

**Submit Handler** (Modified):
```typescript
const handleSubmit = async () => {
  const payload = {
    leadId: lead.id,
    amount: subtotal,
    systemData: quoteDraft.system,
    // ... all other fields same as bid
  };
  
  const response = await fetch('/api/written-quotes', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    const data = await response.json();
    setWrittenQuoteId(data.writtenQuoteId);
    // Show success message
  }
};
```

---

#### B. HomeownerWrittenQuoteReviewModal.tsx
**Copy From**: `HomeownerBiddingReviewModal.tsx`

**Modifications**:
1. ✅ Rename all "Bid" → "Written Quote" in UI text
2. ✅ Keep left column identical (Quote Header, System Specs, Equipment, Pricing, etc.)
3. ✅ **ADD**: Negotiation section in right column
4. ✅ **ADD**: Counter offer input (1 time only)
5. ✅ **ADD**: "Done Deal" button

**Right Column Layout** (Modified):
```tsx
{/* RIGHT COLUMN - 35% */}
<div className="space-y-6">
  {/* Existing: InstantQuote Details */}
  <HomeownerInstantQuoteDetails leadData={leadData} />
  
  {/* Existing: Lead Technical Details */}
  <LeadTechnicalDetails leadData={leadData} />
  
  {/* NEW: Negotiation Timeline */}
  <div className="bg-surface p-6 rounded-xl">
    <h4 className="text-heading-4 mb-4">Price Negotiation</h4>
    <NegotiationTimeline
      writtenQuoteId={selectedQuote.id}
      negotiations={negotiations}
      currentAmount={currentAmount}
    />
    
    {/* Counter Offer Input (1 time only) */}
    {!selectedQuote.homeownerCounterAt && negotiationStatus !== 'AGREED' && (
      <div className="mt-4 p-4 border border-warning rounded-lg bg-warning/5">
        <label className="text-label text-foreground">
          Your Counter Offer: (1 time only)
        </label>
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg"
            placeholder="Enter your offer"
          />
          <Button onClick={handleSubmitCounter} variant="primary">
            Submit Counter
          </Button>
        </div>
        <p className="text-caption text-muted-foreground mt-2">
          ⚠️ You can only counter once. Choose wisely!
        </p>
      </div>
    )}
    
    {/* Done Deal Button */}
    {negotiationStatus !== 'AGREED' && (
      <Button 
        onClick={handleDoneDeal} 
        variant="success" 
        className="w-full mt-4"
      >
        ✅ Accept Quote & Finalize
      </Button>
    )}
  </div>
</div>
```

---

#### C. NegotiationTimeline.tsx (NEW Component)
**Purpose**: Shared timeline component for both modals

**Props**:
```typescript
interface NegotiationTimelineProps {
  writtenQuoteId: string;
  negotiations: NegotiationEvent[];
  currentAmount: number;
}

interface NegotiationEvent {
  id: string;
  actorRole: 'INSTALLER' | 'HOMEOWNER';
  action: 'SUBMIT' | 'COUNTER' | 'REVISE' | 'ACCEPT';
  amount: number;
  message?: string;
  createdAt: string;
}
```

**UI Design**:
```tsx
export function NegotiationTimeline({ negotiations, currentAmount }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-label text-muted-foreground">Negotiation History</h5>
        <span className="text-heading-4 text-success">
          ${currentAmount.toLocaleString()}
        </span>
      </div>
      
      {negotiations.map((event, index) => (
        <div key={event.id} className="flex gap-3 items-start">
          {/* Icon */}
          <div className={`p-2 rounded-full ${
            event.action === 'ACCEPT' ? 'bg-success/20 text-success' :
            event.actorRole === 'HOMEOWNER' ? 'bg-primary/20 text-primary' :
            'bg-warning/20 text-warning'
          }`}>
            {event.action === 'SUBMIT' && <FileText className="h-4 w-4" />}
            {event.action === 'COUNTER' && <TrendingDown className="h-4 w-4" />}
            {event.action === 'REVISE' && <TrendingUp className="h-4 w-4" />}
            {event.action === 'ACCEPT' && <CheckCircle className="h-4 w-4" />}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-body-small font-medium text-foreground">
                {event.action === 'SUBMIT' && '📋 Initial Quote'}
                {event.action === 'COUNTER' && '💬 Counter Offer'}
                {event.action === 'REVISE' && '💬 Revised Quote'}
                {event.action === 'ACCEPT' && '✅ Deal Closed'}
              </span>
              <span className="text-caption text-muted-foreground">
                {formatDate(event.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-caption text-muted-foreground">
                {event.actorRole === 'INSTALLER' ? 'Installer' : 'Homeowner'}
              </span>
              <span className="text-body font-semibold text-foreground">
                ${event.amount.toLocaleString()}
              </span>
            </div>
            {event.message && (
              <p className="text-caption text-muted-foreground mt-1 italic">
                "{event.message}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 4.2 Backend APIs to Create

#### File Structure:
```
src/app/api/written-quotes/
├── route.ts                    (POST, GET)
├── [id]/
│   ├── counter/
│   │   └── route.ts           (PATCH)
│   ├── revise/
│   │   └── route.ts           (PATCH)
│   └── agree/
│       └── route.ts           (POST)
```

#### Implementation Notes:
- Copy validation logic from `/api/bids`
- Add negotiation-specific validations
- Emit audit logs for all negotiation actions
- Send notifications on each negotiation step

---

### 4.3 Database Migration

**File**: `prisma/migrations/YYYYMMDDHHMMSS_add_written_quotes/migration.sql`

```sql
-- CreateTable
CREATE TABLE "written_quotes" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "installerId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "capacityOffer" DOUBLE PRECISION,
  "expectedInstallDate" TIMESTAMP(3),
  "notes" TEXT,
  "panelBrand" TEXT,
  "inverterBrand" TEXT,
  "batteryBrand" TEXT,
  "batteryCapacity" TEXT,
  "includeGst" BOOLEAN NOT NULL DEFAULT true,
  "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "includeIncentive" BOOLEAN NOT NULL DEFAULT false,
  "incentiveAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "finalTotal" DOUBLE PRECISION NOT NULL,
  
  -- Negotiation fields
  "negotiationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "homeownerCounterAmount" DOUBLE PRECISION,
  "homeownerCounterAt" TIMESTAMP(3),
  "installerRevisedAmount" DOUBLE PRECISION,
  "installerRevisedAt" TIMESTAMP(3),
  "agreedAmount" DOUBLE PRECISION,
  "agreedAt" TIMESTAMP(3),
  "agreedBy" TEXT,
  
  -- Status fields
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "selectedAt" TIMESTAMP(3),
  "purchasedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  -- JSON fields
  "systemData" JSONB,
  "productsData" JSONB,
  "lineItems" JSONB,
  "assumptions" JSONB,
  "roofData" JSONB,
  "calculations" JSONB,
  "importMeta" JSONB,
  "installerContact" JSONB,

  CONSTRAINT "written_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "written_quotes_leadId_installerId_key" ON "written_quotes"("leadId", "installerId");
CREATE INDEX "written_quotes_leadId_idx" ON "written_quotes"("leadId");
CREATE INDEX "written_quotes_installerId_idx" ON "written_quotes"("installerId");
CREATE INDEX "written_quotes_negotiationStatus_idx" ON "written_quotes"("negotiationStatus");
CREATE INDEX "written_quotes_status_idx" ON "written_quotes"("status");
CREATE INDEX "written_quotes_createdAt_idx" ON "written_quotes"("createdAt");

-- AddForeignKey
ALTER TABLE "written_quotes" ADD CONSTRAINT "written_quotes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "written_quotes" ADD CONSTRAINT "written_quotes_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 5. TESTING STRATEGY

### 5.1 Unit Tests
- ✅ Negotiation state transitions
- ✅ Counter offer limit (1 time only)
- ✅ "Last price" calculation logic
- ✅ "Done Deal" final amount calculation

### 5.2 Integration Tests
- ✅ POST /api/written-quotes → Success
- ✅ PATCH /api/written-quotes/[id]/counter → Homeowner counter once
- ✅ PATCH /api/written-quotes/[id]/counter (2nd attempt) → Error
- ✅ PATCH /api/written-quotes/[id]/revise → Installer updates price
- ✅ POST /api/written-quotes/[id]/agree → Finalize negotiation

### 5.3 E2E Tests
**Test Case 1: Complete Negotiation Flow**
1. Installer submits Written Quote ($10,000)
2. Homeowner counters ($8,000)
3. Installer revises ($9,000)
4. Homeowner clicks "Done Deal"
5. Verify negotiationStatus = 'AGREED'
6. Verify agreedAmount = $9,000

**Test Case 2: Homeowner Counter Limit**
1. Installer submits Written Quote
2. Homeowner counters (1st time) → Success
3. Homeowner tries to counter again → Error 403

**Test Case 3: Installer Accepts Immediately**
1. Installer submits Written Quote ($10,000)
2. Homeowner counters ($8,000)
3. Installer clicks "Done Deal" (accepts $8,000)
4. Verify agreedAmount = $8,000

---

## 6. RISKS & MITIGATION

### 6.1 Risk: Code Duplication
**Mitigation**: Extract shared logic into utilities
- `quoteCalculator.ts` (already exists)
- `negotiationUtils.ts` (NEW - state transitions, validations)
- Shared UI components (NegotiationTimeline, PriceInput)

### 6.2 Risk: Database Constraints Conflict
**Mitigation**: 
- Use separate relation names (`installer_written_quotes` vs `installer_bids`)
- Separate unique constraints on different tables

### 6.3 Risk: UI Confusion Between Bids and Written Quotes
**Mitigation**:
- Clear visual distinction (different icons, colors)
- Explicit labeling ("Written Quote" vs "Bid")
- Separate routes (`/written-quotes` vs `/bids`)

---

## 7. IMPLEMENTATION PHASES

### Phase 1: Database & Types (P0)
- Create WrittenQuote model in schema.prisma
- Run migration
- Define TypeScript types (`CreateWrittenQuoteRequest`, `GetWrittenQuotesResponse`)
- Update User model relations

**Acceptance**: 
- ✅ `npx prisma migrate dev` succeeds
- ✅ `npx prisma generate` creates types
- ✅ No TypeScript errors

---

### Phase 2: Backend APIs (P0)
- Create `/api/written-quotes/route.ts` (POST, GET)
- Create `/api/written-quotes/[id]/counter/route.ts` (PATCH)
- Create `/api/written-quotes/[id]/revise/route.ts` (PATCH)
- Create `/api/written-quotes/[id]/agree/route.ts` (POST)
- Add validation logic
- Add notifications

**Acceptance**:
- ✅ All 5 endpoints return 200/201 for valid requests
- ✅ Proper error handling (400, 403, 404)
- ✅ Audit logs created
- ✅ Notifications sent

---

### Phase 3: Frontend - NegotiationTimeline Component (P1)
- Create shared component
- Design timeline UI
- Format timestamps
- Icon mapping for actions

**Acceptance**:
- ✅ Component renders negotiation history
- ✅ Current price highlighted
- ✅ Timestamps formatted correctly
- ✅ Responsive design

---

### Phase 4: Frontend - WrittenQuoteBuilderModal (P1)
- Copy QuoteBuilderModal.tsx
- Rename to WrittenQuoteBuilderModal.tsx
- Update all "Bid" → "Written Quote" text
- Add NegotiationTimeline to right column
- Add "Revise Quote" section
- Add "Done Deal" button
- Update submit handler to call `/api/written-quotes`

**Acceptance**:
- ✅ Modal opens and renders correctly
- ✅ All 8 sections functional
- ✅ Submit creates Written Quote in database
- ✅ Negotiation section displays
- ✅ Revise quote updates amount
- ✅ "Done Deal" finalizes negotiation

---

### Phase 5: Frontend - HomeownerWrittenQuoteReviewModal (P1)
- Copy HomeownerBiddingReviewModal.tsx
- Rename to HomeownerWrittenQuoteReviewModal.tsx
- Update all "Bid" → "Written Quote" text
- Add NegotiationTimeline to right column
- Add counter offer input (1 time only)
- Add "Done Deal" button
- Fetch data from `/api/written-quotes`

**Acceptance**:
- ✅ Modal displays Written Quotes correctly
- ✅ Counter offer submission works
- ✅ 2nd counter attempt shows error
- ✅ "Done Deal" finalizes negotiation
- ✅ Negotiation timeline updates in real-time

---

### Phase 6: Integration & Testing (P0)
- E2E test: Complete negotiation flow
- E2E test: Homeowner counter limit
- E2E test: Installer multiple revisions
- Load testing: Multiple concurrent negotiations
- Browser testing: Chrome, Firefox, Safari

**Acceptance**:
- ✅ All E2E tests pass
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ No build warnings
- ✅ Responsive on all devices

---

## 8. SUCCESS CRITERIA

### Technical Requirements
- ✅ 0 TypeScript errors
- ✅ 0 build warnings
- ✅ 0 console errors
- ✅ All tests passing
- ✅ Database constraints enforced

### Business Requirements
- ✅ Installer can submit Written Quote
- ✅ Homeowner can counter once
- ✅ Installer can revise multiple times
- ✅ Either party can finalize with "Done Deal"
- ✅ Negotiation history visible to both parties
- ✅ Final amount calculated correctly

### UX Requirements
- ✅ Clear visual distinction from Bidding flow
- ✅ Negotiation timeline easy to understand
- ✅ Counter offer limit clearly communicated
- ✅ "Done Deal" button prominent and clear
- ✅ Responsive design on all devices

---

## 9. DOCUMENTATION REQUIREMENTS

### Code Documentation
- JSDoc comments for all new functions
- Inline comments for complex negotiation logic
- TypeScript types exported and documented

### User Documentation
- Installer guide: "How to submit and negotiate Written Quotes"
- Homeowner guide: "How to review and counter Written Quotes"
- FAQ: Differences between Bids and Written Quotes

---

## 10. ROLLBACK PLAN

If issues arise during implementation:

### Step 1: Isolate Issue
- Check console errors
- Review audit logs
- Check database state

### Step 2: Disable Feature
- Add feature flag `ENABLE_WRITTEN_QUOTES`
- Default to `false` in production
- Enable only after testing

### Step 3: Rollback Migration (if needed)
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Step 4: Restore Previous Code
```bash
git revert <commit-hash>
git push origin main
```

---

## APPENDIX A: File Checklist

### Files to Create
- [ ] `src/components/WrittenQuoteBuilderModal.tsx`
- [ ] `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- [ ] `src/components/shared/NegotiationTimeline.tsx`
- [ ] `src/app/api/written-quotes/route.ts`
- [ ] `src/app/api/written-quotes/[id]/counter/route.ts`
- [ ] `src/app/api/written-quotes/[id]/revise/route.ts`
- [ ] `src/app/api/written-quotes/[id]/agree/route.ts`
- [ ] `src/types/written-quote.ts`
- [ ] `src/utils/negotiationUtils.ts`
- [ ] `prisma/migrations/YYYYMMDDHHMMSS_add_written_quotes/migration.sql`

### Files to Update
- [ ] `prisma/schema.prisma` (add WrittenQuote model)
- [ ] `src/types.ts` (export written quote types)
- [ ] `src/app/installer/page.tsx` (add "Submit Written Quote" button)
- [ ] `src/app/homeowner/dashboard/page.tsx` (add "Review Written Quotes" button)

---

## APPENDIX B: Key Differences Summary

| Aspect | Bidding Flow | Written Quote Flow |
|--------|-------------|-------------------|
| **Negotiation** | None | 1-round (Homeowner → Installer) |
| **Price Changes** | Fixed after submission | Installer can revise multiple times |
| **Homeowner Action** | Select winner only | Counter offer (1x) + Accept/Reject |
| **Finalization** | Auto-finalize on selection | Manual "Done Deal" button |
| **History Tracking** | Single submission record | Full negotiation timeline |
| **Database Model** | `Bid` | `WrittenQuote` |
| **API Endpoints** | `/api/bids` | `/api/written-quotes` |
| **UI Components** | QuoteBuilderModal, HomeownerBiddingReviewModal | WrittenQuoteBuilderModal, HomeownerWrittenQuoteReviewModal |

---

**END OF AUDIT REPORT**
