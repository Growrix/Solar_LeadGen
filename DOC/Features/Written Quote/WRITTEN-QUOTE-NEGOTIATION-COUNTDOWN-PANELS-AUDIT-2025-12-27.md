# Written Quote — Negotiation Countdown Panels Audit (2025-12-27)

## Scope
Fix negotiation countdown timer behavior in **Negotiation panels** across **Installer / Homeowner / Admin** for the Written Quote flow.

Out of scope (this audit):
- Lead-card countdown display rules (handled separately)

## Observed Issue
Even when the negotiation becomes **terminal** (e.g. `REJECTED`, `AGREED`, `NEGOTIATION_EXPIRED`), the negotiation panels still displayed a running countdown ("Xd Xh Xm Xs remaining").

This produced inconsistent UX:
- Status showed **Rejected**, but the deadline timer kept counting down.

## Root Cause
Each negotiation panel rendered `LiveCountdownBarCompact` whenever `negotiationDeadlineAt` existed, without gating rendering on terminal negotiation states.

Affected render points:
- Installer: `src/components/WrittenQuoteBuilderModal.tsx`
- Homeowner: `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- Admin: `src/components/admin/AdminLeadManagementModal.tsx`

## Expected Behavior (per requirement)
The countdown should stop (not render) after terminal actions:
- After rejection
- After done-deal acceptance (finalized)
- After negotiation expiry

## Implementation Summary
UI now renders the negotiation countdown only when the negotiation is active.

Countdown is hidden when any of the following are true:
- `negotiationStatus` is `REJECTED`
- `negotiationStatus` is `AGREED`
- `negotiationStatus` is `NEGOTIATION_EXPIRED`
- `negotiationExpiredAt` is set
- `purchasedAt` is set

When hidden, the UI shows a neutral placeholder (`—`).

## Files Changed
- `src/components/WrittenQuoteBuilderModal.tsx`
- `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- `src/components/admin/AdminLeadManagementModal.tsx`

## Notes / Follow-ups
- If we later want a clearer label than `—`, we can swap to a deterministic label (e.g. `Closed`) but the current change is minimal and matches the "stop timer" requirement.
