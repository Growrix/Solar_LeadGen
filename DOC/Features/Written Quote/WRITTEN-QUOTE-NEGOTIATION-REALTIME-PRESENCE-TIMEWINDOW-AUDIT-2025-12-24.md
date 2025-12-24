# Written Quote Negotiation — Realtime Updates, Presence, Time Window (Audit)

Date: 2025-12-24
Owner: Engineering
Scope: Written Quote negotiation only (homeowner review modal + installer builder modal + admin lead management modal)

## Goals (User Requirements)
1. Homeowner negotiation panel updates instantly when installer counters/revises (no manual refresh/reopen).
2. Add online/offline presence indicator beside the other party’s username, and **only show online when both parties are inside their respective modals simultaneously**.
3. Add negotiation time window control:
   - Default negotiation window: **3 days (72h)** from written quote submission.
   - After 72 hours: negotiation closes (auto-expire), lead status changes to "Negotiation expired", and **both parties get email notifications**.
   - Extension: each party may extend the negotiation by **2 days once**.
   - Admin: allow admin-requested extension; add admin controls UI in Admin Lead Management modal.

## Current State (What Exists)
- Installer UI ([src/components/WrittenQuoteBuilderModal.tsx](src/components/WrittenQuoteBuilderModal.tsx))
  - Has background polling for negotiation quote updates (`setInterval`) and signature diffing to prevent UI flicker.
- Homeowner UI ([src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx](src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx))
  - Fetches written quotes on open and after local actions only.
  - No background refresh mechanism, so installer updates aren’t reflected “instantly”.
- Backend negotiation endpoints
  - `POST /api/written-quotes` create quote with `negotiationStatus = 'PENDING'`.
  - `POST /api/written-quotes/[id]/counter` homeowner counter.
  - `PATCH /api/written-quotes/[id]/revise` installer revise.
  - `POST /api/written-quotes/[id]/agree` done-deal request.
  - Count/turn limits enforced server-side (3 homeowner, 4 installer, 7 total).
- Presence / time-window governance
  - No presence tracking.
  - No negotiation deadline fields.
  - No expiry enforcement or expiry notifications.
- Lead status
  - LeadStatus is Prisma enum without a dedicated "NEGOTIATION_EXPIRED" state (has `EXPIRED`).

## Gaps / Root Causes
- Realtime mismatch
  - Installer modal polls; homeowner modal does not. This explains why homeowner doesn’t see counter/revise updates until refresh/reopen.
- Presence indicator missing
  - Requires backend-tracked last-seen timestamps keyed to written quote + role.
- Negotiation time window missing
  - Requires DB-backed deadline + server-side enforcement.
  - True "auto-expire" requires either a scheduler/cron or regular server calls (polling) that can trigger enforcement.

## Recommended Design (Minimal, Backend-Enforced)
### Realtime homeowner updates
- Add background polling in homeowner modal, mirroring installer modal:
  - Poll `GET /api/written-quotes?leadId=...` on interval while modal open.
  - Use signature diffing to avoid UI blinking.

### Presence indicator
- Add `homeownerModalActiveAt` and `installerModalActiveAt` timestamps on `WrittenQuote`.
- Add a small heartbeat endpoint that updates the caller’s timestamp while their modal is open.
- UI shows “online” only when **both** timestamps are within an “active” threshold window (e.g. last 20s).

### Negotiation time window
- Add `negotiationDeadlineAt` set at quote submission: `createdAt + 72h`.
- Add extension flags:
  - `homeownerExtensionUsed`, `installerExtensionUsed`.
- Add `negotiationExpiredAt` for auditability.
- Enforce deadline server-side on:
  - `GET /api/written-quotes`
  - all negotiation mutation routes (`counter`, `revise`, `agree`, `accept`, `deal-reject`, `reject`, etc.)
- When expired:
  - Set `WrittenQuote.negotiationStatus = 'EXPIRED'`.
  - Update lead status to `EXPIRED` (and show UI label "Negotiation expired").
  - Send email notifications to homeowner + installer via the normalized notification service.

### Admin controls
- Add a new section in Admin Lead Management modal:
  - Show written quotes for the lead (installer, negotiation status, deadline, time remaining).
  - Button: extend negotiation by +2 days (admin override).

## Risks / Notes
- Lead status label requirement
  - Prisma LeadStatus enum lacks a dedicated "NEGOTIATION_EXPIRED" value. Minimal safe implementation uses `LeadStatus.EXPIRED` and renders the label "Negotiation expired" in the written-quote negotiation context.
- Auto-expire scheduling
  - Enforcement is fully backend-truth, but “exactly at 72h” emails require a scheduler. Without a scheduler, expiry triggers the first time the system touches the lead/quotes after the deadline (e.g., modal polling or any API activity).

## Success Criteria
- Homeowner sees installer revise/counter updates without refresh.
- Presence indicator switches to online only when both modals are open.
- Negotiation closes after deadline, blocks further actions, and triggers notifications.
- Each party can extend once (+2 days), admin can extend from admin modal.
