# Written Quote — Countdown + Admin Modal Enhancements (Audit)

Date: December 24, 2025
Status: APPROVED FOR IMPLEMENTATION

## Goal
Implement the requested UI enhancements for the Written Quote negotiation experience:
1) Replace the static “Deadline” timestamp with a live countdown timer in both negotiation modals (homeowner + installer), reusing the existing lead-card countdown component.
2) Enhance Admin “Negotiation Window” to show a full negotiation timeline (both sides) plus a live countdown.
3) Make Admin Lead Management modal full-width and responsive with a 60/40 two-column layout; move the Negotiation Window to the right column.

## Scope Boundaries (Must Preserve)
- No backend logic changes or business rule changes.
- Preserve existing API calls, state variables, handlers, and negotiation enforcement.
- Use existing design system tokens/classes only.

## Current State
### Homeowner modal
- File: `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- The negotiation panel shows “Deadline” as a formatted datetime via `formatDateTime(...)`.

### Installer modal
- File: `src/components/WrittenQuoteBuilderModal.tsx`
- The negotiation panel shows “Deadline” as a formatted datetime via `formatDateTime(...)`.

### Admin modal
- File: `src/components/admin/AdminLeadManagementModal.tsx`
- Modal is constrained to `max-w-6xl`.
- “Negotiation Window” is rendered in the main column and shows deadline as a static formatted datetime.
- No consolidated negotiation timeline is shown; only a small set of negotiation fields (deadline/expired/extension flags).

## Approved Implementation Approach
### Countdown display
- Reuse `src/components/LiveCountdownBar.tsx` (the same component used on lead cards).
- Use the compact inline variant (`LiveCountdownBarCompact`) in the negotiation rows.
- Countdown source: `(writtenQuote as any).negotiationDeadlineAt`.
- Initial days: `3` (72h default window), allowing extensions to still render correctly.

### Admin negotiation timeline
- Render a per-quote timeline derived from existing WrittenQuote fields:
  - SUBMIT (installer) — createdAt/amount
  - COUNTER (homeowner) — homeownerCounterAt/homeownerCounterAmount
  - REVISE (installer) — installerRevisedAt/installerRevisedAmount
  - ACCEPT (role inferred) — agreedAt/agreedAmount/agreedBy vs installerId
- Render via existing shared component `src/components/shared/NegotiationTimeline.tsx`.

### Admin modal layout
- Remove max-width constraint to allow a full-width modal.
- Change the scroll-body layout to a responsive 60/40 split:
  - Left: existing lead management sections
  - Right: Negotiation Window

## Files To Change
- `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- `src/components/WrittenQuoteBuilderModal.tsx`
- `src/components/admin/AdminLeadManagementModal.tsx`

## Validation Checklist
- `npm run lint` (no new warnings from these changes)
- `npx tsc --noEmit`
- `npm run build`

## Risks / Notes
- `LiveCountdownBar` semantics are “expiresAt”; here it is used for negotiation deadlines. This is intentional reuse for consistent UX.
- Admin timeline is derived from existing columns (no separate event table), so it reflects the canonical negotiation timestamps already stored.
