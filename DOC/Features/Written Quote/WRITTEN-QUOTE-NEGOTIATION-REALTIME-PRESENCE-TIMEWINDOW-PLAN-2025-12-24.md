# Written Quote Negotiation — Realtime, Presence, Time Window (Master Plan)

Date: 2025-12-24

## Implementation Plan (High Level)
1. Schema: add negotiation deadline + presence timestamps + extension flags.
2. Backend:
   - Set deadline on quote submission.
   - Enforce expiry on reads and mutations.
   - Add endpoints for presence heartbeat and extensions.
   - Send email notifications on expiry.
3. Frontend:
   - Homeowner modal: background refresh (poll) + presence heartbeat + presence badge + time remaining + extend button.
   - Installer modal: presence heartbeat + presence badge + time remaining + extend button.
4. Admin:
   - Add negotiation controls section to Admin Lead Management modal (view deadline, extend by 2 days).
5. Validation: `npx tsc --noEmit`, `npm run build`.

## Data Model (Prisma)
Add to `WrittenQuote`:
- `negotiationDeadlineAt DateTime?`
- `negotiationExpiredAt DateTime?`
- `homeownerModalActiveAt DateTime?`
- `installerModalActiveAt DateTime?`
- `homeownerExtensionUsed Boolean @default(false)`
- `installerExtensionUsed Boolean @default(false)`

## Backend API Surface
### Presence
- `POST /api/written-quotes/[id]/presence`
  - Auth: homeowner or installer
  - Behavior: set role-specific `*ModalActiveAt = now`

### Extensions
- `POST /api/written-quotes/[id]/extend`
  - Auth: homeowner or installer
  - Behavior: if party has not used extension, extend `negotiationDeadlineAt += 2 days` and mark `*ExtensionUsed = true`.

- `POST /api/admin/written-quotes/[id]/extend`
  - Auth: admin
  - Behavior: extend `negotiationDeadlineAt += 2 days` (admin override).

### Expiry enforcement
- Shared helper invoked by:
  - `GET /api/written-quotes?leadId=...`
  - negotiation mutation routes (`counter`, `revise`, `agree`, `accept`, `deal-reject`, `reject`, `purchase`)
- When expired:
  - Update `WrittenQuote.negotiationStatus = 'EXPIRED'` and `negotiationExpiredAt = now`.
  - Update lead status to `EXPIRED` when transition is valid.
  - Send email notifications to both homeowner + installer.

## Notifications
- Use normalized notification service (`createNotification`) with `NotificationType.SYSTEM` so email is sent.
- Add new message keys:
  - `homeowner.written_quote.negotiation_expired`
  - `installer.written_quote.negotiation_expired`
  - `admin.written_quote.extension_requested` (if admin request flow is needed beyond direct admin extend)

## UI Changes
### Homeowner modal
- Add background refresh interval while open (like installer modal) with signature diffing.
- Display presence indicator near installer name.
- Display time remaining to deadline.
- Button to extend by 2 days once.

### Installer modal
- Display presence indicator near homeowner label.
- Display time remaining to deadline.
- Button to extend by 2 days once.

### Admin Lead Management modal
- Add section "Written Quote Negotiation" when lead has written quotes.
- Fetch written quotes for lead.
- Show each quote’s negotiation status and deadline.
- Provide "Extend by 2 days" action.

## Auto-expire Scheduling Note
- Exact-time expiry emails require an external scheduler.
- Minimal implementation enforces expiry whenever the system reads/mutates written quotes (modal polling covers the common active case).
