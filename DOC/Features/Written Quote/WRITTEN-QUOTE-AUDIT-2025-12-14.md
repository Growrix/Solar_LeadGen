# Written Quote Flow — Audit & Initial Plan (2025-12-14)

Purpose: Establish current status, gaps, and an actionable e2e plan to implement a "Written Quote" negotiation flow using the existing Review Bid modal with minimal UI changes and strict backend/frontend separation.

---

## Current Status (Observed/Assumed from prompts)
- Call/Visit and Bidding lead flows exist with bid submission and homeowner review.
- A Review Bids modal exists (homeowner side), currently displaying demo/static data in places.
- Notification system is being improved; SendGrid email integration exists and is under audit.
- No explicit endpoints or schema for written-quote negotiation iterations (masked installer offers, homeowner counter, last-price semantics, done-deal actions).

---

## Target Flow Overview
- Installer submits a masked written quote amount (e.g., $5,000) tied to a lead.
- Homeowner can propose a counter amount (free-form numeric), respecting limits:
  - Installer’s new price replaces prior; “last price” is authoritative until next change.
  - Either party can press “Done deal” → negotiation closes; installer proceeds to payment.
- After “Done deal”, normal purchase flow continues (payment → unlock contact → status updates).

---

## Gaps Identified
- Missing data model to store negotiation rounds (installer offers, homeowner counters, status: OPEN/CLOSED).
- Missing endpoints to create/update/read negotiation state per `leadId` and installer.
- UI reuse path identified (Review Bids modal) but needs a right-side panel update to show masked quote and negotiation history.
- Notifications and SendGrid templates for: new offer, counter, done-deal, payment required.

---

## Constraints & Rules
- Follow D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md authority hierarchy and AI-IMPLEMENTATION-GUIDELINES.md.
- UI displays state only; backend validates and enforces rules (limits, closure).
- Multi-theme and accessibility standards apply; no business logic in UI.

---

## Initial E2E Implementation Plan

1) Data Model (Prisma)
- `WrittenQuote` (per installer, per lead):
  - id, leadId, installerId, homeownerId
  - status: OPEN | CLOSED
  - lastPriceByInstaller (int)
  - lastCounterByHomeowner (int | null)
  - closedBy: INSTALLER | HOMEOWNER | SYSTEM | null
  - closedAt: DateTime | null
  - createdAt, updatedAt
- `WrittenQuoteEvent` (history):
  - id, writtenQuoteId
  - actor: INSTALLER | HOMEOWNER
  - type: OFFER | COUNTER | DONE_DEAL
  - amount: int | null
  - createdAt

2) API Endpoints (App Router)
- POST `/api/written-quotes/[leadId]/start` (installer)
  - Create/open `WrittenQuote` for lead+installer.
- POST `/api/written-quotes/[id]/offer` (installer)
  - Validate OPEN; set `lastPriceByInstaller`, add event OFFER.
- POST `/api/written-quotes/[id]/counter` (homeowner)
  - Validate OPEN; set `lastCounterByHomeowner`, add event COUNTER.
- POST `/api/written-quotes/[id]/done` (installer/homeowner)
  - Validate OPEN; set status CLOSED, add event DONE_DEAL.
- GET `/api/written-quotes/[leadId]/[installerId]`
  - Return current `WrittenQuote` and latest events.

3) UI (Reuse Review Bids Modal)
- Add a toggle tab: "Bids" | "Written Quote".
- Written Quote tab shows:
  - Current masked installer price, last homeowner counter (if any).
  - Compact history list (OFFER/COUNTER timestamps).
  - Actions: homeowner counter input (+ submit), installer “Done deal” button.
- Right panel keeps Lead details (InstantQuote data) collapsible per existing standards.

4) Notifications & Email (SendGrid)
- Events:
  - New Installer Offer → notify homeowner (in-app + email).
  - Homeowner Counter → notify installer.
  - Done Deal → notify both; installer instructed to proceed to payment.
- Use neutral wording (no “lead/purchase/paid” for homeowners).

5) Validation & Limits
- Only one OPEN `WrittenQuote` per lead+installer.
- Counter amount: numeric, within sane bounds; backend enforces.
- “Done deal” locks negotiation; payment required to unlock contacts and move status.

6) Testing Strategy (Playwright + API)
- Start negotiation → offer → counter → done-deal → payment CTA visible to installer.
- Email notifications fire for each transition; `EmailDelivery` entries logged.
- Role-based access: installer vs homeowner vs admin.

---

## Risks & Mitigations
- Scope creep: Keep MVP minimal (offer/counter/done, masked price only).
- UI reuse complexity: Isolate modal tab; avoid large refactors.
- Consistency with existing purchase flow: Integrate via existing payment endpoints.

---

## Success Criteria
- Negotiation rounds persist and are retrievable.
- Clear UI affordances for offer/counter/done.
- Correct notifications/emails per event.
- Payment gate after “Done deal” before revealing contacts.
