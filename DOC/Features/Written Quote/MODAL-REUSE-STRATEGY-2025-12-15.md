# Written Quote Modal Reuse Strategy
**Date:** December 15, 2025  
**Authority:** Implements user requirements; extends existing bidding infrastructure  
**Purpose:** Define how to reuse QuoteBuilderModal and HomeownerBiddingReviewModal for Written Quote negotiation

---

## Executive Summary
Written Quote will **REUSE** existing bidding modals + backend, extending them with negotiation functionality. This approach:
- Avoids rebuilding modals from scratch
- Leverages proven backend infrastructure (`Bid` model schema, API patterns)
- Adds minimal new models (`WrittenQuote`, `WrittenQuoteEvent`) for negotiation state
- Keeps UX consistent between Bidding and Written Quote flows

---

## Bidding Flow (Existing—Reference)

### Installer Side: QuoteBuilderModal
- **Entry**: Installer opens assigned bidding lead → clicks "Place Bid"
- **Modal**: `QuoteBuilderModal` with `mode='bid'`
- **Content**: 60+ quote builder fields (system, roof, products, pricing, compliance)
- **Action**: "Submit Bid" button → `POST /api/bids` → creates `Bid` record with 8 JSON fields
- **Backend**: `prisma/schema.prisma` → `Bid` model (leadId, installerId, amount, systemData, productsData, lineItems, etc.)

### Homeowner Side: HomeownerBiddingReviewModal
- **Entry**: Homeowner opens bidding lead → clicks "Review Bids"
- **Modal**: `HomeownerBiddingReviewModal`
- **Content**: Bid comparison (left: bid details, right: InstantQuote context), installer dropdown
- **Action**: "Select as Winner" button → `POST /api/bids/[bidId]/select` → marks bid as SELECTED
- **Payment**: Winner pays → `POST /api/bids/[bidId]/purchase` → unlocks homeowner contact details

---

## Written Quote Flow (Extension Strategy)

### Key Differences from Bidding
| Aspect | Bidding | Written Quote |
|--------|---------|---------------|
| Submission | One-time bid | Initial quote + negotiation rounds |
| Homeowner Action | Select winner | Counter-offer or Accept/Reject |
| Price Changes | Fixed | Dynamic (installer can revise) |
| Backend Model | `Bid` (status: SUBMITTED/SELECTED) | `WrittenQuote` (status: OFFERED/COUNTERED/ACCEPTED/REJECTED) + `WrittenQuoteEvent` history |

### Installer Side: QuoteBuilderModal Extension

**Changes Required:**
1. **Mode Prop**: Extend `mode` type to `'quote' | 'bid' | 'written-quote'`
2. **Button Text**: Change "Submit Bid" to "Submit Quote" when `mode='written-quote'`
3. **Right Column Addition**: Add `<WrittenQuoteNegotiationPanel>` below CustomerPreview
   - Shows current negotiation state (price, status, last action timestamp)
   - Shows history timeline (offer → counter → offer → done)
   - Action buttons:
     - **Initial**: "Submit Quote" (same as bid flow)
     - **After counter**: "Revise Quote" (update price + note) or "Accept Counter" (finalize)
4. **API Target**: `POST /api/written-quotes/start` (initial), `/offer` (revisions)

**UI Layout:**
```
┌─────────────────────────────────────┬──────────────────────────┐
│ System Selection ▼                  │ Customer Preview ▼       │
│ Roof & Site Details ▲               │ ════════════════════     │
│ Product Configuration ▲             │ [Quote summary cards]    │
│ Pricing Engine ▲                    │ ════════════════════     │
│ Compliance & Docs ▲                 │                          │
│                                     │ Negotiation Status ▼     │
│ [Submit Quote / Revise Quote]       │ ════════════════════     │
│                                     │ Current: $8,500          │
│                                     │ Status: Countered        │
│                                     │ Last: Homeowner 2h ago   │
│                                     │ ────────────────────     │
│                                     │ History: 3 events        │
│                                     │ • Offered $9,000         │
│                                     │ • Countered $8,500       │
│                                     │ • Offered $8,750 (you)   │
│                                     │ ────────────────────     │
│                                     │ [Revise Quote] [Accept]  │
└─────────────────────────────────────┴──────────────────────────┘
```

### Homeowner Side: HomeownerBiddingReviewModal Extension

**Changes Required:**
1. **Tab Switcher**: Add state `activeTab: 'bids' | 'written-quote'`
   - Default to 'bids' for bidding leads
   - Switch to 'written-quote' when viewing Written Quote
2. **Left Column (Written Quote View)**:
   - Show current quote details (price, system specs, products)
   - Replace installer dropdown with single installer (only 1 Written Quote per installer)
   - Show negotiation history timeline
   - Action buttons:
     - **On OFFERED status**: "Counter Price" (modal/inline input) or "Accept Quote"
     - **On COUNTERED status**: Wait for installer response
     - **On ACCEPTED**: "Proceed to Payment" (same as bidding)
3. **Right Column**: Keep InstantQuote context (collapsible, same as bidding)
4. **API Target**: `POST /api/written-quotes/[id]/counter`, `/done`

**UI Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [Competitive Bids] [Written Quote] ◄─── Tab switcher             │
├─────────────────────────────────────┬────────────────────────────┤
│ Written Quote from XYZ Solar        │ Your Request Details ▼     │
│ ═══════════════════════════════════ │ ══════════════════════     │
│ Current Price: $8,500               │ [InstantQuote context]     │
│ Status: Countered by you            │ [Technical details]        │
│ Last Update: 30 minutes ago         │ [Results summary]          │
│ ─────────────────────────────────── │                            │
│ Negotiation History:                │                            │
│ • Dec 15, 10:00 AM - Offered $9,000 │                            │
│ • Dec 15, 11:30 AM - You countered  │                            │
│   $8,500                            │                            │
│ • Dec 15, 12:00 PM - Installer      │                            │
│   revised to $8,750                 │                            │
│ ─────────────────────────────────── │                            │
│ [System Details] [Products] [Docs]  │                            │
│ ═══════════════════════════════════ │                            │
│ Your Actions:                       │                            │
│ ┌─────────────────────────────────┐ │                            │
│ │ Counter Price: $____            │ │                            │
│ │ [Counter] [Accept $8,750]       │ │                            │
│ └─────────────────────────────────┘ │                            │
└─────────────────────────────────────┴────────────────────────────┘
```

---

## Backend Extension

### Prisma Models (New)

```prisma
model WrittenQuote {
  id              String   @id @default(cuid())
  leadId          String
  installerId     String
  homeownerId     String
  currentPrice    Float
  currentStatus   String   @default("OFFERED") // OFFERED | COUNTERED | ACCEPTED | REJECTED
  lastActionBy    String   // INSTALLER | HOMEOWNER
  lastActionAt    DateTime @default(now())
  
  // Comprehensive Quote Builder data (same as Bid model)
  systemData       Json?
  productsData     Json?
  lineItems        Json?
  assumptions      Json?
  roofData         Json?
  calculations     Json?
  importMeta       Json?
  installerContact Json?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  lead            Lead     @relation("lead_written_quotes", fields: [leadId], references: [id], onDelete: Cascade)
  installer       User     @relation("installer_written_quotes", fields: [installerId], references: [id], onDelete: Cascade)
  homeowner       User     @relation("homeowner_written_quotes", fields: [homeownerId], references: [id], onDelete: Cascade)
  events          WrittenQuoteEvent[]
  
  @@unique([leadId, installerId])
  @@index([leadId])
  @@index([installerId])
  @@index([homeownerId])
  @@index([currentStatus])
  @@index([createdAt])
  @@map("written_quotes")
}

model WrittenQuoteEvent {
  id              String   @id @default(cuid())
  writtenQuoteId  String
  actorId         String
  action          String   // OFFER | COUNTER | DONE
  priceOffered    Float
  notes           String?
  timestamp       DateTime @default(now())
  
  writtenQuote    WrittenQuote @relation(fields: [writtenQuoteId], references: [id], onDelete: Cascade)
  actor           User         @relation("user_written_quote_events", fields: [actorId], references: [id], onDelete: Cascade)
  
  @@index([writtenQuoteId])
  @@index([actorId])
  @@index([timestamp])
  @@map("written_quote_events")
}
```

### API Endpoints (New)

1. **`POST /api/written-quotes/start`** (Installer-only)
   - Creates initial WrittenQuote + first event
   - Similar to `POST /api/bids` but with negotiation state
   
2. **`POST /api/written-quotes/[id]/offer`** (Installer-only)
   - Updates currentPrice, sets status=OFFERED, logs event
   
3. **`POST /api/written-quotes/[id]/counter`** (Homeowner-only)
   - Updates currentPrice, sets status=COUNTERED, logs event
   
4. **`POST /api/written-quotes/[id]/done`** (Homeowner-only)
   - Sets status=ACCEPTED or REJECTED, logs event
   - If ACCEPTED, trigger payment flow (reuse bidding payment logic)
   
5. **`GET /api/written-quotes?leadId=X&installerId=Y`** (Both roles)
   - Fetches WrittenQuote with events for display in modals

---

## Implementation Checklist

### Phase 1: UI Extensions (No backend changes)
- [ ] Extend `QuoteBuilderModal` props: `mode` type to include `'written-quote'`
- [ ] Create `<WrittenQuoteNegotiationPanel>` component (mock data initially)
- [ ] Add panel to QuoteBuilderModal right column when `mode='written-quote'`
- [ ] Extend `HomeownerBiddingReviewModal`: add tab switcher state
- [ ] Add "Written Quote" tab content (mock data initially)
- [ ] Test multi-theme (Dark/Light/Purple) and responsive (5 breakpoints)
- [ ] Playwright: Render modals in written-quote mode, assert no crashes

### Phase 2: Backend Integration
- [ ] Add Prisma models: `WrittenQuote`, `WrittenQuoteEvent`
- [ ] Add relations to `User` and `Lead` models
- [ ] Run migration: `npx prisma migrate dev --name written_quote`
- [ ] Create API routes: `/start`, `/[id]/offer`, `/[id]/counter`, `/[id]/done`, `/get`
- [ ] Wire UI fetch/submit actions to APIs
- [ ] Add feature flag for beta cohort
- [ ] Playwright: E2E flow (start → offer → counter → done → payment)

### Phase 3: Notifications & Polish
- [ ] Neutral notifications for homeowners (no "lead/purchase/paid" language)
- [ ] SendGrid email templates for offer/counter/done events
- [ ] Audit logging for negotiation events
- [ ] Post-migration verification (specs/007): 0/0/0/0/0/0
- [ ] Final multi-theme + responsive checks

---

## Success Criteria
- Installer can submit Written Quote using existing QuoteBuilderModal with new button
- Homeowner can counter/accept using existing HomeownerBiddingReviewModal with new tab
- Negotiation history visible to both parties
- Payment flow same as bidding (winner pays → unlock contact)
- No hardcoded classes; 100% semantic tokens
- Playwright tests pass for full negotiation cycle
- Zero TypeScript/build errors

---

## References
- Existing Bidding: `src/components/QuoteBuilderModal.tsx`, `src/components/homeowner/HomeownerBiddingReviewModal.tsx`
- Existing API: `src/app/api/bids/route.ts`, `/[bidId]/select/route.ts`, `/[bidId]/purchase/route.ts`
- Prisma Models: `prisma/schema.prisma` (Bid model at line 340)
- Guidelines: DOC/GUIDELINES & SOT/README.md, AI-IMPLEMENTATION-GUIDELINES.md
- Migration Gates: specs/007-migration-and-build/spec.md & plan.md
