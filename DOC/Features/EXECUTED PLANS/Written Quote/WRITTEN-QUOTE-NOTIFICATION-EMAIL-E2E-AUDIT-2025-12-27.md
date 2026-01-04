# Written Quote — Notification & Email System Enhancement (E2E Audit)

Date: 2025-12-27
Status: IN PROGRESS
Scope: Written Quote flow notifications (in-app + realtime via Pusher) and email delivery policy.

## Goals (Execution-Grade)
- Written Quote notifications must not display bid-related copy/tags.
- Realtime push notifications must render with valid timestamps (no “Invalid Date” until refresh).
- Emails should be sent only for major milestones (Written Quote flow), while all actions still generate in-app notifications.

## Observed Issues
1. **Realtime notifications show “Invalid Date”** until the page is refreshed.
2. **Written Quote notifications show Bid copy/labeling** due to bid-related `messageKey` usage.
3. **Emails fire too broadly** for Written Quote actions.

## Root Causes
### A) Realtime payload shape mismatch
- UI expects a `createdAt: string` (ISO date string) for relative time rendering.
- Server-side realtime event payload previously did not reliably include `createdAt`, and `timestamp` could be non-string.

### B) Incorrect `messageKey` usage in Written Quote endpoints
- Multiple Written Quote endpoints reused `homeowner.request.received`, `installer.bid.received`, and `admin.bid.*` keys.
- UI type labeling and copy are driven by `messageKey` and the centralized message catalog.

### C) Email policy was type-based only
- Existing `shouldSendEmail` gating used `NotificationType`, which is not sufficiently specific for Written Quote milestones.
- `NotificationType` enum currently lacks written-quote-specific values; gating must use `messageKey` to avoid schema changes.

## Current Canonical Model
- Notification creation: `src/lib/notifications/notification-service.ts`
- Copy source: `src/lib/notifications/message-catalog.ts`
- Routing: `src/lib/notifications/route-resolver.ts`
- Realtime transport: Pusher channel `user-{userId}-notifications`, event `new-notification`
- UI rendering: `src/components/NotificationDropdown.tsx`

## E2E Action Inventory (Written Quote)

### 1) Quote Submitted (Installer → Homeowner + Admin)
- Endpoint: `POST src/app/api/written-quotes/route.ts`
- Recipients:
  - Homeowner: `homeowner.written_quote.submitted` (in-app + realtime)
  - Admins: `admin.written_quote.submitted` (in-app + realtime)
- Email:
  - Allowed (major milestone) for homeowner + admin.

### 2) Counter Offer (Homeowner → Installer)
- Endpoint: `POST src/app/api/written-quotes/[id]/counter/route.ts`
- Recipient:
  - Installer: `installer.written_quote.counter_received`
- Email:
  - Not sent (non-major, but in-app + realtime required).

### 3) Quote Revised (Installer → Homeowner)
- Endpoint: `POST src/app/api/written-quotes/[id]/revise/route.ts`
- Recipient:
  - Homeowner: `homeowner.written_quote.revised`
- Email:
  - Not sent (non-major).

### 4) Done-Deal Requested (One party → Other party)
- Endpoint: `POST src/app/api/written-quotes/[id]/agree/route.ts`
- Recipient:
  - If installer requested: homeowner gets `homeowner.written_quote.done_deal_requested`
  - If homeowner requested: installer gets `installer.written_quote.done_deal_requested`
- Email:
  - Not sent (treated as non-major to reduce email volume).

### 5) Done-Deal Accepted (Other party → Proposer)
- Endpoint: `POST src/app/api/written-quotes/[id]/accept/route.ts`
- Recipient:
  - If installer accepted: homeowner gets `homeowner.written_quote.done_deal_accepted`
  - If homeowner accepted: installer gets `installer.written_quote.done_deal_accepted`
- Email:
  - Allowed (major milestone).

### 6) Done-Deal Rejected (Other party → Proposer)
- Endpoint: `POST src/app/api/written-quotes/[id]/deal-reject/route.ts`
- Recipient:
  - If installer rejected: homeowner gets `homeowner.written_quote.done_deal_rejected`
  - If homeowner rejected: installer gets `installer.written_quote.done_deal_rejected`
- Email:
  - Not sent (kept non-major).

### 7) Purchase Completed (Installer purchase → Homeowner + Installer + Admin)
- Endpoint: `POST src/app/api/written-quotes/[id]/purchase/route.ts`
- Recipients:
  - Homeowner: `homeowner.written_quote.purchased`
  - Installer: `installer.written_quote.purchased`
  - Admins: `admin.written_quote.purchased`
- Email:
  - Allowed (major milestone).

### 8) Negotiation Expired (System)
- Existing behavior:
  - Uses `NotificationType.SYSTEM` and written-quote specific keys.
- Recipients:
  - Homeowner: `homeowner.written_quote.negotiation_expired`
  - Installer: `installer.written_quote.negotiation_expired`
- Email:
  - Allowed (critical closure event).

### 9) Negotiation Rejected (Terminal)
- Keys in catalog:
  - `homeowner.written_quote.rejected`
  - `installer.written_quote.rejected`
- NOTE:
  - Ensure any reject endpoints (if present) use these keys.

## Realtime Payload Contract
- Realtime event payload MUST include:
  - `createdAt: string` (ISO)
  - `id`, `type`, `title`, `message`
  - `messageKey`, `routeKey`, `routeParams` (canonical navigation)
- Backward compatibility:
  - `timestamp` is retained as ISO string.

## Email Policy (Written Quote)
Emails are gated by `messageKey` allowlist:
- Submitted
- Done-deal accepted
- Purchased
- Rejected
- Negotiation expired

All other Written Quote actions still produce in-app + realtime notifications.

## Remaining Verification Checklist
- Confirm dropdown renders realtime items with correct relative time (no “Invalid Date”).
- Confirm Written Quote notifications display as “Quote” (not “Bid”) and copy matches the written-quote catalog.
- Confirm counter/revise/done-deal request do not send emails.
- Confirm major milestone emails still send.
