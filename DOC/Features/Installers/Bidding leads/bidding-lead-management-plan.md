# Bidding Lead Management — End-to-End Plan

Purpose: Design a simple, admin-controlled bidding flow that reuses existing assignment + countdown, and adds just enough UI/API for bids, review, award, and post-award purchase. Flows cover Homeowners, Admin, and Installers.

## Guiding Constraints
- Countdown is admin-controlled (lead-level `expiresAt`).
- Lead assignment flow remains as-is; admin assigns multiple installers.
- Purchase unlock for BIDDING happens only after admin awards a winner.
- Keep UI consistent with Installer Lead Feed SOT; no hardcoded UI, semantic classes only.

## Data & APIs (Minimal Additions)
- New model: `Bid` (per lead + installer)
  - Fields: `id`, `leadId`, `installerId`, `amount`, `notes`, `status` (`PENDING` | `SUBMITTED` | `AWARDED` | `LOST` | `WITHDRAWN`), `submittedAt`, `updatedAt`.
  - Constraint: unique `(leadId, installerId)` for one active bid per installer per lead.
- Installer endpoints:
  - `POST /api/installer/bids` → submit/update bid `{ leadId, amount, notes }` (allowed if lead is BIDDING and countdown active)
  - `GET /api/installer/bids?leadId=...` → fetch own bid
  - `DELETE /api/installer/bids/:id` → withdraw
- Admin endpoints:
  - `GET /api/admin/leads/[id]/bids` → list bids
  - `POST /api/admin/leads/[id]/award` → `{ installerId }` marks winner, sets other bids to `LOST`, enables purchase for winner
- Purchase gating:
  - Update existing purchase route to allow purchase for BIDDING only if installer is the awarded installer.

## Role Flows

### Homeowner
- Creates lead with quoteType = `BIDDING` (existing `createLead`).
- Receives notifications when bids are submitted: status becomes “Responded by Installer”.
- After award, optional message indicating an installer has been selected.
- No edits after award/purchase per rules.

### Admin
- Assigns lead to multiple installers (existing assignment).
- Sets/updates countdown (existing timer functions on lead `expiresAt`).
- Reviews bids in Admin Lead Management modal (new “Bids” section): table of installers + amount + notes + submittedAt + countdown remaining.
- Awards winner; triggers notifications and allows post-award purchase only for winner.

### Installer
- Sees BIDDING leads in Installer Lead Feed (existing type mapping).
- Submits bid via a modal: amount + notes; can update while countdown active.
- Cannot unlock contact until awarded; after award, shows “Purchase to Unlock” using existing purchase flow.
- Purchased BIDDING leads appear under Purchased → Bidding tab with full contact details.

## UI Additions (Semantic-Only)
- InstallerLeadFeed (BIDDING): add “Submit Bid” modal (amount, notes) and countdown bar; hide contact unlock until awarded.
- AdminLeadManagementModal: add “Bids” tab/table + “Award” action button.
- Purchased Leads page: ensure Bidding tab exists and uses the same SOT card/modal.

## Notifications & Audit
- Notifications: `NEW_BID` (admin/homeowner), `BID_AWARDED` (winner), `BID_LOST` (others).
- Audit logs: bid submitted/updated/withdrawn, award, purchase.

## Testing Gates (Stop-on-Fail)
1. Installer
- Submit bid within countdown → appears in admin bid list.
- Attempt to purchase pre-award → blocked.
- After award → purchase succeeds → contact unlocked → card moves to Purchased → Bidding.
2. Admin
- Countdown set/reset works; window closes → bids disabled.
- Award action sets statuses correctly (one AWARDED, others LOST) and enables only winner to purchase.
3. Homeowner
- Status flips to “Responded by Installer” when any bid submitted.
- Notifications arrive on bid submitted and award.

## Implementation Order
1. Backend: Bid model + installer/admin bid endpoints + purchase gating for BIDDING.
2. Admin UI: Bids table + Award action in `AdminLeadManagementModal`.
3. Installer UI: Submit Bid modal in `InstallerLeadFeed` for BIDDING.
4. Purchased: Ensure Bidding tab shows awarded/purchased leads with unlocked contact.
5. Notifications + Audit: wire events.

## Acceptance Criteria
- Admin can assign, set countdown, see bids, and award one installer.
- Only the awarded installer can purchase; purchase unlocks contact and moves lead to Purchased → Bidding.
- Homeowner sees “Responded by Installer” and receives notifications.
- All actions audited; UI uses semantic classes; no regressions to CALL_VISIT/WRITTEN flows.
