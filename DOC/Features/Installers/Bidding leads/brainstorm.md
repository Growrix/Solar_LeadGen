# Bidding Feature Brainstorm & Expansion

Goal: Extend existing lead + assignment + countdown infrastructure to support rich multi-installer bidding while preserving current flows for CALL_VISIT and WRITTEN_QUOTE. This document expands beyond the initial plan, exploring UX, backend model design, integration touchpoints, fairness, test strategy, and phased rollout.

---
## 1. Core Principles
- **Non-invasive extension**: Do not break existing lead creation, assignment, purchase logic.
- **Lead-centric**: One lead object orchestrates bidder window via `expiresAt`; bidding builds around it.
- **Role clarity**: Admin controls window + awarding; installers submit & revise bids; homeowner observes status + gets reassurance post-award.
- **Progressive disclosure**: Installers see technical/project data required for pricing—but never personal contact until purchase post-award.
- **Atomic transitions**: Each critical state change (award, purchase) logged + audited.
- **Stop-on-fail testing**: Each phase must pass tests before next.

(***my notes:***this core principles is good, keep it as it is, but enhance as per my further notes below. )
---
## 2. Data Model Enhancements
(***my notes:*** re-plan later after finializing the user stories and journeys.)
### 2.1 New Model: `Bid`
```
model Bid {
  id            String   @id @default(cuid())
  leadId        String
  installerId   String
  amount        Decimal  // Proposed bid price (ex GST / inclusive? configurable)
  currency      String   // 'AUD' default; future multi-currency support
  notes         String?  // Freeform clarifications
  capacityOffer String?  // kW or system size offered
  batteryOffer  String?  // If battery sizing included
  expectedInstallDate DateTime? // Optional proposed start date
  validityDays  Int?     // Bid valid timeframe after award (optional)
  attachments   Json?    // Future: quote PDF, design file references
  status        BidStatus @default(PENDING)
  submittedAt   DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lead          Lead     @relation(fields: [leadId], references: [id])
  installer     User     @relation(fields: [installerId], references: [id])
  @@unique([leadId, installerId])
  @@index([leadId])
  @@index([installerId])
}

enum BidStatus {
  PENDING     // Draft not yet actively submitted (optional if we allow drafts)
  SUBMITTED   // Active bid inside window
  WITHDRAWN   // Installer withdrew before window close
  WINDOW_CLOSED // Auto-set when countdown ends without withdrawal
  UNDER_REVIEW // Window closed; admin evaluating
  AWARDED     // Selected by admin
  LOST        // Not selected
  PURCHASED   // Winning installer completed purchase unlock
  CANCELLED   // Lead or bid voided (lead cancelled / admin manual)
}
```
### 2.2 Lead Additions (Optional / Non-breaking)
- `biddingAwardedInstallerId: String?` (points to winner for gating purchase)
- `biddingState: BiddingState` enum to reflect high-level phase:
  - `OPEN` | `CLOSED` | `AWARDED` | `PURCHASE_PENDING` | `PURCHASED` | `CANCELLED`
- `biddingSummaryCache: Json?` (store aggregate metrics: bid count, min, max, median for quick UI)

### 2.3 Derived / Non-persistent Values
- Active window left = `expiresAt - now`.
- Installer eligibility: assigned + lead.quoteType == BIDDING + `biddingState == OPEN`.

---
## 3. User Journeys (Detailed)
### 3.1 Installer Journey
1. Sees BIDDING lead card (masked contact) with countdown bar + "View Details" button.
2. Opens *Lead Detail (Bid Evaluation) Modal* → shows: location, postcode, energyBill, roofType, budgetRange, desiredOffset, batteryRequired, timeframe, additionalNotes, (quoteData sanitized). No homeowner name/email/phone/address.
 (***my notes:*** Here in this details modal i want to show everything that homeowners provided except personal contact info. This is to help installers make informed bids without revealing sensitive info. )

3. Clicks "Place / Update Bid" → *Bid Submission Modal* with fields: amount, capacityOffer, expectedInstallDate, notes. 
(***my notes:*** I already have a Quote builder modal, so we can use it as a bid submission modal and enhace the modal as per needed, reusing existing components where possible to maintain consistency and reduce development time. And homewoners quote request never has a concrete price, so installers will provide their own bid amounts based on the lead details. This way we can keep the bidding process flexible and competitive. also the homeowner can see the bids with bidding quote submitted but not the installer details until award.the quote builder modal should have autosave functionality so that installers don't lose their input if they accidentally close the modal or navigate away. This will enhance user experience and reduce frustration. I want to make sure that the bid submission process is smooth and user-friendly.  )

4. Submits → status SUBMITTED. Can re-open and adjust until window closes.
5. After countdown expiration: bid locked; card shows "Awaiting Award".
6. If AWARDED: card updates with status badge → CTA "Purchase to Unlock" (using existing purchase endpoint with added gating logic).
7. Successful purchase → contact unmasked; moves to Purchased > Bidding tab.
8. If LOST: card either disappears from feed or shows "Not Selected" (decide UX—likely hide by default).
(***my notes:*** it is better to not selected status to show , and keep it in the bidding history of the installers side, so that they can see their past bids and outcomes for reference. this will help them improve their future bids and understand the competition better. but in the lead feed it should be hidden to avoid clutter and confusion.)

### 3.2 Admin Journey
1. Assigns installers (current flow) + sets/edit countdown (existing timer logic).
2. During window: can monitor incoming bids via *Bids Panel* showing real-time table (installer, amount, last update, notes, coverage match %).
3. At window close (auto or manual end): system transitions all SUBMITTED → UNDER_REVIEW and PENDING → WINDOW_CLOSED.
4. Admin reviews bids → can open *Bid Comparison Modal* (sortable by amount, capacityOffer, earliest install date).
5. Clicks "Award" on chosen bid → sets: lead.biddingAwardedInstallerId, bid.status = AWARDED, others LOST, lead.biddingState = AWARDED. 

(***my notes:*** I think after the homeowners selected the installer there should be no approval or award from admin side, because it will slow down the process and create unnecessary bottlenecks. The homeowners should have the autonomy to choose the installer based on the bids they receive. And the installers will unlock the contact details after purchase the lead. And then the admin gets notified of the purchase and can see the awarded installer in the lead details. This way we streamline the process and empower homeowners to make their own decisions while still maintaining oversight for admins. )

6. Winner notified; purchase unlock permitted. Admin UI shows purchase status post-award.
7. After winner purchases: lead.biddingState = PURCHASED; admin sees finalization timestamp.

### 3.3 Homeowner Journey
1. Submits BIDDING lead (same form; quoteType=BIDDING).
2. Receives notification when first bid arrives → status label becomes "Responded by Installer".
(***my notes:*** when a Installer submits a bid for a homeowners lead, the homeowner should receive a notification indicating that their lead has received a response from an installer. This notification can be in the form of an email or an in-app alert, depending on the platform's capabilities. The status label on their lead card should also update to "Responded by Installer" to provide a clear visual cue that there has been activity on their lead. And show a modal where the homeowners can see the submitted bids with amount, capacity offered, expected install date, and notes from installers. but not the installer details until award. That one modal should be designed to be user-friendly and informative,and also show the installers quote submission accordingly. The modal should have a sidebar for the Installers company name which will be blurred until awared, and the Quotes with detailed shoudl show on the right side , so that the homeowners can review it , there should be a button on each quote "Deal Accepted" after the countdown time is finished, When homeowner clicked on that button the lead will be marked as awarded to that installer and the installer will be notified to proceed with the purchase to unlock the contact details. This way the homeowners can make an informed decision based on the bids they receive while keeping the installers' identities confidential until the award.)

3. (Optional Expansion) Post-window: homeowner can view summary (min/max/median, capacity ranges) but not installer specifics if business requires admin mediation only.
4. After award + purchase → homeowner notified "Installer selected; expect contact soon" (no direct manual decision required per current spec).



---
## 4. Frontend Components (New / Extended)
| Component | Purpose | Integration |
|-----------|---------|-------------|
| `BidEvaluationModal` | Installer view of lead technical data | Reuses lead fields from `InstallerLeadFeed` lead object; filter out contact fields |
| `BidSubmissionModal` | Form for amount/capacity/notes | Controlled by installer; disabled if window closed or bid AWARDED/LOST |
| `AdminBidsPanel` | Embedded in Admin Lead Management modal | Lists all bids with sorting/filtering |
| `BidComparisonModal` | Rich comparison for award decision | Aggregates metrics + highlight anomalies |
| `BiddingStatusBadge` | Renders state (OPEN, CLOSED, AWARDED, PURCHASE_PENDING, PURCHASED) | Shared style token mapping |
| `PurchasedBiddingCard` | Post-purchase card variant | Actually reuse SOT card + conditionally reveals contact |

Reuse existing *InstallerLeadFeed* by injecting BIDDING-specific action area: if `quoteType === 'BIDDING'` show "View Details" + conditional "Place Bid" / "Update Bid" / "Purchase" states.

---
## 5. Backend Services Expansion
### 5.1 New Service Functions (in `lead-service.ts` adjunct or `bid-service.ts`)
- `submitOrUpdateBid({ leadId, installerId, amount, notes, capacityOffer, expectedInstallDate })` → validates eligibility & window; UPSERT.
- `withdrawBid({ leadId, installerId })` → sets status WITHDRAWN if window open.
- `listBidsForLead(leadId)` → returns sanitized bids.
- `awardBid({ leadId, installerId, adminId })` → transactional:
  1. Verify window closed.
  2. Set winner AWARDED; others LOST.
  3. Update lead.biddingAwardedInstallerId & lead.biddingState = AWARDED.
  4. Notifications.
- `markBidLeadPurchased(leadId, installerId)` (extend current purchase logic) → ensure installer is awarded; update lead.biddingState = PURCHASED + purchasedAt.

### 5.2 Purchase Route Adjustment
- Existing `/api/installer/leads/[id]/purchase`: Add guard:
  - If `lead.quoteType === 'BIDDING'` then require `lead.biddingAwardedInstallerId === session.user.id`.

### 5.3 Countdown Handling
- Reuse existing `updateLeadCountdown` for BIDDING window; when `expiresAt <= now`:
  - Cron / on-demand check transitions SUBMITTED → UNDER_REVIEW & PENDING → WINDOW_CLOSED.
  - Could implement lightweight scheduled check (e.g., invoked when admin opens modal or installer loads feed—lazy evaluation for dev simplicity).

### 5.4 Notifications (Extend `notification-service.ts`)
| Event | Type | Recipient |
|-------|------|-----------|
| First bid submitted | `NEW_BID` | Homeowner + Admin |
| Bid updated | `BID_UPDATED` | Admin (optional) |
| Window closed | `BIDDING_CLOSED` | Admin |
| Bid awarded | `BID_AWARDED` | Winner installer |
| Bid not selected | `BID_LOST` | Losing installers |
| Purchase completed | `BIDDING_PURCHASED` | Homeowner + Admin |

### 5.5 Audit Log Additions
Actions: `BID_SUBMITTED`, `BID_UPDATED`, `BID_WITHDRAWN`, `BID_WINDOW_CLOSED`, `BID_AWARDED`, `BID_LOST`, `BIDDING_PURCHASE_UNLOCKED`.

---
## 6. State Machine Overview
```
OPEN (countdown running)
  -> (installer submits) SUBMITTED bids accumulate
  -> (installer withdraws) WITHDRAWN
OPEN end-of-window -> CLOSED (system marks lead.biddingState=CLOSED; bids -> UNDER_REVIEW or WINDOW_CLOSED)
CLOSED -> AWARDED (admin picks winner; others LOST)
AWARDED -> PURCHASE_PENDING (implicit state if not purchased yet)
PURCHASE_PENDING -> PURCHASED (winner completes purchase)
Any -> CANCELLED (lead cancelled / archived)
```
Simplify by storing only `biddingState` on Lead + per-bid `status` rather than a monolithic state machine object.

---
## 7. Pricing & Evaluation Considerations
- **Installer self-pricing**: Provided technical data + optional aggregated usage stats (e.g., energyBill, desiredOffset). No algorithmic price suggestion initially (avoid complexity). Later: optional helper endpoint `/api/installer/bids/estimate?leadId=...` returning historical median for similar postcode / roofType.
- **Fairness**: Do not reveal competitor bid amounts before window close. Admin-only view until awarding.
- **Anonymity**: Installer sees only own bid; not others' until after award (and even then maybe only result, not amounts, to limit collusion).

---
## 8. Edge Cases & Safeguards
| Scenario | Handling |
|----------|----------|
| Installer submits after window close | Reject with 400 (window closed) |
| Admin tries to award before window close | Force window closure (optional) or reject |
| Winner withdraws post-award before purchase | Admin can re-award another SUBMITTED / LOST bid; previous AWARDED becomes WITHDRAWN; notify homeowner (optional) |
| Lead cancelled during bidding | Set all active bids CANCELLED; notify installers |
| Clock drift / missed closure | Lazy closure logic triggers on next relevant API call (list bids / submit attempt) |
| Multiple award attempts | Transaction checks existing `biddingAwardedInstallerId` not set |

---
## 9. Incremental Rollout Phases
| Phase | Scope | Exit Tests |
|-------|-------|------------|
| P1 Model & Basic APIs | `Bid` schema + submit/list + guard purchase | Create/update bid; reject after window; purchase guard works |
| P2 Admin Review | Bids panel + award endpoint | Award sets statuses; notifications stubbed |
| P3 Installer UI | Bid modals + state badges | Full submit/update/locked transitions; award -> purchase CTA |
| P4 Purchase Integration | Gated purchase unlock | Contact reveals only for winner; audit log entries present |
| P5 Homeowner Status | Basic notifications + status label | First bid triggers label; post-award notification visible |
| P6 Enhancements | Comparison modal, summary metrics | Accurate min/max/median caching |

Stop-on-fail: If any Exit Test fails, do not proceed to next phase.

---
## 10. Testing Strategy (Detailed)
### Automated (Future)
- Unit: Bid service validations (window open, uniqueness, award logic).
- Integration: Purchase route gating for awarded installer.
- Migration: Schema diff run + prisma generate.

### Manual (Immediate Dev Environment)
1. Create BIDDING lead, assign 2 installers, set 2-day countdown.
2. Installer A submits bid; verify homeowner status flips.
3. Installer B submits bid; confirm Admin panel list shows both.
4. Simulate window close (manually set past `expiresAt`); open Admin panel → confirm statuses update to UNDER_REVIEW.
5. Award Installer B; Installer A sees LOST state (hidden or badge). Installer B sees purchase button.
6. Installer B purchases; contact unmasked + moves to Purchased Bidding tab.
7. Audit logs contain each action.

---
## 11. Frontend Integration Points
- Extend `InstallerLeadFeed` lead mapping: ensure BIDDING leads dispatch new handlers `openBidEvaluation(lead)` + `openBidSubmission(lead)`.
- Add context provider (optional) for bidding state caching to reduce API calls.
- Reuse existing countdown component; hide after AWARDED or PURCHASED or LOST.
- Admin modal: integrate bids panel as a child component driven by `GET /api/admin/leads/[id]/bids`.

---
## 12. Performance & Scaling Considerations
- Bids per lead expected relatively low (tens). Simple indexing sufficient.
- Cache summary metrics on award / window close to avoid recomputation in homeowner view.
- Avoid N+1 queries: `listBidsForLead` includes installer basic data (companyName, postcode coverage) with selective fields.

---
## 13. Security & Abuse Prevention (Future Hooks)
- Rate limit bid updates per installer (e.g., max 10 revisions).
- Prevent extremely low or negative amounts (validation rules: amount > 0, <= configurable ceiling).
- Optionally store a hash of bid content for tamper detection.

---
## 14. UX Copy & Status Labels
| State | Badge Text |
|-------|------------|
| OPEN | "Bidding Open" |
| UNDER_REVIEW | "Reviewing Bids" |
| AWARDED (pre-purchase) | "Awarded – Purchase Pending" |
| PURCHASED | "Installer Selected" |
| LOST | "Not Selected" |
| WINDOW_CLOSED (no award yet) | "Window Closed" |

Homeowner label for first bid: "Responded by Installer".

---
## 15. Open Decisions (To Confirm Before Build)
- Show losing bid amounts to admin only (YES) and never to installers/homeowner (initially). ✅
- Allow installer bid withdrawal? (YES while window open.) ✅
- Allow admin manual window close early? (YES—sets state to CLOSED immediately.) ✅
- Auto-award lowest bid? (NO—manual human decision for now.) ✅

---
## 16. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Complex state drift | Centralize transitions in service functions + audit logs |
| Installers confused about required info | Provide tooltip + evaluation modal with structured technical fields |
| Over-engineering attachments early | Defer actual file upload until core bidding stable |
| Purchase race condition | Gated purchase check with transaction verifying award before unlock |

---
## 17. Next Immediate Implementation Targets (Phase P1)
1. Add `Bid` model to schema.
2. Create `bid-service.ts` with `submitOrUpdateBid`, `listBidsForLead`.
3. Add minimal installer bid submit/list routes.
4. Manual test: create BIDDING lead → assign installers → submit bids.
5. Document results; proceed to P2 only if all pass.

---
Prepared for expansion while remaining consistent with existing architecture and semantic UI constraints.

(***my notes:*** re-plan later after finializing the user stories and journeys for the 4 -17.)