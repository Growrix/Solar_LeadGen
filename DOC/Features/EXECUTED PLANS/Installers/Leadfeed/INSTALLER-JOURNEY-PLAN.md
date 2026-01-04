# Installer Journey Focus Plan
Date: 2025-11-24
Scope: Complete, simplified installer consumption of leads (CALL_VISIT, WRITTEN_QUOTE, BIDDING) using a single unified lead feed (no separate marketplace page, no per-installer messaging, no resell mechanics).
Baseline References: LEADFEED-AUDIT.md, LEAD-SYSTEM-END-TO-END-AUDIT.md, specs/002-lead-journey-life/spec.md

---
## 1. Pain Points Recap
- Partial backend + partial UI caused divergence (mockLeads, collapsed quote types, missing BIDDING UI).
- Marketplace vs assignment confusion: assignment after approval effectively makes a lead visible/purchasable; separate marketplace view unnecessary.
- Dead or out-of-scope features cluttering focus: per-installer messaging, resell lead logic, standalone InstallerMarketplace component.
- Inconsistent enum usage: some types exclude BIDDING, collapsing WRITTEN_QUOTE & BIDDING to 'written'.

---
## 2. Guiding Principles
1. Unified Feed: One page (`InstallerLeadFeed.tsx`) lists all actionable leads filtered for the installer (approved & assigned or public by assignment logic).
2. Minimal Lifecycle States per Lead Type (installer perspective):
   - CALL_VISIT: Available → Purchased (contact unlocked).
   - WRITTEN_QUOTE: Available → Quote Submitted (contact unlock rule) → (Optional future: Negotiation/Won).
   - BIDDING: Available (countdown active) → Bid Submitted (can update) → Expired (Selection Pending) → (Future: Winner). Contact unlock only after homeowner/admin selection.
3. No messaging system; all interaction limited to purchase or quote/bid submission.
4. No resell logic; purchased leads remain with purchasing installer (admin archival only).
5. Keep code lean: remove unused components/endpoints early to reduce confusion.

---
## 3. Installer User Stories (Per Lead Type)
### CALL_VISIT
- US-CV-01: As a verified installer, I view a CALL_VISIT lead card showing summary + masked contact.
- US-CV-02: I click "Purchase" and, if successful, the card updates with full contact details and a purchased badge. ***And it should in the purchase lead page as well. that page and necessary modals need to create***
- US-CV-03: Other CALL_VISIT leads purchased by me remain accessible with contact; purchased by others show a disabled state.

### WRITTEN_QUOTE
- US-WQ-01: I see a WRITTEN_QUOTE lead card with a "Submit Quote" CTA and masked contact.
- US-WQ-02: On submitting my first quote, card shows my quote status and (policy) contact unlock or stays masked (decision required; recommend unlock on first valid quote).
- US-WQ-03: I can edit/update my quote until homeowner selection (future feature) or lead archival.

### BIDDING
- US-BD-01: I see a BIDDING lead card with a countdown timer, bid count indicator, trophy icon.
- US-BD-02: I submit a bid (quote variant) and can resubmit improved bids until expiry.
- US-BD-03: After expiry, card moves to "Selection Pending"; contact remains masked.
- US-BD-04 (Deferred): If selected as winner, contact unlocks and card transitions to purchased context.

---
## 4. Simplified Status & Flags (Installer View)
| Field | Purpose |
|-------|---------|
| `quoteType` | Differentiates UI (CALL_VISIT | WRITTEN_QUOTE | BIDDING) |
| `installerPurchased` | True if this installer purchased (CALL_VISIT only) |
| `hasSubmittedQuote` | True if installer submitted at least one quote/bid |
| `biddingExpiresAt` | Countdown source for BIDDING |
| `expired` | Lead expired (drives BIDDING selection pending state) |
| `contactUnlocked` | Derived: purchased OR (WRITTEN_QUOTE first submission policy) OR winner (future) |

---
## 5. API Surface (Required Only)
Remove/ignore: marketplace-specific separate endpoint, resell route, messaging/chat endpoints.

| Endpoint | Method | Purpose | Notes |
|----------|--------|---------|-------|
| `/api/leads?installerFeed=true&quoteType=&status=&purchased=` | GET | Unified feed query | Add filter params as needed (quoteType, status, biddingActive) |
| `/api/leads/{id}` | GET | Lead detail | Returns fields incl. flags above (role-based shaping) |
| `/api/leads/{id}/purchase` | POST | Purchase CALL_VISIT lead | Idempotent; reject if already purchased |
| `/api/leads/{id}/quotes` | POST | Submit quote/bid | Payload includes price, notes, bidType(optional) |
| `/api/leads/{id}/quotes?mine=true` | GET | List installer’s quotes for the lead | Used for update UI |
| (Deferred) `/api/leads/{id}/select-winner` | POST | Homeowner/admin chooses winner | Unlocks contact for BIDDING winner |

Simplification: BIDDING listing uses same feed endpoint filtered by `quoteType=BIDDING`.

---
## 6. TypeScript Domain Types
```ts
export type QuoteType = 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING';

export interface InstallerFeedLead {
  id: string;
  quoteType: QuoteType;
  status: 'APPROVED' | 'PURCHASED' | 'ARCHIVED' | 'EXPIRED';
  postcode: string;
  roofType?: string;
  energyBill?: number;
  leadPrice?: number;
  createdAt: string;
  biddingExpiresAt?: string; // only for BIDDING
  installerPurchased: boolean; // this installer
  hasSubmittedQuote: boolean; // this installer
  quotesCount: number; // aggregate
  contactUnlocked: boolean; // derived
}

export interface LeadActionPermissions {
  canPurchase: boolean; // CALL_VISIT and not purchased
  canSubmitQuote: boolean; // WRITTEN_QUOTE or BIDDING and not expired
  canUpdateQuote: boolean; // hasSubmittedQuote and still open
}

export interface QuoteSubmissionPayload {
  amount: number;
  notes?: string;
  isRevision?: boolean;
  quoteType: QuoteType; // must match lead.quoteType
}

export interface BiddingState {
  biddingExpiresAt: string;
  remainingSeconds: number;
  expired: boolean;
}
```

---
## 7. Phase Breakdown
1. Cleanup & Alignment
   - Remove `mockLeads` from `InstallerLeadFeed.tsx`.
   - Delete `InstallerMarketplace.tsx` if not referenced post-refactor.
   - Deprecate/remove `/api/leads/[id]/resell` route and related UI calls.
   - Ensure all enums include `BIDDING`; update `src/types/lead.ts`.
2. API Adjustments
   - Add `installerFeed` filter handling in existing GET /api/leads route (compose filters instead of new endpoint).
   - Guarantee purchase endpoint is idempotent and only for CALL_VISIT.
   - Standardize quote submission for WRITTEN_QUOTE & BIDDING.
3. UI Refactor
   - Split card rendering by `quoteType` variant (CallVisitCard, WrittenQuoteCard, BiddingCard).
   - Introduce derived flags (contactUnlocked, hasSubmittedQuote) from API.
   - Countdown component for BIDDING with graceful expiry state update.
4. Minimal Bidding Support
   - Implement bid submission (same quotes endpoint) + UI state refresh.
   - Expiry detection (client timer; server trust source `biddingExpiresAt`).
   - No winner selection yet (placeholder badge).
5. QA & Hardening
   - Accessibility (focus order, ARIA labels on CTA buttons).
   - Multi-theme semantic class audit (6-command zero matches).
   - Performance: avoid N+1 (ensure quotes count aggregated server-side).

---
## 8. Acceptance Criteria
| Area | Criterion |
|------|-----------|
| Feed | All three quote types render distinct variants |
| Data | No `mockLeads` usage; real API responses only |
| Enum | `QuoteType` consistently includes BIDDING across UI/service code |
| Purchase | CALL_VISIT purchase toggles `installerPurchased` + contact unlock instantly |
| WRITTEN_QUOTE | First successful quote sets `hasSubmittedQuote=true` and (policy) unlocks contact |
| BIDDING | Countdown visible; after expiry state switches; no contact unlock |
| Resell | No resell actions present in UI/API surface |
| Dead Code | `InstallerMarketplace.tsx` and resell route removed/deprecated |
| Styles | 0/0/0/0/0/0 on semantic audit commands |
| Build | `npx tsc --noEmit` & `npm run build` pass |

---
## 9. Dead Code / Deprecation Targets
| Item | Action |
|------|--------|
| `mockLeads` in `InstallerLeadFeed.tsx` | Remove |
| `InstallerMarketplace.tsx` | Delete if unused after feed consolidation |
| Resell route `/api/leads/[id]/resell` | Remove (out-of-scope) |
| Per-installer notes UI | Do not implement; prune placeholders if any |
| Legacy type collapsing (CALL_VISIT vs other) | Replace with explicit QuoteType enum |

---
## 10. Open Policy Decisions (Need Quick Confirmation)
| Topic | Recommended Default |
|-------|---------------------|
| WRITTEN_QUOTE contact unlock | Unlock after first valid quote submission |
| Multiple WRITTEN_QUOTE quotes per installer | Allow revisions (latest overwrites) |
| BIDDING bid revisions | Allow until expiry (store history optional deferred) |
| Post-expiry refresh | Client transitions automatically (no polling required initially) |

---
## 11. Immediate Next Actions
1. Confirm policy decisions (section 10) — especially WRITTEN_QUOTE contact unlock.
2. Remove `mockLeads` & introduce new domain types in `InstallerLeadFeed.tsx` (skeleton only).
3. Update `src/types/lead.ts` to add BIDDING where missing.
4. Add/adjust feed query logic (`installerFeed` flag + filters).
5. Implement card variant components.
6. Add quotes submission integration for WRITTEN_QUOTE & BIDDING.

---
## 12. Execution Order (Lean Sprint)
Day 1: Cleanup (dead code removal) + types + feed query adaptation.
Day 2: CALL_VISIT & WRITTEN_QUOTE card refactor + purchase flow validation.
Day 3: BIDDING card + countdown + quote submission.
Day 4: Edge cases (expiry state), accessibility, semantic audit.
Day 5: Final build, document deltas, acceptance validation.

---
## 13. Exit Criteria
Installer feed fully functional across 3 lead types, no mock arrays, dead code removed, policies enforced, semantic audit passes, build passes.

---
End of Plan.
