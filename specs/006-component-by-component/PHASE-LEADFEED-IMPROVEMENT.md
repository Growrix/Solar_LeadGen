# Phase: Installer Lead Feed Improvement

Date: 2025-11-24
Objective: Implement distinct lifecycles and UI behaviors for CALL_VISIT, WRITTEN_QUOTE, and BIDDING leads; remove mock data; integrate real unlock & quote flows.

## Goals
- Backend endpoints for purchase (CALL_VISIT), quote submission (WRITTEN_QUOTE), bidding listing & bid submission (BIDDING).
- Frontend: Replace mock state with server data; represent each quoteType distinctly.
- Correct propertyType/roofType/budget display ("residential area" bug).
- Server-authoritative contact masking (no local assumptions).

## Deliverables
1. Extended AssignedLead API shape (add roofType, budgetRange, purchaseStatus, purchasedAt, quotesCount).
2. New endpoints: purchase, submit quote, list marketplace & bidding leads.
3. Refactored InstallerLeadFeed component (remove mockLeads, add bidding support, map enums directly).
4. Updated mapping layer (no collapsing of quoteType; accurate field usage).
5. Documentation: Audit Report (done), this phase file, tasks appended to tasks.md.

## Phased Plan
Phase A: Data & Types Alignment
- Extend /api/installer/leads/assigned response with missing fields.
- Adjust mapping & component types to use backend enums (LeadQuoteType, LeadStatus).
- Remove mockLeads + local unlock simulation.

Phase B: CALL_VISIT Purchase Flow
- POST /api/installer/leads/{id}/purchase endpoint.
- Integrate payment/unlock button -> call backend; update UI from response.

Phase C: WRITTEN_QUOTE Submission Flow
- POST /api/installer/leads/{id}/quotes endpoint.
- Connect QuoteBuilderModal to real submission; reflect QUOTED status.

Phase D: BIDDING Lifecycle Integration
- GET /api/installer/leads/bidding listing competitive leads.
- POST /api/installer/leads/{id}/bids endpoint (or reuse quotes with quoteType=BIDDING).
- Distinct UI: bid count, persistent countdown, "Submit Bid" CTA.

Phase E: Contact Unlock Policies
- Clarify per quoteType when contact reveals.
- Enforce server masking; update UI states accordingly.

Phase F: QA & Verification
- Theme checks (Dark/Light/Purple).
- Responsive breakpoints (320, 375, 768, 1024, 1440).
- Accessibility & status badge semantics.
- Build & type validation.

## Open Questions
- WRITTEN_QUOTE contact reveal timing.
- BIDDING contact reveal trigger.
- Will purchase deduct credits or hit Stripe? (Stripe integration scope?).

## Success Criteria
- No mock data usage.
- Distinct card variants for all 3 quote types.
- Unlock only via backend purchase; contact details switch based on server response.
- Bidding leads visible if assigned or in marketplace.

